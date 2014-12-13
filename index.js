var express = require('express.io'),
  serveStatic = require('serve-static'),
  path = require('path'),
  chalk = require('chalk'),
  _ = require('lodash'),
  app = express();

// setup socket.io for realtime data
app.http().io();

//  static service
app.use(serveStatic(path.join(__dirname, 'public')));

// holding things (just in memory)
var wall = [], userCount = 0;

// generate a UUID to key my posts
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

// when user connects, send them things I'm holding & tell others they are here
app.io.on('connection', function (socket) {
  userCount++;
  app.io.broadcast('user:update', userCount);

  console.log(chalk.green('connect'), ':', chalk.yellow(userCount));

  socket.on('disconnect', function () {
    userCount--;
    app.io.broadcast('user:update', userCount);
    console.log(chalk.red('disconnect'), ':', chalk.yellow(userCount));
  });
})

app.io.route('hi', function(req){
  req.io.respond(wall);
});


// user can create/update/remove posts
// TODO: sanitize text to basic HTML
app.io.route('post', {
  create: function(req) {
    var post = req.data;
    post.uuid = generateUUID();
    wall.push(post);
    req.io.respond(post.uuid);
    req.io.broadcast('post:create', post);
    console.log(chalk.green('create'), ':', chalk.yellow(post.uuid));
  },
  
  update: function(req) {
    var i = _.indexOf(_.pluck(wall, 'uuid'), req.data.uuid);
    if (i !== -1){
      wall[i] = req.data;
      req.io.broadcast('post:update', req.data);
    }
    console.log(chalk.blue('update'), ':', chalk.yellow(req.data.uuid));
  },
  
  remove: function(req) {
    var i = _.indexOf(_.pluck(wall, 'uuid'), req.data);
    if (i !== -1){
      var removed = wall.splice(i, 1);
      req.io.broadcast('post:remove', removed.uuid);
    }
    console.log(chalk.red('remove'), ':', chalk.yellow(req.data));
  },
});


if (require.main === module) {
  var port = Number(process.env.PORT || 5000);
  app.listen(port, function() {
    console.log('Listening on ' + chalk.underline(chalk.blue('http://0.0.0.0:' + port)));
  });
}

module.exports = app;