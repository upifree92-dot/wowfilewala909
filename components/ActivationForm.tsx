import React, { useState, FormEvent, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Category } from '../types';
import Editable from './Editable';

interface ActivationFormProps {
    category: Category;
}

const ActivationForm: React.FC<ActivationFormProps> = ({ category }) => {
    const { user, siteContent, placeActivationOrder, setNotification } = useAppContext();
    const config = category.activationForm!;
    
    const [quantity, setQuantity] = useState(config.quantityRange.min);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    
    const initialFormData = useMemo(() => 
        config.customFields.reduce((acc, field) => {
            acc[field.name] = '';
            return acc;
        }, {} as Record<string, string>), 
    [config.customFields]);
    
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        setFormData(initialFormData);
        setQuantity(config.quantityRange.min);
        setAgreedToTerms(false);
    }, [category.id, initialFormData, config.quantityRange.min]);
    
    const totalPrice = useMemo(() => {
        return quantity * config.pricePerUnit;
    }, [quantity, config.pricePerUnit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!user) {
            setNotification('You must be logged in to place an order.', 'error');
            return;
        }
        if (!agreedToTerms) {
            setNotification('You must agree to the terms and conditions.', 'error');
            return;
        }
        
        placeActivationOrder(category, {
            quantity,
            ...formData,
            totalPrice
        });
        
        // Reset form
        setFormData(initialFormData);
        setQuantity(config.quantityRange.min);
        setAgreedToTerms(false);
    };
    
    const quantityLabel = (siteContent.activationForm.quantityLabel || '')
        .replace('{min}', String(config.quantityRange.min))
        .replace('{max}', String(config.quantityRange.max));

    return (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg mt-10 border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-200 border-l-4 border-teal-500 pl-4">{config.title}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex justify-between items-center text-slate-700 dark:text-slate-300">
                    <label className="font-semibold"><Editable contentKey="activationForm.deliveryTimeLabel" /></label>
                    <span className="font-medium">{config.deliveryTime}</span>
                </div>
                
                {/* Quantity */}
                <div className="flex flex-col">
                    <label htmlFor="quantity" className="font-semibold text-slate-700 dark:text-slate-300 mb-1">{quantityLabel}</label>
                    <div className="flex">
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(config.quantityRange.min, Math.min(config.quantityRange.max, Number(e.target.value))))}
                            min={config.quantityRange.min}
                            max={config.quantityRange.max}
                            required
                            className="w-full p-3 rounded-l-md border-t border-b border-l border-slate-300 dark:bg-slate-700 dark:border-slate-600 focus:ring-teal-500 focus:border-teal-500"
                        />
                        <span className="inline-flex items-center px-4 bg-slate-200 dark:bg-slate-600 border-t border-b border-r border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-r-md">
                            ₹{totalPrice.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Dynamic Custom Fields */}
                {config.customFields && config.customFields.filter(f => f.enabled).map(field => (
                    <div key={field.id}>
                        <label htmlFor={field.id} className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">{field.label}</label>
                        <input
                            type={field.type}
                            id={field.id}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full p-3 rounded-md border border-slate-300 dark:bg-slate-700 dark:border-slate-600 focus:ring-teal-500 focus:border-teal-500"
                            placeholder={field.placeholder}
                        />
                    </div>
                ))}

                {/* Terms and Conditions */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 dark:bg-slate-600 text-teal-600 focus:ring-teal-500"
                    />
                    <label htmlFor="terms" className="text-slate-600 dark:text-slate-400"><Editable contentKey="activationForm.termsLabel" /></label>
                </div>
                
                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-slate-400"
                    disabled={!user}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    <Editable contentKey="activationForm.placeOrderButton" />
                </button>
            </form>
        </div>
    );
};

export default ActivationForm;