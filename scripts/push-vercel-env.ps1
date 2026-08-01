# Push Planasia env vars to Vercel (production + preview)
# Usage: .\scripts\push-vercel-env.ps1 [-ProductionUrl "https://your-app.vercel.app"]
#
# Prerequisites:
#   1. npx vercel login   (or set VERCEL_TOKEN)
#   2. npx vercel link    (from project root, if not linked yet)
#   3. Fill .env.local with Supabase keys

param(
    [string]$ProductionUrl = "https://planasia.vercel.app"
)

$ErrorActionPreference = "Continue"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

$EnvFile = Join-Path $ProjectRoot ".env.local"
if (-not (Test-Path $EnvFile)) {
    Write-Error ".env.local not found. Copy from .env.example and fill in values first."
}

function Read-DotEnv([string]$Path) {
    $map = @{}
    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) { return }
        if ($line -match '^([^=]+)=(.*)$') {
            $map[$matches[1].Trim()] = $matches[2].Trim()
        }
    }
    return $map
}

function New-RandomSecret([int]$Bytes = 32) {
    $buf = New-Object byte[] $Bytes
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($buf)
    return [Convert]::ToBase64String($buf)
}

$local = Read-DotEnv $EnvFile

$skipKeys = @(
    "ADMIN_DEV_LOGIN",
    "NEXT_PUBLIC_ADMIN_DEV_LOGIN",
    "ADMIN_DEV_ALLOW_ANY",
    "NEXT_PUBLIC_ADMIN_DEV_ALLOW_ANY"
)

$toPush = [ordered]@{
    NEXT_PUBLIC_SUPABASE_URL = $local["NEXT_PUBLIC_SUPABASE_URL"]
    NEXT_PUBLIC_SUPABASE_ANON_KEY = $local["NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    SUPABASE_PUBLISHABLE_KEY = $local["SUPABASE_PUBLISHABLE_KEY"]
    SUPABASE_SECRET_KEY = $local["SUPABASE_SECRET_KEY"]
    SUPABASE_SERVICE_ROLE_KEY = $local["SUPABASE_SERVICE_ROLE_KEY"]
    ADMIN_EMAILS = $local["ADMIN_EMAILS"]
    NEXTAUTH_URL = $ProductionUrl
    NEXT_PUBLIC_SITE_URL = $ProductionUrl
    NEXTAUTH_SECRET = if ($local["NEXTAUTH_SECRET"] -and $local["NEXTAUTH_SECRET"] -notmatch "dev-only|change-in-production") {
        $local["NEXTAUTH_SECRET"]
    } else {
        New-RandomSecret
    }
}

if ($local["GOOGLE_CLIENT_ID"]) { $toPush["GOOGLE_CLIENT_ID"] = $local["GOOGLE_CLIENT_ID"] }
if ($local["GOOGLE_CLIENT_SECRET"]) { $toPush["GOOGLE_CLIENT_SECRET"] = $local["GOOGLE_CLIENT_SECRET"] }
if ($local["GEMINI_API_KEY"]) { $toPush["GEMINI_API_KEY"] = $local["GEMINI_API_KEY"] }
if ($local["STRIPE_SECRET_KEY"]) { $toPush["STRIPE_SECRET_KEY"] = $local["STRIPE_SECRET_KEY"] }
if ($local["STRIPE_WEBHOOK_SECRET"]) { $toPush["STRIPE_WEBHOOK_SECRET"] = $local["STRIPE_WEBHOOK_SECRET"] }
if ($local["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]) { $toPush["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] = $local["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] }

Write-Host "Checking Vercel CLI login..." -ForegroundColor Cyan
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$whoami = (npx vercel@latest whoami 2>&1 | Where-Object { $_ -is [string] -and $_ -notmatch "^npm warn" }) -join "`n"
$whoamiExit = $LASTEXITCODE
$ErrorActionPreference = $prevEap
if ($whoamiExit -ne 0) {
    Write-Host $whoami
    Write-Error "Not logged in to Vercel. Run: npx vercel login"
}

Write-Host "Logged in as: $whoami" -ForegroundColor Green

if (-not (Test-Path ".vercel/project.json")) {
    Write-Host "Linking project to Vercel (follow prompts if any)..." -ForegroundColor Cyan
    npx vercel@latest link --yes
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to link project. Run manually: npx vercel link"
    }
}

$environments = @("production", "preview")
$added = 0
$skipped = 0

foreach ($entry in $toPush.GetEnumerator()) {
    $name = $entry.Key
    $value = $entry.Value
    if ($skipKeys -contains $name) { continue }
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "SKIP (empty): $name" -ForegroundColor DarkYellow
        $skipped++
        continue
    }

    foreach ($env in $environments) {
        $ErrorActionPreference = "Continue"
        npx vercel@latest env rm $name $env --yes 2>$null | Out-Null
        $addOutput = $value | npx vercel@latest env add $name $env --yes --sensitive 2>&1
        $addExit = $LASTEXITCODE
        $ErrorActionPreference = $prevEap
        if ($addExit -ne 0) {
            Write-Warning "Failed to set $name for $env"
            if ($addOutput) { Write-Warning ($addOutput | Out-String) }
        } else {
            Write-Host "OK: $name -> $env" -ForegroundColor Green
            $added++
        }
    }
}

Write-Host ""
Write-Host "Done. Set $added env entries ($skipped skipped)." -ForegroundColor Cyan
Write-Host "Production URL used: $ProductionUrl" -ForegroundColor Cyan
Write-Host "Redeploy to apply: npx vercel --prod" -ForegroundColor Cyan
