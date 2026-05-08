# System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                        │
│                         http://localhost:5173                            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────────┐       ┌──────────────────────┐
        │   React Query v5      │       │   Socket.io Client   │
        │   - Query Cache       │       │   - Real-time sync   │
        │   - Mutation Queue    │       │   - Event listeners  │
        │   - Devtools          │       │                      │
        └───────────┬───────────┘       └──────────┬───────────┘
                    │                               │
                    ▼                               │
        ┌───────────────────────┐                  │
        │   Axios Client        │                  │
        │   - Token injection   │                  │
        │   - Auto refresh      │                  │
        │   - Request queue     │                  │
        └───────────┬───────────┘                  │
                    │                               │
                    │ HTTP/REST                     │ WebSocket
                    │                               │
┌───────────────────┴───────────────────────────────┴───────────────────┐
│                                                                         │
│                      BACKEND (Express + Node.js)                       │
│                        http://localhost:4000                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                         Middleware Layer                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │  │
│  │  │  CORS    │  │  Helmet  │  │  Morgan  │  │  Cookie  │       │  │
│  │  │          │  │          │  │          │  │  Parser  │       │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                  │                                     │
│                                  ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                         Routes Layer                             │  │
│  │  /api/auth  /api/workspaces  /api/projects  /api/tasks  /api/   │  │
│  │                          notifications                            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                  │                                     │
│                                  ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      Auth Middleware                             │  │
│  │  - Verify JWT token                                              │  │
│  │  - Extract user from token                                       │  │
│  │  - Attach to request                                             │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                  │                                     │
│                                  ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      Controllers Layer                           │  │
│  │  - Parse request                                                 │  │
│  │  - Call service                                                  │  │
│  │  - Format response                                               │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                  │                                     │
│                                  ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                       Services Layer                             │  │
│  │  - Business logic                                                │  │
│  │  - Authorization checks                                          │  │
│  │  - Data transformation                                           │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                  │                                     │
│                                  ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                       Prisma Client                              │  │
│  │  - Type-safe queries                                             │  │
│  │  - Connection pooling                                            │  │
│  │  - Query optimization                                            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                  │                                     │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │   PostgreSQL Database        │
                    │   (Docker Container)         │
                    │   localhost:5432             │
                    │                              │
                    │  Tables:                     │
                    │  - users                     │
                    │  - workspaces                │
                    │  - workspace_members         │
                    │  - projects                  │
                    │  - tasks                     │
                    │  - labels                    │
                    │  - task_labels               │
                    │  - comments                  │
                    │  - activities                │
                    │  - notifications             │
                    │  - refresh_tokens            │
                    └──────────────────────────────┘
```

---

## Data Flow: Create Task (Optimistic Update)

```
┌──────────────┐
│   User       │
│   clicks     │
│  "Create"    │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  1. useMutation.mutate({ title: "New Task" })                │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  2. onMutate (runs immediately)                              │
│     - Cancel in-flight queries                               │
│     - Snapshot current cache                                 │
│     - Add temp task to cache                                 │
│     - UI updates instantly ⚡                                │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│  3. mutationFn (API call)                                    │
│     POST /api/tasks                                          │
│     { projectId, title }                                     │
└──────┬───────────────────────────────────────────────────────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
   ┌────────┐      ┌─────────┐      ┌─────────┐
   │Success │      │ Error   │      │Network  │
   │        │      │         │      │ Error   │
   └───┬────┘      └────┬────┘      └────┬────┘
       │                │                 │
       ▼                ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ onSuccess    │  │ onError      │  │ onError      │
│ (optional)   │  │ - Rollback   │  │ - Rollback   │
└──────┬───────┘  │   cache      │  │   cache      │
       │          │ - Show error │  │ - Show error │
       │          └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  onSettled           │
              │  - Invalidate cache  │
              │  - Refetch from API  │
              │  - Sync with server  │
              └──────────────────────┘
```

---

## Authentication Flow

```
┌─────────────┐
│   Login     │
│   Form      │
└──────┬──────┘
       │
       ▼
POST /api/auth/login
{ email, password }
       │
       ▼
┌──────────────────────────────────────┐
│  Backend                             │
│  1. Find user by email               │
│  2. Compare password hash            │
│  3. Generate access token (15min)   │
│  4. Generate refresh token (7d)     │
│  5. Store refresh token in DB       │
│  6. Set httpOnly cookie              │
│  7. Return access token + user      │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  Frontend                            │
│  1. Store access token in localStorage │
│  2. Cache user in React Query        │
│  3. Navigate to dashboard            │
└──────────────────────────────────────┘
```

---

## Token Refresh Flow

```
┌─────────────┐
│  API Call   │
│  with token │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Axios Request   │
│  + Authorization │
│    Bearer token  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Backend         │
│  Returns 401     │
└──────┬───────────┘
       │
       ▼
┌────────────────────────────────────────┐
│  Axios Interceptor                     │
│  1. Detect 401                         │
│  2. Queue this request                 │
│  3. Check if refresh in progress       │
│     - Yes: Wait in queue               │
│     - No: Start refresh                │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│  POST /api/auth/refresh                │
│  (sends httpOnly cookie automatically) │
└────────┬───────────────────────────────┘
         │
         ├──────────────┬─────────────────┐
         │              │                 │
         ▼              ▼                 ▼
    ┌────────┐    ┌─────────┐      ┌──────────┐
    │Success │    │ Error   │      │ Network  │
    └───┬────┘    └────┬────┘      │  Error   │
        │              │            └────┬─────┘
        ▼              ▼                 │
┌───────────────┐  ┌──────────────────┐ │
│ New access    │  │ Clear tokens     │ │
│ token         │  │ Redirect /login  │◄┘
└───┬───────────┘  └──────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│  1. Update localStorage               │
│  2. Process queued requests           │
│  3. Retry original request            │
└───────────────────────────────────────┘
```

---

## React Query Cache Structure

```
QueryClient
│
├─ ['auth', 'me']
│  └─ { id, email, name, avatarUrl }
│
├─ ['workspaces']
│  └─ [{ id, name, slug, members: [...] }, ...]
│
├─ ['workspaces', 'ws-123']
│  └─ { id, name, slug, members: [...], projects: [...] }
│
├─ ['projects', 'ws-123']
│  └─ [{ id, name, key, _count: { tasks: 5 } }, ...]
│
├─ ['projects', 'detail', 'proj-456']
│  └─ { id, name, key, tasks: [...], createdBy: {...} }
│
├─ ['tasks', 'proj-456']
│  └─ [{ id, title, status, assignee: {...} }, ...]
│
├─ ['tasks', 'detail', 'task-789']
│  └─ { id, title, description, comments: [...], activities: [...] }
│
└─ ['notifications']
   └─ [{ id, title, message, read: false }, ...]
```

---

## File Structure Flow

```
User Action
    │
    ▼
Feature Component (e.g., ProjectsPage.tsx)
    │
    ├─ Uses custom hook
    │
    ▼
Custom Hook (e.g., useProjects.ts)
    │
    ├─ Uses query key from factory
    ├─ Calls API function
    │
    ▼
API Function (e.g., project.api.ts)
    │
    ├─ Uses Axios client
    │
    ▼
Axios Client (client.ts)
    │
    ├─ Adds auth header
    ├─ Handles token refresh
    │
    ▼
Backend Route (project.routes.ts)
    │
    ├─ Auth middleware
    │
    ▼
Controller (project.controller.ts)
    │
    ├─ Parse request
    ├─ Call service
    │
    ▼
Service (project.service.ts)
    │
    ├─ Business logic
    ├─ Authorization
    │
    ▼
Prisma Client
    │
    ▼
PostgreSQL Database
```

---

## Deployment Architecture (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                         CDN (CloudFlare)                     │
│                    Static Assets (JS, CSS)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vercel/Netlify)                 │
│                    - React build artifacts                   │
│                    - Environment variables                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Load Balancer (AWS ALB)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
        ┌───────────────────┐  ┌───────────────────┐
        │  Backend Instance │  │  Backend Instance │
        │  (Railway/Render) │  │  (Railway/Render) │
        └─────────┬─────────┘  └─────────┬─────────┘
                  │                      │
                  └──────────┬───────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   PostgreSQL (Supabase/RDS)  │
              │   - Primary + Read Replicas  │
              │   - Automated backups        │
              └──────────────────────────────┘
```
