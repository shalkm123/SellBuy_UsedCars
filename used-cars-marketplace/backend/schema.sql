CREATE DATABASE IF NOT EXISTS sellbuy_cars;
USE sellbuy_cars;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  aadhaar_encrypted TEXT NOT NULL,
  age INT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  role ENUM('BUYER', 'SELLER', 'ADMIN') NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE seller_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  business_name VARCHAR(150) NULL,
  bio TEXT NULL,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_listings INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_seller_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE buyer_profiles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  preferred_budget_min DECIMAL(12,2) NULL,
  preferred_budget_max DECIMAL(12,2) NULL,
  preferred_location VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_buyer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cars (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  seller_id BIGINT NOT NULL,
  title VARCHAR(200) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model_name VARCHAR(100) NOT NULL,
  variant VARCHAR(100) NULL,
  manufacturing_year INT NOT NULL,
  car_age_years INT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
car_condition ENUM('NEW', 'GOOD', 'MODERATE') NOT NULL,
  kilometers_driven INT NOT NULL,
  transmission ENUM('MANUAL', 'AUTOMATIC') NOT NULL,
  fuel_type ENUM('PETROL', 'DIESEL', 'CNG', 'EV', 'HYBRID') NOT NULL,
  color VARCHAR(50) NOT NULL,
  location_city VARCHAR(100) NOT NULL,
  location_state VARCHAR(100) NOT NULL,
  ownership ENUM('FIRST', 'SECOND', 'THIRD_PLUS') NOT NULL,
  seats INT NOT NULL,
  description TEXT,
  status ENUM('DRAFT', 'ACTIVE', 'SOLD', 'INACTIVE', 'UNDER_REVIEW') NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE,
  trust_score INT NULL,
  trust_band ENUM('LOW', 'MEDIUM', 'HIGH', 'PENDING') DEFAULT 'PENDING',
  trust_updated_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT fk_cars_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE car_images (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  car_id BIGINT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  public_id VARCHAR(255) NOT NULL,
  sort_order INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_car_images_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE wishlists (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  buyer_id BIGINT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlists_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE wishlist_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  wishlist_id BIGINT NOT NULL,
  car_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_wishlist_items_wishlist FOREIGN KEY (wishlist_id) REFERENCES wishlists(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_items_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  UNIQUE KEY uq_wishlist_car (wishlist_id, car_id)
);

CREATE TABLE compare_lists (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_compare_lists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE compare_list_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  compare_list_id BIGINT NOT NULL,
  car_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_compare_items_list FOREIGN KEY (compare_list_id) REFERENCES compare_lists(id) ON DELETE CASCADE,
  CONSTRAINT fk_compare_items_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  UNIQUE KEY uq_compare_list_car (compare_list_id, car_id)
);

CREATE TABLE orders (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  buyer_id BIGINT NOT NULL,
  car_id BIGINT NOT NULL UNIQUE,
  seller_id BIGINT NOT NULL,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL,
  payment_status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT NOT NULL UNIQUE,
  razorpay_order_id VARCHAR(100) NOT NULL,
  razorpay_payment_id VARCHAR(100) NULL,
  razorpay_signature VARCHAR(255) NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  status ENUM('CREATED', 'SUCCESS', 'FAILED', 'VERIFIED', 'REFUNDED') NOT NULL,
  payment_method VARCHAR(50) NULL,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE seller_verification (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL UNIQUE,
  aadhaar_last4 VARCHAR(4) NOT NULL,
  verification_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL,
  verified_at TIMESTAMP NULL,
  remarks TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_seller_verification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE inquiries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  buyer_id BIGINT NOT NULL,
  car_id BIGINT NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'replied', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inquiries_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_inquiries_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE chat_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(160) NOT NULL DEFAULT 'CarBot Session',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP NULL,
  CONSTRAINT fk_chat_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE chat_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id BIGINT NOT NULL,
  role ENUM('USER', 'BOT', 'SYSTEM') NOT NULL,
  content TEXT NOT NULL,
  parsed_filters_json JSON NULL,
  recommendations_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_messages_session FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

CREATE TABLE car_emi_quotes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  car_id BIGINT NOT NULL UNIQUE,
  principal DECIMAL(12,2) NOT NULL,
  annual_interest_rate DECIMAL(5,2) NOT NULL,
  tenure_months INT NOT NULL,
  monthly_emi DECIMAL(12,2) NOT NULL,
  total_interest DECIMAL(12,2) NOT NULL,
  total_payable DECIMAL(12,2) NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_emi_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE trust_score_jobs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  car_id BIGINT NOT NULL,
  reason ENUM('CAR_CREATED', 'CAR_UPDATED', 'SELLER_VERIFICATION_UPDATED', 'MANUAL_RECOMPUTE') NOT NULL,
  status ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  attempts INT NOT NULL DEFAULT 0,
  error_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  CONSTRAINT fk_trust_jobs_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE car_trust_factors (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  car_id BIGINT NOT NULL,
  factor_key VARCHAR(100) NOT NULL,
  factor_label VARCHAR(120) NOT NULL,
  factor_value VARCHAR(255) NULL,
  impact_score INT NOT NULL,
  explanation VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_trust_factors_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE bidding_config (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  car_id BIGINT NOT NULL UNIQUE,
  is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  min_increment DECIMAL(12,2) NOT NULL DEFAULT 5000.00,
  end_time TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bidding_config_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE car_bids (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  car_id BIGINT NOT NULL,
  bidder_id BIGINT NOT NULL,
  bid_amount DECIMAL(12,2) NOT NULL,
  status ENUM('PLACED', 'OUTBID', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PLACED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_car_bids_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  CONSTRAINT fk_car_bids_bidder FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE admin_settings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(120) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description VARCHAR(255) NULL,
  updated_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_settings_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE admin_audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  actor_user_id BIGINT NULL,
  action_type VARCHAR(120) NOT NULL,
  target_type VARCHAR(60) NOT NULL,
  target_id BIGINT NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_cars_listing_search
ON cars(status, location_city, price, transmission, fuel_type);

CREATE INDEX idx_cars_filtering
ON cars(status, location_city, model_name, price, car_age_years, kilometers_driven);

CREATE INDEX idx_trust_jobs_status_created
ON trust_score_jobs(status, created_at);

CREATE INDEX idx_chat_sessions_user_updated
ON chat_sessions(user_id, updated_at DESC);

CREATE INDEX idx_chat_messages_session_created
ON chat_messages(session_id, created_at ASC);

CREATE INDEX idx_trust_factors_car
ON car_trust_factors(car_id);

CREATE INDEX idx_car_bids_car_created
ON car_bids(car_id, created_at DESC);

CREATE INDEX idx_car_bids_car_status_amount
ON car_bids(car_id, status, bid_amount DESC);

CREATE INDEX idx_admin_audit_created
ON admin_audit_logs(created_at DESC);

DELIMITER $$

CREATE TRIGGER trg_cars_after_insert_emi
AFTER INSERT ON cars
FOR EACH ROW
BEGIN
  DECLARE principal_value DECIMAL(12,2);
  DECLARE rate_monthly DECIMAL(18,10);
  DECLARE tenure_value INT;
  DECLARE emi_value DECIMAL(12,2);
  DECLARE total_payable_value DECIMAL(12,2);
  DECLARE total_interest_value DECIMAL(12,2);

  SET principal_value = ROUND(NEW.price * 0.80, 2);
  SET rate_monthly = 0.095 / 12;
  SET tenure_value = 60;
  SET emi_value = ROUND((principal_value * rate_monthly * POW(1 + rate_monthly, tenure_value)) /
    (POW(1 + rate_monthly, tenure_value) - 1), 2);
  SET total_payable_value = ROUND(emi_value * tenure_value, 2);
  SET total_interest_value = ROUND(total_payable_value - principal_value, 2);

  INSERT INTO car_emi_quotes (
    car_id,
    principal,
    annual_interest_rate,
    tenure_months,
    monthly_emi,
    total_interest,
    total_payable
  ) VALUES (
    NEW.id,
    principal_value,
    9.50,
    tenure_value,
    emi_value,
    total_interest_value,
    total_payable_value
  )
  ON DUPLICATE KEY UPDATE
    principal = VALUES(principal),
    annual_interest_rate = VALUES(annual_interest_rate),
    tenure_months = VALUES(tenure_months),
    monthly_emi = VALUES(monthly_emi),
    total_interest = VALUES(total_interest),
    total_payable = VALUES(total_payable),
    calculated_at = CURRENT_TIMESTAMP;
END$$

CREATE TRIGGER trg_cars_after_update_emi
AFTER UPDATE ON cars
FOR EACH ROW
BEGIN
  DECLARE principal_value DECIMAL(12,2);
  DECLARE rate_monthly DECIMAL(18,10);
  DECLARE tenure_value INT;
  DECLARE emi_value DECIMAL(12,2);
  DECLARE total_payable_value DECIMAL(12,2);
  DECLARE total_interest_value DECIMAL(12,2);

  IF NEW.price <> OLD.price THEN
    SET principal_value = ROUND(NEW.price * 0.80, 2);
    SET rate_monthly = 0.095 / 12;
    SET tenure_value = 60;
    SET emi_value = ROUND((principal_value * rate_monthly * POW(1 + rate_monthly, tenure_value)) /
      (POW(1 + rate_monthly, tenure_value) - 1), 2);
    SET total_payable_value = ROUND(emi_value * tenure_value, 2);
    SET total_interest_value = ROUND(total_payable_value - principal_value, 2);

    INSERT INTO car_emi_quotes (
      car_id,
      principal,
      annual_interest_rate,
      tenure_months,
      monthly_emi,
      total_interest,
      total_payable
    ) VALUES (
      NEW.id,
      principal_value,
      9.50,
      tenure_value,
      emi_value,
      total_interest_value,
      total_payable_value
    )
    ON DUPLICATE KEY UPDATE
      principal = VALUES(principal),
      annual_interest_rate = VALUES(annual_interest_rate),
      tenure_months = VALUES(tenure_months),
      monthly_emi = VALUES(monthly_emi),
      total_interest = VALUES(total_interest),
      total_payable = VALUES(total_payable),
      calculated_at = CURRENT_TIMESTAMP;
  END IF;
END$$

DROP PROCEDURE IF EXISTS sp_calculate_car_trust_score$$
CREATE PROCEDURE sp_calculate_car_trust_score(IN p_car_id BIGINT)
BEGIN
  DECLARE v_score INT DEFAULT 20;
  DECLARE v_year INT;
  DECLARE v_km INT;
  DECLARE v_price DECIMAL(12,2);
  DECLARE v_condition VARCHAR(20);
  DECLARE v_ownership VARCHAR(20);
  DECLARE v_status VARCHAR(20);
  DECLARE v_verified BOOLEAN DEFAULT FALSE;
  DECLARE v_images INT DEFAULT 0;

  SELECT c.manufacturing_year,
         c.kilometers_driven,
         c.price,
         c.car_condition,
         c.ownership,
         c.status,
         COALESCE(u.is_verified, FALSE)
  INTO v_year, v_km, v_price, v_condition, v_ownership, v_status, v_verified
  FROM cars c
  JOIN users u ON u.id = c.seller_id
  WHERE c.id = p_car_id
  LIMIT 1;

  IF v_status IS NULL THEN
    SET v_score = NULL;
  ELSE
    IF v_status = 'ACTIVE' THEN
      SET v_score = v_score + 10;
    ELSEIF v_status = 'UNDER_REVIEW' THEN
      SET v_score = v_score + 5;
    END IF;

    IF v_verified THEN
      SET v_score = v_score + 20;
    END IF;

    IF v_condition = 'NEW' THEN
      SET v_score = v_score + 20;
    ELSEIF v_condition = 'GOOD' THEN
      SET v_score = v_score + 15;
    ELSE
      SET v_score = v_score + 8;
    END IF;

    IF v_ownership = 'FIRST' THEN
      SET v_score = v_score + 10;
    ELSEIF v_ownership = 'SECOND' THEN
      SET v_score = v_score + 6;
    ELSE
      SET v_score = v_score + 2;
    END IF;

    IF v_year >= YEAR(CURDATE()) - 3 THEN
      SET v_score = v_score + 15;
    ELSEIF v_year >= YEAR(CURDATE()) - 6 THEN
      SET v_score = v_score + 10;
    ELSE
      SET v_score = v_score + 5;
    END IF;

    IF v_km <= 40000 THEN
      SET v_score = v_score + 15;
    ELSEIF v_km <= 80000 THEN
      SET v_score = v_score + 10;
    ELSE
      SET v_score = v_score + 5;
    END IF;

    IF v_price BETWEEN 100000 AND 5000000 THEN
      SET v_score = v_score + 10;
    ELSE
      SET v_score = v_score + 5;
    END IF;

    SELECT COUNT(*) INTO v_images
    FROM car_images
    WHERE car_id = p_car_id;

    IF v_images >= 5 THEN
      SET v_score = v_score + 10;
    ELSEIF v_images >= 2 THEN
      SET v_score = v_score + 6;
    ELSEIF v_images >= 1 THEN
      SET v_score = v_score + 3;
    END IF;

    IF v_score > 100 THEN
      SET v_score = 100;
    END IF;

    IF v_score < 0 THEN
      SET v_score = 0;
    END IF;
  END IF;

  UPDATE cars
  SET trust_score = v_score,
      trust_band = CASE
        WHEN v_score >= 70 THEN 'HIGH'
        WHEN v_score >= 40 THEN 'MEDIUM'
        WHEN v_score IS NULL THEN 'PENDING'
        ELSE 'LOW'
      END,
      trust_updated_at = CURRENT_TIMESTAMP
  WHERE id = p_car_id;
END$$

CREATE TRIGGER trg_cars_after_insert_trust_job
AFTER INSERT ON cars
FOR EACH ROW
BEGIN
  INSERT INTO trust_score_jobs (car_id, reason, status)
  VALUES (NEW.id, 'CAR_CREATED', 'PENDING');
END$$

CREATE TRIGGER trg_cars_after_update_trust_job
AFTER UPDATE ON cars
FOR EACH ROW
BEGIN
  IF NEW.title <> OLD.title
    OR NEW.price <> OLD.price
    OR NEW.kilometers_driven <> OLD.kilometers_driven
    OR NEW.ownership <> OLD.ownership
    OR NEW.manufacturing_year <> OLD.manufacturing_year
    OR NEW.car_condition <> OLD.car_condition
    OR NEW.status <> OLD.status
  THEN
    INSERT INTO trust_score_jobs (car_id, reason, status)
    VALUES (NEW.id, 'CAR_UPDATED', 'PENDING');
  END IF;
END$$

CREATE TRIGGER trg_seller_verification_after_update_trust_job
AFTER UPDATE ON seller_verification
FOR EACH ROW
BEGIN
  IF NEW.verification_status <> OLD.verification_status THEN
    INSERT INTO trust_score_jobs (car_id, reason, status)
    SELECT c.id, 'SELLER_VERIFICATION_UPDATED', 'PENDING'
    FROM cars c
    WHERE c.seller_id = NEW.user_id
      AND c.deleted_at IS NULL;
  END IF;
END$$

DELIMITER ;
