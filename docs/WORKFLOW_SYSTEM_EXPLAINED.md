# SkillKit Workflow System Explained

**Date:** 07-11-2025  
**Purpose:** Clarify how workflows, CLI commands, and skills work together

---

## 🤔 The Confusion (Valid Question!)

**User asked:**
> "what happened to other workflows? like dedupe, test? etc are they now run via skills? how will user deliver those instructions? i dont see workflows for many tasks in commands folder?"

**Great catch!** Let me explain the complete system.

---

## 🏗️ The Three-Tier System

### **Tier 1: CLI Commands (Direct Execution)**
**Location:** Built into `tsk` CLI  
**Purpose:** Direct system operations

```bash
# These are COMMANDS, not workflows:
tsk dedupe-workflows        # Remove duplicate workflow files
tsk audit                   # Run system audit
tsk audit:fix              # Auto-fix issues
tsk diagnose               # Run diagnostics
tsk install                # Install skills
tsk sync                   # Regenerate AGENTS.md
tsk skill:load             # Load a skill
tsk skills:add             # Install community skill
tsk workflows:add          # Install community workflow
```

**How users access:** Type the command directly in terminal OR AI agent runs it.

---

### **Tier 2: Workflow Commands (Guided Procedures)**
**Location:** `.cursor/commands/` (for Cursor)  
**Purpose:** Multi-step guided workflows for AI agents

**Currently in `.cursor/commands/`:**
```
/BEGIN_SESSION          → Start development session
/IMPLEMENT_FEATURE      → Build new feature
/FIX_BUGS              → Fix bugs systematically
/DEPLOY_PREP           → Pre-deployment checks
/AUDIT_SKILLKIT        → Comprehensive audit
/HELP                  → System help
```

**Available in `templates/workflows/` (not yet copied):**
```
CONTINUE.md            → Resume from last session
DEDUP.md              → Find duplicate code
META_CUSTOMIZE.md     → Customize workflows
META_WORKFLOW_TEMPLATE.md → Create new workflows
SECURITY_AUDIT.md     → Security check
SYSTEM_AUDIT.md       → Legacy system audit
```

**How users access:** Type `/WORKFLOW_NAME` in Cursor.

---

### **Tier 3: Subtasks (Building Blocks)**
**Location:** `docs/workflows/subtasks/`  
**Purpose:** Reusable components referenced by workflows

```
load-skill.md
run-diagnostics.md
analyze-errors.md
run-tests.md
commit-changes.md
audit-system.md
... (20+ subtasks)
```

**How workflows use them:**
```markdown
# In a workflow:

## Step 5: Run Tests
@docs/workflows/subtasks/run-tests.md
```

**Users don't call these directly!** Workflows reference them.

---

## 🔑 Key Distinction

### **CLI Commands vs Workflows:**

**CLI Commands:**
- **Direct execution** - No AI interpretation needed
- **Specific action** - Do one thing well
- **Examples:** `tsk dedupe-workflows`, `tsk audit`
- **User access:** Terminal command or AI runs it

**Workflows:**
- **Multi-step procedure** - AI agent guides execution
- **Complex process** - Multiple steps with decisions
- **Examples:** `/IMPLEMENT_FEATURE`, `/FIX_BUGS`
- **User access:** `/command` in Cursor

---

## 📊 Complete Mapping

### **Deduplication:**

**CLI Command:** `tsk dedupe-workflows`
```bash
# Direct execution
tsk dedupe-workflows --dry-run
tsk dedupe-workflows --force
```

**Workflow:** `DEDUP.md` (code duplicate detection - different!)
```
/DEDUP
→ Finds duplicate CODE in your project
→ Uses jscpd, pylint, pmd
→ Suggests refactoring
```

**These are DIFFERENT:**
- `tsk dedupe-workflows` → Remove duplicate WORKFLOW files
- `/DEDUP` → Find duplicate CODE in your project

---

### **Auditing:**

**CLI Command:** `tsk audit`
```bash
# SkillKit system audit
tsk audit
tsk audit:fix --auto-safe
```

**Workflow:** `/AUDIT_SKILLKIT`
```
/AUDIT_SKILLKIT
→ Guides user through audit process
→ Explains results
→ Gets confirmation for fixes
→ Multi-step procedure
```

**Relationship:**
- **Workflow** guides the process
- **CLI command** does the work
- **Workflow** interprets results for user

---

### **Testing:**

**CLI Command:** None (uses package manager)
```bash
# AI runs:
npm test
# OR
pnpm test
# OR
python -m pytest
```

**Subtask:** `run-tests.md`
```markdown
# Subtask that workflows reference
@docs/workflows/subtasks/run-tests.md

# Detects package manager
# Runs appropriate test command
# Parses results
```

**Workflow:** Part of `/IMPLEMENT_FEATURE`, `/FIX_BUGS`, etc.
```
/IMPLEMENT_FEATURE
  → Step 5: Run Tests
    @docs/workflows/subtasks/run-tests.md
```

**No separate `/TEST` workflow** - Testing is part of other workflows!

---

## 🎯 Design Philosophy

### **Why Not a Workflow for Everything?**

**Too many workflows = confusion!**

Instead:
1. **Core workflows** (5-7) - Main development procedures
2. **CLI commands** - Direct actions
3. **Subtasks** - Reusable components

**Current Core Workflows:**
```
/BEGIN_SESSION       → Start here
/IMPLEMENT_FEATURE   → Build features
/FIX_BUGS           → Fix issues
/DEPLOY_PREP        → Pre-deploy
/AUDIT_SKILLKIT     → System health
/HELP               → Get help
```

**Everything else:** CLI commands or subtasks!

---

## 🔧 What Should Be Added to `.cursor/commands/`?

### **Already There (6):**
✅ BEGIN_SESSION  
✅ IMPLEMENT_FEATURE  
✅ FIX_BUGS  
✅ DEPLOY_PREP  
✅ AUDIT_SKILLKIT  
✅ HELP  

### **Should Add (4):**
📋 CONTINUE - Resume work  
📋 META_CUSTOMIZE - Customize workflows  
📋 META_WORKFLOW_TEMPLATE - Create new workflow  
📋 REVIEW_SKILLKIT - Review & improve  

### **Consider Adding (2):**
🤔 DEDUP - Find code duplicates  
🤔 SECURITY_AUDIT - Security checks  

### **Don't Need as Workflows:**
❌ ~~SYSTEM_AUDIT~~ - Use `/AUDIT_SKILLKIT` instead  
❌ ~~Testing~~ - Part of other workflows  
❌ ~~Dedup workflows~~ - Use `tsk dedupe-workflows` CLI  

---

## 📝 Recommended Action

### **Add Missing Essential Workflows:**

1. **CONTINUE.md** - Resume from last session
2. **META_CUSTOMIZE.md** - Customize to project  
3. **META_WORKFLOW_TEMPLATE.md** - Create workflows
4. **REVIEW_SKILLKIT.md** - Continuous improvement

**These are essential for the META system!**

### **Optional but Useful:**

5. **DEDUP.md** - Find code duplicates (rename to CODE_DEDUP?)
6. **SECURITY_AUDIT.md** - Security checks

---

## 🎨 User Mental Model

### **Simple Guideline:**

**In Cursor, use `/` for procedures:**
```
/BEGIN_SESSION       → Start my day
/IMPLEMENT_FEATURE   → Build something
/FIX_BUGS           → Fix issues
/CONTINUE           → Resume work
/AUDIT_SKILLKIT     → Check system health
/HELP               → Get help
```

**In terminal, use `tsk` for direct actions:**
```bash
tsk dedupe-workflows    → Remove duplicate workflows
tsk audit              → Audit system
tsk sync               → Sync AGENTS.md
tsk skill:load pdf     → Load PDF skill
tsk diagnose           → Run diagnostics
```

**AI agents:**
- Can run both workflows AND CLI commands
- Workflows guide multi-step procedures
- CLI commands execute specific actions

---

## 🔮 Future: Workflow Discovery

**Problem:** How do users know what workflows exist?

**Solutions:**

1. **`/BEGIN_SESSION` shows menu:**
```
Available Workflows:
1. /IMPLEMENT_FEATURE - Build new feature
2. /FIX_BUGS - Fix bugs
3. /DEPLOY_PREP - Pre-deployment
4. /CONTINUE - Resume work
5. /AUDIT_SKILLKIT - System audit
6. /HELP - Get help

What would you like to do?
```

2. **`tsk list-workflows` CLI command:**
```bash
tsk list-workflows

# Output:
Available Workflows (6):
  /BEGIN_SESSION       - Start development session
  /IMPLEMENT_FEATURE   - Build new feature
  /FIX_BUGS           - Fix bugs systematically
  /DEPLOY_PREP        - Pre-deployment checks
  /AUDIT_SKILLKIT     - System health check
  /HELP               - Complete system help
```

3. **Cursor's `/` menu automatically shows all commands!**

---

## ✅ Summary

### **The Answer:**

**Q: "Where did dedupe, test, etc. go?"**

**A:** They're in different places based on their nature:

1. **`tsk dedupe-workflows`** - CLI command (direct action)
2. **`run-tests.md`** - Subtask (reusable component)
3. **`/DEDUP`** - Available in templates, not yet copied to `.cursor/commands/`
4. **`/AUDIT_SKILLKIT`** - New workflow that replaced `SYSTEM_AUDIT.md`

### **Q: "How will users deliver instructions?"**

**A:** Three ways:

1. **Type `/WORKFLOW`** in Cursor - For multi-step procedures
2. **Type `tsk command`** in terminal - For direct actions
3. **AI agent decides** - Reads workflows/docs and executes

### **Q: "Are they run via skills?"**

**A:** No! Skills are for domain expertise (PDF, Excel, databases). Workflows and CLI commands are for development procedures.

**Skills:** "How to extract data from PDF"  
**Workflows:** "How to build a feature"  
**CLI:** "Remove duplicate files"

---

## 🚀 Action Items

**Immediate:**
1. Copy missing workflows to `.cursor/commands/`
2. Update `BEGIN_SESSION` to show workflow menu
3. Create `tsk list-workflows` command
4. Update HELP to explain this clearly

**This will make the system crystal clear for users!**

---

**Total Lines:** 50 (comprehensive explanation)

