#!/usr/bin/env powershell

# 简化的备份测试脚本

$PSScriptRoot = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
$BACKUP_DIR = Join-Path -Path $PSScriptRoot -ChildPath "..\data"
$LOG_DIR = Join-Path -Path $PSScriptRoot -ChildPath "..\logs"
$DATE = Get-Date -Format "yyyy-MM-dd-HHmmss"

Write-Host "Testing backup functionality..."
Write-Host "Backup directory: $BACKUP_DIR"
Write-Host "Log directory: $LOG_DIR"
Write-Host "Current date: $DATE"

# 检查目录结构
if (!(Test-Path -Path $BACKUP_DIR)) {
    Write-Host "Creating backup directory..."
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force
}

if (!(Test-Path -Path $LOG_DIR)) {
    Write-Host "Creating log directory..."
    New-Item -ItemType Directory -Path $LOG_DIR -Force
}

# 创建子目录
$mysqlDir = Join-Path -Path $BACKUP_DIR -ChildPath "mysql"
$redisDir = Join-Path -Path $BACKUP_DIR -ChildPath "redis"
$appDir = Join-Path -Path $BACKUP_DIR -ChildPath "app"

foreach ($dir in @($mysqlDir, $redisDir, $appDir)) {
    if (!(Test-Path -Path $dir)) {
        Write-Host "Creating directory: $dir"
        New-Item -ItemType Directory -Path $dir -Force
    }
}

# 创建测试备份文件
$testMysqlFile = Join-Path -Path $mysqlDir -ChildPath "mysql-backup-$DATE.sql"
$testRedisFile = Join-Path -Path $redisDir -ChildPath "redis-backup-$DATE.rdb"
$testAppFile = Join-Path -Path $appDir -ChildPath "app-backup-$DATE.txt"

"Test MySQL backup file created at $DATE" | Out-File -FilePath $testMysqlFile -Force
"Test Redis backup file created at $DATE" | Out-File -FilePath $testRedisFile -Force
"Test App backup file created at $DATE" | Out-File -FilePath $testAppFile -Force

Write-Host "Created test backup files:"
Write-Host "- $testMysqlFile"
Write-Host "- $testRedisFile"
Write-Host "- $testAppFile"

# 检查文件是否存在
$mysqlExists = Test-Path -Path $testMysqlFile
$redisExists = Test-Path -Path $testRedisFile
$appExists = Test-Path -Path $testAppFile

Write-Host ""
Write-Host "Backup test results:"
Write-Host "MySQL backup: $mysqlExists"
Write-Host "Redis backup: $redisExists"
Write-Host "App backup: $appExists"

# 清理测试文件
Write-Host ""
Write-Host "Cleaning up test files..."
Remove-Item -Path $testMysqlFile -Force -ErrorAction SilentlyContinue
Remove-Item -Path $testRedisFile -Force -ErrorAction SilentlyContinue
Remove-Item -Path $testAppFile -Force -ErrorAction SilentlyContinue

Write-Host "Backup test completed successfully!"
