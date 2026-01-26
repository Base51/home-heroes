# Supabase Migrations

This folder contains SQL migration files for the Home Heroes database schema.

## Cloud-Only Workflow

This project uses **Supabase Cloud only** (no local Supabase CLI or Docker).

### How to Apply Migrations:

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to**: Your Project → SQL Editor
3. **Copy migration content**: From files in this folder
4. **Paste and Run**: Execute in the SQL Editor
5. **Verify**: Check Tables and Policies tabs to confirm

### Migration Files:

| File | Description |
|------|-------------|
| `20250126000000_initial_schema.sql` | Core schema: tables, indexes, functions, seed data |
| `20250126000001_rls_policies.sql` | Row Level Security policies for all tables |

### Important Notes:

- ⚠️ **Run migrations in order** (by filename timestamp)
- ⚠️ **Schema follows conventions**: snake_case, EXISTS patterns for RLS
- ⚠️ **Kids never authenticate**: `family_members.user_id` is NULL for kids
- ⚠️ **Separation principle**: `family_members` (real people) ≠ `heroes` (game profiles)

### Testing RLS Policies:

After applying migrations, test with:

```sql
-- Test as parent user
SELECT * FROM tasks; -- Should see family tasks
SELECT * FROM heroes; -- Should see family heroes

-- Test policy by checking pg_policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Rollback:

To rollback, you'll need to manually drop tables/policies in reverse order or restore from a Supabase backup.

## Environment Setup:

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Schema Diagram:

```
families (household)
  ↓
family_members (real people: parents + kids)
  ↓
heroes (gamified profiles)
  ↓
completions ← tasks (individual)
quest_participants ← quests (group)
  ↓
xp_logs (audit trail)
hero_badges ← badges
```

## Questions?

Refer to [docs/05_database_schema.md](../docs/05_database_schema.md) for detailed schema documentation.
