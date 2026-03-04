import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import {
    Search, Loader2, Building2, Phone,
    ChevronRight, MoreVertical, ExternalLink,
    Filter, Download, Calendar
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import LeadDetailsModal from './LeadDetailsModal';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

function LeadTable() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);

    // Filters and Export
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterStage, setFilterStage] = useState('All');

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.action-dropdown-container')) {
                setActiveDropdown(null);
            }
            if (!e.target.closest('.filter-dropdown-container')) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    useEffect(() => { fetchLeads(); }, []);

    const fetchLeads = async () => {
        try {
            const response = await api.get('/api/leads');
            setLeads(response.data.leads || []);
        } catch (error) {
            console.error('Fetch error', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLeads = leads.filter(lead => {
        const matchesSearch = lead.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || lead.leadStatus === filterStatus;
        const matchesStage = filterStage === 'All' || lead.dealStage === filterStage;

        return matchesSearch && matchesStatus && matchesStage;
    });

    const handleExport = () => {
        if (filteredLeads.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = ["ID", "Business Name", "Contact Person", "Email", "Phone", "Lead Status", "Deal Stage", "Created At"];
        const csvRows = [];

        csvRows.push(headers.join(','));

        for (const lead of filteredLeads) {
            const values = [
                lead.id,
                `"${lead.businessName || ''}"`,
                `"${lead.contactPerson || ''}"`,
                `"${lead.email || ''}"`,
                `"${lead.phone || ''}"`,
                `"${lead.leadStatus || ''}"`,
                `"${lead.dealStage || ''}"`,
                `"${new Date(lead.createdAt).toLocaleDateString()}"`
            ];
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleUpdateLead = async (id, updates) => {
        try {
            await api.patch(`/api/leads/${id}`, updates);
            setLeads(leads.map(lead => lead.id === id ? { ...lead, ...updates } : lead));
            if (selectedLead && selectedLead.id === id) {
                setSelectedLead(prev => ({ ...prev, ...updates }));
            }
        } catch (error) {
            console.error('Update error', error);
        }
        setActiveDropdown(null);
    };

    const handleDeleteLead = async (id) => {
        if (!window.confirm("Are you sure you want to delete this lead?")) {
            setActiveDropdown(null);
            return;
        }
        try {
            await api.delete(`/api/leads/${id}`);
            setLeads(leads.filter(lead => lead.id !== id));
        } catch (error) {
            console.error('Delete error', error);
        }
        setActiveDropdown(null);
    };


    const StatusBadge = ({ status }) => {
        const variants = {
            'Interested': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            'Won': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            'Follow Up': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            'Called': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
            'Not Interested': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            'Lost': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
            'Lead Found': 'bg-surface-sunken text-text-muted border-border-main',
        };
        return (
            <span className={cn("badge", variants[status] || "bg-surface-sunken text-text-muted border-border-main")}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 size={32} className="animate-spin text-brand-500" />
                <span className="text-text-muted font-semibold tracking-wider uppercase text-xs">Accessing Data Layer...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Table Actions */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Search pipeline..."
                        className="input-field pl-10 h-10 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative filter-dropdown-container flex-1 sm:flex-none">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={cn(
                                "w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-surface-base border border-border-main text-text-subtle rounded-lg text-sm font-medium hover:bg-surface-soft transition-all",
                                (filterStatus !== 'All' || filterStage !== 'All') && "bg-brand-500/10 text-brand-500 border-brand-500/20"
                            )}>
                            <Filter size={14} />
                            {(filterStatus !== 'All' || filterStage !== 'All') ? 'Filtered' : 'Filters'}
                        </button>

                        {isFilterOpen && (
                            <div className="absolute right-0 top-full mt-2 w-64 bg-surface-base border border-border-main rounded-xl shadow-xl p-4 z-20 animate-fade-in-up">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Lead Status</label>
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            className="w-full text-sm bg-surface-sunken border border-border-main rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-brand-500"
                                        >
                                            <option value="All">All Statuses</option>
                                            <option value="Lead Found">Lead Found</option>
                                            <option value="Interested">Interested</option>
                                            <option value="Not Interested">Not Interested</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Deal Stage</label>
                                        <select
                                            value={filterStage}
                                            onChange={(e) => setFilterStage(e.target.value)}
                                            className="w-full text-sm bg-surface-sunken border border-border-main rounded-lg px-3 py-2 text-text-main focus:outline-none focus:border-brand-500"
                                        >
                                            <option value="All">All Stages</option>
                                            <option value="Follow Up">Follow Up</option>
                                            <option value="Called">Called</option>
                                            <option value="Won">Won</option>
                                            <option value="Lost">Lost</option>
                                        </select>
                                    </div>
                                    <div className="pt-2 border-t border-border-main flex justify-end">
                                        <button
                                            onClick={() => {
                                                setFilterStatus('All');
                                                setFilterStage('All');
                                                setIsFilterOpen(false);
                                            }}
                                            className="text-xs font-semibold text-text-muted hover:text-text-main transition-colors"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 bg-surface-base border border-border-main text-text-subtle rounded-lg text-sm font-medium hover:bg-surface-soft transition-all"
                    >
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left min-w-[600px] md:min-w-full">
                        <thead className="bg-surface-soft border-b border-border-main">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Entity</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider">Point of Contact</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-center">Engagement</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-center">Stage</th>
                                <th className="px-6 py-4 text-xs font-bold text-text-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-main/50">
                            {filteredLeads.map((lead, i) => (
                                <tr key={i} className="group hover:bg-brand-500/[0.02] transition-colors cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-surface-sunken rounded-lg flex items-center justify-center group-hover:bg-brand-500/10 transition-colors">
                                                <Building2 size={16} className="text-text-muted group-hover:text-brand-500" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-text-main group-hover:text-brand-400 transition-colors">{lead.businessName}</div>
                                                <div className="text-[11px] text-text-muted font-medium inline-flex items-center gap-1">
                                                    {lead.city || 'Location N/A'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-text-subtle">{lead.contactPerson || '—'}</div>
                                        <div className="text-[11px] text-text-muted mt-0.5">{lead.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge status={lead.leadStatus} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <StatusBadge status={lead.dealStage} />
                                    </td>
                                    <td className="px-6 py-4 text-right relative action-dropdown-container">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdown(activeDropdown === lead.id ? null : lead.id);
                                            }}
                                            className="p-1 hover:bg-surface-soft rounded transition-colors text-text-muted hover:text-text-main"
                                        >
                                            <MoreVertical size={16} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {activeDropdown === lead.id && (
                                            <div
                                                className="absolute right-6 top-10 w-48 bg-surface-base border border-border-main rounded-lg shadow-lg py-1 z-10 text-left"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <button
                                                    onClick={() => {
                                                        setSelectedLead(lead);
                                                        setActiveDropdown(null);
                                                    }}
                                                    className="w-full px-4 py-2 text-sm text-text-main hover:bg-surface-soft flex items-center gap-2 transition-colors"
                                                >
                                                    <ExternalLink size={14} /> View Details
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateLead(lead.id, { leadStatus: 'Won', dealStage: 'Won' })}
                                                    className="w-full px-4 py-2 text-sm text-text-main hover:bg-surface-soft flex items-center gap-2 transition-colors"
                                                >
                                                    Mark as Won
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateLead(lead.id, { leadStatus: 'Lost', dealStage: 'Lost' })}
                                                    className="w-full px-4 py-2 text-sm text-text-main hover:bg-surface-soft flex items-center gap-2 transition-colors"
                                                >
                                                    Mark as Lost
                                                </button>
                                                <div className="h-px bg-border-main my-1"></div>
                                                <button
                                                    onClick={() => handleDeleteLead(lead.id)}
                                                    className="w-full px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                                                >
                                                    Delete Lead
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {filteredLeads.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <Building2 size={40} strokeWidth={1} />
                                            <p className="font-semibold text-sm">No business entities found in pipeline.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lead Details Modal */}
            <LeadDetailsModal
                lead={selectedLead}
                onClose={() => setSelectedLead(null)}
                onUpdate={handleUpdateLead}
            />
        </div>
    );
}

export default LeadTable;
