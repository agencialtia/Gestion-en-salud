/**
 * Supabase Database Service for Quilicura Salud
 * Project ID: lpcwfyvlbytpgydpmirx
 * Connected to live PostgreSQL database on Supabase
 */

import { supabase, SUPABASE_PROJECT_ID, OFFICIAL_SUPABASE_URL } from './supabase';
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
} from '../types';

export { SUPABASE_PROJECT_ID, OFFICIAL_SUPABASE_URL };

// UUID validator and generator for PostgreSQL uuid primary keys
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

export function ensureUUID(id?: string): string {
  if (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return id.toLowerCase();
  }
  return generateUUID();
}

/* ==========================================================================
   MAPPERS: FRONTEND (camelCase) <---> SUPABASE DATABASE (snake_case)
   ========================================================================== */

// 1. Health Programs
export function fromDbProgram(row: any): HealthProgram {
  const budget = Number(row.presupuesto_total) || Number(row.annual_budget) || 0;
  return {
    id: row.id,
    code: row.code || '',
    name: row.name || '',
    shortName: row.short_name || row.name || '',
    description: row.description || '',
    referente: row.referente || '',
    email: row.email || undefined,
    telefono: row.telefono || undefined,
    presupuestoTotal: budget,
    presupuestoEjecutado: Number(row.presupuesto_ejecutado) || 0,
    presupuestoComprometido: Number(row.presupuesto_comprometido) || 0,
    annualBudget: budget,
    color: row.color || '#0284c7',
    iconName: row.icon_name || 'Activity',
    targetPopulation: typeof row.target_population === 'string' ? row.target_population : (row.target_population ? String(row.target_population) : ''),
    coverage: Number(row.coverage) || 0,
    status: row.status || 'activo',
    year: Number(row.year) || 2026,
  };
}

export function toDbProgram(p: HealthProgram): any {
  return {
    id: p.id,
    code: p.code || '',
    name: p.name || '',
    short_name: p.shortName || p.name || '',
    description: p.description || '',
    referente: p.referente || '',
    email: p.email || null,
    telefono: p.telefono || null,
    presupuesto_total: p.presupuestoTotal || p.annualBudget || 0,
    presupuesto_ejecutado: p.presupuestoEjecutado || 0,
    presupuesto_comprometido: p.presupuestoComprometido || 0,
    color: p.color || '#0284c7',
    icon_name: p.iconName || 'Activity',
    target_population: p.targetPopulation || 0,
    coverage: p.coverage || 0,
    status: p.status || 'activo',
    year: p.year || 2026,
  };
}

// 2. Tasks
export function fromDbTask(row: any): Task {
  return {
    id: row.id,
    programId: row.program_id,
    title: row.title || '',
    description: row.description || '',
    assignedTo: row.assigned_to || '',
    assignedRole: row.assigned_role || '',
    establishmentId: row.establishment_id || undefined,
    startDate: row.start_date || undefined,
    dueDate: row.due_date || undefined,
    endDate: row.end_date || undefined,
    status: row.status || 'pendiente',
    priority: row.priority || 'media',
    progress: Number(row.progress) || 0,
    category: row.category || 'General',
    checklist: Array.isArray(row.checklist) ? row.checklist : [],
    budgetAssigned: Number(row.budget_assigned) || 0,
    milestone: Boolean(row.milestone),
    notes: row.notes || undefined,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
  };
}

export function toDbTask(t: Task): any {
  return {
    id: ensureUUID(t.id),
    program_id: t.programId || 'praps_cpu',
    title: t.title || 'Nueva Tarea',
    description: t.description || '',
    assigned_to: t.assignedTo || null,
    assigned_role: t.assignedRole || null,
    establishment_id: t.establishmentId || null,
    start_date: t.startDate || null,
    due_date: t.dueDate || null,
    end_date: t.endDate || null,
    status: t.status || 'pendiente',
    priority: t.priority || 'media',
    progress: t.progress !== undefined ? t.progress : 0,
    category: typeof t.category === 'string' ? t.category : t.category?.name || 'General',
    checklist: Array.isArray(t.checklist) ? t.checklist : [],
    budget_assigned: t.budgetAssigned || 0,
    milestone: Boolean(t.milestone),
    notes: t.notes || null,
    updated_at: new Date().toISOString(),
  };
}

// 3. Purchases
export function fromDbPurchase(row: any): Purchase {
  return {
    id: row.id,
    programId: row.program_id,
    establishmentId: row.establishment_id || undefined,
    code: row.code || '',
    description: row.description || '',
    justification: row.justification || '',
    estimatedAmount: Number(row.estimated_amount) || 0,
    actualAmount: row.actual_amount !== null ? Number(row.actual_amount) : undefined,
    supplier: row.supplier || '',
    status: row.status || 'solicitado',
    priority: row.priority || 'media',
    category: row.category || 'general',
    requestDate: row.request_date || undefined,
    ordenCompra: row.orden_compra || undefined,
    folioMercadoPublico: row.folio_mercado_publico || undefined,
    responsibleUser: row.responsible_user || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function toDbPurchase(p: Purchase): any {
  return {
    id: ensureUUID(p.id),
    program_id: p.programId || 'praps_cpu',
    establishment_id: p.establishmentId || null,
    code: p.code || 'PUR_001',
    description: p.description || '',
    justification: p.justification || '',
    estimated_amount: p.estimatedAmount || 0,
    actual_amount: p.actualAmount !== undefined ? p.actualAmount : null,
    supplier: p.supplier || '',
    status: p.status || 'solicitado',
    priority: p.priority || 'media',
    category: p.category || 'general',
    request_date: p.requestDate || null,
    orden_compra: p.ordenCompra || null,
    folio_mercado_publico: p.folioMercadoPublico || null,
    responsible_user: p.responsibleUser || null,
  };
}

// 4. Meetings
export function fromDbMeeting(row: any): Meeting {
  return {
    id: row.id,
    programId: row.program_id,
    title: row.title || '',
    date: row.date || '',
    time: row.time || '',
    location: row.location || '',
    status: row.status || 'programada',
    summary: row.summary || '',
    participants: Array.isArray(row.participants) ? row.participants : [],
    agreements: Array.isArray(row.agreements) ? row.agreements : [],
    commitments: Array.isArray(row.commitments) ? row.commitments : [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function toDbMeeting(m: Meeting): any {
  return {
    id: ensureUUID(m.id),
    program_id: m.programId || 'praps_cpu',
    title: m.title || '',
    date: m.date || new Date().toISOString().split('T')[0],
    time: m.time || '10:00',
    location: m.location || '',
    status: m.status || 'programada',
    summary: m.summary || '',
    participants: Array.isArray(m.participants) ? m.participants : [],
    agreements: Array.isArray(m.agreements) ? m.agreements : [],
    commitments: Array.isArray(m.commitments) ? m.commitments : [],
  };
}

// 5. Indicators
export function fromDbIndicator(row: any): Indicator {
  return {
    id: row.id,
    programId: row.program_id,
    code: row.code || '',
    name: row.name || '',
    description: row.description || '',
    targetValue: Number(row.target_value) || 100,
    currentValue: Number(row.current_value) || 0,
    unit: row.unit || '%',
    periodicity: row.periodicity || 'mensual',
    weight: Number(row.weight) || 1,
    goodThreshold: Number(row.good_threshold) || 85,
    warningThreshold: Number(row.warning_threshold) || 70,
    measurements: Array.isArray(row.measurements) ? row.measurements : [],
    cuts: Array.isArray(row.cuts) ? row.cuts : [],
    lastUpdated: row.last_updated || row.created_at || new Date().toISOString(),
  };
}

export function toDbIndicator(i: Indicator): any {
  return {
    id: ensureUUID(i.id),
    program_id: i.programId || 'praps_cpu',
    code: i.code || '',
    name: i.name || '',
    description: i.description || '',
    target_value: i.targetValue || 100,
    current_value: i.currentValue || 0,
    unit: i.unit || '%',
    periodicity: i.periodicity || 'mensual',
    weight: i.weight || 1,
    good_threshold: i.goodThreshold || 85,
    warning_threshold: i.warningThreshold || 70,
    measurements: Array.isArray(i.measurements) ? i.measurements : [],
    cuts: Array.isArray(i.cuts) ? i.cuts : [],
    last_updated: new Date().toISOString(),
  };
}

// 6. Contacts
export function fromDbContact(row: any): Contact {
  const pIds = Array.isArray(row.program_ids)
    ? row.program_ids
    : (Array.isArray(row.programIds)
      ? row.programIds
      : (row.program_id ? [row.program_id] : (row.programId ? [row.programId] : [])));

  return {
    id: row.id,
    programId: row.program_id || (pIds.length > 0 ? pIds[0] : undefined),
    programIds: pIds,
    name: row.name || '',
    lastName: row.last_name || '',
    role: row.role || '',
    institution: row.institution || '',
    email: row.email || '',
    phone: row.phone || '',
    contactType: row.contact_type || 'referente_comunal',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function toDbContact(c: Contact): any {
  const pId = c.programId || (c.programIds && c.programIds.length > 0 ? c.programIds[0] : 'praps_cpu');
  return {
    id: ensureUUID(c.id),
    program_id: pId,
    name: c.name || '',
    last_name: c.lastName || '',
    role: c.role || '',
    institution: c.institution || '',
    email: c.email || '',
    phone: c.phone || '',
    contact_type: c.contactType || 'referente_comunal',
  };
}

// 7. Questions
export function fromDbQuestion(row: any): Question {
  return {
    id: row.id,
    programId: row.program_id,
    askedBy: row.asked_by || '',
    category: row.category || 'orientacion_tecnica',
    question: row.question || '',
    answer: row.answer || '',
    status: row.status || 'pendiente',
    priority: row.priority || 'media',
    date: row.date || new Date().toISOString().split('T')[0],
    dueDate: row.due_date || undefined,
    answeredBy: row.answered_by || undefined,
    answeredDate: row.answered_date || undefined,
    followUps: Array.isArray(row.follow_ups) ? row.follow_ups : [],
    createdAt: row.created_at || new Date().toISOString(),
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
  };
}

// 8. Alerts
export function fromDbAlert(row: any): Alert {
  return {
    id: row.id,
    programId: row.program_id,
    type: row.type || 'sistema',
    severity: row.severity || 'media',
    title: row.title || '',
    message: row.message || '',
    createdAt: row.created_at || new Date().toISOString(),
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
  };
}

// 9. Users
export function fromDbUser(row: any): User {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email || '',
    role: row.role || 'referente',
    title: row.title || 'Referente Comunal',
    comuna: row.comuna || 'Quilicura (DISAM)',
    establishment: row.establishment || 'Dirección de Salud / Comunal',
    healthService: row.health_service || 'SSMN (Metropolitano Norte)',
    avatar: row.avatar || (row.name ? row.name.charAt(0).toUpperCase() : 'U'),
    photoUrl: row.photo_url || undefined,
    phone: row.phone || undefined,
  };
}

/* ==========================================================================
   DATABASE READ OPERATIONS
   ========================================================================== */

export async function fetchHealthProgramsFromSupabase(): Promise<HealthProgram[]> {
  const { data, error } = await supabase
    .from('health_programs')
    .select('*')
    .order('name', { ascending: true });
  if (error) {
    console.error('Error fetching health_programs from Supabase:', error);
    throw error;
  }
  return (data || []).map(fromDbProgram);
}

export async function fetchTasksFromSupabase(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching tasks from Supabase:', error);
    throw error;
  }
  return (data || []).map(fromDbTask);
}

export async function fetchPurchasesFromSupabase(): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching purchases from Supabase:', error);
    throw error;
  }
  return (data || []).map(fromDbPurchase);
}

export async function fetchMeetingsFromSupabase(): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('date', { ascending: false });
  if (error) {
    console.error('Error fetching meetings from Supabase:', error);
    throw error;
  }
  return (data || []).map(fromDbMeeting);
}

export async function fetchIndicatorsFromSupabase(): Promise<Indicator[]> {
  const { data, error } = await supabase
    .from('indicators')
    .select('*')
    .order('code', { ascending: true });
  if (error) {
    console.error('Error fetching indicators from Supabase:', error);
    throw error;
  }
  return (data || []).map(fromDbIndicator);
}

export async function fetchContactsFromSupabase(): Promise<Contact[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('name', { ascending: true });
  if (error) {
    console.error('Error fetching contacts from Supabase:', error);
    throw error;
  }
  return (data || []).map(fromDbContact);
}

export async function fetchQuestionsFromSupabase(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching questions from Supabase:', error);
    throw error;
  }
  return (data || []).map(fromDbQuestion);
}

export async function fetchAlertsFromSupabase(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching alerts from Supabase:', error);
    return [];
  }
  return (data || []).map(fromDbAlert);
}

export async function fetchUsersFromSupabase(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true });
  if (error) {
    console.error('Error fetching users from Supabase:', error);
    return [];
  }
  return (data || []).map(fromDbUser);
}

/* ==========================================================================
   DATABASE WRITE / MUTATION OPERATIONS
   ========================================================================== */

export async function upsertTaskInSupabase(task: Task): Promise<Task> {
  const payload = toDbTask(task);
  const { data, error } = await supabase
    .from('tasks')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting task in Supabase:', error);
    throw error;
  }
  return fromDbTask(data);
}

export async function deleteTaskFromSupabase(id: string): Promise<void> {
  // If id is not uuid, don't execute query to avoid 22P02 Postgres error
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return;
  }
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) {
    console.error('Error deleting task from Supabase:', error);
  }
}

export async function upsertPurchaseInSupabase(purchase: Purchase): Promise<Purchase> {
  const payload = toDbPurchase(purchase);
  const { data, error } = await supabase
    .from('purchases')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting purchase in Supabase:', error);
    throw error;
  }
  return fromDbPurchase(data);
}

export async function deletePurchaseFromSupabase(id: string): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return;
  }
  const { error } = await supabase.from('purchases').delete().eq('id', id);
  if (error) {
    console.error('Error deleting purchase from Supabase:', error);
  }
}

export async function upsertMeetingInSupabase(meeting: Meeting): Promise<Meeting> {
  const payload = toDbMeeting(meeting);
  const { data, error } = await supabase
    .from('meetings')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting meeting in Supabase:', error);
    throw error;
  }
  return fromDbMeeting(data);
}

export async function deleteMeetingFromSupabase(id: string): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return;
  }
  const { error } = await supabase.from('meetings').delete().eq('id', id);
  if (error) {
    console.error('Error deleting meeting from Supabase:', error);
  }
}

export async function upsertIndicatorInSupabase(indicator: Indicator): Promise<Indicator> {
  const payload = toDbIndicator(indicator);
  const { data, error } = await supabase
    .from('indicators')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting indicator in Supabase:', error);
    throw error;
  }
  return fromDbIndicator(data);
}

export async function deleteIndicatorFromSupabase(id: string): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return;
  }
  const { error } = await supabase.from('indicators').delete().eq('id', id);
  if (error) {
    console.error('Error deleting indicator from Supabase:', error);
  }
}

export async function upsertContactInSupabase(contact: Contact): Promise<Contact> {
  const payload = toDbContact(contact);
  const { data, error } = await supabase
    .from('contacts')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting contact in Supabase:', error);
    throw error;
  }
  return fromDbContact(data);
}

export async function deleteContactFromSupabase(id: string): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return;
  }
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) {
    console.error('Error deleting contact from Supabase:', error);
  }
}

export async function upsertQuestionInSupabase(question: Question): Promise<Question> {
  const payload = toDbQuestion(question);
  const { data, error } = await supabase
    .from('questions')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting question in Supabase:', error);
    throw error;
  }
  return fromDbQuestion(data);
}

export async function deleteQuestionFromSupabase(id: string): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return;
  }
  const { error } = await supabase.from('questions').delete().eq('id', id);
  if (error) {
    console.error('Error deleting question from Supabase:', error);
  }
}

export async function upsertAlertInSupabase(alert: Alert): Promise<Alert> {
  const payload = toDbAlert(alert);
  const { data, error } = await supabase
    .from('alerts')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting alert in Supabase:', error);
    throw error;
  }
  return fromDbAlert(data);
}

export async function deleteAlertFromSupabase(id: string): Promise<void> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return;
  }
  const { error } = await supabase.from('alerts').delete().eq('id', id);
  if (error) {
    console.error('Error deleting alert from Supabase:', error);
  }
}

export async function upsertProgramInSupabase(program: HealthProgram): Promise<HealthProgram> {
  const payload = toDbProgram(program);
  const { data, error } = await supabase
    .from('health_programs')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting program in Supabase:', error);
    throw error;
  }
  return fromDbProgram(data);
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
}> {
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
}): Promise<{ success: boolean; errors: string[]; insertedCount: number }> {
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
