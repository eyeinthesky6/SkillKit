/**
 * CLI Command: meta-customize
 * Mark files as intentionally customized after META_CUSTOMIZE workflow
 * 
 * This command updates .skillkit/version.json to mark files as "intentionally customized"
 * so that future tsk init runs don't treat them as conflicts.
 */

import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { getCustomizedFiles } from '../utils/version-checker.js';

interface SkillKitVersion {
  version: string;
  installedAt: string;
  projectRoot: string;
  workflowsInstalled: string[];
  customizations: {
    file: string;
    customizedAt: string;
    originalHash: string;
    intentional?: boolean;
    customizedVia?: string;
  }[];
}

export function createMetaCustomizeCommand(): Command {
  const command = new Command('meta-customize:mark');
  
  command
    .description('Mark files as intentionally customized (run after META_CUSTOMIZE workflow)')
    .option('--all', 'Mark all customized files as intentional', false)
    .option('--files <files...>', 'Specific files to mark as intentional', [])
    .action(async (options: { all?: boolean; files?: string[] }) => {
      const spinner = ora('Marking files as intentionally customized...').start();
      
      try {
        const projectRoot = process.cwd();
        const versionFile = path.join(projectRoot, '.skillkit', 'version.json');
        
        if (!fs.existsSync(versionFile)) {
          spinner.fail(chalk.red('SkillKit not initialized. Run: tsk init --cursor'));
          process.exit(1);
          return;
        }
        
        const versionData = JSON.parse(
          fs.readFileSync(versionFile, 'utf-8')
        ) as SkillKitVersion;
        
        // Get current customizations from version.json
        const currentCustomizations = getCustomizedFiles(projectRoot);
        
        // Also detect current customizations by comparing with templates
        const templatesDir = path.join(__dirname, '..', '..', 'templates', 'workflows');
        const commandsDir = path.join(projectRoot, '.cursor', 'commands');
        const detectedCustomizations: string[] = [];
        
        if (fs.existsSync(commandsDir) && fs.existsSync(templatesDir)) {
          const workflowFiles = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
          for (const file of workflowFiles) {
            const templatePath = path.join(templatesDir, file);
            const workflowPath = path.join(commandsDir, file);
            
            if (fs.existsSync(templatePath) && fs.existsSync(workflowPath)) {
              const templateContent = fs.readFileSync(templatePath, 'utf-8');
              const workflowContent = fs.readFileSync(workflowPath, 'utf-8');
              
              const templateHash = Buffer.from(templateContent).toString('base64').substring(0, 32);
              const workflowHash = Buffer.from(workflowContent).toString('base64').substring(0, 32);
              
              if (templateHash !== workflowHash) {
                const relativePath = path.relative(projectRoot, workflowPath);
                detectedCustomizations.push(relativePath);
              }
            }
          }
        }
        
        if (detectedCustomizations.length === 0 && currentCustomizations.length === 0 && !options.all && (!options.files || options.files.length === 0)) {
          spinner.succeed(chalk.green('No customizations found'));
          console.log(chalk.dim('\nCustomize workflows first, then mark them as intentional\n'));
          return;
        }
        
        let marked = 0;
        
        if (options.all) {
          // Mark all current customizations (from version.json or detected) as intentional
          const allToMark = new Set<string>();
          
          // Add existing customizations from version.json
          for (const custom of currentCustomizations) {
            allToMark.add(custom.file);
          }
          
          // Add detected customizations
          for (const file of detectedCustomizations) {
            allToMark.add(file);
          }
          
          for (const filePath of allToMark) {
            const existing = versionData.customizations.find(c => c.file === filePath);
            if (existing) {
              existing.intentional = true;
              // Preserve existing customizedVia or set to manual if unknown
              if (!existing.customizedVia || existing.customizedVia === 'unknown') {
                existing.customizedVia = 'manual';
              }
              marked++;
            } else {
              // Add new customization entry - detect if it's from META_CUSTOMIZE or manual
              const fullPath = path.join(projectRoot, filePath);
              if (fs.existsSync(fullPath)) {
                const stats = fs.statSync(fullPath);
                const customizedVia: 'META_CUSTOMIZE' | 'manual' = 'manual';
                
                // Try to detect: if file was recently modified and matches META_CUSTOMIZE pattern
                // For now, default to manual (user can specify)
                versionData.customizations.push({
                  file: filePath,
                  customizedAt: stats.mtime.toISOString(),
                  originalHash: '', // Will be updated on next init
                  intentional: true,
                  customizedVia: customizedVia,
                });
                marked++;
              }
            }
          }
        } else if (options.files && options.files.length > 0) {
          // Mark specific files
          for (const file of options.files) {
            const filePath = file.startsWith('.') ? file : `.cursor/commands/${file}`;
            const existing = versionData.customizations.find(c => c.file === filePath || c.file === file);
            if (existing) {
              existing.intentional = true;
              // Preserve existing customizedVia or set to manual
              if (!existing.customizedVia || existing.customizedVia === 'unknown') {
                existing.customizedVia = 'manual';
              }
              marked++;
            } else {
              // Check if file exists and is customized
              const fullPath = path.join(projectRoot, filePath);
              if (fs.existsSync(fullPath)) {
                const stats = fs.statSync(fullPath);
                versionData.customizations.push({
                  file: filePath,
                  customizedAt: stats.mtime.toISOString(),
                  originalHash: '', // Will be updated on next init
                  intentional: true,
                  customizedVia: 'manual', // User is manually marking it
                });
                marked++;
              }
            }
          }
        } else {
          // Interactive: mark all detected customizations
          for (const filePath of detectedCustomizations) {
            const existing = versionData.customizations.find(c => c.file === filePath);
            if (existing) {
              if (!existing.intentional) {
                existing.intentional = true;
                // Preserve existing customizedVia
                if (!existing.customizedVia || existing.customizedVia === 'unknown') {
                  existing.customizedVia = 'manual';
                }
                marked++;
              }
            } else {
              // Add new entry for detected customization
              const fullPath = path.join(projectRoot, filePath);
              if (fs.existsSync(fullPath)) {
                const stats = fs.statSync(fullPath);
                versionData.customizations.push({
                  file: filePath,
                  customizedAt: stats.mtime.toISOString(),
                  originalHash: '', // Will be updated on next init
                  intentional: true,
                  customizedVia: 'manual', // Detected customization, assume manual
                });
                marked++;
              }
            }
          }
        }
        
        // Save updated version data
        await fs.writeFile(
          versionFile,
          JSON.stringify(versionData, null, 2)
        );
        
        spinner.succeed(chalk.green(`Marked ${marked} file(s) as intentional customizations`));
        console.log(chalk.dim('\nThese files will be preserved automatically during updates'));
        console.log(chalk.dim('All customizations (META_CUSTOMIZE or manual) are valid and preserved\n'));
        
      } catch (error) {
        spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    });
  
  return command;
}

