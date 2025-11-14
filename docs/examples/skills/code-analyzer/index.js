const fs = require('fs-extra');
const path = require('path');

/**
 * Code Analyzer Skill
 * Analyzes code complexity, patterns, and quality metrics
 */
module.exports = async (input, context) => {
  const {
    path: targetPath,
    extensions = ['.js', '.ts', '.jsx', '.tsx'],
    excludePatterns = ['node_modules', 'dist', 'build', 'coverage'],
    includeTests = false
  } = input;

  // Resolve absolute path
  const absolutePath = path.resolve(context.workingDir || process.cwd(), targetPath);

  // Check if path exists
  if (!await fs.pathExists(absolutePath)) {
    throw new Error(`Path does not exist: ${absolutePath}`);
  }

  // Collect files to analyze
  const filesToAnalyze = await collectFiles(absolutePath, extensions, excludePatterns, includeTests);

  if (filesToAnalyze.length === 0) {
    return {
      summary: {
        totalFiles: 0,
        totalLines: 0,
        totalComments: 0,
        avgComplexity: 0,
        issuesFound: 0
      },
      files: [],
      recommendations: ['No files found to analyze']
    };
  }

  // Analyze each file
  const fileResults = [];
  let totalLines = 0;
  let totalComments = 0;
  let totalComplexity = 0;
  let totalIssues = 0;

  for (const filePath of filesToAnalyze) {
    const result = await analyzeFile(filePath);
    fileResults.push(result);
    
    totalLines += result.lines;
    totalComments += result.comments;
    totalComplexity += result.complexity;
    totalIssues += result.issues.length;
  }

  const avgComplexity = fileResults.length > 0 
    ? Math.round((totalComplexity / fileResults.length) * 10) / 10 
    : 0;

  // Generate recommendations
  const recommendations = generateRecommendations(fileResults, avgComplexity);

  return {
    summary: {
      totalFiles: fileResults.length,
      totalLines,
      totalComments,
      avgComplexity,
      issuesFound: totalIssues
    },
    files: fileResults,
    recommendations
  };
};

/**
 * Collect files recursively
 */
async function collectFiles(targetPath, extensions, excludePatterns, includeTests) {
  const files = [];
  
  const stats = await fs.stat(targetPath);
  
  if (stats.isFile()) {
    if (shouldIncludeFile(targetPath, extensions, excludePatterns, includeTests)) {
      files.push(targetPath);
    }
    return files;
  }

  // Recursively scan directory
  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(targetPath, entry.name);
    
    // Skip excluded patterns
    if (excludePatterns.some(pattern => fullPath.includes(pattern))) {
      continue;
    }
    
    if (entry.isDirectory()) {
      const subFiles = await collectFiles(fullPath, extensions, excludePatterns, includeTests);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      if (shouldIncludeFile(fullPath, extensions, excludePatterns, includeTests)) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Check if file should be included
 */
function shouldIncludeFile(filePath, extensions, excludePatterns, includeTests) {
  const ext = path.extname(filePath);
  if (!extensions.includes(ext)) {
    return false;
  }
  
  if (!includeTests) {
    const fileName = path.basename(filePath);
    if (fileName.includes('.test.') || fileName.includes('.spec.') || filePath.includes('__tests__')) {
      return false;
    }
  }
  
  return true;
}

/**
 * Analyze a single file
 */
async function analyzeFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Count lines, comments, blank lines
  let commentLines = 0;
  let blankLines = 0;
  let codeLines = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '') {
      blankLines++;
    } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      commentLines++;
    } else {
      codeLines++;
    }
  }
  
  // Calculate complexity (simplified cyclomatic complexity)
  const complexity = calculateComplexity(content);
  
  // Count functions
  const functionCount = countFunctions(content);
  
  // Detect issues
  const issues = detectIssues(content, filePath, complexity, codeLines);
  
  return {
    path: path.relative(process.cwd(), filePath),
    lines: codeLines,
    comments: commentLines,
    blank: blankLines,
    complexity,
    functions: functionCount,
    issues
  };
}

/**
 * Calculate cyclomatic complexity (simplified)
 */
function calculateComplexity(content) {
  let complexity = 1; // Base complexity
  
  // Count decision points
  const decisionKeywords = [
    /\bif\s*\(/g,
    /\belse\s+if\s*\(/g,
    /\bfor\s*\(/g,
    /\bwhile\s*\(/g,
    /\bcase\s+/g,
    /\bcatch\s*\(/g,
    /&&/g,
    /\|\|/g,
    /\?/g // ternary
  ];
  
  for (const keyword of decisionKeywords) {
    const matches = content.match(keyword);
    if (matches) {
      complexity += matches.length;
    }
  }
  
  return complexity;
}

/**
 * Count functions
 */
function countFunctions(content) {
  const functionPatterns = [
    /function\s+\w+\s*\(/g,
    /const\s+\w+\s*=\s*\(/g,
    /\w+\s*:\s*function\s*\(/g,
    /\w+\s*\([^)]*\)\s*=>/g
  ];
  
  let count = 0;
  for (const pattern of functionPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      count += matches.length;
    }
  }
  
  return count;
}

/**
 * Detect code issues
 */
function detectIssues(content, filePath, complexity, codeLines) {
  const issues = [];
  
  // High complexity
  if (complexity > 20) {
    issues.push({
      type: 'complexity',
      severity: 'high',
      message: `High cyclomatic complexity (${complexity}). Consider refactoring.`,
      line: 0
    });
  } else if (complexity > 10) {
    issues.push({
      type: 'complexity',
      severity: 'medium',
      message: `Moderate complexity (${complexity}). May need simplification.`,
      line: 0
    });
  }
  
  // Large file
  if (codeLines > 500) {
    issues.push({
      type: 'structure',
      severity: 'medium',
      message: `Large file (${codeLines} lines). Consider splitting into smaller modules.`,
      line: 0
    });
  }
  
  // No comments
  const hasComments = content.includes('//') || content.includes('/*');
  if (codeLines > 50 && !hasComments) {
    issues.push({
      type: 'best-practice',
      severity: 'low',
      message: 'File has no comments. Consider adding documentation.',
      line: 0
    });
  }
  
  // console.log detected
  const consoleLogCount = (content.match(/console\.log\(/g) || []).length;
  if (consoleLogCount > 0) {
    issues.push({
      type: 'best-practice',
      severity: 'low',
      message: `Found ${consoleLogCount} console.log statements. Remove before production.`,
      line: 0
    });
  }
  
  // TODO/FIXME comments
  const todoCount = (content.match(/\/\/\s*(TODO|FIXME)/gi) || []).length;
  if (todoCount > 0) {
    issues.push({
      type: 'best-practice',
      severity: 'low',
      message: `Found ${todoCount} TODO/FIXME comments.`,
      line: 0
    });
  }
  
  return issues;
}

/**
 * Generate recommendations
 */
function generateRecommendations(fileResults, avgComplexity) {
  const recommendations = [];
  
  // Complexity recommendations
  if (avgComplexity > 15) {
    recommendations.push('HIGH: Reduce cyclomatic complexity by breaking down complex functions');
  } else if (avgComplexity > 10) {
    recommendations.push('MEDIUM: Consider refactoring some complex functions');
  } else {
    recommendations.push('GOOD: Complexity is within acceptable range');
  }
  
  // File size recommendations
  const largeFiles = fileResults.filter(f => f.lines > 500);
  if (largeFiles.length > 0) {
    recommendations.push(`Consider splitting ${largeFiles.length} large files into smaller modules`);
  }
  
  // Comments recommendations
  const uncommentedFiles = fileResults.filter(f => f.comments === 0 && f.lines > 50);
  if (uncommentedFiles.length > 0) {
    recommendations.push(`Add comments/documentation to ${uncommentedFiles.length} files`);
  }
  
  // Issue summary
  const totalIssues = fileResults.reduce((sum, f) => sum + f.issues.length, 0);
  const highSeverity = fileResults.flatMap(f => f.issues).filter(i => i.severity === 'high').length;
  
  if (highSeverity > 0) {
    recommendations.push(`PRIORITY: Address ${highSeverity} high-severity issues`);
  }
  
  if (totalIssues === 0) {
    recommendations.push('EXCELLENT: No major issues detected!');
  }
  
  return recommendations;
}


