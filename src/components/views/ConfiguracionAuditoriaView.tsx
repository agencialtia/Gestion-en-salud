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
  AlertTriangle,
  Moon,
  Sun,
  Palette,
  Laptop,
  Pencil,
  Plus,
  Trash2,
  X,
  Save,
  MapPin,
  Database,
  Activity,
  RefreshCw,
  Check
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDateTime } from '../../utils/dateUtils';
import { Establishment, User as UserType } from '../../types';

export const ConfiguracionAuditoriaView: React.FC = () => {
  const {
    currentUser,
    updateCurrentUser,
    establishments,
    updateEstablishment,
    addEstablishment,
    deleteEstablishment,
    auditLogs,
    resetAllDataToSeed,
    showToast,
    programs,
    tasks,
    indicators,
    financialPeriods,
    purchases,
    darkMode,
    setDarkMode,
    toggleDarkMode,
  } = useApp();

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Storage health testing
  const [checkingStorage, setCheckingStorage] = useState(false);
  const [storageStatus, setStorageStatus] = useState<{ operational: boolean; itemsCount: number }>({
    operational: true,
    itemsCount: typeof window !== 'undefined' ? window.localStorage.length : 0,
  });

  const handleTestStorage = () => {
    setCheckingStorage(true);
    try {
      const testKey = '__test_quilicura_storage__';
      localStorage.setItem(testKey, 'ok');
      localStorage.removeItem(testKey);
      setStorageStatus({ operational: true, itemsCount: localStorage.length });
      showToast('Persistencia local verificada y 100% operativa en el navegador.', 'success');
    } catch {
      setStorageStatus({ operational: false, itemsCount: 0 });
      showToast('Error al acceder al almacenamiento local del navegador.', 'error');
    } finally {
      setCheckingStorage(false);
    }
  };

  // User Profile Edit Modal
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    title: currentUser.title,
    role: currentUser.role,
    comuna: currentUser.comuna || 'Quilicura (DISAM)',
    establishment: currentUser.establishment || 'Dirección de Salud / Comunal',
    healthService: currentUser.healthService || 'SSMN (Metropolitano Norte)',
    budgetYear: currentUser.budgetYear || '2026',
  });

  // Establishment Edit Modal
  const [editingEst, setEditingEst] = useState<Establishment | null>(null);
  const [isNewEst, setIsNewEst] = useState(false);
  const [estToDelete, setEstToDelete] = useState<{ id: string; name: string } | null>(null);
  const [estForm, setEstForm] = useState<{
    name: string;
    code: string;
    type: Establishment['type'];
    address: string;
  }>({
    name: '',
    code: '',
    type: 'CESFAM',
    address: '',
  });

  const handleOpenEditProfile = () => {
    setProfileForm({
      name: currentUser.name,
      email: currentUser.email,
      title: currentUser.title,
      role: currentUser.role,
      comuna: currentUser.comuna || 'Quilicura (DISAM)',
      establishment: currentUser.establishment || 'Dirección de Salud / Comunal',
      healthService: currentUser.healthService || 'SSMN (Metropolitano Norte)',
      budgetYear: currentUser.budgetYear || '2026',
    });
    setEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showToast('El nombre del usuario no puede estar vacío', 'error');
      return;
    }
    updateCurrentUser({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      title: profileForm.title.trim(),
      role: profileForm.role,
      comuna: profileForm.comuna.trim(),
      establishment: profileForm.establishment.trim(),
      healthService: profileForm.healthService.trim(),
      budgetYear: profileForm.budgetYear.toString().trim(),
    });
    setEditingProfile(false);
  };

  const handleOpenNewEst = () => {
    setIsNewEst(true);
    setEditingEst(null);
    setEstForm({
      name: '',
      code: '',
      type: 'CESFAM',
      address: '',
    });
  };

  const handleOpenEditEst = (est: Establishment) => {
    setIsNewEst(false);
    setEditingEst(est);
    setEstForm({
      name: est.name,
      code: est.code,
      type: est.type,
      address: est.address || '',
    });
  };

  const handleSaveEst = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estForm.name.trim()) {
      showToast('El nombre del establecimiento es requerido', 'error');
      return;
    }
    if (isNewEst) {
      addEstablishment({
        name: estForm.name.trim(),
        code: estForm.code.trim() || estForm.name.trim().substring(0, 4).toUpperCase(),
        type: estForm.type,
        address: estForm.address.trim(),
      });
    } else if (editingEst) {
      updateEstablishment(editingEst.id, {
        name: estForm.name.trim(),
        code: estForm.code.trim() || editingEst.code,
        type: estForm.type,
        address: estForm.address.trim(),
      });
    }
    setEditingEst(null);
    setIsNewEst(false);
  };

  const handleDeleteEst = (id: string, name: string) => {
    setEstToDelete({ id, name });
  };

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
        {/* Left Column: User Profile, Appearance & Establishments */}
        <div className="space-y-6">
          {/* Local Storage & Persistence Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Almacenamiento Local y Persistencia</h3>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{storageStatus.operational ? 'Almacenamiento Activo' : 'Error Local'}</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Motor de Base de Datos:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                  Local Storage + React Context
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Modo de Operación:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                  100% Autónomo / Sin Dependencias Externas
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Servicio de Sesión:</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                  Gestor de Sesión Local Cifrado
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 dark:text-slate-400">Registros en Almacén:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                  {storageStatus.itemsCount} claves sincronizadas
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestStorage}
              disabled={checkingStorage}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${checkingStorage ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span>{checkingStorage ? 'Verificando...' : 'Comprobar Integridad de Almacenamiento'}</span>
            </button>
          </div>

          {/* Visual Appearance / Dark Mode Card */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Apariencia y Visualización</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                ⌘⇧L
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Optimizado para turnos nocturnos, ambientes clínicos con baja iluminación y reducción de fatiga visual durante jornadas extensas.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setDarkMode(false)}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  !darkMode
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 shadow-2xs">
                  <Sun className="h-4 w-4" />
                </div>
                <span>Modo Claro</span>
                <span className="text-[10px] text-slate-400 font-normal">Diurno / Oficinas</span>
              </button>

              <button
                type="button"
                onClick={() => setDarkMode(true)}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  darkMode
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900 text-indigo-300 shadow-2xs">
                  <Moon className="h-4 w-4" />
                </div>
                <span>Modo Oscuro</span>
                <span className="text-[10px] text-slate-400 font-normal">Turno Noche / Baja luz</span>
              </button>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm relative group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold text-base shadow-sm">
                  {currentUser.avatar || 'KB'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300">
                    {currentUser.role}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenEditProfile}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
                title="Editar datos de usuario"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Cargo:</span>
                <strong className="text-slate-800 dark:text-slate-200">{currentUser.title}</strong>
              </div>
              <div className="flex justify-between">
                <span>Comuna / Entidad:</span>
                <strong className="text-slate-800 dark:text-slate-200">{currentUser.comuna || 'Quilicura (DISAM)'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Establecimiento:</span>
                <strong className="text-slate-800 dark:text-slate-200">{currentUser.establishment || 'Dirección de Salud / Comunal'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Servicio de Salud:</span>
                <strong className="text-slate-800 dark:text-slate-200">{currentUser.healthService || 'SSMN (Metropolitano Norte)'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Año Presupuestario:</span>
                <strong className="text-slate-800 dark:text-slate-200">{currentUser.budgetYear || '2026'}</strong>
              </div>
            </div>
          </div>

          {/* Establishments in Quilicura */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Red de Establecimientos de Salud ({establishments.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={handleOpenNewEst}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                title="Agregar nuevo establecimiento"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Agregar</span>
              </button>
            </div>

            <div className="space-y-2">
              {establishments.map((est) => (
                <div key={est.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1 group/item">
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span className="truncate pr-2">{est.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded border border-indigo-100 dark:border-indigo-900/50">
                        {est.type}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditEst(est)}
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                        title="Modificar nombre y dirección"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEst(est.id, est.name)}
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors"
                        title="Eliminar establecimiento"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="truncate">{est.address || 'Sin dirección registrada'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Audit Logs Timeline */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
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
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{log.action}</span>
                      <span className="px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[10px] font-mono">
                        {log.entityType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">{log.details}</p>
                  </div>
                  <div className="text-right text-[10px] text-slate-400 shrink-0">
                    <p>{formatDateTime(log.timestamp)}</p>
                    <p className="font-semibold text-slate-600 dark:text-slate-300">{log.userName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between mt-4">
            <span>Todos los eventos y modificaciones quedan registrados en la auditoría del sistema.</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">100% Sincronizado</span>
          </div>
        </div>
      </div>

      {/* Modal: Editar Perfil de Usuario */}
      {editingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Editar Perfil de Usuario</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Actualiza tus datos y nombre de visualización</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProfile(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Ej: Klaus Bauer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="klaus.bauer@quilicurasalud.cl"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cargo / Título Institucional</label>
                <input
                  type="text"
                  value={profileForm.title}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  placeholder="Referente Comunal de Programas de Salud"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Comuna / Entidad *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.comuna}
                    onChange={(e) => setProfileForm({ ...profileForm, comuna: e.target.value })}
                    placeholder="Ej: Quilicura (DISAM)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Establecimiento de Base</label>
                  <select
                    value={profileForm.establishment}
                    onChange={(e) => setProfileForm({ ...profileForm, establishment: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Dirección de Salud / Comunal">Dirección de Salud / Comunal</option>
                    {establishments.map((est) => (
                      <option key={est.id} value={est.name}>
                        {est.name} ({est.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Servicio de Salud</label>
                  <input
                    type="text"
                    value={profileForm.healthService}
                    onChange={(e) => setProfileForm({ ...profileForm, healthService: e.target.value })}
                    placeholder="Ej: SSMN (Metropolitano Norte)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Año Presupuestario</label>
                  <input
                    type="text"
                    value={profileForm.budgetYear}
                    onChange={(e) => setProfileForm({ ...profileForm, budgetYear: e.target.value })}
                    placeholder="Ej: 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rol en Sistema</label>
                <select
                  value={profileForm.role}
                  onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="referente">referente</option>
                  <option value="administrador">administrador</option>
                  <option value="colaborador">colaborador</option>
                  <option value="lectura">lectura</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProfile(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar o Crear Establecimiento */}
      {(editingEst !== null || isNewEst) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {isNewEst ? 'Agregar Establecimiento' : 'Modificar Establecimiento'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Modifica el nombre y dirección del centro de salud</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingEst(null);
                  setIsNewEst(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEst} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre del Establecimiento *</label>
                <input
                  type="text"
                  required
                  value={estForm.name}
                  onChange={(e) => setEstForm({ ...estForm, name: e.target.value })}
                  placeholder="Ej: Cesfam MBH"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Dirección *</label>
                <input
                  type="text"
                  required
                  value={estForm.address}
                  onChange={(e) => setEstForm({ ...estForm, address: e.target.value })}
                  placeholder="Ej: Av. Las Torres 625, Quilicura"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Centro</label>
                  <select
                    value={estForm.type}
                    onChange={(e) => setEstForm({ ...estForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CESFAM">CESFAM</option>
                    <option value="CECOSF">CECOSF</option>
                    <option value="SAR">SAR</option>
                    <option value="SAPU">SAPU</option>
                    <option value="COSAM">COSAM</option>
                    <option value="DESAM">DESAM</option>
                    <option value="COMUNAL">COMUNAL</option>
                    <option value="DIRECCION">DIRECCIÓN</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Código / Sigla</label>
                  <input
                    type="text"
                    value={estForm.code}
                    onChange={(e) => setEstForm({ ...estForm, code: e.target.value.toUpperCase() })}
                    placeholder="Ej: MBH"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEst(null);
                    setIsNewEst(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  <Save className="h-4 w-4" />
                  <span>{isNewEst ? 'Agregar' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        title="¿Restablecer datos a estado inicial?"
        message="Esta acción reiniciará todas las tareas, compras, indicadores y acuerdos a la configuración inicial de Quilicura 2026. Los cambios no guardados en backup se perderán."
        confirmLabel="Sí, restablecer datos"
        cancelLabel="Cancelar"
        isDestructive={true}
        requireOkInput={true}
        onConfirm={handleExecuteReset}
        onCancel={() => setConfirmResetOpen(false)}
      />

      {/* Confirm Delete Establishment Dialog */}
      <ConfirmDialog
        isOpen={estToDelete !== null}
        title="¿Eliminar establecimiento de salud?"
        message={`¿Estás seguro de eliminar el establecimiento "${estToDelete?.name}" de la red comunal? Esta acción afectará la asignación de tareas, recursos y casos asociados.`}
        confirmLabel="Eliminar establecimiento"
        cancelLabel="Cancelar"
        isDestructive={true}
        requireOkInput={true}
        onConfirm={() => {
          if (estToDelete) {
            deleteEstablishment(estToDelete.id);
            setEstToDelete(null);
          }
        }}
        onCancel={() => setEstToDelete(null)}
      />
    </div>
  );
};
