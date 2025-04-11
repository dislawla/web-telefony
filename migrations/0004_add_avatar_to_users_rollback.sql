-- Удаляем поле avatar_url из таблицы users
ALTER TABLE users
DROP COLUMN IF EXISTS avatar_url; 