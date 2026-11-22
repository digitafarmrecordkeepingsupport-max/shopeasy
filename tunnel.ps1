# ShopEasy - One-Click Ngrok Tunnel Launcher for PowerShell
Write-Host "========================================================" -ForegroundColor Magenta
Write-Host "  ShopEasy: Remote Tunnel for Expo Go (Ngrok)           " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "Starting internet tunnel via @expo/ngrok..." -ForegroundColor Cyan
Write-Host "This allows anyone outside your network to scan the QR code" -ForegroundColor Green
Write-Host "or open the 'exp://' link directly in Expo Go on their phone." -ForegroundColor Green
Write-Host ""

# Run expo start with ngrok tunnel flag
npx expo start --tunnel ngrok
