import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import type { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { ProductPreviewModal } from './ProductPreviewModal';

const Tag: React.FC<{ tag: string }> = ({ tag }) => {
    const baseClasses = "text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5";
    const styles: { [key: string]: string } = {
        new: 'bg-yellow-400 text-yellow-900',
        featured: 'bg-cyan-400 text-cyan-900',
        paid: 'bg-pink-400 text-pink-900',
    };
    const icons: { [key: string]: React.ReactNode } = {
        // FIX: Completed SVG path and added other icons.
        new: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1H5V4zM5 8h10a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1zm2 3a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>,
        featured: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
        paid: <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5a.997.997 0 01.707.293l7 7zM6 7a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
    };
    return (
        <span className={`${baseClasses} ${styles[tag] || 'bg-gray-400 text-gray-900'}`}>
            {icons[tag]}
            <span className="capitalize">{tag}</span>
        </span>
    );
};

interface FileListItemProps {
    product: Product;
}

// FIX: Changed to a named export to resolve the module error.
export const FileListItem: React.FC<FileListItemProps> = ({ product }) => {
    const { user, isFavorite, toggleFavorite, addToRecents, categories, isAdmin, updateProduct, setNotification } = useAppContext();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [copied, setCopied] = useState(false);
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

    const handleCopyLink = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const shareUrl = `${window.location.protocol}//${window.location.host}/#/download-direct?id=${product.id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy share link: ', err);
        });
    };

    const category = categories.find(c => c.id === product.categoryId);
    const isFavorited = isFavorite(product.id);
    
    const handleCardClick = () => {
        addToRecents(product.id);
        setIsPreviewOpen(true);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product.id);
    };

    const handleLinkClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <>
            <div 
                onClick={handleCardClick}
                className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-l-4 border-transparent hover:border-cyan-500 cursor-pointer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 dark:text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-grow min-w-0">
                    <Link to={`/category/${product.categoryId}`} onClick={handleLinkClick} className="hover:underline">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 truncate" title={product.name}>{product.name}</h3>
                    </Link>
                    {category && <p className="text-sm text-slate-500 dark:text-slate-400">In: {category.name}</p>}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                        {(product.tags || []).map(tag => <Tag key={tag} tag={tag} />)}
                    </div>
                </div>
                <div className="flex-shrink-0 flex flex-col sm:flex-row items-end sm:items-center gap-2 mt-4 sm:mt-0">
                    <div className="text-right sm:text-left mr-1" onClick={(e) => e.stopPropagation()}>
                        {isEditingPrice ? (
                            <div className="flex items-center gap-1 justify-end sm:justify-start">
                                <span className="text-cyan-600 dark:text-cyan-400 font-bold text-lg">₹</span>
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
                                    className="p-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white flex-shrink-0"
                                    title="Save Price"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <button 
                                    onClick={() => setIsEditingPrice(false)} 
                                    className="p-1.5 rounded bg-rose-500 hover:bg-rose-600 text-white flex-shrink-0"
                                    title="Cancel"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 justify-end sm:justify-start group/price">
                                <p className="font-bold text-lg text-cyan-600 dark:text-cyan-400">
                                    {product.price > 0 ? `₹${product.price.toFixed(2)}` : 'Free'}
                                </p>
                                {isAdmin && (
                                    <button 
                                        onClick={() => { setIsEditingPrice(true); setTempPrice(product.price); }} 
                                        title="Edit Price Inline"
                                        className="opacity-0 group-hover/price:opacity-100 hover:text-cyan-500 text-slate-400 transition-opacity p-0.5 cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        )}
                        {product.size && <p className="text-xs text-slate-500 dark:text-slate-400">{product.size}</p>}
                    </div>
                    <button
                        onClick={handleCopyLink}
                        title="Copy direct share link"
                        className={`font-bold py-2 px-3.5 rounded-lg border text-sm w-full sm:w-auto shadow-sm flex items-center justify-center gap-1.5 transition-all duration-200 ${
                            copied 
                                ? 'bg-emerald-600 border-emerald-600 text-white' 
                                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600'
                        }`}
                    >
                        {copied ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                                <span>Copy Link</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                        className="font-bold py-2 px-5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-sm w-full sm:w-auto shadow-sm"
                    >
                        Preview File
                    </button>
                    {user && (
                        <button onClick={handleFavoriteClick} title={isFavorited ? "Remove from favorites" : "Add to favorites"} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isFavorited ? 'text-yellow-400' : 'text-slate-400 hover:text-yellow-400'}`} viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        </button>
                    )}
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
