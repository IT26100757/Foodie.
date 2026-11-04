ALTER TABLE nf_users ADD COLUMN pending_email VARCHAR(255);
ALTER TABLE nf_users ADD COLUMN pending_email_hash VARCHAR(255);
ALTER TABLE nf_users ADD COLUMN pending_email_expires TIMESTAMP(6);
CREATE TABLE nf_refunds (id BIGINT AUTO_INCREMENT PRIMARY KEY,version BIGINT NOT NULL DEFAULT 0,order_id BIGINT NOT NULL UNIQUE,customer_id BIGINT NOT NULL,reason VARCHAR(500),message VARCHAR(2000),status VARCHAR(25),requested_at TIMESTAMP(6),settlement_reference VARCHAR(150),FOREIGN KEY(order_id) REFERENCES nf_orders(id),FOREIGN KEY(customer_id) REFERENCES nf_users(id));
