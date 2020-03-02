const express = require('express');
const authRouter = express.Router()
const userModel = require('../models/user')
const passport = require('passport');

function router(nav){
    authRouter.route('/').get((req,res)=>{
        res.render('signin',{nav, title: 'Sign in'})
    }).post(passport.authenticate('local',{
        successRedirect: '/auth/profile',
        failureRedirect: '/'
    }))

    authRouter.route('/signup').post((req, res)=>{
        // database;
        const {name, username, password} =  req.body
        let user = new userModel({
            username, name, password
          })
          
        user.save()
            .then(doc => {
            console.log(doc)
            })
            .catch(err => {
            console.error(err)
            })

        req.login(req.body, ()=>{
            res.redirect('/auth/profile')
        })
    })
    authRouter.route('/profile')
    .all((req, res, next)=>{
        if(req.user){
            next()
        }else{
            res.redirect('/');
        }
    })
    .get((req,res)=>{
        res.json(req.user)
    })
    
    return authRouter
}

module.exports = router