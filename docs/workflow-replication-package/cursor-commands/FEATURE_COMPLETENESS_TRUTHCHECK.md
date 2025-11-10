# Feature Completeness Truth-Check Workflow

**⚡ TL;DR:** Cross-verify code against Product Plan to determine if errors are from incomplete features or actual bugs

**🎯 PURPOSE:** When TODO tracker finds nothing but errors persist, manually verify feature completeness against product specs

**🏭 PRODUCTION HARDENING:** If feature is incomplete, it's NOT production-ready - complete it fully or mark as WIP

---

## 🚨 **When to Use This Workflow**

Use this workflow when:
1. ✅ TODO tracker shows 0 TODOs/FIXMEs/MOCKs
2. ❌ BUT errors still exist (type errors, lint errors, runtime errors)
3. ❓ Unclear if errors are from bugs or incomplete features

**Question to Answer:** Is the code fully implemented per product specs, or are features half-done?

---

## 📋 **STEP-BY-STEP PROTOCOL**

### **Step 1: Identify Feature from Error**

**Goal:** Map error location to feature ID

**Commands:**
```bash
# Get file path from error
# Example: Error in packages/shared/src/services/trading/fee-calculation.service.ts

# 1. Check file header for @feature tags
grep -n "@feature" packages/shared/src/services/trading/fee-calculation.service.ts

# 2. Check service catalog
grep -i "fee-calculation" docs/tech/service-catalog.csv

# 3. Check feature registry
grep -i "fee" docs/Product/Product\ Plan/feature_registry.csv
```

**Output:** Feature ID (e.g., `FEE-001`, `TRADING-003-A`)

---

### **Step 2: Check Product Plan Specs**

**Goal:** Understand WHAT should be implemented

**Location:** `docs/Product/Product Plan/Product_Plan.md` (Section 7.4)

**Commands:**
```bash
# Search for feature by ID
grep -A 30 "FEE-001" docs/Product/Product\ Plan/Product_Plan.md

# Search for feature by name
grep -A 30 "Fee Calculation" docs/Product/Product\ Plan/Product_Plan.md
```

**What to Look For:**
- ✅ **Feature description** - What does it do?
- ✅ **Requirements** - What MUST be implemented?
- ✅ **Acceptance criteria** - How to verify completion?
- ✅ **Dependencies** - What other features does it need?

**Document findings:**
```markdown
## Feature Spec Review (FEE-001)

**Feature:** Fee Calculation Service
**Requirements:**
1. Calculate brokerage fees per order
2. Calculate GST on brokerage
3. Calculate STT (Securities Transaction Tax)
4. Calculate exchange charges
5. Calculate SEBI turnover charges

**Acceptance Criteria:**
- [ ] All fee types calculated correctly
- [ ] Returns FeeBreakdown schema
- [ ] Handles all order types (MARKET, LIMIT, SL, SL_M)
- [ ] Supports both NSE and BSE
```

---

### **Step 3: Check Implementation Status**

**Goal:** Verify WHAT is actually implemented vs WHAT should be

**3.1 Check Contracts (Schemas)**
```bash
# Check if contract exists
ls packages/shared/src/contracts/domain/fee-*.contract.ts

# Check schema completeness
grep -A 20 "FeeBreakdownSchema" packages/shared/src/contracts/domain/fee-calculation.contract.ts
```

**Verify:**
- ✅ All required fields present?
- ✅ Enums defined?
- ✅ Validation rules correct?

**3.2 Check Service Interface**
```bash
# Check if interface exists
grep -A 30 "interface IFeeCalculationService" packages/shared/src/contracts/domain/fee-calculation.contract.ts
```

**Verify:**
- ✅ All methods from spec defined?
- ✅ Method signatures correct?
- ✅ Return types match schema?

**3.3 Check Service Implementation**
```bash
# Check service file
cat packages/shared/src/services/trading/fee-calculation.service.ts
```

**Verify:**
- ✅ All interface methods implemented?
- ✅ Real calculations (NOT mock/stub/TODO)?
- ✅ Handles all edge cases?
- ✅ Error handling present?

**3.4 Check Transformers**
```bash
# Check if transformer exists
ls packages/shared/src/utilities/fee-*-transformer.ts
```

**Verify:**
- ✅ API → Domain conversion?
- ✅ Domain → API conversion?
- ✅ All fields mapped?

**3.5 Check Adapters (if needed)**
```bash
# Check if adapter exists
grep -r "calculateFee\|getFeeStructure" packages/shared/src/adapters/
```

**Verify:**
- ✅ External API integration?
- ✅ Zod validation at boundary?
- ✅ Error handling?

**3.6 Check API Routes (if needed)**
```bash
# Check if route exists
grep -r "/fees\|/fee-calculation" apps/api/src/routes/
```

**Verify:**
- ✅ HTTP endpoints?
- ✅ Auth middleware?
- ✅ Request validation?

---

### **Step 4: Compare Spec vs Implementation**

**Goal:** Identify gaps between what SHOULD exist and what DOES exist

**Create Gap Analysis Document:**

```markdown
## Gap Analysis: FEE-001 (Fee Calculation Service)

**Product Spec Requirements:**
1. ✅ Calculate brokerage fees - IMPLEMENTED
2. ✅ Calculate GST - IMPLEMENTED
3. ❌ Calculate STT - MISSING
4. ❌ Calculate exchange charges - MISSING
5. ❌ Calculate SEBI charges - MISSING

**Implementation Status:**

| Component | Required | Exists | Complete | Gap |
|-----------|----------|--------|----------|-----|
| **Contract** | Yes | ✅ Yes | ⚠️ Partial | Missing STT/exchange/SEBI fields |
| **Interface** | Yes | ✅ Yes | ⚠️ Partial | Missing calculateSTT() method |
| **Service** | Yes | ✅ Yes | ❌ Incomplete | Only 2/5 calculations implemented |
| **Transformer** | Yes | ❌ No | ❌ Missing | No fee-transformer.ts |
| **Adapter** | No | N/A | N/A | Not needed (pure calculation) |
| **Route** | Yes | ❌ No | ❌ Missing | No /api/fees endpoint |

**Root Cause of Errors:**
- Type errors: Missing fields in FeeBreakdownSchema (stt, exchangeCharges, sebiCharges)
- Lint errors: Unused imports (methods not implemented)
- Runtime errors: Frontend expects fields that don't exist

**Conclusion:** Feature is 40% complete (2/5 calculations) - NOT production-ready
```

---

### **Step 5: Update Feature Tracking**

**Goal:** Record feature status in canonical sources

**5.1 Update Feature Registry CSV**
```bash
# Location
vim docs/Product/Product\ Plan/feature_registry.csv
```

**Update status:**
```csv
# Before
FEE-001,Fee Calculation Service,TRADING,IN_PROGRESS,HIGH,...

# After (if incomplete)
FEE-001,Fee Calculation Service,TRADING,INCOMPLETE,HIGH,40% (2/5 calculations),Missing STT/exchange/SEBI
```

**5.2 Update Service Catalog**
```bash
# Location
vim docs/tech/service-catalog.csv
```

**Update implementation status:**
```csv
# Before
FeeCalculationService,packages/shared/src/services/trading,ACTIVE,...

# After
FeeCalculationService,packages/shared/src/services/trading,INCOMPLETE,40% (2/5 methods),FEE-001
```

---

### **Step 6: Decision Tree - What to Do Next**

```
Is feature complete per spec?
    ├─ YES (100% implemented)
    │   ├─ Errors are BUGS (not incomplete features)
    │   └─ ROUTE TO: `.cursor/commands/fix-all.md` (bug fix workflow)
    │
    └─ NO (< 100% implemented)
        ├─ How incomplete?
        │   ├─ < 20% (just started)
        │   │   └─ ROUTE TO: `.cursor/commands/implement-feature.md` (NEW feature)
        │   │
        │   ├─ 20-80% (partially done)
        │   │   └─ ROUTE TO: `.cursor/commands/FEATURE_FIX_STRATEGY.md` (INCOMPLETE feature)
        │   │
        │   └─ > 80% (almost done)
        │       └─ ROUTE TO: `.cursor/commands/implement-feature.md` (complete remaining phases)
        │
        └─ Update tracking:
            ├─ feature_registry.csv (status = INCOMPLETE)
            ├─ service-catalog.csv (implementation_status = X%)
            └─ Create fix plan in docs/audit/FEATURE_FIX_PLAN_<feature-id>_<date>.md
```

---

## 🔄 **Integration with Existing Workflows**

### **Update `fix-all.md` Workflow**

**Add Step 0.5 (After diagnostics, before fixing):**
```markdown
## Step 0.5: Feature Completeness Truth-Check

**BEFORE fixing errors, verify feature completeness:**

```bash
# 1. Map errors to features
grep -n "@feature" <file-with-errors>

# 2. Run truth-check
# See: .cursor/commands/FEATURE_COMPLETENESS_TRUTHCHECK.md

# 3. If feature incomplete:
#    → ROUTE TO: FEATURE_FIX_STRATEGY.md
#    → DO NOT proceed with fix-all.md

# 4. If feature complete:
#    → Continue with fix-all.md (errors are bugs)
```
```

---

### **Update `todo-execution.md` Workflow**

**Add Step 1.5 (After TODO tracker, before implementation):**
```markdown
## Step 1.5: Cross-Verify with Product Plan

**If TODO tracker finds 0 TODOs but errors exist:**

```bash
# Run feature completeness truth-check
# See: .cursor/commands/FEATURE_COMPLETENESS_TRUTHCHECK.md

# Decision:
# - If feature incomplete → Use FEATURE_FIX_STRATEGY.md
# - If feature complete → Errors are bugs, use fix-all.md
```
```

---

### **Update `features.md` Smart Entry Point**

**Add to Step 3 (Feature Evaluation):**
```markdown
### **3. Evaluate Feature Completeness**

**Cross-verify implementation against product spec:**

```bash
# 1. Check Product Plan (Section 7.4)
grep -A 30 "<FEATURE-ID>" docs/Product/Product\ Plan/Product_Plan.md

# 2. Check implementation
# See: .cursor/commands/FEATURE_COMPLETENESS_TRUTHCHECK.md (Steps 3-4)

# 3. Calculate completion %
#    - Count required components from spec
#    - Count implemented components
#    - Completion % = (implemented / required) * 100
```

**Routing Logic:**
- < 20% complete → NEW feature (implement-feature.md)
- 20-80% complete → INCOMPLETE feature (FEATURE_FIX_STRATEGY.md)
- > 80% complete → Almost done (implement-feature.md, remaining phases)
- 100% complete + errors → BUGS (fix-all.md)
```

---

## 📊 **Quick Decision Matrix**

| TODO Tracker | Errors | Feature Complete? | Route To |
|--------------|--------|-------------------|----------|
| 0 TODOs | 0 errors | N/A | ✅ Done |
| 10+ TODOs | 50+ errors | < 80% | FEATURE_FIX_STRATEGY.md |
| 0 TODOs | 20+ errors | < 80% | FEATURE_COMPLETENESS_TRUTHCHECK.md → FEATURE_FIX_STRATEGY.md |
| 0 TODOs | 5-10 errors | 100% | fix-all.md (bugs) |
| 0 TODOs | 0 errors | 100% | ✅ Done |

---

## 🎯 **Example Walkthrough**

### **Scenario:** FeeCalculationService has 45 type errors, 0 TODOs

**Step 1: Identify Feature**
```bash
$ grep -n "@feature" packages/shared/src/services/trading/fee-calculation.service.ts
5: * @feature:FEE-001
```
→ Feature ID: `FEE-001`

**Step 2: Check Product Plan**
```bash
$ grep -A 30 "FEE-001" docs/Product/Product\ Plan/Product_Plan.md
```
→ Requires: 5 calculation methods (brokerage, GST, STT, exchange, SEBI)

**Step 3: Check Implementation**
```bash
$ grep "calculate" packages/shared/src/services/trading/fee-calculation.service.ts
```
→ Found: 2 methods (calculateBrokerage, calculateGST)
→ Missing: 3 methods (calculateSTT, calculateExchange, calculateSEBI)

**Step 4: Gap Analysis**
→ Feature is 40% complete (2/5 methods)
→ Missing 3 critical methods
→ Type errors caused by incomplete schema (missing fields for STT, exchange, SEBI)

**Step 5: Update Tracking**
→ Update feature_registry.csv: status = INCOMPLETE, completion = 40%
→ Update service-catalog.csv: implementation_status = INCOMPLETE

**Step 6: Route Decision**
→ 40% complete (20-80% range)
→ **ROUTE TO:** `.cursor/commands/FEATURE_FIX_STRATEGY.md`
→ Complete missing 3 calculation methods using 7-phase protocol

---

## 🚫 **Common Mistakes to Avoid**

❌ **DON'T:** Assume 0 TODOs = complete feature
✅ **DO:** Cross-verify against Product Plan specs

❌ **DON'T:** Fix type errors without checking feature completeness
✅ **DO:** Verify feature is complete first, then fix bugs

❌ **DON'T:** Trust service exists = feature complete
✅ **DO:** Verify ALL methods from spec are implemented

❌ **DON'T:** Ignore missing transformers/adapters/routes
✅ **DO:** Check entire 7-phase protocol (contracts → routes)

---

## 📚 **References**

**Product Specs:**
- `docs/Product/Product Plan/Product_Plan.md` (Section 7.4: Feature Index)
- `docs/Product/Product Plan/feature_registry.csv` (Feature tracking)

**Implementation Tracking:**
- `docs/tech/service-catalog.csv` (Service status)
- `docs/tech/PACKAGE_SERVICE_MAPPING.md` (Package placement)

**Workflow Commands:**
- `.cursor/commands/features.md` (Smart entry point)
- `.cursor/commands/implement-feature.md` (NEW features)
- `.cursor/commands/FEATURE_FIX_STRATEGY.md` (INCOMPLETE features)
- `.cursor/commands/fix-all.md` (Bug fixes)

**Architecture:**
- `.cursor/rules/CORE_RULES.mdc` (7-phase protocol)
- `docs/tech/CONTRACTS_FIRST_ARCHITECTURE_ENFORCEMENT.md` (Architecture guide)

---

## ✅ **Success Criteria**

**Truth-check is successful when:**
1. ✅ Feature ID identified from error location
2. ✅ Product Plan specs reviewed and documented
3. ✅ Implementation status verified (contracts → routes)
4. ✅ Gap analysis created (spec vs actual)
5. ✅ Feature tracking updated (registry + catalog)
6. ✅ Clear routing decision made (which workflow to use)

---

**Status:** ✅ ACTIVE - Use when TODO tracker finds nothing but errors persist  
**Last Updated:** 04-11-2025  
**Next Review:** After first 5 feature truth-checks

