@echo off
setlocal
cd /d "%~dp0"
if not exist ".venv\Scripts\pythonw.exe" (
  echo Run setup.ps1 first, or use the packaged HBRStyleReader.exe.
  pause
  exit /b 1
)
start "" ".venv\Scripts\pythonw.exe" "app.py"
