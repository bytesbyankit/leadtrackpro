import React, { useState } from 'react';
import axios from 'axios';
import {
    Send, User, Building2, Phone, Mail, MapPin,
    Briefcase, Globe, BarChart2, DollarSign,
    Calendar, FileText, CheckCircle2, TrendingUp,
    Info, AlertCircle
} from 'lucide-react';

const CALL_STATUS = ['Not Called', 'Called', 'No Answer'];
const LEAD_STATUS = ['Interested', 'Follow Up', 'Not Interested'];
const INTEREST_LEVEL = ['High', 'Medium', 'Low'];
const DEAL_STAGE = ['Lead Found', 'Contacted', 'Interested', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

const INITIAL_STATE = {
    businessName: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    industry: '',
    websiteStatus: '',
    callStatus: 'Not Called',
    leadStatus: 'Follow Up',
    interestLevel: 'Medium',
    need: '',
    budget: '',
    decisionMaker: '',
    nextAction: '',
    followUp: '',
    notes: '',
    source: '',
    dealStage: 'Lead Found',
};

function LeadForm({ onShowToast }) {
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('/api/leads', formData);
            if (response.data.success) {
                onShowToast('Lead logged successfully!', 'success');
                setFormData(INITIAL_STATE);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.errors?.[0]?.msg || 'Failed to log lead';
            onShowToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-5 md:p-6 space-y-6">
                            <Header title="Identity & Contact" icon={Building2} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Business Name" name="businessName" value={formData.businessName} onChange={handleChange} required placeholder="Acme Inc." />
                                <Input label="Contact Person" name="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="Sarah Connor" />
                                <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+1 (555) 000-0000" />
                                <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="sarah@acme.com" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Boston" />
                                <Input label="Industry" name="industry" value={formData.industry} onChange={handleChange} placeholder="Fintech" />
                                <Input label="Source" name="source" value={formData.source} onChange={handleChange} placeholder="LinkedIn" />
                            </div>
                        </div>

                        <div className="card p-5 md:p-6 space-y-6">
                            <Header title="Opportunity Details" icon={BarChart2} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Specific Need" name="need" value={formData.need} onChange={handleChange} placeholder="ERP Upgrade" />
                                <Input label="Budget Range" name="budget" value={formData.budget} onChange={handleChange} placeholder="$10k - $50k" />
                                <Input label="Decision Maker" name="decisionMaker" value={formData.decisionMaker} onChange={handleChange} placeholder="CTO" />
                                <Input label="Next Step" name="nextAction" value={formData.nextAction} onChange={handleChange} placeholder="Send proposal" />
                            </div>
                            <TextArea label="Context & Internal Notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} placeholder="Describe the conversation..." />
                        </div>
                    </div>

                    {/* Sidebar Section */}
                    <div className="space-y-6">
                        <div className="card p-5 md:p-6 space-y-6 bg-brand-600/[0.02] border-brand-500/10">
                            <Header title="Status & Rating" icon={TrendingUp} />
                            <Select label="Sales Stage" name="dealStage" value={formData.dealStage} onChange={handleChange} options={DEAL_STAGE} />
                            <Select label="Lead Interest" name="leadStatus" value={formData.leadStatus} onChange={handleChange} options={LEAD_STATUS} />
                            <Select label="Priority" name="interestLevel" value={formData.interestLevel} onChange={handleChange} options={INTEREST_LEVEL} />
                            <Select label="Call Activity" name="callStatus" value={formData.callStatus} onChange={handleChange} options={CALL_STATUS} />
                            <Input label="Follow Up Date" type="date" name="followUp" value={formData.followUp} onChange={handleChange} />
                        </div>

                        <div className="card p-4 bg-amber-500/5 border-amber-500/10 flex gap-3">
                            <Info className="text-amber-500 shrink-0" size={18} />
                            <p className="text-[11px] font-medium text-amber-500/80 uppercase tracking-tight leading-relaxed">
                                Ensure all business details are verified before moving to 'Proposal Sent'.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 bg-surface-base/90 backdrop-blur-xl border-t border-border-main p-4 z-40">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-text-muted text-sm font-medium order-2 sm:order-1">
                            <AlertCircle size={16} />
                            <span>Draft auto-saved locally</span>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full sm:w-auto px-8 py-3 sm:py-2.5 order-1 sm:order-2 flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                'Processing...'
                            ) : (
                                <>
                                    <Send size={18} />
                                    <span>Create Lead Entry</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

const Header = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 border-b border-border-main pb-3 mb-2">
        <Icon className="text-brand-500" size={18} strokeWidth={2.5} />
        <h3 className="text-sm font-bold uppercase tracking-widest text-text-subtle">{title}</h3>
    </div>
);

const Input = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="label-text">{label}</label>
        <input className="input-field px-3 py-2.5 text-sm" {...props} />
    </div>
);

const Select = ({ label, options, ...props }) => (
    <div className="space-y-1.5">
        <label className="label-text">{label}</label>
        <select className="input-field cursor-pointer text-sm" {...props}>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const TextArea = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="label-text">{label}</label>
        <textarea className="input-field resize-none text-sm" {...props} />
    </div>
);

export default LeadForm;
