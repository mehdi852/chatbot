'use client';

import React, { useState } from 'react';
import { Loader2, Search, Download, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Mock data for newsletter subscribers
const mockEmails = [
    {
        id: 1,
        email: 'john.doe@example.com',
        subscribed_at: '2024-03-15T10:30:00Z'
    },
    {
        id: 2,
        email: 'jane.smith@example.com',
        subscribed_at: '2024-03-14T15:45:00Z'
    },
    {
        id: 3,
        email: 'mike.wilson@example.com',
        subscribed_at: '2024-03-13T09:20:00Z'
    },
    {
        id: 4,
        email: 'sarah.johnson@example.com',
        subscribed_at: '2024-03-12T14:15:00Z'
    },
    {
        id: 5,
        email: 'david.brown@example.com',
        subscribed_at: '2024-03-11T11:30:00Z'
    }
];

export default function NewsletterPage() {
    const [emails, setEmails] = useState(mockEmails);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(Math.ceil(mockEmails.length / 10));
    const [totalEmails, setTotalEmails] = useState(mockEmails.length);
    const { toast } = useToast();

    const handleSearch = () => {
        setIsLoading(true);
        
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would search through your actual subscribers.",
            variant: "default"
        });

        setTimeout(() => {
            if (!searchQuery.trim()) {
                setEmails(mockEmails);
            } else {
                const filtered = mockEmails.filter(email => 
                    email.email.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setEmails(filtered);
                setTotalPages(Math.ceil(filtered.length / perPage));
                setTotalEmails(filtered.length);
            }
            setIsLoading(false);
        }, 500); // Simulate API delay
    };

    const handleExport = () => {
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would export your subscribers to CSV.",
            variant: "default"
        });

        try {
            const csvContent = [
                ['Email', 'Subscribed Date'].join(','),
                ...emails.map((email) => [
                    email.email,
                    new Date(email.subscribed_at).toLocaleString()
                ].join(','))
            ].join('\n');

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
                description: 'Failed to export subscribers',
                variant: 'destructive',
            });
        }
    };

    const handleRemoveEmail = (email) => {
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would remove the subscriber.",
            variant: "default"
        });

        setEmails(emails.filter(e => e.email !== email));
        setTotalEmails(prev => prev - 1);
    };

    const PaginationControls = () => (
        <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
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
                        {[10, 20, 30, 50].map((value) => (
                            <SelectItem key={value} value={value.toString()}>
                                {value}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-6">
                <span className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-100px)] md:ml-72">
                <Loader2 className="w-6 h-6 mr-2 animate-spin" size="large" color="black" />
            </div>
        );
    }

    return (
        <div className= "md:ml-72 mx-auto p-4 lg:p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
                    <p className="text-sm text-gray-500">Manage your newsletter subscribers</p>
                </div>
                <Button onClick={handleExport} className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search subscribers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <Badge variant="secondary">{totalEmails} Subscribers</Badge>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Subscribed Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {emails.map((email) => (
                            <TableRow key={email.id}>
                                <TableCell className="font-medium">{email.email}</TableCell>
                                <TableCell>{new Date(email.subscribed_at).toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleRemoveEmail(email.email)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <PaginationControls />
            </div>
        </div>
    );
}
