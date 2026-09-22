-- ==============================================================================
-- QUILICURA SALUD - SCRIPT CORREGIDO Y 100% COMPATIBLE CON SUPABASE
-- Compatible con columnas de tipo numérico o texto (target_population)
-- ==============================================================================

-- 1. Habilitar extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Asegurar que las columnas tengan los tipos flexibles
DO $$
BEGIN
  -- Si target_population es integer, permitir que también acepte texto o se mantenga numérico
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'health_programs' AND column_name = 'target_population' AND data_type != 'text'
  ) THEN
    ALTER TABLE public.health_programs ALTER COLUMN target_population TYPE TEXT USING target_population::TEXT;
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- 3. Crear tablas si no existen
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

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id TEXT,
  type TEXT DEFAULT 'sistema',
  severity TEXT DEFAULT 'media',
  title TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'referente',
  title TEXT,
  comuna TEXT,
  establishment TEXT,
  health_service TEXT,
  avatar TEXT,
  photo_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Habilitar RLS en todas las tablas
ALTER TABLE public.health_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de acceso total para anon y authenticated
DO $$
BEGIN
  DROP POLICY IF EXISTS "Acceso total a health_programs" ON public.health_programs;
  CREATE POLICY "Acceso total a health_programs" ON public.health_programs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Acceso total a tasks" ON public.tasks;
  CREATE POLICY "Acceso total a tasks" ON public.tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Acceso total a purchases" ON public.purchases;
  CREATE POLICY "Acceso total a purchases" ON public.purchases FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Acceso total a meetings" ON public.meetings;
  CREATE POLICY "Acceso total a meetings" ON public.meetings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Acceso total a indicators" ON public.indicators;
  CREATE POLICY "Acceso total a indicators" ON public.indicators FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Acceso total a contacts" ON public.contacts;
  CREATE POLICY "Acceso total a contacts" ON public.contacts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Acceso total a questions" ON public.questions;
  CREATE POLICY "Acceso total a questions" ON public.questions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Acceso total a alerts" ON public.alerts;
  CREATE POLICY "Acceso total a alerts" ON public.alerts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "Acceso total a users" ON public.users;
  CREATE POLICY "Acceso total a users" ON public.users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;

-- 6. Habilitar publicación en tiempo real (Realtime)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.health_programs, public.tasks, public.purchases, public.meetings, public.indicators, public.contacts, public.questions, public.alerts, public.users;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- 7. Datos de programas (usando valores numéricos compatibles con integer o text)
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
