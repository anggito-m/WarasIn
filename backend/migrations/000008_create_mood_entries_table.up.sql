CREATE TABLE
    IF NOT EXISTS mood_entries (
        entry_id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        journal_id INT, -- Bisa NULL jika entri mood tidak selalu terkait jurnal
        entry_type VARCHAR(100),
        recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
        primary_emotion VARCHAR(100) NOT NULL,
        intensity_level REAL, -- CHECK (intensity_level >= 0 AND intensity_level <= 10) opsional
        trigger_factor TEXT,
        coping_strategy TEXT,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
        CONSTRAINT fk_journal FOREIGN KEY (journal_id) REFERENCES journals (journal_id) ON DELETE SET NULL -- Jika jurnal dihapus, entry_id mood tetap ada tapi journal_id jadi NULL
    );

CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries (user_id);

CREATE INDEX IF NOT EXISTS idx_mood_entries_journal_id ON mood_entries (journal_id);