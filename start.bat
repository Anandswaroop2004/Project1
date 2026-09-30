@echo off
echo =========================================================================
echo  MILITARY ASSET MANAGEMENT SYSTEM (MAMS) - LAUNCHER
echo =========================================================================
echo.
echo 1. Starting Java Spring Boot Backend (Port 8081)...
start "MAMS-Backend" cmd /k "powershell -Command ""$env:JAVA_HOME = 'C:\Program Files\Java\jdk-21.0.12'; & 'C:\Users\vaibh\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd' spring-boot:run -f backend/pom.xml"""

timeout /t 5 /nobreak >nul

echo 2. Starting React Vite Frontend (Port 5173)...
start "MAMS-Frontend" cmd /k "npm --prefix frontend run dev -- --port 5173"

echo.
echo Application is starting:
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://localhost:8081/api
echo.
echo Default Credentials:
echo  - Supreme Admin:       admin / password123
echo  - Base Commander:      commander_liberty / password123
echo  - Logistics Officer:   logistics_liberty / password123
echo =========================================================================
