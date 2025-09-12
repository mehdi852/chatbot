import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, ChevronDown, Activity, X, Globe, MessageCircle, Bot, AlertTriangle, CheckCircle, Clock, BarChart3, TrendingUp, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const UsageLimits = ({ usage, subscriptionLimits, liveWebsites }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    if (!usage || !subscriptionLimits) {
        return (
            <div className="px-4 py-3 border-b border-border bg-white">
                <div className="flex items-center justify-between">
                    {/* Left Section Skeleton */}
                    <div className="flex items-center space-x-3">
                        <div className="skeleton w-2 h-2 rounded-full"></div>
                        <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                                <div className="skeleton h-4 w-12 rounded"></div>
                                <div className="skeleton h-3 w-3 rounded-full"></div>
                                <div className="skeleton h-3 w-8 rounded"></div>
                            </div>
                            <div className="skeleton h-3 w-16 rounded"></div>
                        </div>
                    </div>
                    
                    {/* Right Section Skeleton */}
                    <div className="flex items-center space-x-3">
                        <div className="skeleton h-5 w-8 rounded"></div>
                        <div className="skeleton w-4 h-4 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Map API response keys to component expected keys
    const mappedUsage = {
        websites: usage.number_of_websites || 0,
        chats: usage.number_of_conversations || 0,
        aiResponses: usage.number_of_ai_responses || 0,
    };

    const calculatePercentage = (used, max) => {
        if (!max || max === 0) return 0;
        return Math.min((used / max) * 100, 100);
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 95) return 'bg-red-500';
        if (percentage >= 85) return 'bg-orange-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStatusInfo = (percentage) => {
        if (percentage >= 95) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', status: 'Critical', icon: AlertTriangle };
        if (percentage >= 85) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', status: 'High', icon: AlertTriangle };
        if (percentage >= 70) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', status: 'Medium', icon: Clock };
        return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', status: 'Good', icon: CheckCircle };
    };

    // Get the most critical usage status
    const getCriticalStatus = () => {
        const percentages = [
            { name: 'Websites', percentage: calculatePercentage(liveWebsites, subscriptionLimits.max_websites) },
            { name: 'Chats', percentage: calculatePercentage(mappedUsage.chats, subscriptionLimits.max_chat_conversations) },
            { name: 'AI Responses', percentage: calculatePercentage(mappedUsage.aiResponses, subscriptionLimits.max_ai_responses) },
        ];
        return percentages.reduce((max, current) => current.percentage > max.percentage ? current : max);
    };

    const criticalStatus = getCriticalStatus();
    const statusInfo = getStatusInfo(criticalStatus.percentage);

    const metrics = [
        {
            label: 'Websites',
            used: liveWebsites,
            max: subscriptionLimits.max_websites,
            tooltip: 'Active websites with chat widgets installed',
            icon: Globe,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
            gradient: 'from-primary/20 to-primary/5',
        },
        {
            label: 'Conversations',
            used: mappedUsage.chats,
            max: subscriptionLimits.max_chat_conversations,
            tooltip: 'Total chat conversations this billing period',
            icon: MessageCircle,
            color: 'text-secondary',
            bgColor: 'bg-secondary/10',
            gradient: 'from-secondary/20 to-secondary/5',
        },
        {
            label: 'AI Responses',
            used: mappedUsage.aiResponses,
            max: subscriptionLimits.max_ai_responses,
            tooltip: 'AI-generated responses this billing period',
            icon: Bot,
            color: 'text-accent-foreground',
            bgColor: 'bg-accent',
            gradient: 'from-accent/20 to-accent/5',
        },
    ];

    return (
        <TooltipProvider>
            <div className="relative">
                {/* Compact Usage Header */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="group w-full px-4 py-3 border-b border-border bg-white hover:bg-muted/40 transition-all duration-200 flex items-center justify-between focus:outline-none">
                    
                    {/* Left Section */}
                    <div className="flex items-center space-x-3">
                        {/* Status Indicator */}
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                            criticalStatus.percentage >= 95 ? 'bg-red-500' :
                            criticalStatus.percentage >= 85 ? 'bg-amber-500' :
                            criticalStatus.percentage >= 70 ? 'bg-blue-500' :
                            'bg-emerald-500'
                        }`} />
                        
                        {/* Main Info */}
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-foreground">Usage</span>
                                <span className="text-xs font-medium text-muted-foreground">•</span>
                                <span className="text-xs font-medium text-primary">{subscriptionLimits.subscription_name}</span>
                            </div>
                            <span className={`text-xs font-medium ${
                                criticalStatus.percentage >= 95 ? 'text-red-600' :
                                criticalStatus.percentage >= 85 ? 'text-amber-600' :
                                criticalStatus.percentage >= 70 ? 'text-blue-600' :
                                'text-emerald-600'
                            }`}>
                                {criticalStatus.percentage >= 95 ? 'Critical' :
                                 criticalStatus.percentage >= 85 ? 'High usage' :
                                 criticalStatus.percentage >= 70 ? 'Moderate' :
                                 'All good'} 
                            </span>
                        </div>
                    </div>
                    
                    {/* Right Section */}
                    <div className="flex items-center space-x-3">
                        {/* Usage Percentage */}
                        <div className="text-right">
                            <div className={`text-lg font-bold ${
                                criticalStatus.percentage >= 95 ? 'text-red-600' :
                                criticalStatus.percentage >= 85 ? 'text-amber-600' :
                                criticalStatus.percentage >= 70 ? 'text-blue-600' :
                                'text-emerald-600'
                            }`}>
                                {criticalStatus.percentage.toFixed(0)}%
                            </div>
                        </div>
                        
                        {/* Expand Arrow */}
                        <ChevronDown className={`w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`} />
                    </div>
                </button>

                {/* Modal Portal - Renders outside of sidebar container */}
                {isOpen && mounted && createPortal(
                    <>
                        {/* Enhanced Backdrop with Blur */}
                        <div 
                            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[9998] transition-all duration-300" 
                            onClick={() => setIsOpen(false)}
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
                        />

                        {/* Compact Professional Modal */}
                        <div 
                            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] max-w-4xl h-auto max-h-[80vh] bg-white rounded-xl shadow-2xl border border-border z-[9999] overflow-hidden animate-in zoom-in-95 fade-in-0 duration-300"
                            style={{ position: 'fixed', zIndex: 9999 }}
                        >
                            {/* Compact Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/20">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <BarChart3 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-foreground">Usage Analytics</h2>
                                        <p className="text-xs text-muted-foreground">{subscriptionLimits.subscription_name} Plan</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsOpen(false)} 
                                    className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Compact Metrics Grid */}
                            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {metrics.map((metric) => {
                                        const percentage = calculatePercentage(metric.used, metric.max);
                                        const progressColor = getProgressColor(percentage);
                                        const metricStatusInfo = getStatusInfo(percentage);
                                        const remaining = Math.max(0, metric.max - metric.used);

                                        return (
                                            <div key={metric.label} className="group p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                                                {/* Compact Header */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div className={`p-1.5 rounded-md ${metric.bgColor}`}>
                                                            <metric.icon className={`w-3 h-3 ${metric.color}`} />
                                                        </div>
                                                        <h4 className="font-medium text-foreground text-sm">{metric.label}</h4>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-xs">
                                                                <p className="text-xs">{metric.tooltip}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                                                        percentage >= 95 ? 'bg-red-100 text-red-700' :
                                                        percentage >= 85 ? 'bg-yellow-100 text-yellow-700' :
                                                        percentage >= 70 ? 'bg-blue-100 text-blue-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                        {percentage.toFixed(0)}%
                                                    </div>
                                                </div>
                                                
                                                {/* Usage Stats */}
                                                <div className="mb-3">
                                                    <div className="flex items-baseline space-x-1 mb-1">
                                                        <span className="text-lg font-bold text-foreground">{metric.used.toLocaleString()}</span>
                                                        <span className="text-xs text-muted-foreground">/ {metric.max.toLocaleString()}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">
                                                        {remaining > 0 ? `${remaining.toLocaleString()} remaining` : 'Limit reached'}
                                                    </p>
                                                </div>

                                                {/* Simple Progress Bar */}
                                                <div className="mb-3">
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-500 ease-out ${
                                                                percentage >= 95 ? 'bg-red-500' :
                                                                percentage >= 85 ? 'bg-yellow-500' :
                                                                percentage >= 70 ? 'bg-blue-500' :
                                                                'bg-green-500'
                                                            }`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Compact Status */}
                                                {percentage >= 85 && (
                                                    <div className={`p-2 rounded-md text-xs ${
                                                        percentage >= 95 ? 'bg-red-50 text-red-700 border border-red-200' :
                                                        'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                    }`}>
                                                        <div className="flex items-center space-x-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            <span className="font-medium">
                                                                {percentage >= 100 ? 'Limit exceeded' :
                                                                 percentage >= 95 ? 'Nearly at limit' :
                                                                 'High usage detected'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Compact Footer */}
                                <div className="p-4 border-t border-border bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Zap className="w-4 h-4 text-primary" />
                                            <span className="text-sm font-medium text-foreground">Need more resources?</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                                                View Plans
                                            </button>
                                            <button className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors">
                                                Upgrade
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>,
                    document.body
                )}
            </div>
        </TooltipProvider>
    );
};

export default UsageLimits;
