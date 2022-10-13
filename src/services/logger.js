const fs = require("fs");
module.exports = class Logger {
	uri;

	constructor(uri) {
		this.uri = uri;
	}

	log(toWrite) {
		fs.appendFileSync(this.uri, `${toWrite}\n`, { flag: "a" }, (err, data) => {
			if(err) throw err;
		});
	}
}