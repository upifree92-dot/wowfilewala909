
import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { useAppContext } from '../context/AppContext';

interface DownloadItemProps {
    product: Product;
}

const DownloadItem: React.FC<DownloadItemProps> = ({ product }) => {
    const { user, initiateDownload } = useAppContext();
    const [remainingTime, setRemainingTime] = useState(0);

    const expiryTime = user?.downloadTimers?.[product.id] || 0;
    
    useEffect(() => {
        const isTimerActive = expiryTime > Date.now();
        if (!isTimerActive) {
            setRemainingTime(0);
            return;
        }

        const calculateRemaining = () => {
            const now = Date.now();
            const remaining = Math.max(0, expiryTime - now);
            setRemainingTime(remaining);
        };

        calculateRemaining();
        const intervalId = setInterval(calculateRemaining, 1000);

        return () => clearInterval(intervalId);
    }, [expiryTime, user]); // Depend on user to re-evaluate when timers change

    const handleDownloadClick = () => {
        initiateDownload(product);
    };

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const isTimerActive = remainingTime > 0;
    const hasBeenDownloadedOnce = !!expiryTime;

    return (
        <div className="bg-white/80 dark:bg-slate-700/80 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md border border-slate-200 dark:border-slate-600">
            <div className="flex-grow w-full">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{product.name}</h3>
                <div className="flex items-center gap-3 text-xs mt-1">
                    {product.size && <span className="text-slate-500 dark:text-slate-400">Size: <strong>{product.size}</strong></span>}
                    {isTimerActive ? (
                        <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                            ⏱️ 59-Min Link Expires In: {formatTime(remainingTime)}
                        </span>
                    ) : hasBeenDownloadedOnce ? (
                        <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                            ❌ Download Link Expired (59 Minutes Expired)
                        </span>
                    ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            ⚡ 59 Minutes Active Link Ready
                        </span>
                    )}
                </div>
            </div>
            <button 
                onClick={handleDownloadClick} 
                disabled={hasBeenDownloadedOnce && !isTimerActive}
                className={`text-white font-bold py-2.5 px-5 rounded-lg transition-all text-center w-full sm:w-48 flex-shrink-0 shadow ${
                    isTimerActive || !hasBeenDownloadedOnce
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                }`}
            >
                {isTimerActive || !hasBeenDownloadedOnce ? 'Download Now' : 'Link Expired (59 Min)'}
            </button>
        </div>
    );
};

export default DownloadItem;
