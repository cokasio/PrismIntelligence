# PowerShell Script to Install and Setup Gemini CLI for Windows
Write-Host "🚀 Installing Gemini CLI and Google Cloud SDK..." -ForegroundColor Cyan

# Step 1: Check if Google Cloud SDK is already installed
$gcloudPath = Get-Command gcloud -ErrorAction SilentlyContinue
if ($gcloudPath) {
    Write-Host "✅ Google Cloud SDK already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Downloading Google Cloud SDK installer..." -ForegroundColor Yellow
    
    # Download the installer
    $installerUrl = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
    $installerPath = "$env:TEMP\GoogleCloudSDKInstaller.exe"
    
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
    
    Write-Host "📥 Running installer (follow the GUI prompts)..." -ForegroundColor Yellow
    Start-Process -FilePath $installerPath -Wait
    
    Write-Host "✅ Google Cloud SDK installed successfully!" -ForegroundColor Green
}

# Step 2: Update gcloud components
Write-Host "`n📦 Updating gcloud components..." -ForegroundColor Yellow
gcloud components update --quiet

# Step 3: Install Vertex AI component (includes Gemini)
Write-Host "`n🧠 Installing Vertex AI components..." -ForegroundColor Yellow
gcloud components install vertex-ai --quiet

# Step 4: Check if authenticated
Write-Host "`n🔐 Checking authentication status..." -ForegroundColor Yellow
$authList = gcloud auth list --format="value(account)" 2>$null
if (-not $authList) {
    Write-Host "📝 No authentication found. Starting login process..." -ForegroundColor Yellow
    gcloud auth login
} else {
    Write-Host "✅ Already authenticated as: $authList" -ForegroundColor Green
}

# Step 5: Set up application default credentials
Write-Host "`n🔑 Setting up application default credentials..." -ForegroundColor Yellow
gcloud auth application-default login

# Step 6: Create/Update .env file with Gemini configuration
Write-Host "`n⚙️ Updating environment configuration..." -ForegroundColor Yellow

$envPath = "C:\Dev\PrismIntelligence\.env"
$envContent = Get-Content $envPath -Raw

# Check if Gemini config already exists
if ($envContent -notmatch "GOOGLE_CLOUD_PROJECT") {
    $geminiConfig = @"

# Google Cloud / Gemini Configuration
# Get your project ID from https://console.cloud.google.com
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_REGION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=C:\Users\$env:USERNAME\.config\gcloud\application_default_credentials.json

# Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-1.5-pro
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.7
"@
    
    Add-Content -Path $envPath -Value $geminiConfig
    Write-Host "✅ Added Gemini configuration to .env file" -ForegroundColor Green
    Write-Host "⚠️  Please update your project ID and API key in .env file" -ForegroundColor Yellow
} else {
    Write-Host "✅ Gemini configuration already exists in .env" -ForegroundColor Green
}

Write-Host "`n🎉 Gemini CLI setup complete!" -ForegroundColor Green
Write-Host "`n📚 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update your Google Cloud project ID in .env file"
Write-Host "2. Get your Gemini API key from https://makersuite.google.com/app/apikey"
Write-Host "3. Run 'gcloud config list' to verify your setup"
Write-Host "4. Test with: gcloud vertex-ai models list --region=us-central1"
