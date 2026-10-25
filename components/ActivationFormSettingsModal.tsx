import React, { useState, useEffect, FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Category, ActivationFormConfig, ActivationCustomField } from '../types';

interface ActivationFormSettingsModalProps {
    category: Category;
    isOpen: boolean;
    onClose: () => void;
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-100 dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-3xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">{title}</h2>
                {children}
            </div>
        </div>
    );
};

const ActivationFormSettingsModal: React.FC<ActivationFormSettingsModalProps> = ({ category, isOpen, onClose }) => {
    const { updateCategory } = useAppContext();
    const [config, setConfig] = useState<ActivationFormConfig>(
        category.activationForm || {
            enabled: false,
            title: 'Activation Service',
            pricePerUnit: 10,
            deliveryTime: '10 Minutes',
            quantityRange: { min: 1, max: 10 },
            customFields: [],
        }
    );

    useEffect(() => {
        setConfig(category.activationForm || {
            enabled: false,
            title: 'Activation Service',
            pricePerUnit: 10,
            deliveryTime: '10 Minutes',
            quantityRange: { min: 1, max: 10 },
            customFields: [],
        });
    }, [category, isOpen]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setConfig(prev => ({
                ...prev,
                [parent]: { ...prev[parent as 'quantityRange'], [child]: Number(value) },
            }));
        } else {
             setConfig(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
        }
    };

    const handleFieldChange = (index: number, prop: keyof ActivationCustomField, value: any) => {
        const newFields = [...config.customFields];
        newFields[index] = { ...newFields[index], [prop]: value };
        setConfig(prev => ({...prev, customFields: newFields}));
    };

    const handleAddField = () => {
        const newField: ActivationCustomField = {
            id: `field-${Date.now()}`,
            name: `custom_field_${config.customFields.length + 1}`,
            label: 'New Field',
            placeholder: '',
            type: 'text',
            enabled: true,
        };
        setConfig(prev => ({ ...prev, customFields: [...prev.customFields, newField] }));
    };

    const handleRemoveField = (index: number) => {
        const newFields = config.customFields.filter((_, i) => i !== index);
        setConfig(prev => ({ ...prev, customFields: newFields }));
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        updateCategory({ ...category, activationForm: config });
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Activation Form Builder">
             <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                <div className="flex items-center justify-between bg-white dark:bg-slate-700 p-3 rounded-md border dark:border-slate-600">
                    <label className="font-semibold text-slate-600 dark:text-slate-300">Enable Activation Form</label>
                    <button type="button" onClick={() => setConfig(prev => ({...prev, enabled: !prev.enabled}))} className={`px-4 py-1.5 text-sm font-bold rounded-full ${config.enabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {config.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                </div>
                
                <div className="space-y-4 p-4 border rounded-md dark:border-slate-700">
                    <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">Main Settings</h3>
                    <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Form Title</label><input type="text" name="title" value={config.title} onChange={handleInputChange} className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                    <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Delivery Time</label><input type="text" name="deliveryTime" value={config.deliveryTime} onChange={handleInputChange} className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                    <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Price per Unit (INR)</label><input type="number" name="pricePerUnit" value={config.pricePerUnit} onChange={handleInputChange} className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                    <div className="flex gap-4">
                        <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Min Qty</label><input type="number" name="quantityRange.min" value={config.quantityRange.min} onChange={handleInputChange} className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                        <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Max Qty</label><input type="number" name="quantityRange.max" value={config.quantityRange.max} onChange={handleInputChange} className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
                    </div>
                </div>

                <div className="space-y-4 p-4 border rounded-md dark:border-slate-700">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">Custom Fields</h3>
                        <button type="button" onClick={handleAddField} className="px-3 py-1.5 rounded-md text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white transition-colors">Add Field</button>
                    </div>

                    {config.customFields.map((field, index) => (
                        <div key={field.id} className="p-3 bg-white dark:bg-slate-700 rounded-lg border dark:border-slate-600 space-y-3">
                           <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-500 dark:text-slate-400">Field {index + 1}</span>
                                <div className="flex items-center gap-2">
                                     <button type="button" onClick={() => handleFieldChange(index, 'enabled', !field.enabled)} className={`px-3 py-1 text-xs font-bold rounded-full ${field.enabled ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{field.enabled ? 'Enabled' : 'Disabled'}</button>
                                     <button type="button" onClick={() => handleRemoveField(index)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                                </div>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                               <div><label className="text-xs font-semibold">Label</label><input type="text" value={field.label} onChange={(e) => handleFieldChange(index, 'label', e.target.value)} className="w-full p-1.5 rounded bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500" /></div>
                               <div><label className="text-xs font-semibold">Name (unique key)</label><input type="text" value={field.name} onChange={(e) => handleFieldChange(index, 'name', e.target.value)} className="w-full p-1.5 rounded bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500" /></div>
                               <div><label className="text-xs font-semibold">Placeholder</label><input type="text" value={field.placeholder} onChange={(e) => handleFieldChange(index, 'placeholder', e.target.value)} className="w-full p-1.5 rounded bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500" /></div>
                               <div>
                                   <label className="text-xs font-semibold">Type</label>
                                   <select value={field.type} onChange={(e) => handleFieldChange(index, 'type', e.target.value)} className="w-full p-1.5 rounded bg-slate-100 dark:bg-slate-600 border border-slate-300 dark:border-slate-500">
                                       <option value="text">Text</option>
                                       <option value="email">Email</option>
                                       <option value="password">Password</option>
                                   </select>
                               </div>
                           </div>
                        </div>
                    ))}
                </div>

                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">Save Settings</button>
             </form>
        </Modal>
    );
}

export default ActivationFormSettingsModal;