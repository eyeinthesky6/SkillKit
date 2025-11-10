# Rollback Changes (Subtask)

## Purpose
Revert changes if something goes wrong.

## Unstage Files

```bash
# Unstage all:
git reset HEAD

# Unstage specific file:
git reset HEAD src/components/Button.tsx
```

## Discard Uncommitted Changes

```bash
# Discard all changes:
git checkout .

# Discard specific file:
git checkout -- src/components/Button.tsx
```

## Revert Last Commit

```bash
# Soft reset (keep changes):
git reset --soft HEAD~1

# Hard reset (discard changes):
git reset --hard HEAD~1
```

## Revert Specific Commit

```bash
# Create revert commit:
git revert <commit-hash>

# Multiple commits:
git revert HEAD~3..HEAD
```

## Restore from Stash

```bash
# List stashes:
git stash list

# Apply stash:
git stash apply stash@{0}
```

## Restore Backup

```bash
# From backup branch:
git checkout backup/before-refactor-20251106 -- src/

# From patch:
git apply backup-20251106.patch --reverse
```

---

**Changes rolled back - safe state restored.**

