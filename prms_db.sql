-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 11, 2025 at 12:51 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `prms_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `diseases`
--

CREATE TABLE `diseases` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `symptoms` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `incubation_period` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contagious_period` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'blue',
  `icon` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'FaVirus',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diseases`
--

INSERT INTO `diseases` (`id`, `name`, `description`, `symptoms`, `incubation_period`, `contagious_period`, `color`, `icon`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Chickenpox', 'Varicella-zoster virus infection causing itchy rash', 'Itchy rash, Fever, Fatigue, Headache, Loss of appetite', '10-21 days', '1-2 days', 'red', 'FaVirus', 1, '2025-09-24 10:59:57', '2025-10-09 01:10:11'),
(2, 'Measles', 'Highly contagious viral disease with characteristic rash', 'High fever, Cough, Runny nose, Red eyes, Koplik spots, Rash', '7-14 days', '4 days before to 4 days after rash appears', 'purple', 'FaExclamationTriangle', 1, '2025-09-24 10:59:57', '2025-10-09 01:18:05'),
(3, 'Tuberculosis', 'Bacterial infection primarily affecting the lungs', 'Persistent cough, Chest pain, Coughing up blood, Fatigue, Weight loss, Night sweats', '2-12 weeks', 'Only when active and untreated', 'purple', 'FaLungs', 1, '2025-09-24 10:59:57', '2025-10-09 01:17:59'),
(4, 'Hepatitis', 'Inflammation of the liver caused by viral infection', 'Jaundice, Fatigue, Abdominal pain, Dark urine, Pale stool, Nausea', '15-50 days', 'Varies by type (A, B, C)', 'purple', 'FaExclamationTriangle', 1, '2025-09-24 10:59:57', '2025-10-09 01:10:20'),
(5, 'Dengue', 'Mosquito-borne viral infection causing severe flu-like illness', 'High fever, Severe headache, Pain behind eyes, Muscle pain, Nausea, Rash', '3-14 days', 'Not directly person-to-person', 'green', 'FaThermometerHalf', 1, '2025-09-24 10:59:57', '2025-10-09 01:10:15'),
(7, 'aasadsadsdasadsa', 'dsadsd', 'dassdasdas', '', '', 'blue', 'FaVirus', 0, '2025-10-08 10:58:39', '2025-10-08 10:58:43');

-- --------------------------------------------------------

--
-- Table structure for table `disease_summary`
--

CREATE TABLE `disease_summary` (
  `id` int NOT NULL,
  `disease_name` varchar(50) NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `total_cases` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `disease_summary`
--

INSERT INTO `disease_summary` (`id`, `disease_name`, `year`, `month`, `total_cases`, `created_at`, `updated_at`) VALUES
(890, 'dengue', 2025, 10, 1, '2025-10-09 14:33:58', '2025-10-09 14:33:58');

-- --------------------------------------------------------

--
-- Table structure for table `forecasts`
--

CREATE TABLE `forecasts` (
  `id` int NOT NULL,
  `disease` varchar(50) NOT NULL,
  `forecast_period` int NOT NULL,
  `population` int NOT NULL,
  `forecast_results` text NOT NULL,
  `indicators` text NOT NULL,
  `area_data` text NOT NULL,
  `current_data` text NOT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `forecasts`
--

INSERT INTO `forecasts` (`id`, `disease`, `forecast_period`, `population`, `forecast_results`, `indicators`, `area_data`, `current_data`, `generated_at`) VALUES
(22, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-06 19:43:50\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-06 19:43:50\"}', '2025-10-06 11:43:51'),
(40, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-06 22:17:34\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-06 22:17:34\"}', '2025-10-06 14:17:34'),
(41, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-06 22:40:15\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-06 22:40:15\"}', '2025-10-06 14:40:16'),
(42, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-06 23:07:38\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-06 23:07:38\"}', '2025-10-06 15:07:38'),
(43, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-06 23:12:42\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-06 23:12:42\"}', '2025-10-06 15:12:42'),
(44, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-06 23:15:28\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-06 23:15:28\"}', '2025-10-06 15:15:29'),
(45, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-06 23:15:47\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-06 23:15:47\"}', '2025-10-06 15:15:47'),
(46, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-06 23:17:37\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-06 23:17:37\"}', '2025-10-06 15:17:37'),
(47, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-06 23:25:50\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-06 23:25:50\"}', '2025-10-06 15:25:50'),
(48, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-07 10:10:07\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-07 10:10:07\"}', '2025-10-07 02:10:07'),
(49, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-07 11:50:05\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-07 11:50:05\"}', '2025-10-07 03:50:06'),
(50, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-08 15:12:59\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-08 15:12:59\"}', '2025-10-08 07:12:59'),
(51, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-08 15:27:05\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-08 15:27:05\"}', '2025-10-08 07:27:05'),
(52, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-08 20:32:16\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-08 20:32:16\"}', '2025-10-08 12:32:16'),
(53, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-08 20:35:30\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-08 20:35:30\"}', '2025-10-08 12:35:30'),
(54, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":23},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-10\",\"forecast_cases\":60},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":12},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":11},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":10},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-10\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":23},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":22},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-10\",\"forecast_cases\":35},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":33},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":31}]', '{\"total_diseases\":5,\"total_forecast_months\":15,\"historical_records\":165,\"current_cases_30d\":[],\"generated_at\":\"2025-10-08 22:45:28\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-08 22:45:28\"}', '2025-10-08 14:45:28'),
(61, 'All Diseases', 3, 1000, '[{\"disease_name\":\"chickenpox\",\"forecast_month\":\"Error\",\"forecast_cases\":0,\"error\":\"Not enough data points for ARIMA forecast\"},{\"disease_name\":\"dengue\",\"forecast_month\":\"Error\",\"forecast_cases\":0,\"error\":\"Not enough data points for ARIMA forecast\"},{\"disease_name\":\"measles\",\"forecast_month\":\"Error\",\"forecast_cases\":0,\"error\":\"Not enough data points for ARIMA forecast\"}]', '{\"total_diseases\":0,\"total_forecast_months\":3,\"historical_records\":3,\"current_cases_30d\":{\"chickenpox\":1,\"dengue\":1,\"measles\":1},\"generated_at\":\"2025-10-09 16:17:45\"}', '{\"total_diseases\":0}', '{\"generated_at\":\"2025-10-09 16:17:45\"}', '2025-10-09 08:17:45'),
(62, 'All Diseases', 3, 1000, '[{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-11\",\"forecast_cases\":55},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2025-12\",\"forecast_cases\":53},{\"disease_name\":\"Chickenpox\",\"forecast_month\":\"2026-01\",\"forecast_cases\":51},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-11\",\"forecast_cases\":64},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2025-12\",\"forecast_cases\":70},{\"disease_name\":\"Dengue\",\"forecast_month\":\"2026-01\",\"forecast_cases\":71},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":45},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":45},{\"disease_name\":\"Hepatitis\",\"forecast_month\":\"2026-01\",\"forecast_cases\":44},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-11\",\"forecast_cases\":27},{\"disease_name\":\"Measles\",\"forecast_month\":\"2025-12\",\"forecast_cases\":24},{\"disease_name\":\"Measles\",\"forecast_month\":\"2026-01\",\"forecast_cases\":23},{\"disease_name\":\"Test Disease\",\"forecast_month\":\"Error\",\"forecast_cases\":0,\"error\":\"Not enough data points for ARIMA forecast\"},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-11\",\"forecast_cases\":36},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2025-12\",\"forecast_cases\":34},{\"disease_name\":\"Tuberculosis\",\"forecast_month\":\"2026-01\",\"forecast_cases\":33}]', '{\"total_diseases\":5,\"total_forecast_months\":16,\"historical_records\":112,\"current_cases_30d\":{\"Chickenpox\":59,\"Dengue\":46,\"Hepatitis\":46,\"Measles\":36,\"Test Disease\":1,\"Tuberculosis\":39},\"generated_at\":\"2025-10-09 18:15:40\"}', '{\"total_diseases\":5}', '{\"generated_at\":\"2025-10-09 18:15:40\"}', '2025-10-09 10:15:40');

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int NOT NULL,
  `patient_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `surname` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `first_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `middle_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `suffix` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `barangay` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `philhealth_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `priority` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `blood_pressure` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `temperature` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `height` decimal(5,2) DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `chief_complaint` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `place_of_consultation` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `type_of_services` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_of_consultation` date DEFAULT NULL,
  `health_provider` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `diagnosis` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `laboratory_procedure` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `prescribed_medicine` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `medical_advice` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `place_of_consultation_medical` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_of_consultation_medical` date DEFAULT NULL,
  `health_provider_medical` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `medical_remarks` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `treatment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_records`
--

INSERT INTO `medical_records` (`id`, `patient_id`, `created_at`, `surname`, `first_name`, `middle_name`, `suffix`, `date_of_birth`, `barangay`, `philhealth_id`, `priority`, `blood_pressure`, `temperature`, `height`, `weight`, `chief_complaint`, `place_of_consultation`, `type_of_services`, `date_of_consultation`, `health_provider`, `diagnosis`, `laboratory_procedure`, `prescribed_medicine`, `medical_advice`, `place_of_consultation_medical`, `date_of_consultation_medical`, `health_provider_medical`, `medical_remarks`, `treatment`, `updated_at`) VALUES
(6, 2, '2025-10-09 14:04:06', 'Patient', 'Test', '', '', '2001-01-06', NULL, '', 'low', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-09', NULL, 'dengue', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-09 14:33:58'),
(7, 2, '2025-10-09 14:59:45', 'Patient', 'Test', '', '', '2001-01-06', NULL, '', 'low', '', '', 0.00, 0.00, '', '', '', NULL, '', '', '', '', '', '', NULL, '', '', NULL, '2025-10-09 14:59:45'),
(8, 2, '2025-10-09 15:08:40', 'Patient', 'Test', '', '', '2001-01-06', NULL, '', 'low', '', '', 0.00, 0.00, '', '', '', '2025-10-09', '', '', '', '', '', '', NULL, '', '', NULL, '2025-10-09 15:08:40'),
(9, 2, '2025-10-09 15:08:56', 'Patient', 'Test', '', '', '2001-01-06', NULL, '', 'low', '', '', 0.00, 0.00, '', '', '', '2025-10-09', '', '', '', '', '', '', NULL, '', '', NULL, '2025-10-09 15:08:56'),
(10, 2, '2025-10-09 15:09:04', 'Patient', 'Test', '', '', '2001-01-06', NULL, '', 'low', '', '', 0.00, 0.00, '', '', '', '2025-10-09', '', '', '', '', '', '', '2025-10-09', '', '', NULL, '2025-10-09 15:09:04'),
(11, 2, '2025-10-09 15:15:01', 'Patient', 'Test', '', '', '2001-01-06', NULL, '', 'low', '', '', 0.00, 0.00, '', '', '', '2025-10-09', '', '', '', '', '', '', '2025-10-09', '', '', NULL, '2025-10-09 15:15:01'),
(12, 2, '2025-10-09 15:15:02', 'Patient', 'Test', '', '', '2001-01-06', NULL, '', 'low', '', '', 0.00, 0.00, '', '', '', '2025-10-09', '', '', '', '', '', '', '2025-10-09', '', '', NULL, '2025-10-09 15:15:02'),
(13, 2, '2025-10-09 15:15:03', 'Patient', 'Test', '', '', '2001-01-06', NULL, '', 'low', '', '', 0.00, 0.00, '', '', '', '2025-10-09', '', '', '', '', '', '', '2025-10-09', '', '', NULL, '2025-10-09 15:15:03'),
(14, 2, '2025-10-09 15:15:04', 'Patient', 'Test', '', '', '2001-01-06', NULL, '', 'low', '', '', 0.00, 0.00, '', '', '', '2025-10-09', '', '', '', '', '', '', '2025-10-09', '', '', NULL, '2025-10-09 15:15:04'),
(15, 2, '2025-10-09 15:15:16', 'Patient', 'Test', '', '', '2001-01-06', NULL, '', 'low', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-09 15:15:16'),
(16, 3, '2025-10-09 15:15:38', 'ef', 'qq3rw', 'faa', '', NULL, NULL, '', 'medium', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-09 15:15:38'),
(17, 3, '2025-10-09 15:15:47', 'ef', 'qq3rw', 'faa', '', NULL, NULL, '', 'medium', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-09 15:15:47'),
(18, 3, '2025-10-09 15:15:49', 'ef', 'qq3rw', 'faa', '', NULL, NULL, '', 'medium', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-09', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-09 15:15:49');

--
-- Triggers `medical_records`
--
DELIMITER $$
CREATE TRIGGER `update_disease_summary_after_delete` AFTER DELETE ON `medical_records` FOR EACH ROW BEGIN

        IF OLD.diagnosis IS NOT NULL AND OLD.diagnosis != '' THEN

            UPDATE disease_summary 

            SET total_cases = total_cases - 1

            WHERE disease_name = OLD.diagnosis 

            AND year = YEAR(OLD.created_at) 

            AND month = MONTH(OLD.created_at);

            

            DELETE FROM disease_summary 

            WHERE disease_name = OLD.diagnosis 

            AND year = YEAR(OLD.created_at) 

            AND month = MONTH(OLD.created_at)

            AND total_cases <= 0;

        END IF;

    END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_disease_summary_after_insert` AFTER INSERT ON `medical_records` FOR EACH ROW BEGIN

        IF NEW.diagnosis IS NOT NULL AND NEW.diagnosis != '' THEN

            INSERT INTO disease_summary (disease_name, year, month, total_cases)

            VALUES (NEW.diagnosis, YEAR(NEW.created_at), MONTH(NEW.created_at), 1)

            ON DUPLICATE KEY UPDATE total_cases = total_cases + 1;

        END IF;

    END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_disease_summary_after_update` AFTER UPDATE ON `medical_records` FOR EACH ROW BEGIN

        -- Handle old diagnosis

        IF OLD.diagnosis IS NOT NULL AND OLD.diagnosis != '' THEN

            UPDATE disease_summary 

            SET total_cases = total_cases - 1

            WHERE disease_name = OLD.diagnosis 

            AND year = YEAR(OLD.created_at) 

            AND month = MONTH(OLD.created_at);

            

            DELETE FROM disease_summary 

            WHERE disease_name = OLD.diagnosis 

            AND year = YEAR(OLD.created_at) 

            AND month = MONTH(OLD.created_at)

            AND total_cases <= 0;

        END IF;

        

        -- Handle new diagnosis

        IF NEW.diagnosis IS NOT NULL AND NEW.diagnosis != '' THEN

            INSERT INTO disease_summary (disease_name, year, month, total_cases)

            VALUES (NEW.diagnosis, YEAR(NEW.created_at), MONTH(NEW.created_at), 1)

            ON DUPLICATE KEY UPDATE total_cases = total_cases + 1;

        END IF;

    END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  `sex` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `added_by` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `full_name`, `age`, `sex`, `date_of_birth`, `address`, `created_at`, `added_by`) VALUES
(2, 'Test  Patient', 24, 'Male', '2001-01-06', 'Batong Malake, Laguna', '2025-10-09 14:04:06', NULL),
(3, 'qq3rw faa ef', 0, 'Female', NULL, 'fafa', '2025-10-09 15:15:38', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int NOT NULL DEFAULT '1',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `updated_at`) VALUES
(1, '2025-09-25 13:35:46');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'admin', '$2y$10$nwn8CI7XU5JpiY.5M9ugb.jPG/801DqW9IStmJP/P52m5E.0jcdrW', '2025-09-24 03:45:52'),
(3, 'staff', '$2y$10$LQmrhYy17WJoVFiI/zhgf.zQ/IoQzjhg3DBPyPz5q1s8PpUfoSLRW', '2025-10-06 15:30:04');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `diseases`
--
ALTER TABLE `diseases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_diseases_name` (`name`);

--
-- Indexes for table `disease_summary`
--
ALTER TABLE `disease_summary`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_disease_year_month` (`disease_name`,`year`,`month`),
  ADD KEY `idx_disease` (`disease_name`),
  ADD KEY `idx_date` (`year`,`month`),
  ADD KEY `idx_updated` (`updated_at`);

--
-- Indexes for table `forecasts`
--
ALTER TABLE `forecasts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_disease` (`disease`),
  ADD KEY `idx_generated_at` (`generated_at`);

--
-- Indexes for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `patient_id` (`patient_id`);

--
-- Indexes for table `patients`
--
ALTER TABLE `patients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_patients_full_name` (`full_name`),
  ADD KEY `idx_patients_sex` (`sex`),
  ADD KEY `idx_patients_created_at` (`created_at`),
  ADD KEY `idx_patients_address` (`address`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `diseases`
--
ALTER TABLE `diseases`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `disease_summary`
--
ALTER TABLE `disease_summary`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=891;

--
-- AUTO_INCREMENT for table `forecasts`
--
ALTER TABLE `forecasts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
