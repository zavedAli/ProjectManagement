# Quick Reference Card

## 🚀 Start Project (3 Commands)

```bash
# Terminal 1: Database
docker-compose up -d

# Terminal 2: Backend
cd apps\api && npm run dev

# Terminal 3: Frontend
cd apps\web && npm run dev
```

Login: `admin@example.com` / `password123`

---

## 📦 Install Dependencies

```bash
# Backend
cd apps\api
npm install

# Frontend
cd apps\web
npm install
```

---

## 🗄️ Database Commands

```bash
cd apps\api

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database
npx tsx prisma\seed.ts

# Open Prisma Studio
npx prisma studio

# Create migration
npx prisma migrate dev --name <name>

# Reset database
npx prisma migrate reset
```

---

## 🔑 React Query Patterns

### Basic Query
```typescript
useQuery({
  queryKey: ['projects', workspaceId],
  queryFn: ({ signal }) => getProjects(workspaceId, signal),
  enabled: !!workspaceId,
  staleTime: 1000 * 60 * 2,
})
```

### Optimistic Mutation
```typescript
useMutation({
  mutationFn: createTask,
  onMutate: async (newTask) => {
    await qc.cancelQueries({ queryKey: ['tasks'] });
    const previous = qc.getQueryData(['tasks']);
    qc.setQueryData(['tasks'], (old) => [...old, newTask]);
    return { previous };
  },
  onError: (_err, _vars, context) => {
    qc.setQueryData(['tasks'], context.previous);
  },
  onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
})
```

### Prefetch
```typescript
const qc = useQueryClient();
qc.prefetchQuery({
  queryKey: ['project', id],
  queryFn: () => getProject(id),
});
```

### Polling
```typescript
useQuery({
  queryKey: ['notifications'],
  queryFn: getNotifications,
  refetchInterval: 1000 * 30,
  refetchIntervalInBackground: false,
})
```

### Manual Cache Update
```typescript
qc.setQueryData(['notifications'], (old) =>
  old.map((n) => (n.id === id ? { ...n, read: true } : n))
);
```

---

## 🔐 Auth Flow

### Login
```typescript
const login = useLogin();
login.mutate({ email, password });
// Stores accessToken in localStorage
// Sets refreshToken in httpOnly cookie
```

### Logout
```typescript
const logout = useLogout();
logout.mutate();
// Clears localStorage
// Clears cookies
// Clears React Query cache
```

### Protected Route
```typescript
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Dashboard />} />
</Route>
```

---

## 🌐 API Endpoints

### Auth
- `POST /api/auth/register` - { email, password, name }
- `POST /api/auth/login` - { email, password }
- `POST /api/auth/refresh` - (uses cookie)
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Projects
- `GET /api/projects?workspaceId=:id`
- `GET /api/projects/:id`
- `POST /api/projects` - { workspaceId, name, key }
- `PATCH /api/projects/:id` - { name?, description?, archived? }
- `DELETE /api/projects/:id`

### Tasks
- `GET /api/tasks?projectId=:id`
- `GET /api/tasks/:id`
- `POST /api/tasks` - { projectId, title, status?, priority? }
- `PATCH /api/tasks/:id` - { title?, status?, assigneeId? }
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/comments` - { content }

---

## 🐛 Common Fixes

### Prisma Error
```bash
cd apps\api
npx prisma generate
```

### Port in Use
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

### CORS Error
Check `apps/api/.env` - CORS_ORIGIN must match frontend URL

### 401 Errors
- Check localStorage has accessToken
- Verify JWT secrets in .env

### Database Connection Failed
```bash
docker ps
docker-compose restart
```

---

## 📁 File Locations

### Add New API Endpoint
1. `apps/api/src/services/<name>.service.ts` - Business logic
2. `apps/api/src/controllers/<name>.controller.ts` - Request handlers
3. `apps/api/src/routes/<name>.routes.ts` - Route definitions
4. `apps/api/src/index.ts` - Register routes

### Add New React Query Hook
1. `apps/web/src/api/<name>.api.ts` - API functions
2. `apps/web/src/queryKeys/index.ts` - Add query keys
3. `apps/web/src/hooks/use<Name>.ts` - Custom hooks
4. `apps/web/src/features/<name>/<Name>Page.tsx` - Use hooks

### Add New Database Table
1. `apps/api/prisma/schema.prisma` - Add model
2. `npx prisma db push` - Update database
3. `npx prisma generate` - Regenerate client
4. Update seed script if needed

---

## 🎯 Key Files

### Backend
- `apps/api/src/index.ts` - Express server
- `apps/api/src/lib/jwt.ts` - Token generation
- `apps/api/src/middleware/auth.middleware.ts` - Auth guard
- `apps/api/prisma/schema.prisma` - Database schema

### Frontend
- `apps/web/src/App.tsx` - Router setup
- `apps/web/src/lib/queryClient.ts` - React Query config
- `apps/web/src/api/client.ts` - Axios + token refresh
- `apps/web/src/queryKeys/index.ts` - Query key factory

---

## 🔧 Environment Variables

### Backend (.env)
```
PORT=4000
DATABASE_URL="postgresql://pmuser:pmpass@localhost:5432/project_management"
JWT_ACCESS_SECRET=<random-string>
JWT_REFRESH_SECRET=<different-random-string>
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:4000/api
VITE_WS_URL=http://localhost:4000
```

---

## 📊 React Query Devtools

- Bottom-left icon in browser
- Shows all queries and their states
- Inspect cache contents
- Manually trigger refetch
- View query timelines

---

## 🎓 Learning Path

1. **Start Here**: Read `INSTALLATION.md`
2. **Understand Architecture**: Read `ARCHITECTURE.md`
3. **Deep Dive React Query**: Read `REACT_QUERY_PATTERNS.md`
4. **Explore Code**: Start with `apps/web/src/hooks/useProjects.ts`
5. **Experiment**: Modify optimistic updates, change staleTime
6. **Build Feature**: Add new entity (e.g., Teams)

---

## 🚀 Production Checklist

- [ ] Change JWT secrets to strong random strings
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Add rate limiting
- [ ] Set up error tracking (Sentry)
- [ ] Configure database backups
- [ ] Add monitoring (Datadog/New Relic)
- [ ] Optimize bundle size
- [ ] Add CDN for static assets
- [ ] Set up CI/CD pipeline

---

## 📚 Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Router Docs](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
