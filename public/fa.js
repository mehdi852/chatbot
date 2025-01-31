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

    // Create and inject CSS
    const styles = `
        .fa-chat-button {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #0047AB;
            color: white;
            border: none;
            border-radius: 50px;
            padding: 12px 24px;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(51, 102, 255, 0.2);
            transition: all 0.3s ease;
            z-index: 999999;
            font-family: 'Arial', sans-serif;
        }

        .fa-chat-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(51, 102, 255, 0.3);
        }

        .wave {
            animation: wave 0.5s infinite;
            display: inline-block;
            transform-origin: 70% 70%;
            color: #FFC107;
        }

        @keyframes wave {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-10deg); }
            75% { transform: rotate(10deg); }
            100% { transform: rotate(0deg); }
        }

        .fa-widget-container {
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 385px;
            height: 600px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 999999;
            opacity: 0;
            transform: translateY(20px);
            pointer-events: none;
            transition: all 0.3s ease;
            font-family: 'Roboto', sans-serif;
        }

        .fa-widget-container.active {
            opacity: 1;
            transform: translateY(0);
            pointer-events: all;
        }

        .fa-widget-header {
            padding: 16px;
            background: #0047AB;
            color: white;
            display: flex;
            align-items: center;
            gap: 12px;
            border-radius: 16px 16px 0 0;
            position: relative;
        }

        .fa-widget-wave-separator {
            height: 15px;
            width: 100%;
            position: relative;
            background: #0047AB;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            overflow: hidden;
        }

        .fa-widget-wave-separator svg {
            position: absolute;
            top: 0;
            width: 100%;
            height: 15px;
            color: white;
            display: block;
            background-repeat: no-repeat;
            background-position: center;
               transform: scaleY(-1);
    position: relative;
    top: 6px;
        }

        .fa-widget-header-text {
            flex: 1;
        }

        .fa-widget-header-title {
            font-size: 18px;
            font-weight: bold;
            margin: 0;
            font-family: 'Arial', sans-serif;
        }

        .fa-widget-header-subtitle {
            font-size: 14px;
            margin: 4px 0 0;
            opacity: 0.9;
        }

        .fa-close-button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 18px;
            padding: 4px;
            opacity: 0.8;
            transition: all 0.2s;
        }

        .fa-close-button:hover {
            opacity: 1;
            transform: scale(1.1);
        }

        .fa-widget-content {
            margin-top: -1px; /* To prevent any gap between wave and content */
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #FFFFFF;
            position: relative;
            z-index: 1;
            scrollbar-width: thin;
            scrollbar-color: rgba(51, 102, 255, 0.2) transparent;
        }

        .fa-widget-content::-webkit-scrollbar {
            width: 6px;
        }

        .fa-widget-content::-webkit-scrollbar-track {
            background: transparent;
        }

        .fa-widget-content::-webkit-scrollbar-thumb {
            background-color: rgba(51, 102, 255, 0.2);
            border-radius: 3px;
        }

        .fa-widget-message {
            max-width: 85%;
            width: fit-content;
            padding: 12px 16px;
            border-radius: 8px;
            margin: 8px 0;
            word-wrap: break-word;
            font-family: 'Inter', sans-serif;
            animation: fadeIn 0.3s ease;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            line-height: 1.5;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .fa-widget-message.admin {
            background: #F3F4F6;
            color: #111827;
            margin-right: auto;
            font-size: 14px;
            border-bottom-left-radius: 2px;
        }

        .fa-widget-message.user {
            background: #EEF2FF;
            color: #1E40AF;
            margin-left: auto;
            font-size: 14px;
            border-bottom-right-radius: 2px;
            font-weight: 400;
        }

        .fa-widget-input-container {
            padding: 16px;
            background: #FFFFFF;
            border-top: 1px solid #E5E7EB;
            display: flex;
            align-items: center;
            gap: 12px;
            height: 76px;
            box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);
            position: relative;
        }

        .fa-widget-input-wrapper {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            transition: all 0.2s ease;
            padding: 0 4px;
        }

        .fa-widget-input-wrapper:focus-within {
            background: #FFFFFF;
            border-color: #3366FF;
            box-shadow: 0 0 0 3px rgba(51, 102, 255, 0.1);
        }

        .fa-widget-input {
            flex: 1;
            border: none;
            background: transparent;
            padding: 12px;
            font-size: 14px;
            line-height: 20px;
            color: #1F2937;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            resize: none;
            min-height: 44px;
            max-height: 44px;
        }

        .fa-widget-input:focus {
            outline: none;
            box-shadow: none;
        }

        .fa-widget-input::placeholder {
            color: #9CA3AF;
        }

        .fa-widget-emoji-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 8px;
            height: 36px;
            width: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            color: #6B7280;
            transition: all 0.15s ease;
            margin-left: 4px;
        }

        .fa-widget-send {
            background: #3366FF;
            border: none;
            cursor: pointer;
            padding: 0;
            height: 44px;
            min-width: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 10px;
            color: white;
            transition: all 0.15s ease;
            box-shadow: 0 1px 2px rgba(51, 102, 255, 0.1);
        }

        .fa-widget-send:hover {
            background: #2952CC;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(51, 102, 255, 0.2);
        }

        .fa-widget-send:active {
            transform: translateY(0);
            box-shadow: 0 1px 2px rgba(51, 102, 255, 0.1);
        }

        .fa-widget-send svg {
            width: 20px;
            height: 20px;
            fill: currentColor;
        }

        .fa-widget-emoji-btn:hover {
            background-color: #F3F4F6;
            color: #4B5563;
        }

        .fa-widget-input-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .fa-widget-attachment-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 8px;
            height: 36px;
            width: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            color: #6B7280;
            transition: all 0.15s ease;
        }

        .fa-widget-attachment-btn:hover {
            background-color: #F3F4F6;
            color: #4B5563;
        }

        .fa-widget-emoji-picker {
            display: none;
            position: absolute;
            bottom: 80px;
            left: 16px;
            background: white;
            border: 1px solid #eee;
            border-radius: 12px;
            padding: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            grid-template-columns: repeat(8, 1fr);
            gap: 8px;
        }

        .fa-widget-emoji-picker.active {
            display: grid;
        }

        .fa-widget-emoji {
            cursor: pointer;
            padding: 4px;
            text-align: center;
            transition: transform 0.2s;
            font-size: 16px;
        }

        .fa-widget-emoji:hover {
            transform: scale(1.2);
        }

        .fa-widget-branding {
            text-align: center;
            padding: 8px;
            font-size: 12px;
            color: #808080;
            background: white;
            border-top: 1px solid #eee;
        }
    `;

    // Create style element and append to head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);

    // Load Socket.IO client
    const script = document.createElement('script');
    script.src = 'https://cdn.socket.io/4.5.4/socket.io.min.js';
    document.head.appendChild(script);

    script.onload = async () => {
        try {
            // Ensure socket server is running and websiteId is valid
            if (!websiteId || isNaN(websiteId)) {
                console.error('Invalid or missing websiteId parameter');
                return;
            }

            // Ensure socket server is running
            await fetch(apiUrl + '/api/socket');

            // Connect to the standalone socket server
            const socketUrl = 'http://localhost:3001';

            // Ensure websiteId is a number
            const websiteIdNum = parseInt(websiteId);
            if (isNaN(websiteIdNum)) {
                console.error('Invalid websiteId:', websiteId);
                return;
            }

            console.log('Connecting with params:', {
                websiteId: websiteIdNum,
                visitorId,
                type: 'visitor',
            });

            const socket = io(socketUrl, {
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

            // Add messages array to store conversation history
            let messages = [];

            let isConnected = false;

            socket.on('connect', () => {
                console.log('Widget connected to socket server', {
                    socketId: socket.id,
                    websiteId: websiteId,
                    visitorId: visitorId,
                    type: 'visitor',
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

            // Listen for AI state changes
            socket.on('ai-state-changed', (data) => {
                console.log('Received AI state change:', data);
                if (data.websiteId === websiteId) {
                    socket.websiteData = {
                        ...socket.websiteData,
                        isAiEnabled: data.isAiEnabled,
                    };
                }
            });

            // Create chat button
            const chatButtonHTML = `
                <button class="fa-chat-button">
                    <span>Chat with us</span> <span class="wave">👋</span>
                </button>
            `;

            // Create chat widget
            const widgetHTML = `
                <div class="fa-widget-container">
                    <div class="fa-widget-header">
                        <div class="fa-widget-avatar">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
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
                    <div class="fa-widget-wave-separator">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 372 15" preserveAspectRatio="none">
                            <path d="M349.8 1.4C334.5.4 318.5 0 302 0h-2.5c-9.1 0-18.4.1-27.8.4-34.5 1-68.3 3-102.3 4.7-14 .5-28 1.2-41.5 1.6C84 7.7 41.6 5.3 0 2.2v8.4c41.6 3 84 5.3 128.2 4.1 13.5-.4 27.5-1.1 41.5-1.6 33.9-1.7 67.8-3.6 102.3-4.7 9.4-.3 18.7-.4 27.8-.4h2.5c16.5 0 32.4.4 47.8 1.4 8.4.3 15.6.7 22 1.2V2.2c-6.5-.5-13.8-.5-22.3-.8z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <div class="fa-widget-content">
                        <!-- Chat messages will be appended here -->
                    </div>
                    <div class="fa-widget-input-container">
                        <div class="fa-widget-input-wrapper">
                            <button class="fa-widget-attachment-btn" aria-label="Add attachment">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                                </svg>
                            </button>
                            <input type="text" class="fa-widget-input" placeholder="Type your message...">
                            <button class="fa-widget-emoji-btn" aria-label="Choose emoji">😊</button>
                        </div>
                        <button class="fa-widget-send" aria-label="Send message">
                            <svg viewBox="0 0 24 24">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="fa-widget-emoji-picker">
                        ${getCommonEmojis()}
                    </div>
                    <div class="fa-widget-branding">
                        Powered by FriendlyAssist
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

            // Function to create message element
            const createMessageElement = (message, isAdmin) => {
                const messageEl = document.createElement('div');
                messageEl.className = `fa-widget-message ${isAdmin ? 'admin' : 'user'}`;
                messageEl.textContent = message;
                return messageEl;
            };

            // Listen for admin messages
            const handleAdminMessage = (data) => {
                if (data.websiteId === websiteId && data.visitorId === visitorId) {
                    console.log('Received admin message:', data);
                    const message = createMessageElement(data.message, true);
                    content.appendChild(message);
                    content.scrollTop = content.scrollHeight;

                    messages.push({
                        type: 'admin',
                        message: data.message,
                        timestamp: new Date().toISOString(),
                    });
                    console.log('Updated conversation history:', messages);
                }
            };

            // Add socket event listener
            socket.on('visitor-receive-message', handleAdminMessage);

            // Toggle chat widget
            chatButton.addEventListener('click', () => {
                widgetContainer.classList.add('active');
                chatButton.style.display = 'none';
                if (input) {
                    input.focus();
                    widgetContainer.querySelector('.fa-widget-header').style.boxShadow = '0 4px 12px rgba(51, 102, 255, 0.2)';
                }
            });

            // Input focus effects
            if (input) {
                input.addEventListener('focus', () => {
                    widgetContainer.querySelector('.fa-widget-header').style.boxShadow = '0 4px 12px rgba(51, 102, 255, 0.2)';
                });

                input.addEventListener('blur', () => {
                    widgetContainer.querySelector('.fa-widget-header').style.boxShadow = 'none';
                });
            }

            // Close button functionality
            closeButton.addEventListener('click', () => {
                widgetContainer.classList.remove('active');
                chatButton.style.display = 'flex';
                // Clear chat history but keep visitor ID
                localStorage.removeItem(`fa_chat_${visitorId}`);
                content.innerHTML = ''; // Clear chat messages from DOM
            });

            // Clear chat history on page unload but keep visitor ID
            window.addEventListener('unload', () => {
                localStorage.removeItem(`fa_chat_${visitorId}`);
                messages = []; // Clear messages array
                cleanup();
            });

            // Message sending functionality
            if (send && input) {
                send.addEventListener('click', () => {
                    if (input.value.trim() && isConnected) {
                        console.log('Current conversation history before adding new message:', messages);

                        // Add visitor message to history first
                        messages.push({
                            type: 'visitor',
                            message: input.value,
                            timestamp: new Date().toISOString(),
                        });

                        console.log('Updated conversation history:', messages);

                        // Create message element
                        const message = createMessageElement(input.value, false);
                        content.appendChild(message);

                        // Send message to server
                        const messageData = {
                            message: input.value,
                            websiteId: websiteIdNum,
                            visitorId: visitorId,
                            timestamp: new Date(),
                            messages: [...messages], // Send a copy of the messages array
                        };

                        console.log('Sending message data with history:', messageData);

                        // Send message to server
                        socket.emit('visitor-message', messageData);

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
