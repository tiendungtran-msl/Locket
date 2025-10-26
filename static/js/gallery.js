/* ========================================
   GALLERY PAGE - MAIN LOGIC
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    initGalleryPage();
});

/* ========================================
   INITIALIZE GALLERY PAGE
   ======================================== */
function initGalleryPage() {
    loadGalleryImages();
    
    // Auto refresh every 30 seconds
    setInterval(loadGalleryImages, 30000);
    
    // Setup infinite scroll (optional)
    // setupInfiniteScroll();
}

/* ========================================
   LOAD GALLERY IMAGES
   ======================================== */
async function loadGalleryImages() {
    const gallery = document.getElementById('gallery');
    const imageCount = document.getElementById('imageCount');
    
    if (!gallery) return;
    
    try {
        const data = await fetchImages();
        
        if (data.images && data.images.length > 0) {
            allImages = data.images;
            
            if (imageCount) {
                imageCount.textContent = `${data.count} kỷ niệm đẹp 💕`;
            }
            
            renderGallery(data.images);
        } else {
            allImages = [];
            
            if (imageCount) {
                imageCount.textContent = 'Chưa có ảnh nào';
            }
            
            gallery.innerHTML = `
                <div class="empty-state">
                    <span class="empty-state-icon">📷</span>
                    <h3>Chưa có kỷ niệm nào</h3>
                    <p>Hãy bắt đầu thêm những khoảnh khắc đẹp! 💕</p>
                    <a href="index.html" class="control-btn" style="display: inline-flex; margin-top: 1.5rem; text-decoration: none;">
                        <span class="btn-icon">➕</span>
                        <span class="btn-text">Thêm ảnh mới</span>
                    </a>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading gallery:', error);
        gallery.innerHTML = `
            <div class="empty-state">
                <span class="empty-state-icon">❌</span>
                <h3>Không thể tải ảnh</h3>
                <p>Vui lòng thử lại sau</p>
            </div>
        `;
    }
}

/* ========================================
   RENDER GALLERY
   ======================================== */
function renderGallery(images) {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;
    
    gallery.innerHTML = images.map((img, index) => `
        <div class="image-card" data-index="${index}">
            <img 
                src="${img.url}" 
                alt="${img.caption || 'Memory'}" 
                loading="lazy"
                onclick="openLightbox(${index})"
            >
            <div class="image-info">
                <div class="image-caption">${img.caption ? '💭 ' + escapeHtml(img.caption) : '💝 Khoảnh khắc đẹp'}</div>
                <div class="image-date">${formatDate(img.uploaded_at)}</div>
                <div class="image-actions">
                    <button class="action-btn download-btn" onclick="downloadImageByIndex(${index})">
                        <span class="btn-icon">⬇️</span>
                        <span class="btn-text">Tải về</span>
                    </button>
                    <button class="action-btn delete-btn" onclick="showDeleteConfirm('${img.id}')">
                        <span class="btn-icon">🗑️</span>
                        <span class="btn-text">Xóa</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add stagger animation
    const cards = gallery.querySelectorAll('.image-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
    });
}

/* ========================================
   ESCAPE HTML
   ======================================== */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ========================================
   DOWNLOAD IMAGE BY INDEX
   ======================================== */
function downloadImageByIndex(index) {
    if (!allImages[index]) return;
    
    const img = allImages[index];
    const filename = img.filename || `memory-${Date.now()}.jpg`;
    downloadImage(img.url, filename);
}

/* ========================================
   REFRESH GALLERY
   ======================================== */
function refreshGallery() {
    const gallery = document.getElementById('gallery');
    if (gallery) {
        gallery.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Đang tải lại...</p>
            </div>
        `;
    }
    
    loadGalleryImages();
    showMessage('🔄 Đã làm mới gallery!', 'success');
}

/* ========================================
   DELETE CONFIRMATION
   ======================================== */
let deleteImageId = null;

function showDeleteConfirm(imageId) {
    deleteImageId = imageId;
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal() {
    deleteImageId = null;
    const modal = document.getElementById('confirmModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function confirmDelete() {
    if (!deleteImageId) return;
    
    const modal = document.getElementById('confirmModal');
    
    try {
        const result = await deleteImage(deleteImageId);
        
        if (result.success) {
            showMessage(result.message, 'success');
            
            // Remove from allImages array
            allImages = allImages.filter(img => img.id !== deleteImageId);
            
            // Re-render gallery
            if (allImages.length > 0) {
                renderGallery(allImages);
                const imageCount = document.getElementById('imageCount');
                if (imageCount) {
                    imageCount.textContent = `${allImages.length} kỷ niệm đẹp 💕`;
                }
            } else {
                loadGalleryImages();
            }
        } else {
            showMessage(result.error || '❌ Không thể xóa ảnh!', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showMessage('❌ Lỗi khi xóa ảnh!', 'error');
    } finally {
        closeModal();
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('confirmModal');
    if (modal && e.target === modal) {
        closeModal();
    }
});

/* ========================================
   INFINITE SCROLL (Optional)
   ======================================== */
function setupInfiniteScroll() {
    let loading = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !loading) {
                // Load more images if needed
                // loadMoreImages();
            }
        });
    }, {
        rootMargin: '100px'
    });
    
    const sentinel = document.createElement('div');
    sentinel.id = 'sentinel';
    const gallery = document.getElementById('gallery');
    if (gallery) {
        gallery.appendChild(sentinel);
        observer.observe(sentinel);
    }
}

/* ========================================
   SEARCH/FILTER (Future feature)
   ======================================== */
function filterGallery(searchTerm) {
    if (!searchTerm) {
        renderGallery(allImages);
        return;
    }
    
    const filtered = allImages.filter(img => {
        const caption = img.caption || '';
        return caption.toLowerCase().includes(searchTerm.toLowerCase());
    });
    
    renderGallery(filtered);
}