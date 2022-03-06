-- CREATE CUSTOMER TABLE
DROP TABLE IF EXISTS Customers;
CREATE TABLE Customers(
        customerID INT(11) PRIMARY KEY AUTO_INCREMENT,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL
);

-- CREATE SERIES TABLE
DROP TABLE IF EXISTS Series;
CREATE TABLE Series(
        seriesID INT(11) PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        contentRating VARCHAR(255) NOT NULL
);

-- CREATE AN EPISODE TABLE (with previous episode and next episode as foreign keys recursively)
DROP TABLE IF EXISTS Episodes;
CREATE TABLE Episodes(
        episodeID INT(11) PRIMARY KEY AUTO_INCREMENT,
        seriesID INT(11),
        FOREIGN KEY (seriesID) REFERENCES Series(seriesID),
        episodeTitle VARCHAR(255) NOT NULL,
        releaseDate DATE NOT NULL,
        previousEpisode INT(11),
        nextEpisode INT(11),
        fileSource VARCHAR(255) NOT NULL,
        FOREIGN KEY (previousEpisode) REFERENCES Episodes(episodeID),
        FOREIGN KEY (nextEpisode) REFERENCES Episodes(episodeID)
);

-- CREATE A GENRE TABLE
DROP TABLE IF EXISTS Genres;
CREATE TABLE Genres(
        genreID INT(11) PRIMARY KEY AUTO_INCREMENT,
        genreName VARCHAR(255) NOT NULL
);

-- create Subscription relationship(M:M)
DROP TABLE IF EXISTS Subscriptions;
CREATE TABLE Subscriptions(
        subscriptionID INT(11) PRIMARY KEY AUTO_INCREMENT,
        customerID INT NOT NULL,
        seriesID INT NOT NULL,
        dateSubscribed DATE DEFAULT (CURDATE()),
        FOREIGN KEY (customerID) REFERENCES Customers(customerID) ON DELETE CASCADE,
        FOREIGN KEY (seriesID) REFERENCES Series(seriesID) ON DELETE CASCADE
);

-- create content Types relationship (m:m)
DROP TABLE IF EXISTS ContentTypes;
CREATE TABLE ContentTypes(
        seriesID INT NOT NULL,
        genreID INT NOT NULL,
        PRIMARY KEY(seriesID, genreID),
        FOREIGN KEY (seriesID) REFERENCES Series(seriesID),
        FOREIGN KEY (genreID) REFERENCES Genres(genreID)
);

-- insert customer, series (with two episodes) of two genres.

INSERT INTO Customers(firstName, lastName, email)
VALUES("John", "Doe", "johndoe@gmail.com");

INSERT INTO Series(title, contentRating)
VALUES("How I Met Your Father", "PG");

INSERT INTO Episodes(seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES(
        (SELECT seriesID FROM Series WHERE title="How I Met Your Father"),
        "pilot", "2022-02-23", NULL, NULL, "www.himyf01.com"
);

-- insert second episode
INSERT INTO Episodes(seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES(
        (SELECT seriesID FROM Series WHERE title="How I Met Your Father"),
        "Robert", "2022-02-28", NULL, NULL, "www.himyf02.com"
);

-- update episode "Robert" previousEp to "pilot"
UPDATE Episodes
SET previousEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="pilot")
WHERE episodeTitle = "Robert";

-- update next_episode of "pilot" to episode 2
UPDATE Episodes
SET nextEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="Robert")
WHERE episodeTitle = "pilot";


INSERT INTO Genres(genreName) VALUES ("romance");
INSERT INTO Genres(genreName) VALUES ("comedy");

INSERT INTO ContentTypes(seriesID, genreID)
VALUES(
        (SELECT seriesID FROM Series WHERE title="How I Met Your Father"),
        (SELECT genreID FROM Genres WHERE genreName="romance")
);

INSERT INTO ContentTypes(seriesID, genreID) VALUES(
        (SELECT seriesID FROM Series WHERE title="How I Met Your Father"),
        (SELECT genreID FROM Genres WHERE genreName= "comedy")
);