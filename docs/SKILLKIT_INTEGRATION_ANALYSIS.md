# SkillKit Integration Issue Analysis & Fix Plan

**Date:** 2025-01-XX  
**Issue:** Skills not being used despite being installed and integrated  
**Root Cause:** Missing enforcement layer between Cursor commands and SkillKit runtime

---

## 🔍 Problem Analysis

### Current State

1. **SkillKit has:**
   - ✅ Planner/router (`src/router/planner.ts`) - Can select skills based on task
   - ✅ Skill registry - Can load and discover skills
   - ✅ Skill runner - Can execute skills
   - ✅ 20+ workflows installed as Cursor commands
   - ✅ AGENTS.md and SKILLS.md integration

2. **What's Missing:**
   - ❌ No CLI command to invoke planner (`tsk plan`)
   - ❌ No unified task entry point (`tsk task`)
   - ❌ Cursor commands are just prompts, not enforcement
   - ❌ No telemetry to track skill usage
   - ❌ No guardian/router layer that forces SkillKit usage

### Why Skills Aren't Being Used

**The Gap:**
```
User Task → Cursor Command → [MISSING LAYER] → Agent Freehands
                              ↓
                         Should be:
                         tsk plan → tsk run
```

**Current Flow:**
1. User types task in Cursor
2. Cursor command loads (e.g., `/FIX_BUGS.md`)
3. Command says "run `tsk exec fix-bugs`" (just a suggestion)
4. Agent reads command, sees instructions, but **doesn't have to follow them**
5. Agent freehands the solution instead

**What Should Happen:**
1. User types task in Cursor
2. Cursor command loads
3. Command **forces** agent to run `tsk task "<description>"`
4. `tsk task` calls `tsk plan` → selects skill
5. `tsk task` calls `tsk run <skill>` → executes skill
6. Results logged to telemetry
7. Agent reports results to user

---

## 🎯 Solution Architecture

### Layer 1: Core Engine (SkillKit CLI)

**New Commands:**

1. **`tsk plan "<task>"`**
   - Uses planner to select best skill
   - Outputs JSON: `{ skill, why, confidence, expectedOutputs }`
   - Can be called by agents or users

2. **`tsk task "<task>"`**
   - Combines plan + run
   - Flow: `plan → run → audit → report`
   - Single entry point for all tasks

3. **`tsk stats`**
   - Shows skill usage telemetry
   - Counts per skill, last used, success rate

### Layer 2: Guardian/Router (Cursor Commands)

**Updated Command Template:**

```markdown
# Fix Bugs

## CRITICAL: You MUST use SkillKit

**For this task, you are NOT allowed to freehand solutions.**

**You MUST:**
1. Run: `tsk plan "fix bugs and errors"`
2. Review the selected skill
3. Run: `tsk task "fix bugs and errors"`
4. Report results from SkillKit execution

**DO NOT:**
- Edit code directly without using a SkillKit skill
- Bypass SkillKit for covered tasks
- Freehand solutions when a skill exists

If you find yourself trying to edit code directly, STOP and run `/skillkit-task` instead.
```

### Layer 3: Telemetry

**Audit Logging:**
- Every `plan` call → `logs/audit/plan-{timestamp}.jsonl`
- Every `run` call → `logs/audit/run-{timestamp}.jsonl`
- Central usage file → `logs/audit/skills-usage.jsonl`

**Format:**
```json
{
  "skill": "fix-eslint",
  "timestamp": "2025-01-XX...",
  "repo": "/path/to/repo",
  "status": "success",
  "duration_ms": 1234,
  "task": "fix lint errors"
}
```

---

## 📋 Implementation Plan

### Phase 1: Core CLI Commands

1. ✅ Create `tsk plan` command
2. ✅ Create `tsk task` command  
3. ✅ Add telemetry/logging
4. ✅ Update `tsk stats` to show skill usage

### Phase 2: Cursor Integration

1. ✅ Create `/skillkit-task` command (unified entry point)
2. ✅ Update existing commands to force SkillKit usage
3. ✅ Add enforcement language to command templates

### Phase 3: Documentation

1. ✅ Update architecture docs
2. ✅ Create migration guide
3. ✅ Update user docs

---

## 🚀 Expected Outcome

**Before:**
- Agent gets task → freehands solution
- Skills sit unused
- No visibility into what's happening

**After:**
- Agent gets task → `tsk task` → skill selected → skill executed → results logged
- Skills actively used
- Full telemetry and visibility
- Consistent, repeatable execution

---

## 📊 Success Metrics

1. **Usage:** `tsk stats` shows non-zero skill usage
2. **Enforcement:** Cursor commands explicitly require SkillKit
3. **Telemetry:** Audit logs show skill invocations
4. **User Experience:** Tasks go through SkillKit, not freehand

---

## 🔧 Technical Details

### `tsk plan` Implementation

```typescript
// src/cli-commands/plan.ts
export function createPlanCommand(): Command {
  return new Command('plan')
    .description('Plan which skill to use for a task')
    .argument('<task>', 'Task description')
    .option('--json', 'Output as JSON')
    .action(async (task: string, opts: { json?: boolean }) => {
      // Load skill registry
      // Call planTask()
      // Output plan
    });
}
```

### `tsk task` Implementation

```typescript
// src/cli-commands/task.ts
export function createTaskCommand(): Command {
  return new Command('task')
    .description('Execute a task using SkillKit (plan + run)')
    .argument('<task>', 'Task description')
    .action(async (task: string) => {
      // 1. Plan
      const plan = await planTask(...);
      // 2. Run
      const result = await runSkill(...);
      // 3. Log
      await logUsage(...);
      // 4. Report
      console.log(result);
    });
}
```

### Telemetry Implementation

```typescript
// src/utils/telemetry.ts
export async function logSkillUsage(
  skill: string,
  status: 'success' | 'failure',
  duration: number,
  task?: string
): Promise<void> {
  const entry = {
    skill,
    timestamp: new Date().toISOString(),
    repo: process.cwd(),
    status,
    duration_ms: duration,
    task
  };
  
  // Append to JSONL file
  await appendToFile('logs/audit/skills-usage.jsonl', JSON.stringify(entry));
}
```

---

## 📝 Next Steps

1. Implement Phase 1 (Core CLI)
2. Test with sample tasks
3. Implement Phase 2 (Cursor integration)
4. Update documentation
5. Release and monitor

---

*This document will be updated as implementation progresses.*

