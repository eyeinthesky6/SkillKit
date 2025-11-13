import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';
import { loadSkill, checkOpenSkills, listSkills } from '../skill-loader.js';

export function createSkillLoadCommand(): Command {
  const command = new Command('skill:load');
  
  command
    .description('Load an Anthropic skill with terminal awareness')
    .argument('<skill-name>', 'Name of the skill to load (e.g., pdf, xlsx, docx)')
    .option('-v, --verbose', 'Show detailed execution information')
    .option('-l, --list', 'List all available skills first')
    .action(async (skillName: string, options: { verbose?: boolean; list?: boolean }) => {
      // Check if OpenSkills is installed
      if (!checkOpenSkills()) {
        console.error(chalk.red('✗ OpenSkills is not installed!'));
        console.log(chalk.yellow('\nInstall it with:'));
        console.log(chalk.cyan('  npm install -g openskills'));
        console.log(chalk.yellow('\nOr run:'));
        console.log(chalk.cyan('  tsk init --cursor'));
        process.exit(1);
      }
      
      // List skills if requested
      if (options.list) {
        console.log(chalk.blue('\n📚 Available Skills:\n'));
        const listResult = listSkills();
        if (listResult.success && listResult.content) {
          console.log(listResult.content);
        } else {
          console.error(chalk.red('Failed to list skills'));
        }
        console.log('');
        return;
      }
      
      // Load the skill
      const spinner = ora(`Loading ${chalk.cyan(skillName)} skill...`).start();
      
      const result = loadSkill(skillName, options.verbose);
      
      if (result.success && result.content) {
        spinner.succeed(chalk.green(`Loaded ${chalk.cyan(skillName)} skill`));
        
        if (options.verbose && result.command) {
          console.log(chalk.dim(`\nCommand used: ${result.command}\n`));
        }
        
        // Display the skill content with clear markers for agents
        console.log(chalk.bold.cyan('\n' + '═'.repeat(80)));
        console.log(chalk.bold.cyan('📚 SKILL LOADED: ' + skillName.toUpperCase()));
        console.log(chalk.bold.cyan('═'.repeat(80)));
        console.log(chalk.dim('\nThe following content contains the complete skill instructions.'));
        console.log(chalk.dim('You MUST read and apply these instructions for your task.\n'));
        console.log(chalk.dim('─'.repeat(80)));
        console.log(result.content);
        console.log(chalk.dim('─'.repeat(80)));
        console.log(chalk.bold.green('\n✅ SKILL CONTENT LOADED INTO CONTEXT'));
        console.log(chalk.yellow('\n🚨 IMPORTANT FOR AI AGENTS:'));
        console.log(chalk.yellow('   • The skill instructions above are now in your context'));
        console.log(chalk.yellow('   • You MUST use these instructions when working on related tasks'));
        console.log(chalk.yellow('   • Follow the approaches, examples, and best practices shown above'));
        console.log(chalk.yellow('   • Reference this skill knowledge throughout your work\n'));
      } else {
        spinner.fail(chalk.red(`Failed to load ${chalk.cyan(skillName)} skill`));
        
        if (result.error) {
          console.error(chalk.red('\nError:'), result.error);
        }
        
        if (result.command) {
          console.log(chalk.dim(`\nAttempted command: ${result.command}`));
        }
        
        console.log(chalk.yellow('\n💡 Tips:'));
        console.log(chalk.yellow('  1. Check if the skill exists: tsk skill:load --list'));
        console.log(chalk.yellow('  2. Verify OpenSkills is installed: openskills --version'));
        console.log(chalk.yellow('  3. Install Anthropic skills: tsk init --cursor'));
        
        process.exit(1);
      }
    });
  
  return command;
}

