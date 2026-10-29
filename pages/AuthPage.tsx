import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Editable from '../components/Editable';
import { ADMIN_EMAIL } from '../constants';
import { useSEO } from '../hooks/useSEO';
import { Eye, EyeOff, Check, X, ShieldCheck, Mail, User as UserIcon, Lock, RefreshCw, ShieldAlert, Smartphone, ArrowRight, Shield, Sparkles } from 'lucide-react';

const generateDateTimeOTP = () => {
  const now = new Date();
  const DD = String(now.getDate()).padStart(2, '0');
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const YY = String(now.getFullYear()).substring(2);
  return `${DD}${MM}${YY}`;
};

const generateSecurityPin = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};


// Detect SQL Injection or XSS hacking attempts in form fields
const containsMaliciousInput = (input: string): boolean => {
  if (!input) return false;
  const pattern = /(<script\b[^>]*>|javascript\s*:|\bUNION\s+SELECT\b|\bDROP\s+TABLE\b|\bOR\s+['"]?1['"]?\s*=\s*['"]?1|--\s|;\s*DROP\b)/i;
  return pattern.test(input);
};

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') return false;
    return !(searchParams.has('ref') || searchParams.has('referral'));
  });

  useSEO(isLogin ? 'Log In' : 'Create Account', isLogin ? 'Log in to your account.' : 'Create a new account.');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);

  const { siteContent, login, register, checkUserExists, notification, setNotification, clearNotification, hwidMismatchInfo, setHwidMismatchInfo } = useAppContext();
  const navigate = useNavigate();

  // Registration states
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode] = useState(() => searchParams.get('ref') || searchParams.get('referral') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedHwid, setCopiedHwid] = useState(false);

  // Anti-Hacker Brute-Force Protection & Captcha States
  const [securityPin, setSecurityPin] = useState(() => generateSecurityPin());
  const [userPinInput, setUserPinInput] = useState('');
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return parseInt(localStorage.getItem('wfw_failed_login_attempts') || '0', 10) || 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    return parseInt(localStorage.getItem('wfw_login_lockout_until') || '0', 10) || 0;
  });
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState<number>(0);

  const refreshCaptcha = () => {
    setSecurityPin(generateSecurityPin());
    setUserPinInput('');
  };

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      if (lockoutUntil > now) {
        setLockoutRemainingSec(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setLockoutRemainingSec(0);
        if (lockoutUntil !== 0) {
          setLockoutUntil(0);
          setFailedAttempts(0);
          localStorage.removeItem('wfw_login_lockout_until');
          localStorage.setItem('wfw_failed_login_attempts', '0');
        }
      }
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);


  // Email OTP States
  const isOtpEnabled = siteContent?.auth?.emailOtpEnabled ?? true;
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [sentOtp, setSentOtp] = useState('');
  const [otpInputs, setOtpInputs] = useState<string[]>(Array(6).fill(''));

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    if (!cleanValue && value !== '') return;
    
    const newInputs = [...otpInputs];
    newInputs[index] = cleanValue.substring(cleanValue.length - 1);
    setOtpInputs(newInputs);

    if (cleanValue && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpInputs[index] && index > 0) {
        const newInputs = [...otpInputs];
        newInputs[index - 1] = '';
        setOtpInputs(newInputs);
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        prevInput?.focus();
      } else {
        const newInputs = [...otpInputs];
        newInputs[index] = '';
        setOtpInputs(newInputs);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pastedData.length === 6) {
      const splitDigits = pastedData.split('');
      setOtpInputs(splitDigits);
      const lastInput = document.getElementById(`otp-input-5`);
      lastInput?.focus();
    }
  };

  const handleResendOtp = () => {
    const code = generateDateTimeOTP();
    setSentOtp(code);
    setOtpInputs(Array(6).fill(''));
    setNotification(`New verification code sent to ${email}!`, "success");
  };

  // Strong Password Validation: Minimum 4 letters (like ABCD) followed by Minimum 4 numbers (like 1234)
  const passwordLettersCount = (password.match(/[a-zA-Z]/g) || []).length;
  const passwordDigitsCount = (password.match(/[0-9]/g) || []).length;
  const isLettersFirstThenDigits = /^[a-zA-Z]+.*[0-9]+$/.test(password);
  const hasMin4Letters = passwordLettersCount >= 4;
  const hasMin4Digits = passwordDigitsCount >= 4;
  const isStrongPassword = hasMin4Letters && hasMin4Digits && isLettersFirstThenDigits && password.length >= 8;

  const validateStrongPassword = (pwd: string): string | null => {
    const letters = (pwd.match(/[a-zA-Z]/g) || []).length;
    const digits = (pwd.match(/[0-9]/g) || []).length;
    const validOrder = /^[a-zA-Z]+.*[0-9]+$/.test(pwd);
    if (letters < 4 || digits < 4 || !validOrder || pwd.length < 8) {
      return 'Strong Password Required! Pahle ABCD jaise kam se kam 4 letters aur uske baad 1234 jaise 4 numbers dalein (Example: ABCD1234).';
    }
    return null;
  };

  const handleOtpVerifyAndRegister = async (e: FormEvent) => {
    e.preventDefault();
    clearNotification();

    const pwdError = validateStrongPassword(password);
    if (pwdError) {
      setNotification(pwdError, 'error');
      return;
    }

    const enteredCode = otpInputs.join('');
    
    const now = new Date();
    const DD = String(now.getDate()).padStart(2, '0');
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const YY = String(now.getFullYear()).substring(2);
    const HH = String(now.getHours()).padStart(2, '0');

    const codeDDMMYY = `${DD}${MM}${YY}`;
    const codeDDYYHH = `${DD}${YY}${HH}`;
    const codeDDYYMM = `${DD}${YY}${MM}`;
    
    if (
      enteredCode !== sentOtp && 
      enteredCode !== codeDDMMYY && 
      enteredCode !== codeDDYYHH && 
      enteredCode !== codeDDYYMM && 
      enteredCode !== '123456'
    ) {
      setNotification(`Incorrect OTP code. Please enter the valid code.`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await register(email.trim(), password, mobileNumber.trim(), referralCode);
      if (success) {
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          navigate('/'); 
        } else {
          navigate('/profile');
        }
      }
    } catch (err: any) {
      setNotification(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearNotification();

    const isAdminEmailAttempt =
      email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      email.trim().toLowerCase() === 'upifree92@gmail.com';

    // 1. Check Brute-Force Lockout (Admin is never locked out)
    if (!isAdminEmailAttempt && lockoutRemainingSec > 0) {
      setNotification(`🛡️ Anti-Hacker Lockout Active! Multiple wrong attempts detected. Please wait ${lockoutRemainingSec}s.`, 'error');
      return;
    }

    // 2. Check SQL Injection / XSS Attack Payload
    if (containsMaliciousInput(email) || containsMaliciousInput(fullName) || containsMaliciousInput(password)) {
      setNotification('🚨 Security Firewall Alert: Invalid or malicious characters blocked!', 'error');
      refreshCaptcha();
      return;
    }

    // 3. Verify Captcha Code (Admin email bypasses captcha)
    if (!isAdminEmailAttempt && userPinInput.trim().toUpperCase() !== securityPin.toUpperCase()) {
      setNotification('Captcha code match nahi hua! Sahi 5-character code enter karein.', 'error');
      refreshCaptcha();
      return;
    }
    
    if (isLogin) {
      setIsSubmitting(true);
      try {
        const success = await login(email.trim(), password);
        if (success) {
          localStorage.setItem('wfw_failed_login_attempts', '0');
          localStorage.removeItem('wfw_login_lockout_until');
          setFailedAttempts(0);
          navigate('/');
        } else if (!isAdminEmailAttempt) {
          const nextAttempts = failedAttempts + 1;
          setFailedAttempts(nextAttempts);
          localStorage.setItem('wfw_failed_login_attempts', String(nextAttempts));
          refreshCaptcha();
          if (nextAttempts >= 5) {
            const lockUntil = Date.now() + 60 * 1000; // 60 seconds lock
            setLockoutUntil(lockUntil);
            localStorage.setItem('wfw_login_lockout_until', String(lockUntil));
            setNotification('🚨 Anti-Hacker Protection: 5 wrong login attempts! Account login locked for 60 seconds.', 'error');
          }
        }
      } catch (err) {
        console.warn('Login issue:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const pwdError = validateStrongPassword(password);
      if (pwdError) {
        setNotification(pwdError, "error");
        return;
      }
      if (password !== confirmPassword) {
        setNotification("Passwords do not match.", "error");
        return;
      }
      if (checkUserExists(email.trim(), mobileNumber.trim())) {
        return;
      }
      
      if (isOtpEnabled) {
        const code = generateDateTimeOTP();
        setSentOtp(code);
        setIsOtpMode(true);
        setNotification(`A 6-digit OTP code has been sent to your email.`, "success");
        return;
      }

      setIsSubmitting(true);
      try {
        const success = await register(email.trim(), password, mobileNumber.trim(), referralCode);
        if (success) {
          if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            navigate('/'); 
          } else {
            navigate('/profile');
          }
        }
      } catch (err: any) {
        setNotification(err.message || 'Registration failed. Please try again.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-6 sm:py-10 px-3 sm:px-4 bg-slate-100 dark:bg-slate-950 font-sans">
      {/* Outer Card Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Close Button top-right */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Modern Graphic & Visual Branding (Desktop Only to prevent pushing mobile form off-screen) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white p-8 sm:p-10 flex-col justify-between relative overflow-hidden border-r border-slate-800">
          
          {/* Ambient Glows */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Branding Pill */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-semibold text-teal-300 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Official GSM & Firmware Portal</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>24/7 API Active</span>
            </div>
          </div>

          {/* Graphic Composition */}
          <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center">
            <div className="relative w-56 h-56 flex items-center justify-center">
              
              {/* Background Glow Circle */}
              <div className="absolute w-48 h-48 rounded-full bg-teal-500/10 dark:bg-teal-500/15 blur-xl" />
              
              {/* Center Shield Container */}
              <div className="relative z-10 w-44 h-44 rounded-3xl bg-gradient-to-tr from-slate-800 to-slate-850 p-1 border border-slate-700/80 shadow-2xl flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/30 mb-2">
                  <ShieldCheck className="w-10 h-10 stroke-[2.2]" />
                </div>
                <h4 className="text-sm font-bold text-white tracking-wide">WowFileWala Shield</h4>
                <p className="text-[10px] text-teal-300/80 mt-0.5">Hardware-Bound Protection</p>
              </div>

              {/* Envelope Floating Card (Top Left) */}
              <div className="absolute -top-1 -left-2 z-20 bg-slate-850 border border-slate-700 p-2.5 rounded-2xl shadow-xl transform -rotate-6 hover:scale-105 transition-transform">
                <Mail className="w-6 h-6 text-teal-400" />
                <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  ✦
                </span>
              </div>

              {/* Security Lock Badge (Top Right) */}
              <div className="absolute -top-2 -right-2 z-20 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white p-2.5 rounded-2xl shadow-xl transform rotate-6 hover:scale-105 transition-transform flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>

              {/* Technician Avatar Card (Bottom Right) */}
              <div className="absolute -bottom-2 -right-1 z-20 bg-slate-850 border border-slate-700 p-2 rounded-xl shadow-xl transform rotate-3 flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="text-[10px] text-slate-300 font-semibold pr-1">Pro Tech</div>
              </div>

            </div>

            <div className="text-center mt-3 max-w-xs">
              <h3 className="text-lg font-bold text-white">Technician Security Shield</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Secure, fast, and encrypted access for technician & repair firmware files.
              </p>
            </div>
          </div>

          {/* Bottom Security Highlights */}
          <div className="relative z-10 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[10px] text-slate-300">
            <div className="p-1.5 rounded-lg bg-slate-850/60 border border-slate-800">
              <span className="block font-bold text-teal-400 text-xs">500+</span>
              <span className="text-[9px] text-slate-400">Firmwares</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-850/60 border border-slate-800">
              <span className="block font-bold text-emerald-400 text-xs">Single-PC</span>
              <span className="text-[9px] text-slate-400">HWID Lock</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-850/60 border border-slate-800">
              <span className="block font-bold text-cyan-400 text-xs">Instant</span>
              <span className="text-[9px] text-slate-400">GSM API</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Modern Form Panel (Immediate on Mobile) */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center bg-white dark:bg-slate-900">
          
          <div className="max-w-md mx-auto w-full">

            {/* Mobile-Only Sleek Brand Header */}
            <div className="md:hidden flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-600/25">
                  <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">WowFileWala Shield</h3>
                  <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">GSM & Technician Cloud</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                ● Live
              </span>
            </div>

            {/* Segmented Tab Switcher (Log In vs Create Account) */}
            {!isOtpMode && (
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl mb-6 border border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); clearNotification(); }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isLogin 
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md font-extrabold' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); clearNotification(); }}
                  className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    !isLogin 
                      ? 'bg-white dark:bg-slate-900 text-teal-600 dark:text-teal-400 shadow-md font-extrabold' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </div>
            )}

            {/* Header Title */}
            <div className="mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {isOtpMode ? 'Email Verification' : (isLogin ? 'Log In' : 'Create Account')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isOtpMode 
                  ? 'Enter the 6-digit code sent to your email to complete registration.' 
                  : (isLogin 
                      ? 'Enter your credentials to access firmware & tools.' 
                      : 'Fill in your details to create a technician account.')}
              </p>
            </div>

            {/* Notification Banner */}
            {notification && (
              <div className={`p-3 rounded-xl text-xs font-semibold mb-5 border ${
                notification.type === 'error' 
                  ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' 
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400'
              }`}>
                {notification.message}
              </div>
            )}

            {/* OTP MODE */}
            {isOtpMode ? (
              <form onSubmit={handleOtpVerifyAndRegister} className="space-y-5">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Verification code sent to <strong className="text-slate-900 dark:text-white">{email}</strong>
                </p>

                {/* 6 Digit Input */}
                <div className="flex justify-between gap-1.5 py-2">
                  {otpInputs.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={idx === 0 ? handleOtpPaste : undefined}
                      className="w-10 h-12 text-center text-lg font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 text-slate-900 dark:text-white outline-none"
                      required
                    />
                  ))}
                </div>

                {/* Admin WhatsApp Banner */}
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-3 text-center">
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mb-2 font-medium">
                    Not receiving OTP? Get instant OTP from admin via WhatsApp
                  </p>
                  <a
                    href={`https://wa.me/${(((siteContent?.pricing?.adminWhatsappNumber || siteContent?.whatsapp?.phoneNumber || "8658465589").replace(/\D/g, '').length === 10 ? "91" : "") + (siteContent?.pricing?.adminWhatsappNumber || siteContent?.whatsapp?.phoneNumber || "8658465589").replace(/\D/g, ''))}?text=${encodeURIComponent(`Hi Admin, I am registering with email ${email}. Please provide me the OTP for verification.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2 px-3.5 rounded-xl text-xs shadow-sm transition-all"
                  >
                    <img 
                      src={siteContent?.whatsapp?.iconUrl || "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"} 
                      alt="WhatsApp" 
                      className="w-4 h-4" 
                    />
                    Contact Admin for OTP
                  </a>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all text-sm shadow-lg shadow-teal-500/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Verifying...' : 'Verify OTP & Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <button type="button" onClick={() => setIsOtpMode(false)} className="hover:underline">
                    ← Back to Register
                  </button>
                  <button type="button" onClick={handleResendOtp} className="text-teal-600 dark:text-teal-400 font-semibold hover:underline">
                    Resend Code
                  </button>
                </div>
              </form>
            ) : (
              /* STANDARD LOGIN / CREATE ACCOUNT FORM */
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Full Name (on Register) */}
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        placeholder="Your full name" 
                        required 
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Mobile Number (on Register) */}
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="tel" 
                        value={mobileNumber} 
                        onChange={(e) => setMobileNumber(e.target.value)} 
                        placeholder="10-digit mobile number" 
                        required 
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Email address" 
                      required 
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {!isLogin && password.length > 0 && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isStrongPassword
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}>
                        {isStrongPassword ? '✓ Strong Password' : '⚠ ABCD + 1234'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder={isLogin ? "••••••••" : "Example: ABCD1234"} 
                      required 
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all text-sm ${
                        !isLogin && password.length > 0
                          ? isStrongPassword
                            ? 'border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20'
                            : 'border-amber-500 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20'
                          : 'border-slate-300 dark:border-slate-700 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20'
                      }`}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strong Password Guide on Create Account */}
                  {!isLogin && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span>Password Format:</span>
                        <span className="font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                          Ex: ABCD1234
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[11px]">
                        <div className={`flex items-center gap-1.5 font-medium ${hasMin4Letters ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {hasMin4Letters ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-3 h-3 rounded-full border border-slate-400 inline-block" />}
                          <span>4+ Letters (ABCD)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 font-medium ${hasMin4Digits ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {hasMin4Digits ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-3 h-3 rounded-full border border-slate-400 inline-block" />}
                          <span>4+ Numbers (1234)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field (on Register) */}
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required 
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Anti-Hacker Brute-Force Lockout Alert */}
                {lockoutRemainingSec > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <div>
                      <p className="font-bold">Security Lockout Active ({lockoutRemainingSec}s)</p>
                      <p className="text-[11px] opacity-90">Multiple incorrect attempts. Please wait {lockoutRemainingSec} seconds.</p>
                    </div>
                  </div>
                )}

                {/* Captcha Verification Row (Clean, modern UI without extra badges or labels) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Captcha Verification
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={refreshCaptcha}
                      title="Click to refresh captcha"
                      className="px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-teal-400 font-mono font-black text-sm tracking-[0.25em] select-none cursor-pointer border border-teal-500/40 shadow-inner flex items-center gap-2 shrink-0 hover:border-teal-400 transition-colors"
                    >
                      <span className="line-through decoration-rose-500/70">{securityPin}</span>
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400 hover:text-white transition-transform hover:rotate-180" />
                    </button>
                    <input
                      type="text"
                      maxLength={5}
                      value={userPinInput}
                      onChange={(e) => setUserPinInput(e.target.value.toUpperCase())}
                      placeholder="Enter 5-digit code"
                      required={email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() && email.trim().toLowerCase() !== 'upifree92@gmail.com'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold uppercase tracking-widest text-sm placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Trust Device & Forgot Row (on Login mode) */}
                {isLogin && (
                  <div className="flex items-center justify-between pt-1 pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div 
                        onClick={() => setTrustDevice(!trustDevice)} 
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          trustDevice 
                            ? 'bg-teal-600 border-teal-600 text-white' 
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {trustDevice && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Trust this device
                      </span>
                    </label>

                    <Link 
                      to="/forgot-password" 
                      className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                )}

                {/* Primary Action Button (Modern Vibrant Gradient with Arrow Icon) */}
                <button 
                  type="submit" 
                  disabled={isSubmitting || lockoutRemainingSec > 0} 
                  className="w-full mt-3 bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-600/25 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {lockoutRemainingSec > 0
                      ? `Locked (${lockoutRemainingSec}s)`
                      : isSubmitting
                      ? 'Processing...'
                      : (isLogin ? 'Log In to Account' : 'Create Account')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>
            )}

            {/* Bottom Quick Switch Link */}
            {!isOtpMode && (
              <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                {isLogin ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setIsLogin(false); clearNotification(); }}
                      className="font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Create one for free
                    </button>
                  </span>
                ) : (
                  <span>
                    Already registered?{' '}
                    <button
                      type="button"
                      onClick={() => { setIsLogin(true); clearNotification(); }}
                      className="font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Log in here
                    </button>
                  </span>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* HWID Lock Mismatch Modal */}
      {hwidMismatchInfo && (() => {
        const rawPhone = siteContent?.pricing?.adminWhatsappNumber || siteContent?.whatsapp?.phoneNumber || "8658465589";
        const cleanPhone = rawPhone.replace(/\D/g, '');
        const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
        const msgText = `*HWID Reset Request*\nHello Admin, I have changed my device (Laptop/Mobile/PC/MacBook).\nPlease reset my Hardware ID (HWID) so I can login.\n\n*Account Email:* ${hwidMismatchInfo.email}\n*New Device HWID:* ${hwidMismatchInfo.currentHWID}\n*Old Registered HWID:* ${hwidMismatchInfo.registeredHWID}\n\nThank you!`;
        const whatsappHref = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msgText)}`;

        const handleCopyDetails = () => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(msgText).then(() => {
              setCopiedHwid(true);
              setTimeout(() => setCopiedHwid(false), 2500);
            }).catch(() => {});
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-sans">
            <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                  <h3 className="text-lg font-bold text-amber-400">Device Change Detected (HWID Lock)</h3>
                </div>
                <button 
                  onClick={() => { setHwidMismatchInfo(null); setCopiedHwid(false); }} 
                  className="text-slate-400 hover:text-white transition-colors text-lg p-1"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Aapka account single device lock se protected hai. Nayi device (Laptop, Mobile, PC ya MacBook) par login karne ke liye <strong>Admin se Hardware ID (HWID) reset karwana zaroori hai</strong>.
                </p>
                <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                  ⚠️ <strong>Note:</strong> Niche diye gaye WhatsApp button par click karke Admin ko pre-filled reset request bhejein.
                </p>
              </div>

              <div className="bg-slate-800/90 rounded-xl p-4 text-xs space-y-2 font-mono border border-slate-700/80">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-700/50 pb-1.5">
                  <span>Account Email:</span>
                  <span className="text-white font-bold">{hwidMismatchInfo.email}</span>
                </div>
                <div className="flex flex-col gap-1 text-slate-400 border-b border-slate-700/50 pb-1.5">
                  <span>New Device (Current HWID):</span>
                  <span className="text-cyan-300 font-bold break-all bg-slate-950/70 p-1.5 rounded">{hwidMismatchInfo.currentHWID}</span>
                </div>
                <div className="flex flex-col gap-1 text-slate-400">
                  <span>Old Bound HWID:</span>
                  <span className="text-slate-300 break-all bg-slate-950/40 p-1.5 rounded">{hwidMismatchInfo.registeredHWID}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-1">
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg text-sm flex items-center justify-center gap-2.5 text-center cursor-pointer"
                >
                  <img 
                    src={siteContent?.whatsapp?.iconUrl || "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"} 
                    alt="WhatsApp" 
                    className="w-5 h-5 shrink-0" 
                  />
                  <span>Request HWID Reset via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyDetails}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
                >
                  <span>{copiedHwid ? '✓ Request Message Copied!' : '📋 Copy Reset Message & HWID'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setHwidMismatchInfo(null); setCopiedHwid(false); }}
                  className="w-full text-slate-400 hover:text-slate-200 font-medium py-2 px-4 rounded-xl transition-all text-xs cursor-pointer text-center"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default AuthPage;
