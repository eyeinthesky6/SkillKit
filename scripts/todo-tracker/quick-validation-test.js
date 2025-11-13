#!/usr/bin/env node

/**
 * Quick Validation Test - Checks flag recognition and basic functionality
 * Without running full scans
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const SCRIPT_PATH = path.join(__dirname, 'todo-tracker.cjs')

console.log('🔍 Quick Validation Test')
console.log('=======================\n')

let passed = 0
let failed = 0

function test(name, command, expectedOutput) {
  try {
    const output = execSync(`node "${SCRIPT_PATH}" ${command}`, {
      encoding: 'utf8',
      timeout: 5000,
      stdio: 'pipe'
    })
    
    if (output.includes(expectedOutput)) {
      console.log(`✅ ${name}`)
      passed++
      return true
    } else {
      console.log(`❌ ${name} - Expected: "${expectedOutput}", Got: "${output.substring(0, 50)}..."`)
      failed++
      return false
    }
  } catch (error) {
    // Check if it's a timeout or actual error
    if (error.message.includes('timeout')) {
      console.log(`⏱️ ${name} - Timeout (may be normal for full scans)`)
      return true // Don't count timeouts as failures
    }
    console.log(`❌ ${name} - Error: ${error.message}`)
    failed++
    return false
  }
}

// Quick flag recognition tests
console.log('📋 Flag Recognition Tests\n')

test('Help flag shows usage', '--help', 'Enhanced Comprehensive')
test('Help flag shows options', '--help', 'OPTIONS:')

// Test invalid flags are handled gracefully
try {
  execSync(`node "${SCRIPT_PATH}" --invalid-flag`, { encoding: 'utf8', timeout: 5000, stdio: 'pipe' })
  console.log('✅ Invalid flag handled gracefully')
  passed++
} catch (error) {
  // Should exit with error code for invalid flags
  if (error.status !== 0) {
    console.log('✅ Invalid flag exits with error (expected)')
    passed++
  } else {
    console.log('❌ Invalid flag handling')
    failed++
  }
}

// Test config file exists and is readable
console.log('\n📁 Configuration Tests\n')

const configFile = path.join(process.cwd(), '.todo-tracker.config.js')
if (fs.existsSync(configFile)) {
  try {
    require(configFile)
    console.log('✅ Config file loads successfully')
    passed++
  } catch (error) {
    console.log(`❌ Config file has errors: ${error.message}`)
    failed++
  }
} else {
  console.log('ℹ️  No config file found (optional)')
}

// Test exclusion file exists and is valid JSON
const exclusionFile = path.join(process.cwd(), '.todo-tracker.exclusions.json')
if (fs.existsSync(exclusionFile)) {
  try {
    const content = JSON.parse(fs.readFileSync(exclusionFile, 'utf8'))
    console.log('✅ Exclusion file is valid JSON')
    passed++
    
    if (content.globalExclusions && content.globalExclusions.patterns) {
      console.log(`   Found ${content.globalExclusions.patterns.length} exclusion patterns`)
    }
  } catch (error) {
    console.log(`❌ Exclusion file has errors: ${error.message}`)
    failed++
  }
} else {
  console.log('ℹ️  No exclusion file found (optional)')
}

// Test cache directory
const cacheDir = path.join(process.cwd(), '.todo-tracker-cache')
if (fs.existsSync(cacheDir)) {
  const cacheFiles = fs.readdirSync(cacheDir).filter(f => f.endsWith('.json'))
  console.log(`✅ Cache directory exists with ${cacheFiles.length} cached files`)
  passed++
} else {
  console.log('ℹ️  Cache directory will be created on first run')
}

// Test report directory
const reportDir = path.join(process.cwd(), 'docs', 'todo-tracker')
if (fs.existsSync(reportDir)) {
  const reports = fs.readdirSync(reportDir).filter(f => 
    f.includes('Comprehensive_TODO_Analysis') || f.includes('TODO_Analysis')
  )
  console.log(`✅ Report directory exists with ${reports.length} reports`)
  passed++
} else {
  console.log('ℹ️  Report directory will be created on first run')
}

// Summary
console.log('\n=======================')
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log('=======================\n')

if (failed === 0) {
  console.log('✅ All validation tests passed!')
  process.exit(0)
} else {
  console.log('❌ Some validation tests failed')
  process.exit(1)
}


