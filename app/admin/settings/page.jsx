'use client';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Info, Upload, Settings as SettingsIcon, CreditCard, Shield, Loader2, Share2, Link } from 'lucide-react';
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
    };

    useEffect(() => {
        getGeneralSettingsFromDB();
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
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium">{t('adminPage.settings.usageLimits.title')}</h3>
                        <p className="text-sm text-muted-foreground">{t('adminPage.settings.usageLimits.description')}</p>
                    </div>
                    <Button onClick={handleSaveChanges} disabled={!hasChanges}>
                        {t('adminPage.settings.usageLimits.buttons.saveChanges')}
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('adminPage.settings.usageLimits.table.subscription')}</TableHead>
                            <TableHead>{t('adminPage.settings.usageLimits.table.maxWebsites')}</TableHead>
                            <TableHead>{t('adminPage.settings.usageLimits.table.maxPathsPerWebsite')}</TableHead>
                            <TableHead>{t('adminPage.settings.usageLimits.table.maxPopupsPerPath')}</TableHead>
                            <TableHead>{t('adminPage.settings.usageLimits.table.features')}</TableHead>
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
                                            <Checkbox checked={subscription.allow_advertising} onCheckedChange={(checked) => handleLimitChange(subscription.id, 'allow_advertising', checked)} />
                                            <Label>Advertising</Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                checked={subscription.allow_email_collector}
                                                onCheckedChange={(checked) => handleLimitChange(subscription.id, 'allow_email_collector', checked)}
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
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('adminPage.settings.socialLinks.title')}</CardTitle>
                    <CardDescription>{t('adminPage.settings.socialLinks.description')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleAddLink} className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="name">{t('adminPage.settings.socialLinks.form.platformName.label')}</Label>
                                <Input
                                    id="name"
                                    value={newLink.name}
                                    onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                                    placeholder={t('adminPage.settings.socialLinks.form.platformName.placeholder')}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="url">{t('adminPage.settings.socialLinks.form.url.label')}</Label>
                                <Input
                                    id="url"
                                    value={newLink.url}
                                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                    placeholder={t('adminPage.settings.socialLinks.form.url.placeholder')}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="image_url">{t('adminPage.settings.socialLinks.form.iconUrl.label')}</Label>
                                <Input
                                    id="image_url"
                                    value={newLink.image_url}
                                    onChange={(e) => setNewLink({ ...newLink, image_url: e.target.value })}
                                    placeholder={t('adminPage.settings.socialLinks.form.iconUrl.placeholder')}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit">{t('adminPage.settings.socialLinks.buttons.addLink')}</Button>
                    </form>

                    <Separator />

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('adminPage.settings.socialLinks.table.icon')}</TableHead>
                                <TableHead>{t('adminPage.settings.socialLinks.table.platform')}</TableHead>
                                <TableHead>{t('adminPage.settings.socialLinks.table.url')}</TableHead>
                                <TableHead className="text-right">{t('adminPage.settings.socialLinks.table.actions')}</TableHead>
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
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {link.url}
                                        </a>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="destructive" size="sm" onClick={() => handleRemoveLink(link.id)}>
                                            {t('Remove')}
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
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('adminPage.settings.footerLinks.title')}</CardTitle>
                        <CardDescription>{t('adminPage.settings.footerLinks.description')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleAddLink} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="name">{t('adminPage.settings.footerLinks.form.linkName.label')}</Label>
                                    <Input
                                        id="name"
                                        value={newLink.name}
                                        onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                                        placeholder={t('adminPage.settings.footerLinks.form.linkName.placeholder')}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="url">{t('adminPage.settings.footerLinks.form.url.label')}</Label>
                                    <Input
                                        id="url"
                                        value={newLink.url}
                                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                        placeholder={t('adminPage.settings.footerLinks.form.url.placeholder')}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="type">Type</Label>
                                    <select id="type" value={newLink.type} onChange={(e) => setNewLink({ ...newLink, type: e.target.value })} className="w-full p-2 border rounded-md" required>
                                        <option value="sitemap">Sitemap</option>
                                        <option value="company">Company</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit">Add Link</Button>
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
                                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                            {link.url}
                                                        </a>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="destructive" size="sm" onClick={() => handleRemoveLink(link.id, 'sitemap')}>
                                                            {t('Remove')}
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
                                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                                            {link.url}
                                                        </a>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="destructive" size="sm" onClick={() => handleRemoveLink(link.id, 'company')}>
                                                            {t('Remove')}
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
        <div className="ml-72 p-8 bg-background">
            <div className="mx-auto space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('adminPage.settings.title')}</h1>
                    <p className="text-muted-foreground">{t('adminPage.settings.description')}</p>
                </div>

                <Separator className="my-6 bg-border" />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <div className="flex items-center space-x-4 bg-card rounded-lg p-1 border border-border shadow-sm">
                        <TabsList className="bg-transparent">
                            {tabs.map((tab) => (
                                <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2 transition-all">
                                    <div className="flex items-center space-x-2">
                                        <div className={`${tab.iconBg} dark:bg-background/10 p-1 rounded-md ${tab.iconColor}`}>{tab.icon}</div>
                                        <span>{tab.label}</span>
                                    </div>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>

                    <TabsContent value="general">
                        <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader className="space-y-1">
                                <CardTitle className="text-2xl text-foreground">{t('adminPage.settings.general.title')}</CardTitle>
                                <CardDescription className="text-muted-foreground">{t('adminPage.settings.general.description')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
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
                                                className="mt-1.5 border-border focus:border-ring"
                                            />
                                        </div>

                                        <div>
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
                                                className="mt-1.5 border-border focus:border-ring"
                                            />
                                        </div>

                                        <div>
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
                                                className="mt-1.5 border-border focus:border-ring"
                                            />
                                        </div>

                                        <div>
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
                                                className="mt-1.5 border-border focus:border-ring"
                                            />
                                        </div>

                                        <div>
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
                                                className="mt-1.5 border-border focus:border-ring"
                                            />
                                        </div>

                                        <div>
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
                                                className="mt-1.5 border-border focus:border-ring"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
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
                                                className="mt-1.5 h-[120px] border-border focus:border-ring"
                                            />
                                        </div>

                                        <Card className="border-dashed border-border hover:border-ring transition-colors">
                                            <CardHeader className="p-4">
                                                <LabelWithTooltip
                                                    htmlFor="logo"
                                                    label={t('adminPage.settings.general.fields.logo.label')}
                                                    tooltip={t('adminPage.settings.general.fields.logo.tooltip')}
                                                />
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0">
                                                <div className="flex items-center gap-6">
                                                    <div className="h-16 w-48 flex items-center justify-center bg-muted rounded-lg border border-border">
                                                        <img
                                                            id="siteLogo"
                                                            src={logoUrl || '/uploads/logo.png'}
                                                            alt="Current Site Logo"
                                                            className="h-full object-contain p-2"
                                                            onError={(e) => {
                                                                e.target.src = '/uploads/logo.png';
                                                                e.target.onerror = null;
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <Input type="file" id="logo" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => document.getElementById('logo').click()}
                                                            disabled={isUploading}
                                                            className="w-[140px] border-border hover:border-ring hover:bg-accent">
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
                                                        <p className="text-sm text-muted-foreground mt-2">{t('adminPage.settings.general.fields.logo.supportedFormats')}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <Separator className="my-6 bg-border" />

                                <div className="space-y-4 bg-muted p-4 rounded-lg border border-border">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="maintenanceMode"
                                            name="maintenanceMode"
                                            checked={maintenanceMode}
                                            onCheckedChange={(checked) => setMaintenanceMode(checked)}
                                            className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <div className="space-y-1">
                                            <Label htmlFor="maintenanceMode" className="font-medium text-foreground">
                                                {t('adminPage.settings.general.fields.maintenanceMode.label')}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">{t('adminPage.settings.general.fields.maintenanceMode.description')}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleGeneralSettingsSubmit} className="bg-primary text-primary-foreground w-[140px] hover:bg-primary/90 transition-colors">
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
                </Tabs>
            </div>
        </div>
    );
};

export default Settings;
