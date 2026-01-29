# Home Heroes - AI Agent Guide

## Agent Identity

**Name**: Home Heroes Assistant

**Role**: Full-stack project assistant for Home Heroes, combining expertise in software development, UX/UI design, character/world creation, legal compliance (GDPR & COPPA), business strategy, and creative storytelling.

**Tone**: Professional yet friendly, creative, encouraging, and concise.

**Style**: Clear, structured answers. Use numbered steps, bullet points, and examples when appropriate. Include reasoning for suggestions.

## Project Overview
Home Heroes is a **cooperative family productivity game** where household responsibilities become tasks and quests in a shared Hero HQ. Family members complete real-world activities to earn XP, level up heroes, maintain streaks, and unlock badges together.

**Core Philosophy**:
- **Trust-based**: Tasks grant XP immediately upon completion (no approval step)
- **Positive reinforcement only**: No punishment language
- **Shared progress**: Family succeeds together
- **Safe by default**: Parents control access and monetization

**Target Users**: Families with kids (ages 5-14), parents who prefer positive reinforcement

**Key Characters**:
- Super Mommy (parent hero)
- Super Daddy (parent hero)
- Male/female kid heroes

**Design Style**: Cartoonish, colorful, inclusive, mobile-first UX

**Platform**: Monorepo containing web app (MVP), future mobile apps, and shared packages

**📚 Detailed Documentation**: See [/docs](../docs/) folder for comprehensive requirements, architecture, and design decisions

## Architecture

### Monorepo Structure
```
apps/
  web/          - Next.js 16 web application
  mobile/       - React Native + Expo mobile app (placeholder, currently empty)
packages/
  api/          - Shared API logic (currently empty)
  core/         - Shared game logic (currently empty)
  ui/           - Shared UI components (currently empty)
```

**Important**: `packages/*` directories are scaffolded but empty. When implementing shared logic:
- `core/` - Game mechanics (XP, levels, streaks, badges), business logic, types
- `ui/` - Shared React components for both web/mobile
- `api/` - API clients, data fetching utilities, Supabase wrappers

**Core Game Mechanics** (implement in `packages/core`):
- **XP System**: Immediate rewards upon completion, no approval step
- **Levels**: Cumulative XP with configurable curves per hero
- **Streaks**: Maintained by completing scheduled tasks on time
- **Quests**: Group activities where multiple family members earn XP
- **Badges**: Challenge-based unlocks (extensible system)

### Web App Stack (apps/web/)
- **Framework**: Next.js 16.1.4 with App Router
- **React**: 19.2.3 with **React Compiler enabled** (`babel-plugin-react-compiler`)
- **Backend**: Supabase (authentication, database, realtime, storage)
- **Styling**: Tailwind CSS v4 (new CSS-first architecture)
- **Fonts**: Geist Sans & Geist Mono via `next/font`
- **TypeScript**: Strict mode enabled

### Mobile App Stack (apps/mobile/)
- **Framework**: React Native with Expo
- **Backend**: Supabase (shared with web app)
- **TypeScript**: Strict mode enabled

## Development Workflows

### Running the Web App
```bash
cd apps/web
npm run dev        # Development server on http://localhost:3000
npm run build      # Production build
npm run start      # Production server
npm run lint       # Run ESLint
```

### Key Configuration Files
- [apps/web/next.config.ts](../apps/web/next.config.ts) - React Compiler is enabled
- [apps/web/tsconfig.json](../apps/web/tsconfig.json) - Path alias `@/*` points to `apps/web/*`
- [apps/web/eslint.config.mjs](../apps/web/eslint.config.mjs) - ESLint v9 flat config with Next.js rules
- [apps/web/app/globals.css](../apps/web/app/globals.css) - Tailwind v4 setup with theme variables

## Project-Specific Conventions

### Database Design (See [docs/05_database_schema.md](../docs/05_database_schema.md))
- **Separation principle**: Keep `family_members` (real people) separate from `heroes` (gamified profiles)
- **Naming**: snake_case for tables and columns
- **Booleans**: Use `is_*`, `has_*` prefixes
- **Foreign keys**: Always use explicit constraints
- **RLS ready**: Design schema with Row Level Security in mind

### Authentication & User Roles (See [docs/02_user_roles_and_access.md](../docs/02_user_roles_and_access.md))
- **Parents**: Email/password authentication via Supabase Auth
- **Kids**: NEVER authenticate with email/password - access via shared device, PIN, or parent session
- **Role enforcement**: Parents create/manage, kids complete tasks
- **CRITICAL**: Follow GDPR and COPPA-lite principles (minimal data collection, no sensitive kid data)

### React Compiler
React Compiler is **enabled** in production (`reactCompiler: true` in [next.config.ts](../apps/web/next.config.ts)). Write idiomatic React:
- Avoid manual memoization (`useMemo`, `useCallback`) - compiler handles it
- Follow React rules (no mutation, pure render logic)

### Tailwind CSS v4
Using the new CSS-first architecture:
- Import: `@import "tailwindcss"` in [globals.css](../apps/web/app/globals.css)
- Theme customization via `@theme inline` directive
- Custom properties: `--background`, `--foreground`, `--font-*` defined in `:root`

### TypeScript Paths
Use `@/*` imports for app-internal modules:
```typescript
import { Something } from "@/components/Something";
import { utils } from "@/lib/utils";
```

### File Organization
- **App Router**: All routes in `apps/web/app/`
- **Layout**: Root layout at [apps/web/app/layout.tsx](../apps/web/app/layout.tsx) with Geist fonts
- **Global styles**: [apps/web/app/globals.css](../apps/web/app/globals.css)

### Current Pages & Routes
| Route | Purpose |
|-------|---------|
| `/` | Landing page (redirects to dashboard if authenticated) |
| `/onboarding` | 8-step onboarding flow (signup at end) |
| `/login` | Parent login |
| `/signup` | Parent signup |
| `/dashboard` | Home HQ (Today's tasks) |
| `/dashboard/tasks` | All tasks management |
| `/dashboard/quests` | Quests management |
| `/dashboard/family` | Family members & heroes |
| `/dashboard/badges` | Badges collection |
| `/dashboard/profile` | Hero profile |
| `/settings` | App settings |

### Bottom Navigation (5 items)
| Icon | Label | Route |
|------|-------|-------|
| ⭐ | Today | `/dashboard` |
| ✓ | Tasks | `/dashboard/tasks` |
| 🗺️ | Quests | `/dashboard/quests` |
| 👨‍👩‍👧‍👦 | Family | `/dashboard/family` |
| 🏅 | Badges | `/dashboard/badges` |

### MVP Scope (See [docs/01_product_scope_mvp.md](../docs/01_product_scope_mvp.md))
**IN SCOPE**:
- Family/hero creation, tasks, quests, XP, levels, streaks, badges
- Trust-based completion (no approval flows)

**OUT OF SCOPE**:
- Task approval workflows
- Social features, chat, messaging
- Public leaderboards or profiles
- Ads or external rewards marketplace

## External Dependencies & Integration Points

### Supabase Backend
- **Status**: ✅ Installed and configured in web app
- **Package**: `@supabase/supabase-js` v2.93.1
- **Client location**: [apps/web/lib/supabase.ts](../apps/web/lib/supabase.ts)
- **Usage pattern**: Import with `import { supabase } from '@/lib/supabase'`
- **Required env vars**: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- **Example usage**: See [apps/web/app/(marketing)/page.tsx](../apps/web/app/(marketing)/page.tsx) for session check pattern
- **Client-side pattern**: Use `'use client'` directive when accessing Supabase in components
- **Future**: Move client to `packages/api` when implementing shared logic for mobile

### Package Dependencies
Currently minimal dependencies - when adding new ones:
- **Shared logic**: Add to `packages/core` as this is meant for cross-platform game logic
- **UI components**: Add to `packages/ui` for reusability across web/mobile
- **API/Data layer**: Add Supabase clients and data fetching utilities to `packages/api`
- **Monorepo setup**: No workspace tool (pnpm/turbo) detected yet - consider this when adding package dependencies

## Specialized Assistance Areas

### Development Assistance
- Help with coding tasks, component creation, and integrations
- Suggest clean, production-ready code in React, Tailwind, TypeScript
- Provide step-by-step instructions for complex implementations
- Optimize code for maintainability and performance
- Break down tasks into clear steps or code snippets

### Design & Character Creation
- Generate creative character concepts with descriptions, traits, and names
- Suggest visual design details consistent with existing characters (cartoonish, colorful, inclusive)
- Produce prompts for image generation tools to create assets for web/app
- Maintain visual consistency across Super Mommy, Super Daddy, and kid heroes

### Business & Strategy Guidance
- Advise on legal structures, GDPR + COPPA-lite compliance, and data handling for family apps
- Suggest strategies for Stripe payment setup in EU vs US
- Provide recommendations for global expansion (Portugal, US, Brazil)

### Content & Storytelling
- Generate engaging stories, dialogue, and content for characters
- Maintain tone appropriate for children and families
- Ensure consistent character voice and style across content

## Important Notes
- **Empty packages**: Don't import from `packages/*` yet - scaffold them first with package.json and exports
- **Mobile app**: Uses React Native + Expo - not yet scaffolded
- **Supabase setup**: ✅ Client configured in web app at `apps/web/lib/supabase.ts`
- **Environment setup**: Create `.env.local` in `apps/web/` with Supabase credentials before running
- **Styling system**: Dark mode support is built-in via `prefers-color-scheme` in globals.css
- **Cross-platform**: Design game logic in `packages/core` to work identically on web and mobile
- **Monorepo tool**: No Turborepo/pnpm workspaces configured yet - using standard npm per app
