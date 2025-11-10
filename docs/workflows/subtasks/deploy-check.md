# Deploy Check (Subtask)

## Purpose
Verify project is ready for deployment.

## Checklist

### 1. Tests Pass

```bash
npm test
if [ $? -ne 0 ]; then
  echo "✗ Tests failing - fix before deploy"
  exit 1
fi
```

### 2. Lint Clean

```bash
npm run lint
if [ $? -ne 0 ]; then
  echo "✗ Lint errors - fix before deploy"
  exit 1
fi
```

### 3. Build Succeeds

```bash
npm run build
if [ $? -ne 0 ]; then
  echo "✗ Build failed"
  exit 1
fi
```

### 4. Environment Variables

```bash
# Check required env vars:
REQUIRED_VARS=("API_KEY" "DATABASE_URL" "SECRET_KEY")

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "✗ Missing: $var"
    exit 1
  fi
done
```

### 5. Dependencies Up-to-Date

```bash
npm audit --audit-level=high
if [ $? -ne 0 ]; then
  echo "⚠ Security vulnerabilities found"
fi
```

### 6. Git Status Clean

```bash
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠ Uncommitted changes"
fi
```

## Output

```
🚀 Deployment Readiness Check
─────────────────────────────

✓ Tests: Passing (142/142)
✓ Lint: Clean
✓ Build: Success (245 KB)
✓ Env Vars: All set
✓ Dependencies: Secure
✓ Git: Clean

Status: READY TO DEPLOY
```

---

**Proceed with deployment if all checks pass.**

