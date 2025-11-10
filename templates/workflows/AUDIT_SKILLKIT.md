# Audit SkillKit - Complete System Health Check

**Purpose:** Comprehensive audit of SkillKit installation for duplicates, broken commands, incorrect workflows, and system integrity

---

## 🔍 What This Does

Performs a complete health check of your SkillKit installation:
1. ✓ Checks for duplicate workflows
2. ✓ **Detects customized files and update conflicts**
3. ✓ **Checks for deprecated workflows/skills**
4. ✓ **Handles non-linear version updates (skipped versions)**
5. ✓ Validates workflow structure and syntax
6. ✓ Tests all commands in workflows
7. ✓ Verifies skills installation
8. ✓ Checks subtask references
9. ✓ Validates file integrity
10. ✓ Tests environment compatibility
11. ✓ Generates detailed audit report

**Result:** Comprehensive audit document with actionable recommendations

---

## 📋 Phase 1: Run Audit

```bash
tsk audit

# What it does:
# → Scans all workflows
# → Tests all commands
# → Checks for duplicates
# → Validates structure
# → Tests environment
# → Generates audit report
```

**Wait for completion:** This may take 1-2 minutes for full audit.

---

## 📄 Phase 2: Review Audit Report

**Location:** `docs/audit/audit-report-YYYY-MM-DD.md`

**Report sections:**
1. **Executive Summary** - Overall health score
2. **Critical Issues** - Must fix immediately
3. **Warnings** - Should fix soon
4. **Recommendations** - Nice to have
5. **Details** - Full findings

**Read the report:**
```bash
# View in terminal
cat docs/audit/audit-report-latest.md

# Or open in editor
# File will be shown after audit completes
```

---

## 🔧 Phase 3: Auto-Fix (Safe Issues)

After reviewing, apply safe automatic fixes:

```bash
tsk audit:fix --auto-safe

# What it fixes automatically:
# ✓ Duplicate workflows (keeps canonical)
# ✓ Trailing whitespace
# ✓ Missing newlines at EOF
# ✓ Incorrect file permissions
# ✓ Broken symlinks
# ✓ Empty files
```

**Note:** Only applies fixes that are 100% safe and reversible.

---

## 🎯 Phase 4: Manual Fixes (Review Required)

For issues requiring human judgment:

**The audit report includes:**
- **What's wrong** - Clear description
- **Why it matters** - Impact explanation
- **How to fix** - Step-by-step instructions
- **Priority** - Critical/Warning/Info

**Example from report:**
```markdown
### Issue #3: Broken Command Reference
**File:** `.cursor/commands/IMPLEMENT_FEATURE.md`
**Line:** 45
**Problem:** References non-existent subtask: `@docs/workflows/subtasks/deploy.md`
**Impact:** Workflow will fail when reaching this step
**Priority:** ⚠️ WARNING

**Fix:**
1. Create missing subtask: docs/workflows/subtasks/deploy.md
   OR
2. Update reference to existing subtask: deploy-check.md

**Suggested action:**
tsk workflow:create-subtask deploy
```

**Apply fixes manually as you review each issue.**

---

## 🔄 Phase 5: Verify Fixes

After applying fixes, run audit again:

```bash
tsk audit --verify

# Output:
# ✓ Re-running audit...
# ✓ Previous issues: 12
# ✓ Current issues: 2
# ✓ Fixed: 10
# 
# Remaining issues:
# - Issue #7: Custom workflow needs updating
# - Issue #9: Legacy command can be removed
```

---

## 📊 Audit Categories

### **1. Duplicate Detection**
- Duplicate workflow files (case variations)
- Duplicate subtasks
- Conflicting command names
- Redundant skills

### **1.5. Customization & Update Detection** ⭐ NEW
- **Customized workflows/skills** - Files modified by user
- **Update conflicts** - Files that failed to update due to customizations
- **Skipped versions** - Non-linear updates (e.g., 0.0.1 → 0.0.5)
- **Breaking changes** - Major version updates with potential incompatibilities
- **Deprecated items** - Old workflows/skills that should be updated

### **2. Workflow Structure Validation**
- Valid Markdown syntax
- Proper headers (# title)
- Code blocks properly formatted
- Subtask references valid (@path)
- No broken links

### **3. Command Testing**
- All bash commands are valid
- Package manager commands work
- File paths exist
- Required tools installed
- Environment variables set

### **4. Skills Verification**
- OpenSkills installed
- Anthropic skills present
- SKILL.md files valid
- No corrupted skills
- Catalog up-to-date

### **5. Subtask Integrity**
- All referenced subtasks exist
- No circular references
- Subtask syntax valid
- Terminal-aware commands correct

### **6. Environment Compatibility**
- Package manager detected
- Project structure valid
- Required tools available
- Cross-platform commands work
- Shell compatibility verified

---

## 🚨 Common Issues Found

### **Issue: Duplicate Workflows**
```
❌ Found: BEGIN_SESSION.md, begin-session.md
✓ Fix: tsk dedupe-workflows --force
```

### **Issue: Broken Command**
```
❌ Found: npm test (but project uses pnpm)
✓ Fix: /META_CUSTOMIZE (re-customize)
```

### **Issue: Missing Subtask**
```
❌ Found: Reference to non-existent @docs/workflows/subtasks/backup.md
✓ Fix: Create subtask or remove reference
```

### **Issue: Invalid Skill Reference**
```
❌ Found: tsk skill:load nonexistent-skill
✓ Fix: Install skill or update reference
```

### **Issue: Outdated AGENTS.md**
```
❌ Found: AGENTS.md missing 3 new workflows
✓ Fix: tsk sync
```

### **Issue: Customized Files Blocking Updates** ⭐ NEW
```
⚠️  Found: 3 customized workflows detected
   - BEGIN_SESSION.md (customized on 2025-11-05)
   - IMPLEMENT_FEATURE.md (customized on 2025-11-07)
   - FIX_BUGS.md (customized on 2025-11-08)

Current version: 0.0.5
Your workflows: 0.0.3

✓ Fix: Run /META_CUSTOMIZE to consolidate versions
   Options:
   1. Keep customizations (no update)
   2. Update to standard (lose customizations)
   3. Merge versions (consolidate changes)
```

### **Issue: Skipped Versions** ⭐ NEW
```
⚠️  Found: Skipped versions detected
   Installed: 0.0.1
   Current: 0.0.5
   Skipped: 0.0.2, 0.0.3, 0.0.4

⚠️  Breaking changes may exist

✓ Fix: Review CHANGELOG.md for breaking changes
   Consider incremental updates if possible
```

---

## 🎯 Audit Scoring

**Health Score:** 0-100

- **90-100:** ✅ Excellent - No issues
- **75-89:** ✅ Good - Minor issues only
- **60-74:** ⚠️ Fair - Several warnings
- **40-59:** ⚠️ Poor - Critical issues exist
- **0-39:** 🚨 Critical - Immediate action required

**The audit report shows your score and breakdown.**

---

## 📝 Audit Report Format

```markdown
# SkillKit Audit Report
**Date:** 2025-11-07
**Duration:** 47 seconds
**Health Score:** 82/100 ✅ Good

## Executive Summary
- Total workflows: 5
- Total subtasks: 20
- Total skills: 15
- Issues found: 4 (0 critical, 3 warnings, 1 info)

## Critical Issues (0)
None found! 🎉

## Warnings (3)

### W-001: Duplicate Workflow Files
**Severity:** WARNING
**Files:** begin-session.md (duplicate of BEGIN_SESSION.md)
**Impact:** May confuse Cursor command selection
**Fix:** `tsk dedupe-workflows --force`

### W-002: Outdated Package Manager Command
**Severity:** WARNING
**File:** IMPLEMENT_FEATURE.md, line 23
**Command:** `npm test`
**Detected:** Project uses pnpm
**Impact:** Command will fail
**Fix:** Run `/META_CUSTOMIZE` to update all commands

### W-003: Missing Subtask Reference
**Severity:** WARNING
**File:** FIX_BUGS.md, line 45
**Reference:** @docs/workflows/subtasks/rollback-changes.md
**Impact:** Subtask exists but path incorrect
**Fix:** Update to: @docs/workflows/subtasks/rollback.md

## Recommendations (1)

### R-001: Add Error Handling
**File:** deploy-prep.md
**Suggestion:** Add error handling for build failures
**Priority:** Low
**Benefit:** More robust deployments

## Detailed Findings

[Full technical details of each issue...]

## Auto-Fix Available
3 issues can be auto-fixed safely.
Run: `tsk audit:fix --auto-safe`

## Next Steps
1. Review warnings above
2. Apply auto-fixes: `tsk audit:fix --auto-safe`
3. Fix W-002: Run `/META_CUSTOMIZE`
4. Fix W-003: Update subtask path
5. Re-run audit: `tsk audit --verify`
```

---

## 🔧 Manual Audit Checklist

If you prefer manual review:

### **Workflow Files:**
- [ ] No duplicate files in `.cursor/commands/`
- [ ] All files use UPPERCASE naming convention
- [ ] No legacy/unused workflows
- [ ] All have proper headers and structure

### **Command Validity:**
- [ ] All bash commands execute successfully
- [ ] Package manager commands match detected PM
- [ ] File paths are correct
- [ ] No hardcoded absolute paths

### **Subtask References:**
- [ ] All @references point to existing files
- [ ] Paths are correct and consistent
- [ ] No circular references
- [ ] Subtasks follow naming convention

### **Skills Integration:**
- [ ] OpenSkills is installed
- [ ] Anthropic skills are present
- [ ] AGENTS.md is up-to-date
- [ ] `tsk skill:load` works for all skills

### **Environment:**
- [ ] Package manager detected correctly
- [ ] Project structure recognized
- [ ] All required tools installed
- [ ] Cross-platform compatibility verified

---

## 🔄 Scheduled Audits

**Recommendation:** Run audit periodically

**When to audit:**
- After installing new workflows/skills
- After major project changes
- Weekly for active projects
- Before important deployments
- When workflows behave unexpectedly

**Quick check:**
```bash
tsk audit --quick

# Fast scan (30 seconds):
# → Duplicates only
# → Basic validation
# → Critical issues
```

---

## 💡 Best Practices

### **Before Making Changes:**
1. Run audit to establish baseline
2. Note current health score
3. Make changes
4. Run audit again
5. Verify health score maintained or improved

### **After Installing Community Content:**
```bash
tsk workflows:add user/repo

# Then immediately:
tsk audit --quick

# Verify new workflows are valid
```

### **Regular Maintenance:**
```bash
# Weekly quick audit
tsk audit --quick

# Monthly full audit
tsk audit

# After any issues found
tsk audit:fix --auto-safe
tsk audit --verify
```

---

## 🆘 If Audit Fails

**If the audit command itself fails:**

```bash
# 1. Check SkillKit installation
tsk --version

# 2. Verify directories exist
ls .cursor/commands/
ls docs/workflows/subtasks/

# 3. Re-initialize if needed
tsk init --cursor

# 4. Try audit again
tsk audit
```

**If you get permission errors:**
```bash
# Check file permissions
ls -la .cursor/commands/

# Fix if needed (Mac/Linux)
chmod -R u+rw .cursor/

# Windows: Run terminal as administrator
```

---

## 📚 Audit Report History

**All audits are saved:**
```
docs/audit/
├── audit-report-2025-11-07.md
├── audit-report-2025-11-06.md
├── audit-report-2025-11-05.md
└── audit-report-latest.md → (symlink to most recent)
```

**Compare over time:**
```bash
# View trend
tsk audit:history

# Output:
# Date        Score  Issues  Status
# 2025-11-07  82     4       ✅ Good
# 2025-11-06  75     8       ⚠️ Fair
# 2025-11-05  68     12      ⚠️ Fair
#
# Trend: ⬆️ Improving
```

---

## 🎯 Expected Outcome

**After running AUDIT_SKILLKIT:**

1. ✅ **Detailed report generated** - Know exactly what's wrong
2. ✅ **Prioritized issues** - Fix critical items first
3. ✅ **Actionable steps** - Clear instructions for each fix
4. ✅ **Auto-fix available** - Safe fixes applied automatically
5. ✅ **Health score** - Track improvements over time
6. ✅ **Clean system** - All workflows working correctly

**Result:** Confidence that SkillKit is working optimally! 🚀

---

## 🔗 Related Commands

```
/META_CUSTOMIZE         → Re-customize workflows to project
tsk dedupe-workflows    → Remove duplicates only
tsk sync                → Regenerate AGENTS.md
tsk verify              → Quick installation check
```

---

**Run now:** `tsk audit`

**Total Lines:** 50 (audit workflow guidance)

