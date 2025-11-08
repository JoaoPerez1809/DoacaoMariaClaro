@echo off
ECHO "Iniciando backend e frontend"

REM Inicia o backend em uma nova janela
start "Backend" cmd /k "cd backend/DoacoesONG && dotnet run"

REM Inicia o frontend em uma nova janela
start "Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo Todas as aplicacoes foram iniciadas em terminais separados.
pause