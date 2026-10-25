
import React, { useRef, ChangeEvent } from 'react';
import { useAppContext } from '../context/AppContext';

const WhatsAppButton = () => {
    const { siteContent, isAdmin, isEditMode, startEditing, updateSiteContent, setNotification } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { phoneNumber, iconUrl, tooltip, editText, editNumber, uploadIcon } = siteContent?.whatsapp || {};

    const handleIconUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateSiteContent('whatsapp.iconUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const activeNumber = phoneNumber || '8658465589';
    const cleanNumber = activeNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}`;

    return (
        <div className="fixed bottom-6 right-6 z-40 group">
            {isAdmin && isEditMode && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <h4 className="font-bold text-sm text-center mb-2 text-slate-800 dark:text-slate-200">{editText || 'Edit Button'}</h4>
                    <button
                        onClick={() => startEditing('whatsapp.phoneNumber', phoneNumber || '')}
                        className="w-full text-left text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white px-2 py-1 rounded mb-2"
                    >
                        {editNumber || 'Edit Number'}
                    </button>
                    <button
                        onClick={handleIconUploadClick}
                        className="w-full text-left text-sm bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white px-2 py-1 rounded"
                    >
                        {uploadIcon || 'Upload Icon'}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                </div>
            )}
            
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={tooltip || 'Chat on WhatsApp'}
                className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full shadow-lg hover:bg-green-600 transform hover:scale-110 transition-all duration-300 cursor-pointer"
                aria-label={tooltip || "WhatsApp"}
            >
                <img src={iconUrl || "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"} alt="WhatsApp Icon" className="w-9 h-9" />
            </a>
        </div>
    );
};

export default WhatsAppButton;
