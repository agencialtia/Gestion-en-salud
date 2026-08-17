import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId, TaskStatus, PurchaseStatus, PriorityLevel, KnowledgeCategory, QuestionStatus, FinancialPeriod } from '../../types';
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
  X,
  Trash2,
  FileText,
  Save
} from 'lucide-react';
import { ProgramBadge, TrafficLightBadge, PriorityChip, TaskStatusChip, PurchaseStatusChip, ProgressBar } from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';

export const ProgramDetailView: React.FC<{
  onOpenEntity: (type: DrawerEntityType, id: string) => void;
  onDeleteRequest?: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate: () => void;
  onOpenCreateIndicator?: () => void;
}> = ({ onOpenEntity, onDeleteRequest, onOpenQuickCreate, onOpenCreateIndicator }) => {
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
    updateFinancialPeriod,
    addFinancialPeriod,
    deleteFinancialPeriod,
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

  const [selectedCut, setSelectedCut] = useState<'corte1' | 'corte2'>('corte1');

  // Editable top budget summary cards state
  const [isEditingBudgetCards, setIsEditingBudgetCards] = useState(false);
  const [budgetEditAuthorized, setBudgetEditAuthorized] = useState<number | string>(0);
  const [budgetEditSpent, setBudgetEditSpent] = useState<number | string>(0);

  // Editable financial item modal state
  const [editingFinancial, setEditingFinancial] = useState<FinancialPeriod | null>(null);
  const [isCreatingFinancial, setIsCreatingFinancial] = useState(false);
  const [financialForm, setFinancialForm] = useState<{
    periodName: string;
    subprogramId: string;
    assignedBudget: number;
    modifications: number;
    executedAmount: number;
    committedAmount: number;
    notes: string;
    cutoffDate: string;
    year: number;
  }>({
    periodName: '',
    subprogramId: '',
    assignedBudget: 0,
    modifications: 0,
    executedAmount: 0,
    committedAmount: 0,
    notes: '',
    cutoffDate: new Date().toISOString().split('T')[0],
    year: 2026,
  });

  const handleOpenEditFinancial = (it: FinancialPeriod) => {
    setEditingFinancial(it);
    setIsCreatingFinancial(false);
    setFinancialForm({
      periodName: it.periodName,
      subprogramId: it.subprogramId || '',
      assignedBudget: it.assignedBudget || 0,
      modifications: it.modifications || 0,
      executedAmount: it.executedAmount || 0,
      committedAmount: it.committedAmount || 0,
      notes: it.notes || '',
      cutoffDate: it.cutoffDate || new Date().toISOString().split('T')[0],
      year: it.year || 2026,
    });
  };

  const handleOpenCreateFinancial = () => {
    setEditingFinancial(null);
    setIsCreatingFinancial(true);
    setFinancialForm({
      periodName: 'Presupuesto 2026',
      subprogramId: '',
      assignedBudget: 0,
      modifications: 0,
      executedAmount: 0,
      committedAmount: 0,
      notes: '',
      cutoffDate: new Date().toISOString().split('T')[0],
      year: 2026,
    });
  };

  const handleSaveFinancial = () => {
    if (!financialForm.periodName.trim()) return;

    if (editingFinancial) {
      updateFinancialPeriod(editingFinancial.id, {
        periodName: financialForm.periodName,
        subprogramId: financialForm.subprogramId.trim() || undefined,
        assignedBudget: Number(financialForm.assignedBudget) || 0,
        modifications: Number(financialForm.modifications) || 0,
        executedAmount: Number(financialForm.executedAmount) || 0,
        committedAmount: Number(financialForm.committedAmount) || 0,
        notes: financialForm.notes.trim() || undefined,
        cutoffDate: financialForm.cutoffDate,
        year: Number(financialForm.year) || 2026,
      });
      setEditingFinancial(null);
    } else if (isCreatingFinancial) {
      addFinancialPeriod({
        programId: currentProgram.id,
        periodName: financialForm.periodName,
        subprogramId: financialForm.subprogramId.trim() || undefined,
        assignedBudget: Number(financialForm.assignedBudget) || 0,
        modifications: Number(financialForm.modifications) || 0,
        executedAmount: Number(financialForm.executedAmount) || 0,
        committedAmount: Number(financialForm.committedAmount) || 0,
        projectedAmount: 0,
        notes: financialForm.notes.trim() || undefined,
        cutoffDate: financialForm.cutoffDate,
        year: Number(financialForm.year) || 2026,
      });
      setIsCreatingFinancial(false);
    }
  };

  const handleStartEditingBudgetCards = () => {
    setBudgetEditAuthorized(totalAssigned);
    setBudgetEditSpent(totalExecuted);
    setIsEditingBudgetCards(true);
  };

  const handleCancelEditingBudgetCards = () => {
    setIsEditingBudgetCards(false);
  };

  const handleSaveBudgetCards = () => {
    const authVal = Math.max(0, Number(budgetEditAuthorized) || 0);
    const spentVal = Math.max(0, Number(budgetEditSpent) || 0);

    if (programFinancials.length === 0) {
      addFinancialPeriod({
        programId: currentProgram.id,
        periodName: `Presupuesto ${currentProgram.name} 2026`,
        assignedBudget: authVal,
        modifications: 0,
        executedAmount: spentVal,
        committedAmount: 0,
        projectedAmount: 0,
        cutoffDate: new Date().toISOString().split('T')[0],
        year: 2026,
      });
    } else {
      const mainFin = programFinancials[0];
      const otherAssigned = programFinancials.slice(1).reduce((acc, f) => acc + (f.assignedBudget || 0) + (f.modifications || 0), 0);
      const otherSpent = programFinancials.slice(1).reduce((acc, f) => acc + (f.executedAmount || 0), 0);

      const newMainAssigned = Math.max(0, authVal - otherAssigned - (mainFin.modifications || 0));
      const newMainSpent = Math.max(0, spentVal - otherSpent);

      updateFinancialPeriod(mainFin.id, {
        assignedBudget: newMainAssigned,
        executedAmount: newMainSpent,
      });
    }

    setIsEditingBudgetCards(false);
  };

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
      </div>

      {/* TAB CONTENT AREA */}

      {/* 1. RESUMEN / SALUD GENERAL */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Live Status Banner (Visible only in Resumen tab) */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Quick Metrics */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Resumen Presupuestario
              </span>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-600 font-medium">Presupuesto autorizado SSMN</span>
                  <span className="font-bold text-emerald-600">
                    ${totalAssigned.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-slate-600 font-medium">Presupuesto gastado</span>
                  <span className="font-bold text-rose-600">
                    ${totalExecuted.toLocaleString('es-CL')}
                  </span>
                </div>
                <div className="flex justify-between text-xs items-center pt-1 border-t border-slate-100 font-bold">
                  <span className="text-slate-700">Presupuesto disponible</span>
                  <span className="text-purple-600">
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-slate-900">
                Indicadores SSMN
              </h3>

              {/* Botones de 1° corte y 2° corte */}
              <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200 shadow-inner">
                <button
                  type="button"
                  onClick={() => setSelectedCut('corte1')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                    selectedCut === 'corte1'
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  1° corte
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCut('corte2')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                    selectedCut === 'corte2'
                      ? 'bg-white text-indigo-700 shadow-sm ring-1 ring-black/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  2° corte
                </button>
              </div>
            </div>
          </div>

          {/* Cuadro Resumen Global de Indicadores (mismo color bg-indigo-600) */}
          {(() => {
            const hasExplicitWeights = programIndicators.some(
              (i) => i.pesoRelativo !== undefined && i.pesoRelativo > 0
            );

            let totalWeight = 0;
            const items = programIndicators.map((ind) => {
              const cutTarget = selectedCut === 'corte1'
                ? (ind.corte1?.target ?? ind.periodTarget)
                : (ind.corte2?.target ?? ind.annualTarget);

              const cutResult = selectedCut === 'corte1'
                ? (ind.corte1?.result ?? ind.currentResult)
                : (ind.corte2?.result ?? ind.currentResult);

              let percent = 0;
              if (ind.direction === 'higher_is_better') {
                percent = cutTarget > 0 ? (cutResult / cutTarget) * 100 : 0;
              } else {
                percent = cutResult > 0 ? (cutTarget / cutResult) * 100 : 100;
              }

              let weight = ind.pesoRelativo;
              if (!hasExplicitWeights || weight === undefined || weight <= 0) {
                weight = programIndicators.length > 0
                  ? Math.round((100 / programIndicators.length) * 10) / 10
                  : 0;
              }

              totalWeight += weight;
              const contribution = (percent * weight) / 100;

              return {
                id: ind.id,
                code: ind.code,
                name: ind.name,
                unit: ind.unit,
                cutTarget,
                cutResult,
                weight,
                percent,
                contribution,
                isCompliant: percent >= 90,
              };
            });

            const weightedCompliance = totalWeight > 0
              ? items.reduce((acc, item) => acc + (item.percent * item.weight), 0) / totalWeight
              : 0;

            const meetsGoal = weightedCompliance >= 90;
            const formattedCompliance = Number(weightedCompliance.toFixed(1));

            return (
              <div className="rounded-2xl bg-indigo-600 text-white p-3.5 sm:p-4 shadow-md border border-indigo-500/60 space-y-3">
                {/* Header of Global Summary */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-white/15 backdrop-blur-xs border border-white/20 text-white shadow-xs">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        Resumen Global de Indicadores
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                        {selectedCut === 'corte1' ? '1° Corte' : '2° Corte'}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Status: CUMPLE / NO CUMPLE (más compacto) */}
                  <div className="flex items-center gap-1.5">
                    {meetsGoal ? (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-black tracking-wide shadow-xs uppercase border border-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Cumple</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[11px] font-black tracking-wide shadow-xs uppercase border border-rose-400">
                        <AlertTriangle className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>No Cumple</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* % Cumplimiento Global Metric Card (más compacto) */}
                <div className="bg-indigo-700/70 rounded-xl p-3 border border-indigo-400/25 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold text-indigo-200 uppercase tracking-wider">
                      % Cumplimiento Global
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold text-indigo-200">
                      Umbral: ≥ 90%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {formattedCompliance}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-indigo-950/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        meetsGoal ? 'bg-emerald-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, formattedCompliance))}%` }}
                    />
                  </div>
                </div>

                {/* Desglose Individual de Aportes Ponderados */}
                {items.length > 0 && (
                  <div className="pt-2 border-t border-indigo-500/40 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block">
                      Aporte por Indicador ({selectedCut === 'corte1' ? '1° Corte' : '2° Corte'}):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-indigo-800/70 border border-indigo-400/20 px-3 py-2 rounded-xl text-xs gap-2"
                        >
                          <div className="truncate min-w-0">
                            <span className="font-mono font-bold text-indigo-200 mr-1.5">
                              {item.code}:
                            </span>
                            <span className="text-white font-medium truncate">
                              {item.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[11px] text-indigo-200 font-semibold">
                              Peso {item.weight}%
                            </span>
                            <span className="font-bold text-white bg-indigo-950/80 px-2 py-0.5 rounded-lg border border-indigo-400/30">
                              {item.percent.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Botón Nuevo Indicador debajo del Resumen Global */}
          <div className="flex items-center justify-start">
            <button
              onClick={() => {
                if (onOpenCreateIndicator) {
                  onOpenCreateIndicator();
                } else {
                  onOpenQuickCreate();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Nuevo Indicador
            </button>
          </div>

          {/* Mobile Card List (sm:hidden) */}
          <div className="block sm:hidden space-y-3">
            {programIndicators.map((ind) => {
              const cutTarget = selectedCut === 'corte1'
                ? (ind.corte1?.target ?? ind.periodTarget)
                : (ind.corte2?.target ?? ind.annualTarget);

              const cutResult = selectedCut === 'corte1'
                ? (ind.corte1?.result ?? ind.currentResult)
                : (ind.corte2?.result ?? ind.currentResult);

              let percent = 0;
              if (ind.direction === 'higher_is_better') {
                percent = cutTarget > 0 ? (cutResult / cutTarget) * 100 : 0;
              } else {
                percent = cutResult > 0 ? (cutTarget / cutResult) * 100 : 100;
              }

              const isCritical = percent < 70;
              const isYellow = percent >= 70 && percent < 90;

              let gap = 0;
              let isGapPositive = false;
              if (ind.direction === 'higher_is_better') {
                gap = cutTarget - cutResult;
                isGapPositive = gap > 0;
              } else {
                gap = cutResult - cutTarget;
                isGapPositive = gap > 0;
              }
              const formattedGap = Number(Math.abs(gap).toFixed(2));

              return (
                <div
                  key={ind.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {ind.code}
                        </span>
                        {ind.pesoRelativo !== undefined && (
                          <span className="text-[11px] font-bold text-indigo-800 bg-indigo-100/70 border border-indigo-200/60 px-2 py-0.5 rounded-md">
                            Peso {ind.pesoRelativo}%
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug">
                        {ind.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenEntity('indicator', ind.id)}
                        className="p-2 rounded-lg border border-slate-200 bg-slate-50 text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all"
                        title="Ver en pantalla completa"
                        aria-label="Editar"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      {onDeleteRequest && (
                        <button
                          onClick={() => onDeleteRequest('indicator', ind.id)}
                          className="p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 active:scale-95 transition-all"
                          title="Eliminar"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block">
                        Meta {selectedCut === 'corte1' ? '1° Corte' : '2° Corte'}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {cutTarget} {ind.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block">Resultado</span>
                      <span className="font-bold text-slate-900">
                        {cutResult} {ind.unit}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px] font-medium">Cumplimiento</span>
                      <span
                        className={`font-bold ${
                          isCritical ? 'text-rose-600' : isYellow ? 'text-amber-600' : 'text-emerald-600'
                        }`}
                      >
                        {percent.toFixed(0)}%
                      </span>
                    </div>
                    <ProgressBar
                      value={percent}
                      colorScheme={isCritical ? 'rose' : isYellow ? 'amber' : 'emerald'}
                      size="sm"
                    />
                    <div className="text-[11px] font-medium pt-0.5">
                      {ind.direction === 'higher_is_better' ? (
                        isGapPositive ? (
                          <span className="text-amber-700">Faltan {formattedGap} {ind.unit}</span>
                        ) : (
                          <span className="text-emerald-700">Cumplida (+{formattedGap} {ind.unit})</span>
                        )
                      ) : (
                        isGapPositive ? (
                          <span className="text-rose-700">Exceso +{formattedGap} {ind.unit}</span>
                        ) : (
                          <span className="text-emerald-700">En meta ({cutResult} {ind.unit})</span>
                        )
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenEntity('indicator', ind.id)}
                    className="w-full py-2 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Abrir Ficha Completa</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Table (hidden sm:block) */}
          <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600">
                    <th className="p-3.5">Indicador</th>
                    <th className="p-3.5">Nombre del Indicador</th>
                    <th className="p-3.5 text-center">Peso</th>
                    <th className="p-3.5 text-center">Meta Anual</th>
                    <th className="p-3.5 text-center">
                      {selectedCut === 'corte1' ? 'Meta 1° Corte' : 'Meta 2° Corte'}
                    </th>
                    <th className="p-3.5 text-center">Resultado</th>
                    <th className="p-3.5">Cumplimiento</th>
                    <th className="p-3.5">Brecha</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {programIndicators.map((ind) => {
                    const cutTarget = selectedCut === 'corte1'
                      ? (ind.corte1?.target ?? ind.periodTarget)
                      : (ind.corte2?.target ?? ind.annualTarget);

                    const cutResult = selectedCut === 'corte1'
                      ? (ind.corte1?.result ?? ind.currentResult)
                      : (ind.corte2?.result ?? ind.currentResult);

                    let percent = 0;
                    if (ind.direction === 'higher_is_better') {
                      percent = cutTarget > 0 ? (cutResult / cutTarget) * 100 : 0;
                    } else {
                      percent = cutResult > 0 ? (cutTarget / cutResult) * 100 : 100;
                    }

                    const isCritical = percent < 70;
                    const isYellow = percent >= 70 && percent < 90;

                    // Format gap cleanly without floating point precision artifacts
                    let gap = 0;
                    let isGapPositive = false;
                    if (ind.direction === 'higher_is_better') {
                      gap = cutTarget - cutResult;
                      isGapPositive = gap > 0;
                    } else {
                      gap = cutResult - cutTarget;
                      isGapPositive = gap > 0;
                    }
                    const formattedGap = Number(Math.abs(gap).toFixed(2));

                    return (
                      <tr key={ind.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-indigo-700">
                          {ind.code}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 max-w-xs">
                          {ind.name}
                        </td>
                        <td className="p-3.5 text-center font-bold text-indigo-700">
                          <span className="bg-indigo-50 px-2 py-1 rounded-md text-[11px]">
                            {ind.pesoRelativo ?? 50}%
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-medium text-slate-700">
                          {ind.annualTarget} {ind.unit}
                        </td>
                        <td className="p-3.5 text-center font-medium text-slate-700">
                          {cutTarget} {ind.unit}
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-900">
                          {cutResult} {ind.unit}
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
                          {ind.direction === 'higher_is_better' ? (
                            isGapPositive ? (
                              <span className="text-amber-700 font-semibold">
                                Faltan {formattedGap} {ind.unit}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold">
                                Cumplida (+{formattedGap} {ind.unit})
                              </span>
                            )
                          ) : (
                            isGapPositive ? (
                              <span className="text-rose-700 font-semibold">
                                Exceso +{formattedGap} {ind.unit}
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-semibold">
                                En meta ({cutResult} {ind.unit})
                              </span>
                            )
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenEntity('indicator', ind.id)}
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                              title="Editar / Ver detalle"
                              aria-label="Editar"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            {onDeleteRequest && (
                              <button
                                onClick={() => onDeleteRequest('indicator', ind.id)}
                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                                title="Eliminar indicador"
                                aria-label="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRESUPUESTO Y FINANZAS */}
      {activeTab === 'presupuesto' && (
        <div className="space-y-6">
          {/* Top 3 Summary Cards Header / Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Resumen Presupuestario Global
              </h3>
              <p className="text-xs text-slate-500">
                {isEditingBudgetCards
                  ? 'Edita el presupuesto autorizado o gastado. El disponible se actualiza automáticamente en tiempo real.'
                  : 'Valores globales del programa. Puedes editarlos directamente con un clic.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isEditingBudgetCards ? (
                <>
                  <button
                    onClick={handleCancelEditingBudgetCards}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-xs"
                  >
                    <X className="h-3.5 w-3.5" /> Cancelar
                  </button>
                  <button
                    onClick={handleSaveBudgetCards}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Save className="h-3.5 w-3.5" /> Guardar Presupuesto
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStartEditingBudgetCards}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors shadow-xs"
                >
                  <Pencil className="h-3.5 w-3.5" /> Editar Presupuesto
                </button>
              )}
            </div>
          </div>

          {/* Top 3 Summary Cards */}
          {(() => {
            const liveAuthorizedNum = isEditingBudgetCards
              ? (parseFloat(String(budgetEditAuthorized)) || 0)
              : totalAssigned;
            const liveSpentNum = isEditingBudgetCards
              ? (parseFloat(String(budgetEditSpent)) || 0)
              : totalExecuted;
            const liveAvailableNum = Math.max(0, liveAuthorizedNum - liveSpentNum - totalCommitted);

            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Presupuesto autorizado por SSMN (Verde - Editable) */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-2 relative ${
                    isEditingBudgetCards
                      ? 'border-emerald-400 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-emerald-200 bg-emerald-50/50 shadow-xs hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                      Presupuesto autorizado por SSMN
                    </span>
                    <div className="flex items-center gap-1.5">
                      {!isEditingBudgetCards && (
                        <button
                          onClick={handleStartEditingBudgetCards}
                          className="p-1 rounded-md text-emerald-700 hover:bg-emerald-200/60 transition-colors"
                          title="Editar presupuesto autorizado"
                          aria-label="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <span className="p-1.5 rounded-lg bg-emerald-100/80 text-emerald-700">
                        <DollarSign className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  {isEditingBudgetCards ? (
                    <div className="space-y-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700 font-bold text-lg pointer-events-none">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={budgetEditAuthorized}
                          onChange={(e) =>
                            setBudgetEditAuthorized(
                              e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveBudgetCards();
                            if (e.key === 'Escape') handleCancelEditingBudgetCards();
                          }}
                          placeholder="0"
                          className="w-full pl-8 pr-3 py-1.5 text-xl sm:text-2xl font-black text-emerald-800 bg-white border border-emerald-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono tracking-tight shadow-inner"
                          autoFocus
                        />
                      </div>
                      <div className="text-[11px] font-bold text-emerald-700">
                        ${liveAuthorizedNum.toLocaleString('es-CL')}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={handleStartEditingBudgetCards}
                      className="cursor-pointer group flex items-baseline gap-1"
                      title="Haz clic para editar"
                    >
                      <p className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight group-hover:text-emerald-800 transition-colors">
                        ${totalAssigned.toLocaleString('es-CL')}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-emerald-600 font-medium">
                    Marco global vigente aprobado por convenio
                  </p>
                </div>

                {/* 2. Presupuesto gastado (Rojo - Editable) */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-2 relative ${
                    isEditingBudgetCards
                      ? 'border-rose-400 bg-rose-50/80 shadow-md ring-2 ring-rose-500/20'
                      : 'border-rose-200 bg-rose-50/50 shadow-xs hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                      Presupuesto gastado
                    </span>
                    <div className="flex items-center gap-1.5">
                      {!isEditingBudgetCards && (
                        <button
                          onClick={handleStartEditingBudgetCards}
                          className="p-1 rounded-md text-rose-700 hover:bg-rose-200/60 transition-colors"
                          title="Editar presupuesto gastado"
                          aria-label="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <span className="p-1.5 rounded-lg bg-rose-100/80 text-rose-700">
                        <DollarSign className="h-4 w-4" />
                      </span>
                    </div>
                  </div>

                  {isEditingBudgetCards ? (
                    <div className="space-y-1">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-600 font-bold text-lg pointer-events-none">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={budgetEditSpent}
                          onChange={(e) =>
                            setBudgetEditSpent(
                              e.target.value === '' ? '' : parseFloat(e.target.value) || 0
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveBudgetCards();
                            if (e.key === 'Escape') handleCancelEditingBudgetCards();
                          }}
                          placeholder="0"
                          className="w-full pl-8 pr-3 py-1.5 text-xl sm:text-2xl font-black text-rose-700 bg-white border border-rose-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500 font-mono tracking-tight shadow-inner"
                        />
                      </div>
                      <div className="text-[11px] font-bold text-rose-600">
                        ${liveSpentNum.toLocaleString('es-CL')}
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={handleStartEditingBudgetCards}
                      className="cursor-pointer group flex items-baseline gap-1"
                      title="Haz clic para editar"
                    >
                      <p className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight group-hover:text-rose-700 transition-colors">
                        ${totalExecuted.toLocaleString('es-CL')}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-rose-500 font-medium">
                    Gasto acumulado devengado / pagado
                  </p>
                </div>

                {/* 3. Presupuesto disponible (Morado - Automático en tiempo real) */}
                <div className="p-4 sm:p-5 rounded-2xl border border-purple-200 bg-purple-50/50 shadow-xs space-y-2 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider">
                      Presupuesto disponible
                    </span>
                    <span className="p-1.5 rounded-lg bg-purple-100/80 text-purple-700">
                      <DollarSign className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
                      ${liveAvailableNum.toLocaleString('es-CL')}
                    </p>
                    {isEditingBudgetCards && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200 animate-pulse">
                        En tiempo real: ${liveAuthorizedNum.toLocaleString('es-CL')} - ${liveSpentNum.toLocaleString('es-CL')}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-purple-600 font-medium">
                    Saldo libre para nuevas compras o asignaciones
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Breakdown by accounts with Editable actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Desglose de Asignaciones y Partidas Presupuestarias ({programFinancials.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Haz clic en editar en cualquier partida para modificar sus montos, glosas o notas
                </p>
              </div>
              <button
                onClick={handleOpenCreateFinancial}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Nueva Partida
              </button>
            </div>

            {programFinancials.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                <p className="text-xs text-slate-500">No hay partidas presupuestarias registradas para este programa.</p>
                <button
                  onClick={handleOpenCreateFinancial}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar primera partida
                </button>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600">
                        <th className="p-3">Periodo / Glosa</th>
                        <th className="p-3">Presupuesto Inicial</th>
                        <th className="p-3">Modificaciones</th>
                        <th className="p-3 text-emerald-800">Presupuesto Autorizado</th>
                        <th className="p-3 text-rose-800">Presupuesto Gastado</th>
                        <th className="p-3">Comprometido</th>
                        <th className="p-3 text-purple-800">Presupuesto Disponible</th>
                        <th className="p-3">% Ejecución</th>
                        <th className="p-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {programFinancials.map((it) => {
                        const vig = (it.assignedBudget || 0) + (it.modifications || 0);
                        const sal = Math.max(0, vig - (it.executedAmount || 0) - (it.committedAmount || 0));
                        const pct = vig > 0 ? ((it.executedAmount || 0) / vig) * 100 : 0;
                        return (
                          <tr key={it.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-semibold text-slate-800 max-w-[200px]">
                              <div className="truncate font-bold text-slate-900">{it.periodName}</div>
                              {it.subprogramId && (
                                <span className="text-[10px] text-indigo-600 font-medium">{it.subprogramId}</span>
                              )}
                              {it.notes && (
                                <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">{it.notes}</div>
                              )}
                            </td>
                            <td className="p-3 font-medium text-slate-700">${(it.assignedBudget || 0).toLocaleString('es-CL')}</td>
                            <td className="p-3 font-medium text-slate-600">
                              {it.modifications !== 0 ? `${it.modifications > 0 ? '+' : ''}${(it.modifications || 0).toLocaleString('es-CL')}` : '$0'}
                            </td>
                            <td className="p-3 font-bold text-emerald-700">${vig.toLocaleString('es-CL')}</td>
                            <td className="p-3 font-bold text-rose-600">${(it.executedAmount || 0).toLocaleString('es-CL')}</td>
                            <td className="p-3 font-medium text-amber-600">${(it.committedAmount || 0).toLocaleString('es-CL')}</td>
                            <td className="p-3 font-bold text-purple-700">${sal.toLocaleString('es-CL')}</td>
                            <td className="p-3">
                              <div className="flex items-center gap-2 w-24">
                                <ProgressBar value={pct} size="sm" />
                                <span className="font-bold text-slate-700">{pct.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleOpenEditFinancial(it)}
                                  className="p-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-xs"
                                  title="Editar partida presupuestaria"
                                  aria-label="Editar"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteFinancialPeriod(it.id)}
                                  className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors shadow-xs"
                                  title="Eliminar partida presupuestaria"
                                  aria-label="Eliminar"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards view */}
                <div className="md:hidden space-y-3">
                  {programFinancials.map((it) => {
                    const vig = (it.assignedBudget || 0) + (it.modifications || 0);
                    const sal = Math.max(0, vig - (it.executedAmount || 0) - (it.committedAmount || 0));
                    const pct = vig > 0 ? ((it.executedAmount || 0) / vig) * 100 : 0;
                    return (
                      <div key={it.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{it.periodName}</h4>
                            {it.subprogramId && (
                              <span className="text-[10px] text-indigo-600 font-medium">{it.subprogramId}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEditFinancial(it)}
                              className="p-1.5 rounded-lg border border-indigo-200 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-semibold inline-flex items-center gap-1 shadow-xs"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Editar
                            </button>
                            <button
                              onClick={() => deleteFinancialPeriod(it.id)}
                              className="p-1.5 rounded-lg border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 shadow-xs"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-200">
                          <div>
                            <span className="text-[10px] text-slate-500 block">Autorizado</span>
                            <span className="font-bold text-emerald-700">${vig.toLocaleString('es-CL')}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Gastado</span>
                            <span className="font-bold text-rose-600">${(it.executedAmount || 0).toLocaleString('es-CL')}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Comprometido</span>
                            <span className="font-medium text-amber-600">${(it.committedAmount || 0).toLocaleString('es-CL')}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">Disponible</span>
                            <span className="font-bold text-purple-700">${sal.toLocaleString('es-CL')}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-1">
                          <span className="text-slate-500">Ejecución: {pct.toFixed(0)}%</span>
                          <div className="w-24">
                            <ProgressBar value={pct} size="sm" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
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
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenEntity('purchase', p.id)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                          title="Editar / Gestionar"
                          aria-label="Editar"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        {onDeleteRequest && (
                          <button
                            onClick={() => onDeleteRequest('purchase', p.id)}
                            className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                            title="Eliminar compra"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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

                <div className="flex items-center gap-1.5 shrink-0">
                  <PriorityChip priority={t.priority} />
                  <TaskStatusChip status={t.status} />
                  <button
                    onClick={() => onOpenEntity('task', t.id)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                    title="Editar / Ver detalle"
                    aria-label="Editar"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  {onDeleteRequest && (
                    <button
                      onClick={() => onDeleteRequest('task', t.id)}
                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                      title="Eliminar tarea"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
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
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenEntity('meeting', m.id)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                      title="Ver minuta y acuerdos"
                      aria-label="Editar"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    {onDeleteRequest && (
                      <button
                        onClick={() => onDeleteRequest('meeting', m.id)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                        title="Eliminar reunión"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 flex items-center justify-between gap-3 text-xs"
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
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityChip priority={e.priority} />
                  <button
                    onClick={() => onOpenEntity('email', e.id)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                    title="Editar / Ver detalle"
                    aria-label="Editar"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  {onDeleteRequest && (
                    <button
                      onClick={() => onDeleteRequest('email', e.id)}
                      className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                      title="Eliminar correo"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
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
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 text-xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-purple-700 text-[10px] uppercase bg-purple-50 px-2 py-0.5 rounded">
                      {q.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{q.question}</h4>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Estado: {q.status}
                    </span>
                    <button
                      onClick={() => onOpenEntity('question', q.id)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                      title="Editar / Ver detalle"
                      aria-label="Editar"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    {onDeleteRequest && (
                      <button
                        onClick={() => onDeleteRequest('question', q.id)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                        title="Eliminar duda"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
                  <th className="p-3.5 text-center">Acciones</th>
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
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onOpenEntity('hr', h.id)}
                            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                            title="Editar / Ver detalle"
                            aria-label="Editar"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                          {onDeleteRequest && (
                            <button
                              onClick={() => onDeleteRequest('hr', h.id)}
                              className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                              title="Eliminar registro"
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
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
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] uppercase">
                    {k.category.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenEntity('knowledge', k.id)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                      title="Editar / Ver detalle"
                      aria-label="Editar"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    {onDeleteRequest && (
                      <button
                        onClick={() => onDeleteRequest('knowledge', k.id)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                        title="Eliminar tip"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-rose-300 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      {e.caseCode}
                    </span>
                    <span className="font-bold text-slate-900">Postulación ELEAM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-rose-100 text-rose-800 uppercase">
                      {e.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => onOpenEntity('eleam', e.id)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-xs"
                      title="Editar / Ver detalle"
                      aria-label="Editar"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                    {onDeleteRequest && (
                      <button
                        onClick={() => onDeleteRequest('eleam', e.id)}
                        className="p-1.5 rounded-lg border border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700 transition-all shadow-xs"
                        title="Eliminar caso"
                        aria-label="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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

      {/* MODAL DE EDICIÓN / CREACIÓN DE PARTIDAS PRESUPUESTARIAS */}
      {(editingFinancial !== null || isCreatingFinancial) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingFinancial ? 'Editar Partida Presupuestaria' : 'Nueva Partida Presupuestaria'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentProgram.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingFinancial(null);
                  setIsCreatingFinancial(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Computed Live Status Strip */}
              {(() => {
                const vig = (Number(financialForm.assignedBudget) || 0) + (Number(financialForm.modifications) || 0);
                const gas = Number(financialForm.executedAmount) || 0;
                const com = Number(financialForm.committedAmount) || 0;
                const dis = Math.max(0, vig - gas - com);
                const pct = vig > 0 ? ((gas / vig) * 100).toFixed(1) : '0.0';

                return (
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Autorizado</span>
                      <span className="text-xs font-bold text-emerald-700">${vig.toLocaleString('es-CL')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Gastado</span>
                      <span className="text-xs font-bold text-rose-600">${gas.toLocaleString('es-CL')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">Disponible</span>
                      <span className="text-xs font-bold text-purple-700">${dis.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="col-span-3 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Ejecución Proyectada: {pct}%</span>
                      <div className="w-24">
                        <ProgressBar value={Number(pct)} size="sm" />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Partida / Glosa */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Nombre de la Partida / Glosa / Periodo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={financialForm.periodName}
                  onChange={(e) => setFinancialForm({ ...financialForm, periodName: e.target.value })}
                  placeholder="Ej. Subtítulo 21 - Personal, Subtítulo 22 - Bienes y Servicios..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Subprograma */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Subprograma / Línea Específica (Opcional)
                </label>
                <input
                  type="text"
                  value={financialForm.subprogramId}
                  onChange={(e) => setFinancialForm({ ...financialForm, subprogramId: e.target.value })}
                  placeholder="Ej. Componente Operativo, Prestaciones..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Presupuesto Inicial & Modificaciones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Presupuesto Inicial ($ CLP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={financialForm.assignedBudget}
                    onChange={(e) => setFinancialForm({ ...financialForm, assignedBudget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Modificaciones (+/- $ CLP)
                  </label>
                  <input
                    type="number"
                    value={financialForm.modifications}
                    onChange={(e) => setFinancialForm({ ...financialForm, modifications: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Presupuesto Gastado & Comprometido */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Presupuesto Gastado / Ejecutado ($ CLP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={financialForm.executedAmount}
                    onChange={(e) => setFinancialForm({ ...financialForm, executedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-rose-700 font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Comprometido en Compras ($ CLP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={financialForm.committedAmount}
                    onChange={(e) => setFinancialForm({ ...financialForm, committedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Fecha de Corte */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Fecha de Corte / Registro
                </label>
                <input
                  type="date"
                  value={financialForm.cutoffDate}
                  onChange={(e) => setFinancialForm({ ...financialForm, cutoffDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Observaciones / Notas */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Observaciones / Justificación de Modificaciones
                </label>
                <textarea
                  rows={2}
                  value={financialForm.notes}
                  onChange={(e) => setFinancialForm({ ...financialForm, notes: e.target.value })}
                  placeholder="Detalles sobre resoluciones, transferencias o partidas..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setEditingFinancial(null);
                  setIsCreatingFinancial(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveFinancial}
                disabled={!financialForm.periodName.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4" />
                {editingFinancial ? 'Guardar Cambios' : 'Crear Partida'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
