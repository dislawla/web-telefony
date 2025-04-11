-- Добавляем новые поля в таблицу users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS mtt_api_key TEXT,
ADD COLUMN IF NOT EXISTS mtt_phone_number TEXT,
ADD COLUMN IF NOT EXISTS amocrm_domain TEXT,
ADD COLUMN IF NOT EXISTS amocrm_access_token TEXT;

-- Комментарий к миграции
COMMENT ON COLUMN users.phone IS 'Телефон пользователя';
COMMENT ON COLUMN users.mtt_api_key IS 'API ключ для интеграции с МТТ';
COMMENT ON COLUMN users.mtt_phone_number IS 'Номер телефона МТТ';
COMMENT ON COLUMN users.amocrm_domain IS 'Домен AmoCRM';
COMMENT ON COLUMN users.amocrm_access_token IS 'Токен доступа AmoCRM'; 