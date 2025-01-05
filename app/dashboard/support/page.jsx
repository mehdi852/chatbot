'use client';
import React, { useEffect } from 'react';
import { useUserContext } from '@/app/provider';
import { useTranslation } from 'react-i18next';


import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, Search, MoreVertical, Paperclip, Bold, Italic, List, Link2, Smile } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const SupportPage = () => {
    const { t } = useTranslation();
    const [tickets, setTickets] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [selectedTicket, setSelectedTicket] = React.useState(null);
    const { user, dbUser } = useUserContext();
    const userId = dbUser?.id;
    const [messageText, setMessageText] = React.useState('');
    const [isSending, setIsSending] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('open');
    const { toast } = useToast();
    const [isResolving, setIsResolving] = React.useState(false);


    /// function to get the tickets for the user
    const getUserTickets = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch(`/api/user/tickets?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setTickets(data.tickets || []);

            // If we have a selectedTicket, find and update it with new data
            if (selectedTicket) {
                const updatedSelectedTicket = data.tickets.find((ticket) => ticket.ticket_id === selectedTicket.ticket_id);
                if (updatedSelectedTicket) {
                    setSelectedTicket(updatedSelectedTicket);
                }
            }
            // If no ticket is selected and we have tickets, select the first one
            else if (data.tickets && data.tickets.length > 0) {
                setSelectedTicket(data.tickets[0]);
            }
        } catch (err) {
            console.error('Error fetching tickets:', err);
            setError(err.message);
            setTickets([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            getUserTickets();
        }
    }, [userId]);

    // Add this function to handle message sending
    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedTicket) return;

        try {
            setIsSending(true);
            const response = await fetch('/api/user/create/ticket/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ticketId: selectedTicket.ticket_id,
                    message: messageText.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            // Update the local state with the new message
            setSelectedTicket((prev) => ({
                ...prev,
                messages: [...(prev.messages || []), data.data],
            }));

            // Clear the input
            setMessageText('');

            // Refresh tickets but maintain selected ticket
            await getUserTickets();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    // Filter tickets based on active tab
    const filteredTickets = tickets.filter((ticket) => {
        if (activeTab === 'open') {
            return !ticket.resolved;
        }
        return ticket.resolved;
    });

    const handleResolveTicket = async () => {
        if (!selectedTicket) return;

        try {
            setIsResolving(true);
            const response = await fetch(`/api/user/tickets/resolve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ticketId: selectedTicket.ticket_id,
                    resolved: !selectedTicket.resolved,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update ticket status');
            }

            // Refresh tickets
            await getUserTickets();

            toast({
                variant: 'success',
                title: 'Ticket Updated',
                description: `Ticket has been ${selectedTicket.resolved ? 'reopened' : 'resolved'} successfully.`,
            });
        } catch (error) {
            console.error('Error updating ticket:', error);
            toast({
                title: 'Error',
                description: 'Failed to update ticket status. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsResolving(false);
        }
    };

    const openTicketsCount = tickets.filter((ticket) => !ticket.resolved).length;

    return (
        <div className="h-full">
            <div className="h-full">
                <div className="space-y-4 h-full">
                    <div className="flex h-[100%] bg-gray-50 dark:bg-background">
                        {/* Left sidebar */}
                        <div className="w-80 bg-white dark:bg-card border-r border-gray-200 dark:border-border flex flex-col">
                            <div className="p-3 border-b border-gray-200 dark:border-border">
                                <h2 className="text-base font-semibold mb-2 flex items-center text-foreground">
                                    {t('supportPage.title')}
                                    <span className="bg-gray-100 dark:bg-secondary text-gray-600 dark:text-gray-400 text-xs py-0.5 px-1.5 rounded-full ml-2">{openTicketsCount}</span>
                                </h2>
                                <div className="relative">
                                    <Input type="text" placeholder={t('supportPage.search.placeholder')} className="w-full text-xs pl-8" />
                                    <Search className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                                </div>
                                <div className="mt-2">
                                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                        <TabsList className="grid w-full grid-cols-2">
                                            <TabsTrigger value="open">
                                                {t('supportPage.tabs.open')} ({openTicketsCount})
                                            </TabsTrigger>
                                            <TabsTrigger value="resolved">
                                                {t('supportPage.tabs.resolved')} ({tickets.length - openTicketsCount})
                                            </TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {isLoading && <div className="p-4 text-foreground">{t('supportPage.messages.loading')}</div>}
                                {error && <div className="p-4 text-red-500">Error: {error}</div>}
                                {!isLoading && !error && filteredTickets.length === 0 && <div className="p-4 text-muted-foreground">{t('supportPage.messages.noTickets', { status: activeTab })}</div>}
                                {!isLoading &&
                                    !error &&
                                    filteredTickets.length > 0 &&
                                    filteredTickets.map((ticket) => {
                                        const lastMessage = ticket.messages && ticket.messages.length > 0 ? ticket.messages[ticket.messages.length - 1] : null;
                                        const isSelected = selectedTicket?.ticket_id === ticket.ticket_id;

                                        return (
                                            <div
                                                key={ticket.ticket_id}
                                                className={`flex items-start p-3 cursor-pointer border-b dark:border-border hover:bg-gray-50 dark:hover:bg-secondary/50
                                                ${!ticket.isRead ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-white dark:bg-card'}
                                                ${isSelected ? 'bg-gray-100 dark:bg-secondary border-l-4 border-blue-500' : ''}`}
                                                onClick={() => setSelectedTicket(ticket)}>
                                                <Avatar className="h-8 w-8 mr-2">
                                                    <AvatarFallback>{ticket.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline">
                                                        <h3 className={`font-medium text-xs truncate ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}`}>{ticket.name}</h3>
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0 ml-1">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-[10px] text-blue-600 dark:text-blue-400 mb-0.5 truncate">
                                                        {ticket.resolved ? t('supportPage.ticket.status.resolved') : t('supportPage.ticket.status.open')}
                                                    </p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{lastMessage ? lastMessage.body : t('supportPage.ticket.noMessages')}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 flex-col h-full">
                            {/* Top bar */}
                            <div className="bg-white dark:bg-card p-3 border-b border-gray-200 dark:border-border flex justify-between items-center">
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">{selectedTicket?.name}</h2>
                                    <p className="text-xs text-blue-600 dark:text-blue-400">{t('supportPage.ticket.id', { id: selectedTicket?.id })}</p>
                                </div>
                                <div className="flex gap-2">
                                    {selectedTicket && (
                                        <Button variant="outline" size="sm" className="text-xs h-7 px-2" onClick={handleResolveTicket} disabled={isResolving}>
                                            {isResolving ? (
                                                <>
                                                    <span className="animate-spin mr-2">⏳</span>
                                                    {selectedTicket.resolved ? t('supportPage.ticket.actions.reopening') : t('supportPage.ticket.actions.resolving')}
                                                </>
                                            ) : selectedTicket.resolved ? (
                                                t('supportPage.ticket.actions.reopen')
                                            ) : (
                                                t('supportPage.ticket.actions.resolve')
                                            )}
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[670px] scrollbar-hide">
                                {selectedTicket?.messages?.map((message) => (
                                    <div key={message.id} className={`flex justify-${message.isAdmin ? 'end' : 'start'}`}>
                                        <Card className={`max-w-[70%] rounded-md ${message.isAdmin ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-white dark:bg-card'}`}>
                                            <CardContent className="p-2">
                                                <div className="flex items-start">
                                                    {!message.isAdmin && (
                                                        <Avatar className="h-6 w-6 mr-2">
                                                            <AvatarFallback>{selectedTicket.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-medium text-foreground">{message.isAdmin ? t('supportPage.messages.supportTeam') : selectedTicket.name}</p>
                                                        <p className="text-xs text-foreground">{message.subject}</p>
                                                        <p className="text-xs text-foreground">{message.body}</p>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{new Date(message.date).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>

                            {/* Message input */}
                            <div className="bg-white dark:bg-card border-t border-gray-200 dark:border-border p-3">
                                <Textarea
                                    placeholder={t('supportPage.messages.inputPlaceholder')}
                                    className="w-full mb-2 text-xs"
                                    rows={3}
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    disabled={isSending}
                                />
                                <div className="flex justify-between items-center">
                                    <Button size="sm" className="text-xs h-7 px-2" onClick={handleSendMessage} disabled={isSending || !messageText.trim()}>
                                        {isSending ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                {t('supportPage.messages.sending')}
                                            </>
                                        ) : (
                                            <>
                                                {t('supportPage.messages.send')}
                                                <ChevronDown className="ml-1 h-3 w-3" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
