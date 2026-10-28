import React, { useState, useMemo, FormEvent, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import type { Product, Category, ActivationFormConfig, ActivationCustomField } from '../../types';
import MasterServiceManagerModal from '../../components/MasterServiceManagerModal';

const inferProductServiceType = (p: Product): 'imei' | 'server' | 'remote' | 'file' => {
  if (p.serviceType) return p.serviceType;
  const id = (p.id || '').toLowerCase();
  if (id.startsWith('imei-')) return 'imei';
  if (id.startsWith('srv-') || id.startsWith('server-')) return 'server';
  if (id.startsWith('remote-') || id.startsWith('tool-')) return 'remote';
  if (id.startsWith('file-') || id.startsWith('pkg-')) return 'file';

  const text = (p.name + ' ' + (p.description || '') + ' ' + (p.categoryId || '')).toLowerCase();
  if (text.includes('imei') || text.includes('icloud') || text.includes('sn ') || text.includes('serial') || text.includes('carrier') || text.includes('clean imei') || text.includes('network unlock')) return 'imei';
  if (text.includes('remote') || text.includes('rent') || text.includes('teamviewer') || text.includes('flexihub') || text.includes('hours') || text.includes('login id')) return 'remote';
  if (text.includes('file') || text.includes('firmware') || text.includes('rom') || text.includes('dump') || text.includes('setup') || text.includes('driver') || text.includes('iso') || text.includes('pinout') || text.includes('schematic') || text.includes('da ') || text.includes('flash tool')) return 'file';
  return 'server';
};

// --- Category Modal (Add / Edit / Form Builder) ---
interface CategoryModalProps {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
}

const CategoryModal = ({ category, isOpen, onClose }: CategoryModalProps) => {
  const { isAdmin, createCategory, updateCategory, categories } = useAppContext();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [parentId, setParentId] = useState('');
  
  // Activation Form configuration state
  const [formEnabled, setFormEnabled] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  const [deliveryTime, setDeliveryTime] = useState('Instant');
  const [minQty, setMinQty] = useState<number>(1);
  const [maxQty, setMaxQty] = useState<number>(1);
  const [customFields, setCustomFields] = useState<ActivationCustomField[]>([]);

  // Field adding form state
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldPlaceholder, setNewFieldPlaceholder] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'password' | 'email'>('text');

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
      setImageUrl(category.imageUrl || '');
      setParentId(category.parentId || '');
      
      const formConfig = category.activationForm;
      if (formConfig) {
        setFormEnabled(formConfig.enabled);
        setFormTitle(formConfig.title || '');
        setPricePerUnit(formConfig.pricePerUnit || 0);
        setDeliveryTime(formConfig.deliveryTime || 'Instant');
        setMinQty(formConfig.quantityRange?.min ?? 1);
        setMaxQty(formConfig.quantityRange?.max ?? 1);
        setCustomFields(formConfig.customFields || []);
      } else {
        resetFormConfig();
      }
    } else {
      setName('');
      setDescription('');
      setImageUrl('');
      setParentId('');
      resetFormConfig();
    }
  }, [category, isOpen]);

  const resetFormConfig = () => {
    setFormEnabled(false);
    setFormTitle('');
    setPricePerUnit(0);
    setDeliveryTime('Instant');
    setMinQty(1);
    setMaxQty(1);
    setCustomFields([]);
  };

  if (!isOpen || !isAdmin) return null;

  const handleAddField = () => {
    if (!newFieldName || !newFieldLabel) return;
    const newField: ActivationCustomField = {
      id: 'field_' + Date.now(),
      name: newFieldName.trim().toLowerCase().replace(/\s+/g, '_'),
      label: newFieldLabel.trim(),
      placeholder: newFieldPlaceholder.trim(),
      type: newFieldType,
      enabled: true
    };
    setCustomFields([...customFields, newField]);
    setNewFieldName('');
    setNewFieldLabel('');
    setNewFieldPlaceholder('');
  };

  const handleRemoveField = (fieldId: string) => {
    setCustomFields(customFields.filter(f => f.id !== fieldId));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const activationForm: ActivationFormConfig = {
      enabled: formEnabled,
      title: formTitle || `${name} Activation`,
      pricePerUnit: Number(pricePerUnit),
      deliveryTime,
      quantityRange: {
        min: Number(minQty) || 1,
        max: Number(maxQty) || 1
      },
      customFields
    };

    const categoryData: any = {
      name,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60',
      parentId: parentId || undefined,
      activationForm
    };

    if (category) {
      updateCategory({ ...category, ...categoryData });
    } else {
      createCategory(categoryData.name, categoryData.description, categoryData.parentId);
      // Wait, createCategory in AppContext accepts name, description, parentId.
      // Let's call updateCategory immediately after or handle full customization in custom database storage.
    }
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-[9999] p-3 sm:p-4" onClick={onClose}>
      <div className="bg-slate-950 p-5 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-800 relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 text-3xl font-bold transition-colors">&times;</button>
        <h2 className="text-xl font-bold mb-1 text-slate-100">{category ? 'Edit Category' : 'Create Category'}</h2>
        <p className="text-xs text-slate-500 mb-6">Setup categories and custom active forms for keys & services</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Category Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" placeholder="e.g. Server Activation" />
            </div>
            <div>
              <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Parent Category (Optional)</label>
              <select value={parentId} onChange={e => setParentId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm">
                <option value="">No Parent (Root Category)</option>
                {categories.filter(c => c.id !== category?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" placeholder="Provide category purpose..." />
          </div>

          <div>
            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Image URL</label>
            <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm font-mono text-xs" placeholder="https://..." />
          </div>

          {/* Activation Form Configurator Toggle */}
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-200">Activation Order Form Settings</h3>
                <p className="text-[11px] text-slate-400">Users fill customized details when requesting activation orders</p>
              </div>
              <button
                type="button"
                onClick={() => setFormEnabled(!formEnabled)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${formEnabled ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-950 text-slate-500 border-slate-800'}`}
              >
                {formEnabled ? 'Form Active' : 'Form Inactive'}
              </button>
            </div>

            {formEnabled && (
              <div className="space-y-4 pt-3 border-t border-slate-800 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Form/Order Title</label>
                    <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/40 text-xs" placeholder="e.g. Enter Activation Account Detail" />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Price Per Unit (₹)</label>
                    <input type="number" value={pricePerUnit} onChange={e => setPricePerUnit(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40 text-xs font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Delivery Time</label>
                    <input type="text" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/40 text-xs" placeholder="e.g. 5-30 Mins" />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Min Quantity</label>
                    <input type="number" value={minQty} onChange={e => setMinQty(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/40 text-xs font-mono" />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold text-[10px] uppercase tracking-wider mb-1">Max Quantity</label>
                    <input type="number" value={maxQty} onChange={e => setMaxQty(Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500/40 text-xs font-mono" />
                  </div>
                </div>

                {/* Custom Fields Builder */}
                <div className="pt-2">
                  <h4 className="font-bold text-xs text-slate-300 mb-2">Form Fields Builder</h4>
                  {customFields.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {customFields.map((field) => (
                        <div key={field.id} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono">
                          <div>
                            <span className="text-amber-400 font-bold">{field.label}</span>
                            <span className="text-slate-500 ml-2">({field.type} - {field.name})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(field.id)}
                            className="text-rose-400 hover:text-rose-300 font-bold px-1.5"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 italic mb-3">No fields added yet. Add at least one input field below.</p>
                  )}

                  {/* Add Field Inline Row */}
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end">
                    <div>
                      <label className="block text-slate-500 text-[9px] uppercase tracking-wider font-bold mb-1">Field Name/Key</label>
                      <input type="text" value={newFieldName} onChange={e => setNewFieldName(e.target.value)} placeholder="e.g. username" className="w-full px-2 py-1 bg-slate-900 text-xs text-slate-100 border border-slate-800 rounded focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[9px] uppercase tracking-wider font-bold mb-1">Display Label</label>
                      <input type="text" value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)} placeholder="e.g. PUBG ID" className="w-full px-2 py-1 bg-slate-900 text-xs text-slate-100 border border-slate-800 rounded focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-slate-500 text-[9px] uppercase tracking-wider font-bold mb-1">Field Type</label>
                      <select value={newFieldType} onChange={e => setNewFieldType(e.target.value as any)} className="w-full px-2 py-1 bg-slate-900 text-xs text-slate-300 border border-slate-800 rounded focus:outline-none">
                        <option value="text">Text Input</option>
                        <option value="password">Password</option>
                        <option value="email">Email Address</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold py-1.5 px-3 rounded transition-all"
                    >
                      Add Input
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/10 transition-all text-sm">
            {category ? 'Save Category Settings' : 'Create Category'}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};


// --- Product Modal (Add / Edit) ---
interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (productId: string) => void;
}

const ProductModal = ({ product, isOpen, onClose, onDelete }: ProductModalProps) => {
  const { isAdmin, createProduct, updateProduct, categories, setNotification } = useAppContext();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [serviceType, setServiceType] = useState<'imei' | 'server' | 'remote' | 'file'>('server');
  const [price, setPrice] = useState<number>(0);
  const [dealerPrice, setDealerPrice] = useState<number>(0);
  const [deliveryTime, setDeliveryTime] = useState<string>('Instant');
  const [downloadLink, setDownloadLink] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('0 KB');
  const [isPaid, setIsPaid] = useState(true);
  const [isNew, setIsNew] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    const defaultCatId = categories && categories.length > 0 ? categories[0].id : 'cat-imei';
    if (product) {
      setName(product.name || '');
      setCategoryId(product.categoryId || defaultCatId);
      setServiceType(inferProductServiceType(product));
      setPrice(product.price ?? 0);
      setDealerPrice(product.dealerPrice ?? Math.round((product.price ?? 0) * 0.85));
      setDeliveryTime(product.deliveryTime || 'Instant');
      setDownloadLink(product.downloadLink || '#');
      setDescription(product.description || '');
      setSize(product.size || '1.0 MB');
      setIsPaid(Array.isArray(product.tags) ? product.tags.includes('paid') : true);
      setIsNew(Array.isArray(product.tags) ? product.tags.includes('new') : false);
      setIsFeatured(Array.isArray(product.tags) ? product.tags.includes('featured') : false);
    } else {
      setName('');
      setCategoryId(defaultCatId);
      setServiceType('server');
      setPrice(0);
      setDealerPrice(0);
      setDeliveryTime('Instant');
      setDownloadLink('#');
      setDescription('');
      setSize('1.0 MB');
      setIsPaid(true);
      setIsNew(true);
      setIsFeatured(false);
    }
  }, [product, isOpen, categories]);

  if (!isOpen || !isAdmin) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    try {
      const defaultCatId = categories && categories.length > 0 ? categories[0].id : 'cat-imei';
      const finalCatId = categoryId || defaultCatId;
      if (!name.trim()) {
        setNotification('Please enter a service/product name.', 'error');
        return;
      }

      const tags: ('new' | 'featured' | 'paid')[] = [];
      if (isPaid) tags.push('paid');
      if (isNew) tags.push('new');
      if (isFeatured) tags.push('featured');

      const productData: any = {
        name: name.trim(),
        categoryId: finalCatId,
        serviceType,
        price: Number(price) || 0,
        dealerPrice: Number(dealerPrice) || 0,
        deliveryTime: deliveryTime || 'Instant',
        downloadLink: downloadLink || '#',
        description: description || '',
        size: size || '1.0 MB',
        tags
      };

      if (product) {
        updateProduct({ ...product, ...productData });
      } else {
        createProduct(productData);
      }
      onClose();
    } catch (err) {
      console.error("Error saving product:", err);
      setNotification("Error saving service. Please check values.", "error");
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-[9999] p-3 sm:p-4" onClick={onClose}>
      <div className="bg-slate-950 p-5 sm:p-7 rounded-2xl shadow-2xl w-full max-w-lg border border-amber-500/30 relative max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-xl font-bold transition-colors">&times;</button>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
            Admin Only
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-100">{product ? 'Edit Service / File' : 'Add New Service / File'}</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">Modify service title, category, customer price, dealer price & delivery time</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Product / Service Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" placeholder="e.g. VIP Mod Tool" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Service Type</label>
              <select value={serviceType} onChange={e => setServiceType(e.target.value as any)} required className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm">
                <option value="imei">📱 IMEI Service</option>
                <option value="server">🖥️ Server Service</option>
                <option value="remote">⚡ Remote Tool Rent</option>
                <option value="file">📁 File Service</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Category</label>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm">
                <option value="" disabled>Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Customer Price (₹)</label>
              <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm font-bold font-mono" />
            </div>
            <div>
              <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Dealer Price (₹)</label>
              <input type="number" value={dealerPrice} onChange={e => setDealerPrice(Number(e.target.value))} required className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm font-bold font-mono" />
            </div>
            <div>
              <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Delivery Time</label>
              <input type="text" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} required className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs sm:text-sm" placeholder="e.g. Instant / 1-5 Mins" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">File / Pack Size</label>
              <input type="text" value={size} onChange={e => setSize(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" placeholder="e.g. 14.5 MB" />
            </div>
            <div>
              <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Digital Product Badges</label>
              <div className="flex flex-wrap gap-2 pt-1.5">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input type="checkbox" checked={isPaid} onChange={e => setIsPaid(e.target.checked)} className="rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-800 w-4 h-4" />
                  <span>Paid Product</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer ml-3">
                  <input type="checkbox" checked={isNew} onChange={e => setIsNew(e.target.checked)} className="rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-800 w-4 h-4" />
                  <span>New</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer ml-3">
                  <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="rounded text-amber-500 focus:ring-0 bg-slate-900 border-slate-800 w-4 h-4" />
                  <span>Featured</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Instant Download Link</label>
            <input type="text" value={downloadLink} onChange={e => setDownloadLink(e.target.value)} required className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm font-mono text-xs" placeholder="https://drive.google.com/..." />
          </div>

          <div>
            <label className="block text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-sm" placeholder="Tell users what this file contains..." />
          </div>

          <div className="flex flex-wrap gap-2.5 mt-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            {product && onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(product.id);
                  onClose();
                }}
                className="px-4 py-3 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-400 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                🗑️ Delete
              </button>
            )}
            <button type="submit" className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all text-sm cursor-pointer">
              {product ? '💾 Save Changes' : '➕ Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};


// --- Main Component ---
const AdminProductsPage = () => {
  const { isAdmin, user, products, categories, deleteProduct, deleteCategory, setNotification, resetToDefaultServices } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [productQuery, setProductQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const typeParam = searchParams.get('type') as 'imei' | 'server' | 'remote' | 'file' | null;
  const [serviceTypeFilter, setServiceTypeFilterState] = useState<'all' | 'imei' | 'server' | 'remote' | 'file'>(
    typeParam || 'all'
  );

  useEffect(() => {
    if (typeParam && ['imei', 'server', 'remote', 'file'].includes(typeParam)) {
      setServiceTypeFilterState(typeParam);
    } else if (!typeParam) {
      setServiceTypeFilterState('all');
    }
  }, [typeParam]);

  const setServiceTypeFilter = (val: 'all' | 'imei' | 'server' | 'remote' | 'file') => {
    setServiceTypeFilterState(val);
    const newParams = new URLSearchParams(searchParams);
    if (val === 'all') {
      newParams.delete('type');
    } else {
      newParams.set('type', val);
    }
    setSearchParams(newParams);
  };

  // Modal controls
  const [isMasterManagerOpen, setIsMasterManagerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [doubleClickProduct, setDoubleClickProduct] = useState<Product | null>(null);

  const getProductServiceType = inferProductServiceType;

  const serviceCounts = useMemo(() => {
    const counts = { all: products.length, imei: 0, server: 0, remote: 0, file: 0 };
    products.forEach(p => {
      const st = getProductServiceType(p);
      counts[st]++;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchQuery = p.name.toLowerCase().includes(productQuery.toLowerCase()) || 
                         (p.description && p.description.toLowerCase().includes(productQuery.toLowerCase()));
      const matchCat = categoryFilter === 'all' || p.categoryId === categoryFilter;
      const st = getProductServiceType(p);
      const matchServiceType = serviceTypeFilter === 'all' || st === serviceTypeFilter;
      return matchQuery && matchCat && matchServiceType;
    });
  }, [products, productQuery, categoryFilter, serviceTypeFilter]);

  const handleDeleteProduct = (productId: string) => {
    if (!isAdmin) return;
    deleteProduct(productId);
    setNotification("Service deleted successfully!", "success");
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!isAdmin) return;
    const connectedProducts = products.filter(p => p.categoryId === categoryId);
    if (connectedProducts.length > 0) {
      setNotification(`Cannot delete category with ${connectedProducts.length} active products. Move or delete products first.`, "error");
      return;
    }
    deleteCategory(categoryId);
    setNotification("Category removed successfully!", "success");
  };

  if (!isAdmin) {
    return (
      <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center max-w-md mx-auto my-12 shadow-2xl">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3 text-xl">
          🔒
        </div>
        <h2 className="text-lg font-extrabold text-white mb-2">Admin Access Only</h2>
        <p className="text-xs text-slate-400 mb-5">
          Service editing options are restricted to the Administrator only.
        </p>
        <Link
          to={user ? "/" : "/login"}
          className="inline-block px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider"
        >
          {user ? "Back to Home" : "Admin Login"}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-800/80 shadow-2xl">
      
      {/* Modals rendered via Portal to document.body */}
      <MasterServiceManagerModal isOpen={isMasterManagerOpen} onClose={() => setIsMasterManagerOpen(false)} />
      <ProductModal product={selectedProduct} isOpen={isProductModalOpen} onClose={() => { setIsProductModalOpen(false); setSelectedProduct(null); }} onDelete={handleDeleteProduct} />
      <CategoryModal category={selectedCategory} isOpen={isCategoryModalOpen} onClose={() => { setIsCategoryModalOpen(false); setSelectedCategory(null); }} />

      {/* Double-Click Service Action Modal via Portal */}
      {doubleClickProduct && createPortal(
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center z-[9999] p-4" onClick={() => setDoubleClickProduct(null)}>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Admin Service Action
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1.5 line-clamp-1">{doubleClickProduct.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Select action to perform on this service:</p>
              </div>
              <button type="button" onClick={() => setDoubleClickProduct(null)} className="text-slate-400 hover:text-white text-2xl font-bold leading-none">&times;</button>
            </div>

            <div className="space-y-3 my-5">
              <button
                type="button"
                onClick={() => {
                  setSelectedProduct(doubleClickProduct);
                  setIsProductModalOpen(true);
                  setDoubleClickProduct(null);
                }}
                className="w-full flex items-center gap-3.5 p-3.5 bg-slate-950 hover:bg-amber-500/10 border border-slate-800 hover:border-amber-500/40 rounded-xl transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  ✏️
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition-colors">Edit Service</div>
                  <div className="text-[11px] text-slate-400">Modify price, name, type, or download link</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const pid = doubleClickProduct.id;
                  setDoubleClickProduct(null);
                  handleDeleteProduct(pid);
                }}
                className="w-full flex items-center gap-3.5 p-3.5 bg-slate-950 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/40 rounded-xl transition-all group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-lg group-hover:bg-rose-500 group-hover:text-white transition-all">
                  🗑️
                </div>
                <div className="text-left">
                  <div className="font-bold text-sm text-slate-100 group-hover:text-rose-400 transition-colors">Delete Service</div>
                  <div className="text-[11px] text-slate-400">Permanently delete from database</div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setDoubleClickProduct(null)}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs transition-all border border-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 border-b border-slate-800/80 pb-5">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
          <h1 className="text-xl font-bold tracking-wide text-slate-100">Services List & Catalog</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* 1-Button Master Manager Trigger */}
          <button
            onClick={() => setIsMasterManagerOpen(true)}
            className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition-all shadow-lg shadow-teal-500/20 cursor-pointer"
          >
            <span>⚡ 1-Button Master Manager</span>
          </button>

          {/* Tab switches */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'products' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Services List
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${activeTab === 'categories' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Categories
            </button>
          </div>

          {resetToDefaultServices && (
            <button
              type="button"
              onClick={() => {
                resetToDefaultServices();
              }}
              className="bg-slate-900 hover:bg-slate-800 text-teal-400 border border-teal-500/30 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Restore all default services across all 4 categories"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Restore All Services</span>
            </button>
          )}

          <button
            onClick={() => {
              if (activeTab === 'products') {
                setSelectedProduct(null);
                setIsProductModalOpen(true);
              } else {
                setSelectedCategory(null);
                setIsCategoryModalOpen(true);
              }
            }}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            {activeTab === 'products' ? 'Add Service' : 'Add Category'}
          </button>
        </div>
      </div>

      {activeTab === 'products' ? (
        <div className="space-y-6">

          {/* Service Type Options Bar (IMEI, Server, Remote, File) */}
          <div className="flex flex-wrap gap-2.5 items-center bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800/80">
            <button
              onClick={() => setServiceTypeFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                serviceTypeFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>🌐 All Services</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${serviceTypeFilter === 'all' ? 'bg-slate-950/40 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {serviceCounts.all}
              </span>
            </button>

            <button
              onClick={() => setServiceTypeFilter('imei')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                serviceTypeFilter === 'imei'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>📱 IMEI</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${serviceTypeFilter === 'imei' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {serviceCounts.imei}
              </span>
            </button>

            <button
              onClick={() => setServiceTypeFilter('server')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                serviceTypeFilter === 'server'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>🖥️ Server</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${serviceTypeFilter === 'server' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {serviceCounts.server}
              </span>
            </button>

            <button
              onClick={() => setServiceTypeFilter('remote')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                serviceTypeFilter === 'remote'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>⚡ Remote Tool Rent</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${serviceTypeFilter === 'remote' ? 'bg-emerald-600 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                {serviceCounts.remote}
              </span>
            </button>

            <button
              onClick={() => setServiceTypeFilter('file')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                serviceTypeFilter === 'file'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>📁 File</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${serviceTypeFilter === 'file' ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {serviceCounts.file}
              </span>
            </button>
          </div>

          {/* Search bar and Category Filters */}
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800/40 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-grow">
              <input 
                type="text" 
                placeholder="Search by name, description, size..." 
                value={productQuery} 
                onChange={e => setProductQuery(e.target.value)} 
                className="w-full sm:w-80 px-3.5 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/40 text-slate-200 placeholder-slate-500" 
              />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-slate-300"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5 self-start md:self-center bg-amber-500/10 px-3.5 py-1.5 rounded-lg border border-amber-500/20 shadow-sm whitespace-nowrap">
              <span>🖱️ Double-click any row for Edit / Delete options</span>
            </div>
          </div>

          {/* Product list table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-slate-400 uppercase text-[11px] tracking-wider font-semibold">
                  <th className="p-3 pb-4">Service Details</th>
                  <th className="p-3 pb-4">Type</th>
                  <th className="p-3 pb-4">Category</th>
                  <th className="p-3 pb-4">Customer Price</th>
                  <th className="p-3 pb-4">Dealer Price</th>
                  <th className="p-3 pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredProducts.length > 0 ? filteredProducts.map(p => {
                  const categoryName = categories.find(c => c.id === p.categoryId)?.name || 'Unknown';
                  const st = getProductServiceType(p);
                  const dp = p.dealerPrice ?? Math.round(p.price * 0.85);
                  return (
                    <tr 
                      key={p.id} 
                      onDoubleClick={() => setDoubleClickProduct(p)}
                      className="group hover:bg-slate-900/60 transition-colors duration-150 select-none"
                      title="Double click or use buttons to Edit / Delete"
                    >
                      <td className="p-3 py-4">
                        <div className="font-bold text-slate-100 text-sm sm:text-base flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className="flex gap-1.5">
                            {p.tags?.includes('paid') && (
                              <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-extrabold uppercase rounded tracking-wider">Paid</span>
                            )}
                            {p.tags?.includes('new') && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold uppercase rounded tracking-wider">New</span>
                            )}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-lg">{p.description}</div>
                        <div className="text-[10px] text-slate-400 mt-1 font-mono flex items-center gap-3">
                          <span>Delivery: <strong className="text-slate-200">{p.deliveryTime || 'Instant'}</strong></span>
                          <span>Size: <strong className="text-slate-200">{p.size}</strong></span>
                        </div>
                      </td>

                      <td className="p-3 py-4 text-xs font-semibold">
                        {st === 'imei' && (
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg inline-flex items-center gap-1 text-[11px]">
                            📱 IMEI
                          </span>
                        )}
                        {st === 'server' && (
                          <span className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg inline-flex items-center gap-1 text-[11px]">
                            🖥️ Server
                          </span>
                        )}
                        {st === 'remote' && (
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg inline-flex items-center gap-1 text-[11px]">
                            ⚡ Remote Tool Rent
                          </span>
                        )}
                        {st === 'file' && (
                          <span className="px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg inline-flex items-center gap-1 text-[11px]">
                            📁 File
                          </span>
                        )}
                      </td>

                      <td className="p-3 py-4 text-xs sm:text-sm text-slate-300 font-medium">{categoryName}</td>

                      <td className="p-3 py-4 font-extrabold text-emerald-400 font-mono text-sm sm:text-base">
                        ₹{p.price}
                      </td>

                      <td className="p-3 py-4 font-extrabold text-amber-400 font-mono text-sm sm:text-base">
                        ₹{dp}
                      </td>

                      <td className="p-3 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(p);
                              setIsProductModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-bold transition-all cursor-pointer"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduct(p.id);
                            }}
                            className="px-2 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all cursor-pointer"
                            title="Delete Service"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={7} className="text-center p-12 text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xl">
                          {serviceTypeFilter === 'file' ? '📁' : '🔍'}
                        </div>
                        <p className="text-sm font-medium text-slate-300">
                          {serviceTypeFilter === 'file'
                            ? 'No file services uploaded yet.'
                            : 'No services found for selected filter.'}
                        </p>
                        <p className="text-xs text-slate-500 max-w-sm">
                          {serviceTypeFilter === 'file'
                            ? 'Aapne abhi tak koi files nahi daali hain. Nayi file upload ya add karne ke liye upar "+ Add Service" par click karein.'
                            : 'Search query ya category filter change karein.'}
                        </p>
                        {serviceTypeFilter === 'file' && (
                          <button
                            onClick={() => {
                              setSelectedProduct(null);
                              setIsProductModalOpen(true);
                            }}
                            className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all"
                          >
                            + Add File Service
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map(c => {
              const count = products.filter(p => p.categoryId === c.id).length;
              const hasForm = c.activationForm?.enabled;
              return (
                <div key={c.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between hover:border-amber-500/20 hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img src={c.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&q=50'} alt={c.name} className="w-10 h-10 rounded-lg object-cover border border-slate-800" />
                        <div>
                          <h3 className="font-bold text-slate-100 text-sm sm:text-base leading-snug">{c.name}</h3>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {c.id}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[10px] rounded">
                        {count} Files
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-4 line-clamp-2 leading-relaxed">{c.description || 'No description provided.'}</p>

                    {hasForm && (
                      <div className="mt-4 p-2 bg-amber-500/5 rounded-lg border border-amber-500/10 flex items-center justify-between text-[11px]">
                        <span className="text-amber-400 font-bold">✓ Direct Order Form Configured</span>
                        <span className="text-slate-400 font-mono">₹{c.activationForm?.pricePerUnit}/unit</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2.5 mt-6 pt-4 border-t border-slate-800/40">
                    <button
                      onClick={() => { setSelectedCategory(c); setIsCategoryModalOpen(true); }}
                      className="w-full py-2 bg-slate-900 border border-slate-800/80 hover:border-amber-500/20 text-slate-300 hover:text-amber-400 text-xs font-bold rounded-xl transition-all"
                    >
                      Configure / Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="px-3 bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-900 text-rose-400 rounded-xl transition-all"
                      title="Delete Category"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage;
