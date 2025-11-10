# SkillKit Evolution Plan: Universal AI Skills Platform

---
**📦 ARCHIVED DOCUMENT**

**Original Date:** November 5, 2025  
**Archive Date:** November 5, 2025  
**Status:** REFERENCE - Technical content valuable, vision superseded

**What to use:**
- ✅ CLI command designs (Section 1.2) - Install, sync, search patterns
- ✅ Installation modes (Section 1.3) - Multi-location storage
- ✅ SKILL.md parsing (Section 1.1) - Parser implementation
- ✅ AGENTS.md generation - Format and logic
- ✅ Interactive TUI patterns - Checkbox selection
- ✅ All code examples and file structures

**What's outdated:**
- ❌ Positioning language - SkillKit now stands alone
- ❌ Timeline references - See current roadmap

**Current documentation:**
- Vision: `/VISION.md`
- Architecture: `/docs/CORRECTED_ARCHITECTURE.md`
- Roadmap: `/docs/BUILD_ORDER_CORRECTED.md`

---

## Phase 1: Package Management Layer - Week 1

### Goal
Build universal package management layer using proven UX patterns and format specifications.

### Features to Add

#### 1.1 SKILL.md Format Support

**File:** `src/formats/skill-md-parser.ts`

```typescript
export interface SkillMDContent {
  metadata: SkillMetadata;  // YAML frontmatter
  instructions: string;      // Markdown content
  mode: 'native' | 'instructional' | 'hybrid';
  resources: {
    scripts: string[];
    references: string[];
    assets: string[];
  };
}

export function parseSkillMD(content: string): SkillMDContent;
export function resolveResources(skillPath: string): ResourceMap;
```

**Tasks:**
- [ ] Parse YAML frontmatter + markdown
- [ ] Support `mode` field (native/instructional/hybrid)
- [ ] Discover bundled resources (scripts/, references/, assets/)
- [ ] Add to registry loader

#### 1.2 CLI Extensions

**New Commands:**

```bash
# Install from GitHub
tsk install anthropics/skills              # Interactive: select skills
tsk install anthropics/skills/pdf          # Install specific skill
tsk install anthropics/skills --all        # Install all
tsk install anthropics/skills --global     # Install globally

# Sync with AGENTS.md
tsk sync                                   # Interactive: select skills
tsk sync --auto                            # Include all installed
tsk sync --output .cursor/agents.md        # Custom output

# Search marketplace
tsk search pdf                             # Search installed + remote
tsk search --remote                        # Search GitHub topics

# Manage
tsk list --format table                    # Pretty table
tsk list --format json                     # JSON output
tsk info <skill-name>                      # Detailed skill info
tsk update <skill-name>                    # Update from source
```

**Implementation:**

```typescript
// src/cli/install.ts
export async function installFromGitHub(
  repo: string,
  options: InstallOptions
): Promise<void> {
  // 1. Clone or download repo
  // 2. Discover SKILL.md or SKILL.yaml files
  // 3. Show interactive checkbox (if not --all)
  // 4. Install selected skills
  // 5. Update registry
}

// src/cli/sync.ts
export async function syncAgentsMD(
  options: SyncOptions
): Promise<void> {
  // 1. Scan installed skills
  // 2. Show interactive checkbox
  // 3. Generate AGENTS.md with <available_skills>
  // 4. Write to output file
}
```

#### 1.3 Installation Modes

**Support Multiple Locations:**

```typescript
// src/config/paths.ts
export const SKILL_PATHS = [
  './.agent/skills',      // Universal (priority 1)
  '~/.agent/skills',      // Universal global (priority 2)
  './.claude/skills',     // Project (priority 3)
  '~/.claude/skills',     // Global (priority 4)
];

export function resolveSkillPath(
  mode: 'project' | 'global' | 'universal'
): string;
```

**Add Flags:**
- `--global` - Install to `~/.claude/skills`
- `--universal` - Install to `.agent/skills` (cross-IDE)
- Default: Install to `./.claude/skills`

#### 1.4 Interactive TUI

**Use [@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts):**

```typescript
import { checkbox, confirm } from '@inquirer/prompts';

// Install selection
const selectedSkills = await checkbox({
  message: 'Select skills to install',
  choices: skills.map(s => ({
    name: s.name,
    value: s.name,
    description: s.description,
    checked: true  // All checked by default
  }))
});

// Sync selection
const skillsToSync = await checkbox({
  message: 'Select skills for AGENTS.md',
  choices: installedSkills.map(s => ({
    name: s.name,
    value: s.name,
    checked: existingSkills.includes(s.name)  // Pre-check existing
  }))
});
```

### Testing

- [ ] Install Anthropic's skills repository
- [ ] Verify SKILL.md parsing
- [ ] Test bundled resources resolution
- [ ] Generate AGENTS.md for Claude Code
- [ ] Test in 3 IDEs: Claude Code, Cursor, Windsurf

---

## Phase 2: Hybrid Execution (v1.2) - Week 3-4

### Goal
Support three execution modes to maximize flexibility while keeping security.

### Features to Add

#### 2.1 Execution Modes

**File:** `src/runtime/executor.ts`

```typescript
export type ExecutionMode = 'native' | 'instructional' | 'hybrid';

export interface ExecutionContext {
  mode: ExecutionMode;
  skill: Skill;
  input: unknown;
  sandbox: Sandbox;
  resources: ResourceMap;
}

export class SkillExecutor {
  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    switch (context.mode) {
      case 'native':
        return this.executeNative(context);
      case 'instructional':
        return this.executeInstructional(context);
      case 'hybrid':
        return this.executeHybrid(context);
    }
  }
  
  private async executeNative(context: ExecutionContext) {
    // Current implementation
    // Load index.js and run
  }
  
  private async executeInstructional(context: ExecutionContext) {
    // Return markdown instructions for agent
    const instructions = await this.loadInstructions(context.skill);
    return {
      success: true,
      mode: 'instructional',
      instructions,
      resources: context.resources,
      baseDir: context.skill.sourcePath
    };
  }
  
  private async executeHybrid(context: ExecutionContext) {
    // 1. Validate input (native)
    const inputValid = await this.validateInput(context);
    if (!inputValid.success) return inputValid;
    
    // 2. Return instructions + validation context
    const instructions = await this.loadInstructions(context.skill);
    return {
      success: true,
      mode: 'hybrid',
      instructions,
      inputValidation: inputValid,
      resources: context.resources,
      // Agent executes, then calls tsk validate-output
    };
  }
}
```

**New CLI Commands:**

```bash
# Execute skill
tsk execute <skill> --input '{"key":"value"}'
tsk execute <skill> --input-file input.json

# Get instructions (for agents)
tsk instructions <skill> --context '{"files":["a.txt"]}'

# Validate only (for hybrid mode)
tsk validate-input <skill> --input '{"key":"value"}'
tsk validate-output <skill> --output '{"result":"ok"}'
```

#### 2.2 AGENTS.md Generator

**File:** `src/generators/agents-md.ts`

```typescript
export interface AgentsMDOptions {
  skills: Skill[];
  outputPath: string;
  includeSchemas: boolean;
  includeInstructions: boolean;
}

export async function generateAgentsMD(
  options: AgentsMDOptions
): Promise<void> {
  const content = `
# Available Skills

<available_skills>

${options.skills.map(skill => `
<skill>
<name>${skill.name}</name>
<description>${skill.description}</description>
<location>${skill.sourcePath}</location>
<mode>${skill.mode || 'native'}</mode>
<command>tsk execute ${skill.name}</command>
${options.includeSchemas ? `
<input_schema>
${JSON.stringify(skill.inputs, null, 2)}
</input_schema>
` : ''}
</skill>
`).join('\n')}

</available_skills>

## How to Use Skills

When a user requests functionality that matches a skill:

1. **Native skills**: Execute via \`tsk execute <skill> --input '...'\`
2. **Instructional skills**: Follow the instructions in SKILL.md
3. **Hybrid skills**: Validate input, follow instructions, validate output

### Examples

**Native Execution:**
\`\`\`
User: "Process data.txt"
Agent: [Executes: tsk execute file-processor --input '{"file":"data.txt"}']
\`\`\`

**Instructional:**
\`\`\`
User: "Create a PDF"
Agent: [Loads: tsk instructions pdf]
[Follows instructions from SKILL.md]
\`\`\`

**Hybrid:**
\`\`\`
User: "Transform data"
Agent: [Validates: tsk validate-input data-transformer --input '...']
[Follows instructions with validated input]
[Validates: tsk validate-output data-transformer --output '...']
\`\`\`
`;

  await fs.promises.writeFile(options.outputPath, content, 'utf8');
}
```

#### 2.3 Cross-IDE Testing

**Test Matrix:**

| IDE | Integration Method | AGENTS.md Location | Test Status |
|-----|-------------------|-------------------|-------------|
| Claude Code | Native + AGENTS.md | `.claude/` | ⬜ |
| Cursor | AGENTS.md | `.cursor/` | ⬜ |
| Windsurf | .windsurfrules | `.windsurf/` | ⬜ |
| Aider | .aider.conf.yml | root | ⬜ |
| GitHub Copilot | Extension API | N/A | ⬜ |

**Integration Scripts:**

```typescript
// src/integrations/claude-code.ts
export function setupClaudeCode(skills: Skill[]): void {
  // Generate .claude/skills/ structure
  // Update Claude Code settings
}

// src/integrations/cursor.ts
export function setupCursor(skills: Skill[]): void {
  // Generate .cursor/agents.md
  // Add to .cursorrules if needed
}

// src/integrations/windsurf.ts
export function setupWindsurf(skills: Skill[]): void {
  // Generate .windsurf/agents.md
  // Update .windsurfrules
}
```

### Testing

- [ ] All three execution modes work
- [ ] AGENTS.md generates correctly
- [ ] Test in Claude Code (native + instructional)
- [ ] Test in Cursor (instructional + hybrid)
- [ ] Test in Windsurf (hybrid)
- [ ] Verify no conflicts between modes

---

## Phase 3: Ecosystem Features (v1.3) - Week 5-6

### Goal
Build marketplace, MCP bridge, and team collaboration features.

### Features to Add

#### 3.1 Skill Marketplace

**Public Registry:**

```typescript
// src/marketplace/registry.ts
export interface SkillRegistryEntry {
  name: string;
  description: string;
  author: string;
  repo: string;
  stars: number;
  downloads: number;
  tags: string[];
  verified: boolean;
}

export async function searchMarketplace(
  query: string
): Promise<SkillRegistryEntry[]> {
  // Search GitHub topics: open-skills, skillkit, agent-skills
  // Query API for repos with SKILL.md
  // Return sorted by relevance + stars
}

export async function getPopularSkills(): Promise<SkillRegistryEntry[]> {
  // Featured skills from registry
}
```

**Commands:**

```bash
tsk marketplace search pdf
tsk marketplace popular
tsk marketplace info anthropics/skills/pdf
tsk marketplace install anthropics/skills/pdf
```

#### 3.2 MCP Bridge (Optional)

**Expose Skills as MCP Tools:**

```typescript
// src/mcp/server.ts
export class SkillKitMCPServer {
  async listTools(): Promise<MCPTool[]> {
    const skills = await this.registry.list();
    return skills.map(skill => ({
      name: skill.name,
      description: skill.description,
      inputSchema: skill.inputs
    }));
  }
  
  async executeTool(name: string, input: unknown): Promise<unknown> {
    const skill = await this.registry.get(name);
    const result = await this.runner.run(skill, input);
    return result.output;
  }
}
```

**Use MCP Servers as Skills:**

```typescript
// src/mcp/client.ts
export class MCPSkillAdapter {
  async convertToSkill(mcpServer: MCPServer): Promise<Skill> {
    const tools = await mcpServer.listTools();
    
    // Generate SKILL.yaml for each tool
    return tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      inputs: tool.inputSchema,
      // ... wrap MCP call in sandbox
    }));
  }
}
```

**Commands:**

```bash
# Start MCP server exposing SkillKit skills
tsk mcp serve --port 3000

# Import MCP server as skills
tsk mcp import http://localhost:3000
```

#### 3.3 Team Collaboration

**Private Registry:**

```typescript
// src/team/registry.ts
export class TeamSkillRegistry {
  constructor(
    private endpoint: string,
    private auth: AuthToken
  ) {}
  
  async publish(skill: Skill): Promise<void> {
    // Upload to team registry
  }
  
  async install(name: string): Promise<void> {
    // Download from team registry
  }
}
```

**Commands:**

```bash
# Configure team registry
tsk team configure --endpoint https://skills.company.com

# Publish private skill
tsk team publish my-skill --private

# Install from team
tsk team install company/internal-skill

# List team skills
tsk team list
```

#### 3.4 Skill Composition

**Chain Skills:**

```typescript
// src/composition/workflow.ts
export interface SkillWorkflow {
  name: string;
  steps: Array<{
    skill: string;
    input: InputSpec;
    output: OutputSpec;
  }>;
}

export async function executeWorkflow(
  workflow: SkillWorkflow,
  initialInput: unknown
): Promise<unknown> {
  let data = initialInput;
  
  for (const step of workflow.steps) {
    const skill = await registry.get(step.skill);
    const result = await runner.run(skill, data);
    data = result.output;
  }
  
  return data;
}
```

**Example Workflow:**

```yaml
# workflows/data-pipeline.yaml
name: data-processing-pipeline
description: Load, transform, and export data
steps:
  - skill: file-loader
    input: { path: "{{input.file}}" }
    output: data
  
  - skill: data-transformer
    input: { data: "{{steps.0.output}}" }
    output: transformed
  
  - skill: report-generator
    input: { data: "{{steps.1.output}}" }
    output: report
```

**Command:**

```bash
tsk workflow run data-pipeline --input '{"file":"data.csv"}'
```

### Testing

- [ ] Marketplace search works
- [ ] MCP server exposes skills correctly
- [ ] MCP clients can be imported as skills
- [ ] Team registry publish/install works
- [ ] Skill workflows execute in sequence
- [ ] Error handling and rollback

---

## Phase 4: Polish & Launch (v1.4) - Week 7-8

### Goal
Production-ready with excellent DX

### Features to Add

#### 4.1 VS Code Extension

**Features:**
- Skill browser in sidebar
- One-click install from marketplace
- Autocomplete for skill names
- Inline skill documentation
- Execute skills from editor

**Commands:**
- `SkillKit: Install Skill`
- `SkillKit: Execute Skill`
- `SkillKit: View Skill Documentation`
- `SkillKit: Sync AGENTS.md`

#### 4.2 Documentation Website

**Pages:**
- Getting Started
- Installation Guide
- Creating Skills
- Marketplace
- API Reference
- IDE Integrations
- Best Practices

**Tech Stack:**
- Docusaurus or VitePress
- Deploy to GitHub Pages
- Search functionality
- Interactive examples

#### 4.3 Improved CLI UX

**Enhancements:**
- Rich error messages with suggestions
- Progress indicators for long operations
- Colored output with syntax highlighting
- Autocomplete for skill names
- Command aliases (`tsk i` = `tsk install`)
- Shell completions (bash, zsh, fish)

#### 4.4 Telemetry (Opt-in)

**Anonymous Usage Stats:**
- Skill installations
- Execution counts
- Error rates
- IDE usage distribution

**Helps prioritize:**
- Which skills to improve
- Which IDEs to focus on
- Common error patterns

---

## Implementation Checklist

### Week 1-2: Foundation
- [ ] SKILL.md parser
- [ ] Bundled resources support
- [ ] `tsk install` from GitHub
- [ ] `tsk sync` AGENTS.md generator
- [ ] Interactive TUI (checkbox selection)
- [ ] Installation modes (project/global/universal)
- [ ] Test with Anthropic skills
- [ ] Document new features

### Week 3-4: Execution
- [ ] Three execution modes (native/instructional/hybrid)
- [ ] `tsk execute` command
- [ ] `tsk instructions` command
- [ ] `tsk validate-input/output` commands
- [ ] Enhanced AGENTS.md with schemas
- [ ] Claude Code integration
- [ ] Cursor integration
- [ ] Windsurf integration
- [ ] Cross-IDE testing

### Week 5-6: Ecosystem
- [ ] Marketplace search API
- [ ] `tsk marketplace` commands
- [ ] MCP server (expose skills)
- [ ] MCP client (import tools)
- [ ] Team registry support
- [ ] Skill workflows
- [ ] Performance optimizations
- [ ] Security audit

### Week 7-8: Launch
- [ ] VS Code extension
- [ ] Documentation website
- [ ] CLI polish & UX improvements
- [ ] Blog post & announcement
- [ ] Submit to IDE marketplaces
- [ ] Community Discord/forum
- [ ] npm publish v1.4

---

## Success Criteria

### Technical
- ✅ Works in 5+ IDEs
- ✅ Compatible with Anthropic skills
- ✅ Compatible with OpenSkills CLI
- ✅ 100% backward compatible
- ✅ <100ms execution overhead
- ✅ >95% test coverage
- ✅ Zero critical security issues

### Adoption
- 🎯 1,000+ npm downloads/week
- 🎯 1,000+ GitHub stars
- 🎯 100+ custom skills published
- 🎯 Featured in 3+ IDE docs
- 🎯 10+ blog posts/tutorials
- 🎯 Active community (Discord/forum)

### Community
- 🎯 50+ contributors
- 🎯 200+ issues/PRs processed
- 🎯 Regular releases (2-week cycle)
- 🎯 Conference talks/presentations

---

## Risk Mitigation

### Risk: Breaking Changes
**Mitigation:**
- Maintain v1.0 compatibility
- Version detection in registry
- Migration guide for v2.0

### Risk: IDE Changes
**Mitigation:**
- Generic AGENTS.md format
- Multiple integration methods
- Community adapters

### Risk: Security Issues
**Mitigation:**
- Regular security audits
- Bug bounty program
- Rapid patch releases

### Risk: Slow Adoption
**Mitigation:**
- Excellent documentation
- Video tutorials
- Quick start templates
- Active community support

---

## Next Steps

**Immediate (Today):**
1. Create feature branch: `feature/universal-compatibility`
2. Install @inquirer/prompts for TUI
3. Start SKILL.md parser implementation

**This Week:**
1. Complete SKILL.md parsing
2. Implement `tsk install` command
3. Test with Anthropic skills

**Next Week:**
1. Implement `tsk sync` command
2. Generate AGENTS.md
3. Test in Claude Code + Cursor

**Ongoing:**
1. Document each feature
2. Write tests for new code
3. Update README with examples
4. Build community engagement

---

**The path is clear. Let's build the future of AI agent skills! 🚀**

