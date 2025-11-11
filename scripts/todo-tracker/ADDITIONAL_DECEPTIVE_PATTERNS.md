# Additional Deceptive Patterns from Research

**Date:** 10-11-2025  
**Source:** Internet research on AI-generated code deceptive patterns

---

## New Patterns Found

### 1. Misleading Function Names with Basic Implementation

**Pattern:** Functions with names suggesting complex operations but only return basic values

**Examples:**
```javascript
function encryptData(data) {
  return data; // Just returns input, no encryption
}

function validateInput(input) {
  return true; // Always returns true, no validation
}

function authenticateUser(user) {
  return { authenticated: true }; // No actual auth logic
}
```

**Detection Patterns:**
- Function names with `encrypt`, `validate`, `authenticate`, `process`, `calculate`, `transform`
- But implementation is just `return input` or `return true` or `pass`

### 2. Comments Claiming Functionality But Code Is Empty

**Pattern:** Comments describe full functionality but code is incomplete

**Examples:**
```javascript
// This function processes user data and returns the result
function processUserData(user) {
  pass; // TODO: Implement processing logic
}

// Function to encrypt sensitive data
function encrypt(data) {
  return data; // No encryption
}
```

**Detection Patterns:**
- Comments mentioning "processes", "encrypts", "validates", "calculates"
- But code is `pass`, `return input`, `return true`, or empty

### 3. Hallucinated Objects/Functions

**Pattern:** Code references non-existent functions/objects

**Examples:**
```javascript
function processData(data) {
  return DataProcessor.process(data); // DataProcessor doesn't exist
}

function getUser(id) {
  return UserService.fetch(id); // UserService not imported
}
```

**Detection:** Harder to detect statically, but comments might hint at this

### 4. Overly Simplistic Error Handling

**Pattern:** Error handling that doesn't actually handle errors

**Examples:**
```javascript
try {
  result = riskyOperation();
} catch (Exception e) {
  print("An error occurred."); // Generic, no logging, no recovery
}

try {
  // Complex operation
} catch {
  // Silent failure
}
```

**Detection Patterns:**
- Generic error messages: "An error occurred", "Something went wrong"
- Empty catch blocks
- No error logging or recovery

### 5. Misleading Comments vs Implementation

**Pattern:** Comments say one thing, code does another

**Examples:**
```javascript
// Validates user input and sanitizes data
function validateInput(input) {
  return input; // No validation or sanitization
}

// Encrypts password before storing
function storePassword(password) {
  db.save(password); // Stored in plaintext
}
```

**Detection:** Comment mentions action but code doesn't perform it

### 6. Functions That Claim to Do Something But Just Pass

**Pattern:** Functions with descriptive names but only `pass` or `return`

**Examples:**
```python
def process_data(data):
    # Processes the data
    pass

def calculate_total(items):
    # Calculates total
    return 0
```

**Detection:** Function name suggests action but body is empty/basic

### 7. "Fully Implemented" Claims

**Pattern:** Comments claim full implementation but code is stub

**Examples:**
```javascript
// Fully implemented encryption
function encrypt(data) {
  return data; // Just returns input
}

// Complete validation logic
function validate(input) {
  return true; // Always passes
}
```

**Detection:** Comments with "fully", "complete", "fully implemented"

### 8. Security Functions Without Security

**Pattern:** Security-related functions that don't actually secure

**Examples:**
```javascript
function sanitizeInput(input) {
  return input; // No sanitization
}

function checkPermission(user, resource) {
  return true; // Always allows
}

function hashPassword(password) {
  return password; // No hashing
}
```

**Detection:** Security function names but no security logic

---

## Recommended Patterns to Add

### High Priority (Critical Security/Functionality)

1. **MISLEADING_SECURITY_FUNCTION**
   - Function names: `encrypt`, `hash`, `sanitize`, `validate`, `authenticate`, `authorize`, `checkPermission`
   - But implementation is just `return input` or `return true`

2. **EMPTY_FUNCTION_BODY**
   - Function with descriptive name but only `pass`, `return`, or empty body

3. **GENERIC_ERROR_HANDLING**
   - Generic error messages: "An error occurred", "Something went wrong"
   - Empty catch blocks

4. **COMMENT_MISMATCH**
   - Comment claims functionality but code doesn't implement it
   - Comment says "encrypts" but code just returns input

### Medium Priority

5. **FULLY_IMPLEMENTED_CLAIM**
   - Comments with "fully implemented", "complete", "fully functional"
   - But code is stub or basic

6. **PROCESSING_FUNCTION_NO_LOGIC**
   - Function names: `process`, `calculate`, `transform`, `compute`
   - But just returns input or basic value

---

## Implementation Strategy

### Pattern 1: Misleading Security Functions
```javascript
// Detect function definitions with security-related names
// but implementations that just return input/true
{ 
  regex: /function\s+(encrypt|hash|sanitize|validate|authenticate|authorize|checkPermission|secure)\w*\s*\([^)]*\)\s*\{[^}]*return\s+(input|data|true|password|user)/gi,
  type: "MISLEADING_SECURITY_FUNCTION",
  severity: "CRITICAL",
  category: "security"
}
```

### Pattern 2: Empty Function Bodies
```javascript
// Functions with descriptive names but empty/basic bodies
{
  regex: /function\s+\w+(?:Data|Input|User|Value|Result)\w*\s*\([^)]*\)\s*\{[^}]*?(?:pass|return\s*(?:input|data|true|false|null|undefined|0|''|\[\]|\{\}))[^}]*\}/gi,
  type: "EMPTY_FUNCTION_BODY",
  severity: "HIGH",
  category: "incomplete"
}
```

### Pattern 3: Comment Mismatch
```javascript
// Comments claiming functionality but code doesn't match
{
  regex: /\/\/.*(?:encrypts|validates|sanitizes|processes|calculates|transforms).*[\r\n]+.*function.*\{[^}]*return\s+(?:input|data|true)/gi,
  type: "COMMENT_MISMATCH",
  severity: "HIGH",
  category: "deceptive"
}
```

### Pattern 4: Generic Error Handling
```javascript
{
  regex: /catch\s*\([^)]*\)\s*\{[^}]*?(?:An error occurred|Something went wrong|Error|Exception)[^}]*\}/gi,
  type: "GENERIC_ERROR_HANDLING",
  severity: "MEDIUM",
  category: "incomplete"
}
```

### Pattern 5: Fully Implemented Claims
```javascript
{
  regex: /\/\/.*(?:fully implemented|complete implementation|fully functional|fully working)/gi,
  type: "FULLY_IMPLEMENTED_CLAIM",
  severity: "HIGH",
  category: "deceptive"
}
```

---

## Summary

**New Patterns Identified:** 8 major categories  
**Critical Patterns:** 4 (security-related)  
**High Priority:** 2 (functionality-related)  
**Medium Priority:** 2 (code quality)

**Total New Patterns to Add:** ~10-12 specific regex patterns

---

**Next Steps:**
1. Add these patterns to `deceptivePatterns` array
2. Test against real AI-generated code samples
3. Refine patterns based on false positive rate
4. Document in README

