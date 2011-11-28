console.log(module.parent.exports)

module.exports.load = function(app) {
	require('../controllers/login.js')(app);
	require('../controllers/auth.js')(app);
}