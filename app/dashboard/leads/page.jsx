'use client';

import React, { useState, useEffect } from 'react';
import { useUserContext } from '@/app/provider';
import { 
    UserCheck, 
    Mail, 
    Phone, 
    Building, 
    Calendar,
    Search,
    MoreHorizontal,
    ExternalLink,
    MessageCircle,
    CheckCircle,
    Clock,
    DollarSign,
    AlertCircle,
    Star,
    TrendingUp,
    Target,
    ChevronDown,
    ChevronUp,
    Activity,
    Brain,
    Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';

const LeadsPage = () => {
    const { dbUser } = useUserContext();
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLeads, setExpandedLeads] = useState(new Set());
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        contacted: 0,
        converted: 0,
        totalValue: 0,
        avgConfidence: 0,
        highPriority: 0
    });

    useEffect(() => {
        if (dbUser?.id) {
            fetchLeads();
        }
    }, [dbUser, filter]);

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const statusParam = filter !== 'all' ? `&status=${filter}` : '';
            const response = await fetch(`/api/leads?userId=${dbUser.id}${statusParam}`);
            
            if (!response.ok) throw new Error('Failed to fetch leads');
            
            const data = await response.json();
            setLeads(data.data || []);
            
            // Calculate stats
            const totalLeads = data.data?.length || 0;
            const newLeads = data.data?.filter(lead => lead.lead_status === 'new').length || 0;
            const contactedLeads = data.data?.filter(lead => lead.lead_status === 'contacted').length || 0;
            const convertedLeads = data.data?.filter(lead => lead.lead_status === 'converted').length || 0;
            const totalValue = data.data?.reduce((sum, lead) => sum + (parseFloat(lead.estimated_value) || 0), 0) || 0;
            const avgConfidence = totalLeads > 0 ? 
                data.data?.reduce((sum, lead) => sum + (parseFloat(lead.sale_confidence_score) || 0), 0) / totalLeads : 0;
            const highPriority = data.data?.filter(lead => lead.sale_priority === 'high').length || 0;
            
            setStats({
                total: totalLeads,
                new: newLeads,
                contacted: contactedLeads,
                converted: convertedLeads,
                totalValue: totalValue,
                avgConfidence: avgConfidence,
                highPriority: highPriority
            });
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateLeadStatus = async (leadId, status) => {
        try {
            const response = await fetch('/api/leads', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    leadId, 
                    leadStatus: status, 
                    lastContactAt: status === 'contacted' ? new Date() : undefined,
                    convertedAt: status === 'converted' ? new Date() : undefined 
                })
            });

            if (!response.ok) throw new Error('Failed to update lead');
            
            // Refresh the leads
            fetchLeads();
        } catch (error) {
            console.error('Error updating lead:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'contacted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'qualified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'converted': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'lost': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getLeadSourceIcon = (source) => {
        switch (source) {
            case 'chat': return <MessageCircle className="h-4 w-4" />;
            case 'form': return <ExternalLink className="h-4 w-4" />;
            case 'email': return <Mail className="h-4 w-4" />;
            default: return <UserCheck className="h-4 w-4" />;
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

    const getConfidenceColor = (score) => {
        const numScore = parseFloat(score) || 0;
        if (numScore >= 0.8) return 'text-green-600 dark:text-green-400';
        if (numScore >= 0.6) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const toggleLeadExpansion = (leadId) => {
        setExpandedLeads(prev => {
            const newSet = new Set(prev);
            if (newSet.has(leadId)) {
                newSet.delete(leadId);
            } else {
                newSet.add(leadId);
            }
            return newSet;
        });
    };

    const filteredLeads = leads.filter(lead => 
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.product_interest.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-64px)] bg-gray-50 items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading leads...</p>
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
                                <UserCheck className="h-8 w-8 text-primary" />
                            </div>
                            Leads
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage and track captured leads with AI-powered sales insights from chat interactions</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-16">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                    <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">New</p>
                                    <p className="text-2xl font-bold text-foreground">{stats.new}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                    <MessageCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Contacted</p>
                                    <p className="text-2xl font-bold text-foreground">{stats.contacted}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Converted</p>
                                    <p className="text-2xl font-bold text-foreground">{stats.converted}</p>
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

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">Avg Confidence</p>
                                    <p className="text-2xl font-bold text-foreground">{(stats.avgConfidence * 100).toFixed(0)}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                    <Zap className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                                    <p className="text-2xl font-bold text-foreground">{stats.highPriority}</p>
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
                                    placeholder="Search by email, name, company, or product..."
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
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="qualified">Qualified</SelectItem>
                                    <SelectItem value="converted">Converted</SelectItem>
                                    <SelectItem value="lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Leads List */}
                {filteredLeads.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No leads found</h3>
                            <p className="text-muted-foreground">
                                When visitors provide their email addresses in chat, leads will appear here.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredLeads.map((lead) => (
                            <Card key={lead.id}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    {getLeadSourceIcon(lead.lead_source)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                                                        {lead.name || 'Anonymous Lead'}
                                                        <Badge className={getStatusColor(lead.lead_status)}>
                                                            {lead.lead_status}
                                                        </Badge>
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {lead.website_domain} • {formatDistanceToNow(new Date(lead.created_at))} ago
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{lead.email}</span>
                                                </div>
                                                
                                                {lead.phone && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{lead.phone}</span>
                                                    </div>
                                                )}

                                                {lead.company && (
                                                    <div className="flex items-center gap-2">
                                                        <Building className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-sm">{lead.company}</span>
                                                    </div>
                                                )}

                                                {lead.product_interest && (
                                                    <div className="col-span-full">
                                                        <p className="text-sm text-muted-foreground">
                                                            <span className="font-medium">Interest:</span> {lead.product_interest}
                                                        </p>
                                                    </div>
                                                )}

                                                {lead.estimated_value > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm font-medium text-green-600">
                                                            ${parseFloat(lead.estimated_value).toFixed(2)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* AI Sale Analysis Section */}
                                            {lead.sale_confidence_score && (
                                                <div className="border border-border rounded-lg p-4 mb-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                            <Brain className="h-4 w-4 text-purple-600" />
                                                            AI Sale Analysis
                                                        </h4>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleLeadExpansion(lead.id)}
                                                            className="h-6 w-6 p-0"
                                                        >
                                                            {expandedLeads.has(lead.id) ? 
                                                                <ChevronUp className="h-4 w-4" /> : 
                                                                <ChevronDown className="h-4 w-4" />
                                                            }
                                                        </Button>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                                                        <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                                                            <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                                                            <p className={`text-sm font-bold ${getConfidenceColor(lead.sale_confidence_score)}`}>
                                                                {(parseFloat(lead.sale_confidence_score) * 100).toFixed(0)}%
                                                            </p>
                                                        </div>
                                                        
                                                        {lead.sale_priority && (
                                                            <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                                                                <p className="text-xs text-muted-foreground mb-1">Priority</p>
                                                                <Badge className={getPriorityColor(lead.sale_priority)} size="sm">
                                                                    {lead.sale_priority}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        
                                                        {lead.sale_alert_type && (
                                                            <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                                                                <p className="text-xs text-muted-foreground mb-1">Alert Type</p>
                                                                <p className="text-xs font-medium capitalize">{lead.sale_alert_type.replace('_', ' ')}</p>
                                                            </div>
                                                        )}
                                                        
                                                        {lead.sale_product_mentioned && (
                                                            <div className="text-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                                                                <p className="text-xs text-muted-foreground mb-1">Product</p>
                                                                <p className="text-xs font-medium truncate" title={lead.sale_product_mentioned}>
                                                                    {lead.sale_product_mentioned}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    {expandedLeads.has(lead.id) && (
                                                        <div className="space-y-3 pt-3 border-t border-border">
                                                            {lead.sale_visitor_message && (
                                                                <div>
                                                                    <p className="text-xs font-medium text-foreground mb-1">Visitor Message:</p>
                                                                    <p className="text-xs text-muted-foreground bg-white/50 dark:bg-gray-800/50 p-2 rounded italic">
                                                                        "{lead.sale_visitor_message.length > 150 ? 
                                                                            lead.sale_visitor_message.substring(0, 150) + '...' : 
                                                                            lead.sale_visitor_message
                                                                        }"
                                                                    </p>
                                                                </div>
                                                            )}
                                                            
                                                            {lead.sale_ai_response && (
                                                                <div>
                                                                    <p className="text-xs font-medium text-foreground mb-1">AI Response:</p>
                                                                    <p className="text-xs text-muted-foreground bg-white/50 dark:bg-gray-800/50 p-2 rounded">
                                                                        "{lead.sale_ai_response.length > 150 ? 
                                                                            lead.sale_ai_response.substring(0, 150) + '...' : 
                                                                            lead.sale_ai_response
                                                                        }"
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            
                                            {lead.notes && (
                                                <div className="bg-muted p-3 rounded-lg mb-4">
                                                    <p className="text-sm font-medium text-foreground mb-1">Additional Notes:</p>
                                                    <p className="text-sm text-muted-foreground">{lead.notes}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-3">
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Source</p>
                                                <Badge variant="outline">
                                                    {lead.lead_source}
                                                </Badge>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'contacted')}>
                                                        <MessageCircle className="h-4 w-4 mr-2" />
                                                        Mark as Contacted
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'qualified')}>
                                                        <Star className="h-4 w-4 mr-2" />
                                                        Mark as Qualified
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'converted')}>
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Mark as Converted
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'lost')}>
                                                        <AlertCircle className="h-4 w-4 mr-2" />
                                                        Mark as Lost
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

export default LeadsPage;
