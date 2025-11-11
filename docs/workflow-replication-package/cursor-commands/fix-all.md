# Fix All Errors - Root Cause Resolution

**🏭 PRODUCTION HARDENING:** ❌ NO adding TODOs while fixing ✅ ELIMINATE mocks/stubs into full implementations

**Status**: ✅ ACTIVE - Error resolution workflow  
**Last Updated**: 04-11-2025  
**Usage:** When user says "fix all errors" or "fix lint/type errors"

**⚠️ CRITICAL**: Most errors are symptoms of incomplete features, not standalone bugs!

---

## ⚡ **Quick Decision Tree (Data-Driven)**

**Real Codebase State:** 600+ type errors, 3,863 TODOs, 35 blockers

```
Error Analysis → Action
├─ File has 30+ errors? → Feature incomplete, use FEATURE_FIX_STRATEGY.md
├─ Missing contract properties? → Use implement-feature.md Phase 1
├─ Interface not implemented? → Use implement-feature.md Phase 2+4
├─ TODO/commented code (35 blockers)? → Use todo-execution.md FIRST
├─ Import/pattern error? → Check IMPORT_PATTERNS_CANONICAL.md
└─ < 5 isolated errors? → Fix directly (rare!)
```

**Critical Insight:** 92% of errors are from 10 incomplete features! Fix features, not errors.

---

## 🎯 **Protocol**

### 🚨 Step 0: PRE-FLIGHT CHECK (Check for Agent Collision)

**BEFORE running diagnostics - check if another agent is already fixing:**

```bash
# Quick collision check
find docs/audit/ -name "*DIAGNOSTIC_REPORT*" -type f -mtime -1
find docs/AITracking/ -name "AIAction_$(date +"%d-%m-%Y")_*fix*" -type f -mmin -120

# If found recent work:
echo "⚠️  Another agent ran diagnostics recently"
cat [latest-file]  # Read their findings
echo "Reuse existing analysis or run fresh? (Ask user)"
```

**If existing diagnostic from today found:**
- 🟡 READ existing report
- 🟡 Check if still valid (< 4 hours old)
- 🟡 Ask user: "Reuse existing analysis or run fresh?"

---

### **Step 0.5: DEDUP** ⚠️ **NON-BLOCKING**

```bash
bash .cursor/commands/DEDUP.md check "feature"
# Reports duplicates, doesn't stop workflow
```

**If clear or stale (> 4 hours):**
- 🟢 Proceed to Step 1 (Run fresh diagnostics)

**See:** [CORE_RULES.mdc](../rules/CORE_RULES.mdc) (Section: Agent Collision Prevention)

---

### 🚨 Step 1: RUN DIAGNOSTICS FIRST (After Pre-Flight Clear)

**❌ DO NOT:**
- Make suggestions without running these commands
- Edit FEATURE_FIX_STRATEGY.md (it's a REFERENCE doc)
- Proceed to fixing before analyzing

**✅ RUN THESE COMMANDS:**
```bash
# 1. Get complete diagnostic
pnpm run type-check 2>&1 | tee type-errors.log

# 2. Run TODO tracker (MANDATORY - correlates errors with incomplete features)
node scripts/todo-tracker/todo-tracker.cjs > todos.txt

# ⚠️  CRITICAL: TODO tracker findings are NOT "production comments"
# They indicate INCOMPLETE implementations that cause errors
# See: .cursor/rules/CORE_RULES.mdc (Production Standards section)
# DO NOT just replace TODO comments - IMPLEMENT the missing functionality

# 3. CRITICAL: Count errors by SERVICE FILE (identifies incomplete features)
grep -o "src/services/[^(]*" type-errors.log | sort | uniq -c | sort -rn | head -20

# 4. CORRELATE errors with TODOs (this proves incomplete features cause errors)
echo ""
echo "📊 Error-TODO Correlation:"
for file in $(grep -o "src/services/[^(]*" type-errors.log | sort -u); do
    ERROR_COUNT=$(grep -c "$file" type-errors.log || echo 0)
    TODO_COUNT=$(grep -c "$file" todos.txt || echo 0)
    
    if [ $TODO_COUNT -gt 0 ]; then
        echo "  $file: $ERROR_COUNT errors, $TODO_COUNT TODOs ← INCOMPLETE!"
    fi
done
echo ""
echo "⚠️  Files with TODOs AND errors = INCOMPLETE FEATURES (not isolated bugs)"

# 3. View results
cat type-errors.log | head -50
cat todos.txt | head -50
```

**📊 REPORT FINDINGS TO USER:**
```
"Analysis complete:
- Total type errors: [COUNT from type-errors.log]
- Total TODOs: [COUNT from todos.txt]
- Top issue: [SERVICE with most errors] ([COUNT] errors)
- Root cause: [Incomplete feature / Missing contracts / etc]
- Recommendation: [Use FEATURE_FIX_STRATEGY.md / implement-feature.md]
- Expected impact: [X errors → 0 errors]

Proceed with [FEATURE-ID]?"
```

**⏸️ WAIT FOR USER APPROVAL BEFORE PROCEEDING**

---

### Step 2: Analyze Results (After Running Step 1)

**Example Output:**
```bash
# Real codebase example:
#     92 src/services/trading/fee-calculation.service.ts  ← INCOMPLETE!
#     86 src/services/trading/analytics-engine.service.ts  ← INCOMPLETE!
#     76 src/services/trading/slippage-analysis.service.ts  ← INCOMPLETE!
#     43 src/services/platform/user-trading-context.service.ts
#     34 src/services/trading/portfolio.service.ts
#     33 src/services/trading/tax-management.service.ts

# Check TODO tracker
grep "Blockers:" todos.txt  # Example: 35 blockers (commented code)
grep "Critical:" todos.txt  # Example: 972 critical issues
```

**🚨 IF ANY FILE HAS 20+ ERRORS → It's an incomplete feature, not bugs!**

---

### Step 2.5: Feature Completeness Truth-Check (If TODO Tracker Finds Nothing)

**❓ SCENARIO:** TODO tracker shows 0 TODOs/MOCKs/FIXMEs, BUT errors still exist

**🎯 QUESTION:** Are errors from bugs or incomplete features?

**✅ RUN TRUTH-CHECK:**
```bash
# 1. Identify feature from error file
grep -n "@feature" <file-with-errors>

# 2. Cross-verify against Product Plan
grep -A 30 "<FEATURE-ID>" docs/Product/Product\ Plan/Product_Plan.md

# 3. Verify implementation completeness
# See: .cursor/commands/FEATURE_COMPLETENESS_TRUTHCHECK.md (Steps 3-4)
```

**ROUTING DECISION:**

| TODO Tracker | Errors | Feature Complete? | Route To |
|--------------|--------|-------------------|----------|
| 0 TODOs | 20+ errors | ❌ < 80% | **FEATURE_COMPLETENESS_TRUTHCHECK.md** |
| 0 TODOs | 5-10 errors | ✅ 100% | **Continue with Step 3** (bugs) |
| 10+ TODOs | 50+ errors | ❌ < 80% | **FEATURE_FIX_STRATEGY.md** |

**⚠️ CRITICAL:** If feature is < 100% complete per Product Plan, errors are NOT bugs!  
→ **STOP** fix-all.md workflow  
→ **USE** [FEATURE_COMPLETENESS_TRUTHCHECK.md](.cursor/commands/FEATURE_COMPLETENESS_TRUTHCHECK.md)  
→ Then route to appropriate workflow (implement-feature.md or FEATURE_FIX_STRATEGY.md)

---

### 2. Use Feature Fix Strategy (Not Error-by-Error!)

**📋 NEW APPROACH:** See [FEATURE_FIX_STRATEGY.md](FEATURE_FIX_STRATEGY.md) for data-driven fix order

**Quick Priority Check:**

#### **Priority 1: INCOMPLETE FEATURES** (Causes cascading errors)
```bash
# Check TODO tracker
pnpm run scripts/validation/todo-tracker.cjs

# Symptoms:
- "Cannot find name" errors
- "Property does not exist" 
- Commented out code
- TODO comments with mock data
- Half-implemented methods
```

**Action:** Use [todo-execution.md](todo-execution.md) to complete features
- Don't just "fix the error"
- Complete the entire feature properly
- Follow implement-feature.md for missing pieces

#### **Priority 2: MISSING CONTRACTS** (Blocks implementation)
```bash
# Symptoms:
- "Cannot find module '@profitpilot/shared/contracts'"
- "Cannot find name 'OrderSchema'"
- Type mismatches due to missing z.infer types
```

**Action:** Use [implement-feature.md](implement-feature.md) Phase 1-2
- Define schemas first
- Export types with z.infer<>
- Update barrel exports

#### **Priority 3: IMPORT ERRORS** (Pattern violations)
```bash
# Symptoms:
- Circular dependencies
- Direct file imports
- Wildcard exports
```

**Action:** Check [IMPORT_PATTERNS_CANONICAL.md](../../docs/tech/IMPORT_PATTERNS_CANONICAL.md)
- Use barrel imports
- Remove wildcards
- Fix import paths

#### **Priority 4: SYNTAX/ISOLATED ERRORS** (Actually fixable standalone)
```bash
# Symptoms:
- Unused variables
- Typos
- Missing semicolons
```

**Action:** Fix directly (these are rare!)

### 3. Resolve by FEATURE, Not by Error

**🚨 CRITICAL MINDSET SHIFT:**
```
❌ OLD: "Fix 50 type errors in order.service.ts"
✅ NEW: "Complete Order Service feature (TRADING-003-A)"
```

#### **Resolution Workflow:**

```bash
# 1. Identify the feature with most errors
grep -r "order.service.ts" type-errors.txt | wc -l  # 25 errors
grep -r "position.service.ts" type-errors.txt | wc -l  # 10 errors
# → Fix order.service.ts first (highest impact)

# 2. Check if feature is half-done
grep -n "TODO\|FIXME\|mock\|stub" packages/shared/src/services/order.service.ts

# 3. If TODO/incomplete found:
→ Use todo-execution.md to complete feature properly
→ This will fix ALL related errors at once

# 4. If missing contracts:
→ Use implement-feature.md Phase 1-2 to create schemas
→ Then return to complete service

# 5. If service complete but errors remain:
→ NOW fix individual errors (import, types, etc.)
→ One file at a time, validate after each
```

**Critical Rules:**
- Fix by FEATURE completion, not error suppression [[memory:8666105]]
- If feature half-done → Complete it fully (use implement-feature.md)
- If TODOs found → Resolve them (use todo-execution.md)
- NO commenting out code to "fix" errors
- NO disabling imports for missing implementations

### 4. Example: Real-World Error Resolution

#### **Scenario: 25 errors in order.service.ts**

```typescript
// ERROR: Cannot find name 'OrderRequestSchema'
// ERROR: Property 'createOrder' does not exist on type 'IOrderService'
// ERROR: Cannot find module 'zerodha-transformer'
// TODO: Implement real order creation
async createOrder(data: any) {  // ERROR: any type
    return { orderId: '123' };  // Mock data
}
```

**❌ WRONG Approach: "Fix" each error**
```bash
# This creates MORE problems:
1. Add "any" everywhere → Type safety lost
2. Comment out missing imports → Feature broken
3. Disable ESLint rules → Quality degraded
4. Keep mock data → Production not ready
```

**✅ CORRECT Approach: Complete the feature**
```bash
# 1. Recognize: Order Service is incomplete (TRADING-003-A)
grep "TODO\|mock" packages/shared/src/services/order.service.ts
# Found: 3 TODOs, mock data present

# 2. Check Product Plan Section 7.4
# Verified: TRADING-003-A exists, should be implemented

# 3. Complete feature using implement-feature.md:
Phase 1: Define OrderRequestSchema, OrderResponseSchema ✅
Phase 2: Define IOrderService interface with all methods ✅
Phase 3: Create order-transformer.ts ✅
Phase 4: Implement OrderService (remove mocks, add real logic) ✅
Phase 5: Implement zerodhaAdapter.placeOrder() ✅
Phase 6: Create POST /api/orders route ✅

# 4. Result: ALL 25 errors resolved + feature production-ready!
pnpm run type-check  # 0 errors
pnpm run lint        # 0 errors
```

**Key Insight:** Completing the feature properly fixes errors as byproduct!

### 5. Quick Pattern References (For Isolated Errors Only)

**Zod Patterns:**
- Location: [.cursor/rules/CORE_RULES.mdc](../rules/CORE_RULES.mdc) (Architecture section)
- Examples: [agent-rules.yaml](../../agent-rules.yaml) (zod_safeparse_patterns)
- Rule: .parse() ONLY at IO boundaries (adapters/routes), use z.infer<> elsewhere

**Import Patterns:**
- Canonical: [docs/tech/IMPORT_PATTERNS_CANONICAL.md](../../docs/tech/IMPORT_PATTERNS_CANONICAL.md)
- Quick ref: [.cursor/rules/CORE_RULES.mdc](../rules/CORE_RULES.mdc) (Quick Patterns section)
- Rule: Barrel imports only, NO direct file imports

**Contract Patterns:**
- Location: [.cursor/rules/CORE_RULES.mdc](../rules/CORE_RULES.mdc) (Quick Patterns section)
- Rule: Define contracts before implementation

**Type Safety:**
- Location: [.cursor/rules/CORE_RULES.mdc](../rules/CORE_RULES.mdc) (Banned Patterns section)
- Rule: NO any types, use proper TypeScript types

**ESLint Fixes:**
- Location: [agent-rules.yaml](../../agent-rules.yaml) (eslint_rules section)
- Common fixes: eslint-disable descriptions, safeParse patterns, enum imports

---

## 📋 **Validation Checklist**

After fixing each file:

- [ ] Type-check passes: `pnpm run type-check` (0 errors in file)
- [ ] Lint passes: `pnpm run lint` (0 errors in file)
- [ ] No new errors introduced
- [ ] No temporary workarounds or commented code
- [ ] Contracts created if missing
- [ ] Proper types used (z.infer<>, NO any)
- [ ] .parse() only at IO boundaries

**ONLY proceed to next file after ALL checks pass**

---

## 🔍 **Common Fix Commands**

```bash
# Check for anti-patterns before committing
# No .parse() in services
grep -r "\.parse(" packages/shared/src/services/
# Expected: 0 results

# No .parse() in transformers
grep -r "\.parse(" packages/shared/src/utilities/*-transformer.ts
# Expected: 0 results

# No wildcard exports
grep -r "export \* from" packages/shared/src/contracts/
# Expected: 0 results

# No any types (check specific file)
grep "any" packages/shared/src/services/order.service.ts
# Expected: 0 results (or only approved exceptions with eslint-disable)
```

---

## 🚨 **Error Resolution Priority**

1. **Blockers** - Prevent build/run
   - Missing schemas/contracts
   - Critical type errors
   - Circular dependencies

2. **High** - Breaking functionality
   - Service type mismatches
   - Missing implementations
   - Auth violations

3. **Medium** - Code quality
   - ESLint violations
   - Import pattern issues
   - Type safety improvements

4. **Low** - Polish
   - Unused variables
   - Console logs
   - Comment cleanup

**Always fix in priority order**, one file at a time.

---

## 📖 **References**

**Workflows:**
- `implement-feature.md` - Feature implementation
- `FEATURE_FIX_STRATEGY.md` - Incomplete features
- `todo-execution.md` - TODO processing
- `CONTINUE.md` - Resume mid-session (if interrupted)

**Rules:**
- `CORE_RULES.mdc` - All patterns consolidated

---

## 🏭 **PRODUCTION HARDENING REMINDER**

**While fixing errors:**
- ❌ DO NOT add "// TODO: fix this later"
- ❌ DO NOT create placeholder functions
- ❌ DO NOT leave commented code
- ✅ COMPLETE the fix fully
- ✅ ELIMINATE existing mocks/stubs
- ✅ Production-ready NOW

**If can't fix completely:**
- 🔴 STOP and report
- 🔴 NO partial fix with TODO
- 🔴 Route to implement-feature.md

---

**Status**: ✅ ACTIVE - Error resolution workflow  
**Next Review**: After first 10 error fix sessions  
**Last Updated**: 04-11-2025
