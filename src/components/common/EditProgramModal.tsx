import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { HealthProgram } from '../../types';
import {
  X,
  Pencil,
  HeartHandshake,
  Activity,
  Stethoscope,
  Users,
  Brain,
  Shield,
  Sparkles,
  Pill,
  Baby,
  Eye,
  Check,
} from 'lucide-react';

interface EditProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: HealthProgram;
}

const AVAILABLE_ICONS = [
  { name: 'HeartHandshake', label: 'Cuidados / Social', icon: HeartHandshake },
  { name: 'Activity', label: 'Rehabilitación / Actividad', icon: Activity },
  { name: 'Eye', label: 'Diagnóstico / Imágenes', icon: Eye },
  { name: 'Users', label: 'Adultos Mayores / Grupos', icon: Users },
  { name: 'Stethoscope', label: 'Salud Respiratoria / Médica', icon: Stethoscope },
  { name: 'Brain', label: 'Salud Mental / Neuro', icon: Brain },
  { name: 'Baby', label: 'Infancia / ChCC', icon: Baby },
  { name: 'Pill', label: 'Farmacia / Tratamiento', icon: Pill },
  { name: 'Shield', label: 'Prevención / Calidad', icon: Shield },
  { name: 'Sparkles', label: 'Innovación / Bienestar', icon: Sparkles },
];

const COLOR_PALETTE = [
  { hex: '#0284c7', label: 'Azul Celeste' },
  { hex: '#6366f1', label: 'Índigo' },
  { hex: '#059669', label: 'Esmeralda' },
  { hex: '#7c3aed', label: 'Púrpura' },
  { hex: '#db2777', label: 'Rosa' },
  { hex: '#d97706', label: 'Ámbar' },
  { hex: '#0d9488', label: 'Teal' },
  { hex: '#e11d48', label: 'Carmesí' },
];

export const EditProgramModal: React.FC<EditProgramModalProps> = ({
  isOpen,
  onClose,
  program,
}) => {
  const { updateProgram } = useApp();

  const [name, setName] = useState(program.name || '');
  const [shortName, setShortName] = useState(program.shortName || '');
  const [code, setCode] = useState(program.code || '');
  const [description, setDescription] = useState(program.description || '');
  const [referente, setReferente] = useState(program.referente || '');
  const [annualBudget, setAnnualBudget] = useState(
    program.annualBudget || program.presupuestoTotal ? String(program.annualBudget || program.presupuestoTotal) : ''
  );
  const [targetPopulation, setTargetPopulation] = useState(program.targetPopulation ? String(program.targetPopulation) : '');
  const [coverage, setCoverage] = useState(program.coverage !== undefined ? String(program.coverage) : '');
  const [status, setStatus] = useState<string>(program.status || 'activo');
  const [selectedColor, setSelectedColor] = useState(program.color || COLOR_PALETTE[0].hex);
  const [selectedIcon, setSelectedIcon] = useState(program.iconName || 'Activity');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(program.name || '');
      setShortName(program.shortName || '');
      setCode(program.code || '');
      setDescription(program.description || '');
      setReferente(program.referente || '');
      setAnnualBudget(
        program.annualBudget || program.presupuestoTotal ? String(program.annualBudget || program.presupuestoTotal) : ''
      );
      setTargetPopulation(program.targetPopulation ? String(program.targetPopulation) : '');
      setCoverage(program.coverage !== undefined ? String(program.coverage) : '');
      setStatus(program.status || 'activo');
      setSelectedColor(program.color || COLOR_PALETTE[0].hex);
      setSelectedIcon(program.iconName || 'Activity');
    }
  }, [isOpen, program]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim()) return;

    setIsSaving(true);
    const parsedBudget = parseFloat(annualBudget.replace(/[^0-9]/g, '')) || 0;
    const parsedCoverage = parseFloat(coverage) || 0;

    updateProgram(program.id, {
      name: name.trim(),
      shortName: shortName.trim(),
      code: code.trim(),
      description: description.trim(),
      referente: referente.trim(),
      annualBudget: parsedBudget,
      presupuestoTotal: parsedBudget,
      targetPopulation: targetPopulation.trim() || '0',
      coverage: parsedCoverage,
      status: status as any,
      color: selectedColor,
      iconName: selectedIcon,
    });

    setIsSaving(false);
    onClose();
  };

  return (
    <div
      id="modal-edit-program-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="modal-edit-program-card"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: selectedColor }}
            >
              <Pencil className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Editar Ficha del Programa
              </h2>
              <p className="text-xs text-slate-500">
                Modifique los datos maestros del programa y sincronice inmediatamente con Supabase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-left max-h-[75vh] overflow-y-auto">
          {/* Nombre y Sigla */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nombre Oficial del Programa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. PRAPS Cuidados Paliativos Universales"
                required
                className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none ring-2 ring-indigo-500/10 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Sigla / Nombre Corto <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="Ej. CPU"
                required
                className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none ring-2 ring-indigo-500/10 transition-all font-semibold uppercase"
              />
            </div>
          </div>

          {/* Código, Referente y Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Código del Convenio
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej. CPU"
                className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none ring-2 ring-indigo-500/10 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Referente Técnico Comunal
              </label>
              <input
                type="text"
                value={referente}
                onChange={(e) => setReferente(e.target.value)}
                placeholder="Ej. Klaus Bauer"
                className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none ring-2 ring-indigo-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Estado Operativo
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none ring-2 ring-indigo-500/10 transition-all font-medium"
              >
                <option value="activo">Activo (En Ejecución)</option>
                <option value="alerta">Alerta Presupuestaria</option>
                <option value="critico">Crítico / Desvío</option>
                <option value="cerrado">Cerrado / Concluido</option>
              </select>
            </div>
          </div>

          {/* Presupuesto, Población Objetivo y Cobertura */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Presupuesto Total Anual ($ CLP)
              </label>
              <input
                type="text"
                value={annualBudget}
                onChange={(e) => setAnnualBudget(e.target.value)}
                placeholder="Ej. 68500000"
                className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none ring-2 ring-indigo-500/10 transition-all font-mono font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Población Objetivo / Usuarios
              </label>
              <input
                type="text"
                value={targetPopulation}
                onChange={(e) => setTargetPopulation(e.target.value)}
                placeholder="Ej. 1200"
                className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none ring-2 ring-indigo-500/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Cobertura Alcanzada (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={coverage}
                onChange={(e) => setCoverage(e.target.value)}
                placeholder="Ej. 88"
                className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none ring-2 ring-indigo-500/10 transition-all font-mono"
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Descripción General del Programa
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa el objetivo principal, alcance y red asistencial del programa..."
              className="w-full text-xs text-slate-900 bg-white border border-slate-300 rounded-xl p-3 focus:border-indigo-500 focus:outline-none ring-2 ring-indigo-500/10 transition-all resize-y"
            />
          </div>

          {/* Color e Icono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Color Distintivo
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    className={`w-7 h-7 rounded-lg transition-transform flex items-center justify-center cursor-pointer ${
                      selectedColor === c.hex ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  >
                    {selectedColor === c.hex && <Check className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Ícono Representativo
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_ICONS.map((item) => {
                  const IconComp = item.icon;
                  const isSelected = selectedIcon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedIcon(item.name)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-bold'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                      title={item.label}
                    >
                      <IconComp className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{isSaving ? 'Guardando en Supabase...' : 'Guardar y Sincronizar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
