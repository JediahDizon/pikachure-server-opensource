const _ = require("lodash");

module.exports = class Post {
	constructor(args = {}) {
		this.id = args.id;
		this.host = args.host;
		this.description = args.description;
		this.cover = args.cover || [];
		this.gallery = args.gallery || [];
		this.place = args.place;
		this.guests = args.guests || [];
		this.comments = args.comments || [];
		this.dateCreated = args.dateCreated || new Date().toISOString();
		this.dateModified = new Date().toISOString();
		this.datePosted = args.datePosted || null; // When this field is null, it is implied that this is an active open-invite
		this.isVisible = !_.isNil(args.isVisible) ? args.isVisible : false;
		this.autoAccept = args.autoAccept;
		this.byod = args.byod;

		// Geo
		this.lat = args.lat;
		this.lng = args.lng;
	}
}