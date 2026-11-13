@echo off
echo ==================================================
echo Starting BrandShield AI Development Stack...
echo ==================================================

set PYTHONPATH=d:\nova

start "BrandShield Backend API (FastAPI)" cmd /k "cd /d d:\nova && set PYTHONPATH=d:\nova && python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload"
start "BrandShield Frontend (Next.js 15)" cmd /k "cd /d d:\nova\apps\web && npm run dev"

echo Backend API:  http://localhost:8000 (Swagger: http://localhost:8000/docs)
echo Frontend Web: http://localhost:3000
echo Stack launched in separate windows!
pause
