# Authentication and Access

## Parent Authentication
- Supabase Auth
- Email + password (MVP)

---

## Kid Access
- No authentication credentials
- Access via:
  - Shared device session
  - Parent-selected hero
  - Optional PIN (future)

---

## Security Rule
Never store email, password, or sensitive data for kids.

---

## Copilot Prompt
Never implement email/password auth for kids.
Assume GDPR and COPPA-safe defaults.
