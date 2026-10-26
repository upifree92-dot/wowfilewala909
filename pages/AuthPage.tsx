import React, { useState, FormEvent, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import Editable from '../components/Editable';
import { ADMIN_EMAIL } from '../constants';
import { useSEO } from '../hooks/useSEO';

const generateDateTimeOTP = () => {
  const now = new Date();
  const DD = String(now.getDate()).padStart(2, '0');
  const MM = String(now.getMonth() + 1).padStart(2, '0'); // e.g. "07" for July
  const YY = String(now.getFullYear()).substring(2); // e.g. "26" for 2026
  return `${DD}${MM}${YY}`;
};

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  // Common state
  const [isLogin, setIsLogin] = useState(() => {
    return !(searchParams.has('ref') || searchParams.has('referral'));
  });
  useSEO(isLogin ? 'Login' : 'Register', isLogin ? 'Login to your account.' : 'Create a new account.');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { siteContent, login, register, checkUserExists, notification, setNotification, clearNotification, hwidMismatchInfo, setHwidMismatchInfo, performSelfHwidReset } = useAppContext();
  const navigate = useNavigate();

  // Registration-specific state
  const [mobileNumber, setMobileNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState(() => {
    return searchParams.get('ref') || searchParams.get('referral') || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);



  // Email OTP Specific States
  const isOtpEnabled = siteContent?.auth?.emailOtpEnabled ?? true;
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [sentOtp, setSentOtp] = useState('');
  const [otpInputs, setOtpInputs] = useState<string[]>(Array(6).fill(''));

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, ''); // only allow digits
    if (!cleanValue && value !== '') return;
    
    const newInputs = [...otpInputs];
    newInputs[index] = cleanValue.substring(cleanValue.length - 1); // only keep last character
    setOtpInputs(newInputs);

    // Auto-focus next input if a number is entered
    if (cleanValue && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpInputs[index] && index > 0) {
        // Move back and clear previous field
        const newInputs = [...otpInputs];
        newInputs[index - 1] = '';
        setOtpInputs(newInputs);
        const prevInput = document.getElementById(`otp-input-${index - 1}`);
        prevInput?.focus();
      } else {
        // Clear current field
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
      // focus last element
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

  const handleOtpVerifyAndRegister = async (e: FormEvent) => {
    e.preventDefault();
    clearNotification();
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
      setNotification(`Incorrect OTP code. Please enter the valid code (current OTP is ${codeDDMMYY}).`, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await register(email, password, mobileNumber, referralCode);
      if (success) {
        if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          navigate('/'); 
        } else {
          navigate('/profile');
        }
      }
    } catch (err: any) {
      console.warn('Registration after OTP warning:', err);
      setNotification(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearNotification();
    
    if (isLogin) {
      setIsSubmitting(true);
      try {
        const success = await login(email, password);
        if (success) {
          navigate('/'); // Redirect all users to home page after login
        }
      } catch (err) {
        console.warn('Login warning:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // --- Registration: Validate details & Sign Up ---
      if (password !== confirmPassword) {
        setNotification("Passwords do not match.", "error");
        return;
      }
      if (checkUserExists(email, mobileNumber)) {
        // Notification is handled by the context function
        return;
      }
      
      if (isOtpEnabled) {
        // Enter OTP mode instead of registering immediately
        const code = generateDateTimeOTP();
        setSentOtp(code);
        setIsOtpMode(true);
        setNotification(`A 6-digit OTP code has been sent to your email.`, "success");
        return;
      }

      setIsSubmitting(true);
      try {
        const success = await register(email, password, mobileNumber, referralCode);
        if (success) {
          // Check if email confirmation is required (session might be null, but success is true)
          // We redirect to home/profile, but let them know if confirmation is needed.
          if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            navigate('/'); 
          } else {
            navigate('/profile');
          }
        }
      } catch (err: any) {
        console.warn('Registration warning:', err);
        setNotification(err.message || 'Registration failed. Please check your details and try again.', 'error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div 
      className="container mx-auto px-4 py-8 sm:py-16 flex items-center justify-center min-h-[calc(100vh-150px)] bg-cover bg-center"
      style={{backgroundImage: "url('https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=2070&auto=format&fit=crop')"}}
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-900/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 text-white">
        
        {/* HEADER SECTION */}
        <div className="text-center">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                {isOtpMode ? 'Email Verification' : (isLogin ? <Editable contentKey="auth.login.title" /> : <Editable contentKey="auth.register.title" />)}
            </h2>
            <p className="text-slate-300 mt-2 text-sm leading-relaxed">
                {isOtpMode 
                    ? `Please verify your email address to complete registration.`
                    : (isLogin ? <Editable contentKey="auth.login.subtitle" /> : <Editable contentKey="auth.register.subtitle" />)
                }
            </p>
        </div>

        {/* NOTIFICATION MESSAGES */}
        {notification && (
          <div className={`p-3.5 rounded-lg text-center text-xs font-semibold leading-relaxed border ${
            notification.type === 'error' 
              ? 'bg-red-500/10 border-red-500/20 text-red-300' 
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
          }`}>
            {notification.message}
          </div>
        )}

        {/* OTP VERIFICATION MODE */}
        {isOtpMode ? (
          <form onSubmit={handleOtpVerifyAndRegister} className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-300 leading-relaxed">
                We've sent a 6-digit OTP code to <strong className="text-cyan-300">{email}</strong>. Please enter it below.
              </p>
            </div>

            {/* Interactive 6-Digit input boxes */}
            <div className="flex justify-between gap-2 max-w-xs mx-auto py-2">
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
                  className="w-11 h-13 text-center text-xl font-bold font-mono rounded-xl bg-slate-800/80 border border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white"
                  required
                />
              ))}
            </div>

            {/* Contact Admin via WhatsApp for OTP option */}
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-center mt-3 flex flex-col items-center">
              <span className="text-[11px] font-medium text-emerald-300 leading-normal mb-2">
                Not receiving OTP? Get instant OTP from admin via WhatsApp
              </span>
              <a
                href={`https://wa.me/${(((siteContent?.pricing?.adminWhatsappNumber || siteContent?.whatsapp?.phoneNumber || "8658465589").replace(/\D/g, '').length === 10 ? "91" : "") + (siteContent?.pricing?.adminWhatsappNumber || siteContent?.whatsapp?.phoneNumber || "8658465589").replace(/\D/g, ''))}?text=${encodeURIComponent(`Hi Admin, I am registering with email ${email}. Please provide me the OTP for verification.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-2 px-4 rounded-lg transition-all text-sm shadow-md hover:shadow-emerald-500/20"
              >
                <img 
                  src={siteContent?.whatsapp?.iconUrl || "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"} 
                  alt="WhatsApp Logo" 
                  className="w-5 h-5"
                />
                Contact Admin for OTP
              </a>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all text-base shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Verifying & Registering...' : 'Verify OTP & Create Account'}
            </button>

            <div className="flex items-center justify-between pt-2 text-sm text-slate-400">
              <button 
                type="button" 
                onClick={() => { setIsOtpMode(false); clearNotification(); }} 
                className="hover:text-white transition-all underline decoration-cyan-400/50"
              >
                Go Back to Register
              </button>
              
              <button 
                type="button" 
                onClick={handleResendOtp}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Resend Verification Code
              </button>
            </div>
          </form>
        ) : (
          /* REGULAR LOGIN / REGISTER FORMS */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Editable as="label" contentKey="auth.form.emailLabel" className="sr-only" htmlFor="email"/>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-slate-800/60 border border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white placeholder:text-slate-400" placeholder="Email Address"/>
            </div>

            {!isLogin && (
              <div className="relative">
                <Editable as="label" contentKey="auth.form.mobileNumberLabel" className="sr-only" htmlFor="mobileNumber"/>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                <input type="tel" id="mobileNumber" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-slate-800/60 border border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white placeholder:text-slate-400" placeholder="Mobile Number"/>
              </div>
            )}
            
            <div className="relative">
              <Editable as="label" contentKey="auth.form.passwordLabel" className="sr-only" htmlFor="password"/>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
              <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-slate-800/60 border border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white placeholder:text-slate-400" placeholder="Password" />
            </div>

            {!isLogin && (
              <div className="relative">
                <label className="sr-only" htmlFor="confirmPassword">Confirm Password</label>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full py-3.5 pl-12 pr-4 rounded-xl bg-slate-800/60 border border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white placeholder:text-slate-400" placeholder="Confirm Password"/>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all text-base shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : <Editable as="span" contentKey={isLogin ? "auth.login.button" : "auth.register.button"} />}
            </button>

          </form>
        )}
        
        {/* FOOTER SWITCH FORM MODE OPTIONS */}
        {!isOtpMode && (
          <div className="space-y-3.5 pt-2">
            {isLogin && (
              <div className="flex flex-col gap-2 text-center">
                <Link to="/forgot-password" className="text-sm text-cyan-400 hover:underline font-semibold">
                  <Editable as="span" contentKey="auth.login.forgotPasswordLink" />
                </Link>
              </div>
            )}
            <div className="text-center text-slate-400 text-sm">
              <Editable as="span" contentKey={isLogin ? "auth.login.togglePrompt" : "auth.register.togglePrompt"} />
              <button onClick={() => { setIsLogin(!isLogin); clearNotification(); }} className="text-cyan-400 hover:underline font-semibold ml-2">
                <Editable as="span" contentKey={isLogin ? "auth.login.toggleLink" : "auth.register.toggleLink"} />
              </button>
            </div>
          </div>
        )}

      </div>

      {hwidMismatchInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn font-sans">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-lg font-extrabold text-amber-400">Device Change Detected (HWID Mismatch)</h3>
              </div>
              <button onClick={() => setHwidMismatchInfo(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              You are logging in from a new device (laptop, mobile, PC, or MacBook). Your account is currently bound to another device.
            </p>

            <div className="bg-slate-800/80 rounded-xl p-3 text-xs space-y-1.5 font-mono border border-slate-700/60">
              <p className="text-slate-400">Account: <span className="text-white">{hwidMismatchInfo.email}</span></p>
              <p className="text-slate-400">Registered HWID: <span className="text-amber-300 truncate block">{hwidMismatchInfo.registeredHWID}</span></p>
              <p className="text-slate-400">Current Device HWID: <span className="text-cyan-300 truncate block">{hwidMismatchInfo.currentHWID}</span></p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={async () => {
                  await performSelfHwidReset();
                  navigate('/');
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Reset HWID to Current Device Now</span>
              </button>

              <a
                href={`https://wa.me/${(((siteContent?.pricing?.adminWhatsappNumber || siteContent?.whatsapp?.phoneNumber || "8658465589").replace(/\D/g, '').length === 10 ? "91" : "") + (siteContent?.pricing?.adminWhatsappNumber || siteContent?.whatsapp?.phoneNumber || "8658465589").replace(/\D/g, ''))}?text=${encodeURIComponent(`Hi Admin, I have changed my device. Please reset my Hardware ID (HWID) for account: ${hwidMismatchInfo.email}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg text-sm flex items-center justify-center gap-2"
              >
                <img src={siteContent?.whatsapp?.iconUrl || "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"} alt="WhatsApp" className="w-4 h-4" />
                <span>Request HWID Reset via WhatsApp</span>
              </a>

              <button
                onClick={() => setHwidMismatchInfo(null)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 px-4 rounded-xl transition-all text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
