export type ProgramId = 
  | 'praps_cpu'
  | 'praps_rehab'
  | 'praps_imagenes'
  | 'praps_mas_ama'
  | 'praps_respiratoria'
  | 'prog_personas_mayores';

export type TrafficLightStatus = 'green' | 'yellow' | 'red' | 'gray';
export type PriorityLevel = 'baja' | 'media' | 'alta' | 'critica';
export type TaskStatus = 'pendiente' | 'en_curso' | 'bloqueada' | 'completada' | 'vencida';
export type HRStatus = 'activo' | 'vacante' | 'ausencia' | 'reemplazo' | 'finalizado';
export type PurchaseStatus = 'pendiente' | 'solicitado' | 'en_compra' | 'recepcionado' | 'cerrado' | 'problema';
export type EmailAction = 'enviar' | 'responder' | 'revisar' | 'seguimiento';
export type EmailStatus = 'pendiente' | 'en_curso' | 'esperando_respuesta' | 'resuelto';
export type QuestionCategory = 'tecnica' | 'administrativa' | 'financiera' | 'servicio_salud' | 'gestion_interna' | 'otra';
export type QuestionStatus = 'pendiente' | 'en_consulta' | 'esperando_respuesta' | 'resuelta';
export type KnowledgeCategory = 'recordatorio' | 'aprendizaje' | 'error_evitar' | 'requisito' | 'criterio_tecnico' | 'fecha_importante' | 'recomendacion';
export type AlertSeverity = 'informativa' | 'media' | 'alta' | 'critica';
export type AlertStatus = 'nueva' | 'vista' | 'pospuesta' | 'resuelta';
export type IndicatorDirection = 'higher_is_better' | 'lower_is_better';
export type MeetingType = 'reunion' | 'capacitacion' | 'consultoria' | 'coordinacion' | 'comite';

export type EleamStatus = 
  | 'identificado'
  | 'preparando_antecedentes'
  | 'documentacion_incompleta'
  | 'postulado'
  | 'en_evaluacion'
  | 'observado'
  | 'aprobado'
  | 'rechazado'
  | 'cerrado';

export interface Establishment {
  id: string;
  name: string;
  code: string;
  type: 'CESFAM' | 'CECOSF' | 'SAR' | 'SAPU' | 'COSAM' | 'DIRECCION';
  address?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'administrador' | 'referente' | 'colaborador' | 'lectura';
  title: string;
  avatar?: string;
}

export interface HealthProgram {
  id: ProgramId;
  code: string;
  name: string;
  shortName: string;
  description: string;
  referente: string;
  hasSubprograms?: boolean;
  subprograms?: string[];
  color: string;
  iconName: string;
  targetPopulation?: string;
  annualBudget?: number;
}

export interface HRRecord {
  id: string;
  programId: ProgramId;
  subprogramId?: string;
  name: string;
  profession: string;
  role: string;
  establishmentId: string;
  workdayHours: number; // e.g. 44, 22
  programHours: number; // hours dedicated to this program
  contractType: 'Contrata' | 'Planta' | 'Honorarios' | 'Código del Trabajo';
  startDate: string;
  endDate?: string;
  functions: string;
  status: HRStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface IndicatorMeasurement {
  id: string;
  indicatorId: string;
  period: string; // e.g. '2026-Q1', '2026-06', '2026-S1'
  date: string;
  result: number;
  target: number;
  notes?: string;
  registeredBy: string;
}

export interface IndicatorCutData {
  target: number;
  result: number;
  date?: string;
  source?: string;
  notes?: string;
}

export interface Indicator {
  id: string;
  programId: ProgramId;
  subprogramId?: string;
  code: string;
  name: string;
  description: string;
  componente?: string;
  objetivoEspecifico?: string;
  corteSeleccionado?: '1° corte' | '2° corte' | '3° corte' | string;
  numeradorDescripcion?: string;
  numeradorValor?: number;
  denominadorDescripcion?: string;
  denominadorValor?: number;
  pesoRelativo?: number;
  medioVerificacionNumerador?: string;
  medioVerificacionDenominador?: string;
  metaCumplimientoAnualTexto?: string;
  metaCumplimientoAnualPorcentaje?: number;
  periodicity: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual';
  annualTarget: number;
  periodTarget: number;
  currentResult: number;
  unit: string; // '%', 'personas', 'atenciones', 'exámenes', etc.
  direction: IndicatorDirection;
  cutoffDate: string;
  responsible: string;
  source: string; // e.g. 'REM P01', 'Plataforma Rayen', 'DEIS', 'Planilla Interna'
  notes?: string;
  measurements: IndicatorMeasurement[];
  corte1?: IndicatorCutData;
  corte2?: IndicatorCutData;
  corte3?: IndicatorCutData;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface FinancialPeriod {
  id: string;
  programId: ProgramId;
  subprogramId?: string;
  year: number;
  periodName: string; // e.g. 'Presupuesto 2026 - Inicial', 'Corte Agosto 2026'
  assignedBudget: number;
  modifications: number; // can be positive or negative
  executedAmount: number;
  committedAmount: number;
  projectedAmount: number;
  cutoffDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  requestNumber: string;
  programId: ProgramId;
  subprogramId?: string;
  itemOrService: string;
  description: string;
  estimatedAmount: number;
  finalAmount?: number;
  supplier?: string;
  requestDate: string;
  requiredDate: string;
  receptionDate?: string;
  responsible: string;
  status: PurchaseStatus;
  notes?: string;
  problemReason?: string;
  attachments?: FileAttachment[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface Commitment {
  id: string;
  meetingId: string;
  description: string;
  responsible: string;
  deadline: string;
  priority: PriorityLevel;
  status: 'pendiente' | 'en_curso' | 'completado';
  taskId?: string; // If converted to task
}

export interface Meeting {
  id: string;
  programId: ProgramId;
  subprogramId?: string;
  type: MeetingType;
  title: string;
  dateTime: string;
  location: string;
  participants: string[];
  objective: string;
  notes: string;
  agreements: string;
  commitments: Commitment[];
  attachments?: FileAttachment[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  programId: ProgramId;
  subprogramId?: string;
  origin?: 'Manual' | 'Reunión' | 'Alerta' | 'Meta' | 'Financiero' | 'Compra' | 'ELEAM' | 'EMPAM';
  originId?: string; // ID of meeting or indicator
  responsible: string;
  priority: PriorityLevel;
  dueDate: string;
  completedAt?: string;
  status: TaskStatus;
  notes?: string;
  attachments?: FileAttachment[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface PendingEmail {
  id: string;
  subject: string;
  recipient: string;
  programId: ProgramId;
  subprogramId?: string;
  action: EmailAction;
  priority: PriorityLevel;
  deadline: string;
  status: EmailStatus;
  notes?: string;
  link?: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface Question {
  id: string;
  question: string;
  context: string;
  programId: ProgramId;
  subprogramId?: string;
  category: QuestionCategory;
  responsible: string;
  priority: PriorityLevel;
  status: QuestionStatus;
  nextInstance?: string; // e.g. 'Reunión con Servicio de Salud SSMN', 'Comité Técnico 18/08'
  finalAnswer?: string;
  forNextMeeting?: boolean;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  programId: ProgramId;
  subprogramId?: string;
  category: KnowledgeCategory;
  tags: string[];
  isPinned: boolean;
  links?: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface EleamCase {
  id: string;
  caseCode: string; // internal code to protect PII, e.g. 'ELEAM-QLC-2026-04'
  establishmentId: string;
  startDate: string;
  status: EleamStatus;
  requiredDocumentation: string[];
  pendingDocumentation: string[];
  responsible: string;
  nextAction: string;
  deadline: string;
  result?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export interface EmpamRecord {
  id: string;
  establishmentId: string;
  year: number;
  month: number; // 1-12
  annualTarget: number;
  periodTarget: number;
  performedCount: number;
  cutoffDate: string;
  notes?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  programId: ProgramId;
  entityType: 'task' | 'purchase' | 'meeting' | 'knowledge' | 'eleam' | 'general';
  entityId: string;
  uploadedBy: string;
  uploadedAt: string;
}

export type AlertType = 
  | 'tarea_vencida'
  | 'tarea_critica_vencida'
  | 'indicador_en_riesgo'
  | 'indicador_critico'
  | 'compra_atrasada'
  | 'compra_con_problema'
  | 'baja_ejecucion'
  | 'riesgo_sobreejecucion'
  | 'reunion_proxima'
  | 'correo_vencido'
  | 'plazo_cercano'
  | 'informacion_desactualizada';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  programId: ProgramId;
  subprogramId?: string;
  originEntity: 'task' | 'indicator' | 'purchase' | 'financial' | 'meeting' | 'email' | 'eleam';
  originId: string;
  title: string;
  message: string;
  date: string;
  status: AlertStatus;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  entity: string;
  entityId: string;
  action: 'crear' | 'editar' | 'cambiar_estado' | 'eliminar_logico' | 'restaurar' | 'convertir_tarea';
  details: string;
  user: string;
  timestamp: string;
}

export interface ThresholdSettings {
  nearDeadlineDays: number; // default 3 days
  indicatorWarningPercent: number; // default < 85%
  indicatorDangerPercent: number; // default < 70%
  lowFinancialExecutionPercent: number; // default < 45% (based on calendar elapsed)
  overFinancialExecutionPercent: number; // default > 95%
  dataOutdatedDays: number; // default 30 days
}
