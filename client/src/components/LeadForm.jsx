import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api';
import {
    Send, User, Building2, Phone, Mail, MapPin,
    Briefcase, Globe, BarChart2, DollarSign,
    Calendar, FileText, CheckCircle2, TrendingUp,
    Info, AlertCircle, Save, Paperclip, Mic, CalendarDays,
    Check, AlertTriangle, ChevronRight, Zap, Sparkles
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CALL_STATUS = ['Not Called', 'Called', 'No Answer'];
const LEAD_STATUS = ['Interested', 'Follow Up', 'Not Interested'];
const INTEREST_LEVEL = ['High', 'Medium', 'Low'];
const DEAL_STAGE = ['Lead Found', 'Contacted', 'Interested', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

const INDUSTRY_SUGGESTIONS = ['Fintech', 'Healthcare', 'SaaS', 'E-commerce', 'Education', 'Manufacturing', 'Real Estate', 'Logistics', 'Media', 'Consulting'];
const SOURCE_SUGGESTIONS = ['LinkedIn', 'Referral', 'Cold Call', 'Website', 'Event', 'Google Ads', 'Email Campaign', 'Partner'];

const NEXT_ACTION_SUGGESTIONS = {
    'Lead Found': 'Schedule discovery call',
    'Contacted': 'Send follow-up email',
    'Interested': 'Prepare detailed proposal',
    'Proposal Sent': 'Follow up on proposal',
    'Negotiation': 'Finalize contract terms',
    'Won': 'Onboard client',
    'Lost': 'Archive lead'
};

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

const NOTES_STRUCTURED_PROMPT = `Summary of conversation
• Pain points: 
• Budget discussion: 
• Timeline: 
• Decision authority: `;

// ─── Validation helpers ───────────────────────────────────────────────────────
const validateField = (name, value) => {
    switch (name) {
        case 'businessName':
            return value.trim() ? '' : 'Business Name is required';
        case 'phone':
            if (!value.trim()) return 'Phone Number is required';
            return /^[\d\s+\-()]{7,20}$/.test(value) ? '' : 'Enter a valid phone number';
        case 'email':
            if (!value.trim()) return ''; // Optional
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address';
        default:
            return '';
    }
};

const extractDomain = (email) => {
    if (!email || !email.includes('@')) return null;
    const domain = email.split('@')[1];
    if (!domain || !domain.includes('.')) return null;

    // Simple logic to extract company name from domain (e.g. acme.com -> Acme)
    const company = domain.split('.')[0];
    return { domain, company: company.charAt(0).toUpperCase() + company.slice(1) };
};

// ─── Main Component ───────────────────────────────────────────────────────────
function LeadForm({ onShowToast }) {
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(false);
    const [touched, setTouched] = useState({});
    const [errors, setErrors] = useState({});
    const [lastSaved, setLastSaved] = useState(null);
    const [saveCounter, setSaveCounter] = useState(0);
    const formRef = useRef(null);

    // Auto-save draft simulation
    useEffect(() => {
        const hasData = Object.values(formData).some(v => v && v !== INITIAL_STATE[Object.keys(INITIAL_STATE).find(k => INITIAL_STATE[k] === v)]);
        if (hasData) {
            const timer = setTimeout(() => {
                setLastSaved(new Date());
                setSaveCounter(prev => prev + 1);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [formData]);

    // Relative time display for auto-save
    const [timeDisplay, setTimeDisplay] = useState('');
    useEffect(() => {
        if (!lastSaved) return;
        const update = () => {
            const diff = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
            if (diff < 5) setTimeDisplay('just now');
            else if (diff < 60) setTimeDisplay(`${diff}s ago`);
            else setTimeDisplay(`${Math.floor(diff / 60)}m ago`);
        };
        update();
        const interval = setInterval(update, 15000);
        return () => clearInterval(interval);
    }, [lastSaved, saveCounter]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };

            // Contextual Suggestion: If stage changes, suggest Next Action
            if (name === 'dealStage' && !prev.nextAction) {
                newState.nextAction = NEXT_ACTION_SUGGESTIONS[value] || '';
            }

            return newState;
        });

        // Live validation for touched fields
        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    }, [touched]);

    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all required fields
        const requiredFields = ['businessName', 'phone'];
        const newErrors = {};
        const newTouched = {};
        let hasError = false;

        requiredFields.forEach(field => {
            newTouched[field] = true;
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
                hasError = true;
            }
        });

        // Also validate email if filled
        if (formData.email) {
            newTouched.email = true;
            const emailError = validateField('email', formData.email);
            if (emailError) {
                newErrors.email = emailError;
                hasError = true;
            }
        }

        setTouched(prev => ({ ...prev, ...newTouched }));
        setErrors(prev => ({ ...prev, ...newErrors }));

        if (hasError) {
            onShowToast('Missing required fields: ' + Object.keys(newErrors).map(f => f === 'businessName' ? 'Business Name' : 'Phone').join(', '), 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/api/leads', formData);
            if (response.data.success) {
                onShowToast('Lead logged successfully!', 'success');
                setFormData(INITIAL_STATE);
                setTouched({});
                setErrors({});
                setLastSaved(null);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.errors?.[0]?.msg || 'Failed to log lead';
            onShowToast(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const applyDomainSuggestion = (companyName) => {
        setFormData(prev => ({ ...prev, businessName: companyName }));
        setTouched(prev => ({ ...prev, businessName: true }));
        setErrors(prev => ({ ...prev, businessName: '' }));
    };

    const domainInfo = extractDomain(formData.email);
    const showSmartSuggestion = domainInfo && !formData.businessName;
    const showProposalWarning = formData.dealStage === 'Proposal Sent';

    return (
        <div className="max-w-5xl mx-auto" ref={formRef}>
            <form onSubmit={handleSubmit} className="pb-12">
                {/* ─── Header & Action Bar ─── */}
                <div className="task-bar-sticky flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-text-main tracking-tight">
                                {formData.businessName || 'New Lead Entry'}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] font-medium text-text-muted">
                                <span className="inline-flex items-center gap-1.5 text-brand-600 bg-brand-50/80 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider text-[10px]">
                                    <Zap size={10} fill="currentColor" /> Live Workflow
                                </span>
                                <span className="text-border-main">•</span>
                                <span className="flex items-center gap-1.5">
                                    {lastSaved ? (
                                        <><CheckCircle2 size={12} className="text-success-500" /> Draft saved {timeDisplay}</>
                                    ) : (
                                        <><div className="w-1.5 h-1.5 rounded-full bg-border-main animate-pulse" /> Draft: Waiting for input</>
                                    )}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center sm:justify-end pb-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary px-6 py-2.5 shadow-lg shadow-brand-500/20 active:scale-95 transition-all whitespace-nowrap w-full sm:w-auto"
                            >
                                {loading ? 'Processing…' : <><Save size={16} /> <span>Save Lead</span></>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* ═══════════════════════════════════════════════════════════
                        LEFT PANEL — Lead Information (3/5 width)
                    ═══════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* ─── Contact Details ─── */}
                        <section>
                            <div className="mb-4">
                                <h3 className="section-header">Contact Information</h3>
                                <p className="section-description">How we identify and reach this lead.</p>
                            </div>
                            <div className="section-card space-y-8">

                                {/* Company Sub-group */}
                                <div>
                                    <h4 className="text-xs font-semibold text-text-subtle uppercase tracking-widest mb-4 flex items-center gap-2"><Building2 size={14} className="text-text-muted" /> Company Details</h4>
                                    <div className="grid grid-cols-1 gap-6">
                                        <ValidatedInput
                                            label="Business Name"
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            placeholder="Acme Inc."
                                            error={errors.businessName}
                                            touched={touched.businessName}
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-border-subtle/50" />

                                {/* Contact Sub-group */}
                                <div>
                                    <h4 className="text-xs font-semibold text-text-subtle uppercase tracking-widest mb-4 flex items-center gap-2"><User size={14} className="text-text-muted" /> Primary Contact</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                        <div className="md:col-span-2">
                                            <ValidatedInput
                                                label="Contact Person"
                                                name="contactPerson"
                                                value={formData.contactPerson}
                                                onChange={handleChange}
                                                placeholder="Sarah Connor"
                                            />
                                        </div>
                                        <ValidatedInput
                                            label="Email Address"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="sarah@acme.com"
                                            error={errors.email}
                                            touched={touched.email}
                                            hint={domainInfo && !showSmartSuggestion ? `Domain: ${domainInfo.domain}` : null}
                                        />
                                        <ValidatedInput
                                            label="Phone Number"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            required
                                            placeholder="+1 (555) 000-0000"
                                            error={errors.phone}
                                            touched={touched.phone}
                                        />

                                        {/* Smart Assistance Button under Email if applicable */}
                                        {showSmartSuggestion && (
                                            <div className="md:col-span-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                                <button
                                                    type="button"
                                                    onClick={() => applyDomainSuggestion(domainInfo.company)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-brand-50 text-brand-700 text-xs font-semibold hover:bg-brand-100 transition-colors border border-brand-200"
                                                >
                                                    <Sparkles size={14} className="text-brand-500" />
                                                    Apply "{domainInfo.company}" as Company Name
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ─── Company & Opportunity ─── */}
                        <section>
                            <div className="mb-4">
                                <h3 className="section-header">Company & Opportunity</h3>
                                <p className="section-description">Qualifying the lead and understanding their needs.</p>
                            </div>
                            <div className="section-card">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6">
                                    <DatalistInput
                                        label="Industry"
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        placeholder="Fintech"
                                        suggestions={INDUSTRY_SUGGESTIONS}
                                    />
                                    <ValidatedInput
                                        label="City"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        placeholder="Boston"
                                    />
                                    <DatalistInput
                                        label="Source"
                                        name="source"
                                        value={formData.source}
                                        onChange={handleChange}
                                        placeholder="LinkedIn"
                                        suggestions={SOURCE_SUGGESTIONS}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 pt-6 mt-6 border-t border-border-subtle/50">
                                    <ValidatedInput
                                        label="Specific Need"
                                        name="need"
                                        value={formData.need}
                                        onChange={handleChange}
                                        placeholder="ERP Upgrade"
                                    />
                                    <ValidatedInput
                                        label="Budget Range"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleChange}
                                        placeholder="₹10k - ₹50k"
                                    />
                                    <div className="md:col-span-2">
                                        <ValidatedInput
                                            label="Decision Maker Role"
                                            name="decisionMaker"
                                            value={formData.decisionMaker}
                                            onChange={handleChange}
                                            placeholder="CTO or Finance Head"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ─── Conversation Notes Workspace ─── */}
                        <section>
                            <div className="mb-4">
                                <h3 className="section-header">Conversation Workspace</h3>
                                <p className="section-description">Detailed notes to recall context during follow-ups.</p>
                            </div>
                            <div className="workspace-card">
                                <textarea
                                    className="w-full bg-transparent resize-none text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none leading-relaxed min-h-[180px]"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={10}
                                    placeholder={NOTES_STRUCTURED_PROMPT}
                                />
                                <div className="flex flex-wrap gap-2.5 pt-5 border-t border-border-subtle/50 mt-4">
                                    <button type="button" className="action-hint-btn">
                                        <Paperclip /> <span>Attach Document</span>
                                    </button>
                                    <button type="button" className="action-hint-btn">
                                        <Mic /> <span>Record Voice Summary</span>
                                    </button>
                                    <button type="button" className="action-hint-btn">
                                        <CalendarDays /> <span>Schedule Meeting</span>
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════
                        RIGHT PANEL — Guided Sales Workflow (2/5 width)
                    ═══════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-2">
                        {/* Make the panel sticky, offset by the height of the sticky task bar (approx 100px) */}
                        <div className="lg:sticky lg:top-[120px] space-y-4">
                            <div className="card p-5 sm:p-6 border-border-subtle bg-surface-soft/40 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="text-brand-500" size={18} strokeWidth={2.5} />
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-text-main">Guided Workflow</h3>
                                    </div>
                                    <span className="text-[10px] font-black text-brand-500/40 uppercase tracking-tighter">Phase 1</span>
                                </div>

                                <div className="workflow-container">
                                    <div className="workflow-line" />

                                    {/* Step 1 */}
                                    <WorkflowStep number={1} label="Current Stage" hint="Where is this deal in the pipeline?" active={true}>
                                        <select
                                            className="input-field-borderless font-semibold min-h-[44px]"
                                            name="dealStage"
                                            value={formData.dealStage}
                                            onChange={handleChange}
                                        >
                                            {DEAL_STAGE.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </WorkflowStep>

                                    {/* Step 2 */}
                                    <WorkflowStep number={2} label="Interest Level" hint="Prospect appetite for the solution.">
                                        <select
                                            className="input-field-borderless font-semibold min-h-[44px]"
                                            name="leadStatus"
                                            value={formData.leadStatus}
                                            onChange={handleChange}
                                        >
                                            {LEAD_STATUS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </WorkflowStep>

                                    {/* Step 3 */}
                                    <WorkflowStep number={3} label="Priority" hint="Urgency of the next action.">
                                        <select
                                            className="input-field-borderless font-semibold min-h-[44px]"
                                            name="interestLevel"
                                            value={formData.interestLevel}
                                            onChange={handleChange}
                                        >
                                            {INTEREST_LEVEL.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </WorkflowStep>

                                    {/* Step 4 */}
                                    <WorkflowStep number={4} label="Call Activity" hint="Log if a touchpoint happened.">
                                        <select
                                            className="input-field-borderless font-semibold min-h-[44px]"
                                            name="callStatus"
                                            value={formData.callStatus}
                                            onChange={handleChange}
                                        >
                                            {CALL_STATUS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                        </select>
                                    </WorkflowStep>

                                    {/* Step 5 */}
                                    <WorkflowStep number={5} label="Next Action" hint="What is the very next task?" active={!!formData.nextAction}>
                                        <div className="relative group">
                                            <input
                                                className="input-field-borderless font-semibold pr-8"
                                                name="nextAction"
                                                value={formData.nextAction}
                                                onChange={handleChange}
                                                placeholder="What should happen next?"
                                            />
                                            <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 text-border-main group-hover:text-brand-500 transition-colors" size={14} />
                                        </div>
                                    </WorkflowStep>

                                    {/* Step 6 */}
                                    <WorkflowStep number={6} label="Follow-up Date" hint="Scheduling the next touchpoint." active={!!formData.followUp} last>
                                        <input
                                            className="input-field-borderless font-semibold"
                                            type="date"
                                            name="followUp"
                                            value={formData.followUp}
                                            onChange={handleChange}
                                        />
                                    </WorkflowStep>
                                </div>

                                {/* Conditional validation alert */}
                                {showProposalWarning && (
                                    <div className="animate-slide-in mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
                                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                        <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 leading-relaxed uppercase tracking-tight">
                                            CRITICAL: Verify Business Tax ID and Budget approval prior to 'Proposal Sent'.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const WorkflowStep = ({ number, label, hint, children, last, active }) => (
    <div className={`relative py-[10px] ${active ? 'workflow-step-active' : ''} ${last ? '' : 'border-b border-border-subtle'}`}>
        <div className="flex items-start gap-4">
            <span className="workflow-step-number mt-0.5">{number}</span>
            <div className="flex-1 space-y-1.5">
                <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">{label}</label>
                <div className="bg-surface-soft/50 rounded-lg focus-within:bg-surface-base hover:bg-surface-base transition-colors group">
                    {children}
                </div>
                {hint && <p className="text-[10px] text-text-muted/60 font-medium pl-1 italic">{hint}</p>}
            </div>
        </div>
    </div>
);

const ValidatedInput = ({ label, required, error, touched: isTouched, hint, ...props }) => {
    const hasError = isTouched && error;
    const isValid = isTouched && !error && props.value;
    const validationClass = hasError ? 'validation-error' : isValid ? 'validation-success' : '';

    return (
        <div className="space-y-1.5 flex-1">
            <div className="flex justify-between items-center px-0.5">
                <label className={`text-[11px] font-bold text-text-subtle uppercase tracking-wider ${required ? 'label-required' : ''}`}>
                    {label}
                </label>
            </div>
            <div className="relative group flex items-center">
                <input className={`input-field-borderless w-full bg-surface-base border border-border-subtle hover:border-border-main focus:bg-surface-base focus:border-brand-500 shadow-sm ${validationClass}`} {...props} />
                {hasError && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500 pointer-events-none">
                        <AlertTriangle size={15} />
                    </span>
                )}
                {isValid && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500 pointer-events-none">
                        <Check size={15} />
                    </span>
                )}
            </div>
            {hasError && (
                <p className="validation-msg error"><AlertTriangle size={12} /> {error}</p>
            )}
            {isValid && !hasError && hint && (
                <p className="validation-msg success text-brand-500"><Building2 size={12} /> {hint}</p>
            )}
        </div>
    );
};

const DatalistInput = ({ label, suggestions, name, ...props }) => (
    <div className="space-y-1.5 flex-1">
        <label className="text-[11px] font-bold text-text-subtle uppercase tracking-wider">{label}</label>
        <div className="relative group">
            <input className="input-field-borderless w-full bg-surface-base border border-border-subtle hover:border-border-main focus:bg-surface-base focus:border-brand-500 shadow-sm" name={name} list={`${name}-list`} {...props} />
            <datalist id={`${name}-list`}>
                {suggestions.map(s => <option key={s} value={s} />)}
            </datalist>
        </div>
    </div>
);

export default LeadForm;
