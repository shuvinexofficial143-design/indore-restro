ALTER TABLE restaurant_tables ADD COLUMN floor text NOT NULL DEFAULT 'Main floor';
ALTER TABLE restaurant_tables ADD COLUMN cleaning boolean NOT NULL DEFAULT false;
CREATE TABLE suppliers (
 restaurant_id uuid NOT NULL REFERENCES restaurants(id),
 id uuid NOT NULL DEFAULT gen_random_uuid(),
 name text NOT NULL,
 notes text NOT NULL DEFAULT '',
 active boolean NOT NULL DEFAULT true,
 PRIMARY KEY(restaurant_id,id),
 UNIQUE(restaurant_id,name)
);
ALTER TABLE inventory_transactions ADD COLUMN supplier_id uuid;
ALTER TABLE inventory_transactions ADD COLUMN purchase_cost_paise integer CHECK(purchase_cost_paise>=0);
ALTER TABLE inventory_transactions ADD FOREIGN KEY(restaurant_id,supplier_id) REFERENCES suppliers(restaurant_id,id);
