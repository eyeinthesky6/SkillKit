/**
 * CLI Command: workflows:add
 * Add community workflows from GitHub repositories
 * 
 * Usage:
 *   tsk workflows:add user/repo/WORKFLOW.md    # Install specific workflow
 *   tsk workflows:add user/repo                # Install all workflows from repo
 */

import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import https from 'https';

const execAsync = promisify(exec);

export function createWorkflowsAddCommand(): Command {
  const command = new Command('workflows:add');
  
  command
    .description('Add community workflows from GitHub repositories')
    .argument('<source>', 'GitHub repo or file (user/repo or user/repo/file.md)')
    .option('-f, --force', 'Overwrite existing workflows', false)
    .option('--branch <branch>', 'Git branch to use (default: main)', 'main')
    .action(async (source: string, options: { force?: boolean; branch?: string }) => {
      const spinner = ora('Installing workflow...').start();
      
      try {
        // Parse source format
        const parts = source.split('/');
        if (parts.length < 2) {
          spinner.fail(chalk.red('Invalid format'));
          console.error(chalk.yellow('\nExpected formats:'));
          console.error(chalk.cyan('  tsk workflows:add user/repo                    # Install all workflows'));
          console.error(chalk.cyan('  tsk workflows:add user/repo/WORKFLOW.md        # Install specific workflow'));
          process.exit(1);
          return;
        }
        
        const user = parts[0];
        const repo = parts[1];
        const file = parts.length > 2 ? parts.slice(2).join('/') : undefined;
        
        // Determine target directory (.cursor/commands/ for Cursor)
        const targetDir = path.join(process.cwd(), '.cursor', 'commands');
        fs.mkdirSync(targetDir, { recursive: true });
        
        if (file) {
          // Single file download
          spinner.text = `Downloading ${chalk.cyan(file)} from ${chalk.cyan(`${user}/${repo}`)}...`;
          
          const url = `https://raw.githubusercontent.com/${user}/${repo}/${options.branch}/${file}`;
          const workflowName = path.basename(file, '.md');
          const targetPath = path.join(targetDir, path.basename(file));
          
          // Check if exists
          if (fs.existsSync(targetPath) && !options.force) {
            spinner.fail(chalk.red(`Workflow already exists: ${workflowName}`));
            console.error(chalk.yellow('\nUse --force to overwrite:'));
            console.error(chalk.cyan(`  tsk workflows:add ${source} --force`));
            process.exit(1);
            return;
          }
          
          // Download file
          await downloadFile(url, targetPath);
          
          spinner.succeed(chalk.green(`Installed ${chalk.cyan(workflowName)} workflow`));
          console.log(chalk.dim(`  Location: ${path.relative(process.cwd(), targetPath)}`));
          console.log(chalk.dim(`  Available as: /${workflowName}`));
          
        } else {
          // Clone entire repo and copy all .md files
          spinner.text = `Cloning ${chalk.cyan(`${user}/${repo}`)}...`;
          
          const tempDir = path.join(process.cwd(), '.skillkit', 'temp', `${user}_${repo}`);
          
          // Clean up existing temp
          if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
          }
          fs.mkdirSync(tempDir, { recursive: true });
          
          // Clone repo
          const repoUrl = `https://github.com/${user}/${repo}.git`;
          try {
            await execAsync(`git clone --depth 1 --branch ${options.branch} ${repoUrl} "${tempDir}"`);
          } catch (error) {
            // Try without branch if main doesn't exist
            if (options.branch === 'main') {
              try {
                await execAsync(`git clone --depth 1 ${repoUrl} "${tempDir}"`);
              } catch (retryError) {
                throw new Error(`Failed to clone repository: ${retryError}`);
              }
            } else {
              throw new Error(`Failed to clone repository (branch: ${options.branch}): ${error}`);
            }
          }
          
          // Find all .md files
          spinner.text = 'Discovering workflows...';
          const mdFiles = findMarkdownFiles(tempDir);
          
          if (mdFiles.length === 0) {
            spinner.fail(chalk.red('No workflow files (.md) found in repository'));
            fs.rmSync(tempDir, { recursive: true, force: true });
            process.exit(1);
            return;
          }
          
          spinner.text = `Installing ${mdFiles.length} workflow(s)...`;
          
          let installed = 0;
          let skipped = 0;
          
          for (const mdFile of mdFiles) {
            const fileName = path.basename(mdFile);
            const targetPath = path.join(targetDir, fileName);
            
            // Skip if exists and not forcing
            if (fs.existsSync(targetPath) && !options.force) {
              skipped++;
              continue;
            }
            
            // Copy file
            fs.copyFileSync(mdFile, targetPath);
            installed++;
          }
          
          // Cleanup
          fs.rmSync(tempDir, { recursive: true, force: true });
          
          spinner.succeed(chalk.green(`Installed ${installed} workflow(s)`));
          if (skipped > 0) {
            console.log(chalk.yellow(`  Skipped ${skipped} existing workflow(s) (use --force to overwrite)`));
          }
        }
        
        // Show usage instructions
        console.log(chalk.dim('\n─'.repeat(80)));
        console.log(chalk.bold('\n💡 Next steps:'));
        console.log(chalk.cyan('  1. Open Cursor and type "/" to see available workflows'));
        console.log(chalk.cyan('  2. Or use the workflow directly: /WORKFLOW_NAME'));
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
          } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            console.error(chalk.yellow('\n💡 Network error:'));
            console.error(chalk.yellow('  • Check your internet connection'));
            console.error(chalk.yellow('  • Verify GitHub is accessible'));
          }
        } else {
          console.error(chalk.red(`\nUnexpected error: ${error}`));
        }
        
        process.exit(1);
      }
    });
  
  return command;
}

/**
 * Download a file from URL
 */
function downloadFile(url: string, targetPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(targetPath);
    
    https.get(url, (response) => {
      if (response.statusCode === 404) {
        file.close();
        fs.unlinkSync(targetPath);
        reject(new Error(`File not found: ${url}`));
        return;
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(targetPath);
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      reject(err);
    });
  });
}

/**
 * Find all .md files in a directory (recursively)
 */
function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip hidden directories and common non-workflow dirs
      if (entry.isDirectory()) {
        if (entry.name.startsWith('.') || 
            entry.name === 'node_modules' || 
            entry.name === '.git') {
          continue;
        }
        files.push(...findMarkdownFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        // Skip README.md and common non-workflow files
        const lowerName = entry.name.toLowerCase();
        if (lowerName === 'readme.md' || 
            lowerName === 'license.md' || 
            lowerName === 'contributing.md' ||
            lowerName === 'changelog.md') {
          continue;
        }
        files.push(fullPath);
      }
    }
  } catch {
    // Ignore errors (permissions, etc.)
  }
  
  return files;
}

