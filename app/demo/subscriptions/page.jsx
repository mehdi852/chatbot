'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { SearchIcon, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LoadingSpinner from '../_components/LoadingSpinner';
import { formatDate } from '@/utils/Functions';
import { Loader2 } from 'lucide-react';

// Mock data for subscriptions
const mockSubscriptions = [
    {
        id: 1,
        user: {
            name: 'John Doe',
            email: 'john@example.com'
        },
        subscription_type: {
            name: 'Professional'
        },
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        auto_renew: true
    },
    {
        id: 2,
        user: {
            name: 'Jane Smith',
            email: 'jane@example.com'
        },
        subscription_type: {
            name: 'Basic'
        },
        status: 'cancelled',
        start_date: '2024-02-01',
        end_date: '2024-03-01',
        auto_renew: false
    },
    {
        id: 3,
        user: {
            name: 'Mike Johnson',
            email: 'mike@example.com'
        },
        subscription_type: {
            name: 'Enterprise'
        },
        status: 'active',
        start_date: '2024-01-15',
        end_date: '2025-01-15',
        auto_renew: true
    },
    {
        id: 4,
        user: {
            name: 'Sarah Wilson',
            email: 'sarah@example.com'
        },
        subscription_type: {
            name: 'Professional'
        },
        status: 'expired',
        start_date: '2023-12-01',
        end_date: '2024-02-01',
        auto_renew: false
    }
];

const SubscriptionsManager = () => {
    const [totalSubscriptions] = useState(156); // Mock total count
    const [pageNumber, setPageNumber] = useState(1);
    const [subscriptionsPerPage] = useState(20);
    const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
    const [searchInput, setSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const { toast } = useToast();

    const changePage = (direction) => {
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would show different pages of subscriptions.",
            variant: "default"
        });

        const totalPages = Math.ceil(totalSubscriptions / subscriptionsPerPage);
        if (direction === 'next' && pageNumber < totalPages) {
            setPageNumber((prev) => prev + 1);
        } else if (direction === 'previous' && pageNumber > 1) {
            setPageNumber((prev) => prev - 1);
        }
    };

    const handleSubscriptionSearchClick = () => {
        setIsSearching(true);
        
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would search through your actual subscriptions.",
            variant: "default"
        });

        const trimmedSearchInput = searchInput.trim().toLowerCase();
        
        setTimeout(() => {
            if (trimmedSearchInput === '') {
                setSubscriptions(mockSubscriptions);
            } else {
                const filteredSubscriptions = mockSubscriptions.filter(sub => 
                    sub.user.email.toLowerCase().includes(trimmedSearchInput) ||
                    sub.user.name.toLowerCase().includes(trimmedSearchInput)
                );
                setSubscriptions(filteredSubscriptions);
            }
            setIsSearching(false);
        }, 500); // Simulate API delay
    };

    const handleSettingsClick = () => {
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, you would be able to manage subscription settings.",
            variant: "default"
        });
    };

    return (
        <div className="container mx-auto py-8 px-4 md:px-8 md:ml-72">
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Subscriptions Manager</h1>
                <p className="text-sm text-muted-foreground">Manage your subscriptions efficiently.</p>
            </header>
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <h2 className="text-xl font-semibold">Subscriptions</h2>
                    <div className="flex w-full md:w-auto space-x-2">
                        <div className="relative flex-grow md:flex-grow-0">
                            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input onChange={(e) => setSearchInput(e.target.value)} placeholder="Search" className="pl-8 w-full" />
                        </div>
                        <Button onClick={handleSubscriptionSearchClick} variant="secondary" disabled={isSearching}>
                            {isSearching ? <LoadingSpinner size="small" color="currentColor" /> : 'Search'}
                        </Button>
                    </div>
                </div>
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead className="w-[200px] py-3 px-4 text-left font-semibold">User</TableHead>
                                <TableHead className="w-[150px] py-3 px-4 text-left font-semibold">Plan</TableHead>
                                <TableHead className="w-[120px] py-3 px-4 text-left font-semibold">Status</TableHead>
                                <TableHead className="w-[150px] py-3 px-4 text-left font-semibold">Start Date</TableHead>
                                <TableHead className="w-[150px] py-3 px-4 text-left font-semibold">End Date</TableHead>
                                <TableHead className="w-[120px] py-3 px-4 text-left font-semibold">Auto Renew</TableHead>
                                <TableHead className="w-[80px] py-3 px-4 text-left font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isSearching ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">
                                        <div className="flex justify-center items-center">
                                            <LoadingSpinner size="large" color="#3498db" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subscriptions.map((subscription) => (
                                    <TableRow key={subscription.id} className="hover:bg-gray-50 transition-colors">
                                        <TableCell className="py-4 px-4">
                                            <span className="font-medium">{subscription.user.name}</span>
                                            <br />
                                            <span className="text-sm text-gray-600">{subscription.user.email}</span>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge variant="outline">{subscription.subscription_type.name}</Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge variant="secondary" className={getStatusColor(subscription.status)}>
                                                {subscription.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <span className="text-sm text-gray-600">{formatDate(subscription.start_date)}</span>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <span className="text-sm text-gray-600">{formatDate(subscription.end_date)}</span>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge variant="outline" className={subscription.auto_renew ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'}>
                                                {subscription.auto_renew ? 'Yes' : 'No'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Button variant="ghost" size="icon" onClick={handleSettingsClick}>
                                                <Settings2 className="h-5 w-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <div className="mt-6">
                <Pagination>
                    <PaginationContent className="cursor-pointer">
                        <PaginationItem>
                            <PaginationPrevious onClick={() => changePage('previous')} />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">{pageNumber}</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext onClick={() => changePage('next')} />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
};

// Helper function to determine status color
const getStatusColor = (status) => {
    const colors = {
        active: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
        expired: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default SubscriptionsManager;
