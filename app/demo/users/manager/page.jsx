'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { SearchIcon, Settings2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import UserEditor from '../../_components/UserEditor';
import LoadingSpinner from '../../_components/LoadingSpinner';
import { formatDate } from '@/utils/Functions';
import { Loader2 } from 'lucide-react';

// Mock data for users
const mockUsers = [
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
    },
    // Add more mock users to demonstrate pagination
    {
        id: 5,
        name: 'David Brown',
        email: 'david@example.com',
        role: 'User',
        status: 'Active',
        subscription: true,
        subscription_ends_at: '2024-09-30',
        created_at: '2024-03-15',
        imageUrl: '/avatars/05.png'
    },
    // ... add more users as needed
];

const UsersManager = () => {
    const [totalUsers] = useState(156); // Mock total users count
    const [pageNumber, setPageNumber] = useState(1);
    const [usersPerPage] = useState(10);
    const [latestUsers, setLatestUsers] = useState(mockUsers);
    const [searchInput, setSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [isUserEditorOpen, setIsUserEditorOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { toast } = useToast();

    const handleUserSearchClick = () => {
        setIsSearching(true);
        const trimmedSearchInput = searchInput.trim().toLowerCase();
        
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would search your actual users.",
            variant: "default"
        });
        
        setTimeout(() => {
            if (trimmedSearchInput === '') {
                setLatestUsers(mockUsers);
            } else {
                const filteredUsers = mockUsers.filter(user => 
                    user.email.toLowerCase().includes(trimmedSearchInput) ||
                    user.name.toLowerCase().includes(trimmedSearchInput)
                );
                setLatestUsers(filteredUsers);
            }
            setIsSearching(false);
        }, 500); // Simulate API delay
    };

    const handleUserEditorOpen = (user) => {
        setSelectedUser(user);
        setIsUserEditorOpen(true);
        
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, you would be able to edit user details.",
            variant: "default"
        });
    };

    const handleUserEditorClose = () => {
        setIsUserEditorOpen(false);
        setSelectedUser(null);
        
        toast({
            title: "Demo Version",
            description: "This is just a demo. Changes are not saved in the demo version.",
            variant: "default"
        });
    };

    const changePage = (direction) => {
        toast({
            title: "Demo Version",
            description: "This is just a demo. In the full version, this would show different pages of users.",
            variant: "default"
        });

        const totalPages = Math.ceil(totalUsers / usersPerPage);
        if (direction === 'next' && pageNumber < totalPages) {
            setPageNumber(prev => prev + 1);
        } else if (direction === 'previous' && pageNumber > 1) {
            setPageNumber(prev => prev - 1);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 md:px-8 md:ml-72">
            <header className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">User Manager</h1>
                <p className="text-sm text-muted-foreground">Manage your users efficiently.</p>
            </header>
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <h2 className="text-xl font-semibold">Latest Users</h2>
                    <div className="flex w-full md:w-auto space-x-2">
                        <div className="relative flex-grow md:flex-grow-0">
                            <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                onChange={(e) => setSearchInput(e.target.value)} 
                                placeholder="Search" 
                                className="pl-8 w-full" 
                            />
                        </div>
                        <Button onClick={handleUserSearchClick} variant="secondary" disabled={isSearching}>
                            {isSearching ? <LoadingSpinner size="small" color="currentColor" /> : 'Search'}
                        </Button>
                    </div>
                </div>
                <div className="border rounded-lg overflow-x-auto">
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
                            {isSearching ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-4">
                                       <div className="flex justify-center items-center">
                                       <LoadingSpinner size="large" color="#3498db" />
                                       </div>
                                    </TableCell>
                                </TableRow>
                            ) : latestUsers.map((user) => (
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
                                        <span className="text-sm text-gray-600">
                                            {user.subscription_ends_at === null ? '---' : formatDate(user.subscription_ends_at)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4 px-4">
                                        <span className="text-sm text-gray-600">{formatDate(user.created_at)}</span>
                                    </TableCell>
                                    <TableCell className="py-4 px-4">
                                        <Dialog open={isUserEditorOpen && selectedUser?.id === user.id} onOpenChange={setIsUserEditorOpen}>
                                            <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => handleUserEditorOpen(user)}>
                                                    <Settings2 className="h-5 w-5" />
                                                </Button>
                                            </DialogTrigger>
                                            {selectedUser && (
                                                <UserEditor 
                                                    user={selectedUser} 
                                                    onClose={handleUserEditorClose}
                                                />
                                            )}
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
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
        probation: 'bg-blue-100 text-blue-800 border-blue-200',
        onboarding: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'on leave': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
};

// Helper function to determine subscription status color
const getSubscriptionStatusColor = (isActive) => 
    isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200';

export default UsersManager;
