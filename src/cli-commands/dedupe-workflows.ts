/**
 * CLI Command: dedupe-workflows
 * Remove duplicate workflow files in .cursor/commands/
 * 
 * Handles:
 * - Case variations (BEGIN_SESSION.md vs begin-session.md)
 * - Legacy files that conflict with current workflows
 * - Keeps canonical UPPERCASE versions
 */

import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

interface WorkflowFile {
  name: string;
  path: string;
  canonical: string; // Uppercase version
}

export function createDedupeWorkflowsCommand(): Command {
  const command = new Command('dedupe-workflows');
  
  command
    .description('Remove duplicate workflow files from .cursor/commands/')
    .option('--dry-run', 'Show what would be deleted without actually deleting', false)
    .option('-f, --force', 'Delete without confirmation', false)
    .action(async (options: { dryRun?: boolean; force?: boolean }) => {
      const spinner = ora('Scanning for duplicate workflows...').start();
      
      try {
        const commandsDir = path.join(process.cwd(), '.cursor', 'commands');
        
        // Check if directory exists
        if (!fs.existsSync(commandsDir)) {
          spinner.fail(chalk.red('.cursor/commands/ directory not found'));
          console.log(chalk.yellow('\nRun: tsk init --cursor'));
          process.exit(1);
          return;
        }
        
        // Get all .md files
        const files = fs.readdirSync(commandsDir)
          .filter(f => f.endsWith('.md'))
          .map(f => ({
            name: f,
            path: path.join(commandsDir, f),
            canonical: f.toUpperCase()
          }));
        
        if (files.length === 0) {
          spinner.succeed(chalk.green('No workflows found'));
          return;
        }
        
        // Group by canonical name
        const groups = new Map<string, WorkflowFile[]>();
        
        for (const file of files) {
          const existing = groups.get(file.canonical) || [];
          existing.push(file);
          groups.set(file.canonical, existing);
        }
        
        // Find duplicates
        const duplicates: WorkflowFile[] = [];
        const canonical = new Set<string>();
        
        for (const [, fileList] of groups) {
          if (fileList.length > 1) {
            // Sort: prefer UPPERCASE, then alphabetically
            fileList.sort((a, b) => {
              // If one is all uppercase, prefer it
              const aUpper = a.name === a.name.toUpperCase();
              const bUpper = b.name === b.name.toUpperCase();
              
              if (aUpper && !bUpper) return -1;
              if (!aUpper && bUpper) return 1;
              
              // Otherwise alphabetically
              return a.name.localeCompare(b.name);
            });
            
            // First file is canonical (keep), rest are duplicates (delete)
            canonical.add(fileList[0].name);
            duplicates.push(...fileList.slice(1));
          }
        }
        
        if (duplicates.length === 0) {
          spinner.succeed(chalk.green('No duplicate workflows found'));
          console.log(chalk.dim(`\n✓ ${files.length} unique workflow(s)\n`));
          return;
        }
        
        spinner.succeed(chalk.yellow(`Found ${duplicates.length} duplicate(s)`));
        
        // Show what will be deleted
        console.log(chalk.bold('\n📋 Duplicates to remove:\n'));
        
        for (const dup of duplicates) {
          const canonicalVersion = [...canonical].find(c => 
            c.toUpperCase() === dup.canonical
          );
          console.log(chalk.red(`  ✗ ${dup.name}`));
          console.log(chalk.dim(`    → Keeping: ${canonicalVersion}\n`));
        }
        
        // Dry run mode
        if (options.dryRun) {
          console.log(chalk.yellow('🔍 Dry run mode - no files deleted'));
          console.log(chalk.dim('\nRun without --dry-run to delete files\n'));
          return;
        }
        
        // Confirm deletion (unless --force)
        if (!options.force) {
          console.log(chalk.yellow('⚠️  This will delete the files above'));
          console.log(chalk.dim('Run with --force to skip this confirmation\n'));
          
          // For now, just show instructions (we can add inquirer later)
          console.log(chalk.cyan('To proceed, run:'));
          console.log(chalk.cyan('  tsk dedupe-workflows --force\n'));
          return;
        }
        
        // Delete duplicates
        const deleteSpinner = ora('Deleting duplicates...').start();
        
        let deleted = 0;
        let failed = 0;
        
        for (const dup of duplicates) {
          try {
            fs.unlinkSync(dup.path);
            deleted++;
          } catch (error) {
            failed++;
            console.error(chalk.red(`\n✗ Failed to delete: ${dup.name}`));
            if (error instanceof Error) {
              console.error(chalk.dim(`  ${error.message}`));
            }
          }
        }
        
        if (failed === 0) {
          deleteSpinner.succeed(chalk.green(`Deleted ${deleted} duplicate(s)`));
        } else {
          deleteSpinner.warn(chalk.yellow(`Deleted ${deleted}, failed ${failed}`));
        }
        
        // Show summary
        const remaining = files.length - deleted;
        console.log(chalk.dim(`\n✓ ${remaining} unique workflow(s) remaining\n`));
        
      } catch (error) {
        spinner.fail(chalk.red('Deduplication failed'));
        
        if (error instanceof Error) {
          console.error(chalk.red(`\nError: ${error.message}`));
        }
        
        process.exit(1);
      }
    });
  
  return command;
}

