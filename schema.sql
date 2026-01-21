DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    salt TEXT
);

DROP TABLE IF EXISTS user_lectures;
CREATE TABLE user_lectures (
    user_id TEXT,
    lecture_id TEXT,
    PRIMARY KEY (user_id, lecture_id)
);
