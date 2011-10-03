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

var pongGame = (function() {
	
	var params = {
		width: 600,
		height: 400,
		ball: 15,
		paddleHeight: 100,
		margin: 40,
		speed: 5,
		adjSpeed: 5,
		slope: .3,
		dir: 'home',
		status: 'start',
		skill: 30,
		netTop: 0,
		newTop: 0,
		lastTop: 0,
		side: 'home',
		game: null,
		moveDeferred: new $.Deferred()
	}

	var bound = {
		top: 0,
		bottom: params.height - params.ball,
		away: params.margin,
		home: params.width - params.margin - params.ball,
		paddle: params.height - params.paddleHeight
	}
	
	var container = null;
	var gamesContainer = null;
	var scoreboard = null;
	var paddles = {};
	var ball = {};
	
	function init() {
		
		container = $('div.pong-container');
		gamesContainer = $('div#pong-games-container');
		ball.el = container.find('div.pong-ball');
		
		paddles.home = container.find('div.pong-home').find('div.pong-paddle');
		paddles.away = container.find('div.pong-away').find('div.pong-paddle');
		
		function Score(selector) {
			var el = container.find(selector).find('div.pong-score');
			var count = 0;
			
			this.add = function() {
				el.html(++count);
			} 
		}
		
		scoreboard = {
			home: new Score('div.pong-score-home'),
			away: new Score('div.pong-score-away')
		}
		
		// EVENTS

		socket.on('paddle-move', function (top) {
			paddles[oppositeDay(params.side)].css('top', top);
		});

		socket.on('ball-start', function () {
			moveBall();
		});

		socket.on('ball-reset', function () {
			reset();
		});
		
		socket.on('ball-hit', function(info) {
			
			params.dfd.done(function() {
				
				moveBall(info);
			});
		});
		
		socket.on('ball-score', function(side) {
			
			ball.el.stop(true).hide();

			scoreboard[oppositeDay(side)].add();

			params.status = 'dead';
		});

		container.click(function() {

			switch (params.status) {
				case 'start':
					params.status = 'running';
					socket.emit('ball-start');
					break;
				case 'dead':
					params.status = 'start';
					socket.emit('ball-reset');
					break;
			}
		});
	
		$('#pong-create-container').submit(function() {

			var val = $('#pong-game-name').val();

			if (val) {
				socket.emit('game-new', val);
				$('#pong-game-name').val('')
			}

			return false;
		});


		gamesContainer.find('div.game-item').live('click', function() {

			var gameEl = $(this);

			socket.emit('game-join', gameEl.data('id'));

			return false;
		});
	}
	
	function reset(game) {
		
		if (game) {
			params.game = game.id;
			params.side = game.side;
		}
		
		$(window).unbind('mousemove.pong');
		
		container.show();
		
		// these reset everything
		ball.el.removeAttr('style').stop(true);
		params.speed = params.adjSpeed = 3;
		params.slope = .3;	
		params.status = 'start';
		
		ball.pos = ball.el.position();
		paddles.offset = container.offset().top;
		
		$(window).bind('mousemove.pong', function(ev) {

			var newTop = ev.pageY - paddles.offset - (params.paddleHeight / 2);

			if (newTop < 0) {
				newTop = 0;
			}

			if (newTop > bound.paddle) {
				newTop = bound.paddle;
			}

			paddles[params.side].css('top', newTop);
			socket.emit('paddle-move', newTop);
			
			params.netTop = params.lastTop - newTop;
			params.lastTop = newTop;
		});
	}
	
	function oppositeDay(value) {
		
		switch (value) {
			case "left":return "right";
			case "right":return "left";
			case "top":return "bottom";
			case "bottom":return "top";
			case "home":return "away";
			case "away":return "home";
			default:return value;
		}
	}
	
	// y = mx + b
	function getNextPosition() {
		
		var m = params.slope;
		var b = ball.pos.top - (m * ball.pos.left);
		var x = bound[params.dir];
		var y = (m * x) + b;
		
		if (y > bound.bottom) {
			y = bound.bottom;
			x = (y - b) / m;
		}
		else if (y < bound.top) {
			y = bound.top;
			x = (y - b) / m;
		}
		
		return {top: y, left: x}
	}
	
	function getTime(pos) {
		var a = ball.pos.left - pos.left;
		var b = ball.pos.top - pos.top;
		var c = Math.sqrt( Math.pow(a, 2) + Math.pow(b, 2) );
		
		return c * params.adjSpeed;
	}
	
	function moveBall(update) {
		
		if (update) {
			$.extend(params, update);
		}
		
		var newPos = getNextPosition();
		var time = getTime(newPos);
		
		ball.pos = newPos;
		
		params.dfd = ball.el.animate(newPos, time, 'linear').promise();
		
		params.dfd.done(function() {
			
			if (params.dir == params.side) {
				nextMove();
			}
		});
	}
			
	function comparePositions(p1, p2) {
		var x1 = p1[0] < p2[0] ? p1 : p2;
		var x2 = p1[0] < p2[0] ? p2 : p1;
		
		return x1[1] > x2[0] || x1[0] === x2[0] ? true : false;
	}
	
	function round(value, dec) {
		return Math.round(value * Math.pow(10, dec)) / Math.pow(10, dec);
	}
	
	function nextMove() {

		params.slope = -1 * params.slope;
		
		// if hit left or right wall
		if (ball.pos.left == bound[params.side]) {

			if (Math.abs(params.slope) > 0.5) {
				params.slope = params.slope > 0 ? 0.5 : -0.5;
			}

			var ballPos = [ball.pos.top, ball.pos.top + params.ball];
			var paddlePos = [params.lastTop, params.lastTop + params.paddleHeight];
			var hitPaddle = comparePositions(ballPos, paddlePos);

			if (hitPaddle) {

				if (params.speed > .5) {
					params.speed *= 0.99;
				}

				var dir = oppositeDay(params.dir);
				var slope = params.slope + (round(params.netTop / 50, 1) * (dir == 'away' ? 1 : -1));
				var speed = params.speed - Math.abs(params.netTop / 50);

				socket.emit('ball-hit', {
					slope: slope, 
					adjSpeed: speed, 
					dir: dir
				});
			}
			else {
				socket.emit('ball-score', params.side);
			}

		}
		else {
			socket.emit('ball-hit', { slope: params.slope });
		}
	}
	
	function addGame(game) {
		
		var item = getGameItem(game.id);

		if (!item) {
			
			var html = ['<div class="game-item" data-id="', game.id, '">',
				'<span class="game-item-name">', game.name, '</span><span class="game-item-players">(', game.players, ')</span>',
			'</div>'];

			gamesContainer.append(html.join(''));
		}
		
		return (!item);
	}
	
	function updateGame(game) {
		
		var item = getGameItem(game.id);
		
		if (item) {
			item.find('span.game-item-players').html('(' + game.players + ')');
		}
		
		return (item);
	}
	
	function getGameItem(id) {
		
		var item = gamesContainer.find('div.game-item[data-id="' + id + '"]');
		
		return item.length ? item : null;
	}
	
	return {
		init: init,
		addGame: addGame,
		updateGame: updateGame,
		reset: reset
	}
	
})();

var socket = io.connect('http://dev.socnami.com');

socket.on('connect', function () {
	
	socket.on('ping', function(time) {
		socket.emit('ping', time);
	});
	
	socket.on('game-created', function(game) {
		pongGame.addGame(game);
	});
	
	socket.on('game-joined', function(game) {
		pongGame.reset(game);
	});
	
	socket.on('game-list', function(games) {
		for (var game in games) {
			pongGame.addGame(games[game]);
		}
	});
	
	socket.on('game-update', function(game) {
		pongGame.updateGame(game);
	});
});

$(document).ready(function() {
	
	pongGame.init();
});
