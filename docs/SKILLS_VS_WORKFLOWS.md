# Skills vs Workflows in SkillKit

**TL;DR:**
- **Skills** = Executable code (Layer 2: Execution Engine)
- **Workflows** = AI agent instructions (Layer 3: Orchestration)

---

## 🔧 Skills (Layer 2)

### What Are Skills?

Skills are **self-contained executable units** with actual code that runs in a sandbox.

### Structure

```
pdf-extract-skill/
├── SKILL.yaml          # Metadata
├── index.js            # ACTUAL CODE THAT RUNS
├── input.schema.json   # Input validation
└── output.schema.json  # Output validation
```

### Example: File Processor Skill (Real, Included)

**SKILL.yaml:**
```yaml
name: file-processor
version: 1.0.0
description: Reads files, counts lines and words, and generates summary
tags:
  - files
  - text-processing
  - reporting
```

**index.js:**
```javascript
// THIS CODE ACTUALLY EXECUTES
const fs = require('fs-extra');

module.exports = async (input, context) => {
  const files = input.files;
  const stats = [];
  
  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).length;
    
    stats.push({ path: file, lines, words });
  }
  
  return {
    files: stats,
    totals: {
      totalLines: stats.reduce((sum, f) => sum + f.lines, 0),
      totalWords: stats.reduce((sum, f) => sum + f.words, 0)
    }
  };
};
```

**Usage:**
```bash
tsk run file-processor --input '{"files": ["src/index.ts", "src/cli.ts"]}'
# → Executes the index.js code
# → Returns file statistics
```

### Key Characteristics

- ✅ **Executable code** - Has `index.js` that runs
- ✅ **Sandboxed** - Runs with security constraints
- ✅ **I/O validated** - JSON Schema validation on input/output
- ✅ **Installable** - Can install from GitHub with `tsk install`
- ✅ **Reusable** - Single purpose, can be chained
- ✅ **Audited** - Every execution logged

### When to Use Skills

- Need to **execute code** (transform data, API calls, file operations)
- Need **input/output validation**
- Want **reusable automation units**
- Building **tools for AI agents** to use

---

## 📋 Workflows (Layer 3)

### What Are Workflows?

Workflows are **markdown documents** that guide AI agents through multi-step processes.

### Structure

```
BEGIN_SESSION.md        # Just markdown, NO CODE
```

### Example: Begin Session Workflow

**BEGIN_SESSION.md:**
```markdown
# Begin Session

**Purpose:** Start development with diagnostics

---

## Step 1: Load Context

bash
git log --oneline --since="8 hours ago" | head -5


**What this does:** Shows recent commits

---

## Step 2: Run Diagnostics

bash
tsk diagnose


**What this does:** Checks project health

---

## Step 3: Show Menu

1. 🚀 Implement new feature
2. 🐛 Fix bugs/errors
...

**Choose option → Route to workflow**

---

## Step 4: Route

- **1** → `@IMPLEMENT_FEATURE.md`
- **2** → `@FIX_BUGS.md`
```

**Usage:**
```bash
# In Cursor IDE:
# 1. Type "/" in chat
# 2. Select "BEGIN_SESSION"
# 3. Agent reads the markdown and follows steps

# The AI agent:
# - Runs the commands listed
# - Presents the menu
# - Routes based on user choice
```

### Key Characteristics

- ✅ **Markdown instructions** - No executable code
- ✅ **AI-readable** - Designed for Claude, GPT, etc.
- ✅ **Multi-step protocols** - Sequences of actions
- ✅ **Decision logic** - IF/THEN routing
- ✅ **Human-readable** - Developers can understand too
- ✅ **IDE integration** - Work as Cursor slash commands

### When to Use Workflows

- Need to **guide AI agents** through complex processes
- Want **multi-step protocols** (diagnostics → menu → routing)
- Building **development procedures** (implement feature, fix bugs)
- Need **decision trees** (route based on error count)

---

## 🔑 The Fundamental Difference

| Aspect | Skills | Workflows |
|--------|--------|-----------|
| **What is it?** | Executable code | Markdown document |
| **Who executes?** | SkillKit runtime | AI agent (Claude/GPT) |
| **Has code?** | Yes (`index.js`) | No (just markdown) |
| **Runs in sandbox?** | Yes | N/A |
| **Output** | JSON/data | Agent actions |
| **Example** | PDF extractor | "Run lint → show menu → route" |
| **Install from GitHub?** | Yes (`tsk install`) | No (generated locally) |
| **Validation** | JSON Schema | None |
| **Layer** | 2 (Execution) | 3 (Orchestration) |

---

## 💡 How They Work Together

### Workflows Can Call Skills

**In IMPLEMENT_FEATURE.md:**
```markdown
## Phase 2: Validate Code

bash
tsk run eslint-validator --path src/
tsk run type-checker --strict
```

The workflow (markdown) instructs the AI to execute skills via `tsk run`.

### Skills Can't Call Workflows

Skills are just code units. They don't orchestrate multi-step processes.

---

## 🎯 Real-World Examples

### Example 1: Data Processing

**As a Skill:**
```javascript
// data-transformer/index.js (included in SkillKit)
module.exports = async (input) => {
  const filtered = input.data.filter(item => 
    Object.entries(input.rules.filter).every(([key, val]) => 
      item[key] === val
    )
  );
  return { filtered, count: filtered.length };
};
```

```bash
tsk run data-transformer --input '{
  "data": [{"role": "dev"}, {"role": "manager"}],
  "rules": {"filter": {"role": "dev"}}
}'
# → Returns: { filtered: [{"role": "dev"}], count: 1 }
```

**As a Workflow:**
```markdown
# Process API Data Workflow

## Step 1: Fetch data
tsk run command-runner --input '{"command": "curl", "args": ["api.example.com"]}'

## Step 2: Transform data
tsk run data-transformer --input response.json

## Step 3: Generate report
tsk run file-processor --input transformed.json
```

```
# In Cursor: @PROCESS_DATA.md
# Agent reads and executes each step
```

### Example 2: File Analysis

**As a Skill:**
```javascript
// file-processor/index.js (included in SkillKit)
module.exports = async (input) => {
  const stats = [];
  for (const file of input.files) {
    const content = await fs.readFile(file, 'utf8');
    stats.push({
      path: file,
      lines: content.split('\n').length,
      words: content.split(/\s+/).length
    });
  }
  return { files: stats };
};
```

```bash
tsk run file-processor --input '{"files": ["src/index.ts", "src/cli.ts"]}'
# → Returns: { files: [{path: "...", lines: 150, words: 450}, ...] }
```

**As a Workflow:**
```markdown
# Quality Gate Workflow

## Phase 1: Run Checks
tsk exec lint
tsk exec typecheck
tsk exec test

## Phase 2: Evaluate
If errors > 0:
  → Route to @FIX_BUGS.md
Else:
  → Continue to deployment
```

```
# In Cursor: @QUALITY_GATE.md
# Agent reads, runs checks, makes routing decision
```

---

## 📊 Quick Decision Guide

### Use a **Skill** when you need to:
- ✅ Execute actual code
- ✅ Transform data (parse PDF, call API)
- ✅ Create a reusable tool
- ✅ Validate input/output
- ✅ Run in a sandbox
- ✅ Install from GitHub repos

### Use a **Workflow** when you need to:
- ✅ Guide AI through multiple steps
- ✅ Create development protocols
- ✅ Add decision logic (IF errors > 10 THEN fix)
- ✅ Orchestrate multiple tools/commands
- ✅ Integrate with Cursor slash commands
- ✅ Document processes for AI agents

---

## 🏗️ SkillKit Architecture

```
┌─────────────────────────────────────────┐
│  Layer 1: Package Management            │
│  Install skills from GitHub              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 2: Execution Engine               │
│  RUN SKILLS (executable code)            │  ← Skills live here
│  Sandbox, validate, audit                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 3: Workflow Orchestration         │
│  AI READS WORKFLOWS (markdown)           │  ← Workflows live here
│  Multi-step protocols, routing           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Layer 4: Environment Intelligence       │
│  Adapt to project type, framework        │
└─────────────────────────────────────────┘
```

---

## 🚀 Complete Example

### Goal: Automated Feature Development

**Step 1: Install Skills (Layer 1)**
```bash
tsk install anthropics/skills
# → Installs code-analyzer, test-generator skills
```

**Step 2: Skills Execute (Layer 2)**
```bash
tsk run code-analyzer --path src/
# → Executes code-analyzer/index.js
# → Returns: { complexity: 8, coverage: 72% }
```

**Step 3: Workflow Orchestrates (Layer 3)**
```markdown
# IMPLEMENT_FEATURE.md

## Phase 1: Analyze
tsk run code-analyzer --path src/

## Phase 2: If complexity > 10
Route to @REFACTOR.md

## Phase 3: Generate Tests
tsk run test-generator --coverage 90%

## Phase 4: Validate
tsk exec quality-gate
```

**Step 4: Agent Executes in Cursor**
```
User: @IMPLEMENT_FEATURE.md
Agent: [Reads workflow]
Agent: [Runs code-analyzer skill]
Agent: [Makes routing decision]
Agent: [Runs test-generator skill]
Agent: [Executes quality-gate]
```

---

## Summary

| | Skills | Workflows |
|---|--------|-----------|
| **Simple analogy** | Tools in toolbox | Instruction manual |
| **Format** | Code (`index.js`) | Markdown (`.md`) |
| **Purpose** | Execute & return data | Guide agents through processes |
| **Layer** | 2 (Execution) | 3 (Orchestration) |
| **Example** | PDF extractor | "Run diagnostics → fix bugs → deploy" |

**Both are essential to SkillKit:**
- Skills provide the **capabilities** (what can be done)
- Workflows provide the **procedures** (how to do it)

