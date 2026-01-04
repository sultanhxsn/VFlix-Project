// Drag and Drop for mini player
function setupDragAndDrop() {
    let isDragging = false;
    let dragStartX, dragStartY;

    elements.miniHeader.addEventListener('mousedown', startDrag);
    elements.miniHeader.addEventListener('touchstart', startDrag);

    function startDrag(e) {
        isDragging = true;
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        const rect = elements.miniPlayer.getBoundingClientRect();
        dragStartX = clientX - rect.left;
        dragStartY = clientY - rect.top;

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('touchmove', doDrag);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
        
        elements.miniPlayer.classList.add('dragging');
    }

    function doDrag(e) {
        if (!isDragging) return;

        e.preventDefault();
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;

        const x = clientX - dragStartX;
        const y = clientY - dragStartY;

        const maxX = window.innerWidth - elements.miniPlayer.offsetWidth;
        const maxY = window.innerHeight - elements.miniPlayer.offsetHeight;

        const boundedX = Math.max(0, Math.min(x, maxX));
        const boundedY = Math.max(0, Math.min(y, maxY));

        elements.miniPlayer.style.left = `${boundedX}px`;
        elements.miniPlayer.style.top = `${boundedY}px`;
        elements.miniPlayer.style.right = 'unset';
        elements.miniPlayer.style.bottom = 'unset';
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('touchmove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
        
        elements.miniPlayer.classList.remove('dragging');
    }
}

// Volume Controls
function toggleMute() {
    const video = state.isMiniPlayerActive ? elements.miniVideo : elements.mainVideo;

    if (video.volume > 0) {
        state.volume = 0;
        video.volume = 0;
        elements.volumeSlider.value = 0;
        elements.volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        state.volume = 1;
        video.volume = 1;
        elements.volumeSlider.value = 1;
        elements.volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

function updateVolume() {
    const volume = parseFloat(elements.volumeSlider.value);
    state.volume = volume;

    elements.mainVideo.volume = volume;
    elements.miniVideo.volume = volume;

    let icon = 'fa-volume-up';
    if (volume === 0) icon = 'fa-volume-mute';
    else if (volume < 0.5) icon = 'fa-volume-down';

    elements.volumeBtn.innerHTML = `<i class="fas ${icon}"></i>`;
}

// Progress Bar Controls
function seekVideo(e) {
    const rect = elements.progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const video = state.isMiniPlayerActive ? elements.miniVideo : elements.mainVideo;

    if (video.duration) {
        video.currentTime = percent * video.duration;
    }
}

// Settings Menu
function toggleSettingsMenu(e) {
    e.stopPropagation();
    elements.settingsMenu.classList.toggle('active');
}

function openSubmenu(type) {
    closeAllSubmenus();

    if (type === 'quality') {
        elements.qualitySubmenu.classList.add('active');
    } else if (type === 'speed') {
        elements.speedSubmenu.classList.add('active');
    }

    elements.settingsMenu.classList.remove('active');
}

function closeSubmenu() {
    closeAllSubmenus();
    elements.settingsMenu.classList.add('active');
}

function closeAllSubmenus() {
    elements.qualitySubmenu.classList.remove('active');
    elements.speedSubmenu.classList.remove('active');
}

function closeSettingsMenu() {
    elements.settingsMenu.classList.remove('active');
    closeAllSubmenus();
}

function closeSettingsOnClickOutside(e) {
    if (!elements.settingsMenu.contains(e.target) &&
        !elements.settingsBtn.contains(e.target) &&
        !elements.qualitySubmenu.contains(e.target) &&
        !elements.speedSubmenu.contains(e.target)) {
        closeSettingsMenu();
    }
}

function selectQuality(quality) {
    state.quality = quality;
    elements.currentQuality.textContent = quality === 'auto' ? 'Auto (Best)' : quality;

    document.querySelectorAll('[data-quality]').forEach(item => {
        item.classList.toggle('active', item.dataset.quality === quality);
    });

    closeSettingsMenu();
}

function selectSpeed(speed) {
    const speedNum = parseFloat(speed);
    state.playbackRate = speedNum;

    elements.mainVideo.playbackRate = speedNum;
    elements.miniVideo.playbackRate = speedNum;

    let speedText = 'Normal';
    if (speedNum === 0.25) speedText = '0.25x';
    else if (speedNum === 0.5) speedText = '0.5x';
    else if (speedNum === 0.75) speedText = '0.75x';
    else if (speedNum === 1.25) speedText = '1.25x';
    else if (speedNum === 1.5) speedText = '1.5x';
    else if (speedNum === 1.75) speedText = '1.75x';
    else if (speedNum === 2) speedText = '2x';

    elements.currentSpeed.textContent = speedText;

    document.querySelectorAll('[data-speed]').forEach(item => {
        item.classList.toggle('active', parseFloat(item.dataset.speed) === speedNum);
    });

    closeSettingsMenu();
}

// Fullscreen
function toggleFullscreen() {
    const playerContainer = document.querySelector('.player-container');
    
    if (!document.fullscreenElement) {
        playerContainer.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
        elements.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        document.exitFullscreen();
        elements.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

function updateFullscreenButton() {
    if (document.fullscreenElement) {
        elements.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        elements.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}

// UI Updates
function updateActiveCard() {
    document.querySelectorAll('.video-card').forEach(card => {
        card.classList.remove('playing');
    });

    if (state.currentVideoIndex >= 0) {
        state.videos[state.currentVideoIndex].element.classList.add('playing');
    }
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    if ([' ', 'k', 'ArrowLeft', 'ArrowRight', 'f', 'm', 'Escape'].includes(e.key)) {
        e.preventDefault();
    }

    switch (e.key) {
        case ' ':
        case 'k':
            togglePlayPause();
            break;
        case 'ArrowLeft':
            seekRelative(-5);
            break;
        case 'ArrowRight':
            seekRelative(5);
            break;
        case 'f':
            toggleFullscreen();
            break;
        case 'm':
            toggleMute();
            break;
        case 'Escape':
            if (state.isFullscreen) closeFullscreen();
            if (state.isMiniPlayerActive) closeMiniPlayer();
            closeSettingsMenu();
            break;
    }
}

function seekRelative(seconds) {
    const video = state.isMiniPlayerActive ? elements.miniVideo : elements.mainVideo;
    if (video.duration) {
        video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration));
    }
}

// Add dragging class to mini player CSS
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .mini-player.dragging {
            opacity: 0.9;
            cursor: grabbing !important;
            box-shadow: 0 0 40px rgba(0, 153, 255, 0.6) !important;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
});