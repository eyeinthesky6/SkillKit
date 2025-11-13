# TODO Tracker Script Enhancement Priority

**Date:** 2025-11-12  
**Status:** ⚠️ **URGENT ENHANCEMENT NEEDED**

---

## Summary

The todo tracker script has **422 lines of exclusions** to filter false positives. This indicates the pattern matching is fundamentally flawed and needs enhancement.

---

## Current Metrics

- **Exclusions File:** 422 lines
- **False Positives Eliminated:** 84 → 0 (all via exclusions)
- **Pattern Issues:** Patterns are too broad, match legitimate code

---

## Critical Enhancements Needed

### 1. Make Patterns Context-Aware (HIGH PRIORITY)

**Current Problem:**
```javascript
// Matches "add" everywhere
{ regex: /\b(add|needs|remain)\b/gi, type: "INCOMPLETE_WORK" }
```

**Should Be:**
```javascript
// Only matches "add" in comments with incomplete indicators
{ regex: /\/\/.*\b(add|needs|remain)\b.*(?:TODO|FIXME|implement|complete|missing|not.*done)/gi, type: "INCOMPLETE_WORK" }
```

### 2. Built-in Exclusions for Common Patterns (HIGH PRIORITY)

Add built-in detection and exclusion for:
- Method definitions: `add(...)`, `remove(...)`
- Import statements: `import { ...Add... }`
- String literals: `"To add..."` (when not in comments)
- JSDoc comments: `/** Add a skill */`
- Variable names: `skillsToRemove`, `itemsToAdd`

### 3. Require Incomplete Indicators (MEDIUM PRIORITY)

For common words like "add", "remove", "task", "future", require incomplete indicators:
- `TODO: add validation`
- `FIXME: needs implementation`
- `// not yet implemented`

### 4. Separate Pattern Categories (MEDIUM PRIORITY)

- **High Confidence:** Comments with TODO/FIXME/HACK
- **Medium Confidence:** Code patterns (empty returns, stubs)
- **Low Confidence:** Deceptive language (requires context)

---

## Expected Impact

After enhancements:
- **Exclusions File:** <50 lines (down from 422)
- **False Positives:** Minimal (built into patterns)
- **Accuracy:** Higher (better signal-to-noise ratio)
- **Maintainability:** Easier (less configuration)

---

## Implementation Order

1. **Phase 1:** Make INCOMPLETE_WORK pattern context-aware
2. **Phase 2:** Make INCOMPLETE_MARKER pattern context-aware
3. **Phase 3:** Make CLEANUP_NEEDED pattern context-aware
4. **Phase 4:** Add built-in exclusions for common code patterns
5. **Phase 5:** Reduce exclusions file size

---

**Status:** Ready for implementation

