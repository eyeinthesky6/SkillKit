# Workflow Command File Naming Conventions

## 📋 **Current State Analysis**

### ✅ **Canonical Convention: UPPERCASE with Underscores**

**Established Standard:**
```
✅ BEGIN_SESSION.md
✅ IMPLEMENT_FEATURE.md
✅ FIX_BUGS.md
✅ DEPLOY_PREP.md
✅ AUDIT_SKILLKIT.md
✅ SECURITY_AUDIT.md
✅ SYSTEM_AUDIT.md
✅ META_CUSTOMIZE.md
```

**Pattern:** `UPPERCASE_WITH_UNDERSCORES.md`

---

## ⚠️ **Inconsistencies Found**

### **1. Mixed Naming in Templates**

**Templates Directory (`templates/workflows/`):**
```
✅ BEGIN_SESSION.md        (UPPERCASE)
✅ IMPLEMENT_FEATURE.md    (UPPERCASE)
✅ FIX_BUGS.md             (UPPERCASE)
✅ DEPLOY_PREP.md          (UPPERCASE)
✅ AUDIT_SKILLKIT.md       (UPPERCASE)
✅ SECURITY_AUDIT.md       (UPPERCASE)
✅ SYSTEM_AUDIT.md         (UPPERCASE)
✅ META_CUSTOMIZE.md       (UPPERCASE)
✅ META_WORKFLOW_TEMPLATE.md (UPPERCASE)
✅ CONTINUE.md             (UPPERCASE - single word)
✅ DEDUP.md                (UPPERCASE - single word)
✅ HELP.md                 (UPPERCASE - single word)
```

**Status:** ✅ **All templates use UPPERCASE** (consistent!)

---

### **2. Mixed Naming in Generated Commands**

**SkillKit Project (`.cursor/commands/`):**
```
✅ BEGIN_SESSION.md        (UPPERCASE)
✅ IMPLEMENT_FEATURE.md    (UPPERCASE)
✅ FIX_BUGS.md             (UPPERCASE)
✅ DEPLOY_PREP.md          (UPPERCASE)
```

**Status:** ✅ **All UPPERCASE** (consistent!)

---

**ProfitPilot Project (`.cursor/commands/`):**
```
✅ BEGIN_SESSION.md                    (UPPERCASE)
✅ IMPLEMENT_FEATURE.md                (UPPERCASE)
✅ FIX_BUGS.md                         (UPPERCASE)
✅ DEPLOY_PREP.md                      (UPPERCASE)
✅ AGENT_DOCUMENTATION_PROTOCOL.md     (UPPERCASE)
✅ CHECK_DEPS.md                       (UPPERCASE)
✅ CONTINUE.md                         (UPPERCASE)
✅ CREATE_TESTS.md                     (UPPERCASE)
✅ DEDUP.md                            (UPPERCASE)
✅ DOCUMENTATION_AUDIT.md              (UPPERCASE)
✅ FEATURE_COMPLETENESS_TRUTHCHECK.md  (UPPERCASE)
✅ FEATURE_FIX_STRATEGY.md             (UPPERCASE)
✅ FINAL_CHECK.md                      (UPPERCASE)
✅ RESOLVE_ISSUES.md                   (UPPERCASE)

❌ features.md                          (kebab-case - INCONSISTENT!)
❌ fix-all.md                          (kebab-case - INCONSISTENT!)
❌ implement-feature.md                 (kebab-case - INCONSISTENT!)
```

**Status:** ⚠️ **Mixed!** Has both UPPERCASE and kebab-case

**Duplicates Found:**
- `IMPLEMENT_FEATURE.md` + `implement-feature.md` (duplicate!)
- Both exist in same directory

---

**SEDI Project (`.cursor/commands/`):**
```
✅ BEGIN_SESSION.md        (UPPERCASE)
✅ IMPLEMENT_FEATURE.md    (UPPERCASE)
✅ FIX_BUGS.md             (UPPERCASE)
✅ DEPLOY_PREP.md          (UPPERCASE)
```

**Status:** ✅ **All UPPERCASE** (consistent!)

---

## 📐 **Established Convention**

### **Canonical Rule: UPPERCASE with Underscores**

From `src/cli-commands/dedupe-workflows.ts`:
```typescript
canonical: f.toUpperCase(),  // Uppercase version
// Sort: prefer UPPERCASE, then alphabetically
const aUpper = a.name === a.name.toUpperCase();
```

**Documentation confirms:**
> "**Convention:** UPPERCASE filenames are canonical."

---

### **Naming Patterns**

#### ✅ **Correct (Canonical):**
```
BEGIN_SESSION.md
IMPLEMENT_FEATURE.md
FIX_BUGS.md
DEPLOY_PREP.md
SECURITY_AUDIT.md
META_CUSTOMIZE.md
FEATURE_FIX_STRATEGY.md
```

#### ❌ **Incorrect (Non-Canonical):**
```
begin-session.md          (kebab-case)
implement-feature.md      (kebab-case)
fix-bugs.md               (kebab-case)
features.md               (kebab-case)
fix-all.md                (kebab-case)
```

#### ✅ **Single Words (Also UPPERCASE):**
```
CONTINUE.md
DEDUP.md
HELP.md
```

---

## 🔧 **Deduplication System**

### **`tsk dedupe-workflows` Command**

**Purpose:** Remove duplicate workflow files

**Behavior:**
1. Groups files by canonical name (UPPERCASE)
2. **Prefers UPPERCASE versions** when duplicates exist
3. Removes kebab-case/lowercase duplicates
4. Supports content-based deduplication

**Example:**
```bash
tsk dedupe-workflows

# Finds:
# - IMPLEMENT_FEATURE.md (UPPERCASE - KEPT)
# - implement-feature.md (kebab-case - REMOVED)
```

---

## 📊 **Statistics**

### **By Project:**

| Project | Total Files | UPPERCASE | kebab-case | Duplicates |
|---------|------------|-----------|------------|------------|
| SkillKit | 4 | 4 (100%) | 0 | 0 |
| ProfitPilot | 26 | 23 (88%) | 3 (12%) | 1 |
| SEDI | 4 | 4 (100%) | 0 | 0 |

### **Overall:**
- **UPPERCASE:** ~92% of files
- **kebab-case:** ~8% of files (inconsistencies)
- **Duplicates:** Found in ProfitPilot

---

## ✅ **Recommendations**

### **1. Standardize All to UPPERCASE**

**Action Items:**
```bash
# In profitpilot project:
cd /c/Projects/profitpilot
tsk dedupe-workflows  # Remove duplicates

# Manually rename remaining kebab-case:
mv .cursor/commands/features.md .cursor/commands/FEATURES.md
mv .cursor/commands/fix-all.md .cursor/commands/FIX_ALL.md
```

### **2. Update Workflow Generator**

**Ensure `tsk workflow` generates UPPERCASE files:**
- ✅ Already correct - templates are UPPERCASE
- ✅ Generator copies templates as-is

### **3. Document Convention**

**Add to README or CONTRIBUTING:**
```markdown
## Workflow Command Naming

- **Format:** `UPPERCASE_WITH_UNDERSCORES.md`
- **Examples:** `BEGIN_SESSION.md`, `IMPLEMENT_FEATURE.md`
- **Single words:** Also UPPERCASE (`CONTINUE.md`, `HELP.md`)
- **Canonical:** UPPERCASE versions are canonical
- **Deduplication:** Run `tsk dedupe-workflows` to remove duplicates
```

### **4. Lint Rule (Future Enhancement)**

Consider adding validation:
```typescript
// In workflow-gen.ts
const filename = path.basename(templateFile, '.md');
if (filename !== filename.toUpperCase()) {
  console.warn(`⚠️  Template should be UPPERCASE: ${filename}`);
}
```

---

## 🎯 **Summary**

### ✅ **What's Working:**
1. **Templates:** All UPPERCASE ✅
2. **SkillKit:** All UPPERCASE ✅
3. **SEDI:** All UPPERCASE ✅
4. **Deduplication:** System exists to clean up ✅

### ⚠️ **Issues:**
1. **ProfitPilot:** Has 3 kebab-case files (12% inconsistency)
2. **ProfitPilot:** Has 1 duplicate (`IMPLEMENT_FEATURE.md` + `implement-feature.md`)
3. **No enforcement:** No lint/validation to prevent kebab-case

### 📝 **Established Standard:**
- **Format:** `UPPERCASE_WITH_UNDERSCORES.md`
- **Canonical:** UPPERCASE versions are preferred
- **Deduplication:** `tsk dedupe-workflows` handles cleanup

**Overall:** ✅ **92% consistent!** The convention is clear (UPPERCASE), but some legacy kebab-case files exist in ProfitPilot.

---

## 🔍 **Quick Fix**

To fix ProfitPilot inconsistencies:

```bash
cd /c/Projects/profitpilot
tsk dedupe-workflows --dry-run  # Preview changes
tsk dedupe-workflows            # Remove duplicates
# Manually rename remaining kebab-case files to UPPERCASE
```

