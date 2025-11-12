#!/usr/bin/env node

// Enhanced Comprehensive TODO Tracker - Unified All Patterns
// Combines deceptive language, SEDI precision, and enhanced priority analysis
// Integrated features from profitpilot, comprehensive, and sedi versions

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Parse command line arguments
const args = process.argv.slice(2)

// Help flag
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🔍 Enhanced Comprehensive TODO Tracker (Unified)

DESCRIPTION:
  Scans codebase for TODO markers, deceptive language patterns, incomplete implementations,
  commented out code, and lazy coding patterns. Designed specifically for AI-generated codebases.

USAGE:
  node scripts/todo-tracker/todo-tracker.cjs [OPTIONS]

OPTIONS:
  --focus=<dir>           Focus scan on specific directory (e.g., --focus=src)
  --include=<dir>         Include directory that would normally be excluded (can be used multiple times)
  --config=<path>         Path to config file (default: .lazy-coding-tracker.config.js)
  --all                   Scan everything: debug statements, configs, scripts, markdown files
  --debug                 Include debug statements (console.log, debugger, etc.) in scan
  --configs               Scan config files (.yaml, .yml, .json, .toml, etc.) in addition to code files
  --scripts               Scan scripts folder/files (normally excluded)
  --format=<format>       Output format: markdown (default), json, or table
  --output=<path>         Custom output file path (default: docs/audit/Comprehensive_TODO_Analysis_YYYY-MM-DD.md)
  --priority=<level>      Filter by priority: blocker, critical, major, minor, or all (default: all)
  --category=<category>   Filter by category: temporal, incomplete, deceptive, technical_debt, explicit, temporary, commented_code, or all (default: all)
  --since=<ref>           Only scan files changed since git ref (e.g., HEAD~1, main, <commit-hash>)
  --blame                 Include git blame information (author, date) for each issue
  --age                   Track TODO age (how long since introduced)
  --exit-code=<level>     Exit code behavior: blocker (default), critical, all, never
  --max-issues=<count>    Fail if more than N issues found
  --max-blockers=<count>  Fail if more than N blockers found
  --summary               Show only summary (no detailed list)
  --no-console            Suppress console output (only write to file)
  --help, -h              Show this help message

EXAMPLES:
  # Scan entire codebase
  node scripts/todo-tracker/todo-tracker.cjs

  # Scan only src directory
  node scripts/todo-tracker/todo-tracker.cjs --focus=src

  # Scan with debug statements included
  node scripts/todo-tracker/todo-tracker.cjs --debug

  # Scan config files too
  node scripts/todo-tracker/todo-tracker.cjs --configs

  # Scan src directory including debug statements and configs
  node scripts/todo-tracker/todo-tracker.cjs --focus=src --debug --configs

  # Scan scripts folder (normally excluded)
  node scripts/todo-tracker/todo-tracker.cjs --scripts

  # Scan everything including scripts, debug, and configs
  node scripts/todo-tracker/todo-tracker.cjs --scripts --debug --configs

  # Scan everything with --all flag (equivalent to --scripts --debug --configs)
  node scripts/todo-tracker/todo-tracker.cjs --all

  # Output as JSON format
  node scripts/todo-tracker/todo-tracker.cjs --format=json

  # Output as table format (console only)
  node scripts/todo-tracker/todo-tracker.cjs --format=table

  # Custom output path
  node scripts/todo-tracker/todo-tracker.cjs --output=./reports/todos.json --format=json

  # Filter by priority (only blockers)
  node scripts/todo-tracker/todo-tracker.cjs --priority=blocker

  # Filter by category (only commented code)
  node scripts/todo-tracker/todo-tracker.cjs --category=commented_code

  # Combine filters
  node scripts/todo-tracker/todo-tracker.cjs --priority=critical --category=deceptive --format=json

  # Git integration - scan only changed files
  node scripts/todo-tracker/todo-tracker.cjs --since=HEAD~1

  # Include git blame info
  node scripts/todo-tracker/todo-tracker.cjs --blame --format=json

  # Track TODO age
  node scripts/todo-tracker/todo-tracker.cjs --age --format=json

  # CI/CD - fail on any blockers
  node scripts/todo-tracker/todo-tracker.cjs --exit-code=blocker --format=json

  # CI/CD - fail if more than 10 issues
  node scripts/todo-tracker/todo-tracker.cjs --max-issues=10 --format=json

  # Summary only (no detailed list)
  node scripts/todo-tracker/todo-tracker.cjs --summary

  # Suppress console output (file only)
  node scripts/todo-tracker/todo-tracker.cjs --no-console --format=json

DETECTION CAPABILITIES:
  ✅ Explicit TODOs (TODO, FIXME, HACK comments)
  ✅ Deceptive language patterns (FOR_NOW, SIMPLIFIED, etc.)
  ✅ Incomplete implementations (stubs, placeholders)
  ✅ Commented out code (executable code that's commented)
  ✅ Code patterns (empty returns, no-op async functions)
  ✅ Error handling issues (generic errors, missing throws)
  ✅ Zod validation issues (incomplete schemas)
  ✅ Hardcoded dummy/fake data (test@example.com, John Doe, etc.)
  ✅ Security vulnerabilities (hardcoded secrets, insecure input)

OUTPUT:
  - Console summary with priority breakdown
  - Detailed report saved to docs/audit/Comprehensive_TODO_Analysis_YYYY-MM-DD.md (or custom path with --output)
  - JSON format available with --format=json (CI/CD friendly)
  - Table format available with --format=table (console only)

For more information, see scripts/todo-tracker/README.md
`)
  process.exit(0)
}

const focusDir = args.find(arg => arg.startsWith('--focus='))?.split('=')[1]
const includeDirs = args.filter(arg => arg.startsWith('--include=')).map(arg => arg.split('=')[1])
const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1] || '.lazy-coding-tracker.config.js'
const includeAll = args.includes('--all')
const includeDebug = includeAll || args.includes('--debug')
const includeConfigs = includeAll || args.includes('--configs')
const includeScripts = includeAll || args.includes('--scripts')
const includeMd = includeAll || args.includes('--md')

// Parse format flag (markdown, json, table)
const formatArg = args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'markdown'
const outputFormat = ['markdown', 'json', 'table'].includes(formatArg.toLowerCase()) 
  ? formatArg.toLowerCase() 
  : 'markdown'

// Parse output path flag
const outputArg = args.find(arg => arg.startsWith('--output='))?.split('=')[1]

// Parse priority filter
const priorityArg = args.find(arg => arg.startsWith('--priority='))?.split('=')[1]?.toLowerCase()
const priorityFilter = ['blocker', 'critical', 'major', 'minor', 'all'].includes(priorityArg) 
  ? priorityArg 
  : 'all'

// Parse category filter
const categoryArg = args.find(arg => arg.startsWith('--category='))?.split('=')[1]?.toLowerCase()
const categoryFilter = ['temporal', 'incomplete', 'deceptive', 'technical_debt', 'explicit', 'temporary', 'commented_code', 'all'].includes(categoryArg)
  ? categoryArg
  : 'all'

// Parse git integration flags
const sinceArg = args.find(arg => arg.startsWith('--since='))?.split('=')[1]
const includeBlame = args.includes('--blame')
const includeAge = args.includes('--age')

// Parse CI/CD flags
const exitCodeArg = args.find(arg => arg.startsWith('--exit-code='))?.split('=')[1]?.toLowerCase()
const exitCodeLevel = ['blocker', 'critical', 'all', 'never'].includes(exitCodeArg)
  ? exitCodeArg
  : 'blocker'

const maxIssuesArg = args.find(arg => arg.startsWith('--max-issues='))?.split('=')[1]
const maxIssues = maxIssuesArg ? parseInt(maxIssuesArg, 10) : null

const maxBlockersArg = args.find(arg => arg.startsWith('--max-blockers='))?.split('=')[1]
const maxBlockers = maxBlockersArg ? parseInt(maxBlockersArg, 10) : null

// Parse reporting flags
const summaryOnly = args.includes('--summary')
const noConsole = args.includes('--no-console')

// Load configuration file
let config = null
const configFile = path.join(process.cwd(), configPath)
if (fs.existsSync(configFile)) {
  try {
    config = require(configFile)
    log(`📋 Loaded config from: ${configPath}`)
  } catch (error) {
    warn(`⚠️  Failed to load config from ${configPath}: ${error.message}`)
  }
}

// Get script's own path for self-exclusion
const SCRIPT_PATH = __filename
const SCRIPT_DIR = path.dirname(__filename)

// Performance tracking
const startTime = Date.now()
let scanStartTime = 0

// Get current timestamp for reports
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)
const dateOnly = new Date().toISOString().slice(0, 10)

// Console output wrapper (suppress if --no-console)
const log = noConsole ? () => {} : console.log.bind(console)
const warn = noConsole ? () => {} : console.warn.bind(console)

log("🔍 Enhanced Comprehensive TODO Tracker (Unified)")
log(`📅 Analysis Date: ${timestamp}`)
if (focusDir) {
  log(`🎯 Focused scan: ${focusDir}`)
}
log("=".repeat(80))

const reportsDir = path.join(__dirname, '..', '..', 'docs', 'audit')
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true })
}

// Default report file (will be overridden if --output is specified)
const defaultReportFile = path.join(reportsDir, `Comprehensive_TODO_Analysis_${dateOnly}.md`)

// Set report file based on output flag and format
let reportFile
if (!outputArg) {
  // Default: use format-specific extension
  if (outputFormat === 'json') {
    reportFile = path.join(reportsDir, `Comprehensive_TODO_Analysis_${dateOnly}.json`)
  } else if (outputFormat === 'table') {
    reportFile = null // Table format doesn't write to file
  } else {
    reportFile = defaultReportFile
  }
} else {
  // Custom output path provided
  reportFile = path.isAbsolute(outputArg) ? outputArg : path.join(process.cwd(), outputArg)
  // Ensure directory exists
  const outputDir = path.dirname(reportFile)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
}

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

  // HARDCODED DUMMY/FAKE DATA (indicates fake/dummy app, not live)
  // Common fake user data
  { regex: /\b(John Doe|Jane Doe|Test User|Demo User|Sample User|Example User|Dummy User|Fake User)\b/gi, type: "HARDCODED_DUMMY_USER", severity: "HIGH", category: "incomplete" },
  { regex: /\b(test@example\.com|user@example\.com|admin@example\.com|demo@example\.com|sample@example\.com|dummy@example\.com|fake@example\.com)\b/gi, type: "HARDCODED_DUMMY_EMAIL", severity: "HIGH", category: "incomplete" },
  { regex: /\b(password123|Password123|test123|Test123|admin123|Admin123|demo123|Demo123|password|Password|123456|qwerty)\b/gi, type: "HARDCODED_DUMMY_PASSWORD", severity: "CRITICAL", category: "security" },
  { regex: /\b(123-456-7890|555-555-5555|000-000-0000|111-111-1111|999-999-9999)\b/gi, type: "HARDCODED_DUMMY_PHONE", severity: "HIGH", category: "incomplete" },
  
  // Lorem ipsum and placeholder text
  { regex: /\b(lorem ipsum|Lorem Ipsum|LOREM IPSUM)\b/gi, type: "HARDCODED_LOREM_IPSUM", severity: "HIGH", category: "incomplete" },
  { regex: /\b(sample text|Sample Text|SAMPLE TEXT|placeholder text|Placeholder Text)\b/gi, type: "HARDCODED_PLACEHOLDER_TEXT", severity: "HIGH", category: "incomplete" },
  
  // Hardcoded fake IDs and numbers
  { regex: /\b(userId|user_id|userID)\s*[:=]\s*['"]?\s*(?:123|12345|1|0|999|9999|test|Test|TEST|demo|Demo|DEMO|sample|Sample|SAMPLE|dummy|Dummy|DUMMY|fake|Fake|FAKE)\s*['"]?/gi, type: "HARDCODED_DUMMY_ID", severity: "HIGH", category: "incomplete" },
  { regex: /\b(id|ID|Id)\s*[:=]\s*['"]?\s*(?:123|12345|1|0|999|9999|test|Test|TEST|demo|Demo|DEMO|sample|Sample|SAMPLE|dummy|Dummy|DUMMY|fake|Fake|FAKE)\s*['"]?/gi, type: "HARDCODED_DUMMY_ID", severity: "HIGH", category: "incomplete" },
  
  // Hardcoded fake URLs
  { regex: /https?:\/\/(?:example\.com|test\.com|demo\.com|sample\.com|dummy\.com|fake\.com|localhost|127\.0\.0\.1)/gi, type: "HARDCODED_DUMMY_URL", severity: "HIGH", category: "incomplete" },
  { regex: /['"]https?:\/\/[^'"]*(?:example|test|demo|sample|dummy|fake|placeholder)[^'"]*['"]/gi, type: "HARDCODED_DUMMY_URL", severity: "HIGH", category: "incomplete" },
  
  // Hardcoded fake addresses
  { regex: /\b(123 Main St|123 Main Street|123 Fake Street|123 Test Street|123 Demo Street|123 Sample Street)\b/gi, type: "HARDCODED_DUMMY_ADDRESS", severity: "HIGH", category: "incomplete" },
  { regex: /\b(New York|NY|California|CA|Texas|TX|Test City|Demo City|Sample City)\s*,\s*(?:USA|US|Test|Demo|Sample)\b/gi, type: "HARDCODED_DUMMY_LOCATION", severity: "HIGH", category: "incomplete" },
  
  // Hardcoded fake dates
  { regex: /\b(2024-01-01|2025-01-01|2000-01-01|1990-01-01|1900-01-01|01\/01\/2024|01\/01\/2025)\b/gi, type: "HARDCODED_DUMMY_DATE", severity: "MEDIUM", category: "incomplete" },
  
  // Hardcoded fake data arrays/objects
  { regex: /\[(?:'|")(?:John|Jane|Test|Demo|Sample|Dummy|Fake|Example)(?:'|"),?\s*(?:'|")(?:John|Jane|Test|Demo|Sample|Dummy|Fake|Example)(?:'|")/gi, type: "HARDCODED_DUMMY_ARRAY", severity: "HIGH", category: "incomplete" },
  { regex: /\{(?:name|user|email|username)\s*:\s*(?:'|")(?:John|Jane|Test|Demo|Sample|Dummy|Fake|Example|test@example)/gi, type: "HARDCODED_DUMMY_OBJECT", severity: "HIGH", category: "incomplete" },
  
  // Hardcoded fake API responses
  { regex: /(?:return|response|data)\s*[:=]\s*\{[^}]*['"](?:success|ok|true)['"][^}]*\}/gi, type: "HARDCODED_DUMMY_RESPONSE", severity: "HIGH", category: "incomplete" },
  { regex: /(?:return|response|data)\s*[:=]\s*\[[^\]]*\{[^}]*['"](?:John|Jane|Test|Demo|Sample|Dummy|Fake|Example|test@example)/gi, type: "HARDCODED_DUMMY_RESPONSE", severity: "HIGH", category: "incomplete" },

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

  // FALSE ASSURANCE PATTERNS (from developer research - AI code that looks complete but isn't)
  { regex: /seems.*to.*work|appears.*to.*work|looks.*like.*it.*works/gi, type: "FALSE_ASSURANCE", severity: "HIGH", category: "deceptive" },
  { regex: /looks.*correct|appears.*correct|seems.*correct/gi, type: "FALSE_ASSURANCE", severity: "HIGH", category: "deceptive" },
  { regex: /appears.*complete|seems.*complete|looks.*complete/gi, type: "FALSE_ASSURANCE", severity: "CRITICAL", category: "deceptive" },
  { regex: /probably.*works|maybe.*works|possibly.*works|could.*work/gi, type: "FALSE_ASSURANCE", severity: "HIGH", category: "deceptive" },

  // UNCERTAIN LANGUAGE (AI-generated uncertainty markers)
  { regex: /\b(maybe|probably|possibly|could be|might be|seems like|appears to be)\b/gi, type: "UNCERTAIN_LANGUAGE", severity: "MEDIUM", category: "deceptive" },
  { regex: /as per.*requirements|in order to achieve|according to.*spec/gi, type: "AI_GENERATED_PHRASING", severity: "LOW", category: "deceptive" },

  // OVERLY GENERIC COMMENTS (AI-generated redundant comments)
  { regex: /this function.*does|this function.*calculates|this function.*handles|this function.*processes/gi, type: "OVERLY_GENERIC_COMMENT", severity: "LOW", category: "deceptive" },
  { regex: /initialize.*variable|set.*variable.*to|create.*variable/gi, type: "REDUNDANT_COMMENT", severity: "LOW", category: "deceptive" },
  { regex: /handles.*(?:user|data|input|request)/gi, type: "VAGUE_COMMENT", severity: "MEDIUM", category: "deceptive" },

  // DEFERRED FIXES (without context)
  { regex: /fix.*later|fix.*someday|fix.*eventually|address.*later/gi, type: "DEFERRED_FIX", severity: "MEDIUM", category: "temporal" },
  { regex: /TODO.*implement.*(?:this|that|function|feature)/gi, type: "GENERIC_TODO", severity: "HIGH", category: "incomplete" },

  // INSECURE COMMENTS (auth/login without security considerations)
  { regex: /this function handles.*(?:auth|login|password|session)/gi, type: "INSECURE_COMMENT", severity: "CRITICAL", category: "deceptive" },

  // AI GENERATED MARKERS (explicit AI generation indicators)
  { regex: /generated by.*AI|auto-generated|machine-generated|AI-generated|automatically created|generated code|AI output|LLM-generated|GPT-generated|Codex-generated/gi, type: "AI_GENERATED_MARKER", severity: "LOW", category: "explicit" },
  { regex: /created using.*AI|generated by.*tool|AI.*assisted/gi, type: "AI_GENERATED_MARKER", severity: "LOW", category: "explicit" },

  // HARDCODED SECRETS (security vulnerability - AI often includes these)
  { regex: /\b(API_KEY|SECRET_KEY|PASSWORD|TOKEN|ACCESS_KEY|api_key|secret_key|password|token|access_key)\s*=\s*['"][^'"]+['"]/gi, type: "HARDCODED_SECRET", severity: "CRITICAL", category: "security" },
  { regex: /password.*[:=]\s*['"]|token.*[:=]\s*['"]|secret.*[:=]\s*['"]/gi, type: "HARDCODED_SECRET", severity: "CRITICAL", category: "security" },

  // INSECURE INPUT HANDLING (dangerous functions without validation)
  // Exclude regex.exec() - it's safe regex matching, not insecure
  // Exclude eval in console.log/print statements (just printing instructions)
  // Match eval/exec/input only when they're actually being called, not in strings/comments
  { regex: /\b(eval\s*\([^)]*\)|exec\s*\([^)]*\)|input\s*\(|raw_input\s*\(|query\s*\(|unescape\s*\()/gi, type: "INSECURE_INPUT", severity: "CRITICAL", category: "security" },
  // Exclude regex.exec() specifically - it's safe
  { regex: /\.exec\s*\(/gi, type: "REGEX_EXEC", severity: "LOW", category: "explicit", exclude: true },
  // Exclude eval in console.log/print (just printing shell instructions)
  { regex: /console\.(log|warn|info|error)\s*\([^)]*eval[^)]*\)/gi, type: "PRINT_EVAL", severity: "LOW", category: "explicit", exclude: true }, // Exclude this pattern

  // CONDITIONAL SUCCESS (success with caveats)
  { regex: /works.*(?:but|however|except|unless|if)/gi, type: "CONDITIONAL_SUCCESS", severity: "HIGH", category: "deceptive" },

  // MISLEADING SECURITY FUNCTIONS (functions with security names but no security logic)
  { regex: /function\s+(encrypt|hash|sanitize|validate|authenticate|authorize|checkPermission|secure|hashPassword|encryptData|sanitizeInput)\w*\s*\([^)]*\)\s*\{[^}]*return\s+(input|data|true|password|user|value|param)/gi, type: "MISLEADING_SECURITY_FUNCTION", severity: "CRITICAL", category: "security" },
  { regex: /(?:encrypts|validates|sanitizes|hashes|authenticates).*but.*(?:just returns|only returns|simply returns)/gi, type: "MISLEADING_SECURITY_FUNCTION", severity: "CRITICAL", category: "security" },

  // GENERIC ERROR THROWING (throw errors without context - AI often generates these)
  { regex: /throw\s+new\s+Error\s*\(\s*["'](?:An error occurred|Something went wrong|Error|Exception|Failed|An error|Something wrong|Error occurred|Exception occurred)["']\s*\)/gi, type: "GENERIC_ERROR_THROW", severity: "HIGH", category: "incomplete" },
  { regex: /throw\s+new\s+Error\s*\(\s*["'][^"']{0,20}["']\s*\)/gi, type: "GENERIC_ERROR_THROW", severity: "MEDIUM", category: "incomplete" }, // Very short error messages
  
  // INCOMPLETE ZOD SCHEMAS (superficial validation - AI often creates minimal schemas)
  { regex: /z\.(?:string|number|boolean|object)\s*\(\s*\)\s*$/gm, type: "INCOMPLETE_ZOD_SCHEMA", severity: "MEDIUM", category: "incomplete" },
  { regex: /z\.object\s*\(\s*\{\s*\}\s*\)/gi, type: "INCOMPLETE_ZOD_SCHEMA", severity: "HIGH", category: "incomplete" },
  { regex: /z\.(?:string|number|boolean)\s*\(\s*\)\s*\.(?:optional|nullable)\s*\(\s*\)/gi, type: "SUPERFICIAL_ZOD_VALIDATION", severity: "MEDIUM", category: "incomplete" },
  { regex: /\/\/.*(?:zod|Zod|schema|Schema).*(?:TODO|FIXME|incomplete|implement|add)/gi, type: "INCOMPLETE_ZOD_SCHEMA", severity: "HIGH", category: "incomplete" },
  
  // ERROR HANDLING WITHOUT THROW (defines error condition but doesn't throw)
  { regex: /if\s*\([^)]*(?:error|Error|invalid|Invalid|fail|Fail|exception|Exception)[^)]*\)\s*\{[^}]*\/\/.*(?:TODO|FIXME|handle|throw)/gi, type: "MISSING_ERROR_THROW", severity: "HIGH", category: "incomplete" },
  { regex: /if\s*\([^)]*(?:error|Error|invalid|Invalid)[^)]*\)\s*\{[^}]*return\s+(?:null|undefined|false|\[\]|\{\})/gi, type: "MISSING_ERROR_THROW", severity: "HIGH", category: "incomplete" },
  
  // CATCH BLOCKS WITHOUT PROPER HANDLING (AI often generates empty or generic catch)
  { regex: /catch\s*\([^)]*\)\s*\{[^}]*console\.(?:log|error|warn)\s*\([^)]*\)[^}]*\}/gi, type: "INADEQUATE_ERROR_HANDLING", severity: "MEDIUM", category: "incomplete" },
  { regex: /catch\s*\([^)]*\)\s*\{[^}]*\/\/.*(?:TODO|FIXME|handle|implement)[^}]*\}/gi, type: "INADEQUATE_ERROR_HANDLING", severity: "HIGH", category: "incomplete" },

  // EMPTY FUNCTION BODIES (descriptive names but empty/basic implementation)
  { regex: /function\s+\w+(?:Data|Input|User|Value|Result|Process|Calculate|Transform|Compute)\w*\s*\([^)]*\)\s*\{[^}]*?(?:pass|return\s*(?:input|data|true|false|null|undefined|0|''|\[\]|\{\}))[^}]*\}/gi, type: "EMPTY_FUNCTION_BODY", severity: "HIGH", category: "incomplete" },
  { regex: /function\s+\w+\s*\([^)]*\)\s*\{[^}]*\/\/.*(?:TODO|FIXME|implement|complete)[^}]*\}/gi, type: "EMPTY_FUNCTION_BODY", severity: "HIGH", category: "incomplete" },

  // COMMENT MISMATCH (comment claims functionality but code doesn't implement it)
  // Note: Multiline patterns are checked per-line, so we look for comment + function on same line or adjacent
  { regex: /\/\/.*(?:encrypts|validates|sanitizes|processes|calculates|transforms|authenticates|hashes).*function.*\{.*return\s+(?:input|data|true|false|null)/gi, type: "COMMENT_MISMATCH", severity: "HIGH", category: "deceptive" },
  { regex: /\/\/.*(?:This function|Function to|Method that).*(?:encrypts|validates|sanitizes|processes).*\{.*pass/gi, type: "COMMENT_MISMATCH", severity: "HIGH", category: "deceptive" },

  // GENERIC ERROR HANDLING (error handling that doesn't actually handle)
  { regex: /catch\s*\([^)]*\)\s*\{[^}]*?(?:An error occurred|Something went wrong|Error occurred|Exception occurred|An error|Something wrong)[^}]*\}/gi, type: "GENERIC_ERROR_HANDLING", severity: "MEDIUM", category: "incomplete" },
  { regex: /catch\s*\([^)]*\)\s*\{[^}]*?\}/gi, type: "EMPTY_CATCH_BLOCK", severity: "HIGH", category: "incomplete" },

  // FULLY IMPLEMENTED CLAIMS (comments claim full implementation but code is stub)
  { regex: /\/\/.*(?:fully implemented|complete implementation|fully functional|fully working|completely implemented|100% complete)/gi, type: "FULLY_IMPLEMENTED_CLAIM", severity: "HIGH", category: "deceptive" },

  // PROCESSING FUNCTIONS WITHOUT LOGIC (function names suggest processing but no logic)
  { regex: /function\s+(process|calculate|transform|compute|generate|build|create|construct)\w*\s*\([^)]*\)\s*\{[^}]*return\s+(?:input|data|param|value|0|''|\[\]|\{\})/gi, type: "PROCESSING_FUNCTION_NO_LOGIC", severity: "HIGH", category: "incomplete" },

  // MISLEADING COMMENTS (comments that don't match implementation)
  // Checked per-line, so pattern looks for comment + implementation on same line
  { regex: /\/\/.*(?:This function|Function to|Method that).*(?:does|performs|handles|implements).*(?:pass|return\s+(?:input|data|true|false|null))/gi, type: "MISLEADING_COMMENT", severity: "MEDIUM", category: "deceptive" },
]

// 3. TEMPORARY CODE PATTERNS (Enhanced with deceptive language detector patterns)
const temporaryCodePatterns = [
  /\/\/.*\b(temporarily disabled|temp disabled|disabled temporarily)\b/i,
  /\/\/.*\b(quick fix|quick hack|temporary fix)\b/i,
  /\/\/.*\b(workaround|work around)\b.*\b(until|for now)\b/i,
  /\/\/.*\b(placeholder|stub|mock)\b.*\b(implementation|data|function)\b/i,
  /temporary|temp |TEMP/gi, // From deceptive language detector
]

// DEBUG STATEMENT PATTERNS (only checked if --debug flag is set)
const debugStatementPatterns = [
  /console\.(log|error|warn|info|debug)\s*\(/gi,
  /\bdebugger\s*;/gi,
  /\balert\s*\(/gi,
  /console\.(trace|dir|table|group|groupEnd)\s*\(/gi,
]

// 4. INCOMPLETE IMPLEMENTATION PATTERNS (SEDI-style + Code Pattern Detection)
const incompletePatterns = [
  // Explicit incomplete implementations
  /throw new Error\s*\(\s*["'].*not implemented.*["']\s*\)/i,
  /throw new Error\s*\(\s*["'].*temporarily unavailable.*["']\s*\)/i,
  /throw new Error\s*\(\s*["'].*not yet implemented.*["']\s*\)/i,
  /throw new Error\s*\(\s*["'].*coming soon.*["']\s*\)/i,
  /throw new Error\s*\(\s*["'].*TODO.*["']\s*\)/i,
  /return null\s*\/\/.*\b(implement|add|complete)\b/i,
  /return undefined\s*\/\/.*\b(implement|add|complete)\b/i,
  /\/\/.*\b(not implemented|not finished|incomplete)\b/i,
  /\/\/.*\b(stub|placeholder)\b.*\b(replace|implement)\b/i,
  
  // Generic throw errors (AI often generates these)
  /throw new Error\s*\(\s*["'](?:An error occurred|Something went wrong|Error|Exception|Failed)["']\s*\)/i,
  /throw new Error\s*\(\s*["'][^"']{0,15}["']\s*\)/i, // Very short error messages (< 15 chars)
  
  // Zod schema patterns (incomplete/superficial validation)
  /z\.(?:string|number|boolean)\s*\(\s*\)\s*$/m, // Empty Zod schema
  /z\.object\s*\(\s*\{\s*\}\s*\)/i, // Empty object schema
  /z\.(?:string|number|boolean)\s*\(\s*\)\s*\.(?:optional|nullable)\s*\(\s*\)/i, // Superficial validation
  
  // CODE PATTERNS: Functions that always return empty/null/undefined (symptomatic of lazy coding)
  // Functions that always return empty array
  /function\s+\w+(?:Data|List|Items|Results|Records|Users|Items)\w*\s*\([^)]*\)\s*\{[^}]*return\s+\[\]\s*;?\s*\}/gi,
  // Functions that always return empty object
  /function\s+\w+(?:Data|Result|Response|Object|Config|Settings)\w*\s*\([^)]*\)\s*\{[^}]*return\s+\{\}\s*;?\s*\}/gi,
  // Functions that always return null
  /function\s+\w+(?:Data|Result|Value|Item|User)\w*\s*\([^)]*\)\s*\{[^}]*return\s+null\s*;?\s*\}/gi,
  // Functions that always return undefined
  /function\s+\w+(?:Data|Result|Value)\w*\s*\([^)]*\)\s*\{[^}]*return\s+undefined\s*;?\s*\}/gi,
  
  // Async functions that immediately resolve (no-op async)
  /async\s+function\s+\w+\s*\([^)]*\)\s*\{[^}]*return\s+Promise\.resolve\s*\([^)]*\)\s*;?\s*\}/gi,
  /async\s+function\s+\w+\s*\([^)]*\)\s*\{[^}]*return\s+Promise\.resolve\(\)\s*;?\s*\}/gi,
  
  // Validation functions that always return true/false
  /function\s+(?:validate|check|verify|isValid|canAccess|hasPermission)\w*\s*\([^)]*\)\s*\{[^}]*return\s+(?:true|false)\s*;?\s*\}/gi,
  
  // Database/API functions that return hardcoded data
  /function\s+(?:fetch|get|query|load|retrieve)\w*(?:Data|User|Item|Record)\w*\s*\([^)]*\)\s*\{[^}]*return\s+\{[^}]*:\s*['"][^'"]*['"][^}]*\}\s*;?\s*\}/gi,
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
  // Exclude descriptive comments about files (e.g., "// pyproject.toml (Poetry)")
  // Exclude descriptive comments (e.g., "// PowerShell (default on Windows 10+)")
  /^\s*\/\/\s*(?!\w+\.(toml|txt|py|js|ts|json|yaml|yml|md|makefile|cmake|gradle|pom|xml)\s*\()(?!.*\(.*\)\s*$)\w+\.\w+\s*\(/i,
  // Exclude descriptive comments like "// PowerShell (description)" - these are not method calls
  // Only match if it looks like an actual method call (lowercase method name, or await, or dot notation)
  // Pattern must start with lowercase letter (not uppercase like "PowerShell")
  /^\s*\/\/\s*(await\s+)?[a-z][a-z0-9_]*\s*\(/i, // Lowercase method names (actual code) - must start with lowercase
  /^\s*\/\/\s*\w+\.\w+\s*\(/i, // Method calls with dot notation

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

// 6. BUSINESS LOGIC EXCLUSIONS (Avoid False Positives) - Framework & Domain Agnostic
// Exclude legitimate operational messages and UI patterns, not technical implementation issues
const businessExclusions = [
  // Archive operations (legitimate business features)
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

  // Generic operational status messages (exclude normal business operations)
  /mode.*enabled/i, // Feature mode enabled status
  /data.*received/i, // Data received confirmations
  /execution.*completed/i, // Operation completion status
  /reconciliation.*finished/i, // Reconciliation completion
  /management.*active/i, // Management activation status
  /execution.*started/i, // Execution start status
  /adapter.*connected/i, // Adapter connection status
  /api.*integration.*successful/i, // API integration success status
  /rate.*limiting.*applied/i, // Rate limiting application status
  /engine.*running/i, // Engine running status
  /tracking.*updated/i, // Tracking update status
  /calculation.*complete/i, // Calculation completion status
  /check.*passed/i, // Check pass status
  /trail.*recorded/i, // Trail recording status
  /validation.*successful/i, // Validation success status

  // LEGITIMATE UI PLACEHOLDER TEXT (exclude from PLACEHOLDER_VALUES flagging)
  /placeholder=.*["'].*e\.g\.|placeholder=.*["'].*example/i, // JSX/HTML placeholder props with examples
  /placeholder.*["']Enter.*|placeholder.*["']Choose.*|placeholder.*["']Select.*/i, // Form input guidance
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
  // Note: Project-specific exclusions should be added via configuration file
  // These are examples that can be customized per project
]

// ENHANCED PRIORITY CLASSIFICATION SYSTEM (Blocker/Critical/Major/Minor)
const priorityLevels = {
  blocker: {
    triggers: ["auth", "security", "database", "migration", "production", "not implemented", "FOR_NOW", "IN_PRODUCTION", "COMMENTED_OUT_CODE"],
    impact: "Prevents production deployment - commented code causing type errors",
    priority: 1,
  },
  critical: {
    triggers: ["api", "validation", "error", "exception", "data", "service", "integration"],
    impact: "Breaks core application functionality",
    priority: 2,
  },
  major: {
    triggers: ["ui", "ux", "analytics", "performance", "feature", "component"],
    impact: "Impacts user experience",
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
    keywords: ["api", "integration", "validation", "error", "user", "data", "service", "temporarily unavailable", "TODO", "FIXME", "HACK"],
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

    // False assurance patterns - VERIFY ACTUALLY WORKS
    FALSE_ASSURANCE: "Verify code actually works - don't trust appearances",
    CONDITIONAL_SUCCESS: "Review success conditions - may not work in all cases",

    // Uncertain language - CLARIFY
    UNCERTAIN_LANGUAGE: "Clarify uncertainty - replace tentative language with concrete implementation",
    AI_GENERATED_PHRASING: "Review for accuracy - AI-generated phrasing may be generic",

    // Generic comments - IMPROVE
    OVERLY_GENERIC_COMMENT: "Add meaningful context - comment is too generic",
    REDUNDANT_COMMENT: "Remove or improve - comment states the obvious",
    VAGUE_COMMENT: "Add specific details - comment lacks context",

    // Deferred fixes - COMPLETE NOW
    DEFERRED_FIX: "Complete fix now - don't defer without context",
    GENERIC_TODO: "Add specific implementation details - generic TODO is not actionable",

    // Security issues - FIX IMMEDIATELY
    INSECURE_COMMENT: "Review security implementation - comment suggests insecure code",
    HARDCODED_SECRET: "Move to environment variables - never hardcode secrets",
    INSECURE_INPUT: "Add input validation - dangerous function without validation",

    // AI markers - REVIEW
    AI_GENERATED_MARKER: "Review AI-generated code for completeness and correctness",

    // Misleading security functions - FIX IMMEDIATELY
    MISLEADING_SECURITY_FUNCTION: "Implement actual security logic - function name suggests security but implementation is basic",
    EMPTY_FUNCTION_BODY: "Complete function implementation - descriptive name but empty/basic body",
    COMMENT_MISMATCH: "Fix comment or implementation - comment claims functionality but code doesn't implement it",
    GENERIC_ERROR_HANDLING: "Add proper error handling - generic messages don't help debugging",
    EMPTY_CATCH_BLOCK: "Add error handling logic - empty catch blocks hide errors",
    FULLY_IMPLEMENTED_CLAIM: "Verify implementation - comment claims full implementation but code may be incomplete",
    PROCESSING_FUNCTION_NO_LOGIC: "Add processing logic - function name suggests processing but just returns input",
    MISLEADING_COMMENT: "Update comment to match implementation or fix implementation to match comment",

    // Code pattern detection - FIX IMMEDIATELY
    EMPTY_RETURN_PATTERN: "Implement actual logic - function always returns empty array/object/null",
    NO_OP_ASYNC: "Implement async logic - function immediately resolves without doing work",
    ALWAYS_RETURNS_BOOLEAN: "Add validation logic - function always returns true/false without checking",
    
    // Error handling patterns
    GENERIC_ERROR_THROW: "Add specific error context - generic error messages don't help debugging",
    MISSING_ERROR_THROW: "Add error throwing - error condition detected but not thrown",
    INADEQUATE_ERROR_HANDLING: "Improve error handling - catch block doesn't properly handle errors",
    
    // Zod validation patterns
    INCOMPLETE_ZOD_SCHEMA: "Complete Zod schema - empty or minimal schema provides no validation",
    SUPERFICIAL_ZOD_VALIDATION: "Add validation constraints - schema only checks type, not constraints",
    
    // Hardcoded dummy/fake data patterns - INDICATES FAKE/DUMMY APP
    HARDCODED_DUMMY_USER: "Replace with real user data - hardcoded dummy user indicates fake app",
    HARDCODED_DUMMY_EMAIL: "Replace with real email - hardcoded example.com email indicates fake app",
    HARDCODED_DUMMY_PASSWORD: "CRITICAL: Remove hardcoded password - security vulnerability",
    HARDCODED_DUMMY_PHONE: "Replace with real phone - hardcoded dummy phone indicates fake app",
    HARDCODED_LOREM_IPSUM: "Replace with real content - lorem ipsum indicates placeholder content",
    HARDCODED_PLACEHOLDER_TEXT: "Replace with real content - placeholder text indicates incomplete",
    HARDCODED_DUMMY_ID: "Replace with real ID - hardcoded dummy ID indicates fake data",
    HARDCODED_DUMMY_URL: "Replace with real URL - hardcoded example/test URL indicates fake app",
    HARDCODED_DUMMY_ADDRESS: "Replace with real address - hardcoded dummy address indicates fake app",
    HARDCODED_DUMMY_LOCATION: "Replace with real location - hardcoded dummy location indicates fake app",
    HARDCODED_DUMMY_DATE: "Replace with real date - hardcoded dummy date indicates fake data",
    HARDCODED_DUMMY_ARRAY: "Replace with real data - hardcoded dummy array indicates fake app",
    HARDCODED_DUMMY_OBJECT: "Replace with real data - hardcoded dummy object indicates fake app",
    HARDCODED_DUMMY_RESPONSE: "Replace with real API response - hardcoded dummy response indicates fake app",

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
    commented_code: [], // Commented out code sections
    security: [] // Security vulnerabilities
  }
}

log("🔍 Phase 1: Scanning for explicit TODOs...")
log("🔍 Phase 2: Scanning for deceptive language patterns...")
log("🔍 Phase 3: Scanning for temporary code patterns...")
if (includeDebug) {
  log("🐛 Debug mode: Including debug statements (console.log, debugger, etc.)")
}
if (includeConfigs) {
  log("📋 Config mode: Including config files (.yaml, .yml, .json, .toml, etc.)")
}
if (includeScripts) {
  log("📜 Scripts mode: Including scripts folder/files (normally excluded)")
}

// Helper function to check if line should be excluded
function shouldExclude(line, file) {
  // Check file exclusions
  for (const pattern of excludeFiles) {
    if (pattern.test(file)) return true
  }
  
  // Exclude documentation comments that mention HACK/TODO/FIXME (not actual hacks)
  if (/\/\*\s*\*.*(?:Find|Search|Detect|Check|List).*(?:TODO|FIXME|HACK)/i.test(line) ||
      /\/\/\s*\*.*(?:Find|Search|Detect|Check|List).*(?:TODO|FIXME|HACK)/i.test(line) ||
      /\/\/\s*(?:Find|Search|Detect|Check|List).*(?:TODO|FIXME|HACK)/i.test(line) ||
      /\*\s*(?:Find|Search|Detect|Check|List).*(?:TODO|FIXME|HACK)/i.test(line)) {
    return true
  }
  
  // Exclude code that searches for HACK/TODO/FIXME patterns (not using hacks)
  if (/'TODO\|FIXME\|HACK|"TODO\|FIXME\|HACK|`TODO\|FIXME\|HACK/.test(line)) {
    return true
  }
  
  // Exclude string literals containing "deprecated" (not deprecated code, just IDs/messages)
  // Pattern: id: '...deprecated...' or message: '...deprecated...' or impact: '...deprecated...'
  if (/(id|message|impact|fix|description|text|label|name|title|category|severity|type|reason|guidance)\s*[:=]\s*['"`][^'"`]*[Dd]eprecated[^'"`]*['"`]/.test(line)) {
    return true
  }
  
  // Exclude object property values that are string literals with "deprecated"
  if (/:\s*['"`][^'"`]*[Dd]eprecated[^'"`]*['"`]\s*[,}]/.test(line)) {
    return true
  }
  
  // Exclude comments about deprecated code (documentation, not deprecated code itself)
  if (/\/\/\s*Check.*deprecated|\/\/\s*Find.*deprecated/i.test(line)) {
    return true
  }
  
  // Exclude warning/error messages that contain keywords (not lazy code, just warnings)
  // Pattern: console.warn/error with strings containing keywords
  if (/console\.(warn|error|log)\s*\([^)]*(?:in production|deprecated|hack|TODO|FIXME)/i.test(line)) {
    return true
  }
  
  // Exclude regex.exec() - it's not insecure input, it's regex matching
  // Pattern: pattern.exec() or regex.exec() or RegExp.exec()
  if (/\.exec\s*\(/.test(line) && 
      (/\w+Pattern\.exec|regex\w*\.exec|RegExp.*\.exec|pattern.*\.exec/i.test(line) ||
       /skillLoadPattern|workflowPattern|filePattern|matchPattern/i.test(line))) {
    return true
  }
  
  // Exclude descriptive comments that look like method calls but aren't
  // Pattern: "// Word (description)" - these are descriptive, not code
  // But exclude if it's actually a method call pattern
  if (/^\s*\/\/\s*[A-Z][a-z]+\s*\([^)]*\)\s*$/.test(line) && 
      !/^\s*\/\/\s*\w+\.\w+\s*\(/.test(line) &&
      !/^\s*\/\/\s*(await\s+)?\w+\s*\(/.test(line)) {
    return true
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

  // Exclude descriptive comments (not commented out code)
  // Pattern: // filename or // description (context)
  // These are documentation comments describing what the code does, not commented code
  
  // File references: "// pyproject.toml (Poetry, Black, etc.)"
  if (/^\/\/\s*[a-z0-9_-]+\.(toml|txt|py|js|ts|json|yaml|yml|md|makefile|cmake|gradle|pom|xml)\s*\(/i.test(line.trim())) {
    return true
  }
  if (/^\/\/\s*[a-z0-9_-]+\.(toml|txt|py|js|ts|json|yaml|yml|md|makefile|cmake|gradle|pom|xml)\s*$/i.test(line.trim())) {
    return true
  }
  
  // Descriptive comments with proper nouns: "// PowerShell (default on Windows 10+)"
  // Pattern: "// ProperNoun (description)" - descriptive, not code
  // These are documentation comments, not commented out code
  // Match: "// ProperNoun (description)" where ProperNoun starts with capital letter
  // Handle proper nouns with multiple capitals like "PowerShell", "Windows", etc.
  const trimmed = line.trim()
  const properNounPattern = /^\/\/\s*([A-Z][A-Za-z]+)\s*\([^)]*\)\s*$/
  if (properNounPattern.test(trimmed)) {
    const match = trimmed.match(properNounPattern)
    const properNoun = match ? match[1] : ''
    // Common proper nouns used in descriptive comments (not code)
    const descriptiveNouns = ['PowerShell', 'Windows', 'Linux', 'MacOS', 'Git', 'Bash', 'CMD', 'WSL', 'Poetry', 'Black', 'pip', 'npm', 'yarn', 'pnpm']
    if (descriptiveNouns.includes(properNoun)) {
      return true
    }
    // Also exclude if it's clearly descriptive (starts with capital, no dot notation, no lowercase method name)
    if (/^[A-Z]/.test(properNoun) &&
        !/^\s*\/\/\s*\w+\.\w+\s*\(/.test(line) &&
        !/^\s*\/\/\s*(await\s+)?[a-z]\w*\s*\(/.test(line)) {
      return true
    }
  }
  
  // File type references: "// Makefile (common in Python projects)"
  if (/^\/\/\s*[A-Z][a-z]+file\s*\(/i.test(line.trim())) {
    return true
  }

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

// Read .gitignore file and parse patterns
function readGitignore(rootDir) {
  const gitignorePath = path.join(rootDir, '.gitignore')
  if (!fs.existsSync(gitignorePath)) {
    return []
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf8')
  const patterns = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'))
    .map(pattern => {
      // Convert gitignore patterns to regex
      if (pattern.startsWith('/')) {
        // Absolute path from root
        return new RegExp('^' + pattern.slice(1).replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
      } else if (pattern.endsWith('/')) {
        // Directory
        return new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '.*')
      } else {
        // File or pattern
        return new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'))
      }
    })
  
  return patterns
}

// Check if file should be excluded based on config and gitignore
function shouldExcludeFile(filePath, rootDir) {
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/')
  
  // ALWAYS exclude the script itself
  if (filePath === SCRIPT_PATH || filePath.startsWith(SCRIPT_DIR)) {
    return true
  }
  
  // Apply config exclusions
  if (config && config.exclude) {
    // Always excluded (cannot be overridden)
    if (config.exclude.always) {
      for (const pattern of config.exclude.always) {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
        if (regex.test(relativePath) || regex.test(filePath)) {
          return true
        }
      }
    }
    
    // Respect gitignore if enabled
    if (config.exclude.respectGitignore !== false) {
      const gitignorePatterns = readGitignore(rootDir)
      for (const pattern of gitignorePatterns) {
        if (pattern.test(relativePath) || pattern.test(path.basename(filePath))) {
          return true
        }
      }
    }
    
    // Default exclusions (unless overridden by include)
    if (config.exclude.default) {
      let excludedByDefault = false
      for (const pattern of config.exclude.default) {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
        if (regex.test(relativePath) || regex.test(filePath)) {
          excludedByDefault = true
          break
        }
      }
      
      // Check if file is explicitly included
      if (excludedByDefault) {
        if (config.include && config.include.folders) {
          for (const includePattern of config.include.folders) {
            const regex = new RegExp(includePattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
            if (regex.test(relativePath) || regex.test(filePath)) {
              return false // Explicitly included, don't exclude
            }
          }
        }
        
        // Check --include command line flags
        if (includeDirs.length > 0) {
          for (const includeDir of includeDirs) {
            if (relativePath.startsWith(includeDir) || filePath.includes(includeDir)) {
              return false // Explicitly included via CLI
            }
          }
        }
        
        return true // Excluded by default
      }
    }
    
    // Custom exclusions
    if (config.exclude.custom) {
      for (const pattern of config.exclude.custom) {
        const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
        if (regex.test(relativePath) || regex.test(filePath)) {
          return true
        }
      }
    }
  } else {
    // Default behavior if no config
    const defaultExclusions = [
      /node_modules/,
      /\.git/,
      /\.next/,
      /dist/,
      /build/,
      /coverage/,
      /docs/,
      /scripts/, // Excluded by default, unless --scripts flag is set
      /examples/, // Exclude example/stub files
      /\.env/,
      /\.log$/,
      /\.lock$/,
    ]
    
    for (const pattern of defaultExclusions) {
      if (pattern.test(relativePath) || pattern.test(filePath)) {
        // Check --scripts flag (allows scripts folder)
        if (includeScripts && /scripts/.test(relativePath)) {
          // Still exclude the todo-tracker script itself
          if (relativePath.startsWith('scripts/todo-tracker/')) {
            return true
          }
          return false // Allow other scripts
        }
        
        // Check if explicitly included
        if (includeDirs.length > 0) {
          for (const includeDir of includeDirs) {
            if (relativePath.startsWith(includeDir) || filePath.includes(includeDir)) {
              return false
            }
          }
        }
        return true
      }
    }
    
    // Respect gitignore by default
    const gitignorePatterns = readGitignore(rootDir)
    for (const pattern of gitignorePatterns) {
      if (pattern.test(relativePath) || pattern.test(path.basename(filePath))) {
        return true
      }
    }
  }
  
  return false
}

// === GIT INTEGRATION FUNCTIONS ===

// Get list of changed files since git ref
function getChangedFilesSince(sinceRef) {
  try {
    const command = `git diff --name-only ${sinceRef}`
    const output = execSync(command, { encoding: 'utf8', cwd: process.cwd() })
    return output.split('\n').filter(file => file.trim().length > 0)
  } catch (error) {
    warn(`⚠️  Warning: Could not get changed files from git: ${error.message}`)
    return null
  }
}

// Get git blame info for a file and line
function getGitBlame(file, line) {
  if (!includeBlame && !includeAge) return null
  
  try {
    const command = `git blame -L ${line},${line} --porcelain "${file}"`
    const output = execSync(command, { encoding: 'utf8', cwd: process.cwd() })
    const lines = output.split('\n')
    
    const blame = {
      author: null,
      authorEmail: null,
      authorTime: null,
      summary: null
    }
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('author ')) {
        blame.author = lines[i].substring(7)
      } else if (lines[i].startsWith('author-mail ')) {
        blame.authorEmail = lines[i].substring(12).replace(/[<>]/g, '')
      } else if (lines[i].startsWith('author-time ')) {
        blame.authorTime = parseInt(lines[i].substring(12), 10)
        if (includeAge) {
          const ageMs = Date.now() / 1000 - blame.authorTime
          const ageDays = Math.floor(ageMs / 86400)
          const ageMonths = Math.floor(ageDays / 30)
          const ageYears = Math.floor(ageDays / 365)
          
          if (ageYears > 0) {
            blame.age = `${ageYears} year${ageYears > 1 ? 's' : ''}`
          } else if (ageMonths > 0) {
            blame.age = `${ageMonths} month${ageMonths > 1 ? 's' : ''}`
          } else {
            blame.age = `${ageDays} day${ageDays !== 1 ? 's' : ''}`
          }
        }
      } else if (lines[i].startsWith('summary ')) {
        blame.summary = lines[i].substring(8)
      }
    }
    
    return blame.author ? blame : null
  } catch (error) {
    // File might not be in git, or git might not be available
    return null
  }
}

// Check if git is available
function isGitAvailable() {
  try {
    execSync('git --version', { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// Add git blame/age info to todo item
function addGitInfoToTodoItem(todoItem, file, line) {
  if (includeBlame || includeAge) {
    const blame = getGitBlame(file, line)
    if (blame) {
      if (includeBlame) {
        todoItem.blame = {
          author: blame.author,
          authorEmail: blame.authorEmail,
          date: blame.authorTime ? new Date(blame.authorTime * 1000).toISOString() : null
        }
      }
      if (includeAge && blame.age) {
        todoItem.age = blame.age
      }
    }
  }
  return todoItem
}

// SCAN CODE FOR COMPREHENSIVE ISSUES
function scanCodeComprehensive() {
  scanStartTime = Date.now() // Set scan start time
  const codeFiles = []
  const rootDir = process.cwd()
  
  // Get file extensions from config or use defaults
  let extensions = config?.scan?.extensions || ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']
  
  // Add config file extensions if --configs flag is set
  if (includeConfigs) {
    const configExtensions = ['.yaml', '.yml', '.json', '.toml', '.ini', '.cfg', '.conf', '.config']
    extensions = [...new Set([...extensions, ...configExtensions])] // Remove duplicates
  }
  
  const extensionRegex = new RegExp(`\\.(${extensions.map(ext => ext.slice(1)).join('|')})$`)
  
  // Build exclude directories list from config or defaults
  let excludeDirs = config?.exclude?.always?.map(p => p.replace(/\*\*/g, '').replace(/\//g, '').replace(/\*/g, '')) || [
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    "coverage",
    "docs",
    "scripts", // Excluded by default, unless --scripts flag is set
    "examples", // Exclude example/stub files
    ".turbo",
    ".cache",
    ".vscode",
    ".idea",
    "logs",
    "tmp",
    "temp",
  ]
  
  // Remove scripts from exclusion if --scripts flag is set
  if (includeScripts) {
    excludeDirs = excludeDirs.filter(dir => dir !== "scripts")
  }
  
  // Always add script's own directory (todo-tracker subfolder)
  const scriptDirName = path.basename(SCRIPT_DIR)
  if (!excludeDirs.includes(scriptDirName)) {
    excludeDirs.push(scriptDirName)
  }

  function scanDirectory(dir) {
    if (!fs.existsSync(dir)) return

    const files = fs.readdirSync(dir)
    files.forEach((file) => {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory() && !excludeDirs.includes(file)) {
        scanDirectory(fullPath)
      } else if (stat.isFile() && extensionRegex.test(file)) {
        // Scan ALL source code and config files - exclude docs, build outputs, dependencies
        codeFiles.push(fullPath)
      }
    })
  }

  // Support focused scanning - scan all source code and configs, exclude scripts directory
  let directories
  if (focusDir) {
    directories = [focusDir]
  } else if (includeDirs.length > 0) {
    directories = includeDirs
  } else if (config?.include?.folders && config.include.folders.length > 0) {
    directories = config.include.folders
  } else {
    directories = ["apps", "packages", "src", "lib", "."]
  }
  
  log(`📂 Scanning directories: ${directories.join(', ')}`)
  if (includeDirs.length > 0) {
    log(`➕ Including: ${includeDirs.join(', ')}`)
  }

  directories.forEach(dir => scanDirectory(dir))

  // Filter files by --since if specified
  let filesToScan = codeFiles
  if (sinceArg) {
    if (!isGitAvailable()) {
      warn(`⚠️  Warning: Git not available, --since flag ignored`)
    } else {
      const changedFiles = getChangedFilesSince(sinceArg)
      if (changedFiles && changedFiles.length > 0) {
        // Convert to absolute paths for comparison
        const changedFilesAbs = changedFiles.map(f => path.resolve(process.cwd(), f))
        filesToScan = codeFiles.filter(file => {
          const fileAbs = path.resolve(file)
          return changedFilesAbs.some(changed => fileAbs === changed || fileAbs.startsWith(changed))
        })
        log(`📝 Git mode: Scanning ${filesToScan.length} changed files (from ${codeFiles.length} total)`)
      } else {
        log(`📝 Git mode: No changed files found since ${sinceArg}`)
        filesToScan = []
      }
    }
  }

  // Extract comprehensive issues from files
  log(`🔍 Processing ${filesToScan.length} files...`)
  let processedCount = 0
  filesToScan.forEach((file) => {
    // Double-check exclusion (should already be filtered, but be safe)
    if (shouldExcludeFile(file, rootDir)) return // Skip excluded files
    if (shouldExclude("", file)) return // Skip excluded files (legacy check)

    processedCount++
    if (file.includes('job-queue.adapter.ts') || file.includes('risk.service.ts')) {
      log(`📄 Processing: ${file}`)
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
          const todoItem = addGitInfoToTodoItem({
            file,
            line: lineNumber,
            type: "EXPLICIT_TODO",
            text: trimmedLine,
            priority: priority,
            category: "explicit",
            source: "explicit_todo"
          }, file, lineNumber)


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
        // Skip excluded patterns (like regex.exec)
        if (pattern.exclude) continue
        
        // Skip QUICK_HACK if it's in documentation or searching for HACK
        if (pattern.type === "QUICK_HACK" && 
            (/Find.*HACK|Search.*HACK|Detect.*HACK|Check.*HACK|TODO\|FIXME\|HACK/i.test(line) ||
             /['"]\w*HACK\w*['"]/.test(line))) {
          continue
        }
        
        if (pattern.regex.test(line)) {
          const todoItem = addGitInfoToTodoItem({
            file,
            line: lineNumber,
            type: pattern.type,
            text: trimmedLine,
            priority: categorizeTodo(trimmedLine, pattern.type, pattern.severity),
            category: pattern.category,
            severity: pattern.severity,
            source: "deceptive_language"
          }, file, lineNumber)
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
          const todoItem = addGitInfoToTodoItem({
            file,
            line: lineNumber,
            type: "TEMPORARY_CODE",
            text: trimmedLine,
            priority: categorizeTodo(trimmedLine, "TEMPORARY", "MEDIUM"),
            category: "temporary",
            source: "temporary_code"
          }, file, lineNumber)
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
          break
        }
      }

      if (matched) return // Skip other checks if temporary pattern found

      // 3b. Check for debug statements (only if --debug flag is set)
      if (includeDebug) {
        for (const pattern of debugStatementPatterns) {
          if (pattern.test(line)) {
            const todoItem = {
              file,
              line: lineNumber,
              type: "DEBUG_STATEMENT",
              text: trimmedLine,
              priority: categorizeTodo(trimmedLine, "DEBUG", "LOW"),
              category: "temporary",
              source: "debug_statement"
            }
            todos.temporary.push(todoItem)
            todos.byCategory.temporary.push(todoItem)
            todos.debugging.push(todoItem)

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
      }

      if (matched) return // Skip other checks if debug pattern found

      // 4. Check for incomplete implementations
      for (const pattern of incompletePatterns) {
        if (pattern.test(line)) {
          const todoItem = addGitInfoToTodoItem({
            file,
            line: lineNumber,
            type: "INCOMPLETE_IMPLEMENTATION",
            text: trimmedLine,
            priority: categorizeTodo(trimmedLine, "INCOMPLETE", "HIGH"),
            category: "incomplete",
            source: "incomplete_implementation"
          }, file, lineNumber)
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

      // 4b. Check for code patterns (functions that always return empty/null - no comments needed)
      // These are symptomatic of lazy coding/stubs even without comments
      const trimmedLineForCode = trimmedLine.replace(/\s+/g, ' ') // Normalize whitespace
      
      // Functions that always return empty array (no comment needed - code pattern)
      if (/function\s+\w+(?:Data|List|Items|Results|Records|Users)\w*\s*\([^)]*\)\s*\{[^}]*return\s+\[\]\s*;?\s*\}/gi.test(trimmedLineForCode)) {
        const todoItem = addGitInfoToTodoItem({
          file,
          line: lineNumber,
          type: "EMPTY_RETURN_PATTERN",
          text: trimmedLine,
          priority: categorizeTodo(trimmedLine, "EMPTY_RETURN", "HIGH"),
          category: "incomplete",
          source: "code_pattern"
        }, file, lineNumber)
        todos.incomplete.push(todoItem)
        todos.byCategory.incomplete.push(todoItem)
        matched = true
      }
      
      // Functions that always return empty object
      if (/function\s+\w+(?:Data|Result|Response|Object|Config)\w*\s*\([^)]*\)\s*\{[^}]*return\s+\{\}\s*;?\s*\}/gi.test(trimmedLineForCode)) {
        const todoItem = addGitInfoToTodoItem({
          file,
          line: lineNumber,
          type: "EMPTY_RETURN_PATTERN",
          text: trimmedLine,
          priority: categorizeTodo(trimmedLine, "EMPTY_RETURN", "HIGH"),
          category: "incomplete",
          source: "code_pattern"
        }, file, lineNumber)
        todos.incomplete.push(todoItem)
        todos.byCategory.incomplete.push(todoItem)
        matched = true
      }
      
      // Async functions that immediately resolve (no-op async)
      if (/async\s+function\s+\w+\s*\([^)]*\)\s*\{[^}]*return\s+Promise\.resolve/gi.test(trimmedLineForCode)) {
        const todoItem = addGitInfoToTodoItem({
          file,
          line: lineNumber,
          type: "NO_OP_ASYNC",
          text: trimmedLine,
          priority: categorizeTodo(trimmedLine, "NO_OP_ASYNC", "HIGH"),
          category: "incomplete",
          source: "code_pattern"
        }, file, lineNumber)
        todos.incomplete.push(todoItem)
        todos.byCategory.incomplete.push(todoItem)
        matched = true
      }
      
      // Validation functions that always return true/false (no validation logic)
      if (/function\s+(?:validate|check|verify|isValid|canAccess|hasPermission)\w*\s*\([^)]*\)\s*\{[^}]*return\s+(?:true|false)\s*;?\s*\}/gi.test(trimmedLineForCode)) {
        const todoItem = addGitInfoToTodoItem({
          file,
          line: lineNumber,
          type: "ALWAYS_RETURNS_BOOLEAN",
          text: trimmedLine,
          priority: categorizeTodo(trimmedLine, "ALWAYS_RETURNS", "HIGH"),
          category: "incomplete",
          source: "code_pattern"
        }, file, lineNumber)
        todos.incomplete.push(todoItem)
        todos.byCategory.incomplete.push(todoItem)
        matched = true
      }
      
      if (matched) return // Skip other checks if code pattern found

      // 5. Check for commented out code patterns (TOP BLOCKER)
      // Only flag actual executable code, not documentation
      for (const pattern of commentedCodePatterns) {
        if (pattern.test(line) && !isDocumentationComment(line)) {
          const todoItem = addGitInfoToTodoItem({
            file,
            line: lineNumber,
            type: "COMMENTED_OUT_CODE",
            text: trimmedLine,
            priority: 1, // Always blocker priority for commented code
            category: "commented_code",
            source: "commented_code"
          }, file, lineNumber)
          todos.commented_code.push(todoItem)
          todos.byCategory.commented_code.push(todoItem)
          todos.critical.push(todoItem) // Add to critical since it's a blocker

          matched = true
          break // Only match first pattern
        }
      }
    })
  })
  log(`✅ Processed ${processedCount} files (excluded ${codeFiles.length - processedCount})`)
}

// Run comprehensive analysis
scanCodeComprehensive()

const scanDuration = Date.now() - scanStartTime
log(`⏱️  Scan completed in ${(scanDuration / 1000).toFixed(2)} seconds`)

// Transfer items from todos to analysis.byPriority for reporting
log("🔄 Transferring items to priority buckets...")
// Priority mapping: 1=blocker, 2=critical, 3=high→major, 4=medium→minor
analysis.byPriority.blocker = [...todos.critical, ...todos.high, ...todos.medium, ...todos.low].filter(item => item.priority === 1)
analysis.byPriority.critical = [...todos.critical, ...todos.high, ...todos.medium, ...todos.low].filter(item => item.priority === 2)
analysis.byPriority.major = [...todos.critical, ...todos.high, ...todos.medium, ...todos.low].filter(item => item.priority === 3)
analysis.byPriority.minor = [...todos.critical, ...todos.high, ...todos.medium, ...todos.low].filter(item => item.priority === 4)

// LEARNING FUNCTIONS (from profitpilot version)
function learnFromAnalysis() {
  log("🧠 Learning from analysis results...")

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

  log(`  - Analysis stored for future pattern improvement`)
  log(`  - Current learning rate: ${learningRate}% actionable tasks`)
}

function checkForMissedCriticalIssues() {
  log("🔍 Checking for potentially missed critical issues...")

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

  log(`  - Potentially missed critical issues: ${potentiallyMissed.length}`)

  if (potentiallyMissed.length > 0) {
    log("\n⚠️  POTENTIALLY MISSED CRITICAL ISSUES:")
    for (const missed of potentiallyMissed.slice(0, 5)) {
      log(`  - ${missed.issue.file}:${missed.issue.line} - ${missed.pattern} (${missed.severity})`)
    }
    if (potentiallyMissed.length > 5) {
      log(`  - ... and ${potentiallyMissed.length - 5} more issues`)
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

// === FILTERING FUNCTIONS ===

// Filter issues by priority and category
function filterIssues(issues, priorityFilter, categoryFilter) {
  return issues.filter(issue => {
    // Priority filter
    if (priorityFilter !== 'all') {
      const issuePriority = issue.priority === 1 ? 'blocker' :
                           issue.priority === 2 ? 'critical' :
                           issue.priority === 3 ? 'major' : 'minor'
      if (issuePriority !== priorityFilter) {
        return false
      }
    }
    
    // Category filter
    if (categoryFilter !== 'all') {
      if (issue.category !== categoryFilter) {
        return false
      }
    }
    
    return true
  })
}

// Apply filters to all issue collections
function applyFilters() {
  if (priorityFilter !== 'all' || categoryFilter !== 'all') {
    todos.explicit = filterIssues(todos.explicit, priorityFilter, categoryFilter)
    todos.deceptive = filterIssues(todos.deceptive, priorityFilter, categoryFilter)
    todos.temporary = filterIssues(todos.temporary, priorityFilter, categoryFilter)
    todos.incomplete = filterIssues(todos.incomplete, priorityFilter, categoryFilter)
    todos.commented_code = filterIssues(todos.commented_code, priorityFilter, categoryFilter)
    
    // Rebuild priority buckets
    todos.critical = []
    todos.high = []
    todos.medium = []
    todos.low = []
    
    const allFiltered = [...todos.explicit, ...todos.deceptive, ...todos.temporary, ...todos.incomplete, ...todos.commented_code]
    allFiltered.forEach(item => {
      switch (item.priority) {
        case 1: todos.critical.push(item); break
        case 2: todos.high.push(item); break
        case 3: todos.medium.push(item); break
        case 4: todos.low.push(item); break
      }
    })
    
    // Rebuild category buckets
    todos.byCategory = {
      temporal: todos.deceptive.filter(i => i.category === 'temporal'),
      incomplete: [...todos.incomplete, ...todos.deceptive.filter(i => i.category === 'incomplete')],
      deceptive: todos.deceptive.filter(i => i.category === 'deceptive'),
      technical_debt: todos.deceptive.filter(i => i.category === 'technical_debt'),
      explicit: todos.explicit,
      temporary: todos.temporary,
      commented_code: todos.commented_code
    }
    
    // Rebuild priority analysis buckets
    analysis.byPriority.blocker = allFiltered.filter(item => item.priority === 1)
    analysis.byPriority.critical = allFiltered.filter(item => item.priority === 2)
    analysis.byPriority.major = allFiltered.filter(item => item.priority === 3)
    analysis.byPriority.minor = allFiltered.filter(item => item.priority === 4)
  }
}

// === FORMATTER FUNCTIONS ===

// Generate JSON report
function generateJSONReport() {
  const allIssues = [...todos.explicit, ...todos.deceptive, ...todos.temporary, ...todos.incomplete, ...todos.commented_code]
  
  return JSON.stringify({
    metadata: {
      timestamp: timestamp,
      date: dateOnly,
      format: 'json',
      version: '1.0.0'
    },
    summary: {
      total: allIssues.length,
      bySource: {
        explicit: todos.explicit.length,
        deceptive: todos.deceptive.length,
        temporary: todos.temporary.length,
        incomplete: todos.incomplete.length,
        commented_code: todos.commented_code.length
      },
      byPriority: {
        blocker: analysis.byPriority.blocker.length,
        critical: analysis.byPriority.critical.length,
        major: analysis.byPriority.major.length,
        minor: analysis.byPriority.minor.length
      },
      byCategory: {
        temporal: todos.byCategory.temporal.length,
        incomplete: todos.byCategory.incomplete.length,
        deceptive: todos.byCategory.deceptive.length,
        technical_debt: todos.byCategory.technical_debt.length,
        explicit: todos.byCategory.explicit.length,
        temporary: todos.byCategory.temporary.length,
        commented_code: todos.byCategory.commented_code.length
      }
    },
    filters: {
      priority: priorityFilter,
      category: categoryFilter
    },
    issues: allIssues.map(issue => ({
      file: issue.file,
      line: issue.line,
      type: issue.type,
      text: issue.text,
      priority: issue.priority === 1 ? 'blocker' : issue.priority === 2 ? 'critical' : issue.priority === 3 ? 'major' : 'minor',
      category: issue.category,
      severity: issue.severity || 'MEDIUM',
      source: issue.source,
      guidance: getIssueGuidance(issue.type),
      ...(issue.blame ? { blame: issue.blame } : {}),
      ...(issue.age ? { age: issue.age } : {})
    })),
    blockers: analysis.byPriority.blocker.map(issue => ({
      file: issue.file,
      line: issue.line,
      type: issue.type,
      text: issue.text
    })),
    critical: analysis.byPriority.critical.map(issue => ({
      file: issue.file,
      line: issue.line,
      type: issue.type,
      text: issue.text
    }))
  }, null, 2)
}

// Generate table report (console only)
function generateTableReport() {
  const allIssues = [...todos.explicit, ...todos.deceptive, ...todos.temporary, ...todos.incomplete, ...todos.commented_code]
  
  if (allIssues.length === 0) {
    return "✅ No issues found!\n"
  }
  
  let table = "\n📊 TODO Tracker Results\n"
  table += "=".repeat(100) + "\n\n"
  
  // Summary section
  table += "SUMMARY:\n"
  table += `  Total Issues: ${allIssues.length}\n`
  table += `  Blockers: ${analysis.byPriority.blocker.length}\n`
  table += `  Critical: ${analysis.byPriority.critical.length}\n`
  table += `  Major: ${analysis.byPriority.major.length}\n`
  table += `  Minor: ${analysis.byPriority.minor.length}\n\n`
  
  // Top issues table
  table += "TOP ISSUES:\n"
  table += "-".repeat(100) + "\n"
  table += "Priority | File | Line | Type | Text\n"
  table += "-".repeat(100) + "\n"
  
  // Show top 20 issues
  const topIssues = allIssues
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 20)
  
  topIssues.forEach(issue => {
    const priority = issue.priority === 1 ? 'BLOCKER' : issue.priority === 2 ? 'CRITICAL' : issue.priority === 3 ? 'MAJOR' : 'MINOR'
    const fileShort = issue.file.length > 40 ? '...' + issue.file.slice(-37) : issue.file
    const textShort = issue.text.length > 50 ? issue.text.slice(0, 47) + '...' : issue.text
    table += `${priority.padEnd(8)} | ${fileShort.padEnd(40)} | ${String(issue.line).padEnd(4)} | ${issue.type.padEnd(20)} | ${textShort}\n`
  })
  
  if (allIssues.length > 20) {
    table += `\n... and ${allIssues.length - 20} more issues\n`
  }
  
  table += "\n" + "=".repeat(100) + "\n"
  
  return table
}

// Calculate totals
const totalIssues = todos.explicit.length + todos.deceptive.length + todos.temporary.length + todos.incomplete.length + todos.commented_code.length

// Apply filters before generating report
applyFilters()

// Recalculate totals after filtering
const filteredTotalIssues = todos.explicit.length + todos.deceptive.length + todos.temporary.length + todos.incomplete.length + todos.commented_code.length

// Generate comprehensive report
report += `## Comprehensive Issue Analysis Results

**Total Issues Found:** ${filteredTotalIssues}${priorityFilter !== 'all' || categoryFilter !== 'all' ? ` (filtered from ${totalIssues} total)` : ''}
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

// Add blocker issues section (from profitpilot version) - skip if summary only
if (!summaryOnly && analysis.byPriority.blocker.length > 0) {
  report += `## 🚫 Blocker Issues (${analysis.byPriority.blocker.length})\n\n`
  analysis.byPriority.blocker.forEach((item, idx) => {
    report += `${idx + 1}. **${item.file}:${item.line}** (${item.type})\n`
    report += `   \`${item.text}\`\n`
    if (item.blame) {
      report += `   *Author: ${item.blame.author} | Date: ${item.blame.date}*\n`
    }
    if (item.age) {
      report += `   *Age: ${item.age}*\n`
    }
    report += `   *Priority: Blocker | Impact: ${priorityLevels.blocker.impact}*\n\n`
  })
}

// Add critical issues section - skip if summary only
if (!summaryOnly && analysis.byPriority.critical.length > 0) {
  report += `## 🚨 Critical Issues (${analysis.byPriority.critical.length})\n\n`
  todos.critical.forEach((item, idx) => {
    report += `${idx + 1}. **${item.file}:${item.line}** (${item.type})\n`
    report += `   \`${item.text}\`\n`
    if (item.blame) {
      report += `   *Author: ${item.blame.author} | Date: ${item.blame.date}*\n`
    }
    if (item.age) {
      report += `   *Age: ${item.age}*\n`
    }
    report += `   *Priority: Critical | Category: ${item.category} | Source: ${item.source}*\n\n`
  })
}

// Add high priority issues with concise actions - skip if summary only
if (!summaryOnly && todos.high.length > 0) {
  report += `## 🎯 High Priority Issues\n\n`

  // Show top 20 issues with concise file listings
  todos.high.slice(0, 20).forEach((item, idx) => {
    const guidance = getIssueGuidance(item.type)
    report += `${idx + 1}. **${item.file}:${item.line}** (${item.type})\n`
    report += `   \`${item.text}\`\n`
    if (item.blame) {
      report += `   *Author: ${item.blame.author}*\n`
    }
    if (item.age) {
      report += `   *Age: ${item.age}*\n`
    }
    report += `   *${guidance}*\n\n`
  })

  if (todos.high.length > 20) {
    report += `... and ${todos.high.length - 20} more high priority issues\n\n`
  }
}

// Add debugging statements section (only if --debug flag was used) - skip if summary only
if (!summaryOnly && includeDebug && todos.debugging && todos.debugging.length > 0) {
  report += `## 🐛 Debugging Statements to Remove (${todos.debugging.length})\n\n`
  todos.debugging.slice(0, 10).forEach((item, idx) => {
    report += `${idx + 1}. **${item.file}:${item.line}**\n`
    report += `   \`${item.text}\`\n\n`
  })
  if (todos.debugging.length > 10) {
    report += `... and ${todos.debugging.length - 10} more debugging statements\n\n`
  }
}

// Add category guidance with one-liners - skip if summary only
if (!summaryOnly) {
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
  } // End of summary-only check

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

if (includeDebug && todos.debugging && todos.debugging.length > 0) {
  report += `- **${todos.debugging.length} debugging statements** should be removed for production\n`
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

// Generate output based on format
let outputContent
if (outputFormat === 'json') {
  outputContent = generateJSONReport()
} else if (outputFormat === 'table') {
  outputContent = generateTableReport()
  // Table format: print to console, don't write file
  log(outputContent)
  if (reportFile) {
    // If output path specified, write markdown summary instead
    fs.writeFileSync(reportFile, report)
    log(`📄 Summary report saved: ${reportFile}`)
  }
  // Exit early for table format (console only)
  // Use exit code logic below
} else {
  // Markdown format (default)
  outputContent = report
}

// Write report to file (unless table format)
if (reportFile && outputFormat !== 'table') {
  fs.writeFileSync(reportFile, outputContent)
}

// Console summary with enhanced details
log("\n✅ Comprehensive TODO Analysis Complete!")
if (reportFile && outputFormat !== 'table') {
  log(`📄 Report saved: ${reportFile}`)
}
if (priorityFilter !== 'all' || categoryFilter !== 'all') {
  log(`🔍 Filters applied: priority=${priorityFilter}, category=${categoryFilter}`)
  log(`📊 Filtered results: ${filteredTotalIssues} issues (from ${totalIssues} total)`)
}
log("\n📊 Comprehensive Summary:")

// Show breakdown by source
log(`\n🔍 Detection Sources:`)
log(`   Explicit TODOs: ${todos.explicit.length}`)
log(`   Deceptive Language: ${todos.deceptive.length}`)
log(`   Temporary Code: ${todos.temporary.length}`)
log(`   Incomplete Implementation: ${todos.incomplete.length}`)
log(`   Commented Out Code: ${todos.commented_code.length}`)
log(`   **TOTAL: ${filteredTotalIssues}**`)

// Show priority breakdown
log(`\n🎯 Priority Breakdown:`)
log(`   Blockers: ${analysis.byPriority.blocker.length} (${priorityLevels.blocker.impact})`)
log(`   Critical: ${analysis.byPriority.critical.length} (${priorityLevels.critical.impact})`)
log(`   Major: ${analysis.byPriority.major.length} (${priorityLevels.major.impact})`)
log(`   Minor: ${analysis.byPriority.minor.length} (${priorityLevels.minor.impact})`)

// Show category breakdown
log(`\n📂 Category Breakdown:`)
log(`   Temporal: ${todos.byCategory.temporal.length}`)
log(`   Incomplete: ${todos.byCategory.incomplete.length}`)
log(`   Deceptive: ${todos.byCategory.deceptive.length}`)
log(`   Technical Debt: ${todos.byCategory.technical_debt.length}`)
log(`   Explicit: ${todos.byCategory.explicit.length}`)
log(`   Temporary: ${todos.byCategory.temporary.length}`)
log(`   Commented Code: ${todos.byCategory.commented_code.length} (TOP BLOCKER)`)

if (analysis.byPriority.blocker.length > 0) {
  log("\n🚫 BLOCKER ISSUES FOUND:")
  analysis.byPriority.blocker.slice(0, 3).forEach((item, idx) => {
    log(`   ${idx + 1}. ${item.file}:${item.line} - ${item.type}`)
  })
} else if (analysis.byPriority.critical.length > 0) {
  log("\n🚨 CRITICAL ISSUES FOUND:")
  analysis.byPriority.critical.slice(0, 3).forEach((item, idx) => {
    log(`   ${idx + 1}. ${item.file}:${item.line} - ${item.type}`)
  })
}

const debugStatements = todos.temporary.filter(
  (item) =>
    item.text.includes("console.log") ||
    item.text.includes("console.error") ||
    item.text.includes("debugger") ||
    item.text.includes("alert(")
)

if (includeDebug && debugStatements.length > 0) {
  log(`\n🐛 DEBUGGING STATEMENTS: ${debugStatements.length} found`)
}

if (filteredTotalIssues === 0) {
  log("\n✅ Codebase is clean - no issues found!")
} else if (analysis.byPriority.blocker.length === 0 && analysis.byPriority.critical.length === 0) {
  log("\n✅ No blocking issues - ready for development workflow")
} else if (analysis.byPriority.blocker.length > 0) {
  log("\n🚫 Blocker issues require immediate attention")
} else {
  log("\n⚠️ Critical issues require attention before production")
}

if (reportFile && outputFormat !== 'table') {
  log(`\n📋 Full comprehensive report: ${reportFile}`)
}

// === EXIT CODE LOGIC ===

// Check max-issues limit
if (maxIssues !== null && filteredTotalIssues > maxIssues) {
  if (!noConsole) {
    console.error(`❌ Error: Found ${filteredTotalIssues} issues, exceeds limit of ${maxIssues}`)
  }
  process.exit(1)
}

// Check max-blockers limit
if (maxBlockers !== null && analysis.byPriority.blocker.length > maxBlockers) {
  if (!noConsole) {
    console.error(`❌ Error: Found ${analysis.byPriority.blocker.length} blockers, exceeds limit of ${maxBlockers}`)
  }
  process.exit(1)
}

// Determine exit code based on --exit-code flag
let exitCode = 0
if (exitCodeLevel === 'never') {
  exitCode = 0
} else if (exitCodeLevel === 'all') {
  exitCode = filteredTotalIssues > 0 ? 1 : 0
} else if (exitCodeLevel === 'critical') {
  exitCode = (analysis.byPriority.blocker.length > 0 || analysis.byPriority.critical.length > 0) ? 1 : 0
} else { // 'blocker' (default)
  exitCode = analysis.byPriority.blocker.length > 0 ? 1 : 0
}

process.exit(exitCode)
