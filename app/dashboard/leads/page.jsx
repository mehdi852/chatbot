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
    Zap,
    Filter,
    Download,
    Eye,
    Users,
    Trash
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';

const LeadsPage = () => {
    const { dbUser } = useUserContext();
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedLeads, setExpandedLeads] = useState(new Set());
    const [selectedLead, setSelectedLead] = useState(null);
    const [leadToDelete, setLeadToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
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
    }, [dbUser, filter, dateFilter]);

    // Date utility functions
    const getDateRange = (filterType) => {
        const now = new Date();
        switch (filterType) {
            case 'today':
                return { startDate: startOfDay(now), endDate: endOfDay(now) };
            case 'yesterday':
                const yesterday = subDays(now, 1);
                return { startDate: startOfDay(yesterday), endDate: endOfDay(yesterday) };
            case 'last7Days':
                return { startDate: startOfDay(subDays(now, 6)), endDate: endOfDay(now) };
            case 'last30Days':
                return { startDate: startOfDay(subDays(now, 29)), endDate: endOfDay(now) };
            default:
                return null;
        }
    };

    const fetchLeads = async () => {
        setIsLoading(true);
        try {
            const statusParam = filter !== 'all' ? `&status=${filter}` : '';
            
            // Add date filtering
            let dateParams = '';
            if (dateFilter !== 'all') {
                const dateRange = getDateRange(dateFilter);
                if (dateRange) {
                    dateParams = `&startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`;
                }
            }
            
            const response = await fetch(`/api/leads?userId=${dbUser.id}${statusParam}${dateParams}`);
            
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

    const deleteLead = async (leadId) => {
        if (!leadId || !dbUser?.id) return;
        
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/leads?leadId=${leadId}&userId=${dbUser.id}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete lead');
            }
            
            // If the deleted lead was selected, clear the selection
            if (selectedLead?.id === leadId) {
                setSelectedLead(null);
            }
            
            // Refresh the leads
            await fetchLeads();
            
        } catch (error) {
            console.error('Error deleting lead:', error);
            alert('Failed to delete lead: ' + error.message);
        } finally {
            setIsDeleting(false);
            setLeadToDelete(null);
        }
    };

    const handleDeleteClick = (lead) => {
        setLeadToDelete(lead);
    };

    const confirmDelete = () => {
        if (leadToDelete) {
            deleteLead(leadToDelete.id);
        }
    };

    const cancelDelete = () => {
        setLeadToDelete(null);
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

    // Show minimal loading state while fetching data
    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-64px)] bg-background items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-background">
            {/* Sidebar - Lead List */}
            <div className="w-80 bg-card border-r border-border flex flex-col shadow-md">
                {/* Header */}
                <div className="border-b border-border bg-muted/30">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                                <UserCheck className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm font-semibold text-foreground truncate">Lead Management</h2>
                                <p className="text-xs text-muted-foreground truncate">AI-powered insights</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0 flex-shrink-0">
                            <Download className="h-3 w-3" />
                        </Button>
                    </div>
                    
                    {/* Stats Cards - Compact */}
                    <div className="px-3 pb-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-card rounded-lg p-2.5 border border-border text-center">
                                <div className="text-base font-bold text-blue-600 dark:text-blue-400 leading-none">{stats.total}</div>
                                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">Total Leads</div>
                            </div>
                            <div className="bg-card rounded-lg p-2.5 border border-border text-center">
                                <div className="text-base font-bold text-green-600 dark:text-green-400 leading-none">{stats.converted}</div>
                                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">Converted</div>
                            </div>
                            <div className="bg-card rounded-lg p-2.5 border border-border text-center">
                                <div className="text-sm font-bold text-orange-600 dark:text-orange-400 leading-none truncate">
                                    ${stats.totalValue > 999999 ? (stats.totalValue/1000000).toFixed(1) + 'M' : 
                                      stats.totalValue > 999 ? (stats.totalValue/1000).toFixed(1) + 'K' :
                                      stats.totalValue.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">Est. Value</div>
                            </div>
                            <div className="bg-card rounded-lg p-2.5 border border-border text-center">
                                <div className="text-base font-bold text-purple-600 dark:text-purple-400 leading-none">{(stats.avgConfidence * 100).toFixed(0)}%</div>
                                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">AI Confidence</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-3 border-b border-border bg-card">
                    <div className="space-y-2.5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-8 text-xs"
                            />
                        </div>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="h-8 text-xs">
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
                        
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="h-8 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <SelectValue placeholder="All Time" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="yesterday">Yesterday</SelectItem>
                                <SelectItem value="last7Days">Last 7 Days</SelectItem>
                                <SelectItem value="last30Days">Last 30 Days</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Lead List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredLeads.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center">
                                <UserCheck className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                                <p className="text-sm font-medium text-muted-foreground mb-1">No leads found</p>
                                <p className="text-xs text-muted-foreground/70 max-w-[200px] leading-relaxed">
                                    {searchTerm || filter !== 'all' || dateFilter !== 'all'
                                        ? 'Try adjusting your search or filters'
                                        : 'Leads will appear here from chat interactions'
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    className={`group cursor-pointer transition-all duration-200 hover:bg-muted/50 relative ${
                                        selectedLead?.id === lead.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                                    }`}
                                    onClick={() => setSelectedLead(lead)}>
                                    <div className="px-3 py-3 flex items-start space-x-3">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-9 h-9 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center border border-blue-200 shadow-sm">
                                                <span className="text-blue-700 text-xs font-semibold">
                                                    {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
                                                </span>
                                            </div>
                                            
                                            {/* Status Indicator */}
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${
                                                lead.lead_status === 'new' ? 'bg-blue-500' :
                                                lead.lead_status === 'contacted' ? 'bg-yellow-500' :
                                                lead.lead_status === 'qualified' ? 'bg-purple-500' :
                                                lead.lead_status === 'converted' ? 'bg-green-500' : 'bg-gray-400'
                                            }`} />
                                        </div>

                                        {/* Lead details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                                    <h3 className="text-sm font-medium text-foreground truncate max-w-[120px]">
                                                        {lead.name || 'Anonymous'}
                                                    </h3>
                                                    <Badge className={`text-[10px] px-1.5 py-0.5 ${getStatusColor(lead.lead_status)} flex-shrink-0`}>
                                                        {lead.lead_status}
                                                    </Badge>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                                                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: false })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mb-2 max-w-[220px]">{lead.email}</p>
                                            
                                            {/* Compact info badges */}
                                            <div className="flex items-center flex-wrap gap-1">
                                                {lead.company && (
                                                    <div className="flex items-center space-x-1 bg-muted px-1.5 py-0.5 rounded text-[10px] max-w-[80px]">
                                                        <Building className="h-2.5 w-2.5 text-muted-foreground flex-shrink-0" />
                                                        <span className="text-muted-foreground truncate">{lead.company}</span>
                                                    </div>
                                                )}
                                                {lead.estimated_value > 0 && (
                                                    <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-950/30 px-1.5 py-0.5 rounded text-[10px]">
                                                        <DollarSign className="h-2.5 w-2.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                                            {parseFloat(lead.estimated_value) > 999 ? 
                                                                `$${(parseFloat(lead.estimated_value)/1000).toFixed(1)}K` : 
                                                                `$${parseFloat(lead.estimated_value).toLocaleString()}`
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {lead.sale_confidence_score && (
                                                    <div className="flex items-center space-x-1 bg-purple-50 dark:bg-purple-950/30 px-1.5 py-0.5 rounded text-[10px]">
                                                        <Brain className="h-2.5 w-2.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                                        <span className="text-purple-600 dark:text-purple-400 font-medium">
                                                            {(parseFloat(lead.sale_confidence_score) * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete button */}
                                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick(lead);
                                                            }}
                                                            disabled={isDeleting}
                                                            className="p-1 hover:bg-destructive/10 rounded transition-colors duration-200 group/delete disabled:opacity-50">
                                                            <Trash className="w-3.5 h-3.5 text-muted-foreground group-hover/delete:text-destructive transition-colors duration-200" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area - Lead Details */}
            <div className="flex-1 flex flex-col bg-card">
                {selectedLead ? (
                    <>
                        {/* Lead Header */}
                        <div className="bg-card border-b border-border">
                            <div className="px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {/* Lead Avatar */}
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-gradient-to-br from-muted/50 via-muted to-muted/80 rounded-xl flex items-center justify-center border border-border shadow-sm">
                                                <span className="text-foreground text-lg font-semibold">
                                                    {selectedLead.name ? selectedLead.name.charAt(0).toUpperCase() : 'L'}
                                                </span>
                                            </div>
                                            
                                            {/* Status Indicator */}
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                                                selectedLead.lead_status === 'new' ? 'bg-blue-500' :
                                                selectedLead.lead_status === 'contacted' ? 'bg-amber-500' :
                                                selectedLead.lead_status === 'qualified' ? 'bg-purple-500' :
                                                selectedLead.lead_status === 'converted' ? 'bg-emerald-500' : 'bg-slate-400'
                                            }`} />
                                        </div>
                                        
                                        {/* Lead Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-3 mb-1">
                                                <h1 className="text-xl font-semibold text-foreground tracking-tight">
                                                    {selectedLead.name || 'Anonymous Lead'}
                                                </h1>
                                                <div className="flex items-center space-x-2">
                                                    <Badge className={`${getStatusColor(selectedLead.lead_status)} text-xs font-medium px-2 py-0.5`}>
                                                        {selectedLead.lead_status.charAt(0).toUpperCase() + selectedLead.lead_status.slice(1)}
                                                    </Badge>
                                                    {selectedLead.sale_priority && (
                                                        <Badge className={`${getPriorityColor(selectedLead.sale_priority)} text-xs font-medium px-2 py-0.5`}>
                                                            {selectedLead.sale_priority.charAt(0).toUpperCase() + selectedLead.sale_priority.slice(1)} Priority
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Contact Info */}
                                            <div className="flex items-center space-x-4 text-muted-foreground">
                                                <div className="flex items-center space-x-1.5">
                                                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{selectedLead.email}</span>
                                                </div>
                                                {selectedLead.phone && (
                                                    <div className="flex items-center space-x-1.5">
                                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                        <span className="text-sm font-medium">{selectedLead.phone}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-1.5">
                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDistanceToNow(new Date(selectedLead.created_at))} ago
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="h-8 px-3 shadow-sm">
                                                    <MoreHorizontal className="h-4 w-4 mr-1.5" />
                                                    Actions
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                <DropdownMenuItem onClick={() => updateLeadStatus(selectedLead.id, 'contacted')} className="text-sm py-2">
                                                    <MessageCircle className="h-4 w-4 mr-2 text-blue-500" />
                                                    Mark as Contacted
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateLeadStatus(selectedLead.id, 'qualified')} className="text-sm py-2">
                                                    <Star className="h-4 w-4 mr-2 text-purple-500" />
                                                    Mark as Qualified
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateLeadStatus(selectedLead.id, 'converted')} className="text-sm py-2">
                                                    <CheckCircle className="h-4 w-4 mr-2 text-emerald-500" />
                                                    Mark as Converted
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateLeadStatus(selectedLead.id, 'lost')} className="text-sm py-2">
                                                    <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                                                    Mark as Lost
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lead Details Content */}
                        <div className="flex-1 overflow-y-auto bg-muted/30">
                            <div className="p-6">
                                <div className="max-w-6xl space-y-6">

                                {/* Basic Information */}
                                <Card className="border-0 shadow-sm bg-card">
                                    <CardHeader className="border-b border-border bg-muted/30 pb-3">
                                        <CardTitle className="flex items-center gap-2 text-foreground">
                                            <div className="p-1.5 bg-muted rounded-lg">
                                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            Contact Information
                                        </CardTitle>
                                        <CardDescription className="text-muted-foreground text-sm">Essential lead details and contact information</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Primary Contact Details */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Primary Contact</h3>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border">
                                                        <div className="p-1.5 bg-card rounded-lg shadow-sm">
                                                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Email Address</p>
                                                            <p className="text-sm font-semibold text-foreground">{selectedLead.email}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {selectedLead.phone && (
                                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                                                            <div className="p-1.5 bg-white rounded-lg shadow-sm ring-1 ring-slate-900/5">
                                                                <Phone className="h-3.5 w-3.5 text-slate-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Phone Number</p>
                                                                <p className="text-sm font-semibold text-slate-900">{selectedLead.phone}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {selectedLead.company && (
                                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                                                            <div className="p-1.5 bg-white rounded-lg shadow-sm ring-1 ring-slate-900/5">
                                                                <Building className="h-3.5 w-3.5 text-slate-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Company</p>
                                                                <p className="text-sm font-semibold text-slate-900">{selectedLead.company}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Lead Details */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Lead Details</h3>
                                                
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                                                        <div className="p-1.5 bg-white rounded-lg shadow-sm ring-1 ring-slate-900/5">
                                                            {getLeadSourceIcon(selectedLead.lead_source)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Lead Source</p>
                                                            <p className="text-sm font-semibold text-slate-900 capitalize">{selectedLead.lead_source}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                                                        <div className="p-1.5 bg-white rounded-lg shadow-sm ring-1 ring-slate-900/5">
                                                            <ExternalLink className="h-3.5 w-3.5 text-slate-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Website</p>
                                                            <p className="text-sm font-semibold text-slate-900">{selectedLead.website_domain}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/50 border border-slate-100">
                                                        <div className="p-1.5 bg-white rounded-lg shadow-sm ring-1 ring-slate-900/5">
                                                            <Calendar className="h-3.5 w-3.5 text-slate-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">Created</p>
                                                            <p className="text-sm font-semibold text-slate-900">{formatDistanceToNow(new Date(selectedLead.created_at))} ago</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Information */}
                                        {(selectedLead.product_interest || selectedLead.notes) && (
                                            <div className="mt-6 pt-4 border-t border-slate-100">
                                                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Additional Information</h3>
                                                <div className="space-y-3">
                                                    {selectedLead.product_interest && (
                                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                                                            <div className="p-1.5 bg-white rounded-lg shadow-sm ring-1 ring-blue-900/10">
                                                                <Target className="h-3.5 w-3.5 text-blue-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-0.5">Product Interest</p>
                                                                <p className="text-sm font-medium text-slate-900">{selectedLead.product_interest}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {selectedLead.notes && (
                                                        <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                                                            <div className="p-1.5 bg-white rounded-lg shadow-sm ring-1 ring-amber-900/10">
                                                                <Activity className="h-3.5 w-3.5 text-amber-600" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-0.5">Notes</p>
                                                                <p className="text-sm font-medium text-slate-900">{selectedLead.notes}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* AI Sales Analysis */}
                                {selectedLead.sale_confidence_score && (
                                    <Card className="border-0 shadow-sm bg-white ring-1 ring-slate-900/5">
                                        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50/50 via-blue-50/30 to-indigo-50/50 pb-3">
                                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                                <div className="p-1.5 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg">
                                                    <Brain className="h-4 w-4 text-purple-600" />
                                                </div>
                                                AI Sales Intelligence
                                            </CardTitle>
                                            <CardDescription className="text-slate-600 text-sm">Advanced AI-powered lead analysis and predictive scoring</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-5">
                                            {/* Key Metrics */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                                                {/* Confidence Score */}
                                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-blue-50/80 to-blue-100/60 border border-blue-100 p-4">
                                                    <div className="relative z-10">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Confidence Score</p>
                                                            <div className="p-1 bg-blue-100 rounded-lg">
                                                                <TrendingUp className="h-3 w-3 text-blue-600" />
                                                            </div>
                                                        </div>
                                                        <p className={`text-2xl font-bold mb-1 ${getConfidenceColor(selectedLead.sale_confidence_score)}`}>
                                                            {(parseFloat(selectedLead.sale_confidence_score) * 100).toFixed(0)}%
                                                        </p>
                                                        <p className="text-xs text-blue-600/70">Conversion likelihood</p>
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-blue-200/30 rounded-full" />
                                                    <div className="absolute -top-1 -left-1 w-8 h-8 bg-blue-300/20 rounded-full" />
                                                </div>
                                                
                                                {/* Priority Level */}
                                                {selectedLead.sale_priority && (
                                                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 via-purple-50/80 to-purple-100/60 border border-purple-100 p-4">
                                                        <div className="relative z-10">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Priority Level</p>
                                                                <div className="p-1 bg-purple-100 rounded-lg">
                                                                    <Star className="h-3 w-3 text-purple-600" />
                                                                </div>
                                                            </div>
                                                            <div className="mb-1">
                                                                <Badge className={`${getPriorityColor(selectedLead.sale_priority)} px-2 py-1 text-xs font-semibold`}>
                                                                    {selectedLead.sale_priority.toUpperCase()}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-xs text-purple-600/70">Sales priority</p>
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-purple-200/30 rounded-full" />
                                                        <div className="absolute -top-1 -left-1 w-8 h-8 bg-purple-300/20 rounded-full" />
                                                    </div>
                                                )}
                                                
                                                {/* Estimated Value */}
                                                {selectedLead.estimated_value > 0 && (
                                                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-emerald-100/60 border border-emerald-100 p-4">
                                                        <div className="relative z-10">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Estimated Value</p>
                                                                <div className="p-1 bg-emerald-100 rounded-lg">
                                                                    <DollarSign className="h-3 w-3 text-emerald-600" />
                                                                </div>
                                                            </div>
                                                            <p className="text-2xl font-bold text-emerald-600 mb-1">
                                                                ${parseFloat(selectedLead.estimated_value).toLocaleString()}
                                                            </p>
                                                            <p className="text-xs text-emerald-600/70">Potential revenue</p>
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-emerald-200/30 rounded-full" />
                                                        <div className="absolute -top-1 -left-1 w-8 h-8 bg-emerald-300/20 rounded-full" />
                                                    </div>
                                                )}
                                                
                                                {/* Alert Type */}
                                                {selectedLead.sale_alert_type && (
                                                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 via-amber-50/80 to-amber-100/60 border border-amber-100 p-4">
                                                        <div className="relative z-10">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Alert Type</p>
                                                                <div className="p-1 bg-amber-100 rounded-lg">
                                                                    <AlertCircle className="h-3 w-3 text-amber-600" />
                                                                </div>
                                                            </div>
                                                            <p className="text-base font-bold text-amber-600 capitalize mb-1">
                                                                {selectedLead.sale_alert_type.replace('_', ' ')}
                                                            </p>
                                                            <p className="text-xs text-amber-600/70">Sales trigger</p>
                                                        </div>
                                                        <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-amber-200/30 rounded-full" />
                                                        <div className="absolute -top-1 -left-1 w-8 h-8 bg-amber-300/20 rounded-full" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Mentioned */}
                                            {selectedLead.sale_product_mentioned && (
                                                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/50 via-blue-50/30 to-cyan-50/50 border border-indigo-100">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm ring-1 ring-indigo-900/10">
                                                            <Target className="h-4 w-4 text-indigo-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="text-sm font-semibold text-indigo-900 mb-2">Product Interest Detected</h4>
                                                            <p className="text-sm font-medium text-slate-900 bg-white/60 rounded-lg px-3 py-2 border border-white/60">
                                                                "{selectedLead.sale_product_mentioned}"
                                                            </p>
                                                            <p className="text-xs text-indigo-600/70 mt-1.5">AI-identified product mention from conversation</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Conversation Toggle */}
                                            {(selectedLead.sale_visitor_message || selectedLead.sale_ai_response) && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-center">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => toggleLeadExpansion(selectedLead.id)}
                                                            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm px-4 py-1.5"
                                                        >
                                                            {expandedLeads.has(selectedLead.id) ? 
                                                                <><ChevronUp className="h-3.5 w-3.5 mr-1.5" /> Hide Conversation Details</> : 
                                                                <><ChevronDown className="h-3.5 w-3.5 mr-1.5" /> View Conversation Details</>
                                                            }
                                                        </Button>
                                                    </div>
                                                    
                                                    {expandedLeads.has(selectedLead.id) && (
                                                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
                                                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                                                                <h4 className="text-sm font-semibold text-slate-900">Conversation Transcript</h4>
                                                                <p className="text-xs text-slate-600 mt-0.5">Key interaction that generated this lead</p>
                                                            </div>
                                                            
                                                            <div className="p-4 space-y-4">
                                                                {selectedLead.sale_visitor_message && (
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex-shrink-0">
                                                                            <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center border border-slate-200">
                                                                                <Users className="h-3.5 w-3.5 text-slate-600" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Visitor Message</p>
                                                                                <div className="h-1 w-1 bg-slate-400 rounded-full"></div>
                                                                                <p className="text-xs text-slate-500">Customer inquiry</p>
                                                                            </div>
                                                                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                                                <p className="text-sm text-slate-900 leading-relaxed font-medium">
                                                                                    "{selectedLead.sale_visitor_message}"
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                {selectedLead.sale_ai_response && (
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="flex-shrink-0">
                                                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center border border-blue-200">
                                                                                <Brain className="h-3.5 w-3.5 text-blue-600" />
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">AI Assistant</p>
                                                                                <div className="h-1 w-1 bg-blue-400 rounded-full"></div>
                                                                                <p className="text-xs text-blue-500">Automated response</p>
                                                                            </div>
                                                                            <div className="bg-gradient-to-br from-blue-50/80 to-purple-50/60 rounded-lg p-3 border border-blue-100">
                                                                                <p className="text-sm text-slate-900 leading-relaxed font-medium">
                                                                                    "{selectedLead.sale_ai_response}"
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-muted/30">
                        <div className="text-center max-w-md">
                            <div className="w-20 h-20 bg-gradient-to-br from-muted via-muted/80 to-muted/60 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <UserCheck className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3 tracking-tight">Select a Lead</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Choose a lead from the sidebar to view comprehensive contact details, AI-powered insights, and conversation history.
                            </p>
                            <div className="mt-6 flex items-center justify-center space-x-2">
                                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse"></div>
                                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {leadToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={cancelDelete} />
                    
                    {/* Dialog */}
                    <div className="relative bg-card rounded-lg shadow-xl max-w-md mx-4 w-full">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center mr-4">
                                    <AlertCircle className="h-6 w-6 text-destructive" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-foreground">Delete Lead</h3>
                                    <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-sm text-foreground mb-2">
                                    Are you sure you want to delete this lead?
                                </p>
                                <div className="bg-muted rounded-lg p-3 border">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center border border-primary/20">
                                            <span className="text-primary text-xs font-semibold">
                                                {leadToDelete.name ? leadToDelete.name.charAt(0).toUpperCase() : 'L'}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {leadToDelete.name || 'Anonymous Lead'}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">{leadToDelete.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                                <Button 
                                    variant="outline" 
                                    onClick={cancelDelete}
                                    disabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="min-w-[80px]"
                                >
                                    {isDeleting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Deleting...</span>
                                        </div>
                                    ) : (
                                        'Delete'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadsPage;
