import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId, PriorityLevel, TaskStatus } from '../../types';
import {
  ListTodo,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react';
import { ProgramBadge, PriorityChip, TaskStatusChip } from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';
import { formatDate } from '../../utils/dateUtils';

export const TareasGlobalesView: React.FC<{
  onOpenEntity: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate: () => void;
}> = ({ onOpenEntity, onOpenQuickCreate }) => {
  const { tasks, programs, completeTask } = useApp();

  const [search, setSearch] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | 'all' | 'pending_all'>('pending_all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityLevel | 'all'>('all');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (t.archived) return false;
    if (selectedProgram !== 'all' && t.programId !== selectedProgram) return false;
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;

    if (selectedStatus === 'pending_all') {
      if (t.status === 'completada') return false;
    } else if (selectedStatus !== 'all') {
      if (t.status !== selectedStatus) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.responsible.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div id="view-tareas-globales" className="space-y-6 animate-in fade-in duration-150 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
              <ListTodo className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Tareas Globales y Compromisos
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Seguimiento transversal en los 6 programas de salud de Quilicura
          </p>
        </div>

        <button
          onClick={onOpenQuickCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Nueva Tarea</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        {/* Search */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Buscar</label>
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Por título o responsable..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Program */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Programa</label>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value as any)}
            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="all">Todos los Programas ({programs.length})</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.shortName}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Estado</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="pending_all">Todas las Pendientes / Activas</option>
            <option value="all">Todas (Incluye Completadas)</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_curso">En Curso</option>
            <option value="bloqueada">Bloqueada</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Prioridad</label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as any)}
            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
          >
            <option value="all">Todas las Prioridades</option>
            <option value="critica">Crítica (Urgente)</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No se encontraron tareas con estos filtros</p>
            <p className="text-xs text-slate-400">Prueba ajustando los criterios o crea una nueva tarea.</p>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isOverdue = t.dueDate < '2026-08-15' && t.status !== 'completada';
            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border bg-white hover:border-slate-300 flex items-center justify-between gap-3 text-xs transition-all shadow-2xs ${
                  isOverdue ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => completeTask(t.id)}
                    className={`h-5 w-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      t.status === 'completada'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        onClick={() => onOpenEntity('task', t.id)}
                        className={`font-bold text-slate-900 hover:text-indigo-600 cursor-pointer ${
                          t.status === 'completada' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {t.title}
                      </span>
                      <ProgramBadge programId={t.programId} />
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Responsable: <strong>{t.responsible}</strong></span>
                      <span>•</span>
                      <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                        Vencimiento: {formatDate(t.dueDate)} {isOverdue && '(Vencida)'}
                      </span>
                      <span>•</span>
                      <span>Origen: {t.origin}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <PriorityChip priority={t.priority} />
                  <TaskStatusChip status={t.status} />
                  <button
                    onClick={() => onOpenEntity('task', t.id)}
                    className="px-3 py-1 bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                  >
                    Detalle
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
