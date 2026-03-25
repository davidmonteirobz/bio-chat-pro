CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active'
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can insert conversations"
  ON public.conversations FOR INSERT TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can read conversations"
  ON public.conversations FOR SELECT TO service_role
  USING (true);

CREATE POLICY "Service role can update conversations"
  ON public.conversations FOR UPDATE TO service_role
  USING (true) WITH CHECK (true);