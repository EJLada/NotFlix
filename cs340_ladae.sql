-- phpMyAdmin SQL Dump
-- version 5.1.3-2.el7.remi
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Feb 23, 2022 at 07:28 PM
-- Server version: 10.6.5-MariaDB-log
-- PHP Version: 7.4.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cs340_ladae`
--

-- --------------------------------------------------------

--
-- Table structure for table `ContentTypes`
--

CREATE TABLE `ContentTypes` (
  `seriesID` int(11) NOT NULL,
  `genreID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `ContentTypes`
--

INSERT INTO `ContentTypes` (`seriesID`, `genreID`) VALUES
(1, 1),
(1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `Customers`
--

CREATE TABLE `Customers` (
  `customerID` int(11) NOT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `Customers`
--

INSERT INTO `Customers` (`customerID`, `firstName`, `lastName`, `email`) VALUES
(1, 'John', 'Doe', 'johndoe@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `Episodes`
--

CREATE TABLE `Episodes` (
  `episodeID` int(11) NOT NULL,
  `seriesID` int(11) DEFAULT NULL,
  `episodeTitle` varchar(255) NOT NULL,
  `releaseDate` date NOT NULL,
  `previousEpisode` int(11) DEFAULT NULL,
  `nextEpisode` int(11) DEFAULT NULL,
  `fileSource` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `Episodes`
--

INSERT INTO `Episodes` (`episodeID`, `seriesID`, `episodeTitle`, `releaseDate`, `previousEpisode`, `nextEpisode`, `fileSource`) VALUES
(1, 1, 'pilot', '2022-02-23', NULL, 2, 'www.himyf01.com'),
(2, 1, 'Robert', '2022-02-28', 1, NULL, 'www.himyf02.com');

-- --------------------------------------------------------

--
-- Table structure for table `Genres`
--

CREATE TABLE `Genres` (
  `genreID` int(11) NOT NULL,
  `genreName` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `Genres`
--

INSERT INTO `Genres` (`genreID`, `genreName`) VALUES
(1, 'romance'),
(2, 'comedy');

-- --------------------------------------------------------

--
-- Table structure for table `Series`
--

CREATE TABLE `Series` (
  `seriesID` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `contentRating` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `Series`
--

INSERT INTO `Series` (`seriesID`, `title`, `contentRating`) VALUES
(1, 'How I Met Your Father', 'PG');

-- --------------------------------------------------------

--
-- Table structure for table `Subscriptions`
--

CREATE TABLE `Subscriptions` (
  `subscriptionID` int(11) NOT NULL,
  `customerID` int(11) NOT NULL,
  `seriesID` int(11) NOT NULL,
  `dateSubscribed` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ContentTypes`
--
ALTER TABLE `ContentTypes`
  ADD PRIMARY KEY (`seriesID`,`genreID`),
  ADD KEY `genreID` (`genreID`);

--
-- Indexes for table `Customers`
--
ALTER TABLE `Customers`
  ADD PRIMARY KEY (`customerID`);

--
-- Indexes for table `Episodes`
--
ALTER TABLE `Episodes`
  ADD PRIMARY KEY (`episodeID`),
  ADD KEY `seriesID` (`seriesID`),
  ADD KEY `previousEpisode` (`previousEpisode`),
  ADD KEY `nextEpisode` (`nextEpisode`);

--
-- Indexes for table `Genres`
--
ALTER TABLE `Genres`
  ADD PRIMARY KEY (`genreID`);

--
-- Indexes for table `Series`
--
ALTER TABLE `Series`
  ADD PRIMARY KEY (`seriesID`);

--
-- Indexes for table `Subscriptions`
--
ALTER TABLE `Subscriptions`
  ADD PRIMARY KEY (`subscriptionID`),
  ADD KEY `customerID` (`customerID`),
  ADD KEY `seriesID` (`seriesID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Customers`
--
ALTER TABLE `Customers`
  MODIFY `customerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Episodes`
--
ALTER TABLE `Episodes`
  MODIFY `episodeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `Genres`
--
ALTER TABLE `Genres`
  MODIFY `genreID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `Series`
--
ALTER TABLE `Series`
  MODIFY `seriesID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `Subscriptions`
--
ALTER TABLE `Subscriptions`
  MODIFY `subscriptionID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ContentTypes`
--
ALTER TABLE `ContentTypes`
  ADD CONSTRAINT `ContentTypes_ibfk_1` FOREIGN KEY (`seriesID`) REFERENCES `Series` (`seriesID`),
  ADD CONSTRAINT `ContentTypes_ibfk_2` FOREIGN KEY (`genreID`) REFERENCES `Genres` (`genreID`);

--
-- Constraints for table `Episodes`
--
ALTER TABLE `Episodes`
  ADD CONSTRAINT `Episodes_ibfk_1` FOREIGN KEY (`seriesID`) REFERENCES `Series` (`seriesID`),
  ADD CONSTRAINT `Episodes_ibfk_2` FOREIGN KEY (`previousEpisode`) REFERENCES `Episodes` (`episodeID`),
  ADD CONSTRAINT `Episodes_ibfk_3` FOREIGN KEY (`nextEpisode`) REFERENCES `Episodes` (`episodeID`);

--
-- Constraints for table `Subscriptions`
--
ALTER TABLE `Subscriptions`
  ADD CONSTRAINT `Subscriptions_ibfk_1` FOREIGN KEY (`customerID`) REFERENCES `Customers` (`customerID`) ON DELETE CASCADE,
  ADD CONSTRAINT `Subscriptions_ibfk_2` FOREIGN KEY (`seriesID`) REFERENCES `Series` (`seriesID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
