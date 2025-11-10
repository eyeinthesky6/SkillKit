# Changelog

All notable changes to SkillKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-11-07

### 🎉 Initial Release

First public release of SkillKit - Terminal-aware workflow orchestration for AI-assisted development.

### Added

#### Core System
- ✅ Terminal-aware skill loading (Windows/Mac/Linux)
- ✅ Hierarchical workflow system (Main → Subtasks → Skills)
- ✅ Unified AGENTS.md generation
- ✅ OpenSkills/Anthropic skills integration
- ✅ Self-customization through META workflows
- ✅ Community marketplace (GitHub-based)

#### CLI Commands (15+)
- `tsk init` - Initialize SkillKit in project
- `tsk install` - Install skills from GitHub
- `tsk list` - List installed skills
- `tsk sync` - Sync AGENTS.md
- `tsk manage` - Manage skills
- `tsk skill:load` - Load skill (terminal-aware)
- `tsk skills:add` - Install community skills
- `tsk workflows:add` - Install community workflows
- `tsk audit` - System health check
- `tsk audit:fix` - Auto-fix safe issues
- `tsk dedupe-workflows` - Remove duplicates
- `tsk diagnose` - Project diagnostics
- `tsk build-agents` - Regenerate AGENTS.md
- `tsk validate-workflow` - Validate workflow structure
- `tsk discover` - Discover project patterns
- `tsk suggest` - Get workflow suggestions
- `tsk exec` - Execute workflows
- `tsk explain` - Explain workflow
- `tsk workflow` - Generate workflow templates
- `tsk list-skills` - List discoverable skills
- `tsk stats` - Summarize audit logs
- `tsk gen-skill` - Generate skill scaffold
- `tsk completion` - Generate shell completion

#### Core Workflows (12)
- BEGIN_SESSION.md - Start development session
- IMPLEMENT_FEATURE.md - Feature implementation
- FIX_BUGS.md - Bug fixing workflow
- DEPLOY_PREP.md - Pre-deployment checks
- DEDUP.md - Duplicate code detection
- CONTINUE.md - Resume last work
- SYSTEM_AUDIT.md - System health check
- SECURITY_AUDIT.md - Security review
- META_CUSTOMIZE.md - Project customization
- META_WORKFLOW_TEMPLATE.md - Workflow creation template
- HELP.md - Complete system documentation
- AUDIT_SKILLKIT.md - Guided system audit

#### Subtasks (22)
- load-skill.md - Terminal-aware skill loading
- run-diagnostics.md - Project diagnostics
- analyze-errors.md - Error analysis
- run-tests.md - Test execution
- run-lint.md - Lint checks
- run-typecheck.md - Type checking
- commit-changes.md - Git commits
- deploy-check.md - Deployment validation
- generate-report.md - Report generation
- parse-test-output.md - Test output parsing
- gather-requirements.md - Requirements gathering
- check-dependencies.md - Dependency checking
- load-context.md - Context loading
- backup-work.md - Work backup
- rollback-changes.md - Change rollback
- validate-config.md - Configuration validation
- clean-artifacts.md - Artifact cleaning
- review-code.md - Code review
- update-docs.md - Documentation updates
- create-branch.md - Branch creation
- audit-system.md - System audit logic

#### Features
- 🔄 Self-customizing workflows adapt to YOUR project
- 🌐 Cross-platform compatibility (Windows/Mac/Linux)
- 🏪 GitHub-based marketplace for community content
- 🔍 Comprehensive audit system with auto-fix
- 📚 Complete help system and documentation
- ✅ Auto-deduplication of workflows
- 🎯 Conflict prevention for workflows and skills
- 📊 Health scoring and reporting

#### Documentation
- Complete README with architecture
- VISION.md with positioning
- WORKFLOW_SYSTEM_EXPLAINED.md
- MARKETPLACE_AND_CONTRIBUTION.md
- SKILL_UPDATE_STRATEGY.md
- PROJECT_STATUS_FINAL.md
- CONFLICT_PREVENTION.md
- TEST_RESULTS_WINDOWS.md

### Technical Details
- Built with TypeScript
- Cross-platform support (Windows, macOS, Linux)
- Terminal-aware command execution (PowerShell, CMD, Bash, Zsh)
- IDE integration: Cursor (full support), VS Code (planned)
- Anthropic skills integration via OpenSkills
- Git submodule for automatic skill updates

### Known Limitations
- OpenSkills auto-install requires global OpenSkills package
- Full VS Code support coming in next release
- Mac/Linux testing in progress

---

## [Unreleased]

### Planned for 0.1.0
- VS Code full support
- Additional community workflows
- Enhanced error messages
- Demo video and tutorials
- Mac/Linux comprehensive testing

---

**Initial Release Date:** November 7, 2025  
**License:** MIT  
**Repository:** https://github.com/trinity-os/skillkit
