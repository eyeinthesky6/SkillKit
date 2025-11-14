# npm Trusted Publishing Setup

**Date:** 10-11-2025  
**Package:** `@trinity-os/skillkit`  
**Method:** GitHub Actions OIDC (OpenID Connect)

---

## ✅ **What is Trusted Publishing?**

Trusted Publishing uses **OIDC (OpenID Connect)** instead of long-lived npm tokens. It's more secure because:
- ✅ No tokens to store or rotate
- ✅ Automatic authentication via GitHub Actions
- ✅ Better security (no token leaks possible)
- ✅ Industry best practice

---

## 🔧 **Setup Steps**

### Step 1: Update GitHub Workflow ✅

The workflow (`.github/workflows/release.yml`) has been updated to:
- ✅ Request `id-token: write` permission (for OIDC)
- ✅ Use `actions/setup-node@v4` with registry URL
- ✅ Publish using OIDC authentication

### Step 2: Configure Trusted Publisher on npm

**You need to do this once on npm's website:**

1. **Go to:** https://www.npmjs.com/settings/trinity-os/packages
   - Or go to your package page: https://www.npmjs.com/package/@trinity-os/skillkit
   - Click "Package Settings" → "Trusted Publishers"

2. **Click:** "Add Trusted Publisher"

3. **Select:** "GitHub Actions"

4. **Fill in:**
   - **GitHub Organization/Username:** `eyeinthesky6`
   - **Repository:** `SkillKit`
   - **Workflow file:** `.github/workflows/release.yml`
   - **Environment name:** (leave blank for default)

5. **Click:** "Add Trusted Publisher"

**Note:** If the package doesn't exist yet, you may need to publish manually first, then add the trusted publisher.

### Step 3: Verify Setup

After adding the trusted publisher:
- ✅ Workflow will automatically authenticate
- ✅ No `NPM_TOKEN` secret needed
- ✅ Publishing happens automatically on tag push

---

## 🚀 **How It Works**

### Current Flow:

1. **You push a tag:** `git tag v0.0.1 && git push origin v0.0.1`
2. **GitHub Actions triggers:** `.github/workflows/release.yml`
3. **Workflow authenticates:** Using OIDC (no token needed)
4. **Package publishes:** `pnpm publish --access public`
5. **Done!** Package is live on npm

### No Manual Steps Needed!

---

## 📋 **Workflow Configuration**

The workflow is configured to:
- ✅ Trigger on tag push (`v*`)
- ✅ Build the project
- ✅ Publish to npm using trusted publishing
- ✅ Create GitHub release

---

## ⚠️ **Important Notes**

### For First Publish:

**Option 1: Use Trusted Publishing (Recommended)**
1. Set up trusted publisher on npm (Step 2 above)
2. Push tag: `git push origin v0.0.1`
3. Workflow publishes automatically

**Option 2: Manual Publish First Time**
- Can still use `npm publish --access public` manually
- Then set up trusted publishing for future releases

### Removing Old Token Method:

If you had `NPM_TOKEN` secret:
- ✅ Can remove it (no longer needed)
- ✅ Trusted publishing replaces it

---

## 🔍 **Verification**

After setting up trusted publishing:

1. **Push a tag:**
   ```bash
   git tag v0.0.1
   git push origin v0.0.1
   ```

2. **Check GitHub Actions:**
   - Go to: https://github.com/eyeinthesky6/SkillKit/actions
   - Should see "Release" workflow running
   - Should complete successfully

3. **Verify on npm:**
   ```bash
   npm view @trinity-os/skillkit
   ```

---

## ✅ **Benefits**

- ✅ **More Secure:** No tokens to manage
- ✅ **Automatic:** Publishes on tag push
- ✅ **Best Practice:** Industry standard
- ✅ **No Secrets:** Nothing to store in GitHub

---

## 📚 **References**

- npm Trusted Publishing: https://docs.npmjs.com/trusted-publishers
- GitHub Actions OIDC: https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect

---

## 🎯 **Next Steps**

1. **Set up trusted publisher** on npm (Step 2 above)
2. **Push tag** to trigger first automated publish
3. **Remove `NPM_TOKEN` secret** (if it exists)

---

**Last Updated:** 10-11-2025

