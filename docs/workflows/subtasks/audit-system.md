# Audit System - Subtask

**Purpose:** Perform comprehensive system audit and generate report

**Referenced by:** AUDIT_SKILLKIT.md

---

## Steps

### 1. Check Prerequisites

```bash
# Ensure directories exist
mkdir -p docs/audit

# Check current location
pwd
```

### 2. Run Full Audit

```bash
tsk audit

# This scans:
# → Workflow files
# → Subtask files
# → Skills installation
# → Command validity
# → File integrity
# → Environment compatibility
```

### 3. Review Generated Report

**Report location:** `docs/audit/audit-report-latest.md`

**Check for:**
- Critical issues (must fix)
- Warnings (should fix)
- Recommendations (nice to have)

### 4. Apply Auto-Fixes (If Safe)

```bash
tsk audit:fix --auto-safe

# Only applies 100% safe fixes:
# → Remove duplicates
# → Fix whitespace
# → Update permissions
```

### 5. Return to Workflow

**Next:** Review audit report with user and get confirmation for manual fixes.

