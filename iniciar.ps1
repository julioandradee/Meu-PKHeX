# Script PowerShell para iniciar o Meu-PKHeX localmente
$ErrorActionPreference = "Stop"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "       Iniciando Meu-PKHeX Localmente" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$ScriptDir\src\PKHeX.Web.React"

if (-not (Test-Path "node_modules")) {
    Write-Host "[1/3] Instalando dependências npm..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "[1/3] Dependências npm verificadas." -ForegroundColor Green
}

Write-Host "[2/3] Compilando engine .NET (WebAssembly)..." -ForegroundColor Yellow
dotnet build ..\PKHeX.Everywhere.Engine.Host

Write-Host "`n[3/3] Iniciando servidor Vite em http://localhost:5173/ ..." -ForegroundColor Green
Write-Host "Pressione Ctrl+C para encerrar o servidor.`n" -ForegroundColor DarkGray

# Abre o navegador automaticamente
Start-Process "http://localhost:5173/"

npx vite
