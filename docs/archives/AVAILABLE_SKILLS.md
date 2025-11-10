# Available Skills in SkillKit

**Current Status:** 8 example skills included (4 workflow-ready!)

---

## 📦 Built-in Example Skills

---

## 🔥 Workflow-Ready Skills (For AI Agents)

These skills are designed to be called from workflows like `BEGIN_SESSION.md`, `FIX_BUGS.md`, etc.

### 1. **analyze-errors** ⭐ NEW - WORKFLOW CORE

**Purpose:** Parse error logs and create actionable fix plans

**Description:** The bridge between diagnostics and fixes. Analyzes any error output (lint, typecheck, test, build) and generates a prioritized, executable fix plan.

**Why this exists:** AI workflows need to **understand errors** and **create plans**. This skill does both.

**Usage:**
```bash
# Get errors from diagnostics
tsk diagnose > errors.txt

# Analyze and create fix plan
tsk run analyze-errors --input '{
  "errors": "$(cat errors.txt)",
  "context": {
    "projectType": "typescript",
    "workingDir": "."
  },
  "priority": "high"
}'
```

**Output:**
```json
{
  "summary": {
    "totalErrors": 45,
    "errorsByType": {
      "lint": 20,
      "typecheck": 15,
      "test": 10
    },
    "severity": "high"
  },
  "fixes": [
    {
      "id": "fix-1",
      "type": "typecheck",
      "file": "src/cli.ts",
      "line": 42,
      "message": "Type 'string' is not assignable to type 'number'",
      "fix": "Fix type mismatch or add type assertion",
      "priority": 90
    }
  ],
  "plan": {
    "steps": [
      {
        "step": 1,
        "action": "fix-type-errors",
        "command": "tsc --noEmit",
        "description": "Fix 15 type error(s)"
      },
      {
        "step": 2,
        "action": "fix-lint-errors",
        "command": "eslint . --fix",
        "description": "Fix 20 lint error(s) - some may auto-fix"
      }
    ],
    "estimatedTime": "~90 minutes",
    "fixPlanFile": "fix-plan.json"
  }
}
```

**What it does:**
- ✅ Parses multiple error formats (TypeScript, ESLint, Python, Java, Jest)
- ✅ Categorizes errors by type (lint, typecheck, test, build, runtime)
- ✅ Calculates severity (critical, high, medium, low)
- ✅ Generates actionable fixes with priority
- ✅ Creates step-by-step execution plan
- ✅ Saves plan to `fix-plan.json` for execution
- ✅ Estimates time to fix

**Used in workflows:**
- `FIX_BUGS.md` - Main workflow
- `BEGIN_SESSION.md` - Initial diagnostics
- `DEPLOY_PREP.md` - Pre-deployment checks

**Tags:** `debugging`, `analysis`, `workflow`, `fix-planning`

---

### 2. **execute-fix-plan** ⭐ NEW - WORKFLOW CORE

**Purpose:** Execute the fix plan created by analyze-errors

**Description:** Takes the fix plan and runs each step, tracking results and remaining errors.

**Why this exists:** AI workflows need **automated execution** of fix plans. This skill completes the cycle.

**Usage:**
```bash
# After analyze-errors creates fix-plan.json:
tsk run execute-fix-plan --input '{
  "planFile": "./fix-plan.json",
  "dryRun": false,
  "autoFix": true,
  "stopOnError": false
}'
```

**Output:**
```json
{
  "executed": true,
  "results": [
    {
      "step": 1,
      "action": "fix-type-errors",
      "command": "tsc --noEmit",
      "status": "success",
      "output": "No errors found",
      "duration": 2341
    },
    {
      "step": 2,
      "action": "fix-lint-errors",
      "command": "eslint . --fix",
      "status": "success",
      "output": "✔ 20 problems fixed automatically",
      "duration": 1823
    }
  ],
  "summary": {
    "totalSteps": 4,
    "successful": 3,
    "failed": 0,
    "skipped": 1,
    "remainingErrors": 5
  },
  "logFile": "fix-execution-log.json"
}
```

**What it does:**
- ✅ Loads fix plan from `fix-plan.json`
- ✅ Executes each step in sequence
- ✅ Automatically adds `--fix` flags where possible
- ✅ Captures command output and errors
- ✅ Can do dry-run (show what would execute)
- ✅ Can stop on first error or continue
- ✅ Runs final diagnostic to count remaining errors
- ✅ Saves execution log

**Used in workflows:**
- `FIX_BUGS.md` - Automated fix execution
- `IMPLEMENT_FEATURE.md` - Post-implementation cleanup

**Tags:** `automation`, `workflow`, `fix-execution`, `debugging`

---

### 3. **code-analyzer** ⭐ NEW

**Purpose:** Analyze code complexity, patterns, and quality metrics

**Description:** Calculates cyclomatic complexity, detects code smells, counts lines/comments, and provides recommendations

**Usage:**
```bash
tsk run code-analyzer --input '{
  "path": "src/",
  "extensions": [".ts", ".js"],
  "excludePatterns": ["node_modules", "dist"],
  "includeTests": false
}'
```

**Output:**
```json
{
  "summary": {
    "totalFiles": 25,
    "totalLines": 3450,
    "avgComplexity": 8.5,
    "issuesFound": 12
  },
  "files": [
    {
      "path": "src/cli.ts",
      "lines": 200,
      "complexity": 15,
      "functions": 8,
      "issues": [
        {
          "type": "complexity",
          "severity": "medium",
          "message": "Moderate complexity (15). May need simplification."
        }
      ]
    }
  ],
  "recommendations": [
    "GOOD: Complexity is within acceptable range",
    "Add comments/documentation to 3 files"
  ]
}
```

**What it detects:**
- Cyclomatic complexity per file
- Large files (>500 lines)
- Missing comments
- console.log statements
- TODO/FIXME comments
- Code structure issues

**Tags:** `analysis`, `code-quality`, `complexity`, `metrics`

---

### 2. **test-generator** ⭐ NEW

**Purpose:** Generate test files automatically

**Description:** Analyzes source files and generates comprehensive test suites with Jest/Vitest/Mocha

**Usage:**
```bash
tsk run test-generator --input '{
  "sourceFile": "src/utils/helper.ts",
  "testFramework": "vitest",
  "coverage": 80,
  "includeEdgeCases": true,
  "includeErrorCases": true
}'
```

**Output:**
```json
{
  "testFile": "src/utils/helper.test.ts",
  "testsGenerated": 12,
  "functions": [
    {
      "name": "calculateTotal",
      "testCount": 4,
      "scenarios": ["valid inputs", "edge cases", "error handling", "null/empty inputs"]
    }
  ],
  "framework": "vitest",
  "estimatedCoverage": 85
}
```

**Generated test structure:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotal } from './helper';

describe('calculateTotal', () => {
  it('should work with valid inputs', () => {
    const result = calculateTotal([1, 2, 3]);
    expect(result).toBeDefined();
  });

  it('should handle edge cases', () => {
    const result = calculateTotal([]);
    expect(result).toBeDefined();
  });

  it('should handle errors appropriately', () => {
    expect(() => calculateTotal(null)).toThrow();
  });

  it('should handle empty or null inputs', () => {
    expect(() => calculateTotal(null)).toBeDefined();
  });
});
```

**Tags:** `testing`, `generation`, `tdd`, `automation`

---

### 3. **hello-world**

**Purpose:** Simple greeting skill (learning example)

**Description:** Returns a friendly greeting message

**Usage:**
```bash
tsk run hello-world --input '{"message": "Hello from SkillKit"}'
```

**Output:**
```json
{
  "greeting": "Hello from SkillKit!",
  "timestamp": "2025-11-06T..."
}
```

**Tags:** `example`, `greeting`

---

### 2. **command-runner**

**Purpose:** Execute shell commands safely

**Description:** Runs whitelisted shell commands and captures output

**Allowed Commands:**
- `node`
- `git`
- `npm`
- `echo` (with arguments)

**Usage:**
```bash
tsk run command-runner --input '{
  "command": "git",
  "args": ["log", "--oneline", "-5"]
}'
```

**Output:**
```json
{
  "exitCode": 0,
  "stdout": "abc123 Latest commit\ndef456 Previous commit...",
  "stderr": "",
  "success": true
}
```

**Tags:** `commands`, `execution`, `automation`

**Security:** Only runs whitelisted commands

---

### 3. **data-transformer**

**Purpose:** Transform and manipulate JSON data

**Description:** Filter, map, and aggregate JSON data with rules

**Usage:**
```bash
tsk run data-transformer --input '{
  "data": [
    {"name": "Alice", "age": 30, "role": "dev"},
    {"name": "Bob", "age": 25, "role": "dev"},
    {"name": "Charlie", "age": 35, "role": "manager"}
  ],
  "rules": {
    "filter": {"role": "dev"},
    "map": ["name", "age"],
    "aggregate": {"avgAge": "age"}
  }
}'
```

**Output:**
```json
{
  "filtered": [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25}
  ],
  "aggregations": {
    "avgAge": 27.5,
    "count": 2
  }
}
```

**Tags:** `data`, `json`, `transformation`, `etl`

**Use Cases:**
- Process API responses
- Transform configuration data
- Filter and aggregate logs
- ETL operations

---

### 4. **file-processor**

**Purpose:** Analyze text files

**Description:** Reads files, counts lines/words, generates reports

**Usage:**
```bash
tsk run file-processor --input '{
  "files": ["src/index.ts", "src/cli.ts"],
  "outputFile": "./file-report.json"
}'
```

**Output:**
```json
{
  "files": [
    {
      "path": "src/index.ts",
      "lines": 150,
      "words": 450,
      "size": "4.2KB"
    },
    {
      "path": "src/cli.ts",
      "lines": 200,
      "words": 600,
      "size": "5.8KB"
    }
  ],
  "totals": {
    "totalLines": 350,
    "totalWords": 1050,
    "totalSize": "10KB"
  }
}
```

**Tags:** `files`, `text-processing`, `reporting`

**Use Cases:**
- Code statistics
- Documentation analysis
- File auditing
- Report generation

---

## 🎯 Most Commonly Used Skills (Generic Examples)

These are the types of skills developers actually need and use:

### Development Skills:
- **lint-runner** - Run linters (eslint, flake8, etc.)
- **test-runner** - Execute test suites
- **code-formatter** - Format code (prettier, black, etc.)
- **dependency-checker** - Check for outdated dependencies
- **security-scanner** - Scan for vulnerabilities

### Code Analysis:
- **complexity-analyzer** - Calculate cyclomatic complexity
- **duplicate-detector** - Find duplicate code
- **dead-code-finder** - Identify unused code
- **import-analyzer** - Analyze import/dependency structure

### Documentation:
- **doc-generator** - Generate API docs
- **changelog-creator** - Create changelog from commits
- **readme-updater** - Update README sections
- **comment-extractor** - Extract code comments

### File Operations:
- **file-search** - Search files by pattern
- **file-renamer** - Bulk rename files
- **template-generator** - Generate from templates
- **config-validator** - Validate config files

### Git Operations:
- **commit-analyzer** - Analyze commit history
- **branch-cleaner** - Clean up merged branches
- **pr-creator** - Create pull requests
- **diff-summarizer** - Summarize git diffs

### API/Network:
- **api-tester** - Test API endpoints
- **webhook-sender** - Send webhooks
- **url-validator** - Validate URLs
- **json-fetcher** - Fetch and parse JSON

---

## 📊 Skill Usage in Documentation

**When writing examples, use our REAL skills:**

### ✅ Good Examples (Using Real Skills):

```markdown
## Example 1: Run Commands
tsk run command-runner --input '{"command": "git", "args": ["status"]}'

## Example 2: Transform Data
tsk run data-transformer --input '{"data": [...], "rules": {...}}'

## Example 3: Analyze Files
tsk run file-processor --input '{"files": ["src/**/*.ts"]}'
```

### ❌ Bad Examples (Fake Skills):

```markdown
## Example 1: Extract PDF (DOESN'T EXIST)
tsk run pdf-extract --input document.pdf

## Example 2: Analyze Code (DOESN'T EXIST)
tsk run code-analyzer --path src/

## Example 3: Generate Tests (DOESN'T EXIST)
tsk run test-generator --coverage 90%
```

---

## 🔌 Installing Skills from GitHub

**SkillKit can install skills from ANY GitHub repo:**

```bash
# Install from Anthropic's skills repo (example)
tsk install anthropics/skills
# → Shows TUI with available skills
# → Select which ones to install
# → Installs to .claude/skills/

# Install from custom repo
tsk install your-org/your-skills-repo
```

**What gets installed:**
- Skill directories with `SKILL.yaml` or `SKILL.md`
- Executable `index.js` files
- Input/output schemas
- Dependencies (if specified)

**After installation:**
```bash
# List installed skills
tsk list

# Run installed skill
tsk run <skill-name> --input '...'
```

---

## 🎯 Skill vs Framework Adapter

**Important Distinction:**

### Framework Adapters (Built-in, Always Available):
```bash
tsk diagnose        # Uses adapters
tsk discover        # Uses adapters
tsk exec lint       # Uses adapters
tsk exec test       # Uses adapters
```
- **No installation needed**
- Auto-detect project type
- Run standard project commands
- TypeScript, Python, Java, Go, PHP support

### Skills (Optional, Installable):
```bash
tsk run command-runner    # Requires skill
tsk run data-transformer  # Requires skill
tsk run file-processor    # Requires skill
```
- **Must be installed** (built-in examples or from GitHub)
- Specialized functionality
- Custom operations
- Extend SkillKit capabilities

---

## 📋 Summary

**We Currently Have:**
- ✅ 4 example skills (hello-world, command-runner, data-transformer, file-processor)
- ✅ Framework adapters (lint, test, build, typecheck)
- ✅ Skill installation system (from GitHub)

**We Don't Have (Yet):**
- ❌ PDF extraction
- ❌ Code analyzer
- ❌ Test generator
- ❌ Many other specialized skills

**How to Get More Skills:**
1. Install from GitHub repos (e.g., `anthropics/skills`)
2. Create your own with `tsk gen-skill`
3. Share and contribute back

**Documentation Rule:**
- Only use examples from our 4 real skills
- Or clearly state "if installed from GitHub"
- Never use fake skills as if they exist

