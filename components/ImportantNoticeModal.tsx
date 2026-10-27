import React, { useState, useEffect } from 'react';
import { ExternalLink, X, ShieldAlert } from 'lucide-react';

interface ImportantNoticeModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

const ImportantNoticeModal: React.FC<ImportantNoticeModalProps> = ({ forceOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    // Check if user has already acknowledged in this session
    const hasSeenNotice = sessionStorage.getItem('mrunlocker_notice_acknowledged');
    if (forceOpen || !hasSeenNotice) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  // Listen for global custom event to reopen notice anytime
  useEffect(() => {
    const handleOpenNotice = () => setIsOpen(true);
    window.addEventListener('open-important-notice', handleOpenNotice);
    return () => window.removeEventListener('open-important-notice', handleOpenNotice);
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('mrunlocker_notice_acknowledged', 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Dialog Container */}
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden transition-all transform scale-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-title"
      >
        {/* Top Close Icon Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
          {/* Main Title */}
          <div>
            <h2 id="notice-title" className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Important Notice
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-normal">
              Important notice that requires your acknowledgment before using this website.
            </p>
          </div>

          {/* Educational Purpose Statement */}
          <div className="pt-2">
            <p className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              All files and tools on Mrunlocker are for educational purposes only.
            </p>
          </div>

          {/* Section 1 Bullets */}
          <ul className="space-y-2 text-slate-800 dark:text-slate-200 font-medium">
            <li className="flex items-start gap-2.5">
              <span className="text-base select-none shrink-0">🔧</span>
              <span>Device repair, firmware updates, FRP operations &amp; software fixes</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-base select-none shrink-0">📱</span>
              <span>Personal devices or devices with authorized owner permission</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-base select-none shrink-0">📄</span>
              <span>
                Owner must provide: device bill/box — if no box, customer ID proof + signature + passport photo required
              </span>
            </li>
          </ul>

          {/* Section 2: Strictly Prohibited */}
          <div className="pt-2">
            <div className="w-36 sm:w-44 border-t-2 border-slate-900 dark:border-slate-400 mb-2"></div>
            <div className="font-bold text-slate-900 dark:text-white tracking-wide text-xs sm:text-sm flex items-center gap-1.5 pb-1">
              <span>🚫</span>
              <span>STRICTLY PROHIBITED</span>
            </div>
            <div className="w-36 sm:w-44 border-b-2 border-slate-900 dark:border-slate-400 mb-3"></div>

            <ul className="space-y-2 text-slate-800 dark:text-slate-200 font-medium">
              <li className="flex items-start gap-2.5 text-rose-700 dark:text-rose-400">
                <span className="text-base select-none shrink-0">❌</span>
                <span>Blacklisted or lost/stolen devices — DO NOT process</span>
              </li>
              <li className="flex items-start gap-2.5 text-rose-700 dark:text-rose-400">
                <span className="text-base select-none shrink-0">❌</span>
                <span>Auth server operations — clean IMEI devices only</span>
              </li>
              <li className="flex items-start gap-2.5 text-rose-700 dark:text-rose-400">
                <span className="text-base select-none shrink-0">❌</span>
                <span>Any device without proper owner authorization &amp; documentation</span>
              </li>
            </ul>

            <div className="mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              Before proceeding, please verify the device status here:{' '}
              <a
                href="https://www.ceir.gov.in/Device/CeirIMEIVerification.jsp"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-800 inline-flex items-center gap-1"
              >
                CEIR IMEI Verification
                <ExternalLink className="w-3.5 h-3.5 inline" />
              </a>
              .
            </div>
          </div>

          {/* Section 3: Terms & Conditions */}
          <div className="pt-2">
            <div className="w-36 sm:w-44 border-t-2 border-slate-900 dark:border-slate-400 mb-2"></div>
            <div className="font-bold text-slate-900 dark:text-white tracking-wide text-xs sm:text-sm flex items-center gap-1.5 pb-1">
              <span>📋</span>
              <span>TERMS &amp; CONDITIONS</span>
            </div>
            <div className="w-36 sm:w-44 border-b-2 border-slate-900 dark:border-slate-400 mb-3"></div>

            <ul className="space-y-2 text-slate-800 dark:text-slate-200 font-medium text-xs sm:text-sm">
              <li className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold select-none shrink-0">✔️</span>
                <span>Must be 18+ years old</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold select-none shrink-0">✔️</span>
                <span>Must own the device or have owner's written permission</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold select-none shrink-0">✔️</span>
                <span>Must comply with local laws and regulations</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold select-none shrink-0">✔️</span>
                <span>Device bill/box OR valid ID proof + signature + passport photo required</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold select-none shrink-0">✔️</span>
                <span>Only clean, authorized devices permitted — no blacklisted/lost devices</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-800 dark:text-slate-200">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold select-none shrink-0">✔️</span>
                <span>All OTP &amp; Credits TOOLs are NON-REFUNDABLE once used</span>
              </li>
            </ul>

            <p className="mt-3 text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-200 leading-snug">
              Mrhunlocker assumes no responsibility for any misuse, legal consequences, or device damage caused by the use of these files &amp; tools. By using this site, you agree to these terms.
            </p>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border-t border-slate-100 dark:border-slate-800 flex justify-center">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto min-w-[130px] px-8 py-2.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] active:scale-95 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-150 text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportantNoticeModal;
