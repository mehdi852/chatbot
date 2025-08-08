'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, MessageSquare, Users, BarChart2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from '@/app/provider';
import { useTranslation } from 'react-i18next';
import { UsageLimitIndicator } from '@/components/UsageLimitIndicator';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';

export default function UsagePage() {
    const { t } = useTranslation();
    const [subscriptionLimits, setSubscriptionLimits] = useState(null);
    const [isChatSectionExpanded, setIsChatSectionExpanded] = useState(true);
    const [chatStats, setChatStats] = useState({
        conversations: 0,
        aiResponses: 0,
    });
    const { toast } = useToast();
    const { dbUser } = useUserContext();

    useEffect(() => {
        if (!dbUser) return;
        fetchSubscriptionLimits();
        fetchChatStats();
    }, [dbUser]);

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

    const fetchChatStats = async () => {
        if (!dbUser) return;

        try {
            const response = await fetch(`/api/user/get_user_usage?userId=${dbUser.id}`);
            if (!response.ok) throw new Error('Failed to fetch chat stats');
            const data = await response.json();
            setChatStats({
                conversations: data.number_of_conversations || 0,
                aiResponses: data.number_of_ai_responses || 0,
            });
        } catch (error) {
            console.error('Failed to fetch chat stats:', error);
            toast({
                title: 'Error',
                description: 'Failed to load chat usage statistics',
                variant: 'destructive',
            });
        }
    };

    // Calculate percentage for progress bars
    const getPercentage = (current, max) => {
        if (!max) return 0;
        return Math.min((current / max) * 100, 100);
    };

    const conversationsPercentage = getPercentage(chatStats.conversations, subscriptionLimits?.max_chat_conversations || 1);
    const aiResponsesPercentage = getPercentage(chatStats.aiResponses, subscriptionLimits?.max_ai_responses || 1);

    return (
        <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">{t('usagePage.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('usagePage.description')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {/* Chat Usage Section */}
                    <div className="bg-card dark:bg-card/95 rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">{t('usagePage.sections.chatUsage.title', 'Chat Usage')}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">{t('usagePage.sections.chatUsage.description', 'Track your chat conversations and AI responses')}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setIsChatSectionExpanded(!isChatSectionExpanded)} className="h-8 w-8">
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isChatSectionExpanded ? 'transform rotate-180' : ''}`} />
                                </Button>
                            </div>
                        </div>
                        {isChatSectionExpanded && (
                            <div className="p-6 space-y-8">
                                {/* Usage Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-background/50 rounded-lg p-5 border border-border/50 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <MessageSquare className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-lg">{t('usagePage.sections.chatUsage.conversations', 'Chat Conversations')}</h3>
                                                <p className="text-sm text-muted-foreground">{t('usagePage.sections.chatUsage.conversationsDescription', 'Total conversations with visitors')}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-foreground">{chatStats.conversations}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {t('usagePage.sections.chatUsage.totalConversations', 'Total Conversations')}: {chatStats.conversations} /{' '}
                                                    {subscriptionLimits?.max_chat_conversations || 0}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        conversationsPercentage > 90
                                                            ? 'bg-red-500 dark:bg-red-600'
                                                            : conversationsPercentage > 70
                                                            ? 'bg-yellow-500 dark:bg-yellow-600'
                                                            : 'bg-green-500 dark:bg-green-600'
                                                    }`}
                                                    style={{ width: `${conversationsPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-background/50 rounded-lg p-5 border border-border/50 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                                <Zap className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-lg">{t('usagePage.sections.chatUsage.aiResponses', 'AI Responses')}</h3>
                                                <p className="text-sm text-muted-foreground">{t('usagePage.sections.chatUsage.aiResponsesDescription', 'Total AI-generated responses')}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-foreground">{chatStats.aiResponses}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {t('usagePage.sections.chatUsage.totalAiResponses', 'Total AI Responses')}: {chatStats.aiResponses} / {subscriptionLimits?.max_ai_responses || 0}
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-100 dark:bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        aiResponsesPercentage > 90
                                                            ? 'bg-red-500 dark:bg-red-600'
                                                            : aiResponsesPercentage > 70
                                                            ? 'bg-yellow-500 dark:bg-yellow-600'
                                                            : 'bg-green-500 dark:bg-green-600'
                                                    }`}
                                                    style={{ width: `${aiResponsesPercentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Usage Trends */}
                                <div className="bg-background/50 rounded-lg p-5 border border-border/50">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <BarChart2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-lg">Usage Overview</h3>
                                            <p className="text-sm text-muted-foreground">Summary of your chat usage</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div className="p-4 bg-card rounded-lg border border-border/50">
                                            <h4 className="text-sm font-medium mb-2">Conversations Usage</h4>
                                            <div className="flex items-end gap-2">
                                                <div className="text-2xl font-bold">{Math.round(conversationsPercentage)}%</div>
                                                <div className="text-sm text-muted-foreground">of limit used</div>
                                            </div>
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                {conversationsPercentage >= 80 ? (
                                                    <span className="text-amber-500 dark:text-amber-400">You're approaching your limit. Consider upgrading your plan.</span>
                                                ) : (
                                                    <span>You have plenty of conversations available.</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-card rounded-lg border border-border/50">
                                            <h4 className="text-sm font-medium mb-2">AI Responses Usage</h4>
                                            <div className="flex items-end gap-2">
                                                <div className="text-2xl font-bold">{Math.round(aiResponsesPercentage)}%</div>
                                                <div className="text-sm text-muted-foreground">of limit used</div>
                                            </div>
                                            <div className="mt-2 text-xs text-muted-foreground">
                                                {aiResponsesPercentage >= 80 ? (
                                                    <span className="text-amber-500 dark:text-amber-400">You're approaching your limit. Consider upgrading your plan.</span>
                                                ) : (
                                                    <span>You have plenty of AI responses available.</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:sticky lg:top-6">
                    <SubscriptionStatus subscription={subscriptionLimits} />

                    {/* Upgrade CTA Card */}
                    <div className="mt-6 bg-card dark:bg-card/95 rounded-lg border border-border p-5 space-y-4">
                        <h3 className="font-semibold">Need More Resources?</h3>
                        <p className="text-sm text-muted-foreground">Upgrade your plan to get more conversations and AI responses for your chat application.</p>
                        <Button className="w-full" onClick={() => (window.location.href = '/pricing')}>
                            View Pricing Plans
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
