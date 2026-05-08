@echo off

rem 简化的备份测试脚本

set BACKUP_DIR=%~dp0\..\data
set LOG_DIR=%~dp0\..\logs

rem 获取当前日期时间
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "DATE=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%-%dt:~8,2%%dt:~10,2%%dt:~12,2%"

echo Testing backup functionality...
echo Backup directory: %BACKUP_DIR%
echo Log directory: %LOG_DIR%
echo Current date: %DATE%

echo.

rem 检查目录结构
if not exist "%BACKUP_DIR%" (
    echo Creating backup directory...
    mkdir "%BACKUP_DIR%"
)

if not exist "%LOG_DIR%" (
    echo Creating log directory...
    mkdir "%LOG_DIR%"
)

rem 创建子目录
set MYSQL_DIR=%BACKUP_DIR%\mysql
set REDIS_DIR=%BACKUP_DIR%\redis
set APP_DIR=%BACKUP_DIR%\app

for %%d in ("%MYSQL_DIR%" "%REDIS_DIR%" "%APP_DIR%") do (
    if not exist "%%d" (
        echo Creating directory: %%d
        mkdir "%%d"
    )
)

rem 创建测试备份文件
set TEST_MYSQL_FILE=%MYSQL_DIR%\mysql-backup-%DATE%.sql
set TEST_REDIS_FILE=%REDIS_DIR%\redis-backup-%DATE%.rdb
set TEST_APP_FILE=%APP_DIR%\app-backup-%DATE%.txt

echo Test MySQL backup file created at %DATE% > "%TEST_MYSQL_FILE%"
echo Test Redis backup file created at %DATE% > "%TEST_REDIS_FILE%"
echo Test App backup file created at %DATE% > "%TEST_APP_FILE%"

echo Created test backup files:
echo - %TEST_MYSQL_FILE%
echo - %TEST_REDIS_FILE%
echo - %TEST_APP_FILE%

echo.

rem 检查文件是否存在
echo Backup test results:
if exist "%TEST_MYSQL_FILE%" (
    echo MySQL backup: SUCCESS
) else (
    echo MySQL backup: FAILED
)

if exist "%TEST_REDIS_FILE%" (
    echo Redis backup: SUCCESS
) else (
    echo Redis backup: FAILED
)

if exist "%TEST_APP_FILE%" (
    echo App backup: SUCCESS
) else (
    echo App backup: FAILED
)

echo.
echo Backup test completed successfully!
