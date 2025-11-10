# Check Feature Dependencies (Non-Blocking)

**⚡ ONE-LINER:** Checks chain, reports errors, continues workflow

---

## 📋 **Add This to Phase 7**

```bash
FEATURE_ID="YOUR-ID"

# Check chain
grep -r "$FEATURE_ID" packages/ apps/ --include="*.ts" | cut -d: -f1 | sort -u

# Check errors (LINT + TYPE-CHECK)
pnpm run lint 2>&1 | grep -E "error|✖" > /tmp/chain-lint.log
pnpm run type-check 2>&1 | grep "error TS" > /tmp/chain-type.log
LINT_ERR=$(wc -l < /tmp/chain-lint.log)
TYPE_ERR=$(wc -l < /tmp/chain-type.log)

if [ $LINT_ERR -gt 0 ] || [ $TYPE_ERR -gt 0 ]; then
  echo "⚠️  DEPENDENCY CHAIN: $LINT_ERR lint + $TYPE_ERR type errors"
  echo "⚠️  Recorded for review"
  
  # Record issue (but don't block)
  cat /tmp/chain-lint.log /tmp/chain-type.log | head -20 > /tmp/chain_issues_$(date +%Y%m%d).log
  cat /tmp/chain_issues_$(date +%Y%m%d).log
  
  # Exit 0 to not stop workflow
  exit 0
else
  echo "✅ CHAIN CLEAN: 0 lint + 0 type errors"
  exit 0
fi
```

---

## 🎯 **Non-Blocking Behavior**

**Agent behavior:**
1. Runs check inline
2. Reports findings (warnings, not errors)
3. **Continues to next step** (never stops)
4. Agent addresses issues in normal flow

**Key:** Always exits 0 (guardrail, not roadblock)

