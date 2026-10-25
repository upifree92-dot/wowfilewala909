
import React, { useState, useEffect, FormEvent } from 'react';
import { useAppContext } from '../context/AppContext';

interface NavItem {
  id: string;
  text: string;
  path: string;
}

interface NavItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  navItem: NavItem | null;
}

const NavItemEditModal: React.FC<NavItemEditModalProps> = ({ isOpen, onClose, navItem }) => {
  const { addNavLink, updateNavLink } = useAppContext();
  const [text, setText] = useState('');
  const [path, setPath] = useState('');

  useEffect(() => {
    if (navItem) {
      setText(navItem.text);
      setPath(navItem.path);
    } else {
      setText('');
      setPath('');
    }
  }, [navItem, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (navItem) {
      updateNavLink({ ...navItem, text, path });
    } else {
      addNavLink(text, path);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[100] p-4" onClick={onClose}>
      <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-3xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">{navItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold">Link Text</label>
            <input type="text" value={text} onChange={e => setText(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600 border border-slate-300" />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold">Path (e.g., /about)</label>
            <input type="text" value={path} onChange={e => setPath(e.target.value)} required className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600 border border-slate-300" />
          </div>
          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">Save</button>
        </form>
      </div>
    </div>
  );
};

export default NavItemEditModal;
