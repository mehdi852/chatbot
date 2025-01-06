(function () {
    // Capture website ID at script load time
    const websiteId = document.currentScript.getAttribute('data-website-id');
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

    // Load CSS file
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/fa.css';
    document.head.appendChild(link);

    // Load Socket.IO client
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
    document.head.appendChild(script);

    script.onload = async () => {
        try {
            // Ensure socket server is running
            await fetch(apiUrl + '/api/socket');

            // Connect to the standalone socket server
            const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : apiUrl.replace(/:\d+/, ':3001');
            const socket = io(socketUrl, {
                transports: ['websocket', 'polling'],
                reconnectionAttempts: 5,
                reconnectionDelay: 1000,
                timeout: 20000,
                forceNew: true,
                query: {
                    websiteId: websiteId,
                    visitorId: visitorId,
                },
            });

            let isConnected = false;

            socket.on('connect', () => {
                console.log('Widget connected to socket server', {
                    socketId: socket.id,
                    websiteId: websiteId,
                    visitorId: visitorId,
                });
                isConnected = true;
                const status = document.querySelector('.fa-widget-status');
                if (status) {
                    status.style.backgroundColor = '#4CAF50';
                }
            });

            socket.on('disconnect', (reason) => {
                console.log('Widget disconnected from socket server:', reason);
                isConnected = false;
                const status = document.querySelector('.fa-widget-status');
                if (status) {
                    status.style.backgroundColor = '#ff4444';
                }
            });

            socket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                isConnected = false;
                const status = document.querySelector('.fa-widget-status');
                if (status) {
                    status.style.backgroundColor = '#ff4444';
                }
            });

            // Create chat button
            const chatButtonHTML = `
                <button class="fa-chat-button">
                    Chat with us <span class="wave">👋</span>
                </button>
            `;

            // Create chat widget
            const widgetHTML = `
                <div class="fa-widget-container">
                    <div class="fa-widget-header">
                        <div class="fa-widget-avatar">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#0061FF">
                                <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM12 14H6V12H12V14ZM18 10H6V8H18V10Z"/>
                            </svg>
                        </div>
                        <div class="fa-widget-header-text">
                            <h3 class="fa-widget-header-title">Hi there <span class="wave">👋</span></h3>
                            <p class="fa-widget-header-subtitle">
                                <span class="fa-widget-status" style="display:inline-block;width:8px;height:8px;border-radius:50%;background-color:#ff4444;margin-right:5px"></span>
                                We reply immediately
                            </p>
                        </div>
                        <button class="fa-close-button">✕</button>
                    </div>
                    <div class="fa-widget-content">
                        <!-- Chat messages will be appended here -->
                    </div>
                    <div class="fa-widget-input-container">
                        <button class="fa-widget-emoji-btn" aria-label="Choose emoji">😊</button>
                        <input type="text" class="fa-widget-input" placeholder="Type your message...">
                        <button class="fa-widget-send" aria-label="Send message">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="fa-widget-emoji-picker">
                        ${getCommonEmojis()}
                    </div>
                </div>
            `;

            // Helper function for emojis
            function getCommonEmojis() {
                const emojis = ['😊', '👋', '👍', '🙏', '❤️', '👏', '🎉', '✨', '🔥', '💡', '📝', '💬', '🤝', '⭐', '💪', '🚀'];
                return emojis.map((emoji) => `<div class="fa-widget-emoji">${emoji}</div>`).join('');
            }

            // Initialize widget
            const container = document.createElement('div');
            container.innerHTML = chatButtonHTML + widgetHTML;
            document.body.appendChild(container);

            // Get elements
            const chatButton = container.querySelector('.fa-chat-button');
            const widgetContainer = container.querySelector('.fa-widget-container');
            const closeButton = container.querySelector('.fa-close-button');
            const input = container.querySelector('.fa-widget-input');
            const send = container.querySelector('.fa-widget-send');
            const content = container.querySelector('.fa-widget-content');

            // Load chat history from localStorage
            const loadChatHistory = () => {
                const history = localStorage.getItem(`fa_chat_${visitorId}`);
                if (history) {
                    const messages = JSON.parse(history);
                    messages.forEach((msg) => {
                        const message = document.createElement('div');
                        message.className = 'fa-widget-message';
                        message.style.background = msg.type === 'visitor' ? '#0061FF' : '#f0f0f0';
                        message.style.color = msg.type === 'visitor' ? 'white' : '#000';
                        message.style.marginLeft = msg.type === 'visitor' ? 'auto' : '0';
                        message.style.marginRight = msg.type === 'visitor' ? '0' : 'auto';
                        message.style.width = 'fit-content';
                        message.textContent = msg.message;
                        content.appendChild(message);
                    });
                    content.scrollTop = content.scrollHeight;
                }
            };

            // Save message to chat history
            const saveChatHistory = (message, type) => {
                const history = localStorage.getItem(`fa_chat_${visitorId}`);
                const messages = history ? JSON.parse(history) : [];
                messages.push({ message, type, timestamp: new Date() });
                localStorage.setItem(`fa_chat_${visitorId}`, JSON.stringify(messages));
            };

            // Listen for admin messages (moved outside message sending block)
            const handleAdminMessage = (data) => {
                console.log('Received admin message:', data, 'Current IDs:', { websiteId, visitorId });
                if (data.websiteId === websiteId && data.visitorId === visitorId) {
                    console.log('Message matches current visitor, displaying...');
                    const message = document.createElement('div');
                    message.className = 'fa-widget-message';
                    message.style.background = '#f0f0f0';
                    message.style.color = '#000';
                    message.style.marginRight = 'auto';
                    message.style.width = 'fit-content';
                    message.textContent = data.message;
                    content.appendChild(message);
                    content.scrollTop = content.scrollHeight;

                    // Save to chat history
                    saveChatHistory(data.message, 'admin');
                } else {
                    console.log('Message does not match current visitor:', {
                        expected: { websiteId, visitorId },
                        received: { websiteId: data.websiteId, visitorId: data.visitorId },
                    });
                }
            };

            // Add socket event listener
            socket.on('visitor-receive-message', handleAdminMessage);

            // Toggle chat widget
            chatButton.addEventListener('click', () => {
                widgetContainer.classList.add('active');
                chatButton.style.display = 'none';
                if (input) input.focus();
                loadChatHistory();
            });

            // Close button functionality
            closeButton.addEventListener('click', () => {
                widgetContainer.classList.remove('active');
                chatButton.style.display = 'flex';
            });

            // Message sending functionality
            if (send && input) {
                send.addEventListener('click', () => {
                    if (input.value.trim() && isConnected) {
                        const messageData = {
                            message: input.value,
                            websiteId: websiteId,
                            visitorId: visitorId,
                            timestamp: new Date(),
                        };

                        // Send message to server
                        socket.emit('visitor-message', messageData);

                        const message = document.createElement('div');
                        message.className = 'fa-widget-message';
                        message.style.background = '#0061FF';
                        message.style.color = 'white';
                        message.style.marginLeft = 'auto';
                        message.style.width = 'fit-content';
                        message.textContent = input.value;
                        content.appendChild(message);

                        // Save to chat history
                        saveChatHistory(input.value, 'visitor');

                        input.value = '';
                        content.scrollTop = content.scrollHeight;
                    }
                });

                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        send.click();
                    }
                });
            }

            // Cleanup function
            const cleanup = () => {
                socket.off('visitor-receive-message', handleAdminMessage);
                socket.disconnect();
                container.remove();
            };

            // Add cleanup to window unload
            window.addEventListener('unload', cleanup);

            // Initialize emoji picker
            const emojiBtn = container.querySelector('.fa-widget-emoji-btn');
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
                if (!emojiBtn.contains(e.target) && !emojiPicker.contains(e.target)) {
                    emojiPicker.classList.remove('active');
                }
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
