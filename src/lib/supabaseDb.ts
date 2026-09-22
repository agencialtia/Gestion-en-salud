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
    phonePrefix: row.phone_prefix || 'CL +56',
    instagram: row.instagram || undefined,
    country: row.country || 'Chile',
    budgetYear: row.budget_year || '2026',
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
    health_service: u.healthService || 'SSMN (Metropolitano Norte)',
    avatar: u.avatar || (u.name ? u.name.charAt(0).toUpperCase() : 'U'),
    photo_url: u.photoUrl || null,
    phone: u.phone || null,
    phone_prefix: u.phonePrefix || 'CL +56',
    instagram: u.instagram || null,
    country: u.country || 'Chile',
    budget_year: Number(u.budgetYear) || 2026,
    updated_at: new Date().toISOString(),
  };
}

export async function fetchUserByIdOrEmailFromSupabase(id?: string, email?: string): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    if (id) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) {
        return fromDbUser(data);
      }
    }
    if (email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();
      if (!error && data) {
        return fromDbUser(data);
      }
    }
    return null;
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

    const resolvedId = authUid || user.id || 'user_' + Date.now();
    const resolvedEmail = (user.email || authEmail || '').toLowerCase().trim();

    // Check if the record already exists in Supabase users to merge without losing existing fields
    let existingDbUser: any = null;
    try {
      if (resolvedId) {
        const { data: foundById } = await supabase
          .from('users')
          .select('*')
          .eq('id', resolvedId)
          .maybeSingle();
        if (foundById) existingDbUser = foundById;
      }
      if (!existingDbUser && resolvedEmail) {
        const { data: foundByEmail } = await supabase
          .from('users')
          .select('*')
          .eq('email', resolvedEmail)
          .maybeSingle();
        if (foundByEmail) existingDbUser = foundByEmail;
      }
    } catch {
      // ignore
    }

    const payload: any = {
      id: resolvedId,
      name: user.name !== undefined ? user.name : (existingDbUser?.name || ''),
      email: resolvedEmail,
      role: user.role !== undefined ? user.role : (existingDbUser?.role || 'referente'),
      title: user.title !== undefined ? user.title : (existingDbUser?.title || 'Referente de Programas de Salud'),
      comuna: user.comuna !== undefined ? user.comuna : (existingDbUser?.comuna || 'Quilicura (DISAM)'),
      establishment: user.establishment !== undefined ? user.establishment : (existingDbUser?.establishment || 'Dirección de Salud / Comunal'),
      health_service: user.healthService !== undefined ? user.healthService : (existingDbUser?.health_service || 'SSMN (Metropolitano Norte)'),
      avatar: user.avatar !== undefined ? user.avatar : (existingDbUser?.avatar || (user.name ? user.name.charAt(0).toUpperCase() : 'U')),
      photo_url: user.photoUrl !== undefined ? user.photoUrl : (existingDbUser?.photo_url || null),
      phone: user.phone !== undefined ? user.phone : (existingDbUser?.phone || null),
      phone_prefix: user.phonePrefix !== undefined ? user.phonePrefix : (existingDbUser?.phone_prefix || 'CL +56'),
      instagram: user.instagram !== undefined ? user.instagram : (existingDbUser?.instagram || null),
      country: user.country !== undefined ? user.country : (existingDbUser?.country || 'Chile'),
      budget_year: user.budgetYear ? Number(user.budgetYear) : (existingDbUser?.budget_year || 2026),
      updated_at: new Date().toISOString(),
    };

    let { error } = await supabase
      .from('users')
      .upsert(payload, { onConflict: 'id' });

    // Si hay correo resuelto, asegurar que se actualice la fila con ese correo
    if (resolvedEmail) {
      const byEmail = await supabase
        .from('users')
        .update(payload)
        .eq('email', resolvedEmail);
      
      if (!byEmail.error) {
        error = null;
      }
    }

    // Sincronizar también la metadata del usuario en Supabase Auth
    try {
      const authUpdates: any = {
        data: {
          full_name: payload.name,
          name: payload.name,
          role: payload.role,
          title: payload.title,
          phone: payload.phone,
          phone_prefix: payload.phone_prefix,
          comuna: payload.comuna,
          establishment: payload.establishment,
          health_service: payload.health_service,
          instagram: payload.instagram,
          country: payload.country,
          budget_year: payload.budget_year,
          photo_url: payload.photo_url,
          avatar: payload.avatar,
        },
      };

      if (authEmail && resolvedEmail && authEmail.toLowerCase() !== resolvedEmail.toLowerCase()) {
        authUpdates.email = resolvedEmail;
      }

      await supabase.auth.updateUser(authUpdates);
    } catch {
      // Ignorar si no hay sesión activa
    }

    if (error) {
      console.warn('Advertencia al guardar usuario en Supabase:', error.message);
      return { success: false, error: error.message };
    }

    console.log('Usuario guardado exitosamente en Supabase (users & auth):', payload.email || payload.name);
    return { success: true };
  } catch (err: any) {
    console.warn('upsertUserInSupabase exception:', err?.message);
    return { success: false, error: err?.message };
  }
}

// 10. Establishments
export function fromDbEstablishment(row: any): Establishment {
  return {
    id: row.id,
    name: row.name || '',
    code: row.code || '',
    type: row.type || 'CESFAM',
    address: row.address || '',
    director: row.director || '',
    phone: row.phone || '',
    email: row.email || '',
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
    updated_at: new Date().toISOString(),
  };
}

// 11. Financial Periods
export function fromDbFinancialPeriod(row: any): FinancialPeriod {
  return {
    id: row.id,
    programId: row.program_id,
    month: row.month || '',
    year: Number(row.year) || 2026,
    periodName: row.period_name || '',
    presupuestoAsignado: Number(row.presupuesto_asignado) || 0,
    presupuestoEjecutado: Number(row.presupuesto_ejecutado) || 0,
    presupuestoComprometido: Number(row.presupuesto_comprometido) || 0,
    saldoDisponible: Number(row.saldo_disponible) || 0,
    rendicionEnviada: Boolean(row.rendicion_enviada),
    rendicionAprobada: Boolean(row.rendicion_aprobada),
    fechaRendicion: row.fecha_rendicion || undefined,
    observacionesRendicion: row.observaciones_rendicion || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function toDbFinancialPeriod(f: FinancialPeriod): any {
  return {
    id: f.id,
    program_id: f.programId || null,
    month: f.month ? String(f.month) : '',
    year: Number(f.year) || 2026,
    period_name: f.periodName || '',
    presupuesto_asignado: Number(f.presupuestoAsignado) || 0,
    presupuesto_ejecutado: Number(f.presupuestoEjecutado) || 0,
    presupuesto_comprometido: Number(f.presupuestoComprometido) || 0,
    saldo_disponible: Number(f.saldoDisponible) || 0,
    rendicion_enviada: Boolean(f.rendicionEnviada),
    rendicion_aprobada: Boolean(f.rendicionAprobada),
    fecha_rendicion: f.fechaRendicion || null,
    observaciones_rendicion: f.observacionesRendicion || '',
    updated_at: new Date().toISOString(),
  };
}

// 12. Budget Components
export function fromDbBudgetComponent(row: any): BudgetComponent {
  return {
    id: row.id,
    programId: row.program_id,
    name: row.name || '',
    allocated: Number(row.allocated) || 0,
    executed: Number(row.executed) || 0,
    committed: Number(row.committed) || 0,
    category: row.category || 'General',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function toDbBudgetComponent(b: BudgetComponent): any {
  return {
    id: b.id,
    program_id: b.programId || null,
    name: b.name || '',
    allocated: Number(b.allocated) || 0,
    executed: Number(b.executed) || 0,
    committed: Number(b.committed) || 0,
    category: b.category || 'General',
    updated_at: new Date().toISOString(),
  };
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
      .order('code', { ascending: true });
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
      .order('created_at', { ascending: false });
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
      .order('name', { ascending: true });
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
      .order('year', { ascending: false });
    if (error) {
      console.warn('Supabase financial_periods not reachable:', error.message);
      return [];
    }
    return (data || []).map(fromDbFinancialPeriod);
  } catch (err: any) {
    console.warn('Fetch financial periods failed safely:', err?.message);
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
    console.warn('Fetch budget components failed safely:', err?.message);
    return [];
  }
}

/* ==========================================================================
   DATABASE WRITE / MUTATION OPERATIONS
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
    if (error) {
      console.warn('Error deleting task from Supabase:', error.message);
    }
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
    if (error) {
      console.warn('Error deleting purchase from Supabase:', error.message);
    }
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
    if (error) {
      console.warn('Error deleting meeting from Supabase:', error.message);
    }
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
    if (error) {
      console.warn('Error deleting indicator from Supabase:', error.message);
    }
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
    if (error) {
      console.warn('Error deleting contact from Supabase:', error.message);
    }
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
    if (error) {
      console.warn('Error deleting question from Supabase:', error.message);
    }
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
    if (error) {
      console.warn('Error deleting alert from Supabase:', error.message);
    }
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
    if (error) {
      console.warn('Error deleting program from Supabase:', error.message);
    }
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
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('establishments').delete().eq('id', id);
    if (error) {
      console.warn('Error deleting establishment from Supabase:', error.message);
    }
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
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('financial_periods').delete().eq('id', id);
    if (error) {
      console.warn('Error deleting financial period from Supabase:', error.message);
    }
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
  if (!isSupabaseConfigured()) return;
  try {
    const { error } = await supabase.from('budget_components').delete().eq('id', id);
    if (error) {
      console.warn('Error deleting budget component from Supabase:', error.message);
    }
  } catch (err: any) {
    console.warn('Budget component delete skipped safely:', err?.message);
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
