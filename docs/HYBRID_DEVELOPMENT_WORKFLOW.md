# Hybrid Development Workflow Guide

## 🎯 Philosophy

**LOCAL FIRST → VALIDATE → PUSH TO CLOUD**

All development happens locally first. Only validated, tested changes get pushed to production cloud.

---

## 📋 Complete Development Flow

### 1️⃣ **Start Local Development**

```bash
# Terminal 1: Start local Supabase
cd ~/Desktop/DEV/home-heroes
supabase start

# Terminal 2: Start Next.js app
cd apps/web
npm run dev
```

**Ensure .env.local is set to LOCAL:**
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

**Access Points:**
- 🌐 App: http://localhost:3000
- 🗄️ Studio: http://127.0.0.1:54323
- 📧 Mailpit: http://127.0.0.1:54324

---

### 2️⃣ **Make Database Changes**

#### Option A: Using Studio UI
1. Open http://127.0.0.1:54323
2. Make changes in Table Editor or SQL Editor
3. Generate migration from changes:
   ```bash
   supabase db diff -f my_feature_name
   ```
   This creates: `supabase/migrations/[timestamp]_my_feature_name.sql`

#### Option B: Writing SQL Migrations Directly
```bash
# Create new migration file
supabase migration new add_tasks_feature

# Edit the generated file
code supabase/migrations/[timestamp]_add_tasks_feature.sql

# Add your SQL:
# CREATE TABLE ...
# ALTER TABLE ...
# CREATE POLICY ...
```

#### Option C: Using Supabase CLI Commands
```bash
# Generate diff from current database state
supabase db diff -f my_changes

# Create migration with schema changes
supabase db diff -f schema_updates --schema public
```

---

### 3️⃣ **Test Changes Locally**

```bash
# Apply migration to local database
supabase db reset

# Or just apply latest migration
supabase migration up

# Test in your app
# - Create test data
# - Run through user flows
# - Check RLS policies work correctly
# - Verify no errors in console
```

**Testing Checklist:**
- [ ] Migration applies without errors
- [ ] RLS policies allow correct access
- [ ] No infinite recursion in policies
- [ ] Parent can create/view/update data
- [ ] Kids have appropriate restricted access
- [ ] All foreign keys resolve correctly

---

### 4️⃣ **Validate with Test Suite**

```bash
# Run Supabase connection test
cd apps/web
npm run test:supabase

# Run your app's tests (when created)
npm run test

# Manual testing in browser
# - Sign up new user
# - Create family
# - Add tasks/quests
# - Test all CRUD operations
```

---

### 5️⃣ **Push to Cloud Production**

Once everything works locally:

```bash
# Push database migrations to cloud
supabase db push

# You'll see:
# - List of migrations to apply
# - Confirmation prompt
# - Application status
```

**Important:** This applies migrations to your LIVE production database!

#### Deployment Checklist:
- [ ] All migrations tested locally
- [ ] No breaking changes to existing data
- [ ] RLS policies validated
- [ ] Backup plan if something fails
- [ ] Team notified (if applicable)

---

### 6️⃣ **Deploy App Changes**

```bash
# Build and test production build
cd apps/web
npm run build
npm run start

# Once validated, deploy to your hosting
# (Vercel, Netlify, etc.)
```

For production deployment, temporarily switch .env.local to CLOUD:
```env
# Comment LOCAL
# NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
# NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# Uncomment CLOUD
NEXT_PUBLIC_SUPABASE_URL=https://xlprgglrbrbikpghcpwr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

Or use production environment variables in your hosting platform.

---

## 🔄 Common Workflows

### **Adding a New Feature**
```bash
# 1. Create feature branch
git checkout -b feature/add-badges-system

# 2. Start local Supabase
supabase start

# 3. Make database changes in Studio
# (http://127.0.0.1:54323)

# 4. Generate migration
supabase db diff -f add_badges_system

# 5. Test locally
supabase db reset
npm run dev  # Test in browser

# 6. Commit migration
git add supabase/migrations/
git commit -m "Add badges system"

# 7. Push to cloud
supabase db push

# 8. Deploy app
# (push to main → auto-deploy)
```

### **Fixing a Bug in Production**
```bash
# 1. Pull latest cloud state
supabase db pull

# 2. Recreate bug locally
supabase db reset
npm run dev

# 3. Fix and create migration
supabase migration new fix_xp_calculation

# 4. Test fix locally
supabase db reset

# 5. Push fix to cloud
supabase db push

# 6. Deploy app fix
```

### **Syncing with Cloud (when others made changes)**
```bash
# Pull new migrations from cloud
supabase db pull

# Apply to local database
supabase db reset

# Continue development
```

---

## 🚨 Important Rules

### ✅ DO
- **Always develop locally first**
- **Test migrations with `supabase db reset` before pushing**
- **Commit migrations to git before pushing to cloud**
- **Use descriptive migration names**
- **Keep migrations small and focused**
- **Test RLS policies thoroughly**
- **Use transactions for complex migrations**

### ❌ DON'T
- **Never edit cloud database directly** (except emergencies)
- **Never push untested migrations**
- **Never delete migration files** (they're append-only)
- **Don't skip `supabase db reset` after changes**
- **Don't mix schema and data changes** (separate migrations)
- **Don't forget to pull before starting new work**

---

## 🛠️ Helper Commands

### Database Management
```bash
# Reset local database (applies all migrations + seed)
supabase db reset

# Apply only new migrations
supabase migration up

# Generate migration from current state
supabase db diff -f migration_name

# Push migrations to cloud
supabase db push

# Pull migrations from cloud
supabase db pull

# Check migration status
supabase migration list
```

### Supabase Services
```bash
# Start all services
supabase start

# Stop services (keeps data)
supabase stop

# Stop and clear all data
supabase stop --no-backup

# Check status
supabase status

# View logs
supabase logs
```

### Development
```bash
# Test Supabase connections
npm run test:supabase

# Start dev server
npm run dev

# Build production
npm run build

# Preview production locally
npm run start
```

---

## 📊 Migration Best Practices

### Structure
```sql
-- Good migration structure
BEGIN;

-- 1. Schema changes
ALTER TABLE families ADD COLUMN subscription_tier text DEFAULT 'free';

-- 2. Data migrations
UPDATE families SET subscription_tier = 'free' WHERE subscription_tier IS NULL;

-- 3. Constraints
ALTER TABLE families ADD CONSTRAINT check_subscription_tier 
  CHECK (subscription_tier IN ('free', 'premium', 'enterprise'));

-- 4. RLS Policies
CREATE POLICY "Users can view their subscription"
  ON families FOR SELECT
  USING (
    id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

COMMIT;
```

### Naming Conventions
```bash
# Good names
supabase migration new add_badges_table
supabase migration new fix_xp_calculation
supabase migration new update_hero_levels_rls

# Bad names
supabase migration new changes
supabase migration new fix
supabase migration new update
```

### Safety Patterns
```sql
-- Use IF EXISTS for drops
DROP TABLE IF EXISTS old_table;

-- Use IF NOT EXISTS for creates
CREATE TABLE IF NOT EXISTS badges (...);

-- Add columns with defaults
ALTER TABLE heroes ADD COLUMN level integer DEFAULT 1;

-- Drop policies safely
DROP POLICY IF EXISTS "old_policy" ON heroes;

-- Add NOT NULL only after filling data
ALTER TABLE heroes ADD COLUMN level integer DEFAULT 1;
UPDATE heroes SET level = 1 WHERE level IS NULL;
ALTER TABLE heroes ALTER COLUMN level SET NOT NULL;
```

---

## 🧪 Testing Strategy

### Local Testing Flow
1. **Apply migration**: `supabase db reset`
2. **Seed test data**: Add to `supabase/seed.sql`
3. **Manual testing**: Use Studio and app UI
4. **Automated tests**: Run test suite
5. **Edge cases**: Test with/without data, multiple users
6. **RLS validation**: Test as different user roles

### Pre-Push Checklist
```bash
# 1. Reset and test clean install
supabase stop --no-backup
supabase start  # Fresh start

# 2. Verify migrations apply cleanly
supabase db reset

# 3. Test connection
npm run test:supabase

# 4. Manual app testing
npm run dev
# Test all features

# 5. Check logs for errors
supabase logs

# 6. Ready to push!
supabase db push
```

---

## 🚀 Production Deployment Checklist

### Before Pushing to Cloud
- [ ] All migrations tested locally
- [ ] Migrations committed to git
- [ ] Team reviewed (if applicable)
- [ ] Backup of production data (if major changes)
- [ ] Rollback plan documented
- [ ] Environment variables ready
- [ ] Tests passing

### Push to Cloud
```bash
# 1. Verify you're linked to correct project
supabase status

# 2. Check what will be pushed
supabase db push --dry-run

# 3. Push migrations
supabase db push

# 4. Verify in cloud
# Visit: https://supabase.com/dashboard/project/xlprgglrbrbikpghcpwr
```

### After Pushing
- [ ] Verify migrations applied in cloud dashboard
- [ ] Test production app with cloud database
- [ ] Monitor for errors
- [ ] Notify users if downtime occurred

---

## 🔐 Environment Management

### Local Development (.env.local)
```env
# LOCAL Supabase
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### Production Deployment (Vercel/Netlify)
```env
# CLOUD Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xlprgglrbrbikpghcpwr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**Never commit production keys to git!**

---

## 🐛 Troubleshooting

### "Migration already exists"
```bash
# Reset local database
supabase stop --no-backup
supabase start
```

### "RLS policy infinite recursion"
- Don't query the same table in its own policy
- Use `IN (SELECT ...)` instead of `EXISTS`
- Test policies in isolation

### "Changes not reflecting in app"
```bash
# Clear Next.js cache
rm -rf apps/web/.next
npm run dev

# Verify correct environment
echo $NEXT_PUBLIC_SUPABASE_URL
```

### "Cloud and local out of sync"
```bash
# Pull cloud state
supabase db pull

# Reset local to match cloud
supabase db reset
```

---

## 📈 Advanced Patterns

### Feature Flags with RLS
```sql
-- Enable features per family
CREATE TABLE feature_flags (
  family_id uuid REFERENCES families(id),
  feature_name text,
  enabled boolean DEFAULT false
);

-- Use in RLS policies
CREATE POLICY "Feature gated access"
  ON advanced_quests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM feature_flags
      WHERE family_id = advanced_quests.family_id
        AND feature_name = 'advanced_quests'
        AND enabled = true
    )
  );
```

### Safe Rollbacks
```sql
-- Always design for rollback
-- Migration 001: Add column
ALTER TABLE heroes ADD COLUMN new_field text;

-- Migration 002: Use new column
UPDATE heroes SET new_field = 'default';

-- Rollback: Can drop column without data loss
ALTER TABLE heroes DROP COLUMN new_field;
```

### Zero-Downtime Migrations
```sql
-- Step 1: Add nullable column
ALTER TABLE heroes ADD COLUMN new_xp integer;

-- Step 2: Backfill data (can do in background)
UPDATE heroes SET new_xp = old_xp;

-- Step 3: Add NOT NULL constraint
ALTER TABLE heroes ALTER COLUMN new_xp SET NOT NULL;

-- Step 4: Drop old column
ALTER TABLE heroes DROP COLUMN old_xp;
```

---

## 🎓 Learning Resources

- **Supabase Docs**: https://supabase.com/docs
- **RLS Patterns**: https://supabase.com/docs/guides/auth/row-level-security
- **Migration Guide**: https://supabase.com/docs/guides/cli/local-development
- **PostgreSQL Best Practices**: https://wiki.postgresql.org/wiki/Don't_Do_This

---

## 📞 Quick Reference Card

```bash
# Daily workflow
supabase start              # Start local
npm run dev                 # Start app
supabase status            # Check status

# Make changes
supabase db diff -f name   # Generate migration
supabase db reset          # Test locally

# Deploy
git add supabase/migrations/
git commit -m "description"
supabase db push           # Push to cloud

# Sync
supabase db pull           # Get cloud migrations
supabase db reset          # Apply locally
```
