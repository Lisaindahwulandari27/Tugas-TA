-- Remove initial stock column from ingredients table
ALTER TABLE public.ingredients 
DROP COLUMN initial_stock;