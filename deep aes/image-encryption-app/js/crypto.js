/**
 * Image Encryption/Decryption Module
 * This module provides functions for local client-side AES-256 encryption and decryption of image Data URLs.
 */

/**
 * Encrypt image Data URL using AES-256 encryption
 * @param {string} dataUrl - Full image data URL (e.g. data:image/png;base64,...)
 * @param {string} password - Password for key derivation
 * @returns {Object} Encrypted object with hex-encoded salt, iv, and ciphertext
 */
function encryptImage(dataUrl, password) {
    if (!dataUrl || !password) {
        throw new Error('Image data and password are required for encryption');
    }

    // Generate random 128-bit salt and 128-bit IV
    const salt = CryptoJS.lib.WordArray.random(128 / 8);
    const iv = CryptoJS.lib.WordArray.random(128 / 8);

    // Derive 256-bit key from password and salt using PBKDF2 (1000 iterations)
    const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 1000
    });

    // Encrypt the full Data URL
    const encrypted = CryptoJS.AES.encrypt(dataUrl, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    // Return the serializable encryption envelope
    return {
        salt: salt.toString(CryptoJS.enc.Hex),
        iv: iv.toString(CryptoJS.enc.Hex),
        encrypted: encrypted.toString()
    };
}

/**
 * Decrypt image Data URL using AES-256 decryption
 * @param {Object} encryptedData - The encryption envelope { salt, iv, encrypted }
 * @param {string} password - Password for key derivation
 * @returns {string} The decrypted image data URL
 */
function decryptImage(encryptedData, password) {
    if (!encryptedData || !encryptedData.salt || !encryptedData.iv || !encryptedData.encrypted) {
        throw new Error('Invalid or incomplete encrypted data structure');
    }
    if (!password) {
        throw new Error('Password is required for decryption');
    }

    // Parse hex-encoded salt and IV back to WordArrays
    const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
    const ciphertext = encryptedData.encrypted;

    // Derive key using the same PBKDF2 parameters
    const key = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 1000
    });

    // Decrypt the ciphertext
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC
    });

    // Convert WordArray back to UTF-8 string (our original Data URL)
    let decryptedDataUrl;
    try {
        decryptedDataUrl = decrypted.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        throw new Error('Decryption failed: Incorrect password or corrupted data.');
    }

    // Verify it is a valid data URL
    if (!decryptedDataUrl || !decryptedDataUrl.startsWith('data:image/')) {
        throw new Error('Decryption failed: Incorrect password or corrupted data.');
    }

    return decryptedDataUrl;
}
