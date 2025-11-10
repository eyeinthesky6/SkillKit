# Workflows Reference - Integrated

**Status:** ✅ Fully integrated into SkillKit v1.2.0

> **Note:** This folder contains the original workflow templates provided as reference material.  
> All workflows have been cleaned, simplified, and integrated into SkillKit core.

---

## What Was Done

The workflows from this reference package have been:

1. **Extracted and cleaned** - Removed ProfitPilot-specific references
2. **Made cross-platform** - Added Windows/Linux/Mac compatible commands
3. **Simplified** - Reduced verbosity, kept only actionable steps
4. **Integrated** - Built into SkillKit's `tsk init` command

---

## New Workflows

Created in `templates/workflows/`:

1. **BEGIN_SESSION.md** - Session start with diagnostics
2. **IMPLEMENT_FEATURE.md** - Feature development workflow
3. **FIX_BUGS.md** - Systematic bug fixing
4. **DEPLOY_PREP.md** - Pre-deployment checks
5. **DEDUP.md** - Duplicate code detection
6. **CONTINUE.md** - Resume last work
7. **SYSTEM_AUDIT.md** - Full project audit
8. **SECURITY_AUDIT.md** - Security checks

---

## Environment-Aware Installation

The `tsk init` command now:

- **Detects Cursor IDE** - Creates `.cursor/commands/` files
- **Detects VS Code** - Can create workspace-level workflows
- **Custom headers** - Allows project-specific rules (e.g., "NO MOCKS")
- **Creates rules** - Generates `.cursor/rules/skillkit-workflows.mdc`
- **Decision tree** - Installs `docs/WORKFLOW_DECISION_TREE.md` for agents

### Usage

```bash
# Interactive setup (recommended)
tsk init

# Full setup for Cursor
tsk init --all --custom-header "NO MOCKS, NO STUBS"

# Just workflows
tsk init --workflows

# Cursor integration only
tsk init --cursor --rules
```

---

## Key Improvements

### 1. Cross-Platform Commands

**Old (ProfitPilot-specific):**
```bash
npm run lint
npm run typecheck
```

**New (cross-platform):**
```bash
tsk exec lint       # Works on any project type
tsk exec typecheck  # TypeScript, Python, Java, Go
```

### 2. Concise Instructions

**Old:** Multiple paragraphs of explanation

**New:** 
```markdown
## Step 1: Run Diagnostics

tsk diagnose

**What this does:** Checks project health
```

### 3. Custom Headers

Projects can inject their own rules:

```markdown
---
## ⚠️ NO MOCKS, NO STUBS
---
```

### 4. Agent Decision Logic

Clear routing based on error counts:
- `ERROR_COUNT > 50` → Force FIX_BUGS
- `ERROR_COUNT > 10` → Suggest fix first
- `ERROR_COUNT = 0` → Ready for features

---

## Agent Experience

### In Cursor IDE:

1. User types `/` in chat
2. Selects `BEGIN_SESSION`
3. Agent runs diagnostics
4. Agent shows menu
5. User selects option (e.g., "1" for new feature)
6. Agent routes to `@IMPLEMENT_FEATURE.md`
7. Agent follows phases step-by-step

### From CLI:

```bash
# Run diagnostics
tsk diagnose

# Execute specific workflow
tsk exec implement-feature

# Check decision tree
cat docs/WORKFLOW_DECISION_TREE.md
```

---

## Files Reference

### Templates
- `templates/workflows/*.md` - Base workflow templates

### Generated (after `tsk init`)
- `.cursor/commands/*.md` - Cursor slash-commands
- `.cursor/rules/skillkit-workflows.mdc` - Agent rules
- `docs/WORKFLOW_DECISION_TREE.md` - Routing logic
- `docs/AITracking/` - Work logs
- `docs/audit/` - Audit reports

---

## What's Different from Original

| Original | SkillKit |
|----------|----------|
| ProfitPilot hardcoded | Project-agnostic |
| npm-only | Cross-language (TS/Py/Java/Go) |
| Manual execution | `tsk` commands |
| Verbose | Concise |
| No custom headers | Custom header support |
| Static | Environment-aware |

---

## Next Steps

1. Run `tsk init --all` in your project
2. Add custom header if needed: `--custom-header "YOUR RULES"`
3. In Cursor, type `/` and select `BEGIN_SESSION`
4. Follow the workflow

---

**Original package preserved here for reference only.**
All functionality is now in SkillKit core.
