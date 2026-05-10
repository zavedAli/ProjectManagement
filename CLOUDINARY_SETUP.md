# Cloudinary Setup Guide

## Step 1: Sign Up for Cloudinary (Free)

1. Go to https://cloudinary.com
2. Click "Sign Up for Free"
3. Create your account (free tier includes 25GB storage)

## Step 2: Get Your Credentials

1. After signing up, you'll be redirected to the Dashboard
2. Or go to: https://console.cloudinary.com/console
3. You'll see three values:
   - **Cloud Name** (e.g., "dxyz123abc")
   - **API Key** (e.g., "123456789012345")
   - **API Secret** (click "Show" to reveal, e.g., "abcdefghijklmnopqrstuvwxyz")

## Step 3: Update Your .env File

Open `apps/api/.env` and replace the placeholder values:

```env
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

## Step 4: Restart Your Backend Server

```bash
cd apps/api
npm run dev
```

## Done!

Now you can upload files to tasks. The files will be stored in your Cloudinary account.

## Free Tier Limits

- 25 GB storage
- 25 GB bandwidth/month
- Perfect for development and small projects
