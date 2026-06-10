@echo off
title Sincronizare produse RIXAIR
cd /d "%~dp0"
py sync.py 2>nul || python sync.py
echo.
echo Gata! Acum ruleaza PUBLICA.bat ca sa urci modificarile pe site.
pause
