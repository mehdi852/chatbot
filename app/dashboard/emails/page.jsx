'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUserContext } from '@/app/provider';
import { useTranslation } from 'react-i18next';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EmailsPage() {
    const { t } = useTranslation();
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(4);
    const [totalPages, setTotalPages] = useState(0);
    const [totalEmails, setTotalEmails] = useState(0);
    const { toast } = useToast();
    const { dbUser } = useUserContext();

    useEffect(() => {
        if (!dbUser) return;
        if (searchQuery) {
            setCurrentPage(1);
        }
        fetchEmails();
    }, [dbUser, currentPage, perPage, searchQuery]);



    const fetchEmails = async () => {
        try {
            const response = await fetch(`/api/emails/list?userId=${dbUser.id}&page=${currentPage}&perPage=${perPage}&search=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) throw new Error('Failed to fetch emails');
            const data = await response.json();
            setEmails(data.emails);
            setTotalPages(data.pagination.totalPages);
            setTotalEmails(data.pagination.total);
        } catch (error) {
            console.error('Error fetching emails:', error);
            toast({
                title: 'Error',
                description: 'Failed to load email list',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const csvContent = [
                ['Email', 'Name', 'Status', 'Source', 'Website', 'Path', 'Popup', 'Date', 'IP', 'User Agent'].join(','),
                ...emails.map((email) =>
                    [
                        email.email,
                        email.name || '',
                        email.status,
                        email.source_url || '',
                        email.website_domain,
                        email.path_name,
                        email.popup_title,
                        new Date(email.created_at).toLocaleString(),
                        email.ip_address || '',
                        email.user_agent || '',
                    ].join(',')
                ),
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'email-list.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to export emails',
                variant: 'destructive',
            });
        }
    };

    const handleDelete = async (emailId) => {
        try {
            const response = await fetch(`/api/emails/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ emailId, userId: dbUser.id }),
            });

            if (!response.ok) throw new Error('Failed to delete email');

            setEmails(emails.filter((email) => email.id !== emailId));
            toast({
                variant: 'success',
                title: 'Success',
                description: 'Email deleted successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete email',
                variant: 'destructive',
            });
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto p-4 lg:p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{t('emailsPage.title')}</h1>
                    <p className="text-sm text-gray-500">{t('emailsPage.description')}</p>
                </div>
                <Button onClick={handleExport} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {t('emailsPage.exportCsv')}
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder={t('emailsPage.search.placeholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Badge variant="secondary">{t('emailsPage.emailCount', { count: totalEmails })}</Badge>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('emailsPage.table.headers.email')}</TableHead>
                            <TableHead>{t('emailsPage.table.headers.source')}</TableHead>
                            <TableHead>{t('emailsPage.table.headers.status')}</TableHead>
                            <TableHead>{t('emailsPage.table.headers.date')}</TableHead>
                            <TableHead>{t('emailsPage.table.headers.website')}</TableHead>
                            <TableHead>{t('emailsPage.table.headers.path')}</TableHead>
                            <TableHead>{t('emailsPage.table.headers.popup')}</TableHead>
                            <TableHead className="text-right">{t('emailsPage.table.headers.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {emails.map((email) => (
                            <TableRow key={email.id}>
                                <TableCell className="font-medium">
                                    {email.email}
                                    {email.name && <div className="text-sm text-gray-500">{email.name}</div>}
                                </TableCell>
                                <TableCell>{email.source_url || '-'}</TableCell>
                                <TableCell>
                                    <Badge variant={email.status === 'active' ? 'success' : 'secondary'}>{email.status}</Badge>
                                </TableCell>
                                <TableCell>{new Date(email.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{email.website_domain}</TableCell>
                                <TableCell>{email.path_name}</TableCell>
                                <TableCell>{email.popup_title}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <span className="sr-only">{t('emailsPage.table.headers.actions')}</span>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(email.id)}>
                                                {t('emailsPage.actions.delete')}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between mt-4 px-2">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{t('emailsPage.pagination.rowsPerPage')}</span>
                        <Select
                            value={perPage.toString()}
                            onValueChange={(value) => {
                                setPerPage(parseInt(value));
                                setCurrentPage(1);
                            }}>
                            <SelectTrigger className="w-[70px]">
                                <SelectValue>{perPage}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {[4, 8, 12, 16].map((value) => (
                                    <SelectItem key={value} value={value.toString()}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-gray-500">{t('emailsPage.pagination.pageInfo', { current: currentPage, total: totalPages })}</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
