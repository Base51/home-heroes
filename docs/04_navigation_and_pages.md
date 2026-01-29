# Navigation and Pages

## Route Groups
The app uses Next.js route groups to organize pages:

```
app/
├── (marketing)/           # Public marketing pages
│   ├── layout.tsx         # Marketing header/footer
│   ├── page.tsx           # Landing page (/)
│   ├── features/          # /features
│   └── pricing/           # /pricing
│
├── login/                 # /login
├── signup/                # /signup
├── onboarding/            # /onboarding (8-step flow)
├── settings/              # /settings
│
└── dashboard/             # Authenticated app
    ├── page.tsx           # /dashboard (Today)
    ├── tasks/             # /dashboard/tasks
    ├── quests/            # /dashboard/quests
    ├── family/            # /dashboard/family
    ├── badges/            # /dashboard/badges
    └── profile/           # /dashboard/profile
```

---

## Marketing Pages
| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Hero, features, how it works, CTA |
| `/features` | Features | Detailed feature breakdown by category |
| `/pricing` | Pricing | Free + paid plans, FAQ |

---

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
