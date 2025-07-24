-- Fix ingredients cost_per_unit default value to 1
ALTER TABLE public.ingredients 
ALTER COLUMN cost_per_unit SET DEFAULT 1;