# 🧪 Local Testing Guide

## Prerequisites

Before testing locally, ensure you have:

1. ✅ Supabase project created at https://supabase.com
2. ✅ Environment variables configured in `.env.local`
3. ✅ Dependencies installed (`npm install`)

## Environment Setup

Create `/apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from:
- Supabase Dashboard → Settings → API

## Running the App

```bash
cd apps/web
npm run dev
```

Open http://localhost:3000

## Testing Authentication Flow

### 1. Test Signup (Parent Registration)
1. Navigate to `/signup`
2. Fill in:
   - Name: "Test Parent"
   - Email: "test@example.com"
   - Password: "test123456"
3. Click "Create Account"
4. Check your email for verification link (if email confirmation enabled)
5. Should redirect to `/login` with success message

### 2. Test Login
1. Navigate to `/login`
2. Enter credentials from signup
3. Click "Sign In"
4. Should redirect to `/dashboard`

### 3. Test Protected Routes
1. Try accessing `/dashboard` while logged out
2. Should redirect to `/login?redirect=/dashboard`
3. After login, should return to `/dashboard`

### 4. Test Sign Out
1. Click "Sign Out" button in dashboard
2. Should redirect to `/login`
3. Session should be cleared

## What's Working

✅ **Authentication Pages**
- Signup page at `/signup` (parent registration only)
- Login page at `/login`
- Dashboard at `/dashboard` (protected)

✅ **Security**
- Middleware protecting `/dashboard/*` routes
- Auto-redirect logged-in users from auth pages
- Session management with Supabase Auth

✅ **User Experience**
- Loading states
- Error handling
- Form validation
- Responsive design
- Dark mode support

## Database Setup (Not Yet Applied)

The schema migrations are ready in `/supabase/migrations/` but **NOT YET APPLIED** to your Supabase project.

### To Apply Schema:

1. Open Supabase Dashboard → SQL Editor
2. Copy content from `supabase/migrations/20250126000000_initial_schema.sql`
3. Paste and click "Run"
4. Then copy `supabase/migrations/20250126000001_rls_policies.sql`
5. Paste and click "Run"

⚠️ **Don't apply schema yet** if you just want to test authentication!

## Testing Without Database Tables

You can test authentication **without** applying the full schema:

- ✅ Signup works (creates user in `auth.users`)
- ✅ Login works
- ✅ Protected routes work
- ✅ Sign out works
- ❌ Family/Hero creation won't work yet (requires tables)

## Common Issues

### Issue: "Invalid API key"
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart dev server after changing env vars

### Issue: "Email not confirmed"
- Check Supabase Dashboard → Authentication → Settings
- Disable "Confirm email" for testing (enable for production)

### Issue: Can't create account
- Check Supabase Dashboard → Authentication → Users
- Verify email/password requirements
- Check browser console for errors

### Issue: Middleware not working
- Ensure `middleware.ts` is at root of `apps/web/`
- Check file is named exactly `middleware.ts` (not `.tsx`)

## Next Steps After Auth Testing

Once authentication is working:

1. ✅ Apply database schema migrations
2. ✅ Create family setup flow
3. ✅ Build hero creation
4. ✅ Implement tasks & quests

## Testing Checklist

- [ ] Signup creates new user
- [ ] Login works with correct credentials
- [ ] Login fails with wrong credentials
- [ ] Dashboard only accessible when logged in
- [ ] Auth pages redirect when already logged in
- [ ] Sign out clears session
- [ ] Page refresh maintains session
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Dark mode works

## Questions?

Check:
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
