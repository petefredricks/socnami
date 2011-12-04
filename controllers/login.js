var mongoose = require('mongoose');
var User = mongoose.model('User');
var json = require('../helpers/json.js');
var app = module.parent.exports;
	
app.get('/logout',function(req, res){
	req.logout();

	if (req.headers.referer) {
		res.redirect(req.headers.referer);
	}
	else
		res.redirect('/login');
});

app.post('/login', function(req, res) {

	User.find({
		email: req.body.username
	}, function(err, users) {
		if (err) {
			res.send(json.make(err, 'error'));
		}

		var success = false;

		users.forEach(function(user) {

			if (!success && user && user.authenticate(req.body.password)) {

				req.session.user = user.id;

				// Remember me
				if (req.body.remember_me) {

					var loginToken = new LoginToken({
						email: user.email
					});

					loginToken.save(function() {
						res.cookie('logintoken', loginToken.cookieValue, {
							expires: new Date(Date.now() + 2 * 604800000), 
							path: '/'
						});
					});
				}

				res.send(json.make(req.sessionID));

				success = true;
			}
		});

		if (!success) {
			res.send(json.make('Invalid', 'error'));
		}
	});
});