# Code Pattern Detection - Beyond Comments

**Date:** 10-11-2025  
**Purpose:** Document code pattern detection (not just comments)

---

## ✅ What the Script Detects

### 1. Comments (Text Patterns)
- Explicit TODOs (`// TODO:`, `// FIXME:`)
- Deceptive language in comments (`"simplified"`, `"for now"`)
- Comment mismatches (comment claims functionality but code doesn't)

### 2. Code Patterns (Actual Code Structure) ✅
- **Commented out code** - Executable code that's commented out
- **Incomplete implementations** - `throw new Error("not implemented")`
- **Empty return patterns** - Functions that always return `[]`, `{}`, `null`, `undefined`
- **No-op async functions** - `async function() { return Promise.resolve() }`
- **Always returns boolean** - Validation functions that always return `true`/`false`
- **Misleading security functions** - Security-named functions that don't secure
- **Empty function bodies** - Functions with descriptive names but empty bodies

---

## 🎯 Code Pattern Detection Examples

### Example 1: Empty Return Pattern (No Comment Needed)
```typescript
function getUserData(userId: string) {
  return []; // ❌ DETECTED: EMPTY_RETURN_PATTERN
}

function getConfig() {
  return {}; // ❌ DETECTED: EMPTY_RETURN_PATTERN
}
```

### Example 2: No-Op Async Function
```typescript
async function fetchUserData(userId: string) {
  return Promise.resolve({}); // ❌ DETECTED: NO_OP_ASYNC
}
```

### Example 3: Always Returns Boolean
```typescript
function validateInput(input: string) {
  return true; // ❌ DETECTED: ALWAYS_RETURNS_BOOLEAN
}

function hasPermission(user: User) {
  return false; // ❌ DETECTED: ALWAYS_RETURNS_BOOLEAN
}
```

### Example 4: Commented Out Code
```typescript
// export function processOrder(order: Order) {
//   return orderService.execute(order);
// } // ❌ DETECTED: COMMENTED_OUT_CODE
```

### Example 5: Incomplete Implementation
```typescript
function processData(data: Data) {
  throw new Error("not implemented"); // ❌ DETECTED: INCOMPLETE_IMPLEMENTATION
}
```

---

## 📊 Detection Capabilities

### Comments Only ❌
- Standard TODO trackers (leasot, etc.)
- Only detect `// TODO:`, `// FIXME:`

### Comments + Code Patterns ✅ (Our Tracker)
- Detects comments (explicit TODOs, deceptive language)
- **ALSO detects code patterns** (empty returns, no-op functions, commented code)
- **Catches lazy coding even without comments**

---

## 🔍 Code Pattern Detection Details

### Pattern Categories:

1. **Empty Return Patterns**
   - Functions returning `[]`, `{}`, `null`, `undefined`
   - No comment needed - code structure reveals stub

2. **No-Op Async Functions**
   - `async function() { return Promise.resolve() }`
   - Looks like async but does nothing

3. **Always Returns Boolean**
   - Validation functions that always return `true`/`false`
   - No actual validation logic

4. **Commented Out Code**
   - Executable code that's commented out
   - Causes type errors, missing functionality

5. **Incomplete Implementations**
   - `throw new Error("not implemented")`
   - Explicit admission of incompleteness

---

## ✅ TypeScript Support

**Yes, works for TypeScript codebases:**
- Scans `.ts`, `.tsx` files
- Detects TypeScript-specific patterns
- Handles TypeScript syntax (async/await, type annotations)
- Works with TypeScript comment styles (`//`, `/* */`)

---

## 🎯 Key Advantage

**We detect lazy coding even when developers don't add comments!**

- Standard trackers: Only find `// TODO:` comments
- Our tracker: Finds code patterns that indicate incomplete work

**Example:**
```typescript
// No comment, but still detected!
function getUserData(userId: string) {
  return []; // ❌ DETECTED: EMPTY_RETURN_PATTERN
}
```

---

**Status:** ✅ Code pattern detection implemented  
**Last Updated:** 10-11-2025

