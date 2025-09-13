'use client';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Info, Upload, Settings as SettingsIcon, CreditCard, Shield, Loader2, Share2, Link, Phone } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SubscriptionManagement from '../_components/SettingsSubscriptions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const Settings = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('general');
    const [siteTitle, setSiteTitle] = useState('');
    const [siteDescription, setSiteDescription] = useState('');
    const [siteKeywords, setSiteKeywords] = useState('');
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState('UA-12345678-9');
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [siteAddress, setSiteAddress] = useState('');
    const [sitePhone, setSitePhone] = useState('');
    const [siteEmail, setSiteEmail] = useState('');
    const [siteCopyright, setSiteCopyright] = useState('');

    // Contact settings state
    const [contactSettings, setContactSettings] = useState({});
    const [contactFaqs, setContactFaqs] = useState([]);
    const [contactStats, setContactStats] = useState([]);

    const { toast } = useToast();

    const tabs = [
        {
            id: 'general',
            label: t('adminPage.settings.tabs.general.title'),
            icon: <SettingsIcon className="w-4 h-4" />,
            description: t('adminPage.settings.tabs.general.description'),
            iconBg: 'bg-[#F4F4FD]',
            iconColor: 'text-purple-600',
        },
        {
            id: 'subscriptions',
            label: t('adminPage.settings.tabs.subscriptions.title'),
            icon: <CreditCard className="w-4 h-4" />,
            description: t('adminPage.settings.tabs.subscriptions.description'),
            iconBg: 'bg-[#FFF1F3]',
            iconColor: 'text-pink-500',
        },
        {
            id: 'usage-limits',
            label: t('adminPage.settings.tabs.usageLimits.title'),
            icon: <Shield className="w-4 h-4" />,
            description: t('adminPage.settings.tabs.usageLimits.description'),
            iconBg: 'bg-[#FFF8E6]',
            iconColor: 'text-yellow-500',
        },
        {
            id: 'social-links',
            label: t('adminPage.settings.tabs.socialLinks.title'),
            icon: <Share2 className="w-4 h-4" />,
            description: t('adminPage.settings.tabs.socialLinks.description'),
            iconBg: 'bg-[#E6F7FF]',
            iconColor: 'text-blue-500',
        },
        {
            id: 'footer',
            label: t('adminPage.settings.tabs.footerLinks.title'),
            icon: <Link className="w-4 h-4" />,
            description: t('adminPage.settings.tabs.footerLinks.description'),
            iconBg: 'bg-[#E8F5E9]',
            iconColor: 'text-green-500',
        },
        {
            id: 'contact',
            label: 'Contact Settings',
            icon: <Phone className="w-4 h-4" />,
            description: 'Configure contact page content and settings',
            iconBg: 'bg-[#FDF2F8]',
            iconColor: 'text-pink-600',
        },
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
        } else if (e.target.name === 'siteCopyright') {
            setSiteCopyright(e.target.value);
        }
    };

    const getGeneralSettingsFromDB = async () => {
        const response = await fetch('/api/public/get-general-settings');
        const data = await response.json();

        setSiteTitle(data.generalSettings.siteTitle);
        setSiteDescription(data.generalSettings.siteDescription);
        setSiteKeywords(data.generalSettings.siteKeywords);
        setGoogleAnalyticsId(data.generalSettings.googleAnalyticsId);
        setMaintenanceMode(data.generalSettings.maintenanceMode || false);
        setLogoUrl(data.generalSettings.logoUrl || '');
        setSiteAddress(data.generalSettings.address || '');
        setSitePhone(data.generalSettings.phone || '');
        setSiteEmail(data.generalSettings.email || '');
        setSiteCopyright(data.generalSettings.copyright || '');
    };

    const getContactSettingsFromDB = async () => {
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

    const handleContactSettingsSubmit = async (e) => {
        if (e) e.preventDefault();

        const response = await fetch('/api/admin/set-contact-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contactSettings,
                contactFaqs,
                contactStats,
            }),
        });

        if (!response.ok) {
            toast({
                title: 'Error',
                description: 'Failed to update contact settings',
                variant: 'destructive',
            });
            return;
        }

        const data = await response.json();

        if (data.error) {
            toast({
                title: 'Error',
                description: data.error,
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: 'Success',
            description: 'Contact settings updated successfully!',
        });
    };

    useEffect(() => {
        getGeneralSettingsFromDB();
        getContactSettingsFromDB();
    }, []);

    const handleGeneralSettingsSubmit = async (e) => {
        if (e) e.preventDefault();

        const response = await fetch('/api/admin/set-general-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                siteTitle,
                siteDescription,
                siteKeywords,
                googleAnalyticsId,
                maintenanceMode,
                logoUrl,
                siteAddress,
                sitePhone,
                siteEmail,
                siteCopyright,
            }),
        });

        if (!response.ok) {
            toast({
                title: 'Error',
                description: 'Failed to update settings',
                variant: 'destructive',
            });
            return;
        }

        const data = await response.json();

        if (data.error) {
            toast({
                title: 'Error',
                description: data.error,
                variant: 'destructive',
            });
            return;
        }

        toast({
            title: 'Success',
            description: 'Settings updated successfully!',
        });
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                title: 'Invalid File Type',
                description: 'Please upload an image file',
                variant: 'destructive',
            });
            return;
        }

        // Validate file size (e.g., 2MB limit)
        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: 'File Too Large',
                description: 'File size should be less than 2MB',
                variant: 'destructive',
            });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('logo', file);

        try {
            const response = await fetch('/api/admin/upload-logo', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            setLogoUrl(data.logoUrl);
            // Force re-render of the logo image by adding a timestamp
            const logoImg = document.querySelector('#siteLogo');
            if (logoImg) {
                logoImg.src = `${data.logoUrl}?t=${Date.now()}`;
            }

            toast({
                title: 'Success',
                description: 'Logo uploaded successfully',
            });

            // Update general settings with new logo URL
            await handleGeneralSettingsSubmit();
        } catch (error) {
            console.error('Error uploading logo:', error);
            toast({
                title: 'Upload Failed',
                description: 'Failed to upload logo. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    function UsageLimitsManagement() {
        const { t } = useTranslation();
        const [subscriptionTypes, setSubscriptionTypes] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const [hasChanges, setHasChanges] = useState(false);
        const { toast } = useToast();

        useEffect(() => {
            const fetchLimits = async () => {
                try {
                    const [typesResponse, limitsResponse] = await Promise.all([fetch('/api/admin/get-subscription-types'), fetch('/api/admin/get-subscription-limits')]);

                    const typesData = await typesResponse.json();
                    const limitsData = await limitsResponse.json();

                    // Merge subscription types with their limits
                    const mergedData = typesData.map((type) => {
                        const limits = limitsData.find((l) => l.subscription_type_id === type.id) || {};
                        return {
                            ...type,
                            max_websites: limits.max_websites || 0,
                            max_paths_per_website: limits.max_paths_per_website || 0,
                            max_popups_per_path: limits.max_popups_per_path || 0,
                            max_chat_conversations: limits.max_chat_conversations || 0,
                            max_ai_responses: limits.max_ai_responses || 0,
                            allow_advertising: limits.allow_advertising || false,
                            allow_email_collector: limits.allow_email_collector || false,
                        };
                    });

                    setSubscriptionTypes(mergedData);
                } catch (error) {
                    console.error('Failed to fetch data:', error);
                    toast({
                        title: 'Error',
                        description: 'Failed to load subscription data',
                        variant: 'destructive',
                    });
                } finally {
                    setIsLoading(false);
                }
            };

            fetchLimits();
        }, []);

        const handleLimitChange = (subscriptionId, field, value) => {
            const processedValue = field.startsWith('max_')
                ? parseInt(value) || 0 // For max_* fields, convert to integer
                : field.startsWith('allow_')
                ? Boolean(value) // For allow_* fields, convert to boolean
                : value; // For other fields, keep as is

            setSubscriptionTypes((prev) => prev.map((sub) => (sub.id === subscriptionId ? { ...sub, [field]: processedValue } : sub)));
            setHasChanges(true);
        };

        const handleSaveChanges = async () => {
            try {
                const savePromises = subscriptionTypes.map((subscription) =>
                    fetch('/api/admin/update-subscription-limits', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            subscription_type_id: subscription.id,
                            max_websites: parseInt(subscription.max_websites) || 0,
                            max_paths_per_website: parseInt(subscription.max_paths_per_website) || 0,
                            max_popups_per_path: parseInt(subscription.max_popups_per_path) || 0,
                            max_chat_conversations: parseInt(subscription.max_chat_conversations) || 0,
                            max_ai_responses: parseInt(subscription.max_ai_responses) || 0,
                            allow_advertising: Boolean(subscription.allow_advertising),
                            allow_email_collector: Boolean(subscription.allow_email_collector),
                        }),
                    })
                );

                await Promise.all(savePromises);

                toast({
                    variant: 'success',
                    title: 'Success',
                    description: 'Subscription limits updated successfully',
                });
                setHasChanges(false);
            } catch (error) {
                console.error('Failed to save limits:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to save subscription limits',
                    variant: 'destructive',
                });
            }
        };

        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-10">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            );
        }

        return (
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="space-y-2 pb-6">
                    <CardTitle className="text-2xl font-semibold text-foreground">{t('adminPage.settings.usageLimits.title')}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">{t('adminPage.settings.usageLimits.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="flex justify-end">
                        <Button 
                            onClick={handleSaveChanges} 
                            disabled={!hasChanges}
                            className={`h-11 px-6 transition-all duration-200 ${hasChanges ? 'bg-primary hover:bg-primary/90' : 'bg-muted text-muted-foreground'}`}
                        >
                            {t('adminPage.settings.usageLimits.buttons.saveChanges')}
                        </Button>
                    </div>

                    <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead className="font-semibold">{t('adminPage.settings.usageLimits.table.subscription')}</TableHead>
                                    <TableHead className="font-semibold">{t('adminPage.settings.usageLimits.table.maxWebsites')}</TableHead>
                                    <TableHead className="font-semibold">Max Chat Conversations</TableHead>
                                    <TableHead className="font-semibold">Max AI Responses</TableHead>
                                    <TableHead className="font-semibold">{t('adminPage.settings.usageLimits.table.maxPathsPerWebsite')}</TableHead>
                                    <TableHead className="font-semibold">{t('adminPage.settings.usageLimits.table.maxPopupsPerPath')}</TableHead>
                                    <TableHead className="font-semibold">{t('adminPage.settings.usageLimits.table.features')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subscriptionTypes.map((subscription, index) => (
                                    <TableRow key={subscription.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                        <TableCell className="font-medium text-foreground">{subscription.name}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={subscription.max_websites}
                                                onChange={(e) => handleLimitChange(subscription.id, 'max_websites', e.target.value)}
                                                className="w-24 h-10 text-center border-border focus:border-ring transition-all duration-200"
                                                min="0"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={subscription.max_chat_conversations}
                                                onChange={(e) => handleLimitChange(subscription.id, 'max_chat_conversations', e.target.value)}
                                                className="w-24 h-10 text-center border-border focus:border-ring transition-all duration-200"
                                                min="0"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={subscription.max_ai_responses}
                                                onChange={(e) => handleLimitChange(subscription.id, 'max_ai_responses', e.target.value)}
                                                className="w-24 h-10 text-center border-border focus:border-ring transition-all duration-200"
                                                min="0"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={subscription.max_paths_per_website}
                                                onChange={(e) => handleLimitChange(subscription.id, 'max_paths_per_website', e.target.value)}
                                                className="w-24 h-10 text-center border-border focus:border-ring transition-all duration-200"
                                                min="0"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                value={subscription.max_popups_per_path}
                                                onChange={(e) => handleLimitChange(subscription.id, 'max_popups_per_path', e.target.value)}
                                                className="w-24 h-10 text-center border-border focus:border-ring transition-all duration-200"
                                                min="0"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox 
                                                        checked={subscription.allow_advertising} 
                                                        onCheckedChange={(checked) => handleLimitChange(subscription.id, 'allow_advertising', checked)}
                                                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                    <Label className="text-sm font-medium">Advertising</Label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={subscription.allow_email_collector}
                                                        onCheckedChange={(checked) => handleLimitChange(subscription.id, 'allow_email_collector', checked)}
                                                        className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                    <Label className="text-sm font-medium">Email Collector</Label>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        );
    }

    function SocialLinksManagement() {
        const { t } = useTranslation();
        const [socialLinks, setSocialLinks] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const [newLink, setNewLink] = useState({ name: '', url: '', image_url: '' });
        const { toast } = useToast();

        const fetchSocialLinks = async () => {
            try {
                // need to make sure to use GET  request
                const response = await fetch('/api/public/get-social-links');
                const data = await response.json();

                setSocialLinks(data);
            } catch (error) {
                console.error('Failed to fetch social links:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load social links',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        useEffect(() => {
            fetchSocialLinks();
        }, []);

        const handleAddLink = async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('/api/admin/add-social-link', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newLink),
                });

                if (!response.ok) throw new Error('Failed to add social link');

                toast({
                    title: 'Success',
                    description: 'Social link added successfully',
                });

                // Reset form and refresh links
                setNewLink({ name: '', url: '', image_url: '' });
                fetchSocialLinks();
            } catch (error) {
                console.error('Failed to add social link:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to add social link',
                    variant: 'destructive',
                });
            }
        };

        const handleRemoveLink = async (id) => {
            try {
                const response = await fetch('/api/admin/remove-social-link', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id }),
                });

                if (!response.ok) throw new Error('Failed to remove social link');

                toast({
                    title: 'Success',
                    description: 'Social link removed successfully',
                });

                fetchSocialLinks();
            } catch (error) {
                console.error('Failed to remove social link:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to remove social link',
                    variant: 'destructive',
                });
            }
        };

        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-10">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            );
        }

        return (
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="space-y-2 pb-6">
                    <CardTitle className="text-2xl font-semibold text-foreground">{t('adminPage.settings.socialLinks.title')}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">{t('adminPage.settings.socialLinks.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <Card className="border-dashed border-border hover:border-ring transition-colors duration-300">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Add New Social Link</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddLink} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-medium">{t('adminPage.settings.socialLinks.form.platformName.label')}</Label>
                                        <Input
                                            id="name"
                                            value={newLink.name}
                                            onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                                            placeholder={t('adminPage.settings.socialLinks.form.platformName.placeholder')}
                                            className="h-11 border-border focus:border-ring transition-all duration-200"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="url" className="font-medium">{t('adminPage.settings.socialLinks.form.url.label')}</Label>
                                        <Input
                                            id="url"
                                            value={newLink.url}
                                            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                            placeholder={t('adminPage.settings.socialLinks.form.url.placeholder')}
                                            className="h-11 border-border focus:border-ring transition-all duration-200"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="image_url" className="font-medium">{t('adminPage.settings.socialLinks.form.iconUrl.label')}</Label>
                                        <Input
                                            id="image_url"
                                            value={newLink.image_url}
                                            onChange={(e) => setNewLink({ ...newLink, image_url: e.target.value })}
                                            placeholder={t('adminPage.settings.socialLinks.form.iconUrl.placeholder')}
                                            className="h-11 border-border focus:border-ring transition-all duration-200"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button 
                                        type="submit" 
                                        className="bg-primary text-primary-foreground h-11 px-6 hover:bg-primary/90 transition-colors duration-200"
                                    >
                                        {t('adminPage.settings.socialLinks.buttons.addLink')}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="rounded-lg border border-border overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead className="font-semibold w-[80px]">{t('adminPage.settings.socialLinks.table.icon')}</TableHead>
                                    <TableHead className="font-semibold">{t('adminPage.settings.socialLinks.table.platform')}</TableHead>
                                    <TableHead className="font-semibold">{t('adminPage.settings.socialLinks.table.url')}</TableHead>
                                    <TableHead className="text-right font-semibold">{t('adminPage.settings.socialLinks.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {socialLinks.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                            No social links found. Add your first social link above.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    socialLinks.map((link, index) => (
                                        <TableRow key={link.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                            <TableCell>
                                                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                                    <img
                                                        src={link.image_url}
                                                        alt={link.name}
                                                        className="w-6 h-6 object-contain"
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-icon.png';
                                                        }}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{link.name}</TableCell>
                                            <TableCell>
                                                <a 
                                                    href={link.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-blue-500 hover:underline flex items-center gap-1"
                                                >
                                                    {link.url}
                                                    <Share2 className="h-3.5 w-3.5" />
                                                </a>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm" 
                                                    onClick={() => handleRemoveLink(link.id)}
                                                    className="transition-all duration-200"
                                                >
                                                    {t('Remove')}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        );
    }

    function FooterLinksManagement() {
        const { t } = useTranslation();
        const [sitemapLinks, setSitemapLinks] = useState([]);
        const [companyLinks, setCompanyLinks] = useState([]);
        const [isLoading, setIsLoading] = useState(true);
        const [newLink, setNewLink] = useState({ name: '', url: '', type: 'sitemap' });
        const { toast } = useToast();

        const fetchFooterLinks = async () => {
            try {
                const response = await fetch('/api/public/get-footer-links');
                const data = await response.json();
                setSitemapLinks(data.sitemapLinks);
                setCompanyLinks(data.companyLinks);
            } catch (error) {
                console.error('Failed to fetch footer links:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load footer links',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
            }
        };

        useEffect(() => {
            fetchFooterLinks();
        }, []);

        const handleAddLink = async (e) => {
            e.preventDefault();
            try {
                const response = await fetch('/api/admin/add-footer-link', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newLink),
                });

                if (!response.ok) throw new Error('Failed to add footer link');

                toast({
                    title: 'Success',
                    description: 'Footer link added successfully',
                });

                setNewLink({ name: '', url: '', type: 'sitemap' });
                fetchFooterLinks();
            } catch (error) {
                console.error('Failed to add footer link:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to add footer link',
                    variant: 'destructive',
                });
            }
        };

        const handleRemoveLink = async (id, type) => {
            try {
                const response = await fetch('/api/admin/remove-footer-link', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id, type }),
                });

                if (!response.ok) throw new Error('Failed to remove footer link');

                toast({
                    title: 'Success',
                    description: 'Footer link removed successfully',
                });

                fetchFooterLinks();
            } catch (error) {
                console.error('Failed to remove footer link:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to remove footer link',
                    variant: 'destructive',
                });
            }
        };

        if (isLoading) {
            return (
                <div className="flex items-center justify-center p-10">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            );
        }

        return (
            <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="space-y-2 pb-6">
                    <CardTitle className="text-2xl font-semibold text-foreground">{t('adminPage.settings.footerLinks.title')}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">{t('adminPage.settings.footerLinks.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <Card className="border-dashed border-border hover:border-ring transition-colors duration-300">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl">Add New Footer Link</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddLink} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-medium">{t('adminPage.settings.footerLinks.form.linkName.label')}</Label>
                                        <Input
                                            id="name"
                                            value={newLink.name}
                                            onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                                            placeholder={t('adminPage.settings.footerLinks.form.linkName.placeholder')}
                                            className="h-11 border-border focus:border-ring transition-all duration-200"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="url" className="font-medium">{t('adminPage.settings.footerLinks.form.url.label')}</Label>
                                        <Input
                                            id="url"
                                            value={newLink.url}
                                            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                            placeholder={t('adminPage.settings.footerLinks.form.url.placeholder')}
                                            className="h-11 border-border focus:border-ring transition-all duration-200"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type" className="font-medium">Link Type</Label>
                                        <select 
                                            id="type" 
                                            value={newLink.type} 
                                            onChange={(e) => setNewLink({ ...newLink, type: e.target.value })} 
                                            className="w-full h-11 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all duration-200" 
                                            required
                                        >
                                            <option value="sitemap">Sitemap</option>
                                            <option value="company">Company</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button 
                                        type="submit" 
                                        className="bg-primary text-primary-foreground h-11 px-6 hover:bg-primary/90 transition-colors duration-200"
                                    >
                                        Add Footer Link
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Link className="h-5 w-5 text-blue-500" />
                                    Sitemap Links
                                </CardTitle>
                                <CardDescription>Navigation links for site structure</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border border-border overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted">
                                            <TableRow>
                                                <TableHead className="font-semibold">Name</TableHead>
                                                <TableHead className="font-semibold">URL</TableHead>
                                                <TableHead className="text-right font-semibold">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {sitemapLinks.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                                        No sitemap links found. Add your first link above.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                sitemapLinks.map((link, index) => (
                                                    <TableRow key={link.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                                        <TableCell className="font-medium">{link.name}</TableCell>
                                                        <TableCell>
                                                            <a 
                                                                href={link.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="text-blue-500 hover:underline flex items-center gap-1"
                                                            >
                                                                {link.url}
                                                                <Share2 className="h-3.5 w-3.5" />
                                                            </a>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm" 
                                                                onClick={() => handleRemoveLink(link.id, 'sitemap')}
                                                                className="transition-all duration-200"
                                                            >
                                                                {t('Remove')}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                    <Info className="h-5 w-5 text-green-500" />
                                    Company Links
                                </CardTitle>
                                <CardDescription>Links to company information pages</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border border-border overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted">
                                            <TableRow>
                                                <TableHead className="font-semibold">Name</TableHead>
                                                <TableHead className="font-semibold">URL</TableHead>
                                                <TableHead className="text-right font-semibold">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {companyLinks.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                                                        No company links found. Add your first link above.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                companyLinks.map((link, index) => (
                                                    <TableRow key={link.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                                        <TableCell className="font-medium">{link.name}</TableCell>
                                                        <TableCell>
                                                            <a 
                                                                href={link.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="text-blue-500 hover:underline flex items-center gap-1"
                                                            >
                                                                {link.url}
                                                                <Share2 className="h-3.5 w-3.5" />
                                                            </a>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button 
                                                                variant="destructive" 
                                                                size="sm" 
                                                                onClick={() => handleRemoveLink(link.id, 'company')}
                                                                className="transition-all duration-200"
                                                            >
                                                                {t('Remove')}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="ml-72 p-8 bg-background min-h-screen">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('adminPage.settings.title')}</h1>
                    <p className="text-lg text-muted-foreground">{t('adminPage.settings.description')}</p>
                </div>

                <Separator className="my-8 bg-border" />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="flex items-center justify-center bg-card rounded-xl p-1.5 border border-border shadow-sm">
                        <TabsList className="bg-transparent w-full flex justify-between max-w-4xl">
                            {tabs.map((tab) => (
                                <TabsTrigger 
                                    key={tab.id} 
                                    value={tab.id} 
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm px-5 py-2.5 transition-all duration-200 rounded-lg"
                                >
                                    <div className="flex items-center space-x-2.5">
                                        <div className={`${tab.iconBg} dark:bg-background/10 p-1.5 rounded-md ${tab.iconColor}`}>{tab.icon}</div>
                                        <span>{tab.label}</span>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value="general" className="animate-in fade-in-50 duration-300">
                        <Card className="border-border shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="space-y-2 pb-6">
                                <CardTitle className="text-2xl font-semibold text-foreground">{t('adminPage.settings.general.title')}</CardTitle>
                                <CardDescription className="text-base text-muted-foreground">{t('adminPage.settings.general.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2.5">
                                            <LabelWithTooltip
                                                htmlFor="siteTitle"
                                                label={t('adminPage.settings.general.fields.siteTitle.label')}
                                                tooltip={t('adminPage.settings.general.fields.siteTitle.tooltip')}
                                            />
                                            <Input
                                                value={siteTitle}
                                                onChange={inputHandler}
                                                name="siteTitle"
                                                id="siteTitle"
                                                placeholder={t('adminPage.settings.general.fields.siteTitle.placeholder')}
                                                className="mt-1.5 border-border focus:border-ring h-11 transition-all duration-200"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <LabelWithTooltip
                                                htmlFor="siteKeywords"
                                                label={t('adminPage.settings.general.fields.siteKeywords.label')}
                                                tooltip={t('adminPage.settings.general.fields.siteKeywords.tooltip')}
                                            />
                                            <Input
                                                value={siteKeywords}
                                                onChange={inputHandler}
                                                name="siteKeywords"
                                                id="siteKeywords"
                                                placeholder={t('adminPage.settings.general.fields.siteKeywords.placeholder')}
                                                className="mt-1.5 border-border focus:border-ring h-11 transition-all duration-200"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <LabelWithTooltip
                                                htmlFor="googleAnalytics"
                                                label={t('adminPage.settings.general.fields.googleAnalytics.label')}
                                                tooltip={t('adminPage.settings.general.fields.googleAnalytics.tooltip')}
                                            />
                                            <Input
                                                value={googleAnalyticsId}
                                                onChange={inputHandler}
                                                name="googleAnalyticsId"
                                                id="googleAnalytics"
                                                placeholder={t('adminPage.settings.general.fields.googleAnalytics.placeholder')}
                                                className="mt-1.5 border-border focus:border-ring h-11 transition-all duration-200"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <LabelWithTooltip
                                                htmlFor="siteAddress"
                                                label={t('adminPage.settings.general.fields.siteAddress.label')}
                                                tooltip={t('adminPage.settings.general.fields.siteAddress.tooltip')}
                                            />
                                            <Input
                                                value={siteAddress}
                                                onChange={inputHandler}
                                                name="siteAddress"
                                                id="siteAddress"
                                                placeholder={t('adminPage.settings.general.fields.siteAddress.placeholder')}
                                                className="mt-1.5 border-border focus:border-ring h-11 transition-all duration-200"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <LabelWithTooltip
                                                htmlFor="sitePhone"
                                                label={t('adminPage.settings.general.fields.sitePhone.label')}
                                                tooltip={t('adminPage.settings.general.fields.sitePhone.tooltip')}
                                            />
                                            <Input
                                                value={sitePhone}
                                                onChange={inputHandler}
                                                name="sitePhone"
                                                id="sitePhone"
                                                placeholder={t('adminPage.settings.general.fields.sitePhone.placeholder')}
                                                className="mt-1.5 border-border focus:border-ring h-11 transition-all duration-200"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <LabelWithTooltip
                                                htmlFor="siteEmail"
                                                label={t('adminPage.settings.general.fields.siteEmail.label')}
                                                tooltip={t('adminPage.settings.general.fields.siteEmail.tooltip')}
                                            />
                                            <Input
                                                value={siteEmail}
                                                onChange={inputHandler}
                                                name="siteEmail"
                                                id="siteEmail"
                                                type="email"
                                                placeholder={t('adminPage.settings.general.fields.siteEmail.placeholder')}
                                                className="mt-1.5 border-border focus:border-ring h-11 transition-all duration-200"
                                            />
                                        </div>

                                        <div className="space-y-2.5">
                                            <LabelWithTooltip
                                                htmlFor="siteCopyright"
                                                label="Copyright Text"
                                                tooltip="The copyright text that will appear in the footer of your website"
                                            />
                                            <Input
                                                value={siteCopyright}
                                                onChange={inputHandler}
                                                name="siteCopyright"
                                                id="siteCopyright"
                                                placeholder="© 2024 Your Company Name. All rights reserved."
                                                className="mt-1.5 border-border focus:border-ring h-11 transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2.5">
                                            <LabelWithTooltip
                                                htmlFor="siteDescription"
                                                label={t('adminPage.settings.general.fields.siteDescription.label')}
                                                tooltip={t('adminPage.settings.general.fields.siteDescription.tooltip')}
                                            />
                                            <Textarea
                                                value={siteDescription}
                                                onChange={inputHandler}
                                                name="siteDescription"
                                                id="siteDescription"
                                                placeholder={t('adminPage.settings.general.fields.siteDescription.placeholder')}
                                                className="mt-1.5 h-[150px] border-border focus:border-ring resize-none transition-all duration-200"
                                            />
                                        </div>

                                        <Card className="border-dashed border-border hover:border-ring transition-colors duration-300">
                                            <CardHeader className="p-5">
                                                <LabelWithTooltip
                                                    htmlFor="logo"
                                                    label={t('adminPage.settings.general.fields.logo.label')}
                                                    tooltip={t('adminPage.settings.general.fields.logo.tooltip')}
                                                />
                                            </CardHeader>
                                            <CardContent className="p-5 pt-0">
                                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                                    <div className="h-20 w-56 flex items-center justify-center bg-muted rounded-lg border border-border">
                                                        <img
                                                            id="siteLogo"
                                                            src={logoUrl || '/uploads/logo.png'}
                                                            alt="Current Site Logo"
                                                            className="h-full object-contain p-3"
                                                            onError={(e) => {
                                                                e.target.src = '/uploads/logo.png';
                                                                e.target.onerror = null;
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mt-4 sm:mt-0">
                                                        <Input type="file" id="logo" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => document.getElementById('logo').click()}
                                                            disabled={isUploading}
                                                            className="w-[160px] h-11 border-border hover:border-ring hover:bg-accent transition-all duration-200">
                                                            {isUploading ? (
                                                                <>
                                                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                                    <span className="text-muted-foreground">{t('adminPage.settings.general.fields.logo.uploading')}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload className="h-4 w-4 mr-2 text-foreground" />
                                                                    <span className="text-muted-foreground">{t('adminPage.settings.general.fields.logo.button')}</span>
                                                                </>
                                                            )}
                                                        </Button>
                                                        <p className="text-sm text-muted-foreground mt-3">{t('adminPage.settings.general.fields.logo.supportedFormats')}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <Separator className="my-8 bg-border" />

                                <div className="space-y-4 bg-muted p-6 rounded-xl border border-border">
                                    <div className="flex items-start space-x-3">
                                        <Checkbox
                                            id="maintenanceMode"
                                            name="maintenanceMode"
                                            checked={maintenanceMode}
                                            onCheckedChange={(checked) => setMaintenanceMode(checked)}
                                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
                                        />
                                        <div className="space-y-1.5">
                                            <Label htmlFor="maintenanceMode" className="font-medium text-foreground text-base">
                                                {t('adminPage.settings.general.fields.maintenanceMode.label')}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">{t('adminPage.settings.general.fields.maintenanceMode.description')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button 
                                        onClick={handleGeneralSettingsSubmit} 
                                        className="bg-primary text-primary-foreground w-[160px] h-11 hover:bg-primary/90 transition-colors duration-200"
                                    >
                                        {t('adminPage.settings.general.buttons.saveChanges')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="subscriptions">
                        <SubscriptionManagement />
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
                    
                    <TabsContent value="contact">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">Contact Settings</CardTitle>
                                <CardDescription>Configure contact page content and settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Contact Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="supportEmail">Support Email</Label>
                                            <Input
                                                id="supportEmail"
                                                value={contactSettings.support_email || ''}
                                                onChange={(e) => 
                                                    setContactSettings(prev => ({...prev, support_email: e.target.value}))
                                                }
                                                placeholder="support@example.com"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="supportPhone">Support Phone</Label>
                                            <Input
                                                id="supportPhone"
                                                value={contactSettings.support_phone || ''}
                                                onChange={(e) => 
                                                    setContactSettings(prev => ({...prev, support_phone: e.target.value}))
                                                }
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="liveChatHours">Live Chat Hours</Label>
                                            <Input
                                                id="liveChatHours"
                                                value={contactSettings.live_chat_hours || ''}
                                                onChange={(e) => 
                                                    setContactSettings(prev => ({...prev, live_chat_hours: e.target.value}))
                                                }
                                                placeholder="Available 9AM - 6PM EST"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Hero Section */}
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Hero Section</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="heroTitleLine1">Hero Title Line 1</Label>
                                            <Input
                                                id="heroTitleLine1"
                                                value={contactSettings.hero_title_line1 || ''}
                                                onChange={(e) => 
                                                    setContactSettings(prev => ({...prev, hero_title_line1: e.target.value}))
                                                }
                                                placeholder="Let's Start a"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="heroTitleLine2">Hero Title Line 2</Label>
                                            <Input
                                                id="heroTitleLine2"
                                                value={contactSettings.hero_title_line2 || ''}
                                                onChange={(e) => 
                                                    setContactSettings(prev => ({...prev, hero_title_line2: e.target.value}))
                                                }
                                                placeholder="Conversation"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="heroDescription">Hero Description</Label>
                                        <Textarea
                                            id="heroDescription"
                                            value={contactSettings.hero_description || ''}
                                            onChange={(e) => 
                                                setContactSettings(prev => ({...prev, hero_description: e.target.value}))
                                            }
                                            placeholder="We're here to help you succeed..."
                                            className="h-24"
                                        />
                                    </div>
                                </div>

                                {/* Form Section */}
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Form Section</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="formTitle">Form Section Title</Label>
                                            <Input
                                                id="formTitle"
                                                value={contactSettings.form_section_title || ''}
                                                onChange={(e) => 
                                                    setContactSettings(prev => ({...prev, form_section_title: e.target.value}))
                                                }
                                                placeholder="Send Us a Message"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="formDescription">Form Section Description</Label>
                                            <Input
                                                id="formDescription"
                                                value={contactSettings.form_section_description || ''}
                                                onChange={(e) => 
                                                    setContactSettings(prev => ({...prev, form_section_description: e.target.value}))
                                                }
                                                placeholder="Fill out the form below..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* FAQ Section */}
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">FAQ Section</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="faqTitle">FAQ Section Title</Label>
                                            <Input
                                                id="faqTitle"
                                                value={contactSettings.faq_section_title || ''}
                                                onChange={(e) => 
                                                    setContactSettings(prev => ({...prev, faq_section_title: e.target.value}))
                                                }
                                                placeholder="Frequently Asked Questions"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="faqDescription">FAQ Section Description</Label>
                                            <Input
                                                id="faqDescription"
                                                value={contactSettings.faq_section_description || ''}
                                                onChange={(e) => 
                                                    setContactSettings(prev => ({...prev, faq_section_description: e.target.value}))
                                                }
                                                placeholder="Quick answers to common questions"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Stats */}
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Contact Stats</h3>
                                    <p className="text-sm text-muted-foreground">Manage the statistics displayed on the contact page</p>
                                    {contactStats.map((stat, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                                            <div>
                                                <Label htmlFor={`stat-number-${index}`}>Number/Value</Label>
                                                <Input
                                                    id={`stat-number-${index}`}
                                                    value={stat.number || ''}
                                                    onChange={(e) => {
                                                        const newStats = [...contactStats];
                                                        newStats[index] = {...newStats[index], number: e.target.value};
                                                        setContactStats(newStats);
                                                    }}
                                                    placeholder="<2h"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`stat-label-${index}`}>Label</Label>
                                                <Input
                                                    id={`stat-label-${index}`}
                                                    value={stat.label || ''}
                                                    onChange={(e) => {
                                                        const newStats = [...contactStats];
                                                        newStats[index] = {...newStats[index], label: e.target.value};
                                                        setContactStats(newStats);
                                                    }}
                                                    placeholder="Average Response Time"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`stat-icon-${index}`}>Icon</Label>
                                                <Input
                                                    id={`stat-icon-${index}`}
                                                    value={stat.icon || ''}
                                                    onChange={(e) => {
                                                        const newStats = [...contactStats];
                                                        newStats[index] = {...newStats[index], icon: e.target.value};
                                                        setContactStats(newStats);
                                                    }}
                                                    placeholder="⚡"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setContactStats([...contactStats, { number: '', label: '', icon: '⚡', order_index: contactStats.length }]);
                                        }}
                                    >
                                        Add Stat
                                    </Button>
                                </div>

                                {/* Contact FAQs */}
                                <Separator />
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Contact FAQs</h3>
                                    <p className="text-sm text-muted-foreground">Manage frequently asked questions on the contact page</p>
                                    {contactFaqs.map((faq, index) => (
                                        <div key={index} className="space-y-4 p-4 border rounded-lg">
                                            <div>
                                                <Label htmlFor={`faq-question-${index}`}>Question</Label>
                                                <Input
                                                    id={`faq-question-${index}`}
                                                    value={faq.question || ''}
                                                    onChange={(e) => {
                                                        const newFaqs = [...contactFaqs];
                                                        newFaqs[index] = {...newFaqs[index], question: e.target.value};
                                                        setContactFaqs(newFaqs);
                                                    }}
                                                    placeholder="How quickly do you respond?"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor={`faq-answer-${index}`}>Answer</Label>
                                                <Textarea
                                                    id={`faq-answer-${index}`}
                                                    value={faq.answer || ''}
                                                    onChange={(e) => {
                                                        const newFaqs = [...contactFaqs];
                                                        newFaqs[index] = {...newFaqs[index], answer: e.target.value};
                                                        setContactFaqs(newFaqs);
                                                    }}
                                                    placeholder="We typically respond within 2 hours..."
                                                    className="h-20"
                                                />
                                            </div>
                                            <Button 
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    setContactFaqs(contactFaqs.filter((_, i) => i !== index));
                                                }}
                                            >
                                                Remove FAQ
                                            </Button>
                                        </div>
                                    ))}
                                    <Button 
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setContactFaqs([...contactFaqs, { question: '', answer: '', order_index: contactFaqs.length }]);
                                        }}
                                    >
                                        Add FAQ
                                    </Button>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button 
                                        onClick={handleContactSettingsSubmit}
                                        className="bg-primary text-primary-foreground w-[160px] h-11 hover:bg-primary/90 transition-colors duration-200"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default Settings;
              