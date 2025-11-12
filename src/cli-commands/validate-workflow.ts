/**
 * CLI Command: validate-workflow
 * Validate workflow for conflicts and issues
 * 
 * Checks:
 * - File structure
 * - Subtask references
 * - Skill references
 * - Semantic conflicts
 * - Duplicate functionality
 */

import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  fix?: string;
}

export function createValidateWorkflowCommand(): Command {
  const command = new Command('validate-workflow');
  
  command
    .description('Validate workflow for conflicts and issues')
    .argument('<workflow-file>', 'Path to workflow file (.cursor/commands/WORKFLOW.md or full path)')
    .option('--strict', 'Treat warnings as errors', false)
    .action(async (workflowFile: string, options: { strict?: boolean }) => {
      const spinner = ora('Validating workflow...').start();
      
      try {
        const projectRoot = process.cwd();
        let workflowPath: string;
        
        // Resolve workflow path
        if (path.isAbsolute(workflowFile)) {
          workflowPath = workflowFile;
        } else if (workflowFile.startsWith('.cursor/commands/')) {
          workflowPath = path.join(projectRoot, workflowFile);
        } else {
          // Default location: check .cursor/commands/ directory
          workflowPath = path.join(projectRoot, '.cursor', 'commands', workflowFile);
        }
        
        // Check if file exists
        if (!fs.existsSync(workflowPath)) {
          spinner.fail(chalk.red('Workflow file not found'));
          console.error(chalk.yellow(`\nPath: ${workflowPath}`));
          console.error(chalk.yellow('\nExpected locations:'));
          console.error(chalk.cyan('  .cursor/commands/WORKFLOW.md'));
          console.error(chalk.cyan('  Or provide full path\n'));
          process.exit(1);
          return;
        }
        
        const issues: ValidationIssue[] = [];
        const content = fs.readFileSync(workflowPath, 'utf-8');
        const workflowName = path.basename(workflowPath, '.md');
        
        spinner.text = 'Checking structure...';
        
        // 1. Check file structure
        if (!content.trim()) {
          issues.push({
            severity: 'error',
            category: 'Structure',
            message: 'Workflow file is empty',
            fix: 'Add workflow content'
          });
        }
        
        if (!content.startsWith('#')) {
          issues.push({
            severity: 'warning',
            category: 'Structure',
            message: 'Missing header (should start with #)',
            fix: 'Add "# Workflow Name" as first line'
          });
        }
        
        // 2. Check subtask references
        spinner.text = 'Checking subtask references...';
        const subtaskRefs = content.match(/@docs\/workflows\/subtasks\/[^\s\)]+/g) || [];
        const subtasksDir = path.join(projectRoot, 'docs', 'workflows', 'subtasks');
        
        for (const ref of subtaskRefs) {
          const refPath = ref.replace('@docs/workflows/subtasks/', '');
          const fullPath = path.join(subtasksDir, refPath);
          
          if (!fs.existsSync(fullPath)) {
            issues.push({
              severity: 'error',
              category: 'References',
              message: `Broken subtask reference: ${ref}`,
              fix: `Create subtask or fix path: ${refPath}`
            });
          }
        }
        
        // 3. Check skill references
        spinner.text = 'Checking skill references...';
        const skillLoadPattern = /tsk\s+skill:load\s+(\S+)/g;
        const skillRefs: string[] = [];
        let match;
        
        while ((match = skillLoadPattern.exec(content)) !== null) {
          skillRefs.push(match[1]);
        }
        
        // Check if skills exist
        if (skillRefs.length > 0) {
          try {
            const skillsList = execSync('tsk list', { encoding: 'utf-8', stdio: 'pipe' });
            
            for (const skillName of skillRefs) {
              // Check if skill is in the list
              if (!skillsList.includes(skillName)) {
                issues.push({
                  severity: 'warning',
                  category: 'Skills',
                  message: `Referenced skill not installed: ${skillName}`,
                  fix: `Install skill: tsk install anthropics/skills (select ${skillName}) or tsk skills:add user/repo/${skillName}`
                });
              }
            }
          } catch {
            // If tsk list fails, skip skill checking
            issues.push({
              severity: 'info',
              category: 'Skills',
              message: 'Could not verify skill references (tsk list failed)',
              fix: 'Run tsk list manually to check'
            });
          }
        }
        
        // 4. Check for duplicate workflows (semantic)
        spinner.text = 'Checking for conflicts...';
        const commandsDir = path.join(projectRoot, '.cursor', 'commands');
        
        if (fs.existsSync(commandsDir)) {
          const existingWorkflows = fs.readdirSync(commandsDir)
            .filter(f => f.endsWith('.md') && f !== path.basename(workflowPath))
            .map(f => f.replace('.md', '').toUpperCase());
          
          const workflowNameUpper = workflowName.toUpperCase();
          
          // Check for case variations
          if (existingWorkflows.some(w => w === workflowNameUpper)) {
            issues.push({
              severity: 'error',
              category: 'Conflicts',
              message: `Duplicate workflow name: ${workflowName}`,
              fix: 'Rename workflow or remove duplicate'
            });
          }
          
          // Check for similar names (simple heuristic)
          const similar = existingWorkflows.filter(w => 
            w.includes(workflowNameUpper) || workflowNameUpper.includes(w)
          );
          
          if (similar.length > 0) {
            issues.push({
              severity: 'warning',
              category: 'Conflicts',
              message: `Similar workflow names exist: ${similar.join(', ')}`,
              fix: 'Consider renaming to avoid confusion'
            });
          }
        }
        
        // 5. Check for common skill duplication patterns
        spinner.text = 'Checking for skill duplication...';
        const workflowLower = content.toLowerCase();
        
        // Common patterns that might duplicate skills
        const skillKeywords: { [key: string]: string[] } = {
          'pdf': ['pdf', 'extract pdf', 'parse pdf', 'pdf table'],
          'xlsx': ['excel', 'spreadsheet', 'xlsx', 'csv'],
          'docx': ['word', 'docx', 'document'],
          'database': ['database', 'sql', 'query', 'schema'],
          'canvas-design': ['design', 'canvas', 'poster', 'visual']
        };
        
        for (const [skillName, keywords] of Object.entries(skillKeywords)) {
          const matches = keywords.filter(k => workflowLower.includes(k));
          
          if (matches.length > 0) {
            // Check if workflow references the skill
            if (!skillRefs.includes(skillName)) {
              issues.push({
                severity: 'warning',
                category: 'Skills',
                message: `Workflow mentions "${matches[0]}" but doesn't reference ${skillName} skill`,
                fix: `Consider using skill: tsk skill:load ${skillName} instead of duplicating functionality`
              });
            }
          }
        }
        
        // Display results
        spinner.succeed(chalk.green('Validation complete'));
        
        const errors = issues.filter(i => i.severity === 'error');
        const warnings = issues.filter(i => i.severity === 'warning');
        const info = issues.filter(i => i.severity === 'info');
        
        console.log('');
        console.log(chalk.bold(`📋 Validation Results for: ${workflowName}\n`));
        console.log(chalk.dim('─'.repeat(60)));
        console.log(`Errors: ${errors.length > 0 ? chalk.red(errors.length) : chalk.green('0')}`);
        console.log(`Warnings: ${warnings.length > 0 ? chalk.yellow(warnings.length) : chalk.green('0')}`);
        console.log(`Info: ${info.length > 0 ? chalk.blue(info.length) : chalk.green('0')}`);
        console.log(chalk.dim('─'.repeat(60)));
        console.log('');
        
        // Show errors
        if (errors.length > 0) {
          console.log(chalk.bold.red('🚨 Errors:\n'));
          errors.forEach((issue, idx) => {
            console.log(chalk.red(`${idx + 1}. ${issue.message}`));
            if (issue.fix) {
              console.log(chalk.cyan(`   Fix: ${issue.fix}`));
            }
            console.log('');
          });
        }
        
        // Show warnings
        if (warnings.length > 0) {
          console.log(chalk.bold.yellow('⚠️  Warnings:\n'));
          warnings.forEach((issue, idx) => {
            console.log(chalk.yellow(`${idx + 1}. ${issue.message}`));
            if (issue.fix) {
              console.log(chalk.cyan(`   Fix: ${issue.fix}`));
            }
            console.log('');
          });
        }
        
        // Show info
        if (info.length > 0) {
          console.log(chalk.bold.blue('ℹ️  Info:\n'));
          info.forEach((issue, idx) => {
            console.log(chalk.blue(`${idx + 1}. ${issue.message}`));
            if (issue.fix) {
              console.log(chalk.dim(`   ${issue.fix}`));
            }
            console.log('');
          });
        }
        
        // Summary
        if (errors.length === 0 && warnings.length === 0) {
          console.log(chalk.green.bold('✅ Workflow is valid! No issues found.\n'));
        } else if (errors.length === 0 && !options.strict) {
          console.log(chalk.yellow.bold('⚠️  Workflow has warnings but is usable.\n'));
        } else {
          console.log(chalk.red.bold('❌ Workflow has errors and needs fixes.\n'));
        }
        
        // Exit code
        const hasErrors = errors.length > 0 || (options.strict && warnings.length > 0);
        process.exitCode = hasErrors ? 1 : 0;
        
      } catch (error) {
        spinner.fail(chalk.red('Validation failed'));
        
        if (error instanceof Error) {
          console.error(chalk.red(`\nError: ${error.message}`));
        }
        
        process.exit(1);
      }
    });
  
  return command;
}

