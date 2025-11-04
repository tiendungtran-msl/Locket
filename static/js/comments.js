/* ========================================
   COMMENTS FUNCTIONALITY
   ======================================== */

// Load comments for an image
async function loadComments(imageId, containerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/images/${imageId}/comments`);
        const data = await response.json();
        
        if (data.success) {
            renderComments(data.comments, containerId, imageId);
            return data.comments;
        } else {
            console.error('Error loading comments:', data.error);
            return [];
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        return [];
    }
}

// Render comments
function renderComments(comments, containerId, imageId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const commentsSection = container.querySelector('.comments-list') || container;
    
    if (comments.length === 0) {
        commentsSection.innerHTML = `
            <div class="no-comments">
                <i class="fas fa-comment"></i>
                <p>Chưa có bình luận nào. Hãy là người đầu tiên! 💬</p>
            </div>
        `;
        return;
    }
    
    commentsSection.innerHTML = comments.map(comment => `
        <div class="comment-item" data-comment-id="${comment.id}">
            <div class="comment-avatar">
                ${getInitials(comment.username)}
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-username">${escapeHtml(comment.username)}</span>
                    <span class="comment-time">${formatCommentTime(comment.created_at)}</span>
                </div>
                <div class="comment-text">${escapeHtml(comment.text)}</div>
                <div class="comment-actions">
                    <button class="comment-action-btn comment-delete-btn" onclick="deleteComment('${imageId}', '${comment.id}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add comment
async function addComment(imageId, username, text, formId) {
    if (!text.trim()) {
        showMessage('Vui lòng nhập nội dung bình luận!', 'error');
        return;
    }
    
    if (!username.trim()) {
        username = 'Anonymous';
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/images/${imageId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                text: text
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'success');
            
            // Clear form
            const form = document.getElementById(formId);
            if (form) {
                const textInput = form.querySelector('.comment-text-input');
                if (textInput) textInput.value = '';
                
                const charCount = form.querySelector('.comment-char-count');
                if (charCount) charCount.textContent = '0/500';
            }
            
            // Reload comments
            const commentsList = form.closest('.comments-section').querySelector('.comments-list');
            if (commentsList) {
                await loadComments(imageId, form.closest('.comments-section').id);
            }
            
            // Update comment count
            updateCommentCount(imageId);
            
        } else {
            showMessage(data.error || 'Không thể thêm bình luận!', 'error');
        }
    } catch (error) {
        console.error('Add comment error:', error);
        showMessage('❌ Lỗi khi thêm bình luận!', 'error');
    }
}

// Delete comment
async function deleteComment(imageId, commentId) {
    if (!confirm('Bạn có chắc muốn xóa bình luận này không?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/images/${imageId}/comments/${commentId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage(data.message, 'success');
            
            // Remove comment from DOM
            const commentItem = document.querySelector(`[data-comment-id="${commentId}"]`);
            if (commentItem) {
                commentItem.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => commentItem.remove(), 300);
            }
            
            // Update comment count
            updateCommentCount(imageId);
            
        } else {
            showMessage(data.error || 'Không thể xóa bình luận!', 'error');
        }
    } catch (error) {
        console.error('Delete comment error:', error);
        showMessage('❌ Lỗi khi xóa bình luận!', 'error');
    }
}

// Helper functions
function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatCommentTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function updateCommentCount(imageId) {
    const commentsTitle = document.querySelector(`[data-image-id="${imageId}"] .comments-title`);
    if (commentsTitle) {
        const commentsList = commentsTitle.closest('.comments-section').querySelector('.comments-list');
        const commentItems = commentsList.querySelectorAll('.comment-item');
        const count = commentItems.length;
        
        const countSpan = commentsTitle.querySelector('.comments-count');
        if (countSpan) {
            countSpan.textContent = `(${count})`;
        }
    }
}

// Character counter for comment input
function setupCommentCharCounter(textareaId, counterId) {
    const textarea = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    
    if (!textarea || !counter) return;
    
    textarea.addEventListener('input', () => {
        const length = textarea.value.length;
        counter.textContent = `${length}/500`;
        
        if (length > 450) {
            counter.classList.add('warning');
        } else {
            counter.classList.remove('warning');
        }
        
        if (length > 500) {
            textarea.value = textarea.value.substring(0, 500);
            counter.textContent = '500/500';
        }
    });
}

// Auto-expand textarea
function setupAutoExpandTextarea(textareaId) {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
}

// Save username to localStorage
function saveUsername(username) {
    if (username && username.trim()) {
        localStorage.setItem('commentUsername', username.trim());
    }
}

// Load username from localStorage
function loadSavedUsername(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const savedUsername = localStorage.getItem('commentUsername');
    if (savedUsername) {
        input.value = savedUsername;
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(-20px);
    }
}