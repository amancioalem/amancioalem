document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------------------
    // 1. Mobile Hamburger Menu Toggle
    // ----------------------------------------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    // Create an overlay to dim background on mobile menu open
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    const toggleMenu = () => {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        const isActive = sidebar.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isActive);
    };

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    if (overlay) {
        overlay.addEventListener('click', toggleMenu);
    }

    // Close menu when a link is clicked & handle smooth nav click
    const navLinksDOM = document.querySelectorAll('.nav-link');
    let isClickScrolling = false;
    let clickScrollTimeout = null;

    navLinksDOM.forEach(link => {
        link.addEventListener('click', () => {
            const targetId = link.getAttribute('data-target');
            if (targetId && document.getElementById(targetId)) {
                navLinksDOM.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Temporarily disable scroll listener during click smooth-scroll animation
                isClickScrolling = true;
                clearTimeout(clickScrollTimeout);
                clickScrollTimeout = setTimeout(() => {
                    isClickScrolling = false;
                    updateActiveNav();
                }, 800);
            }

            if (sidebar.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // ----------------------------------------------------------------
    // 2. Robust ScrollSpy Implementation (Bidirectional & Precise)
    // ----------------------------------------------------------------
    const sections = document.querySelectorAll('.snap-section');
    let updateActiveNav = () => {};

    if (sections.length > 0) {
        let isTicking = false;

        updateActiveNav = () => {
            if (isClickScrolling) {
                isTicking = false;
                return;
            }

            const scrollY = window.scrollY || window.pageYOffset;
            const windowHeight = window.innerHeight;
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.offsetHeight,
                document.body.clientHeight,
                document.documentElement.clientHeight
            );

            let currentSectionId = '';

            // 1. Bottom of the page check: always activate the last section
            if (scrollY + windowHeight >= documentHeight - 50) {
                currentSectionId = sections[sections.length - 1].getAttribute('id');
            } else if (scrollY < 80) {
                // 2. Top of the page check: always activate the first section
                currentSectionId = sections[0].getAttribute('id');
            } else {
                // 3. Focal point check: line at 35% of the viewport height
                const focalPoint = windowHeight * 0.35;
                let maxVisibleHeight = 0;
                let fallbackId = '';

                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();

                    // Primary match: does the focal line fall within this section?
                    if (rect.top <= focalPoint && rect.bottom > focalPoint) {
                        currentSectionId = section.getAttribute('id');
                    }

                    // Fallback tracking: track section with largest visible area in viewport
                    const visibleTop = Math.max(0, rect.top);
                    const visibleBottom = Math.min(windowHeight, rect.bottom);
                    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
                    if (visibleHeight > maxVisibleHeight) {
                        maxVisibleHeight = visibleHeight;
                        fallbackId = section.getAttribute('id');
                    }
                });

                if (!currentSectionId && fallbackId) {
                    currentSectionId = fallbackId;
                }
            }

            if (currentSectionId) {
                navLinksDOM.forEach(link => {
                    if (link.getAttribute('data-target') === currentSectionId) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }

            isTicking = false;
        };

        window.addEventListener('scroll', () => {
            if (!isTicking) {
                window.requestAnimationFrame(updateActiveNav);
                isTicking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', () => {
            if (!isTicking) {
                window.requestAnimationFrame(updateActiveNav);
                isTicking = true;
            }
        });

        // Cancel click-scroll lock immediately if user manually scrolls
        window.addEventListener('wheel', () => { isClickScrolling = false; }, { passive: true });
        window.addEventListener('touchstart', () => { isClickScrolling = false; }, { passive: true });

        // Initial check on load
        updateActiveNav();
    }

    // ----------------------------------------------------------------
    // 3. Photography Lightbox Modal Handler
    // ----------------------------------------------------------------
    const lightbox = document.getElementById('photo-lightbox');
    if (lightbox) {
        const lightboxImg = lightbox.querySelector('.photo-lightbox-img');
        const lightboxCaption = lightbox.querySelector('.photo-lightbox-caption');
        const closeBtn = lightbox.querySelector('.photo-lightbox-close');

        const openLightbox = (src, caption) => {
            lightboxImg.src = src;
            lightboxImg.alt = caption;
            if (lightboxCaption) lightboxCaption.textContent = caption || '';
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        };

        document.querySelectorAll('.photo-zoomable').forEach(item => {
            item.addEventListener('click', () => {
                const img = item.tagName.toLowerCase() === 'img' ? item : item.querySelector('img');
                if (img) {
                    openLightbox(img.src, img.getAttribute('data-caption') || img.alt);
                }
            });
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', closeLightbox);
        }

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
});
