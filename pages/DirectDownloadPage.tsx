import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';
import { useSEO } from '../hooks/useSEO';
import { 
  Download, Loader2, AlertCircle, CheckCircle, Lock, 
  Coins, ArrowRight, FileText, Globe, Info, AlertTriangle 
} from 'lucide-react';

const DirectDownloadPage = () => {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const { products, user, hasPurchased, purchaseProductDirectly, initiateDownload, setNotification, siteContent } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'downloading'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const downloadTriggeredRef = useRef(false);

  const product = products.find(p => p.id === productId);
  useSEO(
    product ? `Download ${product.name}` : 'Direct Download', 
    product ? `Direct high-speed download for ${product.name}.` : 'Download your file directly.'
  );

  useEffect(() => {
    if (!productId) {
      setStatus('error');
      setErrorMsg('No product ID provided in the link.');
      return;
    }

    if (!product) {
      setStatus('error');
      setErrorMsg('The file you are looking for does not exist or has been removed.');
      return;
    }

    setStatus('ready');
  }, [productId, product]);

  const handleDownloadAction = () => {
    if (!product) return;

    if (downloadTriggeredRef.current) return;
    downloadTriggeredRef.current = true;
    setStatus('downloading');

    if (product.price === 0) {
      // Free file
      if (user) {
        initiateDownload(product);
      } else {
        // Direct download without login for free files
        setNotification('Starting your direct download...');
        if (product.isHiddenLink) {
            let directLink = product.downloadLink;
            try {
                const urlObj = new URL(product.downloadLink);
                if (urlObj.hostname.includes('drive.google.com')) {
                    let fileId = '';
                    const match = urlObj.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
                    if (match && match[1]) {
                        fileId = match[1];
                    } else if (urlObj.searchParams.has('id')) {
                        fileId = urlObj.searchParams.get('id') || '';
                    }
                    if (fileId) {
                        directLink = `https://drive.google.com/uc?export=download&id=${fileId}`;
                    }
                }
            } catch (e) {
                // Ignore parse errors
            }
            
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = directLink;
            document.body.appendChild(iframe);
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 15000);
        } else {
            window.open(product.downloadLink, '_blank');
        }
      }
    } else {
      // Paid file
      if (hasPurchased(product.id)) {
        initiateDownload(product);
      } else if (user && user.wallet.balance >= product.price) {
        // Trigger direct purchase
        setIsPurchasing(true);
        try {
          const success = purchaseProductDirectly(product);
          if (success) {
            setTimeout(() => {
              initiateDownload(product);
              setIsPurchasing(false);
            }, 500);
          } else {
            setIsPurchasing(false);
            downloadTriggeredRef.current = false;
            setStatus('ready');
          }
        } catch (err) {
          console.error(err);
          setIsPurchasing(false);
          downloadTriggeredRef.current = false;
          setStatus('ready');
        }
      }
    }
  };

  // Auto-download handler for free/already-purchased files
  useEffect(() => {
    if (status !== 'ready' || !product) return;

    const isPurchased = hasPurchased(product.id);
    const isFree = product.price === 0;

    if (isFree || isPurchased) {
      // Trigger instant automatic download
      const timer = setTimeout(() => {
        handleDownloadAction();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (user && user.wallet.balance >= product.price) {
      // Auto countdown to buy & download
      setIsCountdownActive(true);
      setCountdown(3);
    }
  }, [status, product, user]);

  // Handle countdown for paid files (auto unlock)
  useEffect(() => {
    if (!isCountdownActive || countdown <= 0) {
      if (isCountdownActive && countdown === 0) {
        setIsCountdownActive(false);
        handleDownloadAction();
      }
      return;
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isCountdownActive, countdown]);

  const cancelCountdown = () => {
    setIsCountdownActive(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-cyan-500 animate-spin mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">Checking file and credentials...</p>
      </div>
    );
  }

  if (status === 'error' || !product) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-rose-100 dark:border-rose-950/30 text-center">
          <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Download Error</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">{errorMsg || "Invalid file link."}</p>
          <div className="space-y-3">
            <Link 
              to="/" 
              className="block w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm transition-all"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPurchased = hasPurchased(product.id);
  const isFree = product.price === 0;

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        {/* Banner header */}
        <div className="bg-gradient-to-r from-cyan-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
              <Download className="h-6 w-6" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
              Direct Download Portal
            </span>
          </div>
          <h1 className="text-xl font-extrabold leading-snug line-clamp-2">{product.name}</h1>
          <p className="text-sm text-cyan-100 mt-1">{product.size || 'Unknown Size'}</p>
        </div>

        {/* Info panel */}
        <div className="p-6 space-y-6">
          {/* File description */}
          {product.description && (
            <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                File Information
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Download status / action states */}
          {isFree || isPurchased ? (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400 mb-2">
                <CheckCircle className="h-10 w-10 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Starting Your Direct Download
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                The download file will open automatically. If it does not start within a few seconds, click the manual button below.
              </p>

              <div className="pt-4">
                <button
                  onClick={() => {
                    downloadTriggeredRef.current = false;
                    handleDownloadAction();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-600/10 transition-all hover:scale-102"
                >
                  <Download className="h-5 w-5" />
                  Download Directly
                </button>
              </div>
            </div>
          ) : !user ? (
            /* Paid file & user not logged in */
            <div className="space-y-4 text-center py-4">
              <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-500/10 rounded-full text-amber-600 dark:text-amber-400 mb-2">
                <Lock className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Premium File Locked
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                This is a premium resource which costs <span className="font-bold text-cyan-600 dark:text-cyan-400">₹{product.price.toFixed(2)}</span>. Please log in or register to purchase and download.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/login', { state: { from: location } })}
                  className="flex-1 py-3 px-5 bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Log In / Register</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <Link
                  to="/"
                  className="flex-1 py-3 px-5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all block text-center"
                >
                  Browse Files
                </Link>
              </div>
            </div>
          ) : user.wallet.balance >= product.price ? (
            /* User is logged in, has sufficient balance but hasn't purchased yet */
            <div className="space-y-4">
              {isCountdownActive ? (
                <div className="text-center py-4 space-y-4">
                  <div className="inline-flex items-center justify-center p-4 bg-cyan-50 dark:bg-cyan-500/10 rounded-full text-cyan-500 mb-2 relative">
                    <Loader2 className="h-12 w-12 animate-spin text-cyan-500 absolute" />
                    <span className="text-lg font-extrabold relative z-10">{countdown}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    Auto-Unlocking & Downloading File
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    You have sufficient points. ₹{product.price.toFixed(2)} will be deducted and download will start in {countdown} seconds...
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={cancelCountdown}
                      className="px-5 py-2 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs rounded-full uppercase tracking-wider transition-all"
                    >
                      Cancel Auto-Download
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl border border-cyan-100 dark:border-cyan-950/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Coins className="h-5 w-5 text-cyan-500" />
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Your Point Balance</p>
                        <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200">🪙 ₹{user.wallet.balance.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400">File Price</p>
                      <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400">₹{product.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-lg border border-amber-100 dark:border-amber-950/30 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Points will be deducted from your wallet to unlock this file. Download access link will remain active for 59 minutes after unlocking.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      downloadTriggeredRef.current = false;
                      handleDownloadAction();
                    }}
                    disabled={isPurchasing}
                    className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Unlocking Premium File...</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-5 w-5" />
                        <span>Unlock & Download Now (₹{product.price.toFixed(2)})</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* User is logged in but has insufficient balance */
            <div className="space-y-4 text-center py-4">
              <div className="inline-flex items-center justify-center p-3 bg-rose-100 dark:bg-rose-500/10 rounded-full text-rose-600 dark:text-rose-400 mb-2">
                <Coins className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Insufficient Points
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                This file costs <span className="font-bold text-rose-600 dark:text-rose-400">₹{product.price.toFixed(2)}</span> but your current balance is <span className="font-bold text-slate-700 dark:text-slate-200">₹{user.wallet.balance.toFixed(2)}</span>. Please top up your wallet.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/pricing', { state: { insufficientPoints: true, requiredAmount: product.price - user.wallet.balance } })}
                  className="flex-1 py-3 px-5 bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold rounded-xl shadow-md transition-all block text-center"
                >
                  🪙 Purchase Credits
                </button>
                <Link
                  to="/"
                  className="flex-1 py-3 px-5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all block text-center"
                >
                  Browse Files
                </Link>
              </div>
            </div>
          )}

          {/* Additional Guidance Info */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="h-4 w-4 shrink-0 text-slate-400/80" />
            <p className="leading-relaxed">
              Downloads are processed over high-speed networks. For any technical support or failed downloads, please contact us on WhatsApp directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectDownloadPage;
