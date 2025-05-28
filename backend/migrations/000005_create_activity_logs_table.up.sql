CREATE TABLE
    IF NOT EXISTS activity_logs (
        log_id SERIAL PRIMARY KEY,
        user_id INT, -- Bisa jadi NULL jika aktivitas sistem, atau NOT NULL jika selalu terkait user
        activity TEXT NOT NULL,
        timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        ip_address VARCHAR(45),
        device_info TEXT,
        browser_info TEXT,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE SET NULL
        -- Atau CASCADE, tergantung kebutuhan
    );

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs (user_id);