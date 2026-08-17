import React, { useState } from 'react';
import { useApp, ProgramSummary } from '../../context/AppContext';
import { ProgramId, TrafficLightStatus } from '../../types';
import {
  LayoutDashboard,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowRight,
  Filter,
  Calendar,
  Building2,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { TrafficLightBadge, ProgressBar } from '../common/UIComponents';

export const DashboardGlobalView: React.FC = () => {
  const {
    programs,
    programSummaries,
    setSelectedProgramId,
    setActiveView,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | 'red' | 'yellow' | 'green'>('all');

  const summariesList: ProgramSummary[] = Object.values(programSummaries);

  const filteredSummaries = summariesList.filter((s) => {
    if (statusFilter === 'all') return true;
    return s.status === statusFilter;
  });

  const countRed = summariesList.filter((s) => s.status === 'red').length;
  const countYellow = summariesList.filter((s) => s.status === 'yellow').length;
  const countGreen = summariesList.filter((s) => s.status === 'green').length;

  const handleOpenProgram = (id: ProgramId) => {
    setSelectedProgramId(id);
    setActiveView('program_detail');
  };

  return (
    <div id="view-dashboard-global" className="space-y-6 animate-in fade-in duration-150 text-left">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Dashboard Global de Programas
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            «¿Qué programa necesita atención?» — Semáforo y salud programática en tiempo real
          </p>
        </div>

        {/* Global summary chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Todos ({programs.length})
          </button>
          <button
            onClick={() => setStatusFilter('red')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'red'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Crítico ({countRed})</span>
          </button>
          <button
            onClick={() => setStatusFilter('yellow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'yellow'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Atención ({countYellow})</span>
          </button>
          <button
            onClick={() => setStatusFilter('green')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              statusFilter === 'green'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>En Regla ({countGreen})</span>
          </button>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSummaries.map((summary) => {
          const prog = summary.program;
          const isCritical = summary.status === 'red';
          const isAttention = summary.status === 'yellow';

          return (
            <div
              key={prog.id}
              id={`card-program-${prog.id}`}
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between hover:shadow-lg bg-white overflow-hidden ${
                isCritical
                  ? 'border-rose-300 ring-1 ring-rose-200/50'
                  : isAttention
                  ? 'border-amber-300 ring-1 ring-amber-200/50'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: prog.color }}
                      />
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        {prog.code}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {prog.shortName}
                    </h3>
                  </div>

                  <TrafficLightBadge status={summary.status} />
                </div>

                {/* Status reason explanation */}
                <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800">Causa:</span>
                  <span className="truncate">{summary.statusReason}</span>
                </div>
              </div>

              {/* Card Metrics Body */}
              <div className="px-5 py-3 space-y-3.5 border-t border-slate-100">
                {/* Metas Cumplimiento */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
                      Cumplimiento de Metas ({summary.indicatorsTotal})
                    </span>
                    <span className="text-slate-900 font-bold">
                      {summary.indicatorsCompliance.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={summary.indicatorsCompliance}
                    size="sm"
                    colorScheme="auto"
                  />
                  {summary.indicatorsCritical > 0 && (
                    <p className="text-[10px] text-rose-600 font-bold">
                      ⚠ {summary.indicatorsCritical} meta(s) en estado crítico
                    </p>
                  )}
                </div>

                {/* Finanzas Ejecución */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600 flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                      Ejecución Financiera (Convenio)
                    </span>
                    <span className="text-slate-900 font-bold">
                      {summary.financialExecutionRate.toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={summary.financialExecutionRate}
                    size="sm"
                    colorScheme={summary.financialExecutionRate < 45 ? 'rose' : 'auto'}
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Ejec: ${summary.executedBudget.toLocaleString('es-CL')}</span>
                    <span>Vig: ${summary.totalBudget.toLocaleString('es-CL')}</span>
                  </div>
                </div>

                {/* Quick stats badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-medium">Vencidas</span>
                    <span
                      className={`text-xs font-bold ${
                        summary.overdueTasksCount > 0 ? 'text-rose-600' : 'text-slate-700'
                      }`}
                    >
                      {summary.overdueTasksCount}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-medium">Alertas</span>
                    <span
                      className={`text-xs font-bold ${
                        summary.activeAlertsCount > 0 ? 'text-amber-600' : 'text-slate-700'
                      }`}
                    >
                      {summary.activeAlertsCount}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50">
                    <span className="text-[10px] text-slate-400 block font-medium">Disponible</span>
                    <span className="text-xs font-bold text-slate-700">
                      ${(summary.availableBudget / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>

                {/* Next Milestone */}
                <div className="text-[11px] text-slate-500 pt-1 flex items-start gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate">Hito: {summary.nextMilestone}</span>
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => handleOpenProgram(prog.id)}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs group"
                >
                  <span>Ingresar a {prog.shortName}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Consolidated Summary Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Matriz Comparativa de Programas de Salud Quilicura
            </h3>
            <p className="text-xs text-slate-500">
              Consolidado de metas, presupuesto y compromisos (Corte Agosto 2026)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/60 font-semibold text-slate-600">
                <th className="p-3.5">Programa</th>
                <th className="p-3.5 text-center">Semáforo</th>
                <th className="p-3.5">Cumplimiento Metas</th>
                <th className="p-3.5">Presupuesto Vigente</th>
                <th className="p-3.5">Ejecución (%)</th>
                <th className="p-3.5">Disponible Real</th>
                <th className="p-3.5 text-center">Vencidas</th>
                <th className="p-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summariesList.map((s) => (
                <tr key={s.program.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.program.color }} />
                      <span>{s.program.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5 text-center">
                    <TrafficLightBadge status={s.status} size="sm" showLabel={false} />
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2 w-32">
                      <ProgressBar value={s.indicatorsCompliance} size="sm" />
                      <span className="font-bold text-slate-800">{s.indicatorsCompliance.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="p-3.5 font-medium text-slate-700">
                    ${s.totalBudget.toLocaleString('es-CL')}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`font-bold ${
                        s.financialExecutionRate < 45 ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {s.financialExecutionRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-slate-700">
                    ${s.availableBudget.toLocaleString('es-CL')}
                  </td>
                  <td className="p-3.5 text-center font-bold">
                    <span className={s.overdueTasksCount > 0 ? 'text-rose-600' : 'text-slate-400'}>
                      {s.overdueTasksCount}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleOpenProgram(s.program.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                    >
                      Abrir →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
