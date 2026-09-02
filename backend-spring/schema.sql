CREATE DATABASE IF NOT EXISTS edu_online CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edu_online;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar TEXT,
  role ENUM('student', 'admin', 'instructor') NOT NULL DEFAULT 'student',
  joined_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS instructors (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar TEXT,
  bio TEXT,
  specialty VARCHAR(512),
  rating DECIMAL(3,1) NOT NULL DEFAULT 0,
  students INT NOT NULL DEFAULT 0,
  experience VARCHAR(64)
);

CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  description TEXT,
  short_desc VARCHAR(512),
  instructor_id VARCHAR(64) NOT NULL,
  price INT NOT NULL DEFAULT 0,
  discount_price INT NULL,
  thumbnail TEXT,
  category VARCHAR(64) NOT NULL,
  level VARCHAR(32) NOT NULL,
  duration VARCHAR(32),
  total_lessons INT NOT NULL DEFAULT 0,
  rating DECIMAL(3,1) NOT NULL DEFAULT 0,
  total_students INT NOT NULL DEFAULT 0,
  language VARCHAR(32),
  tags JSON,
  chapters JSON NOT NULL,
  reviews JSON,
  requirements JSON,
  objectives JSON,
  last_updated DATE,
  certificate TINYINT(1) NOT NULL DEFAULT 1,
  FOREIGN KEY (instructor_id) REFERENCES instructors(id)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  enrolled_date DATE NOT NULL,
  completed_lessons JSON NOT NULL,
  last_accessed_lesson VARCHAR(64) NOT NULL DEFAULT '',
  completed TINYINT(1) NOT NULL DEFAULT 0,
  completed_date DATE NULL,
  grade INT NULL,
  UNIQUE KEY uq_user_course (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
  user_id VARCHAR(64) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  added_at DATETIME NOT NULL,
  PRIMARY KEY (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'success', 'warning') NOT NULL,
  date DATE NOT NULL,
  read_flag TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS certificates (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  issued_date DATE NOT NULL,
  UNIQUE KEY uq_cert (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_submissions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  course_id VARCHAR(64) NOT NULL,
  lesson_id VARCHAR(64) NOT NULL,
  content TEXT,
  score INT NULL,
  feedback TEXT NULL,
  submitted_at DATETIME NOT NULL,
  graded_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_activities (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  activity_date DATE NOT NULL,
  study_minutes INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_user_activity (user_id, activity_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
