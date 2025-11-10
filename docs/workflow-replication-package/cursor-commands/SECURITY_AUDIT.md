# Security Audit - Security Review

**⚡ TL;DR:** Check deps, secrets, auth, OWASP top 10

**Status**: ✅ ACTIVE - Pre-deployment or monthly  
**Duration**: 10 minutes  
**Output**: `docs/audit/Security_Audit_<DATE>.md`

---

## 📋 **What Gets Checked**

1. **Dependencies** - Vulnerabilities (high/critical)
2. **Secrets** - Hardcoded keys, tokens, passwords
3. **Authentication** - Auth middleware, token validation
4. **Environment** - .env files, config exposure
5. **OWASP Top 10** - Injection, XSS, CSRF, etc.

---

## 🔧 **Protocol (10 Minutes)**

```bash
TODAY=$(date +"%d-%m-%Y")
AUDIT_FILE="docs/audit/Security_Audit_${TODAY}.md"

echo "# Security Audit - ${TODAY}" > "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# 1. Dependency vulnerabilities
echo "## 1. Dependency Vulnerabilities" >> "$AUDIT_FILE"
pnpm audit --audit-level=high 2>&1 | tee /tmp/security-audit.log
HIGH=$(grep -c 'high' /tmp/security-audit.log || echo "0")
CRITICAL=$(grep -c 'critical' /tmp/security-audit.log || echo "0")
echo "- High: $HIGH" >> "$AUDIT_FILE"
echo "- Critical: $CRITICAL" >> "$AUDIT_FILE"
echo "" >> "$AUDIT_FILE"

# 2. Hardcoded secrets (basic patterns)
echo "## 2. Hardcoded Secrets Check" >> "$AUDIT_FILE"
grep -rE "(password|api_key|secret|token|auth_token)\s*=\s*['\"][^'\"]{20,}" \
  packages/ apps/ --include="*.ts" --include="*.js" 2>/dev/null | \
  grep -v ".test." | head -10 >> "$AUDIT_FILE" || echo "- ✅ None found" >> "$AUDIT_FILE"

# 3. .env file exposure
echo "## 3. Environment Files" >> "$AUDIT_FILE"
find . -name ".env*" -type f | grep -v node_modules | while read -r envfile; do
  if git ls-files --error-unmatch "$envfile" 2>/dev/null; then
    echo "- ⚠️  TRACKED: $envfile (should be in .gitignore)" >> "$AUDIT_FILE"
  else
    echo "- ✅ Ignored: $envfile" >> "$AUDIT_FILE"
  fi
done

# 4. Authentication checks
echo "## 4. Authentication Middleware" >> "$AUDIT_FILE"
AUTH_ROUTES=$(grep -rE "authMiddleware|requireAuth|isAuthenticated" apps/api/src/routes/ | wc -l)
TOTAL_ROUTES=$(find apps/api/src/routes/ -name "*.ts" -type f | wc -l)
echo "- Routes with auth: $AUTH_ROUTES / $TOTAL_ROUTES" >> "$AUDIT_FILE"

# Missing auth middleware
grep -L "authMiddleware\|requireAuth" apps/api/src/routes/*.ts 2>/dev/null | while read -r route; do
  echo "- ⚠️  No auth: $route" >> "$AUDIT_FILE"
done

# 5. SQL Injection risk (raw queries)
echo "## 5. Injection Risks" >> "$AUDIT_FILE"
grep -rE "\.raw\(|\.query\(|execute\(" packages/ apps/ --include="*.ts" | \
  grep -v ".test." | wc -l | xargs -I {} echo "- Raw queries found: {}" >> "$AUDIT_FILE"

# 6. XSS risks (dangerouslySetInnerHTML)
echo "## 6. XSS Risks" >> "$AUDIT_FILE"
grep -r "dangerouslySetInnerHTML" apps/web/src/ | wc -l | \
  xargs -I {} echo "- dangerouslySetInnerHTML usage: {}" >> "$AUDIT_FILE"

# 7. CORS configuration
echo "## 7. CORS Configuration" >> "$AUDIT_FILE"
grep -r "cors" apps/api/src/ --include="*.ts" | head -3 >> "$AUDIT_FILE"

# Summary
echo "" >> "$AUDIT_FILE"
echo "## 📊 Summary" >> "$AUDIT_FILE"
echo "| Check | Result | Status |" >> "$AUDIT_FILE"
echo "|-------|--------|--------|" >> "$AUDIT_FILE"
echo "| High vulnerabilities | $HIGH | $([ $HIGH -eq 0 ] && echo '✅' || echo '❌') |" >> "$AUDIT_FILE"
echo "| Critical vulnerabilities | $CRITICAL | $([ $CRITICAL -eq 0 ] && echo '✅' || echo '🔴') |" >> "$AUDIT_FILE"
echo "| Auth coverage | $AUTH_ROUTES/$TOTAL_ROUTES | $([ $AUTH_ROUTES -eq $TOTAL_ROUTES ] && echo '✅' || echo '⚠️') |" >> "$AUDIT_FILE"

# Action plan
echo "" >> "$AUDIT_FILE"
echo "## 🎯 Action Plan" >> "$AUDIT_FILE"
if [ $CRITICAL -gt 0 ]; then
  echo "### 🔴 CRITICAL (Fix Now)" >> "$AUDIT_FILE"
  echo "- Update dependencies with critical vulnerabilities" >> "$AUDIT_FILE"
  echo "- Command: \`pnpm audit fix --force\`" >> "$AUDIT_FILE"
fi
if [ $HIGH -gt 0 ]; then
  echo "### 🟡 HIGH (Fix This Week)" >> "$AUDIT_FILE"
  echo "- Update dependencies with high vulnerabilities" >> "$AUDIT_FILE"
fi
if [ $AUTH_ROUTES -lt $TOTAL_ROUTES ]; then
  echo "### 🟠 MEDIUM (Review Required)" >> "$AUDIT_FILE"
  echo "- Add auth middleware to unprotected routes" >> "$AUDIT_FILE"
fi

cat "$AUDIT_FILE"
```

---

## ✅ **Success Criteria**

- ✅ 0 critical vulnerabilities
- ✅ 0 hardcoded secrets in code
- ✅ All .env files in .gitignore
- ✅ All routes have auth middleware
- ✅ No raw SQL queries (use ORM)

---

**Status**: ✅ ACTIVE  
**Frequency**: Monthly or pre-deployment  
**See Also**: `SYSTEM_AUDIT.md`

