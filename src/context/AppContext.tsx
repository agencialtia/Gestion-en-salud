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
  Purchase,
  Meeting,
  Commitment,
  Task,
  PendingEmail,
  Question,
  KnowledgeItem,
  EleamCase,
  EmpamRecord,
  Alert,
  AuditLog,
  ThresholdSettings,
  FileAttachment,
} from '../types';
import {
  CURRENT_USER,
  ESTABLISHMENTS,
  HEALTH_PROGRAMS,
  INITIAL_THRESHOLDS,
  INITIAL_HR_RECORDS,
  INITIAL_INDICATORS,
  INITIAL_FINANCIAL_PERIODS,
  INITIAL_PURCHASES,
  INITIAL_MEETINGS,
  INITIAL_TASKS,
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
  purchases: Purchase[];
  meetings: Meeting[];
  tasks: Task[];
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

  // Mutations with Auto-Audit & Alerta Triggering
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;

  addIndicator: (indicator: Omit<Indicator, 'id' | 'measurements' | 'createdAt' | 'updatedAt'>) => Indicator;
  updateIndicator: (id: string, updates: Partial<Indicator>) => void;
  recordMeasurement: (indicatorId: string, result: number, period: string, notes?: string) => void;
  deleteIndicator: (id: string) => void;

  updateFinancialPeriod: (id: string, updates: Partial<FinancialPeriod>) => void;
  addFinancialPeriod: (fin: Omit<FinancialPeriod, 'id' | 'createdAt' | 'updatedAt'>) => void;
  deleteFinancialPeriod: (id: string) => void;

  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => Purchase;
  updatePurchase: (id: string, updates: Partial<Purchase>) => void;
  deletePurchase: (id: string) => void;

  addMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Meeting;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  convertCommitmentToTask: (meetingId: string, commitmentId: string) => void;
  deleteMeeting: (id: string) => void;

  addEmail: (email: Omit<PendingEmail, 'id' | 'createdAt' | 'updatedAt'>) => PendingEmail;
  updateEmail: (id: string, updates: Partial<PendingEmail>) => void;
  deleteEmail: (id: string) => void;

  addQuestion: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => Question;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;

  addKnowledge: (item: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>) => KnowledgeItem;
  updateKnowledge: (id: string, updates: Partial<KnowledgeItem>) => void;
  togglePinKnowledge: (id: string) => void;
  deleteKnowledge: (id: string) => void;

  addHRRecord: (hr: Omit<HRRecord, 'id' | 'createdAt' | 'updatedAt'>) => HRRecord;
  updateHRRecord: (id: string, updates: Partial<HRRecord>) => void;
  deleteHRRecord: (id: string) => void;

  addEleamCase: (eleam: Omit<EleamCase, 'id' | 'createdAt' | 'updatedAt'>) => EleamCase;
  updateEleamCase: (id: string, updates: Partial<EleamCase>) => void;
  deleteEleamCase: (id: string) => void;

  updateEmpamRecord: (id: string, updates: Partial<EmpamRecord>) => void;

  resolveAlert: (id: string) => void;
  dismissAlert: (id: string) => void;

  // File Upload Handling
  addAttachment: (attachment: Omit<FileAttachment, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;

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

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_pur`);
      return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
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

  const [emails, setEmails] = useState<PendingEmail[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_emails`);
      return saved ? JSON.parse(saved) : INITIAL_EMAILS;
    } catch { return INITIAL_EMAILS; }
  });

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
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_pur`, JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_meet`, JSON.stringify(meetings)); }, [meetings]);
  useEffect(() => { localStorage.setItem(`${STORAGE_KEY}_tasks`, JSON.stringify(tasks)); }, [tasks]);
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

    // 2. Compras con problema o atrasadas
    purchases.filter((p) => !p.archived && p.status !== 'cerrado').forEach((p) => {
      if (p.status === 'problema') {
        const alertId = `alt_pur_prob_${p.id}`;
        generated.push({
          id: alertId,
          type: 'compra_con_problema',
          severity: 'critica',
          programId: p.programId,
          subprogramId: p.subprogramId,
          originEntity: 'purchase',
          originId: p.id,
          title: 'Compra con Problema / Bloqueada',
          message: `${p.requestNumber}: ${p.itemOrService}. ${p.problemReason || 'Requiere intervención inmediata.'}`,
          date: p.requiredDate,
          status: resolvedAlertIds.includes(alertId) ? 'resuelta' : dismissedAlertIds.includes(alertId) ? 'pospuesta' : 'nueva',
          createdAt: p.updatedAt,
        });
      } else if (p.requiredDate < todayStr && p.status !== 'recepcionado') {
        const alertId = `alt_pur_over_${p.id}`;
        generated.push({
          id: alertId,
          type: 'compra_atrasada',
          severity: 'alta',
          programId: p.programId,
          subprogramId: p.subprogramId,
          originEntity: 'purchase',
          originId: p.id,
          title: 'Compra Atrasada',
          message: `${p.requestNumber}: Fecha requerida ${p.requiredDate} expiró sin recepción.`,
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
      const totalBud = progFin ? progFin.assignedBudget + progFin.modifications : 0;
      const execBud = progFin ? progFin.executedAmount : 0;
      const availBud = progFin ? totalBud - execBud - progFin.committedAmount : 0;
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
  const overdueTasks = useMemo(() => tasks.filter((t) => !t.archived && t.status !== 'completada' && t.dueDate < todayStr), [tasks]);
  const todayTasks = useMemo(() => tasks.filter((t) => !t.archived && t.status !== 'completada' && t.dueDate === todayStr), [tasks]);
  const upcomingTasks = useMemo(() => {
    // Next 7 days
    const nextWeek = '2026-08-22';
    return tasks.filter((t) => !t.archived && t.status !== 'completada' && t.dueDate > todayStr && t.dueDate <= nextWeek);
  }, [tasks]);
  const urgentTasks = useMemo(() => {
    return tasks.filter((t) => !t.archived && t.status !== 'completada' && (t.priority === 'critica' || t.dueDate <= todayStr));
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

  // Mutations
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const isOverdue = taskData.dueDate < todayStr && taskData.status !== 'completada';
    const newTask: Task = {
      ...taskData,
      id: `tsk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      status: isOverdue ? 'vencida' : taskData.status || 'pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    logAudit('Tarea', newTask.id, 'crear', `Nueva tarea: "${newTask.title}" asignada a ${newTask.responsible}`);
    showToast(`Tarea "${newTask.title}" creada con éxito`, 'success');
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, ...updates, updatedAt: new Date().toISOString() };
        if (updated.dueDate < todayStr && updated.status !== 'completada') {
          updated.status = 'vencida';
        }
        return updated;
      })
    );
    logAudit('Tarea', id, 'editar', `Modificación en tarea ID ${id}`);
    showToast('Tarea actualizada', 'info');
  };

  const completeTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          status: 'completada',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    // Automatically mark associated alerts as resolved
    setResolvedAlertIds((prev) => [...prev, `alt_task_overdue_${id}`, `alt_task_today_${id}`]);
    logAudit('Tarea', id, 'cambiar_estado', `Tarea ${id} marcada como completada`);
    showToast('Tarea completada con éxito 🎉', 'success');
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, archived: true } : t)));
    logAudit('Tarea', id, 'eliminar_logico', `Tarea ${id} archivada`);
    showToast('Tarea archivada', 'warning');
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

  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPur: Purchase = {
      ...purchaseData,
      id: `pur_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPurchases((prev) => [newPur, ...prev]);
    logAudit('Compras', newPur.id, 'crear', `Nueva solicitud de compra ${newPur.requestNumber}`);
    showToast(`Solicitud ${newPur.requestNumber} registrada`, 'success');
    return newPur;
  };

  const updatePurchase = (id: string, updates: Partial<Purchase>) => {
    setPurchases((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
    logAudit('Compras', id, 'editar', `Compra ${id} actualizada`);
    showToast('Compra actualizada', 'info');
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    logAudit('Reuniones', newMeeting.id, 'crear', `Reunión registrada: "${newMeeting.title}"`);
    showToast(`Reunión "${newMeeting.title}" guardada`, 'success');
    return newMeeting;
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m))
    );
    logAudit('Reuniones', id, 'editar', `Reunión ${id} actualizada`);
    showToast('Reunión actualizada', 'info');
  };

  const convertCommitmentToTask = (meetingId: string, commitmentId: string) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting || !meeting.commitments) return;
    const commitment = meeting.commitments.find((c) => c.id === commitmentId);
    if (!commitment) return;

    const newTask = addTask({
      title: commitment.description,
      description: `Originado del compromiso en la reunión: "${meeting.title}" (${meeting.dateTime.substring(0, 10)})`,
      programId: meeting.programId,
      subprogramId: meeting.subprogramId,
      origin: 'Reunión',
      originId: meeting.id,
      responsible: commitment.responsible,
      priority: commitment.priority,
      dueDate: commitment.deadline,
      status: 'pendiente',
    });

    // Mark commitment with task ID
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          commitments: m.commitments.map((c) => (c.id === commitmentId ? { ...c, taskId: newTask.id } : c)),
        };
      })
    );
    logAudit('Reuniones', meetingId, 'convertir_tarea', `Compromiso "${commitment.description}" convertido en tarea ID ${newTask.id}`);
    showToast('Compromiso transformado en tarea oficial vinculada', 'success');
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, archived: true } : m)));
    logAudit('Reuniones', id, 'eliminar_logico', `Reunión ${id} archivada`);
    showToast('Reunión archivada', 'warning');
  };

  const addEmail = (emailData: Omit<PendingEmail, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newEmail: PendingEmail = {
      ...emailData,
      id: `em_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEmails((prev) => [newEmail, ...prev]);
    logAudit('Correos', newEmail.id, 'crear', `Correo pendiente registrado: "${newEmail.subject}"`);
    showToast('Correo pendiente registrado', 'success');
    return newEmail;
  };

  const updateEmail = (id: string, updates: Partial<PendingEmail>) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
    logAudit('Correos', id, 'editar', `Correo ${id} modificado`);
    showToast('Correo actualizado', 'info');
  };

  const deleteEmail = (id: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, archived: true } : e)));
    logAudit('Correos', id, 'eliminar_logico', `Correo ${id} archivado`);
    showToast('Correo archivado', 'warning');
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

  const updateHRRecord = (id: string, updates: Partial<HRRecord>) => {
    setHrRecords((prev) =>
      prev.map((h) => (h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h))
    );
    logAudit('RRHH', id, 'editar', `Registro RRHH ${id} actualizado`);
    showToast('Registro de personal actualizado', 'info');
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
        ['N° Solicitud', 'Programa', 'Ítem / Servicio', 'Monto Estimado', 'Proveedor', 'Fecha Requerida', 'Estado', 'Responsable'],
        ...filtered.map((p) => [
          p.requestNumber,
          p.programId,
          `"${p.itemOrService.replace(/"/g, '""')}"`,
          p.estimatedAmount.toString(),
          p.supplier || '-',
          p.requiredDate,
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
        purchases,
        meetings,
        tasks,
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
        addTask,
        updateTask,
        completeTask,
        deleteTask,
        addIndicator,
        updateIndicator,
        recordMeasurement,
        deleteIndicator,
        updateFinancialPeriod,
        addFinancialPeriod,
        deleteFinancialPeriod,
        addPurchase,
        updatePurchase,
        deletePurchase,
        addMeeting,
        updateMeeting,
        convertCommitmentToTask,
        deleteMeeting,
        addEmail,
        updateEmail,
        deleteEmail,
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
