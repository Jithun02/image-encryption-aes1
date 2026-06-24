const express = require('express');
const multer = require('multer');
const CryptoJS = require('crypto-js');
const path = require('path');

const app = express();
const upload = multer();

app.use(express.json({ limit: '20mb' }));

// Serve the static web app
app.use(express.static(path.join(__dirname, 'deep aes', 'image-encryption-app')));

function encryptImage(base64Data, password) {
  const salt = CryptoJS.lib.WordArray.random(128/8);
  const iv = CryptoJS.lib.WordArray.random(128/8);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256/32,
    iterations: 1000
  });

  const encrypted = CryptoJS.AES.encrypt(base64Data, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  return {
    salt: salt.toString(),
    iv: iv.toString(),
    encrypted: encrypted.toString()
  };
}

function decryptImage(encryptedData, password) {
  const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
  const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
  const ciphertext = encryptedData.encrypted;

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 1000
  });

  const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  const base64 = decrypted.toString(CryptoJS.enc.Utf8);
  if (!base64) return null;
  if (!base64.startsWith('data:image')) {
    return 'data:image/png;base64,' + base64;
  }
  return base64;
}

// POST /encrypt - multipart form with field 'image' and 'password'
app.post('/encrypt', upload.single('image'), (req, res) => {
  try {
    const password = req.body.password || req.query.password || (req.file && req.file.password);
    if (!password) return res.status(400).json({ error: 'Missing password' });

    if (!req.file || !req.file.buffer) return res.status(400).json({ error: 'Missing image file' });

    const base64 = Buffer.from(req.file.buffer).toString('base64');
    const encrypted = encryptImage(base64, password);
    return res.json(encrypted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Encryption failed' });
  }
});

// POST /decrypt - JSON body { encryptedData: {salt, iv, encrypted}, password }
app.post('/decrypt', (req, res) => {
  try {
    const { encryptedData, password } = req.body;
    if (!password || !encryptedData) return res.status(400).json({ error: 'Missing password or encryptedData' });

    const dataUrl = decryptImage(encryptedData, password);
    if (!dataUrl) return res.status(400).json({ error: 'Decryption failed - bad password or data' });

    return res.json({ dataUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Decryption failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server listening on http://0.0.0.0:${PORT}`);
});
