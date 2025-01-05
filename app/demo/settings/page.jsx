'use client';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Info, Upload, Settings as SettingsIcon, CreditCard, Shield, Loader2, Share2, Link } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Mock data for settings
const mockSettings = {
    siteTitle: 'My SaaS Platform',
    siteDescription: 'A powerful platform for managing your business',
    siteKeywords: 'saas, business, management, platform',
    googleAnalyticsId: 'UA-12345678-9',
    maintenanceMode: false,
    logoUrl: '/uploads/logo.png',
    siteAddress: '123 Business Street, Tech City',
    sitePhone: '+1 (555) 123-4567',
    siteEmail: 'contact@example.com'
};

// Mock data for subscription types and limits
const mockSubscriptionTypes = [
    {
        id: 1,
        name: 'Basic',
        max_websites: 1,
        max_paths_per_website: 5,
        max_popups_per_path: 2,
        allow_advertising: false,
        allow_email_collector: true
    },
    {
        id: 2,
        name: 'Professional',
        max_websites: 5,
        max_paths_per_website: 20,
        max_popups_per_path: 5,
        allow_advertising: true,
        allow_email_collector: true
    }
];

// Mock data for social links
const mockSocialLinks = [
    { id: 1, name: 'Facebook', url: 'https://facebook.com/myapp', image_url: '/social/facebook.png' },
    { id: 2, name: 'Twitter', url: 'https://twitter.com/myapp', image_url: '/social/twitter.png' }
];

// Mock data for footer links
const mockFooterLinks = {
    sitemapLinks: [
        { id: 1, name: 'Home', url: '/' },
        { id: 2, name: 'About', url: '/about' }
    ],
    companyLinks: [
        { id: 1, name: 'Terms', url: '/terms' },
        { id: 2, name: 'Privacy', url: '/privacy' }
    ]
};

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [siteTitle, setSiteTitle] = useState(mockSettings.siteTitle);
    const [siteDescription, setSiteDescription] = useState(mockSettings.siteDescription);
    const [siteKeywords, setSiteKeywords] = useState(mockSettings.siteKeywords);
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState(mockSettings.googleAnalyticsId);
    const [maintenanceMode, setMaintenanceMode] = useState(mockSettings.maintenanceMode);
    const [logoUrl, setLogoUrl] = useState(mockSettings.logoUrl);
    const [siteAddress, setSiteAddress] = useState(mockSettings.siteAddress);
    const [sitePhone, setSitePhone] = useState(mockSettings.sitePhone);
    const [siteEmail, setSiteEmail] = useState(mockSettings.siteEmail);
    const { toast } = useToast();

    const tabs = [
        {
            id: 'general',
            label: 'General',
            icon: <SettingsIcon className="w-4 h-4" />,
            description: 'Manage your website settings and SEO configuration',
            iconBg: 'bg-[#F4F4FD]',
            iconColor: 'text-purple-600'
        },
        {
            id: 'subscriptions',
            label: 'Subscriptions',
            icon: <CreditCard className="w-4 h-4" />,
            description: 'Configure subscription plans and pricing',
            iconBg: 'bg-[#FFF1F3]',
            iconColor: 'text-pink-500'
        },
        {
            id: 'usage-limits',
            label: 'Usage Limits',
            icon: <Shield className="w-4 h-4" />,
            description: 'Set usage limits for different subscription tiers',
            iconBg: 'bg-[#FFF8E6]',
            iconColor: 'text-yellow-500'
        },
        {
            id: 'social-links',
            label: 'Social Links',
            icon: <Share2 className="w-4 h-4" />,
            description: 'Manage your social media links',
            iconBg: 'bg-[#E6F7FF]',
            iconColor: 'text-blue-500'
        },
        {
            id: 'footer',
            label: 'Footer Links',
            icon: <Link className="w-4 h-4" />,
            description: 'Manage your footer links and sections',
            iconBg: 'bg-[#E8F5E9]',
            iconColor: 'text-green-500'
        }
    ];

    const LabelWithTooltip = ({ htmlFor, label, tooltip }) => (
        <div className="flex items-center gap-1">
            <Label htmlFor={htmlFor}>{label}</Label>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="w-60 text-sm">{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );

    const inputHandler = (e) => {
        if (e.target.name === 'siteTitle') {
            setSiteTitle(e.target.value);
        } else if (e.target.name === 'siteDescription') {
            setSiteDescription(e.target.value);
        } else if (e.target.name === 'siteKeywords') {
            setSiteKeywords(e.target.value);
        } else if (e.target.name === 'googleAnalyticsId') {
            setGoogleAnalyticsId(e.target.value);
        } else if (e.target.name === 'maintenanceMode') {
            setMaintenanceMode(e.target.checked);
        } else if (e.target.name === 'siteAddress') {
            setSiteAddress(e.target.value);
        } else if (e.target.name === 'sitePhone') {
            setSitePhone(e.target.value);
        } else if (e.target.name === 'siteEmail') {
            setSiteEmail(e.target.value);
        }
    };

    const handleGeneralSettingsSubmit = (e) => {
        if (e) e.preventDefault();
        
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would save your settings.",
            variant: "default"
        });
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would upload your logo.",
            variant: "default"
        });
    };

    function UsageLimitsManagement() {
        const [subscriptionTypes, setSubscriptionTypes] = useState(mockSubscriptionTypes);
        const [hasChanges, setHasChanges] = useState(false);

        const handleLimitChange = (subscriptionId, field, value) => {
            const processedValue = field.startsWith('max_') ? 
                parseInt(value) || 0 : // For max_* fields, convert to integer
                field.startsWith('allow_') ? 
                    Boolean(value) : // For allow_* fields, convert to boolean
                    value; // For other fields, keep as is

            setSubscriptionTypes(prev => 
                prev.map(sub => 
                    sub.id === subscriptionId 
                        ? { ...sub, [field]: processedValue } 
                        : sub
                )
            );
            setHasChanges(true);
            
            toast({
                title: "Demo Version",
                description: "This is just a demo. In the full version, this would update subscription limits.",
                variant: "default"
            });
        };

        const handleSaveChanges = () => {
            toast({
                title: "Demo Version",
                description: "This is just a demo. In the full version, this would save your subscription limits.",
                variant: "default"
            });
            setHasChanges(false);
        };

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium">Usage Limits</h3>
                        <p className="text-sm text-muted-foreground">
                            Set usage limits for different subscription tiers.
                        </p>
                    </div>
                    <Button 
                        onClick={handleSaveChanges}
                        disabled={!hasChanges}
                    >
                        Save Changes
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subscription</TableHead>
                            <TableHead>Max Websites</TableHead>
                            <TableHead>Max Paths per Website</TableHead>
                            <TableHead>Max Popups per Path</TableHead>
                            <TableHead>Features</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptionTypes.map((subscription) => (
                            <TableRow key={subscription.id}>
                                <TableCell className="font-medium">{subscription.name}</TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={subscription.max_websites}
                                        onChange={(e) => handleLimitChange(subscription.id, 'max_websites', e.target.value)}
                                        className="w-20"
                                        min="0"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={subscription.max_paths_per_website}
                                        onChange={(e) => handleLimitChange(subscription.id, 'max_paths_per_website', e.target.value)}
                                        className="w-20"
                                        min="0"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        value={subscription.max_popups_per_path}
                                        onChange={(e) => handleLimitChange(subscription.id, 'max_popups_per_path', e.target.value)}
                                        className="w-20"
                                        min="0"
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={subscription.allow_advertising}
                                                onCheckedChange={(checked) => 
                                                    handleLimitChange(subscription.id, 'allow_advertising', checked)
                                                }
                                            />
                                            <Label>Advertising</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={subscription.allow_email_collector}
                                                onCheckedChange={(checked) => 
                                                    handleLimitChange(subscription.id, 'allow_email_collector', checked)
                                                }
                                            />
                                            <Label>Email Collector</Label>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    function SocialLinksManagement() {
        const [socialLinks, setSocialLinks] = useState(mockSocialLinks);
        const [newLink, setNewLink] = useState({ name: '', url: '', image_url: '' });

        const handleAddLink = (e) => {
            e.preventDefault();
            toast({
                title: "Demo Version",
                description: "This is just a demo. In the full version, this would add a new social link.",
                variant: "default"
            });
        };

        const handleRemoveLink = (id) => {
            toast({
                title: "Demo Version",
                description: "This is just a demo. In the full version, this would remove the social link.",
                variant: "default"
            });
        };

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Social Media Links</CardTitle>
                    <CardDescription>
                        Manage your social media presence by adding or removing social links.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleAddLink} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="name">Platform Name</Label>
                                <Input
                                    id="name"
                                    value={newLink.name}
                                    onChange={(e) => setNewLink({...newLink, name: e.target.value})}
                                    placeholder="e.g., Facebook"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="url">URL</Label>
                                <Input
                                    id="url"
                                    value={newLink.url}
                                    onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                                    placeholder="https://..."
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="image_url">Icon URL</Label>
                                <Input
                                    id="image_url"
                                    value={newLink.image_url}
                                    onChange={(e) => setNewLink({...newLink, image_url: e.target.value})}
                                    placeholder="https://... (icon URL)"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit">Add Social Link</Button>
                    </form>

                    <Separator />

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Icon</TableHead>
                                <TableHead>Platform</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {socialLinks.map((link) => (
                                <TableRow key={link.id}>
                                    <TableCell>
                                        <img 
                                            src={link.image_url} 
                                            alt={link.name} 
                                            className="w-6 h-6"
                                            onError={(e) => {
                                                e.target.src = '/placeholder-icon.png';
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>{link.name}</TableCell>
                                    <TableCell>
                                        <a 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            {link.url}
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemoveLink(link.id)}
                                        >
                                            Remove
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }

    function FooterLinksManagement() {
        const [sitemapLinks, setSitemapLinks] = useState(mockFooterLinks.sitemapLinks);
        const [companyLinks, setCompanyLinks] = useState(mockFooterLinks.companyLinks);
        const [newLink, setNewLink] = useState({ name: '', url: '', type: 'sitemap' });

        const handleAddLink = (e) => {
            e.preventDefault();
            toast({
                title: "Demo Version",
                description: "This is just a demo. In the full version, this would add a new footer link.",
                variant: "default"
            });
        };

        const handleRemoveLink = (id, type) => {
            toast({
                title: "Demo Version",
                description: "This is just a demo. In the full version, this would remove the footer link.",
                variant: "default"
            });
        };

        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Footer Links Management</CardTitle>
                        <CardDescription>
                            Manage the links that appear in your website's footer sections.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleAddLink} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="name">Link Name</Label>
                                    <Input
                                        id="name"
                                        value={newLink.name}
                                        onChange={(e) => setNewLink({...newLink, name: e.target.value})}
                                        placeholder="e.g., About Us"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                        id="url"
                                        value={newLink.url}
                                        onChange={(e) => setNewLink({...newLink, url: e.target.value})}
                                        placeholder="/about"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="type">Section</Label>
                                    <select
                                        id="type"
                                        value={newLink.type}
                                        onChange={(e) => setNewLink({...newLink, type: e.target.value})}
                                        className="w-full p-2 border rounded-md"
                                        required
                                    >
                                        <option value="sitemap">Sitemap</option>
                                        <option value="company">Company</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit">Add Footer Link</Button>
                        </form>

                        <div className="grid grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sitemap Links</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>URL</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sitemapLinks.map((link) => (
                                                <TableRow key={link.id}>
                                                    <TableCell>{link.name}</TableCell>
                                                    <TableCell>
                                                        <a 
                                                            href={link.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            {link.url}
                                                        </a>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleRemoveLink(link.id, 'sitemap')}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Company Links</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>URL</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {companyLinks.map((link) => (
                                                <TableRow key={link.id}>
                                                    <TableCell>{link.name}</TableCell>
                                                    <TableCell>
                                                        <a 
                                                            href={link.url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:underline"
                                                        >
                                                            {link.url}
                                                        </a>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => handleRemoveLink(link.id, 'company')}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    
    return (
        <div className="ml-72 p-8 bg-white">
            <div className="mx-auto space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
                    <p className="text-gray-500">
                        Manage your application settings and configurations.
                    </p>
                </div>

                <Separator className="my-6 bg-gray-200" />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex items-center space-x-4 bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                        <TabsList className="bg-transparent">
                            {tabs.map((tab) => (
                                <TabsTrigger 
                                    key={tab.id}
                                    value={tab.id}
                                    className="data-[state=active]:bg-gray-900 data-[state=active]:text-white px-4 py-2 transition-all"
                                >
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-gray-100 p-1 rounded-md text-gray-700">
                                            {tab.icon}
                                        </div>
                                        <span>{tab.label}</span>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value="general">
                        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl text-gray-900">General Settings</CardTitle>
                                <CardDescription className="text-gray-500">
                                    Configure your website's basic information and SEO settings.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <LabelWithTooltip 
                                                htmlFor="siteTitle" 
                                                label="Site Title" 
                                                tooltip="The title of your website that appears in search engine results and browser tabs." 
                                            />
                                            <Input 
                                                value={siteTitle} 
                                                onChange={inputHandler} 
                                                name="siteTitle" 
                                                id="siteTitle" 
                                                placeholder="Enter site title" 
                                                className="mt-1.5 border-gray-300 focus:border-gray-500" 
                                            />
                                        </div>

                                        <div>
                                            <LabelWithTooltip 
                                                htmlFor="siteKeywords" 
                                                label="Keywords" 
                                                tooltip="Comma-separated keywords relevant to your website content." 
                                            />
                                            <Input 
                                                value={siteKeywords} 
                                                onChange={inputHandler} 
                                                name="siteKeywords" 
                                                id="siteKeywords" 
                                                placeholder="Enter keywords" 
                                                className="mt-1.5 border-gray-300 focus:border-gray-500" 
                                            />
                                        </div>

                                        <div>
                                            <LabelWithTooltip 
                                                htmlFor="googleAnalytics" 
                                                label="Google Analytics ID" 
                                                tooltip="Your Google Analytics tracking ID." 
                                            />
                                            <Input 
                                                value={googleAnalyticsId} 
                                                onChange={inputHandler} 
                                                name="googleAnalyticsId" 
                                                id="googleAnalytics" 
                                                placeholder="UA-XXXXXXXXX-X" 
                                                className="mt-1.5 border-gray-300 focus:border-gray-500" 
                                            />
                                        </div>

                                        <div>
                                            <LabelWithTooltip 
                                                htmlFor="siteAddress" 
                                                label="Site Address" 
                                                tooltip="The physical address of your website." 
                                            />
                                            <Input 
                                                value={siteAddress} 
                                                onChange={inputHandler} 
                                                name="siteAddress" 
                                                id="siteAddress" 
                                                placeholder="Enter site address" 
                                                className="mt-1.5 border-gray-300 focus:border-gray-500" 
                                            />
                                        </div>

                                        <div>
                                            <LabelWithTooltip 
                                                htmlFor="sitePhone" 
                                                label="Phone Number" 
                                                tooltip="Your business contact phone number." 
                                            />
                                            <Input 
                                                value={sitePhone} 
                                                onChange={inputHandler} 
                                                name="sitePhone" 
                                                id="sitePhone" 
                                                placeholder="Enter phone number" 
                                                className="mt-1.5 border-gray-300 focus:border-gray-500" 
                                            />
                                        </div>

                                        <div>
                                            <LabelWithTooltip 
                                                htmlFor="siteEmail" 
                                                label="Contact Email" 
                                                tooltip="Your business contact email address." 
                                            />
                                            <Input 
                                                value={siteEmail} 
                                                onChange={inputHandler} 
                                                name="siteEmail" 
                                                id="siteEmail" 
                                                type="email"
                                                placeholder="Enter contact email" 
                                                className="mt-1.5 border-gray-300 focus:border-gray-500" 
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <LabelWithTooltip 
                                                htmlFor="siteDescription" 
                                                label="Site Description" 
                                                tooltip="A brief description of your website that appears in search results." 
                                            />
                                            <Textarea 
                                                value={siteDescription} 
                                                onChange={inputHandler} 
                                                name="siteDescription" 
                                                id="siteDescription" 
                                                placeholder="Enter site description" 
                                                className="mt-1.5 h-[120px] border-gray-300 focus:border-gray-500" 
                                            />
                                        </div>

                                        <Card className="border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                                            <CardHeader className="p-4">
                                                <LabelWithTooltip
                                                    htmlFor="logo"
                                                    label="Site Logo"
                                                    tooltip="Upload your website logo. Recommended size: 200x50px. Max size: 2MB"
                                                />
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-16 w-48 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                                                        <img
                                                            id="siteLogo"
                                                            src={logoUrl || "/uploads/logo.png"}
                                                            alt="Current Site Logo"
                                                            className="h-full object-contain p-2"
                                                            onError={(e) => {
                                                                e.target.src = '/uploads/logo.png';
                                                                e.target.onerror = null;
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Input
                                                            type="file"
                                                            id="logo"
                                                            accept="image/*"
                                                            onChange={handleLogoUpload}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => document.getElementById('logo').click()}
                                                            className="w-[140px] border-gray-300 hover:border-gray-900 hover:bg-gray-50"
                                                        >
                                                            <Upload className="h-4 w-4 mr-2 text-gray-700" />
                                                            <span className="text-gray-600">Upload Logo</span>
                                                        </Button>
                                                        <p className="text-sm text-gray-500 mt-2">
                                                            Supported formats: PNG, JPG, GIF
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <Separator className="my-6 bg-gray-200" />

                                <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="maintenanceMode"
                                            name="maintenanceMode"
                                            checked={maintenanceMode}
                                            onCheckedChange={(checked) => setMaintenanceMode(checked)}
                                            className="border-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor="maintenanceMode" className="font-medium text-gray-900">Maintenance Mode</Label>
                                            <p className="text-sm text-gray-500">
                                                Enable to show a maintenance page to visitors while you work on your site.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button 
                                        onClick={handleGeneralSettingsSubmit}
                                        className="bg-gray-900 text-white w-[140px] hover:bg-black transition-colors"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="subscriptions">
                        <div>
                            Not available in demo version.
                        </div>
                    </TabsContent>

                    <TabsContent value="usage-limits">
                        <UsageLimitsManagement />
                    </TabsContent>

                    <TabsContent value="social-links">
                        <SocialLinksManagement />
                    </TabsContent>

                    <TabsContent value="footer">
                        <FooterLinksManagement />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Settings;
