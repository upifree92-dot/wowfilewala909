import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

interface CopyButtonProps {
  textToCopy: string;
  className?: string;
  title?: string;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, className = '', title = "Copy to clipboard" }) => {
  const { setNotification } = useAppContext();
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!textToCopy) return;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setNotification('Copied to clipboard!', 'success');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, (err) => {
      setNotification('Failed to copy text.', 'error');
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center justify-center p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${className} ${copied ? 'bg-green-500 text-white scale-110' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-600 dark:text-slate-300'}`}
      title={title}
      aria-label={title}
    >
      {copied ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
          <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h6a2 2 0 00-2-2H5z" />
        </svg>
      )}
    </button>
  );
};

export default CopyButton;
