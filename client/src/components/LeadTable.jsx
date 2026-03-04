import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import {
    Search, Loader2, Building2, Phone,
    ChevronRight, MoreVertical, ExternalLink,
    Filter, Download, Calendar
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

function LeadTable() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredLeads = leads.filter(lead =>
        lead.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 bg-surface-base border border-border-main text-text-subtle rounded-lg text-sm font-medium hover:bg-surface-soft transition-all">
                        <Filter size={14} /> Filters
                    </button>
                    <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3 py-2 bg-surface-base border border-border-main text-text-subtle rounded-lg text-sm font-medium hover:bg-surface-soft transition-all">
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
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-1 hover:bg-surface-soft rounded transition-colors text-text-muted hover:text-text-main">
                                            <MoreVertical size={16} />
                                        </button>
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
        </div>
    );
}

export default LeadTable;
