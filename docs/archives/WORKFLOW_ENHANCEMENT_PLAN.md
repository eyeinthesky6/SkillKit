# SkillKit Workflow Enhancement Plan
**Date:** November 6, 2025  
**Based on:** ProfitPilot Workflow System Analysis  
**Status:** 🎯 ACTION PLAN

---

## 📊 Gap Analysis Summary

### What SkillKit Has ✅
1. ✅ BEGIN_SESSION workflow with diagnostics
2. ✅ Multi-step implementation protocols (8-phase)
3. ✅ Quality gates (`tsk exec quality-gate`)
4. ✅ Intelligence layer (auto-detect architecture)
5. ✅ Cross-language support (TS, Python, Java, Go, PHP)
6. ✅ Workflow generation (`tsk workflow`)

### What's Missing from ProfitPilot System ⚠️
1. ❌ Production hardening banners at workflow tops
2. ❌ Issue recording system (`/tmp/*_issues_*.log`)
3. ❌ Concrete context loading (git history, error counts)
4. ❌ DEDUP workflow (duplicate code detection)
5. ❌ Smart routing based on diagnostic data
6. ❌ CONTINUE/RESUME workflow
7. ❌ Audit workflows (SYSTEM_AUDIT, SECURITY_AUDIT, etc.)
8. ❌ Feature completeness verification
9. ❌ TODO execution workflow

---

## 🎯 Priority Matrix

| Enhancement | Impact | Effort | Priority | Version |
|-------------|--------|--------|----------|---------|
| Production hardening banners | High | Low | P0 | v1.1.1 |
| Enhanced BEGIN_SESSION with counts | High | Low | P0 | v1.1.1 |
| Issue recording system | High | Medium | P1 | v1.2 |
| DEDUP workflow | High | Medium | P1 | v1.2 |
| Smart routing | Medium | Medium | P2 | v1.2 |
| CONTINUE/RESUME workflow | Medium | Low | P2 | v1.2 |
| Audit workflows | Medium | Medium | P2 | v1.2 |
| Feature completeness check | Low | Medium | P3 | v1.3 |
| TODO execution workflow | Low | Low | P3 | v1.3 |

---

## 🚀 v1.1.1 (Quick Wins - This Week)

### 1. Add Production Hardening Banners

**Files to Update:**
- `templates/workflows/BEGIN_SESSION.md`
- `templates/workflows/IMPLEMENT_FEATURE.md`
- `templates/workflows/FIX_BUGS.md`
- `templates/workflows/DEPLOY_PREP.md`

**Add at TOP of each workflow:**
```markdown
---
## ⚠️ PRODUCTION STANDARDS

**❌ FORBIDDEN:**
- NO mocks, stubs, placeholders, TODOs in production code
- NO hardcoded values (use config/env vars)
- NO console.log in production builds
- NO commented-out code blocks

**✅ REQUIRED:**
- All code production-ready
- All tests passing
- All linter rules satisfied
- Full type safety
---
```

**Add at BOTTOM of implementation workflows:**
```markdown
---
## ✅ Verification Checklist

Before marking complete:
- [ ] No mocks/stubs/TODOs in code
- [ ] All tests passing (`tsk exec test`)
- [ ] No linter errors (`tsk exec lint`)
- [ ] No type errors (`tsk exec typecheck`)
- [ ] Build successful (`tsk exec build`)
- [ ] AITracking log updated
- [ ] Code review ready

**If ANY checkbox unchecked → NOT COMPLETE**
---
```

**Estimated Time:** 30 minutes  
**Impact:** Prevents agents from leaving incomplete code

---

### 2. Enhanced BEGIN_SESSION with Actual Commands

**File:** `templates/workflows/BEGIN_SESSION.md`

**Update Phase 2: Diagnostics** to include actual bash:

```markdown
## Phase 2: Diagnostics

Run comprehensive diagnostics and capture counts:

\`\`\`bash
# Run diagnostics and capture output
tsk diagnose 2>&1 | tee /tmp/skillkit-diagnostics.log

# Extract error counts (cross-platform)
if command -v grep &> /dev/null; then
  ERROR_COUNT=$(grep -c "error" /tmp/skillkit-diagnostics.log 2>/dev/null || echo "0")
  WARN_COUNT=$(grep -c "warning" /tmp/skillkit-diagnostics.log 2>/dev/null || echo "0")
  
  echo ""
  echo "📊 Summary:"
  echo "  Errors: ${ERROR_COUNT}"
  echo "  Warnings: ${WARN_COUNT}"
fi

# Check for recent work (if docs exist)
TODAY=$(date +"%d-%m-%Y" 2>/dev/null || date +"%Y-%m-%d")
if [ -d "docs/AITracking" ]; then
  echo ""
  echo "📝 Recent Work:"
  ls -t docs/AITracking/*${TODAY}* 2>/dev/null | head -3
fi

# Show recent git activity
if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
  echo ""
  echo "🔄 Recent Commits (last 8 hours):"
  git log --oneline --since="8 hours ago" --all 2>/dev/null | head -5
fi
\`\`\`

Parse the results and check for:
- Linting errors: ${ERROR_COUNT}
- Warnings: ${WARN_COUNT}
- Recent work files
- Git activity
```

**Update Phase 3: Analysis** to be data-driven:

```markdown
## Phase 3: Analysis

Based on diagnostics:

**If ERROR_COUNT > 50:**
- ⚠️ High error count detected
- Recommend: "Fix critical errors first"
- Route to: FIX_BUGS workflow

**If ERROR_COUNT > 10:**
- ⚠️ Moderate errors detected
- Ask user: "Fix errors first (recommended) or continue?"

**If ERROR_COUNT > 0:**
- ℹ️ Minor errors detected
- Safe to implement features
- Suggest: "Fix errors after feature work"

**If ERROR_COUNT = 0:**
- ✅ System is healthy
- Proceed to task selection
```

**Estimated Time:** 1 hour  
**Impact:** Data-driven session starts, not guesswork

---

### 3. Add Production Banner to Existing Generated Workflows

**Script to Update All Generated Workflows:**

Create `scripts/add-production-banners.sh`:
```bash
#!/bin/bash
# Add production hardening banners to all generated workflows

COMMANDS_DIR=".cursor/commands"

if [ ! -d "$COMMANDS_DIR" ]; then
  echo "No .cursor/commands directory found"
  exit 0
fi

BANNER='---
## ⚠️ PRODUCTION STANDARDS

**❌ FORBIDDEN:**
- NO mocks, stubs, placeholders, TODOs in production code
- NO hardcoded values (use config/env vars)
- NO console.log in production builds
- NO commented-out code blocks

**✅ REQUIRED:**
- All code production-ready
- All tests passing
- All linter rules satisfied
- Full type safety
---

'

for file in "$COMMANDS_DIR"/{IMPLEMENT_FEATURE,FIX_BUGS,DEPLOY_PREP}.md; do
  if [ -f "$file" ] && ! grep -q "PRODUCTION STANDARDS" "$file"; then
    echo "$BANNER" | cat - "$file" > temp && mv temp "$file"
    echo "✅ Added banner to $file"
  fi
done

echo "Done!"
```

**Run after `tsk workflow --all`**

**Estimated Time:** 30 minutes  
**Impact:** Ensures existing users get production standards

---

## 🎯 v1.2 (Major Enhancements - Next Month)

### 4. Issue Recording System

**New Files:**
- `src/workflow/issue-tracker.ts` - Issue recording/retrieval
- `src/cli-commands/check-issues.ts` - `tsk check-issues` command
- `templates/workflows/RESOLVE_ISSUES.md` - Issue resolution workflow

**System Design:**

```typescript
// src/workflow/issue-tracker.ts
export interface Issue {
  id: string;
  type: 'duplicate' | 'technical-debt' | 'todo' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  description: string;
  recordedAt: string;
  resolvedAt?: string;
}

export class IssueTracker {
  private logPath: string;
  
  constructor(projectRoot: string) {
    const today = new Date().toISOString().split('T')[0];
    this.logPath = path.join('/tmp', `skillkit_issues_${today}.log`);
  }
  
  recordIssue(issue: Issue): void {
    // Append to log file (JSON lines)
  }
  
  getUnresolvedIssues(): Issue[] {
    // Read and parse log file
  }
  
  resolveIssue(id: string): void {
    // Mark issue as resolved
  }
  
  hasBlockingIssues(): boolean {
    return this.getUnresolvedIssues()
      .filter(i => i.severity === 'critical')
      .length > 0;
  }
}
```

**New Command:**
```bash
tsk check-issues
# Output:
# 🔍 Checking for unresolved issues...
#
# ❌ 3 critical issues found:
#   1. Duplicate code in src/utils/helpers.ts (line 45-67)
#   2. TODO in src/services/auth.ts (line 23)
#   3. Hardcoded API key in src/config.ts (line 12)
#
# ⚠️ 5 medium issues found
#
# Run 'tsk resolve-issues' to fix
```

**Integration:**
- IMPLEMENT_FEATURE Phase 8: Add `tsk check-issues` before completion
- FINAL_CHECK: Block if critical issues exist

**Estimated Time:** 8 hours  
**Impact:** Prevents incomplete code from being marked done

---

### 5. DEDUP Workflow

**New File:** `templates/workflows/DEDUP.md`

```markdown
# Duplicate Code Detection - SkillKit Workflow

**Purpose:** Detect and consolidate duplicate code patterns

---

## Phase 1: Scan for Duplicates

Run duplicate detection:

\`\`\`bash
# Using jscpd (JavaScript)
npx jscpd src/ --min-lines 10 --min-tokens 50 --format json --output /tmp/dedup-report.json

# Or use language-specific tools
# Python: pylint --duplicate-code
# Java: pmd cpd
# Go: dupl
\`\`\`

## Phase 2: Analyze Report

Parse results:
- Files with >80% similarity
- Code blocks >20 lines repeated
- Similar function signatures

## Phase 3: Record Issues

For each duplicate found:

\`\`\`bash
tsk record-issue --type duplicate --file "path/to/file.ts" --line 45 \
  --description "Duplicate of src/other.ts:30-50"
\`\`\`

## Phase 4: Consolidation Plan

Create consolidation strategy:
1. Extract to shared utility
2. Create abstraction layer
3. Use inheritance/composition
4. Remove redundant code

## Phase 5: Implement

Apply consolidation:
- Extract common code
- Update references
- Run tests to verify

## Phase 6: Verify

\`\`\`bash
tsk exec test
tsk check-issues --type duplicate
\`\`\`

Ensure:
- All duplicates resolved
- Tests still passing
- No new issues introduced

---

**SkillKit Commands:**
- `tsk record-issue` - Record duplicate
- `tsk check-issues` - Show unresolved
- `tsk exec test` - Verify changes
```

**Estimated Time:** 4 hours  
**Impact:** Reduces code duplication, improves maintainability

---

### 6. Smart Routing Workflow

**New File:** `templates/workflows/SMART_ROUTER.md`

```markdown
# Smart Router - SkillKit Workflow

**Purpose:** Automatically route to appropriate workflow based on project state

---

## Auto-Decision Logic

\`\`\`bash
# Run diagnostics
tsk diagnose --json > /tmp/diagnostics.json

# Extract metrics
ERROR_COUNT=$(jq '.errorCount' /tmp/diagnostics.json)
WARN_COUNT=$(jq '.warningCount' /tmp/diagnostics.json)
TEST_FAILURES=$(jq '.testFailures' /tmp/diagnostics.json)
BUILD_STATUS=$(jq '.buildStatus' /tmp/diagnostics.json)

# Decision tree
if [ "$ERROR_COUNT" -gt 50 ]; then
  echo "🔴 HIGH ERROR COUNT (${ERROR_COUNT})"
  echo "Routing to: FIX_BUGS workflow"
  # @FIX_BUGS.md
elif [ "$BUILD_STATUS" == "failing" ]; then
  echo "🔴 BUILD FAILING"
  echo "Routing to: FIX_BUGS workflow"
  # @FIX_BUGS.md
elif [ "$TEST_FAILURES" -gt 10 ]; then
  echo "🟡 MULTIPLE TEST FAILURES (${TEST_FAILURES})"
  echo "Routing to: FIX_BUGS workflow"
  # @FIX_BUGS.md
elif [ "$ERROR_COUNT" -eq 0 ] && [ "$WARN_COUNT" -lt 5 ]; then
  echo "✅ SYSTEM HEALTHY"
  echo "Routing to: IMPLEMENT_FEATURE workflow"
  # @IMPLEMENT_FEATURE.md
else
  echo "ℹ️ MINOR ISSUES (${ERROR_COUNT} errors, ${WARN_COUNT} warnings)"
  echo "Recommend: Fix errors first, but can proceed with features"
  echo ""
  echo "Choose:"
  echo "  A) Fix errors first (recommended)"
  echo "  B) Implement feature"
  echo "  C) Manual selection"
fi
\`\`\`

---

**Routes to:**
- HIGH errors (>50) → FIX_BUGS
- Build failing → FIX_BUGS
- Test failures (>10) → FIX_BUGS
- System healthy → IMPLEMENT_FEATURE
- Minor issues → User choice
```

**Estimated Time:** 3 hours  
**Impact:** Agents make data-driven routing decisions

---

### 7. CONTINUE/RESUME Workflow

**New File:** `templates/workflows/CONTINUE.md`

```markdown
# Continue Work - SkillKit Workflow

**Purpose:** Resume interrupted work from last session

---

## Phase 1: Find Last Work

\`\`\`bash
# Find most recent AITracking entry
LATEST_WORK=$(ls -t docs/AITracking/*.md 2>/dev/null | head -1)

if [ -z "$LATEST_WORK" ]; then
  echo "❌ No previous work found"
  echo "Starting fresh session..."
  # Route to BEGIN_SESSION
  exit 0
fi

echo "📝 Last work: $LATEST_WORK"
echo ""

# Extract task from last entry
TASK=$(grep -A 5 "## Task" "$LATEST_WORK" | tail -4)
echo "Last task:"
echo "$TASK"
echo ""

# Check if marked complete
if grep -q "Status: Complete" "$LATEST_WORK"; then
  echo "✅ Last task was completed"
  echo "Starting new session..."
  # Route to BEGIN_SESSION
else
  echo "⚠️ Last task was NOT completed"
  echo ""
  echo "Options:"
  echo "  1. Continue last task"
  echo "  2. Start new task"
  echo "  3. Review and decide"
fi
\`\`\`

## Phase 2: Load Context

If continuing:

\`\`\`bash
# Show last changes
echo "🔄 Changes since last session:"
git diff HEAD~1 --stat

# Show current errors
tsk diagnose --json > /tmp/current-state.json

# Compare with expected state
echo ""
echo "Current status:"
tsk diagnose
\`\`\`

## Phase 3: Resume Work

Continue from where left off:
- Load relevant files
- Show incomplete sections
- Resume implementation

---

**SkillKit Commands:**
- `tsk diagnose` - Current state
- Git commands for history
```

**Estimated Time:** 2 hours  
**Impact:** Seamless work resumption after interruptions

---

## 🎯 v1.3 (Future Enhancements - Q1 2026)

### 8. Audit Workflows

**New Files:**
- `templates/workflows/SYSTEM_AUDIT.md`
- `templates/workflows/SECURITY_AUDIT.md`
- `templates/workflows/DOCUMENTATION_AUDIT.md`
- `templates/workflows/TECH_DEBT_ANALYSIS.md`

**Each audit includes:**
- Diagnostic commands
- Report generation
- Action plan creation
- Issue tracking integration

**Estimated Time:** 12 hours total  
**Impact:** Comprehensive project health monitoring

---

### 9. Feature Completeness Verification

**New File:** `templates/workflows/FEATURE_COMPLETENESS_CHECK.md`

**Checks:**
- All tests written and passing
- Documentation updated
- No TODOs in feature code
- Performance benchmarks met
- Security review completed

**Estimated Time:** 3 hours  
**Impact:** Ensures features are truly "done"

---

### 10. TODO Execution Workflow

**New File:** `templates/workflows/TODO_EXECUTION.md`

**Process:**
- Find all TODOs in codebase
- Prioritize by file/severity
- Execute one at a time
- Verify after each

**Estimated Time:** 2 hours  
**Impact:** Systematic technical debt reduction

---

## 📊 Implementation Timeline

```
Week 1 (Nov 6-12, 2025): v1.1.1
├── Day 1: Production hardening banners (4 workflows)
├── Day 2: Enhanced BEGIN_SESSION with bash commands
├── Day 3: Banner addition script
├── Day 4: Testing and documentation
└── Day 5: Release v1.1.1

Month 2 (Dec 2025): v1.2
├── Week 1: Issue tracking system
├── Week 2: DEDUP workflow
├── Week 3: Smart routing + CONTINUE
├── Week 4: Testing and release v1.2

Q1 2026: v1.3
├── Month 1: Audit workflows
├── Month 2: Feature completeness + TODO execution
└── Month 3: Polish and release v1.3
```

---

## ✅ Success Metrics

### v1.1.1
- [ ] All workflow templates have production banners
- [ ] BEGIN_SESSION shows actual error counts
- [ ] Git history loaded in BEGIN_SESSION
- [ ] Users report "no mocks left in code"

### v1.2
- [ ] Issue tracker records duplicates
- [ ] Critical issues block completion
- [ ] DEDUP reduces duplicate code by 30%
- [ ] Smart router makes correct decisions 80% of time

### v1.3
- [ ] Audit workflows generate actionable reports
- [ ] Feature completeness check catches incomplete work
- [ ] TODO execution reduces technical debt by 50%

---

## 🎯 Key Learnings from ProfitPilot

1. **Production Hardening is Critical**
   - Explicit warnings prevent incomplete code
   - Bottom checklists ensure verification

2. **Data-Driven Decisions Work Better**
   - Error counts drive routing
   - No guesswork, just facts

3. **Issue Tracking Prevents Drift**
   - Recording issues during work
   - Gate before completion

4. **Context Loading Saves Time**
   - Git history shows recent work
   - AITracking shows last session
   - No need to re-explain context

5. **Smart Routing Reduces Friction**
   - Agents don't ask "what should I do?"
   - Diagnostics determine the path

---

**Next Steps:**
1. Review this plan
2. Approve v1.1.1 quick wins
3. Start with production banners (30 min)
4. Release v1.1.1 this week

**Status:** 📋 READY FOR REVIEW  
**Priority:** P0 for v1.1.1, P1 for v1.2

