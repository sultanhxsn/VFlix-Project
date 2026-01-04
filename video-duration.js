// Video Duration Auto-Calculation
class VideoDurationCalculator {
    constructor() {
        this.videos = [];
        this.cache = new Map();
        this.init();
    }

    init() {
        this.loadAllVideos();
        this.calculateDurations();
    }

    loadAllVideos() {
        const videoCards = document.querySelectorAll('.video-card');
        this.videos = Array.from(videoCards).map(card => ({
            element: card,
            src: card.dataset.src,
            durationBadge: card.querySelector('.duration-badge'),
            duration: null
        }));
    }

    calculateDurations() {
        this.videos.forEach(video => {
            if (this.cache.has(video.src)) {
                this.updateDurationBadge(video, this.cache.get(video.src));
            } else {
                this.getVideoDuration(video.src).then(duration => {
                    this.cache.set(video.src, duration);
                    this.updateDurationBadge(video, duration);
                }).catch(error => {
                    console.warn(`Could not get duration for ${video.src}:`, error);
                    const fallbackDuration = video.element.dataset.duration || '0:00';
                    this.updateDurationBadge(video, fallbackDuration);
                });
            }
        });
    }

    getVideoDuration(src) {
        return new Promise((resolve, reject) => {
            if (src.includes('youtube.com') || src.includes('youtu.be')) {
                this.getYouTubeDuration(src).then(resolve).catch(reject);
                return;
            }

            const video = document.createElement('video');
            video.preload = 'metadata';
            
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                resolve(this.formatDuration(video.duration));
            };
            
            video.onerror = () => {
                window.URL.revokeObjectURL(video.src);
                reject(new Error('Could not load video metadata'));
            };
            
            video.src = src;
        });
    }

    getYouTubeDuration(videoUrl) {
        return Promise.resolve('Unknown');
    }

    formatDuration(seconds) {
        if (isNaN(seconds) || seconds === Infinity) {
            return '0:00';
        }
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    updateDurationBadge(video, duration) {
        if (video.durationBadge) {
            video.durationBadge.textContent = duration;
            video.element.dataset.duration = duration;
        }
    }

    addVideo(videoElement) {
        const video = {
            element: videoElement,
            src: videoElement.dataset.src,
            durationBadge: videoElement.querySelector('.duration-badge'),
            duration: null
        };
        
        this.videos.push(video);
        this.calculateDurations();
    }

    refresh() {
        this.calculateDurations();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.videoDurationCalculator = new VideoDurationCalculator();
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList.contains('video-card')) {
                        window.videoDurationCalculator.addVideo(node);
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
});
