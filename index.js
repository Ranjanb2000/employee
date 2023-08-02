const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8000;
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const MongoStore=require('connect-mongo');
const flash=require('connect-flash');
const customWare=require('./config/middleware');

app.use(express.urlencoded());
app.use(cookieParser());

app.use(express.static('./assets'));
app.use(expressLayouts);
//Extract style and script from layout page
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);
// use Express Router..

console.log("routes loaded")


// Set up view Engine..
app.set('view engine', 'ejs');
app.set('views', './views');

const store=  MongoStore.create(
    {
        mongoUrl:"mongodb://127.0.0.1:27017/authenticate",
        autoRemove: 'disabled'
    
    },
    function(err){
        console.log(err ||  'connect-mongodb setup ok');
    }
)
app.use(session({
    name: 'codeial',
    // TODO change the secret before deployment in production mode
    secret: 'blahsomething',
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },store:store
    
}));

// this are all the functions used for authentication
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);
app.use(flash());
app.use(customWare.setFlash);
// middleware used for accessing routes folder.
app.use('/', require('./routes'));

// used for running the server.
app.listen(port, function(err){
    if(err){
        console.log(`Error in running Server, ${err}`); // interpolation
    }
    console.log(`Server is running on port: ${port}`);
})