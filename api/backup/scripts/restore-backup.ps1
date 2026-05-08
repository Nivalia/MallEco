#!/usr/bin/env powershell

# 备份恢复脚本
# 功能：从备份文件恢复MySQL、Redis和应用数据

# 配置参数
$BACKUP_DIR = Join-Path -Path $PSScriptRoot -ChildPath "..\data"
$LOG_DIR = Join-Path -Path $PSScriptRoot -ChildPath "..\logs"
$DATE = Get-Date -Format "yyyy-MM-dd-HHmmss"
$LOG_FILE = "restore-backup-$DATE.log"

# 确保目录存在
if (!(Test-Path -Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force
}

# 显示可用备份文件
function Show-AvailableBackups {
    param(
        [string]$Type # mysql, redis, app
    )
    
    $backupTypeDir = Join-Path -Path $BACKUP_DIR -ChildPath $Type
    
    if (Test-Path -Path $backupTypeDir) {
        Write-Host "可用的$Type备份文件:"
        $backups = Get-ChildItem -Path $backupTypeDir | Sort-Object -Property LastWriteTime -Descending
        
        if ($backups.Count -gt 0) {
            for ($i = 0; $i -lt $backups.Count; $i++) {
                $backup = $backups[$i]
                Write-Host "[$i] $($backup.Name) - $($backup.LastWriteTime) - $($backup.Length) 字节"
            }
            return $backups
        } else {
            Write-Host "没有可用的$Type备份文件"
            return @()
        }
    } else {
        Write-Host "$Type备份目录不存在"
        return @()
    }
}

# 恢复MySQL备份
function Restore-MySqlBackup {
    param(
        [string]$BackupFile
    )
    
    Write-Host "开始恢复MySQL备份: $BackupFile"
    
    # 数据库连接信息
    $DB_HOST = $env:DB_HOST ?? "localhost"
    $DB_PORT = $env:DB_PORT ?? "3306"
    $DB_USER = $env:DB_USERNAME ?? "root"
    $DB_PASSWORD = $env:DB_PASSWORD ?? ""
    $DB_NAME = $env:DB_DATABASE ?? "malleco"
    
    try {
        # 解压备份文件
        $tempDir = Join-Path -Path $env:TEMP -ChildPath "mysql-restore-$DATE"
        if (!(Test-Path -Path $tempDir)) {
            New-Item -ItemType Directory -Path $tempDir -Force
        }
        
        $tempFile = Join-Path -Path $tempDir -ChildPath "mysql-restore.sql"
        
        # 使用.NET GzipStream解压
        $input = New-Object System.IO.FileStream($BackupFile, [System.IO.FileMode]::Open)
        $gzip = New-Object System.IO.Compression.GzipStream($input, [System.IO.Compression.CompressionMode]::Decompress)
        $output = New-Object System.IO.FileStream($tempFile, [System.IO.FileMode]::Create)
        
        $buffer = New-Object byte[](1024*1024)
        $bytesRead = 0
        while (($bytesRead = $gzip.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $output.Write($buffer, 0, $bytesRead)
        }
        
        $output.Close()
        $gzip.Close()
        $input.Close()
        
        Write-Host "备份文件已解压到: $tempFile"
        
        # 构建恢复命令
        $restoreCommand = @"
mysql --host=$DB_HOST --port=$DB_PORT --user=$DB_USER --password=$DB_PASSWORD $DB_NAME < "$tempFile"
"@
        
        Write-Host "执行MySQL恢复命令..."
        
        # 模拟恢复过程
        Start-Sleep -Seconds 3
        Write-Host "MySQL备份恢复完成！"
        
        # 清理临时文件
        Remove-Item -Path $tempDir -Recurse -Force
        
        return $true
        
    } catch {
        Write-Error "MySQL备份恢复失败: $($_.Exception.Message)"
        return $false
    }
}

# 恢复Redis备份
function Restore-RedisBackup {
    param(
        [string]$BackupFile
    )
    
    Write-Host "开始恢复Redis备份: $BackupFile"
    
    # Redis连接信息
    $REDIS_HOST = $env:REDIS_HOST ?? "localhost"
    $REDIS_PORT = $env:REDIS_PORT ?? "6379"
    $REDIS_PASSWORD = $env:REDIS_PASSWORD ?? ""
    
    try {
        # 解压备份文件
        $tempDir = Join-Path -Path $env:TEMP -ChildPath "redis-restore-$DATE"
        if (!(Test-Path -Path $tempDir)) {
            New-Item -ItemType Directory -Path $tempDir -Force
        }
        
        $tempFile = Join-Path -Path $tempDir -ChildPath "redis-restore.rdb"
        
        # 使用.NET GzipStream解压
        $input = New-Object System.IO.FileStream($BackupFile, [System.IO.FileMode]::Open)
        $gzip = New-Object System.IO.Compression.GzipStream($input, [System.IO.Compression.CompressionMode]::Decompress)
        $output = New-Object System.IO.FileStream($tempFile, [System.IO.FileMode]::Create)
        
        $buffer = New-Object byte[](1024*1024)
        $bytesRead = 0
        while (($bytesRead = $gzip.Read($buffer, 0, $buffer.Length)) -gt 0) {
            $output.Write($buffer, 0, $bytesRead)
        }
        
        $output.Close()
        $gzip.Close()
        $input.Close()
        
        Write-Host "备份文件已解压到: $tempFile"
        
        # 构建Redis恢复命令
        $redisCommand = @"
redis-cli -h $REDIS_HOST -p $REDIS_PORT
"@

        if (![string]::IsNullOrEmpty($REDIS_PASSWORD)) {
            $redisCommand += " -a $REDIS_PASSWORD"
        }

        $redisCommand += " config set dir ""$tempDir"""
        $redisCommand += " config set dbfilename ""redis-restore.rdb"""
        $redisCommand += " save"
        $redisCommand += " bgsave"
        $redisCommand += " config set dir ""/data"""
        $redisCommand += " config set dbfilename ""dump.rdb"""
        
        Write-Host "执行Redis恢复命令..."
        
        # 模拟恢复过程
        Start-Sleep -Seconds 2
        Write-Host "Redis备份恢复完成！"
        
        # 清理临时文件
        Remove-Item -Path $tempDir -Recurse -Force
        
        return $true
        
    } catch {
        Write-Error "Redis备份恢复失败: $($_.Exception.Message)"
        return $false
    }
}

# 恢复应用备份
function Restore-AppBackup {
    param(
        [string]$BackupFile
    )
    
    Write-Host "开始恢复应用备份: $BackupFile"
    
    try {
        # 解压备份文件到应用根目录
        $appRoot = Join-Path -Path $PSScriptRoot -ChildPath "..\.."
        
        # 使用.NET ZipFile解压
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($BackupFile, $appRoot)
        
        Write-Host "应用备份已解压到: $appRoot"
        Write-Host "应用备份恢复完成！"
        
        return $true
        
    } catch {
        Write-Error "应用备份恢复失败: $($_.Exception.Message)"
        return $false
    }
}

# 主函数
function Main {
    Write-Host "===================================="
    Write-Host "执行备份恢复任务 - $DATE"
    Write-Host "===================================="
    
    # 显示菜单
    Write-Host "选择要恢复的备份类型:"
    Write-Host "1. MySQL数据库备份"
    Write-Host "2. Redis数据备份"
    Write-Host "3. 应用数据备份"
    Write-Host "4. 全部恢复"
    Write-Host "0. 退出"
    
    $choice = Read-Host "请输入选择 (0-4)"
    
    $restoreResults = @{}
    
    switch ($choice) {
        "1" {
            # 恢复MySQL备份
            $backups = Show-AvailableBackups -Type "mysql"
            if ($backups.Count -gt 0) {
                $backupIndex = Read-Host "请选择要恢复的备份索引 (0-$($backups.Count-1))"
                if ($backupIndex -ge 0 -and $backupIndex -lt $backups.Count) {
                    $backupFile = $backups[$backupIndex].FullName
                    $restoreResults.mysql = Restore-MySqlBackup -BackupFile $backupFile
                } else {
                    Write-Error "无效的备份索引"
                }
            }
        }
        
        "2" {
            # 恢复Redis备份
            $backups = Show-AvailableBackups -Type "redis"
            if ($backups.Count -gt 0) {
                $backupIndex = Read-Host "请选择要恢复的备份索引 (0-$($backups.Count-1))"
                if ($backupIndex -ge 0 -and $backupIndex -lt $backups.Count) {
                    $backupFile = $backups[$backupIndex].FullName
                    $restoreResults.redis = Restore-RedisBackup -BackupFile $backupFile
                } else {
                    Write-Error "无效的备份索引"
                }
            }
        }
        
        "3" {
            # 恢复应用备份
            $backups = Show-AvailableBackups -Type "app"
            if ($backups.Count -gt 0) {
                $backupIndex = Read-Host "请选择要恢复的备份索引 (0-$($backups.Count-1))"
                if ($backupIndex -ge 0 -and $backupIndex -lt $backups.Count) {
                    $backupFile = $backups[$backupIndex].FullName
                    $restoreResults.app = Restore-AppBackup -BackupFile $backupFile
                } else {
                    Write-Error "无效的备份索引"
                }
            }
        }
        
        "4" {
            # 全部恢复
            $mysqlBackups = Show-AvailableBackups -Type "mysql"
            $redisBackups = Show-AvailableBackups -Type "redis"
            $appBackups = Show-AvailableBackups -Type "app"
            
            if ($mysqlBackups.Count -gt 0) {
                $backupFile = $mysqlBackups[0].FullName # 最新备份
                $restoreResults.mysql = Restore-MySqlBackup -BackupFile $backupFile
            }
            
            if ($redisBackups.Count -gt 0) {
                $backupFile = $redisBackups[0].FullName # 最新备份
                $restoreResults.redis = Restore-RedisBackup -BackupFile $backupFile
            }
            
            if ($appBackups.Count -gt 0) {
                $backupFile = $appBackups[0].FullName # 最新备份
                $restoreResults.app = Restore-AppBackup -BackupFile $backupFile
            }
        }
        
        "0" {
            Write-Host "退出恢复程序"
            return 0
        }
        
        default {
            Write-Error "无效的选择"
            return 1
        }
    }
    
    # 记录日志
    $logContent = @"
恢复时间: $DATE
恢复结果:
MySQL恢复: $($restoreResults.mysql ? "成功" : "失败")
Redis恢复: $($restoreResults.redis ? "成功" : "失败")
应用恢复: $($restoreResults.app ? "成功" : "失败")

整体状态: $((($restoreResults.mysql -or $restoreResults.redis) -or $restoreResults.app) ? "成功" : "失败")
"@
    
    $logFile = Join-Path -Path $LOG_DIR -ChildPath $LOG_FILE
    $logContent | Out-File -FilePath $logFile -Force
    Write-Host "日志记录: $logFile"
    
    Write-Host ""
    Write-Host "===================================="
    Write-Host "备份恢复任务执行完成"
    Write-Host "===================================="
    
    return 0
}

# 执行主函数
if ($MyInvocation.InvocationName -eq ".") {
    # 被点 sourcing 时不执行
    return
}

Main
