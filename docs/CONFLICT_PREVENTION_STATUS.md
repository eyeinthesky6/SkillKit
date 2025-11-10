# Conflict Prevention - Current Status

**Date:** 07-11-2025  
**Status:** ✅ COMPLETE - Full conflict detection system implemented

---

## ✅ **WHAT WE HAVE NOW**

### **1. Duplicate File Detection** ✅

**Multiple layers:**

**In `tsk init`:**
- Auto-detects and removes duplicate workflow files
- Keeps UPPERCASE canonical versions
- Runs automatically on initialization

**In `tsk dedupe-workflows`:**
- Manual command to remove duplicates
- Dry-run mode for preview
- Force mode for auto-fix

**In `tsk audit`:**
- Checks for duplicate workflow files
- Reports as warnings
- Auto-fixable

**In `tsk workflows:add`:**
- Checks if workflow file already exists
- Requires `--force` to overwrite
- Prevents accidental overwrites

**Status:** ✅ Complete

---

### **2. Workflow Validation Command** ✅ NEW!

**Command:** `tsk validate-workflow <workflow-file>`

**Checks:**
1. ✅ File structure (headers, empty files)
2. ✅ Subtask references (all @references valid)
3. ✅ Skill references (all `tsk skill:load` skills exist)
4. ✅ Duplicate workflow names (case variations)
5. ✅ Similar workflow names (warnings)
6. ✅ Skill duplication patterns (warns if workflow duplicates skill functionality)

**Usage:**
```bash
# Validate before saving:
tsk validate-workflow .cursor/commands/MY_WORKFLOW.md

# Output:
# ✓ Errors: 0
# ✓ Warnings: 2
#   - Referenced skill not installed: pdf
#   - Workflow mentions "pdf" but doesn't reference pdf skill
```

**Status:** ✅ Complete

---

### **3. Agent Guidance in META_WORKFLOW_TEMPLATE** ✅ UPDATED!

**Added comprehensive conflict prevention:**

**Step 3.5: Check for Conflicts**
- Check existing workflows
- Check existing skills
- Validate skill references
- Check subtask references
- Semantic conflict check

**Step 3.6: Conflict Resolution**
- Extend existing workflows
- Use skills instead of duplicating
- Rename/clarify distinctions
- Document when both needed

**Step 3.7: Validation Checklist**
- 7-point checklist before proceeding
- Ensures no conflicts before creation

**Step 7: Validate Command**
- References `tsk validate-workflow`
- Run before testing
- Fix errors first

**Status:** ✅ Complete

---

### **4. Skill Reference Validation** ✅ NEW!

**In `tsk validate-workflow`:**
- Extracts all `tsk skill:load` references
- Checks if skills are installed (`tsk list`)
- Warns about missing skills
- Suggests installation commands

**Example:**
```bash
tsk validate-workflow MY_WORKFLOW.md

# Output:
⚠️  Warnings:
1. Referenced skill not installed: pdf
   Fix: tsk install anthropics/skills (select pdf)
```

**Status:** ✅ Complete

---

### **5. Semantic Conflict Detection** ✅ NEW!

**In `tsk validate-workflow`:**
- Checks for similar workflow names
- Warns about potential confusion
- Detects skill duplication patterns
- Suggests using skills instead

**Example:**
```bash
tsk validate-workflow EXTRACT_PDF.md

# Output:
⚠️  Warnings:
1. Workflow mentions "pdf" but doesn't reference pdf skill
   Fix: Consider using skill: tsk skill:load pdf instead of duplicating functionality
```

**Status:** ✅ Complete

---

## 📊 **COMPLETE FEATURE MATRIX**

| Feature | Status | Location |
|---------|--------|----------|
| Duplicate file detection | ✅ Complete | `tsk dedupe-workflows`, `tsk init`, `tsk audit` |
| File conflict detection | ✅ Complete | `tsk workflows:add` |
| Workflow validation | ✅ Complete | `tsk validate-workflow` NEW! |
| Subtask reference validation | ✅ Complete | `tsk validate-workflow` |
| Skill reference validation | ✅ Complete | `tsk validate-workflow` NEW! |
| Semantic conflict detection | ✅ Complete | `tsk validate-workflow` NEW! |
| Skill duplication detection | ✅ Complete | `tsk validate-workflow` NEW! |
| Agent guidance | ✅ Complete | `META_WORKFLOW_TEMPLATE` UPDATED! |

---

## 🎯 **HOW AGENTS USE IT**

### **When Creating Workflows:**

**Step 1:** Follow META_WORKFLOW_TEMPLATE
- Step 3.5: Check for conflicts (manual checks)
- Step 3.7: Validation checklist

**Step 2:** After creating workflow file
```bash
tsk validate-workflow .cursor/commands/MY_WORKFLOW.md
```

**Step 3:** Fix any errors/warnings
- Install missing skills
- Fix broken references
- Resolve conflicts

**Step 4:** Test workflow
- Only after validation passes!

---

### **When Installing Workflows:**

**From GitHub:**
```bash
tsk workflows:add user/repo/WORKFLOW.md

# Automatically:
# ✓ Checks if file exists (requires --force)
# ✓ Downloads and installs
# ✓ No duplicate detection (use tsk validate-workflow after)
```

**After installation:**
```bash
# Validate new workflow:
tsk validate-workflow .cursor/commands/NEW_WORKFLOW.md

# Check for duplicates:
tsk dedupe-workflows --dry-run

# Full audit:
tsk audit
```

---

## 🔍 **CONFLICT DETECTION EXAMPLES**

### **Example 1: Duplicate Skill Functionality**

**Workflow:**
```markdown
# EXTRACT_PDF_TABLES
## Purpose: Extract tables from PDFs
```

**Validation:**
```bash
tsk validate-workflow EXTRACT_PDF_TABLES.md

# Output:
⚠️  Warnings:
1. Workflow mentions "pdf" but doesn't reference pdf skill
   Fix: Consider using skill: tsk skill:load pdf instead of duplicating functionality
```

**Resolution:**
```markdown
# PROCESS_DOCUMENTS
## Purpose: Process various document types

## Phase 3: If PDF needed
tsk skill:load pdf
# Follow pdf skill instructions for table extraction
```

---

### **Example 2: Missing Skill**

**Workflow:**
```markdown
## Phase 2: Load database skill
tsk skill:load database
```

**Validation:**
```bash
tsk validate-workflow MY_WORKFLOW.md

# Output:
⚠️  Warnings:
1. Referenced skill not installed: database
   Fix: tsk install anthropics/skills (select database) or tsk skills:add user/repo/database
```

**Resolution:**
```bash
# Install skill:
tsk skills:add anthropics/skills/database

# Or update workflow to include installation instructions
```

---

### **Example 3: Duplicate Workflow Name**

**Creating:** `fix-bugs.md`  
**Existing:** `FIX_BUGS.md`

**Validation:**
```bash
tsk validate-workflow fix-bugs.md

# Output:
🚨 Errors:
1. Duplicate workflow name: fix-bugs
   Fix: Rename workflow or remove duplicate
```

**Resolution:**
```bash
# Use existing FIX_BUGS.md instead
# OR rename to clarify distinction
```

---

### **Example 4: Similar Workflow Names**

**Creating:** `DEPLOY_STAGING.md`  
**Existing:** `DEPLOY_PREP.md`

**Validation:**
```bash
tsk validate-workflow DEPLOY_STAGING.md

# Output:
⚠️  Warnings:
1. Similar workflow names exist: DEPLOY_PREP
   Fix: Consider renaming to avoid confusion
```

**Resolution:**
- If different purposes: Document distinction
- If same purpose: Extend existing workflow

---

## 📋 **AGENT WORKFLOW**

### **Complete Process:**

```
1. User: "Create workflow for X"
   ↓
2. Agent: Follows META_WORKFLOW_TEMPLATE
   ↓
3. Agent: Step 3.5 - Checks conflicts manually
   - Lists existing workflows
   - Lists installed skills
   - Checks for semantic conflicts
   ↓
4. Agent: Creates workflow file
   ↓
5. Agent: Runs validation
   tsk validate-workflow NEW_WORKFLOW.md
   ↓
6. Agent: Fixes any errors/warnings
   - Installs missing skills
   - Fixes references
   - Resolves conflicts
   ↓
7. Agent: Re-validates
   tsk validate-workflow NEW_WORKFLOW.md
   ↓
8. Agent: Tests workflow
   /NEW_WORKFLOW
   ↓
9. Agent: Updates AGENTS.md
   tsk sync
   ↓
10. Done! ✅
```

---

## ✅ **SUMMARY**

### **What We Have:**

1. ✅ **Duplicate file detection** - Multiple layers
2. ✅ **File conflict detection** - In workflows:add
3. ✅ **Workflow validation command** - Comprehensive checks
4. ✅ **Skill reference validation** - Checks if skills exist
5. ✅ **Semantic conflict detection** - Warns about duplicates
6. ✅ **Agent guidance** - Complete template with checks

### **How Agents Use It:**

1. ✅ Follow META_WORKFLOW_TEMPLATE (has conflict checks)
2. ✅ Run `tsk validate-workflow` before saving
3. ✅ Fix errors/warnings
4. ✅ Test workflow

### **Result:**

**Agents cannot create conflicting workflows!**

- File conflicts: Detected ✅
- Skill conflicts: Detected ✅
- Semantic conflicts: Detected ✅
- Missing references: Detected ✅

**System is protected!** 🛡️

---

**Status:** ✅ COMPLETE - Full conflict prevention system implemented!

