import React, { useState, useMemo, FormEvent, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { InputField } from '../types';
import BackButton from '../components/BackButton';
import Editable from '../components/Editable';
import ImeiOrderSettingsModal from '../components/ImeiOrderSettingsModal';
import RemoteToolRentOrder from '../components/RemoteToolRentOrder';
import ServerServiceOrder from '../components/ServerServiceOrder';
import ImeiServiceOrder from '../components/ImeiServiceOrder';
import { useSEO } from '../hooks/useSEO';
import { ShieldCheck, Server, RefreshCw, CheckCircle2, Zap } from 'lucide-react';

const SERVICE_TYPE_META: Record<string, { badge: string; subtitle: string }> = {
    imei: {
        badge: 'iMEi Service',
        subtitle: 'Instant Official IMEI Unlock, MDM Bypass & Network Services',
    },
    server: {
        badge: 'Server Service',
        subtitle: '24/7 Automated Box, Dongle & Server Tool Credits / Activations',
    },
    rent: {
        badge: 'Remote/ Tool-Rent',
        subtitle: 'Instant 24/7 Tool Rental ID & Password Delivery',
    },
    remote: {
        badge: 'Remote/ Tool-Rent',
        subtitle: 'Instant 24/7 Tool Rental ID & Password Delivery',
    },
};

interface ApiServiceOption {
    id: string;
    name: string;
    type: 'imei' | 'server' | 'rent';
    price: number;
    deliveryTime: string;
    inputPlaceholder: string;
    inputLabel: string;
}

const CATALOG_SERVICES: ApiServiceOption[] = [
    // IMEI Services
    { id: 'imei-1', name: 'iMEi Service', type: 'imei', price: 0, deliveryTime: 'Instant', inputLabel: 'IMEI / Serial Number', inputPlaceholder: 'Enter 15-digit IMEI or Serial Number...' },

    // Server Services
    { id: 'srv-1', name: 'Server Service', type: 'server', price: 0, deliveryTime: 'Instant', inputLabel: 'Username / Account ID', inputPlaceholder: 'Enter Account / Username...' },

    // Tool Rental Services
    { id: 'rent-1', name: 'Remote/ Tool-Rent', type: 'rent', price: 0, deliveryTime: 'Instant', inputLabel: 'Your Mobile / WhatsApp Number', inputPlaceholder: 'Enter WhatsApp number to receive tool access...' },
];

const ImeiOrderPage = () => {
    useSEO('Service List & Place Order', 'Place a new IMEI, Server, or Remote Tool Rent service order.');
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    
    const rawType = searchParams.get('type') || 'imei';
    const activeType = rawType === 'remote' ? 'rent' : rawType;

    const { user, siteContent, placeImeiOrder, setNotification, isAdmin, isEditMode } = useAppContext();
    const config = siteContent.imeiOrderPage;
    const apiServer = siteContent.apiServer || {};
    
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
    const [allFetchedServices, setAllFetchedServices] = useState<ApiServiceOption[]>(CATALOG_SERVICES);
    const [filterQuery, setFilterQuery] = useState('');

    // Load full 583 services list from API proxy endpoint
    useEffect(() => {
        let isMounted = true;
        fetch('/api/fetch-gsm-services', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiUrl: apiServer.apiUrl, username: apiServer.username })
        })
        .then(res => res.json())
        .then(data => {
            if (isMounted && data?.success && Array.isArray(data.services) && data.services.length > 0) {
                const mapped: ApiServiceOption[] = data.services.map((srv: any) => {
                    const st = srv.serviceType === 'remote' ? 'rent' : (srv.serviceType || 'server');
                    const isRemote = st === 'rent';
                    const isImei = st === 'imei';
                    return {
                        id: srv.id,
                        name: srv.name,
                        type: st as 'imei' | 'server' | 'rent',
                        price: srv.price || 0,
                        deliveryTime: isRemote ? 'Instant ID/Pass' : (isImei ? 'Instant IMEI' : 'Auto API 24x7'),
                        inputLabel: isRemote ? 'Your WhatsApp / Mobile Number' : (isImei ? 'IMEI / Serial Number' : 'ECID / Account / Username'),
                        inputPlaceholder: isRemote ? 'Enter WhatsApp number to receive login ID & Password...' : (isImei ? 'Enter 15-digit IMEI or Serial Number...' : 'Enter required details or Username...')
                    };
                });
                setAllFetchedServices(mapped);
            }
        })
        .catch(err => console.warn('Could not fetch dynamic GSM services:', err));

        return () => { isMounted = false; };
    }, [apiServer.apiUrl, apiServer.username]);

    // Filter available services for current active tab & search query
    const availableServices = useMemo(() => {
        return allFetchedServices.filter(s => {
            const matchType = s.type === activeType || (activeType === 'rent' && s.type === 'rent');
            const matchQuery = !filterQuery || s.name.toLowerCase().includes(filterQuery.toLowerCase());
            return matchType && matchQuery;
        });
    }, [allFetchedServices, activeType, filterQuery]);

    // Selected service state
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');

    // Sync selected service when activeType or availableServices changes
    useEffect(() => {
        if (availableServices.length > 0) {
            setSelectedServiceId(availableServices[0].id);
        }
    }, [activeType, filterQuery]);

    const selectedService = useMemo(() => {
        return allFetchedServices.find(s => s.id === selectedServiceId) || availableServices[0] || CATALOG_SERVICES[0];
    }, [selectedServiceId, availableServices, allFetchedServices]);

    // Form inputs state
    const [serviceInputValue, setServiceInputValue] = useState('');
    const [quantity, setQuantity] = useState(1);

    const pricePerUnit = selectedService ? selectedService.price : (parseFloat(config.price) || 0);
    const totalPrice = useMemo(() => quantity * pricePerUnit, [quantity, pricePerUnit]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!user) {
            setNotification('You must be logged in to place an order.', 'error');
            return;
        }

        if (!serviceInputValue.trim()) {
            setNotification(`Please enter ${selectedService?.inputLabel || 'required details'}`, 'error');
            return;
        }

        const serviceMeta = SERVICE_TYPE_META[activeType] || SERVICE_TYPE_META.imei;
        placeImeiOrder({
            serviceName: selectedService.name,
            serviceId: selectedService.id,
            inputData: serviceInputValue.trim(),
            quantity,
            price: pricePerUnit,
            title: `${serviceMeta.badge} - ${selectedService.name}`,
        });

        // Reset inputs
        setServiceInputValue('');
        setQuantity(1);
    };

    if (!config.enabled && !(isAdmin && isEditMode)) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="max-w-2xl mx-auto text-center p-8 bg-white/70 dark:bg-slate-800/70 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold">Service Not Available</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">This service is currently unavailable. Please check back later.</p>
                </div>
            </div>
        );
    }

    const currentMeta = SERVICE_TYPE_META[activeType] || SERVICE_TYPE_META.imei;

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 space-y-8">
            <ImeiOrderSettingsModal isOpen={isSettingsModalOpen} onClose={() => setSettingsModalOpen(false)} />

            {activeType === 'rent' ? (
                <div className="max-w-6xl mx-auto">
                    <div className="mb-4">
                        <BackButton />
                    </div>
                    <RemoteToolRentOrder />
                </div>
            ) : activeType === 'server' ? (
                <div className="max-w-6xl mx-auto">
                    <div className="mb-4">
                        <BackButton />
                    </div>
                    <ServerServiceOrder />
                </div>
            ) : activeType === 'imei' ? (
                <div className="max-w-6xl mx-auto">
                    <div className="mb-4">
                        <BackButton />
                    </div>
                    <ImeiServiceOrder />
                </div>
            ) : (
                <div className="max-w-2xl mx-auto bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200/70 dark:border-slate-700/70">
                    <BackButton />

                    {isAdmin && isEditMode && (
                        <div className="text-center mb-6 p-4 bg-blue-100 dark:bg-blue-900/30 border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-lg">
                            <p className="font-bold text-blue-800 dark:text-blue-200">Admin Controls</p>
                            <button 
                                onClick={() => setSettingsModalOpen(true)}
                                className="mt-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
                            >
                                Edit Form Settings
                            </button>
                        </div>
                    )}

                    <div className="text-center mb-3">
                        <span
                            style={{ backgroundColor: '#0d7474', borderColor: '#2dd4bf' }}
                            className="inline-block px-3.5 py-1 rounded-full border text-xs font-extrabold uppercase tracking-wider !text-white shadow-sm"
                        >
                            {currentMeta.badge}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                            {currentMeta.subtitle}
                        </p>
                    </div>

                    {/* 1. Search Filter & Select Service / Rent Tool Dropdown */}
                    <div className="mb-6 space-y-2.5">
                        <div className="flex justify-between items-center">
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                                Select {activeType === 'server' ? 'Server Service' : 'IMEI Service'}
                            </label>
                            <span className="text-[11px] font-mono font-bold text-amber-500">
                                {availableServices.length} Services Available
                            </span>
                        </div>

                        <input
                            type="text"
                            value={filterQuery}
                            onChange={(e) => setFilterQuery(e.target.value)}
                            placeholder={`🔍 Search in ${availableServices.length} services (e.g. UnlockTool, AMT, Samsung, iPhone)...`}
                            className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:outline-none focus:border-amber-500 placeholder-slate-500"
                        />

                        <select
                            value={selectedServiceId}
                            onChange={(e) => setSelectedServiceId(e.target.value)}
                            className="w-full p-3.5 rounded-xl bg-slate-900 text-slate-100 border-2 border-slate-800 font-semibold focus:outline-none focus:border-amber-500 text-sm cursor-pointer shadow-sm"
                        >
                            {availableServices.map((srv) => (
                                <option key={srv.id} value={srv.id}>
                                    {srv.name} — ₹{srv.price.toFixed(2)} ({srv.deliveryTime})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Service Details Card & Live Price Header */}
                    <div className="text-center mb-8 p-5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 text-slate-100 shadow-md">
                        <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-1">
                            {selectedService.name}
                        </h2>
                        <p className="text-4xl sm:text-5xl font-black text-emerald-400 font-mono my-3">
                            ₹{selectedService.price.toFixed(2)}
                        </p>
                        <div className="flex justify-center items-center gap-4 text-xs text-slate-400 font-mono">
                            <span>⚡ Delivery: <strong className="text-slate-200">{selectedService.deliveryTime}</strong></span>
                            <span>•</span>
                            <span>Auto API Sync: <strong className="text-emerald-400">Enabled</strong></span>
                        </div>
                    </div>

                    {/* Form Inputs */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="serviceInput" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                                {selectedService.inputLabel} <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="serviceInput"
                                value={serviceInputValue}
                                onChange={(e) => setServiceInputValue(e.target.value)}
                                required
                                placeholder={selectedService.inputPlaceholder}
                                className="w-full p-3.5 rounded-xl bg-white/90 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 focus:border-amber-500 focus:ring-amber-500/20 text-slate-900 dark:text-slate-100 font-mono text-sm shadow-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="quantity" className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                                Quantity
                            </label>
                            <input
                                type="number"
                                id="quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                required
                                min="1"
                                className="w-full p-3.5 rounded-xl bg-white/90 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 focus:border-amber-500 text-slate-900 dark:text-slate-100 font-mono text-sm shadow-sm"
                            />
                        </div>
                        
                        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-center space-y-1">
                            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">Total Order Price</p>
                            <p className="text-3xl font-black text-amber-400 font-mono">₹{totalPrice.toFixed(2)}</p>
                        </div>

                        <button
                            type="submit"
                            disabled={!user}
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black py-4 px-4 rounded-xl shadow-lg transition-all text-base uppercase tracking-wider disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                        >
                            Place {selectedService.name.split(' ')[0]} Order Now
                        </button>
                        {!user && <p className="text-center text-sm text-red-500 dark:text-red-400 mt-2">You must be logged in to place an order.</p>}
                    </form>
                </div>
            )}
        </div>
    );
};

export default ImeiOrderPage;

