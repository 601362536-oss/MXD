@echo off
setlocal
cd /d "%~dp0"

netstat -ano | findstr /r /c:":5173 .*LISTENING" >nul
if errorlevel 1 (
  start "Maple Terminal Frontend" /min cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1"
  timeout /t 2 /nobreak >nul
)

start "" "http://127.0.0.1:5173/"
