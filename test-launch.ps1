# Launch test script for SkillKit v1.1 (PowerShell)

Write-Host "🚀 SkillKit v1.1 Launch Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Building..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Testing discover command..." -ForegroundColor Yellow
node dist/cli.js discover
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Discover failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Discover works" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Testing list-workflows..." -ForegroundColor Yellow
node dist/cli.js list-workflows
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ List workflows failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ List workflows works" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Testing explain..." -ForegroundColor Yellow
node dist/cli.js explain quality-gate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Explain failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Explain works" -ForegroundColor Green
Write-Host ""

Write-Host "Step 5: Testing suggest..." -ForegroundColor Yellow
node dist/cli.js suggest
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Suggest failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Suggest works" -ForegroundColor Green
Write-Host ""

Write-Host "Step 6: Testing Python project..." -ForegroundColor Yellow
Push-Location test-projects/python-project
node ../../dist/cli.js discover
$result = $LASTEXITCODE
Pop-Location
if ($result -ne 0) {
    Write-Host "❌ Python discover failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python project works" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 All tests passed!" -ForegroundColor Green
Write-Host "SkillKit v1.1 is ready to launch!" -ForegroundColor Green

