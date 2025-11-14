# SkillKit: Cursor-First Roadmap (FOCUSED)

**Date:** 06-11-2025  
**Status:** ✅ CORRECTED SCOPE - Cursor First, Then Expand

---

## 🎯 Reality Check: AGENTS.md Adoption

**From Research:**
- ✅ **OpenAI models** (Codex, GPT-4) - Trained to read AGENTS.md
- ⚠️ **Claude models** (Anthropic) - NOT specifically trained for AGENTS.md
- ⚠️ **Other models** - Hit or miss

**Your Experience:**
> "agents don't even read the readme.md... i had to get agents to forced read it by terminal injection"

**Truth:** AGENTS.md is NOT universal yet. Only OpenAI models reliably read it.

**Solution:** 
- Use AGENTS.md as meta-reference
- **But:** Force reading via Cursor commands (your discovery!)
- Cursor commands = Reliable delivery (90% vs hoping)

---

## 🔍 Cursor Skills vs SkillKit Workflows

**Key Question You Asked:**
> "in cursor will workflows being executed by command system? or openskills? as i dont think skills work/get invoked in cursor even with anthropic models natively"

**Answer:**

### Current State in Cursor:

**1. Cursor Commands (.cursor/commands/)**
- ✅ User types `/workflow`
- ✅ Cursor injects `.cursor/commands/workflow.md` into chat
- ✅ Agent reads and follows
- ✅ **This works reliably!**

**2. Anthropic Skills (.claude/skills/)**
- ❌ Cursor does NOT natively invoke these
- ❌ Agent doesn't auto-discover skills
- ❌ **Needs manual prompting** ("read .claude/skills/pdf/SKILL.md")

**Conclusion:** 
> "maybe cursor is working on the integration but would be cool to do it before them!"

**YES! We can do it first!**

---

## 🎯 The Integration Strategy (Cursor)

### How Workflows & Skills Work Together (WITHOUT Conflict):

```
User types: /BEGIN_SESSION
  ↓
Cursor loads: .cursor/commands/BEGIN_SESSION.md
  ↓
Workflow content:

# Begin Session

## Step 1: Check Available Skills
bash
# List installed skills
ls .claude/skills/


## Step 2: If PDF work needed
If PDF processing required:
  1. Read: .claude/skills/pdf/SKILL.md
  2. Follow its instructions
  3. Use bundled scripts if available

## Step 3: Run Diagnostics
bash
tsk diagnose


## Step 4: Show Menu & Route
[Standard workflow continues...]
```

**Key Insight:**

**Workflows REFERENCE skills!**

- Workflows are the **procedure** ("how to build a feature")
- Skills are **tools** ("how to process PDF")
- Workflows tell agent: "If you need PDF work, read this skill"

**No conflict because:**
1. Workflows = Entry point (user triggers)
2. Skills = Referenced tools (workflow calls)
3. Both doc-based, both work together!

---

## 🔑 The Moat: Granular + Self-Customizing

**Your Key Question:**
> "will we customise skills also to granular level based on the workflow patterns? is that the moat here? simple text to granular instruction with a self customise loop?"

**YES! That's EXACTLY the moat!**

### The Three Levels:

**Level 1: Anthropic Skills (Generic Text)**
```markdown
# PDF Skill

Extract text from PDFs.

## Instructions
1. Install pdfplumber
2. Read the PDF
3. Extract text
4. Return result
```

**Level 2: SkillKit Workflows (Granular Commands)**
```markdown
# FIX_BUGS Workflow

## Step 1: Run Diagnostics
bash
tsk diagnose 2>&1 | tee /tmp/diagnostics.log


## Step 2: Parse Errors
bash
ERROR_COUNT=$(grep -c "error" /tmp/diagnostics.log)
echo "Found: ${ERROR_COUNT} errors"


## Step 3: Decision Logic
IF ${ERROR_COUNT} > 50:
  → Route to @CRITICAL_FIXES.md
ELIF ${ERROR_COUNT} > 10:
  → Continue with systematic fixing
ELSE:
  → Route to @IMPLEMENT_FEATURE.md
```

**Level 3: META-CUSTOMIZED (Self-Adjusting!)**
```markdown
# FIX_BUGS Workflow (CUSTOMIZED FOR THIS PROJECT)

## Step 1: Run Diagnostics
bash
# This project uses pnpm (detected during META_CUSTOMIZE)
pnpm lint 2>&1 | tee /tmp/diagnostics.log
pnpm typecheck 2>&1 | tee -a /tmp/diagnostics.log
pnpm test 2>&1 | tee -a /tmp/diagnostics.log


## Step 2: Parse Errors (Project-Specific)
bash
# This project has strict thresholds (set during META_CUSTOMIZE)
ERROR_COUNT=$(grep -c "error" /tmp/diagnostics.log)
WARN_COUNT=$(grep -c "warning" /tmp/diagnostics.log)
CRITICAL_THRESHOLD=30  # Customized for this project
```

**The Self-Customization Loop:**

```
Install SkillKit
  ↓
META_CUSTOMIZE runs (FIRST TASK!)
  ↓
Agent reviews ALL workflows:
  - Tests each command
  - Adjusts package manager (npm → pnpm)
  - Adjusts paths (src/ → app/)
  - Adjusts thresholds (50 → 30 errors)
  - Saves customizations
  ↓
Workflows are now PROJECT-SPECIFIC
  ↓
User runs: /REVIEW_SKILLKIT
  - Agent re-evaluates workflows
  - Suggests improvements
  - User approves changes
  ↓
Workflows evolve with project!
```

**This is the moat:**
1. Generic text → Granular commands
2. Standard template → Project-specific
3. One-time setup → Continuous evolution
4. **Self-adjusting system!**

---

## 🚀 Cursor-First Roadmap (FOCUSED)

### Phase 1: Core for Cursor (Week 1 - Days 1-3)

**Goal:** Perfect Cursor integration

**Tasks:**

**Day 1: Cleanup Current Codebase**
```bash
# 1. Delete JS execution engine
rm -rf src/runtime/executor.ts
rm examples/skills/*/index.js

# 2. Keep workflow system
# ✅ templates/workflows/
# ✅ src/cli-commands/init.ts
# ✅ src/intelligence/

# 3. Keep package runner
# ✅ src/cli-commands/diagnose.ts
# ✅ src/cli-commands/exec.ts
# ✅ src/adapters/

# 4. Update CLI
# Remove: tsk run <skill>
# Keep: tsk diagnose, tsk init, tsk verify
```

**Day 2: Add META Workflows**
```bash
# 1. Create META_CUSTOMIZE.md
templates/workflows/META_CUSTOMIZE.md
  - Review package manager
  - Review project structure
  - Test all commands
  - Update workflow placeholders
  - Save configuration

# 2. Create META_WORKFLOW_TEMPLATE.md
templates/workflows/META_WORKFLOW_TEMPLATE.md
  - Template for creating NEW workflows
  - Guides agent through workflow creation
  - Follows established patterns

# 3. Create REVIEW_SKILLKIT.md
.cursor/commands/REVIEW_SKILLKIT.md
  - Agent reviews all workflows
  - Suggests improvements
  - Tests everything still works
```

**Day 3: Skills Integration**
```bash
# 1. Add OpenSkills as dependency
npm install @openskills/core

# 2. Create skills wrapper
src/skills/openskills-wrapper.ts
  - Wraps OpenSkills API
  - Installs to .claude/skills/
  - Generates skill references in workflows

# 3. Update workflows to reference skills
BEGIN_SESSION.md → Add skill discovery
FIX_BUGS.md → Reference relevant skills
IMPLEMENT_FEATURE.md → Reference relevant skills
```

**Deliverables:**
```bash
# Working commands:
tsk init --cursor          # Install for Cursor
tsk verify                 # Test installation
/META_CUSTOMIZE            # First-run customization
/META_WORKFLOW_TEMPLATE    # Create new workflows
/REVIEW_SKILLKIT          # Review & improve
/BEGIN_SESSION            # Standard workflows...

# With skills integration:
tsk skills install anthropics/skills
# Workflows now reference: "If PDF needed, read .claude/skills/pdf/SKILL.md"
```

---

### Phase 2: Polish Cursor (Week 1 - Days 4-5)

**Goal:** Production-ready for Cursor

**Tasks:**

**Day 4: Error Handling & Edge Cases**
- Handle missing commands gracefully
- Better error messages
- Rollback on failed customization
- Validate all customizations

**Day 5: Documentation & Testing**
- Update all docs for Cursor-first
- Test on fresh projects
- Create demo video
- Write blog post

**Deliverables:**
- ✅ Production-ready for Cursor
- ✅ Full documentation
- ✅ Demo & marketing materials

---

### Phase 3: Cross-Platform (Week 2 - FUTURE)

**Goal:** Expand to VSCode, Claude Code, Windsurf

**AFTER Cursor is perfect!**

**Tasks:**
- VSCode tasks.json generator
- Claude Code skill packaging
- Windsurf actions (if API known)
- Universal AGENTS.md generation

---

## 📋 The Two META Workflows

### 1. META_CUSTOMIZE.md (Post-Install)

**Purpose:** Customize SkillKit to THIS project

**When:** Run ONCE after installation

**What it does:**
```markdown
# Step 1: Detect Environment
- Package manager: npm/pnpm/yarn
- Test runner: jest/vitest/pytest
- Project structure: src/ vs app/
- Available scripts in package.json

# Step 2: Test Commands
- Try: pnpm lint
- Try: pnpm test
- Try: pnpm typecheck
- Note which work, which don't

# Step 3: Update ALL Workflows
- Replace {{PACKAGE_MANAGER}} with detected
- Replace {{SRC_DIR}} with detected
- Replace {{TEST_CMD}} with detected
- Save changes to all workflow files

# Step 4: Set Thresholds
- Ask user: "How many errors is critical?" (default: 50)
- Ask user: "Max warnings before alert?" (default: 100)
- Save to .skillkit/config.json

# Step 5: Verify
- Run: tsk verify
- Show results
- Fix any issues

# Step 6: Done!
- Show summary
- Next step: /BEGIN_SESSION
```

---

### 2. META_WORKFLOW_TEMPLATE.md (Create New Workflows)

**Purpose:** Guide agent to create NEW workflows following patterns

**When:** User wants custom workflow

**What it does:**
```markdown
# Create New Workflow

## Step 1: Purpose
Ask user: "What should this workflow do?"
Example: "Deploy to staging environment"

## Step 2: Steps
List out the steps:
1. Run tests
2. Build production bundle
3. Deploy to staging
4. Verify deployment
5. Notify team

## Step 3: Commands
For each step, define exact commands:
bash
pnpm test
pnpm build
# ... etc


## Step 4: Decision Logic
Add any routing/decisions:
IF tests fail → abort
IF build fails → abort
ELSE → continue

## Step 5: Generate File
Create: .cursor/commands/DEPLOY_STAGING.md
Following the established pattern:
- Clear step titles
- Bash code blocks
- Decision logic
- Routes to other workflows

## Step 6: Test
Try the new workflow:
- /DEPLOY_STAGING
- See if it works
- Adjust if needed

## Step 7: Add to Menu
Update BEGIN_SESSION.md menu to include new workflow
```

---

### 3. REVIEW_SKILLKIT.md (Continuous Improvement)

**Purpose:** Periodic review and adjustment

**When:** Weekly or when project changes

**What it does:**
```markdown
# Review SkillKit

## Step 1: Test All Commands
Run through each workflow's commands:
- Do they still work?
- Any deprecated?
- Any new ones needed?

## Step 2: Check Thresholds
- Are error thresholds still appropriate?
- Project grown? Adjust limits
- Project stabilized? Tighten limits

## Step 3: Review Decision Trees
- Are routing decisions still correct?
- New patterns emerged?
- Update decision logic

## Step 4: Suggest Improvements
Agent reviews all workflows and suggests:
- Redundant steps to remove
- Missing error handling
- Better commands available
- New workflows needed

## Step 5: Apply Changes
User approves suggestions
Agent updates workflows
Run: tsk verify

## Step 6: Done!
SkillKit refreshed for current project state
```

---

## 🔗 How Skills & Workflows Integrate (NO Conflict!)

### The Reference Pattern:

**In workflow files:**

```markdown
# IMPLEMENT_FEATURE.md

## Phase 1: Setup

## Phase 2: If Special Tools Needed

### PDF Processing
If feature requires PDF work:
bash
# Check if PDF skill installed
if [ -d ".claude/skills/pdf" ]; then
  echo "PDF skill available"
  echo "Read: .claude/skills/pdf/SKILL.md for instructions"
else
  echo "Install PDF skill: tsk skills install anthropics/skills"
fi


### Excel/Spreadsheet Work
If feature requires spreadsheet work:
  → Read: .claude/skills/xlsx/SKILL.md
  → Follow its instructions

### Custom Data Processing
If complex data transformation:
  → Read: .claude/skills/data-analysis/SKILL.md

## Phase 3: Implementation
[Continue with standard feature implementation...]
```

**Key Points:**

1. **Workflows = Orchestration** (when to use what)
2. **Skills = Tools** (how to use specific tools)
3. **Workflows reference skills** ("if PDF needed, read this")
4. **No code execution** - just doc references!
5. **Agent reads both** - workflows guide, skills instruct

**Example Flow:**

```
User: /IMPLEMENT_FEATURE
  ↓
Agent reads: .cursor/commands/IMPLEMENT_FEATURE.md
  ↓
Workflow says: "If PDF processing needed..."
  ↓
Agent reads: .claude/skills/pdf/SKILL.md
  ↓
Agent follows PDF skill instructions
  ↓
Agent continues with workflow
  ↓
Workflow routes to: /FIX_BUGS (if errors)
  ↓
Complete!
```

**No conflict! Perfect integration!**

---

## 🎯 Updated Vision & Positioning

### Vision Statement:

**"SkillKit: Self-Customizing Workflow Orchestration for AI-Assisted Development"**

**What makes it unique:**

1. **Granular Instructions**
   - Text → Structured commands
   - Reproducible results

2. **Self-Customization**
   - META workflows adjust to project
   - Continuous improvement loop

3. **Skills Integration**
   - Works WITH Anthropic skills
   - Works WITH any doc-based tools
   - Orchestrates everything

4. **Environment Intelligence**
   - Detects stack automatically
   - Installs right workflows
   - Runs right commands

**For Cursor (Phase 1):**
- Native commands integration
- Reliable workflow delivery
- Skills orchestration layer

**Future (Phase 2):**
- VSCode, Claude Code, Windsurf
- Universal AGENTS.md
- Cross-platform workflows

---

## ✅ Key Decisions Made

**1. Cursor First, Then Expand**
- ✅ Perfect Cursor integration (Week 1)
- 🔜 Cross-platform later (Week 2+)

**2. OpenSkills as Dependency**
- ✅ Use their package management
- ✅ We focus on workflows
- ✅ Both show up in AGENTS.md

**3. No Code Execution**
- ❌ Delete JS execution engine
- ✅ Doc-based only
- ✅ Package commands only

**4. META Workflows = The Moat**
- ✅ Self-customization
- ✅ Continuous improvement
- ✅ Project-specific evolution

**5. Skills & Workflows Complement**
- ✅ Workflows reference skills
- ✅ No conflict
- ✅ Perfect integration

---

## 📊 Success Metrics (Cursor Phase)

**Week 1 Goals:**

1. ✅ Clean codebase (no JS execution)
2. ✅ META_CUSTOMIZE working
3. ✅ META_WORKFLOW_TEMPLATE working
4. ✅ REVIEW_SKILLKIT working
5. ✅ OpenSkills integrated
6. ✅ Workflows reference skills
7. ✅ Full documentation
8. ✅ Demo video

**Definition of Done:**

User can:
```bash
npm install -g @trinity-os/skillkit
cd my-project
tsk init --cursor
# META_CUSTOMIZE runs automatically
/BEGIN_SESSION
# Everything works!
tsk skills install anthropics/skills
# Workflows now reference skills
/REVIEW_SKILLKIT
# Agent suggests improvements
```

**And it's production-ready for Cursor!**

---

**Focus: Cursor First. Perfect it. Then expand.** 🎯

