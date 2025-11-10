# Duplicate Code Detection

**Purpose:** Find and consolidate duplicate code

---

## {{CUSTOM_HEADER}}
<!-- Project-specific rules -->
---

## Phase 1: Scan for Duplicates

**For JavaScript/TypeScript:**
```bash
npx jscpd src/ --min-lines 10 --min-tokens 50 --reporters json --output /tmp/dedup.json
```

**For Python:**
```bash
pylint --disable=all --enable=duplicate-code src/
```

**For Java:**
```bash
pmd cpd --minimum-tokens 50 --files src/
```

**What this does:** Finds repeated code blocks

---

## Phase 2: Review Results

**Check for:**
- Files with >80% similarity
- Code blocks >20 lines repeated
- Same logic in multiple places

---

## Phase 3: Record Issues

```bash
tsk record-issue --type duplicate --file "path/file.ts" \
  --description "Duplicate of other/file.ts:30-50"
```

**What this does:** Logs duplicate for tracking

---

## Phase 4: Consolidation Strategy

**Options:**
1. Extract to shared function/utility
2. Create base class / composition
3. Use configuration instead of code
4. Remove redundant implementations

**Choose best fit for each case**

---

## Phase 5: Implement Consolidation

1. Extract common code
2. Update all references
3. Remove duplicates
4. Run tests after each change

---

## Phase 6: Verify

```bash
tsk exec test
tsk check-issues --type duplicate
```

**Requirements:**
- Tests still passing
- Duplicates resolved
- No new issues

---

**Commands:**
- `npx jscpd` / `pylint` / `pmd cpd` - Detect
- `tsk record-issue` - Track
- `tsk check-issues` - Verify
- `tsk exec test` - Validate

