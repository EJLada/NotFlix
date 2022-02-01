/*
    SETUP
*/
// Express
import express from 'express';
const app = express();
const PORT = 8045;

// Database
import * as db from './database/db-connector.mjs';
// const db = require('./db-connector');

/*
    ROUTES
*/
app.get('/', function(req, res) {
    // Define queries
    let query1 = 'DROP TABLE IF EXISTS diagnostic;';
    let query2 = 'CREATE TABLE diagnostic(id INT PRIMARY KEY AUTO_INCREMENT, text VARCHAR(255) NOT NULL);';
    let query3 = 'INSERT INTO diagnostic(text) VALUES ("MySQL is working!")';
    let query4 = 'SELECT * FROM diagnostic;';

    // Execute every query in async manner. We want each query to finish before the next one starts

    // DROP TABLE...
    db.pool.query(query1, function(err, results, fields){

        // CREATE TABLE
        db.pool.query(query2, function(err, results, fields){

            // INSERT INTO
            db.pool.query(query3, function(err, results, fields){

                // SELECT *
                db.pool.query(query4, function(err, results, fields){

                    // Send results to the browser
                    let base = "<h1>MySQL Results:</h1>";
                    res.send(base + JSON.stringify(results));
                });
            });
        });

    });
});

/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.');
});