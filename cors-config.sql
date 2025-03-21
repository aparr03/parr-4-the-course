-- Update CORS configuration for the send-email Edge Function
INSERT INTO "supabase_functions"."config" ("name", "value", "comment")
VALUES
  ('CORS_ENABLED', 'true', 'Enable CORS for all functions'),
  ('CORS_ORIGINS', 'http://localhost:3001, https://your-production-domain.com', 'Allowed origins')
ON CONFLICT (name) 
DO UPDATE SET 
  value = EXCLUDED.value,
  comment = EXCLUDED.comment;

-- If you're using a specific HTTP header for authorization
INSERT INTO "supabase_functions"."config" ("name", "value", "comment")
VALUES
  ('CORS_ALLOWED_HEADERS', 'authorization, x-client-info, apikey, content-type', 'Allowed headers')
ON CONFLICT (name) 
DO UPDATE SET 
  value = EXCLUDED.value,
  comment = EXCLUDED.comment;

-- Insert a comment explaining what's been done
COMMENT ON TABLE "supabase_functions"."config" IS 'Updated CORS configuration to allow requests from localhost:3001'; 