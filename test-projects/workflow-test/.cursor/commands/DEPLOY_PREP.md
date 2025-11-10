# Deploy Preparation

**Purpose:** Pre-deployment validation checklist

---

---
## ⚠️ NO MOCKS, NO STUBS
---

## Phase 1: Full System Check

```bash
tsk exec quality-gate
```

**What this does:** Runs lint + typecheck + tests + build

**Stop if:** Any check fails

---

## Phase 2: Build Verification

```bash
tsk exec build
```

**What this does:** Ensures clean build

**Check:**
- Build completes without errors
- All assets generated
- Output directory correct

---

## Phase 3: Dependency Check

**For Node.js:**
```bash
npm audit
npm outdated
```

**For Python:**
```bash
pip-audit || pip check
```

**For Java:**
```bash
mvn dependency:analyze
```

**What this does:** Checks for security issues and outdated deps

---

## Phase 4: Git Status

```bash
git status
git log --oneline -5
```

**Verify:**
- No uncommitted changes
- On correct branch
- Pushed to remote

---

## Phase 5: Documentation Check

**Quick scan:**
- README up to date?
- CHANGELOG updated?
- API docs current?

---

## Phase 6: Final Validation

```bash
tsk exec quality-gate
```

**Requirements:**
- ✅ All tests passing
- ✅ Build successful
- ✅ No security issues
- ✅ Git clean
- ✅ Docs updated

**If all pass:** Ready to deploy

---

**Commands:**
- `tsk exec quality-gate` - Full validation
- `tsk exec build` - Build check
- `npm audit` / `pip-audit` - Security
