# Package Name Research: todo-tracker

**Date:** 12-11-2025  
**Final Name:** `todo-tracker`  
**Rationale:** "Tracker" accurately describes the tool's purpose - tracking TODOs and code quality issues across the codebase. This name was chosen over alternatives after research.

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

## Final Decision

**Using `todo-tracker`** as the package name.

**Rationale:**
1. ✅ Available on npm (no conflicts)
2. ✅ Clear and descriptive
3. ✅ "Tracker" accurately describes tracking issues across codebase
4. ✅ Short and memorable
5. ✅ Distinct from existing tools
6. ✅ Not limited to AI-only use cases
7. ✅ Consistent with existing tool naming

---

## File Naming Convention

With `todo-tracker` as the package name:

- **Config file:** `.todo-tracker.config.js`
- **Exclusion file:** `.todo-tracker.exclude` or `.todo-tracker.exclusions.json`
- **Inline comments:** `// todo-tracker-disable-next-line`
- **CLI command:** `todo-tracker` or `tt`
- **Binary:** `bin/todo-tracker.js`

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

