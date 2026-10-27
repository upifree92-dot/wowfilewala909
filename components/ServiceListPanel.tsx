import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

interface ServiceListPanelProps {
  isModal?: boolean;
  onClose?: () => void;
  onOpenHelp?: () => void;
  activeServiceTab?: string;
  onSelectServiceTab?: (tabId: string) => void;
}

const ServiceListPanel: React.FC<ServiceListPanelProps> = ({
  isModal = false,
  onClose,
  onOpenHelp,
  activeServiceTab,
  onSelectServiceTab,
}) => {
  const navigate = useNavigate();
  const { user, logout, siteContent, categories } = useAppContext();
  const [expandedService, setExpandedService] = useState<string | null>(null);

  const logoUrl = siteContent?.header?.logoUrl;
  const brandTitle = siteContent?.header?.title || 'wowfilewala.com';

  const topCategories = (categories || []).filter((c) => !c.parentId);

  const serviceItems = [
    {
      id: 'imei',
      label: 'iMEi Service',
      path: '/imei-order?type=imei',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <circle cx="12" cy="12" r="9" />
          <path d="M3.6 9h16.8M3.6 15h16.8" />
          <path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" />
        </svg>
      ),
    },
    {
      id: 'server',
      label: 'Server Service',
      path: '/imei-order?type=server',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <circle cx="9" cy="20" r="1.5" fill="currentColor" />
          <circle cx="17" cy="20" r="1.5" fill="currentColor" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 7H6" />
        </svg>
      ),
    },
    {
      id: 'remote',
      label: 'Remote/ Tool-Rent',
      path: '/imei-order?type=remote',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      ),
    },
    {
      id: 'file',
      label: 'File service',
      path: '/',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.5 21a3 3 0 0 0 3-3v-8.25a3 3 0 0 0-3-3h-5.879a.75.75 0 0 1-.53-.22L11.47 4.91A2.25 2.25 0 0 0 9.879 4.25H4.5a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15Z" />
        </svg>
      ),
    },
    {
      id: 'group',
      label: 'Service By Group',
      path: '/tools',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      ),
    },
  ];

  const handleRowClick = (item: typeof serviceItems[0]) => {
    if (onSelectServiceTab) {
      onSelectServiceTab(item.id);
    }
    if (expandedService === item.id) {
      setExpandedService(null);
    } else {
      setExpandedService(item.id);
    }
  };

  const handleNavigate = (path: string) => {
    if (onClose) onClose();
    navigate(path);
  };

  const handleHelpClick = () => {
    if (onOpenHelp) {
      onOpenHelp();
    } else {
      const phone = (siteContent?.whatsapp?.phoneNumber || '8658465589').replace(/\D/g, '');
      navigate('/appointment-booking');
    }
  };

  return (
    <div
      className={`bg-[#121212] text-white flex flex-col justify-between select-none ${
        isModal ? 'fixed inset-0 z-[9999] overflow-y-auto animate-fade-in' : 'w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 min-h-[540px] relative'
      }`}
    >
      <div>
        {/* Top Teal Header Bar matching Screenshot */}
        <div
          style={{ backgroundColor: '#0c6b6b' }}
          className="w-full px-4 py-3 border-b-2 border-white/70 flex items-center justify-between relative shadow-md"
        >
          <button
            type="button"
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                navigate(-1);
              }
            }}
            className="text-white hover:text-gray-200 p-1.5 transition-transform active:scale-95 focus:outline-none"
            aria-label="Back"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Centered Brand Pill Badge matching Screenshot */}
          <div className="flex items-center justify-center">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brandTitle}
                className="h-11 max-w-[210px] object-contain rounded-full border border-white/40 bg-[#074747] px-4 py-1 shadow-inner"
              />
            ) : (
              <div
                style={{ backgroundColor: '#074e52' }}
                className="px-6 py-1.5 rounded-full border-2 border-white/70 shadow-inner flex flex-col items-center justify-center"
              >
                <div className="flex items-baseline gap-0.5 leading-none">
                  <span className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase font-sans">
                    {brandTitle.replace(/\.com|\.in/i, '')}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-amber-400">
                    .in
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] tracking-[0.18em] text-amber-300/90 font-bold uppercase mt-0.5">
                  YOUR TRUST, OUR SERVICE
                </span>
              </div>
            )}
          </div>

          {/* Right spacer to keep logo dead-center */}
          <div className="w-9" />
        </div>

        {/* Main Dark Service List Body */}
        <div className="px-5 pt-5 pb-8 max-w-2xl mx-auto w-full">
          {/* SERVICE LIST Heading */}
          <div className="border-b border-white/20 pb-3">
            <h2 className="text-[15px] sm:text-base font-normal tracking-wider uppercase !text-gray-100">
              SERVICE LIST
            </h2>
          </div>

          {/* 5 Service Rows */}
          <div className="divide-y divide-white/20 border-b border-white/20">
            {serviceItems.map((item) => (
              <div key={item.id} className="w-full">
                <div
                  onClick={() => handleNavigate(item.path)}
                  className="flex items-center justify-between py-3.5 px-1 hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 flex-1 text-left">
                    <span className="flex items-center justify-center w-6 h-6">
                      {item.icon}
                    </span>
                    <span className="text-[15px] sm:text-base font-normal !text-white tracking-wide">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(item.path);
                      }}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded bg-teal-500/15 hover:bg-teal-500/30 !text-teal-300 border border-teal-500/30 transition-colors cursor-pointer"
                    >
                      Open
                    </button>
                    <span className="p-1 text-gray-300 group-hover:text-white transition-transform">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.4}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Full-width Teal Login | Register Button matching Screenshot */}
          <div className="mt-6">
            {!user ? (
              <button
                type="button"
                onClick={() => handleNavigate('/login')}
                style={{ backgroundColor: '#0d7474', borderColor: '#2dd4bf' }}
                className="w-full py-3.5 px-4 rounded-lg border flex items-center justify-center gap-2.5 !text-white font-medium text-base shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 !text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="8" r="4" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                </svg>
                <span className="!text-white tracking-wide">Login | Register</span>
              </button>
            ) : (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleNavigate('/profile')}
                  style={{ backgroundColor: '#0d7474', borderColor: '#2dd4bf' }}
                  className="w-full py-3.5 px-4 rounded-lg border flex items-center justify-center gap-2.5 !text-white font-medium text-base shadow-lg hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5 !text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="8" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                  </svg>
                  <span className="!text-white tracking-wide">
                    My Account ({user.email.split('@')[0]}) | ₹{user.wallet.balance.toFixed(2)}
                  </span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleNavigate('/pricing')}
                    className="py-2.5 px-3 rounded-lg bg-[#1e2229] hover:bg-[#262b33] border border-white/15 !text-teal-300 text-xs font-bold tracking-wide transition-colors"
                  >
                    + Add Wallet Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      if (onClose) onClose();
                      navigate('/');
                    }}
                    className="py-2.5 px-3 rounded-lg bg-[#1e2229] hover:bg-red-950/50 border border-white/15 !text-red-400 text-xs font-bold tracking-wide transition-colors"
                  >
                    Logout Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom-Right Floating HELP Badge matching Screenshot */}
      <div className="px-5 pb-6 flex justify-end max-w-2xl mx-auto w-full">
        <button
          type="button"
          onClick={handleHelpClick}
          style={{ backgroundColor: '#0d7474' }}
          className="rounded-xl px-3.5 py-2 flex flex-col items-center justify-center shadow-lg border border-teal-300/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          title="Help Center"
        >
          <svg className="w-5 h-5 !text-white mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <circle cx="12" cy="17" r="0.6" fill="currentColor" />
          </svg>
          <span className="text-[11px] font-extrabold tracking-wider uppercase !text-white leading-none">
            HELP
          </span>
        </button>
      </div>
    </div>
  );
};

export default ServiceListPanel;
