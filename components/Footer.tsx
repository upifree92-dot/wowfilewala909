
import React, { useState, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import Editable from './Editable';
import { useAppContext } from '../context/AppContext';
import type { SocialLink } from '../types';
import SocialLinkEditModal from './SocialLinkEditModal';


const Footer = () => {
  const { siteContent, isEditMode, updateSiteContent, startEditing } = useAppContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<Partial<SocialLink> | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { about, quickLinks, legal, stayConnected, socialLinks = [], copyright } = siteContent.footer || {};

  const handleEditSocial = (link: SocialLink) => {
    setEditingLink(link);
    setModalOpen(true);
  };

  const handleAddSocial = () => {
    setEditingLink(null);
    setModalOpen(true);
  };

  const handleDeleteSocial = (linkId: string) => {
    if (window.confirm('Are you sure you want to delete this social link?')) {
      const newLinks = socialLinks.filter((link: SocialLink) => link.id !== linkId);
      updateSiteContent('footer.socialLinks', newLinks);
    }
  };

  const handleLogoUploadClick = () => {
    logoInputRef.current?.click();
  };

  const handleLogoFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSiteContent('footer.about.logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <>
      <SocialLinkEditModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        socialLink={editingLink}
      />
      <footer className="bg-[#2a2d34] dark:bg-[#32363e] text-gray-400 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            {/* About Us */}
            <div className="space-y-4">
              <Editable as="h3" contentKey="footer.about.title" className="text-lg font-bold text-cyan-400" />
              {about?.logoUrl && (
                <div
                  className={`relative group inline-block ${isEditMode ? 'cursor-pointer outline-dashed outline-1 outline-blue-500' : ''}`}
                  onClick={() => isEditMode && startEditing('footer.about.logoLink', about.logoLink)}
                >
                  <a href={about.logoLink} target="_blank" rel="noopener noreferrer">
                    <img src={about.logoUrl} alt="Footer Logo" className="max-h-12 bg-white/10 p-1 rounded" />
                  </a>
                  {isEditMode && <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white font-bold text-sm">Edit Link</span></div>}
                </div>
              )}
              {isEditMode && (
                <div>
                  <button onClick={handleLogoUploadClick} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded">
                    {about?.logoUrl ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  <input type="file" ref={logoInputRef} onChange={handleLogoFileChange} className="hidden" accept="image/*" />
                </div>
              )}
              <Editable as="p" contentKey="footer.about.text" className="text-sm leading-relaxed" />
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <Editable as="h3" contentKey="footer.quickLinks.title" className="text-lg font-bold text-cyan-400" />
              <ul className="space-y-2 text-sm">
                {quickLinks?.links.map((link: {id: string; path: string;}, index: number) => (
                  <li key={link.id}>
                    <Link to={link.path} className="hover:text-white transition-colors flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full"></span>
                      <Editable contentKey={`footer.quickLinks.links.${index}.text`} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <Editable as="h3" contentKey="footer.legal.title" className="text-lg font-bold text-cyan-400" />
              <ul className="space-y-2 text-sm">
                {legal?.links.map((link: {id: string; path: string;}, index: number) => (
                  <li key={link.id}>
                    <Link to={link.path} className="hover:text-white transition-colors flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full"></span>
                      <Editable contentKey={`footer.legal.links.${index}.text`} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Stay Connected */}
            <div className="space-y-4">
              <Editable as="h3" contentKey="footer.stayConnected.title" className="text-lg font-bold text-cyan-400" />
              <div className="flex items-center gap-3">
                {socialLinks.map((link: SocialLink) => (
                  <div key={link.id} className="relative group">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center h-9 w-9 bg-[#3b3e47] rounded-full hover:bg-cyan-500 transition-colors">
                      <img src={link.iconUrl} alt="Social Icon" className="h-5 w-5 object-contain" />
                    </a>
                    {isEditMode && (
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-slate-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                        <button onClick={() => handleEditSocial(link)} className="p-1 text-blue-300 hover:text-white" title="Edit Link"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg></button>
                        <button onClick={() => handleDeleteSocial(link.id)} className="p-1 text-red-400 hover:text-red-300" title="Delete Link"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                      </div>
                    )}
                  </div>
                ))}
                {isEditMode && (
                  <button onClick={handleAddSocial} className="flex items-center justify-center h-9 w-9 rounded-full border-2 border-dashed border-slate-500 text-slate-500 hover:bg-slate-700 hover:text-white hover:border-solid transition-all" title="Add Social Link">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                  </button>
                )}
              </div>
              <Editable as="p" contentKey="footer.stayConnected.text" className="text-sm leading-relaxed" />
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row mt-2">
                  <input
                    type="email"
                    placeholder={stayConnected?.newsletterPlaceholder || 'Your Email'}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder:text-gray-500"
                  />
                  <button
                    type="submit"
                    className="mt-2 sm:mt-0 sm:ml-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-md flex-shrink-0 transition-colors"
                  >
                    {stayConnected?.newsletterButtonText || 'Subscribe'}
                  </button>
              </form>
            </div>

          </div>

          {/* Copyright bar & Notice */}
          <div className="border-t border-slate-700 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-gray-400 gap-2">
            <Editable as="p" contentKey="footer.copyright" />
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-important-notice'))}
              className="text-amber-400 hover:text-amber-300 transition-colors font-medium cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md"
              title="View Important Notice & Terms"
            >
              <span>⚠️</span>
              <span>Important Notice &amp; Terms</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;