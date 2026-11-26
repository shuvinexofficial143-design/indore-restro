ALTER TABLE menu_items ADD COLUMN sort_order integer NOT NULL DEFAULT 0 CHECK(sort_order BETWEEN 0 AND 9999), ADD COLUMN special boolean NOT NULL DEFAULT false;
ALTER TABLE order_items ADD COLUMN ready_at timestamptz, ADD COLUMN ready_by uuid;
ALTER TABLE order_items ADD FOREIGN KEY(restaurant_id,ready_by) REFERENCES staff(restaurant_id,user_id);
