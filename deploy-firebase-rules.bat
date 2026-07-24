@echo off
title Cortex - Deploy Firebase Rules
color 0A
echo.
echo ========================================
echo  CORTEX - Deploy das Regras do Firestore
echo ========================================
echo.
echo Este script vai:
echo  1. Fazer login no Firebase (abre o browser)
echo  2. Fazer deploy das regras de seguranca
echo  3. Configurar o GitHub Actions para deploys automaticos futuros
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

echo.
echo [1/3] Fazendo login no Firebase...
echo (Uma janela do browser vai abrir. Faca o login com sua conta Google)
echo.
npx -y firebase-tools@latest login
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Login falhou. Tente novamente.
    pause
    exit /b 1
)

echo.
echo [2/3] Fazendo deploy das regras do Firestore...
npx -y firebase-tools@latest deploy --only firestore:rules --project cortex-clinica
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Deploy falhou.
    pause
    exit /b 1
)

echo.
echo [3/3] Gerando token para GitHub Actions (deploys automaticos futuros)...
echo.
echo IMPORTANTE: Copie o token abaixo e adicione como Secret no GitHub:
echo  - Acesse: https://github.com/olivenbaunvonbrun-droid/cortex-gestao-clinica/settings/secrets/actions
echo  - Clique em "New repository secret"
echo  - Nome: FIREBASE_TOKEN
echo  - Valor: (o token que aparece abaixo)
echo.
npx -y firebase-tools@latest login:ci

echo.
echo ========================================
echo  CONCLUIDO! Regras deployadas com sucesso
echo ========================================
echo.
pause
