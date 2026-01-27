# Hybrid Supabase Setup Guide

## ✅ Setup Complete!

Your hybrid Supabase environment is configured and tested.

## 🔄 Switching Between Environments

### Local Development (Current)
Edit `apps/web/.env.local`:
```env
# LOCAL (active)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# CLOUD (commented)
# NEXT_PUBLIC_SUPABASE_URL=https://xlprgglrbrbikpghcpwr.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-cloud-anon-key
```

### Cloud Production
Edit `apps/web/.env.local`:
```env
# LOCAL (commented)
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# CLOUD (active)
NEXT_PUBLIC_SUPABASE_URL=https://xlprgglrbrbikpghcpwr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-cloud-anon-key
```

## 🧪 Testing

Run the test suite anytime:
```bash
cd apps/web
npm run test:supabase
```

## 📋 Daily Workflow

### Starting Local Development
```bash
# 1. Start local Supabase
supabase start

# 2. Check it's running
supabase status

# 3. Ensure .env.local points to LOCAL

# 4. Start Next.js app
cd apps/web
npm run dev
```

### Local Supabase Commands
```bash
supabase start        # Start all containers
supabase stop         # Stop containers (keeps data)
supabase stop --no-backup  # Stop and clear data
supabase status       # Check what's running
supabase db reset     # Reset database to migrations
```

### Accessing Local Tools
- **Studio**: http://127.0.0.1:54323 (Database UI)
- **Mailpit**: http://127.0.0.1:54324 (Email testing)
- **API**: http://127.0.0.1:54321

## 🔄 Migration Workflow

### Creating New Migrations
```bash
# Make changes in Studio or create SQL file
supabase migration new my_feature_name

# Edit supabase/migrations/[timestamp]_my_feature_name.sql
# Add your SQL changes

# Apply to local
supabase db reset

# Push to cloud
supabase db push
```

### Pulling Cloud Changes
```bash
# Get migrations from cloud
supabase db pull

# Apply to local
supabase db reset
```

## 🗄️ Seeding Data

Create `supabase/seed.sql` for test data:
```sql
-- Test family and users
INSERT INTO families (id, name) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Test Family');

-- Add more test data...
```

Load seed data:
```bash
supabase db reset  # Runs migrations + seed.sql
```

## ⚠️ Important Notes

1. **Never commit real credentials** - Use different keys for local/cloud
2. **Local data is temporary** - It's reset when you stop containers
3. **Always test migrations locally first** before pushing to cloud
4. **Cloud anon key** - Get yours from: https://supabase.com/dashboard/project/xlprgglrbrbikpghcpwr/settings/api

## 🎯 Test Results

✅ Local Supabase - WORKING
⚠️  Cloud Supabase - Need to update anon key in .env.local

## 📞 Quick Reference

| Environment | URL | Port |
|------------|-----|------|
| Local API | http://127.0.0.1:54321 | 54321 |
| Local DB | postgresql://postgres:postgres@127.0.0.1:54322/postgres | 54322 |
| Local Studio | http://127.0.0.1:54323 | 54323 |
| Cloud API | https://xlprgglrbrbikpghcpwr.supabase.co | 443 |
