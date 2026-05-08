#!/usr/bin/env powershell

# 备份策略配置文件
# 功能：定义备份任务的执行时间、频率和其他参数

# 导出配置为JSON格式，方便其他脚本使用
function Export-BackupConfig {
    $config = @{
        directories = @{
            backup = Join-Path -Path $PSScriptRoot -ChildPath "..\data"
            logs = Join-Path -Path $PSScriptRoot -ChildPath "..\logs"
            scripts = $PSScriptRoot
        }
        retention = @{
            mysql = 7
            redis = 7
            app = 7
        }
        schedule = @{
            mysql = 1440
            redis = 1440
            app = 10080
        }
        timeWindow = @{
            start = "00:00"
            end = "06:00"
        }
        naming = @{
            mysql = "mysql-backup-{0}.sql.gz"
            redis = "redis-backup-{0}.rdb.gz"
            app = "app-backup-{0}.zip"
        }
        check = @{
            enabled = $true
            timeout = 3600
            retries = 3
        }
        notification = @{
            enabled = $false
            email = @{
                smtpServer = "smtp.example.com"
                smtpPort = 587
                username = "backup@example.com"
                password = "your_password"
                from = "backup@example.com"
                to = @("admin@example.com")
            }
        }
    }
    
    return $config | ConvertTo-Json -Depth 3
}

# 导入备份配置
function Import-BackupConfig {
    param(
        [string]$ConfigFile = ""
    )
    
    if ([string]::IsNullOrEmpty($ConfigFile)) {
        return Export-BackupConfig | ConvertFrom-Json
    }
    
    if (Test-Path -Path $ConfigFile) {
        return Get-Content -Path $ConfigFile -Raw | ConvertFrom-Json
    } else {
        Write-Warning "Config file not found: $ConfigFile, using default"
        return Export-BackupConfig | ConvertFrom-Json
    }
}

# 验证备份配置
function Test-BackupConfig {
    param(
        [object]$Config
    )
    
    $errors = @()
    
    if (!($Config.directories -and $Config.directories.backup -and $Config.directories.logs)) {
        $errors += "Directory configuration incomplete"
    }
    
    if (!($Config.retention -and $Config.retention.mysql -gt 0 -and $Config.retention.redis -gt 0 -and $Config.retention.app -gt 0)) {
        $errors += "Retention policy configuration incomplete"
    }
    
    if (!($Config.schedule -and $Config.schedule.mysql -gt 0 -and $Config.schedule.redis -gt 0 -and $Config.schedule.app -gt 0)) {
        $errors += "Schedule configuration incomplete"
    }
    
    if (!($Config.timeWindow -and $Config.timeWindow.start -and $Config.timeWindow.end)) {
        $errors += "Time window configuration incomplete"
    }
    
    if ($errors.Count -gt 0) {
        return @{ valid = $false; errors = $errors }
    } else {
        return @{ valid = $true; errors = @() }
    }
}

# 获取下一次备份时间
function Get-NextBackupTime {
    param(
        [string]$Service,
        [object]$Config
    )
    
    $now = Get-Date
    $frequency = $Config.schedule.$Service
    
    $nextTime = $now.AddMinutes($frequency)
    
    $startHour, $startMinute = $Config.timeWindow.start -split ":"
    $endHour, $endMinute = $Config.timeWindow.end -split ":"
    
    $startTime = New-Object DateTime($now.Year, $now.Month, $now.Day, $startHour, $startMinute, 0)
    $endTime = New-Object DateTime($now.Year, $now.Month, $now.Day, $endHour, $endMinute, 0)
    
    if ($nextTime.Hour -lt $startHour -or $nextTime.Hour -ge $endHour) {
        $nextTime = $startTime.AddDays(1)
    }
    
    return $nextTime
}

# 导出配置为JSON文件
$configJson = Export-BackupConfig
$configFile = Join-Path -Path $PSScriptRoot -ChildPath "..\backup-config.json"
$configJson | Out-File -FilePath $configFile -Force

Write-Host "Backup config exported to: $configFile"
Write-Host ""
Write-Host "Current backup config:"
Write-Host $configJson

# 验证配置
$config = Import-BackupConfig -ConfigFile $configFile
$validation = Test-BackupConfig -Config $config

if ($validation.valid) {
    Write-Host ""
    Write-Host "✅ Config validation passed"
    
    Write-Host ""
    Write-Host "Next backup times:"
    Write-Host "MySQL: $(Get-NextBackupTime -Service "mysql" -Config $config)"
    Write-Host "Redis: $(Get-NextBackupTime -Service "redis" -Config $config)"
    Write-Host "App: $(Get-NextBackupTime -Service "app" -Config $config)"
} else {
    Write-Host ""
    Write-Host "❌ Config validation failed:"
    foreach ($error in $validation.errors) {
        Write-Host "- $error"
    }
}
