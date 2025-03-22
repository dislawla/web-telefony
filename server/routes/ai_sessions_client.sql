-- Таблица клиентских сессий
CREATE TABLE ai_sessions_client (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL, -- При необходимости можно добавить REFERENCES users(id) или REFERENCES clients(id)
  title TEXT DEFAULT 'Новая сессия',
  header TEXT, -- Новое поле для хранения заголовка
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Таблица сообщений в клиентской сессии
CREATE TABLE ai_messages_client (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES ai_sessions_client(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('client', 'assistent')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
