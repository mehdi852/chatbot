'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/app/provider';
import { Palette, Eye, Save, RotateCcw, MessageCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WidgetCustomizationPage = () => {
    const router = useRouter();
    const { dbUser } = useUserContext();
    const { toast } = useToast();
    
    // Widget customization state
    const [widgetSettings, setWidgetSettings] = useState({
        primaryColor: '#3b82f6',
        buttonSize: 'medium',
        buttonPosition: 'bottom-right',
        welcomeMessage: 'Hi! How can we help you today?',
        placeholderText: 'Type your message...',
        companyName: 'Support Team',
        showBranding: true,
        borderRadius: 'rounded',
        buttonText: 'Chat with us',
        headerColor: '#1e40af',
        textColor: '#374151',
        backgroundColor: '#ffffff',
        brandName: 'BirdSeed',
        welcomeTitle: 'Hi there! 👋',
        faqTitle: 'Frequently Asked Questions:',
        startChatButtonText: 'Chat with us',
        welcomeBackgroundColor: '#ffffff',
        welcomeTextColor: '#1a202c',
        questionButtonColor: '#f7fafc',
        questionButtonTextColor: '#1a202c'
    });

    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isWidgetOpen, setIsWidgetOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [widgetView, setWidgetView] = useState('home'); // 'home' or 'chat'
    const [selectedQuestion, setSelectedQuestion] = useState('');

    // Add effect to log current gradient colors for debugging
    useEffect(() => {
        console.log('Current widget gradient colors:', {
            primary: widgetSettings.primaryColor,
            header: widgetSettings.headerColor,
            gradient: `linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%)`
        });
    }, [widgetSettings.primaryColor, widgetSettings.headerColor]);

    // Load existing widget settings
    useEffect(() => {
        const loadWidgetSettings = async () => {
            if (!dbUser?.id) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            try {
                console.log('Loading widget settings for user ID:', dbUser.id);
                // Add cache busting parameter
                const response = await fetch(`/api/widget/settings?userId=${dbUser.id}&_t=${Date.now()}`, {
                    method: 'GET',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('Loaded widget settings:', data);
                    
                    if (data.success && data.settings) {
                        // Apply the loaded settings, keeping the current structure
                        setWidgetSettings({
                            primaryColor: data.settings.primaryColor || '#3b82f6',
                            buttonSize: data.settings.buttonSize || 'medium',
                            buttonPosition: data.settings.buttonPosition || 'bottom-right',
                            welcomeMessage: data.settings.welcomeMessage || 'Hi! How can we help you today?',
                            placeholderText: data.settings.placeholderText || 'Type your message...',
                            companyName: data.settings.companyName || 'Support Team',
                            showBranding: data.settings.showBranding !== undefined ? data.settings.showBranding : true,
                            borderRadius: data.settings.borderRadius || 'rounded',
                            buttonText: data.settings.buttonText || 'Chat with us',
                            headerColor: data.settings.headerColor || '#1e40af',
                            textColor: data.settings.textColor || '#374151',
                            backgroundColor: data.settings.backgroundColor || '#ffffff',
                            brandName: data.settings.brandName || 'BirdSeed',
                            welcomeTitle: data.settings.welcomeTitle || 'Hi there! 👋',
                            faqTitle: data.settings.faqTitle || 'Frequently Asked Questions:',
                            startChatButtonText: data.settings.startChatButtonText || 'Chat with us',
                            welcomeBackgroundColor: data.settings.welcomeBackgroundColor || '#ffffff',
                            welcomeTextColor: data.settings.welcomeTextColor || '#1a202c',
                            questionButtonColor: data.settings.questionButtonColor || '#f7fafc',
                            questionButtonTextColor: data.settings.questionButtonTextColor || '#1a202c'
                        });
                        console.log('Widget settings applied successfully');
                    }
                } else {
                    console.error('Failed to load widget settings:', response.status);
                    toast({
                        title: 'Warning',
                        description: 'Could not load your saved widget settings. Using defaults.',
                        variant: 'default',
                    });
                }
            } catch (error) {
                console.error('Error loading widget settings:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load widget settings. Please refresh the page.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadWidgetSettings();
    }, [dbUser?.id, toast]);

    // Handle setting changes
    const handleSettingChange = (key, value) => {
        console.log(`Setting ${key} changed to:`, value);
        setWidgetSettings(prev => {
            const newSettings = {
                ...prev,
                [key]: value
            };
            
            // Log the gradient when primary or header color changes
            if (key === 'primaryColor' || key === 'headerColor') {
                const primaryColor = key === 'primaryColor' ? value : prev.primaryColor;
                const headerColor = key === 'headerColor' ? value : prev.headerColor;
                console.log('User message gradient will be:', `linear-gradient(135deg, ${primaryColor} 0%, ${headerColor} 100%)`);
            }
            
            return newSettings;
        });
        setHasChanges(true);
        
        // Force re-render of preview when colors change
        if (['primaryColor', 'headerColor', 'backgroundColor', 'textColor'].includes(key)) {
            console.log('Color setting changed, forcing preview update');
        }
    };

    // Save settings
    const handleSaveSettings = async () => {
        if (!dbUser?.id) return;
        
        setIsSaving(true);
        try {
            const response = await fetch('/api/widget/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                },
                body: JSON.stringify({
                    userId: dbUser.id,
                    settings: widgetSettings
                }),
            });

            if (response.ok) {
                console.log('Widget settings saved successfully with colors:', {
                    primaryColor: widgetSettings.primaryColor,
                    headerColor: widgetSettings.headerColor
                });
                
                toast({
                    title: 'Settings Saved',
                    description: 'Your widget customization has been saved successfully.',
                    variant: 'success',
                });
                setHasChanges(false);
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save widget settings. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Reset to defaults
    const handleResetToDefaults = () => {
        setWidgetSettings({
            primaryColor: '#3b82f6',
            buttonSize: 'medium',
            buttonPosition: 'bottom-right',
            welcomeMessage: 'Hi! How can we help you today?',
            placeholderText: 'Type your message...',
            companyName: 'Support Team',
            showBranding: true,
            borderRadius: 'rounded',
            buttonText: 'Chat with us',
            headerColor: '#1e40af',
            textColor: '#374151',
            backgroundColor: '#ffffff',
            brandName: 'BirdSeed',
            welcomeTitle: 'Hi there! 👋',
            faqTitle: 'Frequently Asked Questions:',
            startChatButtonText: 'Chat with us',
            welcomeBackgroundColor: '#ffffff',
            welcomeTextColor: '#1a202c',
            questionButtonColor: '#f7fafc',
            questionButtonTextColor: '#1a202c'
        });
        setHasChanges(true);
    };

    // Handle question click - switch widget view to show chat interface
    const handleQuestionClick = (question) => {
        console.log('Question clicked:', question);
        
        // Set the selected question and switch to chat view
        setSelectedQuestion(question);
        setWidgetView('chat');
        
        // Show a toast notification with the clicked question
        toast({
            title: 'Question Selected',
            description: `"${question}" - Switching to chat view`,
            variant: 'default',
        });
    };

    // Widget Preview Component - Using exact structure from fa.js
    const WidgetPreview = useCallback(() => {
        
        // Position mapping
        const positionClasses = {
            'bottom-right': 'bottom-8 right-8',
            'bottom-left': 'bottom-8 left-8',
            'bottom-center': 'bottom-8 left-1/2 transform -translate-x-1/2'
        };

        // Size mapping (using exact pixel values from CSS)
        const getSizeStyle = (size) => {
            switch (size) {
                case 'small': return { width: '48px', height: '48px' };
                case 'medium': return { width: '56px', height: '56px' };
                case 'large': return { width: '64px', height: '64px' };
                default: return { width: '56px', height: '56px' };
            }
        };

                        // Create inline styles matching fa-styles.css
                        const widgetStyles = {
                            '--primary-gradient': `linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%)`,
                            '--primary-color': widgetSettings.primaryColor,
                            '--header-color': widgetSettings.headerColor,
                            '--text-primary': widgetSettings.textColor,
                            '--background-primary': widgetSettings.backgroundColor,
                        };

        // Border radius mapping
        const getBorderRadius = (radius) => {
            switch (radius) {
                case 'none': return '0px';
                case 'small': return '6px';
                case 'rounded': return '12px';
                case 'full': return '24px';
                default: return '12px';
            }
        };

        return (
            <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden" style={widgetStyles}>
                {/* Add fa-styles.css for exact widget styling */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    /* Widget styles from fa-styles.css - Modified for preview */
                    .fa-chat-launcher {
                        position: absolute;
                        border: none;
                        border-radius: 50%;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
                        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                        z-index: 50;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                        overflow: visible;
                        background: linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%) !important;
                    }
                    .fa-chat-launcher:hover {
                        transform: translateY(-4px) scale(1.05);
                        box-shadow: 0 20px 64px rgba(0, 0, 0, 0.2);
                    }
                    .fa-launcher-content {
                        position: relative;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                    }
                    .fa-launcher-icon {
                        width: 24px;
                        height: 24px;
                        color: white;
                        position: relative;
                        z-index: 2;
                    }
                    .fa-launcher-pulse {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 56px;
                        height: 56px;
                        border: 2px solid rgba(255, 255, 255, 0.6);
                        border-radius: 50%;
                        transform: translate(-50%, -50%);
                        animation: ripple 2s infinite;
                        pointer-events: none;
                    }
                    @keyframes ripple {
                        0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                        100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
                    }
                    .fa-launcher-tooltip {
                        position: absolute;
                        right: 80px;
                        top: 50%;
                        transform: translateY(-50%);
                        background: #1a202c;
                        color: white;
                        padding: 12px 16px;
                        border-radius: 12px;
                        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
                        white-space: nowrap;
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                        font-size: 14px;
                        pointer-events: none;
                        z-index: 999998;
                    }
                    .fa-launcher-tooltip::after {
                        content: '';
                        position: absolute;
                        left: 100%;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 0;
                        height: 0;
                        border: 6px solid transparent;
                        border-left-color: #1a202c;
                    }
                    .fa-chat-launcher:hover .fa-launcher-tooltip {
                        opacity: 1;
                        visibility: visible;
                        transform: translateY(-50%) translateX(-8px);
                    }
                    .fa-launcher-tooltip-title {
                        font-weight: 600;
                        margin-bottom: 2px;
                    }
                    .fa-launcher-tooltip-subtitle {
                        font-size: 12px;
                        opacity: 0.8;
                    }
                    .fa-widget-container {
                        position: relative;
                        width: 100%;
                        height: 100%;
                    }
                    .fa-chat-container {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        background: #ffffff;
                        border-radius: ${getBorderRadius(widgetSettings.borderRadius)};
                        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
                        display: flex;
                        flex-direction: column;
                        overflow: hidden;
                        border: 1px solid #e2e8f0;
                    }
                    .fa-home-view {
                        background-color: ${widgetSettings.welcomeBackgroundColor} !important;
                        color: ${widgetSettings.welcomeTextColor} !important;
                        display: flex !important;
                        flex-direction: column !important;
                        height: 100% !important;
                    }
                    .fa-widget-header {
                        background: linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%) !important;
                        color: white;
                        padding: 16px 20px;
                        border-radius: ${getBorderRadius(widgetSettings.borderRadius)} ${getBorderRadius(widgetSettings.borderRadius)} 0 0;
                        position: relative;
                        overflow: hidden;
                    }
                    .fa-header-content {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        position: relative;
                        z-index: 2;
                    }
                    .fa-agent-info {
                        display: flex;
                        align-items: center;
                        gap: 16px;
                        flex: 1;
                    }
                    .fa-agent-avatar {
                        position: relative;
                        flex-shrink: 0;
                    }
                    .fa-avatar-gradient {
                        width: 40px;
                        height: 40px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        backdrop-filter: blur(10px);
                        border: 2px solid rgba(255, 255, 255, 0.3);
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    }
                    .fa-avatar-icon {
                        width: 20px;
                        height: 20px;
                        color: white;
                        opacity: 0.95;
                    }
                    .fa-agent-details {
                        flex: 1;
                        min-width: 0;
                    }
                    .fa-agent-name {
                        font-size: 15px;
                        font-weight: 600;
                        margin-bottom: 2px;
                        color: white;
                    }
                    .fa-agent-status {
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.85);
                        font-weight: 400;
                    }
                    .fa-header-actions {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .fa-close-btn {
                        width: 28px;
                        height: 28px;
                        background: rgba(255, 255, 255, 0.15);
                        border: none;
                        border-radius: 12px;
                        color: white;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                        backdrop-filter: blur(10px);
                    }
                    .fa-close-btn:hover {
                        background: rgba(255, 255, 255, 0.25);
                        transform: scale(1.05);
                    }
                    .fa-close-btn svg {
                        width: 14px;
                        height: 14px;
                    }
                    .fa-home-body {
                        flex: 1 !important;
                        padding: 20px !important;
                        overflow-y: auto !important;
                        min-height: 0 !important;
                        position: relative !important;
                        display: flex !important;
                        flex-direction: column !important;
                    }
                    .fa-welcome-section {
                        margin-bottom: 24px !important;
                    }
                    .fa-welcome-message {
                        display: flex !important;
                        align-items: flex-start !important;
                        gap: 16px !important;
                        margin-bottom: 8px !important;
                    }
                    .fa-welcome-text {
                        flex: 1 !important;
                    }
                    .fa-welcome-title {
                        color: ${widgetSettings.welcomeTextColor} !important;
                        font-size: 18px !important;
                        font-weight: 700 !important;
                        margin-bottom: 4px !important;
                    }
                    .fa-welcome-subtitle {
                        color: ${widgetSettings.welcomeTextColor} !important;
                        font-size: 14px !important;
                        line-height: 1.4 !important;
                        opacity: 0.8 !important;
                    }
                    .fa-questions-section {
                        margin-top: 16px !important;
                        flex: 1 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        min-height: 0 !important;
                    }
                    .fa-questions-title {
                        color: ${widgetSettings.welcomeTextColor} !important;
                        font-size: 16px !important;
                        font-weight: 600 !important;
                        margin-bottom: 16px !important;
                    }
                    .fa-questions-list {
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 12px !important;
                        flex: 1 !important;
                        min-height: 0 !important;
                    }
                    .fa-question-btn {
                        background-color: ${widgetSettings.questionButtonColor} !important;
                        color: ${widgetSettings.questionButtonTextColor} !important;
                        padding: 16px 20px !important;
                        border: 1px solid #e2e8f0 !important;
                        border-radius: 12px !important;
                        font-size: 14px !important;
                        font-weight: 500 !important;
                        cursor: pointer !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: space-between !important;
                        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        text-align: left !important;
                        width: 100% !important;
                    }
                    .fa-question-btn:hover {
                        background-color: ${widgetSettings.primaryColor} !important;
                        color: white !important;
                        border-color: ${widgetSettings.primaryColor} !important;
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
                    }
                    .fa-home-footer {
                        padding: 12px 16px !important;
                        border-top: 1px solid #e2e8f0 !important;
                        background-color: ${widgetSettings.welcomeBackgroundColor} !important;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        gap: 6px !important;
                        flex-shrink: 0 !important;
                        margin-top: auto !important;
                        box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.1) !important;
                    }
                    .fa-start-chat-btn {
                        background: linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%) !important;
                        display: flex !important;
                        align-items: center !important;
                        gap: 10px !important;
                        padding: 10px 20px !important;
                        color: white !important;
                        border: none !important;
                        border-radius: 50px !important;
                        font-weight: 600 !important;
                        font-size: 15px !important;
                        cursor: pointer !important;
                        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        width: 100% !important;
                        justify-content: center !important;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
                    }
                    .fa-start-chat-btn:hover {
                        transform: translateY(-1px) !important;
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
                    }
                    .fa-start-chat-btn svg {
                        width: 20px !important;
                        height: 20px !important;
                        fill: currentColor !important;
                    }
                    `
                }} />
                {/* Simulated website background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Website</h3>
                        <p className="text-gray-600 text-sm">This is how your chat widget will appear on your website. Click the chat button to test the interaction.</p>
                        <div className="mt-4 space-y-2">
                            <div className="h-2 bg-gray-200 rounded"></div>
                            <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>

                {/* Chat Widget - Exact structure from fa.js */}
                <div className={`fixed ${positionClasses[widgetSettings.buttonPosition]} z-50`}>
                    {/* Widget Overlay */}
                    {isWidgetOpen && (
                        <div key={`widget-${widgetSettings.primaryColor}-${widgetSettings.headerColor}`} className="fa-widget-overlay" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '16px', width: '360px', height: '580px', display: 'block' }}>
                            <div className="fa-widget-container">
                                <div className="fa-chat-container">
                                    {widgetView === 'home' ? (
                                        // Home view (FAQ questions)
                                        <div className="fa-home-view" style={{ backgroundColor: widgetSettings.welcomeBackgroundColor }}>
                                            <div className="fa-widget-header">
                                                <div className="fa-header-content">
                                                    <div className="fa-agent-info">
                                                        <div className="fa-agent-avatar">
                                                            <div className="fa-avatar-gradient">
                                                                <svg className="fa-avatar-icon" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" fill="currentColor"/>
                                                                    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" fill="currentColor"/>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div className="fa-agent-details">
                                                            <div className="fa-agent-name" style={{ color: 'white' }}>{widgetSettings.companyName}</div>
                                                            <div className="fa-agent-status" style={{ color: 'white' }}>We're here to help!</div>
                                                        </div>
                                                    </div>
                                                    <div className="fa-header-actions">
                                                        <button className="fa-close-btn" title="Close" onClick={() => setIsWidgetOpen(false)}>
                                                            <svg viewBox="0 0 24 24" fill="none">
                                                                <path d="M18.3 5.71C17.91 5.32 17.28 5.32 16.89 5.71L12 10.59L7.11 5.7C6.72 5.31 6.09 5.31 5.7 5.7C5.31 6.09 5.31 6.72 5.7 7.11L10.59 12L5.7 16.89C5.31 17.28 5.31 17.91 5.7 18.3C6.09 18.69 6.72 18.69 7.11 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.11C18.68 6.73 18.68 6.09 18.3 5.71Z" fill="currentColor"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="fa-home-body" style={{ color: widgetSettings.welcomeTextColor }}>
                                                <div className="fa-welcome-section">
                                                    <div className="fa-welcome-message">
                                                        <div className="fa-welcome-text">
                                                            <div className="fa-welcome-title">{widgetSettings.welcomeTitle}</div>
                                                            <div className="fa-welcome-subtitle">{widgetSettings.welcomeMessage}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="fa-questions-section">
                                                    <div className="fa-questions-title">{widgetSettings.faqTitle}</div>
                                                    <div className="fa-questions-list">
                                                        <button 
                                                            className="fa-question-btn"
                                                            onClick={() => handleQuestionClick("What are your business hours?")}
                                                        >
                                                            What are your business hours?
                                                        </button>
                                                        <button 
                                                            className="fa-question-btn"
                                                            onClick={() => handleQuestionClick("How can I contact customer support?")}
                                                        >
                                                            How can I contact customer support?
                                                        </button>
                                                        <button 
                                                            className="fa-question-btn"
                                                            onClick={() => handleQuestionClick("Do you offer refunds?")}
                                                        >
                                                            Do you offer refunds?
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="fa-home-footer">
                                                <button className="fa-start-chat-btn" onClick={() => handleQuestionClick("Direct chat")}>  
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
                                                    </svg>
                                                    <span>{widgetSettings.startChatButtonText}</span>
                                                </button>
                                                {widgetSettings.showBranding && (
                                                    <div className="fa-powered-by">
                                                        <div className="fa-branding" style={{ color: widgetSettings.welcomeTextColor, opacity: 0.6 }}>
                                                            Powered by <strong style={{ color: widgetSettings.welcomeTextColor }}>{widgetSettings.brandName}</strong>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        // Chat view (conversation with dummy data)
                                        <div className="fa-chat-view" style={{ backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                            <div className="fa-widget-header">
                                                <div className="fa-header-content">
                                                    <div className="fa-agent-info">
                                                        <button 
                                                            className="fa-back-btn" 
                                                            onClick={() => setWidgetView('home')}
                                                            style={{ 
                                                                background: 'rgba(255, 255, 255, 0.15)', 
                                                                border: 'none', 
                                                                borderRadius: '12px', 
                                                                color: 'white', 
                                                                cursor: 'pointer', 
                                                                padding: '8px', 
                                                                marginRight: '12px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <svg viewBox="0 0 24 24" fill="none" style={{ width: '16px', height: '16px' }}>
                                                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                        </button>
                                                        <div className="fa-agent-avatar">
                                                            <div className="fa-avatar-gradient">
                                                                <svg className="fa-avatar-icon" viewBox="0 0 24 24" fill="none">
                                                                    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" fill="currentColor"/>
                                                                    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" fill="currentColor"/>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                        <div className="fa-agent-details">
                                                            <div className="fa-agent-name" style={{ color: 'white' }}>{widgetSettings.companyName}</div>
                                                            <div className="fa-agent-status" style={{ color: 'white' }}>Online now</div>
                                                        </div>
                                                    </div>
                                                    <div className="fa-header-actions">
                                                        <button className="fa-close-btn" title="Close" onClick={() => setIsWidgetOpen(false)}>
                                                            <svg viewBox="0 0 24 24" fill="none">
                                                                <path d="M18.3 5.71C17.91 5.32 17.28 5.32 16.89 5.71L12 10.59L7.11 5.7C6.72 5.31 6.09 5.31 5.7 5.7C5.31 6.09 5.31 6.72 5.7 7.11L10.59 12L5.7 16.89C5.31 17.28 5.31 17.91 5.7 18.3C6.09 18.69 6.72 18.69 7.11 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.11C18.68 6.73 18.68 6.09 18.3 5.71Z" fill="currentColor"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Chat Messages */}
                                            <div className="fa-chat-messages" style={{ flex: 1, padding: '16px', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
                                                {/* User Question */}
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                                    <div style={{ 
                                                        background: `linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%)`,
                                                        color: 'white',
                                                        padding: '12px 16px',
                                                        borderRadius: '18px 18px 4px 18px',
                                                        maxWidth: '80%',
                                                        fontSize: '14px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}>
                                                        {selectedQuestion}
                                                    </div>
                                                </div>
                                                
                                                {/* AI Response */}
                                                <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                                                    <div style={{ 
                                                        width: '32px',
                                                        height: '32px',
                                                        background: 'rgba(255, 255, 255, 0.2)',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                        border: `2px solid ${widgetSettings.primaryColor}20`
                                                    }}>
                                                        <svg viewBox="0 0 24 24" fill="none" style={{ width: '16px', height: '16px', color: widgetSettings.primaryColor }}>
                                                            <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" fill="currentColor"/>
                                                            <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" fill="currentColor"/>
                                                        </svg>
                                                    </div>
                                                    <div style={{ 
                                                        backgroundColor: 'white',
                                                        color: '#374151',
                                                        padding: '12px 16px',
                                                        borderRadius: '18px 18px 18px 4px',
                                                        maxWidth: '80%',
                                                        fontSize: '14px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                        border: '1px solid #e5e7eb'
                                                    }}>
                                                        {selectedQuestion.includes('business hours') && (
                                                            "We're open Monday through Friday from 9 AM to 6 PM EST, and Saturday from 10 AM to 4 PM EST. We're closed on Sundays and major holidays."
                                                        )}
                                                        {selectedQuestion.includes('contact customer support') && (
                                                            "You can reach our customer support team through this chat, by email at support@company.com, or by calling 1-800-SUPPORT (1-800-787-7678) during business hours."
                                                        )}
                                                        {selectedQuestion.includes('refunds') && (
                                                            "Yes, we offer a 30-day money-back guarantee on all purchases. To request a refund, please contact our support team with your order number and we'll process it within 3-5 business days."
                                                        )}
                                                        {!selectedQuestion.includes('business hours') && !selectedQuestion.includes('contact customer support') && !selectedQuestion.includes('refunds') && (
                                                            "Thank you for your message! Our support team will get back to you shortly. Is there anything else I can help you with today?"
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Suggested follow-up */}
                                                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '8px', gap: '8px', flexWrap: 'wrap' }}>
                                                    <button style={{
                                                        backgroundColor: widgetSettings.questionButtonColor,
                                                        color: widgetSettings.questionButtonTextColor,
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '20px',
                                                        padding: '8px 16px',
                                                        fontSize: '13px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        Need more help?
                                                    </button>
                                                    <button style={{
                                                        backgroundColor: widgetSettings.questionButtonColor,
                                                        color: widgetSettings.questionButtonTextColor,
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '20px',
                                                        padding: '8px 16px',
                                                        fontSize: '13px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        Contact human agent
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {/* Chat Input */}
                                            <div className="fa-chat-footer" style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '24px', border: '1px solid #e5e7eb' }}>
                                                    <input 
                                                        type="text" 
                                                        placeholder={widgetSettings.placeholderText}
                                                        style={{ 
                                                            flex: 1, 
                                                            border: 'none', 
                                                            background: 'transparent', 
                                                            outline: 'none', 
                                                            fontSize: '14px',
                                                            color: '#374151'
                                                        }}
                                                        disabled
                                                    />
                                                    <button style={{
                                                        background: `linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%)`,
                                                        border: 'none',
                                                        borderRadius: '20px',
                                                        width: '32px',
                                                        height: '32px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}>
                                                        <svg viewBox="0 0 24 24" fill="none" style={{ width: '16px', height: '16px', color: 'white' }}>
                                                            <path d="M22 2L11 13L5 7L6 6L11 11L21 1L22 2Z" fill="currentColor"/>
                                                            <path d="M22 2L2 11L9 13L11 20L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat Launcher Button */}
                    <button
                        className="fa-chat-launcher"
                        onClick={() => setIsWidgetOpen(!isWidgetOpen)}
                        style={{
                            ...getSizeStyle(widgetSettings.buttonSize),
                            background: `linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%)`,
                            border: 'none'
                        }}
                    >
                        <div className="fa-launcher-content">
                            <div className="fa-launcher-icon">
                                {isWidgetOpen ? (
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M18.3 5.71C17.91 5.32 17.28 5.32 16.89 5.71L12 10.59L7.11 5.7C6.72 5.31 6.09 5.31 5.7 5.7C5.31 6.09 5.31 6.72 5.7 7.11L10.59 12L5.7 16.89C5.31 17.28 5.31 17.91 5.7 18.3C6.09 18.69 6.72 18.69 7.11 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.11C18.68 6.73 18.68 6.09 18.3 5.71Z" fill="currentColor"/>
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="none">
                                        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM13 14H11V12H13V14ZM13 10H11V6H13V10Z" fill="currentColor"/>
                                    </svg>
                                )}
                            </div>
                            <div className="fa-launcher-pulse"></div>
                        </div>
                        
                        {/* Launcher Tooltip */}
                        {widgetSettings.buttonText && (
                            <div className="fa-launcher-tooltip">
                                <div className="fa-launcher-tooltip-content">
                                    <div className="fa-launcher-tooltip-title">{widgetSettings.buttonText}</div>
                                    <div className="fa-launcher-tooltip-subtitle">Chat with our support team</div>
                                </div>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        );
    }, [widgetSettings, isWidgetOpen, widgetView, selectedQuestion]);

    // Show minimal loading state while fetching settings
    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-64px)] bg-gray-50 items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50">
            {/* Settings Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-md">
                {/* Header */}
                <div className="border-b border-gray-200 bg-gray-50/50">
                    <div className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Palette className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Widget Customization</h2>
                                <p className="text-sm text-gray-600">Customize your chat widget appearance</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Form */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Appearance */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Appearance</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        value={widgetSettings.primaryColor}
                                        onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                                        className="w-8 h-8 rounded border border-gray-300"
                                    />
                                    <input
                                        type="text"
                                        value={widgetSettings.primaryColor}
                                        onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Header Color</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        value={widgetSettings.headerColor}
                                        onChange={(e) => handleSettingChange('headerColor', e.target.value)}
                                        className="w-8 h-8 rounded border border-gray-300"
                                    />
                                    <input
                                        type="text"
                                        value={widgetSettings.headerColor}
                                        onChange={(e) => handleSettingChange('headerColor', e.target.value)}
                                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
                                <select
                                    value={widgetSettings.borderRadius}
                                    onChange={(e) => handleSettingChange('borderRadius', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="none">None</option>
                                    <option value="small">Small</option>
                                    <option value="rounded">Rounded</option>
                                    <option value="full">Full</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Button Settings */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Button Settings</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Button Size</label>
                                <select
                                    value={widgetSettings.buttonSize}
                                    onChange={(e) => handleSettingChange('buttonSize', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                <select
                                    value={widgetSettings.buttonPosition}
                                    onChange={(e) => handleSettingChange('buttonPosition', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="bottom-right">Bottom Right</option>
                                    <option value="bottom-left">Bottom Left</option>
                                    <option value="bottom-center">Bottom Center</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Button Tooltip Text</label>
                                <input
                                    type="text"
                                    value={widgetSettings.buttonText}
                                    onChange={(e) => handleSettingChange('buttonText', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Chat with us"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Welcome Screen */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Welcome Screen</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Title</label>
                                <input
                                    type="text"
                                    value={widgetSettings.welcomeTitle}
                                    onChange={(e) => handleSettingChange('welcomeTitle', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Hi there! 👋"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Welcome Message</label>
                                <textarea
                                    value={widgetSettings.welcomeMessage}
                                    onChange={(e) => handleSettingChange('welcomeMessage', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                                    placeholder="Hi! How can we help you today?"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">FAQ Title</label>
                                <input
                                    type="text"
                                    value={widgetSettings.faqTitle}
                                    onChange={(e) => handleSettingChange('faqTitle', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Frequently Asked Questions:"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Chat Button Text</label>
                                <input
                                    type="text"
                                    value={widgetSettings.startChatButtonText}
                                    onChange={(e) => handleSettingChange('startChatButtonText', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Chat with us"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Messages</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                <input
                                    type="text"
                                    value={widgetSettings.companyName}
                                    onChange={(e) => handleSettingChange('companyName', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Support Team"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Branding</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Show Branding</label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={widgetSettings.showBranding} 
                                        onChange={(e) => handleSettingChange('showBranding', e.target.checked)} 
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-none after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                            {widgetSettings.showBranding && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                                    <input
                                        type="text"
                                        value={widgetSettings.brandName}
                                        onChange={(e) => handleSettingChange('brandName', e.target.value)}
                                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Your Brand Name"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 border-t border-gray-200 bg-gray-50/50 space-y-2">
                    <button
                        onClick={handleSaveSettings}
                        disabled={!hasChanges || isSaving}
                        className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            hasChanges && !isSaving
                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Save className="w-4 h-4" />
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    
                    <button
                        onClick={handleResetToDefaults}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-all duration-200"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>Reset to Defaults</span>
                    </button>
                </div>
            </div>

            {/* Preview Area */}
            <div className="flex-1 flex flex-col bg-white">
                {/* Preview Header */}
                <div className="px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
                            <p className="text-sm text-gray-500">See how your widget will look on your website</p>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <Eye className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600 font-medium">Preview Mode</span>
                        </div>
                    </div>
                </div>

                {/* Preview Container */}
                <div className="flex-1 relative bg-gray-50">
                    <WidgetPreview />
                </div>
            </div>
        </div>
    );
};

export default WidgetCustomizationPage;
