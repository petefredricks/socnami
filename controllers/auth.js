var app = module.parent.exports;

var authPaths = {
	loginFailure: "/auth/loginfailed", 
	accessDenied: "/auth/accessdenied",
	login: "/auth/login/:type", 
	logout: "/auth/logout/:type",
	callback: "/auth/callback"
};

var authCheck = function(req, res, next) {

	var type = req.params.type;

	if (type) {

		req.authenticate([type], function(error, authenticated) {
			if ( authenticated === true ) {
				next();
			} 
			else {
				res.redirect( authPaths.loginFailure );
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