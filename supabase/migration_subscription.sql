-- Subscription System: Add trial and subscription fields to profiles
-- Run this in Supabase SQL Editor

-- Add new columns (safe to run - IF NOT EXISTS style with DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='trial_start') THEN
    ALTER TABLE profiles ADD COLUMN trial_start timestamptz DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='trial_end') THEN
    ALTER TABLE profiles ADD COLUMN trial_end timestamptz DEFAULT (now() + interval '7 days');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='subscription_end') THEN
    ALTER TABLE profiles ADD COLUMN subscription_end timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='payment_provider') THEN
    ALTER TABLE profiles ADD COLUMN payment_provider text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='payment_id') THEN
    ALTER TABLE profiles ADD COLUMN payment_id text;
  END IF;
END $$;
