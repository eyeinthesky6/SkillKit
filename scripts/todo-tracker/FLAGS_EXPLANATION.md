# TODO Tracker Flags - Complete Explanation

**Date:** 11-11-2025  
**Purpose:** Comprehensive guide to all available flags and their usage

---

## ✅ Implemented Flags

### 1. `--all` ⭐ **NEW**

**Purpose:** Scan everything that's normally excluded by default

**What it enables:**
- ✅ Debug statements (`console.log`, `debugger`, etc.)
- ✅ Config files (`.yaml`, `.yml`, `.json`, `.toml`, etc.)
- ✅ Scripts folder/files
- ✅ Markdown files

**Equivalent to:** `--debug --configs --scripts --md`

**Example:**
```bash
# Scan everything
node scripts/todo-tracker/todo-tracker.cjs --all

# Equivalent to:
node scripts/todo-tracker/todo-tracker.cjs --debug --configs --scripts --md
```

**Use case:** Comprehensive scan when you want to catch ALL issues, including those in config files and scripts.

---

### 2. `--format=<format>` ⭐ **NEW**

**Purpose:** Choose output format

**Options:**
- `markdown` (default) - Detailed markdown report file
- `json` - Structured JSON output (CI/CD friendly)
- `table` - Console table output (no file written)

**Examples:**
```bash
# Default markdown format
node scripts/todo-tracker/todo-tracker.cjs

# JSON format (for CI/CD integration)
node scripts/todo-tracker/todo-tracker.cjs --format=json

# Table format (console only, quick view)
node scripts/todo-tracker/todo-tracker.cjs --format=table
```

**Use cases:**
- **markdown**: Human-readable reports, documentation
- **json**: CI/CD pipelines, automated processing, integrations
- **table**: Quick console preview, no file clutter

---

### 3. `--output=<path>` ⭐ **NEW**

**Purpose:** Specify custom output file path

**Default:** `docs/audit/Comprehensive_TODO_Analysis_YYYY-MM-DD.md` (or `.json` if `--format=json`)

**Examples:**
```bash
# Custom markdown file
node scripts/todo-tracker/todo-tracker.cjs --output=./reports/todos.md

# Custom JSON file
node scripts/todo-tracker/todo-tracker.cjs --format=json --output=./reports/todos.json

# Absolute path
node scripts/todo-tracker/todo-tracker.cjs --output=/tmp/todos.md
```

**Notes:**
- Directory is created automatically if it doesn't exist
- For `--format=table`, file is optional (console only)
- Extension should match format (`.md` for markdown, `.json` for JSON)

**Use case:** Organize reports in custom locations, CI/CD artifact paths

---

### 4. `--priority=<level>` ⭐ **NEW**

**Purpose:** Filter issues by priority level

**Options:**
- `blocker` - Only blocker issues (priority 1)
- `critical` - Only critical issues (priority 2)
- `major` - Only major issues (priority 3)
- `minor` - Only minor issues (priority 4)
- `all` (default) - All priorities

**Examples:**
```bash
# Only blockers
node scripts/todo-tracker/todo-tracker.cjs --priority=blocker

# Only critical and blockers (if combined)
node scripts/todo-tracker/todo-tracker.cjs --priority=critical

# All priorities (default)
node scripts/todo-tracker/todo-tracker.cjs --priority=all
```

**Use cases:**
- **blocker**: Pre-deployment checks, must-fix issues
- **critical**: Sprint planning, high-priority fixes
- **major/minor**: Code quality improvements

---

### 5. `--category=<category>` ⭐ **NEW**

**Purpose:** Filter issues by category

**Options:**
- `temporal` - Time-based temporary code ("for now", "temporary")
- `incomplete` - Missing implementations (stubs, placeholders)
- `deceptive` - Misleading code ("simplified", "workaround")
- `technical_debt` - Hardcoded values, deprecated code
- `explicit` - Direct TODOs/bugs
- `temporary` - Workarounds, stubs
- `commented_code` - Executable code that's commented out (TOP BLOCKER)
- `all` (default) - All categories

**Examples:**
```bash
# Only commented out code (blockers)
node scripts/todo-tracker/todo-tracker.cjs --category=commented_code

# Only deceptive patterns
node scripts/todo-tracker/todo-tracker.cjs --category=deceptive

# Only incomplete features
node scripts/todo-tracker/todo-tracker.cjs --category=incomplete
```

**Use cases:**
- **commented_code**: Fix type errors, uncomment code
- **deceptive**: Review misleading code patterns
- **incomplete**: Complete missing features
- **temporal**: Replace temporary solutions

---

### 6. `--focus=<dir>`

**Purpose:** Focus scan on specific directory

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --focus=src
node scripts/todo-tracker/todo-tracker.cjs --focus=packages/shared/src
```

**Use case:** Scan specific parts of codebase, faster scans

---

### 7. `--include=<dir>`

**Purpose:** Include directory that would normally be excluded

**Can be used multiple times:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --include=scripts --include=tests
```

**Use case:** Include specific excluded directories without scanning everything

---

### 8. `--config=<path>`

**Purpose:** Specify config file path

**Default:** `.lazy-coding-tracker.config.js`

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --config=./custom-config.js
```

**Use case:** Project-specific configuration

---

### 9. `--debug`

**Purpose:** Include debug statements in scan

**Detects:**
- `console.log()`, `console.error()`, `console.warn()`, etc.
- `debugger` statements
- `alert()` calls

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --debug
```

**Note:** Enabled automatically with `--all`

**Use case:** Find and remove debug statements before production

---

### 10. `--configs`

**Purpose:** Scan config files in addition to code files

**File types:** `.yaml`, `.yml`, `.json`, `.toml`, `.ini`, `.cfg`, `.conf`, `.config`

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --configs
```

**Note:** Enabled automatically with `--all`

**Use case:** Find TODOs in configuration files

---

### 11. `--scripts`

**Purpose:** Scan scripts folder/files (normally excluded)

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --scripts
```

**Note:** Enabled automatically with `--all`

**Use case:** Find issues in build scripts, utilities

---

### 12. `--help`, `-h`

**Purpose:** Show help message

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --help
node scripts/todo-tracker/todo-tracker.cjs -h
```

---

## 🔄 Flag Combinations

### Common Combinations

```bash
# Comprehensive scan with JSON output
node scripts/todo-tracker/todo-tracker.cjs --all --format=json --output=./reports/todos.json

# Only blockers, JSON format
node scripts/todo-tracker/todo-tracker.cjs --priority=blocker --format=json

# Commented code only, custom output
node scripts/todo-tracker/todo-tracker.cjs --category=commented_code --output=./blockers.md

# Critical deceptive patterns, table view
node scripts/todo-tracker/todo-tracker.cjs --priority=critical --category=deceptive --format=table

# Focused scan with filters
node scripts/todo-tracker/todo-tracker.cjs --focus=src --priority=blocker --category=commented_code
```

---

## 📋 Planned Flags (Not Yet Implemented)

### Phase 2: Git Integration

#### `--since=<ref>`
**Purpose:** Incremental scanning - only scan files changed since git ref

**Examples:**
- `--since=HEAD~1` - Since last commit
- `--since=main` - Since main branch
- `--since=<commit-hash>` - Since specific commit

**Use case:** Faster scans, CI/CD integration, only check changed files

---

#### `--blame`
**Purpose:** Include git blame information (author, date) for each issue

**Use case:** Track who introduced issues, when they were added

---

#### `--age`
**Purpose:** Track TODO age (how long since it was introduced)

**Use case:** Identify old technical debt, prioritize by age

---

### Phase 3: CI/CD Flags

#### `--exit-code=<level>`
**Purpose:** Exit with non-zero code if issues found (for CI/CD)

**Options:**
- `blocker` (default) - Exit 1 if blockers found
- `critical` - Exit 1 if critical+ found
- `all` - Exit 1 if any issues found
- `never` - Always exit 0

**Use case:** Fail CI/CD builds on code quality issues

---

#### `--max-issues=<count>`
**Purpose:** Fail if more than N issues found

**Use case:** Gradual improvement, set thresholds

---

#### `--max-blockers=<count>`
**Purpose:** Fail if more than N blockers found

**Use case:** Zero-tolerance for blockers

---

### Phase 4: Reporting Flags

#### `--summary`
**Purpose:** Show only summary (no detailed list)

**Use case:** Quick overview, less verbose output

---

#### `--no-console`
**Purpose:** Suppress console output (only write to file)

**Use case:** CI/CD scripts, automated processing

---

## 🎯 Quick Reference

| Flag | Purpose | Default |
|------|---------|---------|
| `--all` | Scan everything | OFF |
| `--format` | Output format | `markdown` |
| `--output` | Custom output path | Auto-generated |
| `--priority` | Filter by priority | `all` |
| `--category` | Filter by category | `all` |
| `--focus` | Focus directory | All |
| `--include` | Include directory | None |
| `--config` | Config file path | `.lazy-coding-tracker.config.js` |
| `--debug` | Include debug statements | OFF |
| `--configs` | Scan config files | OFF |
| `--scripts` | Scan scripts | OFF |
| `--help` | Show help | N/A |

---

**Status:** Phase 1 Complete ✅  
**Next:** Phase 2 (Git Integration) ⏳

