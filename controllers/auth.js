var app = module.parent.exports;

var indexConfig = function(req, res, next) {

	var type = req.params.type;

	if (type) {
		req.authenticate([type], function(error, authenticated) {
			
			if (authenticated !== undefined) {
				next();
			}
		});
	}
}

app.get(authPaths.accessDenied, function(req, res) {

	res.writeHead (403, {
		'Content-Type': 'text/html'
	});

	res.end("Access Denied");
});

app.get(authPaths.login, authCheck, function(req, res) {
	res.redirect( "/" );
});

app.get(authPaths.loginFailure, function(req, res) {
	res.end("Login Fail")
});

app.get(authPaths.callback, authCheck, function(req, res) {
	res.redirect( "/" );
});