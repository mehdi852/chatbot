/**
 * Admin Dashboard Component
 *
 * A modern, enterprise-level dashboard for managing the SaaS platform.
 * Features a clean, professional design with advanced analytics and management capabilities.
 */

'use client';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    BarChart,
    BriefcaseIcon,
    CalendarIcon,
    Inbox,
    Loader2,
    MailCheckIcon,
    MailIcon,
    MoreHorizontalIcon,
    PlusIcon,
    SearchIcon,
    Settings2,
    UserIcon,
    TrendingUpIcon,
    AlertCircleIcon,
    ActivityIcon,
} from 'lucide-react';
import StatisticsCard from './_components/StatisticsCard';
import { formatDate } from '@/utils/Functions';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import UserEditor from './_components/UserEditor';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from './_components/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';

// Mock data for employees table (not currently used)
const employees = [
    { name: 'Terry Lipshutz', email: 'te@orixcreative.com', role: 'UI UX Designer', status: 'Active', manager: 'Jakob', team: 'Design Team', office: 'Orix Dubai' },
    { name: 'Jaylon Aminoff', email: 'ja@orixcreative.com', role: 'Graphic Designer', status: 'Probation', manager: 'Wilson', team: 'Project Team', office: 'Orix USA' },
    { name: 'Terry Herwitz', email: 'te@orixcreative.com', role: 'UX Designer', status: 'Active', manager: 'Wilson', team: 'Design Team', office: 'Orix Dubai' },
    { name: 'Leo Septimus', email: 'le@orixcreative.com', role: 'Content Writer', status: 'Onboarding', manager: 'Craig', team: 'Marketing Team', office: 'Orix Dubai' },
    { name: 'Corey Vetrovs', email: 'co@orixcreative.com', role: 'Content Writer', status: 'On leave', manager: 'Jakob', team: 'Marketing Team', office: 'Orix USA' },
    { name: 'Martin Stanton', email: 'ma@orixcreative.com', role: 'Web Developer', status: 'Active', manager: 'Jakob', team: 'Dev Team', office: 'Orix Dubai' },
];

/**
 * Returns the appropriate CSS classes for status badges based on status value
 */
function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'active':
            return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300';
        case 'probation':
            return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300';
        case 'onboarding':
            return 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300';
        case 'on leave':
            return 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

/**
 * Returns CSS classes for subscription status badges
 */
function getSubscriptionStatusColor(boolean) {
    if (boolean) {
        return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300';
    } else {
        return 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300';
    }
}

/**
 * Main Dashboard Component
 */
const Dashboard = () => {
    const { t } = useTranslation();
    // Standardize all state declarations using useState
    const [totalUsers, setTotalUsers] = useState('loading');
    const [newUsers, setNewUsers] = useState('loading');
    const [latestUsers, setLatestUsers] = useState([]);
    const [activeSubscriptions, setActiveSubscriptions] = useState({ active: 0, total: 0 });
    const [selectedUser, setSelectedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [totalTickets, setTotalTickets] = useState({ resolved: 0, open: 0, total: 0 });
    const [totalPopups, setTotalPopups] = useState(0);
    const [dateRange, setDateRange] = useState('30');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortColumn, setSortColumn] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'success', message: 'New user registration', time: '2 min ago' },
        { id: 2, type: 'warning', message: 'Subscription expiring soon', time: '5 min ago' },
        { id: 3, type: 'info', message: 'System update scheduled', time: '1 hour ago' },
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);

    /**
     * Fetches total users data from the API
     */
    async function getTotalUsers() {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/total-users');
            const data = await response.json();
            setTotalUsers(data.totalUsers.totalUsers);
            setNewUsers(data.newUsers.newUsers);
            setLatestUsers(data.latestUsers);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setIsLoading(false);
        }
    }

    // Initial data fetching
    useEffect(() => {
        getTotalUsers();
        getActiveSubscriptions();
        getTotalTickets();
        getTotalPopups();
    }, []);

    useEffect(() => {
        setFilteredUsers(latestUsers);
    }, [latestUsers]);

    /**
     * Fetches active subscriptions count
     */
    async function getActiveSubscriptions() {
        try {
            const response = await fetch('/api/admin/get-subscriptions-active-count');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            setActiveSubscriptions((prev) => ({
                ...prev,
                active: data.totalSubscriptions.active,
                total: data.totalSubscriptions.total,
            }));

            return data.activeSubscriptions;
        } catch (error) {
            console.error('Error fetching active subscriptions:', error);
            return 0;
        }
    }

    /**
     * Handles user editor dialog opening
     */
    const handleUserEditorClick = (user) => {
        const response = fetch('/api/admin/get-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }),
        });

        const data = response.json();
        setSelectedUser(data.returnedUser.returnedUser);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex justify-center ml-72 items-center h-[calc(100vh-100px)]">
                <Loader2 className="w-6 h-6 mr-2 animate-spin text-foreground" />
            </div>
        );
    }

    /**
     * Fetches total tickets count
     */
    async function getTotalTickets() {
        try {
            const response = await fetch('/api/admin/get-total-tickets-count', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTotalTickets(data.totalTickets);
        } catch (error) {
            console.error('Error fetching total tickets:', error);
            setTotalTickets({ resolved: 0, open: 0, total: 0 });
        }
    }

    async function getTotalPopups() {
        const response = await fetch('/api/admin/total-popups-count', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
        setTotalPopups(data.totalPopups);
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto py-4 sm:py-6 lg:py-8 px-4 lg:ml-72">
                <div className="space-y-6 sm:space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{t('adminPage.title')}</h1>
                            <p className="text-muted-foreground mt-1 sm:mt-2">{t('adminPage.description')}</p>
                        </div>
                    </div>

                    {/* Stats Cards Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <Card className="hover:shadow-lg transition-all duration-200 border-border shadow-md bg-card">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('adminPage.stats.totalUsers.title')}</p>
                                        <h3 className="text-xl sm:text-2xl font-bold mt-1 sm:mt-2 text-foreground">{totalUsers}</h3>
                                    </div>
                                    <div className="p-2 sm:p-3 bg-primary/10 rounded-lg">
                                        <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-200 border-border shadow-md bg-card">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('adminPage.stats.activeSubscriptions.title')}</p>
                                        <h3 className="text-2xl font-bold mt-2 text-foreground">{activeSubscriptions.active}</h3>
                                    </div>
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                        <PlusIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-200 border-border shadow-md bg-card">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('adminPage.stats.supportTickets.title')}</p>
                                        <h3 className="text-2xl font-bold mt-2 text-foreground">{totalTickets.total}</h3>
                                    </div>
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                        <Inbox className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-lg transition-all duration-200 border-border shadow-md bg-card">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('adminPage.stats.activePopups.title')}</p>
                                        <h3 className="text-2xl font-bold mt-2 text-foreground">{totalPopups}</h3>
                                    </div>
                                    <div className="p-3 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                                        <BriefcaseIcon className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="users" className="space-y-6">
                        <ScrollArea className="w-full">
                            <TabsList className="bg-card border-border inline-flex w-full sm:w-auto p-1">
                                <TabsTrigger value="users" className="flex-1 sm:flex-none data-[state=active]:bg-muted">
                                    <span className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4" />
                                        <span>{t('adminPage.users.title')}</span>
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </ScrollArea>

                        <TabsContent value="users">
                            <Card className="border-border shadow-md bg-card">
                                <CardHeader className="pb-0">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <CardTitle className="text-xl font-semibold text-foreground">{t('adminPage.users.title')}</CardTitle>
                                            <CardDescription className="text-muted-foreground">{t('adminPage.users.description')}</CardDescription>
                                        </div>
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-4 w-full sm:w-auto">
                                            <div className="relative flex-1 sm:flex-none">
                                                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                                <Input
                                                    placeholder={t('adminPage.users.search')}
                                                    className="pl-10 w-full sm:w-64 bg-muted"
                                                    value={searchQuery}
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        if (e.target.value) {
                                                            const filtered = latestUsers.filter(
                                                                (user) =>
                                                                    user.name.toLowerCase().includes(e.target.value.toLowerCase()) || user.email.toLowerCase().includes(e.target.value.toLowerCase())
                                                            );
                                                            setFilteredUsers(filtered);
                                                        } else {
                                                            setFilteredUsers(latestUsers);
                                                        }
                                                    }}
                                                />
                                                {searchQuery && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-accent"
                                                        onClick={() => {
                                                            setSearchQuery('');
                                                            setFilteredUsers(latestUsers);
                                                        }}>
                                                        <MailCheckIcon className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ScrollArea className="w-full rounded-lg overflow-hidden mt-6">
                                        <div className="min-w-[800px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted border-border">
                                                        <TableHead className="w-[220px] py-3 px-4 text-left font-semibold">{t('adminPage.users.table.name')}</TableHead>
                                                        <TableHead className="w-[200px] py-3 px-4 text-left font-semibold">{t('adminPage.users.table.email')}</TableHead>
                                                        <TableHead className="w-[100px] py-3 px-4 text-left font-semibold">{t('adminPage.users.table.role')}</TableHead>
                                                        <TableHead className="w-[120px] py-3 px-4 text-left font-semibold">{t('adminPage.users.table.status')}</TableHead>
                                                        <TableHead className="w-[140px] py-3 px-4 text-left font-semibold">{t('adminPage.users.table.subscription')}</TableHead>
                                                        <TableHead className="w-[180px] py-3 px-4 text-left font-semibold">{t('adminPage.users.table.subscriptionEnds')}</TableHead>
                                                        <TableHead className="w-[150px] py-3 px-4 text-left font-semibold">{t('adminPage.users.table.createdAt')}</TableHead>
                                                        <TableHead className="w-[80px] py-3 px-4 text-left font-semibold">{t('adminPage.users.table.actions')}</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredUsers.length > 0 &&
                                                        filteredUsers.map((user) => (
                                                            <TableRow key={user.id} className="hover:bg-muted/50 transition-colors border-border">
                                                                <TableCell className="py-4 px-4">
                                                                    <div className="flex items-center space-x-3">
                                                                        <Avatar className="h-10 w-10 border-2 border-border">
                                                                            <AvatarImage src={user.imageurl} alt={user.name} />
                                                                            <AvatarFallback className="bg-muted">{user.name.charAt(0)}</AvatarFallback>
                                                                        </Avatar>
                                                                        <div>
                                                                            <span className="font-medium text-foreground">{user.name}</span>
                                                                            <p className="text-sm text-muted-foreground">{user.role}</p>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="py-4 px-4">
                                                                    <span className="text-sm text-muted-foreground">{user.email}</span>
                                                                </TableCell>
                                                                <TableCell className="py-4 px-4">
                                                                    <Badge variant="outline" className="bg-muted">
                                                                        {user.role}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="py-4 px-4">
                                                                    <Badge variant="secondary" className={getStatusColor(user.status)}>
                                                                        {t(`${user.status.toLowerCase().replace(' ', '')}`)}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="py-4 px-4">
                                                                    <Badge variant="outline" className={getSubscriptionStatusColor(user.subscription)}>
                                                                        {t(`adminPage.users.subscription.${user.subscription ? 'active' : 'inactive'}`)}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="py-4 px-4">
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {user.subscription_ends_at === null ? t('adminPage.users.noDate') : formatDate(user.subscription_ends_at)}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="py-4 px-4">
                                                                    <span className="text-sm text-muted-foreground">{formatDate(user.created_at)}</span>
                                                                </TableCell>
                                                                <TableCell className="py-4 px-4">
                                                                    <Dialog>
                                                                        <DialogTrigger>
                                                                            <Button variant="ghost" size="icon" className="hover:bg-accent">
                                                                                <Settings2 className="h-5 w-5 text-muted-foreground" />
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <UserEditor getTotalUsers={getTotalUsers} user={user} />
                                                                    </Dialog>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="analytics">
                            <Card className="border-border shadow-md bg-card">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <CardTitle className="text-foreground">Analytics Dashboard</CardTitle>
                                        <Button variant="outline">Download Report</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Analytics content coming soon...</p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reports">
                            <Card className="border-border shadow-md bg-card">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <CardTitle className="text-foreground">Reports Dashboard</CardTitle>
                                        <Button variant="outline">Generate New Report</Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">Reports content coming soon...</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
