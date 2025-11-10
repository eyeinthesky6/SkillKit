# Publishing Setup Guide

**Date:** 10-11-2025  
**npm Org:** `trinity-os` ✅ (You have this!)  
**Package Name:** `@trinity-os/skillkit`

---

## ✅ **Current Status**

### npm Organization
- ✅ **Org exists:** `trinity-os`
- ✅ **Package name:** `@trinity-os/skillkit` (matches org)
- ✅ **You can publish** to this org

### GitHub Repository
- **Current:** `eyeinthesky6/SkillKit` (personal account)
- **Option 1:** Keep as personal account (works fine)
- **Option 2:** Create GitHub org `trinity-os` and transfer repo

---

## 📦 **npm Publishing Setup**

### Step 1: Verify You're a Member

You're viewing the org members page, so you're likely already a member. To verify:

1. **Check via web:** https://www.npmjs.com/settings/trinity-os/members
   - You should see your username listed
   - If not, add yourself as a member

2. **Check via CLI** (after logging in):
   ```bash
   npm org ls trinity-os
   ```

### Step 2: Login to npm Locally

```bash
npm login
# Enter your npm username, password, and email
```

### Step 3: Verify Access

```bash
npm whoami  # Should show your username
npm org ls trinity-os  # Should list org members
```

### Step 4: Publish

```bash
# Make sure you're in the project directory
cd C:\Projects\SkillKit

# Build first
pnpm build

# Publish (public access for open source)
npm publish --access public
```

**Note:** First publish might require `--access public` flag. After that, npm remembers the setting.

---

## 🏢 **GitHub Organization (Optional)**

### Current Setup
- **Repo:** `eyeinthesky6/SkillKit`
- **Works fine** for open source
- **No org needed** unless you want:
  - Multiple maintainers with equal permissions
  - Professional branding (`trinity-os/SkillKit`)
  - Project independence from personal account

### Option 1: Keep Personal Account (Simplest)
- ✅ No setup needed
- ✅ Works perfectly for open source
- ✅ Can add collaborators as needed
- ✅ Can migrate to org later if needed

### Option 2: Create GitHub Org `trinity-os` (More Professional)

**Steps:**
1. Go to: https://github.com/organizations/new
2. Create org: `trinity-os`
3. Transfer repo:
   - Go to repo Settings → Transfer ownership
   - Transfer to `trinity-os` org
4. Update package.json repository URL:
   ```json
   {
     "repository": {
       "url": "https://github.com/trinity-os/SkillKit.git"
     }
   }
   ```

**Benefits:**
- More professional appearance
- Better for team collaboration
- Project not tied to personal account

**Trade-off:**
- Takes 5-10 minutes to set up
- Not required for launch

---

## ✅ **What Apps Will Be Published Where?**

### npm (Package Registry)
- ✅ **Package:** `@trinity-os/skillkit`
- ✅ **Published to:** npm registry under `@trinity-os` scope
- ✅ **Installable via:** `npm install @trinity-os/skillkit`
- ✅ **You have org:** Yes, `trinity-os` exists

### GitHub (Source Code)
- **Current:** `eyeinthesky6/SkillKit`
- **Can stay:** Personal account (works fine)
- **Can migrate:** To `trinity-os/SkillKit` org (optional)

### Other Apps/Projects
If you create other projects under the `trinity-os` brand:

**npm:**
- `@trinity-os/skillkit` ✅ (this project)
- `@trinity-os/other-app` (future projects)
- All under same org scope

**GitHub:**
- `eyeinthesky6/SkillKit` (current)
- `trinity-os/SkillKit` (if you create org)
- `trinity-os/other-app` (future projects)

---

## 🎯 **Recommendation**

### For Launch (v0.0.1):

**npm:**
- ✅ **Use:** `@trinity-os/skillkit` (you have the org!)
- ✅ **Publish to:** npm registry under `@trinity-os` scope
- ✅ **Ready to go:** Just need to login and publish

**GitHub:**
- ✅ **Keep:** `eyeinthesky6/SkillKit` (personal account)
- ✅ **Works fine:** No org needed for launch
- ⚠️ **Optional:** Create `trinity-os` GitHub org later if you want

**Why:**
- npm org already exists ✅
- GitHub org is optional (nice-to-have, not required)
- Can migrate GitHub repo later if needed
- Focus on launching, polish later

---

## 📋 **Pre-Publish Checklist**

### npm
- [ ] Verify you're logged in: `npm whoami`
- [ ] Verify org membership: `npm org ls trinity-os`
- [ ] Build project: `pnpm build`
- [ ] Test package locally: `npm pack` (creates .tgz file)
- [ ] Check package.json version: `0.0.1`
- [ ] Publish: `npm publish --access public`

### GitHub
- [ ] Repo is public (or make it public)
- [ ] All code pushed to `main` branch
- [ ] Create release tag: `git tag v0.0.1`
- [ ] Push tag: `git push origin v0.0.1`
- [ ] Create GitHub release (optional, via web UI)

---

## 🚀 **Publishing Commands**

```bash
# 1. Login to npm (if not already)
npm login

# 2. Verify access
npm whoami
npm org ls trinity-os

# 3. Build
pnpm build

# 4. Test package (optional)
npm pack
# This creates a .tgz file you can inspect

# 5. Publish
npm publish --access public

# 6. Verify it's published
npm view @trinity-os/skillkit
```

---

## 🔍 **Troubleshooting**

### "You don't have permission to publish"
- **Fix:** Make sure you're a member of `trinity-os` org
- **Check:** https://www.npmjs.com/settings/trinity-os/members
- **Add yourself:** If not listed, add your username

### "Package name already exists"
- **Fix:** Either unpublish old version or use different version number
- **Check:** `npm view @trinity-os/skillkit` to see existing versions

### "ENEEDAUTH" error
- **Fix:** Run `npm login` first
- **Verify:** `npm whoami` should show your username

---

## ✅ **Summary**

**npm:**
- ✅ Org `trinity-os` exists
- ✅ Package `@trinity-os/skillkit` ready
- ✅ Just need to login and publish

**GitHub:**
- ✅ Repo `eyeinthesky6/SkillKit` works fine
- ⚠️ Optional: Create `trinity-os` GitHub org later

**Answer to Your Question:**
> "So apps related to this project will be published in this org in github and npm?"

**npm:** ✅ YES - `@trinity-os/skillkit` will be published under `trinity-os` org  
**GitHub:** ⚠️ OPTIONAL - Can keep personal account or create `trinity-os` org

---

**Last Updated:** 10-11-2025

