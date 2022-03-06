-- CRUD queries to modify data in NOTFLIX project backend database.
-- The : character denotes a placeholder variable to be populated by
-- a value from a front-end user input.

-- CUSTOMERS QUERIES
-- CREATE a new Customer entity
INSERT INTO Customers (firstName, lastName, email)
VALUES (:firstNameInput, :lastNameInput, :emailInput);

-- READ all Customer entities
SELECT * FROM Customers;

-- READ selected Customer entities.
-- Front-end logic constructs WHERE parameters.
SELECT * FROM Customers
WHERE (customerID = :customerIDInput
           AND firstName = :firstNameInput
           AND lastName = :lastNameInput
           AND email = :lastNameInput);

-- UPDATE selected Customer entity.
-- customerID provided by front-end.
UPDATE Customers
SET firstName = :firstNameInput, lastName = :lastNameInput, email = :emailInput
WHERE customerID = :customerID;

-- DELETE a selected Customer entity.
-- customerID provided by front-end.
DELETE FROM Customers
WHERE customerID = :customerID;

-- SERIES QUERIES
-- CREATE a new Series entity
INSERT INTO Series (title, contentRating)
VALUES (:titleInput, :contentRatingSelectFromDropdown);

-- READ all Series entities
SELECT * FROM Series;

-- READ selected Series entities
-- Front-end logic constructs WHERE parameters.
SELECT * FROM Series
WHERE (seriesID = :seriesIDInput
           AND title = :titleInput
           AND contentRating = :contentRatingSelectFromDropdown);

-- UPDATE selected Series entity.
-- seriesID provided by front-end.
UPDATE Series
SET title = :titleInput, contentRating = :contentRatingSelectFromDropdown
WHERE seriesID = :seriesID;

-- DELETE a selected Series entity.
-- seriesID provided by front-end.
DELETE FROM Series
WHERE seriesID = :seriesID;

-- EPISODES QUERIES
-- CREATE a new Episode entity
INSERT INTO Episodes (seriesID, episodeTitle, releaseDate, previousEpisode, nextEpisode, fileSource)
VALUES (:seriesIDInput, :episodeTitleInput, :releaseDateInput, :previousEpisodeInput, :nextEpisodeInput, :fileSourceInput);

-- READ all Episode entities
SELECT * FROM Episodes;

-- READ selected Episode entities with input as substring of episodeTitle
SELECT * FROM Episodes
WHERE episodeTitle LIKE '%:episodeTitleInput%';

-- READ selected Episode entities with matching release date
SELECT * FROM Episodes
WHERE releaseDate = :releaseDateInput;

-- READ selected Episode entities with matching release date and input as substring of episodeTitle
SELECT * FROM Episodes
WHERE (releaseDate = :releaseDateInput
    AND episodeTitle LIKE '%:episodeTitleInput%');

-- UPDATE selected Episode entity
-- episodeID provided by front-end
UPDATE Episodes
SET seriesID = :seriesIDInput,
    episodeTitle = :episodeTitleInput,
    releaseDate = :releaseDateInput,
    previousEpisode = :previousEpisodeSelectFromDropdown,
    nextEpisode = :nextEpisodeSelectFromDropdown,
    fileSource = :fileSourceInput
WHERE episodeID = :episodeID;

-- query to retrieve episodes in a series for previousEpisode and nextEpisode dropdown
-- seriesID can be input or by frontend
-- I don't see episode number so I'm assuming order by date/episodeID both work)

-- Read all Episode entities of selected series
-- seriesID provided by front-end (I'm assuming)
SELECT episodeTitle FROM Episodes
WHERE seriesID = :seriesID
ORDER BY episodeID;

-- DELETE selected Episode entity
-- EpisodeID provided by front-end
DELETE FROM Episodes
WHERE episodeID = :episodeID;

-- GENRES QUERIES
-- CREATE a new Genre entity
INSERT INTO Genres (genreName)
VALUES (:genreNameInput);

-- READ all Genre entities
SELECT * FROM Genres;

-- READ selected Genre entities
SELECT * FROM Genres
WHERE genreName = :genreNameInput;

-- UPDATE selected Genre entity
-- GenreID provided by front-end
UPDATE Genres
SET genreName = :genreNameInput
WHERE genreID = :genreID;

-- DELETE selected Genre entity
-- GenreID provided by front-end
DELETE FROM Genres
WHERE genreID = :genreID;

--

-- TODO: Subscriptions and ContentTypes queries
