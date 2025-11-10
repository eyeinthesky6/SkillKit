# CONTINUE - Universal Resume (Code + Non-Code)

**⚡ TL;DR:** Detect task type, restate context, auto-resume work

---

## 📋 **Protocol (Auto-Detects Task Type)**

```bash
# 1. Find last conversation context (last 50 messages)
LAST_CONTEXT=$(tail -50 conversation_history)  # Agent's internal context

# 2. Detect task type
if [[ "$LAST_CONTEXT" == *"@feature"* ]] || [[ "$LAST_CONTEXT" == *"Phase"* ]]; then
  TASK_TYPE="CODE"
  FEATURE_ID=$(echo "$LAST_CONTEXT" | grep -oP '@feature:\K[A-Z0-9-]+' | tail -1)
  PHASE=$(echo "$LAST_CONTEXT" | grep -oP 'Phase \K[0-9]+' | tail -1)
  CONTEXT="Feature: $FEATURE_ID, Phase: $PHASE"
elif [[ "$LAST_CONTEXT" == *"audit"* ]] || [[ "$LAST_CONTEXT" == *"review"* ]]; then
  TASK_TYPE="AUDIT"
  AUDIT_TYPE=$(echo "$LAST_CONTEXT" | grep -oP '(SYSTEM|SECURITY|DOCUMENTATION)_AUDIT' | tail -1)
  CONTEXT="Audit: $AUDIT_TYPE"
elif [[ "$LAST_CONTEXT" == *"workflow"* ]] || [[ "$LAST_CONTEXT" == *"command"* ]]; then
  TASK_TYPE="WORKFLOW"
  TASK=$(echo "$LAST_CONTEXT" | grep -oP 'working on.*' | head -1)
  CONTEXT="Task: $TASK"
else
  TASK_TYPE="DISCUSSION"
  CONTEXT="Continuing discussion"
fi

# 3. State context (1 line)
echo "📍 Resuming $TASK_TYPE: $CONTEXT"

# 4. IMMEDIATELY continue (no asking)
# Agent continues from last point in conversation
```

---

## 🔒 **Agent MUST**

**When @CONTINUE.md invoked:**

1. ✅ Read last 50 messages in conversation
2. ✅ Detect task type (CODE/AUDIT/WORKFLOW/DISCUSSION)
3. ✅ State context in 1 line max
4. ✅ **IMMEDIATELY resume** (no asking)

**❌ DO NOT:**
- ❌ Ask "Continue? (y/n)"
- ❌ Wait for confirmation
- ❌ Show reports
- ❌ Suggest different tasks

---

## 🎯 **Examples by Task Type**

### **A. Code Task**
```
User: "@CONTINUE.md"
Agent: "📍 Resuming CODE: FEE-001 Phase 4"
Agent: [Implements next method, runs lint]
```

### **B. Audit Task**
```
User: "@CONTINUE.md"
Agent: "📍 Resuming AUDIT: SECURITY_AUDIT"
Agent: [Continues dependency scan, reports findings]
```

### **C. Workflow/Config Task**
```
User: "@CONTINUE.md"
Agent: "📍 Resuming WORKFLOW: Updating CONTINUE.md"
Agent: [Continues editing workflow commands]
```

### **D. Discussion Task**
```
User: "@CONTINUE.md"
Agent: "📍 Resuming DISCUSSION: Command chaining strategy"
Agent: [Continues analysis, proposes solutions]
```

**Works for ALL task types!**

---

**Status**: ✅ Use to prevent drift and auto-resume work

