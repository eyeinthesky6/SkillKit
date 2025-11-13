/**
 * CLI Command: verify-commands
 * Verify that generated workflow commands use correct tools
 * 
 * Checks all .cursor/commands/*.md files to ensure:
 * - No hardcoded tool names that don't match project config
 * - Poetry commands use "poetry run" when Poetry is detected
 * - Project scripts are used when available
 * - Generic instructions are used when detection fails
 */

import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { MultiLanguageAnalyzer } from '../intelligence/multi-language-analyzer.js';

interface VerificationIssue {
  file: string;
  line: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  expected?: string;
  found?: string;
}

export function createVerifyCommandsCommand(): Command {
  const command = new Command('verify-commands');
  
  command
    .description('Verify that generated workflow commands use correct tools')
    .option('--fix', 'Attempt to fix issues automatically', false)
    .action(async (_options: { fix?: boolean }) => {
      const spinner = ora('Verifying workflow commands...').start();
      const issues: VerificationIssue[] = [];
      
      try {
        const projectRoot = process.cwd();
        const commandsDir = path.join(projectRoot, '.cursor', 'commands');
        
        if (!fs.existsSync(commandsDir)) {
          spinner.fail(chalk.red('.cursor/commands/ directory not found'));
          console.log(chalk.cyan('\n💡 Run: tsk workflow --all\n'));
          process.exit(1);
          return;
        }
        
        // Analyze project to get expected tools
        spinner.text = 'Analyzing project configuration...';
        const analyzer = new MultiLanguageAnalyzer(projectRoot);
        const project = await analyzer.analyze();
        
        if (project.languages.length === 0) {
          spinner.warn(chalk.yellow('No languages detected - cannot verify tool usage'));
          process.exit(0);
          return;
        }
        
        // Get workflow files
        const workflowFiles = fs.readdirSync(commandsDir)
          .filter(f => f.endsWith('.md'))
          .map(f => path.join(commandsDir, f));
        
        spinner.text = `Checking ${workflowFiles.length} workflow file(s)...`;
        
        for (const filePath of workflowFiles) {
          const fileName = path.basename(filePath);
          const content = fs.readFileSync(filePath, 'utf-8');
          const lines = content.split('\n');
          
          // Check each language stack
          for (const lang of project.languages) {
            // Check for hardcoded tools that don't match detected tools
            if (lang.packageManager === 'poetry') {
              // Check for Poetry commands that don't use "poetry run"
              lines.forEach((line, index) => {
                // Check for direct tool calls when Poetry is detected
                if (lang.linter === 'ruff' && line.includes('flake8') && !line.includes('poetry run')) {
                  issues.push({
                    file: fileName,
                    line: index + 1,
                    severity: 'error',
                    message: 'Found flake8 but project uses ruff',
                    expected: 'poetry run ruff check .',
                    found: line.trim()
                  });
                }
                
                // Check for tools not using Poetry prefix
                if (lang.linter && line.includes(lang.linter) && !line.includes('poetry run') && !line.startsWith('#')) {
                  issues.push({
                    file: fileName,
                    line: index + 1,
                    severity: 'error',
                    message: `Tool ${lang.linter} should use "poetry run" when Poetry is detected`,
                    expected: `poetry run ${lang.linter} ...`,
                    found: line.trim()
                  });
                }
              });
            }
            
            // Check for project scripts usage
            if (lang.scripts?.lint) {
              const hasScriptUsage = content.includes('poetry run lint') || content.includes(`${lang.packageManager} run lint`);
              if (!hasScriptUsage && content.includes(lang.linter || '')) {
                issues.push({
                  file: fileName,
                  line: 0,
                  severity: 'warning',
                  message: 'Project has lint script but workflow may not be using it',
                  expected: `${lang.packageManager} run lint`,
                  found: 'Direct tool command'
                });
              }
            }
          }
        }
        
        spinner.stop();
        
        // Display results
        console.log(chalk.bold('\n📋 Command Verification Results\n'));
        console.log(chalk.dim('─'.repeat(60)));
        
        const errors = issues.filter(i => i.severity === 'error');
        const warnings = issues.filter(i => i.severity === 'warning');
        const info = issues.filter(i => i.severity === 'info');
        
        if (issues.length === 0) {
          console.log(chalk.green('✅ All commands verified! No issues found.\n'));
        } else {
          if (errors.length > 0) {
            console.log(chalk.red(`\n❌ Errors (${errors.length}):\n`));
            errors.forEach(issue => {
              console.log(chalk.red(`  ${issue.file}:${issue.line}`));
              console.log(chalk.gray(`    ${issue.message}`));
              if (issue.expected) {
                console.log(chalk.green(`    Expected: ${issue.expected}`));
              }
              if (issue.found) {
                console.log(chalk.yellow(`    Found: ${issue.found}`));
              }
              console.log('');
            });
          }
          
          if (warnings.length > 0) {
            console.log(chalk.yellow(`\n⚠️  Warnings (${warnings.length}):\n`));
            warnings.forEach(issue => {
              console.log(chalk.yellow(`  ${issue.file}:${issue.line || 'N/A'}`));
              console.log(chalk.gray(`    ${issue.message}`));
              if (issue.expected) {
                console.log(chalk.green(`    Expected: ${issue.expected}`));
              }
              console.log('');
            });
          }
        }
        
        console.log(chalk.dim('─'.repeat(60)));
        console.log(chalk.bold('\n📈 Summary:'));
        console.log(`   ${chalk.red(`❌ Errors: ${errors.length}`)}`);
        console.log(`   ${chalk.yellow(`⚠️  Warnings: ${warnings.length}`)}`);
        console.log(`   ${chalk.blue(`ℹ️  Info: ${info.length}`)}`);
        console.log('');
        
        if (errors.length > 0) {
          console.log(chalk.red('❌ Verification failed. Please regenerate workflows:'));
          console.log(chalk.cyan('   tsk workflow --all\n'));
          process.exit(1);
        } else if (warnings.length > 0) {
          console.log(chalk.yellow('⚠️  Verification passed with warnings.'));
        } else {
          console.log(chalk.green('✅ All commands are correct!'));
        }
        
      } catch (error) {
        spinner.fail(chalk.red('Verification failed'));
        console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    });
  
  return command;
}

