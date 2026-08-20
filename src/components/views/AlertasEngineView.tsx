import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId, AlertSeverity, AlertType } from '../../types';
import {
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info,
  Clock,
  TrendingDown,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import { ProgramBadge, PriorityChip } from '../common/UIComponents';
import { DrawerEntityType } from '../common/EntityDrawer';
import { formatDate } from '../../utils/dateUtils';

export const AlertasEngineView: React.FC<{
  onOpenEntity: (type: DrawerEntityType, id: string) => void;
}> = ({ onOpenEntity }) => {
  const {
    globalAlerts,
    programs,
    programSummaries,
    showToast,
    setSelectedProgramId,
    setActiveView,
  } = useApp();

  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  const [filterType, setFilterType] = useState<AlertType | 'all'>('all');

  // Configurable thresholds in state
  const [thresholdIndicatorCritical, setThresholdIndicatorCritical] = useState('70');
  const [thresholdIndicatorAttention, setThresholdIndicatorAttention] = useState('90');
  const [thresholdBudgetLow, setThresholdBudgetLow] = useState('45');
  const [thresholdTaskSoonDays, setThresholdTaskSoonDays] = useState('7');
  const [thresholdPurchaseDelayDays, setThresholdPurchaseDelayDays] = useState('14');

  const filteredAlerts = globalAlerts.filter((a) => {
    if (filterSeverity !== 'all' && a.severity !== filterSeverity) return false;
    if (filterType !== 'all' && a.type !== filterType) return false;
    return true;
  });

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Umbrales del motor de alertas actualizados correctamente.', 'success');
  };

  return (
    <div id="view-alertas-engine" className="space-y-6 animate-in fade-in duration-150 text-left">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-600">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Motor de Alertas y Gestión por Excepción
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Reglas automatizadas de detección de desviaciones operativas y financieras en Quilicura
          </p>
        </div>

        <button
          onClick={() => showToast('Reglas de alertas reevaluadas en tiempo real.', 'info')}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Reevaluar Reglas</span>
        </button>
      </div>

      {/* Rules overview & stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-rose-200 bg-rose-50/50">
          <span className="text-[11px] font-semibold text-rose-800">Alertas Críticas</span>
          <p className="text-2xl font-bold text-rose-900 mt-1">
            {globalAlerts.filter((a) => a.severity === 'critica').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50">
          <span className="text-[11px] font-semibold text-amber-800">Alertas de Atención</span>
          <p className="text-2xl font-bold text-amber-900 mt-1">
            {globalAlerts.filter((a) => a.severity === 'atencion').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50">
          <span className="text-[11px] font-semibold text-blue-800">Informativas</span>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {globalAlerts.filter((a) => a.severity === 'informativa').length}
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-slate-200 bg-white">
          <span className="text-[11px] font-semibold text-slate-500">Programas Afectados</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {new Set(globalAlerts.map((a) => a.programId)).size} de {programs.length}
          </p>
        </div>
      </div>

      {/* Main Grid: Active Alerts List & Thresholds Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Alertas Activas en Tiempo Real ({filteredAlerts.length})
            </h3>
            <div className="flex gap-2">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as any)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 font-medium"
              >
                <option value="all">Todas las severidades</option>
                <option value="critica">Solo Críticas</option>
                <option value="atencion">Solo Atención</option>
                <option value="informativa">Solo Informativas</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlerts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-slate-200 bg-white space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-slate-700">Sin alertas para este filtro</p>
                <p className="text-xs text-slate-400">Todos los parámetros cumplen las tolerancias configuradas.</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isCrit = alert.severity === 'critica';
                return (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      isCrit
                        ? 'border-rose-200 bg-rose-50/40 hover:bg-rose-50/70'
                        : 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isCrit ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <span className="font-bold text-xs text-slate-900">
                            {alert.title}
                          </span>
                          <ProgramBadge programId={alert.programId} />
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {alert.description}
                        </p>
                      </div>

                      {alert.entityType && alert.entityId && (
                        <button
                          onClick={() => onOpenEntity(alert.entityType as any, alert.entityId as string)}
                          className="px-3 py-1 bg-white border border-slate-200 hover:border-indigo-300 rounded-lg text-xs font-semibold text-indigo-600 shrink-0"
                        >
                          Resolver →
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-black/5">
                      <span>Regla disparadora: <strong>{alert.triggerCondition}</strong></span>
                      <span>{formatDate(alert.date)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Thresholds and Rules Configuration Panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm h-fit">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Parámetros del Motor de Reglas</h3>
          </div>

          <form onSubmit={handleSaveThresholds} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Umbral Crítico Cumplimiento Metas (%)
              </label>
              <input
                type="number"
                value={thresholdIndicatorCritical}
                onChange={(e) => setThresholdIndicatorCritical(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
              />
              <span className="text-[10px] text-slate-400">
                Bajo este porcentaje, el indicador y programa se marcan en Rojo (🔴).
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Umbral Atención Cumplimiento Metas (%)
              </label>
              <input
                type="number"
                value={thresholdIndicatorAttention}
                onChange={(e) => setThresholdIndicatorAttention(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
              />
              <span className="text-[10px] text-slate-400">
                Bajo este porcentaje, se marca en Amarillo (🟡).
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ejecución Presupuestaria Mínima Esperada a Agosto (%)
              </label>
              <input
                type="number"
                value={thresholdBudgetLow}
                onChange={(e) => setThresholdBudgetLow(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
              />
              <span className="text-[10px] text-slate-400">
                Alerta financiera si el devengado es menor a este ritmo anual.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Anticipación para tareas próximas a vencer (días)
              </label>
              <input
                type="number"
                value={thresholdTaskSoonDays}
                onChange={(e) => setThresholdTaskSoonDays(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-2xs"
            >
              Guardar Configuración de Reglas
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
