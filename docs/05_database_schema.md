# Database Schema Overview

## Core Design Principle
Separate real people from gamified representations.

---

## families
Represents a household.

## family_members
Represents real people (parents and kids).

## heroes
Represents the gamified profile tied to a family member.

This separation allows:
- Multiple heroes per person (future)
- Clean analytics
- Flexible monetization

---

## Additional Tables
- tasks
- quests
- quest_participants
- completions
- xp_logs
- badges
- hero_badges

---

## Copilot Prompt
Preserve separation between family_members and heroes.
Design for scalability and analytics.
