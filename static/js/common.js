/* ========================================
   GLOBAL VARIABLES
   ======================================== */
let allImages = [];

/* ========================================
   FLOATING HEARTS
   ======================================== */
function createFloatingHearts() {
    const container = document.querySelector('.floating-hearts-container');
    if (!container) return;
    
    const hearts = ['💖', '💝', '💗', '💓', '💕', '💞', '❤️', '🌹', '💘'];
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 5 + 10) + 's';
        heart.style.fontSize = (Math.random() * 10 + 15) + 'px';
        heart.style.opacity = Math.random() * 0.5 + 0.3;
        container.appendChild(heart);
        
        setTimeout(() => heart.remove(), 15000);
    }, 3000);
}

// Khởi tạo khi DOM loaded
document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
});

/* ========================================
   DATE FORMATTING
   ======================================== */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '📅 Hôm nay';
    if (days === 1) return '📅 Hôm qua';
    if (days < 7) return `📅 ${days} ngày trước`;
    if (days < 30) {
        const weeks = Math.floor(days / 7);
        return `📅 ${weeks} tuần trước`;
    }
    if (days < 365) {
        const months = Math.floor(days / 30);
        return `📅 ${months} tháng trước`;
    }
    
    return `📅 ${date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })}`;
}

/* ========================================
   MESSAGE DISPLAY
   ======================================== */
function showMessage(text, type = 'success') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) return;
    
    messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 5000);
}

/* ========================================
   API CALLS
   ======================================== */
const API_BASE_URL = window.location.origin;

async function fetchImages() {
    try {
        const response = await fetch(`${API_BASE_URL}/images`);
        const data = await response.json();
        
        if (data.success) {
            allImages = data.images;
            return data;
        } else {
            throw new Error(data.error || 'Không thể tải ảnh');
        }
    } catch (error) {
        console.error('Error fetching images:', error);
        throw error;
    }
}

async function uploadImage(file, caption) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    
    try {
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Upload thất bại');
        }
        
        return data;
    } catch (error) {
        console.error('Error uploading:', error);
        throw error;
    }
}

async function deleteImage(imageId) {
    try {
        const response = await fetch(`${API_BASE_URL}/delete/${imageId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Xóa thất bại');
        }
        
        return data;
    } catch (error) {
        console.error('Error deleting:', error);
        throw error;
    }
}

/* ========================================
   DOWNLOAD IMAGE
   ======================================== */
async function downloadImage(url, filename = 'memory.jpg') {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
        
        showMessage('✅ Đã tải ảnh về máy!', 'success');
    } catch (error) {
        console.error('Download error:', error);
        showMessage('❌ Lỗi khi tải ảnh!', 'error');
    }
}

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ========================================
   KEYBOARD SHORTCUTS
   ======================================== */
document.addEventListener('keydown', (e) => {
    // ESC to close modals
    if (e.key === 'Escape') {
        const lightbox = document.getElementById('lightbox');
        const slideshow = document.getElementById('slideshow');
        const modal = document.getElementById('confirmModal');
        const musicMenu = document.getElementById('musicMenu');
        
        if (lightbox && lightbox.classList.contains('active')) {
            closeLightbox();
        } else if (slideshow && slideshow.classList.contains('active')) {
            stopSlideshow();
        } else if (modal && modal.classList.contains('active')) {
            closeModal();
        } else if (musicMenu && musicMenu.classList.contains('active')) {
            musicMenu.classList.remove('active');
        }
    }
});

/* ========================================
   LOADING STATE
   ======================================== */
function setLoadingState(element, isLoading) {
    if (!element) return;
    
    if (isLoading) {
        element.disabled = true;
        element.dataset.originalText = element.innerHTML;
        element.innerHTML = '<span class="spinner"></span> Đang xử lý...';
    } else {
        element.disabled = false;
        element.innerHTML = element.dataset.originalText;
    }
}

/* ========================================
   ERROR HANDLING
   ======================================== */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});