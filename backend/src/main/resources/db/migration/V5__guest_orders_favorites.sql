ALTER TABLE nf_orders ADD COLUMN contact_name VARCHAR(160);
ALTER TABLE nf_orders ADD COLUMN contact_email VARCHAR(150);
ALTER TABLE nf_orders ADD COLUMN contact_phone VARCHAR(30);
ALTER TABLE nf_orders ADD COLUMN guest_access_hash VARCHAR(64);
CREATE TABLE nf_favorites (id BIGINT AUTO_INCREMENT PRIMARY KEY,version BIGINT NOT NULL DEFAULT 0,user_id BIGINT NOT NULL,restaurant_id BIGINT NOT NULL,UNIQUE(user_id,restaurant_id),FOREIGN KEY(user_id) REFERENCES nf_users(id),FOREIGN KEY(restaurant_id) REFERENCES nf_restaurants(id));
