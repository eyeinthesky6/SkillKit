# Documentation Audit - Docs Sync Review

**⚡ TL;DR:** Check docs for outdated content, missing refs, sync issues

**Status**: ✅ ACTIVE - Quarterly or before major release  
**Duration**: 10 minutes  
**Output**: `docs/audit/Documentation_Audit_<DATE>.md`

---

## 📋 **What Gets Checked**

1. **Product Docs** - Feature registry, Product Plan sync
2. **Tech Docs** - Architecture, APIs, contracts current
3. **Quality Docs** - Enforcement rules up-to-date
4. **Cross-References** - No broken links
5. **Date Stamps** - Recent updates, no stale docs

---

## 🔧 **Protocol (10 Minutes)**

```bash
TODAY=$(date +"%d-%m-%Y")
AUDIT_FILE="docs/audit/Documentation_Audit_${TODAY}.md"

echo "# Documentation Audit - ${TODAY}" > "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# 1. Check for outdated docs (> 60 days)
echo "## 1. Stale Documents (> 60 days)" >> "$AUDIT_FILE"
find docs/ -name "*.md" -type f -mtime +60 | head -10 >> "$AUDIT_FILE"

# 2. Check Product Plan sync
echo "## 2. Product Plan Sync" >> "$AUDIT_FILE"
PRODUCT_LAST=$(stat -c %y "docs/Product/Product Plan/Product_Plan.md" 2>/dev/null || stat -f %Sm "docs/Product/Product Plan/Product_Plan.md")
echo "- Last updated: $PRODUCT_LAST" >> "$AUDIT_FILE"

# Check feature registry
REGISTRY_COUNT=$(wc -l < "docs/Product/feature_registry.csv" 2>/dev/null || echo "0")
echo "- Features in registry: $REGISTRY_COUNT" >> "$AUDIT_FILE"

# 3. Check tech docs
echo "## 3. Technical Documentation" >> "$AUDIT_FILE"
for doc in "TECHNICAL_FOUNDATION.md" "IMPORT_PATTERNS_CANONICAL.md" "CONTRACTS_FIRST_ARCHITECTURE_ENFORCEMENT.md"; do
  if [ -f "docs/tech/$doc" ]; then
    LAST=$(stat -c %y "docs/tech/$doc" 2>/dev/null || stat -f %Sm "docs/tech/$doc")
    echo "- $doc: $LAST" >> "$AUDIT_FILE"
  else
    echo "- ❌ MISSING: $doc" >> "$AUDIT_FILE"
  fi
done

# 4. Check for broken references
echo "## 4. Broken References" >> "$AUDIT_FILE"
grep -r "\[.*\](\.\.\/.*\.md)" .cursor/commands/*.md docs/tech/*.md 2>/dev/null | while read -r line; do
  FILE=$(echo "$line" | cut -d: -f1)
  REF=$(echo "$line" | grep -oP '\(\.\.\/.*?\.md\)' | tr -d '()')
  if [ ! -f "$REF" ]; then
    echo "- ❌ Broken: $FILE → $REF" >> "$AUDIT_FILE"
  fi
done

# 5. Check command docs are referenced
echo "## 5. Command Documentation Coverage" >> "$AUDIT_FILE"
ls -1 .cursor/commands/*.md | while read -r cmd; do
  BASENAME=$(basename "$cmd")
  REFS=$(grep -r "$BASENAME" .cursor/commands/*.md | wc -l)
  echo "- $BASENAME: $REFS references" >> "$AUDIT_FILE"
done

# 6. Check agents.yaml sync
echo "## 6. agents.yaml Alignment" >> "$AUDIT_FILE"
AGENTS_LAST=$(stat -c %y "agents.yaml" 2>/dev/null || stat -f %Sm "agents.yaml")
echo "- Last updated: $AGENTS_LAST" >> "$AUDIT_FILE"

# Check if agents.yaml references match actual files
grep -oP '\.cursor/\S+\.md' agents.yaml 2>/dev/null | while read -r ref; do
  if [ ! -f "$ref" ]; then
    echo "- ❌ Missing: $ref (referenced in agents.yaml)" >> "$AUDIT_FILE"
  fi
done

# 7. Summary
echo "" >> "$AUDIT_FILE"
echo "## 📊 Summary" >> "$AUDIT_FILE"
STALE=$(find docs/ -name "*.md" -type f -mtime +60 | wc -l)
BROKEN=$(grep -c "❌ Broken" "$AUDIT_FILE" || echo "0")
echo "- Stale docs: $STALE" >> "$AUDIT_FILE"
echo "- Broken references: $BROKEN" >> "$AUDIT_FILE"

# Action plan
echo "" >> "$AUDIT_FILE"
echo "## 🎯 Action Plan" >> "$AUDIT_FILE"
if [ $STALE -gt 0 ]; then
  echo "- Review $STALE stale documents for archival" >> "$AUDIT_FILE"
fi
if [ $BROKEN -gt 0 ]; then
  echo "- Fix $BROKEN broken references" >> "$AUDIT_FILE"
fi

cat "$AUDIT_FILE"
```

---

## ✅ **Success Criteria**

- ✅ All docs < 60 days old OR in archive
- ✅ No broken cross-references
- ✅ agents.yaml references valid files
- ✅ Feature registry matches Product Plan

---

**Status**: ✅ ACTIVE  
**Frequency**: Quarterly or before release  
**See Also**: `BEGIN_SESSION.md` (task 7)

