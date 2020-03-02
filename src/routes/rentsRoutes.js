const express = require('express');
var q = require('q');
// const app = express();
// const session = require('express-session');

// Use the session middleware
// app.use(session({ secret: 'carRental',resave: true, saveUninitialized: true, cookie: { maxAge: 3600000 }}))

const allCars = require('./carRoutes').cars
const allUsers = require('./customerRoutes').users

const rentRouter = express.Router();

// mysql database connection
const connectionManager = require('../database/connect');

function getAllrent() {
    var deferred = q.defer();

    connectionManager.getConnection()
        .then(function (connection) {
            connection.query('SELECT *, users.name as username, cars.name as carsname FROM rents LEFT JOIN cars ON cars.id = rents.car_id LEFT JOIN users ON users.id = rents.user_id ORDER BY rents.id DESC', function (error, results) {
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

function rentCar(userId, carId, amount, start, end) {
    var deferred = q.defer();

    let rental = 'INSERT INTO rents(user_id,car_id, start_time, end_time, amount) VALUES (?,?,?,?,?)';
    
    connectionManager.getConnection()
        .then(function (connection) {
            var query = connectionManager.prepareQuery(rental, [userId, carId, start, end, amount]);
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
    // rentRouter.use((req,res,next)=>{
    //     if(req.user){
    //         next()
    //     }else{
    //         res.redirect('/');
    //     }
    // })
    rentRouter.route('/').get((req, res)=>{
        if(!(req.session.users && req.session.cars)){
            allCars().then((resdev) => {
                req.session.cars = resdev
            })
            allUsers().then((resdev) => {
                req.session.users = resdev
            })
            // res.redirect('/rent')
        }

        let resdata = getAllrent();
        resdata.then((resdev) => {
            // console.log("resata", resdev);
            res.render('rental/rents',
            {
                title: 'All Cars For Rent',
                nav,
                rents: resdev,
                users: req.session.users,
                cars: req.session.cars,
                showSuccess: req.session.success ? req.session.success : false
            },
            req.session.success = null
        )
        })
        
    })
    rentRouter.route('/store').post((req, res)=>{
        const {userId, car, start, end} =  req.body
        const dcar = car.split(",")
        const carId = parseInt(dcar[0])
        let amount = parseInt(dcar[1])
        amount = (parseInt(end.split(":")[0]) - parseInt(start.split(":")[0])) * amount

        let resdata = rentCar(userId, carId, amount, start, end);
        resdata.then((resdev) => {
            console.log(resdev)
            if(!(req.session.success)){
                req.session.success = true
            }
            res.redirect('/rent')
            // res.send('succesfully rented car')
        }).catch((err) => {
            console.log(err)
            if(!(req.session.success)){
                req.session.success = null
            }
            res.send('Failed to rent car')
        })
    })
    
    return rentRouter
}

module.exports = router