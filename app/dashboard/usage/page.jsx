'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from '@/app/provider';
import { useTranslation } from 'react-i18next';
import { UsageLimitIndicator } from '@/components/UsageLimitIndicator';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';


export default function UsagePage() {
    const { t } = useTranslation();
    const [websites, setWebsites] = useState([]);
    const [subscriptionLimits, setSubscriptionLimits] = useState(null);
    const [expandedWebsites, setExpandedWebsites] = useState({});
    const [isUsageSectionExpanded, setIsUsageSectionExpanded] = useState(true);
    const { toast } = useToast();
    const { dbUser } = useUserContext();


    useEffect(() => {
        if (!dbUser) return;
        fetchWebsites();
        fetchSubscriptionLimits();
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

    const toggleWebsiteExpansion = (websiteId) => {
        setExpandedWebsites((prev) => ({
            ...prev,
            [websiteId]: !prev[websiteId],
        }));
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-foreground">{t('usagePage.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('usagePage.description')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2">
                    <div className="bg-card dark:bg-card/95 rounded-xl border border-border shadow-sm">
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">{t('usagePage.sections.usageLimits.title')}</h2>
                                    <p className="text-sm text-muted-foreground mt-1">{t('usagePage.sections.usageLimits.description')}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setIsUsageSectionExpanded(!isUsageSectionExpanded)} className="h-8 w-8">
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isUsageSectionExpanded ? 'transform rotate-180' : ''}`} />
                                </Button>
                            </div>
                        </div>
                        {isUsageSectionExpanded && (
                            <div className="p-6 space-y-6">
                                <UsageLimitIndicator current={websites.length} max={subscriptionLimits?.max_websites || 0} label="usagePage.sections.usageLimits.totalWebsites" />

                                <div className="space-y-4">
                                    {websites.map((website) => (
                                        <div key={website.id} className="border border-border dark:border-border/80 rounded-lg p-4">
                                            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleWebsiteExpansion(website.id)}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 ${website.color} rounded-lg flex items-center justify-center text-white font-semibold`}>{website.favicon}</div>
                                                    <div>
                                                        <h3 className="font-medium text-foreground">{website.domain}</h3>
                                                        <p className="text-sm text-muted-foreground">{website.paths.length} Paths</p>
                                                    </div>
                                                </div>
                                                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedWebsites[website.id] ? 'transform rotate-180' : ''}`} />
                                            </div>

                                            {expandedWebsites[website.id] && (
                                                <div className="mt-4 space-y-3 pl-11">
                                                    <UsageLimitIndicator
                                                        current={website.paths.length}
                                                        max={subscriptionLimits?.max_paths_per_website || 0}
                                                        label="usagePage.sections.usageLimits.paths"
                                                        size="sm"
                                                    />

                                                    {website.paths.map((path) => (
                                                        <div key={path.id} className="pl-4 border-l border-border dark:border-border/60">
                                                            <p className="text-sm font-medium mb-2 text-foreground">{path.name}</p>
                                                            <UsageLimitIndicator
                                                                current={path.popups.length}
                                                                max={subscriptionLimits?.max_popups_per_path || 0}
                                                                label="usagePage.sections.usageLimits.popups"
                                                                size="sm"
                                                            />
                                                        </div>
                                                    ))}

                                                    <div className="pt-2 border-t border-border dark:border-border/60 mt-4">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`w-2 h-2 rounded-full ${
                                                                        subscriptionLimits?.allow_advertising ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                                                                    }`}
                                                                />
                                                                <span className="text-sm text-muted-foreground">{t('usagePage.sections.usageLimits.features.advertising')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <div
                                                                    className={`w-2 h-2 rounded-full ${
                                                                        subscriptionLimits?.allow_email_collector ? 'bg-green-500 dark:bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                                                                    }`}
                                                                />
                                                                <span className="text-sm text-muted-foreground">{t('usagePage.sections.usageLimits.features.emailCollector')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="lg:sticky lg:top-6">
                    <SubscriptionStatus subscription={subscriptionLimits} />
                </div>
            </div>
        </div>
    );
}
