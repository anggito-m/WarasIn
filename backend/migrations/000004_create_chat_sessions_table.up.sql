CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    end_time TIMESTAMPTZ,
    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);