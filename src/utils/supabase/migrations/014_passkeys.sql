-- Migration to create the passkeys table for WebAuthn support

CREATE TABLE public.passkeys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_type TEXT,
  transports TEXT[],
  backed_up BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.passkeys ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own passkeys" 
  ON public.passkeys FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own passkeys" 
  ON public.passkeys FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passkeys" 
  ON public.passkeys FOR UPDATE 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passkeys" 
  ON public.passkeys FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for faster lookups by credential_id
CREATE INDEX idx_passkeys_credential_id ON public.passkeys(credential_id);
CREATE INDEX idx_passkeys_user_id ON public.passkeys(user_id);
