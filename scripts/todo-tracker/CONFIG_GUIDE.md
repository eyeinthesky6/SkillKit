# Configuration Guide

**Date:** 10-11-2025  
**Purpose:** Guide for configuring todo-tracker

---

## Quick Start

1. **Copy example config:**
   ```bash
   cp scripts/todo-tracker/.todo-tracker.config.js.example .todo-tracker.config.js
   ```

2. **Customize as needed** - Edit `.todo-tracker.config.js`

3. **Run tracker:**
   ```bash
   node scripts/todo-tracker/todo-tracker.cjs
   ```

---

## Configuration Options

### 1. File Exclusions

#### Always Excluded (Cannot Override)
These are **always** excluded, even with `--include`:
- `node_modules/`
- `.git/`
- `dist/`, `build/`, `coverage/`
- The tracker itself (`scripts/todo-tracker/`)
- **Backup files:** `*.bak`, `*.backup`, `*.old`, `*.orig`, `*.save`, `*.swp`, `*.swo`, `*~`
- **Temp files:** `*.tmp`, `*.temp`, `*.cache`
- **Archive files:** `*.archive`, `*.archived`
- **WIP/Draft files:** `*.wip`, `*.work`, `*.draft`, `*.final`, `*.staging`, `*.dev`, `*.test`, `*.local`, `*.copy`
- **Numbered backups:** `*.backup1`, `*.backup2`, `*.bak1`, `*.old1`, `*.tmp1`, etc.
- **Multi-extension backups:** `*.backup.ts`, `*.old.js`, `*.tmp.py`, `*.wip.tsx`, etc.
- **Archive directories:** `archive/`, `archives/`, `backup/`, `backups/`, `old/`, `legacy/`, `deprecated/`
- **Test outputs:** `test-results/`, `test-output/`, `.nyc_output/`
- **IDE files:** `.vscode/`, `.idea/`, `.DS_Store`, `Thumbs.db`
- **Generated files:** `*.min.js`, `*.bundle.js`, `*.map`, `generated/`

#### Default Exclusions (Can Override)
These are excluded by default, but can be overridden with `--include`:
- `docs/`
- `scripts/` (by default)
- `*.md`, `*.txt`
- `.env*` files
- Config files (`*.config.js`, etc.)

#### Custom Exclusions
Add project-specific exclusions:
```javascript
exclude: {
  custom: [
    '**/generated/**',
    '**/legacy/**',
    '**/vendor/**',
  ]
}
```

### 2. Gitignore Support

By default, the tracker respects `.gitignore`:
```javascript
exclude: {
  respectGitignore: true, // Default: true
}
```

To disable:
```javascript
exclude: {
  respectGitignore: false,
}
```

### 3. Include Specific Folders

#### Via Config File:
```javascript
include: {
  folders: [
    'scripts/validation/**',  // Scan scripts/validation even if scripts/ is excluded
    'docs/examples/**',       // Scan docs/examples even if docs/ is excluded
  ]
}
```

#### Via Command Line:
```bash
node scripts/todo-tracker/todo-tracker.cjs --include=scripts/validation --include=docs/examples
```

**Note:** The tracker **always excludes itself**, even with `--include`.

### 4. Pattern Detection

Enable/disable pattern categories:
```javascript
patterns: {
  enabled: {
    deceptive: true,
    commentedCode: true,
    incomplete: true,
    security: true,
    temporal: true,
    explicit: true,
  }
}
```

Add custom patterns:
```javascript
patterns: {
  custom: [
    {
      regex: /CUSTOM_TAG:/gi,
      type: "CUSTOM",
      severity: "MEDIUM",
      category: "deceptive"
    }
  ]
}
```

### 5. Priority Classification

Customize priority triggers:
```javascript
priorities: {
  blocker: {
    triggers: ['auth', 'security', 'database', 'migration'],
  },
  critical: {
    triggers: ['api', 'validation', 'error'],
  },
  // ...
}
```

### 6. Output Configuration

```javascript
output: {
  format: 'markdown', // 'markdown' | 'json' | 'table'
  file: null,         // null = auto-generate, or specify path
  console: true,      // Print to console
  verbose: false,     // Verbose logging
}
```

### 7. Scan Configuration

```javascript
scan: {
  extensions: ['.ts', '.tsx', '.js', '.jsx'],  // File extensions to scan
  maxFileSize: 10 * 1024 * 1024,              // 10MB - skip larger files
  followSymlinks: false,                       // Follow symlinks
}
```

---

## Command Line Options

### Basic Usage
```bash
# Default scan (respects config and .gitignore)
node scripts/todo-tracker/todo-tracker.cjs

# Focus on specific directory
node scripts/todo-tracker/todo-tracker.cjs --focus=packages/shared/src

# Include specific folders (overrides default exclusions)
node scripts/todo-tracker/todo-tracker.cjs --include=scripts/validation

# Multiple includes
node scripts/todo-tracker/todo-tracker.cjs --include=scripts/validation --include=docs/examples

# Custom config file
node scripts/todo-tracker/todo-tracker.cjs --config=.custom-config.js
```

---

## Examples

### Example 1: Scan Only Source Code
```javascript
// .todo-tracker.config.js
module.exports = {
  exclude: {
    default: [
      '**/docs/**',
      '**/scripts/**',
      '**/tests/**',
      '**/*.test.*',
      '**/*.spec.*',
    ]
  }
}
```

### Example 2: Include Tests
```javascript
module.exports = {
  include: {
    folders: [
      '**/tests/**',
      '**/*.test.*',
      '**/*.spec.*',
    ]
  }
}
```

Or via CLI:
```bash
node scripts/todo-tracker/todo-tracker.cjs --include=tests
```

### Example 3: Custom Domain Exclusions
```javascript
module.exports = {
  exclude: {
    custom: [
      '**/generated/**',      // Generated code
      '**/legacy/**',         // Legacy code
      '**/vendor/**',         // Vendor code
      '**/third-party/**',    // Third-party code
    ]
  }
}
```

### Example 4: JSON Output for CI/CD
```javascript
module.exports = {
  output: {
    format: 'json',
    file: 'lazy-coding-report.json',
    console: false,
  }
}
```

---

## Self-Exclusion

The tracker **always excludes itself**, even with `--include`:
- ✅ `scripts/todo-tracker/` - Always excluded
- ✅ `todo-tracker/` - Always excluded (if installed as package)

This cannot be overridden.

---

## Gitignore Integration

The tracker reads `.gitignore` and respects its patterns:
- Patterns in `.gitignore` are automatically excluded
- Works recursively (respects nested `.gitignore` files)
- Can be disabled via config: `respectGitignore: false`

---

## Best Practices

1. **Create config file** - Don't modify core script
2. **Use .gitignore** - Let gitignore handle exclusions
3. **Use --include sparingly** - Prefer config file for permanent includes
4. **Test exclusions** - Run with `--verbose` to see what's excluded
5. **Version control config** - Commit `.todo-tracker.config.js` to repo

---

## Troubleshooting

### Issue: Files still being scanned despite exclusion

**Solution:**
1. Check config file syntax
2. Verify pattern matches (use `--verbose`)
3. Check if file is in `always` exclusion list
4. Verify `.gitignore` patterns

### Issue: Want to scan excluded folder

**Solution:**
Use `--include` flag:
```bash
node scripts/todo-tracker/todo-tracker.cjs --include=scripts/validation
```

### Issue: Config file not loading

**Solution:**
1. Check file exists: `.todo-tracker.config.js`
2. Check syntax (valid JavaScript)
3. Use `--config=` to specify custom path

---

**Last Updated:** 10-11-2025

