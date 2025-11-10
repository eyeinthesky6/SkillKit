# Execute TODO Items - Complete Features, Not Comments

**Status**: ✅ ACTIVE - TODO processing workflow  
**Last Updated**: 04-11-2025  
**Usage:** Processing TODOs from todo-tracker.cjs or code comments

**⚠️ CRITICAL**: TODOs = Incomplete features. Don't just update comments, complete the implementation!

---

## ⚡ **Quick Decision Tree**

```
TODO Type → Action
├─ "TODO: Implement X" → Use implement-feature.md to add feature
├─ "TODO: Replace mock" → Complete service with real logic
├─ "TODO: Add validation" → Add .parse() at IO boundary
├─ Commented out code → Uncomment + complete feature
└─ Missing implementation → Use implement-feature.md Phase 4
```

---

## 🎯 **Protocol**

### 🚨 Step 1: RUN TODO TRACKER FIRST (MANDATORY - DO NOT SKIP!)

**❌ DO NOT:**
- Make suggestions without running todo-tracker
- Proceed without seeing actual TODO counts
- Edit reference documents

**✅ RUN THESE COMMANDS:**
```bash
# 1. Run TODO tracker
node scripts/validation/todo-tracker.cjs > todos.txt

# ⚠️  CRITICAL INTERPRETATION:
# TODO tracker output = INCOMPLETE WORK (not production comments)
# See: .cursor/rules/CORE_RULES.mdc (Production Standards section)
#
# What you'll see:
# - "TODO" = Developer admitted work incomplete
# - "MOCK_DATA" = Fake values, not real implementation
# - "COMMENTED_OUT_CODE" = Real code disabled, workaround in place
# - "NOT_IMPLEMENTED" = Stub/placeholder only
#
# ALL of these = LAZY CODING that must be REPLACED (not justified!)

# 2. View summary
cat todos.txt | head -50

# 3. Categorize by type
grep "mock\|stub\|hardcoded" todos.txt > incomplete-implementations.txt
grep "TODO.*implement\|not implemented" todos.txt > missing-features.txt
grep "commented out\|//" todos.txt > commented-code.txt

# 4. Count by priority
echo "Incomplete implementations: $(wc -l < incomplete-implementations.txt)"
echo "Missing features: $(wc -l < missing-features.txt)"
echo "Commented code: $(wc -l < commented-code.txt)"
```

**📊 REPORT FINDINGS TO USER:**
```
"TODO Analysis complete:
- Total TODOs: [NUMBER from todos.txt]
- Blockers: [NUMBER] (commented code causing errors)
- Critical: [NUMBER] (incomplete features)
- Major: [NUMBER] (user experience issues)
- Top issue: [SPECIFIC FILE/LINE]
- Recommendation: [Fix blockers first / Complete FEATURE-ID]

Proceed with [APPROACH]?"
```

**⏸️ WAIT FOR USER APPROVAL BEFORE PROCEEDING**

---

### Step 2: Prioritize (After Running Step 1)

**Priority Order:**
1. **Commented code causing errors** → Blocking production
2. **Mock/stub data in services** → Not production-ready
3. **Missing feature implementations** → Incomplete functionality
4. **Documentation TODOs** → Enhancement only

### 2. Resolve by Feature, Not Comment

**🚨 MINDSET SHIFT:**
```
❌ OLD: "Update TODO comment to explain mock data"
✅ NEW: "Complete Order Service with real implementation"
```

#### **Resolution by TODO Type:**

**Type A: Missing Implementation**
```typescript
// TODO: Implement portfolio calculation
async calculatePortfolio(): Promise<Portfolio> {
    throw new Error('Not implemented');
}
```
**Action:** Use [implement-feature.md](implement-feature.md)
- Check Product Plan Section 7.4 for feature ID
- Follow 7-phase protocol
- Complete full implementation (no stubs)

**Type B: Mock/Stub Data**
```typescript
// TODO: Replace with real API call
async getHoldings(): Promise<Holding[]> {
    return [{ symbol: 'TEST', quantity: 100 }];  // MOCK!
}
```
**Action:** Complete service implementation
- Phase 1: Verify schema exists
- Phase 4: Wire to real adapter
- Phase 5: Implement adapter with .parse()
- Remove all mock data

**Type C: Commented Out Code**
```typescript
// const order = await orderService.createOrder(request);
// return order;  // Commented due to errors
return { orderId: 'temp' };  // Temporary
```
**Action:** Fix root cause, then uncomment
- Why was it commented? (Missing contract? Type error?)
- Fix underlying issue (use implement-feature.md if needed)
- Uncomment and verify works
- Remove temporary code

### 3. Resolution Workflow (Step-by-Step)

```bash
# 1. Pick highest priority TODO
FILE="packages/shared/src/services/portfolio.service.ts"
LINE=45
TODO="TODO: Implement real portfolio calculation"

# 2. Identify feature ID
grep -r "portfolio calculation" docs/Product/Product\ Plan/Product_Plan.md
# Found: TRADING-004-A (Portfolio Service)

# 3. Check what's missing
cat $FILE | sed -n '${LINE},$p'
# Analysis: Service exists, but methods return mock data

# 4. Determine action needed
If contracts missing → implement-feature.md Phase 1-2
If service stub → implement-feature.md Phase 4
If adapter missing → implement-feature.md Phase 5
If route missing → implement-feature.md Phase 6

# 5. Complete implementation
Follow implement-feature.md for missing phases
Remove ALL mocks/TODOs
Add real calculations/logic

# 6. Validate
pnpm run type-check  # Must pass
pnpm run lint        # Must pass
grep "TODO\|mock" $FILE  # Should find nothing

# 7. Move to next TODO
```

**Critical Rules:**
- Don't just update the comment - implement the feature!
- NO partial fixes - complete the entire feature
- Remove TODO comment only when fully implemented
- Validate that feature actually works

### 4. Real-World Example

**Scenario: TODO tracker finds 15 TODOs in portfolio.service.ts**

```typescript
// Current state (INCOMPLETE):
class PortfolioService {
    // TODO: Implement real calculation
    async calculateTotalValue(holdings: Holding[]): Promise<number> {
        return 100000;  // HARDCODED!
    }
    
    // TODO: Replace with API call
    async getHoldings(userId: string): Promise<Holding[]> {
        return [];  // MOCK!
    }
    
    // TODO: Add risk metrics
    // async calculateRisk() { ... }  // COMMENTED OUT!
}
```

**❌ WRONG: Update comments only**
```typescript
// "Improved" but still broken:
// NOTE: Returns hardcoded value for now
async calculateTotalValue(holdings: Holding[]): Promise<number> {
    return 100000;  // Still hardcoded! Still not production-ready!
}
```

**✅ CORRECT: Complete the feature (TRADING-004-A)**

```bash
# Step 1: Identify feature
Product Plan Section 7.4: TRADING-004-A Portfolio Service

# Step 2: Use implement-feature.md
Phase 1: PortfolioSchema, HoldingSchema already exist ✓
Phase 2: IPortfolioService interface needs methods added
Phase 3: portfolio-transformer.ts exists ✓
Phase 4: Complete PortfolioService implementation:

# Implementation:
class PortfolioService implements IPortfolioService {
    async calculateTotalValue(holdings: Holding[]): Promise<number> {
        // Real calculation
        return holdings.reduce((total, h) => {
            return total + (h.quantity * h.averagePrice);
        }, 0);
    }
    
    async getHoldings(userId: string): Promise<Holding[]> {
        // Real API call
        const response = await zerodhaAdapter.getHoldings();
        return portfolioTransformer.toDomain(response);
    }
    
    async calculateRisk(holdings: Holding[]): Promise<RiskMetrics> {
        // Uncommented and fully implemented
        const correlation = this.calculateCorrelation(holdings);
        const var95 = this.calculateVaR(holdings);
        return { correlation, var95 };
    }
}

# Step 3: Validation
pnpm run type-check  # ✅ 0 errors
pnpm run lint        # ✅ 0 errors
grep "TODO\|mock" portfolio.service.ts  # ✅ Not found

# Result: All 15 TODOs resolved, feature production-ready!
```

### 5. Update TODO Status

After completing each item:

```bash
# Documentation TODO
1. Mark as complete in docs/todo/ file
2. Log summary in docs/AITracking/AIAction_DD-MM-YYYY.md

# Code TODO
1. Remove TODO comment from code
2. Ensure full implementation in place
3. Validate: grep -r "TODO" <file>  # Should not find the resolved item
4. Log in AITracking
```

---

## 📋 **TODO Resolution Checklist**

For each TODO:

- [ ] Read and understand requirement
- [ ] Check if feature exists in Product Plan Section 7.4
- [ ] Verify contracts exist (create if missing)
- [ ] Implement full production solution (NO mocks/stubs)
- [ ] Wire to real services/APIs
- [ ] Remove TODO comment from code
- [ ] Type-check passes: `pnpm run type-check`
- [ ] Lint passes: `pnpm run lint`
- [ ] NO new errors introduced
- [ ] Update TODO tracking doc
- [ ] Log in AITracking

**ONLY proceed to next TODO after ALL checks pass**

---

## 🚨 **Common TODO Categories**

### 1. Missing Implementation
```typescript
// TODO: Implement risk calculation
// Action: Implement full risk calculation logic following Product Plan
```
**Resolution**: Use [implement-feature.md](implement-feature.md) to add feature

### 2. Mock Data
```typescript
// TODO: Replace with real API call
return { mockData: true };
```
**Resolution**: Wire to real adapter, remove mock data

### 3. Missing Validation
```typescript
// TODO: Add Zod validation
```
**Resolution**: Add schema to contracts, use .parse() at IO boundary

### 4. Incomplete Logic
```typescript
// TODO: Handle edge cases
```
**Resolution**: Implement complete logic with all edge cases

### 5. Missing Error Handling
```typescript
// TODO: Add error handling
```
**Resolution**: Add try/catch, validate inputs, handle failures

---

## 🔍 **TODO Detection Commands**

```bash
# Find all TODO comments in code
grep -r "TODO\|FIXME\|HACK" packages/ apps/ --include="*.ts" --include="*.tsx"

# Count TODOs by category
grep -r "TODO.*implement" packages/ --include="*.ts" | wc -l
grep -r "TODO.*mock" packages/ --include="*.ts" | wc -l
grep -r "TODO.*validation" packages/ --include="*.ts" | wc -l

# Check specific file for TODOs
grep -n "TODO" packages/shared/src/services/order.service.ts
```

---

## ⚡ **Priority Workflow**

```
1. Blockers (prevents system from running)
   ↓
2. Critical (core features incomplete)
   ↓
3. High (important functionality)
   ↓
4. Medium (enhancements)
   ↓
5. Low (nice-to-haves)
```

**Always work top-down** - Complete higher priority items first.

---

## 📝 **Example: Complete TODO Resolution**

```typescript
// BEFORE (with TODO):
async calculateRisk(portfolio: Portfolio): Promise<RiskMetrics> {
    // TODO: Implement real risk calculation
    return {
        var: 0,  // MOCK
        sharpeRatio: 0,  // MOCK
        maxDrawdown: 0  // MOCK
    };
}

// AFTER (full implementation):
async calculateRisk(portfolio: Portfolio): Promise<RiskMetrics> {
    // Calculate Value at Risk
    const returns = this.calculateReturns(portfolio.holdings);
    const var95 = this.calculateVaR(returns, 0.95);
    
    // Calculate Sharpe Ratio
    const avgReturn = this.average(returns);
    const stdDev = this.standardDeviation(returns);
    const sharpeRatio = (avgReturn - this.riskFreeRate) / stdDev;
    
    // Calculate Maximum Drawdown
    const drawdowns = this.calculateDrawdowns(portfolio.historicalValues);
    const maxDrawdown = Math.min(...drawdowns);
    
    return {
        var: var95,
        sharpeRatio,
        maxDrawdown
    };
}
```

**Steps taken:**
1. ✅ Removed TODO comment
2. ✅ Implemented real calculations
3. ✅ NO mock/hardcoded data
4. ✅ Used proper math/logic
5. ✅ Production-grade code

---

## 🎓 **References**

- **Feature Implementation**: [.cursor/commands/implement-feature.md](implement-feature.md)
- **Error Fixes**: [.cursor/commands/fix-all.md](fix-all.md)
- **All Patterns**: [.cursor/rules/CORE_RULES.mdc](../rules/CORE_RULES.mdc)
- **Product Plan**: `docs/Product/Product Plan/Product_Plan.md` Section 7.4

---

## 🏭 **ELIMINATION RULE: NO NEW TODOs**

**While resolving TODOs:**
- ❌ DO NOT replace TODO with FIXME
- ❌ DO NOT add new TODOs
- ❌ DO NOT defer with "temporary"
- ✅ IMPLEMENT fully
- ✅ DELETE the TODO
- ✅ Production code only

**Progress metric:**
```bash
Before: 100 TODOs
After: 95 TODOs ✅ (5 eliminated)
After: 103 TODOs ❌ (added 3 - FAIL)
```

---

**Status**: ✅ ACTIVE - TODO processing workflow  
**Next Review**: After processing first 20 TODOs  
**Last Updated**: 04-11-2025
