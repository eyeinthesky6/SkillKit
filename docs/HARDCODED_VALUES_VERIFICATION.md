# Hardcoded Values Verification

## Summary

✅ **No hardcoded project names, dates, or paths in generated workflow docs or skills** (except SkillKit-generated reports).

---

## ✅ Templates Fixed

### 1. `templates/workflows/AUDIT_SKILLKIT.md`

**Fixed hardcoded dates:**
- ❌ `2025-11-05`, `2025-11-07`, `2025-11-08` → ✅ `YYYY-MM-DD`
- ❌ `2025-11-07` (in report format) → ✅ `$(date +%Y-%m-%d)`
- ❌ `2025-11-07`, `2025-11-06`, `2025-11-05` (in examples) → ✅ `YYYY-MM-DD`

**Status:** ✅ All dates replaced with placeholders

### 2. `scripts/todo-tracker/COMPREHENSIVE_PATTERN_SUMMARY.md`

**Fixed hardcoded date:**
- ❌ `11-11-2025` → ✅ `Generated on analysis date`

**Status:** ✅ Date replaced with generic description

### 3. `scripts/todo-tracker/todo-tracker.cjs`

**Fixed project-specific references in report output:**
- ❌ `SEDI precision` → ✅ `precise TODO tracking`
- ❌ `SEDI TODO Precision` → ✅ `Precise TODO Tracking`

**Note:** Comments in source code still reference origin projects (acceptable - these are internal documentation, not generated output).

**Status:** ✅ Report output is project-agnostic

---

## ✅ Verification

### Self-Check Command

```bash
tsk self-check
```

**Result:** ✅ Passed with 1 warning (unrelated to hardcoded values)

**Checks performed:**
- ✅ No hardcoded project paths (`profitpilot/`, `sedi/`)
- ✅ No hardcoded Windows paths (`/c/Projects/`)
- ✅ No hardcoded dates (`2025-11-07` pattern)

---

## ✅ Generated Workflows

**Workflow adapter does NOT inject:**
- ❌ Hardcoded project names
- ❌ Hardcoded dates
- ❌ Absolute paths

**Workflow adapter DOES inject:**
- ✅ Project-specific commands (discovered from `package.json`, `pyproject.toml`)
- ✅ Detected package managers (`pnpm`, `poetry`, etc.)
- ✅ Detected tools (`eslint`, `ruff`, etc.)
- ✅ Relative paths (`.`, `docs/`, etc.)

**Example:**
```markdown
# Generated workflow uses:
pnpm run lint          # ✅ Discovered from package.json
poetry run ruff check . # ✅ Discovered from pyproject.toml
cd .                    # ✅ Relative path
```

---

## ✅ Skills

**No hardcoded values found in:**
- ✅ Skill templates
- ✅ Skill examples
- ✅ Skill documentation

**Skills use:**
- ✅ Generic examples
- ✅ Placeholders
- ✅ Project-agnostic patterns

---

## ✅ Reports (Exception)

**SkillKit-generated reports MAY contain:**
- ✅ Runtime-generated dates (e.g., `2025-01-15_14-30-00`)
- ✅ Discovered project paths (e.g., `/c/Projects/MyProject`)
- ✅ Project-specific analysis results

**Why allowed:** These are **outputs** generated at runtime, not templates or workflows.

**Examples:**
- `docs/skillkit/diagnostics-2025-01-15_14-30-00.md` - ✅ Contains current date
- `docs/audit/audit-report-2025-01-15.md` - ✅ Contains current date
- `docs/todo-tracker/Comprehensive_TODO_Analysis_2025-01-15_14-30-00.md` - ✅ Contains current date

---

## 📋 Checklist

- [x] No hardcoded project names in templates
- [x] No hardcoded dates in templates (replaced with placeholders)
- [x] No absolute paths in templates
- [x] No hardcoded project names in generated workflows
- [x] No hardcoded dates in generated workflows
- [x] No absolute paths in generated workflows
- [x] No hardcoded values in skills
- [x] Reports contain runtime-generated dates (allowed)
- [x] `tsk self-check` passes

---

## 🎯 Policy

**Rule:** Templates and generated workflows must be **project-agnostic**.

**Exception:** SkillKit-generated reports may contain runtime-generated dates and discovered paths.

**Enforcement:** Use `tsk self-check` to verify compliance.

**Documentation:** See `docs/HARDCODED_VALUES_POLICY.md` for detailed guidelines.

---

## ✅ Status: COMPLIANT

All templates and generated workflows are project-agnostic. No hardcoded project names, dates, or paths found (except in SkillKit-generated reports, which is allowed).

