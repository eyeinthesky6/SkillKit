import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import ora from 'ora';
import { checkOpenSkills, installAnthropicSkills } from '../skill-loader.js';
import { buildAgentsMD } from '../agents-builder.js';

// Helper function to validate path is within project root (security)
function validatePath(filePath: string, projectRoot: string): boolean {
  const resolved = path.resolve(filePath);
  const root = path.resolve(projectRoot);
  return resolved.startsWith(root + path.sep) || resolved === root;
}

// Helper function to check write permissions
async function checkWritePermission(dirPath: string): Promise<boolean> {
  try {
    const testFile = path.join(dirPath, '.skillkit-write-test');
    await fs.writeFile(testFile, 'test');
    await fs.remove(testFile);
    return true;
  } catch {
    return false;
  }
}

// Helper function to check file size (prevent memory issues)
async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

// Maximum file size for comparison (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Get SkillKit version from package.json
function getSkillKitVersion(): string {
  try {
    const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

// Version metadata interface
interface SkillKitVersion {
  version: string;
  installedAt: string;
  projectRoot: string;
  workflowsInstalled: string[];
  customizations: {
    file: string;
    customizedAt: string;
    originalHash: string;
    intentional?: boolean; // true if customized via META_CUSTOMIZE (expected)
    customizedVia?: string; // 'META_CUSTOMIZE' | 'manual' | 'unknown'
  }[];
}

// Check if SkillKit is already installed
async function checkAlreadyInstalled(projectRoot: string): Promise<{ installed: boolean; version?: SkillKitVersion }> {
  const versionFile = path.join(projectRoot, '.skillkit', 'version.json');
  
  if (!fs.existsSync(versionFile)) {
    return { installed: false };
  }
  
  try {
    const versionData = JSON.parse(await fs.readFile(versionFile, 'utf-8')) as SkillKitVersion;
    return { installed: true, version: versionData };
  } catch {
    return { installed: false };
  }
}

// Save version metadata
async function saveVersionMetadata(
  projectRoot: string,
  workflowsInstalled: string[],
  customizations: SkillKitVersion['customizations'] = []
): Promise<void> {
  const skillkitDir = path.join(projectRoot, '.skillkit');
  await fs.ensureDir(skillkitDir);
  
  const versionData: SkillKitVersion = {
    version: getSkillKitVersion(),
    installedAt: new Date().toISOString(),
    projectRoot,
    workflowsInstalled,
    customizations,
  };
  
  await fs.writeFile(
    path.join(skillkitDir, 'version.json'),
    JSON.stringify(versionData, null, 2)
  );
}

// Detect customizations by comparing content hash
async function detectCustomizations(
  sourceFiles: string[],
  targetDir: string,
  projectRoot: string
): Promise<SkillKitVersion['customizations']> {
  const customizations: SkillKitVersion['customizations'] = [];
  
  // Load existing version data to preserve intentional flags
  let existingVersionData: SkillKitVersion | null = null;
  try {
    const versionFile = path.join(projectRoot, '.skillkit', 'version.json');
    if (fs.existsSync(versionFile)) {
      existingVersionData = JSON.parse(await fs.readFile(versionFile, 'utf-8')) as SkillKitVersion;
    }
  } catch {
    // Ignore errors reading version file
  }
  
  for (const sourceFile of sourceFiles) {
    const fileName = path.basename(sourceFile);
    const targetFile = path.join(targetDir, fileName);
    
    if (fs.existsSync(targetFile)) {
      const sourceContent = await fs.readFile(sourceFile, 'utf8');
      const targetContent = await fs.readFile(targetFile, 'utf8');
      
      // Simple hash (for comparison)
      const sourceHash = Buffer.from(sourceContent).toString('base64').substring(0, 32);
      const targetHash = Buffer.from(targetContent).toString('base64').substring(0, 32);
      
      // If content differs, it's customized
      // Check if it's already marked as intentional customization
      const relativePath = path.relative(projectRoot, targetFile);
      const existingCustomization = existingVersionData?.customizations?.find(
        c => c.file === relativePath
      );
      
      if (sourceHash !== targetHash && !(await filesAreIdentical(sourceFile, targetFile))) {
        const stats = await fs.stat(targetFile);
        customizations.push({
          file: relativePath,
          customizedAt: stats.mtime.toISOString(),
          originalHash: sourceHash,
          // Preserve intentional flag if it exists
          intentional: existingCustomization?.intentional || false,
          customizedVia: existingCustomization?.customizedVia || 'unknown',
        });
      }
    }
  }
  
  return customizations;
}

// Helper function to compare file contents (with size check)
async function filesAreIdentical(file1: string, file2: string): Promise<boolean> {
  try {
    // Check file sizes first (quick check)
    const size1 = await getFileSize(file1);
    const size2 = await getFileSize(file2);
    
    if (size1 !== size2) {
      return false;
    }
    
    // Skip comparison for very large files (prevent memory issues)
    if (size1 > MAX_FILE_SIZE) {
      console.log(chalk.dim(`   ⚠ Skipping comparison for large file (${Math.round(size1 / 1024)}KB)`));
      return false; // Assume different to be safe
    }
    
    const content1 = await fs.readFile(file1, 'utf8');
    const content2 = await fs.readFile(file2, 'utf8');
    return content1 === content2;
  } catch {
    return false;
  }
}

// Helper function to detect conflicts
interface FileConflict {
  path: string;
  exists: boolean;
  identical: boolean;
}

async function detectConflicts(
  sourceFiles: string[],
  targetDir: string,
): Promise<FileConflict[]> {
  const conflicts: FileConflict[] = [];

  for (const file of sourceFiles) {
    const targetPath = path.join(targetDir, path.basename(file));
    const exists = fs.existsSync(targetPath);

    if (exists) {
      const identical = await filesAreIdentical(file, targetPath);
      conflicts.push({ path: targetPath, exists: true, identical });
    } else {
      conflicts.push({ path: targetPath, exists: false, identical: false });
    }
  }

  return conflicts;
}

export function createInitCommand(): Command {
  return new Command('init')
    .description('Initialize SkillKit in current project')
    .option('--cursor', 'Setup Cursor IDE integration')
    .option('--rules', 'Create .cursor/rules/ directory')
    .option('--workflows', 'Generate workflow templates')
    .option('--all', 'Setup everything (Cursor + rules + workflows)')
    .option('--custom-header <text>', 'Custom header text for workflows')
    .option('--force', 'Overwrite existing files without prompting')
    .option('--dry-run', 'Show what would be done without making changes')
    .action(async (options) => {
      const projectRoot = process.cwd();
      
      // Track created resources for cleanup on error
      const createdResources: string[] = [];
      
      try {
        console.log(chalk.bold('\n🚀 Initializing SkillKit...\n'));
        
        // Validate project root path
        if (!validatePath(projectRoot, projectRoot)) {
          throw new Error('Invalid project root path');
        }

        // Check if already installed (unless --force)
        if (!options.force && !options.dryRun) {
          const installCheck = await checkAlreadyInstalled(projectRoot);
          if (installCheck.installed && installCheck.version) {
            const currentVersion = getSkillKitVersion();
            const installedVersion = installCheck.version.version;
            
            console.log(chalk.yellow(`\n⚠️  SkillKit is already installed in this project!`));
            console.log(chalk.gray(`   Installed version: ${installedVersion}`));
            console.log(chalk.gray(`   Current version: ${currentVersion}`));
            console.log(chalk.gray(`   Installed at: ${new Date(installCheck.version.installedAt).toLocaleString()}`));
            
            if (installCheck.version.customizations.length > 0) {
              const viaMetaCustomize = installCheck.version.customizations.filter(c => c.customizedVia === 'META_CUSTOMIZE');
              const manualCustomizations = installCheck.version.customizations.filter(c => c.customizedVia !== 'META_CUSTOMIZE');
              
              if (viaMetaCustomize.length > 0) {
                console.log(chalk.green(`\n   ✓ ${viaMetaCustomize.length} customized file(s) (via META_CUSTOMIZE):`));
                viaMetaCustomize.forEach((custom) => {
                  console.log(chalk.gray(`      - ${custom.file}`));
                });
                console.log(chalk.dim('      These will be preserved automatically'));
              }
              
              if (manualCustomizations.length > 0) {
                console.log(chalk.cyan(`\n   📝 ${manualCustomizations.length} manually customized file(s) (user/agent edits):`));
                manualCustomizations.forEach((custom) => {
                  console.log(chalk.gray(`      - ${custom.file}`));
                });
                console.log(chalk.dim('      These will be preserved automatically'));
                console.log(chalk.dim('      Mark as intentional: tsk meta-customize:mark --files <file>'));
              }
            }
            
            const answer = await inquirer.prompt([
              {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                  { name: 'Update to latest version (backup customizations)', value: 'update' },
                  { name: 'Reinstall (overwrite everything)', value: 'reinstall' },
                  { name: 'Cancel', value: 'cancel' },
                ],
                default: 'update',
              },
            ]);
            
            if (answer.action === 'cancel') {
              console.log(chalk.yellow('\n⚠️  Installation cancelled.'));
              return;
            }
            
            if (answer.action === 'reinstall') {
              console.log(chalk.yellow('\n⚠️  Reinstalling will overwrite all files (including customizations)!'));
              const confirm = await inquirer.prompt([
                {
                  type: 'confirm',
                  name: 'sure',
                  message: 'Are you sure?',
                  default: false,
                },
              ]);
              
              if (!confirm.sure) {
                console.log(chalk.yellow('Installation cancelled.'));
                return;
              }
            }
            
            // Backup customizations if updating (all customizations should be backed up for safety)
            if (answer.action === 'update' && installCheck.version.customizations.length > 0) {
              const backupDir = path.join(projectRoot, '.skillkit', 'backups', new Date().toISOString().replace(/:/g, '-'));
              await fs.ensureDir(backupDir);
              
              console.log(chalk.cyan(`\n📦 Backing up customized files to ${path.relative(projectRoot, backupDir)}...`));
              
              for (const custom of installCheck.version.customizations) {
                const sourceFile = path.join(projectRoot, custom.file);
                const backupFile = path.join(backupDir, path.basename(custom.file));
                await fs.copy(sourceFile, backupFile);
                const via = custom.customizedVia === 'META_CUSTOMIZE' ? 'META_CUSTOMIZE' : 'manual';
                console.log(chalk.gray(`   ✅ Backed up: ${custom.file} (${via})`));
              }
              
              console.log(chalk.green(`\n✅ Backup complete! All customizations saved.`));
              console.log(chalk.dim('   Note: Customizations will be preserved automatically during update'));
            }
          }
        }

      // Detect environment
      const hasCursorDir = fs.existsSync(path.join(projectRoot, '.cursor'));
      const isVSCode = fs.existsSync(path.join(projectRoot, '.vscode'));
      const isCursor = hasCursorDir || process.env['TERM_PROGRAM'] === 'cursor';

      let setupCursor = options.cursor || options.all;
      let setupRules = options.rules || options.all;
      // If --cursor is used, automatically enable workflows (they go in .cursor/commands)
      let setupWorkflows = options.workflows || options.all || setupCursor;
      let customHeader = options.customHeader || '';

      // Interactive prompts if no options provided
      if (!options.cursor && !options.rules && !options.workflows && !options.all) {
        console.log(chalk.cyan('Detected environment:'));
        console.log(chalk.gray(`  Cursor IDE: ${isCursor ? 'Yes' : 'No'}`));
        console.log(chalk.gray(`  VS Code: ${isVSCode ? 'Yes' : 'No'}`));
        console.log('');

        const answers = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'setupWorkflows',
            message: 'Generate workflow templates?',
            default: true,
          },
          {
            type: 'confirm',
            name: 'setupCursor',
            message: 'Setup Cursor IDE integration? (workflows in .cursor/commands)',
            default: isCursor,
            when: (ans) => ans.setupWorkflows,
          },
          {
            type: 'confirm',
            name: 'setupRules',
            message: 'Create .cursor/rules directory?',
            default: isCursor,
            when: (ans) => ans.setupCursor,
          },
          {
            type: 'input',
            name: 'customHeader',
            message: 'Custom header text for workflows (optional, e.g., "NO MOCKS"):',
            default: '',
          },
        ]);

        setupCursor = answers.setupCursor;
        setupRules = answers.setupRules;
        setupWorkflows = answers.setupWorkflows;
        customHeader = answers.customHeader;
      }

      // Create directories
      const dirsCreated: string[] = [];

      if (setupCursor) {
        const commandsDir = path.join(projectRoot, '.cursor', 'commands');
        await fs.ensureDir(commandsDir);
        dirsCreated.push('.cursor/commands');

        if (setupRules) {
          const rulesDir = path.join(projectRoot, '.cursor', 'rules');
          await fs.ensureDir(rulesDir);
          dirsCreated.push('.cursor/rules');
        }
      }

      // Create workflow directories
      const workflowsDir = path.join(projectRoot, 'workflows');
      if (!setupCursor && setupWorkflows) {
        await fs.ensureDir(workflowsDir);
        dirsCreated.push('workflows');
      }

      // Create docs directories
      const docsToCreate = ['docs/AITracking', 'docs/audit'];
      for (const dir of docsToCreate) {
        await fs.ensureDir(path.join(projectRoot, dir));
        dirsCreated.push(dir);
      }

      console.log(chalk.green('\n✅ Directories created:'));
      dirsCreated.forEach((dir) => console.log(chalk.gray(`   ${dir}/`)));

      // Generate workflows with custom header
      if (setupWorkflows) {
        const templatesDir = path.join(__dirname, '..', '..', 'templates', 'workflows');
        const targetDir = setupCursor
          ? path.join(projectRoot, '.cursor', 'commands')
          : workflowsDir;

        const workflowFiles = [
          'BEGIN_SESSION.md',
          'IMPLEMENT_FEATURE.md',
          'FIX_BUGS.md',
          'DEPLOY_PREP.md',
          'DEDUP.md',
          'CONTINUE.md',
          'SYSTEM_AUDIT.md',
          'SECURITY_AUDIT.md',
          'META_CUSTOMIZE.md',
          'META_WORKFLOW_TEMPLATE.md',
          'HELP.md',
          'AUDIT_SKILLKIT.md',
        ];

        // Build source file paths
        const sourcePaths = workflowFiles
          .map((file) => path.join(templatesDir, file))
          .filter((p) => {
            const exists = fs.existsSync(p);
            if (!exists && !options.dryRun) {
              console.log(chalk.yellow(`   ⚠ Template missing: ${path.basename(p)}`));
            }
            return exists;
          });

        // Warn if templates are missing
        const missingTemplates = workflowFiles.filter(
          (file) => !fs.existsSync(path.join(templatesDir, file))
        );
        if (missingTemplates.length > 0 && !options.dryRun) {
          console.log(chalk.yellow(`\n⚠️  Warning: ${missingTemplates.length} template(s) missing:`));
          missingTemplates.forEach((file) => {
            console.log(chalk.gray(`   - ${file}`));
          });
        }

        // Validate target directory path
        if (!validatePath(targetDir, projectRoot)) {
          throw new Error(`Invalid target directory path: ${targetDir}`);
        }

        // Check write permissions for target directory
        if (!options.dryRun && !(await checkWritePermission(targetDir))) {
          throw new Error(`No write permission for ${targetDir}`);
        }

        // Detect conflicts
        const conflicts = await detectConflicts(sourcePaths, targetDir);
        const existingFiles = conflicts.filter((c) => c.exists);
        const differentFiles = existingFiles.filter((c) => !c.identical);
        const identicalFiles = existingFiles.filter((c) => c.identical);

        // Show conflicts if any
        if (differentFiles.length > 0 && !options.force && !options.dryRun) {
          console.log(chalk.yellow('\n⚠️  The following files already exist and differ:'));
          differentFiles.forEach((conflict) => {
            console.log(chalk.gray(`   ${path.relative(projectRoot, conflict.path)}`));
          });

          if (identicalFiles.length > 0) {
            console.log(chalk.dim(`\n   ${identicalFiles.length} file(s) are identical and will be skipped.`));
          }

          const answer = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message: `Overwrite ${differentFiles.length} existing file(s)?`,
              default: false,
            },
          ]);

          if (!answer.overwrite) {
            console.log(chalk.yellow('\n⚠️  Skipped workflow installation. Use --force to overwrite.'));
            // Clean up created directories if user cancels
            console.log(chalk.dim('Cleaning up created directories...'));
            for (const resource of createdResources.reverse()) {
              try {
                if (fs.existsSync(resource)) {
                  const stats = await fs.stat(resource);
                  if (stats.isDirectory()) {
                    const files = await fs.readdir(resource);
                    if (files.length === 0) {
                      await fs.remove(resource);
                    }
                  }
                }
              } catch {
                // Ignore cleanup errors
              }
            }
            return;
          }
        }

        if (options.dryRun) {
          console.log(chalk.bold('\n📝 [DRY RUN] Would generate workflows...\n'));
          const toCreate = conflicts.filter((c) => !c.exists).length;
          const toOverwrite = differentFiles.length;
          const toSkip = identicalFiles.length;

          if (toCreate > 0) {
            console.log(chalk.green(`   Would create: ${toCreate} file(s)`));
          }
          if (toOverwrite > 0) {
            console.log(chalk.yellow(`   Would overwrite: ${toOverwrite} file(s)`));
          }
          if (toSkip > 0) {
            console.log(chalk.dim(`   Would skip (identical): ${toSkip} file(s)`));
          }
          return;
        }

        console.log(chalk.bold('\n📝 Generating workflows...\n'));

        let skipped = 0;

        // Load existing version data to check for intentional customizations
        let existingVersionData: SkillKitVersion | null = null;
        try {
          const versionFile = path.join(projectRoot, '.skillkit', 'version.json');
          if (fs.existsSync(versionFile)) {
            existingVersionData = JSON.parse(await fs.readFile(versionFile, 'utf-8')) as SkillKitVersion;
          }
        } catch {
          // Ignore errors
        }

        for (const file of workflowFiles) {
          const sourcePath = path.join(templatesDir, file);
          const targetPath = path.join(targetDir, file);

          if (!fs.existsSync(sourcePath)) {
            continue;
          }

          const conflict = conflicts.find((c) => c.path === targetPath);
          const exists = conflict?.exists ?? false;
          const identical = conflict?.identical ?? false;

          // Check if file is intentionally customized
          const relativePath = path.relative(projectRoot, targetPath);
          const isIntentional = existingVersionData?.customizations?.find(
            c => c.file === relativePath && c.intentional
          );

          // Skip identical files
          if (exists && identical) {
            skipped++;
            console.log(chalk.dim(`   ⏭️  ${file} (identical, skipped)`));
            continue;
          }

          // Skip intentionally customized files (preserve them)
          if (exists && isIntentional && !options.force) {
            skipped++;
            console.log(chalk.green(`   ✓ ${file} (preserved - intentionally customized)`));
            continue;
          }

          // Validate paths
          if (!validatePath(sourcePath, projectRoot) || !validatePath(targetPath, projectRoot)) {
            console.log(chalk.red(`   ❌ ${file} (invalid path, skipped)`));
            continue;
          }

          let content = await fs.readFile(sourcePath, 'utf8');

          // Replace custom header placeholder (with validation)
          if (customHeader) {
            const headerBlock = `---\n## ⚠️ ${customHeader}\n---`;
            const regex = /## \{\{CUSTOM_HEADER\}\}[\s\S]*?---/g;
            if (regex.test(content)) {
              content = content.replace(regex, headerBlock);
            } else {
              console.log(chalk.yellow(`   ⚠ ${file} (custom header placeholder not found)`));
            }
          } else {
            // Remove custom header placeholder (with validation)
            const regex = /---\n## \{\{CUSTOM_HEADER\}\}[\s\S]*?---\n\n/g;
            if (regex.test(content)) {
              content = content.replace(regex, '');
            }
          }

          try {
            await fs.writeFile(targetPath, content);
            createdResources.push(targetPath);
          } catch (error) {
            console.log(chalk.red(`   ❌ ${file} (write failed: ${error instanceof Error ? error.message : error})`));
            throw error;
          }

          if (exists) {
            console.log(chalk.yellow(`   ⚠️  ${file} (overwritten)`));
          } else {
            console.log(chalk.green(`   ✅ ${file}`));
          }
        }

        if (skipped > 0) {
          console.log(chalk.dim(`\n   Skipped ${skipped} identical file(s)`));
        }

        // Detect and track customizations
        const customizations = await detectCustomizations(sourcePaths, targetDir, projectRoot);
        
        // Save version metadata
        const installedWorkflows = workflowFiles.filter((file) => {
          const targetPath = path.join(targetDir, file);
          return fs.existsSync(targetPath);
        });
        
        await saveVersionMetadata(projectRoot, installedWorkflows, customizations);
        
        if (customizations.length > 0 && !options.dryRun) {
          console.log(chalk.yellow(`\n⚠️  Note: ${customizations.length} file(s) have customizations`));
          console.log(chalk.gray('   These files differ from the original templates.'));
          console.log(chalk.gray('   Customizations will be preserved on updates.'));
        }
      }

      // Copy subtasks directory
      const subtasksSource = path.join(__dirname, '..', '..', 'docs', 'workflows', 'subtasks');
      const subtasksTarget = path.join(projectRoot, 'docs', 'workflows', 'subtasks');
      
      // Validate paths
      if (!validatePath(subtasksTarget, projectRoot)) {
        throw new Error(`Invalid subtasks target path: ${subtasksTarget}`);
      }
      
      if (fs.existsSync(subtasksSource)) {
        const subtaskFiles = await fs.readdir(subtasksSource);
        const subtaskCount = subtaskFiles.length;

        if (options.dryRun) {
          const existingSubtasks = fs.existsSync(subtasksTarget)
            ? (await fs.readdir(subtasksTarget)).length
            : 0;
          console.log(chalk.bold('\n📝 [DRY RUN] Would copy subtasks...\n'));
          console.log(chalk.green(`   Would copy: ${subtaskCount} subtask(s) to docs/workflows/subtasks/`));
          if (existingSubtasks > 0) {
            console.log(chalk.yellow(`   Would overwrite: ${existingSubtasks} existing subtask(s)`));
          }
        } else {
          // Check if subtasks directory exists and has files
          const hasExistingSubtasks = fs.existsSync(subtasksTarget) &&
            (await fs.readdir(subtasksTarget)).length > 0;

          if (hasExistingSubtasks && !options.force) {
            console.log(chalk.yellow('\n⚠️  Subtasks directory already exists: docs/workflows/subtasks/'));
            const answer = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'overwrite',
                message: 'Overwrite existing subtasks?',
                default: false,
              },
            ]);

            if (!answer.overwrite) {
              console.log(chalk.yellow('   ⏭️  Skipped subtasks (use --force to overwrite)'));
            } else {
              try {
                await fs.copy(subtasksSource, subtasksTarget, { overwrite: true });
                createdResources.push(subtasksTarget);
                console.log(chalk.green(`   ✅ ${subtaskCount} subtasks copied to docs/workflows/subtasks/`));
              } catch (error) {
                throw new Error(`Failed to copy subtasks: ${error instanceof Error ? error.message : error}`);
              }
            }
          } else {
            try {
              await fs.copy(subtasksSource, subtasksTarget, { overwrite: true });
              createdResources.push(subtasksTarget);
              console.log(chalk.green(`   ✅ ${subtaskCount} subtasks copied to docs/workflows/subtasks/`));
            } catch (error) {
              throw new Error(`Failed to copy subtasks: ${error instanceof Error ? error.message : error}`);
            }
          }
        }
      }

      // Create decision tree doc
      const decisionTreeSource = path.join(__dirname, '..', '..', 'docs', 'WORKFLOW_DECISION_TREE.md');
      const decisionTreeTarget = path.join(projectRoot, 'docs', 'WORKFLOW_DECISION_TREE.md');
      
      // Validate paths
      if (!validatePath(decisionTreeTarget, projectRoot)) {
        throw new Error(`Invalid decision tree target path: ${decisionTreeTarget}`);
      }
      
      if (fs.existsSync(decisionTreeSource)) {
        const exists = fs.existsSync(decisionTreeTarget);
        const identical = exists ? await filesAreIdentical(decisionTreeSource, decisionTreeTarget) : false;

        if (options.dryRun) {
          if (exists) {
            console.log(chalk.yellow(`   Would overwrite: docs/WORKFLOW_DECISION_TREE.md`));
          } else {
            console.log(chalk.green(`   Would create: docs/WORKFLOW_DECISION_TREE.md`));
          }
        } else {
          if (exists && !identical && !options.force) {
            console.log(chalk.yellow('\n⚠️  WORKFLOW_DECISION_TREE.md already exists and differs'));
            const answer = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'overwrite',
                message: 'Overwrite WORKFLOW_DECISION_TREE.md?',
                default: false,
              },
            ]);

            if (!answer.overwrite) {
              console.log(chalk.yellow('   ⏭️  Skipped WORKFLOW_DECISION_TREE.md'));
            } else {
              try {
                await fs.copy(decisionTreeSource, decisionTreeTarget);
                createdResources.push(decisionTreeTarget);
                console.log(chalk.green(`   ✅ WORKFLOW_DECISION_TREE.md (overwritten)`));
              } catch (error) {
                throw new Error(`Failed to copy WORKFLOW_DECISION_TREE.md: ${error instanceof Error ? error.message : error}`);
              }
            }
          } else if (!exists || !identical) {
            try {
              await fs.copy(decisionTreeSource, decisionTreeTarget);
              createdResources.push(decisionTreeTarget);
              console.log(chalk.green(`   ✅ WORKFLOW_DECISION_TREE.md`));
            } catch (error) {
              throw new Error(`Failed to copy WORKFLOW_DECISION_TREE.md: ${error instanceof Error ? error.message : error}`);
            }
          } else {
            console.log(chalk.dim(`   ⏭️  WORKFLOW_DECISION_TREE.md (identical, skipped)`));
          }
        }
      }

      // Create .cursorules if Cursor setup
      if (setupRules) {
        const rulesPath = path.join(projectRoot, '.cursor', 'rules', 'skillkit-workflows.mdc');
        const rulesExists = fs.existsSync(rulesPath);

        if (options.dryRun) {
          if (rulesExists) {
            console.log(chalk.yellow(`   Would overwrite: .cursor/rules/skillkit-workflows.mdc`));
          } else {
            console.log(chalk.green(`   Would create: .cursor/rules/skillkit-workflows.mdc`));
          }
        } else {
          if (rulesExists && !options.force) {
            console.log(chalk.yellow('\n⚠️  Rules file already exists: .cursor/rules/skillkit-workflows.mdc'));
            const answer = await inquirer.prompt([
              {
                type: 'confirm',
                name: 'overwrite',
                message: 'Overwrite existing rules file?',
                default: false,
              },
            ]);

            if (!answer.overwrite) {
              console.log(chalk.yellow('   ⏭️  Skipped rules file (use --force to overwrite)'));
            } else {
              const rulesContent = `# SkillKit Workflow Rules

## Entry Point

**ALWAYS start with:** \`@BEGIN_SESSION.md\`

This runs diagnostics and presents task menu.

## Routing Logic

- High errors (>50): Route to FIX_BUGS
- Moderate errors (11-50): Suggest fix first
- Low errors (<10): Can proceed with features
- No errors: Ready for any work

## Workflow Files

- \`BEGIN_SESSION.md\` - Session start (diagnostics + menu)
- \`IMPLEMENT_FEATURE.md\` - Build new features
- \`FIX_BUGS.md\` - Fix errors systematically
- \`DEPLOY_PREP.md\` - Pre-deployment checks
- \`DEDUP.md\` - Find duplicate code
- \`CONTINUE.md\` - Resume last work
- \`SYSTEM_AUDIT.md\` - Full health check
- \`SECURITY_AUDIT.md\` - Security review

## Commands

All workflows use \`tsk\` commands:
- \`tsk diagnose\` - Run diagnostics
- \`tsk discover\` - Find project patterns
- \`tsk exec <workflow>\` - Execute workflow
- \`tsk check-issues\` - Check for problems

See docs/WORKFLOW_DECISION_TREE.md for full routing logic.
`;
              await fs.writeFile(rulesPath, rulesContent);
              console.log(chalk.green(`   ✅ skillkit-workflows.mdc (overwritten)`));
            }
          } else {
            const rulesContent = `# SkillKit Workflow Rules

## Entry Point

**ALWAYS start with:** \`@BEGIN_SESSION.md\`

This runs diagnostics and presents task menu.

## Routing Logic

- High errors (>50): Route to FIX_BUGS
- Moderate errors (11-50): Suggest fix first
- Low errors (<10): Can proceed with features
- No errors: Ready for any work

## Workflow Files

- \`BEGIN_SESSION.md\` - Session start (diagnostics + menu)
- \`IMPLEMENT_FEATURE.md\` - Build new features
- \`FIX_BUGS.md\` - Fix errors systematically
- \`DEPLOY_PREP.md\` - Pre-deployment checks
- \`DEDUP.md\` - Find duplicate code
- \`CONTINUE.md\` - Resume last work
- \`SYSTEM_AUDIT.md\` - Full health check
- \`SECURITY_AUDIT.md\` - Security review

## Commands

All workflows use \`tsk\` commands:
- \`tsk diagnose\` - Run diagnostics
- \`tsk discover\` - Find project patterns
- \`tsk exec <workflow>\` - Execute workflow
- \`tsk check-issues\` - Check for problems

See docs/WORKFLOW_DECISION_TREE.md for full routing logic.
`;
            await fs.writeFile(rulesPath, rulesContent);
            console.log(chalk.green(`   ✅ skillkit-workflows.mdc`));
          }
        }
      }

      // Summary
      console.log(chalk.bold.green('\n✅ SkillKit initialized!\n'));

      // Install Anthropic skills via OpenSkills
      console.log('');
      console.log(chalk.bold('📚 Setting up Anthropic Skills Integration...\n'));
      
      if (!checkOpenSkills()) {
        console.log(chalk.yellow('⚠ OpenSkills not found'));
        console.log(chalk.gray('   Install it to get access to 15+ Anthropic skills:\n'));
        console.log(chalk.cyan('   npm install -g openskills\n'));
        console.log(chalk.gray('   Then run: openskills install anthropics/skills'));
      } else {
        const installSpinner = ora('Installing Anthropic skills (pdf, xlsx, docx, etc.)...').start();
        
        const installResult = installAnthropicSkills();
        
        if (installResult.success) {
          installSpinner.succeed(chalk.green('Installed 15+ Anthropic skills'));
          console.log(chalk.gray('   Location: .claude/skills/'));
        } else {
          installSpinner.warn(chalk.yellow('Could not install Anthropic skills automatically'));
          console.log(chalk.gray('   Run manually: openskills install anthropics/skills'));
        }
      }
      
      // Generate unified AGENTS.md
      const agentsPath = path.join(projectRoot, 'AGENTS.md');
      const agentsExists = fs.existsSync(agentsPath);

      if (options.dryRun) {
        console.log(chalk.bold('\n📝 [DRY RUN] Would generate AGENTS.md...\n'));
        if (agentsExists) {
          console.log(chalk.yellow(`   Would overwrite: AGENTS.md`));
        } else {
          console.log(chalk.green(`   Would create: AGENTS.md`));
        }
      } else {
        if (agentsExists && !options.force) {
          console.log(chalk.yellow('\n⚠️  AGENTS.md already exists'));
          const answer = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'overwrite',
              message: 'Overwrite existing AGENTS.md?',
              default: false,
            },
          ]);

          if (!answer.overwrite) {
            console.log(chalk.yellow('   ⏭️  Skipped AGENTS.md (use --force to overwrite)'));
          } else {
            console.log('');
            const agentsSpinner = ora('Generating unified AGENTS.md...').start();
            try {
              await buildAgentsMD(projectRoot);
              agentsSpinner.succeed(chalk.green('Generated AGENTS.md (overwritten)'));
              console.log(chalk.gray('   Combined: Workflows + Subtasks + Skills'));
            } catch {
              agentsSpinner.warn(chalk.yellow('Could not generate AGENTS.md'));
              console.log(chalk.gray('   Run manually: tsk sync'));
            }
          }
        } else {
          console.log('');
          const agentsSpinner = ora('Generating unified AGENTS.md...').start();
          try {
            await buildAgentsMD(projectRoot);
            agentsSpinner.succeed(chalk.green('Generated AGENTS.md'));
            console.log(chalk.gray('   Combined: Workflows + Subtasks + Skills'));
          } catch {
            agentsSpinner.warn(chalk.yellow('Could not generate AGENTS.md'));
            console.log(chalk.gray('   Run manually: tsk sync'));
          }
        }
      }
      
      // Next steps
      console.log('');
      console.log(chalk.bold('📖 Next steps:\n'));
      
      if (setupCursor) {
        console.log(chalk.cyan('   In Cursor IDE:'));
        console.log(chalk.gray('   1. Type "/" in chat'));
        console.log(chalk.gray('   2. Select "BEGIN_SESSION"'));
        console.log(chalk.gray('   3. Follow the workflow\n'));
      }

      console.log(chalk.cyan('   From CLI:'));
      console.log(chalk.gray('   1. Run: tsk diagnose'));
      console.log(chalk.gray('   2. Load a skill: tsk skill:load pdf'));
      console.log(chalk.gray('   3. Customize: /META_CUSTOMIZE\n'));

      if (customHeader) {
        console.log(chalk.yellow(`   Custom header set: "${customHeader}"`));
        console.log(chalk.gray('   This appears at the top of each workflow\n'));
      }

      console.log(chalk.bold('📂 Files created:'));
      console.log(chalk.gray(`   ${setupCursor ? '.cursor/commands/' : 'workflows/'} - Workflow templates`));
      console.log(chalk.gray('   docs/workflows/subtasks/ - 20 granular subtasks'));
      console.log(chalk.gray('   docs/AITracking/ - Work logs'));
      console.log(chalk.gray('   AGENTS.md - Unified catalog'));
      
      if (checkOpenSkills()) {
        console.log(chalk.gray('   .claude/skills/ - Anthropic skills (15+)'));
      }
      
      // Auto-dedupe workflows
      if (setupCursor) {
        console.log(chalk.dim('\n🔍 Checking for duplicate workflows...'));
        const commandsDir = path.join(projectRoot, '.cursor', 'commands');
        
        try {
          const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
          const canonicalNames = new Map<string, string[]>();
          
          files.forEach(f => {
            const canonical = f.toUpperCase();
            const existing = canonicalNames.get(canonical) || [];
            existing.push(f);
            canonicalNames.set(canonical, existing);
          });
          
          let dupsRemoved = 0;
          for (const [, fileList] of canonicalNames) {
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
                fs.unlinkSync(path.join(commandsDir, fileList[i]));
                dupsRemoved++;
              }
            }
          }
          
          if (dupsRemoved > 0) {
            console.log(chalk.green(`   ✓ Removed ${dupsRemoved} duplicate(s)`));
          } else {
            console.log(chalk.dim('   ✓ No duplicates found'));
          }
        } catch {
          // Ignore deduplication errors
          console.log(chalk.dim('   ⚠ Skipped duplicate check'));
        }
      }
      
      // Setup git post-commit hook for AITracking
      console.log(chalk.dim('\n🔗 Setting up git hooks...'));
      try {
        const gitHooksDir = path.join(projectRoot, '.git', 'hooks');
        const postCommitHook = path.join(gitHooksDir, 'post-commit');
        
        if (fs.existsSync(path.join(projectRoot, '.git'))) {
          await fs.ensureDir(gitHooksDir);
          
          // Detect platform
          const isWindows = process.platform === 'win32';
          const hookScript = isWindows 
            ? path.join(__dirname, '..', '..', 'scripts', 'post-commit-aitracking.bat')
            : path.join(__dirname, '..', '..', 'scripts', 'post-commit-aitracking.sh');
          
          // Check if script exists
          if (fs.existsSync(hookScript)) {
            // Copy hook script
            const hookContent = await fs.readFile(hookScript, 'utf8');
            await fs.writeFile(postCommitHook, hookContent);
            
            // Make executable on Unix
            if (!isWindows) {
              fs.chmodSync(postCommitHook, 0o755);
            }
            
            console.log(chalk.green('   ✓ Post-commit hook installed'));
            console.log(chalk.gray('   Auto-updates AITracking logs after commits'));
          } else {
            console.log(chalk.dim('   ⚠ Hook script not found, skipping'));
          }
        } else {
          console.log(chalk.dim('   ⚠ Not a git repository, skipping hooks'));
        }
      } catch {
        console.log(chalk.dim('   ⚠ Could not setup git hooks'));
      }
      
      console.log('');
      console.log(chalk.bold.green('✅ SkillKit initialized successfully!\n'));
      } catch (error) {
        // Top-level error handling
        console.log('');
        console.log(chalk.red('\n❌ Initialization failed!\n'));
        
        if (error instanceof Error) {
          console.log(chalk.red(`Error: ${error.message}`));
          if (error.stack && process.env['DEBUG']) {
            console.log(chalk.gray(error.stack));
          }
        } else {
          console.log(chalk.red(`Unexpected error: ${error}`));
        }
        
        // Attempt cleanup of created resources
        if (createdResources.length > 0) {
          console.log(chalk.yellow('\n⚠️  Cleaning up created files...'));
          for (const resource of createdResources.reverse()) {
            try {
              if (fs.existsSync(resource)) {
                const stats = await fs.stat(resource);
                if (stats.isFile()) {
                  await fs.remove(resource);
                } else if (stats.isDirectory()) {
                  const files = await fs.readdir(resource);
                  if (files.length === 0) {
                    await fs.remove(resource);
                  }
                }
              }
            } catch {
              // Ignore cleanup errors
              console.log(chalk.dim(`   ⚠ Could not remove: ${resource}`));
            }
          }
        }
        
        console.log(chalk.yellow('\n💡 Tip: Use --dry-run to preview changes before applying'));
        process.exit(1);
      }
    });
}
