CREATE TABLE
    IF NOT EXISTS journals (
        journal_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_journals_user_id ON journals (user_id);