CREATE TABLE
    IF NOT EXISTS chat_messages (
        message_id SERIAL PRIMARY KEY,
        session_id INT NOT NULL,
        message_content TEXT NOT NULL,
        sent_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        sender_type VARCHAR(50) NOT NULL, -- e.g., 'user', 'bot', 'therapist'
        CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES chat_sessions (session_id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages (session_id);