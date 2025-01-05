'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { SearchIcon, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserEditor from '../../_components/UserEditor';
import LoadingSpinner from '../../_components/LoadingSpinner';
import { formatDate } from '@/utils/Functions';
import { Loader2 } from 'lucide-react';

const UsersManager = () => {
    const { t } = useTranslation();
    const [totalUsers, setTotalUsers] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [usersPerPage] = useState(10);
    const [latestUsers, setLatestUsers] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const { toast } = useToast();
    const [isUserEditorOpen, setIsUserEditorOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Fetch total users and new users count
    const getTotalUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/total-users');
            const data = await response.json();
            setTotalUsers(data.totalUsers.totalUsers);
        } catch (error) {
            console.error('Error fetching total users:', error);
            toast({ title: 'Error', description: t('adminPage.usersManager.messages.loadError'), variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast, t]);

    // Fetch users for the current page
    const fetchUsersPerPage = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/users-per-page', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pageNumber, usersPerPage }),
            });
            const data = await response.json();
            setLatestUsers(data.returnedUsersPerPage);
        } catch (error) {
            console.error('Error fetching users per page:', error);
            toast({ title: 'Error', description: t('adminPage.usersManager.messages.loadError'), variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [pageNumber, usersPerPage, toast, t]);

    useEffect(() => {
        getTotalUsers();
    }, [getTotalUsers]);

    useEffect(() => {
        setIsLoading(true);
        fetchUsersPerPage();
    }, [fetchUsersPerPage]);

    const changePage = (direction) => {
        const totalPages = Math.ceil(totalUsers / usersPerPage);
        if (direction === 'next' && pageNumber < totalPages) {
            setPageNumber((prev) => prev + 1);
        } else if (direction === 'previous' && pageNumber > 1) {
            setPageNumber((prev) => prev - 1);
        }
    };

    const handleUserSearchClick = async () => {
        setIsSearching(true);
        const trimmedSearchInput = searchInput.trim();
        if (trimmedSearchInput === '') {
            await fetchUsersPerPage();
        } else {
            try {
                const response = await fetch('/api/admin/get-user', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: trimmedSearchInput }),
                });
                const data = await response.json();
                if (data.returnedUser && data.returnedUser.length > 0) {
                    setLatestUsers(data.returnedUser);
                } else {
                    toast({ title: 'No results', description: t('adminPage.usersManager.messages.searchNoResults'), variant: 'default' });
                    await fetchUsersPerPage();
                }
            } catch (error) {
                console.error('Error searching user:', error);
                toast({ title: 'Error', description: t('adminPage.usersManager.messages.searchError'), variant: 'destructive' });
                await fetchUsersPerPage();
            }
        }
        setIsSearching(false);
    };

    const handleUserEditorOpen = (user) => {
        setSelectedUser(user);
        setIsUserEditorOpen(true);
    };

    const handleUserEditorClose = () => {
        setIsUserEditorOpen(false);
        setSelectedUser(null);
        fetchUsersPerPage(); // Refetch users after editing
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
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">{t('adminPage.usersManager.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('adminPage.usersManager.description')}</p>
            </header>
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <h2 className="text-xl font-semibold">{t('adminPage.usersManager.latestUsers.title')}</h2>
                    <div className="flex w-full md:w-auto space-x-2">
                        <div className="relative flex-grow md:flex-grow-0">
                            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input onChange={(e) => setSearchInput(e.target.value)} placeholder={t('adminPage.usersManager.latestUsers.search.placeholder')} className="pl-8 w-full" />
                        </div>
                        <Button onClick={handleUserSearchClick} variant="secondary" disabled={isSearching}>
                            {isSearching ? <LoadingSpinner size="small" color="currentColor" /> : t('adminPage.usersManager.latestUsers.search.button')}
                        </Button>
                    </div>
                </div>
                <div className="border rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted">
                                <TableHead className="w-[220px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.usersManager.table.name')}</TableHead>
                                <TableHead className="w-[200px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.usersManager.table.email')}</TableHead>
                                <TableHead className="w-[100px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.usersManager.table.role')}</TableHead>
                                <TableHead className="w-[120px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.usersManager.table.status')}</TableHead>
                                <TableHead className="w-[140px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.usersManager.table.subscription')}</TableHead>
                                <TableHead className="w-[180px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.usersManager.table.subscriptionEnds')}</TableHead>
                                <TableHead className="w-[150px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.usersManager.table.createdAt')}</TableHead>
                                <TableHead className="w-[80px] py-3 px-4 text-left font-semibold text-foreground">{t('adminPage.usersManager.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isSearching ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-4">
                                        <div className="flex justify-center items-center">
                                            <LoadingSpinner size="large" color="currentColor" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                latestUsers.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors border-b border-border">
                                        <TableCell className="py-4 px-4">
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.imageUrl} alt={user.name} />
                                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
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
                                            <Badge variant="outline">{user.role}</Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge variant="secondary" className={getStatusColor(user.status)}>
                                                {t(`${user.status.toLowerCase().replace(' ', '')}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Badge variant="outline" className={getSubscriptionStatusColor(user.subscription)}>
                                                {t(`adminPage.usersManager.subscription.${user.subscription ? 'active' : 'inactive'}`)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <span className="text-sm text-muted-foreground">
                                                {user.subscription_ends_at === null ? t('adminPage.usersManager.noDate') : formatDate(user.subscription_ends_at)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <span className="text-sm text-muted-foreground">{formatDate(user.created_at)}</span>
                                        </TableCell>
                                        <TableCell className="py-4 px-4">
                                            <Dialog open={isUserEditorOpen && selectedUser?.id === user.id} onOpenChange={setIsUserEditorOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={() => handleUserEditorOpen(user)}>
                                                        <Settings2 className="h-5 w-5" />
                                                    </Button>
                                                </DialogTrigger>
                                                {selectedUser && <UserEditor getTotalUsers={getTotalUsers} user={selectedUser} onClose={handleUserEditorClose} refetchUsers={fetchUsersPerPage} />}
                                            </Dialog>
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
        active: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900',
        probation: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900',
        onboarding: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-900',
        'on leave': 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
};

// Helper function to determine subscription status color
const getSubscriptionStatusColor = (isActive) =>
    isActive
        ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900'
        : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900';

export default UsersManager;
