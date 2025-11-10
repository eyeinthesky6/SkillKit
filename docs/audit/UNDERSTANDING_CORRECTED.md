# UNDERSTANDING CORRECTED - Workflow System Architecture

**Date:** November 5, 2025  
**Status:** ✅ NOW I UNDERSTAND

---

## 🎯 WHAT I MISUNDERSTOOD

**I thought:** SkillKit should be a CLI tool for humans with great UX  
**Reality:** SkillKit should integrate with document-based workflow system for AI agents

---

## ✅ HOW IT ACTUALLY WORKS

### The Workflow System (What You Have Working):

```
User in Cursor IDE:
  └─> Types: @BEGIN_SESSION.md
  └─> AI agent RECEIVES the markdown document
  └─> AI agent READS the instructions
  └─> AI agent EXECUTES the steps using its tools:
      ├─> run_terminal_cmd: runs `pnpm run lint`
      ├─> read_file: reads diagnostic results  
      ├─> write_file: creates reports
      └─> Follows the protocol step-by-step
```

**Key Points:**
1. **Cursor's `@` system** attaches markdown docs to AI's context
2. **AI reads the markdown** and follows instructions like a human would
3. **AI has terminal access** via `run_terminal_cmd` tool
4. **No custom execution needed** - AI uses existing IDE capabilities
5. **Workflows are just structured instructions** - NOT code to execute

---

## 📚 The Components

### 1. **`.cursor/commands/*.md`** - Workflow Documents
**Purpose:** Step-by-step instructions for AI agents  
**How used:** User types `@BEGIN_SESSION.md` → Cursor sends content to AI  
**AI's job:** Read and follow the steps manually

**Example from BEGIN_SESSION.md:**
```markdown
Step 1: Load Context
```bash
cat "docs/AITracking/AIAction_${TODAY}_"* | tail -100
```

Step 2: Run Diagnostics
```bash
pnpm run lint 2>&1 | tee /tmp/lint-errors.log
LINT_ERRORS=$(grep -cE "error|✖" /tmp/lint-errors.log)
```

Step 3: Present Menu
# [AI reads results and presents menu to user]
```

**AI executes these bash commands** using `run_terminal_cmd` tool!

---

### 2. **`agents.yaml`** - Project Configuration
**Purpose:** Tells AI about THIS project's structure  
**Contains:**
- Project name
- Canonical docs paths
- Diagnostic commands
- Architecture patterns
- Validation rules

**How used:** AI reads this to understand project conventions

---

### 3. **`.cursor/rules/*.mdc`** - Behavior Rules
**Purpose:** General rules AI should follow (like coding standards)  
**How used:** Cursor loads these automatically for AI context

---

## 🔗 Where SkillKit Fits

### CURRENT STATE (Confused):
- SkillKit = Sandboxed JS execution runtime
- Workflows = Separate markdown docs
- **NOT INTEGRATED**

### SHOULD BE:
**Option A: SkillKit provides reusable automation for workflows**

```markdown
# BEGIN_SESSION.md

Step 2: Run Diagnostics
```bash
# Instead of this:
pnpm run lint 2>&1 | tee /tmp/lint-errors.log
pnpm run type-check 2>&1 | tee /tmp/type-errors.log
node scripts/validation/todo-tracker.cjs

# Could be this:
tsk run diagnose-project
# Returns structured JSON with all diagnostic info
```
```

**Benefits:**
- Cleaner workflows (one command vs many)
- Cross-platform (works in Python, Java, etc)
- Reusable automation
- Type-safe results

**Option B: SkillKit generates workflow docs from skills**

```bash
# Developer creates a skill:
tsk gen-skill diagnose-project

# SkillKit generates BEGIN_SESSION.md that uses it:
# Step 2: tsk run diagnose-project
```

---

## 🎯 WHAT NEEDS TO BE BUILT

Based on your clarification, here's what makes sense:

### 1. ✅ Keep Workflow System As-Is
- **Working:** User types `@BEGIN_SESSION.md`
- **Working:** AI reads and executes steps
- **Working:** Cross-platform (adaptable to any stack)
- **Keep it:** Don't fix what works!

### 2. ✅ Integrate SkillKit as Automation Layer

**Create SkillKit skills that workflows can call:**

```yaml
# skills/diagnose-project/SKILL.yaml
name: diagnose-project
description: Run all project diagnostics
inputs:
  type: object
  properties:
    projectRoot: string
outputs:
  type: object
  properties:
    lintErrors: number
    typeErrors: number
    todos: number
    build: string
```

**Workflows call them:**
```markdown
# BEGIN_SESSION.md Step 2:
```bash
tsk run diagnose-project --input '{"projectRoot":"."}'
```

Or with the adapter system (auto-detects stack):
```bash
tsk diagnose  # Figures out if pnpm/npm/pip/mvn/etc
```
```

### 3. ✅ Make CLI Agent-Friendly

**Not about human UX, about AI agent UX:**
- ✅ Structured JSON output (not pretty colors)
- ✅ Exit codes for success/failure
- ✅ Parseable error messages
- ✅ Idempotent operations

**Example:**
```bash
# Human-friendly (current):
$ tsk run diagnose
🔧 Running diagnostics...
✅ Lint: 0 errors
✅ Type: 0 errors

# Agent-friendly (add flag):
$ tsk run diagnose --json
{"lint":{"errors":0},"type":{"errors":0},"build":"pass"}
```

---

## 🚀 CORRECTED ROADMAP

### Phase 1: Make SkillKit Agent-Compatible (2 days)

**A. Add JSON Output Mode**
```bash
tsk run my-skill --json  # Machine-readable output
tsk run my-skill --quiet # No pretty formatting
```

**B. Create Diagnostic Skills**
```
skills/
├── diagnose-project/      # Lint + type + build + todos
├── check-duplicates/      # DEDUP functionality
├── quality-gate/          # Pre-commit checks
└── resolve-issues/        # Issue log checking
```

**C. Update Workflows to Use Skills**
```markdown
# BEGIN_SESSION.md (updated)
Step 2: Run Diagnostics
```bash
# Old way (10 commands):
pnpm run lint...
pnpm run type-check...
node scripts/...

# New way (1 command):
tsk diagnose --json > /tmp/diagnostics.json
```
```

---

### Phase 2: Framework Adapters (1 week)

**Auto-detect project type and run appropriate commands:**

```bash
# SkillKit detects TypeScript project:
$ tsk diagnose
→ Runs: pnpm run lint, pnpm run type-check, pnpm test

# SkillKit detects Python project:
$ tsk diagnose
→ Runs: flake8, mypy, pytest

# SkillKit detects Java project:
$ tsk diagnose
→ Runs: mvn checkstyle:check, mvn compile, mvn test
```

**This makes workflows truly portable!**

---

### Phase 3: Workflow Generator (1 week)

**Generate workflow docs from project:**

```bash
$ tsk init --cursor

# Creates:
.cursor/commands/BEGIN_SESSION.md (adapted to YOUR stack)
.cursor/commands/implement-feature.md (YOUR framework)
.cursor/commands/DEDUP.md (YOUR file extensions)
agents.yaml (YOUR project info)
```

---

## 🎯 KEY REALIZATIONS

### 1. **Workflows are INSTRUCTIONS, not CODE**
- AI reads markdown
- AI executes steps manually
- Like a human following a recipe

### 2. **SkillKit provides TOOLS workflows can use**
- Reusable automation
- Cross-platform adapters
- Structured outputs

### 3. **Integration is OPTIONAL but VALUABLE**
- Workflows work without SkillKit
- SkillKit makes workflows cleaner/more powerful
- Not required, but enhances

---

## ❌ WHAT NOT TO BUILD

### Don't Build:
- ❌ Special workflow execution engine
- ❌ Custom markdown parser for workflows
- ❌ Workflow orchestrator
- ❌ Hot reload for workflows

### Why Not:
- **Cursor handles markdown** already
- **AI follows instructions** naturally
- **Don't reinvent** what works

---

## ✅ WHAT TO BUILD

### DO Build:
- ✅ Reusable diagnostic skills
- ✅ Framework adapters (TypeScript/Python/Java/etc)
- ✅ JSON output mode for AI agents
- ✅ Workflow doc generator (`tsk init --cursor`)
- ✅ Integration examples in workflow docs

### Why:
- **Adds value** to existing workflow system
- **Makes workflows portable** across stacks
- **Simplifies** workflow documents
- **Enhances** without replacing

---

## 🎭 THE CORRECT MENTAL MODEL

### Before (My Confusion):
```
SkillKit CLI (human types commands)
    ↓
[Separate from workflows]
    ↓
Workflows (AI reads markdown)
```

### After (Correct Understanding):
```
User types: @BEGIN_SESSION.md
    ↓
Cursor sends markdown to AI
    ↓
AI reads instructions
    ↓
AI executes: `tsk diagnose` (SkillKit as tool)
    ↓
AI gets structured results
    ↓
AI continues workflow
```

**SkillKit is a TOOL the workflow uses, not a replacement!**

---

## 📊 VALUE PROPOSITION

### Without SkillKit:
```markdown
# BEGIN_SESSION.md
```bash
pnpm run lint 2>&1 | tee /tmp/lint.log
pnpm run type-check 2>&1 | tee /tmp/type.log
node scripts/todo-tracker.cjs > /tmp/todos.txt
grep -cE "error" /tmp/lint.log
grep -c "error TS" /tmp/type.log
# ... 20 more commands ...
```
```
**Issues:**
- TypeScript-specific
- Many manual commands
- Text parsing required
- Not portable

### With SkillKit:
```markdown
# BEGIN_SESSION.md
```bash
tsk diagnose --json
```
```
**Benefits:**
- One command
- Auto-detects stack
- Structured JSON
- Works in Python/Java/Go/PHP/etc
- Reusable

---

## 🚨 CORRECTED UNDERSTANDING

**What I should have asked from the start:**

> "How do the workflow docs actually get used by AI agents in Cursor? What's the execution model?"

**Your answer (that I now understand):**

> "User invokes workflow with `@`, Cursor sends markdown to AI, AI reads and follows steps using its tools (terminal, file access, etc). SkillKit could be one of those tools."

**This changes EVERYTHING about what we should build!**

---

**Status:** ✅ UNDERSTANDING CORRECTED  
**Next:** Build the RIGHT thing (agent-compatible skills + adapters)  
**Focus:** Enhance workflows, don't replace them

