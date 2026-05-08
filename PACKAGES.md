# Package Installation Commands

## Backend (apps/api)

### Required Dependencies
```bash
npm install @prisma/client@^5.22.0 bcryptjs@^2.4.3 cookie-parser@^1.4.7 cors@^2.8.5 dotenv@^16.4.5 express@^4.21.2 helmet@^8.0.0 jsonwebtoken@^9.0.2 morgan@^1.10.0 socket.io@^4.8.1 zod@^3.24.1
```

### Dev Dependencies
```bash
npm install -D @types/bcryptjs@^2.4.6 @types/cookie-parser@^1.4.7 @types/cors@^2.8.17 @types/express@^5.0.0 @types/jsonwebtoken@^9.0.7 @types/morgan@^1.9.9 @types/node@^22.10.5 nodemon@^3.1.9 prisma@^5.22.0 tsx@^4.19.2 typescript@^5.7.3
```

---

## Frontend (apps/web)

### Core Dependencies
```bash
npm install react@^18.3.1 react-dom@^18.3.1 react-router-dom@^7.1.3
```

### TanStack Query
```bash
npm install @tanstack/react-query@^5.62.14 @tanstack/react-query-devtools@^5.62.14
```

### HTTP & WebSocket
```bash
npm install axios@^1.7.9 socket.io-client@^4.8.1
```

### Styling
```bash
npm install -D tailwindcss@^3.4.17 postcss@^8.4.49 autoprefixer@^10.4.20
```

### Dev Dependencies
```bash
npm install -D typescript@^5.7.3 @types/react@^18.3.18 @types/react-dom@^18.3.5 vite@^6.0.11 @vitejs/plugin-react@^4.3.4
```

---

## Optional Enhancements

### Forms & Validation
```bash
npm install react-hook-form@^7.54.2 @hookform/resolvers@^3.9.1
```

### UI Enhancements
```bash
npm install lucide-react@^0.469.0 clsx@^2.1.1 tailwind-merge@^2.6.0
```

### Drag & Drop
```bash
npm install @dnd-kit/core@^6.3.1 @dnd-kit/sortable@^9.0.0 @dnd-kit/utilities@^3.2.2
```

### Charts
```bash
npm install recharts@^2.15.0
```

### Date Handling
```bash
npm install date-fns@^4.1.0
```

### Notifications
```bash
npm install sonner@^1.7.3
```

---

## Installation Order

1. **Root**: `npm install` (if using workspaces)
2. **Backend**: `cd apps/api && npm install`
3. **Frontend**: `cd apps/web && npm install`
4. **Database**: `docker-compose up -d`
5. **Prisma**: `cd apps/api && npx prisma generate && npx prisma db push`
6. **Seed**: `npx tsx prisma/seed.ts`

---

## Verification

### Check Backend
```bash
cd apps/api
npm run dev
# Should see: 🚀 Server running on http://localhost:4000
```

### Check Frontend
```bash
cd apps/web
npm run dev
# Should see: VITE ready in X ms
```

### Check Database
```bash
docker ps
# Should see: pm-postgres container running
```

---

## Troubleshooting

### If npm install fails
```bash
# Clear cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### If Prisma fails
```bash
# Regenerate client
npx prisma generate

# Reset database
npx prisma migrate reset
```

### If ports are in use
```bash
# Check what's using port 4000
netstat -ano | findstr :4000

# Kill process (Windows)
taskkill /PID <PID> /F
```
