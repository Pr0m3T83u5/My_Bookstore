//IMPORTS
import express from 'express';
import axios from 'axios';
import { act } from 'react';

//APP CONFIG
const app = express();
const PORT = 3000;

//MIDDLEWARE
app.use(express.static('public'));

//ROUTES==========================================================
//root route
app.get('/', (req, res) => {
    res.redirect('/home');
});

//home route
app.get('/home', (req, res) => {
    res.render('home.ejs');
});

//login route
app.get('/login', (req, res) => {
    //Error: no user exists
    res.render('login-Signup/login.ejs', {});
});
app.post('/login', (req, res) => {
    /**
     * get user from database 
     */ 
    console.log("User logged in");
    res.redirect('/home');
});
//signup route
app.get('/signup', (req, res) => {
    //Error: user already exists
    res.render('login-Signup/signUp.ejs', {});
});
app.post('/signup', (req, res) => {
    /**
     * Add user to database 
     */
    console.log("User signed up");
    res.redirect('/home');
});
//================================================================

//API ROUTES======================================================

//================================================================

//Listening Route
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});