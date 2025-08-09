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
import LanguagePicker from '@/components/LanguagePicker';
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

    const changeLanguage = (e) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
    };

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
            category: t('navbar.menu.solutions.coreFeatures'),
            items: [
                {
                    icon: MessageSquare,
                    title: t('navbar.menu.solutions.smartPopups.title'),
                    desc: t('navbar.menu.solutions.smartPopups.desc'),
                    pro: true,
                },
                {
                    icon: BarChart2,
                    title: t('navbar.menu.solutions.analytics.title'),
                    desc: t('navbar.menu.solutions.analytics.desc'),
                },
                {
                    icon: Target,
                    title: t('navbar.menu.solutions.targeting.title'),
                    desc: t('navbar.menu.solutions.targeting.desc'),
                },
            ],
        },
        {
            category: t('navbar.menu.solutions.advancedTools'),
            items: [
                {
                    icon: Split,
                    title: t('navbar.menu.solutions.splitTesting.title'),
                    desc: t('navbar.menu.solutions.splitTesting.desc'),
                },
                {
                    icon: Shield,
                    title: t('navbar.menu.solutions.security.title'),
                    desc: t('navbar.menu.solutions.security.desc'),
                },
                {
                    icon: Zap,
                    title: t('navbar.menu.solutions.performance.title'),
                    desc: t('navbar.menu.solutions.performance.desc'),
                },
            ],
        },
    ];

    const dropdownVariants = {
        hidden: { opacity: 0, y: -5 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    };

    const renderDropdownContent = (items) => (
        <MotionDiv initial="hidden" animate="visible" exit="hidden" variants={dropdownVariants} className="absolute top-full left-0 w-[800px] mt-1 bg-card rounded-lg shadow-lg ring-1 ring-border p-6">
            <div className="grid grid-cols-2 gap-8">
                {items.map((category, idx) => (
                    <div key={idx} className="space-y-4">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">{category.category}</h3>
                        <div className="space-y-2">
                            {category.items.map((item, index) => (
                                <Link key={index} href="#" className="group flex items-start p-3 rounded-lg hover:bg-muted transition-all duration-200">
                                    <div className="flex-shrink-0 bg-primary/10 rounded-lg p-3 mr-4 group-hover:scale-105 transition-transform">
                                        <item.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-sm text-foreground">{item.title}</h3>
                                            {item.pro && <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">Enterprise</span>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
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

                        {pages.map((page) => (
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
                            <LanguagePicker />
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
                                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('navbar.solutions')}</p>
                                {solutions
                                    .flatMap((category) => category.items)
                                    .map((item, index) => (
                                        <Link key={index} href="#" className="flex items-center px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md">
                                            <item.icon className="h-5 w-5 mr-3 text-muted-foreground" />
                                            {item.title}
                                        </Link>
                                    ))}
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
