CREATE TABLE IF NOT EXISTS resources (
    resource_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    published_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    language VARCHAR(50),
    user_type VARCHAR(50), -- Target user type for the resource
    view_count INT DEFAULT 0,
    content_type VARCHAR(100)
);