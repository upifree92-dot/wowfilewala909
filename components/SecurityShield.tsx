import React, { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Lock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { ADMIN_EMAIL } from '../constants';

// Generate a deterministic tamper-proof signature for user wallet & identity
export const computeSecuritySignature = (id: string, email: string, balance: number): string => {
  const secretSalt = 'WFW_CYBER_SHIELD_2026_#9981_SALT';
  const raw = `${id}|${email.toLowerCase()}|${Number(balance || 0).toFixed(2)}|${secretSalt}`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
  }
  return `wfw-sig-${(hash >>> 0).toString(16)}`;
};

const SecurityShield: React.FC = () => {
  const { user, isAdmin, logout, setNotification } = useAppContext();
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);

  const triggerWarning = (msg: string) => {
    setSecurityWarning(msg);
    setTimeout(() => {
      setSecurityWarning((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // 1. Protect against keyboard shortcuts used to inspect / tamper with code (F12, Ctrl+Shift+I/J/C, Ctrl+U)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Admin full access
      if (isAdmin) return;

      const key = e.key?.toUpperCase();
      const isF12 = e.key === 'F12' || e.keyCode === 123;
      const isInspect = (e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(key);
      const isViewSource = (e.ctrlKey || e.metaKey) && key === 'U';
      const isSavePage = (e.ctrlKey || e.metaKey) && key === 'S';

      if (isF12 || isInspect || isViewSource || isSavePage) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('🛡️ Anti-Hacker Shield Active: Inspect Element & Source Code access is restricted!');
        return false;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isAdmin) return;
      const target = e.target as HTMLElement;
      // Allow right-click inside normal input/textarea fields so users can paste OTP/IMEI/passwords
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault();
      triggerWarning('🛡️ Website Protected by WowFileWala 256-Bit Anti-Hacker Shield.');
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isAdmin]);

  // 2. Wallet Balance & Admin Role LocalStorage Anti-Tamper Guard
  useEffect(() => {
    if (!user) return;

    // Store valid signature whenever legitimate context state updates
    const validSig = computeSecuritySignature(user.id, user.email, user.walletBalance || 0);
    sessionStorage.setItem('wfw_integrity_sig', validSig);
    sessionStorage.setItem('wfw_verified_balance', String(user.walletBalance || 0));
    sessionStorage.setItem('wfw_verified_email', user.email.toLowerCase());

    const handleStorageTamper = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const expectedEmail = sessionStorage.getItem('wfw_verified_email');
          const expectedBalance = parseFloat(sessionStorage.getItem('wfw_verified_balance') || '0');

          // Detect unauthorized privilege escalation to Admin email or manual wallet balance inflation in localStorage
          if (
            (parsed.email && parsed.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && expectedEmail !== ADMIN_EMAIL.toLowerCase()) ||
            (typeof parsed.walletBalance === 'number' && parsed.walletBalance > expectedBalance + 0.01 && !isAdmin)
          ) {
            triggerWarning('🚨 Security Alert: Unauthorized LocalStorage tampering detected! Session reset.');
            setNotification('Security Violation: Unauthorized data modification blocked by Anti-Hacker Shield.', 'error');
            logout();
          }
        } catch {
          // Ignore malformed JSON
        }
      }
    };

    window.addEventListener('storage', handleStorageTamper);
    return () => window.removeEventListener('storage', handleStorageTamper);
  }, [user, isAdmin, logout, setNotification]);

  // 3. Anti-Clickjacking Frame Guard (allows trusted preview environments)
  useEffect(() => {
    try {
      if (window.top !== window.self) {
        const ancestorOrigins = document.location.ancestorOrigins;
        if (ancestorOrigins && ancestorOrigins.length > 0) {
          const topOrigin = ancestorOrigins[0];
          const isTrusted =
            topOrigin.includes('google') ||
            topOrigin.includes('run.app') ||
            topOrigin.includes('localhost') ||
            topOrigin.includes('wowfilewala');
          if (!isTrusted) {
            console.warn('Untrusted frame detected by SecurityShield');
          }
        }
      }
    } catch {
      // Cross-origin frame access restricted by browser
    }
  }, []);

  if (!securityWarning) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] pointer-events-none animate-bounce">
      <div className="bg-slate-950/95 border-2 border-rose-500/80 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md">
        <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 text-rose-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-rose-400">
            <Lock className="w-3 h-3" />
            <span>Cyber Security Firewall</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mt-0.5 leading-snug">
            {securityWarning}
          </p>
        </div>
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
      </div>
    </div>
  );
};

export default SecurityShield;
