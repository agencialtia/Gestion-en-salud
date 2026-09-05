import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Instagram, 
  Globe, 
  Lock, 
  Eye, 
  EyeOff, 
  Camera, 
  Check, 
  ShieldCheck, 
  UserCheck, 
  X,
  Sparkles
} from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COUNTRY_OPTIONS = [
  'Chile',
  'Argentina',
  'Perú',
  'Colombia',
  'México',
  'España',
  'Uruguay',
  'Ecuador',
  'Bolivia',
  'Paraguay',
  'Estados Unidos'
];

const PHONE_PREFIXES = [
  { code: 'CL +56', label: 'CL (+56)' },
  { code: 'AR +54', label: 'AR (+54)' },
  { code: 'PE +51', label: 'PE (+51)' },
  { code: 'CO +57', label: 'CO (+57)' },
  { code: 'MX +52', label: 'MX (+52)' },
  { code: 'ES +34', label: 'ES (+34)' },
  { code: 'US +1', label: 'US (+1)' }
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUser } = useApp();

  const [name, setName] = useState(currentUser.name || 'Klaus');
  const [email, setEmail] = useState(currentUser.email || 'klausbauer10x@gmail.com');
  const [phonePrefix, setPhonePrefix] = useState(currentUser.phonePrefix || 'CL +56');
  const [phone, setPhone] = useState(currentUser.phone || '1234567890');
  const [instagram, setInstagram] = useState(currentUser.instagram || 'tuusuario');
  const [country, setCountry] = useState(currentUser.country || 'Chile');
  const [avatar, setAvatar] = useState(currentUser.avatar || 'K');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentUser.photoUrl);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSaved, setIsSaved] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state with currentUser when opened
  useEffect(() => {
    if (isOpen) {
      setName(currentUser.name || 'Klaus');
      setEmail(currentUser.email || 'klausbauer10x@gmail.com');
      setPhonePrefix(currentUser.phonePrefix || 'CL +56');
      setPhone(currentUser.phone || '1234567890');
      setInstagram(currentUser.instagram || 'tuusuario');
      setCountry(currentUser.country || 'Chile');
      setAvatar(currentUser.avatar || 'K');
      setPhotoUrl(currentUser.photoUrl);
      setNewPassword('');
      setConfirmPassword('');
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsSaved(true);
    }
  }, [isOpen, currentUser]);

  // Track if modified
  useEffect(() => {
    const isDirty = 
      name !== (currentUser.name || 'Klaus') ||
      email !== (currentUser.email || 'klausbauer10x@gmail.com') ||
      phonePrefix !== (currentUser.phonePrefix || 'CL +56') ||
      phone !== (currentUser.phone || '1234567890') ||
      instagram !== (currentUser.instagram || 'tuusuario') ||
      country !== (currentUser.country || 'Chile') ||
      photoUrl !== currentUser.photoUrl ||
      newPassword.length > 0 ||
      confirmPassword.length > 0;

    setIsSaved(!isDirty);
  }, [name, email, phonePrefix, phone, instagram, country, photoUrl, newPassword, confirmPassword, currentUser]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('El archivo excede el tamaño máximo permitido de 8 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotoUrl(event.target.result as string);
        setIsSaved(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('El nombre no puede estar vacío.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword.length < 8) {
        setErrorMessage('La nueva contraseña debe tener al menos 8 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Las contraseñas ingresadas no coinciden.');
        return;
      }
    }

    // Determine initials/avatar
    let calculatedAvatar = avatar;
    if (name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        calculatedAvatar = (parts[0][0] + parts[1][0]).toUpperCase();
      } else {
        calculatedAvatar = parts[0][0]?.toUpperCase() || 'K';
      }
    }

    updateCurrentUser({
      name: name.trim(),
      email: email.trim(),
      phonePrefix,
      phone: phone.trim(),
      instagram: instagram.trim().replace(/^@/, ''),
      country,
      avatar: calculatedAvatar,
      photoUrl,
    });

    setIsSaved(true);
    setSuccessMessage('¡Perfil actualizado con éxito!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDiscard = () => {
    setName(currentUser.name || 'Klaus');
    setEmail(currentUser.email || 'klausbauer10x@gmail.com');
    setPhonePrefix(currentUser.phonePrefix || 'CL +56');
    setPhone(currentUser.phone || '1234567890');
    setInstagram(currentUser.instagram || 'tuusuario');
    setCountry(currentUser.country || 'Chile');
    setPhotoUrl(currentUser.photoUrl);
    setNewPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setIsSaved(true);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="modal-editar-perfil"
        className="w-full max-w-2xl sm:max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Top Header / Breadcrumb */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1.5">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                <span>VOLVER</span>
              </button>
              <span className="text-[11px] font-bold tracking-wider text-purple-600 dark:text-purple-400 uppercase">
                MI CUENTA
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Editar Perfil
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Gestiona tu información personal, contacto y seguridad.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Notifications / Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Avatar Profile Card */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="relative group shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="h-20 w-20 sm:h-22 sm:w-22 rounded-full object-cover shadow-md border-2 border-white dark:border-slate-800"
                />
              ) : (
                <div className="h-20 w-20 sm:h-22 sm:w-22 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-md">
                  {name ? name.trim()[0].toUpperCase() : 'K'}
                </div>
              )}

              {/* Camera Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer"
                title="Cambiar foto de perfil"
              >
                <Camera className="h-4 w-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {name || 'Klaus'}
              </h3>
              <p className="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400">
                {email || 'klausbauer10x@gmail.com'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                PNG, JPG o WEBP · máx 8 MB
              </p>
            </div>
          </div>

          {/* Section 1: Información Personal */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 shrink-0">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Información Personal
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Datos con los que te identificamos en la plataforma.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Nombre completo */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>Nombre completo</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Klaus"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="klausbauer10x@gmail.com"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Teléfono */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>Teléfono (opcional)</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="w-28 shrink-0 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-2 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    {PHONE_PREFIXES.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="1234567890"
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[10.5px] text-slate-400 dark:text-slate-500 leading-tight">
                  Ingresa solo el número sin el código del país
                </p>
              </div>

              {/* Usuario de Instagram */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Instagram className="h-3.5 w-3.5 text-slate-400" />
                  <span>Usuario de Instagram (opcional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-slate-400">
                    @
                  </span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))}
                    placeholder="tuusuario"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 pl-8 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-[10.5px] text-slate-400 dark:text-slate-500 leading-tight">
                  Solo el nombre de usuario, sin @ ni la URL completa
                </p>
              </div>
            </div>

            {/* País */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                <span>País</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Cambiar Contraseña */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Cambiar Contraseña
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Deja estos campos vacíos si no deseas cambiar tu contraseña
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Nueva contraseña */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 pl-9 pr-9 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar nueva contraseña */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirmar nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite tu nueva contraseña"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 pl-9 pr-9 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3 sticky bottom-0 z-10">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {isSaved ? (
              <>
                <Check className="h-4 w-4" />
                <span>Todo al día</span>
              </>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Cambios pendientes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer"
            >
              Descartar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-2 text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
