const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const https = require("https");
const _ = require("lodash");
const GraphQLLong = require("graphql-type-long");
const { v4: uuidv4 } = require("uuid");

const { Pikature, Cache } = require("src/services");
const { User, Post, Image, Comment, Place, Feedback } = require("./models");
const { saveComment, savePost, getUser } = require("../services/pikature");

module.exports = {
	// Upload: GraphQLUpload,
	Long: GraphQLLong,

	// DirectMessage: {
	// 	users: async (parentValue, args, { activeUser }) => {
	// 		const toReturn = await Firebase.getUsers(parentValue.users);
	// 		return _.map(toReturn, user => Anonymizer.anonymizeUser(user));
	// 	}
	// },

	User: {
		posts: async (parentValue, args, { activeUser }) => {
			if (_.isEmpty(parentValue.id)) return;
			const options = { data: false };

			// Get the IDs of the posts to return
			const postIds = _(await Pikature.getPostsByUser(parentValue.id, options))
				.concat(await Pikature.getPostsByGuest(parentValue.id, options))
				.concat(await Pikature.getOpenInvitesByUser(parentValue.id, options))
				.concat(await Pikature.getOpenInvitesByGuest(parentValue.id, options))
				.value();

			// Get the Posts from the cache
			let toReturn = await Cache.get(postIds);

			// Get the IDs of Posts to download from DB
			const toDownload = _.difference(postIds, _.map(toReturn, "id"));
			const toAppend = await Pikature.getPosts(toDownload);
			await Cache.set("id", toAppend);

			// Concatenate the Posts
			toReturn = _(toReturn)
				.concat(toAppend)
				.sortBy([post => new Date(post.datePosted || post.dateCreated).valueOf()])
				.reverse()
				.value();

			//const toReturn = _(await Pikature.getPostsByUser(parentValue.id))
			//	.concat(await Pikature.getPostsByGuest(parentValue.id))
			//	.concat(await Pikature.getOpenInvitesByUser(parentValue.id))
			//	.concat(await Pikature.getOpenInvitesByGuest(parentValue.id))
			//	.sortBy([post => new Date(post.datePosted || post.dateCreated).valueOf()])
			//	.reverse()
			//	.value();

			return toReturn;
		},
		cover: async (parentValue, args, { activeUser }) => {
			if (_.isEmpty(parentValue.cover)) return;

			// Get the cached Cover Photo
			let cover = await Cache.get(parentValue.cover);
			if (!cover) {
				// Download Cover Photo
				cover = await Pikature.getPhotoByName(parentValue.cover)
				await Cache.set("name", cover);
			}

			return cover;
		}
	},
	Post: {
		host: async (parentValue, args, { activeUser }) => {
			if (_.isEmpty(parentValue.host)) return;
			let user = await Cache.get(parentValue.host);
			if (!user) {
				user = await Pikature.getUser(parentValue.host);
				await Cache.set("id", user);
			}
			return Anonymizer.anonymizeUser(user);
		},
		gallery: async (parentValue, args, { activeUser }) => {
			// For open invites with no `datePosted` value, only those who are the host or guests can see the gallery
			if (_.isEmpty(parentValue.datePosted) && _.indexOf(_.concat(parentValue.guests, parentValue.host), activeUser.sub) === -1) return [];
			if (_.isEmpty(parentValue.gallery)) return [];

			// Get Photos from Cache
			let toReturn = await Cache.get(parentValue.gallery);
			// Get the list of Photos to download
			const toDownload = _.difference(parentValue.gallery, _.map(toReturn, "name"));
			// Get all the Photos that belongs to the Post
			const toAppend = await Pikature.getPhotos(toDownload);
			await Cache.set("name", toAppend);

			toReturn = _.concat(toReturn, toAppend);
			return toReturn;
		},
		cover: async (parentValue, args, { activeUser }) => {
			if (_.isEmpty(parentValue.cover)) return;

			// Get Photos from Cache
			let toReturn = await Cache.get(parentValue.cover);
			// Get the list of Photos to download
			const toDownload = _.difference(parentValue.cover, _.map(toReturn, "name"));
			// Get all the Photos that belongs to the Post
			const toAppend = await Pikature.getPhotos(toDownload);
			await Cache.set("name", toAppend);

			// if(_.isEmpty(cover)) {
			// 	cover = await Pikature.getPhotos(parentValue.cover);
			// 	await Cache.set("name", cover);
			// }

			toReturn = _.concat(toReturn, toAppend);
			return toReturn;
		},
		comments: async (parentValue, args, { activeUser }) => {
			if (_.isEmpty(parentValue.comments)) return [];
			let toReturn;

			if (_.size(parentValue.comments) > 3) {
				const truncatedComments = _.slice(parentValue.comments, 0, 3);
				let toReturn = await Cache.get(truncatedComments);
				// Download the Comments missing from the cache
				const toDownload = _.difference(truncatedComments, _.map(toReturn, "id"));
				const toAppend = await Pikature.getComments(toDownload);
				await Cache.set("id", toAppend);

				toReturn = _.concat(toReturn, toAppend, new Array(_.size(parentValue.comments) - 3));
				return toReturn;
			}

			// Get the cached Comments
			toReturn = await Cache.get(parentValue.comments);
			// Get the Comments missing in the cache
			const toDownload = _.difference(parentValue.comments, _.map(toReturn, "id"));
			const toAppend = await Pikature.getComments(toDownload);
			toReturn = _.concat(toReturn, toAppend);

			// Add the new Comments to cache
			await Cache.set("id", toAppend);

			return _(toReturn).sortBy([a => new Date(a.dateCreated)]).reverse().value();
		},
		place: async (parentValue, args, { activeUser }) => {
			if (!parentValue.place) return;

			let toReturn = await Cache.get(parentValue.place);
			if (_.isEmpty(toReturn)) {
				toReturn = await Pikature.getPlace(parentValue.place).catch(error => { });
				await Cache.set("id", toReturn);
			}
			return toReturn;
		},
		guests: async (parentValue, args, { activeUser }) => {
			if (_.isEmpty(parentValue.guests)) return [];
			const options = { data: false };

			// Get cached Guests
			let toReturn = await Cache.get(parentValue.guests);
			// Get the Guest IDs that doesn't exist in cache
			const toDownload = _.difference(parentValue.guests, _.map(toReturn, "sub"));
			const toAppend = await Pikature.getUsers(toDownload);
			await Cache.set("sub", toAppend);

			// Append to the return value
			toReturn = _(toReturn).concat(toAppend).map(guest => Anonymizer.anonymizeUser(guest)).value();
			return toReturn;
		}
	},
	Image: {
		owner: async (parentValue, args, { activeUser }) => {

			// Get the cached photo
			let owner = await Cache.get(parentValue.owner);
			if (!owner) {
				owner = await Pikature.getUser(parentValue.owner);
				await Cache.set("sub", owner);
			}

			return Anonymizer.anonymizeUser(owner);
		}
	},
	Comment: {
		user: async (parentValue, args, { activeUser }) => {
			if (_.isEmpty(parentValue.user)) return;

			let toReturn = await Cache.get(parentValue.user);
			if (_.isEmpty(toReturn)) {
				toReturn = await Pikature.getUser(parentValue.user);
				await Cache.set("id", toReturn);
			}

			if (toReturn.id !== activeUser.sub) toReturn = Anonymizer.anonymizeUser(toReturn);
			return toReturn;
		}
	},
	Query: {
		user: async (parentValue, args, { activeUser }) => {
			let toReturn;
			if (_.isString(args.tag)) {
				toReturn = await Pikature.getUserByTag(args.tag);
			} else {
				toReturn = await Pikature.getUser(activeUser.sub);
			}

			if (_.isEmpty(toReturn)) throw new Error("User not found");
			if (toReturn.id !== activeUser.sub) toReturn = Anonymizer.anonymizeUser(toReturn);
			return toReturn;
		},
		posts: async (parentValue, args, { activeUser }) => {
			const options = { data: false };

			// Get all the posts' IDs to return
			const postIds = _(await Pikature.getPostsByUser(activeUser.sub, options)).concat(await Pikature.getPostsByGuest(activeUser.sub, options)).value();

			// Get the data from Cache using the Post IDs
			let toReturn = await Cache.get(postIds);

			// Download those that are missing from the cache
			const toDownload = _.difference(postIds, _.map(toReturn, "id"));

			// Cache the downloaded posts
			const toAppend = await Pikature.getPosts(toDownload);
			await Cache.set("id", toAppend);

			// Concat the final return value
			toReturn = _.concat(toReturn, toAppend);

			return _(toReturn)
				.sortBy([post => new Date(post.datePosted || post.dateCreated)])
				.reverse()
				.map(Anonymizer.anonymizePost)
				.value();
		},
		post: async (parentValue, args, { activeUser }) => {
			let post = await Cache.get(args.id);
			if (!post) {
				post = await Pikature.getPost(args.id);
				await Cache.set("id", post);
			}

			if (post.host !== activeUser.sub) {
				return Anonymizer.anonymizePost(post);
			}

			return post;
		},
		openInvites: async (parentValue, args, { activeUser }) => {
			const options = { data: false };

			// Get all the posts' IDs to return
			let postIds = await Pikature.getOpenInvites(args.ids, options);

			// Random limit of 50 posts on explore page that does not have range arguments
			// postIds = _(postIds).shuffle(postIds).slice(0, 100).value();

			// Get the data from Cache using the Post IDs
			let toReturn = await Cache.get(postIds);

			// Download those that are missing from the cache
			const toDownload = _.difference(postIds, _.map(toReturn, "id"));

			// Cache the downloaded posts
			const toAppend = await Pikature.getPosts(toDownload);
			await Cache.set("id", toAppend);

			// Concat the final return value
			toReturn = _.concat(toReturn, toAppend);

			return _(toReturn)
				.sortBy([post => new Date(post.datePosted || post.dateCreated)])
				.reverse()
				.map(Anonymizer.anonymizePost)
				.value();
		},
		openInviteMarkers: async (parentValue, args, { activeUser }) => {
			const { lat, lng, radius } = args;

			// Determine the user location to filter serach results
			// const user = await Pikature.getUser(activeUser.sub);
			// const geo = GeoIP.lookup(user.ip);

			// const { plus_code: { compound_code }} = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=country&key=AIzaSyBBcToE4P-S9EF2A6pS3Ey-4tGj9SRkN54`).then(res => res.json());
			// const [code, city, province, country] = compound_code.split(" ");
			// const geo = { code, city, province, country };
			return _.map(await Pikature.getOpenInvitesByLocation({ lat, lng, radius }), Anonymizer.anonymizePost);

			// return _(await Pikature.getOpenInvitesByLocation({ lat, lng }))
			// 	.sortBy([post => new Date(post.datePosted || post.dateCreated)])
			// 	.reverse()
			// 	.value();
		},
		places: async (parentValue, args, { activeUser }) => {
			// return await Pikature.getPlacesByLocation({ lat: args.lat, lng: args.lng, radius: args.radius || 0.0100 });

			let toReturn = [];

			// Get the cached to prevent over-search of the same place
			const fetchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${args.lat},${args.lng}&radius=500&type=park&key=AIzaSyBBcToE4P-S9EF2A6pS3Ey-4tGj9SRkN54`;
			const cachedPlaces = await Cache.get(fetchUrl);
			if (!_.isEmpty(cachedPlaces)) return cachedPlaces;

			console.log(`${new Date().toISOString()}: ${fetchUrl}`);
			const { results } = await fetch(fetchUrl).then(res => res.json());
			for (let place of results) {
				// Google Places redirects to a seperate URL for Place Photos
				// For each place photos, save its appropriate URL to the place to save (?)
				const photos = [];
				const toDownload = _.get(place, "photos[0].photo_reference");
				
				const placePhoto = toDownload && await fetch(`https://maps.googleapis.com/maps/api/place/photo?maxheight=400&photo_reference=${toDownload}&key=AIzaSyBBcToE4P-S9EF2A6pS3Ey-4tGj9SRkN54`);
				if (!_.isEmpty(placePhoto?.url)) photos.push(placePhoto.url);

				const toSave = new Place({ ...place, photos });
				//await Pikature.savePlace(toSave); // As per policy, we do not store Places to DB
				toReturn.push(toSave);
			}
			toReturn = _.sortBy(toReturn, place => _.isEmpty(place.photos));
			await Cache.set(fetchUrl, JSON.stringify(toReturn));
			return toReturn;
		},
		searchUsers: async (parentValue, args, { activeUser }) => {
			const toReturn = _.map(await Pikature.searchUsers(args.name), user => Anonymizer.anonymizeUser(user));
			return _.filter(toReturn, user => user.id !== activeUser.id);
		},
		comments: async (parentValue, args, { activeUser }) => {
			const options = { data: false };

			// GEt all the Comments' IDs using the parameterized Post ID
			const comments = await Pikature.getCommentsByPost(args.id, options);

			// Get the cached Comments
			let toReturn = await Cache.get(comments);
			// Download the comments not found in Cache
			const toDownload = _.difference(comments, _.map(toReturn, "id"));
			const toAppend = await Pikature.getComments(toDownload);
			await Cache.set("id", toAppend);
			toReturn = _.concat(toReturn, toAppend);

			return _(toReturn).sortBy([a => new Date(a.dateCreated)]).reverse().value();
		}
	},
	Mutation: {
		saveUser: async (parentValue, args, { activeUser }) => {
			const toEdit = await Pikature.getUser(activeUser.sub).catch(error => console.log(`${new Date().toISOString()}: ${JSON.stringify(activeUser, null, "\t")}`)) || {};
			const toSave = new User({
				// Immutable data
				...toEdit,
				...activeUser,
				termsAgreed: true,
				disabled: false, // Logging in back means they active their account again

				...activeUser.sub === "demo@pikachure-server.online" ? {
					// User customizable settings
					cover: !_.isNil(args.cover) ? args.cover : toEdit.cover,
					layout: 0,
					lat: 51.0551918,
					lng: -114.0711648,
					tag: "PikachureDemo",
					name: "Pikachure Demo"
				} : {
					// User customizable settings
					cover: !_.isNil(args.cover) ? args.cover : toEdit.cover,
					layout: _.isNumber(args.layout) ? args.layout : toEdit.layout,
					lat: args.lat || toEdit.lat || 51.0551918,
					lng: args.lng || toEdit.lng || -114.0711648,
					tag: `${_.split(`${args.tag || toEdit.tag || activeUser.name}`.trim().toLowerCase(), " ").join("")}`.substring(0, 15),
					name: args.name || toEdit.name || activeUser.name
				}
			});

			console.log(args.tag, toEdit.tag, activeUser.name);

			if (!_.isEmpty(args.file)) {
				const file = await args.file.file;
				const savedFile = await new Promise((resolve, reject) => {
					const { mimetype, createReadStream } = file;

					// Filename is overwritten for security stuff
					let { filename } = file;
					filename = `${uuidv4()}.${mimetype.split("/").pop()}`;
					const uri = path.join(__dirname, "../../public/", filename);
					const stream = createReadStream();
					stream.on("end", async () => {
						// Create Image file containing Pikature metadata such as file owner
						const fileToSave = new Image({
							...file,
							name: filename,
							type: mimetype,
							owner: activeUser.sub
						});

						const toReturn = await Pikature.savePhoto({ ...fileToSave, uri });

						// Delete temp file
						fs.unlink(uri, (err) => {
							if (err) reject(err);
						});

						resolve(toReturn);
					})
						.pipe(fs.createWriteStream(uri));
				});

				toSave.cover = savedFile.name;
			}

			const toCache = await Pikature.saveUser(toSave);
			await Cache.set("id", toCache);
			return toCache;
		},
		disableUser: async (parentValue, args, { activeUser }) => {
			if (activeUser.sub === "demo@pikachure-server.online") throw new Error("Cannot save as guest user");

			let toDisable = await Pikature.getUser(activeUser.sub);
			if (_.isEmpty(toDisable)) return new Error("User not found");

			toDisable = new User(toDisable);
			toDisable.disabled = true;

			const toReturn = await Pikature.saveUser(toDisable);
			await Cache.set("id", toReturn);
			return toReturn;
		},
		connectUser: async (parentValue, args, { activeUser }) => {
			const { tokenId } = args;

			// Get User object from token
			// https://stackoverflow.com/questions/52478069/node-fetch-disable-ssl-verification
			const httpsAgent = new https.Agent({ rejectUnauthorized: false });
			const newUser = await (await fetch(`https://pikachure-server.online/verifyToken?tokenId=${tokenId}`, { agent: httpsAgent })).json();
			if (_.isEmpty(newUser)) throw new Error("Invalid user to connect");

			// For each Posts, change the Host and Guest to the newly connected account
			let posts = await Pikature.getPostsByUser(activeUser.sub, { data: true });
			for (let post of posts) {
				post.host = newUser.sub;
				await Pikature.savePost(post);
				await Cache.set("id", post);
			}

			posts = await Pikature.getPostsByGuest(activeUser.sub, { data: true });
			for (let post of posts) {
				post.guests = [..._.filter(post.guests, guest => guest !== activeUser.sub), newUser.sub];
				post.guests = _(post.guests).filter(guest => guest !== post.host).uniq().value();
				await Pikature.savePost(post);
				await Cache.set("id", post);
			}

			// Do the same for Open Invites, Comments, and Files
			let openInvites = await Pikature.getOpenInvitesByUser(activeUser.sub, { data: true });
			for (let post of openInvites) {
				post.host = newUser.sub;
				await Pikature.savePost(post);
				await Cache.set("id", post);
			}

			openInvites = await Pikature.getOpenInvitesByGuest(activeUser.sub, { data: true });
			for (let post of openInvites) {
				post.guests = [..._.filter(post.guests, guest => guest !== activeUser.sub), newUser.sub];
				post.guests = _(post.guests).filter(guest => guest !== post.host).uniq().value();
				await Pikature.savePost(post);
				await Cache.set("id", post);
			}

			const comments = await Pikature.getCommentsByUser(activeUser.sub);
			for (let comment of comments) {
				comment.user = newUser.sub;
				await Pikature.saveComment(comment);
				await Cache.set("id", comment);
			}

			const files = await Pikature.getPhotosByOwner(activeUser.sub);
			for (let file of files) {
				file.owner = newUser.sub;
				await Pikature.savePhoto(file);
				await Cache.set("name", file);
			}

			return newUser;
		},
		savePost: async (parentValue, args, { activeUser }) => {
			if (activeUser.sub === "demo@pikachure-server.online") throw new Error("Cannot save as guest user");

			// Check if post already exist and if the active user has permission to edit
			let toEdit = {};
			if (args.id) {
				// Post cannot be changed by non-hosts
				toEdit = await Pikature.getPost(args.id);
				if (toEdit.host !== activeUser.sub) throw new Error("Only host can edit this post");

				// Only create Models from objects coming from the DB
				toEdit = new Post(toEdit);
			}

			// The incoming Post object gets overwritten by values from an immutable Post object and topped with geo data
			let toSave = {
				host: activeUser.sub,
				description: args.description,
				datePosted: !_.isUndefined(args.datePosted) ? args.datePosted : toEdit.datePosted, // Determines whether the post is public
				isVisible: args.isVisible
			};

			// Post owner transfer (WIP)
			//if(!_.isEmpty(args.host)) {
			//	const postEditor = await Pikature.getUser(args.host);
			//	if(_.isEmpty(postEditor)) throw new Error("User to transfer Post ownership to is not found");
			//	// Host transfer is only allowed between people who ave joined the post
			//	toSave.host = args.host;
			//}

			// Temporarily Disabled
			// Invited guests - If guests value is null or undefined, it means it's untouched. Otherwise, the array will represent the removed/added guests
			// toSave.guests = _.isArray(args.guests) ? args.guests : toEdit.guests;

			// Geo set by IP address
			// toSave.geo = GeoIP.lookup(_.first(`${activeUser.ip}`.match(regex)));
			const postHost = await Pikature.getUser(activeUser.sub);
			toSave.lat = args.lat || postHost.lat;
			toSave.lng = args.lng || postHost.lng;

			// Place ID - If `args.place` is undefined, it is untouched. If it is null, it has been erased. Otherwise, it is the ID of a Google Maps Place object
			if (!_.isUndefined(args.place)) {
				toSave.place = args.place; // Possibly null (Post was unmarked) or String (Post was assigned a place)	

				if (_.isString(args.place)) {
					// If the Place to save does not exist in DB yet, download it from Google Places API
					const fetchUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${args.place}&fields=place_id,name,geometry,opening_hours/open_now,photos/photo_reference&key=AIzaSyBBcToE4P-S9EF2A6pS3Ey-4tGj9SRkN54`;
					console.log(`${new Date().toISOString()}: ${fetchUrl}`);

					const place = await fetch(fetchUrl).then(res => res.json()).then(res => res.result).catch(error => console.error(error));
					if (!_.isEmpty(place)) {
						// Google Places redirects to a seperate URL for Place Photos
						// For each place photos, save its appropriate URL to the place to save (?)
						const photos = [];
						for (let photo of _.slice(place.photos, 0, 3)) {
							const fetchUrl = `https://maps.googleapis.com/maps/api/place/photo?maxheight=800&photo_reference=${photo.photo_reference}&key=AIzaSyBBcToE4P-S9EF2A6pS3Ey-4tGj9SRkN54`;
							console.log(`${new Date().toISOString()}: ${fetchUrl}`);

							const placePhoto = await fetch(fetchUrl);
							if (placePhoto.url) photos.push(placePhoto.url);
						}
						toSave.lat = place.geometry.location.lat;
						toSave.lng = place.geometry.location.lng;
						const toCache = new Place({ ...place, photos });
						await Cache.set("id", toCache);
						//await Pikature.savePlace(toCache); // As per policy, we do not store Places to DB
					}
				}
			}

			// Gallery recieves a [String] and not [Image] by GQL
			toSave.gallery = _.isArray(args.gallery) ? _.filter(toEdit.gallery, id => _.indexOf(args.gallery, id) >= 0) : toEdit.gallery; // Prevent adding new IDs in gallery by only filtering the original
			toSave.cover = _.isArray(args.cover) ? _.filter(toEdit.cover, id => _.indexOf(args.cover, id) >= 0) : toEdit.cover;

			// Parse the final object to save
			toSave = new Post({ ...toEdit, ...toSave });

			// For each of the gallery items, save them to Firestore DB before saving the profile
			args.files = _.isArray(args.files) ? _.slice(args.files, 0, 9 - _.size(toSave.gallery)) : [];
			const files = await Promise.all(_.map(args.files, "file"));
			const galleryPromises = _.map(files, file => new Promise((resolve, reject) => {
				const { mimetype, createReadStream } = file;

				// Filename is overwritten for security stuff
				let { filename } = file;
				filename = `${uuidv4()}.${mimetype.split("/").pop()}`;
				const uri = path.join(__dirname, "../../public/", filename);
				const stream = createReadStream();
				stream.on("end", async () => {
					// Create Image file containing Pikature metadata such as file owner
					const fileToSave = new Image({
						...file,
						name: filename,
						type: mimetype,
						owner: activeUser.sub
					});

					const toReturn = await Pikature.savePhoto({ ...fileToSave, uri })

					// Delete temp file
					fs.unlink(uri, (err) => {
						if (err) reject(err);
					});

					resolve(toReturn);
				})
					.pipe(fs.createWriteStream(uri));
			}));

			// Save filename (ID equivalent) to gallery
			const savedGalleryFiles = await Promise.all(galleryPromises);
			toSave.gallery = _.concat(toSave.gallery, _.map(savedGalleryFiles, "name"));

			// For each of the uploaded cover items, save them to Firestore DB before saving the profile
			args.coverFiles = _.isArray(args.coverFiles) ? _.slice(args.coverFiles, 0, 3 - _.size(toSave.cover)) : [];
			const coverPromises = _.map(await Promise.all(_.map(args.coverFiles, "promise")), file => new Promise((resolve, reject) => {
				const { mimetype, createReadStream } = file;

				// Filename is overwritten for security stuff
				let { filename } = file;
				filename = `${uuidv4()}.${mimetype.split("/").pop()}`;
				const uri = path.join(__dirname, "../../public/", filename);
				const stream = createReadStream();
				stream.on("end", async () => {
					// Create Image file containing Pikature metadata such as file owner
					const fileToSave = new Image({
						...file,
						name: filename,
						type: mimetype,
						owner: activeUser.sub
					});

					const toReturn = await Pikature.savePhoto({ ...fileToSave, uri })

					// Delete temp file
					fs.unlink(uri, (err) => {
						if (err) reject(err);
					});

					resolve(toReturn);
				})
					.pipe(fs.createWriteStream(uri));
			}));

			// Save filename (ID equivalent) to gallery
			const savedCoverFiles = await Promise.all(coverPromises);
			toSave.cover = _.concat(toSave.cover, _.map(savedCoverFiles, "name"));

			const toCache = await Pikature.savePost(toSave);
			await Cache.set("id", toCache);
			return Anonymizer.anonymizePost(toCache);
		},
		deletePost: async (parentValue, args, { activeUser }) => {
			if (activeUser.sub === "demo@pikachure-server.online") throw new Error("Cannot save as guest user");

			const toDelete = await Pikature.getPost(args.id);
			if (toDelete.host !== activeUser.sub) throw new Error("Permission denied");

			const toCache = await Pikature.deletePost(args.id);
			await Cache.del(toCache);
			return Anonymizer.anonymizePost(toCache);
		},
		savePostPhoto: async (parentValue, args, { activeUser }) => {
			if (activeUser.sub === "demo@pikachure-server.online") throw new Error("Cannot save as guest user");

			const toSave = new Post(await Pikature.getPost(args.id));

			// Prevent adding new IDs in gallery by only filtering the original
			if (_.isArray(args.gallery)) toSave.gallery = _.filter(toSave.gallery, id => _.indexOf(args.gallery, id) >= 0);

			// For each of the gallery items, save them to Firestore DB before saving the profile

			args.files = _.isArray(args.files) ? _.slice(args.files, 0, 9 - _.size(toSave.gallery)) : [];
			const galleryPromises = _.map(await Promise.all(_.map(args.files, "promise")), file => new Promise((resolve, reject) => {
				const { mimetype, createReadStream } = file;

				// Filename is overwritten for security stuff
				let { filename } = file;
				filename = `${uuidv4()}.${mimetype.split("/").pop()}`;
				const uri = path.join(__dirname, "../../public/", filename);
				const stream = createReadStream();
				stream.on("end", async () => {
					// Create Image file containing Pikature metadata such as file owner
					const fileToSave = new Image({
						...file,
						name: filename,
						type: mimetype,
						owner: activeUser.sub
					});

					const toReturn = await Pikature.savePhoto({ ...fileToSave, uri });

					// Delete temp file
					fs.unlink(uri, (err) => {
						if (err) reject(err);
					});

					resolve(toReturn);
				})
					.pipe(fs.createWriteStream(uri));
			}));

			// Save filename (ID equivalent) to gallery
			const savedFiles = await Promise.all(galleryPromises);
			toSave.gallery = _.concat(toSave.gallery, _.map(savedFiles, "name"));

			const toReturn = await Pikature.savePost(toSave);
			await Cache.set("id", toReturn);
			return Anonymizer.anonymizePost(toReturn);
		},
		saveComment: async (parentValue, args, { activeUser }) => {
			if (activeUser.sub === "demo@pikachure-server.online") throw new Error("Cannot save as guest user");

			// Check if activeUser is owner of the comment
			let toEdit = {};
			if (!_.isEmpty(args.id)) {
				toEdit = await Pikature.getComment(args.id);
				if (_.isEmpty(toEdit)) throw new Error("Comment to edit is not found");
				if (toEdit.user !== activeUser.sub) throw new Error("Permission denied");
			}

			// Check if post exists
			const post = await Pikature.getPost(args.post);
			if (_.isEmpty(post)) throw new Error("Post to comment to is not found");
			// if(_.indexOf([post.host, ...post.guests], activeUser.sub) < 0) throw new Error("Only joiners can add comments");

			// Hard set the user as the activeUser as the only people that can add and edit comments are the owners themselves
			const toSave = new Comment({
				...toEdit,
				description: args.description,
				user: activeUser.sub,
				dateCreated: toEdit.dateCreated,
				dateModified: new Date().toISOString()
			});

			// Save the comment
			const toReturn = await Pikature.saveComment(toSave);
			await Cache.set("id", toReturn);

			// Save the post the comment belongs to
			post.comments = !_.isEmpty(args.id) ? post.comments : _.concat(post.comments, toReturn.id); // Determines if the comment is new or edited
			const toCache = await Pikature.savePost(post);
			await Cache.set("id", toCache);
			return toReturn;
		},
		deleteComment: async (parentValue, args, { activeUser }) => {
			if (activeUser.sub === "demo@pikachure-server.online") throw new Error("Cannot save as guest user");

			if (_.isEmpty(args.id)) return;

			// Check if the activeUser owns the comment to delete
			const toDelete = await Pikature.getComment(args.id).catch(() => { });
			//if(_.isEmpty(toDelete)) throw new Error("Comment to delete is not found");
			if (_.isEmpty(toDelete)) return;
			if (toDelete.user !== activeUser.sub) throw new Error("Permission denied");

			// Delete the comment from the post it belongs to
			const post = await Pikature.getPost(args.post);
			if (_.isEmpty(post)) return;
			post.comments = _.filter(post.comments, comment => comment !== toDelete.id);
			const toCache = await Pikature.savePost(post);
			await Cache.set("id", toCache);

			//await Pikature.deleteComment(toDelete.id);
			return toDelete;
		},
		leavePost: async (parentValue, args, { activeUser }) => {
			if (activeUser.sub === "demo@pikachure-server.online") throw new Error("Cannot save as guest user");

			const toEdit = await Pikature.getPost(args.id);
			if (_.isEmpty(toEdit)) throw new Error("Post to be removed from is not found");

			// Remove the activeUser from the guest list
			const toSave = { id: toEdit.id };
			toSave.guests = _.filter(toEdit.guests, guestId => guestId !== activeUser.sub);

			// Remove all the photos uploaded by the user
			toSave.gallery = _.filter(await Pikature.getPhotos(toEdit.gallery), photo => photo.owner !== activeUser.sub);

			const toCache = await Pikature.savePost(toSave);
			await Cache.set("id", toCache);
			return Anonymizer.anonymizePost(toCache);
		},
		joinPost: async (parentValue, args, { activeUser }) => {
			if (activeUser.sub === "demo@pikachure-server.online") throw new Error("Cannot save as guest user");

			const toEdit = await Pikature.getPost(args.id);
			if (_.isEmpty(toEdit)) throw new Error("Post to be removed from is not found");

			// If the post is already posted, you cannot join anymore
			if(!_.isEmpty(toEdit.datePosted)) throw new Error("Users can only join open-invites");

			// Remove the activeUser from the guest list
			const toSave = { id: toEdit.id };
			toSave.guests = _(toEdit.guests).concat(activeUser.sub).uniq().value();

			const toCache = await Pikature.savePost(toSave);
			await Cache.set("id", toCache);
			return Anonymizer.anonymizePost(toCache);
		},
		sendFeedback: async (parentValue, args, { activeUser }) => {
			if (activeUser.sub === "demo@pikachure-server.online") throw new Error("Cannot save as guest user");

			const { value, description } = args || {};
			const toSave = new Feedback({
				user: activeUser.sub,
				value,
				description
			});

			const toReturn = await Pikature.saveFeedback(toSave);
			return toReturn;
		}
	}
};

class Anonymizer {
	static anonymizeUser(user) {
		const isAuthorized = !user.disabled;
		// This is only called in the DM query and since people consent to getting their name and email revealed before sending a message, this is okay
		return !isAuthorized ? {
			id: user.id,
			name: null,
			tag: null,
			picture: null,
			cover: null,
			posts: []
		} : {
			id: user.id,
			name: user.name,
			tag: user.tag,
			picture: user.picture,
			posts: user.posts,
			cover: user.cover
		};
	}

	static anonymizePost(post) {
		return post;
	}
};

class Utils {
	async streamFiles(files, callback) {
		// For each of the gallery items, save them to Firestore DB before saving the profile
		const toSavePromises = _.map(files, file => new Promise((resolve, reject) => {
			const { mimetype, createReadStream } = file;

			// Filename is overwritten for security stuff
			let { filename } = file;
			filename = `${uuidv4()}.${mimetype.split("/").pop()}`;
			const uri = path.join(__dirname, "../../public/", filename);
			const stream = createReadStream();
			stream.on("end", async () => {
				await callback(file)
				// Create Image file containing Pikature metadata such as file owner
				const fileToSave = new Image({
					...file,
					name: filename,
					type: mimetype,
					owner: activeUser.sub
				});

				const toReturn = await Pikature.savePhoto({ ...fileToSave, uri })

				// Delete temp file
				fs.unlink(uri, (err) => {
					if (err) reject(err);
				});

				resolve(toReturn);
			})
				.pipe(fs.createWriteStream(uri));
		}));

		// Save filename (ID equivalent) to gallery
		return await Promise.all(toSavePromises);
	}
}