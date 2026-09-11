import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HealthProgram, ProgramId } from '../../types';
import { Check, Plus, X, Globe, Building2 } from 'lucide-react';
import { ProgramBadge } from './UIComponents';

interface ProgramMultiSelectProps {
  selectedProgramIds: (ProgramId | string)[];
  onChange: (programIds: (ProgramId | string)[]) => void;
  allowAllOption?: boolean;
}

export const ProgramMultiSelect: React.FC<ProgramMultiSelectProps> = ({
  selectedProgramIds,
  onChange,
  allowAllOption = true,
}) => {
  const { programs, addProgram } = useApp();
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [newProgName, setNewProgName] = useState('');
  const [newProgShortName, setNewProgShortName] = useState('');
  const [newProgCode, setNewProgCode] = useState('');

  const isAllSelected = selectedProgramIds.length === 0 || selectedProgramIds.includes('all');

  const handleToggleAll = () => {
    if (isAllSelected) {
      // Uncheck all -> select none
      onChange([]);
    } else {
      // Set to all
      onChange([]);
    }
  };

  const handleToggleProgram = (progId: string) => {
    let current = isAllSelected ? [] : [...selectedProgramIds];
    // Remove 'all' if present
    current = current.filter((id) => id !== 'all');

    if (current.includes(progId)) {
      current = current.filter((id) => id !== progId);
    } else {
      current.push(progId);
    }

    onChange(current);
  };

  const handleCreateNewProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgName.trim()) return;

    const baseId = (newProgCode || newProgShortName || newProgName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '_');
    const progId = `prog_${baseId}_${Date.now().toString().slice(-4)}`;

    const newProg: HealthProgram = {
      id: progId,
      name: newProgName.trim(),
      shortName: newProgShortName.trim() || newProgName.trim(),
      code: newProgCode.trim().toUpperCase() || 'PRG',
      color: '#6366F1',
      description: 'Programa incorporado por el usuario',
      referente: 'Equipo Gestor',
      iconName: 'Activity',
      annualBudget: 0,
    };

    addProgram(newProg);
    // Auto select newly created program
    handleToggleProgram(newProg.id);

    // Reset form
    setNewProgName('');
    setNewProgShortName('');
    setNewProgCode('');
    setShowAddProgramModal(false);
  };

  return (
    <div className="space-y-2.5">
      {/* Transversal / Aplica a Todos Option */}
      {allowAllOption && (
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-colors">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleToggleAll}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Globe className="h-3.5 w-3.5 text-indigo-600" />
            <span>Transversal (Aplica a todos los programas de salud)</span>
          </label>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
            {isAllSelected ? 'Todos seleccionados' : 'Específico'}
          </span>
        </div>
      )}

      {/* Program Checkboxes Grid */}
      {!isAllSelected && (
        <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 max-h-48 overflow-y-auto">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Seleccionar programas aplicables:</span>
            <span className="text-indigo-600 font-semibold">
              {selectedProgramIds.length} {selectedProgramIds.length === 1 ? 'seleccionado' : 'seleccionados'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {programs.map((p) => {
              const isChecked = selectedProgramIds.includes(p.id);
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                    isChecked
                      ? 'border-indigo-300 bg-indigo-50/60 font-semibold text-indigo-950 shadow-2xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleProgram(p.id)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: p.color || '#6366F1' }}
                  />
                  <span className="truncate">{p.shortName || p.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Button to Add Other Programs */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowAddProgramModal(!showAddProgramModal)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{showAddProgramModal ? 'Cancelar creación de programa' : '+ Agregar otro programa'}</span>
        </button>

        {isAllSelected && (
          <button
            type="button"
            onClick={() => onChange(programs.length > 0 ? [programs[0].id] : [])}
            className="text-[11px] text-slate-500 hover:text-indigo-600 underline cursor-pointer"
          >
            Limitar a programas específicos
          </button>
        )}
      </div>

      {/* Inline Add Program Form */}
      {showAddProgramModal && (
        <form
          onSubmit={handleCreateNewProgram}
          className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3 mt-2 animate-fadeIn text-xs"
        >
          <div className="font-bold text-indigo-950 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-indigo-600" />
              Crear e incorporar nuevo programa
            </span>
            <button
              type="button"
              onClick={() => setShowAddProgramModal(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nombre Completo del Programa *
              </label>
              <input
                type="text"
                required
                value={newProgName}
                onChange={(e) => setNewProgName(e.target.value)}
                placeholder="ej. Programa Salud Bucal Integral"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nombre Corto
              </label>
              <input
                type="text"
                value={newProgShortName}
                onChange={(e) => setNewProgShortName(e.target.value)}
                placeholder="ej. Bucal"
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddProgramModal(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!newProgName.trim()}
              className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              Guardar Programa
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
