# Workflow Decision Tree

**For Agents:** Follow this to choose correct workflow

---

## Entry Point: Always Start with BEGIN_SESSION

User says: `@BEGIN_SESSION.md`

**This runs diagnostics and presents menu**

---

## Decision Tree

```
START
  ↓
Run tsk diagnose
  ↓
Get ERROR_COUNT, WARN_COUNT
  ↓
┌─────────────────────────────────┐
│ ERROR_COUNT > 50?               │
│  YES → Route to FIX_BUGS        │
│  NO  → Continue                 │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│ BUILD failing?                  │
│  YES → Route to FIX_BUGS        │
│  NO  → Continue                 │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│ TEST_FAILURES > 10?             │
│  YES → Route to FIX_BUGS        │
│  NO  → Continue                 │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│ User wants to:                  │
│  1. New feature → IMPLEMENT     │
│  2. Fix bugs    → FIX_BUGS      │
│  3. Check dupes → DEDUP         │
│  4. Deploy prep → DEPLOY_PREP   │
│  5. Skills      → tsk install   │
│  6. Resume      → CONTINUE      │
│  7. Audit       → SYSTEM_AUDIT  │
└─────────────────────────────────┘
```

---

## Smart Recommendations

**Scenario A: High Errors**
- ERROR_COUNT > 50
- **Recommend:** "Fix errors first (critical)"
- **Route to:** FIX_BUGS.md

**Scenario B: Moderate Errors**
- ERROR_COUNT 11-50
- **Recommend:** "Consider fixing before features"
- **Ask user:** "Fix first or continue?"

**Scenario C: Minor Errors**
- ERROR_COUNT 1-10
- **Recommend:** "Can proceed with features"
- **Note:** "Fix errors after feature work"

**Scenario D: Clean**
- ERROR_COUNT = 0
- **Recommend:** "System healthy, ready for work"
- **Route to:** User choice (likely IMPLEMENT_FEATURE)

---

## Workflow Selection Logic

### IMPLEMENT_FEATURE
**When:**
- Building new functionality
- Adding new code
- System relatively clean (errors < 20)

**Not when:**
- High error count (fix first)
- Build failing (fix first)

### FIX_BUGS
**When:**
- ERROR_COUNT > 10
- Build failing
- Tests failing
- User explicitly wants to fix

**Process:**
- One file at a time
- Validate after each
- Check for patterns

### DEDUP
**When:**
- User suspects duplicate code
- Before major refactor
- Periodic maintenance (monthly)

**Not when:**
- Active feature work
- High error count (fix first)

### DEPLOY_PREP
**When:**
- About to deploy
- End of sprint
- Release preparation

**Requires:**
- ERROR_COUNT = 0
- All tests passing
- Build successful

### CONTINUE
**When:**
- Resuming after break
- Mid-session restart
- Cursor crashed/reloaded

**Checks:**
- Last work status
- If incomplete, offer to resume

### SYSTEM_AUDIT
**When:**
- Start of sprint
- Monthly health check
- Major milestone reached

**Generates:**
- Full health report
- Action plan
- Priority list

### SECURITY_AUDIT
**When:**
- Before deployment
- Quarterly review
- After dependency updates

**Checks:**
- Vulnerable deps
- Hardcoded secrets
- Risky patterns

---

## Agent Instructions

### Step 1: Always Start with Diagnostics
```bash
tsk diagnose --json > /tmp/diagnostics.json
```

### Step 2: Extract Key Metrics
```bash
ERROR_COUNT=$(grep -c "error" /tmp/diagnostics.json || echo "0")
WARN_COUNT=$(grep -c "warning" /tmp/diagnostics.json || echo "0")
```

### Step 3: Apply Decision Logic

```bash
if [ "$ERROR_COUNT" -gt 50 ]; then
  echo "🔴 Critical: ${ERROR_COUNT} errors"
  echo "Recommend: @FIX_BUGS.md"
elif [ "$ERROR_COUNT" -gt 10 ]; then
  echo "🟡 Moderate: ${ERROR_COUNT} errors"
  echo "Suggest: Fix first, but can proceed if urgent"
elif [ "$ERROR_COUNT" -gt 0 ]; then
  echo "🟢 Minor: ${ERROR_COUNT} errors"
  echo "OK to proceed with features"
else
  echo "✅ Clean: 0 errors"
  echo "Ready for any work"
fi
```

### Step 4: Present Menu
Show numbered menu from BEGIN_SESSION.md

### Step 5: Route Based on Choice
Match number to workflow file

---

## Common Patterns

### Pattern A: Morning Start
```
User: "@BEGIN_SESSION.md"
Agent: [Runs diagnostics]
Agent: "42 errors, 15 warnings"
Agent: "Recommend: Fix errors first"
Agent: [Shows menu]
User: "2"
Agent: "@FIX_BUGS.md"
```

### Pattern B: Clean Start
```
User: "@BEGIN_SESSION.md"
Agent: [Runs diagnostics]
Agent: "0 errors, 2 warnings"
Agent: "System healthy, ready for work"
Agent: [Shows menu]
User: "1"
Agent: "@IMPLEMENT_FEATURE.md"
```

### Pattern C: Resume Work
```
User: "@BEGIN_SESSION.md"
Agent: [Checks last work]
Agent: "Last task incomplete: Feature X"
Agent: "Continue or start new?"
User: "Continue"
Agent: "@CONTINUE.md"
```

---

## Error Handling

### If tsk command not found
```
"SkillKit not installed. Install: npm install -g @trinity-os/skillkit"
```

### If diagnostics fail
```
"Could not run diagnostics. Check project setup."
"Proceeding with manual menu..."
```

### If workflow file not found
```
"Workflow not generated yet. Run: tsk workflow --all"
```

---

## Quick Reference

| User Intent | ERROR_COUNT | Route To |
|-------------|-------------|----------|
| Any | >50 | FIX_BUGS (forced) |
| New feature | 0-10 | IMPLEMENT_FEATURE |
| New feature | 11-50 | Ask user (suggest fix first) |
| Fix bugs | Any | FIX_BUGS |
| Deploy | Must be 0 | DEPLOY_PREP |
| Check dupes | <20 | DEDUP |
| Resume | N/A | CONTINUE |
| Audit | N/A | SYSTEM_AUDIT |

---

**For Agents:** This is your routing logic. Follow it every session.

