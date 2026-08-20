export type ProgramId = 
  | 'praps_cpu'
  | 'praps_rehab'
  | 'praps_imagenes'
  | 'praps_mas_ama'
  | 'praps_respiratoria'
  | 'prog_personas_mayores';

export type TrafficLightStatus = 'green' | 'yellow' | 'red' | 'gray';
export type PriorityLevel = 'baja' | 'media' | 'alta' | 'critica';
export type TaskStatus = 
  | 'por_hacer' 
  | 'en_ejecucion' 
  | 'terminada' 
  | 'pendiente' 
  | 'en_curso' 
  | 'bloqueada' 
  | 'completada' 
  | 'vencida';
export type HRStatus = 'activo' | 'en_proceso_seleccion' | 'vacante' | 'ausencia' | 'reemplazo' | 'finalizado';

// Macroestado de la compra (3 estados principales: Pendiente -> En ejecución -> Completado)
export type PurchaseMacroState = 'pendiente' | 'en_ejecucion' | 'completado' | 'por_hacer' | 'realizado';

// 6 Tipos / Modalidades de compra permitidos exclusivamente
export const ALLOWED_PURCHASE_MODALITIES = [
  'Compra ágil',
  'Convenio marco',
  'Licitación pública',
  'Licitación privada',
  'Trato directo',
  'Gran compra',
] as const;

export type PurchaseModalidad = typeof ALLOWED_PURCHASE_MODALITIES[number];

// Microestado de Recepción
export type PurchaseReceptionStatus = 'pendiente' | 'conforme' | 'rechazada' | 'con_observaciones';

// Microestado de Facturación
export type PurchaseInvoiceStatus = 'sin_factura' | 'recibida' | 'en_revision' | 'pagada';

// Compatibilidad legacy
export type PurchaseStatus = 'solicitado' | 'en_compra' | 'recepcionado' | 'cerrado' | 'problema';

export type EmailAction = 'enviar' | 'responder' | 'revisar' | 'seguimiento';
export type CommunicationType = 'correo_recibido' | 'correo_por_enviar' | 'oficio' | 'solicitud' | 'requerimiento' | 'otro';
export type CommunicationStatus = 'pendiente' | 'en_gestion' | 'respondido' | 'cerrado';
export type EmailStatus = CommunicationStatus | 'en_curso' | 'esperando_respuesta' | 'resuelto' | 'en_redaccion' | 'enviado';
export type CommunicationFollowUpType = 
  | 'respuesta_enviada'
  | 'informacion_solicitada'
  | 'documento_recibido'
  | 'derivacion'
  | 'contacto'
  | 'recordatorio'
  | 'observacion'
  | 'otro';

export interface CommunicationFollowUp {
  id: string;
  communicationId: string;
  type: CommunicationFollowUpType;
  note: string;
  createdAt: string;
  createdBy: string;
}

export interface CommunicationAttachment {
  id: string;
  communicationId: string;
  name: string;
  size?: string;
  type?: string;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
}
export type QuestionCategory = 
  | 'tecnica' 
  | 'normativa' 
  | 'administrativa' 
  | 'financiera' 
  | 'servicio_salud' 
  | 'gestion_interna' 
  | 'otra';

export type QuestionStatus = 
  | 'pendiente'
  | 'en_consulta' 
  | 'esperando_respuesta' 
  | 'resuelta' 
  | 'abierta' 
  | 'cerrada_sin_respuesta';

export type QuestionFollowUpType = 
  | 'reiteracion'
  | 'respuesta_parcial'
  | 'consulta_enviada'
  | 'aclaracion_verbal'
  | 'en_reunion'
  | 'nota_interna';

export interface QuestionFollowUp {
  id: string;
  questionId: string;
  type: QuestionFollowUpType;
  note: string;
  createdAt: string;
  createdBy: string;
}

export interface QuestionAttachment {
  id: string;
  questionId?: string;
  name: string;
  size?: string | number;
  type?: string;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
}
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
  type: 'CESFAM' | 'CECOSF' | 'SAR' | 'SAPU' | 'COSAM' | 'DIRECCION' | 'COMUNAL' | 'DESAM';
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

export interface BudgetComponent {
  id: string;
  programId: ProgramId;
  name: string; // e.g. 'RRHH', 'Movilización', 'Insumos', 'Fármacos', 'Oxígeno'
  budgetToSpend: number; // Presupuesto asignado / a gastar
  spentAmount: number; // Monto ya gastado / ejecutado
  notes?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramBudgetHistoricalNote {
  programId: ProgramId;
  year?: number;
  budgetAmount: number;
  executedAmount?: number;
  fulfillmentRate?: number;
  note?: string;
}

export type ProgramBudget2025Note = ProgramBudgetHistoricalNote;

export interface Purchase {
  id: string;
  requestNumber: string;
  category?: string; // Categoría de productos/servicios (ej: Insumos de rehabilitación)
  programId: ProgramId;
  subprogramId?: string;
  itemOrService: string;
  description: string;
  estimatedAmount?: number; // Compatibilidad
  finalAmount?: number;
  supplier?: string; // Proveedor elegido
  modalidadCompra?: PurchaseModalidad | string;
  units?: number;
  unitPriceWithoutTax?: number;
  unitPriceWithTax?: number;
  totalPriceWithTax?: number;
  ceroPapelExpediente?: string;
  ceroPapelEstado?: 'Borrador' | 'En Firma' | 'Firmado' | 'Derivado a Adquisiciones' | 'En Trámite' | 'Archivado' | string;
  ceroPapelInitiationDate?: string; // Fecha de iniciación de la compra en CeroPapel (campo obligatorio)
  referenceLink?: string;
  purchaseOrderNumber?: string; // N° de Orden de Compra (ej: 2404-124-CM26)
  orderSentDate?: string;
  orderAcceptedDate?: string;
  decreeSigningDate?: string;
  contractClosingDate?: string;
  requestDate: string;
  requiredDate: string; // Fecha clave (Aceptación OC / Firma Decreto / Cierre Contrato según modalidad)

  // Macroestado y Microestados (Pendiente -> En ejecución -> Completado)
  macroState?: PurchaseMacroState; // 'pendiente' | 'en_ejecucion' | 'completado'
  status?: PurchaseStatus; // Compatibilidad legacy ('solicitado' | 'en_compra' | 'recepcionado' | 'cerrado' | 'problema')
  
  // Recepción (Solo en estado Completado)
  receptionStatus?: PurchaseReceptionStatus; // 'pendiente' | 'conforme' | 'rechazada' | 'con_observaciones'
  receptionDate?: string; // Fecha de recepción
  receptionResponsible?: string; // Responsable que recibió
  receptionNotes?: string; // Observaciones de la recepción / motivos de rechazo
  receptionActDoc?: string; // N° Acta de recepción o folio

  // Facturación y Pago (Solo en estado Completado)
  invoiceStatus?: PurchaseInvoiceStatus; // 'sin_factura' | 'recibida' | 'en_revision' | 'pagada'
  invoiceNumber?: string; // N° de Factura (ej: FAC-8942)
  invoiceDate?: string; // Fecha de emisión / ingreso de factura
  invoiceAmount?: number; // Monto facturado
  invoicePaymentDate?: string; // Fecha de pago / devengo
  invoiceNotes?: string; // Observaciones de facturación
  invoiceLink?: string; // Enlace a factura digital o portal

  responsible: string;
  notes?: string;
  problemReason?: string;
  attachments?: FileAttachment[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

/**
 * Determina el Macroestado efectivo de una compra basándose en sus 3 estados principales:
 * - 'pendiente': compras planificadas o solicitadas listas para iniciar su tramitación
 * - 'en_ejecucion': compras con gestión activa (OC emitida, tramitación o despacho en curso)
 * - 'completado': compras cerradas donde se gestiona Recepción Conforme -> Facturación -> Pago
 */
export function getPurchaseEffectiveMacroState(purchase: Purchase): 'pendiente' | 'en_ejecucion' | 'completado' {
  if (purchase.macroState) {
    if (purchase.macroState === 'por_hacer' || purchase.macroState === 'pendiente') return 'pendiente';
    if (purchase.macroState === 'realizado' || purchase.macroState === 'completado') return 'completado';
    return 'en_ejecucion';
  }
  // Mapeo inteligente para compras legacy o sin macroState explícito:
  const recStatus = purchase.receptionStatus || (purchase.status === 'recepcionado' || purchase.status === 'cerrado' ? 'conforme' : 'pendiente');
  const invStatus = purchase.invoiceStatus || (purchase.status === 'cerrado' ? 'pagada' : 'sin_factura');

  if (purchase.status === 'cerrado' || (recStatus === 'conforme' && invStatus === 'pagada')) {
    return 'completado';
  }
  if (purchase.status === 'solicitado' && !purchase.purchaseOrderNumber && recStatus === 'pendiente' && invStatus === 'sin_factura') {
    return 'pendiente';
  }
  return 'en_ejecucion';
}

export interface PurchaseOperationalAlert {
  id: string;
  type: 'oc_sin_recepcion' | 'rc_sin_factura' | 'factura_sin_pago' | 'rechazada' | 'con_observaciones' | 'bloqueo' | 'vencida';
  title: string;
  description: string;
  severity: 'critica' | 'alta' | 'media' | 'informativa';
}

/**
 * Calcula las alertas operativas automáticas de una compra para trazabilidad sin saturar:
 * - Recepción conforme pero sin factura ingresada
 * - OC emitida hace tiempo sin recepción
 * - Factura recibida pendiente de pago
 * - Recepción rechazada o con observaciones
 * - Traba o motivo de bloqueo reportado
 */
export function getPurchaseAlerts(purchase: Purchase): PurchaseOperationalAlert[] {
  const alerts: PurchaseOperationalAlert[] = [];
  const recStatus = purchase.receptionStatus || 'pendiente';
  const invStatus = purchase.invoiceStatus || 'sin_factura';
  const macro = getPurchaseEffectiveMacroState(purchase);

  // 1. Traba / Bloqueo explícito
  if (purchase.problemReason && purchase.problemReason.trim().length > 0) {
    alerts.push({
      id: `${purchase.id}-traba`,
      type: 'bloqueo',
      title: 'Compra con traba u observación crítica',
      description: purchase.problemReason,
      severity: 'critica',
    });
  }

  // 2. Recepción rechazada (en compras completadas / recepcionadas)
  if (recStatus === 'rechazada' && macro === 'completado') {
    alerts.push({
      id: `${purchase.id}-rechazada`,
      type: 'rechazada',
      title: 'Recepción Rechazada',
      description: purchase.receptionNotes || 'Los bienes o servicios entregados fueron rechazados por no cumplir especificaciones.',
      severity: 'critica',
    });
  }

  // 3. Recepción con observaciones (en compras completadas)
  if (recStatus === 'con_observaciones' && macro === 'completado') {
    alerts.push({
      id: `${purchase.id}-observaciones`,
      type: 'con_observaciones',
      title: 'Recepción con Observaciones',
      description: purchase.receptionNotes || 'Recepción parcial o con detalles pendientes por subsanar por el proveedor.',
      severity: 'alta',
    });
  }

  // 4. Recepción Conforme pero sin factura
  if (recStatus === 'conforme' && invStatus === 'sin_factura' && macro === 'completado') {
    alerts.push({
      id: `${purchase.id}-sin-factura`,
      type: 'rc_sin_factura',
      title: 'Recepción Conforme sin Factura',
      description: `Recepción conforme registrada (${purchase.receptionDate || 'reciente'}), pero aún no se ha ingresado la factura del proveedor.`,
      severity: 'alta',
    });
  }

  // 5. Factura recibida/en revisión pendiente de pago
  if ((invStatus === 'recibida' || invStatus === 'en_revision') && macro === 'completado') {
    alerts.push({
      id: `${purchase.id}-factura-pendiente-pago`,
      type: 'factura_sin_pago',
      title: invStatus === 'en_revision' ? 'Factura en Revisión Contable' : 'Factura Recibida Pendiente de Pago',
      description: purchase.invoiceNumber ? `Factura ${purchase.invoiceNumber} pendiente de proceso de pago / devengo.` : 'Factura recibida en trámite de pago.',
      severity: 'media',
    });
  }

  // 6. OC emitida esperando avance
  if (purchase.purchaseOrderNumber && macro === 'en_ejecucion') {
    alerts.push({
      id: `${purchase.id}-oc-sin-recepcion`,
      type: 'oc_sin_recepcion',
      title: 'OC Emitida en Ejecución',
      description: `Orden de Compra ${purchase.purchaseOrderNumber} activa con proveedor ${purchase.supplier || 'asignado'}.`,
      severity: 'informativa',
    });
  }

  return alerts;
}

/**
 * Retorna la etiqueta correspondiente a la fecha clave según la modalidad de compra:
 * - Compra Ágil: Fecha de aceptación OC
 * - Convenio Marco: Fecha de firma de decreto
 * - Licitación: Fecha de cierre de contrato
 */
export function getPurchaseDateFieldLabel(modalidad?: string): string {
  const mod = (modalidad || '').toLowerCase().trim();
  if (mod.includes('ágil') || mod.includes('agil')) {
    return 'Fecha de aceptación OC';
  }
  if (mod.includes('convenio') || mod.includes('marco')) {
    return 'Fecha de firma de decreto';
  }
  if (mod.includes('licitación') || mod.includes('licitacion') || mod.includes('contrato')) {
    return 'Fecha de cierre de contrato';
  }
  return 'Fecha de aceptación OC';
}

export type MeetingStatus = 'pendiente' | 'en_ejecucion' | 'completado' | 'programada' | 'en_curso' | 'finalizada' | 'cancelada';
export type CommitmentStatus = 'pendiente' | 'en_curso' | 'cumplido' | 'cancelado' | 'completado';

export interface MeetingParticipant {
  id: string;
  name: string;
  role?: string;
  organization?: string;
  email?: string;
  attended?: boolean;
}

export interface MeetingAgendaItem {
  id: string;
  title: string;
  durationMinutes?: number;
  presenter?: string;
  completed?: boolean;
}

export interface MeetingAgreement {
  id: string;
  meetingId: string;
  description: string;
  decisionType?: 'acuerdo' | 'definicion' | 'resolucion';
  orderIndex?: number;
  createdAt?: string;
}

export interface MeetingCommitment {
  id: string;
  meetingId: string;
  agreementId?: string;
  description: string;
  responsible: string;
  responsibleId?: string;
  deadline: string; // YYYY-MM-DD
  priority: PriorityLevel;
  isUrgent?: boolean;
  status: CommitmentStatus;
  taskId?: string; // Sincronización con Tarea global
  notes?: string;
  completedAt?: string;
  completedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Alias de retrocompatibilidad
export type Commitment = MeetingCommitment;

export interface Meeting {
  id: string;
  programId: ProgramId | 'transversal';
  subprogramId?: string;
  type: MeetingType; // 'reunion' | 'comite' | 'capacitacion' | 'consultoria' | 'coordinacion'
  status?: MeetingStatus; // 'programada' | 'en_curso' | 'finalizada' | 'cancelada'
  title: string;
  dateTime: string;
  durationMinutes?: number;
  location: string;
  participants: (string | MeetingParticipant)[];
  objective: string;
  agendaItems?: MeetingAgendaItem[];
  notes: string;
  agreements: string | MeetingAgreement[];
  commitments: MeetingCommitment[];
  attachments?: FileAttachment[];
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

/**
 * Determina si un compromiso está vencido:
 * "Vencido" es una condición calculada en tiempo de ejecución, no un estado excluyente.
 */
export function isCommitmentOverdue(commitment: MeetingCommitment, todayStr: string = '2026-08-18'): boolean {
  if (commitment.status === 'cumplido' || commitment.status === 'completado' || commitment.status === 'cancelado') {
    return false;
  }
  return commitment.deadline < todayStr;
}

export function getMeetingTypeLabel(type: MeetingType): string {
  switch (type) {
    case 'reunion': return 'Reunión';
    case 'comite': return 'Comité Técnico';
    case 'capacitacion': return 'Capacitación';
    case 'consultoria': return 'Consultoría / Asesoría';
    case 'coordinacion': return 'Coordinación Intersectorial';
    default: return 'Reunión';
  }
}

export function getMeetingStatusLabel(status?: MeetingStatus): string {
  switch (status) {
    case 'programada': return 'Programada';
    case 'en_curso': return 'En curso';
    case 'finalizada': return 'Finalizada';
    case 'cancelada': return 'Cancelada';
    default: return 'Realizada';
  }
}

export function getCommitmentStatusLabel(status: CommitmentStatus): string {
  switch (status) {
    case 'pendiente': return 'Pendiente';
    case 'en_curso': return 'En Curso';
    case 'cumplido':
    case 'completado': return 'Cumplido';
    case 'cancelado': return 'Cancelado';
    default: return 'Pendiente';
  }
}

export interface TaskCategory {
  id: string;
  name: string;
  isDefault?: boolean;
  isActive: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface TaskChecklistItem {
  id: string;
  taskId?: string;
  description: string;
  isCompleted: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskAuditEntry {
  id: string;
  taskId: string;
  user: string;
  date: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  details?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  programId: ProgramId | 'transversal';
  subprogramId?: string;
  category?: string; // e.g. 'Compra / Abastecimiento'
  categoryId?: string;
  origin?: 'Manual' | 'Reunión' | 'Compromiso' | 'Alerta' | 'Meta' | 'Financiero' | 'Compra' | 'Correo' | 'Indicador' | 'Pregunta' | 'ELEAM' | 'EMPAM' | 'Otro' | string;
  originType?: 'manual' | 'purchase' | 'meeting' | 'commitment' | 'email' | 'indicator' | 'question' | 'alert' | 'other' | string;
  originId?: string; // ID of origin entity
  originLabel?: string; // Human readable reference (e.g. REQ-CPU-2026-08)
  responsible: string;
  responsibleId?: string;
  priority: PriorityLevel;
  isUrgent?: boolean; // Booleano para urgencia directa
  dueDate: string;
  completedAt?: string;
  completedBy?: string;
  status: TaskStatus; // Estados manuales: 'por_hacer' | 'en_ejecucion' | 'terminada'
  notes?: string;
  observations?: string;
  attachments?: FileAttachment[];
  checklist?: TaskChecklistItem[];
  history?: TaskAuditEntry[];
  
  // Auditoría automática
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  deletedAt?: string;
  deletedBy?: string;
  archived?: boolean;
}

/**
 * Determina si una tarea está completada/terminada
 */
export function isTaskCompleted(status: TaskStatus): boolean {
  return status === 'terminada' || status === 'completada';
}

/**
 * Normaliza cualquier estado legacy al sistema operativo de 3 estados:
 * - 'por_hacer' (Pendiente)
 * - 'en_ejecucion' (En curso / Bloqueada)
 * - 'terminada' (Completada)
 */
export function normalizeTaskStatus(status: TaskStatus): 'por_hacer' | 'en_ejecucion' | 'terminada' {
  if (isTaskCompleted(status)) return 'terminada';
  if (status === 'en_ejecucion' || status === 'en_curso' || status === 'bloqueada') return 'en_ejecucion';
  return 'por_hacer';
}

/**
 * Regla de negocio: Vencida NO es un estado, es un cálculo automático.
 * (fecha_límite < fecha_actual AND estado != Terminada)
 */
export function isTaskOverdue(task: Task, currentDate: string = '2026-08-15'): boolean {
  if (isTaskCompleted(task.status)) return false;
  if (!task.dueDate) return false;
  return task.dueDate < currentDate;
}

/**
 * Calcula días restantes o de retraso:
 * > 0: días restantes
 * 0: vence hoy
 * < 0: días de retraso
 */
export function getTaskDaysDifference(dueDate: string, currentDate: string = '2026-08-15'): number {
  if (!dueDate) return 0;
  const current = new Date(currentDate);
  const due = new Date(dueDate);
  const diffTime = due.getTime() - current.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determina si una tarea vence pronto (dentro de los próximos X días, por defecto 3)
 */
export function isTaskExpiringSoon(task: Task, currentDate: string = '2026-08-15', days: number = 3): boolean {
  if (isTaskCompleted(task.status)) return false;
  if (!task.dueDate) return false;
  const diff = getTaskDaysDifference(task.dueDate, currentDate);
  return diff >= 0 && diff <= days;
}

export interface PendingEmail {
  id: string;
  type?: CommunicationType;
  subject: string;
  sender?: string;
  recipient: string;
  programId: ProgramId;
  subprogramId?: string;
  action?: EmailAction;
  priority: PriorityLevel;
  isUrgent?: boolean;
  receivedOrSentDate?: string;
  receivedDate?: string; // backwards compatibility
  deadline: string;
  responsible?: string;
  requiredAction?: string;
  status: EmailStatus;
  summary?: string; // backwards compatibility
  notes?: string;
  link?: string;
  followUps?: CommunicationFollowUp[];
  attachments?: CommunicationAttachment[];
  taskId?: string; // ID de tarea operativa vinculada
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  archived?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

export type CommunicationItem = PendingEmail;

/**
 * Normaliza cualquier estado de correo / comunicación a los 4 estados canónicos:
 * 'pendiente' | 'en_gestion' | 'respondido' | 'cerrado'
 */
export function normalizeCommunicationStatus(status?: string): CommunicationStatus {
  if (!status) return 'pendiente';
  const s = status.toLowerCase();
  if (s === 'cerrado' || s === 'cerrada' || s === 'resuelto' || s === 'resuelta' || s === 'completado') return 'cerrado';
  if (s === 'respondido' || s === 'respondida' || s === 'enviado' || s === 'enviada') return 'respondido';
  if (s === 'en_gestion' || s === 'en_curso' || s === 'esperando_respuesta' || s === 'en_redaccion' || s === 'en_progreso' || s === 'en_ejecucion' || s === 'requiere_seguimiento') return 'en_gestion';
  return 'pendiente';
}

/**
 * Calcula si un correo/requerimiento está vencido automáticamente:
 * fecha_limite < fecha_actual AND estado != Cerrado
 */
export function isEmailOverdue(email: PendingEmail, currentDate: string = '2026-08-15'): boolean {
  if (email.archived) return false;
  const canonical = normalizeCommunicationStatus(email.status);
  if (canonical === 'cerrado') return false;
  if (!email.deadline) return false;
  const diff = getTaskDaysDifference(email.deadline, currentDate);
  return diff < 0;
}

export interface CommunicationDueInfo {
  type: 'vencido' | 'hoy' | 'manana' | 'proximo' | 'normal' | 'cerrado';
  label: string;
  days: number;
  isOverdue: boolean;
}

/**
 * Calcula la condición de plazo exacta para un requerimiento
 */
export function getEmailDueInfo(deadline?: string, status?: string, currentDate: string = '2026-08-15'): CommunicationDueInfo {
  const canonical = normalizeCommunicationStatus(status);
  if (canonical === 'cerrado') {
    return { type: 'cerrado', label: 'Cerrado', days: 0, isOverdue: false };
  }
  if (!deadline) {
    return { type: 'normal', label: 'Sin plazo', days: 999, isOverdue: false };
  }

  const diff = getTaskDaysDifference(deadline, currentDate);

  if (diff < 0) {
    const abs = Math.abs(diff);
    return {
      type: 'vencido',
      label: abs === 1 ? 'Vencido hace 1 día' : `Vencido hace ${abs} días`,
      days: abs,
      isOverdue: true,
    };
  }

  if (diff === 0) {
    return {
      type: 'hoy',
      label: 'Vence hoy',
      days: 0,
      isOverdue: false,
    };
  }

  if (diff === 1) {
    return {
      type: 'manana',
      label: 'Vence mañana',
      days: 1,
      isOverdue: false,
    };
  }

  if (diff <= 3) {
    return {
      type: 'proximo',
      label: `Vence en ${diff} días`,
      days: diff,
      isOverdue: false,
    };
  }

  return {
    type: 'normal',
    label: `Plazo: ${diff} días`,
    days: diff,
    isOverdue: false,
  };
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
  isUrgent?: boolean;
  status: QuestionStatus;
  followUpDate?: string; // Fecha límite de seguimiento / alerta
  nextInstance?: string; // e.g. 'Reunión con Servicio de Salud SSMN', 'Comité Técnico 18/08'
  forNextMeeting?: boolean; // Llevar a próxima reunión / orden del día
  meetingId?: string; // Reunión vinculada
  taskId?: string; // Tarea operativa vinculada
  sourceOfResponse?: string; // Origen de la respuesta oficial (ej. SSMN, Referente Técnico, Jurídico)
  finalAnswer?: string;
  resolvedDate?: string; // Fecha en que se resolvió
  closedReason?: string; // Motivo de cierre sin respuesta
  followUps?: QuestionFollowUp[]; // Bitácora de seguimiento
  attachments?: QuestionAttachment[]; // Archivos adjuntos
  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export function getQuestionStatusLabel(status: QuestionStatus): string {
  switch (status) {
    case 'abierta':
    case 'pendiente':
      return 'Pendiente';
    case 'en_consulta':
      return 'En consulta';
    case 'esperando_respuesta':
      return 'Esperando respuesta';
    case 'resuelta':
    case 'cerrada_sin_respuesta':
      return 'Resuelta';
    default:
      return 'Pendiente';
  }
}

export function getQuestionCategoryLabel(cat: QuestionCategory): string {
  switch (cat) {
    case 'tecnica':
      return 'Técnica / Clínica';
    case 'normativa':
      return 'Normativa / Legal';
    case 'administrativa':
      return 'Administrativa / Flujo';
    case 'financiera':
      return 'Financiera / Presupuesto';
    case 'servicio_salud':
      return 'Servicio de Salud SSMN';
    case 'gestion_interna':
      return 'Gestión Interna / Comunal';
    case 'otra':
      return 'Otra';
    default:
      return cat;
  }
}

export function isQuestionOverdue(q: Question, referenceDateStr: string = '2026-08-15'): boolean {
  if (q.archived || q.status === 'resuelta' || q.status === 'cerrada_sin_respuesta') return false;
  if (!q.followUpDate) return false;
  return q.followUpDate < referenceDateStr;
}

export function isQuestionDueToday(q: Question, referenceDateStr: string = '2026-08-15'): boolean {
  if (q.archived || q.status === 'resuelta' || q.status === 'cerrada_sin_respuesta') return false;
  if (!q.followUpDate) return false;
  return q.followUpDate === referenceDateStr;
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
  | 'duda_bloqueante'
  | 'pregunta_vencida'
  | 'informacion_desactualizada';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  programId: ProgramId;
  subprogramId?: string;
  originEntity: 'task' | 'indicator' | 'purchase' | 'financial' | 'meeting' | 'email' | 'eleam' | 'question';
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
  action: 'crear' | 'editar' | 'cambiar_estado' | 'eliminar_logico' | 'restaurar' | 'convertir_tarea' | 'seguimiento' | 'resolver' | 'cerrar';
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
