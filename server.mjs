/*
    SETUP
*/

// Express
import express from 'express';
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 8000;

app.enable('trust proxy');
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cors());
app.options('*', cors());

app.get('/', function(req, res) {
    res.send("NotFlix Backend API running.");
});

const HOME = 'https://notflix_backend.herokuapp.com';

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
// CREATE new Customer record
app.post('/customers', function(req, res) {
    // Check for all necessary data to create record
    console.log(req.body);
    for (const _ in ['firstName', 'lastName', 'email']) {
        if (!(_ in Object.keys(req.body))) {
            res.status(400);
            res.send('Bad Request');
        }
    }

    let addCustomer = `INSERT INTO Customers (firstName, lastName, email)` +
        ` VALUES ('${req.body.firstName}', '${req.body.lastName}',` +
        ` '${req.body.email}');`;

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send(err);
        }
        instance.query(addCustomer, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(201);
            res.send(`Customer added successfully`);
        });
    });
});

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

// READ an individual Customer record
app.get('/customers/:id', function(req, res) {
    // Define query
    let getCustomer = 'SELECT customerID, firstName, lastName, email FROM ' +
        'Customers WHERE customerID=' + req.params.id + ';';

    // Get data
    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(getCustomer, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.send({customer: results});
        });
    });
});

// --------------------------SERIES ROUTES------------------------------------//
// CREATE new Series record
app.post('/series', function(req, res) {
    // Check for all necessary data to create record
    for (const _ in ['seriesTitle', 'contentRating']) {
        if (!(_ in Object.keys(req.body))) {
            res.status(400);
            res.send('Bad Request');
        }
    }

    let addSeries = `INSERT INTO Series (title, contentRating)` +
        ` VALUES ('${req.body.seriesTitle}', '${req.body.contentRating}');`;

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(addSeries, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(201);
            res.send(`Series added successfully`);
        });
    });
});

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
            res.status(200);
            res.send({series: results});
        });
    });
});

// READ an individual Series record
app.get('/series/:id', function(req, res) {
    let getSeries = 'SELECT seriesID, title, contentRating FROM Series ' +
        'WHERE seriesID=' + req.params.id + ';';

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(getSeries, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200);
            res.send({series: results});
        });
    });
});

// --------------------------EPISODE ROUTES-----------------------------------//
// CREATE new Episode record
app.post('/episodes', function(req, res) {
    // Check for all necessary data to create record
    for (const _ in ['seriesID', 'episodeTitle', 'releaseDate',
        'prevEpisode', 'nextEpisode', 'fileSource']) {
        if (!(_ in Object.keys(req.body))) {
            res.status(400);
            res.send('Bad Request');
        }
    }

    let addPrevCol = '';
    let addPrevVal = '';
    if (req.body.prevEpisode) {
        addPrevCol = ', previousEpisode';
        addPrevVal = `, '${req.body.prevEpisode}'`;
    }

    let addNextCol = '';
    let addNextVal = '';
    if (req.body.nextEpisode) {
        addNextCol = ', nextEpisode';
        addNextVal = `, '${req.body.nextEpisode}'`;
    }

    let addEpisode = `INSERT INTO Episodes (seriesID, episodeTitle, releaseDate, ` +
        `fileSource${addPrevCol}${addNextCol}) VALUES (${req.body.seriesID}, '${req.body.episodeTitle}'`
        + `, '${req.body.releaseDate}', '${req.body.fileSource}'${addPrevVal}${addNextVal});`;

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(addEpisode, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(201);
            res.send(`Episode created successfully`);
        });
    });
});

// READ all or selected Episodes
app.get('/episodes', function(req, res) {
    let getEpisodes = 'SELECT episodeID, seriesID, episodeTitle, releaseDate, ' +
        'previousEpisode, nextEpisode, fileSource FROM Episodes';
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
            res.status(200);
            res.send({episodes: results});
        });
    });
});

// READ an individual Episode record
app.get('/episodes/:id', function(req, res) {
    let getEpisode = 'SELECT episodeID, seriesID, episodeTitle, releaseDate, ' +
        'previousEpisode, nextEpisode, fileSource FROM Episodes WHERE episodeID='
        + `'${req.params.id}');`;

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(getEpisode, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200);
            res.send({episode: results});
        });
    });
});

// ------------------------------GENRE ROUTES---------------------------------//
// CREATE new Genre record
app.post('/genres', function(req, res) {
    // Check for all necessary data to create record
    for (const _ in ['genreName']) {
        if (!(_ in Object.keys(req.body))) {
            res.status(400);
            res.send('Bad Request');
        }
    }

    let addGenre = `INSERT INTO Genres (genreName) VALUES ('${req.body.genreName}');`;

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(addGenre, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(201);
            res.send(`Genre created successfully`);
        });
    });
});

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
            res.status(200);
            res.send({genres: results});
        });
    });
});

// READ an individual Genre record
app.get('/genres/:id', function(req, res) {
    let getGenre = `SELECT genreID, genreName FROM Genres WHERE genreID='${req.params.id}';`;

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(getGenre, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200);
            res.send({genre: results});
        });
    });
});


// ---------------------------SUBSCRIPTION ROUTES-----------------------------//
// CREATE new Subscription record
app.post('/subscriptions', function(req, res) {
    // Check for all necessary data to create record
    for (const _ in ['customerID', 'seriesID']) {
        if (!(_ in Object.keys(req.body))) {
            res.status(400);
            res.send('Bad Request');
        }
    }

    let addSubscription = `INSERT INTO Subscriptions (customerID, seriesID)` +
        ` VALUES ('${req.body.customerID}', '${req.body.seriesID}');`;

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(addSubscription, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(201);
            res.send(`Subscription added successfully`);
        });
    });
});

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
            res.status(200);
            res.send({subscriptions: results});
        });
    });
});

// READ an individual Subscription record
app.get('/subscriptions/:id', function(req, res) {
    let getSubscription = 'SELECT subscriptionID, customerID, ' +
        'Customers.firstName as firstName, Customers.lastName as lastName, ' +
        'seriesID, Series.title as title, dateSubscribed FROM ((Subscriptions ' +
        'INNER JOIN Customers ON Subscriptions.subscriptionID = Customers.customerID) ' +
        'INNER JOIN Series ON Subscriptions.seriesID = Series.seriesID) WHERE '
        + `subscriptionID='${req.params.id}';`;

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(getSubscription, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200);
            res.send({subscription: results});
        });
    });
});

// ---------------------------CONTENT-TYPE ROUTES-----------------------------//
// CREATE new ContentType record
app.post('/contenttypes', function(req, res) {
    // Check for all necessary data to create record
    for (const _ in ['seriesID', 'genreID']) {
        if (!(_ in Object.keys(req.body))) {
            res.status(400);
            res.send('Bad Request');
        }
    }

    let addContentType = `INSERT INTO ContentTypes (seriesID, genreID)` +
        ` VALUES ('${req.body.seriesID}', '${req.body.genreID}');`;

    db.getConnection((err, instance) => {
        if (err) {
            res.status(503);
            res.send('Bad connection to database');
        }
        instance.query(addContentType, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(201);
            res.send(`ContentType created successfully`);
        });
    });
});

// READ all or selected ContentTypes
app.get('/contenttypes', function(req, res) {
    let getContentTypes = 'SELECT seriesID, Series.title as seriesTitle, genreID, Genres.genreName as genreName FROM ' +
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
            res.status(200);
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