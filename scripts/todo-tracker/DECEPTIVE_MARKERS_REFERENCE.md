# Deceptive Code Markers Reference

**Purpose:** Track subtle markers and deceptive code patterns that should be detected by todo-tracker scanning.

**Note:** These are intentionally subtle - harder to detect than standard TODO/FIXME comments.

**Location:** This document tracks patterns added to test projects. Check if `todo-tracker.cjs` detects them.

---

## 📋 Marker Categories

### 1. **False Completion Claims**
Comments that claim work is done, but code is incomplete:
- `// Done` / `# Done` - but function is incomplete
- `// Complete` - but missing error handling
- `// Finished` - but has placeholder logic
- `// Implemented` - but uses mock data
- `// Ready` - but has hardcoded values

### 2. **Deceptive Quality Claims**
Comments claiming code quality that contradicts reality:
- `// Optimized` - but has inefficient code
- `// Production ready` - but has obvious bugs
- `// Tested` - but tests are missing/incomplete
- `// Reviewed` - but has obvious issues
- `// Refactored` - but code is actually worse
- `// Clean` - but has technical debt

### 3. **Contradictory Comments**
Comments that contradict the code:
- `// No errors` - but code has error-prone patterns
- `// Safe` - but has security issues
- `// Fast` - but has performance problems
- `// Simple` - but code is complex
- `// Works` - but has edge case bugs

### 4. **Subtle Placeholder Patterns**
Code that looks complete but is actually placeholder:
- Hardcoded values with no comment
- Magic numbers without constants
- Empty catch blocks
- Functions that return hardcoded values
- API calls that always return the same data

### 5. **False Confidence Markers**
Comments expressing false confidence:
- `// Should work` - uncertainty indicator
- `// Probably fine` - indicates doubt
- `// Might need` - deferred work
- `// For now` - temporary solution
- `// Later` - deferred improvement

### 6. **Hidden Technical Debt**
Code marked as acceptable but problematic:
- `// Good enough` - indicates compromise
- `// Works for now` - temporary solution
- `// Acceptable` - indicates known issues
- `// Not ideal but` - compromise made
- `// Quick solution` - indicates shortcuts

### 7. **Temporal Deception** (Common in Real Codebases)
Time-based markers that indicate temporary but become permanent:
- `// Temporary` - stays forever
- `// Quick fix` - never gets fixed
- `// Workaround` - becomes permanent
- `// For now` - stays for years
- `// Until we` - never happens
- `// Next sprint` - never in sprint
- `// Will fix` - never fixed
- `// Soon` - never comes

### 8. **Blame Shifting Patterns** (Human Behavior)
Comments that shift responsibility:
- `// Was like this` - inherited problem
- `// Not my code` - blame previous dev
- `// Inherited from` - excuse for bad code
- `// Legacy code` - excuse to not fix
- `// Copy-paste from` - indicates duplication
- `// From old system` - excuse for outdated code

### 9. **Known Issue Acceptance** (Common Pattern)
Comments accepting problems:
- `// Known issue` - accepted bug
- `// Known bug` - won't fix
- `// Edge case` - often means common case
- `// Rare bug` - happens frequently
- `// Performance acceptable` - when it's not
- `// Not critical` - but should be fixed

### 10. **Debug Code Left Behind** (AI & Human)
Debug code that should be removed:
- `console.log()` everywhere
- `print()` statements
- `debugger;` statements
- `alert()` calls
- `// Breakpoint here` comments
- `sleep()` / `setTimeout()` for timing hacks
- `random()` for IDs instead of proper generation

### 11. **Deferred Work Markers** (Never Happens)
Work that's always deferred:
- `// Later` - never happens
- `// Next version` - never in next version
- `// Future enhancement` - never enhanced
- `// Refactor later` - never refactored
- `// Clean up later` - stays messy
- `// Document later` - never documented
- `// Test later` - never tested
- `// Verify later` - never verified

### 12. **Incomplete Action Verbs** (AI Pattern)
Verbs claiming action but code incomplete:
- `// Add` - but missing
- `// Remove` - but still there
- `// Update` - but outdated
- `// Fix` - but still broken
- `// Improve` - but worse
- `// Implement` - but stubbed
- `// Support` - but not supported
- `// Handle` - but not handled
- `// Check` - but skipped
- `// Validate` - but missing

### 13. **Commented Out Code** (Common Issue)
Code that should be deleted:
- Large blocks of commented code
- `// export function` - disabled functionality
- `// if (condition)` - disabled logic
- `// return` - disabled return
- Commented imports that are still used

### 14. **Empty/No-Op Patterns** (AI Generated)
Code that does nothing:
- Empty catch blocks `catch {}` / `except: pass`
- Functions returning empty `return []` / `return {}`
- No-op async functions `return Promise.resolve()`
- Always-true validation `return true`
- Always-false checks `return false`

### 15. **Magic Values Without Context** (Real Codebases)
Hardcoded values that should be constants:
- Magic numbers `42`, `1000`, `5000`
- Hardcoded strings `"production"`, `"localhost"`
- Hardcoded IDs `"12345"`, `"test-user"`
- Hardcoded dates `"2024-01-01"`
- Hardcoded URLs `"https://api.example.com"`

### 16. **Feature Flag Deception** (Common Pattern)
Hardcoded feature flags:
- `if (true)` - always enabled
- `if (false)` - always disabled
- `featureFlag = true` - hardcoded
- `// TODO: Remove feature flag` - never removed

### 17. **Test Deception** (Common Issue)
Tests that don't actually test:
- Disabled tests `it.skip()`, `@skip`, `xit()`
- Empty test bodies
- Tests that always pass
- Commented out tests
- `// TODO: Add test` - never added

### 18. **Type Safety Deception** (TypeScript/Modern Code)
Type safety claims that aren't safe:
- `as any` everywhere
- `// @ts-ignore` without reason
- `unknown` cast to specific type without check

### 19. **Silent Fallbacks** (Passes Tests But Hides Errors) ⚠️ NEW
Catch/except blocks that return null/empty without logging - tests pass but errors are hidden:
- `catch { return null; }` - no error handling
- `except: return None` - silent failure
- `catch { return []; }` - returns empty instead of handling error
- `catch { return {}; }` - returns empty object instead of handling

### 20. **Hardcoded Conditionals** (Always True/False) ⚠️ NEW
Conditionals that always evaluate the same - indicates incomplete logic:
- `if (true) { return ... }` - always executes
- `if (false) { ... }` - dead code
- `const flag = true; // TODO: remove` - hardcoded feature flag

### 21. **Placeholder Defaults** (Looks Like Real Defaults) ⚠️ NEW
Default values that are actually placeholders:
- `function foo(param = null)` - placeholder default
- `function foo(param = [])` - empty default
- `const value = null; // TODO: implement` - placeholder variable

### 22. **Mock Data in Production** (Not in Test Files) ⚠️ NEW
Mock/dummy/fake data in production code (not test files):
- `const mockData = { ... }` - in production code
- `const dummyUser = { ... }` - in production code
- `const fakeResponse = { ... }` - in production code

### 23. **Empty Error Handlers** (Just Return Without Handling) ⚠️ NEW
Catch/except that just return without actually handling the error:
- `catch { // ignore; return; }` - ignores error
- `except: # silent; return` - silent failure
- `catch { return null; // error }` - returns null on error

### 24. **Fallback to Hardcoded Values** (Looks Like Error Handling) ⚠️ NEW
Error handling that just returns hardcoded data:
- `catch { return "test"; }` - returns hardcoded string
- `except: return 123` - returns hardcoded number
- `catch { return true; }` - returns hardcoded boolean

### 25. **Always Returns Same Value** (Function Doesn't Process Input) ⚠️ NEW
Function that always returns the same result regardless of input:
- `function validate() { return true; }` - always true
- `def check(): return False` - always false
- `function process() { return null; }` - always null

### 26. **Exclusion Misuse** (Agents Bypassing Detections) ⚠️ NEW
Using exclusions to suppress detections:
- `// todo-tracker-disable-next-line` without reason
- Multiple exclusions in quick succession
- Excluding blocker patterns (COMMENTED_OUT_CODE, FOR_NOW, etc.)
- Broad exclusion patterns (`**/*`)
- File-level exclusions (excludes entire files)
- Vague exclusion reasons ("ok", "fine", "works")
- Config file exclusions without reasons
- Broad exclusion patterns in config files

### 27. **Error Handling Deception** (Common Pattern)
Error handling that doesn't handle:
- Empty catch blocks
- Catch that only logs
- `catch (e) {}` - swallows errors
- `except: pass` - Python silent failure
- `// Error handling` - but no handling code

### 20. **Performance Claims** (Often False)
Performance claims that contradict code:
- `// Optimized` - but O(n²)
- `// Fast` - but slow operations
- `// Efficient` - but inefficient
- `// Cached` - but no cache
- `// Lazy loaded` - but eager

---

## 🎯 Test Files with Markers

### Python (`python-project/app.py`)
- ✅ `# Done` - but function incomplete
- ✅ `# Optimized` - but inefficient
- ✅ `# Production ready` - but has bugs
- ✅ Hardcoded values without constants
- ✅ Empty error handling

### TypeScript (`typescript-project/src/index.ts`)
- ✅ `// Complete` - but missing validation
- ✅ `// Tested` - but tests incomplete
- ✅ `// Safe` - but has type issues
- ✅ Magic numbers
- ✅ Functions returning hardcoded data

### Node.js (`nodejs-project/index.js`)
- ✅ `// Finished` - but placeholder logic
- ✅ `// Works` - but edge case bugs
- ✅ `// Simple` - but complex code
- ✅ Empty catch blocks
- ✅ Contradictory comments

### Mixed Language Project

#### Python (`mixed-language-project/main.py`)
- ✅ `// Implemented` - but uses mock
- ✅ `// Ready` - but hardcoded values
- ✅ `// No errors` - but error-prone
- ✅ Deceptive function names

#### TypeScript (`mixed-language-project/apps/web/src/index.ts`)
- ✅ `// Reviewed` - but has issues
- ✅ `// Refactored` - but worse code
- ✅ `// Clean` - but technical debt
- ✅ Subtle type issues

#### Go (`mixed-language-project/services/api/main.go`)
- ✅ `// Should work` - uncertainty
- ✅ `// Probably fine` - doubt
- ✅ `// For now` - temporary
- ✅ Hidden error handling issues

#### Java (`mixed-language-project/packages/shared/src/main/java/com/test/shared/Greeter.java`)
- ✅ `// Good enough` - compromise
- ✅ `// Works for now` - temporary
- ✅ `// Not ideal but` - known issues
- ✅ Subtle logic bugs

---

## 📊 Detection Checklist

When scanning, check if SkillKit detects:

- [ ] False completion claims (`Done`, `Complete`, `Finished`)
- [ ] Deceptive quality claims (`Optimized`, `Production ready`, `Tested`)
- [ ] Contradictory comments (`No errors`, `Safe`, `Works`)
- [ ] Subtle placeholders (hardcoded values, magic numbers)
- [ ] False confidence (`Should work`, `Probably fine`, `For now`)
- [ ] Hidden technical debt (`Good enough`, `Works for now`, `Not ideal but`)
- [ ] Empty error handling
- [ ] Functions returning hardcoded data
- [ ] Contradictory function names vs implementation

---

## 🔍 Expected Detection Patterns

**High Priority:**
1. Comments claiming completion but code incomplete
2. Comments claiming quality but code has issues
3. Hardcoded values in production code
4. Empty error handling blocks

**Medium Priority:**
5. Contradictory comments
6. False confidence markers
7. Magic numbers without constants

**Low Priority:**
8. Subtle type issues
9. Deceptive function names
10. Hidden technical debt markers

---

**Last Updated:** 2025-01-XX  
**Total Markers Added:** ~50+ across all test projects

---

## 🌍 Real-World Patterns from Codebases

### Patterns Seen in Production Code:

**From Human Developers:**
- `// Known issue - won't fix` - accepted bugs
- `// Was like this when I got here` - blame shifting
- `// Legacy code - don't touch` - fear of breaking
- `// Quick hack for demo` - becomes permanent
- `// TODO: Fix this (added 2020)` - years old
- `// Copy-paste from Stack Overflow` - unverified code
- `// Performance is fine` - when it's not
- `// Edge case` - but happens frequently
- `// Not my problem` - responsibility avoidance

**From AI-Generated Code:**
- `// Placeholder implementation` - stays placeholder
- `// Mock data for testing` - in production
- `// Example code` - shipped to production
- `// Demo implementation` - never replaced
- `// Temporary solution` - becomes permanent
- `// Will be implemented` - never is
- `// Add error handling` - but missing
- `// Add validation` - but missing
- `// Add tests` - but missing

**Common in Both:**
- `console.log()` everywhere - debug code left in
- Empty catch blocks - errors swallowed
- Hardcoded values - should be config
- Commented out code - should be deleted
- Disabled tests - broken functionality
- `as any` - type safety bypassed
- Magic numbers - no constants
- Feature flags hardcoded - dead code

---

## 📊 Detection Priority

**Critical (Production Blockers):**
1. Empty error handling
2. Hardcoded credentials/secrets
3. Disabled tests for critical paths
4. Commented out production code
5. `as any` in security-sensitive code

**High (Quality Issues):**
6. False completion claims
7. Deceptive quality claims
8. Known issues accepted
9. Debug code in production
10. Incomplete implementations

**Medium (Technical Debt):**
11. Temporal deception markers
12. Blame shifting patterns
13. Deferred work markers
14. Magic values
15. Feature flag deception

**Low (Code Smell):**
16. Contradictory comments
17. False confidence markers
18. Type safety deception
19. Performance false claims
20. Incomplete action verbs

---

**Total Pattern Categories:** 20  
**Total Individual Patterns:** 100+  
**Based on:** Real codebases, developer forums, AI-generated code analysis

