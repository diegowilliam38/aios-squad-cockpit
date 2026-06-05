@echo off
title AIOS Squad Cockpit Launcher
echo ===================================================
echo 🏢 INICIALIZANDO O AIOS SQUAD COCKPIT...
echo ===================================================

:: 1. Instalar dependencias do Backend se necessario
echo 🐍 Verificando dependencias do Python Backend...
cd backend
python -m pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo ⚠️ Erro ao instalar dependencias do backend. Tentando prosseguir...
)
cd ..

:: 2. Instalar dependencias do Frontend se necessario
echo 📦 Verificando dependencias do Node.js Frontend (pode levar alguns segundos)...
cd frontend
if not exist node_modules (
    echo Instalação inicial das dependências do Node...
    call npm install
) else (
    echo Dependências Node já instaladas.
)
cd ..

:: 3. Iniciar o Backend FastAPI em uma nova janela de terminal
echo ⚙️ Iniciando o Servidor API Backend (FastAPI na porta 8124)...
start "AIOS Cockpit Backend" cmd /k "cd backend && python main.py"

:: 4. Iniciar o Frontend Vite React no terminal atual
echo 🖥️ Iniciando o Servidor Frontend (Vite)...
cd frontend
call npm run dev
cd ..
