# Backup Work (Subtask)

## Purpose
Create a backup of current work before major changes.

## Git Stash

```bash
# Stash current changes:
git stash push -m "WIP: Before refactoring Button"

# List stashes:
git stash list

# Apply later:
git stash pop
```

## Create Backup Branch

```bash
# Before dangerous operation:
git branch backup/before-refactor-$(date +%Y%m%d)

# Or tag:
git tag backup-$(date +%Y%m%d-%H%M)
```

## Export Patch

```bash
# Create patch file:
git diff > backup-$(date +%Y%m%d).patch

# Apply later:
git apply backup-20251106.patch
```

## File System Backup

```bash
# Copy specific files:
cp src/components/Button.tsx src/components/Button.tsx.backup

# Or directory:
cp -r src src.backup.$(date +%Y%m%d)
```

---

**Backup created - proceed safely.**

