const fs = require('fs-extra');
const path = require('path');

/**
 * Analyze Errors Skill
 * Parses error logs and creates actionable fix plans for AI workflows
 */
module.exports = async (input, context) => {
  const {
    errors,
    context: projectContext = {},
    priority = 'high'
  } = input;

  const workingDir = context.workingDir || projectContext.workingDir || process.cwd();

  // Parse errors
  const parsedErrors = parseErrors(errors);

  // Categorize by type
  const errorsByType = categorizeErrors(parsedErrors);

  // Calculate severity
  const severity = calculateSeverity(parsedErrors.length, priority);

  // Generate fixes
  const fixes = generateFixes(parsedErrors, projectContext);

  // Create fix plan
  const plan = createFixPlan(fixes, projectContext);

  // Save fix plan to file
  const fixPlanFile = path.join(workingDir, 'fix-plan.json');
  await fs.writeJSON(fixPlanFile, { fixes, plan, timestamp: new Date().toISOString() }, { spaces: 2 });

  return {
    summary: {
      totalErrors: parsedErrors.length,
      errorsByType,
      severity
    },
    fixes,
    plan: {
      ...plan,
      fixPlanFile: path.relative(workingDir, fixPlanFile)
    }
  };
};

/**
 * Parse error messages from raw output
 */
function parseErrors(errorText) {
  if (!errorText || typeof errorText !== 'string') {
    return [];
  }
  
  const errors = [];
  const lines = errorText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // TypeScript/ESLint pattern: file.ts(line,col): error message
    const tsMatch = line.match(/^(.+?)\((\d+),\d+\):\s*(error|warning)\s+(.+?):\s*(.+)$/);
    if (tsMatch) {
      errors.push({
        file: tsMatch[1],
        line: parseInt(tsMatch[2]),
        severity: tsMatch[3],
        code: tsMatch[4],
        message: tsMatch[5],
        type: detectErrorType(tsMatch[4], tsMatch[5])
      });
      continue;
    }

    // ESLint pattern: file.ts:line:col: message
    const eslintMatch = line.match(/^(.+?):(\d+):(\d+):\s*(error|warning)\s+(.+?)(?:\s+([a-z-]+))?$/);
    if (eslintMatch) {
      errors.push({
        file: eslintMatch[1],
        line: parseInt(eslintMatch[2]),
        severity: eslintMatch[4],
        message: eslintMatch[5],
        code: eslintMatch[6] || 'unknown',
        type: 'lint'
      });
      continue;
    }

    // Python pattern: File "file.py", line X
    const pythonMatch = line.match(/File "(.+?)", line (\d+)/);
    if (pythonMatch && i + 1 < lines.length) {
      const errorLine = lines[i + 1].trim();
      errors.push({
        file: pythonMatch[1],
        line: parseInt(pythonMatch[2]),
        severity: 'error',
        message: errorLine,
        type: detectErrorType('', errorLine)
      });
      i++; // Skip next line
      continue;
    }

    // Jest/Vitest test failure pattern
    const testMatch = line.match(/FAIL\s+(.+?)$/);
    if (testMatch) {
      errors.push({
        file: testMatch[1],
        line: 0,
        severity: 'error',
        message: 'Test suite failed',
        type: 'test'
      });
      continue;
    }

    // Generic error pattern
    if (line.includes('error') || line.includes('Error') || line.includes('ERROR')) {
      errors.push({
        file: 'unknown',
        line: 0,
        severity: 'error',
        message: line,
        type: 'runtime'
      });
    }
  }

  return errors;
}

/**
 * Detect error type from code and message
 */
function detectErrorType(code, message) {
  const lowerCode = code.toLowerCase();
  const lowerMessage = message.toLowerCase();

  if (lowerCode.includes('ts') || lowerMessage.includes('type')) return 'typecheck';
  if (lowerCode.includes('test') || lowerMessage.includes('test')) return 'test';
  if (lowerCode.includes('lint') || lowerCode.includes('eslint')) return 'lint';
  if (lowerMessage.includes('build') || lowerMessage.includes('compile')) return 'build';

  return 'runtime';
}

/**
 * Categorize errors by type
 */
function categorizeErrors(errors) {
  const categories = {
    lint: 0,
    typecheck: 0,
    test: 0,
    runtime: 0,
    build: 0
  };

  for (const error of errors) {
    const type = error.type || 'runtime';
    categories[type] = (categories[type] || 0) + 1;
  }

  return categories;
}

/**
 * Calculate overall severity
 */
function calculateSeverity(errorCount, priority) {
  if (errorCount === 0) return 'low';
  if (errorCount > 50 || priority === 'critical') return 'critical';
  if (errorCount > 20 || priority === 'high') return 'high';
  if (errorCount > 5) return 'medium';
  return 'low';
}

/**
 * Generate fixes for errors
 */
function generateFixes(errors, context) {
  const fixes = [];
  
  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];
    
    fixes.push({
      id: `fix-${i + 1}`,
      type: error.type,
      file: error.file,
      line: error.line || 0,
      message: error.message,
      fix: suggestFix(error, context),
      priority: getPriority(error)
    });
  }

  // Sort by priority (higher first)
  fixes.sort((a, b) => b.priority - a.priority);

  return fixes;
}

/**
 * Suggest a fix for an error
 */
function suggestFix(error, context) {
  const msg = error.message.toLowerCase();

  // Type errors
  if (error.type === 'typecheck') {
    if (msg.includes('cannot find name')) {
      return 'Import or declare the missing identifier';
    }
    if (msg.includes('not assignable to type')) {
      return 'Fix type mismatch or add type assertion';
    }
    if (msg.includes('missing properties')) {
      return 'Add missing required properties to object';
    }
    return 'Fix TypeScript type error';
  }

  // Lint errors
  if (error.type === 'lint') {
    if (msg.includes('unused')) {
      return 'Remove unused variable or add underscore prefix';
    }
    if (msg.includes('const')) {
      return 'Change let to const for non-reassigned variables';
    }
    if (msg.includes('semicolon')) {
      return 'Add or remove semicolons per style guide';
    }
    return 'Fix linting issue';
  }

  // Test errors
  if (error.type === 'test') {
    return 'Fix failing test or update test expectations';
  }

  // Build errors
  if (error.type === 'build') {
    return 'Fix compilation/build error';
  }

  return 'Investigate and fix error';
}

/**
 * Get priority score for error
 */
function getPriority(error) {
  let priority = 50; // Base priority

  // Critical severity
  if (error.severity === 'error') {
    priority += 30;
  } else if (error.severity === 'warning') {
    priority += 10;
  }

  // Type errors are high priority
  if (error.type === 'typecheck') {
    priority += 20;
  }

  // Build errors block everything
  if (error.type === 'build') {
    priority += 40;
  }

  // Test failures are important
  if (error.type === 'test') {
    priority += 15;
  }

  return priority;
}

/**
 * Create execution plan
 */
function createFixPlan(fixes, context) {
  const steps = [];
  const projectType = context.projectType || 'unknown';

  // Group fixes by type
  const byType = {};
  for (const fix of fixes) {
    if (!byType[fix.type]) byType[fix.type] = [];
    byType[fix.type].push(fix);
  }

  let stepNumber = 1;

  // Step 1: Fix build errors first (blocking)
  if (byType.build && byType.build.length > 0) {
    steps.push({
      step: stepNumber++,
      action: 'fix-build-errors',
      command: getBuildCommand(projectType),
      description: `Fix ${byType.build.length} build error(s) - these block everything else`
    });
  }

  // Step 2: Fix typecheck errors
  if (byType.typecheck && byType.typecheck.length > 0) {
    steps.push({
      step: stepNumber++,
      action: 'fix-type-errors',
      command: getTypeCheckCommand(projectType),
      description: `Fix ${byType.typecheck.length} type error(s)`
    });
  }

  // Step 3: Fix lint errors
  if (byType.lint && byType.lint.length > 0) {
    steps.push({
      step: stepNumber++,
      action: 'fix-lint-errors',
      command: getLintCommand(projectType),
      description: `Fix ${byType.lint.length} lint error(s) - some may auto-fix`
    });
  }

  // Step 4: Fix test failures
  if (byType.test && byType.test.length > 0) {
    steps.push({
      step: stepNumber++,
      action: 'fix-test-failures',
      command: getTestCommand(projectType),
      description: `Fix ${byType.test.length} test failure(s)`
    });
  }

  // Step 5: Fix runtime errors
  if (byType.runtime && byType.runtime.length > 0) {
    steps.push({
      step: stepNumber++,
      action: 'fix-runtime-errors',
      command: 'manual-investigation',
      description: `Investigate ${byType.runtime.length} runtime error(s)`
    });
  }

  // Step 6: Verify all fixed
  steps.push({
    step: stepNumber++,
    action: 'verify-fixes',
    command: 'tsk diagnose',
    description: 'Run full diagnostics to verify all errors are fixed'
  });

  // Estimate time
  const totalFixes = fixes.length;
  const estimatedMinutes = Math.ceil(totalFixes * 2); // ~2 min per fix
  const estimatedTime = estimatedMinutes > 60 
    ? `~${Math.ceil(estimatedMinutes / 60)} hour(s)` 
    : `~${estimatedMinutes} minutes`;

  return {
    steps,
    estimatedTime
  };
}

/**
 * Get build command for project type
 */
function getBuildCommand(projectType) {
  switch (projectType) {
    case 'typescript':
    case 'javascript':
      return 'npm run build || pnpm build';
    case 'python':
      return 'python -m build';
    case 'java':
      return 'mvn compile';
    case 'go':
      return 'go build';
    default:
      return 'check build configuration';
  }
}

/**
 * Get typecheck command for project type
 */
function getTypeCheckCommand(projectType) {
  switch (projectType) {
    case 'typescript':
      return 'tsc --noEmit';
    case 'python':
      return 'mypy .';
    case 'java':
      return 'javac -Xdiags:verbose';
    default:
      return 'check types';
  }
}

/**
 * Get lint command for project type
 */
function getLintCommand(projectType) {
  switch (projectType) {
    case 'typescript':
    case 'javascript':
      return 'eslint . --fix';
    case 'python':
      return 'flake8 . || pylint .';
    case 'java':
      return 'mvn checkstyle:check';
    case 'go':
      return 'golangci-lint run';
    default:
      return 'run linter';
  }
}

/**
 * Get test command for project type
 */
function getTestCommand(projectType) {
  switch (projectType) {
    case 'typescript':
    case 'javascript':
      return 'npm test || pnpm test';
    case 'python':
      return 'pytest';
    case 'java':
      return 'mvn test';
    case 'go':
      return 'go test ./...';
    default:
      return 'run tests';
  }
}

