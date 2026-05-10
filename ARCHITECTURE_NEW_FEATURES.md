# New Features Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ KanbanBoard  │  │ RichTextEditor│  │ TaskAttach   │          │
│  │  Component   │  │   Component   │  │  Component   │          │
│  └──────┬───────┘  └──────┬────────┘  └──────┬───────┘          │
│         │                 │                   │                   │
│         └─────────────────┼───────────────────┘                   │
│                           │                                       │
│  ┌────────────────────────▼────────────────────────┐             │
│  │         React Query (TanStack Query v5)         │             │
│  │  - Optimistic Updates                           │             │
│  │  - Infinite Queries                             │             │
│  │  - Cache Management                             │             │
│  └────────────────────────┬────────────────────────┘             │
│                           │                                       │
└───────────────────────────┼───────────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Axios HTTP   │
                    │     Client     │
                    └───────┬────────┘
                            │
┌───────────────────────────▼───────────────────────────────────────┐
│                      BACKEND (Express)                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │   Task       │  │  Invitation  │  │  Attachment  │           │
│  │  Controller  │  │  Controller  │  │   Routes     │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                  │                    │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐           │
│  │   Task       │  │  Invitation  │  │   Multer     │           │
│  │   Service    │  │   Service    │  │  Middleware  │           │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘           │
│         │                 │                  │                    │
│         └─────────────────┼──────────────────┘                    │
│                           │                                       │
└───────────────────────────┼───────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
│   PostgreSQL   │  │   Cloudinary   │  │  SendGrid   │
│   (Prisma)     │  │  (File Store)  │  │   (Email)   │
└────────────────┘  └────────────────┘  └─────────────┘
```

---

## Feature 1: Drag & Drop Kanban

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                          │
│              (Drag task to new column)                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              @dnd-kit/core                              │
│  - DndContext (manages drag state)                      │
│  - DragOverlay (visual feedback)                        │
│  - Sensors (pointer/keyboard)                           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│           KanbanBoard Component                         │
│  - handleDragStart() → set activeTask                   │
│  - handleDragEnd() → calculate new status/position      │
│  - onTaskMove() → trigger mutation                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│          React Query Mutation                           │
│  - Optimistic update (instant UI)                       │
│  - API call: PATCH /api/tasks/:id                       │
│  - Rollback on error                                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            Backend (Task Service)                       │
│  - Validate workspace membership                        │
│  - Update task.status and task.position                 │
│  - Create activity log                                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              PostgreSQL (Prisma)                        │
│  UPDATE tasks SET status=?, position=? WHERE id=?       │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 2: Rich Text Editor

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                          │
│           (Type and format text)                        │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Tiptap Editor                              │
│  - StarterKit (bold, italic, lists, headings)           │
│  - ProseMirror (document model)                         │
│  - onChange() → getHTML()                               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         RichTextEditor Component                        │
│  - Toolbar (formatting buttons)                         │
│  - EditorContent (editable area)                        │
│  - onChange(html) → parent component                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│          Task Create/Update Form                        │
│  - Store HTML in state                                  │
│  - Submit with task data                                │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            Backend (Task Service)                       │
│  - Store HTML in task.description (@db.Text)            │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              PostgreSQL (Prisma)                        │
│  INSERT/UPDATE tasks SET description=? (HTML)           │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 3: Workspace Invitations

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Action                         │
│         (Send invitation to email)                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│      WorkspaceInvitations Component                     │
│  - Form (email, role)                                   │
│  - sendInvite.mutate()                                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│          POST /api/workspaces/:id/invitations           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         Invitation Service                              │
│  1. Check if user already member                        │
│  2. Generate secure token (32 bytes)                    │
│  3. Set expiration (7 days)                             │
│  4. Save to database                                    │
│  5. Send email via SendGrid                             │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐        ┌───────▼────────┐
│   PostgreSQL   │        │    SendGrid    │
│  (Save token)  │        │  (Send email)  │
└────────────────┘        └───────┬────────┘
                                  │
                          ┌───────▼────────┐
                          │  User's Email  │
                          │  (Click link)  │
                          └───────┬────────┘
                                  │
┌─────────────────────────────────▼───────────────────────┐
│      AcceptInvitationPage Component                     │
│  - Extract token from URL                               │
│  - POST /api/invitations/accept                         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         Invitation Service                              │
│  1. Validate token                                      │
│  2. Check expiration                                    │
│  3. Verify email matches user                           │
│  4. Create workspace member                             │
│  5. Delete invitation                                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              PostgreSQL (Prisma)                        │
│  INSERT workspace_members, DELETE invitations           │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 4: Infinite Scroll

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                          │
│              (Scroll to bottom)                         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         useInfiniteTasks Hook                           │
│  - useInfiniteQuery()                                   │
│  - initialPageParam: 0                                  │
│  - getNextPageParam: (lastPage, pages) =>               │
│      lastPage.length === 20 ? pages.length * 20 : null  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│          GET /api/tasks?skip=0&take=20                  │
│          GET /api/tasks?skip=20&take=20                 │
│          GET /api/tasks?skip=40&take=20                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            Backend (Task Service)                       │
│  - prisma.task.findMany({ skip, take })                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              PostgreSQL (Prisma)                        │
│  SELECT * FROM tasks LIMIT 20 OFFSET 0                  │
│  SELECT * FROM tasks LIMIT 20 OFFSET 20                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│          React Query Cache                              │
│  pages: [                                               │
│    [task1, task2, ..., task20],    // Page 1           │
│    [task21, task22, ..., task40],  // Page 2           │
│    [task41, task42, ..., task60]   // Page 3           │
│  ]                                                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              UI Component                               │
│  const tasks = data?.pages.flat() || []                 │
│  {hasNextPage && <button onClick={fetchNextPage} />}    │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 5: File Attachments

```
┌─────────────────────────────────────────────────────────┐
│                    User Action                          │
│              (Select file to upload)                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│       TaskAttachments Component                         │
│  - <input type="file" onChange={handleFileChange} />    │
│  - uploadMutation.mutate(file)                          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│    POST /api/tasks/:id/attachments (multipart)         │
│    Content-Type: multipart/form-data                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            Multer Middleware                            │
│  - Parse multipart form data                            │
│  - Validate file type                                   │
│  - Check file size (< 10MB)                             │
│  - Store in memory buffer                               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│         Task Service (uploadAttachment)                 │
│  1. Validate workspace membership                       │
│  2. Upload to Cloudinary                                │
│  3. Save metadata to database                           │
│  4. Create activity log                                 │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐        ┌───────▼────────┐
│   Cloudinary   │        │   PostgreSQL   │
│  (Store file)  │        │ (Save metadata)│
│  Returns URL   │        │  filename, url │
└───────┬────────┘        │  size, mimeType│
        │                 └────────────────┘
        │
┌───────▼────────────────────────────────────────────────┐
│              Response to Client                         │
│  {                                                      │
│    id: "att_123",                                       │
│    filename: "document.pdf",                            │
│    url: "https://res.cloudinary.com/...",              │
│    size: 1024000,                                       │
│    mimeType: "application/pdf"                          │
│  }                                                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│          React Query Cache Update                       │
│  - Invalidate task detail query                         │
│  - Refetch task with new attachment                     │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Summary

### 1. Drag & Drop
```
User Drag → @dnd-kit → React Query → API → Prisma → PostgreSQL
                ↓
         Optimistic Update (instant UI)
```

### 2. Rich Text
```
User Types → Tiptap → HTML → React State → API → Prisma → PostgreSQL
```

### 3. Invitations
```
Admin Sends → API → Prisma → PostgreSQL
                ↓
            SendGrid → Email → User Clicks → API → Prisma
```

### 4. Infinite Scroll
```
User Scrolls → useInfiniteQuery → API (skip/take) → Prisma → PostgreSQL
                      ↓
              React Query Cache (pages array)
```

### 5. File Attachments
```
User Uploads → Multer → Cloudinary → URL
                           ↓
                    Prisma → PostgreSQL (metadata)
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Drag & Drop** | @dnd-kit | Modern, accessible DnD |
| **Rich Text** | Tiptap | ProseMirror-based editor |
| **File Storage** | Cloudinary | Free CDN + storage |
| **Email** | SendGrid | Transactional emails |
| **State Management** | React Query | Server state + caching |
| **File Upload** | Multer | Multipart form parsing |
| **Database** | PostgreSQL | Relational data |
| **ORM** | Prisma | Type-safe queries |
| **Backend** | Express | REST API |
| **Frontend** | React 18 | UI framework |

---

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Client Side                          │
│  - File type validation                                 │
│  - File size check (< 10MB)                             │
│  - Form validation                                      │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    Server Side                          │
│  - JWT authentication                                   │
│  - Workspace membership check                           │
│  - File type validation (server)                        │
│  - File size limit (server)                             │
│  - Token expiration check                               │
│  - Email verification                                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    Database                             │
│  - Cascade deletes                                      │
│  - Unique constraints                                   │
│  - Foreign key constraints                              │
└─────────────────────────────────────────────────────────┘
```

---

## Performance Optimizations

1. **Optimistic Updates**: UI updates instantly, API call in background
2. **Pagination**: Load 20 tasks at a time instead of all
3. **Streaming**: Files streamed to Cloudinary (no disk writes)
4. **Caching**: React Query caches all API responses
5. **Debouncing**: Search input debounced (300ms)
6. **Lazy Loading**: Components loaded on demand
7. **CDN**: Files served from Cloudinary CDN

---

This architecture ensures:
- ✅ Scalability (pagination, CDN)
- ✅ Performance (optimistic updates, caching)
- ✅ Security (validation, authentication, authorization)
- ✅ Reliability (error handling, rollback)
- ✅ Maintainability (clean separation of concerns)
