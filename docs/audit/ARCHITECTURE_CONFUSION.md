# Architecture Confusion - Critical Clarification Needed

**Date:** November 5, 2025  
**Issue:** Fundamental misunderstanding of SkillKit's purpose and architecture

---

## 🚨 THE CRITICAL QUESTION

**User asked:** *"What's the use of CLI in this doc-based task workflow guardrails system to guide AI agents? Does the command run in terminal then if installed in the environment?"*

**This reveals a MAJOR GAP:** We've been building the wrong thing!

---

## 🤔 Two Competing Architectures

### Architecture A: **CLI Tool for Developers**
**What we built in Phase 1 (DX improvements):**
- Terminal CLI (`tsk run my-skill`)
- Developer runs commands manually
- Skills execute in sandboxed Node.js
- Developer-facing error messages
- Interactive CLI experience

**Use Case:** Human developer types commands

### Architecture B: **Document-Based Agent Guardrails**
**What the vision describes:**
- Markdown documents in `.cursor/commands/`
- AI agents read instructions
- Workflows guide agent behavior
- BEGIN_SESSION.md, implement-feature.md, etc.
- AI executes based on doc content

**Use Case:** AI agent reads docs, follows protocol

---

## ❓ WHICH ONE IS SKILLKIT?

### Evidence for **Architecture A** (CLI Tool):
- ✅ We built `tsk` CLI with commands
- ✅ Entire DX audit focuses on developer CLI experience
- ✅ Error messages designed for human developers
- ✅ Autocomplete for human typing
- ✅ "Getting Started" shows manual terminal usage

### Evidence for **Architecture B** (Agent Guardrails):
- ✅ VISION.md mentions "19 battle-tested workflows"
- ✅ `docs/workflow-replication-package/` has agent protocols
- ✅ Cursor integration generates `.cursor/commands/*.md`
- ✅ BEGIN_SESSION, implement-feature are **AI instructions**
- ✅ agents.yaml defines **agent behavior rules**

---

## 🎯 THE TRUTH: It's BOTH (But Confused)

**SkillKit appears to be THREE things:**

### 1. **Skill Execution Runtime** (Core)
- Sandboxed JS execution
- Input/output validation
- Audit trails
- **Purpose:** Run untrusted code safely

### 2. **CLI for Developers** (Our DX focus)
- `tsk run`, `tsk gen-skill`, etc.
- Developer productivity
- **Purpose:** Humans use the runtime

### 3. **Agent Workflow System** (The Vision)
- Markdown protocols
- AI agent guidance
- Cursor integration
- **Purpose:** AI agents use the runtime

---

## 🚨 THE CONFUSION

### How Do These Connect?

**Option 1: CLI is for AI agents to call**
```markdown
# BEGIN_SESSION.md (AI reads this)
Execute these commands:
1. Run: `tsk diagnose`
2. Run: `tsk exec quality-gate`
3. If fails, run: `tsk fix-all`
```
**Problem:** AI agents don't run terminal commands in Cursor!

**Option 2: Skills ARE the workflows**
```yaml
# skills/begin-session/SKILL.yaml
name: begin-session
# AI agent invokes this skill programmatically
```
**Problem:** How does AI invoke? Via CLI? Programmatic API?

**Option 3: Two separate systems**
- **SkillKit Runtime** = Execute JS skills
- **Workflow Docs** = Guide AI behavior (no execution)
**Problem:** Then why integrate them?

---

## 🎭 WHAT THE USER IS ASKING

**Translation of user's question:**

> "You built a CLI tool with `tsk run` commands. But the vision talks about document-based workflows that guide AI agents in Cursor. How do these connect? Does the AI agent actually RUN the `tsk` commands in a terminal? Or are the workflow docs just instructions the AI reads?"

**Valid concern!** We've been optimizing CLI UX for humans, but the real use case might be:
- AI agent reads `BEGIN_SESSION.md`
- Follows protocol steps
- Never actually runs `tsk` commands
- Just uses the guidance

---

## 🔍 NEED TO CLARIFY

### Questions for User:

1. **Who is the primary user?**
   - A) Human developer typing `tsk run my-skill`
   - B) AI agent reading workflow docs
   - C) Both (how do they interact?)

2. **How do workflows execute?**
   - A) AI agent runs `tsk diagnose` in terminal
   - B) AI agent reads BEGIN_SESSION.md, follows manually
   - C) SkillKit programmatically executes workflows
   - D) Something else?

3. **What is a "skill"?**
   - A) A JS function that does automation (current implementation)
   - B) A workflow protocol document (BEGIN_SESSION.md)
   - C) Both (how are they different?)

4. **Cursor integration purpose?**
   - A) Generate docs for AI to read (no execution)
   - B) Enable AI to invoke skills programmatically
   - C) Let human use slash commands to run skills
   - D) All of the above?

---

## 💡 POSSIBLE ARCHITECTURES

### Architecture 1: **Hybrid System**
```
Human Developer:
  └─> Uses CLI: `tsk run my-skill`
  
AI Agent:
  └─> Reads .cursor/commands/BEGIN_SESSION.md
  └─> Follows protocol manually
  └─> Can invoke skills via: `@skillkit run diagnose`
  └─> SkillKit executes behind the scenes
```

### Architecture 2: **Agent-First System**
```
AI Agent:
  └─> Reads workflow docs (instructions only)
  └─> Follows steps in conversation
  └─> Never executes skills
  
Human Developer:
  └─> Uses CLI for testing/debugging
```

### Architecture 3: **Skill Execution Platform**
```
Skills = Reusable automation units

Used by:
  1. CLI (human: `tsk run`)
  2. API (programmatic: skillkit.run())
  3. Cursor (agent: slash command)
  4. MCP (protocol: mcp://skillkit/run)

Workflows = Compositions of skills
```

---

## 🎯 RECOMMENDATION

**STOP** building until we clarify:

### Critical Decisions Needed:

1. **Primary Use Case:**
   - [ ] CLI tool for developers
   - [ ] Agent guidance system
   - [ ] Skill execution runtime
   - [ ] All three (explain integration)

2. **Workflow Execution:**
   - [ ] AI reads docs, follows manually
   - [ ] AI invokes skills programmatically
   - [ ] Human runs workflows via CLI
   - [ ] Mix (explain when which)

3. **DX Improvements Relevance:**
   - [ ] Correct if humans use CLI
   - [ ] Irrelevant if only AI agents use it
   - [ ] Partially relevant (explain)

---

## 🚨 ACTION REQUIRED

**Before continuing:**

1. **User clarifies architecture**
2. **We align implementation to actual use case**
3. **We validate assumptions**

**Current risk:** Building great CLI UX for a tool that AI agents will use, where CLI UX doesn't matter!

---

**Status:** ⏸️ PAUSED - Awaiting architectural clarification  
**Blocker:** Fundamental uncertainty about system purpose and integration

