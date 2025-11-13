import { Command } from 'commander';
import fs from 'fs';
import chalk from 'chalk';
import { runDiagnostics } from '../workflow/executor';
import { getReportPath, getRelativeReportPath } from '../utils/report-paths.js';

/**
 * CLI command: tsk diagnose
 * 
 * Runs full diagnostics on current project:
 * - Discovers project commands
 * - Runs lint, typecheck, test, build
 * - Shows results
 * - Saves report to docs/skillkit/
 */

export function createDiagnoseCommand(): Command {
  const cmd = new Command('diagnose');
  
  cmd
    .description('Run full diagnostics on current project')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .option('--no-report', 'Skip saving report to file')
    .option('--format <type>', 'Report format: markdown, json', 'markdown')
    .action(async (options) => {
      console.log('🔍 Running diagnostics...\n');
      
      const result = await runDiagnostics(options.dir);
      
      console.log('\n📊 Results:');
      console.log('─'.repeat(50));
      
      let passed = 0;
      let failed = 0;
      
      result.results.forEach(r => {
        const icon = r.success ? '✅' : '❌';
        console.log(`${icon} ${r.step}`);
        if (!r.success && r.output) {
          console.log(`   ${r.output.split('\n')[0]}`);
        }
        
        r.success ? passed++ : failed++;
      });
      
      console.log('─'.repeat(50));
      console.log(`Passed: ${passed} | Failed: ${failed}`);
      
      // Generate and save report
      if (options.report !== false) {
        const format = options.format || 'markdown';
        const ext = format === 'json' ? 'json' : 'md';
        const reportPath = getReportPath('diagnostics', ext, options.dir);
        
        let reportContent: string;
        
        if (format === 'json') {
          reportContent = JSON.stringify({
            timestamp: new Date().toISOString(),
            summary: {
              passed,
              failed,
              total: result.results.length
            },
            results: result.results.map(r => ({
              step: r.step,
              success: r.success,
              output: r.output
            }))
          }, null, 2);
        } else {
          reportContent = `# Diagnostics Report

**Generated:** ${new Date().toISOString()}
**Project:** ${options.dir}

## Summary

- **Total Checks:** ${result.results.length}
- **Passed:** ${passed} ✅
- **Failed:** ${failed} ${failed > 0 ? '❌' : ''}

## Results

${result.results.map(r => {
  const icon = r.success ? '✅' : '❌';
  return `### ${icon} ${r.step}

**Status:** ${r.success ? 'PASSED' : 'FAILED'}
${r.output ? `\n**Output:**\n\`\`\`\n${r.output}\n\`\`\`` : ''}
`;
}).join('\n')}

## Next Steps

${failed > 0 ? `- Fix failing checks: ${result.results.filter(r => !r.success).map(r => r.step).join(', ')}\n- Run specific checks: \`tsk run <command>\`` : '✅ All checks passed!'}
`;
        }
        
        fs.writeFileSync(reportPath, reportContent, 'utf-8');
        const relativePath = getRelativeReportPath(reportPath, options.dir);
        console.log(chalk.dim(`\n📄 Report saved: ${relativePath}`));
      }
      
      if (failed > 0) {
        console.log('\n💡 Run specific checks: tsk run lint, tsk run typecheck, etc.');
        process.exit(1);
      }
    });
  
  return cmd;
}

