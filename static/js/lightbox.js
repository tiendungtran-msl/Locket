/* ========================================
   LIGHTBOX FUNCTIONALITY
   ======================================== */
let currentLightboxIndex = 0;

/* ========================================
   OPEN LIGHTBOX
   ======================================== */
function openLightbox(index) {
    if (!allImages || allImages.length === 0) return;
    
    currentLightboxIndex = index;
    const lightbox = document.getElementById('lightbox');
    
    if (lightbox) {
        lightbox.classList.add('active');
        updateLightbox();
        
        // Disable body scroll
        document.body.style.overflow = 'hidden';
        
        // Preload adjacent images
        preloadAdjacentImages();
    }
}

/* ========================================
   CLOSE LIGHTBOX
   ======================================== */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    
    if (lightbox) {
        lightbox.classList.remove('active');
        
        // Re-enable body scroll
        document.body.style.overflow = '';
    }
}

/* ========================================
   UPDATE LIGHTBOX CONTENT
   ======================================== */
function updateLightbox() {
    if (!allImages[currentLightboxIndex]) return;
    
    const img = allImages[currentLightboxIndex];
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxDate = document.getElementById('lightboxDate');
    
    if (lightboxImg) {
        // Fade out
        lightboxImg.style.opacity = '0';
        
        setTimeout(() => {
            lightboxImg.src = img.url;
            lightboxImg.alt = img.caption || 'Memory';
            
            // Fade in when loaded
            lightboxImg.onload = () => {
                lightboxImg.style.opacity = '1';
            };
        }, 150);
    }
    
    if (lightboxCaption) {
        lightboxCaption.textContent = img.caption || '💝 Khoảnh khắc đẹp';
    }
    
    if (lightboxDate) {
        lightboxDate.textContent = formatDate(img.uploaded_at);
    }
    
    // Update navigation visibility
    updateLightboxNavigation();
}

/* ========================================
   NAVIGATE LIGHTBOX
   ======================================== */
function navigateLightbox(direction) {
    currentLightboxIndex += direction;
    
    // Loop around
    if (currentLightboxIndex < 0) {
        currentLightboxIndex = allImages.length - 1;
    } else if (currentLightboxIndex >= allImages.length) {
        currentLightboxIndex = 0;
    }
    
    updateLightbox();
}

/* ========================================
   UPDATE NAVIGATION VISIBILITY
   ======================================== */
function updateLightboxNavigation() {
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    if (!prevBtn || !nextBtn) return;
    
    // Hide navigation if only one image
    if (allImages.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    }
}

/* ========================================
   DOWNLOAD CURRENT IMAGE
   ======================================== */
function downloadCurrentImage() {
    if (!allImages[currentLightboxIndex]) return;
    
    const img = allImages[currentLightboxIndex];
    const filename = img.filename || `memory-${Date.now()}.jpg`;
    downloadImage(img.url, filename);
}

/* ========================================
   DELETE FROM LIGHTBOX
   ======================================== */
function deleteFromLightbox() {
    if (!allImages[currentLightboxIndex]) return;
    
    const img = allImages[currentLightboxIndex];
    showDeleteConfirm(img.id);
    
    // Close lightbox when modal opens
    closeLightbox();
}

/* ========================================
   PRELOAD ADJACENT IMAGES
   ======================================== */
function preloadAdjacentImages() {
    const preloadIndexes = [
        currentLightboxIndex - 1,
        currentLightboxIndex + 1
    ];
    
    preloadIndexes.forEach(index => {
        if (index >= 0 && index < allImages.length) {
            const img = new Image();
            img.src = allImages[index].url;
        }
    });
}

/* ========================================
   KEYBOARD NAVIGATION
   ======================================== */
document.addEventListener('keydown', (e) => {
    const lightbox = document.getElementById('lightbox');
    
    if (lightbox && lightbox.classList.contains('active')) {
        switch(e.key) {
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
            case 'Escape':
                closeLightbox();
                break;
            case 'd':
            case 'D':
                downloadCurrentImage();
                break;
            case 'Delete':
                deleteFromLightbox();
                break;
        }
    }
});

/* ========================================
   TOUCH GESTURES
   ======================================== */
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        touchStartX = e.changedTouches[0].screenX;
    }
}, false);

document.addEventListener('touchend', (e) => {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && lightbox.classList.contains('active')) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }
}, false);

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next image
            navigateLightbox(1);
        } else {
            // Swipe right - previous image
            navigateLightbox(-1);
        }
    }
}

/* ========================================
   CLICK OUTSIDE TO CLOSE
   ======================================== */
document.addEventListener('click', (e) => {
    const lightbox = document.getElementById('lightbox');
    
    if (lightbox && e.target === lightbox) {
        closeLightbox();
    }
});

/* ========================================
   ZOOM FUNCTIONALITY (Optional)
   ======================================== */
let isZoomed = false;

function toggleZoom() {
    const lightboxImg = document.getElementById('lightboxImg');
    
    if (!lightboxImg) return;
    
    if (isZoomed) {
        lightboxImg.style.transform = 'scale(1)';
        lightboxImg.style.cursor = 'zoom-in';
        isZoomed = false;
    } else {
        lightboxImg.style.transform = 'scale(1.5)';
        lightboxImg.style.cursor = 'zoom-out';
        isZoomed = true;
    }
}

// Double click to zoom
document.addEventListener('dblclick', (e) => {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    
    if (lightbox && lightbox.classList.contains('active') && e.target === lightboxImg) {
        toggleZoom();
    }
});