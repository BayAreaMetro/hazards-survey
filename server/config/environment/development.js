'use strict';
/*eslint no-process-env:0*/
var sql = require("mssql");
const pool = new sql.ConnectionPool({
    user: process.env.SQL_USER,
    password: process.env.SQL_PWD,
    server: process.env.SERVER,
    database: process.env.DATABASE
})
console.log('database ', process.env.DATABASE);
console.log('user ', process.env.SQL_USER);
console.log('pwd ', process.env.SQL_PWD);
console.log('server ', process.env.SERVER);


pool.connect(err => {
    if (err) console.log(err);
    console.log('connected');
});

// Development specific configuration
// ==================================
module.exports = {

    // Sequelize connection opions
    sequelize: {
        uri: process.env.SEQUELIZE_URI,
        options: {
            logging: false,
            storage: 'dev.sqlite',
            define: {
                timestamps: false
            }
        }
    },
    mssql: pool,
    // Seed database on startup
    seedDB: false

};