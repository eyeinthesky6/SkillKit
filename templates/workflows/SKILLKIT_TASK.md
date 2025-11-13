# SkillKit Task - Unified Entry Point

**Purpose:** Execute any task through SkillKit's planning and execution system

---

## {{CUSTOM_HEADER}}
<!-- Project-specific critical rules/standards -->
---

## 🚨 CRITICAL: You MUST Use SkillKit

**For ANY task that matches an existing SkillKit skill, you are NOT allowed to freehand solutions.**

**You MUST follow this exact sequence:**

### Step 1: Plan the Task

Run SkillKit's planner to select the appropriate skill:

```bash
tsk plan "<task description>"
```

**What this does:**
- Analyzes available skills
- Selects best match based on task description, tags, and input shape
- Returns skill name, confidence, and reasoning

**Example:**
```bash
tsk plan "fix ESLint errors in TypeScript files"
```

### Step 2: Review the Plan

The planner will show:
- **Selected Skill:** Which skill was chosen
- **Confidence:** How well it matches (0-100%)
- **Reason:** Why this skill was selected
- **Warnings:** Any issues or missing inputs

**If confidence is low (<50%) or warnings exist:**
- Review available skills: `tsk list-skills`
- Consider if task needs a different approach
- Ask user for clarification if needed

### Step 3: Load Required Skills (if needed)

**If the plan indicates a skill is needed, you MUST load it first:**

**🚨 CRITICAL: You MUST use the terminal tool to load skills.**

```bash
# Example: If working with PDFs:
tsk skill:load pdf

# Example: If working with spreadsheets:
tsk skill:load xlsx
```

**What happens:**
1. Command outputs full SKILL.md content (200-600 lines)
2. Skill instructions appear in terminal output
3. **You MUST read the entire terminal output**
4. Skill knowledge is now in your context

**Verification:**
- ✅ Check terminal shows "✓ Loaded <skill> skill"
- ✅ Full skill instructions visible (200-600 lines)
- ✅ Sections like "When to use", "Approach", "Examples" present

**If you don't see full skill content, the skill was NOT loaded. Re-run the command.**

### Step 4: Execute the Task

Run the task through SkillKit:

```bash
tsk task "<task description>"
```

**What this does:**
1. Plans the task (Step 1)
2. Executes the selected skill
3. Logs usage to telemetry
4. Reports results

**Example:**
```bash
tsk task "fix ESLint errors in TypeScript files"
```

**Important:** If you loaded a skill in Step 3, you MUST use that skill's instructions when executing the task.

### Step 5: Report Results

After execution:
1. Show the selected skill and confidence
2. Display execution results (success/failure)
3. Show any output from the skill
4. Report execution time
5. Confirm skill knowledge was applied (if skill was loaded)

**If execution fails:**
- Show the error message
- Check if input was correct
- Consider alternative skills
- Ask user for guidance

---

## ❌ DO NOT

**You MUST NOT:**
- Edit code directly without using a SkillKit skill
- Bypass SkillKit for tasks that have matching skills
- Freehand solutions when a skill exists
- Skip the planning step
- Ignore SkillKit's skill selection

**If you find yourself trying to:**
- Edit files directly
- Run commands manually
- Write code without a skill

**STOP and run `tsk task` instead.**

---

## ✅ When to Use This Command

Use `/SKILLKIT_TASK` for:
- Any development task (fix bugs, implement features, refactor)
- Code quality tasks (lint, format, test)
- Project maintenance (dependencies, configuration)
- Any task that might have a matching skill

**If no skill matches:**
- SkillKit will report "No suitable skill found"
- Then you can proceed with manual work
- Consider creating a new skill for future use

---

## 📊 Usage Tracking

All task executions are logged to:
- `logs/audit/skills-usage.jsonl` - Usage statistics
- `logs/audit/plan-history.jsonl` - Planning decisions

**View statistics:**
```bash
tsk stats
```

**Check what skills are available:**
```bash
tsk list-skills
```

---

## 🔄 Workflow Integration

This command integrates with other workflows:

- **BEGIN_SESSION** → Can route to `/SKILLKIT_TASK` for specific tasks
- **FIX_BUGS** → Should use `/SKILLKIT_TASK` internally
- **IMPLEMENT_FEATURE** → Should use `/SKILLKIT_TASK` for implementation steps

---

## 💡 Examples

### Example 1: Fix Lint Errors

**User:** "Fix all ESLint errors"

**Agent actions:**
1. Run: `tsk plan "fix all ESLint errors"` (in terminal)
2. Review plan (e.g., selects "fix-eslint" skill, 85% confidence)
3. If skill is needed, load it: `tsk skill:load fix-eslint` (in terminal)
4. Read the full terminal output from skill load
5. Run: `tsk task "fix all ESLint errors"` (in terminal)
6. Apply skill knowledge from Step 3 when executing
7. Report: "Fixed 23 ESLint errors using fix-eslint skill"

### Example 2: Work with PDFs

**User:** "Extract all tables from this PDF file"

**Agent actions:**
1. Run: `tsk plan "extract tables from PDF"` (in terminal)
2. Review plan (e.g., selects "pdf" skill, 90% confidence)
3. **MUST load skill:** `tsk skill:load pdf` (in terminal)
4. **MUST read full terminal output** - contains 200-600 lines of PDF expertise
5. Verify skill loaded: Check terminal shows full skill instructions
6. Use the skill's approach to extract tables (reference the loaded instructions)
7. Report: "Extracted 5 tables from PDF using pdf skill approach"

### Example 3: Refactor Code

**User:** "Refactor the API service layer"

**Agent actions:**
1. Run: `tsk plan "refactor API service layer"`
2. Review plan
3. Run: `tsk task "refactor API service layer"`
4. Report results

---

## 🎯 Success Criteria

A successful task execution means:
- ✅ Skill was selected by planner
- ✅ Skill executed successfully
- ✅ Results logged to telemetry
- ✅ User informed of outcome

**Check success:**
```bash
tsk stats
```

Should show non-zero usage for the skill.

---

*This command enforces SkillKit usage and ensures all tasks go through the planning and execution system.*

