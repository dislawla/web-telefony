-- Создаем таблицу calls
CREATE TABLE IF NOT EXISTS calls (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    duration INTEGER,
    transcript TEXT,
    recording_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ai_summary JSONB
);

-- Создаем индекс для быстрого поиска звонков по пользователю
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);

-- Создаем индекс для быстрого поиска звонков по контакту
CREATE INDEX IF NOT EXISTS idx_calls_contact_id ON calls(contact_id);

-- Добавляем комментарии к таблице и колонкам
COMMENT ON TABLE calls IS 'Таблица для хранения информации о звонках';
COMMENT ON COLUMN calls.user_id IS 'ID пользователя, которому принадлежит звонок';
COMMENT ON COLUMN calls.contact_id IS 'ID контакта, с которым был звонок';
COMMENT ON COLUMN calls.status IS 'Статус звонка';
COMMENT ON COLUMN calls.duration IS 'Длительность звонка в секундах';
COMMENT ON COLUMN calls.transcript IS 'Транскрипция звонка';
COMMENT ON COLUMN calls.recording_url IS 'URL записи звонка';
COMMENT ON COLUMN calls.created_at IS 'Дата и время создания записи';
COMMENT ON COLUMN calls.ai_summary IS 'JSON с AI-анализом звонка'; 