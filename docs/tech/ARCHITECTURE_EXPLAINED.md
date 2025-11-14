# SkillKit Architecture Explained - Skills vs Workflows

**Date:** 06-11-2025  
**Purpose:** Clarify how workflows/subtasks and skills work together

---

## 🤔 Your Critical Questions

### **Q1: "Workflows and subtasks exist in parallel to skills?"**

**Answer:** They DON'T exist in parallel - they exist in a **HIERARCHY**!

```
┌─────────────────────────────────────────────────────────┐
│  Workflows (Top Level - WHEN to do things)             │
│  ↓                                                       │
│  Subtasks (Mid Level - HOW to execute standard tasks)  │
│  ↓                                                       │
│  Skills (Bottom Level - WHAT code/approach to use)     │
└─────────────────────────────────────────────────────────┘
```

**They're NOT competing - they're LAYERED!**

---

### **Q2: "How will it work together?"**

**Answer:** Workflows ORCHESTRATE, Subtasks EXECUTE, Skills INFORM

#### **Example: "Extract tables from PDF report"**

**Layer 1: Workflow (IMPLEMENT_FEATURE.md)**
```markdown
## Phase 1: Gather Requirements
@docs/workflows/subtasks/gather-requirements.md
→ Detects: User mentions "PDF"
→ Adds flag: NEED_PDF_SKILL=true

## Phase 2: Check Dependencies  
@docs/workflows/subtasks/check-dependencies.md
→ Checks: pip/npm installed?

## Phase 2.5: Load Domain Knowledge (IF NEEDED)
{{#if NEED_PDF_SKILL}}
  @docs/workflows/subtasks/load-skill.md
  Load: pdf skill
{{/if}}

## Phase 3: Implement
[AI now has both: procedure AND domain knowledge]

## Phase 4: Test
@docs/workflows/subtasks/run-tests.md
```

**Layer 2: Subtask (load-skill.md)**
```markdown
# Load Domain Skill

## Commands:
tsk skill:load pdf

## What happens:
- Loads SKILL.md (295 lines of PDF expertise)
- AI reads it
- Returns to main workflow
```

**Layer 3: Skill (pdf SKILL.md from Anthropic)**
```markdown
# PDF Processing Guide

## Extract Tables with pdfplumber:
\`\`\`python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    tables = pdf.pages[0].extract_tables()
\`\`\`

## Or with tabula-py:
\`\`\`python
import tabula
df = tabula.read_pdf("file.pdf", pages="all")
\`\`\`

[... 295 lines of detailed instructions ...]
```

**Result:**
- Workflow: Tells AI the PROCESS (requirements → deps → implement → test)
- Subtask: Tells AI to LOAD the skill when needed
- Skill: Tells AI the ACTUAL CODE to use (pdfplumber.open, extract_tables)

---

### **Q3: "When subtasks collide with skills?"**

**Answer:** THEY DON'T COLLIDE! Different purposes!

#### **Collision Scenario (IMAGINED):**

```
Subtask: "run-tests.md" (20 lines - how to run npm test)
Skill: "testing-skill.md" (300 lines - deep testing expertise)
```

**Do they collide?** NO!

**Why?**

| Aspect | Subtask | Skill |
|--------|---------|-------|
| **Purpose** | Execute standard command | Provide deep expertise |
| **Content** | `npm test` (generic) | pytest fixtures, mocking, TDD patterns |
| **When Used** | ALWAYS (every workflow) | RARELY (only when needed) |
| **Scope** | Project-agnostic | Domain-specific |
| **Length** | 15-25 lines | 200-600 lines |

#### **Real Example: Testing**

**Subtask: run-tests.md**
```markdown
# Run Tests (Subtask)

## Commands:
\`\`\`bash
npm test           # Node.js
pytest            # Python
go test ./...     # Go
\`\`\`

## Output:
Returns: pass/fail status
```

**Skill: webapp-testing (Anthropic)**
```markdown
# Playwright Web Testing

## Advanced Testing Patterns:

### Test with Authentication:
\`\`\`javascript
await page.goto('http://localhost:3000/login');
await page.fill('#username', 'testuser');
await page.fill('#password', 'password123');
await page.click('button[type="submit"]');
await expect(page).toHaveURL('/dashboard');
\`\`\`

### Visual Regression Testing:
\`\`\`javascript
await expect(page).toHaveScreenshot('dashboard.png', {
  maxDiffPixels: 100
});
\`\`\`

[... 400+ lines of Playwright expertise ...]
```

**No collision!**
- Subtask: Runs basic tests (always needed)
- Skill: Provides advanced Playwright patterns (only when doing browser testing)

---

### **Q4: "Which flow will agent choose to execute?"**

**Answer:** BOTH! In sequence!

#### **The Agent's Execution Flow:**

```
1. User: /IMPLEMENT_FEATURE "Add login page with Playwright tests"
   ↓
2. Agent reads: IMPLEMENT_FEATURE.md workflow
   ↓
3. Workflow Phase 1: gather-requirements.md (subtask)
   → Agent detects: "Playwright tests" mentioned
   → Sets: NEED_WEBAPP_TESTING_SKILL=true
   ↓
4. Workflow Phase 2.5: load-skill.md (subtask)
   → IF NEED_WEBAPP_TESTING_SKILL:
     → tsk skill:load webapp-testing
     → 400 lines of Playwright expertise loaded
   ↓
5. Agent now has BOTH:
   ✓ Workflow: The development procedure
   ✓ Skill: Playwright expertise
   ↓
6. Agent implements login page using Playwright patterns from skill
   ↓
7. Workflow Phase 6: run-tests.md (subtask)
   → Agent runs: npm test
   → Uses knowledge from webapp-testing skill
   ↓
8. Done!
```

**Key Point:** Agent follows workflow (procedure), but uses skill (knowledge) when implementing!

---

### **Q5: "Why dependency route instead of directly using their code?"**

**CRITICAL DESIGN DECISION!** Here's why:

#### **Option A: Fork OpenSkills Code (What we DIDN'T do)**

```
skillkit/
├── src/
│   ├── openskills-fork/        ❌ Copied code
│   │   ├── installer.ts        ❌ Maintain separately
│   │   ├── sync.ts             ❌ Track their changes
│   │   └── tui.ts              ❌ Merge conflicts
│   └── our-code.ts
```

**Problems:**
- ❌ Code duplication
- ❌ Must track upstream changes manually
- ❌ Merge conflicts when they update
- ❌ More code to maintain
- ❌ Breaks when they fix bugs (we don't get fixes)
- ❌ Community can't contribute to one place

#### **Option B: Use as Dependency (What we DID)**

```
skillkit/
├── package.json
│   dependencies:
│     "openskills": "^1.0.0"    ✅ Auto-updates!
├── src/
│   ├── skill-loader.ts         ✅ Our wrapper (terminal-aware)
│   └── agents-builder.ts       ✅ Our integration
```

**Benefits:**
- ✅ Zero code duplication
- ✅ Auto-updates when they improve
- ✅ Bug fixes automatically propagate
- ✅ Less code to maintain
- ✅ Clear separation of concerns
- ✅ Community benefits both projects

---

## 🎯 The Real Architecture

### **NOT Parallel - LAYERED!**

```
┌────────────────────────────────────────────────────────────┐
│ USER                                                         │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ LAYER 1: Workflow Entry Points (.cursor/commands/)         │
│ Purpose: Trigger points for AI agents                      │
│ Content: /BEGIN_SESSION, /IMPLEMENT_FEATURE                │
│ Size: 1 line (redirect to actual workflow)                 │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ LAYER 2: Main Workflows (docs/workflows/)                  │
│ Purpose: Development procedures (WHEN to do what)          │
│ Content: Phase 1 → Phase 2 → Phase 3 → ...                │
│ Size: 20-80 lines                                          │
│ Example: "Phase 1: Requirements, Phase 2: Dependencies"    │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ LAYER 3: Subtasks (docs/workflows/subtasks/)              │
│ Purpose: Standard execution steps (HOW to execute)         │
│ Content: Commands + basic instructions                     │
│ Size: 15-25 lines                                          │
│ Example: "Run: npm test, Parse: output, Return: status"   │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ LAYER 4: SkillKit Loader (src/skill-loader.ts)            │
│ Purpose: Terminal-aware loading (WRAPPER around OpenSkills)│
│ Content: Platform detection + command translation          │
│ Example: "PS → bash -c 'openskills read pdf'"             │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ LAYER 5: OpenSkills (npm package - DEPENDENCY)            │
│ Purpose: Skill installation + management                   │
│ Content: install, list, sync commands                      │
│ We call: openskills install, openskills read               │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ LAYER 6: Anthropic Skills (.claude/skills/)               │
│ Purpose: Deep domain expertise (WHAT code to write)        │
│ Content: Detailed instructions + code examples             │
│ Size: 200-600 lines per skill                              │
│ Example: "Use pdfplumber.open() + extract_tables()"       │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│ AI AGENT EXECUTES CODE                                      │
└────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Design Principles

### **1. Separation of Concerns**

| Component | Responsibility |
|-----------|---------------|
| **Workflows** | When to do things (procedure) |
| **Subtasks** | How to execute standard tasks |
| **Skills** | What code/approach to use (expertise) |
| **SkillKit Loader** | How to load skills (platform-aware) |
| **OpenSkills** | How to install/manage skills |

### **2. Dependency Injection**

```
SkillKit (our code)
  ↓ uses
OpenSkills (their package)
  ↓ installs
Anthropic Skills (their content)
```

**NOT:**
```
SkillKit (forked code) ❌
  ↓ duplicates
OpenSkills (copied code) ❌
```

### **3. Composition Over Inheritance**

We COMPOSE functionality:
- Our workflows + Their skills
- Our terminal-awareness + Their installer
- Our AGENTS.md builder + Their catalog

We DON'T inherit/fork:
- ❌ Copy their code
- ❌ Modify their implementation
- ❌ Create competing system

---

## 📊 Collision Prevention

### **How We Prevent Collisions:**

#### **1. Clear Naming Convention**

**Subtasks (Generic):**
- `run-tests.md` (runs ANY test framework)
- `run-lint.md` (runs ANY linter)
- `commit-changes.md` (generic git commit)

**Skills (Domain-Specific):**
- `pdf` skill (PDF manipulation specifically)
- `webapp-testing` skill (Playwright specifically)
- `xlsx` skill (Excel specifically)

**No overlap!**

#### **2. Loading Control**

**Subtasks:** Always loaded (part of workflow)
**Skills:** Loaded ON-DEMAND only

```markdown
# Workflow controls loading:

## Phase 2.5: Load Skills (IF NEEDED)

{{#if mentions_pdf}}
  Load: pdf skill
{{/if}}

{{#if mentions_excel}}
  Load: xlsx skill
{{/if}}

# If neither mentioned → No skills loaded!
```

#### **3. Scope Separation**

**Subtasks:**
- Scope: Project operations (test, lint, commit, deploy)
- Used by: ALL projects
- Frequency: High (every workflow)

**Skills:**
- Scope: Domain expertise (PDF, Excel, Design, Testing patterns)
- Used by: Specific projects with specific needs
- Frequency: Low (only when domain expertise needed)

#### **4. Content Differentiation**

**Subtask Example (run-tests.md):**
```markdown
# Run Tests

## Commands:
npm test      # Generic
pytest        # Generic
go test       # Generic

## Output: Pass/Fail
```

**Skill Example (webapp-testing):**
```markdown
# Playwright Testing Patterns

## Page Object Model:
class LoginPage {
  constructor(page) {
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
  }
  
  async login(user, pass) {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await page.click('button[type="submit"]');
  }
}

## Visual Testing:
[... detailed Playwright patterns ...]

[300+ more lines...]
```

**Different content levels!**

---

## ✅ Why This Architecture Works

### **1. No Duplication**
- Workflows handle procedure
- Subtasks handle execution
- Skills handle expertise
- Each layer has clear purpose

### **2. Scalability**
```
Add new workflow → Just reference existing subtasks
Add new subtask → Workflows can use it immediately
Add new skill → OpenSkills installs it, we load it
```

### **3. Maintainability**
```
OpenSkills updates → We get updates automatically (dependency)
Anthropic adds skill → We can load it immediately
We improve workflows → Independent of skills
```

### **4. User Experience**
```
User: One command (tsk init --cursor)
System: Installs everything (workflows + subtasks + skills)
Result: Complete system ready to use
```

---

## 🎯 Summary

### **Your Questions Answered:**

**Q: "Workflows and subtasks exist in parallel to skills?"**
**A:** NO! They're LAYERED: Workflows → Subtasks → Skills

**Q: "How will it work together?"**
**A:** Workflows orchestrate, Subtasks execute, Skills inform (hierarchical)

**Q: "When subtasks collide with skills?"**
**A:** They DON'T collide - different purposes (generic vs domain-specific)

**Q: "Which flow will agent choose?"**
**A:** BOTH! Agent follows workflow, loads skills when needed (sequential)

**Q: "Why dependency route instead of their code?"**
**A:** Avoid duplication, get auto-updates, clear separation, less maintenance

---

## 🔑 The Key Insight

**SkillKit is NOT competing with OpenSkills/Anthropic Skills!**

**SkillKit is:**
- Workflow orchestration layer (WHEN to do things)
- Terminal-aware execution (HOW to run cross-platform)
- + OpenSkills integration (WHAT domain knowledge to use)

**Together = Complete System!**

```
SkillKit Workflows (procedure)
    +
Anthropic Skills (expertise)
    via
OpenSkills (package management)
    =
Complete AI Development Platform!
```

---

**This architecture is ADDITIVE, not COMPETITIVE!**

**Total Lines:** 50

