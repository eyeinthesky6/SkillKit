# Analyze Errors (Subtask)

## Purpose
Parse and categorize errors from linter, tests, or build output.

## Steps

### 1. Capture Error Output

```bash
# Lint errors:
npm run lint 2>&1 | tee lint-errors.log

# TypeScript errors:
npm run typecheck 2>&1 | tee ts-errors.log

# Test failures:
npm test 2>&1 | tee test-errors.log
```

### 2. Parse Error Counts

```bash
# Count by type:
LINT_ERRORS=$(grep -c "error" lint-errors.log || echo "0")
TS_ERRORS=$(grep -c "TS[0-9]" ts-errors.log || echo "0")
TEST_FAILS=$(grep -c "FAIL" test-errors.log || echo "0")

TOTAL=$((LINT_ERRORS + TS_ERRORS + TEST_FAILS))

echo "Total errors: ${TOTAL}"
```

### 3. Categorize by Severity

```bash
if [ $TOTAL -gt 50 ]; then
  SEVERITY="CRITICAL"
elif [ $TOTAL -gt 10 ]; then
  SEVERITY="HIGH"
elif [ $TOTAL -gt 0 ]; then
  SEVERITY="NORMAL"
else
  SEVERITY="CLEAN"
fi

echo "Severity: ${SEVERITY}"
```

### 4. Group Related Errors

```bash
# Find common patterns:
grep "error" lint-errors.log | cut -d':' -f1 | sort | uniq -c | sort -rn | head -10

# Shows which files have most errors
```

## Output Format

```
📊 Error Analysis
─────────────────

Lint Errors: 12
TypeScript Errors: 3
Test Failures: 0
─────────────────
Total: 15
Severity: HIGH

Top Files:
  8 src/components/Button.tsx
  4 src/utils/helpers.ts
  3 src/types/index.ts
```

## Decision Tree

- **CRITICAL (50+):** Emergency mode - fix blockers first
- **HIGH (10-50):** Focused fixing - tackle by file
- **NORMAL (1-10):** Standard fixes - quick wins first
- **CLEAN (0):** Proceed to feature work

---

**Return analysis results to main workflow.**

