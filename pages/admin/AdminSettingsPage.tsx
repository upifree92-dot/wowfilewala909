import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Settings, CreditCard, Plus, Trash2, Edit2, Save, Globe, Smartphone, HelpCircle } from 'lucide-react';

const AdminSettingsPage = () => {
    const { 
        siteContent, 
        updateSiteContent, 
        balancePackages, 
        updateBalancePackage, 
        addBalancePackage, 
        deleteBalancePackage,
        theme,
        toggleTheme
    } = useAppContext();

    const [activeTab, setActiveTab] = useState<'payments' | 'packages' | 'identity'>('payments');

    // Payments Tab States
    const [upiId, setUpiId] = useState(siteContent?.pricing?.upiId || '');
    const [whatsappNumber, setWhatsappNumber] = useState(siteContent?.pricing?.adminWhatsappNumber || '');
    const [whatsappBtnText, setWhatsappBtnText] = useState(siteContent?.pricing?.adminWhatsappButtonText || '');
    const [payInstructions, setPayInstructions] = useState(siteContent?.pricing?.paymentInstructions || '');
    const [pricingTitle, setPricingTitle] = useState(siteContent?.pricing?.mainTitle || '');
    const [pricingSubtitle, setPricingSubtitle] = useState(siteContent?.pricing?.subtitle || '');

    // Identity Tab States
    const [siteTitle, setSiteTitle] = useState(siteContent?.header.title || '');
    const [footerAbout, setFooterAbout] = useState(siteContent?.footer?.about?.text || '');
    const [footerCopyright, setFooterCopyright] = useState(siteContent?.footer?.copyright || '');
    const [emailOtpEnabled, setEmailOtpEnabled] = useState(siteContent?.auth?.emailOtpEnabled ?? true);
    const [hwidLockEnabled, setHwidLockEnabled] = useState(siteContent?.auth?.hwidLockEnabled ?? true);

    // Package Modal/Form States
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<{ id?: string; amount: string; price: string } | null>(null);

    const handleSavePayments = (e: React.FormEvent) => {
        e.preventDefault();
        updateSiteContent('pricing.upiId', upiId);
        updateSiteContent('pricing.adminWhatsappNumber', whatsappNumber);
        updateSiteContent('whatsapp.phoneNumber', whatsappNumber);
        updateSiteContent('pricing.adminWhatsappButtonText', whatsappBtnText);
        updateSiteContent('pricing.paymentInstructions', payInstructions);
        updateSiteContent('pricing.mainTitle', pricingTitle);
        updateSiteContent('pricing.subtitle', pricingSubtitle);
    };

    const handleSaveIdentity = (e: React.FormEvent) => {
        e.preventDefault();
        updateSiteContent('header.title', siteTitle);
        updateSiteContent('footer.about.text', footerAbout);
        updateSiteContent('footer.copyright', footerCopyright);
        updateSiteContent('auth.emailOtpEnabled', emailOtpEnabled);
        updateSiteContent('auth.hwidLockEnabled', hwidLockEnabled);
    };

    const handleOpenAddPackage = () => {
        setEditingPackage({ amount: '', price: '' });
        setIsPackageModalOpen(true);
    };

    const handleOpenEditPackage = (pkg: { id: string; amount: number; price: number }) => {
        setEditingPackage({ id: pkg.id, amount: pkg.amount.toString(), price: pkg.price.toString() });
        setIsPackageModalOpen(true);
    };

    const handleSavePackage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPackage) return;

        const amountNum = parseFloat(editingPackage.amount);
        const priceNum = parseFloat(editingPackage.price);

        if (isNaN(amountNum) || isNaN(priceNum)) {
            alert('Please enter valid numbers for amount and price');
            return;
        }

        if (editingPackage.id) {
            // Edit existing
            updateBalancePackage({
                id: editingPackage.id,
                amount: amountNum,
                price: priceNum
            });
        } else {
            // Add new
            addBalancePackage(amountNum, priceNum);
        }
        setIsPackageModalOpen(false);
        setEditingPackage(null);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 backdrop-blur-md p-6 rounded-2xl shadow-xl">
                <div>
                    <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        <Settings className="text-amber-500 h-5.5 w-5.5" />
                        Website Configuration & Settings
                    </h2>
                    <p className="text-slate-400 mt-1 text-xs">Manage global website options, payment settings, and recharge packages</p>
                </div>
                <button
                    onClick={toggleTheme}
                    className="self-start md:self-auto bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 font-bold px-4 py-2 rounded-xl transition-all text-xs"
                >
                    Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
                </button>
            </div>

            {/* Custom Admin Navigation Tabs */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-slate-800 bg-slate-900/95 px-2 sm:px-4 rounded-xl shadow-md">
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`py-3.5 px-4 sm:px-6 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 transition-all ${activeTab === 'payments' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-transparent text-slate-300 hover:text-white'}`}
                >
                    <CreditCard className="h-4 w-4 shrink-0" />
                    UPI & Payments
                </button>
                <button
                    onClick={() => setActiveTab('packages')}
                    className={`py-3.5 px-4 sm:px-6 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 transition-all ${activeTab === 'packages' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-transparent text-slate-300 hover:text-white'}`}
                >
                    <Plus className="h-4 w-4 shrink-0" />
                    Recharge Packages
                </button>
                <button
                    onClick={() => setActiveTab('identity')}
                    className={`py-3.5 px-4 sm:px-6 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 transition-all ${activeTab === 'identity' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-transparent text-slate-300 hover:text-white'}`}
                >
                    <Globe className="h-4 w-4 shrink-0" />
                    Site Identity & Info
                </button>
            </div>

            {/* Content Area */}
            <div className="bg-slate-900/95 border border-slate-800 backdrop-blur-md p-4 sm:p-6 rounded-2xl shadow-xl text-slate-100">
                
                {/* PAYMENTS CONFIGURATION TAB */}
                {activeTab === 'payments' && (
                    <form onSubmit={handleSavePayments} className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-100 pb-3 border-b border-slate-800">
                            UPI Payment Gateway Configuration
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-2">
                                    UPI ID (For Payments)
                                </label>
                                <input
                                    type="text"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="your-upi-id@bank"
                                />
                                <p className="text-xs text-slate-400 mt-1">This UPI address receives all wallet deposits via QR code.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-2">
                                    Admin WhatsApp Support Number
                                </label>
                                <input
                                    type="text"
                                    value={whatsappNumber}
                                    onChange={(e) => setWhatsappNumber(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="8658465589"
                                />
                                <p className="text-xs text-slate-400 mt-1">Mobile number without spaces/symbols for WhatsApp redirection.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-2">
                                    WhatsApp Support Button Text
                                </label>
                                <input
                                    type="text"
                                    value={whatsappBtnText}
                                    onChange={(e) => setWhatsappBtnText(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                    placeholder="Contact Admin to Confirm Payment"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-2">
                                    Add Funds Page Header Title
                                </label>
                                <input
                                    type="text"
                                    value={pricingTitle}
                                    onChange={(e) => setPricingTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-200 mb-2">
                                Add Funds Subtitle / Instruction Text
                            </label>
                            <input
                                type="text"
                                value={pricingSubtitle}
                                onChange={(e) => setPricingSubtitle(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-200 mb-2">
                                Payment Popup Instructions
                            </label>
                            <textarea
                                value={payInstructions}
                                onChange={(e) => setPayInstructions(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-sans"
                                placeholder="Scan the QR to pay..."
                            />
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="w-full sm:w-auto justify-center bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
                            >
                                <Save className="h-4 w-4" />
                                Save Payment Settings
                            </button>
                        </div>
                    </form>
                )}

                {/* RECHARGE PACKAGES MANAGEMENT TAB */}
                {activeTab === 'packages' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                            <h3 className="text-lg font-bold text-slate-100">
                                Balance Recharge Packages List
                            </h3>
                            <button
                                type="button"
                                onClick={handleOpenAddPackage}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all text-sm"
                            >
                                <Plus className="h-4 w-4" />
                                Add New Package
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {balancePackages.map((pkg, idx) => (
                                <div key={pkg.id} className="relative bg-slate-950 p-5 sm:p-6 rounded-2xl border border-slate-800 flex flex-col shadow-sm group">
                                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenEditPackage(pkg)}
                                            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
                                            title="Edit package"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this package?')) {
                                                    deleteBalancePackage(pkg.id);
                                                }
                                            }}
                                            className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white shadow-sm"
                                            title="Delete package"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>

                                    <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded bg-slate-800 text-amber-400 self-start mb-3">
                                        PACKAGE #{idx + 1}
                                    </span>

                                    <p className="text-2xl font-black text-indigo-400">
                                        ₹{pkg.amount.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-slate-400 mb-2">Wallet Credit Balance</p>
                                    
                                    <div className="border-t border-dashed border-slate-800 my-3"></div>

                                    <p className="text-xl font-bold text-slate-200">
                                        Pay ₹{pkg.price}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">Actual payable cost</p>
                                </div>
                            ))}
                        </div>

                        {/* Package Modal */}
                        {isPackageModalOpen && editingPackage && (
                            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                                <div className="bg-slate-900 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-slate-800">
                                    <h4 className="text-lg font-bold text-slate-100 mb-4 pb-2 border-b border-slate-800">
                                        {editingPackage.id ? 'Edit Recharge Package' : 'Create Recharge Package'}
                                    </h4>

                                    <form onSubmit={handleSavePackage} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1.5">
                                                Credit Wallet Balance (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={editingPackage.amount}
                                                onChange={(e) => setEditingPackage({ ...editingPackage, amount: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="e.g. 500"
                                                required
                                            />
                                            <p className="text-xs text-slate-400 mt-1">This is the amount of credit added to user's wallet.</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-200 mb-1.5">
                                                Cost Price to Pay (₹)
                                            </label>
                                            <input
                                                type="number"
                                                value={editingPackage.price}
                                                onChange={(e) => setEditingPackage({ ...editingPackage, price: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                placeholder="e.g. 450"
                                                required
                                            />
                                            <p className="text-xs text-slate-400 mt-1">This is the real cash the user pays during UPI transaction.</p>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-3">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsPackageModalOpen(false);
                                                    setEditingPackage(null);
                                                }}
                                                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm"
                                            >
                                                Save Package
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SITE IDENTITY & LEGAL INFORMATION */}
                {activeTab === 'identity' && (
                    <form onSubmit={handleSaveIdentity} className="space-y-6">
                        <h3 className="text-lg font-bold text-slate-100 pb-3 border-b border-slate-800">
                            Website Branding & Text Information
                        </h3>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-2">
                                    Website Title / Brand Name
                                </label>
                                <input
                                    type="text"
                                    value={siteTitle}
                                    onChange={(e) => setSiteTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="wowfilewala"
                                />
                                <p className="text-xs text-slate-400 mt-1">Changes the logo brand header across the header and homepage.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-2">
                                    Footer Copyright Text
                                </label>
                                <input
                                    type="text"
                                    value={footerCopyright}
                                    onChange={(e) => setFooterCopyright(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="© 2025 wowfilewala. All Rights Reserved."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-200 mb-2">
                                    About Us Text (Footer)
                                </label>
                                <textarea
                                    value={footerAbout}
                                    onChange={(e) => setFooterAbout(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
                                    placeholder="We are your one-stop solution for..."
                                 />
                            </div>

                            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mt-2">
                                <h4 className="font-bold text-slate-100 mb-1 flex items-center gap-2">
                                    <Smartphone className="h-4 w-4 text-emerald-500" />
                                    Security & Authentication
                                </h4>
                                <p className="text-xs text-slate-400 mb-4">Manage security, login, and registration procedures</p>
                                
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-200">
                                            Enable Email OTP Verification during Register
                                        </label>
                                        <p className="text-xs text-slate-400 mt-0.5">When registering, users must verify a 6-digit OTP code sent to their email address before their account is activated.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                                        <input 
                                            type="checkbox" 
                                            checked={emailOtpEnabled} 
                                            onChange={(e) => setEmailOtpEnabled(e.target.checked)}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>

                                <div className="border-t border-slate-800 my-4"></div>

                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-200">
                                            Enforce Single Device Lock (Hardware ID/HWID Lock)
                                        </label>
                                        <p className="text-xs text-slate-400 mt-0.5">Restricts users to a single active device (laptop, computer, mobile, iPhone) at a time. Prevents account sharing.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                                        <input 
                                            type="checkbox" 
                                            checked={hwidLockEnabled} 
                                            onChange={(e) => setHwidLockEnabled(e.target.checked)}
                                            className="sr-only peer" 
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="w-full sm:w-auto justify-center bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all"
                            >
                                <Save className="h-4 w-4" />
                                Save Identity Settings
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default AdminSettingsPage;
