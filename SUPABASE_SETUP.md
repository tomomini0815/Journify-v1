# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `journify` (or your preferred name)
   - Database password: (create a strong password and save it)
   - Region: Choose closest to your users
4. Click "Create new project" and wait for setup to complete

## 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

3. Go to **Settings** > **Database**
4. Scroll to "Connection string" section
5. Select **URI** tab
6. Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@...`)
7. Replace `[YOUR-PASSWORD]` with your actual database password

## 3. Configure Environment Variables

Create a file named `.env.local` in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres
```

## 4. Push Database Schema

Run the following commands:

```bash
npx prisma generate
npx prisma db push
```

This will create all the necessary tables in your Supabase database.

## 5. Verify Setup

1. Restart your dev server: `npm run dev`
2. Go to `/signup` and create a test account
3. You should be redirected to the dashboard
4. Check Supabase dashboard > **Authentication** > **Users** to see your new user

## Troubleshooting

- If you see "Module '@prisma/client' has no exported member 'PrismaClient'", run `npx prisma generate`
- If login fails, check the browser console for error messages
- Verify your environment variables are correct
