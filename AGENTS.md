# AGENTS.md

**AI Agent Guidance for this Project**

---

## 🔄 SkillKit Workflows

**Procedural workflows for development tasks.**

### Available Workflows:

#### /AUDIT_SKILLKIT_-_COMPLETE_SYSTEM_HEALTH_CHECK
- **Purpose:** Comprehensive audit of SkillKit installation for duplicates, broken commands, incorrect workflows, and system integrity
- **Location:** `.cursor/commands/Audit SkillKit - Complete System Health Check.md`

#### /BEGIN_SESSION
- **Purpose:** Start development with context and diagnostics
- **Location:** `.cursor/commands/Begin Session.md`

#### /CONTINUE_WORK
- **Purpose:** Resume from last session
- **Location:** `.cursor/commands/Continue Work.md`

#### /DUPLICATE_CODE_DETECTION
- **Purpose:** Find and consolidate duplicate code
- **Location:** `.cursor/commands/Duplicate Code Detection.md`

#### /DEPLOY_PREPARATION
- **Purpose:** Pre-deployment validation checklist
- **Location:** `.cursor/commands/Deploy Preparation.md`

#### /FIX_BUGS
- **Purpose:** Systematic error fixing
- **Location:** `.cursor/commands/Fix Bugs.md`

#### /SKILLKIT_HELP_-_COMPLETE_SYSTEM_OVERVIEW
- **Purpose:** Understand how SkillKit works and how to use it effectively
- **Location:** `.cursor/commands/SkillKit Help - Complete System Overview.md`

#### /IMPLEMENT_FEATURE
- **Purpose:** Build new features with quality checks
- **Location:** `.cursor/commands/Implement Feature.md`

#### /META:_CUSTOMIZE_SKILLKIT_TO_PROJECT
- **Purpose:** Adapt all SkillKit workflows to this specific project
- **Location:** `.cursor/commands/META: Customize SkillKit to Project.md`

#### /META:_CREATE_NEW_WORKFLOW
- **Purpose:** Template and guide for creating new SkillKit workflows
- **Location:** `.cursor/commands/META: Create New Workflow.md`

#### /SECURITY_AUDIT
- **Purpose:** Security vulnerability check
- **Location:** `.cursor/commands/Security Audit.md`

#### /SYSTEM_AUDIT
- **Purpose:** Complete project health check
- **Location:** `.cursor/commands/System Audit.md`

**How to use:**
- Type the trigger (e.g., `/BEGIN_SESSION`) in Cursor
- Follow the workflow steps
- Workflows reference subtasks for detailed guidance

---

## 📦 Workflow Subtasks

**Granular, reusable components (15-25 lines each).**

### Available Subtasks:

**Testing & Quality:**
- `docs/workflows/subtasks/parse-test-output.md` - Extract structured information from test results.
- `docs/workflows/subtasks/run-lint.md` - Run code linting with environment-aware command detection.
- `docs/workflows/subtasks/run-tests.md` - Execute project tests with proper environment detection.
- `docs/workflows/subtasks/run-typecheck.md` - Run TypeScript type checking without emitting files.

**Git Operations:**
- `docs/workflows/subtasks/backup-work.md` - Create a backup of current work before major changes.
- `docs/workflows/subtasks/commit-changes.md` - Commit code changes with proper message format and verification.
- `docs/workflows/subtasks/create-branch.md` - Create a feature/fix branch with proper naming.
- `docs/workflows/subtasks/rollback-changes.md` - Revert changes if something goes wrong.

**Diagnostics:**
- `docs/workflows/subtasks/analyze-errors.md` - Parse and categorize errors from linter, tests, or build output.
- `docs/workflows/subtasks/check-customizations.md` - 
- `docs/workflows/subtasks/check-dependencies.md` - Verify all project dependencies are installed and up-to-date.
- `docs/workflows/subtasks/deploy-check.md` - Verify project is ready for deployment.
- `docs/workflows/subtasks/run-diagnostics.md` - Run comprehensive project diagnostics to detect errors, warnings, and system health.

**Skills & Domain:**
- `docs/workflows/subtasks/load-context.md` - Load recent project context for AI agent awareness.
- `docs/workflows/subtasks/load-skill.md` - Load Anthropic skill for deep domain expertise when workflow requires specialized knowledge.

**Other:**
- `docs/workflows/subtasks/aitracking.md` - 
- `docs/workflows/subtasks/audit-system.md` - 
- `docs/workflows/subtasks/clean-artifacts.md` - Remove build artifacts and temporary files.
- `docs/workflows/subtasks/gather-requirements.md` - Extract and clarify requirements before implementation.
- `docs/workflows/subtasks/generate-report.md` - Generate project status reports in various formats.
- `docs/workflows/subtasks/review-code.md` - Review code changes before committing.
- `docs/workflows/subtasks/update-docs.md` - Update project documentation to reflect changes.
- `docs/workflows/subtasks/validate-config.md` - Verify project configuration files are valid.

**Referenced by workflows via:** `@docs/workflows/subtasks/[name].md`

---

## 📋 Project Information

**This section should be customized for your project.**

### Tech Stack
- Language: [Your language]
- Package Manager: [npm/yarn/pnpm/pip/etc]
- Test Framework: [jest/pytest/etc]
- Linter: [eslint/pylint/etc]

### Key Commands
```bash
npm install    # Install dependencies
npm test       # Run tests
npm run lint   # Lint code
npm run build  # Build project
```

### Project Structure
```
src/          # Source code
tests/        # Tests
docs/         # Documentation
.cursor/      # SkillKit workflows
```

**💡 Tip:** Run `/META_CUSTOMIZE` to customize this file for your project!

---

## 🚀 Getting Started

1. **Start a session:** Type `/BEGIN_SESSION` in Cursor
2. **Choose a workflow:** Based on what you need to do
3. **Follow the steps:** Workflows guide you through the process
4. **Load skills when needed:** Use `tsk skill:load <skill>` for domain expertise
5. **Customize:** Run `/META_CUSTOMIZE` to tailor SkillKit to your project

---

*Generated by SkillKit 2.0 - Terminal-aware workflow orchestration + Anthropic skills integration*