'use client';

import { useTranslation } from 'react-i18next';

export default function Hero() {
    const { t } = useTranslation();

    return (
        <section className="relative bg-gradient-to-br from-background via-muted/30 to-background py-16 md:py-32 lg:py-40 px-4 md:px-6 overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/3 via-transparent to-transparent rounded-full"></div>
            </div>

            <div className="relative max-w-7xl mx-auto">
                {/* Enhanced Floating Elements */}
                <div className="relative">
                    {/* AI Assistant Card */}
                    <div className="hidden xl:block absolute -left-40 top-16 w-56 animate-ultra-float-1 transform hover:scale-[1.02] transition-all duration-500 z-10">
                        <div className="glass-effect rounded-xl shadow-lg border border-white/20 p-3 backdrop-blur-xl">
                            <div className="flex items-center mb-3 pb-3 border-b border-border/10">
                                <div className="relative">
                                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-sm">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.847a4.5 4.5 0 003.09 3.09L15.75 12l-2.847.813a4.5 4.5 0 00-3.09 3.091zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                                        </svg>
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="font-semibold text-sm text-foreground">AI Assistant</p>
                                    <p className="text-xs text-green-600 flex items-center">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                        Online & Learning
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-muted/50 rounded-xl p-3 max-w-[90%]">
                                    <p className="text-sm text-foreground/80">How can I help optimize your conversions today?</p>
                                </div>
                                <div className="bg-primary text-primary-foreground rounded-xl p-3 max-w-[85%] ml-auto">
                                    <p className="text-sm">Show me analytics</p>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                    <div className="flex space-x-1">
                                        <div className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-pulse"></div>
                                        <div className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                        <div className="w-1 h-1 bg-muted-foreground/40 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                    </div>
                                    <span>AI is typing...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Lead Intelligence Card */}
                    <div className="hidden xl:block absolute -right-36 top-20 w-48 animate-ultra-float-2 transform hover:scale-[1.02] transition-all duration-500 z-10">
                        <div className="glass-effect rounded-xl shadow-lg border border-white/20 p-3 backdrop-blur-xl">
                            <div className="text-center mb-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-secondary to-secondary/80 rounded-2xl mx-auto mb-2 flex items-center justify-center shadow-sm">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-sm text-foreground">High-Value Lead</h3>
                                <p className="text-xs text-muted-foreground">Enterprise Prospect</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-xs text-muted-foreground">Intent Score</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div className="w-[92%] h-full bg-gradient-to-r from-secondary to-green-400 rounded-full"></div>
                                        </div>
                                        <span className="text-xs font-semibold text-secondary">92%</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-xs text-muted-foreground">Est. Value</span>
                                    <span className="text-xs font-semibold text-primary">$12,400</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-xs text-muted-foreground">Company</span>
                                    <span className="text-xs font-medium text-foreground">TechCorp Inc</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Analytics Dashboard Preview */}
                    <div className="hidden xl:block absolute -left-48 bottom-20 w-64 animate-ultra-float-3 transform hover:scale-[1.02] transition-all duration-500 z-10">
                        <div className="glass-effect rounded-xl shadow-lg border border-white/20 p-3 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-sm text-foreground">Real-time Insights</h3>
                                <div className="flex items-center space-x-1 text-xs text-green-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>Live</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-3 border border-primary/10">
                                    <div className="text-lg font-bold text-primary">847</div>
                                    <div className="text-xs text-muted-foreground">Active Chats</div>
                                    <div className="text-xs text-secondary flex items-center mt-1">
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        +23%
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-secondary/10 to-secondary/5 rounded-xl p-3 border border-secondary/10">
                                    <div className="text-lg font-bold text-secondary">142</div>
                                    <div className="text-xs text-muted-foreground">Leads Today</div>
                                    <div className="text-xs text-secondary flex items-center mt-1">
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        +18%
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-3 border border-orange-500/10">
                                    <div className="text-lg font-bold text-orange-600">28</div>
                                    <div className="text-xs text-muted-foreground">Conversions</div>
                                    <div className="text-xs text-secondary flex items-center mt-1">
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        +41%
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-3 border border-purple-500/10">
                                    <div className="text-lg font-bold text-purple-600">96%</div>
                                    <div className="text-xs text-muted-foreground">AI Accuracy</div>
                                    <div className="text-xs text-secondary flex items-center mt-1">
                                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                        +3%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Live Activity Monitor */}
                    <div className="hidden xl:block absolute -right-44 bottom-24 w-56 animate-ultra-float-4 transform hover:scale-[1.02] transition-all duration-500 z-10">
                        <div className="glass-effect rounded-xl shadow-lg border border-white/20 p-3 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-sm text-foreground">Live Activity</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs px-2 py-1 bg-secondary/10 text-secondary rounded-full font-medium">8 online</span>
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {[
                                    { country: 'US', action: 'Requested pricing', color: 'from-blue-500 to-blue-600', status: 'active' },
                                    { country: 'UK', action: 'Downloaded whitepaper', color: 'from-purple-500 to-purple-600', status: 'qualified' },
                                    { country: 'DE', action: 'Viewing enterprise features', color: 'from-green-500 to-green-600', status: 'hot' }
                                ].map((visitor, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-2 hover:bg-muted/30 rounded-lg transition-colors">
                                        <div className={`w-6 h-6 bg-gradient-to-r ${visitor.color} rounded-lg flex items-center justify-center text-white text-xs font-medium shadow-sm`}>
                                            {visitor.country}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-foreground truncate">{visitor.action}</p>
                                            <p className="text-xs text-muted-foreground">Enterprise visitor • 2m ago</p>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${visitor.status === 'hot' ? 'bg-red-500 animate-pulse' : visitor.status === 'qualified' ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="text-center relative z-10">
                        {/* Trust Badge */}
                        <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-sm border border-white/20 dark:border-gray-700/30">
                            <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                            </svg>
                            <span className="text-sm font-medium text-foreground">Trusted by 10,000+ businesses</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6 text-balance">
                            <span className="block text-foreground">{t('hero.title.main')}</span>
                            <span className="block mt-2">
                                Made <span className="text-gradient bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">{t('hero.title.highlight')}</span>
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed text-balance px-4">
                            {t('hero.description')}
                        </p>
                        
                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
                            <button className="group relative bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] shimmer overflow-hidden min-w-[180px]">
                                <span className="relative z-10">{t('hero.buttons.trial')}</span>
                            </button>
                            <button className="group border-2 border-border/20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm text-foreground hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-primary/20 px-8 py-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] min-w-[180px]">
                                <span className="flex items-center justify-center space-x-2">
                                    <svg className="w-4 h-4 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{t('hero.buttons.demo')}</span>
                                </span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Demo Section */}
                    <div className="relative max-w-6xl mx-auto">
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-3xl blur-3xl opacity-30"></div>
                        <div 
                            className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 backdrop-blur-sm bg-white/5"
                            style={{
                                boxSizing: 'content-box',
                                maxHeight: '80vh',
                                aspectRatio: '2.065997130559541',
                                padding: '20px 0'
                            }}
                        >
                            <iframe
                                src="https://app.supademo.com/embed/cmesm4no14vocv9kqcjcs8onr?embed_v=2&utm_source=embed"
                                loading="lazy"
                                title="Interactive Product Demo"
                                allow="clipboard-write"
                                frameBorder="0"
                                webkitallowfullscreen="true"
                                mozallowfullscreen="true"
                                allowFullScreen
                                className="absolute top-0 left-0 w-full h-full rounded-2xl"
                            />
                            {/* Demo overlay badge */}
                            <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-white/20 dark:border-gray-700/30 z-10">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-medium text-foreground">Live Demo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
