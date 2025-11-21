-- phpMyAdmin SQL Dump
-- version 4.9.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 18, 2025 at 07:59 AM
-- Server version: 8.0.17
-- PHP Version: 7.3.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `car_booking`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(10) UNSIGNED NOT NULL,
  `booking_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_id` int(10) UNSIGNED NOT NULL,
  `driver_id` int(10) UNSIGNED DEFAULT NULL,
  `requester_id` int(10) UNSIGNED NOT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `destination` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `purpose` text COLLATE utf8mb4_unicode_ci,
  `passenger_count` tinyint(3) UNSIGNED DEFAULT NULL,
  `status` enum('pending','approved','rejected','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `approved_by` int(10) UNSIGNED DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `booking_code`, `vehicle_id`, `driver_id`, `requester_id`, `start_datetime`, `end_datetime`, `destination`, `purpose`, `passenger_count`, `status`, `approved_by`, `approved_at`, `notes`, `created_at`) VALUES
(1, 'BK2401010001', 1, 1, 3, '2025-01-20 09:00:00', '2025-01-20 18:00:00', 'นิคมบางปะอิน', 'ส่งผู้บริหารประชุม', 8, 'approved', 2, '2025-01-10 10:00:00', NULL, '2025-11-18 14:30:18'),
(2, 'BK251118073022', 1, 1, 3, '2025-11-19 14:27:00', '2025-11-19 14:27:00', 'รพ.น้ำยืน', 'ตามงาน', 20, 'pending', NULL, NULL, 'มาทดสอบ', '2025-11-18 14:30:22');

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `license_no` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `experience_years` tinyint(3) UNSIGNED NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`id`, `name`, `phone`, `license_no`, `experience_years`, `status`, `created_at`) VALUES
(1, 'สมชาย ใจดี', '080-000-1111', 'TH-123456789', 8, 'active', '2025-11-18 14:30:18'),
(2, 'ปรีชา งานไว', '081-222-3333', 'TH-987654321', 5, 'active', '2025-11-18 14:30:18');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','approver','user') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `department` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `role`, `department`, `position`, `status`, `created_at`) VALUES
(1, 'admin', '$2y$10$Ox.Y/9/6q5uOrsWZ4jo1qeRJ6KIzTngOaOwGy4PgN.Bun1eLNOakq', 'ผู้ดูแลระบบ', 'admin', 'ฝ่ายไอที', 'N/A', 'active', '2025-11-18 14:30:18'),
(2, 'approver', '$2y$10$Ox.Y/9/6q5uOrsWZ4jo1qeRJ6KIzTngOaOwGy4PgN.Bun1eLNOakq', 'Manager', 'approver', 'ฝ่ายบริหาร', 'N/A', 'active', '2025-11-18 14:30:18'),
(3, 'user', '$2y$10$Ox.Y/9/6q5uOrsWZ4jo1qeRJ6KIzTngOaOwGy4PgN.Bun1eLNOakq', 'เจ้าหน้าที่ทั่วไป', 'user', 'ฝ่ายบริการ', 'N/A', 'active', '2025-11-18 14:30:18');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(10) UNSIGNED NOT NULL,
  `license_plate` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_model` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_type` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` tinyint(3) UNSIGNED NOT NULL DEFAULT '4',
  `status` enum('available','in_use','maintenance') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'available',
  `assigned_driver_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `license_plate`, `brand_model`, `vehicle_type`, `capacity`, `status`, `assigned_driver_id`, `created_at`) VALUES
(1, '1กก-1234', 'Toyota Commuter', 'Van', 12, 'available', 1, '2025-11-18 14:30:18'),
(2, 'กข-5678', 'Toyota Camry', 'Sedan', 4, 'maintenance', 2, '2025-11-18 14:30:18');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `booking_code` (`booking_code`),
  ADD KEY `bookings_vehicle_fk` (`vehicle_id`),
  ADD KEY `bookings_driver_fk` (`driver_id`),
  ADD KEY `bookings_requester_fk` (`requester_id`),
  ADD KEY `bookings_approver_fk` (`approved_by`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicles_driver_fk` (`assigned_driver_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_approver_fk` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bookings_driver_fk` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bookings_requester_fk` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_vehicle_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`);

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_driver_fk` FOREIGN KEY (`assigned_driver_id`) REFERENCES `drivers` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
