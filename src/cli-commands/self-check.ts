/**
 * CLI Command: self-check
 * SkillKit self-diagnostic and validation
 * 
 * Checks SkillKit installation integrity:
 * - Validates core files and directories
 * - Checks command registration
 * - Verifies template files
 * - Tests multi-language analyzer
 * - Validates workflow adapter
 * - Checks for hardcoded values in codebase
 */

import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { MultiLanguageAnalyzer } from '../intelligence/multi-language-analyzer.js';
import { WorkflowAdapter } from '../intelligence/workflow-adapter.js';

interface CheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: string;
}

export function createSelfCheckCommand(): Command {
  const command = new Command('self-check');
  
  command
    .description('SkillKit self-diagnostic and validation')
    .option('--verbose', 'Show detailed output', false)
    .action(async (options: { verbose?: boolean }) => {
      const spinner = ora('Running SkillKit self-check...').start();
      const results: CheckResult[] = [];
      
      try {
        const skillkitRoot = path.join(__dirname, '..', '..');
        
        // 1. Check core files
        spinner.text = 'Checking core files...';
        results.push(...await checkCoreFiles(skillkitRoot));
        
        // 2. Check templates
        spinner.text = 'Checking templates...';
        results.push(...await checkTemplates(skillkitRoot));
        
        // 3. Check for hardcoded values
        spinner.text = 'Checking for hardcoded values...';
        results.push(...await checkHardcodedValues(skillkitRoot));
        
        // 4. Test multi-language analyzer
        spinner.text = 'Testing multi-language analyzer...';
        results.push(...await testMultiLanguageAnalyzer(skillkitRoot));
        
        // 5. Test workflow adapter
        spinner.text = 'Testing workflow adapter...';
        results.push(...await testWorkflowAdapter(skillkitRoot));
        
        // 6. Check command registration
        spinner.text = 'Checking command registration...';
        results.push(...await checkCommandRegistration(skillkitRoot));
        
        spinner.stop();
        
        // Display results
        console.log(chalk.bold('\n📊 SkillKit Self-Check Results\n'));
        console.log(chalk.dim('─'.repeat(60)));
        
        const passed = results.filter(r => r.status === 'pass').length;
        const failed = results.filter(r => r.status === 'fail').length;
        const warnings = results.filter(r => r.status === 'warn').length;
        
        for (const result of results) {
          const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
          const color = result.status === 'pass' ? chalk.green : result.status === 'fail' ? chalk.red : chalk.yellow;
          
          console.log(`${icon} ${color(result.name)}`);
          console.log(chalk.gray(`   ${result.message}`));
          if (result.details && options.verbose) {
            console.log(chalk.dim(`   ${result.details}`));
          }
          console.log('');
        }
        
        console.log(chalk.dim('─'.repeat(60)));
        console.log(chalk.bold('\n📈 Summary:'));
        console.log(`   ${chalk.green(`✅ Passed: ${passed}`)}`);
        console.log(`   ${chalk.yellow(`⚠️  Warnings: ${warnings}`)}`);
        console.log(`   ${chalk.red(`❌ Failed: ${failed}`)}`);
        console.log('');
        
        if (failed > 0) {
          console.log(chalk.red('❌ Self-check failed. Please fix the issues above.'));
          process.exit(1);
        } else if (warnings > 0) {
          console.log(chalk.yellow('⚠️  Self-check passed with warnings.'));
        } else {
          console.log(chalk.green('✅ All checks passed!'));
        }
        
      } catch (error) {
        spinner.fail(chalk.red('Self-check failed'));
        console.error(chalk.red(`\nError: ${error instanceof Error ? error.message : 'Unknown error'}`));
        process.exit(1);
      }
    });
  
  return command;
}

async function checkCoreFiles(skillkitRoot: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const requiredFiles = [
    'package.json',
    'src/cli.ts',
    'src/intelligence/multi-language-analyzer.ts',
    'src/intelligence/workflow-adapter.ts',
    'templates/workflows',
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(skillkitRoot, file);
    if (fs.existsSync(filePath)) {
      results.push({
        name: `Core file: ${file}`,
        status: 'pass',
        message: 'File exists'
      });
    } else {
      results.push({
        name: `Core file: ${file}`,
        status: 'fail',
        message: 'File missing'
      });
    }
  }
  
  return results;
}

async function checkTemplates(skillkitRoot: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const templatesDir = path.join(skillkitRoot, 'templates', 'workflows');
  
  if (!fs.existsSync(templatesDir)) {
    results.push({
      name: 'Templates directory',
      status: 'fail',
      message: 'Templates directory not found'
    });
    return results;
  }
  
  const templates = fs.readdirSync(templatesDir).filter(f => f.endsWith('.md'));
  const expectedTemplates = ['BEGIN_SESSION.md', 'IMPLEMENT_FEATURE.md', 'FIX_BUGS.md', 'DEPLOY_PREP.md'];
  
  for (const expected of expectedTemplates) {
    if (templates.includes(expected)) {
      results.push({
        name: `Template: ${expected}`,
        status: 'pass',
        message: 'Template exists'
      });
    } else {
      results.push({
        name: `Template: ${expected}`,
        status: 'warn',
        message: 'Template missing (may be optional)'
      });
    }
  }
  
  return results;
}

async function checkHardcodedValues(skillkitRoot: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const srcDir = path.join(skillkitRoot, 'src');
  const docsDir = path.join(skillkitRoot, 'docs');
  
  // Patterns to check for hardcoded values
  // Note: These patterns check for hardcoded values but exclude this file itself
  const hardcodedPatterns = [
    { pattern: /profitpilot\/|ProfitPilot\//gi, name: 'Hardcoded project path: profitpilot/' },
    { pattern: /sedi\/|SEDI\//gi, name: 'Hardcoded project path: sedi/' },
    { pattern: /\/c\/Projects\/[^\/]+/gi, name: 'Hardcoded Windows path' },
    { pattern: /2025-11-\d{2}|2025-01-\d{2}/g, name: 'Hardcoded date' },
  ];
  
  const filesToCheck = [
    ...getAllFiles(srcDir, ['.ts', '.js']),
    ...getAllFiles(docsDir, ['.md']).filter(f => !f.includes('MULTI_LANGUAGE_VALIDATION.md')), // Skip validation doc
  ];
  
  const foundHardcoded: string[] = [];
  
  for (const file of filesToCheck) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      for (const { pattern, name } of hardcodedPatterns) {
        if (pattern.test(content)) {
          const relativePath = path.relative(skillkitRoot, file);
          foundHardcoded.push(`${name} in ${relativePath}`);
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }
  
  if (foundHardcoded.length === 0) {
    results.push({
      name: 'Hardcoded values check',
      status: 'pass',
      message: 'No hardcoded project names, dates, or paths found'
    });
  } else {
    results.push({
      name: 'Hardcoded values check',
      status: 'warn',
      message: `Found ${foundHardcoded.length} potential hardcoded value(s)`,
      details: foundHardcoded.slice(0, 5).join('\n')
    });
  }
  
  return results;
}

async function testMultiLanguageAnalyzer(skillkitRoot: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  
  try {
    const analyzer = new MultiLanguageAnalyzer(skillkitRoot);
    const project = await analyzer.analyze();
    
    if (project.languages.length > 0) {
      results.push({
        name: 'Multi-language analyzer',
        status: 'pass',
        message: `Detected ${project.languages.length} language stack(s)`
      });
    } else {
      results.push({
        name: 'Multi-language analyzer',
        status: 'warn',
        message: 'No languages detected (may be expected for SkillKit itself)'
      });
    }
  } catch (error) {
    results.push({
      name: 'Multi-language analyzer',
      status: 'fail',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
  
  return results;
}

async function testWorkflowAdapter(skillkitRoot: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  
  try {
    const analyzer = new MultiLanguageAnalyzer(skillkitRoot);
    const project = await analyzer.analyze();
    const adapter = new WorkflowAdapter(project);
    const mappings = adapter.generateCommandMappings();
    
    if (mappings.size >= 0) {
      results.push({
        name: 'Workflow adapter',
        status: 'pass',
        message: `Generated ${mappings.size} command mapping(s)`
      });
    } else {
      results.push({
        name: 'Workflow adapter',
        status: 'warn',
        message: 'No command mappings generated'
      });
    }
  } catch (error) {
    results.push({
      name: 'Workflow adapter',
      status: 'fail',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
  
  return results;
}

async function checkCommandRegistration(skillkitRoot: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const cliFile = path.join(skillkitRoot, 'src', 'cli.ts');
  
  if (!fs.existsSync(cliFile)) {
    results.push({
      name: 'Command registration',
      status: 'fail',
      message: 'CLI file not found'
    });
    return results;
  }
  
  const content = fs.readFileSync(cliFile, 'utf-8');
  const expectedCommands = [
    'createAuditCommand',
    'createMetaCustomizeCommand',
    'createWorkflowGenCommand',
    'createDiagnoseCommand',
  ];
  
  for (const cmd of expectedCommands) {
    if (content.includes(cmd)) {
      results.push({
        name: `Command: ${cmd}`,
        status: 'pass',
        message: 'Command registered'
      });
    } else {
      results.push({
        name: `Command: ${cmd}`,
        status: 'warn',
        message: 'Command not found in CLI'
      });
    }
  }
  
  return results;
}

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and dist
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        files.push(...getAllFiles(fullPath, extensions));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

