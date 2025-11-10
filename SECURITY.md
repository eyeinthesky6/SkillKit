# Security Policy

## ⚠️ Current Status: INITIAL RELEASE

**SkillKit v0.0.1 is an initial release** and has known security limitations. **Do not use for untrusted code execution in production.**

---

## 🚨 Known Security Limitations

### 1. Resource Limits Not Enforced
**Status:** Known Issue  
**Severity:** HIGH

**Problem:**
- Skills can consume unlimited CPU, memory, and spawn unlimited child processes
- `maxCpuTime`, `maxMemory`, `maxChildProcesses` are set but not actively monitored
- No mechanism to terminate runaway skills

**Risk:**
- Denial of Service (DoS) attacks
- System resource exhaustion
- Impact on other processes

**Mitigation:**
- Only run skills from trusted sources
- Monitor system resources manually
- Run in isolated containers/VMs for untrusted skills
- Set OS-level resource limits (ulimit, cgroups)

**Roadmap:** Will be fixed in v1.2 with active resource monitoring

---

### 2. Path Traversal Vulnerabilities
**Status:** Known Issue  
**Severity:** HIGH

**Problem:**
- Path validation has several bypass opportunities:
  - Case sensitivity issues on Windows
  - Symlink attacks for non-existent paths
  - TOCTOU (Time-of-Check-Time-of-Use) race conditions
  - Incomplete control character filtering

**Risk:**
- Skills may read/write files outside `allowedPaths`
- Unauthorized access to sensitive files
- Data exfiltration

**Mitigation:**
- Carefully review and restrict `allowedPaths` in `SKILL.yaml`
- Use absolute paths only
- Run skills with minimal file system access
- Audit skill file operations in logs

**Roadmap:** Will be hardened in v1.2

---

### 3. Command Injection Possible
**Status:** Known Issue  
**Severity:** HIGH

**Problem:**
- Command validation is not comprehensive
- Argument injection possible in some scenarios
- Shell metacharacter filtering incomplete

**Risk:**
- Arbitrary command execution
- System compromise
- Privilege escalation

**Mitigation:**
- Whitelist allowed commands explicitly in `SKILL.yaml`
- Never allow user input in command arguments without validation
- Review command execution audit logs
- Run with minimal privileges

**Roadmap:** Will be fixed in v1.2 with whitelist-only execution

---

### 4. Memory Leaks in Long-Running Skills
**Status:** Known Issue  
**Severity:** MEDIUM

**Problem:**
- Internal data structures grow unbounded
- No cleanup of command history or file operation logs
- Event listeners may not be properly disposed

**Risk:**
- Memory exhaustion over time
- Performance degradation

**Mitigation:**
- Avoid long-running skills
- Restart SkillKit periodically
- Monitor memory usage

**Roadmap:** Will be fixed in v1.2

---

### 5. Incomplete JSON Schema Validation
**Status:** Known Issue  
**Severity:** MEDIUM

**Problem:**
- Only basic types validated (string, number, boolean, array, object)
- Missing support for oneOf, allOf, anyOf, conditionals
- Nested required fields may not validate correctly

**Risk:**
- Invalid inputs passing through
- Runtime errors in skills
- Unexpected behavior

**Mitigation:**
- Use simple schemas
- Add runtime validation in skill code
- Test with various inputs

**Roadmap:** Will be enhanced in v1.2

---

## ✅ Safe Usage Patterns

### DO:
- ✅ Run your own skills that you've written and reviewed
- ✅ Run skills from trusted, verified sources
- ✅ Use specific, narrow `allowedPaths` (e.g., `["./src"]` not `["."]`)
- ✅ Whitelist specific commands (e.g., `["npm", "git"]`)
- ✅ Review skill source code before execution
- ✅ Run in isolated environments (containers, VMs)
- ✅ Monitor audit logs regularly
- ✅ Set OS-level resource limits
- ✅ Use read-only permissions when possible

### DON'T:
- ❌ Run untrusted skills from unknown sources
- ❌ Use broad file access (e.g., `allowedPaths: ["/"]`)
- ❌ Allow unrestricted command execution
- ❌ Run with elevated privileges (root/admin)
- ❌ Use in production for untrusted code
- ❌ Share audit logs publicly (may contain sensitive data)
- ❌ Assume skills are sandboxed completely
- ❌ Ignore security warnings

---

## 🔒 Security Best Practices

### 1. Skill Development
```yaml
# Example: Minimal permission skill
name: safe-linter
allowedPaths:
  read: ["./src/**/*.ts"]  # Read-only, specific paths
  write: []  # No write access
allowedCommands:
  - "eslint"  # Only one specific command
  - "--no-inline-config"  # No command injection via configs
```

### 2. Skill Execution
```bash
# Review before running
cat examples/skills/unknown-skill/SKILL.yaml

# Check allowed paths and commands
grep -E "allowed(Paths|Commands)" examples/skills/unknown-skill/SKILL.yaml

# Review implementation
cat examples/skills/unknown-skill/index.js

# Check audit logs after
tail -f .skillkit/audit.log
```

### 3. Environment Isolation
```bash
# Docker example
docker run --rm -it \
  --memory=512m \
  --cpus=1 \
  -v $(pwd):/workspace:ro \
  node:18-alpine \
  npx @trinity-os/skillkit run my-skill

# VM with resource limits
ulimit -t 60  # 60 seconds CPU time
ulimit -v 512000  # 512MB virtual memory
tsk run my-skill
```

---

## 🐛 Reporting Security Vulnerabilities

### For Security Issues:
**Email:** security@trinity-os.dev  
**Subject:** [SECURITY] SkillKit Vulnerability Report

Please include:
1. Description of the vulnerability
2. Steps to reproduce
3. Proof of concept (if applicable)
4. Suggested fix (optional)

**Response Time:** We aim to respond within 48 hours.

### For General Bugs:
- GitHub Issues: https://github.com/trinity-os/skillkit/issues
- Include security label if security-related

---

## 🗺️ Security Roadmap

### v1.2 (Target: December 2025)
- [ ] Enforce resource limits with active monitoring
- [ ] Fix path traversal vulnerabilities
- [ ] Implement whitelist-only command execution
- [ ] Add comprehensive JSON Schema validation
- [ ] Fix memory leaks
- [ ] Add audit log integrity (HMAC signatures)
- [ ] Comprehensive security test suite

### v1.3 (Target: Q1 2026)
- [ ] External security audit
- [ ] Threat model documentation
- [ ] Security-focused skill examples
- [ ] Automated vulnerability scanning
- [ ] Bug bounty program

### v2.0 (Future)
- [ ] Process isolation (separate processes per skill)
- [ ] Mandatory sandboxing (OS-level)
- [ ] Cryptographic skill signing
- [ ] Permission model UI
- [ ] Security certification program

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Secure Coding Guidelines](https://wiki.sei.cmu.edu/confluence/display/seccode)

---

## ✅ Acknowledgments

We appreciate responsible disclosure. Security researchers who report valid vulnerabilities will be credited in our CHANGELOG (with permission).

---

**Last Updated:** November 10, 2025  
**Version:** 0.0.1 (Initial Release)

