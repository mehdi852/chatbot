'use client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/utils/Functions';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from './LoadingSpinner';

const UserEditorProfile = ({ user, getTotalUsers, onUpdateSuccess }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [accountSettings, setAccountSettings] = useState({
        status: user.status,
        role: user.role,
    });

    // Handle dropdown changes for account settings
    const handleDropdownChange = (name, value) => {
        setAccountSettings((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleFormSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/edit-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, changedFields: accountSettings }),
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            toast({
                title: 'Success',
                description: t('adminPage.userEditor.profile.messages.updateSuccess'),
                variant: 'success',
            });
            getTotalUsers();
            onUpdateSuccess();
        } catch (error) {
            toast({
                title: 'Error',
                description: t('adminPage.userEditor.profile.messages.updateError'),
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <LoadingSpinner />;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4 text-foreground">{t('adminPage.userEditor.profile.title')}</h1>
            <Card className="bg-card">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-border">
                        <AvatarImage src={user.imageUrl} alt={user.name} />
                        <AvatarFallback className="bg-muted">{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl text-foreground">{user.name}</CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                            {t('adminPage.userEditor.profile.subscriptionStatus', { status: user.subscription ? 'Paid' : 'Free' })}
                        </CardDescription>
                        <CardDescription className="text-sm text-muted-foreground">{t('adminPage.userEditor.profile.accountCreated', { date: formatDate(user.created_at) })}</CardDescription>
                    </div>
                </CardHeader>
            </Card>
            <Card className="mt-4 bg-card">
                <CardHeader>
                    <CardTitle className="text-lg text-foreground">{t('adminPage.userEditor.profile.personalInfo.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="name" className="text-foreground">
                            {t('adminPage.userEditor.profile.personalInfo.name')}
                        </Label>
                        <Input id="name" value={user.name} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="email" className="text-foreground">
                            {t('adminPage.userEditor.profile.personalInfo.email')}
                        </Label>
                        <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-4 bg-card">
                <CardHeader>
                    <CardTitle className="text-lg text-foreground">{t('adminPage.userEditor.profile.accountSettings.title')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="status" className="text-foreground">
                            {t('adminPage.userEditor.profile.accountSettings.status')}
                        </Label>
                        <Select onValueChange={(value) => handleDropdownChange('status', value)}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder={accountSettings.status} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">{t('adminPage.userEditor.profile.accountSettings.statuses.active')}</SelectItem>
                                <SelectItem value="banned">{t('adminPage.userEditor.profile.accountSettings.statuses.banned')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="role" className="text-foreground">
                            {t('adminPage.userEditor.profile.accountSettings.role')}
                        </Label>
                        <Select onValueChange={(value) => handleDropdownChange('role', value)}>
                            <SelectTrigger className="bg-background">
                                <SelectValue placeholder={accountSettings.role} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">{t('adminPage.userEditor.profile.accountSettings.roles.user')}</SelectItem>
                                <SelectItem value="admin">{t('adminPage.userEditor.profile.accountSettings.roles.admin')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            <div className="mt-4 flex justify-end">
                <Button onClick={handleFormSubmit} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="small" color="white" />
                            <span className="ml-2">{t('adminPage.userEditor.profile.buttons.saving')}</span>
                        </>
                    ) : (
                        t('adminPage.userEditor.profile.buttons.save')
                    )}
                </Button>
            </div>
        </div>
    );
};

export default UserEditorProfile;
