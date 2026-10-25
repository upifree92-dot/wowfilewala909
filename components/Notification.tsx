
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Notification = () => {
    const { notification } = useAppContext();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 3500); // Should be slightly less than the timeout in context to allow fade-out
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if (!notification) return null;

    const isError = notification.type === 'error';
    const baseClasses = "fixed bottom-5 right-5 text-white py-3 px-6 rounded-lg shadow-2xl z-[101] transition-all duration-300";
    const visibleClasses = "translate-y-0 opacity-100";
    const hiddenClasses = "translate-y-5 opacity-0";
    const colorClasses = isError ? 'bg-red-600' : 'bg-green-600';

    return (
        <div className={`${baseClasses} ${colorClasses} ${isVisible ? visibleClasses : hiddenClasses}`}>
            <p className="font-semibold">{notification.message}</p>
        </div>
    );
};

export default Notification;
