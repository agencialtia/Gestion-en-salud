import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Mail,
  Lock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Building2,
  Hospital,
  Inbox,
  Check,
  X,
  Clock,
  Send,
  Globe,
  Moon,
  Sun,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuthScreenType } from '../../types';

export const AuthView: React.FC = () => {
  const {
    authScreen,
    setAuthScreen,
    login,
    loginWithGoogle,
    loginWithApple,
    registerUser,
    verifyAccountEmail,
    resendVerificationLink,
    sendPasswordResetLink,
    resetUserPassword,
    pendingVerificationEmail,
    setPendingVerificationEmail,
    pendingResetEmail,
    setPendingResetEmail,
    registeredAccounts,
    darkMode,
    toggleDarkMode,
  } = useApp();

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('klausbauer10x@gmail.com');
  const [loginPassword, setLoginPassword] = useState('salud2026');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'referente' | 'coordinador' | 'director' | 'administrativo'>('referente');
  const [regEstablishment, setRegEstablishment] = useState('Dirección de Salud / Comunal');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regTermsAccepted, setRegTermsAccepted] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Verification state
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Simulated Email Inbox Drawer / Modal
  const [showEmailInboxModal, setShowEmailInboxModal] = useState(false);

  // Cooldown timer for resending email
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Current pending account lookup
  const currentPendingAccount = registeredAccounts.find(
    (a) => a.email.toLowerCase() === (pendingVerificationEmail || regEmail).trim().toLowerCase()
  );

  const currentResetAccount = registeredAccounts.find(
    (a) => a.email.toLowerCase() === (pendingResetEmail || forgotEmail).trim().toLowerCase()
  );

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const regPwdStrength = getPasswordStrength(regPassword);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!loginIdentifier.trim()) {
      setLoginError('Por favor ingresa tu correo electrónico o nombre de usuario.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Por favor ingresa tu contraseña.');
      return;
    }

    setLoginLoading(true);
    try {
      const res = await login(loginIdentifier, loginPassword);
      if (!res.success) {
        setLoginError(res.error || 'Error al iniciar sesión.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleAuth = async () => {
    setLoginLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Apple Login
  const handleAppleAuth = async () => {
    setLoginLoading(true);
    try {
      await loginWithApple();
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Quick Demo Login
  const handleQuickDemoLogin = (email: string, pass: string) => {
    setLoginIdentifier(email);
    setLoginPassword(pass);
    login(email, pass);
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Por favor ingresa una dirección de correo electrónico válida.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('La contraseña debe contener al menos 6 caracteres.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Las contraseñas no coinciden. Verifícalas e inténtalo de nuevo.');
      return;
    }
    if (!regTermsAccepted) {
      setRegError('Debes aceptar los términos y condiciones del sistema para registrarte.');
      return;
    }

    setRegLoading(true);
    try {
      const res = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        establishment: regEstablishment,
        title: regRole === 'coordinador' ? 'Coordinador/a Técnico/a' : 'Referente de Programas de Salud',
      });

      if (!res.success) {
        setRegError(res.error || 'No se pudo crear la cuenta.');
      } else {
        // Clear password fields for security
        setRegPassword('');
        setRegConfirmPassword('');
      }
    } finally {
      setRegLoading(false);
    }
  };

  // Handle Email Verification Code Submit
  const handleVerifySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVerifyError(null);

    const emailToVerify = pendingVerificationEmail || regEmail;
    if (!emailToVerify) {
      setVerifyError('No se encontró el correo a verificar.');
      return;
    }

    setVerifyLoading(true);
    try {
      const res = await verifyAccountEmail(emailToVerify, verifyCodeInput.trim());
      if (!res.success) {
        setVerifyError(res.error || 'Código de confirmación incorrecto.');
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  // Handle Direct Link Verification (e.g. from simulated inbox)
  const handleDirectLinkVerify = async (email: string) => {
    setVerifyLoading(true);
    try {
      const res = await verifyAccountEmail(email);
      if (res.success) {
        setShowEmailInboxModal(false);
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  // Handle Resend Link
  const handleResendLink = async () => {
    const emailToVerify = pendingVerificationEmail || regEmail;
    if (!emailToVerify || resendCooldown > 0) return;

    setResendCooldown(45);
    await resendVerificationLink(emailToVerify);
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await sendPasswordResetLink(forgotEmail);
      if (!res.success) {
        setForgotError(res.error || 'No se pudo enviar el enlace de recuperación.');
      } else {
        setAuthScreen('reset_password');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (newPassword.length < 6) {
      setResetError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('Las contraseñas no coinciden.');
      return;
    }

    setResetLoading(true);
    try {
      const email = pendingResetEmail || forgotEmail;
      const res = await resetUserPassword(newPassword, email);
      if (!res.error) {
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setResetError(res.error);
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#f5f6fa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-x-hidden selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Header / Branding Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
            <Hospital className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">Gestión en Salud</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/60">
                Quilicura DISAM
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Plataforma Operativa de Programas de Salud</p>
          </div>
        </div>

        {/* Right side controls (Language, Dark mode) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer">
            <span>ES</span>
            <Globe className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <button
            type="button"
            onClick={toggleDarkMode}
            title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 transition shadow-sm"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[440px] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden transition-all">
          <AnimatePresence mode="wait">
            {/* ======================================================== */}
            {/* VIEW 1: INICIAR SESIÓN (LOGIN) */}
            {/* ======================================================== */}
            {authScreen === 'login' && (
              <motion.div
                key="login-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="p-7 sm:p-9"
              >
                <div className="text-center mb-6">
                  <h1 className="text-2xl sm:text-[28px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Iniciar Sesión
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    Accede al panel de gestión y seguimiento comunal de salud
                  </p>
                </div>

                {/* Social Login Buttons (Google & Apple) */}
                <div className="flex flex-col gap-2.5 mb-5">
                  <button
                    id="btn-login-google"
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={loginLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.4 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16C3.7 19.8 7.5 23 12 23z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>

                  <button
                    id="btn-login-apple"
                    type="button"
                    onClick={handleAppleAuth}
                    disabled={loginLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-black hover:bg-slate-900 text-sm font-semibold text-white transition shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/30"
                  >
                    <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-1 .04-2.14.65-2.82 1.45-.6.69-1.12 1.83-.98 2.91 1.12.09 2.16-.54 2.81-1.32z" />
                    </svg>
                    <span>Continuar con Apple</span>
                  </button>
                </div>

                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-900 px-3 text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-400">
                      O CON USUARIO Y CONTRASEÑA
                    </span>
                  </div>
                </div>

                {loginError && (
                  <div
                    className={`mb-4 p-3 rounded-xl border text-xs sm:text-sm ${
                      loginError.toLowerCase().includes('confirm')
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200'
                        : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          loginError.toLowerCase().includes('confirm') ? 'text-amber-600' : 'text-rose-600'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-semibold">
                          {loginError.toLowerCase().includes('confirm')
                            ? 'Tu cuenta aún no está confirmada'
                            : loginError}
                        </p>
                        {loginError.toLowerCase().includes('confirm') && (
                          <p className="text-xs mt-1 opacity-90">
                            Debes confirmar tu correo electrónico antes de iniciar sesión.
                          </p>
                        )}
                      </div>
                    </div>
                    {loginError.toLowerCase().includes('confirm') && (
                      <div className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-800/40 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const email = loginIdentifier.includes('@') ? loginIdentifier : pendingVerificationEmail || '';
                            if (email) {
                              resendVerificationLink(email);
                              setPendingVerificationEmail(email);
                            }
                            setAuthScreen('verify_email');
                          }}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reenviar correo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthScreen('verify_email')}
                          className="text-xs text-slate-600 dark:text-slate-400 hover:underline"
                        >
                          Ingresar PIN
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="login-email">
                      Usuario o Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="login-email"
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="nombre@ejemplo.com o tu_usuario"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="login-password">
                        Contraseña
                      </label>
                      <button
                        id="link-forgot-password"
                        type="button"
                        onClick={() => {
                          setForgotEmail(loginIdentifier.includes('@') ? loginIdentifier : '');
                          setAuthScreen('forgot_password');
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember session checkbox */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      id="remember-device"
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="remember-device" className="text-xs text-slate-600 dark:text-slate-400">
                      Recordar mi sesión en este dispositivo
                    </label>
                  </div>

                  <button
                    id="btn-submit-login"
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {loginLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Iniciar Sesión</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Bottom Navigation Switch to Register */}
                <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  ¿No tienes una cuenta?{' '}
                  <button
                    id="link-go-to-register"
                    type="button"
                    onClick={() => {
                      setRegError(null);
                      setAuthScreen('register');
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold hover:underline transition"
                  >
                    Regístrate gratis
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* VIEW 2: REGISTRO DE CUENTA (REGISTER) */}
            {/* ======================================================== */}
            {authScreen === 'register' && (
              <motion.div
                key="register-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="p-7 sm:p-9"
              >
                <div className="text-center mb-5">
                  <h1 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Crear Cuenta
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Regístrate para gestionar indicadores, tareas y convenios
                  </p>
                </div>

                {regError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-200 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                      <div className="flex-1">
                        <p className="font-medium">{regError}</p>
                        {regError.toLowerCase().includes('registrad') && (
                          <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800/40">
                            <button
                              type="button"
                              onClick={() => {
                                setLoginIdentifier(regEmail);
                                setLoginError(null);
                                setAuthScreen('login');
                              }}
                              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <span>Iniciar sesión con este correo</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Social Register with Google & Apple */}
                <div className="flex flex-col gap-2.5 mb-4">
                  <button
                    id="btn-register-google"
                    type="button"
                    onClick={handleGoogleAuth}
                    disabled={regLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 transition shadow-sm"
                  >
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.4 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16C3.7 19.8 7.5 23 12 23z"
                      />
                    </svg>
                    <span>Continuar con Google</span>
                  </button>

                  <button
                    id="btn-register-apple"
                    type="button"
                    onClick={handleAppleAuth}
                    disabled={regLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-black hover:bg-slate-900 text-sm font-semibold text-white transition shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current flex-shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-1 .04-2.14.65-2.82 1.45-.6.69-1.12 1.83-.98 2.91 1.12.09 2.16-.54 2.81-1.32z" />
                    </svg>
                    <span>Continuar con Apple</span>
                  </button>
                </div>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold tracking-wider text-slate-400">
                      O CON FORMULARIO
                    </span>
                  </div>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="reg-name">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-name"
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ej. Klaus Bauer"
                        required
                        className="w-full pl-10 pr-3 py-2 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="reg-email">
                      Correo Electrónico
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="nombre@ejemplo.com"
                        required
                        className="w-full pl-10 pr-3 py-2 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="reg-role">
                        Rol / Perfil
                      </label>
                      <select
                        id="reg-role"
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as any)}
                        className="w-full py-2 px-2.5 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:outline-none"
                      >
                        <option value="referente">Referente Técnico</option>
                        <option value="coordinador">Coordinador/a</option>
                        <option value="director">Directivo / DISAM</option>
                        <option value="administrativo">Administrativo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="reg-est">
                        Establecimiento
                      </label>
                      <select
                        id="reg-est"
                        value={regEstablishment}
                        onChange={(e) => setRegEstablishment(e.target.value)}
                        className="w-full py-2 px-2.5 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:outline-none"
                      >
                        <option value="Dirección de Salud / Comunal">DISAM / Comunal</option>
                        <option value="Cesfam MBH">Cesfam MBH</option>
                        <option value="Cesfam Salvador Allende">Cesfam S. Allende</option>
                        <option value="Cesfam Rodrigo Rojas">Cesfam R. Rojas</option>
                        <option value="Cesfam Picarte">Cesfam Picarte</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="reg-password">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        className="w-full pl-10 pr-10 py-2 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {regPassword && (
                      <div className="mt-1.5">
                        <div className="flex gap-1 h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              regPwdStrength <= 2
                                ? 'w-1/3 bg-rose-500'
                                : regPwdStrength <= 3
                                ? 'w-2/3 bg-amber-500'
                                : 'w-full bg-emerald-500'
                            }`}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                          {regPwdStrength <= 2 ? 'Contraseña débil' : regPwdStrength <= 3 ? 'Seguridad media' : 'Contraseña segura ✓'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="reg-confirm-password">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-confirm-password"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        required
                        className="w-full pl-10 pr-3 py-2 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-0.5">
                    <input
                      id="reg-terms"
                      type="checkbox"
                      checked={regTermsAccepted}
                      onChange={(e) => setRegTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="reg-terms" className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                      Acepto los términos de uso y la verificación de cuenta por correo electrónico.
                    </label>
                  </div>

                  <button
                    id="btn-submit-register"
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {regLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <span>Crear Cuenta Gratis</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
                  ¿Ya tienes una cuenta?{' '}
                  <button
                    id="link-go-to-login-from-register"
                    type="button"
                    onClick={() => {
                      setLoginError(null);
                      setAuthScreen('login');
                    }}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold hover:underline transition"
                  >
                    Inicia sesión
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* VIEW 3: CONFIRMACIÓN Y VERIFICACIÓN DE CORREO */}
            {/* ======================================================== */}
            {authScreen === 'verify_email' && (
              <motion.div
                key="verify-email-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="p-7 sm:p-9 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Mail className="w-6 h-6" />
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Confirma tu Correo
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  Hemos enviado un enlace de confirmación a:
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  <span>{pendingVerificationEmail || 'tu correo'}</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 max-w-xs mx-auto">
                  Haz clic en el enlace recibido o introduce tu código PIN de 6 dígitos:
                </p>

                {verifyError && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{verifyError}</span>
                  </div>
                )}

                {/* 6-Digit Code Input Form */}
                <form onSubmit={handleVerifySubmit} className="mt-4 space-y-3.5">
                  <div>
                    <input
                      id="input-verify-code"
                      type="text"
                      maxLength={6}
                      value={verifyCodeInput}
                      onChange={(e) => setVerifyCodeInput(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="123456"
                      className="w-44 mx-auto text-center tracking-[0.35em] font-mono text-2xl py-2 px-3 bg-[#f8fafc] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-blue-600 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      id="btn-confirm-code"
                      type="submit"
                      disabled={verifyLoading}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
                    >
                      {verifyLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Activar y Confirmar Cuenta</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Resend Link */}
                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>¿No recibiste el correo?</span>
                  <button
                    id="btn-resend-verification"
                    type="button"
                    onClick={handleResendLink}
                    disabled={resendCooldown > 0}
                    className={`font-bold transition ${
                      resendCooldown > 0
                        ? 'text-slate-400 cursor-not-allowed'
                        : 'text-blue-600 hover:underline'
                    }`}
                  >
                    {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar enlace'}
                  </button>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPendingVerificationEmail(null);
                      setAuthScreen('login');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a Iniciar Sesión</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* VIEW 4: RECUPERACIÓN DE CONTRASEÑA (FORGOT PASSWORD) */}
            {/* ======================================================== */}
            {authScreen === 'forgot_password' && (
              <motion.div
                key="forgot-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="p-7 sm:p-9"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-600 flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Recuperar Contraseña
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
                  Ingresa tu correo registrado y te enviaremos las instrucciones de restablecimiento.
                </p>

                {forgotError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                    <span>{forgotError}</span>
                  </div>
                )}

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="forgot-email">
                      Correo Electrónico Registrado
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="nombre@ejemplo.com"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-submit-forgot"
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {forgotLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Enlace de Recuperación</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                  <button
                    id="btn-back-to-login-from-forgot"
                    type="button"
                    onClick={() => {
                      setForgotError(null);
                      setAuthScreen('login');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a Iniciar Sesión</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* VIEW 5: RESTABLECER NUEVA CONTRASEÑA */}
            {/* ======================================================== */}
            {authScreen === 'reset_password' && (
              <motion.div
                key="reset-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                className="p-7 sm:p-9"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 text-blue-600 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6" />
                </div>

                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Nueva Contraseña
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
                  Establece una contraseña segura para tu cuenta{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-bold">{pendingResetEmail || forgotEmail}</span>.
                </p>

                {resetError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600" />
                    <span>{resetError}</span>
                  </div>
                )}

                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="new-password">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5" htmlFor="confirm-new-password">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="confirm-new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Repite tu nueva contraseña"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    id="btn-submit-reset-password"
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {resetLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Guardar Nueva Contraseña</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                  <button
                    type="button"
                    onClick={() => setAuthScreen('login')}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a Iniciar Sesión</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Trust & Security Badges (from reference screenshot) */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 pb-4 flex items-center justify-center gap-5 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Conexión Segura SSL</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
          <CheckCircle2 className="w-4 h-4 text-blue-500" />
          <span>Verificación de Correo</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/60 dark:border-slate-800/60">
        <span>© 2026 Dirección de Salud Municipal de Quilicura (DISAM) • Gestión en Salud</span>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Servicio de Salud Metropolitano Norte (SSMN)</span>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* SIMULATED EMAIL INBOX MODAL */}
      {/* Allows testing email confirmation link and password reset link */}
      {/* ======================================================== */}
      {showEmailInboxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Buzón de Correos</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Previsualiza los correos de confirmación y restablecimiento</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailInboxModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-[#f8fafc] dark:bg-slate-950">
              {/* Tab 1: Email Confirmation Template */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50">
                      Confirmación de Cuenta
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                      Confirma tu correo para activar tu cuenta en Gestión en Salud
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400">Hoy</span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
                  <p>
                    Hola{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {currentPendingAccount?.name || regName || 'Usuario'}
                    </strong>
                    ,
                  </p>
                  <p>
                    Gracias por registrarte. Para completar tu registro y asegurar tu cuenta, por favor confirma tu dirección de correo electrónico.
                  </p>

                  <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500 mb-2.5">Haz clic en el botón para activar tu cuenta inmediatamente:</p>
                    <button
                      id="btn-click-email-confirmation-link"
                      type="button"
                      onClick={() => handleDirectLinkVerify(pendingVerificationEmail || regEmail || 'klausbauer10x@gmail.com')}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition inline-flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar y Activar mi Cuenta</span>
                    </button>
                    {currentPendingAccount?.verificationCode && (
                      <p className="text-[11px] text-slate-500 mt-2.5">
                        O usa tu código PIN de 6 dígitos: <span className="font-mono text-blue-600 dark:text-blue-400 font-bold tracking-widest">{currentPendingAccount.verificationCode}</span>
                      </p>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Si no solicitaste este registro, puedes ignorar este mensaje de forma segura.
                  </p>
                </div>
              </div>

              {/* Tab 2: Password Reset Template */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
                      Restablecimiento de Contraseña
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                      Instrucciones para restablecer tu contraseña
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400">Hoy</span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
                  <p>
                    Hemos recibido una solicitud para restablecer la contraseña asociada a{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {currentResetAccount?.email || forgotEmail || 'tu correo'}
                    </strong>
                    .
                  </p>

                  <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center">
                    <button
                      id="btn-click-email-reset-link"
                      type="button"
                      onClick={() => {
                        setShowEmailInboxModal(false);
                        setAuthScreen('reset_password');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition inline-flex items-center gap-2"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Restablecer Mi Contraseña Ahora</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowEmailInboxModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-semibold text-slate-800 dark:text-white transition"
              >
                Cerrar Buzón
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
