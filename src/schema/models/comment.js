module.exports = class Comment {
	constructor(args) {
		this.id = args.id;
		this.user = args.user;
		this.description = args.description;
		this.dateCreated = args.dateCreated || new Date().toISOString();
		this.dateModified = args.dateModified;
	}
}