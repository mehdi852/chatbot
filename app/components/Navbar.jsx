'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, BarChart2, MessageSquare, Target, Split, Puzzle, MessageCircle, Settings, Users, Shield, Zap, BookOpen, HeartHandshake, Globe } from 'lucide-react';
import { CustomUserButton } from '@/components/ui/custom-user-button';
import { useUserContext } from '@/app/provider';
import { useAuth } from '@clerk/nextjs';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useTranslation } from 'react-i18next';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic import of motion components
const MotionDiv = dynamic(() => import('framer-motion').then((mod) => mod.motion.div), { ssr: false });
const AnimatePresenceClient = dynamic(() => import('framer-motion').then((mod) => mod.AnimatePresence), { ssr: false });

export default function Navbar() {
    const { t, i18n } = useTranslation();
    const { isSignedIn } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { dbUser } = useUserContext();
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [pages, setPages] = useState([]);
    const [isClient, setIsClient] = useState(false);
    const navRef = useRef(null);

    const fetchPages = async () => {
        try {
            const response = await fetch('/api/public/get-pages-names');
            const data = await response.json();
            setPages(data.pages);
        } catch (error) {
            console.error('Error fetching pages:', error);
        }
    };

    useEffect(() => {
        setIsClient(true);
        fetchPages();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setActiveDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const solutions = [
        {
            category: 'Chatbot Solutions',
            items: [
                {
                    icon: MessageCircle,
                    title: 'AI Chat Assistant',
                    desc: 'Intelligent conversations powered by advanced AI',
                    href: '/solutions#ai-chat',
                    badge: 'Popular'
                },
                {
                    icon: MessageSquare,
                    title: 'Live Chat Support',
                    desc: 'Seamless handoff between AI and human agents',
                    href: '/solutions#live-chat',
                },
                {
                    icon: Zap,
                    title: 'Smart Automation',
                    desc: 'Automate customer support and lead generation',
                    href: '/solutions#automation',
                },
                {
                    icon: Target,
                    title: 'Visitor Targeting',
                    desc: 'Show personalized messages based on user behavior',
                    href: '/solutions#targeting',
                },
                {
                    icon: BookOpen,
                    title: 'Knowledge Base',
                    desc: 'Train your AI with custom content and documents',
                    href: '/solutions#knowledge-base',
                    badge: 'New'
                },
                {
                    icon: Settings,
                    title: 'Customization',
                    desc: 'Personalize your chatbot appearance and behavior',
                    href: '/solutions#customization',
                },
            ],
        },
    ];

    const dropdownVariants = {
        hidden: { opacity: 0, y: -5 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    };

    const renderDropdownContent = (items) => (
        <MotionDiv 
            initial="hidden" 
            animate="visible" 
            exit="hidden" 
            variants={dropdownVariants} 
            className="absolute top-full left-0 w-[480px] mt-3 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-gray-200/50 dark:ring-gray-700/50 p-0 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden z-50"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 px-6 py-4 border-b border-gray-200/30 dark:border-gray-700/30">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                        {items[0].category}
                    </h3>
                </div>
            </div>

            {/* Solutions Grid */}
            <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                    {items[0].items.map((item, index) => (
                        <Link 
                            key={index} 
                            href={item.href || '#'} 
                            className="group relative flex flex-col p-4 rounded-xl bg-gray-50/50 hover:bg-white dark:bg-gray-800/30 dark:hover:bg-gray-800/60 transition-all duration-300 hover:shadow-lg border border-gray-200/30 dark:border-gray-700/30 hover:border-primary/30 hover:-translate-y-0.5"
                            onClick={() => setActiveDropdown(null)}
                        >
                            <div className="flex items-start gap-3 mb-2">
                                <div className="flex-shrink-0 bg-primary/10 dark:bg-primary/20 rounded-lg p-2.5 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                                    <item.icon className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors truncate">
                                            {item.title}
                                        </h4>
                                        {item.badge && (
                                            <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-1.5 py-0.5 rounded-md font-medium shadow-sm">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Footer CTA */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-t border-gray-200/30 dark:border-gray-700/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                            <MessageCircle className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Start building</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Create your first chatbot today</p>
                        </div>
                    </div>
                    <Link 
                        href="/dashboard" 
                        className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-105 active:scale-95"
                        onClick={() => setActiveDropdown(null)}
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </MotionDiv>
    );

    return (
        <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center relative">
                            <div className="absolute inset-0 dark:bg-white opacity-0 dark:opacity-100 rounded-md transition-opacity duration-300 ease-in-out" />
                            <Image src="/uploads/logo.png" alt="Brand Logo" width={135} height={100} className="relative transform hover:scale-105 transition-all duration-300 p-2" />
                        </Link>
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary">
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="hidden md:flex md:items-center md:space-x-8">
                        <Link href="/" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors">
                            {t('navbar.home')}
                        </Link>

                        <div className="relative">
                            <button
                                onClick={() => setActiveDropdown(activeDropdown === 'solutions' ? null : 'solutions')}
                                className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium inline-flex items-center gap-1 transition-colors">
                                {t('navbar.solutions')}
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
                            </button>
                            {isClient && (
                                <Suspense fallback={null}>
                                    <AnimatePresenceClient>{activeDropdown === 'solutions' && renderDropdownContent(solutions)}</AnimatePresenceClient>
                                </Suspense>
                            )}
                        </div>

                        <Link href="/pricing" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors">
                            {t('navbar.pricing')}
                        </Link>

                        <Link href="/contact" className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors">
                            Contact us
                        </Link>

                        { pages && pages.map((page) => (
                            <Link
                                key={page.id}
                                href={`/${page.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors">
                                {page.name.charAt(0).toUpperCase() + page.name.slice(1)}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden md:flex md:items-center md:space-x-4">
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                        </div>
                        {isSignedIn ? (
                            dbUser?.role === 'admin' ? (
                                <div className="flex items-center gap-3">
                                    <CustomUserButton afterSignOutUrl="/" />
                                    <Link
                                        href="/admin"
                                        className="text-primary hover:text-primary/90 px-4 py-2 text-sm font-medium rounded-md border border-primary hover:bg-primary/10 transition-all duration-200 hover:shadow-sm">
                                        {t('navbar.adminPortal')}
                                    </Link>
                                    <Link
                                        href="/dashboard"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:shadow-md">
                                        {t('navbar.dashboard')}
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <CustomUserButton afterSignOutUrl="/" />
                                    <Link
                                        href="/dashboard"
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 hover:shadow-md">
                                        {t('navbar.dashboard')}
                                    </Link>
                                </div>
                            )
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/sign-in" className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm font-medium rounded-md hover:bg-accent transition-all duration-200">
                                    {t('navbar.signIn')}
                                </Link>
                                <Link
                                    href="/sign-up"
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:shadow-md">
                                    {t('navbar.startFreeTrial')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-card border-t border-border shadow-lg">
                        <div className="px-4 py-3 space-y-3">
                            <Link href="/" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md">
                                {t('navbar.home')}
                            </Link>
                            <Link href="/contact" className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md">
                                Contact us
                            </Link>
                            <div className="border-t border-border pt-2">
                                <div className="px-3 py-2 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('navbar.solutions')}</p>
                                </div>
                                {solutions
                                    .flatMap((category) => category.items)
                                    .map((item, index) => (
                                        <Link 
                                            key={index} 
                                            href={item.href || '#'} 
                                            className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md group"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <div className="bg-primary/10 rounded-lg p-2 mr-3 group-hover:scale-105 transition-transform">
                                                <item.icon className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{item.title}</span>
                                                    {item.pro && (
                                                        <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-medium">
                                                            Pro
                                                        </span>
                                                    )}
                                                    {item.badge && !item.pro && (
                                                        <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                <Link 
                                    href="/solutions" 
                                    className="mx-3 mt-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-center block"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    View All Solutions →
                                </Link>
                            </div>
                            {!isSignedIn && (
                                <div className="border-t border-border pt-4">
                                    <Link href="/sign-in" className="block w-full text-center px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md">
                                        {t('navbar.signIn')}
                                    </Link>
                                    <Link href="/sign-up" className="block w-full text-center px-4 py-2 mt-2 text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md">
                                        {t('navbar.startFreeTrial')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
