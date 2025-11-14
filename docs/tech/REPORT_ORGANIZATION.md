# Report Organization Standard

## Overview

SkillKit standardizes diagnostic report locations to ensure all outputs are organized and easily accessible. All reports should be saved to designated directories under `docs/`.

## Standard Report Locations

### SkillKit Diagnostic Reports: `docs/skillkit/`

All SkillKit-generated diagnostic reports should be saved to `docs/skillkit/`:

- **Diagnostics:** `docs/skillkit/diagnostics-{YYYY-MM-DD_HH-MM-SS}.{md|json}`
- **Lint Reports:** `docs/skillkit/lint-report.{json|html}`
- **Dependency Reports:** `docs/skillkit/dependencies-report.txt`
- **Security Reports:** `docs/skillkit/security-report.json`
- **Build Reports:** `docs/skillkit/build-report.{md|json}`

### System Audit Reports: `docs/audit/`

System health and audit reports:

- **Audit Reports:** `docs/audit/audit-report-{YYYY-MM-DD}.{md|json}`
- **Latest Audit:** `docs/audit/audit-report-latest.{md|json}`

### TODO Tracker Reports: `docs/todo-tracker/`

TODO and code quality analysis:

- **TODO Analysis:** `docs/todo-tracker/Comprehensive_TODO_Analysis_{YYYY-MM-DD_HH-MM-SS}.{md|json|html}`

### Workflow Files: `.cursor/commands/`

Workflow markdown files (intentional - Cursor reads from here):

- **Workflows:** `.cursor/commands/{WORKFLOW_NAME}.md`

### Tool-Specific Locations

Some tools have their own standard locations that should be respected:

- **Test Coverage:** `coverage/` (can be symlinked to `docs/skillkit/coverage/`)
- **Build Artifacts:** `dist/`, `build/` (project-specific)
- **Logs:** `logs/` (if applicable)

## Using Report Path Utilities

SkillKit provides utilities for standardized report paths:

```typescript
import { 
  getReportsDir, 
  ensureReportsDir, 
  getReportPath, 
  getDailyReportPath,
  getReportSubdir 
} from '../utils/report-paths.js';

// Get standard reports directory
const reportsDir = getReportsDir(); // docs/skillkit/

// Ensure directory exists
ensureReportsDir();

// Get timestamped report path
const reportPath = getReportPath('diagnostics', 'md');
// → docs/skillkit/diagnostics-2025-11-13_12-30-45.md

// Get daily report path
const dailyPath = getDailyReportPath('summary', 'md');
// → docs/skillkit/summary-2025-11-13.md

// Get subdirectory
const subdir = getReportSubdir('coverage');
// → docs/skillkit/coverage/
```

## Customization

### Environment Variable

Override the default reports directory:

```bash
export SKILLKIT_REPORTS_DIR=custom/reports
tsk diagnose  # Reports will go to custom/reports/
```

### Command Options

Most commands support `--output` or `--no-report` flags:

```bash
# Custom output path
tsk diagnose --output custom/path/report.md

# Skip report generation
tsk diagnose --no-report
```

## Report Naming Conventions

- **Timestamped:** `{name}-{YYYY-MM-DD_HH-MM-SS}.{ext}` (for unique reports)
- **Daily:** `{name}-{YYYY-MM-DD}.{ext}` (for daily summaries)
- **Latest:** `{name}-latest.{ext}` (symlink or copy of most recent)

## Integration with Workflows

When generating reports in workflow steps:

1. Use `getReportPath()` or `getDailyReportPath()` for SkillKit reports
2. For tool-specific reports, configure tools to output to `docs/skillkit/` when possible
3. Document report locations in workflow comments
4. Return report paths to main workflow for reference

## Examples

### Diagnostics Command

```typescript
const reportPath = getReportPath('diagnostics', 'md');
fs.writeFileSync(reportPath, reportContent);
console.log(`📄 Report saved: ${getRelativeReportPath(reportPath)}`);
```

### Lint Report in Workflow

```bash
# In workflow step:
npx eslint . --format json --output-file docs/skillkit/lint-report.json
```

### Coverage Report

```bash
# Standard location (tool default):
npm test -- --coverage

# Or symlink to docs/skillkit/:
ln -s coverage docs/skillkit/coverage
```

## Benefits

1. **Centralized Access:** All reports in predictable locations
2. **Easy Cleanup:** Can exclude `docs/skillkit/` from version control if needed
3. **Consistent Naming:** Timestamped files prevent overwrites
4. **Tool Integration:** Standard paths work across different tools
5. **Customizable:** Environment variables allow project-specific overrides

