'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

export default function NewsletterPage() {
    const { t } = useTranslation();
    const [emails, setEmails] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [totalEmails, setTotalEmails] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        if (searchQuery) {
            setCurrentPage(1);
        }
        fetchEmails();
    }, [currentPage, perPage, searchQuery]);

    const fetchEmails = async () => {
        try {
            const response = await fetch(`/api/admin/get-newsletter-emails?page=${currentPage}&limit=${perPage}&search=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) throw new Error(t('newsletter.messages.error.fetch'));
            const data = await response.json();
            setEmails(data.emails);
            setTotalPages(Math.ceil(data.total / perPage));
            setTotalEmails(data.total);
        } catch (error) {
            console.error('Error fetching emails:', error);
            toast({
                title: 'Error',
                description: t('newsletter.messages.error.fetch'),
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const csvContent = [['Email', 'Subscribed Date'].join(','), ...emails.map((email) => [email.email, new Date(email.subscribed_at).toLocaleString()].join(','))].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'newsletter-subscribers.csv';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            toast({
                title: 'Error',
                description: t('newsletter.messages.error.export'),
                variant: 'destructive',
            });
        }
    };

    const handleRemoveEmail = async (email) => {
        try {
            const response = await fetch(`/api/admin/remove-newsletter-email?email=${email}`);
            if (!response.ok) throw new Error(t('newsletter.messages.error.remove'));
            toast({
                variant: 'success',
                title: 'Success',
                description: t('newsletter.messages.success.remove'),
            });
            fetchEmails();
        } catch (error) {
            console.error('Error removing email:', error);
            toast({
                title: 'Error',
                description: t('newsletter.messages.error.remove'),
                variant: 'destructive',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)] md:ml-72">
                <Loader2 className="w-6 h-6 mr-2 animate-spin" size="large" color="black" />
            </div>
        );
    }

    return (
        <div className="md:ml-72 mx-auto p-4 lg:p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t('newsletter.title')}</h1>
                    <p className="text-sm text-muted-foreground">{t('newsletter.description')}</p>
                </div>
                <Button onClick={handleExport} className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {t('newsletter.actions.exportCSV')}
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder={t('newsletter.actions.search')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background border-border text-foreground"
                    />
                </div>
                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                    {totalEmails} {t('newsletter.title')}
                </Badge>
            </div>

            <div className="border rounded-lg border-border">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-accent">
                            <TableHead className="text-foreground">{t('newsletter.table.email')}</TableHead>
                            <TableHead className="text-foreground">{t('newsletter.table.subscribedDate')}</TableHead>
                            <TableHead className="text-right text-foreground">{t('newsletter.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {emails.map((email) => (
                            <TableRow key={email.id} className="hover:bg-accent">
                                <TableCell className="font-medium text-foreground">{email.email}</TableCell>
                                <TableCell className="text-muted-foreground">{new Date(email.subscribed_at).toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveEmail(email.email)} className="hover:bg-accent hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between mt-4 px-2 border-t border-border py-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t('newsletter.pagination.rowsPerPage')}</span>
                        <Select
                            value={perPage.toString()}
                            onValueChange={(value) => {
                                setPerPage(parseInt(value));
                                setCurrentPage(1);
                            }}>
                        <SelectTrigger className="w-[70px] border-border bg-background">
                                <SelectValue>{perPage}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 30, 50].map((value) => (
                                    <SelectItem key={value} value={value.toString()}>
                                        {value}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="border-border hover:bg-accent">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="border-border hover:bg-accent">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
