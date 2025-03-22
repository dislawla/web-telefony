CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER, -- Optional, if you have user authentication
  role TEXT NOT NULL, -- 'user' or 'assistant'
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
