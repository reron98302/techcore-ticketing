-- TechCore IT Ticketing System
-- schema.sql - run this in MySQL Workbench or mysql CLI
-- Creates database, tables, and inserts test data

CREATE DATABASE IF NOT EXISTS techcore_ticketing;
USE techcore_ticketing;

-- ============================================================
-- TABLE: status
-- Lookup table for ticket statuses
-- ============================================================
CREATE TABLE IF NOT EXISTS status (
  status_id INT AUTO_INCREMENT PRIMARY KEY,
  status_name VARCHAR(50) NOT NULL
);

INSERT INTO status (status_name) VALUES
  ('Open'),
  ('In Progress'),
  ('Resolved'),
  ('Closed');

-- ============================================================
-- TABLE: users
-- Stores user accounts with hashed passwords and roles
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  role ENUM('user', 'it_staff', 'admin') NOT NULL DEFAULT 'user',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test users — all passwords: Password1!  (bcrypt rounds=10)
-- ES: using mga.edu emails to match the org context from our report
INSERT INTO users (username, password_hash, full_name, email, role) VALUES
  ('james.carter',     '$2b$10$5M5OId94DHeMTAVKy4uY/ee59UIm5QgcVzsIoW4Wjx1FNSt12J4.m', 'James Carter',     'james.carter@mga.edu',     'user'),
  ('sarah.wright',     '$2b$10$i6zt7BeO7ACdKZP933dvletsuXTiLs1KfVRe/x9pbzRHDLqi8lcX6', 'Sarah Wright',     'sarah.wright@mga.edu',     'user'),
  ('mike.t',           '$2b$10$S7lu/zsypA/N0vE/uTBraOeIeL4eCIhu7V1IJ1yRsFt39pXNLne4m', 'Mike Thompson',    'mike.t@mga.edu',           'it_staff'),
  ('admin',            '$2b$10$CPdAC8Fv8jFhpPqqj013n.yKmZUjcrsJ91e99rUMVOT9e0KB4EcKS', 'Admin Account',    'ithelp@mga.edu',           'admin'),
  ('david.chen',       '$2b$10$be8eKk9bllNgN8cwhSsuS.FHhapszvkk2cgtqSYVobzVGzJFBS/fi', 'David Chen',       'david.chen@mga.edu',       'user'),
  ('lisa.johnson',     '$2b$10$Xy422d/LdDR0jyJZQT419.K/cdXDqrbhg5hfCNrYUdyEMPTXkE0Ri', 'Lisa Johnson',     'lisa.johnson@mga.edu',     'user'),
  ('william.mauldin',  '$2b$10$0TCj8Mlm3oFS.IwsW3nZE.9zuMdcmYizbDxiPz1y1cGv9flvKj8cS', 'William Mauldin',  'william.mauldin@mga.edu',  'it_staff'),
  ('macy.mayoralgo',   '$2b$10$KI3p1TWBWCwDd/XbHSNJXeqIGEO3wIc8K1sHsywS2uD3A2/nfpMCO', 'Macy Mayoralgo',   'macy.mayoralgo@mga.edu',   'it_staff'),
  ('ronald.robertson', '$2b$10$MsY7uDtHrd8S0iLOwO1mu.hnNkJzUFgDI3GjP/xl3iGxuepS3t1/e', 'Ronald Robertson', 'ronald.robertson@mga.edu', 'it_staff'),
  ('timarco.ross',     '$2b$10$A.wpnMoT0I1OFhOLRLmzoeDY/nNe9tQcu7R83jlxyFodKVCUFkOIm', 'Timarco Ross',     'timarco.ross@mga.edu',     'it_staff'),
  ('erin.smith',       '$2b$10$4j19arNkcI98i4WhFBqxg.vBUHafS4JcilTj8CJzMDUOJanSs7Dh.', 'Erin Smith',       'erin.smith@mga.edu',       'it_staff');

-- ============================================================
-- TABLE: tickets
-- Main tickets table
-- ============================================================
CREATE TABLE IF NOT EXISTS tickets (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('Hardware', 'Software', 'Network', 'Account', 'Other') NOT NULL,
  priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  status_id INT NOT NULL DEFAULT 1,
  submitted_by INT NOT NULL,
  assigned_to INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (status_id) REFERENCES status(status_id),
  FOREIGN KEY (submitted_by) REFERENCES users(user_id),
  FOREIGN KEY (assigned_to) REFERENCES users(user_id)
);

-- Test tickets — using real MGA systems and locations for demo realism
INSERT INTO tickets (title, description, category, priority, status_id, submitted_by, assigned_to) VALUES
  ('eduroam WiFi not connecting on Macon campus', 'My laptop will not connect to eduroam since this morning. It keeps asking for credentials and then fails. Tried forgetting the network and reconnecting but same issue. Need this fixed before my online exam tomorrow.', 'Network', 'High', 1, 1, NULL),
  ('BannerWeb login error after password reset', 'After resetting my MGA password through the portal I am now getting an error when trying to log into BannerWeb. The page just says invalid credentials even though I can log into email fine with the new password.', 'Account', 'Critical', 2, 2, 3),
  ('Projector in CBT 120 won\'t display HDMI input', 'The ceiling projector in CBT 120 is not picking up the HDMI signal from the instructor podium. Tried two different laptops. The display just says no signal. Class is at 2pm so please prioritize.', 'Hardware', 'Medium', 3, 2, 3),
  ('D2L Brightspace quiz not submitting', 'I completed my quiz in D2L but when I hit submit it just spins and never confirms. Tried Chrome and Edge both. Not sure if my answers were saved. This is for ITEC 3270 due tonight.', 'Software', 'High', 1, 1, NULL),
  ('Microsoft Office expired on library computer A112', 'The computer labeled A112 in the Macon library is showing that Office 365 license has expired. Students are using this for printing assignments and it stopped working around 10am.', 'Software', 'Low', 4, 1, 3);

-- ============================================================
-- TABLE: logs
-- Tracks every action taken on a ticket
-- ============================================================
CREATE TABLE IF NOT EXISTS logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  note TEXT DEFAULT NULL,
  logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Test log entries
INSERT INTO logs (ticket_id, user_id, action) VALUES
  (1, 1, 'Ticket submitted'),
  (2, 2, 'Ticket submitted'),
  (2, 3, 'Ticket assigned to Mike Thompson'),
  (2, 3, 'Status changed to In Progress'),
  (3, 2, 'Ticket submitted'),
  (3, 3, 'Ticket assigned to Mike Thompson'),
  (3, 3, 'Status changed to Resolved'),
  (4, 1, 'Ticket submitted'),
  (5, 1, 'Ticket submitted'),
  (5, 3, 'Ticket assigned to Mike Thompson'),
  (5, 3, 'Status changed to Closed');
