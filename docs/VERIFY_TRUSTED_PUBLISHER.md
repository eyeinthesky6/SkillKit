# Verify Trusted Publisher Setup

**Date:** 10-11-2025  
**Status:** Verifying configuration

---

## ✅ **Workflow Configuration Check**

### Required Elements:

1. **OIDC Permissions** ✅
   ```yaml
   permissions:
     id-token: write  # Required for OIDC/trusted publishing
     contents: read
   ```

2. **Registry URL** ✅
   ```yaml
   registry-url: 'https://registry.npmjs.org'
   ```

3. **Workflow File** ✅
   - File: `.github/workflows/release.yml`
   - Triggers on: `push: tags: - 'v*'`

---

## 🧪 **Test the Setup**

### Option 1: Test with a Patch Version

Create a test tag to verify publishing works:

```bash
# Update version in package.json to 0.0.2
# Then:
git add package.json
git commit -m "chore: test automated publishing"
git tag v0.0.2
git push origin v0.0.2
```

**Watch:** https://github.com/eyeinthesky6/SkillKit/actions

**Expected:**
- ✅ "Release" workflow runs
- ✅ Builds successfully
- ✅ Publishes to npm automatically
- ✅ Creates GitHub release

### Option 2: Check npm Package Settings

1. Go to: https://www.npmjs.com/package/@trinity-os/skillkit/settings/trusted-publishers
2. Verify you see:
   - ✅ Trusted publisher entry
   - ✅ Shows: `eyeinthesky6/SkillKit` → `.github/workflows/release.yml`
   - ✅ Status: Active

---

## ✅ **Verification Checklist**

- [ ] Workflow file exists: `.github/workflows/release.yml`
- [ ] OIDC permissions configured (`id-token: write`)
- [ ] Registry URL set (`https://registry.npmjs.org`)
- [ ] Trusted publisher added on npm website
- [ ] GitHub username matches: `eyeinthesky6`
- [ ] Repository name matches: `SkillKit`
- [ ] Workflow file path matches: `.github/workflows/release.yml`

---

## 🚀 **Next Steps**

Once verified, future releases are automatic:

```bash
# 1. Update version
# 2. Commit
git commit -m "chore: bump version"

# 3. Tag and push
git tag v0.0.3
git push origin v0.0.3

# 4. Done! GitHub Actions publishes automatically!
```

---

**Last Updated:** 10-11-2025

