'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, BriefcaseIcon, CalendarIcon, Inbox, Loader2, MailCheckIcon, MailIcon, MoreHorizontalIcon, PlusIcon, SearchIcon, Settings2, UserIcon } from 'lucide-react';

import StatisticsCard from './_components/StatisticsCard';
import { formatDate } from '@/utils/Functions';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

import UserEditor from './_components/UserEditor';
import { Badge } from '@/components/ui/badge';
import LoadingSpinner from './_components/LoadingSpinner';

// Mock data
const mockLatestUsers = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'Active',
        subscription: true,
        subscription_ends_at: '2024-12-31',
        created_at: '2024-01-15',
        imageUrl: '/avatars/01.png'
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'User',
        status: 'Probation',
        subscription: false,
        subscription_ends_at: null,
        created_at: '2024-02-20',
        imageUrl: '/avatars/02.png'
    },
    {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'Editor',
        status: 'On leave',
        subscription: true,
        subscription_ends_at: '2024-11-30',
        created_at: '2024-03-01',
        imageUrl: '/avatars/03.png'
    },
    {
        id: 4,
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        role: 'User',
        status: 'Onboarding',
        subscription: true,
        subscription_ends_at: '2024-10-15',
        created_at: '2024-03-10',
        imageUrl: '/avatars/04.png'
    }
];

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'probation':
            return 'bg-blue-100 text-blue-800';
        case 'onboarding':
            return 'bg-yellow-100 text-yellow-800';
        case 'on leave':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getSubscriptionStatusColor(boolean) {
    if (boolean) {
        return 'bg-green-100 text-green-800';
    } else {
        return 'bg-red-100 text-red-800';
    }
}



const Dashboard = () => {
    const [totalUsers, setTotalUsers] = React.useState(156);
    const [newUsers, setNewUsers] = React.useState(12);
    const [latestUsers, setLatestUsers] = React.useState(mockLatestUsers);
    const [activeSubscriptions, setActiveSubscriptions] = React.useState({ active: 89, total: 120 });
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [totalTickets, setTotalTickets] = React.useState({ resolved: 45, open: 23, total: 68 });

    const handleUserEditorClick = (user) => {
        setSelectedUser(user);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center ml-72 items-center h-[calc(100vh-100px)]">
                <Loader2 className='w-6 h-6 mr-2 animate-spin' size="large" color="black" />
            </div>
        );
    }

    return (
        <div className="container ml-72 mx-auto py-8 ">
            <div className="space-y-6">
                <div className="flex space-x-6">
                    <div className="w-full">
                        <header className="mb-6">
                            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                            <p className="text-sm text-muted-foreground">Here you will be able to manage your application.</p>
                        </header>
                        <div className="grid h-[185px] grid-cols-4 gap-6 flex-1">
                            {[
                                { icon: UserIcon, bg: 'bg-yellow-100', color: 'text-yellow-600', value: totalUsers, label: 'Total Users', change: newUsers + ' new', changeColor: 'text-green-600' },
                                { icon: BriefcaseIcon, bg: 'bg-blue-100', color: 'text-blue-600', value: '24', label: 'Popups Generated', change: '-21.7%', changeColor: 'text-red-600' },
                                {
                                    icon: PlusIcon,
                                    bg: 'bg-green-100',
                                    color: 'text-green-600',
                                    value: activeSubscriptions.total,
                                    label: ' Subscriptions',
                                    change: `${activeSubscriptions.total - activeSubscriptions.active} inactive`,
                                    changeColor: 'text-green-600',
                                },
                                { icon: Inbox, bg: 'bg-orange-100', color: 'text-orange-600', value: totalTickets.total, label: 'Support Tickets', change: `${totalTickets.open} open, ${totalTickets.resolved} resolved`, changeColor: 'text-green-600' },
                            ].map((card, index) => (
                                <StatisticsCard
                                    key={index}
                                    icon={card.icon}
                                    bg={card.bg}
                                    color={card.color}
                                    value={card.value}
                                    label={card.label}
                                    change={card.change}
                                    changeColor={card.changeColor}
                                />
                            ))}
                        </div>
                    </div>

                    {/* <Card className="w-[1300px]">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Team Performance</h2>
                                <Button variant="outline" size="sm">
                                    Last 7 Month <CalendarIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                            <div className="h-[200px] w-full bg-muted rounded-lg flex items-end justify-between p-4">
                                {Array.from({ length: 7 }).map((_, i) => {
                                    const height1 = Math.random() * 120 + 20;
                                    const height2 = Math.random() * 40 + 10;
                                    const totalHeight = height1 + height2;
                                    return (
                                        <div key={i} className="flex flex-col items-center" style={{ height: '100%' }}>
                                            <div className="w-8 bg-green-500 rounded-t-sm" style={{ height: `${(height1 / totalHeight) * 100}%` }}></div>
                                            <div className="w-8 bg-green-200 rounded-b-sm" style={{ height: `${(height2 / totalHeight) * 100}%` }}></div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-center mt-4 space-x-4">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                                    <span className="text-sm">Project Team</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-200 rounded-full mr-2"></div>
                                    <span className="text-sm">Product Team</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card> */}
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Latest Users</h2>
                        <div className="flex space-x-2">
                            {/* <div className="relative">
                                <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search" className="pl-8" />
                            </div>
                            <Button variant="secondary">Add filter</Button> */}
                        </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-100">
                                    <TableHead className="w-[220px] py-3 px-4 text-left font-semibold">Name</TableHead>
                                    <TableHead className="w-[200px] py-3 px-4 text-left font-semibold">Email</TableHead>
                                    <TableHead className="w-[100px] py-3 px-4 text-left font-semibold">Role</TableHead>
                                    <TableHead className="w-[120px] py-3 px-4 text-left font-semibold">Status</TableHead>
                                    <TableHead className="w-[140px] py-3 px-4 text-left font-semibold">Subscription</TableHead>
                                    <TableHead className="w-[180px] py-3 px-4 text-left font-semibold">Subscription Ends</TableHead>
                                    <TableHead className="w-[150px] py-3 px-4 text-left font-semibold">Created At</TableHead>
                                    <TableHead className="w-[80px] py-3 px-4 text-left font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {latestUsers.length > 0 &&
                                    latestUsers.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                                            <TableCell className="py-4 px-4">
                                                <div className="flex items-center space-x-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={user.imageUrl} alt={user.name} />
                                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <span className="text-sm text-gray-600">{user.email}</span>
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <Badge variant="outline">{user.role}</Badge>
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <Badge variant="secondary" className={getStatusColor(user.status)}>
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <Badge variant="outline" className={getSubscriptionStatusColor(user.subscription)}>
                                                    {user.subscription ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <span className="text-sm text-gray-600">{user.subscription_ends_at === null ? '---' : formatDate(user.subscription_ends_at)}</span>
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <span className="text-sm text-gray-600">{formatDate(user.created_at)}</span>
                                            </TableCell>
                                            <TableCell className="py-4 px-4">
                                                <Dialog>
                                                    <DialogTrigger>
                                                        <Button variant="ghost" size="icon">
                                                            <Settings2 className="h-5 w-5" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <UserEditor user={user} />
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
