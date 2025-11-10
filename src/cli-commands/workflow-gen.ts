import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';

export function createWorkflowGenCommand(): Command {
  return new Command('workflow')
    .description('Generate Cursor workflow commands')
    .option('--dir <directory>', 'Target directory for .cursor/commands', process.cwd())
    .option('--template <name>', 'Specific template to generate (BEGIN_SESSION, IMPLEMENT_FEATURE, etc.)')
    .option('--all', 'Generate all workflow templates')
    .action(async (options) => {
      const targetDir = path.join(options.dir, '.cursor', 'commands');
      const templatesDir = path.join(__dirname, '..', '..', 'templates', 'workflows');

      // Check if templates directory exists
      if (!fs.existsSync(templatesDir)) {
        console.error(chalk.red(`\n❌ Templates directory not found at: ${templatesDir}`));
        console.error(chalk.yellow('   Please ensure templates are installed correctly.'));
        process.exit(1);
      }

      // Available workflow templates
      const availableTemplates = [
        { name: 'BEGIN_SESSION', description: 'Start development session with diagnostics' },
        { name: 'IMPLEMENT_FEATURE', description: 'Structured feature implementation' },
        { name: 'FIX_BUGS', description: 'Systematic bug fixing workflow' },
        { name: 'DEPLOY_PREP', description: 'Pre-deployment validation' },
      ];

      let templatesToGenerate: string[] = [];

      if (options.all) {
        templatesToGenerate = availableTemplates.map(t => t.name);
      } else if (options.template) {
        templatesToGenerate = [options.template.toUpperCase()];
      } else {
        // Interactive selection
        const choices = availableTemplates.map(t => ({
          name: `${chalk.cyan(t.name)} - ${t.description}`,
          value: t.name,
          checked: t.name === 'BEGIN_SESSION', // Default check BEGIN_SESSION
        }));

        const answers = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'templates',
            message: 'Select workflow templates to generate:',
            choices,
            validate: (answer) => {
              if (answer.length === 0) {
                return 'You must select at least one template.';
              }
              return true;
            },
          },
        ]);

        templatesToGenerate = answers.templates;
      }

      // Create target directory
      await fs.ensureDir(targetDir);

      console.log(chalk.bold(`\n📝 Generating workflow commands in ${chalk.cyan(targetDir)}...\n`));

      // Generate each template
      for (const templateName of templatesToGenerate) {
        const sourceFile = path.join(templatesDir, `${templateName}.md`);
        const targetFile = path.join(targetDir, `${templateName}.md`);

        if (!fs.existsSync(sourceFile)) {
          console.warn(chalk.yellow(`⚠️  Template not found: ${templateName}`));
          continue;
        }

        try {
          await fs.copy(sourceFile, targetFile, { overwrite: true });
          console.log(chalk.green(`✅ ${templateName}.md`));
        } catch (error) {
          console.error(chalk.red(`❌ Failed to generate ${templateName}: ${error instanceof Error ? error.message : error}`));
        }
      }

      console.log(chalk.bold.green(`\n✅ Workflow generation complete!\n`));
      console.log(chalk.gray('Usage in Cursor IDE:'));
      console.log(chalk.cyan('  1. Type "/" in the chat'));
      console.log(chalk.cyan('  2. Select your workflow (e.g., "BEGIN_SESSION")'));
      console.log(chalk.cyan('  3. The AI agent will follow the workflow steps\n'));
    });
}

