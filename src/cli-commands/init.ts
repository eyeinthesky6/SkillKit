import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import { checkOpenSkills, installAnthropicSkills } from '../skill-loader.js';
import { buildAgentsMD } from '../agents-builder.js';

export function createInitCommand(): Command {
  return new Command('init')
    .description('Initialize SkillKit in current project')
    .option('--cursor', 'Setup Cursor IDE integration')
    .option('--rules', 'Create .cursor/rules/ directory')
    .option('--workflows', 'Generate workflow templates')
    .option('--all', 'Setup everything (Cursor + rules + workflows)')
    .option('--custom-header <text>', 'Custom header text for workflows')
    .action(async (options) => {
      const projectRoot = process.cwd();
      
      console.log(chalk.bold('\n🚀 Initializing SkillKit...\n'));

      // Detect environment
      const hasCursorDir = fs.existsSync(path.join(projectRoot, '.cursor'));
      const isVSCode = fs.existsSync(path.join(projectRoot, '.vscode'));
      const isCursor = hasCursorDir || process.env['TERM_PROGRAM'] === 'cursor';

      let setupCursor = options.cursor || options.all;
      let setupRules = options.rules || options.all;
      let setupWorkflows = options.workflows || options.all;
      let customHeader = options.customHeader || '';

      // Interactive prompts if no options provided
      if (!options.cursor && !options.rules && !options.workflows && !options.all) {
        console.log(chalk.cyan('Detected environment:'));
        console.log(chalk.gray(`  Cursor IDE: ${isCursor ? 'Yes' : 'No'}`));
        console.log(chalk.gray(`  VS Code: ${isVSCode ? 'Yes' : 'No'}`));
        console.log('');

        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'setupWorkflows',
            message: 'Generate workflow templates?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'setupCursor',
            message: 'Setup Cursor IDE integration? (workflows in .cursor/commands)',
            default: isCursor,
            when: (ans) => ans.setupWorkflows,
          },
          {
            type: 'confirm',
            name: 'setupRules',
            message: 'Create .cursor/rules directory?',
            default: isCursor,
            when: (ans) => ans.setupCursor,
          },
          {
            type: 'input',
            name: 'customHeader',
            message: 'Custom header text for workflows (optional, e.g., "NO MOCKS"):',
            default: '',
          },
        ]);

        setupCursor = answers.setupCursor;
        setupRules = answers.setupRules;
        setupWorkflows = answers.setupWorkflows;
        customHeader = answers.customHeader;
      }

      // Create directories
      const dirsCreated: string[] = [];

      if (setupCursor) {
        const commandsDir = path.join(projectRoot, '.cursor', 'commands');
        await fs.ensureDir(commandsDir);
        dirsCreated.push('.cursor/commands');

        if (setupRules) {
          const rulesDir = path.join(projectRoot, '.cursor', 'rules');
          await fs.ensureDir(rulesDir);
          dirsCreated.push('.cursor/rules');
        }
      }

      // Create workflow directories
      const workflowsDir = path.join(projectRoot, 'workflows');
      if (!setupCursor && setupWorkflows) {
        await fs.ensureDir(workflowsDir);
        dirsCreated.push('workflows');
      }

      // Create docs directories
      const docsToCreate = ['docs/AITracking', 'docs/audit'];
      for (const dir of docsToCreate) {
        await fs.ensureDir(path.join(projectRoot, dir));
        dirsCreated.push(dir);
      }

      console.log(chalk.green('\n✅ Directories created:'));
      dirsCreated.forEach((dir) => console.log(chalk.gray(`   ${dir}/`)));

      // Generate workflows with custom header
      if (setupWorkflows) {
        console.log(chalk.bold('\n📝 Generating workflows...\n'));

        const templatesDir = path.join(__dirname, '..', '..', 'templates', 'workflows');
        const targetDir = setupCursor
          ? path.join(projectRoot, '.cursor', 'commands')
          : workflowsDir;

        const workflowFiles = [
          'BEGIN_SESSION.md',
          'IMPLEMENT_FEATURE.md',
          'FIX_BUGS.md',
          'DEPLOY_PREP.md',
          'DEDUP.md',
          'CONTINUE.md',
          'SYSTEM_AUDIT.md',
          'SECURITY_AUDIT.md',
          'META_CUSTOMIZE.md',
          'META_WORKFLOW_TEMPLATE.md',
          'HELP.md',
          'AUDIT_SKILLKIT.md',
        ];

        for (const file of workflowFiles) {
          const sourcePath = path.join(templatesDir, file);
          const targetPath = path.join(targetDir, file);

          if (fs.existsSync(sourcePath)) {
            let content = await fs.readFile(sourcePath, 'utf8');

            // Replace custom header placeholder
            if (customHeader) {
              const headerBlock = `---\n## ⚠️ ${customHeader}\n---`;
              content = content.replace(/## \{\{CUSTOM_HEADER\}\}[\s\S]*?---/g, headerBlock);
            } else {
              // Remove custom header placeholder
              content = content.replace(/---\n## \{\{CUSTOM_HEADER\}\}[\s\S]*?---\n\n/g, '');
            }

            await fs.writeFile(targetPath, content);
            console.log(chalk.green(`   ✅ ${file}`));
          }
        }
      }

      // Copy subtasks directory
      const subtasksSource = path.join(__dirname, '..', '..', 'docs', 'workflows', 'subtasks');
      const subtasksTarget = path.join(projectRoot, 'docs', 'workflows', 'subtasks');
      if (fs.existsSync(subtasksSource)) {
        await fs.copy(subtasksSource, subtasksTarget);
        const subtaskCount = (await fs.readdir(subtasksSource)).length;
        console.log(chalk.green(`   ✅ ${subtaskCount} subtasks copied to docs/workflows/subtasks/`));
      }

      // Create decision tree doc
      const decisionTreeSource = path.join(__dirname, '..', '..', 'docs', 'WORKFLOW_DECISION_TREE.md');
      const decisionTreeTarget = path.join(projectRoot, 'docs', 'WORKFLOW_DECISION_TREE.md');
      if (fs.existsSync(decisionTreeSource)) {
        await fs.copy(decisionTreeSource, decisionTreeTarget);
        console.log(chalk.green(`   ✅ WORKFLOW_DECISION_TREE.md`));
      }

      // Create .cursorules if Cursor setup
      if (setupRules) {
        const rulesPath = path.join(projectRoot, '.cursor', 'rules', 'skillkit-workflows.mdc');
        const rulesContent = `# SkillKit Workflow Rules

## Entry Point

**ALWAYS start with:** \`@BEGIN_SESSION.md\`

This runs diagnostics and presents task menu.

## Routing Logic

- High errors (>50): Route to FIX_BUGS
- Moderate errors (11-50): Suggest fix first
- Low errors (<10): Can proceed with features
- No errors: Ready for any work

## Workflow Files

- \`BEGIN_SESSION.md\` - Session start (diagnostics + menu)
- \`IMPLEMENT_FEATURE.md\` - Build new features
- \`FIX_BUGS.md\` - Fix errors systematically
- \`DEPLOY_PREP.md\` - Pre-deployment checks
- \`DEDUP.md\` - Find duplicate code
- \`CONTINUE.md\` - Resume last work
- \`SYSTEM_AUDIT.md\` - Full health check
- \`SECURITY_AUDIT.md\` - Security review

## Commands

All workflows use \`tsk\` commands:
- \`tsk diagnose\` - Run diagnostics
- \`tsk discover\` - Find project patterns
- \`tsk exec <workflow>\` - Execute workflow
- \`tsk check-issues\` - Check for problems

See docs/WORKFLOW_DECISION_TREE.md for full routing logic.
`;
        await fs.writeFile(rulesPath, rulesContent);
        console.log(chalk.green(`   ✅ skillkit-workflows.mdc`));
      }

      // Summary
      console.log(chalk.bold.green('\n✅ SkillKit initialized!\n'));

      // Install Anthropic skills via OpenSkills
      console.log('');
      console.log(chalk.bold('📚 Setting up Anthropic Skills Integration...\n'));
      
      if (!checkOpenSkills()) {
        console.log(chalk.yellow('⚠ OpenSkills not found'));
        console.log(chalk.gray('   Install it to get access to 15+ Anthropic skills:\n'));
        console.log(chalk.cyan('   npm install -g openskills\n'));
        console.log(chalk.gray('   Then run: openskills install anthropics/skills'));
      } else {
        const installSpinner = ora('Installing Anthropic skills (pdf, xlsx, docx, etc.)...').start();
        
        const installResult = installAnthropicSkills();
        
        if (installResult.success) {
          installSpinner.succeed(chalk.green('Installed 15+ Anthropic skills'));
          console.log(chalk.gray('   Location: .claude/skills/'));
        } else {
          installSpinner.warn(chalk.yellow('Could not install Anthropic skills automatically'));
          console.log(chalk.gray('   Run manually: openskills install anthropics/skills'));
        }
      }
      
      // Generate unified AGENTS.md
      console.log('');
      const agentsSpinner = ora('Generating unified AGENTS.md...').start();
      
      try {
        await buildAgentsMD(projectRoot);
        agentsSpinner.succeed(chalk.green('Generated AGENTS.md'));
        console.log(chalk.gray('   Combined: Workflows + Subtasks + Skills'));
      } catch {
        agentsSpinner.warn(chalk.yellow('Could not generate AGENTS.md'));
        console.log(chalk.gray('   Run manually: tsk sync'));
      }
      
      // Next steps
      console.log('');
      console.log(chalk.bold('📖 Next steps:\n'));
      
      if (setupCursor) {
        console.log(chalk.cyan('   In Cursor IDE:'));
        console.log(chalk.gray('   1. Type "/" in chat'));
        console.log(chalk.gray('   2. Select "BEGIN_SESSION"'));
        console.log(chalk.gray('   3. Follow the workflow\n'));
      }

      console.log(chalk.cyan('   From CLI:'));
      console.log(chalk.gray('   1. Run: tsk diagnose'));
      console.log(chalk.gray('   2. Load a skill: tsk skill:load pdf'));
      console.log(chalk.gray('   3. Customize: /META_CUSTOMIZE\n'));

      if (customHeader) {
        console.log(chalk.yellow(`   Custom header set: "${customHeader}"`));
        console.log(chalk.gray('   This appears at the top of each workflow\n'));
      }

      console.log(chalk.bold('📂 Files created:'));
      console.log(chalk.gray(`   ${setupCursor ? '.cursor/commands/' : 'workflows/'} - Workflow templates`));
      console.log(chalk.gray('   docs/workflows/subtasks/ - 20 granular subtasks'));
      console.log(chalk.gray('   docs/AITracking/ - Work logs'));
      console.log(chalk.gray('   AGENTS.md - Unified catalog'));
      
      if (checkOpenSkills()) {
        console.log(chalk.gray('   .claude/skills/ - Anthropic skills (15+)'));
      }
      
      // Auto-dedupe workflows
      if (setupCursor) {
        console.log(chalk.dim('\n🔍 Checking for duplicate workflows...'));
        const commandsDir = path.join(projectRoot, '.cursor', 'commands');
        
        try {
          const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
          const canonicalNames = new Map<string, string[]>();
          
          files.forEach(f => {
            const canonical = f.toUpperCase();
            const existing = canonicalNames.get(canonical) || [];
            existing.push(f);
            canonicalNames.set(canonical, existing);
          });
          
          let dupsRemoved = 0;
          for (const [, fileList] of canonicalNames) {
            if (fileList.length > 1) {
              // Sort: prefer UPPERCASE
              fileList.sort((a, b) => {
                const aUpper = a === a.toUpperCase();
                const bUpper = b === b.toUpperCase();
                if (aUpper && !bUpper) return -1;
                if (!aUpper && bUpper) return 1;
                return a.localeCompare(b);
              });
              
              // Delete duplicates (keep first)
              for (let i = 1; i < fileList.length; i++) {
                fs.unlinkSync(path.join(commandsDir, fileList[i]));
                dupsRemoved++;
              }
            }
          }
          
          if (dupsRemoved > 0) {
            console.log(chalk.green(`   ✓ Removed ${dupsRemoved} duplicate(s)`));
          } else {
            console.log(chalk.dim('   ✓ No duplicates found'));
          }
        } catch {
          // Ignore deduplication errors
          console.log(chalk.dim('   ⚠ Skipped duplicate check'));
        }
      }
      
      // Setup git post-commit hook for AITracking
      console.log(chalk.dim('\n🔗 Setting up git hooks...'));
      try {
        const gitHooksDir = path.join(projectRoot, '.git', 'hooks');
        const postCommitHook = path.join(gitHooksDir, 'post-commit');
        
        if (fs.existsSync(path.join(projectRoot, '.git'))) {
          await fs.ensureDir(gitHooksDir);
          
          // Detect platform
          const isWindows = process.platform === 'win32';
          const hookScript = isWindows 
            ? path.join(__dirname, '..', '..', 'scripts', 'post-commit-aitracking.bat')
            : path.join(__dirname, '..', '..', 'scripts', 'post-commit-aitracking.sh');
          
          // Check if script exists
          if (fs.existsSync(hookScript)) {
            // Copy hook script
            const hookContent = await fs.readFile(hookScript, 'utf8');
            await fs.writeFile(postCommitHook, hookContent);
            
            // Make executable on Unix
            if (!isWindows) {
              fs.chmodSync(postCommitHook, 0o755);
            }
            
            console.log(chalk.green('   ✓ Post-commit hook installed'));
            console.log(chalk.gray('   Auto-updates AITracking logs after commits'));
          } else {
            console.log(chalk.dim('   ⚠ Hook script not found, skipping'));
          }
        } else {
          console.log(chalk.dim('   ⚠ Not a git repository, skipping hooks'));
        }
      } catch {
        console.log(chalk.dim('   ⚠ Could not setup git hooks'));
      }
      
      console.log('');
      console.log(chalk.bold.green('✅ SkillKit initialized successfully!\n'));
    });
}
