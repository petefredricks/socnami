var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
	email: { 
		type: String, 
		index: true
	},
	password: {
		type: String,
		set: function(password) {
			this.salt = this.makeSalt();
			return this.encryptPassword(password);
		}
	},
	name: String,
	salt: String
});

UserSchema.methods = {
	encryptPassword: function(password) {
		return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
	},
	authenticate: function(plainText) {
		return this.encryptPassword(plainText) === this.password;
	},

	makeSalt: function() {
		return Math.round((new Date().valueOf() * Math.random())) + '';
	}
}

UserSchema
	.virtual('id')
	.get(function() {
		return this._id.toHexString();
	});

mongoose.model('User', UserSchema);