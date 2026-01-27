# Test Account Setup - Local Development

## ✅ Test Account Created!

Your test account has been successfully created in LOCAL Supabase.

### 🔑 Test Credentials

```
Email:    test@example.com
Password: password123
```

### 📱 How to Test

1. **Open your app**: http://localhost:3000
2. **Go to login**: http://localhost:3000/login
3. **Sign in** with the credentials above

### 🎯 What Happens Next

When you sign in, you'll be a new authenticated user. Since this user isn't linked to the test family yet, you'll need to:

**Option 1: Create a new family** (Recommended for testing)
- After login, you'll be redirected to `/setup`
- Create a family with your test account
- This will create a complete new family structure

**Option 2: Link to existing test data**
To link the test account to the existing "The Test Family" data, run this in Supabase Studio SQL Editor:

```sql
-- Link test user to existing family
UPDATE family_members 
SET user_id = '22ab57c1-3b6d-4ddf-8a9b-058e1bde15ae'
WHERE id = '22222222-2222-2222-2222-222222222222';
```

### 🗄️ Access Supabase Studio

To manually manage data:
- Open: http://127.0.0.1:54323
- Go to "SQL Editor"
- Run queries directly

### 🔄 Reset Test Account

If you need to start fresh:

```bash
# Delete the test user
curl -X DELETE 'http://127.0.0.1:54321/auth/v1/admin/users/22ab57c1-3b6d-4ddf-8a9b-058e1bde15ae' \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH"

# Reset entire database (clears everything, reloads seed)
cd /Users/intune/Desktop/DEV/home-heroes
npm run db:reset
```

### 📊 Test Data Available

After creating your family, you can test with:
- Creating tasks
- Creating heroes
- Completing tasks
- Earning XP
- Unlocking badges

### 🎮 Testing Workflow

```bash
# 1. Sign in
#    http://localhost:3000/login
#    test@example.com / password123

# 2. Create family
#    Fill out family setup form
#    Create parent and kid heroes

# 3. Test features
#    - Dashboard loads
#    - Can create tasks
#    - Can complete tasks
#    - XP is awarded
#    - Levels increase
```

### ⚠️ Important Notes

- **Email verification is disabled** in local Supabase - instant login
- **This account only exists locally** - not in cloud
- **Data resets** when you run `npm run db:reset`
- **Create new test users** anytime via signup page

### 🔗 Quick Links

- **App**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup (create more test accounts)
- **Studio**: http://127.0.0.1:54323
- **Mailpit**: http://127.0.0.1:54324 (email testing)

---

## 🚀 Ready to Test!

Your local environment is fully set up. Sign in and start testing your app! 

**Next Steps:**
1. Open http://localhost:3000/login
2. Sign in with test@example.com / password123
3. Complete family setup
4. Start developing!
