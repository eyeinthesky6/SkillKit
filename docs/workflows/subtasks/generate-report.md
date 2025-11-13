# Generate Report (Subtask)

## Purpose
Generate project status reports in various formats.

## Report Types

### 1. Test Coverage Report

**Node.js:**

```bash
npm test -- --coverage
# Generates: coverage/index.html

# Or:
npx jest --coverage --coverageReporters=html
```

**Python:**

```bash
pytest --cov=src --cov-report=html
# Generates: htmlcov/index.html
```

### 2. Lint Report

**Standard Location:** `docs/skillkit/`

```bash
# JSON format:
npx eslint . --format json --output-file docs/skillkit/lint-report.json

# HTML format:
npx eslint . --format html --output-file docs/skillkit/lint-report.html
```

### 3. Type Coverage Report

**TypeScript:**

```bash
npx type-coverage --detail
# Shows percentage of typed code
```

### 4. Dependency Report

**Standard Location:** `docs/skillkit/`

```bash
# List all dependencies:
npm list --depth=0 > docs/skillkit/dependencies-report.txt

# Check licenses:
npx license-checker --summary > docs/skillkit/licenses-report.txt

# Check vulnerabilities:
npm audit --json > docs/skillkit/security-report.json
```

### 5. Build Size Report

**Webpack:**

```bash
npx webpack-bundle-analyzer dist/stats.json
```

**Vite:**

```bash
npm run build -- --report
```

## Generate Summary

**Standard Location:** `docs/skillkit/`

```bash
# Ensure directory exists:
mkdir -p docs/skillkit

# Create summary file:
cat > docs/skillkit/project-report.md << 'EOF'
# Project Status Report
Generated: $(date)

## Tests
- Coverage: 85%
- Passing: 142/145
- Failing: 3

## Code Quality
- Lint errors: 0
- Type coverage: 92%

## Dependencies
- Total: 45 packages
- Outdated: 3
- Vulnerabilities: 0

## Build
- Size: 245 KB (gzipped)
- Build time: 12s
EOF
```

## Report Organization

**SkillKit Standard:** All diagnostic reports should be saved to `docs/skillkit/`

- **Diagnostics:** `docs/skillkit/diagnostics-{timestamp}.md`
- **Lint Reports:** `docs/skillkit/lint-report.{json|html}`
- **Dependency Reports:** `docs/skillkit/dependencies-report.txt`
- **Security Reports:** `docs/skillkit/security-report.json`
- **Coverage Reports:** `coverage/` (tool standard, but can be symlinked to `docs/skillkit/coverage/`)

**Note:** Some tools have their own standard locations (e.g., `coverage/` for test coverage). These can be kept in their standard locations or symlinked/copied to `docs/skillkit/` for centralized access.

## Open Report

```bash
# Open in browser:
open coverage/index.html           # Mac
xdg-open coverage/index.html       # Linux
start coverage/index.html          # Windows

# Or:
npx http-server coverage -o
```

---

**Return report location to main workflow.**

