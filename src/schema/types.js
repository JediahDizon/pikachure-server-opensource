const { gql }= require("apollo-server");

const typeDefs = gql`
	scalar Upload
	scalar Long

	type Post {
		id: String
		host: User
		description: String
		cover: [Image]
		gallery: [Image]
		guests: [User]
		comments: [Comment]
		dateCreated: String
		dateModified: String
		datePosted: String
		isVisible: Boolean
		autoAccept: String
		byod: String
		place: Place
		lat: Float
		lng: Float
	}

	type User {
		id: String
		disabled: Boolean
		name: String
		picture: String
		email: String
		tag: String
		layout: Int
		posts: [Post]
		termsAgreed: Boolean
		lat: Float
		lng: Float
		cover: Image
	}

	type Place {
		id: String
		businessStatus: String
		geometry: String
		lat: Float
		lng: Float
		icon: String
		iconBackgroundColor: String
		iconMaskBaseUri: String
		name: String
		openNow: String
		photos: [String]
		placeId: String
		priceLevel: String
		rating: String
		reference: String
		scope: String
		types: [String]
		userRatinsTotal: Int
		vicinity: String
	}

	type PlacePhoto {
		width: String
		height: String
		htmlAttributions: [String]
		photoReference: String
	}

	# type Geo {
	# 	lng: Float
	# 	lat: Float
	# 	country: String
	# 	city: String
	# 	region: String
	# }

	type Image {
		id: String
		name: String
		owner: User
		dateCreated: String
		note: String
		exif: String
		size: String
		type: String
	}

	type Comment {
		id: String
		user: User
		description: String
		dateCreated: String
		dateModified: String
	}

	type Feedback {
		id: String
		user: User
		value: Int
		description: String
		dateCreated: String
	}

	type Query {
		user(tag: String): User
		posts(tags: [String]): [Post]
		post(id: String!): Post
		openInvites(ids: [String]): [Post]
		openInviteMarkers(lat: Float, lng: Float, radius: Float): [Post]
		places(lat: Float!, lng: Float!, radius: Float!): [Place]
		searchUsers(name: String): [User],
		comments(id: String!): [Comment]
	}

	type Mutation {
		saveUser(ip: String, city: String, state: String, country: String, lat: Float, lng: Float, layout: Int, tag: String, name: String, file: Upload, cover: String): User
		disableUser: User
		connectUser(tokenId: String!): User
		
		savePost(id: String, description: String, files: [Upload], gallery: [String], coverFiles: [Upload], cover: [String], guests: [String], lng: Float, lat: Float, place: String, country: String, city: String, region: String, datePosted: String, isVisible: Boolean, autoAccept: Boolean, byod: Boolean): Post
		savePostPhoto(id: String!, files: [Upload], gallery: [String]): Post
		leavePost(id: String!): Post
		joinPost(id: String!): Post

		deletePost(id: String!): Post
		saveComment(id: String, description: String!, post: String!): Comment
		deleteComment(id: String!, post: String!): Comment

		sendFeedback(value: Int, description: String): Feedback
	}
`;

module.exports = typeDefs;