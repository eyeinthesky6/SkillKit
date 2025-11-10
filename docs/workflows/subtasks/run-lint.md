# Run Lint (Subtask)

## Purpose
Run code linting with environment-aware command detection.

## Auto-Detection

```bash
tsk exec lint
```

**Automatically detects:**
- ESLint (JavaScript/TypeScript)
- TSLint (older TypeScript)
- Pylint / flake8 (Python)
- golangci-lint (Go)
- RuboCop (Ruby)
- PHP_CodeSniffer (PHP)

## Manual Commands

**JavaScript/TypeScript:**

```bash
npm run lint
npx eslint .
npx eslint src/ --ext .ts,.tsx,.js,.jsx
```

**With auto-fix:**

```bash
npm run lint -- --fix
npx eslint . --fix
```

**Python:**

```bash
pylint src/
flake8 src/
black --check src/
```

## Capture Output

```bash
# Save to file:
npm run lint 2>&1 | tee lint-output.log

# Count errors/warnings:
ERROR_COUNT=$(grep " error " lint-output.log | wc -l)
WARN_COUNT=$(grep " warning " lint-output.log | wc -l)

echo "Errors: ${ERROR_COUNT}, Warnings: ${WARN_COUNT}"
```

## Decision Making

```bash
if [ $ERROR_COUNT -eq 0 ]; then
  echo "✓ Lint clean"
  exit 0
else
  echo "✗ ${ERROR_COUNT} lint errors found"
  exit 1
fi
```

---

**Return lint results to main workflow.**

