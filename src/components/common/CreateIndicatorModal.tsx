import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId, IndicatorCutData } from '../../types';
import { X, TrendingUp, Sparkles } from 'lucide-react';

interface CreateIndicatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProgramId?: ProgramId | null;
}

export const CreateIndicatorModal: React.FC<CreateIndicatorModalProps> = ({
  isOpen,
  onClose,
  defaultProgramId,
}) => {
  const { programs, addIndicator, currentUser } = useApp();

  const [selectedProgram, setSelectedProgram] = useState<ProgramId>(defaultProgramId || 'praps_cpu');
  const [codigoIndicador, setCodigoIndicador] = useState('Indicador 1');
  const [componente, setComponente] = useState('');
  const [indicador, setIndicador] = useState('');
  const [corte, setCorte] = useState<'1° corte' | '2° corte' | '3° corte'>('1° corte');
  const [objetivoEspecifico, setObjetivoEspecifico] = useState('');
  
  // Numerador & Denominador
  const [numeradorDesc, setNumeradorDesc] = useState('');
  const [numeradorPorcentaje, setNumeradorPorcentaje] = useState('');
  const [numeradorTipo, setNumeradorTipo] = useState<'porcentaje' | 'cantidad'>('porcentaje');
  const [denominadorDesc, setDenominadorDesc] = useState('');
  const [denominadorPorcentaje, setDenominadorPorcentaje] = useState('');
  const [denominadorTipo, setDenominadorTipo] = useState<'porcentaje' | 'cantidad'>('porcentaje');
  
  // Peso relativo
  const [pesoRelativo, setPesoRelativo] = useState('');
  
  // Medios de verificación
  const [medioVerifNumerador, setMedioVerifNumerador] = useState('');
  const [medioVerifDenominador, setMedioVerifDenominador] = useState('');
  
  // Metas anuales, corte y resultado
  const [metaAnualTexto, setMetaAnualTexto] = useState('');
  const [metaAnualCantidad, setMetaAnualCantidad] = useState('');
  const [metaAnualPorcentaje, setMetaAnualPorcentaje] = useState('100');
  const [metaCorteCantidad, setMetaCorteCantidad] = useState('');
  const [metaCortePorcentaje, setMetaCortePorcentaje] = useState('90');
  const [resultadoActualCantidad, setResultadoActualCantidad] = useState('');
  const [resultadoActualPorcentaje, setResultadoActualPorcentaje] = useState('0');
  
  // Fecha de corte
  const [fechaCorte, setFechaCorte] = useState('2026-08-31');

  useEffect(() => {
    if (defaultProgramId) {
      setSelectedProgram(defaultProgramId);
    }
  }, [defaultProgramId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicador.trim()) return;

    const numAnnualPorc = parseFloat(metaAnualPorcentaje) || 100;
    const numAnnualCant = metaAnualCantidad ? parseFloat(metaAnualCantidad) : undefined;
    const numCortePorc = parseFloat(metaCortePorcentaje) || numAnnualPorc;
    const numCorteCant = metaCorteCantidad ? parseFloat(metaCorteCantidad) : undefined;
    const numResultPorc = parseFloat(resultadoActualPorcentaje) || 0;
    const numResultCant = resultadoActualCantidad ? parseFloat(resultadoActualCantidad) : undefined;

    const cutData: IndicatorCutData = {
      target: numCortePorc,
      targetQuantity: numCorteCant,
      result: numResultPorc,
      resultQuantity: numResultCant,
      date: fechaCorte,
      source: medioVerifNumerador || 'Registro Clínico / REM',
      notes: objetivoEspecifico || undefined,
    };

    addIndicator({
      programId: selectedProgram,
      code: codigoIndicador,
      name: indicador,
      description: objetivoEspecifico || indicador,
      componente: componente.trim() || undefined,
      objetivoEspecifico: objetivoEspecifico.trim() || undefined,
      corteSeleccionado: corte,
      numeradorDescripcion: numeradorDesc.trim() || undefined,
      numeradorValor: numeradorPorcentaje ? parseFloat(numeradorPorcentaje) : undefined,
      numeradorTipo,
      denominadorDescripcion: denominadorDesc.trim() || undefined,
      denominadorValor: denominadorPorcentaje ? parseFloat(denominadorPorcentaje) : undefined,
      denominadorTipo,
      pesoRelativo: pesoRelativo ? parseFloat(pesoRelativo) : undefined,
      medioVerificacionNumerador: medioVerifNumerador.trim() || undefined,
      medioVerificacionDenominador: medioVerifDenominador.trim() || undefined,
      metaCumplimientoAnualTexto: metaAnualTexto.trim() || undefined,
      metaCumplimientoAnualPorcentaje: numAnnualPorc,
      periodicity: 'Mensual',
      annualTarget: numAnnualPorc,
      annualTargetQuantity: numAnnualCant,
      periodTarget: numCortePorc,
      periodTargetQuantity: numCorteCant,
      currentResult: numResultPorc,
      currentResultQuantity: numResultCant,
      unit: '%',
      direction: 'higher_is_better',
      cutoffDate: fechaCorte,
      responsible: currentUser.name,
      source: medioVerifNumerador || 'REM / DEIS',
      notes: metaAnualTexto || undefined,
      corte1: corte === '1° corte' ? cutData : undefined,
      corte2: corte === '2° corte' ? cutData : undefined,
      corte3: corte === '3° corte' ? cutData : undefined,
    });

    // Reset Form
    setCodigoIndicador('Indicador 1');
    setComponente('');
    setIndicador('');
    setCorte('1° corte');
    setObjetivoEspecifico('');
    setNumeradorDesc('');
    setNumeradorPorcentaje('');
    setNumeradorTipo('porcentaje');
    setDenominadorDesc('');
    setDenominadorPorcentaje('');
    setDenominadorTipo('porcentaje');
    setPesoRelativo('');
    setMedioVerifNumerador('');
    setMedioVerifDenominador('');
    setMetaAnualTexto('');
    setMetaAnualCantidad('');
    setMetaAnualPorcentaje('100');
    setMetaCorteCantidad('');
    setMetaCortePorcentaje('90');
    setResultadoActualCantidad('');
    setResultadoActualPorcentaje('0');
    setFechaCorte('2026-08-31');

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        id="create-indicator-modal"
        className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Crear Nuevo Indicador</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 hidden xs:block">Ficha Técnica Ministerial • Quilicura</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto flex-1">
          {/* Programa de Salud */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Programa de Salud *
            </label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value as ProgramId)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-xs"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Componente */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Componente
            </label>
            <textarea
              rows={2}
              placeholder="ej. Componente 1: Atención Integral y Cuidados Continuos"
              value={componente}
              onChange={(e) => setComponente(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Indicador, Nombre & Corte */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Indicador *
              </label>
              <select
                value={codigoIndicador}
                onChange={(e) => setCodigoIndicador(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={`Indicador ${num}`}>
                    Indicador {num}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Indicador *
              </label>
              <textarea
                rows={2}
                required
                placeholder="ej. Cobertura de Ingresos a Cuidados Paliativos No Oncológicos"
                value={indicador}
                onChange={(e) => setIndicador(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corte
              </label>
              <select
                value={corte}
                onChange={(e) => setCorte(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              placeholder="Describa el objetivo sanitario u operativo específico del indicador..."
              value={objetivoEspecifico}
              onChange={(e) => setObjetivoEspecifico(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Numerador + %/Cantidad */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numerador (Descripción)
              </label>
              <textarea
                rows={2}
                placeholder="ej. N° de pacientes ingresados con plan de cuidados activo"
                value={numeradorDesc}
                onChange={(e) => setNumeradorDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Numerador ({numeradorTipo === 'porcentaje' ? '%' : 'Cantidad'})
                </label>
                <div className="flex items-center bg-slate-200/80 rounded-lg p-0.5 border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setNumeradorTipo('porcentaje')}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                      numeradorTipo === 'porcentaje'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Medir en Porcentaje (%)"
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setNumeradorTipo('cantidad')}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                      numeradorTipo === 'cantidad'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Medir en Cantidad (N°)"
                  >
                    Cant.
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder={numeradorTipo === 'porcentaje' ? '0' : 'ej. 150'}
                  value={numeradorPorcentaje}
                  onChange={(e) => setNumeradorPorcentaje(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-8 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400">
                  {numeradorTipo === 'porcentaje' ? '%' : 'N°'}
                </span>
              </div>
            </div>
          </div>

          {/* Denominador + %/Cantidad */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Denominador (Descripción)
              </label>
              <textarea
                rows={2}
                placeholder="ej. Total de pacientes derivados o inscritos en programa"
                value={denominadorDesc}
                onChange={(e) => setDenominadorDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Denominador ({denominadorTipo === 'porcentaje' ? '%' : 'Cantidad'})
                </label>
                <div className="flex items-center bg-slate-200/80 rounded-lg p-0.5 border border-slate-300">
                  <button
                    type="button"
                    onClick={() => setDenominadorTipo('porcentaje')}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                      denominadorTipo === 'porcentaje'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Medir en Porcentaje (%)"
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDenominadorTipo('cantidad')}
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded transition-all ${
                      denominadorTipo === 'cantidad'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Medir en Cantidad (N°)"
                  >
                    Cant.
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  placeholder={denominadorTipo === 'porcentaje' ? '100' : 'ej. 200'}
                  value={denominadorPorcentaje}
                  onChange={(e) => setDenominadorPorcentaje(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-8 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-2.5 top-2.5 text-xs font-bold text-slate-400">
                  {denominadorTipo === 'porcentaje' ? '%' : 'N°'}
                </span>
              </div>
            </div>
          </div>

          {/* Peso Relativo en % */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Peso Relativo en %
            </label>
            <div className="relative max-w-xs">
              <input
                type="number"
                step="any"
                placeholder="ej. 25"
                value={pesoRelativo}
                onChange={(e) => setPesoRelativo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
            </div>
          </div>

          {/* Medios de verificación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medio de Verificación del Numerador
              </label>
              <textarea
                rows={2}
                placeholder="ej. REM A05 sección C / Rayen APS"
                value={medioVerifNumerador}
                onChange={(e) => setMedioVerifNumerador(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medio de Verificación del Denominador
              </label>
              <textarea
                rows={2}
                placeholder="ej. Población objetivo programada DISAM / DEIS"
                value={medioVerifDenominador}
                onChange={(e) => setMedioVerifDenominador(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>

          {/* Meta cumplimiento anual texto */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Meta Cumplimiento del Indicador Anual (Descripción)
            </label>
            <textarea
              rows={2}
              placeholder="ej. Lograr un 90% o más de cobertura en ingresos a CPU al 31 de diciembre"
              value={metaAnualTexto}
              onChange={(e) => setMetaAnualTexto(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Metas en Cantidad y % + Resultado Actual + Fecha de Corte */}
          <div className="space-y-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200">
            {/* Fila 1: Meta Anual y Meta para este Corte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Meta Anual */}
              <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <label className="block text-[11px] font-bold text-slate-700">
                  Meta Anual *
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="Cant."
                      value={metaAnualCantidad}
                      onChange={(e) => setMetaAnualCantidad(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 pr-6 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="absolute right-1.5 top-1.5 text-[10px] font-bold text-slate-400">N°</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="%"
                      value={metaAnualPorcentaje}
                      onChange={(e) => setMetaAnualPorcentaje(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 pr-5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="absolute right-1.5 top-1.5 text-[10px] font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Meta para este Corte */}
              <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <label className="block text-[11px] font-bold text-indigo-900 truncate" title={`Meta para este Corte (${corte})`}>
                  Meta para este Corte ({corte}) *
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="Cant."
                      value={metaCorteCantidad}
                      onChange={(e) => setMetaCorteCantidad(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 pr-6 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="absolute right-1.5 top-1.5 text-[10px] font-bold text-slate-400">N°</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="%"
                      value={metaCortePorcentaje}
                      onChange={(e) => setMetaCortePorcentaje(e.target.value)}
                      className="w-full rounded-lg border border-indigo-300 bg-white px-2 py-1.5 pr-5 text-xs font-bold text-indigo-700 focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="absolute right-1.5 top-1.5 text-[10px] font-bold text-indigo-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fila 2: Resultado Actual y Fecha del Corte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Resultado Actual */}
              <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <label className="block text-[11px] font-bold text-slate-700">
                  Resultado Actual *
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="Cant."
                      value={resultadoActualCantidad}
                      onChange={(e) => setResultadoActualCantidad(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 pr-6 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="absolute right-1.5 top-1.5 text-[10px] font-bold text-slate-400">N°</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="%"
                      value={resultadoActualPorcentaje}
                      onChange={(e) => setResultadoActualPorcentaje(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 pr-5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="absolute right-1.5 top-1.5 text-[10px] font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>

              {/* Fecha de Corte */}
              <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                <label className="block text-[11px] font-bold text-slate-700">
                  Fecha del Corte *
                </label>
                <input
                  type="date"
                  required
                  value={fechaCorte}
                  onChange={(e) => setFechaCorte(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Highlighted Result based on relative weight */}
          {(() => {
            const currentNum = parseFloat(resultadoActualPorcentaje) || 0;
            const pesoNum = parseFloat(pesoRelativo) || 0;
            const metaNum = parseFloat(metaAnualPorcentaje) || 100;
            const finalWeighted = ((currentNum * pesoNum) / 100).toFixed(2);
            const targetWeighted = ((metaNum * pesoNum) / 100).toFixed(2);
            const indicatorLabel = codigoIndicador || 'Indicador 1';
            
            return (
              <div className="rounded-2xl bg-indigo-600 p-4 sm:p-5 text-white shadow-lg border border-indigo-500 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-200 shrink-0" />
                      <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-white">
                        Resultado final {indicatorLabel} según peso relativo
                      </h3>
                    </div>
                    <p className="text-xs text-indigo-100">
                      Aporte efectivo ponderado al cumplimiento global del programa
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0 bg-indigo-700/60 sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl">
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {finalWeighted}%
                    </span>
                    <span className="block text-[11px] font-semibold text-indigo-200">
                      de {targetWeighted}% ponderado máx.
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-indigo-500/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] bg-indigo-700/80 px-2.5 py-1 rounded-lg text-indigo-100">
                    <span>Fórmula:</span>
                    <strong className="text-white">{currentNum}%</strong>
                    <span>(Resultado) ×</span>
                    <strong className="text-white">{pesoNum}%</strong>
                    <span>(Peso) / 100 =</span>
                    <strong className="text-emerald-300 font-bold">{finalWeighted}%</strong>
                  </div>
                  <span className="text-[11px] text-indigo-200">
                    {pesoNum > 0
                      ? `Ponderación asignada: ${pesoNum}%`
                      : 'Asigne un peso relativo (%) para ponderar'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Botones de Acción - Mobile First */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[40px] text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all min-h-[40px] text-center"
            >
              Guardar Indicador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
