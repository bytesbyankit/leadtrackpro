import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area,
    PieChart, Pie, Cell
} from 'recharts';
import {
    TrendingUp, Users, Target, Trophy,
    Activity, ArrowUpRight, BarChart3
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'];

function Dashboard() {
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        won: 0,
        conversion: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/leads');
                const leads = response.data.leads || [];
                const won = leads.filter(l => l.dealStage === 'Won').length;
                const productive = leads.filter(l => ['Interested', 'Proposal Sent', 'Negotiation'].includes(l.dealStage)).length;

                setStats({
                    total: leads.length,
                    active: productive,
                    won,
                    conversion: leads.length ? Math.round((won / leads.length) * 100) : 0
                });
                setData(leads);
            } catch (error) {
                console.error('Stats fetch error', error);
            }
        };
        fetchStats();
    }, []);

    // Process data for charts
    const stageData = [
        { name: 'Lead', count: data.filter(l => l.dealStage === 'Lead Found').length },
        { name: 'Contacted', count: data.filter(l => l.dealStage === 'Contacted').length },
        { name: 'Interested', count: data.filter(l => l.dealStage === 'Interested').length },
        { name: 'Proposal', count: data.filter(l => l.dealStage === 'Proposal Sent').length },
        { name: 'Won', count: data.filter(l => l.dealStage === 'Won').length },
    ];

    const interestData = [
        { name: 'High', value: data.filter(l => l.interestLevel === 'High').length },
        { name: 'Medium', value: data.filter(l => l.interestLevel === 'Medium').length },
        { name: 'Low', value: data.filter(l => l.interestLevel === 'Low').length },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-6">
            {/* Top Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Pipeline Depth" value={stats.total} icon={Users} trend="+12% vs last month" />
                <StatCard title="Active Leads" value={stats.active} icon={Activity} color="text-brand-500" />
                <StatCard title="Deals Closed" value={stats.won} icon={Trophy} color="text-emerald-500" />
                <StatCard title="Close Rate" value={`${stats.conversion}%`} icon={TrendingUp} color="text-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Pipeline Chart */}
                <div className="lg:col-span-2 card p-5 md:p-6 space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold flex items-center gap-2">
                            <BarChart3 size={18} className="text-brand-500" />
                            Conversion Funnel Analysis
                        </h3>
                        <span className="text-[10px] font-black uppercase text-text-muted tracking-tighter bg-surface-sunken px-2 py-1 rounded">Live Data</span>
                    </div>

                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stageData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-main)" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="var(--text-muted)"
                                    fontSize={11}
                                    fontWeight={600}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface-soft)', border: '1px solid var(--border-main)', borderRadius: '8px', fontSize: '12px' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#6366f1"
                                    radius={[6, 6, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Interest Distribution */}
                <div className="card p-5 md:p-6 flex flex-col">
                    <h3 className="text-base font-bold flex items-center gap-2 mb-8">
                        <Target size={18} className="text-brand-500" />
                        Lead Intent Matrix
                    </h3>

                    <div className="flex-grow flex items-center justify-center">
                        <div className="h-64 w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={interestData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {interestData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--surface-soft)', border: '1px solid var(--border-main)', borderRadius: '8px', fontSize: '12px' }}
                                        itemStyle={{ color: 'var(--text-main)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Label */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-text-main">{data.length}</span>
                                <span className="text-[10px] uppercase font-bold text-text-muted">Total Leads</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                        {interestData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wide">{d.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ title, value, icon: Icon, color = 'text-text-main', trend }) => (
    <div className="card p-5 group hover:border-brand-500/20 transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-surface-sunken rounded-lg group-hover:bg-brand-500/10 transition-colors">
                <Icon className={cn(color, "group-hover:text-brand-500")} size={20} strokeWidth={2.5} />
            </div>
            {trend && (
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded inline-flex items-center gap-0.5">
                    <ArrowUpRight size={10} /> {trend}
                </span>
            )}
        </div>
        <div>
            <div className="text-2xl font-black text-text-main tracking-tight">{value}</div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mt-0.5">{title}</div>
        </div>
    </div>
);

function cn(...inputs) {
    return inputs.filter(Boolean).join(' ');
}

export default Dashboard;
