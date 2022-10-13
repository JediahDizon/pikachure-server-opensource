const fs = require("fs");
const _ = require("lodash");

// Token Authorization
const { OAuth2Client } = require("google-auth-library");
const jwksClient = require("jwks-rsa");
const jwt = require("jsonwebtoken");
const { PIKACHURE_CLIENT_ID } = require("src/package.json").Pikature;
const CLIENT_IDS = [require("src/package.json").Pikature.CLIENT_ID];
const { AnimalNames } = require("src/res");

// const firebase = require("firebase");
require("firebase/storage");

// https://firebase.google.com/docs/firestore/quickstart#node.js
const admin = require("firebase-admin");
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldPath } = require('firebase-admin/firestore');
const GOOGLE_APPLICATION_CREDENTIALS = require("src/cert/pikature-firebase-adminsdk-kbf2k-f79d0c00ec.json");

initializeApp({
	credential: admin.credential.cert(GOOGLE_APPLICATION_CREDENTIALS),
	databaseURL: "https://pikature.firebaseio.com",
	storageBucket: "pikature.appspot.com",
});
class Pikature {
	static defaultOptions = { data: true };
	auth;

	constructor() {
		this.FirestoreDB = getFirestore();
		this.FirestoreDB.settings({ ignoreUndefinedProperties: true });

		this.StorageDB = admin.storage();

		setTimeout(() => {
			// this.populateUsers(userList);
			// this.populateSeekers(seekers);
			// this.populateEmployers(employers);
			// this.populateMessages(messages);
			//this.testFunction()
		}, 2000);
	}

	async testFunction() {

		// const crypto = require("crypto");
		// const toPrint = crypto.createHash("sha256").update("test").digest("hex");
		// console.log(toPrint);

		// const toPrint = await this.getProfiles({ tags: ["developer", "photographer", "graphql", "react native", "doge", "test", "help"], filter: {} });
		// console.log(_.map(toPrint, "name"));
	}

	async saveUser(user) {
		!_.isEmpty(user) && console.log(`${new Date().toISOString()}: saveUser(${JSON.stringify(user, null, "\t")})`);

		await this.FirestoreDB.collection("users").doc(user.sub).set({ ...user }, { merge: true });
		return await this.getUser(user.sub);
	}
	async getUser(sub) {
		!_.isEmpty(sub) && console.log(`${new Date().toISOString()}: getUser(${sub})`);

		const doc = await this.FirestoreDB.collection("users").doc(sub).get();
		let user = doc.data();
		if (_.isEmpty(user)) throw new Error("User not found");

		return { ...user, id: doc.id };
	}
	async getUserByTag(tag) {
		!_.isEmpty(tag) && console.log(`${new Date().toISOString()}: getUserByTag(${tag})`);

		const users = [];
		let docRefs = await this.FirestoreDB.collection("users")
			.where("tag", "==", tag)
			.get();

		docRefs.forEach(doc => users.push({ ...doc.data(), id: doc.id }));
		if (_.isEmpty(users) || _.isEmpty(users[0])) throw new Error("User not found");

		return users[0];
	}
	async getUsers(ids, { data } = Pikature.defaultOptions) {
		!_.isEmpty(ids) && console.log(`${new Date().toISOString()}: getUsers(${ids}) - { data: ${data} }`);

		const toReturn = [];
		let docRefs;

		// Firestore can only do an "IN" search with 10 items at a time
		const chunkedIds = _.chunk(ids, 10);
		for (let ids of chunkedIds) {
			docRefs = await this.FirestoreDB.collection("users").where(FieldPath.documentId(), "in", ids).get();
			docRefs.forEach(doc => toReturn.push(!data ? doc.id : { ...doc.data(), id: doc.id }));
		}
		return toReturn;
	}
	async searchUsers(nameOrTag) {
		!_.isEmpty(nameOrTag) && console.log(`${new Date().toISOString()}: searchUsers(${nameOrTag})`);

		let toReturn = [];
		if (!nameOrTag) return toReturn;

		let docRefs = await this.FirestoreDB.collection("users")
			.where("tag", "==", _.toLower(nameOrTag))
			.get();

		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));

		//docRefs = await this.FirestoreDB.collection("users")
		//	.orderBy("name")
		//	.startAt(_.toUpper(nameOrTag))
		//	.endAt(_.toLower(nameOrTag))
		//	.get();

		//docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));

		toReturn = _.uniqBy(toReturn, "id");
		return toReturn;
	}

	async getOpenInvites(ids, { data } = Pikature.defaultOptions) {
		!_.isEmpty(ids) && console.log(`${new Date().toISOString()}: getOpenInvites(${ids}) - { data: ${data} }`);

		const toReturn = [];
		let docRefs = [];
		if (_.isEmpty(ids)) {
			docRefs = await this.FirestoreDB.collection("posts")
				.where("datePosted", "==", null) // This indicates that the post is an open-invite and not a published post with photos
				.orderBy("dateCreated", "desc")
				.get();

			docRefs.forEach(doc => toReturn.push(!data ? doc.id : { ...doc.data(), id: doc.id }));
		} else {
			// Firestore can only do an "IN" search with 10 items at a time
			const chunkedIds = _.chunk(ids, 10);
			for (let ids of chunkedIds) {
				docRefs = await this.FirestoreDB.collection("posts")
					.where(FieldPath.documentId(), "in", ids) // This indicates that the post is an open-invite and not a published post with photos
					.where("datePosted", "==", null)
					.get();

				docRefs.forEach(doc => toReturn.push(!data ? doc.id : { ...doc.data(), id: doc.id }));
			}
		}

		return toReturn;
	}
	// async getOpenInvites(sub) {
	// 	let user = await this.getUser(sub);

	// 	const toReturn = [];
	// 	let docRefs = await this.FirestoreDB.collection("posts")
	// 		.where("datePosted", "==", null)
	// 		.orderBy("dateCreated", "desc")
	// 		.get();

	// 	docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
	// 	return toReturn;
	// }
	async getOpenInvitesByLocation(options) {
		!_.isEmpty(options) && console.log(`${new Date().toISOString()}: getOpenInvitesByLocation(${JSON.stringify(options, null, "\t")})`);

		const { lat, lng, radius } = options;
		let toReturn = [];

		let docRefs = await this.FirestoreDB.collection("posts")
			.orderBy("lat")
			.orderBy("lng")
			.startAt(lat - radius, lng - radius)
			.endAt(lat + radius, lng + radius)
			.get();

		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));

		toReturn = _(toReturn).filter(post => _.isEmpty(post.datePosted)).uniqBy("id").sortBy([post => new Date(post.dateCreated)]).value();
		return toReturn;
	}
	async getOpenInvitesByUser(sub, { data } = Pikature.defaultOptions) {
		!_.isEmpty(sub) && console.log(`${new Date().toISOString()}: getOpenInvitesByUser(${sub}) - { data: ${data} }`);

		const toReturn = [];
		let docRefs = await this.FirestoreDB.collection("posts")
			.where("host", "==", sub)
			.where("datePosted", "==", null)
			.get();

		docRefs.forEach(doc => toReturn.push(!data ? doc.id : { ...doc.data(), id: doc.id }));
		return toReturn;
	}
	async getOpenInvitesByGuest(sub, { data } = Pikature.defaultOptions) {
		!_.isEmpty(sub) && console.log(`${new Date().toISOString()}: getOpenInvitesByGuest(${sub}) - { data: ${data} }`);

		const toReturn = [];
		let docRefs = await this.FirestoreDB.collection("posts")
			.where("guests", "array-contains", sub)
			.where("datePosted", "==", null)
			.get();

		docRefs.forEach(doc => toReturn.push(!data ? doc.id : { ...doc.data(), id: doc.id }));
		return toReturn;
	}

	async getPosts(ids, { data } = Pikature.defaultOptions) {
		!_.isEmpty(ids) && console.log(`${new Date().toISOString()}: getPosts(${ids}) - { data: ${data} }`);

		const toReturn = [];
		let docRefs;

		// Firestore can only do an "IN" search with 10 items at a time
		const chunkedIds = _.chunk(ids, 10);
		for (let ids of chunkedIds) {
			docRefs = await this.FirestoreDB.collection("posts").where(FieldPath.documentId(), "in", ids).get();
			docRefs.forEach(doc => toReturn.push(!data ? doc.id : { ...doc.data(), id: doc.id }));
		}
		return toReturn;
	}
	async getPost(id) {
		!_.isEmpty(id) && console.log(`${new Date().toISOString()}: getPost(${id})`);

		let post = (await this.FirestoreDB.collection("posts").doc(id).get()).data();
		if (_.isEmpty(post)) throw new Error("Post not found");

		return { ...post, id };
	}
	async getPostsByUser(sub, { data } = Pikature.defaultOptions) {
		!_.isEmpty(sub) && console.log(`${new Date().toISOString()}: getPostsByUser(${sub}) - { data: ${data} }`);

		const toReturn = [];
		let docRefs = await this.FirestoreDB.collection("posts")
			.where("host", "==", sub)
			.where("datePosted", "!=", false)
			.orderBy("datePosted", "desc")
			.get();

		docRefs.forEach(doc => {
			const toPush = !data ? doc.id : { ...doc.data(), id: doc.id };
			toReturn.push(toPush);
		})
		return toReturn;
	}
	async getPostsByGuest(sub, { data } = Pikature.defaultOptions) {
		!_.isEmpty(sub) && console.log(`${new Date().toISOString()}: getPostsByGuest(${sub}) - { data: ${data} }`);

		const toReturn = [];
		let docRefs = await this.FirestoreDB.collection("posts")
			.where("guests", "array-contains", sub)
			.where("datePosted", "!=", false)
			.orderBy("datePosted", "desc")
			.get();

		docRefs.forEach(doc => toReturn.push(!data ? doc.id : { ...doc.data(), id: doc.id }));
		return toReturn;
	}
	async savePost(post) {
		!_.isEmpty(post) && console.log(`${new Date().toISOString()}: savePost(${JSON.stringify(post, null, "\t")})`);

		// if(post.host && _.isEmpty(await this.getUser(post.host))) throw new Error("Invalid Post author");

		if (post.id) {
			// Edit existing post
			await this.FirestoreDB.collection("posts").doc(post.id).set({ ...post }, { merge: true });
			return await this.getPost(post.id);
		} else {
			// Create new post
			const docRef = await this.FirestoreDB.collection("posts").add({ ...post });
			return await this.getPost(docRef.id);
		}
	}
	async deletePost(id) {
		!_.isEmpty(id) && console.log(`${new Date().toISOString()}: deletePost(${id})`);

		const post = (await this.FirestoreDB.collection("posts").doc(id).get()).data();
		if (_.isEmpty(post)) return;

		await this.FirestoreDB.collection("posts-deleted").doc(id).set({ ...post, dateDeleted: new Date().toISOString() });
		await this.FirestoreDB.collection("posts").doc(id).delete();
		return post;
	}

	async savePhoto(file) {
		!_.isEmpty(file) && console.log(`${new Date().toISOString()}: savePhoto(${JSON.stringify(file, null, "\t")})`);

		var bucket = this.StorageDB.bucket();

		if (!_.isEmpty(file.uri)) {
			// Uploads a local file to the bucket
			await bucket.upload(file.uri, { metadata: { dataControl: "public, max-age=31536000" }, onUploadProgress: console.log });
			const docRef = await this.FirestoreDB.collection("files").add({ ...file, uri: undefined });
			return await this.getPhoto(docRef.id);
		}
		const docRef = await this.FirestoreDB.collection("files").doc(file.id).set({ ...file, uri: undefined }, { merge: true });
		return await this.getPhoto(file.id);
	}
	async getPhoto(id) {
		!_.isEmpty(id) && console.log(`${new Date().toISOString()}: getPhoto(${id})`);

		return (await this.FirestoreDB.collection("files").doc(id).get()).data();
	}
	async getPhotoByName(name, { data } = Pikature.defaultOptions) {
		!_.isEmpty(name) && console.log(`${new Date().toISOString()}: getPhotoByName(${name}) - { data: ${data} }`);

		let toReturn = [];

		let docRefs = await this.FirestoreDB.collection("files").where("name", "==", name).get();
		docRefs.forEach(doc => toReturn.push(!data ? doc.id : { ...doc.data(), id: doc.id }));

		return _.first(toReturn);
	}
	async getPhotosByOwner(sub, { data } = Pikature.defaultOptions) {
		!_.isEmpty(sub) && console.log(`${new Date().toISOString()}: getPhotoByName(${sub}) - { data: ${data} }`);

		let toReturn = [];
		let docRefs = await this.FirestoreDB.collection("files").where("owner", "==", sub).get();
		docRefs.forEach(doc => toReturn.push(!data ? doc.id : { ...doc.data(), id: doc.id }));

		return toReturn;
	}
	async getPhotos(ids, { data } = Pikature.defaultOptions) {
		!_.isEmpty(ids) && console.log(`${new Date().toISOString()}: getPhotos(${JSON.stringify(ids, null, "\t")}) - { data: ${data} }`);

		let toReturn = [];
		let docRefs;

		// Firestore can only do an "IN" search with 10 items at a time
		const chunkedIds = _.chunk(ids, 10);
		for (let ids of chunkedIds) {
			docRefs = await this.FirestoreDB.collection("files").where("name", "in", ids).get();
			docRefs.forEach(doc => toReturn.push(!data ? doc.id : { ...doc.data(), id: doc.id }));
		}
		return toReturn;
	}

	async savePlace(place) {
		!_.isEmpty(place) && console.log(`${new Date().toISOString()}: savePlace(${JSON.stringify(place, null, "\t")})`);

		// Request from Google Places API gets backed up here
		await this.FirestoreDB.collection("places").doc(place.id || place.placeId).set({ ...place }, { merge: true });
	}
	async getPlace(id) {
		!_.isEmpty(id) && console.log(`${new Date().toISOString()}: getPlace(${id})`);

		let place = (await this.FirestoreDB.collection("places").doc(id).get()).data();
		if (_.isEmpty(place)) throw new Error("Place not found");

		return { ...place, id };
	}
	async getPlaces(ids) {
		!_.isEmpty(ids) && console.log(`${new Date().toISOString()}: getPlaces(${ids})`);

		const toReturn = [];
		let docRefs = await this.FirestoreDB.collection("places")
			.limit(10)
			.get();

		docRefs.forEach(doc => users.push({ ...doc.data(), id: doc.id }));
		return toReturn;
	}
	async getPlacesByLocation(options) {
		!_.isEmpty(options) && console.log(`${new Date().toISOString()}: getPlacesByLocation(${JSON.stringify(options, null, "\t")})`);

		const { lat, lng, radius } = options;
		let toReturn = [];

		let docRefs = await this.FirestoreDB.collection("places")
			.orderBy("lat")
			.startAt(lat - radius)
			.endAt(lat + radius)
			.get();

		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		toReturn = _.filter(toReturn, place => _.inRange(place.lng, lng - (radius), lng + (radius)));
		return toReturn;
	}

	async saveComment(comment) {
		!_.isEmpty(comment) && console.log(`${new Date().toISOString()}: saveComment(${JSON.stringify(comment, null, "\t")})`);

		// If comment has an ID, it means the comment is to be edited 
		if (comment.id) {
			await this.FirestoreDB.collection("comments").doc(comment.id).set({ ...comment }, { merge: true });
			return await this.getComment(comment.id);
		}

		const docRef = await this.FirestoreDB.collection("comments").add({ ...comment });
		return await this.getComment(docRef.id);
	}
	async getComment(id) {
		!_.isEmpty(id) && console.log(`${new Date().toISOString()}: getComment(${id})`);

		let comment = (await this.FirestoreDB.collection("comments").doc(id).get()).data();
		if (_.isEmpty(comment)) throw new Error("Comment not found");

		return { ...comment, id };
	}
	async getComments(ids) {
		!_.isEmpty(ids) && console.log(`${new Date().toISOString()}: getComments(${ids})`);

		ids = _.compact(ids); // ?
		let toReturn = [];

		// Firestore can only do an "IN" search with 10 items at a time
		let docRefs;
		const chunkedIds = _.chunk(ids, 10);
		for (let ids of chunkedIds) {
			docRefs = await this.FirestoreDB.collection("comments").where(FieldPath.documentId(), "in", ids).get();
			docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));
		}
		toReturn = _(toReturn).sortBy([a => new Date(a.dateCreated)]).reverse().value();
		return toReturn;
	}
	async getCommentsByUser(sub) {
		!_.isEmpty(sub) && console.log(`${new Date().toISOString()}: getCommentsByUser(${sub})`);

		const toReturn = [];
		let docRefs = await this.FirestoreDB.collection("comments").where("user", "==", sub).get();
		docRefs.forEach(doc => toReturn.push({ ...doc.data(), id: doc.id }));

		return toReturn;
	}
	async getCommentsByPost(id, { data } = Pikature.defaultOptions) {
		!_.isEmpty(id) && console.log(`${new Date().toISOString()}: getCommentsByPost(${id}) - { data: ${data} }`);

		const post = await this.getPost(id);
		if (_.isEmpty(post.comments)) return [];

		let toReturn = [];

		// Firestore can only do an "IN" search with 10 items at a time
		let docRefs;
		const chunkedIds = _.chunk(post.comments, 10);
		for (let ids of chunkedIds) {
			docRefs = await this.FirestoreDB.collection("comments").where(FieldPath.documentId(), "in", ids).get();
			docRefs.forEach(doc => toReturn.push(!data ? doc.id : { ...doc.data(), id: doc.id }));
		}
		//toReturn = _(toReturn).sortBy([a => new Date(a.dateCreated)]).reverse().value();
		return toReturn;
	}
	async deleteComment(id) {
		!_.isEmpty(id) && console.log(`${new Date().toISOString()}: deleteComment(${id})`);

		const comment = (await this.FirestoreDB.collection("comments").doc(id).get()).data();
		if (_.isEmpty(comment)) return;

		await this.FirestoreDB.collection("comments-deleted").doc(id).set({ ...comment, dateDeleted: new Date().toISOString() });
		await this.FirestoreDB.collection("comments").doc(id).delete();
		return comment;
	}

	async login(user) {
		!_.isEmpty(user) && console.log(`${new Date().toISOString()}: login(${user})`);

		let toSave = { ...user };
		if (_.isEmpty(await this.getUser(user.email))) {
			toSave.dateCreated = new Date().toISOString();
		} else {
			toSave.dateModified = new Date().toISOString();
		}

		await this.FirestoreDB.collection("users").doc(user.email.toLowerCase()).set(toSave, { merge: true });
		let snapshot = await this.FirestoreDB.collection("users").doc(user.email.toLowerCase()).get();
		return snapshot.data();
	}

	async getFeedback(id) {
		!_.isEmpty(id) && console.log(`${new Date().toISOString()}: getFeedback(${id})`);

		let feedback = (await this.FirestoreDB.collection("feedbacks").doc(id).get()).data();
		if (_.isEmpty(feedback)) throw new Error("Feedback not found");

		return { ...feedback, id };
	}

	async saveFeedback(feedback) {
		// If comment has an ID, it means the comment is to be edited 
		if (feedback.id) {
			await this.FirestoreDB.collection("feedbacks").doc(feedback.id).set({ ...feedback }, { merge: true });
			return await this.getFeedback(feedback.id);
		}

		const docRef = await this.FirestoreDB.collection("feedbacks").add({ ...feedback });
		return await this.getFeedback(docRef.id);
	}

	async verifyToken(idToken) {
		let activeUser = jwt.decode(idToken, { complete: true });
		if (!activeUser) throw new Error("Invalid token");

		switch (activeUser.payload.iss) {
			case "https://appleid.apple.com": {
				const { header: { kid } } = activeUser;
				const client = jwksClient({ jwksUri: "https://appleid.apple.com/auth/keys" });
				const publicKey = (await client.getSigningKey(kid)).getPublicKey();
				const toReturn = jwt.verify(idToken, publicKey);

				return toReturn;
			}

			case "https://accounts.google.com":
			case "accounts.google.com": {
				activeUser = activeUser.payload;
				const AuthClient = new OAuth2Client(activeUser[activeUser.aud]);
				let toReturn = await AuthClient.verifyIdToken({
					idToken,
					audience: CLIENT_IDS
				});

				return toReturn.getPayload();
			}

			// Demo JWT token
			case "https://pikachure-server.online": {
				const filters = {
					complete: true,
					ignoreExpiration: true,
					// subject: "demo@pikachure-server.online",
					algorithm: "RS256",
					audience: "pikachure.com",
					issuer: "https://pikachure-server.online"
				};

				activeUser = activeUser.payload;
				// Verify Pikachure token
				const toReturn = jwt.verify(idToken, PIKACHURE_CLIENT_ID, filters);
				return toReturn.payload;
			}

			default:
				throw new Error("Invalid token");
		}
	}

	async getToken() {
		const toSign = {
			"iss": "https://pikachure-server.online",
			"iat": new Date().valueOf(),
			"aud": "pikachure.com",
			"sub": `_${Math.floor(Math.random() * Math.pow(10, 16))}`,
			"name": `${AnimalNames[_.random(0, _.size(AnimalNames) - 1)]} ${AnimalNames[_.random(0, _.size(AnimalNames) - 1)]}`
		};

		return jwt.sign(toSign, PIKACHURE_CLIENT_ID);
	}
}

module.exports = new Pikature();