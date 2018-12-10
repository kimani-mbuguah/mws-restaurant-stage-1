/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */


  static idbStorage() {
    var dbPromise = idb.open('restaurant-reviews-app', 1, function(upgradeDb) {
      switch(upgradeDb.oldVersion){
        case 0:
          upgradeDb.createObjectStore('restaurants-db', { keyPath: 'id' });
        case 1:
          var reviews = upgradeDb.createObjectStore('restaurant-reviews', { keyPath: 'id' });
        case 2:
          var reviewsStorage = upgradeDb.transaction.objectStore('restaurant-reviews');
          reviewsStorage.createIndex('restaurant', 'restaurant_id');
        case 3:
          upgradeDb.createObjectStore('favorite-restaurants');
      }
    });
    return dbPromise;
  }
  
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    const dbPromise = DBHelper.idbStorage();
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
    
   DBHelper.fetchFavorite();
  }

  static fetchFavorite() {
    const query = "http://localhost:1337/restaurants/?is_favorite=true";
    const dbPromise = DBHelper.idbStorage();
    fetch(query).then((resp) => { 
          return resp.json();
        }).then((favoriteList) => {
          console.log(favoriteList);
          const dbPromise = DBHelper.idbStorage();
          dbPromise.then((db) => {
          const tx = db.transaction('favorite-restaurants', 'readwrite');
          const favoriteStorage = tx.objectStore('favorite-restaurants');
            favoriteList.forEach((favorite) => {
              console.log(favorite)
              favoriteStorage.put(favorite.id, 'key');
            });
            return tx.complete; 
          });
      }).catch((error) => {
        dbPromise.then((db) => {
        const tx = db.transaction('favorite-restaurants');
        const favoriteStorage = tx.objectStore('favorite-restaurants');
          return favoriteStorage.getAll();
        }).then((favoriteList) => {
            favoriteList.forEach((favorite) => {
              console.log(favorite);
            });
        }).catch((error) => {
          console.log(error);
          
        });
      });
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
   * get reviews
   */
  static getReviews(id) {
    const query = "http://localhost:1337/reviews/?restaurant_id="+id;
    fetch(query).then((resp) => { 
          return resp.json();
        }).then((reviewsList) => {
          const dbPromise = DBHelper.idbStorage();
          dbPromise.then((db) => {
          const tx = db.transaction('restaurant-reviews', 'readwrite');
          const reviewsStorage = tx.objectStore('restaurant-reviews');
            reviewsList.forEach((review) => {
              
              if (!review) {
                const noReviews = document.createElement('p');
                noReviews.innerHTML = 'No reviews yet!';
                container.appendChild(noReviews);
                return;
              }
              reviewsStorage.put(review);
              fillReview(review);
            });
            return tx.complete; 
          });
      }).catch((error) => {
        dbPromise.then((db) => {
        const tx = db.transaction('restaurant-reviews');
        const reviewsStorage = tx.objectStore('restaurant-reviews');
        const restaurantIndex = reviewsStorage.index('restaurant')
          return restaurantIndex.getAll(id);
        }).then((data_reviews) => {
            data_reviews.forEach((review) => {
              if (!review) {
                const noReviews = document.createElement('p');
                noReviews.innerHTML = 'No reviews yet!';
                container.appendChild(noReviews);
                return;
              }
              fillReview(review);
            });
        }).catch((error) => {
          console.log(error);
        });
      });
  }
/**
 * Post review form
 */

  static postReview(review) {
    const url = 'http://localhost:1337/reviews/';
    fetch(url, {
      method: 'post',
      headers: {"Content-type": "application/json; charset=UTF-8"},
      body:JSON.stringify(review)
    }).then((resp) => { 
      return resp.json();
    }).then((data) => {
      const dbPromise = DBHelper.idbStorage();
      dbPromise.then((db) => {
        const tx = db.transaction('restaurant-reviews','readwrite');
        const objectStore = tx.objectStore('restaurant-reviews');
        objectStore.put(data);
      }).then((data) => {
        console.log('Review posted')
      }).catch((error) => {
        console.log(error);
      });
      console.log(data);
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Mark favorite
   */
  static markFavorite(id){
    const query = `http://localhost:1337/restaurants/${id}/?is_favorite=true`;
    fetch(query, {
      method: 'post'
    }).then((response) => {
      const dbPromise = DBHelper.idbStorage();
      if (response.status === 200) {
          dbPromise.then((db) => {
          const tx = db.transaction('favorite-restaurants', 'readwrite');
          const objectStore = tx.objectStore('favorite-restaurants');
          objectStore.put(id, id);
          return tx.complete;
      });
      }
    }).catch((error) => {
      console.log(error);
    });

}

/**
 * Remove favorite
 */

static unmarkFavorite(id){
  const query = `http://localhost:1337/restaurants/${id}/?is_favorite=false`;
  fetch(query, {
    method: 'post'
  }).then((resp) => {
    console.log(resp);
    const dbPromise = DBHelper.idbStorage();
    dbPromise.then((db) => {
      const tx = db.transaction('favorite-restaurants', 'readwrite');
      const objectStore = tx.objectStore('favorite-restaurants');
      objectStore.delete(id);
      return tx.complete;
    })
  }).catch((error) => {
    console.log(error);
  });
}
/**
 * Check if the restaurant is marked as favorite 
 */
static isFavorite(restaurant){
  const dbPromise = DBHelper.idbStorage();
    dbPromise.then((db) => {
    const tx = db.transaction('favorite-restaurants');
    const objectStore = tx.objectStore('favorite-restaurants');
    return objectStore.getAll();
    }).then((favoriteList) => {
          if(favoriteList.indexOf(restaurant) != -1)
          console.log("restaurant exists in favorites")
          else
          console.log('not marked favorite yet');
      }).catch((error) => {
        console.log(error);
        
      });
}
 
}
