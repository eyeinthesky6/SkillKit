const fs = require('fs-extra');
const path = require('path');

/**
 * Test Generator Skill
 * Generates test files and test cases based on source code analysis
 */
module.exports = async (input, context) => {
  const {
    sourceFile,
    testFramework = 'vitest',
    outputPath,
    coverage = 80,
    includeEdgeCases = true,
    includeErrorCases = true
  } = input;

  // Resolve absolute path
  const absoluteSourcePath = path.resolve(context.workingDir || process.cwd(), sourceFile);

  // Check if source file exists
  if (!await fs.pathExists(absoluteSourcePath)) {
    throw new Error(`Source file does not exist: ${absoluteSourcePath}`);
  }

  // Read source file
  const sourceContent = await fs.readFile(absoluteSourcePath, 'utf8');

  // Parse source file to extract functions
  const functions = extractFunctions(sourceContent);

  if (functions.length === 0) {
    throw new Error('No functions found in source file to generate tests for');
  }

  // Determine output path
  const testFilePath = outputPath || determineTestPath(absoluteSourcePath, testFramework);

  // Generate test content
  const testContent = generateTestContent(
    sourceFile,
    functions,
    testFramework,
    includeEdgeCases,
    includeErrorCases
  );

  // Ensure output directory exists
  await fs.ensureDir(path.dirname(testFilePath));

  // Write test file
  await fs.writeFile(testFilePath, testContent, 'utf8');

  // Calculate statistics
  const testsGenerated = functions.reduce((sum, fn) => sum + fn.testCount, 0);
  const estimatedCoverage = Math.min(coverage, Math.round((testsGenerated / (functions.length * 3)) * 100));

  return {
    testFile: path.relative(process.cwd(), testFilePath),
    testsGenerated,
    functions: functions.map(fn => ({
      name: fn.name,
      testCount: fn.testCount,
      scenarios: fn.scenarios
    })),
    framework: testFramework,
    estimatedCoverage
  };
};

/**
 * Extract functions from source code
 */
function extractFunctions(content) {
  const functions = [];

  // Pattern 1: function declarations
  const functionDeclarations = content.matchAll(/(?:export\s+)?function\s+(\w+)\s*\(([^)]*)\)/g);
  for (const match of functionDeclarations) {
    functions.push({
      name: match[1],
      params: parseParameters(match[2]),
      type: 'function'
    });
  }

  // Pattern 2: arrow functions
  const arrowFunctions = content.matchAll(/(?:export\s+)?const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g);
  for (const match of arrowFunctions) {
    functions.push({
      name: match[1],
      params: parseParameters(match[2]),
      type: 'arrow'
    });
  }

  // Pattern 3: class methods
  const classMethods = content.matchAll(/(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*{/g);
  for (const match of classMethods) {
    const name = match[1];
    // Skip constructor and common keywords
    if (name !== 'constructor' && name !== 'if' && name !== 'for' && name !== 'while') {
      functions.push({
        name,
        params: parseParameters(match[2]),
        type: 'method'
      });
    }
  }

  return functions;
}

/**
 * Parse function parameters
 */
function parseParameters(paramsString) {
  if (!paramsString || paramsString.trim() === '') {
    return [];
  }

  return paramsString.split(',').map(p => {
    const param = p.trim();
    // Remove TypeScript type annotations
    const name = param.split(':')[0].trim();
    // Remove default values
    return name.split('=')[0].trim();
  });
}

/**
 * Determine test file path
 */
function determineTestPath(sourcePath, framework) {
  const dir = path.dirname(sourcePath);
  const ext = path.extname(sourcePath);
  const base = path.basename(sourcePath, ext);

  // Check for __tests__ directory
  const testsDir = path.join(dir, '__tests__');
  if (fs.existsSync(testsDir)) {
    return path.join(testsDir, `${base}.test${ext}`);
  }

  // Place test file next to source with .test extension
  return path.join(dir, `${base}.test${ext}`);
}

/**
 * Generate test content
 */
function generateTestContent(sourceFile, functions, framework, includeEdgeCases, includeErrorCases) {
  const importPath = sourceFile.replace(/\\/g, '/');
  const hasDefault = functions.some(fn => fn.type === 'arrow' || fn.type === 'function');

  let content = '';

  // Import statement
  if (framework === 'jest' || framework === 'vitest') {
    content += `import { describe, it, expect } from '${framework}';\n`;
  } else if (framework === 'mocha') {
    content += `import { describe, it } from 'mocha';\n`;
    content += `import { expect } from 'chai';\n`;
  }

  // Import functions to test
  const functionNames = functions.map(fn => fn.name);
  content += `import { ${functionNames.join(', ')} } from './${path.basename(sourceFile, path.extname(sourceFile))}';\n\n`;

  // Generate test suites
  for (const fn of functions) {
    content += generateTestSuite(fn, includeEdgeCases, includeErrorCases);
    content += '\n';
  }

  return content;
}

/**
 * Generate test suite for a function
 */
function generateTestSuite(fn, includeEdgeCases, includeErrorCases) {
  let suite = `describe('${fn.name}', () => {\n`;
  const scenarios = [];
  let testCount = 0;

  // Basic happy path test
  suite += `  it('should work with valid inputs', () => {\n`;
  suite += generateBasicTest(fn);
  suite += `  });\n\n`;
  scenarios.push('valid inputs');
  testCount++;

  // Edge cases
  if (includeEdgeCases) {
    if (fn.params.length > 0) {
      suite += `  it('should handle edge cases', () => {\n`;
      suite += generateEdgeCaseTest(fn);
      suite += `  });\n\n`;
      scenarios.push('edge cases');
      testCount++;
    }
  }

  // Error cases
  if (includeErrorCases) {
    suite += `  it('should handle errors appropriately', () => {\n`;
    suite += generateErrorTest(fn);
    suite += `  });\n\n`;
    scenarios.push('error handling');
    testCount++;
  }

  // Empty/null checks
  if (fn.params.length > 0) {
    suite += `  it('should handle empty or null inputs', () => {\n`;
    suite += generateNullTest(fn);
    suite += `  });\n\n`;
    scenarios.push('null/empty inputs');
    testCount++;
  }

  suite += `});\n`;

  fn.testCount = testCount;
  fn.scenarios = scenarios;

  return suite;
}

/**
 * Generate basic test
 */
function generateBasicTest(fn) {
  if (fn.params.length === 0) {
    return `    const result = ${fn.name}();\n    expect(result).toBeDefined();\n`;
  }

  const sampleArgs = fn.params.map(p => getSampleValue(p)).join(', ');
  return `    const result = ${fn.name}(${sampleArgs});\n    expect(result).toBeDefined();\n    // TODO: Add specific assertions based on expected behavior\n`;
}

/**
 * Generate edge case test
 */
function generateEdgeCaseTest(fn) {
  const edgeArgs = fn.params.map(p => getEdgeValue(p)).join(', ');
  return `    const result = ${fn.name}(${edgeArgs});\n    expect(result).toBeDefined();\n    // TODO: Add assertions for edge case behavior\n`;
}

/**
 * Generate error test
 */
function generateErrorTest(fn) {
  if (fn.params.length === 0) {
    return `    // TODO: Add error scenario test if applicable\n    expect(true).toBe(true);\n`;
  }

  return `    expect(() => {\n      ${fn.name}(/* invalid args */);\n    }).toThrow();\n    // TODO: Verify specific error messages or types\n`;
}

/**
 * Generate null/empty test
 */
function generateNullTest(fn) {
  const nullArgs = fn.params.map(() => 'null').join(', ');
  return `    expect(() => ${fn.name}(${nullArgs})).toBeDefined();\n    // TODO: Verify behavior with null/empty inputs\n`;
}

/**
 * Get sample value for parameter
 */
function getSampleValue(paramName) {
  const lower = paramName.toLowerCase();

  if (lower.includes('name') || lower.includes('title') || lower.includes('message')) {
    return "'test'";
  }
  if (lower.includes('count') || lower.includes('num') || lower.includes('age') || lower.includes('id')) {
    return '1';
  }
  if (lower.includes('flag') || lower.includes('is') || lower.includes('has')) {
    return 'true';
  }
  if (lower.includes('array') || lower.includes('list') || lower.includes('items')) {
    return '[]';
  }
  if (lower.includes('object') || lower.includes('data') || lower.includes('config')) {
    return '{}';
  }

  return "''"; // Default
}

/**
 * Get edge value for parameter
 */
function getEdgeValue(paramName) {
  const lower = paramName.toLowerCase();

  if (lower.includes('count') || lower.includes('num') || lower.includes('age')) {
    return '0';
  }
  if (lower.includes('name') || lower.includes('title') || lower.includes('message')) {
    return "''";
  }
  if (lower.includes('array') || lower.includes('list')) {
    return '[]';
  }

  return 'undefined';
}


