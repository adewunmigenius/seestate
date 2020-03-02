const express = require('express');
const chalk = require('chalk');
const path = require('path');
const mysql = require('mysql');

const bodyParser = require('body-parser');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express()
const port = process.env.PORT || 3000;

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(cookieParser())
app.use(session({
    secret: 'carRental',
    resave: true,
    saveUninitialized: true,
    // cookie: { maxAge: 3600000 }
}))

app.use(express.static(path.join(__dirname,"/public/")));
app.use('/fonts', express.static(path.join(__dirname,"/public/fonts")));
app.set('views', "./src/views")
app.set("view engine", 'ejs')

const nav = [{link:'/cars', title:'CARS'}, {link:'/rent',title:'Rent Cars'},{link:'/customers',title:'Customers'}]

// For all route system
const carRouter = require('./src/routes/carRoutes').router(nav)
const customerRouter = require('./src/routes/customerRoutes').router(nav)
const rentsRouter = require('./src/routes/rentsRoutes')(nav)

app.use('/cars', carRouter)
app.use('/rent', rentsRouter)
app.use('/customers', customerRouter)

app.get("/",(req,res)=>{
    res.render(
        "index",
        {
            nav,
            title: 'CAR RENTAL'
        })
})

app.listen(port, ()=>{
    console.log(`server is listening on port ${chalk.green(port)}`);
})