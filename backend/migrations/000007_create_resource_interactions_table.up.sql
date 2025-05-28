CREATE TABLE
    IF NOT EXISTS resource_interactions (
        interaction_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        resource_id INT NOT NULL,
        rating REAL, -- CHECK (rating >= 0 AND rating <= 5) opsional
        feedback_text TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        CONSTRAINT fk_resource FOREIGN KEY (resource_id) REFERENCES resources (resource_id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS idx_resource_interactions_user_id ON resource_interactions (user_id);

CREATE INDEX IF NOT EXISTS idx_resource_interactions_resource_id ON resource_interactions (resource_id);