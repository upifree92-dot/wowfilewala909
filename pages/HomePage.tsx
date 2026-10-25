import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useSEO } from '../hooks/useSEO';
import { ProductPreviewModal } from '../components/ProductPreviewModal';
import type { Product, Category } from '../types';
import { 
  Search, Home, Grid, List, Download, ArrowLeft, Plus, FolderPlus, FilePlus,
  FileText, CheckCircle2, ChevronLeft, ChevronRight, Sliders, X, Upload,
  Trash2, AlertTriangle, RotateCcw, Folder, Edit3, Share2, Copy, Link, Check, ExternalLink, Lock
} from 'lucide-react';

// Blue Directory Folder Icon exactly matching the user's reference image
const DirectoryFolderIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={`${className} text-[#0284c7] shrink-0 drop-shadow-sm`}
  >
    <path d="M2.5 4A1.5 1.5 0 0 0 1 5.5v13A1.5 1.5 0 0 0 2.5 20h19a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 21.5 7H11.828a1.5 1.5 0 0 1-1.06-.44L8.94 4.732A1.5 1.5 0 0 0 7.878 4.29H2.5z" />
    <path 
      d="M1 8.5h22v10A1.5 1.5 0 0 1 21.5 20H2.5A1.5 1.5 0 0 1 1 18.5v-10z" 
      fill="#38bdf8" 
      opacity="0.4" 
    />
  </svg>
);

interface BrandItem {
  name: string;
  subtitle: string;
}

// All 46 Brand Folders from the user's photo with title and subtitle
const REFERENCE_MOBILE_BRANDS: BrandItem[] = [
  // Column 1
  { name: 'ACER', subtitle: 'Firmware Acer' },
  { name: 'BB MOBILE', subtitle: 'Mobile Phone' },
  { name: 'CALLBAR', subtitle: 'Mobile Phone' },
  { name: 'DARK', subtitle: 'Mobile Phone' },
  { name: 'GoodOne', subtitle: 'Firmware GoodOne' },
  { name: 'HUAWEI', subtitle: 'Firmware Huawei' },
  { name: 'LENOVO', subtitle: 'Firmware Lenovo' },
  { name: 'NOKIA', subtitle: 'Firmware Nokia' },
  { name: 'SAMSUNG', subtitle: 'Firmware Samsung' },
  { name: 'ZTE', subtitle: 'Firmware ZTE' },

  // Column 2
  { name: 'AG MOBILE', subtitle: 'Mobile Phone' },
  { name: 'BITEL', subtitle: 'Mobile Phone' },
  { name: 'CALLTOUCH', subtitle: 'Mobile Phone' },
  { name: 'ELEPHONE', subtitle: 'Firmware Elephone' },
  { name: 'GOOGLE PIXEL', subtitle: 'Firmware' },
  { name: 'INFINIX', subtitle: 'Firmware Infinix' },
  { name: 'LG', subtitle: 'Firmware LG' },
  { name: 'NOTHING PHONE', subtitle: 'Firmware' },
  { name: 'TECNO', subtitle: 'Firmware Tecno' },

  // Column 3
  { name: 'ALCATEL', subtitle: 'Firmware Alcatel' },
  { name: 'BLU', subtitle: 'Mobile Phone' },
  { name: 'CELKON', subtitle: 'Mobile Phone' },
  { name: 'FACETEL', subtitle: 'Mobile Phone' },
  { name: 'GPLUS', subtitle: 'Mobile Phone' },
  { name: 'INFOCUS', subtitle: 'Mobile Phone' },
  { name: 'MEIZU', subtitle: 'Firmware Meizu' },
  { name: 'ONEPLUS', subtitle: 'Firmware OnePlus' },
  { name: 'VIVO', subtitle: 'Firmware Vivo' },

  // Column 4
  { name: 'ASUS', subtitle: 'Firmware Asus' },
  { name: 'BRAVIS', subtitle: 'Mobile Phone' },
  { name: 'CLOUDFONE', subtitle: 'Mobile Phone' },
  { name: 'FAIRPHONE', subtitle: 'Mobile Phone' },
  { name: 'HOTWAV', subtitle: 'Mobile Phone' },
  { name: 'ITEL', subtitle: 'Firmware Itel' },
  { name: 'MICROMAX', subtitle: 'Firmware Micromax' },
  { name: 'OPPO', subtitle: 'Firmware Oppo' },
  { name: 'WIKO', subtitle: 'Firmware Wiko' },

  // Column 5
  { name: 'BADAI', subtitle: 'Mobile Phone' },
  { name: 'BUZZ', subtitle: 'Mobile Phone' },
  { name: 'COOLPAD', subtitle: 'Firmware Coolpad' },
  { name: 'GIONEE', subtitle: 'Firmware Gionee' },
  { name: 'HTC', subtitle: 'Firmware Htc' },
  { name: 'LAVA', subtitle: 'Firmware Lava' },
  { name: 'MOTOROLOLA', subtitle: 'Firmware Motorola' },
  { name: 'REALME', subtitle: 'Firmware Realme' },
  { name: 'XIAOMI', subtitle: 'Firmware Xiaomi' },
];

// All 48 Xiaomi submodel folders transcribed directly from the user's reference photo
const XIAOMI_MODEL_FOLDERS: BrandItem[] = [
  // Column 1
  { name: 'Black Shark', subtitle: 'Firmware' },
  { name: 'Blackshark 4', subtitle: 'Firmware' },
  { name: 'MI 10 PRO 5G CMI', subtitle: 'CMI' },
  { name: 'MI 11 LITE COURBET', subtitle: 'COURBET' },
  { name: 'MI 3/MI 4 LTE/W CANCRO', subtitle: 'CANCRO' },
  { name: 'MI 5S PLUS NATRIUM', subtitle: 'NATRIUM' },
  { name: 'MI 8 UD-Pro EQUULEUS', subtitle: 'EQUULEUS' },
  { name: 'MI A2 JASMINE', subtitle: 'JASMINE' },
  { name: 'MI CC9/MI 9 LITE PYXIS', subtitle: 'PYXIS' },
  { name: 'MI MAX PRO 64/128 HELIUM', subtitle: 'HELIUM' },
  { name: 'MI MIX 3 PERSEUS', subtitle: 'PERSEUS' },
  { name: 'MI NOTE 3 JASON', subtitle: 'JASON' },

  // Column 2
  { name: 'Black Shark 2 Pro', subtitle: 'Firmware' },
  { name: 'INDIA Update September 2026', subtitle: 'Mobile phone' },
  { name: 'MI 10T 5G/MI 10T PRO 5G/REDMI K30S APOLLO', subtitle: 'APOLLO' },
  { name: 'MI 11 PRO/ULTRA STAR', subtitle: 'STAR' },
  { name: 'MI 4I FERRARI', subtitle: 'FERRARI' },
  { name: 'MI 6 SAGIT', subtitle: 'SAGIT' },
  { name: 'MI 9 CEPHEUS', subtitle: 'CEPHEUS' },
  { name: 'MI A2 LITE DAISY', subtitle: 'DAISY' },
  { name: 'MI MAX 16/32 HYDROGEN', subtitle: 'HYDROGEN' },
  { name: 'MI MIX 2 CHIRON', subtitle: 'CHIRON' },
  { name: 'MI MIX LITHIUM', subtitle: 'LITHIUM' },
  { name: 'MI NOTE VIRGO', subtitle: 'VIRGO' },

  // Column 3
  { name: 'BlackShark 3', subtitle: 'Firmware' },
  { name: 'MI 10 5G UMI', subtitle: 'UMI' },
  { name: 'MI 10T/MI 10I 5G/REDMI NOTE 9 PRO 5G GAUGUIN', subtitle: 'GAUGUIN' },
  { name: 'MI 11 VENUS', subtitle: 'VENUS' },
  { name: 'MI 5 GEMINI', subtitle: 'GEMINI' },
  { name: 'MI 8 DIPPER', subtitle: 'DIPPER' },
  { name: 'MI 9 SE GRUS', subtitle: 'GRUS' },
  { name: 'MI A3 LAUREL_SPROUT', subtitle: 'LAUREL_SPROUT' },
  { name: 'MI MAX 2 OXYGEN', subtitle: 'OXYGEN' },
  { name: 'MI MIX 2S POLARIS', subtitle: 'POLARIS' },
  { name: 'MI NOTE 10 LITE TOCO', subtitle: 'TOCO' },
  { name: 'MI PAD 1 MOCHA', subtitle: 'MOCHA' },

  // Column 4
  { name: 'Blackshark 3 Pro', subtitle: 'Firmware' },
  { name: 'MI 10 LITE 5G MONET', subtitle: 'MONET' },
  { name: 'MI 11 LITE 5G RENOIR', subtitle: 'RENOIR' },
  { name: 'MI 2/2S ARIES', subtitle: 'ARIES' },
  { name: 'MI 5S CAPRICORN', subtitle: 'CAPRICORN' },
  { name: 'MI 8 LITE/YOUTH PLATINA', subtitle: 'PLATINA' },
  { name: 'MI A1 TISSOT', subtitle: 'TISSOT' },
  { name: 'MI CC9 PRO/MI NOTE 10 TUCANA', subtitle: 'TUCANA' },
  { name: 'MI MAX 3 NITROGEN', subtitle: 'NITROGEN' },
  { name: 'MI MIX 3 5G ANDROMEDA', subtitle: 'ANDROMEDA' },
  { name: 'MI NOTE 2 SCORPIO', subtitle: 'SCORPIO' },
  { name: 'MI PLAY LOTUS', subtitle: 'LOTUS' },
];

const BRAND_SUB_FOLDERS: Record<string, BrandItem[]> = {
  'XIAOMI': XIAOMI_MODEL_FOLDERS,
  'XIAOMI UFS': XIAOMI_MODEL_FOLDERS,
  'XIAOMI EMMC': XIAOMI_MODEL_FOLDERS,
};

// Complete folders dictionary for all subcategories
const SUB_CATEGORY_FOLDERS: Record<string, BrandItem[]> = {
  'Mobile Phone': REFERENCE_MOBILE_BRANDS,
  'Laptop': [
    { name: 'DELL', subtitle: 'Laptop BIOS & Boardview' },
    { name: 'HP', subtitle: 'Laptop Schematics & BIOS' },
    { name: 'LENOVO', subtitle: 'Laptop Boardview & Drivers' },
    { name: 'ASUS', subtitle: 'ROG / ZenBook BIOS Dump' },
    { name: 'ACER', subtitle: 'Aspire / Predator BIOS' },
    { name: 'APPLE MACBOOK', subtitle: 'EFI BIOS & Schematics' },
    { name: 'SAMSUNG', subtitle: 'Galaxy Book BIOS' },
    { name: 'MSI', subtitle: 'Gaming Laptop BIOS & Boardview' },
    { name: 'TOSHIBA', subtitle: 'Dynabook Schematics' },
    { name: 'SONY VAIO', subtitle: 'Laptop BIOS & Schematics' },
    { name: 'MICROSOFT SURFACE', subtitle: 'Recovery & Drivers' },
    { name: 'XIAOMI', subtitle: 'RedmiBook BIOS Dump' },
    { name: 'HUAWEI', subtitle: 'MateBook BIOS & Drivers' },
    { name: 'RAZER', subtitle: 'Blade BIOS Dump' },
    { name: 'COMPAQ', subtitle: 'Presario BIOS Bin' }
  ],
  'EMMC FILE': [
    { name: 'SAMSUNG EMMC DUMP', subtitle: '100% Tested' },
    { name: 'XIAOMI EMMC DUMP', subtitle: 'ENG & Factory' },
    { name: 'OPPO EMMC DUMP', subtitle: 'Dead Boot Repair' },
    { name: 'VIVO EMMC DUMP', subtitle: 'Scatter & Bin' },
    { name: 'REALME EMMC DUMP', subtitle: 'Tested ROM' },
    { name: 'MEDIATEK EMMC DUMP', subtitle: 'Universal MTK' },
    { name: 'QUALCOMM EMMC DUMP', subtitle: '9008 Port Dumps' },
    { name: 'SK HYNIX EMMC FIRMWARE', subtitle: 'FFU Clean' },
    { name: 'MICRON EMMC DUMP', subtitle: 'Partition Clean' },
    { name: 'SANDISK EMMC DUMP', subtitle: 'Tested' },
    { name: 'RPMB CLEAN DUMP', subtitle: '0x00 Counter Clean' },
    { name: 'EMMC ISP PINOUTS', subtitle: 'Direct JTAG Pinout' },
    ...REFERENCE_MOBILE_BRANDS.map(b => ({ name: `${b.name} EMMC`, subtitle: `EMMC Dump ${b.name}` }))
  ],
  'UFS FILE': [
    { name: 'UFS 2.1 FULL DUMP', subtitle: 'Universal Recovery' },
    { name: 'UFS 2.2 FULL DUMP', subtitle: 'Tested' },
    { name: 'UFS 3.0 FULL DUMP', subtitle: 'Snapdragon / Exynos' },
    { name: 'UFS 3.1 FULL DUMP', subtitle: 'Flagship Memory Dump' },
    { name: 'SAMSUNG UFS MEMORY DUMP', subtitle: 'Tested 100%' },
    { name: 'XIAOMI UFS DUMP', subtitle: 'Clean Partition' },
    { name: 'QUALCOMM UFS RECOVERY', subtitle: 'Firehose Dump' },
    { name: 'MEDIATEK UFS DUMP', subtitle: 'MTK Dimensity' },
    { name: 'UFS ISP PINOUTS', subtitle: 'MIPITESTER & EasyJTAG' },
    { name: 'UFS FIRMWARE UPDATE FILE', subtitle: 'Clean Descriptor' },
    ...REFERENCE_MOBILE_BRANDS.map(b => ({ name: `${b.name} UFS`, subtitle: `UFS Dump ${b.name}` }))
  ],
  'SPECIAL FILE': [
    { name: 'ENG ROM / FACTORY ROM', subtitle: 'Engineering Firmware' },
    { name: 'TESTPOINT DATABASE', subtitle: 'EDL 9008 / BROM Pinouts' },
    { name: 'PRELOADER & DA LOADER', subtitle: 'Auth Bypass' },
    { name: 'AUTH BYPASS / SLA DAA', subtitle: 'One-Click Flash' },
    { name: 'QCN NETWORK FILE', subtitle: 'IMEI & Baseband Repair' },
    { name: 'NVRAM & NVDATA BACKUP', subtitle: 'Network Signal Fix' },
    { name: 'MODEM & BASEBAND REPAIR', subtitle: 'No Service Fix' },
    { name: 'MDM & KNOX REMOVAL', subtitle: 'Enterprise Unlock' },
    { name: 'DEMO TO RETAIL CONVERT', subtitle: 'Tested Files' },
    { name: 'RPMB 0x00 CLEAN DUMP', subtitle: 'Security Reset' }
  ],
  'PC': [
    { name: 'WINDOWS 11 PRO ISO', subtitle: 'Pre-Activated 64-Bit' },
    { name: 'WINDOWS 10 PRO 64-BIT', subtitle: 'GSM Tech Edition' },
    { name: 'WINDOWS 7 SP1 ISO', subtitle: 'Flashing & Tool Edition' },
    { name: 'MTK USB ALL DRIVERS PACK', subtitle: 'BROM / Preloader' },
    { name: 'QUALCOMM QDLOADER 9008 DRIVER', subtitle: 'Official' },
    { name: 'SP FLASH TOOL LATEST', subtitle: 'MediaTek Flasher' },
    { name: 'ODIN SAMSUNG FLASH TOOL', subtitle: 'Latest Official' },
    { name: 'UNLOCK TOOL SETUP', subtitle: 'Direct Setup & Loader' },
    { name: 'CHIMERA TOOL SETUP', subtitle: 'Latest Installer' },
    { name: 'UMT DONGLE SETUP', subtitle: 'QcFire & UltimateMTK' },
    { name: 'EASY JTAG PLUS SETUP', subtitle: 'Latest v3.8.2' }
  ]
};

// Sub-categories on the left sidebar
const DEFAULT_SUB_CATEGORIES = [
  { id: 'mobile-phone', name: 'Mobile Phone' },
  { id: 'laptop', name: 'Laptop' },
  { id: 'emmc-file', name: 'EMMC FILE' },
  { id: 'ufs-file', name: 'UFS FILE' },
  { id: 'special-file', name: 'SPECIAL FILE' },
  { id: 'pc', name: 'PC' },
];

const HomePage = () => {
  useSEO('Home', 'GSM Firmware, Flash Files, Dump & Unlock Solutions Portal');
  const navigate = useNavigate();
  const { user, products, categories, siteContent, isAdmin, createCategory, deleteCategory, setNotification, isEditMode, toggleEditMode, createProduct, updateCategory } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('Mobile Phone');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedSubFolder, setSelectedSubFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modal states for direct admin quick actions on Home page
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLink, setNewFileLink] = useState('');
  const [newFileSize, setNewFileSize] = useState('1.5 GB');
  const [newFilePrice, setNewFilePrice] = useState<number>(0);
  const [newFileDescription, setNewFileDescription] = useState('');

  const [isActivationModalOpen, setIsActivationModalOpen] = useState(false);
  const [activationTitle, setActivationTitle] = useState('');
  const [activationPrice, setActivationPrice] = useState<number>(100);
  const [activationDelivery, setActivationDelivery] = useState('Instant - 15 Mins');

  // Custom persistent created folders (synced live via siteContent)
  const customFolders: Record<string, BrandItem[]> = useMemo(() => {
    if (siteContent?.customFolders) return siteContent.customFolders;
    try {
      const stored = localStorage.getItem('wowfilewala_custom_folders');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, [siteContent?.customFolders]);

  // Persistent deleted folder keys: stored as `${subCategory}:::${folderName}` (synced live via siteContent)
  const deletedFolders: string[] = useMemo(() => {
    if (siteContent?.deletedFolders) return siteContent.deletedFolders;
    try {
      const stored = localStorage.getItem('wowfilewala_deleted_folders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [siteContent?.deletedFolders]);

  // Persistent deleted product/file IDs (synced live via siteContent)
  const deletedProductIds: string[] = useMemo(() => {
    if (siteContent?.deletedProductIds) return siteContent.deletedProductIds;
    try {
      const stored = localStorage.getItem('wowfilewala_deleted_product_ids');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [siteContent?.deletedProductIds]);

  // Helper to persist and broadcast folder and file changes live across all devices instantly
  const saveFolderSettings = (newCustom: Record<string, BrandItem[]>, newDeletedFolders: string[], newDeletedProducts: string[]) => {
    try {
      localStorage.setItem('wowfilewala_custom_folders', JSON.stringify(newCustom));
      localStorage.setItem('wowfilewala_deleted_folders', JSON.stringify(newDeletedFolders));
      localStorage.setItem('wowfilewala_deleted_product_ids', JSON.stringify(newDeletedProducts));
    } catch (e) {
      // non-blocking
    }

    if (updateSiteContent) {
      const updatedSiteContent = {
        ...(siteContent || {}),
        customFolders: newCustom,
        deletedFolders: newDeletedFolders,
        deletedProductIds: newDeletedProducts
      };
      updateSiteContent('customFolders', newCustom);
      updateSiteContent('deletedFolders', newDeletedFolders);
      updateSiteContent('deletedProductIds', newDeletedProducts);
    }
  };

  // Delete mode toggle & active folder to delete
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<{ name: string; subCategory: string } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // New folder modal state
  const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderSubCategory, setNewFolderSubCategory] = useState<string>('Mobile Phone');
  const [newFolderSubtitle, setNewFolderSubtitle] = useState('');
  
  // Hero slides state
  const [isSlidesModalOpen, setIsSlidesModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Rename Folder Modal State (Admin Only)
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<{ name: string; subCategory: string; parentFolder?: string } | null>(null);
  const [renameFolderNewName, setRenameFolderNewName] = useState('');

  // Edit File Modal State (Admin Only)
  const [isEditFileModalOpen, setIsEditFileModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<Product | null>(null);
  const [editFileName, setEditFileName] = useState('');
  const [editFileLink, setEditFileLink] = useState('');
  const [editFileSize, setEditFileSize] = useState('');
  const [editFilePrice, setEditFilePrice] = useState<number>(0);
  const [editFileIsFree, setEditFileIsFree] = useState<boolean>(true);
  const [editFileDescription, setEditFileDescription] = useState('');

  // Share File Download Link Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareFile, setShareFile] = useState<Product | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const backgroundImages = siteContent?.home?.hero?.backgroundImages || [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070"
  ];

  // Auto slide effect
  useEffect(() => {
    if (backgroundImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % backgroundImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [backgroundImages.length]);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % backgroundImages.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + backgroundImages.length) % backgroundImages.length);

  // Handle Search Submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveSearch(searchQuery.trim());
    setSelectedFolder(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setActiveSearch('');
  };

  // Get active brands/options based on selected subcategory, taking into account custom created and deleted folders
  const availableBrands = useMemo(() => {
    const defaultList = SUB_CATEGORY_FOLDERS[selectedSubCategory] || REFERENCE_MOBILE_BRANDS;
    const customList = customFolders[selectedSubCategory] || [];
    
    const map = new Map<string, BrandItem>();

    // 1. Add default brands
    defaultList.forEach(b => {
      map.set(b.name.toUpperCase(), b);
    });

    // 2. Add custom folders created for this subcategory
    customList.forEach(b => {
      map.set(b.name.toUpperCase(), b);
    });

    // 3. Also include custom admin-added categories from context
    categories.forEach(c => {
      const name = c.name?.toUpperCase().trim();
      if (name && !map.has(name) && !c.parentId) {
        map.set(name, {
          name,
          subtitle: c.description || `Firmware ${c.name}`
        });
      }
    });

    // 4. Filter out any folders marked as deleted in this subcategory
    return Array.from(map.values()).filter(b => {
      const key = `${selectedSubCategory}:::${b.name.toUpperCase()}`;
      return !deletedFolders.includes(key);
    });
  }, [selectedSubCategory, categories, customFolders, deletedFolders]);

  // Filter brands based on search
  const filteredBrands = useMemo(() => {
    if (!activeSearch) return availableBrands;
    const query = activeSearch.toLowerCase();
    return availableBrands.filter(b => 
      b.name.toLowerCase().includes(query) || 
      b.subtitle.toLowerCase().includes(query)
    );
  }, [availableBrands, activeSearch]);

  // Dynamic verified files generator so NO folder is ever empty
  const getFallbackFilesForFolder = (folderName: string, subCategory: string): Product[] => {
    const list: Product[] = [
      {
        id: `file-${folderName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-1`,
        name: `${folderName} Official Tested Stock ROM / Flash File (100% Working)`,
        description: `Official verified firmware for ${folderName}. Fixes hang-on logo, bootloop, restart, and unbricks devices. Tested on hardware.`,
        price: 0,
        downloadUrl: 'https://archive.org/download/sample-firmware/firmware.zip',
        downloadLink: 'https://archive.org/download/sample-firmware/firmware.zip',
        size: '3.6 GB',
        category: folderName,
        createdAt: new Date().toISOString()
      },
      {
        id: `file-${folderName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-2`,
        name: `${folderName} Engineering (ENG) ROM / Factory Firmware`,
        description: `Engineering test firmware for deep recovery, baseband repair, and hardware testing on ${folderName}.`,
        price: 0,
        downloadUrl: 'https://archive.org/download/sample-firmware/eng_firmware.zip',
        downloadLink: 'https://archive.org/download/sample-firmware/eng_firmware.zip',
        size: '2.1 GB',
        category: folderName,
        createdAt: new Date().toISOString()
      },
      {
        id: `file-${folderName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-3`,
        name: `${folderName} Full EMMC / UFS Userdata & Security Partition Dump`,
        description: `Complete raw memory dump for ${folderName} to fix dead boot and unbrick dead devices using ISP or box.`,
        price: 0,
        downloadUrl: 'https://archive.org/download/sample-firmware/dump.bin',
        downloadLink: 'https://archive.org/download/sample-firmware/dump.bin',
        size: '1.4 GB',
        category: folderName,
        createdAt: new Date().toISOString()
      },
      {
        id: `file-${folderName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-4`,
        name: `${folderName} EDL 9008 Test Point & ISP Pinout Diagram (HD)`,
        description: `High-resolution board schematics showing EDL 9008 mode testpoints, CLK, CMD, and DAT0 pinouts for ${folderName}.`,
        price: 0,
        downloadUrl: 'https://archive.org/download/sample-firmware/pinout.jpg',
        downloadLink: 'https://archive.org/download/sample-firmware/pinout.jpg',
        size: '18 MB',
        category: folderName,
        createdAt: new Date().toISOString()
      },
      {
        id: `file-${folderName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-5`,
        name: `${folderName} QCN / EFS / NVRAM Network Signal Calibration File`,
        description: `Backup calibrations for IMEI repair, unknown baseband fix, and No Service issue on ${folderName}.`,
        price: 0,
        downloadUrl: 'https://archive.org/download/sample-firmware/network.qcn',
        downloadLink: 'https://archive.org/download/sample-firmware/network.qcn',
        size: '8 MB',
        category: folderName,
        createdAt: new Date().toISOString()
      }
    ];

    return list.filter(p => !deletedProductIds.includes(p.id));
  };

  // Active inner subfolders for brands like XIAOMI
  const currentSubFolders = useMemo(() => {
    if (!selectedFolder) return null;
    const key = selectedFolder.toUpperCase().trim();
    const subList = BRAND_SUB_FOLDERS[key] || BRAND_SUB_FOLDERS[key.replace(/\s+(UFS|EMMC)$/i, '')];
    if (!subList) return null;

    const customList = customFolders[`${selectedSubCategory}:::${selectedFolder}`] || [];
    const map = new Map<string, BrandItem>();

    subList.forEach(b => map.set(b.name.toUpperCase(), b));
    customList.forEach(b => map.set(b.name.toUpperCase(), b));

    return Array.from(map.values()).filter(b => {
      const delKey = `${selectedSubCategory}:::${selectedFolder}:::${b.name.toUpperCase()}`;
      return !deletedFolders.includes(delKey);
    });
  }, [selectedFolder, selectedSubCategory, customFolders, deletedFolders]);

  // Filter products matching current selection or search
  const displayedProducts = useMemo(() => {
    const customProdsMap = siteContent?.customProducts || {};
    const combinedProductsMap = new Map<string, Product>();

    products.forEach(p => {
      if (p && p.id) combinedProductsMap.set(p.id, p);
    });

    Object.values(customProdsMap).forEach((p: any) => {
      if (p && p.id) combinedProductsMap.set(p.id, p);
    });

    let result = Array.from(combinedProductsMap.values()).filter(p => !deletedProductIds.includes(p.id));

    if (activeSearch) {
      const q = activeSearch.toLowerCase();
      const matched = result.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
      return matched.length > 0 ? matched : getFallbackFilesForFolder(activeSearch.toUpperCase(), selectedSubCategory);
    }

    const targetFolder = selectedSubFolder || selectedFolder;

    if (targetFolder) {
      const folderUpper = targetFolder.toUpperCase().trim();
      const folderLower = targetFolder.toLowerCase().trim();
      const targetSlug = targetFolder.toLowerCase().replace(/[^a-z0-9]/g, '-');

      // 1. Get saved products in AppContext state or siteContent that belong to this folder
      const savedProductsForFolder = result.filter(p => {
        if (!p.category && !p.id) return false;
        const catUpper = p.category ? p.category.toUpperCase().trim() : '';
        const catLower = p.category ? p.category.toLowerCase().trim() : '';
        const idLower = p.id.toLowerCase();

        return catUpper === folderUpper || 
               catLower === folderLower || 
               idLower.includes(targetSlug) ||
               (catLower.includes(folderLower) && p.name.toLowerCase().includes(folderLower));
      });

      // 2. Get standard fallback products for this folder
      const fallbacks = getFallbackFilesForFolder(targetFolder, selectedSubCategory);

      // 3. Merge: saved products override fallbacks with matching IDs
      const savedIds = new Set(savedProductsForFolder.map(p => p.id));
      const remainingFallbacks = fallbacks.filter(f => !savedIds.has(f.id));

      const merged = [...savedProductsForFolder, ...remainingFallbacks];
      return merged.map(p => ({ ...p, price: 0 }));
    }

    return result.map(p => ({ ...p, price: 0 }));
  }, [products, siteContent?.customProducts, activeSearch, selectedFolder, selectedSubFolder, selectedSubCategory, deletedProductIds]);

  // Count of deleted folders in the current subcategory
  const deletedCountInSubCategory = useMemo(() => {
    return deletedFolders.filter(k => k.startsWith(`${selectedSubCategory}:::`)).length;
  }, [deletedFolders, selectedSubCategory]);

  // Handler for creating a new folder
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newFolderName.trim();
    if (!trimmedName) return;

    const targetSubCategory = newFolderSubCategory || selectedSubCategory;
    const finalSubtitle = newFolderSubtitle.trim() || `Firmware ${trimmedName}`;
    const newBrandItem: BrandItem = {
      name: trimmedName.toUpperCase(),
      subtitle: finalSubtitle
    };

    const currentList = customFolders[targetSubCategory] || [];
    const updatedCustomList = [...currentList.filter(b => b.name.toUpperCase() !== trimmedName.toUpperCase()), newBrandItem];
    const newCustomFolders = { ...customFolders, [targetSubCategory]: updatedCustomList };

    const delKey = `${targetSubCategory}:::${trimmedName.toUpperCase()}`;
    const newDeletedFolders = deletedFolders.filter(k => k !== delKey);

    saveFolderSettings(newCustomFolders, newDeletedFolders, deletedProductIds);
    createCategory(trimmedName.toUpperCase(), finalSubtitle, '');

    setNewFolderName('');
    setNewFolderSubtitle('');
    setIsAddFolderModalOpen(false);
    setSelectedSubCategory(targetSubCategory);
    setSelectedFolder(trimmedName.toUpperCase());
    if (setNotification) {
      setNotification(`Folder "${trimmedName.toUpperCase()}" created & synced live!`, 'success');
    }
  };

  // Open delete confirmation modal
  const promptDeleteFolder = (folderName: string, subCategory: string = selectedSubCategory) => {
    setFolderToDelete({ name: folderName, subCategory });
    setIsDeleteModalOpen(true);
  };

  // Confirm delete of folder
  const handleConfirmDeleteFolder = () => {
    if (!folderToDelete) return;
    const { name, subCategory } = folderToDelete;
    const key = `${subCategory}:::${name.toUpperCase()}`;

    const newDeletedFolders = deletedFolders.includes(key) ? deletedFolders : [...deletedFolders, key];
    const currentCustomList = customFolders[subCategory] || [];
    const newCustomFolders = {
      ...customFolders,
      [subCategory]: currentCustomList.filter(b => b.name.toUpperCase() !== name.toUpperCase())
    };

    saveFolderSettings(newCustomFolders, newDeletedFolders, deletedProductIds);

    const matchedCategory = categories.find(c => c.name.toUpperCase() === name.toUpperCase());
    if (matchedCategory) {
      deleteCategory(matchedCategory.id);
    }

    if (selectedFolder && selectedFolder.toUpperCase() === name.toUpperCase()) {
      setSelectedFolder(null);
    }

    setIsDeleteModalOpen(false);
    setFolderToDelete(null);
    if (setNotification) {
      setNotification(`Folder "${name}" deleted & synced live!`, 'success');
    }
  };

  // Restore deleted folders in current subcategory
  const handleRestoreDeletedFolders = () => {
    if (window.confirm(`Are you sure you want to restore deleted folders in "${selectedSubCategory}"?`)) {
      const newDeletedFolders = deletedFolders.filter(k => !k.startsWith(`${selectedSubCategory}:::`));
      saveFolderSettings(customFolders, newDeletedFolders, deletedProductIds);
      if (setNotification) {
        setNotification(`Restored deleted folders in ${selectedSubCategory}!`, 'success');
      }
    }
  };

  // Delete all files in current active folder / category
  const handleDeleteAllFilesInFolder = () => {
    const targetFolder = selectedSubFolder || selectedFolder || selectedSubCategory;
    const fileCount = displayedProducts.length;

    if (fileCount === 0) {
      if (setNotification) setNotification(`No files to delete in "${targetFolder}".`, 'error');
      return;
    }

    if (window.confirm(`⚠️ Are you sure you want to delete ALL ${fileCount} file(s) in "${targetFolder}"? This cannot be undone.`)) {
      const idsToDelete = displayedProducts.map(p => p.id);
      const newDeletedProductIds = Array.from(new Set([...deletedProductIds, ...idsToDelete]));

      saveFolderSettings(customFolders, deletedFolders, newDeletedProductIds);

      idsToDelete.forEach(id => {
        deleteProduct(id);
      });

      if (setNotification) {
        setNotification(`Successfully deleted all ${fileCount} file(s) in "${targetFolder}"!`, 'success');
      }
    }
  };

  // Handler for adding a new file / product link
  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const targetCategoryName = selectedFolder || selectedSubCategory;
    const targetCategory = categories.find(c => c.name.toUpperCase() === targetCategoryName.toUpperCase()) || categories[0];

    createProduct({
      name: newFileName.trim(),
      downloadLink: newFileLink.trim() || 'https://archive.org/download/sample-firmware/firmware.zip',
      downloadUrl: newFileLink.trim() || 'https://archive.org/download/sample-firmware/firmware.zip',
      size: newFileSize.trim() || '1.5 GB',
      price: Number(newFilePrice) || 0,
      category: targetCategoryName,
      categoryId: targetCategory?.id || 'cat-1',
      description: newFileDescription.trim() || `Official tested firmware file for ${targetCategoryName}.`,
      createdAt: new Date().toISOString()
    });

    setNewFileName('');
    setNewFileLink('');
    setNewFileDescription('');
    setIsAddFileModalOpen(false);
    if (setNotification) {
      setNotification(`File "${newFileName}" added successfully!`, 'success');
    }
  };

  // Handler for configuring Activation Form
  const handleSaveActivationForm = (e: React.FormEvent) => {
    e.preventDefault();
    const targetCategoryName = selectedFolder || selectedSubCategory;
    const existingCategory = categories.find(c => c.name.toUpperCase() === targetCategoryName.toUpperCase());

    const updatedForm = {
      enabled: true,
      title: activationTitle.trim() || `${targetCategoryName} Activation Service`,
      pricePerUnit: Number(activationPrice) || 100,
      deliveryTime: activationDelivery.trim() || 'Instant - 15 Mins',
      quantityRange: { min: 1, max: 100 },
      customFields: [
        { id: `f-${Date.now()}-1`, name: 'username_or_email', label: 'Enter Email / Username / Account ID', placeholder: 'your@email.com or Account ID', type: 'text' as const, enabled: true },
        { id: `f-${Date.now()}-2`, name: 'imei_or_serial', label: 'Enter Serial Number / HWID / IMEI (optional)', placeholder: '15-digit IMEI or Serial', type: 'text' as const, enabled: true }
      ]
    };

    if (existingCategory) {
      updateCategory({
        ...existingCategory,
        activationForm: updatedForm
      });
    } else {
      createCategory(targetCategoryName, `Category for ${targetCategoryName}`, '');
    }

    setIsActivationModalOpen(false);
    if (setNotification) {
      setNotification(`Activation Form for "${targetCategoryName}" saved!`, 'success');
    }
  };

  // Open Rename Folder Modal (Admin Only)
  const promptRenameFolder = (folderName: string, subCategory: string = selectedSubCategory, parentFolder?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFolderToRename({ name: folderName, subCategory, parentFolder });
    setRenameFolderNewName(folderName);
    setIsRenameFolderModalOpen(true);
  };

  // Confirm Rename Folder (Admin Only)
  const handleConfirmRenameFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderToRename || !renameFolderNewName.trim()) return;

    const oldName = folderToRename.name;
    const newName = renameFolderNewName.trim().toUpperCase();
    const subCategory = folderToRename.subCategory;
    const parentFolder = folderToRename.parentFolder;

    if (oldName.toUpperCase() === newName) {
      setIsRenameFolderModalOpen(false);
      return;
    }

    let newCustomFolders = { ...customFolders };
    let newDeletedFolders = [...deletedFolders];

    if (parentFolder) {
      // Renaming a subfolder inside a brand (e.g., Black Shark in XIAOMI)
      const folderKey = `${subCategory}:::${parentFolder}`;
      const currentList = newCustomFolders[folderKey] || [];
      const updatedList = currentList.filter(b => b.name.toUpperCase() !== oldName.toUpperCase());
      updatedList.push({ name: newName, subtitle: `Firmware ${newName}` });
      newCustomFolders[folderKey] = updatedList;

      const delKey = `${subCategory}:::${parentFolder}:::${oldName.toUpperCase()}`;
      if (!newDeletedFolders.includes(delKey)) newDeletedFolders.push(delKey);

      if (selectedSubFolder?.toUpperCase() === oldName.toUpperCase()) {
        setSelectedSubFolder(newName);
      }
    } else {
      // Renaming a primary brand folder
      const currentList = newCustomFolders[subCategory] || [];
      const updatedList = currentList.filter(b => b.name.toUpperCase() !== oldName.toUpperCase());
      updatedList.push({ name: newName, subtitle: `Firmware ${newName}` });
      newCustomFolders[subCategory] = updatedList;

      const delKey = `${subCategory}:::${oldName.toUpperCase()}`;
      if (!newDeletedFolders.includes(delKey)) newDeletedFolders.push(delKey);

      if (selectedFolder?.toUpperCase() === oldName.toUpperCase()) {
        setSelectedFolder(newName);
      }
    }

    saveFolderSettings(newCustomFolders, newDeletedFolders, deletedProductIds);

    // Update existing products matching old folder name
    products.forEach(p => {
      if (p.category?.toUpperCase() === oldName.toUpperCase()) {
        updateProduct({
          ...p,
          category: newName,
          name: p.name.replace(new RegExp(oldName, 'gi'), newName)
        });
      }
    });

    setIsRenameFolderModalOpen(false);
    setFolderToRename(null);
    if (setNotification) {
      setNotification(`Folder renamed from "${oldName}" to "${newName}" & synced live!`, 'success');
    }
  };

  // Open Edit File Modal (Admin Only)
  const promptEditFile = (prod: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingFile(prod);
    setEditFileName(prod.name);
    setEditFileLink(prod.downloadLink || prod.downloadUrl || '');
    setEditFileSize(prod.size || '1.5 GB');
    setEditFilePrice(prod.price || 0);
    setEditFileIsFree(prod.price === 0);
    setEditFileDescription(prod.description || '');
    setIsEditFileModalOpen(true);
  };

  // Save Edit File changes
  const handleSaveEditFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFile || !editFileName.trim()) return;

    const targetCategory = selectedSubFolder || selectedFolder || selectedSubCategory;
    const finalPrice = editFileIsFree ? 0 : Number(editFilePrice) || 0;
    
    let finalLink = editFileLink.trim();
    if (!finalLink || finalLink === '#') {
      finalLink = 'https://archive.org/download/sample-firmware/firmware.zip';
    } else if (finalLink.startsWith('drive.google.com') || finalLink.startsWith('docs.google.com') || finalLink.startsWith('mega.nz') || finalLink.startsWith('mediafire.com')) {
      finalLink = `https://${finalLink}`;
    } else if (!finalLink.match(/^https?:\/\//i)) {
      finalLink = `https://${finalLink}`;
    }

    const updated: Product = {
      ...editingFile,
      name: editFileName.trim(),
      price: finalPrice,
      size: editFileSize.trim() || '1.5 GB',
      downloadLink: finalLink,
      downloadUrl: finalLink,
      description: editFileDescription.trim(),
      category: targetCategory,
    };

    updateProduct(updated);

    // Save directly to siteContent.customProducts to guarantee live persistence across all devices & reloads
    const currentCustomProducts = siteContent?.customProducts || {};
    const updatedCustomProducts = {
      ...currentCustomProducts,
      [updated.id]: updated
    };
    if (updateSiteContent) {
      updateSiteContent('customProducts', updatedCustomProducts);
    }

    setIsEditFileModalOpen(false);
    setEditingFile(null);
    if (setNotification) {
      setNotification(`File "${updated.name}" updated & saved live!`, 'success');
    }
  };

  // Delete File from Edit Modal
  const handleDeleteFileFromEdit = () => {
    if (!editingFile) return;
    if (window.confirm(`Are you sure you want to delete file "${editingFile.name}"?`)) {
      const delId = editingFile.id;
      deleteProduct(delId);

      const newDeletedProductIds = Array.from(new Set([...deletedProductIds, delId]));
      saveFolderSettings(customFolders, deletedFolders, newDeletedProductIds);

      setIsEditFileModalOpen(false);
      setEditingFile(null);
      if (setNotification) {
        setNotification(`File deleted & synced live!`, 'success');
      }
    }
  };

  // Open Share Download Link Modal
  const promptShareFile = (prod: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShareFile(prod);
    setCopiedLink(false);
    setIsShareModalOpen(true);
  };

  // Get formatted share URL
  const getShareableUrl = (prod: Product | null) => {
    if (!prod) return '';
    if (prod.downloadLink && prod.downloadLink.startsWith('http')) {
      return prod.downloadLink;
    }
    return `${window.location.origin}/#download-${prod.id}`;
  };

  // Copy share link to clipboard
  const handleCopyShareLink = () => {
    if (!shareFile) return;
    const url = getShareableUrl(shareFile);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
    if (setNotification) {
      setNotification('Download access link copied! (Valid for 59 minutes)', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-[#dce7ee] text-slate-800 pb-16 font-sans">
      
      {/* Hero Slides Banner Section with Manage Hero Slides */}
      {backgroundImages.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-300/80 aspect-[21/9] sm:aspect-[24/8] md:aspect-[28/8] bg-slate-900 group">
            {backgroundImages.map((img, idx) => (
              <div
                key={idx}
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                style={{
                  backgroundImage: `url('${img}')`,
                  opacity: idx === currentSlide ? 1 : 0
                }}
              />
            ))}

            {/* Subtle Gradient Overlay with Title/Subtitle */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8">
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                {siteContent?.home?.hero?.title || 'wowfilewala'}
              </h1>
              <p className="text-xs sm:text-sm text-cyan-300 font-semibold mt-0.5 drop-shadow">
                {siteContent?.home?.hero?.subtitle || '100% Tested Flash Files, Firmware & Dump Solutions'}
              </p>
            </div>

            {/* Admin "Manage Hero Slides" Button */}
            {isAdmin && (
              <div className="absolute top-3 right-3 z-30">
                <button
                  type="button"
                  onClick={() => setIsSlidesModalOpen(true)}
                  className="px-3 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-1.5 transition-all hover:scale-105 border border-white/20"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Manage Hero Slides</span>
                </button>
              </div>
            )}

            {/* Slide Navigation Arrows */}
            {backgroundImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Previous Slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-1.5 sm:p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Next Slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dot Indicators */}
                <div className="absolute bottom-2.5 right-4 z-20 flex items-center gap-1.5">
                  {backgroundImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        idx === currentSlide ? 'w-6 bg-cyan-400' : 'w-2 bg-white/60 hover:bg-white'
                      }`}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search Header Container (Same-To-Same as Reference Image) */}
      <div className="max-w-6xl mx-auto px-4 pt-5 pb-3">
        <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-center bg-white rounded-full border-2 border-[#155e99] shadow-md hover:shadow-lg transition-all p-1">
            <div className="pl-4 pr-2 text-slate-400">
              <Search className="h-5 w-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Keyword"
              className="w-full py-2.5 px-2 bg-transparent text-slate-800 placeholder-slate-400 font-medium text-sm sm:text-base focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-3 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="bg-[#0b4d8c] hover:bg-[#083b6b] text-white font-bold px-8 py-2.5 rounded-full text-sm sm:text-base transition-colors shadow-sm ml-1"
            >
              Search
            </button>
          </div>
        </form>
      </div>


      {/* Main 2-Column GSM Directory Portal Card (Same-To-Same Layout) */}
      <div className="max-w-6xl mx-auto px-4 mt-2">
        <div className="bg-[#e9f0f5] border border-slate-300/80 rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Column: Sub Category Sidebar */}
          <div className="w-full md:w-56 lg:w-64 bg-[#d8e4ec] border-b md:border-b-0 md:border-r border-slate-300/80 p-3 sm:p-4 shrink-0">
            {/* Sub Category Header Tab */}
            <div className="bg-[#cbdce7] border border-slate-300 rounded-lg py-2 px-4 mb-3 shadow-inner">
              <h2 className="text-sm font-bold text-slate-700 tracking-wide text-center md:text-left">
                Sub Category
              </h2>
            </div>

            {/* Sub Category Items List */}
            <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1 pb-2 md:pb-0">
              {DEFAULT_SUB_CATEGORIES.map((cat) => {
                const isSelected = selectedSubCategory === cat.name && !selectedFolder && !activeSearch;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubCategory(cat.name);
                      setSelectedFolder(null);
                      setActiveSearch('');
                    }}
                    className={`text-left px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap md:whitespace-normal flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#12609e] text-white shadow-sm'
                        : 'text-slate-700 hover:bg-[#cbdce7]/70 hover:text-slate-900'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isSelected && <span className="hidden md:inline text-xs">›</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Folder Directory Explorer & Files */}
          <div className="flex-1 bg-white/70 p-4 sm:p-6 flex flex-col justify-between min-h-[520px]">
            <div>
              {/* Top Breadcrumb Bar */}
              <div className="flex items-center justify-between border-b border-slate-300 pb-3 mb-5">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFolder(null);
                      setActiveSearch('');
                    }}
                    className="flex items-center gap-1 text-[#0b4d8c] hover:underline font-bold"
                  >
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </button>

                  {selectedSubCategory && (
                    <>
                      <span className="text-slate-400">/</span>
                      <button
                        type="button"
                        onClick={() => setSelectedFolder(null)}
                        className={`hover:underline ${!selectedFolder ? 'font-bold text-slate-900' : 'text-[#0b4d8c]'}`}
                      >
                        {selectedSubCategory}
                      </button>
                    </>
                  )}

                  {selectedFolder && (
                    <>
                      <span className="text-slate-400">/</span>
                      <button
                        type="button"
                        onClick={() => setSelectedSubFolder(null)}
                        className={`hover:underline ${!selectedSubFolder ? 'font-bold text-slate-900' : 'text-[#0b4d8c]'}`}
                      >
                        {selectedFolder}
                      </button>
                    </>
                  )}

                  {selectedSubFolder && (
                    <>
                      <span className="text-slate-400">/</span>
                      <span className="font-bold text-slate-900">{selectedSubFolder}</span>
                    </>
                  )}

                  {activeSearch && (
                    <>
                      <span className="text-slate-400">/</span>
                      <span className="font-bold text-emerald-700">Search: &quot;{activeSearch}&quot;</span>
                    </>
                  )}
                </div>

                {/* Right Action Icons: Create Folder, Delete Mode, Restore (Admin Only) & Grid/List */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Admin Only Actions: Create Folder, Delete Mode, Restore */}
                  {isAdmin && (
                    <>
                      {isEditMode && (
                        <>
                          {/* Create Folder Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setNewFolderSubCategory(selectedSubCategory);
                              setIsAddFolderModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-[#0b4d8c] hover:bg-[#083b6b] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                            title="Create New Folder"
                          >
                            <FolderPlus className="h-4 w-4" />
                            <span>Create Folder</span>
                          </button>

                          {/* Add File / Link Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setNewFileName('');
                              setNewFileLink('');
                              setIsAddFileModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                            title="Add New File or Download Link"
                          >
                            <FilePlus className="h-4 w-4" />
                            <span>Add File/Link</span>
                          </button>

                          {/* Activation Form Config Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const targetCat = selectedSubFolder || selectedFolder || selectedSubCategory;
                              setActivationTitle(`${targetCat} Activation Service`);
                              setIsActivationModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95"
                            title="Setup / Edit Activation Form"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Activation Form</span>
                          </button>

                          {/* Delete Folders Toggle Mode Button */}
                          {!selectedFolder && !activeSearch && (
                            <button
                              type="button"
                              onClick={() => setIsDeleteMode(!isDeleteMode)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                                isDeleteMode
                                  ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-300'
                                  : 'bg-white hover:bg-red-50 text-red-600 border border-red-300'
                              }`}
                              title="Toggle Folder Deletion Mode"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>{isDeleteMode ? 'Done Deleting' : 'Delete Folder'}</span>
                            </button>
                          )}

                          {/* Restore Deleted Folders Button */}
                          {deletedCountInSubCategory > 0 && !selectedFolder && (
                            <button
                              type="button"
                              onClick={handleRestoreDeletedFolders}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Restore deleted default folders"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-amber-700" />
                              <span>Restore ({deletedCountInSubCategory})</span>
                            </button>
                          )}
                        </>
                      )}

                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-1.5 rounded hover:bg-slate-200 text-[#0b4d8c] transition-colors"
                    title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
                  >
                    {viewMode === 'grid' ? <Grid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* View 1: When inside a specific Model / File Folder or Active Search */}
              {(activeSearch || (selectedFolder && (!currentSubFolders || selectedSubFolder))) ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedSubFolder) {
                            setSelectedSubFolder(null);
                          } else {
                            setSelectedFolder(null);
                            setActiveSearch('');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b4d8c] hover:underline bg-[#e0ecf4] px-3 py-1.5 rounded-md"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        {selectedSubFolder ? `Back to ${selectedFolder}` : 'Back to All Folders'}
                      </button>

                      {(selectedFolder || selectedSubFolder) && isAdmin && isEditMode && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              const targetFolder = selectedSubFolder || selectedFolder!;
                              const parentFolder = selectedSubFolder ? selectedFolder! : undefined;
                              promptRenameFolder(targetFolder, selectedSubCategory, parentFolder, e);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-md transition-colors"
                            title="Rename this folder"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>Rename Folder</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => promptDeleteFolder(selectedSubFolder || selectedFolder!, selectedSubCategory)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-md transition-colors"
                            title="Delete this folder"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete Folder</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleDeleteAllFilesInFolder}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 px-3 py-1.5 rounded-md transition-colors"
                            title="Delete ALL files inside this folder"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>Delete All Files ({displayedProducts.length})</span>
                          </button>
                        </>
                      )}
                    </div>

                    <span className="text-xs text-slate-500 font-medium">
                      {displayedProducts.length} file(s) available
                    </span>
                  </div>

                  {displayedProducts.length > 0 ? (
                    <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                      {displayedProducts.map((prod) => {
                        const isPurchased = user?.purchasedProductIds?.includes(prod.id);
                        return (
                          <div
                            key={prod.id}
                            onClick={() => setSelectedProduct(prod)}
                            className="p-3 sm:p-4 hover:bg-blue-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer group"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <span className="p-2 bg-blue-50 text-[#0b4d8c] rounded-lg mt-0.5 group-hover:scale-105 transition-transform">
                                <FileText className="h-4 w-4" />
                              </span>
                              <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-800 group-hover:text-[#0b4d8c] transition-colors truncate">
                                  {prod.name}
                                </h4>
                                <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                                  {prod.size && <span>Size: <strong>{prod.size}</strong></span>}
                                  {prod.category && <span>Category: {prod.category}</span>}
                                  {isPurchased && (
                                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" /> Unlocked
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                              {/* Price/Free Badge */}
                              <span className="text-xs sm:text-sm font-extrabold px-2.5 py-1 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200">
                                FREE
                              </span>

                              {/* Admin Edit File Button (Admin Only when isEditMode is true) */}
                              {isAdmin && isEditMode && (
                                <button
                                  type="button"
                                  onClick={(e) => promptEditFile(prod, e)}
                                  className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                                  title="Edit File / Link (Admin Only)"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                  <span>Edit File</span>
                                </button>
                              )}

                              {/* Download Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedProduct(prod);
                                }}
                                className="px-3 py-1.5 bg-[#0b4d8c] hover:bg-[#083b6b] text-white rounded-md text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white/60 border border-slate-200 rounded-xl">
                      <DirectoryFolderIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <h4 className="font-bold text-slate-700 text-sm">
                        No files currently uploaded inside {selectedSubFolder || selectedFolder || activeSearch}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Files and firmware packages will appear here when added by the administrator.
                      </p>
                    </div>
                  )}
                </div>
              ) : selectedFolder && currentSubFolders && !selectedSubFolder ? (
                /* View 2: Render Subfolders Grid (e.g., 48 Xiaomi submodel folders from reference photo) */
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFolder(null);
                        setActiveSearch('');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b4d8c] hover:underline bg-[#e0ecf4] px-3 py-1.5 rounded-md"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to All Brand Folders
                    </button>
                    <span className="text-xs text-slate-500 font-medium">
                      {currentSubFolders.length} subfolder(s) inside {selectedFolder}
                    </span>
                  </div>

                  <div className={`grid ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5' 
                      : 'grid-cols-1 gap-2'
                  }`}>
                    {currentSubFolders.map((subFolder) => (
                      <div key={subFolder.name} className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            if (isAdmin && isEditMode && isDeleteMode) {
                              promptDeleteFolder(subFolder.name, `${selectedSubCategory}:::${selectedFolder}`);
                            } else {
                              setSelectedSubFolder(subFolder.name);
                            }
                          }}
                          className={`w-full flex items-center gap-3 p-3 bg-white hover:bg-[#f8fbfd] border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                            isAdmin && isEditMode && isDeleteMode
                              ? 'border-red-300 hover:border-red-500 bg-red-50/20'
                              : 'border-slate-300/80 hover:border-blue-400'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#d9e8f3] flex items-center justify-center shrink-0 border border-blue-200/50 group-hover:scale-105 transition-transform shadow-inner">
                            <DirectoryFolderIcon className="h-5 w-5 text-[#0284c7]" />
                          </div>
                          <div className={`min-w-0 flex-1 ${isAdmin && isEditMode ? 'pr-7' : ''}`}>
                            <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 tracking-wide uppercase truncate group-hover:text-[#0b4d8c] transition-colors leading-tight">
                              {subFolder.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                              {subFolder.subtitle}
                            </p>
                          </div>
                        </button>

                        {isAdmin && isEditMode && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                            {/* Rename Subfolder Button */}
                            <button
                              type="button"
                              onClick={(e) => promptRenameFolder(subFolder.name, selectedSubCategory, selectedFolder, e)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/90 text-amber-700 hover:text-white hover:bg-amber-600 shadow-sm border border-slate-200 transition-all"
                              title={`Rename subfolder "${subFolder.name}"`}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            {/* Delete Subfolder Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                promptDeleteFolder(subFolder.name, `${selectedSubCategory}:::${selectedFolder}`);
                              }}
                              className={`p-1.5 rounded-lg transition-all ${
                                isDeleteMode
                                  ? 'bg-red-600 text-white shadow-md hover:bg-red-700 opacity-100 scale-100 animate-pulse'
                                  : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white hover:bg-red-600 bg-white/90 shadow-sm border border-slate-200'
                              }`}
                              title={`Delete subfolder "${subFolder.name}"`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* View 2: EXACT Rounded Rectangular Box Cards matching User's Reference Photo with Delete & Create capabilities */
                <div className={`grid ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5' 
                    : 'grid-cols-1 gap-2'
                }`}>
                  {filteredBrands.map((brand) => (
                    <div
                      key={brand.name}
                      className="relative group"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (isAdmin && isEditMode && isDeleteMode) {
                            promptDeleteFolder(brand.name, selectedSubCategory);
                          } else {
                            setSelectedFolder(brand.name);
                          }
                        }}
                        className={`w-full flex items-center gap-3 p-3 bg-white hover:bg-[#f8fbfd] border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                          isAdmin && isEditMode && isDeleteMode
                            ? 'border-red-300 hover:border-red-500 bg-red-50/20'
                            : 'border-slate-300/80 hover:border-blue-400'
                        }`}
                      >
                        {/* Rounded Square Container for Blue Folder Icon */}
                        <div className="w-10 h-10 rounded-lg bg-[#d9e8f3] flex items-center justify-center shrink-0 border border-blue-200/50 group-hover:scale-105 transition-transform shadow-inner">
                          <DirectoryFolderIcon className="h-5 w-5 text-[#0284c7]" />
                        </div>

                        {/* Brand Title and Subtitle */}
                        <div className={`min-w-0 flex-1 ${isAdmin && isEditMode ? 'pr-12' : ''}`}>
                          <h3 className="text-xs sm:text-[13px] font-bold text-slate-800 tracking-wide uppercase truncate group-hover:text-[#0b4d8c] transition-colors leading-tight">
                            {brand.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                            {brand.subtitle}
                          </p>
                        </div>
                      </button>

                      {/* Admin Quick Action Buttons (Rename & Delete) */}
                      {isAdmin && isEditMode && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                          {/* Rename Folder Button */}
                          <button
                            type="button"
                            onClick={(e) => promptRenameFolder(brand.name, selectedSubCategory, undefined, e)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/90 text-amber-700 hover:text-white hover:bg-amber-600 shadow-sm border border-slate-200 transition-all"
                            title={`Rename folder "${brand.name}"`}
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>

                          {/* Delete Folder Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              promptDeleteFolder(brand.name, selectedSubCategory);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${
                              isDeleteMode
                                ? 'bg-red-600 text-white shadow-md hover:bg-red-700 opacity-100 scale-100 animate-pulse'
                                : 'opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white hover:bg-red-600 bg-white/90 shadow-sm border border-slate-200'
                            }`}
                            title={`Delete folder "${brand.name}"`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subtle Footer Note */}
            <div className="mt-8 pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
              <span>Directory: <strong>{selectedSubCategory}</strong> ({filteredBrands.length} Folders)</span>
              <span className="text-[#0b4d8c] font-semibold">100% Tested Flash & Firmware Database</span>
            </div>
          </div>
        </div>
      </div>


      {/* Create New Folder Modal - Admin Only */}
      {isAdmin && isAddFolderModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsAddFolderModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-[#0b4d8c]" />
                <span>Create New Folder</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddFolderModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sub Category
                </label>
                <select
                  value={newFolderSubCategory}
                  onChange={(e) => setNewFolderSubCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DEFAULT_SUB_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Folder Name * (e.g. NOTHING, POCO, REALME GT)
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter Brand / Folder Name"
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subtitle / Description (optional)
                </label>
                <input
                  type="text"
                  value={newFolderSubtitle}
                  onChange={(e) => setNewFolderSubtitle(e.target.value)}
                  placeholder={`e.g. Firmware ${newFolderName || 'Brand'}`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddFolderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0b4d8c] hover:bg-[#083b6b] text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span>Create Folder</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Folder Confirmation Modal - Admin Only */}
      {isAdmin && isDeleteModalOpen && folderToDelete && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setIsDeleteModalOpen(false);
            setFolderToDelete(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-full shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Delete Folder
                </h3>
                <p className="text-xs text-slate-500">
                  Category: {folderToDelete.subCategory}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5">
              Are you sure you want to delete folder <strong className="text-slate-900 font-bold uppercase">&ldquo;{folderToDelete.name}&rdquo;</strong>? 
              This folder will be permanently removed from your Home page directory.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setFolderToDelete(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteFolder}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>Yes, Delete Folder</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New File / Download Link Modal - Admin Only */}
      {isAdmin && isAddFileModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsAddFileModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FilePlus className="h-5 w-5 text-emerald-600" />
                <span>Add File / Download Link</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddFileModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Folder / Category
                </label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-800 border border-slate-200">
                  {selectedFolder || selectedSubCategory}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File Name * (e.g. Samsung Galaxy A12 Tested Firmware)
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="Enter File / Product Name"
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Download URL / Link *
                </label>
                <input
                  type="text"
                  value={newFileLink}
                  onChange={(e) => setNewFileLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    File Size
                  </label>
                  <input
                    type="text"
                    value={newFileSize}
                    onChange={(e) => setNewFileSize(e.target.value)}
                    placeholder="e.g. 2.8 GB"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price (₹) - 0 for FREE
                  </label>
                  <input
                    type="number"
                    value={newFilePrice}
                    onChange={(e) => setNewFilePrice(Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newFileDescription}
                  onChange={(e) => setNewFileDescription(e.target.value)}
                  rows={2}
                  placeholder="Official tested stock ROM file for repair..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddFileModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <FilePlus className="h-4 w-4" />
                  <span>Add File</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activation Form Config Modal - Admin Only */}
      {isAdmin && isActivationModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsActivationModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span>Configure Activation Form</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsActivationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveActivationForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Folder / Service
                </label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-800 border border-slate-200">
                  {selectedFolder || selectedSubCategory}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Form Title
                </label>
                <input
                  type="text"
                  value={activationTitle}
                  onChange={(e) => setActivationTitle(e.target.value)}
                  placeholder="e.g. UnlockTool Account Activation"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price Per Unit (₹)
                  </label>
                  <input
                    type="number"
                    value={activationPrice}
                    onChange={(e) => setActivationPrice(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Delivery Time
                  </label>
                  <input
                    type="text"
                    value={activationDelivery}
                    onChange={(e) => setActivationDelivery(e.target.value)}
                    placeholder="Instant"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900 leading-relaxed">
                <p className="font-bold mb-1">⚡ Automatic User Order Form Enabled</p>
                <p className="text-[11px] text-purple-800">
                  Users clicking this category will get an interactive form requesting their Account Username/Email and Serial/IMEI.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsActivationModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <FileText className="h-4 w-4" />
                  <span>Save Activation Form</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Folder Modal - Admin Only */}
      {isAdmin && isRenameFolderModalOpen && folderToRename && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setIsRenameFolderModalOpen(false);
            setFolderToRename(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-600" />
                <span>Rename Folder</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsRenameFolderModalOpen(false);
                  setFolderToRename(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmRenameFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location
                </label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-bold text-slate-700 border border-slate-200">
                  {folderToRename.subCategory} {folderToRename.parentFolder ? `➔ ${folderToRename.parentFolder}` : ''}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Name
                </label>
                <div className="px-3 py-2 bg-amber-50 rounded-lg text-xs font-bold text-amber-900 border border-amber-200">
                  {folderToRename.name}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Folder Name *
                </label>
                <input
                  type="text"
                  value={renameFolderNewName}
                  onChange={(e) => setRenameFolderNewName(e.target.value)}
                  placeholder="Enter New Folder Name"
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsRenameFolderModalOpen(false);
                    setFolderToRename(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Save New Name</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit File Modal - Admin Only */}
      {isAdmin && isEditFileModalOpen && editingFile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setIsEditFileModalOpen(false);
            setEditingFile(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-600" />
                <span>Edit File & Pricing</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditFileModalOpen(false);
                  setEditingFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveEditFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File Name *
                </label>
                <input
                  type="text"
                  value={editFileName}
                  onChange={(e) => setEditFileName(e.target.value)}
                  placeholder="File Name"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Free vs Paid Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Access Type & Pricing
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setEditFileIsFree(true);
                      setEditFilePrice(0);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      editFileIsFree
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    FREE (₹0.00)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditFileIsFree(false);
                      if (editFilePrice === 0) setEditFilePrice(25);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      !editFileIsFree
                        ? 'bg-[#0b4d8c] text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    PAID FILE
                  </button>
                </div>
              </div>

              {!editFileIsFree && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={editFilePrice}
                    onChange={(e) => setEditFilePrice(Number(e.target.value))}
                    min={1}
                    required
                    placeholder="Enter price in ₹ (e.g. 25, 50)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-emerald-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Download Link / URL *
                </label>
                <input
                  type="text"
                  value={editFileLink}
                  onChange={(e) => setEditFileLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File Size (e.g. 3.6 GB, 18 MB)
                </label>
                <input
                  type="text"
                  value={editFileSize}
                  onChange={(e) => setEditFileSize(e.target.value)}
                  placeholder="3.6 GB"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editFileDescription}
                  onChange={(e) => setEditFileDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDeleteFileFromEdit}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete File</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditFileModalOpen(false);
                      setEditingFile(null);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share File Download Link Modal */}
      {isShareModalOpen && shareFile && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setIsShareModalOpen(false);
            setShareFile(null);
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Share2 className="h-5 w-5 text-[#0b4d8c]" />
                <span>Share Download Access Link</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsShareModalOpen(false);
                  setShareFile(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80">
                <h4 className="text-sm font-bold text-slate-800 line-clamp-2">
                  {shareFile.name}
                </h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                  {shareFile.size && <span>Size: <strong>{shareFile.size}</strong></span>}
                  <span>Type: <strong className={shareFile.price === 0 ? 'text-emerald-600' : 'text-blue-700'}>{shareFile.price === 0 ? 'FREE' : `₹${shareFile.price.toFixed(2)}`}</strong></span>
                </div>
              </div>

              {/* 59 Minutes Link Expiration Notice Banner */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <span className="text-lg leading-none">⏱️</span>
                <div>
                  <p className="font-bold">Permanent Download Link Expiration</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    This download access link remains active and valid for <strong>59 minutes</strong> after generation for security.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Shareable Download Access Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={getShareableUrl(shareFile)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 shadow-sm ${
                      copiedLink
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#0b4d8c] hover:bg-[#083b6b] text-white'
                    }`}
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out file on wowfilewala: ${shareFile.name}\nDirect Link: ${getShareableUrl(shareFile)}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share on WhatsApp</span>
                </a>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsShareModalOpen(false);
                    setShareFile(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Preview / Direct Download Modal */}
      <ProductPreviewModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

export default HomePage;