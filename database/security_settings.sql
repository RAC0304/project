-- Tabel untuk menyimpan pengaturan keamanan
CREATE TABLE IF NOT EXISTS security_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  max_login_attempts INTEGER NOT NULL DEFAULT 5,
  lockout_duration INTEGER NOT NULL DEFAULT 30, -- dalam menit
  session_timeout INTEGER NOT NULL DEFAULT 120, -- dalam menit
  require_two_factor BOOLEAN NOT NULL DEFAULT false,
  password_policy JSONB NOT NULL DEFAULT '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special_chars": false, "expiration_days": 90, "prevent_reuse": 5}'::JSONB,
  audit_log_retention INTEGER NOT NULL DEFAULT 365, -- dalam hari
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default record jika belum ada data
INSERT INTO security_settings (id)
VALUES ('00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies
ALTER TABLE security_settings ENABLE ROW LEVEL SECURITY;

-- Hanya admin yang bisa melihat dan mengubah security settings
CREATE POLICY "Admin can read security settings" 
  ON security_settings
  FOR SELECT 
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update security settings" 
  ON security_settings
  FOR UPDATE 
  USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_security_settings_timestamp
BEFORE UPDATE ON security_settings
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
