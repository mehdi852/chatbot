'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useChatContext } from '@/app/contexts/ChatContext';
import { MessageCircle, Users, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from '@/app/provider';
import UsageLimits from '@/app/components/UsageLimits';

// CSS for typing animation
const typingAnimationStyle = `
@keyframes typingAnimation {
    0% {
        opacity: 0.4;
        transform: scale(0.8);
    }
    50% {
        opacity: 1;
        transform: scale(1.2);
    }
    100% {
        opacity: 0.4;
        transform: scale(0.8);
    }
}
`;

const ChatPage = () => {
    const { chatState, sendMessage, selectVisitor, removeConversation, selectWebsite, toggleAI, loadChatHistory, setActiveTab, loadMoreMessages } = useChatContext();
    const [inputMessage, setInputMessage] = useState('');
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [subscriptionLimits, setSubscriptionLimits] = useState(null);
    const [usage, setUsage] = useState(null);
    // Get the user from the provider
    const { dbUser } = useUserContext();
    const messagesEndRef = useRef(null);
    const { toast } = useToast();
    const messagesContainerRef = useRef(null);
    
    // Typing indicator state
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    // Get current conversation messages and pagination info
    const currentConversation = chatState.selectedVisitorId ? chatState.conversations[chatState.selectedVisitorId] : null;
    const currentMessages = currentConversation?.messages || [];
    const hasMoreMessages = currentConversation?.pagination?.hasMore || false;

    // Check if typing indicator should be shown for the selected visitor
    const isTypingIndicatorVisible = chatState.selectedVisitorId && chatState.typingIndicators[chatState.selectedVisitorId];

    // Debug logging
    useEffect(() => {
        console.log('Chat state updated:', {
            isConnected: chatState.isConnected,
            selectedWebsite: chatState.selectedWebsite?.domain,
            visitorCount: chatState.visitors.length,
            visitors: chatState.visitors,
            visitorStatuses: chatState.visitorStatuses,
        });
    }, [chatState]);
    
    // Debug visitor statuses specifically
    useEffect(() => {
        console.log('🎯 Current visitor statuses:', chatState.visitorStatuses);
    }, [chatState.visitorStatuses]);

    // get subscription limits
    const fetchSubscriptionLimits = async () => {
        // get susbscription limits
        const response = await fetch(`/api/user/get-subscription-limits?userId=${dbUser.id}`);
        const usageResponse = await fetch(`/api/user/get_user_usage?userId=${dbUser.id}`);
        const data = await response.json();
        const usageData = await usageResponse.json();
        console.log(data);
        console.log(usageData);
        setSubscriptionLimits(data);
        setUsage(usageData);
    };

    useEffect(() => {
        if (dbUser) {
            fetchSubscriptionLimits();
        }
    }, [dbUser]);

    // Refresh usage counter when visitors list changes or when AI responses are received
    useEffect(() => {
        if (dbUser) {
            fetchSubscriptionLimits();
        }
    }, [chatState.visitors.length, chatState.conversations]);

    // DELETE request to remove conversation
    const deleteConversation = async (visitorId) => {
        try {
            const response = await fetch(`/api/user/remove-conversation?visitorId=${visitorId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                console.log('Conversation deleted successfully');
                // remove the conversation from the chatState.conversations
                removeConversation(visitorId);
                toast({
                    title: 'Conversation deleted successfully',
                    description: 'The conversation has been deleted successfully',
                    variant: 'success',
                });

                // remove the conversation from the chatState.conversations
                removeConversation(visitorId);
            } else {
                console.error('Failed to delete conversation');
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const scrollToBottom = () => {
        if (!messagesEndRef.current) return;
        const container = messagesContainerRef.current;
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;

        if (isAtBottom) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Function to emit typing events to visitors
    const emitTyping = () => {
        // We need to access the socket through the context's internal socketRef
        // For now, we'll create a temporary solution using a global socket reference
        if (window.globalChatSocket && chatState.selectedVisitorId && chatState.isConnected) {
            window.globalChatSocket.emit('admin-typing', {
                websiteId: chatState.selectedWebsite.id,
                visitorId: chatState.selectedVisitorId
            });
        }
    };

    const emitStopTyping = () => {
        if (window.globalChatSocket && chatState.selectedVisitorId && chatState.isConnected) {
            window.globalChatSocket.emit('admin-stop-typing', {
                websiteId: chatState.selectedWebsite.id,
                visitorId: chatState.selectedVisitorId
            });
        }
    };

    // Handle input change with typing detection
    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputMessage(value);

        // Only emit typing events for live chats
        if (chatState.activeTab === 'live' && chatState.selectedVisitorId) {
            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // If user is typing and wasn't typing before
            if (value.trim() && !isTyping) {
                setIsTyping(true);
                emitTyping();
            }

            // If user stops typing or clears input
            if (!value.trim()) {
                setIsTyping(false);
                emitStopTyping();
            } else {
                // Set timeout to stop typing if no input for 2 seconds
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                    emitStopTyping();
                }, 2000);
            }
        }
    };

    // Modify handleSendMessage to use context
    const handleSendMessage = async (e) => {
        e.preventDefault();
        
        // Stop typing indicator when sending message
        if (isTyping) {
            setIsTyping(false);
            emitStopTyping();
        }
        
        // Clear typing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        if (await sendMessage(inputMessage, chatState.selectedVisitorId)) {
            setInputMessage('');
            // Force scroll to bottom on send
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [chatState.conversations]);

    // Handle loading more messages
    const handleLoadMore = async () => {
        if (!chatState.selectedVisitorId || isLoadingMore) return;

        // Store current scroll position
        const container = messagesContainerRef.current;
        const scrollHeight = container.scrollHeight;

        setIsLoadingMore(true);
        await loadMoreMessages(chatState.selectedVisitorId);
        setIsLoadingMore(false);

        // Restore scroll position
        requestAnimationFrame(() => {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - scrollHeight;
        });
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50">
            {/* Inject typing animation CSS */}
            <style dangerouslySetInnerHTML={{ __html: typingAnimationStyle }} />

            {/* Sidebar - Websites and Chats */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-md">
                {/* Subscription Limits */}
                <UsageLimits usage={usage} subscriptionLimits={subscriptionLimits} liveWebsites={chatState.userWebsites.length} />

                {/* Website Selector with AI Toggle */}
                <div className="border-b border-gray-200 bg-gray-50/50">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-800">Your Websites</h2>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{chatState.userWebsites.length} sites</span>
                    </div>
                    <div className="px-3 pb-3">
                        {chatState.userWebsites.map((website) => (
                            <div
                                key={website.id}
                                className={`group relative rounded-lg transition-all duration-200 ${
                                    chatState.selectedWebsite?.id === website.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white hover:bg-gray-50'
                                } border mb-1.5 last:mb-0`}>
                                <div className="flex items-center px-3 py-2">
                                    <button
                                        className={`text-left flex-1 font-medium ${chatState.selectedWebsite?.id === website.id ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'}`}
                                        onClick={() => selectWebsite(website)}>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${website.isAiEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                                            <span className="text-sm truncate">{website.domain}</span>
                                        </div>
                                    </button>
                                    <div className="flex items-center pl-2">
                                        <div className="flex items-center space-x-1 border-l border-gray-200 pl-2">
                                            <span className="text-xs text-gray-500 font-medium">AI</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={website.isAiEnabled} onChange={() => toggleAI(website.id, website.isAiEnabled)} />
                                                <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {chatState.selectedWebsite?.id === website.id && (
                                    <div className="text-xs text-gray-600 bg-blue-50/80 px-3 py-1.5 rounded-b-md border-t border-blue-100">
                                        <span className="font-medium">Status:</span> {website.isAiEnabled ? 'AI Auto-responding enabled' : 'Manual mode'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Connection Status & Tabs */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-4">
                        <div className="flex items-center justify-between h-12">
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${chatState.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                <span className="text-xs font-medium text-gray-600">{chatState.isConnected ? 'Connected' : 'Disconnected'}</span>
                            </div>
                        </div>
                        <div className="flex w-full border-b border-gray-200">
                            <button
                                className={`flex-1 relative flex items-center justify-center h-12 text-sm font-medium transition-colors duration-200 ${
                                    chatState.activeTab === 'live' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                }`}
                                onClick={() => setActiveTab('live')}>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${chatState.visitors.length > 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <span>Live Chats</span>
                                    {chatState.visitors.length > 0 && (
                                        <span className="ml-1.5 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">{chatState.visitors.length}</span>
                                    )}
                                </div>
                                {/* Active Tab Indicator */}
                                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${chatState.activeTab === 'live' ? 'bg-blue-600' : 'bg-transparent'}`} />
                            </button>
                            <button
                                className={`flex-1 relative flex items-center justify-center h-12 text-sm font-medium transition-colors duration-200 ${
                                    chatState.activeTab === 'history' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                                }`}
                                onClick={() => setActiveTab('history')}>
                                <div className="flex items-center space-x-2">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>History</span>
                                </div>
                                {/* Active Tab Indicator */}
                                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${chatState.activeTab === 'history' ? 'bg-blue-600' : 'bg-transparent'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {chatState.activeTab === 'live' ? (
                        <div className="divide-y divide-gray-100">
                            {chatState.visitors.map((visitor) => (
                                <div
                                    key={visitor.id}
                                    className={`group cursor-pointer transition-all duration-200 hover:bg-gray-50 relative ${
                                        chatState.selectedVisitorId === visitor.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                                    }`}
                                    onClick={() => selectVisitor(visitor)}>
                                    <div className="px-4 py-3 flex items-center space-x-3">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center border border-blue-200 shadow-sm">
                                                <span className="text-blue-700 text-sm font-semibold">V{visitor.id.split('_')[1].slice(0, 2)}</span>
                                            </div>
                                            <div
                                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                                    chatState.visitorStatuses[visitor.id] === 'online' 
                                                        ? 'bg-green-500' 
                                                        : chatState.visitorStatuses[visitor.id] === 'away' 
                                                            ? 'bg-orange-500' 
                                                            : 'bg-gray-400'
                                                } shadow-sm`}
                                            />
                                        </div>

                                        {/* Message details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-sm font-medium text-gray-900">Visitor {visitor.id.split('_')[1]}</h3>
                                                    {visitor.unread && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">New</span>}
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {new Date(visitor.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 truncate mt-0.5">{visitor.lastMessage}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {visitor.browser && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-50 text-gray-500 border border-gray-100">{visitor.browser}</span>
                                                )}
                                                {visitor.country && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-50 text-gray-500 border border-gray-100">{visitor.country}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete button */}
                                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteConversation(visitor.id);
                                                }}
                                                className="p-1.5 hover:bg-red-50 rounded-full transition-colors duration-200 group/delete">
                                                <Trash className="w-4 h-4 text-gray-400 group-hover/delete:text-red-500 transition-colors duration-200" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {chatState.visitors.length === 0 && (
                                <div className="p-8 text-center">
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
                                        <div className="text-gray-400 mb-3">
                                            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        </div>
                                        <p className="text-sm text-gray-700 font-medium">No active visitors</p>
                                        <p className="text-xs text-gray-500 mt-1">Visitors will appear here when they start chatting</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {chatState.isLoadingHistory ? (
                                <div className="p-8 text-center">
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
                                        <div className="animate-spin inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mb-3"></div>
                                        <p className="text-sm text-gray-700 font-medium">Loading chat history...</p>
                                    </div>
                                </div>
                            ) : chatState.historyError ? (
                                <div className="p-8 text-center">
                                    <div className="bg-red-50 rounded-xl p-6 border border-red-100 shadow-sm">
                                        <p className="text-sm font-medium text-red-600">Error: {chatState.historyError}</p>
                                        <button
                                            onClick={loadChatHistory}
                                            className="mt-3 px-4 py-1.5 text-xs bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded-md font-medium shadow-sm">
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            ) : chatState.chatHistory.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
                                        <p className="text-sm text-gray-700 font-medium">No chat history found</p>
                                        <button
                                            onClick={loadChatHistory}
                                            className="mt-3 px-4 py-1.5 text-xs bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-md font-medium shadow-sm">
                                            Refresh History
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                chatState.chatHistory.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`group cursor-pointer transition-all duration-200 hover:bg-gray-50 relative ${
                                            chatState.selectedVisitorId === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
                                        }`}
                                        onClick={() => selectVisitor({ id: chat.id })}>
                                        <div className="px-4 py-3 flex items-center space-x-3">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0">
                                                <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                                                    <span className="text-gray-700 text-sm font-medium">V{chat.id.split('_')[1].slice(0, 2)}</span>
                                                </div>
                                            </div>

                                            {/* History details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <h3 className="text-sm font-medium text-gray-900">Visitor {chat.id.split('_')[1]}</h3>
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600 border border-blue-100">
                                                            {chat.messageCount} msgs
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-600 truncate mt-0.5">{chat.lastMessage}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(chat.timestamp).toLocaleDateString()} •{' '}
                                                    {new Date(chat.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>

                                            {/* Delete button */}
                                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteConversation(chat.id);
                                                    }}
                                                    className="p-1.5 hover:bg-red-50 rounded-full transition-colors duration-200 group/delete">
                                                    <Trash className="w-4 h-4 text-gray-400 group-hover/delete:text-red-500 transition-colors duration-200" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {chatState.selectedVisitorId ? (
                    <>
                        <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Visitor {chatState.selectedVisitorId.split('_')[1]}</h2>
                                    <p className="text-sm text-gray-500">{chatState.activeTab === 'history' ? 'Viewing chat history' : 'Live chat session'}</p>
                                </div>
                                {chatState.activeTab === 'live' && (
                                    <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                        <span className={`w-2 h-2 rounded-full ${chatState.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                        <span className="text-sm text-gray-600 font-medium">{chatState.isConnected ? 'Connected' : 'Disconnected'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 chat-scrollbar bg-gradient-to-b from-gray-50/50 to-white">
                            {/* Load More Button */}
                            {hasMoreMessages && (
                                <div className="flex justify-center mb-4">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                        className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all duration-200 ${
                                            isLoadingMore ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
                                        }`}>
                                        {isLoadingMore ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading...
                                            </span>
                                        ) : (
                                            'Load More Messages'
                                        )}
                                    </button>
                                </div>
                            )}
                            <div className="space-y-6">
                                {currentMessages.map((msg, idx) => (
                                    <div key={`${msg.timestamp}-${idx}`} className={`flex items-end space-x-2 ${msg.type === 'visitor' ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                                        {/* Avatar for visitor messages */}
                                        {msg.type === 'visitor' && (
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200 shadow-sm animate-slide-in">
                                                <span className="text-gray-600 text-xs font-medium">V</span>
                                            </div>
                                        )}

                                        <div className={`group relative max-w-[70%] ${msg.type === 'visitor' ? 'ml-2' : 'mr-2'}`}>
                                            {/* Timestamp tooltip */}
                                            <div className={`absolute ${msg.type === 'visitor' ? '-left-2' : '-right-2'} -top-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full shadow-sm border">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div
                                                className={`message-bubble ${
                                                    msg.type === 'visitor' ? 'message-bubble-visitor' : msg.type === 'ai' ? 'message-bubble-ai' : 'message-bubble-admin'
                                                } relative rounded-2xl px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg ${
                                                    msg.type === 'visitor'
                                                        ? 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'
                                                        : msg.type === 'ai'
                                                        ? 'bg-blue-50 border border-blue-100 text-blue-800 rounded-br-none'
                                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none'
                                                }`}>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>

                                                <div className="mt-1 flex items-center space-x-2 opacity-75">
                                                    <span className={`text-xs font-medium ${msg.type === 'visitor' ? 'text-gray-500' : msg.type === 'ai' ? 'text-blue-600' : 'text-blue-50'}`}>
                                                        {msg.type === 'ai' ? 'AI Assistant' : msg.type === 'admin' ? 'Admin' : 'Visitor'}
                                                    </span>
                                                </div>

                                                {(msg.browser || msg.country) && (
                                                    <div className="mt-1 flex items-center flex-wrap gap-2">
                                                        {msg.type !== 'admin' && msg.browser && (
                                                            <span
                                                                className={`text-xs px-2 py-0.5 rounded-full ${
                                                                    msg.type === 'visitor' ? 'bg-gray-50 text-gray-500 border border-gray-100' : 'bg-blue-100/50 text-blue-600 border border-blue-200'
                                                                }`}>
                                                                {msg.browser}
                                                            </span>
                                                        )}
                                                        {msg.country && (
                                                            <span
                                                                className={`text-xs px-2 py-0.5 rounded-full ${
                                                                    msg.type === 'visitor' ? 'bg-gray-50 text-gray-500 border border-gray-100' : 'bg-blue-100/50 text-blue-600 border border-blue-200'
                                                                }`}>
                                                                {msg.country}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Avatar for admin/AI messages */}
                                        {msg.type !== 'visitor' && (
                                            <div
                                                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm animate-slide-in ${
                                                    msg.type === 'ai' ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200' : 'bg-gradient-to-br from-blue-600 to-blue-700 border-blue-700'
                                                }`}>
                                                <span className={`text-xs font-medium ${msg.type === 'ai' ? 'text-blue-700' : 'text-white'}`}>{msg.type === 'ai' ? 'AI' : 'A'}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* AI Typing Indicator */}
                                {isTypingIndicatorVisible && (
                                    <div className="flex items-end space-x-2 justify-start animate-fade-in">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-200 shadow-sm animate-slide-in">
                                            <span className="text-blue-700 text-xs font-medium">AI</span>
                                        </div>
                                        <div className="group relative max-w-[70%] ml-2">
                                            <div className="message-bubble message-bubble-ai relative rounded-2xl px-4 py-3 shadow-md bg-blue-50 border border-blue-100 text-blue-800 rounded-br-none">
                                                <div className="typing-indicator flex items-center space-x-1.5 h-6">
                                                    <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full opacity-60" style={{ animation: 'typingAnimation 1s infinite 0.2s' }}></span>
                                                    <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full opacity-60" style={{ animation: 'typingAnimation 1s infinite 0.4s' }}></span>
                                                    <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-full opacity-60" style={{ animation: 'typingAnimation 1s infinite 0.6s' }}></span>
                                                </div>
                                                <div className="mt-1 flex items-center space-x-2 opacity-75">
                                                    <span className="text-xs font-medium text-blue-600">AI Assistant is typing...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-6 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="relative">
                                <div className="relative rounded-xl shadow-sm">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={handleInputChange}
                                        className={`chat-input w-full border-2 rounded-xl pl-4 pr-28 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                                            !chatState.isConnected || chatState.activeTab === 'history' ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-white border-gray-200 hover:border-gray-300'
                                        }`}
                                        placeholder={!chatState.isConnected ? 'Disconnected...' : chatState.activeTab === 'history' ? 'Cannot send messages in history view' : 'Type your message...'}
                                        disabled={!chatState.isConnected || chatState.activeTab === 'history'}
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <button
                                            type="submit"
                                            className={`px-4 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                                                !chatState.isConnected || !inputMessage.trim() || chatState.activeTab === 'history'
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:transform active:scale-95'
                                            }`}
                                            disabled={!chatState.isConnected || !inputMessage.trim() || chatState.activeTab === 'history'}>
                                            Send
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-gray-50/50 to-white">
                        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 max-w-md">
                            <div className="text-blue-500 mb-4">
                                <MessageCircle className="w-16 h-16 mx-auto opacity-80" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Enterprise Chat</h3>
                            <p className="text-gray-600 mb-6">Select a {chatState.activeTab === 'live' ? 'visitor' : 'chat history'} from the sidebar to start viewing the conversation</p>
                            <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p>Your AI assistant is {chatState.selectedWebsite?.isAiEnabled ? 'enabled' : 'disabled'} for the selected website</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
