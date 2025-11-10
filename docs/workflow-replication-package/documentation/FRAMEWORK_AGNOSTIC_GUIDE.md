# Framework-Agnostic Workflow System

**⚡ TL;DR:** How to adapt this workflow system for ANY tech stack, framework, or language

**Works with:** Python, Java, Go, PHP, Ruby, C#, React, Vue, Django, Flask, Spring Boot, etc.

---

## 🎯 **Core Principles (Universal)**

**These concepts work in ANY project:**

1. ✅ **Diagnostics First** - Run checks before coding
2. ✅ **Duplicate Prevention** - Detect similar code
3. ✅ **Production Standards** - No mocks/stubs/TODOs
4. ✅ **Issue Recording** - Log problems for resolution
5. ✅ **Entry Point** - Start sessions with context

**Language/framework-specific parts are < 20% of the system!**

---

## 📋 **What to Keep (Universal - 80%)**

### **Keep These Commands (Work Everywhere):**

| Command | Universal? | Why |
|---------|-----------|-----|
| **BEGIN_SESSION.md** | ✅ YES | Context + diagnostics work for any project |
| **features.md** | ✅ YES | Smart routing based on errors/TODOs |
| **DEDUP.md** | ✅ YES | Duplicate detection works on any code |
| **RESOLVE_ISSUES.md** | ✅ YES | Issue tracking is universal |
| **CONTINUE.md** | ✅ YES | Resume work anywhere |
| **fix-all.md** | ✅ YES | Error fixing is universal |
| **todo-execution.md** | ✅ YES | TODOs exist in all languages |
| **FINAL_CHECK.md** | ⚠️  ADAPT | Keep structure, change commands |
| **CREATE_TESTS.md** | ⚠️  ADAPT | Keep structure, change test framework |
| **CHECK_DEPS.md** | ⚠️  ADAPT | Keep structure, change check commands |
| **implement-feature.md** | ❌ REPLACE | This is ProfitPilot-specific (contracts-first) |

---

## 🔄 **What to Replace (Language-Specific - 20%)**

### **Replace: `implement-feature.md`**

**ProfitPilot uses:** Contracts-first (Zod schemas → Interfaces → Services)

**Create your own protocol based on YOUR stack:**

#### **Example: Python/Django Project**

```markdown
# Implement Feature - Django Protocol

## Phase 1: Models (Database Schema)
- Create Django models in `models.py`
- Add fields with validators
- Run: `python manage.py makemigrations`

## Phase 2: Serializers (API Contract)
- Create serializers in `serializers.py`
- Define input/output validation
- Add to API views

## Phase 3: Views (Business Logic)
- Implement view functions/classes
- Add business logic
- Handle errors

## Phase 4: Tests
- Create test file
- Test models, serializers, views
- Run: `pytest`

## Phase 5: URLs
- Add URL patterns
- Wire up views
- Test endpoints
```

#### **Example: Java/Spring Boot Project**

```markdown
# Implement Feature - Spring Boot Protocol

## Phase 1: Entity (Database Model)
- Create `@Entity` class
- Add JPA annotations
- Define relationships

## Phase 2: Repository (Data Access)
- Create repository interface
- Extend JpaRepository
- Add custom queries

## Phase 3: DTO (Data Transfer Object)
- Create request/response DTOs
- Add validation annotations
- Document with Swagger

## Phase 4: Service (Business Logic)
- Implement service class
- Add @Service annotation
- Inject dependencies

## Phase 5: Controller (API Endpoints)
- Create controller
- Add REST mappings
- Handle exceptions

## Phase 6: Tests
- Create unit tests
- Integration tests
- Run: `mvn test`
```

#### **Example: PHP/Laravel Project**

```markdown
# Implement Feature - Laravel Protocol

## Phase 1: Migration (Database)
- Create migration: `php artisan make:migration`
- Define schema
- Run: `php artisan migrate`

## Phase 2: Model (Eloquent ORM)
- Create model: `php artisan make:model`
- Define relationships
- Add fillable fields

## Phase 3: Request Validation
- Create FormRequest
- Define validation rules
- Add authorization logic

## Phase 4: Controller
- Create controller
- Implement CRUD methods
- Return JSON responses

## Phase 5: Routes
- Add to `routes/api.php`
- Apply middleware
- Test endpoints

## Phase 6: Tests
- Create test: `php artisan make:test`
- Test CRUD operations
- Run: `php artisan test`
```

---

## 🔧 **Adapt Diagnostic Commands**

### **FINAL_CHECK.md - Make it Framework-Agnostic**

**ProfitPilot version (TypeScript):**
```bash
pnpm run lint
pnpm run type-check
pnpm run build
pnpm test
```

**Python/Django version:**
```bash
# Linting
flake8 . --count --show-source
black . --check
mypy .

# Tests
pytest --cov

# Migrations
python manage.py check
python manage.py makemigrations --check --dry-run
```

**Java/Spring Boot version:**
```bash
# Build + lint
mvn clean compile
mvn checkstyle:check

# Tests
mvn test

# Security
mvn dependency-check:check
```

**PHP/Laravel version:**
```bash
# Linting
./vendor/bin/phpcs
./vendor/bin/phpstan analyse

# Tests
php artisan test

# Security
composer audit
```

**Go version:**
```bash
# Format + lint
go fmt ./...
golangci-lint run

# Tests
go test ./... -cover

# Build
go build
```

---

## 📝 **Universal DEDUP.md (No Changes Needed)**

**Already works for ANY language!**

```bash
# Find duplicates by feature name
FILES=$(grep -ril "$FEATURE" src/ --include="*.py")  # Python
FILES=$(grep -ril "$FEATURE" src/ --include="*.java") # Java
FILES=$(grep -ril "$FEATURE" app/ --include="*.php")  # PHP
FILES=$(grep -ril "$FEATURE" src/ --include="*.go")   # Go

# Scoring algorithm works the same
USAGE=$(grep -r "import.*$FILE_NAME" . | wc -l)
CODE_LINES=$(grep -cE "^[[:space:]]*(def|class|function)" "$file")
MOCKS=$(grep -c "mock\|stub\|TODO" "$file")
```

**Just change file extensions and import patterns!**

---

## 🎯 **Universal BEGIN_SESSION.md**

**Keep structure, adapt commands:**

### **ProfitPilot (TypeScript):**
```bash
pnpm run type-check 2>&1 | tee type-errors.log
node scripts/validation/todo-tracker.cjs > todos.txt
pnpm exec madge --circular packages/shared/src
```

### **Python/Django:**
```bash
mypy . 2>&1 | tee type-errors.log
grep -r "TODO\|FIXME\|XXX" . --include="*.py" > todos.txt
python manage.py check
```

### **Java/Spring Boot:**
```bash
mvn compile 2>&1 | tee compile-errors.log
grep -r "TODO\|FIXME" src/ --include="*.java" > todos.txt
mvn dependency:analyze
```

### **PHP/Laravel:**
```bash
./vendor/bin/phpstan analyse 2>&1 | tee errors.log
grep -r "TODO\|FIXME" app/ --include="*.php" > todos.txt
composer validate
```

---

## 🏗️ **Project Structure Adaptation**

### **Map ProfitPilot Structure to Yours**

**ProfitPilot (TypeScript Monorepo):**
```
packages/shared/src/
├── contracts/     # Zod schemas
├── services/      # Business logic
├── utilities/     # Pure functions
└── adapters/      # External APIs
```

**Django (Python):**
```
your_project/
├── models.py         # Database models
├── serializers.py    # API validation
├── views.py          # Business logic
├── services/         # Complex business logic
└── utils.py          # Helper functions
```

**Spring Boot (Java):**
```
src/main/java/com/yourapp/
├── entity/           # JPA entities
├── repository/       # Data access
├── dto/              # Data transfer
├── service/          # Business logic
└── controller/       # REST endpoints
```

**Laravel (PHP):**
```
app/
├── Models/           # Eloquent models
├── Http/
│   ├── Controllers/  # Business logic
│   └── Requests/     # Validation
└── Services/         # Complex logic
```

---

## 📋 **Adaptation Checklist**

### **Step 1: Identify Your Project's Equivalent**

| ProfitPilot Concept | Your Equivalent |
|---------------------|-----------------|
| Contracts (Zod schemas) | → Models, DTOs, Entities, Serializers |
| Services (business logic) | → Services, Views, Controllers |
| Adapters (external APIs) | → API clients, Integrations |
| Utilities (pure functions) | → Utils, Helpers |
| Type-check | → Your linter (mypy, checkstyle, phpstan) |

---

### **Step 2: Update Commands in This Order**

1. ✅ **BEGIN_SESSION.md** - Replace diagnostic commands
2. ✅ **FINAL_CHECK.md** - Replace lint/test commands
3. ✅ **CREATE_TESTS.md** - Replace test framework
4. ✅ **implement-feature.md** - Rewrite protocol for your stack
5. ✅ **CHECK_DEPS.md** - Replace dependency checks

---

### **Step 3: Keep Everything Else As-Is**

**These need NO changes:**
- ✅ DEDUP.md (just change file extensions in grep)
- ✅ RESOLVE_ISSUES.md (logs are universal)
- ✅ CONTINUE.md (resume logic is universal)
- ✅ features.md (smart routing works anywhere)
- ✅ fix-all.md (error fixing is universal)
- ✅ todo-execution.md (TODOs everywhere)
- ✅ CORE_RULES.mdc (principles are universal)

---

## 🎯 **Example: Non-TypeScript Project**

### **Scenario: Django REST API Project**

**What you keep (no changes):**
```
BEGIN_SESSION.md         (just change diagnostic commands)
features.md              (no changes)
DEDUP.md                 (change *.ts to *.py)
RESOLVE_ISSUES.md        (no changes)
CONTINUE.md              (no changes)
fix-all.md               (change error patterns)
todo-execution.md        (no changes)
CORE_RULES.mdc           (adapt examples to Python)
```

**What you replace:**
```
implement-feature.md  →  implement-feature-django.md
  Phase 1: Models (not Contracts)
  Phase 2: Serializers (not Interfaces)
  Phase 3: Views (not Services)
  Phase 4: Tests (pytest not vitest)
  Phase 5: URLs (not Routes)
```

**What you adapt:**
```
FINAL_CHECK.md        →  Change to: flake8, mypy, pytest
CREATE_TESTS.md       →  Change to: pytest framework
CHECK_DEPS.md         →  Change to: pip check, safety
```

---

## 🔑 **Key Adaptations by Language**

### **Python Projects**

```bash
# Replace in BEGIN_SESSION.md
mypy . 2>&1 | tee type-errors.log
flake8 . > lint-errors.log
pytest --collect-only > test-count.txt

# Replace in FINAL_CHECK.md
mypy .
flake8 .
black . --check
pytest --cov
```

### **Java Projects**

```bash
# Replace in BEGIN_SESSION.md
mvn compile 2>&1 | tee compile-errors.log
mvn checkstyle:check > lint-errors.log
mvn test -DskipTests=false

# Replace in FINAL_CHECK.md
mvn clean compile
mvn checkstyle:check
mvn test
mvn verify
```

### **PHP Projects**

```bash
# Replace in BEGIN_SESSION.md
./vendor/bin/phpstan analyse > errors.log
./vendor/bin/phpcs > lint-errors.log
php artisan test --list-tests > test-count.txt

# Replace in FINAL_CHECK.md
./vendor/bin/phpstan analyse
./vendor/bin/phpcs
php artisan test
composer audit
```

### **Go Projects**

```bash
# Replace in BEGIN_SESSION.md
go build 2>&1 | tee build-errors.log
golangci-lint run > lint-errors.log
go test ./... -list=. > test-count.txt

# Replace in FINAL_CHECK.md
go fmt ./...
golangci-lint run
go test ./... -cover
go build
```

---

## 📊 **Cross-Framework Compatibility Matrix**

| Feature | TypeScript | Python | Java | PHP | Go | Ruby |
|---------|-----------|--------|------|-----|-----|------|
| **BEGIN_SESSION** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **DEDUP** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **RESOLVE_ISSUES** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **CONTINUE** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **features.md** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **fix-all** | ✅ Adapt | ✅ Adapt | ✅ Adapt | ✅ Adapt | ✅ Adapt | ✅ Adapt |
| **FINAL_CHECK** | ✅ Adapt | ✅ Adapt | ✅ Adapt | ✅ Adapt | ✅ Adapt | ✅ Adapt |
| **implement-feature** | ❌ Replace | ❌ Replace | ❌ Replace | ❌ Replace | ❌ Replace | ❌ Replace |

**Legend:**
- ✅ = Use as-is (no changes)
- ✅ Adapt = Keep structure, change commands
- ❌ Replace = Create new for your stack

---

## ✅ **Summary: Making It Portable**

### **Keep Universal (80% of system):**
- Entry point system (BEGIN_SESSION)
- Smart routing (features.md)
- Duplicate detection (DEDUP)
- Issue tracking (RESOLVE_ISSUES)
- Resume work (CONTINUE)
- Production standards enforcement

### **Adapt Commands (15% of system):**
- BEGIN_SESSION diagnostic commands
- FINAL_CHECK lint/test commands
- CREATE_TESTS test framework
- CHECK_DEPS dependency checks

### **Replace Protocol (5% of system):**
- implement-feature.md → Create YOUR stack's protocol
  - Models/Entities instead of Contracts
  - Controllers/Views instead of Services
  - Your test framework instead of Vitest

---

## 🚀 **Quick Start for Any Stack**

```bash
# 1. Copy ALL files
cp -r workflow-replication-package/* your-project/

# 2. Replace 3 commands with your stack equivalents
# - BEGIN_SESSION.md diagnostic section
# - FINAL_CHECK.md commands
# - implement-feature.md entire protocol

# 3. Update file extensions in DEDUP.md
# Change --include="*.ts" to your extension

# 4. Test
@BEGIN_SESSION.md

# ✅ Works for ANY language/framework!
```

---

**The workflow SYSTEM is universal. Only the TOOLS change!** 🌍

