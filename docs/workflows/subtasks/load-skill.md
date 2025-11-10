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

## Example Usage

```bash
# User needs to extract PDF tables:
tsk skill:load pdf

# User needs to create Excel report:
tsk skill:load xlsx

# User needs to edit Word doc:
tsk skill:load docx
```

## After Loading

1. **Read the full skill content** (200-600 lines of detailed instructions)
2. **Apply domain expertise** to your specific task
3. **Use provided code examples** (they're battle-tested!)
4. **Return to main workflow** when done

## Verification

Skill loaded successfully if you see:

```
✓ Loaded <skill> skill
```

Followed by detailed instructions (200+ lines).

---

**💡 Tip:** Skills are comprehensive! Take time to read the full content.  
Each skill provides multiple approaches, examples, and best practices.

