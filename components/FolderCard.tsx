import React from 'react';
import { Link } from 'react-router-dom';
import type { Category } from '../types';
import { useAppContext } from '../context/AppContext';

interface FolderCardProps {
  category: Category;
  onEdit: () => void;
}

function getFolderIcon(category: Category) {
  const id = category.id.toLowerCase();
  const name = category.name.toLowerCase();

  // Check if it's a real image URL
  const isRealImage = category.imageUrl && (category.imageUrl.startsWith('http') || category.imageUrl.startsWith('data:') || category.imageUrl.startsWith('/'));
  
  if (isRealImage) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 overflow-hidden border border-slate-200 dark:border-slate-600 bg-white flex items-center justify-center p-1">
        <img src={category.imageUrl} alt="" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
      </div>
    );
  }

  // Brand-specific mappings
  if (name.includes('samsung')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex flex-col items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-xs tracking-wider">
        <span className="text-md font-extrabold uppercase text-blue-600 dark:text-blue-300">SAMSUNG</span>
      </div>
    );
  }
  if (name.includes('xiaomi') || name.includes('mi ') || id.includes('miflash') || name.includes('poco')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex flex-col items-center justify-center bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-bold text-sm">
        <span className="font-extrabold tracking-tighter">MI</span>
        <span className="text-[9px] font-medium tracking-tight text-orange-500/80">XIAOMI</span>
      </div>
    );
  }
  if (name.includes('oppo')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex flex-col items-center justify-center bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-sm">
        <span className="font-extrabold tracking-wide uppercase">OPPO</span>
      </div>
    );
  }
  if (name.includes('realme')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex flex-col items-center justify-center bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-sm">
        <span className="font-black italic text-amber-500">r</span>
        <span className="text-[8px] font-bold tracking-tight text-amber-600">REALME</span>
      </div>
    );
  }
  if (name.includes('oneplus')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex flex-col items-center justify-center bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-sm">
        <span className="font-black text-red-500">1+</span>
        <span className="text-[8px] font-bold tracking-tight uppercase">ONEPLUS</span>
      </div>
    );
  }
  if (name.includes('vivo')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex flex-col items-center justify-center bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold text-sm">
        <span className="font-extrabold italic uppercase">VIVO</span>
      </div>
    );
  }
  if (name.includes('infinix')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex flex-col items-center justify-center bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold text-sm">
        <span className="font-black text-cyan-600 dark:text-cyan-400 text-lg italic">I</span>
        <span className="text-[8px] font-bold tracking-tight text-cyan-500">INFINIX</span>
      </div>
    );
  }
  if (name.includes('tecno')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex flex-col items-center justify-center bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-bold text-sm">
        <span className="font-black text-violet-500 text-md uppercase">TECNO</span>
      </div>
    );
  }
  if (name.includes('itel')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex flex-col items-center justify-center bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold text-sm">
        <span className="font-black text-rose-500 italic">i</span>
        <span className="text-[8px] font-bold tracking-tight text-rose-500">ITEL</span>
      </div>
    );
  }
  if (name.includes('huawei') || name.includes('honor')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex flex-col items-center justify-center bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-sm">
        <span className="font-extrabold uppercase">{name.includes('huawei') ? 'HUAWEI' : 'HONOR'}</span>
      </div>
    );
  }
  if (name.includes('gionee') || name.includes('alcatel') || name.includes('lenovo') || name.includes('letv') || name.includes('meizu') || name.includes('motorola') || name.includes('sony') || name.includes('tcl')) {
    const brand = name.split(' ')[0] || name;
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex flex-col items-center justify-center bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/20 font-bold text-xs uppercase">
        <span className="font-black text-md leading-none">{brand[0]}</span>
        <span className="text-[8px] font-bold tracking-tight leading-tight mt-0.5">{brand.substring(0, 6)}</span>
      </div>
    );
  }

  // Functional mappings based on other keywords in name or id
  if (id.includes('da-files') || name.includes('da files')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      </div>
    );
  }

  if (id.includes('auth') || name.includes('auth')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
    );
  }

  if (id.includes('loader') || id.includes('preloader') || name.includes('loader') || name.includes('preloader')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </div>
    );
  }

  if (id.includes('dump') || name.includes('dump') || id.includes('emmc') || id.includes('ufs') || id.includes('rpmb')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-fuchsia-500/10 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      </div>
    );
  }

  if (id.includes('tool') || name.includes('tool') || name.includes('setup') || id.includes('activator')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
    );
  }

  if (id.includes('driver') || name.includes('driver')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      </div>
    );
  }

  if (id.includes('schematic') || name.includes('schematic') || id.includes('diagram') || name.includes('test point')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
      </div>
    );
  }

  if (id.includes('windows') || name.includes('windows') || id.includes('office')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1 1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
      </div>
    );
  }

  if (id.includes('network') || id.includes('qcn') || id.includes('efs') || name.includes('network')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  if (id.includes('frp') || name.includes('frp') || id.includes('mdm') || name.includes('bypass')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
    );
  }

  if (id.includes('tutorial') || id.includes('guide') || name.includes('tutorial') || name.includes('guide') || name.includes('solution') || id.includes('solution')) {
    return (
      <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  // Default elegant fallback folder icon (modern folder SVG)
  return (
    <div className="w-14 h-14 rounded-xl flex-shrink-0 mr-4 flex items-center justify-center bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    </div>
  );
}

const FolderCard: React.FC<FolderCardProps> = ({ category, onEdit }) => {
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
        {getFolderIcon(category)}

        <div>
          <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{category.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{category.description}</p>
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

export default FolderCard;