# AI Error Analysis: Integration with SkillKit

## 🎯 **Overview**

This document explains how AI Error Analysis integrates with SkillKit's existing architecture, CLI commands, workflows, and IDE integrations.

---

## 🏗️ **Integration Architecture**

### **Three Integration Points**

```
┌─────────────────────────────────────────────────────────┐
│                    SkillKit Core                         │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  CLI Commands │  │  Workflows   │  │  IDE Integration│ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
│         └─────────────────┼─────────────────┘          │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  AI Service Layer │                   │
│                  └────────┬────────┘                    │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │ Error Analysis   │                    │
│                  │    Engine        │                    │
│                  └──────────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

---

## 1️⃣ **CLI Command Integration**

### **Primary Command: `tsk ai analyze-error`**

```typescript
// src/cli-commands/ai-analyze-error.ts
import { Command } from 'commander';
import { AIErrorAnalysisEngine } from '../ai/error-analysis/error-analysis-engine';
import { LicenseValidator } from '../auth/license-validator';

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
    .action(async (options) => {
      // 1. Validate license (Professional tier required)
      const license = await LicenseValidator.getInstance().validateLicense();
      if (license.tier !== 'PROFESSIONAL' && license.tier !== 'ENTERPRISE') {
        console.error('❌ AI Error Analysis requires Professional tier');
        console.log('Upgrade: https://skillkit.dev/pricing');
        process.exit(1);
      }

      // 2. Initialize engine
      const engine = new AIErrorAnalysisEngine({
        provider: options.provider,
        cache: !options.noCache,
        costLimit: 0.01
      });

      // 3. Collect error context
      const errorContext = await collectErrorContext(options);

      // 4. Analyze
      const analysis = await engine.analyzeError(errorContext, {
        includePreview: true,
        maxFixes: 5,
        incremental: options.interactive
      });

      // 5. Display results
      displayResults(analysis, options.output);

      // 6. Auto-fix if requested
      if (options.autoFix) {
        await applyFix(analysis.fixSuggestions[0]);
      }
    });

  return command;
}
```

### **Registration in CLI**

```typescript
// src/cli.ts
import { createAIAnalyzeErrorCommand } from './cli-commands/ai-analyze-error';

// ... existing code ...

program.addCommand(createAIAnalyzeErrorCommand());
```

### **Usage Examples**

```bash
# Analyze error from command output
npm run build 2>&1 | tsk ai analyze-error --error "$(cat)"

# Analyze error from log file
tsk ai analyze-error --file error.log

# Analyze with code context
tsk ai analyze-error \
  --error "TypeError: Cannot read property 'x' of undefined" \
  --context-file src/app.ts \
  --line 42

# Interactive mode (step-by-step)
tsk ai analyze-error --error "..." --interactive

# Auto-apply fix
tsk ai analyze-error --error "..." --auto-fix

# Batch analysis
tsk ai analyze-error --batch errors.json --output json
```

---

## 2️⃣ **Workflow Integration**

### **Integration with Existing Workflows**

AI Error Analysis integrates into existing SkillKit workflows:

#### **A. FIX_BUGS Workflow Enhancement**

```markdown
# FIX_BUGS.md (Enhanced)

## Phase 1: Error Detection

```bash
# Run tests/build to find errors
tsk run-checks --dir .

# If errors found, analyze with AI
if [ $? -ne 0 ]; then
  echo "🔍 Analyzing errors with AI..."
  tsk ai analyze-error --file build-errors.log --interactive
fi
```

## Phase 2: AI-Powered Analysis

```bash
# For each error, get AI analysis
for error in $(cat errors.txt); do
  echo "Analyzing: $error"
  tsk ai analyze-error --error "$error" --output json > "analysis_$(date +%s).json"
done
```

## Phase 3: Apply Fixes

```bash
# Review AI suggestions and apply
tsk ai analyze-error --error "$ERROR" --interactive
# Agent reviews suggestions and applies fixes
```
```

#### **B. IMPLEMENT_FEATURE Workflow Integration**

```markdown
# IMPLEMENT_FEATURE.md (Enhanced)

## Phase 5: Error Handling

```bash
# If implementation errors occur, use AI analysis
if errors_detected; then
  echo "🤖 Using AI to analyze implementation errors..."
  tsk ai analyze-error --file implementation-errors.log
  
  # AI provides fix suggestions
  # Agent reviews and applies fixes
fi
```
```

#### **C. FINAL_CHECK Workflow Integration**

```markdown
# FINAL_CHECK.md (Enhanced)

## Phase 1: Quality Checks

```bash
# Run comprehensive checks
tsk run-checks --dir .

# If errors found, AI analysis
if [ $? -ne 0 ]; then
  echo "🔍 Final check: Analyzing remaining errors..."
  tsk ai analyze-error --batch final-errors.json --output markdown > final-analysis.md
fi
```
```

### **New Workflow: AI_ERROR_ANALYSIS.md**

```markdown
# AI_ERROR_ANALYSIS.md (New Workflow)

**Purpose:** Dedicated workflow for AI-powered error analysis

## Protocol

```bash
# 1. Collect errors
ERRORS=$(tsk run-checks --dir . 2>&1 | grep -E "error|Error|ERROR")

# 2. Analyze each error with AI
for error in $ERRORS; do
  tsk ai analyze-error --error "$error" --interactive
done

# 3. Generate summary report
tsk ai analyze-error --batch errors.json --output markdown > error-analysis-report.md
```
```

---

## 3️⃣ **IDE Integration**

### **A. Cursor Integration**

#### **Slash Command: `/ANALYZE_ERROR`**

```markdown
# .cursor/commands/ANALYZE_ERROR.md

# Analyze Error with AI

**Purpose:** AI-powered error analysis and fix suggestions

## Usage

```bash
# Analyze current error (from terminal output or selection)
tsk ai analyze-error --error "$SELECTED_TEXT" --context-file "$CURRENT_FILE" --line $CURRENT_LINE

# Interactive mode
tsk ai analyze-error --error "$ERROR" --interactive

# Auto-fix
tsk ai analyze-error --error "$ERROR" --auto-fix
```

## Integration Points

- **Auto-trigger:** When build/test fails, suggest AI analysis
- **Context-aware:** Uses current file and cursor position
- **Inline suggestions:** Shows fixes directly in editor
```

#### **Real-time Error Monitoring**

```typescript
// src/cursor/error-monitor.ts
export class CursorErrorMonitor {
  async monitorTerminalOutput(output: string): Promise<void> {
    const errors = this.extractErrors(output);
    
    if (errors.length > 0) {
      // Suggest AI analysis
      await this.suggestAIAnalysis(errors[0]);
    }
  }

  private async suggestAIAnalysis(error: string): Promise<void> {
    // Show notification in Cursor
    await this.showNotification({
      message: "🔍 Error detected. Analyze with AI?",
      actions: [
        { label: "Analyze", command: `tsk ai analyze-error --error "${error}"` },
        { label: "Dismiss", command: "" }
      ]
    });
  }
}
```

### **B. VSCode Integration**

#### **Command Palette**

```json
// .vscode/tasks.json (generated by SkillKit)
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "SkillKit: Analyze Error with AI",
      "type": "shell",
      "command": "tsk ai analyze-error",
      "args": [
        "--error",
        "${input:errorMessage}",
        "--context-file",
        "${file}",
        "--line",
        "${lineNumber}"
      ],
      "problemMatcher": []
    }
  ],
  "inputs": [
    {
      "id": "errorMessage",
      "type": "promptString",
      "description": "Error message or stack trace"
    }
  ]
}
```

#### **VSCode Extension (Future)**

```typescript
// vscode-extension/src/error-analysis.ts
export class VSCodeErrorAnalysis {
  async analyzeError(error: string, file: string, line: number): Promise<void> {
    // Call SkillKit CLI
    const result = await execCommand('tsk', [
      'ai', 'analyze-error',
      '--error', error,
      '--context-file', file,
      '--line', line.toString(),
      '--output', 'json'
    ]);

    // Display in VSCode
    const analysis = JSON.parse(result);
    await this.showAnalysisPanel(analysis);
  }
}
```

---

## 4️⃣ **Integration with Existing Commands**

### **A. Enhanced `tsk run-checks`**

```typescript
// src/cli-commands/run-checks.ts (Enhanced)
export async function runChecks(options: RunChecksOptions): Promise<void> {
  // ... existing checks ...

  // If errors found, suggest AI analysis
  if (errors.length > 0 && options.aiAnalysis !== false) {
    console.log('\n🤖 Errors detected. Use AI analysis?');
    console.log(`   tsk ai analyze-error --batch errors.json`);
    
    // Auto-analyze if flag set
    if (options.autoAnalyze) {
      await analyzeErrorsWithAI(errors);
    }
  }
}
```

**Usage:**
```bash
# Run checks, auto-analyze errors with AI
tsk run-checks --auto-analyze

# Run checks, skip AI analysis
tsk run-checks --no-ai-analysis
```

### **B. Enhanced `tsk diagnose`**

```typescript
// src/cli-commands/diagnose.ts (Enhanced)
export async function diagnose(options: DiagnoseOptions): Promise<void> {
  // ... existing diagnostics ...

  // Add AI error analysis section
  if (options.aiAnalysis) {
    const errors = await collectErrors();
    if (errors.length > 0) {
      const analysis = await analyzeErrorsWithAI(errors);
      report.addSection('AI Error Analysis', analysis);
    }
  }
}
```

**Usage:**
```bash
# Full diagnostics with AI error analysis
tsk diagnose --ai-analysis
```

### **C. Integration with `tsk exec`**

```typescript
// When tsk exec fails, suggest AI analysis
export async function execCommand(command: string, args: string[]): Promise<void> {
  try {
    await execute(command, args);
  } catch (error) {
    // Suggest AI analysis
    console.log('\n💡 Error occurred. Analyze with AI?');
    console.log(`   tsk ai analyze-error --error "${error.message}"`);
    
    throw error;
  }
}
```

---

## 5️⃣ **Workflow Auto-Trigger**

### **Automatic Error Analysis in Workflows**

```typescript
// src/workflow/workflow-executor.ts (Enhanced)
export class WorkflowExecutor {
  async executeStep(step: WorkflowStep): Promise<StepResult> {
    try {
      return await this.runStep(step);
    } catch (error) {
      // Auto-trigger AI analysis for workflow errors
      if (this.shouldAnalyzeError(error)) {
        const analysis = await this.analyzeErrorWithAI(error, step);
        
        // Add analysis to workflow context
        this.workflowContext.errorAnalysis = analysis;
        
        // Suggest fixes in workflow
        await this.suggestFixes(analysis);
      }
      
      throw error;
    }
  }

  private async analyzeErrorWithAI(
    error: Error,
    step: WorkflowStep
  ): Promise<ErrorAnalysis> {
    const engine = new AIErrorAnalysisEngine();
    return await engine.analyzeError({
      error: error.message,
      context: {
        file: step.file,
        line: step.line,
        project: this.workflowContext.project
      }
    });
  }
}
```

---

## 6️⃣ **License Integration**

### **Feature Gating**

```typescript
// src/auth/license-validator.ts
export class LicenseValidator {
  async validateAIFeature(feature: string): Promise<void> {
    const license = await this.validateLicense();
    
    const featureTiers = {
      'ai-error-analysis': 'PROFESSIONAL',
      'ai-code-review': 'ENTERPRISE',
      'ai-test-generation': 'ENTERPRISE'
    };

    const requiredTier = featureTiers[feature];
    if (!this.hasAccess(license.tier, requiredTier)) {
      throw new Error(
        `Feature ${feature} requires ${requiredTier} tier. ` +
        `Current tier: ${license.tier}`
      );
    }
  }
}
```

### **Usage in Commands**

```typescript
// All AI commands check license
export async function createAIAnalyzeErrorCommand(): Command {
  // ...
  .action(async (options) => {
    // Validate license
    await LicenseValidator.getInstance().validateAIFeature('ai-error-analysis');
    
    // Proceed with analysis
    // ...
  });
}
```

---

## 7️⃣ **Context Integration**

### **Using SkillKit's Project Analysis**

```typescript
// src/ai/error-analysis/error-context-collector.ts
import { MultiLanguageAnalyzer } from '../../intelligence/multi-language-analyzer';
import { ProjectAnalyzer } from '../../intelligence/project-analyzer';

export class ErrorContextCollector {
  async collectContext(error: Error): Promise<ErrorContext> {
    // Use SkillKit's existing analyzers
    const projectAnalyzer = new ProjectAnalyzer(process.cwd());
    const project = await projectAnalyzer.analyze();

    const langAnalyzer = new MultiLanguageAnalyzer(process.cwd());
    const languages = await langAnalyzer.analyze();

    return {
      // Error-specific context
      stackTrace: await this.parseStackTrace(error),
      codeContext: await this.extractCodeContext(error),
      
      // SkillKit project context
      projectConfig: project.config,
      detectedLanguages: languages.languages,
      packageManagers: languages.packageManagers,
      frameworks: languages.frameworks,
      tools: languages.tools,
      
      // Recent changes (from Git)
      recentChanges: await this.getRecentChanges(),
      
      // Dependencies (from package.json, etc.)
      dependencies: await this.analyzeDependencies(project)
    };
  }
}
```

---

## 8️⃣ **Report Integration**

### **Standardized Report Paths**

```typescript
// src/ai/error-analysis/error-analysis-engine.ts
import { getReportPath } from '../../utils/report-paths';

export class AIErrorAnalysisEngine {
  async analyzeError(context: ErrorContext): Promise<ErrorAnalysis> {
    const analysis = await this.performAnalysis(context);

    // Save report to SkillKit's standard location
    const reportPath = getReportPath('error-analysis', {
      format: 'markdown',
      timestamp: true
    });

    await this.saveReport(analysis, reportPath);

    return analysis;
  }
}
```

**Report Location:** `docs/skillkit/error-analysis-YYYY-MM-DD_HH-MM-SS.md`

---

## 9️⃣ **Telemetry Integration**

### **Using SkillKit's Telemetry**

```typescript
// src/ai/error-analysis/error-analysis-engine.ts
import { logAIAction } from '../../utils/telemetry';

export class AIErrorAnalysisEngine {
  async analyzeError(context: ErrorContext): Promise<ErrorAnalysis> {
    const startTime = Date.now();
    
    try {
      const analysis = await this.performAnalysis(context);
      
      // Log to SkillKit telemetry
      await logAIAction({
        action: 'error-analysis',
        duration: Date.now() - startTime,
        cost: analysis.cost,
        provider: analysis.provider,
        confidence: analysis.confidence,
        success: true
      });

      return analysis;
    } catch (error) {
      await logAIAction({
        action: 'error-analysis',
        duration: Date.now() - startTime,
        success: false,
        error: error.message
      });
      
      throw error;
    }
  }
}
```

---

## 🔟 **User Experience Flow**

### **Scenario 1: Developer Encounters Error**

```
1. Developer runs: npm run build
2. Error occurs: "TypeError: Cannot read property 'x' of undefined"
3. Developer runs: tsk ai analyze-error --error "TypeError..." --context-file src/app.ts --line 42
4. AI analyzes error:
   - Root cause: Null check missing
   - Fix suggestions: 3 options with confidence scores
   - Preview: Shows diff of fix
5. Developer reviews and applies fix
6. Pattern learned for future similar errors
```

### **Scenario 2: Workflow Auto-Trigger**

```
1. Developer runs: tsk workflow implement-feature
2. Workflow step fails with error
3. Workflow executor auto-triggers: tsk ai analyze-error
4. AI provides fix suggestions
5. Workflow continues with fixes applied
6. Final check passes
```

### **Scenario 3: Batch Analysis**

```
1. Developer runs: tsk run-checks
2. Multiple errors detected
3. Developer runs: tsk ai analyze-error --batch errors.json
4. AI analyzes all errors
5. Report generated: docs/skillkit/error-analysis-report.md
6. Developer reviews and fixes systematically
```

---

## 📋 **Integration Checklist**

### **CLI Integration**
- [x] Command structure designed
- [ ] Command implementation (`createAIAnalyzeErrorCommand`)
- [ ] Registration in `src/cli.ts`
- [ ] Help text and examples

### **Workflow Integration**
- [ ] Enhanced `FIX_BUGS.md` workflow
- [ ] Enhanced `IMPLEMENT_FEATURE.md` workflow
- [ ] Enhanced `FINAL_CHECK.md` workflow
- [ ] New `AI_ERROR_ANALYSIS.md` workflow

### **IDE Integration**
- [ ] Cursor slash command (`/ANALYZE_ERROR`)
- [ ] Cursor auto-trigger on errors
- [ ] VSCode task definition
- [ ] VSCode extension (future)

### **Existing Command Integration**
- [ ] Enhanced `tsk run-checks` with AI option
- [ ] Enhanced `tsk diagnose` with AI section
- [ ] Enhanced `tsk exec` error handling

### **Infrastructure Integration**
- [ ] License validation
- [ ] Project context integration
- [ ] Report path integration
- [ ] Telemetry integration
- [ ] Cost tracking

---

## 🎯 **Summary**

AI Error Analysis integrates with SkillKit through:

1. **CLI Command** - `tsk ai analyze-error` (primary interface)
2. **Workflows** - Enhanced existing workflows + new dedicated workflow
3. **IDE Integration** - Cursor slash commands + VSCode tasks
4. **Existing Commands** - Enhanced `run-checks`, `diagnose`, `exec`
5. **Infrastructure** - License, context, reports, telemetry

**Result:** Seamless integration that feels native to SkillKit's architecture and workflows.

---

**Status:** 📋 Integration plan complete  
**Next:** Implementation of integration points
