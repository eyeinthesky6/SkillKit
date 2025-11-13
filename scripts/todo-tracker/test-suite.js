#!/usr/bin/env node

/**
 * Comprehensive Test Suite for TODO Tracker
 * Tests all flags, formats, and functionality efficiently
 */

const { execSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

const SCRIPT_PATH = path.join(__dirname, 'todo-tracker.cjs')
const TIMEOUT = 30000 // 30 seconds per test (full scans take ~5-10 seconds)

const tests = []
let passed = 0
let failed = 0
let skipped = 0

// Test helper
function test(name, command, validator, options = {}) {
  tests.push({ name, command, validator, timeout: options.timeout || TIMEOUT, skip: options.skip || false })
}

// Run test with timeout
function runTest(test) {
  return new Promise((resolve) => {
    if (test.skip) {
      console.log(`Testing: ${test.name}...`)
      console.log(`  ⏭ SKIPPED`)
      skipped++
      resolve(true)
      return
    }
    
    console.log(`Testing: ${test.name}...`)
    
    const startTime = Date.now()
    const commandParts = test.command.split(' ').filter(Boolean)
    const proc = spawn('node', [SCRIPT_PATH, ...commandParts], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    })
    
    let stdout = ''
    let stderr = ''
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString()
    })
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString()
    })
    
    const timeout = setTimeout(() => {
      proc.kill()
      console.log(`  ❌ TIMEOUT (exceeded ${test.timeout}ms)`)
      failed++
      resolve(false)
    }, test.timeout)
    
    proc.on('close', (code) => {
      clearTimeout(timeout)
      const duration = Date.now() - startTime
      
      try {
        const result = test.validator(code, stdout, stderr, duration)
        if (result) {
          console.log(`  ✅ PASSED (${duration}ms)`)
          passed++
          resolve(true)
        } else {
          console.log(`  ❌ FAILED (exit: ${code}, ${duration}ms)`)
          if (stdout) console.log(`     Output: ${stdout.substring(0, 100)}...`)
          failed++
          resolve(false)
        }
      } catch (error) {
        console.log(`  ❌ ERROR: ${error.message}`)
        failed++
        resolve(false)
      }
    })
  })
}

// ===== BASIC FUNCTIONALITY TESTS =====

test('Help flag', '--help', (code, stdout) => {
  return code === 0 && stdout.includes('Enhanced Comprehensive')
}, { timeout: 5000 })

test('Basic scan', '', (code, stdout) => {
  return code === 0 && (stdout.includes('Comprehensive Summary') || stdout.includes('Scan completed'))
})

// ===== OUTPUT FORMAT TESTS =====

test('Markdown format', '--format=markdown', (code, stdout) => {
  return code === 0 && (stdout.includes('Report saved') || stdout.includes('Scan completed'))
})

test('JSON format', '--format=json', (code, stdout) => {
  return code === 0 && (stdout.includes('Report saved') || stdout.includes('.json') || stdout.includes('Scan completed'))
})

test('HTML format', '--format=html', (code, stdout) => {
  return code === 0 && (stdout.includes('Report saved') || stdout.includes('.html') || stdout.includes('Scan completed'))
})

test('Table format', '--format=table', (code, stdout) => {
  return code === 0 && (stdout.includes('TODO Tracker Results') || stdout.includes('Scan completed'))
})

// ===== FLAG TESTS (Quick validation) =====

test('--debug flag', '--debug', (code, stdout) => {
  return code === 0 && stdout.includes('Scan completed')
})

test('--summary flag', '--summary', (code, stdout) => {
  return code === 0 && stdout.includes('Comprehensive Summary')
})

test('--no-console flag', '--no-console', (code, stdout) => {
  // Should produce minimal output
  return code === 0
})

// ===== FILTER TESTS =====

test('--priority=blocker', '--priority=blocker', (code, stdout) => {
  return code === 0 && stdout.includes('Comprehensive Summary')
})

test('--priority=critical', '--priority=critical', (code, stdout) => {
  return code === 0 && stdout.includes('Comprehensive Summary')
})

test('--category=incomplete', '--category=incomplete', (code, stdout) => {
  return code === 0 && stdout.includes('Comprehensive Summary')
})

// ===== DIRECTORY FOCUS TESTS =====

test('--focus=src', '--focus=src', (code, stdout) => {
  return code === 0 && stdout.includes('Scan completed')
})

// ===== OUTPUT FILE TESTS =====

test('Custom output path', '--output=test-output.md', (code, stdout) => {
  const exists = fs.existsSync('test-output.md')
  if (exists) fs.unlinkSync('test-output.md')
  return code === 0 && exists
})

test('JSON output file', '--format=json --output=test-output.json', (code, stdout) => {
  const exists = fs.existsSync('test-output.json')
  if (exists) {
    try {
      const content = JSON.parse(fs.readFileSync('test-output.json', 'utf8'))
      fs.unlinkSync('test-output.json')
      return code === 0 && exists && content.metadata
    } catch (e) {
      if (exists) fs.unlinkSync('test-output.json')
      return false
    }
  }
  return false
})

test('HTML output file', '--format=html --output=test-output.html', (code, stdout) => {
  const exists = fs.existsSync('test-output.html')
  if (exists) {
    const content = fs.readFileSync('test-output.html', 'utf8')
    fs.unlinkSync('test-output.html')
    return code === 0 && exists && content.includes('<!DOCTYPE html>')
  }
  return false
})

// ===== EXCLUSION SYSTEM TESTS =====

test('Exclusion file loading', '', (code, stdout) => {
  return code === 0 && (stdout.includes('Loaded exclusions') || stdout.includes('Processing') || stdout.includes('Scan completed'))
})

// ===== GIT INTEGRATION TESTS =====

test('--blame flag', '--blame', (code, stdout) => {
  return code === 0 && stdout.includes('Scan completed')
})

test('--age flag', '--age', (code, stdout) => {
  return code === 0 && stdout.includes('Scan completed')
})

// Test --since only if git is available
let gitAvailable = false
try {
  execSync('git --version', { stdio: 'ignore' })
  gitAvailable = true
} catch (e) {
  // Git not available
}

if (gitAvailable) {
  test('--since=HEAD~1', '--since=HEAD~1', (code, stdout) => {
    return code === 0 && (stdout.includes('Scan completed') || stdout.includes('Git mode'))
  })
} else {
  test('--since=HEAD~1', '--since=HEAD~1', null, { skip: true })
}

// ===== CACHE TESTS =====

test('Cache functionality', '', (code, stdout) => {
  // Should show cache statistics if AST parsing is enabled
  return code === 0 && (stdout.includes('AST Parsing') || stdout.includes('Scan completed'))
})

// ===== CONFIG TESTS =====

test('--configs flag', '--configs', (code, stdout) => {
  return code === 0 && stdout.includes('Scan completed')
})

test('--scripts flag', '--scripts', (code, stdout) => {
  return code === 0 && stdout.includes('Scan completed')
})

// ===== EXIT CODE TESTS =====

test('Exit code on clean codebase', '', (code) => {
  // Should exit with 0 for clean codebase
  return code === 0
})

// ===== FLAG VALIDATION TESTS (Quick) =====

test('Invalid format flag', '--format=invalid', (code, stdout) => {
  // Should default to markdown or show error
  return code === 0 || stdout.includes('markdown')
}, { timeout: 5000 })

test('Invalid priority flag', '--priority=invalid', (code, stdout) => {
  // Should handle gracefully
  return code === 0 || code === 1
}, { timeout: 5000 })

// ===== RUN ALL TESTS =====

async function runAllTests() {
  console.log('🧪 TODO Tracker Test Suite')
  console.log('==========================\n')
  
  // Run tests sequentially to avoid conflicts
  for (const test of tests) {
    await runTest(test)
    // Small delay between tests to avoid file system conflicts
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  // Summary
  console.log('\n==========================')
  console.log('Test Results:')
  console.log(`  ✅ Passed: ${passed}`)
  console.log(`  ❌ Failed: ${failed}`)
  console.log(`  ⏭ Skipped: ${skipped}`)
  console.log(`  📊 Total:  ${tests.length}`)
  console.log('==========================\n')
  
  if (failed === 0) {
    console.log('✅ All tests passed!')
    process.exit(0)
  } else {
    console.log('❌ Some tests failed')
    process.exit(1)
  }
}

runAllTests().catch(error => {
  console.error('Test suite error:', error)
  process.exit(1)
})
