'use client';
import { useEffect, useState, useRef } from 'react';
import { Bell, ChartPie, ChevronDown, HelpCircle, Home, Layers, CheckSquare, Users, LogOut, PlusCircle, Settings, Plus, Menu, X, CreditCard, Mail, Volume2, VolumeX, Palette, BarChart3, MessageSquare, Bot, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useUserContext } from '@/app/provider';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import { useChatContext } from '@/app/contexts/ChatContext';

export default function Sidebar() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [openTicketCount, setOpenTicketCount] = useState(0);
    const { dbUser } = useUserContext();
    const { chatState, logout } = useChatContext();
    const [SidebarTopitems, setSidebarTopItems] = useState([
        {
            name: 'home',
            icon: Home,
            iconRight: null,
            link: '/dashboard',
            active: true,
        },
        {
            name: 'chat',
            icon: MessageCircle,
            iconRight: null,
            link: '/dashboard/chat',
            active: false,
            badge: 0,
        },
        {
            name: 'usage',
            icon: ChartPie,
            iconRight: null,
            link: '/dashboard/usage',
            active: false,
        },
        {
            name: 'widget-customization',
            icon: Palette,
            iconRight: null,
            link: '/dashboard/widget-customization',
            active: false,
        },
        {
            name: 'widget-template',
            icon: MessageSquare,
            iconRight: null,
            link: '/dashboard/widget-template',
            active: false,
        },
        {
            name: 'ai-agent',
            icon: Bot,
            iconRight: null,
            link: '/dashboard/ai-agent',
            active: false,
        },
        {
            name: 'leads',
            icon: UserCheck,
            iconRight: null,
            link: '/dashboard/leads',
            active: false,
        },
    ]);
    const [bottomSidebarItems, setBottomSidebarItems] = useState([
        {
            name: 'billing',
            icon: CreditCard,
            iconRight: null,
            link: '/dashboard/billing',
            active: false,
        },
        {
            name: 'logout',
            icon: LogOut,
            iconRight: null,
            link: '#',
            active: false,
            onClick: async () => {
                try {
                    // Cleanup chat sockets via context
                    if (typeof logout === 'function') {
                        logout();
                    }
                    
                    // Call the logout API to disconnect admin sockets
                    await fetch('/api/auth/logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    
                    console.log('Admin sockets disconnected');
                } catch (error) {
                    console.error('Error during logout:', error);
                } finally {
                    // Redirect to sign-in
                    window.location.href = '/sign-in';
                }
            },
        },
        {
            name: 'sound',
            icon: chatState.isSoundMuted ? VolumeX : Volume2,
            iconRight: null,
            link: '#',
            active: false,
            onClick: () => chatState.toggleSound(),
        },
    ]);

    const audioRef = useRef(null);
    const [prevMessageCount, setPrevMessageCount] = useState(0);

    // Fetch open ticket count
    const fetchOpenTicketCount = async () => {
        if (!dbUser) return;

        try {
            const response = await fetch(`/api/user/tickets/open/count?userId=${dbUser.id}`);
            if (response.ok) {
                const data = await response.json();
                setOpenTicketCount(data.count);
                setSidebarTopItems((prevItems) => prevItems.map((item) => (item.name === 'support' ? { ...item, badge: data.count } : item)));
            } else {
                console.error('Failed to fetch open ticket count:', await response.text());
            }
        } catch (error) {
            console.error('Error fetching open ticket count:', error);
        }
    };

    useEffect(() => {
        if (dbUser) {
            fetchOpenTicketCount();
        }

        const currentPath = window.location.pathname;
        setSidebarTopItems((prevItems) =>
            prevItems.map((item) => ({
                ...item,
                active: item.link === currentPath,
            }))
        );
    }, [dbUser]);

    useEffect(() => {
        setSidebarTopItems((prevItems) => prevItems.map((item) => (item.name === 'chat' ? { ...item, badge: chatState.visitors.length } : item)));
    }, [chatState.visitors.length]);

    useEffect(() => {
        audioRef.current = new Audio('/notification.mp3');
    }, []);

    useEffect(() => {
        const totalMessagesCount = Object.values(chatState.conversations).reduce((acc, conv) => acc + conv.messages.length, 0);

        if (totalMessagesCount > prevMessageCount && !chatState.isSoundMuted) {
            let latestMessage = null;
            Object.values(chatState.conversations).forEach((conv) => {
                conv.messages.forEach((msg) => {
                    if (!latestMessage || new Date(msg.timestamp) > new Date(latestMessage.timestamp)) {
                        latestMessage = msg;
                    }
                });
            });

            if (latestMessage?.type !== 'admin') {
                audioRef.current.play().catch(console.error);
            }
        }
        setPrevMessageCount(totalMessagesCount);
    }, [chatState.conversations, chatState.isSoundMuted]);

    const handleSidebarItemClick = (item) => {
        setSidebarTopItems((prevItems) =>
            prevItems.map((prevItem) => ({
                ...prevItem,
                active: prevItem.name === item.name,
            }))
        );
        setIsOpen(false);
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const renderUpgradeCard = () => {
        if (dbUser?.subscription) return null;
        return (
            <div className="bg-primary/10 rounded-lg p-4 mb-4 flex flex-col justify-center items-center">
                <h3 className="font-semibold mb-2 text-sm text-foreground">Upgrade to Pro</h3>
                <p className="text-xs text-muted-foreground mb-2 text-center">Unlock premium features and enhanced capabilities</p>
                <Link href="/dashboard/billing" className="bg-primary/20 text-primary px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/30 transition-colors">
                    Upgrade Now
                </Link>
            </div>
        );
    };

    return (
        <>
            <button className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-background rounded-md shadow-md" onClick={toggleSidebar}>
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <aside className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex flex-col h-full px-3 py-4 overflow-y-auto border-r bg-background">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <a href="/" className="relative">
                                <div className="absolute inset-0 dark:bg-white opacity-0 dark:opacity-100 rounded-md transition-opacity duration-300 ease-in-out" />
                                <Image src="/uploads/logo.png" width={100} height={100} alt="Logo" className="relative mr-2 p-2 transition-all duration-300" />
                            </a>
                        </div>
                        <button className="lg:hidden p-1 rounded-md hover:bg-accent" onClick={toggleSidebar}>
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="flex-1 space-y-1">
                        {SidebarTopitems.map((item, index) => (
                            <Link
                                onClick={() => handleSidebarItemClick(item)}
                                href={item.link}
                                key={index}
                                className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md hover:bg-accent ${
                                    item.active ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground'
                                }`}>
                                <div className="flex items-center">
                                    <item.icon className={`w-5 h-5 mr-3 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                                    {t(`sidebar.dashboard.items.${item.name}`)}
                                </div>
                                {item.badge > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs ring-1 ring-blue-200">{item.badge}</span>}
                                {item.iconRight && <item.iconRight className={`w-4 h-4 ml-auto ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />}
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-auto">
                        {renderUpgradeCard()}

                        {bottomSidebarItems.map((item, index) => (
                            <Link
                                href={item.link}
                                key={index}
                                onClick={(e) => {
                                    if (item.onClick) {
                                        e.preventDefault();
                                        item.onClick();
                                    }
                                }}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent ${
                                    item.active ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground'
                                }`}>
                                <item.icon className={`w-5 h-5 mr-3 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                                {item.name === 'logout' ? t(`sidebar.dashboard.${item.name}`) : t(`sidebar.dashboard.items.${item.name}`)}
                                {item.iconRight && <item.iconRight className={`w-4 h-4 ml-auto ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />}
                            </Link>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
}
