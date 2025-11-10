@echo off
REM Post-Commit Hook: Auto-update AITracking logs (Windows CMD version)
REM This script runs automatically after every git commit

setlocal enabledelayedexpansion

REM Get commit info
for /f "tokens=*" %%i in ('git rev-parse --short HEAD') do set COMMIT_HASH=%%i
for /f "tokens=*" %%i in ('git log -1 --pretty=%%B') do set COMMIT_MSG=%%i
for /f "tokens=*" %%i in ('git log -1 --pretty=%%ci') do set COMMIT_DATE=%%i

REM Get today's date in DD-MM-YYYY format
for /f "tokens=1-3 delims=/- " %%a in ('date /t') do set TODAY=%%c-%%b-%%a
REM Fix format if needed (Windows date format varies)
set TODAY=%date:~-4%-%date:~3,2%-%date:~0,2%

REM Check if AITracking directory exists
set AITRACKING_DIR=docs\AITracking
if not exist "%AITRACKING_DIR%" (
    REM AITracking directory doesn't exist, skip silently
    exit /b 0
)

REM Find the most recent AITracking log from today
set LATEST_LOG=
for /f "delims=" %%f in ('dir /b /o-d "%AITRACKING_DIR%\AIAction_%TODAY%_*.md" 2^>nul') do (
    set LATEST_LOG=%AITRACKING_DIR%\%%f
    goto :found
)

REM If no log for today, try to find any recent log
for /f "delims=" %%f in ('dir /b /o-d "%AITRACKING_DIR%\AIAction_*.md" 2^>nul') do (
    set LATEST_LOG=%AITRACKING_DIR%\%%f
    goto :found
)

:found
if defined LATEST_LOG (
    REM Append commit info to the log
    (
        echo.
        echo ## 📦 Commit: %COMMIT_HASH%
        echo.
        echo **Message:** %COMMIT_MSG%
        echo **Date:** %COMMIT_DATE%
        echo.
    ) >> "%LATEST_LOG%"
    echo ✅ Updated AITracking: %LATEST_LOG%
) else (
    REM No log found, create a generic one
    set GENERIC_LOG=%AITRACKING_DIR%\AIAction_%TODAY%_auto_commit.md
    (
        echo # AI Action Log: Auto-Generated Commit Log
        echo.
        echo **Date:** %TODAY%
        echo **Task:** Auto-generated from git commit
        echo **Status:** ✅ Complete
        echo.
        echo ---
        echo.
        echo ## 📦 Commit: %COMMIT_HASH%
        echo.
        echo **Message:** %COMMIT_MSG%
        echo **Date:** %COMMIT_DATE%
        echo.
        echo ---
        echo.
        echo **Note:** This log was auto-generated. Consider creating a proper AITracking log for future commits.
        echo.
    ) > "%GENERIC_LOG%"
    echo ⚠️  Created generic AITracking log: %GENERIC_LOG%
)

endlocal
exit /b 0

