var ARICredentials = require("./ari-config.js");
var MongoConfig = require("./spari-config.js");
var ServerConfig = require("./spari-config.js");
var http = require('http');
var https = require('https');
var fs = require('fs');
var httpProxy = require('http-proxy');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var User = require('./models/user-model');


// Pre-generate ARI authentication header
var ariAuthHeader = "Basic " + new Buffer(ARICredentials.ariUsername + ":" + ARICredentials.ariPassword).toString("base64");


//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({
    target: (ARICredentials.ariUsesHTTPS ? 'https://' : 'http://') + ARICredentials.ariServer,
    secure: ARICredentials.httpsValidateCert,
    changeOrigin: true
});


// Intercept all outgoing requests and add auth header to them
proxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('Authorization', ariAuthHeader);
    console.log("Setted header to: " + ariAuthHeader);
});


/*
 This part refers to the chosen authentication method.
 In this case, the local mondodb users database;
 */

// Connect to mongo
var connStr = MongoConfig.mongoServer;
mongoose.connect(connStr, function (err) {
    if (err) throw err;
    console.log("Successfully connected to MongoDB");
});


// Set the Authentication Strategy (According to Passport.JS's chosen method documentation)
passport.use(new BasicStrategy(
    function (userid, password, done) {
        User.findOne({username: userid}, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            user.comparePassword(password, function (err, isMatch) {
                if (err || !isMatch)
                    return done(null, false);
                else
                    return done(null, user);
            });

        });
    }
));

// Define routes on the server

// In this case, no custom logic so we'll receive all the requests with the '*' wildcard
app.all('*',
    passport.authenticate('basic', {session: false}),    // Perform authentication with Passport.JS
    function (req, res) {
        console.log('Current user: %s', req.user);
        // res.setHeader("Access-Control-Allow-Origin", "*"); // If you wish to allow CORS`
        proxy.web(req, res); // Proxy the request!
    })
;


var httpServer = http.createServer(app).listen(
    ServerConfig.httpPort,
    ServerConfig.httpHost,
    function () {
        console.log('listening at http://%s:%s', ServerConfig.httpHost, ServerConfig.httpPort);
    }
);

// If enabled in the configuration - start an SSL server
if (ServerConfig.httpsEnabled) {
    var privateKey = fs.readFileSync(ServerConfig.httpsKeyFile, 'utf8');
    var certificate = fs.readFileSync(ServerConfig.httpsCertFile, 'utf8');
    var credentials = null;
    var ca = null;
    if (ServerConfig.httpsCAFile != null) {
        ca = fs.readFileSync(ServerConfig.httpsCAFile, 'utf8');
        credentials = {key: privateKey, cert: certificate, ca: ca};
    } else {
        credentials = {key: privateKey, cert: certificate};
    }

    https.createServer(credentials, app).listen(ServerConfig.httpsPort, ServerConfig.httpsHost, function () {
        console.log('listening at https://%s:%s', ServerConfig.httpsHost, ServerConfig.httpsPort);
    });
}
