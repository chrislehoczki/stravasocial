'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt   = require('bcrypt-nodejs');

var User = new Schema({
    
    strava: {
       id: String,
       token: String,
       details: Object,
       followers: Array,
       followerIds: Array,
       addedFollowers: Boolean,
       geocoded: Boolean
    }
});







  //METHODS FOR LOCAL SIGNUP
   
User.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
User.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};


module.exports = mongoose.model('User', User);

