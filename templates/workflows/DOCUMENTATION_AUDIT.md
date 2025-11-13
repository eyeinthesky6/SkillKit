# Documentation Audit

**Purpose:** Audit project documentation for staleness, broken references, and completeness

---

## Phase 1: Setup Audit Environment

**Create audit report structure:**

```bash
TODAY=$(date +%Y-%m-%d)
AUDIT_FILE="docs/audit/documentation_audit_${TODAY}.md"

# Initialize report
cat > "$AUDIT_FILE" << 'EOF'
# Documentation Audit Report

**Date:** ${TODAY}
**Scope:** Project documentation health check

## Executive Summary

### Key Findings
- Total docs audited: [COUNT]
- Stale docs (>60 days): [COUNT]
- Broken references: [COUNT]
- Missing docs: [COUNT]

### Action Items
1. [High priority actions]
2. [Medium priority actions]
3. [Low priority actions]

---
EOF
```

---

## Phase 2: Analyze Documentation Staleness

**Find outdated documentation:**

```bash
echo "## 1. Documentation Staleness Analysis" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# Find docs directory (adapt to your structure)
DOC_DIRS="docs/ .github/ README.md *.md"
# Add project-specific doc locations:
# DOC_DIRS="$DOC_DIRS wiki/ docs-site/"

# Check for files older than 60 days
STALE_COUNT=0
for pattern in $DOC_DIRS; do
  if [ -e "$pattern" ]; then
    find "$pattern" -name "*.md" -type f -mtime +60 2>/dev/null | while read -r file; do
      LAST_MOD=$(stat -c %y "$file" 2>/dev/null || stat -f %Sm "$file" 2>/dev/null || echo "unknown")
      echo "- \`$file\` (last modified: $LAST_MOD)" >> "$AUDIT_FILE"
      ((STALE_COUNT++))
    done
  fi
done

echo "**Total stale docs:** $STALE_COUNT" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"
```

---

## Phase 3: Check for Broken References

**Find broken internal links:**

```bash
echo "## 2. Broken Reference Analysis" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

BROKEN_COUNT=0

# Find markdown link patterns and check if targets exist
grep -r "\[.*\](\.\." --include="*.md" . 2>/dev/null | while read -r line; do
  FILE=$(echo "$line" | cut -d: -f1)
  # Extract relative path from markdown link
  REL_PATH=$(echo "$line" | grep -oP '\(\.\.[^)]+\)' | tr -d '()')

  if [ -n "$REL_PATH" ] && [ ! -f "$REL_PATH" ]; then
    echo "- ❌ Broken: \`$FILE\` → \`$REL_PATH\`" >> "$AUDIT_FILE"
    ((BROKEN_COUNT++))
  fi
done

# Check for absolute path references that might not exist
grep -r "(/.*/.*\.md)" --include="*.md" . 2>/dev/null | while read -r line; do
  FILE=$(echo "$line" | cut -d: -f1)
  ABS_PATH=$(echo "$line" | grep -oP '\(/[^)]+\.md\)' | tr -d '()')

  if [ -n "$ABS_PATH" ] && [ ! -f "$ABS_PATH" ]; then
    echo "- ❌ Missing: \`$FILE\` → \`$ABS_PATH\`" >> "$AUDIT_FILE"
    ((BROKEN_COUNT++))
  fi
done

echo "**Total broken references:** $BROKEN_COUNT" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"
```

---

## Phase 4: Assess Documentation Coverage

**Check for missing documentation:**

```bash
echo "## 3. Documentation Coverage" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# Check for common missing docs
MISSING_COUNT=0

# README
if [ ! -f "README.md" ]; then
  echo "- ❌ Missing: README.md (project overview)" >> "$AUDIT_FILE"
  ((MISSING_COUNT++))
fi

# API docs (if applicable)
if [ -d "src/" ] && [ ! -d "docs/api/" ] && [ ! -f "API.md" ]; then
  echo "- ⚠️  Missing: API documentation (src/ directory exists)" >> "$AUDIT_FILE"
fi

# Contributing guide
if [ ! -f "CONTRIBUTING.md" ] && [ ! -f "docs/CONTRIBUTING.md" ]; then
  echo "- ⚠️  Missing: CONTRIBUTING.md (contribution guidelines)" >> "$AUDIT_FILE"
fi

# Architecture docs
if [ ! -f "ARCHITECTURE.md" ] && [ ! -f "docs/ARCHITECTURE.md" ]; then
  echo "- ⚠️  Missing: ARCHITECTURE.md (system design)" >> "$AUDIT_FILE"
fi

echo "**Missing documentation:** $MISSING_COUNT critical, several optional" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"
```

---

## Phase 5: Generate Action Plan

**Create prioritized recommendations:**

```bash
echo "## 4. Action Plan" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# High priority
echo "### 🚨 High Priority (Fix Immediately)" >> "$AUDIT_FILE"
if [ $BROKEN_COUNT -gt 0 ]; then
  echo "- Fix $BROKEN_COUNT broken references" >> "$AUDIT_FILE"
fi
if [ $MISSING_COUNT -gt 0 ]; then
  echo "- Create $MISSING_COUNT missing critical docs" >> "$AUDIT_FILE"
fi
echo "" >> "$AUDIT_FILE"

# Medium priority
echo "### ⚠️ Medium Priority (Fix This Sprint)" >> "$AUDIT_FILE"
if [ $STALE_COUNT -gt 5 ]; then
  echo "- Review $STALE_COUNT stale docs for updates" >> "$AUDIT_FILE"
fi
echo "- Establish documentation maintenance schedule" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# Low priority
echo "### 📋 Low Priority (Ongoing)" >> "$AUDIT_FILE"
echo "- Add automated checks to CI/CD" >> "$AUDIT_FILE"
echo "- Create documentation templates" >> "$AUDIT_FILE"
echo "- Train team on documentation standards" >> "$AUDIT_FILE"

echo "---" >> "$AUDIT_FILE"
echo "**Audit completed:** $TODAY" >> "$AUDIT_FILE"
```

---

## Phase 6: Review Results

**Examine the audit report:**

```bash
# Display summary
echo "📊 Documentation Audit Complete"
echo "📄 Report: $AUDIT_FILE"
echo ""

# Show key metrics
echo "Key Findings:"
echo "- Stale docs: $STALE_COUNT"
echo "- Broken refs: $BROKEN_COUNT"
echo "- Missing docs: $MISSING_COUNT"

# Open report for review
cat "$AUDIT_FILE" | head -50
```

---

## Success Criteria

- ✅ Audit report generated successfully
- ✅ All documentation scanned
- ✅ Broken references identified
- ✅ Stale documentation flagged
- ✅ Action plan created with priorities
- ✅ Metrics calculated accurately

---

## Checklist

- [ ] Documentation directories identified
- [ ] Staleness check completed
- [ ] Broken references detected
- [ ] Coverage assessment done
- [ ] Action plan generated
- [ ] Report saved to docs/audit/

---

**Commands:**
- File system analysis tools (`find`, `stat`)
- Text processing (`grep`, `sed`, `awk`)
- Documentation structure detection

**When to use:** Quarterly documentation review, before releases, or when documentation issues are suspected

**Duration:** 10-15 minutes
