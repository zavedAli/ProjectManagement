# Quick Setup Guide for New Features

## 🚀 Installation Steps

### Step 1: Install Dependencies

Run these commands to install all new packages:

```bash
# Install frontend dependencies
cd apps/web
npm install

# Install backend dependencies
cd ../api
npm install
```

### Step 2: Configure Cloudinary (Free File Storage)

1. **Sign up for Cloudinary** (free tier):
   - Go to https://cloudinary.com/users/register/free
   - Create a free account (25GB storage + 25GB bandwidth/month)

2. **Get your credentials**:
   - After signup, go to Dashboard
   - Copy: Cloud Name, API Key, API Secret

3. **Update backend .env file**:
   ```bash
   # Open apps/api/.env and add:
   CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

### Step 3: Update Database

```bash
cd apps/api

# Generate Prisma client with new models
npx prisma generate

# Push schema changes to database
npx prisma db push
```

This will add two new tables:
- `attachments` - For file uploads
- `workspace_invitations` - For email invitations

### Step 4: Start Development Servers

```bash
# Terminal 1 - Backend
cd apps/api
npm run dev

# Terminal 2 - Frontend  
cd apps/web
npm run dev
```

## ✅ Verify Installation

### Test Drag & Drop
1. Open http://localhost:5173
2. Go to any project
3. Try dragging a task between columns

### Test Rich Text Editor
1. Click "New Task"
2. You should see formatting buttons (B, I, Lists, H2)
3. Create a task with formatted text

### Test File Attachments
1. Open any task
2. Look for "Attachments" section
3. Click "Upload File" and select a file
4. File should upload to Cloudinary

### Test Workspace Invitations
1. Go to workspace settings
2. Click "Invite Member"
3. Enter an email and send
4. Check the email for invitation link

## 🐛 Troubleshooting

### "Cannot find module @dnd-kit/core"
```bash
cd apps/web
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### "Cannot find module @tiptap/react"
```bash
cd apps/web
npm install @tiptap/react @tiptap/starter-kit @tiptap/pm
```

### "Cannot find module cloudinary"
```bash
cd apps/api
npm install cloudinary multer
npm install -D @types/multer
```

### File upload fails with "Invalid credentials"
- Check your Cloudinary credentials in `apps/api/.env`
- Make sure there are no extra spaces
- Restart the backend server after updating .env

### Drag & drop not working
- Clear browser cache
- Check browser console for errors
- Make sure all @dnd-kit packages are installed

### Database errors
```bash
cd apps/api
npx prisma generate
npx prisma db push
```

## 📦 Package Versions

If you encounter version conflicts, use these exact versions:

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
  "multer": "^1.4.5-lts.1"
}
```

### Backend Dev Dependencies
```json
{
  "@types/multer": "^1.4.12"
}
```

## 🎯 What's New

### 1. Drag & Drop Kanban
- Drag tasks between columns
- Visual feedback during drag
- Automatic position updates

### 2. Rich Text Editor
- Format task descriptions
- Bold, italic, lists, headings
- Clean, minimal toolbar

### 3. Workspace Invitations
- Invite members via email
- Secure token-based system
- 7-day expiration

### 4. Infinite Scroll
- Load tasks in batches
- Better performance for large projects
- Smooth pagination

### 5. File Attachments
- Upload files to tasks
- Stored in Cloudinary (free)
- Support for images, PDFs, docs

## 📚 Documentation

- `NEW_FEATURES.md` - Detailed feature documentation
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details

## 🎉 You're Ready!

All features are now installed and ready to use. Start the servers and explore the new functionality!

## 💬 Need Help?

Check the troubleshooting section above or review the detailed documentation in `NEW_FEATURES.md`.
