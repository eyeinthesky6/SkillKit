# Setup Trusted Publisher - Step by Step

**Date:** 10-11-2025  
**Package:** `@trinity-os/skillkit`  
**Status:** Ready to configure

---

## 🎯 **Goal**

Set up automated publishing so you never need to `npm login` again!

---

## 📋 **Step-by-Step Instructions**

### Step 1: Go to Package Page

**URL:** https://www.npmjs.com/package/@trinity-os/skillkit

Or navigate:
1. Go to: https://www.npmjs.com
2. Search for: `@trinity-os/skillkit`
3. Click on the package

### Step 2: Access Package Settings

1. **Click:** "Package Settings" button (top right, next to "Unpublish")
2. **Or:** Go directly to: https://www.npmjs.com/package/@trinity-os/skillkit/settings

### Step 3: Navigate to Trusted Publishers

1. In the left sidebar, click: **"Trusted Publishers"**
2. **Or:** Go directly to: https://www.npmjs.com/package/@trinity-os/skillkit/settings/trusted-publishers

### Step 4: Add Trusted Publisher

1. **Click:** "Add Trusted Publisher" button (blue button)
2. **Select:** "GitHub Actions" (radio button)
3. **Fill in the form:**
   - **GitHub Organization/Username:** `eyeinthesky6`
   - **Repository:** `SkillKit`
   - **Workflow file:** `.github/workflows/release.yml`
   - **Environment name:** (leave blank - optional)
4. **Click:** "Add Trusted Publisher" (green button)

### Step 5: Verify

You should see:
- ✅ A new trusted publisher entry
- ✅ Shows: `eyeinthesky6/SkillKit` → `.github/workflows/release.yml`
- ✅ Status: Active

---

## ✅ **After Setup**

### Test Automated Publishing

1. **Update version** in `package.json`:
   ```json
   {
     "version": "0.0.2"
   }
   ```

2. **Commit and tag:**
   ```bash
   git add package.json
   git commit -m "chore: bump to 0.0.2"
   git tag v0.0.2
   git push origin v0.0.2
   ```

3. **Watch GitHub Actions:**
   - Go to: https://github.com/eyeinthesky6/SkillKit/actions
   - Should see "Release" workflow running
   - Should publish automatically to npm!

---

## 🎉 **Benefits**

After setup:
- ✅ No more `npm login`
- ✅ No more manual publishing
- ✅ Just push tags → auto-publish
- ✅ Fully automated releases

---

## 🔗 **Direct Links**

- **Package:** https://www.npmjs.com/package/@trinity-os/skillkit
- **Package Settings:** https://www.npmjs.com/package/@trinity-os/skillkit/settings
- **Trusted Publishers:** https://www.npmjs.com/package/@trinity-os/skillkit/settings/trusted-publishers

---

**Last Updated:** 10-11-2025

