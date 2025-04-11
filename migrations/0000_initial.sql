-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    company_name TEXT NOT NULL,
    email TEXT UNIQUE,
    name TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create telephony_settings table
CREATE TABLE IF NOT EXISTS telephony_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    api_key VARCHAR(255) NOT NULL,
    incoming_routing VARCHAR(50) NOT NULL,
    incoming_greeting TEXT NOT NULL,
    incoming_wait_time INTEGER NOT NULL,
    outgoing_phone VARCHAR(50) NOT NULL,
    record_calls BOOLEAN DEFAULT TRUE,
    analyze_conversations BOOLEAN DEFAULT TRUE,
    transcription_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ai_sessions_client table
CREATE TABLE IF NOT EXISTS ai_sessions_client (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for telephony_settings
CREATE TRIGGER update_telephony_settings_updated_at
    BEFORE UPDATE ON telephony_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for username lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index for user_id in telephony_settings
CREATE INDEX IF NOT EXISTS idx_telephony_settings_user_id ON telephony_settings(user_id);

-- Create index for client_id in ai_sessions_client
CREATE INDEX IF NOT EXISTS idx_ai_sessions_client_id ON ai_sessions_client(client_id);

-- Create session table for express-session with connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
    "sid" varchar NOT NULL COLLATE "default",
    "sess" json NOT NULL,
    "expire" timestamp(6) NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire"); 