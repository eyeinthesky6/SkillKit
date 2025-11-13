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

```bash
# JSON format:
npx eslint . --format json --output-file lint-report.json

# HTML format:
npx eslint . --format html --output-file lint-report.html
```

### 3. Type Coverage Report

**TypeScript:**

```bash
npx type-coverage --detail
# Shows percentage of typed code
```

### 4. Dependency Report

```bash
# List all dependencies:
npm list --depth=0 > dependencies-report.txt

# Check licenses:
npx license-checker --summary > licenses-report.txt

# Check vulnerabilities:
npm audit --json > security-report.json
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

```bash
# Create summary file:
cat > project-report.md << 'EOF'
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

