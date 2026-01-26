# Home Heroes – Development Conventions & AI Prompts

This document defines **hard rules, architecture principles, and AI prompting guidance**
for all development on the Home Heroes project.

GitHub Copilot must follow these rules when generating code, SQL, or logic.

---

## 🔑 CORE PRODUCT PRINCIPLES

- Home Heroes is a **family-based gamified task system**
- Trust-based: tasks and quests auto-award XP (no approval step)
- Parents authenticate; kids do NOT authenticate directly
- Kids act through a parent session
- All family members (parents + kids) have a Hero profile
- Group Quests allow multiple heroes to earn XP
- Mobile-first architecture (React Native later)

---

## 🧱 DOMAIN MODEL (NON-NEGOTIABLE)

### Real People vs Game Avatars
- `family_members` = real people
- `heroes` = gamified profiles

NEVER merge these concepts.

### Authentication Rules
- Only parents authenticate via Supabase Auth
- `family_members.user_id` is NULL for kids
- RLS is always enforced using `auth.uid()` (parents only)

---

## 🛡️ SECURITY & RLS RULES (SUPABASE CLOUD)

- Supabase Cloud only (no local Supabase)
- NEVER assume direct kid authentication
- ALL RLS must:
  - Use `EXISTS` instead of `IN (SELECT ...)`
  - Reference parent `auth.uid()`
  - Scope data to a single family

### Example Pattern
```sql
EXISTS (
  SELECT 1 FROM family_members fm
  WHERE fm.family_id = <table>.family_id
  AND fm.user_id = auth.uid()
)
