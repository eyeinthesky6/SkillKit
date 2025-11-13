# Skill Usage Fix - Making Skills Actually Work in Cursor

**Date:** 13-11-2025  
**Problem:** Skills weren't being used because they weren't explicitly loaded into agent context  
**Solution:** Force explicit terminal execution and make workflows read skill output  
**Status:** ✅ Complete

---

## The Problem

**User Feedback:**
> "Skills aren't being used. They're just fancy documentation from Cursor's point of view."

**Root Cause Analysis:**

1. **Cursor doesn't natively support Claude Skills** - Unlike Claude Code, Cursor doesn't automatically scan `.claude/skills/`
2. **Skills are invoked via prompt text** - Claude decides to use skills based on what's in context
3. **Workflows only referenced skills in prose** - "If working with PDFs, use the pdf skill" is just text
4. **No explicit terminal execution** - Workflows didn't force agents to run `tsk skill:load`
5. **No verification** - Agents didn't verify skills were actually loaded

**Result:** Skills were effectively dead weight - installed but never used.

---

## The Solution

### 1. Explicit Terminal Execution Required

**Changed:** Workflows now REQUIRE terminal execution, not just suggestions.

**Before:**
```markdown
If working with PDFs, load the pdf skill.
```

**After:**
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

**Before:**
```
✓ Loaded pdf skill
────────────────────────────────────────────────────────
[SKILL.md content]
────────────────────────────────────────────────────────
💡 Tip: The skill content is now in your context.
```

**After:**
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

**Changed:** Workflows now explicitly require reading AGENTS.md at the start.

**Added to workflows:**
```markdown
## Phase 0.5: Read AGENTS.md (MANDATORY)

**YOU MUST USE THE FILE TOOL TO OPEN AND READ:**

```
AGENTS.md
```

**What to look for:**
- Available skills (pdf, xlsx, docx, etc.)
- Skill descriptions and use cases
- Available workflows
```

### 4. Updated Load-Skill Subtask

**Changed:** Made it explicit that terminal execution is required.

**Key additions:**
- 🚨 CRITICAL section emphasizing terminal execution
- Step-by-step execution guide
- Verification checklist
- Clear examples with "YOU MUST RUN THIS IN TERMINAL" markers

### 5. Example Skill-Aware Workflow

**Created:** `PDF_REVIEW.md` as a demonstration workflow.

**Features:**
- Explicit skill loading steps
- Verification requirements
- Clear pattern for other workflows
- Shows correct skill usage

---

## Files Modified

### Core Changes

1. **`docs/workflows/subtasks/load-skill.md`**
   - Added 🚨 CRITICAL section
   - Made terminal execution mandatory
   - Added verification checklist
   - Enhanced examples

2. **`templates/workflows/IMPLEMENT_FEATURE.md`**
   - Added Phase 0.5: Read AGENTS.md
   - Enhanced Phase 2.5: Load Domain Skills
   - Made skill loading explicit and mandatory
   - Added verification steps

3. **`templates/workflows/BEGIN_SESSION.md`**
   - Added Step 0: Read AGENTS.md
   - Ensures agents know available skills

4. **`templates/workflows/SKILLKIT_TASK.md`**
   - Added Step 3: Load Required Skills
   - Made skill loading explicit
   - Added verification requirements
   - Updated examples

5. **`src/cli-commands/skill-load.ts`**
   - Enhanced output with clear markers
   - Added agent-specific instructions
   - Made it obvious when skill is loaded

6. **`templates/workflows/PDF_REVIEW.md`** (NEW)
   - Example skill-aware workflow
   - Demonstrates correct pattern
   - Shows explicit skill loading

7. **`src/cli-commands/init.ts`**
   - Added PDF_REVIEW.md to workflow files list

---

## How It Works Now

### Correct Flow

```
1. User: "Extract tables from PDF"
   ↓
2. Agent reads AGENTS.md (workflow requirement)
   ↓
3. Agent runs: tsk plan "extract tables from PDF"
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

### What Changed

**Before:**
- Workflows: "Use pdf skill if needed" (just text)
- Agent: Ignores suggestion, freehands solution
- Result: Skill never used

**After:**
- Workflows: "YOU MUST RUN: tsk skill:load pdf (in terminal)"
- Agent: Runs command, sees output, uses instructions
- Result: Skill actually used!

---

## Verification

### How to Verify Skills Are Being Used

1. **Check terminal output:**
   - Should see "✓ Loaded <skill> skill"
   - Should see full SKILL.md content (200-600 lines)

2. **Check agent behavior:**
   - Agent references skill instructions
   - Agent uses skill's code examples
   - Agent follows skill's best practices

3. **Check results:**
   - Output matches skill's approach
   - Code follows skill patterns
   - Best practices from skill applied

### Test Workflow

**Use `/PDF_REVIEW` workflow:**
1. Run the workflow
2. Verify it loads PDF skill via terminal
3. Check terminal shows full skill content
4. Verify agent uses skill instructions
5. Confirm results match skill approach

---

## Key Principles

### 1. Explicit > Implicit

**Don't:** "Use the pdf skill if needed"  
**Do:** "YOU MUST RUN: tsk skill:load pdf (in terminal)"

### 2. Terminal Output = Context

**The skill instructions are in the terminal output.**  
**Agents must read terminal output to get skill knowledge.**

### 3. Verification Required

**Don't assume skills loaded.**  
**Verify terminal output shows full skill content.**

### 4. Use Skill Knowledge

**After loading, agents MUST:**
- Reference skill instructions
- Use skill's code examples
- Follow skill's best practices

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

## Next Steps

### For Users

1. **Update workflows:** Run `tsk init --force` to get updated workflows
2. **Test skill loading:** Try `/PDF_REVIEW` workflow
3. **Verify usage:** Check terminal output shows skill content

### For Workflow Authors

1. **Follow the pattern:** Use PDF_REVIEW.md as template
2. **Force terminal execution:** Don't just mention skills
3. **Add verification:** Check terminal output
4. **Reference skill knowledge:** Use loaded instructions

---

## Summary

**Problem:** Skills weren't being used because they weren't in agent context.

**Solution:** 
1. Force explicit terminal execution (`tsk skill:load`)
2. Make workflows read AGENTS.md
3. Enhance skill output for agents
4. Add verification steps
5. Create example workflow

**Result:** Skills are now actually loaded and used by agents!

---

**Status:** ✅ Complete  
**Confidence:** 🎯 Very High - Pattern is clear and testable

