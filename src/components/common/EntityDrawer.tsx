import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Task, 
  Purchase, 
  Indicator, 
  Meeting, 
  PendingEmail, 
  Question, 
  KnowledgeItem, 
  HRRecord, 
  EleamCase,
  PriorityLevel,
  TaskStatus,
  PurchaseStatus,
  EmailStatus,
  EmailAction,
  QuestionStatus,
  QuestionCategory,
  getPurchaseDateFieldLabel,
  PurchaseMacroState,
  PurchaseReceptionStatus,
  PurchaseInvoiceStatus,
  getPurchaseEffectiveMacroState,
  getPurchaseAlerts,
} from '../../types';
import { 
  X, 
  Save, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  User, 
  Building, 
  Tag, 
  Paperclip,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileText,
  Check,
  Percent,
  Layers,
  Target,
  Maximize2,
  Receipt,
  Truck,
  FileCheck,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  PackageCheck,
  Info,
} from 'lucide-react';
import { 
  ProgramBadge, 
  PriorityChip, 
  TaskStatusChip, 
  PurchaseStatusChip, 
  ProgressBar, 
  TrafficLightBadge,
  PurchaseMacroBadge,
  PurchaseReceptionBadge,
  PurchaseInvoiceBadge,
} from './UIComponents';

const normalizeUrl = (url?: string): string => {
  if (!url || !url.trim()) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export type DrawerEntityType = 
  | 'task' 
  | 'purchase' 
  | 'indicator' 
  | 'meeting' 
  | 'email' 
  | 'question' 
  | 'knowledge' 
  | 'hr' 
  | 'eleam';

export const EntityDrawer: React.FC<{
  isOpen: boolean;
  entityType: DrawerEntityType | null;
  entityId: string | null;
  onClose: () => void;
  onDeleteRequest: (type: DrawerEntityType, id: string) => void;
}> = ({ isOpen, entityType, entityId, onClose, onDeleteRequest }) => {
  const {
    tasks,
    updateTask,
    completeTask,
    purchases,
    updatePurchase,
    indicators,
    updateIndicator,
    recordMeasurement,
    meetings,
    convertCommitmentToTask,
    emails,
    updateEmail,
    questions,
    updateQuestion,
    knowledge,
    updateKnowledge,
    hrRecords,
    updateHRRecord,
    eleamCases,
    updateEleamCase,
    establishments,
    attachments,
    addAttachment,
    deleteAttachment,
    showToast,
  } = useApp();

  // Local editing states
  const [measurementValue, setMeasurementValue] = useState('');
  const [measurementPeriod, setMeasurementPeriod] = useState('2026-08');
  const [measurementNotes, setMeasurementNotes] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // Indicator Full Edit States
  const [indCode, setIndCode] = useState('');
  const [indComponente, setIndComponente] = useState('');
  const [indName, setIndName] = useState('');
  const [indObjetivo, setIndObjetivo] = useState('');
  const [indCorte, setIndCorte] = useState<'1° corte' | '2° corte' | '3° corte'>('1° corte');
  const [indNumDesc, setIndNumDesc] = useState('');
  const [indNumPorc, setIndNumPorc] = useState('');
  const [indDenDesc, setIndDenDesc] = useState('');
  const [indDenPorc, setIndDenPorc] = useState('');
  const [indPesoRelativo, setIndPesoRelativo] = useState('');
  const [indMedioNum, setIndMedioNum] = useState('');
  const [indMedioDen, setIndMedioDen] = useState('');
  const [indMetaAnualTexto, setIndMetaAnualTexto] = useState('');
  const [indMetaAnualPorc, setIndMetaAnualPorc] = useState('');
  const [indCurrent, setIndCurrent] = useState('');
  const [indFechaCorte, setIndFechaCorte] = useState('2026-08-15');
  const [indSavedSuccess, setIndSavedSuccess] = useState(false);

  // Find item
  const task = entityType === 'task' ? tasks.find((t) => t.id === entityId) : null;
  const purchase = entityType === 'purchase' ? purchases.find((p) => p.id === entityId) : null;
  const indicator = entityType === 'indicator' ? indicators.find((i) => i.id === entityId) : null;
  const meeting = entityType === 'meeting' ? meetings.find((m) => m.id === entityId) : null;
  const email = entityType === 'email' ? emails.find((e) => e.id === entityId) : null;
  const question = entityType === 'question' ? questions.find((q) => q.id === entityId) : null;
  const know = entityType === 'knowledge' ? knowledge.find((k) => k.id === entityId) : null;
  const hr = entityType === 'hr' ? hrRecords.find((h) => h.id === entityId) : null;
  const eleam = entityType === 'eleam' ? eleamCases.find((e) => e.id === entityId) : null;

  // Initialize indicator edit values when opening an indicator
  useEffect(() => {
    if (indicator) {
      setIndCode(indicator.code || 'Indicador 1');
      setIndComponente(indicator.componente || '');
      setIndName(indicator.name || '');
      setIndObjetivo(indicator.objetivoEspecifico || indicator.description || '');
      setIndCorte((indicator.corteSeleccionado as any) || '1° corte');
      setIndNumDesc(indicator.numeradorDescripcion || '');
      setIndNumPorc(indicator.numeradorValor !== undefined ? String(indicator.numeradorValor) : '');
      setIndDenDesc(indicator.denominadorDescripcion || '');
      setIndDenPorc(indicator.denominadorValor !== undefined ? String(indicator.denominadorValor) : '');
      setIndPesoRelativo(indicator.pesoRelativo !== undefined ? String(indicator.pesoRelativo) : '');
      setIndMedioNum(indicator.medioVerificacionNumerador || '');
      setIndMedioDen(indicator.medioVerificacionDenominador || '');
      setIndMetaAnualTexto(indicator.metaCumplimientoAnualTexto || '');
      setIndMetaAnualPorc(
        indicator.metaCumplimientoAnualPorcentaje !== undefined
          ? String(indicator.metaCumplimientoAnualPorcentaje)
          : String(indicator.annualTarget || 100)
      );
      setIndCurrent(String(indicator.currentResult ?? 0));
      setIndFechaCorte(indicator.cutoffDate || '2026-08-15');
      setIndSavedSuccess(false);
    }
  }, [indicator?.id]);

  if (!isOpen || !entityType || !entityId) return null;

  const currentProgramId =
    task?.programId ||
    purchase?.programId ||
    indicator?.programId ||
    meeting?.programId ||
    email?.programId ||
    question?.programId ||
    know?.programId ||
    hr?.programId ||
    'praps_cpu';

  const entityAttachments = attachments.filter(
    (a) => a.entityId === entityId
  );

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachmentName.trim()) return;
    addAttachment({
      name: newAttachmentName.trim(),
      size: Math.floor(Math.random() * 800 + 120) * 1024,
      type: 'application/pdf',
      programId: currentProgramId,
      entityType: entityType === 'hr' || entityType === 'indicator' ? 'general' : (entityType as any),
      entityId,
    });
    setNewAttachmentName('');
  };

  const handleSaveIndicator = () => {
    if (!indicator) return;
    const numAnnual = parseFloat(indMetaAnualPorc) || indicator.annualTarget;
    const numCurrent = parseFloat(indCurrent) || indicator.currentResult;

    const cutData = {
      target: numAnnual,
      result: numCurrent,
      date: indFechaCorte,
      source: indMedioNum || indicator.source,
      notes: indObjetivo || undefined,
    };

    updateIndicator(indicator.id, {
      code: indCode.trim() || indicator.code,
      name: indName.trim() || indicator.name,
      description: indObjetivo.trim() || indicator.description,
      componente: indComponente.trim() || undefined,
      objetivoEspecifico: indObjetivo.trim() || undefined,
      corteSeleccionado: indCorte,
      numeradorDescripcion: indNumDesc.trim() || undefined,
      numeradorValor: indNumPorc ? parseFloat(indNumPorc) : undefined,
      denominadorDescripcion: indDenDesc.trim() || undefined,
      denominadorValor: indDenPorc ? parseFloat(indDenPorc) : undefined,
      pesoRelativo: indPesoRelativo ? parseFloat(indPesoRelativo) : undefined,
      medioVerificacionNumerador: indMedioNum.trim() || undefined,
      medioVerificacionDenominador: indMedioDen.trim() || undefined,
      metaCumplimientoAnualTexto: indMetaAnualTexto.trim() || undefined,
      metaCumplimientoAnualPorcentaje: numAnnual,
      annualTarget: numAnnual,
      periodTarget: numAnnual,
      currentResult: numCurrent,
      cutoffDate: indFechaCorte,
      source: indMedioNum || indicator.source,
      corte1: indCorte === '1° corte' ? cutData : indicator.corte1,
      corte2: indCorte === '2° corte' ? cutData : indicator.corte2,
      corte3: indCorte === '3° corte' ? cutData : indicator.corte3,
    });

    setIndSavedSuccess(true);
    showToast('Indicador guardado exitosamente', 'success');
    setTimeout(() => setIndSavedSuccess(false), 3000);
  };

  // ==========================================
  // FULL SCREEN VIEW FOR INDICATORS
  // ==========================================
  if (entityType === 'indicator' && indicator) {
    const complianceRate = indicator.annualTarget > 0 
      ? Math.round((indicator.currentResult / indicator.annualTarget) * 100) 
      : 0;

    return (
      <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/70 backdrop-blur-sm p-0 sm:p-3 md:p-6 flex items-center justify-center animate-in fade-in duration-150">
        <div
          id="indicator-fullscreen-modal"
          className="w-full h-full sm:h-[96vh] max-w-7xl bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-slate-200 flex flex-col overflow-hidden"
        >
          {/* Top Header - Mobile First */}
          <div className="p-3 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="shrink-0 flex items-center gap-1.5">
                <ProgramBadge programId={currentProgramId} />
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg shrink-0">
                  {indicator.code}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 truncate">
                  {indicator.name}
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden xs:block">
                  {indicator.componente || 'Ficha Técnica de Indicador y Cumplimiento Ministerial'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
              <button
                type="button"
                onClick={handleSaveIndicator}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all min-h-[40px]"
              >
                {indSavedSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>¡Guardado!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => onDeleteRequest('indicator', indicator.id)}
                className="rounded-xl border border-rose-200 bg-rose-50/50 p-2 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Eliminar indicador"
                aria-label="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Cerrar ventana"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body Content - Responsive Grid (Mobile 1 Col, Desktop 12 Cols) */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
              
              {/* Left Column: Full Technical Form (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Target className="h-4 w-4 text-indigo-600" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ficha Técnica y Parámetros del Indicador
                    </h2>
                  </div>

                  {/* Componente */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Componente
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Componente 1: Atención y Cobertura Integral"
                      value={indComponente}
                      onChange={(e) => setIndComponente(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Identificador, Indicador & Corte */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Identificador *
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Indicador 1"
                        value={indCode}
                        onChange={(e) => setIndCode(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nombre del Indicador *
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Cobertura de atenciones de rehabilitación integral"
                        value={indName}
                        onChange={(e) => setIndName(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Corte Seleccionado
                      </label>
                      <select
                        value={indCorte}
                        onChange={(e) => setIndCorte(e.target.value as any)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="1° corte">1° corte</option>
                        <option value="2° corte">2° corte</option>
                        <option value="3° corte">3° corte</option>
                      </select>
                    </div>
                  </div>

                  {/* Objetivo Específico */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Objetivo Específico
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Describa el objetivo sanitario u operativo del indicador..."
                      value={indObjetivo}
                      onChange={(e) => setIndObjetivo(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Numerador */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Numerador (Descripción)
                      </label>
                      <input
                        type="text"
                        placeholder="ej. N° de atenciones efectivas realizadas"
                        value={indNumDesc}
                        onChange={(e) => setIndNumDesc(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Numerador (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={indNumPorc}
                          onChange={(e) => setIndNumPorc(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Denominador */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Denominador (Descripción)
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Total de pacientes programados en red"
                        value={indDenDesc}
                        onChange={(e) => setIndDenDesc(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Denominador (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          placeholder="100"
                          value={indDenPorc}
                          onChange={(e) => setIndDenPorc(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Peso Relativo */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Peso Relativo en %
                    </label>
                    <div className="relative max-w-full sm:max-w-xs">
                      <input
                        type="number"
                        step="any"
                        placeholder="ej. 25"
                        value={indPesoRelativo}
                        onChange={(e) => setIndPesoRelativo(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>

                  {/* Medios de Verificación */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Medio de Verificación del Numerador
                      </label>
                      <input
                        type="text"
                        placeholder="ej. REM P01 Sala RBC"
                        value={indMedioNum}
                        onChange={(e) => setIndMedioNum(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Medio de Verificación del Denominador
                      </label>
                      <input
                        type="text"
                        placeholder="ej. Planilla Interna DISAM"
                        value={indMedioDen}
                        onChange={(e) => setIndMedioDen(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Meta Anual Texto */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Meta Cumplimiento del Indicador Anual (Descripción)
                    </label>
                    <input
                      type="text"
                      placeholder="ej. Alcanzar el 85% de cobertura anual acumulada"
                      value={indMetaAnualTexto}
                      onChange={(e) => setIndMetaAnualTexto(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Metas y Resultados en % */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Meta Anual en % *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          required
                          value={indMetaAnualPorc}
                          onChange={(e) => setIndMetaAnualPorc(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Resultado Actual en % *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          required
                          value={indCurrent}
                          onChange={(e) => setIndCurrent(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs font-bold text-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Fecha de Corte *
                      </label>
                      <input
                        type="date"
                        value={indFechaCorte}
                        onChange={(e) => setIndFechaCorte(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Performance, Measurements & Attachments (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Visual Summary Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Resumen de Cortes y Desempeño
                    </span>
                    <TrafficLightBadge
                      current={indicator.currentResult}
                      target={indicator.annualTarget}
                      direction={indicator.direction}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Meta Anual</span>
                      <span className="text-xs font-bold text-slate-800">{indicator.annualTarget} %</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">1° Corte</span>
                      <span className="text-xs font-bold text-slate-800 truncate block">
                        {indicator.corte1 ? `${indicator.corte1.result} / ${indicator.corte1.target}%` : `${indicator.currentResult} / ${indicator.periodTarget}%`}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">2° Corte</span>
                      <span className="text-xs font-bold text-indigo-600 truncate block">
                        {indicator.corte2 ? `${indicator.corte2.result} / ${indicator.corte2.target}%` : `Meta: ${indicator.annualTarget}%`}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600">Cumplimiento Acumulado</span>
                      <span className="text-slate-900 font-bold">{complianceRate}%</span>
                    </div>
                    <ProgressBar
                      current={indicator.currentResult}
                      target={indicator.annualTarget}
                      direction={indicator.direction}
                    />
                  </div>
                </div>

                {/* Record New Measurement */}
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <span>Registrar Nuevo Corte / Medición</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">Resultado Numérico (%)</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="ej. 85"
                        value={measurementValue}
                        onChange={(e) => setMeasurementValue(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-slate-600 block mb-1">Período / Corte</label>
                      <input
                        type="text"
                        value={measurementPeriod}
                        onChange={(e) => setMeasurementPeriod(e.target.value)}
                        placeholder="ej. 2026-08 o 2° Corte"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 block mb-1">Observaciones / Respaldo REM</label>
                    <input
                      type="text"
                      placeholder="ej. Validado con REM P01 y registro Rayen"
                      value={measurementNotes}
                      onChange={(e) => setMeasurementNotes(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!measurementValue) return;
                      recordMeasurement(indicator.id, parseFloat(measurementValue), measurementPeriod, measurementNotes);
                      setMeasurementValue('');
                      setMeasurementNotes('');
                      showToast('Medición guardada en el historial', 'success');
                    }}
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-xs min-h-[40px]"
                  >
                    Guardar Medición en Historial
                  </button>
                </div>

                {/* History of measurements */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Historial de Mediciones ({indicator.measurements.length})
                  </h4>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {indicator.measurements.length > 0 ? (
                      indicator.measurements.map((m) => (
                        <div key={m.id} className="p-2.5 border border-slate-200 rounded-xl flex items-center justify-between text-xs bg-slate-50/50">
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold text-slate-800">{m.period}</span>
                            <span className="text-[11px] text-slate-500 ml-2">({m.date})</span>
                            {m.notes && <p className="text-[11px] text-slate-500 mt-0.5 truncate">{m.notes}</p>}
                          </div>
                          <div className="font-bold text-slate-900 text-right shrink-0">
                            <div>{m.result} / {m.target} %</div>
                            <span className="text-[10px] text-slate-400 font-normal">{m.registeredBy}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2">Sin mediciones previas registradas.</p>
                    )}
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                      Medios de Verificación Adjuntos ({entityAttachments.length})
                    </span>
                  </div>

                  {entityAttachments.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {entityAttachments.map((att) => (
                        <div key={att.id} className="p-2 border border-slate-200 rounded-xl flex items-center justify-between text-xs bg-slate-50">
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{att.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">{(att.size / 1024).toFixed(0)} KB</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No hay documentos de verificación adjuntos.</p>
                  )}

                  <form onSubmit={handleAddFile} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ej. Reporte_DEIS_Corte1.pdf"
                      value={newAttachmentName}
                      onChange={(e) => setNewAttachmentName(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-900 transition-colors shrink-0"
                    >
                      Adjuntar
                    </button>
                  </form>
                </div>

              </div>
            </div>
          </div>

          {/* Footer - Mobile First */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
            <span className="text-[11px] sm:text-xs text-slate-500 text-center sm:text-left">
              Centro Operativo Quilicura • Ficha completa de Indicador
            </span>
            <div className="flex items-center justify-stretch sm:justify-end gap-2">
              <button
                type="button"
                onClick={handleSaveIndicator}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 min-h-[40px]"
              >
                <Save className="h-4 w-4" />
                <span>Guardar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSaveIndicator();
                  onClose();
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-95 transition-all shadow-sm min-h-[40px]"
              >
                Guardar y Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MODAL VIEW FOR ENTITIES (CENTERED & EXPANDED)
  // ==========================================
  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 flex items-center justify-center animate-in fade-in duration-150">
      <div
        id="entity-drawer-panel"
        className="w-full h-full sm:h-auto sm:max-h-[94vh] max-w-4xl bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col justify-between overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <ProgramBadge programId={currentProgramId} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Detalle de {
                entityType === 'purchase' ? 'Compra' :
                entityType === 'task' ? 'Tarea' :
                entityType === 'meeting' ? 'Reunión' :
                entityType === 'email' ? 'Correo / Acción' :
                entityType === 'indicator' ? 'Indicador' :
                entityType === 'hr' ? 'Recursos Humanos' :
                entityType === 'budget' ? 'Presupuesto' :
                entityType === 'question' ? 'Pregunta' :
                entityType === 'knowledge' ? 'Conocimiento' :
                entityType === 'eleam' ? 'Caso ELEAM' : entityType
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDeleteRequest(entityType, entityId)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
              title="Archivar registro"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
            {/* TASK DETAILS */}
            {task && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{task.title}</h2>
                  {task.description && (
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Estado</span>
                    <select
                      value={task.status}
                      onChange={(e) => updateTask(task.id, { status: e.target.value as TaskStatus })}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_curso">En Curso</option>
                      <option value="bloqueada">Bloqueada</option>
                      <option value="completada">Completada</option>
                      <option value="vencida">Vencida</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Prioridad</span>
                    <select
                      value={task.priority}
                      onChange={(e) => updateTask(task.id, { priority: e.target.value as PriorityLevel })}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Fecha Límite</span>
                    <input
                      type="date"
                      value={task.dueDate}
                      onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                      className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Responsable</span>
                    <input
                      type="text"
                      value={task.assignee}
                      onChange={(e) => updateTask(task.id, { assignee: e.target.value })}
                      className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      completeTask(task.id);
                      onClose();
                    }}
                    className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Marcar como Completada
                  </button>
                </div>
              </div>
            )}

            {/* PURCHASE DETAILS */}
            {purchase && (() => {
              const currentMacro = purchase.macroState || getPurchaseEffectiveMacroState(purchase);
              const alerts = getPurchaseAlerts(purchase);
              const reception = purchase.receptionStatus || 'pendiente';
              const invoice = purchase.invoiceStatus || 'sin_factura';

              return (
                <div className="space-y-5">
                  {/* Header & Badges */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {purchase.category || 'Insumos de rehabilitación'}
                        </span>
                        <span className="text-xs font-mono text-slate-500 font-semibold">
                          {purchase.requestNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <PurchaseMacroBadge macroState={currentMacro} size="md" />
                        <PurchaseReceptionBadge status={reception} size="sm" />
                        <PurchaseInvoiceBadge status={invoice} invoiceNumber={purchase.invoiceNumber} size="sm" />
                      </div>
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                        {purchase.itemOrService || purchase.description}
                      </h2>
                      {purchase.supplier && (
                        <p className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          <span>Proveedor: <strong className="text-slate-800">{purchase.supplier}</strong></span>
                        </p>
                      )}
                    </div>

                    {/* Operational Alerts banner if any */}
                    {alerts.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200">
                        {alerts.map((al, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border flex items-start gap-2 text-xs ${
                              al.severity === 'critica'
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : al.severity === 'alta'
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-blue-50 border-blue-200 text-blue-800'
                            }`}
                          >
                            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="font-bold">{al.title}: </span>
                              <span>{al.description}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 1. SELECCIÓN DE MACROESTADO (3 PESTAÑAS / ESTADOS PRINCIPALES) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      1. Macroestado de la Compra (Etapa General)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Por hacer */}
                      <button
                        type="button"
                        onClick={() => {
                          updatePurchase(purchase.id, { 
                            macroState: 'por_hacer',
                            status: 'solicitado'
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          currentMacro === 'por_hacer'
                            ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-400/30 text-amber-950 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-amber-600" />
                            Por hacer
                          </span>
                          {currentMacro === 'por_hacer' && (
                            <span className="h-2 w-2 rounded-full bg-amber-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Planificada, presupuestada o solicitada sin inicio administrativo.
                        </p>
                      </button>

                      {/* En ejecución */}
                      <button
                        type="button"
                        onClick={() => {
                          updatePurchase(purchase.id, { 
                            macroState: 'en_ejecucion',
                            status: purchase.status === 'solicitado' ? 'en_compra' : purchase.status
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          currentMacro === 'en_ejecucion'
                            ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/30 text-blue-950 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <Truck className="h-4 w-4 text-blue-600" />
                            En ejecución
                          </span>
                          {currentMacro === 'en_ejecucion' && (
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          OC emitida, despacho, recepción o facturación en curso.
                        </p>
                      </button>

                      {/* Realizado */}
                      <button
                        type="button"
                        onClick={() => {
                          updatePurchase(purchase.id, { 
                            macroState: 'realizado',
                            status: 'cerrado',
                            receptionStatus: 'conforme',
                            invoiceStatus: purchase.invoiceStatus === 'sin_factura' ? 'pagada' : purchase.invoiceStatus
                          });
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          currentMacro === 'realizado'
                            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-400/30 text-emerald-950 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            Realizado
                          </span>
                          {currentMacro === 'realizado' && (
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Recepción conforme + proceso administrativo y pago cerrados.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* 2. MICROESTADOS: RECEPCIÓN CONFORME & FACTURACIÓN (DOS COLUMNAS OPERATIVAS) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 2.A CONTROL DE RECEPCIÓN CONFORME */}
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <PackageCheck className="h-4 w-4 text-emerald-600" />
                          Control de Recepción Conforme
                        </span>
                        <PurchaseReceptionBadge status={reception} size="sm" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                          Estado de Recepción Física *
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { value: 'pendiente', label: 'Pendiente', color: 'slate' },
                            { value: 'conforme', label: 'Recepción Conforme', color: 'emerald' },
                            { value: 'con_observaciones', label: 'Con Obs.', color: 'amber' },
                            { value: 'rechazada', label: 'Rechazada', color: 'rose' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                const newRec = opt.value as PurchaseReceptionStatus;
                                const updates: Partial<Purchase> = { 
                                  receptionStatus: newRec,
                                  receptionDate: newRec === 'conforme' && !purchase.receptionDate ? '2026-08-15' : purchase.receptionDate
                                };
                                if (newRec === 'conforme' && purchase.invoiceStatus === 'pagada') {
                                  updates.macroState = 'realizado';
                                  updates.status = 'cerrado';
                                } else if (newRec !== 'pendiente' && currentMacro === 'por_hacer') {
                                  updates.macroState = 'en_ejecucion';
                                }
                                updatePurchase(purchase.id, updates);
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                                reception === opt.value
                                  ? opt.color === 'emerald'
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : opt.color === 'rose'
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                    : opt.color === 'amber'
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                    : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Fecha de Recepción
                          </label>
                          <input
                            type="date"
                            value={purchase.receptionDate || ''}
                            onChange={(e) => updatePurchase(purchase.id, { receptionDate: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            N° Acta / Guía Despacho
                          </label>
                          <input
                            type="text"
                            placeholder="ej. ACTA-RC-2026-45"
                            value={purchase.receptionActDoc || ''}
                            onChange={(e) => updatePurchase(purchase.id, { receptionActDoc: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Responsable que Recepcionó
                        </label>
                        <input
                          type="text"
                          placeholder="ej. Klgo. Felipe Santander / Bodega Central"
                          value={purchase.receptionResponsible || ''}
                          onChange={(e) => updatePurchase(purchase.id, { receptionResponsible: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Observaciones de Recepción
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Detalles de inspección física, lote, estado de embalaje..."
                          value={purchase.receptionNotes || ''}
                          onChange={(e) => updatePurchase(purchase.id, { receptionNotes: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                        />
                      </div>
                    </div>

                    {/* 2.B CONTROL DE FACTURACIÓN Y PAGO */}
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Receipt className="h-4 w-4 text-sky-600" />
                          Control de Facturación y Pago
                        </span>
                        <PurchaseInvoiceBadge status={invoice} invoiceNumber={purchase.invoiceNumber} size="sm" />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                          Estado de Facturación *
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {[
                            { value: 'sin_factura', label: 'Sin Factura', color: 'slate' },
                            { value: 'recibida', label: 'Factura Recibida', color: 'sky' },
                            { value: 'en_revision', label: 'En Revisión', color: 'amber' },
                            { value: 'pagada', label: 'Pagada', color: 'emerald' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                const newInv = opt.value as PurchaseInvoiceStatus;
                                const updates: Partial<Purchase> = { 
                                  invoiceStatus: newInv,
                                  invoiceDate: (newInv === 'recibida' || newInv === 'en_revision') && !purchase.invoiceDate ? '2026-08-15' : purchase.invoiceDate,
                                  invoicePaymentDate: newInv === 'pagada' && !purchase.invoicePaymentDate ? '2026-08-15' : purchase.invoicePaymentDate
                                };
                                if (newInv === 'pagada' && purchase.receptionStatus === 'conforme') {
                                  updates.macroState = 'realizado';
                                  updates.status = 'cerrado';
                                } else if (newInv !== 'sin_factura' && currentMacro === 'por_hacer') {
                                  updates.macroState = 'en_ejecucion';
                                }
                                updatePurchase(purchase.id, updates);
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                                invoice === opt.value
                                  ? opt.color === 'emerald'
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : opt.color === 'sky'
                                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                                    : opt.color === 'amber'
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                    : 'bg-slate-700 text-white border-slate-700 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            N° Folio Factura (SII)
                          </label>
                          <input
                            type="text"
                            placeholder="ej. FAC-104928"
                            value={purchase.invoiceNumber || ''}
                            onChange={(e) => updatePurchase(purchase.id, { invoiceNumber: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Fecha de Factura
                          </label>
                          <input
                            type="date"
                            value={purchase.invoiceDate || ''}
                            onChange={(e) => updatePurchase(purchase.id, { invoiceDate: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Monto Facturado ($ CLP)
                          </label>
                          <input
                            type="number"
                            placeholder="ej. 3790000"
                            value={purchase.invoiceAmount || ''}
                            onChange={(e) => updatePurchase(purchase.id, { invoiceAmount: parseFloat(e.target.value) || undefined })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Fecha de Pago
                          </label>
                          <input
                            type="date"
                            value={purchase.invoicePaymentDate || ''}
                            onChange={(e) => updatePurchase(purchase.id, { invoicePaymentDate: e.target.value })}
                            className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Notas de Facturación / N° Transferencia
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Comprobante de egreso, visto bueno de finanzas o motivo de retención..."
                          value={purchase.invoiceNotes || ''}
                          onChange={(e) => updatePurchase(purchase.id, { invoiceNotes: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. DETALLES GENERALES Y ECONÓMICOS (IDÉNTICOS AL FLUJO DE CREACIÓN) */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      3. Datos de la Compra, Proveedor & Modalidad
                    </span>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Categoría de productos/servicios
                      </label>
                      <input
                        type="text"
                        value={purchase.category || ''}
                        onChange={(e) => updatePurchase(purchase.id, { category: e.target.value })}
                        placeholder="ej. Insumos de rehabilitación, Fármacos, Equipamiento menor..."
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Producto o Servicio Solicitado *
                      </label>
                      <input
                        type="text"
                        required
                        value={purchase.itemOrService || ''}
                        onChange={(e) => updatePurchase(purchase.id, { 
                          itemOrService: e.target.value,
                          description: `Adquisición de ${e.target.value}`
                        })}
                        placeholder="ej. Insumos de Curación Avanzada y Apósito Hidrocoloide"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Proveedor Elegido
                        </label>
                        <input
                          type="text"
                          value={purchase.supplier || ''}
                          onChange={(e) => updatePurchase(purchase.id, { supplier: e.target.value })}
                          placeholder="ej. Droguería Central S.A."
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Modalidad de Compra
                        </label>
                        <select
                          value={purchase.modalidadCompra || 'Convenio Marco'}
                          onChange={(e) => updatePurchase(purchase.id, { modalidadCompra: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="Convenio Marco">Convenio Marco</option>
                          <option value="Compra Ágil">Compra Ágil</option>
                          <option value="Licitación Pública">Licitación Pública (LP / LE / LQ)</option>
                          <option value="Licitación Privada">Licitación Privada</option>
                          <option value="Trato Directo">Trato Directo</option>
                          <option value="Fondo Fijo">Fondo Fijo</option>
                          <option value="Gran Compra">Gran Compra</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    {/* Valores y Precios con cálculo automático */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-white border border-slate-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Unidades *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={purchase.units || 1}
                          onChange={(e) => {
                            const u = parseFloat(e.target.value) || 1;
                            const withTax = purchase.unitPriceWithTax || 0;
                            const total = withTax > 0 ? withTax * u : (purchase.totalPriceWithTax || 0);
                            updatePurchase(purchase.id, { 
                              units: u, 
                              totalPriceWithTax: total,
                              estimatedAmount: total
                            });
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Precio unitario sin IVA
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={purchase.unitPriceWithoutTax || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const withTax = Math.round(val * 1.19);
                            const u = purchase.units || 1;
                            const total = withTax * u;
                            updatePurchase(purchase.id, {
                              unitPriceWithoutTax: val,
                              unitPriceWithTax: withTax,
                              totalPriceWithTax: total,
                              estimatedAmount: total
                            });
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                          placeholder="$ 0"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Precio unitario con IVA
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={purchase.unitPriceWithTax || ''}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const withoutTax = Math.round(val / 1.19);
                            const u = purchase.units || 1;
                            const total = val * u;
                            updatePurchase(purchase.id, {
                              unitPriceWithTax: val,
                              unitPriceWithoutTax: withoutTax,
                              totalPriceWithTax: total,
                              estimatedAmount: total
                            });
                          }}
                          className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 font-mono"
                          placeholder="$ 0"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                          Precio total con IVA
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={purchase.totalPriceWithTax || ''}
                          onChange={(e) => {
                            const total = parseFloat(e.target.value) || 0;
                            updatePurchase(purchase.id, {
                              totalPriceWithTax: total,
                              estimatedAmount: total
                            });
                          }}
                          className="w-full rounded-lg border border-indigo-300 bg-indigo-50/60 px-2.5 py-1.5 text-xs text-indigo-950 font-mono font-bold"
                          placeholder="$ 0"
                        />
                      </div>
                    </div>

                    {/* Orden de Compra y Fechas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Orden de Compra
                        </label>
                        <input
                          type="text"
                          value={purchase.purchaseOrderNumber || ''}
                          onChange={(e) => updatePurchase(purchase.id, { purchaseOrderNumber: e.target.value })}
                          placeholder="ej. 2356-45-CM26"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Fecha Envío Orden de Compra
                        </label>
                        <input
                          type="date"
                          value={purchase.orderSentDate || ''}
                          onChange={(e) => updatePurchase(purchase.id, { orderSentDate: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                        <span>{getPurchaseDateFieldLabel(purchase.modalidadCompra)}</span>
                        <span className="text-[11px] font-normal text-indigo-600 font-sans">
                          ({purchase.modalidadCompra || 'Convenio Marco'})
                        </span>
                      </label>
                      <input
                        type="date"
                        value={purchase.requiredDate || purchase.orderAcceptedDate || ''}
                        onChange={(e) => updatePurchase(purchase.id, { 
                          requiredDate: e.target.value,
                          orderAcceptedDate: (purchase.modalidadCompra || '').toLowerCase().includes('ágil') || (purchase.modalidadCompra || '').toLowerCase().includes('agil') ? e.target.value : purchase.orderAcceptedDate,
                          decreeSigningDate: (purchase.modalidadCompra || '').toLowerCase().includes('convenio') ? e.target.value : purchase.decreeSigningDate,
                          contractClosingDate: (purchase.modalidadCompra || '').toLowerCase().includes('licitación') ? e.target.value : purchase.contractClosingDate
                        })}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        {purchase.modalidadCompra === 'Compra Ágil' && 'Fecha en que el proveedor acepta la Orden de Compra en Mercado Público.'}
                        {purchase.modalidadCompra === 'Convenio Marco' && 'Fecha en que el decreto de adjudicación queda totalmente tramitado y firmado.'}
                        {(purchase.modalidadCompra || '').toLowerCase().includes('licitación') && 'Fecha de cierre y firma del contrato administrativo.'}
                        {!['Compra Ágil', 'Convenio Marco'].includes(purchase.modalidadCompra || '') && !(purchase.modalidadCompra || '').toLowerCase().includes('licitación') && 'Fecha clave de formalización o aceptación del proceso de compra.'}
                      </p>
                    </div>

                    {/* Cero Papel & Enlace */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Expediente Cero Papel
                        </label>
                        <input
                          type="text"
                          value={purchase.ceroPapelExpediente || ''}
                          onChange={(e) => updatePurchase(purchase.id, { ceroPapelExpediente: e.target.value })}
                          placeholder="ej. EXP-2026-004512"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Estado en Cero Papel
                        </label>
                        <input
                          type="text"
                          value={purchase.ceroPapelEstado || ''}
                          onChange={(e) => updatePurchase(purchase.id, { ceroPapelEstado: e.target.value })}
                          placeholder="ej. En Firma, Derivado a Adquisiciones, En Trámite..."
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Link de Referencia */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">
                          Link de Referencia
                        </label>
                        {purchase.referenceLink && purchase.referenceLink.trim().length > 0 && (
                          <a
                            href={normalizeUrl(purchase.referenceLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                          >
                            <ExternalLink className="h-3 w-3" /> Probar enlace
                          </a>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          value={purchase.referenceLink || ''}
                          onChange={(e) => updatePurchase(purchase.id, { referenceLink: e.target.value })}
                          placeholder="ej. www.mercadopublico.cl, google.cl, ficha técnica, o cualquier web"
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 pr-9 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {purchase.referenceLink && purchase.referenceLink.trim().length > 0 && (
                          <a
                            href={normalizeUrl(purchase.referenceLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Abrir página web"
                            className="absolute right-2 p-1 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Motivo de Traba / Bloqueo */}
                    <div className="p-3 bg-rose-50/80 border border-rose-200 rounded-xl space-y-1.5">
                      <label className="text-xs font-bold text-rose-800 flex items-center gap-1">
                        <ShieldAlert className="h-4 w-4 text-rose-600" />
                        Causa del Problema / Motivo de Traba o Bloqueo (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        value={purchase.problemReason || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updatePurchase(purchase.id, { 
                            problemReason: val,
                            status: val.trim() ? 'problema' : (currentMacro === 'realizado' ? 'cerrado' : 'en_compra')
                          });
                        }}
                        placeholder="Si la compra presenta demora o inconvenientes con el proveedor, descríbalo aquí..."
                        className="w-full rounded-lg border border-rose-300 bg-white p-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* MEETING DETAILS */}
            {meeting && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{meeting.title}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {meeting.dateTime} • {meeting.location}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-700 block">Objetivo:</span>
                    <p className="text-slate-600">{meeting.objective}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Participantes:</span>
                    <p className="text-slate-600">{meeting.participants.join(', ')}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block">Acuerdos:</span>
                    <p className="text-slate-600">{meeting.agreements || 'Sin acuerdos registrados.'}</p>
                  </div>
                </div>

                {/* Commitments list with direct "Convert to Task" */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Compromisos Acordados ({meeting.commitments.length})
                  </h4>
                  <div className="space-y-2">
                    {meeting.commitments.map((c) => (
                      <div key={c.id} className="p-3 border border-slate-200 rounded-xl space-y-1.5 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800">{c.description}</span>
                          <PriorityChip priority={c.priority} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Resp: {c.responsible} • Plazo: {c.deadline}</span>
                          {c.taskId ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Tarea vinculada
                            </span>
                          ) : (
                            <button
                              onClick={() => convertCommitmentToTask(meeting.id, c.id)}
                              className="px-2 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <ArrowRight className="h-3 w-3" /> Convertir a Tarea
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PENDING EMAIL DETAILS */}
            {email && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{email.subject}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Destinatario: {email.recipient} • Fecha recepción: {email.receivedDate}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <p className="text-slate-700 leading-relaxed">{email.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Estado de Respuesta</span>
                    <select
                      value={email.status}
                      onChange={(e) => updateEmail(email.id, { status: e.target.value as EmailStatus })}
                      className="w-full rounded border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_redaccion">En Redacción</option>
                      <option value="enviado">Enviado</option>
                      <option value="requiere_seguimiento">Requiere Seguimiento</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Plazo de Envío</span>
                    <input
                      type="date"
                      value={email.deadline}
                      onChange={(e) => updateEmail(email.id, { deadline: e.target.value })}
                      className="w-full rounded border border-slate-300 p-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* QUESTION DETAILS */}
            {question && (
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {question.category}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{question.question}</h2>
                  <p className="text-xs text-slate-500 mt-1">{question.context}</p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">
                    Respuesta / Aclaración del Servicio de Salud
                  </span>
                  <textarea
                    rows={4}
                    value={question.officialAnswer || ''}
                    onChange={(e) => updateQuestion(question.id, { officialAnswer: e.target.value })}
                    placeholder="Escriba la orientación oficial recibida por correo, reunión o memorando..."
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Estado de la Consulta</span>
                    <select
                      value={question.status}
                      onChange={(e) => updateQuestion(question.id, { status: e.target.value as QuestionStatus })}
                      className="w-full rounded border border-slate-300 bg-white p-2 text-xs font-semibold text-slate-800"
                    >
                      <option value="abierta">Abierta (Sin respuesta)</option>
                      <option value="enviada_a_ss">Enviada al SSMN</option>
                      <option value="respondida">Respondida Oficialmente</option>
                      <option value="archivada">Archivada</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Referente que Respondió</span>
                    <input
                      type="text"
                      value={question.answeredBy || ''}
                      onChange={(e) => updateQuestion(question.id, { answeredBy: e.target.value })}
                      placeholder="ej. Dra. Francisca Ruiz (SSMN)"
                      className="w-full rounded border border-slate-300 p-2 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* KNOWLEDGE DETAILS */}
            {know && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    {know.category}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{know.title}</h2>
                  <p className="text-xs text-slate-500">Por {know.author} • {know.createdAt}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-700">
                  {know.content}
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1">Consejos Prácticos y Buenas Prácticas</span>
                  <textarea
                    rows={3}
                    value={know.content}
                    onChange={(e) => updateKnowledge(know.id, { content: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* HR DETAILS */}
            {hr && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {hr.role}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{hr.personName || 'Cupo Vacante'}</h2>
                  <p className="text-xs text-slate-500">
                    Establecimiento: {hr.establishmentId} • Contrato: {hr.contractType}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Horas Semanales</span>
                    <input
                      type="number"
                      value={hr.weeklyHours}
                      onChange={(e) => updateHRRecord(hr.id, { weeklyHours: parseFloat(e.target.value) || 0 })}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Estado de Dotación</span>
                    <select
                      value={hr.status}
                      onChange={(e) => updateHRRecord(hr.id, { status: e.target.value as any })}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-800"
                    >
                      <option value="activo">Activo</option>
                      <option value="en_proceso_seleccion">En Selección</option>
                      <option value="licencia_medica">Licencia Médica</option>
                      <option value="vacante">Vacante</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block mb-1">Nombre del Profesional</span>
                    <input
                      type="text"
                      value={hr.personName || ''}
                      onChange={(e) => updateHRRecord(hr.id, { personName: e.target.value })}
                      placeholder="ej. Klga. Camila Sepúlveda"
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ELEAM DETAILS */}
            {eleam && (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    RUT: {eleam.patientRut}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-1">{eleam.patientName}</h2>
                  <p className="text-xs text-slate-500">
                    Edad: {eleam.patientAge} años • Cuidador: {eleam.caregiverContact}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                  <div>
                    <span className="text-slate-500 block mb-1">Estado de la Postulación</span>
                    <select
                      value={eleam.status}
                      onChange={(e) => updateEleamCase(eleam.id, { status: e.target.value as any })}
                      className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-800"
                    >
                      <option value="identificado">Identificado</option>
                      <option value="preparando_antecedentes">Preparando Antecedentes</option>
                      <option value="documentacion_incompleta">Documentación Incompleta</option>
                      <option value="postulado">Postulado a SENAMA</option>
                      <option value="en_evaluacion">En Evaluación Comité</option>
                      <option value="observado">Observado con Requerimientos</option>
                      <option value="aprobado">Aprobado / Cupo Asignado</option>
                      <option value="rechazado">Rechazado</option>
                      <option value="cerrado">Cerrado</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Próxima Acción Operativa</span>
                    <input
                      type="text"
                      value={eleam.nextAction}
                      onChange={(e) => updateEleamCase(eleam.id, { nextAction: e.target.value })}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Fecha Plazo</span>
                    <input
                      type="date"
                      value={eleam.deadline}
                      onChange={(e) => updateEleamCase(eleam.id, { deadline: e.target.value })}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ATTACHMENTS MANAGER FOR ANY ENTITY */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 text-indigo-600" />
                  Archivos y Documentos Adjuntos ({entityAttachments.length})
                </span>
              </div>

              {entityAttachments.length > 0 ? (
                <div className="space-y-1.5">
                  {entityAttachments.map((att) => (
                    <div key={att.id} className="p-2 border border-slate-200 rounded-lg flex items-center justify-between text-xs bg-slate-50">
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="font-medium text-slate-800 truncate max-w-[220px]">{att.name}</span>
                        <span className="text-[10px] text-slate-400">({(att.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteAttachment(att.id)}
                        className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                        title="Eliminar adjunto"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No hay documentos adjuntos aún.</p>
              )}

              {/* Add document form */}
              <form onSubmit={handleAddFile} className="flex gap-2">
                <input
                  type="text"
                  placeholder="ej. Orden_Compra_Firmada.pdf o Informe_Social.pdf"
                  value={newAttachmentName}
                  onChange={(e) => setNewAttachmentName(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors shrink-0"
                >
                  Adjuntar
                </button>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-400">
              Cambios sincronizados automáticamente
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
            >
              Listo / Cerrar
            </button>
          </div>
        </div>
    </div>
  );
};
