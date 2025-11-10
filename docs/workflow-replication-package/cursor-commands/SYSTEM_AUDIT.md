# System Audit - Full Codebase Review

**⚡ TL;DR:** Run all quality checks, analyze results, create action plan

**Status**: ✅ ACTIVE - Pre-deployment or monthly review  
**Duration**: 15-20 minutes  
**Output**: `docs/audit/System_Audit_<DATE>.md`

---

## 📋 **What Gets Checked**

1. **Architecture** - Contracts, layers, boundaries
2. **Type Safety** - TypeScript errors, `any` usage
3. **Dependencies** - Outdated, vulnerabilities, duplicates
4. **Code Quality** - Complexity, duplication, dead code
5. **Build/Tests** - Build success, test coverage
6. **Circular Deps** - Import cycles

---

## 🔧 **Protocol (15 Minutes)**

### **Step 1: Run All Checks (10 min)**

```bash
TODAY=$(date +"%d-%m-%Y")
AUDIT_FILE="docs/audit/System_Audit_${TODAY}.md"

echo "# System Audit Report - ${TODAY}" > "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"
echo "**Started:** $(date +"%H:%M")" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# 1. Architecture compliance
echo "## 1. Architecture Compliance" >> "$AUDIT_FILE"
pnpm run arch:check 2>&1 | tee -a "$AUDIT_FILE"

# 2. Type safety
echo "## 2. Type Safety" >> "$AUDIT_FILE"
pnpm run type-check 2>&1 | tee /tmp/type-check.log
echo "- Errors: $(grep -c 'error TS' /tmp/type-check.log || echo '0')" >> "$AUDIT_FILE"
grep "error TS" /tmp/type-check.log | head -20 >> "$AUDIT_FILE"

# 3. ESLint quality
echo "## 3. Code Quality (ESLint)" >> "$AUDIT_FILE"
pnpm run lint 2>&1 | tee /tmp/lint.log
echo "- Errors: $(grep -c 'error' /tmp/lint.log || echo '0')" >> "$AUDIT_FILE"
grep "error" /tmp/lint.log | head -20 >> "$AUDIT_FILE"

# 4. Dependencies
echo "## 4. Dependencies" >> "$AUDIT_FILE"
pnpm audit --audit-level=moderate 2>&1 | tee /tmp/audit.log
echo "- Vulnerabilities: $(grep -c 'vulnerabilities' /tmp/audit.log || echo '0')" >> "$AUDIT_FILE"

# 5. Circular dependencies
echo "## 5. Circular Dependencies" >> "$AUDIT_FILE"
pnpm exec madge --circular packages/shared/src 2>&1 | tee /tmp/circular.log
echo "- Cycles: $(grep -c 'Circular' /tmp/circular.log || echo '0')" >> "$AUDIT_FILE"

# 6. Build status
echo "## 6. Build Status" >> "$AUDIT_FILE"
pnpm run build 2>&1 | tee /tmp/build.log
BUILD_STATUS=$?
echo "- Status: $([ $BUILD_STATUS -eq 0 ] && echo '✅ Pass' || echo '❌ Fail')" >> "$AUDIT_FILE"

# 7. Contracts validation
echo "## 7. Contracts Validation" >> "$AUDIT_FILE"
pnpm run contracts:validate 2>&1 | tee -a "$AUDIT_FILE"

# 8. Schema duplication
echo "## 8. Schema Analysis" >> "$AUDIT_FILE"
pnpm run schemas:analyze 2>&1 | tee -a "$AUDIT_FILE"
```

---

### **Step 2: Analyze Results (3 min)**

```bash
echo "## 📊 Summary" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# Count issues
TYPE_ERRORS=$(grep -c 'error TS' /tmp/type-check.log || echo '0')
LINT_ERRORS=$(grep -c 'error' /tmp/lint.log || echo '0')
VULNERABILITIES=$(grep -oP '\d+(?= vulnerabilities)' /tmp/audit.log | head -1 || echo '0')
CIRCULAR_DEPS=$(grep -c 'Circular' /tmp/circular.log || echo '0')

echo "| Category | Count | Status |" >> "$AUDIT_FILE"
echo "|----------|-------|--------|" >> "$AUDIT_FILE"
echo "| Type Errors | $TYPE_ERRORS | $([ $TYPE_ERRORS -eq 0 ] && echo '✅' || echo '❌') |" >> "$AUDIT_FILE"
echo "| Lint Errors | $LINT_ERRORS | $([ $LINT_ERRORS -eq 0 ] && echo '✅' || echo '❌') |" >> "$AUDIT_FILE"
echo "| Vulnerabilities | $VULNERABILITIES | $([ $VULNERABILITIES -eq 0 ] && echo '✅' || echo '⚠️') |" >> "$AUDIT_FILE"
echo "| Circular Deps | $CIRCULAR_DEPS | $([ $CIRCULAR_DEPS -eq 0 ] && echo '✅' || echo '❌') |" >> "$AUDIT_FILE"
echo "| Build | - | $([ $BUILD_STATUS -eq 0 ] && echo '✅' || echo '❌') |" >> "$AUDIT_FILE"
```

---

### **Step 3: Create Action Plan (2 min)**

```bash
echo "" >> "$AUDIT_FILE"
echo "## 🎯 Action Plan" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# Priority ranking
if [ $TYPE_ERRORS -gt 50 ] || [ $BUILD_STATUS -ne 0 ]; then
  echo "### 🔴 CRITICAL (Fix Immediately)" >> "$AUDIT_FILE"
  echo "- Fix type errors ($TYPE_ERRORS found)" >> "$AUDIT_FILE"
  echo "- Fix build failures" >> "$AUDIT_FILE"
  echo "- Command: \`.cursor/commands/fix-all.md\`" >> "$AUDIT_FILE"
  echo "" >> "$AUDIT_FILE"
fi

if [ $CIRCULAR_DEPS -gt 0 ]; then
  echo "### 🟡 HIGH (Fix This Sprint)" >> "$AUDIT_FILE"
  echo "- Remove circular dependencies ($CIRCULAR_DEPS cycles)" >> "$AUDIT_FILE"
  echo "- Review: \`pnpm exec madge --circular packages/shared/src\`" >> "$AUDIT_FILE"
  echo "" >> "$AUDIT_FILE"
fi

if [ $VULNERABILITIES -gt 0 ]; then
  echo "### 🟠 MEDIUM (Fix This Week)" >> "$AUDIT_FILE"
  echo "- Update vulnerable dependencies ($VULNERABILITIES found)" >> "$AUDIT_FILE"
  echo "- Command: \`pnpm audit fix\`" >> "$AUDIT_FILE"
  echo "" >> "$AUDIT_FILE"
fi

if [ $LINT_ERRORS -gt 0 ]; then
  echo "### 🟢 LOW (Ongoing)" >> "$AUDIT_FILE"
  echo "- Fix lint errors ($LINT_ERRORS found)" >> "$AUDIT_FILE"
  echo "- Command: \`pnpm run lint --fix\`" >> "$AUDIT_FILE"
fi

echo "" >> "$AUDIT_FILE"
echo "**Completed:** $(date +"%H:%M")" >> "$AUDIT_FILE"

# Display summary
cat "$AUDIT_FILE"
```

---

## 📊 **Output Example**

```markdown
# System Audit Report - 04-11-2025

**Started:** 10:30

## 📊 Summary
| Category | Count | Status |
|----------|-------|--------|
| Type Errors | 42 | ❌ |
| Lint Errors | 15 | ❌ |
| Vulnerabilities | 3 | ⚠️ |
| Circular Deps | 0 | ✅ |
| Build | - | ✅ |

## 🎯 Action Plan
### 🔴 CRITICAL (Fix Immediately)
- Fix type errors (42 found)
- Command: `.cursor/commands/fix-all.md`

### 🟠 MEDIUM (Fix This Week)
- Update vulnerable dependencies (3 found)
- Command: `pnpm audit fix`

**Completed:** 10:45
```

---

## ✅ **Success Criteria**

- ✅ All checks run without failures
- ✅ Results logged to `docs/audit/System_Audit_<DATE>.md`
- ✅ Action plan created with priorities
- ✅ User knows what to fix next

---

**Status**: ✅ ACTIVE  
**Frequency**: Monthly or pre-deployment  
**See Also**: `SECURITY_AUDIT.md`, `TECH_DEBT_ANALYSIS.md`

