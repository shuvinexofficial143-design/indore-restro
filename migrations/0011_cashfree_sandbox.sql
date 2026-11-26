CREATE TABLE sandbox_gateway_orders (
 restaurant_id uuid NOT NULL,
 invoice_id uuid NOT NULL,
 merchant_order_id text NOT NULL UNIQUE,
 amount_paise integer NOT NULL CHECK(amount_paise>=100 AND amount_paise<=1000000),
 payment_session_id text,
 verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(restaurant_id,invoice_id),
 FOREIGN KEY(restaurant_id,invoice_id) REFERENCES invoices(restaurant_id,id)
);
