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
import { formatDistanceToNow } from 'date-fns';

const LeadsPage = () => {
    const { dbUser } = useUserContext();
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
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
            <div className="flex h-[calc(100vh-64px)] bg-gray-50 items-center justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50">
            {/* Sidebar - Lead List */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-md">
                {/* Header */}
                <div className="border-b border-gray-200 bg-gray-50/50">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                                <UserCheck className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h2 className="text-sm font-semibold text-gray-800 truncate">Lead Management</h2>
                                <p className="text-xs text-gray-500 truncate">AI-powered insights</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0 flex-shrink-0">
                            <Download className="h-3 w-3" />
                        </Button>
                    </div>
                    
                    {/* Stats Cards - Compact */}
                    <div className="px-3 pb-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
                                <div className="text-base font-bold text-blue-600 leading-none">{stats.total}</div>
                                <div className="text-[10px] text-gray-600 mt-1 leading-tight">Total Leads</div>
                            </div>
                            <div className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
                                <div className="text-base font-bold text-green-600 leading-none">{stats.converted}</div>
                                <div className="text-[10px] text-gray-600 mt-1 leading-tight">Converted</div>
                            </div>
                            <div className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
                                <div className="text-sm font-bold text-orange-600 leading-none truncate">
                                    ${stats.totalValue > 999999 ? (stats.totalValue/1000000).toFixed(1) + 'M' : 
                                      stats.totalValue > 999 ? (stats.totalValue/1000).toFixed(1) + 'K' :
                                      stats.totalValue.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-gray-600 mt-1 leading-tight">Est. Value</div>
                            </div>
                            <div className="bg-white rounded-lg p-2.5 border border-gray-100 text-center">
                                <div className="text-base font-bold text-purple-600 leading-none">{(stats.avgConfidence * 100).toFixed(0)}%</div>
                                <div className="text-[10px] text-gray-600 mt-1 leading-tight">AI Confidence</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="p-3 border-b border-gray-200 bg-white">
                    <div className="space-y-2.5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-8 text-xs border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200"
                            />
                        </div>
                        <Select value={filter} onValueChange={setFilter}>
                            <SelectTrigger className="h-8 text-xs border-gray-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200">
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
                </div>

                {/* Lead List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredLeads.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-6">
                            <div className="text-center">
                                <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm font-medium text-gray-500 mb-1">No leads found</p>
                                <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                                    {searchTerm || filter !== 'all' 
                                        ? 'Try adjusting your search or filters'
                                        : 'Leads will appear here from chat interactions'
                                    }
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    className={`group cursor-pointer transition-all duration-200 hover:bg-gray-50 relative ${
                                        selectedLead?.id === lead.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'
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
                                                    <h3 className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                                        {lead.name || 'Anonymous'}
                                                    </h3>
                                                    <Badge className={`text-[10px] px-1.5 py-0.5 ${getStatusColor(lead.lead_status)} flex-shrink-0`}>
                                                        {lead.lead_status}
                                                    </Badge>
                                                </div>
                                                <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                                                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: false })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 truncate mb-2 max-w-[220px]">{lead.email}</p>
                                            
                                            {/* Compact info badges */}
                                            <div className="flex items-center flex-wrap gap-1">
                                                {lead.company && (
                                                    <div className="flex items-center space-x-1 bg-gray-50 px-1.5 py-0.5 rounded text-[10px] max-w-[80px]">
                                                        <Building className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                                                        <span className="text-gray-600 truncate">{lead.company}</span>
                                                    </div>
                                                )}
                                                {lead.estimated_value > 0 && (
                                                    <div className="flex items-center space-x-1 bg-green-50 px-1.5 py-0.5 rounded text-[10px]">
                                                        <DollarSign className="h-2.5 w-2.5 text-green-600 flex-shrink-0" />
                                                        <span className="text-green-600 font-medium">
                                                            {parseFloat(lead.estimated_value) > 999 ? 
                                                                `$${(parseFloat(lead.estimated_value)/1000).toFixed(1)}K` : 
                                                                `$${parseFloat(lead.estimated_value).toLocaleString()}`
                                                            }
                                                        </span>
                                                    </div>
                                                )}
                                                {lead.sale_confidence_score && (
                                                    <div className="flex items-center space-x-1 bg-purple-50 px-1.5 py-0.5 rounded text-[10px]">
                                                        <Brain className="h-2.5 w-2.5 text-purple-600 flex-shrink-0" />
                                                        <span className="text-purple-600 font-medium">
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
                                                className="p-1 hover:bg-red-50 rounded transition-colors duration-200 group/delete disabled:opacity-50">
                                                <Trash className="w-3.5 h-3.5 text-gray-400 group-hover/delete:text-red-500 transition-colors duration-200" />
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
            <div className="flex-1 flex flex-col bg-white">
                {selectedLead ? (
                    <>
                        {/* Lead Header */}
                        <div className="bg-white border-b border-gray-200 shadow-sm">
                            <div className="px-6 py-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-4">
                                            {/* Lead Avatar */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200 shadow-sm">
                                                    <span className="text-blue-700 text-xl font-bold">
                                                        {selectedLead.name ? selectedLead.name.charAt(0).toUpperCase() : 'L'}
                                                    </span>
                                                </div>
                                                
                                                {/* Status Indicator */}
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                                                    selectedLead.lead_status === 'new' ? 'bg-blue-500' :
                                                    selectedLead.lead_status === 'contacted' ? 'bg-yellow-500' :
                                                    selectedLead.lead_status === 'qualified' ? 'bg-purple-500' :
                                                    selectedLead.lead_status === 'converted' ? 'bg-green-500' : 'bg-gray-400'
                                                }`} />
                                            </div>
                                            
                                            {/* Lead Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h2 className="text-xl font-semibold text-gray-900 truncate">
                                                        {selectedLead.name || 'Anonymous Lead'}
                                                    </h2>
                                                    <div className="flex items-center space-x-2">
                                                        <Badge className={`${getStatusColor(selectedLead.lead_status)} text-xs`}>
                                                            {selectedLead.lead_status}
                                                        </Badge>
                                                        {selectedLead.sale_priority && (
                                                            <Badge className={`${getPriorityColor(selectedLead.sale_priority)} text-xs`}>
                                                                {selectedLead.sale_priority}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                    <p className="truncate max-w-[300px]">{selectedLead.email}</p>
                                                    <p className="whitespace-nowrap">
                                                        Created {formatDistanceToNow(new Date(selectedLead.created_at))} ago
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    Actions
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => updateLeadStatus(selectedLead.id, 'contacted')}>
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Mark as Contacted
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateLeadStatus(selectedLead.id, 'qualified')}>
                                                    <Star className="h-4 w-4 mr-2" />
                                                    Mark as Qualified
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateLeadStatus(selectedLead.id, 'converted')}>
                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                    Mark as Converted
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => updateLeadStatus(selectedLead.id, 'lost')}>
                                                    <AlertCircle className="h-4 w-4 mr-2" />
                                                    Mark as Lost
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lead Details Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white">
                            <div className="max-w-5xl space-y-6">

                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <UserCheck className="h-5 w-5" />
                                            Lead Information
                                        </CardTitle>
                                        <CardDescription>Basic contact and lead details</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                                                    <p className="text-sm font-medium truncate">{selectedLead.email}</p>
                                                </div>
                                            </div>
                                            
                                            {selectedLead.phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs text-muted-foreground mb-1">Phone</p>
                                                        <p className="text-sm font-medium truncate">{selectedLead.phone}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedLead.company && (
                                                <div className="flex items-center gap-3">
                                                    <Building className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs text-muted-foreground mb-1">Company</p>
                                                        <p className="text-sm font-medium truncate">{selectedLead.company}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-3">
                                                <div className="flex-shrink-0">{getLeadSourceIcon(selectedLead.lead_source)}</div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-muted-foreground mb-1">Source</p>
                                                    <p className="text-sm font-medium capitalize truncate">{selectedLead.lead_source}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-muted-foreground mb-1">Created</p>
                                                    <p className="text-sm font-medium">{formatDistanceToNow(new Date(selectedLead.created_at))} ago</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-muted-foreground mb-1">Website</p>
                                                    <p className="text-sm font-medium truncate">{selectedLead.website_domain}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedLead.product_interest && (
                                            <div className="mt-4 pt-4 border-t">
                                                <div className="flex items-start gap-2">
                                                    <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-muted-foreground mb-1">Product Interest</p>
                                                        <p className="text-sm">{selectedLead.product_interest}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedLead.notes && (
                                            <div className="mt-4 pt-4 border-t">
                                                <div className="flex items-start gap-2">
                                                    <Activity className="h-4 w-4 text-muted-foreground mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
                                                        <p className="text-sm">{selectedLead.notes}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* AI Sales Analysis */}
                                {selectedLead.sale_confidence_score && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Brain className="h-5 w-5 text-purple-600" />
                                                AI Sales Insights
                                            </CardTitle>
                                            <CardDescription>AI-powered lead analysis and scoring</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                                                    <p className="text-xs text-muted-foreground mb-2">Confidence Score</p>
                                                    <p className={`text-2xl font-bold ${getConfidenceColor(selectedLead.sale_confidence_score)}`}>
                                                        {(parseFloat(selectedLead.sale_confidence_score) * 100).toFixed(0)}%
                                                    </p>
                                                </div>
                                                
                                                {selectedLead.sale_priority && (
                                                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                                                        <p className="text-xs text-muted-foreground mb-2">Priority Level</p>
                                                        <Badge className={getPriorityColor(selectedLead.sale_priority)}>
                                                            {selectedLead.sale_priority}
                                                        </Badge>
                                                    </div>
                                                )}
                                                
                                                {selectedLead.estimated_value > 0 && (
                                                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                                                        <p className="text-xs text-muted-foreground mb-2">Estimated Value</p>
                                                        <p className="text-2xl font-bold text-green-600">
                                                            ${parseFloat(selectedLead.estimated_value).toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {selectedLead.sale_alert_type && (
                                                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                                                        <p className="text-xs text-muted-foreground mb-2">Alert Type</p>
                                                        <p className="text-sm font-medium capitalize">
                                                            {selectedLead.sale_alert_type.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {selectedLead.sale_product_mentioned && (
                                                <div className="mb-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Target className="h-4 w-4 text-gray-600" />
                                                        <p className="text-sm font-medium text-gray-900">Product Mentioned</p>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{selectedLead.sale_product_mentioned}</p>
                                                </div>
                                            )}
                                            
                                            {(selectedLead.sale_visitor_message || selectedLead.sale_ai_response) && (
                                                <div className="space-y-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => toggleLeadExpansion(selectedLead.id)}
                                                        className="w-full flex items-center gap-2"
                                                    >
                                                        {expandedLeads.has(selectedLead.id) ? 
                                                            <><ChevronUp className="h-4 w-4" /> Hide Conversation</> : 
                                                            <><ChevronDown className="h-4 w-4" /> Show Conversation</>
                                                        }
                                                    </Button>
                                                    
                                                    {expandedLeads.has(selectedLead.id) && (
                                                        <div className="space-y-4 p-4 rounded-lg bg-gray-50 border border-gray-200">
                                                            {selectedLead.sale_visitor_message && (
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                                                        <Users className="h-4 w-4" />
                                                                        Visitor Message
                                                                    </p>
                                                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                                        <p className="text-sm text-gray-700">
                                                                            "{selectedLead.sale_visitor_message}"
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            {selectedLead.sale_ai_response && (
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                                                        <Brain className="h-4 w-4 text-blue-600" />
                                                                        AI Response
                                                                    </p>
                                                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                                        <p className="text-sm text-blue-800">
                                                                            "{selectedLead.sale_ai_response}"
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Lead</h3>
                            <p className="text-gray-500 max-w-sm">
                                Choose a lead from the sidebar to view detailed information and AI insights.
                            </p>
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
                    <div className="relative bg-white rounded-lg shadow-xl max-w-md mx-4 w-full">
                        <div className="p-6">
                            <div className="flex items-center mb-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Delete Lead</h3>
                                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                                </div>
                            </div>
                            
                            <div className="mb-6">
                                <p className="text-sm text-gray-700 mb-2">
                                    Are you sure you want to delete this lead?
                                </p>
                                <div className="bg-gray-50 rounded-lg p-3 border">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full flex items-center justify-center border border-blue-200">
                                            <span className="text-blue-700 text-xs font-semibold">
                                                {leadToDelete.name ? leadToDelete.name.charAt(0).toUpperCase() : 'L'}
                                            </span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {leadToDelete.name || 'Anonymous Lead'}
                                            </p>
                                            <p className="text-xs text-gray-600 truncate">{leadToDelete.email}</p>
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
