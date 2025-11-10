# Feature Fix Strategy (Incomplete Features)

**🏭 PRODUCTION HARDENING:** ❌ NO mocks/stubs/TODOs ✅ ELIMINATE into production-grade code

**⚡ TL;DR:** Fix incomplete features (20+ errors) by completing missing phases - ZERO tolerance for placeholders

**🚨 READ-ONLY** - Create execution logs in `docs/audit/Feature_Fix_Execution_<FEATURE-ID>_<DATE>.md`

**MANDATORY NAMING:** Use EXACT Feature ID + current date  

```bash
# Get today's date
TODAY=$(date +"%d-%m-%Y")

# Format: Feature_Fix_Execution_<FEATURE-ID>_${TODAY}.md
```

**✅ CORRECT Examples:**
- `Feature_Fix_Execution_FEE-001_$(date +"%d-%m-%Y").md`
- `Feature_Fix_Execution_ANALYTICS-001_$(date +"%d-%m-%Y").md`

**❌ FORBIDDEN:** Generic names like "Feature_Fix_Execution_<DATE>.md" (impossible to trace)

---

## 📋 **MANDATORY FIRST STEPS**

```bash
# 0. DEDUP check (non-blocking)
bash .cursor/commands/DEDUP.md check "feature name"

# 1. Run diagnostics
pnpm run type-check 2>&1 | tee type-errors.log
node scripts/validation/todo-tracker.cjs > todos.txt
grep -o "src/services/[^(]*" type-errors.log | sort | uniq -c | sort -rn | head -10

# Report findings → Wait for approval → NO proceeding without data
```

---

## 🚀 **PROTOCOL: Feature Completion Approach (After User Approval)**

**When user approves, follow this exact sequence:**

### **Step 1: Identify TOP 3 Features Causing Most Errors**

```bash
# Use error count analysis from diagnostics above
grep -o "src/services/[^(]*" type-errors.log | sort | uniq -c | sort -rn | head -3

# Map errors to Feature IDs
for file in $(grep -o "src/services/[^(]*" type-errors.log | sort -u | head -3); do
    echo "=== $file ==="
    grep -n "@feature" "$file" 2>/dev/null | head -1
    echo ""
done
```

**Expected Output:**
```
TOP 3 Features by Error Count:
1. FEE-001 (92 errors) - Fee Calculation Service
2. ANALYTICS-001 (86 errors) - Analytics Engine  
3. TRADING-SLIP-001 (76 errors) - Slippage Analysis
```

---

### **Step 2: Complete Feature #1 FULLY (100% - No Shortcuts)**

**Use:** `.cursor/commands/implement-feature.md` (7-phase protocol)

**🚨 CRITICAL RULES:**
- ✅ Complete ALL 7 phases (Enums → Schemas → Interfaces → Transformers → Services → Adapters → Routes)
- ✅ Run `pnpm run type-check && pnpm run lint` after EACH phase (0 errors before next)
- ✅ Work on ONE feature at a time (finish Feature #1 before starting #2)
- ❌ NO parallel work on multiple features
- ❌ NO shortcuts (no skipping transformers, no incomplete services)
- ❌ NO TODOs/mocks/stubs (production code only)

**7-Phase Breakdown:**
```
Phase 1: Enums → z.enum() in shared/contracts/shared/enums.contract.ts
Phase 2: Schemas → Domain schemas in shared/contracts/domain/
Phase 3: Interfaces → ALL service method signatures defined
Phase 4: Transformers → utilities/*-transformer.ts (API↔Domain conversion)
Phase 5: Services → Implement ALL methods with real business logic
Phase 6: Adapters → IO boundary adapters (if external API integration)
Phase 7: Routes → HTTP endpoints (if public API needed)

Checkpoint: After EACH phase → pnpm run type-check (0 errors required)
```

---

### **Step 3: Verify Feature #1 is 100% Complete**

**Use:** `.cursor/commands/FEATURE_COMPLETENESS_TRUTHCHECK.md`

```bash
# 1. Check Product Plan requirements
grep -A 30 "FEE-001" docs/Product/Product\ Plan/Product_Plan.md

# 2. Verify ALL components implemented
# Contracts ✓ ALL fields from spec
# Interface ✓ ALL methods defined  
# Service ✓ ALL methods with real logic
# Transformers ✓ API↔Domain conversion
# Adapters ✓ (if external API needed)
# Routes ✓ (if HTTP endpoints needed)

# 3. Cross-check acceptance criteria
# Must be 100% per Product Plan specs
```

**Completion Checklist:**
- [ ] All methods from Product Plan implemented
- [ ] All acceptance criteria met
- [ ] NO TODOs/FIXMEs/MOCKs in code
- [ ] `pnpm run type-check` passes (0 errors)
- [ ] `pnpm run lint` passes (0 errors)
- [ ] `pnpm run build` succeeds

**❌ IF < 100% complete:** DO NOT move to Feature #2, finish Feature #1 first

---

### **Step 4: Run Diagnostics & Show Progress**

```bash
# Run diagnostics again
pnpm run type-check 2>&1 | tee type-errors-after-feature1.log
node scripts/validation/todo-tracker.cjs > todos-after-feature1.txt

# Count remaining errors
echo "=== PROGRESS REPORT ==="
echo "Before Feature #1: 42 errors total"
echo "After Feature #1:"
wc -l type-errors-after-feature1.log
echo ""
echo "Errors eliminated: [CALCULATE]"
```

**Report to User (Template):**
```
✅ Feature #1 (FEE-001 - Fee Calculation) Complete

Before:
- 92 errors in fee-calculation.service.ts
- 42 errors total

After:
- 0 errors in fee-calculation.service.ts  
- 7 errors total

Impact: 35 errors eliminated (83% reduction)

Remaining:
- Feature #2 (ANALYTICS-001) - 86 errors
- Feature #3 (TRADING-SLIP-001) - 76 errors

Next: Complete Feature #2? (await user approval)
```

**⏸️ WAIT FOR USER APPROVAL before proceeding to Feature #2**

---

### **Step 5: Repeat for Features #2 and #3**

**Same protocol:**
1. Complete Feature #2 using implement-feature.md (all 7 phases)
2. Verify 100% complete using FEATURE_COMPLETENESS_TRUTHCHECK.md
3. Run diagnostics, report progress
4. Wait for user approval
5. Move to Feature #3

**🚨 ONE FEATURE AT A TIME - NO PARALLEL WORK**

---

## 🎯 **Root Causes & Fixes**

| Pattern | Symptom | Fix |
|---------|---------|-----|
| **Missing Contracts** | Service uses `any` types | Define schema in `contracts/`, use `z.infer<>` |
| **Incomplete Contract** | Property not found errors | Add fields to schema |
| **Raw DB/API Access** | Direct Supabase/fetch calls | Move to adapter with `.parse()` |
| **Interface Mismatch** | Missing methods | Implement ALL interface methods |

---

## 🚀 **Fix Protocol (ONE Feature at a Time)**

### **1. Run Diagnostics** (commands above)

### **2. Pick Top Error Service**
```bash
# Example output:
# 92 fee-calculation.service.ts
# 86 analytics-engine.service.ts
# 76 slippage-analysis.service.ts
```

### **3. Identify Missing Phases**
```bash
# Check what exists:
grep "FeeRecordSchema" packages/shared/src/contracts/  # Contracts?
grep "IFeeCalculationService" packages/shared/src/contracts/  # Interface?
grep "fee-transformer" packages/shared/src/utilities/  # Transformers?
grep "class FeeCalculationService" packages/shared/src/services/  # Service?
```

### **4. Complete Missing Phases**

Use `implement-feature.md` phases based on what's missing:

**Phase 1: Contracts Missing**
```typescript
// Location: packages/shared/src/contracts/domain/[feature].contract.ts
export const FeatureSchema = z.object({
    // Add ALL required fields
});
export type Feature = z.infer<typeof FeatureSchema>;
```

**Phase 2: Interface Missing/Incomplete**
```typescript
// Location: Same file as contracts
export interface IFeatureService {
    method1(...): Promise<...>;
    method2(...): Promise<...>;
    // Define ALL methods
}
```

**Phase 3: Transformers Missing**
```typescript
// Location: packages/shared/src/utilities/[feature]-transformer.ts
export function apiToFeaturedomain(raw: ApiResponse): Feature { ... }
export function domainToApi(feature: Feature): ApiRequest { ... }
```

**Phase 4: Service Incomplete**
```typescript
// Location: packages/shared/src/services/[domain]/[feature].service.ts
export class FeatureService implements IFeatureService {
    // Implement ALL interface methods (no TODOs/mocks/stubs)
    async method1(...) { /* Full business logic */ }
    async method2(...) { /* Full business logic */ }
}
```

### **5. Validate Feature Complete**
```bash
pnpm run type-check | grep [service-name]  # Should: 0 errors
grep "TODO\|mock\|stub" [service-file]  # Should: No results
node scripts/validation/todo-tracker.cjs | grep [service-name]  # Should: 0 issues
```

### **6. Document & Move to Next**
```bash
# Log completion
echo "Feature [FEATURE-ID] complete: [X] errors → 0 errors" >> docs/audit/...

# Pick next highest error service
# Repeat steps 2-6
```

---

## 📊 **Example: FEE-001 (92 errors)**

**Diagnostics showed:**
- ✅ Contracts exist (FeeRecordSchema)
- ✅ Interface exists (IFeeCalculationService)
- ❌ Transformers missing (fee-transformer.ts)
- ❌ Service incomplete (has TODOs, mock data)

**Fix:**
1. **Phase 3:** Create `fee-transformer.ts`
2. **Phase 4:** Complete service (remove TODOs, add real logic)
3. **Validate:** 92 errors → 0 errors

**Time:** 2-3 hours  
**Impact:** 15% of total errors eliminated

---

## 📋 **Feature Completion Checklist**

Per feature:
- [ ] Contracts complete (all fields, no `z.any()`)
- [ ] Interface complete (all methods defined)
- [ ] Transformers created (if external APIs involved)
- [ ] Service complete (ALL methods implemented, no TODOs)
- [ ] Type-check: 0 errors for this service
- [ ] TODO tracker: 0 issues for this service
- [ ] Build: succeeds
- [ ] Execution log created in `docs/audit/`

---

## 🔄 **Progress Tracking**

```
Sprint 1 (Week 1-2): Core Trading
├─ FEE-001: ✅ Complete (92 → 0 errors)
├─ ANALYTICS-001: ⏳ In Progress (86 errors)
└─ SLIPPAGE-001: 📋 Planned (76 errors)

Sprint 2 (Week 3-4): Portfolio & Tax
├─ TAX-001: 📋 Planned (33 errors)
└─ PORTFOLIO-001: 📋 Planned (34 errors)
```

**Update in:** `docs/SprintStatus/Sprint Status-DD-MM-YYYY.md`

---

## 📚 **References**

- **Implementation Guide:** `implement-feature.md` (phases 1-7)
- **All Patterns Consolidated:** `.cursor/rules/CORE_RULES.mdc`

---

## 🏭 **CRITICAL: NO MOCKS/STUBS LEFT BEHIND**

**After fixing each feature:**
```bash
# Verify ZERO mocks/stubs remain
grep -rn "mock\|stub\|TODO\|FIXME\|placeholder\|not implemented" packages/shared/src/services/[feature]*.ts

# Expected: 0 results
# If found: FEATURE NOT COMPLETE - keep fixing
```

**Rules:**
- ❌ Fixing errors does NOT mean "add TODO for later"
- ❌ Implementing feature does NOT mean "mock for now"
- ✅ Feature is ONLY complete when 100% production-ready
- ✅ ALL methods have REAL business logic

---

**Last Updated:** 04-11-2025  
**Status:** READ-ONLY REFERENCE

