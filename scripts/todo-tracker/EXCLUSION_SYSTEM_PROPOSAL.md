# Exclusion System Proposal for Package Distribution

**Date:** 12-11-2025  
**Purpose:** Design exclusion system for handling false positives in package distribution

---

## Current State

### ✅ What We Have:
1. **File-level exclusions** via `.lazy-coding-tracker.config.js`
2. **Pattern-level exclusions** hardcoded in the script (for common false positives)
3. **Config file support** for custom file patterns

### ❌ What We're Missing:
1. **Inline exclusions** (like ESLint's `// eslint-disable-next-line`)
2. **Pattern exclusion file** (like `.eslintignore` but for patterns)
3. **Priority/category customization** (users can't adjust what's critical vs major)
4. **Line-specific exclusions** (exclude specific lines without changing code)

---

## Proposal: Multi-Layer Exclusion System

### Layer 1: Inline Exclusions (ESLint-style)

Allow users to exclude specific lines or blocks:

```typescript
// lazy-coding-tracker-disable-next-line
console.warn('Path validation has bypass opportunities'); // This is a security warning, not lazy coding

// lazy-coding-tracker-disable-line
const placeholderRegex = /## \{\{CUSTOM_HEADER\}\}/g; // Variable name, not lazy coding

/* lazy-coding-tracker-disable */
// This entire block is excluded
function generateReport() {
  // ... code with intentional TODOs
}
/* lazy-coding-tracker-enable */
```

**Syntax:**
- `lazy-coding-tracker-disable-next-line` - Exclude next line
- `lazy-coding-tracker-disable-line` - Exclude current line
- `lazy-coding-tracker-disable` - Disable until `lazy-coding-tracker-enable`
- `lazy-coding-tracker-disable-next-line: SIMPLIFIED` - Exclude specific pattern type

### Layer 2: Pattern Exclusion File

Create `.lazy-coding-tracker.exclusions.json`:

```json
{
  "patterns": [
    {
      "file": "src/runtime/validator.ts",
      "line": 12,
      "pattern": "SIMPLIFIED",
      "reason": "Intentional simplification - documented TODO"
    },
    {
      "file": "src/**/*.test.ts",
      "pattern": "EXPLICIT_MARKERS",
      "reason": "Test names contain workflow names (FIX_BUGS, etc.)"
    },
    {
      "file": "**/*.ts",
      "pattern": "TEMPORAL_LANGUAGE",
      "match": "console.warn.*bypass.*opportunity",
      "reason": "Security warnings, not lazy coding"
    }
  ],
  "globalExclusions": {
    "patterns": [
      {
        "type": "SIMPLIFIED",
        "match": "/\\/\\/.*This is a simplified.*implementation/i",
        "reason": "Documented simplifications with TODOs"
      },
      {
        "type": "EXPLICIT_TODO",
        "match": "/\\/\\/.*TODO:.*Extend.*support/i",
        "reason": "Actionable TODOs with clear scope"
      }
    ]
  }
}
```

### Layer 3: Config-Based Pattern Customization

Extend `.todo-finder.config.js`:

```javascript
module.exports = {
  // ... existing file exclusions ...
  
  // Pattern-level exclusions
  patternExclusions: {
    // Exclude specific pattern types globally
    disabled: [
      // 'SIMPLIFIED', // Uncomment to disable SIMPLIFIED detection entirely
    ],
    
    // Custom pattern overrides
    overrides: [
      {
        type: 'SIMPLIFIED',
        match: /\/\/.*This is a simplified.*implementation.*TODO/i,
        action: 'exclude', // or 'downgrade' to change priority
        reason: 'Documented simplifications with actionable TODOs'
      },
      {
        type: 'EXPLICIT_TODO',
        match: /\/\/.*TODO:.*Extend.*support/i,
        action: 'downgrade',
        priority: 'major', // Change from critical to major
        reason: 'Actionable TODOs are less urgent than incomplete code'
      }
    ],
    
    // File-specific pattern exclusions
    filePatterns: [
      {
        files: '**/*.test.ts',
        patterns: ['EXPLICIT_MARKERS'],
        action: 'exclude',
        reason: 'Test names contain workflow names'
      },
      {
        files: 'src/runtime/validator.ts',
        patterns: ['SIMPLIFIED'],
        action: 'downgrade',
        priority: 'major',
        reason: 'Intentional simplification with TODO'
      }
    ]
  },
  
  // Priority customization
  priorities: {
    // Override default priority mappings
    SIMPLIFIED: {
      default: 'critical',
      // Custom rules
      rules: [
        {
          match: /\/\/.*TODO:.*Extend/i,
          priority: 'major' // Downgrade if has TODO
        }
      ]
    },
    EXPLICIT_TODO: {
      default: 'critical',
      rules: [
        {
          match: /\/\/.*TODO:.*(Extend|Enhance|Add support)/i,
          priority: 'major' // Actionable TODOs are less urgent
        },
        {
          match: /\/\/.*TODO:.*(Fix|Implement|Complete)/i,
          priority: 'critical' // Fix TODOs are urgent
        }
      ]
    }
  },
  
  // Category customization
  categories: {
    // Override default category mappings
    SIMPLIFIED: 'deceptive', // or 'technical_debt'
    EXPLICIT_TODO: 'explicit', // or 'incomplete'
  }
}
```

### Layer 4: Agent-Friendly Exclusion File

Create `.todo-finder.exclude` (simple text format):

```
# Pattern exclusions for todo-finder
# Format: file:line:pattern:reason

# Intentional simplifications with TODOs
src/runtime/validator.ts:12:SIMPLIFIED:Intentional simplification - documented TODO
src/runtime/validator.ts:108:UNIMPLEMENTED_FEATURE:Documented limitation with fallback

# Test files - workflow names in test names
**/*.test.ts:*:EXPLICIT_MARKERS:Test names contain workflow names (FIX_BUGS, etc.)

# Security warnings
**/*.ts:*:TEMPORAL_LANGUAGE:Security warnings about bypasses (not lazy coding)

# Actionable TODOs (less urgent)
**/*.ts:*:EXPLICIT_TODO:Actionable TODOs with clear scope (downgrade to major)
```

**Benefits:**
- Simple format agents can easily edit
- Version-controlled
- Easy to review in PRs
- No JSON syntax errors

---

## Implementation Plan

### Phase 1: Inline Exclusions (High Priority)
- [ ] Parse `lazy-coding-tracker-disable-*` comments
- [ ] Support pattern-specific exclusions
- [ ] Support block-level exclusions

### Phase 2: Exclusion File (High Priority)
- [ ] Support `.todo-finder.exclusions.json`
- [ ] Support `.todo-finder.exclude` (simple format)
- [ ] Merge exclusions from both sources

### Phase 3: Config Customization (Medium Priority)
- [ ] Extend config file with `patternExclusions`
- [ ] Implement priority customization
- [ ] Implement category customization

### Phase 4: Tooling (Low Priority)
- [ ] CLI command to generate exclusion file from current issues
- [ ] Auto-suggest exclusions for common patterns
- [ ] Validate exclusion file syntax

---

## Example Usage

### Before (Current):
```typescript
// This is a simplified implementation. In a real-world scenario,
// you'd want to use a more comprehensive library or handle more cases.
export function jsonSchemaToZod(schema: JSONSchema7) {
  // ... flagged as SIMPLIFIED (critical)
}
```

### After (With Exclusions):
```typescript
// todo-finder-disable-next-line: SIMPLIFIED
// This is a simplified implementation. In a real-world scenario,
// you'd want to use a more comprehensive library or handle more cases.
export function jsonSchemaToZod(schema: JSONSchema7) {
  // ... not flagged
}
```

Or via exclusion file:
```
src/runtime/validator.ts:12:SIMPLIFIED:Intentional simplification - documented TODO
```

---

## Benefits

1. **User Control** - Users can exclude false positives without code changes
2. **Agent-Friendly** - Simple exclusion file format for AI agents
3. **Version Controlled** - Exclusion file can be reviewed in PRs
4. **Flexible** - Multiple exclusion methods (inline, file, config)
5. **Transparent** - Reasons documented for each exclusion
6. **Customizable** - Users can adjust priorities/categories per project

---

## Migration Path

1. **Current users** - Continue working, no breaking changes
2. **New users** - Can use exclusion system from day 1
3. **Gradual adoption** - Users can migrate to exclusion file over time
4. **Backward compatible** - All existing configs continue to work

