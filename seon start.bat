@echo off
title 세온연구소 서버 실행기
echo ================================================
echo [1] MongoDB 서버 시작 중...
start "" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath="D:\mongodb\data"

timeout /t 3 >nul

echo [2] Node.js 서버 시작 중...
cd /d D:\연구소\홈페이지
start "" cmd /k "node server.js"

echo ================================================
echo 모든 프로세스가 실행되었습니다.
pause
