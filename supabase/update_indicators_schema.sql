-- ==============================================================================
-- ACTUALIZACIÓN INTEGRAL DE INDICADORES Y PROGRAMAS EN SUPABASE
-- Ejecuta este script directamente en el Editor SQL de tu panel de Supabase
-- ==============================================================================

-- 1. Asegurar extensión pgcrypto para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Asegurar que la tabla indicators exista
CREATE TABLE IF NOT EXISTS public.indicators (
  id TEXT PRIMARY KEY,
  program_id TEXT,
  code TEXT,
  name TEXT,
  description TEXT,
  target_value NUMERIC DEFAULT 100,
  current_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '%',
  periodicity TEXT DEFAULT 'mensual',
  frequency TEXT DEFAULT 'trimestral',
  weight NUMERIC DEFAULT 1,
  good_threshold NUMERIC DEFAULT 85,
  warning_threshold NUMERIC DEFAULT 70,
  source TEXT,
  status TEXT DEFAULT 'en_curso',
  measurements JSONB DEFAULT '[]'::jsonb,
  cuts JSONB DEFAULT '[]'::jsonb,
  cutoff_date TEXT,
  last_updated TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Agregar TODAS las columnas modificables requeridas por la ficha de indicador
-- (ALTER TABLE IF NOT EXISTS es seguro y no borra datos existentes)
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS componente TEXT;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS objetivo_especifico TEXT;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS corte_seleccionado TEXT DEFAULT '1° corte';
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS numerador_descripcion TEXT;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS numerador_valor NUMERIC;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS numerador_tipo TEXT DEFAULT 'porcentaje';
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS denominador_descripcion TEXT;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS denominador_valor NUMERIC;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS denominador_tipo TEXT DEFAULT 'porcentaje';
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS peso_relativo NUMERIC DEFAULT 50;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS medio_verificacion_numerador TEXT;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS medio_verificacion_denominador TEXT;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS meta_cumplimiento_anual_texto TEXT;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS meta_cumplimiento_anual_porcentaje NUMERIC DEFAULT 100;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS annual_target NUMERIC DEFAULT 100;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS annual_target_quantity NUMERIC;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS period_target NUMERIC DEFAULT 90;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS period_target_quantity NUMERIC;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS current_result NUMERIC DEFAULT 0;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS current_result_quantity NUMERIC;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS corte1 JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS corte2 JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS corte3 JSONB;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.indicators ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

-- 4. Habilitar RLS y políticas de acceso completas para lectura y escritura
ALTER TABLE public.indicators ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_anon_indicators" ON public.indicators;
CREATE POLICY "allow_all_anon_indicators" ON public.indicators
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "allow_all_auth_indicators" ON public.indicators;
CREATE POLICY "allow_all_auth_indicators" ON public.indicators
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

GRANT ALL ON TABLE public.indicators TO anon, authenticated, service_role;

-- 5. Asegurar columnas en la tabla programs para soportar programas nuevos
CREATE TABLE IF NOT EXISTS public.programs (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  short_name TEXT,
  description TEXT,
  year INTEGER DEFAULT 2026,
  status TEXT DEFAULT 'activo',
  color TEXT,
  total_budget NUMERIC DEFAULT 0,
  executed_budget NUMERIC DEFAULT 0,
  target_population NUMERIC DEFAULT 0,
  coverage_target NUMERIC DEFAULT 100,
  actual_coverage NUMERIC DEFAULT 0,
  components JSONB DEFAULT '[]'::jsonb,
  indicators JSONB DEFAULT '[]'::jsonb,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_anon_programs" ON public.programs;
CREATE POLICY "allow_all_anon_programs" ON public.programs FOR ALL TO anon USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_auth_programs" ON public.programs;
CREATE POLICY "allow_all_auth_programs" ON public.programs FOR ALL TO authenticated USING (true) WITH CHECK (true);
GRANT ALL ON TABLE public.programs TO anon, authenticated, service_role;

-- 6. Notificar recarga de caché de esquema en Supabase PostgREST
NOTIFY pgrst, 'reload schema';
