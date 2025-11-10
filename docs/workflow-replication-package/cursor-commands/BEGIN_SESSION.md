# BEGIN SESSION - Single Entry Point

**⚡ TL;DR:** Agent reads context, runs diagnostics, presents task menu to user

**Status**: ✅ PRIMARY ENTRY POINT - Start here every session  
**Last Updated**: 04-11-2025

---

## 🎯 **Purpose**

**Single command to:**
1. Read session context (AITracking, Sprint Status, git)
2. Run diagnostics (type-check, todo-tracker, madge, build)
3. Analyze codebase state
4. Present task menu with specific options
5. Route to appropriate workflow

**User says:** "Begin session" or "Start work" or "What should we do?"

---

## 📋 **Protocol (5 Minutes)**

### **Step 1: Load Context (60 seconds)**

```bash
# Get today's date
TODAY=$(date +"%d-%m-%Y")

# 1. Check today's AI tracking
echo "📖 Reading today's work..."
cat "docs/AITracking/AIAction_${TODAY}_"* 2>/dev/null | tail -100

# 2. Check Sprint Status
echo "📊 Checking sprint status..."
grep -A 20 "In Progress\|⏳\|🔴" "docs/SprintStatus/Sprint Status-${TODAY}.md" 2>/dev/null

# 3. Check recent git activity
echo "🔍 Recent commits..."
git log --oneline --since="8 hours ago" --all | head -10

# 4. Check for unfinished work
echo "📂 Checking for incomplete work..."
find docs/audit/ -name "*${TODAY}*" -type f -mtime -1
```

---

### **Step 2: Run Diagnostics (2 minutes)**

```bash
echo "🔧 Running diagnostics..."

# LINT errors (CRITICAL - runs first)
pnpm run lint 2>&1 | tee /tmp/lint-errors.log
LINT_ERRORS=$(grep -cE "error|✖" /tmp/lint-errors.log 2>/dev/null || echo "0")

# Type errors
pnpm run type-check 2>&1 | tee /tmp/type-errors.log
TYPE_ERRORS=$(grep -c "error TS" /tmp/type-errors.log 2>/dev/null || echo "0")

# TODO/incomplete work
node scripts/validation/todo-tracker.cjs > /tmp/todos.txt
TODO_COUNT=$(grep -c "TODO\|FIXME\|MOCK" /tmp/todos.txt 2>/dev/null || echo "0")

# Circular dependencies
pnpm exec madge --circular packages/shared/src > /tmp/circular.txt 2>&1
CIRCULAR=$(grep -c "Circular" /tmp/circular.txt 2>/dev/null || echo "0")

# Build status
pnpm run build > /tmp/build.log 2>&1
BUILD_STATUS=$?

echo "
📊 DIAGNOSTIC SUMMARY:
- Lint Errors: ${LINT_ERRORS}
- Type Errors: ${TYPE_ERRORS}
- TODOs/Incomplete: ${TODO_COUNT}
- Circular Dependencies: ${CIRCULAR}
- Build: $([ $BUILD_STATUS -eq 0 ] && echo '✅ Pass' || echo '❌ Fail')
"
```

---

### **Step 3: Analyze State (30 seconds)**

```bash
# Top error services
echo "🔥 Top Problem Areas:"
grep -o "src/services/[^(]*" /tmp/type-errors.log 2>/dev/null | sort | uniq -c | sort -rn | head -5

# Incomplete features
echo "⏸️  Incomplete Features:"
grep -E "@feature.*TODO|INCOMPLETE" packages/shared/src/services/**/*.ts | head -5

# Security issues (if any)
echo "🔒 Security Check:"
pnpm audit --audit-level=high 2>&1 | grep -E "high|critical" | head -3
```

---

### **Step 4: Present Task Menu (User Chooses)**

**Report to user:**

```markdown
# 🎯 SESSION READY - What would you like to do?

## 📊 Current State
- **Lint Errors**: ${LINT_ERRORS} ($([ $LINT_ERRORS -gt 50 ] && echo '🔴 High' || echo '🟡 Medium'))
- **Type Errors**: ${TYPE_ERRORS}
- **Incomplete Work**: ${TODO_COUNT} items
- **Build**: $([ $BUILD_STATUS -eq 0 ] && echo '✅ Working' || echo '❌ Broken')
- **Last Work**: $(ls -lt docs/AITracking/*${TODAY}* 2>/dev/null | head -1 | awk '{print $9}')

---

## 🛠️ **Available Tasks:**

### **A. Development (New/Resume)**
1. **Implement Feature** → `/implement-feature.md`
   - Use when: Starting new feature OR resuming incomplete feature
   - Status: ${LINT_ERRORS} lint + ${TYPE_ERRORS} type errors, ${TODO_COUNT} TODOs

2. **Resume Work** → `/CONTINUE.md`
   - Use when: Continue ANY task (code/audit/discussion)
   - Last work: [show last feature from AITracking]

---

### **B. Fixing/Cleanup**
3. **Fix Errors** → `/fix-all.md`
   - Use when: ${LINT_ERRORS} lint + ${TYPE_ERRORS} type errors need fixing
   - Priority: $([ $LINT_ERRORS -gt 50 ] && echo 'HIGH (lint critical)' || echo 'Medium')

4. **Complete Features** → `/FEATURE_FIX_STRATEGY.md`
   - Use when: Features incomplete (${TODO_COUNT} items)
   - Top features: [list top 3 from diagnostics]

5. **Process TODOs** → `/todo-execution.md`
   - Use when: Systematic TODO resolution
   - Count: ${TODO_COUNT} items

---

### **C. Quality/Review**
6. **Final Check** → `/FINAL_CHECK.md`
   - Use when: Before deployment or marking feature complete
   - Checks: Lint, type, build, tests, deps → Routes if errors

7. **Code Audit** → `/SYSTEM_AUDIT.md`
   - Use when: Full codebase review needed
   - Checks: Architecture, security, deps, quality

8. **Documentation Review** → `/DOCUMENTATION_AUDIT.md`
   - Use when: Docs outdated or incomplete
   - Checks: Product, tech, API docs sync

9. **Security Review** → `/SECURITY_AUDIT.md`
   - Use when: Pre-deployment or monthly review
   - Checks: Deps, auth, secrets, OWASP

---

### **D. Planning/Analysis**
10. **Sprint Planning** → `/SPRINT_PLANNING.md`
    - Use when: Start of sprint or mid-sprint review
    - Analyzes: Features, velocity, blockers

11. **Tech Debt Report** → `/TECH_DEBT_ANALYSIS.md`
    - Use when: Quarterly or before major release
    - Analyzes: Complexity, duplication, outdated patterns

---

## 💡 **Recommendations (Based on Current State)**

$(if [ $LINT_ERRORS -gt 100 ]; then
  echo "🔴 **CRITICAL**: ${LINT_ERRORS} lint errors - Start with task #3 (fix-all)"
elif [ $LINT_ERRORS -gt 50 ]; then
  echo "🟡 **HIGH**: ${LINT_ERRORS} lint errors - Start with task #3 (fix-all)"
elif [ $TYPE_ERRORS -gt 50 ]; then
  echo "🟡 **MEDIUM**: ${TYPE_ERRORS} type errors - Start with task #3 (fix-all)"
elif [ $TODO_COUNT -gt 100 ]; then
  echo "🟡 **MEDIUM**: ${TODO_COUNT} TODOs - Start with task #5 (todo-execution)"
else
  echo "✅ **GOOD**: Low errors - Ready for new features (task #1)"
fi)

---

**Enter task number (1-10) or command name:**
```

---

### **Step 5: Route to Workflow**

**Based on user choice:**

```bash
# User input: Task number or command name
read -p "Select task: " TASK

case $TASK in
  1|implement*) 
    echo "🚀 Starting feature implementation..."
    # Execute: .cursor/commands/implement-feature.md
    ;;
  2|resume*)
    echo "⏯️  Resuming previous work..."
    # Execute: .cursor/commands/CONTINUE.md
    ;;
  3|fix*)
    echo "🔧 Starting error fixes..."
    # Execute: .cursor/commands/fix-all.md
    ;;
  4|feature*|incomplete*)
    echo "📋 Completing incomplete features..."
    # Execute: .cursor/commands/FEATURE_FIX_STRATEGY.md
    ;;
  5|todo*)
    echo "✅ Processing TODOs..."
    # Execute: .cursor/commands/todo-execution.md
    ;;
  6|audit*|system*)
    echo "🔍 Running system audit..."
    # Execute: .cursor/commands/SYSTEM_AUDIT.md
    ;;
  7|doc*)
    echo "📚 Reviewing documentation..."
    # Execute: .cursor/commands/DOCUMENTATION_AUDIT.md
    ;;
  8|sec*)
    echo "🔒 Running security audit..."
    # Execute: .cursor/commands/SECURITY_AUDIT.md
    ;;
  9|sprint*|plan*)
    echo "📅 Sprint planning..."
    # Execute: .cursor/commands/SPRINT_PLANNING.md
    ;;
  10|tech*|debt*)
    echo "📊 Analyzing tech debt..."
    # Execute: .cursor/commands/TECH_DEBT_ANALYSIS.md
    ;;
  *)
    echo "❌ Invalid choice. Enter 1-10 or command name."
    ;;
esac
```

---

## 🎯 **Success Criteria**

**Agent should:**
- ✅ Load context in < 60 seconds
- ✅ Run diagnostics in < 2 minutes
- ✅ Present clear task menu with counts
- ✅ Make data-driven recommendations
- ✅ Route to appropriate workflow

**User should:**
- ✅ See current codebase state immediately
- ✅ Understand what needs attention
- ✅ Choose task based on data, not guessing
- ✅ Start work within 5 minutes

---

## 📚 **Workflow Map**

```
BEGIN_SESSION.md (YOU ARE HERE)
  ↓
  ├─ 1. implement-feature.md (New feature)
  ├─ 2. CONTINUE.md (Resume work)
  ├─ 3. fix-all.md (Fix errors)
  ├─ 4. FEATURE_FIX_STRATEGY.md (Complete features)
  ├─ 5. todo-execution.md (Process TODOs)
  ├─ 6. SYSTEM_AUDIT.md (Code audit)
  ├─ 7. DOCUMENTATION_AUDIT.md (Doc review)
  ├─ 8. SECURITY_AUDIT.md (Security review)
  ├─ 9. SPRINT_PLANNING.md (Planning)
  └─ 10. TECH_DEBT_ANALYSIS.md (Tech debt)
```

---

## 🔄 **Daily Usage**

**Morning:**
```
User: "Begin session"
Agent: [Runs diagnostics, presents menu]
User: "Task 2" (resume yesterday's work)
Agent: [Routes to CONTINUE.md]
```

**After break:**
```
User: "Begin session"
Agent: [Shows current state, incomplete work]
User: "Task 2" (resume)
Agent: [Continues from exact point]
```

**End of sprint:**
```
User: "Begin session"
Agent: [Shows errors fixed, features complete]
User: "Task 6" (system audit before deployment)
Agent: [Routes to SYSTEM_AUDIT.md]
```

---

## ✅ **See Also**

- **Implementation**: `.cursor/commands/implement-feature.md`
- **Resume**: `.cursor/commands/CONTINUE.md`
- **Fixes**: `.cursor/commands/fix-all.md`
- **Quality**: `.cursor/commands/SYSTEM_AUDIT.md`
- **Rules**: `.cursor/rules/CORE_RULES.mdc`

---

**Status**: ✅ PRIMARY ENTRY POINT  
**Usage**: Start every session with this  
**Last Updated**: 04-11-2025

