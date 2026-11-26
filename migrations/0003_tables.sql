CREATE TABLE restaurant_tables (restaurant_id uuid NOT NULL REFERENCES restaurants(id), id uuid NOT NULL DEFAULT gen_random_uuid(), label text NOT NULL, capacity integer NOT NULL CHECK(capacity BETWEEN 1 AND 30), active boolean NOT NULL DEFAULT true, PRIMARY KEY(restaurant_id,id), UNIQUE(restaurant_id,label));
CREATE TABLE table_sessions (restaurant_id uuid NOT NULL, id uuid NOT NULL DEFAULT gen_random_uuid(), table_id uuid NOT NULL, token_hash text NOT NULL UNIQUE, waiter_user_id uuid, opened_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, closed_at timestamptz, PRIMARY KEY(restaurant_id,id), FOREIGN KEY(restaurant_id,table_id) REFERENCES restaurant_tables(restaurant_id,id), FOREIGN KEY(restaurant_id,waiter_user_id) REFERENCES staff(restaurant_id,user_id));
CREATE UNIQUE INDEX active_table_session ON table_sessions(restaurant_id,table_id) WHERE closed_at IS NULL;
ALTER TABLE orders ADD COLUMN table_session_id uuid;
ALTER TABLE orders ADD FOREIGN KEY(restaurant_id,table_session_id) REFERENCES table_sessions(restaurant_id,id);
CREATE TYPE waiter_request_kind AS ENUM ('waiter','bill');
CREATE TABLE waiter_requests (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), restaurant_id uuid NOT NULL, session_id uuid NOT NULL, kind waiter_request_kind NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), completed_at timestamptz, FOREIGN KEY(restaurant_id,session_id) REFERENCES table_sessions(restaurant_id,id));
CREATE UNIQUE INDEX pending_table_request ON waiter_requests(restaurant_id,session_id,kind) WHERE completed_at IS NULL;
