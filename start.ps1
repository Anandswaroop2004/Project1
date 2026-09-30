Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "  MILITARY ASSET MANAGEMENT SYSTEM (MAMS) - POWERSHELL LAUNCHER" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Cyan

$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.12"
$mvnCmd = "C:\Users\vaibh\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6\bin\mvn.cmd"

Write-Host "`n1. Launching Spring Boot Backend on port 8081..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:JAVA_HOME = '$env:JAVA_HOME'; & '$mvnCmd' spring-boot:run -f backend/pom.xml"

Start-Sleep -Seconds 5

Write-Host "2. Launching React Vite Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm --prefix frontend run dev -- --port 5173"

Write-Host "`nSystem URLs:" -ForegroundColor Green
Write-Host " - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host " - Backend API: http://localhost:8081/api" -ForegroundColor White

Write-Host "`nDefault Test Logins:" -ForegroundColor Cyan
Write-Host " - Supreme Admin:     admin / password123"
Write-Host " - Base Commander:    commander_liberty / password123"
Write-Host " - Logistics Officer: logistics_liberty / password123"
