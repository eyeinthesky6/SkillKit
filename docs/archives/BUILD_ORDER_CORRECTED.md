# SkillKit Build Order - CORRECTED

**Date:** November 5, 2025  
**Status:** ✅ FINAL ROADMAP  
**Reference:** Based on OpenSkills analysis

---

## 🎯 WHAT TO BUILD (Correct Priority)

### ❌ WRONG Priority (What We Almost Did):

```
1. Build execution layer first
2. Build workflows
3. Add package management later
4. Add TUI at the end
```

**Problem:** No one can install or use skills easily!

---

### ✅ CORRECT Priority (Based on OpenSkills Success):

```
1. Build package management FIRST (OpenSkills compatibility)
2. Then add execution
3. Then add workflows
4. Then add intelligence
```

**Why:** Users need to install skills before they can run them!

---

## 📅 4-WEEK BUILD PLAN

### Week 1: OpenSkills Compatibility (Days 1-7)

**Goal:** Be a drop-in replacement for OpenSkills

**Commands that must work:**

```bash
tsk install anthropics/skills   # With beautiful TUI
tsk install myuser/myskill     # Any GitHub repo
tsk list                        # Show all installed skills
tsk sync                        # Generate AGENTS.md
tsk manage                      # Remove skills with TUI
tsk read pdf                    # Output SKILL.md content
```

**Features to build:**

1. **GitHub Integration**
   ```typescript
   // src/package-manager/github.ts
   - Clone GitHub repos
   - Parse SKILL.md files
   - Extract skill metadata
   - Handle repo structure
   ```

2. **Interactive TUI**
   ```typescript
   // src/package-manager/tui.ts
   - Checkbox selection (like inquirer)
   - Beautiful output (like ora)
   - Progress indicators
   - Success/error messages
   ```

3. **Skill Storage**
   ```typescript
   // src/package-manager/storage.ts
   - Install to .claude/skills/
   - Install to .agent/skills/ (--universal)
   - Install to ~/. claude/skills/ (--global)
   - Priority lookup (4 locations)
   ```

4. **AGENTS.md Generator**
   ```typescript
   // src/package-manager/agents-md.ts
   - Scan installed skills
   - Generate XML format
   - Interactive selection for sync
   - Preserve custom sections
   ```

**Testing:**
```bash
# Test with Anthropic's official skills
tsk install anthropics/skills
# → Should show checkbox with: pdf, xlsx, docx, pptx, etc.
# → Should install to ./.claude/skills/

tsk sync
# → Should generate AGENTS.md with installed skills

tsk list
# → Should show: pdf, xlsx, docx (from .claude/skills/)

tsk manage
# → Should show checkbox to remove skills
```

**Deliverables:**
- [ ] GitHub repo cloning
- [ ] Interactive TUI
- [ ] Multi-location storage
- [ ] AGENTS.md generation
- [ ] Works with anthropics/skills repo

**Success Criteria:**
- Can install anthropics/skills ✅
- TUI is beautiful and intuitive ✅
- AGENTS.md is correctly formatted ✅
- Compatible with OpenSkills users ✅

---

### Week 2: Add Execution Layer (Days 8-14)

**Goal:** Make skills executable

**New commands:**

```bash
tsk run pdf extract --input doc.pdf
# → Actually extracts text from PDF
# → Uses bundled scripts from SKILL.md
# → Returns structured JSON

tsk run my-skill --input input.json
# → Validates input
# → Executes in sandbox
# → Returns output
```

**Features to build:**

1. **Skill Executor**
   ```typescript
   // src/runtime/executor.ts
   - Parse SKILL.md instructions
   - Find executable patterns
   - Execute bundled scripts
   - Return structured output
   ```

2. **Sandbox (Already Built)**
   ```typescript
   // src/runtime/sandbox.ts
   - ✅ Already have this
   - Just integrate with executor
   ```

3. **Output Formatter**
   ```typescript
   // src/runtime/formatter.ts
   - --json flag support
   - Pretty print for humans
   - Structured data for AI
   ```

**Testing:**
```bash
# Test with anthropics/skills
tsk install anthropics/skills
tsk run pdf extract --input test.pdf
# → Should actually extract text

tsk run xlsx create --output test.xlsx
# → Should create spreadsheet
```

**Deliverables:**
- [ ] Skill execution engine
- [ ] Bundled resource handling
- [ ] JSON output support
- [ ] Integration with sandbox

**Success Criteria:**
- Can execute anthropics/skills ✅
- Scripts run correctly ✅
- Output is structured ✅
- Errors are actionable ✅

---

### Week 3: Add Workflow Layer (Days 15-21)

**Goal:** Multi-step protocol generation

**New commands:**

```bash
tsk init --cursor
# → Creates BEGIN_SESSION.md
# → Creates implement-feature.md
# → Creates DEDUP.md
# → Creates quality-gate.md

tsk workflow generate <type>
# → Generates custom workflow templates
```

**Features to build:**

1. **Workflow Generator**
   ```typescript
   // src/workflow/generator.ts
   - Template system
   - Environment detection
   - Skill integration
   - Cursor .cursor/commands/ integration
   ```

2. **Workflow Templates**
   ```markdown
   // templates/BEGIN_SESSION.md
   - Session startup protocol
   - Context loading
   - Diagnostics
   - Task routing
   ```

3. **Cursor Integration (Already Built)**
   ```typescript
   // src/cursor/integration.ts
   - ✅ Already have this
   - Just integrate with generator
   ```

**Testing:**
```bash
tsk init --cursor
# → Should create .cursor/commands/BEGIN_SESSION.md

# In Cursor:
@BEGIN_SESSION.md
# → AI should follow protocol
# → Should call tsk commands
```

**Deliverables:**
- [ ] Workflow template system
- [ ] BEGIN_SESSION.md generation
- [ ] implement-feature.md generation
- [ ] Cursor integration

**Success Criteria:**
- Workflows generate correctly ✅
- AI agents can follow them ✅
- Integrates with installed skills ✅
- Works in Cursor ✅

---

### Week 4: Add Intelligence Layer (Days 22-28)

**Goal:** Environment-aware adaptation

**Enhanced commands:**

```bash
tsk diagnose
# → Auto-detects TypeScript/Python/Java
# → Runs appropriate commands
# → Returns structured report

tsk exec quality-gate
# → Adapts to project type
# → Runs lint, typecheck, test
# → Uses project's tools
```

**Features to build (Already Have Most):**

1. **Framework Detection (Already Built)**
   ```typescript
   // src/adapters/registry.ts
   - ✅ Already have this
   - Just enhance detection
   ```

2. **Command Mapper (Already Built)**
   ```typescript
   // src/adapters/command-mapper.ts
   - ✅ Already have this
   - Just test with real projects
   ```

3. **Workflow Adapter (Already Built)**
   ```typescript
   // src/intelligence/workflow-adapter.ts
   - ✅ Already have this
   - Just integrate with workflows
   ```

**Testing:**
```bash
# Test TypeScript project
cd my-typescript-project
tsk diagnose
# → Should detect TypeScript
# → Should run: pnpm lint, tsc, pnpm test

# Test Python project
cd my-python-project
tsk diagnose
# → Should detect Python
# → Should run: flake8, mypy, pytest
```

**Deliverables:**
- [ ] Framework detection
- [ ] Command adaptation
- [ ] Cross-language support
- [ ] Integration with workflows

**Success Criteria:**
- Detects TypeScript, Python, Java ✅
- Adapts commands correctly ✅
- Works across project types ✅
- Workflows use adapted commands ✅

---

## 📊 WHAT'S ALREADY BUILT

### ✅ We Already Have:

- [x] Sandbox execution (`src/runtime/sandbox.ts`)
- [x] Skill validation (`src/skills/registry.ts`)
- [x] Audit logging (`src/audit/logger.ts`)
- [x] Framework adapters (`src/adapters/`)
- [x] Command mapper (`src/adapters/command-mapper.ts`)
- [x] Workflow executor (`src/workflow/executor.ts`)
- [x] Project analyzer (`src/intelligence/project-analyzer.ts`)
- [x] Cursor integration (`src/cursor/integration.ts`)
- [x] CLI commands (`src/cli-commands/`)
- [x] Error handling (`src/errors.ts`)
- [x] Skill auto-discovery (`src/utils/skill-resolver.ts`)

### 🔜 We Need to Build:

- [ ] GitHub repo cloning
- [ ] Interactive TUI
- [ ] Multi-location storage (.claude, .agent, global)
- [ ] AGENTS.md generator
- [ ] Skill executor (for SKILL.md instructions)
- [ ] Workflow template system

---

## 🎯 PRIORITY JUSTIFICATION

### Why Package Management First?

**Evidence from OpenSkills:**
- 834 GitHub stars
- Active community
- Proven UX patterns
- Solves real pain point

**Without package management:**
```bash
# User experience is BAD:
git clone https://github.com/anthropics/skills
cp -r skills/pdf .claude/skills/pdf
# → Manual, error-prone, no validation
```

**With package management:**
```bash
# User experience is GOOD:
tsk install anthropics/skills
# → Interactive, validated, automatic
```

---

### Why Execution Second?

**Differentiation from OpenSkills:**

OpenSkills:
```bash
openskills read pdf
# → Just outputs instructions
# → AI reads and follows manually
# → Error-prone
```

SkillKit:
```bash
tsk run pdf extract --input doc.pdf
# → Actually extracts text
# → Validated, sandboxed
# → Structured output
```

**Value:** Makes skills 10x more useful

---

### Why Workflows Third?

**Builds on previous layers:**

```bash
# Workflow can now use installed skills:
tsk install anthropics/skills    # Week 1
tsk run pdf extract              # Week 2
@BEGIN_SESSION.md uses tsk run   # Week 3
```

**Value:** Orchestrates skills into protocols

---

### Why Intelligence Last?

**Enhancement, not requirement:**

```bash
# Works without intelligence:
tsk run skill --input input.json

# Better with intelligence:
tsk diagnose
# → Auto-detects project type
# → Runs appropriate commands
```

**Value:** Nice-to-have, not critical path

---

## ✅ SUCCESS METRICS

### Week 1 Success:
- [ ] Can install anthropics/skills
- [ ] AGENTS.md is generated correctly
- [ ] TUI is intuitive and beautiful
- [ ] Works like OpenSkills

### Week 2 Success:
- [ ] Can execute anthropics/skills
- [ ] Bundled scripts run correctly
- [ ] Output is structured (JSON)
- [ ] Better than OpenSkills

### Week 3 Success:
- [ ] Workflows generate correctly
- [ ] BEGIN_SESSION.md works in Cursor
- [ ] Skills integrate with workflows
- [ ] Unique value proposition

### Week 4 Success:
- [ ] Auto-detects TypeScript/Python
- [ ] Commands adapt to project
- [ ] Works across languages
- [ ] Complete system

---

## 🚀 LAUNCH CRITERIA (End of Week 4)

**Must have:**
- [x] OpenSkills compatibility
- [x] Skill execution
- [x] Workflow generation
- [x] Cross-language support

**Must work:**
```bash
# Package management:
tsk install anthropics/skills ✅
tsk list ✅
tsk sync ✅

# Execution:
tsk run pdf extract ✅

# Workflows:
tsk init --cursor ✅
@BEGIN_SESSION.md ✅

# Intelligence:
tsk diagnose ✅
```

**Documentation:**
- [ ] README updated
- [ ] OPENSKILLS_ANALYSIS.md ✅
- [ ] CORRECTED_ARCHITECTURE.md ✅
- [ ] BUILD_ORDER_CORRECTED.md ✅
- [ ] Getting started guide
- [ ] Migration guide (from OpenSkills)

---

**Status:** ✅ READY TO BUILD  
**Start Date:** Today  
**Target Launch:** 4 weeks  
**First Task:** Build GitHub cloning and TUI

