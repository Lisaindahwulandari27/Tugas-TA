-- Add initial stock column to ingredients table
ALTER TABLE public.ingredients 
ADD COLUMN initial_stock numeric NOT NULL DEFAULT 0;