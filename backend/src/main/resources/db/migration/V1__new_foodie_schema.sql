CREATE TABLE nf_users (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 role VARCHAR(20) NOT NULL,
 first_name VARCHAR(80),
 last_name VARCHAR(80),
 national_id VARCHAR(20) UNIQUE,
 email VARCHAR(150) UNIQUE,
 phone VARCHAR(30) UNIQUE,
 password_hash VARCHAR(255),
 address1 VARCHAR(255),
 address2 VARCHAR(255),
 address3 VARCHAR(255),
 city VARCHAR(120),
 postal_code VARCHAR(20),
 approval_status VARCHAR(20),
 active BOOLEAN NOT NULL,
 email_verified BOOLEAN NOT NULL,
 submitted BOOLEAN NOT NULL,
 vehicle VARCHAR(80),
 plate VARCHAR(40),
 area VARCHAR(120),
 verification_hash VARCHAR(64),
 verification_expires TIMESTAMP(6),
 created_at TIMESTAMP(6)
);

CREATE TABLE nf_restaurants (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 owner_id BIGINT,
 name VARCHAR(150),
 address VARCHAR(500),
 phone VARCHAR(30),
 location VARCHAR(120),
 cuisine VARCHAR(120),
 description VARCHAR(1000),
 logo_image TEXT,
 banner_image TEXT,
 open BOOLEAN NOT NULL,
 delivery BOOLEAN NOT NULL,
 pickup BOOLEAN NOT NULL
);

CREATE TABLE nf_menu_items (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 restaurant_id BIGINT,
 name VARCHAR(150),
 category VARCHAR(100),
 description VARCHAR(1000),
 image LONGTEXT,
 price DECIMAL(14,2),
 available BOOLEAN NOT NULL,
 sizes_enabled BOOLEAN NOT NULL,
 zoom DECIMAL(8,2),
 focal_x DECIMAL(8,2),
 focal_y DECIMAL(8,2)
);

CREATE TABLE nf_menu_sizes (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 item_id BIGINT,
 name VARCHAR(20),
 price DECIMAL(14,2),
 selected BOOLEAN NOT NULL
);

CREATE TABLE nf_orders (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 customer_id BIGINT,
 restaurant_id BIGINT,
 type VARCHAR(20),
 status VARCHAR(30),
 payment_method VARCHAR(30),
 payment_status VARCHAR(30),
 delivery_address VARCHAR(1000),
 subtotal DECIMAL(14,2),
 delivery_fee DECIMAL(14,2),
 discount DECIMAL(14,2),
 total DECIMAL(14,2),
 additional_charge DECIMAL(14,2),
 customer_agreed BOOLEAN NOT NULL,
 request_key VARCHAR(80) UNIQUE,
 created_at TIMESTAMP(6)
);

CREATE TABLE nf_order_lines (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 order_id BIGINT,
 menu_item_id BIGINT,
 name VARCHAR(150),
 size VARCHAR(20),
 quantity INTEGER NOT NULL,
 unit_price DECIMAL(14,2)
);

CREATE TABLE nf_deliveries (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 order_id BIGINT UNIQUE,
 rider_id BIGINT,
 status VARCHAR(30),
 assigned_at TIMESTAMP(6),
 completed_at TIMESTAMP(6)
);

CREATE TABLE nf_payments (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 order_id BIGINT UNIQUE,
 method VARCHAR(30),
 status VARCHAR(30),
 amount DECIMAL(14,2),
 commission DECIMAL(14,2),
 collected_by BIGINT,
 collected_at TIMESTAMP(6)
);

CREATE TABLE nf_bank_accounts (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 owner_id BIGINT,
 bank VARCHAR(120),
 name VARCHAR(120),
 number_encrypted VARCHAR(1000),
 last_four VARCHAR(4),
 branch VARCHAR(120),
 primary_account BOOLEAN NOT NULL
);

CREATE TABLE nf_payouts (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 owner_id BIGINT,
 bank_account_id BIGINT,
 bank_name VARCHAR(120),
 amount DECIMAL(14,2),
 status VARCHAR(30),
 request_key VARCHAR(80) UNIQUE,
 settlement_reference VARCHAR(150),
 reviewed_by BIGINT,
 updated_at TIMESTAMP(6)
);

CREATE TABLE nf_reviews (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 order_id BIGINT UNIQUE,
 customer_id BIGINT,
 restaurant_id BIGINT,
 rating INTEGER NOT NULL,
 comment VARCHAR(1000),
 hidden BOOLEAN NOT NULL
);

CREATE TABLE nf_offers (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 restaurant_id BIGINT,
 menu_item_id BIGINT,
 title VARCHAR(150),
 code VARCHAR(24) UNIQUE,
 description VARCHAR(1000),
 discount_type VARCHAR(30),
 discount_value DECIMAL(14,2),
 start_date DATE,
 end_date DATE,
 enabled BOOLEAN NOT NULL,
 published BOOLEAN NOT NULL
);

CREATE TABLE nf_complaints (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 user_id BIGINT,
 subject VARCHAR(200),
 description VARCHAR(2000),
 response VARCHAR(2000),
 status VARCHAR(20),
 created_at TIMESTAMP(6)
);

CREATE TABLE nf_notifications (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 user_id BIGINT,
 title VARCHAR(200),
 text VARCHAR(2000),
 destination VARCHAR(80),
 email_status VARCHAR(20),
 created_at TIMESTAMP(6)
);

CREATE TABLE nf_documents (
 id BIGINT AUTO_INCREMENT PRIMARY KEY,
 version BIGINT NOT NULL DEFAULT 0,
 user_id BIGINT,
 kind VARCHAR(40),
 media_type VARCHAR(80),
 content LONGBLOB
);

ALTER TABLE nf_restaurants ADD FOREIGN KEY (owner_id) REFERENCES nf_users(id);

ALTER TABLE nf_menu_items ADD FOREIGN KEY (restaurant_id) REFERENCES nf_restaurants(id);

ALTER TABLE nf_menu_sizes ADD FOREIGN KEY (item_id) REFERENCES nf_menu_items(id);

ALTER TABLE nf_orders ADD FOREIGN KEY (customer_id) REFERENCES nf_users(id);

ALTER TABLE nf_orders ADD FOREIGN KEY (restaurant_id) REFERENCES nf_restaurants(id);

ALTER TABLE nf_order_lines ADD FOREIGN KEY (order_id) REFERENCES nf_orders(id);

ALTER TABLE nf_order_lines ADD FOREIGN KEY (menu_item_id) REFERENCES nf_menu_items(id);

ALTER TABLE nf_deliveries ADD FOREIGN KEY (order_id) REFERENCES nf_orders(id);

ALTER TABLE nf_deliveries ADD FOREIGN KEY (rider_id) REFERENCES nf_users(id);

ALTER TABLE nf_payments ADD FOREIGN KEY (order_id) REFERENCES nf_orders(id);

ALTER TABLE nf_payments ADD FOREIGN KEY (collected_by) REFERENCES nf_users(id);

ALTER TABLE nf_bank_accounts ADD FOREIGN KEY (owner_id) REFERENCES nf_users(id);

ALTER TABLE nf_payouts ADD FOREIGN KEY (owner_id) REFERENCES nf_users(id);

ALTER TABLE nf_payouts ADD FOREIGN KEY (bank_account_id) REFERENCES nf_bank_accounts(id);

ALTER TABLE nf_payouts ADD FOREIGN KEY (reviewed_by) REFERENCES nf_users(id);

ALTER TABLE nf_reviews ADD FOREIGN KEY (order_id) REFERENCES nf_orders(id);

ALTER TABLE nf_reviews ADD FOREIGN KEY (customer_id) REFERENCES nf_users(id);

ALTER TABLE nf_reviews ADD FOREIGN KEY (restaurant_id) REFERENCES nf_restaurants(id);

ALTER TABLE nf_offers ADD FOREIGN KEY (restaurant_id) REFERENCES nf_restaurants(id);

ALTER TABLE nf_offers ADD FOREIGN KEY (menu_item_id) REFERENCES nf_menu_items(id);

ALTER TABLE nf_complaints ADD FOREIGN KEY (user_id) REFERENCES nf_users(id);

ALTER TABLE nf_notifications ADD FOREIGN KEY (user_id) REFERENCES nf_users(id);

ALTER TABLE nf_documents ADD FOREIGN KEY (user_id) REFERENCES nf_users(id);

ALTER TABLE nf_documents ADD UNIQUE(user_id,kind);

ALTER TABLE nf_menu_sizes ADD UNIQUE(item_id,name);

CREATE TABLE nf_notification_reads (notification_id BIGINT NOT NULL,user_id BIGINT NOT NULL,PRIMARY KEY(notification_id,user_id),FOREIGN KEY(notification_id) REFERENCES nf_notifications(id),FOREIGN KEY(user_id) REFERENCES nf_users(id));