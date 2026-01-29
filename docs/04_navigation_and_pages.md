# Navigation and Pages

## Main Pages
- Home HQ Dashboard (Today)
- Tasks Page
- Quests Page
- Family Page
- Badges Page
- Profile Page
- Settings Page
- Onboarding Flow

---

## Bottom Navigation (Mobile)
The bottom navigation bar contains 5 items:

| Icon | Label | Route |
|------|-------|-------|
| ⭐ | Today | `/dashboard` |
| ✓ | Tasks | `/dashboard/tasks` |
| 🗺️ | Quests | `/dashboard/quests` |
| 👨‍👩‍👧‍👦 | Family | `/dashboard/family` |
| 🏅 | Badges | `/dashboard/badges` |

---

## Home HQ Dashboard (Today)
- Family XP bar with level indicator
- Family emblem
- Family member avatars with streaks
- Today's tasks (up to 5, from database)
- Task completion with XP rewards
- Settings link

---

## Onboarding Flow (8 Steps)
1. **Launch** - Welcome screen
2. **Hero** - Choose parent hero type and name
3. **Task** - Create first task
4. **Complete** - Complete the task (demo)
5. **Reward** - See XP reward animation
6. **Family** - Add kids (optional)
7. **Signup** - Create account (email/password)
8. **Dashboard** - Tour of main features

Note: Signup happens at the END so users experience the app first.

---

## Navigation Rules
- Mobile-first
- Bottom navigation on mobile (5 items)
- No deep nesting in MVP
- Profile accessible from header icon
- Settings accessible from dashboard body

---

## Copilot Prompt
Assume a mobile-first UX.
Pages should be modular and independently loadable.
Bottom navigation must always show: Today, Tasks, Quests, Family, Badges.
