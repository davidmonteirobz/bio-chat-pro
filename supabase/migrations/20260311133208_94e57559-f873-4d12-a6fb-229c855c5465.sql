CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  segment TEXT,
  has_site TEXT,
  service_interest TEXT,
  objective TEXT,
  wa_msg TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert (edge function uses service role key)
-- No public read/write access needed
CREATE POLICY "Service role can insert leads"
  ON public.leads
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read leads"
  ON public.leads
  FOR SELECT
  TO service_role
  USING (true);