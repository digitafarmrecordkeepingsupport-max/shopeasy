/**
 * ShopEasy - Ngrok Remote Tunnel Launcher
 * Allows anyone outside your local Wi-Fi / cellular network to preview
 * the ShopEasy application on Expo Go across the internet.
 */

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n========================================================');
console.log('🚀 ShopEasy - Starting Remote Ngrok Tunnel for Expo Go');
console.log('========================================================\n');
console.log('This will create an internet-accessible tunnel so anyone');
console.log('outside your Wi-Fi network can test the app on Expo Go.\n');

// 1. Check if user configured custom NGROK_AUTHTOKEN in .env
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/NGROK_AUTHTOKEN=(.+)/);
  if (match && match[1] && !match[1].includes('your-ngrok-token')) {
    const token = match[1].trim();
    try {
      console.log('Configuring ngrok authtoken from .env...');
      execSync(`npx ngrok config add-authtoken ${token}`, { stdio: 'inherit' });
    } catch (e) {
      // Continue even if setting authtoken had non-fatal warning
    }
  }
}

// 2. Launch Expo with --tunnel flag (built-in @expo/ngrok)
console.log('Launching Expo with --tunnel (@expo/ngrok)...\n');
console.log('When the QR code appears:');
console.log('1. Anyone outside your network can scan the QR code with Expo Go.');
console.log('2. Or you can send them the "exp://" URL printed in the terminal.\n');

const expoProcess = spawn('npx', ['expo', 'start', '--tunnel', 'ngrok'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    EXPO_USE_NGROK: 'true',
  },
});

expoProcess.on('close', (code) => {
  console.log(`\nExpo process exited with code ${code}`);
});

process.on('SIGINT', () => {
  expoProcess.kill('SIGINT');
  process.exit(0);
});
