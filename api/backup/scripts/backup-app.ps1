#!/usr/bin/env powershell

# 应用数据备份脚本
# 功能：备份应用配置文件、上传文件等重要数据，支持压缩和定时清理

# 配置参数
$BACKUP_DIR = Join-Path -Path $PSScriptRoot -ChildPath "..\data\app"
$LOG_DIR = Join-Path -Path $PSScriptRoot -ChildPath "..\logs"
$DATE = Get-Date -Format "yyyy-MM-dd-HHmmss"
$BACKUP_FILE = "app-backup-$DATE.zip"
$LOG_FILE = "app-backup-$DATE.log"
$KEEP_DAYS = 7 # 保留备份天数

# 需要备份的目录和文件
$BACKUP_SOURCES = @(
    Join-Path -Path $PSScriptRoot -ChildPath "..\..\src\config"
    Join-Path -Path $PSScriptRoot -ChildPath "..\..\public"
    Join-Path -Path $PSScriptRoot -ChildPath "..\..\.env"
    Join-Path -Path $PSScriptRoot -ChildPath "..\..\package.json"
    Join-Path -Path $PSScriptRoot -ChildPath "..\..\docker-compose.yml"
    Join-Path -Path $PSScriptRoot -ChildPath "..\..\nginx"
    Join-Path -Path $PSScriptRoot -ChildPath "..\..\monitoring"
)

# 确保目录存在
if (!(Test-Path -Path $BACKUP_DIR)) {
    New-Item -ItemType Directory -Path $BACKUP_DIR -Force
}

if (!(Test-Path -Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force
}

# 开始备份
Write-Host "开始应用数据备份..."
Write-Host "备份时间: $DATE"
Write-Host "备份目录: $BACKUP_DIR"
Write-Host "备份源数: $($BACKUP_SOURCES.Count)"

# 执行备份
try {
    # 创建临时目录
    $TEMP_DIR = Join-Path -Path $BACKUP_DIR -ChildPath "temp-$DATE"
    if (!(Test-Path -Path $TEMP_DIR)) {
        New-Item -ItemType Directory -Path $TEMP_DIR -Force
    }

    # 复制备份源到临时目录
    Write-Host "开始复制备份源..."
    $copiedFiles = 0
    
    foreach ($source in $BACKUP_SOURCES) {
        if (Test-Path -Path $source) {
            $sourceName = Split-Path -Path $source -Leaf
            $destination = Join-Path -Path $TEMP_DIR -ChildPath $sourceName
            
            if (Test-Path -Path $source -PathType Container) {
                Write-Host "复制目录: $sourceName"
                Copy-Item -Path $source -Destination $destination -Recurse -Force
            } else {
                Write-Host "复制文件: $sourceName"
                Copy-Item -Path $source -Destination $destination -Force
            }
            $copiedFiles++
        } else {
            Write-Warning "源不存在: $source"
        }
    }

    # 压缩备份文件
    Write-Host "开始压缩备份文件..."
    try {
        $backupFilePath = Join-Path -Path $BACKUP_DIR -ChildPath $BACKUP_FILE
        
        # 使用.NET ZipFile进行压缩
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::CreateFromDirectory($TEMP_DIR, $backupFilePath, [System.IO.Compression.CompressionLevel]::Optimal, $false)
        
        Write-Host "压缩完成: $BACKUP_FILE"
    } catch {
        Write-Error "压缩失败: $($_.Exception.Message)"
    }

    # 清理临时目录
    Write-Host "清理临时目录..."
    Remove-Item -Path $TEMP_DIR -Recurse -Force

    # 清理过期备份
    Write-Host "开始清理过期备份..."
    $oldDate = (Get-Date).AddDays(-$KEEP_DAYS)
    $oldBackups = Get-ChildItem -Path $BACKUP_DIR -Filter "app-backup-*.zip" | Where-Object { $_.LastWriteTime -lt $oldDate }
    
    foreach ($backup in $oldBackups) {
        Write-Host "删除过期备份: $($backup.Name)"
        Remove-Item -Path $backup.FullName -Force
    }

    # 记录日志
    $logContent = @"
备份时间: $DATE
备份源数: $($BACKUP_SOURCES.Count)
成功复制: $copiedFiles
备份文件: $BACKUP_FILE
备份大小: $(Get-Item -Path $backupFilePath | Select-Object -ExpandProperty Length) 字节
清理过期备份数: $($oldBackups.Count)
备份状态: 成功
"@
    
    $logContent | Out-File -FilePath "$LOG_DIR\$LOG_FILE" -Force
    Write-Host "日志记录: $LOG_FILE"

    Write-Host "应用数据备份完成！"
    return 0

} catch {
    Write-Error "备份失败: $($_.Exception.Message)"
    
    # 记录错误日志
    $errorLogContent = @"
备份时间: $DATE
备份源数: $($BACKUP_SOURCES.Count)
错误信息: $($_.Exception.Message)
备份状态: 失败
"@
    
    $errorLogContent | Out-File -FilePath "$LOG_DIR\$LOG_FILE" -Force
    Write-Host "错误日志: $LOG_FILE"
    
    return 1
}
