-- Добавляем поле для хранения URL аватара пользователя
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Добавляем комментарий к колонке
COMMENT ON COLUMN users.avatar_url IS 'URL аватара пользователя'; 