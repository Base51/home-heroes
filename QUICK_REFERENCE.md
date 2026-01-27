# 🚀 Hybrid Development - Quick Reference

## Daily Commands

```bash
# Start working
supabase start                # Start local Supabase
cd apps/web && npm run dev    # Start Next.js

# Or use npm scripts from apps/web:
npm run db:status             # Check Supabase status
npm run dev                   # Start development server
```

## Database Workflow

```bash
# Make changes in Studio: http://127.0.0.1:54323

# Generate migration from your changes
npm run db:diff my_feature_name

# Test migration locally
npm run db:reset

# Validate before pushing
npm run validate:push

# Push to cloud (after validation)
npm run db:push
```

## Environment Switching

```bash
# Switch between LOCAL and CLOUD
npm run env:switch

# Manual switching: Edit apps/web/.env.local
# Comment/uncomment the LOCAL or CLOUD sections
```

## Common Operations

### Creating a New Feature
```bash
# 1. Ensure local environment
npm run env:switch  # Choose LOCAL

# 2. Make schema changes in Studio
# 3. Generate migration
npm run db:diff add_feature_name

# 4. Test locally
npm run db:reset
npm run dev  # Test in browser

# 5. Commit
git add supabase/migrations/
git commit -m "Add feature"

# 6. Validate and push to cloud
npm run validate:push
```

### Syncing with Cloud
```bash
# Pull latest migrations from cloud
npm run db:pull

# Apply to local database
npm run db:reset
```

### Testing
```bash
# Test Supabase connections
npm run test:supabase

# Reset database with seed data
npm run db:reset
```

## File Locations

- **Migrations**: `supabase/migrations/`
- **Seed Data**: `supabase/seed.sql`
- **Environment**: `apps/web/.env.local`
- **Scripts**: `scripts/`

## URLs (Local)

- 🌐 **App**: http://localhost:3000
- 🗄️ **Studio**: http://127.0.0.1:54323
- 📧 **Mailpit**: http://127.0.0.1:54324
- 🔌 **API**: http://127.0.0.1:54321

## NPM Scripts Reference

```bash
# Development
npm run dev              # Start Next.js dev server
npm run build            # Production build
npm run start            # Start production server

# Database
npm run db:status        # Check Supabase status
npm run db:reset         # Reset database (apply migrations + seed)
npm run db:diff          # Generate migration from changes
npm run db:push          # Push migrations to cloud
npm run db:pull          # Pull migrations from cloud

# Testing & Validation
npm run test:supabase    # Test Supabase connections
npm run validate:push    # Validate before pushing to cloud

# Environment
npm run env:switch       # Switch between LOCAL/CLOUD
```

## ⚠️ Important Rules

✅ **DO**
- Develop locally first
- Test with `npm run db:reset` before pushing
- Use `npm run validate:push` before cloud deployment
- Commit migrations to git
- Use descriptive migration names

❌ **DON'T**
- Edit cloud database directly
- Push untested migrations
- Delete migration files
- Skip validation checks

## Emergency Commands

```bash
# Stop everything
supabase stop

# Fresh start (clears all local data)
supabase stop --no-backup
supabase start

# Kill dev server
lsof -ti:3000 | xargs kill -9

# Clear Next.js cache
rm -rf apps/web/.next
```

## Need Help?

- **Full Guide**: `docs/HYBRID_DEVELOPMENT_WORKFLOW.md`
- **Setup Info**: `HYBRID_SETUP.md`
- **Supabase Docs**: https://supabase.com/docs
