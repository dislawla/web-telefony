-- Добавление колонки avatar_url в таблицу users
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url text;

-- Комментарий к колонке
COMMENT ON COLUMN users.avatar_url IS 'URL аватара пользователя'; 