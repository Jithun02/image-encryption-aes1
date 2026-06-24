<div align="center">

<img src="https://img.shields.io/badge/AES--256-CBC-blueviolet?style=for-the-badge&logo=shield&logoColor=white" />
<img src="https://img.shields.io/badge/100%25-Client--Side-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/Zero-Server%20Storage-0ea5e9?style=for-the-badge" />
<img src="https://img.shields.io/badge/PBKDF2-Key%20Derivation-f59e0b?style=for-the-badge" />
<img src="https://img.shields.io/badge/GitHub-Pages-orange?style=for-the-badge&logo=github" />

# 🔐 Cryptix — AES-256 Image Cryptography

**A professional, military-grade image encryption & decryption tool that runs entirely in your browser.**  
No servers. No uploads. No data leaves your machine — ever.

[🌐 **Live Demo →**](https://jithun02.github.io/image-encryption-aes1/) &nbsp; | &nbsp; [📁 Source Code](https://github.com/Jithun02/image-encryption-aes1) &nbsp; | &nbsp; [🐛 Report Bug](https://github.com/Jithun02/image-encryption-aes1/issues)

---

![Cryptix Screenshot](deep%20aes/image-encryption-app/output/01_encrypt_home.png)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Cryptographic Architecture](#-cryptographic-architecture)
- [How It Works](#-how-it-works)
- [Supported Formats](#-supported-formats)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development)
- [GitHub Pages Deployment](#-github-pages-deployment)
- [Output Screenshots](#-output-screenshots)
- [Security Model](#-security-model)
- [Tech Stack](#-tech-stack)
- [Author](#-author)

---

## 🌟 Overview

**Cryptix** is a client-side AES-256 image encryption and decryption application built with vanilla HTML, CSS, and JavaScript. It uses the [CryptoJS](https://github.com/brix/crypto-js) library to perform all cryptographic operations directly inside the browser sandbox — meaning your images and passwords are **never transmitted** to any server.

> 💡 You can even disconnect from the internet after loading the page, and the tool will still work perfectly.

---

## 🌐 Live Demo

> **➡️ Access the live app here:** [https://jithun02.github.io/image-encryption-aes1/](https://jithun02.github.io/image-encryption-aes1/)

Hosted for free via **GitHub Pages** using a CI/CD GitHub Actions pipeline.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔒 **AES-256-CBC Encryption** | Military-grade 256-bit block cipher encryption |
| 🔑 **PBKDF2 Key Derivation** | Password strengthened through 1000 iterations |
| 🎲 **Random Salt & IV** | Unique salt and initialization vector per encryption |
| 📁 **Drag & Drop Upload** | Drag-and-drop or click-to-browse file interface |
| 👁️ **Password Toggle** | Show/hide password with visibility toggle |
| 📊 **Password Strength Meter** | Real-time strength scoring (Weak / Fair / Strong) |
| 📋 **Metadata Clipboard** | Copy cryptographic envelope JSON with one click |
| ⬇️ **Download Encrypted File** | Exports `.enc` JSON file with all cryptographic data |
| 🖼️ **Decrypted Preview** | Instant image preview after successful decryption |
| 📱 **Responsive Design** | Works on desktop, tablet, and mobile |
| 🌑 **Dark Mode UI** | Premium dark glassmorphism design |
| ⚡ **Zero Dependencies** | No npm, no build step, no server needed |

---

## 🔐 Cryptographic Architecture

### 1. AES-256-CBC Encryption
```
Image Data URL  ──►  AES-256-CBC  ──►  Ciphertext (Base64)
                         ▲
                    256-bit Key (from PBKDF2)
                    128-bit IV (random)
```

The app uses **AES (Advanced Encryption Standard)** with a **256-bit key** in **CBC (Cipher Block Chaining)** mode. Each 128-bit block of image data is XOR'd with the previous ciphertext block before encryption, preventing pattern analysis attacks.

---

### 2. PBKDF2 Key Derivation
```
User Password ──►  PBKDF2  ──►  256-bit AES Key
                     ▲
               Random 128-bit Salt
               1000 Iterations
               SHA-1 Hash Function
```

**PBKDF2 (Password-Based Key Derivation Function 2)** transforms the user's password into a cryptographically secure AES key. The 1000 iteration count means an attacker would need 1000× more compute to brute-force the key from the password.

---

### 3. Cryptographic Envelope (`.enc` file format)
Every encrypted file is stored as a structured JSON envelope:

```json
{
  "algo": "AES-256-CBC",
  "kdf": "PBKDF2",
  "iterations": 1000,
  "salt": "a1b2c3d4e5f6...",   // 128-bit hex-encoded random salt
  "iv":   "f6e5d4c3b2a1...",   // 128-bit hex-encoded random IV
  "ciphertext": "U2FsdGVkX1..."  // Base64-encoded AES ciphertext
}
```

---

### 4. Hex Salt & Initialization Vector
Every encryption generates a **fresh cryptographically random 128-bit salt and IV** via `CryptoJS.lib.WordArray.random()`. This means:
- Encrypting the same image with the same password **twice** will produce **two different ciphertexts**
- Prevents statistical pattern attacks and rainbow table lookups

---

### 5. Browser Sandbox Security
- ✅ All code runs inside the **browser's JavaScript sandbox**
- ✅ **No network requests** are made after page load
- ✅ Files are processed using the **File API** (in-memory only)
- ✅ The app works **completely offline** once loaded

---

## 🔄 How It Works

### Encryption Flow

```
┌─────────────────────────────────────────────────────────┐
│                    ENCRYPTION PIPELINE                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. User selects image file (PNG, JPEG, WEBP, etc.)     │
│            │                                             │
│            ▼                                             │
│  2. FileReader reads file → Base64 Data URL              │
│            │                                             │
│            ▼                                             │
│  3. Generate random 128-bit Salt + 128-bit IV            │
│            │                                             │
│            ▼                                             │
│  4. PBKDF2(password, salt, 1000 iter) → 256-bit Key     │
│            │                                             │
│            ▼                                             │
│  5. AES-256-CBC.encrypt(dataURL, key, IV)               │
│            │                                             │
│            ▼                                             │
│  6. Package → JSON envelope { salt, iv, ciphertext }    │
│            │                                             │
│            ▼                                             │
│  7. Download as filename.ext.enc                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Decryption Flow

```
┌─────────────────────────────────────────────────────────┐
│                    DECRYPTION PIPELINE                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. User uploads .enc file + enters password            │
│            │                                             │
│            ▼                                             │
│  2. Parse JSON → extract salt, iv, ciphertext           │
│            │                                             │
│            ▼                                             │
│  3. PBKDF2(password, salt, 1000 iter) → 256-bit Key     │
│            │                                             │
│            ▼                                             │
│  4. AES-256-CBC.decrypt(ciphertext, key, IV)            │
│            │                                             │
│            ▼                                             │
│  5. Verify output starts with "data:image/"             │
│            │                                             │
│            ▼                                             │
│  6. Render preview + enable Download button             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📂 Supported Formats

### Input (Encrypt)
| Format | Extension | Notes |
|--------|-----------|-------|
| JPEG | `.jpg`, `.jpeg` | Most common photo format |
| PNG | `.png` | Lossless, supports transparency |
| WebP | `.webp` | Modern web format |
| GIF | `.gif` | Animated images supported |
| SVG | `.svg` | Vector graphics |

### Input (Decrypt)
| Format | Extension | Notes |
|--------|-----------|-------|
| Encrypted Envelope | `.enc` | Output from this tool |
| JSON Envelope | `.json` | Alternative extension |

---

## 📁 Project Structure

```
image-encryption-aes1/
│
├── 📁 deep aes/image-encryption-app/   # Main web application
│   ├── 📄 index.html                   # Single-page application entry point
│   ├── 📁 css/
│   │   └── 📄 styles.css              # Full dark-mode premium UI styles
│   ├── 📁 js/
│   │   ├── 📄 crypto.js               # Core AES-256 encrypt/decrypt logic
│   │   ├── 📄 app.js                  # UI interactions, event handlers
│   │   └── 📄 crypto-js.js            # CryptoJS v4 bundled library
│   └── 📁 output/                     # App screenshots for documentation
│       ├── 🖼️ 01_encrypt_home.png
│       ├── 🖼️ 02_encryption_complete.png
│       ├── 🖼️ 03_decrypt_tab.png
│       └── 🖼️ 04_key_strength_visible.png
│
├── 📁 .github/
│   └── 📁 workflows/
│       └── 📄 deploy.yml              # GitHub Actions CI/CD pipeline
│
├── 📄 package.json                    # Node.js metadata (optional backend)
├── 📄 server.js                       # Optional Express server (local use)
├── 📄 .gitignore                      # Git ignore rules
└── 📄 README.md                       # This file
```

---

## 💻 Local Development

No build tools or package manager needed. Just serve the static files:

### Option 1: Using `serve` (recommended)
```bash
# Clone the repository
git clone https://github.com/Jithun02/image-encryption-aes1.git
cd image-encryption-aes1

# Serve the app
npx serve "deep aes/image-encryption-app" -p 3000

# Open in browser
open http://localhost:3000
```

### Option 2: Using Python
```bash
cd "deep aes/image-encryption-app"
python3 -m http.server 3000
```

### Option 3: Using the included Express server
```bash
npm install
node server.js
# Open http://localhost:3000
```

> ⚠️ **Note:** Open via a local server, not by double-clicking `index.html`. Some browsers restrict the `File` API when opened from `file://` protocol.

---

## 🚀 GitHub Pages Deployment

This project is automatically deployed to GitHub Pages via a GitHub Actions workflow on every push to `main`.

### CI/CD Pipeline (`.github/workflows/deploy.yml`)

```yaml
name: Deploy Cryptix to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: 'deep aes/image-encryption-app'
      - uses: actions/deploy-pages@v4
```

### Manual Setup Steps (one-time)

1. Go to **Settings → Pages** in your GitHub repo
2. Under **Source**, select **`GitHub Actions`**
3. Push any commit to `main` — the workflow auto-deploys
4. Your site goes live at: `https://<username>.github.io/<repo-name>/`

---

## 🖼️ Output Screenshots

<table>
  <tr>
    <td align="center"><b>Encrypt Tab — File Loaded</b></td>
    <td align="center"><b>Encryption Complete</b></td>
  </tr>
  <tr>
    <td><img src="deep%20aes/image-encryption-app/output/01_encrypt_home.png" alt="Encrypt Home" width="400"/></td>
    <td><img src="deep%20aes/image-encryption-app/output/02_encryption_complete.png" alt="Encryption Complete" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><b>Decrypt Tab — .enc File Loaded</b></td>
    <td align="center"><b>Password Strength Indicator</b></td>
  </tr>
  <tr>
    <td><img src="deep%20aes/image-encryption-app/output/03_decrypt_tab.png" alt="Decrypt Tab" width="400"/></td>
    <td><img src="deep%20aes/image-encryption-app/output/04_key_strength_visible.png" alt="Key Strength" width="400"/></td>
  </tr>
</table>

---

## 🛡️ Security Model

| Threat | Protection |
|--------|------------|
| **Network interception** | No data ever leaves the browser |
| **Brute-force password** | PBKDF2 with 1000 iterations slows attacks |
| **Rainbow table attack** | Unique random salt per encryption |
| **Pattern analysis** | CBC mode + random IV prevents duplicate blocks |
| **Server breach** | No server exists — nothing to breach |
| **Replay attacks** | Fresh IV means identical inputs produce different outputs |

> ⚠️ **Important:** The security of your encrypted file depends entirely on the strength of your password. Use a strong, unique passphrase.

---

## 🧰 Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Application structure & semantic markup |
| **CSS3** | Dark glassmorphism UI, animations, responsive layout |
| **Vanilla JavaScript** | UI logic, event handling, FileReader API |
| **CryptoJS v4** | AES-256-CBC encryption & PBKDF2 key derivation |
| **GitHub Actions** | CI/CD pipeline for automatic deployment |
| **GitHub Pages** | Free static site hosting |

---

## 👨‍💻 Author

**Jithun** — [@Jithun02](https://github.com/Jithun02)

> 📧 mr.jithun@gmail.com

---

<div align="center">

**⭐ Star this repo if you found it useful!**

Made with ❤️ and AES-256 by [Jithun02](https://github.com/Jithun02)

![Footer](https://img.shields.io/badge/Built%20with-CryptoJS-blueviolet?style=flat-square) ![Footer](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-222?style=flat-square&logo=github) ![Footer](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>
