import React, { useState } from 'react';
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
  Check,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Establishment } from '../../types';

const HEALTH_SERVICES_OPTIONS = [
  'Servicio de Salud Metropolitano Norte',
  'Servicio de Salud Metropolitano Central',
  'Servicio de Salud Metropolitano Occidente',
  'Servicio de Salud Metropolitano Oriente',
  'Servicio de Salud Metropolitano Sur',
  'Servicio de Salud Metropolitano Sur Oriente',
  'Servicio de Salud Valparaíso San Antonio',
  'Servicio de Salud Viña del Mar Quillota',
  'Servicio de Salud Concepción',
  'Otro Servicio de Salud',
];

const getNormalizedHealthService = (hs?: string) => {
  if (!hs) return 'Servicio de Salud Metropolitano Norte';
  if (hs === 'SSMN' || hs.includes('Metropolitano Norte')) return 'Servicio de Salud Metropolitano Norte';
  return hs;
};

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
  } = useApp();

  const currentYear = new Date().getFullYear();
  const budgetYearOptions = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ].map(String);

  // User Profile Edit Modal
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    title: currentUser.title,
    role: currentUser.role,
    comuna: currentUser.comuna || 'Quilicura (DISAM)',
    establishment: currentUser.establishment || 'Dirección de Salud / Comunal',
    healthService: getNormalizedHealthService(currentUser.healthService),
    budgetYear: currentUser.budgetYear ? String(currentUser.budgetYear) : String(currentYear),
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
      healthService: getNormalizedHealthService(currentUser.healthService),
      budgetYear: currentUser.budgetYear ? String(currentUser.budgetYear) : String(currentYear),
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
              <strong className="text-slate-800 dark:text-slate-200">{getNormalizedHealthService(currentUser.healthService)}</strong>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span>Año Presupuestario:</span>
              <strong className="text-slate-800 dark:text-slate-200">{currentUser.budgetYear || String(currentYear)}</strong>
            </div>
          </div>
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
                  <select
                    value={profileForm.healthService}
                    onChange={(e) => setProfileForm({ ...profileForm, healthService: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {HEALTH_SERVICES_OPTIONS.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                    {!HEALTH_SERVICES_OPTIONS.includes(profileForm.healthService) && profileForm.healthService && (
                      <option value={profileForm.healthService}>{profileForm.healthService}</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Año Presupuestario</label>
                  <select
                    value={profileForm.budgetYear}
                    onChange={(e) => setProfileForm({ ...profileForm, budgetYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {budgetYearOptions.map((yearStr) => (
                      <option key={yearStr} value={yearStr}>
                        {yearStr} {yearStr === String(currentYear) ? '(Año en curso)' : ''}
                      </option>
                    ))}
                    {!budgetYearOptions.includes(String(profileForm.budgetYear)) && profileForm.budgetYear && (
                      <option value={profileForm.budgetYear}>{profileForm.budgetYear}</option>
                    )}
                  </select>
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
