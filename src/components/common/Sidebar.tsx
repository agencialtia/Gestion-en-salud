import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId } from '../../types';
import {
  Calendar,
  LayoutDashboard,
  Settings,
  ChevronRight,
  ChevronDown,
  Activity,
  HeartHandshake,
  ScanLine,
  SmilePlus,
  Stethoscope,
  UsersRound,
  Building2,
  Plus,
  Brain,
  Baby,
  Pill,
  Shield,
  Sparkles,
  X,
  PanelLeftClose,
  Users,
  FileText,
} from 'lucide-react';
import { CreateProgramModal } from './CreateProgramModal';

const ALL_PROGRAM_ICONS: Record<string, React.ElementType> = {
  praps_cpu: HeartHandshake,
  praps_rehab: Activity,
  praps_imagenes: ScanLine,
  praps_mas_ama: SmilePlus,
  praps_respiratoria: Stethoscope,
  prog_personas_mayores: UsersRound,
  HeartHandshake,
  Activity,
  ScanLine,
  Eye: ScanLine,
  SmilePlus,
  Stethoscope,
  UsersRound,
  Users: UsersRound,
  Brain,
  Baby,
  Pill,
  Shield,
  Sparkles,
};

export const Sidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const {
    programs,
    programSummaries,
    contacts,
    documents,
    activeView,
    setActiveView,
    selectedProgramId,
    setSelectedProgramId,
  } = useApp();

  const [programsOpen, setProgramsOpen] = useState(true);
  const [isCreateProgramModalOpen, setIsCreateProgramModalOpen] = useState(false);

  const handleProgramSelect = (id: ProgramId) => {
    setSelectedProgramId(id);
    setActiveView('program_detail');
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleNavSelect = (viewId: string) => {
    setActiveView(viewId);
    if (viewId === 'dashboard') setSelectedProgramId(null);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | null;
    badgeColor?: string;
  }

  const activeContactsCount = contacts ? contacts.filter((c) => !c.archived).length : 0;
  const activeDocsCount = documents ? documents.filter((d) => !d.archived).length : 0;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Global',
      icon: LayoutDashboard,
    },
    {
      id: 'calendario',
      label: 'Calendario',
      icon: Calendar,
    },
    {
      id: 'contactos',
      label: 'Contactos',
      icon: Users,
      badge: activeContactsCount > 0 ? activeContactsCount : null,
      badgeColor: 'bg-indigo-500/30 text-indigo-300',
    },
    {
      id: 'documentos',
      label: 'Documentos',
      icon: FileText,
      badge: activeDocsCount > 0 ? activeDocsCount : null,
      badgeColor: 'bg-indigo-500/30 text-indigo-300',
    },
    {
      id: 'configuracion',
      label: 'Configuración y Auditoría',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          id="sidebar-backdrop"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      <aside
        id="main-sidebar"
        aria-label="Menú principal de navegación"
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-slate-900 text-slate-200 transition-all duration-300 ease-in-out lg:static shrink-0 ${
          isOpen
            ? 'w-72 lg:w-64 translate-x-0 shadow-2xl lg:shadow-none border-r border-slate-800 opacity-100'
            : 'w-0 -translate-x-full lg:w-0 lg:translate-x-0 overflow-hidden border-r-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full w-72 lg:w-64 shrink-0 overflow-hidden">
          {/* Brand Header */}
          <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold shadow-md shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="truncate">
                <h1 className="text-sm font-bold text-white tracking-tight leading-tight truncate">
                  Quilicura Salud
                </h1>
                <p className="text-[10px] text-slate-400 font-medium truncate">Centro Operativo PRAPS</p>
              </div>
            </div>

            {/* Collapse/Close button for desktop and mobile */}
            <button
              id="btn-sidebar-collapse"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors shrink-0"
              aria-label="Ocultar menú lateral"
              title="Ocultar menú lateral"
            >
              <PanelLeftClose className="h-4.5 w-4.5 hidden lg:block" />
              <X className="h-5 w-5 lg:hidden" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
            {/* Core Daily Views */}
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Navegación Principal
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => handleNavSelect(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Programs Submenu with Live Traffic Light Indicators & Nuevo Programa */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-1.5">
                <button
                  onClick={() => setProgramsOpen(!programsOpen)}
                  className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <span>Programas 2026 ({programs.length})</span>
                  {programsOpen ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </button>
                <button
                  id="btn-sidebar-add-program"
                  type="button"
                  onClick={() => setIsCreateProgramModalOpen(true)}
                  title="Crear nuevo programa desde cero"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-bold shadow-2xs transition-all cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  <span>Nuevo</span>
                </button>
              </div>

              {programsOpen && (
                <div className="space-y-1 pt-1">
                  {programs.map((prog) => {
                    const isSelected = activeView === 'program_detail' && selectedProgramId === prog.id;
                    const summary = programSummaries[prog.id];
                    const IconComponent = ALL_PROGRAM_ICONS[prog.id] || ALL_PROGRAM_ICONS[prog.iconName] || Activity;

                    // Semaphore dot colors
                    const dotColorMap = {
                      green: 'bg-emerald-400 shadow-emerald-400/50',
                      yellow: 'bg-amber-400 shadow-amber-400/50',
                      red: 'bg-rose-500 shadow-rose-500/50 animate-pulse',
                      gray: 'bg-slate-400',
                    };
                    const dotClass = summary ? dotColorMap[summary.status] : dotColorMap.gray;

                    return (
                      <button
                        key={prog.id}
                        id={`sidebar-program-${prog.id}`}
                        onClick={() => handleProgramSelect(prog.id)}
                        className={`group flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-slate-800 text-white font-semibold border-l-2 border-indigo-500'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <IconComponent
                            className={`h-4 w-4 shrink-0 ${
                              isSelected ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          <span className="truncate text-left">{prog.shortName}</span>
                        </div>
                        {/* Live Semaphore Dot */}
                        <span
                          title={summary ? `Estado: ${summary.statusReason}` : 'Sin datos'}
                          className={`h-2 w-2 rounded-full shrink-0 shadow-sm ${dotClass}`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Button Programas 2025 - Identical style to Programas 2026 */}
              <button
                id="btn-programas-2025"
                onClick={() => {
                  setActiveView('resumen_2025');
                  setSelectedProgramId(null);
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={`flex w-full items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors mt-2 ${
                  activeView === 'resumen_2025'
                    ? 'text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Programas 2025</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal para Crear Nuevo Programa */}
      <CreateProgramModal
        isOpen={isCreateProgramModalOpen}
        onClose={() => setIsCreateProgramModalOpen(false)}
      />
    </>
  );
};
