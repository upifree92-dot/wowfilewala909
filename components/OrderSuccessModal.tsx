import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

interface OrderSuccessModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ isOpen: propIsOpen, onClose: propOnClose }) => {
  const { orderSuccessModalOpen, setOrderSuccessModalOpen } = useAppContext();
  const navigate = useNavigate();

  const isOpen = propIsOpen !== undefined ? propIsOpen : orderSuccessModalOpen;
  
  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      setOrderSuccessModalOpen(false);
    }
  };

  const handleViewOrders = () => {
    handleClose();
    navigate('/profile?tab=orders');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-[460px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top/Center Body matching Screenshot */}
        <div className="px-6 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-9 text-center">
          {/* Big Green Circle with Checkmark matching screenshot */}
          <div className="flex items-center justify-center mb-6">
            <svg 
              viewBox="0 0 100 100" 
              className="w-32 h-32 sm:w-36 sm:h-36 text-[#1fa774]"
            >
              <circle 
                cx="50" 
                cy="50" 
                r="44" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="7" 
              />
              <path 
                d="M28 50 L43 65 L73 34" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-100 leading-snug">
            Your order has been placed successfully!
          </h3>
        </div>

        {/* Action Buttons Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-xl bg-[#eefcf5] dark:bg-emerald-950/40 text-[#1fa774] dark:text-emerald-400 font-semibold text-sm sm:text-base hover:bg-[#dcf7ea] dark:hover:bg-emerald-900/50 transition-colors cursor-pointer text-center"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleViewOrders}
            className="flex-1 py-3 px-4 rounded-xl bg-[#1fa774] hover:bg-[#188e62] text-white font-semibold text-sm sm:text-base transition-colors shadow-sm cursor-pointer text-center"
          >
            View Order History
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
