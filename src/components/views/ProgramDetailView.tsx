import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId, TaskStatus, PurchaseStatus, PriorityLevel, KnowledgeCategory, QuestionStatus } from '../../types';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  CheckSquare,
  Users,
  Mail,
  HelpCircle,
  Lightbulb,
  UserCheck,
  FolderHeart,
  Plus,
  Calendar,
  Clock,
  ShieldAlert,
  ArrowRight,
  Filter,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Building,
  Sparkles,
  Info,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { ProgramBadge, TrafficLightBadge, PriorityChip, TaskStatusChip, PurchaseStatusChip, ProgressBar } from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';

export const ProgramDetailView: React.FC<{
  onOpenEntity: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate: () => void;
}> = ({ onOpenEntity, onOpenQuickCreate }) => {
  const {
    programs,
    updateProgram,
    selectedProgramId,
    setSelectedProgramId,
    programSummaries,
    tasks,
    indicators,
    financialPeriods,
    purchases,
    meetings,
    emails,
    questions,
    knowledge,
    hrRecords,
    eleamCases,
    establishments,
    completeTask,
    updateTask,
    updatePurchase,
    convertCommitmentToTask,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'resumen'
    | 'indicadores'
    | 'presupuesto'
    | 'compras'
    | 'tareas'
    | 'reuniones'
    | 'correos'
    | 'preguntas'
    | 'rrhh'
    | 'conocimiento'
    | 'eleam'
  >('resumen');

  const currentProgram = programs.find((p) => p.id === selectedProgramId) || programs[0];
  const summary = programSummaries[currentProgram.id];

  // Editable description state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState(currentProgram.description || '');

  // Keep edited description synced when selected program changes
  useEffect(() => {
    setEditedDescription(currentProgram.description || '');
    setIsEditingDescription(false);
  }, [currentProgram.id, currentProgram.description]);

  // Scoped Data
  const programTasks = tasks.filter((t) => !t.archived && t.programId === currentProgram.id);
  const programIndicators = indicators.filter((i) => !i.archived && i.programId === currentProgram.id);
  const programFinancials = (financialPeriods || []).filter((f) => f.programId === currentProgram.id);
  const totalAssigned = programFinancials.reduce((acc, f) => acc + (f.assignedBudget || 0) + (f.modifications || 0), 0);
  const totalExecuted = programFinancials.reduce((acc, f) => acc + (f.executedAmount || 0), 0);
  const totalCommitted = programFinancials.reduce((acc, f) => acc + (f.committedAmount || 0), 0);
  const totalAvailable = Math.max(0, totalAssigned - totalExecuted - totalCommitted);

  const programPurchases = purchases.filter((p) => !p.archived && p.programId === currentProgram.id);
  const programMeetings = meetings.filter((m) => !m.archived && m.programId === currentProgram.id);
  const programEmails = emails.filter((e) => !e.archived && e.programId === currentProgram.id);
  const programQuestions = questions.filter((q) => !q.archived && q.programId === currentProgram.id);
  const programKnowledge = knowledge.filter((k) => !k.archived && k.programId === currentProgram.id);
  const programHR = hrRecords.filter((h) => !h.archived && h.programId === currentProgram.id);

  // Tab definitions - Simplified and compact for responsive mobile & desktop view
  const tabs = [
    { id: 'resumen', label: 'Resumen', icon: TrendingUp },
    { id: 'indicadores', label: `Indicadores (${programIndicators.length})`, icon: TrendingUp },
    { id: 'presupuesto', label: 'Presupuesto', icon: DollarSign },
    { id: 'compras', label: `Compras (${programPurchases.length})`, icon: ShoppingBag },
    { id: 'tareas', label: `Tareas (${programTasks.filter((t) => t.status !== 'completada').length})`, icon: CheckSquare },
    { id: 'reuniones', label: `Reuniones (${programMeetings.length})`, icon: Users },
    { id: 'correos', label: `Correos (${programEmails.length})`, icon: Mail },
    { id: 'preguntas', label: `Dudas (${programQuestions.filter((q) => q.status !== 'resuelta').length})`, icon: HelpCircle },
    { id: 'rrhh', label: `RRHH (${programHR.length})`, icon: UserCheck },
    { id: 'conocimiento', label: `Tips (${programKnowledge.length})`, icon: Lightbulb },
  ];

  if (currentProgram.id === 'prog_personas_mayores') {
    tabs.push({ id: 'eleam', label: `ELEAM (${eleamCases.length})`, icon: FolderHeart });
  }

  return (
    <div id="view-program-detail" className="space-y-6 animate-in fade-in duration-150 text-left">
      {/* Program Top Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Title & Editable Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentProgram.color }} />
            <span className="font-mono text-xs font-bold text-slate-400">
              {currentProgram.code}
            </span>
          </div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {currentProgram.name}
          </h1>

          {/* Editable Program Description */}
          {isEditingDescription ? (
            <div className="space-y-2 pt-1 max-w-3xl animate-in fade-in duration-100">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={3}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-indigo-300 rounded-xl p-3 focus:border-indigo-500 focus:bg-white focus:outline-none ring-2 ring-indigo-500/10 transition-all resize-y"
                placeholder="Ingrese la descripción del programa..."
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editedDescription.trim()) {
                      updateProgram(currentProgram.id, { description: editedDescription.trim() });
                      setIsEditingDescription(false);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Confirmar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditedDescription(currentProgram.description || '');
                    setIsEditingDescription(false);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 max-w-3xl group">
              <p className="text-xs text-slate-600 leading-relaxed">
                {currentProgram.description}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditedDescription(currentProgram.description || '');
                  setIsEditingDescription(true);
                }}
                title="Editar descripción del programa"
                className="opacity-70 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all shrink-0 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation (Responsive wrap without horizontal scroll or awkward gaps) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2.5 border-t border-slate-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-program-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200/90 hover:text-slate-900 border border-slate-200/70'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Status Banner (Placed below the tab buttons) */}
        {summary && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-3">
              <TrafficLightBadge status={summary.status} />
              <div className="text-xs">
                <span className="font-semibold text-slate-700">Diagnóstico: </span>
                <span className="text-slate-600">{summary.statusReason}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Indicadores: </span>
                <strong className="text-slate-800">{summary.indicatorsCompliance.toFixed(0)}%</strong>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-slate-400 font-medium">Financiero: </span>
                <strong className={summary.financialExecutionRate < 45 ? 'text-rose-600' : 'text-slate-800'}>
                  {summary.financialExecutionRate.toFixed(1)}%
                </strong>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-slate-400 font-medium">Vencidas: </span>
                <strong className={summary.overdueTasksCount > 0 ? 'text-rose-600' : 'text-slate-800'}>
                  {summary.overdueTasksCount}
                </strong>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TAB CONTENT AREA */}

      {/* 1. RESUMEN / SALUD GENERAL */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Quick Metrics */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resumen Presupuestario
              </span>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Monto Vigente</span>
                  <span className="font-bold text-slate-900">
                    ${totalAssigned.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Ejecutado al Corte</span>
                  <span className="font-bold text-emerald-600">
                    ${totalExecuted.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Comprometido</span>
                  <span className="font-bold text-amber-600">
                    ${totalCommitted.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-1 border-t border-slate-100 font-bold">
                  <span className="text-slate-700">Saldo Disponible</span>
                  <span className="text-indigo-600">
                    ${totalAvailable.toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            </div>

            {/* Estado de Indicadores */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Estado de Indicadores ({programIndicators.length})
              </span>
              <div className="space-y-2">
                {programIndicators.slice(0, 3).map((ind) => (
                  <div key={ind.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate max-w-[180px]">{ind.name}</span>
                      <span className="font-bold text-slate-900">{ind.currentResult} / {ind.periodTarget}</span>
                    </div>
                    <ProgressBar
                      value={ind.periodTarget > 0 ? (ind.currentResult / ind.periodTarget) * 100 : 0}
                      size="sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Próximo Hito y Dotación */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Hito Operativo & Personal
              </span>
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs space-y-1">
                <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Próximo Hito
                </span>
                <p className="text-indigo-950 font-medium">
                  {summary ? summary.nextMilestone : 'Sin hito próximo'}
                </p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>Personal Asignado:</span>
                <strong className="text-slate-900">{programHR.length} profesionales</strong>
              </div>
            </div>
          </div>

          {/* Pending Tasks in this Program */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                Tareas Pendientes de {currentProgram.shortName}
              </h3>
              <button
                onClick={() => setActiveTab('tareas')}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Ver todas ({programTasks.length}) →
              </button>
            </div>

            <div className="space-y-2">
              {programTasks.filter((t) => t.status !== 'completada').length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No hay tareas pendientes en este programa.
                </p>
              ) : (
                programTasks
                  .filter((t) => t.status !== 'completada')
                  .slice(0, 4)
                  .map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => completeTask(t.id)}
                          className="h-4 w-4 rounded border border-slate-300 hover:bg-emerald-50 text-emerald-600 flex items-center justify-center"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 opacity-0 hover:opacity-100" />
                        </button>
                        <div>
                          <span
                            onClick={() => onOpenEntity('task', t.id)}
                            className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
                          >
                            {t.title}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>Resp: {t.responsible}</span>
                            <span>•</span>
                            <span className={t.dueDate < '2026-08-15' ? 'text-rose-600 font-bold' : ''}>
                              Vence: {t.dueDate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <PriorityChip priority={t.priority} />
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. METAS E INDICADORES */}
      {activeTab === 'indicadores' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Indicadores SSMN
              </h3>
            </div>
            <button
              onClick={onOpenQuickCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo Indicador
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600">
                  <th className="p-3.5">Código</th>
                  <th className="p-3.5">Nombre del Indicador</th>
                  <th className="p-3.5 text-center">Meta Anual</th>
                  <th className="p-3.5 text-center">Meta Período</th>
                  <th className="p-3.5 text-center">Resultado</th>
                  <th className="p-3.5">Cumplimiento</th>
                  <th className="p-3.5">Brecha</th>
                  <th className="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programIndicators.map((ind) => {
                  const percent =
                    ind.periodTarget > 0 ? (ind.currentResult / ind.periodTarget) * 100 : 0;
                  const isCritical = percent < 70;
                  const isYellow = percent >= 70 && percent < 90;
                  const gap = ind.periodTarget - ind.currentResult;

                  return (
                    <tr key={ind.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-indigo-700">
                        {ind.code}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 max-w-xs">
                        {ind.name}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Corte: {ind.cutoffDate} • Fuente: {ind.source || 'REM'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-medium text-slate-700">
                        {ind.annualTarget} {ind.unit}
                      </td>
                      <td className="p-3.5 text-center font-medium text-slate-700">
                        {ind.periodTarget} {ind.unit}
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-900">
                        {ind.currentResult} {ind.unit}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2 w-28">
                          <ProgressBar
                            value={percent}
                            colorScheme={isCritical ? 'rose' : isYellow ? 'amber' : 'emerald'}
                            size="sm"
                          />
                          <span
                            className={`font-bold ${
                              isCritical ? 'text-rose-600' : isYellow ? 'text-amber-600' : 'text-emerald-600'
                            }`}
                          >
                            {percent.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">
                        {gap > 0 ? (
                          <span className="text-amber-700 font-semibold">Faltan {gap} {ind.unit}</span>
                        ) : (
                          <span className="text-emerald-700 font-semibold">Cumplida (+{Math.abs(gap)})</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onOpenEntity('indicator', ind.id)}
                          className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded text-[11px] font-semibold text-slate-700 transition-colors"
                        >
                          Cortes / Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. PRESUPUESTO Y FINANZAS */}
      {activeTab === 'presupuesto' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <span className="text-[11px] font-semibold text-slate-500">Marco Vigente (Convenio)</span>
              <p className="text-xl font-bold text-slate-900 mt-1">
                ${totalAssigned.toLocaleString('es-CL')}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <span className="text-[11px] font-semibold text-slate-500">Ejecutado Efectivo</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">
                ${totalExecuted.toLocaleString('es-CL')}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <span className="text-[11px] font-semibold text-slate-500">Comprometido en Compras</span>
              <p className="text-xl font-bold text-amber-600 mt-1">
                ${totalCommitted.toLocaleString('es-CL')}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-slate-200 bg-white">
              <span className="text-[11px] font-semibold text-slate-500">Saldo Real Disponible</span>
              <p className="text-xl font-bold text-indigo-600 mt-1">
                ${totalAvailable.toLocaleString('es-CL')}
              </p>
            </div>
          </div>

          {/* Breakdown by accounts */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Desglose de Asignaciones y Partidas Presupuestarias
            </h3>

            {programFinancials.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No hay periodos financieros registrados para este programa.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600">
                      <th className="p-3">Periodo / Glosa</th>
                      <th className="p-3">Presupuesto Inicial</th>
                      <th className="p-3">Modificaciones</th>
                      <th className="p-3">Presupuesto Vigente</th>
                      <th className="p-3">Ejecutado</th>
                      <th className="p-3">Comprometido</th>
                      <th className="p-3">Saldo</th>
                      <th className="p-3">% Ejecución</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {programFinancials.map((it) => {
                      const vig = (it.assignedBudget || 0) + (it.modifications || 0);
                      const sal = Math.max(0, vig - (it.executedAmount || 0) - (it.committedAmount || 0));
                      const pct = vig > 0 ? ((it.executedAmount || 0) / vig) * 100 : 0;
                      return (
                        <tr key={it.id} className="hover:bg-slate-50">
                          <td className="p-3 font-semibold text-slate-800">
                            <div>{it.periodName}</div>
                            {it.subprogramId && (
                              <span className="text-[10px] text-indigo-600 font-medium">{it.subprogramId}</span>
                            )}
                            {it.notes && (
                              <div className="text-[10px] text-slate-400 font-normal mt-0.5">{it.notes}</div>
                            )}
                          </td>
                          <td className="p-3 font-medium text-slate-700">${(it.assignedBudget || 0).toLocaleString('es-CL')}</td>
                          <td className="p-3 font-medium text-slate-600">
                            {it.modifications !== 0 ? `${it.modifications > 0 ? '+' : ''}${(it.modifications || 0).toLocaleString('es-CL')}` : '$0'}
                          </td>
                          <td className="p-3 font-bold text-slate-900">${vig.toLocaleString('es-CL')}</td>
                          <td className="p-3 font-medium text-emerald-600">${(it.executedAmount || 0).toLocaleString('es-CL')}</td>
                          <td className="p-3 font-medium text-amber-600">${(it.committedAmount || 0).toLocaleString('es-CL')}</td>
                          <td className="p-3 font-bold text-indigo-700">${sal.toLocaleString('es-CL')}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2 w-28">
                              <ProgressBar value={pct} size="sm" />
                              <span className="font-bold text-slate-700">{pct.toFixed(0)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. COMPRAS Y ADQUISICIONES */}
      {activeTab === 'compras' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Solicitudes de Compra e Insumos ({programPurchases.length})
              </h3>
              <p className="text-xs text-slate-500">
                Flujo de abastecimiento con control de trabas
              </p>
            </div>
            <button
              onClick={onOpenQuickCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva Solicitud
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600">
                  <th className="p-3.5">N° Solicitud</th>
                  <th className="p-3.5">Ítem / Servicio</th>
                  <th className="p-3.5">Monto Estimado</th>
                  <th className="p-3.5">Proveedor</th>
                  <th className="p-3.5">Fecha Requerida</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-indigo-700">
                      {p.requestNumber}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900">
                      {p.itemOrService}
                      {p.problemReason && (
                        <p className="text-[11px] text-rose-600 font-normal mt-0.5">
                          Traba: {p.problemReason}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">
                      ${p.estimatedAmount.toLocaleString('es-CL')}
                    </td>
                    <td className="p-3.5 text-slate-600">{p.supplier || '—'}</td>
                    <td className="p-3.5 text-slate-600">{p.requiredDate}</td>
                    <td className="p-3.5">
                      <PurchaseStatusChip status={p.status} />
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => onOpenEntity('purchase', p.id)}
                        className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded text-[11px] font-semibold text-slate-700"
                      >
                        Gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. TAREAS Y COMPROMISOS */}
      {activeTab === 'tareas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Plan de Tareas y Compromisos ({programTasks.length})
              </h3>
              <p className="text-xs text-slate-500">
                Acciones operativas con control de vencimiento y responsables
              </p>
            </div>
            <button
              onClick={onOpenQuickCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva Tarea
            </button>
          </div>

          <div className="space-y-2">
            {programTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => completeTask(t.id)}
                    className={`h-5 w-5 rounded border flex items-center justify-center transition-colors ${
                      t.status === 'completada'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <div className="space-y-0.5">
                    <span
                      onClick={() => onOpenEntity('task', t.id)}
                      className={`font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer ${
                        t.status === 'completada' ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {t.title}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>Resp: {t.responsible}</span>
                      <span>•</span>
                      <span className={t.dueDate < '2026-08-15' && t.status !== 'completada' ? 'text-rose-600 font-bold' : ''}>
                        Vence: {t.dueDate}
                      </span>
                      <span>•</span>
                      <span>Origen: {t.origin}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PriorityChip priority={t.priority} />
                  <TaskStatusChip status={t.status} />
                  <button
                    onClick={() => onOpenEntity('task', t.id)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded text-[11px] font-semibold text-slate-700"
                  >
                    Detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. REUNIONES Y ACUERDOS */}
      {activeTab === 'reuniones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Reuniones, Comités y Minutas ({programMeetings.length})
              </h3>
              <p className="text-xs text-slate-500">
                Registro de acuerdos y compromisos con conversión en tareas
              </p>
            </div>
            <button
              onClick={onOpenQuickCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva Reunión
            </button>
          </div>

          <div className="space-y-4">
            {programMeetings.map((m) => (
              <div key={m.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{m.title}</h4>
                    <p className="text-xs text-slate-500">
                      {m.dateTime} • {m.location} • Participantes: {m.participants.join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenEntity('meeting', m.id)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100"
                  >
                    Ver Minuta
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <span className="font-semibold text-slate-700">Objetivo:</span>
                  <p className="text-slate-600">{m.objective}</p>
                </div>

                {/* Commitments with direct convert button */}
                {(m.commitments || []).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Compromisos de la sesión ({(m.commitments || []).length})
                    </span>
                    <div className="space-y-1.5">
                      {(m.commitments || []).map((c) => (
                        <div key={c.id} className="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-semibold text-slate-800">{c.description}</span>
                            <span className="text-[11px] text-slate-500 ml-2">
                              (Resp: {c.responsible} • Plazo: {c.deadline})
                            </span>
                          </div>
                          {c.taskId ? (
                            <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Tarea vinculada
                            </span>
                          ) : (
                            <button
                              onClick={() => convertCommitmentToTask(m.id, c.id)}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-[11px] font-bold"
                            >
                              + Crear tarea
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. CORREOS Y REQUERIMIENTOS */}
      {activeTab === 'correos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Bandeja de Correos y Requerimientos SSMN ({programEmails.length})
              </h3>
              <p className="text-xs text-slate-500">
                Control de plazos de respuesta y oficios
              </p>
            </div>
            <button
              onClick={onOpenQuickCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Registrar Correo
            </button>
          </div>

          <div className="space-y-2">
            {programEmails.map((e) => (
              <div
                key={e.id}
                onClick={() => onOpenEntity('email', e.id)}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 cursor-pointer flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{e.subject}</span>
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold uppercase">
                      {e.action}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Destinatario: {e.recipient || 'Referente SSMN'} • Plazo: {e.deadline}
                  </p>
                </div>
                <PriorityChip priority={e.priority} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. PREGUNTAS Y DUDAS ABIERTAS */}
      {activeTab === 'preguntas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Preguntas y Dudas a Resolver ({programQuestions.length})
              </h3>
              <p className="text-xs text-slate-500">
                Consultas técnicas, normativas y financieras para mesas técnicas
              </p>
            </div>
            <button
              onClick={onOpenQuickCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nueva Duda
            </button>
          </div>

          <div className="space-y-3">
            {programQuestions.map((q) => (
              <div
                key={q.id}
                onClick={() => onOpenEntity('question', q.id)}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 cursor-pointer text-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-purple-700 text-[10px] uppercase bg-purple-50 px-2 py-0.5 rounded">
                      {q.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{q.question}</h4>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    Estado: {q.status}
                  </span>
                </div>
                <p className="text-slate-600 text-xs">{q.context}</p>
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                  <span>Próxima instancia: <strong>{q.nextInstance || 'Por definir'}</strong></span>
                  <span>Resp: {q.responsible}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. DOTACIÓN RRHH */}
      {activeTab === 'rrhh' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Dotación y Personal Asignado ({programHR.length})
              </h3>
              <p className="text-xs text-slate-500">
                Registro de profesionales por CESFAM / CESFAM Manuel Bustos / Dr. Héctor Carvallo
              </p>
            </div>
            <button
              onClick={onOpenQuickCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Asignar Personal
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600">
                  <th className="p-3.5">Nombre</th>
                  <th className="p-3.5">Profesión</th>
                  <th className="p-3.5">Cargo / Rol</th>
                  <th className="p-3.5">Establecimiento</th>
                  <th className="p-3.5 text-center">Horas Prog.</th>
                  <th className="p-3.5">Contrato</th>
                  <th className="p-3.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programHR.map((h) => {
                  const est = (establishments || []).find((e) => e.id === h.establishmentId);
                  return (
                    <tr key={h.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-slate-900">{h.name}</td>
                      <td className="p-3.5 font-medium text-slate-700">{h.profession}</td>
                      <td className="p-3.5 text-slate-600">{h.role}</td>
                      <td className="p-3.5 text-slate-600">{est ? est.name : h.establishmentId}</td>
                      <td className="p-3.5 text-center font-bold text-indigo-700">{h.programHours}h</td>
                      <td className="p-3.5 text-slate-600">{h.contractType}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 10. TIPS Y CRITERIOS OPERATIVOS */}
      {activeTab === 'conocimiento' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Base de Conocimiento y Criterios Operativos ({programKnowledge.length})
              </h3>
              <p className="text-xs text-slate-500">
                Tips, errores frecuentes a evitar, flujos normativos y requisitos
              </p>
            </div>
            <button
              onClick={onOpenQuickCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Agregar Tip
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programKnowledge.map((k) => (
              <div
                key={k.id}
                onClick={() => onOpenEntity('knowledge', k.id)}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 cursor-pointer space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] uppercase">
                    {k.category.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">Por {k.author}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{k.title}</h4>
                <p className="text-slate-600 leading-relaxed">{k.content}</p>
                <div className="flex gap-1.5 flex-wrap pt-2">
                  {(k.tags || []).map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. ELEAM / CASOS (Personas Mayores) */}
      {activeTab === 'eleam' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Casos y Postulaciones ELEAM / Personas Mayores ({eleamCases.length})
              </h3>
              <p className="text-xs text-slate-500">
                Seguimiento de casos, expedientes SENAMA, EMPAM y Campaña de Invierno
              </p>
            </div>
            <button
              onClick={onOpenQuickCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Nuevo Caso ELEAM
            </button>
          </div>

          <div className="space-y-3">
            {eleamCases.map((e) => (
              <div
                key={e.id}
                onClick={() => onOpenEntity('eleam', e.id)}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-rose-300 cursor-pointer space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      {e.caseCode}
                    </span>
                    <span className="font-bold text-slate-900">Postulación ELEAM</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800 uppercase">
                    {e.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-slate-600">
                  <div><strong>Próxima acción:</strong> {e.nextAction}</div>
                  <div><strong>Plazo:</strong> {e.deadline} • <strong>Doc. Pendiente:</strong> {e.pendingDocumentation.join(', ') || 'Completa'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
