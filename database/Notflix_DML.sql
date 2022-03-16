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
           AND email = :emailInput);

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
INSERT INTO Series (seriesTitle, contentRating)
VALUES (:seriesTitleInput, :contentRatingSelect);

-- READ all Series entities
SELECT * FROM Series;

-- READ selected Series entities
-- Front-end logic constructs WHERE parameters.
SELECT * FROM Series
WHERE (seriesID = :seriesIDInput
           AND seriesTitle = :seriesTitleInput
           AND contentRating = :contentRatingSelect);

-- UPDATE selected Series entity.
-- seriesID provided by front-end.
UPDATE Series
SET seriesTitle = :seriesTitleInput, contentRating = :contentRatingSelect
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

-- Read all Episode entities of selected series
-- seriesID provided by front-end (I'm assuming)
SELECT episodeID, episodeTitle FROM Episodes
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

-- SUBSCRIPTION QUERIES
-- CREATE a new Subscription entity
INSERT INTO Subscriptions (customerID, seriesID)
VALUES (:customerIDInput, :seriesIDInput);

-- READ all Subscription entities
SELECT subscriptionID, Customers.customerID as customerID,
       Customers.firstName as firstName, Customers.lastName as lastName,
       Series.seriesID as seriesID, Series.title as title,
       dateSubscribed
FROM ((Subscriptions
    INNER JOIN Customers ON Subscriptions.customerID = Customers.customerID)
    INNER JOIN Series ON Subscriptions.seriesID = Series.seriesID);

-- READ selected Subscription entities
-- WHERE conditions built based on front-end request
SELECT subscriptionID, Customers.customerID as customerID,
       Customers.firstName as firstName, Customers.lastName as lastName,
       Series.seriesID as seriesID, Series.title as title,
       dateSubscribed
FROM ((Subscriptions
    INNER JOIN Customers ON Subscriptions.customerID = Customers.customerID)
         INNER JOIN Series ON Subscriptions.seriesID = Series.seriesID)
WHERE (subscriptionID = :subscriptionIDInput
           AND Subscriptions.customerID = :customerIDInput
           AND Subscriptions.seriesID = :seriesIDInput);

-- UPDATE an individual Subscription entity
UPDATE Subscriptions
SET customerID = :customerIDInput, seriesID = :seriesIDInput
WHERE subscriptionID = :subscriptionIDInput;

-- DELETE an individual Subscription entity
DELETE FROM Subscriptions
WHERE subscriptionID = :subscriptionIDInput;

-- CONTENTTYPES QUERIES
-- CREATE new ContentType entity
INSERT INTO ContentTypes (seriesID, genreID)
VALUES (:seriesIDInput, :genreIDInput);

-- READ all ContentType entities
SELECT Series.seriesID as seriesID, Series.title as seriesTitle,
       Genres.genreID as genreID, Genres.genreName as genreName
FROM ((ContentTypes
    INNER JOIN Series ON ContentTypes.seriesID = Series.seriesID)
    INNER JOIN Genres ON ContentTypes.genreID = Genres.genreID);

-- READ selected ContentType entities
SELECT Series.seriesID as seriesID, Series.title as seriesTitle,
       Genres.genreID as genreID, Genres.genreName as genreName
FROM ((ContentTypes
    INNER JOIN Series ON ContentTypes.seriesID = Series.seriesID)
         INNER JOIN Genres ON ContentTypes.genreID = Genres.genreID)
WHERE (ContentTypes.seriesID = :seriesIDInput
           AND ContentTypes.genreID = :genreIDInput);

-- UPDATE ContentType entity omitted in favor of delete/create new

-- DELETE ContentType entity
DELETE FROM ContentTypes
WHERE (seriesID = :seriesIDInput AND genreID = :genreIDInput);
