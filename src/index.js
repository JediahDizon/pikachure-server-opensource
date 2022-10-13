const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { PubSub } = require("apollo-server");
const { graphqlUploadExpress } = require("graphql-upload");
const cors = require("cors");
const fetch = require("node-fetch");
const _ = require("lodash");

const { Pikature, Cache } = require("src/services");

function setupServer() {
	const { typeDefs, resolvers } = require("src/schema");
	const pubsub = new PubSub();
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		uploads: false,
		context: async context => {
			const { req, connection, payload } = context;
			let activeUser = {};
			if (connection || payload) {
				activeUser = await Pikature.verifyToken(connection.context.authorization.split("Bearer ")[1], connection.context.metadata);
				return { ...connection.context, activeUser, pubsub };
			}
			activeUser = await Pikature.verifyToken(req.headers.authorization.split("Bearer ")[1], req.headers.metadata);
			// activeUser.ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

			return { ...context, activeUser, pubsub };
		}
	});
	// server.listen().then(({ url }) => console.log(`server started at ${url}`));
	const app = express();
	app.use(
		cors({ origin: true }),
		graphqlUploadExpress({ maxFileSize: 50000000, maxFiles: 9 }),
		express.json()
	);

	app.get("/token", async (req, res) => {
		res.setHeader("Content-Type", "application/json");
		try {
			const tokenId = await Pikature.getToken();
			const toReturn = await Pikature.verifyToken(tokenId);
			res.status(200).json({ tokenId, ...toReturn });
		} catch (error) {
			res.status(500).send({ error: error.message + "Something went wrong. Try again in a few minutes." });
		}
	});

	// Used by the login page
	app.get("/verifyToken", async (req, res) => {
		const { tokenId } = req.query;
		res.setHeader("Content-Type", "application/json");
		try {
			const activeUser = await Pikature.verifyToken(tokenId);
			if (activeUser) res.json(activeUser);
		} catch (error) {
			res.status(401).send({ error: "Unauthorized token" });
		}
	});

	app.get("/", async (req, res) => {
		res.status(200).send("Pikachure");
	});

	app.get("/map", async (req, res) => {
		const { username, style_id, lng, lat, zoom, bearing, pitch, width, height } = req.query;
		const accessToken = "pk.eyJ1IjoiamVkaWFoZGl6b24iLCJhIjoiY2t6Mnpmd2ZuMDFyMjJ1bnk4ZWxwZDdpeCJ9.QS3FenAU9-wQzrQxJmcU3w";
		const fetchUrl = `https://api.mapbox.com/styles/v1/${username}/${style_id}/static/${lng},${lat},${zoom},${bearing},${pitch}/${width}x${height}@2x?access_token=${accessToken}`;

		// Fetch from Cache if exists
		const imageBase64 = await Cache.get(fetchUrl);
		_.isEmpty(imageBase64) && console.log(`${new Date().toISOString()}: ${fetchUrl}`);

		if (_.isEmpty(imageBase64)) {
			// Download the map tile
			const toSend = await fetch(fetchUrl).then(res => res.ok ? res.buffer() : new Error("MapBox download failed"));
			if (_.isError(toSend)) return res.status(401).send(toSend.message);
			res.status(200).send(toSend);

			// Cache the downloaded map
			const imageBase64 = toSend.toString("base64");
			await Cache.set(fetchUrl, imageBase64);
		} else {
			const toSend = Buffer.from(imageBase64, "base64");
			res.status(200).send(toSend);
		}
	});

	app.post("/error", async (req, res) => {
		const { error } = req.body;
		console.log(`${new Date().toISOString()}: error(${JSON.stringify({ ...req.body, error }, null, "\t")})`);

		res.status(200).send();
	});

	// Visitor logger
	// const logger = new Logger(path.join(__dirname, "log.csv"));
	// app.get("/", function (req, res, next) {
	// 	try {
	// 		const toSave = `${new Date().toISOString()},${req.headers["x-forwarded-for"] || req.socket.remoteAddress},${JSON.stringify(req.headers)}`;
	// 		logger.log(toSave);
	// 	} catch(error) {
	// 		console.error(error);
	// 	} finally {
	// 		next();
	// 	}
	// });

	// app.use("/", express.static("public"));

	server.applyMiddleware({ app });

	const PORT = process.env.PORT || 80;
	const HOST = process.env.HOST || "localhost";

	if (PORT === "443") {
		const httpsServer = https.createServer({
			key: fs.readFileSync(path.join(__dirname, "cert", "private.key")),
			// ca: fs.readFileSync(path.join(__dirname, "cert", "ca_bundle.crt")),
			cert: fs.readFileSync(path.join(__dirname, "cert", "certificate.crt")),
		}, app);
		server.installSubscriptionHandlers(httpsServer);

		httpsServer.listen(PORT, () => {
			console.log(`🚀 Server ready at https://${HOST}:${PORT}${server.graphqlPath}`)
			console.log(`🚀 Subscriptions ready at wss://${HOST}:${PORT}${server.subscriptionsPath}`)
		});
	} else {
		const httpServer = http.createServer(app);
		server.installSubscriptionHandlers(httpServer);

		httpServer.listen(PORT, () => {
			console.log(`🚀 Server ready at http://${HOST}:${PORT}${server.graphqlPath}`)
			console.log(`🚀 Subscriptions ready at ws://${HOST}:${PORT}${server.subscriptionsPath}`)
		});
	}
}

// LEZZ GO!
// setupPushNotifications();
setupServer();


async function toJWT(toSign) {
}