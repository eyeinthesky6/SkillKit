# Fix Bugs

**Purpose:** Systematic error fixing

---

## {{CUSTOM_HEADER}}
<!-- Project-specific rules -->
---

## Phase 1: Find Issues

```bash
tsk diagnose --json > /tmp/issues.json
```

**What this does:** Lists all errors

---

## Phase 2: Prioritize

**Sort by severity:**
1. Build failures (blocks everything)
2. Test failures (functionality broken)
3. Type errors (safety issues)
4. Lint warnings (style issues)

**Fix order:** Top to bottom

---

## Phase 3: One File at a Time

**For each error file:**

1. Read error message carefully
2. Find root cause (not just symptom)
3. Fix the issue
4. Check for same pattern elsewhere

---

## Phase 4: Validate After Each Fix

```bash
tsk exec lint      # If fixing lint errors
tsk exec typecheck # If fixing type errors
tsk exec test      # If fixing test failures
```

**What this does:** Verifies fix worked

---

## Phase 5: Check Side Effects

```bash
tsk exec quality-gate
```

**What this does:** Ensures fix didn't break anything else

**Stop if:** New errors introduced

---

## Phase 6: Final Check

```bash
tsk diagnose
```

**Requirements:**
- Error count reduced
- No new errors
- All tests passing

---

## Phase 7: Document

**MANDATORY:** Update AITracking log:
**See:** @docs/workflows/subtasks/aitracking.md

```bash
# Create or update log:
TODAY=$(date +%d-%m-%Y)
LOG_FILE="docs/AITracking/AIAction_${TODAY}_fix_bug_name.md"
# Append fix details to log
```
- Files fixed
- Root causes found
- Patterns noticed

---

**Complete only when error count = 0 or significantly reduced**

---

**Commands:**
- `tsk diagnose` - Find errors
- `tsk exec lint/typecheck/test` - Validate
- `tsk exec quality-gate` - Full check
