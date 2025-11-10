# Implement Feature

**Purpose:** Build new features with quality checks

---

---
## ⚠️ NO MOCKS, NO STUBS
---

## Phase 1: Plan (5min)

1. Confirm feature requirements
2. Check for similar existing code
3. Identify files to modify

---

## Phase 2: Check Project Health

```bash
tsk diagnose --json
```

**What this does:** Ensures clean baseline before starting

**Stop if:** Errors > 20 (fix first)

---

## Phase 3: Detect Architecture

```bash
tsk discover
```

**What this does:** Finds project patterns (TDD, contracts-first, etc.)

**Adapt your approach** based on detected patterns

---

## Phase 4: Pre-Implementation

```bash
tsk exec quality-gate
```

**What this does:** Verifies system is stable

---

## Phase 5: Implement

1. Write code following project patterns
2. Match existing code style
3. Keep changes focused

**Check patterns:**
- Look at similar existing files
- Follow naming conventions
- Use project's folder structure

---

## Phase 6: Validate Each Step

After each significant change:

```bash
tsk exec lint      # Style check
tsk exec typecheck # Type safety
```

**Fix immediately if errors**

---

## Phase 7: Test

```bash
tsk exec test
```

**What this does:** Runs project tests

**Stop if:** Any tests fail

---

## Phase 8: Check for Issues

```bash
tsk check-issues 2>/dev/null || echo "No issues"
```

**What this does:** Checks for duplicates, TODOs, problems

**Stop if:** Critical issues found

---

## Phase 9: Final Validation

```bash
tsk exec quality-gate
```

**Requirements:**
- All tests passing
- No linter errors
- No type errors
- Build successful

**If any fail:** Fix before marking complete

---

## Phase 10: Document

1. Add code comments (if complex)
2. Update README (if user-facing)
3. Log work in `docs/AITracking/` (if exists)

---

**Complete only if all phases pass**

---

**Commands:**
- `tsk diagnose` - Health check
- `tsk discover` - Find patterns
- `tsk exec lint/typecheck/test` - Validation
- `tsk exec quality-gate` - Full check
