const fs = require("fs");

const firebase = require("firebase/app");
const admin = require("firebase-admin");
require("firebase/storage");

const _ = require("lodash");
const { Seeker } = require("src/utils");
const GOOGLE_APPLICATION_CREDENTIALS = require("./job-z-e3be0-firebase-adminsdk-7sdtr-0e8fd71dac.json");

admin.initializeApp({
  credential: admin.credential.cert(GOOGLE_APPLICATION_CREDENTIALS),
	databaseURL: "",
	storageBucket: "",
});

firebase.initializeApp({
	apiKey: "",
	authDomain: "",
	databaseURL: "",
	projectId: "",
	storageBucket: "",
	messagingSenderId: "",
	appId: "",
	measurementId: ""
});


firebase.auth().signInAnonymously().then(() => {
	console.log("Firebase connected");
}).catch((error) => {
	var errorCode = error.code;
	var errorMessage = error.message;
	console.log({ errorCode, errorMessage });
});

class Firebase {
	constructor() {
		this.FirestoreDB = firebase.firestore().enablePersistence();
		this.FirestoreDB.settings({ ignoreUndefinedProperties: true });
		this.StorageDB = admin.storage();

		setTimeout(() => {
			// this.populateUsers(userList);
			// this.populateSeekers(seekers);
			// this.populateEmployers(employers);
			// this.populateMessages(messages);
			this.testFunction()
		}, 2000);
	}

	async testFunction() {
		// const crypto = require("crypto");
		// const toPrint = crypto.createHash("sha256").update("test").digest("hex");
		// console.log(toPrint);

		// const toPrint = await this.getProfiles({ tags: ["developer", "photographer", "graphql", "react native", "doge", "test", "help"], filter: {} });
		// console.log(_.map(toPrint, "name"));
	}

	async populateUsers(seedData) {
		for(let data of seedData) {
			try {
				await this.FirestoreDB.collection("users").doc(data.email.toLowerCase()).set(data);

			} catch (error) {
				console.error("Error adding record: ", error);
			}
		}
	}

	async populateSeekers(seedData) {
		for(let data of seedData) {
			try {
				await this.FirestoreDB.collection("seekers").doc(data.id).set({
					name: data.name,
					company: data.company,
					description: data.description,
					profiles: data.profiles || []
				})

			} catch (error) {
				console.error("Error adding record: ", error);
			}
		}
	}

	async populateEmployers(seedData) {
		for(let data of seedData) {
			try {
				await this.FirestoreDB.collection("employers").doc(data.id).set({
					name: data.name,
					company: data.company,
					description: data.description
				})
			} catch (error) {
				console.error("Error adding record: ", error);
			}
		}
	}

	async populateMessages(seedData) {
		for(let data of seedData) {
			try {
				for(let log of data.log) {
					await this.FirestoreDB.collection("messages").doc(data.id).update({
						[log.timestamp]: {
							message: log.message,
							sender: log.sender
						}
					});
				}
			} catch (error) {
				console.error("Error adding record: ", error);
			}
		}

		// for(let data of seedData) {
		// 	try {
		// 		await this.firebase.database().ref(`messages/${data.id}`).set(data.log)


		// 	} catch (error) {
		// 		console.error("Error adding document: ", error);
		// 	}
		// }
	}

	async login(user) {
		let toSave = { ...user };
		if(_.isEmpty(await this.getUser(user.email))) {
			toSave.dateCreated = new Date().toISOString();
		} else {
			toSave.dateModified = new Date().toISOString();
		}

		await this.FirestoreDB.collection("users").doc(user.email.toLowerCase()).set(toSave, { merge: true });
		let snapshot = await this.FirestoreDB.collection("users").doc(user.email.toLowerCase()).get();
		return snapshot.data();
	}

	async getUser(email) {
		let snapshot = await this.FirestoreDB.collection("users").doc(email.toLowerCase()).get();
		return snapshot.data();
	}
	async getUsers(emails) {
		if(_.isEmpty(emails)) return;
		const toReturn = [];
		let docRefs = await this.FirestoreDB.collection("users").where("email", "in", emails).get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		return toReturn;
	}
	async getUserBySeeker(id) {
		const toReturn = [];
		let docRefs = await this.FirestoreDB.collection("users").where("seeker", "==", id).get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		return toReturn[0];
	}
	async getUserByEmployer(id) {
		const toReturn = [];
		let docRefs = await this.FirestoreDB.collection("users").where("employer", "==", id).get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		return toReturn[0];
	}
	async getUserByProfile(id) {
		const seeker = await this.getSeekerByProfile(id);
		const employer = seeker || await this.getEmployerByProfile(id);

		let user;
		if(seeker) user = await this.getUserBySeeker(seeker.id);
		else if(employer) user = await this.getUserByEmployer(seeker.id);
		else throw new Error("User not found with specified profile ID");

		return user;
	}

	async saveUser(user) {
		let toUpdate = (await this.FirestoreDB.collection("users").doc(user.email.toLowerCase()).get()).data();
		const toSave = {
			...toUpdate,
			...user
		};

		await this.FirestoreDB.collection("users").doc(user.email.toLowerCase()).set(toSave, { merge: true });
		const toReturn = (await this.FirestoreDB.collection("users").doc(user.email.toLowerCase()).get()).data();
		return toReturn;
	}

	async getAllSeekers() {
		const snapshot = await this.FirestoreDB.collection("seekers").get();
		const toReturn = [];
		snapshot.forEach(doc => {
			toReturn.push({ id: doc.id, ...doc.data()});
		});
		return toReturn;
	}

	async saveSeeker(toSave) {
		let id = toSave.id;
		if(id) {
			await this.FirestoreDB.collection("seekers").doc(id).set(toSave, { merge: true });
		} else {
			id = (await this.FirestoreDB.collection("seekers").add(toSave)).id;
		}
		return { ...await this.getSeeker(id), id };
	}
	async getSeeker(id) {
		const toReturn = (await this.FirestoreDB.collection("seekers").doc(id).get()).data();
		if(toReturn) return { ...toReturn, id };
	}
	async getSeekerByProfile(id) {
		if(_.isEmpty(id)) return;
		const toReturn = [];
		const docRefs = await this.FirestoreDB.collection("seekers").where("profiles", "array-contains", id).get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		return toReturn[0];
	}

	async getEmployer(id) {
		const toReturn = (await this.FirestoreDB.collection("employers").doc(id).get()).data();
		if(toReturn) return { ...toReturn, id };
	}
	async getEmployerByProfile(id) {
		if(_.isEmpty(id)) return;
		const toReturn = [];
		const docRefs = await this.FirestoreDB.collection("employers").where("profiles", "array-contains", id).get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		return toReturn[0];
	}
	async saveEmployer(toSave) {
		let employerId = toSave.id;
		if(employerId) {
			await this.FirestoreDB.collection("employers").doc(employerId).set(toSave, { merge: true });
		} else {
			employerId = (await this.FirestoreDB.collection("employers").add(toSave)).id;
		}
		return { ...await this.getEmployer(employerId), id: employerId };
	}

	async saveDirectMessage(toSave) {
		let toReturn;
		if(toSave.id) {
			await this.FirestoreDB.collection("direct-messages").doc(toSave.id).set(toSave, { merge: true });
			toReturn = { ...(await this.FirestoreDB.collection("direct-messages").doc(toSave.id).get()).data(), id: toSave.id };
		} else {
			const id = (await this.FirestoreDB.collection("direct-messages").add({ ...toSave, dateCreated: new Date().valueOf() })).id;
			toReturn = { ...(await this.FirestoreDB.collection("direct-messages").doc(id).get()).data(), id }
		}

		return toReturn;
	}
	async getDirectMessage(id) {
		const toReturn = (await this.FirestoreDB.collection("direct-messages").doc(id).get()).data();
		if(toReturn) return { ...toReturn, id };
	}
	async getDirectMessages(email) {
		if(_.isEmpty(email)) return;
		const toReturn = [];
		const docRefs = await this.FirestoreDB.collection("direct-messages").where("messages", "!=", []).where("users", "array-contains", email.toLowerCase()).get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		return toReturn;
	}
	async getDirectMessagesByProfiles(ids) {
		if(_.isEmpty(ids)) return;
		const toReturn = [];
		const docRefs = await this.FirestoreDB.collection("direct-messages").where("messages", "!=", []).where("profile", "in", ids).get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		return toReturn;
	}
	async postMessage(toPost, id) {
		const toUpdate = (await this.FirestoreDB.collection("direct-messages").doc(id).get()).data();
		if(!toUpdate) throw new Error("Direct message to post to does not exist");

		// Limit up to 100 messages per DM
		toUpdate.messages = _(toUpdate.messages).slice(-100).concat(toPost).value();

		await this.FirestoreDB.collection("direct-messages").doc(id).set(toUpdate, { merge: true });
		return { ...(await this.FirestoreDB.collection("direct-messages").doc(id).get()).data(), id };
	}
	async getMessagesById(id) {
		return (await this.FirestoreDB.collection("messages").doc(id).get()).data();
	}

	async getDirectMessageByProfileId(profileId, email) {
		if(_.isEmpty(email)) return;
		const toReturn = [];
		const docRefs = await this.FirestoreDB.collection("direct-messages").where("profile", "==", profileId).where("users", "array-contains", email.toLowerCase()).get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		return toReturn[0];
	}
	async deleteDirectMessage(id, email) {
		const toDelete = await this.getDirectMessage(id).catch(error => console.log(error));
		if(toDelete) {
			await this.FirestoreDB.collection("deleted-direct-messages").add({ ...toDelete, dateDeleted: new Date().toISOString() });
			await this.FirestoreDB.collection("direct-messages").doc(id).delete();
		}

		return toDelete;
	}

	async getProfile(id) {
		const toReturn = (await this.FirestoreDB.collection("profiles").doc(id).get()).data();
		if(toReturn) return { ...toReturn, id };
	}
	async getProfiles(searchParams, user) {
		let toReturn = [];
		let docRefs;
		if(_.isArray(searchParams.ids) && !_.isEmpty(searchParams.ids)) {
			// Firestore can only do an "IN" search with 10 items at a time
			const chunkedIds = _.chunk(searchParams.ids, 10);
			for(let ids of chunkedIds) {
				docRefs = await this.FirestoreDB.collection("profiles").where(firebase.firestore.FieldPath.documentId(), "in", ids).get();
				docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
			}
			toReturn = _.orderBy(toReturn, a => new Date(a.dateCreated), ["asc"]);
		} else if(_.isArray(searchParams.tags) && !_.isEmpty(searchParams.tags)) {
			// Reaching this block means this query is for the explore page
			const chunkedTags = _.chunk(searchParams.tags, 10);
			for(let tags of chunkedTags) {
				docRefs = await this.FirestoreDB.collection("profiles").where("tags", "array-contains-any", tags);

				// Pre Firestore filters
				if(searchParams.filter.hasPortfolio) docRefs = docRefs.where("portfolio", "!=", []);
				if(searchParams.filter.dayShift) docRefs = docRefs.where("availability.dayShift", "==", searchParams.filter.dayShift);
				if(searchParams.filter.nightShift) docRefs = docRefs.where("availability.nightShift", "==", searchParams.filter.nightShift);
				if(_.compact(searchParams.filter.location).length === 0) {
					if(searchParams.filter.city) docRefs = docRefs.where("city", "==", searchParams.filter.city);
					if(searchParams.filter.region) docRefs = docRefs.where("region", "==", searchParams.filter.region);
				}

				docRefs = await docRefs.get();
				docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));

				// Post Firestore filters
				toReturn = _.filter(toReturn, profile => {
					let passThrough = true;
					if(passThrough && !_.isEmpty(searchParams.filter.days)) passThrough = !!_.find(profile.availability.days, day => _.indexOf(searchParams.filter.days, day) !== -1);
					if(passThrough && searchParams.filter.hasWork) passThrough = _.size(profile.workExperiences) > 0;
					if(passThrough && searchParams.filter.hasEducation) passThrough = _.size(profile.educationExperiences) > 0;
					if(passThrough && _.isNumber(searchParams.filter.workExperience)) passThrough = _.inRange(_(profile.workExperiences).map("years").sum(), searchParams.filter.workExperience - 2, searchParams.filter.workExperience + 2.1);
					if(passThrough && _.isNumber(searchParams.filter.educationExperience)) passThrough = _.inRange(_(profile.educationExperiences).map("years").sum(), searchParams.filter.educationExperience - 2, searchParams.filter.educationExperience + 2.1);
					if(passThrough && _.compact(searchParams.filter.location).length > 0) {
						if(_.compact(profile.location).length === 0) return false;

						const [latitude, longitude] = profile.location;
						let { distance, location } = searchParams.filter;
						const [searchLatitude, searchLongitude] = location;
						passThrough = _.inRange(latitude, searchLatitude - distance, searchLatitude + distance);
						passThrough = passThrough && _.inRange(longitude, searchLongitude - distance, searchLongitude + distance);
					}

					return passThrough;
				});

				// if(!_.isEmpty(searchParams.filter.days)) toReturn = _.filter(toReturn, profile => _.find(profile.availability.days, day => _.indexOf(searchParams.filter.days, day) !== -1));
				// if(searchParams.filter.hasWork) toReturn = _.filter(toReturn, profile => _.size(profile.workExperiences) > 0);
				// if(searchParams.filter.hasEducation) toReturn = _.filter(toReturn, profile => _.size(profile.educationExperiences) > 0);
				// if(_.isNumber(searchParams.filter.workExperience)) toReturn = _.filter(toReturn, profile => _.inRange(_(profile.workExperiences).map("years").sum(), searchParams.filter.workExperience - 2, searchParams.filter.workExperience + 2.1));
				// if(_.isNumber(searchParams.filter.educationExperience)) toReturn = _.filter(toReturn, profile => _.inRange(_(profile.educationExperiences).map("years").sum(), searchParams.filter.educationExperience - 2, searchParams.filter.educationExperience + 2.1));
				// if(_.isNumber(searchParams.filter.distance)) {}

			}

			// Add/Update search record for statistics
			let searcher = (await this.FirestoreDB.collection("users").doc(user.email.toLowerCase()).get()).data();
			const userType = searcher ? searcher.type === 0 ? "seeker" : "employer" : "demo"; // Anonymous/Demo searches means there is no value and thus ignored by Firebase
			for(let searchTag of searchParams.tags) {
				await this.FirestoreDB.collection("searches").doc(searchTag).set({ [new Date().valueOf()]: searcher ? searcher[userType] : userType }, { merge: true });
			}


			toReturn = _(toReturn).shuffle().sortBy(profile => _.size(_.filter(profile.tags, tag => _.indexOf(searchParams.tags, tag) > -1))).reverse().value();
		} else {
			return [];

			// DANGEROUS
			docRefs = await this.FirestoreDB.collection("profiles").get();
			docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));

			toReturn = _.shuffle(toReturn);
		}

		return toReturn;
	}
	async saveProfile(toSave, email) {
		let profile;
		// Get the user to reference its seeker property
		const user = (await this.FirestoreDB.collection("users").doc(email.toLowerCase()).get()).data();
		// Get the employer/seeker the user corresponds with to update its profiles
		const seeker = (await this.FirestoreDB.collection("seekers").doc(user.seeker).get()).data();
		const employer = (await this.FirestoreDB.collection("employers").doc(user.employer).get()).data();

		// Determine if toSave is new or existing
		if(toSave.id) {
			// Reaching this block means the profile to save needs to be updated.
			// Verify that the toSave exists in the Firestore DB and it belongs to the user meaning they have the permission to modify its contents
			const isOwner = _(seeker?.profiles).concat(employer?.profiles).value().indexOf(toSave.id) > -1;
			profile = isOwner && (await this.FirestoreDB.collection("profiles").doc(toSave.id).get()).data();
			if(isOwner && profile) {
				// Employer profiles cannot change their profile name
				// JK nevermind
				// if(user.type !== 0) toSave.name = user.name;

				// Save the profile
				await this.FirestoreDB.collection("profiles").doc(toSave.id).set({ ...toSave, dateCreated: undefined, dateModified: new Date().toISOString() }, { merge: true });
				// Get the newly added profile
				profile = (await this.FirestoreDB.collection("profiles").doc(toSave.id).get()).data();
			} else if(isOwner) {
				throw new Error("User does not have permission to edit the profile.");
			} else {
				throw new Error("Profile has an ID but does not exist in DB");
			}
		} else {
			// Reaching this block means the profile to save is new
			// Add the toSave profile to Firestore DB
			const docRef = await this.FirestoreDB.collection("profiles").add({ ...toSave, dateCreated: new Date().toISOString(), dateModified: undefined });
			// Get the newly added profile for return value
			profile = { ...(await this.FirestoreDB.collection("profiles").doc(docRef.id).get()).data(), id: docRef.id };
		}

		// Based on the user type, save the corresponding profile to their respective employer/seeker table
		switch(user.type) {
			case 0:
				// Edit the seeker's profiles list to contain the newly modified profile
				seeker.profiles = _.filter(seeker.profiles, a => a !== profile.id);
				seeker.profiles.push(profile.id);

				// Only 3 profiles allowed for now
				seeker.profiles = _.slice(seeker.profiles, 0, 3);

				// Save the seeker with the new profiles list to Firestore DB
				await this.FirestoreDB.collection("seekers").doc(user.seeker).set(seeker, { merge: true });
				break;

			case 1:
				// Edit the employer's profiles list to contain the newly modified profile
				// Only one profile per employer allowed
				// employer.profiles = _.filter(employer.profiles, a => a !== profile.id);
				employer.profiles = [];
				employer.profiles.push(profile.id);

				// Save the employer with the new profiles list to Firestore DB
				await this.FirestoreDB.collection("employers").doc(user.employer).set(employer, { merge: true });
				break;
		}
		return profile;
	}
	async deleteProfile(id, email) {
		// Get the user to reference its seeker property
		const user = (await this.FirestoreDB.collection("users").doc(email.toLowerCase()).get()).data();

		switch(user.type) {
			case 0: {
				// Get the seeker the user corresponds with to update its profiles
				const seeker = (await this.FirestoreDB.collection("seekers").doc(user.seeker).get()).data();
				seeker.profiles = _.filter(seeker.profiles, profileId => profileId !== id);
				await this.FirestoreDB.collection("seekers").doc(user.seeker).set(seeker, { merge: true });
				break;
			}

			case 1: {
				// Get the employer the user corresponds with to update its profiles
				const employer = (await this.FirestoreDB.collection("employers").doc(user.employer).get()).data();
				employer.profiles = _.filter(employer.profiles, profileId => profileId !== id);
				await this.FirestoreDB.collection("employers").doc(user.employer).set(employer, { merge: true });
				break;
			}
		}

		// Mark the profile as deleted
		const toDelete = await this.getProfile(id).catch(error => console.log(error));
		if(toDelete) {
			await this.FirestoreDB.collection("deleted-profiles").add({ ...toDelete, dateDeleted: new Date().toISOString() });
			await this.FirestoreDB.collection("profiles").doc(id).delete();
		}
	}
	async reportProfile(toReport, email) {
		// We don't use the ID because cloning it would mean we will have access to the current state prior to reporting
		await this.FirestoreDB.collection("reported-profiles").add({ ...toReport, dateReported: new Date().toISOString(), reportedBy: email });
		return toReport;
	}

	async savePortfolio(file) {
		var bucket = this.StorageDB.bucket();
		// Uploads a local file to the bucket
		const response = await bucket.upload(file.uri, { metadata: { cacheControl: "public, max-age=31536000" }, onUploadProgress: console.log });
		return await response[0].getMetadata();
	}

	async saveMessage(toSave) {
		await this.FirestoreDB.collection("messages").doc(toSave.id).update({
			[toSave.timestamp]: {
				message: toSave.message,
				sender: toSave.sender
			}
		});
	}

	async getProduct(id) {
		const toReturn = (await this.FirestoreDB.collection("products").doc(id).get()).data();
		if(toReturn) return { ...toReturn, id };
	}
	async getProductByType(type) {
		const toReturn = [];
		let docRefs = await this.FirestoreDB.collection("products").where("type", "==", type).get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		return toReturn[0];
	}

	async getCoupon(id) {
		const toReturn = (await this.FirestoreDB.collection("coupons").doc(id).get()).data();
		if(toReturn) return { ...toReturn, id };
	}
	async getCouponByCode(code) {
		const toReturn = [];
		let docRefs = await this.FirestoreDB.collection("coupons").where("code", "==", _.toUpper(code)).get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		return toReturn[0];
	}
	async saveCoupon(toSave) {
		let { id } = toSave;
		if(id) {
			await this.FirestoreDB.collection("coupons").doc(id).set(toSave, { merge: true });
		} else {
			id = (await this.FirestoreDB.collection("coupons").add(toSave)).id;
		}
		return { ...toSave, id };
	}
	async decrementCoupon(id) {
		const toDecrement = await this.getCoupon(id);
		if(!toDecrement) throw new Error("Coupon not found");
		toDecrement.count--;
		return await this.saveCoupon(toDecrement);
	}

	async getPromotions(ids) {
		let toReturn = [];
		let docRefs;
		if(_.isArray(ids) && !_.isEmpty(ids)) {
			// Firestore can only do an "IN" search with 10 items at a time
			const chunkedIds = _.chunk(ids, 10);
			for(let ids of chunkedIds) {
				docRefs = await this.FirestoreDB.collection("promotions").where(firebase.firestore.FieldPath.documentId(), "in", ids).get();
				docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
			}
			toReturn = _.orderBy(toReturn, a => new Date(a.dateCreated), ["asc"]);
		}

		return toReturn;
	}
	async getAllPromotions() {
		let toReturn = [];
		// Return all active promotions
		let docRefs = await this.FirestoreDB.collection("promotions").get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		toReturn = _(toReturn).filter(promo => !isComplete(promo)).orderBy(a => new Date(a.dateCreated), ["asc"]).value();

		return toReturn;
	}
	async getPromotion(id) {
		const toReturn = (await this.FirestoreDB.collection("promotions").doc(id).get()).data();
		if(toReturn) return { ...toReturn, id };
	}
	async savePromotion(toSave, email) {
		let { id } = toSave;
		if(id) {
			await this.FirestoreDB.collection("promotions").doc(id).set(toSave, { merge: true });
		} else {
			id = (await this.FirestoreDB.collection("promotions").add(toSave)).id;

			// Add to employer record
			const user = await this.getUser(email);
			const employer = await this.getEmployer(user.employer);
			employer.promotions = [ ..._.filter(employer.promotions, promo => promo !== id), id ];
			await this.saveEmployer(employer);
		}
		return await this.getPromotion(id);
	}
}

// Determine which promotions have ended and exclude them in return value
function isComplete(toCheck) {
	const { toggles, duration } = toCheck;
	if(_.size(toggles) % 2 === 0) return true; // This means the promotion is paused

	let durationUsage = [];
	for(let index = 1; index < _.size(toggles); index += 2) {
		const startToggle = toggles[index - 1];
		const stopToggle = toggles[index];
		durationUsage.push(stopToggle - startToggle);
	}

	// If the promotion is active, append the current time
	const toggleSize = _.size(toggles);
	if(toggleSize > 0 && toggleSize % 2 !== 0) durationUsage.push(new Date().valueOf() - _.last(toggles));
	durationUsage = _.sum(durationUsage);

	return duration <= durationUsage;
}

module.exports = Firebase;