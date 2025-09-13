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
    const { chatState, sendMessage, selectVisitor, removeConversation, selectWebsite, toggleAI, loadChatHistory, setActiveTab, loadMoreMessages, markMessagesAsRead } = useChatContext();
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
        console.log('🌍 Current visitors with country data:', chatState.visitors.map(v => ({id: v.id, country: v.country, country_code: v.country_code})));
        console.log('💬 Current conversation data:', currentConversation ? {id: chatState.selectedVisitorId, country: currentConversation.country, country_code: currentConversation.country_code} : null);
    }, [chatState.visitorStatuses, chatState.visitors, currentConversation]);

    // get subscription limits
    const fetchSubscriptionLimits = async () => {
        try {
            // get subscription limits
            const response = await fetch(`/api/user/get-subscription-limits?userId=${dbUser.id}`);
            const usageResponse = await fetch(`/api/user/get_user_usage?userId=${dbUser.id}`);
            
            // Check if responses are ok
            if (!response.ok) {
                console.error('Failed to fetch subscription limits:', response.status, response.statusText);
                return;
            }
            
            if (!usageResponse.ok) {
                console.error('Failed to fetch user usage:', usageResponse.status, usageResponse.statusText);
                return;
            }
            
            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Subscription limits response is not JSON:', await response.text());
                return;
            }
            
            const usageContentType = usageResponse.headers.get('content-type');
            if (!usageContentType || !usageContentType.includes('application/json')) {
                console.error('Usage response is not JSON:', await usageResponse.text());
                return;
            }
            
            const data = await response.json();
            const usageData = await usageResponse.json();
            
            console.log('Subscription limits:', data);
            console.log('Usage data:', usageData);
            
            setSubscriptionLimits(data);
            setUsage(usageData);
        } catch (error) {
            console.error('Error fetching subscription limits and usage:', error);
            // Set default values to prevent crashes
            setSubscriptionLimits(null);
            setUsage(null);
        }
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
    
    // Listen for message events to update usage stats in real-time
    useEffect(() => {
        if (!dbUser) return;
        
        // Refresh usage stats when new AI responses or conversations are detected
        const hasNewAIResponses = Object.values(chatState.conversations).some(
            conversation => conversation.messages.some(msg => msg.type === 'ai')
        );
        
        if (hasNewAIResponses || chatState.visitors.length > 0) {
            // Debounce the stats refresh to avoid too frequent API calls
            const timeoutId = setTimeout(() => {
                fetchSubscriptionLimits();
            }, 2000);
            
            return () => clearTimeout(timeoutId);
        }
    }, [chatState.conversations, chatState.visitors.length, dbUser]);

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
<div className="flex h-[calc(100vh-64px)] bg-background">
            {/* Inject typing animation CSS */}
            <style dangerouslySetInnerHTML={{ __html: typingAnimationStyle }} />

            {/* Mobile Overlay */}
            {chatState.selectedVisitorId && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => selectVisitor(null)}
                />
            )}

            {/* Sidebar - Websites and Chats */}
            <div className={`w-80 lg:w-80 bg-card border-r border-border flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
                chatState.selectedVisitorId ? 'lg:translate-x-0 -translate-x-full' : 'translate-x-0'
            } lg:relative absolute inset-y-0 left-0`}>
                {/* Enhanced Subscription Limits - Now Professional Modal */}
                <UsageLimits usage={usage} subscriptionLimits={subscriptionLimits} liveWebsites={chatState.userWebsites.length} />

                {/* Website Selector with AI Toggle */}
                <div className="border-b border-border bg-muted/30">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-foreground">Your Websites</h2>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{chatState.userWebsites.length} sites</span>
                    </div>
                    <div className="px-3 pb-3">
                        {chatState.userWebsites.map((website) => (
                            <div
                                key={website.id}
                                className={`group relative rounded-lg transition-all duration-200 ${
                                    chatState.selectedWebsite?.id === website.id ? 'bg-primary/10 border-primary/20 shadow-sm' : 'bg-card hover:bg-accent'
                                } border border-border mb-1.5 last:mb-0`}>
                                <div className="flex items-center px-3 py-2">
                                    <button
                                        className={`text-left flex-1 font-medium ${chatState.selectedWebsite?.id === website.id ? 'text-primary' : 'text-foreground group-hover:text-foreground'}`}
                                        onClick={() => selectWebsite(website)}>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${website.isAiEnabled ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                                            <span className="text-sm truncate">{website.domain}</span>
                                        </div>
                                    </button>
                                    <div className="flex items-center pl-2">
                                        <div className="flex items-center space-x-1 border-l border-border pl-2">
                                            <span className="text-xs text-muted-foreground font-medium">AI</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={website.isAiEnabled} onChange={() => toggleAI(website.id, website.isAiEnabled)} />
                                                <div className="w-7 h-4 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-background after:border-border after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {chatState.selectedWebsite?.id === website.id && (
                                    <div className="text-xs text-muted-foreground bg-primary/5 px-3 py-1.5 rounded-b-md border-t border-primary/10">
                                        <span className="font-medium">Status:</span> {website.isAiEnabled ? 'AI Auto-responding enabled' : 'Manual mode'}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Connection Status & Tabs */}
                <div className="bg-card border-b border-border">
                    <div className="px-4">
                        <div className="flex items-center justify-between h-12">
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${chatState.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                <span className="text-xs font-medium text-muted-foreground">{chatState.isConnected ? 'Connected' : 'Disconnected'}</span>
                            </div>
                        </div>
                        <div className="flex w-full border-b border-border/50">
                            <button
                                className={`flex-1 relative flex items-center justify-center h-12 text-sm font-medium transition-colors duration-200 ${
                                    chatState.activeTab === 'live' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => setActiveTab('live')}>
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${chatState.visitors.length > 0 ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                                    <span>Live Chats</span>
                                    {chatState.visitors.length > 0 && (
                                        <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">{chatState.visitors.length}</span>
                                    )}
                                </div>
                                {/* Active Tab Indicator */}
                                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${chatState.activeTab === 'live' ? 'bg-primary' : 'bg-transparent'}`} />
                            </button>
                            <button
                                className={`flex-1 relative flex items-center justify-center h-12 text-sm font-medium transition-colors duration-200 ${
                                    chatState.activeTab === 'history' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                                onClick={() => setActiveTab('history')}>
                                <div className="flex items-center space-x-2">
                                    <MessageCircle className="w-4 h-4" />
                                    <span>History</span>
                                    {/* Total unread count badge */}
                                    {(() => {
                                        const totalUnread = chatState.chatHistory.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
                                        return totalUnread > 0 && (
                                            <span className="ml-1.5 text-xs bg-red-500/10 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                                                {totalUnread > 99 ? '99+' : totalUnread}
                                            </span>
                                        );
                                    })()}
                                </div>
                                {/* Active Tab Indicator */}
                                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${chatState.activeTab === 'history' ? 'bg-primary' : 'bg-transparent'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {chatState.activeTab === 'live' ? (
                        <div className="divide-y divide-border">
                            {chatState.visitors.map((visitor) => (
                                <div
                                    key={visitor.id}
                                    className={`group cursor-pointer transition-all duration-200 hover:bg-accent relative ${
                                        chatState.selectedVisitorId === visitor.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                                    }`}
                                    onClick={() => selectVisitor(visitor)}>
                                    <div className="px-4 py-3 flex items-center space-x-3">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                                                <span className="text-primary text-sm font-semibold">V{visitor.id.split('_')[1].slice(0, 2)}</span>
                                            </div>
                                            
                                            {/* Country Flag - Test with Spain first, then check for real data */}
                                            {(visitor.country_code || true) && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full overflow-hidden border-2 border-background shadow-sm bg-background">
                                                    <img 
                                                        src={`https://flagsapi.com/${visitor.country_code || 'ES'}/flat/32.png`}
                                                        alt={`${visitor.country || 'Spain'} flag`}
                                                        className="w-full h-full object-cover"
                                                        onLoad={() => console.log(`Flag loaded for visitor ${visitor.id}: ${visitor.country_code || 'ES (test)'}`)}
                                                        onError={(e) => {
                                                            console.log(`Flag failed to load for visitor ${visitor.id}: ${visitor.country_code || 'ES (test)'}`);
                                                            console.log('Full visitor data:', visitor);
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            
                                            {/* Status Indicator */}
                                            <div
                                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${
                                                    chatState.visitorStatuses[visitor.id] === 'online' 
                                                        ? 'bg-green-500' 
                                                        : chatState.visitorStatuses[visitor.id] === 'away' 
                                                            ? 'bg-orange-500' 
                                                            : 'bg-muted-foreground'
                                                } shadow-sm`}
                                            />
                                        </div>

                                        {/* Message details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-sm font-medium text-foreground">Visitor {visitor.id.split('_')[1]}</h3>
                                                    {visitor.unread && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">New</span>}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(visitor.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">{visitor.lastMessage}</p>
                                            <div className="flex items-center space-x-1.5 mt-1.5">
                                                {visitor.browser && (
                                                    <div className="flex items-center space-x-1 bg-muted px-1.5 py-0.5 rounded-md border border-border">
                                                        <span className="text-xs font-medium text-muted-foreground">💻</span>
                                                        <span className="text-xs text-muted-foreground">{visitor.browser}</span>
                                                    </div>
                                                )}
                                                {visitor.isNewVisitor && (
                                                    <div className="flex items-center space-x-1 bg-green-500/10 px-1.5 py-0.5 rounded-md border border-green-500/20">
                                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">✨</span>
                                                        <span className="text-xs font-medium text-green-600 dark:text-green-400">New</span>
                                                    </div>
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
                                                className="p-1.5 hover:bg-red-500/10 rounded-full transition-colors duration-200 group/delete">
                                                <Trash className="w-4 h-4 text-muted-foreground group-hover/delete:text-red-500 transition-colors duration-200" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {chatState.visitors.length === 0 && (
                                <div className="p-8 text-center">
                                    <div className="bg-muted rounded-xl p-6 border border-border shadow-sm">
                                        <div className="text-muted-foreground mb-3">
                                            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        </div>
                                        <p className="text-sm text-foreground font-medium">No active visitors</p>
                                        <p className="text-xs text-muted-foreground mt-1">Visitors will appear here when they start chatting</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {chatState.isLoadingHistory ? (
                                <div className="p-8 text-center">
                                    <div className="bg-muted rounded-xl p-6 border border-border shadow-sm">
                                        <div className="animate-spin inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-3"></div>
                                        <p className="text-sm text-foreground font-medium">Loading chat history...</p>
                                    </div>
                                </div>
                            ) : chatState.historyError ? (
                                <div className="p-8 text-center">
                                    <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/20 shadow-sm">
                                        <p className="text-sm font-medium text-red-600 dark:text-red-400">Error: {chatState.historyError}</p>
                                        <button
                                            onClick={loadChatHistory}
                                            className="mt-3 px-4 py-1.5 text-xs bg-background text-red-600 hover:bg-red-500/10 border border-red-500/20 rounded-md font-medium shadow-sm">
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            ) : chatState.chatHistory.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="bg-muted rounded-xl p-6 border border-border shadow-sm">
                                        <p className="text-sm text-foreground font-medium">No chat history found</p>
                                        <button
                                            onClick={loadChatHistory}
                                            className="mt-3 px-4 py-1.5 text-xs bg-background text-primary hover:bg-primary/10 border border-primary/20 rounded-md font-medium shadow-sm">
                                            Refresh History
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                chatState.chatHistory.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`group cursor-pointer transition-all duration-200 hover:bg-accent relative ${
                                            chatState.selectedVisitorId === chat.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                                        }`}
                                        onClick={async () => {
                                            await selectVisitor({ id: chat.id });
                                            // Mark messages as read when viewing a conversation from history
                                            if (chat.unreadCount > 0) {
                                                await markMessagesAsRead(chat.id);
                                            }
                                        }}>
                                        <div className="px-4 py-4 flex items-start space-x-3">
                                            {/* Avatar */}
                                            <div className="flex-shrink-0 relative">
                                                <div className="w-11 h-11 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center border border-primary/20 shadow-sm">
                                                    <span className="text-primary text-sm font-semibold">V{chat.id.split('_')[1].slice(0, 2)}</span>
                                                </div>
                                                {/* Unread badge */}
                                                {chat.unreadCount > 0 && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                                                        <span className="text-xs font-bold text-white">{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* History details */}
                                            <div className="flex-1 min-w-0">
                                                {/* Header row: Visitor name and timestamp */}
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={`text-sm font-semibold ${
                                                        chat.unreadCount > 0 ? 'text-foreground' : 'text-foreground/80'
                                                    }`}>Visitor {chat.id.split('_')[1]}</h3>
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {new Date(chat.timestamp).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                                
                                                {/* Message preview */}
                                                <p className={`text-sm truncate mb-2 leading-relaxed ${
                                                    chat.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                                                }`}>{chat.lastMessage}</p>
                                                
                                                {/* Bottom row: Stats badges */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        {/* Message count badge */}
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border">
                                                            <MessageCircle className="w-3 h-3 mr-1" />
                                                            {chat.messageCount}
                                                        </span>
                                                        {/* Unread count badge */}
                                                        {chat.unreadCount > 0 && (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                                                <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                                                                {chat.unreadCount} unread
                                                            </span>
                                                        )}
                                                    </div>
                                                    {/* Time */}
                                                    <span className="text-xs text-muted-foreground/70">
                                                        {new Date(chat.timestamp).toLocaleTimeString([], {
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                            hour12: true
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Delete button */}
                                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteConversation(chat.id);
                                                    }}
                                                    className="p-1.5 hover:bg-red-500/10 rounded-full transition-colors duration-200 group/delete">
                                                    <Trash className="w-4 h-4 text-muted-foreground group-hover/delete:text-red-500 transition-colors duration-200" />
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
            <div className="flex-1 flex flex-col bg-background">
                {chatState.selectedVisitorId ? (
                    <>
                        {/* Enhanced Chat Header with Visitor Info */}
                        <div className="bg-card border-b border-border shadow-sm">
                            <div className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4">
                                            {/* Mobile Back Button */}
                                            <button
                                                className="lg:hidden p-2 -ml-2 hover:bg-accent rounded-full transition-colors"
                                                onClick={() => selectVisitor(null)}
                                                aria-label="Back to conversation list"
                                            >
                                                <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            {/* Visitor Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center border-2 border-primary/20 shadow-sm">
                                                    <span className="text-primary text-sm font-bold">V{chatState.selectedVisitorId.split('_')[1].slice(0, 2)}</span>
                                                </div>
                                                
                                                {/* Country Flag */}
                                                {currentConversation?.country_code && (
                                                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full overflow-hidden border-2 border-background shadow-sm bg-background">
                                                        <img 
                                                            src={`https://flagsapi.com/${currentConversation.country_code}/flat/32.png`}
                                                            alt={`${currentConversation.country} flag`}
                                                            className="w-full h-full object-cover"
                                                            onLoad={() => console.log(`Header flag loaded: ${currentConversation.country_code}`)}
                                                            onError={(e) => {
                                                                console.log(`Header flag failed to load: ${currentConversation.country_code}`);
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                                
                                                {/* Status Indicator */}
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background shadow-sm ${
                                                    chatState.visitorStatuses[chatState.selectedVisitorId] === 'online' 
                                                        ? 'bg-green-500' 
                                                        : chatState.visitorStatuses[chatState.selectedVisitorId] === 'away' 
                                                            ? 'bg-orange-500' 
                                                            : 'bg-muted-foreground'
                                                }`} />
                                            </div>
                                            
                                            {/* Visitor Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3">
                                                    <h2 className="text-lg font-semibold text-foreground">Visitor {chatState.selectedVisitorId.split('_')[1]}</h2>
                                                    <div className="flex items-center space-x-1">
                                                        <div className={`w-2 h-2 rounded-full ${
                                                            chatState.visitorStatuses[chatState.selectedVisitorId] === 'online' 
                                                                ? 'bg-green-500' 
                                                                : chatState.visitorStatuses[chatState.selectedVisitorId] === 'away' 
                                                                    ? 'bg-orange-500' 
                                                                    : 'bg-muted-foreground'
                                                        } animate-pulse`} />
                                                        <span className="text-sm font-medium text-muted-foreground capitalize">
                                                            {chatState.visitorStatuses[chatState.selectedVisitorId] || 'offline'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-0.5">{chatState.activeTab === 'history' ? 'Viewing chat history' : 'Live chat session'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {chatState.activeTab === 'live' && (
                                        <div className="flex items-center space-x-2 bg-muted px-3 py-1.5 rounded-full border border-border">
                                            <span className={`w-2 h-2 rounded-full ${chatState.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                            <span className="text-sm text-muted-foreground font-medium">{chatState.isConnected ? 'Connected' : 'Disconnected'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                        </div>

                        {/* Messages Container */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 chat-scrollbar bg-gradient-to-b from-muted/20 to-background">
                            {/* Load More Button */}
                            {hasMoreMessages && (
                                <div className="flex justify-center mb-4">
                                    <button
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                        className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-all duration-200 ${
                                            isLoadingMore ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-background text-primary hover:bg-primary/5 border border-primary/20'
                                        }`}>
                                        {isLoadingMore ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                                            <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border border-border shadow-sm animate-slide-in">
                                                <span className="text-muted-foreground text-xs font-medium">V</span>
                                                
                                                {/* Country Flag */}
                                                {currentConversation?.country_code && (
                                                    <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full overflow-hidden border border-background shadow-sm bg-background">
                                                        <img 
                                                            src={`https://flagsapi.com/${currentConversation.country_code}/flat/32.png`}
                                                            alt={`${currentConversation.country} flag`}
                                                            className="w-full h-full object-cover"
                                                            onLoad={() => console.log(`Chat avatar flag loaded: ${currentConversation.country_code}`)}
                                                            onError={(e) => {
                                                                console.log(`Chat avatar flag failed to load: ${currentConversation.country_code}`);
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className={`group relative max-w-[70%] ${msg.type === 'visitor' ? 'ml-2' : 'mr-2'}`}>
                                            {/* Timestamp tooltip */}
                                            <div className={`absolute ${msg.type === 'visitor' ? '-left-2' : '-right-2'} -top-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                                                <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full shadow-sm border border-border">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div
                                                className={`message-bubble ${
                                                    msg.type === 'visitor' ? 'message-bubble-visitor' : msg.type === 'ai' ? 'message-bubble-ai' : 'message-bubble-admin'
                                                } relative rounded-2xl px-4 py-3 shadow-md transition-all duration-200 hover:shadow-lg ${
                                                    msg.type === 'visitor'
                                                        ? 'bg-background border border-border text-foreground rounded-bl-none'
                                                        : msg.type === 'ai'
                                                        ? 'bg-primary/10 border border-primary/20 text-primary rounded-br-none'
                                                        : 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-br-none'
                                                }`}>
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.message}</p>

                                                <div className="mt-1 flex items-center space-x-2 opacity-75">
                                                    <span className={`text-xs font-medium ${msg.type === 'visitor' ? 'text-muted-foreground' : msg.type === 'ai' ? 'text-primary' : 'text-primary-foreground/70'}`}>
                                                        {msg.type === 'ai' ? 'AI Assistant' : msg.type === 'admin' ? 'Admin' : 'Visitor'}
                                                    </span>
                                                </div>

                                                {(msg.browser || msg.country) && (
                                                    <div className="mt-1 flex items-center flex-wrap gap-2">
                                                        {msg.type !== 'admin' && msg.browser && (
                                                            <span
                                                                className={`text-xs px-2 py-0.5 rounded-full ${
                                                                    msg.type === 'visitor' ? 'bg-muted text-muted-foreground border border-border' : 'bg-primary/10 text-primary border border-primary/20'
                                                                }`}>
                                                                {msg.browser}
                                                            </span>
                                                        )}
                                                        {msg.country && (
                                                            <span
                                                                className={`text-xs px-2 py-0.5 rounded-full ${
                                                                    msg.type === 'visitor' ? 'bg-muted text-muted-foreground border border-border' : 'bg-primary/10 text-primary border border-primary/20'
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
                                                    msg.type === 'ai' ? 'bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20' : 'bg-gradient-to-br from-primary to-primary/80 border-primary'
                                                }`}>
                                                <span className={`text-xs font-medium ${msg.type === 'ai' ? 'text-primary' : 'text-primary-foreground'}`}>{msg.type === 'ai' ? 'AI' : 'A'}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* AI Typing Indicator */}
                                {isTypingIndicatorVisible && (
                                    <div className="flex items-end space-x-2 justify-start animate-fade-in">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center border border-primary/20 shadow-sm animate-slide-in">
                                            <span className="text-primary text-xs font-medium">AI</span>
                                        </div>
                                        <div className="group relative max-w-[70%] ml-2">
                                            <div className="message-bubble message-bubble-ai relative rounded-2xl px-4 py-3 shadow-md bg-primary/10 border border-primary/20 text-primary rounded-br-none">
                                                <div className="typing-indicator flex items-center space-x-1.5 h-6">
                                                    <span className="inline-block w-2.5 h-2.5 bg-primary rounded-full opacity-60" style={{ animation: 'typingAnimation 1s infinite 0.2s' }}></span>
                                                    <span className="inline-block w-2.5 h-2.5 bg-primary rounded-full opacity-60" style={{ animation: 'typingAnimation 1s infinite 0.4s' }}></span>
                                                    <span className="inline-block w-2.5 h-2.5 bg-primary rounded-full opacity-60" style={{ animation: 'typingAnimation 1s infinite 0.6s' }}></span>
                                                </div>
                                                <div className="mt-1 flex items-center space-x-2 opacity-75">
                                                    <span className="text-xs font-medium text-primary">AI Assistant is typing...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-6 bg-card border-t border-border">
                            <form onSubmit={handleSendMessage} className="relative">
                                <div className="relative rounded-xl shadow-sm">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={handleInputChange}
                                        className={`chat-input w-full border-2 rounded-xl pl-4 pr-28 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 ${
                                            !chatState.isConnected || chatState.activeTab === 'history' ? 'bg-muted text-muted-foreground border-border' : 'bg-background border-border hover:border-border/80'
                                        }`}
                                        placeholder={!chatState.isConnected ? 'Disconnected...' : chatState.activeTab === 'history' ? 'Cannot send messages in history view' : 'Type your message...'}
                                        disabled={!chatState.isConnected || chatState.activeTab === 'history'}
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                        <button
                                            type="submit"
                                            className={`px-4 py-1.5 rounded-lg font-medium transition-all duration-200 ${
                                                !chatState.isConnected || !inputMessage.trim() || chatState.activeTab === 'history'
                                                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                                                    : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:transform active:scale-95'
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
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-b from-muted/20 to-background">
                        <div className="bg-card p-8 rounded-2xl shadow-md border border-border max-w-md">
                            <div className="text-primary mb-4">
                                <MessageCircle className="w-16 h-16 mx-auto opacity-80" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Enterprise Chat</h3>
                            <p className="text-muted-foreground mb-6">Select a {chatState.activeTab === 'live' ? 'visitor' : 'chat history'} from the sidebar to start viewing the conversation</p>
                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg border border-border">
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
