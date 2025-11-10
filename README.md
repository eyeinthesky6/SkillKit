# SkillKit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/trinity-os/skillkit/actions/workflows/ci.yml/badge.svg)](https://github.com/trinity-os/skillkit/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/%40trinity-os%2Fskillkit.svg)](https://badge.fury.io/js/%40trinity-os%2Fskillkit)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub Discussions](https://img.shields.io/github/discussions/trinity-os/skillkit)](https://github.com/trinity-os/skillkit/discussions)
[![OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/projects/0000/badge)](https://bestpractices.coreinfrastructure.org/projects/0000)

**Self-customizing workflow orchestration for AI-assisted development.**

Granular, doc-based workflows that adapt to your project + Anthropic skills integration + Community marketplace.

A cross-platform system that combines intelligent workflows, terminal-aware skill loading, and self-customization into one powerful tool for systematic development.

## 🎯 What's New

**SkillKit** is a self-customizing workflow orchestration system focused on doc-based workflows:

### ✨ Key Features:
- ✅ **12 Production Workflows** - BEGIN_SESSION, IMPLEMENT_FEATURE, FIX_BUGS, and more
- ✅ **Self-Customizing** - META workflows adapt to your project automatically
- ✅ **Terminal-Aware** - Cross-platform skill loading (Windows/Mac/Linux)
- ✅ **Community Marketplace** - Install workflows/skills from GitHub with one command
- ✅ **System Auditing** - Comprehensive health checks with auto-fix
- ✅ **Anthropic Skills** - Integrated PDF, Excel, database expertise on-demand

### 🚀 IDE Support Status:
- ✅ **Cursor**: Full support with slash commands (`/BEGIN_SESSION`, `/IMPLEMENT_FEATURE`)
- 🔜 **VS Code**: CLI + tasks.json (coming soon)
- 🔜 **Other IDEs**: Universal AGENTS.md support (roadmap)

## What Makes SkillKit Unique?

**The Self-Customizing Workflow System:**

### 🔄 Hierarchical Workflows
- **Main Workflows** - Multi-step procedures (`/IMPLEMENT_FEATURE`, `/FIX_BUGS`)
- **Subtasks** - Reusable components (22 granular subtasks)
- **Skills** - Domain expertise (PDF, Excel, databases via Anthropic)
- **Hierarchical** - Like functions in programming, workflows call subtasks call skills

### 🎯 Self-Customization (The Moat!)
- **META_CUSTOMIZE** - Automatically adapts workflows to YOUR project
- **Detects** - Package manager (npm/pnpm/yarn), project structure, tech stack
- **Adjusts** - All commands updated to match your environment
- **Evolves** - REVIEW_SKILLKIT continuously improves based on your usage

### 🌐 Terminal-Aware Cross-Platform
- **Smart Execution** - Detects shell (PowerShell/CMD/Bash/Zsh)
- **Auto-Translates** - Commands work everywhere (Windows/Mac/Linux)
- **Skill Loading** - `tsk skill:load pdf` works on any platform
- **No Configuration** - Just works™

### 🏪 Community Marketplace
- **One Command Install** - `tsk skills:add user/repo/skill-name`
- **GitHub-Based** - Free, distributed, no central server
- **Auto-Validate** - Checks format before installing
- **Easy Share** - Publish to GitHub, others install instantly

## Installation

```bash
# Using npm
npm install @trinity-os/skillkit

# Using yarn
yarn add @trinity-os/skillkit

# Using pnpm
pnpm add @trinity-os/skillkit
```

## Quick Start

### 🚀 Initialize in Your Project

```bash
# Install globally
npm install -g @trinity-os/skillkit

# Initialize in your project (Cursor)
cd your-project
tsk init --cursor

# What this does:
# ✓ Copies 12 workflows to .cursor/commands/
# ✓ Installs Anthropic skills (pdf, xlsx, docx, etc.)
# ✓ Generates AGENTS.md catalog
# ✓ Auto-deduplicates any conflicts
# ✓ Ready to use!
```

### 📋 Use Workflows in Cursor

```
Type "/" in Cursor to see available workflows:

/BEGIN_SESSION          → Start session (shows menu!)
/IMPLEMENT_FEATURE      → Build new feature
/FIX_BUGS              → Fix bugs systematically
/DEPLOY_PREP           → Pre-deployment checks
/CONTINUE              → Resume from last session
/AUDIT_SKILLKIT        → System health check
/SECURITY_AUDIT        → Security scan
/META_CUSTOMIZE        → Adapt to your project
/HELP                  → Complete documentation
```

### 🎯 Self-Customize to Your Project

```
In Cursor:
/META_CUSTOMIZE

What it does:
✓ Detects your package manager (npm/pnpm/yarn)
✓ Detects your project structure (src/, app/, etc.)
✓ Tests all commands in your environment
✓ Updates ALL workflows to match YOUR project
✓ Workflows become project-specific!

Result: Commands like "npm test" become "pnpm test" everywhere
```

### 📦 Skills Management

```bash
# Install Anthropic skills (done automatically in init)
tsk install anthropics/skills
# → Interactive checkbox to select skills
# → Installs to .claude/skills/

# Load a skill when needed
tsk skill:load pdf
# → AI gets PDF expertise in context
# → Works cross-platform (Windows/Mac/Linux)

# List installed skills
tsk list

# Install community skills
tsk skills:add alice/db-skills/postgres
# → Auto-downloads, validates, installs
```

### 🛠️ System Commands

```bash
# Run diagnostics
tsk diagnose
# → Auto-detects project type
# → Runs lint, typecheck, tests
# → Shows issues

# System audit
tsk audit
# → Checks for duplicates
# → Validates workflows
# → Tests commands
# → Generates health score

# Auto-fix safe issues
tsk audit:fix --auto-safe

# Sync AGENTS.md
tsk sync
```

### 🏪 Community Marketplace

```bash
# Install community workflows
tsk workflows:add john/devops-workflows/DEPLOY_K8S.md
# → Downloads from GitHub
# → Installs to .cursor/commands/
# → Available as /DEPLOY_K8S

# Install community skills
tsk skills:add alice/enterprise-skills/database
# → Downloads from GitHub
# → Installs to .claude/skills/
# → Updates AGENTS.md
```

## Documentation

### Getting Started
- Type `/HELP` in Cursor - Complete interactive documentation
- [Workflow System Explained](docs/WORKFLOW_SYSTEM_EXPLAINED.md) - How CLI, workflows, and subtasks work
- [Current Status](docs/PROJECT_STATUS_FINAL.md) - What's implemented
- [Marketplace & Contribution](docs/MARKETPLACE_AND_CONTRIBUTION.md) - Community guide

### Architecture & Vision
- [Final Correct Architecture](docs/FINAL_CORRECT_ARCHITECTURE.md) - The complete system
- [Cursor-First Roadmap](docs/CURSOR_FIRST_ROADMAP.md) - Development roadmap
- [Skill Update Strategy](docs/SKILL_UPDATE_STRATEGY.md) - How updates work

### For Contributors
- [Contributing Guidelines](CONTRIBUTING.md) - How to contribute
- **[Marketplace Guide](docs/MARKETPLACE_AND_CONTRIBUTION.md)** - Publish your workflows/skills
- Topic tags: `skillkit-workflow`, `skillkit-skill` on GitHub

## Community & Marketplace

### Find Community Content
Search GitHub for:
- Topic: `skillkit-workflow` - Community workflows
- Topic: `skillkit-skill` - Community skills
- Or browse: [Awesome SkillKit](https://github.com/search?q=topic%3Askillkit) (coming soon)

### Share Your Work
```bash
# 1. Create repo with your workflows/skills
# 2. Add topic: skillkit-workflow or skillkit-skill
# 3. Share in GitHub Discussions
# 4. Others install with: tsk workflows:add your-username/repo
```

### Get Help
- [GitHub Discussions](https://github.com/trinity-os/skillkit/discussions) - Ask questions
- [Issues](https://github.com/trinity-os/skillkit/issues) - Report bugs
- Type `/HELP` in Cursor - Complete documentation

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all our contributors who have helped make this project better.
- Special thanks to our early adopters and beta testers.

## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://github.com/sponsors/jai-thakur)]

## Contributors ✨

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/jai-thakur"><img src="https://avatars.githubusercontent.com/u/your-username?v=4" width="100px;" alt="Jai Thakur"/><br /><sub><b>Jai Thakur</b></sub></a><br />💻 🚇 🐛</td>
    </tr>
  </tbody>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
