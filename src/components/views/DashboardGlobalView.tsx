import React, { useState, useMemo } from 'react';
import { useApp, ProgramSummary } from '../../context/AppContext';
import { ProgramId, TrafficLightStatus, Indicator, Task, Purchase, Alert, HealthProgram } from '../../types';
import {
  LayoutDashboard,
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Calendar,
  Activity,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Clock,
  ShoppingCart,
  Target
} from 'lucide-react';
import { TrafficLightBadge, ProgressBar } from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';
import { CreateProgramModal } from '../common/CreateProgramModal';
import { formatDate } from '../../utils/dateUtils';

interface OperationalPriorityItem {
  id: string;
  type: 'task' | 'indicator' | 'purchase' | 'alert';
  title: string;
  programId: ProgramId;
  programShortName: string;
  programColor?: string;
  reason: string;
  priorityLevel: 'critica' | 'alta' | 'media';
  dateLabel?: string;
  actionLabel: string;
  rawEntity?: any;
}

export const DashboardGlobalView: React.FC<{
  onOpenEntity?: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate?: (tab?: any) => void;
}> = ({ onOpenEntity }) => {
  const {
    programs,
    programSummaries,
    tasks,
    indicators,
    purchases,
    alerts,
    thresholds,
    setSelectedProgramId,
    setActiveView,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [showAllPriorities, setShowAllPriorities] = useState(false);
  const [isCreateProgramModalOpen, setIsCreateProgramModalOpen] = useState(false);

  // Global Cutoff Date
  const globalCutoffDate = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const todayStr = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const summariesList: ProgramSummary[] = useMemo(() => Object.values(programSummaries), [programSummaries]);

  const filteredSummaries = useMemo(() => {
    return summariesList.filter((s) => {
      if (statusFilter === 'all') return true;
      return s.status === statusFilter;
    });
  }, [summariesList, statusFilter]);

  const countRed = useMemo(() => summariesList.filter((s) => s.status === 'red').length, [summariesList]);
  const countYellow = useMemo(() => summariesList.filter((s) => s.status === 'yellow').length, [summariesList]);
  const countGreen = useMemo(() => summariesList.filter((s) => s.status === 'green').length, [summariesList]);

  // Global Consolidated Metrics
  const totalBudget = useMemo(() => summariesList.reduce((acc, s) => acc + (s.totalBudget || 0), 0), [summariesList]);
  const totalExecuted = useMemo(() => summariesList.reduce((acc, s) => acc + (s.executedBudget || 0), 0), [summariesList]);
  const totalAvailable = useMemo(() => summariesList.reduce((acc, s) => acc + (s.availableBudget || 0), 0), [summariesList]);
  const globalFinExecutionRate = totalBudget > 0 ? (totalExecuted / totalBudget) * 100 : 0;

  const avgIndicatorsCompliance = useMemo(() => {
    return summariesList.length > 0
      ? summariesList.reduce((acc, s) => acc + (s.indicatorsCompliance || 0), 0) / summariesList.length
      : 0;
  }, [summariesList]);

  const totalOverdueTasks = useMemo(() => summariesList.reduce((acc, s) => acc + (s.overdueTasksCount || 0), 0), [summariesList]);
  const criticalAlertsCount = useMemo(() => alerts.filter((a) => a.status === 'nueva' && a.severity === 'critica').length, [alerts]);

  // Worst Performing Program calculation
  const worstProgram = useMemo(() => {
    if (summariesList.length === 0) return null;
    return [...summariesList].sort((a, b) => (a.indicatorsCompliance || 0) - (b.indicatorsCompliance || 0))[0];
  }, [summariesList]);

  // Financial Pacing Calculation (Linear)
  const currentMonthNumber = useMemo(() => new Date().getMonth() + 1, []);
  const expectedPacingRate = (currentMonthNumber / 12) * 100;
  const pacingDelta = globalFinExecutionRate - expectedPacingRate;

  // Build Unified Operational Priorities (Foco Operativo)
  const operationalPriorities = useMemo<OperationalPriorityItem[]>(() => {
    const list: OperationalPriorityItem[] = [];
    const programMap = new Map<string, HealthProgram>(programs.map((p) => [p.id, p]));

    // 1. Overdue tasks
    const activeTasks = tasks.filter((t) => !t.archived && !t.deletedAt && t.status !== 'completada' && t.status !== 'terminada');
    activeTasks.forEach((task) => {
      const isOverdue = task.dueDate && task.dueDate < todayStr;
      if (isOverdue) {
        const prog = programMap.get(task.programId || '');
        const daysDiff = Math.max(1, Math.round((new Date(todayStr).getTime() - new Date(task.dueDate || todayStr).getTime()) / (1000 * 3600 * 24)));
        list.push({
          id: task.id || '',
          type: 'task',
          title: task.title || 'Tarea sin título',
          programId: task.programId || '',
          programShortName: prog?.shortName || prog?.name || 'General',
          programColor: prog?.color,
          reason: `Vencida hace ${daysDiff} ${daysDiff === 1 ? 'día' : 'días'} (${formatDate(task.dueDate)})`,
          priorityLevel: 'critica',
          dateLabel: task.dueDate ? formatDate(task.dueDate) : undefined,
          actionLabel: 'Abrir tarea',
          rawEntity: task,
        });
      }
    });

    // 2. Critical Indicators / Under Target
    indicators.forEach((ind) => {
      if (ind.archived) return;
      const target = ind.periodTarget || ind.annualTarget || 1;
      const pct = ind.direction === 'lower_is_better'
        ? (ind.currentResult > 0 ? (target / ind.currentResult) * 100 : 100)
        : (target > 0 ? (ind.currentResult / target) * 100 : 0);

      const dangerThresh = thresholds?.indicatorDangerPercent ?? 75;
      const warningThresh = thresholds?.indicatorWarningPercent ?? 85;

      if (pct < dangerThresh || pct < warningThresh) {
        const prog = programMap.get(ind.programId || '');
        const delta = Math.round(100 - pct);
        list.push({
          id: ind.id || '',
          type: 'indicator',
          title: ind.name || 'Indicador sin nombre',
          programId: ind.programId || '',
          programShortName: prog?.shortName || prog?.name || 'General',
          programColor: prog?.color,
          reason: `${delta} pp bajo objetivo (${ind.currentResult} / ${target} ${ind.unit || ''})`,
          priorityLevel: pct < dangerThresh ? 'critica' : 'alta',
          dateLabel: ind.cutoffDate ? formatDate(ind.cutoffDate) : undefined,
          actionLabel: 'Ver indicador',
          rawEntity: ind,
        });
      }
    });

    // 3. Urgent / Critical Pending Tasks not already added as overdue
    activeTasks.forEach((task) => {
      const isOverdue = task.dueDate && task.dueDate < todayStr;
      if (!isOverdue && (task.isUrgent || task.priority === 'critica' || task.priority === 'urgente')) {
        const prog = programMap.get(task.programId || '');
        list.push({
          id: task.id || '',
          type: 'task',
          title: task.title || 'Compromiso urgente',
          programId: task.programId || '',
          programShortName: prog?.shortName || prog?.name || 'General',
          programColor: prog?.color,
          reason: `Compromiso urgente prioritario ${task.dueDate ? `· Límite: ${formatDate(task.dueDate)}` : ''}`,
          priorityLevel: 'alta',
          dateLabel: task.dueDate ? formatDate(task.dueDate) : undefined,
          actionLabel: 'Abrir tarea',
          rawEntity: task,
        });
      }
    });

    // 4. Blocked / Problem Purchases
    purchases.forEach((purch) => {
      if (!purch.archived && (purch.status === 'problema' || purch.status === 'retrasada')) {
        const prog = programMap.get(purch.programId || '');
        list.push({
          id: purch.id || '',
          type: 'purchase',
          title: purch.description || purch.code || 'Compra observada',
          programId: purch.programId || '',
          programShortName: prog?.shortName || prog?.name || 'General',
          programColor: prog?.color,
          reason: purch.notes || 'Factura/Adquisición con problema o bloqueo',
          priorityLevel: 'alta',
          dateLabel: purch.requestDate ? formatDate(purch.requestDate) : undefined,
          actionLabel: 'Abrir compra',
          rawEntity: purch,
        });
      }
    });

    // 5. Tasks expiring soon (next 3 days)
    activeTasks.forEach((task) => {
      const isOverdue = task.dueDate && task.dueDate < todayStr;
      const isCritical = task.isUrgent || task.priority === 'critica' || task.priority === 'urgente';
      if (!isOverdue && !isCritical && task.dueDate) {
        const dueTime = new Date(task.dueDate).getTime();
        const nowTime = new Date(todayStr).getTime();
        const diffDays = Math.round((dueTime - nowTime) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays <= 3) {
          const prog = programMap.get(task.programId || '');
          list.push({
            id: task.id || '',
            type: 'task',
            title: task.title || 'Tarea próxima a vencer',
            programId: task.programId || '',
            programShortName: prog?.shortName || prog?.name || 'General',
            programColor: prog?.color,
            reason: `Próxima a vencer en ${diffDays === 0 ? 'hoy' : `${diffDays} días`} (${formatDate(task.dueDate)})`,
            priorityLevel: 'media',
            dateLabel: formatDate(task.dueDate),
            actionLabel: 'Abrir tarea',
            rawEntity: task,
          });
        }
      }
    });

    // 6. Remaining active critical alerts
    alerts.forEach((alt) => {
      if (alt.status === 'nueva' && (alt.severity === 'critica' || alt.severity === 'alta')) {
        const prog = programMap.get(alt.programId || '');
        list.push({
          id: alt.id || '',
          type: 'alert',
          title: alt.title || 'Alerta operativa',
          programId: alt.programId || '',
          programShortName: prog?.shortName || prog?.name || 'General',
          programColor: prog?.color,
          reason: alt.description || alt.message || 'Alerta pendiente de gestión',
          priorityLevel: alt.severity === 'critica' ? 'critica' : 'alta',
          actionLabel: 'Ver alerta',
          rawEntity: alt,
        });
      }
    });

    // Deduplicate by type+id and sort by severity
    const uniqueMap = new Map<string, OperationalPriorityItem>();
    list.forEach((item) => {
      const key = `${item.type}_${item.id}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    const severityOrder = { critica: 1, alta: 2, media: 3 };
    return Array.from(uniqueMap.values()).sort(
      (a, b) => severityOrder[a.priorityLevel] - severityOrder[b.priorityLevel]
    );
  }, [tasks, indicators, purchases, alerts, programs, todayStr, thresholds]);

  // Trend calculation per program for the Comparative Matrix
  const programTrends = useMemo<Record<ProgramId, { type: 'up' | 'down' | 'equal' | 'none'; label: string; delta?: number }>>(() => {
    const trendMap: Record<ProgramId, { type: 'up' | 'down' | 'equal' | 'none'; label: string; delta?: number }> = {};

    programs.forEach((prog) => {
      const progIndicators = indicators.filter((i) => i.programId === prog.id && !i.archived);
      const deltas: number[] = [];

      progIndicators.forEach((ind) => {
        if (ind.measurements && ind.measurements.length >= 2) {
          const sorted = [...ind.measurements].sort((a, b) => a.date.localeCompare(b.date));
          const current = sorted[sorted.length - 1];
          const previous = sorted[sorted.length - 2];

          const currentTarget = current.target || ind.periodTarget || ind.annualTarget || 1;
          const prevTarget = previous.target || ind.periodTarget || ind.annualTarget || 1;

          const currentPct = ind.direction === 'lower_is_better'
            ? (current.result > 0 ? (currentTarget / current.result) * 100 : 100)
            : (currentTarget > 0 ? (current.result / currentTarget) * 100 : 0);

          const prevPct = ind.direction === 'lower_is_better'
            ? (previous.result > 0 ? (prevTarget / previous.result) * 100 : 100)
            : (prevTarget > 0 ? (previous.result / prevTarget) * 100 : 0);

          deltas.push(currentPct - prevPct);
        }
      });

      if (deltas.length > 0) {
        const avgDelta = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
        const rounded = Math.round(avgDelta * 10) / 10;
        if (rounded > 0) {
          trendMap[prog.id] = { type: 'up', label: `↑ +${rounded.toFixed(1)} pp`, delta: rounded };
        } else if (rounded < 0) {
          trendMap[prog.id] = { type: 'down', label: `↓ ${rounded.toFixed(1)} pp`, delta: rounded };
        } else {
          trendMap[prog.id] = { type: 'equal', label: `→ 0.0 pp`, delta: 0 };
        }
      } else {
        trendMap[prog.id] = { type: 'none', label: 'Sin corte anterior' };
      }
    });

    return trendMap;
  }, [programs, indicators]);

  const handleOpenProgram = (id: ProgramId) => {
    setSelectedProgramId(id);
    setActiveView('program_detail');
  };

  const handlePriorityAction = (item: OperationalPriorityItem) => {
    if (item.type === 'task') {
      if (onOpenEntity) onOpenEntity('task', item.id);
      else setActiveView('tareas');
    } else if (item.type === 'indicator') {
      if (onOpenEntity) onOpenEntity('indicator', item.id);
      else setActiveView('indicadores');
    } else if (item.type === 'purchase') {
      if (onOpenEntity) onOpenEntity('purchase', item.id);
      else setActiveView('compras');
    } else if (item.type === 'alert') {
      setActiveView('alertas');
    }
  };

  const visiblePriorities = showAllPriorities ? operationalPriorities : operationalPriorities.slice(0, 3);

  return (
    <div id="view-dashboard-global" className="space-y-6 animate-in fade-in duration-150 text-left font-sans">
      {/* 1. Header & 6. Global Cutoff Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0A0D16] text-white shadow-xs">
              <LayoutDashboard className="h-4.5 w-4.5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Dashboard Global
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Centro Operativo de Gestión y Salud Programática — Quilicura Salud
          </p>
        </div>

        {/* Global Cutoff Date Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 text-indigo-900 shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold tracking-tight">
              {globalCutoffDate ? `Datos al ${globalCutoffDate}` : 'Fecha de corte no definida'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Unified Foco Operativo Block */}
      <div id="section-foco-operativo" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Foco Operativo
              </h2>
              <p className="text-[11px] text-slate-500">
                Situaciones críticas y compromisos de mayor impacto que requieren resolución inmediata
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">
              {operationalPriorities.length} {operationalPriorities.length === 1 ? 'prioridad activa' : 'prioridades activas'}
            </span>
            {operationalPriorities.length > 3 && (
              <button
                onClick={() => setShowAllPriorities(!showAllPriorities)}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer ml-2"
              >
                <span>{showAllPriorities ? 'Ver menos' : 'Ver todas las prioridades'}</span>
                {showAllPriorities ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>

        {visiblePriorities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {visiblePriorities.map((item) => {
              const isCrit = item.priorityLevel === 'critica';
              const isHigh = item.priorityLevel === 'alta';

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isCrit
                      ? 'border-rose-200 bg-rose-50/40 hover:border-rose-300'
                      : isHigh
                      ? 'border-amber-200 bg-amber-50/40 hover:border-amber-300'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    {/* Header item: Program + Type Icon */}
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                        {item.programColor && (
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: item.programColor }}
                          />
                        )}
                        <span className="truncate max-w-[140px]">{item.programShortName}</span>
                      </span>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                          isCrit
                            ? 'bg-rose-100 text-rose-700'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {item.priorityLevel}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {item.title}
                    </h4>

                    {/* Reason */}
                    <p
                      className={`text-[11px] font-medium flex items-center gap-1 ${
                        isCrit ? 'text-rose-700' : isHigh ? 'text-amber-800' : 'text-slate-600'
                      }`}
                    >
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <span className="truncate">{item.reason}</span>
                    </p>
                  </div>

                  {/* Direct Action Button */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    {item.dateLabel && (
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.dateLabel}
                      </span>
                    )}
                    <button
                      onClick={() => handlePriorityAction(item)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors ml-auto cursor-pointer hover:underline"
                    >
                      <span>[{item.actionLabel}]</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center space-y-1">
            <div className="inline-flex p-2 rounded-full bg-emerald-100 text-emerald-700 mb-1">
              <Activity className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-emerald-900">
              No hay situaciones de riesgo crítico pendientes
            </p>
            <p className="text-[11px] text-emerald-700">
              Todos los programas se encuentran al día con sus compromisos inmediatos.
            </p>
          </div>
        )}
      </div>

      {/* 4. Executive KPI Strip (Redesigned & Actionable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* KPI 1: Programa con Peor Cumplimiento */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Menor Cumplimiento
            </span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <div>
            {worstProgram ? (
              <>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug break-words" title={worstProgram.program.name}>
                    {worstProgram.program.name}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-rose-600 leading-none shrink-0">
                    {worstProgram.indicatorsCompliance.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Promedio comunal: <strong className="text-slate-800">{avgIndicatorsCompliance.toFixed(0)}%</strong>
                  </span>
                  <button
                    onClick={() => handleOpenProgram(worstProgram.program.id)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] hover:underline cursor-pointer"
                  >
                    Ver detalle →
                  </button>
                </div>
              </>
            ) : (
              <span className="text-xs text-slate-400">Sin datos de metas</span>
            )}
          </div>
        </div>

        {/* KPI 2: Tareas Vencidas y Alertas Críticas */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Excepciones Pendientes
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <ShieldAlert className="h-4 w-4" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <div>
                <span className="text-xl font-bold text-rose-600 leading-none">
                  {totalOverdueTasks}
                </span>
                <span className="text-[10px] text-slate-500 block font-medium">Tareas vencidas</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-xl font-bold text-amber-600 leading-none">
                  {criticalAlertsCount}
                </span>
                <span className="text-[10px] text-slate-500 block font-medium">Alertas críticas</span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  setSelectedProgramId(null);
                  setActiveView('tareas');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] hover:underline cursor-pointer"
              >
                Ver tareas →
              </button>
              <button
                onClick={() => {
                  setSelectedProgramId(null);
                  setActiveView('alertas');
                }}
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] hover:underline cursor-pointer"
              >
                Ver alertas →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Matriz Comparativa de Programas de Salud Quilicura */}
      <div id="section-matriz-comparativa" className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Matriz Comparativa de Programas de Salud Quilicura
            </h3>
            <p className="text-xs text-slate-500">
              Consolidado de metas sanitarias y estado de cumplimiento por programa
            </p>
          </div>

          {/* Quick status filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Todos ({programs.length})
            </button>
            <button
              onClick={() => setStatusFilter('red')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                statusFilter === 'red'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              <span>Crítico ({countRed})</span>
            </button>
            <button
              onClick={() => setStatusFilter('yellow')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                statusFilter === 'yellow'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>Atención ({countYellow})</span>
            </button>
            <button
              onClick={() => setStatusFilter('green')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                statusFilter === 'green'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>En Regla ({countGreen})</span>
            </button>
          </div>
        </div>

        {/* Desktop / Tablet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 font-semibold text-slate-600">
                <th className="p-3.5">Programa</th>
                <th className="p-3.5 text-center">Semáforo</th>
                <th className="p-3.5">Cumplimiento Metas</th>
                <th className="p-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.map((s) => {
                return (
                  <tr key={s.program.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.program.color }} />
                        <div>
                          <div className="font-bold text-sm">{s.program.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{s.program.code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <TrafficLightBadge status={s.status} size="sm" showLabel={false} />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-3 w-48 sm:w-64">
                        <ProgressBar value={s.indicatorsCompliance} size="sm" />
                        <span className="font-bold text-slate-800 text-sm whitespace-nowrap">{s.indicatorsCompliance.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleOpenProgram(s.program.id)}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer text-xs"
                      >
                        <span>Abrir</span>
                        <span>→</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Responsive Prioritized Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredSummaries.map((s) => {
            return (
              <div key={s.program.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.program.color }} />
                    <h4 className="font-bold text-slate-900 text-xs">
                      {s.program.name}
                    </h4>
                  </div>
                  <TrafficLightBadge status={s.status} size="sm" showLabel={false} />
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Cumplimiento de Metas</span>
                    <span className="font-bold text-slate-900">{s.indicatorsCompliance.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={s.indicatorsCompliance} size="sm" />
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleOpenProgram(s.program.id)}
                    className="text-indigo-600 hover:text-indigo-800 font-bold text-xs hover:underline cursor-pointer"
                  >
                    Ingresar a programa →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal para Crear Programa */}
      <CreateProgramModal
        isOpen={isCreateProgramModalOpen}
        onClose={() => setIsCreateProgramModalOpen(false)}
      />
    </div>
  );
};
