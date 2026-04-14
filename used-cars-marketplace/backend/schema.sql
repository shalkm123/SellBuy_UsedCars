CREATE DATABASE IF NOT EXISTS sellbuy_cars;
USE sellbuy_cars;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('buyer', 'seller', 'admin') DEFAULT 'buyer',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cars (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  fuel ENUM('Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG') NOT NULL,
  transmission ENUM('Manual', 'Automatic', 'CVT', 'DCT', 'AMT') NOT NULL,
  mileage DECIMAL(6, 2),
  km_driven INT DEFAULT 0,
  description TEXT,
  city VARCHAR(100),
  status ENUM('pending', 'approved', 'rejected', 'sold') DEFAULT 'pending',
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  car_id INT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_id INT NOT NULL,
  car_id INT NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'replied', 'closed') DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
