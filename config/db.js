const mysql = require('mysql2');

const connection = mysql.createConnection({
  connectionLimit: 5,
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'journaldb_test',
});

module.exports = connection;
