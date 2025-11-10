# Implement Feature - Contracts-First Protocol

**🏭 PRODUCTION HARDENING:** ❌ NO mocks/stubs/TODOs ✅ ONLY production-grade code matching Product Plan

**Status**: ✅ PRIMARY COMMAND for feature implementation  
**Last Updated**: 04-11-2025  
**Purpose**: Step-by-step protocol for implementing features using contracts-first architecture

---

## 🎯 **When to Use This Command**

Use when user says:
- "Implement [Feature ID]"
- "Add [feature name]"
- "Create [service/feature]"
- "Build [functionality]"

---

## ⚡ **Execution Protocol (7 Phases)**

**CRITICAL**: Follow phases IN ORDER. Validate after EACH phase. STOP if any validation fails.

---

### **Phase -1: Pre-Flight Check** 🚨 **Agent Collision Detection**

**BEFORE validation - check if another agent is working on this:**

```bash
# Check for existing work on this feature
find docs/audit/ -name "*[FEATURE-ID]*" -type f -mmin -240
find docs/AITracking/ -name "*$(date +"%d-%m-%Y")_*[FEATURE-ID]*" -type f

# Check for partial implementation
grep -r "[FeatureName]Schema" packages/shared/src/contracts/
grep -r "[FeatureName]Service" packages/shared/src/services/

# Check Sprint Status
grep -i "[FEATURE-ID]" "docs/SprintStatus/Sprint Status-$(date +"%d-%m-%Y").md" 2>/dev/null
```

**If collision detected:**
- 🔴 STOP - Report to user
- Show existing work found
- Offer: a) Review & continue, b) Work on different feature
- Wait for user decision

**If clear:**
- 🟢 Proceed to Phase 0

---

### **Phase 0: Pre-Implementation Validation**

**Step 0: DEDUP Check** 🔴 **CRITICAL (Records Issues)**

```bash
bash .cursor/commands/DEDUP.md check "feature name"
# Detects duplicates, records to /tmp/dedup_issues_YYYYMMDD.log
# Doesn't stop workflow, but MUST resolve before complete
# Agent continues to implementation, addresses at end
```

**See:** [CORE_RULES.mdc](../rules/CORE_RULES.mdc) (Section: Agent Collision Prevention)

---

### **Phase 0: Pre-Validation** 🚨 **MANDATORY - STOP IF ANY CHECK FAILS**

#### Step 0.1: Read Core Rules
```bash
# Read architecture and workflow rules
READ: agents.yaml (lines 1-260) - Architecture decisions, status
READ: agent-rules.yaml (enforcement_rules section) - Mandatory patterns
READ: .cursor/rules/CORE_RULES.mdc - Workflow checklist
```

**Output**: Confirm understanding of:
- Contracts-first architecture
- Import patterns (barrel imports only)
- Zod validation boundaries (IO only)
- Package structure

#### Step 0.2: Feature Registry Verification
```bash
# Verify feature exists in Product Plan
OPEN: docs/Product/Product Plan/Product_Plan.md
NAVIGATE TO: Section 7.4 - Feature Traceability Index

# Manual checks (NO AUTOMATION):
✓ Feature ID exists (e.g., TRADING-001-A)
✓ Feature name matches exactly
✓ Domain assignment correct (TRADING/PLATFORM/RISK/DATA/UI)
✓ Check for aliases (e.g., legacy IDs)
✓ Feature marked as "Current" (not "Future Feature")
```

**STOP**: If feature NOT in Section 7.4:
- ❌ DO NOT implement
- 📋 Report missing feature to user
- ✅ Wait for user to add to Product Plan first

#### Step 0.3: Duplication Prevention Check
```bash
# Search for existing implementations (REPLACE "ServiceName" with actual name)

# 1. Search all packages
grep -r "ServiceName" packages/*/src/ --include="*.ts" --include="*.tsx"

# 2. Search contracts specifically
grep -r "ServiceName" packages/shared/src/contracts/ --include="*.ts"

# 3. Check service catalog
grep -i "servicename" docs/tech/service-catalog.csv

# 4. Find files with similar names
find packages/ -name "*ServiceName*" -type f | grep -v node_modules

# 5. Check for similar functionality
grep -r "similarFunctionality\|relatedFeature" packages/*/src/ --include="*.ts"
```

**STOP**: If existing code found:
- 🔄 Use existing implementation instead of creating duplicate
- 📋 Report duplication to user
- ❌ DO NOT create new duplicate code

#### Step 0.4: Package Placement Validation
```bash
# Determine correct package location
OPEN: docs/tech/PACKAGE_SERVICE_MAPPING.md
USE: Decision tree (Lines 240-272)

# Questions to answer:
1. What am I writing? (Contract/Service/Adapter/Route/UI)
2. Is it domain logic or platform service?
3. Does it integrate with external API?
4. Is it browser-safe or Node.js only?

# Verify against service catalog
CHECK: docs/tech/service-catalog.csv for similar services
```

**Common Mistakes to Prevent:**
- ❌ Creating `apps/api/src/services/` → Services belong in `packages/*/src/services/`
- ❌ Putting broker services in `broker-kit` → Goes in `shared/services/platform/`
- ❌ Using `.parse()` in services → Only at IO boundaries
- ❌ Creating contracts in `apps/` → Contracts belong in `packages/shared/src/contracts/`

**Output**: Confirm exact file paths for all artifacts to be created.

**✅ CHECKPOINT**: All Phase 0 checks passed? Report findings to user before proceeding.

---

### **Phase 1: Contracts Foundation** 📋

**Goal**: Define ALL schemas BEFORE any implementation

**🚨 CRITICAL: If modifying EXISTING contracts, check consumers FIRST:**

```bash
# Find ALL consumers of the contract you want to change
grep -r "SchemaName\|TypeName" packages/ apps/ --include="*.ts" --include="*.tsx"

# Examples:
# grep -r "OrderRequestSchema\|OrderRequest" packages/ apps/ --include="*.ts" --include="*.tsx"
# grep -r "PositionSchema\|Position" packages/ apps/ --include="*.ts" --include="*.tsx"

# RULES:
# - If > 3 consumers → Report to user, wait for approval
# - If changing → Update ALL consumers in SAME commit (one feature at a time)
# - Run type-check after EACH consumer update
# - NEVER change contracts without updating consumers
```

#### Step 1.1: Define Enums/Constants
```typescript
// Location: packages/shared/src/contracts/shared/enums.contract.ts

// Define ALL enums needed for feature
export const OrderSideEnum = z.enum(['BUY', 'SELL']);
export const OrderTypeEnum = z.enum(['MARKET', 'LIMIT', 'SL', 'SL_M']);
export const ProductTypeEnum = z.enum(['DELIVERY', 'INTRADAY', 'MTF']);

// Export types
export type OrderSide = z.infer<typeof OrderSideEnum>;
export type OrderType = z.infer<typeof OrderTypeEnum>;
export type ProductType = z.infer<typeof ProductTypeEnum>;
```

**Rules:**
- ✅ Use `z.enum()` for all enums (NO TypeScript enums)
- ✅ Export both schema (`OrderSideEnum`) and type (`OrderSide`)
- ✅ Check for existing enums before creating new ones

#### Step 1.2: Define Domain Schemas
```typescript
// Location: packages/shared/src/contracts/domain/{feature}.contract.ts

/**
 * Order creation request
 * @feature:TRADING-003-A
 */
export const OrderRequestSchema = z.object({
    symbol: z.string().min(1).max(20),
    quantity: z.number().positive().int(),
    side: OrderSideEnum,
    orderType: OrderTypeEnum,
    productType: ProductTypeEnum,
    price: z.number().positive().optional(),
    triggerPrice: z.number().positive().optional(),
    validity: ValidityEnum
});

/**
 * Order creation response
 * @feature:TRADING-003-A
 */
export const OrderResponseSchema = z.object({
    orderId: z.string(),
    status: OrderStatusEnum,
    message: z.string().optional(),
    timestamp: z.string().datetime()
});

// Export types
export type OrderRequest = z.infer<typeof OrderRequestSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
```

**Rules:**
- ✅ Define ALL request/response schemas
- ✅ Add JSDoc with `@feature:XXX` tags
- ✅ Use descriptive validation (min, max, positive, etc.)
- ❌ NO `z.any()` or `z.unknown()` (use explicit types)
- ❌ NO `.catchall()` or `.passthrough()` (define all keys)

#### Step 1.3: Define Integration/Broker Schemas (if needed)
```typescript
// Location: packages/shared/src/contracts/integration/{broker}.contract.ts

/**
 * Zerodha API order response
 * @feature:TRADING-003-A
 */
export const ZerodhaOrderResponseSchema = z.object({
    order_id: z.string(),
    status: z.string(),
    message: z.string().optional()
    // ... broker-specific fields
});

export type ZerodhaOrderResponse = z.infer<typeof ZerodhaOrderResponseSchema>;
```

#### Step 1.4: Update Barrel Exports (EXPLICIT NAMED EXPORTS)
```typescript
// Location: packages/shared/src/contracts/domain/index.ts

// ✅ CORRECT: Explicit named exports
export {
    OrderRequestSchema,
    OrderResponseSchema,
    type OrderRequest,
    type OrderResponse
} from './order.contract';

// ❌ FORBIDDEN: Wildcard exports
// export * from './order.contract';  // NEVER DO THIS
```

**Rules:**
- ✅ ONLY use explicit named exports
- ❌ NO wildcard exports (`export * from`)
- ✅ Group related exports together
- ✅ Export both schemas and types

**✅ VALIDATION CHECKPOINT:**
```bash
# Must pass with 0 errors
pnpm run type-check

# Verify no wildcard exports
grep -r "export \* from" packages/shared/src/contracts/
# Expected: 0 results

# Verify schemas exported
grep "export.*Schema" packages/shared/src/contracts/domain/index.ts
```

**STOP**: If validation fails, fix before proceeding to Phase 2.

---

### **Phase 2: Service Interface Contracts** 🔧

**Goal**: Define ALL method signatures BEFORE implementation

```typescript
// Location: packages/shared/src/contracts/domain/{feature}.contract.ts

/**
 * Order service interface
 * @feature:TRADING-003-A
 */
export interface IOrderService {
    /**
     * Create new order
     * @param request - Order creation request
     * @returns Promise resolving to order response
     */
    createOrder(request: OrderRequest): Promise<OrderResponse>;
    
    /**
     * Cancel existing order
     * @param orderId - ID of order to cancel
     * @returns Promise resolving when cancelled
     */
    cancelOrder(orderId: string): Promise<void>;
    
    /**
     * Modify existing order
     * @param orderId - ID of order to modify
     * @param modifications - Order modifications
     * @returns Promise resolving to updated order
     */
    modifyOrder(orderId: string, modifications: OrderModifyRequest): Promise<OrderResponse>;
    
    /**
     * Get order status
     * @param orderId - ID of order to query
     * @returns Promise resolving to order details
     */
    getOrderStatus(orderId: string): Promise<OrderResponse>;
    
    // Define ALL methods upfront - NO stubs, NO TODOs
}
```

**Rules:**
- ✅ Define ALL method signatures upfront
- ✅ Add JSDoc for each method
- ✅ Use z.infer types (NOT any/unknown)
- ✅ Return Promise for async operations
- ❌ NO implementation code (interface only)

**✅ VALIDATION CHECKPOINT:**
```bash
# Must pass with 0 errors
pnpm run type-check

# Verify interface exists
grep -r "export interface IOrderService" packages/shared/src/contracts/
```

---

### **Phase 3: Transformer Utilities** 🔄

**Goal**: Create data conversion utilities BEFORE service implementation

```typescript
// Location: packages/shared/src/utilities/{feature}-transformer.ts

import type { OrderRequest, OrderResponse } from '@profitpilot/shared/contracts';
import type { ZerodhaOrderResponse } from '@profitpilot/shared/contracts';

/**
 * Transform domain order request to Zerodha API format
 * @feature:TRADING-003-A
 */
export function domainOrderToZerodhaApi(order: OrderRequest): ZerodhaOrderRequest {
    return {
        tradingsymbol: order.symbol,
        quantity: order.quantity,
        transaction_type: order.side,
        order_type: mapOrderType(order.orderType),
        product: mapProductType(order.productType),
        price: order.price,
        trigger_price: order.triggerPrice,
        validity: mapValidity(order.validity)
    };
}

/**
 * Transform Zerodha API response to domain format
 * @feature:TRADING-003-A
 */
export function zerodhaApiToDomainOrder(response: ZerodhaOrderResponse): OrderResponse {
    return {
        orderId: response.order_id,
        status: mapZerodhaStatus(response.status),
        message: response.message,
        timestamp: new Date().toISOString()
    };
}

// Helper mapping functions
function mapOrderType(type: OrderType): string {
    const mapping: Record<OrderType, string> = {
        'MARKET': 'MARKET',
        'LIMIT': 'LIMIT',
        'SL': 'SL',
        'SL_M': 'SL-M'
    };
    return mapping[type];
}

// ... more mappers
```

**Rules:**
- ✅ Use z.infer<> types from contracts
- ✅ Pure functions only (no side effects)
- ❌ NO `.parse()` in transformers (data already validated)
- ✅ Create bidirectional transformers (to/from domain)
- ✅ Use helper mapping functions for clarity

**✅ VALIDATION CHECKPOINT:**
```bash
# Verify no .parse() in transformers
grep "\.parse(" packages/shared/src/utilities/*-transformer.ts
# Expected: 0 results

# Type-check must pass
pnpm run type-check
```

---

### **Phase 4: Service Implementation** 💼

**Goal**: Implement business logic using contracts and transformers

```typescript
// Location: packages/shared/src/services/trading/{feature}.service.ts

import type { IOrderService, OrderRequest, OrderResponse } from '@profitpilot/shared/contracts';
import { domainOrderToZerodhaApi, zerodhaApiToDomainOrder } from '@profitpilot/shared/utilities';
import { zerodhaAdapter } from '@profitpilot/shared/adapters';
import { logger } from '@profitpilot/shared/services';

/**
 * Order service implementation
 * @feature:TRADING-003-A
 */
export class OrderService implements IOrderService {
    /**
     * Create new order
     * @feature:TRADING-003-A
     */
    async createOrder(request: OrderRequest): Promise<OrderResponse> {
        logger.info('Creating order', { symbol: request.symbol, quantity: request.quantity });
        
        // Use transformer for data conversion
        const brokerRequest = domainOrderToZerodhaApi(request);
        
        // Call adapter (data already validated at IO boundary)
        const brokerResponse = await zerodhaAdapter.placeOrder(brokerRequest);
        
        // Transform back to domain
        const response = zerodhaApiToDomainOrder(brokerResponse);
        
        logger.info('Order created', { orderId: response.orderId });
        return response;
    }
    
    // Implement ALL interface methods - NO stubs, NO TODOs
    async cancelOrder(orderId: string): Promise<void> {
        // Full implementation
    }
    
    async modifyOrder(orderId: string, modifications: OrderModifyRequest): Promise<OrderResponse> {
        // Full implementation
    }
    
    async getOrderStatus(orderId: string): Promise<OrderResponse> {
        // Full implementation
    }
}

// Export singleton instance
export const orderService = new OrderService();
```

**Rules:**
- ✅ Implements interface defined in Phase 2
- ✅ Use z.infer<> types (NO .parse() in services)
- ✅ Use transformers from Phase 3
- ✅ Implement ALL methods (NO stubs/TODOs)
- ✅ Add logging for observability
- ✅ Export singleton instance
- ❌ NO business logic in adapters/routes

**✅ VALIDATION CHECKPOINT:**
```bash
# Verify service implements interface
grep "implements IOrderService" packages/shared/src/services/trading/*.service.ts

# Verify no .parse() in services
grep "\.parse(" packages/shared/src/services/ -r
# Expected: 0 results

# Type-check and lint must pass
pnpm run type-check
pnpm run lint
```

**STOP**: If validation fails, fix before proceeding to Phase 5.

---

### **Phase 5: Adapter Implementation** 🔌

**Goal**: Implement external API integration with validation at IO boundary

```typescript
// Location: packages/shared/src/adapters/brokers/zerodha.adapter.ts

import { ZerodhaOrderResponseSchema, type ZerodhaOrderResponse } from '@profitpilot/shared/contracts';
import { httpClient } from '@profitpilot/shared/services';

/**
 * Zerodha broker adapter
 * @feature:TRADING-003-A
 */
export class ZerodhaAdapter {
    /**
     * Place order via Zerodha API
     * @feature:TRADING-003-A
     */
    async placeOrder(request: ZerodhaOrderRequest): Promise<ZerodhaOrderResponse> {
        // Call external API
        const rawResponse = await httpClient.post('/orders', request);
        
        // ✅ .parse() at IO boundary - ONLY place for validation
        const validated = ZerodhaOrderResponseSchema.parse(rawResponse);
        
        return validated;
    }
    
    // Implement other methods
}

// Export singleton instance
export const zerodhaAdapter = new ZerodhaAdapter();
```

**Rules:**
- ✅ Use `.parse()` at IO boundary (ONLY in adapters)
- ✅ Validate ALL external API responses
- ✅ Use Zod schemas from contracts
- ✅ Handle errors appropriately
- ❌ NO business logic in adapters (data validation only)

**✅ VALIDATION CHECKPOINT:**
```bash
# Verify .parse() present in adapters
grep "\.parse(" packages/shared/src/adapters/ -r | wc -l
# Expected: >0 results

# Type-check and lint must pass
pnpm run type-check
pnpm run lint
```

---

### **Phase 6: API Route Implementation** 🌐

**Goal**: Implement HTTP endpoints with request validation

```typescript
// Location: apps/api/src/routes/orders.ts

import { FastifyPluginAsync } from 'fastify';
import { OrderRequestSchema, type OrderRequest } from '@profitpilot/shared/contracts';
import { orderService } from '@profitpilot/shared/services';
import { extractUserFromToken } from '../middleware/auth';

/**
 * Order management routes
 * @feature:TRADING-003-A
 */
export const ordersRoutes: FastifyPluginAsync = async (app) => {
    /**
     * Create new order
     * POST /api/orders
     * @feature:TRADING-003-A
     */
    app.post('/api/orders', async (req, res) => {
        // Auth middleware (2-line pattern)
        const user = extractUserFromToken(req);
        if (!user) throw new Error('Unauthorized');
        
        // ✅ .parse() at IO boundary - validate request
        const validated = OrderRequestSchema.parse(req.body);
        
        // Call service with validated data
        const result = await orderService.createOrder(validated);
        
        res.status(201).send(result);
    });
    
    // Implement other routes
};
```

**Rules:**
- ✅ Use `.parse()` for request validation (IO boundary)
- ✅ Auth middleware ALWAYS (2-line pattern)
- ✅ Call service with validated data
- ✅ Use z.infer types from contracts
- ❌ NO business logic in routes

**✅ VALIDATION CHECKPOINT:**
```bash
# Verify .parse() in routes
grep "\.parse(" apps/api/src/routes/ -r | wc -l
# Expected: >0 results

# Verify auth middleware present
grep -r "extractUserFromToken" apps/api/src/routes/orders.ts
# Expected: Present in all routes

# Type-check and lint must pass
pnpm run type-check
pnpm run lint

# Build must succeed
pnpm run build
```

**STOP**: If any validation fails, fix before Phase 7.

---

### **Phase 7: Documentation + Final DEDUP** 📝

**Step 7.0: Resolve Recorded Issues** 🔴 **MANDATORY**

```bash
bash .cursor/commands/RESOLVE_ISSUES.md

# If exit 1: Duplicates found → MUST consolidate
# - Run: DEDUP.md fix "feature name"
# - Consolidate into canonical file
# - Update all imports
# - Then re-run RESOLVE_ISSUES.md

# If exit 0: All clear → proceed
```

**Step 7.1: Final DEDUP Verification**

```bash
bash .cursor/commands/DEDUP.md verify "feature name"
# Ensures no new duplicates created
```

**Step 7.2: Documentation Updates**

#### Step 7.0: ⚠️ **CHECK FEATURE DEPENDENCY CHAIN** (MANDATORY FIRST)

**BEFORE marking feature complete:**

```bash
FEATURE_ID="YOUR-FEATURE-ID"  # e.g., FEE-001

# Check dependency chain
echo "🔗 Checking chain for $FEATURE_ID..."
grep -r "$FEATURE_ID" packages/shared/src/ apps/ --include="*.ts" | cut -d: -f1 | sort -u

# Check for errors
pnpm run type-check 2>&1 | grep "error TS" > /tmp/chain-check.log
ERRORS=$(wc -l < /tmp/chain-check.log)

if [ $ERRORS -gt 0 ]; then
  echo "❌ CHAIN BROKEN: Fix connected features first!"
  exit 1
fi

echo "✅ CHAIN COMPLETE: Safe to proceed"
```

---

#### Step 7.1: Update contracts/INDEX.md
```bash
# Manual update (NO AUTOMATION)
OPEN: packages/shared/src/contracts/INDEX.md

# Add feature mapping:
# - Feature ID: TRADING-003-A
# - Schemas: OrderRequestSchema, OrderResponseSchema
# - Types: OrderRequest, OrderResponse
# - Status: ✅ IMPLEMENTED
# - Date: DD-MM-YYYY
```

#### Step 7.2: Cross-Check Product Plan
```bash
# Manual verification (NO AUTOMATION)
OPEN: docs/Product/Product Plan/Product_Plan.md Section 7.4

# Verify:
✓ Feature ID matches contracts/INDEX.md exactly
✓ Feature name matches exactly
✓ No typos or mismatches
✓ Status updated to reflect implementation
```

#### Step 7.3: Update AI Tracking
```bash
# Append to tracking log
APPEND: docs/AITracking/AIAction_DD-MM-YYYY_<FEATURE-ID>-implementation.md

# 🚨 MANDATORY: Use EXACT Feature ID from feature_registry.csv or Product_Plan.md
# Examples:
#   docs/AITracking/AIAction_04-11-2025_FEE-001-implementation.md
#   docs/AITracking/AIAction_04-11-2025_TRADING-003-A-implementation.md

# Format:
# ## Feature Implementation: [Feature ID]
# - **Files Created**: List all files
# - **Contracts Defined**: List schemas/interfaces
# - **Services Implemented**: List services
# - **Validation Status**: All phases passed
# - **Testing Needs**: Integration tests required
```

**Rules:**
- ✅ MANUAL verification only (no automated scripts)
- ✅ Update BOTH Product Plan AND contracts/INDEX.md
- ✅ Verify consistency between documents
- ✅ Log implementation in AITracking

---

## ✅ **Success Criteria (All Must Pass)**

Before marking feature as complete:

- [ ] Phase 0: Pre-validation passed
- [ ] Phase 1: Contracts defined, **LINT + TYPE-CHECK pass (0 errors)**
- [ ] Phase 2: Interfaces defined, **LINT + TYPE-CHECK pass**
- [ ] Phase 3: Transformers created, **LINT + TYPE-CHECK pass**
- [ ] Phase 4: Services implemented, **LINT + TYPE-CHECK pass**
- [ ] Phase 5: Adapters implemented, **LINT + TYPE-CHECK pass**
- [ ] Phase 6: Routes implemented, **LINT + TYPE-CHECK pass**
- [ ] Phase 7.0: **All recorded issues resolved** (`RESOLVE_ISSUES.md` exits 0)
- [ ] Phase 7.1: Final DEDUP clean (no new duplicates)
- [ ] Phase 7.2: Dependency chain clean, **LINT + TYPE-CHECK pass**
- [ ] Tests created: `@CREATE_TESTS.md <FEATURE-ID>`
- [ ] Build succeeds: `pnpm run build`
- [ ] No TODOs/FIXMEs/mocks/stubs
- [ ] **FINAL CHECK passes**: `@FINAL_CHECK.md <FEATURE-ID>`

---

## 🚫 **Common Mistakes to Avoid**

1. **Skipping Phase 0 Validation**
   - ❌ Implementing without checking for duplicates
   - ✅ Always search codebase first

2. **Implementation Before Contracts**
   - ❌ Writing service code before schemas exist
   - ✅ Define ALL contracts first

3. **Incomplete Interfaces**
   - ❌ Adding "TODO" methods in interfaces
   - ✅ Define ALL method signatures upfront

4. **Parse in Wrong Places**
   - ❌ Using .parse() in services/transformers
   - ✅ Use .parse() ONLY at IO boundaries (adapters/routes)

5. **Wildcard Exports**
   - ❌ Using `export * from` in barrel files
   - ✅ Use explicit named exports

6. **Missing Auth**
   - ❌ Routes without auth middleware
   - ✅ ALL routes require 2-line auth pattern

---

## 📚 **Reference Documentation**

- **Architecture Rules**: `agents.yaml` (lines 1-260)
- **Enforcement Patterns**: `agent-rules.yaml` (enforcement_rules)
- **All Patterns Consolidated**: `.cursor/rules/CORE_RULES.mdc`
- **Import Patterns**: `docs/tech/IMPORT_PATTERNS_CANONICAL.md` (CANONICAL)
- **Package Placement**: `docs/tech/PACKAGE_SERVICE_MAPPING.md`
- **Resume Mid-Session**: `.cursor/commands/CONTINUE.md` (if interrupted)

---

## 🏭 **FINAL REMINDER: PRODUCTION STANDARDS**

**Before marking complete, verify:**
- ❌ ZERO mocks, stubs, placeholders
- ❌ ZERO TODOs, FIXMEs, "not implemented"
- ❌ ZERO basic/minimal implementations
- ✅ ALL code is production-grade
- ✅ EXCEEDS Product Plan requirements

**If you added ANY placeholders:**
- 🔴 Feature is NOT complete
- 🔴 Replace ALL with real logic
- 🔴 Run diagnostics again

---

**Last Updated**: 04-11-2025  
**Status**: ✅ ACTIVE - Primary command for feature implementation  
**Next Review**: After first 5 feature implementations

