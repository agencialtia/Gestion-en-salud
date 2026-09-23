-- ==============================================================================
-- SISTEMA DE GESTIÓN QUILICURA SALUD (DISAM)
-- ESQUEMA COMPLETO Y ACTUALIZADO PARA SUPABASE (POSTGRESQL)
-- 
-- Compatible con:
-- 1. Resumen y Programas de Salud (health_programs)
-- 2. Tareas y Planificación (tasks)
-- 3. Compras y Adquisiciones (purchases)
-- 4. Reuniones, Acuerdos y Compromisos (meetings)
-- 5. Indicadores y Evaluaciones Sanitarias (indicators)
-- 6. Directorio de Contactos (contacts)
-- 7. Preguntas y Dudas Técnicas (questions)
-- 8. Alertas y Notificaciones (alerts)
-- 9. Establecimientos de la Red APS (establishments)
-- 10. Períodos Financieros y Presupuestos (financial_periods)
-- 11. Componentes Presupuestarios Subtítulo 21, 22, 29 (budget_components)
-- 12. Presupuestos Referenciales y Notas Históricas (budget_2025_notes)
-- 13. Correos y Requerimientos de Salud (emails)
-- 14. Biblioteca de Documentos y Convenios (documents)
-- 15. Recursos Humanos y Contrataciones (hr_records)
-- 16. Base de Conocimiento Institucional (knowledge)
-- 17. Usuarios y Perfiles (users)
-- ==============================================================================

-- 1. Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLAS PRINCIPALES (TODAS CON COLUMNA data JSONB PARA MÁXIMA FLEXIBILIDAD)
-- ==============================================================================

-- Tabla: users (Perfiles de usuario)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'referente',
  title TEXT DEFAULT 'Referente de Programas de Salud',
  comuna TEXT DEFAULT 'Quilicura (DISAM)',
  establishment TEXT DEFAULT 'Dirección de Salud / Comunal',
  health_service TEXT DEFAULT 'Servicio de Salud Metropolitano Norte',
  avatar TEXT,
  photo_url TEXT,
  phone TEXT,
  phone_prefix TEXT DEFAULT 'CL +56',
  instagram TEXT,
  country TEXT DEFAULT 'Chile',
  budget_year INTEGER DEFAULT 2026,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurar columnas si la tabla ya existía previamente
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_prefix TEXT DEFAULT 'CL +56';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Chile';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS budget_year INTEGER DEFAULT 2026;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

-- Tabla: health_programs (Programas de salud comunal)
CREATE TABLE IF NOT EXISTS public.health_programs (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  referente TEXT,
  email TEXT,
  telefono TEXT,
  presupuesto_total NUMERIC DEFAULT 0,
  presupuesto_ejecutado NUMERIC DEFAULT 0,
  presupuesto_comprometido NUMERIC DEFAULT 0,
  color TEXT DEFAULT '#0284c7',
  icon_name TEXT DEFAULT 'Activity',
  target_population TEXT DEFAULT '0',
  coverage NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'activo',
  year INTEGER DEFAULT 2026,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: establishments (Centros de salud, CESFAM, CECOSF, SAR, DISAM)
CREATE TABLE IF NOT EXISTS public.establishments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  code TEXT,
  type TEXT DEFAULT 'CESFAM',
  commune TEXT DEFAULT 'Quilicura',
  address TEXT,
  phone TEXT,
  director TEXT,
  active BOOLEAN DEFAULT true,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.establishments ADD COLUMN IF NOT EXISTS commune TEXT DEFAULT 'Quilicura';
ALTER TABLE public.establishments ADD COLUMN IF NOT EXISTS comuna TEXT DEFAULT 'Quilicura';
ALTER TABLE public.establishments ADD COLUMN IF NOT EXISTS short_name TEXT;
ALTER TABLE public.establishments ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT,
  assigned_role TEXT,
  establishment_id TEXT,
  start_date DATE,
  due_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'pendiente',
  priority TEXT DEFAULT 'media',
  progress NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'General',
  checklist JSONB DEFAULT '[]'::jsonb,
  budget_assigned NUMERIC DEFAULT 0,
  milestone BOOLEAN DEFAULT false,
  notes TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: purchases (Licitaciones, compras y adquisiciones)
CREATE TABLE IF NOT EXISTS public.purchases (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  title TEXT NOT NULL,
  supplier TEXT,
  amount NUMERIC DEFAULT 0,
  stage TEXT DEFAULT 'solicitud',
  status TEXT DEFAULT 'en_proceso',
  oc_number TEXT,
  reception_status TEXT DEFAULT 'pendiente',
  invoice_status TEXT DEFAULT 'sin_factura',
  establishment_id TEXT,
  date DATE,
  notes TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: meetings (Reuniones, acuerdos y compromisos)
CREATE TABLE IF NOT EXISTS public.meetings (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  title TEXT NOT NULL,
  date DATE,
  start_time TEXT,
  end_time TEXT,
  location TEXT,
  type TEXT DEFAULT 'ordinaria',
  status TEXT DEFAULT 'programada',
  attendees JSONB DEFAULT '[]'::jsonb,
  agreements JSONB DEFAULT '[]'::jsonb,
  commitments JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: indicators (Metas sanitarias, cortes trimestrales e indicadores)
CREATE TABLE IF NOT EXISTS public.indicators (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  baseline NUMERIC DEFAULT 0,
  target NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '%',
  frequency TEXT DEFAULT 'trimestral',
  source TEXT,
  status TEXT DEFAULT 'en_curso',
  measurements JSONB DEFAULT '[]'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: contacts (Directorio institucional y referentes)
CREATE TABLE IF NOT EXISTS public.contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  last_name TEXT DEFAULT '',
  role TEXT,
  institution TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  is_frequent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  program_ids JSONB DEFAULT '[]'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: questions (Consultas, dudas técnicas y resoluciones)
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT DEFAULT 'pendiente',
  priority TEXT DEFAULT 'media',
  author TEXT,
  assigned_to TEXT,
  follow_ups JSONB DEFAULT '[]'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: alerts (Alertas y notificaciones)
CREATE TABLE IF NOT EXISTS public.alerts (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  type TEXT DEFAULT 'presupuesto',
  title TEXT NOT NULL,
  message TEXT,
  severity TEXT DEFAULT 'media',
  dismissed BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: financial_periods (Partidas presupuestarias anuales)
CREATE TABLE IF NOT EXISTS public.financial_periods (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  year INTEGER DEFAULT 2026,
  period_name TEXT DEFAULT 'Presupuesto Inicial',
  assigned_budget NUMERIC DEFAULT 0,
  modifications NUMERIC DEFAULT 0,
  executed_amount NUMERIC DEFAULT 0,
  committed_amount NUMERIC DEFAULT 0,
  projected_amount NUMERIC DEFAULT 0,
  cutoff_date DATE,
  notes TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: budget_components (Subtítulos 21 - Personal, 22 - Bienes y Servicios, 29 - Capital)
CREATE TABLE IF NOT EXISTS public.budget_components (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  name TEXT NOT NULL,
  budget_to_spend NUMERIC DEFAULT 0,
  spent_amount NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'Personal',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: budget_2025_notes (Notas referenciales y ejecución presupuestaria de años anteriores)
CREATE TABLE IF NOT EXISTS public.budget_2025_notes (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  year INTEGER DEFAULT 2025,
  note TEXT,
  author TEXT,
  date DATE,
  budget_amount NUMERIC DEFAULT 0,
  executed_amount NUMERIC DEFAULT 0,
  fulfillment_rate NUMERIC DEFAULT 0,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: emails (Requerimientos, correos y oficios de salud)
CREATE TABLE IF NOT EXISTS public.emails (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  subject TEXT NOT NULL,
  sender TEXT,
  recipient TEXT,
  date DATE,
  status TEXT DEFAULT 'pendiente',
  priority TEXT DEFAULT 'media',
  type TEXT DEFAULT 'recibido',
  notes TEXT,
  archived BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: documents (Repositorio de convenios, resoluciones y documentos institucionales)
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  program_ids JSONB DEFAULT '[]'::jsonb,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'convenio',
  document_type TEXT DEFAULT 'convenio',
  document_number TEXT,
  status TEXT DEFAULT 'vigente',
  file_name TEXT,
  file_size TEXT,
  upload_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  uploaded_by TEXT,
  archived BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: hr_records (Recursos humanos, dotación y contratas)
CREATE TABLE IF NOT EXISTS public.hr_records (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  establishment_id TEXT,
  name TEXT NOT NULL,
  rut TEXT,
  role TEXT,
  hours NUMERIC DEFAULT 44,
  contract_type TEXT DEFAULT 'Contrata',
  monthly_cost NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'activo',
  archived BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla: knowledge (Base de conocimiento y criterios técnicos)
CREATE TABLE IF NOT EXISTS public.knowledge (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  program_ids JSONB DEFAULT '[]'::jsonb,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  content TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  author TEXT,
  date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  archived BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. MIGRACIÓN PREVENTIVA DE COLUMNAS (Para tablas que hayan existido previamente)
-- ==============================================================================
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'users', 'health_programs', 'establishments', 'tasks', 
    'purchases', 'meetings', 'indicators', 'contacts', 
    'questions', 'alerts', 'financial_periods', 'budget_components',
    'budget_2025_notes', 'emails', 'documents', 'hr_records', 'knowledge'
  ];
BEGIN
  -- Asegurar columna data JSONB en todas las tablas
  FOREACH t IN ARRAY tbls LOOP
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t AND column_name = 'data') THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN data JSONB DEFAULT ''{}''::jsonb', t);
    END IF;
  END LOOP;

  -- Asegurar tipo TEXT en IDs si previamente se habían definido como UUID
  FOREACH t IN ARRAY tbls LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t AND column_name = 'id' AND data_type = 'uuid') THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id TYPE TEXT USING id::text', t);
    END IF;
  END LOOP;

  -- Columnas de perfiles de usuario
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone_prefix TEXT DEFAULT 'CL +56';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS instagram TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Chile';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS budget_year INTEGER DEFAULT 2026;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS health_service TEXT DEFAULT 'Servicio de Salud Metropolitano Norte';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_url TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar TEXT;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS comuna TEXT DEFAULT 'Quilicura (DISAM)';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS establishment TEXT DEFAULT 'Dirección de Salud / Comunal';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Referente de Programas de Salud';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'referente';
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
  ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
END $$;

-- ==============================================================================
-- 4. SEGURIDAD Y PERMISOS ROW LEVEL SECURITY (RLS)
-- ==============================================================================
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'users', 'health_programs', 'establishments', 'tasks', 
    'purchases', 'meetings', 'indicators', 'contacts', 
    'questions', 'alerts', 'financial_periods', 'budget_components',
    'budget_2025_notes', 'emails', 'documents', 'hr_records', 'knowledge'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "Acceso total a %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Acceso total a %I" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- ==============================================================================
-- 5. SUSCRIPCIÓN EN TIEMPO REAL (SUPABASE REALTIME)
-- ==============================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE 
    public.users, 
    public.health_programs, 
    public.establishments, 
    public.tasks, 
    public.purchases, 
    public.meetings, 
    public.indicators, 
    public.contacts, 
    public.questions, 
    public.alerts, 
    public.financial_periods, 
    public.budget_components,
    public.budget_2025_notes,
    public.emails,
    public.documents,
    public.hr_records,
    public.knowledge;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- ==============================================================================
-- 6. SINCRONIZACIÓN AUTOMÁTICA AUTH -> PUBLIC.USERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    name, 
    email, 
    role, 
    title, 
    comuna, 
    establishment, 
    health_service, 
    avatar,
    phone,
    phone_prefix,
    instagram,
    country,
    budget_year
  )
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'referente'),
    COALESCE(NEW.raw_user_meta_data->>'title', 'Referente de Programas de Salud'),
    COALESCE(NEW.raw_user_meta_data->>'comuna', 'Quilicura (DISAM)'),
    COALESCE(NEW.raw_user_meta_data->>'establishment', 'Dirección de Salud / Comunal'),
    COALESCE(NEW.raw_user_meta_data->>'healthService', 'Servicio de Salud Metropolitano Norte'),
    UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'name', NEW.email) FROM 1 FOR 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'phonePrefix', 'CL +56'),
    COALESCE(NEW.raw_user_meta_data->>'instagram', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', 'Chile'),
    COALESCE((NEW.raw_user_meta_data->>'budgetYear')::integer, 2026)
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = COALESCE(public.users.role, EXCLUDED.role),
    title = COALESCE(public.users.title, EXCLUDED.title),
    health_service = COALESCE(public.users.health_service, EXCLUDED.health_service),
    budget_year = COALESCE(public.users.budget_year, EXCLUDED.budget_year),
    phone = CASE WHEN EXCLUDED.phone IS NOT NULL AND EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE public.users.phone END,
    phone_prefix = COALESCE(EXCLUDED.phone_prefix, public.users.phone_prefix),
    instagram = CASE WHEN EXCLUDED.instagram IS NOT NULL AND EXCLUDED.instagram <> '' THEN EXCLUDED.instagram ELSE public.users.instagram END,
    country = COALESCE(EXCLUDED.country, public.users.country),
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función RPC para verificar de forma segura si un correo está registrado
CREATE OR REPLACE FUNCTION public.check_email_registered(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_clean_email TEXT := LOWER(TRIM(p_email));
BEGIN
  IF v_clean_email IS NULL OR v_clean_email = '' THEN
    RETURN FALSE;
  END IF;

  -- 1. Verificar si existe en auth.users
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE LOWER(TRIM(email)) = v_clean_email
  ) THEN
    RETURN TRUE;
  END IF;

  -- 2. Verificar si existe en public.users
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE LOWER(TRIM(email)) = v_clean_email
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_email_registered(TEXT) TO anon, authenticated, service_role;

-- Sincronizar usuarios existentes en auth.users si no estaban en public.users
INSERT INTO public.users (id, name, email, role, title, comuna, establishment, health_service, avatar, phone, phone_prefix, instagram, country, budget_year)
SELECT
  id::text,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  email,
  COALESCE(raw_user_meta_data->>'role', 'referente'),
  COALESCE(raw_user_meta_data->>'title', 'Referente de Programas de Salud'),
  COALESCE(raw_user_meta_data->>'comuna', 'Quilicura (DISAM)'),
  COALESCE(raw_user_meta_data->>'establishment', 'Dirección de Salud / Comunal'),
  COALESCE(raw_user_meta_data->>'healthService', 'Servicio de Salud Metropolitano Norte'),
  UPPER(SUBSTRING(COALESCE(raw_user_meta_data->>'name', email) FROM 1 FOR 1)),
  COALESCE(raw_user_meta_data->>'phone', ''),
  COALESCE(raw_user_meta_data->>'phonePrefix', 'CL +56'),
  COALESCE(raw_user_meta_data->>'instagram', ''),
  COALESCE(raw_user_meta_data->>'country', 'Chile'),
  COALESCE((raw_user_meta_data->>'budgetYear')::integer, 2026)
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 7. DATOS BASE Y PROGRAMAS DE SALUD DE QUILICURA
-- ==============================================================================
INSERT INTO public.health_programs (id, code, name, short_name, description, referente, presupuesto_total, color, icon_name, target_population, coverage, status, year)
VALUES
  ('praps_cpu', 'CPU', 'PRAPS Cuidados Paliativos Universales', 'Cuidados Paliativos (CPU)', 'Atención integral médica y psicosocial en etapa avanzada en la red APS de Quilicura.', 'Klaus Bauer (DISAM Quilicura)', 68500000, '#0284c7', 'HeartHandshake', '1200', 88, 'activo', 2026),
  ('praps_rehab', 'REHAB', 'PRAPS Rehabilitación Integral', 'Rehabilitación Integral', 'Salas de Rehabilitación Base Comunitaria (RBC), atención kinésica y fonoaudiológica.', 'Klaus Bauer (DISAM Quilicura)', 112400000, '#059669', 'Activity', '3400', 78, 'activo', 2026),
  ('praps_imagenes', 'IMAG', 'PRAPS Imágenes Diagnósticas en APS', 'Imágenes Diagnósticas', 'Resolutividad diagnóstica: ecografías mamografías y radiografías.', 'Klaus Bauer (DISAM Quilicura)', 84200000, '#7c3aed', 'ScanLine', '5000', 91, 'activo', 2026),
  ('praps_mas_ama', 'MAS_AMA', 'PRAPS MAS AMA (Más Adultos Mayores)', 'MAS Adultos Mayores', 'Talleres de estimulación motora cognitiva y estilos de vida saludables.', 'Klaus Bauer (DISAM Quilicura)', 95800000, '#d97706', 'SmilePlus', '2800', 85, 'activo', 2026),
  ('praps_respiratoria', 'RESP', 'PRAPS Salud Respiratoria', 'Salud Respiratoria (ERA/IRA)', 'Salas ERA/IRA en CESFAM control de asma EPOC y refuerzo invernal.', 'Klaus Bauer (DISAM Quilicura)', 145000000, '#0891b2', 'Stethoscope', '6500', 94, 'activo', 2026),
  ('prog_personas_mayores', 'MAYORES', 'Programa Personas Mayores', 'Personas Mayores (ELEAM / EMPAM)', 'Coordinación comunal para personas mayores postulación ELEAM y EMPAM.', 'Klaus Bauer (DISAM Quilicura)', 78000000, '#4f46e5', 'UsersRound', '4200', 82, 'activo', 2026)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  description = EXCLUDED.description,
  referente = EXCLUDED.referente;

INSERT INTO public.establishments (id, name, short_name, code, type, commune, address, phone, director, active)
VALUES
  ('cesfam_salvador_allende', 'CESFAM Dr. Salvador Allende Gossens', 'CESFAM Salvador Allende', 'CESFAM-01', 'CESFAM', 'Quilicura', 'Av. Las Torres 620', '+56 2 2827 8600', 'Dra. María Paz González', true),
  ('cesfam_manuel_bustos', 'CESFAM Manuel Bustos Huerta', 'CESFAM Manuel Bustos', 'CESFAM-02', 'CESFAM', 'Quilicura', 'San Martín 1001', '+56 2 2827 8700', 'Dr. Carlos Mendoza Silva', true),
  ('cesfam_rodrigo_rojas', 'CESFAM Rodrigo Rojas de Negri', 'CESFAM Rodrigo Rojas', 'CESFAM-03', 'CESFAM', 'Quilicura', 'Av. Matta 450', '+56 2 2827 8800', 'Dra. Elena Sepúlveda', true),
  ('cecosf_valle_luna', 'CECOSF Valle de la Luna', 'CECOSF Valle de la Luna', 'CECOSF-01', 'CECOSF', 'Quilicura', 'Pasaje Los Astros 120', '+56 2 2827 8910', 'Klgo. Roberto Flores', true),
  ('sar_quilicura', 'SAR Quilicura (Servicio de Urgencia)', 'SAR Quilicura', 'SAR-01', 'SAR', 'Quilicura', 'Av. Las Torres 650', '+56 2 2827 8650', 'Dr. Andrés Valenzuela', true),
  ('disam_central', 'Dirección de Salud Municipal Quilicura', 'DISAM Quilicura', 'DISAM-00', 'DISAM', 'Quilicura', 'José Francisco Vergara 450', '+56 2 2827 8500', 'Director/a Comunal de Salud', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name;

-- Perfil de Referente Comunal (Klaus Bauer)
INSERT INTO public.users (
  id, name, email, role, title, comuna, establishment, health_service, 
  avatar, photo_url, phone, phone_prefix, instagram, country, budget_year, data
)
VALUES (
  'usr_klaus_bauer',
  'Klaus Bauer',
  'kbauergrandon@gmail.com',
  'referente',
  'Referente de Programas de Salud',
  'Quilicura (DISAM)',
  'Dirección de Salud / Comunal',
  'Servicio de Salud Metropolitano Norte',
  'KB',
  NULL,
  NULL,
  'CL +56',
  NULL,
  'Chile',
  2026,
  '{}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Sincronizar metadata en auth.users y vincular UUID si existe cuenta de autenticación
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    -- Si el usuario ya existe en auth.users, sincronizar en public.users con su UID auténtico sin sobreescribir datos personalizados
    INSERT INTO public.users (
      id, name, email, role, title, comuna, establishment, health_service,
      avatar, phone, phone_prefix, instagram, country, budget_year
    )
    SELECT 
      id::text,
      COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', 'Klaus Bauer'),
      email,
      'referente',
      'Referente de Programas de Salud',
      'Quilicura (DISAM)',
      'Dirección de Salud / Comunal',
      'Servicio de Salud Metropolitano Norte',
      'KB',
      COALESCE(raw_user_meta_data->>'phone', ''),
      COALESCE(raw_user_meta_data->>'phonePrefix', 'CL +56'),
      COALESCE(raw_user_meta_data->>'instagram', ''),
      COALESCE(raw_user_meta_data->>'country', 'Chile'),
      2026
    FROM auth.users
    WHERE email ILIKE 'kbauergrandon@gmail.com'
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

