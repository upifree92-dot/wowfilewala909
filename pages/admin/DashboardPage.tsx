
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import SalesChart from '../../components/SalesChart';
import type { User, DownloadRecord, AdminNotification } from '../../types';
import { AlertCircle, X } from 'lucide-react';

const StatCard = ({ title, value, icon, colorClass }: { title: string; value: string | number; icon: React.ReactNode; colorClass: string; }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
                <p className="text-3xl font-extrabold text-gray-800 mt-1.5">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
                <div className={`${colorClass.replace('bg-', 'text-')}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

// --- Daily Downloads Bar Chart ---
const DownloadsBarChart = ({ data }: { data: { date: string; count: number }[] }) => {
    const chartHeight = 200;
    const chartWidth = 500;
    const maxCount = Math.max(...data.map(d => d.count), 0);
    const barWidth = chartWidth / data.length;

    const yLabels = [];
    const maxVal = maxCount > 0 ? maxCount : 5;
    const step = Math.ceil(maxVal / 4);
    for (let i = 0; i <= 4; i++) {
        yLabels.push(step * i);
    }
    const computedMax = step * 4;

    return (
        <div className="w-full h-[240px] text-[10px] sm:text-xs text-slate-400">
            <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                </defs>

                {/* Y-axis lines and labels */}
                {yLabels.map((label, index) => {
                    const y = chartHeight - (index * (chartHeight / 4));
                    return (
                        <g key={label}>
                            <line x1="40" y1={y} x2={chartWidth} y2={y} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="3,3" />
                            <text x="30" y={y + 4} textAnchor="end" fill="currentColor" className="font-mono">{label}</text>
                        </g>
                    );
                })}

                {/* Bars and X-axis labels */}
                {data.map((item, index) => {
                    const barHeight = computedMax > 0 ? (item.count / computedMax) * chartHeight : 0;
                    const x = 45 + (index * (chartWidth - 55) / data.length);
                    const currentBarWidth = ((chartWidth - 55) / data.length) * 0.7;
                    const y = chartHeight - barHeight;
                    const date = new Date(item.date);
                    const day = date.getDate();
                    const month = date.toLocaleString('default', { month: 'short' });

                    return (
                        <g key={item.date} className="group">
                            <rect
                                x={x}
                                y={y}
                                width={currentBarWidth}
                                height={barHeight}
                                fill="url(#downloadGrad)"
                                rx="4"
                                className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                            />
                            <text
                                x={x + currentBarWidth / 2}
                                y={y - 6}
                                textAnchor="middle"
                                fill="currentColor"
                                className="font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] text-amber-400"
                            >
                                {item.count}
                            </text>
                            <text x={x + currentBarWidth / 2} y={chartHeight + 18} textAnchor="middle" fill="currentColor" className="text-slate-400 font-medium">
                                {month} {day}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

// --- User Sign-Ups Line Chart ---
const SignUpsLineChart = ({ data }: { data: { date: string; count: number }[] }) => {
    const chartHeight = 200;
    const chartWidth = 500;
    const maxCount = Math.max(...data.map(d => d.count), 0);
    
    const maxVal = maxCount > 0 ? maxCount : 5;
    const step = Math.ceil(maxVal / 4);
    const computedMax = step * 4;
    
    const yLabels = [];
    for (let i = 0; i <= 4; i++) {
        yLabels.push(step * i);
    }

    const points = useMemo(() => {
        return data.map((item, index) => {
            const x = 45 + (index * (chartWidth - 55) / (data.length - 1));
            const y = computedMax > 0 ? chartHeight - (item.count / computedMax) * chartHeight : chartHeight;
            return { x, y, ...item };
        });
    }, [data, computedMax]);

    const pathD = useMemo(() => {
        if (points.length === 0) return '';
        return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    }, [points]);

    const areaD = useMemo(() => {
        if (points.length === 0) return '';
        const start = `M ${points[0].x} ${chartHeight}`;
        const line = points.map(p => `L ${p.x} ${p.y}`).join(' ');
        const end = `L ${points[points.length - 1].x} ${chartHeight} Z`;
        return `${start} ${line} ${end}`;
    }, [points]);

    return (
        <div className="w-full h-[240px] text-[10px] sm:text-xs text-slate-400">
            <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} preserveAspectRatio="xMidYMid meet">
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                    </linearGradient>
                </defs>

                {/* Y-axis lines and labels */}
                {yLabels.map((label, index) => {
                    const y = chartHeight - (index * (chartHeight / 4));
                    return (
                        <g key={label}>
                            <line x1="40" y1={y} x2={chartWidth} y2={y} stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="3,3" />
                            <text x="30" y={y + 4} textAnchor="end" fill="currentColor" className="font-mono">{label}</text>
                        </g>
                    );
                })}

                {/* Filled Area */}
                {areaD && <path d={areaD} fill="url(#areaGrad)" />}

                {/* Line Path */}
                {pathD && <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Circular markers & interactive elements */}
                {points.map((p, index) => {
                    return (
                        <g key={p.date} className="group">
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="5"
                                fill="#f59e0b"
                                stroke="#0f172a"
                                strokeWidth="2.5"
                                className="cursor-pointer transition-all duration-200 group-hover:r-7"
                            />
                            <text
                                x={p.x}
                                y={p.y - 10}
                                textAnchor="middle"
                                fill="currentColor"
                                className="font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] text-amber-400"
                            >
                                {p.count}
                            </text>
                            <text x={p.x} y={chartHeight + 18} textAnchor="middle" fill="currentColor" className="text-slate-400 font-medium">
                                {new Date(p.date).getDate()} {new Date(p.date).toLocaleString('default', { month: 'short' })}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const DashboardPage = () => {
    const { getAllUsers, products, getAllOrders, getTotalSales, getSalesDataForLastNDays, user: currentUser, isAdmin, approveActivationOrder, rejectActivationOrder } = useAppContext();
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
    const [rejectingOrder, setRejectingOrder] = useState<AdminNotification | null>(null);
    const [rejectionReason, setRejectionReason] = useState('Order could not be processed');

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingOrder) return;
        rejectActivationOrder(rejectingOrder.id, rejectionReason || 'Order could not be processed');
        setRejectingOrder(null);
        setRejectionReason('Order could not be processed');
    };

    // Basic Metrics
    const users = useMemo(() => getAllUsers(), [getAllUsers]);
    const totalUsers = users.length;
    const totalProducts = products.length;
    const allOrders = getAllOrders();
    const totalOrders = allOrders.length;
    const totalSales = getTotalSales();
    const salesData = useMemo(() => getSalesDataForLastNDays(7), [getSalesDataForLastNDays]);
    
    // Aggregate user profile mapping for looking up buyers
    const userMap = useMemo(() => {
        const map = users.reduce((acc, u) => {
            acc[u.id] = u;
            return acc;
        }, {} as Record<string, User>);

        if (isAdmin && currentUser) {
            map[currentUser.id] = currentUser;
        }
        return map;
    }, [users, isAdmin, currentUser]);

    const findUser = (userId?: string): User | undefined => {
        return userId ? userMap[userId] : undefined;
    };
    
    const recentOrders = useMemo(() => 
        allOrders
            .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5)
    , [allOrders]);
    
    // --- Analytics Computations ---
    const allDownloads = useMemo(() => {
        const list: DownloadRecord[] = [];
        users.forEach(u => {
            if (u.downloadHistory && Array.isArray(u.downloadHistory)) {
                u.downloadHistory.forEach(record => {
                    list.push(record);
                });
            }
        });
        return list.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
    }, [users]);

    const totalDownloadsCount = allDownloads.length;

    // Daily Downloads over last 7 days
    const dailyDownloadsData = useMemo(() => {
        const result: { date: string; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            result.push({ date: dateStr, count: 0 });
        }

        allDownloads.forEach(dl => {
            if (dl.downloadedAt) {
                const dlDateStr = dl.downloadedAt.split('T')[0];
                const match = result.find(r => r.date === dlDateStr);
                if (match) {
                    match.count += 1;
                }
            }
        });
        return result;
    }, [allDownloads]);

    // Daily registrations over last 7 days
    const dailyRegistrationsData = useMemo(() => {
        const result: { date: string; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            result.push({ date: dateStr, count: 0 });
        }

        users.forEach(u => {
            if (u.registeredAt) {
                const regDateStr = u.registeredAt.split('T')[0];
                const match = result.find(r => r.date === regDateStr);
                if (match) {
                    match.count += 1;
                }
            }
        });
        return result;
    }, [users]);

    // Top Requested Files List
    const topRequestedFiles = useMemo(() => {
        const counts: Record<string, { name: string; count: number }> = {};
        allDownloads.forEach(dl => {
            const key = dl.productId;
            if (!counts[key]) {
                counts[key] = { name: dl.productName || 'Unknown Product', count: 0 };
            }
            counts[key].count += 1;
        });

        return Object.entries(counts)
            .map(([id, info]) => ({ id, name: info.name, count: info.count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [allDownloads]);

    // Today's metrics
    const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
    
    const todayDownloads = useMemo(() => {
        return allDownloads.filter(dl => dl.downloadedAt && dl.downloadedAt.split('T')[0] === todayStr).length;
    }, [allDownloads, todayStr]);

    const todayRegistrations = useMemo(() => {
        return users.filter(u => u.registeredAt && u.registeredAt.split('T')[0] === todayStr).length;
    }, [users, todayStr]);

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

    return (
        <div className="space-y-6">
            {/* Top Premium Navigation Tab Selector */}
            <div className="flex border-b border-slate-800/80 space-x-2">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`py-3 px-6 font-bold text-sm flex items-center gap-2 border-b-2 rounded-t-xl transition-all duration-300 ${activeTab === 'overview' ? 'border-amber-500 text-amber-400 bg-amber-500/5 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    Overview & Sales
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`py-3 px-6 font-bold text-sm flex items-center gap-2 border-b-2 rounded-t-xl transition-all duration-300 ${activeTab === 'analytics' ? 'border-amber-500 text-amber-400 bg-amber-500/5 shadow-sm' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L10 10.586 13.586 7H12z" clipRule="evenodd" />
                    </svg>
                    Downloads & Analytics
                </button>
            </div>

            {activeTab === 'overview' ? (
                // --- Tab 1: Sales & Orders Overview ---
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total Users" value={totalUsers} colorClass="bg-blue-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                        <StatCard title="Total Products" value={totalProducts} colorClass="bg-green-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} />
                        <StatCard title="Total Orders" value={totalOrders} colorClass="bg-yellow-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                        <StatCard title="Total Sales" value={formatCurrency(totalSales)} colorClass="bg-cyan-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                        <div className="xl:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                                Sales Overview (Last 7 Days)
                            </h2>
                            <SalesChart data={salesData} />
                        </div>
                        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-gray-800">
                                        Recent Orders
                                    </h2>
                                    <Link 
                                        to="/admin/orders" 
                                        className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                                    >
                                        View All Orders &rarr;
                                    </Link>
                                </div>
                                <div className="space-y-3.5">
                                    {recentOrders.length > 0 ? recentOrders.map(order => {
                                         const user = findUser(order.userId);
                                         const cost = Number(order.orderDetails?.totalPrice || 0);
                                         return (
                                            <div key={order.id} className="p-3.5 bg-gray-50 hover:bg-gray-100/80 border border-gray-100 rounded-lg transition-all duration-200">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="font-semibold text-sm text-gray-800 truncate">{order.orderDetails?.categoryName || 'Order'}</p>
                                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full capitalize ${
                                                                order.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/40' :
                                                                order.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300/40' :
                                                                order.status === 'processing' ? 'bg-orange-100 text-orange-800 border border-orange-300/40' :
                                                                'bg-amber-100 text-amber-800 border border-amber-300/40'
                                                            }`}>
                                                                {order.status === 'approved' ? 'Success' : (order.status || 'pending')}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                            by {user?.profile?.name || user?.email || 'Unknown User'}
                                                            {order.orderId ? ` • #${order.orderId}` : ''}
                                                        </p>
                                                    </div>
                                                    <p className="font-bold text-sm text-gray-900 shrink-0">{formatCurrency(cost)}</p>
                                                </div>

                                                {/* Action buttons for pending/processing orders */}
                                                {order.status !== 'approved' && order.status !== 'rejected' && (
                                                    <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => approveActivationOrder(order.id, 'Order approved by admin')}
                                                            className="px-2.5 py-1 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm active:scale-95"
                                                        >
                                                            Success
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setRejectionReason('Order could not be processed');
                                                                setRejectingOrder(order);
                                                            }}
                                                            className="px-2.5 py-1 text-xs font-bold rounded-md bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm active:scale-95"
                                                            title="Reject order and refund amount to customer wallet"
                                                        >
                                                            Reject & Refund
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                         )
                                    }) : <p className="text-gray-500 text-center py-8">No recent orders.</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // --- Tab 2: Downloads & Registrations Analytics ---
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Total File Downloads" value={totalDownloadsCount} colorClass="bg-pink-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>} />
                        <StatCard title="Today's Downloads" value={todayDownloads} colorClass="bg-rose-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>} />
                        <StatCard title="Today's New Sign-ups" value={todayRegistrations} colorClass="bg-purple-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>} />
                        <StatCard title="Total Registered Users" value={totalUsers} colorClass="bg-indigo-500" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daily Downloads Chart */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                                Daily Downloads (Last 7 Days)
                            </h2>
                            <DownloadsBarChart data={dailyDownloadsData} />
                        </div>

                        {/* Recent User Sign-ups Chart */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                                User Sign-ups per Day (Last 7 Days)
                            </h2>
                            <SignUpsLineChart data={dailyRegistrationsData} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
                        {/* Left Side: Top-Requested Files popularity */}
                        <div className="xl:col-span-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-lg font-bold mb-5 text-gray-800 flex items-center gap-2">
                                Top Requested Files
                            </h2>
                            <div className="space-y-5">
                                {topRequestedFiles.length > 0 ? topRequestedFiles.map((file, idx) => {
                                    const maxPop = topRequestedFiles[0].count;
                                    const widthPct = maxPop > 0 ? (file.count / maxPop) * 100 : 0;
                                    
                                    return (
                                        <div key={file.id} className="space-y-2">
                                            <div className="flex justify-between items-center text-sm font-semibold text-gray-800">
                                                <span className="truncate pr-4 flex items-center gap-2">
                                                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-extrabold">
                                                        #{idx + 1}
                                                    </span>
                                                    {file.name}
                                                </span>
                                                <span className="font-mono text-xs text-gray-500">{file.count} dl</span>
                                            </div>
                                            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-200">
                                                <div 
                                                    className="bg-red-500 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${widthPct}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-gray-500 text-center py-12">
                                        No files have been requested yet.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Right Side: Log of Recent File Downloads */}
                        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col max-h-[380px]">
                            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                                Recent Download Log
                            </h2>
                            <div className="space-y-3.5 overflow-y-auto flex-1 pr-1">
                                {allDownloads.length > 0 ? allDownloads.slice(0, 10).map((dl, index) => {
                                    const time = new Date(dl.downloadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    const date = new Date(dl.downloadedAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
                                    return (
                                        <div key={index} className="flex justify-between items-start p-3 rounded-lg bg-gray-50 border border-gray-100 text-xs">
                                            <div className="flex-1 min-w-0 pr-3">
                                                <p className="font-bold text-gray-800 truncate">{dl.productName}</p>
                                                <p className="text-gray-500 font-mono text-[10px] mt-1">{date} at {time}</p>
                                            </div>
                                            <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 font-bold font-mono text-[10px]">
                                                SUCCESS
                                            </span>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-gray-500 text-center py-12 text-sm">
                                        No download history.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection & Refund Confirmation Modal */}
            {rejectingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="relative bg-white dark:bg-slate-950 rounded-2xl max-w-md w-full shadow-2xl border border-gray-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-lg">
                                    <AlertCircle className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base">Reject Order & Refund</h3>
                            </div>
                            <button
                                onClick={() => setRejectingOrder(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <form onSubmit={handleRejectSubmit}>
                            <div className="p-6">
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
                                    Are you sure you want to reject order <strong className="text-amber-600 dark:text-amber-400">#{rejectingOrder.orderId || rejectingOrder.id}</strong> ({rejectingOrder.orderDetails?.categoryName})?
                                    <br />
                                    The full amount of <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">₹{Number(rejectingOrder.orderDetails?.totalPrice || 0).toFixed(2)}</span> will be <strong>refunded immediately</strong> to the customer's wallet balance.
                                </p>
                                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-2">
                                    Rejection Reason (Visible to Customer)
                                </label>
                                <textarea
                                    required
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g. Invalid credentials, service temporarily down, or requested refund"
                                    rows={3}
                                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/40 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
                                />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-gray-50 dark:bg-slate-900/30 border-t border-gray-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setRejectingOrder(null)}
                                    className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all shadow-md active:scale-95"
                                >
                                    Confirm Reject & Refund
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
