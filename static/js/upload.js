/* ========================================
   UPLOAD PAGE - MAIN LOGIC
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    initUploadPage();
});

/* ========================================
   INITIALIZE UPLOAD PAGE
   ======================================== */
function initUploadPage() {
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const uploadForm = document.getElementById('uploadForm');
    const captionInput = document.getElementById('captionInput');
    const charCount = document.getElementById('charCount');
    const previewImage = document.getElementById('previewImage');
    const removePreview = document.getElementById('removePreview');
    
    // File input change handler
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Caption input character count
    if (captionInput && charCount) {
        captionInput.addEventListener('input', () => {
            charCount.textContent = captionInput.value.length;
        });
    }
    
    // Form submit handler
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUploadSubmit);
    }
    
    // Drag and drop support
    setupDragAndDrop();
    
    // Paste image support
    setupPasteImage();
}

/* ========================================
   FILE SELECT HANDLER
   ======================================== */
function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileName = document.getElementById('fileName');
    
    if (!file) {
        if (fileName) {
            fileName.textContent = 'Chưa chọn file';
        }
        removePreview();
        return;
    }
    
    // Validate file
    if (!validateFile(file)) {
        return;
    }
    
    // Update file name
    if (fileName) {
        fileName.textContent = file.name;
    }
    
    // Show preview
    showPreview(file);
}

/* ========================================
   FILE VALIDATION
   ======================================== */
function validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic'];
    const maxSize = 16 * 1024 * 1024; // 16MB
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
        showMessage('❌ Chỉ hỗ trợ file ảnh (JPG, PNG, GIF, WebP, HEIC)', 'error');
        return false;
    }
    
    // Check file size
    if (file.size > maxSize) {
        showMessage('❌ Kích thước file không được vượt quá 16MB', 'error');
        return false;
    }
    
    return true;
}

/* ========================================
   SHOW IMAGE PREVIEW
   ======================================== */
function showPreview(file) {
    const previewImage = document.getElementById('previewImage');
    const previewPlaceholder = document.querySelector('.preview-placeholder');
    const removeBtn = document.getElementById('removePreview');
    
    if (!previewImage) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewImage.classList.add('active');
        
        if (previewPlaceholder) {
            previewPlaceholder.style.display = 'none';
        }
        
        if (removeBtn) {
            removeBtn.classList.add('active');
        }
    };
    
    reader.onerror = () => {
        showMessage('❌ Không thể đọc file ảnh', 'error');
    };
    
    reader.readAsDataURL(file);
}

/* ========================================
   REMOVE PREVIEW
   ======================================== */
function removePreview() {
    const previewImage = document.getElementById('previewImage');
    const previewPlaceholder = document.querySelector('.preview-placeholder');
    const removeBtn = document.getElementById('removePreview');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    
    if (previewImage) {
        previewImage.src = '';
        previewImage.classList.remove('active');
    }
    
    if (previewPlaceholder) {
        previewPlaceholder.style.display = 'block';
    }
    
    if (removeBtn) {
        removeBtn.classList.remove('active');
    }
    
    if (fileInput) {
        fileInput.value = '';
    }
    
    if (fileName) {
        fileName.textContent = 'Chưa chọn file';
    }
}

/* ========================================
   UPLOAD FORM SUBMIT
   ======================================== */
async function handleUploadSubmit(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    const captionInput = document.getElementById('captionInput');
    const uploadBtn = document.getElementById('uploadBtn');
    
    if (!fileInput || !fileInput.files[0]) {
        showMessage('❌ Vui lòng chọn ảnh!', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    const caption = captionInput ? captionInput.value.trim() : '';
    
    // Validate again before upload
    if (!validateFile(file)) {
        return;
    }
    
    // Set loading state
    if (uploadBtn) {
        setLoadingState(uploadBtn, true);
    }
    
    try {
        const result = await uploadImage(file, caption);
        
        if (result.success) {
            showMessage(result.message, 'success');
            
            // Reset form
            fileInput.value = '';
            if (captionInput) {
                captionInput.value = '';
                const charCount = document.getElementById('charCount');
                if (charCount) charCount.textContent = '0';
            }
            
            removePreview();
            
            // Show success animation
            showSuccessAnimation();
            
            // Redirect to gallery after 2 seconds
            setTimeout(() => {
                window.location.href = '/gallery';
            }, 2000);
        } else {
            showMessage(result.error || '❌ Upload thất bại!', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showMessage('❌ Lỗi khi upload ảnh. Vui lòng thử lại!', 'error');
    } finally {
        if (uploadBtn) {
            setLoadingState(uploadBtn, false);
        }
    }
}

/* ========================================
   SUCCESS ANIMATION
   ======================================== */
function showSuccessAnimation() {
    // Create success overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(102, 126, 234, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        text-align: center;
        color: white;
        animation: scaleIn 0.5s ease;
    `;
    content.innerHTML = `
        <div style="font-size: 5rem; margin-bottom: 1rem;">✅</div>
        <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Thành công!</h2>
        <p style="font-size: 1.2rem;">Đang chuyển đến gallery...</p>
    `;
    
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.remove();
    }, 2000);
}

/* ========================================
   DRAG AND DROP SUPPORT
   ======================================== */
function setupDragAndDrop() {
    const uploadSection = document.querySelector('.upload-section');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadSection || !fileInput) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadSection.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadSection.addEventListener(eventName, () => {
            uploadSection.style.opacity = '0.7';
            uploadSection.style.transform = 'scale(0.98)';
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadSection.addEventListener(eventName, () => {
            uploadSection.style.opacity = '1';
            uploadSection.style.transform = 'scale(1)';
        }, false);
    });
    
    uploadSection.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect({ target: fileInput });
        }
    }, false);
}

/* ========================================
   PASTE IMAGE SUPPORT
   ======================================== */
function setupPasteImage() {
    const fileInput = document.getElementById('fileInput');
    
    if (!fileInput) return;
    
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                
                // Create a new File object from blob
                const file = new File([blob], `pasted-image-${Date.now()}.png`, {
                    type: blob.type
                });
                
                // Create FileList-like object
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                
                handleFileSelect({ target: fileInput });
                
                showMessage('📋 Đã dán ảnh từ clipboard!', 'success');
                
                break;
            }
        }
    });
}