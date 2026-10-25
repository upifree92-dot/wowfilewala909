import React, { useState, useEffect, FormEvent, useRef, ChangeEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import type { SocialLink } from '../types';

interface SocialLinkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  socialLink: Partial<SocialLink> | null;
}

const SocialLinkEditModal: React.FC<SocialLinkEditModalProps> = ({ isOpen, onClose, socialLink }) => {
  const { updateSiteContent, siteContent } = useAppContext();
  const [url, setUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (socialLink) {
      setUrl(socialLink.url || '');
      setIconUrl(socialLink.iconUrl || '');
    } else {
      setUrl('');
      setIconUrl('');
    }
  }, [socialLink, isOpen]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setIconUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!iconUrl) {
        alert("Please upload an icon.");
        return;
    }
    const currentLinks: SocialLink[] = siteContent.footer.socialLinks || [];
    let newLinks: SocialLink[];
    
    if (socialLink && socialLink.id) {
        newLinks = currentLinks.map(link => 
            link.id === socialLink.id ? { ...link, url, iconUrl } : link
        );
    } else {
        const newLink: SocialLink = { id: `social-${Date.now()}`, url, iconUrl };
        newLinks = [...currentLinks, newLink];
    }
    
    updateSiteContent('footer.socialLinks', newLinks);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[100] p-4" onClick={onClose}>
      <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-3xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">{socialLink ? 'Edit Social Link' : 'Add Social Link'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold">Full URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://www.example.com" className="w-full p-2 rounded bg-white dark:bg-slate-700 dark:text-white dark:border-slate-600 border border-slate-300" />
          </div>
          <div>
            <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-2">Icon</label>
            <div className="flex items-center gap-4">
                {iconUrl && <img src={iconUrl} alt="Icon Preview" className="w-12 h-12 p-1 bg-white dark:bg-slate-600 rounded-md object-contain" />}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-grow bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold py-2 px-4 rounded-lg text-sm">
                    {iconUrl ? 'Change Icon' : 'Upload Icon'}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
          </div>
          <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">Save</button>
        </form>
      </div>
    </div>
  );
};

export default SocialLinkEditModal;
