/* ========================================
   SLIDESHOW FUNCTIONALITY
   ======================================== */
let slideshowIndex = 0;
let slideshowInterval = null;
let slideshowPaused = false;
const SLIDESHOW_DURATION = 4000; // 4 seconds per image

/* ========================================
   START SLIDESHOW
   ======================================== */
function startSlideshow() {
    if (!allImages || allImages.length === 0) {
        showMessage('❌ Chưa có ảnh để phát slideshow!', 'error');
        return;
    }
    
    slideshowIndex = 0;
    slideshowPaused = false;
    
    const slideshow = document.getElementById('slideshow');
    if (slideshow) {
        slideshow.classList.add('active');
        
        // Disable body scroll
        document.body.style.overflow = 'hidden';
        
        updateSlideshow();
        startSlideshowTimer();
    }
}

/* ========================================
   STOP SLIDESHOW
   ======================================== */
function stopSlideshow() {
    const slideshow = document.getElementById('slideshow');
    
    if (slideshow) {
        slideshow.classList.remove('active');
        
        // Re-enable body scroll
        document.body.style.overflow = '';
    }
    
    clearSlideshowTimer();
    slideshowPaused = false;
}

/* ========================================
   TOGGLE SLIDESHOW PLAY/PAUSE
   ======================================== */
function toggleSlideshow() {
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (slideshowPaused) {
        // Resume
        slideshowPaused = false;
        startSlideshowTimer();
        if (pauseBtn) {
            pauseBtn.textContent = '⏸️';
        }
    } else {
        // Pause
        slideshowPaused = true;
        clearSlideshowTimer();
        if (pauseBtn) {
            pauseBtn.textContent = '▶️';
        }
    }
}

/* ========================================
   UPDATE SLIDESHOW CONTENT
   ======================================== */
function updateSlideshow() {
    if (!allImages[slideshowIndex]) return;
    
    const img = allImages[slideshowIndex];
    const slideshowImg = document.getElementById('slideshowImg');
    const slideshowCaption = document.getElementById('slideshowCaption');
    const slideshowDate = document.getElementById('slideshowDate');
    const slideshowProgress = document.getElementById('slideshowProgress');
    
    if (slideshowImg) {
        // Fade effect
        slideshowImg.style.opacity = '0';
        
        setTimeout(() => {
            slideshowImg.src = img.url;
            slideshowImg.alt = img.caption || 'Memory';
            
            slideshowImg.onload = () => {
                slideshowImg.style.opacity = '1';
            };
        }, 200);
    }
    
    if (slideshowCaption) {
        slideshowCaption.textContent = img.caption || '💝 Khoảnh khắc đẹp';
    }
    
    if (slideshowDate) {
        slideshowDate.textContent = formatDate(img.uploaded_at);
    }
    
    if (slideshowProgress) {
        slideshowProgress.textContent = `${slideshowIndex + 1} / ${allImages.length}`;
    }
    
    // Preload next image
    preloadNextSlideshowImage();
}

/* ========================================
   SLIDESHOW TIMER
   ======================================== */
function startSlideshowTimer() {
    clearSlideshowTimer();
    
    slideshowInterval = setInterval(() => {
        if (!slideshowPaused) {
            nextSlide();
        }
    }, SLIDESHOW_DURATION);
}

function clearSlideshowTimer() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
}

/* ========================================
   NAVIGATE SLIDESHOW
   ======================================== */
function nextSlide() {
    slideshowIndex++;
    
    if (slideshowIndex >= allImages.length) {
        slideshowIndex = 0;
    }
    
    updateSlideshow();
}

function previousSlide() {
    slideshowIndex--;
    
    if (slideshowIndex < 0) {
        slideshowIndex = allImages.length - 1;
    }
    
    updateSlideshow();
}

/* ========================================
   PRELOAD NEXT IMAGE
   ======================================== */
function preloadNextSlideshowImage() {
    const nextIndex = (slideshowIndex + 1) % allImages.length;
    
    if (allImages[nextIndex]) {
        const img = new Image();
        img.src = allImages[nextIndex].url;
    }
}

/* ========================================
   KEYBOARD NAVIGATION FOR SLIDESHOW
   ======================================== */
document.addEventListener('keydown', (e) => {
    const slideshow = document.getElementById('slideshow');
    
    if (slideshow && slideshow.classList.contains('active')) {
        switch(e.key) {
            case 'ArrowLeft':
                previousSlide();
                startSlideshowTimer(); // Reset timer
                break;
            case 'ArrowRight':
                nextSlide();
                startSlideshowTimer(); // Reset timer
                break;
            case ' ':
                e.preventDefault();
                toggleSlideshow();
                break;
            case 'Escape':
                stopSlideshow();
                break;
        }
    }
});

/* ========================================
   TOUCH GESTURES FOR SLIDESHOW
   ======================================== */
let slideshowTouchStartX = 0;
let slideshowTouchEndX = 0;

document.addEventListener('touchstart', (e) => {
    const slideshow = document.getElementById('slideshow');
    if (slideshow && slideshow.classList.contains('active')) {
        slideshowTouchStartX = e.changedTouches[0].screenX;
    }
}, false);

document.addEventListener('touchend', (e) => {
    const slideshow = document.getElementById('slideshow');
    if (slideshow && slideshow.classList.contains('active')) {
        slideshowTouchEndX = e.changedTouches[0].screenX;
        handleSlideshowSwipe();
    }
}, false);

function handleSlideshowSwipe() {
    const swipeThreshold = 50;
    const diff = slideshowTouchStartX - slideshowTouchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            // Swipe left - next slide
            nextSlide();
        } else {
            // Swipe right - previous slide
            previousSlide();
        }
        startSlideshowTimer(); // Reset timer
    }
}

/* ========================================
   VISIBILITY CHANGE - PAUSE WHEN TAB HIDDEN
   ======================================== */
document.addEventListener('visibilitychange', () => {
    const slideshow = document.getElementById('slideshow');
    
    if (slideshow && slideshow.classList.contains('active')) {
        if (document.hidden) {
            clearSlideshowTimer();
        } else if (!slideshowPaused) {
            startSlideshowTimer();
        }
    }
});