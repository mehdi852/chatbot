'use client';
// components/Sidebar.js
import { useEffect, useState } from 'react';
import { Bell, Users2Icon, ChevronDown, HelpCircle, Home, Layers, CheckSquare,Mail, Users, LogOut, PlusCircle, Settings, Plus, UsersIcon,Inbox,MailWarning, Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    // add a use state that holds the items in the sidebar for  top and bottom it should be a seperated state
    const [SidebarTopitems, setSidebarTopItems] = useState([
        {
            name: 'Home',
            icon: Home,
            iconRight: null,
            link: '/demo',
            active: true,
        },
        {
            name: 'Users Manager',
            icon: Users2Icon,
            iconRight: null,
            link: '/demo/users/manager',
            active: false,
        },
        {
            name: 'Subscriptions',
            icon: CheckSquare,
            iconRight: PlusCircle,
            link: '/demo/subscriptions',
            active: false,
        },

        {
            name: 'Tickets',
            icon: Inbox,
            iconRight: null,
            link: '/demo/tickets',
            active: false,
            iconRight: MailWarning,
        },
        {
            name: 'Settings',
            icon: Settings,
            iconRight: null,
            link: '/demo/settings',
            active: false,
        },
        {
            name: 'Page Builder',
            icon: Layers,
            iconRight: null,
            link: '/demo/page-builder',
            active: false,
        },
        {
            name: 'Newsletter',
            icon: Mail,
            iconRight: null,
            link: '/demo/newsletter',
            active: false,
        },
    ]);
    const [bottomSidebarItems, setBottomSidebarItems] = useState([
     
        {
            name: 'Log Out',
            icon: LogOut,
            iconRight: null,
            link: '/dashboard/logout',
            active: false,
        }
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
                <button
                    className="lg:hidden fixed top-4 left-4 z-20 p-2 bg-white rounded-md shadow-md"
                    onClick={toggleSidebar}
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}
            <aside className={`fixed inset-y-0 left-0 z-10 w-64 bg-white p-4 lg:p-6 flex flex-col border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                       <a href="/"><Image src="/uploads/logo.png" width={100} height={100} alt="Logo" className="mr-2" /></a>
                    </div>
                    <button
                        className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                        onClick={toggleSidebar}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <nav className="flex-1 space-y-1">
                    {SidebarTopitems.map((item, index) => (
                        <Link
                            onClick={() => handleSidebarItemClick(item)}
                            href={item.link}
                            key={index}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 ${
                                item.active ? 'bg-blue-50 text-blue-600 hover:bg-blue-50  ' : 'text-gray-600 hover:bg-gray-50 '
                            }`}>
                            <item.icon className={`w-5 h-5 mr-3 ${item.active ? 'text-blue-600' : 'text-gray-400'} group-hover:text-gray-500`} />
                            {item.name}

                            {item.iconRight && <item.iconRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-500" />}
                        </Link>
                    ))}
                </nav>
                <div className="mt-auto">
                  

                    {bottomSidebarItems.map((item, index) => (
                        <a
                            href={item.link}
                            key={index}
                            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-50 ${
                                item.active ? 'bg-blue-50 text-blue-600 hover:bg-blue-50  ' : 'text-gray-600 hover:bg-gray-50 '
                            }`}>
                            <item.icon className={`w-5 h-5 mr-3 ${item.active ? 'text-blue-600' : 'text-gray-400'} group-hover:text-gray-500`} />
                            {item.name}

                            {item.iconRight && <item.iconRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-500" />}
                        </a>
                    ))}
                </div>
            </aside>
        </>
    );
}
