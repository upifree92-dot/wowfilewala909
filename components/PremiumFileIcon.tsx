import React from 'react';

interface PremiumFileIconProps {
  filename: string;
  className?: string;
}

export const PremiumFileIcon: React.FC<PremiumFileIconProps> = ({ filename, className = "h-11 w-9" }) => {
  const nameLower = filename.toLowerCase();

  // Determine file type and premium styling
  let type: 'zip' | 'bin' | 'tool' | 'diagram' | 'doc' = 'doc';
  let gradientClasses = 'from-blue-500 to-indigo-600';
  let shadowClasses = 'shadow-blue-500/10 dark:shadow-blue-900/10';
  let badgeText = 'BIN';
  let badgeBg = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';

  if (
    nameLower.includes('.zip') || 
    nameLower.includes('.rar') || 
    nameLower.includes('.7z') || 
    nameLower.includes('.tar') || 
    nameLower.includes('package')
  ) {
    type = 'zip';
    gradientClasses = 'from-amber-400 to-amber-600';
    shadowClasses = 'shadow-amber-500/10 dark:shadow-amber-950/20';
    badgeText = 'ZIP';
    badgeBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
  } else if (
    nameLower.includes('da_') || 
    nameLower.includes('dafile') || 
    nameLower.includes('auth') || 
    nameLower.includes('loader') || 
    nameLower.includes('preloader') || 
    nameLower.includes('.bin') || 
    nameLower.includes('.sec')
  ) {
    type = 'bin';
    gradientClasses = 'from-purple-500 to-fuchsia-600';
    shadowClasses = 'shadow-purple-500/10 dark:shadow-purple-900/10';
    badgeText = 'AUTH';
    badgeBg = 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
  } else if (
    nameLower.includes('tool') || 
    nameLower.includes('setup') || 
    nameLower.includes('.exe') || 
    nameLower.includes('enabler') || 
    nameLower.includes('editor') || 
    nameLower.includes('parser')
  ) {
    type = 'tool';
    gradientClasses = 'from-emerald-400 to-teal-600';
    shadowClasses = 'shadow-emerald-500/10 dark:shadow-emerald-900/10';
    badgeText = 'TOOL';
    badgeBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
  } else if (
    nameLower.includes('pinout') || 
    nameLower.includes('isp') || 
    nameLower.includes('schematic') || 
    nameLower.includes('diagram') || 
    nameLower.includes('test point')
  ) {
    type = 'diagram';
    gradientClasses = 'from-rose-500 to-red-600';
    shadowClasses = 'shadow-rose-500/10 dark:shadow-rose-900/10';
    badgeText = 'ISP';
    badgeBg = 'bg-rose-500/10 text-rose-600 dark:text-rose-400';
  }

  return (
    <div className={`relative ${className} flex-shrink-0 group/fileicon select-none filter drop-shadow-md`} style={{ aspectRatio: '3/4' }}>
      {/* 3D Glassmorphic Card Container */}
      <div className={`absolute inset-0 bg-gradient-to-br from-white to-slate-50/90 dark:from-slate-800 dark:to-slate-900/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl shadow-md ${shadowClasses} transition-all duration-300 group-hover/fileicon:-translate-y-1 group-hover/fileicon:shadow-xl group-hover/fileicon:border-cyan-500/40 dark:group-hover/fileicon:border-cyan-400/30 overflow-hidden flex flex-col justify-between p-2`}>
        
        {/* Top Fold Corner Highlight */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded-bl-lg border-b border-l border-slate-300/60 dark:border-slate-600/60 z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent"></div>
        </div>

        {/* Diagonal folder corner mask cutout */}
        <div className="absolute top-0 right-0 w-4 h-4 bg-white dark:bg-slate-850 transform rotate-45 translate-x-2 -translate-y-2 pointer-events-none"></div>

        {/* Inner glow or gradient sidebar indicator */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradientClasses} rounded-l-xl`}></div>

        {/* Central Premium Graphic Component */}
        <div className="flex-grow flex items-center justify-center pt-2 pb-1 px-1">
          {type === 'zip' && (
            /* Premium Zip Archive Icon with Gold teeth & zip slider */
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Folder structure outline */}
              <path d="M4 18V6a2 2 0 0 1 2-2h6l2 2h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="1.5" />
              {/* Zipper details */}
              <path d="M12 6v12" strokeDasharray="2 2" className="stroke-amber-400 dark:stroke-amber-300" strokeWidth="2.5" />
              <rect x="10.5" y="10" width="3" height="4" rx="1" fill="currentColor" className="text-amber-500" />
              <path d="M12 14v2" strokeWidth="2" />
            </svg>
          )}

          {type === 'bin' && (
            /* Premium Chip/EEPROM Auth Icon */
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="5" width="14" height="14" rx="2" className="stroke-purple-500" strokeWidth="2" />
              {/* Microprocessor Pin Leads */}
              <path d="M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4" strokeWidth="1.5" className="stroke-purple-400 dark:stroke-purple-300" />
              {/* Gold Security Shield in center */}
              <circle cx="12" cy="12" r="3" fill="currentColor" className="text-amber-500" />
            </svg>
          )}

          {type === 'tool' && (
            /* Premium Tech Tool/Gears Icon */
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" className="stroke-emerald-500" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="3" fill="currentColor" className="text-teal-500" />
            </svg>
          )}

          {type === 'diagram' && (
            /* Premium Pinout / Schematic Vector Diagram Node */
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-rose-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Connected node network layout */}
              <circle cx="6" cy="6" r="2.5" fill="currentColor" className="text-rose-500" />
              <circle cx="18" cy="18" r="2.5" fill="currentColor" className="text-red-500" />
              <circle cx="18" cy="6" r="2.5" fill="currentColor" className="text-amber-500" />
              <circle cx="6" cy="18" r="2.5" fill="currentColor" className="text-cyan-500" />
              <line x1="8.5" y1="6" x2="15.5" y2="6" strokeWidth="1.5" className="stroke-slate-400 dark:stroke-slate-500" />
              <line x1="6" y1="8.5" x2="6" y2="15.5" strokeWidth="1.5" className="stroke-slate-400 dark:stroke-slate-500" />
              <line x1="8.5" y1="8.5" x2="15.5" y2="15.5" strokeWidth="1.5" className="stroke-slate-300 dark:stroke-slate-600" />
              <line x1="18" y1="8.5" x2="18" y2="15.5" strokeWidth="1.5" className="stroke-slate-400 dark:stroke-slate-500" />
            </svg>
          )}

          {type === 'doc' && (
            /* Premium ROM / standard document file icon with rows */
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" className="stroke-blue-500" strokeWidth="2" />
              {/* Document rows */}
              <path d="M14 2v6h6" strokeWidth="2" className="stroke-blue-400" />
              <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" className="stroke-slate-300 dark:stroke-slate-600" />
              <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" className="stroke-slate-300 dark:stroke-slate-600" />
              <line x1="10" y1="9" x2="8" y2="9" strokeWidth="2" className="stroke-blue-400" />
            </svg>
          )}
        </div>

        {/* Small Elegant File Extension Badge at Bottom */}
        <div className={`text-[8px] font-black tracking-wider text-center py-0.5 rounded ${badgeBg} uppercase mt-1`}>
          {badgeText}
        </div>

      </div>
    </div>
  );
};
