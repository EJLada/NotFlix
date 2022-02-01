// get an instance of mysql to use in the app
import mysql from 'mysql';

// Create a 'connection pool' with provided credentials
let pool = mysql.createPool({
    connectionLimit : 10,
    host : 'classmysql.engr.oregonstate.edu',
    user : 'cs340_ladae',
    password : '5111',
    database : 'cs340_ladae'
})

// Export for use in the application
export {pool};