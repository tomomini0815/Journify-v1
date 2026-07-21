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

## 6. Supabase 自動停止（7日間非アクティブ制限）の防止対策

Supabase の無料プランは **7日間アクティビティがないと自動的にデータベースが一時停止（Pause）** されます。
Journify ではこれを自動的に回避するための以下の仕組みが導入されています：

### 1. Vercel Cron（デプロイ済み環境向け）
`vercel.json` に設定された Cron が毎日自動的に `/api/keep-alive` を実行し、データベースへアクティビティを記録します。

### 2. GitHub Actions 自動 Ping（最も推奨・独立動作）
GitHub リポジトリの Secret に環境変数を登録しておくことで、GitHub Actions が毎日午前9:00(JST)に Supabase API へ ping を送信します。

**設定手順:**
1. GitHub リポジトリを開く > **Settings** > **Secrets and variables** > **Actions**
2. **New repository secret** をクリックし、以下を登録：
   - Name: `SUPABASE_URL` / Value: （例: `https://xxxx.supabase.co`）
   - Name: `SUPABASE_ANON_KEY` / Value: （Supabaseの anon public key）
   - Name: `NEXT_PUBLIC_APP_URL` (任意) / Value: （デプロイ先のURL 例: `https://your-app.vercel.app`）

### 3. API エンドポイントの手動/外部Cron呼び出し
`https://<YOUR-APP-DOMAIN>/api/keep-alive` へ GET リクエストを送信することでも手動で生存確認 ping を実行できます。（UptimeRobot や Cron-Job.org などの外部無料サービスから登録して呼び出すことも可能です）

