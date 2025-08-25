'use client';
import { CustomUserButton } from '@/components/ui/custom-user-button';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Bell, MessageSquare, CheckCircle2, Info, AlertCircle, MoreHorizontal, Check, ChevronDown, Filter, Clock, ArrowUpRight, ArrowRight, Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTranslation } from 'react-i18next';
import LanguagePicker from '@/components/LanguagePicker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, formatDistanceToNow } from 'date-fns';
import { useUserContext } from '@/app/provider';

function Header() {
    const { user } = useUser();
    const { dbUser } = useUserContext();
    const [isAdmin, setIsAdmin] = React.useState(false);
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch real notifications from the API
    const fetchNotifications = async () => {
        if (!dbUser || !dbUser.id) return;

        setIsLoading(true);
        try {
            const typeParam = activeTab !== 'all' && activeTab !== 'unread' ? `&type=${activeTab}` : '';
            const unreadParam = activeTab === 'unread' ? '&unreadOnly=true' : '';

            console.log(`Fetching notifications for user ID: ${dbUser.id}`);
            const response = await fetch(`/api/notifications?userId=${dbUser.id}${typeParam}${unreadParam}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                console.error('Error response from notifications API:', errorData);
                throw new Error(errorData.error || `Failed to fetch notifications: ${response.status}`);
            }

            const data = await response.json();
            console.log('Notifications data received:', data);

            if (!data || !Array.isArray(data.notifications)) {
                console.error('Invalid notifications data format:', data);
                throw new Error('Invalid response format from server');
            }

            setNotifications(data.notifications);
            setUnreadCount(data.pagination.unreadCount);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // If API fails, show error notification as fallback
            setNotifications([
                {
                    id: 1,
                    title: 'Error loading notifications',
                    description: error.message || 'Please try again later',
                    time: new Date(),
                    read: false,
                    type: 'alert',
                    priority: 'high',
                },
            ]);
            setUnreadCount(0);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch notifications when activeTab changes or when dbUser is available
    useEffect(() => {
        if (dbUser && dbUser.id) {
            fetchNotifications();
        }
    }, [activeTab, dbUser]);

    // No real-time socket connection - notifications will be fetched on page refresh

    const checkIfAdmin = async () => {
        try {
            const response = await fetch('/api/check-admin');
            const data = await response.json();
            return data.isAdmin;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    };

    useEffect(() => {
        if (user) {
            checkIfAdmin().then((result) => {
                setIsAdmin(result);
            });
        }
    }, [user]);

    const markAsRead = async (id) => {
        if (!dbUser || !dbUser.id) return;

        try {
            // Optimistically update UI
            setNotifications(notifications.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)));
            setUnreadCount((prev) => Math.max(0, prev - 1));

            // Send request to mark as read
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: dbUser.id,
                    notificationId: id,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert changes if failed
            fetchNotifications();
        }
    };

    const markAllAsRead = async () => {
        if (!dbUser || !dbUser.id) return;

        try {
            // Optimistically update UI
            setNotifications(notifications.map((notification) => ({ ...notification, read: true })));
            setUnreadCount(0);

            // Send request to mark all as read
            const response = await fetch('/api/notifications', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: dbUser.id,
                    markAllRead: true,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to mark all notifications as read');
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            // Revert changes if failed
            fetchNotifications();
        }
    };

    const getNotificationIcon = (type, priority) => {
        switch (type) {
            case 'message':
                return <MessageSquare className={cn('h-5 w-5', priority === 'high' ? 'text-blue-500' : 'text-blue-400')} />;
            case 'task':
                return <CheckCircle2 className={cn('h-5 w-5', priority === 'high' ? 'text-green-500' : 'text-green-400')} />;
            case 'system':
                return <Info className={cn('h-5 w-5', priority === 'high' ? 'text-indigo-500' : 'text-indigo-400')} />;
            case 'alert':
                return <AlertCircle className={cn('h-5 w-5', priority === 'critical' ? 'text-red-500' : priority === 'high' ? 'text-orange-500' : 'text-red-400')} />;
            case 'info':
                return <Info className={cn('h-5 w-5', priority === 'medium' ? 'text-orange-500' : 'text-orange-400')} />;
            default:
                return <Bell className="h-5 w-5 text-gray-400" />;
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'critical':
                return (
                    <Badge variant="destructive" className="text-xs font-medium">
                        Critical
                    </Badge>
                );
            case 'high':
                return (
                    <Badge variant="destructive" className="text-xs font-medium bg-orange-500">
                        High
                    </Badge>
                );
            case 'medium':
                return (
                    <Badge variant="outline" className="text-xs font-medium text-blue-500 border-blue-500">
                        Medium
                    </Badge>
                );
            case 'low':
                return (
                    <Badge variant="outline" className="text-xs font-medium text-gray-500">
                        Low
                    </Badge>
                );
            default:
                return null;
        }
    };

    const formatNotificationTime = (time) => {
        const now = new Date();
        const notificationDate = new Date(time);

        // If notification is from today
        if (notificationDate.toDateString() === now.toDateString()) {
            return formatDistanceToNow(notificationDate, { addSuffix: true });
        }
        // If notification is from this week
        else if (now.getTime() - notificationDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
            return format(notificationDate, 'EEEE, h:mm a');
        }
        // Older notifications
        else {
            return format(notificationDate, 'MMM d, yyyy');
        }
    };

    const filteredNotifications = notifications;

    return (
        <div className="flex justify-between items-center h-14 w-full border-b border-border bg-card/80 backdrop-blur-sm py-2 px-4 lg:px-6">
            {/* Left side */}
            <div className=""></div>
            {/* Right side */}
            <div className="flex justify-center items-center gap-4">
                <LanguagePicker />
                <ThemeToggle />

                {/* Notification Button */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn(
                                'relative transition-all duration-300 ease-in-out border-border/60',
                                // When there are notifications
                                unreadCount > 0 && [
                                    'ring-2 ring-offset-1 ring-primary/25 dark:ring-primary/35',
                                    'hover:ring-primary/40 dark:hover:ring-primary/50',
                                    'hover:bg-primary/15 dark:hover:bg-primary/20',
                                    'hover:border-primary/30 dark:hover:border-primary/40',
                                    'after:absolute after:w-full after:h-full after:rounded-full after:animate-ping after:bg-primary/10 after:top-0 after:left-0 after:z-0'
                                ],
                                // When there are no notifications
                                unreadCount === 0 && [
                                    'hover:bg-muted/80 dark:hover:bg-muted/60',
                                    'hover:border-muted-foreground/20 dark:hover:border-muted-foreground/30'
                                ]
                            )}>
                            <span className="relative z-10">
                                <Bell className={cn(
                                    'h-[18px] w-[18px] transition-colors duration-300',
                                    unreadCount > 0 ? 'text-primary hover:text-primary/80' : 'text-muted-foreground hover:text-foreground'
                                )} />
                            </span>
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold shadow-sm border border-background">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[420px] p-0 shadow-lg border border-border/50 rounded-xl overflow-hidden" align="end">
                        <div className="flex flex-col">
                            {/* Header with tabs and actions */}
                            <div className="px-4 pt-3 pb-0 border-b border-border/60 flex flex-col space-y-3 bg-card/90 backdrop-blur-sm sticky top-0 z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-lg tracking-tight">{t('Notifications')}</h4>
                                        {unreadCount > 0 && (
                                            <Badge variant="default" className="h-5 px-1.5 text-[10px] font-semibold">
                                                {unreadCount} {t('new')}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {unreadCount > 0 && (
                                            <Button variant="ghost" size="sm" className="text-xs h-8 px-2 text-primary hover:text-primary hover:bg-primary/10" onClick={markAllAsRead}>
                                                <Check className="h-3.5 w-3.5 mr-1.5" />
                                                {t('Mark all read')}
                                            </Button>
                                        )}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[200px]">
                                                <DropdownMenuItem className="text-xs cursor-pointer gap-2">
                                                    <Filter className="h-4 w-4" />
                                                    {t('Notification settings')}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-xs cursor-pointer gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    {t('View notification history')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Tabs for filtering */}
                                <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab} value={activeTab}>
                                    <TabsList className="grid grid-cols-5 h-9 bg-muted/50 p-0.5 rounded-md">
                                        <TabsTrigger value="all" className="text-xs rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            {t('All')}
                                        </TabsTrigger>
                                        <TabsTrigger value="unread" className="text-xs rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            {t('Unread')}
                                        </TabsTrigger>
                                        <TabsTrigger value="message" className="text-xs rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            {t('Messages')}
                                        </TabsTrigger>
                                        <TabsTrigger value="alert" className="text-xs rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            {t('Alerts')}
                                        </TabsTrigger>
                                        <TabsTrigger value="system" className="text-xs rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                            {t('System')}
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {/* Notification list */}
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                    <div className="relative h-10 w-10 mb-4">
                                        <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <div className="absolute inset-1.5 border-2 border-muted-foreground/30 border-b-transparent rounded-full animate-spin animation-delay-200"></div>
                                    </div>
                                    <p className="text-sm font-medium text-foreground">{t('Loading notifications...')}</p>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">{t('Please wait while we fetch your latest notifications')}</p>
                                </div>
                            ) : filteredNotifications.length > 0 ? (
                                <ScrollArea className="h-[max(400px,min(calc(100vh-250px),600px))] overflow-y-auto">
                                    <div className="flex flex-col divide-y divide-border">
                                        {filteredNotifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className={cn(
                                                    'px-4 py-3.5 cursor-pointer transition-all duration-200 group hover:bg-primary/10 relative overflow-hidden',
                                                    !notification.read && 'bg-primary/[0.03] dark:bg-primary/[0.07]',
                                                    !notification.read && 'after:absolute after:left-0 after:top-0 after:h-full after:w-1 after:bg-primary',
                                                    notification.priority === 'critical' && !notification.read && 'bg-red-50/60 dark:bg-red-900/10 after:bg-red-500'
                                                )}
                                                onClick={() => markAsRead(notification.id)}>
                                                <div className="flex gap-3">
                                                    {/* Icon or avatar */}
                                                    <div
                                                        className={cn(
                                                            'h-11 w-11 rounded-full flex items-center justify-center shrink-0',
                                                            notification.read ? 'bg-muted' : 'bg-primary/10 dark:bg-primary/20'
                                                        )}>
                                                        {notification.sender_avatar ? (
                                                            <img
                                                                src={notification.sender_avatar}
                                                                alt={notification.sender_name || 'User'}
                                                                className="h-11 w-11 rounded-full object-cover ring-2 ring-background"
                                                            />
                                                        ) : (
                                                            <div
                                                                className={cn(
                                                                    'h-11 w-11 rounded-full flex items-center justify-center',
                                                                    notification.priority === 'critical'
                                                                        ? 'text-red-500 bg-red-100 dark:bg-red-900/30'
                                                                        : notification.priority === 'high'
                                                                        ? 'text-orange-500 bg-orange-100 dark:bg-orange-900/30'
                                                                        : 'text-primary bg-primary/10'
                                                                )}>
                                                                {getNotificationIcon(notification.type, notification.priority)}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2 mb-0.5">
                                                            <h5 className={cn('text-sm line-clamp-1 pr-6', !notification.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/90')}>
                                                                {notification.title}
                                                            </h5>
                                                            {!notification.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5"></div>}
                                                        </div>

                                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-1.5 leading-relaxed">{notification.description}</p>

                                                        <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5">
                                                            <span className="text-xs text-muted-foreground/90 flex items-center space-x-1">
                                                                <Clock className="h-3 w-3 inline" />
                                                                <span>{formatNotificationTime(notification.created_at || notification.time)}</span>
                                                            </span>

                                                            <div className="flex items-center gap-2">
                                                                {getPriorityBadge(notification.priority)}
                                                                <Badge variant="outline" className="text-[10px] h-5 font-medium bg-background/50 hover:bg-background">
                                                                    {notification.type}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action button that shows on hover */}
                                                <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-background">
                                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[160px]">
                                                            <DropdownMenuItem
                                                                className="text-xs cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    markAsRead(notification.id);
                                                                }}>
                                                                <Check className="h-3.5 w-3.5 mr-2" />
                                                                {notification.read ? t('Mark as unread') : t('Mark as read')}
                                                            </DropdownMenuItem>
                                                            {notification.action_url && (
                                                                <DropdownMenuItem
                                                                    className="text-xs cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        window.open(notification.action_url, '_blank');
                                                                    }}>
                                                                    <ArrowUpRight className="h-3.5 w-3.5 mr-2" />
                                                                    {t('Open in new tab')}
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                                    <div className="h-16 w-16 rounded-full bg-muted/80 flex items-center justify-center mb-4">
                                        <Bell className="h-8 w-8 text-muted-foreground/60" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1 text-foreground">{t('No notifications')}</h3>
                                    <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                                        {activeTab !== 'all' ? t('No notifications match your current filter') : t('When you receive notifications, they will appear here')}
                                    </p>
                                </div>
                            )}

                            {/* Footer */}
                            {filteredNotifications.length > 0 && !isLoading && (
                                <div className="p-3 border-t border-border bg-card/90 backdrop-blur-sm sticky bottom-0">
                                    <Button
                                        variant="outline"
                                        className="w-full text-sm h-9 bg-background hover:bg-background/90 flex items-center justify-center gap-1.5 font-medium"
                                        onClick={() => (window.location.href = '/notifications')}>
                                        {t('View all notifications')}
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                {isAdmin && (
                    <Button
                        variant="outline"
                        onClick={() => {
                            window.location.href = '/admin';
                        }}>
                        Admin
                    </Button>
                )}
                <CustomUserButton
                    appearance={{
                        elements: {
                            avatarBox: 'w-8 h-8',
                        },
                    }}
                />
            </div>
        </div>
    );
}

export default Header;
