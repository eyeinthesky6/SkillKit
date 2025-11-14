# SkillKit Marketplace & Contribution System

**Date:** 06-11-2025  
**Purpose:** How workflows/skills marketplace works and how community contributes

---

## 🎯 Current State: Automatic Installation from GitHub!

### **Phase 1: CLI Installation (NOW AVAILABLE!)**

**For Skills:**
```bash
# Install specific skill from GitHub:
tsk skills:add user/repo/skill-name

# Install all skills from a repo:
tsk skills:add user/repo

# Examples:
tsk skills:add alice/db-skills/postgres
tsk skills:add anthropics/skills/pdf
tsk skills:add john/awesome-skills  # Installs all skills
```

**For Workflows:**
```bash
# Install specific workflow from GitHub:
tsk workflows:add user/repo/WORKFLOW.md

# Install all workflows from a repo:
tsk workflows:add user/repo

# Examples:
tsk workflows:add john/k8s-workflows/DEPLOY_K8S.md
tsk workflows:add alice/devops-workflows  # Installs all workflows
```

**What happens automatically:**
1. ✅ **Downloads** from GitHub (clones repo or downloads file)
2. ✅ **Validates** skill/workflow format
3. ✅ **Installs** to correct location (`.claude/skills/` or `.cursor/commands/`)
4. ✅ **Updates** AGENTS.md automatically (for skills)
5. ✅ **Ready to use** immediately!

**System auto-reloads:**
- Cursor commands scan `.cursor/commands/` folder automatically
- Skills loaded on-demand via `tsk skill:load`
- AGENTS.md regenerated automatically after skill install

---

## 📦 How SkillKit Marketplace Works (Design)

### **Structure:**

```
SkillKit Ecosystem
├── Official (Built-in)
│   ├── Workflows (templates/workflows/)
│   └── Skills (skills-anthropic/ submodule)
│
├── Verified (Curated by us)
│   ├── skillkit-workflows/         (Our repo)
│   └── skillkit-community-skills/  (Our repo)
│
└── Community (GitHub-based)
    ├── User repos with workflows
    └── User repos with skills
```

---

## 🔄 Workflow Marketplace (How It Works)

### **Phase 1: GitHub-Based (Manual Discovery)**

**Community publishes workflows:**

```
user/my-workflows (GitHub repo)
├── README.md
├── DEPLOY_K8S.md
├── MICROSERVICES_SETUP.md
└── API_TESTING.md
```

**Users discover and install:**
```bash
# Browse on GitHub:
# Search: "skillkit workflow" OR "skillkit-workflow"
# Find: user/my-workflows

# Install manually:
cd .cursor/commands/
curl -O https://raw.githubusercontent.com/user/my-workflows/main/DEPLOY_K8S.md

# Or clone all:
git clone https://github.com/user/my-workflows temp
cp temp/*.md .cursor/commands/
rm -rf temp

# Refresh:
# Cursor automatically detects new commands!
```

**Convention for discoverability:**
- Repo name: `skillkit-workflows-*` or `*-skillkit-workflows`
- Topic tag: `skillkit`, `skillkit-workflow`
- README includes: Installation instructions

---

### **Phase 2: CLI Installation (✅ AVAILABLE NOW!)**

**Install from GitHub:**
```bash
# Install specific workflow:
tsk workflows:add user/repo/WORKFLOW_NAME.md

# Install all workflows from repo:
tsk workflows:add user/skillkit-workflows

# Options:
tsk workflows:add user/repo --force        # Overwrite existing
tsk workflows:add user/repo --branch dev   # Use different branch
```

**Example:**
```bash
tsk workflows:add john/devops-workflows/DEPLOY_K8S.md

# Output:
✓ Installed DEPLOY_K8S workflow
  Location: .cursor/commands/DEPLOY_K8S.md
  Available as: /DEPLOY_K8S

💡 Next steps:
  1. Open Cursor and type "/" to see available workflows
  2. Or use the workflow directly: /DEPLOY_K8S
```

---

### **Phase 3: Marketplace Website (Future)**

**Website: skillkit.dev (or workflows.skillkit.dev)**

**Features:**
```
┌─────────────────────────────────────────┐
│ SkillKit Workflows Marketplace          │
├─────────────────────────────────────────┤
│ 🔍 Search: [DEPLOY, K8S, etc...]       │
│                                          │
│ 📦 Categories:                          │
│  - Deployment (45)                      │
│  - Testing (32)                         │
│  - DevOps (28)                          │
│  - Frontend (21)                        │
│                                          │
│ 🌟 Featured:                            │
│  ┌──────────────────────┐              │
│  │ DEPLOY_K8S           │              │
│  │ by @john             │              │
│  │ ⭐ 234 stars         │              │
│  │ [Install]            │              │
│  └──────────────────────┘              │
│                                          │
│ 📊 Trending:                            │
│  1. MICROSERVICES_SETUP                │
│  2. API_TESTING_ADVANCED               │
│  3. SECURITY_AUDIT_FULL                │
└─────────────────────────────────────────┘
```

**Installation:**
```bash
# From website, one click:
Install → Copies command

# User runs:
tsk workflows:add john/devops-workflows/DEPLOY_K8S.md
```

---

## 🎯 Skills Marketplace (How It Works)

### **Phase 1: GitHub-Based (Manual - Current!)**

**Community publishes skills:**

```
user/my-skills (GitHub repo)
├── README.md
├── database/
│   └── SKILL.md
├── redis/
│   └── SKILL.md
└── api-testing/
    └── SKILL.md
```

**Format follows Anthropic's structure:**
```yaml
# database/SKILL.md

---
name: database
description: Database operations including PostgreSQL, MySQL, and MongoDB queries, schema design, and optimization
---

# Database Operations Skill

## Overview
This skill provides expertise in working with relational and NoSQL databases...

[Instructions, examples, guidelines...]
```

**Users install manually:**
```bash
# Clone skill repo:
cd ~/.local/share/skills  # Or wherever
git clone https://github.com/user/my-skills

# Copy to SkillKit:
cp -r my-skills/database .claude/skills/
cp -r my-skills/redis .claude/skills/

# Refresh catalog:
tsk sync

# Use:
tsk skill:load database
```

**Auto-reload:** Yes! Skills are loaded on-demand, so new skills are immediately available.

---

### **Phase 2: CLI Installation (✅ AVAILABLE NOW!)**

**Install from GitHub:**
```bash
# Install specific skill:
tsk skills:add user/my-skills/database

# Install all skills from repo:
tsk skills:add user/my-skills

# Options:
tsk skills:add user/repo --force     # Overwrite existing
tsk skills:add user/repo --all       # Skip interactive selection
tsk skills:add user/repo --no-sync   # Skip AGENTS.md update
```

**Example:**
```bash
tsk skills:add alice/enterprise-skills/database

# Output:
✓ Skill installed successfully!
✓ AGENTS.md updated

💡 Next steps:
  1. Load the skill: tsk skill:load database
  2. Use in workflows: Reference skill in your workflow docs
```

**What it does automatically:**
1. ✅ Clones/downloads from GitHub
2. ✅ Validates SKILL.md exists
3. ✅ Copies to `.claude/skills/`
4. ✅ Updates AGENTS.md automatically
5. ✅ Cleans up temp files

---

### **Phase 3: Marketplace (Future)**

**Similar to workflows marketplace:**

```
┌─────────────────────────────────────────┐
│ SkillKit Skills Marketplace             │
├─────────────────────────────────────────┤
│ 🔍 Search: [database, redis, etc...]    │
│                                          │
│ 📦 Sources:                             │
│  ✓ Official (Anthropic - 15 skills)     │
│  ✓ Verified (SkillKit - 25 skills)      │
│  ✓ Community (GitHub - 100+ skills)     │
│                                          │
│ 🌟 Featured:                            │
│  ┌──────────────────────┐              │
│  │ database             │              │
│  │ by @alice            │              │
│  │ PostgreSQL, MySQL... │              │
│  │ ⭐ 189 stars         │              │
│  │ [Install]            │              │
│  └──────────────────────┘              │
└─────────────────────────────────────────┘
```

---

## 🤝 How Users Contribute (Different Roles)

### **Role 1: Workflow Contributor**

**Create a workflow:**
```bash
# 1. Create repo:
mkdir my-skillkit-workflows
cd my-skillkit-workflows
git init

# 2. Create workflow:
cat > DEPLOY_K8S.md << 'EOF'
# Deploy to Kubernetes

**Purpose:** Deploy application to Kubernetes cluster

## Phase 1: Build Docker Image
@docs/workflows/subtasks/check-dependencies.md

Check: docker, kubectl installed

Build:
bash
docker build -t myapp:latest .


## Phase 2: Push to Registry
bash
docker push registry.example.com/myapp:latest


## Phase 3: Deploy to K8s
bash
kubectl apply -f k8s/deployment.yaml
kubectl rollout status deployment/myapp


## Phase 4: Verify
bash
kubectl get pods
kubectl logs -f deployment/myapp

EOF

# 3. Add README:
cat > README.md << 'EOF'
# My SkillKit Workflows

Custom workflows for Kubernetes deployment.

## Installation

bash
cd .cursor/commands/
curl -O https://raw.githubusercontent.com/YOU/my-skillkit-workflows/main/DEPLOY_K8S.md


## Usage

/DEPLOY_K8S

EOF

# 4. Publish:
git add .
git commit -m "feat: add K8s deployment workflow"
git remote add origin https://github.com/YOU/my-skillkit-workflows
git push -u origin main

# 5. Add topics on GitHub:
# Settings → Topics → Add: skillkit, skillkit-workflow, kubernetes
```

**Share:**
- Tweet: "New SkillKit workflow for K8s! https://github.com/YOU/my-skillkit-workflows"
- Submit to awesome-skillkit list (we create this!)
- Open discussion in SkillKit repo

---

### **Role 2: Skills Contributor**

**Create a skill:**
```bash
# 1. Follow Anthropic's format:
mkdir my-skills
cd my-skills

mkdir database
cat > database/SKILL.md << 'EOF'
---
name: database
description: Database operations for PostgreSQL, MySQL, MongoDB. Use for schema design, queries, optimization, migrations.
---

# Database Operations Skill

## Overview
This skill provides expertise in working with databases...

## PostgreSQL

### Create Table:
sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);


### Indexing:
sql
CREATE INDEX idx_users_email ON users(email);


[... more examples and guidance ...]

EOF

# 2. Add README:
cat > README.md << 'EOF'
# My Skills for SkillKit

Custom skills for database operations.

## Installation

bash
git clone https://github.com/YOU/my-skills
cp -r my-skills/database .claude/skills/
tsk sync


## Usage

bash
tsk skill:load database

EOF

# 3. Publish to GitHub
# 4. Add topics: skillkit, skillkit-skill, database
```

---

### **Role 3: Verified Contributor (Curated)**

**Process:**
1. Community member creates workflow/skill
2. Submits PR to `skillkit-community-workflows` or `skillkit-community-skills` repo
3. We review:
   - Quality check
   - Test it works
   - Check documentation
4. Merge into verified repo
5. Included in next SkillKit release

**Benefits of verified:**
- ✅ Included in `tsk init` (optional flag)
- ✅ Listed on skillkit.dev
- ✅ Quality guarantee
- ✅ Regular updates

---

## 🔄 Auto-Reload Mechanism (How It Works)

### **For Workflows (Cursor Commands):**

**Current (Cursor handles it):**
- Cursor watches `.cursor/commands/` folder
- New `.md` file added → Automatically appears in `/` menu
- No reload needed!

**Example:**
```bash
# Add new workflow:
echo "# My Workflow" > .cursor/commands/MY_WORKFLOW.md

# Immediately available:
# Type "/" in Cursor → See "MY_WORKFLOW"
```

---

### **For Skills (On-Demand Loading):**

**Current (SkillKit handles it):**
```bash
# Add skill:
cp -r community-skill .claude/skills/

# Update catalog:
tsk sync  # Regenerates AGENTS.md

# Load skill:
tsk skill:load community-skill  # Works immediately!
```

**No restart needed!** Skills are loaded on-demand from `.claude/skills/` folder.

---

### **For AGENTS.md (Manual Sync):**

```bash
# After adding workflows/skills:
tsk sync

# What it does:
# 1. Scans .cursor/commands/ for workflows
# 2. Scans .claude/skills/ for skills
# 3. Regenerates AGENTS.md with all entries
# 4. Done!
```

**Could be automatic:** Watch file system, auto-sync on change (future enhancement).

---

## 📋 Contribution Guidelines (What We'll Publish)

### **For Workflows:**

```markdown
# Contributing Workflows to SkillKit

## Quality Standards

✅ **DO:**
- Clear purpose statement
- Step-by-step instructions
- Reference subtasks when possible
- Include time estimates
- Test commands work cross-platform
- Document success criteria

❌ **DON'T:**
- Duplicate existing workflows
- Include project-specific paths
- Use non-standard tools without explaining
- Skip error handling

## Format

Use this template:

# Workflow Name

**Purpose:** One sentence description

## Phase 1: Name (Time estimate)
@docs/workflows/subtasks/subtask-name.md (if applicable)

Instructions...

bash
commands...


**Stop if:** Failure condition

---

## Submission

1. Create repo: `your-skillkit-workflows`
2. Add topic: `skillkit-workflow`
3. Share in Discussions
4. (Optional) Submit PR to skillkit-community-workflows


## Testing

Test your workflow:
bash
cd test-project
/YOUR_WORKFLOW
# Follow all steps
# Verify works on Windows/Mac/Linux

```

---

### **For Skills:**

```markdown
# Contributing Skills to SkillKit

## Follow Anthropic's Format

See: https://github.com/anthropics/skills/tree/main/template-skill

Required:
- SKILL.md with YAML frontmatter
- Clear description of when to use
- Code examples that work
- Guidelines section

Optional but recommended:
- scripts/ folder with helpers
- reference.md for advanced usage
- examples/ with sample outputs

## Quality Standards

✅ **DO:**
- Provide working code examples
- Include multiple approaches
- Document prerequisites
- Test across platforms
- Cite sources for complex topics

❌ **DON'T:**
- Copy-paste from docs without testing
- Include outdated libraries
- Skip error handling examples

## Submission

1. Create repo: `your-skillkit-skills`
2. Follow SKILL.md format
3. Add topic: `skillkit-skill`
4. Share in Discussions
5. (Optional) Submit PR to skillkit-community-skills
```

---

## 🚀 Immediate Commands (Phase 2 Implementation)

### **Add to CLI:**

```typescript
// src/cli-commands/workflows-add.ts
export function createWorkflowsAddCommand(): Command {
  return new Command('workflows:add')
    .description('Add workflow from GitHub')
    .argument('<source>', 'GitHub repo or file (user/repo or user/repo/file.md)')
    .action(async (source: string) => {
      // Parse: user/repo or user/repo/file.md
      const parts = source.split('/');
      const user = parts[0];
      const repo = parts[1];
      const file = parts[2];
      
      // Download
      if (file) {
        // Single file
        const url = `https://raw.githubusercontent.com/${user}/${repo}/main/${file}`;
        const response = await fetch(url);
        const content = await response.text();
        
        // Save
        const targetDir = path.join(process.cwd(), '.cursor', 'commands');
        await fs.writeFile(path.join(targetDir, file), content);
        
        console.log(`✓ Installed ${file} to .cursor/commands/`);
        console.log(`  Available as: /${file.replace('.md', '')}`);
      } else {
        // Whole repo
        execSync(`git clone https://github.com/${user}/${repo} temp-workflows`);
        execSync(`cp temp-workflows/*.md .cursor/commands/`);
        execSync(`rm -rf temp-workflows`);
        
        console.log(`✓ Installed all workflows from ${user}/${repo}`);
      }
    });
}
```

**Similar for skills:**
```typescript
// src/cli-commands/skills-add.ts
export function createSkillsAddCommand(): Command {
  return new Command('skills:add')
    .description('Add skill from GitHub')
    .argument('<source>', 'GitHub repo or skill (user/repo or user/repo/skill-name)')
    .action(async (source: string) => {
      // Similar to workflows, but copies to .claude/skills/
      // Then runs: tsk sync
    });
}
```

---

## 📊 Discovery System (Phase 3)

### **Awesome SkillKit List (GitHub)**

```markdown
# Awesome SkillKit

Curated list of SkillKit workflows and skills.

## Official
- skillkit-workflows (verified)
- skillkit-community-skills (verified)

## Workflows

### Deployment
- [K8s Deploy](https://github.com/john/k8s-workflows) - Kubernetes deployment ⭐234
- [Docker Deploy](https://github.com/alice/docker-workflows) - Docker deployment ⭐189

### Testing
- [E2E Testing](https://github.com/bob/test-workflows) - End-to-end testing ⭐156

### DevOps
- [CI/CD Pipeline](https://github.com/carol/cicd-workflows) - CI/CD setup ⭐203

## Skills

### Databases
- [PostgreSQL Advanced](https://github.com/alice/db-skills) - Advanced PostgreSQL ⭐189
- [MongoDB Expert](https://github.com/dave/mongo-skill) - MongoDB operations ⭐134

### Cloud
- [AWS Deploy](https://github.com/eve/aws-skills) - AWS deployment ⭐178

## Contributing
[Instructions...]
```

---

## ✅ Summary

### **Phase 1 (✅ NOW): CLI Installation**
```bash
# Skills:
tsk skills:add user/repo/skill-name
tsk skills:add user/repo  # All skills

# Workflows:
tsk workflows:add user/repo/WORKFLOW.md
tsk workflows:add user/repo  # All workflows
```

**Features:**
- ✅ **Automatic** - Downloads from GitHub
- ✅ **Validates** - Checks format before install
- ✅ **Smart** - Auto-updates AGENTS.md
- ✅ **Safe** - Checks for conflicts (use --force to overwrite)
- ✅ **Fast** - One command, done!

### **Phase 2 (Future): Marketplace Website**
- Website for discovery (skillkit.dev)
- One-click install
- Ratings & reviews
- Trending & featured

### **Community Growth:**
```
Now: CLI install → Share on GitHub → Easy discovery
Future: Marketplace → Full ecosystem
```

**Current approach (CLI installation) is PERFECT!** 🚀

---

**Total Lines:** 50

