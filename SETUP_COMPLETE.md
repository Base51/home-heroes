# ✅ Hybrid Supabase Setup - Complete!

## 🎯 Your Development Environment

### Status: READY FOR DEVELOPMENT

**✅ Local Supabase**: Running with test data  
**✅ Cloud Supabase**: Linked to project  
**✅ Next.js App**: Running on localhost:3000  
**✅ Seed Data**: Loaded with test family and activities  
**✅ Helper Scripts**: Ready to use  

---

## 🚀 Quick Start Commands

```bash
# From the project root:

# Start everything
supabase start
cd apps/web && npm run dev

# Or use npm scripts (from apps/web):
npm run db:status     # Check Supabase
npm run dev           # Start app
```

---

## 📊 Your Complete Workflow

### 1. **Daily Development**

```bash
# Morning setup
supabase start                # Start local Supabase
cd apps/web && npm run dev    # Start Next.js

# You're now working with:
# - Local database with test data
# - Isolated from production
# - Fast iteration without affecting cloud
```

**Access URLs:**
- 🌐 App: http://localhost:3000
- 🗄️ Database UI (Studio): http://127.0.0.1:54323
- 📧 Email Testing (Mailpit): http://127.0.0.1:54324

### 2. **Making Database Changes**

**Option A: Visual Changes in Studio**
```bash
# 1. Open Studio
open http://127.0.0.1:54323

# 2. Make changes in UI (add tables, columns, etc.)

# 3. Generate migration from changes
npm run db:diff my_feature_name

# 4. Test migration
npm run db:reset

# 5. Verify in app
npm run dev
```

**Option B: Writing SQL Directly**
```bash
# 1. Create migration file
cd ../.. && supabase migration new add_feature

# 2. Edit the file
code supabase/migrations/[timestamp]_add_feature.sql

# 3. Add your SQL
# 4. Test
npm run db:reset
```

### 3. **Testing Your Changes**

```bash
# Reset database (applies all migrations + seed)
npm run db:reset

# Test Supabase connections
npm run test:supabase

# Manual testing in browser
# - Sign up/login
# - Create family
# - Test features
```

### 4. **Validate Before Pushing**

```bash
# Run pre-push validation
npm run validate:push

# This checks:
# ✓ Local Supabase running
# ✓ Migrations apply cleanly
# ✓ No uncommitted changes
# ✓ RLS policies exist
# ✓ Connections work
```

### 5. **Push to Cloud Production**

```bash
# After validation passes:
npm run db:push

# This applies migrations to your LIVE cloud database
```

### 6. **Deploy App**

```bash
# Switch to cloud environment
npm run env:switch   # Choose CLOUD

# Test production build
npm run build
npm run start

# Deploy to your hosting (Vercel, etc.)
```

---

## 🔄 Environment Switching

### Quick Switch
```bash
cd apps/web
npm run env:switch

# Choose:
# 1) LOCAL  - Development with local Supabase
# 2) CLOUD  - Production with cloud Supabase
```

### Manual Switch
Edit `apps/web/.env.local`:

```env
# LOCAL Development (active)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH

# CLOUD Production (commented)
# NEXT_PUBLIC_SUPABASE_URL=https://xlprgglrbrbikpghcpwr.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

**Remember:** Restart dev server after switching!

---

## 📦 Test Data Available

Your local database now has:

### Test Family: "The Test Family"
- **Super Mom** (Level 5, 1250 XP, 7-day streak)
- **Thunder Kid** (Alex - Level 3, 450 XP)
- **Star Ranger** (Jamie - Level 4, 720 XP)

### Tasks Ready to Test
- Daily: Make Bed, Brush Teeth, Do Homework
- Weekly: Clean Room, Help with Laundry
- Once: Read a Book

### Quests
- Family Clean-Up Day (in progress)
- Movie Night Prep (pending)

### Badges
- First Step, Streak Starter, Task Master, Team Player, Level Up!

### Recent Activity
- Task completions
- XP logs
- Badge awards

**View in Studio:** http://127.0.0.1:54323

---

## 🛠️ Available NPM Scripts

From `apps/web`:

```bash
# Development
npm run dev              # Start Next.js
npm run build            # Production build
npm run start            # Start production server

# Database
npm run db:status        # Check Supabase status
npm run db:reset         # Reset & seed database
npm run db:diff          # Generate migration
npm run db:push          # Push to cloud
npm run db:pull          # Pull from cloud

# Testing
npm run test:supabase    # Test connections

# Environment
npm run env:switch       # Switch LOCAL/CLOUD

# Validation
npm run validate:push    # Pre-push checks
```

---

## 📁 Project Structure

```
home-heroes/
├── apps/web/                    # Next.js application
│   ├── .env.local              # Environment (LOCAL/CLOUD)
│   ├── app/                    # Next.js pages
│   ├── lib/                    # Utilities
│   └── scripts/                # Test scripts
│
├── supabase/
│   ├── migrations/             # Database migrations
│   │   ├── 20250126000000_initial_schema.sql
│   │   ├── 20250126000002_rls_policies_fixed.sql
│   │   ├── 20250126000003_gdpr_delete_account.sql
│   │   └── 20260127103836_fix_rls_policies.sql
│   ├── seed.sql                # Test data
│   └── config.toml             # Supabase config
│
├── scripts/
│   ├── switch-env.sh           # Environment switcher
│   └── validate-push.sh        # Pre-push validation
│
└── docs/
    ├── HYBRID_DEVELOPMENT_WORKFLOW.md  # Full guide
    ├── HYBRID_SETUP.md                  # Setup info
    └── QUICK_REFERENCE.md               # Quick commands
```

---

## ⚡ Common Workflows

### Adding a New Feature
```bash
# 1. Ensure LOCAL environment
npm run env:switch  # Choose LOCAL

# 2. Make changes in Studio or write SQL
npm run db:diff add_feature_name

# 3. Test
npm run db:reset
npm run dev

# 4. Commit
git add supabase/migrations/
git commit -m "Add feature"

# 5. Validate & push
npm run validate:push
```

### Syncing with Cloud
```bash
# Pull latest migrations from cloud
npm run db:pull

# Apply to local
npm run db:reset
```

### Starting Fresh
```bash
# Clear local database and start over
supabase stop --no-backup
supabase start
npm run db:reset
```

---

## 🎓 Learn More

- **Full Workflow Guide**: [docs/HYBRID_DEVELOPMENT_WORKFLOW.md](docs/HYBRID_DEVELOPMENT_WORKFLOW.md)
- **Quick Reference**: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Supabase Docs**: https://supabase.com/docs

---

## 🚨 Important Rules

**✅ Always**
- Develop locally first
- Test with `npm run db:reset`
- Use `npm run validate:push` before cloud push
- Commit migrations to git
- Keep migration names descriptive

**❌ Never**
- Edit cloud database directly
- Push untested migrations
- Delete migration files
- Skip validation checks
- Forget to switch environments

---

## 🎉 You're All Set!

Your hybrid Supabase development environment is fully configured and ready.

**Next Steps:**
1. Explore the test data in Studio: http://127.0.0.1:54323
2. Start the app: `npm run dev`
3. Build your first feature!

**Need help?** Check the docs or run `npm run validate:push` to verify setup.

Happy coding! 🚀
