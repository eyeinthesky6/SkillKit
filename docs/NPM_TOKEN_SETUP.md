# npm Token Setup for Publishing

**Date:** 10-11-2025  
**Package:** `@trinity-os/skillkit` (org-scoped)

---

## 🔍 **Do You Need a Token?**

### **Short Answer: Usually NO if logged in**

When you run `npm login`, npm automatically stores an authentication token. However, for **org-scoped packages** like `@trinity-os/skillkit`, you might need to verify:

1. ✅ You're logged in (`npm whoami` works)
2. ✅ You're a member of the org (`npm org ls trinity-os` shows you)
3. ✅ You have publish permissions in the org

---

## ✅ **Current Status Check**

### Check 1: Are you logged in?
```bash
npm whoami
```
**Expected:** Your username (e.g., `sixideas`)

### Check 2: Do you have a token?
```bash
npm config get //registry.npmjs.org/:_authToken
```
**Expected:** A long token string (if present)

### Check 3: Are you in the org?
```bash
npm org ls trinity-os
```
**Expected:** Your username listed (e.g., `sixideas - owner`)

---

## 🔧 **If Token is Missing**

### Option 1: Login Again (Creates Token)
```bash
npm login
```
This will create and store a token automatically.

### Option 2: Create Access Token Manually

1. **Go to:** https://www.npmjs.com/settings/sixideas/tokens
2. **Click:** "Generate New Token"
3. **Select:** "Automation" or "Publish" token type
4. **Copy** the token
5. **Set it:**
   ```bash
   npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN_HERE
   ```

---

## ⚠️ **For Org-Scoped Packages**

### Special Requirements:

1. **Org Membership:**
   - You must be a member of `trinity-os` org
   - Check: `npm org ls trinity-os`

2. **Publish Permissions:**
   - You need "publish" permission in the org
   - Check org settings: https://www.npmjs.com/settings/trinity-os/members

3. **First Publish:**
   - First publish of org-scoped package might require explicit permission
   - Or you might need to be an "owner" of the org

---

## 🚀 **Try Publishing**

If you're logged in and in the org, try:

```bash
npm publish --access public
```

**If it fails, check:**
- Error message (might say "permission denied" or "not authorized")
- Org membership status
- Token validity

---

## 📋 **Common Issues**

### "403 Forbidden" or "You don't have permission"
- **Fix:** Verify org membership and publish permissions
- **Check:** https://www.npmjs.com/settings/trinity-os/members

### "401 Unauthorized"
- **Fix:** Login again: `npm login`
- **Or:** Set token manually

### "Package name already exists"
- **Fix:** Check if package exists: `npm view @trinity-os/skillkit`
- **If exists:** Update version or unpublish old version

---

## ✅ **Quick Test**

Run these commands to verify everything:

```bash
# 1. Check login
npm whoami

# 2. Check org
npm org ls trinity-os

# 3. Try publish
npm publish --access public
```

---

**Last Updated:** 10-11-2025

