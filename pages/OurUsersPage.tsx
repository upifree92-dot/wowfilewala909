import React, { useState, useRef, ChangeEvent, FormEvent, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import Editable from '../components/Editable';
import { useSEO } from '../hooks/useSEO';

type Agent = { id: string; name: string; title: string; avatarUrl: string };
type Review = { id: string; companyLogoUrl: string; companyName: string; text: string; authorName: string; authorTitle: string; avatarUrl: string };

// --- SVG Icons for Stat Cards ---
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h8a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l.5-1.5A2 2 0 0110.121 2h3.758a2 2 0 011.914 1.293l.5 1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const FlagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6H8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const ICONS: { [key: string]: React.ReactNode } = {
    globe: <GlobeIcon />,
    download: <DownloadIcon />,
    flag: <FlagIcon />,
    users: <UsersIcon />,
};

// Generic Edit Modal
const EditItemModal: React.FC<{
    item: Agent | Review | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Agent | Review) => void;
    itemType: 'Agent' | 'Review';
}> = ({ item, isOpen, onClose, onSave, itemType }) => {
    const [formData, setFormData] = useState<any>(item || {});
    const fileInputRefs = {
        avatar: useRef<HTMLInputElement>(null),
        logo: useRef<HTMLInputElement>(null)
    };

    React.useEffect(() => {
        setFormData(item || {});
    }, [item, isOpen]);
    
    if (!isOpen) return null;

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>, field: 'avatarUrl' | 'companyLogoUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, [field]: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const isAgent = itemType === 'Agent';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-3xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-200">Edit {itemType}</h2>
                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* Common Avatar Upload */}
                    <div className="flex items-center gap-4">
                        <img src={formData.avatarUrl || 'https://i.pravatar.cc/150'} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400" />
                        <button type="button" onClick={() => fileInputRefs.avatar.current?.click()} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold py-2 px-4 rounded-lg text-sm">Upload Photo</button>
                        <input type="file" ref={fileInputRefs.avatar} onChange={(e) => handleImageChange(e, 'avatarUrl')} className="hidden" accept="image/*" />
                    </div>

                    {isAgent ? (
                        <>
                            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Agent Name</label><input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} required className="w-full p-2 rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white border" /></div>
                            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Title</label><input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} required className="w-full p-2 rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white border" /></div>
                        </>
                    ) : (
                        <>
                            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Company Name</label><input type="text" name="companyName" value={formData.companyName || ''} onChange={handleInputChange} required className="w-full p-2 rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white border" /></div>
                            <div className="flex items-center gap-4">
                                <img src={formData.companyLogoUrl || 'https://placehold.co/100x40'} alt="Company Logo" className="h-10 object-contain bg-white p-1 rounded" />
                                <button type="button" onClick={() => fileInputRefs.logo.current?.click()} className="bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 font-semibold py-2 px-4 rounded-lg text-sm">Upload Logo</button>
                                <input type="file" ref={fileInputRefs.logo} onChange={(e) => handleImageChange(e, 'companyLogoUrl')} className="hidden" accept="image/*" />
                            </div>
                            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Author Name</label><input type="text" name="authorName" value={formData.authorName || ''} onChange={handleInputChange} required className="w-full p-2 rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white border" /></div>
                            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Author Title</label><input type="text" name="authorTitle" value={formData.authorTitle || ''} onChange={handleInputChange} required className="w-full p-2 rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white border" /></div>
                            <div><label className="block text-slate-600 dark:text-slate-400 font-semibold">Review Text</label><textarea name="text" value={formData.text || ''} onChange={handleInputChange} required className="w-full p-2 rounded bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white border h-24" /></div>
                        </>
                    )}
                    
                    <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg">Save Changes</button>
                </form>
            </div>
        </div>
    );
};


// --- 3D Chart Component ---
const DistributionChart = () => {
    const { siteContent, isEditMode } = useAppContext();
    const data = siteContent.ourUsersPage.distributionSection.chartData;
    const maxValue = 100; // Use 100 for percentage scale

    return (
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl shadow-inner mt-4">
            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-64 [perspective:800px]">
                {data.map((item: any, index: number) => (
                    <div key={item.id} className="text-center flex flex-col items-center justify-end h-full">
                        <div className="relative group w-full h-full flex items-end justify-center">
                            <div className="relative w-full h-full flex items-end justify-center transition-transform duration-300 group-hover:[transform:translateZ(10px)]">
                                <div 
                                    className="w-full rounded-t-md transition-all duration-500 ease-out flex items-center justify-center [transform-style:preserve-3d]"
                                    style={{ 
                                        height: `${(item.percentage / maxValue) * 100}%`, 
                                        backgroundColor: item.color,
                                        boxShadow: `inset -6px -6px 12px ${item.color}40, 2px 2px 5px rgba(0,0,0,0.1)`,
                                        transform: `translateZ(0px)`
                                    }}
                                >
                                    <div className="absolute w-full h-2 -top-1 bg-black/10 [transform:rotateX(90deg)_translateZ(1px)] rounded-t-sm"></div>
                                    <div className="absolute h-full w-2 -right-1 bg-black/10 [transform:rotateY(-90deg)_translateZ(1px)] rounded-r-sm"></div>
                                </div>
                                 <Editable as="p" contentKey={`ourUsersPage.distributionSection.chartData.${index}.percentage`} className="absolute -top-6 text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {item.percentage}%
                                 </Editable>
                            </div>
                        </div>
                        <Editable as="p" contentKey={`ourUsersPage.distributionSection.chartData.${index}.continent`} className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400"/>
                    </div>
                ))}
            </div>
        </div>
    );
};


const OurUsersPage = () => {
    useSEO('Our Users', 'See what our community is doing.');
    const { siteContent, isEditMode, updateSiteContent } = useAppContext();
    const { header, ceo, agentSpotlight, impactSection, distributionSection, reviewsSection } = siteContent.ourUsersPage;

    const [agentSearch, setAgentSearch] = useState('');
    const [editingItem, setEditingItem] = useState<{ item: Agent | Review | null, type: 'Agent' | 'Review' } | null>(null);
    const ceoFileInputRef = useRef<HTMLInputElement>(null);

    const handleCeoImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateSiteContent('ourUsersPage.ceo.avatarUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const filteredAgents = useMemo(() => 
        agentSpotlight.agents.filter((agent: Agent) => 
            agent.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
            agent.title.toLowerCase().includes(agentSearch.toLowerCase())
        ), [agentSpotlight.agents, agentSearch]);

    const handleSaveItem = (formData: any) => {
        const { type, item } = editingItem!;
        
        const isEditing = item && item.id;

        if (type === 'Agent') {
            const currentAgents: Agent[] = agentSpotlight.agents;
            let newAgents: Agent[];
            if (isEditing) {
                newAgents = currentAgents.map(a => a.id === item.id ? formData : a);
            } else {
                const newAgent: Agent = { ...formData, id: `agent-${Date.now()}` };
                newAgents = [...currentAgents, newAgent];
            }
            updateSiteContent('ourUsersPage.agentSpotlight.agents', newAgents);
        } else if (type === 'Review') {
            const currentReviews: Review[] = reviewsSection.reviews;
            let newReviews: Review[];
            if (isEditing) {
                newReviews = currentReviews.map(r => r.id === item.id ? formData : r);
            } else {
                const newReview: Review = { ...formData, id: `review-${Date.now()}` };
                newReviews = [...currentReviews, newReview];
            }
            updateSiteContent('ourUsersPage.reviewsSection.reviews', newReviews);
        }
    };


    const handleDeleteItem = (id: string, type: 'Agent' | 'Review') => {
        if (!id) return;
        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            if (type === 'Agent') {
                const newAgents = agentSpotlight.agents.filter((a: Agent) => a.id !== id);
                updateSiteContent('ourUsersPage.agentSpotlight.agents', newAgents);
            } else {
                const newReviews = reviewsSection.reviews.filter((r: Review) => r.id !== id);
                updateSiteContent('ourUsersPage.reviewsSection.reviews', newReviews);
            }
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900">
             <EditItemModal
                isOpen={!!editingItem}
                onClose={() => setEditingItem(null)}
                item={editingItem?.item || null}
                itemType={editingItem?.type || 'Agent'}
                onSave={handleSaveItem}
            />
            {/* --- Top Blue Section --- */}
            <section className="relative bg-[#0d1b3f] text-white pt-24 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-contain bg-center opacity-[0.03]" style={{backgroundImage: "url('https://www.svgbackgrounds.com/api/regular-shapes/4/50/255,255,255,1/0/0,255,255,1/45/25/0')"}}></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-12">
                        <Editable as="h1" contentKey="ourUsersPage.header.title" className="text-4xl md:text-5xl font-extrabold" />
                        <Editable as="p" contentKey="ourUsersPage.header.subtitle" className="text-lg md:text-xl text-slate-300 mt-4" />
                    </div>

                    {/* CEO Spotlight Section */}
                    {ceo && (
                        <div id="ceo-spotlight-card" className="max-w-4xl mx-auto mb-16 bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                            <div className="absolute top-0 right-0 bg-cyan-500 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase shadow-md">
                                Executive Leadership
                            </div>
                            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                                <div className="relative group shrink-0">
                                    <img 
                                        src={ceo.avatarUrl || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&h=256&fit=crop"} 
                                        alt={ceo.name || "CEO"} 
                                        className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-cyan-500/20 shadow-xl"
                                    />
                                    {isEditMode && (
                                        <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => ceoFileInputRef.current?.click()} 
                                                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold py-1.5 px-3 rounded text-xs transition-colors"
                                            >
                                                Change Photo
                                            </button>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        ref={ceoFileInputRef} 
                                        onChange={handleCeoImageUpload} 
                                        className="hidden" 
                                        accept="image/*" 
                                    />
                                </div>
                                <div className="flex-grow text-center md:text-left space-y-3">
                                    <div>
                                        <Editable as="h3" contentKey="ourUsersPage.ceo.title" className="text-cyan-400 font-semibold text-xs tracking-widest uppercase" />
                                        <Editable as="h2" contentKey="ourUsersPage.ceo.name" className="text-2xl md:text-3xl font-extrabold text-white mt-1" />
                                        <Editable as="p" contentKey="ourUsersPage.ceo.designation" className="text-slate-300 font-medium text-sm mt-0.5" />
                                    </div>
                                    <Editable as="p" contentKey="ourUsersPage.ceo.bio" className="text-slate-400 text-sm leading-relaxed max-w-2xl" />
                                    <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                                        {ceo.whatsapp && (
                                            <a 
                                                id="ceo-whatsapp-btn"
                                                href={`https://wa.me/${ceo.whatsapp}`} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-emerald-400 text-xs font-semibold transition-all"
                                            >
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.59-4.846c1.6.95 3.18 1.448 4.74 1.449 5.486 0 9.948-4.469 9.952-9.959.002-2.661-1.034-5.163-2.917-7.047C16.54 1.713 14.037.674 11.4.674 5.913.674 1.455 5.132 1.452 10.617c-.001 1.761.463 3.484 1.344 5.011l-.982 3.585 3.674-.963zm10.748-5.392c-.31-.156-1.838-.906-2.112-1.006-.275-.099-.474-.148-.674.149-.2.297-.773.978-.948 1.176-.175.198-.35.223-.66.067-.31-.156-1.307-.483-2.49-1.54-1.19-1.062-1.992-2.373-2.226-2.769-.234-.396-.025-.611.173-.807.18-.176.31-.362.464-.544.156-.182.207-.314.31-.528.104-.215.053-.404-.025-.561-.078-.157-.674-1.626-.924-2.228-.243-.585-.491-.506-.674-.515-.173-.008-.372-.01-.572-.01s-.525.075-.798.372c-.274.298-1.047 1.024-1.047 2.498s1.072 2.894 1.222 3.093c.15.198 2.11 3.223 5.112 4.52.714.309 1.272.493 1.707.63.718.228 1.37.196 1.885.119.574-.085 1.838-.752 2.1-1.441.262-.689.262-1.282.183-1.402-.078-.12-.275-.219-.585-.375z" />
                                                </svg>
                                                Chat with CEO
                                            </a>
                                        )}
                                        {ceo.contactEmail && (
                                            <a 
                                                id="ceo-email-btn"
                                                href={`mailto:${ceo.contactEmail}`} 
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-lg text-cyan-400 text-xs font-semibold transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Email CEO
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <Editable as="h2" contentKey="ourUsersPage.agentSpotlight.title" className="text-2xl font-bold" />
                        <div className="relative w-full md:w-72">
                            <input type="search" placeholder={agentSpotlight.searchPlaceholder} value={agentSearch} onChange={e => setAgentSearch(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                    </div>
                    <div className="relative">
                        {isEditMode && <button onClick={() => setEditingItem({ item: {} as Agent, type: 'Agent' })} className="absolute -top-10 right-0 bg-green-500 text-white rounded-full flex items-center justify-center h-7 w-7 hover:bg-green-600" title="Add Agent"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" /></svg></button>}
                        <div className="flex gap-6 pb-4 -mx-4 px-4 overflow-x-auto">
                            {filteredAgents.map((agent: Agent) => (
                                <div key={agent.id} className="relative group bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-64 flex-shrink-0 text-center transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
                                    {isEditMode && <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditingItem({ item: agent, type: 'Agent'})} className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded-full text-blue-500 hover:bg-blue-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg></button>
                                        <button onClick={() => handleDeleteItem(agent.id, 'Agent')} className="p-1.5 bg-slate-200 dark:bg-slate-700 rounded-full text-red-500 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" /></svg></button>
                                    </div>}
                                    <img src={agent.avatarUrl} alt={agent.name} className="w-24 h-24 rounded-full mx-auto border-4 border-white dark:border-slate-800 object-cover" />
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-4">{agent.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400">{agent.title}</p>
                                    <div className="mt-4 flex gap-2 justify-center">
                                        <button className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg text-sm">Contact</button>
                                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm">Profile</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- Main White Content Section --- */}
            <section className="py-16 bg-white dark:bg-slate-900">
                <div className="container mx-auto px-4">
                    <Editable as="h2" contentKey="ourUsersPage.impactSection.title" className="text-3xl font-bold text-center mb-10 text-slate-800 dark:text-slate-200" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {impactSection.metrics.map((metric: {id: string, icon: string, value: string, label: string}, index: number) => (
                            <div key={metric.id} className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl shadow-md flex items-center gap-4 transition-transform duration-300 hover:-translate-y-2">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">{ICONS[metric.icon]}</div>
                                <div>
                                    <Editable as="p" contentKey={`ourUsersPage.impactSection.metrics.${index}.value`} className="text-2xl font-bold text-slate-800 dark:text-slate-200"/>
                                    <Editable as="p" contentKey={`ourUsersPage.impactSection.metrics.${index}.label`} className="text-sm text-slate-500 dark:text-slate-400"/>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                        <div className="lg:col-span-3">
                            <div className="flex items-center gap-4 mb-4">
                                {isEditMode && <Editable as="button" contentKey="ourUsersPage.distributionSection.avatarUrl" className="hidden"/>}
                                <img src={distributionSection.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover"/>
                                <Editable as="h3" contentKey="ourUsersPage.distributionSection.title" className="text-2xl font-bold text-slate-800 dark:text-slate-200"/>
                            </div>
                            <DistributionChart />
                        </div>

                        <div className="lg:col-span-2">
                             <div className="flex justify-between items-center mb-4">
                                <Editable as="h3" contentKey="ourUsersPage.reviewsSection.title" className="text-2xl font-bold text-slate-800 dark:text-slate-200"/>
                                {isEditMode && <button onClick={() => setEditingItem({ item: {} as Review, type: 'Review' })} className="bg-green-500 text-white rounded-full h-7 w-7 flex items-center justify-center hover:bg-green-600" title="Add Review"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" /></svg></button>}
                            </div>
                            <div className="text-center bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-6">
                                <Editable as="p" contentKey="ourUsersPage.reviewsSection.overallRating" className="text-xl font-bold text-blue-600 dark:text-blue-400"/>
                                <div className="flex justify-center text-yellow-400 mt-1">
                                    {[...Array(5)].map((_, i) => <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                                </div>
                            </div>
                            <div className="space-y-6">
                                {reviewsSection.reviews.map((review: Review) => (
                                    <div key={review.id} className="relative group bg-slate-100 dark:bg-slate-800 p-6 rounded-xl shadow-md">
                                        {isEditMode && <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingItem({ item: review, type: 'Review'})} className="p-1.5 bg-white dark:bg-slate-700 rounded-full text-blue-500 hover:bg-blue-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg></button>
                                            <button onClick={() => handleDeleteItem(review.id, 'Review')} className="p-1.5 bg-white dark:bg-slate-700 rounded-full text-red-500 hover:bg-red-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z" /></svg></button>
                                        </div>}
                                        <div className="flex items-center justify-between">
                                             <img src={review.companyLogoUrl} alt={review.companyName} className="h-6"/>
                                             <p className="text-xs font-bold text-blue-500">VERIFIED</p>
                                        </div>
                                        <p className="text-slate-600 dark:text-slate-300 my-4">"{review.text}"</p>
                                        <div className="flex items-center gap-3 border-t border-slate-200 dark:border-slate-700 pt-4">
                                            <img src={review.avatarUrl} alt={review.authorName} className="w-10 h-10 rounded-full object-cover"/>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">{review.authorName}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{review.authorTitle}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default OurUsersPage;