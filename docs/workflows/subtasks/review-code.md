# Review Code (Subtask)

## Purpose
Review code changes before committing.

## Self-Review Checklist

### 1. Functionality
- [ ] Code does what it's supposed to
- [ ] Edge cases handled
- [ ] Error handling in place

### 2. Code Quality
- [ ] No hardcoded values
- [ ] DRY principle followed
- [ ] Clear variable names
- [ ] Functions are focused

### 3. Testing
- [ ] Tests added/updated
- [ ] Tests pass locally
- [ ] Coverage maintained

### 4. Documentation
- [ ] Comments where needed
- [ ] README updated if needed
- [ ] API docs current

## Commands

```bash
# Show changes:
git diff

# Show staged changes:
git diff --cached

# Show specific file:
git diff src/components/Button.tsx
```

## Review Output

```bash
# Summary of changes:
git diff --stat

#  src/components/Button.tsx     | 25 +++++++---
#  tests/Button.test.ts           | 45 +++++++++++++++++
#  2 files changed, 65 insertions(+), 5 deletions(-)
```

---

**Review complete - proceed to commit.**

