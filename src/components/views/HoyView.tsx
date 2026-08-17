import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId, Task, Indicator, Purchase, PendingEmail, Question, Meeting } from '../../types';
import {
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  ShoppingBag,
  Mail,
  TrendingDown,
  HelpCircle,
  Calendar,
  Filter,
  Plus,
  ArrowRight,
  Sparkles,
  Check,
  Building
} from 'lucide-react';
import { ProgramBadge, PriorityChip, TrafficLightBadge, ProgressBar } from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';

export const HoyView: React.FC<{
  onOpenEntity: (type: DrawerEntityType, id: string) => void;
  onOpenQuickCreate: () => void;
}> = ({ onOpenEntity, onOpenQuickCreate }) => {
  const {
    programs,
    programSummaries,
    overdueTasks,
    todayTasks,
    upcomingTasks,
    indicatorsInRisk,
    financialAlerts,
    unansweredQuestions,
    purchases,
    emails,
    meetings,
    completeTask,
    selectedProgramId,
    setSelectedProgramId,
    setActiveView,
  } = useApp();

  const [programFilter, setProgramFilter] = useState<ProgramId | 'all'>('all');

  // Filter lists based on selected program
  const currentOverdueTasks: Task[] = programFilter === 'all' 
    ? overdueTasks 
    : overdueTasks.filter((t) => t.programId === programFilter);

  const currentTodayTasks: Task[] = programFilter === 'all'
    ? todayTasks
    : todayTasks.filter((t) => t.programId === programFilter);

  const currentUpcomingTasks: Task[] = programFilter === 'all'
    ? upcomingTasks
    : upcomingTasks.filter((t) => t.programId === programFilter);

  const currentRiskIndicators: Indicator[] = programFilter === 'all'
    ? indicatorsInRisk
    : indicatorsInRisk.filter((i) => i.programId === programFilter);

  const currentFinAlerts = programFilter === 'all'
    ? financialAlerts
    : financialAlerts.filter((f) => f.programId === programFilter);

  const currentQuestions: Question[] = programFilter === 'all'
    ? unansweredQuestions
    : unansweredQuestions.filter((q) => q.programId === programFilter);

  const rawProblemPurchases = purchases.filter(
    (p) => !p.archived && (p.status === 'problema' || p.requiredDate < '2026-08-15')
  );
  const currentProblemPurchases: Purchase[] = programFilter === 'all'
    ? rawProblemPurchases
    : rawProblemPurchases.filter((p) => p.programId === programFilter);

  const rawPendingEmails = emails.filter((e) => !e.archived && e.status !== 'resuelto');
  const currentPendingEmails: PendingEmail[] = programFilter === 'all'
    ? rawPendingEmails
    : rawPendingEmails.filter((e) => e.programId === programFilter);

  // Today meetings
  const rawTodayMeetings = meetings.filter((m) => !m.archived && m.dateTime.startsWith('2026-08-15'));
  const todayMeetings: Meeting[] = programFilter === 'all'
    ? rawTodayMeetings
    : rawTodayMeetings.filter((m) => m.programId === programFilter);

  return (
    <div id="view-hoy" className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner / Question Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-100 text-rose-600">
              <Flame className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Hoy en Operación</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            «¿Qué requiere mi atención ahora?» — Gestión por excepción automática para Quilicura
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQuickCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Crear Registro</span>
          </button>
        </div>
      </div>

      {/* Program Filter Pills (Responsive wrap without horizontal scroll) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
          <Filter className="h-3.5 w-3.5" /> Filtrar:
        </span>
        <button
          onClick={() => setProgramFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            programFilter === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todos ({programs.length})
        </button>
        {programs.map((p) => {
          const isSelected = programFilter === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setProgramFilter(p.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              <span>{p.shortName}</span>
            </button>
          );
        })}
      </div>

      {/* Metric Cards Ribbon (KPIs de Excepción) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Vencidos */}
        <div
          onClick={() => {
            const el = document.getElementById('block-urgente');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
            currentOverdueTasks.length > 0
              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Vencidos</span>
            <ShieldAlert className={`h-4 w-4 ${currentOverdueTasks.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{currentOverdueTasks.length}</span>
            <span className="text-[10px] text-slate-500">tareas</span>
          </div>
        </div>

        {/* Para Hoy */}
        <div
          onClick={() => {
            const el = document.getElementById('block-hoy');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all cursor-pointer text-slate-800"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Para Hoy</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{currentTodayTasks.length + todayMeetings.length}</span>
            <span className="text-[10px] text-slate-500">compromisos</span>
          </div>
        </div>

        {/* Próximos 7 días */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Próx. 7 Días</span>
            <Calendar className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{currentUpcomingTasks.length}</span>
            <span className="text-[10px] text-slate-500">plazos</span>
          </div>
        </div>

        {/* Metas en riesgo */}
        <div
          onClick={() => {
            const el = document.getElementById('block-indicadores');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
            currentRiskIndicators.length > 0
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Metas en Riesgo</span>
            <TrendingDown className={`h-4 w-4 ${currentRiskIndicators.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{currentRiskIndicators.length}</span>
            <span className="text-[10px] text-slate-500">indicadores</span>
          </div>
        </div>

        {/* Compras con problemas */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          currentProblemPurchases.length > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Compras c/ Traba</span>
            <ShoppingBag className={`h-4 w-4 ${currentProblemPurchases.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{currentProblemPurchases.length}</span>
            <span className="text-[10px] text-slate-500">solicitudes</span>
          </div>
        </div>

        {/* Correos pendientes */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white text-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500">Correos Pend.</span>
            <Mail className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">{currentPendingEmails.length}</span>
            <span className="text-[10px] text-slate-500">acciones</span>
          </div>
        </div>
      </div>

      {/* ACTIONABLE BLOCKS (GESTIÓN POR EXCEPCIÓN) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BLOCK 1: URGENTE / ELEMENTOS VENCIDOS Y CRÍTICOS */}
        <div
          id="block-urgente"
          className="rounded-2xl border border-rose-200 bg-white shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-rose-100 bg-rose-50/70 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                Urgente — Vencidos y Bloqueados ({currentOverdueTasks.length + currentProblemPurchases.length})
              </h3>
            </div>
            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
              Prioridad Máxima
            </span>
          </div>

          <div className="p-4 space-y-3">
            {currentOverdueTasks.length === 0 && currentProblemPurchases.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                No hay elementos vencidos ni compras bloqueadas en este momento.
              </div>
            ) : (
              <>
                {/* Overdue Tasks */}
                {currentOverdueTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 transition-all flex items-start justify-between gap-3 text-left"
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <button
                        onClick={() => completeTask(t.id)}
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600 transition-colors"
                        title="Marcar completada"
                      >
                        <Check className="h-3 w-3 opacity-0 hover:opacity-100" />
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => onOpenEntity('task', t.id)}
                            className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                          >
                            {t.title}
                          </span>
                          <PriorityChip priority={t.priority} />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <ProgramBadge programId={t.programId} />
                          <span>•</span>
                          <span className="text-rose-600 font-bold">Venció el {t.dueDate}</span>
                          <span>•</span>
                          <span>Resp: {t.responsible}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenEntity('task', t.id)}
                      className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-300 rounded text-[11px] font-semibold text-indigo-600 shrink-0"
                    >
                      Gestionar
                    </button>
                  </div>
                ))}

                {/* Problem Purchases */}
                {currentProblemPurchases.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 flex items-start justify-between gap-3 text-left"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                          {p.requestNumber}
                        </span>
                        <span
                          onClick={() => onOpenEntity('purchase', p.id)}
                          className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                        >
                          {p.itemOrService}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-800 font-medium leading-snug">
                        {p.problemReason || 'Atraso en fecha de recepción esperada.'}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <ProgramBadge programId={p.programId} />
                        <span>•</span>
                        <span>Monto: ${p.estimatedAmount.toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenEntity('purchase', p.id)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-semibold text-rose-700 shrink-0"
                    >
                      Ver Traba
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* BLOCK 2: HOY / VENCIMIENTOS Y REUNIONES DEL DÍA */}
        <div
          id="block-hoy"
          className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Hoy ({currentTodayTasks.length + todayMeetings.length})
              </h3>
            </div>
            <span className="text-[10px] font-semibold text-slate-500">
              15 de Agosto de 2026
            </span>
          </div>

          <div className="p-4 space-y-3">
            {currentTodayTasks.length === 0 && todayMeetings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <Calendar className="h-6 w-6 text-slate-300 mx-auto mb-1" />
                No hay vencimientos ni reuniones programadas para hoy.
              </div>
            ) : (
              <>
                {todayMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/40 flex items-center justify-between gap-3 text-left"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-900">{m.title}</span>
                        <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                          {m.dateTime.substring(11, 16)} hrs
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Lugar: {m.location} • {m.participants.length} participantes
                      </p>
                    </div>
                    <button
                      onClick={() => onOpenEntity('meeting', m.id)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-semibold text-indigo-600"
                    >
                      Minuta
                    </button>
                  </div>
                ))}

                {currentTodayTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-start justify-between gap-3 text-left"
                  >
                    <div className="flex items-start gap-2.5 flex-1">
                      <button
                        onClick={() => completeTask(t.id)}
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600 transition-colors"
                      >
                        <Check className="h-3 w-3 opacity-0 hover:opacity-100" />
                      </button>
                      <div>
                        <span
                          onClick={() => onOpenEntity('task', t.id)}
                          className="text-xs font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
                        >
                          {t.title}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <ProgramBadge programId={t.programId} />
                          <span>•</span>
                          <span>Resp: {t.responsible}</span>
                          <span>•</span>
                          <PriorityChip priority={t.priority} />
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenEntity('task', t.id)}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-slate-700"
                    >
                      Detalle
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* BLOCK 3: INDICADORES CRÍTICOS Y EN RIESGO */}
        <div
          id="block-indicadores"
          className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-amber-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Indicadores y Metas en Riesgo ({currentRiskIndicators.length})
              </h3>
            </div>
            <button
              onClick={() => setActiveView('dashboard')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Ver Dashboard →
            </button>
          </div>

          <div className="p-4 space-y-3">
            {currentRiskIndicators.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                Todas las metas están sobre el umbral de cumplimiento.
              </div>
            ) : (
              currentRiskIndicators.map((ind) => {
                const percent =
                  ind.direction === 'higher_is_better'
                    ? ind.periodTarget > 0 ? (ind.currentResult / ind.periodTarget) * 100 : 0
                    : ind.currentResult > 0 ? (ind.periodTarget / ind.currentResult) * 100 : 100;
                const isCritical = percent < 70;

                return (
                  <div
                    key={ind.id}
                    className={`p-3 rounded-xl border text-left space-y-2 ${
                      isCritical ? 'border-rose-200 bg-rose-50/30' : 'border-amber-200 bg-amber-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                            isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ind.code}
                        </span>
                        <span
                          onClick={() => onOpenEntity('indicator', ind.id)}
                          className="text-xs font-bold text-slate-900 hover:text-indigo-600 cursor-pointer"
                        >
                          {ind.name}
                        </span>
                      </div>
                      <ProgramBadge programId={ind.programId} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          Cumplimiento: <strong className={isCritical ? 'text-rose-700' : 'text-amber-700'}>{percent.toFixed(1)}%</strong>
                        </span>
                        <span className="text-slate-600 font-semibold">
                          {ind.currentResult} / {ind.periodTarget} {ind.unit} (Brecha: {Math.abs(ind.periodTarget - ind.currentResult)} {ind.unit})
                        </span>
                      </div>
                      <ProgressBar
                        value={percent}
                        colorScheme={isCritical ? 'rose' : 'amber'}
                        size="sm"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Corte: {ind.cutoffDate} • Resp: {ind.responsible}</span>
                      <button
                        onClick={() => onOpenEntity('indicator', ind.id)}
                        className="text-indigo-600 font-bold hover:underline"
                      >
                        Registrar corte →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* BLOCK 4: ALERTAS FINANCIERAS Y PREGUNTAS ABIERTAS */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-purple-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Finanzas y Preguntas Pendientes
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {currentFinAlerts.length} finanzas • {currentQuestions.length} consultas
            </span>
          </div>

          <div className="p-4 space-y-4 text-left">
            {/* Financial Alerts */}
            {currentFinAlerts.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Alertas Presupuestarias
                </div>
                {currentFinAlerts.map((fa, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/40 text-xs flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <ProgramBadge programId={fa.programId} />
                        <span className="font-bold text-amber-900">{fa.rate.toFixed(1)}% Ejecutado</span>
                      </div>
                      <p className="text-[11px] text-slate-600">{fa.reason}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProgramId(fa.programId);
                        setActiveView('program_detail');
                      }}
                      className="px-2 py-1 bg-white border border-slate-200 rounded text-[11px] font-semibold text-indigo-600 shrink-0"
                    >
                      Ver Balance
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Unanswered Questions (For next meeting) */}
            <div className="space-y-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Preguntas Clave para Próxima Reunión ({currentQuestions.length})
              </div>
              {currentQuestions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay preguntas abiertas pendientes.</p>
              ) : (
                currentQuestions.slice(0, 3).map((q) => (
                  <div
                    key={q.id}
                    onClick={() => onOpenEntity('question', q.id)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-200 hover:bg-purple-50/30 cursor-pointer transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 line-clamp-1">{q.question}</span>
                      <ProgramBadge programId={q.programId} />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Instancia: {q.nextInstance || 'Comité Técnico Comunal'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
