'use client';

import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useUserContext } from '@/app/provider';
import { GoogleGenerativeAI } from '@google/generative-ai';

const ChatPage = () => {
    const { dbUser } = useUserContext();

    // Unified chat state to prevent inconsistencies
    const [chatState, setChatState] = useState({
        conversations: {}, // Format: { visitorId: { messages: [], lastRead: timestamp } }
        visitors: [],
        selectedVisitorId: null,
        selectedWebsite: null,
        userWebsites: [],
        isConnected: false,
        isAIEnabled: false,
        isAIResponding: false,
        activeTab: 'live', // 'live' or 'history'
        chatHistory: [], // Store past conversations
        isLoadingHistory: false,
        historyError: null,
    });

    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const genAI = useRef(null);
    const isAIEnabledRef = useRef(false);

    // Get current conversation messages
    const currentMessages = chatState.selectedVisitorId ? chatState.conversations[chatState.selectedVisitorId]?.messages || [] : [];

    // Update AI enabled ref when state changes
    useEffect(() => {
        isAIEnabledRef.current = chatState.isAIEnabled;
    }, [chatState.isAIEnabled]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch user's websites
    useEffect(() => {
        const fetchWebsites = async () => {
            if (dbUser?.id) {
                try {
                    const response = await fetch(`/api/websites?userId=${dbUser.id}`);
                    const data = await response.json();
                    setChatState((prev) => ({
                        ...prev,
                        userWebsites: data.websites,
                        selectedWebsite: data.websites.length > 0 ? data.websites[0] : null,
                    }));
                } catch (error) {
                    console.error('Failed to fetch websites:', error);
                }
            }
        };
        fetchWebsites();
    }, [dbUser]);

    // Initialize Gemini AI
    useEffect(() => {
        if (chatState.isAIEnabled && !genAI.current && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            try {
                genAI.current = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
                console.log('Gemini AI initialized successfully');
            } catch (error) {
                console.error('Failed to initialize Gemini AI:', error);
            }
        }
    }, [chatState.isAIEnabled]);

    // Helper function to add message to conversation
    const addMessageToConversation = (visitorId, message, type) => {
        console.log('Adding message to conversation:', {
            visitorId,
            messageType: type,
            messageContent: message,
        });

        setChatState((prev) => {
            const conversation = prev.conversations[visitorId] || { messages: [], lastRead: new Date() };
            console.log('Previous conversation state:', {
                existingMessages: conversation.messages,
                messageCount: conversation.messages.length,
            });

            const newMessage = {
                ...message,
                type,
                timestamp: message.timestamp || new Date().toISOString(),
            };

            const updatedConversation = {
                ...conversation,
                messages: [...conversation.messages, newMessage],
            };

            console.log('Updated conversation state:', {
                messageCount: updatedConversation.messages.length,
                latestMessage: newMessage,
            });

            return {
                ...prev,
                conversations: {
                    ...prev.conversations,
                    [visitorId]: updatedConversation,
                },
            };
        });
    };

    // Helper function to update visitor list
    const updateVisitorsList = (visitorId, lastMessage, websiteId) => {
        setChatState((prev) => {
            const existingVisitor = prev.visitors.find((v) => v.id === visitorId);
            const updatedVisitors = existingVisitor
                ? prev.visitors.map((v) =>
                      v.id === visitorId
                          ? {
                                ...v,
                                lastMessage,
                                timestamp: new Date().toISOString(),
                                unread: prev.selectedVisitorId !== visitorId,
                            }
                          : v
                  )
                : [
                      ...prev.visitors,
                      {
                          id: visitorId,
                          lastMessage,
                          timestamp: new Date().toISOString(),
                          unread: true,
                          websiteId,
                      },
                  ];

            return {
                ...prev,
                visitors: updatedVisitors,
            };
        });
    };

    // Add function to load conversation history
    const loadConversationHistory = async (visitorId, websiteId) => {
        try {
            const response = await fetch(`/api/chat/conversation?websiteId=${websiteId}&visitorId=${visitorId}&userId=${dbUser?.id}`);
            const data = await response.json();

            if (data.messages) {
                setChatState((prev) => ({
                    ...prev,
                    conversations: {
                        ...prev.conversations,
                        [visitorId]: {
                            messages: data.messages.map((msg) => ({
                                message: msg.message,
                                type: msg.type,
                                timestamp: msg.timestamp,
                            })),
                            lastRead: new Date(),
                        },
                    },
                }));
            }
        } catch (error) {
            console.error('Failed to load conversation history:', error);
        }
    };

    // Modify handleVisitorSelect to load conversation history
    const handleVisitorSelect = async (visitor) => {
        setChatState((prev) => ({
            ...prev,
            selectedVisitorId: visitor.id,
            visitors: prev.visitors.map((v) => (v.id === visitor.id ? { ...v, unread: false } : v)),
        }));

        // Load conversation history when selecting a visitor
        if (chatState.selectedWebsite) {
            try {
                const response = await fetch(`/api/chat/conversation?websiteId=${chatState.selectedWebsite.id}&visitorId=${visitor.id}&userId=${dbUser?.id}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load conversation');
                }

                if (data.messages) {
                    setChatState((prev) => ({
                        ...prev,
                        conversations: {
                            ...prev.conversations,
                            [visitor.id]: {
                                messages: data.messages.map((msg) => ({
                                    message: msg.message,
                                    type: msg.type,
                                    timestamp: msg.timestamp,
                                })),
                                lastRead: new Date(),
                            },
                        },
                    }));
                }
            } catch (error) {
                console.error('Failed to load conversation:', error);
                // Optionally show an error message to the user
            }
        }
    };

    // Socket initialization
    useEffect(() => {
        if (chatState.selectedWebsite && !socketRef.current && dbUser?.id) {
            const initSocket = async () => {
                try {
                    await fetch('/api/socket');
                    const socketInstance = io('http://localhost:3001', {
                        transports: ['websocket', 'polling'],
                        reconnectionAttempts: 5,
                        reconnectionDelay: 1000,
                        timeout: 20000,
                        forceNew: true,
                        query: {
                            websiteId: chatState.selectedWebsite.id,
                            userId: dbUser.id,
                        },
                    });

                    // Add connection event handlers
                    socketInstance.on('connect', () => {
                        console.log('Connected to socket server');
                        setChatState((prev) => ({ ...prev, isConnected: true }));
                    });

                    socketInstance.on('disconnect', () => {
                        console.log('Disconnected from socket server');
                        setChatState((prev) => ({ ...prev, isConnected: false }));
                    });

                    socketInstance.on('connect_error', (error) => {
                        console.error('Socket connection error:', error);
                        setChatState((prev) => ({ ...prev, isConnected: false }));
                    });

                    socketInstance.on('admin-receive-message', async (data) => {
                        if (data.websiteId.toString() === chatState.selectedWebsite.id.toString()) {
                            // Save visitor message to database
                            try {
                                await fetch('/api/chat/conversation', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        websiteId: data.websiteId,
                                        visitorId: data.visitorId,
                                        message: data.message,
                                        type: 'visitor',
                                        userId: dbUser.id, // Add userId for authentication
                                    }),
                                });
                            } catch (error) {
                                console.error('Failed to save visitor message:', error);
                            }

                            addMessageToConversation(data.visitorId, data, 'visitor');
                            updateVisitorsList(data.visitorId, data.message, data.websiteId);

                            if (isAIEnabledRef.current) {
                                handleAIResponse(data.message, {
                                    visitorId: data.visitorId,
                                    websiteId: data.websiteId,
                                });
                            }
                        }
                    });

                    socketRef.current = socketInstance;
                } catch (error) {
                    console.error('Socket initialization failed:', error);
                }
            };

            initSocket();

            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect();
                    socketRef.current = null;
                }
            };
        }
    }, [chatState.selectedWebsite, dbUser]);

    // Format conversation history for AI
    const formatConversationHistory = (visitorId, newMessage = null) => {
        console.log('Formatting conversation history for visitor:', visitorId);
        const conversation = chatState.conversations[visitorId];

        if (!conversation) {
            console.log('No existing conversation found for visitor:', visitorId);
            return '';
        }

        console.log('Current conversation state:', {
            existingMessages: conversation.messages,
            messageCount: conversation.messages.length,
        });

        // Combine existing messages with the new message if provided
        const allMessages = newMessage ? [...conversation.messages, { type: 'visitor', message: newMessage, timestamp: new Date().toISOString() }] : conversation.messages;

        console.log('All messages to be formatted:', {
            totalMessages: allMessages.length,
            messages: allMessages,
        });

        // Format each message with role and timestamp
        const formattedHistory = allMessages
            .map((msg, index) => {
                const role = msg.type === 'visitor' ? 'Customer' : 'Agent';
                const time = new Date(msg.timestamp).toLocaleTimeString();
                return `[${time}] ${role}: ${msg.message}`;
            })
            .join('\n');

        console.log('Formatted conversation history:', formattedHistory);
        return formattedHistory;
    };

    const handleAIResponse = async (visitorMessage, visitorData) => {
        if (!isAIEnabledRef.current || !genAI.current) return;

        try {
            setChatState((prev) => ({ ...prev, isAIResponding: true }));
            const model = genAI.current.getGenerativeModel({ model: 'models/gemini-2.0-flash-exp' });
            const currentConversation = chatState.conversations[visitorData.visitorId];

            console.log('Current conversation before AI response:', {
                visitorId: visitorData.visitorId,
                messageCount: currentConversation?.messages?.length || 0,
                fullConversation: currentConversation,
            });

            // Create a complete message list including the new message
            const allMessages = currentConversation?.messages || [];
            const completeMessageList = [...allMessages, { type: 'visitor', message: visitorMessage, timestamp: new Date().toISOString() }];

            // Format the conversation history
            const conversationHistory = completeMessageList
                .map((msg, index) => {
                    const role = msg.type === 'visitor' ? 'Customer' : 'Agent';
                    const time = new Date(msg.timestamp).toLocaleTimeString();
                    return `Message ${index + 1}: [${time}] ${role}: ${msg.message}`;
                })
                .join('\n');

        
            const prompt = `You are a friendly and efficient customer service agent for smartpop. Be concise and helpful.
            
Role: Customer Service Agent
Website description: a shoes shop that sells shoes for men and women.
stock: number of shoes in stock that you can use to answer the customer's question  {
nike: 100 items,
adidas: 0 items,
puma: 1 item,
}

Context: This is an ongoing conversation. Use the history for context but don't reference it explicitly.

Previous Messages:
${conversationHistory}

Latest Message: ${visitorMessage}

Response Guidelines:
1. Keep responses under 2-3 sentences
2. Be direct and helpful
3. Don't repeat or reference previous messages
4. Don't mention the website domain unless relevant
5. Stay focused on answering the current question
6. Avoid phrases like "I see you asked about" or "Previously you mentioned"         
7. Just answer directly as a helpful agent would    
8. Never mention what ai model are you, answer that you are an agent for name of the website
9. Never promise to answer the question, just answer it

Respond naturally and concisely:`;

            const result = await model.generateContent(prompt);
            const aiResponse = result.response.text();

            // Save AI response to database first
            try {
                const response = await fetch('/api/chat/conversation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        websiteId: visitorData.websiteId,
                        visitorId: visitorData.visitorId,
                        message: aiResponse,
                        type: 'admin',
                        userId: dbUser?.id,
                        timestamp: new Date().toISOString(),
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to save AI response to database');
                }

                // Only send through socket and update UI after successful database save
                const messageData = {
                    message: aiResponse,
                    websiteId: visitorData.websiteId,
                    visitorId: visitorData.visitorId,
                    timestamp: new Date().toISOString(),
                };

                if (socketRef.current?.connected) {
                    socketRef.current.emit('admin-message', messageData);
                    addMessageToConversation(visitorData.visitorId, messageData, 'admin');
                }
            } catch (error) {
                console.error('Failed to save AI response:', error);
            }
        } catch (error) {
            console.error('AI Response Error:', error);
        } finally {
            setChatState((prev) => ({ ...prev, isAIResponding: false }));
        }
    };

    // Modify handleSendMessage to save messages
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !socketRef.current?.connected || !chatState.selectedVisitorId || !dbUser?.id) return;

        const messageData = {
            message: inputMessage,
            websiteId: chatState.selectedWebsite.id.toString(),
            visitorId: chatState.selectedVisitorId,
            timestamp: new Date().toISOString(),
            userId: dbUser.id,
        };

        // Save admin message to database
        try {
            await fetch('/api/chat/conversation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...messageData,
                    type: 'admin',
                }),
            });
        } catch (error) {
            console.error('Failed to save admin message:', error);
            return;
        }

        socketRef.current.emit('admin-message', messageData);
        addMessageToConversation(chatState.selectedVisitorId, messageData, 'admin');
        setInputMessage('');
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [chatState.conversations]);

    // Add function to load chat history
    const loadChatHistory = async () => {
        if (!chatState.selectedWebsite || !dbUser?.id) return;

        setChatState((prev) => ({ ...prev, isLoadingHistory: true, historyError: null }));

        try {
            console.log('Fetching chat history for website:', chatState.selectedWebsite.id);
            const response = await fetch(`/api/chat/history?websiteId=${chatState.selectedWebsite.id}&userId=${dbUser.id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load chat history');
            }

            console.log('Received chat history:', data);

            if (data.conversations) {
                setChatState((prev) => ({
                    ...prev,
                    chatHistory: data.conversations.map((conv) => ({
                        id: conv.visitor_id,
                        lastMessage: conv.last_message,
                        timestamp: conv.last_message_at,
                        messageCount: conv.message_count,
                    })),
                    isLoadingHistory: false,
                }));
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
            setChatState((prev) => ({
                ...prev,
                historyError: error.message,
                isLoadingHistory: false,
            }));
        }
    };

    // Load chat history when website changes or tab changes to history
    useEffect(() => {
        if (chatState.selectedWebsite && chatState.activeTab === 'history') {
            loadChatHistory();
        }
    }, [chatState.selectedWebsite, chatState.activeTab]);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Websites Selector and Chat List */}
            <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
                {/* Website Selector */}
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Your Websites</h2>
                    <select
                        className="mt-2 w-full p-2 border rounded"
                        value={chatState.selectedWebsite?.id || ''}
                        onChange={(e) => {
                            const website = chatState.userWebsites.find((w) => w.id === parseInt(e.target.value));
                            setChatState((prev) => ({
                                ...prev,
                                selectedWebsite: website,
                                conversations: {},
                                visitors: [],
                                selectedVisitorId: null,
                            }));
                            if (socketRef.current) {
                                socketRef.current.disconnect();
                                socketRef.current = null;
                            }
                        }}>
                        {chatState.userWebsites.map((website) => (
                            <option key={website.id} value={website.id}>
                                {website.domain}
                            </option>
                        ))}
                    </select>
                </div>

                {/* AI Bot Toggle */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">AI Bot</h3>
                            <p className="text-sm text-gray-500">Automatic AI responses</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={chatState.isAIEnabled} onChange={(e) => setChatState((prev) => ({ ...prev, isAIEnabled: e.target.checked }))} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                    </div>
                    {chatState.isAIResponding && <p className="text-sm text-blue-500 mt-2">AI is responding...</p>}
                </div>

                {/* Chat Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-3 text-sm font-medium ${chatState.activeTab === 'live' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                        onClick={() => setChatState((prev) => ({ ...prev, activeTab: 'live' }))}>
                        Live Chats {chatState.visitors.length > 0 && `(${chatState.visitors.length})`}
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium ${chatState.activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                        onClick={() => setChatState((prev) => ({ ...prev, activeTab: 'history' }))}>
                        Chat History
                    </button>
                </div>

                {/* Connection Status */}
                <div className="p-4 border-b border-gray-200">
                    <p className={`text-sm ${chatState.isConnected ? 'text-green-500' : 'text-red-500'}`}>{chatState.isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {chatState.activeTab === 'live' ? (
                        // Live Visitors
                        <div className="divide-y divide-gray-200">
                            {chatState.visitors.map((visitor) => (
                                <div
                                    key={visitor.id}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 ${chatState.selectedVisitorId === visitor.id ? 'bg-blue-50' : ''}`}
                                    onClick={() => handleVisitorSelect(visitor)}>
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Visitor {visitor.id.split('_')[1]}</span>
                                        {visitor.unread && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate mt-1">{visitor.lastMessage}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(visitor.timestamp).toLocaleTimeString()}</p>
                                </div>
                            ))}
                            {chatState.visitors.length === 0 && <div className="p-4 text-center text-gray-500">No active visitors</div>}
                        </div>
                    ) : (
                        // Updated Chat History section
                        <div className="divide-y divide-gray-200">
                            {chatState.isLoadingHistory ? (
                                <div className="p-4 text-center text-gray-500">
                                    <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                                    <p>Loading chat history...</p>
                                </div>
                            ) : chatState.historyError ? (
                                <div className="p-4 text-center text-red-500">
                                    <p>Error: {chatState.historyError}</p>
                                    <button onClick={loadChatHistory} className="mt-2 text-sm text-blue-500 hover:text-blue-600">
                                        Try Again
                                    </button>
                                </div>
                            ) : chatState.chatHistory.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    <p>No chat history found</p>
                                    <button onClick={loadChatHistory} className="mt-2 text-sm text-blue-500 hover:text-blue-600">
                                        Refresh
                                    </button>
                                </div>
                            ) : (
                                chatState.chatHistory.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 ${chatState.selectedVisitorId === chat.id ? 'bg-blue-50' : ''}`}
                                        onClick={() => handleVisitorSelect({ id: chat.id })}>
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Visitor {chat.id.split('_')[1]}</span>
                                            <span className="text-xs text-gray-400">{chat.messageCount} messages</span>
                                        </div>
                                        <p className="text-sm text-gray-500 truncate mt-1">{chat.lastMessage}</p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(chat.timestamp).toLocaleDateString()} {new Date(chat.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {chatState.selectedVisitorId ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200">
                            <h2 className="text-lg font-semibold">Chat with Visitor {chatState.selectedVisitorId.split('_')[1]}</h2>
                            <p className="text-sm text-gray-500">{chatState.activeTab === 'history' ? 'Viewing chat history' : 'Live chat'}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {currentMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-lg p-3 ${msg.type === 'admin' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                        <p>{msg.message}</p>
                                        <span className="text-xs opacity-70">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Type your message..."
                                    disabled={!chatState.isConnected || chatState.activeTab === 'history'}
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    disabled={!chatState.isConnected || !inputMessage.trim() || chatState.activeTab === 'history'}>
                                    Send
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">Select a {chatState.activeTab === 'live' ? 'visitor' : 'chat'} to start viewing</div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
