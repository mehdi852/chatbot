'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, MoreVertical, Trash2, Copy, Code2, ExternalLink, CheckCircle2, Sparkles, Globe, MessageCircle, Users, BarChart3, Settings, Info, Bot, Zap, TrendingUp, Clock, Shield, ChevronRight, Layers } from 'lucide-react';
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
import { StatsSkeleton, ListItemSkeleton, LoadingButton } from '@/components/ui/loading';
import { useTranslation } from 'react-i18next';

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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [subscriptionLimits, setSubscriptionLimits] = useState({});
    const [newWebsite, setNewWebsite] = useState({ name: '', domain: '', favicon: '' });
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();
    const { dbUser } = useUserContext();
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState({});
    const [userStats, setUserStats] = useState({
        number_of_conversations: 0,
        number_of_ai_responses: 0
    });

    useEffect(() => {
        if (!dbUser) return;
        fetchWebsites();
        fetchSubscriptionLimits();
        fetchUserStats();
    }, [dbUser]);

    // Auto-refresh stats every 30 seconds to keep them updated
    useEffect(() => {
        if (!dbUser) return;
        
        const intervalId = setInterval(() => {
            fetchUserStats();
        }, 30000); // 30 seconds

        return () => clearInterval(intervalId);
    }, [dbUser]);

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

    const fetchUserStats = async () => {
        if (!dbUser) return;
        try {
            const response = await fetch(`/api/user/get_user_usage?userId=${dbUser.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user stats');
            }
            const data = await response.json();
            setUserStats({
                number_of_conversations: data.number_of_conversations || 0,
                number_of_ai_responses: data.number_of_ai_responses || 0
            });
        } catch (error) {
            console.error('Failed to fetch user stats:', error);
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

        if (!newWebsite.name) {
            toast({
                title: 'Error',
                description: 'Please enter a website name',
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
            name: newWebsite.name,
            domain: newWebsite.domain,
            favicon: newWebsite.favicon || newWebsite.domain[0].toUpperCase(),
            color: `bg-${['blue', 'pink', 'purple', 'green', 'indigo', 'teal'][Math.floor(Math.random() * 6)]}-500`,
            paths: [],
        };

        setWebsites((prev) => [...prev, newWebsiteData]);
        setNewWebsite({ name: '', domain: '', favicon: '' });

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
        <div className="min-h-screen bg-background">
            <DndStyles />

            {/* Dashboard Header */}
            <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
                <div className="max-w-[1400px] mx-auto pt-8 pb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl"></div>
                                <div className="relative p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg">
                                    <MessageCircle className="h-8 w-8 text-primary-foreground" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                    Chatbot Dashboard
                                </h1>
                                <p className="text-muted-foreground mt-1 text-sm">Manage your AI assistant and engage with visitors</p>
                            </div>
                        </div>

                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button size="default" className="gap-2 shadow-sm">
                                    <Plus className="w-4 h-4" />
                                    {t('dashboard.websites.addButton')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-xl">{t('dashboard.websites.addDialog.title')}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">{t('dashboard.websites.addDialog.name')}</Label>
                                        <Input
                                            id="name"
                                            placeholder={t('dashboard.websites.addDialog.namePlaceholder')}
                                            value={newWebsite.name}
                                            onChange={(e) => setNewWebsite((prev) => ({ ...prev, name: e.target.value }))}
                                            className="focus-visible:ring-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="domain">{t('dashboard.websites.addDialog.domain')}</Label>
                                        <Input
                                            id="domain"
                                            placeholder={t('dashboard.websites.addDialog.domainPlaceholder')}
                                            value={newWebsite.domain}
                                            onChange={(e) => setNewWebsite((prev) => ({ ...prev, domain: e.target.value }))}
                                            className="focus-visible:ring-primary"
                                        />
                                    </div>
                                    <LoadingButton 
                                        onClick={handleAddWebsite} 
                                        className="w-full" 
                                        isLoading={isSaving}
                                    >
                                        {isSaving ? t('common.saving') : t('dashboard.websites.addButton')}
                                    </LoadingButton>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 space-y-10">
                {/* Quick Actions */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Quick Actions</h2>
                            <p className="text-muted-foreground text-sm mt-1">Access your most-used dashboard features</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link href="/dashboard/chat" className="group">
                            <Card className="relative border-border/60 bg-card hover:bg-card/80 shadow-md hover:shadow-xl transition-all duration-300 hover:border-primary/30 cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <CardContent className="relative p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-3 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors duration-300">
                                                <MessageCircle className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1 text-foreground group-hover:text-primary transition-colors duration-300">Live Chat</h3>
                                            <p className="text-sm text-muted-foreground">Manage live conversations with visitors</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-all duration-300 group-hover:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/widget-customization" className="group">
                            <Card className="relative border-border/60 bg-card hover:bg-card/80 shadow-md hover:shadow-xl transition-all duration-300 hover:border-secondary/30 cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <CardContent className="relative p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-secondary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-3 bg-secondary/10 rounded-xl group-hover:bg-secondary/15 transition-colors duration-300">
                                                <Settings className="h-6 w-6 text-secondary" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1 text-foreground group-hover:text-secondary transition-colors duration-300">Customize Widget</h3>
                                            <p className="text-sm text-muted-foreground">Design your chat widget appearance</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-secondary transition-all duration-300 group-hover:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/dashboard/analytics" className="group">
                            <Card className="relative border-border/60 bg-card hover:bg-card/80 shadow-md hover:shadow-xl transition-all duration-300 hover:border-amber-500/30 cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <CardContent className="relative p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-3 bg-amber-500/10 rounded-xl group-hover:bg-amber-500/15 transition-colors duration-300">
                                                <BarChart3 className="h-6 w-6 text-amber-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg mb-1 text-foreground group-hover:text-amber-600 transition-colors duration-300">Analytics</h3>
                                            <p className="text-sm text-muted-foreground">View chat statistics and insights</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-600 transition-all duration-300 group-hover:translate-x-1" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>
                </div>

                {/* Stats Overview */}
                {websites.length > 0 && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">Performance Overview</h2>
                            <p className="text-muted-foreground text-sm mt-1">Track your chatbot's key metrics and usage</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="group relative border-border/60 bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:border-primary/20 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <CardHeader className="relative pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Total Websites
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="flex items-center justify-between">
                                        <div className="text-3xl font-bold text-foreground">{websites.length}</div>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-3 bg-primary/10 rounded-xl">
                                                <Globe className="h-6 w-6 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center text-secondary">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            Active deployments
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative border-border/60 bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:border-secondary/20 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <CardHeader className="relative pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4" />
                                        Total Conversations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="flex items-center justify-between">
                                        <div className="text-3xl font-bold text-foreground">{userStats.number_of_conversations}</div>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-secondary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-3 bg-secondary/10 rounded-xl">
                                                <MessageCircle className="h-6 w-6 text-secondary" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center text-secondary">
                                            <Users className="h-3 w-3 mr-1" />
                                            Visitor interactions
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative border-border/60 bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:border-amber-500/20 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <CardHeader className="relative pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Bot className="h-4 w-4" />
                                        AI Responses
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="flex items-center justify-between">
                                        <div className="text-3xl font-bold text-foreground">{userStats.number_of_ai_responses}</div>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-amber-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-3 bg-amber-500/10 rounded-xl">
                                                <Bot className="h-6 w-6 text-amber-600" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center text-amber-600">
                                            <Zap className="h-3 w-3 mr-1" />
                                            AI-powered replies
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="group relative border-border/60 bg-card shadow-md hover:shadow-xl transition-all duration-300 hover:border-purple-500/20 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <CardHeader className="relative pb-3">
                                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                        <Sparkles className="h-4 w-4" />
                                        Current Plan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="flex items-center justify-between">
                                        <div className="text-2xl font-bold text-foreground">{subscriptionLimits?.plan || 'Free'}</div>
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative p-3 bg-purple-500/10 rounded-xl">
                                                <Sparkles className="h-6 w-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                        <span className="inline-flex items-center text-purple-600">
                                            <Shield className="h-3 w-3 mr-1" />
                                            Subscription tier
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Websites Section */}
                <section className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-border/40">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight mb-1 text-foreground flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-primary" />
                                    Your Websites
                                </h2>
                                <p className="text-sm text-muted-foreground">Manage websites where your chatbot is deployed</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <ListItemSkeleton key={i} />
                                ))}
                            </div>
                        ) : websites.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Globe className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-medium mb-2">No websites yet</h3>
                                <p className="text-muted-foreground mb-6 max-w-md mx-auto">Add your first website to get started with integrations and tracking.</p>
                                <Button onClick={() => setOpen(true)} className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    Add Website
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                                {websites.map((website) => (
                                    <div
                                        key={website.id}
                                        className="group relative flex flex-col p-5 rounded-xl border border-border/40 bg-card hover:border-primary/30 transition-all hover:shadow-md">
                                        <div className="absolute top-3 right-3">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-70 group-hover:opacity-100">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="text-destructive" onClick={(e) => handleDeleteWebsite(website.id, e)}>
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        {t('dashboard.websites.actions.delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-12 h-12 ${website.color} rounded-lg flex items-center justify-center text-primary-foreground font-semibold shadow-sm`}>
                                                {website.favicon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate text-foreground">{website.domain}</h3>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Layers className="w-3 h-3" />
                                                    <span>
                                                        {website.paths.length} {t('dashboard.websites.paths')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/30">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(getEmbedCode(website.id));
                                                    toast({
                                                        variant: 'success',
                                                        title: t('dashboard.integration.success.codeCopied'),
                                                        description: t('dashboard.integration.success.codeCopiedDesc'),
                                                    });
                                                }}>
                                                <Copy className="w-3 h-3 mr-1" />
                                                Copy Code
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs"
                                                onClick={() => {
                                                    window.open(`https://${website.domain}`, '_blank');
                                                }}>
                                                <ExternalLink className="w-3 h-3 mr-1" />
                                                Visit
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
