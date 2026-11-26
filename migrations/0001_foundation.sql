CREATE TYPE staff_role AS ENUM ('owner','manager','kitchen','waiter','cashier');
CREATE TABLE restaurants (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, name text NOT NULL, demo boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE restaurant_settings (restaurant_id uuid PRIMARY KEY REFERENCES restaurants(id), currency text NOT NULL DEFAULT 'INR', timezone text NOT NULL DEFAULT 'Asia/Kolkata', language text NOT NULL DEFAULT 'en');
CREATE TABLE users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE CHECK(email=lower(email)), name text NOT NULL, password_hash text NOT NULL, active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE staff (restaurant_id uuid NOT NULL REFERENCES restaurants(id), user_id uuid NOT NULL UNIQUE REFERENCES users(id), role staff_role NOT NULL, active boolean NOT NULL DEFAULT true, PRIMARY KEY(restaurant_id,user_id));
CREATE TABLE sessions (token_hash text PRIMARY KEY, restaurant_id uuid NOT NULL, user_id uuid NOT NULL, expires_at timestamptz NOT NULL, FOREIGN KEY(restaurant_id,user_id) REFERENCES staff(restaurant_id,user_id) ON DELETE CASCADE);
CREATE INDEX sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE login_attempts (key text PRIMARY KEY, count integer NOT NULL DEFAULT 0, window_start timestamptz NOT NULL);
