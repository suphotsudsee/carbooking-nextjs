-- CreateTable
CREATE TABLE `bookings` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `booking_code` VARCHAR(20) NOT NULL,
    `vehicle_id` INTEGER UNSIGNED NOT NULL,
    `driver_id` INTEGER UNSIGNED NULL,
    `requester_id` INTEGER UNSIGNED NOT NULL,
    `start_datetime` DATETIME(3) NOT NULL,
    `end_datetime` DATETIME(3) NOT NULL,
    `destination` VARCHAR(255) NOT NULL,
    `purpose` TEXT NULL,
    `passenger_count` TINYINT UNSIGNED NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    `approved_by` INTEGER UNSIGNED NULL,
    `approved_at` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bookings_booking_code_key`(`booking_code`),
    INDEX `bookings_vehicle_id_idx`(`vehicle_id`),
    INDEX `bookings_driver_id_idx`(`driver_id`),
    INDEX `bookings_requester_id_idx`(`requester_id`),
    INDEX `bookings_approved_by_idx`(`approved_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `license_plate` VARCHAR(20) NOT NULL,
    `brand_model` VARCHAR(150) NOT NULL,
    `vehicle_type` VARCHAR(60) NOT NULL,
    `capacity` TINYINT UNSIGNED NOT NULL DEFAULT 4,
    `status` ENUM('available', 'in_use', 'maintenance') NOT NULL DEFAULT 'available',
    `assigned_driver_id` INTEGER UNSIGNED NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `vehicles_assigned_driver_id_idx`(`assigned_driver_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `drivers` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `license_no` VARCHAR(80) NOT NULL,
    `experience_years` TINYINT UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(150) NOT NULL,
    `role` ENUM('admin', 'approver', 'user') NOT NULL DEFAULT 'user',
    `department` VARCHAR(100) NULL,
    `position` VARCHAR(150) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_vehicle_id_fkey` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_driver_id_fkey` FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_assigned_driver_id_fkey` FOREIGN KEY (`assigned_driver_id`) REFERENCES `drivers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
