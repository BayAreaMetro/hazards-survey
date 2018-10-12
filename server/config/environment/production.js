'use strict';
/*eslint no-process-env:0*/

var sql = require("mssql");
const pool = new sql.ConnectionPool({
    user: process.env.SQL_USER,
    password: process.env.SQL_PWD,
    server: process.env.SERVER,
    database: process.env.DATABASE
});

console.log('database ', process.env.DATABASE);
console.log('user ', process.env.SQL_USER);
console.log('pwd ', process.env.SQL_PWD);
console.log('server ', process.env.SERVER);

pool.connect(err => {
    if (err) console.log(err);
    console.log('connected');
});


// Production specific configuration
// =================================
module.exports = {
    // Server IP
    ip: process.env.OPENSHIFT_NODEJS_IP ||
        process.env.ip ||
        undefined,

    // Server port
    port: process.env.OPENSHIFT_NODEJS_PORT ||
        process.env.PORT ||
        8080,

    sequelize: {
        uri: process.env.SEQUELIZE_URI,
        options: {
            logging: false,
            storage: 'dist.sqlite',
            define: {
                timestamps: false
            }
        }
    },
    mssql: pool
};