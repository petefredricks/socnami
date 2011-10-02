
/**
 * Module dependencies.
 */

var express = require('express');

var app = module.exports = express.createServer(),
	io = require('socket.io').listen(app);

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({
		dumpExceptions: true, 
		showStack: true
	})); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

// Routes

app.get('/pong', function(req, res){
	res.render('pong/pong', {
		title: 'Socnami Pong'
	});
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

io.sockets.on('connection', function (socket) {
	
	socket.set('latency-array', []);
	socket.set('latency', 0);
	
	getLatency(socket, 10);
	
	socket.on('ball-start', function () {
		socket.broadcast.emit('ball-start');
	});
	
	socket.on('ball-reset', function () {
		socket.broadcast.emit('ball-reset');
	});
	
	socket.on('paddle-move', function (top) {
		socket.broadcast.emit('paddle-move', top);
	});
	
	socket.on('game-new', function (name) {
		
		var b64name = new Buffer(name).toString('base64');
		
		if (!games[b64name]) {
			
			games[b64name] = {b46name: b64name, name: name, players: 1};
			
			socket.set('game', b64name, function() {
				socket.emit('game-created', games[b64name]);
			});
		}
		else {
			socket.emit('game-name-taken');
		}
	});
});

var games = {};

function getLatency(socket, times) {
	
	var count = 0;
	
	socket.emit('ping', new Date().getTime());
	
	socket.on('ping', function(time) {
		
		var lag = new Date().getTime() - time;
		
		socket.get('latency-array', function(err, lagArray) {

			lagArray.push(lag);

			socket.set('latency-array', lagArray, function() {
				
				++count;
				
				if (count < times) {
					socket.emit('ping', new Date().getTime());
				}
				else {
					socket.set('latency', lagArray.avg());
					console.log(lagArray.avg());
				}
				
			});
		});
	});
}

Array.prototype.avg = function() {
	var av = 0;
	var cnt = 0;
	var len = this.length;
	
	for (var i = 0; i < len; i++) {
		var e = +this[i];
		if (!e && this[i] !== 0 && this[i] !== '0') e--;
		
		if (this[i] == e) {
			av += e;
			cnt++;
		}
	}
	return av/cnt;
}
