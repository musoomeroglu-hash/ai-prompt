-- =====================================================
-- COMPLETE DATABASE SETUP
-- Bu dosyayı Supabase SQL Editor'da çalıştırın
-- Tüm tabloları, trigger'ları ve RLS politikalarını kurar
-- =====================================================

-- ============ 1. PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  plan text NOT NULL DEFAULT 'free',
  role text DEFAULT 'user',
  trial_start timestamptz DEFAULT now(),
  trial_end timestamptz DEFAULT (now() + interval '7 days'),
  subscription_end timestamptz,
  referral_code text UNIQUE,
  referred_by uuid,
  discount_type text,
  blacklisted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies (DROP IF EXISTS to avoid duplicates)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Service role full access profiles" ON profiles;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Service role full access profiles" ON profiles FOR ALL USING (true);

-- ============ 2. AUTO-CREATE PROFILE ON SIGNUP ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============ 3. GENERATIONS (History) ============
CREATE TABLE IF NOT EXISTS generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  user_request text NOT NULL,
  tone text,
  target_model text,
  result_json jsonb NOT NULL,
  tokens_used int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own generations" ON generations;
  DROP POLICY IF EXISTS "Users can insert own generations" ON generations;
  DROP POLICY IF EXISTS "Service role full access generations" ON generations;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE POLICY "Users can view own generations" ON generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own generations" ON generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role full access generations" ON generations FOR ALL USING (true);

-- ============ 4. DAILY USAGE ============
CREATE TABLE IF NOT EXISTS daily_usage (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  count int NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own daily usage" ON daily_usage;
  DROP POLICY IF EXISTS "Users can insert own daily usage" ON daily_usage;
  DROP POLICY IF EXISTS "Users can update own daily usage" ON daily_usage;
  DROP POLICY IF EXISTS "Service role full access daily_usage" ON daily_usage;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE POLICY "Users can view own daily usage" ON daily_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily usage" ON daily_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily usage" ON daily_usage FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access daily_usage" ON daily_usage FOR ALL USING (true);

-- ============ 5. SUBSCRIPTIONS ============
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type text NOT NULL DEFAULT 'free',
  billing_cycle text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'trial',
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz,
  trial_end timestamptz DEFAULT (now() + interval '7 days'),
  cancel_at_period_end boolean DEFAULT false,
  cancelled_at timestamptz,
  payment_provider text,
  payment_provider_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
  DROP POLICY IF EXISTS "Users can insert own subscriptions" ON subscriptions;
  DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
  DROP POLICY IF EXISTS "Service role full access subscriptions" ON subscriptions;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access subscriptions" ON subscriptions FOR ALL USING (true);

-- ============ 6. USAGE TRACKING (Monthly) ============
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  prompt_count integer DEFAULT 0,
  api_call_count integer DEFAULT 0,
  ai_analysis_count integer DEFAULT 0,
  ab_test_count integer DEFAULT 0,
  last_reset timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period_start)
);
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own usage tracking" ON usage_tracking;
  DROP POLICY IF EXISTS "Users can insert own usage tracking" ON usage_tracking;
  DROP POLICY IF EXISTS "Users can update own usage tracking" ON usage_tracking;
  DROP POLICY IF EXISTS "Service role full access usage_tracking" ON usage_tracking;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE POLICY "Users can view own usage tracking" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage tracking" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage tracking" ON usage_tracking FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role full access usage_tracking" ON usage_tracking FOR ALL USING (true);

-- ============ 7. PAYMENTS ============
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'TRY',
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  payment_provider text,
  payment_provider_id text,
  invoice_url text,
  refunded_at timestamptz,
  refund_reason text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own payments" ON payments;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

-- ============ 8. REFERRALS ============
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'signed_up',
  reward_type text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
  DROP POLICY IF EXISTS "Users can insert referrals" ON referrals;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE POLICY "Users can view own referrals" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "Users can insert referrals" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- ============ DONE ============
-- Tüm tablolar, trigger'lar ve RLS politikaları oluşturuldu!
