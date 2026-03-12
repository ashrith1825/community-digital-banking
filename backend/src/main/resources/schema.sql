-- Schema initialization (Hibernate will handle table creation)
-- This file is kept for future manual SQL if needed

-- Fix: a previous version of the entity had a 'password' column (NOT NULL, no default).
-- Hibernate's ddl-auto=update never drops old columns, so this column lingers in the live
-- database and breaks every INSERT. Make it nullable so legacy rows are not rejected.
-- Safe to run on every startup; continue-on-error=true handles fresh DBs where it won't exist.
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL DEFAULT NULL;
