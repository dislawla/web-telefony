SET search_path TO users, public;

CREATE TABLE telephony_settings (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    api_key VARCHAR(255) NOT NULL,
    incoming_routing VARCHAR(50) NOT NULL CHECK (incoming_routing IN ('sequential', 'parallel')),
    incoming_greeting TEXT NOT NULL,
    incoming_wait_time INT NOT NULL CHECK (incoming_wait_time >= 0),
    outgoing_phone VARCHAR(50) NOT NULL,
    record_calls BOOLEAN DEFAULT true,
    analyze_conversations BOOLEAN DEFAULT true,
    transcription_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
