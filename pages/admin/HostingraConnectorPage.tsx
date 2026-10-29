import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { GsmApiType, ApiServerConfig } from '../../types';
import { 
    X, 
    Check, 
    RefreshCw, 
    Trash2, 
    Settings, 
    Plus, 
    Search, 
    CheckCircle2, 
    AlertTriangle,
    ExternalLink,
    ChevronDown,
    Sliders,
    Layers,
    Clock,
    Server,
    ShieldCheck
} from 'lucide-react';

const API_TYPES_CONFIG: Record<GsmApiType, {
    name: GsmApiType;
    color: string;
    badgeBg: string;
    badgeText: string;
    logo: React.ReactNode;
    urlExample: string;
    features: string[];
}> = {
    'GSM Theme': {
        name: 'GSM Theme',
        color: '#10b981',
        badgeBg: 'bg-emerald-600',
        badgeText: 'text-white',
        logo: (
            <div className="w-5 h-5 rounded bg-[#10b981] text-white flex items-center justify-center font-bold text-[10px] shadow-xs shrink-0">
                G
            </div>
        ),
        urlExample: 'https://example.com/public',
        features: [
            'Bulk Send Per Batch',
            'Bulk Get Per Batch',
            'Auto Update Price',
            'Auto Update Quantity',
            'Auto Update Delivery Time',
            'Must Setup Corn Job For Process'
        ]
    },
    'GSM Tool': {
        name: 'GSM Tool',
        color: '#3b82f6',
        badgeBg: 'bg-blue-600',
        badgeText: 'text-white',
        logo: (
            <div className="w-5 h-5 rounded bg-[#3b82f6] text-white flex items-center justify-center font-bold text-[9px] shadow-xs shrink-0">
                GT
            </div>
        ),
        urlExample: 'https://example.com/api/v1',
        features: [
            'Bulk Send Per Batch',
            'Bulk Get Per Batch',
            'Auto Update Price',
            'Auto Update Quantity',
            'Auto Update Delivery Time',
            'Must Setup Corn Job For Process'
        ]
    },
    'Dhru Fusion': {
        name: 'Dhru Fusion',
        color: '#18181b',
        badgeBg: 'bg-neutral-900',
        badgeText: 'text-white',
        logo: (
            <div className="w-5 h-5 rounded bg-[#18181b] text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                D
            </div>
        ),
        urlExample: 'https://example.com/api/index.php',
        features: [
            'Bulk Send Per Batch',
            'Bulk Get Per Batch',
            'Auto Update Price',
            'Auto Update Quantity',
            'Auto Update Delivery Time',
            'Must Setup Corn Job For Process'
        ]
    },
    'WebX': {
        name: 'WebX',
        color: '#000000',
        badgeBg: 'bg-black',
        badgeText: 'text-cyan-400',
        logo: (
            <div className="w-5 h-5 rounded bg-black text-cyan-400 flex items-center justify-center font-black text-xs border border-cyan-500/40 shadow-xs shrink-0">
                X
            </div>
        ),
        urlExample: 'https://example.com/webx/api',
        features: [
            'Bulk Send Per Batch',
            'Bulk Get Per Batch',
            'Auto Update Price',
            'Auto Update Quantity',
            'Auto Update Delivery Time',
            'Must Setup Corn Job For Process'
        ]
    },
    'Naksh Soft': {
        name: 'Naksh Soft',
        color: '#0284c7',
        badgeBg: 'bg-sky-600',
        badgeText: 'text-white',
        logo: (
            <div className="w-5 h-5 rounded bg-sky-600 text-white flex items-center justify-center font-black text-xs shadow-xs shrink-0">
                N
            </div>
        ),
        urlExample: 'https://example.com/api/v2',
        features: [
            'Bulk Send Per Batch',
            'Bulk Get Per Batch',
            'Auto Update Price',
            'Auto Update Quantity',
            'Auto Update Delivery Time',
            'Must Setup Corn Job For Process'
        ]
    }
};

const ALL_API_TYPES: GsmApiType[] = [
    'GSM Theme',
    'GSM Tool',
    'Dhru Fusion',
    'WebX',
    'Naksh Soft'
];

const HostingraConnectorPage = () => {
    const { siteContent, updateSiteContent, setNotification, createProduct, updateProduct, products, categories } = useAppContext();
    const [searchParams] = useSearchParams();

    // Tab mode: 'api_list' | 'builtin' | 'cron' | 'pricing'
    const tabParam = searchParams.get('tab');
    const [automationTab, setAutomationTab] = useState<'api_list' | 'builtin' | 'cron' | 'pricing'>('api_list');

    useEffect(() => {
        if (tabParam === 'builtin') setAutomationTab('builtin');
        else if (tabParam === 'cron') setAutomationTab('cron');
        else if (tabParam === 'pricing') setAutomationTab('pricing');
        else setAutomationTab('api_list');
    }, [tabParam]);

    // APIs List state
    const apiServersList: ApiServerConfig[] = useMemo(() => {
        if (Array.isArray(siteContent?.apiServers) && siteContent.apiServers.length > 0) {
            return siteContent.apiServers;
        }
        if (siteContent?.apiServer?.apiUrl) {
            return [{
                id: 'api-primary',
                apiName: siteContent.apiServer.apiName || 'E-Unlocker API',
                apiType: (siteContent.apiServer.apiType as GsmApiType) || 'GSM Theme',
                apiUrl: siteContent.apiServer.apiUrl,
                username: siteContent.apiServer.username || '',
                apiAccessKey: siteContent.apiServer.apiAccessKey || '',
                balance: siteContent.apiServer.balance || '2778.068',
                status: (siteContent.apiServer.status as 'Active' | 'Disabled') || 'Active',
                autoPlaceOrder: siteContent.apiServer.autoPlaceOrder !== false,
                autoOrderSuccess: siteContent.apiServer.autoOrderSuccess !== false,
                dealerOrderMode: siteContent.apiServer.dealerOrderMode || 'dealer_live_sync'
            }];
        }
        return [];
    }, [siteContent]);

    // Search query in API List
    const [searchQuery, setSearchQuery] = useState('');

    // Modal state for Add/Edit API
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApiId, setEditingApiId] = useState<string | null>(null);

    // Form inputs inside "Add new API" modal
    const [formApiName, setFormApiName] = useState('E-Unlocker API');
    const [formApiType, setFormApiType] = useState<GsmApiType>('GSM Theme');
    const [formApiUrl, setFormApiUrl] = useState('');
    const [formUsername, setFormUsername] = useState('');
    const [formAccessKey, setFormAccessKey] = useState('');
    const [formStatus, setFormStatus] = useState<'Active' | 'Disabled'>('Active');
    const [formAutoPlaceOrder, setFormAutoPlaceOrder] = useState<boolean>(true);
    const [formAutoOrderSuccess, setFormAutoOrderSuccess] = useState<boolean>(true);
    const [formDealerOrderMode, setFormDealerOrderMode] = useState<'dealer_live_sync' | 'instant_success'>('dealer_live_sync');
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

    // Pricing & Global Rate state
    const savedApi = siteContent?.apiServer || {};
    const getStoredPricing = () => {
        try {
            const raw = localStorage.getItem('gsm_pricing_rules');
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        return null;
    };
    const localPricing = getStoredPricing();

    const [marginPercent, setMarginPercent] = useState<number | string>(
        localPricing?.marginPercent ?? savedApi.marginPercent ?? 15
    );
    const [exchangeRate, setExchangeRate] = useState<number | string>(
        localPricing?.exchangeRate ?? savedApi.exchangeRate ?? 85.5
    );
    const [autoSyncPrice, setAutoSyncPrice] = useState<boolean>(
        localPricing?.autoSyncPrice ?? (savedApi.autoSyncPrice !== false)
    );

    // Keep state synchronized whenever siteContent loads or updates
    useEffect(() => {
        if (siteContent?.apiServer) {
            if (siteContent.apiServer.marginPercent !== undefined) {
                setMarginPercent(siteContent.apiServer.marginPercent);
            }
            if (siteContent.apiServer.exchangeRate !== undefined) {
                setExchangeRate(siteContent.apiServer.exchangeRate);
            }
            if (siteContent.apiServer.autoSyncPrice !== undefined) {
                setAutoSyncPrice(Boolean(siteContent.apiServer.autoSyncPrice));
            }
        }
    }, [
        siteContent?.apiServer?.marginPercent,
        siteContent?.apiServer?.exchangeRate,
        siteContent?.apiServer?.autoSyncPrice
    ]);

    // Testing state
    const [isTesting, setIsTesting] = useState(false);

    // Filtered APIs in table
    const filteredApis = useMemo(() => {
        if (!searchQuery.trim()) return apiServersList;
        const q = searchQuery.toLowerCase();
        return apiServersList.filter(api => 
            api.apiName.toLowerCase().includes(q) ||
            api.apiType.toLowerCase().includes(q) ||
            api.apiUrl.toLowerCase().includes(q)
        );
    }, [apiServersList, searchQuery]);

    // Open Modal for Add
    const handleOpenAddModal = () => {
        setEditingApiId(null);
        setFormApiName('E-Unlocker API');
        setFormApiType('GSM Theme');
        setFormApiUrl('');
        setFormUsername('');
        setFormAccessKey('');
        setFormStatus('Active');
        setFormAutoPlaceOrder(true);
        setFormAutoOrderSuccess(true);
        setFormDealerOrderMode('dealer_live_sync');
        setIsTypeDropdownOpen(false);
        setIsModalOpen(true);
    };

    // Open Modal for Edit
    const handleOpenEditModal = (api: ApiServerConfig) => {
        setEditingApiId(api.id);
        setFormApiName(api.apiName);
        setFormApiType(api.apiType || 'GSM Theme');
        setFormApiUrl(api.apiUrl);
        setFormUsername(api.username);
        setFormAccessKey(api.apiAccessKey);
        setFormStatus(api.status);
        setFormAutoPlaceOrder(api.autoPlaceOrder !== false);
        setFormAutoOrderSuccess(api.autoOrderSuccess !== false);
        setFormDealerOrderMode(api.dealerOrderMode || 'dealer_live_sync');
        setIsTypeDropdownOpen(false);
        setIsModalOpen(true);
    };

    // Quick 1-click toggle for Dealer Order Mode in table
    const handleQuickToggleAutoSuccess = (api: ApiServerConfig) => {
        const currentMode = api.dealerOrderMode || 'dealer_live_sync';
        const nextMode: 'dealer_live_sync' | 'instant_success' =
            currentMode === 'dealer_live_sync' ? 'instant_success' : 'dealer_live_sync';
        const updatedApi: ApiServerConfig = {
            ...api,
            autoPlaceOrder: true,
            autoOrderSuccess: true,
            dealerOrderMode: nextMode
        };
        const updatedList = apiServersList.map(a => a.id === api.id ? updatedApi : a);
        updateSiteContent('apiServers', updatedList);
        const currentSavedApi = siteContent?.apiServer || {};
        updateSiteContent('apiServer', {
            ...currentSavedApi,
            autoPlaceOrder: true,
            autoOrderSuccess: true,
            dealerOrderMode: nextMode
        });
        setNotification(
            nextMode === 'dealer_live_sync'
                ? `Dealer Team Live Control ON for "${api.apiName}": Dealer jo bhi karega (Processing / Success / Reject) wahi customer ko automatic notification jayega!`
                : `Instant Auto Success Mode ON for "${api.apiName}"!`,
            'success'
        );
    };

    // Save API handler
    const handleSaveApi = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formApiName.trim()) {
            setNotification('Please enter an API Name', 'error');
            return;
        }

        const newOrUpdatedApi: ApiServerConfig = {
            id: editingApiId || `api-${Date.now()}`,
            apiName: formApiName.trim(),
            apiType: formApiType,
            apiUrl: formApiUrl.trim(),
            username: formUsername.trim(),
            apiAccessKey: formAccessKey.trim(),
            balance: '2778.068',
            status: formStatus,
            autoPlaceOrder: formAutoPlaceOrder,
            autoOrderSuccess: formAutoOrderSuccess,
            dealerOrderMode: formDealerOrderMode,
            createdAt: new Date().toISOString()
        };

        let updatedList: ApiServerConfig[];
        if (editingApiId) {
            updatedList = apiServersList.map(a => a.id === editingApiId ? newOrUpdatedApi : a);
        } else {
            updatedList = [...apiServersList, newOrUpdatedApi];
        }

        const currentSavedApi = siteContent?.apiServer || {};
        const parsedMargin = marginPercent === '' ? (currentSavedApi.marginPercent ?? 15) : Number(marginPercent);
        const parsedRate = exchangeRate === '' ? (currentSavedApi.exchangeRate ?? 85.5) : Number(exchangeRate);
        const finalMargin = isNaN(parsedMargin) ? 15 : parsedMargin;
        const finalRate = isNaN(parsedRate) ? 85.5 : parsedRate;

        updateSiteContent('apiServers', updatedList);
        updateSiteContent('apiServer', {
            ...currentSavedApi,
            apiName: newOrUpdatedApi.apiName,
            apiType: newOrUpdatedApi.apiType,
            apiUrl: newOrUpdatedApi.apiUrl,
            username: newOrUpdatedApi.username,
            apiAccessKey: newOrUpdatedApi.apiAccessKey,
            balance: newOrUpdatedApi.balance,
            status: newOrUpdatedApi.status,
            autoPlaceOrder: newOrUpdatedApi.autoPlaceOrder,
            autoOrderSuccess: newOrUpdatedApi.autoOrderSuccess,
            dealerOrderMode: newOrUpdatedApi.dealerOrderMode,
            marginPercent: finalMargin,
            exchangeRate: finalRate,
            autoSyncPrice: Boolean(autoSyncPrice)
        });

        setIsModalOpen(false);
        setNotification(`API "${newOrUpdatedApi.apiName}" (${newOrUpdatedApi.apiType}) saved! Dealer Team Live Notification Sync is ACTIVE.`, 'success');

        // If URL provided, trigger service catalog sync
        if (newOrUpdatedApi.apiUrl) {
            try {
                await fetch('/api/fetch-gsm-services', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        apiUrl: newOrUpdatedApi.apiUrl,
                        username: newOrUpdatedApi.username,
                        exchangeRate: finalRate,
                        marginPercent: finalMargin
                    })
                });
            } catch (err) {}
        }
    };

    // Delete API handler
    const handleDeleteApi = (apiId: string) => {
        if (window.confirm('Are you sure you want to remove this API connection?')) {
            const updated = apiServersList.filter(a => a.id !== apiId);
            updateSiteContent('apiServers', updated);
            if (updated.length === 0) {
                updateSiteContent('apiServer', { status: 'Disabled', apiName: '', apiUrl: '', username: '', apiAccessKey: '' });
            }
            setNotification('API connection removed.', 'error');
        }
    };

    // Recalculate & update all catalog prices when Exchange Rate or Profit Margin changes
    const handleSavePricing = (e: React.FormEvent) => {
        e.preventDefault();
        const parsedMargin = marginPercent === '' ? 15 : Number(marginPercent);
        const parsedRate = exchangeRate === '' ? 85.5 : Number(exchangeRate);
        const finalMargin = isNaN(parsedMargin) ? 15 : parsedMargin;
        const finalRate = isNaN(parsedRate) ? 85.5 : parsedRate;

        // 1. Save directly to localStorage as instant synchronous backup
        localStorage.setItem('gsm_pricing_rules', JSON.stringify({
            marginPercent: finalMargin,
            exchangeRate: finalRate,
            autoSyncPrice: Boolean(autoSyncPrice)
        }));

        // 2. Update siteContent.apiServer
        const currentSavedApi = siteContent?.apiServer || {};
        const updatedApiServer = {
            ...currentSavedApi,
            marginPercent: finalMargin,
            exchangeRate: finalRate,
            autoSyncPrice: Boolean(autoSyncPrice)
        };
        updateSiteContent('apiServer', updatedApiServer);

        // 3. Update products
        let count = 0;
        products.forEach((p) => {
            let baseUsd = p.usdPrice;
            if (!baseUsd && p.price > 0) {
                baseUsd = p.price / (85.5 * 1.15);
            }
            if (baseUsd && baseUsd > 0) {
                const newInrCost = baseUsd * finalRate;
                const newSellingPrice = Math.round((newInrCost * (1 + finalMargin / 100)) * 100) / 100;
                updateProduct({
                    ...p,
                    price: newSellingPrice,
                    providerCost: Math.round(newInrCost * 100) / 100
                });
                count++;
            }
        });

        setNotification(`Pricing Rules Saved! Profit Margin: ${finalMargin}%, 1 USD = ₹${finalRate}. ${count > 0 ? `${count} service prices updated!` : ''}`, 'success');
    };

    const currentSelectedConfig = API_TYPES_CONFIG[formApiType] || API_TYPES_CONFIG['GSM Theme'];

    return (
        <div className="max-w-7xl mx-auto pb-12 font-sans animate-in fade-in duration-150">
            
            {/* Top Navigation Bar / Tabs */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setAutomationTab('api_list')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                            automationTab === 'api_list'
                                ? 'bg-[#242424] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                    >
                        <span>API List</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[10px] font-black">
                            {apiServersList.length}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setAutomationTab('builtin')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                            automationTab === 'builtin'
                                ? 'bg-[#242424] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                    >
                        <span>Build-in API</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-400 text-white text-[10px] font-black">
                            1
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setAutomationTab('cron')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                            automationTab === 'cron'
                                ? 'bg-[#242424] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                    >
                        <span>Corn Job List</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setAutomationTab('pricing')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                            automationTab === 'pricing'
                                ? 'bg-[#242424] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        }`}
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Pricing & Rules</span>
                    </button>
                </div>
            </div>

            {/* TAB 1: API List (Exact matching the user screenshot) */}
            {automationTab === 'api_list' && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                    {/* Auto Order Automation Status Banner */}
                    <div className="px-4 sm:px-5 py-3 bg-emerald-50/90 border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-emerald-900">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                            <span className="font-bold">Dealer API Live Team Sync Active (24x7):</span>
                            <span className="text-emerald-700">
                                Dealer is API mein order ke saath jo bhi karega (<strong>Processing</strong>, <strong>Success</strong>, ya <strong>Reject + Auto Refund</strong>), wahi Dealer Team karegi aur customer ke paas notification <strong>automatically</strong> pahunch jayega.
                            </span>
                        </div>
                    </div>

                    {/* Header Bar */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
                        <h2 className="text-base font-bold text-slate-800 tracking-tight">
                            API List - {filteredApis.length}
                        </h2>

                        <div className="flex items-center gap-2">
                            {/* Search Bar matching screenshot */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search"
                                    className="w-48 sm:w-60 px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-800"
                                />
                            </div>

                            {/* Red "+" Button exactly matching screenshot */}
                            <button
                                type="button"
                                onClick={handleOpenAddModal}
                                title="Add new API"
                                className="bg-[#dc2626] hover:bg-[#b91c1c] text-white p-2 rounded-md font-bold shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                            >
                                <Plus className="w-4 h-4 stroke-[3]" />
                            </button>
                        </div>
                    </div>

                    {/* Table View matching screenshot columns: API NAME, API TYPE, API URL, AUTO ORDER, BALANCE, STATUS */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                    <th className="py-3 px-5">API NAME</th>
                                    <th className="py-3 px-4">API TYPE</th>
                                    <th className="py-3 px-4">API URL</th>
                                    <th className="py-3 px-4">DEALER TEAM AUTO SYNC</th>
                                    <th className="py-3 px-4">BALANCE</th>
                                    <th className="py-3 px-4">STATUS</th>
                                    <th className="py-3 px-4 text-right">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredApis.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                                            No data available in table
                                        </td>
                                    </tr>
                                ) : (
                                    filteredApis.map((api) => {
                                        const typeCfg = API_TYPES_CONFIG[api.apiType] || API_TYPES_CONFIG['GSM Theme'];
                                        const mode = api.dealerOrderMode || 'dealer_live_sync';
                                        return (
                                            <tr key={api.id} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="py-3.5 px-5 font-bold text-slate-900">
                                                    {api.apiName}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 border border-slate-200">
                                                        {typeCfg.logo}
                                                        <span className="font-semibold text-slate-800 text-[11px]">
                                                            {api.apiType}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-mono text-slate-600 truncate max-w-xs">
                                                    {api.apiUrl || '-'}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleQuickToggleAutoSuccess(api)}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all border ${
                                                            mode === 'dealer_live_sync'
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                                                : 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                                                        }`}
                                                        title="Click to switch between Dealer Team Live Sync and Instant Success"
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${mode === 'dealer_live_sync' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                                                        <span>
                                                            {mode === 'dealer_live_sync'
                                                                ? 'Dealer Team Live (Success/Process/Reject + Auto Notify)'
                                                                : 'Instant Auto Success: ON'}
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                                                    ₹{api.balance || '0.00'}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                        api.status === 'Active' 
                                                            ? 'bg-emerald-100 text-emerald-800' 
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                        {api.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditModal(api)}
                                                        className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-all cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteApi(api.id)}
                                                        className="px-2 py-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB 2: Build-in API (1) */}
            {automationTab === 'builtin' && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                            <Server className="w-5 h-5 text-teal-600" />
                            <h3 className="font-bold text-sm text-slate-900">Build-in Internal GSM & Firmware API</h3>
                        </div>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                            Active (Online)
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <p className="font-bold text-slate-800">1. Direct Dealer Order Forward & Live Status Sync</p>
                            <p className="text-slate-500">Automatically pushes customer orders to your connected Dealer API (`placeimeiorder`) and polls live status (`getimeiorder`) every 8 seconds for Processing / Success / Reject updates.</p>
                            <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-teal-700">
                                POST /api/place-dealer-order &amp; /api/check-dealer-orders
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                            <p className="font-bold text-slate-800">2. Dealer Team Instant Webhook / Callback URL</p>
                            <p className="text-slate-500">When Dealer Team marks an order Processing, Success, or Rejected, it automatically updates customer status, refunds wallet on Reject, and sends instant customer notification.</p>
                            <div className="font-mono text-[11px] bg-white p-2 rounded border border-slate-200 text-emerald-700 select-all">
                                https://wowfilewala.com/cloud-sync.php?action=dealer_webhook
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: Corn Job List (Cron Jobs) */}
            {automationTab === 'cron' && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            <h3 className="font-bold text-sm text-slate-900">Corn Job List (Automated Process Schedulers)</h3>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                            3 Jobs Configured
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                                <p className="font-bold text-slate-800">Auto Update Price (Every 1 Hour)</p>
                                <p className="text-slate-500 font-mono text-[11px]">curl -s https://wowfilewala.com/cron/price-update</p>
                            </div>
                            <span className="text-emerald-600 font-bold">● Active</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                                <p className="font-bold text-slate-800">Auto Sync Dealer Order Status: Processing / Success / Reject (Live Every 8 Secs)</p>
                                <p className="text-slate-500 font-mono text-[11px]">curl -s https://wowfilewala.com/cloud-sync.php?action=check_dealer_orders</p>
                            </div>
                            <span className="text-emerald-600 font-bold">● Active</span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                                <p className="font-bold text-slate-800">Auto Update Delivery Time & Balance (Every 30 Mins)</p>
                                <p className="text-slate-500 font-mono text-[11px]">curl -s https://wowfilewala.com/cron/sync-balance</p>
                            </div>
                            <span className="text-emerald-600 font-bold">● Active</span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: Pricing Rules */}
            {automationTab === 'pricing' && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 max-w-2xl">
                    <h3 className="font-bold text-sm text-slate-900 mb-4 border-b border-slate-200 pb-2">
                        Exchange Rate & Profit Margin Settings
                    </h3>
                    <form onSubmit={handleSavePricing} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Profit Margin (%)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={marginPercent}
                                onChange={(e) => setMarginPercent(e.target.value === '' ? '' : e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-bold text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                                placeholder="15"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">Automatic profit margin added to provider base costs.</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                                Exchange Rate (1 USD = INR)
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={exchangeRate}
                                onChange={(e) => setExchangeRate(e.target.value === '' ? '' : e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded text-sm font-bold text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                                placeholder="85.5"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="autoSync"
                                checked={autoSyncPrice}
                                onChange={(e) => setAutoSyncPrice(e.target.checked)}
                                className="w-4 h-4 rounded text-slate-900 cursor-pointer"
                            />
                            <label htmlFor="autoSync" className="text-xs text-slate-700 font-medium cursor-pointer">
                                Auto update catalog prices when API prices change
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="mt-4 px-5 py-2.5 bg-[#18181b] hover:bg-black text-white font-bold text-xs rounded transition-all cursor-pointer"
                        >
                            Save Pricing Rules
                        </button>
                    </form>
                </div>
            )}

            {/* ============================================================== */}
            {/* MODAL: "Add new API" / "Edit API" EXACTLY MATCHING SCREENSHOT */}
            {/* ============================================================== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                                {editingApiId ? 'Edit API' : 'Add new API'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body: Left Inputs + Right Features Panel */}
                        <form onSubmit={handleSaveApi}>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                                
                                {/* LEFT COLUMN: Form Fields */}
                                <div className="md:col-span-6 space-y-4">
                                    
                                    {/* 1. API Name */}
                                    <div className="grid grid-cols-12 items-center gap-2">
                                        <label className="col-span-4 text-xs font-medium text-slate-700">
                                            API Name
                                        </label>
                                        <div className="col-span-8">
                                            <input
                                                type="text"
                                                value={formApiName}
                                                onChange={(e) => setFormApiName(e.target.value)}
                                                placeholder="E-Unlocker API"
                                                required
                                                className="w-full px-3 py-2 bg-[#f8fafc] focus:bg-white border border-slate-300 focus:border-blue-500 rounded-md text-xs text-slate-800 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* 2. API Type (CUSTOM DROPDOWN WITH LOGOS MATCHING SCREENSHOT) */}
                                    <div className="grid grid-cols-12 items-center gap-2 relative">
                                        <label className="col-span-4 text-xs font-medium text-slate-700">
                                            API Type
                                        </label>
                                        <div className="col-span-8 relative">
                                            {/* Select Button */}
                                            <div
                                                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-800 flex items-center justify-between cursor-pointer shadow-2xs hover:border-slate-400 select-none"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {currentSelectedConfig.logo}
                                                    <span className="font-semibold">{formApiType}</span>
                                                </div>
                                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                                            </div>

                                            {/* Dropdown Menu Options matching user photo */}
                                            {isTypeDropdownOpen && (
                                                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl z-50 py-1 overflow-hidden animate-in fade-in duration-100 max-h-60 overflow-y-auto">
                                                    {ALL_API_TYPES.map((type) => {
                                                        const cfg = API_TYPES_CONFIG[type];
                                                        const isSelected = formApiType === type;
                                                        return (
                                                            <div
                                                                key={type}
                                                                onClick={() => {
                                                                    setFormApiType(type);
                                                                    setIsTypeDropdownOpen(false);
                                                                }}
                                                                className={`px-3 py-2 text-xs flex items-center gap-2.5 cursor-pointer transition-colors ${
                                                                    isSelected 
                                                                        ? 'bg-blue-500 text-white font-bold' 
                                                                        : 'text-slate-800 hover:bg-slate-100'
                                                                }`}
                                                            >
                                                                {cfg.logo}
                                                                <span className="flex-1">{type}</span>
                                                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 3. API Url */}
                                    <div className="grid grid-cols-12 items-center gap-2">
                                        <label className="col-span-4 text-xs font-medium text-slate-700">
                                            API Url
                                        </label>
                                        <div className="col-span-8">
                                            <input
                                                type="text"
                                                value={formApiUrl}
                                                onChange={(e) => setFormApiUrl(e.target.value)}
                                                placeholder={currentSelectedConfig.urlExample}
                                                className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-blue-500 rounded-md text-xs text-slate-800 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* 4. Username */}
                                    <div className="grid grid-cols-12 items-center gap-2">
                                        <label className="col-span-4 text-xs font-medium text-slate-700">
                                            Username
                                        </label>
                                        <div className="col-span-8">
                                            <input
                                                type="text"
                                                value={formUsername}
                                                onChange={(e) => setFormUsername(e.target.value)}
                                                placeholder="Username"
                                                className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-blue-500 rounded-md text-xs text-slate-800 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* 5. Access Key */}
                                    <div className="grid grid-cols-12 items-center gap-2">
                                        <label className="col-span-4 text-xs font-medium text-slate-700">
                                            Access Key
                                        </label>
                                        <div className="col-span-8">
                                            <input
                                                type="text"
                                                value={formAccessKey}
                                                onChange={(e) => setFormAccessKey(e.target.value)}
                                                placeholder="Access Key / API Token"
                                                className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-blue-500 rounded-md text-xs text-slate-800 font-mono outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* 6. Dealer Team Live Status & Auto Notification Settings */}
                                    <div className="pt-2 border-t border-slate-200 space-y-2.5">
                                        <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-emerald-50/90 border border-emerald-200 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="dealerOrderMode"
                                                checked={formDealerOrderMode === 'dealer_live_sync'}
                                                onChange={() => {
                                                    setFormDealerOrderMode('dealer_live_sync');
                                                    setFormAutoPlaceOrder(true);
                                                }}
                                                className="mt-0.5 w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                            />
                                            <div className="text-[11px] leading-snug">
                                                <span className="font-bold text-emerald-950 block">
                                                    Dealer Team Live Control (Processing / Success / Reject + Auto Notify)
                                                </span>
                                                <span className="text-emerald-700">
                                                    Dealer is API mein jo bhi karega (Reject, Processing, ya Success), wahi Dealer Team karegi aur customer ke paas automatic notification aur Reject par Wallet Refund pahunch jayega.
                                                </span>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="dealerOrderMode"
                                                checked={formDealerOrderMode === 'instant_success'}
                                                onChange={() => {
                                                    setFormDealerOrderMode('instant_success');
                                                    setFormAutoPlaceOrder(true);
                                                    setFormAutoOrderSuccess(true);
                                                }}
                                                className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                            <div className="text-[11px] leading-snug">
                                                <span className="font-bold text-blue-950 block">
                                                    Instant Auto Success Mode
                                                </span>
                                                <span className="text-blue-700">
                                                    User ke order dalte hi Dealer API ko notification bhej kar turant Success dikhayega.
                                                </span>
                                            </div>
                                        </label>
                                    </div>

                                </div>

                                {/* RIGHT COLUMN: Features list + URL Example exactly matching screenshot */}
                                <div className="md:col-span-6 bg-slate-50/70 p-4 rounded-lg border border-slate-200/80 space-y-4">
                                    
                                    {/* Header: [TYPE] API FEATURE */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2.5">
                                            {formApiType.toUpperCase()} API FEATURE
                                        </h4>
                                        <div className="space-y-2">
                                            {currentSelectedConfig.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                                                    <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                                                    </span>
                                                    <span>{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Header: [TYPE] API URL EXAMPLE */}
                                    <div className="pt-2 border-t border-slate-200">
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                                            {formApiType.toUpperCase()} API URL EXAMPLE
                                        </h4>
                                        <p className="text-xs font-mono text-slate-600 bg-white p-2 rounded border border-slate-200 break-all select-all">
                                            {currentSelectedConfig.urlExample}
                                        </p>
                                    </div>

                                </div>

                            </div>

                            {/* Modal Footer: Red Add Button matching screenshot */}
                            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
                                <button
                                    type="submit"
                                    className="bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold py-2 px-5 rounded-md text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                                >
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>{editingApiId ? 'Update' : 'Add'}</span>
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

        </div>
    );
};

export default HostingraConnectorPage;
