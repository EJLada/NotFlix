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

function errorHandler(err, req, res, next) {
    res.status(500).send(err);
}


/*
    ROUTES
*/
// ------------------------CUSTOMER ROUTES------------------------------------//
// CREATE new Customer record
app.post('/customers', function(req, res, next) {
    // Check for all necessary data to create record
    for (const _ of ['firstName', 'lastName', 'email']) {
        if (!(_ in req.body)) {
            return res.status(400).send('Bad Request');
        }
    }

    let addCustomer = `INSERT INTO Customers (firstName, lastName, email)` +
        ` VALUES ('${req.body.firstName}', '${req.body.lastName}',` +
        ` '${req.body.email}');`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
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
    } catch(err) {
        next(err);
    }
});

// READ an individual Customer record
app.get('/customers/:id', function(req, res, next) {
    // Define query
    let getCustomer = 'SELECT customerID, firstName, lastName, email FROM ' +
        'Customers WHERE customerID=' + req.params.id + ';';

    // Get data
    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(getCustomer, function(err, results){
                if (err) throw err;
                instance.release();
                // Send data
                res.status(200).send({customer: results});
            });
        });
    } catch(err) {
        next(err);
    }
});

// READ all or selected Customers
app.get('/customers', function(req, res, next) {
    // Define query
    let getCustomers = 'SELECT customerID, firstName, lastName, email FROM Customers'
    // Build query if search parameters exist

    if (Object.keys(req.query).length !== 0) {
        for (const _ in Object.keys(req.query)) {
            if (!(_ in ['firstName', 'lastName', 'email'])) {
                return res.status(404).send('Not Found');
            }
        }
        getCustomers = queryBuilder(getCustomers, req.query);
    }
    // Otherwise return all
    else getCustomers += ';';

    // Get data
    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(getCustomers, function(err, results){
                if (err) throw err;
                instance.release();
                // Send data
                res.status(200).send({customers: results});
            });
        });
    } catch(err) {
        next(err);
    }
});

// UPDATE an individual customer record
app.put('/customers/:id', function(req, res, next) {
    // Handle empty requests
    if (Object.keys(req.body).length === 0) {
        return res.status(204).send('No Content');
    }
    // Build update query
    for (const i in Object.keys(req.body)) {
        if (!(i in ['customerID', 'firstName', 'lastName', 'email'])) {
            return res.status(404).send('Not Found');
        }
    }
    let updateCustomer = `UPDATE Customers`;
    updateCustomer = updateBuilder(updateCustomer, req.body);
    updateCustomer += ` WHERE customerID=${req.params.id};`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(updateCustomer, function(err) {
                if (err) throw err;
                instance.release();
                res.status(200).send('OK');
            });
        });
    } catch(err) {
        next(err);
    }
});

// DELETE an individual Customer record
app.delete('/customers/:id', function(req, res, next) {
    // define query
    let deleteCustomer = `DELETE FROM Customers WHERE customerID=${req.params.id};`;
    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(deleteCustomer, function(err) {
                if (err) throw err;
                instance.release();
                res.status(200).send('Customer deleted successfully.');
            });
        });
    } catch(err) {
        next(err);
    }
});

// --------------------------SERIES ROUTES------------------------------------//
// CREATE new Series record
app.post('/series', function(req, res, next) {
    // Check for all necessary data to create record
    for (const _ in ['seriesTitle', 'contentRating']) {
        if (!(_ in Object.keys(req.body))) {
            return res.status(400).send('Bad Request');
        }
    }

    let addSeries = `INSERT INTO Series (title, contentRating)` +
        ` VALUES ('${req.body.seriesTitle}', '${req.body.contentRating}');`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(addSeries, function (err) {
                if (err) throw err;
                instance.query(`SELECT LAST_INSERT_ID();`, function (err, results) {
                    if (err) throw err;
                    // Send data
                    instance.release();
                    res.status(201).send(`${HOME}/series/${Object.values(results[0])[0]}`);
                });
            });
        });
    } catch(err) {
        next(err);
    }
});

// READ an individual Series record
app.get('/series/:id', function(req, res, next) {
    let getSeries = 'SELECT seriesID, title, contentRating FROM Series ' +
        'WHERE seriesID=' + req.params.id + ';';

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(getSeries, function (err, results) {
                instance.release();
                if (err) throw err;
                // Send data
                res.status(200).send({series: results});
            });
        });
    } catch(err) {
        next(err);
    }
});

// READ all or selected Series
app.get('/series', function(req, res, next) {
    let getSeries = 'SELECT seriesID, title, contentRating FROM Series';
    // Check for search parameters
    if (Object.keys(req.query).length !== 0) {
        for (const _ in Object.keys(req.query)) {
            if (!(_ in ['seriesID', 'seriesTitle', 'contentRating'])) {
                return res.status(404).send('Not Found');
            }
        }
        getSeries = queryBuilder(getSeries, req.query);
    }
    // Otherwise return all
    else getSeries += ';';

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(getSeries, function (err, results) {
                instance.release();
                if (err) throw err;
                // Send data
                res.status(200).send({series: results});
            });
        });
    } catch(err) {
        next(err);
    }
});

// UPDATE an individual Series record
app.put('/series/:id', function(req, res, next) {
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

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(updateSeries, function (err) {
                instance.release();
                if (err) {
                    return res.status(404).send(err);
                }
                res.status(200).send('OK');
            });
        });
    } catch(err) {
        next(err);
    }
});

// DELETE an individual Series record
app.delete('/series/:id', function(req, res, next) {
    // define query
    let deleteSeries = `DELETE FROM Series WHERE seriesID=${req.params.id};`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(deleteSeries, function (err) {
                instance.release();
                if (err) {
                    return res.status(404).send(err);
                }
                res.status(200).send('Series deleted successfully.');
            });
        });
    } catch(err) {
        next(err);
    }
});

// --------------------------EPISODE ROUTES-----------------------------------//
// CREATE new Episode record
app.post('/episodes', function(req, res, next) {
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

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(addEpisode, function (err) {
                if (err) throw err;
                instance.query(`SELECT LAST_INSERT_ID();`, function (err, results) {
                    if (err) throw err;
                    // Send data
                    instance.release();
                    res.status(201).send(`${HOME}/episodes/${Object.values(results[0])[0]}`);
                });
            });
        });
    } catch(err) {
        next(err);
    }
});

// READ an individual Episode record
app.get('/episodes/:id', function(req, res, next) {
    let getEpisode = 'SELECT seriesID, episodeID, episodeTitle, releaseDate, ' +
        'previousEpisode, nextEpisode, fileSource FROM Episodes WHERE episodeID='
        + `'${req.params.id}';`;

    try {
        db.getConnection((err, instance) => {
            if (err) {
                return res.status(503).send('Bad connection to database');
            }
            instance.query(getEpisode, function (err, results) {
                instance.release();
                if (err) throw err;
                // Send data
                res.status(200).send({episode: results});
            });
        });
    } catch(err) {
        next(err);
    }
});

// READ all or selected Episodes
app.get('/episodes', function(req, res, next) {
    let getEpisodes = 'SELECT seriesID, episodeID, episodeTitle, releaseDate, ' +
        'previousEpisode, nextEpisode, fileSource FROM Episodes';
    // Check for search parameters
    if (Object.keys(req.query).length !== 0) {
        for (const _ in Object.keys(req.query)) {
            if (!(_ in ['episodeID', 'episodeTitle', 'releaseDate', 'prevEpisode', 'nextEpisode', 'fileSource'])) {
                return res.status(404).send('Not Found');
            }
        }
        getEpisodes = queryBuilder(getEpisodes, req.query);
    }
    // Otherwise return all
    else getEpisodes += ';';

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(getEpisodes, function (err, results) {
                instance.release();
                if (err) throw err;
                // Send data
                res.status(200).send({episodes: results});
            });
        });
    } catch(err) {
        next(err);
    }
});

// UPDATE an individual Episode record
app.put('/episodes/:id', function(req, res, next) {
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

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(updateEpisode, function (err) {
                instance.release();
                if (err) {
                    return res.status(404).send(err);
                }
                res.status(200).send('OK');
            });
        });
    } catch(err) {
        next(err);
    }
});

// DELETE an individual Episode record
app.delete('/episodes/:id', function(req, res, next) {
    // define query
    let deleteEpisode = `DELETE FROM Episodes WHERE episodeID=${req.params.id};`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(deleteEpisode, function (err) {
                instance.release();
                if (err) {
                    return res.status(404).send(err);
                }
                res.status(200).send('Episode deleted successfully.');
            });
        });
    } catch(err) {
        next(err);
    }
});

// ------------------------------GENRE ROUTES---------------------------------//
// CREATE new Genre record
app.post('/genres', function(req, res, next) {
    // Check for all necessary data to create record
    if (!('genreName' in req.body)) {
        console.log(Object.keys(req.body));
        return res.status(400).send('Bad Request');
    }

    let addGenre = `INSERT INTO Genres (genreName) VALUES ('${req.body.genreName}');`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(addGenre, function (err) {
                if (err) throw err;
                instance.query(`SELECT LAST_INSERT_ID();`, function (err, results) {
                    if (err) throw err;
                    // Send data
                    instance.release();
                    res.status(201).send(`${HOME}/genres/${Object.values(results[0])[0]}`);
                });
            });
        });
    } catch(err) {
        next(err);
    }
});

// READ an individual Genre record
app.get('/genres/:id', function(req, res, next) {
    let getGenre = `SELECT genreID, genreName FROM Genres WHERE genreID='${req.params.id}';`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(getGenre, function (err, results) {
                instance.release();
                if (err) throw err;
                // Send data
                res.status(200).send({genre: results});
            });
        });
    } catch(err) {
        next(err);
    }
});

// READ all or selected Genres
app.get('/genres', function(req, res, next) {
    let getGenres = 'SELECT genreID, genreName FROM Genres';
    // Check for search parameters
    if (Object.keys(req.query).length !== 0) {
        for (const _ in Object.keys(req.query)) {
            if (!(_ in ['genreID', 'genreName'])) {
                return res.status(404).send('Not Found');
            }
        }
        getGenres = queryBuilder(getGenres, req.query);
    }
    // Otherwise return all
    else getGenres += ';';

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(getGenres, function (err, results) {
                instance.release();
                if (err) throw err;
                // Send data
                res.status(200).send({genres: results});
            });
        });
    } catch(err) {
        next(err);
    }
});

// UPDATE an individual Genre record
app.put('/genres/:id', function(req, res, next) {
    // Handle empty requests
    if (Object.keys(req.body).length === 0) {
        return res.status(204).send('No Content');
    }
    // Build update query
    for (const _ in Object.keys(req.body)) {
        if (!('genreName' in req.body)) {
            return res.status(404).send('Not Found');
        }
    }
    let updateGenre = `UPDATE Genres SET genreName='${req.body.genreName}' ` +
        `WHERE genreID=${req.params.id};`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(updateGenre, function (err) {
                instance.release();
                if (err) {
                    return res.status(404).send(err);
                }
                res.status(200).send('OK');
            });
        });
    } catch(err) {
        next(err);
    }
});

// DELETE an individual Genre record
app.delete('/genres/:id', function(req, res, next) {
    // define query
    let deleteGenre = `DELETE FROM Genres WHERE genreID=${req.params.id};`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(deleteGenre, function (err) {
                instance.release();
                if (err) {
                    return res.status(404).send(err);
                }
                res.status(200).send('Genre deleted successfully.');
            });
        });
    } catch(err) {
        next(err);
    }
});

// ---------------------------SUBSCRIPTION ROUTES-----------------------------//
// CREATE new Subscription record
app.post('/subscriptions', function(req, res, next) {
    // Check for all necessary data to create record
    for (const _ in ['customerID', 'seriesID']) {
        if (!(_ in Object.keys(req.body))) {
            return res.status(400).send('Bad Request');
        }
    }

    let addSubscription = `INSERT INTO Subscriptions (customerID, seriesID)` +
        ` VALUES ('${req.body.customerID}', '${req.body.seriesID}');`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(addSubscription, function (err) {
                if (err) throw err;
                instance.query(`SELECT LAST_INSERT_ID();`, function (err, results) {
                    if (err) throw err;
                    // Send data
                    instance.release();
                    res.status(201).send(`${HOME}/subscriptions/${Object.values(results[0])[0]}`);
                });
            });
        });
    } catch(err) {
        next(err);
    }
});

// READ an individual Subscription record
app.get('/subscriptions/:id', function(req, res, next) {
    let getSubscription = 'SELECT subscriptionID, Customers.customerID as customerID, ' +
        'Customers.firstName as firstName, Customers.lastName as lastName, ' +
        'Series.seriesID as seriesID, Series.title as title, dateSubscribed FROM ((Subscriptions ' +
        'INNER JOIN Customers ON Subscriptions.customerID = Customers.customerID) ' +
        'INNER JOIN Series ON Subscriptions.seriesID = Series.seriesID) WHERE '
        + `subscriptionID='${req.params.id}';`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(getSubscription, function (err, results) {
                instance.release();
                if (err) throw err;
                // Send data
                res.status(200).send({subscription: results});
            });
        });
    } catch(err) {
        next(err);
    }
});

// READ all or selected Subscriptions
app.get('/subscriptions', function(req, res, next) {
    let getSubscriptions = 'SELECT subscriptionID, Customers.customerID as customerID, ' +
        'Customers.firstName as firstName, Customers.lastName as lastName, ' +
        'Series.seriesID as seriesID, Series.title as title, dateSubscribed FROM ((Subscriptions ' +
        'INNER JOIN Customers ON Subscriptions.customerID = Customers.customerID) ' +
        'INNER JOIN Series ON Subscriptions.seriesID = Series.seriesID)'
    // Check for search parameters
    if (Object.keys(req.query).length !== 0) {
        for (const _ in Object.keys(req.query)) {
            if (!(_ in ['subscriptionID', 'seriesID', 'customerID', 'dateSubscribed'])) {
                return res.status(404).send('Not Found');
            }
        }
        getSubscriptions = queryBuilder(getSubscriptions, req.query);
    }
    else getSubscriptions += ';';

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(getSubscriptions, function (err, results) {
                instance.release();
                if (err) throw err;
                // Send data
                res.status(200).send({subscriptions: results});
            });
        });
    } catch(err) {
        next(err);
    }
});

// UPDATE an individual Subscription record
app.put('/subscriptions/:id', function(req, res, next) {
    // Handle empty requests
    if (Object.keys(req.body).length === 0) {
        return res.status(204).send('No Content');
    }
    // Build update query
    for (const _ of ['seriesID', 'customerID', 'dateSubscribed']) {
        if (!(_ in req.body)) {
            return res.status(404).send('Not Found');
        }
    }
    // for (const _ in Object.keys(req.body)) {
    //     if (!(_ in ['seriesID', 'customerID', 'dateSubscribed'])) {
    //         return res.status(404).send('Not Found');
    //     }
    // }
    let updateSubscription = `UPDATE Subscriptions`;
    updateSubscription = updateBuilder(updateSubscription, req.body);
    updateSubscription += ` WHERE subscriptionID=${req.params.id};`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(updateSubscription, function (err) {
                instance.release();
                if (err) {
                    return res.status(404).send(err);
                }
                res.status(200).send('OK');
            });
        });
    } catch(err) {
        next(err);
    }
});

// DELETE an individual Subscription record
app.delete('/subscriptions/:id', function(req, res, next) {
    // define query
    let deleteSubscription = `DELETE FROM Subscriptions WHERE subscriptionID=${req.params.id};`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(deleteSubscription, function (err) {
                instance.release();
                if (err) {
                    return res.status(404).send(err);
                }
                res.status(200).send('Subscription deleted successfully.');
            });
        });
    } catch(err) {
        next(err);
    }
});

// ---------------------------CONTENT-TYPE ROUTES-----------------------------//
// CREATE new ContentType record
app.post('/contents', function(req, res, next) {
    // Check for all necessary data to create record
    for (const _ of ['seriesID', 'genreID']) {
        if (!(_ in req.body)) {
            return res.status(400).send('Bad Request');
        }
    }

    let addContentType = `INSERT INTO ContentTypes (seriesID, genreID)` +
        ` VALUES ('${req.body.seriesID}', '${req.body.genreID}');`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(addContentType, function (err) {
                if (err) throw err;
                instance.query(`SELECT LAST_INSERT_ID();`, function (err, results) {
                    if (err) throw err;
                    // Send data
                    instance.release();
                    res.status(201).send(`${HOME}/contents/${Object.values(results[0])[0]}`);
                });
            });
        });
    } catch(err) {
        next(err);
    }
});

// READ all or selected ContentTypes.
// READ individual ContentType record just needs a request body
// containing both 'seriesID' and 'genreID'.
app.get('/contents', function(req, res, next) {
    let getContentTypes = 'SELECT Series.seriesID as seriesID, Series.title as seriesTitle, Genres.genreID as genreID, Genres.genreName as genreName FROM ' +
        '((ContentTypes INNER JOIN Series ON ContentTypes.seriesID = Series.seriesID) ' +
        'INNER JOIN Genres ON ContentTypes.genreID = Genres.genreID)'
    // Check for search parameters
    if (Object.keys(req.query).length !== 0) {
        for (const _ in Object.keys(req.query)) {
            if (!(_ in ['seriesID', 'genreID'])) {
                return res.status(404).send('Not Found');
            }
        }
        getContentTypes = queryBuilder(getContentTypes, req.query);
    }
    else getContentTypes += ';';

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(getContentTypes, function (err, results) {
                instance.release();
                if (err) throw err;
                // Send data
                res.status(200).send({contentTypes: results});
            });
        });
    } catch(err) {
        next(err);
    }
});

// UPDATE individual ContentType record is unnecessary - instead just delete and
// create a new record.
app.put('/contents', function(req, res, next) {
    // Generic response
    res.status(405).send('Method Not Allowed');
});

// DELETE individual ContentType record needs a request body containing
// 'seriesID' and 'genreID'
app.delete('/contents', function(req, res, next) {
    // define query
    let deleteContentType = `DELETE FROM ContentTypes WHERE ` +
        `(seriesID=${req.body.seriesID} AND genreID=${req.body.genreID});`;

    try {
        db.getConnection((err, instance) => {
            if (err) throw err;
            instance.query(deleteContentType, function (err) {
                instance.release();
                if (err) {
                    return res.status(404).send(err);
                }
                res.status(200).send('ContentType deleted successfully.');
            });
        });
    } catch(err) {
        next(err);
    }
});

app.use(errorHandler);

/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started at %s; press Ctrl-C to terminate.', HOME);
});