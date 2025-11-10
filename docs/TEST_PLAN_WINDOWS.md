# Windows Testing Plan - SkillKit 2.0

**Date:** 07-11-2025  
**Version:** 2.0.0  
**Environment:** Windows 10/11, PowerShell

---

## 🎯 Test Objectives

Verify complete end-to-end flow on Windows:
1. Package builds successfully
2. CLI commands work
3. Workflows install correctly
4. Cursor integration works
5. Skills integration works
6. Marketplace commands work

---

## 📋 Test Checklist

### **Phase 1: Build & Install (Local Testing)**

- [ ] Build package: `npm run build`
- [ ] Check for TypeScript errors
- [ ] Verify dist/ output
- [ ] Test CLI locally: `node dist/cli.js --version`
- [ ] Link package locally: `npm link`
- [ ] Test global command: `tsk --version`

### **Phase 2: Core CLI Commands**

- [ ] `tsk init` - Initialize SkillKit in test project
- [ ] `tsk verify` - Verify installation
- [ ] `tsk diagnose` - Run diagnostics
- [ ] `tsk list` - List installed skills
- [ ] `tsk sync` - Sync AGENTS.md
- [ ] `tsk build-agents` - Build unified AGENTS.md

### **Phase 3: Workflows Installation**

- [ ] Check `.cursor/commands/` created
- [ ] Verify 10 workflows copied:
  - [ ] BEGIN_SESSION.md
  - [ ] IMPLEMENT_FEATURE.md
  - [ ] FIX_BUGS.md
  - [ ] DEPLOY_PREP.md
  - [ ] CONTINUE.md
  - [ ] AUDIT_SKILLKIT.md
  - [ ] SECURITY_AUDIT.md
  - [ ] META_CUSTOMIZE.md
  - [ ] META_WORKFLOW_TEMPLATE.md
  - [ ] HELP.md

### **Phase 4: Skills Integration**

- [ ] `tsk skill:load pdf` - Terminal-aware skill loading
- [ ] Check OpenSkills installed as dependency
- [ ] Verify `.claude/skills/` directory
- [ ] Check AGENTS.md includes skills

### **Phase 5: Audit System**

- [ ] `tsk audit` - Run system audit
- [ ] Check audit report generated
- [ ] Verify health score displayed
- [ ] `tsk audit:fix --dry-run` - Test auto-fix
- [ ] `tsk dedupe-workflows` - Test deduplication

### **Phase 6: Marketplace Commands**

- [ ] `tsk skills:add anthropics/skills` - Install community skill
- [ ] `tsk workflows:add user/repo/WORKFLOW.md` - Install workflow
- [ ] Verify validation works
- [ ] Check conflict detection

### **Phase 7: Cursor Integration (Manual)**

- [ ] Open test project in Cursor
- [ ] Type `/BEGIN_SESSION` - Verify command appears
- [ ] Type `/HELP` - Verify help loads
- [ ] Type `/IMPLEMENT_FEATURE` - Verify workflow loads
- [ ] Check subtask references work

### **Phase 8: Subtasks**

- [ ] Verify `docs/workflows/subtasks/` exists
- [ ] Check 20+ subtasks present
- [ ] Verify subtask references in workflows

---

## 🧪 Test Scenarios

### **Scenario 1: Fresh Install**
```powershell
# Create test directory
mkdir C:\temp\skillkit-test
cd C:\temp\skillkit-test

# Initialize new project
npm init -y

# Install SkillKit (local link for now)
npm link @trinity-os/skillkit

# Initialize
tsk init

# Expected: 
# - .cursor/commands/ created with 10 workflows
# - docs/workflows/subtasks/ with 20+ subtasks
# - AGENTS.md generated
# - No errors
```

### **Scenario 2: Skill Loading**
```powershell
# Load a skill
tsk skill:load pdf

# Expected:
# - Cross-platform command executed
# - Skill info displayed
# - No errors on Windows
```

### **Scenario 3: Audit & Fix**
```powershell
# Run audit
tsk audit

# Expected:
# - Health check runs
# - Score displayed (0-100)
# - Report generated in .skillkit/audits/

# Auto-fix (dry run)
tsk audit:fix --dry-run

# Expected:
# - Shows what would be fixed
# - No actual changes
```

### **Scenario 4: Workflow Usage in Cursor**
```
1. Open Cursor IDE
2. Open test project
3. Type: /BEGIN_SESSION
4. Verify: Workflow appears in command palette
5. Execute: Workflow loads in chat
6. Check: Subtask references work
7. Check: Skill loading instructions present
```

---

## ✅ Success Criteria

All tests must pass:
- ✅ No build errors
- ✅ All CLI commands work on Windows PowerShell
- ✅ Workflows install correctly
- ✅ Cursor integration works
- ✅ Skills integration works
- ✅ Terminal-aware commands execute correctly
- ✅ No Windows-specific path issues
- ✅ Audit system works
- ✅ Marketplace commands work

---

## 🐛 Known Issues to Verify Fixed

- [x] Windows ESM path bug (fixed in executor.ts)
- [x] PowerShell `&&` syntax (using `;` instead)
- [x] Path separators (using `path.join()`)
- [ ] Any new issues found during testing

---

## 📊 Test Results

**Status:** Testing in progress...

### Results:
- Phase 1 (Build): ⏳ Pending
- Phase 2 (CLI): ⏳ Pending
- Phase 3 (Workflows): ⏳ Pending
- Phase 4 (Skills): ⏳ Pending
- Phase 5 (Audit): ⏳ Pending
- Phase 6 (Marketplace): ⏳ Pending
- Phase 7 (Cursor): ⏳ Pending
- Phase 8 (Subtasks): ⏳ Pending

---

**Test Duration:** TBD  
**Tester:** AI Agent  
**Environment:** Windows 10/11, PowerShell, Cursor IDE

