'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import ContactForm from '../components/ContactForm';

export default function ContactPage() {
    const { user, isSignedIn } = useUser();
    const [contactSettings, setContactSettings] = useState({});
    const [contactFaqs, setContactFaqs] = useState([]);
    const [contactStats, setContactStats] = useState([]);

    useEffect(() => {
        const fetchContactSettings = async () => {
            try {
                const response = await fetch('/api/public/get-contact-settings');
                const data = await response.json();
                
                setContactSettings(data.contactSettings || {});
                setContactFaqs(data.contactFaqs || []);
                setContactStats(data.contactStats || []);
            } catch (error) {
                console.error('Error fetching contact settings:', error);
            }
        };

        fetchContactSettings();
    }, []);

    const handleSubmit = async (formData) => {
        try {
            const endpoint = isSignedIn ? '/api/public/user-send-message' : '/api/public/visitor-send-message';
            const payload = isSignedIn
                ? {
                      name: user.name,
                      email: user.primaryEmailAddress?.emailAddress,
                      body: formData.subject,
                  }
                : {
                      name: formData.name,
                      email: formData.email,
                      body: formData.subject,
                  };

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            // Show success message
            alert('Message sent successfully!');
        } catch (error) {
            console.error(error);
            alert(error.message || 'Failed to send message. Please try again.');
        }
    };

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
                        {/* Badge */}
                        <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-2 mb-6 border border-primary/20">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-primary">Get in Touch</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-foreground">
                            <span className="block">{contactSettings.hero_title_line1 || 'Let\'s Start a'}</span>
                            <span className="block mt-2">
                                <span className="text-gradient bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">{contactSettings.hero_title_line2 || 'Conversation'}</span>
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                            {contactSettings.hero_description || 'We\'re here to help you succeed. Whether you have questions, need support, or want to explore how our platform can transform your business, our team is ready to assist.'}
                        </p>
                        
                        {/* Quick Contact Options */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16">
                            <a href={`mailto:${contactSettings.support_email || 'support@example.com'}`} className="group flex items-center space-x-3 bg-card hover:bg-accent border border-border rounded-xl px-6 py-4 transition-all duration-200 hover:shadow-md">
                                <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-medium text-foreground">Email Us</div>
                                    <div className="text-xs text-muted-foreground">{contactSettings.support_email || 'support@example.com'}</div>
                                </div>
                            </a>
                            
                            <a href={`tel:${contactSettings.support_phone || '+1-555-123-4567'}`} className="group flex items-center space-x-3 bg-card hover:bg-accent border border-border rounded-xl px-6 py-4 transition-all duration-200 hover:shadow-md">
                                <div className="bg-secondary/10 p-2 rounded-lg group-hover:bg-secondary/20 transition-colors">
                                    <svg className="w-5 h-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-medium text-foreground">Call Us</div>
                                    <div className="text-xs text-muted-foreground">{contactSettings.support_phone || '+1 (555) 123-4567'}</div>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {(contactStats.length > 0 ? contactStats : [
                            { number: "<2h", label: "Average Response Time", icon: "⚡" },
                            { number: "24/7", label: "Support Available", icon: "🛡️" },
                            { number: "98%", label: "Customer Satisfaction", icon: "⭐" },
                            { number: "10K+", label: "Happy Customers", icon: "🎉" }
                        ]).map((stat, index) => (
                            <div key={stat.label} className="text-center">
                                <div className="bg-card rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-border">
                                    <div className="text-2xl mb-2">{stat.icon}</div>
                                    <div className="text-3xl md:text-4xl font-bold text-foreground mb-2">{stat.number}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Methods Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Multiple Ways to Connect</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Choose the communication method that works best for you</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {[
                            {
                                icon: "📧",
                                title: "Email Support",
                                description: "Get detailed help via email",
                                details: ["Technical questions", "Account issues", "Billing inquiries"],
                                contact: contactSettings.support_email || "support@example.com",
                                bgColor: "bg-blue-500/10 border-blue-500/20",
                                iconBg: "bg-blue-500/10",
                                textColor: "text-blue-600 dark:text-blue-400"
                            },
                            {
                                icon: "💬",
                                title: "Live Chat",
                                description: "Instant support when you need it",
                                details: ["Real-time assistance", "Quick questions", "Immediate help"],
                                contact: contactSettings.live_chat_hours || "Available 9AM - 6PM EST",
                                bgColor: "bg-green-500/10 border-green-500/20",
                                iconBg: "bg-green-500/10",
                                textColor: "text-green-600 dark:text-green-400"
                            },
                            {
                                icon: "📞",
                                title: "Phone Support",
                                description: "Speak directly with our team",
                                details: ["Urgent matters", "Complex issues", "Personal consultation"],
                                contact: contactSettings.support_phone || "+1 (555) 123-4567",
                                bgColor: "bg-purple-500/10 border-purple-500/20",
                                iconBg: "bg-purple-500/10",
                                textColor: "text-purple-600 dark:text-purple-400"
                            }
                        ].map((method, index) => (
                            <div key={method.title} className={`bg-card rounded-2xl p-6 border ${method.bgColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                                <div className={`w-12 h-12 ${method.iconBg} rounded-xl flex items-center justify-center text-xl mb-4`}>
                                    {method.icon}
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">{method.title}</h3>
                                <p className="text-muted-foreground mb-4">{method.description}</p>
                                <ul className="space-y-2 mb-6">
                                    {method.details.map((detail) => (
                                        <li key={detail} className="flex items-center text-sm text-muted-foreground">
                                            <svg className="w-4 h-4 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {detail}
                                        </li>
                                    ))}
                                </ul>
                                <div className={`text-sm font-medium ${method.textColor}`}>{method.contact}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{contactSettings.form_section_title || 'Send Us a Message'}</h2>
                        <p className="text-muted-foreground text-lg">{contactSettings.form_section_description || 'Fill out the form below and we\'ll get back to you within 24 hours'}</p>
                    </div>
                    
                    <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                        <div className="p-8">
                            <ContactForm onSubmit={handleSubmit} isSignedIn={isSignedIn} initialEmail={user?.primaryEmailAddress?.emailAddress || ''} initialName={user?.name || ''} />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{contactSettings.faq_section_title || 'Frequently Asked Questions'}</h2>
                        <p className="text-muted-foreground text-lg">{contactSettings.faq_section_description || 'Quick answers to common questions'}</p>
                    </div>
                    
                    <div className="space-y-4">
                        {(contactFaqs.length > 0 ? contactFaqs : [
                            {
                                question: "How quickly do you respond to support requests?",
                                answer: "We typically respond to all support requests within 2 hours during business hours (9 AM - 6 PM EST). For urgent issues, we offer priority support with even faster response times."
                            },
                            {
                                question: "What support channels are available?",
                                answer: "We offer multiple support channels including email, live chat, phone support, and our comprehensive knowledge base. Choose the method that works best for your situation."
                            },
                            {
                                question: "Do you offer technical onboarding assistance?",
                                answer: "Yes! We provide personalized onboarding sessions to help you get started quickly. Our technical team will guide you through setup, integration, and best practices."
                            },
                            {
                                question: "Is support available on weekends?",
                                answer: "While our standard support hours are Monday-Friday, we do offer weekend support for critical issues and enterprise customers. Emergency support is always available."
                            }
                        ]).map((faq, index) => (
                            <div key={index} className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-all duration-300">
                                <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
