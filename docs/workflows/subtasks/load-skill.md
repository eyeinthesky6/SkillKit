# Load Domain Skill (Subtask)

## Purpose
Load Anthropic skill for deep domain expertise when workflow requires specialized knowledge.

## When to Use
- User mentions: PDF, Excel, Word, Canvas, Art, Presentation
- Task requires: Document manipulation, data processing, visual design
- Need detailed, battle-tested approaches

## Available Skills

| Skill Name | Use For |
|------------|---------|
| `pdf` | Extract text/tables, merge/split PDFs, create PDFs, forms |
| `xlsx` | Spreadsheet creation, formulas, data analysis, charts |
| `docx` | Word documents, tracked changes, formatting |
| `pptx` | PowerPoint presentations, slides, layouts |
| `canvas-design` | Visual art, posters, designs (PNG/PDF) |
| `algorithmic-art` | Generative art, p5.js, flow fields |
| `webapp-testing` | Playwright testing, UI debugging |
| `mcp-builder` | MCP server creation (FastMCP/SDK) |
| `slack-gif-creator` | Animated GIFs for Slack |

Run to see full list:

```bash
openskills list
```

## Cross-Platform Loading

**Recommended (Terminal-Aware):**

```bash
tsk skill:load <skill-name>
```

**This automatically handles:**
- Windows PowerShell: `bash -c "openskills read <skill>"`
- Windows CMD: `wsl openskills read <skill>`
- Mac/Linux: `openskills read <skill>`

**Manual Alternative (if tsk unavailable):**

```bash
# Windows PowerShell:
bash -c "openskills read <skill-name>"

# Windows CMD:
wsl openskills read <skill-name>

# Mac/Linux/Git Bash:
openskills read <skill-name>
```

## 🚨 CRITICAL: Explicit Terminal Execution Required

**You MUST use the terminal tool to run this command. Do NOT just mention it in prose.**

### Step-by-Step Execution

1. **Open terminal tool in Cursor**
2. **Run the command:**
   ```bash
   tsk skill:load <skill-name>
   ```
3. **Wait for command to complete**
4. **Read ALL terminal output carefully** - this contains the full SKILL.md content
5. **The skill instructions are now in your context** - use them for the task

### Example Usage

**For PDF work:**
```bash
# YOU MUST RUN THIS IN TERMINAL:
tsk skill:load pdf

# After running, you will see 200-600 lines of PDF expertise
# Read the entire output - it contains:
# - Detailed instructions
# - Code examples
# - Best practices
# - Common pitfalls
```

**For Excel/spreadsheet work:**
```bash
# YOU MUST RUN THIS IN TERMINAL:
tsk skill:load xlsx

# Read the full output before proceeding
```

**For Word documents:**
```bash
# YOU MUST RUN THIS IN TERMINAL:
tsk skill:load docx

# Read the full output before proceeding
```

## After Loading

**MANDATORY STEPS:**

1. ✅ **Verify command executed** - Check terminal shows "✓ Loaded <skill> skill"
2. ✅ **Read the full skill content** - The terminal output contains 200-600 lines of detailed instructions
3. ✅ **Confirm you see the skill instructions** - Look for sections like "When to use", "Approach", "Examples"
4. ✅ **Apply domain expertise** - Use the instructions for your specific task
5. ✅ **Use provided code examples** - They're battle-tested!
6. ✅ **Return to main workflow** - Continue with the skill knowledge in context

## Verification

**Skill loaded successfully if terminal shows:**

```
✓ Loaded <skill> skill
────────────────────────────────────────────────────────
[Full SKILL.md content appears here - 200-600 lines]
────────────────────────────────────────────────────────
💡 Tip: The skill content is now in your context.
   Follow the instructions above to complete your task.
```

**If you don't see the full skill content in terminal output, the skill was NOT loaded properly.**

---

**💡 Tip:** Skills are comprehensive! Take time to read the full content.  
Each skill provides multiple approaches, examples, and best practices.

