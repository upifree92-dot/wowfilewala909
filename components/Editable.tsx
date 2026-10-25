
import React, { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

// Helper to get nested values from the siteContent object
const getNestedValue = (obj: any, path: string): string => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
};

interface EditableProps {
  contentKey: string;
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  [x: string]: any; // To allow passing other props like 'htmlFor'
}

const Editable: React.FC<EditableProps> = ({ contentKey, as: Component = 'span', className, children, ...props }) => {
  const { isEditMode, siteContent, startEditing } = useAppContext();
  
  const content = useMemo(() => getNestedValue(siteContent, contentKey), [siteContent, contentKey]);

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startEditing(contentKey, content || (children as string));
  };

  if (isEditMode) {
    return (
      <Component
        className={`${className} relative p-1 cursor-pointer outline-dashed outline-1 outline-blue-500 hover:bg-blue-100 transition-colors`}
        onClick={handleEditClick}
        {...props}
      >
        {content || children}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 absolute top-0 right-0 text-blue-500 bg-white rounded-full" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      </Component>
    );
  }

  return (
    <Component className={className} {...props}>
      {content || children}
    </Component>
  );
};

export default Editable;
