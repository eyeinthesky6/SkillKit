# Check Customizations & Update Conflicts

**Purpose:** Detect customized workflows/skills and handle update conflicts

**When to use:** Before updating workflows/skills, during audit, or during META_CUSTOMIZE

---

## Step 1: Load Version Metadata

```bash
# Check if SkillKit is installed
if [ -f ".skillkit/version.json" ]; then
  echo "SkillKit version metadata found"
  cat .skillkit/version.json
else
  echo "No version metadata - fresh installation"
fi
```

**Note:** Version metadata tracks:
- Installed version
- Customized files
- Original hashes

---

## Step 2: Detect Customized Files

**For workflows:**
```bash
# Compare each workflow with template
for workflow in .cursor/commands/*.md; do
  workflow_name=$(basename "$workflow")
  template="templates/workflows/$workflow_name"
  
  if [ -f "$template" ]; then
    # Compare content
    if ! diff -q "$workflow" "$template" > /dev/null; then
      echo "⚠️  Customized: $workflow_name"
      # Store customization info
    fi
  fi
done
```

**For skills:**
```bash
# Check each skill directory
for skill_dir in .claude/skills/*/; do
  skill_name=$(basename "$skill_dir")
  
  # Compare SKILL.md with known versions
  if [ -f "$skill_dir/SKILL.md" ]; then
    # Hash comparison
    current_hash=$(md5sum "$skill_dir/SKILL.md" | cut -d' ' -f1)
    # Compare with original hash from version.json
  fi
done
```

---

## Step 3: Check for Updates Available

**Get current SkillKit version:**
```bash
tsk --version
# Or from package.json
node -e "console.log(require('@trinity-os/skillkit/package.json').version)"
```

**Compare with installed version:**
```bash
installed_version=$(jq -r '.version' .skillkit/version.json)
current_version=$(tsk --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')

if [ "$installed_version" != "$current_version" ]; then
  echo "Update available: $installed_version → $current_version"
fi
```

---

## Step 4: Detect Update Failures

**Check for files that failed to update:**
```bash
# Files that differ from templates but weren't marked as customized
for workflow in .cursor/commands/*.md; do
  workflow_name=$(basename "$workflow")
  template="templates/workflows/$workflow_name"
  
  if [ -f "$template" ]; then
    # Check if content differs
    if ! diff -q "$workflow" "$template" > /dev/null; then
      # Check if in customization list
      if ! grep -q "$workflow_name" .skillkit/version.json; then
        echo "⚠️  Update failed (not tracked): $workflow_name"
        echo "   Likely customized by user"
      fi
    fi
  fi
done
```

---

## Step 5: Prompt for Consolidation

**When customization detected:**

**Agent should ask user:**
```
⚠️  Customized file detected: BEGIN_SESSION.md

Current version: 0.0.3 (customized)
Available version: 0.0.5 (standard)

Options:
1. Keep customized version (no update)
2. Update to standard version (lose customizations)
3. Merge versions (consolidate changes)
4. Show diff (see what changed)

What would you like to do?
```

**If user chooses merge:**
- Show diff between versions
- Highlight conflicts
- Ask user to resolve conflicts
- Create merged version

---

## Step 6: Handle Non-Linear Updates

**Detect skipped versions:**
```bash
installed_version=$(jq -r '.version' .skillkit/version.json)
current_version=$(tsk --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')

# Parse versions
installed_major=$(echo $installed_version | cut -d. -f1)
installed_minor=$(echo $installed_version | cut -d. -f2)
installed_patch=$(echo $installed_version | cut -d. -f3)

current_major=$(echo $current_version | cut -d. -f1)
current_minor=$(echo $current_version | cut -d. -f2)
current_patch=$(echo $current_version | cut -d. -f3)

# Check if major/minor versions skipped
if [ "$installed_major" -lt "$current_major" ] || \
   ([ "$installed_major" -eq "$current_major" ] && [ "$installed_minor" -lt "$current_minor" ]); then
  echo "⚠️  Skipped versions detected"
  echo "   Installed: $installed_version"
  echo "   Current: $current_version"
  echo "   May have breaking changes"
fi
```

**For skipped versions:**
- Check CHANGELOG.md for breaking changes
- Warn user about potential issues
- Suggest incremental updates if possible

---

## Step 7: Generate Report

**Create customization report:**
```bash
cat > docs/audit/customizations-$(date +%Y-%m-%d).md << EOF
# Customization & Update Conflict Report

**Date:** $(date +%Y-%m-%d)
**Installed Version:** $(jq -r '.version' .skillkit/version.json)
**Current Version:** $(tsk --version)

## Customized Files

$(for file in .cursor/commands/*.md; do
  if [ -f "templates/workflows/$(basename $file)" ]; then
    if ! diff -q "$file" "templates/workflows/$(basename $file)" > /dev/null; then
      echo "- $(basename $file) (customized)"
    fi
  fi
done)

## Update Conflicts

$(# List files that failed to update)

## Recommendations

1. Review customized files
2. Decide on consolidation strategy
3. Update version metadata after consolidation
EOF
```

---

## Step 8: Update Version Metadata

**After consolidation:**
```bash
# Update .skillkit/version.json with new customizations
tsk sync --update-metadata
```

---

## Agent Instructions

**When running this subtask:**

1. **Always check for customizations first** before updating
2. **Never overwrite customized files** without user confirmation
3. **Always prompt for consolidation** when customization detected
4. **Handle skipped versions** by checking CHANGELOG
5. **Preserve user customizations** unless explicitly told to overwrite
6. **Create backups** before any consolidation

**Example prompt to user:**
```
I found 3 customized workflows that differ from the standard versions:

1. BEGIN_SESSION.md - Customized on 2025-11-05
2. IMPLEMENT_FEATURE.md - Customized on 2025-11-07
3. FIX_BUGS.md - Customized on 2025-11-08

Current SkillKit version: 0.0.5
Your workflows are based on: 0.0.3

Would you like me to:
- [ ] Keep your customizations (no update)
- [ ] Update to standard 0.0.5 (lose customizations)
- [ ] Show diff and merge (consolidate changes)
- [ ] Update only non-customized files

How should I proceed?
```

---

**This subtask ensures user customizations are never lost!**

