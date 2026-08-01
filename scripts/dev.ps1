# Planasia — start local dev server (Windows PowerShell)
# Usage: .\scripts\dev.ps1

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

if (-not (Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host "Created .env.local — edit ADMIN_EMAILS and SUPABASE_SERVICE_ROLE_KEY before admin save works." -ForegroundColor Yellow
}

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies..." -ForegroundColor Cyan
  npm install
}

Write-Host ""
Write-Host "Planasia dev server" -ForegroundColor Green
Write-Host "  Website:  http://localhost:3000" -ForegroundColor White
Write-Host "  Admin:    http://localhost:3000/admin" -ForegroundColor White
Write-Host "  Footer:   click 'ผู้ดูแลระบบ' on homepage" -ForegroundColor White
Write-Host ""

npm run dev
