import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Download, ExternalLink, KeyRound, Check, RefreshCw } from 'lucide-react';

interface TokenSubscriptionCardProps {
  className?: string;
}

export const TokenSubscriptionCard: React.FC<TokenSubscriptionCardProps> = ({ className = '' }) => {
  const {
    activeTokenKey,
    setTokenVerificationModalOpen,
    tokenProtection,
    isTokenVerified,
    isAdmin
  } = useAppContext();

  // If no token key is verified / active, DO NOT SHOW THIS OPTION at all!
  if (!isTokenVerified() || !tokenProtection?.enabled) {
    return null;
  }

  // Active token object or default fallback if verified via Master Key
  const activeKeyObj = activeTokenKey || {
    id: 'active-session-key',
    key: tokenProtection.masterKey || 'FLASH-WOW-9090',
    planName: '1. BRONZE PLAN (STARTER)',
    dailyFilesLimit: 5,
    dailyFilesUsed: 0,
    dailyBandwidthLimitGB: 5,
    dailyBandwidthUsedMB: 0,
    totalBandwidthLimitGB: 200,
    totalBandwidthUsedGB: 150.00,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    isActive: true
  };

  const planName = activeKeyObj.planName || '1. BRONZE PLAN (STARTER)';
  const startDateStr = activeKeyObj.createdAt
    ? new Date(activeKeyObj.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : '10/26/2026';

  const endDateStr = activeKeyObj.expiresAt
    ? new Date(activeKeyObj.expiresAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : '10/26/2027';

  const dailyFilesUsed = activeKeyObj.dailyFilesUsed ?? 0;
  const dailyFilesLimit = activeKeyObj.dailyFilesLimit ?? 5;

  const dailyBwUsedMB = activeKeyObj.dailyBandwidthUsedMB ?? 0;
  const dailyBwLimitGB = activeKeyObj.dailyBandwidthLimitGB ?? 5;
  const dailyBwText = dailyBwUsedMB === 0 ? `0 B / ${dailyBwLimitGB} GB` : `${(dailyBwUsedMB / 1024).toFixed(2)} GB / ${dailyBwLimitGB} GB`;

  const totalBwUsedGB = activeKeyObj.totalBandwidthUsedGB ?? 150.00;
  const totalBwLimitGB = activeKeyObj.totalBandwidthLimitGB ?? 200;
  const percentage = Math.min(100, Math.max(0, (totalBwUsedGB / totalBwLimitGB) * 100));

  return (
    <div className={`w-full max-w-md mx-auto bg-white dark:bg-slate-900 border-2 border-amber-200 dark:border-amber-500/30 rounded-3xl p-5 shadow-xl transition-all ${className}`}>
      {/* Top Header Row */}
      <div className="flex items-start gap-3.5 mb-4">
        {/* Yellow Icon Badge */}
        <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-500/30">
          <Download className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 tracking-tight leading-tight">
            {planName}
          </h3>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
            Active: {startDateStr} – {endDateStr}
          </p>
        </div>
      </div>

      {/* Usage Rows List */}
      <div className="space-y-3 pt-1">
        {/* Row 1: Daily files */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
            Daily files
          </span>
          <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-wider">
            {dailyFilesUsed} / {dailyFilesLimit}
          </span>
        </div>

        {/* Row 2: Daily bandwidth */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
            Daily bandwidth
          </span>
          <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-wider">
            {dailyBwText}
          </span>
        </div>

        {/* Row 3: Total bandwidth & Progress Bar */}
        <div className="pt-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200">
              Total bandwidth
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-wider">
              {totalBwUsedGB.toFixed(2)} GB / {totalBwLimitGB} GB
            </span>
          </div>

          {/* Progress Bar (Green Fill) */}
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700/60">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer link/button */}
      <div className="mt-5 text-center pt-2">
        <button
          onClick={() => setTokenVerificationModalOpen(true)}
          className="text-xs sm:text-sm font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>Click to manage subscription</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
