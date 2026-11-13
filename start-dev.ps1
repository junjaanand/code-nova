Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "🚀 Starting BrandShield AI Development Stack..." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

$env:PYTHONPATH = "d:\nova"

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\nova'; `$env:PYTHONPATH='d:\nova'; python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\nova\apps\web'; npm run dev"

Write-Host "Backend API:  http://localhost:8000 (Swagger: http://localhost:8000/docs)" -ForegroundColor Yellow
Write-Host "Frontend Web: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Stack launched in separate terminal windows!" -ForegroundColor Green
