'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useUserContext } from '@/app/provider';

const ChatContext = createContext();

export function ChatProvider({ children }) {
    const { dbUser } = useUserContext();
    const socketRef = useRef(null);

    const [chatState, setChatState] = useState({
        conversations: {},
        visitors: [],
        selectedVisitorId: null,
        selectedWebsite: null,
        userWebsites: [],
        isConnected: false,
        activeTab: 'live',
        chatHistory: [],
        isLoadingHistory: false,
        historyError: null,
        isSoundMuted: false,
        typingIndicators: {},
        visitorStatuses: {}, // Track visitor statuses: visitorId -> 'online'|'away'|'offline'
    });

    // remove the conversation from the chatState.conversations AND visitors array
    const removeConversation = (visitorId) => {
        setChatState((prev) => {
            const updatedConversations = Object.keys(prev.conversations)
                .filter((key) => key !== visitorId)
                .reduce((obj, key) => {
                    obj[key] = prev.conversations[key];
                    return obj;
                }, {});

            // Filter out the visitor from the visitors array
            const updatedVisitors = prev.visitors.filter((visitor) => visitor.id !== visitorId);

            // Filter out the conversation from chat history if we're in history mode
            const updatedChatHistory = prev.chatHistory.filter((chat) => chat.id !== visitorId);

            return {
                ...prev,
                conversations: updatedConversations,
                visitors: updatedVisitors,
                chatHistory: updatedChatHistory,
                selectedVisitorId: prev.selectedVisitorId === visitorId ? null : prev.selectedVisitorId,
            };
        });
    };
    // Helper function to add message to conversation (IDEMPOTENT)
    const addMessageToConversation = (visitorId, message, type) => {
        console.log('Adding message to conversation:', {
            visitorId,
            messageType: type,
            messageContent: message,
        });

        setChatState((prev) => {
            const conversation = prev.conversations[visitorId] || {
                messages: [],
                lastRead: new Date(),
                pagination: { page: 1, hasMore: true },
            };

            const newMessage = {
                type,
                message: typeof message === 'string' ? message : message.message,
                timestamp: message.timestamp || new Date().toISOString(),
                browser: message.browser || '',
                country: message.country || '',
            };

            // Check if the message already exists (IDEMPOTENCY CHECK)
            const messageExists = conversation.messages.some((existingMessage) => existingMessage.timestamp === newMessage.timestamp);

            if (messageExists) {
                // If the message already exists, don't add it again.
                return prev;
            }

            // Add new message at the *END* for real-time messages
            const updatedMessages = [...conversation.messages, newMessage];

            // Sort messages by timestamp to ensure correct order
            updatedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

            const updatedConversation = {
                ...conversation,
                messages: updatedMessages, // Use sorted messages
                pagination: conversation.pagination,
            };

            return {
                ...prev,
                conversations: {
                    ...prev.conversations,
                    [visitorId]: updatedConversation,
                },
            };
        });
    };

    // Helper function to update visitor list (with geolocation data)
    const updateVisitorsList = (visitorId, lastMessage, websiteId, messageData = {}) => {
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
                                // Update visitor with any geolocation data from the message
                                country: messageData.country || v.country,
                                country_code: messageData.country_code || v.country_code,
                                visitor_ip: messageData.visitor_ip || v.visitor_ip,
                                as_name: messageData.as_name || v.as_name,
                                asn: messageData.asn || v.asn,
                                continent: messageData.continent || v.continent,
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
                          // Include geolocation data for new visitors
                          country: messageData.country,
                          country_code: messageData.country_code,
                          visitor_ip: messageData.visitor_ip,
                          as_name: messageData.as_name,
                          asn: messageData.asn,
                          continent: messageData.continent,
                      },
                  ];

            // Initialize visitor status as online when they send a message
            const updatedStatuses = {
                ...prev.visitorStatuses,
                [visitorId]: 'online'
            };

            return {
                ...prev,
                visitors: updatedVisitors,
                visitorStatuses: updatedStatuses,
            };
        });
    };

    // Function to load chat history
    const loadChatHistory = async () => {
        if (!chatState.selectedWebsite || !dbUser?.id) return;

        setChatState((prev) => ({ ...prev, isLoadingHistory: true, historyError: null }));

        try {
            const response = await fetch(`/api/chat/history?websiteId=${chatState.selectedWebsite.id}&userId=${dbUser.id}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load chat history');
            }

            if (data.conversations) {
                setChatState((prev) => ({
                    ...prev,
                    chatHistory: data.conversations.map((conv) => ({
                        id: conv.visitor_id,
                        lastMessage: conv.last_message,
                        timestamp: conv.last_message_at,
                        messageCount: conv.message_count,
                        unreadCount: conv.unread_count || 0,
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

    // Function to set active tab
    const setActiveTab = (tab) => {
        setChatState((prev) => ({ ...prev, activeTab: tab }));
    };

    // Load chat history when website changes or tab changes to history
    useEffect(() => {
        if (chatState.selectedWebsite && chatState.activeTab === 'history') {
            loadChatHistory();
        }
    }, [chatState.selectedWebsite, chatState.activeTab]);

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
            } else {
                // If no user is authenticated, the embedded widget can still work
                // The socket connection will use the websiteId from the widget script
                console.log('No authenticated user - embedded widget mode');
            }
        };
        fetchWebsites();
    }, [dbUser]);

    // Helper function to setup socket event listeners
    const setupSocketListeners = (socketInstance) => {
        // Remove any existing listeners first
        socketInstance.removeAllListeners();

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

        // Modified socket event handler for admin-receive-message (CORRECTED)
        socketInstance.on('admin-receive-message', async (data) => {
            if (data.websiteId.toString() === chatState.selectedWebsite?.id.toString()) {
                console.log('📥 Received visitor message:', data);
                console.log('🌍 Geolocation data in message:', {
                    country: data.country,
                    country_code: data.country_code,
                    visitor_ip: data.visitor_ip,
                    asn: data.asn,
                    as_name: data.as_name,
                    continent: data.continent
                });
                addMessageToConversation(data.visitorId, data, 'visitor');
                // Pass the full data object to capture geolocation information
                updateVisitorsList(data.visitorId, data.message, data.websiteId, data);

                // Show AI typing indicator ONLY when visitor sends a message, AI is enabled, and limits are available
                // Use setChatState callback to get current AI state instead of stale closure
                setChatState((currentState) => {
                    if (currentState.selectedWebsite?.isAiEnabled) {
                        // Check AI limits before showing typing indicator
                        checkAILimitsBeforeTyping(data.visitorId, currentState.selectedWebsite.id);
                    }
                    return currentState; // Return state unchanged
                });

                // Note: Conversation count increment is now handled in the database layer 
                // when the conversation is created to prevent double counting
                if (data.isNewConversation) {
                    console.log('New conversation created - count already incremented in database layer');
                }
            }
        });

        // Listen for AI/Admin responses
        socketInstance.on('visitor-receive-message', async (data) => {
            if (data.websiteId.toString() === chatState.selectedWebsite?.id.toString()) {
                console.log('Received AI/Admin response:', data);
                // Only add message if it's AI or from a different admin
                if (data.type === 'ai' || (data.type === 'admin' && data.userId && parseInt(data.userId) !== dbUser.id)) {
                    const messageType = data.type === 'admin' ? 'admin' : 'ai';

                    // If it's an AI response, just hide typing indicator
                    // (AI response count is already incremented on the server side)
                    if (messageType === 'ai') {
                        // Hide typing indicator when AI responds
                        hideTypingIndicator(data.visitorId);
                    }

                    addMessageToConversation(data.visitorId, data, messageType);
                    updateVisitorsList(data.visitorId, data.message, data.websiteId); // No isNewConversation
                }
            }
        });

        // Listen for AI state changes
        socketInstance.on('ai-state-changed', (data) => {
            console.log('Received AI state change:', data);
            if (data.websiteId === chatState.selectedWebsite?.id) {
                setChatState((prev) => {
                    const updatedState = {
                        ...prev,
                        userWebsites: prev.userWebsites.map((website) =>
                            website.id === data.websiteId
                                ? {
                                      ...website,
                                      isAiEnabled: data.isAiEnabled,
                                  }
                                : website
                        ),
                        selectedWebsite:
                            prev.selectedWebsite?.id === data.websiteId
                                ? {
                                      ...prev.selectedWebsite,
                                      isAiEnabled: data.isAiEnabled,
                                  }
                                : prev.selectedWebsite,
                    };
                    
                    // If AI is being disabled, clear all typing indicators
                    if (!data.isAiEnabled) {
                        updatedState.typingIndicators = {};
                    }
                    
                    return updatedState;
                });
            }
        });

        // Listen for visitor status changes
        socketInstance.on('visitor-status-changed', (data) => {
            console.log('🔔 Received visitor status change:', {
                visitorId: data.visitorId,
                status: data.status,
                websiteId: data.websiteId
            });
            
            if (data.websiteId === chatState.selectedWebsite?.id) {
                setChatState((prev) => {
                    let updatedVisitors = prev.visitors;
                    
                    if (data.status === 'offline') {
                        console.log(`🗑️ Removing visitor ${data.visitorId} from list (offline)`);
                        // Remove visitor from list when they go offline
                        updatedVisitors = prev.visitors.filter(v => v.id !== data.visitorId);
                    } else {
                        console.log(`📊 Updating visitor ${data.visitorId} status to: ${data.status}`);
                        // Update visitor status (online or away)
                        updatedVisitors = prev.visitors.map(v => 
                            v.id === data.visitorId 
                                ? { ...v, status: data.status }
                                : v
                        );
                    }
                    
                    const newState = {
                        ...prev,
                        visitors: updatedVisitors,
                        visitorStatuses: {
                            ...prev.visitorStatuses,
                            [data.visitorId]: data.status,
                        },
                        // Clear selected visitor if they went offline
                        selectedVisitorId: data.status === 'offline' && prev.selectedVisitorId === data.visitorId 
                            ? null 
                            : prev.selectedVisitorId,
                    };
                    
                    console.log('📝 Updated visitor statuses:', newState.visitorStatuses);
                    return newState;
                });
            }
        });

        return () => {
            socketInstance.removeAllListeners();
        };
    };

    // Socket initialization
    useEffect(() => {
        let cleanup;

        const initSocket = async () => {
            if (socketRef.current) {
                socketRef.current.removeAllListeners();
                socketRef.current.disconnect();
                socketRef.current = null;
            }

            if (chatState.selectedWebsite && dbUser?.id) {
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
                            type: 'admin',
                        },
                    });

                    cleanup = setupSocketListeners(socketInstance);
                    socketRef.current = socketInstance;
                    
                    // Set global reference for typing events (temporary solution)
                    window.globalChatSocket = socketInstance;
                } catch (error) {
                    console.error('Socket initialization failed:', error);
                }
            }
        };

        initSocket();

        return () => {
            if (cleanup) {
                cleanup();
            }
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [chatState.selectedWebsite, dbUser, chatState.selectedWebsite?.isAiEnabled]);

    // Helper function to show typing indicator for a visitor
    const showTypingIndicator = (visitorId) => {
        setChatState((prev) => ({
            ...prev,
            typingIndicators: {
                ...prev.typingIndicators,
                [visitorId]: true,
            },
        }));
    };

    // Helper function to hide typing indicator for a visitor
    const hideTypingIndicator = (visitorId) => {
        setChatState((prev) => ({
            ...prev,
            typingIndicators: {
                ...prev.typingIndicators,
                [visitorId]: false,
            },
        }));
    };

    // Function to check AI limits before showing typing indicator
    const checkAILimitsBeforeTyping = async (visitorId, websiteId) => {
        try {
            const response = await fetch('/api/public/check-ai-limits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ websiteId }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.eligible) {
                    // Only show typing indicator if AI limits are available
                    setTimeout(() => {
                        showTypingIndicator(visitorId);
                    }, 500);
                } else {
                    console.log('AI limits reached - not showing typing indicator');
                }
            } else {
                // If limits check fails, don't show typing indicator to be safe
                console.warn('AI limits check failed - not showing typing indicator');
            }
        } catch (error) {
            console.error('Error checking AI limits:', error);
            // If there's an error, don't show typing indicator to be safe
        }
    };

    // Function to send a message
    const sendMessage = async (message, visitorId) => {
        if (!message.trim() || !socketRef.current?.connected || !visitorId || !dbUser?.id) return;

        const messageData = {
            message: message,
            websiteId: parseInt(chatState.selectedWebsite.id),
            visitorId: visitorId,
            timestamp: new Date().toISOString(),
            userId: dbUser.id,
            type: 'admin',
        };

        try {
            socketRef.current.emit('admin-message', messageData);
            addMessageToConversation(visitorId, messageData, 'admin');

            // Don't show AI typing indicator when admin sends a manual message
            // AI typing indicator should only be triggered by visitor messages

            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    };

    // Function to load more messages for a conversation (CORRECTED - for initial load and pagination)
    const loadMoreMessages = async (visitorId) => {
        if (!chatState.selectedWebsite || !dbUser?.id || !visitorId) return;

        const conversation = chatState.conversations[visitorId];
        if (!conversation || !conversation.pagination?.hasMore) return;

        const nextPage = (conversation.pagination?.page || 1) + 1;

        try {
            const response = await fetch(`/api/chat/conversation?websiteId=${chatState.selectedWebsite.id}&visitorId=${visitorId}&userId=${dbUser.id}&page=${nextPage}&limit=10`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load more messages');
            }

            if (data.messages) {
                setChatState((prev) => {
                    const existingMessages = prev.conversations[visitorId]?.messages || [];
                    // Ensure messages are unique and ordered correctly
                    const newMessages = data.messages.filter((newMessage) => !existingMessages.some((existingMessage) => existingMessage.timestamp === newMessage.timestamp));

                    const updatedMessages = [...existingMessages, ...newMessages]; //Append new messages.
                    updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // sort messages by date

                    return {
                        ...prev,
                        conversations: {
                            ...prev.conversations,
                            [visitorId]: {
                                ...prev.conversations[visitorId], // keep other props
                                messages: updatedMessages,
                                pagination: {
                                    page: nextPage,
                                    hasMore: data.pagination.page < data.pagination.totalPages,
                                },
                            },
                        },
                    };
                });
            }
        } catch (error) {
            console.error('Failed to load more messages:', error);
        }
    };

    // Function to select a visitor and load their conversation
    const selectVisitor = async (visitor) => {
        setChatState((prev) => ({
            ...prev,
            selectedVisitorId: visitor.id,
            visitors: prev.visitors.map((v) => (v.id === visitor.id ? { ...v, unread: false } : v)),
            // Clear any typing indicators when switching visitors
            typingIndicators: {},
        }));

        if (chatState.selectedWebsite && (!chatState.conversations[visitor.id] || chatState.activeTab === 'history')) {
            try {
                const response = await fetch(`/api/chat/conversation?websiteId=${chatState.selectedWebsite.id}&visitorId=${visitor.id}&userId=${dbUser?.id}&page=1&limit=10`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load conversation');
                }

                if (data.messages) {
                    // Sort messages from the initial load
                    const sortedMessages = data.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                    setChatState((prev) => ({
                        ...prev,
                        conversations: {
                            ...prev.conversations,
                            [visitor.id]: {
                                messages: sortedMessages, // Use sorted messages here
                                lastRead: new Date(),
                                pagination: {
                                    page: 1,
                                    hasMore: data.pagination.page < data.pagination.totalPages,
                                },
                                // Include conversation metadata with geolocation data
                                ...data.conversation, // This includes visitor_ip, country, asn, etc.
                            },
                        },
                    }));
                }
            } catch (error) {
                console.error('Failed to load conversation:', error);
            }
        }
    };

    // Function to select a website
    const selectWebsite = (website) => {
        setChatState((prev) => ({
            ...prev,
            selectedWebsite: website,
            conversations: {},
            visitors: [],
            selectedVisitorId: null,
            // Clear any typing indicators when switching websites
            typingIndicators: {},
        }));

        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };

    // Function to toggle AI
    const toggleAI = async (websiteId, currentState) => {
        try {
            const response = await fetch('/api/websites/toggle-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    websiteId,
                    isAiEnabled: !currentState,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to toggle AI');
            }

            const data = await response.json();

            if (data.success && data.website) {
                // Update state first
                setChatState((prev) => ({
                    ...prev,
                    userWebsites: prev.userWebsites.map((website) =>
                        website.id === websiteId
                            ? {
                                  ...website,
                                  isAiEnabled: data.website.isAiEnabled,
                              }
                            : website
                    ),
                    selectedWebsite:
                        prev.selectedWebsite?.id === websiteId
                            ? {
                                  ...prev.selectedWebsite,
                                  isAiEnabled: data.website.isAiEnabled,
                              }
                            : prev.selectedWebsite,
                }));

                // Emit AI state update
                if (socketRef.current) {
                    socketRef.current.emit('update-ai-state', {
                        websiteId,
                        isAiEnabled: data.website.isAiEnabled,
                    });
                }

                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to toggle AI:', error);
            return false;
        }
    };

    const toggleSound = () => {
        setChatState((prev) => ({ ...prev, isSoundMuted: !prev.isSoundMuted }));
    };

    // Function to mark messages as read
    const markMessagesAsRead = async (visitorId) => {
        if (!chatState.selectedWebsite || !dbUser?.id || !visitorId) return false;

        try {
            const response = await fetch('/api/chat/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    websiteId: chatState.selectedWebsite.id,
                    visitorId,
                    userId: dbUser.id,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark messages as read');
            }

            // Update the chat history to reflect the read status
            setChatState((prev) => ({
                ...prev,
                chatHistory: prev.chatHistory.map((chat) =>
                    chat.id === visitorId ? { ...chat, unreadCount: 0 } : chat
                ),
            }));

            return true;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            return false;
        }
    };

    // Function to cleanup sockets on logout
    const logout = () => {
        if (socketRef.current) {
            console.log('Disconnecting admin socket on logout');
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        // Clear all chat state
        setChatState((prev) => ({
            ...prev,
            conversations: {},
            visitors: [],
            selectedVisitorId: null,
            typingIndicators: {},
            isConnected: false,
        }));
    };

    return (
        <ChatContext.Provider
            value={{
                chatState,
                sendMessage,
                selectVisitor,
                selectWebsite,
                toggleAI,
                loadChatHistory,
                setActiveTab,
                loadMoreMessages,
                toggleSound,
                removeConversation,
                logout,
                markMessagesAsRead,
            }}>
            {children}
        </ChatContext.Provider>
    );
}

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};
