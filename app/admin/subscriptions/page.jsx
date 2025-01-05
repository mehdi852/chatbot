// Client-side component for managing subscriptions
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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

const SubscriptionsManager = () => {
    const { t } = useTranslation();
    const [totalSubscriptions, setTotalSubscriptions] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [subscriptionsPerPage] = useState(20);
    const [subscriptions, setSubscriptions] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const { toast } = useToast();

    // Fetch total number of subscriptions
    const getTotalSubscriptions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/total-subscriptions');
            const data = await response.json();
            setTotalSubscriptions(data.totalSubscriptions);
        } catch (error) {
            console.error('Error fetching total subscriptions:', error);
            toast({ title: 'Error', description: t('adminPage.subscriptionsManager.messages.loadError'), variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast, t]);

    // Fetch subscriptions for current page
    const fetchSubscriptionsPerPage = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/subscriptions-per-page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageNumber, subscriptionsPerPage }),
            });
            const data = await response.json();
            setSubscriptions(data.subscriptions);
        } catch (error) {
            console.error('Error fetching subscriptions per page:', error);
            toast({ title: 'Error', description: t('adminPage.subscriptionsManager.messages.loadError'), variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [pageNumber, subscriptionsPerPage, toast, t]);

    useEffect(() => {
        getTotalSubscriptions();
    }, [getTotalSubscriptions]);

    useEffect(() => {
        setIsLoading(true);
        fetchSubscriptionsPerPage();
    }, [fetchSubscriptionsPerPage]);

    const changePage = (direction) => {
        const totalPages = Math.ceil(totalSubscriptions / subscriptionsPerPage);
        if (direction === 'next' && pageNumber < totalPages) {
            setPageNumber((prev) => prev + 1);
        } else if (direction === 'previous' && pageNumber > 1) {
            setPageNumber((prev) => prev - 1);
        }
    };

    const handleSubscriptionSearchClick = async () => {
        setIsSearching(true);
        const trimmedSearchInput = searchInput.trim();
        if (trimmedSearchInput === '') {
            await fetchSubscriptionsPerPage();
        } else {
            try {
                const response = await fetch('/api/admin/search-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ search: trimmedSearchInput }),
                });
                const data = await response.json();
                if (data.subscriptions && data.subscriptions.length > 0) {
                    setSubscriptions(data.subscriptions);
                } else {
                    toast({ title: 'No results', description: t('adminPage.subscriptionsManager.messages.searchNoResults'), variant: 'default' });
                    await fetchSubscriptionsPerPage();
                }
            } catch (error) {
                console.error('Error searching subscription:', error);
                toast({ title: 'Error', description: t('adminPage.subscriptionsManager.messages.searchError'), variant: 'destructive' });
                await fetchSubscriptionsPerPage();
            }
        }
        setIsSearching(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)] md:ml-72">
                <Loader2 className="w-6 h-6 mr-2 animate-spin" size="large" color="black" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 md:px-8 md:ml-72">
            {/* Header section */}
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">{t('adminPage.subscriptionsManager.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('adminPage.subscriptionsManager.description')}</p>
            </header>
            <div className="space-y-4">
                {/* Search and filter section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <h2 className="text-xl font-semibold">{t('adminPage.subscriptionsManager.latestSubscriptions.title')}</h2>
                    <div className="flex w-full md:w-auto space-x-2">
                        <div className="relative flex-grow md:flex-grow-0">
                            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input onChange={(e) => setSearchInput(e.target.value)} placeholder={t('adminPage.subscriptionsManager.latestSubscriptions.search.placeholder')} className="pl-8 w-full" />
                        </div>
                        <Button onClick={handleSubscriptionSearchClick} variant="secondary" disabled={isSearching}>
                            {isSearching ? <LoadingSpinner size="small" color="currentColor" /> : t('adminPage.subscriptionsManager.latestSubscriptions.search.button')}
                        </Button>
                    </div>
                </div>

                {/* Subscriptions table */}
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted">
                                <TableHead className="w-[200px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.subscriptionsManager.table.user')}</TableHead>
                                <TableHead className="w-[150px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.subscriptionsManager.table.plan')}</TableHead>
                                <TableHead className="w-[120px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.subscriptionsManager.table.status')}</TableHead>
                                <TableHead className="w-[150px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.subscriptionsManager.table.startDate')}</TableHead>
                                <TableHead className="w-[150px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.subscriptionsManager.table.endDate')}</TableHead>
                                <TableHead className="w-[120px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.subscriptionsManager.table.autoRenew')}</TableHead>
                                <TableHead className="w-[80px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.subscriptionsManager.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isSearching ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">
                                        <div className="flex justify-center items-center">
                                            <LoadingSpinner size="large" color="currentColor" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                subscriptions.map((subscription) => (
                                    <TableRow key={subscription.id} className="hover:bg-muted/50 transition-colors border-b border-border">
                                        <TableCell className="py-4 px-4">
                                            <span className="font-medium text-foreground">{subscription.user.name}</span>
                                            <br />
                                            <span className="text-sm text-muted-foreground">{subscription.user.email}</span>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge variant="outline">{subscription.subscription_type.name}</Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge variant="secondary" className={getStatusColor(subscription.status)}>
                                                {t(`adminPage.subscriptionsManager.status.${subscription.status.toLowerCase()}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <span className="text-sm text-muted-foreground">{formatDate(subscription.start_date)}</span>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <span className="text-sm text-muted-foreground">{formatDate(subscription.end_date)}</span>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    subscription.auto_renew
                                                        ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900'
                                                        : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900'
                                                }>
                                                {t(`adminPage.subscriptionsManager.autoRenew.${subscription.auto_renew ? 'yes' : 'no'}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Button variant="ghost" size="icon">
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

            {/* Pagination controls */}
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

// Helper function to determine badge color based on subscription status
const getStatusColor = (status) => {
    const colors = {
        active: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900',
        cancelled: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900',
        expired: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
};

export default SubscriptionsManager;
