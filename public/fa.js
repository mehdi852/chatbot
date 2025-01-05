(function () {
    let isInitialized = false;
    let initialPathChecked = false;
    let initializationInProgress = false;

    async function initializeFA() {
        if (isInitialized || initializationInProgress) return;
        initializationInProgress = true;

        try {
            isInitialized = true;
            const FA_SCRIPT = document.currentScript || document.querySelector('script[data-website-id]');
            const WEBSITE_ID = FA_SCRIPT?.getAttribute('data-website-id');
            const API_URL = FA_SCRIPT?.getAttribute('data-api-url');

            if (!WEBSITE_ID || !API_URL) {
                console.error('FA: Missing required attributes (data-website-id and data-api-url)');
                return;
            }

            const isMobile = window.innerWidth < 768;

            const style = document.createElement('style');
            style.textContent = `
                #fa-popups-container {
                    position: fixed;
                   
                    ${
                        isMobile
                            ? `
                    bottom: 16px;
                    left: 16px;
                    right: 16px;
                    top: auto;
                    width: auto;
                    display: flex;
                    justify-content: center;
                `
                            : `
                    top: 24px;
                    right: 24px;
                    width: 340px;
                `
                    }
                    z-index: 9999;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                    pointer-events: none;
                }

                /* Base popup styles */
                .fa-popup {
                    position: absolute;
                    opacity: 0;
                    transform: ${isMobile ? 'translateY(100%) scale(0.95)' : 'translateX(100%) scale(0.95)'};
                    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    will-change: transform, opacity;
                    pointer-events: auto;
              
                }

                /* Animation states */
                .fa-popup.show {
                    opacity: 1;
                    transform: ${isMobile ? 'translateY(0) scale(1)' : 'translateX(0) scale(1)'};
                }

                .fa-popup.removing {
                    opacity: 0;
                    transform: ${isMobile ? 'translateY(100%) scale(0.95)' : 'translateX(100%) scale(0.95)'};
                    pointer-events: none;
                }

                /* Default notification popup */
                .fa-popup-notification {
                    ${
                        isMobile
                            ? `
                    position: relative;
                    width: 100%;
                    max-width: 340px;
                `
                            : `
                    right: 0;
                    width: 100%;
                `
                    }
                    background:#F5F5F5;
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 
                        0 2px 12px rgba(0, 0, 0, 0.08),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.5);
                    padding: 8px 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    height: ${isMobile ? '64px' : '70px'};

                }

                /* Email collector popup */
                .fa-popup-email {
                    ${
                        isMobile
                            ? `
                    position: relative;
                    width: 100%;
                    max-width: 400px;
                `
                            : `
                    right: 0;
                    width: 400px;
                `
                    }
                    background:#F5F5F5;
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 
                        0 4px 20px rgba(0, 0, 0, 0.08),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.5);
                    padding: 14px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    height: ${isMobile ? '135px' : 'auto'};
                    min-width: 0;
                }

                /* Hover effects */
                .fa-popup-notification:hover,
                .fa-popup-email:hover {
                    transform: ${isMobile ? 'translateY(0) scale(1.02)' : 'translateX(-4px) scale(1.02)'};
                    box-shadow: 
                        0 4px 20px rgba(0, 0, 0, 0.12),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.6);
                }

                @media (max-width: 768px) {
                    .fa-popup {
                        font-size: 0.9em;
                    }
                }
            `;
            document.head.appendChild(style);

            async function loadPopups() {
                try {
                    const currentPath = window.location.pathname;
                    const encodedPath = encodeURIComponent(currentPath);
                    const response = await fetch(`${API_URL}/api/fa/${WEBSITE_ID}?path=${encodedPath}`, {
                        method: 'GET',
                        headers: {
                            Accept: 'application/json',
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to load popups: ${response.status}`);
                    }

                    const data = await response.json();
                    //  console.log('Received popups data:', data, 'for path:', currentPath);

                    if (!data.popups?.length) {
                        //  console.log('No popups found for path:', currentPath);
                        return;
                    }

                    const container = document.createElement('div');
                    container.id = 'fa-popups-container';
                    document.body.appendChild(container);

                    let activePopups = [];
                    const POPUP_SPACING = isMobile ? 16 : 32;

                    // Sort popups by delay and create a timeline
                    const popupTimeline = data.popups
                        .map((popup) => ({
                            ...popup,
                            delay: parseInt(popup.delay) || 0,
                            duration: popup.duration === 'unlimited' ? Infinity : parseInt(popup.duration) || 7000,
                        }))
                        .sort((a, b) => a.delay - b.delay);

                    //  console.log(
                    //      'Popup timeline:',
                    //       popupTimeline.map((p) => ({ id: p.id, delay: p.delay, duration: p.duration }))
                    //   );

                    // Create a function to show a popup at a specific time
                    const showPopupAtTime = async (popup, startTime) => {
                        const currentTime = Date.now();
                        const delayFromNow = Math.max(0, startTime + popup.delay - currentTime);

                        //   console.log(`Scheduling popup ${popup.id} to show in ${delayFromNow}ms`);

                        await new Promise((resolve) => setTimeout(resolve, delayFromNow));

                        const popupElement = createPopupElement(popup, data.website);

                        if (isMobile) {
                            container.innerHTML = '';
                            container.appendChild(popupElement);
                        } else {
                            container.appendChild(popupElement);
                            popupElement.style.top = '0px';

                            await new Promise(requestAnimationFrame);

                            const newPopupHeight = popupElement.offsetHeight;
                            activePopups.forEach((p) => {
                                const currentTop = parseInt(p.style.top);
                                p.style.top = `${currentTop + newPopupHeight + POPUP_SPACING}px`;
                            });

                            activePopups.unshift(popupElement);
                        }

                        // Show the popup with animation
                        setTimeout(() => {
                            popupElement.classList.add('show');
                        }, 50);

                        // Handle duration unless it's unlimited
                        if (popup.duration !== 'unlimited' && popup.duration !== Infinity) {
                            await new Promise((resolve) => setTimeout(resolve, popup.duration));

                            popupElement.classList.add('removing');

                            if (!isMobile) {
                                const index = activePopups.indexOf(popupElement);
                                const removedPopupHeight = popupElement.offsetHeight;
                                activePopups = activePopups.filter((p) => p !== popupElement);

                                activePopups.forEach((p, currentIndex) => {
                                    if (currentIndex >= index) {
                                        const currentTop = parseInt(p.style.top);
                                        p.style.top = `${currentTop - (removedPopupHeight + POPUP_SPACING)}px`;
                                    }
                                });
                            }

                            await new Promise((resolve) => setTimeout(resolve, 500));
                            popupElement.remove();
                        }
                    };

                    // Start all popups simultaneously with their respective delays
                    const startTime = Date.now();
                    await Promise.all(popupTimeline.map((popup) => showPopupAtTime(popup, startTime)));
                } catch (error) {
                    console.error('FA: Error loading popups:', error, 'for path:', window.location.pathname);
                } finally {
                    initialPathChecked = true;
                }
            }

            function createPopupElement(popup, website) {
                // console.log('Creating popup element with data:', popup);

                const element = document.createElement('div');
                element.className = `fa-popup fa-popup-${popup.type === 'email_collector' ? 'email' : 'notification'}`;

                // Add click handler for advertising popups
                if (popup.type === 'advertising' && popup.link) {
                    //  console.log('Setting up advertising popup with link:', popup.link);
                    element.style.cursor = 'pointer';
                    element.onclick = (e) => {
                        if (!e.target.closest('button')) {
                            const url = popup.link.startsWith('http') ? popup.link : `https://${popup.link}`;
                            window.open(url, '_blank', 'noopener,noreferrer');
                        }
                    };
                }

                const timeAgo = popup.timestamp === 'now' ? 'Just now' : popup.timestamp;

                // Function to get hostname from URL
                const getHostname = (url) => {
                    try {
                        const fullUrl = url.startsWith('http') ? url : `https://${url}`;
                        return new URL(fullUrl).hostname;
                    } catch (e) {
                        return url;
                    }
                };

                element.innerHTML = `
                    <img 
                        src="${popup.icon}" 
                        alt="${website.domain}" 
                        style="
                            width: 38px;
                            height: 38px;
                            border-radius: 8px;
                            object-fit: cover;
                            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
                        "
                    >
                    <div style="flex: 1; min-width: 0;">
                        <div style="
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 2px;
                        ">
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 6px;
                            ">
                                ${
                                    popup.type === 'advertising'
                                        ? `
                                <span style="
                                    font-size: 10px;
                                    padding: 2px 6px;
                                    background: rgba(59, 130, 246, 0.1);
                                    color: rgb(59, 130, 246);
                                    border-radius: 9999px;
                                    font-weight: 500;
                                ">Ad</span>
                            `
                                        : ''
                                }
                                <div style="
                                    font-weight: 500; 
                                    color: #1a1a1a;
                                    font-size: 13px;
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                ">${popup.title}</div>
                            </div>
                            <div style="
                                font-size: 11px;
                                color: #888;
                                margin-left: 8px;
                                white-space: nowrap;
                            ">${timeAgo}</div>
                        </div>
                        <div style="
                            font-size: 12px;
                            color: #666;
                            line-height: 1.3;
                            display: -webkit-box;
                            -webkit-line-clamp: 2;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        ">${popup.message}</div>
                        ${
                            popup.type === 'advertising' && popup.link
                                ? `
                        <div style="
                            font-size: 11px;
                            color: rgb(59, 130, 246);
                            margin-top: 2px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        ">${getHostname(popup.link)}</div>
                    `
                                : ''
                        }
                        ${
                            popup.type === 'email_collector'
                                ? `
                        <form onsubmit="event.preventDefault(); submitEmail(event, ${popup.id});" style="
                            display: flex;
                            gap: 8px;
                            margin-top: 8px;
                        ">
                            <input 
                                type="email" 
                                placeholder="${popup.placeholder_text || 'Enter your email'}"
                                required
                                style="
                                    flex: 1;
                                    padding: 6px 12px;
                                    border: 1px solid #ddd;
                                    border-radius: 6px;
                                    font-size: 13px;
                                "
                            >
                            <button 
                                type="submit"
                                style="
                                    background: #3b82f6;
                                    color: white;
                                    border: none;
                                    padding: 6px 12px;
                                    border-radius: 6px;
                                    font-size: 13px;
                                    cursor: pointer;
                                "
                            >${popup.button_text || 'Subscribe'}</button>
                        </form>
                    `
                                : ''
                        }
                    </div>
                    <button 
                        onclick="event.stopPropagation(); this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 500);" 
                        style="
                            background: none; 
                            border: none; 
                            cursor: pointer; 
                            padding: 4px;
                            opacity: 0.3;
                            transition: opacity 0.2s ease;
                            flex-shrink: 0;
                            margin-left: 2px;
                            z-index: 10;
                        "
                        onmouseover="this.style.opacity = 0.7"
                        onmouseout="this.style.opacity = 0.3"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </button>
                `;

                // Add the submit function for email collector
                if (popup.type === 'email_collector') {
                    window.submitEmail = async (event, popupId) => {
                        const form = event.target;
                        const email = form.querySelector('input[type="email"]').value;

                        try {
                            const response = await fetch(`${API_URL}/api/emails/collect`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    email,
                                    popupId,
                                    sourceUrl: window.location.href,
                                    ipAddress: '', // You might want to get this from the server side
                                    userAgent: navigator.userAgent,
                                }),
                            });

                            if (response.ok) {
                                form.innerHTML = `<div style="color: #16a34a;">${popup.success_message || 'Thanks for subscribing!'}</div>`;
                                setTimeout(() => element.remove(), 2000);
                            } else {
                                throw new Error('Failed to submit');
                            }
                        } catch (error) {
                            form.innerHTML = '<div style="color: #dc2626;">Failed to subscribe. Please try again.</div>';
                        }
                    };
                }

                return element;
            }

            function handlePathChange() {
                if (!isInitialized) {
                    initializeFA();
                    return;
                }
                const container = document.getElementById('fa-popups-container');
                if (container) {
                    container.remove();
                }
                loadPopups();
            }

            if (typeof history !== 'undefined') {
                window.addEventListener('popstate', handlePathChange);

                const pushState = history.pushState;
                const replaceState = history.replaceState;

                history.pushState = function () {
                    pushState.apply(history, arguments);
                    handlePathChange();
                };

                history.replaceState = function () {
                    replaceState.apply(history, arguments);
                    handlePathChange();
                };
            }

            if (!initialPathChecked) {
                loadPopups();
            }
        } catch (error) {
            console.error('FA: Initialization error:', error);
            isInitialized = false;
        } finally {
            initializationInProgress = false;
        }
    }

    function initialize() {
        if (isInitialized || initializationInProgress) return;
        initializeFA();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();
