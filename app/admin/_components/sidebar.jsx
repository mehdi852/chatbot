'use client';
// components/Sidebar.js
import { useEffect, useState } from 'react';
import { Bell, Users2Icon, ChevronDown, HelpCircle, Home, Layers, CheckSquare, Mail, Users, LogOut, PlusCircle, Settings, Plus, UsersIcon, Inbox, MailWarning, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function AdminSidebar() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    // add a use state that holds the items in the sidebar for  top and bottom it should be a seperated state
    const [SidebarTopitems, setSidebarTopItems] = useState([
        {
            name: 'home',
            icon: Home,
            iconRight: null,
            link: '/admin',
            active: true,
        },
        {
            name: 'usersManager',
            icon: Users2Icon,
            iconRight: null,
            link: '/admin/users/manager',
            active: false,
        },
        {
            name: 'subscriptions',
            icon: CheckSquare,
            iconRight: PlusCircle,
            link: '/admin/subscriptions',
            active: false,
        },
        {
            name: 'tickets',
            icon: Inbox,
            iconRight: MailWarning,
            link: '/admin/tickets',
            active: false,
        },
        {
            name: 'settings',
            icon: Settings,
            iconRight: null,
            link: '/admin/settings',
            active: false,
        },
        {
            name: 'pageBuilder',
            icon: Layers,
            iconRight: null,
            link: '/admin/page-builder',
            active: false,
        },
        {
            name: 'newsletter',
            icon: Mail,
            iconRight: null,
            link: '/admin/newsletter',
            active: false,
        },
    ]);
    const [bottomSidebarItems, setBottomSidebarItems] = useState([
        {
            name: 'logout',
            icon: LogOut,
            iconRight: null,
            link: '/dashboard/logout',
            active: false,
        },
    ]);

    // need to check the path of the url and set the active state

    useEffect(() => {
        const currentPath = window.location.pathname;
        setSidebarTopItems((prevItems) =>
            prevItems.map((item) => {
                return item.link === currentPath ? { ...item, active: true } : { ...item, active: false };
            })
        );
    }, []);

    // on sidebar click change the active state
    const handleSidebarItemClick = (item) => {
        setSidebarTopItems((prevItems) =>
            prevItems.map((prevItem) => {
                return prevItem.name === item.name ? { ...prevItem, active: true } : { ...prevItem, active: false };
            })
        );
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {!isOpen && (
                <button className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-background rounded-md shadow-md" onClick={toggleSidebar}>
                    <Menu className="w-6 h-6" />
                </button>
            )}
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
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent ${
                                    item.active ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground'
                                }`}>
                                <item.icon className={`w-5 h-5 mr-3 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                                {t(`sidebar.admin.items.${item.name}`)}
                                {item.iconRight && <item.iconRight className={`w-4 h-4 ml-auto ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />}
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-auto">
                        {bottomSidebarItems.map((item, index) => (
                            <a
                                href={item.link}
                                key={index}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent ${
                                    item.active ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground'
                                }`}>
                                <item.icon className={`w-5 h-5 mr-3 ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />
                                {t(`sidebar.admin.${item.name}`)}
                                {item.iconRight && <item.iconRight className={`w-4 h-4 ml-auto ${item.active ? 'text-primary' : 'text-muted-foreground'}`} />}
                            </a>
                        ))}
                    </div>
                </div>
            </aside>
        </>
    );
}
