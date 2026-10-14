@echo off
title AgriGuard AI - Backend Service
echo ========================================================
echo Starting AgriGuard AI Backend (FastAPI + Uvicorn)
echo ========================================================

cd /d "%~dp0"
if exist "%~dp0backend" cd /d "%~dp0backend"

if not exist ".venv\Scripts\python.exe" goto :no_venv

echo.
echo Virtual environment detected.
echo Backend API URL: http://localhost:8000
echo Swagger UI Docs: http://localhost:8000/docs
echo.

".venv\Scripts\python.exe" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
goto :end

:no_venv
echo [ERROR] Virtual environment (.venv) not found in backend directory!
echo Please make sure backend\.venv is created.
pause

:end
