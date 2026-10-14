# AgriGuard AI - Run in Current VS Code Terminal (No new windows)
$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
if (-not (Test-Path "$scriptDir\backend")) {
    $scriptDir = "$PSScriptRoot\agriguard"
}

$backendDir = "$scriptDir\backend"
$frontendDir = "$scriptDir\frontend"
$pythonExe = "$backendDir\.venv\Scripts\python.exe"

Write-Host "========================================================" -ForegroundColor Green
Write-Host " Starting AgriGuard AI in Current VS Code Terminal" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green

Write-Host "[1/2] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
$backendProc = Start-Process -FilePath $pythonExe `
    -ArgumentList "-m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" `
    -WorkingDirectory $backendDir `
    -PassThru `
    -NoNewWindow

Write-Host "[2/2] Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Cyan
$frontendProc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npm run dev" `
    -WorkingDirectory $frontendDir `
    -PassThru `
    -NoNewWindow

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host " Both services are running INSIDE this terminal session!" -ForegroundColor Green
Write-Host " - Frontend UI: http://localhost:5173" -ForegroundColor White
Write-Host " - Backend API: http://localhost:8000" -ForegroundColor White
Write-Host " - Swagger UI:  http://localhost:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop both servers at any time.`n" -ForegroundColor Yellow

try {
    # Keep the script active in this terminal
    Wait-Process -Id $backendProc.Id, $frontendProc.Id
}
finally {
    Write-Host "`nShutting down AgriGuard services..." -ForegroundColor Red
    if ($backendProc -and -not $backendProc.HasExited) { Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue }
    if ($frontendProc -and -not $frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue }
    Get-Process -Name node, uvicorn -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "All services stopped." -ForegroundColor Gray
}
