const express = require('express');
var q = require('q');
const userRouter = express.Router()

// mysql database connection
const connectionManager = require('../database/connect');

function getAllUsers() {
    var deferred = q.defer();

    connectionManager.getConnection()
        .then(function (connection) {
            connection.query('SELECT * FROM users ORDER BY id DESC', function (error, results) {
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

function saveUser(name, email) {
    var deferred = q.defer();

    var currencyInsert = 'INSERT INTO users(name, email) VALUES (?,?)';
    
    connectionManager.getConnection()
        .then(function (connection) {
            var query = connectionManager.prepareQuery(currencyInsert, [name, email]);
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
    // userRouter.use((req,res,next)=>{
    //     if(req.user){
    //         next()
    //     }else{
    //         res.redirect('/');
    //     }
    // })
    userRouter.route('/').get((req, res)=>{
        let resdata = getAllUsers();
        resdata.then((resdev) => {
            // console.log("resata", resdev);
            res.render('rental/customers',
            {
                title: 'All Customers For Car Rental',
                nav,
                users: resdev,
                showSuccess: req.session.success ? req.session.success : false
            },
            req.session.success = null
        )
        })
    })
    userRouter.route('/store').post((req, res)=>{
        const {name, email} =  req.body
        let resdata = saveUser(name,email);
        resdata.then((resdev) => {
            // console.log(resdev)
            if(!(req.session.success)){
                req.session.success = true
            }
            res.redirect('/customers')
            // res.send('succesfully save customers to DB')
        }).catch((err) => {
            console.log(err)
            if(!(req.session.success)){
                req.session.success = null
            }
            res.send('Failed to save car')
        })
    })
    
    return userRouter
}

module.exports = {router: router, users: getAllUsers}