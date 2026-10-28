import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ShieldCheck, Lock, KeyRound, ExternalLink, AlertCircle, CheckCircle2, X, Clipboard, ArrowRight } from 'lucide-react';

export const TokenVerificationModal: React.FC = () => {
  const {
    tokenVerificationModalOpen,
    setTokenVerificationModalOpen,
    pendingDownloadProduct,
    verifyTokenKey,
    initiateDownload,
    tokenProtection,
    siteContent,
  } = useAppContext();

  const [inputKey, setInputKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!tokenVerificationModalOpen) return null;

  const handleClose = () => {
    setTokenVerificationModalOpen(false);
    setErrorMsg('');
    setSuccessMsg('');
    setInputKey('');
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputKey(text.trim().toUpperCase());
      }
    } catch (e) {
      // ignore clipboard permission error
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = inputKey.trim().toUpperCase();
    if (!trimmed) {
      setErrorMsg('Please enter your Token Key.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const result = verifyTokenKey(
        trimmed,
        pendingDownloadProduct?.id,
        pendingDownloadProduct?.name
      );

      if (result.success) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          setIsVerifying(false);
          setTokenVerificationModalOpen(false);
          if (pendingDownloadProduct) {
            initiateDownload(pendingDownloadProduct, true);
          }
        }, 800);
      } else {
        setIsVerifying(false);
        setErrorMsg(result.message);
      }
    }, 400);
  };

  const adminPhone =
    tokenProtection.adminWhatsappForTokens ||
    siteContent?.whatsapp?.phoneNumber ||
    siteContent?.pricing?.adminWhatsappNumber ||
    '8658465589';

  const fileName = pendingDownloadProduct?.name || 'Flash File';
  const whatsappText = encodeURIComponent(
    `Hello Admin! I need a Token Key to download this flash file:\nFile: ${fileName}\nWebsite: ${window.location.origin}\nPlease provide me the access Token Key.`
  );
  const whatsappUrl = `https://wa.me/${adminPhone.replace(/[^0-9]/g, '')}?text=${whatsappText}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-500/30 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Glow Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 p-1.5 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="inline-block text-[10px] font-black tracking-widest uppercase bg-black/25 px-2.5 py-0.5 rounded-full mb-1">
                Security Verification
              </span>
              <h3 className="text-lg font-black leading-tight text-white">
                Token Key Required
              </h3>
            </div>
          </div>
          <p className="text-xs text-amber-100 mt-2 leading-relaxed">
            {tokenProtection.promptMessage || 'This flash file is locked. Please enter your authorized Token Key to proceed with the download.'}
          </p>
        </div>

        {/* Target File Info */}
        <div className="px-6 pt-5 pb-2">
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800/40 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
              📁
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                Target Protected File
              </p>
              <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate" title={fileName}>
                {fileName}
              </p>
              {pendingDownloadProduct?.size && (
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Size: {pendingDownloadProduct.size}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                Enter Token Key
              </span>
              <button
                type="button"
                onClick={handlePaste}
                className="text-[11px] text-amber-600 hover:text-amber-700 dark:text-amber-400 flex items-center gap-1 font-semibold"
              >
                <Clipboard className="w-3 h-3" />
                Paste
              </button>
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value.toUpperCase());
                  setErrorMsg('');
                }}
                placeholder="e.g. FLASH-XXXX-XXXX"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-sm tracking-wider font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 uppercase"
                autoFocus
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="pt-1 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Token Key...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock & Download File</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition-colors flex items-center justify-center gap-2 text-center"
            >
              <span>💬 Don't have a Token Key? Request on WhatsApp</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </form>

        <div className="px-6 pb-4 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Once verified, download access will be unlocked on this device.
          </p>
        </div>
      </div>
    </div>
  );
};
