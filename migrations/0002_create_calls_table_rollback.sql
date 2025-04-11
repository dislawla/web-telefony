-- Удаляем индексы
DROP INDEX IF EXISTS idx_calls_user_id;
DROP INDEX IF EXISTS idx_calls_contact_id;

-- Удаляем таблицу
DROP TABLE IF EXISTS calls; 