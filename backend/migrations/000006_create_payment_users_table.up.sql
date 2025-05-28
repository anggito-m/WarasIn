CREATE TABLE
    IF NOT EXISTS payment_users (
        payment_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        premium_type VARCHAR(100) NOT NULL,
        payment_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        status VARCHAR(50) NOT NULL, -- e.g., 'pending', 'completed', 'failed'
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_payment_users_user_id ON payment_users (user_id);