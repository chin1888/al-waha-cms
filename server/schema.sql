-- =============================================
-- AL-WAHA CMS Database Schema (MySQL 8.0)
-- Database name is set in db.js via connection config
-- =============================================

-- ===== CMS Settings (key-value, all page content) =====
CREATE TABLE IF NOT EXISTS settings (
  `key`   VARCHAR(100) PRIMARY KEY,
  `value` TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== Products =====
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  series      VARCHAR(100) DEFAULT 'Gear',
  category    VARCHAR(100) DEFAULT 'Disposable',
  description TEXT,
  detail_content TEXT,
  image       VARCHAR(500) DEFAULT '',        -- file path or URL
  images      JSON DEFAULT NULL,              -- array of extra image paths
  specs       JSON DEFAULT NULL,              -- {"puffs":"5000","nicotine":"5%","battery":"650mAh","coil":"Mesh","capacity":"12ml","charging":"Type-C"}
  flavors     JSON DEFAULT NULL,              -- ["Mango Ice","Blue Razz",...]
  features    JSON DEFAULT NULL,              -- ["LED Indicator","Mesh Coil",...]
  video       VARCHAR(500) DEFAULT '',
  verified    VARCHAR(500) DEFAULT '',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== News =====
CREATE TABLE IF NOT EXISTS news (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(300) NOT NULL,
  category    VARCHAR(100) DEFAULT 'Company',
  summary     TEXT,
  content     TEXT,
  image       VARCHAR(500) DEFAULT '',
  video       VARCHAR(500) DEFAULT '',
  author      VARCHAR(100) DEFAULT 'AL-WAHA',
  published   TINYINT(1) DEFAULT 1,
  sort_order  INT DEFAULT 0,
  date        DATE DEFAULT NULL,
  icon        VARCHAR(10) DEFAULT '',
  gradient    VARCHAR(100) DEFAULT '',
  excerpt     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== Hero Carousel =====
CREATE TABLE IF NOT EXISTS carousel (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  image       VARCHAR(500) NOT NULL,
  title       VARCHAR(200) DEFAULT '',
  link        VARCHAR(300) DEFAULT '',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== Media Library =====
CREATE TABLE IF NOT EXISTS media (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  filename    VARCHAR(300) NOT NULL,
  filepath    VARCHAR(500) NOT NULL,
  filetype    VARCHAR(20) DEFAULT 'image',    -- image | video
  filesize    BIGINT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== About Timeline =====
CREATE TABLE IF NOT EXISTS timeline (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  year        VARCHAR(20) NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  image       VARCHAR(500) DEFAULT '',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== Orders =====
CREATE TABLE IF NOT EXISTS orders (
  id          VARCHAR(50) PRIMARY KEY,
  customer    VARCHAR(200) NOT NULL,
  email       VARCHAR(200) DEFAULT '',
  product     VARCHAR(200) NOT NULL,
  quantity    INT DEFAULT 1,
  total       DECIMAL(10,2) DEFAULT 0,
  status      VARCHAR(50) DEFAULT 'pending',  -- pending|processing|shipped|completed
  date        DATE NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== Users =====
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(200) NOT NULL UNIQUE,
  phone       VARCHAR(50) DEFAULT '',
  city        VARCHAR(100) DEFAULT '',
  role        VARCHAR(50) DEFAULT 'customer', -- customer|vip|admin
  status      VARCHAR(30) DEFAULT 'active',   -- active|inactive
  total_spent DECIMAL(10,2) DEFAULT 0,
  orders_count INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== Background Image =====
CREATE TABLE IF NOT EXISTS bg_image (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  page        VARCHAR(50) NOT NULL,           -- home|products|about|news|contact
  image       VARCHAR(500) NOT NULL,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== Featured Videos =====
CREATE TABLE IF NOT EXISTS featured_videos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(300) NOT NULL,
  description TEXT,
  video_url   VARCHAR(500) NOT NULL,
  thumbnail   VARCHAR(500) DEFAULT '',
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Contact Submissions =====
CREATE TABLE IF NOT EXISTS contact_submissions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  email       VARCHAR(300) NOT NULL,
  phone       VARCHAR(100) DEFAULT '',
  country     VARCHAR(100) DEFAULT '',
  message     TEXT NOT NULL,
  is_read     TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Collage Photos =====
CREATE TABLE IF NOT EXISTS collage_photos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  image       VARCHAR(500) NOT NULL,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ===== Insert default CMS settings =====
INSERT INTO settings (`key`, `value`) VALUES
('global.siteName', 'AL-WAHA'),
('global.siteSlogan', 'Make Joy Happen'),
('global.logoText', 'AL-WAHA'),
('global.footerDesc', 'AL-WAHA is an international vape brand devoted to accelerating the world''s transition to a smoking-free place. Make Joy Happen.'),
('global.footerCopy', '© 2026 AL-WAHA. All rights reserved.'),
('home._heroTitle', 'Discover the Future'),
('home._heroSubtitle', 'Premium vaping experience redefined. Explore our next-generation disposable vape devices.'),
('home._heroBtnText', 'Explore Products'),
('home._featuredTitle', 'Featured Products'),
('about._heroTitle', 'About<br>AL-WAHA'),
('about._heroSubtitle', 'Our story, mission, and the team behind the brand.'),
('about._missionTitle', 'Our Mission'),
('about._missionText', 'To provide adult smokers with premium, innovative alternatives through cutting-edge vape technology.'),
('about._visionTitle', 'Our Vision'),
('about._visionText', 'A smoke-free world where technology empowers healthier lifestyle choices.'),
('about._valuesTitle', 'Our Core Values'),
('products._title', 'Our Products'),
('news._title', 'News & Updates'),
('contact._title', 'Get in Touch'),
('contact._heroTitle', 'Contact Us'),
('contact._heroSubtitle', 'We''d love to hear from you. Reach out and let''s talk.')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- ===== Insert default carousel speed =====
INSERT INTO settings (`key`, `value`) VALUES
('home._heroSlideSpeed', '5000')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
