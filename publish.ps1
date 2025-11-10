# SkillKit Publish Script
# Run this script to publish @trinity-os/skillkit to npm

Write-Host "=== SkillKit Publishing ===" -ForegroundColor Cyan
Write-Host ""

# Check if logged in
Write-Host "Checking npm login status..." -ForegroundColor Yellow
$npmUser = npm whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to npm" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login first:" -ForegroundColor Yellow
    Write-Host "  npm login" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Logged in as: $npmUser" -ForegroundColor Green
Write-Host ""

# Check org access
Write-Host "Checking org access..." -ForegroundColor Yellow
$orgMembers = npm org ls trinity-os 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Could not verify org membership" -ForegroundColor Yellow
    Write-Host "   Make sure you're a member of 'trinity-os' org" -ForegroundColor Gray
} else {
    Write-Host "✅ Org access verified" -ForegroundColor Green
}
Write-Host ""

# Check if package exists
Write-Host "Checking if package exists..." -ForegroundColor Yellow
$packageInfo = npm view @trinity-os/skillkit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "⚠️  Package already exists on npm" -ForegroundColor Yellow
    $version = npm view @trinity-os/skillkit version 2>&1
    Write-Host "   Current version: $version" -ForegroundColor Gray
    Write-Host ""
    $confirm = Read-Host "Continue with publish? (y/n)"
    if ($confirm -ne 'y') {
        Write-Host "Publish cancelled" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✅ Package doesn't exist yet (first publish)" -ForegroundColor Green
}
Write-Host ""

# Build check
Write-Host "Checking build..." -ForegroundColor Yellow
if (Test-Path "dist/cli.js") {
    Write-Host "✅ Build exists" -ForegroundColor Green
} else {
    Write-Host "❌ Build missing! Running build..." -ForegroundColor Red
    pnpm build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Final confirmation
Write-Host "Ready to publish:" -ForegroundColor Cyan
Write-Host "  Package: @trinity-os/skillkit" -ForegroundColor White
Write-Host "  Version: 0.0.1" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Publish to npm? (y/n)"
if ($confirm -ne 'y') {
    Write-Host "Publish cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Publishing..." -ForegroundColor Yellow
npm publish --access public

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Published successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verify:" -ForegroundColor Cyan
    Write-Host "  npm view @trinity-os/skillkit" -ForegroundColor White
    Write-Host "  npm install -g @trinity-os/skillkit" -ForegroundColor White
    Write-Host "  tsk --version" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Publish failed!" -ForegroundColor Red
    Write-Host "Check the error above" -ForegroundColor Yellow
    exit 1
}

