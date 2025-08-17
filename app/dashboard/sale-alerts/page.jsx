'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from '@/app/provider';
import { 
    TrendingUp, 
    DollarSign, 
    Eye, 
    CheckCircle, 
    XCircle, 
    MessageCircle, 
    Calendar,
    Filter,
    Search,
    MoreHorizontal,
    ExternalLink,
    ArrowUpRight,
    AlertCircle,
    Clock,
    User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

const SaleAlertsPage = () => {
    const { dbUser } = useUserContext();
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        highPriority: 0,
        totalValue: 0
    });

    useEffect(() => {
        if (dbUser?.id) {
            fetchSaleAlerts();
        }
    }, [dbUser, filter]);

    const fetchSaleAlerts = async () => {
        setIsLoading(true);
        try {
            const statusParam = filter !== 'all' ? `&status=${filter}` : '';
            const response = await fetch(`/api/sale-alerts?userId=${dbUser.id}${statusParam}`);
            
            if (!response.ok) throw new Error('Failed to fetch sale alerts');
            
            const data = await response.json();
            setAlerts(data.data || []);
            
            // Calculate stats
            const totalAlerts = data.data?.length || 0;
            const pendingAlerts = data.data?.filter(alert => alert.status === 'pending').length || 0;
            const highPriorityAlerts = data.data?.filter(alert => alert.priority === 'high').length || 0;
            const totalValue = data.data?.reduce((sum, alert) => sum + (parseFloat(alert.estimated_value) || 0), 0) || 0;
            
            setStats({
                total: totalAlerts,
                pending: pendingAlerts,
                highPriority: highPriorityAlerts,
                totalValue: totalValue
            });
        } catch (error) {
            console.error('Error fetching sale alerts:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateAlertStatus = async (alertId, status) => {
        try {
            const response = await fetch('/api/sale-alerts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertId, status, read: true })
            });

            if (!response.ok) throw new Error('Failed to update alert');
            
            // Refresh the alerts
            fetchSaleAlerts();
        } catch (error) {
            console.error('Error updating alert:', error);
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getAlertTypeIcon = (type) => {
        switch (type) {
            case 'purchase_intent': return <TrendingUp className="h-4 w-4" />;
            case 'price_inquiry': return <DollarSign className="h-4 w-4" />;
            default: return <MessageCircle className="h-4 w-4" />;
        }
    };

    const filteredAlerts = alerts.filter(alert => 
        alert.product_mentioned.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.visitor_message.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-64px)] bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading sale alerts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="max-w-7xl mx-auto pt-8 pb-6 px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <TrendingUp className="h-8 w-8 text-primary" />
                            </div>
                            Sale Alerts
                        </h1>
                        <p className="text-muted-foreground mt-1">Track potential sales opportunities from your chat interactions</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <AlertCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                                    <p className="text-2xl font-bold text-foreground">{stats.highPriority}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Est. Value</p>
                                    <p className="text-2xl font-bold text-foreground">${stats.totalValue.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by product or message..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={filter} onValueChange={setFilter}>
                                <SelectTrigger className="w-full sm:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="converted">Converted</SelectItem>
                                    <SelectItem value="dismissed">Dismissed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Alerts List */}
                {filteredAlerts.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No sale alerts found</h3>
                            <p className="text-muted-foreground">
                                When visitors show purchase intent in your chat, alerts will appear here.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredAlerts.map((alert) => (
                            <Card key={alert.id} className={`${!alert.read ? 'ring-2 ring-primary/20' : ''}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    {getAlertTypeIcon(alert.alert_type)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">
                                                        {alert.alert_type === 'purchase_intent' ? 'Purchase Intent' :
                                                         alert.alert_type === 'price_inquiry' ? 'Price Inquiry' : 'Potential Sale'}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {alert.website_domain} • {formatDistanceToNow(new Date(alert.created_at))} ago
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground mb-1">Visitor Message:</p>
                                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                                        "{alert.visitor_message}"
                                                    </p>
                                                </div>

                                                {alert.product_mentioned && (
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground mb-1">Product Mentioned:</p>
                                                        <Badge variant="outline">{alert.product_mentioned}</Badge>
                                                    </div>
                                                )}

                                                {alert.estimated_value > 0 && (
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground mb-1">Estimated Value:</p>
                                                        <Badge variant="outline" className="text-green-600 border-green-600">
                                                            ${parseFloat(alert.estimated_value).toFixed(2)}
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getPriorityColor(alert.priority)}>
                                                    {alert.priority}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {Math.round(parseFloat(alert.confidence_score) * 100)}% confidence
                                                </Badge>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => updateAlertStatus(alert.id, 'contacted')}>
                                                        <MessageCircle className="h-4 w-4 mr-2" />
                                                        Mark as Contacted
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateAlertStatus(alert.id, 'converted')}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Mark as Converted
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateAlertStatus(alert.id, 'dismissed')}>
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Dismiss Alert
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SaleAlertsPage;
