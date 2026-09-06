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
import { supabase } from '../../lib/supabase';

export const AuthView: React.FC = () => {
  const {
    authScreen,
    setAuthScreen,
    login,
    signInWithGoogle,
    loginWithGoogle,
    registerWithGoogle,
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
  const [loginIdentifier, setLoginIdentifier] = useState('kbauergrandon@gmail.com');
  const [loginPassword, setLoginPassword] = useState('salud2026');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState<'referente' | 'coordinador' | 'director' | 'administrativo'>('referente');
  const [regEstablishment, setRegEstablishment] = useState('Dirección de Salud / Comunal');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regTermsAccepted, setRegTermsAccepted] = useState(true);
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Verification state
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('kbauergrandon@gmail.com');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Simulated Email Inbox Drawer / Modal
  const [showEmailInboxModal, setShowEmailInboxModal] = useState(false);

  // Derived account helpers
  const currentPendingAccount = registeredAccounts.find(
    (a) => a.email.toLowerCase() === (pendingVerificationEmail || regEmail).toLowerCase()
  );
  const currentResetAccount = registeredAccounts.find(
    (a) => a.email.toLowerCase() === (pendingResetEmail || forgotEmail).toLowerCase()
  );

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Error al autenticar con Google:', error.message);
    }
  };

  // Password strength calculator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return Math.min(4, Math.max(1, score));
  };
  const regPwdStrength = getPasswordStrength(regPassword);

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    try {
      const res = await login(loginIdentifier.trim(), loginPassword);
      if (!res.success) {
        setLoginError(res.error || 'Credenciales inválidas.');
      }
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

    const fullName = [regFirstName.trim(), regLastName.trim()].filter(Boolean).join(' ') || regName.trim();

    if (!fullName) {
      setRegError('Por favor ingresa tu nombre y apellido.');
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

    setRegLoading(true);
    try {
      const res = await registerUser({
        name: fullName,
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

    const cleanEmail = forgotEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setForgotError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await sendPasswordResetLink(cleanEmail);
      if (!res.success) {
        setForgotError(res.error || 'No se pudo enviar el enlace de recuperación.');
      } else {
        setForgotSuccess(true);
        if (res.userPassword) {
          setRecoveredPassword(res.userPassword);
        }
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
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
            <Hospital className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight block">Gestión en Salud</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">Plataforma Operativa de Programas de Salud</p>
          </div>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-[32px] sm:rounded-[36px] shadow-2xl shadow-slate-200/60 dark:shadow-none overflow-hidden transition-all">
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
                  <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                    Acceso Seguro
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Ingresa tus credenciales para continuar
                  </p>
                </div>

                {/* Tabs switcher */}
                <div className="flex p-1.5 bg-[#f1f3f7] dark:bg-slate-800/90 rounded-2xl mb-6">
                  <button
                    id="tab-login"
                    type="button"
                    onClick={() => {
                      setLoginError(null);
                      setRegError(null);
                      setAuthScreen('login');
                    }}
                    className="flex-1 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm transition-all duration-200"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    id="tab-register"
                    type="button"
                    onClick={() => {
                      setLoginError(null);
                      setRegError(null);
                      setAuthScreen('register');
                    }}
                    className="flex-1 py-2 text-sm font-medium rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200"
                  >
                    Registrarse
                  </button>
                </div>

                {loginError && (
                  <div
                    className={`mb-4 p-3.5 rounded-2xl border text-xs sm:text-sm ${
                      loginError.toLowerCase().includes('confirm')
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-200'
                        : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <AlertCircle
                        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          loginError.toLowerCase().includes('confirm') ? 'text-amber-600' : 'text-rose-600'
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-semibold leading-snug">
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
                            }
                          }}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Reenviar correo de confirmación</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5" htmlFor="login-email">
                      <Mail className="w-4 h-4 text-slate-800 dark:text-slate-200" strokeWidth={2} />
                      <span>Email</span>
                    </label>
                    <input
                      id="login-email"
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="kbauergrandon@gmail.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-[#eff6ff]/70 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5" htmlFor="login-password">
                      <Lock className="w-4 h-4 text-slate-800 dark:text-slate-200" strokeWidth={2} />
                      <span>Contraseña</span>
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Tu contraseña"
                        required
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-700 dark:text-slate-300 hover:text-slate-900 transition"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      id="link-forgot-password"
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginIdentifier.includes('@') ? loginIdentifier : '');
                        setAuthScreen('forgot_password');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline transition"
                    >
                      <KeyRound className="w-3.5 h-3.5 rotate-45 text-blue-600 dark:text-blue-400" />
                      <span>¿Olvidaste tu contraseña?</span>
                    </button>
                  </div>

                  <button
                    id="btn-submit-login"
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition mt-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {loginLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto text-white" />
                    ) : (
                      'Iniciar Sesión'
                    )}
                  </button>
                </form>

                {/* Footer security branding */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-8">
                  <p className="text-[10px] tracking-widest text-slate-400 dark:text-slate-500 uppercase text-center font-medium">
                    ENCRIPTACIÓN SSL · GDPR · SOC2
                  </p>
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
                <div className="text-center mb-6">
                  <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white tracking-tight">
                    Acceso Seguro
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Ingresa tus credenciales para continuar
                  </p>
                </div>

                {/* Tabs switcher */}
                <div className="flex p-1.5 bg-[#f1f3f7] dark:bg-slate-800/90 rounded-2xl mb-6">
                  <button
                    id="tab-login-from-reg"
                    type="button"
                    onClick={() => {
                      setLoginError(null);
                      setRegError(null);
                      setAuthScreen('login');
                    }}
                    className="flex-1 py-2 text-sm font-medium rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    id="tab-register-from-reg"
                    type="button"
                    onClick={() => {
                      setLoginError(null);
                      setRegError(null);
                      setAuthScreen('register');
                    }}
                    className="flex-1 py-2 text-sm font-semibold rounded-xl bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm transition-all duration-200"
                  >
                    Registrarse
                  </button>
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

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  {/* Nombre & Apellido side-by-side */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5" htmlFor="reg-first-name">
                        <UserIcon className="w-4 h-4 text-slate-800 dark:text-slate-200" strokeWidth={2} />
                        <span>Nombre</span>
                      </label>
                      <input
                        id="reg-first-name"
                        type="text"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="Tu nombre"
                        required
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5" htmlFor="reg-last-name">
                        <UserIcon className="w-4 h-4 text-slate-800 dark:text-slate-200" strokeWidth={2} />
                        <span>Apellido</span>
                      </label>
                      <input
                        id="reg-last-name"
                        type="text"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Tu apellido"
                        required
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5" htmlFor="reg-email">
                      <Mail className="w-4 h-4 text-slate-800 dark:text-slate-200" strokeWidth={2} />
                      <span>Email</span>
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5" htmlFor="reg-password">
                      <Lock className="w-4 h-4 text-slate-800 dark:text-slate-200" strokeWidth={2} />
                      <span>Contraseña</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        required
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-700 dark:text-slate-300 hover:text-slate-900 transition"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5" htmlFor="reg-confirm-password">
                      <Lock className="w-4 h-4 text-slate-800 dark:text-slate-200" strokeWidth={2} />
                      <span>Confirmar Contraseña</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-confirm-password"
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        required
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-700 dark:text-slate-300 hover:text-slate-900 transition"
                      >
                        {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    id="btn-submit-register"
                    type="submit"
                    disabled={regLoading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition mt-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {regLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin mx-auto text-white" />
                    ) : (
                      'Crear cuenta'
                    )}
                  </button>

                  <p className="text-xs text-slate-400 text-center pt-1">
                    * Campos obligatorios
                  </p>
                </form>

                {/* Footer security branding */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6">
                  <p className="text-[10px] tracking-widest text-slate-400 dark:text-slate-500 uppercase text-center font-medium">
                    ENCRIPTACIÓN SSL · GDPR · SOC2
                  </p>
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
                  Por favor revisa tu casilla de correo electrónico y haz clic en el enlace recibido para activar tu cuenta.
                </p>

                {verifyError && (
                  <div className="mt-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{verifyError}</span>
                  </div>
                )}

                <div className="mt-5 space-y-3">
                  <button
                    id="btn-goto-login"
                    type="button"
                    onClick={() => {
                      setPendingVerificationEmail(null);
                      setAuthScreen('login');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Volver a Iniciar Sesión</span>
                  </button>
                </div>

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
                {!forgotSuccess ? (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
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
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>

                    <div>
                      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        ¡Enlace Enviado!
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Hemos enviado el enlace de restablecimiento de contraseña al correo registrado:
                      </p>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{forgotEmail}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-2">
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Por favor revisa tu bandeja de entrada o spam. Haz clic en el enlace recibido para crear tu nueva contraseña segura.
                      </p>
                    </div>

                    <div className="space-y-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthScreen('reset_password');
                        }}
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2"
                      >
                        <KeyRound className="w-4 h-4" />
                        <span>Establecer Nueva Contraseña</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowEmailInboxModal(true)}
                        className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-2"
                      >
                        <Inbox className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Ver Correo en Buzón de Entrada</span>
                      </button>

                      <div className="pt-2 flex justify-center gap-4 text-xs">
                        <button
                          type="button"
                          onClick={() => setForgotSuccess(false)}
                          className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          Enviar a otro correo
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 text-center">
                  <button
                    id="btn-back-to-login-from-forgot"
                    type="button"
                    onClick={() => {
                      setForgotError(null);
                      setForgotSuccess(false);
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

              {/* Tab 2: Password Recovery / Reset Template */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/50">
                      Restablecimiento de Contraseña
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">
                      Enlace para restablecer tu contraseña
                    </h4>
                  </div>
                  <span className="text-xs text-slate-400">Hoy</span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
                  <p>
                    Hola{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {currentResetAccount?.name || 'Usuario'}
                    </strong>
                    ,
                  </p>
                  <p>
                    Hemos recibido una solicitud para restablecer la contraseña asociada a tu cuenta{' '}
                    <strong className="text-slate-900 dark:text-white">
                      {currentResetAccount?.email || forgotEmail || 'tu correo'}
                    </strong>
                    .
                  </p>

                  <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Haz clic en el siguiente enlace para abrir el formulario y definir tu nueva contraseña:
                    </p>
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

                  <p className="text-[11px] text-slate-400">
                    Si no solicitaste este cambio, puedes ignorar este mensaje de forma segura.
                  </p>
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
