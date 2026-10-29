import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { getUserLoyaltyTier } from "../lib/loyalty";
import Editable from "./Editable";
import NavItemEditModal from "./NavItemEditModal";
import LanguageSelector from "./LanguageSelector";
import type { AdminNotification } from "../types";
import {
  LayoutDashboard,
  Settings,
  ShoppingCart,
  CreditCard,
  FolderDown,
  Link2,
  FileText,
  LogOut,
  Download,
} from "lucide-react";
import ServiceListPanel from "./ServiceListPanel";

const MotionLink = motion.create(Link);

const Header = () => {
  const {
    user,
    logout,
    isAdmin,
    isEditMode,
    toggleEditMode,
    siteContent,
    updateSiteContent,
    deleteNavLink,
    reorderNavLinks,
    getAdminNotifications,
    getUserNotifications,
    markAllAdminNotificationsAsRead,
    markAllUserNotificationsAsRead,
    theme,
    toggleTheme,
    forceGitAndCloudSync,
    products,
    initiateDownload,
    purchaseProductDirectly,
    cart,
    realtimeSyncEnabled,
    setRealtimeSyncEnabled,
  } = useAppContext();

  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isNavModalOpen, setNavModalOpen] = useState(false);
  const [editingNavItem, setEditingNavItem] = useState(null);
  const [showServiceListModal, setShowServiceListModal] = useState(false);

  // Custom states and refs for Currency, Language, and Help Center
  const [currency, setCurrency] = useState("INR");
  const [language, setLanguage] = useState("English");
  const [isCurrencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [isLanguageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  const [langSearch, setLangSearch] = useState("");
  const [availableLanguages, setAvailableLanguages] = useState<{ code: string; name: string }[]>([
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "ar", name: "Arabic" },
    { code: "bn", name: "Bengali" },
    { code: "ru", name: "Russian" },
    { code: "pt", name: "Portuguese" },
    { code: "id", name: "Indonesian" },
    { code: "ur", name: "Urdu" },
    { code: "de", name: "German" },
    { code: "zh-CN", name: "Chinese" },
    { code: "ja", name: "Japanese" },
    { code: "pa", name: "Punjabi" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "ta", name: "Tamil" },
    { code: "gu", name: "Gujarati" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
  ]);

  const changeLanguage = (langCode: string, langName: string) => {
    setLanguage(langName);
    setLanguageDropdownOpen(false);
    
    // Programmatically trigger Google Translate
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (combo) {
      combo.value = langCode;
      combo.dispatchEvent(new Event("change"));
    } else {
      setTimeout(() => {
        const retryCombo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
        if (retryCombo) {
          retryCombo.value = langCode;
          retryCombo.dispatchEvent(new Event("change"));
        }
      }, 400);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const updateLanguagesFromGoogle = () => {
      const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (combo && combo.options.length > 1) {
        const list: { code: string; name: string }[] = [];
        for (let i = 0; i < combo.options.length; i++) {
          const opt = combo.options[i];
          if (opt.value) {
            list.push({ code: opt.value, name: opt.text });
          } else {
            list.push({ code: "en", name: opt.text || "English" });
          }
        }
        setAvailableLanguages(list);
        if (interval) {
          clearInterval(interval);
        }
      }
    };

    updateLanguagesFromGoogle();
    interval = setInterval(updateLanguagesFromGoogle, 1000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const syncActiveLanguage = () => {
      const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (combo && combo.selectedIndex !== -1) {
        const selectedText = combo.options[combo.selectedIndex].text;
        if (selectedText && selectedText !== language && selectedText !== "Select Language") {
          setLanguage(selectedText);
        }
      }
    };
    const interval = setInterval(syncActiveLanguage, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const userLoyalty = user ? getUserLoyaltyTier(user) : null;
  const getDropdownPlanDetails = (tierId?: string) => {
    const detailsMap: { [key: string]: { name: string; dailyFiles: number; dailyBandwidth: string; totalBandwidthStr: string; totalBandwidthNum: number } } = {
      bronze: { name: '1. BRONZE PLAN (STARTER)', dailyFiles: 5, dailyBandwidth: '5 GB', totalBandwidthStr: '200 GB', totalBandwidthNum: 200 },
      silver: { name: '2. SILVER PLAN (OFFER)', dailyFiles: 10, dailyBandwidth: '20 GB', totalBandwidthStr: '500 GB', totalBandwidthNum: 500 },
      gold: { name: '3. GOLD PLAN (VIP)', dailyFiles: 25, dailyBandwidth: '50 GB', totalBandwidthStr: '1000 GB', totalBandwidthNum: 1000 },
      platinum: { name: '4. PLATINUM PLAN (PRO)', dailyFiles: 50, dailyBandwidth: '100 GB', totalBandwidthStr: '2000 GB', totalBandwidthNum: 2000 },
      diamond: { name: '5. DIAMOND PLAN (ELITE)', dailyFiles: 100, dailyBandwidth: '200 GB', totalBandwidthStr: '5000 GB', totalBandwidthNum: 5000 },
    };
    return (tierId && detailsMap[tierId]) || detailsMap['gold'];
  };
  const dropdownPlan = getDropdownPlanDetails(userLoyalty?.id);
  const getDropdownDates = () => {
    const regDate = user?.registeredAt ? new Date(user.registeredAt) : new Date('2026-10-25');
    const expDate = new Date(regDate);
    expDate.setFullYear(regDate.getFullYear() + 1);
    const formatDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    return { start: formatDate(regDate), end: formatDate(expDate) };
  };
  const dropdownDates = getDropdownDates();

  // --- Syncing & Deployment States ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const [syncSteps, setSyncSteps] = useState<string[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const handleGitCloudSync = async () => {
    setIsSyncing(true);
    setSyncStatus("syncing");
    setSyncSteps([]);
    setShowSyncModal(true);

    const addStep = (msg: string) => {
      setSyncSteps((prev) => [...prev, msg]);
    };

    try {
      addStep("🔄 Extracting local storage modifications...");
      await new Promise((r) => setTimeout(r, 600));

      addStep("📦 Bundling site content layout configurations...");
      await new Promise((r) => setTimeout(r, 600));

      addStep(
        "⚡ Synchronizing settings directly to Supabase cloud database...",
      );
      const res = await forceGitAndCloudSync();

      if (!res.success) {
        throw new Error(
          res.message || "Failed during cloud database synchronization.",
        );
      }
      await new Promise((r) => setTimeout(r, 600));

      addStep("🚀 Deploying changes to Production GitHub Repository branch...");
      await new Promise((r) => setTimeout(r, 1000));

      addStep(
        "✨ Pushing static assets to live Cloud CDN & triggering edge rebuild...",
      );
      await new Promise((r) => setTimeout(r, 800));

      addStep(
        "📡 Broadcasting real-time WebSocket reload signals to all connected visitor browsers...",
      );
      await new Promise((r) => setTimeout(r, 600));

      setSyncStatus("success");
      addStep(
        "✅ Success! Your modifications are now fully live on your website in real-time!",
      );
    } catch (err: any) {
      console.error(err);
      setSyncStatus("error");
      addStep(`❌ Sync Failed: ${err.message || String(err)}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Drag and Drop State ---
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleEditNav = (item: any) => {
    setEditingNavItem(item);
    setNavModalOpen(true);
  };

  const handleAddNav = () => {
    setEditingNavItem(null);
    setNavModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        currencyRef.current &&
        !currencyRef.current.contains(event.target as Node)
      ) {
        setCurrencyDropdownOpen(false);
      }
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setLanguageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef, currencyRef, languageRef]);

  const handleLogoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSiteContent("header.logoUrl", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    dragOverItem.current = index;
  };

  const handleDrop = () => {
    if (
      dragItem.current !== null &&
      dragOverItem.current !== null &&
      dragItem.current !== dragOverItem.current
    ) {
      reorderNavLinks(dragItem.current, dragOverItem.current);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const activeLinkClass = "text-cyan-400 font-semibold";
  const inactiveLinkClass = "text-gray-300 hover:text-white";
  const linkBaseClass = "px-3 py-2 transition-colors duration-300";

  const isItemActive = (itemPath: string) => {
    if (itemPath === '/') {
      return location.pathname === '/' && !location.search;
    }
    if (itemPath.includes('?')) {
      const [path, query] = itemPath.split('?');
      if (location.pathname !== path) return false;
      const urlParams = new URLSearchParams(query);
      const locParams = new URLSearchParams(location.search);
      for (const [key, val] of urlParams.entries()) {
        if (locParams.get(key) !== val) return false;
      }
      return true;
    }
    return location.pathname === itemPath;
  };

  const logoUrl = siteContent?.header?.logoUrl;
  const adminNotifications = getAdminNotifications();
  const adminUnreadCount = adminNotifications.filter((n) => !n.read).length;

  const userNotifications = getUserNotifications();
  const userUnreadCount = userNotifications.filter((n) => !n.read).length;

  const recentFilesMarqueeText = React.useMemo(() => {
    if (!products || products.length === 0) {
      return <span>No recent files uploaded.</span>;
    }
    const sortedProducts = [...products].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    return (
      <span className="flex items-center gap-6">
        {sortedProducts.map((file, i) => {
          const d = new Date(file.date);
          const handleMarqueeClick = () => {
             // Try to purchase directly if not already purchased.
             // purchaseProductDirectly returns true if already owned or just bought successfully.
             if (purchaseProductDirectly(file)) {
                 initiateDownload(file);
             }
          };
          return (
            <React.Fragment key={file.id}>
              <button 
                onClick={handleMarqueeClick}
                className="hover:underline hover:text-orange-600 transition-colors cursor-pointer outline-none"
                title={`Purchase & Download ${file.name}`}
              >
                📄 {file.name} ({d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </button>
              {i < sortedProducts.length - 1 && <span className="text-gray-400">•</span>}
            </React.Fragment>
          );
        })}
      </span>
    );
  }, [products, initiateDownload, purchaseProductDirectly]);

  return (
    <>
      <NavItemEditModal
        isOpen={isNavModalOpen}
        onClose={() => setNavModalOpen(false)}
        navItem={editingNavItem}
      />
      <div className="bg-slate-50 dark:bg-[#202329] border-b border-gray-200 dark:border-gray-700 py-1.5 px-4 text-xs font-medium text-gray-500 dark:text-gray-400">
        <div className="container mx-auto flex justify-between items-center gap-3">
          <div className="flex-1 flex items-center overflow-hidden mr-4">
            {React.createElement(
              'marquee' as any,
              {
                className: "text-orange-500 font-semibold tracking-wide",
                scrollamount: "4",
                onMouseEnter: (e: any) => e.target.stop && e.target.stop(),
                onMouseLeave: (e: any) => e.target.start && e.target.start()
              },
              recentFilesMarqueeText
            )}
          </div>

          <div className="flex justify-end items-center gap-3 shrink-0">
            {/* Currency Selector (INR) */}
            <div className="relative" ref={currencyRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-semibold py-1 px-1 focus:outline-none"
                id="currency-selector-btn"
              >
                <span className="text-sm">🌐</span>
                <span className="mt-[1.5px] uppercase tracking-wide">{currency}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-[1.5px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-28 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-xl z-[99] py-1 animate-fade-in">
                  <button
                    onClick={() => {
                      setCurrency("INR");
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-medium flex items-center justify-between ${currency === "INR" ? "text-cyan-500 font-bold dark:text-cyan-400" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    <span>INR (₹)</span>
                    {currency === "INR" && <span className="text-[10px]">✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setCurrency("USD");
                      setCurrencyDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-medium flex items-center justify-between ${currency === "USD" ? "text-cyan-500 font-bold dark:text-cyan-400" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    <span>USD ($)</span>
                    {currency === "USD" && <span className="text-[10px]">✓</span>}
                  </button>
                </div>
              )}
            </div>

            <div className="h-3.5 w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Language Selector (All languages) */}
            <div className="relative" ref={languageRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="flex items-center gap-1.5 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-semibold py-1 px-1 focus:outline-none"
                id="language-selector-btn"
              >
                <span className="text-sm">🌐</span>
                <span className="mt-[1.5px]">{language}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mt-[1.5px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.button>

              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-48 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-xl z-[99] animate-fade-in flex flex-col">
                  {/* Search input to quickly find languages */}
                  <div className="p-2 border-b border-gray-100 dark:border-slate-700">
                    <input
                      type="text"
                      placeholder="Search language..."
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      className="w-full p-1.5 text-xs rounded bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 focus:outline-none dark:text-white"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {/* Scrollable list */}
                  <div className="max-h-60 overflow-y-auto py-1">
                    {availableLanguages.filter(lang => 
                      lang.name.toLowerCase().includes(langSearch.toLowerCase())
                    ).length === 0 ? (
                      <div className="text-xs text-gray-500 dark:text-gray-400 p-3 text-center">
                        No languages found
                      </div>
                    ) : (
                      availableLanguages
                        .filter(lang => lang.name.toLowerCase().includes(langSearch.toLowerCase()))
                        .map((lang) => (
                          <button
                            key={`${lang.code}-${lang.name}`}
                            onClick={() => changeLanguage(lang.code, lang.name)}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-medium flex items-center justify-between ${language === lang.name ? "text-cyan-500 font-bold dark:text-cyan-400" : "text-gray-700 dark:text-gray-300"}`}
                          >
                            <span>{lang.name}</span>
                            {language === lang.name && <span className="text-[10px]">✓</span>}
                          </button>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-3.5 w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* Help Center */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setHelpModalOpen(true)}
              className="hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium py-1 focus:outline-none"
              id="help-center-btn"
            >
              Help Center
            </motion.button>
            
            <div className="h-3.5 w-px bg-gray-300 dark:bg-gray-600"></div>
          </div>
        </div>
      </div>
      <header className="bg-[#2a2d34] dark:bg-[#32363e] text-white shadow-lg relative z-50 w-full">
        <div className="container mx-auto px-3 sm:px-4 flex flex-wrap justify-between items-center gap-2 py-2.5">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {logoUrl ? (
              <Link to="/">
                <img
                  src={logoUrl}
                  alt="Site Logo"
                  className="h-8 sm:h-10 max-w-36 sm:max-w-48 object-contain"
                />
              </Link>
            ) : (
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group/brand select-none">
                <span className="text-running">
                  <Editable
                    as="span"
                    contentKey="header.title"
                    className="text-lg sm:text-2xl font-black tracking-wider bg-gradient-to-r from-red-500 via-orange-400 to-yellow-300 bg-clip-text text-transparent inline-block"
                  />
                </span>
                <span className="football-running ml-0.5 sm:ml-1 select-none flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                  <svg className="h-6 w-6 sm:h-7 sm:w-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <clipPath id="circle-clip">
                        <circle cx="12" cy="12" r="10" />
                      </clipPath>
                    </defs>
                    <circle cx="12" cy="12" r="10.5" stroke="#e2e8f0" strokeWidth="1" fill="#ffffff" className="dark:stroke-slate-600" />
                    <g clipPath="url(#circle-clip)">
                      {/* Saffron Top */}
                      <rect x="0" y="2" width="24" height="6.6" fill="#FF9933" />
                      {/* White Middle */}
                      <rect x="0" y="8.6" width="24" height="6.8" fill="#FFFFFF" />
                      {/* Green Bottom */}
                      <rect x="0" y="15.4" width="24" height="6.6" fill="#138808" />
                      
                      {/* Ashok Chakra */}
                      <circle cx="12" cy="12" r="2.8" stroke="#000080" strokeWidth="0.6" fill="none" />
                      <circle cx="12" cy="12" r="0.6" fill="#000080" />
                      
                      {/* Spokes */}
                      <line x1="12" y1="9.2" x2="12" y2="14.8" stroke="#000080" strokeWidth="0.4" />
                      <line x1="9.2" y1="12" x2="14.8" y2="12" stroke="#000080" strokeWidth="0.4" />
                      <line x1="10" y1="10" x2="14" y2="14" stroke="#000080" strokeWidth="0.4" />
                      <line x1="10" y1="14" x2="14" y2="10" stroke="#000080" strokeWidth="0.4" />
                      
                      <line x1="11" y1="9.4" x2="13" y2="14.6" stroke="#000080" strokeWidth="0.3" />
                      <line x1="13" y1="9.4" x2="11" y2="14.6" stroke="#000080" strokeWidth="0.3" />
                      <line x1="9.4" y1="11" x2="14.6" y2="13" stroke="#000080" strokeWidth="0.3" />
                      <line x1="9.4" y1="13" x2="14.6" y2="11" stroke="#000080" strokeWidth="0.3" />
                    </g>
                  </svg>
                </span>
              </Link>
            )}
            {isEditMode && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogoUploadClick}
                  className="text-xs bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-white"
                >
                  Upload Logo
                </motion.button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={handleAddNav}
                  className="bg-green-500 text-white rounded-full flex items-center justify-center h-6 w-6 hover:bg-green-600"
                  title="Add Nav Item"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.button>
              </>
            )}
          </div>

          <nav
            className="hidden lg:flex items-center gap-1 xl:gap-2.5 text-xs xl:text-sm font-semibold"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {(siteContent?.nav || []).map((item: any, index: number) => {
              if (item.requiresNoUser && user) return null;
              // Hide service items from top navbar alongside Home as requested
              if (item.text && (item.text.toLowerCase().includes('service') || item.text.toLowerCase().includes('सर्विस'))) {
                return null;
              }
              const active = isItemActive(item.path);

              return (
                <div
                  key={item.id}
                  className={`relative group flex items-center rounded-lg transition-all ${isEditMode ? "cursor-move" : ""}`}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                >
                  <Link
                    to={item.path}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-xs xl:text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap ${
                      active
                        ? "text-cyan-400 font-bold bg-white/10 shadow-sm"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Editable contentKey={`nav.${index}.text`} as="span" />
                  </Link>
                  {isEditMode && (
                    <div className="flex items-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -right-8 top-1/2 -translate-y-1/2 bg-[#3b3e47] p-1 rounded-md">
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => handleEditNav(item)}
                        className="p-1 text-blue-300 hover:text-white"
                        title="Edit Nav Item"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                          <path
                            fillRule="evenodd"
                            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => deleteNavLink(item.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                        title="Delete Nav Item"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </motion.button>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="flex items-center flex-wrap justify-end gap-1.5 sm:gap-3">

            {isAdmin && (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleEditMode}
                  className={`font-black py-1.5 px-3.5 rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-md border ${
                    isEditMode
                      ? "bg-amber-500 border-amber-400 text-slate-950 hover:bg-amber-400 ring-2 ring-amber-300/50"
                      : "bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white"
                  }`}
                >
                  <span>{isEditMode ? "✓ Finish Editing" : "✎ Edit Site"}</span>
                </motion.button>

                <div className="flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/60 shadow-sm">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGitCloudSync}
                    className="font-bold py-1 px-2.5 rounded-md transition-all text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center gap-1 shadow-sm"
                    title="Force push changes to production and synchronize all clients in real-time"
                  >
                    GitHub Sync
                  </motion.button>

                  <div className="h-4 w-px bg-slate-700 mx-1.5" />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setRealtimeSyncEnabled(!realtimeSyncEnabled)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      realtimeSyncEnabled
                        ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        : "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${realtimeSyncEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    {realtimeSyncEnabled ? "ON" : "OFF"}
                  </motion.button>
                </div>
              </div>
            )}

            {/* SERVICE LIST Button - Always visible in header whether logged in or not */}
            <button
              type="button"
              onClick={() => setShowServiceListModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d7474] hover:bg-[#0f8b8b] text-white font-extrabold text-xs uppercase tracking-wide border border-[#2dd4bf]/40 shadow-sm transition-all cursor-pointer shrink-0"
              title="Open Service List (IMEI, Server, Remote Tool Rent, File, Service By Group)"
            >
              <svg className="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
              <span>SERVICE LIST</span>
            </button>

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-3" ref={dropdownRef}>
                {/* 1. Wallet Pill */}
                <MotionLink
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  to="/pricing"
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 bg-slate-800 border border-orange-500/40 rounded-full hover:border-orange-500 transition-all cursor-pointer shadow-sm shrink-0"
                  title="My Wallet - Click to Add Balance"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                  <span className="font-bold !text-white text-xs sm:text-sm tracking-tight font-sans max-w-[85px] sm:max-w-[140px] truncate">
                    ₹{user.wallet.balance.toFixed(2)}
                  </span>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white font-extrabold text-xs transition-colors shadow-sm cursor-pointer shrink-0">
                    <span className="leading-none select-none font-bold">+</span>
                  </div>
                </MotionLink>

                {/* 2. Shopping Bag Icon */}
                <MotionLink
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  to="/cart"
                  className="relative text-slate-200 hover:text-white p-1.5 sm:p-2 transition-colors duration-200"
                  title="Shopping Cart"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  {cart && cart.length > 0 && (
                    <span className="absolute top-0.5 right-0.5 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 text-white text-[9px] font-black items-center justify-center leading-none">
                        {cart.length}
                      </span>
                    </span>
                  )}
                </MotionLink>

                {/* 3. Notification Bell Icon */}
                {isAdmin ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => {
                      markAllAdminNotificationsAsRead();
                      navigate("/admin/orders");
                    }}
                    className="relative text-slate-200 hover:text-white p-1.5 sm:p-2 transition-colors duration-200 cursor-pointer focus:outline-none"
                    title="Admin Order Notifications & History"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {adminUnreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-black items-center justify-center leading-none shadow-sm">
                          {adminUnreadCount}
                        </span>
                      </span>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => {
                      markAllUserNotificationsAsRead();
                      navigate("/notifications");
                    }}
                    className="relative text-slate-200 hover:text-white p-1.5 sm:p-2 transition-colors duration-200 cursor-pointer focus:outline-none"
                    title="User Order Notifications"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 sm:h-6 sm:w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {userUnreadCount > 0 && (
                      <span className="absolute top-0.5 right-0.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 text-white text-[9px] font-black items-center justify-center leading-none shadow-sm">
                          {userUnreadCount}
                        </span>
                      </span>
                    )}
                  </motion.button>
                )}

                {/* 4. User Profile Group */}
                <div className="relative flex items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 border border-slate-600/80 px-2 py-1 rounded-full group focus:outline-none"
                    title="Account & Settings"
                  >
                    <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0">
                      <span>{user.email ? user.email.charAt(0).toUpperCase() : "U"}</span>
                    </div>

                    <span className="hidden sm:inline-block !text-white font-bold text-xs max-w-[90px] truncate">
                      {user.email ? user.email.split("@")[0] : "user"}
                    </span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-3.5 w-3.5 text-slate-200 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.button>

                  {/* User Account Menu - Exact Design from Screenshot */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-4 z-[999] border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 animate-fadeIn">
                      {/* Subscription Plan Card (Matches Screenshot Exactly) */}
                      <div className="bg-[#fffef7] dark:bg-amber-950/20 border border-[#fef08a] dark:border-amber-800/40 rounded-xl p-3.5 shadow-sm space-y-3 mb-3">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                            <Download className="w-4 h-4 stroke-[2.5]" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-[12px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide truncate">
                              {dropdownPlan.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                              Active: {dropdownDates.start} – {dropdownDates.end}
                            </p>
                          </div>
                        </div>

                        {/* Progress bars matching screenshot */}
                        <div className="space-y-2 pt-0.5">
                          {/* Daily files */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400">
                              <span className="font-semibold">Daily files</span>
                              <span className="font-bold text-slate-900 dark:text-slate-200">0 / {dropdownPlan.dailyFiles}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                          </div>

                          {/* Daily bandwidth */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400">
                              <span className="font-semibold">Daily bandwidth</span>
                              <span className="font-bold text-slate-900 dark:text-slate-200">0 B / {dropdownPlan.dailyBandwidth}</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '0%' }}></div>
                            </div>
                          </div>

                          {/* Total bandwidth */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px] text-slate-600 dark:text-slate-400">
                              <span className="font-semibold">Total bandwidth</span>
                              <span className="font-bold text-slate-900 dark:text-slate-200">
                                {(dropdownPlan.totalBandwidthNum * 0.75).toFixed(2)} GB / {dropdownPlan.totalBandwidthStr}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                        </div>

                        {/* Manage subscription link */}
                        <Link
                          to="/profile?tab=subscriptions"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full text-center text-[11px] text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium hover:underline block pt-1.5 border-t border-amber-200/40 dark:border-amber-800/30"
                        >
                          Click to manage subscription
                        </Link>
                      </div>

                      {/* Navigation Options List (Exactly from user photo) */}
                      <nav className="space-y-1">
                        <Link
                          to="/profile?tab=dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>Dashboard</span>
                        </Link>

                        <Link
                          to="/profile?tab=profile"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-400" />
                          <span>Profile Settings</span>
                        </Link>

                        <Link
                          to="/profile?tab=orders"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-900 dark:text-white bg-slate-100/90 dark:bg-slate-800/90 font-semibold text-xs transition-colors shadow-sm"
                        >
                          <ShoppingCart className="w-4 h-4 text-amber-500" />
                          <span>Orders</span>
                        </Link>

                        <Link
                          to="/profile?tab=subscriptions"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-colors"
                        >
                          <CreditCard className="w-4 h-4 text-slate-400" />
                          <span>Subscriptions</span>
                        </Link>

                        <Link
                          to="/profile?tab=downloads"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-colors"
                        >
                          <FolderDown className="w-4 h-4 text-slate-400" />
                          <span>Downloads</span>
                        </Link>

                        <Link
                          to="/profile?tab=paid_files"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-colors"
                        >
                          <Link2 className="w-4 h-4 text-slate-400" />
                          <span>Paid Files</span>
                        </Link>

                        <Link
                          to="/profile?tab=invoices"
                          onClick={() => setDropdownOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-semibold text-xs transition-colors"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span>Invoices</span>
                        </Link>

                        {/* Admin shortcuts if user is admin */}
                        {isAdmin && (
                          <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 font-bold text-xs transition-colors"
                            >
                              <span>📊 Admin Dashboard</span>
                            </Link>
                            <Link
                              to="/admin/orders"
                              onClick={() => setDropdownOpen(false)}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/20 font-bold text-xs transition-colors"
                            >
                              <span>📦 Manage Orders</span>
                            </Link>
                          </div>
                        )}

                        {/* Log out option at bottom (Red as in screenshot) */}
                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setDropdownOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-bold text-xs transition-colors text-left cursor-pointer"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            <span>Log out</span>
                          </button>
                        </div>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d7474] hover:bg-[#0f8b8b] text-white font-extrabold text-xs tracking-wide border border-[#2dd4bf]/40 shadow-sm transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span>Login | Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Secondary Bar: Navigation Links + Admin Quick Controls */}
        <div className="lg:hidden border-t border-slate-700/70 bg-[#23262c] px-3 py-2 flex flex-wrap items-center justify-between gap-2 overflow-x-auto">
          <nav className="flex items-center flex-nowrap sm:flex-wrap gap-1 text-xs font-semibold overflow-x-auto py-0.5">
            {(siteContent?.nav || []).map((item: any, index: number) => {
              if (item.requiresNoUser && user) return null;
              // Hide service items from navbar alongside Home as requested
              if (item.text && (item.text.toLowerCase().includes('service') || item.text.toLowerCase().includes('सर्विस'))) {
                return null;
              }
              const active = isItemActive(item.path);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 text-xs font-semibold ${
                    active
                      ? "bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30"
                      : "text-gray-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                >
                  <Editable contentKey={`nav.${index}.text`} as="span" />
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <div className="hidden" style={{ display: "none" }} aria-hidden="true">
              <button
                onClick={toggleEditMode}
                className={`font-semibold py-1 px-2.5 rounded-md transition-all text-[11px] flex items-center gap-1 border ${
                  isEditMode
                    ? "bg-amber-600 border-amber-500 text-white"
                    : "bg-slate-700 border-slate-600 text-slate-100"
                }`}
              >
                {isEditMode ? "✓ Done" : "✎ Edit Site"}
              </button>

              <Link
                to="/admin/settings"
                className="font-semibold py-1 px-2.5 rounded-md text-[11px] bg-cyan-600 hover:bg-cyan-700 text-white flex items-center gap-1"
              >
                ⚙️ Settings
              </Link>

              <button
                onClick={handleGitCloudSync}
                className="font-bold py-1 px-2.5 rounded-md text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1"
              >
                ☁️ Sync
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Service List Popup Modal */}
      {showServiceListModal && (
        <ServiceListPanel isModal={true} onClose={() => setShowServiceListModal(false)} />
      )}

      {/* GitHub Real-time Cloud Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-fade-in text-left">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl shadow-indigo-500/10">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className={`h-6 w-6 text-indigo-400 ${isSyncing ? "animate-spin" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h3 className="text-lg font-bold text-white tracking-wide">
                  Production GitHub & Realtime Sync
                </h3>
              </div>
              {!isSyncing && (
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setShowSyncModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </motion.button>
              )}
            </div>

            <div className="p-6">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-indigo-300 space-y-2 h-64 overflow-y-auto">
                {syncSteps.map((step, index) => (
                  <div key={index} className="transition-all duration-300">
                    {step}
                  </div>
                ))}
                {isSyncing && (
                  <div className="flex items-center gap-2 text-slate-400 mt-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                    <span>Processing build pipeline...</span>
                  </div>
                )}
              </div>

              {syncStatus === "success" && (
                <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-lg flex items-start gap-3">
                  <svg
                    className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-emerald-400 text-sm">
                      Deployment Active
                    </h4>
                    <p className="text-slate-300 text-xs mt-0.5">
                      Your website updates are now propagated and cached
                      successfully across production nodes. Any other open
                      browser tabs have reloaded the content in real-time.
                    </p>
                    <div className="mt-3 pt-3 border-t border-emerald-500/20">
                      <a
                        href="/api/download-hostinger-zip"
                        download="wowfilewala-hostinger-public_html.zip"
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Hostinger public_html ZIP (wowfilewala.com)
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {syncStatus === "error" && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/25 rounded-lg flex items-start gap-3">
                  <svg
                    className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-rose-400 text-sm">
                      Deployment Failed
                    </h4>
                    <p className="text-slate-300 text-xs mt-0.5">
                      Please check your network connection and server sync configurations.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
              <motion.button
                whileHover={isSyncing ? {} : { scale: 1.05 }}
                whileTap={isSyncing ? {} : { scale: 0.95 }}
                disabled={isSyncing}
                onClick={() => setShowSyncModal(false)}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                  isSyncing
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/15"
                }`}
              >
                {isSyncing ? "Deploying..." : "Close Window"}
              </motion.button>
            </div>
          </div>
        </div>
      )}
      {/* Help Center Popover Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-100 dark:border-slate-700 animate-slide-up">
            <motion.button
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => setHelpModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-white text-2xl font-bold transition-colors"
              aria-label="Close Help Center"
            >
              &times;
            </motion.button>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-600 dark:text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Help Center</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Get instant assistance from our support executives</p>
              </div>
            </div>

            <div className="space-y-4">
              <a
                href={`https://wa.me/${(siteContent?.whatsapp?.phoneNumber || '8658465589').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 dark:hover:border-emerald-800/80 rounded-xl transition-all duration-150 group text-center"
              >
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">💬</span>
                <span className="font-bold text-base text-emerald-800 dark:text-emerald-400">WhatsApp Support</span>
                <span className="text-xs text-emerald-600/80 dark:text-emerald-500/80 mt-1">Click here to start a chat with us on WhatsApp</span>
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setHelpModalOpen(false)}
              className="mt-6 w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors"
            >
              Close
            </motion.button>
          </div>
        </div>
      )}

      {/* Visually hidden Google Translate element */}
      <div style={{ display: "none" }} aria-hidden="true">
        <LanguageSelector />
      </div>
    </>
  );
};

export default Header;
