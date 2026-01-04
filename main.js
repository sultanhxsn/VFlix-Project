// State Management
let state = {
    currentVideoIndex: -1,
    isFullscreen: false,
    isMiniPlayerActive: false,
    isDragging: false,
    volume: 1,
    playbackRate: 1,
    quality: 'auto',
    videos: [],
    dragStartPos: { x: 0, y: 0 },
    isPlaying: false
};

// DOM Elements
const elements = {
    trendingGrid: document.getElementById('trendingGrid'),
    peopleAlsoWatchGrid: document.getElementById('peopleAlsoWatchGrid'),
    fullscreenPlayer: document.getElementById('fullscreenPlayer'),
    mainVideo: document.getElementById('mainVideo'),
    videoTitleFull: document.getElementById('videoTitleFull'),
    miniPlayer: document.getElementById('miniPlayer'),
    miniHeader: document.getElementById('miniHeader'),
    miniVideo: document.getElementById('miniVideo'),
    miniTitle: document.getElementById('miniTitle'),
    miniProgress: document.getElementById('miniProgress'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    playPauseSmall: document.getElementById('playPauseSmall'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    minimizeBtn: document.getElementById('minimizeBtn'),
    closePlayerBtn: document.getElementById('closePlayerBtn'),
    miniFullscreen: document.getElementById('miniFullscreen'),
    miniClose: document.getElementById('miniClose'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    volumeBtn: document.getElementById('volumeBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    timeDisplay: document.getElementById('timeDisplay'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsMenu: document.getElementById('settingsMenu'),
    qualityMenuItem: document.getElementById('qualityMenuItem'),
    speedMenuItem: document.getElementById('speedMenuItem'),
    currentQuality: document.getElementById('currentQuality'),
    currentSpeed: document.getElementById('currentSpeed'),
    qualitySubmenu: document.getElementById('qualitySubmenu'),
    speedSubmenu: document.getElementById('speedSubmenu'),
    qualityBackBtn: document.getElementById('qualityBackBtn'),
    speedBackBtn: document.getElementById('speedBackBtn'),
    miniPrevBtn: document.getElementById('miniPrevBtn'),
    miniPlayPauseBtn: document.getElementById('miniPlayPauseBtn'),
    miniNextBtn: document.getElementById('miniNextBtn')
};

// Initialize video durations
function initializeVideoDurations() {
    const videoCards = document.querySelectorAll('.video-card');
    
    videoCards.forEach(card => {
        const videoSrc = card.dataset.src;
        const durationBadge = card.querySelector('.duration-badge');
        
        if (videoSrc && durationBadge) {
            getVideoDuration(videoSrc).then(duration => {
                durationBadge.textContent = duration;
            }).catch(error => {
                console.warn('Could not load video duration:', error);
                durationBadge.textContent = card.dataset.duration || '0:00';
            });
        }
    });
}

async function getVideoDuration(videoSrc) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            const duration = video.duration;
            resolve(formatDuration(duration));
        };
        
        video.onerror = () => {
            window.URL.revokeObjectURL(video.src);
            reject('Could not load video metadata');
        };
        
        video.src = videoSrc;
    });
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

// Initialization
function init() {
    loadAllVideos();
    initializeVideoDurations();
    setupEventListeners();
    setupDragAndDrop();
    setupNavbar();
    setupStickyNavbar();
    setupPricingButtons();
    setupNewsletter();
}

function loadAllVideos() {
    const videoCards = document.querySelectorAll('.video-card');
    state.videos = Array.from(videoCards).map(card => ({
        src: card.dataset.src,
        title: card.dataset.title,
        duration: card.dataset.duration,
        element: card
    }));
}

// Setup active navigation
function setupNavbar() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        }

        link.addEventListener('click', function(e) {
            if (!this.href.includes('#')) {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                const targetId = this.getAttribute('href').split('#')[1];
                if (targetId) {
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                    window.location.href = this.href;
                }
            }
        });
    });
}

// Setup pricing buttons
function setupPricingButtons() {
    const pricingButtons = document.querySelectorAll('.pricing-btn');
    
    pricingButtons.forEach(button => {
        button.addEventListener('click', function() {
            const plan = this.closest('.pricing-card').querySelector('.pricing-name').textContent;
            alert(`Thank you for choosing the ${plan} plan! You'll be redirected to the checkout page.`);
            // In production, you would redirect to checkout
        });
    });
}

// Setup newsletter
function setupNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('.newsletter-input');
            if (emailInput.value && validateEmail(emailInput.value)) {
                alert('Thank you for subscribing! You will receive updates soon.');
                emailInput.value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Sticky navbar on scroll
function setupStickyNavbar() {
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        if (scrollTop > 10) {
            navbar.style.boxShadow = '0 4px 30px rgba(0, 153, 255, 0.2)';
        } else {
            navbar.style.boxShadow = '0 4px 30px rgba(0, 153, 255, 0.1)';
        }
        
        lastScrollTop = scrollTop;
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Video card clicks
    document.querySelectorAll('.video-card').forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn') && !e.target.closest('.card-badge')) {
                playVideo(index);
            }
        });
    });

    // Action buttons in cards
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const icon = this.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.style.color = 'var(--primary)';
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.style.color = '';
            }
        });
    });

    // Control buttons
    elements.playPauseBtn.addEventListener('click', togglePlayPause);
    elements.playPauseSmall.addEventListener('click', togglePlayPause);
    elements.prevBtn.addEventListener('click', playPrevious);
    elements.nextBtn.addEventListener('click', playNext);
    elements.minimizeBtn.addEventListener('click', minimizeToCard);
    elements.closePlayerBtn.addEventListener('click', closeFullscreen);
    elements.miniFullscreen.addEventListener('click', restoreFromMini);
    elements.miniClose.addEventListener('click', closeMiniPlayer);
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Mini player controls
    if (elements.miniPrevBtn) elements.miniPrevBtn.addEventListener('click', playPrevious);
    if (elements.miniPlayPauseBtn) elements.miniPlayPauseBtn.addEventListener('click', togglePlayPause);
    if (elements.miniNextBtn) elements.miniNextBtn.addEventListener('click', playNext);

    // Video events
    elements.mainVideo.addEventListener('play', () => {
        state.isPlaying = true;
        updatePlayState();
    });
    elements.mainVideo.addEventListener('pause', () => {
        state.isPlaying = false;
        updatePlayState();
    });
    elements.mainVideo.addEventListener('timeupdate', updateTimeDisplay);
    elements.mainVideo.addEventListener('ended', playNext);

    elements.miniVideo.addEventListener('play', () => {
        state.isPlaying = true;
        updateMiniPlayState();
    });
    elements.miniVideo.addEventListener('pause', () => {
        state.isPlaying = false;
        updateMiniPlayState();
    });
    elements.miniVideo.addEventListener('timeupdate', updateMiniProgress);
    elements.miniVideo.addEventListener('ended', playNext);

    // Volume controls
    elements.volumeBtn.addEventListener('click', toggleMute);
    elements.volumeSlider.addEventListener('input', updateVolume);

    // Progress bar
    elements.progressContainer.addEventListener('click', seekVideo);

    // Settings
    elements.settingsBtn.addEventListener('click', toggleSettingsMenu);
    elements.qualityMenuItem.addEventListener('click', () => openSubmenu('quality'));
    elements.speedMenuItem.addEventListener('click', () => openSubmenu('speed'));
    elements.qualityBackBtn.addEventListener('click', closeSubmenu);
    elements.speedBackBtn.addEventListener('click', closeSubmenu);

    // Submenu items
    document.querySelectorAll('[data-quality]').forEach(item => {
        item.addEventListener('click', () => selectQuality(item.dataset.quality));
    });

    document.querySelectorAll('[data-speed]').forEach(item => {
        item.addEventListener('click', () => selectSpeed(item.dataset.speed));
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);

    // Close settings when clicking outside
    document.addEventListener('click', closeSettingsOnClickOutside);

    // Fullscreen changes
    document.addEventListener('fullscreenchange', updateFullscreenButton);

    // Resize handler
    window.addEventListener('resize', handleResize);
}

function handleResize() {
    if (state.isFullscreen) {
        adjustFullscreenPlayer();
    }
}

function adjustFullscreenPlayer() {
    const video = elements.mainVideo;
    const container = document.querySelector('.player-container');
    
    const windowAspect = window.innerWidth / window.innerHeight;
    const videoAspect = 16/9;
    
    if (windowAspect > videoAspect) {
        video.style.objectFit = 'contain';
        container.style.maxWidth = `${window.innerHeight * videoAspect}px`;
    } else {
        video.style.objectFit = 'cover';
        container.style.maxWidth = '100%';
    }
}

// Video Playback Functions
function playVideo(index) {
    if (index < 0 || index >= state.videos.length) return;

    state.currentVideoIndex = index;
    const video = state.videos[index];

    updateActiveCard();

    if (state.isMiniPlayerActive) {
        playInMiniPlayer(video);
        return;
    }

    openFullscreenPlayer(video);
}

function openFullscreenPlayer(video) {
    state.isFullscreen = true;

    elements.mainVideo.src = video.src;
    elements.videoTitleFull.textContent = video.title;
    elements.miniTitle.textContent = video.title;

    elements.mainVideo.volume = state.volume;
    elements.mainVideo.playbackRate = state.playbackRate;
    elements.volumeSlider.value = state.volume;

    elements.fullscreenPlayer.classList.add('active');
    document.body.style.overflow = 'hidden';

    adjustFullscreenPlayer();

    elements.mainVideo.play().catch(e => {
        console.log('Autoplay prevented:', e);
    });

    updateTimeDisplay();
}

function playInMiniPlayer(video) {
    elements.miniVideo.src = video.src;
    elements.miniTitle.textContent = video.title;

    elements.miniVideo.volume = state.volume;
    elements.miniVideo.playbackRate = state.playbackRate;

    if (!state.isMiniPlayerActive) {
        showMiniPlayer();
    }

    elements.miniVideo.play().catch(e => console.log('Autoplay prevented:', e));
}

function togglePlayPause() {
    const video = state.isMiniPlayerActive ? elements.miniVideo : elements.mainVideo;
    if (video.paused) {
        video.play();
        state.isPlaying = true;
    } else {
        video.pause();
        state.isPlaying = false;
    }
    updatePlayState();
    updateMiniPlayState();
}

function playPrevious() {
    let newIndex = state.currentVideoIndex - 1;
    if (newIndex < 0) newIndex = state.videos.length - 1;
    playVideo(newIndex);
}

function playNext() {
    let newIndex = (state.currentVideoIndex + 1) % state.videos.length;
    playVideo(newIndex);
}

function playNextInMini() {
    let newIndex = (state.currentVideoIndex + 1) % state.videos.length;
    playVideo(newIndex);
}

// Player State Management
function updatePlayState() {
    const isPlaying = state.isPlaying;
    const playIcon = isPlaying ? 'fa-pause' : 'fa-play';

    if (elements.playPauseBtn) {
        elements.playPauseBtn.innerHTML = `<i class="fas ${playIcon}"></i>`;
    }
    if (elements.playPauseSmall) {
        elements.playPauseSmall.innerHTML = `<i class="fas ${playIcon}"></i>`;
    }
}

function updateMiniPlayState() {
    const isPlaying = state.isPlaying;
    const playIcon = isPlaying ? 'fa-pause' : 'fa-play';
    
    if (elements.miniPlayPauseBtn) {
        elements.miniPlayPauseBtn.innerHTML = `<i class="fas ${playIcon}"></i>`;
    }
}

function updateTimeDisplay() {
    const video = state.isMiniPlayerActive ? elements.miniVideo : elements.mainVideo;
    if (!video.duration) return;

    const current = formatDuration(video.currentTime);
    const total = formatDuration(video.duration);
    
    if (elements.timeDisplay) {
        elements.timeDisplay.textContent = `${current} / ${total}`;
    }

    const progress = (video.currentTime / video.duration) * 100;
    if (elements.progressFill) {
        elements.progressFill.style.width = `${progress}%`;
    }
}

function updateMiniProgress() {
    const video = elements.miniVideo;
    if (!video.duration) return;

    const progress = (video.currentTime / video.duration) * 100;
    if (elements.miniProgress) {
        elements.miniProgress.style.width = `${progress}%`;
    }
}

// Mini Player Functions
function minimizeToCard() {
    const video = elements.mainVideo;
    const currentTime = video.currentTime;

    elements.miniVideo.src = video.src;
    elements.miniVideo.currentTime = currentTime;
    elements.miniVideo.volume = state.volume;
    elements.miniVideo.playbackRate = state.playbackRate;

    elements.miniVideo.play();

    showMiniPlayer();

    closeFullscreen();
}

function showMiniPlayer() {
    state.isMiniPlayerActive = true;
    elements.miniPlayer.classList.add('active');

    elements.miniPlayer.style.right = '30px';
    elements.miniPlayer.style.bottom = '30px';
}

function restoreFromMini() {
    const video = elements.miniVideo;
    const currentTime = video.currentTime;

    elements.mainVideo.src = video.src;
    elements.mainVideo.currentTime = currentTime;
    elements.mainVideo.volume = state.volume;
    elements.mainVideo.playbackRate = state.playbackRate;

    elements.mainVideo.play();

    elements.fullscreenPlayer.classList.add('active');
    document.body.style.overflow = 'hidden';

    adjustFullscreenPlayer();

    closeMiniPlayer();
}

function closeMiniPlayer() {
    state.isMiniPlayerActive = false;
    elements.miniPlayer.classList.remove('active');
    elements.miniVideo.pause();
    elements.miniVideo.src = '';
}

function closeFullscreen() {
    state.isFullscreen = false;
    elements.fullscreenPlayer.classList.remove('active');
    elements.mainVideo.pause();
    elements.mainVideo.src = '';
    document.body.style.overflow = '';
    closeSettingsMenu();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);