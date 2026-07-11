@echo off
REM Launch JSON Studio via a local HTTP server (recommended).
REM Opens http://localhost:8765/json-studio.html in your default browser.
setlocal
cd /d "%~dp0"
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo Python 3 is required. Install from https://www.python.org/downloads/
  pause
  exit /b 1
)
start "" "http://localhost:8765/json-studio.html"
python -m http.server 8765
