var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var session = require('express-session');
var routes = require('./app/routes/index.js');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var flash    = require('connect-flash');


//MODULES FOR ISOMORPHIC REACT
require("node-jsx").install();
var React = require('react');
var ReactDOMServer = require("react-dom/server")
var ReactBootstrap = require("react-bootstrap")


require('dotenv').load();
require('./app/config/passport')(passport);

//VIEW ENGINE
app.set("view engine", "ejs");
app.set('views', __dirname + '/public/views');

//MONGOOSE CONNECT
mongoose.connect(process.env.MONGO_URI);

app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

//STATIC FILES
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/components', express.static(process.cwd() + '/app/components'));
app.use('/common', express.static(process.cwd() + '/app/common'));



//SESSION INFO
app.use(session({
	secret: 'bookShare',
	resave: false,
	saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash())
//ROUTES
routes(app, passport);





var port = process.env.PORT
app.listen(port, function () {
  console.log('App listening on port: ' + port);
});