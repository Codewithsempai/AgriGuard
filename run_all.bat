@echo off
title AgriGuard AI - Full Stack Launcher

if "%~1"=="--new-window" goto :new_window

:: Run directly inside the current VS Code terminal (No popup windows)
powershell -ExecutionPolicy Bypass -File "%~dp0dev.ps1"
goto :end

:new_window
echo ========================================================
echo Launching AgriGuard AI in Separate Windows
echo ========================================================
echo [1/2] Launching Backend API (FastAPI) in new window...
start "AgriGuard Backend" cmd /k "call "%~dp0run_backend.bat""

echo [2/2] Launching Frontend Web App (Vite) in new window...
start "AgriGuard Frontend" cmd /k "call "%~dp0run_frontend.bat""

:end
