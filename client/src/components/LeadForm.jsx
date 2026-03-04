import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../lib/api';
import {
    Send, User, Building2, Phone, Mail, MapPin,
    Briefcase, Globe, BarChart2, DollarSign,
    Calendar, FileText, CheckCircle2, TrendingUp,
    Info, AlertCircle, Save, Paperclip, Mic, CalendarDays,
    Check, AlertTriangle, ChevronRight
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const CALL_STATUS = ['Not Called', 'Called', 'No Answer'];
const LEAD_STATUS = ['Interested', 'Follow Up', 'Not Interested'];
const INTEREST_LEVEL = ['High', 'Medium', 'Low'];
const DEAL_STAGE = ['Lead Found', 'Contacted', 'Interested', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

const INDUSTRY_SUGGESTIONS = ['Fintech', 'Healthcare', 'SaaS', 'E-commerce', 'Education', 'Manufacturing', 'Real Estate', 'Logistics', 'Media', 'Consulting'];
const SOURCE_SUGGESTIONS = ['LinkedIn', 'Referral', 'Cold Call', 'Website', 'Event', 'Google Ads', 'Email Campaign', 'Partner'];

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
    return domain && domain.includes('.') ? domain : null;
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
        setFormData(prev => ({ ...prev, [name]: value }));

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
            onShowToast('Please fix the highlighted errors', 'error');
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

    const emailDomain = extractDomain(formData.email);
    const showProposalWarning = formData.dealStage === 'Proposal Sent';

    return (
        <div className="max-w-5xl mx-auto" ref={formRef}>
            <form onSubmit={handleSubmit} className="pb-20">
                {/* ─── Top Header with inline Save CTA ─── */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <p className="text-sm text-text-muted font-medium">
                            Fill required fields marked with <span className="text-error-500 font-bold">*</span> to create a lead entry.
                        </p>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary hidden md:inline-flex px-5 py-2 text-sm"
                    >
                        {loading ? 'Saving…' : <><Save size={15} /> <span>Save Lead</span></>}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* ═══════════════════════════════════════════════════════════
                        LEFT PANEL — Lead Information (3/5 width)
                    ═══════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* ─── Contact Details ─── */}
                        <section className="space-y-5">
                            <div>
                                <h3 className="section-header">Contact Details</h3>
                                <p className="section-description">Primary identity and communication info</p>
                            </div>
                            <div className="bg-surface-soft/30 rounded-xl p-5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
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
                                    <ValidatedInput
                                        label="Contact Person"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        placeholder="Sarah Connor"
                                    />
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
                                        hint={emailDomain ? `Company: ${emailDomain}` : null}
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
                                </div>
                            </div>
                        </section>

                        {/* ─── Company & Opportunity ─── */}
                        <section className="space-y-5">
                            <div>
                                <h3 className="section-header">Company & Opportunity</h3>
                                <p className="section-description">Business context and deal qualification</p>
                            </div>
                            <div className="bg-surface-soft/30 rounded-xl p-5 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-4">
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 pt-2">
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
                                    <ValidatedInput
                                        label="Decision Maker"
                                        name="decisionMaker"
                                        value={formData.decisionMaker}
                                        onChange={handleChange}
                                        placeholder="CTO"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ─── Conversation Notes ─── */}
                        <section className="space-y-5">
                            <div>
                                <h3 className="section-header">Conversation Notes</h3>
                                <p className="section-description">Capture key details from your interaction</p>
                            </div>
                            <div className="bg-surface-soft/30 rounded-xl p-5 space-y-3">
                                <textarea
                                    className="input-field-borderless resize-none text-sm"
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Summarize the call, pain points, timeline, and objections…"
                                />
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <button type="button" className="action-hint-btn" title="Coming soon">
                                        <Paperclip size={12} /> Attach file
                                    </button>
                                    <button type="button" className="action-hint-btn" title="Coming soon">
                                        <Mic size={12} /> Voice note
                                    </button>
                                    <button type="button" className="action-hint-btn" title="Coming soon">
                                        <CalendarDays size={12} /> Meeting ref
                                    </button>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* ═══════════════════════════════════════════════════════════
                        RIGHT PANEL — Sales Workflow (2/5 width)
                    ═══════════════════════════════════════════════════════════ */}
                    <div className="lg:col-span-2">
                        <div className="card p-5 md:p-6 space-y-1 lg:sticky lg:top-24 bg-brand-600/[0.02] border-brand-500/10">
                            <div className="flex items-center gap-2 mb-5">
                                <TrendingUp className="text-brand-500" size={18} strokeWidth={2.5} />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-text-subtle">Sales Workflow</h3>
                            </div>

                            {/* Step 1 */}
                            <WorkflowStep number={1} label="Lead Stage" hint="Used for pipeline reporting">
                                <select
                                    className="input-field-borderless cursor-pointer"
                                    name="dealStage"
                                    value={formData.dealStage}
                                    onChange={handleChange}
                                >
                                    {DEAL_STAGE.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </WorkflowStep>

                            {/* Step 2 */}
                            <WorkflowStep number={2} label="Interest Level" hint="Lead qualification score">
                                <select
                                    className="input-field-borderless cursor-pointer"
                                    name="leadStatus"
                                    value={formData.leadStatus}
                                    onChange={handleChange}
                                >
                                    {LEAD_STATUS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </WorkflowStep>

                            {/* Step 3 */}
                            <WorkflowStep number={3} label="Priority" hint="Urgency indicator">
                                <select
                                    className="input-field-borderless cursor-pointer"
                                    name="interestLevel"
                                    value={formData.interestLevel}
                                    onChange={handleChange}
                                >
                                    {INTEREST_LEVEL.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </WorkflowStep>

                            {/* Step 4 */}
                            <WorkflowStep number={4} label="Call Status" hint="Used for call tracking">
                                <select
                                    className="input-field-borderless cursor-pointer"
                                    name="callStatus"
                                    value={formData.callStatus}
                                    onChange={handleChange}
                                >
                                    {CALL_STATUS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </WorkflowStep>

                            {/* Step 5 */}
                            <WorkflowStep number={5} label="Next Action" hint="Drives your task queue">
                                <input
                                    className="input-field-borderless"
                                    name="nextAction"
                                    value={formData.nextAction}
                                    onChange={handleChange}
                                    placeholder="Send proposal"
                                />
                            </WorkflowStep>

                            {/* Step 6 */}
                            <WorkflowStep number={6} label="Follow-up Date" hint="Reminder scheduling" last>
                                <input
                                    className="input-field-borderless"
                                    type="date"
                                    name="followUp"
                                    value={formData.followUp}
                                    onChange={handleChange}
                                />
                            </WorkflowStep>

                            {/* Conditional warning — only when stage = Proposal Sent */}
                            {showProposalWarning && (
                                <div className="animate-slide-in mt-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-lg flex gap-2.5">
                                    <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={15} />
                                    <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 leading-relaxed">
                                        Ensure all business details are verified before moving to 'Proposal Sent'.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ─── Sticky Footer CTA ─── */}
                <div className="fixed bottom-0 left-0 right-0 bg-surface-base/90 backdrop-blur-xl border-t border-border-main p-4 z-40">
                    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 text-text-muted text-sm font-medium order-2 sm:order-1">
                            <CheckCircle2 size={14} className="text-success-500" />
                            <span>
                                {lastSaved
                                    ? <>Draft automatically saved · <span className="text-text-muted/70">{timeDisplay}</span></>
                                    : 'Draft will be saved automatically'
                                }
                            </span>
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
                                    <Send size={16} />
                                    <span>Save Lead</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const WorkflowStep = ({ number, label, hint, children, last }) => (
    <div className={`py-3 ${last ? '' : 'border-b border-border-subtle'}`}>
        <div className="flex items-center gap-2 mb-2">
            <span className="workflow-step-number">{number}</span>
            <label className="text-xs font-semibold text-text-subtle uppercase tracking-wider">{label}</label>
        </div>
        {children}
        {hint && <p className="hint-text mt-1.5 ml-7">{hint}</p>}
    </div>
);

const ValidatedInput = ({ label, required, error, touched: isTouched, hint, ...props }) => {
    const hasError = isTouched && error;
    const isValid = isTouched && !error && props.value;
    const validationClass = hasError ? 'validation-error' : isValid ? 'validation-success' : '';

    return (
        <div className="space-y-1">
            <label className={`label-text ${required ? 'label-required' : ''}`}>{label}</label>
            <div className="relative">
                <input className={`input-field-borderless ${validationClass}`} {...props} />
                {hasError && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-error-500">
                        <AlertTriangle size={14} />
                    </span>
                )}
                {isValid && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success-500">
                        <Check size={14} />
                    </span>
                )}
            </div>
            {hasError && (
                <p className="validation-msg error"><AlertTriangle size={11} /> {error}</p>
            )}
            {isValid && !hasError && hint && (
                <p className="hint-text text-brand-500/70">🏢 {hint}</p>
            )}
        </div>
    );
};

const DatalistInput = ({ label, suggestions, name, ...props }) => (
    <div className="space-y-1">
        <label className="label-text">{label}</label>
        <input className="input-field-borderless" name={name} list={`${name}-list`} {...props} />
        <datalist id={`${name}-list`}>
            {suggestions.map(s => <option key={s} value={s} />)}
        </datalist>
    </div>
);

export default LeadForm;
