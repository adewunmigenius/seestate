const mysql = require('mysql');
var q = require('q');

function getConnection() {
    var deferred = q.defer();

    var connection = mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'root',
        password: '', // DB Password
        database: 'carRental' // DB name
    });

    connection.connect(function (err) {
        if (err) {
            console.error(err);
            deferred.reject(err);
        }
        console.log('[CONN] – Connection created with id:'+ connection.threadId);
        deferred.resolve(connection);
    });

    return deferred.promise;
}

function prepareQuery(query, parameters){
    if(!query || !parameters) {
        throw  new Error('query and parameters function parameters should be specified.');
    }
    return mysql.format(query, parameters);
}

module.exports = {
    getConnection : getConnection,
    prepareQuery: prepareQuery
};
