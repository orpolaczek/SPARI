


// Connect to mongo
var connStr = MongoConfig.mongoServer;
mongoose.connect(connStr, function (err) {
    if (err) throw err;
    console.log("Successfully connected to MongoDB");
});



// Create a dummy user - ONCE ONLY. Enable this comments for a single run.
/*
 // create a user a new user
 var testUser = new User({
 username: "android",
 password: "testpass"
 });

 // save user to database
 testUser.save(function(err) {
 if (err) throw err;

 });
 */
