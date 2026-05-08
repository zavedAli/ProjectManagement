# Installation Guide

## Step 1: Install Root Dependencies

```bash
cd C:\Users\ASUS\project-management-platform
npm install
```

## Step 2: Install Backend Dependencies

```bash
cd apps\api
npm install
```

## Step 3: Install Frontend Dependencies

```bash
cd ..\web
npm install
```

## Step 4: Start PostgreSQL Database

```bash
cd ..\..
docker-compose up -d
```

Wait 10 seconds for PostgreSQL to initialize.

## Step 5: Setup Database Schema

```bash
cd apps\api
npx prisma generate
npx prisma db push
```

## Step 6: Seed Database

```bash
npx tsx prisma\seed.ts
```

## Step 7: Start Backend Server

Open a new terminal:

```bash
cd C:\Users\ASUS\project-management-platform\apps\api
npm run dev
```

Backend will run on http://localhost:4000

## Step 8: Start Frontend Dev Server

Open another terminal:

```bash
cd C:\Users\ASUS\project-management-platform\apps\web
npm run dev
```

Frontend will run on http://localhost:5173

## Step 9: Access Application

Open browser: http://localhost:5173

Login with:
- Email: admin@example.com
- Password: password123

## Troubleshooting

### If Prisma fails:
```bash
cd apps\api
npm install @prisma/client prisma --save
npx prisma generate
```

### If frontend build fails:
```bash
cd apps\web
npm install react react-dom react-router-dom
npm install @tanstack/react-query@5 @tanstack/react-query-devtools@5
npm install axios socket.io-client
npm install -D tailwindcss postcss autoprefixer
```

### If port 4000 is in use:
Edit `apps\api\.env` and change PORT to 4001
Edit `apps\web\.env` and change VITE_API_URL to http://localhost:4001/api

### If PostgreSQL fails:
Check Docker is running:
```bash
docker ps
```

Restart container:
```bash
docker-compose down
docker-compose up -d
```

## Verify Installation

1. Backend health check: http://localhost:4000/health
2. Frontend loads without errors
3. Login works
4. Dashboard shows seeded data
5. React Query Devtools visible (bottom-left icon)
