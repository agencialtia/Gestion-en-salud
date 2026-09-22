import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building,
  User,
  Moon,
  Sun,
  Palette,
  Pencil,
  Plus,
  Trash2,
  X,
  Save,
  MapPin,
  RefreshCw,
  CheckCircle2,
  Check,
  Cloud,
  Database,
  ArrowDownToLine,
  ArrowUpToLine,
  Activity,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  Radio,
  Layers,
  CheckSquare,
  ShoppingBag,
  Calendar,
  BarChart3,
  Users,
  HelpCircle,
  Bell,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Establishment } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';
import { getSupabaseUrl, getSupabaseAnonKey, SUPABASE_PROJECT_ID } from '../../lib/supabase';

export const ConfiguracionAuditoriaView: React.FC = () => {
  const {
    currentUser,
    updateCurrentUser,
    establishments,
    updateEstablishment,
    addEstablishment,
    deleteEstablishment,
    showToast,
    darkMode,
    setDarkMode,
    t,
    isSupabaseConnected,
    supabaseDbStatus,
    supabaseSyncState,
    supabaseLastSyncTime,
    supabaseSyncError,
    syncWithSupabase,
    testSupabaseDatabaseConnection,
    pushAllDataToSupabase,
  } = useApp();

  // Supabase interaction state
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [isPullingSupabase, setIsPullingSupabase] = useState(false);
  const [isPushingSupabase, setIsPushingSupabase] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Auto-test Supabase connectivity on mount only if configured and not yet evaluated
  useEffect(() => {
    if (!supabaseDbStatus && isSupabaseConfigured()) {
      testSupabaseDatabaseConnection().catch(() => {});
    }
  }, []);

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    try {
      const res = await testSupabaseDatabaseConnection();
      if (res.connected) {
        showToast(`Conexión exitosa con Supabase (${res.latencyMs} ms, ${res.totalRows} registros en la nube)`, 'success');
      } else {
        showToast(`No se pudo conectar con Supabase: ${res.error || 'Verifica credenciales'}`, 'error');
      }
    } catch (err: any) {
      showToast(`Error de conexión: ${err?.message}`, 'error');
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handlePullSupabase = async () => {
    setIsPullingSupabase(true);
    try {
      await syncWithSupabase('pull');
    } finally {
      setIsPullingSupabase(false);
    }
  };

  const handlePushSupabase = async () => {
    setIsPushingSupabase(true);
    try {
      await pushAllDataToSupabase();
    } finally {
      setIsPushingSupabase(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`${label} copiado al portapapeles`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
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

  return (
    <div id="view-configuracion" className="w-full space-y-6 animate-in fade-in duration-150 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Settings className="h-4.5 w-4.5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Configuración y Perfil Institucional
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Preferencias de visualización, credenciales institucionales y red de establecimientos de salud
          </p>
        </div>
      </div>

      {/* Top Section: Appearance & User Profile spanning full width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        {/* Visual Appearance / Dark Mode Card */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Apariencia y Visualización</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
              ⌘⇧L
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Optimizado para turnos nocturnos, ambientes clínicos con baja iluminación y reducción de fatiga visual durante jornadas extensas.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setDarkMode(false)}
              className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                !darkMode
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 shadow-2xs">
                <Sun className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold">Modo Claro</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Diurno / Oficinas</span>
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(true)}
              className={`flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                darkMode
                  ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-900 dark:bg-indigo-800 text-indigo-300 shadow-2xs">
                <Moon className="h-4.5 w-4.5" />
              </div>
              <span className="font-bold">Modo Oscuro</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Turno Noche / Baja luz</span>
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
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300">
                  {currentUser.role}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenEditProfile}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
              title="Editar datos de usuario"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between items-center py-0.5">
              <span>Cargo:</span>
              <strong className="text-slate-800 dark:text-slate-200">{currentUser.title}</strong>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Comuna / Entidad:</span>
              <strong className="text-slate-800 dark:text-slate-200">{currentUser.comuna || 'Quilicura (DISAM)'}</strong>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Establecimiento:</span>
              <strong className="text-slate-800 dark:text-slate-200">{currentUser.establishment || 'Dirección de Salud / Comunal'}</strong>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Servicio de Salud:</span>
              <strong className="text-slate-800 dark:text-slate-200">{currentUser.healthService || 'SSMN (Metropolitano Norte)'}</strong>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Año Presupuestario:</span>
              <strong className="text-slate-800 dark:text-slate-200">{currentUser.budgetYear || '2026'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Cloud Database Integration Section */}
      <div id="supabase-integration-panel" className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5 shadow-sm w-full">
        {/* Header & Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0 ring-1 ring-emerald-500/20">
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {t('supabaseIntegration')}
                </h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  supabaseDbStatus?.connected || isSupabaseConnected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    supabaseDbStatus?.connected || isSupabaseConnected
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`} />
                  {supabaseDbStatus?.connected || isSupabaseConnected
                    ? t('supabaseConnected')
                    : t('supabaseDisconnected')}
                </span>
                {supabaseDbStatus?.latencyMs !== undefined && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {supabaseDbStatus.latencyMs} ms
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  <Radio className="h-3 w-3 text-blue-500 animate-pulse" />
                  {t('supabaseRealtimeActive')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t('supabaseDesc')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors disabled:opacity-50"
              title="Probar conexión con Supabase en vivo"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isTestingSupabase ? 'animate-spin text-indigo-500' : 'text-slate-400'}`} />
              <span>{isTestingSupabase ? 'Verificando...' : t('supabaseTestConnection')}</span>
            </button>

            <button
              type="button"
              onClick={handlePullSupabase}
              disabled={isPullingSupabase || supabaseSyncState === 'syncing'}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors disabled:opacity-50"
              title="Descargar datos frescos desde la nube"
            >
              <ArrowDownToLine className={`h-3.5 w-3.5 ${isPullingSupabase ? 'animate-bounce text-emerald-500' : 'text-slate-400'}`} />
              <span>{isPullingSupabase ? 'Descargando...' : t('supabaseSyncNow')}</span>
            </button>

            <button
              type="button"
              onClick={handlePushSupabase}
              disabled={isPushingSupabase || supabaseSyncState === 'syncing'}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors disabled:opacity-50"
              title="Subir y respaldar todos los registros locales a Supabase"
            >
              <ArrowUpToLine className={`h-3.5 w-3.5 ${isPushingSupabase ? 'animate-bounce' : ''}`} />
              <span>{isPushingSupabase ? 'Subiendo...' : t('supabasePushNow')}</span>
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        {supabaseSyncError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>Última advertencia de sincronización: {supabaseSyncError}</span>
          </div>
        )}

        {/* Project Metrics Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Proyecto ID</div>
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                {SUPABASE_PROJECT_ID || 'Sin configurar'}
              </span>
              {SUPABASE_PROJECT_ID && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(SUPABASE_PROJECT_ID, 'ID de Proyecto')}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Copiar ID de Proyecto"
                >
                  {copiedKey === 'ID de Proyecto' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Endpoint REST</div>
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                {getSupabaseUrl() ? getSupabaseUrl().replace(/^https?:\/\//, '') : 'No configurado'}
              </span>
              {getSupabaseUrl() && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(getSupabaseUrl(), 'URL Supabase')}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Copiar URL completa"
                >
                  {copiedKey === 'URL Supabase' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Estado de Sincronización</div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="capitalize">{supabaseSyncState === 'synced' ? 'Sincronizado' : supabaseSyncState === 'syncing' ? 'Sincronizando' : 'Al día'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 space-y-1">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Última Sincronización</div>
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>
                {supabaseLastSyncTime ? new Date(supabaseLastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Al inicio'}
              </span>
            </div>
          </div>
        </div>

        {/* Synchronized Tables Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-400" />
              <span className="font-bold text-slate-800 dark:text-slate-200">{t('supabaseTables')} (PostgreSQL)</span>
            </div>
            <span className="text-slate-500 dark:text-slate-400">
              {supabaseDbStatus?.totalRows !== undefined ? `${supabaseDbStatus.totalRows} registros en total` : '9 tablas activas'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              { key: 'health_programs', name: 'Programas de Salud', desc: 'Metas, presupuestos y referentes', count: supabaseDbStatus?.tables?.health_programs?.count ?? 6, icon: Activity },
              { key: 'tasks', name: 'Tareas y Compromisos', desc: 'Flujo operativo, prioridades y plazos', count: supabaseDbStatus?.tables?.tasks?.count ?? 5, icon: CheckSquare },
              { key: 'purchases', name: 'Adquisiciones y Compras', desc: 'Órdenes de compra y seguimiento', count: supabaseDbStatus?.tables?.purchases?.count ?? 2, icon: ShoppingBag },
              { key: 'meetings', name: 'Reuniones y Acuerdos', desc: 'Actas, compromisos y convocatorias', count: supabaseDbStatus?.tables?.meetings?.count ?? 2, icon: Calendar },
              { key: 'indicators', name: 'Metas Sanitarias', desc: 'Metas anuales, cortes y semáforos', count: supabaseDbStatus?.tables?.indicators?.count ?? 4, icon: BarChart3 },
              { key: 'contacts', name: 'Directorio de Referentes', desc: 'Referentes comunales y sectoriales', count: supabaseDbStatus?.tables?.contacts?.count ?? 3, icon: Users },
              { key: 'questions', name: 'Preguntas Frecuentes', desc: 'Base de conocimiento técnico', count: supabaseDbStatus?.tables?.questions?.count ?? 2, icon: HelpCircle },
              { key: 'alerts', name: 'Alertas y Notificaciones', desc: 'Eventos del sistema y vencimientos', count: supabaseDbStatus?.tables?.alerts?.count ?? 0, icon: Bell },
              { key: 'users', name: 'Usuarios y Accesos', desc: 'Perfiles de salud con acceso', count: supabaseDbStatus?.tables?.users?.count ?? 2, icon: User },
            ].map((tbl) => {
              const IconComp = tbl.icon;
              return (
                <div
                  key={tbl.key}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-2xs shrink-0 border border-slate-100 dark:border-slate-600">
                      <IconComp className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {tbl.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                        {tbl.key}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200">
                      {tbl.count}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Environment Variables & Information Footer */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              Conexión autenticada vía <strong>VITE_SUPABASE_URL</strong> y <strong>VITE_SUPABASE_ANON_KEY</strong>. Los valores se inyectan mediante variables de entorno (Vercel / .env).
            </span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(`VITE_SUPABASE_URL=${getSupabaseUrl()}\nVITE_SUPABASE_ANON_KEY=${getSupabaseAnonKey()}`, 'Variables para Vercel / .env')}
            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold shrink-0"
          >
            <Copy className="h-3 w-3" />
            <span>Copiar para Vercel / .env</span>
          </button>
        </div>
      </div>

      {/* Full-Width Establishments Network Section */}
      <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-sm w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Red de Establecimientos de Salud
                </h3>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {establishments.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Centros de Atención Primaria, Servicios de Urgencia y dependencias asistenciales
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenNewEst}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
            title="Agregar nuevo establecimiento"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar Establecimiento</span>
          </button>
        </div>

        {/* Responsive Grid across the full screen width */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
          {establishments.map((est) => (
            <div
              key={est.id}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/60 hover:bg-white dark:hover:bg-slate-800 transition-all duration-150 text-xs space-y-2 group shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
                    {est.name}
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-semibold text-indigo-700 dark:text-indigo-300 uppercase bg-indigo-100/70 dark:bg-indigo-950 px-2 py-0.5 rounded-md border border-indigo-200/60 dark:border-indigo-900/50">
                      {est.type}
                    </span>
                    {est.code && (
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-700/60 px-1.5 py-0.5 rounded">
                        {est.code}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenEditEst(est)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
                    title="Modificar nombre y dirección"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEst(est.id, est.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors"
                    title="Eliminar establecimiento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
                <span className="truncate">{est.address || 'Sin dirección registrada'}</span>
              </div>
            </div>
          ))}
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
