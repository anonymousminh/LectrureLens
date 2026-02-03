-- Migration: Add lecture metadata columns to user_lectures table
-- This adds lecture_name and created_at columns

ALTER TABLE user_lectures ADD COLUMN lecture_name TEXT;
ALTER TABLE user_lectures ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
