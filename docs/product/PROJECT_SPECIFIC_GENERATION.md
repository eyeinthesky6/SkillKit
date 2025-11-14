# Project-Specific Generation

## Overview

SkillKit generates **project-specific** commands and workflows based on detected languages, tools, and project structure.

## ✅ Commands (`.cursor/commands/*.md`)

### Status: **PROJECT-SPECIFIC** ✅

Workflow files in `.cursor/commands/` are **fully adapted** to each project:

1. **Language Detection** - Detects all languages in the project
2. **Tool Detection** - Identifies linters, formatters, test frameworks
3. **Package Manager Detection** - Finds npm, pnpm, yarn, poetry, etc.
4. **Project Scripts** - Uses scripts from `package.json` or `pyproject.toml`
5. **Monorepo Support** - Handles multi-language monorepos

### How It Works

```typescript
// 1. Analyze project
const analyzer = new MultiLanguageAnalyzer(projectRoot);
const project = await analyzer.analyze();

// 2. Adapt template
const adapter = new WorkflowAdapter(project);
const adapted = adapter.adaptTemplate(templateContent);

// 3. Generate project-specific commands
// - Python projects: poetry run lint, ruff check .
// - TypeScript projects: pnpm run lint, eslint .
// - Mixed: Multi-language sections with cd commands
```

### Example Output

**For Python + TypeScript monorepo:**
```markdown
## Phase 2.1: Language-Specific Setup

**This project uses multiple languages. Run setup for each:**

### PYTHON (.)

```bash
cd .
poetry install
cd -
```

### TYPESCRIPT (apps/web)

```bash
cd apps/web
pnpm install
cd -
```
```

**For TypeScript-only project:**
```markdown
## Phase 2: Setup

```bash
pnpm install
```
```

## ⚠️ Rules (`.cursor/rules/*.mdc`)

### Status: **GENERIC** ⚠️

Currently, rules are **generic** and not project-specific. They contain:
- Workflow routing logic
- General SkillKit commands
- Standard workflow names

### Potential Enhancement

Rules could be enhanced to include:
- Project-specific command patterns
- Language-specific guidelines
- Framework-specific best practices
- Detected tool recommendations

## Report Locations

### ✅ All Reports Go to `docs/` - NOT `.cursor/`

- **Diagnostics:** `docs/skillkit/diagnostics-{timestamp}.{md|json}`
- **Audit Reports:** `docs/audit/audit-report-{date}.{md|json}`
- **TODO Tracker:** `docs/todo-tracker/Comprehensive_TODO_Analysis_{timestamp}.{md|json|html}`

### ❌ Nothing in `.cursor/` Except:

- **Commands:** `.cursor/commands/*.md` (workflow files)
- **Rules:** `.cursor/rules/*.mdc` (IDE rules)

## Verification

### Check Commands Are Project-Specific

```bash
# Generate workflows
tsk workflow --all

# Check generated file
cat .cursor/commands/IMPLEMENT_FEATURE.md

# Should contain project-specific commands:
# - Your package manager (pnpm, poetry, etc.)
# - Your linter (ruff, eslint, etc.)
# - Your test framework (pytest, jest, etc.)
```

### Verify No Reports in .cursor/

```bash
# Should return nothing
find .cursor -name "*.json" -o -name "*report*" -o -name "*.log"
```

## Summary

| Item | Project-Specific? | Location |
|------|------------------|----------|
| **Commands** | ✅ YES | `.cursor/commands/*.md` |
| **Rules** | ⚠️ NO (generic) | `.cursor/rules/*.mdc` |
| **Reports** | N/A | `docs/` subdirectories |
| **Logs** | N/A | `logs/` or `docs/skillkit/` |

