# Clean Artifacts (Subtask)

## Purpose
Remove build artifacts and temporary files.

## Node.js

```bash
# Remove build output:
rm -rf dist/ build/ out/

# Remove dependencies:
rm -rf node_modules/

# Remove cache:
rm -rf .cache/ .parcel-cache/

# Clean install:
npm ci
```

## Python

```bash
# Remove bytecode:
find . -type d -name "__pycache__" -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

# Remove build:
rm -rf build/ dist/ *.egg-info/

# Remove venv:
rm -rf venv/ .venv/
```

## Test Artifacts

```bash
# Remove coverage:
rm -rf coverage/ htmlcov/ .coverage

# Remove test output:
rm -f test-output.log lint-errors.log ts-errors.log
```

## IDE Files

```bash
# Remove IDE specific (if not gitignored):
rm -rf .vscode/ .idea/ *.swp

# Clean Mac files:
find . -name ".DS_Store" -delete
```

## Git Clean

```bash
# See what would be removed:
git clean -n -d

# Remove untracked files:
git clean -f -d

# Remove ignored files too:
git clean -f -d -x
```

---

**Artifacts cleaned - fresh state.**

