-- Создаем таблицу contacts
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индекс для быстрого поиска контактов по пользователю
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);

-- Создаем индекс для быстрого поиска по телефону
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);

-- Добавляем комментарии к таблице и колонкам
COMMENT ON TABLE contacts IS 'Таблица для хранения контактов пользователей';
COMMENT ON COLUMN contacts.user_id IS 'ID пользователя, которому принадлежит контакт';
COMMENT ON COLUMN contacts.name IS 'Имя контакта';
COMMENT ON COLUMN contacts.phone IS 'Номер телефона контакта';
COMMENT ON COLUMN contacts.email IS 'Email контакта';
COMMENT ON COLUMN contacts.status IS 'Статус контакта';
COMMENT ON COLUMN contacts.notes IS 'Дополнительные заметки о контакте';
COMMENT ON COLUMN contacts.created_at IS 'Дата и время создания записи'; 