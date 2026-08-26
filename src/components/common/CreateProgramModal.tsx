import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  FolderPlus,
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

interface CreateProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  { hex: '#6366f1', label: 'Índigo' },
  { hex: '#0284c7', label: 'Azul Celeste' },
  { hex: '#059669', label: 'Esmeralda' },
  { hex: '#7c3aed', label: 'Púrpura' },
  { hex: '#db2777', label: 'Rosa' },
  { hex: '#d97706', label: 'Ámbar' },
  { hex: '#0d9488', label: 'Teal' },
  { hex: '#e11d48', label: 'Carmesí' },
];

export const CreateProgramModal: React.FC<CreateProgramModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addProgram, setSelectedProgramId, setActiveView, currentUser } = useApp();

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [referente, setReferente] = useState(currentUser.name || '');
  const [annualBudget, setAnnualBudget] = useState('');
  const [targetPopulation, setTargetPopulation] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0].hex);
  const [selectedIcon, setSelectedIcon] = useState('Activity');
  
  // Subprogramas
  const [hasSubprograms, setHasSubprograms] = useState(false);
  const [subprogramsList, setSubprogramsList] = useState<string[]>(['']);

  if (!isOpen) return null;

  const handleAddSubprogramField = () => {
    setSubprogramsList((prev) => [...prev, '']);
  };

  const handleSubprogramChange = (index: number, val: string) => {
    setSubprogramsList((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveSubprogramField = (index: number) => {
    setSubprogramsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim()) return;

    const parsedBudget = parseFloat(annualBudget.replace(/[^0-9]/g, '')) || 0;
    const cleanSubprograms = hasSubprograms
      ? subprogramsList.map((s) => s.trim()).filter(Boolean)
      : undefined;

    const created = addProgram({
      name: name.trim(),
      shortName: shortName.trim(),
      code: code.trim() || `PRAPS-${shortName.toUpperCase().slice(0, 4)}`,
      description: description.trim() || `Programa de salud comunal ${shortName}.`,
      referente: referente.trim() || currentUser.name,
      annualBudget: parsedBudget,
      targetPopulation: targetPopulation.trim() || undefined,
      color: selectedColor,
      iconName: selectedIcon,
      hasSubprograms: hasSubprograms && Boolean(cleanSubprograms && cleanSubprograms.length > 0),
      subprograms: cleanSubprograms,
    });

    // Automatically navigate to the newly created program
    setSelectedProgramId(created.id);
    setActiveView('program_detail');
    onClose();
  };

  return (
    <div
      id="modal-create-program-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="modal-create-program-card"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: selectedColor }}
            >
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Crear Nuevo Programa de Salud 2026
              </h2>
              <p className="text-xs text-slate-500">
                Incorpore un nuevo programa de convenio PRAPS o municipal con todas sus capacidades
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Nombre y Nombre Corto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nombre Completo del Programa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Programa de Acompañamiento a la Infancia Integral"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Nombre Corto <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                placeholder="Ej: Infancia Integral"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
              />
            </div>
          </div>

          {/* Código, Referente y Presupuesto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Código Convenio / SIGFE
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ej: PRAPS-INF-2026"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-slate-900"
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
                placeholder="Nombre del profesional referente"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Presupuesto Anual 2026 ($)
              </label>
              <input
                type="text"
                value={annualBudget}
                onChange={(e) => {
                  const num = e.target.value.replace(/[^0-9]/g, '');
                  setAnnualBudget(num ? parseInt(num, 10).toLocaleString('es-CL') : '');
                }}
                placeholder="Ej: 45.000.000"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Población Objetivo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Población Objetivo / Cobertura Estimada
            </label>
            <input
              type="text"
              value={targetPopulation}
              onChange={(e) => setTargetPopulation(e.target.value)}
              placeholder="Ej: 1.500 niños y niñas inscritos validados en CESFAM comunales"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Descripción General y Objetivos Sanitarios
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa brevemente el propósito del programa, prestaciones clave y lineamientos técnicos..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 resize-none"
            />
          </div>

          {/* Color e Ícono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Paleta de Color */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Color de Identidad
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    title={c.label}
                    onClick={() => setSelectedColor(c.hex)}
                    className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                      selectedColor === c.hex
                        ? 'ring-2 ring-offset-2 ring-slate-900 scale-110'
                        : 'hover:scale-105 opacity-85'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selectedColor === c.hex && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Ícono */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Ícono Representativo
              </label>
              <div className="flex flex-wrap items-center gap-1.5">
                {AVAILABLE_ICONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedIcon === item.name;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      title={item.label}
                      onClick={() => setSelectedIcon(item.name)}
                      className={`p-2 rounded-xl border text-xs transition-all flex items-center justify-center ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Subprogramas Switch */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">¿Tiene Subprogramas / Componentes?</span>
                <p className="text-[11px] text-slate-500">Permite clasificar RRHH, compras y metas por subprograma</p>
              </div>
              <button
                type="button"
                onClick={() => setHasSubprograms(!hasSubprograms)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  hasSubprograms ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    hasSubprograms ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {hasSubprograms && (
              <div className="space-y-2 pl-2 border-l-2 border-indigo-200 bg-slate-50 p-3 rounded-xl">
                <span className="text-[11px] font-bold text-slate-700 block">Listado de Subprogramas:</span>
                {subprogramsList.map((sub, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={sub}
                      onChange={(e) => handleSubprogramChange(idx, e.target.value)}
                      placeholder={`Nombre del Subprograma ${idx + 1}`}
                      className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 text-slate-900"
                    />
                    {subprogramsList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubprogramField(idx)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddSubprogramField}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 pt-1 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Agregar otro subprograma
                </button>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Programa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
