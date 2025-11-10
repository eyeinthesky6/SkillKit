# Complete Workflow System - Replication Package

**Version**: 2.0 (Updated with DEDUP + Production Hardening)  
**Last Updated**: 05-11-2025  
**Status**: ✅ Production-tested in ProfitPilot

---

## 📦 **Quick Start: Copy These Files**

### **1. Core Command Files (19 files) - `.cursor/commands/`**

**Entry Points (2):**
```
.cursor/commands/BEGIN_SESSION.md         ← PRIMARY ENTRY
.cursor/commands/features.md              ← Smart router
```

**Development Workflows (7):**
```
.cursor/commands/implement-feature.md     ← 7-phase protocol
.cursor/commands/FEATURE_FIX_STRATEGY.md  ← Incomplete features
.cursor/commands/fix-all.md               ← Error fixing
.cursor/commands/todo-execution.md        ← TODO processing
.cursor/commands/CONTINUE.md              ← Resume any task
.cursor/commands/FEATURE_COMPLETENESS_TRUTHCHECK.md
.cursor/commands/RESOLVE_ISSUES.md        ← NEW: Issue resolution
```

**Quality & Testing (5):**
```
.cursor/commands/FINAL_CHECK.md           ← Pre-deployment check
.cursor/commands/CREATE_TESTS.md          ← Test generation
.cursor/commands/CHECK_DEPS.md            ← Dependency chain
.cursor/commands/DEDUP.md                 ← Duplicate detection
.cursor/commands/FEATURE_COMPLETENESS_TRUTHCHECK.md
```

**Audit (4):**
```
.cursor/commands/SYSTEM_AUDIT.md
.cursor/commands/DOCUMENTATION_AUDIT.md
.cursor/commands/SECURITY_AUDIT.md
.cursor/commands/TECH_DEBT_ANALYSIS.md
.cursor/commands/SPRINT_PLANNING.md
```

**Governance (1):**
```
.cursor/commands/AGENT_DOCUMENTATION_PROTOCOL.md
```

---

### **2. Rule Files (2 files) - `.cursor/rules/`**

```
.cursor/rules/CORE_RULES.mdc              ← All patterns consolidated
.cursor/rules/SESSION_END_DIAGNOSTICS.mdc ← Diagnostic order
```

---

### **3. Root Configuration (2 files)**

```
agents.yaml                                ← Agent entry point config
agent-rules.yaml                           ← Detailed rules (optional)
```

---

### **4. Documentation (1 file)**

```
docs/WORKFLOW_SYSTEM_BLUEPRINT.md         ← How the system works
```

---

## 🚀 **Installation in New Project**

### **Step 1: Create Folder Structure**

```bash
cd your-new-project

# Create directories
mkdir -p .cursor/commands
mkdir -p .cursor/rules
mkdir -p docs/AITracking
mkdir -p docs/SprintStatus
mkdir -p docs/audit
mkdir -p docs/Product/Product\ Plan
mkdir -p docs/tech
```

---

### **Step 2: Copy Files from ProfitPilot**

**Option A: Manual Copy**
```bash
# From ProfitPilot directory
cp .cursor/commands/*.md /path/to/new-project/.cursor/commands/
cp .cursor/rules/*.mdc /path/to/new-project/.cursor/rules/
cp agents.yaml /path/to/new-project/
cp docs/WORKFLOW_SYSTEM_BLUEPRINT.md /path/to/new-project/docs/
```

**Option B: Use This Script**
```bash
#!/bin/bash
SOURCE_PROJECT="/path/to/profitpilot"
TARGET_PROJECT="/path/to/new-project"

# Copy command files
cp -r "$SOURCE_PROJECT/.cursor/commands/"*.md "$TARGET_PROJECT/.cursor/commands/"

# Copy rule files
cp -r "$SOURCE_PROJECT/.cursor/rules/"*.mdc "$TARGET_PROJECT/.cursor/rules/"

# Copy config
cp "$SOURCE_PROJECT/agents.yaml" "$TARGET_PROJECT/"

# Copy docs
cp "$SOURCE_PROJECT/docs/WORKFLOW_SYSTEM_BLUEPRINT.md" "$TARGET_PROJECT/docs/"
cp "$SOURCE_PROJECT/docs/REPLICATION_PACKAGE.md" "$TARGET_PROJECT/docs/"

echo "✅ Workflow system copied!"
```

---

### **Step 3: Customize for Your Project**

**Edit `agents.yaml`:**
```yaml
# Update these sections:
project_name: "YourProjectName"  # Change from ProfitPilot

# Update canonical docs paths to match your structure
canonical_docs:
  product: "docs/Product/YOUR_PRODUCT_PLAN.md"
  tech_foundation: "docs/tech/YOUR_TECH_DOC.md"
  # ... etc
```

**Edit `BEGIN_SESSION.md`:**
```bash
# Update paths in diagnostics section
# Line ~30-45: Update file paths to match your project structure
```

**Edit `implement-feature.md`:**
```bash
# Update phase-specific paths if needed
# Contract locations, package structure, etc.
```

---

### **Step 4: Create Project-Specific Docs**

**Minimum required:**
```bash
# Product documentation
docs/Product/Product Plan/Product_Plan.md

# Technical documentation  
docs/tech/TECHNICAL_FOUNDATION.md
docs/tech/PACKAGE_SERVICE_MAPPING.md

# Feature tracking
docs/Product/feature_registry.csv
docs/tech/service-catalog.csv
```

---

### **Step 5: Test the System**

```bash
# 1. Start a session
# In Cursor: Type @BEGIN_SESSION.md

# 2. Agent should:
#    - Load context
#    - Run diagnostics
#    - Present task menu

# 3. Try implement feature
# In Cursor: Type @implement-feature.md

# 4. Agent should:
#    - Check for duplicates (DEDUP)
#    - Follow 7-phase protocol
#    - Check issues before complete (RESOLVE_ISSUES)
```

---

## 🔑 **Key Files Explained**

### **BEGIN_SESSION.md** (Primary Entry)
- Loads AITracking, Sprint Status, git history
- Runs diagnostics (lint, type-check, todo-tracker)
- Presents task menu
- Routes to appropriate workflow

### **features.md** (Smart Router)
- A/B/C decision tree
- Routes based on diagnostic data
- Links to all workflows

### **implement-feature.md** (Core Protocol)
- 7-phase contracts-first protocol
- Production hardening enforced
- DEDUP checks (Phase 0 + Phase 7)
- Issue resolution mandatory (Phase 7.0)

### **DEDUP.md** (Duplicate Prevention)
- Detects duplicate code
- Records issues to log file
- Provides consolidation guidance
- **Critical**: Must resolve before complete

### **RESOLVE_ISSUES.md** (Issue Gate)
- Checks for recorded duplicates
- exit 1 if unresolved (blocks completion)
- exit 0 if clean (allows proceed)

### **FINAL_CHECK.md** (Pre-Deployment)
- Runs all diagnostics
- Checks for unresolved issues FIRST
- Routes to correct fix workflow if errors

### **CORE_RULES.mdc** (Consolidated Rules)
- All patterns in one place
- Production standards
- Import patterns
- Contract-first rules

---

## 📋 **Minimum Viable Setup**

**If you only copy 5 files:**

1. `.cursor/commands/BEGIN_SESSION.md` - Entry point
2. `.cursor/commands/implement-feature.md` - Core workflow
3. `.cursor/commands/DEDUP.md` - Duplicate prevention
4. `.cursor/commands/RESOLVE_ISSUES.md` - Issue gate
5. `.cursor/rules/CORE_RULES.mdc` - All rules

**Why these 5:**
- BEGIN_SESSION = Starting point
- implement-feature = Core development
- DEDUP = Prevents drift
- RESOLVE_ISSUES = Quality gate
- CORE_RULES = Standards enforcement

---

## ⚙️ **Customization Checklist**

- [ ] Update `agents.yaml` project name
- [ ] Update `agents.yaml` canonical doc paths
- [ ] Create `docs/Product/Product Plan/Product_Plan.md`
- [ ] Create `docs/tech/TECHNICAL_FOUNDATION.md`
- [ ] Update `BEGIN_SESSION.md` diagnostic paths
- [ ] Update `implement-feature.md` package paths
- [ ] Create `.gitignore` for `/tmp/*.log` files
- [ ] Test `@BEGIN_SESSION.md` in Cursor
- [ ] Test `@implement-feature.md` with sample feature

---

## 🚨 **Critical Features to Preserve**

### **1. Production Hardening**
```
All code workflows have:
- TOP banner: ❌ NO mocks/stubs/TODOs ✅ Production-grade only
- BOTTOM banner: Verification checklist
```

### **2. Duplicate Detection**
```
Phase 0: DEDUP check → records issues
Phase 7.0: RESOLVE_ISSUES → MUST fix before complete
```

### **3. Issue Recording System**
```
/tmp/dedup_issues_YYYYMMDD.log    - Duplicate records
/tmp/chain_issues_YYYYMMDD.log    - Dependency issues
```

### **4. Non-Blocking Guardrails**
```
Commands exit 0 (don't stop mid-workflow)
But MUST resolve critical issues before completion
```

### **5. Smart Routing**
```
FINAL_CHECK detects error types
Routes to correct workflow automatically
```

---

## 📊 **Success Metrics**

**After setup, agents should:**
- ✅ Start every session with `@BEGIN_SESSION.md`
- ✅ Run diagnostics before suggestions
- ✅ Detect duplicates automatically
- ✅ Block completion with unresolved issues
- ✅ Never add mocks/stubs/TODOs
- ✅ Follow production standards

---

## 🔄 **Maintenance**

**Weekly:**
- Review `docs/AITracking/` - Agent behavior patterns
- Review `docs/SprintStatus/` - Feature progress
- Check `/tmp/*_issues_*.log` - Recurring problems

**Monthly:**
- Run `@SYSTEM_AUDIT.md` - Code health
- Run `@TECH_DEBT_ANALYSIS.md` - Technical debt
- Update workflows based on learnings

---

## 📚 **Full File List for Copy**

```bash
# Commands (19 files)
.cursor/commands/BEGIN_SESSION.md
.cursor/commands/features.md
.cursor/commands/implement-feature.md
.cursor/commands/FEATURE_FIX_STRATEGY.md
.cursor/commands/fix-all.md
.cursor/commands/todo-execution.md
.cursor/commands/CONTINUE.md
.cursor/commands/FEATURE_COMPLETENESS_TRUTHCHECK.md
.cursor/commands/RESOLVE_ISSUES.md
.cursor/commands/FINAL_CHECK.md
.cursor/commands/CREATE_TESTS.md
.cursor/commands/CHECK_DEPS.md
.cursor/commands/DEDUP.md
.cursor/commands/SYSTEM_AUDIT.md
.cursor/commands/DOCUMENTATION_AUDIT.md
.cursor/commands/SECURITY_AUDIT.md
.cursor/commands/TECH_DEBT_ANALYSIS.md
.cursor/commands/SPRINT_PLANNING.md
.cursor/commands/AGENT_DOCUMENTATION_PROTOCOL.md

# Rules (2 files)
.cursor/rules/CORE_RULES.mdc
.cursor/rules/SESSION_END_DIAGNOSTICS.mdc

# Config (2 files)
agents.yaml
agent-rules.yaml

# Docs (2 files)
docs/WORKFLOW_SYSTEM_BLUEPRINT.md
docs/REPLICATION_PACKAGE.md
```

**Total: 25 files to copy**

---

## ✅ **You're Ready!**

Copy these 25 files → Customize paths → Test with `@BEGIN_SESSION.md` → Start building with production standards enforced! 🚀

