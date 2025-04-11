-- Удаляем добавленные поля из таблицы users
ALTER TABLE users
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS mtt_api_key,
DROP COLUMN IF EXISTS mtt_phone_number,
DROP COLUMN IF EXISTS amocrm_domain,
DROP COLUMN IF EXISTS amocrm_access_token; 