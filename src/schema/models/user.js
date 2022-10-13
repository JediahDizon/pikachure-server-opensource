const _ = require("lodash");
module.exports = class Post {
	constructor(args) {
		// Common Attributes
		this.id = args.id || args.sub;
		this.name = `${args.name}`.trim();
		this.email = args.email;
		this.tag = !_.isEmpty(args.tag) ? `${args.tag}`.trim().toLowerCase() : `${args.name}`.replace(" ", "").trim().toLocaleLowerCase();
		this.posts = args.posts;
		this.cover = args.cover;
		this.disabled = args.disabled;
		this.dateCreated = args.dateCreated || new Date().toISOString();
		this.dateModified = new Date().toISOString();

		// Geolocation Attributes
		this.ip = args.ip;
		this.lat = args.lat;
		this.lng = args.lng;
		
		// Google JWT Attribute
		this.at_hash = args.at_hash;
		this.aud = args.aud;
		this.azp = args.azp;
		this.email = args.email;
		this.email_verified = args.email_verified;
		this.exp = args.exp;
		this.family_name = args.family_name;
		this.given_name = args.given_name;
		this.iat = args.iat;
		this.iss = args.iss;
		this.jti = args.jti;
		this.locale = args.locale;
		this.picture = args.picture;
		this.sub = args.sub;

		// User Customizeable Settings
		this.layout = args.layout || 0; 
	}
}