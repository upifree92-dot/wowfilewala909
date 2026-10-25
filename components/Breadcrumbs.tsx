
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { Category } from '../types';
import Editable from './Editable';

interface BreadcrumbsProps {
  categoryId: string | undefined;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ categoryId }) => {
  const { categories } = useAppContext();
  
  const path = useMemo(() => {
    const buildPath = (id: string | undefined): Category[] => {
      if (!id) return [];
      const category = categories.find(c => c.id === id);
      if (!category) return [];
      return [...buildPath(category.parentId), category];
    };
    return buildPath(categoryId);
  }, [categoryId, categories]);

  return (
    <nav className="flex items-center text-sm text-slate-500" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link to="/" className="inline-flex items-center font-medium hover:text-cyan-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <Editable as="span" contentKey="breadcrumbs.root" />
          </Link>
        </li>
        {path.map((p, index) => (
          <li key={p.id}>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              {index === path.length - 1 ? (
                <span className="ml-1 font-medium text-slate-700 md:ml-2">{p.name}</span>
              ) : (
                <Link to={`/category/${p.id}`} className="ml-1 font-medium hover:text-cyan-600 md:ml-2">
                  {p.name}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;