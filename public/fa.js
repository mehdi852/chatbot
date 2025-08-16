(function () {
    // Prevent multiple instances of the widget
    if (window.FA_CHAT_WIDGET_LOADED) {
        console.log('FA Chat Widget already loaded, skipping initialization.');
        return;
    }
    window.FA_CHAT_WIDGET_LOADED = true;
    
    // Capture website ID at script load time
    const websiteId = parseInt(document.currentScript.getAttribute('data-website-id'));
    const apiUrl = document.currentScript.getAttribute('data-api-url') || window.location.origin;

    // Generate or get existing visitor ID
    const getVisitorId = () => {
        let visitorId = localStorage.getItem('fa_visitor_id');
        if (!visitorId) {
            visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('fa_visitor_id', visitorId);
        }
        return visitorId;
    };
    const visitorId = getVisitorId();

    // Function to get visitor's public IP address
    const getVisitorIP = async () => {
        try {
            // Try multiple IP services for redundancy
            const ipServices = [
                'https://api.ipify.org?format=json',
                'https://ipapi.co/json/',
                'https://json.geoiplookup.io/'
            ];
            
            for (const service of ipServices) {
                try {
                    const response = await fetch(service, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json'
                        },
                        timeout: 5000 // 5 second timeout
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        // Different services return IP in different fields
                        const ip = data.ip || data.query || data.IPv4;
                        if (ip && ip !== '127.0.0.1' && ip !== 'localhost') {
                            console.log('🌍 Detected visitor IP:', ip, 'from service:', service);
                            return ip;
                        }
                    }
                } catch (serviceError) {
                    console.warn('Failed to get IP from', service, ':', serviceError.message);
                    continue; // Try next service
                }
            }
            
            // Fallback IP for testing
            console.log('🔧 Using fallback IP for testing');
            return '8.8.8.8';
        } catch (error) {
            console.error('Error getting visitor IP:', error);
            return '8.8.8.8'; // Fallback IP
        }
    };
    
    // Get visitor IP at script load
    let visitorIP = '8.8.8.8'; // Default fallback
    getVisitorIP().then(ip => {
        visitorIP = ip;
        console.log('🌐 Visitor IP initialized:', visitorIP);
    });
    
    // Widget settings (will be loaded from database)
    let widgetSettings = {
        primaryColor: '#3b82f6',
        headerColor: '#1e40af',
        backgroundColor: '#ffffff',
        textColor: '#374151',
        buttonSize: 'medium',
        buttonPosition: 'bottom-right',
        borderRadius: 'rounded',
        welcomeMessage: 'Hi! How can we help you today?',
        placeholderText: 'Type your message...',
        companyName: 'Support Team',
        buttonText: 'Chat with us',
        showBranding: true,
        brandName: 'BirdSeed'
    };

    // Load widget settings from database
    const loadWidgetSettings = async () => {
        try {
            const fetchUrl = `${apiUrl}/api/public/widget-settings?websiteId=${websiteId}`;
            console.log('🔍 DEBUGGING: Fetching widget settings from:', fetchUrl);
            console.log('🔍 DEBUGGING: Current page URL:', window.location.href);
            console.log('🔍 DEBUGGING: API URL:', apiUrl);
            console.log('🔍 DEBUGGING: Website ID:', websiteId);
            
            // Add timestamp to bust cache
            const cacheBuster = Date.now();
            const cacheBustedUrl = `${fetchUrl}&t=${cacheBuster}`;
            
            const response = await fetch(cacheBustedUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                },
                cache: 'no-store' // Force no caching
            });
            
            console.log('🔍 DEBUGGING: Response status:', response.status, response.ok);
            console.log('🔍 DEBUGGING: Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                const data = await response.json();
                console.log('🔍 DEBUGGING: Raw API response:', data);
                
                if (data.success && data.settings) {
                    console.log('🔍 DEBUGGING: Default settings before merge:', widgetSettings);
                    widgetSettings = { ...widgetSettings, ...data.settings };
                    console.log('🔍 DEBUGGING: Final merged settings:', widgetSettings);
                    console.log('🎨 DEBUGGING: Colors from database:');
                    console.log('   Primary Color:', widgetSettings.primaryColor);
                    console.log('   Header Color:', widgetSettings.headerColor);
                    console.log('   Background Color:', widgetSettings.backgroundColor);
                    console.log('   Text Color:', widgetSettings.textColor);
                } else {
                    console.warn('🔍 DEBUGGING: No settings in response or success=false');
                }
            } else {
                console.error('🔍 DEBUGGING: Response not ok:', response.status);
            }
        } catch (error) {
            console.error('🔍 DEBUGGING: Error loading widget settings:', error);
            // Use default settings on error
        }
    };
    
    // Load external CSS file and return a promise when it's loaded
    const loadStyles = () => {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = `${apiUrl}/fa-styles.css`;
            
            link.onload = () => {
                console.log('✅ CSS loaded successfully');
                resolve();
            };
            
            link.onerror = () => {
                console.warn('⚠️ CSS failed to load, proceeding anyway');
                resolve(); // Still resolve to continue execution
            };
            
            document.head.appendChild(link);
        });
    };

    // Start loading CSS immediately
    const cssLoadPromise = loadStyles();
    
    // Function to apply widget settings as CSS variables
    const applyWidgetStyles = () => {
        console.log('🎨 DEBUGGING: applyWidgetStyles called with settings:', widgetSettings);
        
        // Create or update custom CSS variables
        const styleId = 'fa-widget-custom-styles';
        let customStyles = document.getElementById(styleId);
        
        if (!customStyles) {
            console.log('🎨 DEBUGGING: Creating new style element with id:', styleId);
            customStyles = document.createElement('style');
            customStyles.id = styleId;
            document.head.appendChild(customStyles);
        } else {
            console.log('🎨 DEBUGGING: Using existing style element');
        }
        
        // Helper function for border radius
        const getBorderRadius = (radius) => {
            switch (radius) {
                case 'none': return '0px';
                case 'small': return '6px';
                case 'rounded': return '12px';
                case 'full': return '24px';
                default: return '12px';
            }
        };
        
        const generatedCSS = `
            /* Override CSS Variables with dynamic values */
            :root {
                --primary-color: ${widgetSettings.primaryColor} !important;
                --primary-gradient: linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%) !important;
                --primary-dark: ${widgetSettings.headerColor} !important;
                --header-color: ${widgetSettings.headerColor} !important;
                --background-primary: ${widgetSettings.backgroundColor} !important;
                --text-primary: ${widgetSettings.textColor} !important;
            }
            
            /* Force override all gradient elements with !important */
            .fa-chat-launcher,
            .fa-chat-button {
                background: linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%) !important;
            }
            
            .fa-widget-header {
                background: linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%) !important;
            }
            
            .fa-send-btn,
            .fa-widget-send {
                background: linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%) !important;
            }
            
            .fa-widget-message.user {
                background: linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%) !important;
                color: white !important;
            }
            
            /* Admin messages */
            .fa-widget-message.admin {
                background: var(--background-secondary, #f7fafc) !important;
                color: ${widgetSettings.textColor} !important;
            }
            
            /* Widget body backgrounds */
            .fa-messages-scroll,
            .fa-widget-content {
                background-color: ${widgetSettings.backgroundColor} !important;
            }
            
            .fa-widget-footer,
            .fa-widget-input-container {
                background-color: ${widgetSettings.backgroundColor} !important;
            }
            
            /* Input text color */
            .fa-message-input,
            .fa-widget-input {
                color: ${widgetSettings.textColor} !important;
            }
            
            /* Typing indicator */
            .fa-typing-indicator {
                background: var(--background-secondary, #f7fafc) !important;
            }
            
            .fa-typing-dots span {
                background-color: ${widgetSettings.textColor} !important;
                opacity: 0.4;
            }
            
            /* Button size variations */
            .fa-chat-launcher.fa-size-small {
                width: 48px !important;
                height: 48px !important;
            }
            
            .fa-chat-launcher.fa-size-medium {
                width: 56px !important;
                height: 56px !important;
            }
            
            .fa-chat-launcher.fa-size-large {
                width: 64px !important;
                height: 64px !important;
            }
            
            /* Button position variations */
            .fa-chat-launcher.fa-position-bottom-right {
                bottom: 32px !important;
                right: 32px !important;
            }
            
            .fa-chat-launcher.fa-position-bottom-left {
                bottom: 32px !important;
                left: 32px !important;
            }
            
            .fa-chat-launcher.fa-position-bottom-center {
                bottom: 32px !important;
                left: 50% !important;
                transform: translateX(-50%) !important;
            }
            
            .fa-chat-launcher.fa-position-top-right {
                top: 32px !important;
                right: 32px !important;
            }
            
            .fa-chat-launcher.fa-position-top-left {
                top: 32px !important;
                left: 32px !important;
            }
            
            /* Border radius variations */
            .fa-chat-launcher.fa-radius-none {
                border-radius: 0px !important;
            }
            
            .fa-chat-launcher.fa-radius-small {
                border-radius: 6px !important;
            }
            
            .fa-chat-launcher.fa-radius-rounded {
                border-radius: 50% !important;
            }
            
            .fa-chat-launcher.fa-radius-full {
                border-radius: 50% !important;
            }
            
            .fa-chat-container.fa-radius-none {
                border-radius: 0px !important;
            }
            
            .fa-chat-container.fa-radius-small {
                border-radius: 6px !important;
            }
            
            .fa-chat-container.fa-radius-rounded {
                border-radius: 12px !important;
            }
            
            .fa-chat-container.fa-radius-full {
                border-radius: 24px !important;
            }
        `;
        
        customStyles.textContent = generatedCSS;
        console.log('🎨 DEBUGGING: Generated CSS applied:');
        console.log(generatedCSS);
        console.log('🎨 DEBUGGING: Style element added to head:', customStyles);
    };

    // Load Socket.IO client
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
    document.head.appendChild(script);

    script.onload = async () => {
        try {
            // Ensure websiteId is valid
            if (!websiteId || isNaN(websiteId)) {
                console.error('Invalid or missing websiteId parameter');
                return;
            }

            // Ensure websiteId is a number
            const websiteIdNum = parseInt(websiteId);
            if (isNaN(websiteIdNum)) {
                console.error('Invalid websiteId:', websiteId);
                return;
            }
            
            // Prevent duplicate widget initialization - check for multiple possible selectors
            const existingWidget = document.getElementById('fa-chat-widget-container') || 
                                 document.querySelector('.fa-chat-launcher') ||
                                 document.querySelector('.fa-widget-overlay');
            if (existingWidget) {
                console.log('Chat widget DOM elements already exist, skipping initialization...');
                return;
            }
            
            // Load widget settings first
            await loadWidgetSettings();

            let socket = null;
            let isConnected = false;
            let isEligibleForChat = true; // Chat is always available for human agents
            let isAIEnabled = true; // Separate flag for AI responses
            let isAgentOnline = false; // Track if human agent is online
            let messages = [];

            // Widget questions (will be loaded from database)
            let widgetQuestions = [
                "What are your business hours?",
                "How can I contact customer support?",
                "Do you offer refunds?",
                "How do I track my order?",
                "What payment methods do you accept?",
                "How can I create an account?"
            ];

            // Load widget questions from database
            const loadWidgetQuestions = async () => {
                try {
                    const fetchUrl = `${apiUrl}/api/widget/questions?websiteId=${websiteId}`;
                    console.log('🔍 DEBUGGING: Fetching widget questions from:', fetchUrl);
                    
                    const response = await fetch(fetchUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Pragma': 'no-cache'
                        },
                        cache: 'no-store'
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('🔍 DEBUGGING: Widget questions API response:', data);
                        
                        if (data.success && data.questions && data.questions.length > 0) {
                            widgetQuestions = data.questions.map(q => q.question);
                            console.log('🔍 DEBUGGING: Loaded custom widget questions:', widgetQuestions);
                        } else {
                            console.log('🔍 DEBUGGING: No custom questions found, using defaults');
                        }
                    } else {
                        console.warn('🔍 DEBUGGING: Failed to load widget questions, using defaults');
                    }
                } catch (error) {
                    console.error('🔍 DEBUGGING: Error loading widget questions:', error);
                    // Use default questions on error
                }
            };
            
            // Function to render dynamic questions in the DOM
            const renderDynamicQuestions = (container) => {
                const questionsList = container.querySelector('#fa-questions-list');
                if (!questionsList) return;
                
                // Clear existing content
                questionsList.innerHTML = '';
                
                // Render dynamic questions
                widgetQuestions.forEach((question, index) => {
                    const questionButton = document.createElement('button');
                    questionButton.className = 'fa-question-btn';
                    questionButton.setAttribute('data-question', question);
                    questionButton.innerHTML = `
                        <span class="fa-question-text">${question}</span>
                        <svg class="fa-question-arrow" viewBox="0 0 24 24" fill="none">
                            <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="currentColor"/>
                        </svg>
                    `;
                    questionsList.appendChild(questionButton);
                });
                
                console.log('🔍 DEBUGGING: Rendered', widgetQuestions.length, 'dynamic questions');
            };
            
            // Widget state management - always start with home view
            let currentView = 'home'; // 'home' or 'chat'
            let isWidgetInitialized = false;
            
            // Create and inject HTML elements
            const container = document.createElement('div');
            container.id = 'fa-chat-widget-container';
            container.innerHTML = `
                <button class="fa-chat-launcher" style="opacity: 0 !important; transform: translateY(30px) scale(0.3) !important; transition: none !important;">
                    <div class="fa-launcher-content">
                        <div class="fa-launcher-icon">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM13 14H11V12H13V14ZM13 10H11V6H13V10Z" fill="currentColor"/>
                            </svg>
                        </div>
                        <div class="fa-launcher-pulse"></div>
                    </div>
                    <div class="fa-launcher-tooltip">
                        <div class="fa-launcher-tooltip-content">
                            <div class="fa-launcher-tooltip-title">${widgetSettings.buttonText}</div>
                            <div class="fa-launcher-tooltip-subtitle">Chat with our support team</div>
                        </div>
                    </div>
                </button>
                <div class="fa-widget-overlay">
                    <div class="fa-widget-container">
                        <div class="fa-widget-backdrop"></div>
                        <div class="fa-chat-container">
                            <!-- HOME VIEW -->
                            <div class="fa-home-view" id="fa-home-view">
                                <div class="fa-widget-header">
                                    <div class="fa-header-content">
                                        <div class="fa-agent-info">
                                            <div class="fa-agent-avatar">
                                                <div class="fa-avatar-gradient">
                                                    <svg class="fa-avatar-icon" viewBox="0 0 24 24" fill="none">
                                                        <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" fill="currentColor"/>
                                                        <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" fill="currentColor"/>
                                                    </svg>
                                                </div>
                                            </div>
                                            <div class="fa-agent-details">
                                                <div class="fa-agent-name">${widgetSettings.companyName}</div>
                                                <div class="fa-agent-status">We're here to help!</div>
                                            </div>
                                        </div>
                                        <div class="fa-header-actions">
                                            <button class="fa-close-btn" title="Close">
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M18.3 5.71C17.91 5.32 17.28 5.32 16.89 5.71L12 10.59L7.11 5.7C6.72 5.31 6.09 5.31 5.7 5.7C5.31 6.09 5.31 6.72 5.7 7.11L10.59 12L5.7 16.89C5.31 17.28 5.31 17.91 5.7 18.3C6.09 18.69 6.72 18.69 7.11 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.11C18.68 6.73 18.68 6.09 18.3 5.71Z" fill="currentColor"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="fa-home-body">
                                    <div class="fa-welcome-section">
                                        <div class="fa-welcome-message">
                                            <div class="fa-welcome-avatar">
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9Z" fill="currentColor"/>
                                                </svg>
                                            </div>
                                            <div class="fa-welcome-text">
                                                <div class="fa-welcome-title">Hi there! 👋</div>
                                                <div class="fa-welcome-subtitle">${widgetSettings.welcomeMessage}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="fa-questions-section">
                                        <div class="fa-questions-title">Frequently Asked Questions:</div>
                                        <div class="fa-questions-list" id="fa-questions-list">
                                            <!-- Questions will be loaded dynamically -->
                                        </div>
                                    </div>
                                </div>
                                <div class="fa-home-footer">
                                    <button class="fa-start-chat-btn" id="fa-start-chat-btn">
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                                        </svg>
                                        <span>Chat with us</span>
                                    </button>
                                    ${widgetSettings.showBranding ? `<div class="fa-powered-by">
                                        <div class="fa-branding">
                                            Powered by <strong>${widgetSettings.brandName}</strong>
                                        </div>
                                    </div>` : ''}
                                </div>
                            </div>
                            
                            <!-- CHAT VIEW -->
                            <div class="fa-chat-view" id="fa-chat-view" style="display: none;">
                                <div class="fa-widget-header">
                                    <div class="fa-header-content">
                                        <div class="fa-header-back">
                                            <button class="fa-back-btn" id="fa-back-btn" title="Back to home">
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M15.41 16.59L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.59Z" fill="currentColor"/>
                                                </svg>
                                            </button>
                                        </div>
                                        <div class="fa-agent-info">
                                            <div class="fa-agent-avatar">
                                                <div class="fa-avatar-gradient">
                                                    <svg class="fa-avatar-icon" viewBox="0 0 24 24" fill="none">
                                                        <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" fill="currentColor"/>
                                                        <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" fill="currentColor"/>
                                                    </svg>
                                                </div>
                                                <div class="fa-status-badge" id="fa-agent-status">
                                                    <div class="fa-status-dot"></div>
                                                </div>
                                            </div>
                                            <div class="fa-agent-details">
                                                <div class="fa-agent-name">${widgetSettings.companyName}</div>
                                                <div class="fa-agent-status" id="fa-status-text">Typically replies in minutes</div>
                                            </div>
                                        </div>
                                        <div class="fa-header-actions">
                                            <button class="fa-minimize-btn" title="Minimize">
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M19 13H5V11H19V13Z" fill="currentColor"/>
                                                </svg>
                                            </button>
                                            <button class="fa-close-btn" title="Close">
                                                <svg viewBox="0 0 24 24" fill="none">
                                                    <path d="M18.3 5.71C17.91 5.32 17.28 5.32 16.89 5.71L12 10.59L7.11 5.7C6.72 5.31 6.09 5.31 5.7 5.7C5.31 6.09 5.31 6.72 5.7 7.11L10.59 12L5.7 16.89C5.31 17.28 5.31 17.91 5.7 18.3C6.09 18.69 6.72 18.69 7.11 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.11C18.68 6.73 18.68 6.09 18.3 5.71Z" fill="currentColor"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="fa-widget-body">
                                    <div class="fa-messages-container">
                                        <div class="fa-messages-scroll" id="fa-messages-scroll">
                                            <!-- Messages will be added here -->
                                        </div>
                                    </div>
                                    <div class="fa-widget-footer">
                                        <div class="fa-input-container">
                                            <div class="fa-input-wrapper">
                                                <div class="fa-input-field">
                                                    <textarea 
                                                        class="fa-message-input" 
                                                        placeholder="${widgetSettings.placeholderText}" 
                                                        rows="1"
                                                        id="fa-message-input"
                                                        maxlength="1000"
                                                    ></textarea>
                                                    <div class="fa-input-actions">
                                                        <button class="fa-emoji-btn" title="Add emoji">
                                                            <svg viewBox="0 0 24 24" fill="none">
                                                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15.5 8C16.33 8 17 8.67 17 9.5C17 10.33 16.33 11 15.5 11C14.67 11 14 10.33 14 9.5C14 8.67 14.67 8 15.5 8ZM8.5 8C9.33 8 10 8.67 10 9.5C10 10.33 9.33 11 8.5 11C7.67 11 7 10.33 7 9.5C7 8.67 7.67 8 8.5 8ZM12 17.5C9.67 17.5 7.69 16.04 6.89 14H17.11C16.31 16.04 14.33 17.5 12 17.5Z" fill="currentColor"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <button class="fa-send-btn" title="Send message">
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <path d="M3.4 20.4L20.85 12.92C21.66 12.57 21.66 11.43 20.85 11.08L3.4 3.6C2.74 3.31 2.01 3.8 2.01 4.51L2 9.12C2 9.62 2.37 10.05 2.87 10.11L15 12L2.87 13.88C2.37 13.95 2 14.38 2 14.88L2.01 19.49C2.01 20.2 2.74 20.69 3.4 20.4Z" fill="currentColor"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        ${widgetSettings.showBranding ? `<div class="fa-powered-by">
                                            <div class="fa-branding">
                                                Powered by <strong>${widgetSettings.brandName}</strong>
                                            </div>
                                        </div>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Append container to document body
            document.body.appendChild(container);
            
            // Load and render dynamic questions after DOM is ready
            await loadWidgetQuestions();
            renderDynamicQuestions(container);
            
            // Apply widget styling after DOM is ready
            applyWidgetStyles();
            
            // Simple and reliable button animation
            const initializeButtonWithAnimation = async () => {
                console.log('🎬 Starting button initialization...');
                
                try {
                    // Wait for CSS to load
                    await cssLoadPromise;
                    console.log('✅ CSS loaded');
                    
                    const chatLauncherEl = container.querySelector('.fa-chat-launcher');
                    const chatContainerEl = container.querySelector('.fa-chat-container');
                    
                    if (!chatLauncherEl) {
                        console.error('❌ Button element not found!');
                        return;
                    }
                    
                    console.log('🔍 Found button element');
                    
                    // Apply styling classes
                    chatLauncherEl.classList.add(`fa-size-${widgetSettings.buttonSize}`);
                    chatLauncherEl.classList.add(`fa-position-${widgetSettings.buttonPosition}`);
                    chatLauncherEl.classList.add(`fa-radius-${widgetSettings.borderRadius}`);
                    
                    console.log('✅ Applied CSS classes');
                    
                    // SIMPLE APPROACH: Just show the button with a smooth transition
                    setTimeout(() => {
                        console.log('🚀 Showing button...');
                        
                        // Apply animation specifically to this button element only
                        chatLauncherEl.style.transition = 'opacity 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55), transform 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
                        chatLauncherEl.style.opacity = '1';
                        chatLauncherEl.style.transform = 'translateY(0) scale(1)';
                        
                        console.log('✨ Button should now be visible with bounce effect!');
                        
                        // Remove transition after animation completes to prevent interference
                        setTimeout(() => {
                            chatLauncherEl.style.transition = '';
                            console.log('🔧 Removed transition to prevent page interference');
                        }, 1300);
                        
                        // Verify after animation
                        setTimeout(() => {
                            const computed = getComputedStyle(chatLauncherEl);
                            console.log('🔍 Final button state:', {
                                opacity: computed.opacity,
                                transform: computed.transform,
                                display: computed.display
                            });
                        }, 700);
                        
                    }, 300); // Short delay to ensure styles are applied
                    
                    // Apply container border radius
                    if (chatContainerEl) {
                        chatContainerEl.classList.add(`fa-radius-${widgetSettings.borderRadius}`);
                    }
                    
                } catch (error) {
                    console.error('❌ Error initializing button:', error);
                    
                    // EMERGENCY: Just make the button visible immediately
                    const chatLauncherEl = container.querySelector('.fa-chat-launcher');
                    if (chatLauncherEl) {
                        console.log('🆘 Emergency: Making button visible');
                        chatLauncherEl.style.opacity = '1';
                        chatLauncherEl.style.transform = 'none';
                        chatLauncherEl.style.transition = 'none';
                    }
                }
            };
            
            // Initialize button with animation
            initializeButtonWithAnimation();

            // Create tooltip for limit exceeded
            const tooltip = document.createElement('div');
            tooltip.className = 'fa-chat-button-tooltip';
            tooltip.innerHTML = `
                <div class="fa-chat-button-tooltip-title">
                    <span>⚠️</span>
                    <span>Chat Limits Exceeded</span>
                </div>
                <div class="fa-chat-button-tooltip-content">
                    Your chat limits have been reached. Please upgrade your plan or try again later.
                </div>
            `;
            document.body.appendChild(tooltip);

            // Get references to DOM elements with new structure
            const chatLauncher = container.querySelector('.fa-chat-launcher');
            const widgetOverlay = container.querySelector('.fa-widget-overlay');
            const widgetContainer = container.querySelector('.fa-widget-container');
            const chatContainer = container.querySelector('.fa-chat-container');
            const homeView = container.querySelector('#fa-home-view');
            const chatView = container.querySelector('#fa-chat-view');
            const closeBtn = container.querySelector('.fa-close-btn');
            const minimizeBtn = container.querySelector('.fa-minimize-btn');
            const backBtn = container.querySelector('#fa-back-btn');
            const startChatBtn = container.querySelector('#fa-start-chat-btn');
            const questionBtns = container.querySelectorAll('.fa-question-btn');
            const input = container.querySelector('.fa-message-input');
            const sendBtn = container.querySelector('.fa-send-btn');
            const messagesScroll = container.querySelector('.fa-messages-scroll');
            const emojiBtn = container.querySelector('.fa-emoji-btn');
            
            // Function to switch views
            const switchToView = (view) => {
                if (view === 'home') {
                    homeView.style.display = 'block';
                    chatView.style.display = 'none';
                    currentView = 'home';
                } else if (view === 'chat') {
                    homeView.style.display = 'none';
                    chatView.style.display = 'block';
                    currentView = 'chat';
                    // Focus on input when switching to chat
                    setTimeout(() => {
                        if (input) input.focus();
                    }, 100);
                }
            };
            
            // Function to start chat with a message
            const startChatWithMessage = async (message = null) => {
                // Switch to chat view
                switchToView('chat');
                
                // Initialize socket and chat
                await checkEligibilityAndInitialize();
                
                // If a message is provided, send it automatically
                if (message) {
                    // Add the message to input and send it
                    input.value = message;
                    setTimeout(() => {
                        sendMessage();
                    }, 500); // Small delay to ensure socket is connected
                }
            };

            // Check eligibility on page load - for now, chat is always available
            // Only AI responses can be limited, not human agent chat
            const checkInitialEligibility = async () => {
                try {
                    // Check if there are severe limits that would disable ALL chat
                    // For now, we'll always allow chat and let AI limits be handled separately
                    isEligibleForChat = true;
                    
                    // Check AI limits separately
                    const response = await fetch(`${apiUrl}/api/public/check-ai-limits`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ websiteId }),
                    });

                    if (response.ok) {
                        const aiLimitsData = await response.json();
                        isAIEnabled = aiLimitsData.eligible;
                        console.log(`AI enabled: ${isAIEnabled}`);
                    } else {
                        console.warn('AI limits check failed, assuming AI is enabled');
                        isAIEnabled = true;
                    }
                } catch (error) {
                    console.error('Error checking limits:', error);
                    // Default to allowing both chat and AI
                    isEligibleForChat = true;
                    isAIEnabled = true;
                }
            };

            // Run initial eligibility check
            checkInitialEligibility();

            // Function to initialize socket connection
            const initializeSocket = async () => {
                if (!isEligibleForChat) return null; // Don't initialize if not eligible

                try {
                    // Ensure socket server is running by calling the API
                    await fetch(`${apiUrl}/api/socket`);
                    console.log('Socket server initialization triggered');
                } catch (error) {
                    console.warn('Failed to initialize socket server:', error);
                }

                const socketUrl = 'http://localhost:3001';
                const newSocket = io(socketUrl, {
                    transports: ['websocket', 'polling'],
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    timeout: 20000,
                    forceNew: true,
                    query: {
                        websiteId: websiteIdNum,
                        visitorId,
                        visitorIP,
                        type: 'visitor',
                    },
                });

                newSocket.on('connect', () => {
                    console.log('Widget connected to socket server', {
                        socketId: newSocket.id,
                        websiteId: websiteId,
                        visitorId: visitorId,
                        type: 'visitor',
                    });
                    isConnected = true;
                    const status = document.querySelector('.fa-widget-status');
                    if (status) {
                        status.style.backgroundColor = '#4CAF50';
                    }
                    
                    // Check agent status after a short delay to ensure connection is stable
                    setTimeout(() => {
                        checkAgentStatus();
                    }, 1000);
                });

                newSocket.on('connect_error', (error) => {
                    console.error('Widget socket connection error:', error);
                    isConnected = false;
                });

                newSocket.on('error', (error) => {
                    console.error('Widget socket error:', error);
                });

                newSocket.on('disconnect', (reason) => {
                    console.log('Widget disconnected from socket server:', reason);
                    isConnected = false;
                    const status = document.querySelector('.fa-widget-status');
                    if (status) {
                        status.style.backgroundColor = '#ff4444';
                    }
                });

                newSocket.on('visitor-receive-message', handleAdminMessage);
                newSocket.on('limits-exceeded', handleLimitsExceeded);
                
                // Listen for agent status updates
                newSocket.on('agent-status-changed', (data) => {
                    if (data.websiteId === websiteIdNum) {
                        console.log('Agent status changed:', data.online ? 'online' : 'offline');
                        updateAgentStatus(data.online);
                    }
                });
                
                // Listen for admin typing events
                newSocket.on('admin-typing', (data) => {
                    if (data.websiteId === websiteIdNum && data.visitorId === visitorId) {
                        console.log('Admin is typing for this conversation');
                        showTypingIndicator();
                    }
                });
                
                // Listen for admin stop typing events
                newSocket.on('admin-stop-typing', (data) => {
                    if (data.websiteId === websiteIdNum && data.visitorId === visitorId) {
                        console.log('Admin stopped typing for this conversation');
                        hideTypingIndicator();
                    }
                });

                return newSocket;
            };

            // Function to initialize chat - always allow chat, only check AI separately
            const checkEligibilityAndInitialize = async () => {
                try {
                    // Chat is always available for human agents
                    isEligibleForChat = true;
                    
                    // Check AI limits separately
                    const aiResponse = await fetch(`${apiUrl}/api/public/check-ai-limits`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ websiteId }),
                    });

                    if (aiResponse.ok) {
                        const aiData = await aiResponse.json();
                        isAIEnabled = aiData.eligible;
                    } else {
                        isAIEnabled = true; // Default to allowing AI
                    }

                    // Always initialize socket for chat
                    socket = await initializeSocket();
                    input.disabled = false;
                    input.placeholder = 'Type a message...';
                    sendBtn.disabled = false;
                    
                    // If AI is disabled, don't show any notice to users
                    // Keep it completely transparent - they will just get human responses
                    if (!isAIEnabled) {
                        console.log('AI is disabled for this chat, but keeping it transparent to users');
                    }

                } catch (error) {
                    console.error('Error initializing chat:', error);
                    // Even if there's an error, allow chat to work
                    isEligibleForChat = true;
                    isAIEnabled = false;
                    
                    socket = await initializeSocket();
                    input.disabled = false;
                    input.placeholder = 'Type your message...';
                    send.disabled = false;
                    
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'fa-widget-message admin';
                    errorMessage.textContent = 'Chat connected. A human agent will assist you.';
                    content.appendChild(errorMessage);
                }
            };

            // Toggle chat widget - opens to home view
            chatLauncher.addEventListener('click', async () => {
                // If chat limits are exceeded, don't open the widget
                if (!isEligibleForChat && chatLauncher.classList.contains('limit-exceeded')) {
                    // Just toggle the tooltip visibility
                    tooltip.classList.toggle('active');
                    return;
                }

                widgetOverlay.classList.add('active');
                chatLauncher.style.display = 'none';
                
                // Always start with home view
                switchToView('home');
            });
            
            // Back button - return to home view
            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    switchToView('home');
                });
            }
            
            // Start chat button - switch to chat view
            if (startChatBtn) {
                startChatBtn.addEventListener('click', () => {
                    startChatWithMessage();
                });
            }
            
            // Question button clicks - start chat with the question (use event delegation for dynamic buttons)
            const questionsList = container.querySelector('#fa-questions-list');
            if (questionsList) {
                questionsList.addEventListener('click', (e) => {
                    if (e.target.closest('.fa-question-btn')) {
                        const btn = e.target.closest('.fa-question-btn');
                        const question = btn.getAttribute('data-question');
                        if (question) {
                            startChatWithMessage(question);
                        }
                    }
                });
            }

            // Close button functionality
            closeBtn.addEventListener('click', () => {
                widgetOverlay.classList.remove('active');
                chatLauncher.style.display = 'flex';

                // Remove all typing indicators
                hideTypingIndicator();

                // Notify server that visitor is going away
                if (socket && isConnected) {
                    socket.emit('visitor-away', {
                        websiteId: websiteIdNum,
                        visitorId: visitorId,
                        timestamp: new Date()
                    });
                    console.log('Visitor going away, notifying server');
                }
            });

            // Minimize button functionality
            minimizeBtn.addEventListener('click', () => {
                widgetOverlay.classList.remove('active');
                chatLauncher.style.display = 'flex';
            });

            // Click on overlay backdrop to close
            const backdrop = container.querySelector('.fa-widget-backdrop');
            backdrop.addEventListener('click', () => {
                widgetOverlay.classList.remove('active');
                chatLauncher.style.display = 'flex';
            });

            // Input focus effects
            if (input) {
                input.addEventListener('focus', () => {
                    chatContainer.querySelector('.fa-widget-header').style.boxShadow = '0 4px 12px rgba(51, 102, 255, 0.2)';
                });

                input.addEventListener('blur', () => {
                    chatContainer.querySelector('.fa-widget-header').style.boxShadow = 'none';
                });
            }

            // Clear chat history on page unload but keep visitor ID
            window.addEventListener('unload', () => {
                localStorage.removeItem(`fa_chat_${visitorId}`);
                messages = []; // Clear messages array
                cleanup();
            });

            // Cleanup function
            const cleanup = () => {
                if (socket) {
                    // Remove all event listeners before disconnecting
                    socket.removeAllListeners();
                    socket.disconnect(true); // Force disconnect
                    console.log('Widget socket cleaned up and disconnected');
                    socket = null;
                }
                if (container && container.parentNode) {
                    container.remove();
                }
                // Clear any stored references
                isConnected = false;
            };

            // Add cleanup to window unload
            window.addEventListener('unload', cleanup);

            // Initialize emoji picker functionality
            const initializeEmojiPicker = () => {
                // Create emoji picker if it doesn't exist
                if (!container.querySelector('.fa-widget-emoji-picker')) {
                    const emojiPicker = document.createElement('div');
                    emojiPicker.className = 'fa-widget-emoji-picker';

                    // Common emojis
                    const emojis = ['😊', '👍', '🙏', '❤️', '👋', '🎉', '👏', '🤔', '😂', '🔥', '✅', '⭐', '🚀', '💡', '📞', '📧', '🤝', '💼', '⏰', '💯'];

                    // Add emojis to picker
                    emojis.forEach((emoji) => {
                        const emojiElement = document.createElement('div');
                        emojiElement.className = 'fa-widget-emoji';
                        emojiElement.textContent = emoji;
                        emojiPicker.appendChild(emojiElement);
                    });

                    // Add picker to input field container
                    const inputField = container.querySelector('.fa-input-field');
                    if (inputField) {
                        inputField.appendChild(emojiPicker);
                    } else {
                        // Fallback to old structure
                        const inputWrapper = container.querySelector('.fa-widget-input-wrapper');
                        if (inputWrapper) {
                            inputWrapper.appendChild(emojiPicker);
                        }
                    }
                }

                const emojiPicker = container.querySelector('.fa-widget-emoji-picker');
                const emojis = container.querySelectorAll('.fa-widget-emoji');

                // Add emoji button click handler
                if (emojiBtn && emojiPicker) {
                    emojiBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        emojiPicker.classList.toggle('active');
                    });
                }

                // Add emoji click handlers
                emojis.forEach((emoji) => {
                    emoji.addEventListener('click', () => {
                        input.value += emoji.textContent;
                        emojiPicker.classList.remove('active');
                        input.focus();
                    });
                });

                // Close emoji picker when clicking outside
                document.addEventListener('click', (e) => {
                    if (emojiPicker && emojiBtn && !emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
                        emojiPicker.classList.remove('active');
                    }
                });
            };

            // Initialize emoji picker
            initializeEmojiPicker();

            // Function to update agent status indicator
            const updateAgentStatus = (online) => {
                isAgentOnline = online;
                const statusBadge = document.getElementById('fa-agent-status');
                const statusText = document.getElementById('fa-status-text');
                
                if (statusBadge && statusText) {
                    if (online) {
                        statusBadge.classList.add('online');
                        statusText.textContent = 'Agent is online';
                    } else {
                        statusBadge.classList.remove('online');
                        statusText.textContent = 'We typically reply within a few minutes';
                    }
                }
            };

            // Function to check agent online status
            const checkAgentStatus = async () => {
                try {
                    if (socket && isConnected) {
                        // Request current agent status from server
                        socket.emit('check-agent-status', {
                            websiteId: websiteIdNum
                        });
                        console.log('Requesting agent status from server');
                    } else {
                        // Default to offline if no socket connection
                        updateAgentStatus(false);
                    }
                } catch (error) {
                    console.error('Error checking agent status:', error);
                    updateAgentStatus(false);
                }
            };

            // Function to create a message element
            const createMessageElement = (message, isAdmin = false) => {
                const messageElement = document.createElement('div');
                messageElement.className = `fa-widget-message ${isAdmin ? 'admin' : 'user'}`;
                messageElement.textContent = message;
                return messageElement;
            };

            // Function to handle AI limits exceeded event (but keep chat available)
            const handleLimitsExceeded = (data) => {
                console.log('AI limits exceeded during chat session:', data);
                
                // Only disable AI, not the entire chat
                isAIEnabled = false;
                
                // If this is a silent limits exceeded event, don't show anything to user
                if (data.silent) {
                    console.log('Silent AI limits exceeded - no user notification');
                    return;
                }
                
                // Keep chat available for human agents
                // DO NOT disable input or disconnect socket
                // DO NOT show any messages to users - they should not know AI limits are reached
                
                // Keep socket connected for human agent responses
                // Human agents can still respond through the admin panel
                // The chat will appear normal to users, just with human responses instead of AI
            };

            // Function to handle admin messages
            const handleAdminMessage = (data) => {
                // Remove all typing indicators
                hideTypingIndicator();

                const messageElement = createMessageElement(data.message, true);
                messagesScroll.appendChild(messageElement);
                messagesScroll.scrollTop = messagesScroll.scrollHeight;

                // Store message in local storage
                messages.push({
                    type: 'admin',
                    message: data.message,
                    timestamp: new Date(),
                });
                localStorage.setItem(`fa_chat_${visitorId}`, JSON.stringify(messages));
                
                // Check if this message indicates limits exceeded
                if (data.limitExceeded || data.message.includes('limit has been reached')) {
                    // Trigger the limits exceeded handler
                    setTimeout(() => {
                        handleLimitsExceeded({
                            websiteId: data.websiteId,
                            visitorId: data.visitorId,
                            limits: data.limits || {},
                            timestamp: new Date()
                        });
                    }, 1000); // Small delay to let the user read the AI message first
                }
            };

            // Function to show/hide typing indicator
            const showTypingIndicator = () => {
                // Remove any existing typing indicator first
                hideTypingIndicator();
                
                if (isEligibleForChat) {
                    // Create new typing indicator
                    const typingIndicator = document.createElement('div');
                    typingIndicator.className = 'fa-typing-indicator';
                    typingIndicator.innerHTML = `
                        <div class="fa-typing-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    `;
                    messagesScroll.appendChild(typingIndicator);
                    messagesScroll.scrollTop = messagesScroll.scrollHeight;
                }
            };
            
            const hideTypingIndicator = () => {
                const existingIndicators = messagesScroll.querySelectorAll('.fa-typing-indicator');
                existingIndicators.forEach(indicator => {
                    messagesScroll.removeChild(indicator);
                });
            };

            // Function to send a message
            const sendMessage = () => {
                const message = input.value.trim();
                if (!message) return;
                
                // Prevent sending if limits exceeded
                if (!isEligibleForChat || input.disabled) {
                    console.log('Message blocked: Chat limits exceeded');
                    return;
                }

                // Create and append message element
                const messageElement = createMessageElement(message, false);
                messagesScroll.appendChild(messageElement);
                messagesScroll.scrollTop = messagesScroll.scrollHeight;

                // Store message in local storage
                messages.push({
                    type: 'visitor',
                    message: message,
                    timestamp: new Date(),
                });
                localStorage.setItem(`fa_chat_${visitorId}`, JSON.stringify(messages));

                // Don't show typing indicator automatically
                // It will be shown only when the agent is actually typing

                // Send message to server
                if (socket && isConnected) {
                    socket.emit('visitor-message', {
                        message: message,
                        websiteId: websiteIdNum,
                        visitorId: visitorId,
                        messages: messages.map((m) => ({
                            content: m.message,
                            role: m.type === 'visitor' ? 'user' : 'assistant',
                        })),
                    });
                }

                // Clear input
                input.value = '';
                input.style.height = 'auto';
            };

            // Add send button click handler
            sendBtn.addEventListener('click', sendMessage);

            // Add input keypress handler for Enter key
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            });

            // Auto-resize textarea
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = (input.scrollHeight > 100 ? 100 : input.scrollHeight) + 'px';
            });
        } catch (error) {
            console.error('Failed to initialize widget:', error);
            const status = document.querySelector('.fa-widget-status');
            if (status) {
                status.style.backgroundColor = '#ff4444';
            }
        }
    };
})();
