/**
 * Supabase Database Service for Quilicura Salud
 * Project ID: lpcwfyvlbytpgydpmirx
 * Connected to live PostgreSQL database on Supabase
 */

import { supabase, SUPABASE_PROJECT_ID, OFFICIAL_SUPABASE_URL, isSupabaseConfigured } from './supabase';
import {
  Task,
  Purchase,
  Meeting,
  Indicator,
  Contact,
  Question,
  Alert,
  HealthProgram,
  User,
  Establishment,
  FinancialPeriod,
  BudgetComponent,
  PendingEmail,
  DocumentRecord,
  HRRecord,
  KnowledgeItem,
  ProgramBudget2025Note,
} from '../types';

export { SUPABASE_PROJECT_ID, OFFICIAL_SUPABASE_URL };

// UUID validator and generator for PostgreSQL primary keys
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function ensureValidId(id?: string): string {
  if (id && String(id).trim().length > 0) {
    return String(id).trim();
  }
  return generateUUID();
}

export function ensureUUID(id?: string): string {
  return ensureValidId(id);
}

/* ==========================================================================
   MAPPERS: FRONTEND (camelCase) <---> SUPABASE DATABASE (snake_case)
   ========================================================================== */

// 1. Health Programs
export function fromDbProgram(row: any): HealthProgram {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  const budget = Number(row.presupuesto_total) || Number(row.annual_budget) || Number(extra.presupuestoTotal) || 0;
  return {
    ...extra,
    id: row.id,
    code: row.code || extra.code || '',
    name: row.name || extra.name || '',
    shortName: row.short_name || extra.shortName || row.name || '',
    description: row.description || extra.description || '',
    referente: row.referente || extra.referente || '',
    email: row.email || extra.email || undefined,
    telefono: row.telefono || extra.telefono || undefined,
    presupuestoTotal: budget,
    presupuestoEjecutado: Number(row.presupuesto_ejecutado ?? extra.presupuestoEjecutado ?? 0),
    presupuestoComprometido: Number(row.presupuesto_comprometido ?? extra.presupuestoComprometido ?? 0),
    annualBudget: budget,
    color: row.color || extra.color || '#0284c7',
    iconName: row.icon_name || extra.iconName || 'Activity',
    targetPopulation: typeof row.target_population === 'string' ? row.target_population : (row.target_population ? String(row.target_population) : (extra.targetPopulation || '')),
    coverage: Number(row.coverage ?? extra.coverage ?? 0),
    status: row.status || extra.status || 'activo',
    year: Number(row.year ?? extra.year ?? 2026),
  };
}

export function toDbProgram(p: HealthProgram): any {
  const budget = Number(p.presupuestoTotal) || Number(p.annualBudget) || 0;
  return {
    id: p.id,
    code: p.code || '',
    name: p.name || '',
    short_name: p.shortName || p.name || '',
    description: p.description || '',
    referente: p.referente || '',
    email: p.email || null,
    telefono: p.telefono || null,
    presupuesto_total: budget,
    annual_budget: budget,
    presupuesto_ejecutado: p.presupuestoEjecutado || 0,
    presupuesto_comprometido: p.presupuestoComprometido || 0,
    color: p.color || '#0284c7',
    icon_name: p.iconName || 'Activity',
    target_population: p.targetPopulation || '0',
    coverage: p.coverage || 0,
    status: p.status || 'activo',
    year: p.year || 2026,
    data: { ...p },
  };
}

// 2. Tasks
export function fromDbTask(row: any): Task {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    title: row.title || extra.title || '',
    description: row.description || extra.description || '',
    assignedTo: row.assigned_to || extra.assignedTo || extra.responsible || '',
    responsible: row.assigned_to || extra.responsible || extra.assignedTo || 'Equipo Gestor',
    assignedRole: row.assigned_role || extra.assignedRole || '',
    establishmentId: row.establishment_id || extra.establishmentId || undefined,
    startDate: row.start_date || extra.startDate || undefined,
    dueDate: row.due_date || extra.dueDate || undefined,
    endDate: row.end_date || extra.endDate || undefined,
    status: row.status || extra.status || 'por_hacer',
    priority: row.priority || extra.priority || 'media',
    progress: Number(row.progress ?? extra.progress ?? 0),
    category: typeof row.category === 'string' ? row.category : (extra.category || 'General'),
    checklist: Array.isArray(row.checklist) ? row.checklist : (extra.checklist || []),
    budgetAssigned: Number(row.budget_assigned ?? extra.budgetAssigned ?? 0),
    milestone: Boolean(row.milestone ?? extra.milestone ?? false),
    notes: row.notes || extra.notes || undefined,
    createdAt: row.created_at || extra.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || extra.updatedAt || row.created_at || new Date().toISOString(),
  };
}

export function toDbTask(t: Task): any {
  return {
    id: ensureUUID(t.id),
    program_id: t.programId || 'praps_cpu',
    title: t.title || 'Nueva Tarea',
    description: t.description || '',
    assigned_to: t.assignedTo || t.responsible || null,
    assigned_role: t.assignedRole || null,
    establishment_id: t.establishmentId || null,
    start_date: t.startDate || null,
    due_date: t.dueDate || null,
    end_date: t.endDate || null,
    status: t.status || 'por_hacer',
    priority: t.priority || 'media',
    progress: t.progress !== undefined ? t.progress : 0,
    category: typeof t.category === 'string' ? t.category : t.category?.name || 'General',
    checklist: Array.isArray(t.checklist) ? t.checklist : [],
    budget_assigned: t.budgetAssigned || 0,
    milestone: Boolean(t.milestone),
    notes: t.notes || null,
    updated_at: new Date().toISOString(),
    data: { ...t },
  };
}

// 3. Purchases
export function fromDbPurchase(row: any): Purchase {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  const estimated = Number(row.estimated_amount ?? row.amount ?? extra.estimatedAmount ?? 0);
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    establishmentId: row.establishment_id || extra.establishmentId || undefined,
    code: row.code || extra.code || '',
    description: row.description || row.title || extra.description || '',
    itemOrService: row.title || extra.itemOrService || row.description || 'Compra / Adquisición',
    justification: row.justification || extra.justification || '',
    estimatedAmount: estimated,
    actualAmount: row.actual_amount !== null && row.actual_amount !== undefined ? Number(row.actual_amount) : extra.actualAmount,
    supplier: row.supplier || extra.supplier || '',
    status: row.status || extra.status || 'solicitado',
    stage: row.stage || extra.stage || 'solicitud',
    priority: row.priority || extra.priority || 'media',
    category: row.category || extra.category || 'general',
    requestDate: row.request_date || row.date || extra.requestDate || undefined,
    ordenCompra: row.orden_compra || row.oc_number || extra.ordenCompra || undefined,
    folioMercadoPublico: row.folio_mercado_publico || extra.folioMercadoPublico || undefined,
    responsibleUser: row.responsible_user || extra.responsibleUser || undefined,
    receptionStatus: row.reception_status || extra.receptionStatus || 'pendiente',
    invoiceStatus: row.invoice_status || extra.invoiceStatus || 'sin_factura',
    createdAt: row.created_at || extra.createdAt || new Date().toISOString(),
  };
}

export function toDbPurchase(p: Purchase): any {
  const titleVal = p.itemOrService || p.description || p.category || p.code || 'Solicitud de Compra';
  const amountVal = p.estimatedAmount || p.totalAmount || p.actualAmount || 0;
  return {
    id: ensureUUID(p.id),
    program_id: p.programId || 'praps_cpu',
    title: titleVal,
    amount: amountVal,
    establishment_id: p.establishmentId || null,
    code: p.code || 'PUR_001',
    description: p.description || titleVal,
    justification: p.justification || '',
    estimated_amount: p.estimatedAmount || amountVal,
    actual_amount: p.actualAmount !== undefined ? p.actualAmount : null,
    supplier: p.supplier || '',
    status: p.status || 'solicitado',
    stage: p.macroState || p.stage || p.status || 'solicitud',
    priority: p.priority || 'media',
    category: p.category || 'general',
    request_date: p.requestDate || null,
    date: p.requestDate || new Date().toISOString().split('T')[0],
    orden_compra: p.ordenCompra || null,
    oc_number: p.ordenCompra || null,
    folio_mercado_publico: p.folioMercadoPublico || null,
    responsible_user: p.responsibleUser || null,
    reception_status: p.receptionStatus || 'pendiente',
    invoice_status: p.invoiceStatus || 'sin_factura',
    data: { ...p },
  };
}

// 4. Meetings
export function fromDbMeeting(row: any): Meeting {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  const participantsList = Array.isArray(row.participants) && row.participants.length > 0
    ? row.participants
    : (Array.isArray(row.attendees) && row.attendees.length > 0 ? row.attendees : (extra.participants || []));
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    title: row.title || extra.title || '',
    date: row.date || extra.date || '',
    time: row.time || row.start_time || extra.time || '',
    location: row.location || extra.location || '',
    status: row.status || extra.status || 'programada',
    summary: row.summary || row.notes || extra.summary || '',
    participants: participantsList,
    agreements: Array.isArray(row.agreements) ? row.agreements : (extra.agreements || []),
    commitments: Array.isArray(row.commitments) ? row.commitments : (extra.commitments || []),
    createdAt: row.created_at || extra.createdAt || new Date().toISOString(),
  };
}

export function toDbMeeting(m: Meeting): any {
  return {
    id: ensureUUID(m.id),
    program_id: m.programId || 'praps_cpu',
    title: m.title || 'Reunión de Coordinación',
    date: m.date || new Date().toISOString().split('T')[0],
    time: m.time || '10:00',
    start_time: m.time || '10:00',
    location: m.location || '',
    status: m.status || 'programada',
    summary: m.summary || '',
    notes: m.summary || '',
    participants: Array.isArray(m.participants) ? m.participants : [],
    attendees: Array.isArray(m.participants) ? m.participants : [],
    agreements: Array.isArray(m.agreements) ? m.agreements : [],
    commitments: Array.isArray(m.commitments) ? m.commitments : [],
    data: { ...m },
  };
}

// 5. Indicators (Ficha de Indicador Completa con Cortes y Metas)
export function fromDbIndicator(row: any): Indicator {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};

  const annualTarget = row.annual_target !== undefined && row.annual_target !== null
    ? Number(row.annual_target)
    : (extra.annualTarget !== undefined ? Number(extra.annualTarget) : (Number(row.target_value) || 100));

  const periodTarget = row.period_target !== undefined && row.period_target !== null
    ? Number(row.period_target)
    : (extra.periodTarget !== undefined ? Number(extra.periodTarget) : annualTarget);

  const currentResult = row.current_result !== undefined && row.current_result !== null
    ? Number(row.current_result)
    : (extra.currentResult !== undefined ? Number(extra.currentResult) : (Number(row.current_value) || 0));

  const corte1 = row.corte1 ?? extra.corte1 ?? {
    target: periodTarget,
    targetQuantity: row.period_target_quantity !== undefined && row.period_target_quantity !== null ? Number(row.period_target_quantity) : extra.periodTargetQuantity,
    result: currentResult,
    resultQuantity: row.current_result_quantity !== undefined && row.current_result_quantity !== null ? Number(row.current_result_quantity) : extra.currentResultQuantity,
    date: '2026-07-31',
    source: row.source || extra.source || 'REM / Rayen',
  };

  const corte2 = row.corte2 ?? extra.corte2 ?? {
    target: annualTarget,
    targetQuantity: row.annual_target_quantity !== undefined && row.annual_target_quantity !== null ? Number(row.annual_target_quantity) : extra.annualTargetQuantity,
    result: currentResult,
    resultQuantity: row.current_result_quantity !== undefined && row.current_result_quantity !== null ? Number(row.current_result_quantity) : extra.currentResultQuantity,
    date: '2026-12-31',
    source: row.source || extra.source || 'REM / Rayen',
  };

  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    code: row.code || extra.code || '',
    name: row.name || extra.name || '',
    description: row.description || extra.description || '',
    targetValue: annualTarget,
    currentValue: currentResult,
    annualTarget,
    annualTargetQuantity: row.annual_target_quantity !== undefined && row.annual_target_quantity !== null
      ? Number(row.annual_target_quantity)
      : extra.annualTargetQuantity,
    periodTarget,
    periodTargetQuantity: row.period_target_quantity !== undefined && row.period_target_quantity !== null
      ? Number(row.period_target_quantity)
      : extra.periodTargetQuantity,
    currentResult,
    currentResultQuantity: row.current_result_quantity !== undefined && row.current_result_quantity !== null
      ? Number(row.current_result_quantity)
      : extra.currentResultQuantity,
    unit: row.unit || extra.unit || '%',
    periodicity: row.periodicity || extra.periodicity || 'mensual',
    weight: row.weight !== undefined && row.weight !== null ? Number(row.weight) : (extra.weight ?? 1),
    goodThreshold: Number(row.good_threshold ?? extra.goodThreshold ?? 85),
    warningThreshold: Number(row.warning_threshold ?? extra.warningThreshold ?? 70),
    measurements: Array.isArray(row.measurements) ? row.measurements : (extra.measurements || []),
    cuts: Array.isArray(row.cuts) ? row.cuts : (extra.cuts || []),
    lastUpdated: row.last_updated || row.created_at || new Date().toISOString(),

    componente: row.componente ?? extra.componente,
    objetivoEspecifico: row.objetivo_especifico ?? extra.objetivoEspecifico ?? row.description,
    corteSeleccionado: row.corte_seleccionado ?? extra.corteSeleccionado ?? '1° corte',
    numeradorDescripcion: row.numerador_descripcion ?? extra.numeradorDescripcion,
    numeradorValor: row.numerador_valor !== undefined && row.numerador_valor !== null
      ? Number(row.numerador_valor)
      : extra.numeradorValor,
    numeradorTipo: row.numerador_tipo ?? extra.numeradorTipo ?? 'porcentaje',
    denominadorDescripcion: row.denominador_descripcion ?? extra.denominadorDescripcion,
    denominadorValor: row.denominador_valor !== undefined && row.denominador_valor !== null
      ? Number(row.denominador_valor)
      : extra.denominadorValor,
    denominadorTipo: row.denominador_tipo ?? extra.denominadorTipo ?? 'porcentaje',
    pesoRelativo: row.peso_relativo !== undefined && row.peso_relativo !== null
      ? Number(row.peso_relativo)
      : (extra.pesoRelativo ?? 50),
    medioVerificacionNumerador: row.medio_verificacion_numerador ?? extra.medioVerificacionNumerador,
    medioVerificacionDenominador: row.medio_verificacion_denominador ?? extra.medioVerificacionDenominador,
    metaCumplimientoAnualTexto: row.meta_cumplimiento_anual_texto ?? extra.metaCumplimientoAnualTexto,
    metaCumplimientoAnualPorcentaje: row.meta_cumplimiento_anual_porcentaje !== undefined && row.meta_cumplimiento_anual_porcentaje !== null
      ? Number(row.meta_cumplimiento_anual_porcentaje)
      : (extra.metaCumplimientoAnualPorcentaje ?? annualTarget),
    cutoffDate: row.cutoff_date ?? extra.cutoffDate,
    source: row.source ?? extra.source ?? 'REM / Rayen',
    corte1,
    corte2,
    corte3: row.corte3 ?? extra.corte3,
  };
}

export function toDbIndicator(i: Indicator): any {
  const targetVal = Number(i.annualTarget ?? i.targetValue ?? 100);
  const currentVal = Number(i.currentResult ?? i.currentValue ?? 0);
  const weightVal = Number(i.pesoRelativo ?? i.weight ?? 1);

  return {
    id: ensureUUID(i.id),
    program_id: i.programId || 'praps_cpu',
    code: i.code || '',
    name: i.name || '',
    description: i.description || i.objetivoEspecifico || '',
    target_value: isNaN(targetVal) ? 100 : targetVal,
    current_value: isNaN(currentVal) ? 0 : currentVal,
    unit: i.unit || '%',
    periodicity: i.periodicity || 'mensual',
    weight: isNaN(weightVal) ? 1 : weightVal,
    good_threshold: Number(i.goodThreshold) || 85,
    warning_threshold: Number(i.warningThreshold) || 70,
    measurements: Array.isArray(i.measurements) ? i.measurements : [],
    cuts: Array.isArray(i.cuts) ? i.cuts : [],
    last_updated: new Date().toISOString(),

    // Columnas extendidas
    componente: i.componente || null,
    objetivo_especifico: i.objetivoEspecifico || i.description || null,
    corte_seleccionado: i.corteSeleccionado || '1° corte',
    numerador_descripcion: i.numeradorDescripcion || null,
    numerador_valor: i.numeradorValor !== undefined ? Number(i.numeradorValor) : null,
    numerador_tipo: i.numeradorTipo || 'porcentaje',
    denominador_descripcion: i.denominadorDescripcion || null,
    denominador_valor: i.denominadorValor !== undefined ? Number(i.denominadorValor) : null,
    denominador_tipo: i.denominadorTipo || 'porcentaje',
    peso_relativo: i.pesoRelativo !== undefined ? Number(i.pesoRelativo) : weightVal,
    medio_verificacion_numerador: i.medioVerificacionNumerador || null,
    medio_verificacion_denominador: i.medioVerificacionDenominador || null,
    meta_cumplimiento_anual_texto: i.metaCumplimientoAnualTexto || null,
    meta_cumplimiento_anual_porcentaje: i.metaCumplimientoAnualPorcentaje !== undefined ? Number(i.metaCumplimientoAnualPorcentaje) : targetVal,
    annual_target: i.annualTarget !== undefined ? Number(i.annualTarget) : targetVal,
    annual_target_quantity: i.annualTargetQuantity !== undefined ? Number(i.annualTargetQuantity) : null,
    period_target: i.periodTarget !== undefined ? Number(i.periodTarget) : targetVal,
    period_target_quantity: i.periodTargetQuantity !== undefined ? Number(i.periodTargetQuantity) : null,
    current_result: i.currentResult !== undefined ? Number(i.currentResult) : currentVal,
    current_result_quantity: i.currentResultQuantity !== undefined ? Number(i.currentResultQuantity) : null,
    source: i.source || 'REM / Rayen',
    cutoff_date: i.cutoffDate || null,
    corte1: i.corte1 || null,
    corte2: i.corte2 || null,
    corte3: i.corte3 || null,
    data: { ...i },
  };
}

export function toMinimalDbIndicator(i: Indicator): any {
  const targetVal = Number(i.annualTarget ?? i.targetValue ?? 100);
  const currentVal = Number(i.currentResult ?? i.currentValue ?? 0);
  const weightVal = Number(i.pesoRelativo ?? i.weight ?? 1);
  return {
    id: ensureUUID(i.id),
    program_id: i.programId || 'praps_cpu',
    code: i.code || '',
    name: i.name || '',
    description: i.description || i.objetivoEspecifico || '',
    target_value: isNaN(targetVal) ? 100 : targetVal,
    current_value: isNaN(currentVal) ? 0 : currentVal,
    unit: i.unit || '%',
    periodicity: i.periodicity || 'mensual',
    weight: isNaN(weightVal) ? 1 : weightVal,
    good_threshold: Number(i.goodThreshold) || 85,
    warning_threshold: Number(i.warningThreshold) || 70,
    measurements: Array.isArray(i.measurements) ? i.measurements : [],
    cuts: Array.isArray(i.cuts) ? i.cuts : [],
    last_updated: new Date().toISOString(),
    data: { ...i },
  };
}

// 6. Contacts
export function fromDbContact(row: any): Contact {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  const pIds = Array.isArray(row.program_ids)
    ? row.program_ids
    : (Array.isArray(row.programIds)
      ? row.programIds
      : (row.program_id ? [row.program_id] : (extra.programIds || [])));

  return {
    ...extra,
    id: row.id,
    programId: row.program_id || (pIds.length > 0 ? pIds[0] : undefined) || extra.programId,
    programIds: pIds,
    name: row.name || extra.name || '',
    lastName: row.last_name || extra.lastName || '',
    role: row.role || extra.role || '',
    institution: row.institution || extra.institution || '',
    email: row.email || extra.email || '',
    phone: row.phone || extra.phone || '',
    contactType: row.contact_type || extra.contactType || 'referente_comunal',
    createdAt: row.created_at || extra.createdAt || new Date().toISOString(),
  };
}

export function toDbContact(c: Contact): any {
  const pId = c.programId || (c.programIds && c.programIds.length > 0 ? c.programIds[0] : 'praps_cpu');
  return {
    id: ensureUUID(c.id),
    program_id: pId,
    program_ids: Array.isArray(c.programIds) ? c.programIds : [pId],
    name: c.name || '',
    last_name: c.lastName || '',
    role: c.role || '',
    institution: c.institution || '',
    email: c.email || '',
    phone: c.phone || '',
    contact_type: c.contactType || 'referente_comunal',
    data: { ...c },
  };
}

// 7. Questions (Dudas / Orientaciones Técnicas)
export function fromDbQuestion(row: any): Question {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    askedBy: row.asked_by || extra.askedBy || '',
    category: row.category || extra.category || 'orientacion_tecnica',
    question: row.question || extra.question || '',
    answer: row.answer || extra.answer || '',
    status: row.status || extra.status || 'pendiente',
    priority: row.priority || extra.priority || 'media',
    date: row.date || extra.date || new Date().toISOString().split('T')[0],
    dueDate: row.due_date || extra.dueDate || undefined,
    answeredBy: row.answered_by || extra.answeredBy || undefined,
    answeredDate: row.answered_date || extra.answeredDate || undefined,
    followUps: Array.isArray(row.follow_ups) ? row.follow_ups : (extra.followUps || []),
    createdAt: row.created_at || extra.createdAt || new Date().toISOString(),
  };
}

export function toDbQuestion(q: Question): any {
  return {
    id: ensureUUID(q.id),
    program_id: q.programId || 'praps_cpu',
    asked_by: q.askedBy || '',
    category: q.category || 'orientacion_tecnica',
    question: q.question || '',
    answer: q.answer || '',
    status: q.status || 'pendiente',
    priority: q.priority || 'media',
    date: q.date || new Date().toISOString().split('T')[0],
    due_date: q.dueDate || null,
    answered_by: q.answeredBy || null,
    answered_date: q.answeredDate || null,
    follow_ups: Array.isArray(q.followUps) ? q.followUps : [],
    data: { ...q },
  };
}

// 8. Alerts
export function fromDbAlert(row: any): Alert {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    type: row.type || extra.type || 'sistema',
    severity: row.severity || extra.severity || 'media',
    title: row.title || extra.title || '',
    message: row.message || extra.message || '',
    createdAt: row.created_at || extra.createdAt || new Date().toISOString(),
  };
}

export function toDbAlert(a: Alert): any {
  return {
    id: ensureUUID(a.id),
    program_id: a.programId || null,
    type: a.type || 'sistema',
    severity: a.severity || 'media',
    title: a.title || '',
    message: a.message || '',
    data: { ...a },
  };
}

// 9. Users
export function fromDbUser(row: any): User {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    name: row.name || extra.name || '',
    email: row.email || extra.email || '',
    role: row.role || extra.role || 'referente',
    title: row.title || extra.title || 'Referente Comunal',
    comuna: row.comuna || extra.comuna || 'Quilicura (DISAM)',
    establishment: row.establishment || extra.establishment || 'Dirección de Salud / Comunal',
    healthService: row.health_service || extra.healthService || 'Servicio de Salud Metropolitano Norte',
    avatar: row.avatar || extra.avatar || (row.name ? row.name.charAt(0).toUpperCase() : 'U'),
    photoUrl: row.photo_url || extra.photoUrl || undefined,
    phone: row.phone || extra.phone || undefined,
    phonePrefix: row.phone_prefix || extra.phonePrefix || 'CL +56',
    instagram: row.instagram || extra.instagram || undefined,
    country: row.country || extra.country || 'Chile',
    budgetYear: row.budget_year || extra.budgetYear || '2026',
  };
}

export function toDbUser(u: Partial<User> & { id: string; email?: string; name?: string }): any {
  return {
    id: u.id,
    name: u.name || '',
    email: (u.email || '').toLowerCase().trim(),
    role: u.role || 'referente',
    title: u.title || 'Referente de Programas de Salud',
    comuna: u.comuna || 'Quilicura (DISAM)',
    establishment: u.establishment || 'Dirección de Salud / Comunal',
    health_service: u.healthService || 'Servicio de Salud Metropolitano Norte',
    avatar: u.avatar || (u.name ? u.name.charAt(0).toUpperCase() : 'U'),
    photo_url: u.photoUrl || null,
    phone: u.phone || null,
    phone_prefix: u.phonePrefix || 'CL +56',
    instagram: u.instagram || null,
    country: u.country || 'Chile',
    budget_year: Number(u.budgetYear) || 2026,
    updated_at: new Date().toISOString(),
    data: { ...u },
  };
}

// 10. Establishments
export function fromDbEstablishment(row: any): Establishment {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    name: row.name || extra.name || '',
    code: row.code || extra.code || '',
    type: row.type || extra.type || 'CESFAM',
    address: row.address || extra.address || '',
    director: row.director || extra.director || '',
    phone: row.phone || extra.phone || '',
    email: row.email || extra.email || '',
  };
}

export function toDbEstablishment(e: Establishment): any {
  return {
    id: e.id,
    name: e.name || '',
    code: e.code || '',
    type: e.type || 'CESFAM',
    address: e.address || '',
    director: e.director || '',
    phone: e.phone || '',
    email: e.email || '',
    data: { ...e },
  };
}

// 11. Financial Periods
export function fromDbFinancialPeriod(row: any): FinancialPeriod {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    month: row.month || extra.month || '',
    year: Number(row.year ?? extra.year ?? 2026),
    periodName: row.period_name || extra.periodName || '',
    presupuestoAsignado: Number(row.presupuesto_asignado ?? extra.presupuestoAsignado ?? 0),
    presupuestoEjecutado: Number(row.presupuesto_ejecutado ?? extra.presupuestoEjecutado ?? 0),
    presupuestoComprometido: Number(row.presupuesto_comprometido ?? extra.presupuestoComprometido ?? 0),
    saldoDisponible: Number(row.saldo_disponible ?? extra.saldoDisponible ?? 0),
    rendicionEnviada: Boolean(row.rendicion_enviada ?? extra.rendicionEnviada ?? false),
    rendicionAprobada: Boolean(row.rendicion_aprobada ?? extra.rendicionAprobada ?? false),
    fechaRendicion: row.fecha_rendicion || extra.fechaRendicion || undefined,
    observacionesRendicion: row.observaciones_rendicion || extra.observacionesRendicion || '',
  };
}

export function toDbFinancialPeriod(f: FinancialPeriod): any {
  return {
    id: ensureUUID(f.id),
    program_id: f.programId || 'praps_cpu',
    period_name: f.periodName || '',
    year: f.year || 2026,
    allocated_budget: f.presupuestoAsignado || 0,
    executed_budget: f.presupuestoEjecutado || 0,
    committed_budget: f.presupuestoComprometido || 0,
    available_budget: f.saldoDisponible || 0,
    notes: f.observacionesRendicion || null,
    data: { ...f },
  };
}

// 12. Budget Components
export function fromDbBudgetComponent(row: any): BudgetComponent {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    name: row.name || extra.name || '',
    budgetToSpend: Number(row.budget_to_spend ?? extra.budgetToSpend ?? 0),
    spentAmount: Number(row.spent_amount ?? extra.spentAmount ?? 0),
    category: row.category || extra.category || 'Personal',
    description: row.description || extra.description || '',
  };
}

export function toDbBudgetComponent(b: BudgetComponent): any {
  return {
    id: ensureUUID(b.id),
    program_id: b.programId || 'praps_cpu',
    name: b.name || '',
    budget_to_spend: b.budgetToSpend || 0,
    spent_amount: b.spentAmount || 0,
    category: b.category || 'Personal',
    description: b.description || null,
    data: { ...b },
  };
}

// 13. Emails (PendingEmail)
export function fromDbEmail(row: any): PendingEmail {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    from: row.from_email || row.sender || extra.from || '',
    to: row.to_email || row.recipient || extra.to || '',
    subject: row.subject || extra.subject || '',
    body: row.body || extra.body || '',
    date: row.date || extra.date || row.created_at || new Date().toISOString(),
    dueDate: row.due_date || extra.dueDate,
    status: row.status || extra.status || 'pendiente',
    priority: row.priority || extra.priority || 'media',
    type: row.type || extra.type || 'correo',
    sender: row.sender || row.from_email || extra.sender,
    recipient: row.recipient || row.to_email || extra.recipient,
    receivedOrSentDate: row.date || extra.receivedOrSentDate,
    responsible: row.responsible || extra.responsible,
    archived: Boolean(row.archived ?? extra.archived ?? false),
  };
}

export function toDbEmail(e: PendingEmail): any {
  return {
    id: ensureUUID(e.id),
    program_id: e.programId || 'praps_cpu',
    from_email: e.from || e.sender || '',
    to_email: e.to || e.recipient || '',
    subject: e.subject || '',
    body: e.body || '',
    status: e.status || 'pendiente',
    priority: e.priority || 'media',
    type: e.type || 'correo',
    date: e.date || new Date().toISOString(),
    due_date: e.dueDate || null,
    archived: Boolean(e.archived),
    data: { ...e },
  };
}

// 14. Documents (DocumentRecord)
export function fromDbDocument(row: any): DocumentRecord {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    programIds: Array.isArray(row.program_ids) ? row.program_ids : (extra.programIds || (row.program_id ? [row.program_id] : [])),
    title: row.title || extra.title || '',
    description: row.description || extra.description || '',
    category: row.category || extra.category || 'convenio',
    documentType: row.document_type || extra.documentType || 'convenio',
    documentNumber: row.document_number || extra.documentNumber,
    issuingBody: row.issuing_body || extra.issuingBody,
    institution: row.institution || extra.institution,
    documentDate: row.document_date || extra.documentDate,
    validFrom: row.valid_from || extra.validFrom,
    validUntil: row.valid_until || extra.validUntil,
    expirationDate: row.expiration_date || extra.expirationDate,
    status: row.status || extra.status || 'vigente',
    fileName: row.file_name || extra.fileName,
    fileSize: row.file_size || extra.fileSize,
    uploadDate: row.upload_date || extra.uploadDate || row.created_at,
    uploadedBy: row.uploaded_by || extra.uploadedBy,
    responsible: row.responsible || extra.responsible,
    version: row.version || extra.version || '1.0',
    tags: Array.isArray(row.tags) ? row.tags : (extra.tags || []),
    notes: row.notes || extra.notes,
    createdAt: row.created_at || extra.createdAt,
    updatedAt: row.updated_at || extra.updatedAt,
    archived: Boolean(row.archived ?? extra.archived ?? false),
  };
}

export function toDbDocument(d: DocumentRecord): any {
  return {
    id: ensureUUID(d.id),
    program_id: d.programId || (d.programIds && d.programIds[0]) || 'praps_cpu',
    program_ids: Array.isArray(d.programIds) ? d.programIds : (d.programId ? [d.programId] : []),
    title: d.title || '',
    description: d.description || '',
    category: d.category || 'convenio',
    document_type: d.documentType || 'convenio',
    document_number: d.documentNumber || null,
    status: d.status || 'vigente',
    file_name: d.fileName || null,
    file_size: d.fileSize || null,
    upload_date: d.uploadDate || new Date().toISOString(),
    uploaded_by: d.uploadedBy || null,
    archived: Boolean(d.archived),
    data: { ...d },
  };
}

// 15. HR Records (HRRecord)
export function fromDbHRRecord(row: any): HRRecord {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    establishmentId: row.establishment_id || extra.establishmentId,
    name: row.name || extra.name || '',
    rut: row.rut || extra.rut || '',
    role: row.role || extra.role || '',
    hours: row.hours !== undefined && row.hours !== null ? Number(row.hours) : (extra.hours ?? 44),
    contractType: row.contract_type || extra.contractType || 'Contrata',
    monthlyCost: row.monthly_cost !== undefined && row.monthly_cost !== null ? Number(row.monthly_cost) : extra.monthlyCost,
    startDate: row.start_date || extra.startDate,
    endDate: row.end_date || extra.endDate,
    status: row.status || extra.status || 'activo',
    archived: Boolean(row.archived ?? extra.archived ?? false),
  };
}

export function toDbHRRecord(h: HRRecord): any {
  return {
    id: ensureUUID(h.id),
    program_id: h.programId || 'praps_cpu',
    establishment_id: h.establishmentId || null,
    name: h.name || '',
    rut: h.rut || '',
    role: h.role || '',
    hours: Number(h.hours) || 44,
    contract_type: h.contractType || 'Contrata',
    monthly_cost: Number(h.monthlyCost) || 0,
    start_date: h.startDate || null,
    end_date: h.endDate || null,
    status: h.status || 'activo',
    archived: Boolean(h.archived),
    data: { ...h },
  };
}

// 16. Knowledge (KnowledgeItem)
export function fromDbKnowledge(row: any): KnowledgeItem {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    programIds: Array.isArray(row.program_ids) ? row.program_ids : (extra.programIds || (row.program_id ? [row.program_id] : [])),
    title: row.title || extra.title || '',
    category: row.category || extra.category || 'General',
    content: row.content || extra.content || '',
    tags: Array.isArray(row.tags) ? row.tags : (extra.tags || []),
    author: row.author || extra.author,
    date: row.date || extra.date || row.created_at,
    createdAt: row.created_at || extra.createdAt,
    updatedAt: row.updated_at || extra.updatedAt,
    archived: Boolean(row.archived ?? extra.archived ?? false),
  };
}

export function toDbKnowledge(k: KnowledgeItem): any {
  return {
    id: ensureUUID(k.id),
    program_id: k.programId || (k.programIds && k.programIds[0]) || 'praps_cpu',
    program_ids: Array.isArray(k.programIds) ? k.programIds : (k.programId ? [k.programId] : []),
    title: k.title || '',
    category: k.category || 'General',
    content: k.content || '',
    tags: Array.isArray(k.tags) ? k.tags : [],
    author: k.author || null,
    date: k.date || new Date().toISOString(),
    archived: Boolean(k.archived),
    data: { ...k },
  };
}

// 17. Budget 2025 Notes (ProgramBudget2025Note)
export function fromDbBudget2025Note(row: any): ProgramBudget2025Note {
  const extra = row.data && typeof row.data === 'object' ? row.data : {};
  return {
    ...extra,
    id: row.id,
    programId: row.program_id || extra.programId,
    note: row.note || extra.note || '',
    author: row.author || extra.author || '',
    date: row.date || extra.date || row.created_at || new Date().toISOString(),
    type: row.type || extra.type || 'presupuesto',
    budgetAmount: row.budget_amount !== undefined && row.budget_amount !== null ? Number(row.budget_amount) : extra.budgetAmount,
    executedAmount: row.executed_amount !== undefined && row.executed_amount !== null ? Number(row.executed_amount) : extra.executedAmount,
    fulfillmentRate: row.fulfillment_rate !== undefined && row.fulfillment_rate !== null ? Number(row.fulfillment_rate) : extra.fulfillmentRate,
  };
}

export function toDbBudget2025Note(b: ProgramBudget2025Note): any {
  return {
    id: ensureUUID(b.id),
    program_id: b.programId || 'praps_cpu',
    note: b.note || '',
    author: b.author || '',
    date: b.date || new Date().toISOString(),
    type: b.type || 'presupuesto',
    budget_amount: Number(b.budgetAmount) || 0,
    executed_amount: Number(b.executedAmount) || 0,
    fulfillment_rate: Number(b.fulfillmentRate) || 0,
    data: { ...b },
  };
}

/* ==========================================================================
   USER IDENTITY AND AUTH METHODS
   ========================================================================== */

export async function checkIfEmailIsRegisteredInSupabase(email: string): Promise<{ registered: boolean; definitive: boolean }> {
  if (!isSupabaseConfigured() || !email) return { registered: false, definitive: false };
  const cleanEmail = email.toLowerCase().trim();

  // 1. Intentar función RPC de Postgres 'check_email_registered' (verifica en auth.users y public.users)
  try {
    const { data, error } = await supabase.rpc('check_email_registered', { p_email: cleanEmail });
    if (!error && typeof data === 'boolean') {
      return { registered: data, definitive: true };
    }
  } catch {
    // Función RPC aún no desplegada
  }

  // 2. Consulta directa en la tabla public.users
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .ilike('email', cleanEmail)
      .limit(1);

    if (!error && data && data.length > 0) {
      return { registered: true, definitive: true };
    }
  } catch {
    // Error de consulta o red
  }

  return { registered: false, definitive: false };
}

export async function fetchUserByIdOrEmailFromSupabase(id?: string, email?: string): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const cleanEmail = (email || '').toLowerCase().trim();
    const rows: any[] = [];

    if (id) {
      const { data } = await supabase.from('users').select('*').eq('id', id).order('updated_at', { ascending: false });
      if (data && data.length > 0) rows.push(...data);
    }
    if (cleanEmail) {
      const { data } = await supabase.from('users').select('*').eq('email', cleanEmail).order('updated_at', { ascending: false });
      if (data && data.length > 0) {
        data.forEach((r) => {
          if (!rows.some((existing) => existing.id === r.id)) {
            rows.push(r);
          }
        });
      }
    }

    if (rows.length === 0) return null;

    // Prioritize the row matching the exact auth ID; otherwise use the most recently updated row
    const prioritizedRow = (id ? rows.find((r) => r.id === id) : null) || rows[0];
    return fromDbUser(prioritizedRow);
  } catch (err: any) {
    console.warn('fetchUserByIdOrEmailFromSupabase error:', err?.message);
    return null;
  }
}

export async function upsertUserInSupabase(user: Partial<User> & { id?: string; email?: string; name?: string }): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) return { success: true };
  try {
    let authUid: string | undefined;
    let authEmail: string | undefined;
    try {
      const { data: authData } = await supabase.auth.getUser();
      authUid = authData?.user?.id;
      authEmail = authData?.user?.email;
    } catch {
      // Sin sesión activa
    }

    const resolvedEmail = (user.email || authEmail || '').toLowerCase().trim();

    // 1. Resolve existing record ID from Supabase public.users if available
    let existingId: string | undefined;
    if (authUid) {
      existingId = authUid;
    } else {
      if (user.id) {
        const { data: byId } = await supabase.from('users').select('id').eq('id', user.id).maybeSingle();
        if (byId?.id) existingId = byId.id;
      }
      if (!existingId && resolvedEmail) {
        const { data: byEmail } = await supabase.from('users').select('id').eq('email', resolvedEmail).maybeSingle();
        if (byEmail?.id) existingId = byEmail.id;
      }
    }

    const finalId = existingId || authUid || user.id || 'usr_' + Date.now();

    const payload = toDbUser({
      ...user,
      id: finalId,
      email: resolvedEmail,
    });

    const { id: _ignoreId, ...fieldsToUpdate } = payload;

    let { error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'id' });

    // Fallback resilient saving if Supabase table lacks newly added columns (phone, instagram, photo_url, etc.)
    if (error && (error.message.includes('column') || error.message.includes('schema cache'))) {
      console.warn('Alerta de esquema en users table, aplicando guardado de respaldo resiliente con data JSONB...', error.message);
      const fallbackPayload: any = {
        id: finalId,
        name: payload.name || 'Usuario',
        email: resolvedEmail,
        role: payload.role || 'referente',
        title: payload.title || 'Referente de Programas de Salud',
        data: {
          ...payload.data,
          phone: payload.phone,
          phonePrefix: payload.phone_prefix,
          instagram: payload.instagram,
          country: payload.country,
          photoUrl: payload.photo_url,
          avatar: payload.avatar,
          budgetYear: payload.budget_year,
          title: payload.title,
          role: payload.role,
          healthService: payload.health_service,
          comuna: payload.comuna,
          establishment: payload.establishment,
        },
        updated_at: new Date().toISOString(),
      };
      const fallbackRes = await supabase.from('users').upsert(fallbackPayload, { onConflict: 'id' });
      if (!fallbackRes.error) {
        error = null;
      }
    }

    // Update ALL rows matching email without overwriting their primary key ID
    if (resolvedEmail) {
      await supabase
        .from('users')
        .update(fieldsToUpdate)
        .eq('email', resolvedEmail);

      // If column error might have happened on email update, update data JSONB
      await supabase
        .from('users')
        .update({
          name: payload.name,
          data: {
            ...payload.data,
            phone: payload.phone,
            phonePrefix: payload.phone_prefix,
            instagram: payload.instagram,
            country: payload.country,
            photoUrl: payload.photo_url,
            avatar: payload.avatar,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('email', resolvedEmail);

      // If authUid exists, clean up any legacy seed records (e.g. 'usr_klaus_bauer') to prevent duplicate conflicting rows
      if (authUid) {
        await supabase
          .from('users')
          .delete()
          .eq('email', resolvedEmail)
          .neq('id', authUid);
      }
    }

    if (authUid && authUid !== finalId) {
      await supabase
        .from('users')
        .update(fieldsToUpdate)
        .eq('id', authUid);
    }

    try {
      const authUpdates: any = {
        data: {
          full_name: payload.name,
          name: payload.name,
          role: payload.role,
          title: payload.title,
          phone: payload.phone,
          phone_prefix: payload.phone_prefix,
          phonePrefix: payload.phone_prefix,
          comuna: payload.comuna,
          establishment: payload.establishment,
          health_service: payload.health_service,
          healthService: payload.health_service,
          instagram: payload.instagram,
          country: payload.country,
          budget_year: payload.budget_year,
          budgetYear: payload.budget_year,
          photo_url: payload.photo_url,
          avatar: payload.avatar,
        },
      };

      if (authEmail && resolvedEmail && authEmail.toLowerCase() !== resolvedEmail.toLowerCase()) {
        authUpdates.email = resolvedEmail;
      }

      await supabase.auth.updateUser(authUpdates);
    } catch {
      // Silencioso
    }

    if (error) {
      console.warn('Advertencia al guardar usuario en Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('upsertUserInSupabase exception:', err?.message);
    return { success: false, error: err?.message };
  }
}

/* ==========================================================================
   DATABASE READ OPERATIONS
   ========================================================================== */

export async function fetchHealthProgramsFromSupabase(): Promise<HealthProgram[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('health_programs')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.warn('Supabase health_programs not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbProgram);
  } catch (err: any) {
    console.warn('Fetch health_programs failed safely:', err?.message);
    return [];
  }
}

export async function fetchTasksFromSupabase(): Promise<Task[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase tasks not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbTask);
  } catch (err: any) {
    console.warn('Fetch tasks failed safely:', err?.message);
    return [];
  }
}

export async function fetchPurchasesFromSupabase(): Promise<Purchase[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase purchases not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbPurchase);
  } catch (err: any) {
    console.warn('Fetch purchases failed safely:', err?.message);
    return [];
  }
}

export async function fetchMeetingsFromSupabase(): Promise<Meeting[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.warn('Supabase meetings not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbMeeting);
  } catch (err: any) {
    console.warn('Fetch meetings failed safely:', err?.message);
    return [];
  }
}

export async function fetchIndicatorsFromSupabase(): Promise<Indicator[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('indicators')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.warn('Supabase indicators not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbIndicator);
  } catch (err: any) {
    console.warn('Fetch indicators failed safely:', err?.message);
    return [];
  }
}

export async function fetchContactsFromSupabase(): Promise<Contact[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.warn('Supabase contacts not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbContact);
  } catch (err: any) {
    console.warn('Fetch contacts failed safely:', err?.message);
    return [];
  }
}

export async function fetchQuestionsFromSupabase(): Promise<Question[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.warn('Supabase questions not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbQuestion);
  } catch (err: any) {
    console.warn('Fetch questions failed safely:', err?.message);
    return [];
  }
}

export async function fetchAlertsFromSupabase(): Promise<Alert[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase alerts not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbAlert);
  } catch (err: any) {
    console.warn('Fetch alerts failed safely:', err?.message);
    return [];
  }
}

export async function fetchUsersFromSupabase(): Promise<User[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      console.warn('Supabase users not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbUser);
  } catch (err: any) {
    console.warn('Fetch users failed safely:', err?.message);
    return [];
  }
}

export async function fetchEstablishmentsFromSupabase(): Promise<Establishment[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('establishments')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.warn('Supabase establishments not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbEstablishment);
  } catch (err: any) {
    console.warn('Fetch establishments failed safely:', err?.message);
    return [];
  }
}

export async function fetchFinancialPeriodsFromSupabase(): Promise<FinancialPeriod[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('financial_periods')
      .select('*')
      .order('period_name', { ascending: true });
    if (error) {
      console.warn('Supabase financial_periods not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbFinancialPeriod);
  } catch (err: any) {
    console.warn('Fetch financial_periods failed safely:', err?.message);
    return [];
  }
}

export async function fetchBudgetComponentsFromSupabase(): Promise<BudgetComponent[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('budget_components')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.warn('Supabase budget_components not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbBudgetComponent);
  } catch (err: any) {
    console.warn('Fetch budget_components failed safely:', err?.message);
    return [];
  }
}

export async function fetchEmailsFromSupabase(): Promise<PendingEmail[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .order('date', { ascending: false });
    if (error) {
      console.warn('Supabase emails not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbEmail);
  } catch (err: any) {
    console.warn('Fetch emails failed safely:', err?.message);
    return [];
  }
}

export async function fetchDocumentsFromSupabase(): Promise<DocumentRecord[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase documents not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbDocument);
  } catch (err: any) {
    console.warn('Fetch documents failed safely:', err?.message);
    return [];
  }
}

export async function fetchHRRecordsFromSupabase(): Promise<HRRecord[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('hr_records')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      console.warn('Supabase hr_records not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbHRRecord);
  } catch (err: any) {
    console.warn('Fetch hr_records failed safely:', err?.message);
    return [];
  }
}

export async function fetchKnowledgeFromSupabase(): Promise<KnowledgeItem[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data, error } = await supabase
      .from('knowledge')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.warn('Supabase knowledge not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbKnowledge);
  } catch (err: any) {
    console.warn('Fetch knowledge failed safely:', err?.message);
    return [];
  }
}

export async function fetchBudget2025NotesFromSupabase(): Promise<Record<string, ProgramBudget2025Note>> {
  if (!isSupabaseConfigured()) return {};
  try {
    const { data, error } = await supabase
      .from('budget_2025_notes')
      .select('*');
    if (error) {
      console.warn('Supabase budget_2025_notes not reachable:', error.message);
      return {};
    }
    const result: Record<string, ProgramBudget2025Note> = {};
    (data || []).forEach((row: any) => {
      const note = fromDbBudget2025Note(row);
      const key = note.programId || note.id || 'general';
      result[key] = note;
    });
    return result;
  } catch (err: any) {
    console.warn('Fetch budget_2025_notes failed safely:', err?.message);
    return {};
  }
}

/* ==========================================================================
   DATABASE WRITE OPERATIONS (UPSERT & DELETE)
   ========================================================================== */

export async function upsertTaskInSupabase(task: Task): Promise<Task> {
  if (!isSupabaseConfigured()) return task;
  try {
    const payload = toDbTask(task);
    const { data, error } = await supabase
      .from('tasks')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting task in Supabase:', error.message);
      return task;
    }
    return fromDbTask(data);
  } catch (err: any) {
    console.warn('Task upsert skipped safely:', err?.message);
    return task;
  }
}

export async function deleteTaskFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) console.warn('Error deleting task from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Task delete skipped safely:', err?.message);
  }
}

export async function upsertPurchaseInSupabase(purchase: Purchase): Promise<Purchase> {
  if (!isSupabaseConfigured()) return purchase;
  try {
    const payload = toDbPurchase(purchase);
    const { data, error } = await supabase
      .from('purchases')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting purchase in Supabase:', error.message);
      return purchase;
    }
    return fromDbPurchase(data);
  } catch (err: any) {
    console.warn('Purchase upsert skipped safely:', err?.message);
    return purchase;
  }
}

export async function deletePurchaseFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('purchases').delete().eq('id', id);
    if (error) console.warn('Error deleting purchase from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Purchase delete skipped safely:', err?.message);
  }
}

export async function upsertMeetingInSupabase(meeting: Meeting): Promise<Meeting> {
  if (!isSupabaseConfigured()) return meeting;
  try {
    const payload = toDbMeeting(meeting);
    const { data, error } = await supabase
      .from('meetings')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting meeting in Supabase:', error.message);
      return meeting;
    }
    return fromDbMeeting(data);
  } catch (err: any) {
    console.warn('Meeting upsert skipped safely:', err?.message);
    return meeting;
  }
}

export async function deleteMeetingFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (error) console.warn('Error deleting meeting from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Meeting delete skipped safely:', err?.message);
  }
}

export async function upsertIndicatorInSupabase(indicator: Indicator): Promise<Indicator> {
  if (!isSupabaseConfigured()) return indicator;
  try {
    const payload = toDbIndicator(indicator);
    const { data, error } = await supabase
      .from('indicators')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      // Reintento con payload mínimo seguro si la tabla aún no cuenta con las nuevas columnas
      if (error.message?.includes('column') || error.code === '42703') {
        const fallbackPayload = toMinimalDbIndicator(indicator);
        const { data: retryData, error: retryError } = await supabase
          .from('indicators')
          .upsert(fallbackPayload, { onConflict: 'id' })
          .select()
          .single();
        if (retryError) {
          console.warn('Fallback indicator upsert error:', retryError.message);
          return indicator;
        }
        return fromDbIndicator(retryData);
      }
      console.warn('Error upserting indicator in Supabase:', error.message);
      return indicator;
    }
    return fromDbIndicator(data);
  } catch (err: any) {
    console.warn('Indicator upsert skipped safely:', err?.message);
    return indicator;
  }
}

export async function deleteIndicatorFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('indicators').delete().eq('id', id);
    if (error) console.warn('Error deleting indicator from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Indicator delete skipped safely:', err?.message);
  }
}

export async function upsertContactInSupabase(contact: Contact): Promise<Contact> {
  if (!isSupabaseConfigured()) return contact;
  try {
    const payload = toDbContact(contact);
    const { data, error } = await supabase
      .from('contacts')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting contact in Supabase:', error.message);
      return contact;
    }
    return fromDbContact(data);
  } catch (err: any) {
    console.warn('Contact upsert skipped safely:', err?.message);
    return contact;
  }
}

export async function deleteContactFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) console.warn('Error deleting contact from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Contact delete skipped safely:', err?.message);
  }
}

export async function upsertQuestionInSupabase(question: Question): Promise<Question> {
  if (!isSupabaseConfigured()) return question;
  try {
    const payload = toDbQuestion(question);
    const { data, error } = await supabase
      .from('questions')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting question in Supabase:', error.message);
      return question;
    }
    return fromDbQuestion(data);
  } catch (err: any) {
    console.warn('Question upsert skipped safely:', err?.message);
    return question;
  }
}

export async function deleteQuestionFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) console.warn('Error deleting question from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Question delete skipped safely:', err?.message);
  }
}

export async function upsertAlertInSupabase(alert: Alert): Promise<Alert> {
  if (!isSupabaseConfigured()) return alert;
  try {
    const payload = toDbAlert(alert);
    const { data, error } = await supabase
      .from('alerts')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting alert in Supabase:', error.message);
      return alert;
    }
    return fromDbAlert(data);
  } catch (err: any) {
    console.warn('Alert upsert skipped safely:', err?.message);
    return alert;
  }
}

export async function deleteAlertFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('alerts').delete().eq('id', id);
    if (error) console.warn('Error deleting alert from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Alert delete skipped safely:', err?.message);
  }
}

export async function upsertProgramInSupabase(program: HealthProgram): Promise<HealthProgram> {
  if (!isSupabaseConfigured()) return program;
  try {
    const payload = toDbProgram(program);
    const { data, error } = await supabase
      .from('health_programs')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting program in Supabase:', error.message);
      return program;
    }
    return fromDbProgram(data);
  } catch (err: any) {
    console.warn('Program upsert skipped safely:', err?.message);
    return program;
  }
}

export async function deleteProgramFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('health_programs').delete().eq('id', id);
    if (error) console.warn('Error deleting program from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Program delete skipped safely:', err?.message);
  }
}

export async function upsertEstablishmentInSupabase(establishment: Establishment): Promise<Establishment> {
  if (!isSupabaseConfigured()) return establishment;
  try {
    const payload = toDbEstablishment(establishment);
    const { data, error } = await supabase
      .from('establishments')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting establishment in Supabase:', error.message);
      return establishment;
    }
    return fromDbEstablishment(data);
  } catch (err: any) {
    console.warn('Establishment upsert skipped safely:', err?.message);
    return establishment;
  }
}

export async function deleteEstablishmentFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('establishments').delete().eq('id', id);
    if (error) console.warn('Error deleting establishment from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Establishment delete skipped safely:', err?.message);
  }
}

export async function upsertFinancialPeriodInSupabase(period: FinancialPeriod): Promise<FinancialPeriod> {
  if (!isSupabaseConfigured()) return period;
  try {
    const payload = toDbFinancialPeriod(period);
    const { data, error } = await supabase
      .from('financial_periods')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting financial period in Supabase:', error.message);
      return period;
    }
    return fromDbFinancialPeriod(data);
  } catch (err: any) {
    console.warn('Financial period upsert skipped safely:', err?.message);
    return period;
  }
}

export async function deleteFinancialPeriodFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('financial_periods').delete().eq('id', id);
    if (error) console.warn('Error deleting financial period from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Financial period delete skipped safely:', err?.message);
  }
}

export async function upsertBudgetComponentInSupabase(component: BudgetComponent): Promise<BudgetComponent> {
  if (!isSupabaseConfigured()) return component;
  try {
    const payload = toDbBudgetComponent(component);
    const { data, error } = await supabase
      .from('budget_components')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting budget component in Supabase:', error.message);
      return component;
    }
    return fromDbBudgetComponent(data);
  } catch (err: any) {
    console.warn('Budget component upsert skipped safely:', err?.message);
    return component;
  }
}

export async function deleteBudgetComponentFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('budget_components').delete().eq('id', id);
    if (error) console.warn('Error deleting budget component from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Budget component delete skipped safely:', err?.message);
  }
}

// 13. CRUD Emails (Correos)
export async function upsertEmailInSupabase(email: PendingEmail): Promise<PendingEmail> {
  if (!isSupabaseConfigured()) return email;
  try {
    const payload = toDbEmail(email);
    const { data, error } = await supabase
      .from('emails')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting email in Supabase:', error.message);
      return email;
    }
    return fromDbEmail(data);
  } catch (err: any) {
    console.warn('Email upsert skipped safely:', err?.message);
    return email;
  }
}

export async function deleteEmailFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('emails').delete().eq('id', id);
    if (error) console.warn('Error deleting email from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Email delete skipped safely:', err?.message);
  }
}

// 14. CRUD Documents (Documentos)
export async function upsertDocumentInSupabase(document: DocumentRecord): Promise<DocumentRecord> {
  if (!isSupabaseConfigured()) return document;
  try {
    const payload = toDbDocument(document);
    const { data, error } = await supabase
      .from('documents')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting document in Supabase:', error.message);
      return document;
    }
    return fromDbDocument(data);
  } catch (err: any) {
    console.warn('Document upsert skipped safely:', err?.message);
    return document;
  }
}

export async function deleteDocumentFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) console.warn('Error deleting document from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Document delete skipped safely:', err?.message);
  }
}

// 15. CRUD HR Records (RRHH)
export async function upsertHRRecordInSupabase(hrRecord: HRRecord): Promise<HRRecord> {
  if (!isSupabaseConfigured()) return hrRecord;
  try {
    const payload = toDbHRRecord(hrRecord);
    const { data, error } = await supabase
      .from('hr_records')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting hr_record in Supabase:', error.message);
      return hrRecord;
    }
    return fromDbHRRecord(data);
  } catch (err: any) {
    console.warn('HRRecord upsert skipped safely:', err?.message);
    return hrRecord;
  }
}

export async function deleteHRRecordFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('hr_records').delete().eq('id', id);
    if (error) console.warn('Error deleting hr_record from Supabase:', error.message);
  } catch (err: any) {
    console.warn('HRRecord delete skipped safely:', err?.message);
  }
}

// 16. CRUD Knowledge (Base de Conocimiento)
export async function upsertKnowledgeInSupabase(item: KnowledgeItem): Promise<KnowledgeItem> {
  if (!isSupabaseConfigured()) return item;
  try {
    const payload = toDbKnowledge(item);
    const { data, error } = await supabase
      .from('knowledge')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting knowledge in Supabase:', error.message);
      return item;
    }
    return fromDbKnowledge(data);
  } catch (err: any) {
    console.warn('Knowledge upsert skipped safely:', err?.message);
    return item;
  }
}

export async function deleteKnowledgeFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('knowledge').delete().eq('id', id);
    if (error) console.warn('Error deleting knowledge from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Knowledge delete skipped safely:', err?.message);
  }
}

// 17. CRUD Budget 2025 Notes (Notas Presupuesto)
export async function upsertBudget2025NoteInSupabase(note: ProgramBudget2025Note): Promise<ProgramBudget2025Note> {
  if (!isSupabaseConfigured()) return note;
  try {
    const payload = toDbBudget2025Note(note);
    const { data, error } = await supabase
      .from('budget_2025_notes')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.warn('Error upserting budget_2025_note in Supabase:', error.message);
      return note;
    }
    return fromDbBudget2025Note(data);
  } catch (err: any) {
    console.warn('Budget2025Note upsert skipped safely:', err?.message);
    return note;
  }
}

export async function deleteBudget2025NoteFromSupabase(id: string): Promise<void> {
  if (!isSupabaseConfigured() || !id) return;
  try {
    const { error } = await supabase.from('budget_2025_notes').delete().eq('id', id);
    if (error) console.warn('Error deleting budget_2025_note from Supabase:', error.message);
  } catch (err: any) {
    console.warn('Budget2025Note delete skipped safely:', err?.message);
  }
}

/* ==========================================================================
   HEALTH & DIAGNOSTICS
   ========================================================================== */

export interface SupabaseDbStatus {
  connected: boolean;
  projectId: string;
  url: string;
  latencyMs: number;
  tables: Record<string, { count: number; ok: boolean; error?: string }>;
  totalRows: number;
  error?: string;
  checkedAt: string;
}

export async function checkSupabaseDatabaseStatus(): Promise<SupabaseDbStatus> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      projectId: '',
      url: '',
      latencyMs: 0,
      tables: {},
      totalRows: 0,
      error: 'Variables de entorno no configuradas en este entorno. Configúralas en Vercel para sincronización en la nube.',
      checkedAt: new Date().toISOString(),
    };
  }

  const startTime = Date.now();
  const tables = [
    'health_programs',
    'tasks',
    'purchases',
    'meetings',
    'indicators',
    'contacts',
    'questions',
    'alerts',
    'users',
    'establishments',
    'financial_periods',
    'budget_components',
    'budget_2025_notes',
    'emails',
    'documents',
    'hr_records',
    'knowledge',
  ];

  const tableResults: Record<string, { count: number; ok: boolean; error?: string }> = {};
  let totalRows = 0;
  let hasAnySuccess = false;
  let lastError: string | undefined;

  await Promise.all(
    tables.map(async (tableName) => {
      try {
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true });

        if (error) {
          tableResults[tableName] = { count: 0, ok: false, error: error.message };
          lastError = error.message;
        } else {
          const c = count || 0;
          tableResults[tableName] = { count: c, ok: true };
          totalRows += c;
          hasAnySuccess = true;
        }
      } catch (err: any) {
        tableResults[tableName] = { count: 0, ok: false, error: err?.message || 'Error' };
        lastError = err?.message;
      }
    })
  );

  const latencyMs = Date.now() - startTime;

  return {
    connected: hasAnySuccess,
    projectId: SUPABASE_PROJECT_ID,
    url: OFFICIAL_SUPABASE_URL,
    latencyMs,
    tables: tableResults,
    totalRows,
    error: hasAnySuccess ? undefined : lastError || 'No se pudo conectar a las tablas de Supabase',
    checkedAt: new Date().toISOString(),
  };
}

/* ==========================================================================
   PULL ALL DATA FROM SUPABASE
   ========================================================================== */

export async function pullAllFromSupabase(): Promise<{
  programs: HealthProgram[];
  tasks: Task[];
  purchases: Purchase[];
  meetings: Meeting[];
  indicators: Indicator[];
  contacts: Contact[];
  questions: Question[];
  alerts: Alert[];
  users: User[];
  establishments: Establishment[];
  financialPeriods: FinancialPeriod[];
  budgetComponents: BudgetComponent[];
  emails: PendingEmail[];
  documents: DocumentRecord[];
  hrRecords: HRRecord[];
  knowledge: KnowledgeItem[];
  budget2025Notes: Record<string, ProgramBudget2025Note>;
}> {
  if (!isSupabaseConfigured()) {
    return {
      programs: [],
      tasks: [],
      purchases: [],
      meetings: [],
      indicators: [],
      contacts: [],
      questions: [],
      alerts: [],
      users: [],
      establishments: [],
      financialPeriods: [],
      budgetComponents: [],
      emails: [],
      documents: [],
      hrRecords: [],
      knowledge: [],
      budget2025Notes: {},
    };
  }

  const [
    programs,
    tasks,
    purchases,
    meetings,
    indicators,
    contacts,
    questions,
    alerts,
    users,
    establishments,
    financialPeriods,
    budgetComponents,
    emails,
    documents,
    hrRecords,
    knowledge,
    budget2025Notes,
  ] = await Promise.all([
    fetchHealthProgramsFromSupabase().catch(() => []),
    fetchTasksFromSupabase().catch(() => []),
    fetchPurchasesFromSupabase().catch(() => []),
    fetchMeetingsFromSupabase().catch(() => []),
    fetchIndicatorsFromSupabase().catch(() => []),
    fetchContactsFromSupabase().catch(() => []),
    fetchQuestionsFromSupabase().catch(() => []),
    fetchAlertsFromSupabase().catch(() => []),
    fetchUsersFromSupabase().catch(() => []),
    fetchEstablishmentsFromSupabase().catch(() => []),
    fetchFinancialPeriodsFromSupabase().catch(() => []),
    fetchBudgetComponentsFromSupabase().catch(() => []),
    fetchEmailsFromSupabase().catch(() => []),
    fetchDocumentsFromSupabase().catch(() => []),
    fetchHRRecordsFromSupabase().catch(() => []),
    fetchKnowledgeFromSupabase().catch(() => []),
    fetchBudget2025NotesFromSupabase().catch(() => ({})),
  ]);

  return {
    programs,
    tasks,
    purchases,
    meetings,
    indicators,
    contacts,
    questions,
    alerts,
    users,
    establishments,
    financialPeriods,
    budgetComponents,
    emails,
    documents,
    hrRecords,
    knowledge,
    budget2025Notes,
  };
}

/* ==========================================================================
   PUSH ALL DATA TO SUPABASE
   ========================================================================== */

export async function pushAllToSupabase(data: {
  tasks?: Task[];
  purchases?: Purchase[];
  meetings?: Meeting[];
  indicators?: Indicator[];
  contacts?: Contact[];
  questions?: Question[];
  alerts?: Alert[];
  programs?: HealthProgram[];
  establishments?: Establishment[];
  financialPeriods?: FinancialPeriod[];
  budgetComponents?: BudgetComponent[];
  emails?: PendingEmail[];
  documents?: DocumentRecord[];
  hrRecords?: HRRecord[];
  knowledge?: KnowledgeItem[];
  budget2025Notes?: Record<string, ProgramBudget2025Note>;
}): Promise<{ success: boolean; errors: string[]; insertedCount: number }> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      errors: ['Supabase no está configurado con credenciales en este entorno.'],
      insertedCount: 0,
    };
  }

  const errors: string[] = [];
  let insertedCount = 0;

  if (data.programs && data.programs.length > 0) {
    for (const p of data.programs) {
      try {
        await upsertProgramInSupabase(p);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir programa ${p.name}: ${err?.message}`);
      }
    }
  }

  if (data.tasks && data.tasks.length > 0) {
    for (const t of data.tasks) {
      try {
        await upsertTaskInSupabase(t);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir tarea ${t.title}: ${err?.message}`);
      }
    }
  }

  if (data.purchases && data.purchases.length > 0) {
    for (const p of data.purchases) {
      try {
        await upsertPurchaseInSupabase(p);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir compra ${p.description}: ${err?.message}`);
      }
    }
  }

  if (data.meetings && data.meetings.length > 0) {
    for (const m of data.meetings) {
      try {
        await upsertMeetingInSupabase(m);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir reunión ${m.title}: ${err?.message}`);
      }
    }
  }

  if (data.indicators && data.indicators.length > 0) {
    for (const i of data.indicators) {
      try {
        await upsertIndicatorInSupabase(i);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir indicador ${i.name}: ${err?.message}`);
      }
    }
  }

  if (data.contacts && data.contacts.length > 0) {
    for (const c of data.contacts) {
      try {
        await upsertContactInSupabase(c);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir contacto ${c.name}: ${err?.message}`);
      }
    }
  }

  if (data.questions && data.questions.length > 0) {
    for (const q of data.questions) {
      try {
        await upsertQuestionInSupabase(q);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir pregunta ${q.question}: ${err?.message}`);
      }
    }
  }

  if (data.establishments && data.establishments.length > 0) {
    for (const e of data.establishments) {
      try {
        await upsertEstablishmentInSupabase(e);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir establecimiento ${e.name}: ${err?.message}`);
      }
    }
  }

  if (data.financialPeriods && data.financialPeriods.length > 0) {
    for (const f of data.financialPeriods) {
      try {
        await upsertFinancialPeriodInSupabase(f);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir período financiero ${f.periodName || f.id}: ${err?.message}`);
      }
    }
  }

  if (data.budgetComponents && data.budgetComponents.length > 0) {
    for (const b of data.budgetComponents) {
      try {
        await upsertBudgetComponentInSupabase(b);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir componente presupuestario ${b.name}: ${err?.message}`);
      }
    }
  }

  if (data.emails && data.emails.length > 0) {
    for (const em of data.emails) {
      try {
        await upsertEmailInSupabase(em);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir correo ${em.subject}: ${err?.message}`);
      }
    }
  }

  if (data.documents && data.documents.length > 0) {
    for (const doc of data.documents) {
      try {
        await upsertDocumentInSupabase(doc);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir documento ${doc.title}: ${err?.message}`);
      }
    }
  }

  if (data.hrRecords && data.hrRecords.length > 0) {
    for (const hr of data.hrRecords) {
      try {
        await upsertHRRecordInSupabase(hr);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir registro RRHH ${hr.name}: ${err?.message}`);
      }
    }
  }

  if (data.knowledge && data.knowledge.length > 0) {
    for (const k of data.knowledge) {
      try {
        await upsertKnowledgeInSupabase(k);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir conocimiento ${k.title}: ${err?.message}`);
      }
    }
  }

  if (data.budget2025Notes && Object.keys(data.budget2025Notes).length > 0) {
    for (const note of Object.values(data.budget2025Notes)) {
      try {
        await upsertBudget2025NoteInSupabase(note);
        insertedCount++;
      } catch (err: any) {
        errors.push(`Error al subir nota presupuestaria ${note.id}: ${err?.message}`);
      }
    }
  }

  return {
    success: errors.length === 0,
    errors,
    insertedCount,
  };
}

/* ==========================================================================
   REAL-TIME SUBSCRIPTION TO SUPABASE DATABASE
   ========================================================================== */

export function subscribeToSupabaseDatabase(onEvent: (event: {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE' | string;
  newRecord: any;
  oldRecord: any;
}) => void): () => void {
  if (!isSupabaseConfigured()) {
    return () => {};
  }

  try {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload: any) => {
          onEvent({
            table: payload.table,
            eventType: payload.eventType,
            newRecord: payload.new,
            oldRecord: payload.old,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.error('Error establishing Supabase realtime channel:', err);
    return () => {};
  }
}
