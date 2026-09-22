-- ==============================================================================
-- QUILICURA SALUD - ESQUEMA INTEGRAL SUPABASE CON TODAS LAS TABLAS Y CAMPOS
-- 100% Compatible, Idempotente (se puede ejecutar múltiples veces sin error)
-- Incluye: usuarios, programas, tareas, compras, reuniones, indicadores,
-- contactos, preguntas, alertas, establecimientos, finanzas y presupuestos.
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tabla de Usuarios y Perfiles (public.users)
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'referente',
  title TEXT,
  comuna TEXT DEFAULT 'Quilicura (DISAM)',
  establishment TEXT DEFAULT 'Dirección de Salud / Comunal',
  health_service TEXT DEFAULT 'SSMN (Metropolitano Norte)',
  avatar TEXT,
  photo_url TEXT,
  phone TEXT DEFAULT '1234567890',
  phone_prefix TEXT DEFAULT 'CL +56',
  instagram TEXT DEFAULT 'tuusuario',
  country TEXT DEFAULT 'Chile',
  budget_year INTEGER DEFAULT 2026,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurar que las columnas nuevas existan si la tabla ya fue creada previamente
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'phone_prefix') THEN
    ALTER TABLE public.users ADD COLUMN phone_prefix TEXT DEFAULT 'CL +56';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'instagram') THEN
    ALTER TABLE public.users ADD COLUMN instagram TEXT DEFAULT 'tuusuario';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'country') THEN
    ALTER TABLE public.users ADD COLUMN country TEXT DEFAULT 'Chile';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'budget_year') THEN
    ALTER TABLE public.users ADD COLUMN budget_year INTEGER DEFAULT 2026;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE public.users ADD COLUMN updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;
  END IF;
END $$;

-- 3. Tabla de Programas de Salud (public.health_programs)
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
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Asegurar tipo TEXT para target_population
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'health_programs' AND column_name = 'target_population' AND data_type != 'text'
  ) THEN
    ALTER TABLE public.health_programs ALTER COLUMN target_population TYPE TEXT USING target_population::TEXT;
  END IF;
END $$;

-- 4. Tabla de Establecimientos de Salud (public.establishments)
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
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabla de Tareas (public.tasks)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabla de Compras y Adquisiciones (public.purchases)
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT,
  establishment_id TEXT,
  code TEXT,
  description TEXT NOT NULL,
  justification TEXT,
  estimated_amount NUMERIC DEFAULT 0,
  actual_amount NUMERIC,
  supplier TEXT,
  status TEXT DEFAULT 'solicitado',
  priority TEXT DEFAULT 'media',
  category TEXT DEFAULT 'general',
  request_date DATE,
  orden_compra TEXT,
  folio_mercado_publico TEXT,
  responsible_user TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Tabla de Reuniones y Acuerdos (public.meetings)
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT DEFAULT '10:00',
  location TEXT,
  status TEXT DEFAULT 'programada',
  summary TEXT,
  participants JSONB DEFAULT '[]'::jsonb,
  agreements JSONB DEFAULT '[]'::jsonb,
  commitments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Tabla de Indicadores y Metas (public.indicators)
CREATE TABLE IF NOT EXISTS public.indicators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT,
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC DEFAULT 100,
  current_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '%',
  periodicity TEXT DEFAULT 'mensual',
  weight NUMERIC DEFAULT 1,
  good_threshold NUMERIC DEFAULT 85,
  warning_threshold NUMERIC DEFAULT 70,
  measurements JSONB DEFAULT '[]'::jsonb,
  cuts JSONB DEFAULT '[]'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Tabla de Contactos y Directorio (public.contacts)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT,
  name TEXT NOT NULL,
  last_name TEXT,
  role TEXT,
  institution TEXT,
  email TEXT,
  phone TEXT,
  contact_type TEXT DEFAULT 'referente_comunal',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Tabla de Consultas Técnicas (public.questions)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT,
  asked_by TEXT,
  category TEXT DEFAULT 'orientacion_tecnica',
  question TEXT NOT NULL,
  answer TEXT,
  status TEXT DEFAULT 'pendiente',
  priority TEXT DEFAULT 'media',
  date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  answered_by TEXT,
  answered_date DATE,
  follow_ups JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Tabla de Alertas del Sistema (public.alerts)
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT,
  type TEXT DEFAULT 'sistema',
  severity TEXT DEFAULT 'media',
  title TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Tabla de Períodos Financieros (public.financial_periods)
CREATE TABLE IF NOT EXISTS public.financial_periods (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  year INTEGER DEFAULT 2026,
  period_name TEXT,
  allocated_budget NUMERIC DEFAULT 0,
  executed_budget NUMERIC DEFAULT 0,
  committed_budget NUMERIC DEFAULT 0,
  available_budget NUMERIC DEFAULT 0,
  execution_percentage NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'en_ejecucion',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Tabla de Componentes Presupuestarios (public.budget_components)
CREATE TABLE IF NOT EXISTS public.budget_components (
  id TEXT PRIMARY KEY,
  program_id TEXT NOT NULL,
  name TEXT NOT NULL,
  budget_to_spend NUMERIC DEFAULT 0,
  spent_amount NUMERIC DEFAULT 0,
  category TEXT DEFAULT 'Personal',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_components ENABLE ROW LEVEL SECURITY;

-- 15. Crear políticas de acceso completo para anon y authenticated
DO $$
DECLARE
  t TEXT;
  tbls TEXT[] := ARRAY[
    'users', 'health_programs', 'establishments', 'tasks', 
    'purchases', 'meetings', 'indicators', 'contacts', 
    'questions', 'alerts', 'financial_periods', 'budget_components'
  ];
BEGIN
  FOREACH t IN ARRAY tbls LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Acceso total a %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Acceso total a %I" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

-- 16. Habilitar publicación en tiempo real (Realtime)
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
    public.budget_components;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- 17. Trigger automático para sincronizar auth.users -> public.users al registrarse
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
    COALESCE(NEW.raw_user_meta_data->>'healthService', 'SSMN (Metropolitano Norte)'),
    UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'name', NEW.email) FROM 1 FOR 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', '1234567890'),
    COALESCE(NEW.raw_user_meta_data->>'phonePrefix', 'CL +56'),
    COALESCE(NEW.raw_user_meta_data->>'instagram', 'tuusuario'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'Chile'),
    COALESCE((NEW.raw_user_meta_data->>'budgetYear')::integer, 2026)
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = COALESCE(public.users.role, EXCLUDED.role),
    title = COALESCE(public.users.title, EXCLUDED.title),
    phone = COALESCE(public.users.phone, EXCLUDED.phone),
    phone_prefix = COALESCE(public.users.phone_prefix, EXCLUDED.phone_prefix),
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sincronizar de auth.users a public.users si hay usuarios existentes
INSERT INTO public.users (id, name, email, role, title, comuna, establishment, health_service, avatar, phone, phone_prefix, instagram, country, budget_year)
SELECT
  id::text,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  email,
  COALESCE(raw_user_meta_data->>'role', 'referente'),
  COALESCE(raw_user_meta_data->>'title', 'Referente de Programas de Salud'),
  COALESCE(raw_user_meta_data->>'comuna', 'Quilicura (DISAM)'),
  COALESCE(raw_user_meta_data->>'establishment', 'Dirección de Salud / Comunal'),
  COALESCE(raw_user_meta_data->>'healthService', 'SSMN (Metropolitano Norte)'),
  UPPER(SUBSTRING(COALESCE(raw_user_meta_data->>'name', email) FROM 1 FOR 1)),
  COALESCE(raw_user_meta_data->>'phone', '1234567890'),
  COALESCE(raw_user_meta_data->>'phonePrefix', 'CL +56'),
  COALESCE(raw_user_meta_data->>'instagram', 'tuusuario'),
  COALESCE(raw_user_meta_data->>'country', 'Chile'),
  COALESCE((raw_user_meta_data->>'budgetYear')::integer, 2026)
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 18. Semillas de Programas de Salud
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

-- 19. Semillas de Establecimientos de Salud
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
