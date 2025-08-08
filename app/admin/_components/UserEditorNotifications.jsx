'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Bell, Info, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUserContext } from '@/app/provider';

export default function UserEditorNotifications({ user, onUpdateSuccess }) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { dbUser } = useUserContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notificationData, setNotificationData] = useState({
        title: '',
        description: '',
        type: 'info',
        priority: 'medium',
    });

    // Parse user data - the user object is an array with a single user object
    const userName = dbUser?.name || 'User';

    const notificationTypes = [
        { value: 'info', label: 'Information', icon: Info },
        { value: 'message', label: 'Message', icon: MessageSquare },
        { value: 'alert', label: 'Alert', icon: AlertCircle },
        { value: 'task', label: 'Task', icon: CheckCircle2 },
        { value: 'system', label: 'System', icon: Bell },
    ];

    const priorityLevels = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'critical', label: 'Critical' },
    ];

    const handleChange = (field, value) => {
        setNotificationData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!notificationData.title.trim() || !notificationData.description.trim()) {
            toast({
                title: t('adminPage.userEditor.notifications.toast.error'),
                description: t('adminPage.userEditor.notifications.toast.required'),
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // Check if we have a valid dbUser with an ID
            if (!dbUser || !dbUser.id) {
                throw new Error('User database ID is required');
            }

            // Send notification to user
            const response = await fetch('/api/admin/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: dbUser.id, // This is the database userId
                    ...notificationData,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send notification');
            }

            // Reset form
            setNotificationData({
                title: '',
                description: '',
                type: 'info',
                priority: 'medium',
            });

            // Show success toast
            toast({
                title: t('adminPage.userEditor.notifications.toast.success'),
                description: t('adminPage.userEditor.notifications.toast.sent'),
            });

            if (onUpdateSuccess) {
                onUpdateSuccess();
            }
        } catch (error) {
            console.error('Error sending notification:', error);
            toast({
                title: t('adminPage.userEditor.notifications.toast.error'),
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeIcon = (type) => {
        const foundType = notificationTypes.find((t) => t.value === type);
        const Icon = foundType?.icon || Bell;
        return <Icon className="h-5 w-5" />;
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical':
                return 'text-red-500 bg-red-100 dark:bg-red-950/20';
            case 'high':
                return 'text-orange-500 bg-orange-100 dark:bg-orange-950/20';
            case 'medium':
                return 'text-blue-500 bg-blue-100 dark:bg-blue-950/20';
            case 'low':
                return 'text-green-500 bg-green-100 dark:bg-green-950/20';
            default:
                return 'text-gray-500 bg-gray-100 dark:bg-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-foreground">{t('adminPage.userEditor.notifications.title')}</h2>
                    <p className="text-sm text-muted-foreground">
                        {t('adminPage.userEditor.notifications.sendTo')}: <span className="font-medium text-foreground">{userName}</span>
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('adminPage.userEditor.notifications.sendNotification')}</CardTitle>
                    <CardDescription>{t('adminPage.userEditor.notifications.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="type">
                                    {t('adminPage.userEditor.notifications.type')}
                                </label>
                                <Select value={notificationData.type} onValueChange={(value) => handleChange('type', value)}>
                                    <SelectTrigger id="type" className="w-full">
                                        <SelectValue placeholder={t('adminPage.userEditor.notifications.selectType')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {notificationTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                <div className="flex items-center">
                                                    <type.icon className="mr-2 h-4 w-4" />
                                                    <span>{type.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="priority">
                                    {t('adminPage.userEditor.notifications.priority')}
                                </label>
                                <Select value={notificationData.priority} onValueChange={(value) => handleChange('priority', value)}>
                                    <SelectTrigger id="priority" className="w-full">
                                        <SelectValue placeholder={t('adminPage.userEditor.notifications.selectPriority')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorityLevels.map((priority) => (
                                            <SelectItem key={priority.value} value={priority.value}>
                                                <div className="flex items-center">
                                                    <span
                                                        className={cn('w-3 h-3 rounded-full mr-2', {
                                                            'bg-red-500': priority.value === 'critical',
                                                            'bg-orange-500': priority.value === 'high',
                                                            'bg-blue-500': priority.value === 'medium',
                                                            'bg-green-500': priority.value === 'low',
                                                        })}
                                                    />
                                                    {priority.label}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="title">
                                {t('adminPage.userEditor.notifications.notificationTitle')}
                            </label>
                            <Input
                                id="title"
                                value={notificationData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder={t('adminPage.userEditor.notifications.titlePlaceholder')}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="description">
                                {t('adminPage.userEditor.notifications.notificationMessage')}
                            </label>
                            <Textarea
                                id="description"
                                value={notificationData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder={t('adminPage.userEditor.notifications.messagePlaceholder')}
                                rows={4}
                            />
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex items-center space-x-2">
                        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', getPriorityColor(notificationData.priority))}>{getTypeIcon(notificationData.type)}</div>
                        <div className="text-sm">
                            <p className="font-medium">{notificationData.title || t('adminPage.userEditor.notifications.preview')}</p>
                            <p className="text-muted-foreground text-xs truncate">{notificationData.description || t('adminPage.userEditor.notifications.previewDescription')}</p>
                        </div>
                    </div>
                    <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? t('adminPage.userEditor.notifications.sending') : t('adminPage.userEditor.notifications.send')}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
