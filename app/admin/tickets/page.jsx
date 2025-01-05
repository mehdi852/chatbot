/**
 * @fileoverview Admin Tickets Component
 * This file contains the AdminTickets component which handles the ticket management system
 * for administrators. It includes functionality for viewing, searching, and responding to
 * support tickets from both registered users and visitors.
 */

'use client';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Icons
import { ChevronDown, Search, MoreVertical, Paperclip, Bold, Italic, List, Link2, Smile } from 'lucide-react';

// Utilities
import { formatDate } from '@/utils/Functions';
import { set } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';

/**
 * AdminTickets Component
 * Manages the display and interaction with support tickets in the admin interface
 */
const AdminTickets = () => {
    const { t } = useTranslation();
    // State management for conversations and messages
    const [selectedConversation, setSelectedConversation] = React.useState(null);
    const [messageInput, setMessageInput] = React.useState('');

    // State for tickets management
    const [searchedTickets, setSearchedTickets] = React.useState([]);
    const [Tickets, setTickets] = React.useState([]);
    const [selectedTicket, setSelectedTicket] = React.useState(null);
    const [ticketsCount, setTicketsCount] = useState(0);

    // UI state
    const [activeTab, setActiveTab] = useState('open');

    // Hooks
    const { user } = useUser();
    const { toast } = useToast();

    /**
     * Fetches visitor tickets from the backend
     * Updates the tickets state with visitor tickets while preserving existing user tickets
     */
    const fetchVisitorsTickets = async () => {
        try {
            const response = await fetch('/api/admin/get-visitors-tickets');
            const data = await response.json();

            setTickets((prevTickets) => {
                const visitorTickets = data.visitorsTickets.map((ticket) => ({ ...ticket, isVisitor: true }));
                return [...prevTickets.filter((t) => !t.isVisitor), ...visitorTickets];
            });
        } catch (error) {
            console.error('Error fetching visitor tickets:', error);
        }
    };

    /**
     * Fetches user tickets from the backend
     * Updates the tickets state with user tickets while preserving existing visitor tickets
     */
    const fetchUsersTickets = async () => {
        try {
            const response = await fetch('/api/admin/get-users-tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Error fetching messages: ${response.status}`);
            }

            const data = await response.json();

            setTickets((prevTickets) => {
                const userTickets = data.usersTickets.map((ticket) => ({ ...ticket, isUser: true }));
                return [...prevTickets.filter((t) => t.isVisitor), ...userTickets];
            });
        } catch (error) {
            console.error('Error fetching user tickets:', error);
        }
    };

    // Initial data fetch
    useEffect(() => {
        fetchVisitorsTickets();
        fetchUsersTickets();
    }, []);

    /**
     * Determines if a ticket belongs to a registered user
     * @param {Object} ticket - The ticket to check
     * @returns {boolean} True if ticket belongs to a user, false if visitor
     */
    const isTicketOfUser = (ticket) => {
        return ticket.user_id ? true : false;
    };

    /**
     * Handles ticket selection and marks it as read
     * @param {Object} ticket - The selected ticket
     */
    const handleTicketClick = async (ticket) => {
        setSelectedTicket((prevTicket) => {
            return ticket;
        });

        try {
            const response = await fetch('/api/admin/mark-ticket-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_id: isTicketOfUser(ticket) ? ticket.ticket_id : ticket.id, is_user: isTicketOfUser(ticket) }),
            });

            if (!response.ok) {
                throw new Error(`Error marking ticket as read: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            setTickets(Tickets.map((t) => (t.id === ticket.id ? { ...t, isRead: true } : t)));
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Handles sending a response message to a ticket
     * Updates the UI and sends the response to the backend
     */
    const handleMessageSubmit = async () => {
       
        let AdminUser = await fetch('/api/admin/get-user-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.emailAddresses[0]?.emailAddress }),
        });
        

         AdminUser = await AdminUser.json();

        const message = messageInput;

        const response = await fetch('/api/admin/respond-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticket_id: selectedTicket.ticket_id, subject: 'No subject', body: messageInput, admin_id: AdminUser[0].id }),
        });

        if (!response.ok) {
            throw new Error(`Error marking ticket as read: ${response.status}`);
        }

        setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, { id: 22, ticket_id: 24, user_id: AdminUser.id, subject: 'No subject', body: message, isAdmin: true }] });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }
    };


    /**
     * Handles search input changes
     */
    const handleSearchInput = (e) => {
        setMessageInput(e.target.value);
    };

    /**
     * Performs ticket search by email
     * Updates the searchedTickets state with results
     */
    const handleSearchSubmit = async () => {
        if (messageInput === '') {
            setSearchedTickets([]);
            return;
        }

        const response = await fetch('/api/admin/search-ticket-by-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: messageInput }),
        });

        if (!response.ok) {
            throw new Error(`Error getting the ticket: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        setSearchedTickets([data.returnedTicket[0]]);
    };

    // Update ticket count when tickets change
    useEffect(() => {
        if (Tickets.length > 0) {
            setTicketsCount(Tickets.length);
        }
    }, [Tickets]);

    /**
     * Handles resolving a ticket
     * Updates the ticket status locally and on the backend
     */
    const handleResolveTicket = async () => {
        if (!selectedTicket) return;

        try {
            const response = await fetch('/api/admin/resolve-ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ticket_id: selectedTicket.ticket_id }),
            });

            if (!response.ok) {
                throw new Error('Failed to resolve ticket');
            }

            const data = await response.json();

            setTickets((prevTickets) => prevTickets.map((ticket) => (ticket.ticket_id === selectedTicket.ticket_id ? { ...ticket, resolved: true } : ticket)));

            setSelectedTicket((prevTicket) => ({ ...prevTicket, resolved: true }));

            toast({
                variant: 'success',
                title: 'Success',
                description: data.message,
            });
        } catch (error) {
            console.error('Error resolving ticket:', error);
            toast({
                title: 'Error',
                description: 'Failed to resolve ticket. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Component render
    return (
        <div className="ml-64 h-[94%]">
            <div className="h-full">
                <div className="space-y-4 h-full">
                    <div className="flex h-[100%] bg-background">
                        {/* Left sidebar */}
                        <div className="w-80 bg-card border-r border-border flex flex-col">
                            <div className="p-3 border-b border-border">
                                <h2 className="text-base font-semibold mb-2 flex items-center text-foreground">
                                    {t('adminPage.ticketsManager.messages.title')}
                                    <span className="bg-muted text-muted-foreground text-xs py-0.5 px-1.5 rounded-full ml-2">{ticketsCount}</span>
                                </h2>
                                <div className="relative flex">
                                    <div>
                                        <Input type="text" placeholder={t('adminPage.ticketsManager.messages.search.placeholder')} onChange={handleSearchInput} className="w-full text-xs pl-8" />
                                        <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                                    </div>
                                    <Button className="ml-2 text-xs" onClick={() => handleSearchSubmit()}>
                                        {t('adminPage.ticketsManager.messages.search.button')}
                                    </Button>
                                </div>
                                <div className="mt-2">
                                    <Tabs defaultValue="open" className="w-full" onValueChange={setActiveTab}>
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="open">{t('adminPage.ticketsManager.messages.tabs.open')}</TabsTrigger>
                                            <TabsTrigger value="resolved">{t('adminPage.ticketsManager.messages.tabs.resolved')}</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {searchedTickets.length == 0
                                    ? Tickets.filter((ticket) => (activeTab === 'open' ? !ticket.resolved : ticket.resolved)).map((ticket) => (
                                          <div
                                              key={ticket.ticket_id}
                                              className={`flex items-start p-3 cursor-pointer border-b border-border ${!ticket.isRead ? 'bg-primary/10' : 'bg-card'} ${
                                                  isTicketOfUser(ticket) && selectedTicket?.ticket_id == ticket.ticket_id ? 'bg-muted' : ''
                                              }
                                        ${!isTicketOfUser(ticket) && selectedTicket?.id == ticket.id ? 'bg-muted' : ''}
                                        `}
                                              onClick={() => handleTicketClick(ticket)}>
                                              {ticket.unread && <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-2"></div>}
                                              <Avatar className="h-8 w-8 mr-2">
                                                  <AvatarImage src={ticket.avatar} alt={ticket.applicant} />
                                                  <AvatarFallback>{ticket.name[0]}</AvatarFallback>
                                              </Avatar>
                                              <div className="flex-1 min-w-0">
                                                  <div className="flex justify-between items-baseline">
                                                      <h3 className="font-medium text-xs truncate text-foreground">{ticket.name}</h3>
                                                      <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-1">{ticket.date}</span>
                                                  </div>
                                                  <p className="text-[10px] text-primary mb-0.5 truncate">{t('adminPage.ticketsManager.ticket.supportTicket')}</p>
                                                  <p className="text-xs text-muted-foreground truncate">{ticket.body ? ticket.body : ticket.messages[ticket.messages.length - 1].body}</p>
                                              </div>
                                          </div>
                                      ))
                                    : searchedTickets
                                          .filter((ticket) => (activeTab === 'open' ? !ticket.resolved : ticket.resolved))
                                          .map((ticket) => (
                                              <div
                                                  key={ticket.ticket_id}
                                                  className={`flex items-start p-3 cursor-pointer border-b border-border ${!ticket.isRead ? 'bg-primary/10' : 'bg-card'} ${
                                                      isTicketOfUser(ticket) && selectedTicket?.ticket_id == ticket.ticket_id ? 'bg-muted' : ''
                                                  }
                                        ${!isTicketOfUser(ticket) && selectedTicket?.id == ticket.id ? 'bg-muted' : ''}
                                        `}
                                                  onClick={() => handleTicketClick(ticket)}>
                                                  {ticket.unread && <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-2"></div>}
                                                  <Avatar className="h-8 w-8 mr-2">
                                                      <AvatarImage src={ticket.avatar} alt={ticket.applicant} />
                                                      <AvatarFallback>{ticket.name[0]}</AvatarFallback>
                                                  </Avatar>
                                                  <div className="flex-1 min-w-0">
                                                      <div className="flex justify-between items-baseline">
                                                          <h3 className="font-medium text-xs truncate text-foreground">{ticket.name}</h3>
                                                          <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-1">{ticket.date}</span>
                                                      </div>
                                                      <p className="text-[10px] text-primary mb-0.5 truncate">{t('adminPage.ticketsManager.ticket.supportTicket')}</p>
                                                      <p className="text-xs text-muted-foreground truncate">{ticket.body ? ticket.body : ticket.messages[ticket.messages.length - 1].body}</p>
                                                  </div>
                                              </div>
                                          ))}
                            </div>
                        </div>

                        {/* Main content area - Shows when a ticket is selected */}
                        {selectedTicket && (
                            <div className="flex-1 flex flex-col">
                                {/* Ticket header */}
                                <div className="bg-card p-3 border-b border-border flex justify-between items-center">
                                    <div>
                                        <h2 className="text-base font-semibold text-foreground">{selectedTicket.name}</h2>
                                        <p className="text-xs text-primary">
                                            {t('adminPage.ticketsManager.ticket.sender')} {selectedTicket.email}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-1.5">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={handleResolveTicket}>{t('adminPage.ticketsManager.ticket.actions.resolveTicket')}</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Messages display area */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                                    {selectedTicket &&
                                        isTicketOfUser(selectedTicket) &&
                                        selectedTicket.messages.map((message, index) => (
                                            <div key={message.id} className={`flex justify-start ${message.isAdmin ? 'justify-end' : 'justify-start'} }`}>
                                                <Card className={`max-w-[70%] rounded-md ${message.isAdmin ? 'bg-primary/10' : 'bg-card'}`}>
                                                    <CardContent className="p-2">
                                                        <div className="flex items-start">
                                                            <Avatar className="h-6 w-6 mr-2">
                                                                <AvatarFallback>{selectedTicket.name[0]}</AvatarFallback>
                                                            </Avatar>

                                                            <div>
                                                                <p className="text-xs font-medium text-foreground">{message.name}</p>
                                                                <p className="text-xs text-muted-foreground">{message.body}</p>
                                                                <p className="text-[10px] text-muted-foreground mt-1">{formatDate(message.date)}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        ))}
                                    {!isTicketOfUser(selectedTicket) && (
                                        <div key={selectedTicket.id} className="flex justify-start">
                                            <Card className="max-w-[70%] rounded-md bg-card">
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
                                                            <p className="text-xs font-medium text-foreground">{selectedTicket.name}</p>
                                                            <p className="text-xs text-muted-foreground">{selectedTicket.body}</p>
                                                            <p className="text-[10px] text-muted-foreground mt-1">{formatDate(selectedTicket.date)}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    )}

                                    <div className="text-center">
                                        <span className="bg-muted text-muted-foreground text-[10px] py-0.5 px-1.5 rounded-full">{t('adminPage.ticketsManager.messages.today')}</span>
                                    </div>
                                </div>

                                {/* Message input area */}
                                <div className="bg-card border-t border-border p-3">
                                    <Textarea
                                        disabled={!isTicketOfUser(selectedTicket)}
                                        placeholder={!isTicketOfUser(selectedTicket) ? t('adminPage.ticketsManager.messages.cantReply') : t('adminPage.ticketsManager.messages.reply')}
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        className="w-full mb-2 text-xs bg-background"
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
                                            {t('adminPage.ticketsManager.messages.send')}
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
