# Sprint Planning - Feature Prioritization

**⚡ TL;DR:** Analyze features, errors, velocity → Create sprint plan

**Status**: ✅ ACTIVE - Start of sprint or mid-sprint review  
**Duration**: 15 minutes  
**Output**: `docs/SprintStatus/Sprint_Plan_<DATE>.md`

---

## 📋 **What Gets Analyzed**

1. **Feature Status** - Complete vs incomplete from registry
2. **Error Distribution** - Which features causing most errors
3. **Velocity** - Features completed last sprint
4. **Blockers** - Dependencies, missing specs
5. **Priority** - User impact, dependencies, effort

---

## 🔧 **Protocol (15 Minutes)**

```bash
TODAY=$(date +"%d-%m-%Y")
PLAN_FILE="docs/SprintStatus/Sprint_Plan_${TODAY}.md"

echo "# Sprint Plan - ${TODAY}" > "$PLAN_FILE"
echo "" >> "$PLAN_FILE"

# 1. Feature status overview
echo "## 1. Feature Status Overview" >> "$PLAN_FILE"
TOTAL_FEATURES=$(tail -n +2 docs/Product/feature_registry.csv | wc -l)
COMPLETE=$(grep -c ",COMPLETE," docs/Product/feature_registry.csv || echo "0")
INCOMPLETE=$(grep -c ",INCOMPLETE," docs/Product/feature_registry.csv || echo "0")
IN_PROGRESS=$(grep -c ",IN_PROGRESS," docs/Product/feature_registry.csv || echo "0")

echo "- Total features: $TOTAL_FEATURES" >> "$PLAN_FILE"
echo "- Complete: $COMPLETE ($(($COMPLETE * 100 / $TOTAL_FEATURES))%)" >> "$PLAN_FILE"
echo "- In progress: $IN_PROGRESS" >> "$PLAN_FILE"
echo "- Incomplete: $INCOMPLETE" >> "$PLAN_FILE"
echo "" >> "$PLAN_FILE"

# 2. Error distribution by feature
echo "## 2. Features by Error Count" >> "$PLAN_FILE"
pnpm run type-check 2>&1 | tee /tmp/type-errors.log
grep -o "src/services/[^(]*" /tmp/type-errors.log | sort | uniq -c | sort -rn | head -10 | \
  while read -r count file; do
    FEATURE=$(grep -m1 "@feature" "$file" 2>/dev/null | grep -oP '@feature:\K[A-Z0-9-]+')
    echo "- $FEATURE: $count errors ($file)" >> "$PLAN_FILE"
  done
echo "" >> "$PLAN_FILE"

# 3. Last sprint velocity
echo "## 3. Last Sprint Velocity" >> "$PLAN_FILE"
LAST_SPRINT=$(find docs/SprintStatus/ -name "Sprint Status-*.md" -type f -mtime -14 | head -1)
if [ -n "$LAST_SPRINT" ]; then
  COMPLETED_LAST=$(grep -c "✅.*Complete" "$LAST_SPRINT" || echo "0")
  echo "- Features completed last sprint: $COMPLETED_LAST" >> "$PLAN_FILE"
else
  echo "- No recent sprint data" >> "$PLAN_FILE"
fi
echo "" >> "$PLAN_FILE"

# 4. Blockers
echo "## 4. Current Blockers" >> "$PLAN_FILE"
grep -rE "BLOCKED|WAITING|DEPENDENCY" docs/Product/feature_registry.csv docs/tech/service-catalog.csv 2>/dev/null | \
  head -5 >> "$PLAN_FILE" || echo "- None identified" >> "$PLAN_FILE"
echo "" >> "$PLAN_FILE"

# 5. Recommended priorities (data-driven)
echo "## 5. Recommended Sprint Goals" >> "$PLAN_FILE"
echo "" >> "$PLAN_FILE"

# Get top 3 features by error count
echo "### Priority 1: High Error Features (Fix First)" >> "$PLAN_FILE"
grep -o "src/services/[^(]*" /tmp/type-errors.log | sort | uniq -c | sort -rn | head -3 | \
  while read -r count file; do
    FEATURE=$(grep -m1 "@feature" "$file" 2>/dev/null | grep -oP '@feature:\K[A-Z0-9-]+')
    if [ -n "$FEATURE" ]; then
      FEATURE_NAME=$(grep "^$FEATURE," docs/Product/feature_registry.csv | cut -d',' -f2)
      echo "- **$FEATURE** ($FEATURE_NAME) - $count errors" >> "$PLAN_FILE"
    fi
  done
echo "" >> "$PLAN_FILE"

# Get incomplete features
echo "### Priority 2: In-Progress Features (Complete)" >> "$PLAN_FILE"
grep ",IN_PROGRESS," docs/Product/feature_registry.csv | head -3 | \
  while IFS=',' read -r id name status rest; do
    echo "- **$id** ($name)" >> "$PLAN_FILE"
  done
echo "" >> "$PLAN_FILE"

# New features (if low error rate)
if [ $(grep -c "error TS" /tmp/type-errors.log) -lt 50 ]; then
  echo "### Priority 3: New Features (Low Error State)" >> "$PLAN_FILE"
  grep ",PLANNED," docs/Product/feature_registry.csv | head -3 | \
    while IFS=',' read -r id name status rest; do
      echo "- **$id** ($name)" >> "$PLAN_FILE"
    done
fi
echo "" >> "$PLAN_FILE"

# 6. Sprint capacity estimate
echo "## 6. Sprint Capacity" >> "$PLAN_FILE"
echo "- Duration: 2 weeks" >> "$PLAN_FILE"
echo "- Team velocity: ~$COMPLETED_LAST features/sprint (based on last sprint)" >> "$PLAN_FILE"
echo "- Recommended focus: 3-5 features this sprint" >> "$PLAN_FILE"
echo "" >> "$PLAN_FILE"

# 7. Action items
echo "## 7. Action Items" >> "$PLAN_FILE"
echo "- [ ] Review and approve sprint goals" >> "$PLAN_FILE"
echo "- [ ] Assign features to team members" >> "$PLAN_FILE"
echo "- [ ] Update feature_registry.csv with IN_PROGRESS status" >> "$PLAN_FILE"
echo "- [ ] Create execution logs: \`docs/audit/Feature_Fix_Execution_<FEATURE-ID>_<DATE>.md\`" >> "$PLAN_FILE"

cat "$PLAN_FILE"
```

---

## ✅ **Success Criteria**

- ✅ Feature status quantified (complete/incomplete/in-progress)
- ✅ Error distribution mapped to features
- ✅ Priority based on data, not guesses
- ✅ Sprint goals realistic (3-5 features)

---

**Status**: ✅ ACTIVE  
**Frequency**: Start of sprint (bi-weekly)  
**See Also**: `BEGIN_SESSION.md` (task 9)

