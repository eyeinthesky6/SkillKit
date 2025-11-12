# Flags and Help Summary

**Date:** 11-11-2025  
**Task:** Add flags for debug statements and config files, plus help flag

---

## ✅ Features Added

### 1. Help Flag ✅
**Flag:** `--help` or `-h`

**Shows:**
- Description of what the script does
- All available options
- Usage examples
- Detection capabilities
- Output information

**Example:**
```bash
node scripts/todo-tracker/todo-tracker.cjs --help
```

---

### 2. Debug Flag ✅
**Flag:** `--debug`

**Behavior:**
- **Default:** Debug statements are NOT tracked
- **With flag:** Debug statements ARE tracked

**Detects:**
- `console.log()`, `console.error()`, `console.warn()`, `console.info()`, `console.debug()`
- `debugger` statements
- `alert()` calls
- `console.trace()`, `console.dir()`, `console.table()`, etc.

**Example:**
```bash
# Default - no debug statements
node scripts/todo-tracker/todo-tracker.cjs --focus=src

# With debug statements
node scripts/todo-tracker/todo-tracker.cjs --focus=src --debug
```

**Result:** When `--debug` is used, shows "🐛 DEBUGGING STATEMENTS: X found"

---

### 3. Configs Flag ✅
**Flag:** `--configs`

**Behavior:**
- **Default:** Only scans code files (`.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`, `.cjs`)
- **With flag:** Also scans config files (`.yaml`, `.yml`, `.json`, `.toml`, `.ini`, `.cfg`, `.conf`, `.config`)

**Example:**
```bash
# Default - only code files
node scripts/todo-tracker/todo-tracker.cjs --focus=src

# With config files
node scripts/todo-tracker/todo-tracker.cjs --focus=src --configs
```

**Result:** When `--configs` is used, shows "📋 Config mode: Including config files..."

---

## 📊 Available Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--focus=<dir>` | Focus scan on specific directory | All directories |
| `--include=<dir>` | Include directory that would normally be excluded | None |
| `--config=<path>` | Path to config file | `.todo-tracker.config.js` |
| `--debug` | Include debug statements in scan | **OFF** (not tracked) |
| `--configs` | Scan config files (.yaml, .yml, .json, etc.) | **OFF** (code files only) |
| `--help`, `-h` | Show help message | N/A |

---

## 🎯 Usage Examples

### Basic Scan
```bash
node scripts/todo-tracker/todo-tracker.cjs
```

### Focused Scan
```bash
node scripts/todo-tracker/todo-tracker.cjs --focus=src
```

### With Debug Statements
```bash
node scripts/todo-tracker/todo-tracker.cjs --focus=src --debug
```

### With Config Files
```bash
node scripts/todo-tracker/todo-tracker.cjs --focus=src --configs
```

### Combined Flags
```bash
node scripts/todo-tracker/todo-tracker.cjs --focus=src --debug --configs
```

### Help
```bash
node scripts/todo-tracker/todo-tracker.cjs --help
# or
node scripts/todo-tracker/todo-tracker.cjs -h
```

---

## ✅ Implementation Details

### Debug Statements:
- **Patterns:** `console.log()`, `console.error()`, `debugger`, `alert()`, etc.
- **Category:** `temporary`
- **Type:** `DEBUG_STATEMENT`
- **Source:** `debug_statement`
- **Only tracked when:** `--debug` flag is set

### Config Files:
- **Extensions added:** `.yaml`, `.yml`, `.json`, `.toml`, `.ini`, `.cfg`, `.conf`, `.config`
- **Only scanned when:** `--configs` flag is set
- **Combined with:** Default code file extensions

### Help:
- **Triggers:** `--help` or `-h`
- **Shows:** Complete usage guide
- **Exits:** After showing help (doesn't run scan)

---

## ✅ Test Results

### Default Scan (No Flags):
- ✅ No debug statements shown
- ✅ Only code files scanned
- ✅ Works correctly

### With --debug Flag:
- ✅ Shows "🐛 Debug mode: Including debug statements..."
- ✅ Shows "🐛 DEBUGGING STATEMENTS: X found"
- ✅ Debug statements tracked

### With --configs Flag:
- ✅ Shows "📋 Config mode: Including config files..."
- ✅ Config files scanned
- ✅ Works correctly

### With --help Flag:
- ✅ Shows complete help message
- ✅ Exits without running scan
- ✅ Works correctly

---

**Status:** ✅ Complete  
**Last Updated:** 11-11-2025

