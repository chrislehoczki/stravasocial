'use strict';


var React = require('react');
var ControlContainer = require("./ControlContainer.js")
var ReactDOM = require("react-dom")

//GET PROPS
//var props = JSON.parse(document.getElementById("props").innerHTML)



//RENDER CONTAINER
ReactDOM.render(<ControlContainer />, document.getElementById("react-holder"));
