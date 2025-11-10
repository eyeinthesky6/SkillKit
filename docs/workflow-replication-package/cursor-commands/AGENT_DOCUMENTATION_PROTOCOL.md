# Agent Documentation Protocol

**Purpose:** Clarify which docs agents READ vs EDIT  
**Date:** 04-11-2025

---

## 📖 **REFERENCE DOCUMENTS (READ ONLY - DO NOT EDIT)**

### **Commands**
```
✅ .cursor/commands/implement-feature.md - Implementation protocol
✅ .cursor/commands/FEATURE_FIX_STRATEGY.md - Fix strategy with real data
✅ .cursor/commands/fix-all.md - Error resolution workflow
✅ .cursor/commands/todo-execution.md - TODO processing workflow
```

**Agent Action:** READ these for protocols, follow the steps

---

### **Rules**
```
✅ .cursor/rules/CORE_RULES.mdc - All patterns consolidated (workflow, contracts, validation, auth)
```

**Agent Action:** READ these for patterns and rules to follow

---

### **Configuration**
```
✅ agents.yaml - Agent configuration (user may update)
✅ agent-rules.yaml - Detailed rules (user may update)
```

**Agent Action:** READ for entry points and rules (DO NOT EDIT)

---

### **Quick References**
```
✅ .cursor/WORKFLOW_QUICK_START.md - Fast reference
✅ .cursor/WORKFLOW_FINAL_AMENDMENTS.md - Data-driven summary
✅ .cursor/TEST_NEW_WORKFLOW.md - Test scenarios
✅ .cursor/ALIGNMENT_VERIFICATION.md - Verification checklist
```

**Agent Action:** READ for quick lookups (DO NOT EDIT)

---

## ✍️ **AGENT-CREATED DOCUMENTS (CREATE & UPDATE)**

### **Execution Logs**
```
📝 docs/audit/Feature_Fix_Execution_<FEATURE-ID>_<DATE>.md
```

**Template:** `docs/audit/FEATURE_FIX_TEMPLATE.md`

**🚨 MANDATORY NAMING RULES:**
1. **Get EXACT Feature ID from:**
   - `docs/Product/feature_registry.csv` (FeatureID column)
   - `docs/tech/service-catalog.csv` (FeatureID column)
   - `docs/Product/Product Plan/Product_Plan.md` (Section 7.4)
2. **Use EXACT ID** (no variations, no abbreviations, no "fee" instead of "FEE-001")
3. **Format:** `Feature_Fix_Execution_<EXACT-FEATURE-ID>_<DD-MM-YYYY>.md`

**When to Create:**
- When completing a feature using FEATURE_FIX_STRATEGY.md
- One log per feature completion
- Track all phases, validations, results

**✅ CORRECT Examples:**
```
docs/audit/Feature_Fix_Execution_FEE-001_04-11-2025.md (ID from feature_registry.csv)
docs/audit/Feature_Fix_Execution_ANALYTICS-001_05-11-2025.md (ID from service-catalog.csv)
docs/audit/Feature_Fix_Execution_TRADING-003-A_05-11-2025.md (ID from Product_Plan.md Section 7.4)
```

**❌ FORBIDDEN (Generic/Vague/Wrong):**
```
docs/audit/Feature_Fix_Execution_04-11-2025.md (NO Feature ID - impossible to trace!)
docs/audit/Feature_Fix_Execution_fee_service_04-11-2025.md (Wrong format - use FEE-001)
docs/audit/fix-fees.md (No structure - impossible to find later)
docs/audit/Feature_Fix_Execution_fees_04-11-2025.md (Vague - which fee feature?)
```

---

### **AI Tracking**
```
📝 docs/AITracking/AIAction_<DATE>_<TASK-NAME>.md
```

**When to Create:**
- For EVERY coding session
- Append summary of actions taken
- Include files edited, errors fixed, features completed

**Example:**
```
docs/AITracking/AIAction_04-11-2025_FEE-001-completion.md
docs/AITracking/AIAction_05-11-2025_fix-portfolio-service.md
```

---

### **Sprint Status**
```
📝 docs/SprintStatus/Sprint Status-<DATE>.md
```

**When to Update:**
- After git push
- Append implementation summary
- List changes, testing needs, broken items

**Example:**
```
docs/SprintStatus/Sprint Status-04-11-2025.md
```

---

### **TODO Tracker Results**
```
📝 docs/audit/Comprehensive_TODO_Analysis_<DATE>.md
```

**Auto-Generated:** By `scripts/validation/todo-tracker.cjs`

**Agent Action:** READ results, DO NOT EDIT

---

## 🔄 **Workflow by Document Type**

### **When Implementing Feature:**

1. **READ:**
   - `.cursor/commands/implement-feature.md` (protocol)
   - `.cursor/rules/CORE_RULES.mdc` (all patterns)

2. **CREATE:**
   - `docs/AITracking/AIAction_<DATE>_<FEATURE-ID>-implementation.md`

3. **UPDATE (after push):**
   - `docs/SprintStatus/Sprint Status-<DATE>.md`

---

### **When Fixing Incomplete Feature:**

1. **READ:**
   - `.cursor/commands/FEATURE_FIX_STRATEGY.md` (strategy & priority)
   - `.cursor/commands/implement-feature.md` (phases to complete)
   - `docs/audit/FEATURE_FIX_TEMPLATE.md` (template)

2. **CREATE:**
   - `docs/audit/Feature_Fix_Execution_<FEATURE-ID>_<DATE>.md` (use template)
   - `docs/AITracking/AIAction_<DATE>_<FEATURE-ID>-completion.md`

3. **UPDATE (after push):**
   - `docs/SprintStatus/Sprint Status-<DATE>.md`

---

### **When Fixing Errors:**

1. **READ:**
   - `.cursor/commands/fix-all.md` (workflow)
   - `.cursor/commands/FEATURE_FIX_STRATEGY.md` (if 20+ errors)

2. **CREATE:**
   - `docs/AITracking/AIAction_<DATE>_error-fixes.md`

3. **UPDATE (after push):**
   - `docs/SprintStatus/Sprint Status-<DATE>.md`

---

### **When Processing TODOs:**

1. **READ:**
   - `.cursor/commands/todo-execution.md` (workflow)
   - `docs/audit/Comprehensive_TODO_Analysis_<DATE>.md` (latest results)

2. **CREATE:**
   - `docs/AITracking/AIAction_<DATE>_todo-resolution.md`

3. **UPDATE (after push):**
   - `docs/SprintStatus/Sprint Status-<DATE>.md`

---

## 📊 **Document Lifecycle**

### **Reference Docs (Static)**
```
Created once → Updated by user only → Agents READ
```

Examples: implement-feature.md, FEATURE_FIX_STRATEGY.md

---

### **Execution Logs (Per-Feature)**
```
Created per feature → Completed once → Archive
```

Examples: Feature_Fix_Execution_FEE-001_04-11-2025.md

---

### **Tracking Docs (Append-Only)**
```
Created per session → Append summary → Accumulates history
```

Examples: AIAction_04-11-2025_task-name.md

---

### **Status Docs (Daily Updates)**
```
Created daily → Append after each push → Daily summary
```

Examples: Sprint Status-04-11-2025.md

---

## 🚨 **Critical Rules**

### **NEVER EDIT:**
- ❌ .cursor/commands/*.md (reference protocols)
- ❌ .cursor/rules/*.mdc (enforcement rules)
- ❌ agents.yaml / agent-rules.yaml (configuration)
- ❌ docs/tech/*.md (canonical documentation)
- ❌ docs/Product/Product Plan/*.md (product requirements)

### **ALWAYS CREATE:**
- ✅ docs/audit/Feature_Fix_Execution_*.md (feature completion logs)
- ✅ docs/AITracking/AIAction_*.md (session summaries)

### **ALWAYS UPDATE (append):**
- ✅ docs/SprintStatus/Sprint Status-<DATE>.md (after git push)

---

## ✅ **Quick Decision Tree**

```
Am I about to edit a file?
     ↓
Is it in .cursor/commands/ or .cursor/rules/?
     ↓ YES → ❌ STOP! These are REFERENCE docs (READ ONLY)
     ↓ NO
     ↓
Is it in docs/audit/ or docs/AITracking/?
     ↓ YES → ✅ OK if I created it OR appending to Sprint Status
     ↓ NO
     ↓
Is it in docs/tech/ or docs/Product/?
     ↓ YES → ❌ STOP! These are CANONICAL docs (user maintains)
     ↓ NO
     ↓
Is it actual code (packages/, apps/)?
     ↓ YES → ✅ OK (this is what I'm supposed to edit!)
```

---

**Last Updated:** 04-11-2025  
**Purpose:** Prevent agents from editing reference documents  
**Next Review:** After first agent confusion about which docs to edit

