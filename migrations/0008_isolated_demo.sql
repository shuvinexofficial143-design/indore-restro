ALTER TABLE users ADD COLUMN login_disabled boolean NOT NULL DEFAULT false;
CREATE TABLE demo_sessions (restaurant_id uuid PRIMARY KEY REFERENCES restaurants(id), token_hash text NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, revoked_at timestamptz);
CREATE INDEX demo_sessions_expiry ON demo_sessions(expires_at);
