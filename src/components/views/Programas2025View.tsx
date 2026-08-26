import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RESUMEN_2025_DATA,
  Indicador2025,
  Compra2025,
  PresupuestoPrograma2025,
  HitoDestacado2025,
} from '../../data/resumen2025Data';
import {
  Calendar,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Award,
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  UsersRound,
  FileCheck2,
  Download,
  Printer,
  ChevronRight,
  Layers,
  HeartHandshake,
  Activity,
  ScanLine,
  SmilePlus,
  Stethoscope,
  BookOpenCheck,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { ProgressBar } from '../common/UIComponents';
import { formatDate } from '../../utils/dateUtils';

export const Programas2025View: React.FC = () => {
  const { setSelectedProgramId, setActiveView } = useApp();
  const [activeTab, setActiveTab] = useState<'resumen' | 'indicadores' | 'compras' | 'presupuesto' | 'hitos'>('resumen');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  const handleExportSummary = () => {
    showToast('Informe consolidado del ejercicio 2025 preparado para impresión/exportación.');
    window.print();
  };

  // Filter indicators
  const filteredIndicators = RESUMEN_2025_DATA.indicators.filter((ind) => {
    const matchesProg = selectedProgramFilter === 'all' || ind.programId === selectedProgramFilter;
    const matchesSearch =
      ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.programName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProg && matchesSearch;
  });

  // Filter purchases
  const filteredPurchases = RESUMEN_2025_DATA.purchases.filter((p) => {
    const matchesProg = selectedProgramFilter === 'all' || p.programId === selectedProgramFilter;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ocNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProg && matchesSearch;
  });

  // Filter highlights
  const filteredHighlights = RESUMEN_2025_DATA.highlights.filter((h) => {
    const matchesProg = selectedProgramFilter === 'all' || !h.programId || h.programId === selectedProgramFilter;
    const matchesSearch =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesProg && matchesSearch;
  });

  return (
    <div id="view-programas-2025" className="space-y-6 animate-in fade-in duration-150 text-left">
      {/* Header Banner */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-6 text-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                <BookOpenCheck className="h-3.5 w-3.5" />
                Cierre Anual Consolidado
              </span>
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                Gestión Quilicura 2025
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Resumen Ejecutivo — Programas de Salud 2025
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Consolidado de cumplimiento de indicadores asistenciales, ejecución presupuestaria, contrataciones y compras públicas, y los principales hitos de impacto comunitario alcanzados en la comuna de Quilicura durante el año 2025.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedProgramId(null);
                setActiveView('dashboard');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3.5 py-2.5 text-xs font-bold text-slate-200 shadow-sm hover:bg-slate-700 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Volver al Dashboard"
            >
              <ArrowLeft className="h-4 w-4 text-slate-300" />
              <span>Volver</span>
            </button>
            <button
              onClick={handleExportSummary}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Imprimir / Exportar Cierre 2025</span>
            </button>
          </div>
        </div>

        {/* Global Key Stats Ribbon */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-800/80 pt-5">
          <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span>Ejecución Presupuestaria</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white">
                {RESUMEN_2025_DATA.globalExecutionRate}%
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold">
                ({formatCLP(RESUMEN_2025_DATA.totalExecutedBudget)})
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <CheckCircle2 className="h-4 w-4 text-sky-400" />
              <span>Metas e Indicadores</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white">
                {RESUMEN_2025_DATA.compliantIndicators} / {RESUMEN_2025_DATA.totalIndicators}
              </span>
              <span className="text-[11px] text-sky-400 font-semibold">
                (94.4% Cumplimiento)
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <ShoppingCart className="h-4 w-4 text-amber-400" />
              <span>Compras y Licitaciones</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white">
                {RESUMEN_2025_DATA.totalPurchases}
              </span>
              <span className="text-[11px] text-amber-400 font-semibold">
                ({formatCLP(RESUMEN_2025_DATA.totalPurchasesAmount)})
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-slate-800/60 p-3.5 border border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <UsersRound className="h-4 w-4 text-indigo-400" />
              <span>Prestaciones Comunitarias</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-white">
                +38.450
              </span>
              <span className="text-[11px] text-indigo-300 font-semibold">
                en Red Quilicura
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'resumen'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Resumen General</span>
          </button>

          <button
            onClick={() => setActiveTab('indicadores')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'indicadores'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Indicadores y Metas 2025</span>
          </button>

          <button
            onClick={() => setActiveTab('compras')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'compras'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Compras y Licitaciones</span>
          </button>

          <button
            onClick={() => setActiveTab('presupuesto')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'presupuesto'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>Presupuesto y Rendición</span>
          </button>

          <button
            onClick={() => setActiveTab('hitos')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'hitos'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Información Destacada</span>
          </button>
        </div>

        {/* Global Search and Program filter in secondary tabs */}
        {(activeTab === 'indicadores' || activeTab === 'compras' || activeTab === 'hitos') && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar en 2025..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedProgramFilter}
              onChange={(e) => setSelectedProgramFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none font-medium"
            >
              <option value="all">Todos los Programas</option>
              <option value="praps_cpu">Cuidados Paliativos (CPU)</option>
              <option value="praps_rehab">Rehabilitación Integral</option>
              <option value="praps_imagenes">Imágenes Diagnósticas</option>
              <option value="praps_mas_ama">+ Adultos Mayores (+AMA)</option>
              <option value="praps_respiratoria">Salud Respiratoria (ERA/IRA)</option>
              <option value="prog_personas_mayores">Personas Mayores (ELEAM)</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: RESUMEN GENERAL */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Executive Overview Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Card 1: Indicadores Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Indicadores Asistenciales</h3>
                    <p className="text-[11px] text-slate-500">18 metas comunales evaluadas</p>
                  </div>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  94.4% Éxito
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Metas Superadas (&gt;100%):</span>
                  <span className="font-bold text-emerald-700">14 metas</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Metas Cumplidas (90-99%):</span>
                  <span className="font-bold text-sky-700">3 metas</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Brechas Menores (&lt;90%):</span>
                  <span className="font-bold text-amber-700">1 meta (EMPAM 88.6%)</span>
                </div>
                <div className="pt-2">
                  <ProgressBar percent={94.4} colorClass="bg-emerald-500" />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed border border-slate-100">
                <strong>Logro Principal:</strong> 100% de oportunidad en entrega domiciliaria de CPU y superación de cobertura en Más Adultos Mayores (+AMA).
              </div>
            </div>

            {/* Card 2: Compras & Licitaciones Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Compras y Licitaciones</h3>
                    <p className="text-[11px] text-slate-500">48 procesos Mercado Público</p>
                  </div>
                </div>
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                  {formatCLP(RESUMEN_2025_DATA.totalPurchasesAmount)}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Licitaciones Públicas cerradas:</span>
                  <span className="font-bold text-slate-900">8 licitaciones</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Convenios Marco ejecutados:</span>
                  <span className="font-bold text-slate-900">26 órdenes</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Compras Ágiles y Tratos Directos:</span>
                  <span className="font-bold text-slate-900">14 procesos</span>
                </div>
                <div className="pt-2">
                  <ProgressBar percent={100} colorClass="bg-amber-500" />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed border border-slate-100">
                <strong>Logro Principal:</strong> 100% de compras recepcionadas conforme sin observaciones de Contraloría ni quiebres clínicos.
              </div>
            </div>

            {/* Card 3: Presupuesto Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Presupuesto y Rendición</h3>
                    <p className="text-[11px] text-slate-500">6 convenios PRAPS / Mayores</p>
                  </div>
                </div>
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                  98.5% Rendido
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Presupuesto Asignado:</span>
                  <span className="font-bold text-slate-900">{formatCLP(RESUMEN_2025_DATA.totalAssignedBudget)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Presupuesto Ejecutado:</span>
                  <span className="font-bold text-emerald-700">{formatCLP(RESUMEN_2025_DATA.totalExecutedBudget)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Saldo / Remanente Final:</span>
                  <span className="font-bold text-slate-500">{formatCLP(8442000)} (1.5%)</span>
                </div>
                <div className="pt-2">
                  <ProgressBar percent={98.5} colorClass="bg-indigo-600" />
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed border border-slate-100">
                <strong>Resolución SSMN:</strong> Rendición de Cuentas aprobada formalmente bajo Res. Exenta N° 3418.
              </div>
            </div>
          </div>

          {/* Table: Desglose por Programa 2025 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Resumen de Ejecución y Rendimiento por Programa (2025)
                </h3>
                <p className="text-xs text-slate-500">
                  Comparativa de asignación presupuestaria, tasa de ejecución y estado de rendición
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                100% Auditado y Aprobado
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Programa</th>
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3">Ppto. Asignado</th>
                    <th className="py-3 px-3">Ppto. Ejecutado</th>
                    <th className="py-3 px-3">% Ejecución</th>
                    <th className="py-3 px-3">Saldo</th>
                    <th className="py-3 px-3">Estado Rendición SSMN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RESUMEN_2025_DATA.programsSummary.map((prog) => (
                    <tr key={prog.programId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {prog.programName}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[11px] font-semibold text-indigo-700">
                        {prog.code}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium">
                        {formatCLP(prog.assignedBudget)}
                      </td>
                      <td className="py-3.5 px-3 text-slate-900 font-bold">
                        {formatCLP(prog.executedBudget)}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-700">{prog.executionRate}%</span>
                          <div className="w-16">
                            <ProgressBar percent={prog.executionRate} colorClass="bg-emerald-600" />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                        {formatCLP(prog.balance)}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          {prog.rendicionStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Highlights Preview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">
                  Hitos Asistenciales Destacados de Quilicura en 2025
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('hitos')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Ver todos los hitos ({RESUMEN_2025_DATA.highlights.length})
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {RESUMEN_2025_DATA.highlights.slice(0, 3).map((h) => (
                <div key={h.id} className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-indigo-100 text-indigo-700 px-2 py-0.5 text-[10px] font-bold">
                      {h.category}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{formatDate(h.date)}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{h.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-3">{h.highlightText}</p>
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-emerald-700">{h.keyMetric}</span>
                    <span className="text-slate-400 font-medium">{h.impactLevel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INDICADORES 2025 */}
      {activeTab === 'indicadores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Cumplimiento de Metas e Indicadores Asistenciales 2025
              </h3>
              <p className="text-xs text-slate-500">
                Registro de cobertura, efectividad clínica y oportunidad en los programas PRAPS y Personas Mayores
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              Mostrando {filteredIndicators.length} de {RESUMEN_2025_DATA.indicators.length} indicadores
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Código</th>
                    <th className="py-3 px-3">Nombre del Indicador</th>
                    <th className="py-3 px-3">Programa</th>
                    <th className="py-3 px-3">Meta 2025</th>
                    <th className="py-3 px-3">Logrado 2025</th>
                    <th className="py-3 px-3">% Cumplimiento</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3">Observaciones & Fuente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIndicators.map((ind) => {
                    const isSuperada = ind.complianceRate >= 100;
                    const isCumplida = ind.complianceRate >= 90 && ind.complianceRate < 100;

                    return (
                      <tr key={ind.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-indigo-600 text-[11px]">
                          {ind.code}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900">{ind.name}</div>
                          <div className="text-[10px] text-slate-400">{ind.category}</div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 font-medium">
                          {ind.programName}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-700">
                          {ind.target.toLocaleString('es-CL')} {ind.unit}
                        </td>
                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          {ind.achieved.toLocaleString('es-CL')} {ind.unit}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold ${
                                isSuperada
                                  ? 'text-emerald-700'
                                  : isCumplida
                                  ? 'text-sky-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              {ind.complianceRate}%
                            </span>
                            <div className="w-16">
                              <ProgressBar
                                percent={Math.min(ind.complianceRate, 100)}
                                colorClass={
                                  isSuperada
                                    ? 'bg-emerald-600'
                                    : isCumplida
                                    ? 'bg-sky-600'
                                    : 'bg-amber-500'
                                }
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          {isSuperada ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Superada
                            </span>
                          ) : isCumplida ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Cumplida
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                              <Info className="h-3 w-3" />
                              Brecha Menor
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 max-w-xs text-[11px] text-slate-600">
                          <div>{ind.notes}</div>
                          <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                            Fuente: {ind.source}
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

      {/* TAB 3: COMPRAS Y LICITACIONES 2025 */}
      {activeTab === 'compras' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Adquisiciones, Compras Críticas y Licitaciones 2025
              </h3>
              <p className="text-xs text-slate-500">
                48 procesos ejecutados en Mercado Público con 100% de recepción conforme y rendición sin reparos
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              Mostrando {filteredPurchases.length} de {RESUMEN_2025_DATA.purchases.length} compras destacadas
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPurchases.map((compra) => (
              <div
                key={compra.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-700 border border-slate-200">
                      {compra.ocNumber}
                    </span>
                    <h4 className="mt-1.5 text-xs sm:text-sm font-bold text-slate-900">
                      {compra.title}
                    </h4>
                  </div>
                  <span className="shrink-0 text-sm font-black text-slate-900 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-200">
                    {formatCLP(compra.amount)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Programa:</span>
                    <span className="font-semibold text-slate-800">{compra.programName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Modalidad:</span>
                    <span className="font-semibold text-indigo-700">{compra.purchaseType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Proveedor:</span>
                    <span className="font-medium text-slate-700 truncate block">{compra.supplier}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Recepción:</span>
                    <span className="font-medium text-slate-700">{formatDate(compra.receptionDate)}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/50">
                  <span className="font-bold text-amber-900 block text-[11px]">Impacto Clínico & Asistencial:</span>
                  <span className="text-amber-950/80 text-[11px] leading-relaxed">{compra.clinicalImpact}</span>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-400 font-medium">Destino: {compra.targetEstablishment}</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {compra.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PRESUPUESTO Y RENDICIÓN 2025 */}
      {activeTab === 'presupuesto' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Detalle Presupuestario Consolidado por Subtítulos (2025)
                </h3>
                <p className="text-xs text-slate-500">
                  Distribución del gasto en Personal (Subt. 21), Bienes y Servicios (Subt. 22) y Equipamiento (Subt. 29)
                </p>
              </div>
              <div className="rounded-xl bg-slate-900 text-white px-3.5 py-2 text-xs font-bold flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-400" />
                <span>{RESUMEN_2025_DATA.approvalSSMN}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {RESUMEN_2025_DATA.programsSummary.map((p) => (
                <div
                  key={p.programId}
                  className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-slate-50/40 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <span className="text-[10px] font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {p.code}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                        {p.programName}
                      </h4>
                    </div>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {p.executionRate}%
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Asignado:</span>
                      <span className="font-semibold text-slate-800">{formatCLP(p.assignedBudget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ejecutado:</span>
                      <span className="font-bold text-slate-900">{formatCLP(p.executedBudget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Remanente:</span>
                      <span className="font-medium text-slate-500">{formatCLP(p.balance)}</span>
                    </div>
                    <div className="pt-1">
                      <ProgressBar percent={p.executionRate} colorClass="bg-indigo-600" />
                    </div>
                  </div>

                  {/* Subtitle Breakdown */}
                  <div className="rounded-xl bg-white p-3 border border-slate-200 space-y-1.5 text-[11px]">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Desglose por Subtítulo:</div>
                    <div className="flex justify-between text-slate-700">
                      <span>Subt. 21 (Personal):</span>
                      <span className="font-semibold">{formatCLP(p.personnelExpenses)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Subt. 22 (Operación/Insumos):</span>
                      <span className="font-semibold">{formatCLP(p.operatingExpenses)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Subt. 29 (Equipos/Inversión):</span>
                      <span className="font-semibold">{formatCLP(p.investmentExpenses)}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 italic">«{p.observations}»</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: HITOS E INFORMACIÓN DESTACADA 2025 */}
      {activeTab === 'hitos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Información Destacada e Hitos Estratégicos 2025
              </h3>
              <p className="text-xs text-slate-500">
                Logros de gestión en salud pública comunitaria que marcaron el estándar operativo para Quilicura
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              Mostrando {filteredHighlights.length} hitos comunales
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredHighlights.map((hito) => (
              <div
                key={hito.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 text-[11px] border border-amber-200">
                      {hito.category}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{formatDate(hito.date)}</span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {hito.title}
                  </h4>

                  <div className="rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-800 border-l-3 border-amber-500">
                    {hito.highlightText}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {hito.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {hito.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <Award className="h-3.5 w-3.5" />
                    <span>{hito.keyMetric}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
