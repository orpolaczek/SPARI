/**
 * Created by orpolaczek on 10/10/2015.
 */
var ServerConfig = {
    // HTTP
    httpHost: '10.8.0.25',
    httpPort:  5050,

    // SSL
    httpsEnabled: true,
    httpsHost: 'localhost',
    httpsPort: 5051,
    httpsCertFile: './ssl/server.crt',
    httpsKeyFile: './ssl/server.key',
    httpsCAFile: null
};

var MongoConfig = {
    mongoServer: 'mongodb://localhost:27017/spari-users'
};

module.exports = ServerConfig, MongoConfig;
