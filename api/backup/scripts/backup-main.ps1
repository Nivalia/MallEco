#!/usr/bin/env powershell

# 主备份脚本
# 功能：统一执行所有备份任务，支持调度和监控

# 配置参数
$SCRIPT_DIR = $PSScriptRoot
$CONFIG_FILE = Join-Path -Path $SCRIPT_DIR -ChildPath "..\backup-config.json"
$LOG_DIR = Join-Path -Path $SCRIPT_DIR -ChildPath "..\logs"
$DATE = Get-Date -Format "yyyy-MM-dd-HHmmss"
$MAIN_LOG_FILE = "backup-main-$DATE.log"

# 确保日志目录存在
if (!(Test-Path -Path $LOG_DIR)) {
    New-Item -ItemType Directory -Path $LOG_DIR -Force
}

# 导入配置
function Import-Config {
    if (Test-Path -Path $CONFIG_FILE) {
        return Get-Content -Path $CONFIG_FILE -Raw | ConvertFrom-Json
    } else {
        # 配置文件不存在，使用默认配置
        $configScript = Join-Path -Path $SCRIPT_DIR -ChildPath "backup-config.ps1"
        if (Test-Path -Path $configScript) {
            . $configScript
            return Import-BackupConfig
        } else {
            Write-Error "配置文件不存在，也找不到配置脚本"
            return $null
        }
    }
}

# 执行MySQL备份
function Invoke-MySqlBackup {
    param(
        [object]$Config
    )
    
    Write-Host "开始执行MySQL备份..."
    $mysqlScript = Join-Path -Path $SCRIPT_DIR -ChildPath "backup-mysql.ps1"
    
    if (Test-Path -Path $mysqlScript) {
        try {
            $result = & $mysqlScript
            Write-Host "MySQL备份执行结果: $result"
            return $result -eq 0
        } catch {
            Write-Error "MySQL备份执行失败: $($_.Exception.Message)"
            return $false
        }
    } else {
        Write-Error "MySQL备份脚本不存在: $mysqlScript"
        return $false
    }
}

# 执行Redis备份
function Invoke-RedisBackup {
    param(
        [object]$Config
    )
    
    Write-Host "开始执行Redis备份..."
    $redisScript = Join-Path -Path $SCRIPT_DIR -ChildPath "backup-redis.ps1"
    
    if (Test-Path -Path $redisScript) {
        try {
            $result = & $redisScript
            Write-Host "Redis备份执行结果: $result"
            return $result -eq 0
        } catch {
            Write-Error "Redis备份执行失败: $($_.Exception.Message)"
            return $false
        }
    } else {
        Write-Error "Redis备份脚本不存在: $redisScript"
        return $false
    }
}

# 执行应用备份
function Invoke-AppBackup {
    param(
        [object]$Config
    )
    
    Write-Host "开始执行应用备份..."
    $appScript = Join-Path -Path $SCRIPT_DIR -ChildPath "backup-app.ps1"
    
    if (Test-Path -Path $appScript) {
        try {
            $result = & $appScript
            Write-Host "应用备份执行结果: $result"
            return $result -eq 0
        } catch {
            Write-Error "应用备份执行失败: $($_.Exception.Message)"
            return $false
        }
    } else {
        Write-Error "应用备份脚本不存在: $appScript"
        return $false
    }
}

# 检查备份状态
function Test-BackupStatus {
    param(
        [object]$Config
    )
    
    Write-Host "开始检查备份状态..."
    $backupDir = $Config.directories.backup
    $status = @{}
    
    # 检查MySQL备份
    $mysqlDir = Join-Path -Path $backupDir -ChildPath "mysql"
    if (Test-Path -Path $mysqlDir) {
        $latestMysqlBackup = Get-ChildItem -Path $mysqlDir -Filter "mysql-backup-*.sql.gz" | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 1
        if ($latestMysqlBackup) {
            $status.mysql = @{
                exists = $true
                file = $latestMysqlBackup.Name
                size = $latestMysqlBackup.Length
                time = $latestMysqlBackup.LastWriteTime
            }
        } else {
            $status.mysql = @{ exists = $false }
        }
    } else {
        $status.mysql = @{ exists = $false }
    }
    
    # 检查Redis备份
    $redisDir = Join-Path -Path $backupDir -ChildPath "redis"
    if (Test-Path -Path $redisDir) {
        $latestRedisBackup = Get-ChildItem -Path $redisDir -Filter "redis-backup-*.rdb.gz" | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 1
        if ($latestRedisBackup) {
            $status.redis = @{
                exists = $true
                file = $latestRedisBackup.Name
                size = $latestRedisBackup.Length
                time = $latestRedisBackup.LastWriteTime
            }
        } else {
            $status.redis = @{ exists = $false }
        }
    } else {
        $status.redis = @{ exists = $false }
    }
    
    # 检查应用备份
    $appDir = Join-Path -Path $backupDir -ChildPath "app"
    if (Test-Path -Path $appDir) {
        $latestAppBackup = Get-ChildItem -Path $appDir -Filter "app-backup-*.zip" | Sort-Object -Property LastWriteTime -Descending | Select-Object -First 1
        if ($latestAppBackup) {
            $status.app = @{
                exists = $true
                file = $latestAppBackup.Name
                size = $latestAppBackup.Length
                time = $latestAppBackup.LastWriteTime
            }
        } else {
            $status.app = @{ exists = $false }
        }
    } else {
        $status.app = @{ exists = $false }
    }
    
    return $status
}

# 发送通知（模拟）
function Send-Notification {
    param(
        [object]$Config,
        [string]$Subject,
        [string]$Body
    )
    
    if ($Config.notification.enabled) {
        Write-Host "发送通知: $Subject"
        Write-Host "通知内容: $Body"
        # 实际通知逻辑
    }
}

# 主函数
function Main {
    Write-Host "===================================="
    Write-Host "执行主备份任务 - $DATE"
    Write-Host "===================================="
    
    # 导入配置
    $config = Import-Config
    if (!$config) {
        Write-Error "无法加载配置，退出"
        return 1
    }
    
    # 执行备份任务
    $mysqlSuccess = Invoke-MySqlBackup -Config $config
    $redisSuccess = Invoke-RedisBackup -Config $config
    $appSuccess = Invoke-AppBackup -Config $config
    
    # 检查备份状态
    $backupStatus = Test-BackupStatus -Config $config
    
    # 记录日志
    $logContent = @"
备份时间: $DATE
MySQL备份: $($mysqlSuccess ? "成功" : "失败")
Redis备份: $($redisSuccess ? "成功" : "失败")
应用备份: $($appSuccess ? "成功" : "失败")

备份状态:
MySQL最新备份: $($backupStatus.mysql.exists ? $backupStatus.mysql.file : "无")
Redis最新备份: $($backupStatus.redis.exists ? $backupStatus.redis.file : "无")
应用最新备份: $($backupStatus.app.exists ? $backupStatus.app.file : "无")

整体状态: $((($mysqlSuccess -and $redisSuccess) -or $appSuccess) ? "成功" : "失败")
"@
    
    $logFile = Join-Path -Path $LOG_DIR -ChildPath $MAIN_LOG_FILE
    $logContent | Out-File -FilePath $logFile -Force
    Write-Host "日志记录: $logFile"
    
    # 发送通知
    if ($config.notification.enabled) {
        $subject = "MallEco备份任务执行结果 - $DATE"
        $body = $logContent
        Send-Notification -Config $config -Subject $subject -Body $body
    }
    
    Write-Host "===================================="
    Write-Host "主备份任务执行完成"
    Write-Host "===================================="
    
    # 返回执行结果
    if ($mysqlSuccess -and $redisSuccess -and $appSuccess) {
        return 0
    } else {
        return 1
    }
}

# 执行主函数
if ($MyInvocation.InvocationName -eq ".") {
    # 被点 sourcing 时不执行
    return
}

$exitCode = Main
Write-Host "退出代码: $exitCode"
exit $exitCode
