/* ========================================
   MUSIC PLAYER
   ======================================== */
let musicPlayer = null;
let currentTrack = 1;
let isPlaying = false;

// Music tracks configuration
const musicTracks = {
    1: '/static/music/romantic1.mp3',
    2: '/static/music/romantic2.mp3',
    3: '/static/music/romantic3.mp3'
};

/* ========================================
   INITIALIZE MUSIC PLAYER
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
    musicPlayer = document.getElementById('musicPlayer');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    
    if (!musicPlayer) return;
    
    // Set initial volume
    musicPlayer.volume = 0.5;
    
    // Volume control
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            musicPlayer.volume = volume;
            if (volumeValue) {
                volumeValue.textContent = e.target.value + '%';
            }
            
            // Save to localStorage
            localStorage.setItem('musicVolume', e.target.value);
        });
        
        // Load saved volume
        const savedVolume = localStorage.getItem('musicVolume');
        if (savedVolume) {
            volumeSlider.value = savedVolume;
            musicPlayer.volume = savedVolume / 100;
            if (volumeValue) {
                volumeValue.textContent = savedVolume + '%';
            }
        }
    }
    
    // Load saved track
    const savedTrack = localStorage.getItem('currentTrack');
    if (savedTrack) {
        currentTrack = parseInt(savedTrack);
        loadTrack(currentTrack);
        highlightActiveTrack();
    }
    
    // Auto-play if was playing
    const wasPlaying = localStorage.getItem('musicPlaying') === 'true';
    if (wasPlaying) {
        playMusic();
    }
    
    // Music ended event
    musicPlayer.addEventListener('ended', () => {
        // Loop current track
        musicPlayer.currentTime = 0;
        musicPlayer.play();
    });
    
    // Error handling
    musicPlayer.addEventListener('error', (e) => {
        console.error('Music player error:', e);
        showMessage('❌ Không thể tải nhạc. Vui lòng kiểm tra file nhạc.', 'error');
    });
    
    // Update play button state
    updatePlayButton();
});

/* ========================================
   TOGGLE MUSIC MENU
   ======================================== */
function toggleMusicMenu() {
    const musicMenu = document.getElementById('musicMenu');
    
    if (!musicMenu) return;
    
    musicMenu.classList.toggle('active');
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const musicControl = document.getElementById('musicControl');
    const musicMenu = document.getElementById('musicMenu');
    
    if (musicControl && musicMenu) {
        if (!musicControl.contains(e.target)) {
            musicMenu.classList.remove('active');
        }
    }
});

/* ========================================
   PLAY/PAUSE MUSIC
   ======================================== */
function playMusic() {
    if (!musicPlayer) return;
    
    musicPlayer.play()
        .then(() => {
            isPlaying = true;
            const musicBtn = document.getElementById('musicBtn');
            if (musicBtn) {
                musicBtn.classList.add('playing');
            }
            updatePlayButton();
            localStorage.setItem('musicPlaying', 'true');
        })
        .catch(error => {
            console.error('Play error:', error);
            showMessage('❌ Không thể phát nhạc. Vui lòng click nút phát.', 'error');
        });
}

function pauseMusic() {
    if (!musicPlayer) return;
    
    musicPlayer.pause();
    isPlaying = false;
    
    const musicBtn = document.getElementById('musicBtn');
    if (musicBtn) {
        musicBtn.classList.remove('playing');
    }
    
    updatePlayButton();
    localStorage.setItem('musicPlaying', 'false');
}

function toggleMusicPlayPause() {
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function updatePlayButton() {
    const playBtn = document.getElementById('musicPlayBtn');
    if (!playBtn) return;
    
    if (isPlaying) {
        playBtn.innerHTML = '⏸️ Tạm dừng';
    } else {
        playBtn.innerHTML = '▶️ Phát nhạc';
    }
}

/* ========================================
   CHANGE MUSIC TRACK
   ======================================== */
function changeMusic(trackNumber) {
    if (!musicTracks[trackNumber]) {
        console.error('Track not found:', trackNumber);
        return;
    }
    
    currentTrack = trackNumber;
    const wasPlaying = isPlaying;
    
    // Pause current music
    if (isPlaying) {
        pauseMusic();
    }
    
    // Load new track
    loadTrack(trackNumber);
    
    // Update UI
    highlightActiveTrack();
    
    // Auto-play new track if was playing
    if (wasPlaying) {
        setTimeout(() => playMusic(), 100);
    }
    
    // Save to localStorage
    localStorage.setItem('currentTrack', trackNumber);
    
    showMessage(`🎵 Đã chuyển sang: Romantic ${trackNumber}`, 'success');
}

/* ========================================
   LOAD TRACK
   ======================================== */
function loadTrack(trackNumber) {
    if (!musicPlayer || !musicTracks[trackNumber]) return;
    
    const source = musicPlayer.querySelector('source');
    if (source) {
        source.src = musicTracks[trackNumber];
        musicPlayer.load();
    }
}

/* ========================================
   HIGHLIGHT ACTIVE TRACK
   ======================================== */
function highlightActiveTrack() {
    const musicItems = document.querySelectorAll('.music-item');
    musicItems.forEach((item, index) => {
        if (index + 1 === currentTrack) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/* ========================================
   KEYBOARD SHORTCUTS FOR MUSIC
   ======================================== */
document.addEventListener('keydown', (e) => {
    // Space to play/pause (when not in input)
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        const lightbox = document.getElementById('lightbox');
        const slideshow = document.getElementById('slideshow');
        
        // Only if not in lightbox or slideshow
        if (!lightbox?.classList.contains('active') && !slideshow?.classList.contains('active')) {
            e.preventDefault();
            toggleMusicPlayPause();
        }
    }
    
    // M to toggle music menu
    if (e.key === 'm' || e.key === 'M') {
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            toggleMusicMenu();
        }
    }
    
    // Number keys to change tracks
    if (e.key >= '1' && e.key <= '3') {
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            changeMusic(parseInt(e.key));
        }
    }
});