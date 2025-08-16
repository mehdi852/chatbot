'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from '@/app/provider';
import { Bot, Save, RotateCcw, Globe, Info, AlertCircle, CheckCircle, Building, Users, Clock, Phone, Tag, Shield, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AiAgentPage = () => {
    const { dbUser } = useUserContext();
    const { toast } = useToast();
    
    const [websites, setWebsites] = useState([]);
    const [selectedWebsiteId, setSelectedWebsiteId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    
    // AI Agent data state
    const [agentData, setAgentData] = useState({
        business_name: '',
        business_type: '',
        business_description: '',
        products_services: '',
        target_audience: '',
        business_hours: '',
        contact_information: '',
        special_offers: '',
        policies: '',
        inventory_info: ''
    });

    // Load user's websites
    useEffect(() => {
        if (!dbUser) return;
        fetchWebsites();
    }, [dbUser]);

    // Load agent data when website is selected
    useEffect(() => {
        if (selectedWebsiteId) {
            fetchAgentData(selectedWebsiteId);
        }
    }, [selectedWebsiteId]);

    const fetchWebsites = async () => {
        try {
            const response = await fetch(`/api/user/get-project?userId=${dbUser.id}`);
            if (!response.ok) throw new Error('Failed to fetch websites');
            const data = await response.json();
            setWebsites(data);
            
            // Auto-select first website if available
            if (data.length > 0) {
                setSelectedWebsiteId(data[0].id.toString());
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast({
                title: 'Error',
                description: 'Failed to load your websites. Please refresh the page.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAgentData = async (websiteId) => {
        try {
            const response = await fetch(`/api/ai-agent/data?websiteId=${websiteId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setAgentData(data.data);
                }
            }
        } catch (error) {
            console.error('Error loading agent data:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setAgentData(prev => ({
            ...prev,
            [field]: value
        }));
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!selectedWebsiteId) {
            toast({
                title: 'Error',
                description: 'Please select a website first.',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/api/ai-agent/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    websiteId: selectedWebsiteId,
                    ...agentData
                }),
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'AI agent data has been saved successfully.',
                    variant: 'success',
                });
                setHasChanges(false);
            } else {
                throw new Error('Failed to save data');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save AI agent data. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setAgentData({
            business_name: '',
            business_type: '',
            business_description: '',
            products_services: '',
            target_audience: '',
            business_hours: '',
            contact_information: '',
            special_offers: '',
            policies: '',
            inventory_info: ''
        });
        setHasChanges(true);
    };

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-64px)] bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your AI agent settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
            {/* Header */}
            <div className="max-w-[1400px] mx-auto pt-8 pb-6 px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Bot className="h-8 w-8 text-primary" />
                            </div>
                            AI Agent Configuration
                        </h1>
                        <p className="text-muted-foreground mt-1">Configure your AI agent with business-specific information</p>
                    </div>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-16">
                {/* Website Selection */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Select Website
                        </CardTitle>
                        <CardDescription>
                            Choose the website you want to configure AI agent data for
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Select value={selectedWebsiteId} onValueChange={setSelectedWebsiteId}>
                            <SelectTrigger className="w-full max-w-md">
                                <SelectValue placeholder="Select a website" />
                            </SelectTrigger>
                            <SelectContent>
                                {websites.map((website) => (
                                    <SelectItem key={website.id} value={website.id.toString()}>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 ${website.color} rounded-full`}></div>
                                            {website.domain}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                {selectedWebsiteId && (
                    <>
                        {/* Info Card */}
                        <Card className="mb-8 border-blue-200 bg-blue-50/50">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-blue-900 mb-1">About AI Agent Configuration</h4>
                                        <p className="text-sm text-blue-800">
                                            This information helps your AI agent provide accurate and contextual responses to your visitors. 
                                            The more details you provide, the better your AI agent will be at assisting customers with 
                                            questions about your business, products, services, and policies.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Business Information */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building className="h-5 w-5" />
                                        Business Information
                                    </CardTitle>
                                    <CardDescription>
                                        Basic information about your business
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="business_name">Business Name</Label>
                                        <Input
                                            id="business_name"
                                            placeholder="e.g., SmartPop Shoe Store"
                                            value={agentData.business_name}
                                            onChange={(e) => handleInputChange('business_name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="business_type">Business Type</Label>
                                        <Input
                                            id="business_type"
                                            placeholder="e.g., Retail, E-commerce, Service Provider"
                                            value={agentData.business_type}
                                            onChange={(e) => handleInputChange('business_type', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="business_description">Business Description</Label>
                                        <Textarea
                                            id="business_description"
                                            placeholder="Describe your business, what you do, and your mission..."
                                            value={agentData.business_description}
                                            onChange={(e) => handleInputChange('business_description', e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Customer Information
                                    </CardTitle>
                                    <CardDescription>
                                        Information about your customers and audience
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="target_audience">Target Audience</Label>
                                        <Textarea
                                            id="target_audience"
                                            placeholder="Describe your target customers, their demographics, interests..."
                                            value={agentData.target_audience}
                                            onChange={(e) => handleInputChange('target_audience', e.target.value)}
                                            rows={4}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="business_hours">Business Hours</Label>
                                        <Textarea
                                            id="business_hours"
                                            placeholder="Monday-Friday: 9AM-6PM, Saturday: 10AM-4PM, Sunday: Closed"
                                            value={agentData.business_hours}
                                            onChange={(e) => handleInputChange('business_hours', e.target.value)}
                                            rows={3}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Products and Services */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Products & Services
                                </CardTitle>
                                <CardDescription>
                                    Detailed information about what you offer
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="products_services">Products & Services</Label>
                                    <Textarea
                                        id="products_services"
                                        placeholder="List and describe your main products/services, features, pricing, categories..."
                                        value={agentData.products_services}
                                        onChange={(e) => handleInputChange('products_services', e.target.value)}
                                        rows={5}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="inventory_info">Inventory Information</Label>
                                    <Textarea
                                        id="inventory_info"
                                        placeholder="Current stock levels, availability, popular items... (e.g., Nike: 100 items, Adidas: 0 items, Puma: 1 item)"
                                        value={agentData.inventory_info}
                                        onChange={(e) => handleInputChange('inventory_info', e.target.value)}
                                        rows={4}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Contact and Support */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Phone className="h-5 w-5" />
                                        Contact Information
                                    </CardTitle>
                                    <CardDescription>
                                        How customers can reach you
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <Label htmlFor="contact_information">Contact Details</Label>
                                        <Textarea
                                            id="contact_information"
                                            placeholder="Phone: +1-234-567-8900&#10;Email: support@example.com&#10;Address: 123 Main St, City, State&#10;Live Chat: Available 24/7"
                                            value={agentData.contact_information}
                                            onChange={(e) => handleInputChange('contact_information', e.target.value)}
                                            rows={5}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Tag className="h-5 w-5" />
                                        Offers & Promotions
                                    </CardTitle>
                                    <CardDescription>
                                        Current deals and special offers
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div>
                                        <Label htmlFor="special_offers">Special Offers</Label>
                                        <Textarea
                                            id="special_offers"
                                            placeholder="Current promotions, discount codes, seasonal sales, loyalty programs..."
                                            value={agentData.special_offers}
                                            onChange={(e) => handleInputChange('special_offers', e.target.value)}
                                            rows={5}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Policies */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Policies & Guidelines
                                </CardTitle>
                                <CardDescription>
                                    Important policies and procedures
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <Label htmlFor="policies">Policies</Label>
                                    <Textarea
                                        id="policies"
                                        placeholder="Return policy, shipping policy, privacy policy, terms of service, warranty information..."
                                        value={agentData.policies}
                                        onChange={(e) => handleInputChange('policies', e.target.value)}
                                        rows={5}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={handleSave}
                                disabled={!hasChanges || isSaving}
                                className="flex items-center gap-2"
                                size="lg"
                            >
                                <Save className="h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Save Configuration'}
                            </Button>
                            <Button
                                onClick={handleReset}
                                variant="outline"
                                className="flex items-center gap-2"
                                size="lg"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset All Fields
                            </Button>
                        </div>
                    </>
                )}

                {websites.length === 0 && (
                    <Card className="text-center py-12">
                        <CardContent>
                            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                <Globe className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No websites found</h3>
                            <p className="text-muted-foreground mb-6">
                                You need to create a website first before configuring your AI agent.
                            </p>
                            <Button asChild>
                                <a href="/dashboard">Go to Dashboard</a>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AiAgentPage;
