/********************
	Dependencies
 ********************/
var mongoose = require('mongoose');
var express = require('express');
var mongoStore = require('connect-mongodb');
var auth = require('connect-auth');
var url = require('url');
var keys = require('./keys.js');
var assetManage = require('./helpers/asset-manager');

// Models
require('./models/user.js');

var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);

/********************
	Configuration
 ********************/
app.configure('development', function() {
	app.use(express.errorHandler({
		dumpExceptions: true, 
		showStack: true
	})); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

// MongoDB stores
var db = mongoose.connect('mongodb://localhost/socnami');

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({
		cookie: { maxAge: false },
		secret: 'flempeterson',
		store: new mongoStore({db: db.connections[0].db})
	}));
	app.use(auth([
		auth.Twitter({
			consumerKey: keys.twitter.key, 
			consumerSecret: keys.twitter.secret
		})
	]));
	app.use(express.methodOverride());
	app.use(assetManage);
	app.use(app.router);
	app.use(express.static(__dirname + '/public', { maxLife: 30 }));
});

/********************
	Routes
 ********************/
require('./controllers/login.js');
require('./controllers/auth.js');

//app.get('/pong', function(req, res){
//	res.render('pong/pong', {
//		title: 'Socnami Pong'
//	});
//});

app.get('/', function(req, res) {
	
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	
	res.render('index', {
		title: 'Socnami'
	});
});

app.post('/save', function(req, res) {
	res.end();
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

io.sockets.on('connection', function (socket) {
	socket.on('auth', function(sid) {
		var session = app.session
		console.log(sid);
	});
});


// SOCKETS...
//io.sockets.on('connection', function (socket) {
//	
//	socket.set('latency-array', []);
//	socket.set('latency', 0);
//	
//	getLatency(socket, 10);
//	
//	socket.emit('game-list', games);
//	
//	socket.on('ball-start', function () {
//		socket.get('game', function(err, game) {
//			io.sockets.in(game.id).emit('ball-start');
//		});
//	});
//	
//	socket.on('ball-reset', function () {
//		socket.get('game', function(err, game) {
//			io.sockets.in(game.id).emit('ball-reset');
//		});
//	});
//	
//	socket.on('ball-hit', function (info) {
//		socket.get('game', function(err, game) {
//			io.sockets.in(game.id).emit('ball-hit', info);
//		});
//	});
//	
//	socket.on('ball-score', function (side) {
//		socket.get('game', function(err, game) {
//			io.sockets.in(game.id).emit('ball-score', side);
//		});
//	});
//	
//	socket.on('paddle-move', function (top) {
//		socket.get('game', function(err, game) {
//			socket.broadcast.in(game.id).emit('paddle-move', top);
//		});
//	});
//	
//	socket.on('game-new', function (name) {
//		
//		var id = new Buffer(name).toString('base64');
//		
//		if (!games[id]) {
//			
//			games[id] = {
//				id: id, 
//				name: name, 
//				players: 1,
//				home: true,
//				away: false
//			};
//			
//			socket.get('game', function(err, oldGame) {
//				
//				var oldId = oldGame && oldGame.id;
//				
//				if (typeof games[oldId] == 'object') {
//					
//					--games[oldId].players;
//					games[oldId][oldGame.side] = false;
//
//					io.sockets.emit('game-update', games[oldId]);
//					
//					socket.leave('/' + oldId); 
//				}
//				
//				socket.join(id);
//				socket.set('game', {id:id, side:'home'}, function() {
//					socket.emit('game-joined', {id:id, side:'home'});
//					io.sockets.emit('game-created', games[id]);
//				});
//			});
//		}
//		else {
//			socket.emit('game-name-taken');
//		}
//	});
//	
//	socket.on('game-join', function (id) {
//		
//		if (games[id] && games[id].players < 2) {
//			var side;
//			
//			if (!games[id].home) {
//				side = 'home';
//			}
//			else {
//				side = 'away';
//			}
//			
//			games[id][side] = true;
//			++games[id].players;
//			
//			socket.join(id);
//			socket.set('game', {id:id, side:side}, function() {
//				socket.emit('game-joined', {id:id, side:side});
//				io.sockets.emit('game-update', games[id]);
//			});
//		}
//	});
//	
//	socket.on('disconnect', function() {
//		socket.get('game', function(err, oldGame) {
//			
//			var oldId = oldGame && oldGame.id;
//			
//			if (typeof games[oldId] == 'object') {
//				--games[oldId].players;
//				games[oldId][oldGame.side] = false;
//				
//				socket.broadcast.emit('game-update', games[oldId]);
//			}
//		});
//	});
//});
//
//var games = {};
//
//function getLatency(socket, times) {
//	
//	var count = 0;
//	
//	socket.emit('ping', new Date().getTime());
//	
//	socket.on('ping', function(time) {
//		
//		var lag = new Date().getTime() - time;
//		
//		socket.get('latency-array', function(err, lagArray) {
//
//			lagArray.push(lag);
//
//			socket.set('latency-array', lagArray, function() {
//				
//				++count;
//				
//				if (count < times) {
//					socket.emit('ping', new Date().getTime());
//				}
//				else {
//					socket.set('latency', lagArray.avg());
//				}
//				
//			});
//		});
//	});
//}
//
//// tools
//Array.prototype.avg = function() {
//	var av = 0;
//	var cnt = 0;
//	var len = this.length;
//	
//	for (var i = 0; i < len; i++) {
//		var e = +this[i];
//		if (!e && this[i] !== 0 && this[i] !== '0') e--;
//		
//		if (this[i] == e) {
//			av += e;
//			cnt++;
//		}
//	}
//	return av/cnt;
//}
