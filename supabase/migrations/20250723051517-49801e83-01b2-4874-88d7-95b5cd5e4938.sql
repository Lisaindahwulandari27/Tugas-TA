-- Create transactions table for customer purchase records
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_name TEXT,
  items JSONB NOT NULL, -- Array of items with {name, quantity, price, total}
  subtotal NUMERIC NOT NULL,
  tax NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  notes TEXT,
  served_by TEXT -- Staff member who served
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is admin-only system)
CREATE POLICY "Allow all operations on transactions" 
ON public.transactions 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create index for better performance on date queries
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);