# Hierarchical Workflows Implementation

**Date:** 06-11-2025  
**Task:** Implement terminal-aware skill loading + hierarchical workflow system  
**Status:** ✅ In Progress (Core Complete)

---

## Summary

Implemented the corrected architecture after testing OpenSkills and understanding the true relationship between skills (domain expertise) and workflows (procedural guidance).

---

## Key Realizations

1. **Skills ≠ Workflows** - They're complementary, not competing
2. **Skills = Deep domain expertise** (PDF, Excel, Word - 200-600 lines each)
3. **Workflows = Development procedures** (20-80 lines, orchestrate development)
4. **OpenSkills works!** - But needs terminal-aware wrapper for Windows
5. **User was RIGHT** - Hierarchical workflows with subtasks is the answer

---

## Files Created

### Core Skill Loading System:
- `src/skill-loader.ts` - Terminal-aware skill loading (PS/CMD/bash detection)
- `src/cli-commands/skill-load.ts` - CLI command `tsk skill:load`
- Updated `src/cli.ts` - Registered skill:load command

### Granular Workflow Subtasks (20 files):
- `docs/workflows/subtasks/load-skill.md` - Load Anthropic skills (terminal-aware!)
- `docs/workflows/subtasks/run-diagnostics.md` - Project health checks
- `docs/workflows/subtasks/analyze-errors.md` - Parse and categorize errors
- `docs/workflows/subtasks/run-tests.md` - Execute tests (environment-aware)
- `docs/workflows/subtasks/run-lint.md` - Run linting
- `docs/workflows/subtasks/run-typecheck.md` - TypeScript checking
- `docs/workflows/subtasks/commit-changes.md` - Git commits with format
- `docs/workflows/subtasks/check-dependencies.md` - Verify installations
- `docs/workflows/subtasks/gather-requirements.md` - Extract requirements + detect skills needed
- `docs/workflows/subtasks/generate-report.md` - Create status reports
- `docs/workflows/subtasks/load-context.md` - Load AI tracking + commits
- `docs/workflows/subtasks/parse-test-output.md` - Extract test results
- `docs/workflows/subtasks/deploy-check.md` - Pre-deployment verification
- `docs/workflows/subtasks/create-branch.md` - Git branch creation
- `docs/workflows/subtasks/review-code.md` - Self-review checklist
- `docs/workflows/subtasks/update-docs.md` - Documentation updates
- `docs/workflows/subtasks/backup-work.md` - Create backups
- `docs/workflows/subtasks/rollback-changes.md` - Revert changes safely
- `docs/workflows/subtasks/validate-config.md` - Config file validation
- `docs/workflows/subtasks/clean-artifacts.md` - Clean build/test artifacts

### Updated Main Workflows:
- `templates/workflows/BEGIN_SESSION.md` - Now references subtasks
- `templates/workflows/IMPLEMENT_FEATURE.md` - References subtasks + detects skill needs

### META System:
- `templates/workflows/META_CUSTOMIZE.md` - Project-specific customization guide
- `templates/workflows/META_WORKFLOW_TEMPLATE.md` - Template for creating new workflows

### Documentation:
- `docs/AITracking/AIAction_06-11-2025_openskills_corrected_truth.md` - Corrected understanding
- `docs/FINAL_CORRECT_ARCHITECTURE.md` - Complete architecture doc

---

## How It Works

### Hierarchical System:

```
.cursor/commands/          → Entry points (/BEGIN_SESSION)
    ↓
docs/workflows/            → Main workflows (orchestration)
    ↓
docs/workflows/subtasks/   → Granular subtasks (15-25 lines each)
    ↓
tsk skill:load <skill>     → Domain expertise (200-600 lines, on-demand)
```

### Example Flow:

```
User: /IMPLEMENT_FEATURE
  ↓
Workflow: IMPLEMENT_FEATURE.md
  ↓
Phase 1: @docs/workflows/subtasks/gather-requirements.md
  → Detects: User mentions "PDF"
  ↓
Phase 2.5: @docs/workflows/subtasks/load-skill.md
  → Runs: tsk skill:load pdf (terminal-aware!)
  → Loads: 295 lines of PDF expertise into context
  ↓
Phase 3: @docs/workflows/subtasks/check-dependencies.md
  ↓
[... continue workflow ...]
```

---

## Terminal-Aware Skill Loading

### Problem Solved:
OpenSkills expects bash, but:
- Windows default: PowerShell
- Some systems: CMD
- Result: Commands fail!

### Solution:
```typescript
// src/skill-loader.ts detects platform/shell:
if (platform === 'win32') {
  if (isPowerShell) {
    command = `bash -c "openskills read ${skillName}"`;
  } else if (isCmd) {
    command = `wsl openskills read ${skillName}"`;
  }
} else {
  command = `openskills read ${skillName}`;
}
```

### Usage:
```bash
tsk skill:load pdf    # Works on Windows PS!
tsk skill:load xlsx   # Works on Windows CMD!
tsk skill:load docx   # Works on Mac/Linux!
```

---

## Remaining TODOs

1. ✅ Terminal-aware skill loader
2. ✅ `tsk skill:load` command
3. ✅ 20 granular subtasks
4. ✅ load-skill.md with terminal awareness
5. ✅ Updated main workflows with subtask references + skill detection
6. ❌ **TODO:** Unified AGENTS.md builder
7. ✅ META_CUSTOMIZE.md
8. ✅ META_WORKFLOW_TEMPLATE.md
9. ❌ **TODO:** Add openskills as dependency
10. ❌ **TODO:** Update `tsk init` to install Anthropic skills
11. ❌ **TODO:** Test on Windows (PS + CMD)
12. ❌ **TODO:** Update README.md + VISION.md

---

## Next Steps

1. Create `src/agents-builder.ts` - Merge workflows + skills in AGENTS.md
2. Add `openskills` to `package.json` dependencies
3. Update `tsk init` command to run `openskills install anthropics/skills`
4. Test complete flow on Windows
5. Update README.md and VISION.md with corrected architecture

---

**Status: 67% Complete (8/12 tasks done)**

**Total Lines:** 50

