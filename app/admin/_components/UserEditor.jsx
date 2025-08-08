'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { User, CreditCard, Trash2, Settings, Bell, Shield, Activity, KeyRound, History, AlertCircle, Menu } from 'lucide-react';
import UserEditorProfile from './UserEditorProfile';
import UserEditorBilling from './UserEditorBilling';
import UserEditorNotifications from './UserEditorNotifications';

export default function UserEditor({ getTotalUsers, user }) {
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('profile');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const menuItems = [
        {
            icon: User,
            label: t('adminPage.userEditor.menu.profile.title'),
            key: 'profile',
            description: t('adminPage.userEditor.menu.profile.description'),
        },
        {
            icon: CreditCard,
            label: t('adminPage.userEditor.menu.billing.title'),
            key: 'billing',
            description: t('adminPage.userEditor.menu.billing.description'),
        },
        {
            icon: Shield,
            label: t('adminPage.userEditor.menu.security.title'),
            key: 'security',
            description: t('adminPage.userEditor.menu.security.description'),
        },
        {
            icon: Bell,
            label: t('adminPage.userEditor.menu.notifications.title'),
            key: 'notifications',
            description: t('adminPage.userEditor.menu.notifications.description'),
        },
        {
            icon: Activity,
            label: t('adminPage.userEditor.menu.activity.title'),
            key: 'activity',
            description: t('adminPage.userEditor.menu.activity.description'),
        },
        {
            icon: Trash2,
            label: t('adminPage.userEditor.menu.deleteAccount.title'),
            key: 'delete-account',
            description: t('adminPage.userEditor.menu.deleteAccount.description'),
        },
    ];

    const handleUpdateSuccess = () => {
        getTotalUsers();
    };

    // Mock data for activity log
    const activityLog = [
        { id: 1, type: 'login', message: 'Logged in from new device', time: '2 hours ago', icon: KeyRound },
        { id: 2, type: 'subscription', message: 'Changed subscription plan', time: '1 day ago', icon: CreditCard },
        { id: 3, type: 'security', message: 'Changed password', time: '3 days ago', icon: Shield },
    ];

    const SidebarContent = () => (
        <div className="space-y-1">
            {menuItems.map((item) => (
                <Button
                    key={item.key}
                    variant="ghost"
                    className={`w-full justify-start text-sm p-3 h-auto ${
                        activeSection === item.key ? 'bg-primary/10 text-primary' : item.key === 'delete-account' ? 'text-destructive hover:bg-destructive/10' : ''
                    }`}
                    onClick={() => {
                        setActiveSection(item.key);
                        setIsMobileMenuOpen(false);
                    }}>
                    <div className="flex items-start">
                        <item.icon className="mr-3 h-5 w-5" />
                        <div className="text-left">
                            <div className="font-medium">{item.label}</div>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                    </div>
                </Button>
            ))}
        </div>
    );

    const renderActivityLog = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">{t('adminPage.userEditor.activity.title')}</h2>
                <Button variant="outline" size="sm">
                    {t('adminPage.userEditor.activity.exportButton')}
                </Button>
            </div>
            <div className="space-y-4">
                {activityLog.map((activity) => (
                    <Card key={activity.id} className="hover:shadow-md transition-all duration-200">
                        <CardContent className="p-4">
                            <div className="flex items-start space-x-4">
                                <div className="p-2 bg-muted rounded-lg">
                                    <activity.icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground">{activity.message}</p>
                                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderDeleteAccount = () => (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-destructive">{t('adminPage.userEditor.deleteAccount.title')}</h2>
                    <p className="text-muted-foreground">{t('adminPage.userEditor.deleteAccount.warning')}</p>
                </div>
            </div>
            <Card className="border-destructive/20">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <p className="text-foreground">{t('adminPage.userEditor.deleteAccount.consequences.title')}</p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                            {t('adminPage.userEditor.deleteAccount.consequences.items', { returnObjects: true }).map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                        <div className="pt-4 border-t border-border">
                            <Button variant="destructive" className="w-full">
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('adminPage.userEditor.deleteAccount.button')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <DialogContent className="max-w-[95vw] lg:max-w-6xl p-0 overflow-hidden bg-background">
            <DialogHeader className="px-4 sm:px-6 py-4 bg-card border-b border-border">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-10 sm:h-12 w-10 sm:w-12 border-2 border-border">
                            <AvatarImage src={user.imageUrl} alt={user.name} />
                            <AvatarFallback className="bg-muted">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-lg sm:text-xl flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="truncate text-foreground">{user.name}</span>
                                <Badge variant="outline" className="w-fit bg-primary/10 text-primary">
                                    {user.role}
                                </Badge>
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0 bg-background">
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-foreground mb-4">Menu</h2>
                                <SidebarContent />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </DialogHeader>

            <div className="flex h-[calc(100vh-200px)] sm:h-[800px] overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-72 bg-card border-r border-border p-4">
                    <SidebarContent />
                </aside>

                <main className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-4 sm:p-6">
                            {activeSection === 'profile' && <UserEditorProfile getTotalUsers={getTotalUsers} user={user} onUpdateSuccess={handleUpdateSuccess} />}
                            {activeSection === 'billing' && <UserEditorBilling getTotalUsers={getTotalUsers} user={user} onUpdateSuccess={handleUpdateSuccess} />}
                            {activeSection === 'notifications' && <UserEditorNotifications user={user} onUpdateSuccess={handleUpdateSuccess} />}
                            {activeSection === 'activity' && renderActivityLog()}
                            {activeSection === 'delete-account' && renderDeleteAccount()}
                        </div>
                    </ScrollArea>
                </main>
            </div>
        </DialogContent>
    );
}
