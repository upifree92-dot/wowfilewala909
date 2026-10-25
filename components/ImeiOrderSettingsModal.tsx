
import React, { useState, useEffect, FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';

interface ImeiOrderSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ImeiOrderSettingsModal: React.FC<ImeiOrderSettingsModalProps> = ({ isOpen, onClose }) => {
    const { siteContent, updateSiteContent } = useAppContext();
    
    const [isEnabled, setIsEnabled] = useState(false);
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [priceNote, setPriceNote] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [avgDeliveryTime, setAvgDeliveryTime] = useState('');
    const [formFieldsJSON, setFormFieldsJSON] = useState('');
    const [jsonError, setJsonError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const config = siteContent.imeiOrderPage;
            setIsEnabled(config.enabled || false);
            setTitle(config.title || '');
            setPrice(config.price || '');
            setPriceNote(config.priceNote || '');
            setDeliveryTime(config.deliveryTime || '');
            setAvgDeliveryTime(config.avgDeliveryTime || '');
            setFormFieldsJSON(config.formFieldsJSON || '[]');
            setJsonError('');
        }
    }, [isOpen, siteContent]);

    const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setFormFieldsJSON(value);
        try {
            JSON.parse(value);
            setJsonError('');
        } catch (error) {
            setJsonError('Invalid JSON format.');
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (jsonError) {
            alert('Cannot save with invalid JSON. Please correct the format.');
            return;
        }
        
        // Update all fields in siteContent
        updateSiteContent('imeiOrderPage.enabled', isEnabled);
        updateSiteContent('imeiOrderPage.title', title);
        updateSiteContent('imeiOrderPage.price', price);
        updateSiteContent('imeiOrderPage.priceNote', priceNote);
        updateSiteContent('imeiOrderPage.deliveryTime', deliveryTime);
        updateSiteContent('imeiOrderPage.avgDeliveryTime', avgDeliveryTime);
        updateSiteContent('imeiOrderPage.formFieldsJSON', formFieldsJSON);
        
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-100 dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-3xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">IMEI Order Form Settings</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-md border dark:border-slate-600">
                        <label className="font-semibold text-slate-600 dark:text-slate-300">Enable Feature for Users</label>
                        <button type="button" onClick={() => setIsEnabled(!isEnabled)} className={`px-4 py-1.5 text-sm font-bold rounded-full ${isEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {isEnabled ? 'Enabled' : 'Disabled'}
                        </button>
                    </div>
                    <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Form Title</label><input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Price</label><input type="text" value={price} onChange={e => setPrice(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                        <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Price Note (e.g., Rs.)</label><input type="text" value={priceNote} onChange={e => setPriceNote(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Delivery Time</label><input type="text" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                        <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Avg. Delivery Time</label><input type="text" value={avgDeliveryTime} onChange={e => setAvgDeliveryTime(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                    </div>
                    <div>
                        <label className="block text-slate-600 dark:text-slate-400 font-semibold">Form Fields (JSON)</label>
                        <p className="text-xs text-slate-500 mb-1">Define the input fields for the form using JSON format.</p>
                        <textarea value={formFieldsJSON} onChange={handleJsonChange} rows={8} required className={`w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border font-mono text-sm ${jsonError ? 'border-red-500' : 'border-slate-300'}`} />
                        {jsonError && <p className="text-red-500 text-sm mt-1">{jsonError}</p>}
                    </div>
                    <button type="submit" className="w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">Save Settings</button>
                </form>
            </div>
        </div>
    );
};

export default ImeiOrderSettingsModal;
