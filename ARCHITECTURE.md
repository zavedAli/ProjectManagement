# Project Architecture & Implementation Guide

## Overview

Production-grade SaaS platform demonstrating advanced TanStack Query v5 patterns, JWT authentication, real-time features, and scalable architecture.

---

## Tech Stack

### Frontend
- **React 18** - UI library with concurrent features
- **TypeScript** - Type safety
- **Vite** - Fast dev server and build tool
- **TanStack Query v5** - Data fetching, caching, synchronization
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Socket.io Client** - Real-time WebSocket communication
- **Tailwind CSS** - Utility-first styling

### Backend
- **Node.js + Express** - REST API server
- **TypeScript** - Type-safe backend
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Relational database
- **JWT** - Stateless authentication
- **Socket.io** - WebSocket server
- **Bcrypt** - Password hashing
- **Zod** - Runtime validation

---

## Architecture Patterns

### 1. Feature-Based Structure

```
apps/web/src/
├── features/          # Feature modules (auth, projects, tasks)
├── hooks/             # React Query custom hooks
├── api/               # API client functions
├── queryKeys/         # Query key factory
├── components/        # Reusable UI components
├── lib/               # Utilities (queryClient, socket)
└── types/             # TypeScript definitions
```

**Why**: Scales better than layer-based. Easy to find related code.

### 2. API Layer Separation

```
Component → Custom Hook → API Function → Axios Client → Backend
```

**Benefits**:
- Components don't know about HTTP
- Easy to mock for testing
- Centralized error handling
- Request/response transformation in one place

### 3. Query Key Factory Pattern

Centralized, hierarchical query keys prevent typos and enable precise cache invalidation.

```typescript
queryKeys.tasks.all(projectId)     // Invalidate all tasks in project
queryKeys.tasks.detail(id)         // Invalidate single task
```

### 4. Optimistic Updates

All mutations use optimistic updates for instant UX:
1. Cancel in-flight queries
2. Snapshot current cache
3. Update cache optimistically
4. Rollback on error
5. Refetch on settled

### 5. Token Refresh Flow

Axios interceptor handles 401 responses:
1. Detect 401
2. Queue subsequent requests
3. Refresh token (single call)
4. Replay queued requests
5. Redirect to login if refresh fails

---

## Database Schema

### Core Entities

**User** → **WorkspaceMember** ← **Workspace** → **Project** → **Task**

- Users belong to multiple workspaces (many-to-many via WorkspaceMember)
- Workspaces contain projects
- Projects contain tasks
- Tasks have assignees, labels, comments, activities

### Key Relationships

- `User.workspaceMembers` - Workspaces user belongs to
- `Workspace.members` - Members with roles (owner/admin/member)
- `Project.tasks` - Tasks in project
- `Task.assignee` - User assigned to task
- `Task.comments` - Comments on task
- `Task.activities` - Audit trail

---

## Authentication Flow

### Registration
1. Client: POST `/api/auth/register` with email, password, name
2. Server: Hash password, create user, generate tokens
3. Server: Set httpOnly refresh token cookie
4. Server: Return access token + user
5. Client: Store access token in localStorage
6. Client: Set user in React Query cache
7. Client: Navigate to dashboard

### Login
1. Client: POST `/api/auth/login` with credentials
2. Server: Verify password, generate tokens
3. Server: Set httpOnly refresh token cookie
4. Server: Return access token + user
5. Client: Store access token, cache user, navigate

### Token Refresh
1. Client: Detect 401 response
2. Client: POST `/api/auth/refresh` (sends cookie automatically)
3. Server: Verify refresh token, generate new access token
4. Server: Return new access token
5. Client: Update localStorage, retry original request

### Logout
1. Client: POST `/api/auth/logout`
2. Server: Delete refresh token from database
3. Server: Clear cookie
4. Client: Clear localStorage, clear React Query cache, navigate to login

---

## React Query Patterns Used

### 1. Basic Query
```typescript
useQuery({
  queryKey: queryKeys.projects.all(workspaceId),
  queryFn: ({ signal }) => projectApi.getAll(workspaceId, signal),
  enabled: !!workspaceId,
  staleTime: 1000 * 60 * 2,
})
```

### 2. Mutation with Optimistic Update
```typescript
useMutation({
  mutationFn: createProject,
  onMutate: async (newProject) => {
    await qc.cancelQueries({ queryKey: ... });
    const previous = qc.getQueryData(...);
    qc.setQueryData(..., (old) => [newProject, ...old]);
    return { previous };
  },
  onError: (_err, _vars, context) => {
    qc.setQueryData(..., context.previous);
  },
  onSettled: () => qc.invalidateQueries(...),
})
```

### 3. Prefetching
```typescript
const prefetchProject = usePrefetchProject();
<Link onMouseEnter={() => prefetchProject(id)}>
```

### 4. Polling
```typescript
useQuery({
  queryKey: queryKeys.notifications.all(),
  queryFn: getNotifications,
  refetchInterval: 1000 * 30,
  refetchIntervalInBackground: false,
})
```

### 5. Manual Cache Update
```typescript
qc.setQueryData<Notification[]>(queryKeys.notifications.all(), (old = []) =>
  old.map((n) => (n.id === id ? { ...n, read: true } : n))
);
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `GET /api/workspaces/:id` - Get workspace details
- `POST /api/workspaces` - Create workspace
- `PATCH /api/workspaces/:id` - Update workspace

### Projects
- `GET /api/projects?workspaceId=:id` - List projects
- `GET /api/projects/:id` - Get project with tasks
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks?projectId=:id` - List tasks
- `GET /api/tasks/:id` - Get task with comments/activities
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read

---

## WebSocket Events (Planned)

### Client → Server
- `join:workspace` - Join workspace room
- `leave:workspace` - Leave workspace room

### Server → Client
- `task:created` - New task created
- `task:updated` - Task updated
- `task:deleted` - Task deleted
- `notification:new` - New notification

---

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Refresh tokens stored in httpOnly cookies (XSS protection)
- Access tokens in localStorage (needed for API calls)

### Authorization
- All protected routes check JWT in Authorization header
- Workspace membership verified for all operations
- Role-based access control (owner/admin/member)
- Users can only access their own workspaces/projects/tasks

### API Security
- Helmet.js for security headers
- CORS configured for specific origin
- Rate limiting (recommended for production)
- Input validation with Zod schemas

---

## Performance Optimizations

### Frontend
1. **Query deduplication** - React Query prevents duplicate requests
2. **Stale-while-revalidate** - Show cached data, refetch in background
3. **Prefetching** - Preload data on hover
4. **Optimistic updates** - Instant UI feedback
5. **Request cancellation** - AbortSignal prevents memory leaks
6. **Placeholder data** - Prevent layout shift during refetch

### Backend
1. **Database indexes** - On foreign keys and frequently queried fields
2. **Prisma query optimization** - Select only needed fields
3. **Connection pooling** - Prisma handles automatically
4. **Eager loading** - Include relations in single query

---

## Scaling Considerations

### Horizontal Scaling
- Stateless JWT auth enables multiple API instances
- WebSocket requires sticky sessions or Redis adapter
- Database connection pooling per instance

### Caching Strategy
- React Query handles client-side caching
- Add Redis for server-side caching (user sessions, hot data)
- CDN for static assets

### Database
- Read replicas for read-heavy workloads
- Partition large tables (tasks, activities)
- Archive old data

---

## Testing Strategy (Recommended)

### Frontend
- **Unit tests**: Custom hooks with `@testing-library/react-hooks`
- **Integration tests**: Components with `@testing-library/react`
- **E2E tests**: Critical flows with Playwright

### Backend
- **Unit tests**: Services and utilities
- **Integration tests**: API endpoints with supertest
- **Database tests**: Use test database, reset between tests

---

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd apps/web
npm run build
# Deploy dist/ folder
```

Environment variables:
- `VITE_API_URL` - Production API URL
- `VITE_WS_URL` - Production WebSocket URL

### Backend (Railway/Render/AWS)
```bash
cd apps/api
npm run build
npm start
```

Environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_ACCESS_SECRET` - Strong random string
- `JWT_REFRESH_SECRET` - Different strong random string
- `CORS_ORIGIN` - Frontend URL

### Database (Supabase/Railway/AWS RDS)
```bash
npx prisma migrate deploy
```

---

## Monitoring & Observability

### Recommended Tools
- **Sentry** - Error tracking (frontend + backend)
- **LogRocket** - Session replay (frontend)
- **Datadog/New Relic** - APM (backend)
- **Prisma Pulse** - Database change streams

### Metrics to Track
- API response times
- Query cache hit rate
- Failed authentication attempts
- WebSocket connection count
- Database query performance

---

## Future Enhancements

### Phase 1 (Current)
- ✅ Authentication with JWT
- ✅ Workspaces, Projects, Tasks CRUD
- ✅ Optimistic updates
- ✅ Prefetching
- ✅ Polling for notifications

### Phase 2
- [ ] Infinite scroll with `useInfiniteQuery`
- [ ] Drag-and-drop Kanban with `@dnd-kit`
- [ ] File uploads (avatars, attachments)
- [ ] Rich text editor for task descriptions
- [ ] Advanced search with debouncing

### Phase 3
- [ ] WebSocket real-time sync
- [ ] Offline support with `networkMode: 'offlineFirst'`
- [ ] Cross-tab sync with BroadcastChannel
- [ ] Suspense boundaries with `useSuspenseQuery`
- [ ] Virtual scrolling for large lists

### Phase 4
- [ ] Email notifications
- [ ] Slack/Discord integrations
- [ ] Time tracking
- [ ] Gantt charts
- [ ] Reports and analytics

---

## Common Issues & Solutions

### Issue: Prisma client not found
```bash
cd apps/api
npx prisma generate
```

### Issue: CORS errors
Check `apps/api/.env` CORS_ORIGIN matches frontend URL

### Issue: 401 on all requests
Check access token in localStorage, verify JWT secrets match

### Issue: WebSocket not connecting
Verify VITE_WS_URL in `apps/web/.env`

### Issue: Database connection failed
Check PostgreSQL is running: `docker ps`

---

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Router Docs](https://reactrouter.com)
- [Socket.io Docs](https://socket.io/docs)

---

## License

MIT
