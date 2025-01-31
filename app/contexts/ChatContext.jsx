'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useUserContext } from '@/app/provider';

const ChatContext = createContext();

export function ChatProvider({ children }) {
    const { dbUser } = useUserContext();
    const socketRef = useRef(null);

    // Unified chat state to prevent inconsistencies
    const [chatState, setChatState] = useState({
        conversations: {}, // Format: { visitorId: { messages: [], lastRead: timestamp } }
        visitors: [],
        selectedVisitorId: null,
        selectedWebsite: null,
        userWebsites: [],
        isConnected: false,
        activeTab: 'live',
        chatHistory: [],
        isLoadingHistory: false,
        historyError: null,
    });

    // Helper function to add message to conversation
    const addMessageToConversation = (visitorId, message, type) => {
        console.log('Adding message to conversation:', {
            visitorId,
            messageType: type,
            messageContent: message,
        });

        setChatState((prev) => {
            const conversation = prev.conversations[visitorId] || { messages: [], lastRead: new Date() };

            const newMessage = {
                type,
                message: typeof message === 'string' ? message : message.message,
                timestamp: message.timestamp || new Date().toISOString(),
            };

            const updatedConversation = {
                ...conversation,
                messages: [...conversation.messages, newMessage],
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

        // Modified socket event handler for admin-receive-message
        socketInstance.on('admin-receive-message', async (data) => {
            if (data.websiteId.toString() === chatState.selectedWebsite?.id.toString()) {
                console.log('Received visitor message:', data);
                addMessageToConversation(data.visitorId, data, 'visitor');
                updateVisitorsList(data.visitorId, data.message, data.websiteId);
            }
        });

        // Listen for AI/Admin responses
        socketInstance.on('visitor-receive-message', async (data) => {
            if (data.websiteId.toString() === chatState.selectedWebsite?.id.toString()) {
                console.log('Received AI/Admin response:', data);
                // Only add message if it's AI or from a different admin
                if (data.type === 'ai' || (data.type === 'admin' && data.userId && parseInt(data.userId) !== dbUser.id)) {
                    const messageType = data.type === 'admin' ? 'admin' : 'ai';
                    addMessageToConversation(data.visitorId, data, messageType);
                    updateVisitorsList(data.visitorId, data.message, data.websiteId);
                }
            }
        });

        // Listen for AI state changes
        socketInstance.on('ai-state-changed', (data) => {
            console.log('Received AI state change:', data);
            if (data.websiteId === chatState.selectedWebsite?.id) {
                setChatState((prev) => ({
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
                }));
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
            return true;
        } catch (error) {
            console.error('Failed to send message:', error);
            return false;
        }
    };

    // Function to select a visitor and load their conversation
    const selectVisitor = async (visitor) => {
        setChatState((prev) => ({
            ...prev,
            selectedVisitorId: visitor.id,
            visitors: prev.visitors.map((v) => (v.id === visitor.id ? { ...v, unread: false } : v)),
        }));

        // Only load conversation if we don't have it already or if it's from history tab
        if (chatState.selectedWebsite && (!chatState.conversations[visitor.id] || chatState.activeTab === 'history')) {
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
