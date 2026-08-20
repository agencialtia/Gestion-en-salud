import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from '../common/Sidebar';
import { Header } from '../common/Header';
import { QuickCreateModal, QuickCreateTab } from '../common/QuickCreateModal';
import { CreateIndicatorModal } from '../common/CreateIndicatorModal';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { EntityDrawer, DrawerEntityType } from '../common/EntityDrawer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { ToastContainer } from '../common/ToastContainer';

// Views
import { HoyView } from '../views/HoyView';
import { DashboardGlobalView } from '../views/DashboardGlobalView';
import { ProgramDetailView } from '../views/ProgramDetailView';
import { TareasGlobalesView } from '../views/TareasGlobalesView';
import { CalendarioView } from '../views/CalendarioView';
import { AlertasEngineView } from '../views/AlertasEngineView';
import { ConfiguracionAuditoriaView } from '../views/ConfiguracionAuditoriaView';
import { Programas2025View } from '../views/Programas2025View';
import { ReunionesGlobalesView } from '../views/ReunionesGlobalesView';

export const Layout: React.FC = () => {
  const {
    activeView,
    selectedProgramId,
    deleteTask,
    deletePurchase,
    deleteIndicator,
    deleteMeeting,
    deleteEmail,
    deleteQuestion,
    deleteKnowledge,
    deleteHRRecord,
    deleteEleamCase,
    pendingEmailResolutionPrompt,
    resolvePendingEmailPrompt,
    dismissPendingEmailPrompt,
  } = useApp();

  // Sidebar state (desplegable / colapsable) with persistent user preference
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quilicura_sidebar_open');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 1024; // Default expanded on desktop
    }
    return true;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('quilicura_sidebar_open', String(next));
      }
      return next;
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      localStorage.setItem('quilicura_sidebar_open', 'false');
    }
  };

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modals & Drawers state
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [quickCreateTab, setQuickCreateTab] = useState<QuickCreateTab>('task');
  const [createIndicatorOpen, setCreateIndicatorOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerEntityType, setDrawerEntityType] = useState<DrawerEntityType | null>(null);
  const [drawerEntityId, setDrawerEntityId] = useState<string | null>(null);

  const handleOpenQuickCreate = (tab: QuickCreateTab = 'task') => {
    setQuickCreateTab(tab);
    setQuickCreateOpen(true);
  };

  // Deletion confirm state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: DrawerEntityType; id: string } | null>(null);

  const handleOpenEntity = (type: DrawerEntityType, id: string) => {
    setDrawerEntityType(type);
    setDrawerEntityId(id);
    setDrawerOpen(true);
  };

  const handleDeleteRequest = (type: DrawerEntityType, id: string) => {
    setItemToDelete({ type, id });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const { type, id } = itemToDelete;

    if (type === 'task') deleteTask(id);
    else if (type === 'purchase') deletePurchase(id);
    else if (type === 'indicator') deleteIndicator(id);
    else if (type === 'meeting') deleteMeeting(id);
    else if (type === 'email') deleteEmail(id);
    else if (type === 'question') deleteQuestion(id);
    else if (type === 'knowledge') deleteKnowledge(id);
    else if (type === 'hr') deleteHRRecord(id);
    else if (type === 'eleam') deleteEleamCase(id);

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
    setDrawerOpen(false);
  };

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased">
      {/* Sidebar Navigation with Mobile Drawer & Desktop Collapsible support */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden transition-all duration-300">
        {/* Sticky Header */}
        <Header
          isSidebarOpen={sidebarOpen}
          onOpenQuickCreate={() => handleOpenQuickCreate('task')}
          onOpenGlobalSearch={() => setSearchOpen(true)}
          onToggleSidebar={toggleSidebar}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activeView === 'hoy' && (
              <HoyView
                onOpenEntity={handleOpenEntity}
                onOpenQuickCreate={() => handleOpenQuickCreate('task')}
              />
            )}
            {activeView === 'dashboard' && <DashboardGlobalView />}
            {activeView === 'program_detail' && (
              <ProgramDetailView
                onOpenEntity={handleOpenEntity}
                onDeleteRequest={handleDeleteRequest}
                onOpenQuickCreate={handleOpenQuickCreate}
                onOpenCreateIndicator={() => setCreateIndicatorOpen(true)}
              />
            )}
            {activeView === 'tareas' && (
              <TareasGlobalesView
                onOpenEntity={handleOpenEntity}
                onOpenQuickCreate={() => handleOpenQuickCreate('task')}
              />
            )}
            {activeView === 'reuniones' && (
              <ReunionesGlobalesView
                onOpenEntity={handleOpenEntity}
                onOpenQuickCreate={() => handleOpenQuickCreate('meeting')}
              />
            )}
            {activeView === 'calendario' && (
              <CalendarioView
                onOpenEntity={handleOpenEntity}
                onOpenQuickCreate={() => handleOpenQuickCreate('meeting')}
              />
            )}
            {activeView === 'alertas' && (
              <AlertasEngineView onOpenEntity={handleOpenEntity} />
            )}
            {activeView === 'configuracion' && <ConfiguracionAuditoriaView />}
            {activeView === 'resumen_2025' && <Programas2025View />}
            {activeView === 'busqueda' && (
              <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Búsqueda Global</h2>
                <p className="text-xs text-slate-500">
                  Abre la ventana de búsqueda global para explorar todos los programas y módulos.
                </p>
                <button
                  onClick={() => setSearchOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Abrir Buscador
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <QuickCreateModal
        isOpen={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        defaultProgramId={selectedProgramId}
        initialTab={quickCreateTab}
      />

      <CreateIndicatorModal
        isOpen={createIndicatorOpen}
        onClose={() => setCreateIndicatorOpen(false)}
        defaultProgramId={selectedProgramId}
      />

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <EntityDrawer
        isOpen={drawerOpen}
        entityType={drawerEntityType}
        entityId={drawerEntityId}
        onClose={() => {
          setDrawerOpen(false);
          setDrawerEntityType(null);
          setDrawerEntityId(null);
        }}
        onDeleteRequest={handleDeleteRequest}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="¿Confirmas que deseas archivar este registro?"
        message="El elemento se marcará como archivado y dejará de computar en alertas y listas activas."
        confirmLabel="Archivar Registro"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
      />

      {/* Modal de resolución de requerimiento vinculado al terminar tarea */}
      {pendingEmailResolutionPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <span className="text-xl">✓</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Tarea operativa terminada
                </h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  La tarea vinculada fue completada. ¿Deseas actualizar el estado del requerimiento administrativo de origen?
                </p>
                <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 truncate">
                  {pendingEmailResolutionPrompt.emailSubject}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => resolvePendingEmailPrompt('respondido')}
                className="flex-1 rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-700 active:scale-95 transition-all text-center"
              >
                Respondido
              </button>
              <button
                onClick={() => resolvePendingEmailPrompt('cerrado')}
                className="flex-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition-all text-center"
              >
                Cerrado
              </button>
              <button
                onClick={() => resolvePendingEmailPrompt('mantener')}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all text-center"
              >
                Mantener en gestión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications Overlay */}
      <ToastContainer />
    </div>
  );
};
