/**
 * Image Encryption App
 * Client-side logic for the interactive dashboard.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // State Variables
    // ==========================================
    let encryptFileObj = null;
    let encryptDataUrl = null;
    let encryptedResultData = null;

    let decryptFileObj = null;
    let decryptedPayloadJson = null;
    let decryptedImageUrl = null;

    // ==========================================
    // Common Helpers
    // ==========================================
    function formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Toggle Password Visibility
    document.querySelectorAll('.password-toggle').forEach(toggleBtn => {
        toggleBtn.addEventListener('click', function() {
            const inputId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(inputId);
            const icon = this.querySelector('svg');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                // Switch to Eye Off icon
                icon.innerHTML = `
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                    <line x1="2" y1="2" x2="22" y2="22"/>
                `;
            } else {
                passwordInput.type = 'password';
                // Switch to Eye icon
                icon.innerHTML = `
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                `;
            }
        });
    });

    // Copy to Clipboard Utility
    const copyBtn = document.getElementById('copy-metadata-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const codeEl = document.getElementById('meta-json-display');
            if (codeEl) {
                navigator.clipboard.writeText(codeEl.textContent)
                    .then(() => {
                        const originalText = copyBtn.innerHTML;
                        copyBtn.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><polyline points="20 6 9 17 4 12"/></svg>
                            Copied!
                        `;
                        copyBtn.classList.add('btn-success-flash');
                        setTimeout(() => {
                            copyBtn.innerHTML = originalText;
                            copyBtn.classList.remove('btn-success-flash');
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Failed to copy: ', err);
                    });
            }
        });
    }

    // ==========================================
    // Tab Switching Logic
    // ==========================================
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');

            // Remove active states
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            // Add active states
            tab.classList.add('active');
            document.getElementById(`${targetTab}-pane`).classList.add('active');
        });
    });

    // ==========================================
    // Encryption Flow
    // ==========================================
    const encDropzone = document.getElementById('enc-dropzone');
    const encFileInput = document.getElementById('enc-file-input');
    const encPasswordInput = document.getElementById('encrypt-password');
    const encSubmitBtn = document.getElementById('encrypt-submit-btn');
    
    // File Card Elements
    const encFileCard = document.getElementById('enc-file-card');
    const encCardPreview = document.getElementById('enc-card-preview');
    const encCardName = document.getElementById('enc-card-name');
    const encCardSize = document.getElementById('enc-card-size');
    const encCardDimensions = document.getElementById('enc-card-dimensions');
    const encCardRemove = document.getElementById('enc-card-remove');

    // Password strength elements
    const strengthMeter = document.getElementById('strength-meter-bar');
    const strengthLabel = document.getElementById('strength-label');

    // Trigger File Input Click
    encDropzone.addEventListener('click', () => encFileInput.click());

    // Drag Over/Leave for Dropzone
    ['dragenter', 'dragover'].forEach(eventName => {
        encDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            encDropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        encDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            encDropzone.classList.remove('dragover');
        }, false);
    });

    // Drop Files
    encDropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            encFileInput.files = files;
            processEncryptFile(files[0]);
        }
    });

    // Change File via Input
    encFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            processEncryptFile(this.files[0]);
        }
    });

    // Process uploaded encryption file
    function processEncryptFile(file) {
        if (!file.type.startsWith('image/')) {
            showNotification('Error', 'Please select a valid image file (PNG, JPG, WebP, etc.)', 'error');
            return;
        }

        encryptFileObj = file;
        encCardName.textContent = file.name;
        encCardSize.textContent = formatBytes(file.size);

        // Load image data URL and preview
        const reader = new FileReader();
        reader.onload = (e) => {
            encryptDataUrl = e.target.result;
            encCardPreview.src = encryptDataUrl;
            
            // Get dimensions
            const img = new Image();
            img.onload = () => {
                encCardDimensions.textContent = `${img.width} × ${img.height} px`;
            };
            img.src = encryptDataUrl;

            // Update UI
            encDropzone.classList.add('hidden');
            encFileCard.classList.remove('hidden');
            validateEncryptForm();
        };
        reader.onerror = () => {
            showNotification('Error', 'Error reading your image file', 'error');
        };
        reader.readAsDataURL(file);
    }

    // Remove selected encryption file
    encCardRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        resetEncryptInput();
    });

    function resetEncryptInput() {
        encryptFileObj = null;
        encryptDataUrl = null;
        encFileInput.value = '';
        encDropzone.classList.remove('hidden');
        encFileCard.classList.add('hidden');
        encCardPreview.src = '';
        encCardDimensions.textContent = 'Calculating...';
        validateEncryptForm();
    }

    // Dynamic Password Strength Calculator
    encPasswordInput.addEventListener('input', () => {
        const password = encPasswordInput.value;
        const strength = evaluatePasswordStrength(password);
        
        // Update Strength Meter UI
        strengthMeter.className = 'strength-bar-progress'; // reset
        if (password.length === 0) {
            strengthMeter.style.width = '0%';
            strengthLabel.textContent = 'Enter a password';
            strengthLabel.className = 'strength-label-text';
        } else {
            strengthMeter.style.width = `${strength.percentage}%`;
            strengthMeter.classList.add(strength.class);
            strengthLabel.textContent = strength.text;
            strengthLabel.className = `strength-label-text ${strength.textClass}`;
        }
        
        validateEncryptForm();
    });

    function evaluatePasswordStrength(password) {
        if (!password) return { percentage: 0, text: 'Empty', class: '', textClass: '' };
        
        let score = 0;
        
        // Criteria
        if (password.length >= 8) score += 20;
        if (password.length >= 12) score += 10;
        if (/[a-z]/.test(password)) score += 15;
        if (/[A-Z]/.test(password)) score += 15;
        if (/[0-9]/.test(password)) score += 20;
        if (/[^A-Za-z0-9]/.test(password)) score += 20;

        let level = { percentage: score, text: 'Weak', class: 'weak', textClass: 'txt-weak' };
        if (score >= 80) {
            level.text = 'Unbreakable';
            level.class = 'excellent';
            level.textClass = 'txt-excellent';
        } else if (score >= 60) {
            level.text = 'Strong';
            level.class = 'strong';
            level.textClass = 'txt-strong';
        } else if (score >= 40) {
            level.text = 'Moderate';
            level.class = 'moderate';
            level.textClass = 'txt-moderate';
        }

        return level;
    }

    // Validate Form
    function validateEncryptForm() {
        if (encryptFileObj && encPasswordInput.value.length > 0) {
            encSubmitBtn.disabled = false;
        } else {
            encSubmitBtn.disabled = true;
        }
    }

    // Encrypt Action
    encSubmitBtn.addEventListener('click', () => {
        if (!encryptDataUrl || !encPasswordInput.value) return;

        const loadingOverlay = document.getElementById('encrypt-loading-overlay');
        loadingOverlay.classList.remove('hidden');
        encSubmitBtn.disabled = true;

        // Run async via setTimeout to prevent freezing UI during crypto calculation
        setTimeout(() => {
            try {
                encryptedResultData = encryptImage(encryptDataUrl, encPasswordInput.value);

                // Populate results UI
                const resultBox = document.getElementById('encrypt-result-box');
                const metaDisplay = document.getElementById('meta-json-display');
                
                // Show snippet of ciphertext for preview, keep details technical
                const metadataSnippet = {
                    algorithm: 'AES-256-CBC',
                    keyDerivation: 'PBKDF2 (1000 iterations)',
                    salt: encryptedResultData.salt,
                    iv: encryptedResultData.iv,
                    ciphertext: encryptedResultData.encrypted.substring(0, 50) + '...'
                };
                metaDisplay.textContent = JSON.stringify(metadataSnippet, null, 4);

                // Show success screen
                loadingOverlay.classList.add('hidden');
                resultBox.classList.remove('hidden');
                document.getElementById('encrypt-form-box').classList.add('hidden');
            } catch (err) {
                console.error(err);
                loadingOverlay.classList.add('hidden');
                encSubmitBtn.disabled = false;
                showNotification('Encryption Failed', err.message || 'An error occurred during encryption.', 'error');
            }
        }, 300);
    });

    // Download Encrypted File
    const downloadEncBtn = document.getElementById('download-encrypted-btn');
    if (downloadEncBtn) {
        downloadEncBtn.addEventListener('click', () => {
            if (!encryptedResultData || !encryptFileObj) return;

            const blob = new Blob([JSON.stringify(encryptedResultData)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${encryptFileObj.name}.enc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showNotification('Success', 'Encrypted file downloaded successfully!', 'success');
        });
    }

    // Reset/Clear Encrypt Form
    const clearEncBtn = document.getElementById('clear-encrypt-btn');
    if (clearEncBtn) {
        clearEncBtn.addEventListener('click', () => {
            resetEncryptInput();
            encPasswordInput.value = '';
            strengthMeter.style.width = '0%';
            strengthLabel.textContent = 'Enter a password';
            strengthLabel.className = 'strength-label-text';
            
            // Hide result, show form
            document.getElementById('encrypt-result-box').classList.add('hidden');
            document.getElementById('encrypt-form-box').classList.remove('hidden');
        });
    }

    // ==========================================
    // Decryption Flow
    // ==========================================
    const decDropzone = document.getElementById('dec-dropzone');
    const decFileInput = document.getElementById('dec-file-input');
    const decPasswordInput = document.getElementById('decrypt-password');
    const decSubmitBtn = document.getElementById('decrypt-submit-btn');

    // File Card Elements
    const decFileCard = document.getElementById('dec-file-card');
    const decCardName = document.getElementById('dec-card-name');
    const decCardSize = document.getElementById('dec-card-size');
    const decCardRemove = document.getElementById('dec-card-remove');

    // Trigger File Input Click
    decDropzone.addEventListener('click', () => decFileInput.click());

    // Drag Over/Leave for Decrypt
    ['dragenter', 'dragover'].forEach(eventName => {
        decDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            decDropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        decDropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            decDropzone.classList.remove('dragover');
        }, false);
    });

    // Drop encrypted file
    decDropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            decFileInput.files = files;
            processDecryptFile(files[0]);
        }
    });

    // Change File via Input
    decFileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            processDecryptFile(this.files[0]);
        }
    });

    // Process decrypted file upload
    function processDecryptFile(file) {
        // We expect .enc or json files
        const nameLower = file.name.toLowerCase();
        if (!nameLower.endsWith('.enc') && !nameLower.endsWith('.json')) {
            showNotification('Error', 'Please select a valid encrypted image file (.enc or .json)', 'error');
            return;
        }

        decFileObj = file;
        decCardName.textContent = file.name;
        decCardSize.textContent = formatBytes(file.size);

        // Read file contents
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                decryptedPayloadJson = JSON.parse(text);

                // Verify file structure roughly
                if (!decryptedPayloadJson.salt || !decryptedPayloadJson.iv || !decryptedPayloadJson.encrypted) {
                    throw new Error('File does not match the valid encrypted envelope structure.');
                }

                // Update UI
                decDropzone.classList.add('hidden');
                decFileCard.classList.remove('hidden');
                validateDecryptForm();
            } catch (err) {
                console.error(err);
                resetDecryptInput();
                showNotification('Invalid File', 'This file is corrupted or is not a valid encrypted envelope.', 'error');
            }
        };
        reader.onerror = () => {
            showNotification('Error', 'Error reading your encrypted file', 'error');
        };
        reader.readAsText(file);
    }

    // Remove decrypted file
    decCardRemove.addEventListener('click', (e) => {
        e.stopPropagation();
        resetDecryptInput();
    });

    function resetDecryptInput() {
        decFileObj = null;
        decryptedPayloadJson = null;
        decFileInput.value = '';
        decDropzone.classList.remove('hidden');
        decFileCard.classList.add('hidden');
        validateDecryptForm();
    }

    // Validate Form
    decPasswordInput.addEventListener('input', validateDecryptForm);

    function validateDecryptForm() {
        if (decFileObj && decryptedPayloadJson && decPasswordInput.value.length > 0) {
            decSubmitBtn.disabled = false;
        } else {
            decSubmitBtn.disabled = true;
        }
    }

    // Decrypt Action
    decSubmitBtn.addEventListener('click', () => {
        if (!decryptedPayloadJson || !decPasswordInput.value) return;

        const loadingOverlay = document.getElementById('decrypt-loading-overlay');
        loadingOverlay.classList.remove('hidden');
        decSubmitBtn.disabled = true;

        setTimeout(() => {
            try {
                decryptedImageUrl = decryptImage(decryptedPayloadJson, decPasswordInput.value);

                // Update preview image
                const previewImg = document.getElementById('dec-result-preview');
                const dimensionsEl = document.getElementById('dec-result-dimensions');
                const formatEl = document.getElementById('dec-result-format');
                
                previewImg.src = decryptedImageUrl;
                
                // Get format
                const match = decryptedImageUrl.match(/^data:image\/(\w+);base64,/);
                formatEl.textContent = match ? match[1].toUpperCase() : 'UNKNOWN';

                // Get dimensions
                const img = new Image();
                img.onload = () => {
                    dimensionsEl.textContent = `${img.width} × ${img.height} px`;
                };
                img.src = decryptedImageUrl;

                // Show success screen
                loadingOverlay.classList.add('hidden');
                document.getElementById('decrypt-result-box').classList.remove('hidden');
                document.getElementById('decrypt-form-box').classList.add('hidden');
            } catch (err) {
                console.error(err);
                loadingOverlay.classList.add('hidden');
                decSubmitBtn.disabled = false;
                showNotification('Decryption Failed', 'Invalid password or corrupted file structure. Please try again.', 'error');
            }
        }, 400);
    });

    // Download Decrypted File
    const downloadDecBtn = document.getElementById('download-decrypted-btn');
    if (downloadDecBtn) {
        downloadDecBtn.addEventListener('click', () => {
            if (!decryptedImageUrl || !decFileObj) return;

            // Try to extract original name
            let downloadName = 'decrypted_image';
            const nameLower = decFileObj.name.toLowerCase();
            if (nameLower.endsWith('.enc')) {
                // remove .enc
                downloadName = decFileObj.name.substring(0, decFileObj.name.length - 4);
            } else {
                // fall back to default + original extension from data url
                const match = decryptedImageUrl.match(/^data:image\/(\w+);base64,/);
                const ext = match ? match[1] : 'png';
                downloadName = `decrypted_image.${ext}`;
            }

            const link = document.createElement('a');
            link.href = decryptedImageUrl;
            link.download = downloadName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showNotification('Success', 'Decrypted image downloaded successfully!', 'success');
        });
    }

    // Reset/Clear Decrypt Form
    const clearDecBtn = document.getElementById('clear-decrypt-btn');
    if (clearDecBtn) {
        clearDecBtn.addEventListener('click', () => {
            resetDecryptInput();
            decPasswordInput.value = '';
            
            // Hide result, show form
            document.getElementById('decrypt-result-box').classList.add('hidden');
            document.getElementById('decrypt-form-box').classList.remove('hidden');
        });
    }

    // ==========================================
    // Toast Notification System
    // ==========================================
    const notificationContainer = document.getElementById('notification-container');

    function showNotification(title, message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `toast-card toast-${type}`;

        const iconSvg = type === 'success' ? 
            `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` : 
            `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

        notification.innerHTML = `
            <div class="toast-icon">${iconSvg}</div>
            <div class="toast-body">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close-btn" aria-label="Close message">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        `;

        notificationContainer.appendChild(notification);

        // Slide in
        setTimeout(() => notification.classList.add('visible'), 50);

        // Close action
        const closeBtn = notification.querySelector('.toast-close-btn');
        closeBtn.addEventListener('click', () => dismissToast(notification));

        // Auto dismiss after 4 seconds
        setTimeout(() => {
            if (notification.parentNode) dismissToast(notification);
        }, 4000);
    }

    function dismissToast(notification) {
        notification.classList.remove('visible');
        notification.classList.add('slide-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
});
