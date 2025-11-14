# Cross-Platform Testing Plan - Bash & CMD

**Date:** 07-11-2025  
**Version:** 0.0.1  
**Goal:** Verify SkillKit works on Bash and CMD (in addition to PowerShell)

---

## 🎯 Test Objectives

1. Verify terminal detection works correctly
2. Test command execution on different shells
3. Verify path handling (forward/backward slashes)
4. Test skill loading commands
5. Verify init command works
6. Test audit and other CLI commands

---

## 📋 Test Environments

### Windows Environments:
1. **PowerShell** ✅ (Already tested)
2. **CMD** (Command Prompt) ⏳ To test
3. **Git Bash** (Bash on Windows) ⏳ To test
4. **WSL** (Bash on Linux subsystem) ⏳ Optional

---

## 🧪 Test Scenarios

### Scenario 1: Terminal Detection
**Test:** Verify `skill-loader.ts` detects shell correctly

**Commands to test:**
- PowerShell: `$env:SHELL` or `$PSVersionTable`
- CMD: `echo %COMSPEC%`
- Bash: `echo $SHELL`

**Expected:** Skill loader detects correct shell and formats commands accordingly

---

### Scenario 2: Init Command
**Test:** `tsk init --all` works in all shells

**Test in:**
- [ ] CMD
- [ ] Git Bash
- [ ] PowerShell (already tested ✅)

**Expected:**
- Creates `.cursor/commands/` directory
- Copies 12 workflows
- Copies 21 subtasks
- Generates AGENTS.md
- No path errors

---

### Scenario 3: Skill Loading
**Test:** `tsk skill:load pdf` works in all shells

**Test in:**
- [ ] CMD
- [ ] Git Bash
- [ ] PowerShell (already tested ✅)

**Expected:**
- Detects shell correctly
- Formats command for that shell
- Executes without errors

---

### Scenario 4: Path Handling
**Test:** Path separators work correctly

**Test:**
- Windows paths: `C:\Projects\SkillKit`
- Relative paths: `./docs/workflows`
- Mixed paths: `docs\workflows/subtasks`

**Expected:**
- Uses `path.join()` correctly
- No forward/backward slash issues
- Works in all shells

---

### Scenario 5: CLI Commands
**Test:** All CLI commands work

**Commands to test:**
- `tsk --version`
- `tsk diagnose`
- `tsk audit`
- `tsk list`
- `tsk build-agents`

**Expected:** All commands execute without shell-specific errors

---

## 🔍 Key Areas to Test

### 1. Terminal-Aware Skill Loading
**File:** `src/skill-loader.ts`

**What to check:**
- Detects PowerShell vs CMD vs Bash
- Formats commands correctly:
  - PowerShell: `openskills read pdf`
  - CMD: `openskills read pdf` (same, but different execution)
  - Bash: `bash -c "openskills read pdf"`

### 2. Path Resolution
**Files:** All files using `path.join()`

**What to check:**
- No hardcoded `/` or `\`
- Uses Node.js `path` module
- Works across platforms

### 3. Command Execution
**Files:** `src/cli-commands/*.ts`

**What to check:**
- No shell-specific syntax (`&&`, `;`, etc.)
- Uses Node.js `child_process` correctly
- Handles errors properly

---

## 📊 Test Results Template

### CMD (Command Prompt)
```
Environment: Windows CMD
Version: Windows 10/11
Status: ⏳ Testing...

- [ ] tsk --version
- [ ] tsk init --all
- [ ] tsk skill:load pdf
- [ ] tsk diagnose
- [ ] tsk audit
- [ ] Path handling
```

### Git Bash
```
Environment: Git Bash on Windows
Version: Git for Windows
Status: ⏳ Testing...

- [ ] tsk --version
- [ ] tsk init --all
- [ ] tsk skill:load pdf
- [ ] tsk diagnose
- [ ] tsk audit
- [ ] Path handling
```

---

## 🐛 Known Issues to Watch For

1. **Path Separators:**
   - Windows uses `\`, Unix uses `/`
   - Solution: Use `path.join()` everywhere ✅

2. **Command Separators:**
   - PowerShell: `;` or newline
   - CMD: `&` or `&&`
   - Bash: `;` or `&&`
   - Solution: Use Node.js exec, not shell commands ✅

3. **Environment Variables:**
   - PowerShell: `$env:VAR`
   - CMD: `%VAR%`
   - Bash: `$VAR`
   - Solution: Use `process.env.VAR` ✅

---

## ✅ Success Criteria

All tests must pass:
- ✅ Commands work in CMD
- ✅ Commands work in Git Bash
- ✅ Path handling correct
- ✅ No shell-specific errors
- ✅ Terminal detection accurate

---

**Test Duration:** ~30 minutes  
**Tester:** AI Agent  
**Status:** Ready to execute

