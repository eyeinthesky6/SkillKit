# SkillKit - Corrected Roadmap

**Date:** November 5, 2025  
**Based on:** Correct understanding of architecture

---

## ✅ COMPLETED (v1.0-v1.1)

### Core Runtime ✅
- Sandboxed execution engine
- JSON Schema validation
- Audit trails
- Registry system
- CLI interface

### DX Improvements ✅
- Auto-discovery (skills by name)
- Better error messages with suggestions
- Overwrite protection
- Development scripts
- Shell autocomplete
- Security warnings and documentation

### Workflow Integration ✅
- Cross-language command discovery
- Framework adapter system
- Workflow executor
- Workflow router
- Project analyzer
- Intelligence layer
- Cursor integration basics

---

## 🎯 WHAT'S NEXT (Priority Order)

### Phase 1: Complete the Core Mission (THIS WEEK)

**Goal:** Make SkillKit a complete doc-first workflow system

#### 1.1 Environment-Aware Workflows (2 days)
**Task:** Generate adapted workflows for any stack

```bash
$ tsk init --cursor --template typescript
$ tsk init --cursor --template python-django
$ tsk init --cursor --template java-spring
$ tsk init --cursor --template go
```

**Deliverables:**
- [ ] Workflow templates for 5 popular stacks
- [ ] Auto-detection of project type
- [ ] Command substitution (pnpm → pip → mvn)
- [ ] File extension adaptation (.ts → .py → .java)
- [ ] Test framework adaptation (vitest → pytest → junit)

**Files to create:**
```
templates/
├── typescript-nextjs/
│   ├── begin-session.md
│   ├── implement-feature.md
│   └── agents.yaml
├── python-django/
│   ├── begin-session.md
│   ├── implement-feature.md
│   └── agents.yaml
├── java-spring/
│   ├── begin-session.md
│   ├── implement-feature.md
│   └── agents.yaml
└── ... (php-laravel, go-fiber)
```

---

#### 1.2 AGENTS.md Generator (1 day)
**Task:** Auto-generate skill catalog for IDEs

```bash
$ tsk sync  # Generates/updates AGENTS.md

Creates:
.cursor/AGENTS.md (or project root)
- Lists all discovered skills
- Includes schemas
- IDE-compatible format
```

**Deliverables:**
- [ ] AGENTS.md generator
- [ ] XML format (OpenAI spec)
- [ ] Auto-update on skill changes
- [ ] Include custom skills
- [ ] Include installed npm skills

---

#### 1.3 Skill Templates (1 day)
**Task:** Make it easy to create skills

```bash
$ tsk gen-skill diagnose-python --template python
$ tsk gen-skill check-quality --template typescript
$ tsk gen-skill validate-api --template java
```

**Deliverables:**
- [ ] Language-specific skill templates
- [ ] Common skill patterns (diagnose, check, validate, transform)
- [ ] Test file generation
- [ ] Documentation generation

---

### Phase 2: Skill Library (WEEK 2)

**Goal:** Create reusable skills workflows can use

#### 2.1 Core Diagnostic Skills
```bash
skills/
├── diagnose-project/     # Universal diagnostics
├── check-duplicates/     # DEDUP functionality
├── validate-contracts/   # Schema/type checking
├── check-todos/          # TODO/FIXME detection
└── quality-gate/         # Pre-commit checks
```

#### 2.2 Framework-Specific Skills
```bash
skills/
├── diagnose-typescript/
├── diagnose-python/
├── diagnose-java/
├── diagnose-go/
└── diagnose-php/
```

---

### Phase 3: Distribution & Discovery (WEEK 3)

**Goal:** npm registry + skill marketplace basics

#### 3.1 npm Publishing
```bash
# Package structure:
@skillkit/core           # Main package
@skillkit/skill-diagnose # Individual skill
@skillkit/template-typescript # Workflow template

# Installation:
npm install -g @skillkit/core
tsk install @skillkit/skill-diagnose
```

#### 3.2 Skill Discovery
```bash
$ tsk search diagnose
Found 5 skills:
  - @skillkit/skill-diagnose-typescript
  - @skillkit/skill-diagnose-python
  - @community/advanced-diagnose
  ...

$ tsk install @skillkit/skill-diagnose-python
```

---

### Phase 4: Advanced Features (WEEK 4+)

#### 4.1 Intelligent Agent Modification
**Goal:** Agent can adapt workflows on the fly

```markdown
# Agent detects Laravel project
# No template exists
# Agent modifies typescript template:
BEGIN_SESSION.md
- Changes: pnpm run lint → ./vendor/bin/phpcs
- Changes: vitest → phpunit
- Changes: .ts → .php
```

**Requirements:**
- Template with marked substitution points
- Agent instructions for modification
- Validation after modification

#### 4.2 Skill Chaining
```bash
$ tsk chain diagnose → quality-gate → deploy-prep

# Or in workflow:
```bash
tsk exec diagnose && \
tsk exec quality-gate && \
tsk exec deploy-prep
```
```

#### 4.3 MCP Integration (Future)
```bash
# SkillKit as MCP server
# Any IDE can discover and use skills
mcp://skillkit/skills/diagnose
```

---

## 📊 COMPARISON: What We Built vs What We Need

### ✅ What We Have:
- Core runtime (execution, validation, audit)
- CLI interface with good UX
- Auto-discovery of skills
- Framework adapters (basic)
- Command discovery
- Workflow execution engine
- Cursor integration (basic)

### 🔨 What We Need:
- **Environment-aware workflow templates** (typescript/python/java/etc)
- **AGENTS.md generator** (IDE skill discovery)
- **Skill templates** (easy skill creation)
- **Core skill library** (diagnose, check-duplicates, etc)
- **npm distribution** (easy installation)
- **Skill marketplace** (discovery and sharing)

### ⏳ What Can Wait:
- Hot reload dev mode
- Custom test framework
- REPL interface
- Complex orchestration
- Advanced MCP features

---

## 🎯 SUCCESS METRICS

### Week 1 Complete:
- [ ] `tsk init --cursor --template python` works
- [ ] Generates adapted BEGIN_SESSION.md
- [ ] `tsk sync` creates AGENTS.md
- [ ] 3-5 workflow templates available

### Week 2 Complete:
- [ ] 5 core diagnostic skills built
- [ ] Skills work across TypeScript/Python/Java
- [ ] Workflows call skills successfully
- [ ] Documentation updated

### Week 3 Complete:
- [ ] Published to npm as @skillkit/*
- [ ] `tsk search` and `tsk install` working
- [ ] Community can contribute skills
- [ ] 10+ skills in registry

---

## 💡 KEY INSIGHTS

### 1. **Workflows ≠ Skills**
- Workflows: Multi-step protocols (documents)
- Skills: Single-purpose tools (executable)
- Don't confuse them!

### 2. **Environment Awareness is KEY**
- Same workflow, different stacks
- Auto-adapt commands
- This is the unique value

### 3. **npm Distribution Matters**
- Easy installation
- Version management
- Dependency handling
- Standard tooling

### 4. **AGENTS.md is the Glue**
- IDEs discover skills
- AI agents know what's available
- Cross-IDE compatibility

---

## 🚫 WHAT NOT TO BUILD

### ❌ Don't Reinvent:
- Test frameworks (use existing)
- Build tools (use existing)
- Debuggers (use IDE's)
- Package managers (use npm)

### ❌ Don't Over-Engineer:
- Complex orchestration (keep simple)
- Custom execution engine (bash/node is fine)
- Hot reload (not needed for docs)
- Custom syntax (use markdown + bash)

### ✅ Do Focus On:
- Environment adaptation
- Skill reusability
- Easy distribution
- IDE integration
- AI agent experience

---

## 📅 TIMELINE

| Week | Focus | Deliverable |
|------|-------|-------------|
| **1** | Templates + AGENTS.md | `tsk init --template python` |
| **2** | Core Skills | 5 diagnostic skills |
| **3** | Distribution | npm packages |
| **4** | Polish | Docs, examples, tests |
| **5+** | Community | Marketplace, contributions |

---

## 🎯 IMMEDIATE NEXT STEPS

**This Week (Nov 5-12):**

### Day 1-2: Workflow Templates
```bash
# Create template system:
src/templates/
├── typescript-nextjs/
├── python-django/
├── java-spring/
├── go-fiber/
└── php-laravel/

# Implement:
tsk init --cursor --template <name>
```

### Day 3: AGENTS.md Generator
```bash
# Implement:
tsk sync

# Creates/updates:
AGENTS.md or .cursor/AGENTS.md
```

### Day 4-5: Core Skills
```bash
# Build:
skills/diagnose-project/
skills/check-duplicates/
skills/quality-gate/
```

### Day 6-7: Testing & Docs
```bash
# Test workflow:
1. tsk init --cursor --template python
2. @begin-session.md
3. Agent follows workflow
4. Calls: tsk diagnose
5. Works correctly!

# Update docs to match reality
```

---

**Status:** ✅ ROADMAP CORRECTED  
**Focus:** Doc-first workflow system with environmental awareness  
**Priority:** Templates, AGENTS.md, Core Skills  
**Timeline:** 4 weeks to complete core mission

