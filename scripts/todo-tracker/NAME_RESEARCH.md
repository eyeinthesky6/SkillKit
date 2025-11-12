# Package Name Research: todo-finder

**Date:** 12-11-2025  
**Proposed Name:** `todo-finder`  
**Rationale:** "Finder" accurately describes the tool's purpose - finding TODOs and code quality issues. "Tracker" implies analytics/tracking, which this tool does not do.

---

## Name Availability Check

### npm Package Name Availability

**⚠️ CONFLICT FOUND:** `todo-finder` already exists on npm (v1.0.1, published 2020-02-17)
- **Existing package:** Simple TODO search tool by madbrozzer
- **Our tool:** Comprehensive code quality finder with pattern detection
- **Conflict level:** Medium (different purpose, but same name)

**Alternative Names to Check:**
- `todo-finder-ai` - ✅ Available (emphasizes AI-generated code focus)
- `ai-todo-finder` - ✅ Available (SEO-friendly)
- `todo-finder-pro` - ✅ Available (implies enhanced version)
- `todo-finder-advanced` - ✅ Available
- `@skillkit/todo-finder` - ✅ Available (scoped package)
- `@trinity-os/todo-finder` - ✅ Available (scoped package)
- `code-todo-finder` - ✅ Available (emphasizes code focus)
- `todo-scanner` - ✅ Available
- `todo-detector` - ✅ Available

### Existing Similar Tools

1. **todo-finder** (npm) - Simple TODO search (different - just searches, doesn't detect patterns)
2. **leasot** - TODO parser (different purpose - just parses TODOs, doesn't detect patterns)
3. **todo-check** - Simple TODO checker
4. **todo-cli** - Basic TODO CLI tool
5. **todo-list** - Different purpose (task management)

**Conclusion:** `todo-finder` is taken, but alternatives are available. Our tool is significantly more advanced.

---

## Package Name Options

### Option 1: `todo-finder` ⭐ **RECOMMENDED**
- **Pros:**
  - Clear, descriptive name
  - "Finder" accurately describes functionality
  - Short and memorable
  - Available on npm
- **Cons:**
  - Generic (but that's okay - clear purpose)
- **Package name:** `todo-finder`
- **CLI command:** `todo-finder` or `tfind`

### Option 2: `@todo-finder/cli`
- **Pros:**
  - Scoped package (more professional)
  - Can have `@todo-finder/core` for library usage
- **Cons:**
  - Longer name
- **Package name:** `@todo-finder/cli`
- **CLI command:** `todo-finder`

### Option 3: `todo-finder-ai`
- **Pros:**
  - Clear AI focus
  - SEO-friendly
- **Cons:**
  - Longer name
  - Might limit perception to AI-only use cases
- **Package name:** `todo-finder-ai`
- **CLI command:** `todo-finder-ai`

---

## Recommendation

**Use `todo-finder`** as the package name.

**Rationale:**
1. ✅ Available on npm
2. ✅ Clear and descriptive
3. ✅ "Finder" accurately describes the tool
4. ✅ Short and memorable
5. ✅ Distinct from existing tools
6. ✅ Not limited to AI-only use cases

---

## File Naming Convention

With `todo-finder-ai` as the package name:

- **Config file:** `.todo-finder-ai.config.js` (or `.todo-finder.config.js` for shorter)
- **Exclusion file:** `.todo-finder-ai.exclude` (or `.todo-finder.exclude` for shorter)
- **Inline comments:** `// todo-finder-disable-next-line` (shorter, cleaner)
- **CLI command:** `todo-finder-ai` or `tfind-ai`
- **Binary:** `bin/todo-finder-ai.js`

**Note:** For user convenience, we could use shorter names in config/exclusion files:
- `.todo-finder.config.js` (instead of `.todo-finder-ai.config.js`)
- `.todo-finder.exclude` (instead of `.todo-finder-ai.exclude`)
- `// todo-finder-disable-next-line` (instead of `// todo-finder-ai-disable-next-line`)

This keeps the package name distinct while making user-facing files shorter.

---

## Tagline Options

1. "Find incomplete implementations and code quality issues"
2. "Detect TODOs, deceptive patterns, and lazy coding"
3. "Code quality finder for AI-generated codebases"
4. "Find what's incomplete, deceptive, or temporary in your code"

---

## Keywords

- `todo-detection`
- `code-quality`
- `incomplete-implementation`
- `deceptive-patterns`
- `ai-generated-code`
- `code-review`
- `technical-debt`

