# Publishing Steps - v0.0.1

**Date:** 10-11-2025  
**Package:** `@trinity-os/skillkit`  
**Version:** `0.0.1`

---

## ✅ **Pre-Publish Checklist**

- ✅ Build succeeds: `pnpm build`
- ⏳ npm login: Need to login
- ⏳ Verify org access: Check `trinity-os` org membership
- ⏳ Create git tag: `v0.0.1`
- ⏳ Publish to npm

---

## 🚀 **Publishing Steps**

### Step 1: Login to npm

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- OTP (if 2FA enabled)

### Step 2: Verify Access

```bash
npm whoami  # Should show your username
npm org ls trinity-os  # Should list org members (including you)
```

### Step 3: Verify Package

```bash
# Check if package already exists
npm view @trinity-os/skillkit

# If it exists, check versions
npm view @trinity-os/skillkit versions
```

### Step 4: Create Git Tag

```bash
git tag v0.0.1
git push origin v0.0.1
```

### Step 5: Publish

```bash
# Make sure you're in project root
cd C:\Projects\SkillKit

# Build (already done, but double-check)
pnpm build

# Publish (first time needs --access public)
npm publish --access public
```

### Step 6: Verify Publication

```bash
npm view @trinity-os/skillkit
npm view @trinity-os/skillkit version  # Should show 0.0.1
```

---

## 🎯 **Expected Output**

### Successful Publish:
```
npm notice Publishing to https://registry.npmjs.org/
+ @trinity-os/skillkit@0.0.1
```

### Verify Installation:
```bash
npm install -g @trinity-os/skillkit
tsk --version  # Should show 0.0.1
```

---

## ⚠️ **Troubleshooting**

### "You don't have permission"
- **Fix:** Make sure you're a member of `trinity-os` org
- **Check:** https://www.npmjs.com/settings/trinity-os/members

### "Package name already exists"
- **Fix:** Check existing versions: `npm view @trinity-os/skillkit versions`
- **If v0.0.1 exists:** Bump version or unpublish old version

### "ENEEDAUTH"
- **Fix:** Run `npm login` first

---

**Ready when you are!**

