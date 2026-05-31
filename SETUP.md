# Setup

## 1. Supabase

1. Go to supabase.com → your project → Settings → API
2. Copy "Project URL" and "anon public" key
3. Create `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

4. Go to your Supabase project → SQL Editor → paste the contents of `supabase-schema.sql` → Run

## 2. Auth settings

In Supabase → Authentication → Settings:
- Disable "Confirm email" if you want to skip email verification

## 3. Run locally

```bash
npm run dev
```

## 4. Deploy to Vercel

```bash
npx vercel
```

Add the two environment variables in your Vercel project settings.
Then set your custom domain `aronsesatthing.com` in Vercel → Domains.
