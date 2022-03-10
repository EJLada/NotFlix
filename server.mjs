/*
    SETUP
*/

// Express
import express from 'express';
import cors from "cors";
const app = express();
const PORT = process.env.PORT || 3000;

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
let db = mysql.createPool(process.env.JAWSDB_MARIA_URL);


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

function updateBuilder(query, body) {
    query += ` SET `;
    let concat = false;
    for (const [key, value] of Object.entries(body)) {
        if (concat) {
            query += ', ';
        }
        query += `${key}='${value}'`;
        concat = true;
    }
    return query;
}


/*
    ROUTES
*/
// ------------------------CUSTOMER ROUTES------------------------------------//
// CREATE new Customer record
app.post('/customers', function(req, res) {
    // Check for all necessary data to create record
    for (const _ in ['firstName', 'lastName', 'email']) {
        if (!(_ in Object.keys(req.body))) {
            return res.status(400).send('Bad Request');
        }
    }

    let addCustomer = `INSERT INTO Customers (firstName, lastName, email)` +
        ` VALUES ('${req.body.firstName}', '${req.body.lastName}',` +
        ` '${req.body.email}');`;

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send(err);
        }
        instance.query(addCustomer, function(err) {
            if (err) throw err;
            instance.query(`SELECT LAST_INSERT_ID();`, function(err, results) {
                if (err) throw err;
                // Send data
                instance.release();
                res.status(201).send(`${HOME}/customers/${Object.values(results[0])[0]}`);
            });
        });
    });
});

// READ all or selected Customers
app.get('/customers', function(req, res) {
    // Define query
    let getCustomers = 'SELECT customerID, firstName, lastName, email FROM Customers'
    // Build query if search parameters exist
    if (Object.keys(req.body).length !== 0) {
        for (const _ in Object.keys(req.body)) {
            if (!(_ in ['firstName', 'lastName', 'email'])) {
                return res.status(404).send('Not Found');
            }
        }
        getCustomers = queryBuilder(getCustomers, req.body);
    }
    // Otherwise return all
    else getCustomers += ';';

    // Get data
    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
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
            return res.status(503).send('Bad connection to database');
        }
        instance.query(getCustomer, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.send({customer: results});
        });
    });
});

// UPDATE an individual customer record
app.put('/customers/:id', function(req, res) {
    // Handle empty requests
    if (Object.keys(req.body).length === 0) {
        return res.status(204).send('No Content');
    }
    // Build update query
    for (const _ in Object.keys(req.body)) {
        if (!(_ in ['firstName', 'lastName', 'email'])) {
            return res.status(404).send('Not Found');
        }
    }
    let updateCustomer = `UPDATE Customers`;
    updateCustomer = updateBuilder(updateCustomer, req.body);
    updateCustomer += ` WHERE customerID=${req.params.id};`;
    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(updateCustomer, function(err) {
            instance.release();
            if (err) {
                return res.status(404).send(err);
            }
            res.status(200).send('OK');
        });
    });
});

// DELETE an individual Customer record
app.delete('/customers/:id', function(req, res) {
    // define query
    let deleteCustomer = `DELETE FROM Customers WHERE customerID=${req.params.id};`;
    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(deleteCustomer, function(err) {
            instance.release();
            if (err) {
                return res.status(404).send(err);
            }
            res.status(200).send('Customer deleted successfully.');
        });
    });
});

// --------------------------SERIES ROUTES------------------------------------//
// CREATE new Series record
app.post('/series', function(req, res) {
    // Check for all necessary data to create record
    for (const _ in ['seriesTitle', 'contentRating']) {
        if (!(_ in Object.keys(req.body))) {
            return res.status(400).send('Bad Request');
        }
    }

    let addSeries = `INSERT INTO Series (title, contentRating)` +
        ` VALUES ('${req.body.seriesTitle}', '${req.body.contentRating}');`;

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(addSeries, function(err) {
            if (err) throw err;
            instance.query(`SELECT LAST_INSERT_ID();`, function(err, results) {
                if (err) throw err;
                // Send data
                instance.release();
                res.status(201).send(`${HOME}/series/${Object.values(results[0])[0]}`);
            });
        });
    });
});

// READ all or selected Series
app.get('/series', function(req, res) {
    let getSeries = 'SELECT seriesID, title, contentRating FROM Series';
    // Check for search parameters
    if (Object.keys(req.body).length !== 0) {
        for (const _ in Object.keys(req.body)) {
            if (!(_ in ['seriesTitle', 'contentRating'])) {
                return res.status(404).send('Not Found');
            }
        }
        getSeries = queryBuilder(getSeries, req.body);
    }
    // Otherwise return all
    else getSeries += ';';

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(getSeries, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200).send({series: results});
        });
    });
});

// READ an individual Series record
app.get('/series/:id', function(req, res) {
    let getSeries = 'SELECT seriesID, title, contentRating FROM Series ' +
        'WHERE seriesID=' + req.params.id + ';';

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(getSeries, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200).send({series: results});
        });
    });
});

// UPDATE an individual Series record
app.put('/series/:id', function(req, res) {
    // Handle empty requests
    if (Object.keys(req.body).length === 0) {
        return res.status(204).send('No Content');
    }
    // Build update query
    for (const _ in Object.keys(req.body)) {
        if (!(_ in ['seriesTitle', 'contentRating'])) {
            return res.status(404).send('Not Found');
        }
    }
    let updateSeries = `UPDATE Series`;
    updateSeries = updateBuilder(updateSeries, req.body);
    updateSeries += ` WHERE seriesID=${req.params.id};`;
    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(updateSeries, function(err) {
            instance.release();
            if (err) {
                return res.status(404).send(err);
            }
            res.status(200).send('OK');
        });
    });
});

// DELETE an individual Series record
app.delete('/series/:id', function(req, res) {
    // define query
    let deleteSeries = `DELETE FROM Series WHERE seriesID=${req.params.id};`;
    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(deleteSeries, function(err) {
            instance.release();
            if (err) {
                return res.status(404).send(err);
            }
            res.status(200).send('Series deleted successfully.');
        });
    });
});

// --------------------------EPISODE ROUTES-----------------------------------//
// CREATE new Episode record
app.post('/episodes', function(req, res) {
    // Check for all necessary data to create record
    for (const _ in ['seriesID', 'episodeTitle', 'releaseDate', 'fileSource']) {
        if (!(_ in Object.keys(req.body))) {
            return res.status(400).send('Bad Request');
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
            return res.status(503).send('Bad connection to database');
        }
        instance.query(addEpisode, function(err){
            if (err) throw err;
            instance.query(`SELECT LAST_INSERT_ID();`, function(err, results) {
                if (err) throw err;
                // Send data
                instance.release();
                res.status(201).send(`${HOME}/episodes/${Object.values(results[0])[0]}`);
            });
        });
    });
});

// READ all or selected Episodes
app.get('/episodes', function(req, res) {
    let getEpisodes = 'SELECT episodeID, seriesID, episodeTitle, releaseDate, ' +
        'previousEpisode, nextEpisode, fileSource FROM Episodes';
    // Check for search parameters
    if (Object.keys(req.body).length !== 0) {
        for (const _ in Object.keys(req.body)) {
            if (!(_ in ['episodeTitle', 'releaseDate', 'prevEpisode', 'nextEpisode', 'fileSource'])) {
                return res.status(404).send('Not Found');
            }
        }
        getEpisodes = queryBuilder(getEpisodes, req.body);
    }
    // Otherwise return all
    else getEpisodes += ';';

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(getEpisodes, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200).send({episodes: results});
        });
    });
});

// READ an individual Episode record
app.get('/episodes/:id', function(req, res) {
    let getEpisode = 'SELECT episodeID, seriesID, episodeTitle, releaseDate, ' +
        'previousEpisode, nextEpisode, fileSource FROM Episodes WHERE episodeID='
        + `'${req.params.id}';`;

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(getEpisode, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200).send({episode: results});
        });
    });
});

// UPDATE an individual Episode record
app.put('/episodes/:id', function(req, res) {
    // Handle empty requests
    if (Object.keys(req.body).length === 0) {
        return res.status(204).send('No Content');
    }
    // Build update query
    for (const _ in Object.keys(req.body)) {
        if (!(_ in ['episodeTitle', 'releaseDate', 'prevEpisode', 'nextEpisode', 'fileSource'])) {
            return res.status(404).send('Not Found');
        }
    }
    let updateEpisode = `UPDATE Episodes`;
    updateEpisode = updateBuilder(updateEpisode, req.body);
    updateEpisode += ` WHERE episodeID=${req.params.id};`;
    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(updateEpisode, function(err) {
            instance.release();
            if (err) {
                return res.status(404).send(err);
            }
            res.status(200).send('OK');
        });
    });
});

// DELETE an individual Episode record
app.delete('/episodes/:id', function(req, res) {
    // define query
    let deleteEpisode = `DELETE FROM Episodes WHERE episodeID=${req.params.id};`;
    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(deleteEpisode, function(err) {
            instance.release();
            if (err) {
                return res.status(404).send(err);
            }
            res.status(200).send('Episode deleted successfully.');
        });
    });
});

// ------------------------------GENRE ROUTES---------------------------------//
// CREATE new Genre record
app.post('/genres', function(req, res) {
    // Check for all necessary data to create record
    if (!('genreName' in Object.keys(req.body))) {
        return res.status(400).send('Bad Request');
    }

    let addGenre = `INSERT INTO Genres (genreName) VALUES ('${req.body.genreName}');`;

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(addGenre, function(err){
            if (err) throw err;
            instance.query(`SELECT LAST_INSERT_ID();`, function(err, results) {
                if (err) throw err;
                // Send data
                instance.release();
                res.status(201).send(`${HOME}/genres/${Object.values(results[0])[0]}`);
            });
        });
    });
});

// READ all or selected Genres
app.get('/genres', function(req, res) {
    let getGenres = 'SELECT genreID, genreName FROM Genres';
    // Check for search parameters
    if (Object.keys(req.body).length !== 0) {
        for (const _ in Object.keys(req.body)) {
            if (!(_ === 'genreName')) {
                return res.status(404).send('Not Found');
            }
        }
        getGenres = queryBuilder(getGenres, req.body);
    }
    // Otherwise return all
    else getGenres += ';';

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(getGenres, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200).send({genres: results});
        });
    });
});

// READ an individual Genre record
app.get('/genres/:id', function(req, res) {
    let getGenre = `SELECT genreID, genreName FROM Genres WHERE genreID='${req.params.id}';`;

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(getGenre, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200).send({genre: results});
        });
    });
});

// UPDATE an individual Genre record
app.put('/genres/:id', function(req, res) {
    // Handle empty requests
    if (Object.keys(req.body).length === 0) {
        return res.status(204).send('No Content');
    }
    // Build update query
    for (const _ in Object.keys(req.body)) {
        if (!(_ === 'genreName')) {
            return res.status(404).send('Not Found');
        }
    }
    let updateGenre = `UPDATE Genres SET genreName='${req.body.genreName}' ` +
        `WHERE genreID=${req.params.id};`;
    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(updateGenre, function(err) {
            instance.release();
            if (err) {
                return res.status(404).send(err);
            }
            res.status(200).send('OK');
        });
    });
});

// DELETE an individual Genre record
app.delete('/genres/:id', function(req, res) {
    // define query
    let deleteGenre = `DELETE FROM Genres WHERE genreID=${req.params.id};`;
    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(deleteGenre, function(err) {
            instance.release();
            if (err) {
                return res.status(404).send(err);
            }
            res.status(200).send('Genre deleted successfully.');
        });
    });
});

// ---------------------------SUBSCRIPTION ROUTES-----------------------------//
// CREATE new Subscription record
app.post('/subscriptions', function(req, res) {
    // Check for all necessary data to create record
    for (const _ in ['customerID', 'seriesID']) {
        if (!(_ in Object.keys(req.body))) {
            return res.status(400).send('Bad Request');
        }
    }

    let addSubscription = `INSERT INTO Subscriptions (customerID, seriesID)` +
        ` VALUES ('${req.body.customerID}', '${req.body.seriesID}');`;

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(addSubscription, function(err){
            if (err) throw err;
            instance.query(`SELECT LAST_INSERT_ID();`, function(err, results) {
                if (err) throw err;
                // Send data
                instance.release();
                res.status(201).send(`${HOME}/subscriptions/${Object.values(results[0])[0]}`);
            });
        });
    });
});

// READ all or selected Subscriptions
app.get('/subscriptions', function(req, res) {
    let getSubscriptions = 'SELECT subscriptionID, Customers.customerID as customerID, ' +
        'Customers.firstName as firstName, Customers.lastName as lastName, ' +
        'Series.seriesID as seriesID, Series.title as title, dateSubscribed FROM ((Subscriptions ' +
        'INNER JOIN Customers ON Subscriptions.customerID = Customers.customerID) ' +
        'INNER JOIN Series ON Subscriptions.seriesID = Series.seriesID)'
    // Check for search parameters
    if (Object.keys(req.body).length !== 0) {
        for (const _ in Object.keys(req.body)) {
            if (!(_ in ['seriesID', 'customerID', 'dateSubscribed'])) {
                return res.status(404).send('Not Found');
            }
        }
        getSubscriptions = queryBuilder(getSubscriptions, req.body);
    }
    else getSubscriptions += ';';

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(getSubscriptions, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200).send({subscriptions: results});
        });
    });
});

// READ an individual Subscription record
app.get('/subscriptions/:id', function(req, res) {
    let getSubscription = 'SELECT subscriptionID, Customers.customerID as customerID, ' +
        'Customers.firstName as firstName, Customers.lastName as lastName, ' +
        'Series.seriesID as seriesID, Series.title as title, dateSubscribed FROM ((Subscriptions ' +
        'INNER JOIN Customers ON Subscriptions.customerID = Customers.customerID) ' +
        'INNER JOIN Series ON Subscriptions.seriesID = Series.seriesID) WHERE '
        + `subscriptionID='${req.params.id}';`;

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(getSubscription, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200).send({subscription: results});
        });
    });
});

// UPDATE an individual Subscription record
app.put('/subscriptions/:id', function(req, res) {
    // Handle empty requests
    if (Object.keys(req.body).length === 0) {
        return res.status(204).send('No Content');
    }
    // Build update query
    for (const _ in Object.keys(req.body)) {
        if (!(_ in ['seriesID', 'customerID', 'dateSubscribed'])) {
            return res.status(404).send('Not Found');
        }
    }
    let updateSubscription = `UPDATE Subscriptions`;
    updateSubscription = updateBuilder(updateSubscription, req.body);
    updateSubscription += ` WHERE subscriptionID=${req.params.id};`;
    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(updateSubscription, function(err) {
            instance.release();
            if (err) {
                return res.status(404).send(err);
            }
            res.status(200).send('OK');
        });
    });
});

// DELETE an individual Subscription record
app.delete('/subscriptions/:id', function(req, res) {
    // define query
    let deleteSubscription = `DELETE FROM Subscriptions WHERE subscriptionID=${req.params.id};`;
    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(deleteSubscription, function(err) {
            instance.release();
            if (err) {
                return res.status(404).send(err);
            }
            res.status(200).send('Subscription deleted successfully.');
        });
    });
});

// ---------------------------CONTENT-TYPE ROUTES-----------------------------//
// CREATE new ContentType record
app.post('/contents', function(req, res) {
    // Check for all necessary data to create record
    for (const _ in ['seriesID', 'genreID']) {
        if (!(_ in Object.keys(req.body))) {
            return res.status(400).send('Bad Request');
        }
    }

    let addContentType = `INSERT INTO ContentTypes (seriesID, genreID)` +
        ` VALUES ('${req.body.seriesID}', '${req.body.genreID}');`;

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(addContentType, function(err){
            if (err) throw err;
            instance.query(`SELECT LAST_INSERT_ID();`, function(err, results) {
                if (err) throw err;
                // Send data
                instance.release();
                res.status(201).send(`${HOME}/contents/${Object.values(results[0])[0]}`);
            });
        });
    });
});

// READ all or selected ContentTypes
app.get('/contents', function(req, res) {
    let getContentTypes = 'SELECT Series.seriesID as seriesID, Series.title as seriesTitle, Genres.genreID as genreID, Genres.genreName as genreName FROM ' +
        '((ContentTypes INNER JOIN Series ON ContentTypes.seriesID = Series.seriesID) ' +
        'INNER JOIN Genres ON ContentTypes.genreID = Genres.genreID)'
    // Check for search parameters
    if (Object.keys(req.body).length !== 0) {
        for (const _ in Object.keys(req.body)) {
            if (!(_ in ['seriesID', 'genreID'])) {
                return res.status(404).send('Not Found');
            }
        }
        getContentTypes = queryBuilder(getContentTypes, req.body);
    }
    else getContentTypes += ';';

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(getContentTypes, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200).send({contentTypes: results});
        });
    });
});

// READ individual ContentType record needs a request body
// containing 'seriesID' and 'genreID'.
app.get('/contents', function(req, res) {
    let getContentType = 'SELECT Series.seriesID as seriesID, Series.title as seriesTitle, Genres.genreID as genreID, Genres.genreName as genreName FROM ' +
        '((ContentTypes INNER JOIN Series ON ContentTypes.seriesID = Series.seriesID) ' +
        'INNER JOIN Genres ON ContentTypes.genreID = Genres.genreID) ' +
        `WHERE (ContentTypes.seriesID=${req.body.seriesID} AND ContentTypes.genreID=${req.body.genreID});`;

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(getContentType, function(err, results){
            instance.release();
            if (err) throw err;
            // Send data
            res.status(200).send({contentType: results});
        });
    });
});

// UPDATE individual ContentType record is unnecessary - instead just delete and
// create a new record.
app.put('/contents', function(req, res) {
    // Generic response
    res.status(405).send('Method Not Allowed');
});

// DELETE individual ContentType record needs a request body containing
// 'seriesID' and 'genreID'
app.delete('/contents', function(req, res) {
    // define query
    let deleteContentType = `DELETE FROM ContentTypes WHERE ` +
        `(seriesID=${req.body.seriesID} AND genreID=${req.body.genreID});`;

    db.getConnection((err, instance) => {
        if (err) {
            return res.status(503).send('Bad connection to database');
        }
        instance.query(deleteContentType, function(err) {
            instance.release();
            if (err) {
                return res.status(404).send(err);
            }
            res.status(200).send('ContentType deleted successfully.');
        });
    });
});



/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started; press Ctrl-C to terminate.');
});