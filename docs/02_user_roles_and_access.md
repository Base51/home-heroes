# User Roles and Access

## Roles

### Parent (Guardian)
- Authenticated via email/password
- Creates and manages the family
- Creates tasks and quests
- Manages monetization
- Views all hero progress

### Kid (Hero)
- No email or password
- Access via shared device, PIN, or parent session
- Completes tasks and quests
- Earns XP, levels, streaks, badges

---

## Key Rule
Kids NEVER authenticate independently using email/password.

---

## Access Control Summary

| Action | Parent | Kid |
|------|-------|-----|
| Create family | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Complete tasks | ✅ | ✅ |
| Manage subscription | ✅ | ❌ |
| View analytics | ✅ | ❌ |

---

## Copilot Prompt
Always enforce role-based access.
Never assume kids can authenticate directly.