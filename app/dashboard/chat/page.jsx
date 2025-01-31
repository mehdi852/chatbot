'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useChatContext } from '@/app/contexts/ChatContext';
import { MessageCircle, Users } from 'lucide-react';

const ChatPage = () => {
    const { chatState, sendMessage, selectVisitor, selectWebsite, toggleAI, loadChatHistory, setActiveTab } = useChatContext();
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Get current conversation messages
    const currentMessages = chatState.selectedVisitorId ? chatState.conversations[chatState.selectedVisitorId]?.messages || [] : [];

    // Debug logging
    useEffect(() => {
        console.log('Chat state updated:', {
            isConnected: chatState.isConnected,
            selectedWebsite: chatState.selectedWebsite?.domain,
            visitorCount: chatState.visitors.length,
            visitors: chatState.visitors,
        });
    }, [chatState]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Modify handleSendMessage to use context
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (await sendMessage(inputMessage, chatState.selectedVisitorId)) {
            setInputMessage('');
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [chatState.conversations]);

    return (
        <div className="flex h-screen bg-gray-50/50">
            {/* Websites Selector and Chat List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
                {/* Website Selector with AI Toggle */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Your Websites</h2>
                    <div className="mt-4 space-y-3">
                        {chatState.userWebsites.map((website) => (
                            <div
                                key={website.id}
                                className={`group relative rounded-lg transition-all duration-200 ${
                                    chatState.selectedWebsite?.id === website.id ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
                                } border p-4 shadow-sm`}>
                                <div className="flex flex-col space-y-2">
                                    <div className="flex items-center justify-between">
                                        <button
                                            className={`text-left flex-1 font-medium ${chatState.selectedWebsite?.id === website.id ? 'text-blue-700' : 'text-gray-700 group-hover:text-gray-900'}`}
                                            onClick={() => selectWebsite(website)}>
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-2 h-2 rounded-full ${website.isAiEnabled ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                <span>{website.domain}</span>
                                            </div>
                                        </button>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-sm text-gray-500">AI</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={website.isAiEnabled} onChange={() => toggleAI(website.id, website.isAiEnabled)} />
                                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                    {chatState.selectedWebsite?.id === website.id && (
                                        <div className="text-xs text-gray-600 bg-blue-50/50 p-2 rounded">
                                            <span className="font-medium">Status:</span> {website.isAiEnabled ? 'AI Auto-responding enabled' : 'Manual mode'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Connection Status */}
                <div className="px-6 py-3 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${chatState.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                        <p className="text-sm font-medium text-gray-700">{chatState.isConnected ? 'Connected' : 'Disconnected'}</p>
                    </div>
                </div>

                {/* Chat Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-3 px-6 text-sm font-medium transition-colors duration-200 ${
                            chatState.activeTab === 'live' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveTab('live')}>
                        Live Chats {chatState.visitors.length > 0 && <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">{chatState.visitors.length}</span>}
                    </button>
                    <button
                        className={`flex-1 py-3 px-6 text-sm font-medium transition-colors duration-200 ${
                            chatState.activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveTab('history')}>
                        Chat History
                    </button>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {chatState.activeTab === 'live' ? (
                        <div className="divide-y divide-gray-200">
                            {chatState.visitors.map((visitor) => (
                                <div
                                    key={visitor.id}
                                    className={`group cursor-pointer transition-all duration-200 ${chatState.selectedVisitorId === visitor.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                    onClick={() => selectVisitor(visitor)}>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium text-gray-900">Visitor {visitor.id.split('_')[1]}</span>
                                                {visitor.unread && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">New</span>}
                                            </div>
                                            <span className="text-xs text-gray-500">{new Date(visitor.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">{visitor.lastMessage}</p>
                                    </div>
                                </div>
                            ))}
                            {chatState.visitors.length === 0 && (
                                <div className="p-8 text-center">
                                    <div className="text-gray-400 mb-2">
                                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    </div>
                                    <p className="text-gray-600 font-medium">No active visitors</p>
                                    <p className="text-sm text-gray-500 mt-1">Visitors will appear here when they start chatting</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {chatState.isLoadingHistory ? (
                                <div className="p-8 text-center">
                                    <div className="animate-spin inline-block w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full mb-2"></div>
                                    <p className="text-gray-600 font-medium">Loading chat history...</p>
                                </div>
                            ) : chatState.historyError ? (
                                <div className="p-8 text-center text-red-500">
                                    <p className="font-medium">Error: {chatState.historyError}</p>
                                    <button onClick={loadChatHistory} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        Try Again
                                    </button>
                                </div>
                            ) : chatState.chatHistory.length === 0 ? (
                                <div className="p-8 text-center">
                                    <p className="text-gray-600 font-medium">No chat history found</p>
                                    <button onClick={loadChatHistory} className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                        Refresh History
                                    </button>
                                </div>
                            ) : (
                                chatState.chatHistory.map((chat) => (
                                    <div
                                        key={chat.id}
                                        className={`group cursor-pointer transition-all duration-200 ${chatState.selectedVisitorId === chat.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                                        onClick={() => selectVisitor({ id: chat.id })}>
                                        <div className="p-4">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-gray-900">Visitor {chat.id.split('_')[1]}</span>
                                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{chat.messageCount} messages</span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {new Date(chat.timestamp).toLocaleDateString()} {new Date(chat.timestamp).toLocaleTimeString()}
                                            </p>
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
                                    <div className="flex items-center space-x-2">
                                        <span className={`w-2 h-2 rounded-full ${chatState.isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                                        <span className="text-sm text-gray-600">{chatState.isConnected ? 'Connected' : 'Disconnected'}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {currentMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.type === 'visitor' ? 'justify-start' : 'justify-end'}`}>
                                    <div
                                        className={`max-w-[70%] rounded-lg p-4 shadow-sm ${
                                            msg.type === 'visitor' ? 'bg-gray-100 text-gray-800' : msg.type === 'ai' ? 'bg-blue-50 text-blue-800 border border-blue-100' : 'bg-blue-600 text-white'
                                        }`}>
                                        <p className="text-sm">{msg.message}</p>
                                        <div className="mt-1 flex items-center space-x-2">
                                            <span className={`text-xs ${msg.type === 'visitor' ? 'text-gray-500' : msg.type === 'ai' ? 'text-blue-600' : 'text-blue-200'}`}>
                                                {msg.type === 'ai' ? 'AI Assistant' : msg.type === 'admin' ? 'Admin' : 'Visitor'}
                                            </span>
                                            <span className={`text-xs ${msg.type === 'visitor' ? 'text-gray-400' : msg.type === 'ai' ? 'text-blue-500' : 'text-blue-200'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="p-6 bg-white border-t border-gray-200">
                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    className={`w-full border rounded-lg pl-4 pr-24 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        !chatState.isConnected || chatState.activeTab === 'history' ? 'bg-gray-50 text-gray-500' : 'bg-white'
                                    }`}
                                    placeholder={!chatState.isConnected ? 'Disconnected...' : chatState.activeTab === 'history' ? 'Cannot send messages in history view' : 'Type your message...'}
                                    disabled={!chatState.isConnected || chatState.activeTab === 'history'}
                                />
                                <button
                                    type="submit"
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-md transition-all duration-200 ${
                                        !chatState.isConnected || !inputMessage.trim() || chatState.activeTab === 'history'
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                    disabled={!chatState.isConnected || !inputMessage.trim() || chatState.activeTab === 'history'}>
                                    Send
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="text-gray-400 mb-4">
                            <MessageCircle className="w-16 h-16 mx-auto opacity-50" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No chat selected</h3>
                        <p className="text-gray-500 max-w-md">Select a {chatState.activeTab === 'live' ? 'visitor' : 'chat history'} from the sidebar to start viewing the conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
