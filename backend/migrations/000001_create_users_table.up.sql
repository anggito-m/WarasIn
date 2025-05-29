CREATE TABLE
    IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        hash_password VARCHAR(255), -- Made nullable for OAuth users
        google_id VARCHAR(255) UNIQUE, -- Google OAuth ID
        avatar TEXT, -- Profile picture URL
        auth_provider VARCHAR(50) DEFAULT 'local' NOT NULL, -- 'local' or 'google'
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        user_type VARCHAR(50) DEFAULT 'standard' NOT NULL
    );

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users (google_id);

CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users (auth_provider);