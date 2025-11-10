# Create Branch (Subtask)

## Purpose
Create a feature/fix branch with proper naming.

## Naming Convention

**Format:** `<type>/<description>`

**Types:**
- `feature/` - New functionality
- `fix/` - Bug fixes
- `refactor/` - Code improvements
- `docs/` - Documentation
- `test/` - Test additions
- `chore/` - Maintenance

## Commands

```bash
# Create and checkout:
git checkout -b feature/add-loading-button

# Or separate:
git branch feature/add-loading-button
git checkout feature/add-loading-button
```

## Verify

```bash
# Check current branch:
git branch --show-current

# Should output: feature/add-loading-button
```

---

**Branch created - proceed with changes.**

