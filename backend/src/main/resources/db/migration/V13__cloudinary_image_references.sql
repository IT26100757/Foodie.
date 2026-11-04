ALTER TABLE nf_restaurants ADD COLUMN logo_public_id VARCHAR(255);
ALTER TABLE nf_restaurants ADD COLUMN banner_public_id VARCHAR(255);
ALTER TABLE nf_menu_items ADD COLUMN image_public_id VARCHAR(255);
ALTER TABLE nf_users ADD COLUMN photo_public_id VARCHAR(255);
