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
  Building2
} from 'lucide-react';

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
    toggleDarkMode
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const handleLogout = () => {
    setShowUserMenu(false);
    // Visual feedback for logout
    alert('Has cerrado sesión correctamente.');
  };

  return (
    <header id="app-header" className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-6 backdrop-blur-md">
      {/* Left: Master App branding + Sidebar toggle + Quick Search trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all active:scale-95 ${
            isSidebarOpen 
              ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900' 
              : 'border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-900 shadow-2xs'
          }`}
          aria-label={isSidebarOpen ? 'Ocultar menú lateral' : 'Mostrar menú lateral'}
          title={isSidebarOpen ? 'Ocultar menú lateral (Ctrl+B / ⌘B)' : 'Mostrar menú lateral (Ctrl+B / ⌘B)'}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5 hidden sm:block text-slate-600" />
          ) : (
            <PanelLeftOpen className="h-5 w-5 hidden sm:block text-indigo-600" />
          )}
          <Menu className="h-5 w-5 sm:hidden" />
        </button>

        {/* Quilicura Salud Brand Logo (Image 3) */}
        <div className="flex items-center gap-2.5 select-none mr-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 text-white shadow-sm shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="text-left leading-tight hidden sm:block">
            <div className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
              Quilicura Salud
            </div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              Centro de gestión en salud
            </div>
          </div>
        </div>
      </div>

      {/* Right: Language, Dark mode, User Avatar Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Language selector: ES 🌐 */}
        <button
          id="language-selector-button"
          type="button"
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Idioma: Español"
        >
          <span className="tracking-wide text-xs font-semibold">ES</span>
          <Globe className="h-4 w-4 text-slate-500 dark:text-slate-400" />
        </button>

        {/* Dark Mode Toggle Button */}
        <button
          id="btn-toggle-dark-mode"
          type="button"
          onClick={toggleDarkMode}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro / turno nocturno'}
          title={
            darkMode
              ? 'Modo oscuro activo — Clic para modo claro'
              : 'Modo claro activo — Clic para modo oscuro'
          }
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

          {/* User Menu Dropdown (Image 1 style) */}
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
                <span>Editar Perfil</span>
              </button>

              {/* Cerrar Sesión */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/70 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
