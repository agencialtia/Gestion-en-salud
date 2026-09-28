import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cloud,
  CloudOff,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Key,
  Database,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  X,
  FileJson,
  Upload,
  Info,
  Server,
} from 'lucide-react';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    supabaseUrl,
    supabaseAnonKey,
    supabaseProjectId,
    isSupabaseConnected,
    supabaseDbStatus,
    supabaseSyncState,
    supabaseLastSyncTime,
    supabaseSyncError,
    syncWithSupabase,
    testSupabaseDatabaseConnection,
    pushAllDataToSupabase,
    updateSupabaseCredentials,
    resetSupabaseCredentials,
    exportAllDataJSON,
    importAllDataJSON,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'status' | 'credentials' | 'backup' | 'vercel'>('status');

  // Credentials form state
  const [inputUrl, setInputUrl] = useState(supabaseUrl || '');
  const [inputKey, setInputKey] = useState(supabaseAnonKey || '');
  const [inputProjectId, setInputProjectId] = useState(supabaseProjectId || '');
  const [isSavingCreds, setIsSavingCreds] = useState(false);
  const [isPushingData, setIsPushingData] = useState(false);
  const [isPullingData, setIsPullingData] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  // Sync inputs when context changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setInputUrl(supabaseUrl || '');
      setInputKey(supabaseAnonKey || '');
      setInputProjectId(supabaseProjectId || '');
    }
  }, [isOpen, supabaseUrl, supabaseAnonKey, supabaseProjectId]);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(label);
    showToast(`Copiado al portapapeles: ${label}`, 'info');
    setTimeout(() => setCopiedVar(null), 2500);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      showToast('Ingresa una URL válida de Supabase', 'warning');
      return;
    }
    if (!inputKey.trim()) {
      showToast('Ingresa la clave anónima (anon key / publishable key)', 'warning');
      return;
    }

    setIsSavingCreds(true);
    try {
      const status = await updateSupabaseCredentials(
        inputUrl.trim(),
        inputKey.trim(),
        inputProjectId.trim()
      );
      if (status.connected) {
        showToast('¡Conexión establecida con éxito con Supabase!', 'success');
        setActiveTab('status');
      }
    } finally {
      setIsSavingCreds(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const status = await testSupabaseDatabaseConnection();
      if (status.connected) {
        showToast(`Conectado exitosamente (${status.latencyMs} ms)`, 'success');
      } else {
        showToast(`Fallo de conexión: ${status.error || 'Revisa credenciales'}`, 'error');
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handlePushAll = async () => {
    setIsPushingData(true);
    try {
      const res = await pushAllDataToSupabase();
      if (res.success) {
        showToast(`Datos sincronizados a Supabase: ${res.insertedCount} registros`, 'success');
      }
    } finally {
      setIsPushingData(false);
    }
  };

  const handlePullAll = async () => {
    setIsPullingData(true);
    try {
      await syncWithSupabase('pull');
      showToast('Datos frescos cargados desde Supabase', 'success');
    } finally {
      setIsPullingData(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        const res = importAllDataJSON(json);
        if (res.success) {
          onClose();
        }
      } catch (err: any) {
        showToast(`El archivo no tiene un formato JSON válido: ${err.message}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isSupabaseConnected
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
              }`}
            >
              {isSupabaseConnected ? <Cloud className="h-5 w-5" /> : <CloudOff className="h-5 w-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Conexión Cloud & Base de Datos
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  Supabase
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sincronización de indicadores, metas, programas y tareas entre AI Studio, Vercel y la nube.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 text-xs font-semibold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Database className="h-4 w-4" />
            Estado & Sincronización
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'credentials'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Key className="h-4 w-4" />
            Configurar Credenciales
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <FileJson className="h-4 w-4" />
            Respaldo JSON (Transferencia)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('vercel')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'vercel'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Server className="h-4 w-4" />
            Guía para Vercel
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* TAB 1: STATUS & ACTIONS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Connection Banner */}
              <div
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSupabaseConnected
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
                    : 'bg-amber-50 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    {isSupabaseConnected ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold">
                      {isSupabaseConnected
                        ? 'Base de Datos Conectada y Sincronizada'
                        : 'Base de Datos No Conectada (Modo Local Seguro)'}
                    </div>
                    <div className="text-xs mt-0.5 text-slate-600 dark:text-slate-300">
                      {isSupabaseConnected
                        ? `Latencia: ${supabaseDbStatus?.latencyMs || 0} ms • Tablas activas: ${
                            Object.keys(supabaseDbStatus?.tables || {}).length || 0
                          }`
                        : supabaseDbStatus?.error ||
                          supabaseSyncError ||
                          'La URL de Supabase no responde o el proyecto está pausado en el panel de Supabase.'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all self-start sm:self-auto shrink-0"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Comprobando...' : 'Probar Conexión'}
                </button>
              </div>

              {/* Cloud Details Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">URL Supabase:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[280px]">
                    {supabaseUrl || 'No configurada'}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">ID de Proyecto:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {supabaseProjectId || 'Desconocido'}
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-500">Última Sincronización:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {supabaseLastSyncTime
                      ? new Date(supabaseLastSyncTime).toLocaleTimeString('es-CL')
                      : 'Nunca en esta sesión'}
                  </span>
                </div>
              </div>

              {/* Explanation if disconnected */}
              {!isSupabaseConnected && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs space-y-2">
                  <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <Info className="h-4 w-4 text-blue-600 shrink-0" />
                    ¿Por qué no se guardan los datos en Supabase?
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-blue-950 dark:text-blue-300 leading-relaxed text-[11px]">
                    <li>
                      <strong>Proyecto pausado:</strong> En las cuentas gratuitas de Supabase, si no hay actividad en 7 días, Supabase pausa el proyecto y su dominio devuelve <code>ENOTFOUND</code>. Entra a{' '}
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold hover:text-blue-700 inline-flex items-center gap-0.5"
                      >
                        supabase.com/dashboard <ExternalLink className="h-3 w-3 inline" />
                      </a>{' '}
                      y pulsa <strong>Restore project</strong>.
                    </li>
                    <li>
                      <strong>URL o clave incorrecta:</strong> Ve a la pestaña <em>"Configurar Credenciales"</em> e introduce la URL y el anon key de tu proyecto activo.
                    </li>
                    <li>
                      <strong>Despliegue en Vercel:</strong> El archivo <code>.env</code> no se sube a Git. En Vercel debes definir las variables en <em>Project Settings &gt; Environment Variables</em> (ver pestaña <em>Guía para Vercel</em>).
                    </li>
                  </ul>
                </div>
              )}

              {/* Sync Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePushAll}
                  disabled={isPushingData}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100/70 transition-all text-center group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-1">
                    <UploadCloud className={`h-4 w-4 ${isPushingData ? 'animate-bounce' : ''}`} />
                    <span>Subir Todo a Supabase (Push)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Sube todos los indicadores, programas y tareas creados localmente hacia la nube.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePullAll}
                  disabled={isPullingData}
                  className="flex flex-col items-center justify-center p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100/70 transition-all text-center group cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-1">
                    <DownloadCloud className={`h-4 w-4 ${isPullingData ? 'animate-bounce' : ''}`} />
                    <span>Descargar desde Supabase (Pull)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Trae las últimas actualizaciones guardadas en Supabase a esta pantalla.
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS CONFIGURATION */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Puedes cambiar o actualizar las credenciales de Supabase en cualquier momento. Se guardarán en el almacenamiento seguro de tu navegador actual (tanto en AI Studio como en Vercel) y se reactivarán de inmediato sin necesidad de recompilar.
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Project URL:
                  </label>
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Copia de Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Supabase Anon / Publishable Key:
                  </label>
                  <input
                    type="text"
                    value={inputKey}
                    onChange={(e) => setInputKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... o sb_publishable_..."
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Copia de Supabase Dashboard &gt; Project Settings &gt; API &gt; anon / public key
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Project ID (Opcional):
                  </label>
                  <input
                    type="text"
                    value={inputProjectId}
                    onChange={(e) => setInputProjectId(e.target.value)}
                    placeholder="lpcwfyvlbytpgydpmirx"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={resetSupabaseCredentials}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer"
                >
                  Restablecer a valores de .env
                </button>

                <button
                  type="submit"
                  disabled={isSavingCreds}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
                >
                  {isSavingCreds ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Conectando...
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Guardar y Conectar
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BACKUP / INSTANT TRANSFER */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-white">
                  Transferencia Directa de Datos (Sin Depender de la Nube)
                </div>
                <p className="leading-relaxed text-[11px]">
                  Si modificaste datos en Google AI Studio y necesitas verlos en Vercel de inmediato, puedes descargar el respaldo JSON aquí y luego cargarlo en la versión desplegada en Vercel. Se restaurarán al 100% todos los programas, tareas, compras e indicadores.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={exportAllDataJSON}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-blue-200 bg-blue-50/60 dark:border-blue-800 dark:bg-blue-950/30 hover:bg-blue-100/70 transition-all text-center group cursor-pointer"
                >
                  <FileJson className="h-6 w-6 text-blue-600 dark:text-blue-400 mb-2" />
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    1. Descargar Respaldo JSON
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Exporta todos los datos actuales a un archivo .json en tu equipo.
                  </span>
                </button>

                <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/30 hover:bg-emerald-100/70 transition-all text-center group cursor-pointer">
                  <Upload className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    2. Importar Respaldo JSON
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Carga el archivo .json para restaurar los datos en esta aplicación.
                  </span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: VERCEL GUIDE */}
          {activeTab === 'vercel' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong>¿Por qué Vercel no ve tus datos?</strong>
                <p className="mt-1 text-[11px]">
                  El archivo local <code>.env</code> está ignorado en Git por seguridad para que tus credenciales no queden públicas. Por ende, Vercel compila la aplicación con las variables de Supabase vacías, a menos que las agregues en el panel de Vercel.
                </p>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-slate-800 dark:text-white">
                  Paso a paso para conectar Vercel con Supabase:
                </div>

                <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  <li>
                    Ingresa a{' '}
                    <a
                      href="https://vercel.com/dashboard"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-indigo-600 underline inline-flex items-center gap-0.5"
                    >
                      vercel.com/dashboard <ExternalLink className="h-3 w-3 inline" />
                    </a>{' '}
                    y haz clic en tu proyecto.
                  </li>
                  <li>
                    Ve a <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.
                  </li>
                  <li>Agrega las siguientes 3 variables de entorno (para Production y Preview):</li>
                </ol>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px]">
                    <div className="truncate pr-2">
                      <span className="text-cyan-400">VITE_SUPABASE_URL</span> ={' '}
                      <span className="text-slate-300">{supabaseUrl || 'https://tu-proyecto.supabase.co'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(supabaseUrl || '', 'VITE_SUPABASE_URL')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white shrink-0"
                    >
                      {copiedVar === 'VITE_SUPABASE_URL' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px]">
                    <div className="truncate pr-2">
                      <span className="text-cyan-400">VITE_SUPABASE_ANON_KEY</span> ={' '}
                      <span className="text-slate-300">
                        {supabaseAnonKey ? `${supabaseAnonKey.slice(0, 16)}...` : 'tu_anon_key'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(supabaseAnonKey || '', 'VITE_SUPABASE_ANON_KEY')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white shrink-0"
                    >
                      {copiedVar === 'VITE_SUPABASE_ANON_KEY' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px]">
                    <div className="truncate pr-2">
                      <span className="text-cyan-400">VITE_SUPABASE_PROJECT_ID</span> ={' '}
                      <span className="text-slate-300">{supabaseProjectId || 'tu_project_id'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(supabaseProjectId || '', 'VITE_SUPABASE_PROJECT_ID')}
                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white shrink-0"
                    >
                      {copiedVar === 'VITE_SUPABASE_PROJECT_ID' ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-[11px] text-indigo-900 dark:text-indigo-200">
                  <strong>Paso final:</strong> Tras guardar las variables en Vercel, ve a la pestaña <strong>Deployments</strong> en Vercel, pulsa en los tres puntos del último commit y selecciona <strong>Redeploy</strong>.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-5 py-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="text-[11px] text-slate-400">
            {isSupabaseConnected ? 'Conectado a la nube' : 'Modo local activo'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
