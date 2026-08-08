@echo off
setlocal
cd /d "%~dp0frontend"

echo Starting Maple Terminal frontend at http://127.0.0.1:5173/
npm run dev -- --host 127.0.0.1
