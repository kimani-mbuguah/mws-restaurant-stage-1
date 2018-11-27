/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL_REVIEWS() {
    const port = 1337; 
    return `http://localhost:${port}/reviews`;
  }

  static get DATABASE_URL() {
    const port = 1337 
    return `http://localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
	const dbPromise = idb.open("restaurant-reviews-app", 1, upgradeDB => {
		upgradeDB.createObjectStore("restaurants-db", { keyPath: "id" });
	});
	if (!navigator.serviceWorker.controller) {
		fetch(DBHelper.DATABASE_URL)
		.then(response => {
			const restaurants = response.json();
			return restaurants;
		})
		.then(restaurants => {
			restaurants.map(restaurant => {
				dbPromise.then(dbObj => {
					const tx = dbObj.transaction("restaurants-db", "readwrite");
					const restaurantStore = tx.objectStore("restaurants-db");
					restaurantStore.put(restaurant);
					});
					callback(null, restaurants)
				})
			}).catch(err =>{
				callback(err, null);	
			})
		}else{
			dbPromise.then(objs => {
				return objs.transaction("restaurants-db").objectStore("restaurants-db").getAll();
			})
			.then(restaurants => {
				callback(null, restaurants);
			});
		}
		/*
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json.restaurants;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
		xhr.send();
		*/
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/dest/${restaurant.id}-300.jpg`);
  }

   /**
   * Restaurant image Srcset.
   */
  static imageSrcsetForIndex(restaurant) {
    return (`/dest/${restaurant.id}-300.jpg 1x, /dest/${restaurant.id}-600_2x.jpg 2x`);
  }

  /**
   * Restaurant image Srcset.
   */
  static imageSrcsetForRestaurant(restaurant) {
    return (`/dest/${restaurant.id}-300.jpg 300w, /dest/${restaurant.id}-400.jpg 400w, /dest/${restaurant.id}-600_2x.jpg 600w, /dest/${restaurant.id}-800_2x.jpg 800w`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
/**
 * Post review form
 */

static postReview(id, name, rating, comments,date) {
  const url = DBHelper.DATABASE_URL_REVIEWS + "/?restaurant_id=" + id;
  console.log(url);
  const method = 'POST';

  const data = {
    restaurant_id: id,
    name: name,
    rating: rating,
    comments: comments,
    createdAt: date
  };
  const body = JSON.stringify(data);
  console.log(`postReview - url: ${url}, method: ${method}, body: ${body}`);

  DBHelper.cacheReview(id, body);
}

static cacheReview(id, body) {
    console.log(`cacheReview - id: ${id}, update: ${body}`);
    const dbPromise = idb.open("reviews-db", 1, upgradeDB => {
      upgradeDB.createObjectStore("reviews", { keyPath: "id" });
    });

    dbPromise.then(dbObj => {
      const tx = dbObj.transaction("reviews", "readwrite");
      const restaurantStore = tx.objectStore("reviews");
      restaurantStore.put({ id: Date.now(), restaurant_id: id, data: body });
    });
  }

}
 

