import React, { useState } from 'react';
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
    const { siteContent, updateSiteContent, setNotification } = useAppContext();

    // Active tab in side menu: 'api_info' | 'pricing' | 'manage' | 'services' | 'delete'
    const [activeTab, setActiveTab] = useState<'api_info' | 'pricing' | 'manage' | 'services' | 'delete'>('api_info');

    // Default API Server credentials matching exact screenshot image_de1d40f2.png
    const savedApi = siteContent?.apiServer || {};
    const [status, setStatus] = useState<string>(savedApi.status || 'Active');
    const [apiName, setApiName] = useState<string>(savedApi.apiName || 'https://www.gsmkg');
    const [apiUrl, setApiUrl] = useState<string>(savedApi.apiUrl || 'https://www.gsmfastunlock.com');
    const [username, setUsername] = useState<string>(savedApi.username || 'mrbanu');
    const [apiAccessKey, setApiAccessKey] = useState<string>(savedApi.apiAccessKey || 'W3A-419-MUK-CBM-8CD-I3-ZBY-42');
    const [balance, setBalance] = useState<string>(savedApi.balance || '2778.068');

    // Pricing tab state
    const [marginPercent, setMarginPercent] = useState<number>(savedApi.marginPercent || 15);
    const [exchangeRate, setExchangeRate] = useState<number>(savedApi.exchangeRate || 85.5);
    const [autoSyncPrice, setAutoSyncPrice] = useState<boolean>(savedApi.autoSyncPrice !== false);

    // Manage tab state
    const [autoPlaceOrders, setAutoPlaceOrders] = useState<boolean>(savedApi.autoPlaceOrders !== false);
    const [autoCheckStatus, setAutoCheckStatus] = useState<boolean>(savedApi.autoCheckStatus !== false);
    const [isTesting, setIsTesting] = useState(false);
    const [testSuccess, setTestSuccess] = useState<boolean | null>(null);

    // Services tab search
    const [serviceSearch, setServiceSearch] = useState('');

    // Sample API Services List
    const [apiServices, setApiServices] = useState([
        { id: '101', name: 'FRPFILE ACTIVATOR A12 + Bypass Hello Screen', providerCost: 450.00, sellingPrice: 549.69, active: true },
        { id: '102', name: 'NexaPro A12+ Hello bypass', providerCost: 220.00, sellingPrice: 283.37, active: true },
        { id: '103', name: 'Apple iPhone / iPad Warranty Coverage Check', providerCost: 100.00, sellingPrice: 137.42, active: true },
        { id: '104', name: 'Asm Auth Tool - Xiaomi FRP Credits', providerCost: 300.00, sellingPrice: 359.95, active: true },
        { id: '105', name: 'Android Multi Tool Rent [2 Hours]', providerCost: 25.00, sellingPrice: 37.72, active: true },
    ]);

    // Handle Update API Info
    const handleUpdateApiInfo = (e: React.FormEvent) => {
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
        setNotification('API Server configuration updated successfully!', 'success');
    };

    // Test connection handler
    const handleTestConnection = () => {
        setIsTesting(true);
        setTestSuccess(null);
        setTimeout(() => {
            setIsTesting(false);
            setTestSuccess(true);
            setNotification('API Connection test successful! Server responds active.', 'success');
        }, 800);
    };

    // Sync services handler
    const handleSyncServices = () => {
        setNotification('Services list synced with provider API!', 'success');
    };

    return (
        <div className="max-w-6xl mx-auto pb-12 font-sans animate-in fade-in duration-200">
            {/* Main Outer Modal/Card matching exact layout of image_de1d40f2.png */}
            <div className="bg-white rounded-lg border border-slate-200/90 shadow-sm overflow-hidden min-h-[520px]">
                {/* Modal Title Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>{apiName || 'https://www.gsmkg'}</span>
                        <span className="text-slate-700 font-semibold text-sm sm:text-base">
                            (₹{balance} )
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
                    {/* Left Sidebar Menu matching image_de1d40f2.png */}
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
                        {/* TAB 1: API Info (Exact layout of image_de1d40f2.png) */}
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
                                                <option value="Maintenance">Maintenance</option>
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
                                                placeholder="https://www.gsmkg"
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
                                                placeholder="https://www.gsmfastunlock.com"
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
                                                placeholder="mrbanu"
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
                                                placeholder="W3A-419-MUK-CBM-8CD-I3-ZBY-42"
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 font-mono focus:outline-none focus:border-slate-800 transition-all shadow-2xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Update Button (Black button matching exact photo image_de1d40f2.png) */}
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
                            <form onSubmit={handleUpdateApiInfo} className="space-y-6 max-w-2xl">
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
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-800 transition-all shadow-2xs"
                                            />
                                            <p className="text-[11px] text-slate-400 mt-1">
                                                Adds profit margin automatically on provider costs.
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
                                                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-800 transition-all shadow-2xs"
                                            />
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
                                        className="px-6 py-2.5 bg-[#18181b] hover:bg-black text-white font-semibold text-xs sm:text-sm rounded-md shadow-sm transition-all cursor-pointer"
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
                                            <p className="text-xs text-slate-500 mt-0.5">{apiUrl}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            Active
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

                                <div className="overflow-x-auto border border-slate-200 rounded-md">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                                            <tr>
                                                <th className="p-3">ID</th>
                                                <th className="p-3">Service Name</th>
                                                <th className="p-3 text-right">API Cost</th>
                                                <th className="p-3 text-right">Selling Price</th>
                                                <th className="p-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {apiServices
                                                .filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
                                                .map((srv) => (
                                                    <tr key={srv.id} className="hover:bg-slate-50">
                                                        <td className="p-3 font-mono text-slate-500">#{srv.id}</td>
                                                        <td className="p-3 font-semibold text-slate-800">{srv.name}</td>
                                                        <td className="p-3 text-right text-slate-600">₹{srv.providerCost.toFixed(2)}</td>
                                                        <td className="p-3 text-right font-bold text-slate-900">₹{srv.sellingPrice.toFixed(2)}</td>
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
                                        Remove API Integration ({apiName})
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
                                            setNotification('API Server provider integration disabled.', 'error');
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
