import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Plus, 
  Bell, 
  Sparkles, 
  Check, 
  AlertCircle, 
  ShieldAlert, 
  ExternalLink,
  ChevronDown,
  Layers,
  CalendarDays,
  UserCheck,
  Menu
} from 'lucide-react';
import { TrafficLightBadge } from './UIComponents';

export const Header: React.FC<{
  onOpenQuickCreate: () => void;
  onOpenGlobalSearch: () => void;
  onToggleSidebar: () => void;
}> = ({ onOpenQuickCreate, onOpenGlobalSearch, onToggleSidebar }) => {
  const { 
    currentUser, 
    globalAlerts, 
    resolveAlert, 
    setActiveView, 
    setSelectedProgramId 
  } = useApp();

  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const criticalCount = globalAlerts.filter(a => a.severity === 'critica').length;

  return (
    <header id="app-header" className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-6 backdrop-blur-md">
      {/* Left: Mobile menu toggle + Quick Search trigger */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          id="btn-toggle-sidebar"
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all lg:hidden"
          aria-label="Abrir menú"
          title="Menú de Navegación"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          id="global-search-trigger"
          onClick={onOpenGlobalSearch}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition-colors w-40 sm:w-72"
        >
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="truncate">Buscar tareas, metas...</span>
          <kbd className="hidden sm:inline-block ml-auto rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Quick actions, notifications, user profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Create Button */}
        <button
          id="btn-quick-create-global"
          onClick={onOpenQuickCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nuevo Registro</span>
          <span className="sm:hidden">Crear</span>
        </button>

        {/* Alerts Bell with Dropdown */}
        <div className="relative">
          <button
            id="btn-alerts-bell"
            onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            title="Alertas operativas"
          >
            <Bell className="h-5 w-5" />
            {globalAlerts.length > 0 && (
              <span
                id="header-alert-counter"
                className={`absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${
                  criticalCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'
                }`}
              >
                {globalAlerts.length}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Modal */}
          {showAlertsDropdown && (
            <div
              id="alerts-dropdown-panel"
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-slate-800">Alertas Activas</span>
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {globalAlerts.length} pendientes
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {globalAlerts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    <Check className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                    No hay alertas pendientes en este momento.
                  </div>
                ) : (
                  globalAlerts.slice(0, 6).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 hover:bg-slate-50 transition-colors text-left flex items-start justify-between gap-2"
                    >
                      <div className="space-y-1 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              alert.severity === 'critica' ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-800">{alert.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{alert.date}</span>
                          <span>•</span>
                          <button
                            onClick={() => {
                              setSelectedProgramId(alert.programId);
                              setActiveView('program_detail');
                              setShowAlertsDropdown(false);
                            }}
                            className="text-indigo-600 hover:underline font-medium"
                          >
                            Ver programa →
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="rounded p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        title="Marcar resuelta"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {globalAlerts.length > 0 && (
                <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                  <button
                    onClick={() => {
                      setActiveView('alertas');
                      setShowAlertsDropdown(false);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Ver todas las alertas en Centro de Control →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Identity Pill */}
        <div className="relative">
          <button
            id="user-profile-button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-100 font-semibold text-xs text-indigo-800">
              {currentUser.avatar}
            </div>
            <div className="hidden md:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-800">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500">DISAM Quilicura</div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div
              id="user-menu-dropdown"
              className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-lg py-2 z-50"
            >
              <div className="px-3 py-2 border-b border-slate-100 text-xs">
                <p className="font-semibold text-slate-800">{currentUser.name}</p>
                <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-medium uppercase">
                  {currentUser.title}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveView('configuracion');
                  setShowUserMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                Configuración y Auditoría
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
