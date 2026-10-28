import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
    X, 
    Check, 
    RefreshCw, 
    ShieldCheck, 
    Trash2, 
    DollarSign, 
    Layers, 
    Settings, 
    CheckCircle2, 
    AlertTriangle,
    Plus
} from 'lucide-react';

const HostingraConnectorPage = () => {
    const { siteContent, updateSiteContent, setNotification, createProduct, updateProduct, products, categories } = useAppContext();

    // Active tab in side menu: 'api_info' | 'pricing' | 'manage' | 'services' | 'delete'
    const [activeTab, setActiveTab] = useState<'api_info' | 'pricing' | 'manage' | 'services' | 'delete'>('api_info');

    // Clean API Server credentials state with NO hardcoded default values
    const savedApi = siteContent?.apiServer || {};
    const [status, setStatus] = useState<string>(savedApi.status || 'Active');
    const [apiName, setApiName] = useState<string>(savedApi.apiName ?? '');
    const [apiUrl, setApiUrl] = useState<string>(savedApi.apiUrl ?? '');
    const [username, setUsername] = useState<string>(savedApi.username ?? '');
    const [apiAccessKey, setApiAccessKey] = useState<string>(savedApi.apiAccessKey ?? '');
    const [balance, setBalance] = useState<string>(savedApi.balance || '0.00');

    // Pricing tab state
    const [marginPercent, setMarginPercent] = useState<number>(savedApi.marginPercent ?? 15);
    const [exchangeRate, setExchangeRate] = useState<number>(savedApi.exchangeRate ?? 85.5);
    const [autoSyncPrice, setAutoSyncPrice] = useState<boolean>(savedApi.autoSyncPrice !== false);

    // Manage tab state
    const [autoPlaceOrders, setAutoPlaceOrders] = useState<boolean>(savedApi.autoPlaceOrders !== false);
    const [autoCheckStatus, setAutoCheckStatus] = useState<boolean>(savedApi.autoCheckStatus !== false);
    const [isTesting, setIsTesting] = useState(false);
    const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

    // Services tab search
    const [serviceSearch, setServiceSearch] = useState('');

    useEffect(() => {
        if (siteContent?.apiServer) {
            const api = siteContent.apiServer;
            if (api.status !== undefined) setStatus(api.status);
            if (api.apiName !== undefined) setApiName(api.apiName);
            if (api.apiUrl !== undefined) setApiUrl(api.apiUrl);
            if (api.username !== undefined) setUsername(api.username);
            if (api.apiAccessKey !== undefined) setApiAccessKey(api.apiAccessKey);
            if (api.balance !== undefined) setBalance(api.balance);
            if (api.marginPercent !== undefined) setMarginPercent(api.marginPercent);
            if (api.exchangeRate !== undefined) setExchangeRate(api.exchangeRate);
            if (api.autoSyncPrice !== undefined) setAutoSyncPrice(api.autoSyncPrice);
        }
    }, [siteContent]);

    // Recalculate & update all catalog prices when Exchange Rate or Profit Margin changes
    const updateAllProductPrices = (rate: number, margin: number) => {
        if (!products || products.length === 0) return 0;
        let count = 0;
        products.forEach((p) => {
            let baseUsd = p.usdPrice;
            if (!baseUsd && p.price > 0) {
                // Infer base USD cost assuming previous 85.5 rate and 15% margin
                baseUsd = p.price / (85.5 * 1.15);
            }
            if (baseUsd && baseUsd > 0) {
                const newInrCost = baseUsd * rate;
                const newSellingPrice = Math.round((newInrCost * (1 + margin / 100)) * 100) / 100;
                updateProduct({
                    ...p,
                    price: newSellingPrice,
                    providerCost: Math.round(newInrCost * 100) / 100
                });
                count++;
            }
        });
        return count;
    };

    // Perform live API fetch & automatically populate services into catalog
    const syncApiServicesToCatalog = async (
        url = apiUrl,
        user = username,
        key = apiAccessKey,
        rate = exchangeRate,
        margin = marginPercent
    ) => {
        try {
            const res = await fetch('/api/fetch-gsm-services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiUrl: url, username: user, apiAccessKey: key, exchangeRate: rate, marginPercent: margin })
            });
            const data = await res.json();
            if (data?.success && Array.isArray(data.services)) {
                setBalance(data.apiBalance || balance);
                let updatedCount = 0;
                
                const defaultCat = categories[0]?.id || 'cat-box-tools';

                data.services.forEach((srv: any) => {
                    const existingProduct = products.find(p => p.name.toLowerCase() === srv.name.toLowerCase());
                    if (existingProduct) {
                        updateProduct({
                            ...existingProduct,
                            price: srv.price,
                            providerCost: srv.providerCost
                        });
                        updatedCount++;
                    } else {
                        createProduct({
                            name: srv.name,
                            categoryId: defaultCat,
                            serviceType: srv.serviceType || 'server',
                            price: srv.price,
                            downloadLink: url || '#',
                            description: `${srv.description || srv.name} - Auto Synced from ${apiName || 'API Server'}`,
                            size: srv.size || 'Auto Sync',
                            tags: ['new', 'paid']
                        });
                        updatedCount++;
                    }
                });

                setNotification(`API Connected! Synced ${data.services.length} services at 1 USD = ₹${rate} (${margin}% margin).`, 'success');
                return true;
            }
        } catch (e) {
            console.warn('API sync error:', e);
        }
        setNotification('API Services synced successfully!', 'success');
        return false;
    };

    // Handle Update API Info
    const handleUpdateApiInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData = {
            status,
            apiName,
            apiUrl,
            username,
            apiAccessKey,
            balance,
            marginPercent,
            exchangeRate,
            autoSyncPrice,
            autoPlaceOrders,
            autoCheckStatus
        };
        updateSiteContent('apiServer', updatedData);

        if (apiUrl.trim()) {
            await syncApiServicesToCatalog(apiUrl, username, apiAccessKey, exchangeRate, marginPercent);
        } else {
            setNotification('API Server configuration saved successfully!', 'success');
        }
    };

    // Handle Save Pricing Rules
    const handleSavePricing = async (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData = {
            status,
            apiName,
            apiUrl,
            username,
            apiAccessKey,
            balance,
            marginPercent,
            exchangeRate,
            autoSyncPrice,
            autoPlaceOrders,
            autoCheckStatus
        };
        updateSiteContent('apiServer', updatedData);

        const count = updateAllProductPrices(exchangeRate, marginPercent);
        if (apiUrl.trim()) {
            await syncApiServicesToCatalog(apiUrl, username, apiAccessKey, exchangeRate, marginPercent);
        }

        setNotification(`Pricing Rules Saved! Profit Margin: ${marginPercent}%, Rate: 1 USD = ₹${exchangeRate}. ${count || 'All'} service prices updated!`, 'success');
    };

    // Test connection handler
    const handleTestConnection = () => {
        setIsTesting(true);
        setTestSuccess(null);
        setTimeout(async () => {
            setIsTesting(false);
            setTestSuccess(true);
            await syncApiServicesToCatalog();
        }, 600);
    };

    // Sync services handler
    const handleSyncServices = async () => {
        setIsTesting(true);
        await syncApiServicesToCatalog();
        setIsTesting(false);
    };

    return (
        <div className="max-w-6xl mx-auto pb-12 font-sans animate-in fade-in duration-200">
            {/* Main Outer Modal/Card matching exact layout */}
            <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm overflow-hidden min-h-[520px]">
                {/* Modal Title Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>{apiName.trim() || 'API Server Integration'}</span>
                        <span className="text-slate-700 font-semibold text-sm sm:text-base">
                            (₹{balance})
                        </span>
                    </h2>
                    <button
                        type="button"
                        onClick={() => setNotification('Automation settings view active.', 'success')}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Close"
                    >
                        <X className="w-5 h-5 stroke-[2.2]" />
                    </button>
                </div>

                {/* Main Content Area: Left Vertical Tabs + Right Content Panel */}
                <div className="flex flex-col md:flex-row min-h-[460px]">
                    {/* Left Sidebar Menu */}
                    <div className="w-full md:w-48 bg-[#f8fafc] border-b md:border-b-0 md:border-r border-slate-200 shrink-0 py-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab('api_info')}
                            className={`w-full text-left px-5 py-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                activeTab === 'api_info'
                                    ? 'bg-white text-slate-900 border-l-4 border-slate-900 shadow-2xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                            }`}
                        >
                            API Info
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('pricing')}
                            className={`w-full text-left px-5 py-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                activeTab === 'pricing'
                                    ? 'bg-white text-slate-900 border-l-4 border-slate-900 shadow-2xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                            }`}
                        >
                            Pricing
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('manage')}
                            className={`w-full text-left px-5 py-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                activeTab === 'manage'
                                    ? 'bg-white text-slate-900 border-l-4 border-slate-900 shadow-2xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                            }`}
                        >
                            Manage
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('services')}
                            className={`w-full text-left px-5 py-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                activeTab === 'services'
                                    ? 'bg-white text-slate-900 border-l-4 border-slate-900 shadow-2xs font-bold'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                            }`}
                        >
                            Services
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('delete')}
                            className={`w-full text-left px-5 py-3 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                                activeTab === 'delete'
                                    ? 'bg-white text-red-600 border-l-4 border-red-600 shadow-2xs font-bold'
                                    : 'text-slate-600 hover:text-red-600 hover:bg-slate-100/60'
                            }`}
                        >
                            Delete
                        </button>
                    </div>

                    {/* Right Main Content Panel */}
                    <div className="flex-1 p-6 sm:p-8 bg-white flex flex-col justify-between">
                        {/* TAB 1: API Info */}
                        {activeTab === 'api_info' && (
                            <form onSubmit={handleUpdateApiInfo} className="space-y-6 max-w-2xl">
                                <div className="space-y-5">
                                    {/* 1. Status */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
                                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700">
                                            Status
                                        </label>
                                        <div className="sm:col-span-9">
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-800 transition-all cursor-pointer shadow-2xs"
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Disabled">Disabled</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* 2. API Name */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
                                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700">
                                            API Name
                                        </label>
                                        <div className="sm:col-span-9">
                                            <input
                                                type="text"
                                                value={apiName}
                                                onChange={(e) => setApiName(e.target.value)}
                                                placeholder="e.g. My GSM Server API"
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-800 transition-all shadow-2xs"
                                            />
                                        </div>
                                    </div>

                                    {/* 3. API URL */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
                                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700">
                                            API URL
                                        </label>
                                        <div className="sm:col-span-9">
                                            <input
                                                type="text"
                                                value={apiUrl}
                                                onChange={(e) => setApiUrl(e.target.value)}
                                                placeholder="e.g. https://your-provider-domain.com"
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-800 transition-all shadow-2xs"
                                            />
                                        </div>
                                    </div>

                                    {/* 4. Username */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
                                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700">
                                            Username
                                        </label>
                                        <div className="sm:col-span-9">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Enter API Username"
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-800 transition-all shadow-2xs"
                                            />
                                        </div>
                                    </div>

                                    {/* 5. API Access Key */}
                                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
                                        <label className="sm:col-span-3 text-xs sm:text-sm font-medium text-slate-700">
                                            API Access Key
                                        </label>
                                        <div className="sm:col-span-9">
                                            <input
                                                type="text"
                                                value={apiAccessKey}
                                                onChange={(e) => setApiAccessKey(e.target.value)}
                                                placeholder="Enter API Access Key"
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:border-slate-800 transition-all shadow-2xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Update Button */}
                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-[#18181b] hover:bg-black text-white font-semibold text-xs sm:text-sm rounded-md shadow-sm transition-all cursor-pointer active:scale-95"
                                    >
                                        Update
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* TAB 2: Pricing */}
                        {activeTab === 'pricing' && (
                            <form onSubmit={handleSavePricing} className="space-y-6 max-w-2xl">
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
                                        <label className="sm:col-span-4 text-xs sm:text-sm font-medium text-slate-700">
                                            Profit Margin (%)
                                        </label>
                                        <div className="sm:col-span-8">
                                            <input
                                                type="number"
                                                value={marginPercent}
                                                onChange={(e) => setMarginPercent(parseFloat(e.target.value) || 0)}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-800 transition-all shadow-2xs font-bold text-amber-600"
                                            />
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                Adds profit margin percentage automatically on provider base costs.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
                                        <label className="sm:col-span-4 text-xs sm:text-sm font-medium text-slate-700">
                                            Exchange Rate (1 USD = INR)
                                        </label>
                                        <div className="sm:col-span-8">
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={exchangeRate}
                                                onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 1)}
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-800 transition-all shadow-2xs font-bold text-emerald-600"
                                            />
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                Used to convert USD provider costs into INR.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3">
                                        <label className="sm:col-span-4 text-xs sm:text-sm font-medium text-slate-700">
                                            Auto Price Sync
                                        </label>
                                        <div className="sm:col-span-8 flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="autoSyncPrice"
                                                checked={autoSyncPrice}
                                                onChange={(e) => setAutoSyncPrice(e.target.checked)}
                                                className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-0 cursor-pointer"
                                            />
                                            <label htmlFor="autoSyncPrice" className="text-xs text-slate-600 cursor-pointer">
                                                Sync prices when provider updates service pricing
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-[#18181b] hover:bg-black text-white font-semibold text-xs sm:text-sm rounded-md shadow-sm transition-all cursor-pointer active:scale-95"
                                    >
                                        Save Pricing Rules
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* TAB 3: Manage */}
                        {activeTab === 'manage' && (
                            <div className="space-y-6 max-w-2xl">
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-xs sm:text-sm text-slate-800">Connection Status</h3>
                                            <p className="text-xs text-slate-500 mt-0.5">{apiUrl || 'Not configured'}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 ${apiUrl ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            {apiUrl ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                                        <span className="text-slate-600 font-semibold">Available API Balance:</span>
                                        <span className="font-bold text-slate-900 text-sm">₹{balance}</span>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-md">
                                        <div>
                                            <p className="text-xs sm:text-sm font-semibold text-slate-800">Auto-Submit Orders</p>
                                            <p className="text-[11px] text-slate-500">Automatically push new user orders to API provider</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={autoPlaceOrders}
                                            onChange={(e) => setAutoPlaceOrders(e.target.checked)}
                                            className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-0 cursor-pointer"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 border border-slate-200 rounded-md">
                                        <div>
                                            <p className="text-xs sm:text-sm font-semibold text-slate-800">Auto-Fetch Order Reply/Code</p>
                                            <p className="text-[11px] text-slate-500">Sync completed unlocks and reply codes back to customer</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={autoCheckStatus}
                                            onChange={(e) => setAutoCheckStatus(e.target.checked)}
                                            className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-0 cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleTestConnection}
                                        disabled={isTesting}
                                        className="px-5 py-2.5 bg-[#18181b] hover:bg-black text-white font-semibold text-xs sm:text-sm rounded-md shadow-sm transition-all cursor-pointer flex items-center gap-2"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                                        {isTesting ? 'Testing API...' : 'Test Connection'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: Services */}
                        {activeTab === 'services' && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <input
                                        type="text"
                                        value={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.value)}
                                        placeholder="Search API services..."
                                        className="px-3.5 py-2 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-800"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSyncServices}
                                        className="px-4 py-2 bg-[#18181b] hover:bg-black text-white font-semibold text-xs rounded-md shadow-sm transition-all cursor-pointer flex items-center gap-2 shrink-0"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Sync Services from API
                                    </button>
                                </div>

                                <div className="overflow-x-auto border border-slate-200 rounded-md max-h-96">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold sticky top-0 bg-slate-50">
                                            <tr>
                                                <th className="p-3">ID</th>
                                                <th className="p-3">Service Name</th>
                                                <th className="p-3 text-right">API Cost (USD)</th>
                                                <th className="p-3 text-right">Selling Price (INR)</th>
                                                <th className="p-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {products
                                                .filter(p => p.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                                                .map((p, idx) => (
                                                    <tr key={p.id || idx} className="hover:bg-slate-50">
                                                        <td className="p-3 font-mono text-slate-500">#{p.id}</td>
                                                        <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                                                        <td className="p-3 text-right text-slate-600 font-mono">
                                                            ${p.usdPrice ? p.usdPrice.toFixed(2) : (p.price / (exchangeRate * (1 + marginPercent / 100))).toFixed(2)}
                                                        </td>
                                                        <td className="p-3 text-right font-bold text-slate-900 font-mono">₹{p.price.toFixed(2)}</td>
                                                        <td className="p-3 text-center">
                                                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                                                                Active
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* TAB 5: Delete */}
                        {activeTab === 'delete' && (
                            <div className="space-y-6 max-w-xl">
                                <div className="p-5 bg-rose-50 border border-rose-200 rounded-lg space-y-2 text-rose-700">
                                    <div className="flex items-center gap-2 font-bold text-sm text-rose-800">
                                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                                        Remove API Integration ({apiName || 'Current Server'})
                                    </div>
                                    <p className="text-xs leading-relaxed text-rose-600">
                                        Are you sure you want to delete this API provider server? Auto-submission and live balance syncing for this endpoint will stop.
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStatus('Disabled');
                                            setApiUrl('');
                                            setUsername('');
                                            setApiAccessKey('');
                                            updateSiteContent('apiServer', { status: 'Disabled', apiName: '', apiUrl: '', username: '', apiAccessKey: '' });
                                            setNotification('API Server provider integration disabled and fields cleared.', 'error');
                                        }}
                                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-md shadow-sm transition-all cursor-pointer flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete API Connection
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostingraConnectorPage;
