'use client';

import { useEffect } from 'react';
import { MessageCircle, MessageSquare, Zap, Target, BookOpen, Settings, Brain, Users, ArrowRightLeft, Clock, Eye, MapPin, Upload, FileText, CheckCircle, BarChart3, Headphones, Shield, Workflow, Bot, TrendingUp, MousePointer, Smartphone, Database, Globe, Search, Cog } from 'lucide-react';
import Link from 'next/link';

export default function SolutionsPage() {
    let isScrolling = false; // Prevent multiple scroll animations
    
    const scrollToSection = (elementId) => {
        // Prevent multiple scroll animations from running simultaneously
        if (isScrolling) return;
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Element with ID '${elementId}' not found`);
            return;
        }
        
        // Calculate the offset to account for the fixed navbar plus extra padding
        const isMobile = window.innerWidth < 768;
        const navbarHeight = isMobile ? 64 : 80;
        const extraPadding = isMobile ? 20 : 32;
        const targetPosition = Math.max(0, element.offsetTop - navbarHeight - extraPadding);
        
        // If the distance is very small, just scroll immediately
        if (Math.abs(targetPosition - window.pageYOffset) < 10) {
            window.scrollTo(0, targetPosition);
            return;
        }
        
        // Custom smooth scrolling animation
        isScrolling = true;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = Math.min(800, Math.abs(distance) * 1.5); // Adaptive duration based on distance
        let startTime = null;
        
        const animateScroll = (currentTime) => {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function for smooth animation (ease-in-out)
            const easeInOutCubic = (t) => {
                return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
            };
            
            const currentPosition = startPosition + (distance * easeInOutCubic(progress));
            window.scrollTo(0, currentPosition);
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            } else {
                isScrolling = false; // Animation complete
            }
        };
        
        requestAnimationFrame(animateScroll);
    };

    useEffect(() => {
        // Handle hash navigation and smooth scrolling on page load
        const hash = window.location.hash;
        if (hash) {
            const elementId = hash.substring(1); // Remove the # symbol
            // Add a delay to ensure the page is fully loaded and DOM is ready
            setTimeout(() => {
                scrollToSection(elementId);
            }, 500); // Increased delay for better reliability
        }

        // Listen for hash changes (when user clicks navbar links)
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash) {
                const elementId = hash.substring(1);
                // Small delay to ensure DOM is ready for hash changes
                setTimeout(() => {
                    scrollToSection(elementId);
                }, 100);
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        
        // Also listen for popstate events (browser back/forward)
        window.addEventListener('popstate', handleHashChange);
        
        // Cleanup event listeners
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
            window.removeEventListener('popstate', handleHashChange);
        };
    }, []);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/3 via-transparent to-transparent rounded-full"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-foreground">
                            <span className="block">Complete</span>
                            <span className="block mt-2">
                                <span className="text-gradient bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">Chatbot Solutions</span>
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                            Discover our comprehensive suite of AI-powered chatbot solutions designed to transform 
                            your customer experience and automate your business operations.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
                            <Link
                                href="/dashboard"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Get Started
                            </Link>
                            <Link
                                href="/demo"
                                className="border border-border hover:bg-accent px-8 py-4 rounded-xl text-lg font-medium transition-all duration-200 hover:shadow-md"
                            >
                                View Demo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Chat Assistant Section */}
            <section id="ai-chat" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 scroll-mt-28">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-6 border border-primary/20">
                            <MessageCircle className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-primary">AI Chat Assistant</span>
                            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-md font-medium">Popular</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Intelligent Conversations</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Powered by advanced AI technology, our chat assistant delivers human-like conversations 
                            that understand context, remember preferences, and provide accurate responses 24/7.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Brain,
                                title: "Natural Language Understanding",
                                description: "Advanced NLP that comprehends complex queries with human-like accuracy.",
                                color: "bg-purple-500/10 border-purple-500/20",
                                iconColor: "text-purple-500"
                            },
                            {
                                icon: Zap,
                                title: "Instant Responses",
                                description: "Lightning-fast response times ensure customers never wait for answers.",
                                color: "bg-yellow-500/10 border-yellow-500/20",
                                iconColor: "text-yellow-500"
                            },
                            {
                                icon: Users,
                                title: "Multi-Language Support",
                                description: "Communicate in multiple languages with built-in translation capabilities.",
                                color: "bg-green-500/10 border-green-500/20",
                                iconColor: "text-green-500"
                            }
                        ].map((feature, index) => (
                            <div key={feature.title} className={`bg-card rounded-2xl p-6 border ${feature.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                                <div className="bg-background/50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                    <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Live Chat Support Section */}
            <section id="live-chat" className="py-16 px-4 sm:px-6 lg:px-8 scroll-mt-28">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-green-500/10 rounded-full px-4 py-2 mb-6 border border-green-500/20">
                            <MessageSquare className="w-4 h-4 text-green-500" />
                            <span className="text-sm font-medium text-green-500">Live Chat Support</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Seamless Human Handoff</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Bridge the gap between AI efficiency and human empathy with intelligent handoff 
                            that ensures customers get the right help at the right time.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "AI Handles Initial Contact",
                                description: "AI assistant immediately responds, gathering context and resolving simple issues.",
                                icon: MessageSquare,
                                color: "bg-blue-500/10 border-blue-500/20",
                                iconColor: "text-blue-500"
                            },
                            {
                                step: "02",
                                title: "Smart Escalation Detection",
                                description: "AI detects complex issues and intelligently escalates to human agents.",
                                icon: ArrowRightLeft,
                                color: "bg-orange-500/10 border-orange-500/20",
                                iconColor: "text-orange-500"
                            },
                            {
                                step: "03",
                                title: "Seamless Human Takeover",
                                description: "Agents receive full context, continuing naturally without repetition.",
                                icon: Users,
                                color: "bg-green-500/10 border-green-500/20",
                                iconColor: "text-green-500"
                            }
                        ].map((step, index) => (
                            <div key={step.step} className={`bg-card rounded-2xl p-6 border ${step.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center`}>
                                        <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                                    </div>
                                    <span className="text-2xl font-bold text-muted-foreground/30">{step.step}</span>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Smart Automation Section */}
            <section id="automation" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 scroll-mt-28">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-orange-500/10 rounded-full px-4 py-2 mb-6 border border-orange-500/20">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-orange-500">Smart Automation</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Automate Everything</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Transform customer support and lead generation with intelligent automation 
                            that works 24/7, handling routine tasks and scaling your business.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                title: "Lead Generation & Qualification",
                                description: "Automatically capture, qualify, and route leads based on custom criteria.",
                                features: ["Intelligent lead scoring", "Automated follow-ups", "CRM integration"],
                                icon: Target,
                                color: "bg-blue-500/10 border-blue-500/20",
                                iconColor: "text-blue-500"
                            },
                            {
                                title: "Customer Support Automation",
                                description: "Handle common requests, ticket creation, and escalation automatically.",
                                features: ["Automated ticketing", "FAQ resolution", "Priority escalation"],
                                icon: Bot,
                                color: "bg-green-500/10 border-green-500/20",
                                iconColor: "text-green-500"
                            }
                        ].map((automation, index) => (
                            <div key={automation.title} className={`bg-card rounded-2xl p-6 border ${automation.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                                <div className="flex items-start space-x-4 mb-4">
                                    <div className={`w-12 h-12 ${automation.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                        <automation.icon className={`w-6 h-6 ${automation.iconColor}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground mb-2">{automation.title}</h3>
                                        <p className="text-muted-foreground mb-4">{automation.description}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {automation.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center space-x-2">
                                            <CheckCircle className={`w-4 h-4 ${automation.iconColor}`} />
                                            <span className="text-sm text-foreground">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Visitor Targeting Section */}
            <section id="targeting" className="py-16 px-4 sm:px-6 lg:px-8 scroll-mt-28">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-purple-500/10 rounded-full px-4 py-2 mb-6 border border-purple-500/20">
                            <Target className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-purple-500">Visitor Targeting</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Personalized Messages</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Show the right message to the right visitor at the right time with intelligent 
                            targeting based on behavior, location, and preferences.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Eye,
                                title: "Behavioral Targeting",
                                description: "Target based on actions, time spent, scroll depth, and interaction patterns.",
                                color: "bg-blue-500/10 border-blue-500/20",
                                iconColor: "text-blue-500"
                            },
                            {
                                icon: MapPin,
                                title: "Geographic Targeting",
                                description: "Show location-specific messages and offers based on visitor location.",
                                color: "bg-green-500/10 border-green-500/20",
                                iconColor: "text-green-500"
                            },
                            {
                                icon: MousePointer,
                                title: "Intent-Based Targeting",
                                description: "Detect visitor intent through exit-intent and engagement metrics.",
                                color: "bg-orange-500/10 border-orange-500/20",
                                iconColor: "text-orange-500"
                            }
                        ].map((method, index) => (
                            <div key={method.title} className={`bg-card rounded-2xl p-6 border ${method.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                                <div className="bg-background/50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                    <method.icon className={`w-6 h-6 ${method.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{method.title}</h3>
                                <p className="text-muted-foreground">{method.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Knowledge Base Section */}
            <section id="knowledge-base" className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30 scroll-mt-28">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 rounded-full px-4 py-2 mb-6 border border-indigo-500/20">
                            <BookOpen className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-medium text-indigo-500">Knowledge Base</span>
                            <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-md font-medium">New</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Train Your AI With Your Content</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Upload documents, FAQs, and content to create a custom knowledge base. 
                            Your AI provides accurate, company-specific answers based on your data.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: "01",
                                title: "Upload Your Content",
                                description: "Upload documents, PDFs, websites, and any content for AI learning.",
                                icon: Upload,
                                color: "bg-blue-500/10 border-blue-500/20",
                                iconColor: "text-blue-500"
                            },
                            {
                                step: "02",
                                title: "AI Processing & Learning",
                                description: "AI analyzes and learns from content, understanding context and relationships.",
                                icon: Brain,
                                color: "bg-green-500/10 border-green-500/20",
                                iconColor: "text-green-500"
                            },
                            {
                                step: "03",
                                title: "Intelligent Responses",
                                description: "AI provides accurate, contextual answers based on your knowledge base.",
                                icon: Zap,
                                color: "bg-purple-500/10 border-purple-500/20",
                                iconColor: "text-purple-500"
                            }
                        ].map((step, index) => (
                            <div key={step.step} className={`bg-card rounded-2xl p-6 border ${step.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 ${step.color} rounded-xl flex items-center justify-center`}>
                                        <step.icon className={`w-6 h-6 ${step.iconColor}`} />
                                    </div>
                                    <span className="text-2xl font-bold text-muted-foreground/30">{step.step}</span>
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{step.title}</h3>
                                <p className="text-muted-foreground">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Customization Section */}
            <section id="customization" className="py-16 px-4 sm:px-6 lg:px-8 scroll-mt-28">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center space-x-2 bg-pink-500/10 rounded-full px-4 py-2 mb-6 border border-pink-500/20">
                            <Settings className="w-4 h-4 text-pink-500" />
                            <span className="text-sm font-medium text-pink-500">Customization</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Personalize Your Chatbot</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Customize your chatbot's appearance, behavior, and personality to perfectly 
                            match your brand and deliver consistent experiences.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Settings,
                                title: "Visual Customization",
                                description: "Customize colors, fonts, position, and styling to match your brand perfectly.",
                                color: "bg-pink-500/10 border-pink-500/20",
                                iconColor: "text-pink-500"
                            },
                            {
                                icon: MessageCircle,
                                title: "Conversation Flow",
                                description: "Design custom conversation paths and responses for different scenarios.",
                                color: "bg-blue-500/10 border-blue-500/20",
                                iconColor: "text-blue-500"
                            },
                            {
                                icon: Users,
                                title: "Personality & Tone",
                                description: "Define your bot's personality, tone of voice, and communication style.",
                                color: "bg-green-500/10 border-green-500/20",
                                iconColor: "text-green-500"
                            }
                        ].map((customization, index) => (
                            <div key={customization.title} className={`bg-card rounded-2xl p-6 border ${customization.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                                <div className="bg-background/50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                    <customization.icon className={`w-6 h-6 ${customization.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-3">{customization.title}</h3>
                                <p className="text-muted-foreground">{customization.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 md:px-6 bg-primary dark:bg-primary/90">
                <div className="max-w-4xl mx-auto text-center text-primary-foreground">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
                    <p className="mb-8 text-lg opacity-90">
                        Join thousands of businesses using our comprehensive chatbot solutions to transform their customer experience.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/dashboard"
                            className="bg-white text-primary hover:bg-gray-100 dark:bg-gray-900 dark:text-primary-foreground py-3 px-8 rounded-lg font-medium transition-colors"
                        >
                            Start Free Trial
                        </Link>
                        <Link
                            href="/contact"
                            className="bg-transparent border-2 border-white text-white py-3 px-8 rounded-lg font-medium hover:bg-white hover:text-primary dark:hover:bg-gray-900 dark:hover:text-primary-foreground transition-colors"
                        >
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
