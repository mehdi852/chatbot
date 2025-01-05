'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MoreVertical, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function SubscriptionManagement() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [subscriptions, setSubscriptions] = useState([]);
    const [editItem, setEditItem] = useState(null);
    const [loading, setLoading] = useState({
        fetchSubscriptions: true,
        createSubscription: false,
        editItem: false,
        deleteItem: false,
        changeStatus: false,
    });
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        yearlyPrice: '',
        stripeMonthlyLink: '',
        stripeYearlyLink: '',
        stripeMonthlyPriceId: '',
        stripeYearlyPriceId: '',
        status: 'active',
    });

    const fetchSubscriptions = async () => {
        setLoading((prev) => ({ ...prev, fetchSubscriptions: true }));
        try {
            const res = await fetch('/api/admin/get-subscriptions-types');
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || t('adminPage.settings.subscriptions.messages.error.fetch'));
            }
            const data = await res.json();
            setSubscriptions(data.subscriptions);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: t('adminPage.settings.subscriptions.messages.error.fetch'),
            });
        } finally {
            setLoading((prev) => ({ ...prev, fetchSubscriptions: false }));
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleCreateSubscription = async (item) => {
        setLoading((prev) => ({ ...prev, createSubscription: true }));
        try {
            const res = await fetch('/api/admin/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(item),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || t('adminPage.settings.subscriptions.messages.error.create'));
            }

            const newSubscription = await res.json();
            setSubscriptions((prevSubscriptions) => [...prevSubscriptions, newSubscription.newSubscription]);
            toast({
                variant: 'success',
                title: t('adminPage.settings.subscriptions.messages.success.created'),
                description: t('adminPage.settings.subscriptions.messages.success.createdDesc'),
            });
        } catch (error) {
            console.error('Error creating subscription:', error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: t('adminPage.settings.subscriptions.messages.error.create'),
            });
        } finally {
            setLoading((prev) => ({ ...prev, createSubscription: false }));
        }
    };

    const handleEdit = async (type, item) => {
        setLoading((prev) => ({ ...prev, editItem: true }));
        try {
            let res;
            const { type: itemType, ...rest } = item;

            if (type === 'feature_create') {
                res = await fetch('/api/admin/add-feature-subscriptionType', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name: item.name, subscription_id: item.subscriptionId }),
                });
            } else if (type === 'subscription') {
                res = await fetch('/api/admin/edit-subscription-type', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(rest),
                });
            } else if (type === 'feature') {
                res = await fetch('/api/admin/edit-feature-subscriptionType', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: item.id, name: item.name }),
                });
            } else {
                console.error('Editing other types is not implemented.');
                return;
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || t('adminPage.settings.subscriptions.messages.error.update'));
            }

            await fetchSubscriptions();

            toast({
                variant: 'success',
                title: t('adminPage.settings.subscriptions.messages.success.updated'),
                description: t('adminPage.settings.subscriptions.messages.success.updatedDesc'),
            });
        } catch (error) {
            console.error('Error editing item:', error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: t('adminPage.settings.subscriptions.messages.error.update'),
            });
        } finally {
            setLoading((prev) => ({ ...prev, editItem: false }));
            setEditItem(null);
        }
    };

    const handleDelete = async (type, itemId, parentId = null) => {
        setLoading((prev) => ({ ...prev, deleteItem: true }));
        try {
            let res;
            if (type === 'subscription') {
                res = await fetch(`/api/admin/remove-subscription-type`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: itemId }),
                });
            } else if (type === 'feature') {
                res = await fetch(`/api/admin/remove-subscription-feature`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id: itemId }),
                });
            }

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || t('adminPage.settings.subscriptions.messages.error.delete', { type }));
            }

            await fetchSubscriptions();
            toast({
                variant: 'success',
                title: t('adminPage.settings.subscriptions.messages.success.deleted', { type: type.charAt(0).toUpperCase() + type.slice(1) }),
                description: t('adminPage.settings.subscriptions.messages.success.deletedDesc', { type }),
            });
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: t('adminPage.settings.subscriptions.messages.error.delete', { type }),
            });
        } finally {
            setLoading((prev) => ({ ...prev, deleteItem: false }));
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setLoading((prev) => ({ ...prev, changeStatus: true }));
        try {
            const res = await fetch('/api/admin/edit-status-subscription-type', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || t('adminPage.settings.subscriptions.messages.error.statusChange'));
            }

            await fetchSubscriptions();

            toast({
                variant: 'success',
                title: t('adminPage.settings.subscriptions.messages.success.statusChanged'),
                description: t('adminPage.settings.subscriptions.messages.success.statusChangedDesc'),
            });
        } catch (error) {
            console.error('Error updating subscription status:', error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: t('adminPage.settings.subscriptions.messages.error.statusChange'),
            });
        } finally {
            setLoading((prev) => ({ ...prev, changeStatus: false }));
        }
    };

    const renderSubscriptionList = () => (
        <ScrollArea className="h-[calc(100vh-27rem)] pr-4 sm:pr-6">
            {loading.fetchSubscriptions ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                subscriptions.map((sub) => (
                    <Card key={sub.id} className="mb-3 bg-card">
                        <CardHeader className="p-3 sm:p-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="mb-2 sm:mb-0">
                                    <CardTitle className="text-base sm:text-lg font-semibold text-foreground">{sub.name}</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm mt-1 text-muted-foreground">
                                        {t('Monthly')}: ${sub.price} | {t('Yearly')}: ${sub.yearlyPrice}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {sub.status && <Badge variant={sub.status === 'active' ? 'success' : 'secondary'}>{t(`adminPage.settings.subscriptions.list.status.${sub.status}`)}</Badge>}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-popover">
                                            <DropdownMenuLabel className="text-foreground">{t('adminPage.settings.subscriptions.list.actions.label')}</DropdownMenuLabel>
                                            <DropdownMenuItem
                                                className="text-foreground hover:bg-accent"
                                                onClick={() =>
                                                    setEditItem({
                                                        type: 'subscription',
                                                        ...sub,
                                                        stripeMonthlyLink: sub.stripeMonthlyLink,
                                                        stripeYearlyLink: sub.stripeYearlyLink,
                                                        stripeMonthlyPriceId: sub.stripeMonthlyPriceId,
                                                        stripeYearlyPriceId: sub.stripeYearlyPriceId,
                                                    })
                                                }>
                                                {t('adminPage.settings.subscriptions.list.actions.edit')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-foreground hover:bg-accent" onClick={() => handleDelete('subscription', sub.id)}>
                                                {t('adminPage.settings.subscriptions.list.actions.delete')}
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-border" />
                                            <DropdownMenuItem className="text-foreground hover:bg-accent" onClick={() => handleStatusChange(sub.id, !(sub.status === 'active' ? true : false))}>
                                                {sub.status === 'active' ? t('adminPage.settings.subscriptions.list.actions.deactivate') : t('adminPage.settings.subscriptions.list.actions.activate')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-2 sm:pt-4 px-3 sm:px-4 pb-0">
                            {sub?.features?.map((feature) => (
                                <div key={feature.id} className="flex items-center justify-between mb-2">
                                    <span className="text-xs sm:text-sm text-foreground">{feature.name}</span>
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <Button variant="ghost" size="sm" onClick={() => setEditItem({ type: 'feature', ...feature, subscriptionId: sub.id })} className="hover:bg-accent">
                                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete('feature', feature.id, sub.id)} className="hover:bg-accent">
                                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                className="w-full mt-2 sm:my-4 text-xs sm:text-sm border-border hover:bg-accent"
                                onClick={() => setEditItem({ type: 'feature_create', subscriptionId: sub.id, name: '' })}>
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                {t('adminPage.settings.subscriptions.list.features.addButton')}
                            </Button>
                        </CardContent>
                    </Card>
                ))
            )}
        </ScrollArea>
    );

    const renderSubscriptionForm = () => {
        const handleInputChange = (e) => {
            const { id, value } = e.target;
            setFormData((prevData) => ({
                ...prevData,
                [id]: value,
            }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            await handleCreateSubscription(formData);
        };

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="name" className="text-sm font-medium text-foreground">
                        {t('adminPage.settings.subscriptions.createNew.fields.name.label')}
                    </Label>
                    <Input
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-background border-border"
                        placeholder={t('adminPage.settings.subscriptions.createNew.fields.name.placeholder')}
                    />
                </div>
                <div>
                    <Label htmlFor="price" className="text-sm font-medium text-foreground">
                        {t('adminPage.settings.subscriptions.createNew.fields.price.label')}
                    </Label>
                    <Input
                        id="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-background border-border"
                        placeholder={t('adminPage.settings.subscriptions.createNew.fields.price.placeholder')}
                    />
                </div>
                <div>
                    <Label htmlFor="yearlyPrice" className="text-sm font-medium text-foreground">
                        {t('adminPage.settings.subscriptions.createNew.fields.yearlyPrice.label')}
                    </Label>
                    <Input
                        id="yearlyPrice"
                        value={formData.yearlyPrice}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-background border-border"
                        placeholder={t('adminPage.settings.subscriptions.createNew.fields.yearlyPrice.placeholder')}
                    />
                </div>
                <div>
                    <Label htmlFor="stripeMonthlyLink" className="text-sm font-medium text-foreground">
                        {t('adminPage.settings.subscriptions.createNew.fields.stripeMonthlyLink.label')}
                    </Label>
                    <Input
                        id="stripeMonthlyLink"
                        value={formData.stripeMonthlyLink}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-background border-border"
                        placeholder={t('adminPage.settings.subscriptions.createNew.fields.stripeMonthlyLink.placeholder')}
                    />
                </div>
                <div>
                    <Label htmlFor="stripeYearlyLink" className="text-sm font-medium text-foreground">
                        {t('adminPage.settings.subscriptions.createNew.fields.stripeYearlyLink.label')}
                    </Label>
                    <Input
                        id="stripeYearlyLink"
                        value={formData.stripeYearlyLink}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-background border-border"
                        placeholder={t('adminPage.settings.subscriptions.createNew.fields.stripeYearlyLink.placeholder')}
                    />
                </div>
                <div>
                    <Label htmlFor="stripeMonthlyPriceId" className="text-sm font-medium text-foreground">
                        {t('adminPage.settings.subscriptions.createNew.fields.stripeMonthlyPriceId.label')}
                    </Label>
                    <Input
                        id="stripeMonthlyPriceId"
                        value={formData.stripeMonthlyPriceId}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-background border-border"
                        placeholder={t('adminPage.settings.subscriptions.createNew.fields.stripeMonthlyPriceId.placeholder')}
                    />
                </div>
                <div>
                    <Label htmlFor="stripeYearlyPriceId" className="text-sm font-medium text-foreground">
                        {t('adminPage.settings.subscriptions.createNew.fields.stripeYearlyPriceId.label')}
                    </Label>
                    <Input
                        id="stripeYearlyPriceId"
                        value={formData.stripeYearlyPriceId}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-background border-border"
                        placeholder={t('adminPage.settings.subscriptions.createNew.fields.stripeYearlyPriceId.placeholder')}
                    />
                </div>
                <div>
                    <Label htmlFor="status" className="text-sm font-medium text-foreground">
                        {t('adminPage.settings.subscriptions.createNew.fields.status.label')}
                    </Label>
                    <Select id="status" value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
                        <SelectTrigger className="mt-1 bg-background border-border">
                            <SelectValue placeholder={t('adminPage.settings.subscriptions.createNew.fields.status.label')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="active">{t('adminPage.settings.subscriptions.createNew.fields.status.options.active')}</SelectItem>
                            <SelectItem value="inactive">{t('adminPage.settings.subscriptions.createNew.fields.status.options.inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading.createSubscription}>
                    {loading.createSubscription ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Create Subscription
                </Button>
            </form>
        );
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
            <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-foreground">Subscription Management</h1>
            <div className="flex justify-between items-center mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-base sm:text-lg text-foreground">Subscriptions</CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground">Manage your subscriptions</CardDescription>
                    </CardHeader>
                    <CardContent>{renderSubscriptionList()}</CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg text-foreground">Create New Subscription</CardTitle>
                        <CardDescription className="text-xs sm:text-sm text-muted-foreground">Add a new subscription to your system</CardDescription>
                    </CardHeader>
                    <CardContent>{renderSubscriptionForm()}</CardContent>
                </Card>
            </div>
            <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
                <DialogContent className="sm:max-w-[425px] bg-background">
                    <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg text-foreground">Edit {editItem?.type === 'subscription' ? 'Subscription' : 'Feature'}</DialogTitle>
                        <DialogDescription className="text-xs sm:text-sm text-muted-foreground">Make changes to the {editItem?.type} here.</DialogDescription>
                    </DialogHeader>
                    {editItem && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleEdit(editItem.type, editItem);
                            }}
                            className="space-y-3 sm:space-y-4">
                            {editItem.type === 'subscription' ? (
                                <>
                                    <div>
                                        <Label htmlFor="edit-name" className="text-xs sm:text-sm font-medium text-foreground">
                                            Name
                                        </Label>
                                        <Input id="edit-name" value={editItem.name} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} required className="mt-1 text-xs sm:text-sm" />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-price" className="text-xs sm:text-sm font-medium text-foreground">
                                            Price
                                        </Label>
                                        <Input
                                            id="edit-price"
                                            value={editItem.price}
                                            onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                                            required
                                            className="mt-1 text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-yearlyPrice" className="text-xs sm:text-sm font-medium text-foreground">
                                            Yearly Price
                                        </Label>
                                        <Input
                                            id="edit-yearlyPrice"
                                            value={editItem.yearlyPrice}
                                            onChange={(e) => setEditItem({ ...editItem, yearlyPrice: e.target.value })}
                                            required
                                            className="mt-1 text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-stripeMonthlyLink" className="text-xs sm:text-sm font-medium text-foreground">
                                            Stripe Monthly Link
                                        </Label>
                                        <Input
                                            id="edit-stripeMonthlyLink"
                                            value={editItem.stripeMonthlyLink}
                                            onChange={(e) => setEditItem({ ...editItem, stripeMonthlyLink: e.target.value })}
                                            required
                                            className="mt-1 text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-stripeYearlyLink" className="text-xs sm:text-sm font-medium text-foreground">
                                            Stripe Yearly Link
                                        </Label>
                                        <Input
                                            id="edit-stripeYearlyLink"
                                            value={editItem.stripeYearlyLink}
                                            onChange={(e) => setEditItem({ ...editItem, stripeYearlyLink: e.target.value })}
                                            required
                                            className="mt-1 text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-stripeMonthlyPriceId" className="text-xs sm:text-sm font-medium text-foreground">
                                            Stripe Monthly Price ID
                                        </Label>
                                        <Input
                                            id="edit-stripeMonthlyPriceId"
                                            value={editItem.stripeMonthlyPriceId}
                                            onChange={(e) => setEditItem({ ...editItem, stripeMonthlyPriceId: e.target.value })}
                                            required
                                            className="mt-1 text-xs sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit-stripeYearlyPriceId" className="text-xs sm:text-sm font-medium text-foreground">
                                            Stripe Yearly Price ID
                                        </Label>
                                        <Input
                                            id="edit-stripeYearlyPriceId"
                                            value={editItem.stripeYearlyPriceId}
                                            onChange={(e) => setEditItem({ ...editItem, stripeYearlyPriceId: e.target.value })}
                                            required
                                            className="mt-1 text-xs sm:text-sm"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <Label htmlFor="edit-feature-name" className="text-xs sm:text-sm font-medium text-foreground">
                                        Feature Name
                                    </Label>
                                    <Input
                                        id="edit-feature-name"
                                        value={editItem.name}
                                        onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                                        required
                                        className="mt-1 text-xs sm:text-sm"
                                    />
                                </div>
                            )}
                            <DialogFooter>
                                <Button type="submit" className="text-xs sm:text-sm bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading.editItem}>
                                    {loading.editItem ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    Save changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
