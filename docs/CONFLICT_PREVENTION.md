# Conflict Prevention System - Current Status

**Date:** 07-11-2025  
**Purpose:** Prevent workflows from conflicting or duplicating skills

---

## ✅ **WHAT WE ALREADY HAVE**

### **1. Duplicate Workflow File Detection** ✅

**Location:** Multiple places

**In `tsk init`:**
- Auto-detects duplicate workflow files (case variations)
- Removes duplicates automatically
- Keeps UPPERCASE canonical versions

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

---

### **2. Workflow File Conflict Detection** ✅

**When installing workflows:**
```bash
tsk workflows:add user/repo/WORKFLOW.md

# Checks:
✓ File already exists? → Warns, requires --force
✓ Duplicate name? → Detected by dedupe system
```

**Status:** ✅ File-level conflicts detected

---

## ⚠️ **WHAT'S MISSING**

### **1. Semantic Conflict Detection** ❌

**Problem:** No check if workflow duplicates skill functionality

**Example:**
```
Workflow: /EXTRACT_PDF_TABLES
Skill:    pdf (has table extraction)

Conflict: Workflow duplicates skill functionality!
```

**Current:** No detection

---

### **2. Skill Name Conflict Detection** ❌

**Problem:** No check if workflow references non-existent skills

**Example:**
```
Workflow references: tsk skill:load nonexistent-skill
Skill doesn't exist:  ❌

Conflict: Workflow will fail!
```

**Current:** No validation

---

### **3. Workflow Purpose Conflict Detection** ❌

**Problem:** No check if new workflow duplicates existing workflow purpose

**Example:**
```
Existing: /FIX_BUGS
New:      /DEBUG_ISSUES

Conflict: Same purpose, different names!
```

**Current:** No detection

---

### **4. Agent Guidance in META_WORKFLOW_TEMPLATE** ⚠️

**Current:** Template mentions checking subtasks, but not skills

**Missing:** Instructions to:
- Check if skill already exists for this purpose
- Avoid duplicating skill functionality
- Validate skill references

---

## 🛠️ **SOLUTION: Add Conflict Detection**

### **Phase 1: Validation Command**

**Create:** `tsk validate-workflow <workflow-file>`

**Checks:**
1. ✅ File exists
2. ✅ Valid Markdown structure
3. ✅ References valid subtasks
4. ❌ **NEW:** References valid skills
5. ❌ **NEW:** Doesn't duplicate skill functionality
6. ❌ **NEW:** Doesn't conflict with existing workflows

---

### **Phase 2: Update META_WORKFLOW_TEMPLATE**

**Add conflict prevention steps:**

```markdown
## Step 3.5: Check for Skill Conflicts

**Before creating workflow, check:**

1. **Does a skill already do this?**
   ```bash
   tsk list
   # Check if any skill covers your workflow's purpose
   ```

2. **If skill exists:**
   - ✅ Use skill instead of creating workflow
   - ✅ Reference skill in workflow: `tsk skill:load <skill-name>`
   - ❌ Don't duplicate skill functionality

3. **If no skill exists:**
   - ✅ Create workflow
   - ✅ Consider creating skill if it's domain expertise

**Example:**
- ❌ Bad: Workflow "Extract PDF tables" (pdf skill exists!)
- ✅ Good: Workflow "Process Documents" → Uses pdf skill
```

---

### **Phase 3: Auto-Validation**

**In `tsk workflows:add`:**
- After download, validate workflow
- Check skill references
- Warn about conflicts
- Ask for confirmation

**In `META_WORKFLOW_TEMPLATE`:**
- Auto-run validation after creation
- Show conflicts before saving
- Suggest fixes

---

## 📋 **IMPLEMENTATION PLAN**

### **Priority 1: Agent Guidance (Quick)**

**Update META_WORKFLOW_TEMPLATE:**
- Add skill conflict check step
- Add validation checklist
- Add examples of conflicts

**Time:** 30 minutes

---

### **Priority 2: Validation Command (Medium)**

**Create `tsk validate-workflow`:**
- Check file structure
- Validate subtask references
- Validate skill references
- Check for semantic conflicts

**Time:** 2 hours

---

### **Priority 3: Auto-Validation (Nice-to-Have)**

**Integrate into workflows:add:**
- Auto-validate after download
- Show conflicts
- Require confirmation

**Time:** 1 hour

---

## 🎯 **RECOMMENDED APPROACH**

### **Immediate (Do Now):**

1. **Update META_WORKFLOW_TEMPLATE** with conflict checks
2. **Add validation checklist** to workflow creation
3. **Document conflict patterns** for agents

### **Next Release:**

4. **Create `tsk validate-workflow`** command
5. **Add auto-validation** to workflows:add
6. **Add semantic conflict detection**

---

## 📊 **CURRENT STATUS**

| Feature | Status | Location |
|---------|--------|----------|
| Duplicate file detection | ✅ Complete | `tsk dedupe-workflows`, `tsk init`, `tsk audit` |
| File conflict detection | ✅ Complete | `tsk workflows:add` |
| Skill reference validation | ❌ Missing | Need to add |
| Semantic conflict detection | ❌ Missing | Need to add |
| Agent guidance | ⚠️ Partial | META_WORKFLOW_TEMPLATE needs update |

---

## ✅ **ACTION ITEMS**

1. [ ] Update META_WORKFLOW_TEMPLATE with skill conflict checks
2. [ ] Create `tsk validate-workflow` command
3. [ ] Add validation to workflows:add
4. [ ] Document conflict patterns
5. [ ] Add to audit system

---

**Status:** Partial - File conflicts handled, semantic conflicts need work

