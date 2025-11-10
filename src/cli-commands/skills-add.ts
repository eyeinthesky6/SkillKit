/**
 * CLI Command: skills:add
 * Add community skills from GitHub repositories
 * 
 * Usage:
 *   tsk skills:add user/repo/skill-name    # Install specific skill
 *   tsk skills:add user/repo               # Install all skills from repo
 */

import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';
import { PackageManager } from '../package-manager/index.js';
import { buildAgentsMDWithOutput } from '../agents-builder.js';

export function createSkillsAddCommand(): Command {
  const command = new Command('skills:add');
  
  command
    .description('Add community skills from GitHub repositories')
    .argument('<source>', 'GitHub repo or skill (user/repo or user/repo/skill-name)')
    .option('-f, --force', 'Overwrite existing skills', false)
    .option('-a, --all', 'Install all skills from repo (skip interactive selection)', false)
    .option('--no-sync', 'Skip updating AGENTS.md after installation', false)
    .action(async (source: string, options: { force?: boolean; all?: boolean; sync?: boolean }) => {
      const spinner = ora('Installing skill...').start();
      
      try {
        // Parse source format
        const parts = source.split('/');
        let repoString: string;
        let skillName: string | undefined;
        
        if (parts.length === 2) {
          // Format: user/repo (install all skills)
          repoString = source;
          spinner.text = `Installing all skills from ${chalk.cyan(source)}...`;
        } else if (parts.length >= 3) {
          // Format: user/repo/skill-name (install specific skill)
          repoString = `${parts[0]}/${parts[1]}`;
          skillName = parts.slice(2).join('/');
          spinner.text = `Installing ${chalk.cyan(skillName)} from ${chalk.cyan(repoString)}...`;
        } else {
          spinner.fail(chalk.red('Invalid format'));
          console.error(chalk.yellow('\nExpected formats:'));
          console.error(chalk.cyan('  tsk skills:add user/repo              # Install all skills'));
          console.error(chalk.cyan('  tsk skills:add user/repo/skill-name   # Install specific skill'));
          process.exit(1);
          return;
        }
        
        // Use PackageManager to install
        const pm = new PackageManager();
        
        // Prepare install options
        const installOptions = {
          force: options.force || false,
          all: options.all || !!skillName, // If specific skill, install all (will filter)
          skills: skillName ? [skillName] : undefined,
        };
        
        // Install
        await pm.install(repoString, installOptions);
        
        spinner.succeed(chalk.green('Skill installed successfully!'));
        
        // Update AGENTS.md unless --no-sync
        if (options.sync !== false) {
          const syncSpinner = ora('Updating AGENTS.md...').start();
          try {
            await buildAgentsMDWithOutput(process.cwd());
            syncSpinner.succeed(chalk.green('AGENTS.md updated'));
          } catch (error) {
            syncSpinner.warn(chalk.yellow('AGENTS.md update failed (you can run tsk sync manually)'));
            if (error instanceof Error) {
              console.error(chalk.dim(error.message));
            }
          }
        }
        
        // Show usage instructions
        console.log(chalk.dim('\n─'.repeat(80)));
        console.log(chalk.bold('\n💡 Next steps:'));
        
        if (skillName) {
          console.log(chalk.cyan(`  1. Load the skill: tsk skill:load ${skillName}`));
        } else {
          console.log(chalk.cyan(`  1. List installed skills: tsk list`));
          console.log(chalk.cyan(`  2. Load a skill: tsk skill:load <skill-name>`));
        }
        
        console.log(chalk.cyan(`  3. Use in workflows: Reference skill in your workflow docs`));
        console.log(chalk.dim('\n─'.repeat(80)));
        
      } catch (error) {
        spinner.fail(chalk.red('Installation failed'));
        
        if (error instanceof Error) {
          console.error(chalk.red(`\nError: ${error.message}`));
          
          // Provide helpful error messages
          if (error.message.includes('Failed to clone')) {
            console.error(chalk.yellow('\n💡 Troubleshooting:'));
            console.error(chalk.yellow('  • Check if the repository exists and is public'));
            console.error(chalk.yellow('  • Verify your internet connection'));
            console.error(chalk.yellow('  • Try: git clone https://github.com/' + source.split('/').slice(0, 2).join('/')));
          } else if (error.message.includes('already exists')) {
            console.error(chalk.yellow('\n💡 Use --force to overwrite:'));
            console.error(chalk.cyan(`  tsk skills:add ${source} --force`));
          } else if (error.message.includes('No skills found')) {
            console.error(chalk.yellow('\n💡 This repository may not contain valid skills.'));
            console.error(chalk.yellow('  Skills must have SKILL.md or SKILL.yaml files.'));
          }
        } else {
          console.error(chalk.red(`\nUnexpected error: ${error}`));
        }
        
        process.exit(1);
      }
    });
  
  return command;
}

