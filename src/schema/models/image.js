module.exports = class Image {
	id;
	name;
	owner;
	dateUploaded;
	note;
	exif;
	size;
	type;

	constructor(args) {		
		this.id = args.id;
		this.name = args.name;
		this.owner = args.owner;
		this.dateCreated = args.dateCreated || new Date().toISOString();
		this.note = args.note;
		this.exif = args.exif;
		this.size = args.size;
		this.type = args.type;
	}
}