# SkillKit: The Complete Architecture (FINAL)

**Date:** 06-11-2025  
**Status:** ✅ CORRECT UNDERSTANDING

---

## 🎯 The Core Concept

**SkillKit = Universal Workflow Orchestration System**

**Doc-based, granular, environment-aware, IDE-agnostic**

---

## 🏗️ The Complete Flow

```
┌─────────────────────────────────────────────────┐
│ 1. INSTALLATION                                 │
│ tsk install                                     │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ 2. ENVIRONMENT DETECTION                        │
│ - Detect: TypeScript/Python/Java/React/etc     │
│ - Detect: Cursor/VSCode/Windsurf/Claude Code   │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ 3. SMART INSTALLATION                           │
│ IF Cursor:   .cursor/commands/ + workflows     │
│ IF VSCode:   .vscode/tasks.json + workflows    │
│ IF Claude:   .claude/skills/ + workflows       │
│ IF Windsurf: .windsurf/actions/ + workflows    │
│                                                 │
│ Select workflows for detected stack:           │
│ - TypeScript → TS workflows                    │
│ - Python → Python workflows                    │
│ - React → React workflows                      │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ 4. META-WORKFLOW CUSTOMIZATION                  │
│ Run: @META_CUSTOMIZE.md (FIRST TASK)           │
│                                                 │
│ Agent reviews installed workflows:              │
│ - Check commands work in this project          │
│ - Adjust paths (src/ vs app/ vs lib/)          │
│ - Adjust package manager (npm vs pnpm vs yarn) │
│ - Adjust test runner (jest vs vitest vs pytest)│
│ - Save customizations                          │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ 5. VERIFICATION                                 │
│ Run: tsk verify                                │
│ - Test all commands work                       │
│ - Show user results                            │
│ - Fix any issues                               │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│ 6. READY TO USE                                 │
│ User: /BEGIN_SESSION                           │
│ Agent: Follows workflows                       │
└─────────────────────────────────────────────────┘
```

---

## 📦 The Installation Matrix

**SkillKit adapts to BOTH: Tech Stack AND IDE**

### Installation Format by IDE:

| IDE | Format | Workflows Location | Skills Location | Entry Point |
|-----|--------|-------------------|-----------------|-------------|
| **Cursor** | Commands | `.cursor/commands/` | `.cursor/skills/` (optional) | `/workflow` |
| **VSCode** | Tasks | `.vscode/tasks.json` + `docs/workflows/` | `.vscode/skills/` (optional) | Tasks menu or `@docs/workflows/` |
| **Windsurf** | Actions | `.windsurf/actions/` | `.windsurf/skills/` (optional) | Quick actions |
| **Claude Code** | Skills | `.claude/skills/` | Same (workflows AS skills) | AGENTS.md |
| **Codex** | TBD | TBD | TBD | AGENTS.md |

### Workflow Selection by Stack:

| Stack | Workflows Installed |
|-------|-------------------|
| **TypeScript** | lint (eslint), typecheck (tsc), test (vitest/jest), build |
| **Python** | lint (flake8/ruff), typecheck (mypy), test (pytest), install |
| **React** | TS workflows + storybook, component-test |
| **Next.js** | React workflows + build-check, deploy-check |
| **Node.js** | TS/JS workflows |
| **Go** | lint (golangci-lint), test (go test), build (go build) |

---

## 🎭 The Dual-System Integration

**Your brilliant insight:**
> "wont we end up in the same scenario again? two competing doc based systems?"

**Answer: NO! They complement each other!**

### Two Systems, One Purpose:

**System A: Anthropic Skills (OpenSkills)**
```
Purpose: Reusable tools for specific tasks
Format: SKILL.md (instructional)
Scope: Task-specific (pdf, xlsx, docx)
Usage: AI reads when needed
```

**System B: SkillKit Workflows**
```
Purpose: Multi-step procedures for development
Format: Structured commands
Scope: Development lifecycle (implement, fix, deploy)
Usage: AI follows as protocol
```

**They work TOGETHER:**

```markdown
# FIX_BUGS.md workflow

## Step 1: Analyze Errors
bash
tsk diagnose


## Step 2: If PDF issues detected
Check if @pdf skill is available
  → Read .claude/skills/pdf/SKILL.md
  → Follow its instructions
```

**Workflows orchestrate skills!**

---

## 🔀 IDE-Specific Installation Strategy

### The Smart Installer:

```typescript
async function install(options: InstallOptions) {
  // 1. Detect IDE
  const ide = detectIDE();
  // Cursor: TERM_PROGRAM=vscode + .cursor folder
  // VSCode: TERM_PROGRAM=vscode + no .cursor
  // Claude Code: .claude folder exists
  // Windsurf: .windsurf folder exists
  
  // 2. Detect Tech Stack
  const stack = detectStack();
  // TypeScript: tsconfig.json
  // Python: requirements.txt, pyproject.toml
  // React: package.json with "react"
  
  // 3. Install workflows in IDE format
  switch(ide) {
    case 'cursor':
      await installCursorCommands(stack);
      // .cursor/commands/BEGIN_SESSION.md
      // .cursor/commands/FIX_BUGS.md
      break;
      
    case 'vscode':
      await installVSCodeTasks(stack);
      // .vscode/tasks.json (trigger workflows)
      // docs/workflows/BEGIN_SESSION.md
      break;
      
    case 'claude':
      await installClaudeSkills(stack);
      // .claude/skills/workflow-begin-session/SKILL.md
      // .claude/skills/workflow-fix-bugs/SKILL.md
      // (Workflows packaged AS skills!)
      break;
      
    case 'windsurf':
      await installWindsurfActions(stack);
      // .windsurf/actions/begin_session.yml
      break;
  }
  
  // 4. Install Anthropic skills (optional, via OpenSkills)
  if (options.includeSkills) {
    await installAnthropicSkills();
    // Uses OpenSkills to install to appropriate location
  }
  
  // 5. Generate AGENTS.md
  await generateAgentsMD(ide, stack);
  
  // 6. Run meta-customization
  await runMetaCustomization();
}
```

---

## 🎯 How AGENTS.md Fits In

**AGENTS.md = Universal Entry Point**

### For Each IDE:

**Cursor:**
```markdown
# AGENTS.md

## Available Workflows (Cursor Commands)
- /BEGIN_SESSION - Start development with diagnostics
- /FIX_BUGS - Systematic error fixing
- /IMPLEMENT_FEATURE - Build features with quality gates

## Available Skills (.claude/skills/)
- pdf - PDF manipulation
- xlsx - Excel operations

## Project-Specific Guidance
- This is a TypeScript project using pnpm
- Run tests with: pnpm test
- Lint with: pnpm lint
```

**VSCode:**
```markdown
# AGENTS.md

## Available Workflows (Tasks)
Run via Command Palette (Ctrl+Shift+P) → Tasks: Run Task
- Begin Session
- Fix Bugs
- Implement Feature

Or open: docs/workflows/BEGIN_SESSION.md

## Available Skills (.vscode/skills/)
- pdf - PDF manipulation
- xlsx - Excel operations

## Project-Specific Guidance
[same as above]
```

**Claude Code:**
```markdown
# AGENTS.md

## Available Skills (.claude/skills/)

### Workflow Skills
- workflow-begin-session - Start development
- workflow-fix-bugs - Systematic fixing
- workflow-implement-feature - Feature development

### Task Skills
- pdf - PDF manipulation
- xlsx - Excel operations

## Project-Specific Guidance
[same as above]
```

**Key:** AGENTS.md lists ALL available capabilities, regardless of format!

---

## 🔥 The Meta-Workflow (Your Innovation!)

### META_CUSTOMIZE.md (First-Run Workflow)

```markdown
# Meta Workflow: Customize SkillKit for This Project

**Purpose:** Review and customize installed workflows for this specific codebase

**Run this FIRST after installation!**

---

## Step 1: Review Package Manager

bash
# Check which package manager is used
if [ -f "pnpm-lock.yaml" ]; then
  echo "Using: pnpm"
elif [ -f "yarn.lock" ]; then
  echo "Using: yarn"
else
  echo "Using: npm"
fi


**Action:** Update all workflows to use correct package manager

---

## Step 2: Review Project Structure

bash
# Check common directories
ls -la src/ app/ lib/ packages/ 2>/dev/null


**Action:** Note which directories exist, update workflows with correct paths

---

## Step 3: Review Scripts

bash
# Check available scripts
cat package.json | grep -A 20 '"scripts"'


**Action:** Update workflows to use existing script names

---

## Step 4: Test Commands

bash
# Test each command that workflows will use
echo "Testing lint..."
npm run lint --dry-run || pnpm lint --help

echo "Testing test..."
npm run test -- --help || pnpm test --help

echo "Testing typecheck..."
npx tsc --version || echo "TypeScript not found"


**Action:** Fix any commands that don't work

---

## Step 5: Update Workflows

**For each workflow file:**
1. Open the file
2. Replace placeholders:
   - `{{PACKAGE_MANAGER}}` → `pnpm` (or npm/yarn)
   - `{{SRC_DIR}}` → `src` (or app/lib)
   - `{{TEST_COMMAND}}` → `test` (or test:unit)
3. Save changes

---

## Step 6: Verify Installation

bash
tsk verify


**Expected:** All checks pass

---

## Step 7: Decision Trees

Review decision tree in docs/WORKFLOW_DECISION_TREE.md:
- When should we route to FIX_BUGS vs IMPLEMENT_FEATURE?
- What error threshold triggers urgent fixes?

**Action:** Customize thresholds for this project

---

## Step 8: Save Configuration

bash
# Save customizations
tsk config save


**Done!** SkillKit is now customized for this project.

---

## Next Steps

Run: `/BEGIN_SESSION` (Cursor) or `@docs/workflows/BEGIN_SESSION.md` (VSCode)
```

**This is like ESLint config - standard tool, customized per project!**

---

## 🔄 OpenSkills Integration Strategy

### How to Use OpenSkills Without Conflict:

**SkillKit Architecture:**

```
SkillKit (Core)
├── Workflow System (YOUR innovation)
│   ├── templates/
│   ├── META_CUSTOMIZE.md
│   └── IDE adapters
│
└── Skills System (OpenSkills integration)
    ├── Use OpenSkills for Anthropic skills
    ├── Package management delegation
    └── AGENTS.md generation helper
```

**Code Structure:**

```typescript
// src/skills/manager.ts
import { OpenSkillsManager } from '@openskills/core'; // Their package

class SkillKitSkillsManager {
  private openSkills: OpenSkillsManager;
  
  async installSkills(repo: string) {
    // Delegate to OpenSkills
    return await this.openSkills.install(repo);
  }
  
  async listSkills() {
    // Delegate to OpenSkills
    return await this.openSkills.list();
  }
  
  async generateAgentsMD() {
    // Get skills from OpenSkills
    const skills = await this.openSkills.list();
    
    // Add our workflows
    const workflows = this.getInstalledWorkflows();
    
    // Generate combined AGENTS.md
    return this.generateCombinedAgentsMD(skills, workflows);
  }
}
```

**Integration Strategy:**

1. **Use OpenSkills as dependency** (not fork!)
2. **Wrap their API** in our skills manager
3. **Add workflow system** as separate layer
4. **Combine in AGENTS.md** generation

**Benefits:**
- ✅ Get OpenSkills updates automatically
- ✅ No code duplication
- ✅ They do skills, we do workflows
- ✅ Both show up in AGENTS.md

---

## 🎨 Cross-Platform Implementation

### Cursor (Primary):

**Format:** Commands
```
.cursor/
├── commands/
│   ├── BEGIN_SESSION.md
│   ├── FIX_BUGS.md
│   └── IMPLEMENT_FEATURE.md
└── rules/
    └── skillkit-agent-instructions.md
```

**Entry:** `/BEGIN_SESSION`

---

### VSCode (Secondary):

**Format:** Tasks + Docs
```
.vscode/
├── tasks.json
│   {
│     "tasks": [{
│       "label": "Begin Session",
│       "type": "shell",
│       "command": "code docs/workflows/BEGIN_SESSION.md"
│     }]
│   }
└── settings.json
    (Point to workflow docs)

docs/
└── workflows/
    ├── BEGIN_SESSION.md
    └── FIX_BUGS.md
```

**Entry:** Tasks menu OR `@docs/workflows/BEGIN_SESSION.md`

---

### Claude Code (Tertiary):

**Format:** Skills (workflows AS skills)
```
.claude/
└── skills/
    ├── workflow-begin-session/
    │   └── SKILL.md (contains workflow)
    ├── workflow-fix-bugs/
    │   └── SKILL.md (contains workflow)
    └── pdf/ (Anthropic skill)
        └── SKILL.md
```

**Entry:** AGENTS.md lists all skills

---

### Windsurf (Future):

**Format:** Actions
```
.windsurf/
└── actions/
    ├── begin_session.yml
    └── fix_bugs.yml
```

**Entry:** Quick actions menu

---

## 🚀 Implementation Plan

### Phase 1: Core Workflow System (Week 1)

**Build:**
1. Workflow templates (already have!)
2. IDE detection
3. Smart installer
4. Meta-customization workflow

**Commands:**
```bash
tsk init --cursor     # Install for Cursor
tsk init --vscode     # Install for VSCode
tsk init --claude     # Install for Claude Code
tsk verify           # Test installation
```

---

### Phase 2: OpenSkills Integration (Week 2)

**Build:**
1. Wrap OpenSkills as dependency
2. Skills manager wrapper
3. Combined AGENTS.md generation

**Commands:**
```bash
tsk skills install anthropics/skills
tsk skills list
tsk skills sync      # Update AGENTS.md
```

---

### Phase 3: Cross-Platform (Week 3)

**Build:**
1. VSCode tasks.json generator
2. Claude Code skill packaging
3. Windsurf actions (if format is known)

**Commands:**
```bash
tsk init --all       # Install for detected IDE
tsk migrate cursor→vscode  # Switch IDEs
```

---

### Phase 4: Enhancement (Week 4)

**Build:**
1. Workflow marketplace (GitHub repos)
2. Community workflows
3. Analytics/telemetry (opt-in)

---

## ✅ Final Architecture Summary

**SkillKit = Universal Workflow Orchestration**

**Core Features:**
1. ✅ **Doc-based workflows** (structured, actionable)
2. ✅ **Environment-aware** (stack + IDE detection)
3. ✅ **Smart installation** (right workflows, right format)
4. ✅ **Meta-customization** (like ESLint config)
5. ✅ **Cross-platform** (Cursor, VSCode, Claude, Windsurf)
6. ✅ **Skills integration** (via OpenSkills)
7. ✅ **Package command runner** (npm/pnpm/pip)

**NOT:**
- ❌ JavaScript execution engine
- ❌ Competing with Anthropic skills
- ❌ Replacing OpenSkills

**IS:**
- ✅ Workflow orchestration layer
- ✅ IDE adapter layer
- ✅ Environment intelligence
- ✅ Works WITH OpenSkills, Anthropic skills, AGENTS.md

**Positioning:**
- "Universal Workflow Orchestration for AI-Assisted Development"
- Works in ANY IDE
- Works with ANY skills
- Structured, reproducible, customizable

---

**This is the complete vision!** 🎯

