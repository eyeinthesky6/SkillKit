# SkillKit

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/eyeinthesky6/SkillKit/actions/workflows/ci.yml/badge.svg)](https://github.com/eyeinthesky6/SkillKit/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/%40trinity-os%2Fskillkit.svg)](https://badge.fury.io/js/%40trinity-os%2Fskillkit)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![GitHub Discussions](https://img.shields.io/github/discussions/eyeinthesky6/SkillKit)](https://github.com/eyeinthesky6/SkillKit/discussions)
[![OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/projects/0000/badge)](https://bestpractices.coreinfrastructure.org/projects/0000)

**Self-customizing workflow orchestration for AI-assisted development.**

Granular, doc-based workflows that adapt to your project + Anthropic skills integration + Community marketplace.

A cross-platform system that combines intelligent workflows, terminal-aware skill loading, and self-customization into one powerful tool for systematic development.

## 🎯 What's New

**SkillKit** is a self-customizing workflow orchestration system focused on doc-based workflows:

### ✨ Key Features:
- ✅ **13 Production Workflows** - BEGIN_SESSION, IMPLEMENT_FEATURE, FIX_BUGS, SKILLKIT_TASK, and more
- ✅ **Intelligent Task Planning** - `tsk plan` and `tsk task` for automatic skill selection and execution
- ✅ **Auto-Customization** - Workflows automatically adapt to your project during `tsk init`
- ✅ **Self-Customizing** - META workflows adapt to your project automatically
- ✅ **Terminal-Aware** - Cross-platform skill loading (Windows/Mac/Linux)
- ✅ **Community Marketplace** - Install workflows/skills from GitHub with one command
- ✅ **System Auditing** - Comprehensive health checks with auto-fix
- ✅ **Usage Telemetry** - Track skill usage and performance with `tsk stats`
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

### 🎯 Auto-Customization (The Moat!)
- **Automatic During Init** - Workflows adapt to YOUR project during `tsk init`
- **Intelligent Detection** - Detects languages, package managers, test frameworks, linters, formatters
- **Smart Adaptation** - All workflow commands updated to match your environment
- **Manual Override** - Use `--no-auto-customize` to skip, or `/META_CUSTOMIZE` for fine-tuning
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

### 🚀 Automatic Setup (Recommended)

```bash
# Install in your project
cd your-project
npm install @trinity-os/skillkit

# That's it! SkillKit auto-initializes during install:
# ✓ Detects your project (package.json, .git, etc.)
# ✓ Copies 13 workflows to .cursor/commands/ (including SKILLKIT_TASK)
# ✓ Auto-customizes workflows to your project (detects languages, package managers, tools)
# ✓ Installs Anthropic skills (pdf, xlsx, docx, etc.)
# ✓ Generates AGENTS.md catalog
# ✓ Auto-deduplicates any conflicts
# ✓ Ready to use immediately!
```

**Note:** To skip auto-initialization, set `SKILLKIT_NO_AUTO_INIT=true` before install.

### 🛠️ Manual Initialization (Optional)

```bash
# If you need to manually initialize or re-initialize
tsk init --cursor

# Or for non-Cursor projects
tsk init --workflows
```

### 📋 Use Workflows in Cursor

```
Type "/" in Cursor to see available workflows:

/BEGIN_SESSION          → Start session (shows menu!)
/IMPLEMENT_FEATURE      → Build new feature
/FIX_BUGS              → Fix bugs systematically
/DEPLOY_PREP           → Pre-deployment checks
/SKILLKIT_TASK         → Unified task execution (uses tsk plan/task)
/CONTINUE              → Resume from last session
/AUDIT_SKILLKIT        → System health check
/SECURITY_AUDIT        → Security scan
/META_CUSTOMIZE        → Adapt to your project
/HELP                  → Complete documentation
```

### 🎯 Auto-Customization (Automatic!)

```
During tsk init:
✓ Automatically detects your languages (TypeScript, Python, etc.)
✓ Detects package managers (npm/pnpm/yarn/poetry/pip)
✓ Detects tools (ESLint, Prettier, Jest, pytest, etc.)
✓ Adapts ALL workflow templates to YOUR project
✓ Commands like "npm test" become "pnpm test" everywhere

No manual step needed - it just works!
```

### 🧠 Intelligent Task Execution

```bash
# Plan which skill to use for a task
tsk plan "fix all ESLint errors"
# → Analyzes available skills
# → Selects best match with confidence score
# → Shows reasoning

# Execute task through SkillKit
tsk task "fix all ESLint errors"
# → Plans automatically
# → Executes selected skill
# → Logs usage for statistics

# View usage statistics
tsk stats
# → Shows skill usage counts
# → Average execution times
# → Success/failure rates
```

### 🎯 Manual Customization (Optional)

```
In Cursor:
/META_CUSTOMIZE

For advanced customization:
✓ Fine-tune workflow steps
✓ Add project-specific rules
✓ Customize command mappings
```

### 📦 Skills Management

```bash
# Install Anthropic skills (done automatically in init)
tsk install anthropics/skills
# → Interactive checkbox to select skills
# → Installs to .claude/skills/

# Load a skill when needed (MANDATORY for agents)
tsk skill:load pdf
# → Outputs full SKILL.md content (200-600 lines) to terminal
# → AI agent MUST read terminal output to get skill knowledge
# → Works cross-platform (Windows/Mac/Linux)
# → Skills are loaded into context via terminal output

# List installed skills
tsk list

# Install community skills
tsk skills:add alice/db-skills/postgres
# → Auto-downloads, validates, installs
```

**⚠️ Important for AI Agents:**
- Skills are NOT automatically loaded - you MUST run `tsk skill:load <name>` in terminal
- The terminal output contains the full skill instructions
- You MUST read the terminal output to get skill knowledge
- Workflows explicitly require skill loading via terminal commands

### 🛠️ System Commands

```bash
# Intelligent task planning and execution
tsk plan "<task description>"     # Plan which skill to use
tsk task "<task description>"      # Execute task (plan + run)
tsk stats                          # View skill usage statistics

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

# Code quality checks
tsk run-checks
# → Runs lint, typecheck, build
# → Checks circular dependencies (madge)
# → Generates comprehensive report

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
- [Research Enhancements](docs/RESEARCH_ENHANCEMENTS.md) - Academic research integration

## 📚 Research & Attribution

SkillKit incorporates insights from academic research papers on skill learning, task planning, and agent systems:

### Research Papers Integrated

1. **SkillFlow: Efficient Skill and Code Transfer Through Communication**  
   arXiv: [2504.06188](https://arxiv.org/abs/2504.06188)  
   - Modular skill acquisition framework
   - Communication-based skill transfer
   - Applied: Skill composition and dynamic discovery

2. **COALESCE: Economic and Security Dynamics of Skill-Based Task Outsourcing**  
   arXiv: [2506.01900](https://arxiv.org/abs/2506.01900)  
   - Dynamic skill discovery
   - Automated task decomposition
   - Cost-aware skill selection
   - Applied: Task decomposition and cost-aware planning

3. **PolySkill: Learning Generalizable Skills Through Polymorphic Abstraction**  
   arXiv: [2510.15863](https://arxiv.org/abs/2510.15863)  
   Authors: Simon Yu, Gang Li, Weiyan Shi, Peng Qi  
   - Polymorphic abstraction for skill generalization
   - Skill composition and reuse
   - Applied: Skill abstraction layer and composition support

4. **SkillWeaver: Web Agents can Self-Improve by Discovering and Honing Skills**  
   arXiv: [2504.07079](https://arxiv.org/abs/2504.07079)  
   Authors: Boyuan Zheng, Michael Y. Fatemi, Xiaolong Jin, et al.  
   - Self-improvement through skill discovery
   - Skill refinement and optimization
   - Applied: Self-improvement mechanisms and usage-based optimization

**License Note:** All papers are from arXiv and are typically available under licenses that permit commercial use (CC-BY or similar). We recommend verifying specific license terms for each paper before commercial deployment.

**Full Details:** See [Research Enhancements](docs/RESEARCH_ENHANCEMENTS.md) for complete implementation details.

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
- [GitHub Discussions](https://github.com/eyeinthesky6/SkillKit/discussions) - Ask questions
- [Issues](https://github.com/eyeinthesky6/SkillKit/issues) - Report bugs
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
