'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Hero() {
    const { t } = useTranslation();
    const [mainImageLoading, setMainImageLoading] = useState(true);
    const [mobileImageLoading, setMobileImageLoading] = useState(true);

    return (
        <section className="bg-muted py-12 md:py-48 px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
                {/* Floating Chat Interface Previews */}
                <div className="relative">
                    {/* AI Chat Widget Preview - Left Side */}
                    <div className="hidden md:block absolute -left-[190px] -top-10 w-80 md:w-96 animate-float-1 transform hover:scale-110 transition-transform z-10">
                        <div className="bg-white rounded-lg shadow-2xl p-4 border border-gray-200">
                            <div className="flex items-center mb-3 pb-3 border-b">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-bold">AI</span>
                                </div>
                                <div className="ml-3">
                                    <p className="font-semibold text-sm">Customer Support</p>
                                    <p className="text-xs text-green-500">● Online</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                                    <p className="text-xs">Hello! How can I help you today?</p>
                                </div>
                                <div className="bg-blue-500 text-white rounded-lg p-2 max-w-[80%] ml-auto">
                                    <p className="text-xs">I need help with pricing</p>
                                </div>
                                <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                                    <p className="text-xs">I'd be happy to help with pricing information...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Lead Capture Preview - Right Side */}
                    <div className="hidden md:block absolute -right-32 -top-10 w-80 md:w-96 animate-float-2 transform hover:scale-110 transition-transform z-10">
                        <div className="bg-white rounded-lg shadow-2xl p-4 border border-gray-200">
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                                    <span className="text-white text-xl">✓</span>
                                </div>
                                <h3 className="font-bold text-sm">Lead Captured!</h3>
                                <p className="text-xs text-gray-600">AI identified high-intent visitor</p>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Confidence:</span>
                                    <span className="font-semibold text-green-600">92%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Interest:</span>
                                    <span className="font-semibold">Enterprise Plan</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Value:</span>
                                    <span className="font-semibold text-blue-600">$2,400</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Analytics Preview - Bottom Left */}
                    <div className="hidden md:block absolute -left-32 top-[600px] w-80 md:w-96 animate-float-3 transform hover:scale-110 transition-transform z-10">
                        <div className="bg-white rounded-lg shadow-2xl p-4 border border-gray-200">
                            <h3 className="font-bold text-sm mb-3">Today's Metrics</h3>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="text-center p-2 bg-blue-50 rounded">
                                    <div className="font-bold text-lg text-blue-600">47</div>
                                    <div className="text-gray-600">Conversations</div>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded">
                                    <div className="font-bold text-lg text-green-600">12</div>
                                    <div className="text-gray-600">Leads</div>
                                </div>
                                <div className="text-center p-2 bg-purple-50 rounded">
                                    <div className="font-bold text-lg text-purple-600">3</div>
                                    <div className="text-gray-600">Conversions</div>
                                </div>
                                <div className="text-center p-2 bg-orange-50 rounded">
                                    <div className="font-bold text-lg text-orange-600">89%</div>
                                    <div className="text-gray-600">AI Accuracy</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Live Chat Dashboard Preview - Bottom Right */}
                    <div className="hidden md:block absolute -right-32 top-[400px] w-80 md:w-96 animate-float-4 transform hover:scale-110 transition-transform z-10">
                        <div className="bg-white rounded-lg shadow-2xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-sm">Active Visitors</h3>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">3 online</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">V1</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium">Visitor from US</p>
                                        <p className="text-xs text-gray-500">Asking about features...</p>
                                    </div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">V2</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium">Visitor from UK</p>
                                        <p className="text-xs text-gray-500">Interested in pricing</p>
                                    </div>
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-center mb-4">
                        {t('hero.title.main')}
                        <br />
                        Made <span className="text-primary">{t('hero.title.highlight')}</span>
                    </h1>
                    <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto px-4">{t('hero.description')}</p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
                        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-md transition-colors">{t('hero.buttons.trial')}</button>
                        <button className="border border-border text-foreground hover:bg-accent px-6 py-3 rounded-md transition-colors">{t('hero.buttons.demo')}</button>
                    </div>
                    <div className="relative max-w-5xl mx-auto">
                        {/* Main Dashboard Image - AI Chatbot Dashboard */}
                        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 shadow-2xl">
                            {mainImageLoading && <div className="absolute inset-0 bg-muted animate-pulse rounded-xl" />}
                            {/* We'll use a placeholder dashboard design until we have the actual chatbot dashboard image */}
                            <div className="absolute inset-0 p-6 bg-white m-2 rounded-lg">
                                {/* Dashboard Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <span className="text-white font-bold">AI</span>
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-xl">AI Chatbot Dashboard</h2>
                                            <p className="text-gray-500 text-sm">Manage conversations & leads</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-1.5 rounded-full">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-green-700 text-sm font-medium">Connected</span>
                                    </div>
                                </div>
                                
                                {/* Stats Cards */}
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">247</div>
                                        <div className="text-xs text-gray-600">Total Conversations</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">43</div>
                                        <div className="text-xs text-gray-600">Leads Captured</div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">12</div>
                                        <div className="text-xs text-gray-600">Conversions</div>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-orange-600">94%</div>
                                        <div className="text-xs text-gray-600">AI Accuracy</div>
                                    </div>
                                </div>
                                
                                {/* Chat Interface Preview */}
                                <div className="grid grid-cols-2 gap-6 h-64">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-sm mb-3">Live Conversations</h3>
                                        <div className="space-y-2">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex items-center space-x-3 p-2 bg-white rounded hover:bg-blue-50">
                                                    <div className={`w-6 h-6 ${i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-green-500' : 'bg-purple-500'} rounded-full flex items-center justify-center`}>
                                                        <span className="text-white text-xs">V{i}</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="text-xs font-medium">Visitor {i}</div>
                                                        <div className="text-xs text-gray-500 truncate">Last message preview...</div>
                                                    </div>
                                                    <div className={`w-2 h-2 ${i === 1 ? 'bg-green-500' : 'bg-orange-500'} rounded-full`}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="font-semibold text-sm mb-3">AI Insights</h3>
                                        <div className="space-y-3">
                                            <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                                                <div className="text-xs font-medium">High-Intent Visitor Detected</div>
                                                <div className="text-xs text-gray-500">Asking about enterprise features</div>
                                                <div className="text-xs text-blue-600 font-medium">Confidence: 89%</div>
                                            </div>
                                            <div className="bg-white p-3 rounded border-l-4 border-green-500">
                                                <div className="text-xs font-medium">Lead Qualified</div>
                                                <div className="text-xs text-gray-500">Email captured automatically</div>
                                                <div className="text-xs text-green-600 font-medium">Est. Value: $1,200</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Image
                                src="/images/heroImage.png"
                                alt="AI Chatbot Dashboard"
                                fill
                                className={`object-cover transition-opacity duration-300 ${mainImageLoading ? 'opacity-100' : 'opacity-0'}`}
                                sizes="(max-width: 1280px) 100vw, 1280px"
                                priority
                                quality={100}
                                onLoadingComplete={() => setMainImageLoading(false)}
                                onError={() => setMainImageLoading(false)}
                            />
                        </div>

                        {/* Mobile Chat Widget Overlay */}
                        <div className="hidden md:block absolute -bottom-6 -right-4 w-[320px] h-[640px] transform rotate-[-5deg] transition-transform hover:rotate-0 duration-300">
                            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-black shadow-2xl">
                                {mobileImageLoading && <div className="absolute inset-0 bg-muted animate-pulse rounded-[2.5rem]" />}
                                {/* Mobile Chat Interface Mock */}
                                <div className="absolute inset-0 bg-gray-900 p-4 flex flex-col">
                                    {/* Status Bar */}
                                    <div className="h-6 mb-4"></div>
                                    
                                    {/* App Header */}
                                    <div className="bg-blue-600 text-white p-4 rounded-t-lg mb-1">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-bold">CS</span>
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold">Customer Support</div>
                                                <div className="text-xs opacity-80">● Always available</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Chat Messages */}
                                    <div className="flex-1 bg-white p-3 space-y-3 overflow-hidden">
                                        <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                                            <div className="text-xs">Hi! I'm here to help. What can I do for you?</div>
                                        </div>
                                        <div className="bg-blue-500 text-white rounded-lg p-2 max-w-[80%] ml-auto">
                                            <div className="text-xs">What are your pricing plans?</div>
                                        </div>
                                        <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                                            <div className="text-xs">Great question! We have flexible plans starting from $29/month...</div>
                                        </div>
                                        <div className="bg-blue-500 text-white rounded-lg p-2 max-w-[80%] ml-auto">
                                            <div className="text-xs">Can I get enterprise pricing?</div>
                                        </div>
                                        <div className="bg-gray-100 rounded-lg p-2 max-w-[80%]">
                                            <div className="text-xs">I'd be happy to help with enterprise pricing. Could you share your email?</div>
                                        </div>
                                    </div>
                                    
                                    {/* Input Area */}
                                    <div className="bg-white p-3 rounded-b-lg">
                                        <div className="bg-gray-100 rounded-full px-3 py-2 flex items-center">
                                            <div className="text-xs text-gray-500 flex-1">Type your message...</div>
                                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xs">→</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Image
                                    src="/images/iphone2.png"
                                    alt="Mobile Chat Experience"
                                    fill
                                    className={`object-cover transition-opacity duration-300 ${mobileImageLoading ? 'opacity-100' : 'opacity-0'}`}
                                    sizes="(max-width: 768px) 0vw, 320px"
                                    priority
                                    quality={100}
                                    onLoadingComplete={() => setMobileImageLoading(false)}
                                    onError={() => setMobileImageLoading(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
