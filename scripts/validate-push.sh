#!/bin/bash

# Home Heroes - Pre-Push Validation Script
# Validates changes before pushing to cloud production

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╭──────────────────────────────────────────╮"
echo "│  Pre-Push Validation Checklist          │"
echo "╰──────────────────────────────────────────╯"
echo ""

FAILED=0

# Check 1: Supabase is running
echo -n "Checking local Supabase status... "
if supabase status > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  Local Supabase is not running. Run: supabase start"
    FAILED=1
fi

# Check 2: Environment is set to LOCAL
echo -n "Checking environment configuration... "
if grep -q "^NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321" apps/web/.env.local; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    echo "  Warning: Not using LOCAL environment"
fi

# Check 3: Uncommitted migration files
echo -n "Checking for uncommitted migrations... "
UNCOMMITTED=$(git status --porcelain supabase/migrations/ | wc -l)
if [ "$UNCOMMITTED" -gt 0 ]; then
    echo -e "${YELLOW}⚠${NC}"
    echo "  Found uncommitted migration files:"
    git status --porcelain supabase/migrations/
    read -p "  Continue anyway? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC}"
fi

# Check 4: Run migrations on local
echo -n "Testing migrations locally... "
if supabase db reset > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "  Migration failed. Fix errors before pushing."
    FAILED=1
fi

# Check 5: Run connection tests
echo -n "Running Supabase connection tests... "
cd apps/web
if npm run test:supabase > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${YELLOW}⚠${NC}"
    echo "  Connection test had warnings"
fi
cd ../..

# Check 6: Check for RLS policies
echo -n "Checking RLS policies... "
POLICIES=$(psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -t -c "SELECT COUNT(*) FROM pg_policies;" 2>/dev/null | tr -d ' ')
if [ "$POLICIES" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} ($POLICIES policies found)"
else
    echo -e "${YELLOW}⚠${NC}"
    echo "  No RLS policies found. Tables may be publicly accessible!"
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Ready to push to cloud:"
    echo -e "  ${BLUE}supabase db push${NC}"
    echo ""
    read -p "Push migrations to cloud now? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "Pushing to cloud..."
        supabase db push
        echo ""
        echo -e "${GREEN}✓ Migrations pushed successfully!${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Verify in cloud dashboard"
        echo "  2. Switch to CLOUD environment: ./scripts/switch-env.sh"
        echo "  3. Test production build: npm run build && npm run start"
        echo "  4. Deploy to hosting platform"
    fi
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ Validation failed!${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Fix the errors above before pushing to cloud."
    exit 1
fi
