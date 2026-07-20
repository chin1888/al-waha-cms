@echo off
echo === AL-WAHA CMS - Push to GitHub ===
echo.

cd /d "C:\Users\Administrator\WorkBuddy\2026-07-15-10-13-35"

:: Configure git
git config user.email "chin1888@github.com"
git config user.name "chin1888"

:: Add all files
echo [1/3] Staging files...
git add -A

:: Check if we need to commit
git diff --cached --quiet
if errorlevel 1 (
    echo [2/3] Committing...
    git commit -m "AL-WAHA CMS - Full project"
) else (
    echo [2/3] Nothing to commit, already up to date
)

:: Push
echo [3/3] Pushing to GitHub...
git push -u origin master

echo.
echo === Done! ===
echo Check: https://github.com/chin1888/al-waha-cms
pause
