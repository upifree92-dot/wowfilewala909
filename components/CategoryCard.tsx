
import React from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../types';
import { useAppContext } from '../context/AppContext';

interface CategoryCardProps {
  category: Category;
  onEdit: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit }) => {
  const { isAdmin, isEditMode, duplicateCategory, deleteCategory } = useAppContext();
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  const handleDuplicateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to create a copy of folder "${category.name}"?`)) {
      duplicateCategory(category.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmDelete(true);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirmDelete(false);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteCategory(category.id);
    setShowConfirmDelete(false);
  };

  return (
    <div className="relative group" onMouseLeave={() => setShowConfirmDelete(false)}>
      <Link 
        to={`/category/${category.id}`} 
        className="flex items-center p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow-md hover:border-cyan-300 dark:hover:border-cyan-500 transition-all duration-300"
      >
        <img 
          src={category.imageUrl} 
          alt="" 
          className="w-14 h-14 object-contain mr-4 flex-shrink-0" 
        />
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{category.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{category.description}</p>
        </div>
      </Link>
      {isAdmin && isEditMode && (
         <div className="absolute top-2 right-2 flex items-center gap-1.5 z-30 bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-sm p-1 rounded-lg border border-slate-700/50 shadow-lg">
           {showConfirmDelete ? (
             <>
               <span className="text-[10px] font-bold text-red-400 px-1">Delete?</span>
               <button 
                 onClick={handleConfirmDelete} 
                 className="p-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition-all"
                 title="Confirm Delete"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                 </svg>
               </button>
               <button 
                 onClick={handleCancelDelete} 
                 className="p-1.5 rounded bg-slate-600 text-white hover:bg-slate-500 transition-all"
                 title="Cancel"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </>
           ) : (
             <>
               <button 
                 onClick={handleDuplicateClick} 
                 className="p-1.5 rounded bg-green-600 text-white hover:bg-green-700 transition-all"
                 title="Duplicate/Copy Folder"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6a2 2 0 002-2V8a2 2 0 00-2-2h-6M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 13h1m-1-4h1m-1 4a2 2 0 012-2h1m-3 4V9a2 2 0 012-2h.5" />
                 </svg>
               </button>
               <button 
                 onClick={handleEditClick} 
                 className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-all"
                 title="Edit Folder"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                 </svg>
               </button>
               <button 
                 onClick={handleDeleteClick} 
                 className="p-1.5 rounded bg-red-600 text-white hover:bg-red-700 transition-all"
                 title="Delete Folder"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                 </svg>
               </button>
             </>
           )}
         </div>
      )}
    </div>
  );
};

export default CategoryCard;