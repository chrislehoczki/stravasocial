'use strict';

var path = process.cwd();
var passport = require('passport');

//REACT
var React = require('react');
var ReactDOM = require("react-dom")
var ReactDOMServer = require("react-dom/server")
var ReactBootstrap = require("react-bootstrap")

//USER SCHEMA	
var Users = require('../models/users.js');
	
//HTTP/STREAMS
var http = require("http")
var https = require("https")
var concatStream = require("concat-stream")

//GEOCODING
var geocoderProvider = 'google';
var httpAdapter = 'http';
var httpsAdapter = "https"
var key = "AIzaSyDGjrvaLZJSAD1U6mY5tYXIzDGxISW8JOc"
// optionnal 
var extra = {
    apiKey: key, // for Mapquest, OpenCage, Google Premier 
    formatter: null         // 'gpx', 'string', ... 
};
 
var geocoder = require('node-geocoder')(geocoderProvider, httpsAdapter, extra);


//EXPORT FUNCTION FOR APP

module.exports = function (app, passport) {

	//////////////////////////////						
	//AUTHENTICATION STRATEGIES///
	//////////////////////////////

	// route middleware to make sure a user is logged in
	function isLoggedIn(req, res, next) {

	    // if user is authenticated in the session, carry on 
	    if (req.isAuthenticated())
	        return next();

	    // if they aren't redirect them to the home page
	    res.redirect('/login');
	}

	//FBOOK LOGIN
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/',
            failureRedirect : '/login'
        }));


	//STRAVA
   
   	app.get('/auth/strava',
 		 passport.authenticate('strava'/*, { scope: ['write'] }*/));

	app.get('/auth/strava/callback', 
  	passport.authenticate('strava', { failureRedirect: '/login' }),
  		function(req, res) {
  			console.log("it was successful")
    // Successful authentication, redirect home.
    	res.redirect('/');
  	});

    //////////////////////////////						
	//PAGE RENDERS////////////////
	//////////////////////////////


	//API////////////////
	app.route('/login')
		.get(function (req, res) {
			res.render('index', { }); 
		});



	app.route('/')
		.get(isLoggedIn, function (req, res) {

			//var ControlContainer = React.createFactory(require("../components/ControlContainer.js"));	
			//GET ALL BOOKS

	
            		//RENDER DASHBOARD WITH ALLBOOKS FOR FAST LOADING
					//var markup = ReactDOMServer.renderToString(ControlContainer({user: req.user}));
					//res.render("dashboard", {markup: markup, props: JSON.stringify(booksArray)});


			res.render('dashboard',  { user: JSON.stringify(req.user)}); 
			
		});

	//TO RENDER PUBLIC USER PAGE

	app.route("/userdata/:id")
		.get(function(req, res) {
			var id = req.params.id;
			console.log(id)
			var query = {"strava.id": id};
					Users
						.findOne({"strava.id": id})
						.exec(function (err, result) {
						if (err) { throw err; }
						console.log("got data")
						console.log(result)
						res.render('user',  { user: JSON.stringify(result)})

					})
		})

	//TO RETURN JSON FOR USER
	app.route("/data/:id")
		.get(function(req, res) {
			var id = req.params.id;
			console.log(id)
			var query = {"strava.id": id};
					Users
						.findOne({"strava.id": id})
						.exec(function (err, result) {
						if (err) { throw err; }
						console.log("got data")
						console.log(result)
						res.json(result)

					})
		})


	//GEOCODE FOLLOWER LOCATIONS

	app.route("/geocode")
		.get(function(req, response) {

			//FOR TESTING 
			/*
			Users
			.findOne({"strava.id": 1267887})
			.exec(function (err, result) {
			if (err) { throw err; }
				var newFollowerData = result.strava.followers
				response.json(newFollowerData)

			})

			return;
			
			*/
			//FOR TESTING

			var id = 1267887;
			if (req.user) {
				id = req.user.strava.id
			}


			if (req.user.strava.geocoded === true) {
				response.json(req.user.strava.followers)
				return;
			}
			
			Users
				.findOne({"strava.id": id})
				.exec(function (err, result) {
					if (err) { throw err; }
			
					var followers = result.strava.followers;

					var counter = 0;
					var offset = 105;

					followers.forEach(function(follower) {

						setTimeout(function() {

						var location = follower.city + "," + follower.country;

						geocoder.geocode(location, function(err, res) {
							
							if (res[0]) {
							follower.lat = res[0].latitude;
							follower.long = res[0].longitude
							}

							counter += 1;
						
							if (followers.length === counter) {
								console.log("finished geocoding")

								Users
									.findOneAndUpdate({"strava.id": id}, { $set: { "strava.followers": followers, "strava.geocoded": true} }, {"new": true})
									.exec(function (err, result) {
									if (err) { throw err; }

									var newFollowerData = result.strava.followers
									response.json(newFollowerData)

								})

							}
						
						})

					}, offset)

					offset += 150;

				})

			})
			
		});

	//TO GET ALL FOLLOWERS FROM STRAVA AND THEIR FOLLOWERS

	app.route("/getallfollowers")

		.get(function(req, response) {

			//FOR TESTING 
			/*
			Users
			.findOne({"strava.id": 1267887})
			.exec(function (err, result) {
			if (err) { throw err; }
				var newFollowerData = result.strava.followers
				response.json(result)

			})

			return;
			*/
			//FOR TESTING


			if (req.user.strava.addedFollowers === true) {
				response.json(req.user)
				return;
			}

			var token = req.user.strava.token;

			var followersOptions = {
			  hostname: 'www.strava.com',
			  path: '/api/v3/athlete/followers',
			  json: true,
			  headers: {
			    'Authorization': "Bearer " + token
			  }
			};

			var followers;
			var myFollowersIds = []

			https.get(followersOptions, followersCallback);

			//GETS ALL FOLLOWERS 
			function followersCallback (res) {
				res.setEncoding("utf8");
				res.pipe(concatStream(function (data) {

			    //FOLLOWERS BECOMES DATA
			    followers = data;
			    followers = JSON.parse(followers)


			    //CREATE SEPARATE ARRAY JUST FOR IDS
			    followers.forEach(function (athlete) {
			         myFollowersIds.push(athlete.id)
			    })
			    //COMPLETE - now move on to get followers
			    getFollowersFollowers()
			  
			    }))

			};

			function getFollowersFollowers () {

				var limit = 150;

				if (followers.length < 150) {
					limit = followers.length;
				}

				var numberRequests = 0; //for loop
				var requestCount = 0; //for callback
				var bool = true; //to stop loop

				followers.forEach(function(follower) {

					numberRequests += 1;

					if (bool) {

						var followersFollowersOptions = {
						hostname: 'www.strava.com',
						path: '/api/v3/athletes/' + follower.id + '/followers',
						json: true,
						headers: {
						'Authorization': "Bearer " + token
						}
						};

						https.get(followersFollowersOptions, function(res) {

							res.setEncoding("utf8");
							res.pipe(concatStream(function (data) {

								data = JSON.parse(data)
								var followersFollowers = []

								data.forEach(function(athlete) {

									if (myFollowersIds.indexOf(athlete.id) > -1) {

										followersFollowers.push(athlete.id)
									}

								})

								follower.followers = followersFollowers;
								follower.followerNumber = data.length;
								requestCount += 1;

								if (requestCount === limit) {
									console.log("last request")
									var query = {"strava.id": req.user.strava.id};
										Users
											.findOneAndUpdate(query, { $set: { "strava.followers": followers, "strava.followerIds" : myFollowersIds, "strava.addedFollowers": true } }, {"new": true})
											.exec(function (err, result) {
											if (err) { throw err; }
											console.log("saved to db")
											response.json(result)

										})
								}


							}));


						})

					}

					if (numberRequests === limit) {
						bool = false;
					}      

					})

				}




		})

	app.route('/logout')
		.get(function (req, res) {
			req.logout();
			res.redirect('/');
		});




	
};