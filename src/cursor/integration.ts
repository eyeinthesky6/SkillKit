/**
 * Cursor IDE Integration
 * 
 * Creates .cursor/commands/ files that reference SkillKit workflows
 * This allows users to invoke workflows via Cursor's slash command system
 */

import fs from 'fs';
import path from 'path';

export interface CursorCommandConfig {
  projectRoot: string;
  commandsDir?: string;
}

export class CursorIntegration {
  private projectRoot: string;
  private commandsDir: string;

  constructor(config: CursorCommandConfig) {
    this.projectRoot = config.projectRoot;
    this.commandsDir = config.commandsDir || path.join(this.projectRoot, '.cursor', 'commands');
  }

  /**
   * Initialize Cursor integration
   */
  async init(): Promise<void> {
    // Create .cursor/commands directory
    fs.mkdirSync(this.commandsDir, { recursive: true });

    // Create entry point command
    await this.createBeginSessionCommand();
    
    // Create workflow shortcuts
    await this.createWorkflowCommands();

    console.log(`✅ Cursor integration initialized at: ${this.commandsDir}`);
    console.log(`\nUse in Cursor: Type "/" and select "Begin Session" or other SkillKit commands`);
  }

  /**
   * Create BEGIN_SESSION command - main entry point
   */
  private async createBeginSessionCommand(): Promise<void> {
    const content = `# Begin Session - SkillKit Entry Point

**What this does:** Runs diagnostics and presents available workflows

## Instructions for Agent

Execute the following command:

\`\`\`bash
tsk diagnose
\`\`\`

After diagnostics complete:

1. Show results to user
2. Run: \`tsk suggest\` to get workflow recommendations
3. Present available workflows:
   - **Quick Check** (\`tsk exec quick-check\`) - Fast lint + typecheck
   - **Full Diagnostics** (\`tsk exec diagnose\`) - Complete health check
   - **Quality Gate** (\`tsk exec quality-gate\`) - Pre-commit validation
   - **Deploy Prep** (\`tsk exec deploy-prep\`) - Ready for production

4. Ask user: "Which workflow would you like to run?"

## Available Commands

\`\`\`bash
# Discover project commands
tsk discover

# Execute specific workflow
tsk exec <workflow-name>

# Run diagnostics
tsk diagnose

# Get suggestions
tsk suggest

# List workflows
tsk list-workflows
\`\`\`

## What SkillKit Does

SkillKit auto-discovers your project's commands (from package.json, pyproject.toml, pom.xml, etc.) and provides intelligent workflow execution.

**No configuration needed** - it just works with your existing project setup!
`;

    fs.writeFileSync(
      path.join(this.commandsDir, 'begin-session.md'),
      content,
      'utf8'
    );
  }

  /**
   * Create workflow shortcut commands
   */
  private async createWorkflowCommands(): Promise<void> {
    const workflows = [
      {
        name: 'quick-check',
        title: 'Quick Check',
        description: 'Fast validation (lint + typecheck)',
        command: 'tsk exec quick-check'
      },
      {
        name: 'quality-gate',
        title: 'Quality Gate',
        description: 'Pre-commit checks (format + lint + test)',
        command: 'tsk exec quality-gate'
      },
      {
        name: 'deploy-prep',
        title: 'Deploy Prep',
        description: 'Pre-deployment validation',
        command: 'tsk exec deploy-prep'
      },
      {
        name: 'fix-errors',
        title: 'Fix Errors',
        description: 'Run linter in fix mode',
        command: 'tsk exec lint --fix'
      }
    ];

    for (const wf of workflows) {
      const content = `# ${wf.title}

**Description:** ${wf.description}

## Instructions for Agent

Execute this command:

\`\`\`bash
${wf.command}
\`\`\`

Then report results to the user.

If any step fails:
1. Show the error
2. Ask if user wants to fix issues
3. If yes, analyze errors and propose fixes
`;

      fs.writeFileSync(
        path.join(this.commandsDir, `${wf.name}.md`),
        content,
        'utf8'
      );
    }
  }

  /**
   * Create custom workflow command
   */
  async createCustomCommand(
    name: string,
    title: string,
    description: string,
    steps: string[]
  ): Promise<void> {
    const stepsText = steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
    const commands = steps.map(s => `tsk exec ${s}`).join('\n');

    const content = `# ${title}

**Description:** ${description}

## Workflow Steps

${stepsText}

## Instructions for Agent

Execute these commands in sequence:

\`\`\`bash
${commands}
\`\`\`

Report results after each step. Stop if any step fails and ask user how to proceed.
`;

    fs.writeFileSync(
      path.join(this.commandsDir, `${name}.md`),
      content,
      'utf8'
    );

    console.log(`✅ Created custom command: ${name}.md`);
  }
}

/**
 * Quick helper to setup Cursor integration
 */
export async function setupCursorIntegration(projectRoot: string) {
  const integration = new CursorIntegration({ projectRoot });
  await integration.init();
  return integration;
}

