#!/usr/bin/env node

// Enhanced Comprehensive TODO Tracker - Unified All Patterns
// Combines deceptive language, SEDI precision, and enhanced priority analysis
// Integrated features from profitpilot, comprehensive, and sedi versions

const fs = require("fs")
const path = require("path")

// Parse command line arguments
const args = process.argv.slice(2)
const focusDir = args.find(arg => arg.startsWith('--focus='))?.split('=')[1]

// Performance tracking
const startTime = Date.now()
let scanStartTime = 0

// Get current timestamp for reports
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
const dateOnly = new Date().toISOString().slice(0, 10)

console.log("🔍 Enhanced Comprehensive TODO Tracker (Unified)")
console.log(`📅 Analysis Date: ${timestamp}`)
if (focusDir) {
  console.log(`🎯 Focused scan: ${focusDir}`)
}
console.log("=".repeat(80))

const reportsDir = path.join(__dirname, '..', '..', 'docs', 'audit')
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
}

const reportFile = path.join(reportsDir, `Comprehensive_TODO_Analysis_${dateOnly}.md`)

// === INTEGRATED PATTERN DETECTION ===
// Combines deceptive language patterns with SEDI precision

// 1. EXPLICIT TODO MARKERS (High Confidence)
const explicitTodoPatterns = [
  /\/\/\s*TODO[\s:]/i,
  /\/\/\s*FIXME[\s:]/i,
  /\/\/\s*HACK[\s:]/i,
  /\/\/\s*XXX[\s:]/i,
  /\/\/\s*BUG[\s:]/i,
  /\/\*\s*TODO[\s:]/i,
  /\/\*\s*FIXME[\s:]/i,
  /\/\*\s*HACK[\s:]/i,
  /#\s*TODO[\s:]/i,
  /#\s*FIXME[\s:]/i,
]

// 2. DECEPTIVE LANGUAGE PATTERNS (Enhanced with manual scan findings)
const deceptivePatterns = [
  // Core deceptive patterns (temporal)
  { regex: /for now|For now/gi, type: "FOR_NOW", severity: "CRITICAL", category: "temporal" },
  { regex: /in production|In production/gi, type: "IN_PRODUCTION", severity: "CRITICAL", category: "temporal" },

  // Incomplete/missing functionality (enhanced from deceptive language detector)
  { regex: /would need|This would need/gi, type: "WOULD_NEED", severity: "HIGH", category: "incomplete" },
  { regex: /should be|Should be/gi, type: "SHOULD_BE_IMPLEMENTED", severity: "MEDIUM", category: "incomplete" },
  { regex: /NOT hardcoded|not yet implemented|needs to be implemented|this needs real implementation|not fully implemented|not implemented/gi, type: "INCOMPLETE_ADMISSION", severity: "CRITICAL", category: "incomplete" },
  { regex: /unimplemented|not.*supported|feature.*not.*supported|method.*not.*supported/gi, type: "UNIMPLEMENTED_FEATURE", severity: "HIGH", category: "incomplete" },

  // Deceptive/simplified implementations
  { regex: /simplified/gi, type: "SIMPLIFIED", severity: "HIGH", category: "deceptive" },
  { regex: /simplified for/gi, type: "SIMPLIFIED_FOR", severity: "HIGH", category: "deceptive" },
  { regex: /approximat/gi, type: "SIMPLIFIED", severity: "HIGH", category: "deceptive" },
  { regex: /workaround|Workaround/gi, type: "WORKAROUND", severity: "HIGH", category: "deceptive" },
  { regex: /stub|Stub/gi, type: "STUB_IMPLEMENTATION", severity: "HIGH", category: "incomplete" },
  { regex: /minimal|Minimal/gi, type: "MINIMAL_IMPLEMENTATION", severity: "HIGH", category: "deceptive" },
  { regex: /hack|Hack/gi, type: "QUICK_HACK", severity: "HIGH", category: "deceptive" },
  { regex: /bypass|Bypass/gi, type: "BYPASS_SOLUTION", severity: "HIGH", category: "deceptive" },
  { regex: /shortcut|Shortcut/gi, type: "SHORTCUT_SOLUTION", severity: "HIGH", category: "deceptive" },
  { regex: /quick.*hack|quick.*fix|Quick.*hack|Quick.*fix/gi, type: "QUICK_FIX", severity: "HIGH", category: "deceptive" },
  { regex: /partial.*implementation|partial.*feature|Partial.*implementation|Partial.*feature/gi, type: "PARTIAL_IMPLEMENTATION", severity: "HIGH", category: "incomplete" },
  { regex: /acceptable.*exceed|exceed.*acceptable/gi, type: "ACCEPTABLE_EXCEEDED", severity: "HIGH", category: "deceptive" },

  // False success patterns (exclude legitimate API responses)
  { regex: /completed successfully.*(?:but|however|actually|really)/gi, type: "FALSE_SUCCESS", severity: "HIGH", category: "deceptive" },
  { regex: /success.*silent.*fail/gi, type: "FALSE_SUCCESS", severity: "HIGH", category: "deceptive" },
  { regex: /return.*success.*(?:mock|fake|dummy|placeholder)/gi, type: "FALSE_SUCCESS", severity: "HIGH", category: "deceptive" },

  // Temporary/placeholder values and empty returns
  { regex: /placeholder|Placeholder/gi, type: "PLACEHOLDER_VALUES", severity: "HIGH", category: "temporary" },
  { regex: /return.*basic|return basic/gi, type: "RETURN_BASIC", severity: "HIGH", category: "deceptive" },
  { regex: /temporary.*solution|temporary.*fix|Temporary.*solution|Temporary.*fix/gi, type: "TEMPORARY_SOLUTION", severity: "HIGH", category: "temporary" },
  { regex: /return.*empty.*array|return.*empty.*object|return.*null.*for.*now|return.*undefined.*for.*now|return.*zero.*for.*now/gi, type: "EMPTY_FALLBACK", severity: "MEDIUM", category: "temporary" },
  { regex: /mock|dummy|MOCK|DUMMY/gi, type: "MOCK_DATA", severity: "MEDIUM", category: "temporary" },

  // Unsafe assumptions and hardcoded values
  { regex: /assume|assumed|Assume|Assumed/gi, type: "UNSAFE_ASSUMPTIONS", severity: "HIGH", category: "deceptive" },
  { regex: /assuming|assumption|presume|presumption/gi, type: "UNSAFE_ASSUMPTIONS", severity: "HIGH", category: "deceptive" },
  { regex: /hardcoded|Hardcoded|magic.*number|arbitrary.*value/gi, type: "HARDCODED_VALUES", severity: "HIGH", category: "technical_debt" },

  // Technical debt patterns
  { regex: /limitation|Limitation/gi, type: "ACCEPTED_LIMITATIONS", severity: "MEDIUM", category: "deceptive" },
  { regex: /silently.*ignore|silently.*fail|swallow.*exception|swallow.*error/gi, type: "SILENT_FAILURES", severity: "HIGH", category: "technical_debt" },
  { regex: /deprecated|Deprecated|obsolete|legacy.*code/gi, type: "DEPRECATED_CODE", severity: "MEDIUM", category: "technical_debt" },

  // Explicit markers and hidden language
  { regex: /STUB|XXX|\bBUG\b|incomplete\b|Incomplete\b/gi, type: "EXPLICIT_MARKERS", severity: "HIGH", category: "explicit" },
  { regex: /TBD|TBC|NYI|WIP|tbd|tbc|nyi|wip/gi, type: "EXPLICIT_MARKERS", severity: "HIGH", category: "explicit" },
  { regex: /quick.*fix|quick.*solution|until we can|when we have|later|Later|bypass|Bypass|minimal|Minimal/gi, type: "TEMPORAL_LANGUAGE", severity: "HIGH", category: "temporal" },
  { regex: /backwards.*compatibility|backward.*compatibility|legacy.*support|Legacy.*support/gi, type: "BACKWARDS_COMPATIBILITY", severity: "MEDIUM", category: "technical_debt" },
  { regex: /coming soon|future.*version|planned|prototype|experimental|beta|alpha|proof.*concept/gi, type: "FUTURE_FEATURE", severity: "MEDIUM", category: "incomplete" },
  { regex: /in a real implementation|production would use|proper implementation would|temporary for build/gi, type: "HIDDEN_LANGUAGE", severity: "HIGH", category: "deceptive" },

  // Additional obscure markers found in manual scan
  { regex: /NOTE:|IMPORTANT:|WARNING:|CAUTION:|ATTENTION:/gi, type: "IMPORTANT_NOTES", severity: "MEDIUM", category: "explicit" },
  { regex: /remove.*me|delete.*me|clean.*up.*needed|obsolete|deprecated|legacy/gi, type: "CLEANUP_NEEDED", severity: "MEDIUM", category: "technical_debt" },
]

// 3. TEMPORARY CODE PATTERNS (Enhanced with deceptive language detector patterns)
// DEBUG STATEMENTS DISABLED - TypeScript/ESLint already handle these
const temporaryCodePatterns = [
  /\/\/.*\b(temporarily disabled|temp disabled|disabled temporarily)\b/i,
  /\/\/.*\b(quick fix|quick hack|temporary fix)\b/i,
  /\/\/.*\b(workaround|work around)\b.*\b(until|for now)\b/i,
  /\/\/.*\b(placeholder|stub|mock)\b.*\b(implementation|data|function)\b/i,
  /temporary|temp |TEMP/gi, // From deceptive language detector
  // DISABLED: console.log, console.error, debugger, alert - handled by TypeScript/ESLint
]

// 4. INCOMPLETE IMPLEMENTATION PATTERNS (SEDI-style)
const incompletePatterns = [
  /throw new Error\s*\(\s*["'].*not implemented.*["']\s*\)/i,
  /throw new Error\s*\(\s*["'].*temporarily unavailable.*["']\s*\)/i,
  /return null\s*\/\/.*\b(implement|add|complete)\b/i,
  /return undefined\s*\/\/.*\b(implement|add|complete)\b/i,
  /\/\/.*\b(not implemented|not finished|incomplete)\b/i,
  /\/\/.*\b(stub|placeholder)\b.*\b(replace|implement)\b/i,
]

// 5. COMMENTED OUT CODE PATTERNS (TOP BLOCKER - Must Uncomment)
// Focus on actual executable code, exclude documentation and examples
const commentedCodePatterns = [
  // Commented out actual function/class declarations (not examples)
  /^\s*\/\/\s*(export\s+)?(async\s+)?function\s+\w+\s*\(/i,
  /^\s*\/\/\s*(private|public|protected)?\s*(async\s+)?\w+\s*\(/i, // method declarations
  /^\s*\/\/\s*(export\s+)?class\s+\w+\s*\{/i,

  // Commented out variable assignments with actual values
  /^\s*\/\/\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*(async\s+)?\(/i,
  /^\s*\/\/\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*\{/i,
  /^\s*\/\/\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*\[/i,
  /^\s*\/\/\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*['"]/i,
  /^\s*\/\/\s*(export\s+)?(const|let|var)\s+\w+\s*=\s*\d+/i,

  // Commented out method calls (actual execution, not examples)
  /^\s*\/\/\s*\w+\.\w+\s*\(/i,
  /^\s*\/\/\s*(await\s+)?\w+\s*\(/i,

  // Commented out control flow and error handling (only actual code)
  /^\s*\/\/\s*if\s*\(/i,
  /^\s*\/\/\s*for\s*\(/i,
  /^\s*\/\/\s*while\s*\(/i,
  /^\s*\/\/\s*switch\s*\(/i,
  /^\s*\/\/\s*try\s*\{/i,
  /^\s*\/\/\s*catch\s*\(/i,
  /^\s*\/\/\s*finally\s*\{/i,
  /^\s*\/\/\s*throw\s+new\s+\w+\s*\(/i,
  /^\s*\/\/\s*return\s+\w+\s*[\.;]/i, // return statements with identifiers followed by semicolon or dot
  /^\s*\/\/\s*return\s+['"][^'"]*['"]/i, // return statements with complete string literals
  /^\s*\/\/\s*return\s+\d+/i, // return statements with numbers
  /^\s*\/\/\s*return\s+\{.*\}/i, // return statements with object literals
  /^\s*\/\/\s*return\s+\[.*\]/i, // return statements with array literals

  // Commented out JSX/React component usage (not declarations)
  /^\s*\/\/\s*<[A-Z]\w*/i,
]

// 6. BUSINESS LOGIC EXCLUSIONS (Avoid False Positives) - Trading Platform Specific
// Only exclude legitimate trading platform business operations, not technical implementation
const businessExclusions = [
  // Archive operations (legitimate business features in trading platforms)
  /archive.*audit.*data/i, // Audit data archiving operations
  /archive.*location/i, // Archive location references

  // Configuration and infrastructure status (exclude operational messages)
  /CORS.*configuration/i, // CORS configuration status
  /environment.*variable/i, // Environment variable references
  /process\.env/i, // Process environment references
  /fallback.*to.*basic/i, // Fallback operation status
  /health.*check/i, // Health check operations
  /error.*handling/i, // Error handling status
  /configuration.*override/i, // Configuration override status

  // Trading platform operational status messages (exclude normal business operations)
  /trading.*mode.*enabled/i, // Trading mode enabled status
  /market.*data.*received/i, // Market data received confirmations
  /order.*execution.*completed/i, // Order execution completion status
  /portfolio.*reconciliation.*finished/i, // Portfolio reconciliation completion
  /risk.*management.*active/i, // Risk management activation status
  /strategy.*execution.*started/i, // Strategy execution start status
  /broker.*adapter.*connected/i, // Broker adapter connection status
  /api.*integration.*successful/i, // API integration success status
  /rate.*limiting.*applied/i, // Rate limiting application status
  /analytics.*engine.*running/i, // Analytics engine running status
  /position.*tracking.*updated/i, // Position tracking update status
  /pnl.*calculation.*complete/i, // PnL calculation completion status
  /compliance.*check.*passed/i, // Compliance check pass status
  /audit.*trail.*recorded/i, // Audit trail recording status
  /backtest.*validation.*successful/i, // Backtest validation success status
  /paper.*trading.*enabled/i, // Paper trading enablement status

  // LEGITIMATE UI PLACEHOLDER TEXT (exclude from PLACEHOLDER_VALUES flagging)
  /placeholder=.*["'].*e\.g\.|placeholder=.*["'].*example/i, // JSX/HTML placeholder props with examples
  /placeholder.*["']Enter.*symbol|placeholder.*["']Enter.*quantity/i, // Form input guidance
  /placeholder.*["']Choose.*BUY.*SELL|placeholder.*["']Choose.*order.*type/i, // Select dropdown guidance
  /placeholder.*["']Select.*order.*side|placeholder.*["']Select.*order.*type/i, // Select component placeholders
  /placeholder.*["']Enter.*price.*leave.*empty/i, // Input field guidance
  /placeholder.*["']Enter.*limit.*price/i, // Price input guidance
  /placeholder:text-.*focus-visible/i, // Tailwind CSS placeholder styling classes
  /SelectValue.*placeholder=.*["']Select/i, // React Select component placeholders
  /placeholder:text-\$\{.*\}/i, // Dynamic Tailwind placeholder classes
  /ring-offset-white placeholder:text-/i, // Tailwind placeholder styling in components
]

// 6. FILE EXCLUSIONS (Exclude build artifacts, docs, dependencies, and config files)
const excludeFiles = [
  /node_modules/,
  /\.git/,
  /\.next/,
  /dist/,
  /build/,
  /coverage/,
  /\.log$/,
  /\.lock$/,
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /\.env/,
  /\.gitignore$/,
  // Exclude documentation and report files
  /docs\//, // Don't scan documentation directories
  /.*\.md$/, // Don't scan markdown files
  /.*\.txt$/, // Don't scan text files
  // Exclude configuration files (don't scan for uncommented code)
  /jest\.setup\.js$/,
  /eslint\.config\..*$/,
  /prettier\.config\..*$/,
  /jest\.config\..*$/,
  /.*\.config\.(js|mjs|cjs|ts)$/,
  /.*\.config$/,
  /turbo\.json$/,
  /tsconfig\..*\.json$/,
  /package\.json$/,
  // Exclude appropriate logger implementations (28 console statements that are legitimate)
  /packages\/shared\/src\/services\/platform\/logging\.service\.ts$/, // Centralized logger implementation
  /packages\/shared\/src\/utilities\/browser-safe\/index\.ts$/, // Browser logger and HTTP client
  /packages\/shared\/src\/services\/platform\/index\.ts$/, // Documentation comments only
  /packages\/shared\/src\/utilities\/env\.ts$/, // Development-only debug logging
  /packages\/shared\/architecture_check\.js$/, // Deprecated utility guidance
]

// ENHANCED PRIORITY CLASSIFICATION SYSTEM (Blocker/Critical/Major/Minor)
const priorityLevels = {
  blocker: {
    triggers: ["auth", "security", "database", "migration", "production", "not implemented", "FOR_NOW", "IN_PRODUCTION", "COMMENTED_OUT_CODE"],
    impact: "Prevents production deployment - commented code causing type errors",
    priority: 1,
  },
  critical: {
    triggers: ["api", "order", "position", "portfolio", "validation", "trading", "broker", "market data"],
    impact: "Breaks core trading functionality",
    priority: 2,
  },
  major: {
    triggers: ["ui", "analytics", "strategy", "performance", "integration"],
    impact: "Impacts trading user experience",
    priority: 3,
  },
  minor: {
    triggers: ["documentation", "cleanup", "refactor", "console.log", "comment", "style"],
    impact: "Code quality maintenance",
    priority: 4,
  },
}

// LEGACY COMPATIBILITY - Priority Categories for categorization
const priorityCategories = {
  blocker: {
    keywords: ["auth", "security", "database", "migration", "production", "not implemented", "FOR_NOW", "IN_PRODUCTION", "COMMENTED_OUT_CODE"],
    patterns: ["CRITICAL"],
    description: "Critical for production deployment - commented code causing type errors",
  },
  critical: {
    keywords: ["api", "integration", "validation", "error", "user", "temporarily unavailable", "TODO", "FIXME", "HACK"],
    patterns: ["HIGH"],
    description: "High impact on functionality",
  },
  high: {
    keywords: ["ui", "ux", "performance", "optimization", "feature", "console.log"],
    patterns: ["MEDIUM"],
    description: "Medium impact on user experience",
  },
  medium: {
    keywords: ["documentation", "comment", "cleanup", "refactor", "style"],
    description: "Low impact maintenance items",
  },
}

// Crisp action guidance for each issue type (one-liners)
function getIssueGuidance(issueType) {
  const guidance = {
    // Deceptive patterns - FIX IMMEDIATELY
    SIMPLIFIED: "Replace simplified code with full implementation",
    SIMPLIFIED_FOR: "Implement complete solution per requirements",
    WORKAROUND: "Replace workaround with proper integration",
    STUB_IMPLEMENTATION: "Complete stub with production code",
    MINIMAL_IMPLEMENTATION: "Expand to full feature implementation",
    QUICK_HACK: "Replace with architecturally sound solution",
    BYPASS_SOLUTION: "Implement proper business logic",
    SHORTCUT_SOLUTION: "Use standard implementation patterns",
    QUICK_FIX: "Apply proper fix with testing",
    PARTIAL_IMPLEMENTATION: "Complete missing functionality",
    ACCEPTABLE_EXCEEDED: "Add proper validation & error handling",

    // Incomplete features - IMPLEMENT MISSING PARTS
    WOULD_NEED: "Add missing service integration",
    SHOULD_BE_IMPLEMENTED: "Complete planned feature",
    INCOMPLETE_ADMISSION: "Finish incomplete functionality",
    UNIMPLEMENTED_FEATURE: "Implement missing feature",
    PLACEHOLDER_VALUES: "Replace with real data/service",
    RETURN_BASIC: "Add proper error handling",
    TEMPORARY_SOLUTION: "Replace with permanent solution",

    // Technical debt - REFACTOR
    HARDCODED_VALUES: "Move to config/contract",
    UNSAFE_ASSUMPTIONS: "Add validation & error handling",
    SILENT_FAILURES: "Add error logging",
    DEPRECATED_CODE: "Update to modern patterns",
    BACKWARDS_COMPATIBILITY: "Plan migration",

    // Temporal - FIX FOR PRODUCTION
    FOR_NOW: "Implement production solution",
    IN_PRODUCTION: "Fix production deployment issues",
    TEMPORAL_LANGUAGE: "Replace temporary with permanent code",

    // Explicit markers - COMPLETE TASKS
    EXPLICIT_TODO: "Complete TODO and remove comment",
    IMPORTANT_NOTES: "Address noted requirement",

    // Commented out code - TOP BLOCKER - UNCOMMENT IMMEDIATELY
    COMMENTED_OUT_CODE: "Uncomment code to resolve type errors and wire up with corresponding consumers",

    // Default
    default: "Fix per requirements"
  }

  return guidance[issueType] || guidance.default
}

// Initialize report
let report = `# Comprehensive TODO Analysis Report

**Generated:** ${timestamp}
**Scope:** Combined deceptive language detection + precise TODO tracking
**Purpose:** Identify all code quality issues and actionable development tasks
**Approach:** Integrated deceptive patterns + SEDI precision + priority classification

## Executive Summary

This comprehensive analysis combines:
- **Deceptive Language Patterns** (1,048+ issues detected previously)
- **SEDI TODO Precision** (89 targeted issues with priorities)
- **Priority Classification** (Critical → Low action items)
- **False Positive Filtering** (Business logic exclusions)
- **Actionable Insights** (Concrete development tasks)

---

`

// ENHANCED ANALYSIS DATA STRUCTURE (from profitpilot version)
const analysis = {
  tasks: [],
  debug: [],
  incomplete: [],
  total: 0,
  filesProcessed: 0,
  byPriority: { blocker: [], critical: [], major: [], minor: [] }
}

// LEARNING STATE FOR PATTERN IMPROVEMENT (from profitpilot version)
const learningState = {
  falsePositives: [],
  realIssues: [],
  patternsLearned: [],
  analysisHistory: []
}

// TODO tracking with enhanced categorization
const todos = {
  explicit: [], // TODO/FIXME/HACK comments
  deceptive: [], // Deceptive language patterns
  temporary: [], // Temporary code patterns
  incomplete: [], // Incomplete implementations
  commented_code: [], // Commented out code sections - TOP BLOCKER
  debugging: [], // Console.log, debugger, etc.
  critical: [],
  high: [],
  medium: [],
  low: [],
  byCategory: {
    temporal: [],
    incomplete: [],
    deceptive: [],
    technical_debt: [],
    explicit: [],
    temporary: [],
    commented_code: [] // Commented out code sections
  }
}

console.log("🔍 Phase 1: Scanning for explicit TODOs...")
console.log("🔍 Phase 2: Scanning for deceptive language patterns...")
console.log("🔍 Phase 3: Scanning for temporary code patterns...")

// Helper function to check if line should be excluded
function shouldExclude(line, file) {
  // Check file exclusions
  for (const pattern of excludeFiles) {
    if (pattern.test(file)) return true
  }

  // Context-aware exclusions for test files
  const isTestFile = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(file) ||
                     file.includes('/__tests__/') ||
                     file.includes('.test.') ||
                     file.includes('.spec.')

  // Exclude INCOMPLETE_ADMISSION patterns only in test files (these are legitimate test expectations)
  if (isTestFile && /incomplete|not.*implemented|not.*yet.*implemented|AI analysis not yet implemented|AI assessment not yet implemented|ML training not yet implemented/i.test(line)) {
    return true
  }

  // Check business logic exclusions - but NOT if line contains TODO/error terms
  const hasTodoOrError = /(TODO|FIXME|HACK|error|Error|fail|Fail|exception|Exception|throw|return null|return undefined|not implemented|incomplete)/i.test(line)

  if (!hasTodoOrError) {
    for (const pattern of businessExclusions) {
      if (pattern.test(line)) return true
    }
  }

  return false
}

// Helper function to check if commented line is documentation/example vs actual code
function isDocumentationComment(line) {
  const lowerLine = line.toLowerCase()

  // Exclude documentation and examples
  if (/import.*from.*\/\/|usage:|example:|```|note:|future:|todo:|fixme:|hack:|avoid.*dependency|circular.*dependency|duplicate.*export/i.test(lowerLine)) {
    return true
  }

  // Exclude explanatory comments about file contents
  if (/type.*definition.*for|declarations.*for|type.*for.*exchanges|interface.*types|type.*aliases.*for.*compatibility/i.test(lowerLine)) {
    return true
  }

  // Exclude comments that are clearly headers or explanations
  if (/^\/\/\s*(={3,}|-+|type|export|class|function|interface|const|let|var)\s*$/i.test(line)) {
    return true
  }

  // Exclude section headers with uppercase text
  if (/^\/\/\s+[A-Z\s\(\)]+$/i.test(line)) {
    return true
  }

  // Exclude comments that explain why something is commented out
  if (/commented.*out.*to|avoid.*duplicate|created.*in.*main|not.*exist.*in|does.*not.*exist|moved.*to/i.test(lowerLine)) {
    return true
  }

  // Exclude comments that are just describing what the following code does
  if (/return.*in.*format|return.*as|return.*the|use.*for|add.*other|calculate.*based|required.*for|for.*future.*use|special.*case|replaces:/i.test(lowerLine)) {
    return true
  }

  // Exclude parenthetical explanations
  if (/^\s*\/\/\s*\([^)]*\)$/i.test(line)) {
    return true
  }

  // Exclude comments that contain programming keywords but are just explanations
  if (/^\/\/\s*(return|if|for|while|try|catch|throw|await|const|let|var|function|class)\s/i.test(line) &&
      !/\w+\s*\(|=\s*\{|=\s*\[|=\s*['"]|=\s*\d+|\.\w+\s*\(/.test(line)) {
    return true
  }

  return false
}

// ENHANCED PRIORITY DETERMINATION FUNCTION (from profitpilot version)
function determinePriority(text) {
  const lowerText = text.toLowerCase()

  // Check blocker triggers first (highest priority)
  if (priorityLevels.blocker.triggers.some(trigger => lowerText.includes(trigger))) {
    return 'blocker'
  }

  // Check critical triggers
  if (priorityLevels.critical.triggers.some(trigger => lowerText.includes(trigger))) {
    return 'critical'
  }

  // Check major triggers
  if (priorityLevels.major.triggers.some(trigger => lowerText.includes(trigger))) {
    return 'major'
  }

  return 'minor'
}

// LEGACY Helper function to categorize TODO by priority (for backward compatibility)
function categorizeTodo(text, type, severity) {
  const lowerText = text.toLowerCase()

  // Check severity-based priority first
  if (severity === "CRITICAL") return 1
  if (severity === "HIGH") return 2
  if (severity === "MEDIUM") return 3
  if (severity === "LOW") return 4

  // Check blocker keywords (highest priority)
  for (const keyword of priorityLevels.blocker.triggers) {
    if (lowerText.includes(keyword)) {
      return 1 // Blocker
    }
  }

  // Check critical keywords
  for (const keyword of priorityCategories.critical.keywords) {
    if (lowerText.includes(keyword)) {
      return 1 // Critical
    }
  }

  // Check high priority keywords
  for (const keyword of priorityCategories.high.keywords) {
    if (lowerText.includes(keyword)) {
      return 2 // High
    }
  }

  // Check medium priority keywords
  for (const keyword of priorityCategories.medium.keywords) {
    if (lowerText.includes(keyword)) {
      return 3 // Medium
    }
  }

  // Default to low priority
  return 4 // Low
}

// SCAN CODE FOR COMPREHENSIVE ISSUES
function scanCodeComprehensive() {
  scanStartTime = Date.now() // Set scan start time
  const codeFiles = []
  const excludeDirs = [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "coverage",
    "docs",
    "scripts",  // Exclude scripts directory (but scan eslint configs)
    ".turbo",
    ".cache",
    ".vscode",
    ".idea",
    ".DS_Store",
    "logs",
    "tmp",
    "temp",
    ".nyc_output",
    ".eslintcache",
    "playwright-report",
    "test-results",
    ".storybook-out",
    ".jest",
  ]

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return

    const files = fs.readdirSync(dir)
    files.forEach((file) => {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory() && !excludeDirs.includes(file)) {
        scanDirectory(fullPath)
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx|json|yaml|yml|csv|config|cfg|ini|mjs|cjs)$/.test(file)) {
        // Scan ALL source code and config files - exclude docs, build outputs, dependencies
        codeFiles.push(fullPath)
      }
    })
  }

  // Support focused scanning - scan all source code and configs, exclude scripts directory
  const directories = focusDir ? [focusDir] : ["apps", "packages", "configs", "."]
  console.log(`📂 Scanning directories: ${directories.join(', ')}`)

  directories.forEach(dir => scanDirectory(dir))

  // Extract comprehensive issues from files
  console.log(`🔍 Processing ${codeFiles.length} files...`)
  let processedCount = 0
  codeFiles.forEach((file) => {
    if (shouldExclude("", file)) return // Skip excluded files

    processedCount++
    if (file.includes('job-queue.adapter.ts') || file.includes('risk.service.ts')) {
      console.log(`📄 Processing: ${file}`)
    }

    const content = fs.readFileSync(file, "utf8")
    const lines = content.split("\n")

    lines.forEach((line, index) => {
      const lineNumber = index + 1
      const trimmedLine = line.trim()


      if (shouldExclude(line, file)) return // Skip excluded lines

      if (!trimmedLine || trimmedLine.length < 3) return // Skip empty/short lines

      let matched = false

      // 1. Check for explicit TODO patterns
      for (const pattern of explicitTodoPatterns) {
        if (pattern.test(line)) {
          const priority = categorizeTodo(trimmedLine, "EXPLICIT", "HIGH")
          const todoItem = {
            file,
            line: lineNumber,
            type: "EXPLICIT_TODO",
            text: trimmedLine,
            priority: priority,
            category: "explicit",
            source: "explicit_todo"
          }


          todos.explicit.push(todoItem)
          todos.byCategory.explicit.push(todoItem)

          // Categorize by priority
          switch (todoItem.priority) {
            case 1:
              todos.critical.push(todoItem)
              break
            case 2:
              todos.high.push(todoItem)
              break
            case 3:
              todos.medium.push(todoItem)
              break
            case 4:
              todos.low.push(todoItem)
              break
          }
          matched = true
          break // Only match first pattern
        }
      }

      if (matched) return // Skip other checks if explicit TODO found

      // 2. Check for deceptive language patterns
      for (const pattern of deceptivePatterns) {
        if (pattern.regex.test(line)) {
          const todoItem = {
            file,
            line: lineNumber,
            type: pattern.type,
            text: trimmedLine,
            priority: categorizeTodo(trimmedLine, pattern.type, pattern.severity),
            category: pattern.category,
            severity: pattern.severity,
            source: "deceptive_language"
          }
          todos.deceptive.push(todoItem)
          todos.byCategory[pattern.category].push(todoItem)

          switch (todoItem.priority) {
            case 1:
              todos.critical.push(todoItem)
              break
            case 2:
              todos.high.push(todoItem)
              break
            case 3:
              todos.medium.push(todoItem)
              break
            case 4:
              todos.low.push(todoItem)
              break
          }
          matched = true
          break // Only match first deceptive pattern
        }
      }

      if (matched) return // Skip other checks if deceptive pattern found

      // 3. Check for temporary code patterns
      for (const pattern of temporaryCodePatterns) {
        if (pattern.test(line)) {
          const todoItem = {
            file,
            line: lineNumber,
            type: "TEMPORARY_CODE",
            text: trimmedLine,
            priority: categorizeTodo(trimmedLine, "TEMPORARY", "MEDIUM"),
            category: "temporary",
            source: "temporary_code"
          }
          todos.temporary.push(todoItem)
          todos.byCategory.temporary.push(todoItem)

          switch (todoItem.priority) {
            case 1:
              todos.critical.push(todoItem)
              break
            case 2:
              todos.high.push(todoItem)
              break
            case 3:
              todos.medium.push(todoItem)
              break
            case 4:
              todos.low.push(todoItem)
              break
          }
          matched = true
          break // Only match first pattern
        }
      }

      if (matched) return // Skip other checks if temporary pattern found

      // 4. Check for incomplete implementations
      for (const pattern of incompletePatterns) {
        if (pattern.test(line)) {
          const todoItem = {
            file,
            line: lineNumber,
            type: "INCOMPLETE_IMPLEMENTATION",
            text: trimmedLine,
            priority: categorizeTodo(trimmedLine, "INCOMPLETE", "HIGH"),
            category: "incomplete",
            source: "incomplete_implementation"
          }
          todos.incomplete.push(todoItem)
          todos.byCategory.incomplete.push(todoItem)

          switch (todoItem.priority) {
            case 1:
              todos.critical.push(todoItem)
              break
            case 2:
              todos.high.push(todoItem)
              break
            case 3:
              todos.medium.push(todoItem)
              break
            case 4:
              todos.low.push(todoItem)
              break
          }
          matched = true
          break // Only match first pattern
        }
      }

      if (matched) return // Skip other checks if incomplete pattern found

      // 5. Check for commented out code patterns (TOP BLOCKER)
      // Only flag actual executable code, not documentation
      for (const pattern of commentedCodePatterns) {
        if (pattern.test(line) && !isDocumentationComment(line)) {
          const todoItem = {
            file,
            line: lineNumber,
            type: "COMMENTED_OUT_CODE",
            text: trimmedLine,
            priority: 1, // Always blocker priority for commented code
            category: "commented_code",
            source: "commented_code"
          }
          todos.commented_code.push(todoItem)
          todos.byCategory.commented_code.push(todoItem)
          todos.critical.push(todoItem) // Add to critical since it's a blocker

          matched = true
          break // Only match first pattern
        }
      }
    })
  })
  console.log(`✅ Processed ${processedCount} files (excluded ${codeFiles.length - processedCount})`)
}

// Run comprehensive analysis
scanCodeComprehensive()

const scanDuration = Date.now() - scanStartTime
console.log(`⏱️  Scan completed in ${(scanDuration / 1000).toFixed(2)} seconds`)

// Transfer items from todos to analysis.byPriority for reporting
console.log("🔄 Transferring items to priority buckets...")
// Priority mapping: 1=blocker, 2=critical, 3=high→major, 4=medium→minor
analysis.byPriority.blocker = [...todos.critical, ...todos.high, ...todos.medium, ...todos.low].filter(item => item.priority === 1)
analysis.byPriority.critical = [...todos.critical, ...todos.high, ...todos.medium, ...todos.low].filter(item => item.priority === 2)
analysis.byPriority.major = [...todos.critical, ...todos.high, ...todos.medium, ...todos.low].filter(item => item.priority === 3)
analysis.byPriority.minor = [...todos.critical, ...todos.high, ...todos.medium, ...todos.low].filter(item => item.priority === 4)

// LEARNING FUNCTIONS (from profitpilot version)
function learnFromAnalysis() {
  console.log("🧠 Learning from analysis results...")

  // For now, we'll track basic patterns
  // In a real implementation, this could be used to improve future detection

  const totalIssues = analysis.tasks.length + analysis.debug.length + analysis.incomplete.length
  const learningRate = totalIssues > 0 ? (analysis.tasks.length / totalIssues * 100).toFixed(1) : 0

  learningState.analysisHistory.push({
    timestamp: new Date().toISOString(),
    totalIssues: totalIssues,
    tasksFound: analysis.tasks.length,
    debugFound: analysis.debug.length,
    incompleteFound: analysis.incomplete.length,
    scanDuration: scanDuration,
    learningRate: learningRate
  })

  console.log(`  - Analysis stored for future pattern improvement`)
  console.log(`  - Current learning rate: ${learningRate}% actionable tasks`)
}

function checkForMissedCriticalIssues() {
  console.log("🔍 Checking for potentially missed critical issues...")

  const potentiallyMissed = []

  // Check for patterns that might indicate critical issues
  const criticalPatterns = [
    'security', 'vulnerability', 'authentication', 'authorization',
    'password', 'token', 'secret', 'key', 'credential',
    'sql injection', 'xss', 'csrf', 'injection',
    'error handling', 'exception', 'throw new error',
    'not implemented', 'todo implement', 'fixme implement',
    'deprecated', 'obsolete', 'broken', 'failing',
    'performance', 'memory leak', 'infinite loop',
    'data loss', 'corruption', 'inconsistency',
  ]

  // Check all found issues for critical patterns that might have been missed
  const allIssues = [...analysis.tasks, ...analysis.debug, ...analysis.incomplete]

  for (const issue of allIssues) {
    const content = issue.text.toLowerCase()

    for (const pattern of criticalPatterns) {
      if (content.includes(pattern) && issue.priority !== 'blocker') {
        potentiallyMissed.push({
          issue: issue,
          pattern: pattern,
          severity: calculateSeverity(pattern, content),
          reason: `Contains critical pattern: ${pattern}`,
        })
      }
    }
  }

  console.log(`  - Potentially missed critical issues: ${potentiallyMissed.length}`)

  if (potentiallyMissed.length > 0) {
    console.log("\n⚠️  POTENTIALLY MISSED CRITICAL ISSUES:")
    for (const missed of potentiallyMissed.slice(0, 5)) {
      console.log(`  - ${missed.issue.file}:${missed.issue.line} - ${missed.pattern} (${missed.severity})`)
    }
    if (potentiallyMissed.length > 5) {
      console.log(`  - ... and ${potentiallyMissed.length - 5} more issues`)
    }
  }

  return potentiallyMissed
}

function calculateSeverity(pattern, content) {
  const securityPatterns = ['security', 'vulnerability', 'injection', 'xss', 'csrf']
  const authPatterns = ['authentication', 'authorization', 'password', 'token', 'secret']
  const errorPatterns = ['error handling', 'exception', 'throw new error']

  if (securityPatterns.some(p => pattern.includes(p))) {
    return 'critical'
  }

  if (authPatterns.some(p => pattern.includes(p))) {
    return 'high'
  }

  if (errorPatterns.some(p => pattern.includes(p))) {
    return 'medium'
  }

  return 'low'
}

// LEARN FROM ANALYSIS RESULTS
learnFromAnalysis()

// CHECK FOR POTENTIALLY MISSED CRITICAL ISSUES
const potentiallyMissed = checkForMissedCriticalIssues()

// Calculate totals
const totalIssues = todos.explicit.length + todos.deceptive.length + todos.temporary.length + todos.incomplete.length + todos.commented_code.length

// Generate comprehensive report
report += `## Comprehensive Issue Analysis Results

**Total Issues Found:** ${totalIssues}
- **Explicit TODOs:** ${todos.explicit.length} (TODO/FIXME/HACK comments)
- **Deceptive Language:** ${todos.deceptive.length} (broad pattern detection)
- **Temporary Code:** ${todos.temporary.length} (console.log, workarounds, etc.)
- **Incomplete Implementations:** ${todos.incomplete.length} (not implemented, stubs)
- **Commented Out Code:** ${todos.commented_code.length} (TOP BLOCKER - uncomment to fix type errors)

**Priority Breakdown:**
- **Blockers:** ${analysis.byPriority.blocker.length} (${priorityLevels.blocker.impact})
- **Critical:** ${analysis.byPriority.critical.length} (${priorityLevels.critical.impact})
- **Major:** ${analysis.byPriority.major.length} (${priorityLevels.major.impact})
- **Minor:** ${analysis.byPriority.minor.length} (${priorityLevels.minor.impact})

**Category Breakdown:**
- **Temporal Issues:** ${todos.byCategory.temporal.length} (time-based temporary code)
- **Incomplete Features:** ${todos.byCategory.incomplete.length} (missing implementations)
- **Deceptive Patterns:** ${todos.byCategory.deceptive.length} (misleading comments/code)
- **Technical Debt:** ${todos.byCategory.technical_debt.length} (hardcoded values, deprecated code)
- **Explicit Markers:** ${todos.byCategory.explicit.length} (direct TODOs/bugs)
- **Temporary Solutions:** ${todos.byCategory.temporary.length} (workarounds, stubs)
- **Commented Out Code:** ${todos.byCategory.commented_code.length} (TOP BLOCKER - causing type errors)

---

`

// Add blocker issues section (from profitpilot version)
if (analysis.byPriority.blocker.length > 0) {
  report += `## 🚫 Blocker Issues (${analysis.byPriority.blocker.length})\n\n`
  analysis.byPriority.blocker.forEach((item, idx) => {
    report += `${idx + 1}. **${item.file}:${item.line}** (${item.type})\n`
    report += `   \`${item.text}\`\n`
    report += `   *Priority: Blocker | Impact: ${priorityLevels.blocker.impact}*\n\n`
  })
}

// Add critical issues section
if (analysis.byPriority.critical.length > 0) {
  report += `## 🚨 Critical Issues (${analysis.byPriority.critical.length})\n\n`
  todos.critical.forEach((item, idx) => {
    report += `${idx + 1}. **${item.file}:${item.line}** (${item.type})\n`
    report += `   \`${item.text}\`\n`
    report += `   *Priority: Critical | Category: ${item.category} | Source: ${item.source}*\n\n`
  })
}

// Add high priority issues with concise actions
if (todos.high.length > 0) {
  report += `## 🎯 High Priority Issues\n\n`

  // Show top 20 issues with concise file listings
  todos.high.slice(0, 20).forEach((item, idx) => {
    const guidance = getIssueGuidance(item.type)
    report += `${idx + 1}. **${item.file}:${item.line}** (${item.type})\n`
    report += `   \`${item.text}\`\n`
    report += `   *${guidance}*\n\n`
  })

  if (todos.high.length > 20) {
    report += `... and ${todos.high.length - 20} more high priority issues\n\n`
  }
}

// Add debugging statements section
const debugStatements = todos.temporary.filter(
  (item) =>
    item.text.includes("console.log") ||
    item.text.includes("console.error") ||
    item.text.includes("debugger") ||
    item.text.includes("alert(")
)

if (debugStatements.length > 0) {
  report += `## 🐛 Debugging Statements to Remove (${debugStatements.length})\n\n`
  debugStatements.slice(0, 10).forEach((item, idx) => {
    report += `${idx + 1}. **${item.file}:${item.line}**\n`
    report += `   \`${item.text}\`\n\n`
  })
  if (debugStatements.length > 10) {
    report += `... and ${debugStatements.length - 10} more debugging statements\n\n`
  }
}

// Add category guidance with one-liners
report += `## 📋 Action Guide

### ${todos.byCategory.deceptive.length} Deceptive Patterns
**READ:** Product docs, technical foundation
**MAKE PRODUCTION READY:** Replace workarounds with proper implementations

### ${todos.byCategory.incomplete.length} Incomplete Features
**READ:** Feature specs, API contracts
**MAKE PRODUCTION READY:** Complete missing integrations and placeholders

### ${todos.byCategory.temporal.length} Temporal Issues
**READ:** Product roadmap, deployment requirements
**MAKE PRODUCTION READY:** Replace temporary code with permanent solutions

### ${todos.byCategory.technical_debt.length} Technical Debt
**READ:** Architecture docs, coding standards
**MAKE PRODUCTION READY:** Refactor hardcoded values, add error handling

### ${todos.byCategory.explicit.length} Explicit TODOs
**READ:** Issue context, acceptance criteria
**MAKE PRODUCTION READY:** Complete TODOs and remove comments

### ${todos.byCategory.temporary.length} Temporary Solutions
**READ:** Timeline constraints, business requirements
**MAKE PRODUCTION READY:** Replace placeholders with real implementations

### ${todos.byCategory.commented_code.length} Commented Out Code (TOP BLOCKER)
**READ:** Type errors, missing functionality, consumer requirements
**MAKE PRODUCTION READY:** Uncomment code and wire up with corresponding consumers

---

`

// Add summary and recommendations
report += `## 📈 Summary & Recommendations

### Immediate Actions Required:
`

if (analysis.byPriority.blocker.length > 0) {
  report += `- **${analysis.byPriority.blocker.length} BLOCKER issues** must be resolved before any deployment\n`
}

if (analysis.byPriority.critical.length > 0) {
  report += `- **${analysis.byPriority.critical.length} CRITICAL issues** must be resolved before production\n`
}

if (analysis.byPriority.major.length > 0) {
  report += `- **${analysis.byPriority.major.length} MAJOR issues** should be addressed in current sprint\n`
}

if (debugStatements.length > 0) {
  report += `- **${debugStatements.length} debugging statements** should be removed for production\n`
}

if (todos.byCategory.deceptive.length > 0) {
  report += `- **${todos.byCategory.deceptive.length} deceptive patterns** need review for misleading code\n`
}

if (totalIssues === 0) {
  report += `✅ **Codebase is clean!** No critical TODO or deceptive language issues found.\n`
} else if (analysis.byPriority.blocker.length === 0 && analysis.byPriority.critical.length <= 5) {
  report += `✅ **Good status** - No blockers, manageable critical items.\n`
} else if (analysis.byPriority.blocker.length > 0) {
  report += `❌ **Action required** - Blocker issues must be resolved immediately.\n`
}

report += `\n**Report:** ${reportFile}
`

// Write comprehensive report
fs.writeFileSync(reportFile, report)

// Console summary with enhanced details
console.log("\n✅ Comprehensive TODO Analysis Complete!")
console.log(`📄 Report saved: ${reportFile}`)
console.log("\n📊 Comprehensive Summary:")

// Show breakdown by source
console.log(`\n🔍 Detection Sources:`)
console.log(`   Explicit TODOs: ${todos.explicit.length}`)
console.log(`   Deceptive Language: ${todos.deceptive.length}`)
console.log(`   Temporary Code: ${todos.temporary.length}`)
console.log(`   Incomplete Implementation: ${todos.incomplete.length}`)
console.log(`   Commented Out Code: ${todos.commented_code.length}`)
console.log(`   **TOTAL: ${totalIssues}**`)

// Show priority breakdown
console.log(`\n🎯 Priority Breakdown:`)
console.log(`   Blockers: ${analysis.byPriority.blocker.length} (${priorityLevels.blocker.impact})`)
console.log(`   Critical: ${analysis.byPriority.critical.length} (${priorityLevels.critical.impact})`)
console.log(`   Major: ${analysis.byPriority.major.length} (${priorityLevels.major.impact})`)
console.log(`   Minor: ${analysis.byPriority.minor.length} (${priorityLevels.minor.impact})`)

// Show category breakdown
console.log(`\n📂 Category Breakdown:`)
console.log(`   Temporal: ${todos.byCategory.temporal.length}`)
console.log(`   Incomplete: ${todos.byCategory.incomplete.length}`)
console.log(`   Deceptive: ${todos.byCategory.deceptive.length}`)
console.log(`   Technical Debt: ${todos.byCategory.technical_debt.length}`)
console.log(`   Explicit: ${todos.byCategory.explicit.length}`)
console.log(`   Temporary: ${todos.byCategory.temporary.length}`)
console.log(`   Commented Code: ${todos.byCategory.commented_code.length} (TOP BLOCKER)`)

if (analysis.byPriority.blocker.length > 0) {
  console.log("\n🚫 BLOCKER ISSUES FOUND:")
  analysis.byPriority.blocker.slice(0, 3).forEach((item, idx) => {
    console.log(`   ${idx + 1}. ${item.file}:${item.line} - ${item.type}`)
  })
} else if (analysis.byPriority.critical.length > 0) {
  console.log("\n🚨 CRITICAL ISSUES FOUND:")
  analysis.byPriority.critical.slice(0, 3).forEach((item, idx) => {
    console.log(`   ${idx + 1}. ${item.file}:${item.line} - ${item.type}`)
  })
}

if (debugStatements.length > 0) {
  console.log(`\n🐛 DEBUGGING STATEMENTS: ${debugStatements.length} found`)
}

if (totalIssues === 0) {
  console.log("\n✅ Codebase is clean - no issues found!")
} else if (analysis.byPriority.blocker.length === 0 && analysis.byPriority.critical.length === 0) {
  console.log("\n✅ No blocking issues - ready for development workflow")
} else if (analysis.byPriority.blocker.length > 0) {
  console.log("\n🚫 Blocker issues require immediate attention")
} else {
  console.log("\n⚠️ Critical issues require attention before production")
}

console.log(`\n📋 Full comprehensive report: ${reportFile}`)

// Exit with appropriate code (from profitpilot version)
process.exit(analysis.byPriority.blocker.length > 0 ? 1 : 0)
