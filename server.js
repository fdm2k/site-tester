var express = require('express');
var request = require('request'),
  statusCodes = require('http').STATUS_CODES;
var ejs = require('ejs');
var path = require('path');
var morgan = require('morgan');
//var fs = require('fs');

// Setup Express
var app     = express();

// Express settings go here
const httpHost = process.env.HOST_ADDRESS || 'http://localhost';
const httpPort = process.env.LISTEN_PORT || '3000';

// Request parameters go here
const httpTimeout = process.env.REQ_TIMEOUT || '60000';
const testWebsite = process.env.REQ_TESTSITE || 'http://www.google.com';
const urls = process.env.REQ_SITELIST || ["http://www.google.com","http://hotmail.com"]

var resData = 'NOT SET';
var fontColour = '';

// view engine setup
app.engine('html', ejs.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public')); 	// set the static files location. /public/img will be /img for users.
app.use(morgan('combined')); 					// log every request to the console

/**
 * Handle multiple requests at once
 * @param urls [array]
 * @param callback [function]
 * @requires request module for node ( https://github.com/mikeal/request )
 */
var __request = function (urls, callback) {

	'use strict';

	var results = {}, t = urls.length, c = 0,
		handler = function (error, response, body) {
			var url = response.request.uri.href;
			results[url] = { error: error, response: response, body: body };
			if (++c === urls.length) { callback(results); }
		};
	while (t--) { request(urls[t], handler); }
};

// Kick off the request function to see if the site is up / down
request(testWebsite, {timeout: 1500}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    resData = 'OK';
    fontColour = 'green';
  } else {
    resData = 'ERROR';
    fontColour = 'red';
  }
});

// Set paths to be handled by Express here
app.get('/', function(req, res){

  // Write the result to both the console and the page
  res.render('pages/index', {
    testWebsite: testWebsite,
    resData: resData,
    fontColour: fontColour
  });
})

app.listen(httpPort);
console.log('The magic happens at '+httpHost+':'+httpPort);

exports = module.exports = app;
