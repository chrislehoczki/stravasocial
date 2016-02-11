'use strict';

module.exports = {
	
	'facebookAuth' : {
        'clientID'      : process.env.FACEBOOK_KEY, // your App ID
        'clientSecret'  : process.env.FACEBOOK_SECRET, // your App Secret
        'callbackURL'   : process.env.APP_URL + "auth/facebook/callback",
        "profileFields" : ["name", "email"]
    },

    'stravaAuth' : {
        'clientID'      : process.env.STRAVA_CLIENT_ID, // your App ID
        'clientSecret'  : process.env.STRAVA_CLIENT_SECRET, // your App Secret
        'accessToken'	: process.env.STRAVA_ACCESS_TOKEN,
        'callbackURL'   : process.env.STRAVA_REDIRECT_URI + "auth/strava/callback"
    }


   
};
