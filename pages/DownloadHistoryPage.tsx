import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';
import DownloadItem from '../components/DownloadItem';
import CopyButton from '../components/CopyButton';
import { Search, X, Download, Clock, Lock, FileText, CheckCircle2, History, HelpCircle, FileDown, Activity } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

const DownloadHistoryPage = () => {
    useSEO('Download History', 'View your recent downloads and timeline.');
    const { user, products, initiateDownload } = useAppContext();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'unlocks' | 'timeline'>('timeline');
    const [currentTime, setCurrentTime] = useState(Date.now());

    // Update current time every second for real-time countdown updates
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Route guard
    if (!user) {
        navigate('/login');
        return null;
    }

    // List of purchased/unlocked products
    const unlockedProducts = useMemo(() => {
        return products.filter(product => (user.purchasedProductIds || []).includes(product.id));
    }, [products, user.purchasedProductIds]);

    // Complete download timeline
    const downloadHistory = useMemo(() => {
        return user.downloadHistory || [];
    }, [user.downloadHistory]);

    // Active timers count
    const activeTimersCount = useMemo(() => {
        return Object.entries(user.downloadTimers || {}).filter(([_, expiry]) => expiry > currentTime).length;
    }, [user.downloadTimers, currentTime]);

    // Filtering unlocked products
    const filteredUnlocks = useMemo(() => {
        if (!searchQuery.trim()) return unlockedProducts;
        const query = searchQuery.toLowerCase();
        return unlockedProducts.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    }, [unlockedProducts, searchQuery]);

    // Filtering download timeline
    const filteredTimeline = useMemo(() => {
        if (!searchQuery.trim()) return downloadHistory;
        const query = searchQuery.toLowerCase();
        return downloadHistory.filter(record => record.productName.toLowerCase().includes(query));
    }, [downloadHistory, searchQuery]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg p-5 sm:p-8 rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <BackButton />

                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4 mb-6 border-b border-slate-200 dark:border-slate-700 pb-5">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span>💾 Download History</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Review your unlocked files, active links, and detailed download timeline.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <Search className="h-4 w-4" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by file name..."
                            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-800 dark:text-slate-100 transition-all shadow-inner"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Dashboard Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-lg">
                            <Lock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unlocked Files</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{unlockedProducts.length}</h3>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Download Access</p>
                            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">Lifetime <span className="text-xs font-normal text-slate-400">No Expiry</span></h3>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg">
                            <History className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Download Attempts</p>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{downloadHistory.length}</h3>
                        </div>
                    </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6 gap-4">
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                            activeTab === 'timeline'
                                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                    >
                        <History className="h-4 w-4" />
                        <span>Download Timeline ({filteredTimeline.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('unlocks')}
                        className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
                            activeTab === 'unlocks'
                                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                        }`}
                    >
                        <FileText className="h-4 w-4" />
                        <span>Unlocked Files ({filteredUnlocks.length})</span>
                    </button>
                </div>

                {/* Tab Contents */}
                {activeTab === 'timeline' ? (
                    <div>
                        {filteredTimeline.length === 0 ? (
                            <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <FileDown className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Download Logs</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mt-1">
                                    {searchQuery 
                                        ? 'No download timeline logs match your search filter.' 
                                        : 'Any time you download or re-download unlocked files from our platform, an instant record will be shown here.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm bg-white dark:bg-slate-900/20">
                                <table className="w-full text-left text-xs sm:text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider border-b border-slate-200 dark:border-slate-800">
                                        <tr>
                                            <th className="p-4 font-bold">File / Product Name</th>
                                            <th className="p-4 font-bold">Download Timestamp</th>
                                            <th className="p-4 font-bold">60-Min Expiration Link Status</th>
                                            <th className="p-4 font-bold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800/30">
                                        {filteredTimeline.map((record, index) => {
                                            const matchedProduct = products.find(p => p.id === record.productId);
                                            const expiryTime = user.downloadTimers?.[record.productId] || 0;
                                            const isTimerActive = expiryTime > currentTime;
                                            const remainingMs = Math.max(0, expiryTime - currentTime);

                                            const formatTimeRemaining = (ms: number) => {
                                                const totalSeconds = Math.floor(ms / 1000);
                                                const minutes = Math.floor(totalSeconds / 60);
                                                const seconds = totalSeconds % 60;
                                                return `${minutes}m ${seconds}s left`;
                                            };

                                            return (
                                                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                                                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                                                        {record.productName}
                                                        {matchedProduct && (
                                                            <span className="block text-[11px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                                                                File ID: {matchedProduct.id} • Size: {matchedProduct.size || 'N/A'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                                        <span className="block font-medium">{new Date(record.downloadedAt).toLocaleDateString()}</span>
                                                        <span className="text-xs text-slate-400">{new Date(record.downloadedAt).toLocaleTimeString()}</span>
                                                    </td>
                                                    <td className="p-4 whitespace-nowrap">
                                                        {isTimerActive ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-500/20 w-fit">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                                ⏱️ {formatTimeRemaining(remainingMs)}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/20 w-fit">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                                                                Expired (60 Min Expired)
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {matchedProduct ? (
                                                            <button
                                                                onClick={() => initiateDownload(matchedProduct)}
                                                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-1 ml-auto bg-emerald-500 hover:bg-emerald-600 hover:shadow-md"
                                                            >
                                                                <Download className="h-3 w-3" />
                                                                <span>Download</span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">Unavailable</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {filteredUnlocks.length === 0 ? (
                            <div className="text-center p-12 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <Lock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Unlocked Files</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mt-1">
                                    {searchQuery 
                                        ? 'No unlocked files match your search filter.' 
                                        : 'You have not unlocked any files yet. Explore our library to find firmware files, tools, and ROMs!'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredUnlocks.map(product => (
                                    <DownloadItem key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DownloadHistoryPage;
