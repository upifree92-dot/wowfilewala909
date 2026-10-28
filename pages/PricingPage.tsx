import React, { useState, FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { BalancePackage } from '../types';
import { useAppContext } from '../context/AppContext';
import BackButton from '../components/BackButton';
import CopyButton from '../components/CopyButton';
import { useSEO } from '../hooks/useSEO';
import { Clock, Wifi, Download, Activity, HardDrive, Smartphone } from 'lucide-react';

// Modal for editing a balance package (Admin only)
const EditPackageModal = ({ isOpen, onClose, pkg }: { isOpen: boolean, onClose: () => void, pkg: BalancePackage }) => {
    const { updateBalancePackage } = useAppContext();
    const [name, setName] = useState(pkg.name || '');
    const [description, setDescription] = useState(pkg.description || '');
    const [price, setPrice] = useState(pkg.price);
    const [period, setPeriod] = useState(pkg.period || '');
    const [bandwidth, setBandwidth] = useState(pkg.bandwidth || '');
    const [downloads, setDownloads] = useState(pkg.downloads || '');
    const [dailyLimit, setDailyLimit] = useState(pkg.dailyLimit || '');
    const [dailyBandwidth, setDailyBandwidth] = useState(pkg.dailyBandwidth || '');
    const [devices, setDevices] = useState(pkg.devices || '');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        updateBalancePackage({ 
            ...pkg, 
            name,
            description,
            price, 
            period,
            bandwidth,
            downloads,
            dailyLimit,
            dailyBandwidth,
            devices
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg relative text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-2xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold text-center mb-6 text-orange-600 dark:text-amber-400">Edit Download Package</h2>
                <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Plan Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Description</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Price (INR)</label>
                            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Period (e.g. 1 Day / 12 Months)</label>
                            <input type="text" value={period} onChange={e => setPeriod(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Bandwidth</label>
                            <input type="text" value={bandwidth} onChange={e => setBandwidth(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Downloads</label>
                            <input type="text" value={downloads} onChange={e => setDownloads(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Daily Limit</label>
                            <input type="text" value={dailyLimit} onChange={e => setDailyLimit(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Daily Bandwidth</label>
                            <input type="text" value={dailyBandwidth} onChange={e => setDailyBandwidth(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Devices</label>
                        <input type="text" value={devices} onChange={e => setDevices(e.target.value)} required className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white" />
                    </div>
                    <button type="submit" className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all">Save Changes</button>
                </form>
            </div>
        </div>
    );
};


// Modal for UPI payment
const PaymentModal = ({ isOpen, onClose, pkg }: { isOpen: boolean, onClose: () => void, pkg: BalancePackage }) => {
    const { siteContent } = useAppContext();
    const upiId = siteContent?.pricing?.upiId || '7077536530-3@axl';
    const adminWhatsappNumber = siteContent?.pricing?.adminWhatsappNumber || '';

    if (!isOpen) return null;
    
    const cleanUpiId = upiId.trim();
    const upiUrl = `upi://pay?pa=${cleanUpiId}&pn=wowfilewala&am=${pkg.price}&cu=INR&tn=Subscribe_${encodeURIComponent(pkg.name)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;
    const titleText = `Subscribe to ${pkg.name}`;
    const cleanWhatsapp = (adminWhatsappNumber || siteContent?.whatsapp?.phoneNumber || '8658465589').replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(`Hi, I have made a payment of ₹${pkg.price} for the package "${pkg.name}". Please activate my subscription.`)}`;

    return (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md relative text-center text-slate-900 dark:text-slate-100" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-2xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold mb-2 text-orange-600 dark:text-amber-400">{titleText}</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">Scan QR Code using any UPI App (GPay, PhonePe, Paytm)</p>
                <div className="bg-slate-100 p-3 rounded-xl inline-block mb-4 shadow-inner border border-slate-200">
                    <img src={qrCodeUrl} alt="UPI QR Code" className="mx-auto rounded-lg w-48 h-48"/>
                </div>
                <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-300 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-300 mb-6 flex items-center justify-center">
                  <span><strong>Amount:</strong> ₹{pkg.price.toFixed(2)}</span>
                </div>
                 <a 
                    href={whatsappUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2.5 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
                >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                    Confirm via WhatsApp
                </a>
            </div>
        </div>
    );
};


const PricingPage = () => {
    useSEO('Download Packages', 'Choose the download package or subscription plan that suits your needs.');
    const { user, balancePackages, isAdmin, isEditMode } = useAppContext();
    const location = useLocation();
    const state = location.state as { insufficientPoints?: boolean; requiredAmount?: number } | null;
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<BalancePackage | null>(null);

    const handleBuyClick = (pkg: BalancePackage) => {
        if (!user) return;
        setSelectedPackage(pkg);
        setPaymentModalOpen(true);
    };
    
    const handleEditClick = (pkg: BalancePackage) => {
        setSelectedPackage(pkg);
        setEditModalOpen(true);
    };

    return (
        <div className="container mx-auto px-4 py-8 sm:py-16">
            <div className="max-w-6xl mx-auto">
                <BackButton />
                
                {state?.insufficientPoints && (
                    <div className="bg-amber-500/10 border-2 border-amber-500/30 text-amber-900 dark:text-amber-200 p-5 rounded-xl mb-8 flex items-start gap-4 shadow-md mt-6">
                        <div className="bg-amber-500/20 p-2.5 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-1 text-amber-800 dark:text-amber-300">Insufficient Wallet Balance</h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                You don't have enough points in your wallet to complete your download. 
                                {state.requiredAmount !== undefined && (
                                    <span> You need an additional <strong className="text-amber-700 dark:text-amber-400 font-extrabold text-base">₹{state.requiredAmount.toFixed(2)}</strong> to proceed.</span>
                                )}
                            </p>
                        </div>
                    </div>
                )}
                
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Downloads Packages</h1>
                    <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto">Choose a high-speed download plan designed for professional technicians and repair centers.</p>
                </div>
                
                {!user && (
                    <div className="text-center p-6 bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 rounded-xl mb-10 max-w-xl mx-auto">
                        <p className="font-semibold text-sm">You must be logged in to subscribe to a plan.</p>
                        <p className="mt-1 text-xs">Please <Link to="/login" className="font-bold underline text-amber-600 dark:text-amber-400">log in</Link> or <Link to="/login" className="font-bold underline text-amber-600 dark:text-amber-400">create an account</Link>.</p>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
                    {balancePackages.map((pkg) => {
                       const isBestSeller = pkg.isBestSeller;
                       return (
                        <div key={pkg.id} className={`relative bg-white dark:bg-slate-900 rounded-3xl shadow-xl flex flex-col overflow-hidden transition-all duration-300 group border ${isBestSeller ? 'border-emerald-500 shadow-emerald-500/10 scale-102' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
                            {/* Best Seller Ribbon Banner */}
                            {isBestSeller && (
                                <div className="absolute top-0 right-0 overflow-hidden w-32 h-32 pointer-events-none z-10">
                                    <div className="absolute transform rotate-45 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-extrabold py-1 right-[-35px] top-[32px] w-[120px] text-center shadow-md tracking-wider uppercase">
                                        Best Seller
                                    </div>
                                </div>
                            )}

                            {isAdmin && isEditMode && (
                                <button onClick={() => handleEditClick(pkg)} className="absolute top-3 left-3 z-20 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-lg transition-transform hover:scale-110">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                </button>
                            )}

                            {/* Card Header (Dark Navy Box) */}
                            <div className="p-7 bg-[#131d2e] dark:bg-slate-950 text-white text-center">
                                <h3 className="text-2xl font-black tracking-tight">{pkg.name}</h3>
                                <p className="text-xs text-slate-300 mt-1">{pkg.description}</p>
                                
                                <div className="mt-6">
                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                      <span className="text-4xl sm:text-5xl font-black text-white font-mono">₹{pkg.price.toFixed(2)}</span>
                                      {pkg.originalPrice && (
                                        <span className="text-sm font-semibold text-slate-400 line-through">₹{pkg.originalPrice.toFixed(2)}</span>
                                      )}
                                      {pkg.discountBadge && (
                                        <span className="text-[11px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                                          {pkg.discountBadge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-400 font-semibold mt-1">For {pkg.period}</p>
                                </div>
                            </div>
                           
                           {/* Features List */}
                           <div className="p-7 space-y-4 flex-grow bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-300">
                               <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                   <span className="text-slate-500 flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" /> Period</span>
                                   <span className="font-bold text-slate-900 dark:text-slate-100">{pkg.period}</span>
                               </div>
                               <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                   <span className="text-slate-500 flex items-center gap-2"><Wifi className="h-4 w-4 text-slate-400" /> Bandwidth</span>
                                   <span className="font-bold text-slate-900 dark:text-slate-100">{pkg.bandwidth}</span>
                               </div>
                               <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                   <span className="text-slate-500 flex items-center gap-2"><Download className="h-4 w-4 text-slate-400" /> Downloads</span>
                                   <span className="font-bold text-slate-900 dark:text-slate-100">{pkg.downloads}</span>
                               </div>
                               <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                   <span className="text-slate-500 flex items-center gap-2"><Activity className="h-4 w-4 text-slate-400" /> Daily Limit</span>
                                   <span className="font-bold text-slate-900 dark:text-slate-100">{pkg.dailyLimit}</span>
                               </div>
                               <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                                   <span className="text-slate-500 flex items-center gap-2"><HardDrive className="h-4 w-4 text-slate-400" /> Daily Bandwidth</span>
                                   <span className="font-bold text-slate-900 dark:text-slate-100">{pkg.dailyBandwidth}</span>
                               </div>
                               <div className="flex items-center justify-between py-2">
                                   <span className="text-slate-500 flex items-center gap-2"><Smartphone className="h-4 w-4 text-slate-400" /> Devices</span>
                                   <span className="font-bold text-slate-900 dark:text-slate-100">{pkg.devices}</span>
                               </div>
                           </div>

                           {/* Subscribe Button */}
                           <div className="p-7 pt-0 bg-white dark:bg-slate-900">
                               <button 
                                   onClick={() => {
                                     setSelectedPackage(pkg);
                                     setPaymentModalOpen(true);
                                   }} 
                                   className="w-full bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black py-3.5 px-4 rounded-xl transition-all shadow-md shadow-red-600/20 cursor-pointer"
                               >
                                   Subscribe Now
                               </button>
                           </div>
                        </div>
                       )
                    })}
                </div>

                {selectedPackage && <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setPaymentModalOpen(false)} pkg={selectedPackage} />}
                {selectedPackage && <EditPackageModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} pkg={selectedPackage} />}
            </div>
        </div>
    );
};

export default PricingPage;