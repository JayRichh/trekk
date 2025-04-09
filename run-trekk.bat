@echo off
echo Starting Trekk Application...
echo.

echo Starting Backend...
start cmd /k "cd %~dp0Backend/Trekk.Api && dotnet run"
echo.

echo Starting Frontend...
start cmd /k "cd %~dp0 && npm run dev"
echo.

echo Trekk application started!
echo Backend API: https://localhost:7285/swagger
echo Frontend: http://localhost:5173
echo.
echo Press any key to shut down all services...
pause > nul

echo Shutting down services...
taskkill /f /fi "WINDOWTITLE eq npm run dev*" > nul
taskkill /f /fi "WINDOWTITLE eq dotnet run*" > nul
echo Done.
