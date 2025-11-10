# Welcome to SkillKit

**Self-customizing workflow orchestration for AI-assisted development.**

SkillKit enables developers and AI agents to execute systematic, repeatable development procedures with doc-based workflows that automatically adapt to your project.

## What is SkillKit?

SkillKit is a **self-customizing workflow orchestration system** that combines:

- ✅ **Hierarchical Workflows** - Main workflows → Subtasks → Skills
- ✅ **Self-Customization** - META workflows adapt to YOUR project automatically
- ✅ **Terminal-Aware** - Cross-platform execution (Windows/Mac/Linux)
- ✅ **Community Marketplace** - Install workflows/skills from GitHub
- ✅ **Anthropic Skills** - Deep domain expertise on-demand

## Quick Start

```bash
# Install SkillKit
pnpm add @trinity-os/skillkit

# Initialize in your project
npx tsk init

# Start using workflows in Cursor
# Type /BEGIN_SESSION or /IMPLEMENT_FEATURE
```

## Key Concepts

### Workflows
Multi-step procedures executed via Cursor slash commands:
- `/BEGIN_SESSION` - Start development with context
- `/IMPLEMENT_FEATURE` - Build features systematically
- `/FIX_BUGS` - Fix errors methodically
- `/META_CUSTOMIZE` - Adapt workflows to your project

### Subtasks
Reusable building blocks referenced by workflows:
- `load-context.md` - Load project context
- `run-tests.md` - Execute tests
- `commit-changes.md` - Git operations

### Skills
Domain expertise (PDF, Excel, databases) via Anthropic integration:
- `tsk skill:load pdf` - PDF manipulation expertise
- `tsk skill:load excel` - Excel operations
- `tsk skill:load database` - Database queries

## What Makes SkillKit Unique?

**The Self-Customizing Workflow System** - No other tool adapts itself to your project automatically through META workflows.

## Next Steps

- [Getting Started](getting-started) - Installation and setup
- [Workflows](workflows/introduction) - Understanding the workflow system
- [Skills](skills/introduction) - Using and creating skills
- [CLI Commands](cli/init) - Command reference

