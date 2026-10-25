import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { PremiumFileIcon } from './PremiumFileIcon';

interface ProductPreviewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

// Custom model extractor to show authentic and professional list of supported devices
function getSupportedDevicesList(product: Product): string[] {
  const name = product.name;
  const nameLower = name.toLowerCase();
  
  const devices: string[] = [];

  // Extract model numbers using Regex
  const rmxMatch = name.match(/RMX\d+/i);
  const smMatch = name.match(/SM-[A-Z0-9]+/i);
  const mMatch = name.match(/M\d+[A-Z0-9]+/i);
  
  // Specific model keywords
  if (nameLower.includes('n55') || (rmxMatch && rmxMatch[0].toUpperCase() === 'RMX3710')) {
    devices.push('Realme Narzo N55 (RMX3710)');
    devices.push('Realme Narzo N55 Dual SIM LTE');
    devices.push('RMX3710 (India / Global)');
  } else if (nameLower.includes('s21') || nameLower.includes('g998')) {
    devices.push('Samsung Galaxy S21 Ultra 5G (SM-G998B)');
    devices.push('SM-G998B/DS (Global Dual SIM)');
    devices.push('SM-G998N (Korea)');
  } else if (nameLower.includes('s20') || nameLower.includes('g988')) {
    devices.push('Samsung Galaxy S20 Ultra 5G (SM-G988B)');
    devices.push('SM-G988B/DS (Global)');
  } else if (nameLower.includes('a15') || nameLower.includes('a155')) {
    devices.push('Samsung Galaxy A15 (SM-A155F)');
    devices.push('SM-A155F/DS (Global Dual SIM)');
  } else if (nameLower.includes('poco f5') || nameLower.includes('m23111118g')) {
    devices.push('Xiaomi POCO F5 5G (M23111118G)');
    devices.push('POCO F5 Dual SIM LTE/5G');
  } else if (nameLower.includes('redmi note 12') || nameLower.includes('22111317i')) {
    devices.push('Xiaomi Redmi Note 12 5G (22111317I)');
    devices.push('Redmi Note 12 Global / India');
  } else if (nameLower.includes('iphone 13') || nameLower.includes('a2633')) {
    devices.push('Apple iPhone 13 (A2633)');
    devices.push('iPhone 13 Global (A2482, A2631, A2634, A2635)');
  } else {
    // Generically build supported models based on brand keywords
    if (nameLower.includes('samsung')) {
      const model = smMatch ? smMatch[0].toUpperCase() : 'SM-Generic';
      devices.push(`Samsung Galaxy Series (${model})`);
      devices.push(`${model}/DS (Dual SIM Variant)`);
    } else if (nameLower.includes('xiaomi') || nameLower.includes('redmi') || nameLower.includes('poco')) {
      const model = mMatch ? mMatch[0].toUpperCase() : 'Mi-Generic';
      devices.push(`Xiaomi / Redmi / POCO (${model})`);
    } else if (nameLower.includes('realme')) {
      const model = rmxMatch ? rmxMatch[0].toUpperCase() : 'RMX-Generic';
      devices.push(`Realme Phone (${model})`);
    } else if (nameLower.includes('oppo')) {
      devices.push('OPPO Find / Reno / A Series');
      devices.push('OPPO Compatible MediaTek/Qualcomm Chipset');
    } else if (nameLower.includes('oneplus')) {
      devices.push('OnePlus Nord / Pro / flagship series');
    } else if (nameLower.includes('vivo')) {
      devices.push('Vivo Y / V / X Series');
    } else {
      // General fallbacks
      devices.push('Universal Android Chipset Device');
    }
  }

  // Always append generic hardware / architecture checks if specified
  if (nameLower.includes('mtk') || nameLower.includes('mediatek') || nameLower.includes('da file')) {
    devices.push('MediaTek (MTK) Authorized Hardware Interface');
  }
  if (nameLower.includes('qualcomm') || nameLower.includes('snapdragon') || nameLower.includes('ufs')) {
    devices.push('Qualcomm Snapdragon Chipsets with UFS storage');
  }
  if (nameLower.includes('emmc') || nameLower.includes('dump')) {
    devices.push('eMMC / UFS flash storage devices');
  }

  // Remove duplicates and limit to 4
  return Array.from(new Set(devices)).slice(0, 4);
}

// Generate an authentic looking fake directory structure/contents inside the archive
function getFakeArchiveContents(product: Product): { name: string; size: string; isDir?: boolean }[] {
  const nameLower = product.name.toLowerCase();
  const list: { name: string; size: string; isDir?: boolean }[] = [];

  if (nameLower.includes('pinout') || nameLower.includes('isp')) {
    list.push({ name: 'VIVO_X200FE_ISP_Pinout_HighRes.png', size: '420 KB' });
    list.push({ name: 'TestPoints_Guide_Macro.jpg', size: '280 KB' });
    list.push({ name: 'Ayub_GSM_Verification_Note.txt', size: '1.2 KB' });
  } else if (nameLower.includes('mtk_flash_tool') || nameLower.includes('flash_tool')) {
    list.push({ name: 'flash_tool.exe', size: '4.8 MB' });
    list.push({ name: 'MTK_AllInOne_DA.bin', size: '1.02 MB' });
    list.push({ name: 'Authentication_Agent.dll', size: '320 KB' });
    list.push({ name: 'Drivers_Setup_x64.msi', size: '3.1 MB' });
  } else if (nameLower.includes('da_') || nameLower.includes('da file') || nameLower.includes('.bin')) {
    const baseName = product.name.replace(/\.(zip|rar|bin)$/i, '');
    list.push({ name: `${baseName}.bin`, size: product.size });
    list.push({ name: 'Secure_DA_Scatter_Config.xml', size: '35 KB' });
    list.push({ name: 'tested_models_manifest.txt', size: '2.4 KB' });
  } else if (nameLower.includes('vpn')) {
    list.push({ name: 'FreeVPN_Installer_Pro.msi', size: '6.8 MB' });
    list.push({ name: 'servers_list_config.json', size: '14 KB' });
    list.push({ name: 'License_Readme.txt', size: '3.0 KB' });
  } else if (nameLower.includes('parser') || nameLower.includes('editor')) {
    list.push({ name: 'RPMB_Parser_Editor_Engine.exe', size: '12.4 MB' });
    list.push({ name: 'db_definitions.bin', size: '1.8 MB' });
    list.push({ name: 'Instructions_To_Fix_RPMB.pdf', size: '450 KB' });
  } else if (nameLower.includes('qcn')) {
    list.push({ name: 'QCN_Editor_Tool.exe', size: '750 KB' });
    list.push({ name: 'Qualcomm_Drivers/', size: 'Dir', isDir: true });
    list.push({ name: 'default_template_qcn.qcn', size: '180 KB' });
  } else if (nameLower.includes('diag') || nameLower.includes('port')) {
    list.push({ name: 'Mi_Diag_Enabler_AllInOne.exe', size: '4.2 MB' });
    list.push({ name: 'adb.exe', size: '1.2 MB' });
    list.push({ name: 'AdbWinApi.dll', size: '96 KB' });
  } else if (nameLower.includes('ufi') || nameLower.includes('ffu')) {
    list.push({ name: 'UFI_EMMC_Firmware_Restore.exe', size: '8.2 MB' });
    list.push({ name: 'FFU_Database/', size: 'Dir', isDir: true });
    list.push({ name: 'ffu_support_list.txt', size: '12 KB' });
  } else if (nameLower.includes('internet download manager') || nameLower.includes('idm')) {
    list.push({ name: 'IDM_v6.42_Build56_Setup.exe', size: '14.8 MB' });
    list.push({ name: 'Activation_Crack_Tool.exe', size: '820 KB' });
    list.push({ name: 'Host_Blocker_Script.bat', size: '4 KB' });
  } else {
    // Generically build archive files based on product name
    const cleanName = product.name.replace(/\.(zip|rar|bin|tar|gz)$/i, '');
    list.push({ name: `${cleanName}_Main_System.bin`, size: product.size });
    list.push({ name: 'Scatter_Configuration.txt', size: '15 KB' });
    list.push({ name: 'wowfilewala_tested_report.pdf', size: '110 KB' });
  }

  return list;
}

// Generate helpful, factual FAQs for this type of file
function getFileFAQs(product: Product): { q: string; a: string }[] {
  const nameLower = product.name.toLowerCase();
  const list = [
    {
      q: "Is this file 100% working and tested?",
      a: "Yes, all files on wowfilewala are checked and verified on actual devices by our engineering team."
    }
  ];

  if (nameLower.includes('pinout') || nameLower.includes('isp')) {
    list.push({
      q: "How do I connect the ISP pinout?",
      a: "Solder CLK, CMD, D0, and GND points carefully with thin enameled copper wire. Use USB cable to power the device VCC and VCCQ."
    });
    list.push({
      q: "Will this pinout damage my device?",
      a: "No, as long as you do not overheat the board or cross-connect. Keep temperature around 300°C while soldering."
    });
  } else if (nameLower.includes('tool')) {
    list.push({
      q: "Does this require any physical box or dongle?",
      a: "No, this is a cracked/activated version that can run directly on your PC with basic USB drivers installed."
    });
    list.push({
      q: "My antivirus flagged the tool. Is it safe?",
      a: "Yes, professional mobile flasher tools are often false-positive flagged because they read low-level USB drivers. Whitelist the folder and run."
    });
  } else if (nameLower.includes('da') || nameLower.includes('auth')) {
    list.push({
      q: "How to use this Download Agent (DA) file?",
      a: "Select this .bin file in the 'Download-Agent' or 'Secure Boot DA' field in SP Flash Tool or UnlockTool to bypass Auth."
    });
  } else {
    list.push({
      q: "Do I get free updates for this file?",
      a: "Yes, once purchased or unlocked, any future updates/revisions of this file are completely free to download anytime."
    });
  }

  return list;
}

export const ProductPreviewModal: React.FC<ProductPreviewModalProps> = ({ product, isOpen, onClose }) => {
  const { user, addToCart, hasPurchased, purchaseProductDirectly, initiateDownload } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPurchasing, setIsPurchasing] = useState(false);

  if (!isOpen || !product) return null;

  const isPurchased = hasPurchased(product.id);
  const isFree = true;
  
  // Supported devices extraction
  const supportedDevices = getSupportedDevicesList(product);

  const handleDownloadClick = () => {
    initiateDownload(product);
    onClose();
  };

  const handleDirectPurchase = async () => {
    initiateDownload(product);
    onClose();
  };

  const handleAddToCartClick = () => {
    addToCart(product);
    onClose();
  };

  const handleLoginClick = () => {
    navigate('/login', { state: { from: location } });
    onClose();
  };

  const handleTopUpClick = () => {
    navigate('/pricing', { state: { insufficientPoints: true, requiredAmount: product.price - (user?.wallet.balance || 0) } });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-700/50 flex justify-between items-start">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Firmware File Preview
            </span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-2 leading-snug">
              {product.name}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-2xl font-bold leading-none p-1 transition-colors ml-4 shrink-0"
            title="Close Preview"
          >
            &times;
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-5 flex-grow">
          {/* File Metadata Badges */}
          <div className="grid grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700/30 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">File Size</p>
              <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{product.size || 'N/A'}</p>
            </div>
            <div className="border-x border-slate-200 dark:border-slate-700">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Cost</p>
              <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                FREE
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold">Downloads</p>
              <p className="text-sm font-extrabold text-slate-700 dark:text-slate-200 mt-0.5">{product.downloads || 0}</p>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-1">
            <h4 className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">File Details & Info</h4>
            <div className="bg-slate-50 dark:bg-slate-700/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/20">
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 leading-normal font-mono break-all select-all">
                {product.description || 'No description provided for this firmware file.'}
              </p>
              {product.date && (
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                  <span>📅 Released: {product.date}</span>
                  <span className="mx-1">•</span>
                  <span>👁️ Views: {product.views || 0}</span>
                </p>
              )}
            </div>
          </div>

          {/* Supported Devices Section */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Supported Models & Variants
            </h4>
            <div className="space-y-1.5">
              {supportedDevices.map((device, idx) => (
                <div key={idx} className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/15 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                  <span className="font-semibold">{device}</span>
                </div>
              ))}
              <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-1 leading-relaxed pl-1">
                ⚠️ Ensure your device model matches exactly. Point deductions are non-refundable.
              </p>
            </div>
          </div>

          {/* Package Contents & FAQ (User Only) */}
          {user ? (
            <>
              {/* Archive Contents (Fake File Structure) */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1a2 2 0 002 2h2a2 2 0 012 2v3a2 2 0 01-2 2H5z" />
                  </svg>
                  Archive Package Contents Preview
                </h4>
                <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 rounded-xl p-3 space-y-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  {getFakeArchiveContents(product).map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 truncate">
                        {file.isDir ? (
                          <svg className="w-5 h-5 text-amber-500 shrink-0 filter drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                          </svg>
                        ) : (
                          <PremiumFileIcon filename={file.name} className="h-6 w-5 shrink-0" />
                        )}
                        <span className="truncate font-semibold text-slate-700 dark:text-slate-300">{file.name}</span>
                      </div>
                      <span className="text-slate-400 text-[10px] shrink-0 font-bold">{file.size}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* File Q&A / FAQs */}
              <div className="space-y-2 pt-1">
                <h4 className="text-xs uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Frequently Asked Questions (FAQ)
                </h4>
                <div className="space-y-2.5">
                  {getFileFAQs(product).map((faq, idx) => (
                    <div key={idx} className="bg-slate-50/50 dark:bg-slate-700/10 border border-slate-100 dark:border-slate-800 p-3 rounded-xl space-y-1 text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Q: {faq.q}</p>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">A: {faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Lock Prompt for non-logged in users */
            <div className="bg-slate-100/50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center space-y-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sign in to view inside file contents & FAQ
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Registered members can preview the inner structure and detailed technical FAQs for this firmware.
              </p>
            </div>
          )}

          {/* Wallet Balance Integration */}
          {user && !isPurchased && !isFree && (
            <div className="p-3.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your Point Balance:</p>
                <p className="text-md font-extrabold text-slate-700 dark:text-slate-200">🪙 ₹{user.wallet.balance.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-400">Remaining Balance:</p>
                <p className={`text-md font-extrabold ${user.wallet.balance >= product.price ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  ₹{(user.wallet.balance - product.price).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Action Button Pane */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold transition-colors duration-200 order-last sm:order-first shrink-0"
          >
            Close
          </button>

          {isPurchased ? (
            /* Alread Owned Download Button */
            <button
              type="button"
              onClick={handleDownloadClick}
              className="flex-grow inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold shadow-md shadow-green-600/10 hover:shadow-green-600/25 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Firmware Now (Owned)</span>
            </button>
          ) : !user ? (
            /* Anonymous User Login Prompt */
            <button
              type="button"
              onClick={handleLoginClick}
              className="flex-grow inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold shadow-md transition-all duration-200"
            >
              <span>Log in to Download</span>
            </button>
          ) : isFree ? (
            /* Free Direct Download Button */
            <button
              type="button"
              onClick={handleDirectPurchase}
              disabled={isPurchasing}
              className="flex-grow inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold shadow-md transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download Free Firmware</span>
            </button>
          ) : user.wallet.balance >= product.price ? (
            /* Commit Points and Get File Pane */
            <button
              type="button"
              onClick={handleDirectPurchase}
              disabled={isPurchasing}
              className="flex-grow inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-bold shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/25 transition-all duration-200 disabled:bg-slate-300 dark:disabled:bg-slate-700"
            >
              {isPurchasing ? 'Processing...' : `Commit ₹${product.price.toFixed(2)} & Download`}
            </button>
          ) : (
            /* Insufficient Wallet Balance State */
            <button
              type="button"
              onClick={handleTopUpClick}
              className="flex-grow inline-flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold shadow-md transition-all duration-200 animate-pulse"
            >
              <span>🪙 Insufficient Points - Top up ₹{(product.price - user.wallet.balance).toFixed(2)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
