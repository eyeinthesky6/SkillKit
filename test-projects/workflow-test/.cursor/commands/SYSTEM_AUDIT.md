# System Audit

**Purpose:** Complete project health check

---

---
## ⚠️ NO MOCKS, NO STUBS
---

## Phase 1: Run Full Diagnostics

```bash
tsk exec quality-gate 2>&1 | tee /tmp/audit.log
```

**What this does:** Lint + typecheck + test + build

---

## Phase 2: Count Issues

```bash
ERROR_COUNT=$(grep -c "error" /tmp/audit.log || echo "0")
WARN_COUNT=$(grep -c "warning" /tmp/audit.log || echo "0")
TEST_COUNT=$(grep -c "test.*fail" /tmp/audit.log || echo "0")

echo "Errors: ${ERROR_COUNT}"
echo "Warnings: ${WARN_COUNT}"
echo "Test failures: ${TEST_COUNT}"
```

---

## Phase 3: Security Check

**For Node.js:**
```bash
npm audit --audit-level=moderate
```

**For Python:**
```bash
pip-audit || safety check
```

**For Java:**
```bash
mvn dependency-check:check
```

---

## Phase 4: Code Quality Metrics

```bash
# Find large files (>500 lines)
find src/ -name "*.ts" -o -name "*.js" -o -name "*.py" | xargs wc -l | sort -rn | head -10

# Count TODOs
grep -r "TODO\|FIXME" src/ | wc -l
```

---

## Phase 5: Generate Report

Create `docs/audit/System_Audit_$(date +%Y-%m-%d).md`:

```markdown
# System Audit Report

**Date:** $(date)

## Summary
- Errors: ${ERROR_COUNT}
- Warnings: ${WARN_COUNT}
- Test Failures: ${TEST_COUNT}
- TODOs: ${TODO_COUNT}
- Security Issues: [from audit]

## Top Issues
[List top 10 files by error count]

## Recommendations
1. [Based on findings]
2. [Prioritized actions]
```

---

## Phase 6: Action Plan

**If errors > 100:** Critical - stop all features, fix errors
**If errors > 50:** High - dedicate time to fixes
**If errors > 20:** Medium - fix alongside features
**If errors < 20:** Low - continue as normal

---

**Commands:**
- `tsk exec quality-gate` - Full check
- `npm audit` / `pip-audit` - Security
- `find` + `grep` - Metrics

