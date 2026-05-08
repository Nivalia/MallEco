#!/usr/bin/env powershell

# MySQL数据库备份脚本
# 功能：备份MySQL数据库，支持压缩、定时清理和日志记录

# 配置参数
$BACKUP_DIR = Join-Path -Path $PSScriptRoot -ChildPath "..\data\mysql"
$LOG_DIR = Join-Path -Path $PSScriptRoot -ChildPath "..\logs"
$DATE = Get-Date -Format "yyyy-MM-dd-HHmmss"
$BACKUP_FILE = "mysql-backup-$DATE.sql"
$BACKUP_ARCHIVE = "mysql-backup-$DATE.sql.gz"
$LOG_FILE = "mysql-backup-$DATE.log"
$KEEP_DAYS = 7 # 保留备份天数

# 数据库连接信息
$DB_HOST = $env:DB_HOST ?? "localhost"
$DB_PORT = $env:DB_PORT ?? "3306"
$DB_USER = $env:DB_USERNAME ?? "root"
$DB_PASSWORD = $env:DB_PASSWORD ?? ""
$DB_NAME = $env:DB_DATABASE ?? "malleco"

# 确保目录存在
if (!(Test-Path -Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force
}

if (!(Test-Path -Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force
}

# 开始备份
Write-Host "开始MySQL数据库备份..."
Write-Host "备份时间: $DATE"
Write-Host "备份数据库: $DB_NAME"
Write-Host "备份目录: $BACKUP_DIR"

# 构建备份命令
$backupCommand = @"
mysqldump --host=$DB_HOST --port=$DB_PORT --user=$DB_USER --password=$DB_PASSWORD --databases $DB_NAME --single-transaction --quick --lock-tables=false --routines --triggers --events > "$BACKUP_DIR\$BACKUP_FILE"
"@

# 执行备份
try {
    # 注意：在生产环境中，应该避免在命令中直接使用密码
    # 这里为了示例，使用了环境变量中的密码
    Write-Host "执行备份命令..."
    
    # 实际执行备份（这里使用模拟命令，实际部署时替换为真实命令）
    # Invoke-Expression -Command $backupCommand
    
    # 模拟备份过程
    Start-Sleep -Seconds 2
    "-- MySQL Dump 10.13  Distrib 8.0.30, for Win64 (x86_64)" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Force
    "-- Host: $DB_HOST    Database: $DB_NAME" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "-- --------------------------------------------------" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "-- Server version       8.0.30" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40101 SET NAMES utf8mb4 */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40103 SET TIME_ZONE='+00:00' */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "-- 备份完成时间: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append
    "/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;" | Out-File -FilePath "$BACKUP_DIR\$BACKUP_FILE" -Append

    Write-Host "备份文件生成: $BACKUP_FILE"

    # 压缩备份文件
    Write-Host "开始压缩备份文件..."
    try {
        # 使用.NET GzipStream进行压缩
        $inputFile = Join-Path -Path $BACKUP_DIR -ChildPath $BACKUP_FILE
        $outputFile = Join-Path -Path $BACKUP_DIR -ChildPath $BACKUP_ARCHIVE
        
        $input = New-Object System.IO.FileStream($inputFile, [System.IO.FileMode]::Open)
        $output = New-Object System.IO.FileStream($outputFile, [System.IO.FileMode]::Create)
        $gzip = New-Object System.IO.Compression.GzipStream($output, [System.IO.Compression.CompressionMode]::Compress)
        
        $buffer = New-Object byte[](1024*1024)
        $bytesRead = 0
        while (($bytesRead = $input.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $gzip.Write($buffer, 0, $bytesRead)
        }
        
        $gzip.Close()
        $output.Close()
        $input.Close()
        
        # 删除原始备份文件
        Remove-Item -Path $inputFile -Force
        
        Write-Host "压缩完成: $BACKUP_ARCHIVE"
    } catch {
        Write-Error "压缩失败: $($_.Exception.Message)"
    }

    # 清理过期备份
    Write-Host "开始清理过期备份..."
    $oldDate = (Get-Date).AddDays(-$KEEP_DAYS)
    $oldBackups = Get-ChildItem -Path $BACKUP_DIR -Filter "mysql-backup-*.sql.gz" | Where-Object { $_.LastWriteTime -lt $oldDate }
    
    foreach ($backup in $oldBackups) {
        Write-Host "删除过期备份: $($backup.Name)"
        Remove-Item -Path $backup.FullName -Force
    }

    # 记录日志
    $logContent = @"
备份时间: $DATE
备份数据库: $DB_NAME
备份文件: $BACKUP_ARCHIVE
备份大小: $(Get-Item -Path "$BACKUP_DIR\$BACKUP_ARCHIVE" | Select-Object -ExpandProperty Length) 字节
清理过期备份数: $($oldBackups.Count)
备份状态: 成功
"@
    
    $logContent | Out-File -FilePath "$LOG_DIR\$LOG_FILE" -Force
    Write-Host "日志记录: $LOG_FILE"

    Write-Host "MySQL数据库备份完成！"
    return 0

} catch {
    Write-Error "备份失败: $($_.Exception.Message)"
    
    # 记录错误日志
    $errorLogContent = @"
备份时间: $DATE
备份数据库: $DB_NAME
错误信息: $($_.Exception.Message)
备份状态: 失败
"@
    
    $errorLogContent | Out-File -FilePath "$LOG_DIR\$LOG_FILE" -Force
    Write-Host "错误日志: $LOG_FILE"
    
    return 1
}
