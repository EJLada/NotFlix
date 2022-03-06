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
const db = mysql.createPool(process.env.JAWSDB_MARIA_URL);


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
    return query;
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
        getCustomers = queryBuilder(getCustomers, req.body);
    }
    // Otherwise return all
    else getCustomers += ';';

    // Get data
    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(getCustomers, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.send({customers: results});
        });
    });
});

// --------------------------SERIES ROUTES------------------------------------//
// READ all or selected Series
app.get('/series', function(req, res) {
    let getSeries = 'SELECT seriesID, title, contentRating FROM Series';
    // Check for search parameters
    if (req.hasBody) {
        getSeries = queryBuilder(getSeries, req.body);
    }
    // Otherwise return all
    else getSeries += ';';

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(getSeries, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.send({series: results});
        });
    });
});

// --------------------------EPISODE ROUTES-----------------------------------//
// READ all or selected Episodes
app.get('/episodes', function(req, res) {
    let getEpisodes = 'SELECT episodeID, seriesID, episodeTitle, releaseDate, ' +
        'previousEpisode, nextEpisode, fileSource FROM Series';
    // Check for search parameters
    if (req.hasBody) {
        getEpisodes = queryBuilder(getEpisodes, req.body);
    }
    // Otherwise return all
    else getEpisodes += ';';

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(getEpisodes, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.send({episodes: results});
        });
    });
});

// ------------------------------GENRE ROUTES---------------------------------//
// READ all or selected Genres
app.get('/genres', function(req, res) {
    let getGenres = 'SELECT genreID, genreName FROM Genres';
    // Check for search parameters
    if (req.hasBody) {
        getGenres = queryBuilder(getGenres, req.body);
    }
    // Otherwise return all
    else getGenres += ';';

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(getGenres, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.send({genres: results});
        });
    });
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
        getSubscriptions = queryBuilder(getSubscriptions, req.body);
    }
    else getSubscriptions += ';';

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(getSubscriptions, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.send({subscriptions: results});
        });
    });
});

// ---------------------------CONTENT-TYPE ROUTES-----------------------------//
// READ all or selected ContentTypes
app.get('/contentTypes', function(req, res) {
    let getContentTypes = 'SELECT seriesID, Series.title as title, genreID, Genres.genreName as genreName FROM ' +
        '((ContentTypes INNER JOIN Series ON ContentTypes.seriesID = Series.seriesID) ' +
        'INNER JOIN Genres ON ContentTypes.genreID = Genres.genreID)'
    // Check for search parameters
    if (req.hasBody) {
        getContentTypes = queryBuilder(getContentTypes, req.body);
    }
    else getContentTypes += ';';

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(getContentTypes, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.send({contentTypes: results});
        });
    });
});




/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started; press Ctrl-C to terminate.');
});