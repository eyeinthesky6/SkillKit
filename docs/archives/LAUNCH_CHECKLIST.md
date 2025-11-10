# SkillKit v1.1 Launch Checklist

## Pre-Launch Tests

### ✅ Core Functionality
- [ ] Build succeeds (`pnpm build`)
- [ ] All tests pass (`pnpm test`)
- [ ] No TypeScript errors
- [ ] No linting errors

### ✅ CLI Commands
- [ ] `tsk discover` - Shows project commands
- [ ] `tsk list-workflows` - Shows workflows
- [ ] `tsk explain quality-gate` - Shows adaptation reasoning
- [ ] `tsk suggest` - Shows recommendations
- [ ] `tsk init --cursor` - Creates Cursor integration

### ✅ Intelligence Layer
- [ ] ProjectAnalyzer detects TypeScript + Zod
- [ ] WorkflowAdapter adapts based on architecture
- [ ] Reasoning explains WHY steps were added

### ✅ Cross-Language Support
- [ ] Works on TypeScript project (this repo)
- [ ] Works on Python project (test-projects/python-project)
- [ ] Discovers different commands correctly

### ✅ Integration
- [ ] Cursor integration creates .cursor/commands/
- [ ] AGENTS.md equivalent files created
- [ ] Commands work from Cursor slash menu

---

## Launch Steps

### 1. Final Build & Test
```bash
# Run launch test
powershell -ExecutionPolicy Bypass -File test-launch.ps1

# Or manually:
pnpm build
pnpm test
pnpm lint
```

### 2. Version Bump
```bash
# Update version to 1.1.0
npm version 1.1.0

# Or manually update package.json:
# "version": "1.1.0"
```

### 3. Git Commit
```bash
git add .
git commit -m "feat: v1.1.0 - Intelligence Layer + Cross-Language Support

- Add ProjectAnalyzer (architecture detection)
- Add WorkflowAdapter (workflow adaptation)
- Add CommandMapper (cross-language command discovery)
- Add WorkflowExecutor (workflow execution)
- Add WorkflowRouter (intent routing)
- Add CursorIntegration (IDE integration)
- Add 8 new CLI commands
- Support TypeScript, Python, Java, Go
- Add explain command (shows reasoning)
- Test Python project included"
```

### 4. Tag Release
```bash
git tag v1.1.0
git push origin main
git push origin v1.1.0
```

### 5. Publish (Optional)
```bash
# If publishing to npm
npm publish
```

### 6. Update Documentation
- [ ] Update CHANGELOG.md with v1.1.0 features
- [ ] Update README.md with new commands
- [ ] Update docs/getting-started.md

---

## Post-Launch

### Announce
- [ ] Update project README with v1.1.0 features
- [ ] Document new architecture in docs/
- [ ] Create demo video/GIF showing:
  - `tsk explain` showing adaptation
  - Cross-language support (TS → Python)
  - Cursor integration

### Monitor
- [ ] Test on real projects
- [ ] Gather feedback
- [ ] Track issues

---

## Known Limitations (Document)

1. **Architecture Detection**
   - Currently scans up to 50 files for patterns
   - May miss patterns in large codebases
   - Solution: Add caching or config override

2. **Command Discovery**
   - Relies on standard tool configs
   - Custom build systems may not be detected
   - Solution: Allow manual command mapping

3. **Workflow Adaptation**
   - Predefined workflows only (quality-gate, deploy-prep, etc.)
   - No custom workflow composition yet
   - Solution: v1.2 feature - custom workflows

---

## Success Criteria

✅ **Must Have:**
- [ ] Build succeeds
- [ ] All core commands work
- [ ] Works on 2+ languages
- [ ] Cursor integration works

✅ **Nice to Have:**
- [ ] All tests green
- [ ] Documentation complete
- [ ] Examples for all features

---

## Launch Commands

```bash
# Quick launch test
powershell -ExecutionPolicy Bypass -File test-launch.ps1

# Full test suite
pnpm test
pnpm build
pnpm lint

# Manual smoke test
node dist/cli.js discover
node dist/cli.js explain quality-gate
node dist/cli.js init --cursor
```

---

## Rollback Plan

If launch fails:
1. Revert to v1.0.0: `git checkout v1.0.0`
2. Document issues
3. Fix in develop branch
4. Re-test before next launch

---

**Ready to launch when all checkboxes are ✅!**

