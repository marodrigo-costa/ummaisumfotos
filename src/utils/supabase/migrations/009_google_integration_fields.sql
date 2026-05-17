-- Update Bookings table for Google Calendar Integration
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS google_event_id TEXT,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ; -- Para duração do agendamento

-- Update Profiles for Google Contacts Integration
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS google_contact_id TEXT;
