/**
 * The Future Council - Scroll Animation Engine
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize typographic word reveal ("arranging types")
    initTypewriterReveal();

    // 2. Initialize scroll viewport monitoring (IntersectionObserver)
    initIntersectionObserver();

    // 3. Initialize floating parallax sticker offsets
    initParallaxStickers();

    console.log("TFC Scroll Animation Engine loaded.");
});

/**
 * Splits text into animated blocks for word-by-word staggered reveal
 */
function initTypewriterReveal() {
    const revealElements = document.querySelectorAll('.reveal-type');
    revealElements.forEach(el => {
        const text = el.innerText.trim();
        if (!text) return;
        
        // Clear element and build word wrapper structure
        el.innerHTML = '';
        const words = text.split(/\s+/);
        
        words.forEach((word, idx) => {
            const span = document.createElement('span');
            span.className = 'reveal-word';
            span.style.setProperty('--word-index', idx);
            span.textContent = word;
            el.appendChild(span);
            
            // Add spacing between words
            if (idx < words.length - 1) {
                el.appendChild(document.createTextNode(' '));
            }
        });
    });
}

/**
 * Monitors viewport coordinates and applies in-view classes
 */
function initIntersectionObserver() {
    const options = {
        root: null, // Viewport
        rootMargin: '0px 0px -100px 0px', // Trigger shortly before crossing the viewport line
        threshold: 0.15 // 15% visibility
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                // Retain state once animated in to keep layout clean
                obs.unobserve(entry.target);
            }
        });
    }, options);

    // Watch all scroll reveals
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    
    // Watch all typewriter reveals
    document.querySelectorAll('.reveal-type').forEach(el => observer.observe(el));
}

/**
 * Translates sticker margins relative to scroll height for 3D parallax effects
 * and sways them slightly on cursor move for magnetic depth.
 */
function initParallaxStickers() {
    const stickers = document.querySelectorAll('.floating-sticker');
    if (stickers.length === 0) return;

    let lastScrollY = window.scrollY;
    let mouseX = 0;
    let mouseY = 0;
    let ticking = false;

    // Track cursor coordinates relative to screen center
    window.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX - window.innerWidth / 2);
        mouseY = (e.clientY - window.innerHeight / 2);
        requestUpdate();
    }, { passive: true });

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;
        requestUpdate();
    }, { passive: true });

    function requestUpdate() {
        if (!ticking) {
            window.requestAnimationFrame(updateStickerPositions);
            ticking = true;
        }
    }

    function updateStickerPositions() {
        stickers.forEach((sticker, index) => {
            const speed = parseFloat(sticker.getAttribute('data-parallax-speed')) || 0.25;
            
            // Scroll parallax offset
            const scrollOffset = lastScrollY * speed;
            
            // Mouse drift: vary factors slightly based on element index for organic motion
            const mouseFactor = 0.015 + (index * 0.004);
            const mouseOffsetX = mouseX * mouseFactor;
            const mouseOffsetY = mouseY * mouseFactor;
            
            // Rotate
            const rotation = sticker.style.getPropertyValue('--rotation') || '-4deg';
            
            // Apply compound transforms (both Y-scroll and cursor drift offset)
            sticker.style.transform = `translate3d(${mouseOffsetX}px, ${-scrollOffset + mouseOffsetY}px, 0) rotate(${rotation})`;
        });
        ticking = false;
    }

    // Align initial positions
    updateStickerPositions();
}