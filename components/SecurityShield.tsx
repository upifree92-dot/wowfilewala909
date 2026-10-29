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
    }, 3000);
  };

  // 1. Protect against hacker keyboard shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U) for non-Admin users
  // Admin has 100% unrestricted access to all tools, shortcuts, right-click, and editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAdmin) return;

      const key = e.key?.toUpperCase();
      const isF12 = e.key === 'F12' || e.keyCode === 123;
      const isInspect = (e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(key);
      const isViewSource = (e.ctrlKey || e.metaKey) && key === 'U';

      if (isF12 || isInspect || isViewSource) {
        e.preventDefault();
        e.stopPropagation();
        triggerWarning('🛡️ Anti-Hacker Shield Active: Source Code & Inspect Element is restricted!');
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isAdmin]);

  // 2. Admin Role Escalation Anti-Tamper Guard (prevents hackers from changing email to ADMIN_EMAIL in localStorage)
  useEffect(() => {
    if (isAdmin) {
      sessionStorage.setItem('wfw_admin_verified', 'true');
      return;
    }

    if (user) {
      sessionStorage.setItem('wfw_verified_email', user.email.toLowerCase());
    }

    const handleStorageTamper = (e: StorageEvent) => {
      if (isAdmin) return;
      if (e.key === 'user' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const expectedEmail = sessionStorage.getItem('wfw_verified_email');
          const isVerifiedAdmin = sessionStorage.getItem('wfw_admin_verified') === 'true';

          // Block if someone manually edits localStorage "user" email to Admin email without logging in as Admin
          if (
            parsed.email &&
            parsed.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
            !isVerifiedAdmin &&
            expectedEmail !== ADMIN_EMAIL.toLowerCase()
          ) {
            triggerWarning('🚨 Security Alert: Unauthorized Admin role tampering blocked!');
            setNotification('Security Violation: Unauthorized Admin access attempt blocked.', 'error');
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

  if (!securityWarning) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-[92%] pointer-events-none">
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
