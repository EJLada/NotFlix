// get an instance of mysql to use in the app
import mysql from 'mysql';

// Create a 'connection pool' with provided credentials
let pool = mysql.createPool({
    connectionLimit : 10,
    host : 'uyu7j8yohcwo35j3.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user : 'ox7v05nnp3scqgwo',
    password : 'pn7on91gnu7m9zq3',
    database : 's5g2j1mi6kecpnrc'
})

// Export for use in the application
export {pool};