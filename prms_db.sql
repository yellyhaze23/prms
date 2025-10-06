-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 05, 2025 at 11:34 AM
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
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `symptoms` text COLLATE utf8mb4_general_ci,
  `incubation_period` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contagious_period` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `color` varchar(20) COLLATE utf8mb4_general_ci DEFAULT 'blue',
  `icon` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'FaVirus',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diseases`
--

INSERT INTO `diseases` (`id`, `name`, `description`, `symptoms`, `incubation_period`, `contagious_period`, `color`, `icon`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Chickenpox', 'Varicella-zoster virus infection causing itchy rash', 'Itchy rash, Fever, Fatigue, Headache, Loss of appetite', '10-21 days', '1-2 days', 'purple', 'FaVirus', 1, '2025-09-24 10:59:57', '2025-09-24 12:58:18'),
(2, 'Measles', 'Highly contagious viral disease with characteristic rash', 'High fever, Cough, Runny nose, Red eyes, Koplik spots, Rash', '7-14 days', '4 days before to 4 days after rash appears', 'purple', 'FaExclamationTriangle', 1, '2025-09-24 10:59:57', '2025-09-24 11:17:53'),
(3, 'Tuberculosis', 'Bacterial infection primarily affecting the lungs', 'Persistent cough, Chest pain, Coughing up blood, Fatigue, Weight loss, Night sweats', '2-12 weeks', 'Only when active and untreated', 'purple', 'FaLungs', 1, '2025-09-24 10:59:57', '2025-09-24 12:58:34'),
(4, 'Hepatitis', 'Inflammation of the liver caused by viral infection', 'Jaundice, Fatigue, Abdominal pain, Dark urine, Pale stool, Nausea', '15-50 days', 'Varies by type (A, B, C)', 'purple', 'FaHeartbeat', 1, '2025-09-24 10:59:57', '2025-09-24 12:58:27'),
(5, 'Dengue', 'Mosquito-borne viral infection causing severe flu-like illness', 'High fever, Severe headache, Pain behind eyes, Muscle pain, Nausea, Rash', '3-14 days', 'Not directly person-to-person', 'purple', 'FaThermometerHalf', 1, '2025-09-24 10:59:57', '2025-09-24 12:59:23');

-- --------------------------------------------------------

--
-- Table structure for table `forecasts`
--

CREATE TABLE `forecasts` (
  `id` int NOT NULL,
  `disease` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `forecast_period` int NOT NULL,
  `population` int NOT NULL,
  `seir_results` text COLLATE utf8mb4_general_ci NOT NULL,
  `indicators` text COLLATE utf8mb4_general_ci NOT NULL,
  `area_data` text COLLATE utf8mb4_general_ci NOT NULL,
  `current_data` text COLLATE utf8mb4_general_ci NOT NULL,
  `generated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `interpretation` text COLLATE utf8mb4_general_ci,
  `barangay_risk` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `forecasts`
--

INSERT INTO `forecasts` (`id`, `disease`, `forecast_period`, `population`, `seir_results`, `indicators`, `area_data`, `current_data`, `generated_at`, `interpretation`, `barangay_risk`) VALUES
(1, 'Chickenpox', 7, 100, '[{\"day\":0,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":1,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":2,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":3,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":4,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":5,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":6,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":7,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0}]', '{\"peak_infected\":0,\"peak_day\":0,\"total_infected\":0,\"attack_rate\":0,\"risk_level\":\"Low\",\"reproduction_number\":4,\"doubling_time\":3.3,\"trend\":\"stable\",\"current_cases\":1,\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\"}', '{\"total_population\":5000,\"total_patients\":\"2\",\"sick_patients\":\"2\",\"avg_age\":24,\"local_patients\":\"2\"}', '{\"total_cases\":1,\"confirmed_cases\":\"0\",\"suspected_cases\":\"1\",\"recovered_cases\":\"0\",\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\",\"avg_age\":\"23.0000\",\"male_cases\":1,\"female_cases\":0,\"first_case_date\":\"2025-09-24 20:24:56\",\"last_case_date\":\"2025-09-24 20:24:56\"}', '2025-09-24 14:56:37', NULL, NULL),
(2, 'Chickenpox', 7, 100, '[{\"day\":0,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":1,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":2,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":3,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":4,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":5,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":6,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":7,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0}]', '{\"peak_infected\":0,\"peak_day\":0,\"total_infected\":0,\"attack_rate\":0,\"risk_level\":\"Low\",\"reproduction_number\":4,\"doubling_time\":3.3,\"trend\":\"stable\",\"current_cases\":1,\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\"}', '{\"total_population\":5000,\"total_patients\":\"2\",\"sick_patients\":\"2\",\"avg_age\":24,\"local_patients\":\"2\"}', '{\"total_cases\":1,\"confirmed_cases\":\"0\",\"suspected_cases\":\"1\",\"recovered_cases\":\"0\",\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\",\"avg_age\":\"23.0000\",\"male_cases\":1,\"female_cases\":0,\"first_case_date\":\"2025-09-24 20:24:56\",\"last_case_date\":\"2025-09-24 20:24:56\"}', '2025-09-24 15:09:13', NULL, NULL),
(3, 'Measles', 7, 100, '[{\"day\":0,\"susceptible\":10,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":1,\"susceptible\":10,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":2,\"susceptible\":10,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":3,\"susceptible\":10,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":4,\"susceptible\":10,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":5,\"susceptible\":10,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":6,\"susceptible\":10,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":7,\"susceptible\":10,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0}]', '{\"peak_infected\":0,\"peak_day\":0,\"total_infected\":0,\"attack_rate\":0,\"risk_level\":\"Low\",\"reproduction_number\":15,\"doubling_time\":0.5,\"trend\":\"stable\",\"current_cases\":0,\"new_cases_7d\":null,\"new_cases_30d\":null}', '{\"total_population\":5000,\"total_patients\":\"2\",\"sick_patients\":\"2\",\"avg_age\":24,\"local_patients\":\"2\"}', '{\"total_cases\":0,\"confirmed_cases\":null,\"suspected_cases\":null,\"recovered_cases\":null,\"new_cases_7d\":null,\"new_cases_30d\":null,\"avg_age\":null,\"male_cases\":0,\"female_cases\":0,\"first_case_date\":null,\"last_case_date\":null}', '2025-09-24 15:09:19', NULL, NULL),
(4, 'Chickenpox', 7, 100, '[{\"day\":0,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":1,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":2,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":3,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":4,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":5,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":6,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":7,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0}]', '{\"peak_infected\":0,\"peak_day\":0,\"total_infected\":0,\"attack_rate\":0,\"risk_level\":\"Low\",\"reproduction_number\":4,\"doubling_time\":3.3,\"trend\":\"stable\",\"current_cases\":1,\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\"}', '{\"total_population\":5000,\"total_patients\":\"2\",\"sick_patients\":\"2\",\"avg_age\":24,\"local_patients\":\"2\"}', '{\"total_cases\":1,\"confirmed_cases\":\"0\",\"suspected_cases\":\"1\",\"recovered_cases\":\"0\",\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\",\"avg_age\":\"23.0000\",\"male_cases\":1,\"female_cases\":0,\"first_case_date\":\"2025-09-24 20:24:56\",\"last_case_date\":\"2025-09-24 20:24:56\"}', '2025-09-24 15:15:27', NULL, NULL),
(5, 'Chickenpox', 7, 100, '[{\"day\":0,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":1,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":2,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":3,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":4,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":5,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":6,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":7,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0}]', '{\"peak_infected\":0,\"peak_day\":0,\"total_infected\":0,\"attack_rate\":0,\"risk_level\":\"Low\",\"reproduction_number\":4,\"doubling_time\":3.3,\"trend\":\"stable\",\"current_cases\":1,\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\"}', '{\"total_population\":5000,\"total_patients\":\"2\",\"sick_patients\":\"2\",\"avg_age\":24,\"local_patients\":\"2\"}', '{\"total_cases\":1,\"confirmed_cases\":\"0\",\"suspected_cases\":\"1\",\"recovered_cases\":\"0\",\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\",\"avg_age\":\"23.0000\",\"male_cases\":1,\"female_cases\":0,\"first_case_date\":\"2025-09-24 20:24:56\",\"last_case_date\":\"2025-09-24 20:24:56\"}', '2025-09-24 15:16:36', NULL, NULL),
(6, 'Chickenpox', 7, 100, '[{\"day\":0,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":1,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":2,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":3,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":4,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":5,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":6,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":7,\"susceptible\":15,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":100,\"new_infections\":0}]', '{\"peak_infected\":0,\"peak_day\":0,\"total_infected\":0,\"attack_rate\":0,\"risk_level\":\"Low\",\"reproduction_number\":4,\"doubling_time\":3.3,\"trend\":\"stable\",\"current_cases\":1,\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\"}', '{\"total_population\":5000,\"total_patients\":\"2\",\"sick_patients\":\"2\",\"avg_age\":24,\"local_patients\":\"2\"}', '{\"total_cases\":1,\"confirmed_cases\":\"0\",\"suspected_cases\":\"1\",\"recovered_cases\":\"0\",\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\",\"avg_age\":\"23.0000\",\"male_cases\":1,\"female_cases\":0,\"first_case_date\":\"2025-09-24 20:24:56\",\"last_case_date\":\"2025-09-24 20:24:56\"}', '2025-09-24 15:20:20', '{\"risk_assessment\":\"The disease shows a Low risk level with an attack rate of 0%. Current cases: 1, New cases (7d): 1\",\"peak_prediction\":\"Peak infection is predicted to occur on day 0 with approximately 0 infected individuals.\",\"reproduction_analysis\":\"The effective reproduction number (R = 4) indicates the disease will continue to spread without intervention.\",\"trend_analysis\":\"Based on recent data, the trend is stable. New cases in the last 7 days: 1, Last 30 days: 1\",\"recommendations\":[\"Maintain current surveillance levels\",\"Continue preventive measures\",\"Monitor for any changes in trend\"]}', '[{\"address\":\"Batong Malake, Laguna\",\"cases\":1,\"confirmed_cases\":\"0\",\"suspected_cases\":\"1\",\"recovered_cases\":\"0\",\"avg_age\":\"23.0000\",\"male_cases\":1,\"female_cases\":0,\"first_case\":\"2025-09-24 20:24:56\",\"last_case\":\"2025-09-24 20:24:56\"}]'),
(7, 'Hepatitis', 30, 100, '[{\"day\":0,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":1,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":2,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":3,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":4,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":5,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":6,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":7,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":8,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":9,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":10,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":11,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":12,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":13,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":14,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":15,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":16,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":17,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":18,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":19,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":20,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":21,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":22,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":23,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":24,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":25,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":26,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":27,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":28,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":29,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0},{\"day\":30,\"susceptible\":20,\"exposed\":0,\"infected\":1,\"recovered\":0,\"total_population\":100,\"new_infections\":0}]', '{\"peak_infected\":1,\"peak_day\":0,\"total_infected\":1,\"attack_rate\":1,\"risk_level\":\"Low\",\"reproduction_number\":3,\"doubling_time\":10.5,\"trend\":\"stable\",\"current_cases\":1,\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\"}', '{\"total_population\":5000,\"total_patients\":\"3\",\"sick_patients\":\"3\",\"avg_age\":23.7,\"local_patients\":\"3\"}', '{\"total_cases\":1,\"confirmed_cases\":\"1\",\"suspected_cases\":\"0\",\"recovered_cases\":\"0\",\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\",\"avg_age\":\"23.0000\",\"male_cases\":0,\"female_cases\":1,\"first_case_date\":\"2025-09-25 00:17:53\",\"last_case_date\":\"2025-09-25 00:17:53\"}', '2025-09-24 16:18:27', '{\"risk_assessment\":\"The disease shows a Low risk level with an attack rate of 1%. Current cases: 1, New cases (7d): 1\",\"peak_prediction\":\"Peak infection is predicted to occur on day 0 with approximately 1 infected individuals.\",\"reproduction_analysis\":\"The effective reproduction number (R = 3) indicates the disease will continue to spread without intervention.\",\"trend_analysis\":\"Based on recent data, the trend is stable. New cases in the last 7 days: 1, Last 30 days: 1\",\"recommendations\":[\"Maintain current surveillance levels\",\"Continue preventive measures\",\"Monitor for any changes in trend\"]}', '[{\"address\":\"Anos, Laguna\",\"cases\":1,\"confirmed_cases\":\"1\",\"suspected_cases\":\"0\",\"recovered_cases\":\"0\",\"avg_age\":\"23.0000\",\"male_cases\":0,\"female_cases\":1,\"first_case\":\"2025-09-25 00:17:53\",\"last_case\":\"2025-09-25 00:17:53\"}]'),
(8, 'Dengue', 30, 10000, '[{\"day\":0,\"susceptible\":4000,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":1,\"susceptible\":4000,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":2,\"susceptible\":4000,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":3,\"susceptible\":4000,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":4,\"susceptible\":4000,\"exposed\":1,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":5,\"susceptible\":4000,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":6,\"susceptible\":4000,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":7,\"susceptible\":4000,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":8,\"susceptible\":4000,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":9,\"susceptible\":4000,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":10,\"susceptible\":4000,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":11,\"susceptible\":4000,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":12,\"susceptible\":4000,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":13,\"susceptible\":4000,\"exposed\":0,\"infected\":0,\"recovered\":0,\"total_population\":10000,\"new_infections\":0},{\"day\":14,\"susceptible\":4000,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":15,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":16,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":17,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":18,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":19,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":20,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":21,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":22,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":23,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":24,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":25,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":26,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":27,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":28,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":29,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0},{\"day\":30,\"susceptible\":3999,\"exposed\":0,\"infected\":0,\"recovered\":1,\"total_population\":10000,\"new_infections\":0}]', '{\"peak_infected\":0,\"peak_day\":0,\"total_infected\":1,\"attack_rate\":0.01,\"risk_level\":\"Low\",\"reproduction_number\":2,\"doubling_time\":5,\"trend\":\"stable\",\"current_cases\":1,\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\"}', '{\"total_population\":5000,\"total_patients\":\"3\",\"sick_patients\":\"3\",\"avg_age\":23.7,\"local_patients\":\"3\"}', '{\"total_cases\":1,\"confirmed_cases\":\"0\",\"suspected_cases\":\"1\",\"recovered_cases\":\"0\",\"new_cases_7d\":\"1\",\"new_cases_30d\":\"1\",\"avg_age\":\"25.0000\",\"male_cases\":0,\"female_cases\":1,\"first_case_date\":\"2025-09-25 00:13:46\",\"last_case_date\":\"2025-09-25 00:13:46\"}', '2025-09-25 13:16:29', '{\"risk_assessment\":\"The disease shows a Low risk level with an attack rate of 0.01%. Current cases: 1, New cases (7d): 1\",\"peak_prediction\":\"Peak infection is predicted to occur on day 0 with approximately 0 infected individuals.\",\"reproduction_analysis\":\"The effective reproduction number (R = 2) indicates the disease will continue to spread without intervention.\",\"trend_analysis\":\"Based on recent data, the trend is stable. New cases in the last 7 days: 1, Last 30 days: 1\",\"recommendations\":[\"Maintain current surveillance levels\",\"Continue preventive measures\",\"Monitor for any changes in trend\"]}', '[{\"address\":\"Mayondon Brgy Hall, Los Banos, Laguna\",\"cases\":1,\"confirmed_cases\":\"0\",\"suspected_cases\":\"1\",\"recovered_cases\":\"0\",\"avg_age\":\"25.0000\",\"male_cases\":0,\"female_cases\":1,\"first_case\":\"2025-09-25 00:13:46\",\"last_case\":\"2025-09-25 00:13:46\"}]');

-- --------------------------------------------------------

--
-- Table structure for table `health_examinations`
--

CREATE TABLE `health_examinations` (
  `id` int NOT NULL,
  `patient_id` int NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `blood_pressure` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `previous_illness` text COLLATE utf8mb4_general_ci,
  `onset_date` date DEFAULT NULL,
  `diagnosis_date` date DEFAULT NULL,
  `severity` enum('mild','moderate','severe','critical') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('suspected','confirmed','recovered','quarantined') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `symptoms` text COLLATE utf8mb4_general_ci,
  `treatment` text COLLATE utf8mb4_general_ci,
  `vaccination_status` enum('vaccinated','partially_vaccinated','not_vaccinated','unknown') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_tracing` text COLLATE utf8mb4_general_ci,
  `notes` text COLLATE utf8mb4_general_ci,
  `reported_by` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `reported_date` date DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `diagnosis` text COLLATE utf8mb4_general_ci,
  `recommendation` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `health_examinations`
--

INSERT INTO `health_examinations` (`id`, `patient_id`, `image_path`, `blood_pressure`, `previous_illness`, `onset_date`, `diagnosis_date`, `severity`, `status`, `symptoms`, `treatment`, `vaccination_status`, `contact_tracing`, `notes`, `reported_by`, `reported_date`, `updated_at`, `diagnosis`, `recommendation`, `created_at`) VALUES
(3, 4, NULL, '', 'Dengue', '2025-09-22', '2025-09-23', 'moderate', 'suspected', '', '', 'not_vaccinated', '', '', 'ako', '2025-09-24', '2025-09-24 16:13:46', '', '', '2025-09-24 09:27:55'),
(6, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-24 12:24:36', NULL, NULL, '2025-09-24 12:24:36'),
(7, 6, NULL, NULL, 'Chickenpox', '2025-09-24', '2025-09-25', 'mild', 'suspected', '', '', 'not_vaccinated', '', '', '', '2025-09-24', '2025-09-24 12:24:56', NULL, NULL, '2025-09-24 12:24:56'),
(8, 4, NULL, '', 'Dengue', '2025-09-22', '2025-09-23', 'moderate', 'suspected', '', '', 'not_vaccinated', '', '', 'ako', '2025-09-24', '2025-09-24 16:13:46', '', '', '2025-09-24 12:38:27');

-- --------------------------------------------------------

--
-- Table structure for table `medical_records`
--

CREATE TABLE `medical_records` (
  `id` int NOT NULL,
  `patient_id` int NOT NULL,
  `known_illnesses` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `medical_records`
--

INSERT INTO `medical_records` (`id`, `patient_id`, `known_illnesses`, `created_at`) VALUES
(3, 4, NULL, '2025-09-24 09:27:55'),
(5, 6, NULL, '2025-09-24 12:24:36');

-- --------------------------------------------------------

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `full_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `age` int DEFAULT NULL,
  `sex` enum('Male','Female','Other') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `civil_status` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `place_of_birth` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `contact_number` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `emergency_name` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `emergency_relation` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `emergency_contact` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `image_path`, `full_name`, `age`, `sex`, `date_of_birth`, `civil_status`, `place_of_birth`, `contact_number`, `email`, `address`, `emergency_name`, `emergency_relation`, `emergency_contact`, `created_at`) VALUES
(4, 'lspu-logo.png', 'ongkie', 25, 'Female', '2000-02-01', '', '', '098765432112', '', 'Mayondon Brgy Hall, Los Banos, Laguna', '', '', '', '2025-09-24 09:27:55'),
(6, 'lspu-logo.png', 'lala', 23, 'Male', '2001-12-12', NULL, NULL, '', '', 'Batong Malake, Laguna', NULL, NULL, NULL, '2025-09-24 12:24:36');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int NOT NULL DEFAULT '1',
  `clinic_name` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `clinic_address` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `clinic_phone` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `clinic_email` varchar(150) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `map_default_center` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `map_default_zoom` int DEFAULT '12',
  `forecast_default_days` int DEFAULT '30',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `clinic_name`, `clinic_address`, `clinic_phone`, `clinic_email`, `map_default_center`, `map_default_zoom`, `forecast_default_days`, `updated_at`) VALUES
(1, NULL, NULL, NULL, NULL, '14.2794,121.4167', 11, 30, '2025-09-25 13:35:46');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `created_at`) VALUES
(1, 'admin', '$2y$10$nwn8CI7XU5JpiY.5M9ugb.jPG/801DqW9IStmJP/P52m5E.0jcdrW', '2025-09-24 03:45:52');

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
-- Indexes for table `forecasts`
--
ALTER TABLE `forecasts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_disease` (`disease`),
  ADD KEY `idx_generated_at` (`generated_at`);

--
-- Indexes for table `health_examinations`
--
ALTER TABLE `health_examinations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_health_examinations_patient_id` (`patient_id`),
  ADD KEY `idx_health_examinations_previous_illness` (`previous_illness`(768)),
  ADD KEY `idx_health_examinations_updated_at` (`updated_at`),
  ADD KEY `idx_health_examinations_status` (`status`),
  ADD KEY `idx_health_examinations_severity` (`severity`),
  ADD KEY `idx_health_examinations_patient_updated` (`patient_id`,`updated_at`);

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
  ADD KEY `idx_patients_address` (`address`(768));

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `forecasts`
--
ALTER TABLE `forecasts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `health_examinations`
--
ALTER TABLE `health_examinations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `medical_records`
--
ALTER TABLE `medical_records`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `patients`
--
ALTER TABLE `patients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `health_examinations`
--
ALTER TABLE `health_examinations`
  ADD CONSTRAINT `health_examinations_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `medical_records`
--
ALTER TABLE `medical_records`
  ADD CONSTRAINT `medical_records_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
