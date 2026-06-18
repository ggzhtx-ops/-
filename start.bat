@echo off
cd /d "%~dp0"
echo Starting Lusion local preview...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do taskkill /F /PID %%a >nul 2>nul
start "Lusion local server" cmd /k node server.mjs
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080/about/?v=%RANDOM%%RANDOM%"
