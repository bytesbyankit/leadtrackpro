import React from 'react';
import { X, Building2, User, Phone, Mail, MapPin, Target, Briefcase, DollarSign, Activity, FileText, Calendar } from 'lucide-react';

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

function LeadDetailsModal({ lead, onClose, onUpdate }) {
    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState({});
    const [isSaving, setIsSaving] = React.useState(false);

    React.useEffect(() => {
        if (lead) {
            setFormData(lead);
            setIsEditing(false);
        }
    }, [lead]);

    if (!lead) return null;

    const handleSave = async () => {
        if (!onUpdate) return;
        setIsSaving(true);
        try {
            await onUpdate(lead.id, formData);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save updates', error);
        } finally {
            setIsSaving(false);
        }
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
                {status || 'Unknown'}
            </span>
        );
    };

    const DetailSection = ({ icon: Icon, title, children }) => (
        <div className="bg-surface-sunken rounded-xl p-5 border border-border-main space-y-4">
            <h3 className="text-sm font-bold text-text-main flex items-center gap-2 uppercase tracking-wider">
                <Icon size={16} className="text-brand-500" />
                {title}
            </h3>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );

    const DetailRow = ({ label, value, field }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 pb-3 border-b border-border-main/50 last:border-0 last:pb-0">
            <span className="text-sm font-medium text-text-muted">{label}</span>
            {isEditing && field ? (
                <input
                    type="text"
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="input-field py-1 px-2 text-sm text-right bg-surface-base border border-border-main w-full sm:w-1/2 focus:ring-brand-500/20"
                    placeholder={`Enter ${label.toLowerCase()}`}
                />
            ) : (
                <span className="text-sm font-semibold text-text-main text-right break-words">{value || '—'}</span>
            )}
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Sliding Panel */}
            <div className="relative w-full max-w-2xl bg-surface-base h-full shadow-2xl flex flex-col animate-slide-in-right transform transition-transform border-l border-border-main">

                {/* Header */}
                <header className="px-6 py-5 border-b border-border-main flex items-center justify-between bg-surface-soft shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-surface-sunken rounded-xl flex items-center justify-center border border-border-main shadow-inner">
                            <Building2 size={24} className="text-brand-500" />
                        </div>
                        <div>
                            {isEditing ? (
                                <input
                                    className="text-xl font-bold bg-surface-base border border-brand-500/50 rounded px-2 py-1 w-full text-text-main focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                                    value={formData.businessName || ''}
                                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                                    placeholder="Business Name"
                                />
                            ) : (
                                <h2 className="text-xl font-bold text-text-main leading-tight">{lead.businessName || 'Unnamed Business'}</h2>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                                {isEditing ? (
                                    <input
                                        className="text-sm border border-border-main px-2 py-0.5 rounded-md bg-surface-base text-text-subtle focus:outline-none focus:border-brand-500/50 w-24"
                                        value={formData.dealStage || ''}
                                        onChange={(e) => setFormData({ ...formData, dealStage: e.target.value })}
                                        placeholder="Stage"
                                    />
                                ) : (
                                    <span className="text-sm text-text-subtle">{lead.dealStage || 'New Lead'}</span>
                                )}
                                <span className="w-1 h-1 rounded-full bg-border-strong"></span>
                                <span className="text-xs font-medium text-text-muted">ID: {lead.id}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface-sunken rounded-lg text-text-muted hover:text-text-main transition-colors"
                    >
                        <X size={20} />
                    </button>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    {/* Status Badges Row */}
                    <div className="flex flex-wrap gap-2">
                        <StatusBadge status={lead.leadStatus} />
                        <StatusBadge status={lead.dealStage} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Contact Information */}
                        <DetailSection icon={User} title="Contact Info">
                            <DetailRow label="Primary Contact" value={lead.contactPerson} field="contactPerson" />
                            <DetailRow label="Email Address" value={lead.email} field="email" />
                            <DetailRow label="Phone Number" value={lead.phone} field="phone" />
                            <DetailRow label="Decision Maker" value={lead.decisionMaker} field="decisionMaker" />
                        </DetailSection>

                        {/* Company Profile */}
                        <DetailSection icon={Building2} title="Company Profile">
                            <DetailRow label="Industry" value={lead.industry} field="industry" />
                            <DetailRow label="Location" value={lead.city} field="city" />
                            <DetailRow label="Lead Source" value={lead.source} field="source" />
                            <DetailRow label="Website Status" value={lead.websiteStatus} field="websiteStatus" />
                        </DetailSection>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Engagement & Needs */}
                        <DetailSection icon={Target} title="Engagement Details">
                            <DetailRow label="Interest Level" value={lead.interestLevel} field="interestLevel" />
                            <DetailRow label="Primary Need" value={lead.need} field="need" />
                            <DetailRow label="Estimated Budget" value={lead.budget} field="budget" />
                            <DetailRow label="Call Status" value={lead.callStatus} field="callStatus" />
                        </DetailSection>

                        {/* Next Steps */}
                        <DetailSection icon={Activity} title="Next Steps">
                            <DetailRow label="Action Required" value={lead.nextAction} field="nextAction" />
                            <DetailRow label="Follow Up Date" value={lead.followUp} field="followUp" />
                            <DetailRow label="Created On" value={new Date(lead.createdAt).toLocaleDateString()} field={null} />
                        </DetailSection>
                    </div>

                    {/* Notes Section */}
                    {(lead.notes || isEditing) && (
                        <div className="bg-surface-sunken rounded-xl p-5 border border-border-main space-y-3">
                            <h3 className="text-sm font-bold text-text-main flex items-center gap-2 uppercase tracking-wider">
                                <FileText size={16} className="text-brand-500" />
                                General Notes
                            </h3>
                            {isEditing ? (
                                <textarea
                                    className="input-field w-full h-32 text-sm resize-none"
                                    value={formData.notes || ''}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Enter detailed notes here..."
                                />
                            ) : (
                                <div className="text-sm text-text-subtle whitespace-pre-wrap leading-relaxed bg-surface-base p-4 rounded-lg border border-border-main/50">
                                    {lead.notes}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <footer className="px-6 py-4 border-t border-border-main flex items-center justify-end gap-3 bg-surface-soft shrink-0">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => { setIsEditing(false); setFormData(lead); }}
                                className="btn-secondary"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="btn-primary"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-500/10 text-brand-500 border border-brand-500/20 rounded-lg text-sm font-bold hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-all"
                            >
                                Edit Details
                            </button>
                            <button
                                onClick={onClose}
                                className="btn-secondary"
                            >
                                Close
                            </button>
                        </>
                    )}
                </footer>

            </div>
        </div>
    );
}

export default LeadDetailsModal;
