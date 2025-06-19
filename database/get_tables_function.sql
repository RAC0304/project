-- Function to get tables in the public schema
CREATE OR REPLACE FUNCTION public.get_tables()
RETURNS TABLE (table_name text)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT t.table_name::text
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_name;
END;
$$;

-- Grant access to the function
ALTER FUNCTION public.get_tables() SECURITY DEFINER;
GRANT EXECUTE ON FUNCTION public.get_tables() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tables() TO anon;
GRANT EXECUTE ON FUNCTION public.get_tables() TO service_role;
