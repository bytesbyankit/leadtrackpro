import React from 'react';
import { Plus, ListFilter, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

function TabNavigation({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'create', label: 'Create Lead', icon: Plus },
        { id: 'pipeline', label: 'Pipeline', icon: ListFilter },
        { id: 'intelligence', label: 'Intelligence', icon: LayoutDashboard },
    ];

    return (
        <div className="flex bg-surface-soft/50 p-1 rounded-xl border border-border-main overflow-x-auto no-scrollbar">
            <div className="flex min-w-max gap-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                                isActive
                                    ? "bg-brand-600 text-white shadow-sm"
                                    : "text-text-subtle hover:text-text-main hover:bg-surface-soft"
                            )}
                        >
                            <Icon size={16} strokeWidth={2.5} />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default TabNavigation;
