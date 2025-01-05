'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Linkedin, Youtube, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function Footer() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [socialLinks, setSocialLinks] = useState([]);
    const [footerLinks, setFooterLinks] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [generalSettings, setGeneralSettings] = useState({
        siteTitle: '',
        siteDescription: '',
        siteKeywords: '',
        address: '',
        phone: '',
        email: '',
        logoUrl: '',
    });

    async function fetchGeneralSettings() {
        try {
            const response = await fetch('/api/public/get-general-settings');
            const data = await response.json();
            setGeneralSettings(data.generalSettings);
        } catch (error) {
            console.error('Failed to fetch general settings:', error);
        }
    }

    async function fetchSocialLinks() {
        try {
            const response = await fetch('/api/public/get-social-links');
            const data = await response.json();
            setSocialLinks(data);
        } catch (error) {
            console.error('Failed to fetch social links:', error);
        }
    }

    async function fetchFooterLinks() {
        try {
            const response = await fetch('/api/public/get-footer-links');
            const data = await response.json();
            setFooterLinks(data);
        } catch (error) {
            console.error('Failed to fetch footer links:', error);
        }
    }

    useEffect(() => {
        fetchSocialLinks();
        fetchFooterLinks();
        fetchGeneralSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/public/news-letter-subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            setSuccess(t('footer.newsletter.success'));
            setEmail('');
        } catch (err) {
            setError(t('footer.newsletter.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <footer className="bg-gradient-to-b from-muted to-background border-t border-border">
            {/* Newsletter Section */}
            <motion.div initial="initial" whileInView="animate" viewport={{ once: true }} variants={staggerContainer} className="max-w-7xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8">
                <motion.div variants={fadeInUp} className="max-w-xl mx-auto text-center mb-12">
                    <span className="inline-block px-4 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">{t('footer.newsletter.title')}</span>
                    <h3 className="text-3xl font-bold text-foreground mb-4">{t('footer.newsletter.heading')}</h3>
                    <p className="text-muted-foreground mb-8">{t('footer.newsletter.description')}</p>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <div className="relative flex-grow">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                                <input
                                    type="email"
                                    placeholder={t('footer.newsletter.placeholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-70">
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('footer.newsletter.subscribing')}
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        {t('footer.newsletter.button')}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </span>
                                )}
                            </motion.button>
                        </div>
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 max-w-md mx-auto">
                                    <p className="text-destructive text-sm">{error}</p>
                                </motion.div>
                            )}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-primary/10 border border-primary/20 rounded-lg p-3 max-w-md mx-auto">
                                    <p className="text-primary text-sm">{success}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </motion.div>

                {/* Main Footer Content */}
                <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-12 border-t border-border">
                    {/* Company Info */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-2">
                        <Link href="/" className="inline-block mb-6 transform hover:scale-105 transition-transform duration-200 relative">
                            <div className="absolute inset-0 dark:bg-white opacity-0 dark:opacity-100 rounded-md transition-opacity duration-300 ease-in-out" />
                            <Image src="/uploads/logo.png" width={120} height={120} alt="Logo" className="relative mr-2 p-2 transition-all duration-300" />
                        </Link>
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <MapPin className="text-muted-foreground h-5 w-5 mt-1" />
                                <div>
                                    <p className="text-foreground font-medium">{t('footer.company.headquarters')}</p>
                                    <p className="text-muted-foreground">{generalSettings.address}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="text-muted-foreground h-5 w-5" />
                                <p className="text-muted-foreground">{generalSettings.phone}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail className="text-muted-foreground h-5 w-5" />
                                <p className="text-muted-foreground">{generalSettings.email}</p>
                            </div>
                            <div className="flex space-x-4 pt-4">
                                {socialLinks.map((link) => (
                                    <motion.div key={link.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                        <Link href={link.url} aria-label={link.name} className="bg-muted p-2 rounded-lg hover:bg-accent transition-colors duration-200 inline-block">
                                            <Image src={link.image_url} height={20} width={20} alt={link.name} className="w-5 h-5" />
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-6">{t('footer.sections.sitemap')}</h4>
                        <ul className="space-y-3">
                            {footerLinks.sitemapLinks?.map((link) => (
                                <motion.li key={link.url} whileHover={{ x: 2 }} className="transform transition-transform">
                                    <Link href={link.url} className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center">
                                        <span className="mr-2 text-primary">›</span>
                                        {link.name}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-6">{t('footer.sections.company')}</h4>
                        <ul className="space-y-3">
                            {footerLinks.companyLinks?.map((link) => (
                                <motion.li key={link.url} whileHover={{ x: 2 }} className="transform transition-transform">
                                    <Link href={link.url} className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center">
                                        <span className="mr-2 text-primary">›</span>
                                        {link.name}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Bottom Bar */}
                <motion.div variants={fadeInUp} className="mt-16 pt-8 border-t border-border">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <p className="text-muted-foreground text-sm">{t('footer.legal.copyright', { year: new Date().getFullYear() })}</p>
                        <div className="flex flex-wrap justify-center md:justify-end gap-6">
                            <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">
                                {t('footer.legal.privacy')}
                            </Link>
                            <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">
                                {t('footer.legal.terms')}
                            </Link>
                            <Link href="/cookies" className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200">
                                {t('footer.legal.cookies')}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </footer>
    );
}
