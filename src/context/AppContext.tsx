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
  KnowledgeItem,
  EleamCase,
  EmpamRecord,
  Alert,
  AuditLog,
  ThresholdSettings,
  FileAttachment,
  getPurchaseDateFieldLabel,
  getPurchaseEffectiveMacroState,
  getPurchaseAlerts,
} from '../types';
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
  INITIAL_ELEAM_CASES,
  INITIAL_EMPAM_RECORDS,
} from '../data/initialData';

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
  establishments: Establishment[];
  programs: HealthProgram[];
  updateProgram: (id: string, updates: Partial<HealthProgram>) => void;
  thresholds: ThresholdSettings;
  updateThresholds: (settings: Partial<ThresholdSettings>) => void;

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
  eleamCases: EleamCase[];
  empamRecords: EmpamRecord[];
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

  addKnowledge: (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => KnowledgeItem;
  updateKnowledge: (id: string, updates: Partial<KnowledgeItem>) => void;
  togglePinKnowledge: (id: string) => void;
  deleteKnowledge: (id: string) => void;

  addHRRecord: (hr: Omit<HRRecord, 'id' | 'createdAt' | 'updatedAt'>) => HRRecord;
  updateHRRecord: (id: string, updates: Partial<HRRecord>, silent?: boolean) => void;
  deleteHRRecord: (id: string) => void;

  addEleamCase: (eleam: Omit<EleamCase, 'id' | 'createdAt' | 'updatedAt'>) => EleamCase;
  updateEleamCase: (id: string, updates: Partial<EleamCase>) => void;
  deleteEleamCase: (id: string) => void;

  updateEmpamRecord: (id: string, updates: Partial<EmpamRecord>) => void;

  resolveAlert: (id: string) => void;
  dismissAlert: (id: string) => void;

  // File Upload Handling
  addAttachment: (attachment: Omit<FileAttachment, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  deleteAttachment: (id: string) => void;

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
  const [establishments] = useState<Establishment[]>(ESTABLISHMENTS);
  const [programs, setPrograms] = useState<HealthProgram[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_programs`);
      return saved ? JSON.parse(saved) : HEALTH_PROGRAMS;
    } catch {
      return HEALTH_PROGRAMS;
    }
  });
  const [currentUser] = useState<User>(CURRENT_USER);

  const [thresholds, setThresholds] = useState<ThresholdSettings>(() => {
    try {
      const saved = localStorage.getItem(THRESHOLDS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_THRESHOLDS;
    } catch {
      return INITIAL_THRESHOLDS;
    }
  });

  const [activeView, setActiveView] = useState<string>('hoy');
  const [selectedProgramId, setSelectedProgramId] = useState<ProgramId | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

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
      return saved ? JSON.parse(saved) : INITIAL_KNOWLEDGE;
    } catch { return INITIAL_KNOWLEDGE; }
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
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_eleam`, JSON.stringify(eleamCases)); }, [eleamCases]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_empam`, JSON.stringify(empamRecords)); }, [empamRecords]);
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

    return generated;
  }, [tasks, purchases, indicators, financialPeriods, emails, thresholds, resolvedAlertIds, dismissedAlertIds]);

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

      // Calculate automated Traffic Light (🟢 Normal, 🟡 Atención, 🔴 Crítico, ⚪ Sin datos)
      let status: TrafficLightStatus = 'green';
      let statusReason = 'Operación en regla sin excepciones críticas.';

      const hasCriticalAlert = progAlerts.some((a) => a.severity === 'critica');
      const hasPurchProblems = progPurchases.some((p) => p.status === 'problema');
      const hasCriticalOverdueTask = progTasks.some((t) => t.status !== 'completada' && t.dueDate < todayStr && t.priority === 'critica');
      const hasLowFin = finRate > 0 && finRate < thresholds.lowFinancialExecutionPercent;

      if (hasCriticalAlert || hasPurchProblems || hasCriticalOverdueTask || critical > 0 || hasLowFin) {
        status = 'red';
        if (hasPurchProblems) statusReason = 'Compra crítica bloqueada/con problema.';
        else if (hasCriticalOverdueTask) statusReason = 'Tarea de prioridad crítica vencida.';
        else if (hasLowFin) statusReason = `Baja ejecución financiera (${finRate.toFixed(1)}%).`;
        else if (critical > 0) statusReason = 'Indicador bajo el umbral crítico.';
        else statusReason = 'Alertas críticas activas.';
      } else if (overdueCount > 0 || atRisk > 0 || progAlerts.length > 0) {
        status = 'yellow';
        if (overdueCount > 0) statusReason = `${overdueCount} tarea(s) vencida(s).`;
        else if (atRisk > 0) statusReason = 'Indicador en zona de riesgo.';
        else statusReason = 'Alertas pendientes de atención.';
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

  const updateTaskCategory = (id: string, updates: Partial<TaskCategory>) => {
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
    if (!silentToast) {
      showToast('Tarea actualizada', 'info');
    }
  };

  const quickUpdateTaskStatus = (id: string, newStatus: TaskStatus) => {
    const normalized = normalizeTaskStatus(newStatus);
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    updateTask(id, { status: normalized }, true);

    if (normalized === 'terminada') {
      showToast(`Tarea completada 🎉`, 'success');
    } else if (normalized === 'en_ejecucion') {
      showToast(`Tarea en ejecución ⚡`, 'info');
    } else {
      showToast(`Tarea pasada a Por hacer`, 'info');
    }
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
    showToast('Acuerdo actualizado', 'info');
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
    showToast('Compromiso actualizado', 'info');
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
    if (!silentToast) {
      showToast('Requerimiento actualizado', 'info');
    }
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

  const addKnowledge = (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newK: KnowledgeItem = {
      ...item,
      id: `kn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setKnowledge((prev) => [newK, ...prev]);
    logAudit('Conocimiento', newK.id, 'crear', `Nuevo tip/criterio: "${newK.title}"`);
    showToast('Elemento guardado en base de conocimiento', 'success');
    return newK;
  };

  const updateKnowledge = (id: string, updates: Partial<KnowledgeItem>) => {
    setKnowledge((prev) =>
      prev.map((k) => (k.id === id ? { ...k, ...updates, updatedAt: new Date().toISOString() } : k))
    );
    logAudit('Conocimiento', id, 'editar', `Tip ${id} actualizado`);
    showToast('Conocimiento actualizado', 'info');
  };

  const togglePinKnowledge = (id: string) => {
    setKnowledge((prev) =>
      prev.map((k) => (k.id === id ? { ...k, isPinned: !k.isPinned, updatedAt: new Date().toISOString() } : k))
    );
  };

  const deleteKnowledge = (id: string) => {
    setKnowledge((prev) => prev.map((k) => (k.id === id ? { ...k, archived: true } : k)));
    logAudit('Conocimiento', id, 'eliminar_logico', `Tip ${id} archivado`);
    showToast('Elemento archivado', 'warning');
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
        updateProgram,
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
        eleamCases,
        empamRecords,
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
        addKnowledge,
        updateKnowledge,
        togglePinKnowledge,
        deleteKnowledge,
        addHRRecord,
        updateHRRecord,
        deleteHRRecord,
        addEleamCase,
        updateEleamCase,
        deleteEleamCase,
        updateEmpamRecord,
        resolveAlert,
        dismissAlert,
        addAttachment,
        deleteAttachment,
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
