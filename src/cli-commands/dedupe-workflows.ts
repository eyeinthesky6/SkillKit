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
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';

interface WorkflowFile {
  name: string;
  path: string;
  canonical: string; // Uppercase version
  contentHash?: string; // Content hash for content-based deduplication
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
        
        // Get all .md files with content hash for content-based deduplication
        const fileNames = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
        const files = await Promise.all(
          fileNames.map(async (f) => {
            const filePath = path.join(commandsDir, f);
            let contentHash = '';
            try {
              const content = await fs.readFile(filePath, 'utf8');
              // Simple hash for content comparison
              contentHash = Buffer.from(content).toString('base64').substring(0, 32);
            } catch {
              // If can't read, use empty hash
            }
            return {
              name: f,
              path: filePath,
              canonical: f.toUpperCase(),
              contentHash
            };
          })
        );
        
        if (files.length === 0) {
          spinner.succeed(chalk.green('No workflows found'));
          return;
        }
        
        // Group by canonical name AND content hash (content-based deduplication)
        const groupsByName = new Map<string, WorkflowFile[]>();
        const groupsByContent = new Map<string, WorkflowFile[]>();
        
        for (const file of files) {
          // Group by canonical name (filename-based)
          const existingByName = groupsByName.get(file.canonical) || [];
          existingByName.push(file);
          groupsByName.set(file.canonical, existingByName);
          
          // Group by content hash (content-based)
          if (file.contentHash) {
            const existingByContent = groupsByContent.get(file.contentHash) || [];
            existingByContent.push(file);
            groupsByContent.set(file.contentHash, existingByContent);
          }
        }
        
        // Find duplicates by name (case-insensitive)
        const duplicatesByName: WorkflowFile[] = [];
        const canonical = new Set<string>();
        
        for (const [, fileList] of groupsByName) {
          if (fileList.length > 1) {
            // Sort: prefer UPPERCASE, then alphabetically
            fileList.sort((a, b) => {
              const aUpper = a.name === a.name.toUpperCase();
              const bUpper = b.name === b.name.toUpperCase();
              
              if (aUpper && !bUpper) return -1;
              if (!aUpper && bUpper) return 1;
              return a.name.localeCompare(b.name);
            });
            
            canonical.add(fileList[0].name);
            duplicatesByName.push(...fileList.slice(1));
          }
        }
        
        // Find duplicates by content (same content, different names)
        const duplicatesByContent: WorkflowFile[] = [];
        for (const [, fileList] of groupsByContent) {
          if (fileList.length > 1) {
            // Keep first, mark rest as duplicates
            duplicatesByContent.push(...fileList.slice(1));
          }
        }
        
        // Combine duplicates (avoid duplicates in both lists)
        const allDuplicates = new Map<string, WorkflowFile>();
        duplicatesByName.forEach(d => allDuplicates.set(d.path, d));
        duplicatesByContent.forEach(d => allDuplicates.set(d.path, d));
        const duplicates = Array.from(allDuplicates.values());
        
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
          
          // Interactive prompt for confirmation
          try {
            const { confirm } = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'confirm',
                message: `Delete ${duplicates.length} duplicate workflow file(s)?`,
                default: false,
              },
            ]);

            if (!confirm) {
              console.log(chalk.yellow('\n❌ Cancelled. No files deleted.'));
              return;
            }
          } catch (error) {
            // Fallback if inquirer fails (non-interactive terminal)
            console.log(chalk.cyan('To proceed, run:'));
            console.log(chalk.cyan('  tsk dedupe-workflows --force\n'));
            return;
          }
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

