# Workflow System Blueprint - Replicable Agent Documentation System

**Version**: 1.0  
**Last Updated**: 04-11-2025  
**Status**: ✅ Production-tested in ProfitPilot

---

## 🎯 **What This System Does**

**Problem Solved**: Agents start work without context, don't know which workflow to use, no data-driven decisions

**Solution**: Single entry point (`BEGIN_SESSION.md`) that loads context, runs diagnostics, presents task menu, routes to appropriate workflow

**Result**: Every session starts with data, not guesses

---

## 📁 **File Structure (Copy This)**

```
your-project/
├── .cursor/
│   ├── commands/                    # 14 workflow files
│   │   ├── BEGIN_SESSION.md         # ⭐ PRIMARY ENTRY POINT
│   │   │
│   │   ├── Development (7 files)
│   │   │   ├── features.md          # Smart router (A/B/C decision tree)
│   │   │   ├── implement-feature.md # New features (N-phase protocol)
│   │   │   ├── FEATURE_FIX_STRATEGY.md # Incomplete features
│   │   │   ├── fix-all.md           # Error/bug fixing
│   │   │   ├── todo-execution.md    # TODO processing
│   │   │   ├── FEATURE_COMPLETENESS_TRUTHCHECK.md # Verification
│   │   │   └── RESUME_WORK.md       # Mid-session resume
│   │   │
│   │   ├── Quality/Audit (5 files)
│   │   │   ├── SYSTEM_AUDIT.md      # Full codebase review
│   │   │   ├── DOCUMENTATION_AUDIT.md # Docs sync check
│   │   │   ├── SECURITY_AUDIT.md    # Security review
│   │   │   ├── SPRINT_PLANNING.md   # Feature prioritization
│   │   │   └── TECH_DEBT_ANALYSIS.md # Code health
│   │   │
│   │   └── AGENT_DOCUMENTATION_PROTOCOL.md # Doc standards
│   │
│   ├── rules/
│   │   └── CORE_RULES.mdc           # All patterns consolidated
│   │
│   ├── QUICK_START.md               # User guide
│   ├── WORKFLOW_SYNC_STATUS.md      # Sync verification
│   └── DATE_USAGE_GUIDE.md          # Date handling patterns
│
├── docs/
│   ├── AITracking/                  # Agent work logs
│   │   └── AIAction_DD-MM-YYYY_<task>.md
│   ├── SprintStatus/                # Sprint tracking
│   │   └── Sprint Status-DD-MM-YYYY.md
│   ├── audit/                       # Audit outputs
│   │   ├── System_Audit_<DATE>.md
│   │   ├── Security_Audit_<DATE>.md
│   │   └── Feature_Fix_Execution_<FEATURE-ID>_<DATE>.md
│   ├── Product/
│   │   ├── Product Plan/
│   │   │   └── Product_Plan.md      # Feature specs
│   │   └── feature_registry.csv     # Feature tracking
│   └── tech/
│       ├── TECHNICAL_FOUNDATION.md  # Tech stack
│       ├── IMPORT_PATTERNS_CANONICAL.md # Import rules
│       └── service-catalog.csv      # Service registry
│
└── agents.yaml                      # Agent config (references BEGIN_SESSION)
```

---

## 🔧 **Core Components (Minimum Viable)**

### **1. BEGIN_SESSION.md (REQUIRED)**

**Purpose**: Single entry point - loads context, runs diagnostics, presents menu

**Template Structure**:
```markdown
# BEGIN SESSION - Single Entry Point

## Step 1: Load Context (60s)
- Check AITracking for today's work
- Check Sprint Status for in-progress items
- Check git for recent commits

## Step 2: Run Diagnostics (2min)
- [Project-specific diagnostic commands]
- Example: npm test, npm run lint, etc.

## Step 3: Analyze State (30s)
- Top error files
- Incomplete features
- Blockers

## Step 4: Present Task Menu
1. Implement Feature
2. Resume Work
3. Fix Errors
4. Complete Features
5. Process TODOs
6. Code Audit
7. Documentation Review
8. Security Review
9. Sprint Planning
10. Tech Debt Report

## Step 5: Route to Workflow
[Based on user choice 1-10]
```

**Key Commands to Include**:
```bash
# Context loading
TODAY=$(date +"%d-%m-%Y")
cat "docs/AITracking/AIAction_${TODAY}_"* 2>/dev/null | tail -100
grep -A 20 "In Progress" "docs/SprintStatus/Sprint Status-${TODAY}.md"
git log --oneline --since="8 hours ago" --all | head -10

# Diagnostics (adapt to your stack)
npm run test 2>&1 | tee /tmp/test-results.log
npm run lint 2>&1 | tee /tmp/lint-errors.log
npm run build 2>&1 | tee /tmp/build.log

# Error counts
ERROR_COUNT=$(grep -c "error" /tmp/lint-errors.log || echo "0")
TODO_COUNT=$(grep -rE "TODO|FIXME" src/ | wc -l)

# Present menu with actual counts
echo "Type Errors: ${ERROR_COUNT}"
echo "TODOs: ${TODO_COUNT}"
```

---

### **2. Development Workflows (Minimum 3)**

**A. features.md** - Smart router
- Evaluates: Is feature new, incomplete, or complete?
- Routes to: implement-feature OR fix-all

**B. implement-feature.md** - New feature protocol
- Your project's feature implementation steps
- Example: Design → Contracts → Tests → Implementation → Docs

**C. fix-all.md** - Error fixing protocol
- One file at a time
- Prioritize by error count
- Run diagnostics after each fix

---

### **3. Audit Commands (Minimum 3)**

**A. SYSTEM_AUDIT.md** - Full review
```bash
# Template:
npm run lint | tee audit.log
npm run test | tee -a audit.log
npm audit | tee -a audit.log
npm run build | tee -a audit.log
# Analyze and create action plan
```

**B. SECURITY_AUDIT.md** - Security check
```bash
# Template:
npm audit --audit-level=high
# Check for hardcoded secrets
grep -rE "password|api_key|secret" src/ --exclude="*.test.*"
# Check .env exposure
git ls-files .env* 2>/dev/null
```

**C. TECH_DEBT_ANALYSIS.md** - Code health
```bash
# Template:
# Count large files (> 500 lines)
find src/ -name "*.ts" -exec wc -l {} \; | awk '$1 > 500'
# Count TODOs
grep -rE "TODO|FIXME" src/ | wc -l
# Calculate debt score
```

---

### **4. CORE_RULES.mdc (Consolidated Rules)**

**Structure**:
```markdown
# Core Rules (Consolidated)

## 1. Mandatory Diagnostics (Run Before ANY Work)
[List diagnostic commands]

## 2. Architecture Patterns
[Your project's patterns: contracts-first, TDD, etc.]

## 3. Import/Export Rules
[Barrel imports, path aliases, etc.]

## 4. Validation Rules
[Where/how to validate data]

## 5. Git Workflow
[Commit standards, branch strategy]

## 6. Production Hardening
[Zero tolerance for TODOs, mocks, etc.]
```

---

### **5. agents.yaml (Agent Config)**

**Template**:
```yaml
# AGENTS.YAML - Agent Configuration

canonical_docs:
  0_session_start: ".cursor/commands/BEGIN_SESSION.md (START HERE)"
  1_core_rules: ".cursor/rules/CORE_RULES.mdc"
  2_tech_docs: "docs/tech/TECHNICAL_FOUNDATION.md"
  3_product_specs: "docs/Product/Product_Plan.md"

architecture:
  key_principles:
    - "Diagnostics BEFORE suggestions"
    - "Data-driven decisions"
    - "One task at a time"
    - "Production-ready code only"

workflows:
  development:
    - BEGIN_SESSION.md → Entry point
    - features.md → Smart router
    - implement-feature.md → New features
    - fix-all.md → Error fixing

  quality:
    - SYSTEM_AUDIT.md → Full review
    - SECURITY_AUDIT.md → Security
    - TECH_DEBT_ANALYSIS.md → Code health
```

---

## 🎯 **Implementation Steps (30-60 Minutes)**

### **Phase 1: Minimal Setup (15 min)**
1. Create `.cursor/commands/` directory
2. Create `BEGIN_SESSION.md` with:
   - Context loading (AITracking, git)
   - Your diagnostic commands
   - Task menu (1-10)
3. Create `agents.yaml` referencing BEGIN_SESSION.md
4. Test: `@BEGIN_SESSION.md` should show menu

### **Phase 2: Core Workflows (15 min)**
5. Create `features.md` (smart router)
6. Create `implement-feature.md` (your feature steps)
7. Create `fix-all.md` (error fixing)
8. Update BEGIN_SESSION.md menu to route to these

### **Phase 3: Audit Commands (15 min)**
9. Create `SYSTEM_AUDIT.md` (lint + test + build)
10. Create `SECURITY_AUDIT.md` (npm audit + secrets check)
11. Create `TECH_DEBT_ANALYSIS.md` (LOC + TODOs)

### **Phase 4: Documentation (15 min)**
12. Create `CORE_RULES.mdc` (consolidated patterns)
13. Create `QUICK_START.md` (user guide)
14. Create `docs/AITracking/` and `docs/audit/` directories

---

## 📊 **Customization Guide**

### **Adapt Diagnostics to Your Stack**

**Node.js/TypeScript**:
```bash
npm run type-check
npm run lint
npm test
npm audit
```

**Python**:
```bash
pytest
mypy src/
pylint src/
pip-audit
```

**Go**:
```bash
go test ./...
go vet ./...
golangci-lint run
go build
```

**Rust**:
```bash
cargo test
cargo clippy
cargo audit
cargo build
```

---

### **Adapt Feature Protocol**

**Backend API**:
```
1. Define API schema (OpenAPI/Zod)
2. Write tests (TDD)
3. Implement handler
4. Document endpoint
```

**Frontend Component**:
```
1. Design mockup
2. Define props interface
3. Write tests
4. Implement component
5. Add Storybook story
```

**Data Pipeline**:
```
1. Define input/output schemas
2. Write validation tests
3. Implement transform logic
4. Add monitoring
```

---

## 🔑 **Key Principles (Universal)**

### **1. Diagnostics First**
- ALWAYS run diagnostics before suggestions
- Show actual counts, not guesses
- Example: "42 errors" not "some errors"

### **2. Data-Driven Decisions**
- Recommendations based on error counts, velocity
- Example: "High error count (> 50) → Fix errors first"

### **3. Concise & Actionable**
- Bash scripts, not long explanations
- Clear success criteria
- Output files specified

### **4. One Entry Point**
- BEGIN_SESSION.md is PRIMARY
- All workflows reference it
- User always starts here

### **5. Traceability**
- Use Feature IDs in filenames
- Dynamic dates: `$(date +"%d-%m-%Y")`
- Log to AITracking/

---

## ✅ **Success Criteria**

**System is ready when**:
1. ✅ `@BEGIN_SESSION.md` shows task menu with counts
2. ✅ User can pick 1-10 and route to workflow
3. ✅ Diagnostics run in < 3 minutes
4. ✅ Audit commands create actionable reports
5. ✅ agents.yaml references BEGIN_SESSION.md

**Test it**:
```bash
# Morning start
You: "@BEGIN_SESSION.md Start work"
Agent: [Shows state, menu, routes]

# After break
You: "@BEGIN_SESSION.md Continue"
Agent: [Resumes from last work]

# Sprint review
You: "@BEGIN_SESSION.md Sprint review"
Agent: [Runs audit, creates report]
```

---

## 📋 **Checklist for New Project**

```
Setup (30-60 min)
├─ [ ] Create .cursor/commands/ directory
├─ [ ] Create BEGIN_SESSION.md (context + diagnostics + menu)
├─ [ ] Create features.md (smart router)
├─ [ ] Create implement-feature.md (feature protocol)
├─ [ ] Create fix-all.md (error fixing)
├─ [ ] Create SYSTEM_AUDIT.md (full review)
├─ [ ] Create SECURITY_AUDIT.md (security check)
├─ [ ] Create TECH_DEBT_ANALYSIS.md (code health)
├─ [ ] Create CORE_RULES.mdc (consolidated patterns)
├─ [ ] Create agents.yaml (reference BEGIN_SESSION)
├─ [ ] Create docs/AITracking/ directory
├─ [ ] Create docs/audit/ directory
├─ [ ] Create QUICK_START.md (user guide)
└─ [ ] Test: @BEGIN_SESSION.md shows menu

Customization (15-30 min)
├─ [ ] Adapt diagnostics to your stack
├─ [ ] Define your feature protocol
├─ [ ] Add project-specific rules to CORE_RULES.mdc
├─ [ ] Update audit commands with your tools
└─ [ ] Test with real feature/fix

Ready! 🚀
```

---

## 🎁 **Template Repository Structure**

**Minimum files to copy**:
```
.cursor/
├── commands/
│   ├── BEGIN_SESSION.md          # 300 lines (adapt diagnostics)
│   ├── features.md               # 200 lines (adapt routing logic)
│   ├── implement-feature.md      # 400 lines (adapt phases)
│   ├── fix-all.md                # 400 lines (generic)
│   ├── SYSTEM_AUDIT.md           # 150 lines (adapt tools)
│   ├── SECURITY_AUDIT.md         # 150 lines (adapt checks)
│   └── TECH_DEBT_ANALYSIS.md     # 200 lines (adapt metrics)
├── rules/
│   └── CORE_RULES.mdc            # 500 lines (customize patterns)
└── QUICK_START.md                # 100 lines (generic)

Total: ~2500 lines to copy + customize
Time: 30-60 minutes setup
```

---

## 📚 **Example Adaptations**

### **E-commerce Project**
```
BEGIN_SESSION diagnostics:
- Check inventory sync status
- Check payment gateway health
- Check order processing queue
- Show abandoned cart count

Task menu adds:
11. Inventory Sync Check
12. Payment Gateway Audit
```

### **ML/AI Project**
```
BEGIN_SESSION diagnostics:
- Check model accuracy drift
- Check data pipeline status
- Check training job status
- Show failed predictions count

Task menu adds:
11. Model Performance Report
12. Data Quality Audit
```

### **Mobile App**
```
BEGIN_SESSION diagnostics:
- Check build status (iOS/Android)
- Check crash reports
- Check app store reviews
- Show pending bug fixes

Task menu adds:
11. Crash Report Analysis
12. Performance Profiling
```

---

## 🎯 **Why This System Works**

**Before (Typical)**:
- Agent: "What should I do?"
- User: "Uh... fix errors I guess?"
- Agent: [Starts without context, guesses priorities]

**After (With BEGIN_SESSION)**:
- Agent: "42 type errors, 15 TODOs, build passing. Recommend: Fix errors first. Tasks 1-10?"
- User: "3" (fix errors)
- Agent: [Routes to fix-all.md with data]

**Key**: Data-driven, context-aware, actionable

---

## 🚀 **Quick Start for New Project**

**1. Copy this file to your project**
**2. Run setup checklist (30-60 min)**
**3. Customize diagnostics for your stack**
**4. Test: `@BEGIN_SESSION.md`**
**5. Done! 🎉**

---

**Blueprint Version**: 1.0  
**Source**: ProfitPilot (Nov 2025)  
**License**: Use freely, adapt to your needs  
**Tested**: ✅ Production-ready with 14 commands, 5 audits, single entry point

---

**Questions? Start with BEGIN_SESSION.md, everything routes from there.**

