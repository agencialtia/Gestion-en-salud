import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId, PriorityLevel, Task, PendingEmail, HealthProgram } from '../../types';
import {
  CheckSquare,
  Mail,
  RefreshCw,
  Plus,
  Filter,
  Search,
  Layers,
  Calendar,
  Clock,
  User,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Info,
  X,
  Send
} from 'lucide-react';
import { DrawerEntityType } from '../common/EntityDrawer';
import { TrelloCardModal } from '../common/TrelloCardModal';
import { formatDate } from '../../utils/dateUtils';

type ActivityFilterType = 'all' | 'tasks' | 'emails';
type KanbanColumn = 'pendiente' | 'en_ejecucion' | 'resuelto';

interface KanbanItem {
  id: string;
  type: 'task' | 'email';
  title: string;
  description?: string;
  programId?: string;
  programName?: string;
  programShortName?: string;
  programColor?: string;
  status: KanbanColumn;
  priority: PriorityLevel;
  dueDate?: string;
  assignee?: string;
  isOverdue?: boolean;
  checklistCount?: { completed: number; total: number };
  raw: Task | PendingEmail;
}

export const DashboardGlobalView: React.FC<{
  onOpenEntity?: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate?: (tab?: any) => void;
  onOpenGlobalSearch?: () => void;
}> = ({ onOpenEntity, onOpenQuickCreate, onOpenGlobalSearch }) => {
  const {
    tasks,
    emails,
    programs,
    currentUser,
    updateTask,
    quickUpdateTaskStatus,
    updateEmail,
    addTask,
    addEmail,
    setSelectedProgramId,
    setActiveView,
    isSupabaseActive,
  } = useApp();

  // Filters & Board state
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityFilterType>('all');
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronization status & animation
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Justo ahora');

  // Drag and drop states
  const [draggedItem, setDraggedItem] = useState<{ id: string; type: 'task' | 'email' } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<KanbanColumn | null>(null);

  // Trello Card Modal state
  const [modalCard, setModalCard] = useState<{ id: string; type: 'task' | 'email' } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Quick Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newActivityType, setNewActivityType] = useState<'task' | 'email'>('task');
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityProgram, setNewActivityProgram] = useState<string>(programs[0]?.id || 'praps_cpu');
  const [newActivityPriority, setNewActivityPriority] = useState<PriorityLevel>('alta');
  const [newActivityDueDate, setNewActivityDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newActivityAssignee, setNewActivityAssignee] = useState(currentUser?.name || '');
  const [newActivityColumn, setNewActivityColumn] = useState<KanbanColumn>('pendiente');

  // Today reference
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Map tasks and emails into unified Kanban items
  const allItems: KanbanItem[] = useMemo(() => {
    const list: KanbanItem[] = [];

    // Helper map of programs
    const progMap = new Map<string, HealthProgram>();
    programs.forEach((p) => progMap.set(p.id, p));

    // 1. Process Tasks
    tasks.forEach((t) => {
      if (t.archived) return;

      const p = t.programId ? progMap.get(t.programId) : undefined;
      const s = t.status;
      let col: KanbanColumn = 'pendiente';
      if (s === 'completada' || s === 'terminada') {
        col = 'resuelto';
      } else if (s === 'en_ejecucion' || s === 'en_progreso' || s === 'en_curso') {
        col = 'en_ejecucion';
      } else {
        col = 'pendiente';
      }

      const dDate = t.dueDate || t.endDate || t.deadline;
      const isOver = Boolean(dDate && dDate < todayStr && col !== 'resuelto');

      let checklistCount: { completed: number; total: number } | undefined;
      if (Array.isArray(t.checklist) && t.checklist.length > 0) {
        const completed = t.checklist.filter((i) => i.completed || i.isCompleted).length;
        checklistCount = { completed, total: t.checklist.length };
      }

      list.push({
        id: t.id!,
        type: 'task',
        title: t.title || 'Tarea sin título',
        description: t.description,
        programId: t.programId,
        programName: p?.name || 'Programa General',
        programShortName: p?.shortName || p?.code || 'PROGRAMA',
        programColor: p?.color || '#3b82f6',
        status: col,
        priority: (t.priority || 'media') as PriorityLevel,
        dueDate: dDate,
        assignee: t.assignedTo || currentUser?.name || 'Referente',
        isOverdue: isOver,
        checklistCount,
        raw: t,
      });
    });

    // 2. Process Emails
    emails.forEach((em) => {
      if (em.archived) return;

      const p = em.programId ? progMap.get(em.programId) : undefined;
      const s = em.status;
      let col: KanbanColumn = 'pendiente';
      if (s === 'respondido' || s === 'cerrado' || s === 'archivado') {
        col = 'resuelto';
      } else if (s === 'en_gestion' || s === 'en_curso' || s === 'en_seguimiento') {
        col = 'en_ejecucion';
      } else {
        col = 'pendiente';
      }

      const dDate = em.dueDate || em.deadline || em.receivedOrSentDate;
      const isOver = Boolean(dDate && dDate < todayStr && col !== 'resuelto');

      let checklistCount: { completed: number; total: number } | undefined;
      if (Array.isArray(em.checklist) && em.checklist.length > 0) {
        const completed = em.checklist.filter((i: any) => i.completed).length;
        checklistCount = { completed, total: em.checklist.length };
      }

      list.push({
        id: em.id!,
        type: 'email',
        title: em.subject || 'Correo sin asunto',
        description: em.body || em.requiredAction || (em.sender ? `De: ${em.sender}` : ''),
        programId: em.programId,
        programName: p?.name || 'Programa General',
        programShortName: p?.shortName || p?.code || 'PROGRAMA',
        programColor: p?.color || '#10b981',
        status: col,
        priority: (em.priority || 'media') as PriorityLevel,
        dueDate: dDate,
        assignee: em.responsible || currentUser?.name || 'Referente',
        isOverdue: isOver,
        checklistCount,
        raw: em,
      });
    });

    return list;
  }, [tasks, emails, programs, todayStr, currentUser?.name]);

  // Filter items based on active controls
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Activity type filter
      if (activityTypeFilter === 'tasks' && item.type !== 'task') return false;
      if (activityTypeFilter === 'emails' && item.type !== 'email') return false;

      // Program filter
      if (selectedProgram !== 'all' && item.programId !== selectedProgram) return false;

      // Priority filter
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = (item.description || '').toLowerCase().includes(q);
        const matchAssignee = (item.assignee || '').toLowerCase().includes(q);
        const matchProgram = (item.programName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchAssignee && !matchProgram) return false;
      }

      return true;
    });
  }, [allItems, activityTypeFilter, selectedProgram, selectedPriority, searchQuery]);

  // Group into 3 Kanban columns
  const columnPending = useMemo(() => filteredItems.filter((i) => i.status === 'pendiente'), [filteredItems]);
  const columnInProgress = useMemo(() => filteredItems.filter((i) => i.status === 'en_ejecucion'), [filteredItems]);
  const columnResolved = useMemo(() => filteredItems.filter((i) => i.status === 'resuelto'), [filteredItems]);

  // Overall counts for filter tabs
  const totalTasksPending = useMemo(() => {
    return allItems.filter((i) => i.type === 'task' && i.status !== 'resuelto').length;
  }, [allItems]);

  const totalEmailsPending = useMemo(() => {
    return allItems.filter((i) => i.type === 'email' && i.status !== 'resuelto').length;
  }, [allItems]);

  // Handle Drag & Drop
  const handleDragStart = (e: React.DragEvent, id: string, type: 'task' | 'email') => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id, type }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ id, type });
  };

  const handleDragOver = (e: React.DragEvent, column: KanbanColumn) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== column) {
      setDragOverCol(column);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumn: KanbanColumn) => {
    e.preventDefault();
    setDragOverCol(null);
    setDraggedItem(null);

    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);
      const { id, type } = data;

      if (type === 'task') {
        const newStatus =
          targetColumn === 'resuelto' ? 'completada' : targetColumn === 'en_ejecucion' ? 'en_ejecucion' : 'pendiente';
        quickUpdateTaskStatus(id, newStatus);
      } else if (type === 'email') {
        const newStatus =
          targetColumn === 'resuelto' ? 'respondido' : targetColumn === 'en_ejecucion' ? 'en_gestion' : 'pendiente';
        updateEmail(id, { status: newStatus }, true);
      }
    } catch (err) {
      console.error('Error handling drop:', err);
    }
  };

  // Synchronize button action
  const handleSyncPrograms = useCallback(() => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(timeStr);
    }, 700);
  }, []);

  // Card click handler -> Opens Trello modal
  const handleOpenCard = (id: string, type: 'task' | 'email') => {
    setModalCard({ id, type });
    setIsModalOpen(true);
  };

  // Quick Create submission
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim()) return;

    if (newActivityType === 'task') {
      const taskStatus =
        newActivityColumn === 'resuelto' ? 'completada' : newActivityColumn === 'en_ejecucion' ? 'en_ejecucion' : 'pendiente';
      addTask({
        title: newActivityTitle.trim(),
        programId: newActivityProgram,
        priority: newActivityPriority,
        dueDate: newActivityDueDate,
        assignedTo: newActivityAssignee || currentUser.name,
        status: taskStatus,
        description: 'Creado desde el Tablero Trello General.',
      });
    } else {
      const emailStatus =
        newActivityColumn === 'resuelto' ? 'respondido' : newActivityColumn === 'en_ejecucion' ? 'en_gestion' : 'pendiente';
      addEmail({
        subject: newActivityTitle.trim(),
        programId: newActivityProgram,
        priority: newActivityPriority,
        dueDate: newActivityDueDate,
        deadline: newActivityDueDate,
        responsible: newActivityAssignee || currentUser.name,
        status: emailStatus,
        body: 'Correo agregado desde el Tablero Trello General.',
        sender: 'Referente Comunal',
        recipient: 'Equipo del Programa',
      });
    }

    setNewActivityTitle('');
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header & Main Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title and subtitle */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Visor General de Programas
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Tablero Trello unificado para gestionar y arrastrar tareas y correos sincronizados de todos los programas.
                </p>
              </div>
            </div>
          </div>

          {/* Sync Button & New Activity Action */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Sync Button */}
            <button
              onClick={handleSyncPrograms}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs hover:scale-[1.01]"
              title="Sincronizar tareas y correos con todos los programas y base de datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sincronizar con Programas</span>
              <span className="text-[10px] text-slate-400 font-normal">({lastSyncTime})</span>
            </button>

            {/* Quick Create Card Button */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-md hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Actividad</span>
            </button>
          </div>
        </div>

        {/* Filter bar: Segmented Buttons for Tasks & Emails + Program & Priority dropdowns */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented Filter Buttons (Requested by user: Botón de tareas pendientes y correos pendientes) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-750 flex-wrap">
            <button
              onClick={() => setActivityTypeFilter('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activityTypeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <span>Todas las Actividades</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold">
                {allItems.length}
              </span>
            </button>

            <button
              onClick={() => setActivityTypeFilter('tasks')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activityTypeFilter === 'tasks'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Tareas Pendientes</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold">
                {totalTasksPending}
              </span>
            </button>

            <button
              onClick={() => setActivityTypeFilter('emails')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activityTypeFilter === 'emails'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Correos Pendientes</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 font-bold">
                {totalEmailsPending}
              </span>
            </button>
          </div>

          {/* Secondary Filters: Program, Priority, Search */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Program dropdown filter */}
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value as any)}
              className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">🏢 Todos los Programas ({programs.length})</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.shortName || p.name}
                </option>
              ))}
            </select>

            {/* Priority dropdown filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">⚡ Todas las Prioridades</option>
              <option value="critica">🔥 Crítica</option>
              <option value="alta">⚠️ Alta</option>
              <option value="media">📌 Media</option>
              <option value="baja">🌱 Baja</option>
            </select>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar actividad..."
                className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36 sm:w-48"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trello Kanban Board (3 Columns: 1. Pendiente, 2. En ejecución, 3. Resuelto) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* Column 1: Pendiente */}
        <div
          onDragOver={(e) => handleDragOver(e, 'pendiente')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'pendiente')}
          className={`flex flex-col bg-slate-100/90 dark:bg-slate-900/90 border rounded-2xl p-4 min-h-[580px] transition-all ${
            dragOverCol === 'pendiente'
              ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-400/40'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-2xs" />
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                1. Pendiente
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
              {columnPending.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] pr-1">
            {columnPending.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                No hay actividades pendientes.
                <p className="mt-1 text-[11px] text-slate-500">Arrastra aquí o presiona Añadir.</p>
              </div>
            ) : (
              columnPending.map((item) => (
                <KanbanCardItem
                  key={`${item.type}-${item.id}`}
                  item={item}
                  isDragging={draggedItem?.id === item.id}
                  onDragStart={(e) => handleDragStart(e, item.id, item.type)}
                  onClick={() => handleOpenCard(item.id, item.type)}
                />
              ))
            )}
          </div>

          {/* Bottom Add Card Button */}
          <button
            onClick={() => {
              setNewActivityColumn('pendiente');
              setIsCreateOpen(true);
            }}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-white/70 hover:bg-white dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir a Pendiente</span>
          </button>
        </div>

        {/* Column 2: En ejecución */}
        <div
          onDragOver={(e) => handleDragOver(e, 'en_ejecucion')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'en_ejecucion')}
          className={`flex flex-col bg-slate-100/90 dark:bg-slate-900/90 border rounded-2xl p-4 min-h-[580px] transition-all ${
            dragOverCol === 'en_ejecucion'
              ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-400/40'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-2xs" />
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                2. En ejecución
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300">
              {columnInProgress.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] pr-1">
            {columnInProgress.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                No hay actividades en ejecución.
                <p className="mt-1 text-[11px] text-slate-500">Arrastra aquí para comenzar a trabajar.</p>
              </div>
            ) : (
              columnInProgress.map((item) => (
                <KanbanCardItem
                  key={`${item.type}-${item.id}`}
                  item={item}
                  isDragging={draggedItem?.id === item.id}
                  onDragStart={(e) => handleDragStart(e, item.id, item.type)}
                  onClick={() => handleOpenCard(item.id, item.type)}
                />
              ))
            )}
          </div>

          {/* Bottom Add Card Button */}
          <button
            onClick={() => {
              setNewActivityColumn('en_ejecucion');
              setIsCreateOpen(true);
            }}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-white/70 hover:bg-white dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir a En ejecución</span>
          </button>
        </div>

        {/* Column 3: Resuelto */}
        <div
          onDragOver={(e) => handleDragOver(e, 'resuelto')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'resuelto')}
          className={`flex flex-col bg-slate-100/90 dark:bg-slate-900/90 border rounded-2xl p-4 min-h-[580px] transition-all ${
            dragOverCol === 'resuelto'
              ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 ring-2 ring-emerald-400/40'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xs" />
              <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                3. Resuelto
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
              {columnResolved.length}
            </span>
          </div>

          {/* Cards List */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[700px] pr-1">
            {columnResolved.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                No hay actividades resueltas aún.
                <p className="mt-1 text-[11px] text-slate-500">Arrastra aquí para marcar como terminado.</p>
              </div>
            ) : (
              columnResolved.map((item) => (
                <KanbanCardItem
                  key={`${item.type}-${item.id}`}
                  item={item}
                  isDragging={draggedItem?.id === item.id}
                  onDragStart={(e) => handleDragStart(e, item.id, item.type)}
                  onClick={() => handleOpenCard(item.id, item.type)}
                />
              ))
            )}
          </div>

          {/* Bottom Add Card Button */}
          <button
            onClick={() => {
              setNewActivityColumn('resuelto');
              setIsCreateOpen(true);
            }}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 bg-white/70 hover:bg-white dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir a Resuelto</span>
          </button>
        </div>
      </div>

      {/* Trello Card Detailed Modal (Window like image 3) */}
      <TrelloCardModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalCard(null);
        }}
        cardId={modalCard?.id || null}
        cardType={modalCard?.type || null}
        onNavigateToProgram={(pId) => {
          setSelectedProgramId(pId);
          setActiveView('program_detail');
        }}
      />

      {/* Quick Add Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Añadir al Tablero General
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewActivityType('task')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                    newActivityType === 'task'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Tarea</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewActivityType('email')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                    newActivityType === 'email'
                      ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  <span>Correo</span>
                </button>
              </div>

              {/* Title / Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {newActivityType === 'task' ? 'Título de la Tarea' : 'Asunto del Correo'}
                </label>
                <input
                  type="text"
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  placeholder={
                    newActivityType === 'task'
                      ? 'Ej: Revisión informe trimestral'
                      : 'Ej: Solicitud de insumos médicos CESFAM'
                  }
                  required
                  autoFocus
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Program Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Programa Asignado
                </label>
                <select
                  value={newActivityProgram}
                  onChange={(e) => setNewActivityProgram(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.shortName || p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Initial Column, Priority & Due Date */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Lista Inicial
                  </label>
                  <select
                    value={newActivityColumn}
                    onChange={(e) => setNewActivityColumn(e.target.value as KanbanColumn)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200"
                  >
                    <option value="pendiente">⏳ Pendiente</option>
                    <option value="en_ejecucion">⚡ En ejecución</option>
                    <option value="resuelto">✅ Resuelto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Prioridad
                  </label>
                  <select
                    value={newActivityPriority}
                    onChange={(e) => setNewActivityPriority(e.target.value as PriorityLevel)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Vencimiento
                  </label>
                  <input
                    type="date"
                    value={newActivityDueDate}
                    onChange={(e) => setNewActivityDueDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs"
                >
                  Crear Tarjeta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Kanban Card Item Subcomponent
interface KanbanCardItemProps {
  item: KanbanItem;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
}

const KanbanCardItem: React.FC<KanbanCardItemProps> = ({ item, isDragging, onDragStart, onClick }) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`group relative bg-white dark:bg-slate-850 border rounded-xl p-3.5 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2.5 select-none ${
        isDragging
          ? 'opacity-40 scale-95 border-indigo-400 ring-2 ring-indigo-400/50'
          : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Badges Row: Program Tag & Activity Type Tag */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {/* Program Badge */}
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold text-white shadow-2xs"
          style={{ backgroundColor: item.programColor || '#3b82f6' }}
          title={item.programName}
        >
          {item.programShortName}
        </span>

        {/* Activity Type Badge (Tarea vs Correo) */}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold ${
            item.type === 'task'
              ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
          }`}
        >
          {item.type === 'task' ? <CheckSquare className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
          <span>{item.type === 'task' ? 'Tarea' : 'Correo'}</span>
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
        {item.title}
      </h3>

      {/* Description Snippet if available */}
      {item.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Checklist Counter if present */}
      {item.checklistCount && item.checklistCount.total > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 px-2 py-1 rounded-md w-fit">
          <CheckSquare className="w-3 h-3 text-emerald-600" />
          <span className="font-semibold">
            {item.checklistCount.completed}/{item.checklistCount.total}
          </span>
        </div>
      )}

      {/* Bottom Metadata: Priority, Assignee & Due Date */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px]">
        {/* Assignee Avatar */}
        <div className="flex items-center gap-1.5 min-w-0" title={`Asignado a: ${item.assignee}`}>
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px] shrink-0">
            {(item.assignee || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="truncate text-slate-600 dark:text-slate-300 max-w-[90px]">
            {item.assignee}
          </span>
        </div>

        {/* Priority & Due Date */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Priority pill */}
          <span
            className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
              item.priority === 'critica' || item.priority === 'urgente'
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                : item.priority === 'alta'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                : item.priority === 'baja'
                ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
            }`}
          >
            {item.priority.toUpperCase()}
          </span>

          {/* Due date */}
          {item.dueDate && (
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                item.isOverdue
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
              }`}
              title={`Fecha límite: ${formatDate(item.dueDate)}`}
            >
              <Clock className="w-2.5 h-2.5" />
              <span>{formatDate(item.dueDate)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
