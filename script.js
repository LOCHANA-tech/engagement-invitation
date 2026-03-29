document.addEventListener('DOMContentLoaded', () => {

    // --- RAIN PARTICLE EFFECT ---
    function initRain() {
        const container = document.getElementById('rain-container');
        if (!container) return;

        const DropCount = 15; // Number of falling pieces
        for (let i = 0; i < DropCount; i++) {
            // Randomize delay so they don't all fall at once
            createRaindrop(container, Math.random() * 5000); 
        }
    }

    function createRaindrop(container, delay) {
        const drop = document.createElement('img');
        drop.src = 'side.png';
        drop.classList.add('raindrop');
        
        // Random horizontal start position
        drop.style.left = `${Math.random() * 95}vw`;
        
        // Random falling speed (doubled to slow down by 0.5)
        drop.style.animationDuration = `${12 + Math.random() * 12}s`;
        
        // Start delay
        drop.style.animationDelay = `${delay}ms`;

        // Slight size variation
        const size = 30 + Math.random() * 40;
        drop.style.width = `${size}px`;
        
        container.appendChild(drop);
    }
    
    initRain();

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initialise observing elements
    const elementsToAnimate = document.querySelectorAll('.details');
    elementsToAnimate.forEach(el => observer.observe(el));
    
    // --- FLIP CLOCK LOGIC ---
    function updateFlipUnit(unitId, value) {
        // Pad single digits
        const strValue = value < 10 ? '0' + value : String(value);
        const unitEl = document.getElementById(unitId);
        if (!unitEl) return;
        
        const currentValue = unitEl.dataset.value;
        
        // Initial setup if no value
        if (currentValue === undefined) {
            unitEl.dataset.value = strValue;
            unitEl.innerHTML = `
                <div class="flip-card card-top"><span>${strValue}</span></div>
                <div class="flip-card card-bottom"><span>${strValue}</span></div>
                <div class="flip-card card-flap-top"><span>${strValue}</span></div>
                <div class="flip-card card-flap-bottom"><span>${strValue}</span></div>
            `;
            return;
        }

        // Only animate if value changed
        if (currentValue !== strValue) {
            unitEl.dataset.value = strValue;
            
            // Rebuild DOM to restart CSS animations reliably
            unitEl.innerHTML = `
                <div class="flip-card card-top"><span>${strValue}</span></div>
                <div class="flip-card card-bottom"><span>${currentValue}</span></div>
                <div class="flip-card card-flap-top"><span>${currentValue}</span></div>
                <div class="flip-card card-flap-bottom"><span>${strValue}</span></div>
            `;
            
            unitEl.classList.remove('flipping');
            void unitEl.offsetWidth; // Trigger DOM reflow to restart animation
            unitEl.classList.add('flipping');
        }
    }

    function initFlipClock() {
        // Target: May 6th, 2026 at 8:30 AM local time
        const targetDate = new Date('2026-05-06T08:30:00').getTime();

        function update() {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference <= 0) {
                updateFlipUnit('unit-days', 0);
                updateFlipUnit('unit-hours', 0);
                updateFlipUnit('unit-minutes', 0);
                updateFlipUnit('unit-seconds', 0);
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            updateFlipUnit('unit-days', days);
            updateFlipUnit('unit-hours', hours);
            updateFlipUnit('unit-minutes', minutes);
            updateFlipUnit('unit-seconds', seconds);
        }

        update(); // Initial call
        setInterval(update, 1000); // 1-second interval
    }

    // Try to start clock if elements exist
    if (document.getElementById('unit-minutes')) {
        initFlipClock();
    }

    // --- GALLERY LOGIC ---
    const albumImages = [
        'album/Gemini_Generated_Image_36zuip36zuip36zu.png',
        'album/Gemini_Generated_Image_94a6pl94a6pl94a6.png',
        'album/Gemini_Generated_Image_h3x0m9h3x0m9h3x0.png',
        'album/Gemini_Generated_Image_hy7gemhy7gemhy7g.png',
        'album/Gemini_Generated_Image_ran7rsran7rsran7.png',
        'album/Gemini_Generated_Image_t02gayt02gayt02g.png',
        'album/Gemini_Generated_Image_xbqp2lxbqp2lxbqp.png',
        'album/Gemini_Generated_Image_yl8d6hyl8d6hyl8d.png'
    ];

    function initGallery() {
        const container = document.getElementById('book-container');
        if (!container) return;

        // Create leaves (pages). We pair images (front/back).
        // Since we have 5 images, we'll have 3 leaves.
        const leaves = [];
        for (let i = 0; i < albumImages.length; i += 2) {
            const leaf = document.createElement('div');
            leaf.classList.add('book-page');
            
            // Front face
            const front = document.createElement('div');
            front.classList.add('page-face', 'page-front');
            const imgFront = document.createElement('img');
            imgFront.src = albumImages[i];
            front.appendChild(imgFront);
            leaf.appendChild(front);

            // Back face (if there's a next image)
            const back = document.createElement('div');
            back.classList.add('page-face', 'page-back');
            if (i + 1 < albumImages.length) {
                const imgBack = document.createElement('img');
                imgBack.src = albumImages[i + 1];
                back.appendChild(imgBack);
            } else {
                // Last page back is just decorative or has a logo
                back.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--color-dark-green); font-family:\'Playfair Display\', serif; font-size:1.2rem; font-weight:700;">L & M</div>';
            }
            leaf.appendChild(back);

            container.appendChild(leaf);
            leaves.push(leaf);
        }

        // Handle z-indexing to keep pages stacked properly (top to bottom)
        function updateZIndex() {
            leaves.forEach((leaf, idx) => {
                if (leaf.classList.contains('flipped')) {
                    leaf.style.zIndex = idx + 1;
                } else {
                    leaf.style.zIndex = leaves.length - idx;
                }
            });
        }

        updateZIndex();

        let currentLeaf = 0;
        let direction = 1; // 1 for forward, -1 for backward

        setInterval(() => {
            if (direction === 1) {
                // Flip forward
                leaves[currentLeaf].classList.add('flipped');
                currentLeaf++;
                if (currentLeaf === leaves.length) {
                    direction = -1; // Reverse once reached the end
                    currentLeaf = leaves.length - 1;
                }
            } else {
                // Unflip (close book)
                leaves[currentLeaf].classList.remove('flipped');
                currentLeaf--;
                if (currentLeaf < 0) {
                    direction = 1; // Forward again
                    currentLeaf = 0;
                }
            }
            // Update Z-index shortly after animation starts to ensure proper overlap during mid-flight
            setTimeout(updateZIndex, 500); 
        }, 5000); // Turn page every 5 seconds
    }

    initGallery();

    // --- MP3 PLAYER LOGIC ---
    const audio = document.getElementById('bg-audio');
    const playBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const seekBar = document.getElementById('seek-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');

    if (audio && playBtn) {
        function formatTime(seconds) {
            if (isNaN(seconds)) return "0:00";
            const min = Math.floor(seconds / 60);
            const sec = Math.floor(seconds % 60);
            return `${min}:${sec < 10 ? '0' : ''}${sec}`;
        }

        // Load metadata to get song duration
        audio.addEventListener('loadedmetadata', () => {
            seekBar.max = audio.duration;
            durationEl.textContent = formatTime(audio.duration);
        });

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
                playBtn.title = 'Pause';
                // Fallback in case metadata event didn't fire
                durationEl.textContent = formatTime(audio.duration); 
                seekBar.max = audio.duration;
            } else {
                audio.pause();
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
                playBtn.title = 'Play';
            }
        });

        audio.addEventListener('timeupdate', () => {
            seekBar.value = audio.currentTime;
            currentTimeEl.textContent = formatTime(audio.currentTime);
        });

        seekBar.addEventListener('input', () => {
            audio.currentTime = seekBar.value;
        });

        audio.addEventListener('ended', () => {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            seekBar.value = 0;
            currentTimeEl.textContent = "0:00";
        });

        const prevBtn = document.getElementById('prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                audio.currentTime = 0;
            });
        }

        const nextBtn = document.getElementById('next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                // Skips to the end
                audio.currentTime = audio.duration || 0;
            });
        }
    }
});
