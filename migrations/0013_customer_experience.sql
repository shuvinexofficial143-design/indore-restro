CREATE TABLE customer_favorites (
 restaurant_id uuid NOT NULL,
 customer_id uuid NOT NULL,
 menu_id text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(restaurant_id,customer_id,menu_id),
 FOREIGN KEY(restaurant_id,customer_id) REFERENCES customers(restaurant_id,id),
 FOREIGN KEY(restaurant_id,menu_id) REFERENCES menu_items(restaurant_id,id)
);
CREATE TABLE customer_feedback (
 restaurant_id uuid NOT NULL,
 order_id uuid NOT NULL,
 customer_id uuid NOT NULL,
 rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5),
 comment text NOT NULL DEFAULT '',
 consent boolean NOT NULL CHECK(consent),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(restaurant_id,order_id),
 FOREIGN KEY(restaurant_id,order_id) REFERENCES orders(restaurant_id,id),
 FOREIGN KEY(restaurant_id,customer_id) REFERENCES customers(restaurant_id,id)
);
