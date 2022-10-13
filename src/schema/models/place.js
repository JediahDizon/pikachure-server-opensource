const _ = require("lodash");
module.exports = class Place {
	constructor(args) {
		this.id = args.id || args.place_id;
		this.businessStatus = args.business_status;
		
		/* 
		{
			location {
				lat
				lng
			}
		*/
		this.geometry = `${args.geometry.location.lat},${args.geometry.location.lng}`;
		this.lat = args.geometry.location.lat;
		this.lng = args.geometry.location.lng;

		this.icon = args.icon;
		this.iconBackgroundColor = args.icon_background_color;
		this.iconMaskBaseUri = args.icon_mask_base_uri;
		this.name = args.name;
		
		/* { open_now } */
		this.openNow = args.opening_hours?.open_now; 

		/* 
		{
			height
			html_attributions
			photo_reference
			width
		}
		*/
		//this.photos = _.map(args.photos, photo => photo.photo_reference);
		this.photos = args.photos || [];

		this.placeId = args.place_id;
		this.priceLevel = args.price_level;
		this.rating = args.rating;
		this.reference = args.reference;
		this.scope = args.scope;
		this.types = args.types;
		this.userRatinsTotal = args.user_ratings_total;
		this.vicinity = args.vicinity;
	}

	// // All the shallow stringification of the object attributes from Google Maps API need to be converted to actual objects 
	// toShallowObject() {
	// 	return {
	// 		...this,
	// 		// photos: JSON.stringify(this.photos)
	// 	};
	// }
}