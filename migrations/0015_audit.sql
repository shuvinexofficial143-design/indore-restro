CREATE TABLE audit_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 restaurant_id uuid NOT NULL REFERENCES restaurants(id),
 actor_user_id uuid NOT NULL,
 action text NOT NULL,
 target text NOT NULL,
 detail text NOT NULL DEFAULT '',
 occurred_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(restaurant_id, actor_user_id) REFERENCES staff(restaurant_id,user_id)
);
CREATE INDEX audit_logs_restaurant_time ON audit_logs(restaurant_id, occurred_at DESC);
