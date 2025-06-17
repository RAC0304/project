-- View untuk menggabungkan security_logs dengan data users
CREATE OR REPLACE VIEW security_logs_with_users AS
SELECT 
  sl.id,
  sl.created_at,
  sl.action,
  sl.ip_address,
  sl.user_agent,
  sl.status,
  sl.details,
  u.id AS user_id,
  u.email,
  u.username,
  CONCAT(u.first_name, ' ', u.last_name) AS full_name,
  u.role
FROM 
  public.security_logs sl
LEFT JOIN 
  public.users u ON sl.user_id = u.id;

-- Function untuk mendapatkan security logs dengan informasi user
CREATE OR REPLACE FUNCTION get_security_logs_with_users(
  filter_status security_status DEFAULT NULL,
  search_term TEXT DEFAULT NULL,
  start_date TIMESTAMP DEFAULT NULL,
  end_date TIMESTAMP DEFAULT NULL,
  max_records INT DEFAULT 100
)
RETURNS TABLE (
  id BIGINT,
  created_at TIMESTAMP,
  action VARCHAR,
  ip_address VARCHAR,
  user_agent TEXT,
  status security_status,
  details TEXT,
  user_id BIGINT,
  email VARCHAR,
  username VARCHAR,
  full_name TEXT,
  role user_role
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM security_logs_with_users
  WHERE 
    (filter_status IS NULL OR status = filter_status)
    AND (search_term IS NULL OR 
         email ILIKE '%' || search_term || '%' OR 
         username ILIKE '%' || search_term || '%' OR
         full_name ILIKE '%' || search_term || '%' OR
         action ILIKE '%' || search_term || '%' OR
         details ILIKE '%' || search_term || '%')
    AND (start_date IS NULL OR created_at >= start_date)
    AND (end_date IS NULL OR created_at <= end_date)
  ORDER BY created_at DESC
  LIMIT max_records;
END;
$$ LANGUAGE plpgsql;

-- Security policy untuk view
ALTER VIEW security_logs_with_users OWNER TO postgres;
GRANT SELECT ON security_logs_with_users TO service_role;

-- Utility function untuk menambahkan log keamanan
CREATE OR REPLACE FUNCTION add_security_log(
  p_user_id BIGINT,
  p_action VARCHAR,
  p_ip_address VARCHAR,
  p_user_agent TEXT,
  p_status security_status DEFAULT 'success',
  p_details TEXT DEFAULT NULL
) RETURNS BIGINT AS $$
DECLARE
  log_id BIGINT;
BEGIN
  INSERT INTO public.security_logs
    (user_id, action, ip_address, user_agent, status, details)
  VALUES
    (p_user_id, p_action, p_ip_address, p_user_agent, p_status, p_details)
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;
