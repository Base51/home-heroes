#!/bin/bash

# Home Heroes - Development Environment Switcher
# Quickly switch between LOCAL and CLOUD Supabase environments

set -e

ENV_FILE="apps/web/.env.local"
BACKUP_FILE="apps/web/.env.local.backup"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "╭──────────────────────────────────────────╮"
echo "│  Home Heroes - Environment Switcher      │"
echo "╰──────────────────────────────────────────╯"
echo ""

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: $ENV_FILE not found${NC}"
    exit 1
fi

# Detect current environment
if grep -q "^NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321" "$ENV_FILE"; then
    CURRENT="LOCAL"
else
    CURRENT="CLOUD"
fi

echo -e "Current environment: ${BLUE}$CURRENT${NC}"
echo ""
echo "Select target environment:"
echo "  1) LOCAL  - http://127.0.0.1:54321"
echo "  2) CLOUD  - https://xlprgglrbrbikpghcpwr.supabase.co"
echo "  3) Cancel"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        TARGET="LOCAL"
        ;;
    2)
        TARGET="CLOUD"
        ;;
    3)
        echo "Cancelled"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

if [ "$CURRENT" = "$TARGET" ]; then
    echo -e "${YELLOW}Already using $TARGET environment${NC}"
    exit 0
fi

echo ""
echo -e "${YELLOW}Switching to $TARGET environment...${NC}"

# Backup current env file
cp "$ENV_FILE" "$BACKUP_FILE"

# Switch environment
if [ "$TARGET" = "LOCAL" ]; then
    # Comment CLOUD, uncomment LOCAL
    sed -i.tmp 's/^NEXT_PUBLIC_SUPABASE_URL=https:/# NEXT_PUBLIC_SUPABASE_URL=https:/g' "$ENV_FILE"
    sed -i.tmp 's/^NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ/# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ/g' "$ENV_FILE"
    sed -i.tmp 's/^# NEXT_PUBLIC_SUPABASE_URL=http:\/\/127.0.0.1/NEXT_PUBLIC_SUPABASE_URL=http:\/\/127.0.0.1/g' "$ENV_FILE"
    sed -i.tmp 's/^# NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable/NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable/g' "$ENV_FILE"
else
    # Comment LOCAL, uncomment CLOUD
    sed -i.tmp 's/^NEXT_PUBLIC_SUPABASE_URL=http:\/\/127.0.0.1/# NEXT_PUBLIC_SUPABASE_URL=http:\/\/127.0.0.1/g' "$ENV_FILE"
    sed -i.tmp 's/^NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable/# NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable/g' "$ENV_FILE"
    sed -i.tmp 's/^# NEXT_PUBLIC_SUPABASE_URL=https:/NEXT_PUBLIC_SUPABASE_URL=https:/g' "$ENV_FILE"
    sed -i.tmp 's/^# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ/NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ/g' "$ENV_FILE"
fi

# Remove sed backup file
rm -f "$ENV_FILE.tmp"

echo -e "${GREEN}✓ Switched to $TARGET environment${NC}"
echo ""

# Show current config
echo "Active configuration:"
grep "^NEXT_PUBLIC_SUPABASE_URL=" "$ENV_FILE"
echo ""

echo -e "${YELLOW}Important:${NC} Restart your dev server for changes to take effect:"
echo "  npm run dev"
echo ""
