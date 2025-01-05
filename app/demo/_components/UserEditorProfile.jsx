'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/utils/Functions';
import { useToast } from "@/hooks/use-toast"
import LoadingSpinner from './LoadingSpinner';

const UserEditorProfile = ({ user, getTotalUsers, onUpdateSuccess }) => {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false);
    const [accountSettings, setAccountSettings] = useState({
        status: user.status,
        role: user.role,
    });

    // Handle dropdown changes for account settings
    const handleDropdownChange = (name, value) => {
        setAccountSettings(prev => ({ ...prev, [name]: value }));
    };

    // Handle form submission
    const handleFormSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/admin/edit-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user, changedFields: accountSettings }),
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            toast({
                title: 'Success',
                description: 'User updated successfully',
                variant: 'success',
            });
            getTotalUsers();
            onUpdateSuccess();
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <LoadingSpinner />;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-4">User Profile</h1>
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={user.imageUrl} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-xl">{user.name}</CardTitle>
                        <CardDescription className="text-sm">
                            Subscription: {user.subscription ? 'Paid' : 'Free'}
                        </CardDescription>
                        <CardDescription className="text-sm">
                            Account created: {formatDate(user.created_at)}
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={user.name} disabled />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user.email} disabled />
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-lg">Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="status">Account status</Label>
                        <Select onValueChange={(value) => handleDropdownChange('status', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={accountSettings.status} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="banned">Banned</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="role">Role</Label>
                        <Select onValueChange={(value) => handleDropdownChange('role', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder={accountSettings.role} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
            <div className="mt-4 flex justify-end">
                <Button onClick={handleFormSubmit} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <LoadingSpinner size="small" color="white" />
                            <span className="ml-2">Saving...</span>
                        </>
                    ) : (
                        'Save changes'
                    )}
                </Button>
            </div>
        </div>
    );
};

export default UserEditorProfile;
