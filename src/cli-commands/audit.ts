/**
 * CLI Command: audit
 * Comprehensive SkillKit system health check
 * 
 * Checks:
 * - Duplicate workflows
 * - Workflow structure validation
 * - Command validity
 * - Skills installation
 * - Subtask integrity
 * - Environment compatibility
 * - File integrity
 */

import chalk from 'chalk';
import ora from 'ora';
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import {
  getVersionInfo,
  getCustomizedFiles,
} from '../utils/version-checker.js';

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

interface AuditResult {
  healthScore: number;
  totalIssues: number;
  critical: AuditIssue[];
  warnings: AuditIssue[];
  info: AuditIssue[];
  duration: number;
  timestamp: string;
}

export function createAuditCommand(): Command {
  const command = new Command('audit');
  
  command
    .description('Comprehensive SkillKit system health check')
    .option('--quick', 'Quick audit (duplicates and critical only)', false)
    .option('--verify', 'Re-run audit to verify previous fixes', false)
    .option('--format <type>', 'Output format: markdown, json, text', 'markdown')
    .action(async (options: { quick?: boolean; verify?: boolean; format?: string }) => {
      const startTime = Date.now();
      const spinner = ora('Starting SkillKit audit...').start();
      
      try {
        const projectRoot = process.cwd();
        const issues: AuditIssue[] = [];
        let checksPerformed = 0;
        
        // 1. Check for duplicate workflows
        spinner.text = 'Checking for duplicate workflows...';
        const duplicateIssues = await checkDuplicates(projectRoot);
        issues.push(...duplicateIssues);
        checksPerformed++;
        
        // 1.5. Check for customized files and update conflicts
        spinner.text = 'Checking for customized files and update conflicts...';
        const customizationIssues = await checkCustomizations(projectRoot);
        issues.push(...customizationIssues);
        checksPerformed++;
        
        // 2. Validate workflow structure
        spinner.text = 'Validating workflow structure...';
        const structureIssues = await validateWorkflowStructure(projectRoot);
        issues.push(...structureIssues);
        checksPerformed++;
        
        if (!options.quick) {
          // 3. Test commands
          spinner.text = 'Testing workflow commands...';
          const commandIssues = await testCommands(projectRoot);
          issues.push(...commandIssues);
          checksPerformed++;
          
          // 4. Verify skills
          spinner.text = 'Verifying skills installation...';
          const skillIssues = await verifySkills(projectRoot);
          issues.push(...skillIssues);
          checksPerformed++;
          
          // 5. Check subtask references
          spinner.text = 'Checking subtask references...';
          const subtaskIssues = await checkSubtaskReferences(projectRoot);
          issues.push(...subtaskIssues);
          checksPerformed++;
          
          // 6. Environment compatibility
          spinner.text = 'Testing environment compatibility...';
          const envIssues = await checkEnvironment(projectRoot);
          issues.push(...envIssues);
          checksPerformed++;
        }
        
        const duration = (Date.now() - startTime) / 1000;
        
        // Calculate health score
        const critical = issues.filter(i => i.severity === 'critical');
        const warnings = issues.filter(i => i.severity === 'warning');
        const info = issues.filter(i => i.severity === 'info');
        
        let healthScore = 100;
        healthScore -= critical.length * 15; // -15 per critical
        healthScore -= warnings.length * 5;  // -5 per warning
        healthScore -= info.length * 1;      // -1 per info
        healthScore = Math.max(0, healthScore);
        
        const result: AuditResult = {
          healthScore,
          totalIssues: issues.length,
          critical,
          warnings,
          info,
          duration,
          timestamp: new Date().toISOString()
        };
        
        spinner.succeed(chalk.green('Audit complete'));
        
        // Display summary
        console.log('');
        console.log(chalk.bold('📊 Audit Summary'));
        console.log(chalk.dim('─'.repeat(60)));
        console.log(`Health Score: ${getHealthScoreDisplay(healthScore)}`);
        console.log(`Total Issues: ${result.totalIssues}`);
        console.log(`  Critical: ${chalk.red(critical.length)}`);
        console.log(`  Warnings: ${chalk.yellow(warnings.length)}`);
        console.log(`  Info: ${chalk.blue(info.length)}`);
        console.log(`Duration: ${duration.toFixed(1)}s`);
        console.log(`Checks: ${checksPerformed}`);
        console.log(chalk.dim('─'.repeat(60)));
        console.log('');
        
        // Display issues
        if (critical.length > 0) {
          console.log(chalk.bold.red('🚨 Critical Issues:\n'));
          critical.forEach((issue, idx) => {
            console.log(chalk.red(`${idx + 1}. ${issue.message}`));
            if (issue.file) console.log(chalk.dim(`   File: ${issue.file}${issue.line ? `:${issue.line}` : ''}`));
            console.log(chalk.dim(`   Impact: ${issue.impact}`));
            console.log(chalk.cyan(`   Fix: ${issue.fix}`));
            console.log('');
          });
        }
        
        if (warnings.length > 0 && !options.quick) {
          console.log(chalk.bold.yellow('⚠️  Warnings:\n'));
          warnings.slice(0, 5).forEach((issue, idx) => {
            console.log(chalk.yellow(`${idx + 1}. ${issue.message}`));
            if (issue.file) console.log(chalk.dim(`   File: ${issue.file}`));
            console.log(chalk.cyan(`   Fix: ${issue.fix}`));
            console.log('');
          });
          
          if (warnings.length > 5) {
            console.log(chalk.dim(`   ... and ${warnings.length - 5} more warnings\n`));
          }
        }
        
        // Auto-fixable count
        const autoFixable = issues.filter(i => i.autoFixable).length;
        if (autoFixable > 0) {
          console.log(chalk.green(`✨ ${autoFixable} issue(s) can be auto-fixed`));
          console.log(chalk.cyan('   Run: tsk audit:fix --auto-safe\n'));
        }
        
        // Generate report
        const reportPath = await generateReport(projectRoot, result, options.format || 'markdown');
        console.log(chalk.dim(`📄 Full report: ${reportPath}\n`));
        
        // Verify mode
        if (options.verify) {
          const previousReport = await loadPreviousReport(projectRoot);
          if (previousReport) {
            const improvement = previousReport.totalIssues - result.totalIssues;
            if (improvement > 0) {
              console.log(chalk.green(`✅ Fixed ${improvement} issue(s) since last audit!`));
            } else if (improvement < 0) {
              console.log(chalk.yellow(`⚠️  ${Math.abs(improvement)} new issue(s) found`));
            } else {
              console.log(chalk.blue('ℹ️  No change in issue count'));
            }
            console.log('');
          }
        }
        
        // Recommendations
        if (result.totalIssues === 0) {
          console.log(chalk.green.bold('🎉 Perfect! No issues found!\n'));
        } else {
          console.log(chalk.bold('📋 Next Steps:'));
          console.log(chalk.cyan('1. Review full report: cat ' + reportPath));
          if (autoFixable > 0) {
            console.log(chalk.cyan('2. Apply auto-fixes: tsk audit:fix --auto-safe'));
          }
          if (critical.length > 0) {
            console.log(chalk.cyan(`${autoFixable > 0 ? '3' : '2'}. Fix critical issues manually`));
          }
          console.log(chalk.cyan(`${autoFixable > 0 ? '4' : critical.length > 0 ? '3' : '2'}. Re-run audit: tsk audit --verify`));
          console.log('');
        }
        
        // Exit code
        process.exitCode = critical.length > 0 ? 1 : 0;
        
      } catch (error) {
        spinner.fail(chalk.red('Audit failed'));
        
        if (error instanceof Error) {
          console.error(chalk.red(`\nError: ${error.message}`));
        }
        
        process.exit(1);
      }
    });
  
  return command;
}

/**
 * Check for duplicate workflow files
 */
async function checkDuplicates(projectRoot: string): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  const commandsDir = path.join(projectRoot, '.cursor', 'commands');
  
  if (!fs.existsSync(commandsDir)) return issues;
  
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
      const canonical = fileList.find(f => f === f.toUpperCase()) || fileList[0];
      const duplicates = fileList.filter(f => f !== canonical);
      
      issues.push({
        id: `DUP-${duplicates[0]}`,
        severity: 'warning',
        category: 'Duplicates',
        file: `.cursor/commands/${duplicates.join(', ')}`,
        message: `Duplicate workflow files found`,
        impact: 'May confuse Cursor command selection',
        fix: 'tsk dedupe-workflows --force',
        autoFixable: true
      });
    }
  }
  
  return issues;
}

/**
 * Validate workflow structure
 */
async function validateWorkflowStructure(projectRoot: string): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  const commandsDir = path.join(projectRoot, '.cursor', 'commands');
  
  if (!fs.existsSync(commandsDir)) return issues;
  
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(commandsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    // Check for header
    if (!lines[0].startsWith('#')) {
      issues.push({
        id: `STR-${file}-header`,
        severity: 'warning',
        category: 'Structure',
        file: `.cursor/commands/${file}`,
        line: 1,
        message: `Missing header in ${file}`,
        impact: 'Workflow may not display properly in Cursor',
        fix: 'Add "# Workflow Name" as first line',
        autoFixable: false
      });
    }
    
    // Check for unclosed code blocks
    const codeBlockCount = (content.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      issues.push({
        id: `STR-${file}-codeblock`,
        severity: 'critical',
        category: 'Structure',
        file: `.cursor/commands/${file}`,
        message: `Unclosed code block in ${file}`,
        impact: 'Workflow will render incorrectly',
        fix: 'Add closing ``` to code block',
        autoFixable: false
      });
    }
  }
  
  return issues;
}

/**
 * Test commands in workflows
 */
async function testCommands(projectRoot: string): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  
  // Check if package manager commands would work
  const packageJson = path.join(projectRoot, 'package.json');
  if (fs.existsSync(packageJson)) {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
    const scripts = pkg.scripts || {};
    
    // Common scripts to check
    const commonScripts = ['test', 'lint', 'build', 'typecheck'];
    
    for (const script of commonScripts) {
      if (!scripts[script]) {
        issues.push({
          id: `CMD-missing-${script}`,
          severity: 'info',
          category: 'Commands',
          message: `No "${script}" script defined in package.json`,
          impact: 'Workflows referencing this command will fail',
          fix: `Add "${script}" script to package.json`,
          autoFixable: false
        });
      }
    }
  }
  
  return issues;
}

/**
 * Verify skills installation
 */
async function verifySkills(projectRoot: string): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  
  // Check OpenSkills
  try {
    execSync('openskills --version', { stdio: 'ignore' });
  } catch {
    issues.push({
      id: 'SKL-openskills',
      severity: 'warning',
      category: 'Skills',
      message: 'OpenSkills not installed',
      impact: 'Cannot load Anthropic skills',
      fix: 'npm install -g openskills',
      autoFixable: false
    });
  }
  
  // Check skills directory
  const skillsDir = path.join(projectRoot, '.claude', 'skills');
  if (!fs.existsSync(skillsDir)) {
    issues.push({
      id: 'SKL-directory',
      severity: 'info',
      category: 'Skills',
      message: 'Skills directory not found',
      impact: 'No skills available',
      fix: 'tsk install anthropics/skills',
      autoFixable: false
    });
  }
  
  // Check AGENTS.md
  const agentsMd = path.join(projectRoot, 'AGENTS.md');
  if (!fs.existsSync(agentsMd)) {
    issues.push({
      id: 'SKL-agents',
      severity: 'warning',
      category: 'Skills',
      message: 'AGENTS.md not found',
      impact: 'Skills and workflows not cataloged',
      fix: 'tsk sync',
      autoFixable: true
    });
  }
  
  return issues;
}

/**
 * Check subtask references
 */
async function checkSubtaskReferences(projectRoot: string): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  const commandsDir = path.join(projectRoot, '.cursor', 'commands');
  
  if (!fs.existsSync(commandsDir)) return issues;
  
  const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  
  for (const file of files) {
    const filePath = path.join(commandsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Find @references
    const references = content.match(/@[^\s]+\.md/g) || [];
    
    for (const ref of references) {
      const refPath = ref.substring(1); // Remove @
      const fullPath = path.join(projectRoot, refPath);
      
      if (!fs.existsSync(fullPath)) {
        issues.push({
          id: `REF-${file}-${refPath}`,
          severity: 'warning',
          category: 'References',
          file: `.cursor/commands/${file}`,
          message: `Broken subtask reference: ${refPath}`,
          impact: 'Workflow will fail when reaching this step',
          fix: `Create subtask or fix path: ${refPath}`,
          autoFixable: false
        });
      }
    }
  }
  
  return issues;
}

/**
 * Check for customized files and update conflicts
 */
async function checkCustomizations(projectRoot: string): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  
  try {
    // Check version info
    const versionInfo = getVersionInfo(projectRoot);
    if (!versionInfo) {
      // No version metadata - fresh install
      return issues;
    }
    
    const { installed, current, skippedVersions, hasBreakingChanges } = versionInfo;
    
    // Check if update available
    if (installed !== current) {
      if (skippedVersions.length > 0) {
        issues.push({
          id: 'CUST-skipped-versions',
          severity: 'warning',
          category: 'Updates',
          message: `Skipped versions detected: ${installed} → ${current}`,
          impact: 'May have breaking changes. Review CHANGELOG.md before updating.',
          fix: `Review CHANGELOG.md for versions: ${skippedVersions.join(', ')}. Consider incremental updates.`,
          autoFixable: false,
        });
      }
      
      if (hasBreakingChanges) {
        issues.push({
          id: 'CUST-breaking-changes',
          severity: 'critical',
          category: 'Updates',
          message: `Major version update detected: ${installed} → ${current}`,
          impact: 'Breaking changes likely. Customized files may be incompatible.',
          fix: 'Review CHANGELOG.md for breaking changes. Test customized workflows after update.',
          autoFixable: false,
        });
      }
    }
    
    // Check for customized files
    const customizations = getCustomizedFiles(projectRoot);
    
    if (customizations.length > 0) {
      // Check if customized files differ from current templates
      const templatesDir = path.join(__dirname, '..', '..', 'templates', 'workflows');
      
      for (const custom of customizations) {
        const customPath = path.join(projectRoot, custom.file);
        const templateName = path.basename(custom.file);
        const templatePath = path.join(templatesDir, templateName);
        
        if (fs.existsSync(customPath) && fs.existsSync(templatePath)) {
          // Compare current content with template
          const currentContent = fs.readFileSync(customPath, 'utf-8');
          const templateContent = fs.readFileSync(templatePath, 'utf-8');
          
          const currentHash = Buffer.from(currentContent).toString('base64').substring(0, 32);
          const templateHash = Buffer.from(templateContent).toString('base64').substring(0, 32);
          
          // If differs from template, it's customized
          // All customizations are valid - just track how they were customized
          if (currentHash !== templateHash && currentHash !== custom.originalHash) {
            const via = custom.customizedVia || 'unknown';
            const isMarked = custom.intentional === true;
            
            if (via === 'META_CUSTOMIZE' || isMarked) {
              // Customized via META_CUSTOMIZE or marked as intentional - info only
              issues.push({
                id: `CUST-${templateName}-${via}`,
                severity: 'info',
                category: 'Customizations',
                file: custom.file,
                message: `Customized workflow: ${templateName} (${via === 'META_CUSTOMIZE' ? 'via META_CUSTOMIZE' : 'marked as intentional'})`,
                impact: `File was customized on ${new Date(custom.customizedAt).toLocaleDateString()}. This will be preserved during updates.`,
                fix: `No action needed. This customization will be preserved automatically.`,
                autoFixable: false,
              });
            } else {
              // Manual customization - still valid, just informational
              issues.push({
                id: `CUST-${templateName}-manual`,
                severity: 'info',
                category: 'Customizations',
                file: custom.file,
                message: `Manually customized workflow: ${templateName}`,
                impact: `File was customized on ${new Date(custom.customizedAt).toLocaleDateString()}. This will be preserved during updates.`,
                fix: `No action needed. To mark as intentional: tsk meta-customize:mark --files "${custom.file}"`,
                autoFixable: false,
              });
            }
          }
        }
      }
      
      // Summary
      if (customizations.length > 0) {
        issues.push({
          id: 'CUST-summary',
          severity: 'info',
          category: 'Customizations',
          message: `${customizations.length} customized file(s) detected`,
          impact: 'These files differ from standard templates and may need consolidation.',
          fix: `Run /META_CUSTOMIZE to review and consolidate customizations with version ${current}.`,
          autoFixable: false,
        });
      }
    }
    
    // Check for deprecated workflows/skills
    // Use deprecation list to identify specific deprecated items
    const deprecatedItems = await checkDeprecatedItems(projectRoot, versionInfo.installed, current);
    issues.push(...deprecatedItems);
    
  } catch (error) {
    issues.push({
      id: 'CUST-error',
      severity: 'warning',
      category: 'Customizations',
      message: `Error checking customizations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      impact: 'Cannot verify if files are customized.',
      fix: 'Check .skillkit/version.json exists and is valid.',
      autoFixable: false,
    });
  }
  
  return issues;
}

/**
 * Compare two semantic versions
 */
/**
 * Check for deprecated workflows, skills, or features
 * Uses version-based deprecation tracking
 */
async function checkDeprecatedItems(
  projectRoot: string,
  installedVersion: string | null,
  currentVersion: string
): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];

  // Deprecation list: items deprecated in specific versions
  // Format: { version: 'x.y.z', items: ['workflow-name', 'skill-name'], reason?: string }
  const deprecationList: Array<{ version: string; items: string[]; reason?: string }> = [
    // Add specific deprecations here as they occur
    // Example: { version: '0.0.4', items: ['OLD_WORKFLOW'], reason: 'Replaced by NEW_WORKFLOW' }
  ];

  // Check version-based deprecations
  if (installedVersion) {
    for (const deprecation of deprecationList) {
      if (compareVersions(installedVersion, deprecation.version) < 0) {
        // Installed version is older than deprecation version
        for (const item of deprecation.items) {
          // Check if deprecated item exists in project
          const workflowPath = path.join(projectRoot, '.cursor', 'commands', `${item}.md`);
          const skillPath = path.join(projectRoot, 'skills', item);
          
          if (fs.existsSync(workflowPath) || fs.existsSync(skillPath)) {
            issues.push({
              id: `DEPRECATED-${item}`,
              severity: 'warning',
              category: 'Deprecation',
              message: `${item} was deprecated in version ${deprecation.version}`,
              impact: deprecation.reason || `This item is deprecated and should be removed or replaced.`,
              fix: `Remove ${item} or migrate to the recommended replacement. Review CHANGELOG.md for details.`,
              autoFixable: false,
            });
          }
        }
      }
    }

    // Fallback: warn about very old versions
    if (compareVersions(installedVersion, '0.0.3') < 0) {
      issues.push({
        id: 'CUST-deprecated-version',
        severity: 'warning',
        category: 'Deprecation',
        message: `Very old version detected: ${installedVersion}`,
        impact: 'Some workflows may be deprecated. Check for updates.',
        fix: `Update to latest version (${currentVersion}) or review CHANGELOG.md for deprecated features.`,
        autoFixable: false,
      });
    }
  }

  return issues;
}

function compareVersions(v1: string, v2: string): number {
  const parse = (v: string) => v.split('.').map(Number);
  const [m1, i1, p1] = parse(v1);
  const [m2, i2, p2] = parse(v2);
  
  if (m1 !== m2) return m1 - m2;
  if (i1 !== i2) return i1 - i2;
  return p1 - p2;
}

/**
 * Check environment compatibility
 */
async function checkEnvironment(_projectRoot: string): Promise<AuditIssue[]> {
  const issues: AuditIssue[] = [];
  
  // Check for common tools
  const tools = [
    { name: 'git', severity: 'critical' as const },
    { name: 'node', severity: 'critical' as const },
    { name: 'npm', severity: 'warning' as const }
  ];
  
  for (const tool of tools) {
    try {
      execSync(`${tool.name} --version`, { stdio: 'ignore' });
    } catch {
      issues.push({
        id: `ENV-${tool.name}`,
        severity: tool.severity,
        category: 'Environment',
        message: `${tool.name} not found in PATH`,
        impact: 'Some workflows may fail',
        fix: `Install ${tool.name}`,
        autoFixable: false
      });
    }
  }
  
  return issues;
}

/**
 * Get health score display with color
 */
function getHealthScoreDisplay(score: number): string {
  if (score >= 90) return chalk.green(`${score}/100 ✅ Excellent`);
  if (score >= 75) return chalk.green(`${score}/100 ✅ Good`);
  if (score >= 60) return chalk.yellow(`${score}/100 ⚠️  Fair`);
  if (score >= 40) return chalk.yellow(`${score}/100 ⚠️  Poor`);
  return chalk.red(`${score}/100 🚨 Critical`);
}

/**
 * Generate audit report
 */
async function generateReport(
  projectRoot: string,
  result: AuditResult,
  format: string
): Promise<string> {
  const auditDir = path.join(projectRoot, 'docs', 'audit');
  fs.mkdirSync(auditDir, { recursive: true });
  
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `audit-report-${timestamp}.${format === 'json' ? 'json' : 'md'}`;
  const filePath = path.join(auditDir, fileName);
  
  let content: string;
  
  if (format === 'json') {
    content = JSON.stringify(result, null, 2);
  } else {
    // Markdown format
    content = `# SkillKit Audit Report

**Date:** ${new Date().toISOString()}
**Duration:** ${result.duration.toFixed(1)}s
**Health Score:** ${result.healthScore}/100

## Executive Summary

- Total Issues: ${result.totalIssues}
- Critical: ${result.critical.length}
- Warnings: ${result.warnings.length}
- Info: ${result.info.length}

## Critical Issues (${result.critical.length})

${result.critical.length === 0 ? 'None found! 🎉' : result.critical.map((issue, idx) => `
### ${idx + 1}. ${issue.message}

**File:** ${issue.file || 'N/A'}${issue.line ? ` (line ${issue.line})` : ''}
**Impact:** ${issue.impact}
**Fix:** ${issue.fix}
${issue.autoFixable ? '**Auto-fixable:** Yes ✨' : '**Auto-fixable:** No'}
`).join('\n')}

## Warnings (${result.warnings.length})

${result.warnings.length === 0 ? 'None found!' : result.warnings.map((issue, idx) => `
### ${idx + 1}. ${issue.message}

**File:** ${issue.file || 'N/A'}
**Impact:** ${issue.impact}
**Fix:** ${issue.fix}
`).join('\n')}

## Info (${result.info.length})

${result.info.length === 0 ? 'None.' : result.info.map((issue, idx) => `
${idx + 1}. ${issue.message} - ${issue.fix}
`).join('\n')}

## Next Steps

${result.critical.length > 0 ? '1. Fix critical issues immediately' : ''}
${result.warnings.length > 0 ? '2. Review and fix warnings' : ''}
${result.totalIssues > 0 ? '3. Run: tsk audit --verify' : ''}
${result.totalIssues === 0 ? '✅ System is healthy! No action needed.' : ''}
`;
  }
  
  fs.writeFileSync(filePath, content, 'utf-8');
  
  // Create "latest" symlink (or copy on Windows)
  const latestPath = path.join(auditDir, `audit-report-latest.${format === 'json' ? 'json' : 'md'}`);
  try {
    if (fs.existsSync(latestPath)) fs.unlinkSync(latestPath);
    fs.copyFileSync(filePath, latestPath);
  } catch {
    // Ignore symlink errors
  }
  
  return path.relative(projectRoot, filePath);
}

/**
 * Load previous audit report
 */
async function loadPreviousReport(projectRoot: string): Promise<AuditResult | null> {
  const auditDir = path.join(projectRoot, 'docs', 'audit');
  const files = fs.readdirSync(auditDir)
    .filter(f => f.startsWith('audit-report-') && f.endsWith('.json'))
    .sort()
    .reverse();
  
  if (files.length < 2) return null; // Need at least 2 reports to compare
  
  const previousFile = path.join(auditDir, files[1]); // Second most recent
  try {
    const content = fs.readFileSync(previousFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

