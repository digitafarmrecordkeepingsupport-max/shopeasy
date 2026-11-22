# Sharing ShopEasy with Someone Outside Your Network (Ngrok + Expo Go)

By default, `npx expo start` only works if the phone and your computer are connected to the **same local Wi-Fi router** (LAN). 

If you want a client, teammate, tester, or friend located **anywhere in the world** (on mobile data 4G/5G, a different Wi-Fi network, or in another city/country) to test **ShopEasy** live on their phone, you can use **Ngrok Tunneling**.

---

## ⚡ Quick Start (One Command)

From the project folder (`shopy easy`), run any of these commands:

```bash
npm run tunnel
```
or
```bash
npx expo start --tunnel
```
or (on Windows PowerShell):
```powershell
.\tunnel.ps1
```

---

## 📱 How the Remote Person Opens the App

Once you run `npm run tunnel`, Metro bundler will spin up an **Ngrok reverse proxy tunnel** and print a QR code and an `exp://` link in your terminal, for example:

```text
› Metro waiting on exp://abc123-yourname.exp.direct:80
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Option A: Via QR Code (Easiest)
1. Take a screenshot of the QR code in your terminal.
2. Send the image to the person (via WhatsApp, Telegram, Slack, Email, etc.).
3. On their phone:
   - **Android**: Open **Expo Go** -> tap **Scan QR code** -> point camera at the image.
   - **iOS**: Open the native **Camera app** -> scan the QR code -> tap the yellow Expo banner.

### Option B: Via Direct `exp://` Link
1. Copy the `exp://...` link printed below the QR code in your terminal.
2. Send that link to the person.
3. On their phone:
   - Open **Expo Go**.
   - Tap **"Enter URL manually"** (or paste in their mobile browser).
   - Paste the `exp://...` link and press **Connect**.
   - The app downloads the bundle and opens the complete **ShopEasy** shopping experience!

---

## 🔑 Ngrok Account Authentication (If Prompted)

Ngrok occasionally requires a free account to prevent abuse. If Expo CLI asks for an ngrok authtoken:

1. Create a free account at [dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup).
2. Go to **Your Authtoken** in the left menu and copy your token string.
3. Configure it in your terminal:
   ```bash
   npx ngrok config add-authtoken YOUR_TOKEN_HERE
   ```
   *Or add it to your `.env` file:*
   ```env
   NGROK_AUTHTOKEN=YOUR_TOKEN_HERE
   ```
4. Run `npm run tunnel` again.

---

## 🛠️ How It Works Under the Hood

```
[ Your PC (Metro Bundler: 8081) ] 
               ▲
               │ Encrypted Secure Tunnel
               ▼
       [ Ngrok Global Edge ]
               ▲
               │ Public Internet (4G / 5G / Remote Wi-Fi)
               ▼
[ Remote Tester's Phone with Expo Go ]
```

- When you run `expo start --tunnel`, Expo automatically uses `@expo/ngrok` to establish an encrypted outbound connection to ngrok's edge servers.
- No router port forwarding or firewall adjustments are needed on your router.
- When the remote user opens the link in Expo Go, ngrok forwards bundle requests directly to your local Metro server and serves the React Native bundle in real time.
- Any code updates you make will also **hot reload** directly on their screen!

---

## ❓ Frequently Asked Questions

#### Q1: Does the other person need a computer or code?
**No.** All they need is a smartphone with the free **Expo Go** app installed from Google Play Store or Apple App Store.

#### Q2: Can they switch between Customer and Admin mode?
**Yes.** The app features an embedded **Role Switcher** pill on the Home and Profile screens, and one-tap demo logins for **Jane Doe (Customer)** and **Store Owner (Admin)** on the Login screen, so anyone testing remotely can evaluate the entire e-commerce experience.

#### Q3: What if the tunnel times out or closes?
If you close your computer terminal, the tunnel ends. To restart, just run `npm run tunnel` again and share the newly generated QR code or link.
