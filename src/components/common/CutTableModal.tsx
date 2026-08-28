import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, RotateCcw, Plus, Trash2, Save, Info } from 'lucide-react';
import { ProgramCutConfig, ReliquidationTranche, DEFAULT_PROGRAM_CUT_CONFIGS } from '../../utils/reliquidationUtils';

interface CutTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  programId: string;
  config: ProgramCutConfig;
  onSaveConfig: (updatedConfig: ProgramCutConfig) => void;
}

export const CutTableModal: React.FC<CutTableModalProps> = ({
  isOpen,
  onClose,
  programName,
  programId,
  config,
  onSaveConfig,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<ProgramCutConfig>(() => JSON.parse(JSON.stringify(config)));

  const handleTrancheChange = (index: number, field: keyof ReliquidationTranche, value: any) => {
    setFormData((prev) => {
      const tranches = [...prev.tranches];
      tranches[index] = {
        ...tranches[index],
        [field]: value,
      };
      return { ...prev, tranches };
    });
  };

  const handleAddTranche = () => {
    setFormData((prev) => ({
      ...prev,
      tranches: [
        ...prev.tranches,
        {
          id: `t_custom_${Date.now()}`,
          minCompliance: 0,
          maxCompliance: 10,
          discountPercentage: 100,
          label: 'Personalizado',
          description: 'Descuento de cuota',
        },
      ],
    }));
  };

  const handleRemoveTranche = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tranches: prev.tranches.filter((_, i) => i !== index),
    }));
  };

  const handleResetToDefault = () => {
    const defaultConfig = DEFAULT_PROGRAM_CUT_CONFIGS[programId]?.[formData.cutKey] || DEFAULT_PROGRAM_CUT_CONFIGS.praps_cpu[formData.cutKey];
    setFormData(JSON.parse(JSON.stringify(defaultConfig)));
  };

  const handleSave = () => {
    onSaveConfig(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/15 border border-white/20">
              <ShieldAlert className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                Tabla de Cortes y Reliquidación SSMN
              </h3>
              <p className="text-xs text-indigo-100 font-medium">
                {programName} • {formData.cutName} ({formData.quotaEvaluated})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
            <Info className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Reglas de Reliquidación por Convenio:</span>
              <p className="mt-0.5 text-indigo-800 leading-relaxed">
                Cada programa de salud cuenta con porcentajes de corte y metas específicas establecidas en los convenios con el Servicio de Salud Metropolitano Norte (SSMN). Si se alcanza el cumplimiento mínimo sin descuento, no hay reliquidación. En caso contrario, se aplica el descuento porcentual correspondiente a la cuota evaluada.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cuota Evaluada
              </label>
              <input
                type="text"
                value={formData.quotaEvaluated}
                onChange={(e) => setFormData({ ...formData, quotaEvaluated: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                % Meta Mínima (Sin Reliquidación)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.targetCompliance}
                onChange={(e) => setFormData({ ...formData, targetCompliance: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Table of Tranches */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Tramos de Cumplimiento vs Descuento
              </span>
              <button
                type="button"
                onClick={handleAddTranche}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Agregar Tramo
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-2.5">Etiqueta Tramo</th>
                    <th className="p-2.5 text-center">% Mín.</th>
                    <th className="p-2.5 text-center">% Máx.</th>
                    <th className="p-2.5 text-center">% Descuento</th>
                    <th className="p-2.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {formData.tranches.map((t, idx) => (
                    <tr key={t.id || idx} className="hover:bg-slate-50/50">
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={t.label}
                          onChange={(e) => handleTrancheChange(idx, 'label', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-800"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          value={t.minCompliance}
                          onChange={(e) => handleTrancheChange(idx, 'minCompliance', Number(e.target.value))}
                          className="w-16 text-center rounded-lg border border-slate-200 px-1 py-1 text-xs font-mono font-semibold"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Sin límite"
                          value={t.maxCompliance === null || t.maxCompliance === undefined ? '' : t.maxCompliance}
                          onChange={(e) => {
                            const val = e.target.value === '' ? null : Number(e.target.value);
                            handleTrancheChange(idx, 'maxCompliance', val);
                          }}
                          className="w-16 text-center rounded-lg border border-slate-200 px-1 py-1 text-xs font-mono font-semibold"
                        />
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={t.discountPercentage}
                            onChange={(e) => handleTrancheChange(idx, 'discountPercentage', Number(e.target.value))}
                            className={`w-14 text-center rounded-lg border px-1 py-1 text-xs font-mono font-black ${
                              t.discountPercentage === 0
                                ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                                : 'border-rose-300 text-rose-700 bg-rose-50'
                            }`}
                          />
                          <span className="font-bold text-slate-500">%</span>
                        </div>
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveTranche(idx)}
                          disabled={formData.tranches.length <= 1}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Restablecer Valores SSMN
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
