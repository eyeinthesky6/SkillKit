# Check Dependencies

**Purpose:** Verify feature dependencies without blocking workflow

---

## Phase 1: Quick Dependency Check

**Non-blocking check - reports issues but continues workflow**

```bash
# Generic dependency check (adapt paths to your project)
FEATURE_ID="$1"

# Find feature-related files
# Example: find src/ -name "*${FEATURE_ID}*" -type f

# Check for basic dependencies
# Example: grep -r "import.*${FEATURE_ID}" src/ --include="*.ts" --include="*.js" --include="*.py"

# Report findings (non-blocking)
echo "Feature ${FEATURE_ID} dependencies checked"
echo "⚠️  Any issues found? Address in normal workflow flow"
```

---

## Phase 2: Advanced Analysis (Optional)

**For complex dependency chains:**

```bash
# Language-specific dependency analysis
# Python: poetry run pydeps your_module --show-deps
# JavaScript: npx dependency-cruiser src/
# TypeScript: npx ts-unused-exports tsconfig.json

# Report results
echo "Advanced dependency analysis complete"
```

---

## Phase 3: Integration Check

**Verify feature integrates properly:**

```bash
# Test imports/compilation
# npm run type-check || yarn type-check || poetry run mypy

# Basic functionality test
# npm test -- --testNamePattern="${FEATURE_ID}" || yarn test --testNamePattern="${FEATURE_ID}"

echo "Integration check complete"
```

---

## Success Criteria

- ✅ Dependencies identified (even if issues found)
- ✅ No workflow blocking
- ✅ Issues logged for normal resolution
- ✅ Feature integration verified

---

**Commands:**
- Language-specific dependency tools
- Import/compilation checks
- Basic functionality tests

**When to use:** Before marking features complete, as non-blocking validation
