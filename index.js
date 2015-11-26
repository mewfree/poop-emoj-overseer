var express = require('express')
  , app = express()
  , server = require('http').Server(app)
  , io = require('socket.io')(server)
  , stylus = require('stylus')
  , Twitter = require('twitter');

// Express config
var port = process.env.PORT || 3000;
server.listen(port+1); // io port

app.set('views', './views');
app.set('view engine', 'jade');

app.use(stylus.middleware ({
  src: __dirname + '/views',
  dest: __dirname + '/public'
}));
app.use(express.static(__dirname + '/public'));

// Routes
app.get('/', function (req, res) {
  res.render('index');
});

// Twitter
var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// io
client.stream('statuses/filter', {track: '💩'}, function(stream) {
  io.on('connection', function (socket) {
    stream.on('data', function(tweet) {
      // console.log(tweet);
      if (!tweet.retweeted_status) {
        socket.emit('tweet', {
          'text': tweet.text,
          'name': tweet.user.screen_name
        });
      }
    });

    stream.on('error', function(error) {
      throw error;
    });
  });
});

// Start server
var server = app.listen(port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);

});
