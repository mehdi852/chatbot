'use client';

import { useTranslation } from 'react-i18next';

export default function Hero() {
    const { t } = useTranslation();

    return (
        <section className="bg-muted py-12 md:py-48 px-4 md:px-6">
            <div className="max-w-6xl mx-auto">
                {/* Floating Chat Interface Previews */}
                <div className="relative">
                    {/* AI Chat Widget Preview - Left Side */}
                    <div className="hidden lg:block absolute -left-24 -top-8 w-56 animate-float-1 transform hover:scale-105 transition-transform z-10 opacity-90">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-100">
                            <div className="flex items-center mb-2 pb-2 border-b border-gray-100">
                                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">AI</span>
                                </div>
                                <div className="ml-2">
                                    <p className="font-medium text-xs">Support</p>
                                    <p className="text-xs text-green-500">● Online</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="bg-gray-50 rounded-lg p-1.5 max-w-[85%]">
                                    <p className="text-xs text-gray-700">Hello! How can I help?</p>
                                </div>
                                <div className="bg-blue-500 text-white rounded-lg p-1.5 max-w-[80%] ml-auto">
                                    <p className="text-xs">Pricing info?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Lead Capture Preview - Right Side */}
                    <div className="hidden lg:block absolute -right-20 top-0 w-48 animate-float-2 transform hover:scale-105 transition-transform z-10 opacity-90">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-100">
                            <div className="text-center mb-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                                    <span className="text-white text-sm">✓</span>
                                </div>
                                <h3 className="font-semibold text-xs">Lead Captured!</h3>
                                <p className="text-xs text-gray-500">High-intent visitor</p>
                            </div>
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Score:</span>
                                    <span className="font-medium text-green-600">92%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Value:</span>
                                    <span className="font-medium text-blue-600">$2.4k</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Analytics Preview - Bottom Left */}
                    <div className="hidden lg:block absolute -left-24 top-80 w-52 animate-float-3 transform hover:scale-105 transition-transform z-10 opacity-90">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-100">
                            <h3 className="font-semibold text-xs mb-2">Today's Metrics</h3>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="text-center p-1.5 bg-blue-50 rounded-lg">
                                    <div className="font-bold text-sm text-blue-600">47</div>
                                    <div className="text-gray-600 text-xs">Chats</div>
                                </div>
                                <div className="text-center p-1.5 bg-green-50 rounded-lg">
                                    <div className="font-bold text-sm text-green-600">12</div>
                                    <div className="text-gray-600 text-xs">Leads</div>
                                </div>
                                <div className="text-center p-1.5 bg-purple-50 rounded-lg">
                                    <div className="font-bold text-sm text-purple-600">3</div>
                                    <div className="text-gray-600 text-xs">Sales</div>
                                </div>
                                <div className="text-center p-1.5 bg-orange-50 rounded-lg">
                                    <div className="font-bold text-sm text-orange-600">89%</div>
                                    <div className="text-gray-600 text-xs">AI Score</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Live Chat Dashboard Preview - Bottom Right */}
                    <div className="hidden lg:block absolute -right-20 top-72 w-50 animate-float-4 transform hover:scale-105 transition-transform z-10 opacity-90">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-xs">Live Visitors</h3>
                                <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-xs">2 online</span>
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded-lg">
                                    <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">V1</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">US Visitor</p>
                                        <p className="text-xs text-gray-500 truncate">Pricing question</p>
                                    </div>
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="flex items-center space-x-2 p-1.5 hover:bg-gray-50 rounded-lg">
                                    <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs">V2</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium truncate">UK Visitor</p>
                                        <p className="text-xs text-gray-500 truncate">Feature demo</p>
                                    </div>
                                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
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
                        {/* Supademo Interactive Demo */}
                        <div 
                            className="relative w-full rounded-xl overflow-hidden shadow-2xl"
                            style={{
                                boxSizing: 'content-box',
                                maxHeight: '80vh',
                                aspectRatio: '2.065997130559541',
                                padding: '40px 0'
                            }}
                        >
                            <iframe
                                src="https://app.supademo.com/embed/cmesm4no14vocv9kqcjcs8onr?embed_v=2&utm_source=embed"
                                loading="lazy"
                                title="App Demo Walkthrough"
                                allow="clipboard-write"
                                frameBorder="0"
                                webkitallowfullscreen="true"
                                mozallowfullscreen="true"
                                allowFullScreen
                                className="absolute top-0 left-0 w-full h-full rounded-xl"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
