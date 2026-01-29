# Home Heroes — RDP (Requirements & Design Plan)

## 1. Purpose of This Document

This Requirements & Design Plan (RDP) defines:
- Functional requirements
- Non-functional requirements
- High-level system design
- UX and interaction rules
- Constraints and assumptions

This document serves as:
- A shared understanding between product and engineering
- A guiding reference for AI-assisted development (Copilot)
- A guardrail against scope creep

---

## 2. Product Summary

Home Heroes is a family-focused, gamified task and quest application where household responsibilities are transformed into cooperative gameplay.

The system supports:
- Individual tasks
- Group quests
- XP, levels, streaks
- Badges and achievements
- Shared family progress

The MVP emphasizes trust, simplicity, and daily engagement.

---

## 3. Functional Requirements

### 3.1 Family Management
- A parent can create a family
- A family can have multiple members
- Each family member has a role (parent or kid)
- Each family member has a linked hero profile

---

### 3.2 Authentication & Access
- Parents authenticate via email/password
- Kids do not authenticate via email/password
- Kids access the app via:
  - Parent-selected hero
  - Shared device session
  - Optional PIN (future)

---

### 3.3 Hero Profiles
Each hero must have:
- Name
- Avatar (preset in MVP)
- Level
- Total XP
- Current streak
- Badge collection

Heroes can belong to:
- Kids
- Parents (parents can also play)

---

### 3.4 Tasks
- Tasks are created by parents
- Tasks can be:
  - One-time
  - Daily
  - Weekly
- Tasks have:
  - Title
  - Optional description
  - Base XP value
- Tasks can be assigned to one or more heroes
- Completing a task grants XP immediately (trust-based)

---

### 3.5 Quests (Group Activities)
- Quests are family-wide or multi-hero activities
- Multiple heroes can participate
- Each participant earns XP upon completion
- Quests can be recurring or one-time

---

### 3.6 XP and Levels
- XP is awarded immediately upon completion
- XP contributes to hero level progression
- Level curves must be configurable
- XP logic must support future multipliers and boosts

---

### 3.7 Streaks
- Streaks are maintained by completing scheduled tasks
- Missing a scheduled task breaks the streak
- Streak multipliers affect XP gain
- Streaks reset gracefully (no punishment language)

---

### 3.8 Badges & Achievements
- Badges are unlocked automatically based on conditions
- Badge examples:
  - First task completed
  - 7-day streak
  - First group quest
- Badge system must be extensible
- Badges are visual rewards only in MVP

---

### 3.9 Home HQ Dashboard
The Home HQ Dashboard must display:
- Family emblem with level badge
- Family XP progress bar
- Family member avatars with streak indicators
- Today's tasks (from database, up to 5)
- Task completion buttons with instant XP reward
- Family streak summary

---

### 3.10 Navigation
Required pages:
- Home HQ Dashboard (Today)
- Tasks Page
- Quests Page
- Family Page
- Badges Page
- Profile Page
- Settings Page

Bottom Navigation (5 items):
| Icon | Label | Route |
|------|-------|-------|
| ⭐ | Today | `/dashboard` |
| ✓ | Tasks | `/dashboard/tasks` |
| 🗺️ | Quests | `/dashboard/quests` |
| 👨‍👩‍👧‍👦 | Family | `/dashboard/family` |
| 🏅 | Badges | `/dashboard/badges` |

Navigation must be:
- Mobile-first
- Simple
- Shallow (no deep nesting)

---

### 3.11 Onboarding Flow
The onboarding flow has 8 steps (signup at the END):

1. **Launch** - Welcome screen with branding
2. **Hero** - Choose parent hero type (Super Mommy/Daddy) and name
3. **Task** - Create first task from suggestions
4. **Complete** - Simulate completing the task
5. **Reward** - Show XP reward animation
6. **Family** - Optionally add kids
7. **Signup** - Create account (email/password)
8. **Dashboard** - Tour of main features

Key principles:
- Let users experience the app BEFORE creating an account
- Pending data (hero, task, kids) is saved after signup
- Default daily tasks are created automatically

---

## 4. Non-Functional Requirements

### 4.1 Performance
- App must load dashboard in under 2 seconds on mobile
- Task completion must feel instant

---

### 4.2 Scalability
- Support multiple families per parent (future)
- Support analytics and reporting
- Support monetization without refactoring core logic

---

### 4.3 Security
- Parents control all sensitive operations
- No sensitive personal data stored for kids
- Role-based access enforced at database level (RLS)

---

### 4.4 Compliance
- GDPR-aligned by default
- COPPA-lite approach
- Data minimization is mandatory

---

## 5. System Design (High-Level)

### 5.1 Architecture
- Client: Web (mobile-first)
- Backend: Supabase
- Auth: Supabase Auth (parents only)
- Database: PostgreSQL
- Notifications: Event-based (future)

---

### 5.2 Data Model Principles
- Separate real people from game entities
- Avoid polymorphic chaos
- Prefer explicit relations
- Design for observability and analytics

---

## 6. UX & Interaction Rules

- No punishment language
- Always celebrate progress
- Never shame missed tasks
- Always show a “next action”
- Avoid empty states without guidance

---

## 7. Constraints & Assumptions

### Constraints
- MVP must be simple
- No approval flows
- No social features
- No ads

### Assumptions
- Parent trust is sufficient for MVP
- Shared devices are common
- Parents want visibility, not control micromanagement

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|----|-----------|
| Kids gaming the system | Trust-based MVP + future notifications |
| Scope creep | Strict MVP scope docs |
| Over-complex auth | Parent-only authentication |

---

## 9. Future Considerations (Out of Scope)
- Push notifications
- AI-generated tasks
- Seasonal events
- Multi-family dashboards
- School integration

---

## 10. Copilot Master Prompt

When assisting with this project:
- Follow the Home Heroes RDP strictly
- Prioritize clarity and simplicity
- Never introduce approval or punishment mechanics
- Always assume kid-safe defaults
- Ask for clarification if requirements are unclear