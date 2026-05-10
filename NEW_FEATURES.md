# New Features Implementation Guide

## 🎉 Features Added

### 1. Drag & Drop Kanban Board
- **Library**: @dnd-kit/core, @dnd-kit/sortable
- **Components**: 
  - `KanbanBoard.tsx` - Main drag-and-drop container
  - `KanbanColumn.tsx` - Droppable column component
  - `TaskCard.tsx` - Draggable task card
- **Features**:
  - Drag tasks between columns (todo, in_progress, done)
  - Visual feedback during drag
  - Optimistic updates with React Query
  - Position tracking for task ordering

### 2. Rich Text Editor
- **Library**: Tiptap (ProseMirror-based)
- **Component**: `RichTextEditor.tsx`
- **Features**:
  - Bold, Italic formatting
  - Bullet and numbered lists
  - Headings (H2)
  - Clean, minimal toolbar
  - HTML output stored in database
- **Usage**: Task descriptions now support rich text formatting

### 3. Workspace Invitations
- **Component**: `WorkspaceInvitations.tsx`
- **Backend**: 
  - `invitation.service.ts` - Business logic
  - `invitation.controller.ts` - API handlers
  - `invitation.routes.ts` - REST endpoints
- **Features**:
  - Send email invitations with unique tokens
  - 7-day expiration
  - Role-based invites (member/admin)
  - Revoke pending invitations
  - Email sent via SendGrid
- **API Endpoints**:
  - `POST /api/workspaces/:id/invitations` - Send invitation
  - `GET /api/workspaces/:id/invitations` - List invitations
  - `POST /api/invitations/accept` - Accept invitation
  - `DELETE /api/invitations/:id` - Revoke invitation

### 4. Infinite Scroll
- **Hook**: `useInfiniteTasks.ts`
- **Features**:
  - Uses `useInfiniteQuery` from React Query
  - Loads 20 tasks per page
  - Automatic pagination
  - Optimized for large task lists
- **Backend**: Updated `taskService.getAll()` to support `skip` and `take` parameters

### 5. File Attachments (Cloudinary)
- **Component**: `TaskAttachments.tsx`
- **Backend**:
  - `cloudinary.ts` - Cloudinary integration
  - `upload.ts` - Multer configuration
  - Updated `task.service.ts` with attachment methods
- **Features**:
  - Upload files up to 10MB
  - Supported formats: images, PDFs, docs, spreadsheets, zip
  - Files stored in Cloudinary (free tier)
  - Display file size and name
  - Delete attachments
  - Activity tracking for uploads
- **API Endpoints**:
  - `POST /api/tasks/:id/attachments` - Upload file
  - `DELETE /api/attachments/:id` - Delete attachment

## 📦 Dependencies Added

### Frontend (apps/web/package.json)
```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2",
  "@tiptap/pm": "^2.10.5",
  "@tiptap/react": "^2.10.5",
  "@tiptap/starter-kit": "^2.10.5"
}
```

### Backend (apps/api/package.json)
```json
{
  "cloudinary": "^2.5.1",
  "multer": "^1.4.5-lts.1",
  "@types/multer": "^1.4.12"
}
```

## 🗄️ Database Changes

### New Models (schema.prisma)

#### Attachment
```prisma
model Attachment {
  id           String   @id @default(cuid())
  filename     String
  url          String
  size         Int
  mimeType     String
  taskId       String
  uploadedById String
  createdAt    DateTime @default(now())

  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)

  @@map("attachments")
}
```

#### WorkspaceInvitation
```prisma
model WorkspaceInvitation {
  id          String   @id @default(cuid())
  email       String
  workspaceId String
  role        String   @default("member")
  token       String   @unique
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([workspaceId, email])
  @@map("workspace_invitations")
}
```

### Updated Models
- **Task**: Added `attachments` relation and changed `description` to `@db.Text`
- **Workspace**: Added `invitations` relation

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
# Frontend
cd apps/web
npm install

# Backend
cd ../api
npm install
```

### 2. Configure Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com) (free tier)
2. Get your credentials from the dashboard
3. Update `apps/api/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

### 3. Update Database

```bash
cd apps/api
npx prisma generate
npx prisma db push
```

### 4. Start Servers

```bash
# Terminal 1 - Backend
cd apps/api
npm run dev

# Terminal 2 - Frontend
cd apps/web
npm run dev
```

## 🎨 Usage Examples

### Drag & Drop Kanban
```tsx
import { KanbanBoard } from '../../components/ui/KanbanBoard';

<KanbanBoard 
  tasks={tasks} 
  onTaskMove={(taskId, newStatus, newPosition) => {
    updateTask.mutate({ id: taskId, updates: { status: newStatus, position: newPosition } });
  }}
/>
```

### Rich Text Editor
```tsx
import { RichTextEditor } from '../../components/ui/RichTextEditor';

<RichTextEditor
  content={description}
  onChange={setDescription}
  placeholder="Add task description..."
/>
```

### Workspace Invitations
```tsx
import { WorkspaceInvitations } from '../../components/ui/WorkspaceInvitations';

<WorkspaceInvitations workspaceId={workspace.id} />
```

### Task Attachments
```tsx
import { TaskAttachments } from '../../components/ui/TaskAttachments';

<TaskAttachments taskId={task.id} attachments={task.attachments} />
```

### Infinite Scroll
```tsx
import { useInfiniteTasks } from '../../hooks/useInfiniteTasks';

const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteTasks(projectId);

// Flatten pages
const tasks = data?.pages.flat() || [];

// Load more button
{hasNextPage && (
  <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
    {isFetchingNextPage ? 'Loading...' : 'Load More'}
  </button>
)}
```

## 🔒 Security Notes

1. **File Uploads**: 
   - Max size: 10MB
   - Allowed types validated server-side
   - Files stored in Cloudinary (not local filesystem)

2. **Invitations**:
   - Tokens are cryptographically secure (32 bytes)
   - 7-day expiration enforced
   - Email verification required

3. **Authorization**:
   - All endpoints check workspace membership
   - Only workspace members can upload/delete attachments
   - Only admins/owners can send invitations

## 🚀 Performance Optimizations

1. **Drag & Drop**: Uses pointer sensor with 8px activation distance to prevent accidental drags
2. **Rich Text**: Minimal toolbar, only essential formatting options
3. **Infinite Scroll**: Loads 20 tasks at a time, reduces initial load
4. **File Uploads**: Memory storage with Multer, streamed to Cloudinary
5. **Optimistic Updates**: All mutations use optimistic updates for instant UI feedback

## 📝 Alternative to S3

**Cloudinary** was chosen over AWS S3 because:
- ✅ Free tier: 25GB storage, 25GB bandwidth/month
- ✅ Built-in CDN
- ✅ Image optimization and transformations
- ✅ Simple API
- ✅ No AWS account required

**Other free alternatives considered**:
- **Supabase Storage**: 1GB free
- **Uploadcare**: 3GB free
- **ImageKit**: 20GB free

## 🐛 Troubleshooting

### Drag & Drop not working
- Ensure `@dnd-kit` packages are installed
- Check browser console for errors
- Verify task IDs are unique

### Rich Text Editor blank
- Check Tiptap packages are installed
- Ensure `content` prop is a string (HTML)
- Verify CSS is loaded

### File upload fails
- Check Cloudinary credentials in `.env`
- Verify file size < 10MB
- Check file type is allowed
- Ensure `multer` is installed

### Invitation emails not sent
- Verify SendGrid API key
- Check `FRONTEND_URL` in `.env`
- Ensure email service is configured

## 📚 Next Steps

1. Add intersection observer for automatic infinite scroll
2. Implement drag-and-drop file uploads
3. Add image preview for attachments
4. Create invitation acceptance page
5. Add bulk operations for tasks
6. Implement task templates
7. Add @mentions in rich text editor
8. Create activity feed for workspace

## 🎯 Testing Checklist

- [ ] Drag task between columns
- [ ] Create task with rich text description
- [ ] Send workspace invitation
- [ ] Accept invitation via email link
- [ ] Upload file to task
- [ ] Delete attachment
- [ ] Load more tasks with infinite scroll
- [ ] Verify optimistic updates work
- [ ] Test file size limits
- [ ] Test invitation expiration
