'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUserContext } from '@/app/provider';
import { Palette, Eye, Save, RotateCcw, MessageCircle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WidgetCustomizationPage = () => {
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
        brandName: 'BirdSeed'
    });

    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [isWidgetOpen, setIsWidgetOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
                            brandName: data.settings.brandName || 'BirdSeed'
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
            brandName: 'BirdSeed'
        });
        setHasChanges(true);
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
                    .fa-widget-header {
                        background: linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%) !important;
                        color: white;
                        padding: 16px 20px;
                        border-radius: ${getBorderRadius(widgetSettings.borderRadius)} ${getBorderRadius(widgetSettings.borderRadius)} 0 0;
                        position: relative;
                        overflow: hidden;
                    }
                    .fa-widget-header::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
                        pointer-events: none;
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
                    .fa-status-badge {
                        position: absolute;
                        bottom: -2px;
                        right: -2px;
                        width: 12px;
                        height: 12px;
                        background: #ef4444;
                        border-radius: 50%;
                        border: 2px solid #ffffff;
                        transition: background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    .fa-status-badge.online {
                        background: #48bb78;
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
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
                    .fa-minimize-btn, .fa-close-btn {
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
                    .fa-minimize-btn:hover, .fa-close-btn:hover {
                        background: rgba(255, 255, 255, 0.25);
                        transform: scale(1.05);
                    }
                    .fa-minimize-btn svg, .fa-close-btn svg {
                        width: 14px;
                        height: 14px;
                    }
                    .fa-widget-body {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        min-height: 0;
                    }
                    .fa-messages-container {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        min-height: 0;
                    }
                    .fa-messages-scroll {
                        flex: 1;
                        overflow-y: auto;
                        padding: 16px 20px;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                        min-height: 0;
                    }
                    .fa-messages-scroll::-webkit-scrollbar {
                        width: 6px;
                    }
                    .fa-messages-scroll::-webkit-scrollbar-thumb {
                        background: #cbd5e0;
                        border-radius: 8px;
                    }
                    .fa-welcome-message {
                        display: flex;
                        align-items: flex-start;
                        gap: 10px;
                        margin-bottom: 6px;
                    }
                    .fa-welcome-avatar {
                        width: 32px;
                        height: 32px;
                        background: #e6f0ff;
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                        border: 2px solid #667eea;
                    }
                    .fa-welcome-avatar svg {
                        width: 16px;
                        height: 16px;
                        color: #667eea;
                    }
                    .fa-welcome-text {
                        flex: 1;
                    }
                    .fa-welcome-title {
                        font-size: 15px;
                        font-weight: 600;
                        color: #1a202c;
                        margin-bottom: 3px;
                    }
                    .fa-welcome-subtitle {
                        font-size: 13px;
                        color: #4a5568;
                        line-height: 1.4;
                    }
                    .fa-widget-footer {
                        padding: 12px 16px;
                        background: #ffffff;
                        border-top: 1px solid #e2e8f0;
                    }
                    .fa-input-container {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .fa-input-wrapper {
                        display: flex;
                        align-items: flex-end;
                        gap: 8px;
                    }
                    .fa-input-field {
                        flex: 1;
                        background: #f7fafc;
                        border: 1px solid #e2e8f0;
                        border-radius: ${Math.min(8, parseInt(getBorderRadius(widgetSettings.borderRadius)))}px;
                        padding: 1px;
                        display: flex;
                        align-items: flex-end;
                        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative;
                    }
                    .fa-input-field:focus-within {
                        background: #ffffff;
                        border-color: #667eea;
                    }
                    .fa-message-input {
                        flex: 1;
                        background: transparent;
                        border: none;
                        outline: none !important;
                        resize: none;
                        padding: 8px 12px;
                        font-size: 14px;
                        line-height: 1.3;
                        color: #1a202c;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                        min-height: 36px;
                        max-height: 80px;
                        overflow-y: auto;
                    }
                    .fa-message-input::placeholder {
                        color: #a0aec0;
                    }
                    .fa-input-actions {
                        display: flex;
                        align-items: center;
                        padding: 4px;
                    }
                    .fa-emoji-btn {
                        width: 28px;
                        height: 28px;
                        background: transparent;
                        border: none;
                        border-radius: 8px;
                        color: #a0aec0;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .fa-emoji-btn:hover {
                        background: rgba(102, 126, 234, 0.1);
                        color: #667eea;
                        transform: scale(1.05);
                    }
                    .fa-emoji-btn svg {
                        width: 16px;
                        height: 16px;
                    }
                    .fa-send-btn {
                        width: 36px;
                        height: 36px;
                        border: none;
                        border-radius: ${Math.min(8, parseInt(getBorderRadius(widgetSettings.borderRadius)))}px;
                        color: white;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                        flex-shrink: 0;
                    }
                    .fa-send-btn:hover {
                        transform: scale(1.05);
                        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
                    }
                    .fa-send-btn svg {
                        width: 16px;
                        height: 16px;
                    }
                    .fa-powered-by {
                        margin-top: 8px;
                    }
                    .fa-branding {
                        text-align: center;
                        font-size: 11px;
                        color: #a0aec0;
                        font-weight: 400;
                    }
                    .fa-branding strong {
                        color: #718096;
                        font-weight: 500;
                    }
                    .fa-widget-message {
                        max-width: 260px;
                        padding: 10px 14px;
                        border-radius: ${Math.min(12, parseInt(getBorderRadius(widgetSettings.borderRadius)))}px;
                        font-size: 14px;
                        line-height: 1.4;
                        word-wrap: break-word;
                        position: relative;
                        animation: fadeIn 0.3s ease-out;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
                        margin-bottom: 8px;
                    }
                    .fa-widget-message.admin {
                        align-self: flex-start;
                        border-bottom-left-radius: 4px;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    }
                    .fa-widget-message.user {
                        align-self: flex-end;
                        border-bottom-right-radius: 4px;
                        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    }
                    .fa-typing-indicator {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 14px;
                        border-radius: ${Math.min(12, parseInt(getBorderRadius(widgetSettings.borderRadius)))}px;
                        border-bottom-left-radius: 4px;
                        align-self: flex-start;
                        max-width: 100px;
                        animation: fadeIn 0.3s ease-out;
                        margin-bottom: 8px;
                    }
                    .fa-typing-dots {
                        display: flex;
                        gap: 4px;
                    }
                    .fa-typing-dots span {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        animation: typing 1.4s infinite ease-in-out;
                    }
                    .fa-typing-dots span:nth-child(1) { animation-delay: 0s; }
                    .fa-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
                    .fa-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
                    @keyframes fadeIn {
                        0% { opacity: 0; transform: translateY(10px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes typing {
                        0%, 80%, 100% { 
                            transform: scale(0.8);
                            opacity: 0.5;
                        }
                        40% { 
                            transform: scale(1);
                            opacity: 1;
                        }
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
                        <div key={`widget-${widgetSettings.primaryColor}-${widgetSettings.headerColor}-${widgetSettings.backgroundColor}-${widgetSettings.textColor}`} className="fa-widget-overlay" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '16px', width: '360px', height: '580px', display: 'block' }}>
                            <div className="fa-widget-container">
                                <div className="fa-chat-container">
                                    {/* Widget Header */}
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
                                                    <div className="fa-status-badge online">
                                                        <div className="fa-status-dot"></div>
                                                    </div>
                                                </div>
                                                <div className="fa-agent-details">
                                                    <div className="fa-agent-name">{widgetSettings.companyName}</div>
                                                    <div className="fa-agent-status">Agent is online</div>
                                                </div>
                                            </div>
                                            <div className="fa-header-actions">
                                                <button className="fa-minimize-btn" title="Minimize">
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <path d="M19 13H5V11H19V13Z" fill="currentColor"/>
                                                    </svg>
                                                </button>
                                                <button className="fa-close-btn" title="Close" onClick={() => setIsWidgetOpen(false)}>
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <path d="M18.3 5.71C17.91 5.32 17.28 5.32 16.89 5.71L12 10.59L7.11 5.7C6.72 5.31 6.09 5.31 5.7 5.7C5.31 6.09 5.31 6.72 5.7 7.11L10.59 12L5.7 16.89C5.31 17.28 5.31 17.91 5.7 18.3C6.09 18.69 6.72 18.69 7.11 18.3L12 13.41L16.89 18.3C17.28 18.69 17.91 18.69 18.3 18.3C18.69 17.91 18.69 17.28 18.3 16.89L13.41 12L18.3 7.11C18.68 6.73 18.68 6.09 18.3 5.71Z" fill="currentColor"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Widget Body */}
                                    <div className="fa-widget-body">
                                        <div className="fa-messages-container">
                                            <div className="fa-messages-scroll" style={{ backgroundColor: widgetSettings.backgroundColor }}>
                                                {/* Welcome Message */}
                                                <div className="fa-welcome-message">
                                                    <div className="fa-welcome-avatar">
                                                        <svg viewBox="0 0 24 24" fill="none">
                                                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9ZM12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8Z" fill="currentColor"/>
                                                        </svg>
                                                    </div>
                                                    <div className="fa-welcome-text">
                                                        <div className="fa-welcome-title">Hi there! 👋</div>
                                                        <div className="fa-welcome-subtitle">{widgetSettings.welcomeMessage}</div>
                                                    </div>
                                                </div>
                                                
                                                {/* Mock Conversation Messages */}
                                                <div className="fa-widget-message admin" style={{ 
                                                    backgroundColor: widgetSettings.backgroundColor, 
                                                    color: widgetSettings.textColor,
                                                    border: `1px solid #e2e8f0`
                                                }}>
                                                    Thanks for reaching out! I'm here to help. What can I assist you with today?
                                                </div>
                                                
                                                <div className="fa-widget-message user" style={{ 
                                                    background: `linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%)`,
                                                    color: 'white'
                                                }}>
                                                    Hi! I'm interested in your pricing plans. Can you tell me more?
                                                </div>
                                                
                                                <div className="fa-widget-message admin" style={{ 
                                                    backgroundColor: widgetSettings.backgroundColor, 
                                                    color: widgetSettings.textColor,
                                                    border: `1px solid #e2e8f0`
                                                }}>
                                                    Absolutely! We have several plans designed to fit different needs. Let me share the details with you. 📊
                                                </div>
                                                
                                                <div className="fa-widget-message user" style={{ 
                                                    background: `linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%)`,
                                                    color: 'white'
                                                }}>
                                                    That sounds perfect! I'd love to learn more about the premium features.
                                                </div>
                                                
                                                {/* Typing Indicator */}
                                                <div className="fa-typing-indicator" style={{
                                                    backgroundColor: widgetSettings.backgroundColor,
                                                    border: `1px solid #e2e8f0`
                                                }}>
                                                    <div className="fa-typing-dots">
                                                        <span style={{ backgroundColor: widgetSettings.textColor, opacity: 0.4 }}></span>
                                                        <span style={{ backgroundColor: widgetSettings.textColor, opacity: 0.4 }}></span>
                                                        <span style={{ backgroundColor: widgetSettings.textColor, opacity: 0.4 }}></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Widget Footer */}
                                    <div className="fa-widget-footer" style={{ backgroundColor: widgetSettings.backgroundColor }}>
                                        <div className="fa-input-container">
                                            <div className="fa-input-wrapper">
                                                <div className="fa-input-field">
                                                    <textarea 
                                                        className="fa-message-input" 
                                                        placeholder={widgetSettings.placeholderText}
                                                        rows="1"
                                                        style={{ color: widgetSettings.textColor }}
                                                    ></textarea>
                                                    <div className="fa-input-actions">
                                                        <button className="fa-emoji-btn" title="Add emoji">
                                                            <svg viewBox="0 0 24 24" fill="none">
                                                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15.5 8C16.33 8 17 8.67 17 9.5C17 10.33 16.33 11 15.5 11C14.67 11 14 10.33 14 9.5C14 8.67 14.67 8 15.5 8ZM8.5 8C9.33 8 10 8.67 10 9.5C10 10.33 9.33 11 8.5 11C7.67 11 7 10.33 7 9.5C7 8.67 7.67 8 8.5 8ZM12 17.5C9.67 17.5 7.69 16.04 6.89 14H17.11C16.31 16.04 14.33 17.5 12 17.5Z" fill="currentColor"/>
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                <button className="fa-send-btn" title="Send message" style={{ background: `linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%)` }}>
                                                    <svg viewBox="0 0 24 24" fill="none">
                                                        <path d="M3.4 20.4L20.85 12.92C21.66 12.57 21.66 11.43 20.85 11.08L3.4 3.6C2.74 3.31 2.01 3.8 2.01 4.51L2 9.12C2 9.62 2.37 10.05 2.87 10.11L15 12L2.87 13.88C2.37 13.95 2 14.38 2 14.88L2.01 19.49C2.01 20.2 2.74 20.69 3.4 20.4Z" fill="currentColor"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        {widgetSettings.showBranding && (
                                            <div className="fa-powered-by">
                                                <div className="fa-branding">
                                                    Powered by <strong>{widgetSettings.brandName}</strong>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Chat Launcher Button - Exact structure from fa.js */}
                    <button
                        key={`launcher-${widgetSettings.primaryColor}-${widgetSettings.headerColor}`}
                        className="fa-chat-launcher"
                        onClick={() => setIsWidgetOpen(!isWidgetOpen)}
                        style={{
                            ...getSizeStyle(widgetSettings.buttonSize),
                            background: `linear-gradient(135deg, ${widgetSettings.primaryColor} 0%, ${widgetSettings.headerColor} 100%) !important`,
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
    }, [widgetSettings, isWidgetOpen]);

    // Show loading state while fetching settings
    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-64px)] bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your widget settings...</p>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        value={widgetSettings.backgroundColor}
                                        onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                                        className="w-8 h-8 rounded border border-gray-300"
                                    />
                                    <input
                                        type="text"
                                        value={widgetSettings.backgroundColor}
                                        onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="color"
                                        value={widgetSettings.textColor}
                                        onChange={(e) => handleSettingChange('textColor', e.target.value)}
                                        className="w-8 h-8 rounded border border-gray-300"
                                    />
                                    <input
                                        type="text"
                                        value={widgetSettings.textColor}
                                        onChange={(e) => handleSettingChange('textColor', e.target.value)}
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Placeholder Text</label>
                                <input
                                    type="text"
                                    value={widgetSettings.placeholderText}
                                    onChange={(e) => handleSettingChange('placeholderText', e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Type your message..."
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
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
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
