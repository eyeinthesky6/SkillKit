# Agent Setup Instructions - Workflow System Alignment

**🤖 FOR AI AGENTS:** Read this FIRST when workflow system is dropped into a new codebase

---

## 🎯 **Your Mission**

Adapt this workflow system to work with the codebase you're in. The system is framework-agnostic and needs YOUR help to align with this project's:
- Language(s)
- Framework(s)
- Build tools
- Testing tools
- Linting tools
- Project structure

---

## 📋 **Step-by-Step Alignment Protocol**

### **Step 1: Analyze Current Codebase (5 minutes)**

**Run these commands to understand the project:**

```bash
# 1. What language(s)?
ls -la | grep -E "package\.json|requirements\.txt|pom\.xml|composer\.json|go\.mod|Gemfile"

# 2. What's the project structure?
find . -type d -maxdepth 2 | grep -v node_modules | grep -v ".git"

# 3. What build/test tools exist?
grep -E "scripts|test|build|lint" package.json 2>/dev/null || \
grep -E "test|lint" setup.py 2>/dev/null || \
cat pom.xml | grep -A 5 "<plugins>" 2>/dev/null

# 4. Check for existing conventions
ls -la .github/ .cursor/ scripts/ docs/ 2>/dev/null
```

**Record findings:**
```
Language: [TypeScript/Python/Java/PHP/Go/Mix]
Framework: [Next.js/Django/Spring/Laravel/etc]
Build tool: [pnpm/pip/mvn/composer/go]
Test tool: [vitest/pytest/junit/phpunit/go test]
Lint tool: [eslint/flake8/checkstyle/phpcs/golangci-lint]
Structure: [monorepo/single/microservices]
```

---

### **Step 2: Adapt Core Commands (15 minutes)**

**Update these 5 files with correct commands for this project:**

#### **A. Update `cursor-commands/BEGIN_SESSION.md`**

**Find line ~55 (diagnostics section), replace commands:**

**Current (TypeScript example):**
```bash
pnpm run lint 2>&1 | tee /tmp/lint-errors.log
pnpm run type-check 2>&1 | tee /tmp/type-errors.log
node scripts/validation/todo-tracker.cjs > /tmp/todos.txt
pnpm run build > /tmp/build.log 2>&1
```

**Replace with YOUR project's equivalents:**

**If Python/Django:**
```bash
flake8 . 2>&1 | tee /tmp/lint-errors.log
mypy . 2>&1 | tee /tmp/type-errors.log
grep -r "TODO\|FIXME" . --include="*.py" > /tmp/todos.txt
python manage.py check > /tmp/build.log 2>&1
```

**If Java/Spring Boot:**
```bash
mvn checkstyle:check 2>&1 | tee /tmp/lint-errors.log
mvn compile 2>&1 | tee /tmp/type-errors.log
grep -r "TODO\|FIXME" src/ --include="*.java" > /tmp/todos.txt
mvn package -DskipTests > /tmp/build.log 2>&1
```

**If PHP/Laravel:**
```bash
./vendor/bin/phpcs 2>&1 | tee /tmp/lint-errors.log
./vendor/bin/phpstan 2>&1 | tee /tmp/type-errors.log
grep -r "TODO\|FIXME" app/ --include="*.php" > /tmp/todos.txt
php artisan optimize > /tmp/build.log 2>&1
```

**If Go:**
```bash
golangci-lint run 2>&1 | tee /tmp/lint-errors.log
go build ./... 2>&1 | tee /tmp/type-errors.log
grep -r "TODO\|FIXME" . --include="*.go" > /tmp/todos.txt
go build -o /tmp/app 2>&1
```

---

#### **B. Update `cursor-commands/FINAL_CHECK.md`**

**Find line ~14 onwards, replace commands:**

**Current (TypeScript):**
```bash
pnpm run lint 2>&1 | tee /tmp/final-lint.log
pnpm run type-check 2>&1 | tee /tmp/final-type.log
pnpm run build > /tmp/final-build.log 2>&1
pnpm test -- --run $FEATURE_ID 2>&1
```

**Replace with your equivalents** (use same as BEGIN_SESSION + add test command)

---

#### **C. Update `cursor-commands/DEDUP.md`**

**Find line ~36, update file extensions:**

**Current:**
```bash
FILES=$(grep -ril "$FEATURE" packages/shared/src/ apps/ --include="*.ts" | grep -v ".test.")
```

**Python:**
```bash
FILES=$(grep -ril "$FEATURE" . --include="*.py" | grep -v "test_" | grep -v "node_modules")
```

**Java:**
```bash
FILES=$(grep -ril "$FEATURE" src/ --include="*.java" | grep -v "Test.java")
```

**PHP:**
```bash
FILES=$(grep -ril "$FEATURE" app/ --include="*.php" | grep -v "Test.php")
```

**Go:**
```bash
FILES=$(grep -ril "$FEATURE" . --include="*.go" | grep -v "_test.go")
```

---

#### **D. Update `cursor-commands/CREATE_TESTS.md`**

**Replace test file creation template:**

**Current (TypeScript/Vitest):**
```typescript
import { describe, it, expect } from 'vitest';

describe('FEATURE_ID', () => {
  it('should work', () => {
    // Arrange, Act, Assert
  });
});
```

**Python (pytest):**
```python
import pytest

def test_feature_basic():
    """Test FEATURE_ID basic functionality"""
    # Arrange
    # Act
    # Assert
    assert True
```

**Java (JUnit):**
```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FeatureTest {
    @Test
    void testBasicFunctionality() {
        // Arrange, Act, Assert
        assertTrue(true);
    }
}
```

**PHP (PHPUnit):**
```php
<?php
use PHPUnit\Framework\TestCase;

class FeatureTest extends TestCase {
    public function testBasicFunctionality() {
        // Arrange, Act, Assert
        $this->assertTrue(true);
    }
}
```

---

#### **E. Update `cursor-commands/CHECK_DEPS.md`**

**Replace dependency check commands:**

**Current:**
```bash
pnpm run lint 2>&1 | grep -E "error|✖"
pnpm run type-check 2>&1 | grep "error TS"
```

**Use same commands as BEGIN_SESSION diagnostics**

---

### **Step 3: Create Project-Specific Implementation Protocol (20 minutes)**

**CRITICAL:** Replace `cursor-commands/implement-feature.md` with YOUR stack's protocol

**Current file is TypeScript contracts-first (Zod schemas → Interfaces → Services)**

**Your project is different! Create your own protocol:**

#### **Template: Any Project**

```markdown
# Implement Feature - [YOUR FRAMEWORK] Protocol

**🏭 PRODUCTION HARDENING:** ❌ NO mocks/stubs/TODOs ✅ Production-grade code

---

## 📋 **Your Project's Implementation Phases**

### **Phase 0: Pre-Implementation**

**Step 0: DEDUP Check**
```bash
bash .cursor/commands/DEDUP.md check "feature name"
```

[Add your Phase -1 if you have feature planning/design step]

---

### **Phase 1: [YOUR DATA LAYER]**

**What to create:**
- [ ] [Database models/entities/migrations]
- [ ] [Schema definitions]
- [ ] [Relationships]

**Commands:**
```bash
# Your create model command
# Your migration command
```

**Validation:**
```bash
# Your lint command
# Your test command
```

---

### **Phase 2: [YOUR API/CONTRACT LAYER]**

**What to create:**
- [ ] [API endpoints/routes]
- [ ] [Request/response validation]
- [ ] [Serializers/DTOs/Controllers]

**Commands:**
```bash
# Your create API command
```

**Validation:**
```bash
# Your API test command
```

---

### **Phase 3: [YOUR BUSINESS LOGIC LAYER]**

**What to create:**
- [ ] [Services/Use cases/Handlers]
- [ ] [Business rules]
- [ ] [Error handling]

**Validation:**
```bash
# Your unit test command
```

---

### **Phase 4: [YOUR INTEGRATION LAYER - if applicable]**

**What to create:**
- [ ] [External API integrations]
- [ ] [Database queries]
- [ ] [Message queues]

---

### **Phase 5: Tests**

```bash
bash .cursor/commands/CREATE_TESTS.md "FEATURE-ID"
```

---

### **Phase 6: Documentation**

**Step 6.0: Resolve Issues** 🔴 **MANDATORY**
```bash
bash .cursor/commands/RESOLVE_ISSUES.md
```

**Step 6.1: Final DEDUP**
```bash
bash .cursor/commands/DEDUP.md verify "feature name"
```

**Step 6.2: Update docs**
- [ ] Update feature registry
- [ ] Update API docs
- [ ] Update changelog

---

## ✅ **Success Criteria**

- [ ] All phases complete
- [ ] All tests pass: [your test command]
- [ ] Lint clean: [your lint command]
- [ ] Build succeeds: [your build command]
- [ ] No TODOs/mocks/stubs
- [ ] RESOLVE_ISSUES passes (exit 0)
- [ ] FINAL_CHECK passes

---

**Last Updated:** $(date +"%d-%m-%Y")
```

**Save as:** `cursor-commands/implement-feature.md` (replace existing)

---

### **Step 4: Update Root Config (5 minutes)**

**Edit `root-config/agents.yaml`:**

```yaml
# Line 1-5: Update project details
project_name: "YOUR_PROJECT_NAME"
project_type: "YOUR_TYPE"  # web-app, api, microservices, etc.

# Line 10-20: Update paths to YOUR docs
canonical_docs:
  product: "docs/YOUR_PRODUCT_DOC.md"
  tech: "docs/YOUR_TECH_DOC.md"
  architecture: "docs/YOUR_ARCHITECTURE.md"

# Line 25-35: Update diagnostic commands (same as BEGIN_SESSION)
diagnostics:
  lint: "YOUR_LINT_COMMAND"
  type_check: "YOUR_TYPE_CHECK_COMMAND"
  test: "YOUR_TEST_COMMAND"
  build: "YOUR_BUILD_COMMAND"
```

---

### **Step 5: Test the System (10 minutes)**

**Run through complete workflow:**

```bash
# 1. Test entry point
# In Cursor, type: @cursor-commands/BEGIN_SESSION.md

# Agent should:
# - Load context (even if docs don't exist yet)
# - Run YOUR diagnostics (adapted commands)
# - Present task menu
# - Show error counts

# 2. Test duplicate detection
bash cursor-commands/DEDUP.md check "test"
# Should search YOUR file extensions

# 3. Test issue resolution
bash cursor-commands/RESOLVE_ISSUES.md
# Should check for log files

# 4. Test final check
bash cursor-commands/FINAL_CHECK.md
# Should run YOUR diagnostic commands
```

**If tests pass:** ✅ System aligned!  
**If tests fail:** Check commands in Step 2

---

## 📊 **Alignment Checklist**

**Before marking complete, verify:**

### **Commands Updated:**
- [ ] `BEGIN_SESSION.md` - Diagnostics use YOUR tools
- [ ] `FINAL_CHECK.md` - Checks use YOUR tools
- [ ] `DEDUP.md` - Searches YOUR file extensions
- [ ] `CREATE_TESTS.md` - Uses YOUR test framework
- [ ] `CHECK_DEPS.md` - Uses YOUR dependency tools

### **Protocol Created:**
- [ ] `implement-feature.md` - Matches YOUR stack's workflow
- [ ] Phases align with YOUR architecture
- [ ] Commands use YOUR tools

### **Config Updated:**
- [ ] `agents.yaml` - Project name correct
- [ ] `agents.yaml` - Doc paths correct
- [ ] `agents.yaml` - Diagnostic commands correct

### **System Tested:**
- [ ] `@BEGIN_SESSION.md` runs without errors
- [ ] Shows correct file extensions in searches
- [ ] Diagnostic commands execute successfully
- [ ] Error counts display correctly

---

## 🎯 **What NOT to Change**

**Keep these files AS-IS (they're universal):**

- ✅ `RESOLVE_ISSUES.md` - Issue log system
- ✅ `CONTINUE.md` - Resume logic
- ✅ `features.md` - Smart routing
- ✅ `fix-all.md` - Error fixing flow
- ✅ `todo-execution.md` - TODO processing
- ✅ `CORE_RULES.mdc` - Production standards (just adapt examples)

**Only adapt the COMMANDS, not the LOGIC**

---

## 🚨 **Common Mistakes to Avoid**

❌ **DON'T** delete files you don't understand  
✅ **DO** read FRAMEWORK_AGNOSTIC_GUIDE.md first

❌ **DON'T** change file structure  
✅ **DO** only change commands inside files

❌ **DON'T** skip testing  
✅ **DO** test BEGIN_SESSION.md after changes

❌ **DON'T** hardcode project-specific values  
✅ **DO** use variables and config files

---

## 📖 **Reference Documentation**

**Read in this order:**
1. This file (AGENT_SETUP_INSTRUCTIONS.md) ← You are here
2. `FRAMEWORK_AGNOSTIC_GUIDE.md` ← See examples for YOUR stack
3. `REPLICATION_PACKAGE.md` ← Understanding the system
4. `WORKFLOW_SYSTEM_BLUEPRINT.md` ← Architecture details

---

## ✅ **Completion Report Template**

**When done, report to user:**

```
🤖 WORKFLOW SYSTEM ALIGNMENT COMPLETE

Project analyzed:
- Language: [Python/Java/etc]
- Framework: [Django/Spring/etc]
- Structure: [monorepo/single/etc]

Files adapted (5):
✅ BEGIN_SESSION.md - Updated diagnostics
✅ FINAL_CHECK.md - Updated checks
✅ DEDUP.md - Updated file extensions
✅ CREATE_TESTS.md - Updated test framework
✅ implement-feature.md - Created [Framework] protocol

Config updated:
✅ agents.yaml - Project name and paths

System tested:
✅ BEGIN_SESSION.md - Runs successfully
✅ DEDUP.md - Detects [.py/.java/etc] files
✅ Diagnostics - Execute without errors

🚀 Workflow system ready for use!

Try: @cursor-commands/BEGIN_SESSION.md
```

---

## 🆘 **If You Get Stuck**

**Can't find what to replace?**
→ Read `FRAMEWORK_AGNOSTIC_GUIDE.md` for YOUR language

**Don't know the right commands?**
→ Check project's existing `package.json` / `Makefile` / `pom.xml`

**Tests failing?**
→ Run commands manually first, then update files

**Not sure about project structure?**
→ Ask user: "What's your build command?" "What's your test command?"

---

**🎯 Your goal: Make this workflow system feel native to THIS codebase!**

