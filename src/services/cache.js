import IORedis from "ioredis";
import _ from "lodash";

import Redis from IORedis();

// Encapsulate Redis so it's easy to switch out with alternatives
class Cache {
	async set(key, toCache) {
		if(_.isArray(toCache)) {
			let redisMulti = Redis.multi();

			for(let toSave of toCache) redisMulti.set(toSave[key], JSON.stringify(toSave));

			redisMulti.exec((error, results) => {
				if(error) console.error(error);
				//return results;
			});
		} else if(_.isObject(toCache) && toCache[key]) {
			await Redis.set(toCache[key], JSON.stringify(toCache));
		} else {
			await Redis.set(key, toCache);
		}
	}

	async get(args) {
		let toReturn;
		if(_.isArray(args)) {
			let redisMulti = Redis.multi();
			toReturn = [];

			for(let key of args) redisMulti.get(key);

			const results = await redisMulti.exec();
			for(let result of results) {
				const toPush = JSON.parse(result[1])
				if(toPush) toReturn.push(toPush);
			}
			
			//console.log("CACHE GET MULTI\n", { toReturn });

			return toReturn;
		} else {
			// Return undefined if there are is no cache
			toReturn = await Redis.get(args).catch(error => console.error(error));
			if(!_.isString(toReturn)) return;
			
			try {
				toReturn = JSON.parse(toReturn);
			} catch(error) {
				
			}
			
			//console.log("CACHE GET\n", toReturn);

			return toReturn;
		}
	}

	async del(key) {
		return Redis.del(key);
	}
}

module.exports = new Cache();