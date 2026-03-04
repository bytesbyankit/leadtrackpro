import React, { useState } from 'react';
import TabNavigation from './components/TabNavigation';
import LeadForm from './components/LeadForm';
import LeadTable from './components/LeadTable';
import Dashboard from './components/Dashboard';
import Toast from './components/Toast';
import { Layout, ShieldCheck } from 'lucide-react';

function App() {
    // Sync tab state with URL query parameter
    const [activeTab, setActiveTab] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('view') || 'create';
    });
    const [toast, setToast] = useState(null);

    React.useEffect(() => {
        const url = new URL(window.location);
        url.searchParams.set('view', activeTab);
        window.history.replaceState({}, '', url);
    }, [activeTab]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    return (
        <div className="min-h-screen bg-surface-base flex flex-col transition-colors duration-300">
            {/* Persistent Navigation Bar */}
            <nav className="border-b border-border-main bg-surface-base/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between h-auto md:h-16 py-4 md:py-0 items-center gap-4">
                        <div className="flex items-center gap-2.5 self-start md:self-auto">
                            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                                <ShieldCheck className="text-white" size={20} strokeWidth={2.5} />
                            </div>
                            <span className="text-xl font-bold text-text-main tracking-tight">
                                LeadTrack <span className="text-brand-500 text-xs font-black uppercase tracking-widest ml-1 opacity-50">Pro</span>
                            </span>
                        </div>

                        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>
                </div>
            </nav>

            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 w-full animate-in">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-text-main">
                        {activeTab === 'create' && 'Log Engagement'}
                        {activeTab === 'pipeline' && 'Lead Pipeline'}
                        {activeTab === 'intelligence' && 'Sales Intelligence'}
                    </h1>
                    <p className="text-text-subtle mt-1 font-medium">
                        {activeTab === 'create' && 'Capture high-intent business interactions.'}
                        {activeTab === 'pipeline' && 'Manage and monitor your ongoing deals.'}
                        {activeTab === 'intelligence' && 'Growth metrics and performance analytics.'}
                    </p>
                </header>

                <section className="relative">
                    {activeTab === 'create' && <LeadForm onShowToast={showToast} />}
                    {activeTab === 'pipeline' && <LeadTable />}
                    {activeTab === 'intelligence' && <Dashboard />}
                </section>
            </main>

            <footer className="border-t border-border-subtle bg-surface-base py-8">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-text-muted text-sm font-medium">
                        &copy; 2026 LeadTrack CRM. Enterprise Edition v4.0
                    </p>
                </div>
            </footer>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}

export default App;
