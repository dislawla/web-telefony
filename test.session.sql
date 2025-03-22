SET search_path TO users, public;

CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER, -- если у тебя есть авторизация
  role TEXT NOT NULL, -- 'user' или 'assistant'
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
