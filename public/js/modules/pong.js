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
		speed: 3,
		adjSpeed: 3,
		slope: .3,
		dir: 'right',
		status: 'start',
		skill: 30 
	}

	var bound = {
		top: 0,
		left: params.margin,
		right: params.width - params.margin - params.ball,
		bottom: params.height - params.ball
	}
	
	var container = null;
	var home = {};
	var away = {};
	var ball = {};
	var netTop = 0;
	var lastTop = 0;
	
	function init() {
		
		container = $('div.pong-container').show();
		
		home.paddle = {
			el: container.find('div.pong-home').find('div.pong-paddle'),
			height: params.paddleHeight
		}
		home.score = {
			el: container.find('div.pong-score-home').find('div.pong-score'),
			count: 0
		}

		away.paddle = {
			el: container.find('div.pong-away').find('div.pong-paddle'),
			height: params.paddleHeight
		}
		away.score = {
			el: container.find('div.pong-score-away').find('div.pong-score'),
			count: 0
		}

		ball.el = container.find('div.pong-ball');
		ball.pos = ball.el.position();
		
		home.paddle.offset = home.paddle.el.offset().top;
		
		// EVENTS
		$(window).bind('mousemove', function(ev) {

			var newTop = ev.pageY - home.paddle.offset - 50;

			if (newTop < 0) {
				newTop = 0;
			}

			if (newTop > 300) {
				newTop = 300;
			}

			home.paddle.el.css('top', newTop);
			//socket.emit('paddle-move', newTop);

			netTop = lastTop - newTop;
			lastTop = newTop;
		});

		socket.on('paddle-move', function (top) {
			away.paddle.el.css('top', top);
		});

		socket.on('ball-start', function () {
			moveBall();
			params.status = 'running';
		});

		socket.on('ball-reset', function () {
			ball.el.removeAttr('style').stop(true);
			params.speed = params.adjSpeed = 3;
			params.slope = .3;	
			ball.pos = ball.el.position();
			params.status = 'start';
		});

		container.click(function() {

			switch (params.status) {
				case 'start':
				case 'paused':
					moveBall();
					params.status = 'running';
					socket.emit('ball-start');
					break;/*
				case 'running':
					ball.el.stop(true);
					ball.pos = ball.el.position();
					params.status = 'paused';
					break;*/
				case 'dead':
					ball.el.removeAttr('style').stop(true);
					params.speed = params.adjSpeed = 3;
					params.slope = .3;	
					ball.pos = ball.el.position();
					params.status = 'start';
					socket.emit('ball-reset');
					break;
			}
		});
	}
	
	function oppositeDay(value) {
		
		switch (value) {
			case "left":return "right";
			case "right":return "left";
			case "top":return "bottom";
			case "bottom":return "top";
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
	
	function moveBall() {
		
		var newPos = getNextPosition();
		var time = getTime(newPos);
		
		ball.el.animate(newPos, time, 'linear', nextMove);
		ball.pos = newPos;
		
		if (false) {
			var random = Math.floor(Math.random() * 10) * params.skill;
			var paddleSpeed = round(100 + random + (time * .5), 0);

			away.paddle.top = round(ball.pos.top - (away.paddle.height / 2) - (params.ball / 2), 0);

			if (away.paddle.top < 0) {
				away.paddle.top = 0;
			}

			if (away.paddle.top > 300) {
				away.paddle.top = 300;
			}

			away.paddle.el.animate({top: away.paddle.top}, paddleSpeed, 'swing');
		}	
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
		
		if (params.speed > .5) {
			params.speed *= 0.99;
		}
		
		if (ball.pos.left == bound[params.dir]) {
		
			if (Math.abs(params.slope) > 0.5) {
				params.slope = params.slope > 0 ? 0.5 : -0.5;
			}

			if (params.dir == 'right') {
				
				var paddlePos = home.paddle.el.position().top;
				var hitPaddle = comparePositions([ball.pos.top, ball.pos.top + 15], [paddlePos, paddlePos + 100]);

				if (!hitPaddle) {
					away.paddle.el.stop();
					ball.el.stop(true).hide();
					away.score.count++;
					away.score.el.html(away.score.count);
					params.status = 'dead';
					return;
				}
				
				params.slope += round(netTop / 50, 1);
				params.adjSpeed = params.speed - Math.abs(netTop) / 100;
			}
			
			if (params.dir == 'left') {
				
				var paddleAwayPos = away.paddle.el.position();
				var hitPaddleAway = comparePositions([ball.pos.top, ball.pos.top + 15], [paddleAwayPos.top, paddleAwayPos.top + away.paddle.height]);

				if (!hitPaddleAway) {
					away.paddle.el.stop();
					ball.el.stop(true).hide();
					home.score.count++;
					home.score.el.html(home.score.count);
					params.status = 'dead';
					return;
				}
			}
			
			params.dir = oppositeDay(params.dir);
		}		
		
		moveBall();
	}
	
	function addGame(game) {
		var html = ['<div class="game-item" data-id="', game.id, '">',
			'<span class="game-item-name">', game.name, '</span><span class="game-item-players">(', game.players, ')</span>',
		'</div>'];
		
		$('#pong-game-container').append(html.join(''));
	}
	
	function updateGame(game) {
		
		$('#pong-game-container')
			.find('div.game-item[data-id=' + game.id + ']')
			.find('span.game-item-players')
			.html('(' + game.players + ')');
	}
	
	return {
		init: init,
		addGame: addGame,
		updateGame: updateGame
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
		pongGame.init(game);
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
	
	$('#pong-create-container').submit(function() {

		var val = $('#pong-game-name').val();

		if (val) {
			socket.emit('game-new', val);
			$('#pong-game-name').val('')
		}

		return false;
	});
	
	
	$('#pong-game-container').find('div.game-item').live('click', function() {

		var gameEl = $(this);
		
		socket.emit('game-join', gameEl.data('id'));

		return false;
	});
})
