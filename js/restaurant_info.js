let restaurant;
var newMap;
let starsvalue = 0;
let msg = "";

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1Ijoia2ltYW5pLW1idWd1YWgiLCJhIjoiY2prbzlqeWFoMjlmazNxcDBtZ281anY1MSJ9.bqyCVoJ4oFIccRmVuWH5-Q',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
  image.sizes = "(max-width: 320px) 300px, (max-width: 425px) 400px, (max-width: 635px) 600px, (min-width: 636px) 400px";
  const altText = restaurant.name + ' located in ' + restaurant.neighborhood;
  image.title = altText;
  image.alt = altText;


  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const restaurant_id = getParameterByName('id');
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  DBHelper.getReviews(restaurant_id);
}


fillReview = (review) => {
  const container = document.getElementById('reviews-container');
  if (!review) {
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));
  container.appendChild(ul);
}


/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  if(review.createdAt>0){
    const formattedTime = new Date(review.createdAt).toLocaleDateString("en-US")
    date.innerHTML = formattedTime;
  }else{date.innerHTML = review.createdAt;}
  
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


/**
 * Modal review form
 */ 
let modal = document.querySelector(".modal");
let trigger = document.querySelector(".trigger");
let closeButton = document.querySelector(".close-button");

function toggleModal() {
    modal.classList.toggle("show-modal");
}

function windowOnClick(event) {
    if (event.target === modal) {
        toggleModal();
    }
}

trigger.addEventListener("click", toggleModal);
closeButton.addEventListener("click", toggleModal);
window.addEventListener("click", windowOnClick);

/**
*Star Rating
*/
$(document).ready(function(){
  $('#stars li').on('mouseover', function(){
    let onStar = parseInt($(this).data('value'), 10); 

    $(this).parent().children('li.star').each(function(e){
      if (e < onStar) {
        $(this).addClass('hover');
      }
      else {
        $(this).removeClass('hover');
      }
    });
    
  }).on('mouseout', function(){
    $(this).parent().children('li.star').each(function(e){
      $(this).removeClass('hover');
    });
  });
  

  /**
  *Action to perform on click 
  */
  $('#stars li').on('click', function(){
    let onStar = parseInt($(this).data('value'), 10);
    let stars = $(this).parent().children('li.star');
    
    for (i = 0; i < stars.length; i++) {
      $(stars[i]).removeClass('selected');
    }
    
    for (i = 0; i < onStar; i++) {
      $(stars[i]).addClass('selected');
    }
    

    let ratingValue = parseInt($('#stars li.selected').last().data('value'), 10);
    
    if (ratingValue > 1) {
        msg = "Thanks! You rated us " + ratingValue + " stars.";
    }
    else {
        msg = "You rated us " + ratingValue + " star.";
    }

    starsvalue = ratingValue;
 
    
  });
  
  
});


function responseMessage(message, messageType) {
  $('.success-box').fadeIn(200); 
  if(messageType === 1){
    $('.success-box div.text-message').html("<span style='color:green;'>" + message + "</span>");
  }else{
    $('.success-box div.text-message').html("<span style='color:red;'>" + message + "</span>");
  }

}

function toggle(button)
{
  const id = getParameterByName('id');
  if(document.getElementById("like-btn").value=="Like"){
    DBHelper.markFavorite(id);
    document.getElementById("like-btn").value="Dislike";}

  else if(document.getElementById("like-btn").value=="Dislike"){
    DBHelper.unmarkFavorite(id);
   document.getElementById("like-btn").value="Like";}
}


/**
 * Submit modal review form
 */
document.getElementById('reviews-form').addEventListener('submit',(event)=>{
  event.preventDefault();
  if(starsvalue < 1){
    const starRatingErrorMsg = "Please provide a star rating";
    responseMessage(starRatingErrorMsg, -1);
  }else{
    const validForm = event.target;
    if (validForm.checkValidity()){
      const restaurant_id = getParameterByName('id');
      const name = document.querySelector('#name').value;
      const rating = starsvalue;
      const comments = document.querySelector('#review').value;

      //show a success message
      responseMessage(msg, 1);

      //try to post data into the database
      const review = {
        "restaurant_id": parseInt(restaurant_id),
        "name": name,
        "rating": parseInt(rating),
        "comments": comments
      } 

      DBHelper.postReview(review);
      fillReview(review);
    }
}
});


