# Planasia — first-time project setup (Windows PowerShell)
# Usage: .\scripts\setup.ps1

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Host ""
Write-Host "=== Planasia setup ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env.local")) {
  Copy-Item ".env.example" ".env.local"
  Write-Host "[1/4] Created .env.local from .env.example" -ForegroundColor Green
} else {
  Write-Host "[1/4] .env.local already exists (skipped)" -ForegroundColor Yellow
}

Write-Host "[2/4] Installing npm dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "[3/4] Supabase (required before full app works)" -ForegroundColor Cyan
Write-Host "  1. Create a NEW project: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "  2. Settings -> API: copy URL, anon key, service_role key into .env.local" -ForegroundColor White
Write-Host "  3. SQL Editor: run migrations in order:" -ForegroundColor White
Get-ChildItem "supabase\migrations\*.sql" | Sort-Object Name | ForEach-Object {
  Write-Host "       - $($_.Name)" -ForegroundColor DarkGray
}
Write-Host "  4. Test: node scripts/test-supabase.mjs" -ForegroundColor White

Write-Host ""
Write-Host "[4/4] Optional keys in .env.local" -ForegroundColor Cyan
Write-Host "  GEMINI_API_KEY       AI plans + chat (template mode without it)" -ForegroundColor DarkGray
Write-Host "  GOOGLE_CLIENT_*      Google OAuth sign-in" -ForegroundColor DarkGray
Write-Host "  STRIPE_*             Live payments" -ForegroundColor DarkGray
Write-Host "  ADMIN_EMAILS         Production admin whitelist" -ForegroundColor DarkGray

Write-Host ""
Write-Host "Start dev server:" -ForegroundColor Green
Write-Host "  .\scripts\dev.ps1" -ForegroundColor White
Write-Host "  -> http://localhost:3000" -ForegroundColor White
Write-Host "  -> http://localhost:3000/admin (dev login enabled in .env.example)" -ForegroundColor White
Write-Host ""
