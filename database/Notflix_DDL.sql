-- Clear existing tables
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Series;
DROP TABLE IF EXISTS Episodes;
DROP TABLE IF EXISTS Genres;
DROP TABLE IF EXISTS Subscriptions;
DROP TABLE IF EXISTS ContentTypes;
SET FOREIGN_KEY_CHECKS = 1;

-- CREATE CUSTOMER TABLE
CREATE TABLE Customers(
        customerID INT(11) PRIMARY KEY AUTO_INCREMENT,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL
);

-- CREATE SERIES TABLE
CREATE TABLE Series(
        seriesID INT(11) PRIMARY KEY AUTO_INCREMENT,
        seriesTitle VARCHAR(255) NOT NULL,
        contentRating VARCHAR(255) NOT NULL
);

-- CREATE AN EPISODE TABLE (with previous episode and next episode as foreign keys recursively)
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
CREATE TABLE Genres(
        genreID INT(11) PRIMARY KEY AUTO_INCREMENT,
        genreName VARCHAR(255) NOT NULL
);

-- create Subscription relationship(M:M)
CREATE TABLE Subscriptions(
        subscriptionID INT(11) PRIMARY KEY AUTO_INCREMENT,
        customerID INT NOT NULL,
        seriesID INT NOT NULL,
        dateSubscribed DATE DEFAULT (CURDATE()),
        FOREIGN KEY (customerID) REFERENCES Customers(customerID) ON DELETE CASCADE,
        FOREIGN KEY (seriesID) REFERENCES Series(seriesID) ON DELETE CASCADE
);

-- create content Types relationship (m:m)
CREATE TABLE ContentTypes(
        seriesID INT NOT NULL,
        genreID INT NOT NULL,
        PRIMARY KEY(seriesID, genreID),
        FOREIGN KEY (seriesID) REFERENCES Series(seriesID),
        FOREIGN KEY (genreID) REFERENCES Genres(genreID)
);

-- insert data
INSERT INTO Customers(firstName, lastName, email)
VALUES("John", "Doe", "johndoe@gmail.com");

INSERT INTO Customers(firstName, lastName, email)
VALUES("Jim", "Halpert", "jimothy@dundermifflin.com");

INSERT INTO Customers(firstName, lastName, email)
VALUES("Tina", "Belcher", "tina@bobsburgers.com");

INSERT INTO Series(title, contentRating)
VALUES("How I Met Your Father", "PG");

INSERT INTO Series(title, contentRating)
VALUES("The Mandalorian", "PG-13");

INSERT INTO Series(title, contentRating)
VALUES("The Witcher", "R");

INSERT INTO Episodes(seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES(
        (SELECT seriesID FROM Series WHERE title="How I Met Your Father"),
        "Pilot", "2022-01-18", NULL, NULL, " himyf01.m4a"
);

INSERT INTO Episodes(seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES(
        (SELECT seriesID FROM Series WHERE title="How I Met Your Father"),
        "FOMO", "2022-01-18", NULL, NULL, "himyf02.m4a"
);

INSERT INTO Episodes(seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES(
          (SELECT seriesID FROM Series WHERE title="How I Met Your Father"),
          "The Fixer", "2022-01-25", NULL, NULL, "himyf03.m4a"
      );

INSERT INTO Episodes(seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Mandalorian"),
          "The Mandalorian", "2019-11-12", NULL, NULL, "mando01.m4a"
      );

INSERT INTO Episodes(seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Mandalorian"),
          "The Child", "2019-11-15", NULL, NULL, "mando02.m4a"
      );

INSERT INTO Episodes(seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Mandalorian"),
          "The Sin", "2019-11-22", NULL, NULL, "mando03.m4a"
      );

INSERT INTO Episodes(seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Witcher"),
          "A Grain of Truth", "2021-12-17", NULL, NULL, "witchy01.m4a"
      );

INSERT INTO Episodes(seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Witcher"),
          "Kaer Morhen", "2021-12-17", NULL, NULL, "witchy02.m4a"
      );

INSERT INTO Episodes(seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Witcher"),
          "What Is Lost", "2021-12-17", NULL, NULL, "witchy03.m4a"
      );

-- update episode "FOMO" previousEp to "pilot"
UPDATE Episodes
SET previousEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="Pilot"),
    nextEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="The Fixer")
WHERE episodeTitle = "FOMO";

-- update next_episode of "pilot" to episode 2
UPDATE Episodes
SET nextEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="FOMO")
WHERE episodeTitle = "Pilot";

UPDATE Episodes
SET previousEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="FOMO")
WHERE episodeTitle = "The Fixer";

UPDATE Episodes
SET nextEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="The Child")
WHERE episodeTitle = "The Mandalorian";

UPDATE Episodes
SET nextEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="The Sin"),
    previousEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="The Mandalorian")
WHERE episodeTitle = "The Child";

UPDATE Episodes
SET previousEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="The Child")
WHERE episodeTitle = "The Sin";

UPDATE Episodes
SET nextEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="Kaer Morhen")
WHERE (episodeTitle = "A Grain of Truth");

UPDATE Episodes
SET nextEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="What Is Lost"),
    previousEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="A Grain of Truth")
WHERE episodeTitle = "Kaer Morhen";

UPDATE Episodes
SET previousEpisode = (SELECT episodeID FROM Episodes WHERE episodeTitle="Kaer Morhen")
WHERE episodeTitle = "What Is Lost";


INSERT INTO Genres(genreName) VALUES ("romance");
INSERT INTO Genres(genreName) VALUES ("comedy");
INSERT INTO Genres(genreName) VALUES ("fantasy");
INSERT INTO Genres(genreName) VALUES ("sci-fi");
INSERT INTO Genres(genreName) VALUES ("drama");
INSERT INTO Genres(genreName) VALUES ("western");

INSERT INTO ContentTypes(seriesID, genreID)
VALUES(
        (SELECT seriesID FROM Series WHERE title="How I Met Your Father"),
        (SELECT genreID FROM Genres WHERE genreName="romance")
);

INSERT INTO ContentTypes(seriesID, genreID) VALUES(
        (SELECT seriesID FROM Series WHERE title="How I Met Your Father"),
        (SELECT genreID FROM Genres WHERE genreName= "comedy")
);

INSERT INTO ContentTypes(seriesID, genreID)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Mandalorian"),
          (SELECT genreID FROM Genres WHERE genreName="sci-fi")
      );

INSERT INTO ContentTypes(seriesID, genreID)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Mandalorian"),
          (SELECT genreID FROM Genres WHERE genreName="western")
      );

INSERT INTO ContentTypes(seriesID, genreID)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Witcher"),
          (SELECT genreID FROM Genres WHERE genreName="fantasy")
      );

INSERT INTO ContentTypes(seriesID, genreID)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Witcher"),
          (SELECT genreID FROM Genres WHERE genreName="drama")
      );

INSERT INTO Subscriptions(seriesID, customerID)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Witcher"),
          (SELECT customerID FROM Customers WHERE lastName="Belcher")
      );

INSERT INTO Subscriptions(seriesID, customerID)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Mandalorian"),
          (SELECT customerID FROM Customers WHERE lastName="Halpert")
      );

INSERT INTO Subscriptions(seriesID, customerID)
VALUES(
          (SELECT seriesID FROM Series WHERE title="How I Met Your Father"),
          (SELECT customerID FROM Customers WHERE lastName="Doe")
      );

INSERT INTO Subscriptions(seriesID, customerID)
VALUES(
          (SELECT seriesID FROM Series WHERE title="The Witcher"),
          (SELECT customerID FROM Customers WHERE lastName="Halpert")
      );