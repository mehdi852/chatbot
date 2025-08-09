(function () {
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

    // Load external CSS file
    const loadStyles = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = `${apiUrl}/fa-styles.css`;
        document.head.appendChild(link);
    };

    // Load the CSS
    loadStyles();

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

            let socket = null;
            let isConnected = false;
            let isEligibleForChat = true; // Chat is always available for human agents
            let isAIEnabled = true; // Separate flag for AI responses
            let isAgentOnline = false; // Track if human agent is online
            let messages = [];

            // Create and inject HTML elements
            const container = document.createElement('div');
            container.innerHTML = `
                <button class="fa-chat-button">
                    <span class="wave">👋</span>
                    Chat with us
                </button>
                <div class="fa-widget-container">
                    <div class="fa-chat-container">
                        <div class="fa-widget-header">
                            <div class="fa-agent-avatar">
                                <div class="fa-avatar-circle">
                                    <svg class="fa-avatar-icon" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                                    </svg>
                                </div>
                                <div class="fa-status-indicator" id="fa-agent-status"></div>
                            </div>
                            <div class="fa-widget-header-text">
                                <h3 class="fa-widget-header-title">Chat with us</h3>
                                <p class="fa-widget-header-subtitle" id="fa-status-text">We typically reply within a few minutes</p>
                            </div>
                            <button class="fa-close-button">×</button>
                        </div>
                        <div class="fa-widget-content"></div>
                        <div class="fa-widget-input-container">
                            <div class="fa-widget-input-wrapper">
                                <textarea class="fa-widget-input" placeholder="Type your message..." rows="1"></textarea>
                                <button class="fa-widget-emoji-btn">😊</button>
                            </div>
                            <button class="fa-widget-send">
                                <svg viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </div>
                        <div class="fa-widget-branding">
                            Powered by BirdSeed
                        </div>
                    </div>
                </div>
            `;

            // Append container to document body
            document.body.appendChild(container);

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

            // Get references to DOM elements
            const chatButton = container.querySelector('.fa-chat-button');
            const widgetContainer = container.querySelector('.fa-widget-container');
            const chatContainer = container.querySelector('.fa-chat-container');
            const closeButtons = container.querySelectorAll('.fa-close-button');
            const input = container.querySelector('.fa-widget-input');
            const send = container.querySelector('.fa-widget-send');
            const content = container.querySelector('.fa-widget-content');

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
                    content.classList.remove('limit-exceeded');
                    document.querySelector('.fa-widget-input-container').classList.remove('limit-exceeded');
                    input.disabled = false;
                    input.placeholder = 'Type your message...';
                    send.disabled = false;
                    
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

            // Toggle chat widget
            chatButton.addEventListener('click', async () => {
                // If chat limits are exceeded, don't open the widget
                if (!isEligibleForChat && chatButton.classList.contains('limit-exceeded')) {
                    // Just toggle the tooltip visibility
                    tooltip.classList.toggle('active');
                    return;
                }

                widgetContainer.classList.add('active');
                chatButton.style.display = 'none';
                chatContainer.style.display = 'flex';

                // Add a visual indicator that the chat is loading
                const loadingMessage = document.createElement('div');
                loadingMessage.className = 'fa-widget-message admin';
                loadingMessage.textContent = 'Connecting to chat...';
                content.innerHTML = '';
                content.appendChild(loadingMessage);

                // Check eligibility and initialize chat
                await checkEligibilityAndInitialize();

                if (isEligibleForChat) {
                    // Remove loading message
                    content.removeChild(loadingMessage);

                    // Add welcome message
                    const welcomeMessage = document.createElement('div');
                    welcomeMessage.className = 'fa-widget-message admin';
                    welcomeMessage.textContent = 'Hello! How can we help you today?';
                    content.appendChild(welcomeMessage);

                    // Focus on input field
                    input.focus();
                }
            });

            // Close button functionality
            closeButtons.forEach((closeButton) => {
                closeButton.addEventListener('click', () => {
                    widgetContainer.classList.remove('active');
                    chatButton.style.display = 'flex';

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

                    // Clear chat history but keep visitor ID
                    localStorage.removeItem(`fa_chat_${visitorId}`);
                    content.innerHTML = ''; // Clear chat messages from DOM
                    messages = []; // Clear messages array
                    if (socket) {
                        socket.disconnect();
                        socket = null;
                    }
                });
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

            // Initialize emoji picker
            const emojiBtn = container.querySelector('.fa-widget-emoji-btn');

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

                // Add picker to container
                container.querySelector('.fa-widget-input-wrapper').appendChild(emojiPicker);
            }

            const emojiPicker = container.querySelector('.fa-widget-emoji-picker');
            const emojis = container.querySelectorAll('.fa-widget-emoji');

            emojiBtn.addEventListener('click', () => {
                emojiPicker.classList.toggle('active');
            });

            emojis.forEach((emoji) => {
                emoji.addEventListener('click', () => {
                    input.value += emoji.textContent;
                    emojiPicker.classList.remove('active');
                    input.focus();
                });
            });

            // Close emoji picker when clicking outside
            document.addEventListener('click', (e) => {
                if (emojiPicker && !emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
                    emojiPicker.classList.remove('active');
                }
            });

            // Function to update agent status indicator
            const updateAgentStatus = (online) => {
                isAgentOnline = online;
                const statusIndicator = document.getElementById('fa-agent-status');
                const statusText = document.getElementById('fa-status-text');
                
                if (statusIndicator && statusText) {
                    if (online) {
                        statusIndicator.style.backgroundColor = '#4CAF50'; // Green for online
                        statusIndicator.style.boxShadow = '0 0 6px rgba(76, 175, 80, 0.6)';
                        statusText.textContent = 'Agent is online';
                    } else {
                        statusIndicator.style.backgroundColor = '#f44336'; // Red for offline
                        statusIndicator.style.boxShadow = '0 0 6px rgba(244, 67, 54, 0.6)';
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
                content.appendChild(messageElement);
                content.scrollTop = content.scrollHeight;

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
                        <span></span>
                        <span></span>
                        <span></span>
                    `;
                    content.appendChild(typingIndicator);
                    content.scrollTop = content.scrollHeight;
                }
            };
            
            const hideTypingIndicator = () => {
                const existingIndicators = content.querySelectorAll('.fa-typing-indicator');
                existingIndicators.forEach(indicator => {
                    content.removeChild(indicator);
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
                content.appendChild(messageElement);
                content.scrollTop = content.scrollHeight;

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
            send.addEventListener('click', sendMessage);

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
