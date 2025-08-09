import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Activity, X, Globe, MessageCircle, Bot, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const UsageLimits = ({ usage, subscriptionLimits, liveWebsites }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!usage || !subscriptionLimits) {
        return (
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2">
                    <div className="animate-pulse flex space-x-2 items-center w-full">
                        <div className="w-4 h-4 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded flex-1"></div>
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
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            label: 'Conversations',
            used: mappedUsage.chats,
            max: subscriptionLimits.max_chat_conversations,
            tooltip: 'Total chat conversations this billing period',
            icon: MessageCircle,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            label: 'AI Responses',
            used: mappedUsage.aiResponses,
            max: subscriptionLimits.max_ai_responses,
            tooltip: 'AI-generated responses this billing period',
            icon: Bot,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
        },
    ];

    return (
        <TooltipProvider>
            <div className="relative">
                {/* Enhanced Status Header */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-3 border-b border-gray-200 transition-all duration-200 flex items-center justify-between ${
                        statusInfo.bg
                    } hover:opacity-90`}>
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${statusInfo.bgColor || 'bg-gray-100'}`}>
                            <statusInfo.icon className={`w-4 h-4 ${statusInfo.color}`} />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-gray-900">Plan Usage</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    criticalStatus.percentage >= 95 ? 'bg-red-100 text-red-700' :
                                    criticalStatus.percentage >= 85 ? 'bg-orange-100 text-orange-700' :
                                    criticalStatus.percentage >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {statusInfo.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5">
                                {criticalStatus.percentage >= 95 ? 
                                    `${criticalStatus.name} limit almost reached` :
                                    criticalStatus.percentage >= 70 ?
                                    `${criticalStatus.name} usage: ${criticalStatus.percentage.toFixed(0)}%` :
                                    `${subscriptionLimits.subscription_name} Plan Active`
                                }
                            </p>
                        </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Floating Panel */}
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />

                        {/* Enhanced Panel */}
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200 overflow-hidden">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                            <Activity className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">Usage Dashboard</h3>
                                            <p className="text-sm text-gray-600">{subscriptionLimits.subscription_name} Plan</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsOpen(false)} 
                                        className="p-2 hover:bg-white/80 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="p-6 space-y-6">
                                {metrics.map((metric) => {
                                    const percentage = calculatePercentage(metric.used, metric.max);
                                    const progressColor = getProgressColor(percentage);
                                    const metricStatusInfo = getStatusInfo(percentage);
                                    const remaining = Math.max(0, metric.max - metric.used);

                                    return (
                                        <div key={metric.label} className={`p-4 rounded-xl border-2 ${metricStatusInfo.border} ${metricStatusInfo.bg} hover:shadow-md transition-all duration-200`}>
                                            {/* Metric Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2.5 rounded-lg ${metric.bgColor} shadow-sm`}>
                                                        <metric.icon className={`w-5 h-5 ${metric.color}`} />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                            {metric.label}
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-600" />
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-xs">
                                                                    <p>{metric.tooltip}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </h4>
                                                        <p className="text-sm text-gray-600">
                                                            {remaining > 0 ? `${remaining} remaining` : 'Limit reached'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                                                        percentage >= 95 ? 'bg-red-100 text-red-700' :
                                                        percentage >= 85 ? 'bg-orange-100 text-orange-700' :
                                                        percentage >= 70 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                        {percentage.toFixed(0)}%
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {metric.used} / {metric.max}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Enhanced Progress Bar */}
                                            <div className="relative">
                                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                                    <div 
                                                        className={`h-full transition-all duration-500 ease-out ${progressColor} relative overflow-hidden`}
                                                        style={{ width: `${percentage}%` }}
                                                    >
                                                        {/* Shimmer effect */}
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                                                    </div>
                                                </div>
                                                {/* Progress markers */}
                                                <div className="absolute top-0 left-0 w-full h-3 flex justify-between items-center px-1">
                                                    <div className="w-px h-2 bg-white/50" />
                                                    <div className="w-px h-2 bg-white/50" />
                                                    <div className="w-px h-2 bg-white/50" />
                                                    <div className="w-px h-2 bg-white/50" />
                                                </div>
                                            </div>

                                            {/* Status Message */}
                                            {percentage >= 85 && (
                                                <div className="mt-3 p-2 bg-white/50 rounded-lg border border-white/80">
                                                    <p className={`text-xs font-medium flex items-center gap-1 ${
                                                        percentage >= 95 ? 'text-red-700' : 'text-orange-700'
                                                    }`}>
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {percentage >= 95 ?
                                                            'Almost at limit! Consider upgrading your plan.' :
                                                            'Approaching limit. Monitor usage closely.'
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Quick Actions */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>Need more resources?</span>
                                        <button className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                            Upgrade Plan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </TooltipProvider>
    );
};

export default UsageLimits;
