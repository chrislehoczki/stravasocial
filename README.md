# Strava Social

## An athlete social network app built with Express, MongoDB, ReactJS and Strava V3 API.

## Overview

This project combined social login with Strava and D3 mapping and force-directed graphs. 

Once logged in, users followers are collated. An API call collates their relationships with other users and a force-directed graph is created showing the relationships within your athlete community.

The next process geocodes user locations server side using Google Geocoding API, and then uses D3 mapping and topoJSON to display a users followers on an interactive global map. 


## Technologies

NodeJS with Express middleware, Mongoose, PassportJS for authentication, and Isomorphic ReactJS for front and back end.

