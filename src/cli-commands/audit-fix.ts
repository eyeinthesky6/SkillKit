/**
 * CLI Command: audit:fix
 * Automatically fix safe issues found in audit
 */

import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface AuditIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: string;
  file?: string;
  line?: number;
  message: string;
  impact: string;
  fix: string;
  autoFixable: boolean;
}

export function createAuditFixCommand(): Command {
  const command = new Command('audit:fix');
  
  command
    .description('Automatically fix safe issues from audit')
    .option('--auto-safe', 'Only fix 100% safe issues', false)
    .option('--all', 'Fix all auto-fixable issues (use with caution)', false)
    .option('--dry-run', 'Show what would be fixed without fixing', false)
    .action(async (options: { autoSafe?: boolean; all?: boolean; dryRun?: boolean }) => {
      const spinner = ora('Loading audit results...').start();
      
      try {
        const projectRoot = process.cwd();
        const auditDir = path.join(projectRoot, 'docs', 'audit');
        const latestReport = path.join(auditDir, 'audit-report-latest.json');
        
        // Check if audit has been run
        if (!fs.existsSync(latestReport)) {
          spinner.fail(chalk.red('No audit report found'));
          console.log(chalk.yellow('\nRun audit first:'));
          console.log(chalk.cyan('  tsk audit\n'));
          process.exit(1);
          return;
        }
        
        // Load audit results
        const auditResult = JSON.parse(fs.readFileSync(latestReport, 'utf-8'));
        const allIssues = [
          ...auditResult.critical,
          ...auditResult.warnings,
          ...auditResult.info
        ];
        
        const autoFixable = allIssues.filter((i: AuditIssue) => i.autoFixable);
        
        if (autoFixable.length === 0) {
          spinner.succeed(chalk.green('No auto-fixable issues found'));
          console.log(chalk.dim('\nAll issues require manual intervention.\n'));
          return;
        }
        
        spinner.succeed(chalk.green(`Found ${autoFixable.length} auto-fixable issue(s)`));
        
        // Categorize fixes by safety
        const safeFixes = autoFixable.filter((i: AuditIssue) => 
          i.id.startsWith('DUP-') || // Duplicates
          i.id.startsWith('SKL-agents') // AGENTS.md regeneration
        );
        
        const riskyFixes = autoFixable.filter((i: AuditIssue) => !safeFixes.includes(i));
        
        const fixesToApply = options.all ? autoFixable : safeFixes;
        
        if (!options.all && riskyFixes.length > 0) {
          console.log(chalk.yellow(`\n⚠️  ${riskyFixes.length} fix(es) require --all flag (not 100% safe)`));
        }
        
        if (fixesToApply.length === 0) {
          console.log(chalk.yellow('\nNo safe auto-fixes available. Use --all for risky fixes.\n'));
          return;
        }
        
        // Show what will be fixed
        console.log(chalk.bold(`\n📋 Fixes to apply (${fixesToApply.length}):\n`));
        fixesToApply.forEach((issue: AuditIssue, idx: number) => {
          console.log(chalk.cyan(`${idx + 1}. ${issue.message}`));
          console.log(chalk.dim(`   ${issue.fix}\n`));
        });
        
        if (options.dryRun) {
          console.log(chalk.yellow('🔍 Dry run mode - no changes made\n'));
          return;
        }
        
        // Apply fixes
        const fixSpinner = ora('Applying fixes...').start();
        let fixed = 0;
        let failed = 0;
        
        for (const issue of fixesToApply) {
          try {
            if (issue.id.startsWith('DUP-')) {
              // Fix duplicates
              await fixDuplicates(projectRoot);
              fixed++;
            } else if (issue.id === 'SKL-agents') {
              // Regenerate AGENTS.md
              execSync('tsk sync', { stdio: 'ignore', cwd: projectRoot });
              fixed++;
            }
          } catch (error) {
            failed++;
            fixSpinner.warn(chalk.yellow(`Failed to fix: ${issue.message}`));
            if (error instanceof Error) {
              console.log(chalk.dim(`  ${error.message}\n`));
            }
          }
        }
        
        if (failed === 0) {
          fixSpinner.succeed(chalk.green(`Applied ${fixed} fix(es) successfully`));
        } else {
          fixSpinner.warn(chalk.yellow(`Applied ${fixed} fix(es), ${failed} failed`));
        }
        
        // Recommend re-audit
        console.log('');
        console.log(chalk.bold('📊 Next steps:'));
        console.log(chalk.cyan('1. Verify fixes: tsk audit --verify'));
        console.log(chalk.cyan('2. Fix remaining issues manually'));
        console.log('');
        
      } catch (error) {
        spinner.fail(chalk.red('Fix failed'));
        
        if (error instanceof Error) {
          console.error(chalk.red(`\nError: ${error.message}`));
        }
        
        process.exit(1);
      }
    });
  
  return command;
}

/**
 * Fix duplicate workflows
 */
async function fixDuplicates(projectRoot: string): Promise<void> {
  const commandsDir = path.join(projectRoot, '.cursor', 'commands');
  
  if (!fs.existsSync(commandsDir)) return;
  
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  const groups = new Map<string, string[]>();
  
  files.forEach(f => {
    const canonical = f.toUpperCase();
    const existing = groups.get(canonical) || [];
    existing.push(f);
    groups.set(canonical, existing);
  });
  
  for (const [, fileList] of groups) {
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
        const dupPath = path.join(commandsDir, fileList[i]);
        fs.unlinkSync(dupPath);
      }
    }
  }
}

