import React, { useState, useMemo, FormEvent } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { InputField } from '../types';
import BackButton from '../components/BackButton';
import Editable from '../components/Editable';
import ImeiOrderSettingsModal from '../components/ImeiOrderSettingsModal';
import ServiceListPanel from '../components/ServiceListPanel';
import { useSEO } from '../hooks/useSEO';

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
        badge: 'RENT-24/7',
        subtitle: 'Instant 24/7 Tool Rental ID & Password Delivery',
    },
};

const ImeiOrderPage = () => {
    useSEO('Service List & Place Order', 'Place a new IMEI, Server, or RENT-24/7 service order.');
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const activeType = searchParams.get('type') || 'imei';

    const { user, siteContent, placeImeiOrder, setNotification, isAdmin, isEditMode } = useAppContext();
    const config = siteContent.imeiOrderPage;
    
    const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

    let formFields: InputField[] = [];
    try {
        formFields = JSON.parse(config.formFieldsJSON);
    } catch (e) {
        console.error("Failed to parse form fields JSON from siteContent:", e);
    }
    
    const initialFormState = formFields.reduce((acc, field) => {
        acc[field.name] = '';
        return acc;
    }, {} as Record<string, string>);

    const [formData, setFormData] = useState(initialFormState);
    const [quantity, setQuantity] = useState(1);

    const pricePerUnit = parseFloat(config.price) || 0;
    const totalPrice = useMemo(() => quantity * pricePerUnit, [quantity, pricePerUnit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!user) {
            setNotification('You must be logged in to place an order.', 'error');
            return;
        }

        const serviceMeta = SERVICE_TYPE_META[activeType] || SERVICE_TYPE_META.imei;
        placeImeiOrder({
            ...formData,
            quantity,
            price: pricePerUnit,
            title: `${serviceMeta.badge} - ${config.title}`,
        });

        // Reset form inputs after order is placed
        setFormData(initialFormState);
        setQuantity(1);
    };

    if (!config.enabled && !(isAdmin && isEditMode)) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-6">
                <div className="max-w-2xl mx-auto">
                    <ServiceListPanel
                        activeServiceTab={activeType}
                        onSelectServiceTab={(tabId) => setSearchParams({ type: tabId })}
                    />
                </div>
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

            {/* Customer Service List Menu (Matching Screenshot) */}
            <div className="max-w-2xl mx-auto">
                <ServiceListPanel
                    activeServiceTab={activeType}
                    onSelectServiceTab={(tabId) => {
                        if (tabId === 'imei' || tabId === 'server' || tabId === 'rent') {
                            setSearchParams({ type: tabId });
                        }
                    }}
                />
            </div>

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
                        {!config.enabled && <p className="text-red-500 dark:text-red-400 text-sm mt-2">This feature is currently DISABLED for users.</p>}
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

                <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-slate-800 dark:text-slate-200 text-center">
                    <Editable contentKey="imeiOrderPage.title" as="span" />
                </h1>
                
                <div className="text-center mb-8">
                    <p className="text-5xl font-extrabold text-cyan-500">
                        <Editable contentKey="imeiOrderPage.priceNote" as="span" />
                        <Editable contentKey="imeiOrderPage.price" as="span" />
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
                        <Editable contentKey="imeiOrderPage.deliveryTime" as="span" />
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        <Editable contentKey="imeiOrderPage.avgDeliveryTime" as="span" />
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {formFields.map(field => (
                        <div key={field.name}>
                            <label htmlFor={field.name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                id={field.name}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleInputChange}
                                required={field.required}
                                placeholder={field.placeholder}
                                className="w-full p-3 rounded-md bg-white/80 dark:bg-slate-700/80 border-2 border-slate-300/50 dark:border-slate-600/50 focus:border-cyan-500 focus:ring-cyan-500 transition-all text-slate-800 dark:text-slate-200"
                            />
                        </div>
                    ))}

                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                            <Editable contentKey="imeiOrderPage.quantityLabel" as="span" />
                        </label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            required
                            min="1"
                            className="w-full p-3 rounded-md bg-white/80 dark:bg-slate-700/80 border-2 border-slate-300/50 dark:border-slate-600/50 focus:border-cyan-500 focus:ring-cyan-500 transition-all text-slate-800 dark:text-slate-200"
                        />
                    </div>
                    
                    <div className="p-4 bg-slate-200/50 dark:bg-slate-700/50 rounded-lg text-center">
                        <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">Total Price</p>
                        <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">₹{totalPrice.toFixed(2)}</p>
                    </div>

                    <button
                        type="submit"
                        disabled={!user}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-4 rounded-lg transition-colors text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <Editable contentKey="imeiOrderPage.orderButtonText" as="span" />
                    </button>
                    {!user && <p className="text-center text-sm text-red-500 dark:text-red-400 mt-2">You must be logged in to place an order.</p>}
                </form>
            </div>
        </div>
    );
};

export default ImeiOrderPage;
