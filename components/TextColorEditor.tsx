import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Paintbrush, X, RotateCcw, Check } from 'lucide-react';

const TextColorEditor: React.FC = () => {
  const { isEditMode, siteContent, updateSiteContent, isAdmin } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAdmin || !isEditMode) return null;

  const themeColors = siteContent?.themeColors || {};
  
  // Default fallback values that are guaranteed to have high-contrast
  const defaultColors = {
    textColorLight: "#1e293b",
    textMutedLight: "#64748b",
    textColorDark: "#cbd5e1",
    textMutedDark: "#94a3b8",
    accentColor: "#f97316"
  };

  const colors = {
    textColorLight: themeColors.textColorLight || defaultColors.textColorLight,
    textMutedLight: themeColors.textMutedLight || defaultColors.textMutedLight,
    textColorDark: themeColors.textColorDark || defaultColors.textColorDark,
    textMutedDark: themeColors.textMutedDark || defaultColors.textMutedDark,
    accentColor: themeColors.accentColor || defaultColors.accentColor,
  };

  const handleColorChange = (key: string, value: string) => {
    updateSiteContent(`themeColors.${key}`, value);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all text colors to defaults?")) {
      updateSiteContent("themeColors", defaultColors);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-[90] font-sans">
      {/* Collapsed Button */}
      {!isOpen ? (
        <button
          id="btn-open-color-editor"
          onClick={() => setIsOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2 border border-orange-400 transition-all duration-200 active:scale-95 group"
          title="Open Site Text Color Editor"
        >
          <Paintbrush className="h-5 w-5 animate-pulse group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-black uppercase tracking-wider pr-1">Edit Text Colors</span>
        </button>
      ) : (
        /* Expanded Drawer/Card */
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-5 w-80 text-slate-800 dark:text-slate-100 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-orange-500" />
              <span className="font-bold text-sm tracking-tight">Site Text Colors</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Light Theme Group */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Light Theme Colors
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold">Primary Text</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors.textColorLight}
                      onChange={(e) => handleColorChange('textColorLight', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent"
                    />
                    <input
                      type="text"
                      value={colors.textColorLight}
                      onChange={(e) => handleColorChange('textColorLight', e.target.value)}
                      className="w-20 px-1.5 py-1 text-xs font-mono rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold">Muted Text</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors.textMutedLight}
                      onChange={(e) => handleColorChange('textMutedLight', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent"
                    />
                    <input
                      type="text"
                      value={colors.textMutedLight}
                      onChange={(e) => handleColorChange('textMutedLight', e.target.value)}
                      className="w-20 px-1.5 py-1 text-xs font-mono rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dark Theme Group */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Dark Theme Colors
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold">Primary Text</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors.textColorDark}
                      onChange={(e) => handleColorChange('textColorDark', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent"
                    />
                    <input
                      type="text"
                      value={colors.textColorDark}
                      onChange={(e) => handleColorChange('textColorDark', e.target.value)}
                      className="w-20 px-1.5 py-1 text-xs font-mono rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-semibold">Muted Text</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colors.textMutedDark}
                      onChange={(e) => handleColorChange('textMutedDark', e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent"
                    />
                    <input
                      type="text"
                      value={colors.textMutedDark}
                      onChange={(e) => handleColorChange('textMutedDark', e.target.value)}
                      className="w-20 px-1.5 py-1 text-xs font-mono rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Accent Theme Group */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Brand Accent Color
              </h3>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold">Primary Theme</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={colors.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent"
                  />
                  <input
                    type="text"
                    value={colors.accentColor}
                    onChange={(e) => handleColorChange('accentColor', e.target.value)}
                    className="w-20 px-1.5 py-1 text-xs font-mono rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={handleReset}
              className="w-1/2 flex items-center justify-center gap-1 py-1.5 px-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-bold transition-all text-slate-700 dark:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-1/2 flex items-center justify-center gap-1 py-1.5 px-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextColorEditor;
