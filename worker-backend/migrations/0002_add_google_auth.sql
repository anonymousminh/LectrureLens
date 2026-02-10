-- Migration: Add Google authentication support to users table
-- Adds auth_provider to track signup method, google_id for Google account linking, and name for display

ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'email';
ALTER TABLE users ADD COLUMN google_id TEXT;
ALTER TABLE users ADD COLUMN name TEXT;
