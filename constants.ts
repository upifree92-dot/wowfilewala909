
import type { Product, Category, BalancePackage } from './types';
import { DEFAULT_SERVICES_CATALOG, DEFAULT_SERVICE_CATEGORIES } from './data/defaultServices';

// This file now provides the INITIAL data for the application.
// On first load, this data will be copied to localStorage to make it dynamic.

export const ADMIN_EMAIL = 'kgfilewala@gmail.com';

// New, flat category structure with parentId for nesting
export const INITIAL_CATEGORIES: Category[] = [
  ...DEFAULT_SERVICE_CATEGORIES,
  // Top-level categories from the image
  { id: 'auth-files', name: 'Auth/Firehose/Preloader & DA Files', description: 'Download Auth/firehose & DA Files for Flashing', imageUrl: 'https://placehold.co/80x80/e3f2fd/3d5afe?text=AUTH' },
  { 
    id: 'box-tools', 
    name: 'Box & Tools Setup', 
    description: 'Download Various Box & Tools Setup', 
    imageUrl: 'https://placehold.co/80x80/e0f7fa/00acc1?text=TOOLS',
    activationForm: {
      enabled: true,
      title: 'Box Activation Service',
      pricePerUnit: 50,
      deliveryTime: '5-10 Minutes',
      quantityRange: {
        min: 5,
        max: 30,
      },
      // FIX: Add missing 'customFields' property to satisfy the ActivationFormConfig interface.
      customFields: [
        { id: `field-box-1`, name: 'email', label: 'Enter Email', placeholder: 'your@email.com', type: 'email', enabled: true },
        { id: `field-box-2`, name: 'username', label: 'Enter USERNAME', placeholder: 'Enter Username', type: 'text', enabled: true },
        { id: `field-box-3`, name: 'password', label: 'Enter Password', placeholder: 'Enter Password', type: 'password', enabled: true },
      ]
    }
  },
  { id: 'clone-firmware', name: 'Clone Phone Firmware', description: 'Download Full Working Clone Phone Firmware', imageUrl: 'https://placehold.co/80x80/ede7f6/5e35b1?text=CLONE' },
  { id: 'dump-files', name: 'Dump Files ENG/EMMC/UFS/FFU/RPMB Files', description: 'Download Dump Files for various chipsets', imageUrl: 'https://placehold.co/80x80/e8f5e9/43a047?text=DUMP' },
  { id: 'firmware-major', name: 'Firmware (Major)', description: 'Download Full Working And 100% Original Flash Files', imageUrl: 'https://placehold.co/80x80/f3e5f5/8e24aa?text=MAJOR' },
  { id: 'firmware-various', name: 'Firmware (Various)', description: 'Download Firmware (Various)', imageUrl: 'https://placehold.co/80x80/fce4ec/d81b60?text=MISC' },
  { id: 'free-tools', name: 'Free Tools', description: 'Download free Tools For Mobile Software', imageUrl: 'https://placehold.co/80x80/fffde7/f9a825?text=FREE' },
  { id: 'frp-mdm-files', name: 'FRP/MDM/DEMO/K.Off Files', description: 'Download FRP Files/MDM Files', imageUrl: 'https://placehold.co/80x80/fff3e0/fb8c00?text=FRP' },
  { id: 'network-files', name: 'Network Files NvData/NvRam/EFS/QCN', description: 'Download Network Related Files', imageUrl: 'https://placehold.co/80x80/e1f5fe/039be5?text=NET' },
  { id: 'official-tools', name: 'Official / Flashing Tools', description: 'Download official Flashing Tools', imageUrl: 'https://placehold.co/80x80/e0e0e0/546e7a?text=OEM' },
  { id: 'readed-firmware', name: 'Readed Firmware', description: 'Download Readed Firmware 100% Tested & Working', imageUrl: 'https://placehold.co/80x80/fbe9e7/ff5722?text=READ' },
  { id: 'schematic-diagrams', name: 'Schematic Diagrams And Test Points', description: 'Simplify Your Mobile Repairing Experience.', imageUrl: 'https://placehold.co/80x80/e0f2f1/00897b?text=SCH' },
  { id: 'trending-solutions', name: 'Trending Solutions', description: 'Video Solutions', imageUrl: 'https://placehold.co/80x80/f9fbe7/c0ca33?text=TREND' },
  { id: 'usb-drivers', name: 'USB Drivers', description: 'Download All Usb Drivers And Fix Drivers Related Problems', imageUrl: 'https://placehold.co/80x80/e3f2fd/1e88e5?text=USB' },
  { id: 'windows-files', name: 'Windows ISO/Software/Exe files', description: 'Download Windows ISO Files/Softwares For Your PC', imageUrl: 'https://placehold.co/80x80/e3f2fd/0d47a1?text=WIN' },

  // Sub-categories for 'Auth/Firehose/Preloader & DA Files' (Level 2)
  { id: 'sub-auth-files', name: 'Auth Files', description: 'Download Auth Files for Flashing and Unlocking', imageUrl: 'folder', parentId: 'auth-files' },
  { id: 'sub-da-files', name: 'DA Files', description: 'Download DA Files for Flashing and Unlocking', imageUrl: 'folder', parentId: 'auth-files' },
  { id: 'sub-firehose-loader', name: 'FireHose + Loader Files', description: 'Download FireHose + Loader Files', imageUrl: 'folder', parentId: 'auth-files' },
  { id: 'sub-preloader-files', name: 'Preloader Files', description: 'Download Preloader Files', imageUrl: 'folder', parentId: 'auth-files' },
  
  // Brand-specific sub-categories for 'Auth Files' (Level 3)
  { id: 'alcatel-auth', name: 'Alcatel Auth Files', description: 'Download Alcatel Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'gionee-auth', name: 'Gionee Auth Files', description: 'Download Gionee Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'honor-auth', name: 'Honor Auth Files', description: 'Download Honor Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'huawei-auth', name: 'Huawei Auth Files', description: 'Download Huawei Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'infinix-auth', name: 'Infinix Auth Files', description: 'Download Infinix Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'itel-auth', name: 'Itel Auth Files', description: 'Download Itel Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'lenovo-auth', name: 'Lenovo Auth Files', description: 'Download Lenovo Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'letv-auth', name: 'Letv Auth Files', description: 'Download Letv Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'meizu-auth', name: 'Meizu Auth Files', description: 'Download Meizu Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'motorola-auth', name: 'Motorola Auth Files', description: 'Download Motorola Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'oneplus-auth', name: 'OnePlus Auth Files', description: 'Download OnePlus Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'oppo-auth', name: 'OPPO Auth Files', description: 'Download OPPO Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'poco-auth', name: 'Poco Auth Files', description: 'Download Poco Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'realme-auth', name: 'Realme Auth Files', description: 'Download Realme Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'samsung-auth', name: 'Samsung Auth Files', description: 'Download Samsung Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'sony-auth', name: 'Sony Auth Files', description: 'Download Sony Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'tcl-auth', name: 'TCL Auth Files', description: 'Download TCL Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'tecno-auth', name: 'Tecno Auth Files', description: 'Download Tecno Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'vivo-auth', name: 'VIVO Auth Files', description: 'Download Vivo Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },
  { id: 'xiaomi-auth', name: 'Xiaomi Auth Files', description: 'Download Xiaomi Auth Files', imageUrl: 'folder', parentId: 'sub-auth-files' },


  // Sub-categories for 'Box & Tools Setup'
  { id: 'sub-setup-wizards', name: 'Setup Wizards', description: 'Installation files for various boxes', imageUrl: 'folder', parentId: 'box-tools' },
  { id: 'sub-tool-activators', name: 'Tool Activators', description: 'Activation tools and patches', imageUrl: 'folder', parentId: 'box-tools' },
  { id: 'sub-box-drivers', name: 'Box Drivers', description: 'Drivers for hardware dongles and boxes', imageUrl: 'folder', parentId: 'box-tools' },
  
  // Sub-categories for 'Clone Phone Firmware'
  { id: 'sub-mtk-clone', name: 'MTK Clone Firmware', description: 'Firmware for MediaTek clone devices', imageUrl: 'folder', parentId: 'clone-firmware' },
  { id: 'sub-spd-clone', name: 'SPD Clone Firmware', description: 'Firmware for Spreadtrum clone devices', imageUrl: 'folder', parentId: 'clone-firmware' },

  // Sub-categories for 'Dump Files ENG/EMMC/UFS/FFU/RPMB Files'
  { id: 'sub-emmc-dumps', name: 'EMMC Dumps', description: 'Full EMMC memory dumps', imageUrl: 'folder', parentId: 'dump-files' },
  { id: 'sub-ufs-dumps', name: 'UFS Dumps', description: 'Full UFS memory dumps', imageUrl: 'folder', parentId: 'dump-files' },
  { id: 'sub-rpmb-files', name: 'RPMB Files', description: 'Replay Protected Memory Block files', imageUrl: 'folder', parentId: 'dump-files' },
  
  // Sub-categories for 'Firmware (Major)'
  { id: 'samsung-firmware', name: 'Samsung Firmware', description: 'Official firmware for Samsung devices.', imageUrl: 'folder', parentId: 'firmware-major' },
  { id: 'xiaomi-firmware', name: 'Xiaomi Firmware', description: 'Official firmware for Xiaomi devices.', imageUrl: 'folder', parentId: 'firmware-major' },
  { id: 'oppo-firmware', name: 'Oppo Firmware', description: 'Official firmware for Oppo devices.', imageUrl: 'folder', parentId: 'firmware-major' },

  // Sub-categories for 'Firmware (Various)'
  { id: 'sub-custom-roms', name: 'Custom ROMs', description: 'Community-built custom operating systems', imageUrl: 'folder', parentId: 'firmware-various' },
  { id: 'sub-router-firmware', name: 'Router Firmware', description: 'Firmware for various network routers', imageUrl: 'folder', parentId: 'firmware-various' },
  
  // Sub-categories for 'Free Tools'
  { id: 'sub-android-tools', name: 'Android Tools', description: 'Free utilities for Android devices', imageUrl: 'folder', parentId: 'free-tools' },
  { id: 'sub-pc-utilities', name: 'PC Utilities', description: 'Helpful software for your computer', imageUrl: 'folder', parentId: 'free-tools' },

  // Sub-categories for 'FRP/MDM/DEMO/K.Off Files'
  { id: 'sub-frp-bypass', name: 'FRP Bypass Tools', description: 'Tools for Factory Reset Protection bypass', imageUrl: 'folder', parentId: 'frp-mdm-files' },
  { id: 'sub-mdm-removal', name: 'MDM Removal', description: 'Mobile Device Management removal tools', imageUrl: 'folder', parentId: 'frp-mdm-files' },

  // Sub-categories for 'Network Files NvData/NvRam/EFS/QCN'
  { id: 'sub-qcn-files', name: 'QCN Files', description: 'Qualcomm Calibration Network files', imageUrl: 'folder', parentId: 'network-files' },
  { id: 'sub-efs-files', name: 'EFS Files', description: 'EFS partition backup files', imageUrl: 'folder', parentId: 'network-files' },

  // Sub-categories for 'Official / Flashing Tools'
  { id: 'sub-odin-tool', name: 'Odin Flash Tool', description: 'For Samsung devices', imageUrl: 'folder', parentId: 'official-tools' },
  { id: 'sub-miflash-tool', name: 'MiFlash Tool', description: 'For Xiaomi devices', imageUrl: 'folder', parentId: 'official-tools' },

  // Sub-categories for 'Readed Firmware'
  { id: 'sub-backup-files', name: 'Backup Files', description: 'Firmware read from working devices', imageUrl: 'folder', parentId: 'readed-firmware' },
  
  // Sub-categories for 'Schematic Diagrams And Test Points'
  { id: 'sub-phone-schematics', name: 'Phone Schematics', description: 'Circuit diagrams for mobile phones', imageUrl: 'folder', parentId: 'schematic-diagrams' },
  { id: 'sub-test-points', name: 'Test Points', description: 'EDL mode and other test points', imageUrl: 'folder', parentId: 'schematic-diagrams' },
  
  // Sub-categories for 'Trending Solutions'
  { id: 'sub-video-tutorials', name: 'Video Tutorials', description: 'Repair and unlocking video guides', imageUrl: 'folder', parentId: 'trending-solutions' },
  { id: 'sub-repair-guides', name: 'Repair Guides', description: 'Step-by-step written guides', imageUrl: 'folder', parentId: 'trending-solutions' },

  // Sub-categories for 'USB Drivers'
  { id: 'sub-mtk-drivers', name: 'MTK Drivers', description: 'Drivers for MediaTek devices', imageUrl: 'folder', parentId: 'usb-drivers' },
  { id: 'sub-qualcomm-drivers', name: 'Qualcomm Drivers', description: 'QDLoader 9008 drivers', imageUrl: 'folder', parentId: 'usb-drivers' },
  
  // Sub-categories for 'Windows ISO/Software/Exe files'
  { id: 'windows-11-iso', name: 'Windows 11 ISO', description: 'Official ISO files for Windows 11.', imageUrl: 'folder', parentId: 'windows-files' },
  { id: 'windows-10-iso', name: 'Windows 10 ISO', description: 'Official ISO files for Windows 10.', imageUrl: 'folder', parentId: 'windows-files' },
  { id: 'office-suites', name: 'Office Suites', description: 'Productivity software suites.', imageUrl: 'folder', parentId: 'windows-files' },
];


export const INITIAL_PRODUCTS: Product[] = DEFAULT_SERVICES_CATALOG;


export const INITIAL_BALANCE_PACKAGES: BalancePackage[] = [
    { 
        id: 'plan-1-file', 
        name: '1 File Pack', 
        description: 'Perfect for 1 file pack users.', 
        price: 150, 
        period: '1 Month', 
        bandwidth: 'Unlimited', 
        downloads: '1 Files', 
        dailyLimit: 'No Limit', 
        dailyBandwidth: 'No Limit', 
        devices: '1 Devices' 
    },
    { 
        id: 'plan-basic', 
        name: 'Basic Plan', 
        description: 'Perfect for basic plan users.', 
        price: 499, 
        originalPrice: 1000,
        discountBadge: '50% OFF',
        period: '28 Days', 
        bandwidth: '100 GB', 
        downloads: '10 Files', 
        dailyLimit: '3 Files', 
        dailyBandwidth: '20 GB Daily', 
        devices: '1 Devices' 
    },
    { 
        id: 'plan-popular', 
        name: 'Popular Plan', 
        description: 'Best Value', 
        price: 999, 
        originalPrice: 1100,
        discountBadge: '9% OFF',
        period: '1 Year', 
        bandwidth: '1000 GB', 
        downloads: '500 Files', 
        dailyLimit: '15 Files', 
        dailyBandwidth: '25 GB Daily', 
        devices: '30 Devices',
        isBestSeller: true
    },
];