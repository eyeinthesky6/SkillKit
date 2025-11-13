# AI Action Log: Skill Usage Fix

**Date:** 13-11-2025  
**Task:** Fix skill usage - make skills actually get loaded and used by Cursor agents  
**Status:** ✅ Complete

---

## Problem Identified

**User Feedback:**
> "Skills aren't being used. They're just fancy documentation from Cursor's point of view."

**Root Cause:**
1. Cursor doesn't natively support Claude Skills (unlike Claude Code)
2. Skills are only invoked if their content is in the prompt context
3. Workflows only mentioned skills in prose - didn't force terminal execution
4. Agents never actually ran `tsk skill:load` commands
5. No verification that skills were loaded

**Result:** Skills installed but never used - effectively dead weight.

---

## Solution Implemented

### 1. Explicit Terminal Execution Required

**Changed:** All workflows now REQUIRE terminal execution for skill loading.

**Pattern:**
```markdown
🚨 CRITICAL: You MUST use the terminal tool to load skills.

**YOU MUST RUN THIS COMMAND IN THE TERMINAL TOOL:**

```bash
tsk skill:load pdf
```

**What happens:**
1. Command outputs full SKILL.md content (200-600 lines)
2. Skill instructions appear in terminal output
3. You must read the entire terminal output
4. Skill knowledge is now in your context
```

### 2. Enhanced Skill Load Output

**Changed:** `tsk skill:load` now outputs clear markers for agents.

**New Output Format:**
```
════════════════════════════════════════════════════════
📚 SKILL LOADED: PDF
════════════════════════════════════════════════════════

The following content contains the complete skill instructions.
You MUST read and apply these instructions for your task.

────────────────────────────────────────────────────────
[Full SKILL.md content - 200-600 lines]
────────────────────────────────────────────────────────

✅ SKILL CONTENT LOADED INTO CONTEXT

🚨 IMPORTANT FOR AI AGENTS:
   • The skill instructions above are now in your context
   • You MUST use these instructions when working on related tasks
   • Follow the approaches, examples, and best practices shown above
   • Reference this skill knowledge throughout your work
```

### 3. AGENTS.md Reading Required

**Added to workflows:**
- BEGIN_SESSION: Step 0 - Read AGENTS.md
- IMPLEMENT_FEATURE: Phase 0.5 - Read AGENTS.md

**Pattern:**
```markdown
## Phase 0.5: Read AGENTS.md (MANDATORY)

**YOU MUST USE THE FILE TOOL TO OPEN AND READ:**

```
AGENTS.md
```

**What to look for:**
- Available skills (pdf, xlsx, docx, etc.)
- Skill descriptions and use cases
```

### 4. Updated Load-Skill Subtask

**Enhanced:** `docs/workflows/subtasks/load-skill.md`

**Key additions:**
- 🚨 CRITICAL section emphasizing terminal execution
- Step-by-step execution guide
- Verification checklist
- Clear examples with "YOU MUST RUN THIS IN TERMINAL" markers

### 5. Updated Workflows

**IMPLEMENT_FEATURE:**
- Added Phase 0.5: Read AGENTS.md
- Enhanced Phase 2.5: Load Domain Skills (now mandatory with explicit steps)
- Added verification requirements

**BEGIN_SESSION:**
- Added Step 0: Read AGENTS.md

**SKILLKIT_TASK:**
- Added Step 3: Load Required Skills
- Made skill loading explicit
- Updated examples to show skill loading

### 6. Example Skill-Aware Workflow

**Created:** `templates/workflows/PDF_REVIEW.md`

**Purpose:** Demonstrate correct skill usage pattern

**Features:**
- Explicit skill loading steps
- Verification requirements
- Clear pattern for other workflows
- Shows correct skill usage

---

## Files Modified

1. **`docs/workflows/subtasks/load-skill.md`**
   - Added 🚨 CRITICAL section
   - Made terminal execution mandatory
   - Added verification checklist

2. **`templates/workflows/IMPLEMENT_FEATURE.md`**
   - Added Phase 0.5: Read AGENTS.md
   - Enhanced Phase 2.5: Load Domain Skills
   - Made skill loading explicit and mandatory

3. **`templates/workflows/BEGIN_SESSION.md`**
   - Added Step 0: Read AGENTS.md

4. **`templates/workflows/SKILLKIT_TASK.md`**
   - Added Step 3: Load Required Skills
   - Made skill loading explicit
   - Updated examples

5. **`src/cli-commands/skill-load.ts`**
   - Enhanced output with clear markers
   - Added agent-specific instructions

6. **`templates/workflows/PDF_REVIEW.md`** (NEW)
   - Example skill-aware workflow

7. **`src/cli-commands/init.ts`**
   - Added PDF_REVIEW.md to workflow files list

8. **`README.md`**
   - Updated Skills Management section
   - Added warning about explicit skill loading

---

## How It Works Now

### Correct Flow

```
1. User: "Extract tables from PDF"
   ↓
2. Agent reads AGENTS.md (workflow requirement)
   ↓
3. Agent runs: tsk plan "extract tables from PDF" (in terminal)
   ↓
4. Plan indicates: pdf skill needed
   ↓
5. Agent MUST run: tsk skill:load pdf (in terminal)
   ↓
6. Terminal outputs full SKILL.md (200-600 lines)
   ↓
7. Agent reads terminal output (skill now in context)
   ↓
8. Agent verifies: "✓ Loaded pdf skill" + full content visible
   ↓
9. Agent uses skill instructions for task
   ↓
10. Task completed using skill knowledge
```

### Key Principle

**Terminal Output = Context**

The skill instructions are in the terminal output. Agents must read terminal output to get skill knowledge.

---

## Verification

### How to Verify Skills Are Being Used

1. **Check terminal output:**
   - Should see "✓ Loaded <skill> skill"
   - Should see full SKILL.md content (200-600 lines)
   - Should see "✅ SKILL CONTENT LOADED INTO CONTEXT"

2. **Check agent behavior:**
   - Agent references skill instructions
   - Agent uses skill's code examples
   - Agent follows skill's best practices

3. **Test workflow:**
   - Use `/PDF_REVIEW` workflow
   - Verify it loads PDF skill via terminal
   - Check terminal shows full skill content
   - Verify agent uses skill instructions

---

## Impact

### Before Fix

- Skills installed but never used
- Workflows mentioned skills but didn't enforce usage
- Agents freehanded solutions instead
- No way to verify skill usage

### After Fix

- Skills explicitly loaded via terminal
- Workflows force skill loading
- Agents see skill instructions in context
- Verification steps ensure skills are used
- Clear pattern for all workflows

---

## Next Steps for Users

1. **Update workflows:** Run `tsk init --force` to get updated workflows
2. **Test skill loading:** Try `/PDF_REVIEW` workflow
3. **Verify usage:** Check terminal output shows skill content

---

**Status:** ✅ Complete  
**Confidence:** 🎯 Very High - Pattern is clear, testable, and follows best practices

