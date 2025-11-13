# PDF Review - Skill-Aware Workflow

**Purpose:** Review, analyze, or manipulate PDF files using the PDF skill

**This workflow demonstrates explicit skill loading and usage.**

---

## {{CUSTOM_HEADER}}
<!-- Project-specific critical rules/standards -->
---

## 🚨 CRITICAL: This Workflow REQUIRES Skill Loading

**This workflow is designed to demonstrate how skills are explicitly loaded and used.**

**You MUST follow the skill loading steps exactly as written.**

---

## Phase 0: Read AGENTS.md

**YOU MUST USE THE FILE TOOL TO OPEN AND READ:**

```
AGENTS.md
```

**Look for:**
- PDF skill availability
- Skill description
- When to use PDF skill

**After reading, confirm:**
- PDF skill is available
- You understand what it does

---

## Phase 1: Load PDF Skill (MANDATORY)

**🚨 CRITICAL: You MUST use the terminal tool to run this command.**

**Step 1: Open terminal tool in Cursor**

**Step 2: Run this command:**

```bash
tsk skill:load pdf
```

**Step 3: Wait for command to complete**

**Step 4: Read ALL terminal output**

**What you should see:**
- ✅ "✓ Loaded pdf skill" message
- ✅ Full PDF skill instructions (200-600 lines)
- ✅ Sections on "When to use", "Approach", "Examples"
- ✅ Code examples and best practices

**Step 5: Verify skill loaded**

**Check terminal output contains:**
- Skill name and description
- Detailed instructions
- Code examples
- Best practices

**If you don't see full skill content, the skill was NOT loaded. Re-run the command.**

---

## Phase 2: Understand the Task

**Ask the user:**
- What PDF file(s) need to be reviewed?
- What operation is needed? (extract text, extract tables, merge, split, etc.)
- What is the expected output?

**Based on the skill instructions you just loaded:**
- Identify which approach from the skill to use
- Note any prerequisites (libraries, tools)
- Plan the implementation

---

## Phase 3: Execute Using Skill Knowledge

**You MUST use the skill instructions you loaded in Phase 1.**

**For each step:**
1. Reference the relevant section from the skill
2. Use the code examples provided
3. Follow the best practices shown
4. Apply the domain expertise to this specific task

**Example workflow:**

```python
# Based on PDF skill instructions loaded in Phase 1:
# 1. Use the recommended library (from skill)
# 2. Follow the pattern shown in skill examples
# 3. Apply best practices from skill

# Example: Extract text (following skill instructions)
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    text = ""
    for page in pdf.pages:
        text += page.extract_text()
    print(text)
```

**Important:**
- Don't freehand - use the skill's approach
- Reference the skill examples
- Follow the skill's best practices

---

## Phase 4: Verify Results

**Check:**
- Output matches user requirements
- Code follows skill patterns
- Best practices from skill were applied

---

## Phase 5: Document

**Note:**
- Which skill approach was used
- Any modifications made
- Results achieved

---

## Key Points

1. **Skills are loaded via terminal** - `tsk skill:load pdf` outputs full instructions
2. **Terminal output = skill context** - The instructions are in the terminal output
3. **Must use skill knowledge** - Reference the loaded instructions throughout
4. **Don't freehand** - Use the skill's proven approaches

---

**This workflow demonstrates the correct pattern for skill usage in SkillKit.**

