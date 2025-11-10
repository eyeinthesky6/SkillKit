# The Intelligence Layer - How It ALL Fits Together

## 🧠 The Complete System Architecture

```
User Intent ("check my code quality")
    ↓
┌─────────────────────────────────────────────────────────┐
│         INTELLIGENCE LAYER (NEW!)                        │
│                                                           │
│  1. Project Analyzer                                     │
│     - Reads tsconfig.json, package.json, ESLint config  │
│     - Detects: Zod, contracts-first, TDD, etc.          │
│     - Understands: Architecture patterns                 │
│                                                           │
│  2. Workflow Adapter                                     │
│     - Takes generic workflow                             │
│     - Adapts based on architecture                       │
│     - Decides WHAT to check and WHY                      │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│         EXECUTION LAYER                                  │
│                                                           │
│  3. Command Mapper                                       │
│     - Discovers HOW to run commands                      │
│     - Maps: lint → pnpm run lint                         │
│                                                           │
│  4. Workflow Executor                                    │
│     - Executes adapted workflow                          │
│     - Runs commands in sequence                          │
└─────────────────────────────────────────────────────────┘
    ↓
Results + Reasoning
```

---

## 📚 How SKILL.md, AGENTS.md, and agents.yaml Fit In

### 1. **SKILL.md** (Anthropic's Format)
**Purpose:** Define WHAT a skill does (declarative)

```markdown
---
name: validate-contracts
version: 1.0.0
description: Validate Zod schemas match implementation
tags: [contracts, validation]
---

# Contract Validation Skill

This skill checks that Zod schemas are:
1. Syntactically valid
2. Used in the codebase
3. Match the actual API implementation
```

**How SkillKit Uses It:**
- Loads metadata from frontmatter
- Reads instructions from markdown
- AI agent reads instructions to understand HOW to execute

**DX:** Drop SKILL.md file → SkillKit discovers it → Agent can execute

---

### 2. **AGENTS.md** (OpenAI/Cursor Format)
**Purpose:** Tell AI what commands/skills are available

```xml
<available_skills>
<skill>
<name>validate-contracts</name>
<description>Validate Zod schemas match implementation</description>
<command>tsk exec validate-contracts</command>
</skill>
</available_skills>
```

**How SkillKit Uses It:**
- **Auto-generated** by `tsk init --cursor`
- Creates `.cursor/commands/*.md` files
- AI reads these when user types "/"

**DX:** 
1. Run `tsk init --cursor`
2. Open Cursor → Type "/" 
3. See SkillKit commands!
4. Select → AI executes

---

### 3. **agents.yaml** (Your Project's Format)
**Purpose:** Project-specific agent configuration and rules

```yaml
project:
  name: SkillKit
  rules:
    - No mocks, no stubs
    - Contracts-first architecture
    - All changes logged in AITracking

agents:
  architect:
    responsibilities:
      - Design system architecture
      - Review contracts
    skills:
      - validate-contracts
      - check-architecture
  
  developer:
    responsibilities:
      - Implement features
      - Write tests
    skills:
      - quality-gate
      - deploy-prep
```

**How SkillKit Uses It:**
- **Read by Project Analyzer** to understand project rules
- Informs workflow adaptation
- Defines which skills each agent role should use

**DX:** SkillKit reads this → Understands project conventions → Adapts workflows

---

## 🎯 The Complete Flow (Example)

### User in Cursor: "Check my code quality"

```
Step 1: AI reads .cursor/commands/begin-session.md
  → Sees: Run `tsk diagnose`

Step 2: SkillKit receives: tsk diagnose
  → Calls: Project Analyzer

Step 3: Project Analyzer reads:
  ✓ tsconfig.json → strict: true (Type-first!)
  ✓ package.json → has Zod (Contracts-first!)
  ✓ eslint.config.js → 25 error rules (Strict!)
  ✓ agents.yaml → "No mocks" rule
  ✓ src/contracts/ → Has contracts directory
  
  Architecture Detected:
  {
    patterns: {
      contractsFirst: true,
      typeFirst: true,
      testDriven: true
    },
    tools: {
      validation: 'zod',
      linting: { strictness: 'strict' }
    }
  }

Step 4: Workflow Adapter adapts "quality-gate":
  Generic workflow:
    - format
    - lint
    - test
    - build
  
  Adapted workflow (BECAUSE of architecture):
    - format
    - lint (with strict rules)
    - validate-contracts (ADDED because contracts-first!)
    - typecheck (with strict mode)
    - test (prioritized because TDD)
    - build
  
  Reasoning:
    "Added contract validation because Zod detected.
     Strict mode enabled because ESLint config has 25 error rules.
     Test coverage required because agents.yaml specifies no mocks."

Step 5: Command Mapper discovers HOW:
  format → pnpm run format
  lint → pnpm run lint
  validate-contracts → tsk exec validate-contracts (custom skill!)
  typecheck → pnpm exec tsc --noEmit
  test → pnpm run test
  build → pnpm run build

Step 6: Workflow Executor runs adapted workflow

Step 7: Results returned with reasoning:
  ✅ Format: Clean
  ❌ Lint: 3 errors (strict mode)
  ✅ Contracts: All schemas valid
  ✅ TypeCheck: No errors
  ❌ Tests: 2 failing
  ✅ Build: Success
  
  Recommendation: Fix lint errors and failing tests before deploy.
  Reasoning: Project uses strict quality rules (agents.yaml).
```

---

## 🔥 The Magic: Architecture-Aware Workflows

### Example 1: TypeScript + Zod Project (SkillKit)

**Architecture:**
```typescript
{
  language: 'typescript',
  patterns: {
    contractsFirst: true,  // Has Zod
    typeFirst: true        // strict: true in tsconfig
  },
  tools: {
    validation: 'zod',
    testing: 'vitest'
  }
}
```

**Adapted quality-gate:**
```typescript
[
  'format',
  'lint',
  'validate-contracts',  // ADDED because Zod detected!
  'typecheck',
  'test',
  'build'
]
```

### Example 2: Python + Pydantic Project

**Architecture:**
```typescript
{
  language: 'python',
  patterns: {
    contractsFirst: true  // Has Pydantic
  },
  tools: {
    validation: 'pydantic',
    testing: 'pytest'
  }
}
```

**Adapted quality-gate:**
```typescript
[
  'format',           // black
  'lint',             // flake8
  'validate-schemas', // ADDED because Pydantic detected!
  'typecheck',        // mypy
  'test'              // pytest
]
```

### Example 3: Simple Node.js Project (No Contracts)

**Architecture:**
```typescript
{
  language: 'typescript',
  patterns: {
    contractsFirst: false,  // No Zod/validation
    typeFirst: false
  }
}
```

**Adapted quality-gate:**
```typescript
[
  'format',
  'lint',
  // NO contract validation (not needed!)
  'test'
]
```

**SAME WORKFLOW, DIFFERENT EXECUTION BASED ON ARCHITECTURE!** ✨

---

## 📋 The Three Documents Working Together

### SKILL.md (What to do)
```markdown
---
name: validate-contracts
---
Check that Zod schemas are valid and used.
```

### AGENTS.md (How to invoke)
```xml
<skill>
<name>validate-contracts</name>
<command>tsk exec validate-contracts</command>
</skill>
```

### agents.yaml (Project rules)
```yaml
rules:
  - Contracts-first architecture
  - All APIs must have Zod schemas
```

**Result:**
1. AI reads AGENTS.MD → Knows skill exists
2. User says "validate contracts"
3. AI executes: `tsk exec validate-contracts`
4. SkillKit reads: agents.yaml → Understands contracts-first rule
5. SkillKit reads: SKILL.md → Knows how to validate
6. Executes with context!

---

## 🎭 Developer Experience (DX)

### Initial Setup:
```bash
# 1. Install SkillKit
npm install -g @trinity-os/skillkit

# 2. Initialize in project
cd my-project
tsk init --cursor

# What happens:
# ✓ Analyzes project architecture
# ✓ Discovers commands (package.json, etc.)
# ✓ Creates .cursor/commands/*.md
# ✓ Reads agents.yaml if exists
# ✓ Suggests workflows based on architecture
```

### Daily Usage in Cursor:
```
User: "/" 
  → Sees: Begin Session, Quality Gate, Deploy Prep, etc.

User: Selects "Begin Session"
  → AI reads: .cursor/commands/begin-session.md
  → AI executes: tsk diagnose
  → SkillKit analyzes architecture
  → Runs adapted workflow
  → Shows results + reasoning

User: "Fix the issues"
  → AI analyzes errors
  → AI proposes fixes based on project conventions (from agents.yaml)
  → User approves
  → AI fixes
```

### Daily Usage in CLI:
```bash
# Quick check
tsk exec quick-check

# Full quality gate (adapted to YOUR project)
tsk exec quality-gate

# See what it will check and WHY
tsk explain quality-gate
# Output:
#   quality-gate will run:
#   1. format - Always run
#   2. lint - Strict mode (25 ESLint error rules detected)
#   3. validate-contracts - Contracts-first (Zod detected)
#   4. typecheck - Strict TypeScript config
#   5. test - TDD pattern detected, tests prioritized
#   6. build - Final validation
```

---

## 🤖 Agent Experience

### Agent Reading AGENTS.MD:
```xml
<!-- Agent sees this in conversation context -->
<available_skills>
<skill>
<name>quality-gate</name>
<description>Run comprehensive quality checks</description>
<command>tsk exec quality-gate</command>
</skill>
</available_skills>
```

**Agent thinks:** "User wants quality check → I can use quality-gate skill"

### Agent Executing:
```typescript
// Agent calls
await execute("tsk exec quality-gate");

// SkillKit does:
1. Analyze architecture
2. Adapt workflow
3. Execute
4. Return results + reasoning

// Agent receives:
{
  success: false,
  steps: [
    { name: 'format', status: 'pass' },
    { name: 'lint', status: 'fail', errors: 3 },
    { name: 'contracts', status: 'pass' },
    { name: 'typecheck', status: 'pass' },
    { name: 'test', status: 'fail', failures: 2 }
  ],
  reasoning: "Strict mode enabled due to ESLint config. Contract validation passed because all Zod schemas are valid."
}

// Agent reports to user with context!
```

---

## 🎯 Key Innovations

### 1. **Architecture-Aware**
Not just "run lint" but "run lint with YOUR project's strictness level"

### 2. **Declarative + Executable**
- SKILL.md = Instructions (declarative)
- SkillKit = Execution engine (imperative)
- Best of both worlds!

### 3. **Self-Adapting**
Drop SkillKit into ANY project → It figures out what to check

### 4. **Reasoning**
Every workflow explains WHY it's doing what it's doing

### 5. **Multi-Interface**
- CLI: `tsk exec`
- Cursor: `/begin-session`
- MCP: (future) Direct integration
- All use same intelligence layer!

---

## 📊 File Structure (Complete)

```
Project/
├── agents.yaml                   ← Project rules (read by SkillKit)
├── .cursor/
│   └── commands/                 ← Auto-generated by `tsk init --cursor`
│       ├── begin-session.md      ← AI reads this
│       ├── quality-gate.md
│       └── deploy-prep.md
├── skills/                       ← Custom skills (optional)
│   └── validate-contracts/
│       └── SKILL.md              ← Skill definition
└── [your code]

SkillKit Internal:
src/
├── intelligence/                 ← NEW! The brain
│   ├── project-analyzer.ts       ← Understands architecture
│   └── workflow-adapter.ts       ← Adapts workflows
├── adapters/
│   └── command-mapper.ts         ← Discovers commands
├── workflow/
│   ├── executor.ts               ← Executes workflows
│   └── router.ts                 ← Routes intents
└── cursor/
    └── integration.ts            ← Creates AGENTS.MD equivalents
```

---

## ✅ Summary

### SKILL.md
- **Format:** Markdown with YAML frontmatter
- **Purpose:** Define skills (declarative)
- **Read by:** AI agents to understand skill purpose
- **Created by:** Developers or auto-generated

### AGENTS.MD
- **Format:** XML/Markdown
- **Purpose:** Tell AI what skills exist
- **Read by:** AI in IDE (Cursor, Claude Desktop)
- **Created by:** `tsk init --cursor` (auto-generated)

### agents.yaml
- **Format:** YAML
- **Purpose:** Project-specific rules and conventions
- **Read by:** SkillKit's Project Analyzer
- **Created by:** Developers

### SkillKit's Intelligence Layer
- **Reads:** agents.yaml + project files (tsconfig, package.json, etc.)
- **Analyzes:** Architecture patterns
- **Adapts:** Workflows based on what it finds
- **Explains:** WHY it's doing what it's doing

**Result:** Smart, self-adapting workflows that understand YOUR project! 🚀


