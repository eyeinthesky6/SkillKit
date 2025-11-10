# Commit Changes (Subtask)

## Purpose
Commit code changes with proper message format and verification.

## Pre-Commit Checks

```bash
# Verify clean state:
git status

# Stage specific files (recommended):
git add src/components/Button.tsx
git add tests/Button.test.ts

# Or stage all (if confident):
git add .
```

## Commit Message Format

**Template:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructure
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**

```bash
git commit -m "feat(button): add loading state with spinner"

git commit -m "fix(api): handle timeout errors correctly"

git commit -m "test(auth): add login flow integration tests"
```

## Atomic Commits

**DO:** One logical change per commit

```bash
git commit -m "feat(button): add loading state"
# Then:
git commit -m "test(button): add loading state tests"
```

**DON'T:** Mix unrelated changes

```bash
# Bad:
git commit -m "fix multiple issues and add features"
```

## Verification

```bash
# Check commit:
git log -1 --stat

# Verify changes:
git show HEAD

# If wrong, amend:
git commit --amend -m "corrected message"
```

## Post-Commit

**Note:** Post-commit hook will automatically update AITracking (if installed via `tsk init`)

**Manual updates:**

```bash
# Update sprint status:
echo "$(date +%d-%m-%Y): Implemented Button loading state" >> docs/SprintStatus/Sprint_Status-$(date +%d-%m-%Y).md

# Update AITracking log (if not auto-updated):
COMMIT_HASH=$(git rev-parse --short HEAD)
echo "## 📦 Commit: $COMMIT_HASH" >> "$LOG_FILE"
echo "**Message:** $(git log -1 --pretty=%B)" >> "$LOG_FILE"

# Optional: Push (only if approved):
# git push origin <branch>
```

**See:** @docs/workflows/subtasks/aitracking.md for AITracking details

---

**Return to main workflow after commit complete.**

