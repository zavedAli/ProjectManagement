# Project Management Platform

🚀 **Production-grade SaaS platform demonstrating advanced TanStack Query v5 patterns**

A full-stack project management application inspired by Jira/Trello/Linear, built to teach and demonstrate real-world React Query v5 usage, JWT authentication, WebSocket integration, and scalable architecture.

---

## 🎯 Purpose

This codebase is designed to:
1. **Teach advanced TanStack Query v5 patterns** - Optimistic updates, prefetching, polling, cache management
2. **Demonstrate production-ready architecture** - Feature-based structure, type safety, error handling
3. **Show real-world authentication flows** - JWT + refresh tokens, token rotation, auto re-authentication
4. **Provide a scalable foundation** - Monorepo structure, shared types, modular design

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + **TypeScript** - Modern UI with type safety
- **Vite** - Lightning-fast dev server and build tool
- **TanStack Query v5** - Powerful data fetching and caching (the star of this project)
- **React Router v6** - Client-side routing with protected routes
- **Axios** - HTTP client with interceptors for token refresh
- **Socket.io Client** - Real-time WebSocket communication
- **Tailwind CSS** - Utility-first styling

### Backend
- **Node.js** + **Express** - REST API server
- **TypeScript** - Type-safe backend
- **Prisma** - Next-gen ORM with type safety
- **PostgreSQL** - Relational database
- **JWT** - Stateless authentication with refresh tokens
- **Socket.io** - WebSocket server for real-time features
- **Bcrypt** - Secure password hashing
- **Zod** - Runtime schema validation

---

## 📋 Prerequisites

- **Node.js** 16.13+ (v22 recommended)
- **npm** 10+
- **Docker** (for PostgreSQL)
- **Git**

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
cd C:\Users\ASUS\project-management-platform

# Install backend dependencies
cd apps\api
npm install

# Install frontend dependencies
cd ..\web
npm install
```

### 2. Start Database

```bash
cd ..\..
docker-compose up -d
```

Wait 10 seconds for PostgreSQL to initialize.

### 3. Setup Database

```bash
cd apps\api
npx prisma generate
npx prisma db push
npx tsx prisma\seed.ts
```

### 4. Start Development Servers

**Terminal 1 (Backend):**
```bash
cd apps\api
npm run dev
```
✅ Backend running at http://localhost:4000

**Terminal 2 (Frontend):**
```bash
cd apps\web
npm run dev
```
✅ Frontend running at http://localhost:5173

### 5. Login

Open http://localhost:5173 and login with:

- **Email:** `admin@example.com`
- **Password:** `password123`

---

## 📁 Project Structure

```
project-management-platform/
├── apps/
│   ├── api/                    # Express backend
│   │   ├── src/
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Auth, validation, errors
│   │   │   └── lib/            # Prisma, JWT, Socket.io
│   │   └── prisma/
│   │       ├── schema.prisma   # Database schema
│   │       └── seed.ts         # Seed data
│   │
│   └── web/                    # React frontend
│       ├── src/
│       │   ├── features/       # Feature modules (auth, projects, tasks)
│       │   ├── hooks/          # React Query custom hooks
│       │   ├── api/            # API client functions
│       │   ├── queryKeys/      # Query key factory
│       │   ├── components/     # Reusable UI components
│       │   ├── lib/            # QueryClient, Socket.io
│       │   └── types/          # TypeScript definitions
│       └── ...
│
├── docker-compose.yml          # PostgreSQL container
├── INSTALLATION.md             # Detailed setup guide
├── ARCHITECTURE.md             # System design & patterns
├── REACT_QUERY_PATTERNS.md     # React Query deep dive
└── PACKAGES.md                 # Dependency list
```

---

## ✨ Features Implemented

### Authentication
- ✅ JWT access tokens (15min expiry)
- ✅ Refresh tokens (7 day expiry, httpOnly cookies)
- ✅ Automatic token refresh on 401
- ✅ Protected routes
- ✅ Logout with token cleanup

### Workspaces
- ✅ Multi-workspace support
- ✅ Role-based access (owner/admin/member)
- ✅ Workspace switching
- ✅ **Email invitations with secure tokens** 🆕
- ✅ **Invitation management (send/revoke)** 🆕

### Projects
- ✅ CRUD operations
- ✅ Archive functionality
- ✅ Optimistic updates
- ✅ Prefetch on hover

### Tasks
- ✅ CRUD operations
- ✅ **Drag & drop Kanban board** 🆕
- ✅ Kanban board (todo/in_progress/done)
- ✅ Assignees
- ✅ Labels
- ✅ Comments
- ✅ **Rich text descriptions (Tiptap)** 🆕
- ✅ **File attachments (Cloudinary)** 🆕
- ✅ **Infinite scroll pagination** 🆕
- ✅ Activity history
- ✅ Optimistic updates with rollback

### Notifications
- ✅ Polling (30s interval)
- ✅ Unread count
- ✅ Mark as read (optimistic)
- ✅ Mark all as read

### React Query Patterns
- ✅ Query key factory
- ✅ Optimistic updates
- ✅ Prefetching
- ✅ Polling
- ✅ Manual cache updates
- ✅ Conditional fetching
- ✅ Request cancellation
- ✅ Smart retry logic
- ✅ Placeholder data
- ✅ **Infinite queries** 🆕
- ✅ React Query Devtools

---

## 🆕 NEW: Phase 2 Features

**All Phase 2 features are now complete!** See detailed documentation:

- **[FEATURES_COMPLETE.md](./FEATURES_COMPLETE.md)** - Overview of all new features
- **[SETUP_NEW_FEATURES.md](./SETUP_NEW_FEATURES.md)** - Quick setup guide
- **[NEW_FEATURES.md](./NEW_FEATURES.md)** - Comprehensive feature documentation
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Complete testing guide

### What's New:
1. **Drag & Drop Kanban** - Move tasks between columns with smooth animations
2. **Rich Text Editor** - Format descriptions with Tiptap (bold, italic, lists, headings)
3. **Workspace Invitations** - Invite members via email with secure tokens
4. **Infinite Scroll** - Paginated task loading for better performance
5. **File Attachments** - Upload files to Cloudinary (free S3 alternative)

### Quick Setup:
```bash
# Install dependencies
cd apps/web && npm install
cd ../api && npm install

# Configure Cloudinary (sign up at cloudinary.com)
# Add to apps/api/.env:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Update database
cd apps/api
npx prisma generate
npx prisma db push
```

---

## 📚 Documentation

- **[INSTALLATION.md](./INSTALLATION.md)** - Step-by-step setup guide with troubleshooting
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, API endpoints, security, scaling
- **[REACT_QUERY_PATTERNS.md](./REACT_QUERY_PATTERNS.md)** - Deep dive into all React Query patterns used
- **[PACKAGES.md](./PACKAGES.md)** - Complete dependency list with installation commands

---

## 🎓 Learning Highlights

### TanStack Query v5 Patterns

1. **Optimistic Updates** - Instant UI feedback with rollback on error
2. **Prefetching** - Preload data on hover for instant navigation
3. **Polling** - Auto-refresh notifications every 30s
4. **Query Key Factory** - Type-safe, hierarchical cache keys
5. **Manual Cache Updates** - Direct cache manipulation for simple changes
6. **Conditional Fetching** - Prevent premature requests with `enabled`
7. **Request Cancellation** - AbortSignal prevents race conditions
8. **Smart Retry Logic** - Don't retry auth failures
9. **Placeholder Data** - Keep old data visible during refetch
10. **Devtools Integration** - Visual cache inspector

### Authentication Patterns

1. **Token Refresh Flow** - Automatic re-authentication on 401
2. **Request Queuing** - Queue requests during token refresh
3. **httpOnly Cookies** - XSS protection for refresh tokens
4. **Axios Interceptors** - Centralized token injection

### Architecture Patterns

1. **Feature-Based Structure** - Scales better than layer-based
2. **API Layer Separation** - Components don't know about HTTP
3. **Type-Safe DTOs** - Shared types between frontend/backend
4. **Centralized Error Handling** - Consistent error UX

---

## 🔧 Available Scripts

### Root
```bash
npm run dev:api        # Start backend
npm run dev:web        # Start frontend
npm run db:push        # Push schema to database
npm run db:migrate     # Create migration
npm run db:seed        # Seed database
npm run db:studio      # Open Prisma Studio
```

### Backend (apps/api)
```bash
npm run dev            # Start dev server with hot reload
npm run build          # Compile TypeScript
npm start              # Run production build
```

### Frontend (apps/web)
```bash
npm run dev            # Start Vite dev server
npm run build          # Build for production
npm run preview        # Preview production build
```

---

## 🐛 Troubleshooting

### Prisma Client Not Found
```bash
cd apps\api
npx prisma generate
```

### CORS Errors
Check `apps/api/.env` - `CORS_ORIGIN` must match frontend URL

### 401 on All Requests
- Check access token in localStorage
- Verify JWT secrets in `apps/api/.env`

### Database Connection Failed
```bash
docker ps                    # Check if PostgreSQL is running
docker-compose restart       # Restart container
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

---

## 🚀 Next Steps

### ✅ Phase 2 (COMPLETED)
- [x] Drag-and-drop Kanban with `@dnd-kit`
- [x] Rich text editor for descriptions (Tiptap)
- [x] Workspace invitations via email
- [x] Infinite scroll with `useInfiniteQuery`
- [x] File uploads (Cloudinary - free S3 alternative)

### Phase 3 (Planned)
- [ ] WebSocket real-time sync
- [ ] Offline support with `networkMode: 'offlineFirst'`
- [ ] Cross-tab sync with BroadcastChannel
- [ ] Suspense boundaries with `useSuspenseQuery`
- [ ] Virtual scrolling for large lists

---

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Sign in
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Sign out
- `GET /api/auth/me` - Get current user

### Workspaces
- `GET /api/workspaces` - List workspaces
- `GET /api/workspaces/:id` - Get workspace
- `POST /api/workspaces` - Create workspace
- `PATCH /api/workspaces/:id` - Update workspace

### Projects
- `GET /api/projects?workspaceId=:id` - List projects
- `GET /api/projects/:id` - Get project
- `POST /api/projects` - Create project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks?projectId=:id` - List tasks
- `GET /api/tasks/:id` - Get task
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread-count` - Get count
- `PATCH /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all

---

## 🔐 Security

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with short expiry
- ✅ Refresh tokens in httpOnly cookies
- ✅ CORS configured
- ✅ Helmet.js security headers
- ✅ Input validation with Zod
- ✅ Authorization checks on all endpoints

---

## 📝 License

MIT

---

## 🙏 Acknowledgments

Built to demonstrate production-grade patterns for:
- TanStack Query v5
- JWT authentication
- Real-time features
- Type-safe full-stack development
