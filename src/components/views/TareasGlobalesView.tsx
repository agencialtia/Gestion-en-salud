import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId, PriorityLevel, TaskStatus, Task, isTaskOverdue, isTaskExpiringSoon } from '../../types';
import {
  ListTodo,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldAlert,
  Flame,
  AlertTriangle,
  Check,
  RotateCcw,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Layers,
  FolderPlus,
  Settings2,
  CheckSquare,
  Square,
  FileText,
  Paperclip,
  ArrowUpDown,
  Download,
  ExternalLink,
  Tag,
  User,
  X,
  PlusCircle,
  PlayCircle
} from 'lucide-react';
import { ProgramBadge, PriorityChip, TaskUrgencyChip, TaskStatusChip } from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDate } from '../../utils/dateUtils';

type GroupByOption = 'none' | 'status' | 'due' | 'program' | 'responsible' | 'category' | 'priority';
type SortByOption = 'urgency' | 'due_date' | 'priority' | 'created_at' | 'title' | 'responsible';
type QuickFilterOption = 'all_pending' | 'overdue' | 'urgent' | 'expiring_soon' | 'in_progress' | 'to_do' | 'done' | 'all';

export const TareasGlobalesView: React.FC<{
  onOpenEntity: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate: () => void;
}> = ({ onOpenEntity, onOpenQuickCreate }) => {
  const {
    tasks,
    taskCategories,
    programs,
    currentUser,
    addTask,
    updateTask,
    quickUpdateTaskStatus,
    completeTask,
    reopenTask,
    duplicateTask,
    deleteTaskWithConfirmation,
    toggleTaskUrgent,
    addTaskCategory,
    updateTaskCategory,
    toggleTaskCategoryStatus,
    exportTableCSV,
    showToast,
  } = useApp();

  const todayStr = '2026-08-15';

  // Filters & Controls State
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterOption>('all_pending');
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<'all' | 'urgent_only'>('all');
  const [groupBy, setGroupBy] = useState<GroupByOption>('due');
  const [sortBy, setSortBy] = useState<SortByOption>('urgency');

  // Quick inline task creation state
  const [isInlineOpen, setIsInlineOpen] = useState(false);
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineProgram, setInlineProgram] = useState<ProgramId>('praps_cpu');
  const [inlineCategory, setInlineCategory] = useState('Gestión');
  const [inlineDueDate, setInlineDueDate] = useState('2026-08-18');
  const [inlineResponsible, setInlineResponsible] = useState(currentUser.name);
  const [inlinePriority, setInlinePriority] = useState<PriorityLevel>('alta');
  const [inlineIsUrgent, setInlineIsUrgent] = useState(false);

  // Category Manager Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('indigo');
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Delete Confirmation Dialog State
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Operational Metrics (10-second rule)
  const metrics = useMemo(() => {
    const activeTasks = tasks.filter((t) => !t.archived);
    const overdue = activeTasks.filter((t) => isTaskOverdue(t));
    const urgent = activeTasks.filter((t) => !['terminada', 'completada'].includes(t.status) && (t.isUrgent || t.priority === 'critica'));
    const expiringSoon = activeTasks.filter((t) => isTaskExpiringSoon(t));
    const inProgress = activeTasks.filter((t) => ['en_ejecucion', 'en_curso', 'bloqueada'].includes(t.status));
    const toDo = activeTasks.filter((t) => ['por_hacer', 'pendiente'].includes(t.status));
    const done = activeTasks.filter((t) => ['terminada', 'completada'].includes(t.status));
    const totalPending = activeTasks.filter((t) => !['terminada', 'completada'].includes(t.status));

    return {
      total: activeTasks.length,
      totalPending: totalPending.length,
      overdue: overdue.length,
      urgent: urgent.length,
      expiringSoon: expiringSoon.length,
      inProgress: inProgress.length,
      toDo: toDo.length,
      done: done.length,
    };
  }, [tasks]);

  // Relative Date Helper
  const getRelativeDueInfo = (task: Task) => {
    const isDone = ['terminada', 'completada'].includes(task.status);
    if (isDone) {
      return {
        label: formatDate(task.dueDate),
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        isOverdue: false,
        isExpiringSoon: false,
        isToday: false,
      };
    }

    const taskDate = new Date(task.dueDate + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays < 0) {
      const daysOverdue = Math.abs(diffDays);
      return {
        label: `Vencida hace ${daysOverdue} día${daysOverdue > 1 ? 's' : ''}`,
        sub: formatDate(task.dueDate),
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-bold animate-pulse',
        isOverdue: true,
        isExpiringSoon: false,
        isToday: false,
      };
    }
    if (diffDays === 0) {
      return {
        label: 'Vence hoy',
        sub: formatDate(task.dueDate),
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
        isOverdue: false,
        isExpiringSoon: true,
        isToday: true,
      };
    }
    if (diffDays === 1) {
      return {
        label: 'Vence mañana',
        sub: formatDate(task.dueDate),
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
        isOverdue: false,
        isExpiringSoon: true,
        isToday: false,
      };
    }
    if (diffDays <= 3) {
      return {
        label: `Vence en ${diffDays} días`,
        sub: formatDate(task.dueDate),
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-medium',
        isOverdue: false,
        isExpiringSoon: true,
        isToday: false,
      };
    }
    return {
      label: formatDate(task.dueDate),
      sub: `En ${diffDays} días`,
      badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
      isOverdue: false,
      isExpiringSoon: false,
      isToday: false,
    };
  };

  // Filter and Sort Tasks
  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks.filter((t) => !t.archived);

    // Quick filter cards
    if (quickFilter === 'all_pending') {
      result = result.filter((t) => !['terminada', 'completada'].includes(t.status));
    } else if (quickFilter === 'overdue') {
      result = result.filter((t) => isTaskOverdue(t));
    } else if (quickFilter === 'urgent') {
      result = result.filter((t) => !['terminada', 'completada'].includes(t.status) && (t.isUrgent || t.priority === 'critica'));
    } else if (quickFilter === 'expiring_soon') {
      result = result.filter((t) => isTaskExpiringSoon(t));
    } else if (quickFilter === 'in_progress') {
      result = result.filter((t) => ['en_ejecucion', 'en_curso', 'bloqueada'].includes(t.status));
    } else if (quickFilter === 'to_do') {
      result = result.filter((t) => ['por_hacer', 'pendiente'].includes(t.status));
    } else if (quickFilter === 'done') {
      result = result.filter((t) => ['terminada', 'completada'].includes(t.status));
    }

    // Additional dropdown filters
    if (selectedProgram !== 'all') {
      result = result.filter((t) => t.programId === selectedProgram);
    }
    if (selectedCategory !== 'all') {
      result = result.filter((t) => (t.category || 'General') === selectedCategory);
    }
    if (selectedPriority !== 'all') {
      result = result.filter((t) => t.priority === selectedPriority);
    }
    if (selectedUrgency === 'urgent_only') {
      result = result.filter((t) => t.isUrgent || t.priority === 'critica');
    }

    // Text search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(q);
        const respMatch = (t.responsible || '').toLowerCase().includes(q);
        const descMatch = (t.description || '').toLowerCase().includes(q);
        const catMatch = (t.category || '').toLowerCase().includes(q);
        const progMatch = t.programId.toLowerCase().includes(q);
        const originMatch = (t.origin || '').toLowerCase().includes(q);
        return titleMatch || respMatch || descMatch || catMatch || progMatch || originMatch;
      });
    }

    // Sorting
    const priorityWeights: Record<string, number> = { critica: 4, alta: 3, media: 2, baja: 1 };

    result.sort((a, b) => {
      const aDone = ['terminada', 'completada'].includes(a.status);
      const bDone = ['terminada', 'completada'].includes(b.status);

      // Finished tasks sink to the bottom unless sorting by title/responsible
      if (aDone !== bDone && sortBy !== 'title' && sortBy !== 'responsible') {
        return aDone ? 1 : -1;
      }

      if (sortBy === 'urgency') {
        const aOverdue = isTaskOverdue(a);
        const bOverdue = isTaskOverdue(b);
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

        const aUrgent = a.isUrgent || a.priority === 'critica';
        const bUrgent = b.isUrgent || b.priority === 'critica';
        if (aUrgent !== bUrgent) return aUrgent ? -1 : 1;

        // Compare due dates
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        return (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
      }

      if (sortBy === 'due_date') {
        return a.dueDate.localeCompare(b.dueDate);
      }

      if (sortBy === 'priority') {
        const pDiff = (priorityWeights[b.priority] || 0) - (priorityWeights[a.priority] || 0);
        if (pDiff !== 0) return pDiff;
        return a.dueDate.localeCompare(b.dueDate);
      }

      if (sortBy === 'created_at') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }

      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }

      if (sortBy === 'responsible') {
        return (a.responsible || '').localeCompare(b.responsible || '');
      }

      return 0;
    });

    return result;
  }, [tasks, quickFilter, selectedProgram, selectedCategory, selectedPriority, selectedUrgency, search, sortBy]);

  // Grouped Tasks
  const groupedSections = useMemo(() => {
    if (groupBy === 'none') {
      return [{ title: 'Todas las tareas', key: 'all', tasks: filteredAndSortedTasks }];
    }

    if (groupBy === 'status') {
      const groups: Record<string, { title: string; key: string; badgeClass: string; tasks: Task[] }> = {
        en_ejecucion: { title: 'En Ejecución', key: 'en_ejecucion', badgeClass: 'bg-blue-100 text-blue-800', tasks: [] },
        por_hacer: { title: 'Por Hacer', key: 'por_hacer', badgeClass: 'bg-slate-100 text-slate-800', tasks: [] },
        terminada: { title: 'Terminadas', key: 'terminada', badgeClass: 'bg-emerald-100 text-emerald-800', tasks: [] },
      };

      filteredAndSortedTasks.forEach((t) => {
        if (['terminada', 'completada'].includes(t.status)) {
          groups.terminada.tasks.push(t);
        } else if (['en_ejecucion', 'en_curso', 'bloqueada'].includes(t.status)) {
          groups.en_ejecucion.tasks.push(t);
        } else {
          groups.por_hacer.tasks.push(t);
        }
      });

      return Object.values(groups).filter((g) => g.tasks.length > 0);
    }

    if (groupBy === 'due') {
      const groups: Record<string, { title: string; key: string; badgeClass: string; tasks: Task[] }> = {
        overdue: { title: '🚨 Vencidas (Atención Inmediata)', key: 'overdue', badgeClass: 'bg-rose-100 text-rose-800 border-rose-200', tasks: [] },
        today: { title: '🔔 Vencen Hoy', key: 'today', badgeClass: 'bg-amber-100 text-amber-900 border-amber-200', tasks: [] },
        soon: { title: '⏱️ Próximos 3 Días', key: 'soon', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200', tasks: [] },
        later: { title: '📅 Próximas Semanas', key: 'later', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200', tasks: [] },
        done: { title: '✅ Terminadas', key: 'done', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200', tasks: [] },
      };

      filteredAndSortedTasks.forEach((t) => {
        if (['terminada', 'completada'].includes(t.status)) {
          groups.done.tasks.push(t);
          return;
        }
        if (isTaskOverdue(t)) {
          groups.overdue.tasks.push(t);
          return;
        }
        if (t.dueDate === todayStr) {
          groups.today.tasks.push(t);
          return;
        }
        if (isTaskExpiringSoon(t)) {
          groups.soon.tasks.push(t);
          return;
        }
        groups.later.tasks.push(t);
      });

      return Object.values(groups).filter((g) => g.tasks.length > 0);
    }

    if (groupBy === 'program') {
      const map: Record<string, Task[]> = {};
      filteredAndSortedTasks.forEach((t) => {
        const progKey = t.programId;
        if (!map[progKey]) map[progKey] = [];
        map[progKey].push(t);
      });

      return Object.keys(map).map((pId) => {
        const prog = programs.find((p) => p.id === pId);
        return {
          title: prog ? prog.shortName : pId,
          key: pId,
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          tasks: map[pId],
        };
      });
    }

    if (groupBy === 'responsible') {
      const map: Record<string, Task[]> = {};
      filteredAndSortedTasks.forEach((t) => {
        const resp = t.responsible || 'Sin Asignar';
        if (!map[resp]) map[resp] = [];
        map[resp].push(t);
      });

      return Object.keys(map).map((resp) => ({
        title: resp,
        key: resp,
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
        tasks: map[resp],
      }));
    }

    if (groupBy === 'category') {
      const map: Record<string, Task[]> = {};
      filteredAndSortedTasks.forEach((t) => {
        const cat = t.category || 'General';
        if (!map[cat]) map[cat] = [];
        map[cat].push(t);
      });

      return Object.keys(map).map((cat) => ({
        title: cat,
        key: cat,
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
        tasks: map[cat],
      }));
    }

    if (groupBy === 'priority') {
      const priorityTitles: Record<string, string> = {
        critica: '🔴 Prioridad Crítica',
        alta: '🟠 Prioridad Alta',
        media: '🔵 Prioridad Media',
        baja: '⚪ Prioridad Baja',
      };
      const map: Record<string, Task[]> = { critica: [], alta: [], media: [], baja: [] };
      filteredAndSortedTasks.forEach((t) => {
        const prio = t.priority || 'media';
        if (!map[prio]) map[prio] = [];
        map[prio].push(t);
      });

      return ['critica', 'alta', 'media', 'baja']
        .filter((p) => map[p]?.length > 0)
        .map((p) => ({
          title: priorityTitles[p] || p,
          key: p,
          badgeClass: p === 'critica' ? 'bg-rose-100 text-rose-800' : p === 'alta' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700',
          tasks: map[p],
        }));
    }

    return [{ title: 'Tareas', key: 'default', tasks: filteredAndSortedTasks }];
  }, [groupBy, filteredAndSortedTasks, programs]);

  // Handle Quick Inline Submit
  const handleInlineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;

    addTask({
      title: inlineTitle.trim(),
      programId: inlineProgram,
      responsible: inlineResponsible || currentUser.name,
      category: inlineCategory,
      priority: inlinePriority,
      isUrgent: inlineIsUrgent,
      dueDate: inlineDueDate,
      status: 'por_hacer',
      origin: 'Manual',
    });

    setInlineTitle('');
    setInlineIsUrgent(false);
    showToast('Tarea creada rápidamente', 'success');
  };

  // Handle Category Creation
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addTaskCategory(newCatName.trim(), newCatColor);
    setNewCatName('');
    showToast(`Categoría "${newCatName}" creada`, 'success');
  };

  // Request soft-delete
  const promptDeleteTask = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTask = () => {
    if (!taskToDelete) return;
    deleteTaskWithConfirmation(taskToDelete.id);
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  return (
    <div id="view-tareas-globales" className="space-y-5 animate-in fade-in duration-150 text-left">
      {/* 1. HEADER OPERATIVO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <ListTodo className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Gestor Operativo de Tareas
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Control de pendientes, prioridades, plazos y responsables en los 6 programas de salud
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => exportTableCSV('tasks', selectedProgram === 'all' ? undefined : selectedProgram)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
            title="Exportar CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Tag className="h-3.5 w-3.5 text-purple-600" />
            <span>Categorías</span>
          </button>

          <button
            type="button"
            onClick={onOpenQuickCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Tarea</span>
          </button>
        </div>
      </div>

      {/* 2. OPERATIONAL SUMMARY METRIC CARDS (10-SECOND RULE) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {/* Vencidas */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'overdue' ? 'all_pending' : 'overdue')}
          className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
            quickFilter === 'overdue'
              ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-500/20 shadow-sm'
              : metrics.overdue > 0
              ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
              <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
              Vencidas
            </span>
            {metrics.overdue > 0 && (
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-rose-800 tracking-tight">{metrics.overdue}</span>
            <span className="text-[10px] text-rose-600 font-semibold">urgente resolver</span>
          </div>
        </button>

        {/* Urgentes */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'urgent' ? 'all_pending' : 'urgent')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            quickFilter === 'urgent'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-sm'
              : metrics.urgent > 0
              ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-amber-600" />
              Urgentes 🔥
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-900 tracking-tight">{metrics.urgent}</span>
            <span className="text-[10px] text-amber-700 font-semibold">atención prioritaria</span>
          </div>
        </button>

        {/* Vencen ≤ 3 días */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'expiring_soon' ? 'all_pending' : 'expiring_soon')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            quickFilter === 'expiring_soon'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              Vencen ≤ 3 días
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800 tracking-tight">{metrics.expiringSoon}</span>
            <span className="text-[10px] text-slate-500 font-medium">próximas</span>
          </div>
        </button>

        {/* En Ejecución */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'in_progress' ? 'all_pending' : 'in_progress')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            quickFilter === 'in_progress'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1">
              <PlayCircle className="h-3.5 w-3.5 text-blue-600" />
              En Ejecución
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-blue-900 tracking-tight">{metrics.inProgress}</span>
            <span className="text-[10px] text-blue-600 font-medium">activas</span>
          </div>
        </button>

        {/* Por Hacer */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'to_do' ? 'all_pending' : 'to_do')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            quickFilter === 'to_do'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5 text-slate-500" />
              Por Hacer
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-800 tracking-tight">{metrics.toDo}</span>
            <span className="text-[10px] text-slate-500 font-medium">en cola</span>
          </div>
        </button>

        {/* Terminadas */}
        <button
          type="button"
          onClick={() => setQuickFilter(quickFilter === 'done' ? 'all_pending' : 'done')}
          className={`p-3 rounded-2xl border text-left transition-all ${
            quickFilter === 'done'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Terminadas
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-800 tracking-tight">{metrics.done}</span>
            <span className="text-[10px] text-emerald-600 font-medium">resueltas</span>
          </div>
        </button>
      </div>

      {/* Active Quick Filter Pill if set */}
      {quickFilter !== 'all_pending' && (
        <div className="flex items-center justify-between p-2.5 px-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-indigo-600" />
            <span>
              Vista filtrada por:{' '}
              <strong>
                {quickFilter === 'overdue' && '🚨 Tareas Vencidas'}
                {quickFilter === 'urgent' && '🔥 Tareas Urgentes'}
                {quickFilter === 'expiring_soon' && '⏱️ Tareas que Vencen en ≤ 3 Días'}
                {quickFilter === 'in_progress' && '⚡ Tareas En Ejecución'}
                {quickFilter === 'to_do' && '📋 Tareas Por Hacer'}
                {quickFilter === 'done' && '✅ Tareas Terminadas'}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setQuickFilter('all_pending')}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1"
          >
            <X className="h-3.5 w-3.5" />
            Restablecer a Pendientes
          </button>
        </div>
      )}

      {/* 3. LIGHTNING FAST INLINE TASK CREATOR (COLLAPSIBLE / ALWAYS ACCESSIBLE) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsInlineOpen(!isInlineOpen)}
            className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors"
          >
            <span className={`p-1 rounded bg-indigo-50 text-indigo-600 transition-transform ${isInlineOpen ? 'rotate-90' : ''}`}>
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
            <span>+ Creación Rápida de Tarea (en 3 segundos)</span>
          </button>
          {!isInlineOpen && (
            <span className="text-[11px] text-slate-400">Haz clic para desplegar barra rápida</span>
          )}
        </div>

        {isInlineOpen && (
          <form onSubmit={handleInlineSubmit} className="mt-3 pt-3 border-t border-slate-100 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <div className="sm:col-span-4">
                <input
                  type="text"
                  required
                  placeholder="Título de la tarea o acción operativa..."
                  value={inlineTitle}
                  onChange={(e) => setInlineTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  autoFocus
                />
              </div>
              <div className="sm:col-span-2">
                <select
                  value={inlineProgram}
                  onChange={(e) => setInlineProgram(e.target.value as ProgramId)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 font-medium"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.shortName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <select
                  value={inlineCategory}
                  onChange={(e) => setInlineCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800"
                >
                  {taskCategories.filter((c) => c.isActive).map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <input
                  type="date"
                  required
                  value={inlineDueDate}
                  onChange={(e) => setInlineDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs text-slate-800"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Responsable"
                  value={inlineResponsible}
                  onChange={(e) => setInlineResponsible(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-2.5 py-2 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inlineIsUrgent}
                    onChange={(e) => setInlineIsUrgent(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 h-3.5 w-3.5"
                  />
                  <span>🔥 Marcar como Urgente</span>
                </label>

                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <span>Prioridad:</span>
                  <select
                    value={inlinePriority}
                    onChange={(e) => setInlinePriority(e.target.value as PriorityLevel)}
                    className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 font-medium"
                  >
                    <option value="critica">Crítica</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsInlineOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Agregar Tarea</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* 4. CONTROL BAR: SEARCH, FILTERS, GROUPING & SORTING */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search bar */}
          <div className="sm:col-span-4">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Búsqueda en tiempo real</label>
            <div className="relative">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por título, responsable, categoría, origen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Program filter */}
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Programa</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="all">Todos los programas ({programs.length})</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="all">Todas las categorías</option>
              {taskCategories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority filter */}
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Prioridad</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
            >
              <option value="all">Todas las prioridades</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>

          {/* Urgency toggle filter */}
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Filtro Urgencia</label>
            <button
              type="button"
              onClick={() => setSelectedUrgency(selectedUrgency === 'urgent_only' ? 'all' : 'urgent_only')}
              className={`w-full py-1.5 px-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                selectedUrgency === 'urgent_only'
                  ? 'bg-rose-50 border-rose-300 text-rose-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>🔥</span>
              <span>{selectedUrgency === 'urgent_only' ? 'Solo Urgentes' : 'Todas'}</span>
            </button>
          </div>
        </div>

        {/* Second row: Grouping and Sorting options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              Agrupar por:
            </span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
            >
              <option value="due">Vencimiento (Vencidas, Hoy, Próximas)</option>
              <option value="status">Estado (Por hacer, En ejecución, Terminadas)</option>
              <option value="program">Programa</option>
              <option value="responsible">Responsable</option>
              <option value="category">Categoría</option>
              <option value="priority">Prioridad</option>
              <option value="none">Sin agrupación (Lista continua)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              Ordenar por:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortByOption)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-800"
            >
              <option value="urgency">Mayor Urgencia & Vencimiento</option>
              <option value="due_date">Fecha Límite</option>
              <option value="priority">Nivel de Prioridad</option>
              <option value="created_at">Más Recientes</option>
              <option value="title">Título (A-Z)</option>
              <option value="responsible">Responsable (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. TASK LIST / SECTIONS */}
      <div className="space-y-6">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
            <div>
              <p className="text-sm font-bold text-slate-800">No se encontraron tareas con los filtros actuales</p>
              <p className="text-xs text-slate-400 mt-0.5">Prueba ajustando los criterios de búsqueda o agrega una nueva tarea.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setQuickFilter('all_pending');
                setSelectedProgram('all');
                setSelectedCategory('all');
                setSelectedPriority('all');
                setSelectedUrgency('all');
                setSearch('');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
            >
              Restablecer todos los filtros
            </button>
          </div>
        ) : (
          groupedSections.map((section) => (
            <div key={section.key} className="space-y-2">
              {/* Group Header */}
              {groupBy !== 'none' && (
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      {section.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                      {section.tasks.length}
                    </span>
                  </div>
                </div>
              )}

              {/* Task Items */}
              <div className="space-y-2">
                {section.tasks.map((task) => {
                  const isDone = ['terminada', 'completada'].includes(task.status);
                  const isOverdue = isTaskOverdue(task);
                  const isUrgent = task.isUrgent || task.priority === 'critica';
                  const dueInfo = getRelativeDueInfo(task);
                  const checklistTotal = task.checklist?.length || 0;
                  const checklistDone = task.checklist?.filter((c) => c.isCompleted).length || 0;
                  const attachmentCount = task.attachments?.length || 0;

                  return (
                    <div
                      key={task.id}
                      className={`p-3 sm:p-3.5 rounded-2xl border transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                        isDone
                          ? 'bg-slate-50/60 border-slate-200 opacity-75'
                          : isOverdue
                          ? 'bg-rose-50/30 border-rose-300 ring-1 ring-rose-500/10'
                          : isUrgent
                          ? 'bg-amber-50/20 border-amber-200'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Left: Checkbox + Content */}
                      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        {/* 1-Click Complete Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isDone) {
                              reopenTask(task.id);
                            } else {
                              completeTask(task.id);
                            }
                          }}
                          className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all shrink-0 mt-0.5 sm:mt-0 cursor-pointer ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                              : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-transparent hover:text-emerald-600'
                          }`}
                          title={isDone ? 'Reabrir tarea' : 'Marcar como terminada'}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[3]" />
                        </button>

                        {/* 1-Click Urgency Toggle */}
                        <button
                          type="button"
                          onClick={() => toggleTaskUrgent(task.id)}
                          className={`p-1 rounded transition-colors shrink-0 ${
                            isUrgent ? 'text-rose-600 hover:text-rose-700' : 'text-slate-300 hover:text-amber-500'
                          }`}
                          title={isUrgent ? 'Quitar urgencia' : 'Marcar como urgente'}
                        >
                          <Flame className={`h-4 w-4 ${isUrgent ? 'fill-rose-500' : ''}`} />
                        </button>

                        {/* Title, Category, Program, Badges */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              onClick={() => onOpenEntity('task', task.id)}
                              className={`font-bold text-slate-900 hover:text-indigo-600 cursor-pointer text-xs sm:text-sm tracking-tight ${
                                isDone ? 'line-through text-slate-400' : ''
                              }`}
                            >
                              {task.title}
                            </span>

                            {/* Category Badge */}
                            {task.category && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                {task.category}
                              </span>
                            )}

                            {/* Program Badge */}
                            <ProgramBadge programId={task.programId} />

                            {/* Origin tag if exists and not manual */}
                            {task.origin && task.origin !== 'Manual' && (
                              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {task.origin}
                              </span>
                            )}
                          </div>

                          {/* Secondary meta info: Responsible, Due date, Checklist counter */}
                          <div className="flex items-center gap-2.5 text-[11px] text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-slate-700">
                              <User className="h-3 w-3 text-slate-400" />
                              <span>{task.responsible || 'Sin responsable'}</span>
                            </span>

                            <span>•</span>

                            {/* Relative Due Date badge */}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${dueInfo.badgeClass}`}>
                              <Calendar className="h-3 w-3" />
                              <span>{dueInfo.label}</span>
                              {dueInfo.sub && <span className="opacity-70 font-normal">({dueInfo.sub})</span>}
                            </span>

                            {/* Checklist status if any */}
                            {checklistTotal > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-medium text-slate-600">
                                  <CheckSquare className="h-3 w-3 text-indigo-500" />
                                  <span>{checklistDone}/{checklistTotal} subtareas</span>
                                </span>
                              </>
                            )}

                            {/* Attachments status if any */}
                            {attachmentCount > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 font-medium text-slate-600">
                                  <Paperclip className="h-3 w-3 text-indigo-500" />
                                  <span>{attachmentCount} adjunto{attachmentCount > 1 ? 's' : ''}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Status Selector, Priority Chip, and Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Urgency Selector */}
                        <TaskUrgencyChip
                          isUrgent={isUrgent}
                          onChange={(urgent) => {
                            updateTask(task.id, { isUrgent: urgent, priority: urgent ? 'critica' : 'media' }, true);
                          }}
                        />

                        {/* 3-State Direct Selector */}
                        <TaskStatusChip
                          status={task.status}
                          onChange={(newStatus) => quickUpdateTaskStatus(task.id, newStatus)}
                        />

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => duplicateTask(task.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Duplicar tarea"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => promptDeleteTask(task)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar tarea"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenEntity('task', task.id)}
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                          >
                            Ficha
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 6. CATEGORY MANAGEMENT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900">Gestión de Categorías de Tareas</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* List of existing categories */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {taskCategories.map((cat) => {
                const count = tasks.filter((t) => !t.archived && t.category === cat.name).length;
                const isEditing = editingCatId === cat.id;

                return (
                  <div
                    key={cat.id}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (editingCatName.trim()) {
                              updateTaskCategory(cat.id, { name: editingCatName.trim() });
                            }
                            setEditingCatId(null);
                          }}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-xs font-bold"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs font-medium"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                          <span className="font-bold text-slate-800">{cat.name}</span>
                          <span className="text-[11px] text-slate-500">({count} tareas)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatName(cat.name);
                            }}
                            className="px-2 py-1 rounded hover:bg-slate-200 text-slate-600 text-[11px] font-medium"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleTaskCategoryStatus(cat.id)}
                            className={`px-2 py-1 rounded text-[11px] font-bold ${
                              cat.isActive ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 bg-slate-200'
                            }`}
                          >
                            {cat.isActive ? 'Activa' : 'Inactiva'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add new category form */}
            <form onSubmit={handleCreateCategory} className="pt-3 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Agregar Nueva Categoría</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ej. Auditoría, Compras, Informes REM..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 shadow-xs transition-colors shrink-0"
                >
                  Agregar
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. SOFT DELETE CONFIRM DIALOG WITH 'OK' VALIDATION */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="¿Archivar y eliminar tarea?"
        message={`Esta acción archivará de forma segura la tarea "${taskToDelete?.title || ''}". Quedará registro de auditoría con tu usuario y fecha.`}
        confirmLabel="Eliminar Tarea"
        cancelLabel="Conservar Tarea"
        isDestructive={true}
        requireOkInput={true}
        onConfirm={confirmDeleteTask}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setTaskToDelete(null);
        }}
      />
    </div>
  );
};
