@echo off
title AgriGuard AI - Frontend Web App
echo ========================================================
echo Starting AgriGuard AI Frontend (React + Vite)
echo ========================================================

cd /d "%~dp0"
if exist "%~dp0frontend" cd /d "%~dp0frontend"

if not exist "node_modules" goto :no_modules

echo.
echo Starting Vite development server...
echo Frontend UI URL: http://localhost:5173
echo.

call npm run dev
goto :end

:no_modules
echo [INFO] node_modules not found. Running npm install...
call npm install
call npm run dev

:end
