/*
    SETUP
*/

// Express
import express from 'express';
const app = express();
const PORT = process.env.PORT || 8000;

app.enable('trust proxy');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/', function(req, res) {
    res.send("NotFlix Backend API running.");
});

// Database
import mysql from 'mysql';
import * as db from './database/db-connector.mjs';



// Functions

/**
 * Builds the WHERE clause of a SQL query - call only if body parameters exist
 * @param query - the query to be constructed
 * @param body - req.body of the request sent to the api
 */
function queryBuilder(query, body) {
    query += ' WHERE (';
    let concat = false;
    for (const [key, value] of Object.entries(body)) {
        if (concat) {
            query += ' AND ';
        }
        query += `${key}='${value}'`;
        concat = true;
    }
    query += ');';
}


/*
    ROUTES
*/
// ------------------------CUSTOMER ROUTES------------------------------------//
// READ all or selected Customers
app.get('/customers', function(req, res) {
    // Define query
    let getCustomers = 'SELECT customerID, firstName, lastName, email FROM Customers'
    // Build query if search parameters exist
    if (req.hasBody) {
        queryBuilder(getCustomers, req.body);
    }
    // Otherwise return all
    else getCustomers += ';';

    // Get data
    db.pool.query(getCustomers, function(err, results, fields){
        // Send data
        res.send({customers: results});
    })
});

// --------------------------SERIES ROUTES------------------------------------//
// READ all or selected Series
app.get('/series', function(req, res) {
    let getSeries = 'SELECT seriesID, title, contentRating FROM Series';
    // Check for search parameters
    if (req.hasBody) {
        queryBuilder(getSeries, req.body);
    }
    // Otherwise return all
    else getSeries += ';';

    db.pool.query(getSeries, function(err, results, fields){
        // Send data
        res.send({series: results});
    })
});

// --------------------------EPISODE ROUTES-----------------------------------//
// READ all or selected Episodes
app.get('/episodes', function(req, res) {
    let getEpisodes = 'SELECT episodeID, seriesID, episodeTitle, releaseDate, ' +
        'previousEpisode, nextEpisode, fileSource FROM Series';
    // Check for search parameters
    if (req.hasBody) {
        queryBuilder(getEpisodes, req.body);
    }
    // Otherwise return all
    else getEpisodes += ';';

    db.pool.query(getEpisodes, function(err, results, fields){
        // Send data
        res.send({episodes: results});
    })
});

// ------------------------------GENRE ROUTES---------------------------------//
// READ all or selected Genres
app.get('/genres', function(req, res) {
    let getGenres = 'SELECT genreID, genreName FROM Genres';
    // Check for search parameters
    if (req.hasBody) {
        queryBuilder(getGenres, req.body);
    }
    // Otherwise return all
    else getGenres += ';';

    db.pool.query(getGenres, function(err, results, fields){
        res.send({genres: results});
    })
});


// ---------------------------SUBSCRIPTION ROUTES-----------------------------//
// READ all or selected Subscriptions
app.get('/subscriptions', function(req, res) {
    let getSubscriptions = 'SELECT subscriptionID, customerID, ' +
        'Customers.firstName as firstName, Customers.lastName as lastName, ' +
        'seriesID, Series.title as title, dateSubscribed FROM ((Subscriptions ' +
        'INNER JOIN Customers ON Subscriptions.subscriptionID = Customers.customerID) ' +
        'INNER JOIN Series ON Subscriptions.seriesID = Series.seriesID)'
    // Check for search parameters
    if (req.hasBody) {
        queryBuilder(getSubscriptions, req.body);
    }
    else getSubscriptions += ';';

    db.pool.query(getSubscriptions, function(err, results, fields){
        res.send({subscriptions: results});
    })
});

// ---------------------------CONTENT-TYPE ROUTES-----------------------------//
// READ all or selected ContentTypes
app.get('/contentTypes', function(req, res) {
    let getContentTypes = 'SELECT seriesID, Series.title as title, genreID, Genres.genreName as genreName FROM ' +
        '((ContentTypes INNER JOIN Series ON ContentTypes.seriesID = Series.seriesID) ' +
        'INNER JOIN Genres ON ContentTypes.genreID = Genres.genreID)'
    // Check for search parameters
    if (req.hasBody) {
        queryBuilder(getContentTypes, req.body);
    }
    else getContentTypes += ';';

    db.pool.query(getContentTypes, function(err, results, fields){
        res.send({contentTypes: results});
    })
});




/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started; press Ctrl-C to terminate.');
});