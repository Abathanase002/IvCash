# IvCash Deployment Guide
# ========================

Write-Host "🚀 IvCash Deployment Script" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

# Check if Railway CLI is installed
$railwayCli = Get-Command railway -ErrorAction SilentlyContinue
if (-not $railwayCli) {
    Write-Host "📦 Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

Write-Host "🔐 Please login to Railway if not already logged in:" -ForegroundColor Yellow
railway login

Write-Host ""
Write-Host "📋 Deployment Options:" -ForegroundColor Cyan
Write-Host "1. Deploy Backend API"
Write-Host "2. Deploy Admin Dashboard"
Write-Host "3. Deploy Both"
Write-Host "4. View Deployment Status"
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "🔧 Deploying Backend..." -ForegroundColor Green
        Set-Location -Path "backend"
        railway up
        Set-Location -Path ".."
    }
    "2" {
        Write-Host "🎨 Deploying Admin Dashboard..." -ForegroundColor Green
        Set-Location -Path "admin-dashboard"
        railway up
        Set-Location -Path ".."
    }
    "3" {
        Write-Host "🔧 Deploying Backend..." -ForegroundColor Green
        Set-Location -Path "backend"
        railway up
        Set-Location -Path ".."
        
        Write-Host "🎨 Deploying Admin Dashboard..." -ForegroundColor Green
        Set-Location -Path "admin-dashboard"
        railway up
        Set-Location -Path ".."
    }
    "4" {
        Write-Host "📊 Opening Railway Dashboard..." -ForegroundColor Green
        railway open
    }
    default {
        Write-Host "Invalid option" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Your apps will be available at:" -ForegroundColor Cyan
Write-Host "   API: https://your-project.up.railway.app"
Write-Host "   Admin: https://your-admin.up.railway.app"
