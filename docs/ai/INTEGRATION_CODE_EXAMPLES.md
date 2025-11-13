# AI Error Analysis: Code Integration Examples

## 🎯 **Concrete Code Examples**

Real code examples showing how AI Error Analysis integrates with SkillKit's existing codebase.

---

## 1️⃣ **CLI Command Implementation**

### **Command File Structure**

```typescript
// src/cli-commands/ai-analyze-error.ts
import { Command } from 'commander';
import chalk from 'chalk';
import { AIErrorAnalysisEngine } from '../ai/error-analysis/error-analysis-engine';
import { LicenseValidator } from '../auth/license-validator';
import { getReportPath } from '../utils/report-paths';
import { MultiLanguageAnalyzer } from '../intelligence/multi-language-analyzer';

export function createAIAnalyzeErrorCommand(): Command {
  const command = new Command('ai analyze-error');
  
  command
    .description('Analyze errors with AI-powered root cause analysis and fix suggestions')
    .option('--error <text>', 'Error message or stack trace')
    .option('--file <path>', 'Path to error log file')
    .option('--context-file <path>', 'Source file where error occurred')
    .option('--line <number>', 'Line number where error occurred')
    .option('--auto-fix', 'Automatically apply the highest confidence fix')
    .option('--interactive', 'Interactive mode with step-by-step fixes')
    .option('--batch <file>', 'Batch analyze multiple errors from file')
    .option('--output <format>', 'Output format: json, markdown, table', 'table')
    .option('--provider <name>', 'AI provider: anthropic, openai, local, auto', 'auto')
    .option('--no-cache', 'Disable caching for this analysis')
    .option('--dir <path>', 'Project directory', process.cwd())
    .action(async (options) => {
      try {
        // 1. License validation
        const license = await LicenseValidator.getInstance().validateLicense();
        if (license.tier !== 'PROFESSIONAL' && license.tier !== 'ENTERPRISE') {
          console.error(chalk.red('❌ AI Error Analysis requires Professional tier'));
          console.log(chalk.yellow('Upgrade: https://skillkit.dev/pricing'));
          process.exit(1);
        }

        // 2. Collect error context
        const errorContext = await collectErrorContext(options);

        // 3. Initialize engine (uses SkillKit's project analysis)
        const projectDir = options.dir || process.cwd();
        const langAnalyzer = new MultiLanguageAnalyzer(projectDir);
        const project = await langAnalyzer.analyze();

        const engine = new AIErrorAnalysisEngine({
          provider: options.provider,
          cache: !options.noCache,
          costLimit: 0.01,
          projectContext: project // Use SkillKit's project analysis
        });

        // 4. Analyze
        console.log(chalk.blue('🤖 Analyzing error with AI...\n'));
        const analysis = await engine.analyzeError(errorContext, {
          includePreview: true,
          maxFixes: 5,
          incremental: options.interactive
        });

        // 5. Display results
        displayResults(analysis, options.output);

        // 6. Save report (using SkillKit's report paths)
        if (options.output !== 'table') {
          const reportPath = getReportPath('error-analysis', {
            format: options.output === 'json' ? 'json' : 'markdown',
            timestamp: true
          });
          await saveReport(analysis, reportPath, options.output);
          console.log(chalk.green(`\n📄 Report saved: ${reportPath}`));
        }

        // 7. Auto-fix if requested
        if (options.autoFix && analysis.fixSuggestions.length > 0) {
          const fix = analysis.fixSuggestions[0];
          console.log(chalk.yellow(`\n🔧 Applying fix: ${fix.description}...`));
          await applyFix(fix, errorContext);
          console.log(chalk.green('✅ Fix applied successfully'));
        }

      } catch (error) {
        console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : String(error)}`));
        process.exit(1);
      }
    });

  return command;
}

async function collectErrorContext(options: any): Promise<ErrorContext> {
  let errorText = '';

  if (options.error) {
    errorText = options.error;
  } else if (options.file) {
    errorText = fs.readFileSync(options.file, 'utf-8');
  } else {
    // Read from stdin
    errorText = await readStdin();
  }

  return {
    error: errorText,
    file: options.contextFile,
    line: options.line ? parseInt(options.line) : undefined,
    project: options.dir || process.cwd()
  };
}

function displayResults(analysis: ErrorAnalysis, format: string): void {
  if (format === 'json') {
    console.log(JSON.stringify(analysis, null, 2));
    return;
  }

  if (format === 'markdown') {
    console.log(generateMarkdownReport(analysis));
    return;
  }

  // Table format (default)
  console.log(chalk.bold('\n📊 Error Analysis Results\n'));
  console.log(chalk.bold('Root Cause:'));
  console.log(`  ${analysis.rootCause.description}`);
  console.log(`  Category: ${analysis.rootCause.category}`);
  console.log(`  Confidence: ${(analysis.confidence * 100).toFixed(1)}%\n`);

  console.log(chalk.bold('Fix Suggestions:'));
  analysis.fixSuggestions.forEach((fix, index) => {
    console.log(`\n  ${index + 1}. ${fix.description}`);
    console.log(`     Confidence: ${(fix.confidence * 100).toFixed(1)}%`);
    console.log(`     Estimated Time: ${fix.estimatedTime}s`);
    if (fix.preview) {
      console.log(`     Preview: ${fix.preview}`);
    }
  });

  if (analysis.cost) {
    console.log(chalk.gray(`\n💰 Cost: $${analysis.cost.toFixed(4)}`));
  }
}
```

### **Registration in CLI**

```typescript
// src/cli.ts
import { createAIAnalyzeErrorCommand } from './cli-commands/ai-analyze-error';

// ... existing imports ...

// Register AI commands
program.addCommand(createAIAnalyzeErrorCommand());

// ... rest of CLI setup ...
```

---

## 2️⃣ **Workflow Integration Example**

### **Enhanced FIX_BUGS Workflow**

```markdown
# FIX_BUGS.md (Enhanced with AI)

## Phase 1: Error Detection

```bash
# Run comprehensive checks
tsk run-checks --dir . > /tmp/checks.log 2>&1
CHECK_EXIT_CODE=$?

if [ $CHECK_EXIT_CODE -ne 0 ]; then
  echo "❌ Errors detected. Analyzing with AI..."
  
  # Extract errors from check output
  grep -E "error|Error|ERROR|failed|Failed" /tmp/checks.log > /tmp/errors.txt
  
  # Analyze each error with AI (Professional tier)
  if command -v tsk &> /dev/null; then
    echo "🤖 Running AI error analysis..."
    tsk ai analyze-error --batch /tmp/errors.txt --output markdown > /tmp/ai-analysis.md
    
    # Display AI analysis
    cat /tmp/ai-analysis.md
    
    # Agent reviews and applies fixes based on AI suggestions
  else
    echo "⚠️  AI analysis not available. Review errors manually."
    cat /tmp/errors.txt
  fi
fi
```

## Phase 2: Apply AI-Suggested Fixes

```bash
# For each fix suggestion from AI analysis
while IFS= read -r fix_suggestion; do
  echo "Applying: $fix_suggestion"
  # Agent reviews and applies fix
  # (AI provides code changes, agent applies them)
done < /tmp/ai-fixes.txt
```
```

---

## 3️⃣ **Integration with run-checks**

### **Enhanced run-checks Command**

```typescript
// src/cli-commands/run-checks.ts (Enhanced)
import { AIErrorAnalysisEngine } from '../ai/error-analysis/error-analysis-engine';
import { LicenseValidator } from '../auth/license-validator';

export function createRunChecksCommand(): Command {
  const cmd = new Command('run-checks');

  cmd
    .description('Run comprehensive code quality checks')
    .option('-d, --dir <path>', 'Project directory', process.cwd())
    .option('--no-report', 'Skip saving audit report')
    .option('--format <type>', 'Report format: markdown, json', 'markdown')
    .option('--ai-analysis', 'Enable AI error analysis for detected errors')
    .option('--auto-analyze', 'Automatically analyze errors with AI')
    .action(async (options) => {
      // ... existing check execution ...

      const errors: string[] = [];
      
      // Collect errors from check results
      allResults.forEach(result => {
        if (result.status === 'fail' && result.output) {
          errors.push(result.output);
        }
      });

      // AI Analysis integration
      if (errors.length > 0) {
        if (options.aiAnalysis || options.autoAnalyze) {
          try {
            // Check license
            const license = await LicenseValidator.getInstance().validateLicense();
            if (license.tier === 'PROFESSIONAL' || license.tier === 'ENTERPRISE') {
              console.log(chalk.blue('\n🤖 Analyzing errors with AI...\n'));
              
              const engine = new AIErrorAnalysisEngine();
              
              for (const error of errors) {
                const analysis = await engine.analyzeError({
                  error: error,
                  project: options.dir
                });
                
                console.log(chalk.bold(`\nError: ${error.substring(0, 50)}...`));
                console.log(chalk.green(`Root Cause: ${analysis.rootCause.description}`));
                console.log(chalk.yellow(`Fix: ${analysis.fixSuggestions[0]?.description || 'No fix available'}`));
              }
            } else {
              console.log(chalk.yellow('\n💡 AI error analysis available in Professional tier'));
              console.log(chalk.gray('   Run: tsk ai analyze-error --error "<error>"'));
            }
          } catch (error) {
            console.log(chalk.yellow('\n⚠️  AI analysis unavailable, showing errors only'));
          }
        } else {
          console.log(chalk.yellow('\n💡 Use --ai-analysis to analyze errors with AI'));
        }
      }

      // ... rest of existing code ...
    });

  return cmd;
}
```

---

## 4️⃣ **IDE Integration: Cursor**

### **Slash Command Implementation**

```markdown
# .cursor/commands/ANALYZE_ERROR.md

# Analyze Error with AI

**Purpose:** AI-powered error analysis and fix suggestions

## Usage

```bash
# Analyze selected error text
tsk ai analyze-error --error "$SELECTED_TEXT" --context-file "$CURRENT_FILE" --line $CURRENT_LINE

# Interactive mode (step-by-step)
tsk ai analyze-error --error "$ERROR" --interactive

# Auto-fix highest confidence suggestion
tsk ai analyze-error --error "$ERROR" --auto-fix
```

## Integration with Workflows

This command integrates with:
- `/FIX_BUGS` - Auto-triggers on error detection
- `/IMPLEMENT_FEATURE` - Analyzes implementation errors
- `/FINAL_CHECK` - Final error analysis before completion

## Example Workflow

1. Error occurs during development
2. Agent runs: `/ANALYZE_ERROR`
3. AI provides root cause and fix suggestions
4. Agent reviews and applies fixes
5. Workflow continues
```

### **Auto-Trigger in Cursor**

```typescript
// src/cursor/error-detector.ts (New file)
import { execSync } from 'child_process';
import { AIErrorAnalysisEngine } from '../ai/error-analysis/error-analysis-engine';

export class CursorErrorDetector {
  private lastTerminalOutput: string = '';

  async monitorTerminalOutput(output: string): Promise<void> {
    this.lastTerminalOutput += output;

    // Detect error patterns
    const errorPatterns = [
      /error:/i,
      /Error:/i,
      /ERROR:/i,
      /failed/i,
      /Failed/i,
      /TypeError/i,
      /ReferenceError/i,
      /SyntaxError/i
    ];

    const hasError = errorPatterns.some(pattern => pattern.test(output));

    if (hasError) {
      await this.suggestAIAnalysis(this.extractError(output));
    }
  }

  private async suggestAIAnalysis(error: string): Promise<void> {
    // Show notification in Cursor UI
    // (This would be implemented via Cursor's extension API)
    console.log('\n🔍 Error detected. Analyze with AI?');
    console.log(`   Run: tsk ai analyze-error --error "${error.substring(0, 100)}"`);
  }

  private extractError(output: string): string {
    // Extract error message from terminal output
    const lines = output.split('\n');
    const errorLines = lines.filter(line => 
      /error|Error|ERROR|failed|Failed/.test(line)
    );
    return errorLines.join('\n');
  }
}
```

---

## 5️⃣ **Workflow Executor Integration**

### **Auto-Trigger on Workflow Errors**

```typescript
// src/workflow/workflow-executor.ts (Enhanced)
import { AIErrorAnalysisEngine } from '../ai/error-analysis/error-analysis-engine';
import { LicenseValidator } from '../auth/license-validator';

export class WorkflowExecutor {
  private aiEngine: AIErrorAnalysisEngine | null = null;

  async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<StepResult> {
    try {
      return await this.runStep(step, context);
    } catch (error) {
      // Auto-trigger AI analysis for workflow errors
      if (await this.shouldAnalyzeError(error, step)) {
        const analysis = await this.analyzeErrorWithAI(error, step, context);
        
        // Add analysis to workflow context
        context.errorAnalysis = analysis;
        
        // Log AI suggestion
        console.log(chalk.blue('\n🤖 AI Analysis:'));
        console.log(chalk.green(`Root Cause: ${analysis.rootCause.description}`));
        console.log(chalk.yellow(`Suggested Fix: ${analysis.fixSuggestions[0]?.description}`));
        
        // Agent can now use this information to fix the error
      }
      
      throw error;
    }
  }

  private async shouldAnalyzeError(
    error: Error,
    step: WorkflowStep
  ): Promise<boolean> {
    // Only analyze if:
    // 1. License allows it
    // 2. Error is not a known workflow error (e.g., user cancellation)
    // 3. Step is not marked to skip AI analysis

    try {
      const license = await LicenseValidator.getInstance().validateLicense();
      if (license.tier !== 'PROFESSIONAL' && license.tier !== 'ENTERPRISE') {
        return false;
      }

      if (step.skipAIAnalysis) {
        return false;
      }

      // Don't analyze user cancellation
      if (error.message.includes('cancelled') || error.message.includes('aborted')) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private async analyzeErrorWithAI(
    error: Error,
    step: WorkflowStep,
    context: WorkflowContext
  ): Promise<ErrorAnalysis> {
    // Initialize engine if not already done
    if (!this.aiEngine) {
      this.aiEngine = new AIErrorAnalysisEngine({
        provider: 'auto',
        cache: true,
        costLimit: 0.01
      });
    }

    return await this.aiEngine.analyzeError({
      error: error.message,
      stackTrace: error.stack,
      context: {
        file: step.file,
        line: step.line,
        project: context.project,
        workflow: context.workflowName,
        step: step.name
      }
    });
  }
}
```

---

## 6️⃣ **Using SkillKit's Existing Analyzers**

### **Project Context Integration**

```typescript
// src/ai/error-analysis/error-context-collector.ts
import { MultiLanguageAnalyzer } from '../../intelligence/multi-language-analyzer';
import { ProjectAnalyzer } from '../../intelligence/project-analyzer';
import { WorkflowAdapter } from '../../intelligence/workflow-adapter';

export class ErrorContextCollector {
  async collectContext(error: Error, projectDir: string): Promise<ErrorContext> {
    // Use SkillKit's existing analyzers
    const langAnalyzer = new MultiLanguageAnalyzer(projectDir);
    const projectAnalyzer = new ProjectAnalyzer(projectDir);
    
    const [project, languages] = await Promise.all([
      projectAnalyzer.analyze(),
      langAnalyzer.analyze()
    ]);

    // Extract error-specific context
    const stackTrace = this.parseStackTrace(error);
    const codeContext = await this.extractCodeContext(stackTrace, projectDir);

    return {
      // Error-specific
      error: error.message,
      stackTrace: stackTrace,
      codeContext: codeContext,

      // SkillKit project context (reusing existing analyzers)
      project: {
        config: project.config,
        languages: languages.languages.map(l => l.language),
        packageManagers: languages.packageManagers,
        frameworks: languages.frameworks,
        linters: languages.linters,
        testFrameworks: languages.testFrameworks,
        typeCheckers: languages.typeCheckers,
        buildTools: languages.buildTools,
        scripts: languages.scripts // From package.json, pyproject.toml
      },

      // Recent changes (using Git)
      recentChanges: await this.getRecentChanges(projectDir),

      // Dependencies (using SkillKit's detection)
      dependencies: await this.analyzeDependencies(project, languages)
    };
  }

  private async extractCodeContext(
    stackTrace: StackTrace,
    projectDir: string
  ): Promise<CodeContext> {
    if (!stackTrace.file) {
      return {};
    }

    const filePath = path.join(projectDir, stackTrace.file);
    
    if (!fs.existsSync(filePath)) {
      return {};
    }

    // Read file and extract relevant code
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    
    // Extract code around error line
    const errorLine = stackTrace.line || 0;
    const contextLines = 10; // Lines before and after
    const startLine = Math.max(0, errorLine - contextLines);
    const endLine = Math.min(lines.length, errorLine + contextLines);

    return {
      file: stackTrace.file,
      line: errorLine,
      code: lines.slice(startLine, endLine).join('\n'),
      imports: this.extractImports(fileContent),
      // Use SkillKit's type system if available
      typeInfo: await this.extractTypeInfo(filePath, projectDir)
    };
  }
}
```

---

## 7️⃣ **Report Integration**

### **Using SkillKit's Report Paths**

```typescript
// src/ai/error-analysis/error-analysis-engine.ts
import { getReportPath, ensureReportsDir } from '../../utils/report-paths';
import fs from 'fs';

export class AIErrorAnalysisEngine {
  async analyzeError(context: ErrorContext, options?: AnalysisOptions): Promise<ErrorAnalysis> {
    const analysis = await this.performAnalysis(context, options);

    // Save report using SkillKit's standard paths
    if (options?.saveReport !== false) {
      const reportsDir = ensureReportsDir(context.project);
      const reportPath = getReportPath('error-analysis', {
        format: 'markdown',
        timestamp: true,
        baseDir: reportsDir
      });

      const report = this.generateReport(analysis);
      fs.writeFileSync(reportPath, report, 'utf-8');

      analysis.reportPath = reportPath;
    }

    return analysis;
  }

  private generateReport(analysis: ErrorAnalysis): string {
    return `# AI Error Analysis Report

**Generated:** ${new Date().toISOString()}
**Confidence:** ${(analysis.confidence * 100).toFixed(1)}%
**Cost:** $${analysis.cost?.toFixed(4) || 'N/A'}

## Root Cause

${analysis.rootCause.description}

**Category:** ${analysis.rootCause.category}
**Confidence:** ${(analysis.rootCause.confidence * 100).toFixed(1)}%

## Fix Suggestions

${analysis.fixSuggestions.map((fix, i) => `
### ${i + 1}. ${fix.description}

- **Confidence:** ${(fix.confidence * 100).toFixed(1)}%
- **Estimated Time:** ${fix.estimatedTime}s
- **Method:** ${fix.method}

\`\`\`diff
${fix.preview || 'No preview available'}
\`\`\`
`).join('\n')}

## Similar Errors

${analysis.similarIncidents.map(incident => `
- ${incident.errorType} (${incident.similarity}% similar)
`).join('\n')}
`;
  }
}
```

---

## 8️⃣ **License Integration**

### **Feature Gating in Commands**

```typescript
// src/auth/license-validator.ts (Enhanced)
export class LicenseValidator {
  private static instance: LicenseValidator;

  async validateAIFeature(feature: string): Promise<void> {
    const license = await this.validateLicense();
    
    const featureTiers: Record<string, LicenseTier> = {
      'ai-error-analysis': 'PROFESSIONAL',
      'ai-code-review': 'ENTERPRISE',
      'ai-test-generation': 'ENTERPRISE',
      'ai-documentation': 'ENTERPRISE',
      'ai-architecture': 'ENTERPRISE'
    };

    const requiredTier = featureTiers[feature];
    if (!requiredTier) {
      throw new Error(`Unknown AI feature: ${feature}`);
    }

    if (!this.hasAccess(license.tier, requiredTier)) {
      throw new SkillKitError(
        `AI feature '${feature}' requires ${requiredTier} tier`,
        {
          code: 'LICENSE_REQUIRED',
          currentTier: license.tier,
          requiredTier: requiredTier,
          upgradeUrl: 'https://skillkit.dev/pricing'
        }
      );
    }
  }

  private hasAccess(userTier: LicenseTier, requiredTier: LicenseTier): boolean {
    const tierHierarchy: LicenseTier[] = ['FREE', 'PRO', 'PROFESSIONAL', 'ENTERPRISE'];
    return tierHierarchy.indexOf(userTier) >= tierHierarchy.indexOf(requiredTier);
  }
}
```

### **Usage in AI Commands**

```typescript
// All AI commands use this pattern
export function createAIAnalyzeErrorCommand(): Command {
  // ...
  .action(async (options) => {
    try {
      // Validate license
      await LicenseValidator.getInstance().validateAIFeature('ai-error-analysis');
      
      // Proceed with analysis
      // ...
    } catch (error) {
      if (error instanceof SkillKitError && error.code === 'LICENSE_REQUIRED') {
        console.error(chalk.red(`❌ ${error.message}`));
        console.log(chalk.yellow(`Current tier: ${error.currentTier}`));
        console.log(chalk.yellow(`Required tier: ${error.requiredTier}`));
        console.log(chalk.cyan(`Upgrade: ${error.upgradeUrl}`));
        process.exit(1);
      }
      throw error;
    }
  });
}
```

---

## 9️⃣ **Telemetry Integration**

### **Using SkillKit's Telemetry System**

```typescript
// src/ai/error-analysis/error-analysis-engine.ts
import { logAIAction } from '../../utils/telemetry';

export class AIErrorAnalysisEngine {
  async analyzeError(context: ErrorContext): Promise<ErrorAnalysis> {
    const startTime = Date.now();
    const telemetryData = {
      action: 'ai-error-analysis',
      timestamp: Date.now(),
      project: context.project,
      errorType: this.classifyError(context.error)
    };

    try {
      const analysis = await this.performAnalysis(context);

      // Log successful analysis
      await logAIAction({
        ...telemetryData,
        duration: Date.now() - startTime,
        cost: analysis.cost,
        provider: analysis.provider,
        confidence: analysis.confidence,
        success: true,
        rootCause: analysis.rootCause.category,
        fixCount: analysis.fixSuggestions.length
      });

      return analysis;
    } catch (error) {
      // Log failed analysis
      await logAIAction({
        ...telemetryData,
        duration: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });

      throw error;
    }
  }
}
```

---

## 🔟 **Complete Integration Flow**

### **End-to-End Example**

```typescript
// Example: Developer encounters error, uses AI analysis

// 1. Developer runs build
// npm run build
// Error: "TypeError: Cannot read property 'x' of undefined"

// 2. Developer runs AI analysis
// tsk ai analyze-error --error "TypeError..." --context-file src/app.ts --line 42

// 3. SkillKit flow:
async function completeFlow() {
  // a. License check
  const license = await LicenseValidator.getInstance().validateLicense();
  // ✅ Professional tier confirmed

  // b. Collect context (uses SkillKit analyzers)
  const langAnalyzer = new MultiLanguageAnalyzer(process.cwd());
  const project = await langAnalyzer.analyze();
  // ✅ Detected: TypeScript, ESLint, Jest

  // c. AI analysis
  const engine = new AIErrorAnalysisEngine({ projectContext: project });
  const analysis = await engine.analyzeError({
    error: "TypeError: Cannot read property 'x' of undefined",
    file: "src/app.ts",
    line: 42,
    project: process.cwd()
  });
  // ✅ Root cause: Null check missing
  // ✅ Fix: Add optional chaining (?.)

  // d. Save report (SkillKit standard location)
  const reportPath = getReportPath('error-analysis', { format: 'markdown' });
  // ✅ Saved to: docs/skillkit/error-analysis-2025-11-13_14-30-00.md

  // e. Telemetry
  await logAIAction({
    action: 'ai-error-analysis',
    success: true,
    cost: 0.003,
    confidence: 0.92
  });
  // ✅ Logged to: docs/AITracking/

  // f. Display results
  console.log(analysis.rootCause.description);
  console.log(analysis.fixSuggestions[0].description);
  // ✅ Developer sees fix suggestion
}
```

---

## 📋 **Integration Summary**

### **What Integrates:**

1. ✅ **CLI Commands** - `tsk ai analyze-error` registered in `src/cli.ts`
2. ✅ **Workflows** - Enhanced `FIX_BUGS.md`, `IMPLEMENT_FEATURE.md`, etc.
3. ✅ **IDE** - Cursor slash command `/ANALYZE_ERROR`
4. ✅ **Existing Commands** - Enhanced `run-checks`, `diagnose`
5. ✅ **Project Analysis** - Uses `MultiLanguageAnalyzer`, `ProjectAnalyzer`
6. ✅ **Report Paths** - Uses `getReportPath()` for standardized reports
7. ✅ **Telemetry** - Uses `logAIAction()` for tracking
8. ✅ **License** - Uses `LicenseValidator` for feature gating

### **Integration Points:**

```
AI Error Analysis
  ↓
License Validation (Professional tier)
  ↓
Project Context (MultiLanguageAnalyzer)
  ↓
Error Analysis Engine
  ↓
Report Generation (getReportPath)
  ↓
Telemetry (logAIAction)
  ↓
User/Agent (CLI, Workflow, IDE)
```

---

**Status:** ✅ Integration examples complete  
**Ready for:** Implementation
