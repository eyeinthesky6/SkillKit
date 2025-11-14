# Customization Detection & Update Conflict Handling - Complete

**Date:** 10-11-2025  
**Purpose:** Enhanced audit and META_CUSTOMIZE to detect customizations and handle update conflicts

---

## ✅ **What Was Added**

### 1. **New Subtask: `check-customizations.md`** ✅

**Location:** `docs/workflows/subtasks/check-customizations.md`

**Purpose:** Comprehensive guide for detecting customized files and handling update conflicts

**Features:**
- ✅ Load version metadata
- ✅ Detect customized workflows/skills
- ✅ Check for available updates
- ✅ Detect update failures
- ✅ Prompt for consolidation
- ✅ Handle non-linear version updates
- ✅ Generate customization report

---

### 2. **Version Checker Utility** ✅

**Location:** `src/utils/version-checker.ts`

**Functions:**
- `getCurrentVersion()` - Get SkillKit version from package.json
- `getInstalledVersion()` - Get installed version from `.skillkit/version.json`
- `getVersionInfo()` - Compare versions and detect skipped versions
- `detectSkippedVersions()` - Detect non-linear updates
- `getCustomizedFiles()` - Get list of customized files
- `isFileCustomized()` - Check if specific file is customized
- `getCustomizationInfo()` - Get customization details for a file

**Features:**
- ✅ Semantic version comparison
- ✅ Skipped version detection
- ✅ Breaking change detection (major version updates)
- ✅ Customization tracking

---

### 3. **Enhanced Audit Command** ✅

**Location:** `src/cli-commands/audit.ts`

**New Checks:**
- ✅ **Customized files detection** - Finds workflows/skills that differ from templates
- ✅ **Update conflicts** - Detects files that failed to update due to customizations
- ✅ **Skipped versions** - Warns about non-linear updates (e.g., 0.0.1 → 0.0.5)
- ✅ **Breaking changes** - Alerts on major version updates
- ✅ **Deprecated items** - Flags very old versions

**Example Audit Output:**
```
⚠️  CUST-BEGIN_SESSION: Customized workflow: BEGIN_SESSION.md
   File: .cursor/commands/BEGIN_SESSION.md
   Impact: File was customized on 11/5/2025. Updates may overwrite customizations.
   Fix: Review customization. Use /META_CUSTOMIZE to consolidate with latest version (0.0.5).

⚠️  CUST-skipped-versions: Skipped versions detected: 0.0.1 → 0.0.5
   Impact: May have breaking changes. Review CHANGELOG.md before updating.
   Fix: Review CHANGELOG.md for versions: 0.0.2, 0.0.3, 0.0.4. Consider incremental updates.

🚨 CUST-breaking-changes: Major version update detected: 0.0.1 → 0.0.5
   Impact: Breaking changes likely. Customized files may be incompatible.
   Fix: Review CHANGELOG.md for breaking changes. Test customized workflows after update.
```

---

### 4. **Enhanced META_CUSTOMIZE Workflow** ✅

**Location:** `templates/workflows/META_CUSTOMIZE.md`

**New Step 0 (CRITICAL):**
- ✅ Check for existing customizations BEFORE customizing
- ✅ Detect update conflicts
- ✅ Prompt user for consolidation strategy
- ✅ Never force update customized files
- ✅ Handle skipped versions

**Agent Instructions Added:**
1. Always check for customizations first using `@docs/workflows/subtasks/check-customizations.md`
2. If customized files found, ask user:
   - Keep customizations?
   - Update to standard?
   - Merge/consolidate versions?
3. Never force update customized files without user confirmation
4. Handle skipped versions by checking CHANGELOG.md

---

### 5. **Enhanced AUDIT_SKILLKIT Workflow** ✅

**Location:** `templates/workflows/AUDIT_SKILLKIT.md`

**New Audit Categories:**
- ✅ **Customization & Update Detection** - Detects customized files and update conflicts
- ✅ **Skipped Versions** - Non-linear updates (e.g., 0.0.1 → 0.0.5)
- ✅ **Breaking Changes** - Major version updates
- ✅ **Deprecated Items** - Old workflows/skills

**New Common Issues:**
- ✅ Customized Files Blocking Updates
- ✅ Skipped Versions

---

## 🎯 **How It Works**

### Detection Flow:

1. **Version Check:**
   ```
   Installed: 0.0.3 (from .skillkit/version.json)
   Current: 0.0.5 (from package.json)
   → Update available!
   ```

2. **Customization Detection:**
   ```
   Compare each workflow with template:
   - BEGIN_SESSION.md: Hash differs → Customized!
   - IMPLEMENT_FEATURE.md: Hash differs → Customized!
   - FIX_BUGS.md: Hash matches → Standard
   ```

3. **Skipped Version Detection:**
   ```
   0.0.3 → 0.0.5
   → Skipped: 0.0.4
   → Check for breaking changes
   ```

4. **Update Conflict Detection:**
   ```
   File differs from template but not in customization list
   → Likely failed to update due to customization
   → Prompt user for consolidation
   ```

---

## 🔄 **Consolidation Flow**

### When Customization Detected:

**Agent Prompt:**
```
⚠️  Customized file detected: BEGIN_SESSION.md

Current version: 0.0.3 (customized)
Available version: 0.0.5 (standard)

Options:
1. Keep customized version (no update)
2. Update to standard version (lose customizations)
3. Merge versions (consolidate changes)
4. Show diff (see what changed)

What would you like to do?
```

### If User Chooses Merge:

1. **Show Diff:**
   ```bash
   diff .cursor/commands/BEGIN_SESSION.md templates/workflows/BEGIN_SESSION.md
   ```

2. **Highlight Conflicts:**
   - Lines that differ
   - New features in standard version
   - User customizations

3. **Create Merged Version:**
   - Combine changes
   - Resolve conflicts with user input
   - Save merged version

4. **Update Metadata:**
   ```json
   {
     "customizations": [{
       "file": ".cursor/commands/BEGIN_SESSION.md",
       "customizedAt": "2025-11-10T...",
       "originalHash": "...",
       "originalVersion": "0.0.5"  // Updated!
     }]
   }
   ```

---

## 📊 **Non-Linear Update Handling**

### Scenario: User Skips Versions

**Example:** User has 0.0.1, updates to 0.0.5

**Detection:**
```typescript
detectSkippedVersions('0.0.1', '0.0.5')
// Returns:
{
  skipped: true,
  skippedVersions: ['0.0.2', '0.0.3', '0.0.4'],
  hasBreakingChanges: false  // Same major version
}
```

**Handling:**
1. ✅ Warn user about skipped versions
2. ✅ Check CHANGELOG.md for breaking changes
3. ✅ Suggest incremental updates if possible
4. ✅ Test customized workflows after update
5. ✅ Preserve customizations during update

---

## 🚨 **Critical Rules**

### **NEVER:**
- ❌ Force update customized files
- ❌ Overwrite without user confirmation
- ❌ Ignore skipped versions
- ❌ Update without checking CHANGELOG

### **ALWAYS:**
- ✅ Check for customizations first
- ✅ Prompt user for consolidation
- ✅ Preserve user customizations
- ✅ Handle skipped versions carefully
- ✅ Check CHANGELOG for breaking changes
- ✅ Create backups before consolidation

---

## 📝 **Agent Workflow**

### When Running Audit:

1. **Run:** `tsk audit`
2. **Check:** Customization issues in report
3. **If found:** Prompt user for consolidation
4. **Never:** Auto-fix customization conflicts

### When Running META_CUSTOMIZE:

1. **First:** Run `@docs/workflows/subtasks/check-customizations.md`
2. **If customizations:** Ask user what to do
3. **If update available:** Check CHANGELOG
4. **If skipped versions:** Warn user
5. **Then:** Proceed with customization

---

## ✅ **Verification**

**Test Scenarios:**
1. ✅ Fresh install (no customizations)
2. ✅ Customized workflows (detected)
3. ✅ Skipped versions (warned)
4. ✅ Breaking changes (alerted)
5. ✅ Update conflicts (prompted)

**All scenarios handled!**

---

**Status:** ✅ Complete! Customization detection and update conflict handling fully implemented!

