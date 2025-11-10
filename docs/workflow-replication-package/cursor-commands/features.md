# Feature Workflow - Smart Entry Point

**⚡ TL;DR:** Run 4 diagnostics → Report findings → Wait for approval → Route to correct workflow

**🏭 PRODUCTION HARDENING:** Zero tolerance for mocks/stubs/TODOs - ALL code must be production-ready

---

## 🚨 **MANDATORY FIRST (Copy-Paste These 4 Commands)**

```bash
pnpm run type-check 2>&1 | tee type-errors.log
node scripts/validation/todo-tracker.cjs > todos.txt
pnpm exec madge --circular packages/shared/src > circular.log
pnpm run build 2>&1 | tee build.log
```

**Then tell user:**
- "Type errors: [COUNT]"
- "TODOs: [COUNT] ([BLOCKERS] blockers) ← Incomplete work, NOT comments"
- "Feature [NAME]: [ERRORS] errors, [TODOS] TODOs → [NEW/INCOMPLETE/BUGS]"
- "Proceed?"

**❌ VIOLATIONS:**
- NO suggestions without running commands
- NO mocks/stubs in production code
- NO proceeding without user approval

---

## 🚨 **Step 0: PRE-FLIGHT CHECK (Mandatory - Check for Agent Collision)**

**BEFORE doing ANYTHING - Get EXACT Feature ID and check for collisions:**

**🚨 STEP 1: Get EXACT Feature ID from ONE source:**
```bash
grep -i "keyword" docs/Product/feature_registry.csv       # Get: FEE-001
grep -i "keyword" docs/tech/service-catalog.csv            # Get: TRADING-003-A  
grep "Section 7.4" docs/Product/Product\ Plan/Product_Plan.md  # Get exact IDs
```

**🚨 STEP 2: Check for collisions (use EXACT ID from step 1):**
```bash
# Example: Checking for FEE-001 (replace with your actual ID)

# 1. Check for existing execution logs (other agents' work)
find docs/audit/ -name "*Feature_Fix_Execution*FEE-001*" -type f -mmin -240
# If found files modified in last 4 hours → COLLISION!

# 2. Check today's AITracking
ls -la docs/AITracking/AIAction_$(date +"%d-%m-%Y")_FEE-001*.md 2>/dev/null
# If exists from last 2 hours → Another agent working!

# 3. Check Sprint Status
grep -i "in progress.*FEE-001" "docs/SprintStatus/Sprint Status-$(date +"%d-%m-%Y").md" 2>/dev/null
# If found → ACTIVE WORK!

# 4. Check git activity
git log --oneline --since="2 hours ago" --all -- "*FEE-001*" "*fee-calculation*"
# If recent commits → Another agent just committed!
```

**If ANY collision detected:**
```
🔴 STOP - Report to user:
"⚠️  Collision detected: [Details]
Another agent is/was working on this.
Options:
a) Work on different feature
b) Review existing work and continue
c) Wait and check again

What would you like to do?"
```

**If clear (no collision):**
```
🟢 CLEAR - Proceed to Step 1
```

**See:** [CORE_RULES.mdc](../rules/CORE_RULES.mdc) (Agent Collision Prevention section)

---

## 📊 **Step 1: Run Diagnostics (Copy-Paste Commands Above)**

**After running, analyze:**

```bash
# Count errors by service (find top issues)
grep -o "src/services/[^(]*" type-errors.log | sort | uniq -c | sort -rn | head -10

# Correlate errors with TODOs (proves incomplete features)
for file in $(grep -o "src/services/[^(]*" type-errors.log | sort -u | head -5); do
    E=$(grep -c "$file" type-errors.log || echo 0)
    T=$(grep -c "$file" todos.txt || echo 0)
    echo "$file: $E errors, $T TODOs $([ $T -gt 0 ] && echo '← INCOMPLETE' || echo '')"
done
```

**Report to user (template):**
```
"📊 Diagnostics:
- Type errors: [COUNT]
- TODOs: [COUNT] ([BLOCKERS] blockers)
- Top: [service-file] ([X] errors, [Y] TODOs)
- Cause: [Incomplete/Missing contracts/Bugs]

DECISION: [NEW/INCOMPLETE/BUGS]
→ [implement-feature.md/FEATURE_FIX_STRATEGY.md/fix-all.md]

Proceed?"
```

---

## 🔍 **Step 2: DECISION TREE**

### **A: Feature Doesn't Exist → `/implement-feature.md`**
- ❌ No contracts, no interface, no service
- Build from scratch (7 phases)

### **B: Feature Incomplete (20+ errors + TODOs) → `/FEATURE_FIX_STRATEGY.md`**
- ✅ Contracts exist (partial)
- ❌ Service has TODOs/mocks/stubs
- Complete missing pieces

### **C: Feature Complete (< 10 errors, no TODOs) → `/fix-all.md`**
- ✅ Fully implemented per Product Plan
- Errors are bugs (not incomplete features)

**⚠️ CRITICAL:** If TODO tracker shows 0 TODOs but errors exist:
→ **RUN TRUTH-CHECK:** [FEATURE_COMPLETENESS_TRUTHCHECK.md](./FEATURE_COMPLETENESS_TRUTHCHECK.md)
→ Cross-verify implementation against Product Plan specs
→ If feature < 100% complete: Route to B (INCOMPLETE), not C (BUGS)
- ❌ Import/type errors only
- Fix specific bugs

### **D: Missing Dependencies → Fix dependency first**
- Errors: "Cannot find module X"
- Fix dependency using B, then return

---

## 📋 **Quick Matrix**

| Errors | TODOs | → Decision |
|--------|-------|------------|
| N/A | N/A | **NEW** → implement-feature.md |
| 20+ | 10+ | **INCOMPLETE** → FEATURE_FIX_STRATEGY.md |
| < 10 | 0 | **BUGS** → fix-all.md |
| Any | 0 | **DEPS** → Fix dependency first |

---

## ⚡ **Step 3: Execute**

**Tell user which workflow, wait for approval, then follow it.**

**Flow:**
```
Run diagnostics → Report findings → Get decision → Route to workflow → Execute
```

---

## 📋 **Evaluation Template**

```
Feature: [FEATURE-ID]
- Contracts: [YES/NO/PARTIAL]
- Service: [EXISTS/STUBS/NONE]
- Errors: [COUNT]
- TODOs: [COUNT]
→ Decision: [NEW/INCOMPLETE/BUGS/DEPS]
→ Workflow: [implement-feature/FEATURE_FIX_STRATEGY/fix-all]
```

---

## 📚 **References**

**Entry Point:**
- `BEGIN_SESSION.md` - **Start here every session** (context + diagnostics + menu)

**Workflows:**
- `implement-feature.md` - NEW features
- `FEATURE_FIX_STRATEGY.md` - INCOMPLETE features  
- `fix-all.md` - Bug fixes
- `todo-execution.md` - TODO processing
- `CONTINUE.md` - Resume ANY task (code/audit/workflow)

**Quality:**
- `FINAL_CHECK.md` - **Pre-deployment check** (routes if errors)
- `CREATE_TESTS.md` - Generate feature tests

**Audits:**
- `SYSTEM_AUDIT.md` - Full codebase review
- `DOCUMENTATION_AUDIT.md` - Docs sync check
- `SECURITY_AUDIT.md` - Security review
- `SPRINT_PLANNING.md` - Feature prioritization
- `TECH_DEBT_ANALYSIS.md` - Code health

**Rules:**
- `CORE_RULES.mdc` - All patterns consolidated

---

**Last Updated:** 04-11-2025

