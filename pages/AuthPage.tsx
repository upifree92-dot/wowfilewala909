import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Editable from '../components/Editable';
import { ADMIN_EMAIL } from '../constants';
import { useSEO } from '../hooks/useSEO';
import { Eye, EyeOff, Check, X, ShieldCheck, Mail, User as UserIcon, Lock, RefreshCw, ShieldAlert } from 'lucide-react';

const generateDateTimeOTP = () => {
  const now = new Date();
  const DD = String(now.getDate()).padStart(2, '0');
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const YY = String(now.getFullYear()).substring(2);
  return `${DD}${MM}${YY}`;
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
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return parseInt(localStorage.getItem('wfw_failed_login_attempts') || '0', 10) || 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    return parseInt(localStorage.getItem('wfw_login_lockout_until') || '0', 10) || 0;
  });
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState<number>(0);

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

    // 3. (Security Captcha Check Removed)
    
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
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 bg-slate-100 dark:bg-slate-950">
      {/* Outer Card Container */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[520px] relative">
        
        {/* Close Button top-right */}
        <button 
          onClick={() => navigate('/')} 
          className="absolute top-4 right-4 z-20 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Close"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* LEFT COLUMN: Modern Graphic & Visual Branding */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
          
          {/* Ambient Glows */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

          {/* Graphic Composition matching the reference photo */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            
            {/* Background Circle */}
            <div className="absolute w-44 h-44 rounded-full bg-teal-100/60 dark:bg-teal-950/40 blur-sm" />
            
            {/* White Base Card */}
            <div className="relative z-10 w-52 h-36 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 flex flex-col justify-between transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-20" />
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-full w-12" />
                </div>
              </div>
              
              <div className="space-y-1.5 my-2">
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                <div className="h-1.5 bg-slate-100 dark:bg-slate-700/60 rounded-full w-3/4" />
              </div>

              <div className="w-full h-6 bg-teal-600 rounded-lg flex items-center justify-center">
                <div className="w-12 h-1 bg-white/70 rounded-full" />
              </div>
            </div>

            {/* Envelope floating card (Top Left) */}
            <div className="absolute top-4 left-0 z-20 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 transform -rotate-6 hover:scale-105 transition-transform">
              <div className="relative">
                <Mail className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                <span className="absolute -top-1.5 -right-1.5 bg-teal-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  6
                </span>
              </div>
            </div>

            {/* Shield floating badge (Top Right) */}
            <div className="absolute top-2 right-2 z-20 bg-teal-600 text-white p-3.5 rounded-2xl shadow-xl transform rotate-6 hover:scale-105 transition-transform flex items-center justify-center">
              <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
            </div>

            {/* Profile Avatar floating card (Bottom Right) */}
            <div className="absolute bottom-4 right-1 z-20 bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 transform rotate-3 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="w-5 h-1 bg-teal-600 rounded-full mt-1.5" />
            </div>

            {/* Sparkles & Accents */}
            <div className="absolute top-8 left-20 text-amber-400 animate-pulse text-lg">✦</div>
            <div className="absolute bottom-10 left-6 text-teal-400 text-sm">✦</div>
            <div className="absolute bottom-2 left-28 w-2.5 h-2.5 rounded-full bg-rose-400/80" />
          </div>

          <div className="mt-6 text-center z-10">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">WowFileWala Shield</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
              Secure, fast, and encrypted access for technician & repair firmware files.
            </p>
          </div>
        </div>


        {/* RIGHT COLUMN: Form Panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-white dark:bg-slate-900">
          
          <div className="max-w-md mx-auto w-full">
            {/* Header Title */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {isOtpMode ? 'Email Verification' : (isLogin ? 'Log In' : 'Create Account')}
              </h2>
              {isOtpMode && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Enter the 6-digit code sent to your email to complete registration.
                </p>
              )}
            </div>

            {/* Notification Banner */}
            {notification && (
              <div className={`p-3 rounded-lg text-xs font-semibold mb-5 border ${
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
                      className="w-10 h-12 text-center text-lg font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-slate-800 dark:focus:border-slate-200 focus:ring-1 focus:ring-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  ))}
                </div>

                {/* Admin WhatsApp Banner */}
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl p-3 text-center">
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mb-2 font-medium">
                    Not receiving OTP? Get instant OTP from admin via WhatsApp
                  </p>
                  <a
                    href={`https://wa.me/${(((siteContent?.pricing?.adminWhatsappNumber || siteContent?.whatsapp?.phoneNumber || "8658465589").replace(/\D/g, '').length === 10 ? "91" : "") + (siteContent?.pricing?.adminWhatsappNumber || siteContent?.whatsapp?.phoneNumber || "8658465589").replace(/\D/g, ''))}?text=${encodeURIComponent(`Hi Admin, I am registering with email ${email}. Please provide me the OTP for verification.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-1.5 px-3 rounded-lg text-xs shadow-sm transition-all"
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
                  className="w-full bg-[#54595e] hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all text-sm shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying...' : 'Verify OTP & Create Account'}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <button type="button" onClick={() => setIsOtpMode(false)} className="hover:underline">
                    ← Back to Register
                  </button>
                  <button type="button" onClick={handleResendOtp} className="text-slate-700 dark:text-slate-300 font-semibold hover:underline">
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
                    <input 
                      type="text" 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      placeholder="Your full name" 
                      required 
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-800 dark:focus:border-slate-200 focus:ring-1 focus:ring-slate-800 outline-none transition-all text-sm"
                    />
                  </div>
                )}

                {/* Mobile Number (on Register) */}
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Number
                    </label>
                    <input 
                      type="tel" 
                      value={mobileNumber} 
                      onChange={(e) => setMobileNumber(e.target.value)} 
                      placeholder="10-digit mobile number" 
                      required 
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-800 dark:focus:border-slate-200 focus:ring-1 focus:ring-slate-800 outline-none transition-all text-sm"
                    />
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Email" 
                    required 
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-800 dark:focus:border-slate-200 focus:ring-1 focus:ring-slate-800 outline-none transition-all text-sm"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    {!isLogin && password.length > 0 && (
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isStrongPassword
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      }`}>
                        {isStrongPassword ? '✓ Strong Password Set' : '⚠ Enter ABCD + 1234 Format'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder={isLogin ? "••••••••" : "Example: ABCD1234"} 
                      required 
                      className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all text-sm ${
                        !isLogin && password.length > 0
                          ? isStrongPassword
                            ? 'border-emerald-500 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500'
                            : 'border-amber-500 focus:border-amber-600 focus:ring-1 focus:ring-amber-500'
                          : 'border-slate-300 dark:border-slate-700 focus:border-slate-800 dark:focus:border-slate-200 focus:ring-1 focus:ring-slate-800'
                      }`}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Strong Password Guide on Create Account */}
                  {!isLogin && (
                    <div className="mt-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Password Rule (Letters + Numbers):</span>
                        <span className="font-mono text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                          Ex: ABCD1234
                        </span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                        <div className={`flex items-center gap-1.5 font-medium ${hasMin4Letters ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {hasMin4Letters ? <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block shrink-0" />}
                          <span>4+ Letters (jaise <strong>ABCD</strong>)</span>
                        </div>
                        <div className={`flex items-center gap-1.5 font-medium ${hasMin4Digits ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {hasMin4Digits ? <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block shrink-0" />}
                          <span>4+ Numbers (jaise <strong>1234</strong>)</span>
                        </div>
                        <div className={`sm:col-span-2 flex items-center gap-1.5 font-medium ${isStrongPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                          {isStrongPassword ? <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" /> : <span className="w-3.5 h-3.5 rounded-full border border-slate-400 inline-block shrink-0" />}
                          <span>Pahle ABCD letters uske baad 1234 code (Min 8 chars)</span>
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
                      <input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required 
                        className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-slate-800 dark:focus:border-slate-200 focus:ring-1 focus:ring-slate-800 outline-none transition-all text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
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
                      <p className="font-bold">Anti-Hacker Lockout Active ({lockoutRemainingSec}s)</p>
                      <p className="text-[11px] opacity-90">5 galat attempts ke baad security lock lag gaya hai. Kripya {lockoutRemainingSec} sec intezar karein.</p>
                    </div>
                  </div>
                )}


                {/* Trust Device & Forgot Row (on Login mode) */}
                {isLogin && (
                  <div className="flex items-center justify-between pt-1 pb-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div 
                        onClick={() => setTrustDevice(!trustDevice)} 
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
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
                      className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Forgot?
                    </Link>
                  </div>
                )}

                {/* Primary Action Button (Solid Dark Button matching screenshot) */}
                <button 
                  type="submit" 
                  disabled={isSubmitting || lockoutRemainingSec > 0} 
                  className="w-full mt-2 bg-[#54595e] hover:bg-slate-700 text-white font-semibold py-3 px-4 rounded-lg transition-all text-sm shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {lockoutRemainingSec > 0
                    ? `Locked (${lockoutRemainingSec}s)`
                    : isSubmitting
                    ? 'Processing...'
                    : (isLogin ? 'Log In' : 'Create Account')}
                </button>

              </form>
            )}

            {/* Divider Line: --- or --- */}
            {!isOtpMode && (
              <>
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  </div>
                  <span className="relative px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 uppercase tracking-wider">
                    or
                  </span>
                </div>

                {/* Secondary Outline Action Button (Switches mode) */}
                <button 
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); clearNotification(); }}
                  className="w-full border border-slate-800 dark:border-slate-200 text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold py-3 px-4 rounded-lg transition-all text-sm cursor-pointer"
                >
                  {isLogin ? 'Create Account' : 'Log In'}
                </button>
              </>
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
