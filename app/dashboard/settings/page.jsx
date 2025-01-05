'use client';
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UserSettings = () => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        bio: '',
        timezone: '',
        language: '',
        notifications: {
            email: true,
            push: true,
        },
    });

    useEffect(() => {
        if (user) {
            setFormData(prevData => ({
                ...prevData,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.primaryEmailAddress?.emailAddress || '',
            }));
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleNotificationChange = (type) => {
        setFormData(prevData => ({
            ...prevData,
            notifications: {
                ...prevData.notifications,
                [type]: !prevData.notifications[type],
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        alert('Settings updated successfully!');
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Handle avatar upload logic here
        }
    };

    return (
        <div className="container p-6 mx-auto">
            <header className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-2">User Settings</h1>
                <p className="text-lg text-muted-foreground">
                    Manage your account settings, preferences, and billing information.
                </p>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-8">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                <form onSubmit={handleSubmit}>
                    <TabsContent value="profile" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal details and public profile.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-4 mb-6">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={user?.imageUrl} />
                                        <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold mb-1">Profile Picture</h3>
                                        <Input type="file" onChange={handleAvatarChange} accept="image/*" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleInputChange}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="account" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Preferences</CardTitle>
                                <CardDescription>Manage your account settings and preferences.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Select
                                            name="timezone"
                                            value={formData.timezone}
                                            onValueChange={(value) => handleInputChange({ target: { name: 'timezone', value } })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select timezone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="utc">UTC</SelectItem>
                                                <SelectItem value="est">Eastern Time</SelectItem>
                                                <SelectItem value="pst">Pacific Time</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="language">Language</Label>
                                        <Select
                                            name="language"
                                            value={formData.language}
                                            onValueChange={(value) => handleInputChange({ target: { name: 'language', value } })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select language" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="es">Spanish</SelectItem>
                                                <SelectItem value="fr">French</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Choose how you'd like to receive notifications.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.notifications.email}
                                            onChange={() => handleNotificationChange('email')}
                                        />
                                        <span>Receive email notifications</span>
                                    </Label>
                                    <Label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.notifications.push}
                                            onChange={() => handleNotificationChange('push')}
                                        />
                                        <span>Receive push notifications</span>
                                    </Label>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="billing" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Billing Information</CardTitle>
                                <CardDescription>Manage your subscription and billing details.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Current Plan</h3>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="secondary">Pro Plan</Badge>
                                            <span className="text-sm text-muted-foreground">$29/month</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Payment Method</h3>
                                        <p className="text-sm text-muted-foreground">Visa ending in 1234</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Billing History</h3>
                                        <ul className="text-sm text-muted-foreground">
                                            <li>Invoice #1234 - $29.00 (Paid on May 1, 2023)</li>
                                            <li>Invoice #1235 - $29.00 (Paid on April 1, 2023)</li>
                                        </ul>
                                    </div>
                                    <Button variant="outline">Update Payment Method</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <div className="mt-8">
                        <Button type="submit">Save Changes</Button>
                    </div>
                </form>
            </Tabs>
        </div>
    );
};

export default UserSettings;
