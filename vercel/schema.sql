-- Neuro Nutri Clinic — database schema
-- Run once against your Neon (or other Postgres) database.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  password_hash TEXT,
  is_admin      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS enrollments (
  id               SERIAL PRIMARY KEY,
  patient_name     TEXT,
  patient_email    TEXT,
  patient_phone    TEXT,
  tier             TEXT,
  appointment_date TEXT,
  appointment_time TEXT,
  intake_data      JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_data     JSONB NOT NULL DEFAULT '{}'::jsonb,
  booking_data     JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id          INTEGER REFERENCES users(id) ON DELETE SET NULL,
  claim_token      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS enrollments_user_id_idx ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS enrollments_created_at_idx ON enrollments(created_at DESC);
