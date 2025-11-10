# Security Audit

**Purpose:** Security vulnerability check

---

## Phase 1: Dependency Vulnerabilities

**For Node.js:**
```bash
npm audit
npm audit --audit-level=high
```

**For Python:**
```bash
pip-audit || safety check --json
```

**For Java:**
```bash
mvn dependency-check:check
```

**What this does:** Finds vulnerable dependencies

---

## Phase 2: Secrets Scan

```bash
# Check for hardcoded secrets
grep -rE "password|api_key|secret|token" src/ \
  --exclude="*.test.*" --exclude="*.spec.*" | head -20

# Check for exposed env files
git ls-files .env* 2>/dev/null
```

**What this does:** Finds exposed secrets

**Fix:** Move to environment variables

---

## Phase 3: Code Security Patterns

```bash
# Check for dangerous functions
grep -r "eval\|exec\|innerHTML" src/

# Check for SQL injection risks
grep -r "query.*+\|execute.*+" src/
```

**What this does:** Finds risky patterns

---

## Phase 4: Generate Report

Create `docs/audit/Security_Audit_$(date +%Y-%m-%d).md`:

```markdown
# Security Audit Report

**Date:** $(date)

## Vulnerabilities
- Critical: [count]
- High: [count]
- Medium: [count]

## Findings
1. [Issue + location + severity]
2. [...]

## Actions Required
1. Update vulnerable deps
2. Remove hardcoded secrets
3. Fix risky patterns
```

---

## Phase 5: Immediate Actions

**Critical vulnerabilities:** Fix immediately
**High vulnerabilities:** Fix this week
**Medium vulnerabilities:** Schedule for next sprint

---

**Commands:**
- `npm audit` / `pip-audit` - Deps
- `grep` - Pattern detection

