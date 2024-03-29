
/**
 * Module dependencies.
 */

var express = require('express'),
    redis = require('redis'),
    client = redis.createClient(),
    fs = require('fs');

var app = module.exports = express.createServer();

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser({
  	uploadDir: './uploads'
  }));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure(function() {
  app.set('karaoke-app-sid', 'AP50c8715a2e534954b7a68165d033af27');
  app.set('default-room', 'cis195');
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

/* Stuff to be stored in Redis (with 'triangle' prefix)
roomslist              (set)            - returns set of rooms
room:[id]              (string)         - returns name of room with the specific id
room:[id]:cardslist    (set)            - returns a set of cards in a room
room:[id]:card:[id]    (string)         - returns counter of the card swipes on this unique card
*/

app.get('/', function(req, res){
  res.send('<form method="post" enctype="multipart/form-data">'
    + '<p>Image: <input type="file" name="image" /></p>'
    + '<p><input type="submit" value="Upload" /></p>'
    + '</form>');
});

app.post('/', function(req, res, next){
	console.log(req.files);
	res.send('blah');
});




app.post('/test', function(req, res){
  console.log('headers: ' + JSON.stringify(req.headers));
  console.log('body: ' + JSON.stringify(req.body));
  res.send('');
});

app.post('/fileupload', function(req, res, next){
  req.form.complete(function(err, fields, files) {
    if (err) { next(err); }
    else {
            console.log(fields);
            console.log('---------------');
            console.log(files);
            res.redirect(req.url);
        }
    });
});

// All get requests
app.get('/rooms', function(req, res) {
  res.send('');
});

app.get('/rooms/cis195', function(req, res) {
  res.send('');
});

app.get('/rooms/cis195/cards', function(req, res) {
  client.smembers('triangle-room:cis195:cardslist', function(err, data){
  	console.log(data);
  });
  res.send('');
});

app.get('/rooms/cis195/cards/:id', function(req, res) {
  var cardID = req.params.id;
  client.get('triangle-room:cis195:card:' + cardID, function(err, data) {
  	console.log(data);
  });
  res.send('');
});

app.get('/rooms/flush', function(req, res) {
  console.log('FLUSHED ALL THE THINGS');
  client.flushall();
  res.send('');
});

// All post requests
app.post('/rooms', function(req, res) {

});

app.post('/rooms/:id', function(req, res) {
  res.send('');
});

app.post('/rooms/cis195/cards', function(req, res) {

  var cardID = req.body.cardID;
  console.log('-----------Start----------');
  console.log('CardID' + cardID);
  client.sadd('triangle-room:cis195:cardslist', cardID, function(err, data) {
  	if (data == 0) {
  	  console.log("Status: Card already added before. incrementing counter");
  	}
  });
  client.incr('triangle-room:cis195:card:'+cardID, function(err, data) {
  });
  console.log('-----------Done-----------');
  console.log('                          ');
  res.send('done \r');

});

app.post('/rooms/cis195/cards/:id', function(req, res) {
  var cardID = req.params.id;
  client.incr('triangle-room:cis195:card:' + cardID, function(err, data) {
  	console.log(data);
  });
});



// All delete requests
app.del('/rooms', function(req, res) {
  
});

app.del('/rooms/:id', function(req, res) {
  
});

app.del('/rooms/:id/cards', function(req, res) {
  
});

app.del('/rooms/:id/cards/:id', function(req, res) {
  
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
