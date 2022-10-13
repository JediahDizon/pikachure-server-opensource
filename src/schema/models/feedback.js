module.exports = class Feedback {
	constructor(args) {
		this.id = args.id;
		this.user = args.user;
		this.description = args.description;
    this.value = args.value;
		this.dateCreated = args.dateCreated || new Date().toISOString();
	}
}