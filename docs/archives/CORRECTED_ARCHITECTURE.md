# SkillKit Architecture - CORRECTED (Based on OpenSkills)

**Date:** November 5, 2025  
**Status:** ✅ COMPLETE UNDERSTANDING  
**Reference:** [OpenSkills](https://github.com/numman-ali/openskills) (834 stars)

---

## 🎯 WHAT IS SKILLKIT? (Final Answer)

**SkillKit is OpenSkills++ with execution, workflows, and intelligence.**

```
SkillKit = OpenSkills (package management)
         + Execution (sandboxed skill running)
         + Workflows (multi-step protocols)
         + Intelligence (environment adaptation)
```

---

## 📊 THE FOUR LAYERS

### Layer 1: Package Management (OpenSkills Compatible)

**What OpenSkills does (we must do too):**

```bash
# Install skills from GitHub
tsk install anthropics/skills
# → Interactive checkbox to select skills
# → Installs to ./.claude/skills/ or ~/.claude/skills/

# List installed skills
tsk list
# → Shows: pdf, xlsx, docx, etc.

# Sync AGENTS.md
tsk sync
# → Auto-generates AGENTS.md from installed skills

# Remove skills
tsk manage
# → Interactive checkbox to remove skills
```

**Directory structure:**
```
./.agent/skills/      (universal, priority 1)
~/.agent/skills/      (global universal, priority 2)
./.claude/skills/     (project, priority 3)
~/.claude/skills/     (global, priority 4)
```

**AGENTS.md format:**
```xml
<available_skills>
  <skill>
    <name>pdf</name>
    <description>PDF manipulation toolkit</description>
  </skill>
  <skill>
    <name>xlsx</name>
    <description>Spreadsheet operations</description>
  </skill>
</available_skills>
```

**Status:** 🔜 TODO - Need to build this first!

---

### Layer 2: Execution (SkillKit Unique)

**What SkillKit adds:**

```bash
# Execute skills (not just install them)
tsk run pdf extract --input doc.pdf
# → Actually extracts text from PDF
# → Uses bundled scripts from SKILL.md
# → Returns structured JSON output

# Run with validation
tsk run my-skill --input input.json
# → Validates input against schema
# → Executes in sandboxed environment
# → Logs to audit trail
```

**Features:**
- Sandboxed execution (path whitelisting, command filtering)
- Input/output validation (JSON Schema)
- Audit trails (track all operations)
- Error handling (structured errors)
- Resource limits (timeout, memory)

**Status:** ✅ BUILT (but needs OpenSkills layer first)

---

### Layer 3: Workflows (SkillKit Unique)

**What SkillKit adds:**

```bash
# Generate workflow protocols
tsk init --cursor
# → Creates BEGIN_SESSION.md
# → Creates implement-feature.md
# → Creates DEDUP.md

# AI agent follows workflow
@BEGIN_SESSION.md
# → Loads context
# → Runs tsk diagnose
# → Presents task menu
# → Routes to appropriate workflow
```

**Workflow types:**
1. **Session Management:** BEGIN_SESSION.md, FINAL_CHECK.md
2. **Feature Development:** implement-feature.md, quick-fix.md
3. **Code Quality:** DEDUP.md, quality-gate.md
4. **Documentation:** document-codebase.md

**Status:** ✅ BUILT (but needs Layer 1 and 2 first)

---

### Layer 4: Intelligence (SkillKit Unique)

**What SkillKit adds:**

```bash
# Environment-aware execution
tsk diagnose

# TypeScript project:
# → Runs: pnpm run lint, tsc --noEmit, pnpm test

# Python project:
# → Runs: flake8, mypy, pytest

# Java project:
# → Runs: mvn checkstyle:check, javac, mvn test
```

**Features:**
- Framework detection (TypeScript, Python, Java, Go, PHP)
- Command adaptation (lint → eslint/flake8/checkstyle)
- Project analysis (reads tsconfig, eslint, pyproject.toml)
- Architectural detection (Zod contracts, TDD, strict mode)

**Status:** ✅ BUILT (but needs all other layers)

---

## 🔄 HOW THE LAYERS INTERACT

### Example: AI Agent Session in Cursor

```
1. User: "@BEGIN_SESSION.md I want to add a feature"

2. BEGIN_SESSION.md (Layer 3 Workflow):
   - Reads: "Run diagnostics to understand project state"
   - Invokes: tsk diagnose --json

3. tsk diagnose (Layer 4 Intelligence):
   - Detects: TypeScript project with pnpm
   - Discovers: package.json has "lint", "test", "typecheck"
   - Maps intents: lint → eslint, test → vitest, typecheck → tsc
   - Executes: pnpm run lint, pnpm run typecheck, pnpm test

4. Results returned to AI (Layer 2 Execution):
   - JSON output with diagnostics
   - Structured errors if any
   - AI decides next step

5. AI follows workflow (Layer 3):
   - If errors: "Fix these first"
   - If clean: "What feature should I implement?"
   - Routes to implement-feature.md

6. implement-feature.md uses skills (Layer 1):
   - Might invoke: tsk run code-generator
   - Might invoke: tsk run test-generator
   - These skills were installed via: tsk install myrepo/skills
```

---

## 📚 THE THREE DOCUMENT TYPES

### 1. SKILL.md (Anthropic Format)

**What it is:** Instructions for a single-purpose automation

**Example:**
```yaml
---
name: pdf
description: Extract text and tables from PDFs
---

# PDF Skill

When asked to extract text from a PDF:

1. Install dependencies: `pip install pypdf2`
2. Run: `python scripts/extract.py --input {file}`
3. Parse output JSON
4. Present results to user

Bundled resources:
- scripts/extract.py
- references/pypdf-docs.md
```

**Who reads:** AI agent (loaded when skill invoked)  
**Purpose:** Progressive disclosure of detailed instructions  
**Managed by:** `tsk install`, `tsk list`, `tsk sync` (Layer 1)

---

### 2. AGENTS.md (OpenAI Format)

**What it is:** Catalog of available skills for IDE/AI

**Example:**
```xml
<available_skills>
  <skill>
    <name>pdf</name>
    <description>Extract text and tables from PDFs</description>
  </skill>
  <skill>
    <name>xlsx</name>
    <description>Create and edit spreadsheets</description>
  </skill>
</available_skills>
```

**Who reads:** IDE (Cursor, Claude Code, Windsurf) and AI agent  
**Purpose:** Skill discovery (what tools are available)  
**Auto-generated by:** `tsk sync` (Layer 1)

---

### 3. Workflow Docs (e.g., BEGIN_SESSION.md)

**What it is:** Multi-step protocol for complex processes

**Example:**
```markdown
# BEGIN SESSION

You are starting a new development session.

## Phase 1: Context Loading
- Read recent AITracking docs
- Check project status
- Load sprint goals

## Phase 2: Diagnostics
Run: `tsk diagnose --json`
Parse results and check for errors.

## Phase 3: Task Selection
Present menu:
1. Implement new feature
2. Fix bugs
3. Refactor code
4. Update documentation

## Phase 4: Route
Based on selection, invoke appropriate workflow.
```

**Who reads:** AI agent (when invoked via Cursor command)  
**Purpose:** Orchestrate complex multi-step processes  
**Managed by:** `tsk init --cursor` (Layer 3)

---

## 🎯 THE HIERARCHY

```
User invokes workflow
  └─> Workflow doc (BEGIN_SESSION.md)
      ├─> Calls: tsk diagnose (Layer 4 Intelligence)
      │   └─> Uses: Framework adapters
      │   └─> Returns: JSON results
      │
      ├─> Calls: tsk run pdf extract (Layer 2 Execution)
      │   └─> Reads: SKILL.md from .claude/skills/pdf/
      │   └─> Executes: Bundled scripts
      │   └─> Returns: Structured output
      │
      └─> Routes to: implement-feature.md (another workflow)
          └─> Which might call more skills...
```

---

## 📦 WHAT USERS INSTALL

### From GitHub (like OpenSkills):
```bash
tsk install anthropics/skills
# → Installs: pdf, xlsx, docx, pptx, etc.
# → Into: ./.claude/skills/

tsk install myuser/custom-skills
# → Installs: my-skill-1, my-skill-2
# → Into: ./.claude/skills/

tsk sync
# → Updates AGENTS.md with all installed skills
```

### From SkillKit (built-in workflows):
```bash
tsk init --cursor
# → Creates .cursor/commands/BEGIN_SESSION.md
# → Creates .cursor/commands/implement-feature.md
# → Creates .cursor/commands/DEDUP.md
```

---

## 🔑 KEY DIFFERENCES FROM OPENSKILLS

| Feature | OpenSkills | SkillKit |
|---------|-----------|----------|
| **Install skills from GitHub** | ✅ Yes | ✅ Yes (compatible) |
| **Interactive TUI** | ✅ Yes | 🔜 TODO |
| **AGENTS.md sync** | ✅ Yes | 🔜 TODO |
| **List/manage skills** | ✅ Yes | 🔜 TODO |
| **Multiple install locations** | ✅ 4 locations | 🔜 TODO |
| | | |
| **Execute skills** | ❌ No | ✅ YES (unique) |
| **Sandboxed execution** | ❌ No | ✅ YES (unique) |
| **Workflow protocols** | ❌ No | ✅ YES (unique) |
| **Environment detection** | ❌ No | ✅ YES (unique) |
| **Task runner** | ❌ No | ✅ YES (unique) |
| **Framework adapters** | ❌ No | ✅ YES (unique) |

---

## ✅ CORRECTED BUILD ORDER

### Week 1: OpenSkills Compatibility (FIRST!)

```bash
# Must work:
tsk install anthropics/skills  # With TUI
tsk list                        # Show installed
tsk sync                        # Generate AGENTS.md
tsk manage                      # Remove with TUI
tsk read pdf                    # Output SKILL.md
```

**Why first:** Proven demand (834 stars), clear UX

---

### Week 2: Enable Execution

```bash
# Add:
tsk run pdf extract --input doc.pdf
# → Actually extracts, not just shows instructions
```

**Why:** Makes SkillKit more useful than OpenSkills

---

### Week 3: Add Workflows

```bash
# Add:
tsk init --cursor
# → Generate workflow protocols
```

**Why:** Orchestration layer for complex tasks

---

### Week 4: Add Intelligence

```bash
# Enhance:
tsk diagnose
# → Auto-detects TypeScript vs Python
```

**Why:** Environment adaptation

---

## 📖 WHAT WE LEARNED

**The original SkillKit README was based on:**
1. OpenSkills (package management, skill loading)
2. Anthropic Skills (SKILL.md format)
3. OpenAI AGENTS.md (skill catalog)

**But focused on:**
- Execution (sandbox, validation)
- Missed: Package management UX

**The workflows system added:**
- Multi-step protocols
- BEGIN_SESSION.md, implement-feature.md

**The correct integration:**
1. **Layer 1:** OpenSkills compatibility (install, sync, manage)
2. **Layer 2:** Execution (run skills, sandbox)
3. **Layer 3:** Workflows (orchestrate skills)
4. **Layer 4:** Intelligence (adapt to environment)

---

**Status:** ✅ COMPLETE UNDERSTANDING  
**Next:** Build Layer 1 (OpenSkills compatibility)  
**Reference:** [OpenSkills GitHub](https://github.com/numman-ali/openskills)

