-- Удаляем индексы
DROP INDEX IF EXISTS idx_contacts_user_id;
DROP INDEX IF EXISTS idx_contacts_phone;

-- Удаляем таблицу
DROP TABLE IF EXISTS contacts; 