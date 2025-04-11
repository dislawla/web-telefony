-- Drop indexes
DROP INDEX IF EXISTS IDX_session_expire;
DROP INDEX IF EXISTS idx_telephony_settings_user_id;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_ai_sessions_client_id;

-- Drop trigger and function
DROP TRIGGER IF EXISTS update_telephony_settings_updated_at ON telephony_settings;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop tables
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS telephony_settings;
DROP TABLE IF EXISTS ai_sessions_client;
DROP TABLE IF EXISTS users; 