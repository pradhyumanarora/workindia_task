const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cricbuzz_db',
    password: 'root',
    port: 5433,
})

module.exports = pool;
