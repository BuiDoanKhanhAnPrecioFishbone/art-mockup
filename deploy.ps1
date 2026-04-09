param(
    [string]$PublishUrl = "art-wireframe-frc7c2c5hkgafzdx.scm.southeastasia-01.azurewebsites.net",
    [string]$UserName   = "`$art-wireframe",
    [string]$Password   = "lkjBxHEENp3mHyoLru7NerXjSGCNQu3nh8f3W95jkCSq3aBgZsxpMxCg6kWS"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

Write-Host "`n==> Step 1: Build" -ForegroundColor Cyan
Set-Location $root
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

Write-Host "`n==> Step 2: Copy static assets into standalone" -ForegroundColor Cyan
$standalone = Join-Path $root ".next\standalone"
$staticSrc  = Join-Path $root ".next\static"
$staticDst  = Join-Path $standalone ".next\static"
$publicSrc  = Join-Path $root "public"
$publicDst  = Join-Path $standalone "public"

if (Test-Path $staticSrc)  { Copy-Item $staticSrc  $staticDst  -Recurse -Force }
if (Test-Path $publicSrc)  { Copy-Item $publicSrc  $publicDst  -Recurse -Force }

Write-Host "`n==> Step 3: Create deploy.zip" -ForegroundColor Cyan
$zipPath = Join-Path $root "deploy.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($standalone, $zipPath)
$sizeMB = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
Write-Host "   deploy.zip created: $sizeMB MB"

Write-Host "`n==> Step 4: ZipDeploy to Azure App Service" -ForegroundColor Cyan
$deployUrl = "https://$PublishUrl/api/zipdeploy?isAsync=true"
$pair      = "${UserName}:${Password}"
$bytes     = [System.Text.Encoding]::ASCII.GetBytes($pair)
$b64       = [Convert]::ToBase64String($bytes)
$headers   = @{ Authorization = "Basic $b64" }

$response = Invoke-RestMethod -Uri $deployUrl -Method Post `
    -InFile $zipPath -ContentType "application/zip" -Headers $headers
Write-Host "   Deploy queued. Polling status..."

# Poll until done
$statusUrl = "https://$PublishUrl/api/deployments/latest"
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 10
    $status = Invoke-RestMethod -Uri $statusUrl -Headers $headers
    $pct    = $status.progress ?? "..."
    Write-Host "   [$($i*10+10)s] status=$($status.status) progress=$pct"
    if ($status.complete) { break }
}

if ($status.status -eq 4) {
    Write-Host "`n✅ Deployment succeeded!" -ForegroundColor Green
    Write-Host "   https://art-wireframe-frc7c2c5hkgafzdx.southeastasia-01.azurewebsites.net"
} else {
    Write-Host "`n❌ Deployment status: $($status.status_text)" -ForegroundColor Red
    Write-Host $status.log_url
}
