import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Activity, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const UsageLimits = ({ usage, subscriptionLimits, liveWebsites }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!usage || !subscriptionLimits) return null;

    // Map API response keys to component expected keys
    const mappedUsage = {
        websites: usage.number_of_websites || 0,
        chats: usage.number_of_conversations || 0,
        aiResponses: usage.number_of_ai_responses || 0,
    };

    const calculatePercentage = (used, max) => {
        if (!used || !max) return 0;
        return Math.min((used / max) * 100, 100);
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-blue-500';
    };

    // Find the highest usage percentage to determine the overall status
    const getHighestUsage = () => {
        const percentages = [
            calculatePercentage(mappedUsage.websites, subscriptionLimits.max_websites),
            calculatePercentage(mappedUsage.chats, subscriptionLimits.max_chat_conversations),
            calculatePercentage(mappedUsage.aiResponses, subscriptionLimits.max_ai_responses),
        ];
        return Math.max(...percentages);
    };

    const getStatusColor = (percentage) => {
        if (percentage >= 90) return 'text-red-500';
        if (percentage >= 70) return 'text-yellow-500';
        return 'text-blue-500';
    };

    const metrics = [
        {
            label: 'Websites',
            used: liveWebsites,
            max: subscriptionLimits.max_websites,
            tooltip: 'Number of websites you can add to your account',
        },
        {
            label: 'Chats',
            used: mappedUsage.chats,
            max: subscriptionLimits.max_chat_conversations,
            tooltip: 'Total number of chat conversations allowed',
        },
        {
            label: 'AI Responses',
            used: mappedUsage.aiResponses,
            max: subscriptionLimits.max_ai_responses,
            tooltip: 'Number of AI-generated responses available',
        },
    ];

    const highestUsage = getHighestUsage();
    const statusColor = getStatusColor(highestUsage);

    return (
        <TooltipProvider>
            <div className="relative">
                {/* Compact Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 py-2 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Activity className={`w-4 h-4 ${statusColor}`} />
                        <span className="text-sm font-medium text-gray-700">Usage & Limits</span>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                                highestUsage >= 90 ? 'bg-red-100 text-red-700' : highestUsage >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {highestUsage.toFixed(0)}% Used
                        </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Floating Panel */}
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsOpen(false)} />

                        {/* Panel */}
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-semibold text-gray-900">Resource Usage</h3>
                                    <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{subscriptionLimits.subscription_name}</span>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {metrics.map((metric) => {
                                    const percentage = calculatePercentage(metric.used, metric.max);
                                    const progressColor = getProgressColor(percentage);

                                    return (
                                        <div key={metric.label} className="group">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center space-x-1.5">
                                                    <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <HelpCircle className="w-4 h-4 text-gray-400 cursor-help hover:text-gray-500" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{metric.tooltip}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-600">
                                                        {metric.used} / {metric.max}
                                                    </span>
                                                    <span
                                                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                            percentage >= 90 ? 'bg-red-100 text-red-700' : percentage >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                        {percentage.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`absolute left-0 top-0 h-full transition-all duration-300 ${progressColor}`} style={{ width: `${percentage}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </TooltipProvider>
    );
};

export default UsageLimits;
