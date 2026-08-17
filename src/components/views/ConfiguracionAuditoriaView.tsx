import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  History,
  Download,
  RotateCcw,
  Building,
  User,
  ShieldCheck,
  FileJson,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const ConfiguracionAuditoriaView: React.FC = () => {
  const {
    currentUser,
    establishments,
    auditLogs,
    resetAllDataToSeed,
    showToast,
    programs,
    tasks,
    indicators,
    financialPeriods,
    purchases,
  } = useApp();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const handleExportData = () => {
    const fullBackup = {
      exportDate: new Date().toISOString(),
      user: currentUser,
      programs,
      tasks,
      indicators,
      financialPeriods,
      purchases,
      auditLogs,
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quilicura_Salud_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de respaldo JSON exportada con éxito.', 'success');
  };

  const handleExecuteReset = () => {
    resetAllDataToSeed();
    setConfirmResetOpen(false);
  };

  return (
    <div id="view-configuracion" className="space-y-6 animate-in fade-in duration-150 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
              <Settings className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Configuración y Registro de Auditoría
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Trazabilidad de acciones, perfil institucional y administración de datos para Quilicura Salud
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Exportar Backup</span>
          </button>
          <button
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 active:scale-95 transition-all"
          >
            <RotateCcw className="h-4 w-4 text-rose-600" />
            <span>Restablecer Datos</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: User Profile & Establishments */}
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold text-base shadow-sm">
                KB
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{currentUser.name}</h3>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                  {currentUser.role}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span>Comuna:</span>
                <strong className="text-slate-800">Quilicura (DISAM)</strong>
              </div>
              <div className="flex justify-between">
                <span>Servicio de Salud:</span>
                <strong className="text-slate-800">SSMN (Metropolitano Norte)</strong>
              </div>
              <div className="flex justify-between">
                <span>Año Presupuestario:</span>
                <strong className="text-slate-800">2026</strong>
              </div>
            </div>
          </div>

          {/* Establishments in Quilicura */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Red de Establecimientos de Salud ({establishments.length})
              </h3>
            </div>

            <div className="space-y-2">
              {establishments.map((est) => (
                <div key={est.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-800">
                    <span>{est.name}</span>
                    <span className="text-[10px] font-mono text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.2 rounded">
                      {est.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{est.address}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Audit Logs Timeline */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Registro de Auditoría y Trazabilidad ({auditLogs.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Ordenado cronológicamente
              </span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900">{log.action}</span>
                      <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px] font-mono">
                        {log.entityType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{log.details}</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 shrink-0">
                    <p>{log.timestamp.replace('T', ' ').substring(0, 16)}</p>
                    <p className="font-semibold text-slate-600">{log.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between mt-4">
            <span>Todos los eventos y modificaciones quedan registrados en la auditoría del sistema.</span>
            <span className="font-mono text-emerald-600 font-bold">100% Sincronizado</span>
          </div>
        </div>
      </div>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        title="¿Restablecer datos a estado inicial?"
        message="Esta acción reiniciará todas las tareas, compras, indicadores y acuerdos a la configuración inicial de Quilicura 2026. Los cambios no guardados en backup se perderán."
        confirmLabel="Sí, restablecer datos"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleExecuteReset}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
};
