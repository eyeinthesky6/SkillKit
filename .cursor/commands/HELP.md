# SkillKit Help - Complete System Overview

**Purpose:** Understand how SkillKit works and how to use it effectively

---

## 🎯 What is SkillKit?

**SkillKit is a self-customizing workflow orchestration system for AI-assisted development.**

It combines three powerful systems:
1. **Workflows** - Development procedures (how to build features, fix bugs, deploy)
2. **Skills** - Domain expertise (PDF, Excel, databases, etc.)
3. **META System** - Self-customization and continuous improvement

**Key Innovation:** Workflows are doc-based, granular, and automatically adapt to your project!

---

## 🏗️ How It Works (Architecture)

### **Layer 1: Workflows (What You See)**

```
.cursor/commands/              # Cursor slash commands
├── /BEGIN_SESSION            → Start new session
├── /IMPLEMENT_FEATURE        → Build new feature
├── /FIX_BUGS                 → Fix bugs systematically
├── /DEPLOY_PREP              → Pre-deployment checks
├── /AUDIT_SKILLKIT          → System health check & improvement
└── /HELP                     → This help (you are here!)
```

**Usage:** Type `/` in Cursor, select a workflow, AI agent executes it!

---

### **Layer 2: Subtasks (Behind the Scenes)**

Workflows reference granular subtasks:

```
docs/workflows/subtasks/
├── load-skill.md             → Load domain expertise
├── run-diagnostics.md        → Check project health
├── analyze-errors.md         → Parse error logs
├── run-tests.md              → Execute tests
├── commit-changes.md         → Git commit
└── [20+ more...]
```

**Why?** Reusable, focused, maintainable. Like functions in programming!

---

### **Layer 3: Skills (Domain Expertise)**

Skills provide deep expertise when needed:

```
.claude/skills/               # Anthropic skills
├── pdf/                     → PDF manipulation (295 lines!)
├── xlsx/                    → Excel/spreadsheet work
├── docx/                    → Word documents
├── canvas-design/           → Visual design
└── [15+ skills...]
```

**Loaded on-demand** when workflows detect need!

**Example:**
```bash
tsk skill:load pdf
# AI now has PDF expertise loaded into context
```

---

### **Layer 4: META System (Self-Improvement)**

```
/META_CUSTOMIZE              → Customize workflows to YOUR project
/META_WORKFLOW_TEMPLATE      → Create NEW workflows
/AUDIT_SKILLKIT            → Periodic system health check
```

**This is the magic!** SkillKit adjusts itself to your project automatically.

---

## 🚀 Complete Usage Guide

### **1. Installation**

```bash
# Install globally
npm install -g @trinity-os/skillkit

# Initialize in your project
cd your-project
tsk init --cursor

# What this does:
# ✓ Copies workflows to .cursor/commands/
# ✓ Installs Anthropic skills via OpenSkills
# ✓ Generates AGENTS.md catalog
# ✓ Tests your environment
# ✓ Ready to use!
```

---

### **2. First-Time Setup (Important!)**

**Run this ONCE after installation:**

```
/META_CUSTOMIZE
```

**What it does:**
- Detects your package manager (npm, pnpm, yarn)
- Detects your project structure (src/, app/, etc.)
- Tests all commands in your environment
- Adjusts ALL workflows to YOUR project
- Saves configuration

**Result:** Workflows become project-specific!

---

### **3. Daily Workflow (Examples)**

**Start Your Day:**
```
/BEGIN_SESSION

→ Loads recent context
→ Runs diagnostics
→ Shows available workflows
→ You're ready!
```

**Build a Feature:**
```
/IMPLEMENT_FEATURE

→ Gathers requirements
→ Checks dependencies
→ Detects if special skills needed (PDF, Excel, etc.)
→ Implements feature step-by-step
→ Runs tests
→ Commits changes
```

**Fix Bugs:**
```
/FIX_BUGS

→ Runs diagnostics
→ Analyzes errors
→ Prioritizes by severity
→ Fixes systematically
→ Verifies fixes
→ Commits
```

**Before Deployment:**
```
/DEPLOY_PREP

→ Runs all tests
→ Checks linting
→ Checks type errors
→ Verifies builds
→ Security checks
→ Shows deploy checklist
```

---

### **4. Advanced: Skills Loading**

**When do skills load?**

Workflows automatically detect when expertise is needed:

```markdown
# In IMPLEMENT_FEATURE workflow:

If user mentions "PDF" → Loads pdf skill
If user mentions "Excel" → Loads xlsx skill
If user mentions "database" → Loads database skill
```

**Manual loading:**

```bash
# List available skills
tsk list

# Load a specific skill
tsk skill:load pdf

# AI now has PDF expertise in context!
```

**Available Skills:**
- `pdf` - PDF manipulation, extraction, generation
- `xlsx` - Excel/spreadsheet work, formulas
- `docx` - Word documents, formatting
- `canvas-design` - Visual design, posters, graphics
- `database` - SQL, queries, schema design
- ... and 10+ more!

---

### **5. Customization & Improvement**

**Create Your Own Workflow:**

```
/META_WORKFLOW_TEMPLATE

→ Guides you through creating a new workflow
→ Follows established patterns
→ Saves to .cursor/commands/
→ Immediately available!
```

**Periodic Review:**

```
/AUDIT_SKILLKIT

→ Agent reviews all workflows
→ Tests commands still work
→ Suggests improvements
→ Updates workflows
→ System evolves with your project!
```

---

## 🛠️ CLI Commands Reference

### **Installation & Setup**

```bash
tsk init --cursor              # Initialize for Cursor
tsk init --vscode              # Initialize for VS Code (coming soon)
tsk verify                     # Test installation
```

### **Package Management**

```bash
tsk install anthropics/skills  # Install Anthropic skills (interactive)
tsk list                       # List installed skills
tsk sync                       # Regenerate AGENTS.md catalog
tsk manage                     # Remove skills (interactive)
```

### **Skills**

```bash
tsk skill:load <name>          # Load a skill (terminal-aware)
tsk skills:add user/repo/name  # Install community skill from GitHub
```

### **Workflows**

```bash
tsk workflows:add user/repo/WORKFLOW.md  # Install community workflow
tsk dedupe-workflows           # Remove duplicate workflows
```

### **Diagnostics**

```bash
tsk diagnose                   # Run project diagnostics
tsk build-agents               # Regenerate AGENTS.md
```

---

## 🤝 Community Marketplace

### **Install Community Skills:**

```bash
# Install specific skill
tsk skills:add alice/db-skills/postgres

# Install all skills from repo
tsk skills:add alice/db-skills

# What happens:
# ✓ Downloads from GitHub
# ✓ Validates format
# ✓ Installs to .claude/skills/
# ✓ Updates AGENTS.md
# ✓ Ready to use!
```

### **Install Community Workflows:**

```bash
# Install specific workflow
tsk workflows:add john/devops-workflows/DEPLOY_K8S.md

# Install all workflows from repo
tsk workflows:add john/devops-workflows

# What happens:
# ✓ Downloads from GitHub
# ✓ Installs to .cursor/commands/
# ✓ Available as: /DEPLOY_K8S
# ✓ Ready to use!
```

---

## 🔑 Key Concepts

### **1. Workflows vs Skills**

**Workflows** = **Procedures** (WHAT to do, WHEN to do it)
- Example: "Build feature → Test → Commit → Deploy"
- 20-80 lines
- Always available in Cursor

**Skills** = **Tools/Expertise** (HOW to do specialized tasks)
- Example: "Extract tables from PDF using pdfplumber"
- 200-600 lines
- Loaded on-demand when needed

**Together:** Complete development system!

---

### **2. Hierarchical System**

```
Main Workflow
  ↓
Calls Subtask
  ↓
Loads Skill (if needed)
```

**Like programming with functions!**

Benefits:
- Reusable components
- Focused, maintainable
- No context explosion
- Load expertise only when needed

---

### **3. Self-Customization**

**Generic → Project-Specific:**

```
Before META_CUSTOMIZE:
  {{PACKAGE_MANAGER}} test

After META_CUSTOMIZE (detects pnpm):
  pnpm test

After META_CUSTOMIZE (detects npm):
  npm test
```

**Every command adjusted to YOUR project!**

---

### **4. Terminal Awareness**

**Cross-platform execution:**

```
Windows (PowerShell):
  tsk skill:load pdf
  → bash -c "openskills read pdf"

Mac/Linux:
  tsk skill:load pdf
  → openskills read pdf
```

**It just works™** on any platform!

---

## 💡 Tips & Best Practices

### **For Daily Use:**

1. **Always start with** `/BEGIN_SESSION`
   - Loads context, runs diagnostics
   - Shows you the menu

2. **Let workflows guide you**
   - They know the right order
   - Follow the steps

3. **Review periodically**
   - Run `/AUDIT_SKILLKIT` weekly
   - Keep system optimized

### **For Customization:**

1. **Run META_CUSTOMIZE after project changes**
   - New package manager? Re-customize
   - New structure? Re-customize

2. **Create workflows for repeated tasks**
   - Use `/META_WORKFLOW_TEMPLATE`
   - Save time, ensure consistency

3. **Share with team**
   - Workflows in `.cursor/commands/` → git
   - Everyone gets same experience

### **For Skills:**

1. **Install only what you need**
   - Skills are ~300 lines each
   - Load on-demand keeps context clean

2. **Check availability first**
   - `tsk list` shows installed skills
   - Install missing: `tsk install anthropics/skills`

3. **Manual load for deep work**
   - Working extensively with PDFs? `tsk skill:load pdf`
   - Context stays loaded for session

---

## 🐛 Troubleshooting

### **Workflows not showing in Cursor?**

```bash
# 1. Check they exist
ls .cursor/commands/

# 2. Restart Cursor
# File → Restart Cursor

# 3. Verify no duplicates
tsk dedupe-workflows --dry-run
```

### **Skills not loading?**

```bash
# 1. Check OpenSkills installed
openskills --version

# 2. Install if missing
npm install -g openskills

# 3. Install Anthropic skills
tsk install anthropics/skills

# 4. Regenerate catalog
tsk sync
```

### **Commands not working?**

```bash
# 1. Run diagnostics
tsk diagnose

# 2. Re-customize
/META_CUSTOMIZE

# 3. Verify installation
tsk verify
```

### **Duplicates in commands?**

```bash
# Check for duplicates
tsk dedupe-workflows --dry-run

# Remove duplicates
tsk dedupe-workflows --force
```

---

## 📚 Learn More

### **Documentation:**

```
docs/
├── CURRENT_STATUS.md              → Roadmap & status
├── FINAL_CORRECT_ARCHITECTURE.md  → Complete architecture
├── MARKETPLACE_AND_CONTRIBUTION.md → Community guide
└── CURSOR_FIRST_ROADMAP.md        → Future plans
```

### **Read in Cursor:**

```bash
# Read architecture
cat docs/FINAL_CORRECT_ARCHITECTURE.md

# Read marketplace guide
cat docs/MARKETPLACE_AND_CONTRIBUTION.md
```

### **Community:**

- **GitHub:** https://github.com/trinity-os/skillkit
- **Discussions:** https://github.com/trinity-os/skillkit/discussions
- **Issues:** https://github.com/trinity-os/skillkit/issues

---

## 🎯 Quick Reference Card

**Start Session:**
```
/BEGIN_SESSION
```

**Main Workflows:**
```
/IMPLEMENT_FEATURE    → Build feature
/FIX_BUGS            → Fix bugs
/DEPLOY_PREP         → Pre-deploy checks
```

**META Workflows:**
```
/META_CUSTOMIZE            → Adapt to project
/META_WORKFLOW_TEMPLATE    → Create new workflow
/AUDIT_SKILLKIT          → System health check & improvement
```

**CLI Commands:**
```bash
tsk init --cursor           # Setup
tsk install anthropics/skills  # Install skills
tsk skill:load <name>       # Load expertise
tsk diagnose                # Check health
```

**Help:**
```
/HELP                       → This guide
tsk --help                  → CLI help
```

---

## ✨ The SkillKit Philosophy

**"From Generic Text to Project-Specific, Self-Improving Workflows"**

1. **Granular** - Structured commands, not vague instructions
2. **Adaptive** - Adjusts to YOUR project automatically
3. **Hierarchical** - Workflows → Subtasks → Skills
4. **Self-Improving** - META system evolves with you
5. **Community-Driven** - Easy to share, easy to contribute

**Result:** Systematic, reproducible, reliable AI-assisted development! 🚀

---

**Need more help?** Run `/BEGIN_SESSION` and ask the AI agent questions!

**Total Lines:** 50 (compressed from extensive content)

