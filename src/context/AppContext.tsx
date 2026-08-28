import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
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
} from '../types';
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

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // Master data
  currentUser: User;
  updateCurrentUser: (updates: Partial<User>) => void;
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
  addTaskCategory: (name: string) => TaskCategory;
  updateTaskCategory: (id: string, updates: Partial<TaskCategory>) => void;
  toggleTaskCategoryStatus: (id: string) => void;

  // Mutations with Auto-Audit & Alerta Triggering
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>, silentToast?: boolean) => void;
  quickUpdateTaskStatus: (id: string, newStatus: TaskStatus) => void;
  completeTask: (id: string) => void;
  reopenTask: (id: string) => void;
  duplicateTask: (id: string, newDueDate: string) => Task;
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

  const updateCurrentUser = (updates: Partial<User>) => {
    setCurrentUser((prev) => {
      let avatar = prev.avatar;
      if (updates.name && (!updates.avatar || updates.avatar === prev.avatar)) {
        const parts = updates.name.trim().split(/\s+/);
        if (parts.length >= 2) {
          avatar = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        } else if (parts.length === 1 && parts[0].length > 0) {
          avatar = parts[0].substring(0, 2).toUpperCase();
        }
      }
      const nextUser = { ...prev, ...updates, ...(avatar ? { avatar } : {}) };
      try {
        localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(nextUser));
      } catch (e) {
        console.error(e);
      }
      return nextUser;
    });
    showToast('Perfil de usuario actualizado exitosamente', 'success');
  };

  const updateEstablishment = (id: string, updates: Partial<Establishment>) => {
    setEstablishments((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      try {
        localStorage.setItem(`${STORAGE_KEY}_establishments`, JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
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
      // Migrate old IND-XXX-XX format to Indicador 1, Indicador 2... and ensure pesoRelativo exists
      const progCounts: Record<string, number> = {};
      return parsed.map((ind) => {
        const initialMatch = INITIAL_INDICATORS.find((i) => i.id === ind.id);
        const code = /^IND-[A-Z]+-\d+$/i.test(ind.code || '')
          ? (() => {
              const pId = ind.programId || 'default';
              progCounts[pId] = (progCounts[pId] || 0) + 1;
              return `Indicador ${progCounts[pId]}`;
            })()
          : (ind.code || 'Indicador 1');
        return {
          ...ind,
          code,
          pesoRelativo: ind.pesoRelativo ?? initialMatch?.pesoRelativo ?? 50,
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
        const pct = ind.direction === 'higher_is_better'
          ? (ind.periodTarget > 0 ? (ind.currentResult / ind.periodTarget) * 100 : 0)
          : (ind.currentResult > 0 ? (ind.periodTarget / ind.currentResult) * 100 : 100);
        totalComp += pct;
        if (pct < thresholds.indicatorDangerPercent) critical++;
        else if (pct < thresholds.indicatorWarningPercent) atRisk++;
      });
      const avgComp = progIndicators.length > 0 ? totalComp / progIndicators.length : 0;

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
  const addTaskCategory = (name: string): TaskCategory => {
    const trimmed = name.trim();
    const newCat: TaskCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: trimmed,
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
    const id = `tsk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
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
  };

  const deleteTaskWithConfirmation = (id: string) => {
    deleteTask(id);
  };

  const restoreTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          archived: false,
          deletedAt: undefined,
          deletedBy: undefined,
        };
      })
    );
    logAudit('Tarea', id, 'restaurar', `Tarea ${id} restaurada`);
    showToast('Tarea restaurada', 'success');
  };

  const addChecklistItem = (taskId: string, description: string) => {
    const trimmed = description.trim();
    if (!trimmed) return;
    const newItem: TaskChecklistItem = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      description: trimmed,
      isCompleted: false,
    };
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentList = t.checklist || [];
        return {
          ...t,
          checklist: [...currentList, newItem],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showToast('Ítem agregado al checklist', 'info');
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentList = t.checklist || [];
        const updatedList = currentList.map((item) =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );
        return {
          ...t,
          checklist: updatedList,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const updateChecklistItem = (taskId: string, itemId: string, description: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentList = t.checklist || [];
        const updatedList = currentList.map((item) =>
          item.id === itemId ? { ...item, description: description.trim() } : item
        );
        return {
          ...t,
          checklist: updatedList,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const removeChecklistItem = (taskId: string, itemId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const currentList = t.checklist || [];
        return {
          ...t,
          checklist: currentList.filter((item) => item.id !== itemId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showToast('Ítem eliminado del checklist', 'info');
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
    return newInd;
  };

  const updateIndicator = (id: string, updates: Partial<Indicator>) => {
    setIndicators((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i))
    );
    logAudit('Indicador', id, 'editar', `Indicador ${id} actualizado`);
    showToast('Indicador actualizado y semáforos recalculados', 'info');
  };

  const recordMeasurement = (indicatorId: string, result: number, period: string, notes?: string) => {
    setIndicators((prev) =>
      prev.map((ind) => {
        if (ind.id !== indicatorId) return ind;
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
        return {
          ...ind,
          currentResult: result,
          cutoffDate: todayStr,
          measurements: [...ind.measurements, newMeas],
          updatedAt: new Date().toISOString(),
        };
      })
    );
    logAudit('Indicador', indicatorId, 'editar', `Medición registrada para período ${period}: ${result}`);
    showToast('Nueva medición registrada exitosamente', 'success');
  };

  const deleteIndicator = (id: string) => {
    setIndicators((prev) => prev.map((i) => (i.id === id ? { ...i, archived: true } : i)));
    logAudit('Indicador', id, 'eliminar_logico', `Indicador ${id} archivado`);
    showToast('Indicador archivado', 'warning');
  };

  const updateFinancialPeriod = (id: string, updates: Partial<FinancialPeriod>) => {
    setFinancialPeriods((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f))
    );
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
    logAudit('Finanzas', newFin.id, 'crear', `Nuevo período financiero para ${newFin.programId}`);
    showToast('Período financiero creado', 'success');
  };

  const deleteFinancialPeriod = (id: string) => {
    setFinancialPeriods((prev) => prev.filter((f) => f.id !== id));
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
    logAudit('Finanzas', newComp.id, 'crear', `Nuevo componente presupuestario ${newComp.name} para ${newComp.programId}`);
    showToast(`Componente "${newComp.name}" agregado exitosamente`, 'success');
    return newComp;
  };

  const updateBudgetComponent = (id: string, updates: Partial<BudgetComponent>) => {
    setBudgetComponents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    logAudit('Finanzas', id, 'editar', `Componente presupuestario ID ${id} actualizado`);
    showToast('Componente presupuestario actualizado', 'success');
  };

  const deleteBudgetComponent = (id: string) => {
    setBudgetComponents((prev) => prev.filter((c) => c.id !== id));
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
    return newPur;
  };

  const updatePurchase = (id: string, updates: Partial<Purchase>) => {
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const merged: Purchase = {
          ...p,
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        // Si no se pasó un macroState explícito en updates, recalcular según microestados
        if (!updates.macroState) {
          merged.macroState = getPurchaseEffectiveMacroState(merged);
        }
        return merged;
      })
    );
    logAudit('Compras', id, 'editar', `Compra ${id} actualizada`);
  };

  const deletePurchase = (id: string) => {
    setPurchases((prev) => prev.map((p) => (p.id === id ? { ...p, archived: true } : p)));
    logAudit('Compras', id, 'eliminar_logico', `Compra ${id} archivada`);
    showToast('Compra archivada', 'warning');
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
    return newMeeting;
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
    logAudit('Reuniones', id, 'editar', `Reunión ${id} actualizada`);
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

    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const currentAgreements = Array.isArray(m.agreements) ? m.agreements : [];
        return {
          ...m,
          agreements: [...currentAgreements, newAgr],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    logAudit('Reuniones', meetingId, 'crear', `Acuerdo agregado: "${description}"`);
    showToast('Acuerdo registrado', 'success');
    return newAgr;
  };

  const updateMeetingAgreement = (meetingId: string, agreementId: string, updates: Partial<MeetingAgreement>) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const currentAgreements = Array.isArray(m.agreements) ? m.agreements : [];
        return {
          ...m,
          agreements: currentAgreements.map((a) => (a.id === agreementId ? { ...a, ...updates } : a)),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    logAudit('Reuniones', meetingId, 'editar', `Acuerdo actualizado: ${agreementId}`);
  };

  const deleteMeetingAgreement = (meetingId: string, agreementId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        const currentAgreements = Array.isArray(m.agreements) ? m.agreements : [];
        return {
          ...m,
          agreements: currentAgreements.filter((a) => a.id !== agreementId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
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

    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          commitments: [...(m.commitments || []), newCom],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    logAudit('Reuniones', meetingId, 'crear', `Compromiso agregado: "${newCom.description}" para ${newCom.responsible}`);
    showToast('Compromiso registrado en la sesión', 'success');
    return newCom;
  };

  const updateMeetingCommitment = (meetingId: string, commitmentId: string, updates: Partial<MeetingCommitment>) => {
    let linkedTaskId: string | undefined;
    let targetStatus: CommitmentStatus | undefined;
    const nowIso = new Date().toISOString();

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
        return {
          ...m,
          commitments: updatedCommitments,
          updatedAt: nowIso,
        };
      })
    );

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
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          commitments: (m.commitments || []).filter((c) => c.id !== commitmentId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
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
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          commitments: (m.commitments || []).map((c) =>
            c.id === commitmentId ? { ...c, taskId: newTask.id, updatedAt: new Date().toISOString() } : c
          ),
          updatedAt: new Date().toISOString(),
        };
      })
    );

    logAudit('Reuniones', meetingId, 'convertir_tarea', `Compromiso "${commitment.description}" convertido en tarea ID ${newTask.id}`);
    showToast('Compromiso sincronizado como tarea oficial en tiempo real', 'success');
    return newTask;
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, archived: true } : m)));
    logAudit('Reuniones', id, 'eliminar_logico', `Reunión ${id} archivada`);
    showToast('Instancia archivada', 'warning');
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
    return newQ;
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates, updatedAt: new Date().toISOString() } : q))
    );
    logAudit('Preguntas', id, 'editar', `Pregunta ${id} modificada`);
    showToast('Pregunta actualizada', 'info');
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, archived: true } : q)));
    logAudit('Preguntas', id, 'eliminar_logico', `Pregunta ${id} archivada`);
    showToast('Pregunta archivada', 'warning');
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

    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const currentFollowUps = q.followUps || [];
        return {
          ...q,
          followUps: [newFollowUp, ...currentFollowUps],
          updatedAt: new Date().toISOString(),
        };
      })
    );

    logAudit('Preguntas', questionId, 'seguimiento', `Hito de seguimiento registrado: ${followUp.note.substring(0, 50)}...`);
    showToast('Seguimiento registrado con éxito', 'success');
    return newFollowUp;
  };

  const deleteQuestionFollowUp = (questionId: string, followUpId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        return {
          ...q,
          followUps: (q.followUps || []).filter((f) => f.id !== followUpId),
          updatedAt: new Date().toISOString(),
        };
      })
    );
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

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              taskId: newTask.id,
              status: q.status === 'abierta' || q.status === 'pendiente' ? 'en_consulta' : q.status,
              updatedAt: new Date().toISOString(),
            }
          : q
      )
    );

    logAudit('Preguntas', questionId, 'convertir_tarea', `Se creó tarea operativa vinculada: "${newTask.title}"`);
    showToast('Tarea de seguimiento creada y sincronizada con éxito', 'success');
    return newTask;
  };

  const resolveQuestion = (questionId: string, finalAnswer: string, sourceOfResponse?: string) => {
    const resolvedDate = new Date().toISOString().substring(0, 10);
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              status: 'resuelta',
              finalAnswer,
              sourceOfResponse: sourceOfResponse || q.sourceOfResponse || 'Gestión Directa',
              resolvedDate,
              updatedAt: new Date().toISOString(),
            }
          : q
      )
    );

    logAudit('Preguntas', questionId, 'resolver', `Consulta resuelta: "${finalAnswer.substring(0, 60)}..."`);
    showToast('Consulta marcada como resuelta', 'success');
  };

  const closeQuestionWithoutAnswer = (questionId: string, reason?: string) => {
    const resolvedDate = new Date().toISOString().substring(0, 10);
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              status: 'cerrada_sin_respuesta',
              closedReason: reason || 'Cerrada sin respuesta formal por obsolescencia o desistimiento.',
              resolvedDate,
              updatedAt: new Date().toISOString(),
            }
          : q
      )
    );

    logAudit('Preguntas', questionId, 'cerrar', `Consulta cerrada sin respuesta: ${reason || 'Sin motivo'}`);
    showToast('Consulta cerrada sin respuesta', 'warning');
  };

  const toggleQuestionForNextMeeting = (questionId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q;
        const nextVal = !q.forNextMeeting;
        return {
          ...q,
          forNextMeeting: nextVal,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    showToast('Estado para orden del día de reunión actualizado', 'info');
  };

  const linkQuestionToMeeting = (questionId: string, meetingId?: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              meetingId: meetingId || undefined,
              forNextMeeting: Boolean(meetingId),
              updatedAt: new Date().toISOString(),
            }
          : q
      )
    );
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
    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>, silentToast: boolean = false) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c))
    );
    logAudit('Contactos', id, 'editar', `Contacto ${id} actualizado`);
    if (!silentToast) {
      showToast('Contacto actualizado correctamente', 'success');
    }
  };

  const toggleContactFrequent = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextVal = !c.isFrequent;
          logAudit('Contactos', id, 'editar', `Contacto ${c.name} ${c.lastName} ${nextVal ? 'marcado como frecuente' : 'desmarcado de frecuentes'}`);
          showToast(nextVal ? 'Marcado como frecuente ⭐' : 'Removido de frecuentes', 'info');
          return { ...c, isFrequent: nextVal, updatedAt: new Date().toISOString() };
        }
        return c;
      })
    );
  };

  const deleteContact = (id: string, hard: boolean = false) => {
    if (hard) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      logAudit('Contactos', id, 'eliminar_logico', `Contacto ${id} eliminado permanentemente`);
      showToast('Contacto eliminado definitivamente', 'warning');
    } else {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, archived: true, deletedAt: new Date().toISOString(), deletedBy: currentUser.name }
            : c
        )
      );
      logAudit('Contactos', id, 'eliminar_logico', `Contacto ${id} eliminado lógicamente (archivado)`);
      showToast('Contacto eliminado correctamente', 'warning');
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

    logAudit('Programa', newProg.id, 'crear', `Nuevo programa creado: ${newProg.name} (${newProg.code})`);
    showToast(`Programa "${newProg.shortName}" creado exitosamente`, 'success');
    return newProg;
  };

  const deleteProgram = (id: string) => {
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    logAudit('Programa', id, 'eliminar_logico', `Programa ${id} eliminado`);
    showToast('Programa eliminado correctamente', 'warning');
  };

  const updateProgram = (id: string, updates: Partial<HealthProgram>) => {
    setPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
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
