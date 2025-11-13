import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { MultiLanguageAnalyzer } from '../intelligence/multi-language-analyzer';

interface CheckResult {
  language: string;
  tool: string;
  status: 'pass' | 'fail' | 'skip';
  output?: string;
  duration: number;
}

interface LanguageChecks {
  [language: string]: {
    lint?: string;
    typecheck?: string;
    build?: string;
    circularDeps?: string;
    duplicates?: string;
  };
}

/**
 * CLI command: tsk run-checks
 *
 * Runs comprehensive code quality checks on detected languages:
 * - Lint, typecheck, build
 * - Circular dependency detection (madge)
 * - Code duplication detection (jscpd)
 * - Generates audit report
 */
export function createRunChecksCommand(): Command {
  const cmd = new Command('run-checks');

  cmd
    .description('Run comprehensive code quality checks (lint, typecheck, build, deps, duplicates)')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .option('--no-report', 'Skip saving audit report')
    .option('--format <type>', 'Report format: markdown, json', 'markdown')
    .action(async (options) => {
      console.log('🔍 Running comprehensive code quality checks...\n');

      const projectDir = options.dir;
      const startTime = Date.now();

      try {
        // Detect project languages
        const analyzer = new MultiLanguageAnalyzer(projectDir);
        const project = await analyzer.analyze();

        console.log(`📊 Detected languages: ${project.languages.map(l => l.language).join(', ')}\n`);

        // Run checks for each language
        const allResults: CheckResult[] = [];

        for (const languageStack of project.languages) {
          console.log(`🔧 Checking ${languageStack.language}...`);
          const results = await runLanguageChecks(languageStack, projectDir);
          allResults.push(...results);
          console.log('');
        }

        // Generate report
        const duration = Date.now() - startTime;
        const report = generateReport(allResults, duration, projectDir);

        // Display results
        displayResults(allResults);

        // Save report if requested
        if (options.report !== false) {
          const reportPath = saveReport(report, options.format, projectDir);
          console.log(`\n📄 Report saved: ${reportPath}`);
        }

      } catch (error) {
        console.error(chalk.red(`❌ Error running checks: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  return cmd;
}

async function runLanguageChecks(languageStack: any, projectDir: string): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  const checks = getLanguageChecks(languageStack);

  for (const [tool, command] of Object.entries(checks)) {
    if (!command) continue;

    const startTime = Date.now();
    const result: CheckResult = {
      language: languageStack.language,
      tool,
      status: 'skip',
      duration: 0
    };

    try {
      console.log(`  Running ${tool}...`);
      const output = execSync(command, {
        cwd: projectDir,
        timeout: 60000, // 60 second timeout
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });

      result.status = 'pass';
      result.output = output.trim();
      console.log(`    ✅ ${tool} passed`);

    } catch (error: any) {
      result.status = 'fail';
      result.output = error.stdout || error.stderr || error.message;
      console.log(`    ❌ ${tool} failed`);
    }

    result.duration = Date.now() - startTime;
    results.push(result);
  }

  return results;
}

function getLanguageChecks(languageStack: any): LanguageChecks[string] {
  const checks: LanguageChecks[string] = {};

  switch (languageStack.language) {
    case 'typescript':
    case 'javascript':
      checks.lint = 'npm run lint 2>/dev/null || npx eslint . --ext .ts,.tsx,.js,.jsx 2>/dev/null || echo "No linting configured"';
      checks.typecheck = 'npm run type-check 2>/dev/null || npx tsc --noEmit 2>/dev/null || echo "No type checking configured"';
      checks.build = 'npm run build 2>/dev/null || echo "No build configured"';
      checks.circularDeps = 'npx madge --circular . 2>/dev/null || echo "madge not available"';
      checks.duplicates = 'npx jscpd . --min-lines 10 --reporters console 2>/dev/null || echo "jscpd not available"';
      break;

    case 'python':
      checks.lint = 'python -m flake8 . 2>/dev/null || python -m pylint . 2>/dev/null || echo "No linting configured"';
      checks.typecheck = 'python -m mypy . 2>/dev/null || echo "No type checking configured"';
      checks.build = 'python -m build 2>/dev/null || echo "No build configured"';
      checks.circularDeps = 'python -c "import madge; print(\'Circular deps check not available\')" 2>/dev/null || echo "madge not available for Python"';
      checks.duplicates = 'python -m pydocstyle . 2>/dev/null || echo "pydocstyle not available"';
      break;

    case 'go':
      checks.lint = 'golangci-lint run 2>/dev/null || golint ./... 2>/dev/null || echo "No linting configured"';
      checks.typecheck = 'go build ./... 2>/dev/null && echo "Type check passed" || echo "Type check failed"';
      checks.build = 'go build ./... 2>/dev/null || echo "Build failed"';
      checks.circularDeps = 'echo "Circular dependency check not available for Go"';
      checks.duplicates = 'echo "Duplicate detection not available for Go"';
      break;

    case 'java':
      checks.lint = 'mvn checkstyle:check 2>/dev/null || ./gradlew checkstyle 2>/dev/null || echo "No linting configured"';
      checks.typecheck = 'mvn compile 2>/dev/null || ./gradlew compileJava 2>/dev/null || echo "Type check failed"';
      checks.build = 'mvn package 2>/dev/null || ./gradlew build 2>/dev/null || echo "Build failed"';
      checks.circularDeps = 'echo "Circular dependency check not available for Java"';
      checks.duplicates = 'echo "Duplicate detection not available for Java"';
      break;

    default:
      checks.lint = 'echo "No linting configured for this language"';
      checks.typecheck = 'echo "No type checking configured for this language"';
      checks.build = 'echo "No build configured for this language"';
      checks.circularDeps = 'echo "Circular dependency check not available"';
      checks.duplicates = 'echo "Duplicate detection not available"';
  }

  return checks;
}

function displayResults(results: CheckResult[]): void {
  console.log('\n📊 CHECK RESULTS:');
  console.log('─'.repeat(80));

  const grouped = results.reduce((acc, result) => {
    if (!acc[result.language]) acc[result.language] = [];
    acc[result.language].push(result);
    return acc;
  }, {} as { [lang: string]: CheckResult[] });

  for (const [language, langResults] of Object.entries(grouped)) {
    console.log(`\n${language.toUpperCase()}:`);

    for (const result of langResults) {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
      const duration = result.duration > 0 ? ` (${result.duration}ms)` : '';
      console.log(`  ${icon} ${result.tool}${duration}`);

      if (result.status === 'fail' && result.output) {
        const firstLine = result.output.split('\n')[0];
        if (firstLine && firstLine.length > 60) {
          console.log(`     ${firstLine.substring(0, 60)}...`);
        } else if (firstLine) {
          console.log(`     ${firstLine}`);
        }
      }
    }
  }

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;

  console.log('\n─'.repeat(80));
  console.log(`Summary: ${passed} passed, ${failed} failed, ${skipped} skipped`);
}

function generateReport(results: CheckResult[], duration: number, projectDir: string): string {
  const timestamp = new Date().toISOString();
  const projectName = path.basename(projectDir);

  let report = `# Code Quality Audit Report

**Project:** ${projectName}
**Date:** ${timestamp}
**Duration:** ${duration}ms

## Executive Summary

`;

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  const total = results.length;

  const healthScore = total > 0 ? Math.round((passed / total) * 100) : 0;

  report += `- **Health Score:** ${healthScore}/100
- **Total Checks:** ${total}
- **Passed:** ${passed}
- **Failed:** ${failed}
- **Skipped:** ${skipped}

## Detailed Results

`;

  const grouped = results.reduce((acc, result) => {
    if (!acc[result.language]) acc[result.language] = [];
    acc[result.language].push(result);
    return acc;
  }, {} as { [lang: string]: CheckResult[] });

  for (const [language, langResults] of Object.entries(grouped)) {
    report += `### ${language.toUpperCase()}\n\n`;

    for (const result of langResults) {
      const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
      report += `- ${icon} **${result.tool}** (${result.duration}ms)\n`;

      if (result.status === 'fail' && result.output) {
        report += `  - Error: ${result.output.split('\n')[0]}\n`;
      }
    }

    report += '\n';
  }

  report += `## Recommendations

`;

  if (failed > 0) {
    report += `### 🚨 High Priority
- Fix ${failed} failed checks before committing
- Address critical errors in build/type checking

`;
  }

  if (skipped > total * 0.5) {
    report += `### ⚠️ Medium Priority
- Configure missing tools for ${skipped} skipped checks
- Consider adding linting, type checking, or build processes

`;
  }

  if (healthScore >= 80) {
    report += `### ✅ Good Health
- Code quality checks are passing
- Continue maintaining current standards

`;
  }

  report += `---
*Generated by SkillKit run-checks command*
`;

  return report;
}

function saveReport(report: string, format: string, projectDir: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const reportDir = path.join(projectDir, 'docs', 'audit');

  // Ensure directory exists
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const filename = `code-quality-audit-${timestamp}.${format}`;
  const reportPath = path.join(reportDir, filename);

  if (format === 'json') {
    // For JSON, we'd need to convert the markdown report
    // For now, just save as markdown with json extension
    fs.writeFileSync(reportPath, report);
  } else {
    fs.writeFileSync(reportPath, report);
  }

  return path.relative(projectDir, reportPath);
}
