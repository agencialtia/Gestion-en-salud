import { supabase, isSupabaseConfigured } from './supabase';
import {
  HealthProgram,
  Task,
  Indicator,
  Purchase,
  Meeting,
  Question,
  Contact,
  Alert,
  User,
} from '../types';

export const fetchHealthProgramsFromSupabase = async (): Promise<HealthProgram[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('health_programs').select('*');
    if (error || !data) return null;
    return data.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      shortName: row.short_name,
      description: row.description,
      referente: row.referente,
      email: row.email,
      telefono: row.telefono,
      presupuestoTotal: row.presupuesto_total,
      presupuestoEjecutado: row.presupuesto_ejecutado,
      presupuestoComprometido: row.presupuesto_comprometido,
      color: row.color,
      iconName: row.icon_name,
      targetPopulation: row.target_population,
      coverage: row.coverage,
      status: row.status,
      year: row.year,
    }));
  } catch (e) {
    console.error('Error fetching health programs from Supabase:', e);
    return null;
  }
};

export const fetchTasksFromSupabase = async (): Promise<Task[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error || !data) return null;
    return data.map((row) => ({
      id: row.id,
      programId: row.program_id,
      title: row.title,
      description: row.description,
      assignedTo: row.assigned_to,
      assignedRole: row.assigned_role,
      establishmentId: row.establishment_id,
      startDate: row.start_date,
      dueDate: row.due_date,
      endDate: row.end_date,
      status: row.status,
      priority: row.priority,
      progress: row.progress,
      category: row.category,
      checklist: row.checklist || [],
      budgetAssigned: row.budget_assigned,
      milestone: row.milestone,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (e) {
    console.error('Error fetching tasks from Supabase:', e);
    return null;
  }
};

export const fetchIndicatorsFromSupabase = async (): Promise<Indicator[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('indicators').select('*');
    if (error || !data) return null;
    return data.map((row) => ({
      id: row.id,
      programId: row.program_id,
      code: row.code,
      name: row.name,
      description: row.description,
      targetValue: row.target_value,
      currentValue: row.current_value,
      unit: row.unit,
      periodicity: row.periodicity,
      weight: row.weight,
      goodThreshold: row.good_threshold,
      warningThreshold: row.warning_threshold,
      measurements: row.measurements || [],
      cuts: row.cuts || [],
      lastUpdated: row.last_updated,
    }));
  } catch (e) {
    console.error('Error fetching indicators from Supabase:', e);
    return null;
  }
};

export const fetchPurchasesFromSupabase = async (): Promise<Purchase[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('purchases').select('*');
    if (error || !data) return null;
    return data.map((row) => ({
      id: row.id,
      programId: row.program_id,
      establishmentId: row.establishment_id,
      code: row.code,
      description: row.description,
      justification: row.justification,
      estimatedAmount: row.estimated_amount,
      actualAmount: row.actual_amount,
      supplier: row.supplier,
      status: row.status,
      priority: row.priority,
      category: row.category,
      requestDate: row.request_date,
      ordenCompra: row.orden_compra,
      folioMercadoPublico: row.folio_mercado_publico,
      responsibleUser: row.responsible_user,
    }));
  } catch (e) {
    console.error('Error fetching purchases from Supabase:', e);
    return null;
  }
};

export const fetchUsersFromSupabase = async (): Promise<User[] | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data) return null;
    return data.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      title: row.title,
      comuna: row.comuna,
      establishment: row.establishment,
      healthService: row.health_service,
      avatar: row.avatar,
      photoUrl: row.photo_url,
      phone: row.phone,
      authProvider: row.auth_provider,
      emailVerified: row.email_verified,
    }));
  } catch (e) {
    console.error('Error fetching users from Supabase:', e);
    return null;
  }
};
