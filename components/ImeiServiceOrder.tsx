import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Search, X, CheckCircle2, AlertCircle, Smartphone, Hash } from 'lucide-react';
import { IMEI_SERVICES_LIST, ImeiServiceItem } from '../data/imeiServicesData';

const ImeiServiceOrder: React.FC = () => {
  const navigate = useNavigate();
  const { user, products, categories, placeImeiOrder, setNotification } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [discountedOnly, setDiscountedOnly] = useState(false);

  // Modal order state
  const [activeModalService, setActiveModalService] = useState<ImeiServiceItem | null>(null);
  const [imeiInput, setImeiInput] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [userNote, setUserNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Merge static list with Admin-updated/added IMEI products from AppContext
  const liveImeiServices = useMemo(() => {
    const productById = new Map<string, any>();
    const productByName = new Map<string, any>();
    (products || []).forEach((p) => {
      productById.set(p.id, p);
      productByName.set(p.name.trim().toLowerCase(), p);
    });

    const baseIds = new Set(IMEI_SERVICES_LIST.map((s) => s.id));
    const baseNames = new Set(IMEI_SERVICES_LIST.map((s) => s.name.trim().toLowerCase()));

    const updatedBase = IMEI_SERVICES_LIST.map((srv) => {
      const match = productById.get(srv.id) || productByName.get(srv.name.trim().toLowerCase());
      if (match) {
        return {
          ...srv,
          name: match.name || srv.name,
          price: match.price ?? srv.price,
          deliveryTime: match.deliveryTime || srv.deliveryTime,
        };
      }
      return srv;
    });

    const customImei: ImeiServiceItem[] = (products || [])
      .filter((p) => p.serviceType === 'imei' && !baseIds.has(p.id) && !baseNames.has(p.name.trim().toLowerCase()))
      .map((p) => {
        const catName = categories?.find((c) => c.id === p.categoryId)?.name || 'IMEI Services';
        return {
          id: p.id,
          name: p.name,
          category: catName,
          price: p.price ?? 0,
          deliveryTime: p.deliveryTime || 'Instant',
          isNew: p.tags?.includes('new') ?? true,
        };
      });

    return [...customImei, ...updatedBase];
  }, [products, categories]);

  // Extract all unique group names sorted alphabetically
  const allGroups = useMemo(() => {
    const groupsSet = new Set<string>();
    liveImeiServices.forEach((s) => {
      if (s.category) groupsSet.add(s.category);
    });
    return Array.from(groupsSet).sort((a, b) => a.localeCompare(b));
  }, [liveImeiServices]);

  // Filter services based on search, group dropdown, and discounted checkbox
  const filteredServices = useMemo(() => {
    return liveImeiServices.filter((srv) => {
      // Group filter
      if (selectedGroup !== 'All' && srv.category !== selectedGroup) {
        return false;
      }
      // Discounted checkbox filter
      if (discountedOnly && !srv.hasDiscount && srv.price > 50) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = srv.name.toLowerCase().includes(query);
        const matchesCat = srv.category.toLowerCase().includes(query);
        const matchesTime = srv.deliveryTime.toLowerCase().includes(query);
        if (!matchesName && !matchesCat && !matchesTime) {
          return false;
        }
      }
      return true;
    });
  }, [liveImeiServices, searchQuery, selectedGroup, discountedOnly]);

  // Group filtered services by category for clean section display
  const servicesByCategory = useMemo(() => {
    const map = new Map<string, ImeiServiceItem[]>();
    filteredServices.forEach((srv) => {
      const cat = srv.category || 'Global IMEI Services';
      if (!map.has(cat)) {
        map.set(cat, []);
      }
      map.get(cat)!.push(srv);
    });
    return Array.from(map.entries());
  }, [filteredServices]);

  const handleOpenOrderModal = (service: ImeiServiceItem) => {
    setActiveModalService(service);
    setImeiInput('');
    setQuantity(1);
    setUserNote('');
  };

  const handleCloseModal = () => {
    setActiveModalService(null);
    setImeiInput('');
    setQuantity(1);
    setUserNote('');
  };

  // Clean and sanitize IMEI input (digits only or alphanumeric for SN)
  const handleImeiChange = (val: string) => {
    const cleaned = val.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30);
    setImeiInput(cleaned);
  };

  const isImeiValid = useMemo(() => {
    const trimmed = imeiInput.trim();
    if (!trimmed) return false;
    // Standard 15 digits IMEI or 10-18 char Serial Number
    return (trimmed.length === 15 && /^\d+$/.test(trimmed)) || (trimmed.length >= 8 && trimmed.length <= 18);
  }, [imeiInput]);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalService) return;

    if (!user) {
      setNotification('Please log in to place an IMEI order.', 'error');
      navigate('/login');
      return;
    }

    const cleanImei = imeiInput.trim();
    if (!cleanImei) {
      setNotification('Please enter a valid IMEI or Serial Number.', 'error');
      return;
    }

    if (cleanImei.length < 8) {
      setNotification('IMEI must be at least 8-15 characters long.', 'error');
      return;
    }

    const totalCost = activeModalService.price * quantity;
    const currentBalance = user?.wallet?.balance ?? 0;

    if (currentBalance < totalCost) {
      setNotification(
        `Insufficient balance (₹${currentBalance.toFixed(2)}). Need ₹${totalCost.toFixed(2)}. Please recharge your wallet.`,
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      placeImeiOrder({
        serviceName: activeModalService.name,
        serviceId: activeModalService.id,
        inputData: `IMEI: ${cleanImei}${userNote.trim() ? ` | Note: ${userNote.trim()}` : ''}`,
        quantity,
        price: activeModalService.price,
        title: `IMEI Service - ${activeModalService.name}`,
      });

      handleCloseModal();
    } catch (err: any) {
      setNotification(err?.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalOrderPrice = (activeModalService?.price || 0) * quantity;
  const userBalance = user?.wallet?.balance ?? 0;

  return (
    <div className="w-full">
      {/* Top Header & Breadcrumbs matching screenshot */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Place A New IMEI Order
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          <Link to="/" className="hover:text-amber-500 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-700 dark:text-slate-300 font-semibold">
            Place A New IMEI Order
          </span>
          <span>/</span>
        </div>
      </div>

      {/* Filter Bar: All Group, Search Service..., Discounted */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-6">
        {/* All Group dropdown */}
        <div className="w-full md:w-64 shrink-0">
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium cursor-pointer truncate"
          >
            <option value="All">All Group ({IMEI_SERVICES_LIST.length} Services)</option>
            {allGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {/* Search Service... input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Service..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-amber-500 placeholder-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Discounted Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer select-none px-2 py-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium shrink-0">
          <input
            type="checkbox"
            checked={discountedOnly}
            onChange={(e) => setDiscountedOnly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
          />
          <span>Discounted</span>
        </label>
      </div>

      {/* Services List Grouped By Category */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No IMEI services found.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try clearing your search query or filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedGroup('All'); setDiscountedOnly(false); }}
            className="mt-3 px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-7">
          {servicesByCategory.map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-3">
              {/* Category Group Header */}
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>{categoryName}</span>
                </h2>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {items.length} {items.length === 1 ? 'Service' : 'Services'}
                </span>
              </div>

              {/* 3-column Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {items.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => handleOpenOrderModal(srv)}
                    className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-500/70 dark:hover:border-amber-500/70 hover:shadow-md transition-all cursor-pointer relative select-none"
                  >
                    {/* Gray Avatar Box with initials (e.g. Ap, Sa, Xi, AT, Al, etc.) */}
                    <div className="w-11 h-11 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-base flex items-center justify-center shrink-0 tracking-tight shadow-inner mt-0.5">
                      {srv.avatar || 'IM'}
                    </div>

                    {/* Tool info & Badges */}
                    <div className="flex-1 min-w-0">
                      {/* Title and New Badge */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-500 transition-colors line-clamp-1 leading-snug">
                          {srv.name}
                        </h3>
                        {srv.isNew && (
                          <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded shrink-0">
                            New
                          </span>
                        )}
                      </div>

                      {/* Subtitle / Category */}
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                        {srv.category}
                      </p>

                      {/* Bottom Row Badges: Price & Delivery Time */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-[#16a34a] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                          ₹{srv.price}
                        </span>
                        <span className="bg-[#f59e0b] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                          {srv.deliveryTime}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Place Order Modal */}
      {activeModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-500 font-bold text-base flex items-center justify-center shrink-0">
                  {activeModalService.avatar || 'IM'}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    Place A New IMEI Order
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {activeModalService.category}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmOrder} className="p-5 space-y-4">
              {/* Selected Tool Details Card */}
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {activeModalService.name}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-[#16a34a] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    ₹{activeModalService.price}
                  </span>
                  <span className="bg-[#f59e0b] text-white text-[11px] font-bold px-2 py-0.5 rounded shadow-sm">
                    {activeModalService.deliveryTime}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-auto font-mono flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                    Auto IMEI API
                  </span>
                </div>
              </div>

              {/* IMEI Number Input (15 digits) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    IMEI Number (15 Digits) / Serial No. <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[11px] font-mono font-bold ${
                    imeiInput.length === 15 ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    {imeiInput.length}/15 {imeiInput.length === 15 ? '✓ Valid' : ''}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={imeiInput}
                    onChange={(e) => handleImeiChange(e.target.value)}
                    placeholder="Enter 15-digit IMEI number (Dial *#06#)..."
                    className="w-full p-3 pl-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono tracking-wider"
                  />
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  💡 Dial <span className="font-mono font-bold text-slate-700 dark:text-slate-300">*#06#</span> on phone to check IMEI. For iPads, enter Serial Number.
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Quantity (Devices)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Order Note / Carrier Name (Optional)
                </label>
                <input
                  type="text"
                  value={userNote}
                  onChange={(e) => setUserNote(e.target.value)}
                  placeholder="e.g. Clean IMEI, Carrier AT&T, iPhone 15 Pro..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Price Calculation & Wallet Balance Check */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-1.5">
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                  <span>Price per unit:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    ₹{activeModalService.price}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
                  <span>Quantity:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    x {quantity}
                  </span>
                </div>
                <div className="border-t border-amber-200 dark:border-amber-800/50 pt-1.5 flex justify-between items-center text-sm font-bold">
                  <span className="text-slate-900 dark:text-slate-100">Total Amount:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-base">
                    ₹{totalOrderPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-dashed border-amber-200 dark:border-amber-800/30">
                  <span className="text-slate-500 dark:text-slate-400">Your Wallet Balance:</span>
                  <span className={`font-bold ${userBalance >= totalOrderPrice ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    ₹{userBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Low Balance Warning */}
              {userBalance < totalOrderPrice && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Insufficient Wallet Balance</p>
                    <p className="mt-0.5">Please recharge your balance before submitting this IMEI order.</p>
                    <button
                      type="button"
                      onClick={() => navigate('/wallet')}
                      className="mt-2 text-xs font-bold underline hover:text-rose-800 dark:hover:text-rose-200 cursor-pointer"
                    >
                      Go to Wallet & Add Funds →
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || userBalance < totalOrderPrice || !isImeiValid}
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    userBalance >= totalOrderPrice && isImeiValid
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md hover:shadow-lg'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Place IMEI Order</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImeiServiceOrder;
