// Core System Types for Quilicura Salud

export type ProgramId = string;

export type TrafficLightStatus = 'verde' | 'amarillo' | 'rojo' | string;

export type TaskStatus =
  | 'pendiente'
  | 'en_progreso'
  | 'en_ejecucion'
  | 'completada'
  | 'terminada'
  | 'retrasada'
  | 'bloqueada'
  | string;

export type PriorityLevel = 'baja' | 'media' | 'alta' | 'urgente' | 'critica' | string;
export type TaskPriority = PriorityLevel;

export interface TaskCategoryItem {
  id: string;
  name: string;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt?: string;
  [key: string]: any;
}

export type TaskCategory = TaskCategoryItem | string;

export type AlertSeverity = 'alta' | 'media' | 'baja' | 'critica' | string;
export type AlertType = 'presupuesto' | 'plazo' | 'meta' | 'rendicion' | 'convenio' | 'sistema' | string;

export interface TaskChecklistItem {
  id?: string;
  text?: string;
  description?: string;
  completed?: boolean;
  isCompleted?: boolean;
  [key: string]: any;
}

export interface TaskAuditEntry {
  id?: string;
  date?: string;
  user?: string;
  action?: string;
  details?: string;
  [key: string]: any;
}

export interface Task {
  id?: string;
  programId?: ProgramId;
  title?: string;
  description?: string;
  assignedTo?: string;
  assignedRole?: string;
  establishmentId?: string;
  startDate?: string;
  dueDate?: string;
  endDate?: string;
  status?: TaskStatus;
  priority?: PriorityLevel;
  progress?: number;
  category?: any;
  checklist?: TaskChecklistItem[];
  auditTrail?: TaskAuditEntry[];
  dependencies?: string[];
  budgetAssigned?: number;
  milestone?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export function isTaskOverdue(task: any, ...args: any[]): boolean {
  if (!task || isTaskCompleted(task)) return false;
  const due = new Date(task.dueDate || task.endDate || task.deadline || '').getTime();
  return !isNaN(due) && due < Date.now();
}

export function isTaskCompleted(task: any): boolean {
  if (!task) return false;
  return task.status === 'completada' || task.status === 'terminada' || (task.progress !== undefined && task.progress >= 100);
}

export function isTaskExpiringSoon(task: any, days = 3): boolean {
  if (!task || isTaskCompleted(task)) return false;
  const due = new Date(task.dueDate || task.endDate || task.deadline || '').getTime();
  if (isNaN(due)) return false;
  const now = Date.now();
  const diffDays = (due - now) / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= days;
}

export function normalizeTaskStatus(status: string): TaskStatus {
  if (status === 'terminada') return 'completada';
  if (status === 'en_ejecucion') return 'en_progreso';
  return status as TaskStatus;
}

export interface Establishment {
  id: string;
  name?: string;
  code?: string;
  type?: 'CESFAM' | 'CECOSF' | 'SAR' | 'SAPU' | 'COSAM' | 'DIRECCION' | 'COMUNAL' | 'DESAM' | string;
  address?: string;
  [key: string]: any;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'administrador' | 'referente' | 'colaborador' | 'lectura' | string;
  title: string;
  comuna?: string;
  establishment?: string;
  healthService?: string;
  budgetYear?: string | number;
  avatar?: string;
  phonePrefix?: string;
  phone?: string;
  instagram?: string;
  country?: string;
  photoUrl?: string;
  authProvider?: 'email' | 'google' | 'apple';
  emailVerified?: boolean;
  [key: string]: any;
}

export type AuthScreenType = 'login' | 'register' | 'forgot_password' | 'reset_password' | 'verify_email';

export interface AuthAccount {
  id: string;
  email: string;
  username?: string;
  passwordHash?: string;
  name: string;
  role: string;
  title: string;
  comuna?: string;
  establishment?: string;
  healthService?: string;
  avatar?: string;
  photoUrl?: string;
  authProvider: 'email' | 'google' | 'apple';
  emailVerified: boolean;
  verificationCode?: string;
  resetToken?: string;
  createdAt?: string;
}


export interface HealthProgram {
  id: ProgramId;
  code?: string;
  name?: string;
  shortName?: string;
  description?: string;
  referente?: string;
  email?: string;
  telefono?: string;
  presupuestoTotal?: any;
  presupuestoEjecutado?: any;
  presupuestoComprometido?: any;
  color?: string;
  iconName?: string;
  targetPopulation?: any;
  coverage?: any;
  totalActivities?: any;
  completedActivities?: any;
  year?: any;
  status?: 'activo' | 'alerta' | 'critico' | 'cerrado' | string;
  categories?: string[];
  annualBudget?: any;
  [key: string]: any;
}

export interface HRRecord {
  id?: string;
  programId?: ProgramId;
  establishmentId?: string;
  name?: string;
  rut?: string;
  role?: string;
  hours?: any;
  contractType?: string;
  monthlyCost?: any;
  startDate?: string;
  endDate?: string;
  status?: 'activo' | 'inactivo' | 'licencia' | 'vacaciones' | string;
  [key: string]: any;
}

export interface IndicatorMeasurement {
  id?: string;
  date?: string;
  value?: any;
  target?: any;
  comment?: string;
  [key: string]: any;
}

export interface ReliquidationTranche {
  id?: string;
  minCompliance: number;
  maxCompliance?: number | null;
  discountPercentage: number;
  label: string;
  description?: string;
}

export interface ProgramCutConfig {
  programId: string;
  cutKey: 'corte1' | 'corte2' | 'corte3';
  cutName: string;
  cutoffDate: string;
  quotaEvaluated: string;
  quotaPercentage: number;
  targetCompliance: number;
  tranches: ReliquidationTranche[];
}

export interface IndicatorCutData {
  cutNumber?: number;
  month?: string;
  targetNumerator?: any;
  targetDenominator?: any;
  currentNumerator?: any;
  currentDenominator?: any;
  expectedPercentage?: any;
  achievedPercentage?: any;
  [key: string]: any;
}

export interface Indicator {
  id?: string;
  programId?: ProgramId;
  code?: string;
  name?: string;
  description?: string;
  targetValue?: any;
  currentValue?: any;
  unit?: string;
  periodicity?: 'mensual' | 'trimestral' | 'semestral' | 'anual' | string;
  lastUpdated?: string;
  historicalValues?: { date: string; value: any; [key: string]: any }[];
  measurements?: IndicatorMeasurement[];
  cuts?: IndicatorCutData[];
  establishmentId?: string;
  responsibleUser?: string;
  weight?: any;
  goodThreshold?: any;
  warningThreshold?: any;
  [key: string]: any;
}

export type KPIIndicator = Indicator;

export interface FinancialPeriod {
  id?: string;
  programId?: ProgramId;
  month?: any;
  year?: any;
  periodName?: string;
  presupuestoAsignado?: any;
  presupuestoEjecutado?: any;
  presupuestoComprometido?: any;
  saldoDisponible?: any;
  rendicionEnviada?: boolean;
  rendicionAprobada?: boolean;
  fechaRendicion?: string;
  observacionesRendicion?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface BudgetComponent {
  id?: string;
  programId?: ProgramId;
  name?: string;
  allocated?: any;
  executed?: any;
  committed?: any;
  category?: string;
  [key: string]: any;
}

export interface ProgramBudget2025Note {
  id?: string;
  programId?: ProgramId;
  note?: string;
  author?: string;
  date?: string;
  type?: 'presupuesto' | 'convenio' | 'general' | string;
  budgetAmount?: any;
  executedAmount?: any;
  fulfillmentRate?: any;
  [key: string]: any;
}

export type PurchaseStatus =
  | 'solicitada'
  | 'en_cotizacion'
  | 'orden_emitida'
  | 'recepcionada'
  | 'pagada'
  | 'anulada'
  | string;

export interface Purchase {
  id?: string;
  programId?: ProgramId;
  establishmentId?: string;
  code?: string;
  description?: string;
  justification?: string;
  estimatedAmount?: any;
  actualAmount?: any;
  supplier?: string;
  status?: PurchaseStatus;
  priority?: PriorityLevel;
  category?: 'insumos' | 'farmacos' | 'equipamiento' | 'servicios' | 'recursos_humanos' | 'otro' | string;
  requestDate?: string;
  approvalDate?: string;
  deliveryDate?: string;
  paymentDate?: string;
  ordenCompra?: string;
  folioMercadoPublico?: string;
  responsibleUser?: string;
  notes?: string;
  [key: string]: any;
}

export type PurchaseItem = Purchase;

export function getPurchaseDateFieldLabel(status: PurchaseStatus): string {
  switch (status) {
    case 'solicitada': return 'Fecha Solicitud';
    case 'en_cotizacion': return 'Fecha Cotización';
    case 'orden_emitida': return 'Fecha OC';
    case 'recepcionada': return 'Fecha Recepción';
    case 'pagada': return 'Fecha Pago';
    default: return 'Fecha';
  }
}

export function getPurchaseEffectiveMacroState(purchase: any): string {
  if (purchase.status === 'anulada') return 'anulada';
  if (purchase.status === 'pagada') return 'pagada';
  if (purchase.status === 'recepcionada') return 'devengada';
  if (purchase.status === 'orden_emitida') return 'comprometida';
  return 'planificada';
}

export interface PurchaseAlertItem {
  id?: string;
  type?: string;
  severity: 'alta' | 'media' | 'baja' | 'critica' | string;
  title: string;
  description: string;
  [key: string]: any;
}

export function getPurchaseAlerts(purchase: any): PurchaseAlertItem[] {
  const alerts: PurchaseAlertItem[] = [];
  if (!purchase) return alerts;
  if (purchase.status === 'solicitada' && purchase.requestDate && Date.now() - new Date(purchase.requestDate).getTime() > 14 * 86400000) {
    alerts.push({
      severity: 'media',
      type: 'plazo',
      title: 'Demora en Solicitud',
      description: 'Solicitud pendiente por más de 14 días sin cotización u orden de compra emitida.',
    });
  }
  return alerts;
}

export type MeetingStatus = 'programada' | 'realizada' | 'cancelada' | 'reprogramada' | string;
export type CommitmentStatus = 'pendiente' | 'en_progreso' | 'cumplido' | 'vencido' | string;

export interface MeetingParticipant {
  name?: string;
  role?: string;
  attended?: boolean;
  [key: string]: any;
}

export interface MeetingCommitment {
  id?: string;
  description?: string;
  responsible?: string;
  dueDate?: string;
  deadline?: string;
  status?: CommitmentStatus;
  completed?: boolean;
  [key: string]: any;
}

export type Commitment = MeetingCommitment;

export function isCommitmentOverdue(c: any, ...args: any[]): boolean {
  if (!c || c.status === 'cumplido' || c.completed) return false;
  const d = c.dueDate || c.deadline;
  if (!d) return false;
  const due = new Date(d).getTime();
  return !isNaN(due) && due < Date.now();
}

export interface MeetingAgreement {
  id?: string;
  description?: string;
  [key: string]: any;
}

export interface Meeting {
  id?: string;
  title?: string;
  programId?: ProgramId;
  date?: string;
  time?: string;
  dateTime?: string;
  location?: string;
  meetingLink?: string;
  type?: MeetingType | string;
  status?: MeetingStatus;
  summary?: string;
  description?: string;
  participants?: MeetingParticipant[];
  agreements?: MeetingAgreement[];
  commitments?: MeetingCommitment[];
  tags?: string[];
  source?: 'local' | 'google_calendar' | string;
  googleCalendarEventId?: string;
  googleCalendarHtmlLink?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Agreement {
  id?: string;
  title?: string;
  programId?: ProgramId;
  meetingDate?: string;
  description?: string;
  commitments?: {
    id?: string;
    description?: string;
    responsible?: string;
    dueDate?: string;
    deadline?: string;
    completed?: boolean;
    [key: string]: any;
  }[];
  status?: 'vigente' | 'cumplido' | 'vencido' | string;
  participants?: string[];
  [key: string]: any;
}

export interface PendingEmail {
  id?: string;
  programId?: ProgramId;
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  date?: string;
  dueDate?: string;
  status?: 'pendiente' | 'respondido' | 'archivado' | 'cerrado' | 'en_gestion' | string;
  priority?: PriorityLevel;
  type?: string;
  sender?: string;
  recipient?: string;
  receivedOrSentDate?: string;
  deadline?: string;
  responsible?: string;
  [key: string]: any;
}

export type CommunicationType = 'correo' | 'oficio' | 'memo' | 'reunion' | 'llamada' | 'whatsapp' | string;
export type CommunicationStatus = 'pendiente' | 'respondido' | 'en_seguimiento' | 'cerrado' | string;
export type CommunicationFollowUpType = 'correo' | 'llamada' | 'reunion' | 'otro' | string;

export interface CommunicationFollowUp {
  id?: string;
  date?: string;
  user?: string;
  note?: string;
  type?: CommunicationFollowUpType;
  [key: string]: any;
}

export interface CommunicationAttachment {
  id?: string;
  name?: string;
  size?: string;
  url?: string;
  [key: string]: any;
}

export interface CommunicationItem {
  id?: string;
  programId?: ProgramId;
  type?: CommunicationType;
  direction?: 'entrante' | 'saliente';
  sender?: string;
  recipient?: string;
  subject?: string;
  content?: string;
  date?: string;
  dueDate?: string;
  status?: CommunicationStatus;
  priority?: PriorityLevel;
  followUps?: CommunicationFollowUp[];
  attachments?: CommunicationAttachment[];
  [key: string]: any;
}

export function isEmailOverdue(email: any, ...args: any[]): boolean {
  if (!email || email.status === 'respondido' || email.status === 'cerrado') return false;
  const d = email.dueDate || email.deadline || email.receivedOrSentDate;
  if (!d) return false;
  const due = new Date(d).getTime();
  return !isNaN(due) && due < Date.now();
}

export function normalizeCommunicationStatus(status: string): CommunicationStatus {
  return (status as CommunicationStatus) || 'pendiente';
}

export type QuestionCategory =
  | 'presupuesto'
  | 'convenio'
  | 'metas'
  | 'rrhh'
  | 'compras'
  | 'orientacion_tecnica'
  | 'rendicion'
  | 'general'
  | 'financiera'
  | 'tecnica'
  | 'servicio_salud'
  | 'normativa'
  | 'administrativa'
  | string;

export type QuestionStatus =
  | 'pendiente'
  | 'en_revision'
  | 'respondida'
  | 'cerrada'
  | 'en_consulta'
  | 'esperando_respuesta'
  | 'resuelta'
  | string;

export type QuestionFollowUpType =
  | 'nota'
  | 'actualizacion'
  | 'respuesta_parcial'
  | 'llamada'
  | 'consulta_enviada'
  | 'reiteracion'
  | 'aclaracion_verbal'
  | string;

export interface QuestionFollowUp {
  id?: string;
  date?: string;
  user?: string;
  note?: string;
  type?: QuestionFollowUpType;
  questionId?: string;
  createdAt?: string;
  createdBy?: string;
  [key: string]: any;
}

export interface QuestionAttachment {
  id?: string;
  name?: string;
  size?: string;
  url?: string;
  questionId?: string;
  [key: string]: any;
}

export interface Question {
  id?: string;
  programId?: ProgramId;
  askedBy?: string;
  role?: string;
  category?: QuestionCategory;
  question?: string;
  answer?: string;
  status?: QuestionStatus;
  date?: string;
  dueDate?: string;
  followUpDate?: string;
  answeredBy?: string;
  answeredDate?: string;
  priority?: PriorityLevel;
  followUps?: QuestionFollowUp[];
  attachments?: QuestionAttachment[];
  [key: string]: any;
}

export function isQuestionOverdue(q: any, ...args: any[]): boolean {
  if (!q || q.status === 'respondida' || q.status === 'cerrada' || q.status === 'resuelta') return false;
  const d = q.dueDate || q.followUpDate;
  if (!d) return false;
  const due = new Date(d).getTime();
  return !isNaN(due) && due < Date.now();
}

export function isQuestionDueToday(q: any, ...args: any[]): boolean {
  if (!q || q.status === 'respondida' || q.status === 'cerrada' || q.status === 'resuelta') return false;
  const d = q.dueDate || q.followUpDate;
  if (!d) return false;
  const todayStr = new Date().toISOString().slice(0, 10);
  return d === todayStr;
}

export function getQuestionStatusLabel(status: QuestionStatus): string {
  switch (status) {
    case 'pendiente': return 'Pendiente';
    case 'en_revision': return 'En Revisión';
    case 'en_consulta': return 'En Consulta';
    case 'esperando_respuesta': return 'Esperando Respuesta';
    case 'respondida': return 'Respondida';
    case 'resuelta': return 'Resuelta';
    case 'cerrada': return 'Cerrada';
    default: return status;
  }
}

export function getQuestionCategoryLabel(cat: QuestionCategory): string {
  switch (cat) {
    case 'presupuesto':
    case 'financiera': return 'Presupuesto y Finanzas';
    case 'convenio': return 'Convenios y Resoluciones';
    case 'metas': return 'Metas e Indicadores';
    case 'rrhh': return 'Recursos Humanos';
    case 'compras': return 'Compras y Adquisiciones';
    case 'orientacion_tecnica':
    case 'tecnica': return 'Orientación Técnica';
    case 'rendicion': return 'Rendiciones';
    case 'servicio_salud': return 'Servicio de Salud';
    case 'normativa': return 'Normativa';
    case 'administrativa': return 'Administrativa';
    default: return 'General';
  }
}

export interface KnowledgeHistoryEntry {
  id?: string;
  date?: string;
  user?: string;
  summary?: string;
  action?: string;
  details?: string;
  [key: string]: any;
}

export interface KnowledgeItem {
  id?: string;
  programId?: ProgramId;
  programIds?: string[];
  title?: string;
  category?: string;
  content?: string;
  tags?: string[];
  author?: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  history?: KnowledgeHistoryEntry[];
  attachments?: { id?: string; name?: string; url?: string; size?: string; [key: string]: any }[];
  [key: string]: any;
}

export interface EleamCase {
  id?: string;
  establishmentId?: string;
  eleamName?: string;
  caseCode?: string;
  residentsCount?: number;
  contactPerson?: string;
  phone?: string;
  lastVisitDate?: string;
  startDate?: string;
  status?:
    | 'atendido'
    | 'pendiente_visita'
    | 'brote_activo'
    | 'seguimiento'
    | 'documentacion_incompleta'
    | 'en_evaluacion'
    | 'aprobado'
    | 'cerrado'
    | string;
  notes?: string;
  observations?: string;
  [key: string]: any;
}

export interface EmpamRecord {
  id?: string;
  establishmentId?: string;
  targetCount?: number;
  evaluatedCount?: number;
  coverage?: number;
  lastUpdated?: string;
  year?: number;
  month?: number;
  annualTarget?: number;
  periodTarget?: number;
  performedCount?: number;
  cutoffDate?: string;
  notes?: string;
  [key: string]: any;
}

export interface Alert {
  id?: string;
  programId?: ProgramId;
  title?: string;
  message?: string;
  severity?: AlertSeverity;
  type?: AlertType;
  date?: string;
  read?: boolean;
  resolved?: boolean;
  status?: string;
  actionUrl?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  [key: string]: any;
}

export interface ThresholdSettings {
  budgetWarning?: number;
  budgetCritical?: number;
  indicatorWarning?: number;
  indicatorCritical?: number;
  taskDaysWarning?: number;
  nearDeadlineDays?: number;
  indicatorWarningPercent?: number;
  indicatorDangerPercent?: number;
  lowFinancialExecutionPercent?: number;
  overFinancialExecutionPercent?: number;
  dataOutdatedDays?: number;
  [key: string]: any;
}

export interface FileAttachment {
  id?: string;
  name?: string;
  size?: string;
  type?: string;
  uploadDate?: string;
  uploadedAt?: string;
  url?: string;
  [key: string]: any;
}

export interface Contact {
  id?: string;
  programId?: ProgramId;
  programIds?: string[];
  name?: string;
  lastName?: string;
  role?: string;
  profession?: string;
  institution?: string;
  unit?: string;
  establishmentId?: string;
  email?: string;
  phone?: string;
  annex?: string;
  mobile?: string;
  type?: string;
  contactType?: string;
  notes?: string;
  isActive?: boolean;
  isFrequent?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const DEFAULT_CONTACT_TYPES = [
  { value: 'referente_ssmn', label: 'Referente Servicio SSMN' },
  { value: 'referente_comunal', label: 'Referente Comunal DISAM' },
  { value: 'director_centro', label: 'Director/a de Centro' },
  { value: 'coordinador_programa', label: 'Coordinador/a Local' },
  { value: 'proveedor', label: 'Proveedor' },
  { value: 'otro', label: 'Otro' },
];

export type DocumentValidityStatus = 'vigente' | 'por_vencer' | 'vencido' | 'obsoleto' | 'historico' | 'por_revisar' | string;

export interface DocumentVersion {
  id?: string;
  version?: string;
  versionNumber?: string;
  uploadDate?: string;
  uploadedBy?: string;
  notes?: string;
  fileName?: string;
  fileSize?: string;
  isCurrent?: boolean;
  [key: string]: any;
}

export interface DocumentRecord {
  id?: string;
  programId?: ProgramId;
  programIds?: string[];
  title?: string;
  description?: string;
  category?: 'convenio' | 'resolucion' | 'orientacion_tecnica' | 'rendicion' | 'informe' | 'otro' | string;
  documentType?: string;
  documentNumber?: string;
  issuingBody?: string;
  institution?: string;
  documentDate?: string;
  validFrom?: string;
  validUntil?: string;
  expirationDate?: string;
  status?: DocumentValidityStatus;
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
  uploadedBy?: string;
  responsible?: string;
  version?: string;
  versions?: DocumentVersion[];
  tags?: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const DEFAULT_DOCUMENT_TYPES = [
  { value: 'convenio', label: 'Convenio' },
  { value: 'resolucion', label: 'Resolución Exenta' },
  { value: 'orientacion_tecnica', label: 'Orientación Técnica' },
  { value: 'rendicion', label: 'Rendición de Cuentas' },
  { value: 'informe', label: 'Informe de Gestión' },
  { value: 'otro', label: 'Otro' },
];

export function getDocumentEffectiveStatus(doc: any, ...args: any[]): any {
  let s = doc?.status;
  if (!s) {
    const exp = doc?.validUntil || doc?.expirationDate;
    if (!exp) s = 'vigente';
    else {
      const until = new Date(exp).getTime();
      const now = Date.now();
      if (until < now) s = 'vencido';
      else if (until - now < 30 * 86400000) s = 'por_vencer';
      else s = 'vigente';
    }
  }
  return {
    status: s,
    label: s === 'vigente' ? 'Vigente' : s === 'por_vencer' ? 'Por Vencer' : s === 'vencido' ? 'Vencido' : s,
    isExpired: s === 'vencido',
    isExpiringSoon: s === 'por_vencer',
    toString: () => s,
    valueOf: () => s,
  };
}

export interface AuditLog {
  id?: string;
  userId?: string;
  userName?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  entity?: string;
  details?: string;
  timestamp?: string;
  [key: string]: any;
}

export interface ProgramDocument {
  id?: string;
  programId?: ProgramId;
  name?: string;
  category?: 'orientacion_tecnica' | 'convenio' | 'rendicion' | 'resolucion' | 'informe' | 'otro' | string;
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
  uploadedBy?: string;
  version?: string;
  url?: string;
  [key: string]: any;
}

export interface NotificationItem {
  id?: string;
  title?: string;
  message?: string;
  type?: 'alerta' | 'tarea' | 'financiero' | 'sistema' | string;
  priority?: PriorityLevel;
  timestamp?: string;
  read?: boolean;
  programId?: ProgramId;
  actionUrl?: string;
  [key: string]: any;
}


// Additional Types and Helpers
export type EmailStatus = 'pendiente' | 'respondido' | 'archivado' | 'cerrado' | 'en_gestion' | string;
export type EmailAction = 'responder' | 'revisar' | 'informar' | 'archivar' | 'derivar' | string;

export function getEmailDueInfo(email: any, ...args: any[]) {
  const d = email?.dueDate || email?.deadline || email?.receivedOrSentDate;
  if (!d) {
    return {
      isOverdue: false,
      daysRemaining: null,
      isDueToday: false,
      type: 'normal',
      label: 'Sin plazo',
    };
  }
  const due = new Date(d).getTime();
  const diffDays = Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const isDueToday = diffDays === 0;
  let type = 'normal';
  let label = `${diffDays} días`;
  if (isOverdue) {
    type = 'vencido';
    label = `Vencido hace ${Math.abs(diffDays)}d`;
  } else if (isDueToday) {
    type = 'hoy';
    label = 'Vence hoy';
  } else if (diffDays <= 3) {
    type = 'por_vencer';
    label = `Vence en ${diffDays}d`;
  }
  return {
    isOverdue,
    daysRemaining: diffDays,
    days: diffDays,
    isDueToday,
    type,
    label,
  };
}

export type PurchaseMacroState = 'planificada' | 'comprometida' | 'devengada' | 'pagada' | 'anulada' | 'completado' | 'en_ejecucion' | string;
export type PurchaseReceptionStatus = 'pendiente' | 'parcial' | 'completa' | 'con_observaciones' | string;
export type PurchaseInvoiceStatus = 'pendiente' | 'recepcionada' | 'aprobada' | 'pagada' | 'rechazada' | string;

export type MeetingType = 'ordinaria' | 'extraordinaria' | 'coordinacion' | 'seguimiento' | 'evaluacion' | 'tecnica' | string;

export function getMeetingTypeLabel(type: string): string {
  switch (type) {
    case 'ordinaria': return 'Ordinaria';
    case 'extraordinaria': return 'Extraordinaria';
    case 'coordinacion': return 'Coordinación';
    case 'seguimiento': return 'Seguimiento';
    case 'evaluacion': return 'Evaluación';
    case 'tecnica': return 'Técnica';
    default: return type;
  }
}

export function getMeetingStatusLabel(status: string): string {
  switch (status) {
    case 'programada': return 'Programada';
    case 'realizada': return 'Realizada';
    case 'cancelada': return 'Cancelada';
    case 'reprogramada': return 'Reprogramada';
    default: return status;
  }
}

export type KnowledgeCategory = string;
export type KnowledgeStatus = 'publicado' | 'borrador' | 'revision' | 'obsoleto' | string;
export interface KnowledgeAttachment {
  id?: string;
  name?: string;
  url?: string;
  size?: string;
  [key: string]: any;
}

export function isKnowledgeReviewPending(item: any, ...args: any[]): boolean {
  return item?.status === 'revision' || item?.status === 'borrador';
}

export function getKnowledgeStatusLabel(status: any, ...args: any[]): any {
  const s = typeof status === 'string' ? status : status?.status || 'publicado';
  let label = s;
  let bg = 'bg-slate-100 dark:bg-slate-800';
  let text = 'text-slate-700 dark:text-slate-300';
  let border = 'border-slate-200 dark:border-slate-700';

  switch (s) {
    case 'publicado':
      label = 'Publicado';
      bg = 'bg-emerald-50 dark:bg-emerald-950/40';
      text = 'text-emerald-700 dark:text-emerald-300';
      border = 'border-emerald-200 dark:border-emerald-800';
      break;
    case 'borrador':
      label = 'Borrador';
      bg = 'bg-amber-50 dark:bg-amber-950/40';
      text = 'text-amber-700 dark:text-amber-300';
      border = 'border-amber-200 dark:border-amber-800';
      break;
    case 'revision':
      label = 'En Revisión';
      bg = 'bg-blue-50 dark:bg-blue-950/40';
      text = 'text-blue-700 dark:text-blue-300';
      border = 'border-blue-200 dark:border-blue-800';
      break;
    case 'obsoleto':
      label = 'Obsoleto';
      bg = 'bg-rose-50 dark:bg-rose-950/40';
      text = 'text-rose-700 dark:text-rose-300';
      border = 'border-rose-200 dark:border-rose-800';
      break;
    default:
      break;
  }

  return { label, bg, text, border };
}

export function isOfficialKnowledgeSource(item: any, ...args: any[]): boolean {
  return Boolean(item?.isOfficial || item?.source === 'MINSAL' || item?.source === 'SSMN');
}

export type HRStatus = 'activo' | 'inactivo' | 'licencia' | 'vacaciones' | string;
