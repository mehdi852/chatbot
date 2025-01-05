'use client';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, Search, MoreVertical, Paperclip, Bold, Italic, List, Link2, Smile } from 'lucide-react';
import { formatDate } from '@/utils/Functions';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

// Mock data for tickets
const mockTickets = [
    {
        id: 1,
        ticket_id: 1,
        name: 'John Smith',
        email: 'john@example.com',
        body: 'I need help with my subscription',
        date: '2024-03-15',
        status: 'open',
        isRead: false,
        resolved: false,
        messages: [
            {
                id: 1,
                ticket_id: 1,
                body: 'I need help with my subscription',
                date: '2024-03-15',
                isAdmin: false,
                name: 'John Smith'
            },
            {
                id: 2,
                ticket_id: 1,
                body: 'Hello, I can help you with that. What seems to be the issue?',
                date: '2024-03-15',
                isAdmin: true,
                name: 'Support Team'
            }
        ]
    },
    {
        id: 2,
        ticket_id: 2,
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        body: 'Technical issue with the dashboard',
        date: '2024-03-14',
        status: 'open',
        isRead: true,
        resolved: false,
        messages: [
            {
                id: 3,
                ticket_id: 2,
                body: 'Technical issue with the dashboard',
                date: '2024-03-14',
                isAdmin: false,
                name: 'Sarah Wilson'
            }
        ]
    },
    {
        id: 3,
        ticket_id: 3,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        body: 'Payment failed',
        date: '2024-03-13',
        status: 'resolved',
        isRead: true,
        resolved: true,
        messages: [
            {
                id: 4,
                ticket_id: 3,
                body: 'Payment failed',
                date: '2024-03-13',
                isAdmin: false,
                name: 'Mike Johnson'
            }
        ]
    }
];

const handleSearchInput = (e) => {
    setSearchInput(e.target.value);
};



const AdminTickets = () => {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [searchedTickets, setSearchedTickets] = useState([]);
    const [tickets, setTickets] = useState(mockTickets);
    const [ticketsCount, setTicketsCount] = useState(mockTickets.length);
    const [activeTab, setActiveTab] = useState("open");
    const { toast } = useToast();
    const [searchInput, setSearchInput] = useState('');
    

    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would mark the ticket as read.",
            variant: "default"
        });
    };

    const handleMessageSubmit = () => {
        if (!messageInput.trim()) return;

        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would send your response to the user.",
            variant: "default"
        });

        // Simulate adding a new message
        const newMessage = {
            id: Date.now(),
            ticket_id: selectedTicket.ticket_id,
            body: messageInput,
            date: new Date().toISOString(),
            isAdmin: true,
            name: 'Support Team'
        };

        setSelectedTicket(prev => ({
            ...prev,
            messages: [...prev.messages, newMessage]
        }));

        setMessageInput('');
    };

    const handleSearchSubmit = () => {
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would search through your actual tickets.",
            variant: "default"
        });

        if (!messageInput.trim()) {
            setSearchedTickets([]);
            return;
        }

        const filtered = mockTickets.filter(ticket => 
            ticket.email.toLowerCase().includes(messageInput.toLowerCase())
        );
        setSearchedTickets(filtered);
    };

    const handleResolveTicket = () => {
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would mark the ticket as resolved.",
            variant: "default"
        });

        if (!selectedTicket) return;

        // Update the ticket status in the local state
        setTickets(prevTickets =>
            prevTickets.map(ticket =>
                ticket.ticket_id === selectedTicket.ticket_id
                    ? { ...ticket, resolved: true }
                    : ticket
            )
        );

        setSelectedTicket(prev => ({ ...prev, resolved: true }));
    };

    // Helper function to check if a ticket is from a user
    const isTicketOfUser = (ticket) => {
        return ticket?.ticket_id ? true : false;
    };

    return (
        <div className="  ml-64 h-[94%] ">
            {/* {JSON.stringify(Tickets)}

            {JSON.stringify(selectedTicket)} */}
            <div className="h-full">
                <div className="space-y-4 h-full">
                    <div className="flex h-[100%] bg-gray-50">
                        {/* Left sidebar */}
                        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                            <div className="p-3 border-b border-gray-200">
                                <h2 className="text-base font-semibold mb-2 flex items-center">
                                    Messages
                                    <span className="bg-gray-100 text-gray-600 text-xs py-0.5 px-1.5 rounded-full ml-2">{ticketsCount}</span>
                                </h2>
                                <div className="relative flex">
                                    <div>
                                        <Input type="text" placeholder="Search by email" onChange={handleSearchInput} className="w-full text-xs pl-8" />
                                        <Search className="h-3.5 w-3.5 text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                                    </div>
                                    <Button className="ml-2 text-xs" onClick={() => handleSearchSubmit()}>
                                        Search
                                    </Button>
                                </div>
                                <div className="mt-2">
                                    <Tabs defaultValue="open" className="w-full" onValueChange={setActiveTab}>
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="open">Open Tickets</TabsTrigger>
                                            <TabsTrigger value="resolved">Resolved</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {searchedTickets.length == 0
                                    ? tickets.filter(ticket => activeTab === "open" ? !ticket.resolved : ticket.resolved).map((ticket) => (
                                          <div
                                              key={ticket.ticket_id}
                                              className={`flex items-start p-3 cursor-pointer border-b  ${!ticket.isRead ? 'bg-blue-50' : 'bg-white'} ${
                                                  isTicketOfUser(ticket) && selectedTicket?.ticket_id == ticket.ticket_id ? 'bg-gray-200' : ''
                                              }
                                        ${!isTicketOfUser(ticket) && selectedTicket?.id == ticket.id ? 'bg-gray-200' : ''}
                                        `}
                                              onClick={() => handleTicketClick(ticket)}>
                                              {ticket.unread && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></div>}
                                              <Avatar className="h-8 w-8 mr-2">
                                                  <AvatarImage src={ticket.avatar} alt={ticket.applicant} />
                                                  <AvatarFallback>{ticket.name[0]}</AvatarFallback>
                                              </Avatar>
                                              <div className="flex-1 min-w-0">
                                                  <div className="flex justify-between items-baseline">
                                                      <h3 className="font-medium text-xs truncate">{ticket.name}</h3>
                                                      <span className="text-[10px] text-gray-500 flex-shrink-0 ml-1">{ticket.date}</span>
                                                  </div>
                                                  <p className="text-[10px] text-blue-600 mb-0.5 truncate">Support Ticket</p>
                                                  <p className="text-xs text-gray-600 truncate">{ticket.body ? ticket.body : ticket.messages[ticket.messages.length - 1].body}</p>
                                              </div>
                                          </div>
                                      ))
                                    : searchedTickets.filter(ticket => activeTab === "open" ? !ticket.resolved : ticket.resolved).map((ticket) => (
                                          <div
                                              key={ticket.ticket_id}
                                              className={`flex items-start p-3 cursor-pointer border-b  ${!ticket.isRead ? 'bg-blue-50' : 'bg-white'} ${
                                                  isTicketOfUser(ticket) && selectedTicket?.ticket_id == ticket.ticket_id ? 'bg-gray-200' : ''
                                              }
                                        ${!isTicketOfUser(ticket) && selectedTicket?.id == ticket.id ? 'bg-gray-200' : ''}
                                        `}
                                              onClick={() => handleTicketClick(ticket)}>
                                              {ticket.unread && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></div>}
                                              <Avatar className="h-8 w-8 mr-2">
                                                  <AvatarImage src={ticket.avatar} alt={ticket.applicant} />
                                                  <AvatarFallback>{ticket.name[0]}</AvatarFallback>
                                              </Avatar>
                                              <div className="flex-1 min-w-0">
                                                  <div className="flex justify-between items-baseline">
                                                      <h3 className="font-medium text-xs truncate">{ticket.name}</h3>
                                                      <span className="text-[10px] text-gray-500 flex-shrink-0 ml-1">{ticket.date}</span>
                                                  </div>
                                                  <p className="text-[10px] text-blue-600 mb-0.5 truncate">Support Ticket</p>
                                                  <p className="text-xs text-gray-600 truncate">{ticket.body ? ticket.body : ticket.messages[ticket.messages.length - 1].body}</p>
                                              </div>
                                          </div>
                                      ))}
                            </div>
                        </div>

                        {/* Main content */}
                        {selectedTicket && (
                            <div className="flex-1 flex flex-col">
                                {/* Top bar */}
                                <div className="bg-white p-3 border-b border-gray-200 flex justify-between items-center">
                                    <div>
                                        <h2 className="text-base font-semibold">{selectedTicket.name}</h2>
                                        <p className="text-xs text-blue-600">Sender {selectedTicket.email}</p>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={handleResolveTicket}>
                                                    Resolve Ticket
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {/* {selectedConversation.messages.map((message) => (
                                        <div key={message.id} className={`flex ${message.sender === 'Lena' ? 'justify-end' : 'justify-start'}`}>
                                            <Card className={`max-w-[70%] rounded-md ${message.sender === 'Lena' ? 'bg-blue-50' : 'bg-white'}`}>
                                                <CardContent className="p-2">
                                                    <div className="flex items-start">
                                                        {message.sender !== 'Lena' && (
                                                            <Avatar className="h-6 w-6 mr-2">
                                                                <AvatarImage src={message.avatar} alt={message.sender} />
                                                                <AvatarFallback>
                                                                    {message.sender
                                                                        .split(' ')
                                                                        .map((n) => n[0])
                                                                        .join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                        <div>
                                                            <p className="text-xs font-medium">{message.sender}</p>
                                                            <p className="text-xs">{message.content}</p>
                                                            <p className="text-[10px] text-gray-500 mt-1">{message.timestamp}</p>
                                                            </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    ))} */}

                                    {selectedTicket &&
                                        isTicketOfUser(selectedTicket) &&
                                        selectedTicket.messages.map((message, index) => (
                                            <div key={message.id} className={`flex  justify-start   ${message.isAdmin ? 'justify-end' : 'justify-start'} }`}>
                                                <Card className={`max-w-[70%] rounded-md  bg-white  ${message.isAdmin && 'bg-blue-50'}`}>
                                                    <CardContent className="p-2">
                                                        <div className="flex items-start">
                                                            <Avatar className="h-6 w-6 mr-2">
                                                                <AvatarFallback>{selectedTicket.name[0]}</AvatarFallback>
                                                            </Avatar>

                                                            <div>
                                                                <p className="text-xs font-medium">{message.name}</p>
                                                                <p className="text-xs">{message.body}</p>
                                                                <p className="text-[10px] text-gray-500 mt-1">{formatDate(message.date)}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))}
                                    {!isTicketOfUser(selectedTicket) && (
                                        <div key={selectedTicket.id} className={`flex  justify-start }`}>
                                            <Card className={`max-w-[70%] rounded-md  bg-white}`}>
                                                <CardContent className="p-2">
                                                    <div className="flex items-start">
                                                        <Avatar className="h-6 w-6 mr-2">
                                                            <AvatarFallback>
                                                                {selectedTicket.name &&
                                                                    selectedTicket.name
                                                                        .split(' ')
                                                                        .map((n) => n[0])
                                                                        .join('')}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div>
                                                            <p className="text-xs font-medium">{selectedTicket.name}</p>
                                                            <p className="text-xs">{selectedTicket.body}</p>
                                                            <p className="text-[10px] text-gray-500 mt-1">{formatDate(selectedTicket.date)}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <span className="bg-gray-100 text-gray-600 text-[10px] py-0.5 px-1.5 rounded-full">Today</span>
                                    </div>
                                </div>

                                {/* Message input */}
                                <div className="bg-white border-t border-gray-200 p-3">
                                    <Textarea
                                        disabled={!isTicketOfUser(selectedTicket)}
                                        placeholder={!isTicketOfUser(selectedTicket) ? 'Cant reply to visitors tickets directly from the platform, user direct email instead.' : 'Reply'}
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        className="w-full mb-2 text-xs"
                                        rows={3}
                                    />
                                    <div className="flex justify-between items-center">
                                        <div className="flex space-x-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Paperclip className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Bold className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Italic className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <List className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Link2 className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                                <Smile className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Button onClick={() => handleMessageSubmit()} size="sm" className="text-xs h-7 px-2">
                                            Send
                                            <ChevronDown className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTickets;
