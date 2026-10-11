@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo   CAT-ALOG - creazione dell'installer unico
echo ============================================
echo.
where node >nul 2>nul || (echo Node.js non trovato. Installalo da https://nodejs.org e riprova. & pause & exit /b 1)
echo [1/3] Installo i componenti ^(1-3 minuti la prima volta^)...
call npm install || (echo Installazione non riuscita. & pause & exit /b 1)
echo [2/3] Controllo che tutto funzioni...
call npm test || (echo I controlli non sono passati: l'installer non viene creato. & pause & exit /b 1)
echo [3/3] Creo l'installer ^(3-6 minuti^)...
call npm run dist:win || (echo Creazione dell'installer non riuscita. Copia l'errore e mandamelo. & pause & exit /b 1)
echo.
echo FATTO. Nella cartella "dist" c'e' UN SOLO FILE da dare a chi vuole installare CAT-ALOG:
dir /b dist\CAT-ALOG-Setup-*.exe
start "" "%~dp0dist"
pause
