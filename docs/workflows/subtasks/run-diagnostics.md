# Run Diagnostics (Subtask)

## Purpose
Run comprehensive project diagnostics to detect errors, warnings, and system health.

## Commands

**Full diagnostic scan:**

```bash
tsk diagnose
```

**What it checks:**
- Package manager health (npm/yarn/pnpm/bun)
- Linter errors (eslint/tslint)
- Type errors (TypeScript/Flow)
- Test failures
- Build errors
- Dependency issues

## Output

```
🔍 Project Diagnostics
─────────────────────

✓ Package Manager: npm (healthy)
⚠ Linter: 12 errors, 5 warnings
✗ TypeScript: 3 type errors
✓ Tests: All passing
✓ Build: Successful

Summary:
ERROR_COUNT=15
WARN_COUNT=5
```

## Decision Making

**Based on results:**

```bash
# Extract counts:
ERROR_COUNT=$(tsk diagnose | grep "ERROR_COUNT" | cut -d'=' -f2)
WARN_COUNT=$(tsk diagnose | grep "WARN_COUNT" | cut -d'=' -f2)

# Route workflow:
if [ $ERROR_COUNT -gt 50 ]; then
  echo "CRITICAL: Route to emergency fixes"
elif [ $ERROR_COUNT -gt 10 ]; then
  echo "HIGH: Route to focused bug fixing"
elif [ $ERROR_COUNT -gt 0 ]; then
  echo "NORMAL: Route to standard fixes"
else
  echo "CLEAN: Proceed with feature work"
fi
```

## Integration with Workflows

```markdown
# In FIX_BUGS.md:

## Step 1: Diagnose
@docs/workflows/subtasks/run-diagnostics.md

## Step 2: Route Based on Severity
[Use ERROR_COUNT to decide approach]
```

---

**Return to main workflow after diagnostics complete.**

