# OpenSkills Analysis - Our True Reference

**Date:** November 5, 2025  
**Source:** [numman-ali/openskills](https://github.com/numman-ali/openskills)  
**Stars:** 834  
**Purpose:** Understand what OpenSkills does and how SkillKit differs

---

## 🎯 WHAT IS OPENSKILLS?

**From their repo:**
> "Universal skills loader for AI coding agents"

**Key Features:**
- CLI tool: `npm i -g openskills`
- Installs Anthropic SKILL.md files from GitHub
- Updates AGENTS.md automatically
- Works with Claude Code, Cursor, Windsurf, Aider
- Interactive TUI for skill selection

---

## 📚 HOW OPENSKILLS WORKS

### 1. Installation
```bash
npm i -g openskills

# Install skills from GitHub:
openskills install anthropics/skills
# → Interactive checkbox to select skills
# → Installs to ./.claude/skills/ or ~/.claude/skills/
```

### 2. Skill Discovery
```bash
openskills list
# Shows installed skills:
# - pdf (from anthropics/skills)
# - xlsx (from anthropics/skills)
# - my-custom-skill (from myuser/repo)
```

### 3. AGENTS.md Sync
```bash
openskills sync
# → Interactive checkbox to select which skills for AGENTS.md
# → Generates/updates AGENTS.md with:
<available_skills>
  <skill>
    <name>pdf</name>
    <description>PDF manipulation toolkit</description>
  </skill>
  ...
</available_skills>
```

### 4. Skill Loading (for AI Agents)
```bash
openskills read pdf
# → Outputs full SKILL.md content
# → AI agent reads instructions
# → Base directory provided for bundled resources
```

---

## 🏗️ OPENSKILLS ARCHITECTURE

```
OpenSkills = Skill Package Manager

┌─────────────────────────────────┐
│  GitHub Repositories            │
│  (anthropics/skills, etc)       │
│  - Contains SKILL.md files      │
└──────────────┬──────────────────┘
               │ openskills install
┌──────────────▼──────────────────┐
│  Local Skills Storage           │
│  ./.claude/skills/ or           │
│  ~/.claude/skills/ or           │
│  ./.agent/skills/ (universal)   │
└──────────────┬──────────────────┘
               │ openskills sync
┌──────────────▼──────────────────┐
│  AGENTS.md                      │
│  (skill catalog for IDE)        │
└──────────────┬──────────────────┘
               │ IDE reads
┌──────────────▼──────────────────┐
│  AI Agent                       │
│  (Claude, Cursor, etc)          │
└─────────────────────────────────┘
```

---

## 📊 OPENSKILLS vs SKILLKIT

### What OpenSkills Does:

**✅ Package Manager for Skills**
- Install skills from GitHub
- Manage installed skills
- Update AGENTS.md
- CLI-only (no execution)

**✅ Directory Management**
- `./.claude/skills/` (project)
- `~/.claude/skills/` (global)
- `./.agent/skills/` (universal mode)

**✅ Interactive TUI**
- Checkbox selection
- Beautiful CLI interface
- User-friendly

**❌ Does NOT Execute Skills**
- Just installs SKILL.md files
- Agent reads them manually
- No automation/execution

**❌ Does NOT Have Workflows**
- No multi-step protocols
- No BEGIN_SESSION.md
- No workflow orchestration

**❌ Does NOT Adapt to Environment**
- Installs same files everywhere
- No TypeScript vs Python detection
- No command adaptation

---

### What SkillKit Should Do (Differentiation):

**✅ Everything OpenSkills Does:**
- ✅ Install skills from GitHub
- ✅ Manage skills
- ✅ Update AGENTS.md
- ✅ Directory management

**✅ PLUS Execution:**
- ✅ Actually RUN skills (not just install)
- ✅ Sandboxed execution
- ✅ Validation and audit

**✅ PLUS Workflows:**
- ✅ Multi-step protocols (BEGIN_SESSION.md)
- ✅ Workflow orchestration
- ✅ Task routing

**✅ PLUS Intelligence:**
- ✅ Environment detection (TypeScript/Python/Java)
- ✅ Command adaptation
- ✅ Framework adapters

**✅ PLUS Task Running:**
- ✅ `tsk diagnose` (runs commands)
- ✅ `tsk exec quality-gate` (runs workflows)
- ✅ Cross-platform command discovery

---

## 💡 KEY INSIGHTS FROM OPENSKILLS

### 1. **They Nailed the UX**
```bash
openskills install anthropics/skills
# → Beautiful checkbox interface
# → Shows: name, description, size
# → All selected by default
# → Spacebar to toggle, Enter to confirm
```

**Learning:** Interactive TUI is essential for good UX

### 2. **They Solved Multi-IDE Problem**
```
Priority order:
1. ./.agent/skills/ (universal, new)
2. ~/.agent/skills/ (global universal)
3. ./.claude/skills/ (project)
4. ~/.claude/skills/ (global)
```

**Learning:** Multiple install locations for flexibility

### 3. **They Keep It Simple**
- No execution (just install/list)
- No complex orchestration
- Focus on one thing: skill management
- Works with ANY agent

**Learning:** Start simple, add features based on need

### 4. **They Leverage GitHub**
- Skills are just GitHub repos
- `openskills install username/repo`
- No custom registry needed
- Community can share easily

**Learning:** GitHub as registry is genius (zero infra)

### 5. **AGENTS.md is Auto-Generated**
```bash
openskills sync
# → Scans installed skills
# → Generates AGENTS.md
# → IDE discovers automatically
```

**Learning:** Don't make users write AGENTS.md manually

---

## 🎯 SKILLKIT'S UNIQUE POSITION

### OpenSkills Position:
**"npm for Anthropic skills"**
- Package manager
- Install/uninstall
- Update AGENTS.md
- **Does NOT execute**

### SkillKit Position:
**"OpenSkills + Execution + Workflows + Intelligence"**

```
SkillKit = OpenSkills++

OpenSkills features:
├─ ✅ Install from GitHub
├─ ✅ Manage skills
└─ ✅ Generate AGENTS.md

PLUS SkillKit additions:
├─ ✅ Execute skills (sandboxed)
├─ ✅ Workflow orchestration
├─ ✅ Environment adaptation
├─ ✅ Task runner capabilities
├─ ✅ Framework adapters
└─ ✅ Cross-language support
```

---

## 📋 WHAT TO BUILD (Updated)

### Phase 1: OpenSkills Compatibility (CRITICAL)

**Goal:** Be a drop-in replacement for OpenSkills

```bash
# These should work identically:
tsk install anthropics/skills   # Like openskills install
tsk sync                         # Like openskills sync
tsk list                         # Like openskills list
tsk read pdf                     # Like openskills read
tsk manage                       # Like openskills manage
```

**Why:** 834 GitHub stars means proven demand and UX

**Features to copy:**
1. ✅ Interactive TUI (checkbox selection)
2. ✅ GitHub source support (`username/repo`)
3. ✅ Multiple install locations (.claude, .agent, global)
4. ✅ AGENTS.md auto-generation
5. ✅ Beautiful CLI output

---

### Phase 2: Add Execution Layer

**Goal:** Make skills actually DO things

```bash
# OpenSkills:
openskills read pdf
# → Just outputs SKILL.md content
# → Agent reads and follows manually

# SkillKit:
tsk run pdf extract --input doc.pdf
# → Actually extracts text
# → Uses bundled scripts
# → Returns structured output
```

**Why:** Execution is our differentiator

---

### Phase 3: Add Workflow Layer

**Goal:** Multi-step protocols

```bash
# OpenSkills doesn't have this:

# SkillKit:
tsk init --cursor
# → Creates BEGIN_SESSION.md
# → Creates implement-feature.md
# → AI follows protocols
```

**Why:** Workflows + Skills = Complete system

---

### Phase 4: Add Intelligence

**Goal:** Environment adaptation

```bash
# OpenSkills: Same files everywhere

# SkillKit: Adapts
tsk diagnose
# → TypeScript project: pnpm run lint
# → Python project: flake8
# → Java project: mvn checkstyle:check
```

**Why:** Cross-platform is killer feature

---

## 🔗 INTEGRATION STRATEGY

### SkillKit should be SUPERSET of OpenSkills:

```
User migration path:

1. Currently using OpenSkills
   └─> npm uninstall -g openskills

2. Install SkillKit
   └─> npm install -g @trinity-os/skillkit

3. Same commands work
   └─> tsk install anthropics/skills
   └─> tsk sync
   └─> tsk list

4. PLUS new features
   └─> tsk run pdf extract
   └─> tsk diagnose
   └─> tsk exec quality-gate
```

**Compatibility Promise:**
- All OpenSkills commands work
- Same directory structure
- Same AGENTS.md format
- PLUS execution and workflows

---

## 📊 FEATURE COMPARISON TABLE

| Feature | OpenSkills | SkillKit |
|---------|------------|----------|
| **Install from GitHub** | ✅ Yes | ✅ Yes (compatible) |
| **Interactive TUI** | ✅ Yes | 🔜 TODO |
| **AGENTS.md sync** | ✅ Yes | 🔜 TODO |
| **List skills** | ✅ Yes | ✅ Partial |
| **Read skills** | ✅ Yes | ✅ Yes |
| **Remove skills** | ✅ Yes | 🔜 TODO |
| **Multiple install locations** | ✅ 4 locations | ⚠️ 1 location |
| **Execute skills** | ❌ No | ✅ YES (unique) |
| **Workflow protocols** | ❌ No | ✅ YES (unique) |
| **Environment detection** | ❌ No | ✅ YES (unique) |
| **Task runner** | ❌ No | ✅ YES (unique) |
| **Framework adapters** | ❌ No | ✅ YES (unique) |

---

## ✅ CORRECTED UNDERSTANDING

### The Original SkillKit Vision Was:

**Based on OpenSkills** (cross-platform skill loader) but:
1. Started with execution focus (sandbox, validation)
2. Added workflow system later (BEGIN_SESSION.md)
3. Missed the package management UX (install, sync, manage)

### The Complete SkillKit Should Be:

**OpenSkills (package management) + Execution + Workflows + Intelligence**

```
Layer 1: Package Management (OpenSkills compatibility)
  └─ Install, list, sync, manage

Layer 2: Execution (SkillKit unique)
  └─ Run skills, sandbox, validate

Layer 3: Workflows (SkillKit unique)
  └─ Multi-step protocols, routing

Layer 4: Intelligence (SkillKit unique)
  └─ Environment detection, adaptation
```

---

## 🎯 IMMEDIATE PRIORITY (Revised)

### Week 1: OpenSkills Compatibility

**Goal:** Be a better OpenSkills

**Tasks:**
1. ✅ `tsk install <github-repo>` with TUI
2. ✅ `tsk sync` to generate AGENTS.md
3. ✅ `tsk list` to show installed skills
4. ✅ `tsk manage` with checkbox removal
5. ✅ Support `.claude/` and `.agent/` directories
6. ✅ GitHub cloning and SKILL.md parsing

**Why:** Proven demand (834 stars), clear UX patterns

---

### Week 2: Add Execution

**Goal:** Make skills executable

**Tasks:**
1. `tsk run <skill> <action>` - Execute skill actions
2. Parse SKILL.md for executable patterns
3. Handle bundled resources (scripts/, references/)
4. Return structured output (JSON)

---

### Week 3: Add Workflows

**Goal:** Protocol-based guidance

**Tasks:**
1. `tsk init --cursor` - Generate workflow docs
2. BEGIN_SESSION.md template
3. Workflow templates for popular stacks
4. Integration with skill execution

---

### Week 4: Add Intelligence

**Goal:** Environment adaptation

**Tasks:**
1. Auto-detect project type
2. Adapt commands to stack
3. Framework-specific skills
4. Cross-platform command mapping

---

## 🎭 THE EVOLUTION (Corrected Timeline)

```
2024: OpenSkills created (834 stars)
  └─ Package manager for Anthropic skills
  └─ Install, sync, manage
  └─ Works with all agents

2025 (Early): SkillKit scaffolded
  └─ Focused on execution (sandbox)
  └─ Missed the package management UX

2025 (Nov): Workflow system added
  └─ BEGIN_SESSION.md protocols
  └─ Multi-step guidance
  └─ But still missing OpenSkills features

2025 (Now): Understanding complete
  └─ SkillKit should be OpenSkills++
  └─ Same UX for package management
  └─ PLUS execution + workflows + intelligence
```

---

## 📖 LEARNING: WHY OPENSKILLS SUCCEEDED

**834 GitHub stars because:**

1. **Solved real pain point**
   - Installing Anthropic skills was manual
   - Updating AGENTS.md was tedious
   - They automated it

2. **Great UX**
   - Interactive TUI
   - Beautiful output
   - Simple commands

3. **Universal compatibility**
   - Works with Claude Code
   - Works with Cursor
   - Works with Windsurf
   - Works with Aider

4. **Zero infrastructure**
   - Uses GitHub as registry
   - No servers needed
   - Community can publish easily

5. **Focused scope**
   - Does ONE thing well
   - Package management only
   - No feature creep

---

## ✅ ACTION PLAN (Final)

### Immediate (This Week):

**Build OpenSkills compatibility:**
```bash
npm install -g @trinity-os/skillkit

# These commands work:
tsk install anthropics/skills  # With TUI
tsk sync                        # Generate AGENTS.md
tsk list                        # Show installed
tsk manage                      # Remove with TUI
```

### Next (Week 2-4):

**Add unique features:**
```bash
# Execution:
tsk run pdf extract --input doc.pdf

# Workflows:
tsk init --cursor
@BEGIN_SESSION.md

# Intelligence:
tsk diagnose  # Auto-adapts to stack
```

---

**Status:** ✅ COMPLETE UNDERSTANDING  
**Reference:** [OpenSkills GitHub](https://github.com/numman-ali/openskills)  
**Strategy:** OpenSkills compatibility + unique execution/workflow features  
**Priority:** Package management UX first, then execution layer

