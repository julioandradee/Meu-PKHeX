@echo off
title Meu-PKHeX - Servidor Local
chcp 65001 >nul

echo ====================================================
echo        Iniciando Meu-PKHeX Localmente
echo ====================================================
echo.

cd /d "%~dp0\src\PKHeX.Web.React"

echo [1/3] Verificando dependencias npm...
if not exist "node_modules" (
    echo Instalando dependencias do Node...
    call npm install
)

echo [2/3] Compilando engine .NET (WebAssembly)...
dotnet build ..\PKHeX.Everywhere.Engine.Host
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao compilar o engine .NET!
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Iniciando servidor Vite em http://localhost:5173/ ...
echo Pressione Ctrl+C para encerrar o servidor.
echo.

REM Abre o navegador automaticamente apos 2 segundos
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5173/"

call npx vite
pause
