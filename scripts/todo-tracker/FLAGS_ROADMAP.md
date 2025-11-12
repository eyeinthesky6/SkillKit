# TODO Tracker Flags & Features Roadmap

**Date:** 11-11-2025  
**Goal:** Complete all planned flags before packaging as standalone npm package

---

## ✅ Currently Implemented Flags

| Flag | Description | Status |
|------|-------------|--------|
| `--help`, `-h` | Show help message | ✅ Complete |
| `--focus=<dir>` | Focus scan on specific directory | ✅ Complete |
| `--include=<dir>` | Include directory that would normally be excluded | ✅ Complete |
| `--config=<path>` | Path to config file | ✅ Complete |
| `--debug` | Include debug statements in scan | ✅ Complete |
| `--configs` | Scan config files (.yaml, .yml, .json, etc.) | ✅ Complete |
| `--scripts` | Scan scripts folder/files (normally excluded) | ✅ Complete |

---

## 🚧 Planned Flags (Phase 1 - Quick Wins)

### 1. Output Format Flags

#### `--format=<format>` ⏳ **TODO**
**Options:** `markdown` (default), `json`, `table`

**Description:**
- `markdown` - Current default format (`.md` file)
- `json` - Structured JSON output for CI/CD integration
- `table` - Console table output (no file)

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --format=json
node scripts/todo-tracker/todo-tracker.cjs --format=table
```

**Implementation:**
- Add format parsing in args section
- Create `generateJSONReport()` function
- Create `generateTableReport()` function
- Update report generation logic

---

#### `--output=<path>` ⏳ **TODO**
**Description:** Specify custom output file path

**Default:** `docs/audit/Comprehensive_TODO_Analysis_YYYY-MM-DD.md`

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --output=./reports/todos.json --format=json
node scripts/todo-tracker/todo-tracker.cjs --output=./todos.md
```

**Implementation:**
- Add output path parsing
- Override default report file path
- Handle directory creation if needed

---

### 2. Git Integration Flags (Phase 2)

#### `--since=<ref>` ⏳ **TODO**
**Description:** Incremental scanning - only scan files changed since git ref

**Options:**
- `--since=HEAD~1` - Since last commit
- `--since=HEAD~5` - Since 5 commits ago
- `--since=main` - Since main branch
- `--since=<commit-hash>` - Since specific commit

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --since=HEAD~1
node scripts/todo-tracker/todo-tracker.cjs --since=main --format=json
```

**Implementation:**
- Use `git diff --name-only <ref>` to get changed files
- Filter scan to only changed files
- Requires git to be available

---

#### `--blame` ⏳ **TODO**
**Description:** Include git blame information (author, date) for each issue

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --blame --format=json
```

**Implementation:**
- Use `git blame` for each file/line
- Add author/date to issue objects
- Only works with git repos

---

#### `--age` ⏳ **TODO**
**Description:** Track TODO age (how long since it was introduced)

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --age --format=json
```

**Implementation:**
- Use git blame to find when line was introduced
- Calculate age from commit date
- Add age field to issue objects

---

### 3. Filtering Flags

#### `--priority=<level>` ⏳ **TODO**
**Description:** Filter by priority level

**Options:** `blocker`, `critical`, `major`, `minor`, `all` (default)

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --priority=blocker
node scripts/todo-tracker/todo-tracker.cjs --priority=critical --format=json
```

**Implementation:**
- Filter issues by priority before reporting
- Update summary counts

---

#### `--category=<category>` ⏳ **TODO**
**Description:** Filter by category

**Options:** `temporal`, `incomplete`, `deceptive`, `technical_debt`, `explicit`, `temporary`, `commented_code`, `all` (default)

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --category=commented_code
node scripts/todo-tracker/todo-tracker.cjs --category=deceptive --format=json
```

**Implementation:**
- Filter issues by category before reporting
- Update summary counts

---

#### `--type=<type>` ⏳ **TODO**
**Description:** Filter by issue type (e.g., `FOR_NOW`, `SIMPLIFIED`, `COMMENTED_OUT_CODE`)

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --type=COMMENTED_OUT_CODE
node scripts/todo-tracker/todo-tracker.cjs --type=FOR_NOW --format=json
```

**Implementation:**
- Filter issues by type before reporting
- Support multiple types: `--type=TODO --type=FIXME`

---

### 4. CI/CD Flags

#### `--exit-code` ⏳ **TODO**
**Description:** Exit with non-zero code if issues found (for CI/CD)

**Options:**
- `--exit-code=blocker` - Exit 1 if blockers found (default)
- `--exit-code=critical` - Exit 1 if critical+ found
- `--exit-code=all` - Exit 1 if any issues found
- `--exit-code=never` - Always exit 0

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --exit-code=blocker --format=json
```

**Implementation:**
- Already exits with code 1 if blockers found
- Make configurable via flag
- Update exit logic

---

#### `--max-issues=<count>` ⏳ **TODO**
**Description:** Fail if more than N issues found (for CI/CD)

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --max-issues=10 --format=json
```

**Implementation:**
- Count total issues
- Exit 1 if count > max-issues
- Useful for gradual improvement

---

#### `--max-blockers=<count>` ⏳ **TODO**
**Description:** Fail if more than N blockers found

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --max-blockers=0 --format=json
```

**Implementation:**
- Count blocker issues
- Exit 1 if count > max-blockers

---

### 5. Reporting Flags

#### `--summary` ⏳ **TODO**
**Description:** Show only summary (no detailed list)

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --summary --format=json
```

**Implementation:**
- Skip detailed issue listing
- Only show counts and summary

---

#### `--no-console` ⏳ **TODO**
**Description:** Suppress console output (only write to file)

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --no-console --format=json --output=report.json
```

**Implementation:**
- Wrap console.log calls in conditional
- Useful for CI/CD scripts

---

## 📋 Implementation Priority

### Phase 1: Core Output Formats (This Week)
1. ✅ `--format=json` - **HIGH PRIORITY** (needed for CI/CD)
2. ✅ `--format=table` - **MEDIUM PRIORITY** (nice to have)
3. ✅ `--output=<path>` - **HIGH PRIORITY** (needed for flexibility)

### Phase 2: Git Integration (Next Week)
4. ✅ `--since=<ref>` - **HIGH PRIORITY** (performance improvement)
5. ✅ `--blame` - **MEDIUM PRIORITY** (useful for tracking)
6. ✅ `--age` - **LOW PRIORITY** (nice to have)

### Phase 3: Filtering (Before Packaging)
7. ✅ `--priority=<level>` - **MEDIUM PRIORITY**
8. ✅ `--category=<category>` - **MEDIUM PRIORITY**
9. ✅ `--type=<type>` - **LOW PRIORITY**

### Phase 4: CI/CD (Before Packaging)
10. ✅ `--exit-code=<level>` - **HIGH PRIORITY** (needed for CI/CD)
11. ✅ `--max-issues=<count>` - **MEDIUM PRIORITY**
12. ✅ `--max-blockers=<count>` - **MEDIUM PRIORITY**

### Phase 5: Reporting (Before Packaging)
13. ✅ `--summary` - **LOW PRIORITY**
14. ✅ `--no-console` - **LOW PRIORITY**

---

## 🎯 Next Steps

1. **Implement Phase 1 flags** (`--format`, `--output`)
2. **Test with SkillKit codebase**
3. **Make codebase-agnostic** (remove trading-specific references)
4. **Create package structure** (package.json, bin/, lib/)
5. **Move to new repository**
6. **Import as dependency in SkillKit**

---

**Status:** Planning Complete  
**Next:** Start implementing Phase 1 flags

