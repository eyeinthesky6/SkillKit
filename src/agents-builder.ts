import { promises as fs } from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { checkOpenSkills } from './skill-loader.js';

/**
 * Build unified AGENTS.md that combines:
 * 1. SkillKit workflows catalog
 * 2. Subtasks reference
 * 3. OpenSkills catalog (if installed)
 */

interface Workflow {
  name: string;
  description: string;
  trigger: string;
  purpose: string;
  duration?: string;
}

interface Subtask {
  name: string;
  purpose: string;
  file: string;
}

/**
 * Load workflows from .cursor/commands/
 */
async function loadWorkflows(workflowsDir: string): Promise<Workflow[]> {
  const workflows: Workflow[] = [];
  
  try {
    const files = await fs.readdir(workflowsDir);
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(workflowsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract title and purpose
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const purposeMatch = content.match(/\*\*Purpose:\*\*\s+(.+)$/m);
      
      if (titleMatch) {
        const name = titleMatch[1].trim();
        const trigger = `/${name.toUpperCase().replace(/\s+/g, '_')}`;
        const purpose = purposeMatch ? purposeMatch[1].trim() : '';
        
        workflows.push({
          name,
          trigger,
          purpose,
          description: purpose
        });
      }
    }
  } catch {
    // Directory doesn't exist yet, return empty
    return [];
  }
  
  return workflows;
}

/**
 * Load subtasks from docs/workflows/subtasks/
 */
async function loadSubtasks(subtasksDir: string): Promise<Subtask[]> {
  const subtasks: Subtask[] = [];
  
  try {
    const files = await fs.readdir(subtasksDir);
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      const filePath = path.join(subtasksDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Extract title and purpose
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const purposeMatch = content.match(/^##\s+Purpose\s*\n(.+)$/m);
      
      if (titleMatch) {
        const name = file.replace('.md', '');
        const purpose = purposeMatch ? purposeMatch[1].trim() : '';
        
        subtasks.push({
          name,
          purpose,
          file: `docs/workflows/subtasks/${file}`
        });
      }
    }
  } catch {
    // Directory doesn't exist, return empty
    return [];
  }
  
  return subtasks;
}

/**
 * Get OpenSkills catalog (if available)
 */
function getOpenSkillsCatalog(): string | null {
  if (!checkOpenSkills()) {
    return null;
  }
  
  try {
    // Check if skills are installed
    const result = execSync('openskills list', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    if (result.includes('No skills installed')) {
      return null;
    }
    
    // Get the XML catalog by running sync with dry-run (if supported)
    // Otherwise, just note that skills exist
    return `
<skills_system priority="1">

## Anthropic Skills (Installed via OpenSkills)

**Load skills using:**
\`\`\`bash
tsk skill:load <skill-name>
\`\`\`

**Available skills:**
- Run \`openskills list\` to see installed skills
- Run \`tsk skill:load <skill-name>\` to load domain expertise

**Common skills:**
- \`pdf\` - PDF manipulation (extract, merge, create)
- \`xlsx\` - Spreadsheet creation and analysis
- \`docx\` - Word document editing
- \`pptx\` - PowerPoint presentations
- \`canvas-design\` - Visual art and design
- \`algorithmic-art\` - Generative art with p5.js
- \`webapp-testing\` - Playwright testing
- \`mcp-builder\` - MCP server creation

**How it works:**
1. Workflow detects need for domain expertise
2. Run \`tsk skill:load <skill>\` to load 200-600 lines of expert guidance
3. AI reads and applies the skill content
4. Return to main workflow

</skills_system>
`;
  } catch {
    return null;
  }
}

/**
 * Build unified AGENTS.md
 */
export async function buildAgentsMD(projectRoot: string = process.cwd()): Promise<void> {
  const sections: string[] = [];
  
  // Header
  sections.push('# AGENTS.md');
  sections.push('');
  sections.push('**AI Agent Guidance for this Project**');
  sections.push('');
  sections.push('---');
  sections.push('');
  
  // SkillKit Workflows Section
  sections.push('## 🔄 SkillKit Workflows');
  sections.push('');
  sections.push('**Procedural workflows for development tasks.**');
  sections.push('');
  
  // Load workflows from .cursor/commands/
  const workflowsDir = path.join(projectRoot, '.cursor', 'commands');
  const workflows = await loadWorkflows(workflowsDir);
  
  if (workflows.length > 0) {
    sections.push('### Available Workflows:');
    sections.push('');
    
    workflows.forEach(workflow => {
      sections.push(`#### ${workflow.trigger}`);
      sections.push(`- **Purpose:** ${workflow.purpose}`);
      sections.push(`- **Location:** \`.cursor/commands/${workflow.name}.md\``);
      sections.push('');
    });
  } else {
    sections.push('*No workflows installed yet. Run `tsk init --cursor` to install.*');
    sections.push('');
  }
  
  sections.push('**How to use:**');
  sections.push('- Type the trigger (e.g., `/BEGIN_SESSION`) in Cursor');
  sections.push('- Follow the workflow steps');
  sections.push('- Workflows reference subtasks for detailed guidance');
  sections.push('');
  sections.push('---');
  sections.push('');
  
  // Subtasks Section
  sections.push('## 📦 Workflow Subtasks');
  sections.push('');
  sections.push('**Granular, reusable components (15-25 lines each).**');
  sections.push('');
  
  const subtasksDir = path.join(projectRoot, 'docs', 'workflows', 'subtasks');
  const subtasks = await loadSubtasks(subtasksDir);
  
  if (subtasks.length > 0) {
    sections.push('### Available Subtasks:');
    sections.push('');
    
    // Group by category
    const categories: Record<string, Subtask[]> = {
      'Testing & Quality': [],
      'Git Operations': [],
      'Diagnostics': [],
      'Skills & Domain': [],
      'Other': []
    };
    
    subtasks.forEach(subtask => {
      if (subtask.name.includes('test') || subtask.name.includes('lint') || subtask.name.includes('typecheck')) {
        categories['Testing & Quality'].push(subtask);
      } else if (subtask.name.includes('commit') || subtask.name.includes('branch') || subtask.name.includes('backup') || subtask.name.includes('rollback')) {
        categories['Git Operations'].push(subtask);
      } else if (subtask.name.includes('diagnos') || subtask.name.includes('analyze') || subtask.name.includes('check')) {
        categories['Diagnostics'].push(subtask);
      } else if (subtask.name.includes('skill') || subtask.name.includes('load')) {
        categories['Skills & Domain'].push(subtask);
      } else {
        categories['Other'].push(subtask);
      }
    });
    
    Object.entries(categories).forEach(([category, tasks]) => {
      if (tasks.length === 0) return;
      
      sections.push(`**${category}:**`);
      tasks.forEach(subtask => {
        sections.push(`- \`${subtask.file}\` - ${subtask.purpose}`);
      });
      sections.push('');
    });
  } else {
    sections.push('*No subtasks found.*');
    sections.push('');
  }
  
  sections.push('**Referenced by workflows via:** `@docs/workflows/subtasks/[name].md`');
  sections.push('');
  sections.push('---');
  sections.push('');
  
  // OpenSkills Section
  const skillsCatalog = getOpenSkillsCatalog();
  
  if (skillsCatalog) {
    sections.push('## 🎯 Domain Skills (Anthropic via OpenSkills)');
    sections.push('');
    sections.push('**Deep domain expertise (200-600 lines per skill).**');
    sections.push('');
    sections.push(skillsCatalog);
    sections.push('');
    sections.push('---');
    sections.push('');
  }
  
  // Project Information Section
  sections.push('## 📋 Project Information');
  sections.push('');
  sections.push('**This section should be customized for your project.**');
  sections.push('');
  sections.push('### Tech Stack');
  sections.push('- Language: [Your language]');
  sections.push('- Package Manager: [npm/yarn/pnpm/pip/etc]');
  sections.push('- Test Framework: [jest/pytest/etc]');
  sections.push('- Linter: [eslint/pylint/etc]');
  sections.push('');
  sections.push('### Key Commands');
  sections.push('```bash');
  sections.push('npm install    # Install dependencies');
  sections.push('npm test       # Run tests');
  sections.push('npm run lint   # Lint code');
  sections.push('npm run build  # Build project');
  sections.push('```');
  sections.push('');
  sections.push('### Project Structure');
  sections.push('```');
  sections.push('src/          # Source code');
  sections.push('tests/        # Tests');
  sections.push('docs/         # Documentation');
  sections.push('.cursor/      # SkillKit workflows');
  sections.push('```');
  sections.push('');
  sections.push('**💡 Tip:** Run `/META_CUSTOMIZE` to customize this file for your project!');
  sections.push('');
  sections.push('---');
  sections.push('');
  
  // Footer
  sections.push('## 🚀 Getting Started');
  sections.push('');
  sections.push('1. **Start a session:** Type `/BEGIN_SESSION` in Cursor');
  sections.push('2. **Choose a workflow:** Based on what you need to do');
  sections.push('3. **Follow the steps:** Workflows guide you through the process');
  sections.push('4. **Load skills when needed:** Use `tsk skill:load <skill>` for domain expertise');
  sections.push('5. **Customize:** Run `/META_CUSTOMIZE` to tailor SkillKit to your project');
  sections.push('');
  sections.push('---');
  sections.push('');
  sections.push('*Generated by SkillKit 2.0 - Terminal-aware workflow orchestration + Anthropic skills integration*');
  
  // Write AGENTS.md
  const agentsMDPath = path.join(projectRoot, 'AGENTS.md');
  await fs.writeFile(agentsMDPath, sections.join('\n'), 'utf-8');
}

/**
 * CLI-friendly version with output
 */
export async function buildAgentsMDWithOutput(projectRoot: string = process.cwd()): Promise<void> {
  console.log('🔨 Building unified AGENTS.md...');
  
  await buildAgentsMD(projectRoot);
  
  console.log('✓ Generated AGENTS.md');
  console.log('');
  console.log('Combined:');
  console.log('  - SkillKit workflows');
  console.log('  - Granular subtasks');
  
  if (checkOpenSkills()) {
    console.log('  - Anthropic skills (via OpenSkills)');
  } else {
    console.log('  ⚠ OpenSkills not installed - skill section omitted');
    console.log('    Install: npm install -g openskills');
  }
  
  console.log('');
  console.log('📄 Location: ./AGENTS.md');
}

