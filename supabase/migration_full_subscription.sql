-- =====================================================
-- FULL SUBSCRIPTION SYSTEM MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Update profiles table with subscription fields
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
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='referral_code') THEN
    ALTER TABLE profiles ADD COLUMN referral_code text UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='referred_by') THEN
    ALTER TABLE profiles ADD COLUMN referred_by uuid REFERENCES profiles(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='discount_type') THEN
    ALTER TABLE profiles ADD COLUMN discount_type text; -- 'student', 'ngo'
  END IF;
END $$;

-- 2. Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free',
  -- 'free', 'starter', 'pro', 'unlimited', 'dev_starter', 'dev_pro', 'enterprise'
  billing_cycle text NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  status text NOT NULL DEFAULT 'trial',
  -- 'active', 'suspended', 'cancelled', 'trial', 'past_due'
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz,
  trial_end timestamptz DEFAULT (now() + interval '7 days'),
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamptz,
  payment_provider text, -- 'iyzico', 'stripe', 'manual'
  payment_provider_id text, -- external subscription ID
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Usage tracking table (monthly quotas)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  period_start date NOT NULL, -- first day of tracking period
  prompt_count integer DEFAULT 0,
  api_call_count integer DEFAULT 0,
  ai_analysis_count integer DEFAULT 0,
  ab_test_count integer DEFAULT 0,
  last_reset timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- 4. Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'TRY',
  status text NOT NULL DEFAULT 'pending',
  -- 'pending', 'succeeded', 'failed', 'refunded'
  payment_method text, -- 'credit_card', 'debit_card', 'bank_transfer'
  payment_provider text, -- 'iyzico', 'stripe', 'manual'
  payment_provider_id text, -- external payment ID
  invoice_url text,
  refunded_at timestamptz,
  refund_reason text,
  created_at timestamptz DEFAULT now()
);

-- 5. Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'signed_up', -- 'signed_up', 'converted', 'rewarded'
  reward_type text, -- 'free_month', 'upgrade'
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- 6. Enable RLS on new tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Usage tracking
CREATE POLICY "Users can view own usage" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON usage_tracking FOR UPDATE USING (auth.uid() = user_id);

-- Payments
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- Referrals
CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can insert referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
