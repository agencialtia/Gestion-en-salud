import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  ChevronDown,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  Globe,
  User,
  LogOut,
  Building2,
  Check,
} from 'lucide-react';
import { LANGUAGE_OPTIONS, LanguageOption, Language } from '../../i18n/translations';

export const Header: React.FC<{
  onOpenQuickCreate: () => void;
  onOpenGlobalSearch: () => void;
  onToggleSidebar: () => void;
  onOpenEditProfile: () => void;
  isSidebarOpen?: boolean;
}> = ({ onOpenQuickCreate, onOpenGlobalSearch, onToggleSidebar, onOpenEditProfile, isSidebarOpen = true }) => {
  const { 
    currentUser, 
    darkMode,
    toggleDarkMode,
    logout,
    language,
    setLanguage,
    t,
    setActiveView,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setShowUserMenu(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(target)) {
        setShowLanguageMenu(false);
      }
    };
    if (showUserMenu || showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showLanguageMenu]);

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  const currentOption = LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <header id="app-header" className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-6 backdrop-blur-md">
      {/* Left: Branding + Sidebar toggle + Quick Search trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
            isSidebarOpen 
              ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900' 
              : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 shadow-2xs'
          }`}
          aria-label={isSidebarOpen ? t('toggleSidebar') : t('expandSidebar')}
          title={isSidebarOpen ? `${t('toggleSidebar')} (Ctrl+B / ⌘B)` : `${t('expandSidebar')} (Ctrl+B / ⌘B)`}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 hidden sm:block text-slate-600" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 hidden sm:block text-indigo-600" />
          )}
          <Menu className="h-5 w-5 sm:hidden" />
        </button>

        {/* Quilicura Salud Brand Logo */}
        <div className="flex items-center gap-2.5 select-none mr-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white shadow-sm shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              {t('appName')}
            </div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {t('appSubtitle')}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Language, Dark mode, User Avatar Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Interactive Language selector: ES / PT / EN 🌐 with dropdown */}
        <div className="relative" ref={languageMenuRef}>
          <button
            id="language-selector-button"
            type="button"
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              showLanguageMenu
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-300/60'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={`${t('language')}: ${currentOption.label}`}
            aria-expanded={showLanguageMenu}
            aria-haspopup="true"
          >
            <span className="tracking-wide text-xs font-black">{currentOption.shortLabel}</span>
            <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </button>

          {/* Language Selector Dropdown Menu */}
          {showLanguageMenu && (
            <div
              id="language-dropdown-menu"
              className="absolute right-0 mt-2 w-44 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
                {t('language')}
              </div>
              <div className="p-1 space-y-0.5">
                {LANGUAGE_OPTIONS.map((opt) => {
                  const isSelected = language === opt.code;
                  return (
                    <button
                      key={opt.code}
                      id={`lang-option-${opt.code}`}
                      type="button"
                      onClick={() => handleSelectLanguage(opt.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{opt.flag}</span>
                        <span>{opt.label}</span>
                        <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {opt.shortLabel}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle Button */}
        <button
          id="btn-toggle-dark-mode"
          type="button"
          onClick={toggleDarkMode}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          aria-label={darkMode ? t('lightMode') : t('darkMode')}
          title={darkMode ? t('lightMode') : t('darkMode')}
        >
          {darkMode ? (
            <Sun className="h-4.5 w-4.5 text-amber-400 animate-in spin-in-90 duration-200" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-slate-600 animate-in spin-in-90 duration-200" />
          )}
        </button>

        {/* User Identity Avatar Circle with Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            id="user-profile-button"
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            aria-expanded={showUserMenu}
          >
            {currentUser.photoUrl ? (
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                className="h-9 w-9 rounded-full object-cover shadow-sm border border-purple-200"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6366f1] text-white font-black text-sm shadow-sm">
                {currentUser.name ? currentUser.name.trim()[0].toUpperCase() : 'K'}
              </div>
            )}
            <ChevronDown className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div
              id="user-menu-dropdown"
              className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {/* Editar Perfil */}
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  onOpenEditProfile();
                }}
                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <User className="h-4 w-4 text-blue-500" />
                <span>{t('editProfile')}</span>
              </button>

              {/* Cerrar Sesión */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                <span>{t('logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
