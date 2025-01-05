'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, MoreVertical, Pencil, Trash2, Loader2, Copy, Code2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from '@/app/provider';
import { useMetadata } from '@/app/contexts/MetadataContext';
import { checkSubscriptionFeature } from '@/utils/subscriptionUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';

function DndStyles() {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .fa-popup {
                transform-origin: 0 0;
                position: relative;
                z-index: 1;
            }

            .fa-popup[data-dragging="true"] {
                z-index: 999;
            }

            .path-container {
                overflow: visible !important;
                position: relative;
                z-index: 1;
            }

            [data-dnd-draggable-dragging] {
                z-index: 10000 !important;
                pointer-events: auto !important;
                position: fixed;
                width: var(--dnd-draggable-width);
                transform-origin: 0 0;
                touch-action: none;
                user-select: none;
            }

            .dnd-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 1;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    return null;
}

const generateSafeId = () => {
    return Math.floor(Math.random() * 999999) + 1;
};

export default function Dashboard() {
    
    const { t } = useTranslation();
    const { metadata } = useMetadata();
    const [isLoading, setIsLoading] = useState(true);
    const [websites, setWebsites] = useState([]);
    const [newWebsite, setNewWebsite] = useState({ domain: '', favicon: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [subscriptionLimits, setSubscriptionLimits] = useState(null);
    const { toast } = useToast();
    const { dbUser } = useUserContext();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!dbUser) return;
        fetchWebsites();
        fetchSubscriptionLimits();
    }, [dbUser]);

    // useEffect(() => {
    //     // Update page title when metadata changes
    //     document.title = `Dashboard - ${metadata.siteTitle}`;
    // }, [metadata]);

    const fetchWebsites = async () => {
        try {
            const response = await fetch(`/api/user/get-project?userId=${dbUser.id}`);
            if (!response.ok) throw new Error('Failed to fetch project');
            const data = await response.json();
            setWebsites(data);
        } catch (error) {
            console.error('Fetch error:', error);
            toast({
                title: 'Error',
                description: 'Failed to load your project. Please refresh the page.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSubscriptionLimits = async () => {
        if (!dbUser) return;
        try {
            const response = await fetch(`/api/user/get-subscription-limits?userId=${dbUser.id}`);
            const data = await response.json();
            setSubscriptionLimits(data);
        } catch (error) {
            console.error('Failed to fetch subscription limits:', error);
            toast({
                title: 'Error',
                description: 'Failed to load subscription limits',
                variant: 'destructive',
            });
        }
    };

    const handleAddWebsite = async () => {
        const check = checkSubscriptionFeature(subscriptionLimits, 'websites', websites.length);
        if (!check.allowed) {
            toast({
                title: 'Subscription Limit Reached',
                description: check.message,
                variant: 'destructive',
            });
            return;
        }

        if (!newWebsite.domain) {
            toast({
                title: 'Error',
                description: 'Please enter a domain name',
                variant: 'destructive',
            });
            return;
        }

        const newId = generateSafeId();
        const newWebsiteData = {
            id: newId,
            domain: newWebsite.domain,
            favicon: newWebsite.favicon || newWebsite.domain[0].toUpperCase(),
            color: `bg-${['blue', 'pink', 'purple', 'green'][Math.floor(Math.random() * 4)]}-500`,
            paths: [],
        };

        setWebsites((prev) => [...prev, newWebsiteData]);
        setNewWebsite({ domain: '', favicon: '' });

        toast({
            variant: 'success',
            title: 'Website Added',
            description: 'Saving your changes',
        });

        setIsSaving(true);
        try {
            const response = await fetch('/api/user/save-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    websites: [...websites, newWebsiteData].map((website) => ({
                        ...website,
                        id: parseInt(website.id),
                        paths: website.paths.map((path) => ({
                            ...path,
                            id: parseInt(path.id),
                            popups: path.popups.map((popup) => ({
                                ...popup,
                                id: parseInt(popup.id),
                            })),
                        })),
                    })),
                    userId: dbUser.id,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            toast({
                variant: 'success',
                title: 'Success',
                description: 'Your changes have been saved.',
            });
            setOpen(false);
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: 'Error',
                description: 'Failed to save changes. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteWebsite = async (websiteId, e) => {
        e.stopPropagation();

        try {
            const response = await fetch(`/api/user/save-project?websiteId=${websiteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete website');
            }

            setWebsites((prev) => prev.filter((website) => website.id !== websiteId));

            toast({
                variant: 'success',
                title: 'Success',
                description: 'Website deleted successfully',
            });
        } catch (error) {
            console.error('Delete error:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete website. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleSave = async () => {
        if (!dbUser) {
            toast({
                title: 'Error',
                description: 'User not authenticated',
                variant: 'destructive',
            });
            return;
        }

        if (!websites.length) {
            toast({
                title: 'Nothing to save',
                description: 'Add some websites first',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/api/user/save-project', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    websites: websites.map((website) => ({
                        ...website,
                        id: parseInt(website.id),
                        paths: website.paths.map((path) => ({
                            ...path,
                            id: parseInt(path.id),
                            popups: path.popups.map((popup) => ({
                                ...popup,
                                id: parseInt(popup.id),
                            })),
                        })),
                    })),
                    userId: dbUser.id,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error);
            }

            toast({
                variant: 'success',
                title: 'Success',
                description: 'Your changes have been saved.',
            });
        } catch (error) {
            console.error('Save error:', error);
            toast({
                title: 'Error',
                description: 'Failed to save changes. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const getEmbedCode = (websiteId) => {
        const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'please-add-domain-in-your-environment-variable';
        return `<script 
        src="${apiUrl}/fa.js" 
        data-website-id="${websiteId}" 
        data-api-url="${apiUrl}"
        async
    ></script>`;
    };

    return (
        <>
          
            <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
                <DndStyles />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('dashboard.title')}</h1>
                </div>

                <section className="bg-card rounded-xl border border-border p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2 text-foreground">{t('dashboard.websites.title')}</h2>
                            <p className="text-sm text-muted-foreground">{t('dashboard.websites.description')}</p>
                        </div>
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full sm:w-auto inline-flex items-center gap-2">
                                    <Plus className="w-4 h-4" />
                                    {t('dashboard.websites.addButton')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('dashboard.websites.addDialog.title')}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="domain">{t('dashboard.websites.addDialog.domain')}</Label>
                                        <Input
                                            id="domain"
                                            placeholder={t('dashboard.websites.addDialog.domainPlaceholder')}
                                            value={newWebsite.domain}
                                            onChange={(e) => setNewWebsite((prev) => ({ ...prev, domain: e.target.value }))}
                                        />
                                    </div>
                                    <Button onClick={handleAddWebsite}>{t('dashboard.websites.addButton')}</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {websites.map((website) => (
                            <div key={website.id} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-primary transition-all hover:shadow-lg">
                                <div className={`w-10 sm:w-12 h-10 sm:h-12 ${website.color} rounded-xl flex items-center justify-center text-primary-foreground font-semibold shadow-sm`}>
                                    {website.favicon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate text-foreground">{website.domain}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {website.paths.length} {t('dashboard.websites.paths')}
                                    </p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="shrink-0">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteWebsite(website.id, e)}>
                                            <Trash2 className="w-4 h-4 mr-2" /> {t('dashboard.websites.actions.delete')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))}
                    </div>
                </section>

                {websites.length > 0 && (
                    <section className="bg-card rounded-xl border border-border">
                        <div className="p-4 sm:p-6 border-b border-border">
                            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-foreground">{t('dashboard.integration.title')}</h2>
                            <p className="text-sm text-muted-foreground">{t('dashboard.integration.description')}</p>
                        </div>

                        <div className="p-4 sm:p-6">
                            <div className="grid gap-6">
                                <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-semibold">1</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-medium mb-1 text-foreground">{t('dashboard.integration.step1.title')}</h3>
                                        <p className="text-sm text-muted-foreground mb-4">{t('dashboard.integration.step1.description')}</p>

                                        <Tabs defaultValue={websites[0].id.toString()} className="w-full">
                                            <TabsList className="mb-4 flex-wrap">
                                                {websites.map((website) => (
                                                    <TabsTrigger key={website.id} value={website.id.toString()} className="flex items-center gap-2 text-xs sm:text-sm">
                                                        <div className={`w-3 sm:w-4 h-3 sm:h-4 ${website.color} rounded-full`}></div>
                                                        <span className="truncate max-w-[100px] sm:max-w-none">{website.domain}</span>
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>

                                            {websites.map((website) => (
                                                <TabsContent key={website.id} value={website.id.toString()}>
                                                    <Card>
                                                        <CardHeader className="pb-3">
                                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                                                <CardTitle className="text-sm font-medium">Integration Code</CardTitle>
                                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="flex-1 sm:flex-none"
                                                                        onClick={() => {
                                                                            window.open(`https://${website.domain}`, '_blank');
                                                                        }}>
                                                                        <ExternalLink className="w-4 h-4 mr-2" />
                                                                        {t('dashboard.integration.buttons.visitSite')}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="flex-1 sm:flex-none"
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(getEmbedCode(website.id));
                                                                            toast({
                                                                                variant: 'success',
                                                                                title: t('dashboard.integration.success.codeCopied'),
                                                                                description: t('dashboard.integration.success.codeCopiedDesc'),
                                                                            });
                                                                        }}>
                                                                        <Copy className="w-4 h-4 mr-2" />
                                                                        {t('dashboard.integration.buttons.copyCode')}
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardHeader>
                                                        <CardContent>
                                                            <div className="relative">
                                                                <pre className="p-4 bg-muted rounded-lg text-xs sm:text-sm overflow-x-auto border border-border">
                                                                    <code className="text-foreground break-all sm:break-normal">{getEmbedCode(website.id)}</code>
                                                                </pre>
                                                                <div className="absolute top-3 right-3">
                                                                    <Code2 className="w-4 h-4 text-muted-foreground" />
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </TabsContent>
                                            ))}
                                        </Tabs>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-primary font-semibold">2</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-medium mb-1 text-foreground">{t('dashboard.integration.step2.title')}</h3>
                                        <p className="text-sm text-muted-foreground mb-4">{t('dashboard.integration.step2.description')}</p>
                                        <Card>
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{t('dashboard.integration.step2.checklist.title')}</p>
                                                        <ul className="text-sm text-muted-foreground list-disc ml-5 mt-2">
                                                            {t('dashboard.integration.step2.checklist.items', { returnObjects: true }).map((item, index) => (
                                                                <li key={index}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                                <div className="flex flex-col sm:flex-row items-start gap-3">
                                    <div className="p-2 bg-primary/20 rounded shrink-0">
                                        <Code2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-foreground mb-1">{t('dashboard.help.title')}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {t('dashboard.help.description', {
                                                integrationGuide: (
                                                    <a key="guide" href="#" className="underline text-primary hover:text-primary/90">
                                                        {t('dashboard.help.integrationGuide')}
                                                    </a>
                                                ),
                                                contactSupport: (
                                                    <a key="support" href="#" className="underline text-primary hover:text-primary/90">
                                                        {t('dashboard.help.contactSupport')}
                                                    </a>
                                                ),
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
