
import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { useAppContext } from '../context/AppContext';

interface RecentFileCardProps {
  product: Product;
  isFavoriteView?: boolean;
}

const RecentFileCard: React.FC<RecentFileCardProps> = ({ product, isFavoriteView = false }) => {
  const { addToRecents } = useAppContext();

  // The card itself is a link to the category page where the file is located.
  // Clicking it will also register it as a "recent" interaction.
  return (
    <Link
      to={`/category/${product.categoryId}`}
      onClick={() => addToRecents(product.id)}
      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-500 transition-all duration-300 group"
    >
      <div className="flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 group-hover:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="min-w-0 flex-grow">
        <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={product.name}>
          {product.name}
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {product.price > 0 ? `₹${product.price.toFixed(2)}` : 'Free'}
        </p>
      </div>
      {isFavoriteView && (
         <div className="flex-shrink-0 text-yellow-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
         </div>
      )}
    </Link>
  );
};

export default RecentFileCard;
