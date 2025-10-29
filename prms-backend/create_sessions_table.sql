-- SQL script to create the sessions table for database-based PHP sessions
-- Execute this in your MySQL database

CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    data LONGTEXT,
    timestamp INT
);

-- Optional: Add an index on timestamp for faster garbage collection
CREATE INDEX idx_timestamp ON sessions(timestamp);

