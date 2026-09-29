(() => {
    'use strict';

    const radio = document.getElementById('bg-radio');
    const playBtn = document.getElementById('playRadioBtn');
    const visualizer = document.getElementById('visualizer');
    const slides = Array.from(document.querySelectorAll('#salon-slideshow .slide'));
    const mapContainer = document.getElementById('mapContainer');
    const mapBtn = document.getElementById('toggleMapBtn');
    const phoneLink = document.getElementById('phoneLink');
    const reservationForm = document.getElementById('reservationForm');
    const formStatus = document.getElementById('formStatus');
    const menuTrigger = document.querySelector('.site-menu-trigger');
    const menuDialog = document.getElementById('site-menu');
    const menuClose = menuDialog?.querySelector('.site-menu-close');

    let visualizerInterval = null;
    let slideInterval = null;
    let radioStarted = false;

    let currentSlide = Math.max(0, slides.findIndex(slide => slide.classList.contains('active')));

    if (currentSlide === -1) {
        currentSlide = 0;
    }

    function ensureVisualizerBars() {
        if (!visualizer || visualizer.dataset.initialized === '1') {
            return;
        }

        visualizer.dataset.initialized = '1';
        visualizer.innerHTML = '';

        for (let i = 0; i < 24; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            visualizer.appendChild(bar);
        }
    }

    function getBars() {
        return Array.from(document.querySelectorAll('#visualizer .bar'));
    }

    function updateBars() {
        const bars = getBars();

        if (!radio || radio.paused) {
            bars.forEach(bar => {
                bar.style.height = '4px';
            });
            return;
        }

        bars.forEach(bar => {
            bar.style.height = (Math.random() * 35 + 4) + 'px';
        });
    }

    function stopVisuals() {
        if (visualizerInterval) {
            clearInterval(visualizerInterval);
            visualizerInterval = null;
        }

        updateBars();
    }

    function startVisuals() {
        if (!visualizerInterval) {
            visualizerInterval = setInterval(updateBars, 90);
        }
    }

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        slides[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function startSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }

        slideInterval = setInterval(nextSlide, 5800);
    }

    function stopSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    }

    function setRadioButtonState(isPlaying) {
        if (!playBtn) {
            return;
        }

        playBtn.innerHTML = isPlaying ? '⏸ PAUZIRAJ RADIO' : '▶ POKRENI SALONSKI RADIO';
        playBtn.style.background = isPlaying
            ? 'linear-gradient(135deg, #8c6a2b, #6b4f20)'
            : 'linear-gradient(135deg, var(--gold), var(--gold-dark))';
    }

    async function startRadio() {
        if (!radio || radioStarted) {
            return;
        }

        radioStarted = true;

        try {
            radio.load();
            await radio.play();
            setRadioButtonState(true);
            startSlideshow();
            startVisuals();
            updateBars();
        } catch (err) {
            radioStarted = false;
            setRadioButtonState(false);
            startSlideshow();
            startVisuals();
        }
    }

    function pauseRadio() {
        if (!radio) {
            return;
        }

        radio.pause();
        radioStarted = false;
        setRadioButtonState(false);
        stopSlideshow();
        stopVisuals();
    }

    function toggleRadio() {
        if (!radio) {
            return;
        }

        if (radio.paused) {
            startRadio();
        } else {
            pauseRadio();
        }
    }

    function toggleMap() {
        if (mapContainer && mapContainer.style.display === 'block') {
            mapContainer.style.display = 'none';
            return;
        }

        if (mapContainer) {
            mapContainer.style.display = 'block';
            mapContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function highlightToday() {
        const today = new Date().getDay();

        document.querySelectorAll('#hoursTable p').forEach(row => {
            if (parseInt(row.dataset.day, 10) === today) {
                row.classList.add('today');

                const span = row.querySelector('span:first-child');
                if (span && !span.textContent.includes('☀️')) {
                    span.textContent += ' ☀️';
                }
            }
        });
    }

    function copyNumber(e) {
        e.preventDefault();

        const num = '+385912512647';

        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(num)
                .then(() => {
                    const link = e.currentTarget;
                    const original = link.textContent;
                    link.textContent = '✅ Kopirano!';

                    setTimeout(() => {
                        link.textContent = original;
                    }, 2000);
                })
                .catch(() => {
                    window.location.href = 'tel:' + num;
                });
        } else {
            window.location.href = 'tel:' + num;
        }
    }

    function bindEventsOnce() {
        if (menuTrigger && menuDialog && !menuTrigger.dataset.bound) {
            menuTrigger.dataset.bound = '1';

            const finishMenuClose = () => {
                if (!menuDialog.open || !menuDialog.classList.contains('is-closing')) {
                    return;
                }

                menuDialog.classList.remove('is-closing');
                menuTrigger.setAttribute('aria-expanded', 'false');
                menuDialog.close();
            };

            const closeMenu = () => {
                if (menuDialog.open && !menuDialog.classList.contains('is-closing')) {
                    menuDialog.classList.add('is-closing');
                    window.setTimeout(finishMenuClose, 260);
                }
            };

            menuTrigger.addEventListener('click', () => {
                menuDialog.classList.remove('is-closing');
                menuDialog.showModal();
                menuTrigger.setAttribute('aria-expanded', 'true');
            });

            menuClose?.addEventListener('click', closeMenu);

            menuDialog.addEventListener('click', (event) => {
                if (event.target === menuDialog) {
                    closeMenu();
                }
            });

            menuDialog.addEventListener('cancel', (event) => {
                event.preventDefault();
                closeMenu();
            });

            menuDialog.addEventListener('animationend', (event) => {
                if (event.target === menuDialog && menuDialog.classList.contains('is-closing')) {
                    finishMenuClose();
                }
            });

            menuDialog.addEventListener('close', () => {
                menuTrigger.setAttribute('aria-expanded', 'false');
                menuDialog.classList.remove('is-closing');
            });
        }

        if (playBtn && !playBtn.dataset.bound) {
            playBtn.dataset.bound = '1';
            playBtn.addEventListener('click', toggleRadio);
        }

        if (mapBtn && !mapBtn.dataset.bound) {
            mapBtn.dataset.bound = '1';
            mapBtn.addEventListener('click', toggleMap);
        }

        if (phoneLink && !phoneLink.dataset.bound) {
            phoneLink.dataset.bound = '1';
            phoneLink.addEventListener('click', copyNumber);
        }

        if (reservationForm && !reservationForm.dataset.bound) {
            reservationForm.dataset.bound = '1';
            reservationForm.addEventListener('submit', (event) => {
                event.preventDefault();

                if (!reservationForm.checkValidity()) {
                    reservationForm.reportValidity();
                    return;
                }

                const formData = new FormData(reservationForm);
                const name = (formData.get('name') || '').toString().trim() || 'Klijent';
                const phone = (formData.get('phone') || '').toString().trim();
                const service = (formData.get('service') || '').toString().trim();
                const date = (formData.get('date') || '').toString().trim();
                const message = (formData.get('message') || '').toString().trim();

                const whatsappText = encodeURIComponent(
                    `Pozdrav, želim rezervirati termin.\n\nIme: ${name}\nTelefon: ${phone}\nUsluga: ${service}\nDatum: ${date}\nNapomena: ${message || 'Nema dodatnih napomena.'}`
                );

                reservationForm.reset();

                if (formStatus) {
                    formStatus.textContent = 'Uspješno poslan zahtjev — nastavljamo u WhatsAppu za potvrdu termina.';
                }

                window.open(
                    `https://wa.me/385912512647?text=${whatsappText}`,
                    '_blank',
                    'noopener,noreferrer'
                );
            });
        }
    }

    function init() {
        ensureVisualizerBars();
        bindEventsOnce();
        highlightToday();
        updateBars();

        if (!radio) {
            return;
        }

        radio.addEventListener('ended', () => {
            radioStarted = false;
            setRadioButtonState(false);
            stopSlideshow();
            stopVisuals();
        });

        radio.addEventListener('pause', () => {
            if (!radioStarted) {
                stopSlideshow();
                stopVisuals();
            }
        });

        radio.addEventListener('playing', () => {
            radioStarted = true;
            setRadioButtonState(true);
            startSlideshow();
            startVisuals();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    window.addEventListener('pagehide', () => {
        stopSlideshow();
        stopVisuals();
    }, { once: true });
})();
