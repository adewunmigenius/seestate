const express = require('express');
var q = require('q');
const carRouter = express.Router();

// mysql database connection
const connectionManager = require('../database/connect');

function getAllcars() {
    var deferred = q.defer();

    connectionManager.getConnection()
        .then(function (connection) {
            connection.query('SELECT * FROM cars ORDER BY id DESC', function (error, results) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }
                deferred.resolve(results);
            });
        })
        .fail(function (err) {
            console.error(JSON.stringify(err));
            deferred.reject(err);
        });

    return deferred.promise;
}

function saveCar(name, price) {
    var deferred = q.defer();

    var currencyInsert = 'INSERT INTO cars(name, rental_per_hour) VALUES (?,?)';
    
    connectionManager.getConnection()
        .then(function (connection) {
            var query = connectionManager.prepareQuery(currencyInsert, [name, price]);
            console.log('Query to execute:' + query);
            connection.query(query, function (error, result) {
                if (error) {
                    console.error(error);
                    deferred.reject(error);
                }
                deferred.resolve(result.insertId);
            });
        })
        .fail(function (err) {
            console.error(JSON.stringify(err));
            deferred.reject(err);
        });

    return deferred.promise;
}

function router(nav){
    // to check if user is authenticated
    // carRouter.use((req,res,next)=>{
    //     if(req.user){
    //         next()
    //     }else{
    //         res.redirect('/');
    //     }
    // })
    carRouter.route('/').get((req, res)=>{
        let resdata = getAllcars();
        resdata.then((resdev) => {
            // console.log("resata", resdev);
            res.render('rental/cars',
            {
                title: 'All Cars For Rent',
                nav,
                cars: resdev,
                showSuccess: req.session.success ? req.session.success : false
            },
            req.session.success = null
        )
        })
        
    })
    carRouter.route('/store').post((req, res)=>{
        const {name, price} =  req.body
        let resdata = saveCar(name,price);
        resdata.then((resdev) => {
            console.log(resdev)
            if(!(req.session.success)){
                req.session.success = true
            }
            res.redirect('/cars')
            // res.send('succesfully save car to DB')
        }).catch((err) => {
            console.log(err)
            if(!(req.session.success)){
                req.session.success = null
            }
            res.send('Failed to save car')
        })
    })
    
    return carRouter
}

module.exports = {router: router, cars: getAllcars}