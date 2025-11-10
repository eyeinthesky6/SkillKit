# Implement Feature

**Purpose:** Build new features with quality checks

---

## {{CUSTOM_HEADER}}
<!-- Project-specific rules -->
---

## Phase 1: Gather Requirements (5min)

**See:** @docs/workflows/subtasks/gather-requirements.md

**Quick checklist:**
- [ ] Feature description clear
- [ ] Inputs/outputs defined
- [ ] Files to modify identified
- [ ] Success criteria defined

**Detect domain expertise needed:**
- Mentions "PDF" → Load `pdf` skill (see Phase 2.5)
- Mentions "Excel/spreadsheet" → Load `xlsx` skill
- Mentions "Word/document" → Load `docx` skill
- Mentions "design/poster" → Load `canvas-design` skill

---

## Phase 2: Check Dependencies

**See:** @docs/workflows/subtasks/check-dependencies.md

**Quick version:**
```bash
npm install  # Or: pip install -r requirements.txt
```

---

## Phase 2.5: Load Domain Skills (if needed)

**See:** @docs/workflows/subtasks/load-skill.md

**When requirements mention specialized tasks:**

```bash
# Example: If working with PDFs:
tsk skill:load pdf

# Example: If working with spreadsheets:
tsk skill:load xlsx
```

**This loads 200-600 lines of expert guidance!**

---

## Phase 3: Check Project Health

**See:** @docs/workflows/subtasks/run-diagnostics.md

**Quick version:**
```bash
tsk diagnose --json
```

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

**See:** @docs/workflows/subtasks/run-lint.md and @docs/workflows/subtasks/run-typecheck.md

After each significant change:

```bash
tsk exec lint      # Or: npm run lint
tsk exec typecheck # Or: npx tsc --noEmit
```

**Fix immediately if errors**

---

## Phase 7: Test

**See:** @docs/workflows/subtasks/run-tests.md

```bash
tsk exec test      # Or: npm test
```

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
