@echo off
REM Test SkillKit on Windows CMD
echo ========================================
echo Testing SkillKit on Windows CMD
echo ========================================
echo.

echo [1/6] Testing version command...
tsk --version
if %errorlevel% neq 0 (
    echo ERROR: Version command failed
    exit /b 1
)
echo.

echo [2/6] Testing init command...
cd /d %TEMP%
if exist skillkit-test-cmd rmdir /s /q skillkit-test-cmd
mkdir skillkit-test-cmd
cd skillkit-test-cmd
call npm init -y >nul 2>&1
tsk init --all
if %errorlevel% neq 0 (
    echo ERROR: Init command failed
    exit /b 1
)
echo.

echo [3/6] Verifying workflows created...
if not exist .cursor\commands\BEGIN_SESSION.md (
    echo ERROR: BEGIN_SESSION.md not found
    exit /b 1
)
echo Found BEGIN_SESSION.md
echo.

echo [4/6] Verifying subtasks created...
if not exist docs\workflows\subtasks (
    echo ERROR: Subtasks directory not found
    exit /b 1
)
echo Found subtasks directory
echo.

echo [5/6] Testing audit command...
tsk audit
if %errorlevel% neq 0 (
    echo WARNING: Audit command had issues (may be expected)
)
echo.

echo [6/6] Testing diagnose command...
tsk diagnose
if %errorlevel% neq 0 (
    echo WARNING: Diagnose command had issues (may be expected in empty project)
)
echo.

echo ========================================
echo CMD TEST COMPLETE
echo ========================================
cd /d %TEMP%
if exist skillkit-test-cmd rmdir /s /q skillkit-test-cmd

