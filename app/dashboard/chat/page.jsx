'use client';

import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const ChatPage = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState({});
    const [visitors, setVisitors] = useState([]);
    const [selectedVisitor, setSelectedVisitor] = useState(null);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const messagesEndRef = useRef(null);
    const socketInitialized = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!socketInitialized.current) {
            socketInitialized.current = true;

            const initSocket = async () => {
                try {
                    await fetch('/api/socket');

                    const socketInstance = io('http://localhost:3001', {
                        transports: ['websocket', 'polling'],
                        reconnectionAttempts: 5,
                        reconnectionDelay: 1000,
                        timeout: 20000,
                        forceNew: true,
                    });

                    socketInstance.on('connect', () => {
                        console.log('Connected to socket server', socketInstance.id);
                        setIsConnected(true);
                    });

                    socketInstance.on('disconnect', (reason) => {
                        console.log('Disconnected from socket server:', reason);
                        setIsConnected(false);
                    });

                    socketInstance.on('connect_error', (error) => {
                        console.error('Socket connection error:', error);
                        setIsConnected(false);
                    });

                    socketInstance.on('admin-receive-message', (data) => {
                        console.log('Received visitor message:', data);
                        setMessages((prev) => ({
                            ...prev,
                            [data.visitorId]: [...(prev[data.visitorId] || []), { ...data, type: 'visitor' }],
                        }));

                        // Update visitors list
                        setVisitors((prev) => {
                            const existingVisitor = prev.find((v) => v.id === data.visitorId);
                            if (!existingVisitor) {
                                return [
                                    ...prev,
                                    {
                                        id: data.visitorId,
                                        lastMessage: data.message,
                                        timestamp: data.timestamp,
                                        unread: selectedVisitor?.id !== data.visitorId,
                                    },
                                ];
                            }
                            return prev.map((v) =>
                                v.id === data.visitorId
                                    ? {
                                          ...v,
                                          lastMessage: data.message,
                                          timestamp: data.timestamp,
                                          unread: selectedVisitor?.id !== data.visitorId,
                                      }
                                    : v
                            );
                        });

                        // Auto-select first visitor if none selected
                        if (!selectedVisitor) {
                            setSelectedVisitor({ id: data.visitorId });
                        }
                    });

                    setSocket(socketInstance);

                    return () => {
                        if (socketInstance.connected) {
                            socketInstance.disconnect();
                        }
                    };
                } catch (error) {
                    console.error('Failed to initialize socket:', error);
                }
            };

            initSocket();
        }
    }, [selectedVisitor]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, selectedVisitor]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !socket || !isConnected || !selectedVisitor) return;

        const messageData = {
            message: inputMessage,
            websiteId: '918517',
            visitorId: selectedVisitor.id,
            timestamp: new Date(),
        };

        socket.emit('admin-message', messageData);
        setMessages((prev) => ({
            ...prev,
            [selectedVisitor.id]: [...(prev[selectedVisitor.id] || []), { ...messageData, type: 'admin' }],
        }));
        setInputMessage('');
    };

    const handleVisitorSelect = (visitor) => {
        setSelectedVisitor(visitor);
        // Mark messages as read
        setVisitors((prev) => prev.map((v) => (v.id === visitor.id ? { ...v, unread: false } : v)));
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Visitors Sidebar */}
            <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Visitors</h2>
                    <p className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'}`}>{isConnected ? '🟢 Connected' : '🔴 Disconnected'}</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {visitors.map((visitor) => (
                        <div key={visitor.id} className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedVisitor?.id === visitor.id ? 'bg-blue-50' : ''}`} onClick={() => handleVisitorSelect(visitor)}>
                            <div className="flex items-center justify-between">
                                <span className="font-medium">Visitor {visitor.id.split('_')[1]}</span>
                                {visitor.unread && <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">New</span>}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{visitor.lastMessage}</p>
                            <p className="text-xs text-gray-400">{new Date(visitor.timestamp).toLocaleTimeString()}</p>
                        </div>
                    ))}
                    {visitors.length === 0 && <div className="p-4 text-center text-gray-500">No visitors yet</div>}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedVisitor ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200">
                            <h2 className="text-lg font-semibold">Chat with Visitor {selectedVisitor.id.split('_')[1]}</h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages[selectedVisitor.id]?.map((msg, idx) => (
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
                                    disabled={!isConnected}
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    disabled={!isConnected || !inputMessage.trim()}>
                                    Send
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500">Select a visitor to start chatting</div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
