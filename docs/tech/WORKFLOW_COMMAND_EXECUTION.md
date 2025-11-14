# Workflow Command Execution System

## Overview

SkillKit workflows work in **any codebase** by:
1. **Discovering** project-specific commands from `package.json`, `pyproject.toml`, etc.
2. **Adapting** workflow templates to use those commands
3. **Executing** commands either directly (embedded) or via `tsk exec` (runtime resolution)

---

## Two Execution Modes

### Mode 1: Embedded Commands (Workflow Generation)

**When:** During `tsk workflow` generation

**How it works:**
1. `WorkflowAdapter` analyzes the project
2. Discovers commands from `package.json`, `pyproject.toml`, etc.
3. Replaces generic `tsk exec lint` with actual commands like:
   - `pnpm run lint` (TypeScript project)
   - `poetry run ruff check .` (Python project)
   - `npm run lint` (JavaScript project)

**Example:**

**Template (`templates/workflows/FIX_BUGS.md`):**
```bash
tsk exec lint      # Generic command
tsk exec typecheck # Generic command
```

**Generated (`.cursor/commands/FIX_BUGS.md` for TypeScript project):**
```bash
pnpm run lint      # Project-specific command
pnpm run typecheck # Project-specific command
```

**Generated (`.cursor/commands/FIX_BUGS.md` for Python project):**
```bash
poetry run ruff check .  # Project-specific command
poetry run mypy .        # Project-specific command
```

**Benefits:**
- ✅ Commands are visible in workflow files
- ✅ No runtime dependency on `tsk exec`
- ✅ Works even if SkillKit is not installed in target project

---

### Mode 2: Runtime Resolution (`tsk exec`)

**When:** Workflow uses `tsk exec <intent>` and it's not replaced during generation

**How it works:**
1. `CommandMapper` discovers commands from project files
2. Maps generic intents (`lint`, `test`, `build`) to actual commands
3. Executes the discovered command

**Example:**

**Workflow step:**
```bash
tsk exec lint
```

**CommandMapper discovers:**
- Reads `package.json` → finds `"lint": "eslint ."`
- Detects package manager → `pnpm` (from `pnpm-lock.yaml`)
- Maps intent → `pnpm run lint`
- Executes → `pnpm run lint`

**Supported sources:**
- **TypeScript/JavaScript:** `package.json` scripts
- **Python:** `pyproject.toml`, `Makefile`, `requirements.txt`
- **Java:** `pom.xml`, `build.gradle`
- **Go:** `go.mod`, `Makefile`

**Benefits:**
- ✅ Works across different project structures
- ✅ Automatically adapts to package manager (npm/yarn/pnpm)
- ✅ Supports multiple languages in one project

---

## Command Discovery Priority

### For TypeScript/JavaScript Projects

1. **Project scripts** (highest priority)
   ```json
   {
     "scripts": {
       "lint": "eslint .",
       "test": "vitest"
     }
   }
   ```
   → Uses: `pnpm run lint`, `pnpm run test`

2. **Detected tools** (fallback)
   - If `eslint` in dependencies → `npx eslint .`
   - If `vitest` in dependencies → `npx vitest run`

3. **Generic fallback**
   → `# Run lint: pnpm run lint (or check package.json)`

### For Python Projects

1. **Poetry scripts** (highest priority)
   ```toml
   [tool.poetry.scripts]
   lint = "ruff check ."
   test = "pytest"
   ```
   → Uses: `poetry run lint`, `poetry run test`

2. **Detected tools** (fallback)
   - If `ruff` detected → `poetry run ruff check .`
   - If `pytest` detected → `poetry run pytest`

3. **Generic fallback**
   → `# Run lint: poetry run lint (or check pyproject.toml)`

---

## Workflow Generation Process

### Step 1: Project Analysis

```typescript
// MultiLanguageAnalyzer detects:
- Languages: TypeScript, Python
- Package managers: pnpm, poetry
- Tools: eslint, ruff, vitest, pytest
- Scripts: { lint: "eslint .", test: "vitest" }
```

### Step 2: Command Mapping

```typescript
// WorkflowAdapter generates:
{
  lint: "pnpm run lint",           // From package.json script
  test: "pnpm run test",           // From package.json script
  format: "pnpm run format",       // From package.json script
  typecheck: "pnpm run typecheck", // From package.json script
  build: "pnpm run build"          // From package.json script
}
```

### Step 3: Template Replacement

```typescript
// Replaces in template:
"tsk exec lint" → "pnpm run lint"
"tsk exec test" → "pnpm run test"
"npm run lint" → "pnpm run lint"  // Also replaces generic npm
```

### Step 4: Generated Workflow

The generated workflow in `.cursor/commands/` contains:
- ✅ Project-specific commands
- ✅ Correct package manager
- ✅ Language-specific tools
- ✅ Multi-language sections (if monorepo)

---

## Example: Mixed Codebase (TypeScript + Python)

### Project Structure
```
project/
├── package.json          # TypeScript frontend
├── pyproject.toml         # Python backend
└── .cursor/commands/
    └── IMPLEMENT_FEATURE.md  # Generated workflow
```

### Generated Workflow

```markdown
## TypeScript Section

```bash
# Install dependencies
pnpm install

# Lint
pnpm run lint

# Test
pnpm run test

# Build
pnpm run build
```

## Python Section

```bash
# Install dependencies
poetry install

# Lint
poetry run ruff check .

# Test
poetry run pytest

# Type check
poetry run mypy .
```
```

**How it works:**
1. `MultiLanguageAnalyzer` detects both languages
2. `WorkflowAdapter` generates separate sections
3. Each section uses the correct package manager and tools
4. Commands are project-specific, not generic

---

## Runtime Execution (`tsk exec`)

### When Workflows Use `tsk exec`

Some workflows may still contain `tsk exec` commands (if not replaced during generation):

```bash
tsk exec quality-gate
```

### Execution Flow

```
User/Agent: tsk exec quality-gate
    ↓
CommandMapper.discover()
    ↓
Reads package.json, pyproject.toml, etc.
    ↓
Maps intents to commands:
  - lint → pnpm run lint
  - test → pnpm run test
  - typecheck → pnpm run typecheck
    ↓
WorkflowRouter.resolve("quality-gate")
    ↓
Executes: [format, lint, typecheck, test]
    ↓
For each step: CommandMapper.execute(intent)
    ↓
Runs actual commands: pnpm run lint, pnpm run test, etc.
```

---

## Command Discovery Details

### TypeScript/JavaScript

**Sources checked:**
1. `package.json` → `scripts` field
2. Lock files → Detects package manager (npm/yarn/pnpm)
3. `node_modules/` → Detects installed tools

**Intent inference:**
- Script name `"lint"` → intent `lint`
- Script name `"test"` → intent `test`
- Script name `"build"` → intent `build`
- Command contains `"eslint"` → intent `lint`
- Command contains `"vitest"` → intent `test`

### Python

**Sources checked:**
1. `pyproject.toml` → `[tool.poetry.scripts]`
2. `pyproject.toml` → `[tool.ruff]`, `[tool.mypy]`, `[tool.black]`
3. `Makefile` → Make targets
4. `requirements.txt` → Installed packages

**Intent inference:**
- Poetry script `lint` → `poetry run lint`
- Tool `ruff` detected → `poetry run ruff check .`
- Tool `pytest` detected → `poetry run pytest`

### Java

**Sources checked:**
1. `pom.xml` → Maven lifecycle phases
2. `build.gradle` → Gradle tasks

**Intent inference:**
- Maven → `mvn compile`, `mvn test`, `mvn package`
- Gradle → `./gradlew build`, `./gradlew test`

### Go

**Sources checked:**
1. `go.mod` → Go modules
2. `Makefile` → Make targets

**Intent inference:**
- Go commands → `go build`, `go test ./...`, `go fmt ./...`
- Make targets → `make lint`, `make test`

---

## Multi-Language Support

### Monorepo Detection

**Detected as monorepo if:**
- `pnpm-workspace.yaml` exists
- `turbo.json` exists
- Multiple `package.json` files in subdirectories
- Multiple `pyproject.toml` files in subdirectories

**Workflow generation:**
- Creates separate sections for each language
- Each section uses correct package manager
- Commands are language-specific

**Example (TypeScript + Python monorepo):**
```markdown
## TypeScript (apps/frontend)

```bash
cd apps/frontend
pnpm install
pnpm run lint
pnpm run test
cd -
```

## Python (apps/backend)

```bash
cd apps/backend
poetry install
poetry run ruff check .
poetry run pytest
cd -
```
```

---

## Summary

### ✅ Yes, `tsk` commands work in any codebase:

1. **Workflow Generation (`tsk workflow`):**
   - Discovers project commands from `package.json`, `pyproject.toml`, etc.
   - Replaces generic commands with project-specific ones
   - Generates workflows with actual commands embedded

2. **Runtime Execution (`tsk exec`):**
   - Discovers commands at runtime
   - Maps generic intents to project-specific commands
   - Executes the discovered commands

3. **Multi-Language Support:**
   - Detects multiple languages in one project
   - Generates separate sections for each language
   - Uses correct package manager and tools for each

4. **Command Priority:**
   - **Highest:** Project scripts (`package.json` scripts, Poetry scripts)
   - **Medium:** Detected tools (eslint, ruff, pytest, etc.)
   - **Lowest:** Generic fallbacks with instructions

### Result:

**Workflows are project-agnostic templates that become project-specific during generation!**

The same workflow template works for:
- TypeScript projects → Uses `pnpm run lint`
- Python projects → Uses `poetry run ruff check .`
- Mixed projects → Uses both, in separate sections
- Any codebase → Discovers and uses project-specific commands

