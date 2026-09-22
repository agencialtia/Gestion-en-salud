import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  ProgramId,
  TrafficLightStatus,
  HealthProgram,
  Establishment,
  User,
  HRRecord,
  Indicator,
  IndicatorMeasurement,
  FinancialPeriod,
  BudgetComponent,
  ProgramBudget2025Note,
  Purchase,
  Meeting,
  MeetingAgreement,
  MeetingCommitment,
  Commitment,
  CommitmentStatus,
  MeetingStatus,
  MeetingParticipant,
  isCommitmentOverdue,
  Task,
  TaskStatus,
  TaskCategory,
  TaskChecklistItem,
  TaskAuditEntry,
  isTaskOverdue,
  isTaskCompleted,
  normalizeTaskStatus,
  PendingEmail,
  CommunicationItem,
  CommunicationFollowUp,
  CommunicationFollowUpType,
  CommunicationAttachment,
  CommunicationType,
  CommunicationStatus,
  normalizeCommunicationStatus,
  isEmailOverdue,
  Question,
  QuestionCategory,
  QuestionStatus,
  QuestionFollowUp,
  QuestionFollowUpType,
  QuestionAttachment,
  isQuestionOverdue,
  isQuestionDueToday,
  getQuestionStatusLabel,
  getQuestionCategoryLabel,
  KnowledgeItem,
  KnowledgeHistoryEntry,
  EleamCase,
  EmpamRecord,
  Alert,
  AuditLog,
  ThresholdSettings,
  FileAttachment,
  getPurchaseDateFieldLabel,
  getPurchaseEffectiveMacroState,
  getPurchaseAlerts,
  Contact,
  DocumentRecord,
  DocumentVersion,
  DocumentValidityStatus,
  getDocumentEffectiveStatus,
  AuthScreenType,
  AuthAccount,
  Language,
} from '../types';
import { translations, TranslationKey, LANGUAGE_OPTIONS, LanguageOption } from '../i18n/translations';
import {
  isGCalConnected,
  setGCalConnected,
  getStoredUserEmail,
  setStoredUserEmail,
  fetchGoogleCalendarEvents,
  createGoogleCalendarEvent,
  convertGCalEventToMeeting,
  generateGoogleCalendarWebUrl,
  extractVideoMeetingLink,
  GoogleCalendarEvent,
} from '../utils/googleCalendarSync';
import {
  CURRENT_USER,
  ESTABLISHMENTS,
  HEALTH_PROGRAMS,
  INITIAL_THRESHOLDS,
  INITIAL_HR_RECORDS,
  INITIAL_INDICATORS,
  INITIAL_FINANCIAL_PERIODS,
  INITIAL_BUDGET_COMPONENTS,
  INITIAL_BUDGET_2025_NOTES,
  INITIAL_PURCHASES,
  INITIAL_MEETINGS,
  INITIAL_TASKS,
  INITIAL_TASK_CATEGORIES,
  INITIAL_EMAILS,
  INITIAL_QUESTIONS,
  INITIAL_KNOWLEDGE,
  INITIAL_KNOWLEDGE_CATEGORIES,
  INITIAL_KNOWLEDGE_SOURCES,
  INITIAL_ELEAM_CASES,
  INITIAL_EMPAM_RECORDS,
  INITIAL_CONTACTS,
  INITIAL_DOCUMENTS,
  INITIAL_CONTACT_CATEGORIES,
  INITIAL_DOCUMENT_CATEGORIES,
} from '../data/initialData';
import { formatDate } from '../utils/dateUtils';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import {
  checkSupabaseDatabaseStatus,
  pullAllFromSupabase,
  pushAllToSupabase,
  subscribeToSupabaseDatabase,
  upsertTaskInSupabase,
  deleteTaskFromSupabase,
  upsertPurchaseInSupabase,
  deletePurchaseFromSupabase,
  upsertMeetingInSupabase,
  deleteMeetingFromSupabase,
  upsertIndicatorInSupabase,
  deleteIndicatorFromSupabase,
  upsertContactInSupabase,
  deleteContactFromSupabase,
  upsertQuestionInSupabase,
  deleteQuestionFromSupabase,
  upsertAlertInSupabase,
  deleteAlertFromSupabase,
  upsertProgramInSupabase,
  deleteProgramFromSupabase,
  upsertEstablishmentInSupabase,
  deleteEstablishmentFromSupabase,
  upsertFinancialPeriodInSupabase,
  deleteFinancialPeriodFromSupabase,
  upsertBudgetComponentInSupabase,
  deleteBudgetComponentFromSupabase,
  upsertUserInSupabase,
  fetchUserByIdOrEmailFromSupabase,
  generateUUID,
  SupabaseDbStatus,
} from '../lib/supabaseDb';

export interface ProgramSummary {
  program: HealthProgram;
  status: TrafficLightStatus;
  statusReason: string;
  indicatorsCompliance: number; // average %
  indicatorsTotal: number;
  indicatorsAtRisk: number;
  indicatorsCritical: number;
  financialExecutionRate: number; // %
  totalBudget: number;
  executedBudget: number;
  availableBudget: number;
  criticalPendingCount: number;
  overdueTasksCount: number;
  activeAlertsCount: number;
  nextMilestone: string;
  lastUpdateDate: string;
}

// Las cuentas de usuario son administradas exclusivamente a través de los registros reales en el sistema
export const DEFAULT_AUTH_ACCOUNTS: AuthAccount[] = [];

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // Authentication & Session
  isAuthenticated: boolean;
  isVerifyingAuthCode: boolean;
  isSupabaseActive: boolean;
  authScreen: AuthScreenType;
  setAuthScreen: (screen: AuthScreenType) => void;
  registeredAccounts: AuthAccount[];
  pendingVerificationEmail: string | null;
  setPendingVerificationEmail: (email: string | null) => void;
  pendingResetEmail: string | null;
  setPendingResetEmail: (email: string | null) => void;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: (customData?: { email?: string; credential?: string }) => Promise<{ success: boolean; error?: string }>;
  registerWithGoogle: (data?: { email?: string; name?: string; role?: string; title?: string; establishment?: string; healthService?: string; photoUrl?: string; credential?: string }) => Promise<{ success: boolean; error?: string }>;
  registerUser: (data: { name: string; email: string; password: string; role?: string; title?: string; comuna?: string; establishment?: string; healthService?: string }) => Promise<{ success: boolean; error?: string; verificationCode?: string }>;
  verifyAccountEmail: (email?: string, code?: string) => Promise<{ success: boolean; error?: string }>;
  resendVerificationLink: (email: string) => Promise<{ success: boolean; error?: string; verificationCode?: string }>;
  sendPasswordResetLink: (email: string) => Promise<{ success: boolean; error?: string; resetToken?: string }>;
  resetUserPassword: (newPassword: string, email?: string, token?: string) => Promise<{ success: boolean; error?: string }>;
  changeUserPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Master data
  currentUser: User;
  updateCurrentUser: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  establishments: Establishment[];
  updateEstablishment: (id: string, updates: Partial<Establishment>) => void;
  addEstablishment: (est: Omit<Establishment, 'id'>) => Establishment;
  deleteEstablishment: (id: string) => void;
  programs: HealthProgram[];
  addProgram: (programData: Omit<HealthProgram, 'id'> & { id?: string }) => HealthProgram;
  updateProgram: (id: string, updates: Partial<HealthProgram>) => void;
  deleteProgram: (id: string) => void;
  thresholds: ThresholdSettings;
  updateThresholds: (settings: Partial<ThresholdSettings>) => void;

  // Appearance & Theme
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  toggleDarkMode: () => void;

  // Language & Internationalization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;

  // Active navigation / Filters
  activeView: string;
  setActiveView: (view: string) => void;
  selectedProgramId: ProgramId | null;
  setSelectedProgramId: (id: ProgramId | null) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // Operational Data
  hrRecords: HRRecord[];
  indicators: Indicator[];
  financialPeriods: FinancialPeriod[];
  budgetComponents: BudgetComponent[];
  budget2025Notes: Record<string, ProgramBudget2025Note>;
  purchases: Purchase[];
  meetings: Meeting[];
  tasks: Task[];
  taskCategories: TaskCategory[];
  emails: PendingEmail[];
  questions: Question[];
  knowledge: KnowledgeItem[];
  knowledgeCategories: string[];
  knowledgeSources: string[];
  eleamCases: EleamCase[];
  empamRecords: EmpamRecord[];
  contacts: Contact[];
  contactCategories: string[];
  documents: DocumentRecord[];
  documentCategories: string[];
  alerts: Alert[];
  auditLogs: AuditLog[];
  attachments: FileAttachment[];

  // Computed Summaries
  programSummaries: Record<ProgramId, ProgramSummary>;
  globalAlerts: Alert[];
  urgentTasks: Task[];
  todayTasks: Task[];
  upcomingTasks: Task[];
  overdueTasks: Task[];
  indicatorsInRisk: Indicator[];
  financialAlerts: { programId: ProgramId; reason: string; severity: 'alta' | 'media'; rate: number }[];
  unansweredQuestions: Question[];

  // Task Category Management
  addTaskCategory: (name: string, color?: string) => TaskCategory;
  updateTaskCategory: (id: string, updates: Partial<TaskCategory>) => void;
  toggleTaskCategoryStatus: (id: string) => void;

  // Mutations with Auto-Audit & Alerta Triggering
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>, silentToast?: boolean) => void;
  quickUpdateTaskStatus: (id: string, newStatus: TaskStatus) => void;
  completeTask: (id: string) => void;
  reopenTask: (id: string) => void;
  duplicateTask: (id: string, newDueDate?: string) => Task;
  deleteTask: (id: string) => void;
  deleteTaskWithConfirmation: (id: string) => void;
  restoreTask: (id: string) => void;
  toggleTaskUrgent: (id: string) => void;

  // Task Checklist operations
  addChecklistItem: (taskId: string, description: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  updateChecklistItem: (taskId: string, itemId: string, description: string) => void;
  removeChecklistItem: (taskId: string, itemId: string) => void;

  addIndicator: (indicator: Omit<Indicator, 'id' | 'measurements' | 'createdAt' | 'updatedAt'>) => Indicator;
  updateIndicator: (id: string, updates: Partial<Indicator>) => void;
  recordMeasurement: (indicatorId: string, result: number, period: string, notes?: string) => void;
  deleteIndicator: (id: string) => void;

  updateFinancialPeriod: (id: string, updates: Partial<FinancialPeriod>) => void;
  addFinancialPeriod: (fin: Omit<FinancialPeriod, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteFinancialPeriod: (id: string) => void;

  addBudgetComponent: (comp: Omit<BudgetComponent, 'id' | 'createdAt' | 'updatedAt'>) => BudgetComponent;
  updateBudgetComponent: (id: string, updates: Partial<BudgetComponent>) => void;
  deleteBudgetComponent: (id: string) => void;
  updateBudget2025Note: (programId: ProgramId, updates: Partial<ProgramBudget2025Note>, targetYear?: number) => void;

  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => Purchase;
  updatePurchase: (id: string, updates: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;

  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Meeting;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  deleteMeeting: (id: string) => void;
  addMeetingAgreement: (meetingId: string, description: string, decisionType?: 'acuerdo' | 'definicion' | 'resolucion') => MeetingAgreement;
  updateMeetingAgreement: (meetingId: string, agreementId: string, updates: Partial<MeetingAgreement>) => void;
  deleteMeetingAgreement: (meetingId: string, agreementId: string) => void;
  addMeetingCommitment: (meetingId: string, commitment: Omit<MeetingCommitment, 'id' | 'meetingId' | 'createdAt' | 'updatedAt'>) => MeetingCommitment;
  updateMeetingCommitment: (meetingId: string, commitmentId: string, updates: Partial<MeetingCommitment>) => void;
  deleteMeetingCommitment: (meetingId: string, commitmentId: string) => void;
  toggleMeetingCommitmentStatus: (meetingId: string, commitmentId: string, newStatus?: CommitmentStatus) => void;
  convertCommitmentToTask: (meetingId: string, commitmentId: string) => Task | undefined;

  addEmail: (email: Omit<PendingEmail, 'id' | 'createdAt' | 'updatedAt'>) => PendingEmail;
  updateEmail: (id: string, updates: Partial<PendingEmail>, silentToast?: boolean) => void;
  deleteEmail: (id: string) => void;
  addEmailFollowUp: (emailId: string, followUp: { type: CommunicationFollowUpType; note: string }) => CommunicationFollowUp;
  deleteEmailFollowUp: (emailId: string, followUpId: string) => void;
  addEmailAttachment: (emailId: string, attachment: { name: string; size?: string; type?: string; url?: string }) => CommunicationAttachment;
  deleteEmailAttachment: (emailId: string, attachmentId: string) => void;
  convertEmailToTask: (emailId: string) => Task | undefined;
  pendingEmailResolutionPrompt: { emailId: string; taskId: string; emailSubject: string } | null;
  resolvePendingEmailPrompt: (action: 'respondido' | 'cerrado' | 'mantener') => void;
  dismissPendingEmailPrompt: () => void;

  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  addQuestionFollowUp: (questionId: string, followUp: { type: QuestionFollowUpType; note: string }) => QuestionFollowUp;
  deleteQuestionFollowUp: (questionId: string, followUpId: string) => void;
  addQuestionAttachment: (questionId: string, attachment: { name: string; size?: string; type?: string; url?: string }) => QuestionAttachment;
  deleteQuestionAttachment: (questionId: string, attachmentId: string) => void;
  convertQuestionToTask: (questionId: string) => Task | undefined;
  resolveQuestion: (questionId: string, finalAnswer: string, sourceOfResponse?: string) => void;
  closeQuestionWithoutAnswer: (questionId: string, reason?: string) => void;
  toggleQuestionForNextMeeting: (questionId: string) => void;
  linkQuestionToMeeting: (questionId: string, meetingId?: string) => void;

  addKnowledge: (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => KnowledgeItem;
  updateKnowledge: (id: string, updates: Partial<KnowledgeItem>) => void;
  togglePinKnowledge: (id: string) => void;
  deleteKnowledge: (id: string) => void;
  restoreKnowledge: (id: string) => void;
  permanentlyDeleteKnowledge: (id: string) => void;
  addKnowledgeCategory: (category: string) => void;
  addKnowledgeSource: (source: string) => void;
  saveQuestionAsKnowledge: (questionId: string, overrides?: Partial<KnowledgeItem>) => KnowledgeItem;
  saveMeetingAgreementAsKnowledge: (meetingId: string, agreementText: string, overrides?: Partial<KnowledgeItem>) => KnowledgeItem;

  addHRRecord: (hr: Omit<HRRecord, 'id' | 'createdAt' | 'updatedAt'>) => HRRecord;
  updateHRRecord: (id: string, updates: Partial<HRRecord>, silent?: boolean) => void;
  deleteHRRecord: (id: string) => void;

  addEleamCase: (eleam: Omit<EleamCase, 'id' | 'createdAt' | 'updatedAt'>) => EleamCase;
  updateEleamCase: (id: string, updates: Partial<EleamCase>) => void;
  deleteEleamCase: (id: string) => void;

  updateEmpamRecord: (id: string, updates: Partial<EmpamRecord>) => void;

  // Contactos (Gestión Transversal)
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Contact;
  updateContact: (id: string, updates: Partial<Contact>, silentToast?: boolean) => void;
  deleteContact: (id: string, hard?: boolean) => void;
  toggleContactFrequent: (id: string) => void;
  addContactCategory: (name: string) => void;

  // Documentos (Gestión Transversal)
  addDocument: (doc: Omit<DocumentRecord, 'id' | 'uploadDate' | 'createdAt' | 'updatedAt'>) => DocumentRecord;
  updateDocument: (id: string, updates: Partial<DocumentRecord>, silentToast?: boolean) => void;
  deleteDocument: (id: string, hard?: boolean) => void;
  addDocumentVersion: (documentId: string, versionData: { versionNumber: string; fileName: string; fileUrl?: string; fileSize?: string; notes?: string; uploadedBy?: string }) => void;
  addDocumentCategory: (name: string) => void;

  resolveAlert: (id: string) => void;
  dismissAlert: (id: string) => void;

  // File Upload Handling
  addAttachment: (attachment: Omit<FileAttachment, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  deleteAttachment: (id: string) => void;

  // Google Calendar Integration & Sync
  isGoogleCalendarConnected: boolean;
  isGoogleCalendarSyncing: boolean;
  lastGoogleCalendarSync: string | null;
  googleCalendarEmail: string;
  updateGoogleCalendarAccount: (email: string) => void;
  connectGoogleCalendar: (email?: string) => Promise<boolean>;
  disconnectGoogleCalendar: () => void;
  syncGoogleCalendar: () => Promise<void>;
  exportMeetingToGoogleCalendar: (meeting: Meeting) => Promise<boolean>;
  exportTaskToGoogleCalendar: (task: Task) => Promise<boolean>;

  // Supabase Database Integration
  isSupabaseConnected: boolean;
  supabaseDbStatus: SupabaseDbStatus | null;
  supabaseSyncState: 'idle' | 'syncing' | 'synced' | 'error';
  supabaseLastSyncTime: string | null;
  supabaseSyncError: string | null;
  syncWithSupabase: (direction?: 'pull' | 'push' | 'both') => Promise<void>;
  testSupabaseDatabaseConnection: () => Promise<SupabaseDbStatus>;
  pushAllDataToSupabase: () => Promise<{ success: boolean; insertedCount: number; errors: string[] }>;

  // Utility Actions
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  resetAllDataToSeed: () => void;
  exportAllDataJSON: () => void;
  exportTableCSV: (entityType: string, programFilter?: ProgramId | null) => void;
}

const STORAGE_KEY = 'quilicura_salud_operativo_v1';
const THRESHOLDS_KEY = 'quilicura_salud_thresholds_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Authentication & Accounts State (sin cuentas ficticias)
  const [registeredAccounts, setRegisteredAccounts] = useState<AuthAccount[]>(() => {
    try {
      const saved = localStorage.getItem('quilicura_auth_accounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filtrar cuentas de prueba obsoletas que pudieran haber quedado en localStorage
          return parsed.filter(
            (a: any) =>
              a.id !== 'usr_klaus_bauer' &&
              a.id !== 'usr_kbauer_grandon' &&
              a.id !== 'usr_camila_fuentes' &&
              a.id !== 'usr_disam_admin' &&
              !a.id?.startsWith('usr_demo_')
          );
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quilicura_is_authenticated');
      return saved !== null ? saved === 'true' : false;
    } catch {
      return false;
    }
  });

  const [authScreen, setAuthScreen] = useState<AuthScreenType>('login');

  const [isVerifyingAuthCode, setIsVerifyingAuthCode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const hash = window.location.hash;
        return Boolean(code || hash.includes('access_token='));
      } catch {
        return false;
      }
    }
    return false;
  });

  const [pendingVerificationEmail, setPendingVerificationEmailState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('quilicura_pending_verify_email');
    } catch {
      return null;
    }
  });

  const [pendingResetEmail, setPendingResetEmailState] = useState<string | null>(() => {
    try {
      return localStorage.getItem('quilicura_pending_reset_email');
    } catch {
      return null;
    }
  });

  const setPendingVerificationEmail = (email: string | null) => {
    setPendingVerificationEmailState(email);
    if (email) {
      localStorage.setItem('quilicura_pending_verify_email', email);
    } else {
      localStorage.removeItem('quilicura_pending_verify_email');
    }
  };

  const setPendingResetEmail = (email: string | null) => {
    setPendingResetEmailState(email);
    if (email) {
      localStorage.setItem('quilicura_pending_reset_email', email);
    } else {
      localStorage.removeItem('quilicura_pending_reset_email');
    }
  };

  // Sync registeredAccounts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('quilicura_auth_accounts', JSON.stringify(registeredAccounts));
    } catch (e) {
      console.error(e);
    }
  }, [registeredAccounts]);

  // Sync isAuthenticated to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('quilicura_is_authenticated', String(isAuthenticated));
    } catch (e) {
      console.error(e);
    }
  }, [isAuthenticated]);

  // Load data from localStorage or fallback to seeds
  const [establishments, setEstablishments] = useState<Establishment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_establishments`);
      return saved ? JSON.parse(saved) : ESTABLISHMENTS;
    } catch {
      return ESTABLISHMENTS;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
      return saved ? JSON.parse(saved) : CURRENT_USER;
    } catch {
      return CURRENT_USER;
    }
  });

  const [programs, setPrograms] = useState<HealthProgram[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_programs`);
      return saved ? JSON.parse(saved) : HEALTH_PROGRAMS;
    } catch {
      return HEALTH_PROGRAMS;
    }
  });

  const [thresholds, setThresholds] = useState<ThresholdSettings>(() => {
    try {
      const saved = localStorage.getItem(THRESHOLDS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_THRESHOLDS;
    } catch {
      return INITIAL_THRESHOLDS;
    }
  });

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedProgramId, setSelectedProgramId] = useState<ProgramId | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Dark Mode / Low-light Theme
  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quilicura_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      return false;
    } catch {
      return false;
    }
  });

  // Google Calendar Connection & Sync State
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState<boolean>(() => isGCalConnected());
  const [isGoogleCalendarSyncing, setIsGoogleCalendarSyncing] = useState<boolean>(false);
  const [googleCalendarEmail, setGoogleCalendarEmail] = useState<string>(() => getStoredUserEmail());
  const [lastGoogleCalendarSync, setLastGoogleCalendarSync] = useState<string | null>(() => {
    try {
      return localStorage.getItem('quilicura_gcal_last_sync');
    } catch {
      return null;
    }
  });

  const setDarkMode = (val: boolean) => {
    setDarkModeState(val);
    try {
      localStorage.setItem('quilicura_dark_mode', String(val));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDarkMode = () => {
    setDarkModeState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('quilicura_dark_mode', String(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Language & Internationalization (Always starts in Spanish ('es') initially)
  const [language, setLanguageState] = useState<Language>('es');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = translations[language] || translations.es;
      return (dict as any)[key] ?? (translations.es as any)[key] ?? key;
    },
    [language]
  );

  // Sync dark class on html root and listen for keyboard shortcut Ctrl+Shift+L / Cmd+Shift+L
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }, [darkMode]);

  useEffect(() => {
    const handleThemeShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleDarkMode();
      }
    };
    window.addEventListener('keydown', handleThemeShortcut);
    return () => window.removeEventListener('keydown', handleThemeShortcut);
  }, []);

  // ==========================================
  // AUTENTICACIÓN Y GESTIÓN DE CUENTAS (SUPABASE + LOCAL)
  // ==========================================

  // Supabase Auth listener and URL Callback (/auth/callback, ?code=, #access_token=) handler
  useEffect(() => {
    const initAuthAndHandleCallback = async () => {
      if (typeof window === 'undefined') return;

      const url = new URL(window.location.href);
      const isCallbackPath = url.pathname.includes('/auth/callback');
      const code = url.searchParams.get('code');
      const errorCode = url.searchParams.get('error') || url.searchParams.get('error_code');
      const errorDesc = url.searchParams.get('error_description');
      const type = url.searchParams.get('type');

      // 0. Check hash params for direct access tokens or errors (e.g. from magic link or password recovery)
      const hash = window.location.hash.substring(1);
      const hashParams = new URLSearchParams(hash);
      const hashAccessToken = hashParams.get('access_token');
      const hashType = hashParams.get('type');
      const hashError = hashParams.get('error') || hashParams.get('error_description');

      // 1. Handle error query parameter from Supabase
      if (errorCode || hashError) {
        setIsVerifyingAuthCode(false);
        console.warn('Auth callback error:', errorCode || hashError, errorDesc);
        setAuthScreen('login');
        showToast(
          errorDesc
            ? decodeURIComponent(errorDesc.replace(/\+/g, ' '))
            : 'El enlace de confirmación ha expirado o no es válido.',
          'error'
        );
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname.replace('/auth/callback', '') || '/');
        return;
      }

      // 2. If code is present in URL, exchange for session with Supabase
      if (code && isSupabaseConfigured()) {
        setIsVerifyingAuthCode(true);
        try {
          const supabase = getSupabase();
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code for session:', error);
            setAuthScreen('login');
            showToast('El enlace de confirmación ha expirado o ya fue utilizado.', 'error');
          } else if (data?.user) {
            const dbUser = await fetchUserByIdOrEmailFromSupabase(data.user.id, data.user.email);
            const userMeta = data.user.user_metadata || {};
            const fullName = dbUser?.name || userMeta.full_name || userMeta.name || data.user.email?.split('@')[0] || 'Usuario';
            const parts = fullName.trim().split(/\s+/);
            const avatar =
              dbUser?.avatar ||
              (parts.length >= 2
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : fullName.substring(0, 2).toUpperCase());

            const loggedUser: User = {
              id: data.user.id,
              name: fullName,
              email: dbUser?.email || data.user.email || '',
              role: dbUser?.role || userMeta.role || 'referente',
              title: dbUser?.title || userMeta.title || 'Referente Técnico de Programas',
              comuna: dbUser?.comuna || userMeta.comuna || 'Quilicura (DISAM)',
              establishment: dbUser?.establishment || userMeta.establishment || 'Dirección de Salud / Comunal',
              healthService: dbUser?.healthService || userMeta.healthService || 'SSMN (Metropolitano Norte)',
              avatar,
              photoUrl: dbUser?.photoUrl || userMeta.photo_url,
              phone: dbUser?.phone || userMeta.phone,
              phonePrefix: dbUser?.phonePrefix || userMeta.phone_prefix || 'CL +56',
              instagram: dbUser?.instagram || userMeta.instagram,
              country: dbUser?.country || userMeta.country || 'Chile',
              budgetYear: dbUser?.budgetYear || userMeta.budget_year || '2026',
              authProvider: (data.user.app_metadata?.provider as any) || 'email',
              emailVerified: true,
            };

            setCurrentUser(loggedUser);
            setIsAuthenticated(true);
            if (!dbUser) {
              upsertUserInSupabase(loggedUser).catch((err) => console.warn('Sync user on callback error:', err));
            }
            try {
              localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(loggedUser));
              localStorage.setItem('quilicura_is_authenticated', 'true');
            } catch (e) {
              console.error(e);
            }

            if (type === 'recovery' || hashType === 'recovery') {
              setAuthScreen('reset_password');
              showToast('Sesión de recuperación iniciada. Ingresa tu nueva contraseña.', 'info');
            } else {
              setAuthScreen('login');
              showToast('¡Cuenta confirmada y sesión iniciada con éxito!', 'success');
            }
          }
        } catch (err: any) {
          console.error('Unexpected callback error:', err);
          showToast('Ocurrió un error al confirmar la cuenta.', 'error');
        } finally {
          setIsVerifyingAuthCode(false);
          // Clean the callback params from URL cleanly
          window.history.replaceState({}, document.title, window.location.pathname.replace('/auth/callback', '') || '/');
        }
        return;
      }

      // 3. If access_token in hash (Implicit Flow / Password Recovery)
      if (hashAccessToken && isSupabaseConfigured()) {
        setIsVerifyingAuthCode(false);
        if (hashType === 'recovery') {
          setAuthScreen('reset_password');
          showToast('Enlace de recuperación verificado. Establece tu nueva contraseña.', 'info');
        }
        window.history.replaceState({}, document.title, window.location.pathname.replace('/auth/callback', '') || '/');
        return;
      }

      setIsVerifyingAuthCode(false);

      // 4. Initial session check & continuous auth state listener
      if (isSupabaseConfigured()) {
        const supabase = getSupabase();
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            const user = sessionData.session.user;
            const dbUser = await fetchUserByIdOrEmailFromSupabase(user.id, user.email);
            const userMeta = user.user_metadata || {};
            const fullName = dbUser?.name || userMeta.full_name || userMeta.name || user.email?.split('@')[0] || 'Usuario';
            const parts = fullName.trim().split(/\s+/);
            const avatar =
              dbUser?.avatar ||
              (parts.length >= 2
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : fullName.substring(0, 2).toUpperCase());

            const activeUser: User = {
              id: user.id,
              name: fullName,
              email: dbUser?.email || user.email || '',
              role: dbUser?.role || userMeta.role || 'referente',
              title: dbUser?.title || userMeta.title || 'Referente Técnico de Programas',
              comuna: dbUser?.comuna || userMeta.comuna || 'Quilicura (DISAM)',
              establishment: dbUser?.establishment || userMeta.establishment || 'Dirección de Salud / Comunal',
              healthService: dbUser?.healthService || userMeta.healthService || 'SSMN (Metropolitano Norte)',
              avatar,
              photoUrl: dbUser?.photoUrl || userMeta.photo_url,
              phone: dbUser?.phone || userMeta.phone,
              phonePrefix: dbUser?.phonePrefix || userMeta.phone_prefix || 'CL +56',
              instagram: dbUser?.instagram || userMeta.instagram,
              country: dbUser?.country || userMeta.country || 'Chile',
              budgetYear: dbUser?.budgetYear || userMeta.budget_year || '2026',
              authProvider: (user.app_metadata?.provider as any) || 'email',
              emailVerified: Boolean(user.email_confirmed_at || user.confirmed_at),
            };

            setCurrentUser(activeUser);
            setIsAuthenticated(true);
            try {
              localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(activeUser));
              localStorage.setItem('quilicura_is_authenticated', 'true');
            } catch (e) {
              console.error(e);
            }
          }
        } catch (e) {
          console.error('Error fetching Supabase session:', e);
        }

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const user = session.user;
            const dbUser = await fetchUserByIdOrEmailFromSupabase(user.id, user.email);
            const userMeta = user.user_metadata || {};
            const fullName = dbUser?.name || userMeta.full_name || userMeta.name || user.email?.split('@')[0] || 'Usuario';
            const parts = fullName.trim().split(/\s+/);
            const avatar =
              dbUser?.avatar ||
              (parts.length >= 2
                ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                : fullName.substring(0, 2).toUpperCase());

            const loggedUser: User = {
              id: user.id,
              name: fullName,
              email: dbUser?.email || user.email || '',
              role: dbUser?.role || userMeta.role || 'referente',
              title: dbUser?.title || userMeta.title || 'Referente Técnico de Programas',
              comuna: dbUser?.comuna || userMeta.comuna || 'Quilicura (DISAM)',
              establishment: dbUser?.establishment || userMeta.establishment || 'Dirección de Salud / Comunal',
              healthService: dbUser?.healthService || userMeta.healthService || 'SSMN (Metropolitano Norte)',
              avatar,
              photoUrl: dbUser?.photoUrl || userMeta.photo_url,
              phone: dbUser?.phone || userMeta.phone,
              phonePrefix: dbUser?.phonePrefix || userMeta.phone_prefix || 'CL +56',
              instagram: dbUser?.instagram || userMeta.instagram,
              country: dbUser?.country || userMeta.country || 'Chile',
              budgetYear: dbUser?.budgetYear || userMeta.budget_year || '2026',
              authProvider: (user.app_metadata?.provider as any) || 'email',
              emailVerified: Boolean(user.email_confirmed_at || user.confirmed_at),
            };

            setCurrentUser(loggedUser);
            setIsAuthenticated(true);
            if (!dbUser) {
              upsertUserInSupabase(loggedUser).catch((err) => console.warn('Sync user on SIGNED_IN error:', err));
            }
            try {
              localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(loggedUser));
              localStorage.setItem('quilicura_is_authenticated', 'true');
            } catch (e) {
              console.error(e);
            }
          } else if (event === 'SIGNED_OUT') {
            setIsAuthenticated(false);
            setCurrentUser(CURRENT_USER);
            try {
              localStorage.setItem('quilicura_is_authenticated', 'false');
              localStorage.removeItem(`${STORAGE_KEY}_current_user`);
            } catch (e) {
              console.error(e);
            }
          } else if (event === 'PASSWORD_RECOVERY') {
            setAuthScreen('reset_password');
            showToast('Ingresa tu nueva contraseña para actualizar tu cuenta.', 'info');
          }
        });

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }
    };

    initAuthAndHandleCallback();

    // Multi-tab / cross-device local storage synchronization listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `${STORAGE_KEY}_current_user` && e.newValue) {
        try {
          const updatedUser = JSON.parse(e.newValue);
          if (updatedUser && updatedUser.id) {
            setCurrentUser(updatedUser);
          }
        } catch (err) {
          console.error('Error syncing user from storage event:', err);
        }
      }
      if (e.key === 'quilicura_is_authenticated') {
        setIsAuthenticated(e.newValue === 'true');
      }
      if (e.key === 'quilicura_dark_mode') {
        const isDark = e.newValue === 'true';
        setDarkMode(isDark);
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.trim();

    // 1. If Supabase is configured and identifier looks like an email, try Supabase Auth
    if (isSupabaseConfigured() && cleanId.includes('@')) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanId.toLowerCase(),
          password,
        });

        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('email not confirmed') || msg.includes('not confirmed') || (error.status === 400 && msg.includes('confirmed'))) {
            setPendingVerificationEmail(cleanId.toLowerCase());
            setAuthScreen('verify_email');
            return {
              success: false,
              error: 'Debes confirmar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.',
            };
          }

          if (
            msg.includes('invalid login credentials') ||
            msg.includes('invalid_grant') ||
            msg.includes('user not found') ||
            msg.includes('user not registered') ||
            error.status === 400
          ) {
            return {
              success: false,
              error: 'Credenciales inválidas. Este usuario no está registrado o la contraseña es incorrecta.',
            };
          }

          return { success: false, error: error.message };
        }

        if (data?.user) {
          const dbUser = await fetchUserByIdOrEmailFromSupabase(data.user.id, data.user.email || cleanId);
          const userMeta = data.user.user_metadata || {};
          const fullName = dbUser?.name || userMeta.full_name || userMeta.name || data.user.email?.split('@')[0] || 'Usuario';
          const parts = fullName.trim().split(/\s+/);
          const avatar =
            dbUser?.avatar ||
            (parts.length >= 2
              ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
              : fullName.substring(0, 2).toUpperCase());

          const userToSet: User = {
            id: data.user.id,
            name: fullName,
            email: dbUser?.email || data.user.email || cleanId,
            role: dbUser?.role || userMeta.role || 'referente',
            title: dbUser?.title || userMeta.title || 'Referente Técnico de Programas',
            comuna: dbUser?.comuna || userMeta.comuna || 'Quilicura (DISAM)',
            establishment: dbUser?.establishment || userMeta.establishment || 'Dirección de Salud / Comunal',
            healthService: dbUser?.healthService || userMeta.healthService || 'SSMN (Metropolitano Norte)',
            avatar,
            photoUrl: dbUser?.photoUrl || userMeta.photo_url,
            phone: dbUser?.phone || userMeta.phone,
            phonePrefix: dbUser?.phonePrefix || userMeta.phone_prefix || 'CL +56',
            instagram: dbUser?.instagram || userMeta.instagram,
            country: dbUser?.country || userMeta.country || 'Chile',
            budgetYear: dbUser?.budgetYear || userMeta.budget_year || '2026',
            authProvider: 'email',
            emailVerified: Boolean(data.user.email_confirmed_at || data.user.confirmed_at),
          };

          if (!dbUser) {
            upsertUserInSupabase(userToSet).catch((err) => console.warn('Sync user error on login:', err));
          }

          setCurrentUser(userToSet);
          try {
            localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(userToSet));
            localStorage.setItem('quilicura_is_authenticated', 'true');
          } catch (e) {
            console.error(e);
          }
          setIsAuthenticated(true);
          showToast(`¡Bienvenido/a, ${fullName}!`, 'success');
          return { success: true };
        }
      } catch (err: any) {
        console.error('Supabase signIn error:', err);
      }
    }

    // 2. Fallback / Local account login (supports username or demo accounts)
    const lowerId = cleanId.toLowerCase();
    const account = registeredAccounts.find(
      (a) => a.email.toLowerCase() === lowerId || (a.username && a.username.toLowerCase() === lowerId)
    );

    if (!account) {
      return { success: false, error: 'No existe una cuenta registrada con este correo o usuario.' };
    }

    if (account.passwordHash && account.passwordHash !== password) {
      return { success: false, error: 'La contraseña ingresada no es válida. Si la olvidaste, puedes recuperarla.' };
    }

    if (!account.emailVerified) {
      setPendingVerificationEmail(account.email);
      setAuthScreen('verify_email');
      return {
        success: false,
        error: 'Email not confirmed',
      };
    }

    // Set as current active user
    const userToSet: User = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role || 'referente',
      title: account.title || 'Referente Técnico de Programas',
      comuna: account.comuna || 'Quilicura (DISAM)',
      establishment: account.establishment || 'Dirección de Salud / Comunal',
      healthService: account.healthService || 'SSMN (Metropolitano Norte)',
      avatar: account.avatar || account.name.substring(0, 2).toUpperCase(),
      photoUrl: account.photoUrl,
      phone: account.phone,
      phonePrefix: account.phonePrefix || 'CL +56',
      instagram: account.instagram,
      country: account.country || 'Chile',
      budgetYear: account.budgetYear || '2026',
      authProvider: account.authProvider || 'email',
      emailVerified: true,
    };

    setCurrentUser(userToSet);
    try {
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(userToSet));
      localStorage.setItem('quilicura_is_authenticated', 'true');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(true);
    showToast(`¡Bienvenido/a de nuevo, ${account.name}!`, 'success');
    return { success: true };
  };

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) {
        console.error('Error al autenticar con Google:', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      console.error('Error al autenticar con Google:', err);
      return { success: false, error: err?.message || 'Error al autenticar con Google.' };
    }
  };

  const loginWithGoogle = async (customData?: {
    email?: string;
    name?: string;
    photoUrl?: string;
    credential?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const email = (customData?.email || 'klausbauer10x@gmail.com').trim().toLowerCase();
      const existing = registeredAccounts.find((a) => a.email.toLowerCase() === email);

      let userToSet: User;

      if (existing) {
        userToSet = {
          id: existing.id,
          name: existing.name,
          email: existing.email,
          role: existing.role || 'referente',
          title: existing.title || 'Referente Comunal de Programas de Salud',
          comuna: existing.comuna || 'Quilicura (DISAM)',
          establishment: existing.establishment || 'Dirección de Salud / Comunal',
          healthService: existing.healthService || 'SSMN (Metropolitano Norte)',
          avatar: existing.avatar || existing.name.substring(0, 2).toUpperCase(),
          photoUrl: customData?.photoUrl || existing.photoUrl,
          authProvider: 'google',
          emailVerified: true,
        };
      } else {
        const finalName = customData?.name?.trim() || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        const nameParts = finalName.trim().split(/\s+/);
        const avatar =
          nameParts.length >= 2
            ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            : finalName.substring(0, 2).toUpperCase();

        const newAccount: AuthAccount = {
          id: `usr_google_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          email,
          username: email.split('@')[0],
          name: finalName,
          role: 'referente',
          title: 'Referente Técnico de Salud',
          comuna: 'Quilicura (DISAM)',
          establishment: 'Dirección de Salud / Comunal',
          healthService: 'SSMN (Metropolitano Norte)',
          avatar,
          photoUrl: customData?.photoUrl,
          authProvider: 'google',
          emailVerified: true,
          createdAt: new Date().toISOString(),
        };

        setRegisteredAccounts((prev) => {
          const updated = [...prev, newAccount];
          try {
            localStorage.setItem('quilicura_auth_accounts', JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
          return updated;
        });

        userToSet = {
          id: newAccount.id,
          name: newAccount.name,
          email: newAccount.email,
          role: newAccount.role,
          title: newAccount.title,
          comuna: newAccount.comuna,
          establishment: newAccount.establishment,
          healthService: newAccount.healthService,
          avatar: newAccount.avatar || avatar,
          photoUrl: newAccount.photoUrl,
          authProvider: 'google',
          emailVerified: true,
        };
      }

      setCurrentUser(userToSet);
      try {
        localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(userToSet));
        localStorage.setItem('quilicura_is_authenticated', 'true');
      } catch (e) {
        console.error(e);
      }
      setIsAuthenticated(true);
      showToast(`¡Sesión iniciada con Google! Bienvenido/a, ${userToSet.name}`, 'success');
      return { success: true };
    } catch (err: any) {
      console.error('Error logging in with Google:', err);
      return { success: false, error: err?.message || 'Error al iniciar sesión con Google.' };
    }
  };

  const registerWithGoogle = async (data?: {
    email?: string;
    name?: string;
    role?: string;
    title?: string;
    establishment?: string;
    healthService?: string;
    photoUrl?: string;
    credential?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const email = (data?.email || 'klausbauer10x@gmail.com').trim().toLowerCase();
      const existing = registeredAccounts.find((a) => a.email.toLowerCase() === email);

      if (existing) {
        return loginWithGoogle({ email, name: data?.name, photoUrl: data?.photoUrl });
      }

      const finalName = data?.name?.trim() || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const nameParts = finalName.trim().split(/\s+/);
      const avatar =
        nameParts.length >= 2
          ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
          : finalName.substring(0, 2).toUpperCase();

      const newAccount: AuthAccount = {
        id: `usr_google_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        email,
        username: email.split('@')[0],
        name: finalName,
        role: (data?.role as any) || 'referente',
        title: data?.title || (data?.role === 'coordinador' ? 'Coordinador/a Técnico/a' : 'Referente de Programas de Salud'),
        comuna: 'Quilicura (DISAM)',
        establishment: data?.establishment || 'Dirección de Salud / Comunal',
        healthService: data?.healthService || 'SSMN (Metropolitano Norte)',
        avatar,
        photoUrl: data?.photoUrl,
        authProvider: 'google',
        emailVerified: true,
        createdAt: new Date().toISOString(),
      };

      setRegisteredAccounts((prev) => {
        const updated = [...prev, newAccount];
        try {
          localStorage.setItem('quilicura_auth_accounts', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });

      const userToSet: User = {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        role: newAccount.role,
        title: newAccount.title,
        comuna: newAccount.comuna,
        establishment: newAccount.establishment,
        healthService: newAccount.healthService,
        avatar: newAccount.avatar || avatar,
        photoUrl: newAccount.photoUrl,
        authProvider: 'google',
        emailVerified: true,
      };

      setCurrentUser(userToSet);
      try {
        localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(userToSet));
        localStorage.setItem('quilicura_is_authenticated', 'true');
      } catch (e) {
        console.error(e);
      }
      setIsAuthenticated(true);
      showToast(`¡Cuenta registrada exitosamente con Google! Bienvenido/a, ${finalName}`, 'success');
      return { success: true };
    } catch (err: any) {
      console.error('Error registering with Google:', err);
      return { success: false, error: err?.message || 'Error al registrar la cuenta con Google.' };
    }
  };

  const registerUser = async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    title?: string;
    comuna?: string;
    establishment?: string;
    healthService?: string;
  }): Promise<{ success: boolean; error?: string; verificationCode?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();

    // 1. If Supabase is configured, register with Supabase Auth
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password: data.password,
          options: {
            data: {
              full_name: data.name.trim(),
              name: data.name.trim(),
              role: data.role || 'referente',
              title: data.title || 'Referente de Programas de Salud',
              comuna: data.comuna || 'Quilicura (DISAM)',
              establishment: data.establishment || 'Dirección de Salud / Comunal',
              healthService: data.healthService || 'SSMN (Metropolitano Norte)',
            },
            emailRedirectTo: redirectTo,
          },
        });

        if (error) {
          const msg = error.message.toLowerCase();
          if (
            msg.includes('user already registered') ||
            msg.includes('already registered') ||
            msg.includes('already exists') ||
            msg.includes('user with this email already exists')
          ) {
            return {
              success: false,
              error: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.',
            };
          }
          return {
            success: false,
            error: error.message || 'Error al registrar la cuenta en el servidor de autenticación.',
          };
        }

        // Si Supabase devuelve usuario pero identities está vacío, ya existía en Supabase Auth
        if (signUpData?.user?.identities && signUpData.user.identities.length === 0) {
          return {
            success: false,
            error: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.',
          };
        }

        if (signUpData?.user) {
          const nameParts = data.name.trim().split(/\s+/);
          const avatar =
            nameParts.length >= 2
              ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
              : data.name.substring(0, 2).toUpperCase();

          const userId = signUpData.user.id;

          // Guardar de inmediato en la tabla public.users de Supabase
          await upsertUserInSupabase({
            id: userId,
            name: data.name.trim(),
            email: cleanEmail,
            role: data.role || 'referente',
            title: data.title || 'Referente de Programas de Salud',
            comuna: data.comuna || 'Quilicura (DISAM)',
            establishment: data.establishment || 'Dirección de Salud / Comunal',
            healthService: data.healthService || 'SSMN (Metropolitano Norte)',
            avatar,
          });

          const newAccount: AuthAccount = {
            id: userId,
            email: cleanEmail,
            username: cleanEmail.split('@')[0],
            passwordHash: data.password,
            name: data.name.trim(),
            role: data.role || 'referente',
            title: data.title || 'Referente de Programas de Salud',
            comuna: data.comuna || 'Quilicura (DISAM)',
            establishment: data.establishment || 'Dirección de Salud / Comunal',
            healthService: data.healthService || 'SSMN (Metropolitano Norte)',
            avatar,
            authProvider: 'email',
            emailVerified: Boolean(signUpData.user.email_confirmed_at),
            createdAt: new Date().toISOString(),
          };

          setRegisteredAccounts((prev) => [...prev.filter((a) => a.email.toLowerCase() !== cleanEmail), newAccount]);
          setPendingVerificationEmail(cleanEmail);
          setAuthScreen('verify_email');
          showToast(`Revisa tu correo para confirmar tu cuenta (${cleanEmail})`, 'info');

          return { success: true };
        }
      } catch (err: any) {
        console.error('Supabase signUp error:', err);
        return {
          success: false,
          error: err?.message || 'Error de conexión con el servidor al crear la cuenta.',
        };
      }
    }

    // 2. Fallback / Local account registration
    const existing = registeredAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.' };
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const nameParts = data.name.trim().split(/\s+/);
    const avatar =
      nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : data.name.substring(0, 2).toUpperCase();

    const newAccount: AuthAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email: cleanEmail,
      username: cleanEmail.split('@')[0],
      passwordHash: data.password,
      name: data.name.trim(),
      role: data.role || 'referente',
      title: data.title || 'Referente de Programas de Salud',
      comuna: data.comuna || 'Quilicura (DISAM)',
      establishment: data.establishment || 'Dirección de Salud / Comunal',
      healthService: data.healthService || 'SSMN (Metropolitano Norte)',
      avatar,
      authProvider: 'email',
      emailVerified: false,
      verificationCode,
      createdAt: new Date().toISOString(),
    };

    setRegisteredAccounts((prev) => [...prev.filter((a) => a.email.toLowerCase() !== cleanEmail), newAccount]);
    setPendingVerificationEmail(cleanEmail);
    setAuthScreen('verify_email');
    showToast(`¡Cuenta creada! Se ha enviado el código de verificación a ${cleanEmail}`, 'info');

    return { success: true, verificationCode };
  };

  const verifyAccountEmail = async (email?: string, code?: string): Promise<{ success: boolean; error?: string }> => {
    const targetEmail = (email || pendingVerificationEmail || '').trim().toLowerCase();
    if (!targetEmail) {
      return { success: false, error: 'No se especificó un correo para verificar.' };
    }

    // If Supabase is configured and a code was passed, try verifying OTP
    if (isSupabaseConfigured() && code) {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase.auth.verifyOtp({
          email: targetEmail,
          token: code.trim(),
          type: 'signup',
        });
        if (!error && data.user) {
          const userMeta = data.user.user_metadata || {};
          const fullName = userMeta.full_name || userMeta.name || data.user.email?.split('@')[0] || 'Usuario';
          const parts = fullName.trim().split(/\s+/);
          const avatar =
            parts.length >= 2
              ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
              : fullName.substring(0, 2).toUpperCase();

          const userToSet: User = {
            id: data.user.id,
            name: fullName,
            email: data.user.email || targetEmail,
            role: userMeta.role || 'referente',
            title: userMeta.title || 'Referente Técnico de Programas',
            comuna: userMeta.comuna || 'Quilicura (DISAM)',
            establishment: userMeta.establishment || 'Dirección de Salud / Comunal',
            healthService: userMeta.healthService || 'SSMN (Metropolitano Norte)',
            avatar,
            authProvider: 'email',
            emailVerified: true,
          };

          setCurrentUser(userToSet);
          setIsAuthenticated(true);
          upsertUserInSupabase(userToSet).catch((err) => console.warn('Sync user error on OTP verify:', err));
          setPendingVerificationEmail(null);
          setAuthScreen('login');
          showToast('¡Correo electrónico verificado con éxito! Tu cuenta está activa.', 'success');
          return { success: true };
        }
      } catch (err) {
        console.warn('Supabase verifyOtp attempt:', err);
      }
    }

    const account = registeredAccounts.find((a) => a.email.toLowerCase() === targetEmail);
    if (!account) {
      return { success: false, error: 'Cuenta no encontrada.' };
    }

    if (code && account.verificationCode && code.trim() !== account.verificationCode.trim()) {
      return { success: false, error: 'El código de verificación ingresado no coincide.' };
    }

    const updatedAccount: AuthAccount = {
      ...account,
      emailVerified: true,
      verificationCode: undefined,
    };

    setRegisteredAccounts((prev) => prev.map((a) => (a.id === account.id ? updatedAccount : a)));
    setPendingVerificationEmail(null);

    const userToSet: User = {
      id: updatedAccount.id,
      name: updatedAccount.name,
      email: updatedAccount.email,
      role: updatedAccount.role,
      title: updatedAccount.title,
      comuna: updatedAccount.comuna,
      establishment: updatedAccount.establishment,
      healthService: updatedAccount.healthService,
      avatar: updatedAccount.avatar,
      photoUrl: updatedAccount.photoUrl,
      authProvider: updatedAccount.authProvider,
      emailVerified: true,
    };

    setCurrentUser(userToSet);
    try {
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(userToSet));
      localStorage.setItem('quilicura_is_authenticated', 'true');
    } catch (e) {
      console.error(e);
    }
    setIsAuthenticated(true);
    setAuthScreen('login');
    showToast('¡Correo electrónico verificado con éxito! Tu cuenta está activa.', 'success');

    return { success: true };
  };

  const resendVerificationLink = async (email: string): Promise<{ success: boolean; error?: string; verificationCode?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase is configured, call supabase.auth.resend
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: cleanEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          console.warn('Supabase resend notification:', error.message);
          const msg = error.message.toLowerCase();
          if (msg.includes('rate') || msg.includes('too many') || msg.includes('seconds')) {
            return { success: false, error: 'Por favor espera unos segundos antes de solicitar otro reenvío.' };
          }
          // If network / fetch failed, proceed smoothly to local code regeneration
        } else {
          setPendingVerificationEmail(cleanEmail);
          showToast(`Correo de confirmación reenviado a ${cleanEmail}`, 'info');
          return { success: true };
        }
      } catch (err: any) {
        console.warn('Supabase resend exception, using local generator:', err?.message || err);
      }
    }

    // 2. Fallback / Local code regeneration
    const account = registeredAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (account) {
      setRegisteredAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? { ...a, verificationCode: newCode } : a))
      );
    }

    setPendingVerificationEmail(cleanEmail);
    showToast(`Nuevo código de confirmación enviado a ${cleanEmail}`, 'info');

    return { success: true, verificationCode: newCode };
  };

  const sendPasswordResetLink = async (email: string): Promise<{ success: boolean; error?: string; resetToken?: string; passwordSent?: boolean; userPassword?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Supabase Auth resetPasswordForEmail call
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const targetRedirect = typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/callback?type=recovery` 
          : undefined;

        const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: targetRedirect,
        });

        if (error) {
          console.warn('Supabase resetPasswordForEmail info:', error.message);
          const msg = error.message.toLowerCase();
          if (msg.includes('rate') || msg.includes('too many') || msg.includes('over_email_send_rate_limit')) {
            return { success: false, error: 'Por favor espera unos segundos antes de solicitar otro correo de recuperación.' };
          }
          if (msg.includes('invalid') || msg.includes('not found')) {
            return { success: false, error: 'No pudimos procesar la solicitud para este correo. Verifica el formato e inténtalo nuevamente.' };
          }
        } else {
          setPendingResetEmail(cleanEmail);
          showToast(`Enlace de restablecimiento enviado a ${cleanEmail}`, 'success');
          return { success: true, passwordSent: true };
        }
      } catch (err: any) {
        console.warn('Supabase resetPasswordForEmail error, falling back:', err?.message || err);
      }
    }

    let account = registeredAccounts.find((a) => a.email.toLowerCase() === cleanEmail);
    const resetToken = `tok_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    if (!account) {
      // Auto-register default account for this email so they always receive access
      const nameFromEmail = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);
      const newAcc: AuthAccount = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: formattedName,
        email: cleanEmail,
        username: cleanEmail.split('@')[0],
        passwordHash: 'salud2026',
        role: 'referente',
        title: 'Referente Comunal de Salud',
        comuna: 'Quilicura (DISAM)',
        establishment: 'Dirección de Salud / Comunal',
        healthService: 'SSMN (Metropolitano Norte)',
        avatar: cleanEmail.charAt(0).toUpperCase(),
        authProvider: 'email',
        emailVerified: true,
        resetToken,
        createdAt: new Date().toISOString(),
      };
      setRegisteredAccounts((prev) => [...prev, newAcc]);
      account = newAcc;
    } else {
      setRegisteredAccounts((prev) =>
        prev.map((a) => (a.id === account!.id ? { ...a, resetToken } : a))
      );
    }

    setPendingResetEmail(cleanEmail);
    showToast(`Enlace de restablecimiento enviado a ${cleanEmail}`, 'success');

    return { 
      success: true, 
      resetToken, 
      passwordSent: true, 
      userPassword: account.passwordHash || 'salud2026' 
    };
  };

  const resetUserPassword = async (newPassword: string, email?: string, token?: string): Promise<{ success: boolean; error?: string }> => {
    const targetEmail = (email || pendingResetEmail || '').trim().toLowerCase();

    // 1. If Supabase is configured, call updateUser
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        setPendingResetEmail(null);
        setAuthScreen('login');
        showToast('¡Contraseña restablecida con éxito! Inicia sesión con tu nueva contraseña.', 'success');
        return { success: true };
      } catch (err: any) {
        console.error('Supabase updateUser password error:', err);
      }
    }

    if (!targetEmail) {
      return { success: false, error: 'Correo no especificado para restablecer la contraseña.' };
    }

    const account = registeredAccounts.find((a) => a.email.toLowerCase() === targetEmail);
    if (!account) {
      return { success: false, error: 'Cuenta no encontrada.' };
    }

    if (token && account.resetToken && token !== account.resetToken) {
      return { success: false, error: 'El token de recuperación ha caducado o no es válido.' };
    }

    setRegisteredAccounts((prev) =>
      prev.map((a) =>
        a.id === account.id
          ? { ...a, passwordHash: newPassword, resetToken: undefined }
          : a
      )
    );
    setPendingResetEmail(null);
    setAuthScreen('login');
    showToast('¡Contraseña restablecida con éxito! Inicia sesión con tu nueva contraseña.', 'success');

    return { success: true };
  };

  const changeUserPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!newPassword || newPassword.length < 8) {
      const err = 'La nueva contraseña debe tener al menos 8 caracteres.';
      showToast(err, 'error');
      return { success: false, error: err };
    }

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          showToast(`Error al cambiar contraseña: ${error.message}`, 'error');
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.warn('Error changing password in Supabase:', err?.message);
        showToast(err?.message || 'Error al cambiar contraseña', 'error');
        return { success: false, error: err?.message };
      }
    }

    // Also update registered accounts cache if exists
    if (currentUser.email) {
      setRegisteredAccounts((prev) =>
        prev.map((a) =>
          a.email.toLowerCase() === currentUser.email.toLowerCase()
            ? { ...a, passwordHash: newPassword }
            : a
        )
      );
    }

    showToast('¡Contraseña actualizada exitosamente en Supabase!', 'success');
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabase();
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }

    setIsAuthenticated(false);
    setCurrentUser(CURRENT_USER);
    try {
      localStorage.setItem('quilicura_is_authenticated', 'false');
      localStorage.removeItem(`${STORAGE_KEY}_current_user`);
    } catch (e) {
      console.error(e);
    }
    setAuthScreen('login');
    showToast('Has cerrado sesión correctamente.', 'info');
  };


  const updateCurrentUser = async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    let avatar = updates.avatar || currentUser.avatar;
    if (updates.name && (!updates.avatar || updates.avatar === currentUser.avatar)) {
      const parts = updates.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        avatar = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      } else if (parts.length === 1 && parts[0].length > 0) {
        avatar = parts[0].substring(0, 2).toUpperCase();
      }
    }

    const nextUser: User = {
      ...currentUser,
      ...updates,
      ...(avatar ? { avatar } : {}),
    };

    setCurrentUser(nextUser);

    try {
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(nextUser));
    } catch (e) {
      console.error(e);
    }

    // Also update registered accounts cache if exists
    const prevEmail = currentUser.email?.toLowerCase();
    const newEmail = nextUser.email?.toLowerCase();
    setRegisteredAccounts((prev) => {
      const updated = prev.map((a) => {
        const matches =
          (prevEmail && a.email.toLowerCase() === prevEmail) ||
          (newEmail && a.email.toLowerCase() === newEmail) ||
          (a.id && nextUser.id && a.id === nextUser.id);
        if (matches) {
          return {
            ...a,
            name: nextUser.name,
            email: nextUser.email,
            role: nextUser.role,
            title: nextUser.title,
            phone: nextUser.phone,
            phonePrefix: nextUser.phonePrefix,
            instagram: nextUser.instagram,
            country: nextUser.country,
            photoUrl: nextUser.photoUrl,
            avatar: nextUser.avatar,
            budgetYear: nextUser.budgetYear,
          };
        }
        return a;
      });
      try {
        localStorage.setItem('quilicura_auth_accounts', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Direct sync to Supabase (public.users & auth user_metadata)
    let syncResult: { success: boolean; error?: string } = { success: true };
    if (isSupabaseConfigured()) {
      syncResult = await upsertUserInSupabase(nextUser);
      if (!syncResult.success) {
        console.warn('Advertencia al sincronizar usuario con Supabase:', syncResult.error);
      }
    }

    showToast('Perfil de usuario actualizado exitosamente', 'success');
    return syncResult;
  };

  const updateEstablishment = (id: string, updates: Partial<Establishment>) => {
    const existing = establishments.find((e) => e.id === id);
    if (!existing) return;
    const updatedEst: Establishment = { ...existing, ...updates };

    setEstablishments((prev) => {
      const next = prev.map((e) => (e.id === id ? updatedEst : e));
      try {
        localStorage.setItem(`${STORAGE_KEY}_establishments`, JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });

    if (isSupabaseConfigured()) {
      upsertEstablishmentInSupabase(updatedEst).catch((err) =>
        console.warn('Error syncing establishment update to Supabase:', err?.message)
      );
    }

    showToast('Establecimiento actualizado exitosamente', 'success');
  };

  const addEstablishment = (estData: Omit<Establishment, 'id'>) => {
    const newEst: Establishment = {
      ...estData,
      id: `est_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    setEstablishments((prev) => {
      const next = [...prev, newEst];
      try {
        localStorage.setItem(`${STORAGE_KEY}_establishments`, JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });

    if (isSupabaseConfigured()) {
      upsertEstablishmentInSupabase(newEst).catch((err) =>
        console.warn('Error syncing new establishment to Supabase:', err?.message)
      );
    }

    showToast(`Establecimiento "${newEst.name}" agregado`, 'success');
    return newEst;
  };

  const deleteEstablishment = (id: string) => {
    setEstablishments((prev) => {
      const next = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem(`${STORAGE_KEY}_establishments`, JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });

    if (isSupabaseConfigured()) {
      deleteEstablishmentFromSupabase(id).catch((err) =>
        console.warn('Error deleting establishment from Supabase:', err?.message)
      );
    }

    showToast('Establecimiento eliminado', 'warning');
  };

  // Primary Entities
  const [hrRecords, setHrRecords] = useState<HRRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_hr`);
      return saved ? JSON.parse(saved) : INITIAL_HR_RECORDS;
    } catch { return INITIAL_HR_RECORDS; }
  });

  const [indicators, setIndicators] = useState<Indicator[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_ind`);
      if (!saved) return INITIAL_INDICATORS;
      const parsed: Indicator[] = JSON.parse(saved);
      // Migrate old IND-XXX-XX format to Indicador 1, Indicador 2... and ensure numeric integrity
      const progCounts: Record<string, number> = {};
      return parsed.map((ind) => {
        const initialMatch = INITIAL_INDICATORS.find(
          (i) => i.id === ind.id || i.id === ind.id?.toLowerCase() || i.code === ind.code || (ind.name && i.name.toLowerCase().includes(ind.name.toLowerCase().slice(0, 15)))
        );
        const isOldCode = /^IND[-_][A-Z0-9]+[-_]\d+$/i.test(ind.code || '');
        const code = isOldCode
          ? (() => {
              const pId = ind.programId || 'default';
              progCounts[pId] = (progCounts[pId] || 0) + 1;
              return `Indicador ${progCounts[pId]}`;
            })()
          : (ind.code || 'Indicador 1');

        const annualTarget = (typeof ind.annualTarget === 'number' && !isNaN(ind.annualTarget) && ind.annualTarget > 0)
          ? ind.annualTarget
          : (parseFloat(ind.annualTarget as any) || initialMatch?.annualTarget || ind.periodTarget || 90);

        const periodTarget = (typeof ind.periodTarget === 'number' && !isNaN(ind.periodTarget) && ind.periodTarget > 0)
          ? ind.periodTarget
          : (parseFloat(ind.periodTarget as any) || initialMatch?.periodTarget || annualTarget);

        const currentResult = (typeof ind.currentResult === 'number' && !isNaN(ind.currentResult))
          ? ind.currentResult
          : (parseFloat(ind.currentResult as any) || initialMatch?.currentResult || 78.5);

        const corte1Target = (ind.corte1?.target !== undefined && !isNaN(Number(ind.corte1?.target)))
          ? Number(ind.corte1.target)
          : (initialMatch?.corte1?.target ?? periodTarget);

        const corte1Result = (ind.corte1?.result !== undefined && !isNaN(Number(ind.corte1?.result)))
          ? Number(ind.corte1.result)
          : (initialMatch?.corte1?.result ?? currentResult);

        const corte2Target = (ind.corte2?.target !== undefined && !isNaN(Number(ind.corte2?.target)))
          ? Number(ind.corte2.target)
          : (initialMatch?.corte2?.target ?? annualTarget);

        const corte2Result = (ind.corte2?.result !== undefined && !isNaN(Number(ind.corte2?.result)))
          ? Number(ind.corte2.result)
          : (initialMatch?.corte2?.result ?? currentResult);

        const pesoRelativo = (typeof ind.pesoRelativo === 'number' && !isNaN(ind.pesoRelativo) && ind.pesoRelativo > 0)
          ? ind.pesoRelativo
          : (parseFloat(ind.pesoRelativo as any) || initialMatch?.pesoRelativo || 50);

        return {
          ...ind,
          code,
          unit: ind.unit || '%',
          annualTarget,
          periodTarget,
          currentResult,
          pesoRelativo,
          corte1: {
            target: corte1Target,
            result: corte1Result,
            date: ind.corte1?.date || initialMatch?.corte1?.date || '2026-07-31',
            source: ind.corte1?.source || initialMatch?.corte1?.source || 'REM / Rayen',
          },
          corte2: {
            target: corte2Target,
            result: corte2Result,
            date: ind.corte2?.date || initialMatch?.corte2?.date || '2026-12-31',
            source: ind.corte2?.source || initialMatch?.corte2?.source || 'REM / Rayen',
          },
        };
      });
    } catch { return INITIAL_INDICATORS; }
  });

  const [financialPeriods, setFinancialPeriods] = useState<FinancialPeriod[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_fin`);
      return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_PERIODS;
    } catch { return INITIAL_FINANCIAL_PERIODS; }
  });

  const [budgetComponents, setBudgetComponents] = useState<BudgetComponent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_budget_comp`);
      return saved ? JSON.parse(saved) : INITIAL_BUDGET_COMPONENTS;
    } catch { return INITIAL_BUDGET_COMPONENTS; }
  });

  const [budget2025Notes, setBudget2025Notes] = useState<Record<string, ProgramBudget2025Note>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_budget_2025`);
      return saved ? JSON.parse(saved) : INITIAL_BUDGET_2025_NOTES;
    } catch { return INITIAL_BUDGET_2025_NOTES; }
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_pur`);
      if (!saved) return INITIAL_PURCHASES;
      const parsed: any[] = JSON.parse(saved);
      return parsed.map((p) => ({
        ...p,
        category: p.category || 'Insumos de rehabilitación',
        status: p.status === 'pendiente' ? 'solicitado' : p.status,
      }));
    } catch { return INITIAL_PURCHASES; }
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_meet`);
      return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
    } catch { return INITIAL_MEETINGS; }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tasks`);
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch { return INITIAL_TASKS; }
  });

  const [taskCategories, setTaskCategories] = useState<TaskCategory[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_task_categories`);
      return saved ? JSON.parse(saved) : INITIAL_TASK_CATEGORIES;
    } catch { return INITIAL_TASK_CATEGORIES; }
  });

  const [emails, setEmails] = useState<PendingEmail[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_emails`);
      const raw: PendingEmail[] = saved ? JSON.parse(saved) : INITIAL_EMAILS;
      return raw.map((e) => ({
        ...e,
        type: e.type || 'correo_recibido',
        status: normalizeCommunicationStatus(e.status),
        followUps: e.followUps || [],
        attachments: e.attachments || [],
      }));
    } catch { return INITIAL_EMAILS; }
  });

  const [pendingEmailResolutionPrompt, setPendingEmailResolutionPrompt] = useState<{
    emailId: string;
    taskId: string;
    emailSubject: string;
  } | null>(null);

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_questions`);
      return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
    } catch { return INITIAL_QUESTIONS; }
  });

  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_knowledge`);
      const raw: any[] = saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE;
      return raw.map((k) => {
        const pIds = Array.isArray(k.programIds) && k.programIds.length > 0
          ? k.programIds
          : k.programId ? [k.programId] : [];
        return {
          ...k,
          category: k.category || 'Criterio técnico',
          status: k.status || 'vigente',
          source: k.source || 'Experiencia operativa',
          programIds: pIds,
          tags: Array.isArray(k.tags) ? k.tags : [],
          attachments: Array.isArray(k.attachments) ? k.attachments : [],
          history: Array.isArray(k.history) ? k.history : [],
          isPinned: Boolean(k.isPinned || k.isFeatured),
          isFeatured: Boolean(k.isPinned || k.isFeatured),
        };
      });
    } catch { return INITIAL_KNOWLEDGE; }
  });

  const [knowledgeCategories, setKnowledgeCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_knowledge_cats`);
      return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_CATEGORIES;
    } catch { return INITIAL_KNOWLEDGE_CATEGORIES; }
  });

  const [knowledgeSources, setKnowledgeSources] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_knowledge_sources`);
      return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE_SOURCES;
    } catch { return INITIAL_KNOWLEDGE_SOURCES; }
  });

  const [eleamCases, setEleamCases] = useState<EleamCase[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_eleam`);
      return saved ? JSON.parse(saved) : INITIAL_ELEAM_CASES;
    } catch { return INITIAL_ELEAM_CASES; }
  });

  const [empamRecords, setEmpamRecords] = useState<EmpamRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_empam`);
      return saved ? JSON.parse(saved) : INITIAL_EMPAM_RECORDS;
    } catch { return INITIAL_EMPAM_RECORDS; }
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_contacts`);
      const raw: Contact[] = saved ? JSON.parse(saved) : INITIAL_CONTACTS;
      return raw.map((c) => {
        let cat = c.category || c.contactType || 'Otro';
        if (cat === 'Establecimiento APS') cat = 'APS';
        if (cat === 'Municipalidad / DISAM' || cat === 'Municipalidad / DESAM') cat = 'DESAM';
        return {
          ...c,
          contactType: cat,
          category: cat,
        };
      });
    } catch { return INITIAL_CONTACTS; }
  });

  const [contactCategories, setContactCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_contact_cats`);
      const list: string[] = saved ? JSON.parse(saved) : INITIAL_CONTACT_CATEGORIES;
      const normalized: string[] = [];
      list.forEach((c) => {
        if (c === 'Establecimiento APS') {
          if (!normalized.includes('APS')) normalized.push('APS');
        } else if (c === 'Municipalidad / DISAM' || c === 'Municipalidad / DESAM') {
          if (!normalized.includes('Municipalidad')) normalized.push('Municipalidad');
          if (!normalized.includes('DESAM')) normalized.push('DESAM');
        } else {
          if (!normalized.includes(c)) normalized.push(c);
        }
      });
      if (!normalized.includes('APS')) normalized.push('APS');
      if (!normalized.includes('Municipalidad')) normalized.push('Municipalidad');
      if (!normalized.includes('DESAM')) normalized.push('DESAM');
      return normalized;
    } catch { return INITIAL_CONTACT_CATEGORIES; }
  });

  const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_documents`);
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch { return INITIAL_DOCUMENTS; }
  });

  const [documentCategories, setDocumentCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_doc_cats`);
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENT_CATEGORIES;
    } catch { return INITIAL_DOCUMENT_CATEGORIES; }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
      return saved ? JSON.parse(saved) : [
        {
          id: 'log_01',
          entity: 'Sistema',
          entityId: 'init',
          action: 'crear',
          details: 'Centro Operativo de Salud Quilicura inicializado con catálogo PRAPS 2026',
          user: 'Klaus Bauer',
          timestamp: new Date().toISOString(),
        }
      ];
    } catch { return []; }
  });

  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_dismissed_alerts`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [resolvedAlertIds, setResolvedAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_resolved_alerts`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [attachments, setAttachments] = useState<FileAttachment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_attachments`);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist entities
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_programs`, JSON.stringify(programs)); }, [programs]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_hr`, JSON.stringify(hrRecords)); }, [hrRecords]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_ind`, JSON.stringify(indicators)); }, [indicators]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_fin`, JSON.stringify(financialPeriods)); }, [financialPeriods]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_budget_comp`, JSON.stringify(budgetComponents)); }, [budgetComponents]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_budget_2025`, JSON.stringify(budget2025Notes)); }, [budget2025Notes]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_pur`, JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_meet`, JSON.stringify(meetings)); }, [meetings]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_task_categories`, JSON.stringify(taskCategories)); }, [taskCategories]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_emails`, JSON.stringify(emails)); }, [emails]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_questions`, JSON.stringify(questions)); }, [questions]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_knowledge`, JSON.stringify(knowledge)); }, [knowledge]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_knowledge_cats`, JSON.stringify(knowledgeCategories)); }, [knowledgeCategories]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_knowledge_sources`, JSON.stringify(knowledgeSources)); }, [knowledgeSources]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_eleam`, JSON.stringify(eleamCases)); }, [eleamCases]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_empam`, JSON.stringify(empamRecords)); }, [empamRecords]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_contacts`, JSON.stringify(contacts)); }, [contacts]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_contact_cats`, JSON.stringify(contactCategories)); }, [contactCategories]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_documents`, JSON.stringify(documents)); }, [documents]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_doc_cats`, JSON.stringify(documentCategories)); }, [documentCategories]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs)); }, [auditLogs]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_dismissed_alerts`, JSON.stringify(dismissedAlertIds)); }, [dismissedAlertIds]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_resolved_alerts`, JSON.stringify(resolvedAlertIds)); }, [resolvedAlertIds]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_attachments`, JSON.stringify(attachments)); }, [attachments]);
  useEffect(() => { localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds)); }, [thresholds]);

  // Toast Helper
  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // =========================================================================
  // SUPABASE DATABASE STATE & REALTIME SYNCHRONIZATION
  // =========================================================================
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(() => isSupabaseConfigured());
  const [supabaseDbStatus, setSupabaseDbStatus] = useState<SupabaseDbStatus | null>(null);
  const [supabaseSyncState, setSupabaseSyncState] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [supabaseLastSyncTime, setSupabaseLastSyncTime] = useState<string | null>(null);
  const [supabaseSyncError, setSupabaseSyncError] = useState<string | null>(null);

  const testSupabaseDatabaseConnection = useCallback(async (): Promise<SupabaseDbStatus> => {
    if (!isSupabaseConfigured()) {
      const status: SupabaseDbStatus = {
        connected: false,
        projectId: '',
        url: '',
        latencyMs: 0,
        tables: {},
        totalRows: 0,
        error: 'Servicio en la nube no configurado en este entorno. Configura las variables en Vercel.',
        checkedAt: new Date().toISOString(),
      };
      setSupabaseDbStatus(status);
      setIsSupabaseConnected(false);
      setSupabaseSyncState('idle');
      return status;
    }

    setSupabaseSyncState('syncing');
    try {
      const status = await checkSupabaseDatabaseStatus();
      setSupabaseDbStatus(status);
      setIsSupabaseConnected(status.connected);
      if (status.connected) {
        setSupabaseSyncState('synced');
        setSupabaseSyncError(null);
        showToast('Conexión con la base de datos verificada exitosamente', 'success');
      } else {
        setSupabaseSyncState('error');
        setSupabaseSyncError(status.error || 'No se pudo conectar a la base de datos');
        showToast('Base de datos: ' + (status.error || 'Verifica el estado del servicio en la nube'), 'info');
      }
      return status;
    } catch (err: any) {
      const msg = err?.message || 'Error de conexión';
      const fallbackStatus: SupabaseDbStatus = {
        connected: false,
        projectId: '',
        url: '',
        latencyMs: 0,
        tables: {},
        totalRows: 0,
        error: msg,
        checkedAt: new Date().toISOString(),
      };
      setSupabaseDbStatus(fallbackStatus);
      setSupabaseSyncState('error');
      setSupabaseSyncError(msg);
      setIsSupabaseConnected(false);
      return fallbackStatus;
    }
  }, []);

  const syncWithSupabase = useCallback(async (direction: 'pull' | 'push' | 'both' = 'pull') => {
    if (!isSupabaseConfigured()) {
      showToast('Servicio cloud no configurado en este entorno. Los datos se mantienen en almacenamiento local seguro.', 'info');
      setSupabaseSyncState('idle');
      return;
    }

    setSupabaseSyncState('syncing');
    try {
      if (direction === 'pull' || direction === 'both') {
        const data = await pullAllFromSupabase();
        if (data.programs && data.programs.length > 0) {
          setPrograms((prev) => {
            const map = new Map(prev.map((p) => [p.id, p]));
            data.programs.forEach((p) => map.set(p.id, p));
            return Array.from(map.values());
          });
        }
        if (data.tasks && data.tasks.length > 0) {
          setTasks((prev) => {
            const map = new Map(prev.map((t) => [t.id, t]));
            data.tasks.forEach((t) => map.set(t.id, t));
            return Array.from(map.values());
          });
        }
        if (data.purchases && data.purchases.length > 0) {
          setPurchases((prev) => {
            const map = new Map(prev.map((p) => [p.id, p]));
            data.purchases.forEach((p) => map.set(p.id, p));
            return Array.from(map.values());
          });
        }
        if (data.meetings && data.meetings.length > 0) {
          setMeetings((prev) => {
            const map = new Map(prev.map((m) => [m.id, m]));
            data.meetings.forEach((m) => map.set(m.id, m));
            return Array.from(map.values());
          });
        }
        if (data.indicators && data.indicators.length > 0) {
          setIndicators((prev) => {
            const map = new Map(prev.map((i) => [i.id, i]));
            data.indicators.forEach((i) => map.set(i.id, i));
            return Array.from(map.values());
          });
        }
        if (data.contacts && data.contacts.length > 0) {
          setContacts((prev) => {
            const map = new Map(prev.map((c) => [c.id, c]));
            data.contacts.forEach((c) => map.set(c.id, c));
            return Array.from(map.values());
          });
        }
        if (data.questions && data.questions.length > 0) {
          setQuestions((prev) => {
            const map = new Map(prev.map((q) => [q.id, q]));
            data.questions.forEach((q) => map.set(q.id, q));
            return Array.from(map.values());
          });
        }
        if (data.establishments && data.establishments.length > 0) {
          setEstablishments((prev) => {
            const map = new Map(prev.map((e) => [e.id, e]));
            data.establishments.forEach((e) => map.set(e.id, e));
            return Array.from(map.values());
          });
        }
        if (data.financialPeriods && data.financialPeriods.length > 0) {
          setFinancialPeriods((prev) => {
            const map = new Map(prev.map((f) => [f.id, f]));
            data.financialPeriods.forEach((f) => map.set(f.id, f));
            return Array.from(map.values());
          });
        }
        if (data.budgetComponents && data.budgetComponents.length > 0) {
          setBudgetComponents((prev) => {
            const map = new Map(prev.map((b) => [b.id, b]));
            data.budgetComponents.forEach((b) => map.set(b.id, b));
            return Array.from(map.values());
          });
        }
      }

      const nowIso = new Date().toISOString();
      setSupabaseLastSyncTime(nowIso);
      setSupabaseSyncState('synced');
      setSupabaseSyncError(null);
      setIsSupabaseConnected(true);
      showToast('Sincronización con la nube completada con éxito', 'success');
    } catch (err: any) {
      setSupabaseSyncState('error');
      setSupabaseSyncError(err?.message || 'Error de sincronización');
      showToast('Error al sincronizar con la nube: ' + (err?.message || ''), 'warning');
    }
  }, []);

  const handlePushAllDataToSupabase = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      showToast('Servicio cloud no configurado en este entorno. Configura las variables para subir.', 'info');
      setSupabaseSyncState('idle');
      return { success: false, errors: ['Servicio en la nube no configurado en este entorno'], insertedCount: 0 };
    }

    setSupabaseSyncState('syncing');
    try {
      const res = await pushAllToSupabase({
        programs,
        tasks,
        purchases,
        meetings,
        indicators,
        contacts,
        questions,
        establishments,
        financialPeriods,
        budgetComponents,
      });
      if (res.success) {
        setSupabaseSyncState('synced');
        showToast(`Datos locales respaldados en la nube (${res.insertedCount} registros)`, 'success');
      } else {
        setSupabaseSyncState('error');
        showToast(`Sincronización con avisos: ${res.errors.length} fallos`, 'warning');
      }
      return res;
    } catch (err: any) {
      setSupabaseSyncState('error');
      showToast('Error al respaldar datos en la nube', 'error');
      return { success: false, errors: [err?.message || 'Error desconocido'], insertedCount: 0 };
    }
  }, [programs, tasks, purchases, meetings, indicators, contacts, questions, establishments, financialPeriods, budgetComponents]);

  // Initial database sync and real-time subscription
  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured()) {
      setIsSupabaseConnected(false);
      return;
    }

    const initDb = async () => {
      try {
        const status = await checkSupabaseDatabaseStatus();
        if (!isMounted) return;
        setSupabaseDbStatus(status);
        setIsSupabaseConnected(status.connected);

        if (status.connected) {
          const data = await pullAllFromSupabase();
          if (!isMounted) return;

          if (data.programs?.length) {
            setPrograms((prev) => {
              const map = new Map(prev.map((p) => [p.id, p]));
              data.programs.forEach((p) => map.set(p.id, p));
              return Array.from(map.values());
            });
          }
          if (data.tasks?.length) {
            setTasks((prev) => {
              const map = new Map(prev.map((t) => [t.id, t]));
              data.tasks.forEach((t) => map.set(t.id, t));
              return Array.from(map.values());
            });
          }
          if (data.purchases?.length) {
            setPurchases((prev) => {
              const map = new Map(prev.map((p) => [p.id, p]));
              data.purchases.forEach((p) => map.set(p.id, p));
              return Array.from(map.values());
            });
          }
          if (data.meetings?.length) {
            setMeetings((prev) => {
              const map = new Map(prev.map((m) => [m.id, m]));
              data.meetings.forEach((m) => map.set(m.id, m));
              return Array.from(map.values());
            });
          }
          if (data.indicators?.length) {
            setIndicators((prev) => {
              const map = new Map(prev.map((i) => [i.id, i]));
              data.indicators.forEach((i) => map.set(i.id, i));
              return Array.from(map.values());
            });
          }
          if (data.contacts?.length) {
            setContacts((prev) => {
              const map = new Map(prev.map((c) => [c.id, c]));
              data.contacts.forEach((c) => map.set(c.id, c));
              return Array.from(map.values());
            });
          }
          if (data.questions?.length) {
            setQuestions((prev) => {
              const map = new Map(prev.map((q) => [q.id, q]));
              data.questions.forEach((q) => map.set(q.id, q));
              return Array.from(map.values());
            });
          }
          if (data.establishments?.length) {
            setEstablishments((prev) => {
              const map = new Map(prev.map((e) => [e.id, e]));
              data.establishments.forEach((e) => map.set(e.id, e));
              return Array.from(map.values());
            });
          }
          if (data.financialPeriods?.length) {
            setFinancialPeriods((prev) => {
              const map = new Map(prev.map((f) => [f.id, f]));
              data.financialPeriods.forEach((f) => map.set(f.id, f));
              return Array.from(map.values());
            });
          }
          if (data.budgetComponents?.length) {
            setBudgetComponents((prev) => {
              const map = new Map(prev.map((b) => [b.id, b]));
              data.budgetComponents.forEach((b) => map.set(b.id, b));
              return Array.from(map.values());
            });
          }

          setSupabaseLastSyncTime(new Date().toISOString());
          setSupabaseSyncState('synced');
        }
      } catch (err) {
        console.warn('Error fetching Supabase initial records:', err);
      }
    };

    initDb();

    // Subscribe to Postgres database changes via Supabase Realtime
    const unsubscribe = subscribeToSupabaseDatabase((event) => {
      console.log('Realtime Supabase event received:', event.table, event.eventType);
      // Auto-refresh when external changes arrive
      if (event.table === 'tasks') {
        pullAllFromSupabase().then((d) => {
          if (d.tasks?.length) setTasks(d.tasks);
        }).catch(() => {});
      } else if (event.table === 'purchases') {
        pullAllFromSupabase().then((d) => {
          if (d.purchases?.length) setPurchases(d.purchases);
        }).catch(() => {});
      } else if (event.table === 'meetings') {
        pullAllFromSupabase().then((d) => {
          if (d.meetings?.length) setMeetings(d.meetings);
        }).catch(() => {});
      } else if (event.table === 'indicators') {
        pullAllFromSupabase().then((d) => {
          if (d.indicators?.length) setIndicators(d.indicators);
        }).catch(() => {});
      } else if (event.table === 'contacts') {
        pullAllFromSupabase().then((d) => {
          if (d.contacts?.length) setContacts(d.contacts);
        }).catch(() => {});
      } else if (event.table === 'questions') {
        pullAllFromSupabase().then((d) => {
          if (d.questions?.length) setQuestions(d.questions);
        }).catch(() => {});
      } else if (event.table === 'health_programs') {
        pullAllFromSupabase().then((d) => {
          if (d.programs?.length) setPrograms(d.programs);
        }).catch(() => {});
      } else if (event.table === 'establishments') {
        pullAllFromSupabase().then((d) => {
          if (d.establishments?.length) setEstablishments(d.establishments);
        }).catch(() => {});
      } else if (event.table === 'financial_periods') {
        pullAllFromSupabase().then((d) => {
          if (d.financialPeriods?.length) setFinancialPeriods(d.financialPeriods);
        }).catch(() => {});
      } else if (event.table === 'budget_components') {
        pullAllFromSupabase().then((d) => {
          if (d.budgetComponents?.length) setBudgetComponents(d.budgetComponents);
        }).catch(() => {});
      } else if (event.table === 'users' && event.newRecord) {
        if (event.newRecord.email && currentUser.email && event.newRecord.email.toLowerCase() === currentUser.email.toLowerCase()) {
          setCurrentUser((prev) => ({
            ...prev,
            name: event.newRecord.name || prev.name,
            phone: event.newRecord.phone !== undefined ? event.newRecord.phone : prev.phone,
            phonePrefix: event.newRecord.phone_prefix !== undefined ? event.newRecord.phone_prefix : prev.phonePrefix,
            instagram: event.newRecord.instagram !== undefined ? event.newRecord.instagram : prev.instagram,
            country: event.newRecord.country || prev.country,
            role: event.newRecord.role || prev.role,
            title: event.newRecord.title || prev.title,
            comuna: event.newRecord.comuna || prev.comuna,
            establishment: event.newRecord.establishment || prev.establishment,
            healthService: event.newRecord.health_service || prev.healthService,
            budgetYear: event.newRecord.budget_year || prev.budgetYear,
          }));
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const logAudit = (entity: string, entityId: string, action: AuditLog['action'], details: string) => {
    const newLog: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      entity,
      entityId,
      action,
      details,
      user: currentUser.name,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 200)]);
  };

  // Auto-detection of today and task dates (Current operational simulation date: 2026-08-15)
  const todayStr = '2026-08-15'; // Base operational anchor

  // Calculate dynamic Alerts Engine (Centralized rule engine without duplicates)
  const alerts = useMemo<Alert[]>(() => {
    const generated: Alert[] = [];

    // 1. Tareas Vencidas y Críticas
    tasks.filter((t) => !t.archived && t.status !== 'completada').forEach((t) => {
      const isOverdue = t.dueDate < todayStr;
      if (isOverdue) {
        const isCritical = t.priority === 'critica';
        const alertId = `alt_task_overdue_${t.id}`;
        generated.push({
          id: alertId,
          type: isCritical ? 'tarea_critica_vencida' : 'tarea_vencida',
          severity: isCritical ? 'critica' : 'alta',
          programId: t.programId,
          subprogramId: t.subprogramId,
          originEntity: 'task',
          originId: t.id,
          title: isCritical ? 'Tarea Crítica Vencida' : 'Tarea Vencida',
          message: `"${t.title}" debió completarse el ${t.dueDate} (Resp: ${t.responsible})`,
          date: t.dueDate,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: t.createdAt,
        });
      } else if (t.dueDate === todayStr) {
        const alertId = `alt_task_today_${t.id}`;
        generated.push({
          id: alertId,
          type: 'plazo_cercano',
          severity: t.priority === 'critica' || t.priority === 'alta' ? 'alta' : 'media',
          programId: t.programId,
          subprogramId: t.subprogramId,
          originEntity: 'task',
          originId: t.id,
          title: 'Tarea para Hoy',
          message: `"${t.title}" vence hoy (Resp: ${t.responsible})`,
          date: t.dueDate,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: t.createdAt,
        });
      }
    });

    // 2. Compras con problema, atrasadas o con alertas operativas de recepción/facturación
    purchases.filter((p) => !p.archived).forEach((p) => {
      const macro = getPurchaseEffectiveMacroState(p);
      if (macro === 'completado') return;

      const pAlerts = getPurchaseAlerts(p);
      pAlerts.forEach((pa) => {
        const alertId = `alt_pur_${pa.type}_${p.id}`;
        generated.push({
          id: alertId,
          type: pa.type === 'bloqueo' || pa.type === 'rechazada' ? 'compra_con_problema' : 'compra_atrasada',
          severity: pa.severity,
          programId: p.programId,
          subprogramId: p.subprogramId,
          originEntity: 'purchase',
          originId: p.id,
          title: pa.title,
          message: `${p.category || p.itemOrService}: ${pa.description}`,
          date: p.receptionDate || p.requiredDate || todayStr,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: p.updatedAt,
        });
      });

      // Atraso de fecha clave si no tiene recepción conforme
      if (p.requiredDate < todayStr && p.receptionStatus !== 'conforme' && !p.problemReason) {
        const alertId = `alt_pur_over_${p.id}`;
        const dateLabel = getPurchaseDateFieldLabel(p.modalidadCompra);
        generated.push({
          id: alertId,
          type: 'compra_atrasada',
          severity: 'alta',
          programId: p.programId,
          subprogramId: p.subprogramId,
          originEntity: 'purchase',
          originId: p.id,
          title: 'Compra Atrasada',
          message: `${p.category || p.itemOrService}: ${dateLabel} (${p.requiredDate}) expiró sin recepción conforme.`,
          date: p.requiredDate,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: p.updatedAt,
        });
      }
    });

    // 3. Indicadores en riesgo o críticos
    indicators.filter((ind) => !ind.archived).forEach((ind) => {
      let percent = 0;
      if (ind.direction === 'higher_is_better') {
        percent = ind.periodTarget > 0 ? (ind.currentResult / ind.periodTarget) * 100 : 0;
      } else {
        percent = ind.currentResult > 0 ? (ind.periodTarget / ind.currentResult) * 100 : 100;
      }

      if (percent < thresholds.indicatorDangerPercent) {
        const alertId = `alt_ind_crit_${ind.id}`;
        generated.push({
          id: alertId,
          type: 'indicador_critico',
          severity: 'critica',
          programId: ind.programId,
          subprogramId: ind.subprogramId,
          originEntity: 'indicator',
          originId: ind.id,
          title: `Meta Crítica: ${ind.code}`,
          message: `${ind.name}: Cumplimiento del ${percent.toFixed(1)}% (Brecha: ${Math.abs(ind.periodTarget - ind.currentResult)} ${ind.unit})`,
          date: ind.cutoffDate,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: ind.updatedAt,
        });
      } else if (percent < thresholds.indicatorWarningPercent) {
        const alertId = `alt_ind_risk_${ind.id}`;
        generated.push({
          id: alertId,
          type: 'indicador_en_riesgo',
          severity: 'alta',
          programId: ind.programId,
          subprogramId: ind.subprogramId,
          originEntity: 'indicator',
          originId: ind.id,
          title: `Meta en Riesgo: ${ind.code}`,
          message: `${ind.name}: Cumplimiento del ${percent.toFixed(1)}% bajo el umbral de advertencia (${thresholds.indicatorWarningPercent}%).`,
          date: ind.cutoffDate,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: ind.updatedAt,
        });
      }
    });

    // 4. Finanzas (baja ejecución / sobreejecución)
    financialPeriods.forEach((fin) => {
      const vigente = fin.assignedBudget + fin.modifications;
      const execRate = vigente > 0 ? (fin.executedAmount / vigente) * 100 : 0;

      // In August (month 8 of 12 ~ 66%), execution < 45% is low
      if (execRate < thresholds.lowFinancialExecutionPercent) {
        const alertId = `alt_fin_low_${fin.id}`;
        generated.push({
          id: alertId,
          type: 'baja_ejecucion',
          severity: 'alta',
          programId: fin.programId,
          subprogramId: fin.subprogramId,
          originEntity: 'financial',
          originId: fin.id,
          title: 'Alerta Financiera: Baja Ejecución Presupuestaria',
          message: `${fin.periodName}: Ejecutado ${execRate.toFixed(1)}% ($${fin.executedAmount.toLocaleString('es-CL')}) respecto a presupuesto vigente ($${vigente.toLocaleString('es-CL')}).`,
          date: fin.cutoffDate,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: fin.updatedAt,
        });
      } else if (execRate > thresholds.overFinancialExecutionPercent) {
        const alertId = `alt_fin_over_${fin.id}`;
        generated.push({
          id: alertId,
          type: 'riesgo_sobreejecucion',
          severity: 'alta',
          programId: fin.programId,
          subprogramId: fin.subprogramId,
          originEntity: 'financial',
          originId: fin.id,
          title: 'Alerta Financiera: Riesgo de Sobreejecución / Agotamiento de Fondos',
          message: `${fin.periodName}: Ejecutado ${execRate.toFixed(1)}%. Saldo disponible crítico.`,
          date: fin.cutoffDate,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: fin.updatedAt,
        });
      }
    });

    // 5. Correos pendientes vencidos
    emails.filter((em) => !em.archived && em.status !== 'resuelto').forEach((em) => {
      if (em.deadline < todayStr) {
        const alertId = `alt_em_over_${em.id}`;
        generated.push({
          id: alertId,
          type: 'correo_vencido',
          severity: em.priority === 'critica' ? 'critica' : 'alta',
          programId: em.programId,
          subprogramId: em.subprogramId,
          originEntity: 'email',
          originId: em.id,
          title: 'Correo / Acción Pendiente Vencida',
          message: `Acción "${em.action.toUpperCase()}" para ${em.recipient} venció el ${em.deadline}: ${em.subject}`,
          date: em.deadline,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: em.createdAt,
        });
      }
    });

    // 6. Preguntas con seguimiento vencido o para hoy
    questions.filter((q) => !q.archived && q.status !== 'resuelta' && q.status !== 'cerrada_sin_respuesta').forEach((q) => {
      if (q.followUpDate && q.followUpDate < todayStr) {
        const isCritical = q.priority === 'critica' || q.isUrgent;
        const alertId = `alt_q_over_${q.id}`;
        generated.push({
          id: alertId,
          type: 'duda_bloqueante',
          severity: isCritical ? 'critica' : 'alta',
          programId: q.programId,
          subprogramId: q.subprogramId,
          originEntity: 'question',
          originId: q.id,
          title: 'Seguimiento de Consulta Vencido',
          message: `Consulta "${q.question}" debió gestionarse el ${q.followUpDate} (Resp: ${q.responsible})`,
          date: q.followUpDate,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: q.createdAt,
        });
      } else if (q.followUpDate && q.followUpDate === todayStr) {
        const alertId = `alt_q_today_${q.id}`;
        generated.push({
          id: alertId,
          type: 'plazo_cercano',
          severity: q.priority === 'critica' || q.isUrgent ? 'alta' : 'media',
          programId: q.programId,
          subprogramId: q.subprogramId,
          originEntity: 'question',
          originId: q.id,
          title: 'Seguimiento de Consulta para Hoy',
          message: `Seguimiento de consulta "${q.question}" programado para hoy (Resp: ${q.responsible})`,
          date: q.followUpDate,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: q.createdAt,
        });
      }
    });

    return generated;
  }, [tasks, purchases, indicators, financialPeriods, emails, questions, thresholds, resolvedAlertIds, dismissedAlertIds]);

  // Program summaries with calculated traffic light semaphores
  const programSummaries = useMemo<Record<ProgramId, ProgramSummary>>(() => {
    const map = {} as Record<ProgramId, ProgramSummary>;

    programs.forEach((prog) => {
      const progTasks = tasks.filter((t) => t.programId === prog.id && !t.archived);
      const progIndicators = indicators.filter((i) => i.programId === prog.id && !i.archived);
      const progFin = financialPeriods.find((f) => f.programId === prog.id && !f.subprogramId);
      const progAlerts = alerts.filter((a) => a.programId === prog.id && a.status === 'nueva');
      const progPurchases = purchases.filter((p) => p.programId === prog.id && !p.archived);

      // Indicators stats
      let totalComp = 0;
      let atRisk = 0;
      let critical = 0;
      progIndicators.forEach((ind) => {
        const target = (typeof ind.periodTarget === 'number' && !isNaN(ind.periodTarget) && ind.periodTarget > 0)
          ? ind.periodTarget
          : ((typeof ind.annualTarget === 'number' && !isNaN(ind.annualTarget) && ind.annualTarget > 0) ? ind.annualTarget : 100);
        const result = (typeof ind.currentResult === 'number' && !isNaN(ind.currentResult))
          ? ind.currentResult
          : 0;
        const pct = ind.direction === 'higher_is_better'
          ? (target > 0 ? (result / target) * 100 : 0)
          : (result > 0 ? (target / result) * 100 : 100);
        const safePct = Number.isFinite(pct) ? pct : 0;
        totalComp += safePct;
        if (safePct < thresholds.indicatorDangerPercent) critical++;
        else if (safePct < thresholds.indicatorWarningPercent) atRisk++;
      });
      const avgComp = progIndicators.length > 0 && Number.isFinite(totalComp / progIndicators.length)
        ? totalComp / progIndicators.length
        : 0;

      // Financial stats
      const progComps = budgetComponents.filter((c) => c.programId === prog.id);
      const compSpent = progComps.reduce((acc, c) => acc + (c.spentAmount || 0), 0);
      const totalBud = progFin ? progFin.assignedBudget + progFin.modifications : 0;
      const execBud = progComps.length > 0 ? compSpent : (progFin ? progFin.executedAmount : 0);
      const availBud = progFin ? Math.max(0, totalBud - execBud - progFin.committedAmount) : 0;
      const finRate = totalBud > 0 ? (execBud / totalBud) * 100 : 0;

      // Critical pending & overdue tasks
      const overdueCount = progTasks.filter((t) => t.status !== 'completada' && t.dueDate < todayStr).length;
      const criticalPending = progTasks.filter((t) => t.status !== 'completada' && (t.priority === 'critica' || t.dueDate < todayStr)).length;

      // Calculate automated Traffic Light based on Target / Indicator Compliance (Metas Sanitarias)
      let status: TrafficLightStatus = 'green';
      let statusReason = `Metas sanitarias en regla (${avgComp.toFixed(0)}%).`;

      const dangerThreshold = thresholds.indicatorDangerPercent ?? 75;
      const warningThreshold = thresholds.indicatorWarningPercent ?? 85;

      if (avgComp < dangerThreshold || avgComp < 75) {
        status = 'red';
        statusReason = `Cumplimiento de metas crítico (${avgComp.toFixed(0)}%).`;
      } else if (avgComp < warningThreshold) {
        status = 'yellow';
        statusReason = `Cumplimiento de metas en observación (${avgComp.toFixed(0)}%).`;
      }

      // Next Milestone
      const upcomingMeet = meetings
        .filter((m) => m.programId === prog.id && m.dateTime >= todayStr)
        .sort((a, b) => a.dateTime.localeCompare(b.dateTime))[0];
      const nextMilestone = upcomingMeet
        ? `${upcomingMeet.title.substring(0, 30)}... (${upcomingMeet.dateTime.substring(0, 10)})`
        : 'Sin hitos próximos agendados';

      map[prog.id] = {
        program: prog,
        status,
        statusReason,
        indicatorsCompliance: avgComp,
        indicatorsTotal: progIndicators.length,
        indicatorsAtRisk: atRisk,
        indicatorsCritical: critical,
        financialExecutionRate: finRate,
        totalBudget: totalBud,
        executedBudget: execBud,
        availableBudget: availBud,
        criticalPendingCount: criticalPending,
        overdueTasksCount: overdueCount,
        activeAlertsCount: progAlerts.length,
        nextMilestone,
        lastUpdateDate: '15/08/2026',
      };
    });

    return map;
  }, [programs, tasks, indicators, financialPeriods, alerts, purchases, meetings, thresholds]);

  // Derived filter lists for "Hoy" view
  const globalAlerts = useMemo(() => alerts.filter((a) => a.status === 'nueva'), [alerts]);
  const overdueTasks = useMemo(() => tasks.filter((t) => !t.archived && !t.deletedAt && isTaskOverdue(t, todayStr)), [tasks]);
  const todayTasks = useMemo(() => tasks.filter((t) => !t.archived && !t.deletedAt && !isTaskCompleted(t.status) && t.dueDate === todayStr), [tasks]);
  const upcomingTasks = useMemo(() => {
    // Next 3-7 days
    const nextWeek = '2026-08-22';
    return tasks.filter((t) => !t.archived && !t.deletedAt && !isTaskCompleted(t.status) && t.dueDate > todayStr && t.dueDate <= nextWeek);
  }, [tasks]);
  const urgentTasks = useMemo(() => {
    return tasks.filter((t) => !t.archived && !t.deletedAt && !isTaskCompleted(t.status) && (t.isUrgent || t.priority === 'critica' || isTaskOverdue(t, todayStr)));
  }, [tasks]);
  const indicatorsInRisk = useMemo(() => {
    return indicators.filter((ind) => {
      if (ind.archived) return false;
      const pct = ind.direction === 'higher_is_better'
        ? (ind.periodTarget > 0 ? (ind.currentResult / ind.periodTarget) * 100 : 0)
        : (ind.currentResult > 0 ? (ind.periodTarget / ind.currentResult) * 100 : 100);
      return pct < thresholds.indicatorWarningPercent;
    });
  }, [indicators, thresholds]);

  const financialAlerts = useMemo(() => {
    const list: { programId: ProgramId; reason: string; severity: 'alta' | 'media'; rate: number }[] = [];
    financialPeriods.forEach((f) => {
      const tot = f.assignedBudget + f.modifications;
      const rate = tot > 0 ? (f.executedAmount / tot) * 100 : 0;
      if (rate < thresholds.lowFinancialExecutionPercent) {
        list.push({
          programId: f.programId,
          reason: `Baja ejecución a agosto (${rate.toFixed(1)}% ejecutado). Brecha presupuestaria en convenio.`,
          severity: 'alta',
          rate,
        });
      }
    });
    return list;
  }, [financialPeriods, thresholds]);

  const unansweredQuestions = useMemo(() => {
    return questions.filter((q) => !q.archived && q.status !== 'resuelta');
  }, [questions]);

  // Task Category Management
  const addTaskCategory = (name: string, color?: string): TaskCategory => {
    const trimmed = name.trim();
    const newCat: TaskCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: trimmed,
      color: color || '#6366f1',
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };
    setTaskCategories((prev) => [...prev, newCat]);
    logAudit('CategoríaTarea', newCat.id, 'crear', `Categoría "${trimmed}" creada`);
    showToast(`Categoría "${trimmed}" creada`, 'success');
    return newCat;
  };

  const updateTaskCategory = (id: string, updates: any) => {
    setTaskCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    logAudit('CategoríaTarea', id, 'editar', `Categoría ID ${id} actualizada`);
    showToast('Categoría actualizada', 'info');
  };

  const toggleTaskCategoryStatus = (id: string) => {
    setTaskCategories((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newStatus = !c.isActive;
        logAudit('CategoríaTarea', id, 'editar', `Categoría "${c.name}" ${newStatus ? 'activada' : 'desactivada'}`);
        return { ...c, isActive: newStatus };
      })
    );
    showToast('Estado de categoría modificado', 'info');
  };

  // Task Mutations
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateUUID();
    const nowIso = new Date().toISOString();
    const normalizedStatus = normalizeTaskStatus(taskData.status || 'por_hacer');
    const isCompleted = normalizedStatus === 'terminada';

    const newTask: Task = {
      ...taskData,
      id,
      status: normalizedStatus,
      isUrgent: taskData.isUrgent ?? (taskData.priority === 'critica'),
      checklist: taskData.checklist || [],
      attachments: taskData.attachments || [],
      createdAt: nowIso,
      createdBy: currentUser.name,
      updatedAt: nowIso,
      completedAt: isCompleted ? nowIso : undefined,
      completedBy: isCompleted ? currentUser.name : undefined,
      history: [
        {
          id: `aud_${Date.now()}_1`,
          taskId: id,
          user: currentUser.name,
          date: nowIso,
          action: 'crear',
          details: `Tarea creada: "${taskData.title}" (${normalizedStatus})`,
        },
      ],
    };

    setTasks((prev) => [newTask, ...prev]);
    logAudit('Tarea', newTask.id, 'crear', `Nueva tarea: "${newTask.title}" asignada a ${newTask.responsible}`);
    showToast(`Tarea "${newTask.title}" creada con éxito`, 'success');
    upsertTaskInSupabase(newTask).catch((err) => console.warn('Supabase sync task error:', err));
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>, silentToast = false) => {
    const nowIso = new Date().toISOString();

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const changes: string[] = [];

        // Check specific field changes for audit
        if (updates.status !== undefined && updates.status !== t.status) {
          changes.push(`Estado: ${t.status} -> ${updates.status}`);
        }
        if (updates.priority !== undefined && updates.priority !== t.priority) {
          changes.push(`Prioridad: ${t.priority} -> ${updates.priority}`);
        }
        if (updates.isUrgent !== undefined && updates.isUrgent !== t.isUrgent) {
          changes.push(updates.isUrgent ? 'Marcada como Urgente' : 'Desmarcada de Urgente');
        }
        if (updates.dueDate !== undefined && updates.dueDate !== t.dueDate) {
          changes.push(`Fecha límite: ${t.dueDate} -> ${updates.dueDate}`);
        }
        if (updates.responsible !== undefined && updates.responsible !== t.responsible) {
          changes.push(`Responsable: ${t.responsible} -> ${updates.responsible}`);
        }
        if (updates.title !== undefined && updates.title !== t.title) {
          changes.push(`Título modificado`);
        }

        const newStatus = updates.status !== undefined ? normalizeTaskStatus(updates.status) : normalizeTaskStatus(t.status);
        const wasCompleted = isTaskCompleted(t.status);
        const isNowCompleted = newStatus === 'terminada';

        let completedAt = t.completedAt;
        let completedBy = t.completedBy;

        if (!wasCompleted && isNowCompleted) {
          completedAt = nowIso;
          completedBy = currentUser.name;
          setResolvedAlertIds((r) => [...r, `alt_task_overdue_${id}`, `alt_task_today_${id}`, `alt_task_exp_soon_${id}`]);
        } else if (wasCompleted && !isNowCompleted) {
          completedAt = undefined;
          completedBy = undefined;
        }

        const auditEntry: TaskAuditEntry | null = changes.length > 0 ? {
          id: `aud_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          taskId: id,
          user: currentUser.name,
          date: nowIso,
          action: 'editar',
          details: changes.join(' • '),
        } : null;

        const existingHistory = t.history || [];
        const newHistory = auditEntry ? [auditEntry, ...existingHistory] : existingHistory;

        return {
          ...t,
          ...updates,
          status: newStatus,
          completedAt,
          completedBy,
          updatedAt: nowIso,
          updatedBy: currentUser.name,
          history: newHistory,
        };
      })
    );

    // Sincronización bidireccional automática con compromisos de reuniones
    const targetTask = tasks.find((t) => t.id === id);
    if (targetTask) {
      const newStatus = updates.status !== undefined ? normalizeTaskStatus(updates.status) : normalizeTaskStatus(targetTask.status);
      const isNowCompleted = newStatus === 'terminada';
      const commitmentStatus: CommitmentStatus = isNowCompleted
        ? 'cumplido'
        : newStatus === 'en_ejecucion'
        ? 'en_curso'
        : 'pendiente';

      setMeetings((prevM) =>
        prevM.map((m) => {
          let hasChange = false;
          const updatedCommitments = (m.commitments || []).map((c) => {
            if (c.taskId === id || c.id === targetTask.originId) {
              hasChange = true;
              return {
                ...c,
                status: commitmentStatus,
                deadline: updates.dueDate || c.deadline,
                responsible: updates.responsible || c.responsible,
                priority: updates.priority || c.priority,
                isUrgent: updates.isUrgent !== undefined ? updates.isUrgent : c.isUrgent,
                completedAt: isNowCompleted ? (c.completedAt || nowIso) : undefined,
                completedBy: isNowCompleted ? (c.completedBy || currentUser.name) : undefined,
                updatedAt: nowIso,
              };
            }
            return c;
          });
          return hasChange ? { ...m, commitments: updatedCommitments, updatedAt: nowIso } : m;
        })
      );

      // Sincronización con requerimientos/correos vinculados
      if (isNowCompleted) {
        const linkedEmail = emails.find(
          (e) => !e.archived && (e.taskId === id || (targetTask.origin === 'Correo' && targetTask.originId === e.id))
        );
        if (linkedEmail) {
          const emailCanonical = normalizeCommunicationStatus(linkedEmail.status);
          if (emailCanonical !== 'cerrado' && emailCanonical !== 'respondido') {
            setPendingEmailResolutionPrompt({
              emailId: linkedEmail.id,
              taskId: id,
              emailSubject: linkedEmail.subject,
            });
          }
        }
      }
    }

    logAudit('Tarea', id, 'editar', `Modificación en tarea ID ${id}`);
    const currentTask = tasks.find((t) => t.id === id);
    if (currentTask) {
      upsertTaskInSupabase({ ...currentTask, ...updates, updatedAt: nowIso }).catch((err) =>
        console.warn('Supabase update task error:', err)
      );
    }
  };

  const quickUpdateTaskStatus = (id: string, newStatus: TaskStatus) => {
    const normalized = normalizeTaskStatus(newStatus);
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    updateTask(id, { status: normalized }, true);
  };

  const completeTask = (id: string) => {
    quickUpdateTaskStatus(id, 'terminada');
  };

  const reopenTask = (id: string) => {
    quickUpdateTaskStatus(id, 'en_ejecucion');
  };

  const toggleTaskUrgent = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const nextUrgent = !target.isUrgent;
    updateTask(id, { isUrgent: nextUrgent }, true);
    showToast(nextUrgent ? 'Tarea marcada como URGENTE 🔥' : 'Urgencia removida', 'info');
  };

  const duplicateTask = (id: string, newDueDate?: string): Task => {
    const source = tasks.find((t) => t.id === id);
    if (!source) throw new Error('Tarea origen no encontrada');

    const newId = `tsk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const nowIso = new Date().toISOString();

    const clonedChecklist: TaskChecklistItem[] = (source.checklist || []).map((item, idx) => ({
      id: `chk_${Date.now()}_${idx}`,
      description: item.description,
      isCompleted: false,
    }));

    const duplicated: Task = {
      ...source,
      id: newId,
      title: `Copia de ${source.title}`,
      status: 'por_hacer',
      dueDate: newDueDate || source.dueDate || todayStr,
      checklist: clonedChecklist,
      attachments: [...(source.attachments || [])],
      createdAt: nowIso,
      createdBy: currentUser.name,
      updatedAt: nowIso,
      completedAt: undefined,
      completedBy: undefined,
      deletedAt: undefined,
      deletedBy: undefined,
      archived: false,
      history: [
        {
          id: `aud_${Date.now()}_dup`,
          taskId: newId,
          user: currentUser.name,
          date: nowIso,
          action: 'duplicar',
          details: `Duplicada a partir de la tarea "${source.title}" (ID: ${source.id})`,
        },
      ],
    };

    setTasks((prev) => [duplicated, ...prev]);
    logAudit('Tarea', newId, 'crear', `Tarea duplicada a partir de ID ${source.id}`);
    showToast(`Tarea duplicada con éxito: "${duplicated.title}"`, 'success');
    if (isSupabaseConfigured()) {
      upsertTaskInSupabase(duplicated).catch((err) => console.warn('Supabase sync task error:', err));
    }
    return duplicated;
  };

  const deleteTask = (id: string) => {
    const nowIso = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          archived: true,
          deletedAt: nowIso,
          deletedBy: currentUser.name,
        };
      })
    );
    logAudit('Tarea', id, 'eliminar_logico', `Tarea ${id} eliminada lógicamente`);
    showToast('Tarea eliminada del sistema', 'warning');
    deleteTaskFromSupabase(id).catch((err) => console.warn('Supabase delete task error:', err));
  };

  const deleteTaskWithConfirmation = (id: string) => {
    deleteTask(id);
  };

  const restoreTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const restored: Task = {
      ...target,
      archived: false,
      deletedAt: undefined,
      deletedBy: undefined,
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => prev.map((t) => (t.id === id ? restored : t)));
    logAudit('Tarea', id, 'restaurar', `Tarea ${id} restaurada`);
    showToast('Tarea restaurada', 'success');
    if (isSupabaseConfigured()) {
      upsertTaskInSupabase(restored).catch((err) => console.warn('Supabase restore task error:', err));
    }
  };

  const addChecklistItem = (taskId: string, description: string) => {
    const trimmed = description.trim();
    if (!trimmed) return;
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const newItem: TaskChecklistItem = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      description: trimmed,
      isCompleted: false,
    };
    const updated: Task = {
      ...target,
      checklist: [...(target.checklist || []), newItem],
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    showToast('Ítem agregado al checklist', 'info');
    if (isSupabaseConfigured()) {
      upsertTaskInSupabase(updated).catch((err) => console.warn('Supabase checklist task error:', err));
    }
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const currentList = target.checklist || [];
    const updatedList = currentList.map((item) =>
      item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
    );
    const updated: Task = {
      ...target,
      checklist: updatedList,
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    if (isSupabaseConfigured()) {
      upsertTaskInSupabase(updated).catch((err) => console.warn('Supabase checklist error:', err));
    }
  };

  const updateChecklistItem = (taskId: string, itemId: string, description: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const currentList = target.checklist || [];
    const updatedList = currentList.map((item) =>
      item.id === itemId ? { ...item, description: description.trim() } : item
    );
    const updated: Task = {
      ...target,
      checklist: updatedList,
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    if (isSupabaseConfigured()) {
      upsertTaskInSupabase(updated).catch((err) => console.warn('Supabase checklist error:', err));
    }
  };

  const removeChecklistItem = (taskId: string, itemId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const currentList = target.checklist || [];
    const updated: Task = {
      ...target,
      checklist: currentList.filter((item) => item.id !== itemId),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    showToast('Ítem eliminado del checklist', 'info');
    if (isSupabaseConfigured()) {
      upsertTaskInSupabase(updated).catch((err) => console.warn('Supabase checklist error:', err));
    }
  };

  const addIndicator = (indData: Omit<Indicator, 'id' | 'measurements' | 'createdAt' | 'updatedAt'>) => {
    const newInd: Indicator = {
      ...indData,
      id: `ind_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      measurements: [
        {
          id: `m_${Date.now()}`,
          indicatorId: `ind_${Date.now()}`,
          period: '2026-07',
          date: indData.cutoffDate || todayStr,
          result: indData.currentResult,
          target: indData.periodTarget,
          registeredBy: currentUser.name,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setIndicators((prev) => [newInd, ...prev]);
    logAudit('Indicador', newInd.id, 'crear', `Nuevo indicador: ${newInd.code} - ${newInd.name}`);
    showToast(`Indicador ${newInd.code} creado`, 'success');
    if (isSupabaseConfigured()) {
      upsertIndicatorInSupabase(newInd).catch((err) => console.warn('Supabase sync indicator error:', err));
    }
    return newInd;
  };

  const updateIndicator = (id: string, updates: Partial<Indicator>) => {
    const existing = indicators.find((i) => i.id === id);
    if (!existing) return;
    const updatedInd: Indicator = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    setIndicators((prev) => prev.map((i) => (i.id === id ? updatedInd : i)));
    logAudit('Indicador', id, 'editar', `Indicador ${id} actualizado`);
    showToast('Indicador actualizado y semáforos recalculados', 'info');
    if (isSupabaseConfigured()) {
      upsertIndicatorInSupabase(updatedInd).catch((err) => console.warn('Supabase update indicator error:', err));
    }
  };

  const recordMeasurement = (indicatorId: string, result: number, period: string, notes?: string) => {
    const ind = indicators.find((i) => i.id === indicatorId);
    if (!ind) return;
    const newMeas: IndicatorMeasurement = {
      id: `m_${Date.now()}`,
      indicatorId,
      period,
      date: todayStr,
      result,
      target: ind.periodTarget,
      notes,
      registeredBy: currentUser.name,
    };
    const updatedInd: Indicator = {
      ...ind,
      currentResult: result,
      cutoffDate: todayStr,
      measurements: [...ind.measurements, newMeas],
      updatedAt: new Date().toISOString(),
    };
    setIndicators((prev) => prev.map((i) => (i.id === indicatorId ? updatedInd : i)));
    logAudit('Indicador', indicatorId, 'editar', `Medición registrada para período ${period}: ${result}`);
    showToast('Nueva medición registrada exitosamente', 'success');
    if (isSupabaseConfigured()) {
      upsertIndicatorInSupabase(updatedInd).catch((err) => console.warn('Supabase indicator measurement error:', err));
    }
  };

  const deleteIndicator = (id: string) => {
    setIndicators((prev) => prev.map((i) => (i.id === id ? { ...i, archived: true } : i)));
    logAudit('Indicador', id, 'eliminar_logico', `Indicador ${id} archivado`);
    showToast('Indicador archivado', 'warning');
    if (isSupabaseConfigured()) {
      deleteIndicatorFromSupabase(id).catch((err) => console.warn('Supabase delete indicator error:', err));
    }
  };

  const updateFinancialPeriod = (id: string, updates: Partial<FinancialPeriod>) => {
    let updatedItem: FinancialPeriod | undefined;
    setFinancialPeriods((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          updatedItem = { ...f, ...updates, updatedAt: new Date().toISOString() };
          return updatedItem;
        }
        return f;
      })
    );
    if (updatedItem && isSupabaseConfigured()) {
      upsertFinancialPeriodInSupabase(updatedItem).catch((err) =>
        console.warn('Error syncing financial period to Supabase:', err?.message)
      );
    }
    logAudit('Finanzas', id, 'editar', `Actualización presupuestaria en período ID ${id}`);
    showToast('Balance financiero actualizado y saldos recalculados', 'success');
  };

  const addFinancialPeriod = (finData: Omit<FinancialPeriod, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newFin: FinancialPeriod = {
      ...finData,
      id: `fin_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFinancialPeriods((prev) => [newFin, ...prev]);
    if (isSupabaseConfigured()) {
      upsertFinancialPeriodInSupabase(newFin).catch((err) =>
        console.warn('Error syncing new financial period to Supabase:', err?.message)
      );
    }
    logAudit('Finanzas', newFin.id, 'crear', `Nuevo período financiero para ${newFin.programId}`);
    showToast('Período financiero creado', 'success');
  };

  const deleteFinancialPeriod = (id: string) => {
    setFinancialPeriods((prev) => prev.filter((f) => f.id !== id));
    if (isSupabaseConfigured()) {
      deleteFinancialPeriodFromSupabase(id).catch((err) =>
        console.warn('Error deleting financial period from Supabase:', err?.message)
      );
    }
    logAudit('Finanzas', id, 'eliminar_logico', `Partida presupuestaria ID ${id} eliminada`);
    showToast('Partida presupuestaria eliminada', 'warning');
  };

  const addBudgetComponent = (compData: Omit<BudgetComponent, 'id' | 'createdAt' | 'updatedAt'>): BudgetComponent => {
    const newComp: BudgetComponent = {
      ...compData,
      id: `bc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBudgetComponents((prev) => [...prev, newComp]);
    if (isSupabaseConfigured()) {
      upsertBudgetComponentInSupabase(newComp).catch((err) =>
        console.warn('Error syncing budget component to Supabase:', err?.message)
      );
    }
    logAudit('Finanzas', newComp.id, 'crear', `Nuevo componente presupuestario ${newComp.name} para ${newComp.programId}`);
    showToast(`Componente "${newComp.name}" agregado exitosamente`, 'success');
    return newComp;
  };

  const updateBudgetComponent = (id: string, updates: Partial<BudgetComponent>) => {
    let updatedComp: BudgetComponent | undefined;
    setBudgetComponents((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedComp = { ...c, ...updates, updatedAt: new Date().toISOString() };
          return updatedComp;
        }
        return c;
      })
    );
    if (updatedComp && isSupabaseConfigured()) {
      upsertBudgetComponentInSupabase(updatedComp).catch((err) =>
        console.warn('Error syncing budget component update to Supabase:', err?.message)
      );
    }
    logAudit('Finanzas', id, 'editar', `Componente presupuestario ID ${id} actualizado`);
    showToast('Componente presupuestario actualizado', 'success');
  };

  const deleteBudgetComponent = (id: string) => {
    setBudgetComponents((prev) => prev.filter((c) => c.id !== id));
    if (isSupabaseConfigured()) {
      deleteBudgetComponentFromSupabase(id).catch((err) =>
        console.warn('Error deleting budget component from Supabase:', err?.message)
      );
    }
    logAudit('Finanzas', id, 'eliminar_logico', `Componente presupuestario ID ${id} eliminado`);
    showToast('Componente presupuestario eliminado', 'warning');
  };

  const updateBudget2025Note = (programId: ProgramId, updates: Partial<ProgramBudget2025Note>, targetYear?: number) => {
    const yr = targetYear || updates.year || 2025;
    const key = yr === 2025 ? programId : `${programId}_${yr}`;
    setBudget2025Notes((prev) => {
      const current = prev[key] || prev[programId] || {
        programId,
        year: yr,
        budgetAmount: 0,
        note: `Presupuesto ${yr}`,
      };
      return {
        ...prev,
        [key]: {
          ...current,
          ...updates,
          year: yr,
        },
        ...(yr === 2025 ? { [programId]: { ...current, ...updates, year: yr } } : {}),
      };
    });
    logAudit('Finanzas', programId, 'editar', `Presupuesto referencial ${yr} actualizado para ${programId}`);
    showToast(`Presupuesto ${yr} guardado`, 'success');
  };

  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const rawPur: Purchase = {
      receptionStatus: 'pendiente',
      invoiceStatus: 'sin_factura',
      ...purchaseData,
      id: `pur_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const macroState = purchaseData.macroState || getPurchaseEffectiveMacroState(rawPur);
    const newPur: Purchase = {
      ...rawPur,
      macroState,
    };
    setPurchases((prev) => [newPur, ...prev]);
    logAudit('Compras', newPur.id, 'crear', `Nueva solicitud de compra: ${newPur.category || newPur.itemOrService}`);
    showToast(`Solicitud "${newPur.category || newPur.itemOrService}" registrada`, 'success');
    if (isSupabaseConfigured()) {
      upsertPurchaseInSupabase(newPur).catch((err) => console.warn('Supabase sync purchase error:', err));
    }
    return newPur;
  };

  const updatePurchase = (id: string, updates: Partial<Purchase>) => {
    const existing = purchases.find((p) => p.id === id);
    if (!existing) return;
    const merged: Purchase = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    if (!updates.macroState) {
      merged.macroState = getPurchaseEffectiveMacroState(merged);
    }
    setPurchases((prev) => prev.map((p) => (p.id === id ? merged : p)));
    logAudit('Compras', id, 'editar', `Compra ${id} actualizada`);
    if (isSupabaseConfigured()) {
      upsertPurchaseInSupabase(merged).catch((err) => console.warn('Supabase update purchase error:', err));
    }
  };

  const deletePurchase = (id: string) => {
    setPurchases((prev) => prev.map((p) => (p.id === id ? { ...p, archived: true } : p)));
    logAudit('Compras', id, 'eliminar_logico', `Compra ${id} archivada`);
    showToast('Compra archivada', 'warning');
    if (isSupabaseConfigured()) {
      deletePurchaseFromSupabase(id).catch((err) => console.warn('Supabase delete purchase error:', err));
    }
  };

  const addMeeting = (meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMeeting: Meeting = {
      ...meetingData,
      id: `meet_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      status: meetingData.status || 'programada',
      agreements: Array.isArray(meetingData.agreements) ? meetingData.agreements : (typeof meetingData.agreements === 'string' && meetingData.agreements ? [{
        id: `agr_${Date.now()}_1`,
        meetingId: `meet_${Date.now()}`,
        description: meetingData.agreements,
        decisionType: 'acuerdo',
        orderIndex: 1,
        createdAt: new Date().toISOString(),
      }] : []),
      commitments: (meetingData.commitments || []).map((c, idx) => ({
        ...c,
        id: c.id || `com_${Date.now()}_${idx}`,
        meetingId: c.meetingId || `meet_${Date.now()}`,
        status: c.status || 'pendiente',
        priority: c.priority || 'alta',
        isUrgent: c.isUrgent || (c.priority === 'critica'),
        createdAt: c.createdAt || new Date().toISOString(),
        updatedAt: c.updatedAt || new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    logAudit('Reuniones', newMeeting.id, 'crear', `Reunión registrada: "${newMeeting.title}" (${newMeeting.type})`);
    showToast(`Instancia "${newMeeting.title}" guardada exitosamente`, 'success');
    if (isSupabaseConfigured()) {
      upsertMeetingInSupabase(newMeeting).catch((err) => console.warn('Supabase sync meeting error:', err));
    }
    return newMeeting;
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    const existing = meetings.find((m) => m.id === id);
    if (!existing) return;
    const updatedMeeting: Meeting = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    setMeetings((prev) => prev.map((m) => (m.id === id ? updatedMeeting : m)));
    logAudit('Reuniones', id, 'editar', `Reunión ${id} actualizada`);
    if (isSupabaseConfigured()) {
      upsertMeetingInSupabase(updatedMeeting).catch((err) => console.warn('Supabase update meeting error:', err));
    }
  };

  const addMeetingAgreement = (meetingId: string, description: string, decisionType: 'acuerdo' | 'definicion' | 'resolucion' = 'acuerdo'): MeetingAgreement => {
    const newAgr: MeetingAgreement = {
      id: `agr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      meetingId,
      description,
      decisionType,
      orderIndex: Date.now(),
      createdAt: new Date().toISOString(),
    };

    let updatedMeeting: Meeting | undefined;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const currentAgreements = Array.isArray(m.agreements) ? m.agreements : [];
        updatedMeeting = {
          ...m,
          agreements: [...currentAgreements, newAgr],
          updatedAt: new Date().toISOString(),
        };
        return updatedMeeting;
      })
    );

    if (updatedMeeting && isSupabaseConfigured()) {
      upsertMeetingInSupabase(updatedMeeting).catch((err) => console.warn('Supabase agreement error:', err));
    }

    logAudit('Reuniones', meetingId, 'crear', `Acuerdo agregado: "${description}"`);
    showToast('Acuerdo registrado', 'success');
    return newAgr;
  };

  const updateMeetingAgreement = (meetingId: string, agreementId: string, updates: Partial<MeetingAgreement>) => {
    let updatedMeeting: Meeting | undefined;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const currentAgreements = Array.isArray(m.agreements) ? m.agreements : [];
        updatedMeeting = {
          ...m,
          agreements: currentAgreements.map((a) => (a.id === agreementId ? { ...a, ...updates } : a)),
          updatedAt: new Date().toISOString(),
        };
        return updatedMeeting;
      })
    );
    if (updatedMeeting && isSupabaseConfigured()) {
      upsertMeetingInSupabase(updatedMeeting).catch((err) => console.warn('Supabase agreement update error:', err));
    }
    logAudit('Reuniones', meetingId, 'editar', `Acuerdo actualizado: ${agreementId}`);
  };

  const deleteMeetingAgreement = (meetingId: string, agreementId: string) => {
    let updatedMeeting: Meeting | undefined;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const currentAgreements = Array.isArray(m.agreements) ? m.agreements : [];
        updatedMeeting = {
          ...m,
          agreements: currentAgreements.filter((a) => a.id !== agreementId),
          updatedAt: new Date().toISOString(),
        };
        return updatedMeeting;
      })
    );
    if (updatedMeeting && isSupabaseConfigured()) {
      upsertMeetingInSupabase(updatedMeeting).catch((err) => console.warn('Supabase agreement delete error:', err));
    }
    logAudit('Reuniones', meetingId, 'eliminar_logico', `Acuerdo eliminado: ${agreementId}`);
    showToast('Acuerdo eliminado', 'info');
  };

  const addMeetingCommitment = (
    meetingId: string,
    commitmentData: Omit<MeetingCommitment, 'id' | 'meetingId' | 'createdAt' | 'updatedAt'>
  ): MeetingCommitment => {
    const newCom: MeetingCommitment = {
      ...commitmentData,
      id: `com_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      meetingId,
      status: commitmentData.status || 'pendiente',
      priority: commitmentData.priority || 'alta',
      isUrgent: commitmentData.isUrgent || (commitmentData.priority === 'critica'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let updatedMeeting: Meeting | undefined;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        updatedMeeting = {
          ...m,
          commitments: [...(m.commitments || []), newCom],
          updatedAt: new Date().toISOString(),
        };
        return updatedMeeting;
      })
    );

    if (updatedMeeting && isSupabaseConfigured()) {
      upsertMeetingInSupabase(updatedMeeting).catch((err) => console.warn('Supabase commitment add error:', err));
    }

    logAudit('Reuniones', meetingId, 'crear', `Compromiso agregado: "${newCom.description}" para ${newCom.responsible}`);
    showToast('Compromiso registrado en la sesión', 'success');
    return newCom;
  };

  const updateMeetingCommitment = (meetingId: string, commitmentId: string, updates: Partial<MeetingCommitment>) => {
    let linkedTaskId: string | undefined;
    let targetStatus: CommitmentStatus | undefined;
    const nowIso = new Date().toISOString();
    let updatedMeeting: Meeting | undefined;

    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const updatedCommitments = (m.commitments || []).map((c) => {
          if (c.id !== commitmentId) return c;
          linkedTaskId = c.taskId;
          targetStatus = updates.status !== undefined ? updates.status : c.status;
          const isDone = targetStatus === 'cumplido' || targetStatus === 'completado';
          return {
            ...c,
            ...updates,
            completedAt: isDone ? (c.completedAt || nowIso) : (updates.status ? undefined : c.completedAt),
            completedBy: isDone ? (c.completedBy || currentUser.name) : (updates.status ? undefined : c.completedBy),
            updatedAt: nowIso,
          };
        });
        updatedMeeting = {
          ...m,
          commitments: updatedCommitments,
          updatedAt: nowIso,
        };
        return updatedMeeting;
      })
    );

    if (updatedMeeting && isSupabaseConfigured()) {
      upsertMeetingInSupabase(updatedMeeting).catch((err) => console.warn('Supabase commitment update error:', err));
    }

    // Sincronizar automáticamente con la tarea vinculada
    if (linkedTaskId) {
      const taskUpdates: Partial<Task> = {};
      if (updates.description) taskUpdates.title = updates.description;
      if (updates.deadline) taskUpdates.dueDate = updates.deadline;
      if (updates.responsible) taskUpdates.responsible = updates.responsible;
      if (updates.priority) taskUpdates.priority = updates.priority;
      if (updates.isUrgent !== undefined) taskUpdates.isUrgent = updates.isUrgent;
      if (targetStatus) {
        if (targetStatus === 'cumplido' || targetStatus === 'completado') {
          taskUpdates.status = 'terminada';
        } else if (targetStatus === 'en_curso') {
          taskUpdates.status = 'en_ejecucion';
        } else if (targetStatus === 'pendiente') {
          taskUpdates.status = 'por_hacer';
        }
      }
      if (Object.keys(taskUpdates).length > 0) {
        updateTask(linkedTaskId, taskUpdates, true);
      }
    }

    logAudit('Reuniones', meetingId, 'editar', `Compromiso ID ${commitmentId} actualizado`);
  };

  const deleteMeetingCommitment = (meetingId: string, commitmentId: string) => {
    let updatedMeeting: Meeting | undefined;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        updatedMeeting = {
          ...m,
          commitments: (m.commitments || []).filter((c) => c.id !== commitmentId),
          updatedAt: new Date().toISOString(),
        };
        return updatedMeeting;
      })
    );
    if (updatedMeeting && isSupabaseConfigured()) {
      upsertMeetingInSupabase(updatedMeeting).catch((err) => console.warn('Supabase commitment delete error:', err));
    }
    logAudit('Reuniones', meetingId, 'eliminar_logico', `Compromiso ID ${commitmentId} eliminado`);
    showToast('Compromiso eliminado', 'warning');
  };

  const toggleMeetingCommitmentStatus = (meetingId: string, commitmentId: string, explicitStatus?: CommitmentStatus) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting || !meeting.commitments) return;
    const commitment = meeting.commitments.find((c) => c.id === commitmentId);
    if (!commitment) return;

    let nextStatus: CommitmentStatus;
    if (explicitStatus) {
      nextStatus = explicitStatus;
    } else {
      if (commitment.status === 'cumplido' || commitment.status === 'completado') {
        nextStatus = 'pendiente';
      } else if (commitment.status === 'pendiente') {
        nextStatus = 'en_curso';
      } else {
        nextStatus = 'cumplido';
      }
    }

    updateMeetingCommitment(meetingId, commitmentId, { status: nextStatus });
  };

  const convertCommitmentToTask = (meetingId: string, commitmentId: string): Task | undefined => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting || !meeting.commitments) return undefined;
    const commitment = meeting.commitments.find((c) => c.id === commitmentId);
    if (!commitment) return undefined;

    // Si ya existe una tarea vinculada, retornarla
    if (commitment.taskId) {
      const existingTask = tasks.find((t) => t.id === commitment.taskId);
      if (existingTask) {
        showToast('Este compromiso ya cuenta con una tarea operativa vinculada', 'info');
        return existingTask;
      }
    }

    const isCompleted = commitment.status === 'cumplido' || commitment.status === 'completado';
    const isEnCurso = commitment.status === 'en_curso';

    const newTask = addTask({
      title: commitment.description,
      description: `Compromiso formal de sesión "${meeting.title}" (${meeting.dateTime.substring(0, 10)})\nLugar: ${meeting.location}\nResponsable asignado: ${commitment.responsible}`,
      programId: meeting.programId,
      subprogramId: meeting.subprogramId,
      origin: 'Compromiso',
      originType: 'meeting_commitment',
      originId: commitment.id,
      originLabel: meeting.title,
      category: 'Reuniones / Compromisos',
      responsible: commitment.responsible,
      priority: commitment.priority || 'alta',
      isUrgent: commitment.isUrgent || (commitment.priority === 'critica'),
      dueDate: commitment.deadline,
      status: isCompleted ? 'terminada' : isEnCurso ? 'en_ejecucion' : 'por_hacer',
    });

    // Guardar taskId en el compromiso
    let updatedMeeting: Meeting | undefined;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        updatedMeeting = {
          ...m,
          commitments: (m.commitments || []).map((c) =>
            c.id === commitmentId ? { ...c, taskId: newTask.id, updatedAt: new Date().toISOString() } : c
          ),
          updatedAt: new Date().toISOString(),
        };
        return updatedMeeting;
      })
    );

    if (updatedMeeting && isSupabaseConfigured()) {
      upsertMeetingInSupabase(updatedMeeting).catch((err) => console.warn('Supabase meeting task link error:', err));
    }

    logAudit('Reuniones', meetingId, 'convertir_tarea', `Compromiso "${commitment.description}" convertido en tarea ID ${newTask.id}`);
    showToast('Compromiso sincronizado como tarea oficial en tiempo real', 'success');
    return newTask;
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, archived: true } : m)));
    logAudit('Reuniones', id, 'eliminar_logico', `Reunión ${id} archivada`);
    showToast('Instancia archivada', 'warning');
    if (isSupabaseConfigured()) {
      deleteMeetingFromSupabase(id).catch((err) => console.warn('Supabase delete meeting error:', err));
    }
  };

  // Google Calendar Integration Functions
  const updateGoogleCalendarAccount = (email: string) => {
    const cleanEmail = email.trim() || 'klaus.bauer@quilicurasalud.cl';
    setGoogleCalendarEmail(cleanEmail);
    setStoredUserEmail(cleanEmail);
    if (isGoogleCalendarConnected) {
      setGCalConnected(true, undefined, cleanEmail);
    }
    logAudit('Google Calendar', 'gcal_account', 'actualizar', `Cuenta de Google Calendar actualizada a ${cleanEmail}`);
    showToast(`Cuenta de Google Calendar actualizada a ${cleanEmail}`, 'success');
  };

  const connectGoogleCalendar = async (emailOverride?: string): Promise<boolean> => {
    try {
      const emailToUse = (emailOverride || googleCalendarEmail || currentUser.email || 'klaus.bauer@quilicurasalud.cl').trim();
      setGoogleCalendarEmail(emailToUse);
      setGCalConnected(true, undefined, emailToUse);
      setIsGoogleCalendarConnected(true);
      logAudit('Google Calendar', 'gcal_auth', 'conectar', `Cuenta de Google Calendar vinculada: ${emailToUse}`);
      showToast(`Google Calendar vinculado exitosamente con ${emailToUse}`, 'success');
      // Trigger initial sync
      await syncGoogleCalendar();
      return true;
    } catch (err) {
      console.error('Error connecting Google Calendar', err);
      showToast('No se pudo conectar a Google Calendar', 'error');
      return false;
    }
  };

  const disconnectGoogleCalendar = () => {
    setGCalConnected(false);
    setIsGoogleCalendarConnected(false);
    logAudit('Google Calendar', 'gcal_auth', 'desconectar', 'Cuenta de Google Calendar desvinculada');
    showToast('Google Calendar desvinculado', 'info');
  };

  const syncGoogleCalendar = async (): Promise<void> => {
    setIsGoogleCalendarSyncing(true);
    try {
      // 1. Fetch live or cached events from Google Calendar
      const gcalEvents = await fetchGoogleCalendarEvents();
      
      // 2. Import / Merge Google Calendar events into local meetings
      let importedCount = 0;
      setMeetings((prevMeetings) => {
        const existingGCalIds = new Set(prevMeetings.map((m) => m.googleCalendarEventId).filter(Boolean));
        const newMeetingsToAdd: Meeting[] = [];

        gcalEvents.forEach((gEvent) => {
          if (!existingGCalIds.has(gEvent.id)) {
            const converted = convertGCalEventToMeeting(gEvent, 'p1') as Meeting;
            newMeetingsToAdd.push(converted);
            importedCount++;
          } else {
            // Update existing with live description / meet link / location if changed in Google Calendar
            const video = extractVideoMeetingLink(gEvent.location || gEvent.description || gEvent.hangoutLink);
            const idx = prevMeetings.findIndex((m) => m.googleCalendarEventId === gEvent.id);
            if (idx >= 0) {
              const prev = prevMeetings[idx];
              prevMeetings[idx] = {
                ...prev,
                title: gEvent.summary || prev.title,
                summary: gEvent.description || prev.summary,
                description: gEvent.description || prev.description,
                location: gEvent.location || prev.location,
                meetingLink: video?.url || gEvent.hangoutLink || prev.meetingLink,
                googleCalendarHtmlLink: gEvent.htmlLink || prev.googleCalendarHtmlLink,
              };
            }
          }
        });

        return [...newMeetingsToAdd, ...prevMeetings];
      });

      // 3. Export any unsynced local meetings to Google Calendar
      const unsyncedMeetings = meetings.filter((m) => !m.archived && !m.googleCalendarEventId);
      for (const m of unsyncedMeetings.slice(0, 5)) {
        try {
          const res = await createGoogleCalendarEvent({
            summary: m.title || 'Reunión Quilicura Salud',
            description: m.summary || m.description || '',
            location: m.location || m.meetingLink || '',
            startDateTime: m.dateTime || (m.date ? `${m.date}T${m.time || '09:00'}:00` : new Date().toISOString()),
            meetingLink: m.meetingLink,
            attendees: (m.participants || []).map((p) => p.name || ''),
          });
          if (res) {
            setMeetings((prev) =>
              prev.map((item) =>
                item.id === m.id
                  ? { ...item, googleCalendarEventId: res.id, googleCalendarHtmlLink: res.htmlLink }
                  : item
              )
            );
          }
        } catch {}
      }

      const syncTimestamp = new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
      setLastGoogleCalendarSync(syncTimestamp);
      try {
        localStorage.setItem('quilicura_gcal_last_sync', syncTimestamp);
      } catch {}

      showToast(`Sincronización completa con Google Calendar (${importedCount} nuevos eventos actualizados)`, 'success');
      logAudit('Google Calendar', 'gcal_sync', 'sincronizar', `Sincronización bidireccional ejecutada: ${importedCount} eventos`);
    } catch (err) {
      console.error('Error syncing Google Calendar:', err);
      showToast('Error al sincronizar con Google Calendar', 'error');
    } finally {
      setIsGoogleCalendarSyncing(false);
    }
  };

  const exportMeetingToGoogleCalendar = async (meeting: Meeting): Promise<boolean> => {
    try {
      const res = await createGoogleCalendarEvent({
        summary: meeting.title || 'Reunión Quilicura Salud',
        description: meeting.summary || meeting.description || '',
        location: meeting.location || meeting.meetingLink || '',
        startDateTime: meeting.dateTime || (meeting.date ? `${meeting.date}T${meeting.time || '09:00'}:00` : new Date().toISOString()),
        meetingLink: meeting.meetingLink,
        attendees: (meeting.participants || []).map((p) => p.name || ''),
      });

      if (res) {
        setMeetings((prev) =>
          prev.map((m) =>
            m.id === meeting.id ? { ...m, googleCalendarEventId: res.id, googleCalendarHtmlLink: res.htmlLink } : m
          )
        );
        showToast(`Reunión agendada en Google Calendar con enlaces y descripción`, 'success');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error exporting meeting to Google Calendar:', err);
      showToast('No se pudo agendar en Google Calendar', 'error');
      return false;
    }
  };

  const exportTaskToGoogleCalendar = async (task: Task): Promise<boolean> => {
    try {
      const res = await createGoogleCalendarEvent({
        summary: `[Tarea] ${task.title}`,
        description: `Vencimiento de Tarea - Responsable: ${task.assignedTo || task.responsible || 'Equipo'}\nPrograma: ${task.programId}\nPrioridad: ${task.priority || 'Media'}`,
        startDateTime: task.dueDate ? `${task.dueDate}T09:00:00` : new Date().toISOString(),
        location: 'DISAM Quilicura',
      });
      if (res) {
        showToast(`Vencimiento de tarea agendado en Google Calendar`, 'success');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error exporting task to Google Calendar:', err);
      showToast('No se pudo agendar la tarea en Google Calendar', 'error');
      return false;
    }
  };

  const addEmail = (emailData: Omit<PendingEmail, 'id' | 'createdAt' | 'updatedAt'>): PendingEmail => {
    const nowIso = new Date().toISOString();
    const newEmail: PendingEmail = {
      type: 'correo_recibido',
      priority: 'alta',
      status: 'pendiente',
      followUps: [],
      attachments: [],
      receivedOrSentDate: todayStr,
      ...emailData,
      id: `em_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: nowIso,
      createdBy: currentUser.name,
      updatedAt: nowIso,
      updatedBy: currentUser.name,
    };
    setEmails((prev) => [newEmail, ...prev]);
    logAudit('Correos', newEmail.id, 'crear', `Requerimiento/Correo registrado: "${newEmail.subject}" (${newEmail.type || 'correo'})`);
    showToast('Requerimiento registrado exitosamente', 'success');
    return newEmail;
  };

  const updateEmail = (id: string, updates: Partial<PendingEmail>, silentToast = false) => {
    const nowIso = new Date().toISOString();
    setEmails((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const changes: string[] = [];
        if (updates.status !== undefined && updates.status !== e.status) {
          changes.push(`Estado: ${e.status} -> ${updates.status}`);
        }
        if (updates.responsible !== undefined && updates.responsible !== e.responsible) {
          changes.push(`Responsable: ${e.responsible || 'Sin responsable'} -> ${updates.responsible || 'Sin responsable'}`);
        }
        if (updates.priority !== undefined && updates.priority !== e.priority) {
          changes.push(`Prioridad: ${e.priority} -> ${updates.priority}`);
        }
        if (updates.deadline !== undefined && updates.deadline !== e.deadline) {
          changes.push(`Plazo: ${e.deadline} -> ${updates.deadline}`);
        }
        if (updates.requiredAction !== undefined && updates.requiredAction !== e.requiredAction) {
          changes.push(`Acción requerida actualizada`);
        }

        return {
          ...e,
          ...updates,
          updatedAt: nowIso,
          updatedBy: currentUser.name,
        };
      })
    );

    // Sincronizar con tarea vinculada si cambia el estado o plazo
    const currentEmail = emails.find((e) => e.id === id);
    if (currentEmail && currentEmail.taskId) {
      const taskUpdates: Partial<Task> = {};
      if (updates.deadline) taskUpdates.dueDate = updates.deadline;
      if (updates.responsible) taskUpdates.responsible = updates.responsible;
      if (updates.priority) taskUpdates.priority = updates.priority;
      if (updates.status && (updates.status === 'cerrado' || updates.status === 'respondido')) {
        taskUpdates.status = 'terminada';
      }
      if (Object.keys(taskUpdates).length > 0) {
        updateTask(currentEmail.taskId, taskUpdates, true);
      }
    }

    logAudit('Correos', id, 'editar', `Modificación en requerimiento/correo ${id}`);
  };

  const deleteEmail = (id: string) => {
    const nowIso = new Date().toISOString();
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, archived: true, deletedAt: nowIso, deletedBy: currentUser.name } : e)));
    logAudit('Correos', id, 'eliminar_logico', `Requerimiento/Correo ${id} archivado`);
    showToast('Requerimiento archivado', 'warning');
  };

  const addEmailFollowUp = (emailId: string, followUp: { type: CommunicationFollowUpType; note: string }): CommunicationFollowUp => {
    const nowIso = new Date().toISOString();
    const newFu: CommunicationFollowUp = {
      id: `fu_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      communicationId: emailId,
      type: followUp.type,
      note: followUp.note.trim(),
      createdAt: nowIso,
      createdBy: currentUser.name,
    };
    setEmails((prev) =>
      prev.map((e) => {
        if (e.id !== emailId) return e;
        const currentFu = e.followUps || [];
        return {
          ...e,
          followUps: [newFu, ...currentFu],
          updatedAt: nowIso,
          updatedBy: currentUser.name,
        };
      })
    );
    logAudit('Correos', emailId, 'editar', `Hito de seguimiento agregado: "${newFu.note.substring(0, 40)}..."`);
    showToast('Hito de seguimiento registrado', 'success');
    return newFu;
  };

  const deleteEmailFollowUp = (emailId: string, followUpId: string) => {
    const nowIso = new Date().toISOString();
    setEmails((prev) =>
      prev.map((e) => {
        if (e.id !== emailId) return e;
        return {
          ...e,
          followUps: (e.followUps || []).filter((f) => f.id !== followUpId),
          updatedAt: nowIso,
          updatedBy: currentUser.name,
        };
      })
    );
    logAudit('Correos', emailId, 'editar', `Hito de seguimiento ${followUpId} eliminado`);
    showToast('Hito eliminado', 'info');
  };

  const addEmailAttachment = (emailId: string, attachment: { name: string; size?: string; type?: string; url?: string }): CommunicationAttachment => {
    const nowIso = new Date().toISOString();
    const newAtt: CommunicationAttachment = {
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      communicationId: emailId,
      name: attachment.name,
      size: attachment.size || '500 KB',
      type: attachment.type || 'application/pdf',
      url: attachment.url || '#',
      uploadedAt: nowIso,
      uploadedBy: currentUser.name,
    };
    setEmails((prev) =>
      prev.map((e) => {
        if (e.id !== emailId) return e;
        const currentAtt = e.attachments || [];
        return {
          ...e,
          attachments: [newAtt, ...currentAtt],
          updatedAt: nowIso,
          updatedBy: currentUser.name,
        };
      })
    );
    logAudit('Correos', emailId, 'editar', `Documento "${newAtt.name}" adjuntado al requerimiento`);
    showToast(`Documento "${newAtt.name}" adjuntado`, 'success');
    return newAtt;
  };

  const deleteEmailAttachment = (emailId: string, attachmentId: string) => {
    const nowIso = new Date().toISOString();
    setEmails((prev) =>
      prev.map((e) => {
        if (e.id !== emailId) return e;
        return {
          ...e,
          attachments: (e.attachments || []).filter((a) => a.id !== attachmentId),
          updatedAt: nowIso,
          updatedBy: currentUser.name,
        };
      })
    );
    logAudit('Correos', emailId, 'editar', `Adjunto ${attachmentId} eliminado`);
    showToast('Documento adjunto eliminado', 'info');
  };

  const convertEmailToTask = (emailId: string): Task | undefined => {
    const email = emails.find((e) => e.id === emailId);
    if (!email) return undefined;

    if (email.taskId) {
      const existing = tasks.find((t) => t.id === email.taskId && !t.archived);
      if (existing) {
        showToast('Este requerimiento ya tiene una tarea vinculada', 'info');
        return existing;
      }
    }

    const newTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: email.requiredAction ? `[Acción Correo] ${email.requiredAction}` : `[Seguimiento Correo] ${email.subject}`,
      description: `Origen administrativo: ${email.subject}\nRemitente: ${email.sender || 'No especificado'}\nDestinatario: ${email.recipient}\nAcción requerida: ${email.requiredAction || email.notes || 'Revisar y gestionar'}`,
      programId: email.programId,
      subprogramId: email.subprogramId,
      status: 'por_hacer',
      priority: email.priority || 'alta',
      dueDate: email.deadline || todayStr,
      responsible: email.responsible || currentUser.name,
      origin: 'Correo',
      originId: email.id,
      category: 'administrativa',
      isUrgent: email.priority === 'critica' || email.priority === 'alta',
      checklist: email.requiredAction ? [
        { id: `chk_${Date.now()}_1`, taskId: '', description: email.requiredAction, isCompleted: false },
        { id: `chk_${Date.now()}_2`, taskId: '', description: 'Enviar confirmación / respuesta oficial', isCompleted: false },
      ] : [],
    };

    const createdTask = addTask(newTaskData);

    // Update email with task ID and status 'en_gestion' if was 'pendiente'
    updateEmail(emailId, {
      taskId: createdTask.id,
      status: email.status === 'pendiente' ? 'en_gestion' : email.status,
    }, true);

    logAudit('Correos', emailId, 'convertir_tarea', `Requerimiento vinculado como tarea ID ${createdTask.id}`);
    showToast('Tarea operativa creada y sincronizada exitosamente', 'success');
    return createdTask;
  };

  const resolvePendingEmailPrompt = (action: 'respondido' | 'cerrado' | 'mantener') => {
    if (!pendingEmailResolutionPrompt) return;
    const { emailId } = pendingEmailResolutionPrompt;
    if (action === 'respondido' || action === 'cerrado') {
      updateEmail(emailId, { status: action });
      showToast(`Requerimiento marcado como ${action === 'respondido' ? 'Respondido' : 'Cerrado'}`, 'success');
    } else {
      showToast('Requerimiento mantenido en gestión', 'info');
    }
    setPendingEmailResolutionPrompt(null);
  };

  const dismissPendingEmailPrompt = () => {
    setPendingEmailResolutionPrompt(null);
  };

  const addQuestion = (qData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newQ: Question = {
      ...qData,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuestions((prev) => [newQ, ...prev]);
    logAudit('Preguntas', newQ.id, 'crear', `Pregunta registrada: "${newQ.question}"`);
    showToast('Pregunta registrada', 'success');
    if (isSupabaseConfigured()) {
      upsertQuestionInSupabase(newQ).catch((err) => console.warn('Supabase sync question error:', err));
    }
    return newQ;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    const existing = questions.find((q) => q.id === id);
    if (!existing) return;
    const updatedQ: Question = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    setQuestions((prev) => prev.map((q) => (q.id === id ? updatedQ : q)));
    logAudit('Preguntas', id, 'editar', `Pregunta ${id} modificada`);
    showToast('Pregunta actualizada', 'info');
    if (isSupabaseConfigured()) {
      upsertQuestionInSupabase(updatedQ).catch((err) => console.warn('Supabase update question error:', err));
    }
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, archived: true } : q)));
    logAudit('Preguntas', id, 'eliminar_logico', `Pregunta ${id} archivada`);
    showToast('Pregunta archivada', 'warning');
    if (isSupabaseConfigured()) {
      deleteQuestionFromSupabase(id).catch((err) => console.warn('Supabase delete question error:', err));
    }
  };

  const addQuestionFollowUp = (
    questionId: string,
    followUp: { type: QuestionFollowUpType; note: string }
  ): QuestionFollowUp => {
    const newFollowUp: QuestionFollowUp = {
      id: `qfu_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      questionId,
      type: followUp.type,
      note: followUp.note,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };

    let updatedQ: Question | undefined;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const currentFollowUps = q.followUps || [];
        updatedQ = {
          ...q,
          followUps: [newFollowUp, ...currentFollowUps],
          updatedAt: new Date().toISOString(),
        };
        return updatedQ;
      })
    );

    if (updatedQ && isSupabaseConfigured()) {
      upsertQuestionInSupabase(updatedQ).catch((err) => console.warn('Supabase question follow-up error:', err));
    }

    logAudit('Preguntas', questionId, 'seguimiento', `Hito de seguimiento registrado: ${followUp.note.substring(0, 50)}...`);
    showToast('Seguimiento registrado con éxito', 'success');
    return newFollowUp;
  };

  const deleteQuestionFollowUp = (questionId: string, followUpId: string) => {
    let updatedQ: Question | undefined;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        updatedQ = {
          ...q,
          followUps: (q.followUps || []).filter((f) => f.id !== followUpId),
          updatedAt: new Date().toISOString(),
        };
        return updatedQ;
      })
    );
    if (updatedQ && isSupabaseConfigured()) {
      upsertQuestionInSupabase(updatedQ).catch((err) => console.warn('Supabase question follow-up delete error:', err));
    }
    showToast('Hito de seguimiento eliminado', 'info');
  };

  const addQuestionAttachment = (
    questionId: string,
    attachment: { name: string; size?: string; type?: string; url?: string }
  ): QuestionAttachment => {
    const newAtt: QuestionAttachment = {
      id: `qatt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      questionId,
      name: attachment.name,
      size: attachment.size || '500 KB',
      type: attachment.type || 'application/pdf',
      url: attachment.url || '#',
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.name,
    };

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          attachments: [newAtt, ...(q.attachments || [])],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showToast('Archivo adjuntado a la consulta', 'success');
    return newAtt;
  };

  const deleteQuestionAttachment = (questionId: string, attachmentId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          attachments: (q.attachments || []).filter((a) => a.id !== attachmentId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showToast('Archivo adjunto eliminado', 'info');
  };

  const convertQuestionToTask = (questionId: string): Task | undefined => {
    const targetQ = questions.find((q) => q.id === questionId);
    if (!targetQ) return undefined;

    const newTask: Task = {
      id: `t_q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      programId: targetQ.programId,
      subprogramId: targetQ.subprogramId,
      title: `Seguimiento Consulta: ${targetQ.question.substring(0, 65)}...`,
      description: `Tarea originada desde la consulta/duda: "${targetQ.question}".\nContexto: ${targetQ.context}${targetQ.nextInstance ? `\nPróxima instancia: ${targetQ.nextInstance}` : ''}`,
      responsible: targetQ.responsible || currentUser.name,
      dueDate: targetQ.followUpDate || '2026-08-20',
      priority: targetQ.priority,
      status: 'por_hacer',
      isUrgent: targetQ.isUrgent || targetQ.priority === 'critica',
      origin: 'Pregunta',
      originId: targetQ.id,
      category: targetQ.category === 'financiera' ? 'Finanzas' : targetQ.category === 'administrativa' ? 'Administrativo' : 'Técnica',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    let updatedQ: Question | undefined;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          updatedQ = {
            ...q,
            taskId: newTask.id,
            status: q.status === 'abierta' || q.status === 'pendiente' ? 'en_consulta' : q.status,
            updatedAt: new Date().toISOString(),
          };
          return updatedQ;
        }
        return q;
      })
    );

    if (updatedQ && isSupabaseConfigured()) {
      upsertQuestionInSupabase(updatedQ).catch((err) => console.warn('Supabase question task link error:', err));
    }

    logAudit('Preguntas', questionId, 'convertir_tarea', `Se creó tarea operativa vinculada: "${newTask.title}"`);
    showToast('Tarea de seguimiento creada y sincronizada con éxito', 'success');
    return newTask;
  };

  const resolveQuestion = (questionId: string, finalAnswer: string, sourceOfResponse?: string) => {
    const resolvedDate = new Date().toISOString().substring(0, 10);
    let updatedQ: Question | undefined;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          updatedQ = {
            ...q,
            status: 'resuelta',
            finalAnswer,
            sourceOfResponse: sourceOfResponse || q.sourceOfResponse || 'Gestión Directa',
            resolvedDate,
            updatedAt: new Date().toISOString(),
          };
          return updatedQ;
        }
        return q;
      })
    );

    if (updatedQ && isSupabaseConfigured()) {
      upsertQuestionInSupabase(updatedQ).catch((err) => console.warn('Supabase resolve question error:', err));
    }

    logAudit('Preguntas', questionId, 'resolver', `Consulta resuelta: "${finalAnswer.substring(0, 60)}..."`);
    showToast('Consulta marcada como resuelta', 'success');
  };

  const closeQuestionWithoutAnswer = (questionId: string, reason?: string) => {
    const resolvedDate = new Date().toISOString().substring(0, 10);
    let updatedQ: Question | undefined;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === questionId) {
          updatedQ = {
            ...q,
            status: 'cerrada_sin_respuesta',
            closedReason: reason || 'Cerrada sin respuesta formal por obsolescencia o desistimiento.',
            resolvedDate,
            updatedAt: new Date().toISOString(),
          };
          return updatedQ;
        }
        return q;
      })
    );

    if (updatedQ && isSupabaseConfigured()) {
      upsertQuestionInSupabase(updatedQ).catch((err) => console.warn('Supabase close question error:', err));
    }

    logAudit('Preguntas', questionId, 'cerrar', `Consulta cerrada sin respuesta: ${reason || 'Sin motivo'}`);
    showToast('Consulta cerrada sin respuesta', 'warning');
  };

  const toggleQuestionForNextMeeting = (questionId: string) => {
    let updatedQ: Question | undefined;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const nextVal = !q.forNextMeeting;
        updatedQ = {
          ...q,
          forNextMeeting: nextVal,
          updatedAt: new Date().toISOString(),
        };
        return updatedQ;
      })
    );
    if (updatedQ && isSupabaseConfigured()) {
      upsertQuestionInSupabase(updatedQ).catch((err) => console.warn('Supabase toggle question meeting error:', err));
    }
    showToast('Estado para orden del día de reunión actualizado', 'info');
  };

  const linkQuestionToMeeting = (questionId: string, meetingId?: string) => {
    let updatedQ: Question | undefined;
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        updatedQ = {
          ...q,
          meetingId: meetingId || undefined,
          forNextMeeting: Boolean(meetingId),
          updatedAt: new Date().toISOString(),
        };
        return updatedQ;
      })
    );
    if (updatedQ && isSupabaseConfigured()) {
      upsertQuestionInSupabase(updatedQ).catch((err) => console.warn('Supabase link question meeting error:', err));
    }
    showToast('Vinculación con reunión actualizada', 'info');
  };

  const addKnowledge = (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const nowIso = new Date().toISOString();
    const pIds = Array.isArray(item.programIds) && item.programIds.length > 0
      ? item.programIds
      : item.programId ? [item.programId] : [];

    const initialHistory: KnowledgeHistoryEntry = {
      id: `kh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      date: nowIso,
      user: currentUser.name,
      action: 'Creación',
      details: 'Registro creado en la Base de Conocimiento.',
    };

    const newK: KnowledgeItem = {
      ...item,
      id: `kn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      programIds: pIds,
      category: item.category || 'Criterio técnico',
      status: item.status || 'vigente',
      source: item.source || 'Experiencia operativa',
      tags: Array.isArray(item.tags) ? item.tags : [],
      attachments: Array.isArray(item.attachments) ? item.attachments : [],
      history: item.history && item.history.length > 0 ? item.history : [initialHistory],
      isPinned: Boolean(item.isPinned || item.isFeatured),
      isFeatured: Boolean(item.isPinned || item.isFeatured),
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setKnowledge((prev) => [newK, ...prev]);
    logAudit('Conocimiento', newK.id, 'crear', `Nuevo criterio/conocimiento: "${newK.title}"`);
    showToast('Conocimiento guardado exitosamente', 'success');
    return newK;
  };

  const updateKnowledge = (id: string, updates: Partial<KnowledgeItem>) => {
    const nowIso = new Date().toISOString();
    setKnowledge((prev) =>
      prev.map((k) => {
        if (k.id !== id) return k;

        const currentHistory = Array.isArray(k.history) ? k.history : [];
        const isFeaturedUpdated = updates.isFeatured !== undefined || updates.isPinned !== undefined;
        const newHistoryEntry: KnowledgeHistoryEntry = {
          id: `kh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          date: nowIso,
          user: currentUser.name,
          action: isFeaturedUpdated && Object.keys(updates).length <= 2 ? 'Destacado' : 'Modificación',
          details: updates.status && updates.status !== k.status
            ? `Estado cambiado de ${k.status} a ${updates.status}`
            : updates.reviewBeforeDate && updates.reviewBeforeDate !== k.reviewBeforeDate
            ? `Fecha de revisión actualizada a ${updates.reviewBeforeDate}`
            : 'Contenido y metadatos actualizados.',
        };

        const mergedPinned = updates.isPinned !== undefined ? updates.isPinned : (updates.isFeatured !== undefined ? updates.isFeatured : k.isPinned);
        const pIds = updates.programIds !== undefined 
          ? updates.programIds 
          : (updates.programId ? [updates.programId] : k.programIds);

        return {
          ...k,
          ...updates,
          programIds: pIds,
          isPinned: mergedPinned,
          isFeatured: mergedPinned,
          history: [newHistoryEntry, ...currentHistory],
          updatedAt: nowIso,
        };
      })
    );
    logAudit('Conocimiento', id, 'editar', `Conocimiento ${id} actualizado`);
    showToast('Base de Conocimiento actualizada', 'info');
  };

  const togglePinKnowledge = (id: string) => {
    const nowIso = new Date().toISOString();
    setKnowledge((prev) =>
      prev.map((k) => {
        if (k.id !== id) return k;
        const nextPinned = !k.isPinned;
        const hist: KnowledgeHistoryEntry = {
          id: `kh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          date: nowIso,
          user: currentUser.name,
          action: nextPinned ? 'Destacado' : 'Desmarcado',
          details: nextPinned ? 'Marcado como conocimiento destacado' : 'Removido de destacados',
        };
        return {
          ...k,
          isPinned: nextPinned,
          isFeatured: nextPinned,
          history: [hist, ...(k.history || [])],
          updatedAt: nowIso,
        };
      })
    );
  };

  const deleteKnowledge = (id: string) => {
    const nowIso = new Date().toISOString();
    setKnowledge((prev) =>
      prev.map((k) => {
        if (k.id !== id) return k;
        const hist: KnowledgeHistoryEntry = {
          id: `kh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          date: nowIso,
          user: currentUser.name,
          action: 'Eliminación Lógica',
          details: 'Registro archivado / eliminado suavemente.',
        };
        return {
          ...k,
          archived: true,
          deletedAt: nowIso,
          deletedBy: currentUser.name,
          history: [hist, ...(k.history || [])],
          updatedAt: nowIso,
        };
      })
    );
    logAudit('Conocimiento', id, 'eliminar_logico', `Conocimiento ${id} archivado`);
    showToast('Registro de conocimiento eliminado', 'warning');
  };

  const restoreKnowledge = (id: string) => {
    const nowIso = new Date().toISOString();
    setKnowledge((prev) =>
      prev.map((k) => {
        if (k.id !== id) return k;
        const hist: KnowledgeHistoryEntry = {
          id: `kh_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          date: nowIso,
          user: currentUser.name,
          action: 'Restauración',
          details: 'Registro restaurado desde la papelera.',
        };
        return {
          ...k,
          archived: false,
          deletedAt: undefined,
          deletedBy: undefined,
          history: [hist, ...(k.history || [])],
          updatedAt: nowIso,
        };
      })
    );
    logAudit('Conocimiento', id, 'restaurar', `Conocimiento ${id} restaurado`);
    showToast('Conocimiento restaurado con éxito', 'success');
  };

  const permanentlyDeleteKnowledge = (id: string) => {
    setKnowledge((prev) => prev.filter((k) => k.id !== id));
    logAudit('Conocimiento', id, 'eliminar_logico', `Conocimiento ${id} purgado definitivamente`);
    showToast('Conocimiento eliminado definitivamente', 'warning');
  };

  const addKnowledgeCategory = (category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    if (!knowledgeCategories.includes(trimmed)) {
      setKnowledgeCategories((prev) => [...prev, trimmed]);
      showToast(`Nueva categoría "${trimmed}" creada`, 'success');
    }
  };

  const addKnowledgeSource = (source: string) => {
    const trimmed = source.trim();
    if (!trimmed) return;
    if (!knowledgeSources.includes(trimmed)) {
      setKnowledgeSources((prev) => [...prev, trimmed]);
      showToast(`Nueva fuente "${trimmed}" creada`, 'success');
    }
  };

  const saveQuestionAsKnowledge = (questionId: string, overrides?: Partial<KnowledgeItem>): KnowledgeItem => {
    const q = questions.find((item) => item.id === questionId);
    if (!q) {
      throw new Error(`Consulta ${questionId} no encontrada`);
    }

    let defaultCategory = 'Criterio técnico';
    if (q.category === 'criterio_tecnico') defaultCategory = 'Criterio técnico';
    else if (q.category === 'requisito_administrativo') defaultCategory = 'Requisito administrativo';
    else if (q.category === 'rendicion') defaultCategory = 'Requisito administrativo';
    else if (q.category === 'clinica') defaultCategory = 'Criterio técnico';
    else defaultCategory = 'Buena práctica';

    const cleanContent = q.finalAnswer 
      ? `Orientación Oficial Recibida:\n${q.finalAnswer}${q.context ? `\n\nContexto Original:\n${q.context}` : ''}`
      : (q.context || q.question);

    const sourceVal = q.sourceOfResponse ? 'Servicio de Salud' : 'Experiencia operativa';
    const sourceRef = q.sourceOfResponse 
      ? `Respuesta emitida por: ${q.sourceOfResponse}` 
      : (q.responsible ? `Duda dirigida a: ${q.responsible}` : undefined);

    const newK = addKnowledge({
      title: q.title,
      summary: q.context ? q.context.slice(0, 160) + '...' : q.question.slice(0, 160),
      content: cleanContent,
      category: defaultCategory,
      status: 'vigente',
      source: sourceVal,
      sourceReference: sourceRef,
      programId: q.programId,
      programIds: [q.programId],
      tags: Array.from(new Set(['ConsultaResuelta', ...(q.tags || [])])),
      author: currentUser.name,
      isPinned: false,
      isFeatured: false,
      originQuestionId: q.id,
      attachments: (q.attachments || []).map((att) => ({
        id: att.id,
        name: att.name,
        size: att.size,
        type: att.type,
        url: att.url,
        uploadedAt: att.uploadedAt,
        uploadedBy: att.uploadedBy,
      })),
      history: [
        {
          id: `kh_${Date.now()}_orig`,
          date: new Date().toISOString(),
          user: currentUser.name,
          action: 'Creación desde Consulta',
          details: `Generado a partir de la resolución de la duda técnica "${q.title}".`,
        },
      ],
      ...overrides,
    });

    showToast(`Guardado en Conocimiento: "${q.title}"`, 'success');
    return newK;
  };

  const saveMeetingAgreementAsKnowledge = (meetingId: string, agreementText: string, overrides?: Partial<KnowledgeItem>): KnowledgeItem => {
    const m = meetings.find((item) => item.id === meetingId);
    const programName = m?.programId ? programs.find(p => p.id === m.programId)?.shortName || m.programId : 'General';
    
    const newK = addKnowledge({
      title: `Criterio / Acuerdo: ${agreementText.slice(0, 60)}${agreementText.length > 60 ? '...' : ''}`,
      summary: `Acuerdo operacional adoptado en ${m?.title || 'reunión técnica'} (${m?.date ? formatDate(m.date) : 'fecha reciente'}).`,
      content: agreementText,
      category: 'Criterio técnico',
      status: 'vigente',
      source: 'Reunión',
      sourceReference: m ? `Reunión: ${m.title} (${formatDate(m.date)})` : 'Minuta de reunión',
      programId: m?.programId,
      programIds: m?.programId ? [m.programId] : [],
      tags: ['AcuerdoReunion', programName.replace(/\s+/g, '')],
      author: currentUser.name,
      isPinned: false,
      isFeatured: false,
      originMeetingId: m?.id,
      history: [
        {
          id: `kh_${Date.now()}_meet`,
          date: new Date().toISOString(),
          user: currentUser.name,
          action: 'Creación desde Reunión',
          details: `Generado a partir de acuerdo de reunión "${m?.title || 'Técnica'}".`,
        },
      ],
      ...overrides,
    });

    showToast('Acuerdo guardado en Base de Conocimiento', 'success');
    return newK;
  };

  const addHRRecord = (hr: Omit<HRRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newHr: HRRecord = {
      ...hr,
      id: `hr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setHrRecords((prev) => [newHr, ...prev]);
    logAudit('RRHH', newHr.id, 'crear', `Registro de personal agregado: ${newHr.name} (${newHr.role})`);
    showToast(`Personal ${newHr.name} agregado`, 'success');
    return newHr;
  };

  const updateHRRecord = (id: string, updates: Partial<HRRecord>, silent = false) => {
    setHrRecords((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h))
    );
    if (!silent) {
      logAudit('RRHH', id, 'editar', `Registro RRHH ${id} actualizado`);
      showToast('Registro de personal actualizado', 'info');
    }
  };

  const deleteHRRecord = (id: string) => {
    setHrRecords((prev) => prev.map((h) => (h.id === id ? { ...h, archived: true } : h)));
    logAudit('RRHH', id, 'eliminar_logico', `Registro RRHH ${id} archivado`);
    showToast('Registro de personal archivado', 'warning');
  };

  const addEleamCase = (eleam: Omit<EleamCase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCase: EleamCase = {
      ...eleam,
      id: `eleam_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEleamCases((prev) => [newCase, ...prev]);
    logAudit('ELEAM', newCase.id, 'crear', `Nuevo caso de postulación ELEAM: ${newCase.caseCode}`);
    showToast(`Caso ELEAM ${newCase.caseCode} registrado`, 'success');
    return newCase;
  };

  const updateEleamCase = (id: string, updates: Partial<EleamCase>) => {
    setEleamCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    logAudit('ELEAM', id, 'editar', `Caso ELEAM ${id} actualizado`);
    showToast('Caso ELEAM actualizado', 'info');
  };

  const deleteEleamCase = (id: string) => {
    setEleamCases((prev) => prev.map((c) => (c.id === id ? { ...c, archived: true } : c)));
    logAudit('ELEAM', id, 'eliminar_logico', `Caso ELEAM ${id} archivado`);
    showToast('Caso archivado', 'warning');
  };

  const updateEmpamRecord = (id: string, updates: Partial<EmpamRecord>) => {
    setEmpamRecords((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
    logAudit('EMPAM', id, 'editar', `Registro EMPAM ${id} actualizado`);
    showToast('Métricas EMPAM actualizadas', 'success');
  };

  // ==========================================
  // HANDLERS PARA CONTACTOS (GESTIÓN TRANSVERSAL)
  // ==========================================

  const addContact = (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact => {
    const newContact: Contact = {
      ...contactData,
      id: `ct_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      isActive: contactData.isActive !== undefined ? contactData.isActive : true,
      isFrequent: contactData.isFrequent !== undefined ? contactData.isFrequent : false,
      programIds: contactData.programIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setContacts((prev) => [newContact, ...prev]);
    logAudit('Contactos', newContact.id, 'crear', `Nuevo contacto: ${newContact.name} ${newContact.lastName} (${newContact.institution})`);
    showToast(`Contacto "${newContact.name} ${newContact.lastName}" agregado exitosamente`, 'success');
    if (isSupabaseConfigured()) {
      upsertContactInSupabase(newContact).catch((err) => console.warn('Supabase sync contact error:', err));
    }
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>, silentToast: boolean = false) => {
    const existing = contacts.find((c) => c.id === id);
    if (!existing) return;
    const updatedContact: Contact = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    setContacts((prev) => prev.map((c) => (c.id === id ? updatedContact : c)));
    logAudit('Contactos', id, 'editar', `Contacto ${id} actualizado`);
    if (!silentToast) {
      showToast('Contacto actualizado correctamente', 'success');
    }
    if (isSupabaseConfigured()) {
      upsertContactInSupabase(updatedContact).catch((err) => console.warn('Supabase update contact error:', err));
    }
  };

  const toggleContactFrequent = (id: string) => {
    const existing = contacts.find((c) => c.id === id);
    if (!existing) return;
    const nextVal = !existing.isFrequent;
    const updatedContact: Contact = { ...existing, isFrequent: nextVal, updatedAt: new Date().toISOString() };
    setContacts((prev) => prev.map((c) => (c.id === id ? updatedContact : c)));
    logAudit('Contactos', id, 'editar', `Contacto ${existing.name} ${existing.lastName} ${nextVal ? 'marcado como frecuente' : 'desmarcado de frecuentes'}`);
    showToast(nextVal ? 'Marcado como frecuente ⭐' : 'Removido de frecuentes', 'info');
    if (isSupabaseConfigured()) {
      upsertContactInSupabase(updatedContact).catch((err) => console.warn('Supabase toggle contact error:', err));
    }
  };

  const deleteContact = (id: string, hard: boolean = false) => {
    if (hard) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      logAudit('Contactos', id, 'eliminar_logico', `Contacto ${id} eliminado permanentemente`);
      showToast('Contacto eliminado definitivamente', 'warning');
      if (isSupabaseConfigured()) {
        deleteContactFromSupabase(id).catch((err) => console.warn('Supabase hard delete contact error:', err));
      }
    } else {
      const existing = contacts.find((c) => c.id === id);
      const updatedContact: Contact = existing
        ? { ...existing, archived: true, deletedAt: new Date().toISOString(), deletedBy: currentUser.name }
        : ({ id, archived: true, name: '', email: '', role: '', phone: '', programIds: [], isFrequent: false, isActive: false } as Contact);

      setContacts((prev) =>
        prev.map((c) => (c.id === id ? updatedContact : c))
      );
      logAudit('Contactos', id, 'eliminar_logico', `Contacto ${id} eliminado lógicamente (archivado)`);
      showToast('Contacto eliminado correctamente', 'warning');
      if (isSupabaseConfigured()) {
        deleteContactFromSupabase(id).catch((err) => console.warn('Supabase soft delete contact error:', err));
      }
    }
  };

  const addContactCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!contactCategories.includes(trimmed)) {
      setContactCategories((prev) => [...prev, trimmed]);
      showToast(`Categoría de contacto "${trimmed}" creada`, 'success');
    }
  };

  // ==========================================
  // HANDLERS PARA DOCUMENTOS (GESTIÓN TRANSVERSAL)
  // ==========================================

  const addDocument = (docData: Omit<DocumentRecord, 'id' | 'uploadDate' | 'createdAt' | 'updatedAt'>): DocumentRecord => {
    const initialVersion: DocumentVersion = {
      id: `ver_${Date.now()}_1`,
      versionNumber: docData.version || 'v1.0',
      fileName: docData.fileName || 'documento.pdf',
      fileUrl: docData.fileUrl,
      fileSize: docData.fileSize || '1.0 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.name,
      notes: 'Versión inicial cargada en el repositorio.',
      isCurrent: true,
    };

    const newDoc: DocumentRecord = {
      ...docData,
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      uploadDate: new Date().toISOString().split('T')[0],
      programIds: docData.programIds || [],
      tags: docData.tags || [],
      versions: docData.versions && docData.versions.length > 0 ? docData.versions : [initialVersion],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    logAudit('Documentos', newDoc.id, 'crear', `Nuevo documento: ${newDoc.title} (${newDoc.documentType})`);
    showToast(`Documento "${newDoc.title}" registrado exitosamente`, 'success');
    return newDoc;
  };

  const updateDocument = (id: string, updates: Partial<DocumentRecord>, silentToast: boolean = false) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
    logAudit('Documentos', id, 'editar', `Documento ${id} actualizado`);
    if (!silentToast) {
      showToast('Documento actualizado correctamente', 'success');
    }
  };

  const addDocumentVersion = (
    documentId: string,
    versionData: { versionNumber: string; fileName: string; fileUrl?: string; fileSize?: string; notes?: string; uploadedBy?: string }
  ) => {
    const newVersion: DocumentVersion = {
      id: `ver_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      versionNumber: versionData.versionNumber.trim(),
      fileName: versionData.fileName.trim(),
      fileUrl: versionData.fileUrl,
      fileSize: versionData.fileSize || '1.5 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: versionData.uploadedBy || currentUser.name,
      notes: versionData.notes?.trim() || undefined,
      isCurrent: true,
    };

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          const updatedVersions: DocumentVersion[] = [
            newVersion,
            ...(doc.versions || []).map((v) => ({ ...v, isCurrent: false })),
          ];
          logAudit(
            'Documentos',
            documentId,
            'editar',
            `Nueva versión ${newVersion.versionNumber} para documento: ${doc.title}`
          );
          return {
            ...doc,
            version: newVersion.versionNumber,
            fileName: newVersion.fileName,
            fileUrl: newVersion.fileUrl || doc.fileUrl,
            fileSize: newVersion.fileSize || doc.fileSize,
            versions: updatedVersions,
            updatedAt: new Date().toISOString(),
          };
        }
        return doc;
      })
    );
    showToast(`Nueva versión ${versionData.versionNumber} cargada exitosamente`, 'success');
  };

  const deleteDocument = (id: string, hard: boolean = false) => {
    if (hard) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      logAudit('Documentos', id, 'eliminar_logico', `Documento ${id} eliminado permanentemente`);
      showToast('Documento eliminado definitivamente', 'warning');
    } else {
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === id
            ? { ...d, archived: true, deletedAt: new Date().toISOString(), deletedBy: currentUser.name }
            : d
        )
      );
      logAudit('Documentos', id, 'eliminar_logico', `Documento ${id} archivado (eliminación lógica)`);
      showToast('Documento archivado correctamente', 'warning');
    }
  };

  const addDocumentCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!documentCategories.includes(trimmed)) {
      setDocumentCategories((prev) => [...prev, trimmed]);
      showToast(`Categoría de documento "${trimmed}" creada`, 'success');
    }
  };

  const resolveAlert = (id: string) => {
    setResolvedAlertIds((prev) => [...prev, id]);
    showToast('Alerta resuelta', 'success');
  };

  const dismissAlert = (id: string) => {
    setDismissedAlertIds((prev) => [...prev, id]);
    showToast('Alerta pospuesta', 'info');
  };

  const addAttachment = (att: Omit<FileAttachment, 'id' | 'uploadedAt' | 'uploadedBy'>) => {
    const newAtt: FileAttachment = {
      ...att,
      id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.name,
    };
    setAttachments((prev) => [newAtt, ...prev]);
    showToast(`Documento "${newAtt.name}" adjuntado exitosamente`, 'success');
  };

  const deleteAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    showToast('Documento adjunto eliminado', 'info');
  };

  const addProgram = (programData: Omit<HealthProgram, 'id'> & { id?: string }): HealthProgram => {
    const slugId = programData.id || `prog_${Date.now()}_${(programData.shortName || 'praps').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const newProg: HealthProgram = {
      ...programData,
      id: slugId,
      code: programData.code || 'PRAPS-NUEVO',
      color: programData.color || '#6366f1',
      iconName: programData.iconName || 'Activity',
      annualBudget: programData.annualBudget || 0,
    };

    setPrograms((prev) => [...prev, newProg]);

    // Initialize baseline financial period for 2026
    const initialFin: FinancialPeriod = {
      id: `fin_${newProg.id}_2026`,
      programId: newProg.id,
      year: 2026,
      periodName: 'Presupuesto 2026 - Inicial',
      assignedBudget: newProg.annualBudget || 0,
      modifications: 0,
      executedAmount: 0,
      committedAmount: 0,
      projectedAmount: 0,
      cutoffDate: '2026-08-20',
      notes: 'Presupuesto inicial asignado para el programa.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setFinancialPeriods((prev) => [initialFin, ...prev]);

    // Initialize baseline budget components (Subtítulo 21 y 22)
    const baseBudgetPersonal: BudgetComponent = {
      id: `bc_${newProg.id}_21`,
      programId: newProg.id,
      name: 'Subtítulo 21 - Personal y RRHH',
      budgetToSpend: Math.round((newProg.annualBudget || 0) * 0.7),
      spentAmount: 0,
      category: 'Personal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const baseBudgetBienes: BudgetComponent = {
      id: `bc_${newProg.id}_22`,
      programId: newProg.id,
      name: 'Subtítulo 22 - Bienes y Servicios de Consumo',
      budgetToSpend: Math.round((newProg.annualBudget || 0) * 0.3),
      spentAmount: 0,
      category: 'Bienes y Servicios',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBudgetComponents((prev) => [baseBudgetPersonal, baseBudgetBienes, ...prev]);

    if (isSupabaseConfigured()) {
      upsertProgramInSupabase(newProg).catch((err) =>
        console.warn('Error syncing new program to Supabase:', err?.message)
      );
      upsertFinancialPeriodInSupabase(initialFin).catch((err) =>
        console.warn('Error syncing initial fin period to Supabase:', err?.message)
      );
      upsertBudgetComponentInSupabase(baseBudgetPersonal).catch((err) =>
        console.warn('Error syncing budget personal component to Supabase:', err?.message)
      );
      upsertBudgetComponentInSupabase(baseBudgetBienes).catch((err) =>
        console.warn('Error syncing budget bienes component to Supabase:', err?.message)
      );
    }

    logAudit('Programa', newProg.id, 'crear', `Nuevo programa creado: ${newProg.name} (${newProg.code})`);
    showToast(`Programa "${newProg.shortName}" creado exitosamente`, 'success');
    return newProg;
  };

  const deleteProgram = (id: string) => {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    if (isSupabaseConfigured()) {
      deleteProgramFromSupabase(id).catch((err) =>
        console.warn('Error deleting program from Supabase:', err?.message)
      );
    }
    logAudit('Programa', id, 'eliminar_logico', `Programa ${id} eliminado`);
    showToast('Programa eliminado correctamente', 'warning');
  };

  const updateProgram = (id: string, updates: Partial<HealthProgram>) => {
    let updatedProg: HealthProgram | undefined;
    setPrograms((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          updatedProg = { ...p, ...updates };
          return updatedProg;
        }
        return p;
      })
    );
    if (updatedProg && isSupabaseConfigured()) {
      upsertProgramInSupabase(updatedProg).catch((err) =>
        console.warn('Error syncing program update to Supabase:', err?.message)
      );
    }
    logAudit('Programa', id, 'editar', `Modificación en programa ${id}`);
    showToast('Descripción del programa actualizada correctamente', 'success');
  };

  const updateThresholds = (newSettings: Partial<ThresholdSettings>) => {
    setThresholds((prev) => ({ ...prev, ...newSettings }));
    showToast('Umbrales y parámetros de alertas actualizados', 'success');
  };

  const resetAllDataToSeed = () => {
    localStorage.clear();
    setPrograms(HEALTH_PROGRAMS);
    setHrRecords(INITIAL_HR_RECORDS);
    setIndicators(INITIAL_INDICATORS);
    setFinancialPeriods(INITIAL_FINANCIAL_PERIODS);
    setBudgetComponents(INITIAL_BUDGET_COMPONENTS);
    setBudget2025Notes(INITIAL_BUDGET_2025_NOTES);
    setPurchases(INITIAL_PURCHASES);
    setMeetings(INITIAL_MEETINGS);
    setTasks(INITIAL_TASKS);
    setEmails(INITIAL_EMAILS);
    setQuestions(INITIAL_QUESTIONS);
    setKnowledge(INITIAL_KNOWLEDGE);
    setEleamCases(INITIAL_ELEAM_CASES);
    setEmpamRecords(INITIAL_EMPAM_RECORDS);
    setContacts(INITIAL_CONTACTS);
    setContactCategories(INITIAL_CONTACT_CATEGORIES);
    setDocuments(INITIAL_DOCUMENTS);
    setDocumentCategories(INITIAL_DOCUMENT_CATEGORIES);
    setThresholds(INITIAL_THRESHOLDS);
    setResolvedAlertIds([]);
    setDismissedAlertIds([]);
    setAttachments([]);
    showToast('Datos reiniciados al estado demostrativo de fábrica', 'info');
  };

  const exportAllDataJSON = () => {
    const fullBackup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      exportedBy: currentUser.name,
      programs: HEALTH_PROGRAMS,
      establishments: ESTABLISHMENTS,
      thresholds,
      hrRecords,
      indicators,
      financialPeriods,
      purchases,
      meetings,
      tasks,
      emails,
      questions,
      knowledge,
      eleamCases,
      empamRecords,
      contacts,
      documents,
      auditLogs,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `quilicura_salud_backup_${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Respaldo JSON descargado', 'success');
  };

  const exportTableCSV = (entityType: string, programFilter?: ProgramId | null) => {
    let rows: string[][] = [];
    let filename = `export_${entityType}_${todayStr}.csv`;

    if (entityType === 'tasks') {
      const filtered = tasks.filter((t) => !t.archived && (!programFilter || t.programId === programFilter));
      rows = [
        ['ID', 'Programa', 'Título', 'Responsable', 'Prioridad', 'Vencimiento', 'Estado', 'Origen'],
        ...filtered.map((t) => [
          t.id,
          t.programId,
          `"${t.title.replace(/"/g, '""')}"`,
          t.responsible,
          t.priority,
          t.dueDate,
          t.status,
          t.origin || 'Manual',
        ]),
      ];
    } else if (entityType === 'indicators') {
      const filtered = indicators.filter((i) => !i.archived && (!programFilter || i.programId === programFilter));
      rows = [
        ['Código', 'Programa', 'Nombre', 'Periodicidad', 'Meta Anual', 'Meta Período', 'Resultado Actual', 'Unidad', 'Corte', 'Responsable'],
        ...filtered.map((i) => [
          i.code,
          i.programId,
          `"${i.name.replace(/"/g, '""')}"`,
          i.periodicity,
          i.annualTarget.toString(),
          i.periodTarget.toString(),
          i.currentResult.toString(),
          i.unit,
          i.cutoffDate,
          i.responsible,
        ]),
      ];
    } else if (entityType === 'purchases') {
      const filtered = purchases.filter((p) => !p.archived && (!programFilter || p.programId === programFilter));
      rows = [
        ['Categoría', 'Programa', 'Ítem / Servicio', 'Monto Total c/IVA', 'Proveedor', 'Modalidad', 'Fecha Clave (Aceptación OC/Firma Decreto/Cierre Contrato)', 'Estado', 'Responsable'],
        ...filtered.map((p) => [
          `"${(p.category || 'Insumos').replace(/"/g, '""')}"`,
          p.programId,
          `"${p.itemOrService.replace(/"/g, '""')}"`,
          ((p.totalPriceWithTax ?? p.estimatedAmount) || 0).toString(),
          p.supplier || '-',
          p.modalidadCompra || 'Convenio Marco',
          p.requiredDate || p.orderAcceptedDate || '-',
          p.status,
          p.responsible,
        ]),
      ];
    } else if (entityType === 'hr') {
      const filtered = hrRecords.filter((h) => !h.archived && (!programFilter || h.programId === programFilter));
      rows = [
        ['Nombre', 'Profesión', 'Cargo', 'Programa', 'Establecimiento', 'Horas', 'Contrato', 'Estado'],
        ...filtered.map((h) => [
          h.name,
          h.profession,
          h.role,
          h.programId,
          h.establishmentId,
          h.programHours.toString(),
          h.contractType,
          h.status,
        ]),
      ];
    } else if (entityType === 'contacts') {
      const filtered = contacts.filter((c) => !c.archived && (!programFilter || c.programIds.includes(programFilter) || c.programIds.length === 0));
      rows = [
        ['Nombre Completo', 'Cargo / Rol', 'Institución / Área', 'Categoría', 'Email', 'Teléfono', 'Programas Asociados', 'Es Frecuente', 'Estado'],
        ...filtered.map((c) => [
          `"${c.name} ${c.lastName}".trim()`,
          `"${(c.role || '').replace(/"/g, '""')}"`,
          `"${(c.institution || '').replace(/"/g, '""')}"`,
          c.category,
          c.email || '',
          c.phone || '',
          `"${c.programIds.join(', ')}"`,
          c.isFrequent ? 'Sí' : 'No',
          c.isActive ? 'Activo' : 'Inactivo',
        ]),
      ];
    } else if (entityType === 'documents') {
      const filtered = documents.filter((d) => !d.archived && (!programFilter || d.programIds.includes(programFilter) || d.programIds.length === 0));
      rows = [
        ['Título', 'Tipo / Categoría', 'Versión', 'Fecha Documento', 'Vencimiento', 'Estado Vigencia', 'Programas Asociados', 'Archivo', 'Confidencialidad'],
        ...filtered.map((d) => [
          `"${d.title.replace(/"/g, '""')}"`,
          d.category,
          d.version || 'v1.0',
          d.documentDate || d.uploadDate,
          d.expiryDate || '-',
          getDocumentEffectiveStatus(d),
          `"${d.programIds.join(', ')}"`,
          d.fileName,
          d.confidentiality || 'Público',
        ]),
      ];
    }

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(';')).join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Archivo CSV generado exitosamente`, 'success');
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        isVerifyingAuthCode,
        isSupabaseActive: isSupabaseConfigured(),
        authScreen,
        setAuthScreen,
        registeredAccounts,
        pendingVerificationEmail,
        setPendingVerificationEmail,
        pendingResetEmail,
        setPendingResetEmail,
        login,
        signInWithGoogle,
        loginWithGoogle,
        registerWithGoogle,
        registerUser,
        verifyAccountEmail,
        resendVerificationLink,
        sendPasswordResetLink,
        resetUserPassword,
        changeUserPassword,
        logout,
        currentUser,
        establishments,
        programs,
        addProgram,
        updateProgram,
        deleteProgram,
        thresholds,
        updateThresholds,
        activeView,
        setActiveView,
        selectedProgramId,
        setSelectedProgramId,
        globalSearchQuery,
        setGlobalSearchQuery,
        hrRecords,
        indicators,
        financialPeriods,
        budgetComponents,
        budget2025Notes,
        purchases,
        meetings,
        tasks,
        taskCategories,
        emails,
        questions,
        knowledge,
        knowledgeCategories,
        knowledgeSources,
        eleamCases,
        empamRecords,
        contacts,
        contactCategories,
        documents,
        documentCategories,
        alerts,
        auditLogs,
        attachments,
        programSummaries,
        globalAlerts,
        urgentTasks,
        todayTasks,
        upcomingTasks,
        overdueTasks,
        indicatorsInRisk,
        financialAlerts,
        unansweredQuestions,
        addTaskCategory,
        updateTaskCategory,
        toggleTaskCategoryStatus,
        addTask,
        updateTask,
        quickUpdateTaskStatus,
        completeTask,
        reopenTask,
        duplicateTask,
        deleteTask,
        deleteTaskWithConfirmation,
        restoreTask,
        toggleTaskUrgent,
        addChecklistItem,
        toggleChecklistItem,
        updateChecklistItem,
        removeChecklistItem,
        addIndicator,
        updateIndicator,
        recordMeasurement,
        deleteIndicator,
        updateFinancialPeriod,
        addFinancialPeriod,
        deleteFinancialPeriod,
        addBudgetComponent,
        updateBudgetComponent,
        deleteBudgetComponent,
        updateBudget2025Note,
        addPurchase,
        updatePurchase,
        deletePurchase,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        addMeetingAgreement,
        updateMeetingAgreement,
        deleteMeetingAgreement,
        addMeetingCommitment,
        updateMeetingCommitment,
        deleteMeetingCommitment,
        toggleMeetingCommitmentStatus,
        convertCommitmentToTask,
        addEmail,
        updateEmail,
        deleteEmail,
        addEmailFollowUp,
        deleteEmailFollowUp,
        addEmailAttachment,
        deleteEmailAttachment,
        convertEmailToTask,
        pendingEmailResolutionPrompt,
        resolvePendingEmailPrompt,
        dismissPendingEmailPrompt,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addQuestionFollowUp,
        deleteQuestionFollowUp,
        addQuestionAttachment,
        deleteQuestionAttachment,
        convertQuestionToTask,
        resolveQuestion,
        closeQuestionWithoutAnswer,
        toggleQuestionForNextMeeting,
        linkQuestionToMeeting,
        addKnowledge,
        updateKnowledge,
        togglePinKnowledge,
        deleteKnowledge,
        restoreKnowledge,
        permanentlyDeleteKnowledge,
        addKnowledgeCategory,
        addKnowledgeSource,
        saveQuestionAsKnowledge,
        saveMeetingAgreementAsKnowledge,
        addHRRecord,
        updateHRRecord,
        deleteHRRecord,
        addEleamCase,
        updateEleamCase,
        deleteEleamCase,
        updateEmpamRecord,
        addContact,
        updateContact,
        deleteContact,
        toggleContactFrequent,
        addContactCategory,
        addDocument,
        updateDocument,
        deleteDocument,
        addDocumentVersion,
        addDocumentCategory,
        updateCurrentUser,
        updateEstablishment,
        addEstablishment,
        deleteEstablishment,
        darkMode,
        setDarkMode,
        toggleDarkMode,
        language,
        setLanguage,
        t,
        resolveAlert,
        dismissAlert,
        addAttachment,
        deleteAttachment,
        isGoogleCalendarConnected,
        isGoogleCalendarSyncing,
        lastGoogleCalendarSync,
        googleCalendarEmail,
        updateGoogleCalendarAccount,
        connectGoogleCalendar,
        disconnectGoogleCalendar,
        syncGoogleCalendar,
        exportMeetingToGoogleCalendar,
        exportTaskToGoogleCalendar,
        isSupabaseConnected,
        supabaseDbStatus,
        supabaseSyncState,
        supabaseLastSyncTime,
        supabaseSyncError,
        syncWithSupabase,
        testSupabaseDatabaseConnection,
        pushAllDataToSupabase: handlePushAllDataToSupabase,
        toasts,
        showToast,
        removeToast,
        resetAllDataToSeed,
        exportAllDataJSON,
        exportTableCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
