import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgramId, IndicatorCutData } from '../../types';
import { X, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';

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
  const { programs, addIndicator, currentUser, indicators } = useApp();

  const [selectedProgram, setSelectedProgram] = useState<ProgramId>(defaultProgramId || 'praps_cpu');
  const [componente, setComponente] = useState('');
  const [identificador, setIdentificador] = useState('Indicador 1');
  const [indicador, setIndicador] = useState('');
  const [corte, setCorte] = useState<'1° corte' | '2° corte' | '3° corte'>('1° corte');
  const [objetivoEspecifico, setObjetivoEspecifico] = useState('');
  
  // Numerador & Denominador
  const [numeradorDesc, setNumeradorDesc] = useState('');
  const [numeradorPorcentaje, setNumeradorPorcentaje] = useState('');
  const [numeradorTipo, setNumeradorTipo] = useState<'%' | 'cantidad'>('%');
  const [denominadorDesc, setDenominadorDesc] = useState('');
  const [denominadorPorcentaje, setDenominadorPorcentaje] = useState('');
  const [denominadorTipo, setDenominadorTipo] = useState<'%' | 'cantidad'>('%');
  
  // Peso relativo
  const [pesoRelativo, setPesoRelativo] = useState('');
  const [pesoRelativoDesc, setPesoRelativoDesc] = useState('');
  
  // Medios de verificación
  const [medioVerifNumerador, setMedioVerifNumerador] = useState('');
  const [medioVerifDenominador, setMedioVerifDenominador] = useState('');
  
  // Metas anuales y resultado
  const [metaAnualTexto, setMetaAnualTexto] = useState('');
  const [metaAnualPorcentaje, setMetaAnualPorcentaje] = useState('100');
  const [resultadoRespectoCorte, setResultadoRespectoCorte] = useState('0');
  const [resultadoRespectoCorteTipo, setResultadoRespectoCorteTipo] = useState<'%' | 'cantidad'>('%');
  
  // Fecha de corte
  const [fechaCorte, setFechaCorte] = useState('2026-08-31');

  // Real-time calculation of weighted indicator result
  const pesoNum = parseFloat(pesoRelativo) || 0;
  const corteNum = parseFloat(resultadoRespectoCorte) || 0;
  const resultadoPonderadoNum = pesoNum > 0 ? Number(((corteNum * pesoNum) / 100).toFixed(2)) : corteNum;

  useEffect(() => {
    if (defaultProgramId) {
      setSelectedProgram(defaultProgramId);
    }
  }, [defaultProgramId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicador.trim()) return;

    const numAnnual = parseFloat(metaAnualPorcentaje) || 100;
    const numCorte = parseFloat(resultadoRespectoCorte) || 0;
    const numPeso = parseFloat(pesoRelativo) || 0;
    const finalPonderado = numPeso > 0 ? Number(((numCorte * numPeso) / 100).toFixed(2)) : numCorte;

    const cutData: IndicatorCutData = {
      target: numAnnual,
      result: finalPonderado,
      date: fechaCorte,
      source: medioVerifNumerador || 'Registro Clínico / REM',
      notes: objetivoEspecifico || undefined,
    };

    addIndicator({
      programId: selectedProgram,
      code: identificador.trim() || 'Indicador 1',
      name: indicador,
      description: objetivoEspecifico || indicador,
      componente: componente.trim() || undefined,
      objetivoEspecifico: objetivoEspecifico.trim() || undefined,
      corteSeleccionado: corte,
      numeradorTipo: numeradorTipo,
      numeradorDescripcion: numeradorDesc.trim() || undefined,
      numeradorValor: numeradorPorcentaje ? parseFloat(numeradorPorcentaje) : undefined,
      denominadorTipo: denominadorTipo,
      denominadorDescripcion: denominadorDesc.trim() || undefined,
      denominadorValor: denominadorPorcentaje ? parseFloat(denominadorPorcentaje) : undefined,
      pesoRelativo: pesoRelativo ? parseFloat(pesoRelativo) : undefined,
      pesoRelativoDescripcion: pesoRelativoDesc.trim() || undefined,
      resultadoRespectoCorte: numCorte,
      resultadoRespectoCorteTipo: resultadoRespectoCorteTipo,
      resultadoPonderado: finalPonderado,
      medioVerificacionNumerador: medioVerifNumerador.trim() || undefined,
      medioVerificacionDenominador: medioVerifDenominador.trim() || undefined,
      metaCumplimientoAnualTexto: metaAnualTexto.trim() || undefined,
      metaCumplimientoAnualPorcentaje: numAnnual,
      periodicity: 'Mensual',
      annualTarget: numAnnual,
      periodTarget: numAnnual,
      currentResult: finalPonderado,
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
    setComponente('');
    setIndicador('');
    setCorte('1° corte');
    setObjetivoEspecifico('');
    setNumeradorDesc('');
    setNumeradorPorcentaje('');
    setNumeradorTipo('%');
    setDenominadorDesc('');
    setDenominadorPorcentaje('');
    setDenominadorTipo('%');
    setPesoRelativo('');
    setPesoRelativoDesc('');
    setMedioVerifNumerador('');
    setMedioVerifDenominador('');
    setMetaAnualTexto('');
    setMetaAnualPorcentaje('100');
    setResultadoRespectoCorte('0');
    setResultadoRespectoCorteTipo('%');
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
            <input
              type="text"
              placeholder="ej. Componente 1: Atención Integral y Cuidados Continuos"
              value={componente}
              onChange={(e) => setComponente(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Identificador & Nombre del Indicador */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
            <div className="sm:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Identificador *
              </label>
              <select
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-indigo-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
              >
                {Array.from({ length: 10 }, (_, i) => `Indicador ${i + 1}`).map((idOpt) => (
                  <option key={idOpt} value={idOpt}>
                    {idOpt}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-8">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Indicador *
              </label>
              <textarea
                rows={2}
                required
                placeholder="ej. Cobertura de Ingresos a Cuidados Paliativos No Oncológicos"
                value={indicador}
                onChange={(e) => setIndicador(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Corte Seleccionado & Fecha de Corte */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corte Seleccionado
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha de Corte *
              </label>
              <input
                type="date"
                required
                value={fechaCorte}
                onChange={(e) => setFechaCorte(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
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
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Numerador */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-start">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Numerador (Descripción)
              </label>
              <textarea
                rows={2}
                placeholder="ej. N° de pacientes ingresados con plan de cuidados activo"
                value={numeradorDesc}
                onChange={(e) => setNumeradorDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Numerador
                </label>
                <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setNumeradorTipo('%')}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                      numeradorTipo === '%'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Medir en Porcentaje (%)"
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setNumeradorTipo('cantidad')}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                      numeradorTipo === 'cantidad'
                        ? 'bg-indigo-600 text-white shadow-2xs'
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
                  placeholder={numeradorTipo === 'cantidad' ? 'ej. 150' : '0'}
                  value={numeradorPorcentaje}
                  onChange={(e) => setNumeradorPorcentaje(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-12 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-2.5 top-2.5 text-[11px] font-bold text-slate-500 select-none">
                  {numeradorTipo === 'cantidad' ? 'Cant.' : '%'}
                </span>
              </div>
            </div>
          </div>

          {/* Denominador */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-start">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Denominador (Descripción)
              </label>
              <textarea
                rows={2}
                placeholder="ej. Total de pacientes derivados o inscritos en programa"
                value={denominadorDesc}
                onChange={(e) => setDenominadorDesc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Denominador
                </label>
                <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setDenominadorTipo('%')}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                      denominadorTipo === '%'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Medir en Porcentaje (%)"
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDenominadorTipo('cantidad')}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                      denominadorTipo === 'cantidad'
                        ? 'bg-indigo-600 text-white shadow-2xs'
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
                  placeholder={denominadorTipo === 'cantidad' ? 'ej. 200' : '100'}
                  value={denominadorPorcentaje}
                  onChange={(e) => setDenominadorPorcentaje(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-12 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-2.5 top-2.5 text-[11px] font-bold text-slate-500 select-none">
                  {denominadorTipo === 'cantidad' ? 'Cant.' : '%'}
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
                placeholder="ej. 50"
                value={pesoRelativo}
                onChange={(e) => setPesoRelativo(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
            </div>
          </div>

          {/* Medios de verificación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medio de Verificación del Numerador
              </label>
              <textarea
                rows={2}
                placeholder="ej. REM A05 sección C / Rayen APS"
                value={medioVerifNumerador}
                onChange={(e) => setMedioVerifNumerador(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Metas en % y Resultado respecto a corte */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-stretch">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meta Cumplimiento Anual en % *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="90"
                  value={metaAnualPorcentaje}
                  onChange={(e) => setMetaAnualPorcentaje(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-7 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">%</span>
              </div>
            </div>

            {/* Resultado respecto a corte con selector % y Cant. */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Resultado respecto a corte *
                </label>
                <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setResultadoRespectoCorteTipo('%')}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                      resultadoRespectoCorteTipo === '%'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title="Medir en Porcentaje (%)"
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultadoRespectoCorteTipo('cantidad')}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all ${
                      resultadoRespectoCorteTipo === 'cantidad'
                        ? 'bg-indigo-600 text-white shadow-2xs'
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
                  required
                  placeholder={resultadoRespectoCorteTipo === 'cantidad' ? 'ej. 150' : '68.80'}
                  value={resultadoRespectoCorte}
                  onChange={(e) => setResultadoRespectoCorte(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 pr-12 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="absolute right-2.5 top-2.5 text-[11px] font-bold text-slate-500 select-none">
                  {resultadoRespectoCorteTipo === 'cantidad' ? 'Cant.' : '%'}
                </span>
              </div>
            </div>
          </div>

          {/* Resultado indicador según su peso relativo (Cálculo automático en tiempo real) */}
          <div className="p-3.5 rounded-2xl border-2 border-indigo-200 bg-indigo-50/40 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <label className="block">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-xs">
                  Resultado {identificador || 'Indicador 1'} (según su peso relativo)
                </span>
              </label>
              <span className="text-[11px] font-medium text-indigo-700">
                Ponderación automática en tiempo real
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                readOnly
                value={resultadoPonderadoNum}
                className="w-full rounded-xl border-2 border-indigo-500 bg-white px-3.5 py-2.5 pr-7 text-xs font-black text-indigo-700 shadow-xs focus:outline-none cursor-default"
              />
              <span className="absolute right-3 top-2.5 text-xs font-bold text-indigo-600">%</span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 bg-white/80 p-2 rounded-xl border border-indigo-100">
              <span>
                Fórmula: <strong>{corteNum}{resultadoRespectoCorteTipo === '%' ? '%' : ' cant.'}</strong> (corte) × <strong>{pesoNum}%</strong> (peso rel.) = <strong className="text-indigo-700 font-bold">{resultadoPonderadoNum}%</strong>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                Resultado para cumplimiento
              </span>
            </div>
          </div>

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
