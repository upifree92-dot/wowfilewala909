
import React, { useState, useMemo, FormEvent, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { Product, Category } from '../types';
import Breadcrumbs from '../components/Breadcrumbs';
import FolderCard from '../components/FolderCard';
import Editable from '../components/Editable';
import ActivationForm from '../components/ActivationForm';
import ActivationFormSettingsModal from '../components/ActivationFormSettingsModal';
import { ProductPreviewModal } from '../components/ProductPreviewModal';
import { useSEO } from '../hooks/useSEO';
import { PremiumFileIcon } from '../components/PremiumFileIcon';


// Reusable Modal Component
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-100 dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-3xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">{title}</h2>
                {children}
            </div>
        </div>
    );
};

// Form for editing a Category/Folder
const CategoryEditForm: React.FC<{ category: Category; onSave: () => void; }> = ({ category, onSave }) => {
    const { updateCategory } = useAppContext();
    const [formData, setFormData] = useState<Category>(category);

    useEffect(() => {
        setFormData(category);
    }, [category]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        updateCategory(formData);
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Folder Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Description</label><textarea name="description" value={formData.description} onChange={handleInputChange} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
            <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold">Icon</label>
                <div className="flex items-center gap-4 mt-2">
                  <img src={formData.imageUrl} alt="Current Icon" className="w-16 h-16 object-contain rounded-md bg-white p-1 border" />
                  <input type="file" onChange={handleIconChange} accept="image/*" className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                </div>
            </div>
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">Save Changes</button>
        </form>
    );
};

// Form for creating/editing a Product
const ProductForm: React.FC<{ product?: Product; categoryId: string; onSave: () => void }> = ({ product, categoryId, onSave }) => {
    const { createProduct, updateProduct } = useAppContext();
    const [name, setName] = useState(product?.name || '');
    const [description, setDescription] = useState(product?.description || '');
    const [price, setPrice] = useState(product?.price || 0);
    const [size, setSize] = useState(product?.size || '');
    const [downloadLink, setDownloadLink] = useState(product?.downloadLink || '#');
    const [isHiddenLink, setIsHiddenLink] = useState(product?.isHiddenLink || false);
    // FIX: Corrected state initialization to prevent runtime errors by safely accessing optional product property.
    const [tags, setTags] = useState(product?.tags ? product.tags.join(', ') : 'new, featured');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const productData = {
            name, description, price, size, downloadLink, categoryId,
            isHiddenLink,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean) as ('new' | 'featured' | 'paid')[],
        };
        if (product) {
            updateProduct({ ...product, ...productData });
        } else {
            createProduct(productData);
        }
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Price (INR)</label><input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Size (e.g., 2.5 GB)</label><input type="text" value={size} onChange={e => setSize(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Download Link</label><input type="text" value={downloadLink} onChange={e => setDownloadLink(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
            <div className="flex items-center gap-2">
                <input type="checkbox" id="isHiddenLink" checked={isHiddenLink} onChange={e => setIsHiddenLink(e.target.checked)} className="rounded text-cyan-500 focus:ring-cyan-500" />
                <label htmlFor="isHiddenLink" className="text-slate-600 dark:text-slate-400 font-semibold">Auto-Download (Hide Google Drive Link)</label>
            </div>
            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Tags (comma-separated: new, featured, paid)</label><input type="text" value={tags} onChange={e => setTags(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">{product ? 'Save Changes' : 'Add Link'}</button>
        </form>
    );
};

// Form for creating a Category/Folder
const FolderForm: React.FC<{ parentId: string; onSave: () => void }> = ({ parentId, onSave }) => {
    const { createCategory } = useAppContext();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        createCategory(name, description, parentId);
        onSave();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Folder Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white border border-slate-300" /></div>
            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">Create Folder</button>
        </form>
    );
};


const ProductRow: React.FC<{ product: Product; onEdit: () => void; }> = ({ product, onEdit }) => {
    const { user, isFavorite, toggleFavorite, addToRecents, isAdmin, deleteProduct, hasPurchased, updateProduct, setNotification } = useAppContext();
    const isFavorited = isFavorite(product.id);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [tempPrice, setTempPrice] = useState(product.price);

    const handleSavePrice = () => {
        if (isNaN(tempPrice) || tempPrice < 0) {
            setNotification('Please enter a valid price.', 'error');
            return;
        }
        updateProduct({
            ...product,
            price: Number(tempPrice)
        });
        setIsEditingPrice(false);
    };

    const handleClick = () => {
        addToRecents(product.id);
        setIsPreviewOpen(true);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleFavorite(product.id);
    }
    
    const handleTestLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (product.downloadLink) {
            window.open(product.downloadLink, '_blank', 'noopener,noreferrer');
        }
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        // FIX: Encapsulated confirm message in a template literal to prevent syntax errors.
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            deleteProduct(product.id);
        }
    }

    const isPurchased = hasPurchased(product.id);

    return (
        <>
            <div 
                onClick={handleClick}
                className="bg-white dark:bg-slate-700 p-4 rounded-xl flex justify-between items-center border border-gray-200 dark:border-slate-650 shadow-sm hover:shadow-lg hover:border-cyan-300 dark:hover:border-cyan-500 transition-all duration-300 group cursor-pointer"
            >
                <div className="flex items-center gap-4 flex-grow min-w-0">
                    <PremiumFileIcon filename={product.name} className="h-12 w-10 flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                             <h4 className="font-bold text-md text-slate-800 dark:text-slate-200 truncate" title={product.name}>{product.name}</h4>
                             {user && (
                                 <button onClick={handleFavoriteClick} title={isFavorited ? "Remove from favorites" : "Add to favorites"} className="flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isFavorited ? 'text-yellow-400' : 'text-slate-400 dark:text-slate-500 hover:text-yellow-400'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                 </button>
                             )}
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                            {isEditingPrice ? (
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">₹</span>
                                    <input 
                                        type="number" 
                                        value={tempPrice} 
                                        onChange={(e) => setTempPrice(Number(e.target.value))} 
                                        className="w-20 p-1 text-xs text-slate-800 dark:text-white bg-white dark:bg-slate-700 border border-cyan-500 rounded font-mono"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSavePrice();
                                            } else if (e.key === 'Escape') {
                                                setIsEditingPrice(false);
                                            }
                                        }}
                                    />
                                    <button 
                                        onClick={handleSavePrice} 
                                        className="p-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0"
                                        title="Save Price"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => setIsEditingPrice(false)} 
                                        className="p-1 rounded bg-rose-500 hover:bg-rose-600 text-white flex-shrink-0"
                                        title="Cancel"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 mt-1 group/price">
                                    <p className="text-cyan-600 dark:text-cyan-400 font-semibold text-sm">₹{product.price.toFixed(2)}</p>
                                    {isAdmin && (
                                        <button 
                                            onClick={() => { setIsEditingPrice(true); setTempPrice(product.price); }} 
                                            title="Edit Price Inline"
                                            className="opacity-0 group-hover/price:opacity-100 hover:text-cyan-500 text-slate-400 transition-opacity p-0.5 cursor-pointer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} title="Edit Link" className="p-2 rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-blue-200 dark:hover:bg-blue-500 text-blue-600 dark:text-blue-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg></button>
                            <button onClick={handleTestLink} title="Test Link" className="p-2 rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-green-200 dark:hover:bg-green-500 text-green-600 dark:text-green-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg></button>
                            <button onClick={handleDelete} title="Delete Link" className="p-2 rounded-full bg-slate-200 dark:bg-slate-600 hover:bg-red-200 dark:hover:bg-red-500 text-red-600 dark:text-red-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                        </div>
                    )}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleClick(); }}
                        className={`font-bold py-2 px-5 rounded-lg transition-transform transform hover:scale-105 text-white text-sm ${isPurchased ? 'bg-green-600' : 'bg-cyan-500 hover:bg-cyan-600'}`}
                    >
                        {isPurchased ? 'Owned' : 'Get'}
                    </button>
                </div>
            </div>
            <ProductPreviewModal 
                product={product} 
                isOpen={isPreviewOpen} 
                onClose={() => setIsPreviewOpen(false)} 
            />
        </>
    );
};


const getCategoryHeroIcon = (category: Category) => {
  const id = category.id.toLowerCase();
  const name = category.name.toLowerCase();

  const isRealImage = category.imageUrl && (category.imageUrl.startsWith('http') || category.imageUrl.startsWith('data:') || category.imageUrl.startsWith('/'));
  
  if (isRealImage) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-600 bg-white flex items-center justify-center p-2 shadow-sm">
        <img src={category.imageUrl} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
      </div>
    );
  }

  // Brand-specific hero stylings
  if (name.includes('samsung')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-2 border-blue-500/20 font-bold tracking-widest shadow-inner">
        <span className="text-xl sm:text-2xl font-black uppercase text-blue-600 dark:text-blue-300">SM</span>
        <span className="text-[8px] sm:text-[9px] font-bold tracking-tight text-blue-500 mt-0.5">SAMSUNG</span>
      </div>
    );
  }
  if (name.includes('xiaomi') || name.includes('mi ') || id.includes('miflash') || name.includes('poco')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-2 border-orange-500/20 font-bold shadow-inner">
        <span className="text-xl sm:text-2xl font-black tracking-tighter">MI</span>
        <span className="text-[8px] sm:text-[9px] font-semibold tracking-wide text-orange-500/90 mt-0.5">XIAOMI</span>
      </div>
    );
  }
  if (name.includes('oppo')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/20 font-bold shadow-inner">
        <span className="text-xl sm:text-2xl font-black tracking-wide uppercase">OPPO</span>
      </div>
    );
  }
  if (name.includes('realme')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-2 border-amber-500/20 font-bold shadow-inner">
        <span className="text-2xl sm:text-3xl font-black italic text-amber-500 leading-none">r</span>
        <span className="text-[8px] sm:text-[9px] font-bold tracking-tight text-amber-600 mt-1">REALME</span>
      </div>
    );
  }
  if (name.includes('oneplus')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-2 border-red-500/20 font-bold shadow-inner">
        <span className="text-xl sm:text-2xl font-black text-red-500">1+</span>
        <span className="text-[8px] sm:text-[9px] font-bold tracking-tight uppercase mt-0.5">ONEPLUS</span>
      </div>
    );
  }
  if (name.includes('vivo')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-500/20 font-bold shadow-inner">
        <span className="text-lg sm:text-xl font-black italic uppercase">VIVO</span>
      </div>
    );
  }
  if (name.includes('infinix')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-2 border-cyan-500/20 font-bold shadow-inner">
        <span className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 italic">I</span>
        <span className="text-[8px] sm:text-[9px] font-bold tracking-tight text-cyan-500 mt-0.5">INFINIX</span>
      </div>
    );
  }
  if (name.includes('tecno')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border-2 border-violet-500/20 font-bold shadow-inner">
        <span className="text-md sm:text-lg font-black text-violet-500 uppercase">TECNO</span>
      </div>
    );
  }
  if (name.includes('itel')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-2 border-rose-500/20 font-bold shadow-inner">
        <span className="text-xl sm:text-2xl font-black text-rose-500 italic">i</span>
        <span className="text-[8px] sm:text-[9px] font-bold tracking-tight text-rose-500 mt-0.5">ITEL</span>
      </div>
    );
  }
  if (name.includes('huawei') || name.includes('honor')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border-2 border-red-500/20 font-bold shadow-inner">
        <span className="text-[10px] sm:text-[11px] font-extrabold uppercase">{name.includes('huawei') ? 'HUAWEI' : 'HONOR'}</span>
      </div>
    );
  }

  // Functional mappings with SVG icons for specific tools / types of folders
  if (id.includes('da-files') || name.includes('da files')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border-2 border-teal-500/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      </div>
    );
  }

  if (id.includes('auth') || name.includes('auth')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-2 border-purple-500/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
    );
  }

  if (id.includes('loader') || id.includes('preloader') || name.includes('loader') || name.includes('preloader')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-2 border-amber-500/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
    );
  }

  if (id.includes('dump') || name.includes('dump') || id.includes('emmc') || id.includes('ufs') || id.includes('rpmb')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-fuchsia-500/10 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 border-2 border-fuchsia-500/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      </div>
    );
  }

  if (id.includes('tool') || name.includes('tool') || name.includes('setup') || id.includes('activator')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-500/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    );
  }

  if (id.includes('driver') || name.includes('driver')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border-2 border-blue-500/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </div>
    );
  }

  if (id.includes('schematic') || name.includes('schematic') || id.includes('diagram') || name.includes('test point')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border-2 border-rose-500/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      </div>
    );
  }

  if (id.includes('windows') || name.includes('windows') || id.includes('office')) {
    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border-2 border-sky-500/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1 1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      </div>
    );
  }

  // General elegant folder visual
  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-2 border-cyan-500/20 shadow-inner">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    </div>
  );
};


const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { products, categories, isAdmin, isEditMode, duplicateCategory, user, siteContent } = useAppContext();
  const category = categories.find(c => c.id === categoryId);
  useSEO(category ? category.name : 'Category', category ? category.description : '');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // State for modals
  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [productModalTitle, setProductModalTitle] = useState('');
  const [isActivationSettingsModalOpen, setActivationSettingsModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Category | null>(null);


  const { subCategories, products: categoryProducts } = useMemo(() => {
    let subCats = categories.filter(sc => sc.parentId === categoryId);
    let prods = products.filter(p => p.categoryId === categoryId);

    if (searchQuery) {
        subCats = subCats.filter(sc => sc.name.toLowerCase().includes(searchQuery.toLowerCase()));
        prods = prods.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    const sortByName = (a: {name: string}, b: {name: string}) => {
        if (sortOrder === 'asc') {
            return a.name.localeCompare(b.name);
        }
        return b.name.localeCompare(a.name);
    };

    subCats.sort(sortByName);
    prods.sort(sortByName);

    return { subCategories: subCats, products: prods };

  }, [categoryId, searchQuery, sortOrder, products, categories]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductModalTitle('Edit Downloadable Link');
    setProductModalOpen(true);
  };

  const handleAddNewAction = (title: string) => {
    setEditingProduct(undefined);
    setProductModalTitle(title);
    setProductModalOpen(true);
  }

  if (!category) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center p-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
              <h2 className="text-2xl">Category not found. <Link to="/" className="text-cyan-600">Go Home</Link></h2>
          </div>
        </div>
      );
  }

  const totalFolders = subCategories.length;
  const totalFiles = categoryProducts.length;

  return(
    <div className="container mx-auto px-4 py-8">
      <Modal isOpen={isFolderModalOpen} onClose={() => setFolderModalOpen(false)} title="Create New Folder">
        <FolderForm parentId={categoryId!} onSave={() => setFolderModalOpen(false)} />
      </Modal>
      <Modal isOpen={isProductModalOpen} onClose={() => setProductModalOpen(false)} title={productModalTitle}>
        <ProductForm product={editingProduct} categoryId={categoryId!} onSave={() => setProductModalOpen(false)} />
      </Modal>
      <Modal isOpen={!!editingFolder} onClose={() => setEditingFolder(null)} title="Edit Folder">
        {editingFolder && <CategoryEditForm category={editingFolder} onSave={() => setEditingFolder(null)} />}
      </Modal>
      {isAdmin && category && <ActivationFormSettingsModal category={category} isOpen={isActivationSettingsModalOpen} onClose={() => setActivationSettingsModalOpen(false)} />}


      <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-slate-700/60 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {getCategoryHeroIcon(category)}
            <div>
              <Breadcrumbs categoryId={categoryId} />
              <div className="flex items-center gap-3 mt-1.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-200">{category.name}</h1>
                {isAdmin && isEditMode && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingFolder(category)}
                      className="p-1.5 rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-md transition-transform hover:scale-110"
                      title="Edit This Folder"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to duplicate this entire folder "${category.name}" and all of its contents?`)) {
                          duplicateCategory(category.id);
                        }
                      }}
                      className="p-1.5 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-md transition-transform hover:scale-110"
                      title="Duplicate/Copy This Folder"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6a2 2 0 002-2V8a2 2 0 00-2-2h-6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h1m-1-4h1m-1 4a2 2 0 012-2h1m-3 4V9a2 2 0 012-2h.5" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm max-w-2xl">{category.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700/30 px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-700/50 self-start md:self-center">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-blue-500 rounded-full"></span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {totalFolders} <Editable as="span" contentKey="category.folderLabel" />
              </span>
            </div>
            <div className="h-4 w-[1px] bg-gray-200 dark:bg-slate-600"></div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 bg-green-500 rounded-full"></span>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {totalFiles} <Editable as="span" contentKey="category.fileLabel" />
              </span>
            </div>
          </div>
        </div>

          <>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6 border-t border-b border-gray-200 dark:border-slate-700 py-4">
                <div className="relative w-full sm:max-w-xs">
                     <input 
                        type="search"
                        placeholder={`Search in ${category.name}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2.5 pl-10 rounded-md bg-gray-50 dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 transition-all text-slate-800 dark:text-white placeholder:text-slate-400"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 hidden md:inline">Sort by: Title</span>
                    <button 
                        onClick={() => setSortOrder('asc')}
                        className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${sortOrder === 'asc' ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block md:mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 16a1 1 0 102 0v-5.586l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 10.414V16z" /></svg>
                        <span className="hidden md:inline">ASC</span>
                    </button>
                    <button 
                        onClick={() => setSortOrder('desc')}
                        className={`px-3 py-1.5 rounded-md text-sm font-bold transition-colors ${sortOrder === 'desc' ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-500'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block md:mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM13 8a1 1 0 102 0V2.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 101.414 1.414L13 2.414V8z" /></svg>
                        <span className="hidden md:inline">DESC</span>
                    </button>
                    
                    {isAdmin && (
                      <div className="flex items-center gap-2 border-l-2 dark:border-slate-600 ml-2 pl-2">
                        <button onClick={() => setFolderModalOpen(true)} className="px-3 py-1.5 rounded-md text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white transition-colors">New Folder</button>
                        <button onClick={() => handleAddNewAction('Add New File/Link')} className="px-3 py-1.5 rounded-md text-sm font-bold bg-green-500 hover:bg-green-600 text-white transition-colors">Add File/Link</button>
                        <button onClick={() => setActivationSettingsModalOpen(true)} className="px-3 py-1.5 rounded-md text-sm font-bold bg-teal-500 hover:bg-teal-600 text-white transition-colors">Activation Form</button>
                      </div>
                    )}
                </div>
            </div>
            
            {totalFolders > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3 text-slate-700 dark:text-slate-300">
                    <Editable as="span" contentKey="category.foldersTitle" /> ({totalFolders})
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {subCategories.map((subCat, index) => {
                    const isLastOdd = index === subCategories.length - 1 && subCategories.length % 2 !== 0;
                    return (
                      <div key={subCat.id} className={isLastOdd ? "col-span-2 lg:col-span-1" : ""}>
                        <FolderCard category={subCat} onEdit={() => setEditingFolder(subCat)} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {totalFiles > 0 && (
              <div className="mb-10">
                 <h2 className="text-xl font-bold mb-4 border-l-4 border-green-500 pl-3 text-slate-700 dark:text-slate-300">
                    <Editable as="span" contentKey="category.filesTitle" /> ({totalFiles})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryProducts.map(product => (
                    <ProductRow key={product.id} product={product} onEdit={() => handleEditProduct(product)} />
                  ))}
                </div>
              </div>
            )}

            {category.activationForm?.enabled && (
                <ActivationForm category={category} />
            )}

            {totalFolders === 0 && totalFiles === 0 && !category.activationForm?.enabled && (
               <div className="text-center p-10 bg-gray-50 dark:bg-slate-700 rounded-lg mt-6">
                  <h2 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-200">No Content Found</h2>
                  <p className="text-slate-600 dark:text-slate-400">There are no files or sub-folders matching your search in this directory.</p>
               </div>
            )}
          </>

      </div>
    </div>
  );
};

export default CategoryPage;