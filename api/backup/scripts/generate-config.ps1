#!/usr/bin/env powershell

# 简单的备份配置生成脚本

$PSScriptRoot = Split-Path -Path $MyInvocation.MyCommand.Definition -Parent
$configFile = Join-Path -Path $PSScriptRoot -ChildPath "..\backup-config.json"

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

$configJson = $config | ConvertTo-Json -Depth 3
$configJson | Out-File -FilePath $configFile -Force

Write-Host "Backup config generated successfully: $configFile"
Write-Host ""
Write-Host "Config content:"
Write-Host $configJson
