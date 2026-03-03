-- Clean up stale tables (from previous projects) that block Hibernate DDL
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS club_members;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS literacy_modules;
SET FOREIGN_KEY_CHECKS = 1;
