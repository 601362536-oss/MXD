@echo off
setlocal
cd /d "%~dp0"

echo Starting Maple Terminal V2...
echo Backend:  http://127.0.0.1:8801
echo Frontend: http://127.0.0.1:5173

start "Maple Terminal Backend" /min cmd /k "cd /d %~dp0backend && python run.py"
timeout /t 2 /nobreak >nul
start "Maple Terminal Frontend" /min cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1"
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:5173/"

echo.
echo Website opened. Keep the two service windows running while using the site.
pause
